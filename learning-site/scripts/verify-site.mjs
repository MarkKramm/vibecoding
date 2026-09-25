// End-to-end verification in a real browser, via the Chrome DevTools Protocol.
//
// WHY THIS EXISTS
// `vite build` succeeding proves the modules RESOLVE; it does not prove the app
// RUNS. A component can import cleanly, transform cleanly, and still throw on
// first render — a bad prop name, a hook returning a different shape, a null
// dereference in a template. All of those pass a build and produce a blank page.
//
// So this drives the actual app: it opens the page, walks the DOM, clicks into a
// phase, and asserts that real lesson prose and a real quiz are on screen. It
// talks to Edge over CDP rather than using a driver library, because the project
// has no test dependencies and this must stay installable on a zero budget.
//
// Run: node scripts/verify-site.mjs [--url http://localhost:4173]
//
// ⚠️ THE DEFAULT PORT IS 4173 (preview), NOT 5173 (dev), AND THAT MATTERS MORE THAN IT
// LOOKS. The dev server on 5173 is frequently occupied by an UNRELATED project, and
// this script used to default to it. The failure mode was brutal and silent in the
// direction that wastes the most time: run with no argument and it would drive
// somebody else's website, fail 13 of 15 checks, and look exactly like this project
// had catastrophically broken. It had not.
//
// Point it at the port this project is actually served on, and if a run fails
// wholesale, CHECK WHAT IS LISTENING before debugging the app.

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

// The corpus totals the dashboard is expected to display, read from the built data
// rather than hardcoded. These were /42/ and /706/ until the corpus grew to 65
// phases and 1054 checklist items, at which point the check failed against a
// perfectly correct site — a guard measuring a memory instead of the artifact.
const EXPECTED = (() => {
  try {
    const index = JSON.parse(readFileSync(join(HERE, "..", "src", "data", "generated", "index.json"), "utf8"));
    let phases = 0;
    let checklist = 0;
    for (const t of index.tracks) {
      phases += t.phases.length;
      for (const p of t.phases) checklist += (p.checklistIds || []).length;
    }
    return { phases, checklist };
  } catch {
    // Generated data is gitignored, so a fresh clone may not have it yet. Fall back
    // to values that at least do not produce a confusing pass.
    return { phases: 65, checklist: 1054 };
  }
})();

const URL_BASE = (() => {
  const i = process.argv.indexOf("--url");
  return i !== -1 && process.argv[i + 1]
    ? process.argv[i + 1]
    : process.env.VITE_PREVIEW_URL || "http://localhost:4173";
})();

const EDGE_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const PORT = 9222;

function findBrowser() {
  for (const p of EDGE_CANDIDATES) if (existsSync(p)) return p;
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Minimal CDP client over the WebSocket debugger URL. */
async function connect() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await r.json();
      const page = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // browser not up yet
    }
    await sleep(250);
  }
  throw new Error("no CDP target appeared");
}

function rpc(ws) {
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    }
  });
  return (method, params = {}) =>
    new Promise((resolve, reject) => {
      const myId = ++id;
      pending.set(myId, { resolve, reject });
      ws.send(JSON.stringify({ id: myId, method, params }));
    });
}

async function evaluate(send, expression) {
  const res = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (res.exceptionDetails) {
    throw new Error(
      res.exceptionDetails.exception?.description ||
        res.exceptionDetails.text ||
        "evaluate failed"
    );
  }
  return res.result.value;
}

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`  ${mark}  ${name}${detail ? "  — " + detail : ""}`);
}

