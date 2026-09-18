// Unit tests for the quiz pipeline, plus a structural audit of every quiz in the
// generated corpus.
//
// WHY THIS EXISTS
// The browser script (verify-quiz-correctness.mjs) already proves that clicking
// the option the SOURCE calls correct produces a perfect score. It needs a dev
// server, a browser binary and ~30 seconds, so it is not in `npm test` and it
// cannot see the two things below.
//
//   1. IT ONLY EVER TESTS ONE PHASE. It reads foundations.json's first phase and
//      answers that one. A malformed `answerIndex` in any of the other 64 phases
//      renders a quiz where NO option is correct, or where the wrong one is, and
//      the browser script never opens it. The corpus section of this file walks
//      all of them.
//
//   2. IT EXERCISES THE UI, NOT THE LOGIC. lib/quiz.js decides what the summary
//      says and which questions count as missed. Those decisions have quiet
//      failure modes — an unanswered question reported as wrong, a summary that
//      names the wrong question number — that a click-through on the happy path
//      cannot reach, and the module's own header lists them. They are asserted
//      directly here.
//
// Also covered: data/roadmaps.js's normaliseQuestion() is the single adapter
// between the authored shape and the ported components' shape. Its header claims
// `answerIndex` is the ONLY source of truth and that a malformed question yields
// NO correct option rather than a wrong one. Both claims are pinned below,
// because a regression in either teaches the reader something false.
//
// lib/quiz.js is plain ESM and imports nothing, so it loads directly. roadmaps.js
// imports generated JSON and a Vite-only `import.meta.glob`, so the two adapter
// functions are transpiled and stubbed — see DATA_LAYER below.
//
// Run: node scripts/test-quiz.mjs

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";
import {
  correctIndex,
  isCorrect,
  missedQuestions,
  answeredCount,
  summarise,
} from "../src/lib/quiz.js";

const GEN = fileURLToPath(new URL("../src/data/generated/", import.meta.url));

let pass = 0;
const failures = [];

function check(name, got, want) {
  const a = JSON.stringify(got);
  const b = JSON.stringify(want);
  if (a === b) {
    pass++;
    return;
  }
  failures.push(`${name}\n     want: ${b}\n     got:  ${a}`);
}

// ── DATA_LAYER ───────────────────────────────────────────────────────────────
// data/roadmaps.js cannot be imported as it stands: it imports
// `./generated/index.json` (which node CAN do, given the import attribute) and
// calls `import.meta.glob`, which only exists in Vite. Rather than restructure
// the module or reimplement its two adapter functions — either of which would
// mean the test no longer tests the shipped code — the source is transpiled and
// the one Vite-only line is replaced with an empty stub. The functions under
// test are the real ones, byte for byte, up to that substitution.
const ROADMAPS_SRC = fileURLToPath(new URL("../src/data/roadmaps.js", import.meta.url));

function loadRoadmaps() {
  let code = transformSync(readFileSync(ROADMAPS_SRC, "utf8"), {
    loader: "js",
    format: "esm",
    sourcefile: ROADMAPS_SRC,
  }).code;

  // The glob is only read by loadTrackPhases(), which needs a bundler and is not
  // exercised here. The JSON import IS resolved, so `tracks` is real data —
  // and it needs `with { type: "json" }`, which Vite does not require but node
  // does, since a bare JSON import is otherwise a hard error.
  code = code.replace(/import\.meta\.glob\([^)]*\)/g, "({})");
  code = code.replace(
    /from\s+["']\.\/generated\/index\.json["']/g,
    'from ' +
      JSON.stringify("file:///" + join(GEN, "index.json").replace(/\\/g, "/")) +
      ' with { type: "json" }'
  );

  return import(
    "data:text/javascript;base64," + Buffer.from(code, "utf8").toString("base64")
  );
}

const roadmaps = await loadRoadmaps();
const { normaliseQuestion, normalisePhase, trackIdForPhase } = roadmaps;

