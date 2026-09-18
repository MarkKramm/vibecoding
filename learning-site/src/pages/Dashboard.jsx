// The landing view: what the curriculum contains, and where to start.
//
// Deliberately a MAP rather than a to-do list. The sibling CS Roadmap's dashboard
// is built around a schedule, applications and certifications, because that
// project ends in a job hunt with dates attached. This curriculum has no
// deadline: the reader is building a skill, and the useful landing view is
// therefore "what exists, what is finished, what is next" rather than "what is
// due".
//
// The four tracks still being authored are shown as empty rather than hidden.
// A curriculum that appears to be 6 tracks when 10 are planned misleads the
// reader about the shape of the thing they are committing to, and showing the
// gaps makes progress visible as phases land.

import { useMemo } from "react";
import ProgressBar from "../components/ProgressBar.jsx";
import ProgressRing from "../components/ProgressRing.jsx";
import PhaseCard from "../components/PhaseCard.jsx";
import { countDoneIds } from "../hooks/useProgress.js";
import { corpusTotals, tracks } from "../data/roadmaps.js";
import { renderInline } from "../lib/renderInline.jsx";

export default function Dashboard({ done, onOpenTrack, onOpenPhase, saved }) {
  const totals = useMemo(() => corpusTotals(), []);

  // Ticking a box in a phase should move the ring without a reload, so the
  // counts are derived from `done` on every render rather than captured once.
  //
  // Counted from the light index's ID arrays, NOT from the phase objects: the
  // dashboard renders every track at once, and loading ten tracks' worth of
  // prose to count ticks would defeat the point of the light index.
  const perTrack = useMemo(
    () =>
      tracks.map((t) => {
        const checklistIds = t.phases.flatMap((p) => p.checklistIds || []);
        const taskIds = t.phases.flatMap((p) => p.taskIds || []);
        return {
          track: t,
          checklistDone: countDoneIds(done, checklistIds),
          checklistTotal: checklistIds.length,
          taskDone: countDoneIds(done, taskIds),
          taskTotal: taskIds.length,
        };
      }),
    [done]
  );

  const overallDone = perTrack.reduce((n, t) => n + t.checklistDone, 0);
  const overallTotal = perTrack.reduce((n, t) => n + t.checklistTotal, 0);

  const started = useMemo(() => {
    const out = [];
    for (const t of perTrack) {
      if (t.checklistDone > 0 || t.taskDone > 0) out.push(t);
    }
    return out;
  }, [perTrack]);

  return (
    <div className="dashboard">
      <header className="dashboard__head">
        <div>
          <h1>Vibecoding &amp; the AI Era</h1>
          <p className="muted">
            A complete path from what a model is to getting hired to work with
            one. Every phase has a lesson, practice tasks and a quiz, and every
            number below is counted from the curriculum itself.
          </p>
        </div>
        <ProgressRing
          value={overallTotal > 0 ? Math.round((overallDone / overallTotal) * 100) : 0}
          label={`${overallDone} of ${overallTotal} checklist items complete`}
        />
      </header>

      <section className="card" aria-labelledby="corpus-heading">
        <h2 id="corpus-heading">What is here</h2>
        <dl className="statgrid">
          <div>
            <dt>Tracks</dt>
            <dd>
              {totals.tracksWithContent}
              <span className="muted"> of {totals.tracks} written</span>
            </dd>
          </div>
          <div>
            <dt>Phases</dt>
            <dd>{totals.phases}</dd>
          </div>
          <div>
            <dt>Lesson words</dt>
            <dd>{totals.lessonWords.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Practice tasks</dt>
            <dd>{totals.tasks}</dd>
          </div>
          <div>
            <dt>Checklist items</dt>
            <dd>{totals.checklist}</dd>
          </div>
          <div>
            <dt>Quiz questions</dt>
            <dd>{totals.quiz}</dd>
          </div>
        </dl>
      </section>

      {started.length > 0 && (
        <section className="card" aria-labelledby="inprogress-heading">
          <h2 id="inprogress-heading">In progress</h2>
          <ul className="plainlist">
            {started.map((t) => (
              <li key={t.track.id}>
                <button
                  type="button"
                  className="linkish"
                  onClick={() => onOpenTrack(t.track.id)}
                >
                  {t.track.label}
                </button>
                <ProgressBar
                  done={t.checklistDone}
                  total={t.checklistTotal}
                />
              </li>
            ))}
          </ul>
          {saved && saved.phaseId && (
            <p className="muted">
              Last opened:{" "}
              <button
                type="button"
                className="linkish"
                onClick={() => onOpenPhase(saved.trackId, saved.phaseId)}
              >
                {saved.title || saved.phaseId}
              </button>
            </p>
          )}
        </section>
      )}

      {tracks.map((t) => {
        const stats = perTrack.find((x) => x.track.id === t.id);
        const empty = t.phases.length === 0;
        return (
          <section
            key={t.id}
            className={"card trackblock" + (empty ? " is-empty" : "")}
            aria-labelledby={"track-" + t.id}
          >
            <div className="trackblock__head">
              <h2 id={"track-" + t.id}>
                <button
                  type="button"
                  className="linkish"
                  onClick={() => onOpenTrack(t.id)}
                  disabled={empty}
                >
                  {t.label}
                </button>
              </h2>
              <span className="muted">
                {empty ? "not yet written" : `${t.phases.length} phases`}
              </span>
            </div>
            <p className="muted">{renderInline(t.blurb || t.note || "", "blurb-" + t.id)}</p>

            {!empty && (
              <>
                <ProgressBar
                  done={stats.checklistDone}
                  total={stats.checklistTotal}
                />
                <div className="phasegrid">
                  {t.phases.map((p) => (
                    <PhaseCard
                      key={p.id}
                      phase={p}
                      done={countDoneIds(done, p.checklistIds || [])}
                      total={(p.checklistIds || []).length}
                      onOpen={() => onOpenPhase(t.id, p.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
