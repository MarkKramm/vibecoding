// The reader's quiz answers, persisted in localStorage and keyed by question id.
//
// WHY THIS EXISTS
// The quiz shipped as a component that held its answers in `useState`. Answer a
// set, switch views, and every answer was gone -- and with it the only evidence
// the reader had produced about what they did and did not understand. A quiz
// whose result evaporates on navigation is a quiz you cannot learn from, only
// perform.
//
// WHAT IT IS NOT
// It is not a score, a grade, or a progress signal. Nothing here counts for the
// reader: there is no "N of M answered", no percentage, no streak, and no
// ordering by how well a phase went. The review queue this feeds is a **list of
// questions to look at again**, not a mark out of ten -- a reader who got one
// question wrong and a reader who got ten wrong see the same shape of page. See
// docs/DECISIONS.md -> D-019, D-020 and the no-shame rule.
//
// KEYED BY STABLE IDS
// Answers are keyed by the authored question id (`<track>-<phase>-qNN`), never by
// position in the list. Inserting a question above another must not move a
// reader's answer onto a different question -- the same rule TaskList follows
// with authored task ids (D-019). The id comes from the `<!-- id: ... -->`
// comment in the Markdown.
//
// Registered in lib/transfer.js -> KEYS, so Back up & restore carries it.

import { useState, useCallback } from "react";

const KEY = "vibecoding:quiz:v1";

// The shape is { [questionId]: optionIndex }.
//
// An index is stored, not the option text, because the answer is a position in
// an authored list and the id already pins the question. Storing the text would
// silently invalidate every answer the moment a distractor was reworded.
//
// Read standalone so any read-only consumer (the review queue, the dashboard)
// can read without subscribing -- the same discipline readNotes() and
// readPortfolio() follow. Two live copies of one localStorage key drift.
export function readQuizAnswers() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    // Defensive: drop anything that is not a small non-negative integer, so a
    // hand-edited or half-written file cannot put `"2"` or `null` where an index
    // is expected and make isCorrect() compare against a string.
    const clean = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (Number.isInteger(value) && value >= 0) clean[id] = value;
    }
    return clean;
  } catch {
    return {};
  }
}

export function writeQuizAnswers(answers) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(answers));
  } catch {
    // A full or unavailable localStorage must not break the quiz itself. The
    // reader can still answer; they just cannot come back to it.
  }
}

// Apply a change for ONE phase on top of whatever is in storage right now.
//
// WHY THIS IS A READ-MODIFY-WRITE AND NOT A BLIND SET
// The first version of this wrote the component's whole in-memory state back on
// every change, including on mount. That is only safe while exactly one Quiz is
// mounted at a time, and it silently loses answers the moment two are not — the
// second instance's state does not contain the first's answers, so whichever
// writes last wins and the other phase's answers disappear.
//
// The browser check found this the honest way: answering a question in IT 01 and
// reloading worked in isolation, and failed inside the full run, where the suite
// has visited many phases first. A store that is correct alone and wrong in
// sequence is the kind of bug that survives a green unit suite forever.
//
// Taking the current store as the base and applying only this phase's change
// makes the operation order-independent: two quizzes mounted together each
// modify their own slice of the same live value, and neither can clobber the
// other. Deleting keys (Start over) works the same way — the change set carries
// the ids to remove rather than a whole replacement object.
export function updateQuizAnswers(change, removeIds) {
  const next = { ...readQuizAnswers(), ...change };
  for (const id of removeIds || []) delete next[id];
  writeQuizAnswers(next);
  return next;
}

// Per-question answers for one phase, plus the operations the Quiz component
// needs. Mirrors useNotes/usePortfolio: state, a write-through effect, and a
// reset scoped to this phase only.
export function useQuizAnswers(questionIds) {
  const [answers, setAnswers] = useState(readQuizAnswers);

  // NOTE: there is deliberately no `useEffect` writing `answers` back on every
  // change. Every mutation below goes through updateQuizAnswers(), which applies
  // a change to the CURRENT stored value rather than replacing it. A write-through
  // effect would reintroduce the clobbering this was written to fix, because its
  // first run happens on mount with state that may predate another instance's
  // write.

  const ids = Array.isArray(questionIds) ? questionIds : [];

  // The slice of the store belonging to this phase. The Quiz component works
  // with ids, the store is global, so the mapping lives here rather than being
  // re-derived in the component.
  const picked = {};
  for (const id of ids) {
    if (answers[id] !== undefined) picked[id] = answers[id];
  }

  const choose = useCallback((questionId, optionIndex) => {
    setAnswers(updateQuizAnswers({ [questionId]: optionIndex }));
  }, []);

  // "Start over" clears this phase's answers and leaves every other phase
  // untouched -- a reader resetting one quiz must not lose another.
  const reset = useCallback(() => {
    setAnswers(updateQuizAnswers({}, ids));
  }, [ids.join("\u0000")]);

  return { picked, choose, reset };
}
