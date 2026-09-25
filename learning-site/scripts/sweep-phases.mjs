/**
 * Sweep EVERY phase in a real browser — all 66, across all 10 tracks.
 *
 * WHY THIS EXISTS. `check-browser.mjs` verifies ONE track (Finetuning, 6 phases)
 * and asserts against hardcoded strings from `ft-05`. Everything else in the
 * corpus — 59 phases, 9 tracks — has never been rendered by a browser in any
 * check. A defect unique to, say, phase 61 of the Vibecoding track is invisible
 * to the entire suite, and that is not hypothetical: the Tools library shipped
 * "0 tools", the glossary and resource list shipped 325 invisible items, and the
 * whole site once shipped completely unstyled, all with green checks.
 *
 * Those four defects share one shape — correct source, wrong screen — and the
 * only thing that reliably catches them is rendering the page and looking at it.
 * So this walks the real UI, opening every phase the way a reader would, and
 * asserts the things a phase page must have.
 *
 * WHAT IT ASSERTS PER PHASE (cheap, structural, and impossible to satisfy with
 * a placeholder):
 *   * the page rendered a substantial body of text
 *   * the phase title on the page matches the title in the data
 *   * every one of the six rendered section labels is present
 *   * the quiz rendered four options and a "Why" explanation
 *   * the checklist rendered items
 *   * no runtime exception was thrown while the phase was open
 *   * no placeholder marker ("(title missing)", "undefined", "NaN") appeared
 *
 * WHAT IT DELIBERATELY DOES NOT DO. It does not compare lesson prose to the
 * Markdown — that is what the build guards are for, and re-doing it here would
 * make the sweep slow and brittle. It answers one question: does the right page
 * render, completely, without throwing?
 *
 *   node scripts/sweep-phases.mjs [baseUrl] [--limit N] [--track <id>]
 */
import { spawn, spawnSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2]?.startsWith("http")
  ? process.argv[2]
  : process.env.VITE_PREVIEW_URL || "http://localhost:4173";
const PORT = 9412;
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

// Optional narrowing, for iterating on this script without a full sweep.
const limitArg = process.argv.indexOf("--limit");
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;
const trackArg = process.argv.indexOf("--track");
const ONLY_TRACK = trackArg > -1 ? process.argv[trackArg + 1] : null;

const problems = [];
const ok = (m) => console.log(`  \u2713 ${m}`);
const bad = (m) => { problems.push(m); console.log(`  \u2716 ${m}`); };
const note = (m) => console.log(`  \u2022 ${m}`);

// --- the corpus, read from the generated index -----------------------------
const INDEX = JSON.parse(
  readFileSync(join(HERE, "..", "src", "data", "generated", "index.json"), "utf8")
);
const TRACKS = INDEX.tracks
  .filter((t) => t.phases.length > 0 && (!ONLY_TRACK || t.id === ONLY_TRACK))
  .map((t) => ({
    id: t.id,
    label: t.label || t.title || t.id,
    phases: t.phases.map((p) => ({ id: p.id, title: p.title })),
  }));

const TOTAL = TRACKS.reduce((n, t) => n + t.phases.length, 0);

