// Section exams: a scored, timed assessment over one track.
//
// ---------------------------------------------------------------------------
// WHY THIS IS THE ONE PLACE THAT GRADES THE READER
// ---------------------------------------------------------------------------
// D-020 (the no-shame rule) says the site does not grade the reader: no percentage,
// no streak, no "N of M". This module is the deliberate, documented EXCEPTION, and
// the reason is that the two things answer different questions.
//
// A phase quiz and the Practice view exist to help a reader LEARN: they are
// low-stakes by design, they show the explanation either way, and a score would
// turn practice into a performance. An exam exists to answer "am I actually ready
// to move on / to say I know this track?" — and that question cannot be answered
// without a threshold. "12 to revisit" tells a reader what to study; it does not
// tell them whether they know it.
//
// So the rule is not repealed, it is SCOPE-LIMITED: practice stays ungraded, exams
// are graded, and the difference is visible in the UI rather than left to be
// inferred. D-020 carries the amendment.
//
// ---------------------------------------------------------------------------
// DESIGN DECISIONS THAT MATTER
// ---------------------------------------------------------------------------
// 1. EXAMS DRAW FROM THE WHOLE TRACK, NOT A SAMPLE OF IT. A section exam must be
//    able to ask anything the section taught. The subset is every question the track
//    has (24 to 82, depending on the track), not a fixed 20 — a fixed size would
//    silently make the smaller tracks easier to pass by covering a larger share of
//    their material.
//
// 2. THE ORDER IS SHUFFLED BUT THE QUESTIONS ARE NOT DROPPED. Every question in the
//    track appears exactly once. This is what makes the pass mark meaningful: two
//    readers who both score 80% have answered the same set.
//
// 3. OPTION ORDER IS ALSO SHUFFLED, and the stored answer moves with it. Left in
//    authoring order, the answer key would be memorisable ("the long one is B") and
//    a reader retaking an exam could pass on position recall rather than knowledge.
//    `why` reasoning sometimes references options by content, never by letter, so
//    shuffling is safe — verified in the tests.
//
// 4. THE PASS MARK IS 80%, AND IT IS HIGH ON PURPOSE. The reader is free to retake;
//    there is no penalty and no record of failure kept. A mark that could be scraped
//    by guessing four questions would make the certificate meaningless.
//
// 5. TIME IS A LIMIT, NOT A COUNTDOWN TO FAILURE. When it expires the exam is
//    submitted with whatever is answered, and unanswered questions count as wrong.
//    There is no "you ran out of time, come back tomorrow".

/** Pass mark. See note 4 above — chosen to make guessing insufficient. */
export const PASS_MARK = 0.8;

/** Minutes allowed, by how many questions the track has. */
export function timeLimitFor(questionCount) {
  // ~45 seconds per question, rounded up to the next 5 minutes, with a floor of 10.
  // A 24-question track gets 20 minutes; the largest (82) gets 65.
  const minutes = Math.ceil((questionCount * 45) / 60 / 5) * 5;
  return Math.max(10, minutes);
}

/**
 * Shuffle a copy of an array, moving an answer index along with it.
 *
 * Returns the new options and where the correct one landed. Written as its own
 * function because it is the one piece of the exam that can silently corrupt a
 * result: shuffling the options without tracking the answer would mark every
 * question against the wrong option, and the resulting scores would still look
 * plausible — a reader would simply be told they failed.
 */
export function shuffleOptions(options, answerIndex, rng = Math.random) {
  const order = options.map((text, i) => ({ text, wasCorrect: i === answerIndex }));
  for (let i = 0; i < order.length; i++) {
    const j = i + Math.floor(rng() * (order.length - i));
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }
  return {
    options: order.map((o) => o.text),
    answerIndex: order.findIndex((o) => o.wasCorrect),
  };
}

/**
 * Build an exam for a track from its questions.
 *
 * Every question appears exactly once (note 2), the questions are shuffled, and so
 * are the options within each question (note 3).
 *
 * @param {Array} questions - pooled questions from `poolFrom`, i.e. already carrying
 *   `phaseId`, `phaseTitle`, `trackId`, string options and a numeric `answerIndex`.
 */
