/**
 * Browser check for the Finetuning track.
 *
 * Verifies against a real browser that the 6 new phases render — not just that
 * the build produced files. The project learned this the hard way: `vite build`
 * once passed while every phase page threw (React #31), because no build check
 * knows what the components expect.
 *
 * Uses Edge (Chromium) over CDP with Node's built-in WebSocket and fetch, so
 * there are no test dependencies to install.
 *
 *   node scripts/check-browser.mjs [baseUrl]
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = process.argv[2] || process.env.VITE_PREVIEW_URL || 'http://localhost:4173';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9333;

const problems = [];
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => { problems.push(m); console.log(`  ✖ ${m}`); };

// --- start a headless browser with a CDP endpoint -------------------------
const proc = spawn(EDGE, [
  '--headless=old',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=' + process.env.TEMP + '\\vb-cdp-profile',
  'about:blank',
], { stdio: 'ignore' });

async function cdpTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      const page = list.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error('CDP endpoint never came up');
}

const wsUrl = await cdpTarget();
const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => {
  ws.addEventListener('open', res, { once: true });
  ws.addEventListener('error', rej, { once: true });
});

let msgId = 0;
const pending = new Map();
const consoleErrors = [];

ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    const d = msg.params.exceptionDetails;
    consoleErrors.push(d.exception?.description || d.text || 'exception');
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
  }
});

function send(method, params = {}) {
  const id = ++msgId;
  return new Promise((res) => {
    pending.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

await send('Runtime.enable');
await send('Page.enable');

async function goto(url) {
  await send('Page.navigate', { url });
  await sleep(1400);
}

async function evalJs(expression) {
  const r = await send('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true,
  });
  return r.result?.result?.value;
}

// --- 1. the app boots at all ---------------------------------------------
console.log('\n1. App shell');
await goto(BASE);
const mounted = await evalJs(`!!document.querySelector('#root')?.children.length`);
if (mounted) ok('app mounted (#root has children)');
else bad('app did not mount — #root is empty');

const bodyText = await evalJs('document.body.innerText') || '';
if (bodyText.length > 100) ok(`page rendered ${bodyText.length} chars of text`);
else bad(`page rendered only ${bodyText.length} chars`);

// --- 2. navigate to the Finetuning track ---------------------------------
console.log('\n2. Finetuning track reachable');
const hasFt = bodyText.includes('Finetuning') || bodyText.includes('Fine-tuning');
if (hasFt) ok('Finetuning appears in the track list');
else bad('Finetuning not found on the landing page');

// --- 3. click into Finetuning and check the 6 phases ---------------------
console.log('\n3. All 6 phases listed');
const clicked = await evalJs(`
  (() => {
    const els = [...document.querySelectorAll('a, button, [role=button], li, div')];
    const t = els.find(e => /Fine-?tuning/i.test(e.textContent || '') && e.textContent.length < 400);
    if (!t) return false;
    t.click();
    return true;
  })()
`);
await sleep(1200);
if (clicked) ok('clicked into the Finetuning track');
else bad('could not find a clickable Finetuning entry');

const trackText = await evalJs('document.body.innerText') || '';
const titles = [
  'When to Fine-Tune',
  'LoRA',
  'Datasets',
  'Evaluation Fundamentals',
  'Distillation',
  'Running Evals',
];
let found = 0;
for (const t of titles) {
  if (trackText.includes(t)) { found++; ok(`phase listed: ${t}`); }
  else bad(`phase MISSING from track view: ${t}`);
}

// --- 4. open a phase and confirm the lesson body renders -----------------
console.log('\n4. A phase page renders its lesson');
const opened = await evalJs(`
  (() => {
    const els = [...document.querySelectorAll('a, button, [role=button]')];
    const t = els.find(e => /Distillation/i.test(e.textContent || ''));
    if (!t) return false;
    t.click();
    return true;
  })()
`);
await sleep(1600);
if (opened) ok('opened the Distillation phase');
else bad('could not open a phase page');

const phaseText = await evalJs('document.body.innerText') || '';
if (phaseText.length > 1500) ok(`phase page rendered ${phaseText.length} chars`);
else bad(`phase page rendered only ${phaseText.length} chars — body may have thrown`);

// Content that only a fully-rendered lesson can contain.
//
// NOTE: these are the SITE's presentation labels, not the markdown `## ` text.
// The site renames sections when it renders them — "## Goal of this phase"
// becomes "What this phase covers", and "## Hands-on practice tasks" becomes
// "Hands-on practice". Asserting the raw markdown headings fails even on a
// perfectly good page, which is how this check was wrong on its first run.
const SECTIONS = [
  'What this phase covers',
  'Skills you',
  'Hands-on practice',
  'Checklist',
  'Quiz',
  'Free vs paid',
];
for (const marker of SECTIONS) {
  if (phaseText.includes(marker)) ok(`section rendered: ${marker}`);
  else bad(`section NOT rendered: ${marker}`);
}

// A fact unique to ft-05, proving the right lesson loaded.
if (/teacher/i.test(phaseText) && /distill/i.test(phaseText)) {
  ok('lesson content is the distillation phase, not a placeholder');
} else bad('lesson content does not match the distillation phase');

// The lesson headings from ft-05 must appear, proving the body was parsed
// rather than the page rendering an empty shell.
const lessonHeads = [
  'What distillation actually is',
  'Filtering and verifying',
  'What distillation cannot do',
  'The economics',
];
for (const h of lessonHeads) {
  if (phaseText.includes(h)) ok(`lesson heading rendered: ${h}`);
  else bad(`lesson heading MISSING: ${h} — body may be truncated`);
}

// --- 5. the Exams view exposes both all-track modes ----------------------
console.log("\n5. Capstone and comprehensive exams");
await goto(BASE);
await evalJs(`(() => { const b=[...document.querySelectorAll('.navbtn')].find(x=>x.innerText.trim()==='Exams'); if(b) b.click(); return !!b; })()`);
await sleep(800);
const examText = await evalJs("document.body.innerText") || "";
if (/All-track capstone/.test(examText) && /Comprehensive exam/.test(examText)) ok("both all-track exam modes are available");
else bad("capstone or comprehensive exam mode is missing");
if (/questions are sampled from each written track/.test(examText) && /Untimed and resumable/.test(examText)) ok("exam coverage and resumability are disclosed before starting");
else bad("exam scope is not clearly disclosed");

// --- 6. no runtime errors -------------------------------------------------
console.log('\n6. Runtime errors');
const real = consoleErrors.filter((e) =>
  !/favicon|DevTools|Download the React DevTools/i.test(e));
if (real.length === 0) ok('no console errors or uncaught exceptions');
else {
  bad(`${real.length} runtime error(s):`);
  real.slice(0, 5).forEach((e) => console.log(`      ${String(e).slice(0, 160)}`));
}

// --- done -----------------------------------------------------------------
ws.close();
proc.kill();

console.log('');
if (problems.length === 0) {
  console.log(`✓ browser check passed — Finetuning renders (${found}/6 titles found)`);
  process.exit(0);
} else {
  console.log(`✖ browser check failed — ${problems.length} problem(s)`);
  process.exit(1);
}