// --- is a server even up? --------------------------------------------------
//
// Same contract as the accessibility audit: this step needs a preview server, and
// failing the suite because one is not running would get the step disabled — and a
// disabled guard is worse than none. It skips LOUDLY instead.
try {
  const r = await fetch(BASE, { signal: AbortSignal.timeout(4000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
} catch (e) {
  console.log(`\n  \u26a0 SKIPPED: no server answered at ${BASE} (${e.message}).`);
  console.log("    This sweep renders real pages; it cannot run without one.");
  console.log("      npm run build");
  console.log("      npx vite preview --port 4173 --strictPort   # in another shell");
  console.log("      node scripts/sweep-phases.mjs " + BASE);
  console.log("\n    Exiting 0 so a stopped server does not fail the rest of the suite.");
  console.log("    This is the ONLY condition under which this check passes without");
  console.log("    opening every phase; a reachable but broken page still fails.\n");
  process.exit(0);
}

// --- browser lifecycle -----------------------------------------------------
//
// Copied in approach from audit-a11y.mjs, and for the same hard-won reasons: a
// UNIQUE profile per run, and a TREE kill. `proc.kill()` alone terminates the
// spawned process but not the children Edge creates, which keep the profile lock
// and the debug port. That leak made browser checks here hang, with Node
// reporting "unsettled top-level await" at a line number that moved between runs.
const PROFILE = join(tmpdir(), `vb-sweep-${process.pid}-${Date.now()}`);
const proc = spawn(EDGE, [
  "--headless=old",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  "about:blank",
], { stdio: "ignore" });

let reaped = false;
function reap() {
  if (reaped) return;
  reaped = true;
  try {
    if (process.platform === "win32" && proc.pid) {
      spawnSync("taskkill", ["/PID", String(proc.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      proc.kill("SIGKILL");
    }
  } catch { /* best effort */ }
  try { rmSync(PROFILE, { recursive: true, force: true }); } catch { /* temp dir */ }
}
process.on("exit", reap);
process.on("SIGINT", () => { reap(); process.exit(130); });
process.on("SIGTERM", () => { reap(); process.exit(143); });

async function cdpTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      const page = list.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error(
    `CDP endpoint never came up on port ${PORT}. If a previous run leaked an Edge ` +
    `process, check: Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq ${PORT} }`
  );
}

const wsUrl = await cdpTarget();
const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true });
  ws.addEventListener("error", rej, { once: true });
});

let msgId = 0;
const pending = new Map();
let pageErrors = [];

ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
  if (msg.method === "Runtime.exceptionThrown") {
    const d = msg.params.exceptionDetails;
    pageErrors.push(d.exception?.description || d.text || "exception");
  }
  if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
    pageErrors.push(msg.params.args.map((a) => a.value ?? a.description).join(" "));
  }
});

/** A CDP command with a deadline — an unbounded promise hangs the whole run. */
const SEND_TIMEOUT_MS = 20000;
function send(method, params = {}) {
  const id = ++msgId;
  return new Promise((res, rej) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      rej(new Error(`CDP "${method}" did not answer within ${SEND_TIMEOUT_MS}ms — the browser connection is dead`));
    }, SEND_TIMEOUT_MS);
    pending.set(id, (m) => { clearTimeout(timer); res(m); });
    try { ws.send(JSON.stringify({ id, method, params })); }
    catch (e) { clearTimeout(timer); pending.delete(id); rej(new Error(`CDP socket refused "${method}": ${e.message}`)); }
  });
}

ws.addEventListener("close", () => {
  for (const [id, res] of pending) { pending.delete(id); res({ __closed: true, id }); }
});

async function evalJs(expression) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r?.__closed) throw new Error("CDP connection closed while evaluating");
  if (r.result?.exceptionDetails) {
    const d = r.result.exceptionDetails;
    return { __err: d.exception?.description || d.text || "evaluate threw" };
  }
  return r.result?.result?.value;
}

/** Navigate and wait for the app shell rather than guessing a duration. */
async function goto(url) {
  await send("Page.navigate", { url });
  for (let i = 0; i < 80; i++) {
    const ready = await evalJs("!!document.querySelector('#root')?.children.length");
    if (ready) { await sleep(120); return; }
    await sleep(100);
  }
}

await send("Runtime.enable");
await send("Page.enable");

// A REAL VIEWPORT, SET EXPLICITLY.
//
// `--headless=old` without this gave a 450px-tall window in testing, which put
// the "Next phase" button at y=18,865px — far outside the viewport. React's click
// handler still fired, and the page still did not change, so the sweep reported
// every phase after the first as having the wrong title. The instrument was
// wrong, not the app, and only measuring the viewport revealed it.
//
// 1440x1100 matches what the accessibility audit runs at, so the two checks
// describe the same page.
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false,
});

// Every label the site renders for a phase section. These are the SITE's
// presentation strings, not the Markdown `## ` headings — the site renames them,
// and asserting raw headings fails a perfectly good page.
const SECTIONS = [
  "What this phase covers",
  "Skills you",
  "Hands-on practice",
  "Checklist",
  "Quiz",
  "Free vs paid",
];

// Markers that mean a component degraded or a value went missing.
//
// ⚠️ THIS MUST NOT MATCH PROSE. A first version searched the whole body text for
// the words "undefined" and "NaN" and reported six phases as broken. Every hit
// was a QUIZ ANSWER: "Cosine similarity is undefined for out-of-vocabulary
// words" is a correct sentence, and "the others become undefined" is the wrong
// option explaining its own misconception. The site was right and the probe was
// wrong — the ninth time in this project that an implausible result turned out to
// be evidence about the query.
//
// So the markers are anchored to the exact strings the components emit when they
// degrade, and nothing else. A bare "undefined" anywhere in a lesson is a
// legitimate word.
const PLACEHOLDERS = "\\(title missing\\)|\\(goal missing\\)|\\(duration missing\\)|\\[object Object\\]|\\bNaN%\\b|\\b\\d+/undefined\\b|\\bundefined item";

