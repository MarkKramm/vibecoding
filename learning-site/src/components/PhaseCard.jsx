import ProgressBar from "./ProgressBar.jsx";

// Summary card for one phase. Click opens the phase detail.
// See docs/DESIGN-SYSTEM.md → <PhaseCard>.

export default function PhaseCard({ phase, done, total, onOpen }) {
  return (
    <button type="button" className="phase-card" onClick={() => onOpen(phase.id)}>
      <div className="phase-card__head">
        <h3 className="phase-card__title">{phase.title}</h3>
        <span className="muted phase-card__duration">{phase.duration}</span>
      </div>
      <p className="phase-card__goal muted">{phase.goal}</p>
      <ProgressBar done={done} total={total} />
    </button>
  );
}