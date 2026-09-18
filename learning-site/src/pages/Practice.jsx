// A mixed practice set drawn from a whole track, or from everything.
//
// ---------------------------------------------------------------------------
// WHY A SEPARATE VIEW RATHER THAN A BUTTON IN THE PHASE QUIZ
// ---------------------------------------------------------------------------
// `Quiz.jsx` tests the phase you just read, in the order it was written, with the
// lesson text still on screen above it. That is recall with the answer's context
// visible, and it is genuinely useful — but it cannot tell a reader whether they
// KNOW something or merely RECOGNISE it a minute after reading it.
//
// This view is the other half. It samples across phases, drops the surrounding
// context, and shuffles, so each question has to be retrieved rather than
// recognised. Neither replaces the other.
//
// ---------------------------------------------------------------------------
// NO SCORE, NO TIMER, NO PASS MARK — the no-shame rule
// ---------------------------------------------------------------------------
// A deliberate constraint, stated in `Quiz.jsx` and carried in D-019: the reader is
// a beginner studying alone, and a session that ends in "62%" teaches them to avoid
// the practice that helps most. So this view reports what to revisit and never how
// the reader did. `summarise()` has no percentage field to display, which is the
// enforcement — the rule is a missing field, not a comment.
//
// The one consequence worth naming: there is no "check my score" affordance, and
// its absence is intentional rather than unfinished work.
import { useEffect, useMemo, useState } from "react";
import { tracks, loadTrackPhases } from "../data/roadmaps.js";
import { renderInline } from "../lib/renderInline.jsx";
import { poolFrom, filterPool, buildSet, summarise, summariseText } from "../lib/practice.js";

const SIZES = [10, 20, 30, 50];

