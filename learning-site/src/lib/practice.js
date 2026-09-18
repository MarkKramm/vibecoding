// A mixed practice set drawn from the whole curriculum.
//
// ---------------------------------------------------------------------------
// WHY THIS EXISTS, AND HOW IT DIFFERS FROM A PHASE QUIZ
// ---------------------------------------------------------------------------
// Every phase already ends with its own quiz: 549 questions across 65 phases. What
// the site had no way to do is ask them TOGETHER. A phase quiz tests the phase you
// just read, in the order it was written, with the surrounding prose still fresh —
// which is recall with the answer's context sitting right above it. This module
// builds the other thing: a set sampled across a track, or across everything, with
// no phase context and no fixed order.
//
// That difference is the whole value. Recognising an answer because you just read
// the paragraph is not the same skill as producing it a week later, and a learner
// studying alone has no way to tell the two apart. Interleaving is also the more
// effective schedule — mixing topics forces retrieval rather than familiarity — and
// it is the one arrangement a per-phase quiz structurally cannot offer.
//
// ---------------------------------------------------------------------------
// IT REPORTS, IT DOES NOT GRADE — the no-shame rule
// ---------------------------------------------------------------------------
// This is a deliberate constraint, not an oversight, and it is the reason several
// obvious features are absent. `Quiz.jsx` states the rule; D-019 carries it. The
// reader is a beginner studying alone, and a site that ends a session with "62%"
// teaches them to avoid the practice that helps most. So:
//
//   * NO percentage, NO pass mark, NO score, NO streak, NO timer.
//   * NO "you failed". The summary names the questions to revisit.
//   * The set can be abandoned at any point with nothing lost.
//
// `summarise()` returns counts and the ids to revisit. A percentage is never
// computed, so a caller cannot display one by accident — that is why the return
// shape has no `score` or `percent` field, rather than merely documenting that it
// should not be shown.
//
// ---------------------------------------------------------------------------
// DETERMINISM IS A FEATURE OF THE BUILDER, NOT THE VIEW
// ---------------------------------------------------------------------------
// `buildSet` takes an explicit `rng`, so the same seed produces the same set. The
// view passes `Math.random` and gets a new set each time; the tests pass a seeded
// generator and get a reproducible one. A test that had to accept "some random
// subset" could not assert anything precise about coverage, and coverage is the
// property most likely to break silently.

/** The energy levels, in the order the site uses them. */
export const ENERGIES = ["low", "normal", "high"];

/**
 * Flatten phases into a pool of questions, each tagged with where it came from.
 *
 * ⚠️ THIS READS THE **NORMALISED** QUESTION SHAPE, NOT THE GENERATED JSON.
 *
 * There are two shapes and they do not match. `generated/<track>.json` stores a
 * question as `{ id, question, options: ["a","b","c","d"], answerIndex, why, energy }`.
 * `normaliseQuestion` in `data/roadmaps.js` transforms it on the way in to
 * `{ id, question, energy, options: [{text, correct}], explanation }` — the answer
 * moves from a single index onto each option, and `why` is renamed `explanation`.
 *
 * An earlier version of this function read the RAW shape, and its 91 unit tests
 * passed because they read the raw JSON files off disk too. In the browser it threw
 * React error #31 ("objects are not valid as a React child") on the first render,
 * because `q.options` held objects where the view expected strings and `q.why` was
 * `undefined` where it expected the explanation.
 *
 * **The tests agreed with the bug because both looked at the file instead of the
 * app.** That is the same failure as the 325 glossary and resource items that
 * rendered into an empty div: correct data, wrong assumption about its shape. The
 * fix is to normalise here — accepting either shape — so the function works against
 * whichever the caller has, and the corpus-wide test now asserts the shape the APP
 * sees by round-tripping through `normaliseQuestion`.
 */
export function poolFrom(phases, trackId, trackLabel) {
  const out = [];
  for (const phase of phases || []) {
    for (const raw of phase.quiz || []) {
      const q = normaliseQuestionShape(raw);
      if (!q) continue;
      out.push({
        id: q.id,
        question: q.question,
        options: q.options,
        answerIndex: q.answerIndex,
        why: q.why,
        energy: q.energy || "normal",
        phaseId: phase.id,
        phaseTitle: phase.title,
        trackId,
        trackLabel,
      });
    }
  }
  return out;
}

/**
 * Accept EITHER question shape and return one canonical one.
 *
 * Handles the normalised shape (`options: [{text, correct}]`, `explanation`) and the
 * raw generated shape (`options: [string]`, `answerIndex`, `why`), because the two
 * genuinely coexist in this codebase and a helper that silently assumed the wrong
 * one is how this feature crashed on first render.
 *
 * Returns null for a question that cannot be made sense of, rather than throwing:
 * one malformed question should cost that question, not the whole practice view.
 */
