// Diagnose whether cross-track navigation is a REAL bug or a test artifact.
//
// The batch test clicks a card, waits, then clicks "All tracks", in one long
// async loop inside a single evaluate. If React re-renders while the loop holds
// stale element references, every click after the first finds a detached node
// and does nothing — which looks exactly like "only the first track works".
//
// So this does the same journey ONE STEP PER evaluate, re-querying the DOM each
// time, and reports what is actually on screen. If that succeeds, the batch test
// was at fault; if it fails, the app is.

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BROWSER = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].find(existsSync);

const PORT = 9555;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), "vbsteps-"));
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
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
    }
    if (m.method === "Runtime.exceptionThrown") {
      errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const myId = ++id;
      pending.set(myId, { resolve, reject });
      ws.send(JSON.stringify({ id: myId, method, params }));
    });
  const ev = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "eval");
    return r.result.value;
  };

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: "http://localhost:5173/" });
  await sleep(4000);

  // How many phase cards exist per track section?
  const cardCounts = await ev(
    `[...document.querySelectorAll('.trackblock')].map(s => ({
        label: (s.querySelector('h2')||{}).innerText || '?',
        cards: s.querySelectorAll('.phase-card').length
     }))`
  );
  console.log("cards per track section:");
  for (const c of cardCounts) console.log(`  ${c.label}: ${c.cards}`);

  console.log("\nopening the first phase of each track, one step per evaluate:\n");
  let pass = 0;
  let fail = 0;
  for (let i = 0; i < cardCounts.length; i++) {
    if (cardCounts[i].cards === 0) {
      console.log(`  SKIP  ${cardCounts[i].label} (no phases written yet)`);
      continue;
    }
    // Click the i-th section's first card, re-querying every time.
    const clicked = await ev(
      `(() => {
         const sec = document.querySelectorAll('.trackblock')[${i}];
         if (!sec) return { ok:false, why:'no section' };
         const card = sec.querySelector('.phase-card');
         if (!card) return { ok:false, why:'no card' };
         card.click();
         return { ok:true };
       })()`
    );
    await sleep(3000);

    const info = await ev(
      `(() => {
         const p = document.querySelector('.phase');
         const t = p ? p.innerText : '';
         return { len: t.length,
                  title: (document.querySelector('.phase h1')||{}).innerText || '',
                  hasQuiz: /\\bQuiz\\b/.test(t),
                  unsupported: (t.match(/Unsupported block type/g) || []).length,
                  loading: /Loading this phase/i.test(t) };
       })()`
    );

    const ok = info.len > 3000 && !info.loading;
    console.log(
      `  ${ok ? "OK  " : "FAIL"}  ${cardCounts[i].label.padEnd(22)} ` +
        `chars=${String(info.len).padStart(6)} quiz=${info.hasQuiz ? "y" : "n"} ` +
        `unsupported=${info.unsupported}  "${info.title.slice(0, 40)}"`
    );
    if (ok) pass++;
    else fail++;

    // Back to the dashboard, re-queried each time.
    await ev(
      `(() => { const b=[...document.querySelectorAll('button')].find(x=>/All tracks/i.test(x.innerText)); if(b) b.click(); return !!b; })()`
    );
    await sleep(1600);
  }

  console.log(`\n${pass} track(s) rendered a full phase, ${fail} failed`);
  const meaningful = errors.filter((e) => !/favicon|DevTools|Autofill/i.test(e));
  if (meaningful.length) {
    console.log(`\nuncaught errors (${meaningful.length}):`);
    for (const e of meaningful.slice(0, 5)) console.log("  " + e.slice(0, 300));
  }
  process.exitCode = fail ? 1 : 0;
  ws.close();
} finally {
  child.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {}
}
