// Section exams: a scored, timed assessment over one whole track.
//
// ---------------------------------------------------------------------------
// THE ONE PLACE IN THIS SITE THAT GRADES THE READER
// ---------------------------------------------------------------------------
// D-020 (the no-shame rule) says the site does not grade the reader, and that rule
// still holds for the phase quiz and the Practice view. An exam is the documented
// exception, because it answers a different question:
//
//   * Practice and the phase quiz answer "what should I study next?" — a score
//     would turn them into a performance, so they report what to revisit instead.
//   * An exam answers "do I actually know this track?" — and that question cannot
//     be answered without a threshold. "12 to revisit" tells you what to study; it
//     does not tell you whether you know it.
//
// So the rule is SCOPE-LIMITED rather than repealed, and the difference is made
// visible: this view says "Pass mark 80%" on the card before you start, and the
// ungraded views say nothing of the kind. A reader should never be surprised by
// being graded.
//
// ---------------------------------------------------------------------------
// WHY THE EXAM IS IN-MEMORY FOR ITS DURATION
// ---------------------------------------------------------------------------
// Nothing is written until the paper is submitted. Reloading mid-exam restarts it.
// That is a real cost and it is the correct trade: a resumable exam with stored
// answers is not a timed assessment, and the score would stop meaning anything. Only
// the RESULT is persisted.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tracks, loadTrackPhases } from "../data/roadmaps.js";
import { renderInline } from "../lib/renderInline.jsx";
import { poolFrom } from "../lib/practice.js";
import {
  buildExam,
  gradeExam,
  resultText,
  weakPhases,
  secondsLeft,
  formatClock,
  PASS_MARK,
} from "../lib/exam.js";
import { useExamResults, countPassed } from "../hooks/useExamResults.js";

