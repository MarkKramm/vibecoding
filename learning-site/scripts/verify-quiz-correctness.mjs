// Proves the quiz normalisation is CORRECT, not merely non-crashing.
//
// THE RISK THIS ADDRESSES
// The one piece of data adaptation in the app converts our authoring shape
//   { options: ["...", ...], answerIndex: 2, why: "..." }
// into the ported components' shape
//   { options: [{ text, correct }, ...], explanation: "..." }
//
// If that mapping were off by one, or attached `correct` to the wrong option, the
// quiz would still render, still be clickable, still report a summary, and still
// pass every structural check — while teaching the reader that a distractor is
// the right answer. That is the worst possible failure for a learning site, and
// it is invisible to a smoke test.
//
// THE METHOD
// Read the source of truth directly from the generated JSON (the real
// answerIndex), then drive the real UI: for one phase, click the option the
// SOURCE says is correct for every question, and assert the app reports a
// perfect score. Then click a deliberately wrong option and assert it does NOT.
//
// Run: node scripts/verify-quiz-correctness.mjs

import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const BROWSER = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].find(existsSync);

const PORT = 9666;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- Source of truth -------------------------------------------------------
const GEN = fileURLToPath(new URL("../src/data/generated/", import.meta.url));
const track = JSON.parse(readFileSync(join(GEN, "foundations.json"), "utf8"));
const phase = track.phases[0];
const truth = phase.quiz.map((q) => ({ id: q.id, answerIndex: q.answerIndex, n: q.options.length }));
console.log(`source of truth: ${phase.id}, ${truth.length} questions`);
for (const t of truth) console.log(`  ${t.id}: answerIndex=${t.answerIndex} of ${t.n}`);

const profile = mkdtempSync(join(tmpdir(), "vbquiz-"));
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

let failures = 0;
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
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
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

  await ev(`document.querySelector('.phase-card').click(); true;`);
  await sleep(3500);

  // Clear any answers saved from a previous run so the score is unambiguous.
  const cleared = await ev(
    `(() => {
       const b = [...document.querySelectorAll('.quiz button')].find(x => /start over|reset|try again/i.test(x.innerText));
       if (b) { b.click(); return true; }
       return false;
     })()`
  );
  await sleep(600);
  console.log(`\nreset previous answers: ${cleared}`);

  // How are the questions structured in the DOM? Read one to find out.
  const structure = await ev(
    `(() => {
       const groups = [...document.querySelectorAll('.quiz ul, .quiz ol')].filter(g => g.querySelector('button'));
       return { groups: groups.length,
                sample: groups.length ? groups[0].innerText.slice(0,200) : '',
                allButtons: document.querySelectorAll('.quiz button').length };
     })()`
  );
  console.log(`quiz DOM: ${structure.groups} option groups, ${structure.allButtons} buttons`);
  console.log(`sample:\n${structure.sample}\n`);

  // Click the option the SOURCE says is correct, for every question.
  const clickCorrect = `(() => {
      const groups = [...document.querySelectorAll('.quiz ul, .quiz ol')].filter(g => g.querySelector('button'));
      const idx = ${JSON.stringify(truth.map((t) => t.answerIndex))};
      let n = 0;
      groups.forEach((g, i) => {
        const btns = [...g.querySelectorAll('button')].filter(b => !/start over|reset|try again/i.test(b.innerText));
        const want = idx[i];
        if (btns[want]) { btns[want].click(); n++; }
      });
      return { groups: groups.length, clicked: n };
    })()`;
  const clickResult = await ev(clickCorrect);
  await sleep(1000);
  console.log(`clicked source-correct option in ${clickResult.clicked}/${clickResult.groups} groups`);

  const summary = await ev(`(document.querySelector('.quiz')||{}).innerText || ''`);
  const perfect = /Every answer correct/i.test(summary);
  const reported = (summary.match(/(\d+) of (\d+) answered/) || [])[0];
  const reviewNumbers = (summary.match(/questions? ([\d, ]+)/i) || [])[0];

  console.log(`\nsummary after clicking the SOURCE-CORRECT options:`);
  console.log(`  perfect: ${perfect}${reported ? "  (" + reported + ")" : ""}${reviewNumbers ? "  " + reviewNumbers : ""}`);

  if (perfect) {
    console.log("  PASS  the app marks the source's correct option as correct");
  } else {
    console.log("  FAIL  the app did NOT score a perfect run on the correct answers");
    console.log("        summary was: " + summary.replace(/\n/g, " | ").slice(0, 400));
    failures++;
  }

  // Now reset and deliberately answer WRONG on question 1 only.
  await ev(
    `(() => { const b=[...document.querySelectorAll('.quiz button')].find(x=>/start over|reset|try again/i.test(x.innerText)); if(b) b.click(); return true; })()`
  );
  await sleep(700);

  const wrongIdx = (truth[0].answerIndex + 1) % truth[0].n;
  const clickedWrong = await ev(
    `(() => {
       const groups = [...document.querySelectorAll('.quiz ul, .quiz ol')].filter(g => g.querySelector('button'));
       const btns = [...groups[0].querySelectorAll('button')].filter(b => !/start over|reset|try again/i.test(b.innerText));
       if (!btns[${wrongIdx}]) return false;
       btns[${wrongIdx}].click();
       return true;
     })()`
  );
  await sleep(800);
  const summary2 = await ev(`(document.querySelector('.quiz')||{}).innerText || ''`);
  // Answer the rest correctly so only Q1 is wrong.
  await ev(
    `(() => {
       const groups = [...document.querySelectorAll('.quiz ul, .quiz ol')].filter(g => g.querySelector('button'));
       const idx = ${JSON.stringify(truth.map((t) => t.answerIndex))};
       groups.forEach((g, i) => {
         if (i === 0) return;
         const btns = [...g.querySelectorAll('button')].filter(b => !/start over|reset|try again/i.test(b.innerText));
         if (btns[idx[i]]) btns[idx[i]].click();
       });
       return true;
     })()`
  );
  await sleep(1000);
  const summary3 = await ev(`(document.querySelector('.quiz')||{}).innerText || ''`);
  const flagsQ1 = /question 1\b/i.test(summary3);
  const claimsPerfect = /Every answer correct/i.test(summary3);

  console.log(`\nafter answering Q1 WRONG (option ${wrongIdx}) and the rest correctly:`);
  console.log(`  claims perfect: ${claimsPerfect}   flags question 1: ${flagsQ1}`);
  if (!claimsPerfect && flagsQ1) {
    console.log("  PASS  a wrong answer is detected and localised to question 1");
  } else {
    console.log("  FAIL  wrong answer not detected correctly");
    console.log("        summary: " + summary3.replace(/\n/g, " | ").slice(0, 400));
    failures++;
  }

  ws.close();
} finally {
  child.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {}
}

console.log(failures ? `\n${failures} FAILURE(S)` : "\nquiz normalisation verified correct");
process.exit(failures ? 1 : 0);