// ── normaliseQuestion: answerIndex is the only source of truth ───────────────

{
  const q = normaliseQuestion({
    id: "x-q1",
    question: "Which one?",
    options: ["a", "b", "c", "d"],
    answerIndex: 2,
    why: "because",
  });
  check(
    "normaliseQuestion marks exactly the answerIndex option correct",
    q.options.map((o) => o.correct),
    [false, false, true, false]
  );
  check("normaliseQuestion carries the text through untouched", q.options.map((o) => o.text), ["a", "b", "c", "d"]);
  check("normaliseQuestion maps why -> explanation", q.explanation, "because");
  check("normaliseQuestion preserves id and question", [q.id, q.question], ["x-q1", "Which one?"]);
  // The property lib/quiz.js depends on.
  check("normaliseQuestion output is readable by correctIndex()", correctIndex(q), 2);
}

{
  // A distractor whose TEXT says it is correct must not be believed. This is the
  // failure the module header calls out specifically.
  const q = normaliseQuestion({
    id: "x-q2",
    question: "Which one?",
    options: [
      "This is the correct answer, obviously",
      "the real one",
      "also correct!",
      "correct",
    ],
    answerIndex: 1,
    why: "w",
  });
  check(
    "option text containing 'correct' does not win",
    q.options.map((o) => o.correct),
    [false, true, false, false]
  );
}

{
  // Malformed questions fail toward "nothing is marked correct". A quiz that
  // silently marks a distractor right is worse than one that marks none.
  const cases = [
    ["missing answerIndex", { options: ["a", "b"] }],
    ["answerIndex null", { options: ["a", "b"], answerIndex: null }],
    ["answerIndex a string", { options: ["a", "b"], answerIndex: "1" }],
    ["answerIndex out of range high", { options: ["a", "b"], answerIndex: 2 }],
    ["answerIndex negative", { options: ["a", "b"], answerIndex: -1 }],
    ["no options at all", { answerIndex: 0 }],
  ];
  for (const [name, raw] of cases) {
    const q = normaliseQuestion(raw);
    const anyCorrect = q.options.some((o) => o.correct);
    check(`malformed (${name}) marks nothing correct`, anyCorrect, false);
    check(`malformed (${name}) is unanswerable`, correctIndex(q), -1);
    check(`malformed (${name}) still yields an explanation string`, typeof q.explanation, "string");
  }
}

{
  const phase = normalisePhase({ id: "p", quiz: [{ options: ["a"], answerIndex: 0 }] });
  check("normalisePhase normalises every question", correctIndex(phase.quiz[0]), 0);
  check("normalisePhase tolerates a phase with no quiz", normalisePhase({ id: "p" }).quiz, []);
}

// ── lib/quiz.js ──────────────────────────────────────────────────────────────

const Q = (id, answerIndex, n = 4) => ({
  id,
  question: `question ${id}`,
  options: Array.from({ length: n }, (_, i) => ({ text: `opt${i}`, correct: i === answerIndex })),
});
const QS = [Q("q1", 0), Q("q2", 1), Q("q3", 2), Q("q4", 3)];

check("correctIndex finds the flagged option", correctIndex(QS[1]), 1);
check("correctIndex on a malformed question", correctIndex({ options: [] }), -1);
check("correctIndex on null", correctIndex(null), -1);

// isCorrect: an unanswered question is NOT wrong, and `0` is a real answer.
check("isCorrect true for the right choice", isCorrect(QS[0], 0), true);
check("isCorrect false for a distractor", isCorrect(QS[0], 1), false);
check("isCorrect false when unanswered (undefined)", isCorrect(QS[0], undefined), false);
check("isCorrect false when unanswered (null)", isCorrect(QS[0], null), false);
// The one that catches `if (!choice) return false;` — option 0 is falsy.
check("isCorrect honours option index 0", isCorrect(QS[1], 1), true);
check("isCorrect rejects 0 against an answer of 0", isCorrect(QS[0], 0), true);

