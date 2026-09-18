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

  // THE PHASE-ID CONVENTION, AND THE BUG THAT PASSING ONLY ONE ARGUMENT CAUSED.
  //
  // App's `openPhase(tId, pId, anchor)` treats its FIRST argument as a TRACK id:
  //
  //     openPhase(tId, pId) {
  //       let resolved = tId;
  //       if (!resolved || !findTrack(resolved)) {   // a phase id is not a track
  //         for (const t of tracks) if (t.phases.some(p => p.id === pId)) ...
  //       }
  //       if (!resolved) return;                     // <-- nothing happens
  //     }
  //
  // These buttons called `onOpenPhase(prev.id)` — ONE argument, a PHASE id. So
  // `tId` was a phase id, `findTrack` rejected it, and the fallback scanned for a
  // phase whose id is `undefined`, found none, and returned. Previous and Next
  // therefore did NOTHING, in both variants.
  //
  // It is invisible to every data check: the data is right, and the buttons are
  // correctly rendered, labelled, enabled and focusable. Only the handler had no
  // effect. It was found by a browser sweep that opened all 65 phases — phases 2
  // through 65 each reported the title of phase 1.
  //
  // `onOpenPhase` is called with the PHASE ID ALONE, which is the convention this
  // component uses; App adapts it (see the `onNav` wrapper there). Passing
  // `p.trackId` here would NOT work: `prev`/`next` come from the light index,
  // whose 11 fields do not include `trackId`.
  const goPhase = (p) => {
    if (!onOpenPhase || !p) return undefined;
    return () => onOpenPhase(p.id);
  };

  if (variant === "compact") {
    return (
      <div className="phase-nav phase-nav--compact" aria-label="Phase navigation">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={goPhase(prev)}
          disabled={!prev || !onOpenPhase}
          title={prev ? "Previous: " + shortName(prev) : "This is the first phase"}
        >
          ← {prev ? "Previous" : "First phase"}
        </button>
        <span className="muted phase-nav__position">{position}</span>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={goPhase(next)}
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
            onClick={goPhase(prev)}
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
            onClick={goPhase(next)}
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