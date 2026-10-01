// audit-doc-counts.mjs - fail the build when a prose document states a corpus
// count that is wrong.
//
// WHY THIS EXISTS. ROADMAP.md's own text already names the rule and the fix:
//
//   "Prose that states a number will go stale; the only durable fix is a guard
//    that reads the number back."
//
// That sentence was written after the figures in CHECKPOINT.md, WORKFLOW.md and
// HANDOVER.md drifted *despite* item 3 of ROADMAP.md having been marked DONE with
// the note "all exist and now carry current counts". By 2026-10-01, ROADMAP.md
// itself - the file whose opening line is "written to be honest rather than
// flattering" - claimed 66 phases, 555 quiz questions, 903 practice tasks and 20
// checks against a corpus of 69, 573, 965 and 22. Nobody had re-read it.
//
// So this guard is the durable fix that file asked for, and it is deliberately
// built to read the numbers back from the SAME parsers that build the site. It
// imports `buildPhase` rather than counting with a regex, because a second
// counting implementation is a second thing that can be wrong - and the failure
// this project keeps repeating is two sources of truth that drift apart.
//
// WHAT IT CHECKS, AND WHAT IT DELIBERATELY DOES NOT.
//
// A guard that fired on every number in the docs would be deleted within a week.
// HANDOVER.md is full of numbers that are *history* and must never be updated:
// "affected all 65", "325 authored items were invisible", "the 12 relay questions",
// the 442/433/237 tool-row counts from different eras. Rewriting those would
// destroy the record they exist to preserve, which is the same rule that keeps
// the old 402 claim quoted in SEARCH-REQUESTS.md.
//
// So this checks only assertions in the present tense about what the project *is*.
// The list below is short and explicit for that reason, and every pattern is
// matched against real sentences in the three files rather than guessed.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { KNOWN_TRACKS, ROOT, buildPhase, findPhaseFiles } from "./build-content.mjs";

// ---------------------------------------------------------------------------
// The corpus, measured with the real parsers.
// ---------------------------------------------------------------------------

function measureCorpus() {
  const seenPhaseIds = new Set();
  const seenItemIds = new Set();
  const errors = { add() {}, report() {} };

  let phases = 0;
  let tasks = 0;
  let checklist = 0;
  let quiz = 0;
  let lessonWords = 0;

  for (const meta of Object.values(KNOWN_TRACKS)) {
    for (const file of findPhaseFiles(join(ROOT, "ai-roadmaps", meta.folder))) {
      const phase = buildPhase(file, meta.folder, seenPhaseIds, seenItemIds, errors);
      if (!phase) continue;
      phases += 1;
      tasks += phase.tasks.length;
      checklist += phase.checklist.length;
      quiz += phase.quiz.length;
      lessonWords += phase.lessonWordCount;
    }
  }

  return { phases, tasks, checklist, quiz, lessonWords, tracks: Object.keys(KNOWN_TRACKS).length };
}

// ---------------------------------------------------------------------------
// Present-tense claims, and the count each one must equal.
// ---------------------------------------------------------------------------

const CORPUS = measureCorpus();