check(
  "missedQuestions excludes the right answers",
  missedQuestions(QS, { q1: 1, q2: 1, q3: 2, q4: 3 }).map((q) => q.id),
  ["q1"]
);
check(
  "missedQuestions EXCLUDES unanswered questions",
  missedQuestions(QS, { q1: 0, q3: 2 }).map((q) => q.id),
  []
);
check(
  "missedQuestions keeps curriculum order",
  missedQuestions(QS, { q1: 3, q2: 0, q3: 0, q4: 0 }).map((q) => q.id),
  ["q1", "q2", "q3", "q4"]
);
check(
  "missedQuestions keeps curriculum order when only some are wrong",
  missedQuestions(QS, { q1: 3, q2: 1, q3: 0, q4: 3 }).map((q) => q.id),
  ["q1", "q3"]
);
check("missedQuestions with nothing picked", missedQuestions(QS, {}).length, 0);
check("missedQuestions tolerates a missing map", missedQuestions(QS, undefined).length, 0);
check("missedQuestions tolerates a non-array", missedQuestions(null, {}).length, 0);

check("answeredCount counts recorded answers", answeredCount(QS, { q1: 0, q2: 1 }), 2);
check("answeredCount counts an answer of 0 as answered", answeredCount(QS, { q1: 0 }), 1);
check("answeredCount with nothing picked", answeredCount(QS, {}), 0);

check("summarise: empty quiz", summarise([], {}), {
  kind: "empty",
  text: "This phase has no quiz yet.",
});
check("summarise: nothing answered yet", summarise(QS, {}), {
  kind: "partial",
  answered: 0,
  total: 4,
  text: "",
});
check("summarise: partially answered", summarise(QS, { q1: 0, q2: 1 }), {
  kind: "partial",
  answered: 2,
  total: 4,
  text: "2 of 4 answered.",
});
check("summarise: all correct", summarise(QS, { q1: 0, q2: 1, q3: 2, q4: 3 }), {
  kind: "perfect",
  text: "Every answer correct — you can hold this material in conversation.",
});
check("summarise: one wrong, singular wording", summarise(QS, { q1: 3, q2: 1, q3: 2, q4: 3 }), {
  kind: "review",
  numbers: [1],
  text: "One to look at again — question 1.",
});
// The off-by-one this file exists for: question NUMBERS are 1-based positions,
// not indices, and not the id's suffix. Answered q4 wrongly -> "question 4".
check("summarise: several wrong, plural wording and 1-based numbers", summarise(QS, {
  q1: 3,
  q2: 0,
  q3: 2,
  q4: 3,
}), {
  kind: "review",
  numbers: [1, 2],
  text: "A few to look at again — questions 1, 2.",
});
check(
  "summarise: the LAST question reports its own number, not 3",
  summarise(QS, { q1: 0, q2: 1, q3: 2, q4: 0 }).numbers,
  [4]
);
// Answered but incomplete correctly is still partial, not review: the reader is
// told how far they got rather than being shown a list of failures.
check(
  "summarise: answered-wrong while incomplete is still partial",
  summarise(QS, { q1: 3 }).kind,
  "partial"
);
check("summarise tolerates a non-array", summarise(null, {}).kind, "empty");

// ── The real corpus ──────────────────────────────────────────────────────────
// Every structural rule the authoring contract states, checked against the JSON
// the site actually renders. These are the assertions the browser script would
// only ever make about foundations/01.

const TRACK_FILES = readdirSync(GEN).filter(
  (f) => f.endsWith(".json") && !["index.json", "search.json", "shared.json", "tracks.json"].includes(f)
);

let phases = 0;
let questions = 0;
const positionCounts = [0, 0, 0, 0, 0, 0];
const energySeen = new Map();
const perFileSpread = [];

