// Multiple-choice quiz for a phase.
//
// WHY THIS IS NOT A SCORED TEST
// The reader is a beginner studying alone, and the surrounding site is
// deliberately free of counts, percentages and completion language — the
// "Your work" view carries no `N of M` at all (see docs/DECISIONS.md → the
// no-shame rule). A quiz that announces "3 out of 10" at the end would be the
// one place in the product that grades the reader.
//
// So this reports what happened without judging it: each question says whether
// the chosen answer is right, the explanation is always shown, and the summary
// names the questions to revisit rather than a score. "Two to look at again" is
// actionable; "80%" is not.
//
// WHY THE EXPLANATION SHOWS EVEN WHEN CORRECT
// A right answer for the wrong reason is the most common way a beginner
// mis-learns, and it is invisible to any score. The explanation names the
// misconception each distractor represents, so it is worth reading either way.
//
// WHY ANSWERS ARE KEYED BY QUESTION ID
// Never by position in the list. Inserting a question above another must not
// move one reader's answer onto a different question — the same reasoning as
// TaskList's answers and the authored task ids (D-019). The id comes from the
// authored `<!-- id: phase-qNN -->` comment in the Markdown.
//
// WHERE THE ANSWERS LIVE, AND WHY THAT CHANGED
//
// This component originally held its answers in `useState` and the comment here
// said that was deliberate: "a quiz is for the moment you take it, and persisting
// it would turn a self-check into a permanent record of how you did."
//
// That reasoning was sound and the outcome was still wrong. Answering a set and
// navigating away discarded the only evidence the reader had produced about what
// they did not yet understand -- and the most useful thing the curriculum says
// about a missed question is the `**Why:**` line, which names the misconception
// the distractor represents. Throwing that away on every navigation left the quiz
// as something you perform rather than something you learn from.
//
// SO THE CONFLICT IS RESOLVED BY NARROWING WHAT IS STORED, NOT BY DROPPING THE
// OBJECTION. Persisted is the minimum needed to build a revisit list: **which
// option was picked, keyed by question id**. Not persisted anywhere: whether it
// was right, how many were right, how many were answered, any ratio, or any
// history of a phase getting better or worse. The review page therefore shows
// *what to look at again*, which is a statement about a pile of paper, and never
// *how you did*, which would be the report card this file was right to refuse.
// See docs/DECISIONS.md -> D-044.
//
// "Start over" still clears the set, and still exists for the reader who wants a
// clean run at it.
//
// WHY THERE IS A NORMALISATION STEP
// Two content pipelines feed this component and they describe the same question
// differently. The first emits options as objects carrying their own `correct`
// flag alongside an `explanation`:
//
//     { id, question, energy, options: [{ text, correct }], explanation }
//
// The second emits options as plain strings with the correct one named by index,
// alongside a `why`:
//
//     { id, question, energy, options: ["…", "…"], answerIndex: 1, why }
//
// Only the second shape is generated today, but the first is what this component
// was written against and the whole site's tests, fixtures and older lesson JSON
// still contain it. Rather than teach the renderer two shapes — which is how a
// data-format migration silently breaks the half nobody re-tested — both are
// folded into ONE internal form here, at the boundary. Everything below this
// point reads `text`/`correct`/`explanation` and knows nothing about which
// pipeline produced the question.
//
// The helper is deliberately forgiving rather than validating: it never throws
// and never rejects a question, because the fallbacks (no correct option, or no
// explanation) already have sensible rendering — the quiz simply does not claim
// which answer is right, and no why-line is shown. See lib/quiz.js, whose
// `correctIndex` returns -1 for a malformed question for the same reason.

import { renderInline } from "../lib/renderInline.jsx";
import { correctIndex, summarise } from "../lib/quiz.js";
import { useQuizAnswers } from "../hooks/useQuizAnswers.js";

const LETTERS = "ABCDEFGH";

/**
 * True for the object-option shape: `{ text, correct }`.
 *
 * Both markers of that shape are accepted, not just `correct`. An option object
 * whose `correct` flag is missing is still an object option — its label lives in
 * `.text` — so testing for the type alone is what keeps a malformed question from
 * rendering its text as the literal string "[object Object]".
 */
function isObjectOption(opt) {
  return (
    opt !== null &&
    typeof opt === "object" &&
    !Array.isArray(opt) &&
    ("text" in opt || "correct" in opt)
  );
}

/** The index of the option marked `correct` in the object shape, or -1. */
function flaggedCorrectIndex(options) {
  if (!Array.isArray(options)) return -1;
  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    if (opt !== null && typeof opt === "object" && !Array.isArray(opt) && opt.correct === true) {
      return i;
    }
  }
  return -1;
}

/**
 * Fold either question shape into one internal form.
 *
 * @returns {{ text: string, correct: boolean }[]} options, plus an `explanation`
 *   string hung off the returned array as `.explanation`. The string is attached
 *   rather than returned separately so `correctIndex` in lib/quiz.js — which
 *   reads `question.options` and looks for `o.correct === true` — keeps working
 *   unchanged on the normalised question.
 */
