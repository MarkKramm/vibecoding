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

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
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
  {
    // The four figures below are ANCHORED ON THE PHRASE THAT NAMES THE QUANTITY,
    // not on the bare noun. A first attempt used `/\b(\d+) lines\b/` and
    // `/\((\d+) files\b/` and reported 8 stale claims on a correct corpus:
    //
    //   - `25,395 lines across 94 authored Markdown files` is the AUTHORED total,
    //     not the phase-file total, and is checked by its own claim.
    //   - `1,740 lines` (ROADMAP:168, 221) is the size of code deleted in D-008.
    //     Nothing on disk can confirm or refute it — the files are gone.
    //   - `(229 files, all tracked files scanned)` is the encoding audit's
    //     coverage, checked by the claim above.
    //
    // That is the guard's own stated reason for existing: a pattern broader than
    // the claim it serves turns "prose goes stale" into "the guard is noise", and a
    // noisy guard is deleted. A narrow pattern that misses a future rephrasing is
    // the better failure, and the comment names the phrases so a rephrase is a
    // one-line update rather than a silent loss of coverage.
    label: "phase files on disk",
    expected: null, // filled in below from the filesystem
    patterns: [
      // "(66 files, 22,506 lines)" — CHECKPOINT.md's pipeline diagram, where the
      // count sits in a parenthesised pair and the second half names lines.
      /\(\s*(\d[\d,]*)\s+files\s*,\s*[\d,]+\s+lines\s*\)/gi,
    ],
  },
  {
    label: "non-empty lines in the phase files",
    expected: null, // filled in below from the filesystem
    patterns: [
      // "(..., 22,506 lines)" — the diagram's second half.
      /\(\s*[\d,]+\s+files\s*,\s*(\d[\d,]*)\s+lines\s*\)/gi,
      // "23,560 lines in the phase files" — the phrase that names the scope.
      /\b(\d[\d,]*)\s+lines\s+in\s+the\s+phase\s+files\b/gi,
    ],
  },
  {
    label: "authored Markdown files",
    expected: null, // filled in below from the filesystem
    patterns: [
      // "25,395 lines across 94 authored Markdown files" — ROADMAP:14, README:8,
      // and CHECKPOINT's header. The count of CONTENT files, which includes the
      // ten `00-overview.md` and ten `checklist-master.md` files.
      /\b(\d[\d,]*)\s+authored\s+Markdown\s+files\b/gi,
    ],
  },
  {
    label: "non-empty lines across all authored Markdown",
    expected: null, // filled in below from the filesystem
    patterns: [
      // "25,395 lines across 94 authored Markdown files" — the leading figure.
      /\b(\d[\d,]*)\s+lines\s+across\s+\d[\d,]*\s+authored\s+Markdown\s+files\b/gi,
    ],
  },
  {
    label: "files the encoding audit scanned",
    expected: null, // filled in below by running the encoding audit
    patterns: [
      // "encoding clean across 226 files", "no mojibake (226 files)".
      //
      // ONE pattern, and it is case-insensitive because the two lines in the corpus
      // that state this figure disagree about how to spell the noun: HANDOVER writes
      // "encoding clean across 226 files" and CHECKPOINT writes "Encoding - LF, UTF-8
      // no BOM, no tabs, no mojibake (226 files)". A case-sensitive anchor matched
      // HANDOVER's line and silently skipped CHECKPOINT's -- which is how a wrong
      // number survived inside a region this guard already inspects.
      //
      // The gap between `encoding` and the number is `[^.\n]*?` rather than a fixed
      // distance, so it spans an em dash, a comma or a parenthetical without needing
      // a second pattern. A first attempt added one for the parenthetical and the two
      // patterns both matched the same single number, so CHECKPOINT's line was
      // reported TWICE for one defect. The report now dedupes on what the reader is
      // shown, and the pattern count went back to one so the double match cannot recur.
      //
      // The cost of the single pattern is that a line stating this figure WITHOUT
      // naming the audit would not be checked. That is the right way round: a bare
      // `\((\d+) files\)` would also match CHECKPOINT's "1,597 Markdown table rows"
      // paragraph and ROADMAP's "94 authored Markdown files", which are different
      // metrics this guard does not measure.
      /\bencoding\b[^.\n]*?(\d[\d,]*)\s+files\b/gi,
    ],
  },
];

// The `npm test` step count is read from the suite itself rather than hardcoded,
// for the same reason the corpus counts are parsed: one source of truth.
/**
 * Source size of `ai-roadmaps/`, measured the way the documents state it.
 *
 * Added after `CHECKPOINT.md:42` carried `(66 files, 22,506 lines)` against a
 * corpus of 69 phase files and 23,560 lines — inside the `## What this is` region
 * this file already inspects, and with no pattern that could match it, because
 * "66 files" is not the word `phases`. Proved by injection rather than by reading:
 * changing 66 to 61 left this audit at exit 0.
 *
 * "Lines" means NON-EMPTY lines, and that is not a free choice. `ROADMAP.md:14`
 * states 25,395 lines across 94 authored Markdown files and 23,560 in the phase
 * files; counting every line including blanks gives 37,516 and 34,852, and counting
 * whitespace-stripped lines gives yet another pair. Only the non-empty definition
 * reproduces both figures already in the docs, which is the evidence that it is the
 * one the documents mean. It is stated here because a reader comparing by hand will
 * otherwise get a different answer and think the guard is wrong.
 *
 * Files are counted from the filesystem rather than from `git ls-files`, because
 * these documents are describing what the content pipeline reads, and the pipeline
 * reads the working tree.
 */
