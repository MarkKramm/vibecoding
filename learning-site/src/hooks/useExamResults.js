// Recorded exam results, persisted in localStorage.
//
// ---------------------------------------------------------------------------
// WHAT IS STORED, AND WHAT IS DELIBERATELY NOT
// ---------------------------------------------------------------------------
// Stored, per track: the best result (score, when it happened, how many questions),
// and how many attempts have been made. Not stored: the answers themselves, and not
// stored: any record of a FAILED attempt's questions.
//
// WHY THE BEST RESULT AND NOT THE LATEST. A reader retakes an exam because they want
// to pass it. Overwriting a pass with a later lower score — after a bad night, or on
// a harder shuffle — would punish them for practising, which is exactly the
// incentive this whole site is built to avoid. Best-of is also what every real
// certification does.
//
// WHY THE ATTEMPT COUNT IS KEPT ANYWAY. It is the one honest signal that a topic
// needed work, and it is shown only to the reader, next to their own result. It is
// not a streak, it does not reset, and nothing ranks it.
//
// WHY THE ANSWERS ARE NOT STORED. A stored answer set would let a reader reload
// mid-exam and continue, which turns a timed assessment into an open-book one. The
// exam is deliberately in-memory for its duration: reload during an exam and it
// restarts. That is a real cost, and it is the correct trade for an assessment whose
// entire value is that the score means something.
//
// Registered in lib/transfer.js -> KEYS, so Back up & restore carries results.

import { useState, useCallback } from "react";

const KEY = "vibecoding:exams:v1";

/** `{ [trackId]: { best: {percent, correct, total, at}, attempts: n } }` */
export function readExamResults() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function writeExamResults(results) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(results));
  } catch {
    // A full or unavailable localStorage must not break the exam itself. The reader
    // can still sit it; they just cannot come back to the result.
  }
}

/**
 * Record one finished attempt for a track, keeping the best result.
 *
 * Read-modify-write against live storage rather than writing the component's state
 * back, for the same reason `updateQuizAnswers` does it: two mounted copies of one
 * key drift, and whichever writes last wins.
 *
 * A pure function of the previous value, so it is the piece worth testing.
 */
export function applyAttempt(previous, trackId, grade, now) {
  const all = previous && typeof previous === "object" ? previous : {};
  const prev = all[trackId] || null;
  const at = now || new Date().toISOString();

  const attempt = {
    percent: grade.percent,
    correct: grade.correct,
    total: grade.total,
    passed: grade.passed,
    at,
  };

  // Best-by-percentage. On an exact tie the EARLIER result is kept, because it was
  // achieved with less practice and is the more meaningful of the two.
  const best = !prev || !prev.best || attempt.percent > prev.best.percent ? attempt : prev.best;

  return {
    ...all,
    [trackId]: { best, attempts: (prev && prev.attempts ? prev.attempts : 0) + 1 },
  };
}

/** Record a finished exam. Returns the updated map. */
export function recordExamResult(trackId, grade) {
  const next = applyAttempt(readExamResults(), trackId, grade);
  writeExamResults(next);
  return next;
}

/** Forget every recorded result. Offered in the UI, because a reader should be able to. */
export function clearExamResults() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to do — the caller re-reads and will simply see no results.
  }
  return {};
}

export function useExamResults() {
  const [results, setResults] = useState(readExamResults);

  const record = useCallback((trackId, grade) => {
    const next = recordExamResult(trackId, grade);
    setResults(next);
    return next;
  }, []);

  const clear = useCallback(() => {
    setResults(clearExamResults());
  }, []);

  return { results, record, clear };
}

/** How many of the given tracks have been passed. Used for the one line on the index. */
export function countPassed(results, trackIds) {
  let n = 0;
  for (const id of trackIds || []) {
    const r = results && results[id];
    if (r && r.best && r.best.passed) n++;
  }
  return n;
}