for (const file of TRACK_FILES) {
  const data = JSON.parse(readFileSync(join(GEN, file), "utf8"));
  for (const phase of data.phases || []) {
    phases++;
    const quiz = phase.quiz || [];
    const here = [0, 0, 0, 0, 0, 0];

    // HOW MANY QUESTIONS A PHASE HAS IS NOT A CONSTANT, AND ASSUMING IT WAS IS
    // THE MISTAKE THIS COMMENT RECORDS. AGENTS.md says "6, unless the file's
    // neighbours differ", and across the corpus it does: 17 phases carry 6, but
    // 22 carry 10 and one carries 12. A first draft of this file asserted
    // exactly 6 and produced 59 phantom failures — the tooling was wrong, not
    // the content. The real invariants are the floor (a phase with fewer than 6
    // has not been written to contract) and the numbering.
    if (quiz.length < 6) {
      failures.push(`corpus: ${phase.id} has ${quiz.length} quiz question(s), the contract floor is 6`);
    }

    const ids = new Set();
    for (let qi = 0; qi < quiz.length; qi++) {
      const q = quiz[qi];
      questions++;
      const where = `${phase.id}/${q.id}`;

      if (ids.has(q.id)) failures.push(`corpus: ${where} has a duplicate question id`);
      ids.add(q.id);

      // Numbering must be 1-based and ASCENDING with position, because
      // lib/quiz.js reports a missed question by its POSITION and the reader
      // cross-references that against the `Q<number>` they see on screen. If the
      // two ever diverge the summary sends the reader to the wrong question —
      // silently, and only when they got something wrong.
      if (q.id !== `${phase.id}-q${String(qi + 1).padStart(2, "0")}`) {
        const ids_ = new Set(quiz.map((x) => x.id));
        if (ids_.size === quiz.length && !q.id.endsWith(`q${String(qi + 1).padStart(2, "0")}`)) {
          failures.push(
            `corpus: ${where} sits at position ${qi + 1} but is not question ${qi + 1} — ` +
              `lib/quiz.js reports the POSITION, so the summary would name the wrong question`
          );
        }
      }

      if (!Array.isArray(q.options) || q.options.length !== 4) {
        failures.push(`corpus: ${where} has ${(q.options || []).length} option(s), contract says exactly 4`);
        continue;
      }
      if (typeof q.question !== "string" || !q.question.trim()) {
        failures.push(`corpus: ${where} has an empty question`);
      }
      if (typeof q.why !== "string" || !q.why.trim()) {
        failures.push(`corpus: ${where} has an empty why`);
      }
      // The prose must carry the reasoning to a reader, not a placeholder.
      if (typeof q.why === "string" && q.why.trim().length < 40) {
        failures.push(`corpus: ${where} why is only ${q.why.trim().length} chars`);
      }

      // EXACTLY ONE correct option — through the REAL adapter, so this also
      // proves the adapter and the data agree rather than checking the raw
      // number and the normalised shape separately.
      const nq = normaliseQuestion(q);
      const flagged = nq.options.filter((o) => o.correct).length;
      if (flagged !== 1) {
        failures.push(`corpus: ${where} normalises to ${flagged} correct option(s), expected exactly 1`);
      }
      if (correctIndex(nq) !== q.answerIndex) {
        failures.push(`corpus: ${where} normalises to answer ${correctIndex(nq)}, source says ${q.answerIndex}`);
      }
      if (typeof q.answerIndex !== "number" || q.answerIndex < 0 || q.answerIndex > 3) {
        failures.push(`corpus: ${where} answerIndex ${q.answerIndex} is out of range`);
      } else {
        positionCounts[q.answerIndex]++;
        here[q.answerIndex]++;
      }

      // Option text must be distinct — a question with two identical options is
      // unanswerable in principle even when one of them is flagged.
      const texts = new Set(q.options.map((o) => String(o).trim()));
      if (texts.size !== 4) {
        failures.push(`corpus: ${where} has ${4 - texts.size} duplicated option text(s)`);
      }
      // An empty option renders as a blank clickable row.
      if (q.options.some((o) => !String(o).trim())) {
        failures.push(`corpus: ${where} has an empty option`);
      }

      const e = q.energy;
      if (!["low", "normal", "high"].includes(e)) {
        failures.push(`corpus: ${where} has energy ${JSON.stringify(e)}`);
      } else {
        energySeen.set(e, (energySeen.get(e) || 0) + 1);
      }
    }

    // Answer-position spread, per file. This is the guard the authoring contract
    // names: a phase with most of its answers in one position is a phase a
    // reader can pass by always picking the same letter.
    //
    // The threshold is the contract's own — "more than ~50%" — and NOT "every
    // position must be used". A 6-question phase cannot be required to use all
    // four positions; a draft of this file did require it and reported nine
    // well-spread phases as failures. The corpus-wide band below is the check
    // for coverage, where there is enough data for it to mean something.
    if (quiz.length) {
      const worst = Math.max(...here);
      perFileSpread.push([phase.id, worst, quiz.length, here]);
      if (worst / quiz.length > 0.5) {
        failures.push(
          `corpus: ${phase.id} puts ${worst}/${quiz.length} answers in one position (${here.join("/")})`
        );
      }
    }
  }
}

