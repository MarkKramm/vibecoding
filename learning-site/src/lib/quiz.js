// Quiz logic, kept out of the component so it can be tested under plain Node.
//
// WHY THIS IS A MODULE AND NOT INLINE JSX
// The component's job is rendering. Everything that decides *what is true* — is
// this answer right, which questions were missed, what does the summary say —
// is pure, and pure logic can be asserted without a DOM, a test framework, or a
// build step. That is the same split lib/yourWork.js and lib/transfer.js
// already follow, and it matters here for the same reason: these functions'
// failure modes are quiet.
//
//   * A question could be marked correct against the wrong option, because the
//     correct index was found by object key order rather than by the `correct`
//     flag.
//   * The summary could name the wrong question numbers — off by one — and a
//     reader would go back to the wrong part of the phase.
//   * A question answered but unanswered *correctly* could count as missed, or
//     an answered-wrong question could vanish from the review list.
//   * An unanswered question could be reported as wrong, which would tell a
//     reader they failed something they never tried.
//
// None of those throw. A quiz that says "every answer correct" when one was
// wrong looks exactly like a quiz where the reader got everything right.

/** The index of the correct option, or -1 if the question is malformed. */
export function correctIndex(question) {
  if (!question || !Array.isArray(question.options)) return -1;
  return question.options.findIndex((o) => o && o.correct === true);
}

/** True when the reader's choice for this question is the correct option. */
export function isCorrect(question, choice) {
  if (choice === undefined || choice === null) return false;
  return choice === correctIndex(question);
}

/**
 * The questions the reader answered incorrectly, in curriculum order.
 * An unanswered question is NOT included: it is unanswered, not wrong.
 */
export function missedQuestions(questions, picked) {
  if (!Array.isArray(questions)) return [];
  return questions.filter((q) => {
    const choice = picked ? picked[q.id] : undefined;
    if (choice === undefined) return false;
    return !isCorrect(q, choice);
  });
}

/** How many questions have an answer recorded. */
export function answeredCount(questions, picked) {
  if (!Array.isArray(questions)) return 0;
  return questions.filter((q) => picked && picked[q.id] !== undefined).length;
}

/**
 * The human-readable summary, as `{ kind, text }`.
 *
 * Deliberately NOT a score. The site carries no `N of M` and no percentage
 * anywhere else (the no-shame rule), and a quiz is the one place a number would
 * feel natural and still be wrong: a beginner three weeks in does not need
 * "70%", they need to know which two things to reread. `kind` is exposed so a
 * caller can style it without parsing the sentence back apart.
 */
export function summarise(questions, picked) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return { kind: "empty", text: "This phase has no quiz yet." };
  }
  const answered = answeredCount(questions, picked);
  if (answered < questions.length) {
    return {
      kind: "partial",
      answered,
      total: questions.length,
      text: answered === 0 ? "" : `${answered} of ${questions.length} answered.`,
    };
  }
  const missed = missedQuestions(questions, picked);
  if (missed.length === 0) {
    return {
      kind: "perfect",
      text: "Every answer correct — you can hold this material in conversation.",
    };
  }
  // 1-based question numbers, taken from position in the source list rather
  // than from the id, because the id's suffix is an authoring detail while the
  // position is what the reader counts on screen.
  const numbers = missed.map((m) => questions.indexOf(m) + 1);
  if (numbers.length === 1) {
    return { kind: "review", numbers, text: `One to look at again — question ${numbers[0]}.` };
  }
  return {
    kind: "review",
    numbers,
    text: `A few to look at again — questions ${numbers.join(", ")}.`,
  };
}