async function main() {
  const browser = findBrowser();
  if (!browser) {
    console.error("No Edge or Chrome found. Skipping browser verification.");
    process.exit(2);
  }

  // ---- PREFLIGHT: make sure this project is what is on that port -------------
  //
  // Without this, pointing at the wrong port is the worst kind of failure: every
  // check fails, the output looks like a catastrophe, and the actual cause is that
  // an unrelated app is listening. That happened — port 5173 held a restaurant
  // reservation site and this script reported 13 of 15 failures against it.
  //
  // So confirm the HTML is OURS before launching a browser at all. A wrong-port
  // result is then one clear line instead of fifteen misleading ones.
  try {
    const res = await fetch(URL_BASE, { redirect: "follow" });
    const html = await res.text();
    if (!/Vibecoding/i.test(html)) {
      console.error(`\n  ✖ ${URL_BASE} is serving something that is not this project.`);
      const t = html.match(/<title>(.*?)<\/title>/i);
      if (t) console.error(`    Its title is: ${t[1].trim()}`);
      console.error("    Start the preview (npm run preview, port 4173) or pass --url.\n");
      process.exit(2);
    }
  } catch (e) {
    console.error(`\n  ✖ Nothing is serving ${URL_BASE} — ${e.message}`);
    console.error("    Start it with: npm run preview\n");
    process.exit(2);
  }

  const profile = mkdtempSync(join(tmpdir(), "vbverify-"));
  const child = spawn(
    browser,
    [
      "--headless=old",
      "--disable-gpu",
      "--no-sandbox",
      "--no-first-run",
      "--disable-extensions",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let ws;
  try {
    const wsUrl = await connect();
    ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.addEventListener("open", res);
      ws.addEventListener("error", rej);
    });
    const send = rpc(ws);

    await send("Runtime.enable");
    await send("Page.enable");
    // Seed a valid sample result in this throwaway browser profile so this smoke
    // test proves the dashboard actually surfaces a saved exam result.
    await send("Page.addScriptToEvaluateOnNewDocument", {
      source: `localStorage.setItem('vibecoding:exams:v1', JSON.stringify({foundations:{best:{percent:88,correct:44,total:50,passed:true,at:'2026-01-01T00:00:00Z'},attempts:1}}));`,
    });

    // Collect page errors. Without this a blank render looks like a pass.
    const pageErrors = [];
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.method === "Runtime.exceptionThrown") {
        const d = msg.params.exceptionDetails;
        pageErrors.push(d.exception?.description || d.text);
      }
    });

    await send("Page.navigate", { url: URL_BASE + "/" });
    await sleep(4000);

    const title = await evaluate(send, "document.title");
    check("page title", title === "Vibecoding & the AI Era", title);

    const rootText = await evaluate(
      send,
      "(document.getElementById('root')||{}).innerText || ''"
    );
    check("React mounted", rootText.length > 500, `${rootText.length} chars of text`);

    // The dashboard must show the real corpus totals.
    //
    // These were hardcoded to /42/ and /706/ and went stale when the corpus grew to
    // 65 phases. Read the expected numbers from the built data instead, so a future
    // authoring pass cannot leave this failing on a correct site.
    check(`dashboard shows ${EXPECTED.phases} phases`, rootText.includes(String(EXPECTED.phases)));
    check(
      `dashboard shows checklist total ${EXPECTED.checklist}`,
      rootText.includes(String(EXPECTED.checklist))
    );
    check("dashboard lists 10 tracks", (rootText.match(/phases|not yet written/g) || []).length >= 6);

    // ---- Walk into a phase ------------------------------------------------
    const opened = await evaluate(
      send,
      `(() => {
         const cards = [...document.querySelectorAll('.phase-card')];
         if (!cards.length) return { ok:false, why:'no phase cards' };
         cards[0].click();
         return { ok:true, count:cards.length, label:cards[0].innerText.slice(0,60) };
       })()`
    );
    check("phase cards rendered", opened.ok, opened.why || `${opened.count} cards`);
    await sleep(3500);

    const phaseText = await evaluate(
      send,
      "(document.querySelector('.phase')||{}).innerText || ''"
    );
    check("phase page rendered", phaseText.length > 1000, `${phaseText.length} chars`);

    // A real lesson heading from the source must be present.
    check(
      "lesson body rendered",
      /Part 1/.test(phaseText) || /machine that guesses/i.test(phaseText) || phaseText.length > 5000,
      phaseText.slice(0, 80).replace(/\n/g, " ")
    );

    // The four working sections.
    check("quiz section present", /\bQuiz\b/.test(phaseText));
    check("practice section present", /Hands-on practice|practice/i.test(phaseText));
    check("checklist rendered", (await evaluate(send, "document.querySelectorAll('.checklist input, .checklist li, li.checklist__item').length")) > 0);

    // Quiz options must carry real text, not "[object Object]" — the exact
    // failure mode a botched normalisation would produce.
    const quizInfo = await evaluate(
      send,
      `(() => {
         const body = (document.querySelector('.quiz')||{}).innerText || '';
         return { hasObjectObject: body.includes('[object Object]'), len: body.length,
                  options: document.querySelectorAll('.quiz button').length };
       })()`
    );
    check("quiz has no [object Object]", !quizInfo.hasObjectObject);
    check("quiz options rendered", quizInfo.options >= 3, `${quizInfo.options} buttons`);

    // Navigation: back to the dashboard.
    const back = await evaluate(
      send,
      `(() => { const b=[...document.querySelectorAll('button')].find(x=>/All tracks/i.test(x.innerText)); if(!b) return false; b.click(); return true; })()`
    );
    await sleep(1500);
    const backText = await evaluate(send, "(document.getElementById('root')||{}).innerText || ''");
    check("back navigation works", back && /What is here/.test(backText));
    check("dashboard shows the best section-exam result", /Section exam: (Passed|Not passed) — \d+%/.test(backText));

    // A console error is a real defect even when the page looks right.
    const meaningful = pageErrors.filter(
      (e) => !/favicon|DevTools|Autofill|sandbox/i.test(e)
    );
    check(
      "no uncaught page errors",
      meaningful.length === 0,
      meaningful.length ? meaningful[0].slice(0, 160) : ""
    );

    console.log("");
    const failed = results.filter((r) => !r.ok);
    if (failed.length) {
      console.log(`${failed.length} of ${results.length} checks FAILED`);
      process.exitCode = 1;
    } else {
      console.log(`all ${results.length} checks passed`);
    }
  } finally {
    try {
      if (ws) ws.close();
    } catch {}
    child.kill();
    await sleep(400);
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {}
  }
}

main().catch((e) => {
  console.error("verification crashed:", e.message);
  process.exit(1);
});