// `patterns` are matched against a single line. `expected` is compared against
// every captured number, so a line claiming two totals is checked for both.
//
// `label` is what the failure message calls the quantity, and it is phrased as
// the reader would say it rather than as the field name.
const CLAIMS = [
  {
    label: "phases",
    expected: CORPUS.phases,
    // "69 phases", "66 phases across 10 tracks", "69 phase files"
    patterns: [/\b(\d[\d,]*)\s+phases?\b/gi],
  },
  {
    label: "quiz questions",
    expected: CORPUS.quiz,
    // "573 quiz questions", "573 questions"
    patterns: [/\b(\d[\d,]*)\s+(?:quiz\s+)?questions\b/gi],
  },
  {
    label: "practice tasks",
    expected: CORPUS.tasks,
    // "965 practice tasks", "903 practice tasks exist"
    patterns: [/\b(\d[\d,]*)\s+practice\s+tasks?\b/gi],
  },
  {
    label: "checklist items",
    expected: CORPUS.checklist,
    // "1,121 checklist items"
    patterns: [/\b(\d[\d,]*)\s+checklist\s+items?\b/gi],
  },
  {
    label: "tracks",
    expected: CORPUS.tracks,
    // "across 10 tracks"
    patterns: [/\bacross\s+(\d[\d,]*)\s+tracks?\b/gi],
  },
  {
    label: "`npm test` checks",
    expected: null, // filled in below from check-all.mjs
    patterns: [
      /\bruns\s+(\d[\d,]*)\s+checks\b/gi,
      /\ball\s+(\d[\d,]*)\s+checks\s+passed\b/gi,
      // "npm test 23/23" - the same claim, written as a ratio. Added after the
      // guard's own introduction made a 22/22 in HANDOVER.md stale, and it was
      // caught by hand rather than by this file. A count can be spelled more than
      // one way and the forms that already exist are the ones worth covering.
      /`npm test`\s+\*\*(\d[\d,]*)\/\d+\*\*/gi,
      // A shell-comment form: "npm test   # 20 checks; 2 need a preview".
      // Added after CHECKPOINT.md:114 kept a stale 20 through a whole pass,
      // because the two patterns above only matched prose. A bare `\d+ checks`
      // would fire on two dozen historical lines in HANDOVER.md, so this is
      // anchored to the `#` that makes it a current-state annotation.
      /#\s*(\d[\d,]*)\s+checks\b/gi,
    ],
  },
];

// The `npm test` step count is read from the suite itself rather than hardcoded,
// for the same reason the corpus counts are parsed: one source of truth.
function measureChecks() {
  const src = readFileSync(join(ROOT, "learning-site", "scripts", "check-all.mjs"), "utf8");
  // The steps are pushed as objects with a `name`. Counting them is the only
  // definition of "how many checks" that cannot disagree with a run.
  const steps = src.match(/name:\s*"[^"]+"/g) || [];
  return steps.length;
}

for (const c of CLAIMS) {
  if (c.label === "`npm test` checks") c.expected = measureChecks();
}

// ---------------------------------------------------------------------------
// Documents in scope, and where their current-state claims live.
// ---------------------------------------------------------------------------

