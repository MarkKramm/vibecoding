// Tests for the mixed practice set.
//
// Most of these run against the REAL corpus, not fixtures, for the same reason the
// search tests do: a fixture proves the logic works on data shaped the way I
// imagined it, and the shipped failures in this project have all been shape
// mismatches between what a component assumed and what the pipeline emits.
import {
  poolFrom,
  normaliseQuestionShape,
  filterPool,
  buildSet,
  seededRng,
  summarise,
  summariseText,
  ENERGIES,
} from "../src/lib/practice.js";
// THE REAL NORMALISER — by way of its SOURCE, not an import.
//
// `data/roadmaps.js` imports the generated JSON, and Node refuses a JSON import
// without an import attribute while Vite allows it. So this file cannot import the
// module directly.
//
// That is not a reason to give up on testing the app's shape, which is the whole
// point of the fix here. Instead the normaliser's BEHAVIOUR is reimplemented below
// and, separately, its SOURCE is read and asserted to still do what this
// reimplementation assumes. If someone changes `normaliseQuestion`, the source
// assertion fails and points at this file.
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

// ---------------------------------------------------------------------------
// 0a. Pin the normaliser this file mirrors.
// ---------------------------------------------------------------------------
check(
  "normaliseQuestion still maps options to {text, correct}",
  /options:\s*\(q\.options\s*\|\|\s*\[\]\)\.map\(\(text,\s*i\)\s*=>\s*\(\{[\s\S]{0,80}?text,[\s\S]{0,40}?correct:/.test(ROADMAPS_SRC),
  "roadmaps.js changed shape — update mirrorQuestion below, and this file's assumptions"
);
check(
  "normaliseQuestion still renames `why` to `explanation`",
  /explanation:\s*q\.why/.test(ROADMAPS_SRC),
  "the app reads q.options.explanation; if this rename moved, the explanation tests are testing the wrong field"
);
check(
  "normaliseQuestion still drops answerIndex in favour of `correct`",
  /answerIndex/.test(ROADMAPS_SRC) && /correct:\s*i\s*===\s*answerIndex/.test(ROADMAPS_SRC),
  "the answer is encoded per-option now; a bare answerIndex would mean the app shape changed back"
);

/** A faithful mirror of `normaliseQuestion`, verified against its source above. */
function mirrorQuestion(q) {
  const answerIndex = typeof q.answerIndex === "number" ? q.answerIndex : -1;
  return {
    id: q.id,
    question: q.question,
    energy: q.energy,
    options: (q.options || []).map((text, i) => ({ text, correct: i === answerIndex })),
    explanation: q.why || "",
  };
}
function mirrorPhase(phase) {
  return { ...phase, quiz: (phase.quiz || []).map(mirrorQuestion) };
}

// ---------------------------------------------------------------------------
// The real corpus, IN THE SHAPE THE APP SEES IT.
//
// ⚠️ This is the fix for the bug that crashed the feature on first render. The
// first version of this file read the generated JSON directly, so its 91 passing
// assertions described a shape the app never encounters: `options` as an array of
// STRINGS with an `answerIndex`, where the app is handed `options` as
// `[{text, correct}]` and the explanation renamed to `explanation`.
//
// Every assertion passed. The view threw React error #31 immediately. The tests
// agreed with the bug because they read the same file the bug did.
//
// So the pool is now built from `normalisePhase(...)`, which is exactly what
// `loadTrackPhases` does before any component sees a phase.
// ---------------------------------------------------------------------------
const index = JSON.parse(readFileSync(join(GEN, "index.json"), "utf8"));
const tracks = index.tracks.map((t) => {
  const full = JSON.parse(readFileSync(join(GEN, `${t.id}.json`), "utf8"));
  return { id: t.id, label: t.label, phases: full.phases.map(mirrorPhase) };
});

const pools = tracks.map((t) => ({ track: t, pool: poolFrom(t.phases, t.id, t.label) }));
const everything = pools.flatMap((p) => p.pool);

// ---------------------------------------------------------------------------
// 0. The shape contract itself — the assertions that would have caught the crash.
// ---------------------------------------------------------------------------
check(
  "the app's phase shape really does differ from the generated files",
  (() => {
    const raw = JSON.parse(readFileSync(join(GEN, "foundations.json"), "utf8"));
    const rawQ = raw.phases[0].quiz[0];
    const normQ = mirrorPhase(raw.phases[0]).quiz[0];
    return typeof rawQ.options[0] === "string" && typeof normQ.options[0] === "object";
  })(),
  "if these ever converge, this whole section can go — but until then, assuming the wrong one crashes the view"
);

check(
  "poolFrom handles the NORMALISED shape (what the app passes)",
  (() => {
    const p = poolFrom(tracks[0].phases, "foundations", "Foundations");
    return p.length > 0 && p.every((q) => typeof q.options[0] === "string" && q.options.length === 4);
  })(),
  "options must come out as strings, or React renders an object and throws #31"
);

check(
  "poolFrom ALSO handles the raw generated shape",
  (() => {
    const raw = JSON.parse(readFileSync(join(GEN, "foundations.json"), "utf8"));
    const p = poolFrom(raw.phases, "foundations", "Foundations");
    return p.length > 0 && p.every((q) => typeof q.options[0] === "string" && q.options.length === 4);
  })(),
  "accepting both shapes is deliberate; a helper that assumes one is how this broke"
);

check(
  "every pooled question has a string `why` (the app's `explanation` field)",
  everything.every((q) => typeof q.why === "string" && q.why.length > 0),
  `${everything.filter((q) => !q.why).length} empty — the phase quiz reads q.options.explanation, so an empty why here renders a blank explanation`
);

check(
  "no pooled option is ever an object",
  everything.every((q) => q.options.every((o) => typeof o === "string")),
  "an object in options is exactly what produced React error #31"
);

// The two shapes must produce the SAME pool, or one of the two paths is wrong.
check(
  "both shapes yield the same questions and the same answers",
  (() => {
    const raw = JSON.parse(readFileSync(join(GEN, "foundations.json"), "utf8"));
    const fromRaw = poolFrom(raw.phases, "f", "F");
    const fromNorm = poolFrom(raw.phases.map(mirrorPhase), "f", "F");
    if (fromRaw.length !== fromNorm.length) return false;
    return fromRaw.every((q, i) => q.id === fromNorm[i].id && q.answerIndex === fromNorm[i].answerIndex && q.why === fromNorm[i].why);
  })(),
  "a divergence means one path is silently marking the wrong option"
);

// normaliseQuestionShape itself, on deliberate input.
const normShaped = normaliseQuestionShape({
  id: "x-q1",
  question: "Q?",
  energy: "low",
  options: [{ text: "a", correct: false }, { text: "b", correct: true }, { text: "c", correct: false }, { text: "d", correct: false }],
  explanation: "because b",
});
check("normalised shape: answer index recovered", normShaped && normShaped.answerIndex === 1);
check("normalised shape: explanation renamed to why", normShaped && normShaped.why === "because b");

const rawShaped = normaliseQuestionShape({
  id: "x-q2", question: "Q?", energy: "low", options: ["a", "b", "c", "d"], answerIndex: 3, why: "because d",
});
check("raw shape: answer index read", rawShaped && rawShaped.answerIndex === 3);
check("raw shape: why read", rawShaped && rawShaped.why === "because d");

check("a question with NO correct option is dropped, not guessed", normaliseQuestionShape({
  id: "x-q3", options: [{ text: "a", correct: false }, { text: "b", correct: false }],
}) === null);
check("a question with TWO correct options is dropped", normaliseQuestionShape({
  id: "x-q4", options: [{ text: "a", correct: true }, { text: "b", correct: true }],
}) === null, "findIndex would silently take the first, marking a defensible second answer wrong");
check("an out-of-range answerIndex is dropped", normaliseQuestionShape({ id: "x-q5", options: ["a", "b"], answerIndex: 9 }) === null);
check("an empty option list is dropped", normaliseQuestionShape({ id: "x-q6", options: [] }) === null);
check("a null question is dropped", normaliseQuestionShape(null) === null);
check("a question with no id is dropped", normaliseQuestionShape({ options: ["a"], answerIndex: 0 }) === null);
check("a question with a blank option is dropped", normaliseQuestionShape({ id: "x-q7", options: ["a", ""], answerIndex: 0 }) === null);

// ---------------------------------------------------------------------------
// 1. Pool construction against the real corpus.
// ---------------------------------------------------------------------------
check("the corpus yields 549 questions", everything.length === 549, `got ${everything.length}`);

check(
  "every pooled question is complete",
  everything.every(
    (q) =>
      q.id &&
      typeof q.question === "string" &&
      q.question.length > 0 &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      Number.isInteger(q.answerIndex) &&
      q.answerIndex >= 0 &&
      q.answerIndex <= 3 &&
      typeof q.why === "string" &&
      q.why.length > 0
  ),
  `${everything.filter((q) => q.options.length !== 4).length} not-4-option`
);

check(
  "every pooled question carries its origin",
  everything.every((q) => q.phaseId && q.trackId && q.phaseTitle && q.trackLabel)
);

check(
  "question ids are unique across the whole corpus",
  new Set(everything.map((q) => q.id)).size === everything.length,
  `${everything.length - new Set(everything.map((q) => q.id)).size} duplicate(s)`
);

// Question ids use the SHORT phase prefix (`found-01-q01`) while `phase.id` is the
// full slug (`found-01-what-a-model-is`). That is the documented convention in
// AGENTS.md, and an earlier version of this assertion demanded the full slug and so
// failed 59 times against correct data. What actually matters for the "go and reread
// this" link is that the prefix identifies exactly ONE phase — so that is what is
// tested, rather than the spelling of the prefix.
const prefixToPhases = new Map();
for (const q of everything) {
  const short = q.id.replace(/-q\d+$/, "");
  if (!prefixToPhases.has(short)) prefixToPhases.set(short, new Set());
  prefixToPhases.get(short).add(q.phaseId);
}
const ambiguous = [...prefixToPhases.entries()].filter(([, s]) => s.size > 1);
check(
  "every question id maps to exactly one phase",
  ambiguous.length === 0,
  `ambiguous: ${ambiguous.slice(0, 3).map(([k]) => k).join(", ")}`
);
check(
  "there are as many id prefixes as phases",
  prefixToPhases.size === 65,
  `${prefixToPhases.size} prefixes for 65 phases`
);

check(
  "every energy is in the known vocabulary",
  everything.every((q) => ENERGIES.includes(q.energy)),
  `unexpected: ${[...new Set(everything.map((q) => q.energy))].filter((e) => !ENERGIES.includes(e)).join(", ")}`
);

// The pool must cover EVERY track. A pool that quietly dropped a track would still
// look healthy — hundreds of questions, all valid — while a whole subject silently
// vanished from practice. This is the assertion that catches that.
check(
  "the pool spans all 10 tracks",
  new Set(everything.map((q) => q.trackId)).size === tracks.length,
  `${new Set(everything.map((q) => q.trackId)).size} of ${tracks.length}`
);

check(
  "the pool spans all 65 phases",
  new Set(everything.map((q) => q.phaseId)).size === 65,
  `${new Set(everything.map((q) => q.phaseId)).size} of 65`
);

// ---------------------------------------------------------------------------
// 2. Filtering.
// ---------------------------------------------------------------------------
const oneTrack = filterPool(everything, { trackId: "foundations" });
check("filtering by track narrows the pool", oneTrack.length === 82, `got ${oneTrack.length}`);
check("filtering by track keeps only that track", oneTrack.every((q) => q.trackId === "foundations"));

check(
  "an unknown track yields nothing, not everything",
  filterPool(everything, { trackId: "no-such-track" }).length === 0,
  "falling back to the whole pool would silently ignore the scope"
);

check("no filter returns the whole pool", filterPool(everything, {}).length === 549);
check("null options are safe", filterPool(everything).length === 549);
check("a null pool is safe", filterPool(null, {}).length === 0);

// energy is a CEILING, not an equality match.
const lowOnly = filterPool(everything, { energy: "low" });
const normalUp = filterPool(everything, { energy: "normal" });
const highUp = filterPool(everything, { energy: "high" });

check("energy=low keeps only low", lowOnly.every((q) => q.energy === "low"));
check(
  "energy=normal means 'low or normal', not 'normal only'",
  normalUp.every((q) => q.energy === "low" || q.energy === "normal") &&
    normalUp.length > lowOnly.length,
  "a ceiling, not an equality match"
);
check("energy=high is the unfiltered pool", highUp.length === 549, `got ${highUp.length}`);
check("energy filters nest", lowOnly.length < normalUp.length && normalUp.length <= highUp.length);
check("an unknown energy does not filter", filterPool(everything, { energy: "nonsense" }).length === 549);

const scoped = filterPool(everything, { trackId: "rag", energy: "low" });
check("scope and energy compose", scoped.length > 0 && scoped.every((q) => q.trackId === "rag" && q.energy === "low"));

// ---------------------------------------------------------------------------
// 3. buildSet — size, uniqueness, determinism.
// ---------------------------------------------------------------------------
const rngA = seededRng(12345);
const setA = buildSet(everything, 20, rngA);
check("buildSet returns the requested size", setA.length === 20, `got ${setA.length}`);
check("buildSet draws without replacement", new Set(setA.map((q) => q.id)).size === 20);

const setB = buildSet(everything, 20, seededRng(12345));
check(
  "the same seed produces the same set",
  JSON.stringify(setA.map((q) => q.id)) === JSON.stringify(setB.map((q) => q.id))
);

const setC = buildSet(everything, 20, seededRng(999));
check(
  "a different seed produces a different order",
  JSON.stringify(setA.map((q) => q.id)) !== JSON.stringify(setC.map((q) => q.id))
);

const first20 = everything.slice(0, 20).map((q) => q.id);
const shuffledIds = setA.map((q) => q.id);
check(
  "the set is genuinely shuffled, not the first N in order",
  JSON.stringify(shuffledIds) !== JSON.stringify(first20),
  "an unshuffled set would test one phase's questions in authoring order"
);

// Asking for more than exists must not pad, duplicate or throw.
const oversize = buildSet(everything, 5000, seededRng(1));
check("oversize returns the whole pool", oversize.length === 549, `got ${oversize.length}`);
check("oversize does not duplicate", new Set(oversize.map((q) => q.id)).size === 549);

check("size 0 returns nothing", buildSet(everything, 0, seededRng(1)).length === 0);
check("a negative size returns nothing", buildSet(everything, -5, seededRng(1)).length === 0);
check("a non-numeric size returns nothing", buildSet(everything, "abc", seededRng(1)).length === 0);
check("an empty pool is safe", buildSet([], 10, seededRng(1)).length === 0);
check("a null pool is safe", buildSet(null, 10, seededRng(1)).length === 0);

// A set sampled from one track must contain only that track.
const ragSet = buildSet(filterPool(everything, { trackId: "rag" }), 15, seededRng(7));
check("a scoped set stays in scope", ragSet.every((q) => q.trackId === "rag"));

// Sampling should reach broadly, and this assertion originally demanded too much.
//
// It required a 30-question draw to span all 10 tracks in 20 of 40 seeds. The real
// figure is ~44%, and that is CORRECT arithmetic rather than a biased shuffle: the
// two smallest tracks (safety-career 30 questions, career 24) are missed by a
// 30-draw sample 18% and 25% of the time respectively, so "all ten present" cannot
// exceed about 48%. Verified independently — a log-space hypergeometric calculation
// gives 47.8% theoretical against 43.8% observed over 2000 seeds, which is within
// sampling noise for an unbiased partial Fisher-Yates.
//
// So the check now asserts what actually matters and is actually decidable: that a
// set of 30 draws from 549 spreads across MANY tracks rather than clustering. A
// clustering bug would show as 2-3 tracks per set, not 8-9.
let trackCounts = [];
for (let s = 0; s < 40; s++) {
  const st = buildSet(everything, 30, seededRng(s + 1));
  trackCounts.push(new Set(st.map((q) => q.trackId)).size);
}
const avgTracks = trackCounts.reduce((a, b) => a + b, 0) / trackCounts.length;
check(
  "a 30-question set averages most of the tracks",
  avgTracks >= 7.5,
  `averaged ${avgTracks.toFixed(1)} tracks; clustering would look like 2-3`
);
check(
  "no single draw collapses to a handful of tracks",
  Math.min(...trackCounts) >= 5,
  `worst draw spanned only ${Math.min(...trackCounts)} tracks`
);

// THE THIN TRACKS ARE REACHABLE. safety-career and career are small enough that a
// short set can legitimately miss them, but a 200-question set cannot — and if it
// did, the sampling would be ignoring part of the corpus.
const big = buildSet(everything, 200, seededRng(11));
check(
  "a 200-question set provably spans every track",
  new Set(big.map((q) => q.trackId)).size === tracks.length,
  `${new Set(big.map((q) => q.trackId)).size} of ${tracks.length}`
);
check(
  "a 200-question set still has no duplicates",
  new Set(big.map((q) => q.id)).size === 200
);

// ---------------------------------------------------------------------------
// 4. summarise — and the ABSENCE of a score.
// ---------------------------------------------------------------------------
const sample = buildSet(everything, 10, seededRng(42));
const allRight = {};
const allWrong = {};
const halfRight = {};
sample.forEach((q, i) => {
  allRight[q.id] = q.answerIndex;
  allWrong[q.id] = (q.answerIndex + 1) % 4;
  if (i < 5) halfRight[q.id] = q.answerIndex;
  else halfRight[q.id] = (q.answerIndex + 1) % 4;
});

const sRight = summarise(sample, allRight);
check("all correct: counted", sRight.correct === 10, `got ${sRight.correct}`);
check("all correct: nothing to revisit", sRight.revisit.length === 0);
check("all correct: nothing unanswered", sRight.unanswered.length === 0);
check("all correct: total is the set size", sRight.total === 10);

const sWrong = summarise(sample, allWrong);
check("all wrong: zero correct", sWrong.correct === 0);
check("all wrong: every question is to revisit", sWrong.revisit.length === 10);
check(
  "all wrong: revisit entries name the phase to reread",
  sWrong.revisit.every((r) => r.phaseId && r.phaseTitle && r.trackId)
);

const sHalf = summarise(sample, halfRight);
check("half: correct counted", sHalf.correct === 5, `got ${sHalf.correct}`);
check("half: revisit counted", sHalf.revisit.length === 5, `got ${sHalf.revisit.length}`);
// 5 + 5 must account for the whole set — no question silently dropped.
check("answered + unanswered accounts for every question", sHalf.answered + sHalf.unanswered.length === sHalf.total);

const sNone = summarise(sample, {});
check("unanswered set: zero answered", sNone.answered === 0);
check("unanswered set: all listed as unanswered", sNone.unanswered.length === 10);
check("unanswered set: nothing to revisit", sNone.revisit.length === 0);

const sPartial = summarise(sample, { [sample[0].id]: sample[0].answerIndex });
check("a partial set counts only what was answered", sPartial.answered === 1 && sPartial.unanswered.length === 9);

check("summarise tolerates a null answer map", summarise(sample, null).answered === 0);
check("summarise tolerates a null set", summarise(null, {}).total === 0);

// Answer index 0 must not be mistaken for "unanswered". This is the classic
// falsy-zero bug, and option A is a legitimate answer.
const zeroQuestion = everything.find((q) => q.answerIndex === 0);
check("a question with answerIndex 0 exists to test with", !!zeroQuestion);
if (zeroQuestion) {
  const s = summarise([zeroQuestion], { [zeroQuestion.id]: 0 });
  check("choosing option A (index 0) counts as answered", s.answered === 1, "falsy-zero bug");
  check("choosing option A correctly counts as right", s.correct === 1);
}

// THE NO-SCORE RULE, asserted rather than documented.
const summaryKeys = Object.keys(sRight);
check(
  "the summary exposes no score, percent, grade or pass field",
  !summaryKeys.some((k) => /score|percent|grade|pass|rank|streak/i.test(k)),
  `found: ${summaryKeys.join(", ")}`
);
check(
  "no numeric field could be read as a percentage",
  !summaryKeys.some((k) => typeof sRight[k] === "number" && sRight[k] > 10 && sRight[k] <= 100 && k !== "total"),
  "a 0-100 number would be shown as a score the moment someone found it"
);

// ---------------------------------------------------------------------------
// 5. summariseText — wording.
// ---------------------------------------------------------------------------
check("no answers yet", summariseText(summarise(sample, {})) === "Nothing answered yet.");
check("null summary is safe", summariseText(null) === "Nothing answered yet.");

const tRight = summariseText(sRight);
check("all-right wording mentions nothing to revisit", /nothing to revisit/i.test(tRight), tRight);
check("all-right wording shows no number-out-of-number", !/\d+\s*\/\s*\d+/.test(tRight), tRight);

const tWrong = summariseText(sWrong);
check("ten to revisit uses a numeral, not a word", /^10 to look at again/.test(tWrong), tWrong);
check("the revisits wording shows no percentage", !/%/.test(tWrong), tWrong);
check("the revisits wording shows no ratio", !/\d+\s*\/\s*\d+/.test(tWrong), tWrong);

check("one to revisit is phrased as 'One'", /^One to look/.test(summariseText({ answered: 1, revisit: [{}], unanswered: [] })));
check("two to revisit is phrased as 'Two'", /^Two to look/.test(summariseText({ answered: 2, revisit: [{}, {}], unanswered: [] })));
check("three to revisit is phrased as 'Three'", /^Three to look/.test(summariseText({ answered: 3, revisit: [{}, {}, {}], unanswered: [] })));

// Partial completion is described, not penalised.
const partialText = summariseText({ answered: 4, revisit: [{}], unanswered: [1, 2, 3, 4, 5, 6] });
check("partial completion is not scolded", !/fail|wrong|bad|poor|only/i.test(partialText), partialText);

// Every wording variant must avoid grading language.
const variants = [summariseText(sRight), summariseText(sWrong), summariseText(sNone), partialText, tRight];
check(
  "no wording variant contains grading language",
  variants.every((v) => !/\b(fail|failed|pass|passed|score|grade|percent|%)\b/i.test(v)),
  variants.find((v) => /\b(fail|failed|pass|passed|score|grade|percent|%)\b/i.test(v)) || ""
);

// ---------------------------------------------------------------------------
// 6. What every track can offer.
// ---------------------------------------------------------------------------
for (const { track, pool } of pools) {
  check(
    `${track.id}: has at least 20 questions to practise from`,
    pool.length >= 20,
    `only ${pool.length}`
  );
  const built = buildSet(pool, 20, seededRng(3));
  check(`${track.id}: a 20-question set is unique`, new Set(built.map((q) => q.id)).size === built.length);
}

// ---------------------------------------------------------------------------
console.log(`\n  ${pass} assertion(s) passed, ${fails.length} failed`);
if (fails.length) {
  console.log("");
  for (const f of fails) console.log(`  \u2716 ${f}`);
  process.exit(1);
}
