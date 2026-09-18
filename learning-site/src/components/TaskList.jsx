// Hands-on practice tasks, each with a place to write the answer.
//
// WHY THE ANSWER BOX IS HIDDEN UNTIL ASKED FOR
// A phase carries up to a dozen practice tasks. Rendering twelve open textareas
// would triple the height of a section that is scaffolding around the lesson,
// and an empty textarea under every task reads as a demand rather than an offer.
// One is revealed at a time, and a task with an answer says so with a dot — the
// smallest possible signal that something is there, with no count and no
// completion language anywhere.
//
// The answer is keyed by the task's minted id (`<phase-id>-t01`), never by its
// position in the list, so inserting a task above it cannot move one reader's
// answer onto a different question. See docs/DECISIONS.md → D-019.
//
// Tasks arriving as plain strings are handled rather than crashing: the content
// pipeline emits `{ id, text }`, but a stale generated file predating that change
// would otherwise blank the whole section. It degrades to a read-only list.

import { useState } from "react";
import { renderInline } from "../lib/renderInline.jsx";

export default function TaskList({ tasks, phaseId, answers, onAnswer }) {
  const [openId, setOpenId] = useState(null);

  if (!tasks || !tasks.length) {
    return <p className="muted">This phase lists no practice tasks.</p>;
  }

  return (
    <ol className="task-list">
      {tasks.map((task, i) => {
        // Tolerate the pre-id string shape rather than rendering nothing.
        const isObject = task && typeof task === "object";
        const id = isObject ? task.id : null;
        const text = isObject ? task.text : String(task);
        const answer = id && answers ? answers[id] || "" : "";
        const hasAnswer = answer.trim() !== "";
        const isOpen = id !== null && openId === id;

        return (
          <li key={id || i} className={"task" + (hasAnswer ? " task--answered" : "")}>
            <div className="task__head">
              <span className="task__text">{renderInline(text, `task-${i}`)}</span>
              {id && (
                <button
                  type="button"
                  className="chip chip--tiny task__toggle"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : id)}
                >
                  {isOpen
                    ? "Close"
                    : hasAnswer
                    ? "Your answer"
                    : "Write your answer"}
                  {hasAnswer && <span className="task__dot" aria-hidden="true" />}
                </button>
              )}
            </div>

            {isOpen && (
              <>
                <label className="sr-only" htmlFor={"answer-" + id}>
                  Your answer to task {i + 1}
                </label>
                <textarea
                  id={"answer-" + id}
                  className="task__area"
                  rows={6}
                  spellCheck="true"
                  value={answer}
                  placeholder="Work it out here, in your own words. Nothing is graded."
                  onChange={(e) => onAnswer(phaseId, id, e.target.value)}
                />
                <p className="muted task__foot">
                  Saved as you type, on this machine only, and included in{" "}
                  <strong>Back up &amp; restore</strong>.
                </p>
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}