// A line is only inspected when it is making a present-tense claim. Historical
// narration is excluded structurally rather than by hoping the phrasing differs.
//
// This is the part that took two attempts, and the reason is worth recording: a
// first version inspected whole files and reported 65 stale claims. It was wrong.
// Almost all of them were lessons in HANDOVER.md narrating a past state - "42
// phases", "63 phases", "an all-zero histogram across 549 questions" - every one
// of which is *correct as history* and must never be updated. A guard reporting 65
// problems on a correct corpus is a guard that gets deleted, and the number 65 was
// itself evidence about the query, not the corpus.
//
// So each document declares WHERE its current-state claims live. Outside those
// regions a number is narration and is left alone. This is deliberately not a
// keyword blocklist - a blocklist grows forever and still misses the next phrasing.
const DOCS = [
  // A current-state document throughout, apart from its own history section, which
  // is block-quoted or explicitly dated.
  { path: "ROADMAP.md" },

  // The opening summary is current; the dated snapshots and incident write-ups
  // below are not. `State recorded 2026-09-18` is explicitly historical and is
  // excluded by name rather than by hoping its phrasing differs.
  {
    path: "CHECKPOINT.md",
    regions: [
      /^## What this is[\s\S]*?(?=^## State recorded)/m,
      /^## Ways to test yourself[\s\S]*?(?=^## What is verified)/m,
      /^## What is verified[\s\S]*?(?=^## The defect)/m,
      /^## Still open[\s\S]*?(?=^## Neither)/m,
      // The command reference. Its annotations are current-state by definition --
      // a reader copies from here -- and one kept a stale "20 checks" through a
      // whole reconciliation pass because it was outside every region.
      /^## Commands[\s\S]*?(?=^## )/m,
    ],
  },

  // ONLY the "Measured at this pause" table. Everything else in this file is a
  // lesson describing what was true at the time it was written, and rewriting a
  // lesson's numbers would falsify the record it exists to keep.
  { path: "HANDOVER.md", regions: [/^\*\*Measured at this pause\*\*[\s\S]*?(?=^---)/m] },

  // The header block is current; per-track counts further down are not totals.
  { path: "README.md", regions: [/^#[\s\S]*?(?=^## )/m] },
];

// Numbers that are not corpus totals even inside a current-state region, because
// the noun is local to a subsection: a per-track phase count, a capstone's
// questions-per-track, a slice described in a lesson.
//
// Each entry names the line and says why it is exempt, so the next reader can
// judge whether the exemption is still right rather than assuming it is stale.
const NOT_A_TOTAL = [
  { doc: "README.md", match: /foundations\/\s+\d+\s+phases/, why: "a per-track breakdown table, not the corpus total" },
  { doc: "CHECKPOINT.md", match: /\d+\s+questions per written track/, why: "the capstone's questions-per-track setting, not the quiz total" },
];

// A line that reads as a record of a past event, used only as a second net inside
// a current-state region.
const HISTORY = [
  /\bwere\s+invisible\b/i,
  /\bhad\s+been\b/i,
  /\bat\s+the\s+time\b/i,
  /\bpreviously\b/i,
  /\bhistorical\b/i,
  /\brecord(?:ed)?\s+(?:of|from)\b/i,
  /\bused\s+to\s+(?:say|be|print|claim)\b/i,
  /\bfound\s+(?:this\s+session|on)\b/i,
  /\bthe\s+corpus\s+has\s+since\s+grown\b/i,
  /\bsince\s+grown\s+to\b/i,
  /\baffected\s+all\b/i,
  /\bnot\s+one\s+of\s+the\b/i,
  /\bcorpus\s+said\b/i,
  /\bIt\s+said\b/i,
  /\bclaimed\b/i,
  /\bwas\s+written\b/i,
  /\bwhen\s+the\s+corpus\s+was\b/i,
  /^>\s/, // block quotes are commentary on the past
];

const problems = [];
const checked = [];

for (const doc of DOCS) {
  const path = join(ROOT, doc.path);
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    // A missing doc is not this guard's business; other checks own file presence.
    continue;
  }

  const lines = text.split("\n");

  // A line is in scope when it falls inside one of the doc's current-state
  // regions, or when the doc declares no regions (whole file is current).
  const inScope = (i) => {
    if (!doc.regions) return true;
    const upTo = lines.slice(0, i + 1).join("\n");
    return doc.regions.some((tpl) => {
      const re = new RegExp(tpl.source, tpl.flags.replace("g", ""));
      const m = re.exec(text);
      if (!m) return false;
      const start = text.slice(0, m.index).split("\n").length;
      const end = start + m[0].split("\n").length;
      return i + 1 >= start && i + 1 <= end;
    });
  };

  lines.forEach((line, i) => {
    if (!inScope(i)) return;
    if (HISTORY.some((h) => h.test(line))) return;
    if (NOT_A_TOTAL.some((n) => n.doc === doc.path && n.match.test(line))) return;

    for (const claim of CLAIMS) {
      for (const pattern of claim.patterns) {
        pattern.lastIndex = 0;
        let m;
        while ((m = pattern.exec(line)) !== null) {
          const stated = Number(m[1].replace(/,/g, ""));
          if (!Number.isFinite(stated)) continue;
          checked.push(`${doc.path}:${i + 1} ${claim.label} = ${stated}`);
          if (stated !== claim.expected) {
            problems.push({
              doc: doc.path,
              line: i + 1,
              label: claim.label,
              stated,
              expected: claim.expected,
              text: line.trim(),
            });
          }
        }
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Report.
// ---------------------------------------------------------------------------

console.log(`doc-count audit: ${checked.length} claim(s) checked against the corpus`);

if (problems.length) {
  console.log(`\n${problems.length} stale claim(s):\n`);
  for (const p of problems) {
    console.log(`  ${p.doc}:${p.line}  says ${p.stated}, corpus has ${p.expected}  (${p.label})`);
    console.log(`    ${p.text}\n`);
  }
  console.log("  Prose that states a number will go stale. Fix the doc, or make the");
  console.log("  sentence historical so this guard stops checking it - do not delete");
  console.log("  the check to silence it.\n");
  process.exit(1);
}

console.log("  \u2713 every present-tense corpus claim matches the build");