console.log(`\nSweeping all ${TOTAL} phase(s) across ${TRACKS.length} track(s) at ${BASE}`);
console.log("Walking the real UI: dashboard \u2192 track \u2192 phase \u2192 next phase \u2192 \u2026\n");

let opened = 0;
const failuresByPhase = new Map();

/**
 * Read the currently-open phase page.
 *
 * Waits for the body to fill in rather than sleeping a fixed duration: the
 * lesson is lazy-loaded per track, so a fast read catches an empty shell and
 * would report every phase as broken.
 */
async function readPhase() {
  let stats = null;
  for (let i = 0; i < 80; i++) {
    stats = await evalJs(`
      (() => {
        const body = document.body.innerText || '';
        const h1 = document.querySelector('h1');
        return {
          title: h1 ? h1.textContent.trim() : '',
          len: body.length,
          sections: ${JSON.stringify(SECTIONS)}.filter((s) => body.includes(s)),
          // The checklist is ul.checklist, but its children are NOT list items:
          // ChecklistItem renders a <label class="check"> wrapping a real input.
          // Two earlier versions of this line were wrong — 'li input[type=checkbox]'
          // and then 'li' under .checklist — and each reported different phases as
          // broken while the page was correct both times. The selector is now read
          // off the component rather than guessed from the container's tag.
          //
          // NOTE: no backticks in these comments. This block is itself inside a
          // template literal, so a backtick terminates the string and produces a
          // syntax error — which happened twice while writing this file.
          checklistItems: document.querySelectorAll('.checklist .check').length,
          checklistControls: document.querySelectorAll('.checklist input[type=checkbox], .checklist button').length,
          quizQuestions: document.querySelectorAll('.quiz__prompt').length,
          quizOptions: document.querySelectorAll('.quiz__opt').length,
          placeholders: (body.match(new RegExp(${JSON.stringify(PLACEHOLDERS)}, 'g')) || []).slice(0, 3),
        };
      })()
    `);
    if (stats && typeof stats === "object" && stats.len > 1200) break;
    await sleep(100);
  }
  return stats;
}

