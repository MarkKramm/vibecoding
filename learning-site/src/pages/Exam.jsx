// Per-track exams, a rotating all-track capstone, and a resumable comprehensive exam.
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
// Timed track and capstone papers stay in memory and restart on reload. The
// comprehensive mode is the explicit exception: it stores stable IDs, shuffled
// option order and chosen original indexes so it can resume, but leaves out the
// question text and answer key.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tracks, loadTrackPhases } from "../data/roadmaps.js";
import { renderInline } from "../lib/renderInline.jsx";
import { poolFrom } from "../lib/practice.js";
import {
  buildExam,
  buildCapstone,
  buildExhaustiveExam,
  gradeExam,
  resultText,
  weakPhases,
  secondsLeft,
  formatClock,
  PASS_MARK,
} from "../lib/exam.js";
import { useExamResults, countPassed } from "../hooks/useExamResults.js";
import { updateCapstoneState, readResumeSnapshot, writeResumeSnapshot, restoreResumeSnapshot } from "../lib/examState.js";
import { useCapstoneState } from "../hooks/useCapstoneState.js";

/** The index: pick a track, or review a previous result. */
function ExamIndex({ onStart, onStartCapstone, onStartComprehensive, onResumeComprehensive, results, capstoneState, resumeAvailable, poolReady, poolCount }) {
  const passedCount = countPassed(results, tracks.map((t) => t.id));
  const availableTrackCount = tracks.filter((t) => t.phases.length > 0).length;

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
        {passedCount > 0 && <p className="exam__tally">Passed {passedCount} of {availableTrackCount} available track exams.</p>}
      </section>

      <section className="card exam__card">
        <h2>All-track capstone</h2>
        <p className="muted">Ten questions are sampled from each written track (currently {availableTrackCount} tracks, {availableTrackCount * 10} questions). Answered questions from submitted capstones count as seen; blanks and abandoned papers do not change coverage. As more tracks are authored, the capstone grows toward 100 questions. Pass mark {Math.round(PASS_MARK * 100)}%.</p>
        {capstoneState.best && <p className={"exam__result" + (capstoneState.best.passed ? " is-pass" : " is-fail")}><strong>{capstoneState.best.passed ? "Passed" : "Not passed"}</strong> — {capstoneState.best.percent}% · {capstoneState.attempts} attempt{capstoneState.attempts === 1 ? "" : "s"} · {capstoneState.seenIds.length} questions seen</p>}
        <button type="button" className="btn" disabled={!poolReady} onClick={onStartCapstone}>Start / retake capstone</button>
      </section>

      <section className="card exam__card">
        <h2>Comprehensive exam</h2>
        <p className="muted">All {poolCount} questions across every written lesson. Untimed and resumable; your answer selections stay in this browser and are not included in backups. If you stop before submitting, your saved responses do not count as a score.</p>
        {resumeAvailable && <button type="button" className="btn" disabled={!poolReady} onClick={onResumeComprehensive}>Resume comprehensive exam</button>}
        {capstoneState.comprehensive?.best && <p className={"exam__result" + (capstoneState.comprehensive.best.passed ? " is-pass" : " is-fail")}><strong>{capstoneState.comprehensive.best.passed ? "Passed" : "Not passed"}</strong> — {capstoneState.comprehensive.best.percent}%</p>}
        <button type="button" className="btn" disabled={!poolReady} onClick={onStartComprehensive}>{resumeAvailable ? "Restart" : "Start"} comprehensive exam</button>
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
  const { state: capstoneState, save: saveCapstoneState } = useCapstoneState();

  const [pool, setPool] = useState([]);
  const [storedResume, setStoredResume] = useState(null);
  const [resumeAvailable, setResumeAvailable] = useState(false);
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
        const perTrackPools = await Promise.all(
          tracks.map(async (t) => {
            const res = await loadTrackPhases(t.id);
            if (res.status === "empty" && t.phases.length === 0) return { trackId: t.id, pool: [] };
            if (res.status !== "ready") throw new Error(`Track ${t.id} could not be loaded (${res.status}).`);
            return { trackId: t.id, pool: poolFrom(res.phases, t.id, t.label) };
          })
        );
        if (cancelled) return;
        const pool = perTrackPools.flatMap((entry) => entry.pool);
        const indexedCount = tracks.reduce((n, track) => n + track.phases.reduce((m, phase) => m + (phase.quizIds || []).length, 0), 0);
        if (pool.length !== indexedCount) throw new Error(`Loaded ${pool.length} questions, but the curriculum index lists ${indexedCount}.`);
        setPool(pool);
        const snapshot = readResumeSnapshot();
        const restored = restoreResumeSnapshot(snapshot, pool);
        setStoredResume(restored);
        setResumeAvailable(Boolean(restored));
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
      if (exam.mode === "track") record(exam.trackId, g);
      else {
        const mode = exam.mode === "comprehensive" ? "comprehensive" : "capstone";
        const next = updateCapstoneState(capstoneState, exam.questions, g, new Date().toISOString(), mode);
        saveCapstoneState(next);
        if (mode === "comprehensive") {
          writeResumeSnapshot(null);
          setResumeAvailable(false);
          setStoredResume(null);
        }
      }
    },
    [answers, record, capstoneState, saveCapstoneState]
  );

  // Autosave only the untimed comprehensive session. Timed track and capstone
  // exams intentionally stay in memory and still restart if the page reloads.
  useEffect(() => {
    if (!active || active.mode !== "comprehensive" || graded) return;
    const snapshot = makeResumeSnapshot(active, answers, questionIndex);
    const saved = writeResumeSnapshot(snapshot);
    if (saved) setStoredResume(restoreResumeSnapshot(snapshot, pool));
    setResumeAvailable(saved);
  }, [active, answers, questionIndex, graded, pool]);

  useEffect(() => {
    if (!active || graded || !active.timed) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active, graded]);

  const left = active && !graded && active.timed ? secondsLeft(deadlineRef.current, now) : null;

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

  function begin(exam, resumable = false) {
    if (!exam || exam.total === 0) return;
    setActive(exam);
    setAnswers({});
    setGraded(null);
    setQuestionIndex(0);
    deadlineRef.current = exam.timed ? Date.now() + exam.timeLimitMinutes * 60 * 1000 : 0;
    if (resumable) {
      const snapshot = makeResumeSnapshot(exam, {}, 0);
      const saved = writeResumeSnapshot(snapshot);
      setStoredResume(restoreResumeSnapshot(snapshot, pool));
      setResumeAvailable(saved);
    }
    setNow(Date.now());
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }

  function start(trackId, trackLabel) {
    begin(buildExam(pool, trackId, trackLabel, Math.random));
  }

  function startCapstone() {
    begin(buildCapstone(pool, tracks.filter((t) => t.phases.length > 0).map((t) => t.id), capstoneState.seenIds, Math.random));
  }

  function startComprehensive() {
    begin(buildExhaustiveExam(pool, Math.random), true);
  }

  function resumeComprehensive() {
    const restored = restoreResumeSnapshot(readResumeSnapshot(), pool) || storedResume;
    if (!restored) {
      writeResumeSnapshot(null);
      setResumeAvailable(false);
      setStoredResume(null);
      return;
    }
    setActive(restored.exam);
    setAnswers(restored.answers);
    setStoredResume(restored);
    setQuestionIndex(restored.questionIndex);
    setGraded(null);
    deadlineRef.current = 0;
    setResumeAvailable(true);
    setNow(Date.now());
  }

  function exit() {
    // An untimed comprehensive paper is autosaved before every state change;
    // exiting returns to the index without discarding that resumable session.
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
        <ExamIndex
          onStart={start}
          onStartCapstone={startCapstone}
          onStartComprehensive={startComprehensive}
          onResumeComprehensive={resumeComprehensive}
          results={results}
          capstoneState={capstoneState}
          resumeAvailable={resumeAvailable}
          poolReady={pool.length > 0}
          poolCount={pool.length}
        />
        <section className="card">
          <h2>Your results</h2>
          <p className="muted">
            Results are stored in this browser only. Back up and restore carries results and capstone coverage. Active comprehensive sessions remain local and are not included.
          </p>
          {Object.keys(results).length > 0 || capstoneState.attempts > 0 || capstoneState.comprehensive.attempts > 0 || resumeAvailable ? (
            <button type="button" className="btn btn--ghost" onClick={() => {
              clear();
              if (active?.mode === "comprehensive") {
                setActive(null);
                setGraded(null);
                setAnswers({});
                deadlineRef.current = 0;
              }
              writeResumeSnapshot(null);
              setResumeAvailable(false);
              setStoredResume(null);
              const clean = { seenIds: [], best: null, attempts: 0, comprehensive: { best: null, attempts: 0 } };
              saveCapstoneState(clean);
            }}>
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
            <button type="button" className="btn" onClick={() => {
              if (active.mode === "capstone") startCapstone();
              else if (active.mode === "comprehensive") startComprehensive();
              else start(active.trackId, active.trackLabel);
            }}>
              Retake this exam
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => {
              exit();
              writeResumeSnapshot(null);
              setResumeAvailable(false);
              setStoredResume(null);
            }}>
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
                    onClick={() => onOpenPhase && onOpenPhase(w.trackId || active.trackId, w.phaseId)}
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
  const low = active.timed && left <= 60;
  const unansweredHint = active.mode === "comprehensive"
    ? (resumeAvailable ? "Your unanswered questions are saved and can be completed later." : "Progress is not currently saved; keep this page open.")
    : `${active.total - answeredCount} question${active.total - answeredCount === 1 ? "" : "s"} still blank — blanks are marked wrong, so answer everything you can.`;

  return (
    <div className="page exam">
      <section className="card exam__bar">
        <div>
          <h1 className="exam__bar-title">{active.trackLabel} exam</h1>
          <p className="muted exam__bar-meta">
            Question {questionIndex + 1} of {active.total} · {answeredCount} answered
            {active.mode === "capstone" && ` · ${capstoneState.seenIds.length} unique questions seen`}
          </p>
        </div>
        {active.timed ? (
          <p className={"exam__clock" + (low ? " is-low" : "")} aria-live="off">
            <span className="muted">Time left </span><strong>{formatClock(left)}</strong>
          </p>
        ) : (
          <p className="exam__clock"><strong>Untimed · progress saved on this device</strong></p>
        )}
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
            {active.mode === "comprehensive" ? (resumeAvailable ? "Save and exit" : "Exit (save unavailable)") : "Abandon"}
          </button>
        </div>
        {answeredCount < active.total && <p className="muted">{unansweredHint}</p>}
        {active.mode === "comprehensive" && !resumeAvailable && <p role="alert" className="muted">Browser storage could not save this session. Keep this page open or your current answers may be lost.</p>}
      </section>
    </div>
  );
}