export function buildExam(questions, trackId, trackLabel, rng = Math.random) {
  const list = (questions || []).filter((q) => q.trackId === trackId);
  // Shuffle question order.
  const arr = list.slice();
  for (let i = 0; i < arr.length; i++) {
    const j = i + Math.floor(rng() * (arr.length - i));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  // Shuffle the options inside each question and carry the answer with them.
  const examQuestions = arr.map((q) => {
    const s = shuffleOptions(q.options, q.answerIndex, rng);
    return { ...q, options: s.options, answerIndex: s.answerIndex };
  });

  return {
    trackId,
    trackLabel,
    questions: examQuestions,
    passMark: PASS_MARK,
    timeLimitMinutes: timeLimitFor(examQuestions.length),
    total: examQuestions.length,
  };
}

/**
 * Grade an exam. THE ONLY FUNCTION IN THE CODEBASE THAT PRODUCES A SCORE.
 *
 * `answers` maps question id -> chosen option index, the same shape the phase quiz
 * and the Practice view use, so the three cannot drift.
 *
 * Unanswered counts as wrong rather than being excluded from the denominator. The
 * alternative — scoring only what was attempted — would let a reader pass by
 * answering two questions correctly and leaving the rest blank, which is the
 * opposite of what an exam is for.
 */
export function gradeExam(exam, answers) {
  const given = answers || {};
  const questions = (exam && exam.questions) || [];

  let correct = 0;
  const results = [];

  for (const q of questions) {
    const chosen = given[q.id];
    const answered = chosen !== undefined && chosen !== null;
    const ok = answered && chosen === q.answerIndex;
    if (ok) correct++;
    results.push({
      id: q.id,
      chosen: answered ? chosen : null,
      answerIndex: q.answerIndex,
      correct: ok,
      answered,
      phaseId: q.phaseId,
      phaseTitle: q.phaseTitle,
      question: q.question,
      why: q.why,
    });
  }

  const total = questions.length;
  // Guard the divide-by-zero: an empty exam is 0/0, which is not a percentage.
  const ratio = total > 0 ? correct / total : 0;
  const passMark = (exam && exam.passMark) || PASS_MARK;

  return {
    total,
    correct,
    answered: results.filter((r) => r.answered).length,
    // A real score, rendered as a whole percent. `ratio` is kept as well so callers
    // do not have to divide a rounded number back out.
    percent: total > 0 ? Math.round(ratio * 100) : 0,
    ratio,
    passMark,
    passPercent: Math.round(passMark * 100),
    passed: total > 0 && ratio >= passMark,
    results,
    missed: results.filter((r) => !r.correct),
  };
}

/**
 * A plain description of a result, for the summary line.
 *
 * Unlike `summariseText` in practice.js, this one MAY state the score — that is the
 * whole point of an exam — but it still leads with what to do next, because a reader
 * who failed needs the next action more than the number.
 */
export function resultText(grade) {
  if (!grade || grade.total === 0) return "No questions in this exam.";
  const pct = `${grade.percent}%`;
  if (grade.passed) {
    return `Passed — ${pct} (pass mark ${grade.passPercent}%).`;
  }
  const gap = grade.correct === grade.total ? 0 : Math.ceil(grade.passMark * grade.total) - grade.correct;
  const need = gap === 1 ? "one more correct answer" : `${gap} more correct answers`;
  return `Not passed — ${pct} (pass mark ${grade.passPercent}%). ${need} would do it.`;
}

/** Which phases the missed questions came from, most-missed first. */
export function weakPhases(grade) {
  const counts = new Map();
  for (const r of (grade && grade.missed) || []) {
    const key = r.phaseId;
    if (!key) continue;
    const entry = counts.get(key) || { phaseId: r.phaseId, phaseTitle: r.phaseTitle, missed: 0 };
    entry.missed++;
    counts.set(key, entry);
  }
  return [...counts.values()].sort((a, b) => b.missed - a.missed || String(a.phaseId).localeCompare(String(b.phaseId)));
}

/** Seconds remaining, floored at 0. Kept pure so the countdown is testable. */
export function secondsLeft(deadlineMs, nowMs) {
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}

/** `12:05` — a countdown display. */
export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