for (const track of TRACKS) {
  console.log(`\u2500\u2500 ${track.label} (${track.phases.length}) \u2500\u2500`);

  await goto(BASE);

  // Clicking a track's heading opens its FIRST phase directly. There is no
  // track-level grid of phase cards — an earlier version of this script assumed
  // one and reported all 65 phases as "card not found", which is the instrument
  // being wrong rather than the page.
  const entered = await evalJs(`
    (() => {
      const h = document.getElementById(${JSON.stringify("track-" + track.id)});
      if (!h) return 'no-heading';
      const b = h.querySelector('button');
      if (!b) return 'no-button';
      if (b.disabled) return 'disabled';
      b.click();
      return 'clicked';
    })()
  `);
  if (entered !== "clicked") {
    bad(`${track.label}: could not open the track (${entered}) — its ${track.phases.length} phase(s) are unverified`);
    continue;
  }

  // From here the walk is sequential: each phase carries a "Next phase" button,
  // which is both how a reader moves and a far more reliable traversal than
  // re-entering the track for every phase.
  for (let idx = 0; idx < track.phases.length; idx++) {
    if (opened >= LIMIT) break;
    const phase = track.phases[idx];
    pageErrors = [];

    const stats = await readPhase();

    if (!stats || typeof stats === "string") {
      bad(`${track.id}/${phase.id}: could not read the page (${JSON.stringify(stats)})`);
      failuresByPhase.set(phase.id, "unreadable");
    } else {
      opened++;
      const issues = [];

      // The title must be the RIGHT phase's title, not merely present. This is
      // the assertion that catches a stale or mis-indexed detail view.
      if (!stats.title) issues.push("no <h1>");
      else if (!stats.title.includes(phase.title.slice(0, 30))) {
        issues.push(`h1 is "${stats.title.slice(0, 45)}" but the phase is "${phase.title.slice(0, 45)}"`);
      }

      if (stats.len < 1500) issues.push(`only ${stats.len} chars of text (body may have thrown)`);
      if (stats.sections.length < SECTIONS.length) {
        const missing = SECTIONS.filter((s) => !stats.sections.includes(s));
        issues.push(`section(s) not rendered: ${missing.join(", ")}`);
      }
      if (stats.placeholders.length) {
        issues.push(`placeholder marker(s) rendered: ${JSON.stringify(stats.placeholders)}`);
      }
      if (stats.checklistItems === 0) issues.push("the checklist rendered 0 items");
      else if (stats.checklistControls === 0) issues.push(`${stats.checklistItems} checklist item(s) but NO interactive control — the reader cannot tick anything`);
      if (stats.quizQuestions === 0) issues.push("no quiz question rendered");
      if (stats.quizOptions < 4) issues.push(`only ${stats.quizOptions} quiz option(s) rendered across ${stats.quizQuestions} question(s)`);

      // ANSWER A QUESTION, then read the explanation.
      //
      // The explanation is behind `isAnswered` by design — a right answer for the
      // wrong reason is the commonest way to mis-learn, so the reasoning is shown
      // only once the reader has committed. An earlier version of this script
      // asserted a "Why:" string on the unanswered page and reported all 65
      // phases as broken; the page was correct and the assertion was not.
      //
      // Answering is also the stronger test: it exercises the click handler, the
      // scoring, and the explanation renderer, none of which a static read sees.
      const answered = await evalJs(`
        (() => {
          const first = document.querySelector('.quiz__opt');
          if (!first) return 'no-option';
          first.click();
          return 'clicked';
        })()
      `);
      if (answered !== "clicked") {
        issues.push(`could not answer a quiz question (${answered}) — the explanation path is unverified`);
      } else {
        await sleep(150);
        const ex = await evalJs(`
          (() => {
            const els = [...document.querySelectorAll('.quiz__why')];
            return { count: els.length, text: els.length ? els[0].textContent.trim().slice(0, 80) : '' };
          })()
        `);
        if (!ex || ex.count === 0) {
          issues.push("answered a quiz question but NO explanation rendered (.quiz__why absent)");
        } else if (!/why/i.test(ex.text)) {
          issues.push(`explanation rendered without a "Why" lead-in: ${JSON.stringify(ex.text)}`);
        }
      }

      const errs = pageErrors.filter((e) => !/favicon|DevTools|Download the React DevTools/i.test(String(e)));
      if (errs.length) issues.push(`${errs.length} runtime error(s): ${String(errs[0]).slice(0, 120)}`);

      if (issues.length) {
        bad(`${track.id}/${phase.id} "${phase.title.slice(0, 42)}":`);
        for (const i of issues) console.log(`      ${i}`);
        failuresByPhase.set(phase.id, issues.join("; "));
      } else {
        ok(`${track.id}/${phase.id} \u2014 ${stats.len} chars, ${stats.sections.length}/${SECTIONS.length} sections, ${stats.checklistItems} checklist item(s), ${stats.quizOptions} quiz option(s)`);
      }
    }

    if (idx === track.phases.length - 1 || opened >= LIMIT) break;

    // Advance. `--next` is a modifier on the same button class, so it is matched
    // explicitly rather than by position.
    const moved = await evalJs(`
      (() => {
        const b = document.querySelector('button.phase-nav__card--next');
        if (!b) return 'no-next-button';
        if (b.disabled) return 'disabled';
        b.click();
        return 'clicked';
      })()
    `);
    if (moved !== "clicked") {
      bad(`${track.id}: could not advance past ${phase.id} (${moved}) — the rest of this track is unverified`);
      break;
    }
    await sleep(200);
  }
  if (opened >= LIMIT) break;
}

// --- summary ---------------------------------------------------------------
console.log("");
if (opened < TOTAL) {
  note(`swept ${opened} of ${TOTAL} phase(s)${LIMIT !== Infinity ? ` (--limit ${LIMIT})` : ""}`);
}

if (problems.length === 0) {
  console.log(`\u2713 phase sweep passed \u2014 all ${opened} phase(s) rendered completely, with no runtime errors`);
  ws.close();
  reap();
  process.exit(0);
} else {
  console.log(`\u2716 phase sweep failed \u2014 ${failuresByPhase.size} phase(s) with problems (${problems.length} detail line(s))`);
  console.log("");
  console.log("  A phase that renders here is one a reader can actually use. A phase that fails");
  console.log("  is a page someone will open and find broken, and no data check can see it.");
  ws.close();
  reap();
  process.exit(1);
}
