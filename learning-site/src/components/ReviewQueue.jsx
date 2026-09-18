// The questions a reader got wrong, gathered from every phase into one list.
//
// ---------------------------------------------------------------------------
// DEAD CODE — PORTED BUT UNREACHABLE
// ---------------------------------------------------------------------------
// Nothing renders this component. It is the view half of `lib/review.js`, which
// is dead for the same reason: the Review surface is not one of this site's
// views. See docs/DECISIONS.md → D-008.
//
// Note the stale reference below: this comment says it is "Reached from the
// 'Your work' page, which already exists". Neither that page nor that route
// exists in this app — YourWork is dead too (`lib/yourWork.js`). Read the
// sentence as a description of the sibling project, not of this one.
//
// It is kept rather than deleted because removal would have to be redone if the
// career views return. See D-008.
//
// WHY THIS EXISTS
// The curriculum produces 380 quiz questions. Each one carries a `**Why:**` line
// that names the misconception its distractors represent -- the single most
// useful thing the content says about what a reader does not yet understand.
// Until now that line was visible exactly once, at the moment of answering, and
// was reachable afterwards only by remembering which phase the question was in
// and re-taking the whole set. That is not revision; it is a memory test about
// the site's own navigation.
//
// WHY IT SHOWS THE EXPLANATION AND NOT THE VERDICT
// The page never says "you got 6 wrong". It says these are questions to look at
// again, and then shows what each one was testing. The distinction is the whole
// design: "two to look at again" is actionable, a score is a judgement, and this
// product does not grade the reader. See docs/DECISIONS.md -> D-019, D-020, and
// the no-shame rule in docs/DESIGN-SYSTEM.md.
//
// WHY IT SHOWS THE READER'S OWN CHOICE
// Naming the option they picked is what makes the misconception concrete -- "I
// chose the one about blocking ports" is a thought the reader can act on, where
// an abstract "you missed this" is not. It is stated plainly, with no marker
// suggesting it was a failure.
//
// Reached from the "Your work" page, which already exists to read back the
// reader's own writing. A missed question is the same kind of thing: something
// the reader produced, which they should be able to find again.

import { renderInline } from "../lib/renderInline.jsx";
import { correctIndex } from "../lib/quiz.js";

const LETTERS = "ABCDEFGH";

export default function ReviewQueue({ groups, onOpenPhase }) {
  if (!groups.length) {
    return (
      <p className="muted review__empty">
        No questions to revisit. Once you answer a quiz, anything you get wrong
        collects here — with the explanation, so you can see what it was testing.
      </p>
    );
  }

  return (
    <div className="review">
      {groups.map((group) => (
        <section className="review__phase" key={group.phaseId}>
          <div className="review__phase-head">
            <div>
              <div className="muted review__track">{group.trackLabel}</div>
              <h3 className="review__title">
                {String(group.phaseTitle || "").replace(/^Phase /, "")}
              </h3>
            </div>
            {onOpenPhase && (
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => onOpenPhase(group.phaseId)}
              >
                Open phase
              </button>
            )}
          </div>

          {group.items.map(({ question, chosen }) => {
            const answerIdx = correctIndex(question);
            const chosenText =
              question.options[chosen] && question.options[chosen].text;

            return (
              <div className="review__q" key={question.id}>
                <p className="review__prompt">
                  {renderInline(question.question, "rq-" + question.id)}
                </p>

                {chosenText && (
                  <p className="review__chosen">
                    <span className="review__chosen-label">You picked</span>{" "}
                    <span className="review__letter">
                      {LETTERS[chosen] || "?"}
                    </span>{" "}
                    {renderInline(chosenText, "rc-" + question.id)}
                  </p>
                )}

                {/* The authored explanation, which is the reason this page is
                    worth having at all. It names the misconception rather than
                    just supplying the right option. */}
                {question.explanation && (
                  <p className="review__why">
                    {renderInline(question.explanation, "rw-" + question.id)}
                  </p>
                )}

                {question.options[answerIdx] && (
                  <p className="review__answer">
                    <span className="review__chosen-label">Answer</span>{" "}
                    <span className="review__letter">
                      {LETTERS[answerIdx] || "?"}
                    </span>{" "}
                    {renderInline(
                      question.options[answerIdx].text,
                      "ra-" + question.id,
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
