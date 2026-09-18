// Collect the quiz questions the reader got wrong into one revisitable list.
//
// ---------------------------------------------------------------------------
// DEAD CODE — PORTED BUT UNREACHABLE
// ---------------------------------------------------------------------------
// Nothing imports this module. It was ported from the sibling CS Roadmap
// project as the read side of its Review surface, which is not a view in this
// site. See docs/DECISIONS.md → D-008.
//
// It is kept rather than deleted because removal would also touch the transfer
// KEYS list, the validators and the tests, and would have to be redone if the
// career views return. See D-008 for that trade-off. It is also the file that
// carries D-019, D-020 and the no-shame rule into the code rather than only into
// the decision log — deleting it would not delete the principles, but it would
// delete the comments that explain them.
//
// ⚠️ THE HAZARD THIS MODULE CARRIES
// Line 57 reads `phase.quiz || []`. `quiz` is a FULL projection field; on the
// light index the same phase carries only `quizIds`, so against the light index
// this module silently returns an empty list — no crash, but "no questions to
// revisit" for a reader who has missed several. That is the same defect shape as
// the Tools-library bug (`phase.tools` read off the light projection rendered
// "0 tools" while 433 rows existed): a wrong answer that looks like a real one.
// Feed this module full phase records from `loadTrackPhases`, never the light
// index. See the header of src/data/roadmaps.js.
//
// WHY THIS IS A PURE MODULE AND NOT PART OF THE PAGE
// The same reason lib/yourWork.js is: this is data transformation, not rendering,
// so it runs under plain Node with no React, no DOM and no build step. The quiet
// failure mode here is an answer attached to the wrong question -- a reader told
// to revisit something they already understand, or worse, NOT told to revisit
// something they do not. Neither shows up as a crash.
//
// WHY THE QUIZ NEEDED A READ SIDE AT ALL
// 380 questions across 31 phases, and until this module existed the only way to
// see a missed question again was to remember which phase it was in, navigate
// there, and re-answer the whole set. That is not revision, it is a memory test
// about the site's own navigation. The quiz's own explanation -- the `**Why:**`
// line, which names the misconception each distractor represents -- is the most
// useful thing the curriculum produces about what the reader does not yet know,
// and it was being thrown away on every navigation.
//
// IT IS NOT A SCOREBOARD
// `summariseReview` counts what EXISTS, with no denominator: "6 questions to look
// at again" is a statement about a pile of paper, not about the reader. There is
// no "6 of 380", no percentage, no correct-answer count, and crucially **no
// ordering by how badly a phase went**. A reader with 1 missed question and a
// reader with 40 see the same shape of page. See docs/DECISIONS.md -> D-019,
// D-020 and the no-shame rule in docs/DESIGN-SYSTEM.md.
//
// WHAT COUNTS AS MISSED
// Only a question that was answered AND answered incorrectly. A question the
// reader has never reached is not a gap -- they have not met it yet, and putting
// it in a "revisit this" list would tell a beginner they are behind on material
// they have not studied. `isCorrect` already treats an absent answer as not
// correct, which is right for scoring a set and wrong for building this list, so
// the filter is explicit here rather than inherited.

import { isCorrect } from "./quiz.js";

/**
 * Every answered-and-wrong question, in curriculum order.
 *
 * Order follows the curriculum rather than the order they were missed, for the
 * same reason yourWork does: this page is for finding something again, and the
 * reader knows where it lives.
 *
 * @param {object} answers `{ [questionId]: optionIndex }`
 * @param {Array}  tracks  the `tracks` array from data/roadmaps.js
 * @returns {Array<{
 *   phaseId: string, phaseTitle: string, trackId: string, trackLabel: string,
 *   question: object, chosen: number,
 * }>}
 */
export function collectMissed(answers, tracks) {
  const out = [];
  const all = answers && typeof answers === "object" ? answers : {};

  for (const track of tracks || []) {
    for (const phase of track.phases || []) {
      for (const question of phase.quiz || []) {
        const chosen = all[question.id];
        // Never answered -> not a gap, and this ONE check is what enforces that.
        // See the note above: `isCorrect` treats an absent answer as not correct,
        // which is right for scoring a set and wrong for this list, so the filter
        // has to be explicit.
        //
        // THIS SINGLE CHECK DELIBERATELY REPLACED TWO. There used to be a
        // `chosen === undefined` guard followed by a `Number.isInteger(chosen)`
        // guard. Mutation testing showed the first was unobservable: an undefined
        // choice fails the integer check anyway, so deleting the first guard alone
        // changed no behaviour and no test could fail on it. **A guard that cannot
        // be observed is not defence in depth -- it is code that reads as
        // protection and provides none.** Requiring a non-negative integer covers
        // the unanswered case, the string-index case and the null case at once.
        // Removing both guards fails 20 of the 41 checks in test-review.mjs.
        //
        // The upper bound matters as much as the lower one, and the first version
        // of this line omitted it. An index past the end of the option list
        // matches no option, so `isCorrect` reports false and a corrupt stored
        // value surfaces as a phantom "you got this wrong" on a question the
        // reader never answered. Mutation testing caught the missing bound only
        // after an assertion for it existed.
        const optionCount = (question.options || []).length;
        if (!Number.isInteger(chosen) || chosen < 0 || chosen >= optionCount) continue;
        if (isCorrect(question, chosen)) continue;

        out.push({
          phaseId: phase.id,
          phaseTitle: phase.title,
          trackId: track.id,
          trackLabel: track.label,
          question,
          chosen,
        });
      }
    }
  }

  return out;
}

/**
 * What exists, with no denominator.
 *
 * Returns the number of questions to revisit and the number of distinct phases
 * they came from -- both statements about where things are. Deliberately NOT
 * returned: how many questions were answered, how many were correct, or any
 * ratio. Those turn a workspace into a report card, which is the one thing the
 * no-shame rule forbids.
 *
 * @param {Array} missed output of collectMissed
 * @returns {{ questions: number, phases: number }}
 */
export function summariseReview(missed) {
  const list = Array.isArray(missed) ? missed : [];
  const phases = new Set(list.map((m) => m.phaseId));
  return { questions: list.length, phases: phases.size };
}

/**
 * Group missed questions by phase, preserving curriculum order.
 *
 * A flat list of 40 questions is not revisitable; the same list under "Cyber 03
 * — Security Fundamentals" is, because the reader can go back to the lesson that
 * explains it. Phases appear in the order collectMissed produced them.
 *
 * @param {Array} missed output of collectMissed
 * @returns {Array<{ phaseId, phaseTitle, trackLabel, items: Array }>}
 */
export function groupByPhase(missed) {
  const order = [];
  const byId = new Map();

  for (const item of Array.isArray(missed) ? missed : []) {
    if (!byId.has(item.phaseId)) {
      byId.set(item.phaseId, {
        phaseId: item.phaseId,
        phaseTitle: item.phaseTitle,
        trackLabel: item.trackLabel,
        items: [],
      });
      order.push(item.phaseId);
    }
    byId.get(item.phaseId).items.push(item);
  }

  return order.map((id) => byId.get(id));
}
