// audit-arithmetic.mjs — check the numbers inside worked examples.
//
// WHY THIS EXISTS
// cost/05 shipped a worked example that passed every guard and was wrong. The
// table said a cheap model at 60% success cost ~$0.0096 per successful task
// against a strong model's ~$0.0105, and the prose drew a conclusion from it.
// But 1/0.60 = 1.67 attempts, not the 2.4 the table showed, and 0.004 * 1.67 =
// 0.0067, not 0.0096. The row was consistent with 41.7% success, not the 60% the
// text stated -- and at the stated 60% the lesson's conclusion INVERTED.
//
// No existing guard could see this. The content build checks structure, the quiz
// audit checks answer positions, the AST audit checks that no prose was dropped.
// None of them can evaluate arithmetic, because none of them know what the
// numbers MEAN. This script is narrow on purpose: it does not try to understand
// prose, it checks one specific, high-value relation that recurs in the corpus.
//
// WHAT IT CHECKS
// Markdown tables that state a rate and a derived per-task cost, of the form:
//
//   | | Cheap model | Strong model |
//   | Cost per call | $0.004 | $0.010 |
//   | Success rate per attempt | 35% | 95% |
//   | Attempts per successful task | 2.86 | 1.05 |
//   | Cost per successful task | ~$0.0114 | ~$0.0105 |
//
// For every column that carries all four values, it asserts:
//   attempts ≈ 1 / successRate          (within a stated tolerance)
//   costPerTask ≈ costPerCall * attempts
//
// A column missing any of the four rows is SKIPPED and reported as skipped, not
// as passing -- silence must not read as approval, which is the mistake this
// whole file exists to prevent.
//
// Run: node learning-site/scripts/audit-arithmetic.mjs

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const CORPUS = join(ROOT, "ai-roadmaps");

// Tolerances. The corpus writes values rounded for humans (~$0.0114, 2.86), so
// exact equality would fail on correct content. These are tight enough to catch
// the real defect class: the cost/05 bug was off by 40%, not by a rounding digit.
const ATTEMPTS_TOL = 0.03; // ±3% on 1/rate
const COST_TOL = 0.03; // ±3% on cost per task

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

const num = (s) => {
  const m = String(s).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
};
const rate = (s) => {
  const m = String(s).match(/(\d+(?:\.\d+)?)\s*%/);
  return m ? Number(m[1]) / 100 : null;
};

const problems = [];
const checked = [];
const skipped = [];
let tables = 0;

for (const file of walk(CORPUS)) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const lines = readFileSync(file, "utf8").split("\n");

  // Group consecutive table lines into blocks.
  let block = [];
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*\|/.test(lines[i])) block.push({ n: i + 1, t: lines[i] });
    else if (block.length) {
      blocks.push(block);
      block = [];
    }
  }
  if (block.length) blocks.push(block);

  for (const b of blocks) {
    // A header row names the columns; the first cell of each later row names the metric.
    const header = b[0].t.split("|").slice(1, -1).map((c) => c.trim());
    if (header.length < 2) continue;
    tables++;

    // Collect metric -> values, per column index.
    const cols = header.map(() => ({}));
    let labelled = false;
    for (const { t } of b.slice(1)) {
      const cells = t.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
      const name = (cells[0] || "").toLowerCase();
      if (!name) continue;
      cells.forEach((c, j) => {
        // Bounds check, and it is not defensive padding -- it is load-bearing.
        //
        // A body row can carry MORE cells than the header (a table with a stray
        // trailing pipe, or a row that is really prose starting with "|"). Without
        // this guard, cols[j] is undefined for j >= header.length and the write
        // throws a TypeError. The first version of this script crashed that way,
        // and because it exited 1 the crash was indistinguishable from a genuine
        // arithmetic failure -- it appeared to "catch" the bug it was written for
        // while actually catching nothing. A check that fails for the wrong reason
        // is worse than no check, because it reports success at its real job.
        if (j >= cols.length || j === 0) return;
        if (/cost per call|price per call|per call/.test(name)) cols[j].call = num(c);
        if (/success rate|successful/.test(name) && /%/.test(c)) cols[j].rate = rate(c);
        if (/attempts per/.test(name)) cols[j].attempts = num(c);
        if (/cost per successful|per successful task|cost per task/.test(name)) cols[j].task = num(c);
      });
      if (/attempts per|cost per successful|success rate/.test(name)) labelled = true;
    }
    if (!labelled) continue;

    cols.forEach((v, j) => {
      const where = `${rel} table at line ${b[0].n}, column "${header[j] || j}"`;
      const have = ["call", "rate", "attempts", "task"].filter((k) => v[k] !== undefined && v[k] !== null);
      if (have.length === 0) return;

      // A column that carries SOME of the four but not all is a near-miss: report
      // it, because a partially-populated column is how a wrong row hides.
      if (have.length < 4) {
        skipped.push(`${where} — has ${have.join(", ")}; needs call+rate+attempts+task to check`);
        return;
      }

      const expAttempts = 1 / v.rate;
      const aErr = Math.abs(expAttempts - v.attempts) / expAttempts;
      const expTask = v.call * v.attempts;
      const tErr = Math.abs(expTask - v.task) / expTask;

      if (aErr > ATTEMPTS_TOL) {
        problems.push(
          `${where}\n      attempts: stated ${v.attempts}, but 1/${(v.rate * 100).toFixed(0)}% = ${expAttempts.toFixed(2)}  (off ${(aErr * 100).toFixed(0)}%)`
        );
      }
      if (tErr > COST_TOL) {
        problems.push(
          `${where}\n      cost/task: stated ${v.task}, but ${v.call} x ${v.attempts} = ${expTask.toFixed(4)}  (off ${(tErr * 100).toFixed(0)}%)`
        );
      }
      if (aErr <= ATTEMPTS_TOL && tErr <= COST_TOL) {
        checked.push(`${where} — ${v.attempts} vs ${expAttempts.toFixed(2)}, ${v.task} vs ${expTask.toFixed(4)}`);
      }
    });
  }
}

