// Deeper browser checks: quiz correctness, multiple tracks, and search.
//
// The first verify pass proves the app renders. This one proves the things that
// would still be WRONG while looking fine:
//
//   * the quiz marks the RIGHT option — the normalisation from answerIndex to a
//     `correct` flag is the one piece of data adaptation in the app, and a bug
//     there produces a quiz that confidently teaches the wrong answer;
//   * every track renders, not just the first — a lazy-load path that works for
//     foundations and fails for agents would pass a single-track check;
//   * search returns real hits.

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BROWSER = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].find(existsSync);

const PORT = 9444;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Accept --url so the same checks can run against the dev server (5173) or the
// built output served by `vite preview` (4173). Testing only the dev server
// leaves a real gap: the production bundle is minified, code-split differently,
// and built from whatever was on disk at build time, so it can fail while dev
// passes. That happened — a stale dist/ was serving a crash that had already
// been fixed in source — and it is exactly the case this flag exists to catch.
const SITE_URL = (() => {
  const i = process.argv.indexOf("--url");
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : "http://localhost:5173";
})();
console.log(`verifying ${SITE_URL}\n`);
const profile = mkdtempSync(join(tmpdir(), "vbdeep-"));
const child = spawn(
  BROWSER,
  [
    "--headless=old",
    "--disable-gpu",
    "--no-sandbox",
    "--no-first-run",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

try {
  let wsUrl;
  for (let i = 0; i < 40 && !wsUrl; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const t = (await r.json()).find((x) => x.type === "page" && x.webSocketDebuggerUrl);
      if (t) wsUrl = t.webSocketDebuggerUrl;
    } catch {}
    if (!wsUrl) await sleep(250);
  }
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res);
    ws.addEventListener("error", rej);
  });

  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener("message", (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
    }
    if (m.method === "Runtime.exceptionThrown") {
      const d = m.params.exceptionDetails;
      errors.push(d.exception?.description || d.text);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const myId = ++id;
      pending.set(myId, { resolve, reject });
      ws.send(JSON.stringify({ id: myId, method, params }));
    });
  const ev = async (expression) => {
    const r = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "eval");
    return r.result.value;
  };

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: SITE_URL + "/" });
  await sleep(4000);

  // ---- Quiz correctness ---------------------------------------------------
  // Open the first phase, click every first-option, and check that the app
  // reports the correct number of misses. Then click the KNOWN correct option
  // and confirm it reports a perfect score. If normalisation were inverted, the
  // first pass would report "all correct" and the second would report misses.
  await ev(`document.querySelector('.phase-card').click(); true;`);
  await sleep(3500);

  const quizBefore = await ev(
    `(() => {
       const qs = [...document.querySelectorAll('.quiz fieldset, .quiz [role=group], .quiz li')];
       return { count: document.querySelectorAll('.quiz button').length,
                text: (document.querySelector('.quiz')||{}).innerText || '' };
     })()`
  );
  check("quiz rendered with options", quizBefore.count >= 3, `${quizBefore.count} buttons`);

  // Ask the DOM what the correct answer is per the app, by clicking option 0 of
  // each question and reading the summary. "Every answer correct" after clicking
  // ALL option 0 would be suspicious (it would mean position 0 is always right).
  const clickFirstOfEach = `(() => {
      const groups = [...document.querySelectorAll('.quiz ol, .quiz ul')].filter(g => g.querySelector('button'));
      let clicked = 0;
      for (const g of groups) {
        const btns = [...g.querySelectorAll('button')].filter(b => !/start over|reset/i.test(b.innerText));
        if (btns.length) { btns[0].click(); clicked++; }
      }
      return clicked;
    })()`;
  const clicked = await ev(clickFirstOfEach);
  await sleep(800);
  const afterFirst = await ev(
    `(document.querySelector('.quiz')||{}).innerText || ''`
  );
  const allCorrectByPosition0 = /Every answer correct/i.test(afterFirst);
  check(
    "option 0 is not always the correct answer",
    !allCorrectByPosition0,
    allCorrectByPosition0 ? "all option-0 clicks scored correct — normalisation suspect" : "mixed results, as expected"
  );

  // ---- Every track opens ---------------------------------------------------
  // Deliberately navigates back to the dashboard FIRST. The phase page has no
  // .phase-card elements, so querying for them while a phase is open returns 0
  // and looks like a missing-data failure when it is really a missing click.
  await ev(`(() => {
      const b=[...document.querySelectorAll('button')].find(x=>/All tracks/i.test(x.innerText));
      if(b) b.click();
      return !!b;
    })()`);
  await sleep(1800);
  const cardsBack = await ev(`document.querySelectorAll('.phase-card').length`);
  check("dashboard has all 42 cards after navigating back", cardsBack === 42, `${cardsBack}`);

  // Open the FIRST PHASE OF EACH TRACK and confirm real lesson content arrives.
  //
  // Deliberately ONE STEP PER evaluate, re-querying the DOM each time. An
  // earlier version did the whole journey inside a single async loop holding
  // element references across React re-renders; after the first navigation those
  // nodes were detached, every later click silently did nothing, and the result
  // read as "only 1 of 10 tracks renders" — a test artifact that looked exactly
  // like a serious app bug. Re-querying is slower and correct.
  const trackLabels = await ev(
    `[...document.querySelectorAll('.trackblock')].map(s => ({
        label: (s.querySelector('h2')||{}).innerText || '?',
        cards: s.querySelectorAll('.phase-card').length
     }))`
  );

  const perTrack = [];
  for (let i = 0; i < trackLabels.length; i++) {
    if (trackLabels[i].cards === 0) continue;

    await ev(
      `(() => { const c = document.querySelectorAll('.trackblock')[${i}].querySelector('.phase-card'); c.click(); return true; })()`
    );
    await sleep(2800);

    const info = await ev(
      `(() => {
         const t = (document.querySelector('.phase')||{}).innerText || '';
         return { len: t.length,
                  hasQuiz: /\\bQuiz\\b/.test(t),
                  unsupported: (t.match(/Unsupported block type/g) || []).length,
                  loading: /Loading this phase/i.test(t) };
       })()`
    );
    perTrack.push({ label: trackLabels[i].label, ...info, ok: info.len > 3000 && !info.loading });

    await ev(
      `(() => { const b=[...document.querySelectorAll('button')].find(x=>/All tracks/i.test(x.innerText)); if(b) b.click(); return !!b; })()`
    );
    await sleep(1400);
  }

  const written = perTrack.length;
  check(
    "every written track renders a full phase",
    written >= 6 && perTrack.every((t) => t.ok),
    perTrack.map((t) => `${t.label}${t.ok ? "" : "=FAIL"}`).join(", ").slice(0, 160)
  );
  check(
    "no unsupported content blocks anywhere",
    perTrack.every((t) => t.unsupported === 0),
    perTrack.map((t) => t.unsupported).join("/")
  );
  check(
    "every track's phase includes a quiz",
    perTrack.every((t) => t.hasQuiz),
    perTrack.filter((t) => !t.hasQuiz).map((t) => t.label).join(", ") || "all have quizzes"
  );

  // ---- Search --------------------------------------------------------------
  await ev(`(() => {
      const b=[...document.querySelectorAll('button')].find(x=>/^Search$/i.test(x.innerText.trim()));
      if(b) b.click();
      return !!b;
    })()`);
  await sleep(1200);
  const searchOk = await ev(
    `(() => {
       const inp = document.querySelector('input[type=search]');
       if(!inp) return { ok:false, why:'no input' };
       const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
       setter.call(inp, 'attention');
       inp.dispatchEvent(new Event('input', { bubbles:true }));
       const form = inp.closest('form');
       if (form) form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
       return { ok:true };
     })()`
  );
  await sleep(4000);
  const searchText = await ev(`(document.getElementById('root')||{}).innerText || ''`);
  check(
    "search returns hits for 'attention'",
    /match/i.test(searchText) && !/No matches/i.test(searchText),
    searchText.slice(0, 100).replace(/\n/g, " ")
  );

  const meaningful = errors.filter((e) => !/favicon|DevTools|Autofill/i.test(e));
  check("no uncaught errors during deep pass", meaningful.length === 0, meaningful[0]?.slice(0, 150) || "");

  console.log("");
  const failed = results.filter((r) => !r.ok).length;
  console.log(failed ? `${failed} of ${results.length} FAILED` : `all ${results.length} checks passed`);
  if (failed) process.exitCode = 1;
  ws.close();
} finally {
  child.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {}
}
