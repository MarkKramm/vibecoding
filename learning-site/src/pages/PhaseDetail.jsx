// One phase, in full: the lesson, then the four things you do with it.
//
// ORDER IS THE PEDAGOGY, and it is not arbitrary:
//   1. Lesson      — read the mechanism first.
//   2. Practice    — do something with it, still open-book.
//   3. Checklist   — confirm you can state each idea unaided.
//   4. Quiz        — check you can hold it in conversation.
//
// The quiz is deliberately LAST. Put first, it becomes a test of what the reader
// already knew; put last, after the lesson and the tasks, it tests what the phase
// taught. This ordering is the reason the no-shame rule in lib/quiz.js can be so
// absolute: by the time a reader meets a question, they have been given every
// opportunity to know the answer.

import ProgressBar from "../components/ProgressBar.jsx";
import ChecklistItem from "../components/ChecklistItem.jsx";
import ToolCard from "../components/ToolCard.jsx";
import Lesson from "../components/Lesson.jsx";
import PhaseNav from "../components/PhaseNav.jsx";
import NotesPanel from "../components/NotesPanel.jsx";
import TaskList from "../components/TaskList.jsx";
import Quiz from "../components/Quiz.jsx";
import PhaseTransfer from "../components/PhaseTransfer.jsx";
import {
  ReadingBar,
  ResumePrompt,
  useReadingProgress,
} from "../components/ReadingPosition.jsx";
import { countDone } from "../hooks/useProgress.js";
import { useLesson } from "../hooks/useLesson.js";
import { useNotes } from "../hooks/useNotes.js";
import { renderInline } from "../lib/renderInline.jsx";