function measureSourceSize() {
  const walk = (dir, out = []) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p, out);
      else if (entry.name.endsWith(".md")) out.push(p);
    }
    return out;
  };

  const all = walk(join(ROOT, "ai-roadmaps"));
  const phaseFiles = all.filter((f) => /\d+-phase-.*\.md$/.test(f));

  const nonEmptyLines = (f) =>
    readFileSync(f, "utf8").split("\n").filter((l) => l !== "").length;

  return {
    files: phaseFiles.length,
    lines: phaseFiles.reduce((n, f) => n + nonEmptyLines(f), 0),
    authoredFiles: all.length,
    authoredLines: all.reduce((n, f) => n + nonEmptyLines(f), 0),
  };
}

function measureChecks() {
  const src = readFileSync(join(ROOT, "learning-site", "scripts", "check-all.mjs"), "utf8");
  // The steps are pushed as objects with a `name`. Counting them is the only
  // definition of "how many checks" that cannot disagree with a run.
  const steps = src.match(/name:\s*"[^"]+"/g) || [];
  return steps.length;
}

/**
 * How many files the encoding audit actually opened.
 *
 * Added after this guard's third scope error. Its claim list covered the corpus
 * counts and the `npm test` step count, and two documents stated "encoding clean
 * across 226 files" -- inside regions this file already inspects, neither matching
 * a HISTORY exemption -- while the audit reported 228. The guard looked at those
 * lines and had no pattern that could match them.
 *
 * The figure is read by RUNNING the audit rather than by re-deriving it, for the
 * same reason the step count comes from `check-all.mjs`: a second implementation
 * of the same measurement is a second thing that can be wrong. This is also the
 * number that makes the encoding audit's own coverage assertion legible, since it
 * prints the same figure next to the tracked-file total.
 */
function measureEncodingFiles() {
  const readCount = (out) => {
    const m = String(out).match(/^(\d[\d,]*) file\(s\) scanned$/m);
    return m ? Number(m[1].replace(/,/g, "")) : null;
  };

  let out;
  try {
    out = execFileSync("node", [join(ROOT, "learning-site", "scripts", "audit-encoding.mjs")], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 1 << 28,
    });
  } catch (e) {
    // The audit prints its count BEFORE any problems and then exits 1, so the
    // figure is in `e.stdout` rather than in the return value. Reading it from a
    // failing run is deliberate: this guard asks "how many files does the audit
    // cover", and that question has the same answer whether or not the audit is
    // currently happy.
    out = e?.stdout ?? "";
  }
  // Null when the figure cannot be read at all. It is a documentation number
  // rather than a gate, so an unreadable count leaves the claim unchecked instead
  // of guessing -- and a real encoding failure is that audit's job to report, not
  // this one's.
  return readCount(out);
}

const SOURCE = measureSourceSize();

for (const c of CLAIMS) {
  if (c.label === "`npm test` checks") c.expected = measureChecks();
  if (c.label === "files the encoding audit scanned") c.expected = measureEncodingFiles();
  if (c.label === "phase files on disk") c.expected = SOURCE.files;
  if (c.label === "non-empty lines in the phase files") c.expected = SOURCE.lines;
  if (c.label === "authored Markdown files") c.expected = SOURCE.authoredFiles;
  if (c.label === "non-empty lines across all authored Markdown") c.expected = SOURCE.authoredLines;
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
  // CHECKPOINT.md's own header records that the "tool rows" figure was DROPPED
  // rather than updated, and then deliberately talks about other file-shaped
  // numbers nearby -- "1,597 Markdown table rows", "94 authored Markdown files".
  // Those are different metrics from the encoding audit's file count, and the
  // parenthetical pattern would otherwise read them as claims about it. Each is
  // named rather than matched by keyword so the next reader can judge the call.
  { doc: "CHECKPOINT.md", match: /\d[\d,]*\s+Markdown table rows/, why: "table rows across the corpus, not files the encoding audit opens" },
  { doc: "ROADMAP.md", match: /\d[\d,]*\s+authored Markdown files/, why: "the count of content FILES, not the encoding audit's coverage" },
  { doc: "CHECKPOINT.md", match: /\d[\d,]*\s+authored Markdown files/, why: "the count of content FILES, not the encoding audit's coverage" },
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
              // Recorded so the report can name which pattern fired, which is what
              // makes a double report on one line diagnosable rather than merely
              // annoying. See the comment on this claim's patterns.
              pattern: String(pattern),
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
  // One line can match two patterns -- see the comment on the encoding claim's
  // patterns, where a parenthetical form and a prose form both match one number.
  // The patterns still run separately, because that is how a new claim FORM gets
  // covered; but the report has to dedupe on what the reader is shown, or a single
  // wrong number is announced twice and the second copy reads like a second defect.
  const shown = new Set();
  const unique = problems.filter((p) => {
    const key = `${p.doc}:${p.line}:${p.label}:${p.stated}`;
    if (shown.has(key)) return false;
    shown.add(key);
    return true;
  });

  console.log(`\n${unique.length} stale claim(s):\n`);
  for (const p of unique) {
    console.log(`  ${p.doc}:${p.line}  says ${p.stated}, corpus has ${p.expected}  (${p.label})`);
    console.log(`    ${p.text}\n`);
  }
  console.log("  Prose that states a number will go stale. Fix the doc, or make the");
  console.log("  sentence historical so this guard stops checking it - do not delete");
  console.log("  the check to silence it.\n");
  process.exit(1);
}

console.log("  \u2713 every present-tense corpus claim matches the build");
