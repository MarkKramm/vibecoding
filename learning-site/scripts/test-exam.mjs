// Tests for section exams.
//
// The scoring path is the one place in this codebase that produces a number a reader
// is judged by, so it is tested harder than anything else here. The dangerous failure
// is not a crash — it is a WRONG SCORE that still looks plausible: shuffle the options
// without moving the answer index and every question is marked against the wrong
// option, producing a believable mark and a confident, incorrect verdict.
import {
  PASS_MARK,
  timeLimitFor,
  shuffleOptions,
  buildExam,
  gradeExam,
  resultText,
  weakPhases,
  secondsLeft,
  formatClock,
} from "../src/lib/exam.js";
import { poolFrom, seededRng } from "../src/lib/practice.js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GEN = join(HERE, "..", "src", "data", "generated");
const ROADMAPS_SRC = readFileSync(join(HERE, "..", "src", "data", "roadmaps.js"), "utf8");

let pass = 0;
const fails = [];
function check(name, cond, detail) {
  if (cond) pass++;
  else fails.push(detail ? `${name} — ${detail}` : name);
}

// Mirror of the app's normaliser, pinned against its source — see test-practice.mjs
// for why this is mirrored rather than imported.
check("normaliseQuestion still maps options to {text, correct}", /options:\s*\(q\.options\s*\|\|\s*\[\]\)\.map\(\(text,\s*i\)\s*=>\s*\(\{[\s\S]{0,80}?text,[\s\S]{0,40}?correct:/.test(ROADMAPS_SRC));
function mirrorPhase(phase) {
  const answerIndex = (q) => (typeof q.answerIndex === "number" ? q.answerIndex : -1);
  return {
    ...phase,
    quiz: (phase.quiz || []).map((q) => ({
      id: q.id,
      question: q.question,
      energy: q.energy,
      options: (q.options || []).map((text, i) => ({ text, correct: i === answerIndex(q) })),
      explanation: q.why || "",
    })),
  };
}

// The real corpus, in the shape the app sees.
const index = JSON.parse(readFileSync(join(GEN, "index.json"), "utf8"));
const tracks = index.tracks.map((t) => {
  const full = JSON.parse(readFileSync(join(GEN, `${t.id}.json`), "utf8"));
  return { id: t.id, label: t.label, phases: full.phases.map(mirrorPhase) };
});
const pools = tracks.map((t) => ({ track: t, pool: poolFrom(t.phases, t.id, t.label) }));
const everything = pools.flatMap((p) => p.pool);

// ---------------------------------------------------------------------------
// 1. shuffleOptions — the corruption risk.
// ---------------------------------------------------------------------------
check(
  "shuffling preserves the exact multiset of options",
  (() => {
    const opts = ["a", "b", "c", "d"];
    const s = shuffleOptions(opts, 1, seededRng(3));
    return s.options.length === 4 && [...s.options].sort().join("") === "abcd";
  })()
);

check(
  "the correct option is TRACKED through the shuffle",
  (() => {
    // Across many seeds, the text at the new answerIndex must always be the text
    // that was originally correct. This is the assertion that catches the
    // plausible-wrong-score bug described at the top of this file.
    const opts = ["wrong-1", "RIGHT", "wrong-2", "wrong-3"];
    for (let s = 0; s < 300; s++) {
      const out = shuffleOptions(opts, 1, seededRng(s + 1));
      if (out.options[out.answerIndex] !== "RIGHT") return false;
    }
    return true;
  })(),
  "every question would be marked against the wrong option"
);

check(
  "the answer index actually moves for some seeds",
  (() => {
    const opts = ["w1", "RIGHT", "w2", "w3"];
    const seen = new Set();
    for (let s = 0; s < 60; s++) seen.add(shuffleOptions(opts, 1, seededRng(s + 1)).answerIndex);
    return seen.size > 1;
  })(),
  "a no-op shuffle would let a reader memorise answer positions"
);

check("shuffling a 2-option set works", (() => {
  const out = shuffleOptions(["no", "yes"], 1, seededRng(5));
  return out.options[out.answerIndex] === "yes";
})());
check("shuffling a 1-option set works", (() => {
  const out = shuffleOptions(["only"], 0, seededRng(5));
  return out.answerIndex === 0 && out.options[0] === "only";
})());
check("an empty option list yields answerIndex -1", shuffleOptions([], 0, seededRng(1)).answerIndex === -1);

// ---------------------------------------------------------------------------
// 2. timeLimitFor.
// ---------------------------------------------------------------------------
check("a small exam gets at least 10 minutes", timeLimitFor(4) === 10, `got ${timeLimitFor(4)}`);
check("time scales with question count", timeLimitFor(82) > timeLimitFor(24));
check("time is always a whole multiple of 5", [1, 7, 24, 46, 58, 82, 200].every((n) => timeLimitFor(n) % 5 === 0));
check("the largest real track fits in a sensible sitting", timeLimitFor(82) <= 90, `got ${timeLimitFor(82)}`);
check("zero questions still yields a positive limit", timeLimitFor(0) > 0);

// ---------------------------------------------------------------------------
// 3. buildExam against the real corpus.
// ---------------------------------------------------------------------------
for (const { track, pool } of pools) {
  const exam = buildExam(everything, track.id, track.label, seededRng(9));

  check(`${track.id}: exam covers the WHOLE track`, exam.total === pool.length, `${exam.total} of ${pool.length}`);
  check(
    `${track.id}: every question appears exactly once`,
    new Set(exam.questions.map((q) => q.id)).size === exam.total
  );
  check(
    `${track.id}: the exam contains only this track's questions`,
    exam.questions.every((q) => q.trackId === track.id)
  );
  check(
    `${track.id}: every question still has exactly one correct option`,
    exam.questions.every((q) => q.answerIndex >= 0 && q.answerIndex < q.options.length)
  );
  check(
    `${track.id}: option text survived the shuffle intact`,
    exam.questions.every((q) => q.options.every((o) => typeof o === "string" && o.length > 0))
  );
  check(`${track.id}: a pass mark is attached`, exam.passMark === PASS_MARK);
  check(`${track.id}: a time limit is attached`, exam.timeLimitMinutes >= 10);
}

// Ordering must genuinely differ between two builds.
const e1 = buildExam(everything, "rag", "RAG", seededRng(1));
const e2 = buildExam(everything, "rag", "RAG", seededRng(2));
check(
  "two exams of the same track differ in order",
  JSON.stringify(e1.questions.map((q) => q.id)) !== JSON.stringify(e2.questions.map((q) => q.id))
);
check("the same seed rebuilds the same exam", (() => {
  const a = buildExam(everything, "rag", "RAG", seededRng(7));
  const b = buildExam(everything, "rag", "RAG", seededRng(7));
  return JSON.stringify(a.questions.map((q) => q.id)) === JSON.stringify(b.questions.map((q) => q.id)) &&
    a.questions.every((q, i) => q.answerIndex === b.questions[i].answerIndex);
})());

check("an unknown track yields an empty exam, not an error", buildExam(everything, "nope", "Nope", seededRng(1)).total === 0);
check("a null question list yields an empty exam", buildExam(null, "rag", "RAG", seededRng(1)).total === 0);

// The exam must still be gradeable against the ORIGINAL answers after shuffling —
// this is the end-to-end version of the corruption check.
check(
  "scoring a perfect paper built from shuffled answers gives 100%",
  (() => {
    for (const { track } of pools) {
      const exam = buildExam(everything, track.id, track.label, seededRng(4));
      const answers = {};
      for (const q of exam.questions) answers[q.id] = q.answerIndex;
      const g = gradeExam(exam, answers);
      if (g.correct !== g.total || g.percent !== 100 || !g.passed) return false;
    }
    return true;
  })(),
  "shuffling the options without carrying the answer would fail here"
);

// ---------------------------------------------------------------------------
// 4. gradeExam.
// ---------------------------------------------------------------------------
const exam = buildExam(everything, "agents", "Agents", seededRng(11));
const allRight = {};
const allWrong = {};
const none = {};
exam.questions.forEach((q, i) => {
  allRight[q.id] = q.answerIndex;
  allWrong[q.id] = (q.answerIndex + 1) % q.options.length;
  if (i % 2 === 0) none[q.id] = q.answerIndex; // half answered
});

const gRight = gradeExam(exam, allRight);
check("all correct: 100%", gRight.percent === 100, `got ${gRight.percent}`);
check("all correct: passed", gRight.passed === true);
check("all correct: nothing missed", gRight.missed.length === 0);
check("all correct: total is the exam size", gRight.total === exam.total);

const gWrong = gradeExam(exam, allWrong);
check("all wrong: 0%", gWrong.percent === 0, `got ${gWrong.percent}`);
check("all wrong: not passed", gWrong.passed === false);
check("all wrong: every question missed", gWrong.missed.length === exam.total);
check("all wrong: missed entries name the phase", gWrong.missed.every((m) => m.phaseId && m.phaseTitle));

const gNone = gradeExam(exam, {});
check("unanswered counts as WRONG, not as absent", gNone.correct === 0, "otherwise leaving blanks would be a strategy");
check("unanswered still counts in the denominator", gNone.total === exam.total);
check("unanswered reported separately", gNone.answered === 0);
check("unanswered: not passed", gNone.passed === false);

const gHalf = gradeExam(exam, none);
check("half answered half right: answered counted", gHalf.answered === Math.ceil(exam.total / 2), `got ${gHalf.answered}`);
check("half: correct counted", gHalf.correct === Math.ceil(exam.total / 2));
check("results cover every question", gHalf.results.length === exam.total);
check(
  "missed = total - correct",
  gHalf.missed.length === gHalf.total - gHalf.correct
);

// Answer index 0 is a legitimate answer, not "unanswered".
check("choosing option A registers as answered", (() => {
  const q = exam.questions.find((x) => x.answerIndex === 0);
  if (!q) return true; // no such question in this seed; other seeds cover it
  const g = gradeExam({ questions: [q], passMark: PASS_MARK }, { [q.id]: 0 });
  return g.answered === 1 && g.correct === 1;
})());

// Score arithmetic across every possible count — an off-by-one in the rounding
// would mis-state a reader's mark.
check("percent is exact for every possible score", (() => {
  for (let total = 1; total <= 60; total++) {
    for (let correct = 0; correct <= total; correct++) {
      const qs = Array.from({ length: total }, (_, i) => ({
        id: "q" + i, answerIndex: 0, options: ["a", "b"], phaseId: "p", phaseTitle: "P", why: "w",
      }));
      const answers = {};
      qs.forEach((q, i) => { answers[q.id] = i < correct ? 0 : 1; });
      const gg = gradeExam({ questions: qs, passMark: PASS_MARK }, answers);
      if (gg.correct !== correct) return false;
      if (gg.percent !== Math.round((correct / total) * 100)) return false;
      if (gg.passed !== (correct / total >= PASS_MARK)) return false;
    }
  }
  return true;
})());

// The pass boundary itself, exactly.
check("exactly at the pass mark passes", (() => {
  const n = 10;
  const qs = Array.from({ length: n }, (_, i) => ({ id: "b" + i, answerIndex: 0, options: ["a", "b"], phaseId: "p", phaseTitle: "P", why: "w" }));
  const ex = { questions: qs, passMark: 0.8 };
  const ans = {};
  qs.forEach((q, i) => { ans[q.id] = i < 8 ? 0 : 1; });
  const g = gradeExam(ex, ans);
  return g.correct === 8 && g.percent === 80 && g.passed === true;
})(), "8/10 must pass when the mark is 80%");

check("one below the pass mark fails", (() => {
  const qs = Array.from({ length: 10 }, (_, i) => ({ id: "c" + i, answerIndex: 0, options: ["a", "b"], phaseId: "p", phaseTitle: "P", why: "w" }));
  const ex = { questions: qs, passMark: 0.8 };
  const ans = {};
  qs.forEach((q, i) => { ans[q.id] = i < 7 ? 0 : 1; });
  return gradeExam(ex, ans).passed === false;
})());

// An exam with no questions must not divide by zero or claim a pass.
check("an empty exam does not pass", gradeExam({ questions: [], passMark: PASS_MARK }, {}).passed === false);
check("an empty exam is 0%", gradeExam({ questions: [], passMark: PASS_MARK }, {}).percent === 0);
check("gradeExam tolerates null", gradeExam(null, null).passed === false);

// ---------------------------------------------------------------------------
// 5. resultText.
// ---------------------------------------------------------------------------
check("passing text states the score", /Passed/.test(resultText(gRight)) && /100%/.test(resultText(gRight)));
check("failing text states the score", /Not passed/.test(resultText(gWrong)) && /0%/.test(resultText(gWrong)));
check("failing text says how many more are needed", /\d+ more correct answers/.test(resultText(gWrong)), resultText(gWrong));
check("a one-question gap is phrased in the singular", (() => {
  const qs = Array.from({ length: 10 }, (_, i) => ({ id: "d" + i, answerIndex: 0, options: ["a", "b"], phaseId: "p", phaseTitle: "P", why: "w" }));
  const ans = {};
  qs.forEach((q, i) => { ans[q.id] = i < 7 ? 0 : 1; });
  return /one more correct answer/.test(resultText(gradeExam({ questions: qs, passMark: 0.8 }, ans)));
})(), "7/10 needs exactly one more");
check("empty exam text is safe", resultText(null) === "No questions in this exam.");

// ---------------------------------------------------------------------------
// 6. weakPhases.
// ---------------------------------------------------------------------------
check("weakPhases ranks by how many were missed", (() => {
  const w = weakPhases(gWrong);
  return w.length > 0 && w.every((x, i) => i === 0 || w[i - 1].missed >= x.missed);
})());
check("weakPhases counts every miss", weakPhases(gWrong).reduce((n, x) => n + x.missed, 0) === gWrong.missed.length);
check("weakPhases is empty for a perfect paper", weakPhases(gRight).length === 0);
check("weakPhases tolerates null", weakPhases(null).length === 0);

// ---------------------------------------------------------------------------
// 7. Clock helpers.
// ---------------------------------------------------------------------------
check("secondsLeft counts down", secondsLeft(10000, 4000) === 6);
check("secondsLeft never goes negative", secondsLeft(1000, 99999) === 0);
check("formatClock renders m:ss", formatClock(65) === "1:05", formatClock(65));
check("formatClock pads seconds", formatClock(9) === "0:09");
check("formatClock handles zero", formatClock(0) === "0:00");
check("formatClock handles negative input", formatClock(-5) === "0:00");
check("formatClock handles null", formatClock(null) === "0:00");

// ---------------------------------------------------------------------------
// 8. Every track is actually examinable.
// ---------------------------------------------------------------------------
for (const { track, pool } of pools) {
  check(`${track.id}: at least 20 questions to examine`, pool.length >= 20, `only ${pool.length}`);
  const ex = buildExam(everything, track.id, track.label, seededRng(2));
  const g = gradeExam(ex, {});
  check(`${track.id}: an all-blank paper scores 0 and fails`, g.percent === 0 && !g.passed);
  const wr = {};
  ex.questions.forEach((q) => { wr[q.id] = q.answerIndex; });
  check(`${track.id}: a perfect paper passes`, gradeExam(ex, wr).passed === true);
}

// ---------------------------------------------------------------------------
// 9. Recording results, and carrying them through a backup.
//
// The worst failure this feature can have is SILENTLY LOSING A PASS: the reader
// restores a backup, sees their results unchanged, and concludes the backup was
// empty. So both the recording rule and the merge rule are asserted directly.
// ---------------------------------------------------------------------------
const { applyAttempt } = await import("../src/hooks/useExamResults.js");
const { mergeValue, KEYS } = await import("../src/lib/transfer.js");

check(
  "the exam key is registered for backup",
  KEYS.some((k) => k.key === "vibecoding:exams:v1"),
  "an unregistered key is silently dropped from every backup"
);

const gradeA = { percent: 60, correct: 30, total: 50, passed: false };
const gradeB = { percent: 92, correct: 46, total: 50, passed: true };

const first = applyAttempt({}, "rag", gradeA, "2026-01-01T00:00:00Z");
check("a first attempt is recorded", first.rag.attempts === 1 && first.rag.best.percent === 60);
check("a first attempt keeps its timestamp", first.rag.best.at === "2026-01-01T00:00:00Z");

const second = applyAttempt(first, "rag", gradeB, "2026-01-02T00:00:00Z");
check("a better result replaces the best", second.rag.best.percent === 92 && second.rag.best.passed === true);
check("attempts accumulate", second.rag.attempts === 2);

const third = applyAttempt(second, "rag", gradeA, "2026-01-03T00:00:00Z");
check(
  "a WORSE later result does not overwrite a pass",
  third.rag.best.percent === 92 && third.rag.best.passed === true,
  "otherwise retaking to practise could cost the reader their pass"
);
check("a worse later result still counts as an attempt", third.rag.attempts === 3);

check("the best result keeps the EARLIER date on a tie", (() => {
  const a = applyAttempt({}, "x", { percent: 80, correct: 8, total: 10, passed: true }, "2026-01-01T00:00:00Z");
  const b = applyAttempt(a, "x", { percent: 80, correct: 8, total: 10, passed: true }, "2026-02-01T00:00:00Z");
  return b.x.best.at === "2026-01-01T00:00:00Z";
})());
check("separate tracks are independent", (() => {
  const a = applyAttempt(applyAttempt({}, "rag", gradeA), "agents", gradeB);
  return a.rag.best.percent === 60 && a.agents.best.percent === 92;
})());
check("applyAttempt tolerates a null previous value", applyAttempt(null, "rag", gradeA).rag.attempts === 1);

// The merge — this is what a restore actually calls.
const local = { rag: { best: { percent: 92, passed: true, at: "2026-01-02T00:00:00Z" }, attempts: 2 } };
const remote = { rag: { best: { percent: 60, passed: false, at: "2026-01-01T00:00:00Z" }, attempts: 1 } };

const merged = mergeValue("vibecoding:exams:v1", local, remote);
check(
  "a restore does NOT discard a local pass",
  merged.rag.best.percent === 92 && merged.rag.best.passed === true,
  "the default merge branch returns `current`, so a missing case silently drops passes from the backup"
);
check("a restore does not lose the incoming attempt count", merged.rag.attempts === 3);

const mergedUp = mergeValue("vibecoding:exams:v1", remote, local);
check("a HIGHER incoming score wins when this machine is behind", mergedUp.rag.best.percent === 92 && mergedUp.rag.best.passed === true);

check("a track present only locally survives", mergeValue("vibecoding:exams:v1", local, {}).rag.best.percent === 92);
check("a track present only in the backup is taken", mergeValue("vibecoding:exams:v1", {}, remote).rag.best.percent === 60);
check("importing the same backup twice changes nothing", (() => {
  const once = mergeValue("vibecoding:exams:v1", local, remote);
  const twice = mergeValue("vibecoding:exams:v1", once, remote);
  return twice.rag.best.percent === once.rag.best.percent;
})(), "except the attempt count, which is a sum of events and is allowed to grow");
check("mergeValue tolerates empty maps", Object.keys(mergeValue("vibecoding:exams:v1", {}, {})).length === 0);

// The validator: a malformed record must be REFUSED, not imported as a pass.
const examEntry = KEYS.find((k) => k.key === "vibecoding:exams:v1");
check("a well-formed record validates", examEntry.check({ rag: { best: { percent: 92, passed: true, at: "x" }, attempts: 1 } }));
check("a record with no best is refused", !examEntry.check({ rag: { attempts: 1 } }));
check("a record with a non-numeric percent is refused", !examEntry.check({ rag: { best: { percent: "92", passed: true }, attempts: 1 } }));
check("a record with percent out of range is refused", !examEntry.check({ rag: { best: { percent: 140, passed: true }, attempts: 1 } }));
check("a record without a passed flag is refused", !examEntry.check({ rag: { best: { percent: 92 }, attempts: 1 } }));
check("a record with zero attempts is refused", !examEntry.check({ rag: { best: { percent: 92, passed: true }, attempts: 0 } }));
check("an array is refused", !examEntry.check([]));
check("null is refused", !examEntry.check(null));

// ---------------------------------------------------------------------------
console.log(`\n  ${pass} assertion(s) passed, ${fails.length} failed`);
if (fails.length) {
  console.log("");
  for (const f of fails) console.log(`  \u2716 ${f}`);
  process.exit(1);
}
