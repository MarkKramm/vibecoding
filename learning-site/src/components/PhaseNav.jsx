// Previous / next phase navigation.
//
// WHY THIS EXISTS
// The sidebar lists 9–14 phases and the phase body ends after its exit criteria,
// so finishing a phase left the reader with a 24,000-word scroll back to the top
// and a list to re-read. There was no "next" anywhere in the application. On a
// curriculum whose whole point is sequence, that is the single most-missed
// affordance on the page.
//
// Rendered twice — at the top of the phase and again at the end — because the
// two cases are different: at the top the reader is arriving and may want the
// neighbouring phase; at the bottom they have just finished and want the next
// one. The top copy is compact; the bottom copy is the full-width primary call
// to action with both phases named.
//
// At a track boundary the control is present but inert rather than absent: an
// element that vanishes at the end of a track reads as a rendering bug, and the
// honest message is "this was the last one".

import { renderInline } from "../lib/renderInline.jsx";

/** Bare phase name, without the "Phase N — " prefix the title carries. */
function shortName(phase) {
  return phase.title.replace(/^Phase \d+\s*—\s*/, "");
}

export default function PhaseNav({
  prev,
  next,
  onOpenPhase,
  index,
  count,
  variant = "full",
}) {
  const position = index >= 0 ? `Phase ${index + 1} of ${count}` : "";

  if (variant === "compact") {
    return (
      <div className="phase-nav phase-nav--compact" aria-label="Phase navigation">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onOpenPhase ? () => onOpenPhase(prev.id) : undefined}
          disabled={!prev || !onOpenPhase}
          title={prev ? "Previous: " + shortName(prev) : "This is the first phase"}
        >
          ← {prev ? "Previous" : "First phase"}
        </button>
        <span className="muted phase-nav__position">{position}</span>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onOpenPhase ? () => onOpenPhase(next.id) : undefined}
          disabled={!next || !onOpenPhase}
          title={next ? "Next: " + shortName(next) : "This is the last phase"}
        >
          {next ? "Next" : "Last phase"} →
        </button>
      </div>
    );
  }

  return (
    <nav className="phase-nav phase-nav--full" aria-label="Phase navigation">
      <p className="phase-nav__legend">Continue</p>
      <div className="phase-nav__grid">
        {prev ? (
          <button
            type="button"
            className="phase-nav__card"
            onClick={onOpenPhase ? () => onOpenPhase(prev.id) : undefined}
            disabled={!onOpenPhase}
          >
            <span className="phase-nav__dir">← Previous phase</span>
            <span className="phase-nav__name">{shortName(prev)}</span>
            <span className="phase-nav__meta muted">
              {renderInline(prev.goal, "nav-prev-goal")}
            </span>
          </button>
        ) : (
          <span className="phase-nav__card is-empty">
            <span className="phase-nav__dir">← Previous phase</span>
            <span className="phase-nav__name muted">This is the first phase</span>
          </span>
        )}

        {next ? (
          <button
            type="button"
            className="phase-nav__card phase-nav__card--next"
            onClick={onOpenPhase ? () => onOpenPhase(next.id) : undefined}
            disabled={!onOpenPhase}
          >
            <span className="phase-nav__dir">Next phase →</span>
            <span className="phase-nav__name">{shortName(next)}</span>
            <span className="phase-nav__meta muted">
              {renderInline(next.goal, "nav-next-goal")}
            </span>
          </button>
        ) : (
          <span className="phase-nav__card is-empty">
            <span className="phase-nav__dir">Next phase →</span>
            <span className="phase-nav__name muted">
              This is the last phase in the track
            </span>
          </span>
        )}
      </div>
    </nav>
  );
}