export default function PhaseDetail({
  phase,
  done,
  onToggle,
  onBack,
  anchorRef,
  prev,
  next,
  index,
  phaseCount,
  onOpenPhase,
  onVisitSection,
  lastSection,
  size,
  onSizeChange,
  scale,
}) {
  const doneCount = countDone(done, phase.checklist || []);

  // The reader's own writing for this phase. Its own store, its own key, and
  // deliberately not folded into progress: ticking a box and writing an answer
  // are different acts and neither should be able to imply the other.
  const { notes, setNote, setAnswer, clearPhase } = useNotes();
  const phaseNotes = notes[phase.id] || { note: "", answers: {} };

  const lessonState = useLesson(phase);
  const lesson = lessonState.lesson;
  // `active` is the phase id: reading progress is tracked per phase, and the
  // hook decides internally what it needs to persist.
  const reading = useReadingProgress(phase.id);

  const checklist = phase.checklist || [];
  const tasks = phase.tasks || [];
  const tools = phase.tools || [];
  const resources = phase.resources || [];
  const skills = phase.skills || [];
  const topics = phase.topics || [];
  const deliverableItems = phase.deliverableItems || [];
  const freeVsPaid = phase.freeVsPaid || null;

  return (
    <article className="phase">
      <ReadingBar fraction={reading.fraction || 0} />

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <button type="button" className="linkish" onClick={onBack}>
          ← All tracks
        </button>
        <span className="muted">
          Phase {index + 1} of {phaseCount}
        </span>
      </nav>

      <header className="phase__head">
        <h1>{phase.title}</h1>
        <p className="muted">
          {phase.duration}
          {phase.durationWeeks ? ` · ${phase.durationWeeks} week` : ""}
          {phase.lessonWordCount
            ? ` · ${phase.lessonWordCount.toLocaleString()} lesson words`
            : ""}
        </p>
        {phase.goal && (
          <p className="phase__goal">{renderInline(phase.goal, "goal-" + phase.id)}</p>
        )}
        <ProgressBar done={doneCount} total={checklist.length} />
      </header>

      {lastSection && lastSection.id && (
        <ResumePrompt
          section={lastSection}
          firstSectionId={lesson && lesson.toc && lesson.toc.length ? lesson.toc[0].id : null}
          onJump={(id) => {
            anchorRef.current = id;
          }}
        />
      )}

      {(skills.length > 0 || topics.length > 0) && (
        <section className="card" aria-labelledby="learn-heading">
          <h2 id="learn-heading">What this phase covers</h2>
          {skills.length > 0 && (
            <>
              <h3>Skills you'll gain</h3>
              <ul className="plainlist">
                {skills.map((s, i) => (
                  <li key={i}>{renderInline(s, `skill-${phase.id}-${i}`)}</li>
                ))}
              </ul>
            </>
          )}
          {topics.length > 0 && (
            <>
              <h3>Specific topics</h3>
              {/* Topics are NOT strings. Each is a { heading, items[] } group —
                  the phase's own sub-outline — so a plain string list would
                  render "[object Object]" or, as React does here, throw. The
                  heading is the author's name for the cluster and the items are
                  what is under it, which is exactly the structure worth keeping:
                  flattening it would lose the grouping the author chose. */}
              {topics.map((topic, i) =>
                topic && typeof topic === "object" ? (
                  <div key={i} className="topicgroup">
                    {topic.heading && <h4>{renderInline(topic.heading, `topic-h-${phase.id}-${i}`)}</h4>}
                    <ul className="plainlist">
                      {(topic.items || []).map((item, j) => (
                        <li key={j}>{renderInline(item, `topic-${phase.id}-${i}-${j}`)}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  // Tolerate a plain string so an older generated file, or a
                  // phase authored before the grouped shape, still renders.
                  <ul key={i} className="plainlist">
                    <li>{renderInline(topic, `topic-${phase.id}-${i}`)}</li>
                  </ul>
                )
              )}
            </>
          )}
        </section>
      )}

      {lessonState.status === "loading" && (
        <p className="muted">Loading lesson…</p>
      )}
      {lessonState.status === "error" && (
        <p className="muted">
          Could not load this lesson ({lessonState.message}).
        </p>
      )}
      {lessonState.status === "ready" && lesson && (
        <Lesson
          title={lesson.title || phase.lessonTitle}
          blocks={lesson.blocks}
          toc={lesson.toc || []}
          anchorRef={anchorRef}
          phaseId={phase.id}
          onActiveSection={onVisitSection}
          size={size}
          onSizeChange={onSizeChange}
          scale={scale}
        />
      )}
      {lessonState.status === "empty" && (
        <section className="card">
          <h2>{phase.lessonTitle || "Lesson"}</h2>
          <p className="muted">
            This phase has no lesson body yet. The tasks and checklist below are
            the whole of it.
          </p>
        </section>
      )}

      {tools.length > 0 && (
        <section className="card" aria-labelledby="tools-heading">
          <h2 id="tools-heading">Tools for this phase</h2>
          <div className="toolgrid">
            {tools.map((t, i) => (
              <ToolCard key={i} tool={t} />
            ))}
          </div>
        </section>
      )}

      {resources.length > 0 && (
        <section className="card" aria-labelledby="resources-heading">
          <h2 id="resources-heading">Free and cheap resources</h2>
          {/* Resources are { name, url } objects, not strings. The name often
              ends with its own dash in the source ("… Models** —"), because the
              Markdown author wrote a link as "name — url"; rendering the raw url
              after that would double the punctuation, so the url is used as the
              link target and the trailing dash is trimmed. */}
          <ul className="plainlist reslist">
            {resources.map((r, i) => {
              if (!r || typeof r !== "object") {
                return <li key={i}>{renderInline(r, `res-${phase.id}-${i}`)}</li>;
              }
              const label = String(r.name || "Resource").replace(/\s*[—–-]\s*$/, "");
              return (
                <li key={i}>
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noreferrer noopener">
                      {renderInline(label, `res-${phase.id}-${i}`)}
                    </a>
                  ) : (
                    renderInline(label, `res-${phase.id}-${i}`)
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {tasks.length > 0 && (
        <section className="card" aria-labelledby="tasks-heading">
          <h2 id="tasks-heading">Hands-on practice</h2>
          <TaskList
            tasks={tasks}
            done={done}
            onToggle={onToggle}
            phaseId={phase.id}
          />
        </section>
      )}

      {deliverableItems.length > 0 && (
        <section className="card" aria-labelledby="deliverable-heading">
          <h2 id="deliverable-heading">Deliverable</h2>
          {phase.deliverable && (
            <p className="muted">{renderInline(phase.deliverable, `del-${phase.id}`)}</p>
          )}
          <ul className="plainlist">
            {deliverableItems.map((d, i) => (
              <li key={i}>{renderInline(d, `ditem-${phase.id}-${i}`)}</li>
            ))}
          </ul>
        </section>
      )}

      {checklist.length > 0 && (
        <section className="card" aria-labelledby="checklist-heading">
          <h2 id="checklist-heading">Checklist</h2>
          <ul className="checklist">
            {checklist.map((c) => (
              <ChecklistItem key={c.id} item={c} done={done} onToggle={onToggle} />
            ))}
          </ul>
        </section>
      )}

      {phase.quiz && phase.quiz.length > 0 && (
        <section className="card" aria-labelledby="quiz-heading">
          <h2 id="quiz-heading">Quiz</h2>
          <Quiz questions={phase.quiz} />
        </section>
      )}

      {phase.exitCriteria && (
        <section className="card" aria-labelledby="exit-heading">
          <h2 id="exit-heading">You're ready to move on when…</h2>
          <p>{renderInline(phase.exitCriteria, `exit-${phase.id}`)}</p>
        </section>
      )}

      {freeVsPaid && (
        <section className="card" aria-labelledby="fvp-heading">
          <h2 id="fvp-heading">Free vs paid</h2>
          {freeVsPaid.freeEnough && (
            <>
              <h3>What's free is enough</h3>
              {String(freeVsPaid.freeEnough)
                .split(/\n\n+/)
                .map((p, i) => (
                  <p key={i}>{renderInline(p, `fvp-free-${phase.id}-${i}`)}</p>
                ))}
            </>
          )}
          {freeVsPaid.paidUpgrade && (
            <>
              <h3>What a paid tier adds</h3>
              {String(freeVsPaid.paidUpgrade)
                .split(/\n\n+/)
                .map((p, i) => (
                  <p key={i}>{renderInline(p, `fvp-paid-${phase.id}-${i}`)}</p>
                ))}
            </>
          )}
          {freeVsPaid.whenWorthPaying && (
            <>
              <h3>When it's worth paying</h3>
              {String(freeVsPaid.whenWorthPaying)
                .split(/\n\n+/)
                .map((p, i) => (
                  <p key={i}>{renderInline(p, `fvp-when-${phase.id}-${i}`)}</p>
                ))}
            </>
          )}
        </section>
      )}

      <NotesPanel
        phaseId={phase.id}
        notes={phaseNotes}
        onNote={(text) => setNote(phase.id, text)}
        onAnswer={(taskId, text) => setAnswer(phase.id, taskId, text)}
        onClear={() => clearPhase(phase.id)}
        tasks={tasks}
      />

      <PhaseTransfer phase={phase} />

      <PhaseNav
        prev={prev}
        next={next}
        onOpenPhase={onOpenPhase}
      />
    </article>
  );
}
