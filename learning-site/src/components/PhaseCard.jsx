import ProgressBar from "./ProgressBar.jsx";

// Summary card for one phase. Click opens the phase detail.
// See docs/DESIGN-SYSTEM.md → <PhaseCard>.

// A missing field must LOOK missing.
//
// `{phase.title}` on a phase object without one rendered an empty <h3> — a
// blank line where the title should be, with the card otherwise perfectly
// styled and clickable. Nothing about it signals an error; it reads as a phase
// whose name you have not scrolled to yet.
//
// The Tools library shipped the same defect at page scale: `phase.tools` off the
// light projection became `undefined`, `|| []` made it an empty list, and the
// page confidently reported "0 tools across 10 written tracks" with 433 tool
// rows in the corpus. A missing value that renders as a plausible one is worse
// than a crash, because a crash gets fixed.
//
// So each field falls back to an explicit, visibly-wrong marker rather than to
// nothing. If a real phase ever shows one of these, the data is broken and the
// card says so.
const orPlaceholder = (value, label) => {
  const s = typeof value === "string" ? value.trim() : value == null ? "" : String(value);
  return s || `(${label} missing)`;
};

export default function PhaseCard({ phase, done, total, onOpen }) {
  const title = orPlaceholder(phase.title, "title");
  return (
    <button
      type="button"
      className="phase-card"
      onClick={() => onOpen(phase.id)}
      // The heading is the card's accessible name; with an empty title the
      // button announced as just "1 week" to a screen reader.
      aria-label={title}
    >
      <div className="phase-card__head">
        <h3 className="phase-card__title">{title}</h3>
        <span className="muted phase-card__duration">
          {orPlaceholder(phase.duration, "duration")}
        </span>
      </div>
      <p className="phase-card__goal muted">{orPlaceholder(phase.goal, "goal")}</p>
      <ProgressBar done={done} total={total} />
    </button>
  );
}