// ── SECOND DEFECT CLASS: the break-even claim in PROSE ───────────────────────
//
// The table checks above caught the original cost/05 bug (a wrong `attempts`
// value). They do NOT catch a prose sentence that draws a WRONG CONCLUSION from a
// correct table, and cost/05 had exactly that: the table was right, but the text
// claimed the two models "are level at 40%" when the real crossover is 38%. A
// learner checking the lesson against its own table would find them disagreeing.
//
// The relation is fully determinate, so it is checkable. For two models with
// (callA, rateA) and (callB, rateB), the level point is:
//
//     callA / r = callB / rateB        =>        r = callA * rateB / callB
//
// Only sentences that actually STATE a crossover are checked -- the corpus
// discusses trade-offs in prose constantly, and flagging all of it would produce
// noise that trains the reader to ignore the guard.
//
// Dynamic columns are the breaking case: cost/05 says "above 40% the cheap model
// wins", which is TRUE both before and after the fix. What was wrong was the
// specific rate named as the level point, so that is what gets compared.
const TOL_BREAKEVEN = 0.02; // ±2 percentage points on a stated crossover

const breakevenRe = /\blevel\s+(?:at|when)\s+(\d+(?:\.\d+)?)\s*%/i;

for (const file of walk(CORPUS)) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const text = readFileSync(file, "utf8");

  // Only look at files that already carry a checkable two-model cost table.
  if (!/cost per call/i.test(text) || !/success rate/i.test(text)) continue;

  // Find the two columns of the cost table: their call price and success rate.
  const pairs = [];
  const tableRows = text.split("\n");
  let header = null;
  for (const line of tableRows) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 2) continue;
    const name = (cells[0] || "").toLowerCase();
    if (/cost per call|price per call/.test(name)) {
      header = cells.slice(1).map(num);
    } else if (/success rate/.test(name) && header) {
      cells.slice(1).forEach((c, i) => {
        const r = rate(c);
        if (r !== null && header[i] !== null) pairs.push({ call: header[i], rate: r });
      });
      header = null;
    }
  }
  if (pairs.length < 2) continue;

  for (const m of text.matchAll(new RegExp(breakevenRe, "gi"))) {
    const stated = Number(m[1]) / 100;
    // Which pair does the sentence intend? Use the two cheapest/most expensive
    // distinct call prices present, which is what a two-model comparison means.
    const sorted = [...pairs].sort((a, b) => a.call - b.call);
    const cheap = sorted[0];
    const dear = sorted[sorted.length - 1];
    if (cheap.call === dear.call) continue;

    const expected = (cheap.call * dear.rate) / dear.call;
    const err = Math.abs(expected - stated);
    if (err > TOL_BREAKEVEN) {
      problems.push(
        `${rel}: prose claims the two are level at ${(stated * 100).toFixed(0)}%, ` +
          `but the table's numbers give ${(expected * 100).toFixed(1)}%\n` +
          `      ${cheap.call} / r = ${dear.call} / ${(dear.rate * 100).toFixed(0)}%  =>  r = ${(expected * 100).toFixed(1)}%  (off ${(err * 100).toFixed(1)} points)`
      );
    } else {
      checked.push(
        `${rel}: break-even claim ${(stated * 100).toFixed(0)}% vs computed ${(expected * 100).toFixed(1)}%`
      );
    }
  }
}

console.log(`scanned ${tables} table(s) across the corpus`);

if (checked.length) {
  console.log(`\n✓ ${checked.length} column(s) verified consistent:`);
  for (const c of checked) console.log(`    ${c}`);
}

if (skipped.length) {
  console.log(`\n- ${skipped.length} column(s) skipped (incomplete data, NOT verified):`);
  for (const s of skipped) console.log(`    ${s}`);
}

if (problems.length) {
  console.log(`\n✗ ${problems.length} arithmetic inconsistency(ies):`);
  for (const p of problems) console.log(`    ${p}`);
  process.exit(1);
}

console.log(`\n✓ no arithmetic inconsistencies found`);