export default function Practice({ onOpenPhase }) {
  const [scope, setScope] = useState("all");
  const [energy, setEnergy] = useState(null);
  const [size, setSize] = useState(20);

  // The pool needs FULL phase records, because the light index carries `quizIds`
  // but not the questions themselves. Every track file is loaded up front: the
  // whole corpus is about 1.3 MB of JSON and the alternative — loading a track only
  // when the reader picks it — would make "everything" impossible to sample from
  // without silently sampling one track.
  const [pool, setPool] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          tracks.map(async (t) => {
            const res = await loadTrackPhases(t.id);
            if (res.status !== "ready") return [];
            return poolFrom(res.phases, t.id, t.label);
          })
        );
        if (cancelled) return;
        const all = results.flat();
        setPool(all);
        setStatus(all.length ? "ready" : "empty");
      } catch (e) {
        if (cancelled) return;
        setError(String((e && e.message) || e));
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const available = useMemo(
    () => filterPool(pool, { trackId: scope === "all" ? null : scope, energy }),
    [pool, scope, energy]
  );

  // The generated set, plus a key that changes only when the reader asks for a new
  // one. Regenerating on every keystroke or re-render would throw away a set in
  // progress, so the draw is explicit rather than derived.
  // ANSWERS ARE EPHEMERAL, AND THAT IS DELIBERATE.
  //
  // `useQuizAnswers` persists to `vibecoding:quiz:v1`, keyed by question id — and
  // practice draws the SAME question ids as the phase quizzes. Writing practice
  // answers there would overwrite a reader's real phase progress with whatever they
  // happened to pick while practising, and because that key is registered in
  // `transfer.js -> KEYS`, the corruption would then travel in their backups.
  //
  // So this view keeps its answers in memory only. The set is disposable by design:
  // it exists for the twenty minutes you are doing it, and nothing about it needs to
  // survive a reload. Losing it costs a reshuffle.
  const [answers, setAnswers] = useState({});
  const [draw, setDraw] = useState(0);
  const set = useMemo(
    () => buildSet(available, size, Math.random),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [available, size, draw]
  );

  const summary = summarise(set, answers);
  const answeredAll = summary.answered === set.length && set.length > 0;

  function newSet() {
    setAnswers({});
    setDraw((d) => d + 1);
  }

  function choose(questionId, index) {
    setAnswers((a) => ({ ...a, [questionId]: index }));
  }

  if (status === "loading") {
    return (
      <section className="card">
        <h1>Practice</h1>
        <p className="muted">Loading questions…</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="card">
        <h1>Practice</h1>
        <p className="muted">
          The questions could not be loaded{error ? ` (${error})` : ""}. Reloading the page
          usually fixes it.
        </p>
      </section>
    );
  }

  return (
    <div className="page practice">
      <section className="card">
        <h1>Practice</h1>
        <p className="muted">
          Questions drawn from across the curriculum, in a different order each time. Nothing
          here is scored — the point is to find out which ideas you can recall without the
          lesson in front of you.
        </p>

        <div className="practice__controls">
          <label className="practice__control">
            <span className="practice__label">Scope</span>
            <select value={scope} onChange={(e) => { setScope(e.target.value); newSet(); }}>
              <option value="all">Everything ({pool.length} questions)</option>
              {tracks.map((t) => {
                const n = pool.filter((q) => q.trackId === t.id).length;
                return (
                  <option key={t.id} value={t.id}>
                    {t.label} ({n})
                  </option>
                );
              })}
            </select>
          </label>

          <label className="practice__control">
            <span className="practice__label">Effort</span>
            <select value={energy || ""} onChange={(e) => { setEnergy(e.target.value || null); newSet(); }}>
              <option value="">Any</option>
              <option value="low">Quick recall only</option>
              <option value="normal">Up to scenario reasoning</option>
            </select>
          </label>

          <label className="practice__control">
            <span className="practice__label">How many</span>
            <select value={size} onChange={(e) => { setSize(Number(e.target.value)); newSet(); }}>
              {SIZES.map((n) => (
                <option key={n} value={n}>
                  {n} questions
                </option>
              ))}
            </select>
          </label>

          <button type="button" className="btn" onClick={newSet}>
            New set
          </button>
        </div>

        {/* The count is stated so a reader who asked for 50 from a 30-question track
            understands why they got 30 — the alternative is an unexplained short set. */}
        <p className="muted practice__count">
          {available.length === 0
            ? "No questions match that combination."
            : set.length < size
              ? `Only ${available.length} question${available.length === 1 ? "" : "s"} match, so this set has ${set.length}.`
              : `${set.length} questions, drawn from ${available.length}.`}
        </p>
      </section>

      {set.length === 0 ? null : (
        <>
          {set.map((q, i) => {
            const chosen = answers[q.id];
            const isAnswered = chosen !== undefined;
            const isRight = chosen === q.answerIndex;
            return (
              <section className="card practice__q" key={q.id}>
                <p className="practice__prompt">
                  <span className="practice__num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="practice__origin muted">
                    {q.trackLabel} · {q.phaseTitle}
                  </span>
                  {renderInline(q.question, `practice-q-${q.id}`)}
                </p>

                {/* The quiz classes are REUSED rather than duplicated. They are the
                    tested ones — the a11y audit walks this markup for contrast and
                    focus rings — and a parallel set of practice__opt styles would
                    silently drift from them the first time either changed. */}
                <ul className="quiz__options">
                  {q.options.map((opt, oi) => {
                    const showAsCorrect = isAnswered && oi === q.answerIndex;
                    const showAsWrongPick = isAnswered && chosen === oi && oi !== q.answerIndex;
                    return (
                      <li key={oi}>
                        <button
                          type="button"
                          className={
                            "quiz__opt" +
                            (showAsCorrect ? " quiz__opt--correct" : "") +
                            (showAsWrongPick ? " quiz__opt--wrong" : "") +
                            (isAnswered ? " quiz__opt--chosen" : "")
                          }
                          aria-pressed={chosen === oi}
                          disabled={isAnswered}
                          onClick={() => choose(q.id, oi)}
                        >
                          <span className="quiz__letter" aria-hidden="true">
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span>{renderInline(opt, `practice-opt-${q.id}-${oi}`)}</span>
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

                {isAnswered && q.why && (
                  <p className="quiz__why">
                    <strong>{isRight ? "Why that's right:" : "Why:"}</strong>{" "}
                    {renderInline(q.why, `practice-why-${q.id}`)}
                  </p>
                )}

                {isAnswered && (
                  <p className="practice__goto">
                    <button
                      type="button"
                      className="linkish"
                      onClick={() => onOpenPhase && onOpenPhase(q.trackId, q.phaseId)}
                    >
                      Re-read {q.phaseTitle}
                    </button>
                  </p>
                )}
              </section>
            );
          })}

          <section className="card practice__summary">
            <h2>{answeredAll ? "Set finished" : "Progress"}</h2>
            <p className="practice__summary-text">{summariseText(summary)}</p>

            {summary.revisit.length > 0 && (
              <ul className="practice__revisit">
                {summary.revisit.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      className="linkish"
                      onClick={() => onOpenPhase && onOpenPhase(r.trackId, r.phaseId)}
                    >
                      {r.phaseTitle}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="practice__summary-actions">
              <button type="button" className="btn" onClick={newSet}>
                Another set
              </button>
              {summary.answered > 0 && (
                <button type="button" className="btn btn--ghost" onClick={() => setAnswers({})}>
                  Clear my answers
                </button>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