/** The index: pick a track, or review a previous result. */
function ExamIndex({ onStart, results, poolReady }) {
  const passedCount = countPassed(results, tracks.map((t) => t.id));

  return (
    <div className="page exam">
      <section className="card">
        <h1>Exams</h1>
        <p className="muted">
          One exam per track, covering every question that track teaches. Scored, with a{" "}
          {Math.round(PASS_MARK * 100)}% pass mark and a time limit. Unlike the practice sets,
          an exam can be failed — that is the point of it. You can retake as often as you like;
          only your best result is kept.
        </p>
        {passedCount > 0 && (
          <p className="exam__tally">
            {/* Stated as a plain fact and never as a target. The site has no streak and no
                "N of M" anywhere else, and this line is not the place to start. */}
            Passed {passedCount} of {tracks.length}.
          </p>
        )}
      </section>

      <div className="exam__grid">
        {tracks.map((t) => {
          const r = results[t.id];
          const best = r && r.best;
          // The question count comes from the loaded pool, so the card says what the
          // exam actually contains rather than a remembered number.
          const count = t.phases.reduce((n, p) => n + (p.quizIds ? p.quizIds.length : 0), 0);
          return (
            <section className="card exam__card" key={t.id}>
              <h2>{t.label}</h2>
              <p className="muted exam__card-meta">
                {count} question{count === 1 ? "" : "s"} · pass mark{" "}
                {Math.round(PASS_MARK * 100)}%
              </p>

              {best ? (
                <p className={"exam__result" + (best.passed ? " is-pass" : " is-fail")}>
                  <strong>{best.passed ? "Passed" : "Not passed"}</strong> — {best.percent}%
                  {r.attempts > 1 ? ` · ${r.attempts} attempts` : ""}
                </p>
              ) : (
                <p className="muted exam__result">Not attempted yet.</p>
              )}

              <button
                type="button"
                className="btn"
                disabled={!poolReady}
                onClick={() => onStart(t.id, t.label)}
              >
                {best ? "Retake" : "Start"} {t.label} exam
              </button>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default function Exam({ onOpenPhase }) {
  const { results, record, clear } = useExamResults();

  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // The running exam, or null when on the index.
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [graded, setGraded] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const deadlineRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const results_ = await Promise.all(
          tracks.map(async (t) => {
            const res = await loadTrackPhases(t.id);
            if (res.status !== "ready") return [];
            return poolFrom(res.phases, t.id, t.label);
          })
        );
        if (cancelled) return;
        setPool(results_.flat());
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setLoadError(String((e && e.message) || e));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = useCallback(
    (exam) => {
      const g = gradeExam(exam, answers);
      setGraded(g);
      record(exam.trackId, g);
    },
    [answers, record]
  );

  // The countdown. Ticks once a second only while an ungraded exam is running, so
  // the timer costs nothing on the index or after submitting.
  useEffect(() => {
    if (!active || graded) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active, graded]);

  const left = active && !graded ? secondsLeft(deadlineRef.current, now) : 0;

  // TIME EXPIRY SUBMITS RATHER THAN FAILING.
  //
  // Running out of time ends the exam with whatever is answered; unanswered
  // questions count as wrong. What it must NOT do is throw the paper away, or
  // refuse to mark it — a reader who spent forty minutes deserves the mark they
  // earned, and a "come back tomorrow" would be punishment rather than assessment.
  useEffect(() => {
    if (!active || graded) return;
    if (left === 0 && deadlineRef.current !== 0) {
      submit(active);
    }
  }, [left, active, graded, submit]);

  function start(trackId, trackLabel) {
    const exam = buildExam(pool, trackId, trackLabel, Math.random);
    if (exam.total === 0) return;
    setActive(exam);
    setAnswers({});
    setGraded(null);
    setQuestionIndex(0);
    deadlineRef.current = Date.now() + exam.timeLimitMinutes * 60 * 1000;
    setNow(Date.now());
    // Scroll to the top so the exam starts at question 1 rather than wherever the
    // index was scrolled to.
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }

  function exit() {
    setActive(null);
    setGraded(null);
    setAnswers({});
    deadlineRef.current = 0;
  }

  const summary = useMemo(() => (graded ? weakPhases(graded) : []), [graded]);

  if (loading) {
    return (
      <section className="card">
        <h1>Exams</h1>
        <p className="muted">Loading questions…</p>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="card">
        <h1>Exams</h1>
        <p className="muted">
          The questions could not be loaded ({loadError}). Reloading the page usually fixes it.
        </p>
      </section>
    );
  }

  // ---- the index -----------------------------------------------------------
  if (!active) {
    return (
      <>
        <ExamIndex onStart={start} results={results} poolReady={pool.length > 0} />
        <section className="card">
          <h2>Your results</h2>
          <p className="muted">
            Results are stored in this browser only. Back up and restore carries them.
          </p>
          {Object.keys(results).length > 0 ? (
            <button type="button" className="btn btn--ghost" onClick={clear}>
              Clear my exam results
            </button>
          ) : (
            <p className="muted">Nothing recorded yet.</p>
          )}
        </section>
      </>
    );
  }

  // ---- the result ----------------------------------------------------------
  if (graded) {
    return (
      <div className="page exam">
        <section className={"card exam__verdict" + (graded.passed ? " is-pass" : " is-fail")}>
          <h1>{graded.passed ? "Passed" : "Not passed"}</h1>
          <p className="exam__score">
            <strong>{graded.percent}%</strong>
            <span className="muted">
              {" "}
              — {graded.correct} of {graded.total}, pass mark {graded.passPercent}%
            </span>
          </p>
          <p className="exam__verdict-text">{resultText(graded)}</p>
          <div className="exam__actions">
            <button type="button" className="btn" onClick={() => start(active.trackId, active.trackLabel)}>
              Retake this exam
            </button>
            <button type="button" className="btn btn--ghost" onClick={exit}>
              Back to exams
            </button>
          </div>
        </section>

        {summary.length > 0 && (
          <section className="card">
            <h2>Where the marks went</h2>
            <p className="muted">
              Phases you missed questions in, most missed first.
            </p>
            <ul className="exam__weak">
              {summary.map((w) => (
                <li key={w.phaseId}>
                  <button
                    type="button"
                    className="linkish"
                    onClick={() => onOpenPhase && onOpenPhase(active.trackId, w.phaseId)}
                  >
                    {w.phaseTitle}
                  </button>
                  <span className="muted">
                    {" "}
                    — {w.missed} missed
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="card">
          <h2>Every question</h2>
          <ol className="exam__review">
            {graded.results.map((r, i) => {
              const q = active.questions.find((x) => x.id === r.id);
              return (
                <li key={r.id} className={"exam__review-item" + (r.correct ? " is-right" : " is-wrong")}>
                  <p className="exam__review-q">
                    <span className="muted">{i + 1}.</span>{" "}
                    {renderInline(q ? q.question : r.question, `exam-rev-${r.id}`)}
                  </p>
                  <p className="exam__review-line">
                    <span className="muted">Your answer: </span>
                    {r.answered && q ? renderInline(q.options[r.chosen], `exam-you-${r.id}`) : <em>left blank</em>}
                  </p>
                  {!r.correct && q && (
                    <p className="exam__review-line">
                      <span className="muted">Correct: </span>
                      {renderInline(q.options[r.answerIndex], `exam-correct-${r.id}`)}
                    </p>
                  )}
                  {q && q.why && (
                    <p className="quiz__why">
                      <strong>Why:</strong> {renderInline(q.why, `exam-why-${r.id}`)}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    );
  }

  // ---- the exam itself -----------------------------------------------------
  const q = active.questions[questionIndex];
  const answeredCount = Object.keys(answers).length;
  const isLast = questionIndex === active.questions.length - 1;
  const low = left <= 60;

  return (
    <div className="page exam">
      <section className="card exam__bar">
        <div>
          <h1 className="exam__bar-title">{active.trackLabel} exam</h1>
          <p className="muted exam__bar-meta">
            Question {questionIndex + 1} of {active.total} · {answeredCount} answered
          </p>
        </div>
        <p className={"exam__clock" + (low ? " is-low" : "")} aria-live="off">
          {/* aria-live is off deliberately: a countdown announced every second would
              make a screen reader unusable. The expiry is announced by the result. */}
          <span className="muted">Time left </span>
          <strong>{formatClock(left)}</strong>
        </p>
      </section>

      <section className="card">
        <p className="practice__prompt">
          <span className="practice__num" aria-hidden="true">
            {questionIndex + 1}
          </span>
          {renderInline(q.question, `exam-q-${q.id}`)}
        </p>

        {/* Options are shuffled per exam (lib/exam.js), so answer positions carry no
            information between attempts. */}
        <ul className="quiz__options">
          {q.options.map((opt, oi) => (
            <li key={oi}>
              <button
                type="button"
                className={"quiz__opt" + (answers[q.id] === oi ? " quiz__opt--chosen" : "")}
                aria-pressed={answers[q.id] === oi}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
              >
                <span className="quiz__letter" aria-hidden="true">
                  {String.fromCharCode(65 + oi)}
                </span>
                <span>{renderInline(opt, `exam-o-${q.id}-${oi}`)}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* NO EXPLANATION HERE. The phase quiz shows it immediately because it is a
            learning tool; an exam that explains as you go is a quiz with a timer. The
            reasoning is revealed in the review after submitting. */}
        <div className="exam__actions">
          <button
            type="button"
            className="btn btn--ghost"
            disabled={questionIndex === 0}
            onClick={() => setQuestionIndex((i) => Math.max(0, i - 1))}
          >
            ← Previous
          </button>
          {!isLast ? (
            <button type="button" className="btn" onClick={() => setQuestionIndex((i) => i + 1)}>
              Next →
            </button>
          ) : (
            <button type="button" className="btn" onClick={() => submit(active)}>
              Submit exam
            </button>
          )}
        </div>
      </section>

      <section className="card">
        <h2>Questions</h2>
        <p className="muted">Jump to any question. Answered ones are marked.</p>
        <ul className="exam__jump">
          {active.questions.map((qq, i) => (
            <li key={qq.id}>
              <button
                type="button"
                className={
                  "exam__jump-btn" +
                  (i === questionIndex ? " is-current" : "") +
                  (answers[qq.id] !== undefined ? " is-answered" : "")
                }
                aria-current={i === questionIndex ? "true" : undefined}
                aria-label={`Question ${i + 1}${answers[qq.id] !== undefined ? ", answered" : ""}`}
                onClick={() => setQuestionIndex(i)}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
        <div className="exam__actions">
          <button type="button" className="btn" onClick={() => submit(active)}>
            Submit exam
          </button>
          <button type="button" className="btn btn--ghost" onClick={exit}>
            Abandon
          </button>
        </div>
        {answeredCount < active.total && (
          <p className="muted">
            {active.total - answeredCount} question
            {active.total - answeredCount === 1 ? "" : "s"} still blank — blanks are marked
            wrong, so answer everything you can.
          </p>
        )}
      </section>
    </div>
  );
}