export function normaliseQuestionShape(raw) {
  if (!raw || !raw.id || !Array.isArray(raw.options) || raw.options.length === 0) return null;

  // Options: either strings, or {text, correct} objects.
  let texts;
  let answerIndex;
  if (typeof raw.options[0] === "string") {
    texts = raw.options.slice();
    answerIndex = typeof raw.answerIndex === "number" ? raw.answerIndex : -1;
  } else {
    texts = raw.options.map((o) => (o && typeof o.text === "string" ? o.text : ""));
    // COUNT the correct options rather than taking the first.
    //
    // `findIndex` returns the first match, so a question that somehow carries two
    // correct options would be silently marked against the first and the reader
    // would be told a defensible second answer was wrong. The corpus has exactly one
    // correct option per question (checked by audit-quiz and by the assertions
    // here), but this function also accepts hand-made input, and "the data is fine"
    // is not a property a helper can rely on.
    const correctFlags = raw.options.map((o) => !!(o && o.correct === true));
    const correctCount = correctFlags.reduce((n, f) => n + (f ? 1 : 0), 0);
    answerIndex = correctCount === 1 ? correctFlags.indexOf(true) : -1;
  }

  // A question with no single identifiable answer cannot be marked, so it is
  // dropped. Keeping it would show the reader a question they can never get right.
  if (answerIndex < 0 || answerIndex >= texts.length) return null;
  if (texts.some((t) => !t)) return null;

  return {
    id: raw.id,
    question: raw.question || "",
    options: texts,
    answerIndex,
    why: typeof raw.explanation === "string" && raw.explanation ? raw.explanation : raw.why || "",
    energy: raw.energy,
  };
}

/**
 * Filter a pool by scope and energy.
 *
 * `energy` is a CEILING, not an equality match. Asking for "low" means "nothing
 * harder than low" — a reader who has ten minutes and low energy is not asking for
 * the easy questions only, they are asking not to be handed multi-step judgement
 * problems. `null` or `"any"` means no filter.
 */
export function filterPool(pool, { trackId = null, energy = null } = {}) {
  const cap = ENERGIES.indexOf(energy);
  return (pool || []).filter((q) => {
    if (trackId && q.trackId !== trackId) return false;
    if (cap >= 0 && ENERGIES.indexOf(q.energy) > cap) return false;
    return true;
  });
}

/**
 * A tiny deterministic PRNG (mulberry32).
 *
 * Used only by tests, which need the same set twice. Not cryptographic and not
 * trying to be — the input is a seed chosen by a test, and the output only has to
 * be reproducible.
 */
export function seededRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sample `size` questions from `pool`, without replacement.
 *
 * Partial Fisher-Yates: shuffle only the first `size` positions. A full shuffle
 * would do the same job and then discard the rest, and this pool is 549 items.
 *
 * `size` larger than the pool returns the whole pool rather than padding,
 * duplicating or throwing. A reader who asks for 50 questions from a track with 30
 * should get 30 and be told so, not an error and not the same question twice.
 */
export function buildSet(pool, size, rng = Math.random) {
  const arr = (pool || []).slice();
  const want = Math.max(0, Math.min(Number(size) || 0, arr.length));
  for (let i = 0; i < want; i++) {
    const j = i + Math.floor(rng() * (arr.length - i));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr.slice(0, want);
}

/**
 * Summarise a set the reader has worked through.
 *
 * DELIBERATELY NOT A SCORE. Returns how many were answered and which to revisit;
 * there is no `percent`, no `passed` and no `grade`, so no caller can render one
 * without inventing it. The tests assert the absence, because "we agreed not to
 * show a score" is exactly the kind of decision that erodes one helpful-looking
 * field at a time.
 *
 * `answers` maps question id -> chosen option index, which is the same shape and
 * the same keying `useQuizAnswers` already uses, so the two cannot drift.
 */
export function summarise(set, answers) {
  const given = answers || {};
  let answered = 0;
  let correct = 0;
  const revisit = [];
  const unanswered = [];

  for (const q of set || []) {
    const chosen = given[q.id];
    if (chosen === undefined || chosen === null) {
      unanswered.push(q.id);
      continue;
    }
    answered++;
    if (chosen === q.answerIndex) correct++;
    else revisit.push({ id: q.id, phaseId: q.phaseId, phaseTitle: q.phaseTitle, trackId: q.trackId });
  }

  return { total: (set || []).length, answered, correct, revisit, unanswered };
}

/**
 * A short, non-judgemental sentence describing a finished set.
 *
 * The wording rule is the one `Quiz.jsx` already follows: name what to do next
 * rather than how the reader did. "Two to look at again" is actionable; "80%" is
 * not, and "you got 2 wrong" is worse.
 */
export function summariseText(summary) {
  if (!summary || summary.answered === 0) {
    return "Nothing answered yet.";
  }
  if (summary.revisit.length === 0) {
    if (summary.unanswered.length > 0) {
      return `All ${summary.answered} you answered were right. ${summary.unanswered.length} left if you want them.`;
    }
    return `All ${summary.answered} right. Nothing to revisit.`;
  }
  const n = summary.revisit.length;
  const word = n === 1 ? "One" : n === 2 ? "Two" : n === 3 ? "Three" : String(n);
  return `${word} to look at again — the explanations name the reasoning.`;
}