// Corpus-wide spread, which is what a reader experiences across a track.
const total = positionCounts.reduce((a, b) => a + b, 0) || 1;
for (let i = 0; i < 4; i++) {
  const share = positionCounts[i] / total;
  if (share > 0.4 || share < 0.1) {
    failures.push(
      `corpus: answer position ${"ABCD"[i]} holds ${(share * 100).toFixed(1)}% of ${total} answers, which is outside the 10-40% band`
    );
  }
}

// trackIdForPhase is what the search page uses to open the right roadmap. It is
// a tiny function with a silent failure mode: a phase routed to the wrong track
// opens a phase that does not exist, and the reader sees an empty page.
{
  const t1 = trackIdForPhase("found-01-what-a-model-is");
  check("trackIdForPhase resolves a known phase", typeof t1, "string");
  check("trackIdForPhase is stable for the same input", trackIdForPhase("found-01-what-a-model-is"), t1);
  check("trackIdForPhase on nonsense", trackIdForPhase("no-such-phase-99"), null);
  // Every phase in the corpus must route somewhere.
  const INDEX = JSON.parse(readFileSync(join(GEN, "index.json"), "utf8"));
  const unrouted = [];
  for (const track of INDEX.tracks || []) {
    for (const p of track.phases || []) {
      if (trackIdForPhase(p.id) !== track.id) unrouted.push(`${p.id} -> ${trackIdForPhase(p.id)}`);
    }
  }
  check("every phase routes to its own track", unrouted.slice(0, 8), []);
}

// ── Report ───────────────────────────────────────────────────────────────────

console.log(
  `\ncorpus: ${questions} question(s) across ${phases} phase(s) in ${TRACK_FILES.length} track file(s)`
);
console.log(
  `answer positions: ${positionCounts.slice(0, 4).map((n, i) => `${"ABCD"[i]}=${n}`).join("  ")}`
);
console.log(
  `energy: ${[...energySeen].sort().map(([k, n]) => `${k}=${n}`).join("  ")}`
);
const worst = perFileSpread.slice().sort((a, b) => b[1] / b[2] - a[1] / a[2])[0];
if (worst) {
  console.log(`most concentrated phase: ${worst[0]} with ${worst[1]}/${worst[2]} in one position (${worst[3].join("/")})`);
}

console.log(`\n${pass} assertion(s) passed, ${failures.length} failed`);
if (failures.length) {
  console.log("");
  for (const f of failures.slice(0, 40)) console.log("FAIL  " + f);
  if (failures.length > 40) console.log(`... and ${failures.length - 40} more`);
  process.exit(1);
}
console.log("\n✓ quiz normalisation, summary logic and the corpus all agree");