export function normaliseQuestion(q) {
  const question = q || {};
  const raw = Array.isArray(question.options) ? question.options : [];

  // The two shapes disagree about where "which one is right" lives: in the flag,
  // or in the index. Prefer the flag when it is present and the index only when
  // it is not, so a question carrying both cannot be read the wrong way round.
  const flagged = flaggedCorrectIndex(raw);
  const byIndex =
    Number.isInteger(question.answerIndex) &&
    question.answerIndex >= 0 &&
    question.answerIndex < raw.length
      ? question.answerIndex
      : -1;
  const answerIndex = flagged !== -1 ? flagged : byIndex;

  const options = raw.map((opt, i) => ({
    // A non-string, non-object option is kept as text rather than dropped, so a
    // malformed entry shows up as a visible oddity in the list instead of
    // silently renumbering every option after it and shifting the answer.
    text: isObjectOption(opt) ? opt.text : opt,
    correct: i === answerIndex,
  }));

  // `why` is the current field, `explanation` the older one. Both are read so
  // that a mixture of questions from the two pipelines renders consistently; an
  // empty `why` falls through to a populated `explanation`.
  const explanation =
    (typeof question.why === "string" && question.why) ||
    (typeof question.explanation === "string" && question.explanation) ||
    "";

  options.explanation = explanation;
  return options;
}

export default function Quiz({ questions }) {
  // Normalised once, up front, so the rest of the component deals in a single
  // shape. `questions` itself is left untouched — the caller's array is not ours
  // to rewrite.
  const prepared = (Array.isArray(questions) ? questions : []).map((q) => ({
    ...q,
    options: normaliseQuestion(q),
  }));

  const ids = prepared.map((q) => q.id);
  const { picked, choose, reset } = useQuizAnswers(ids);

  if (!questions || !questions.length) {
    return <p className="muted">This phase has no quiz yet.</p>;
  }

  // All the scoring lives in lib/quiz.js, where it is tested under plain Node.
  const summary = summarise(prepared, picked);
  const answeredTotal = summary.answered ?? prepared.length;

  return (
    <div className="quiz">
      {prepared.map((q, qi) => {
        const choice = picked[q.id];
        const answerIdx = correctIndex(q);
        const isAnswered = choice !== undefined;
        const isRight = isAnswered && choice === answerIdx;

        return (
          <div
            key={q.id}
            className={
              "quiz__q" +
              (isAnswered ? (isRight ? " quiz__q--right" : " quiz__q--wrong") : "")
            }
          >
            <p className="quiz__prompt">
              <span className="quiz__num" aria-hidden="true">
                {qi + 1}
              </span>
              {renderInline(q.question, `quiz-q-${qi}`)}
              {q.energy && <span className="quiz__energy">{q.energy}</span>}
            </p>

            <ul className="quiz__options">
              {q.options.map((opt, oi) => {
                const chosen = choice === oi;
                // Only reveal which option is correct once this question has
                // been answered, so the quiz is a question rather than a
                // reading exercise.
                const showAsCorrect = isAnswered && oi === answerIdx;
                const showAsWrongPick = isAnswered && chosen && oi !== answerIdx;

                return (
                  <li key={oi}>
                    <button
                      type="button"
                      className={
                        "quiz__opt" +
                        (showAsCorrect ? " quiz__opt--correct" : "") +
                        (showAsWrongPick ? " quiz__opt--wrong" : "") +
                        (chosen ? " quiz__opt--chosen" : "")
                      }
                      aria-pressed={chosen}
                      disabled={isAnswered}
                      onClick={() => choose(q.id, oi)}
                    >
                      <span className="quiz__letter" aria-hidden="true">
                        {LETTERS[oi]}
                      </span>
                      <span>{renderInline(opt.text, `quiz-o-${qi}-${oi}`)}</span>
                      {showAsCorrect && (
                        <span className="quiz__badge" aria-label="correct answer">
                          Correct
                        </span>
                      )}
                      {showAsWrongPick && (
                        <span className="quiz__badge quiz__badge--wrong" aria-label="your answer">
                          Your answer
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {isAnswered && q.options.explanation && (
              <p className="quiz__why">
                <strong>{isRight ? "Why that's right:" : "Why:"}</strong>{" "}
                {renderInline(q.options.explanation, `quiz-why-${qi}`)}
              </p>
            )}
          </div>
        );
      })}

      <div className="quiz__foot">
        {summary.kind === "partial" || summary.kind === "empty" ? (
          <p className="muted">
            {summary.text ||
              "Pick an answer to see the explanation. Nothing is recorded."}
          </p>
        ) : (
          <p className="quiz__summary">{summary.text}</p>
        )}
        {answeredTotal > 0 && (
          <button
            type="button"
            className="chip chip--tiny"
            onClick={reset}
          >
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
