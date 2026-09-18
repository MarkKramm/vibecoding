// Progress is always shown as text as well as a bar, so it is never conveyed
// by colour alone. See docs/DESIGN-SYSTEM.md.

export default function ProgressBar({ done, total, showLabel = true }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="progress">
      <div
        className="progress__track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={done + " of " + total + " tasks complete"}
      >
        <div className="progress__fill" style={{ width: pct + "%" }} />
      </div>
      {showLabel && (
        <span className="progress__label">
          {done}/{total} · {pct}%
        </span>
      )}
    </div>
  );
}