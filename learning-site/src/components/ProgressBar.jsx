// Progress is always shown as text as well as a bar, so it is never conveyed
// by colour alone. See docs/DESIGN-SYSTEM.md.

// Coerce to a real number, defaulting to 0.
//
// `pct` was already guarded below (`total > 0 ? … : 0`), but `done` and `total`
// were interpolated RAW into two places: the visible `{done}/{total}` label and
// the `aria-label`. So a caller that omitted `total` rendered "0/undefined" on
// screen, and announced "0 of undefined tasks complete" to a screen reader —
// while the bar itself drew a perfectly plausible 0%.
//
// That combination is the worst kind: it looks like a working component showing
// a real zero. It is the same shape as the Tools library reporting "0 tools"
// with 433 rows in the corpus, and the same shape as an empty <h3> looking like
// a styled heading. A component that cannot render correct numbers should render
// OBVIOUS numbers, not confident wrong ones.
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export default function ProgressBar({ done, total, showLabel = true }) {
  const d = num(done);
  const t = num(total);
  const pct = t > 0 ? Math.round((d / t) * 100) : 0;

  return (
    <div className="progress">
      <div
        className="progress__track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={d + " of " + t + " tasks complete"}
      >
        <div className="progress__fill" style={{ width: pct + "%" }} />
      </div>
      {showLabel && (
        <span className="progress__label">
          {d}/{t} · {pct}%
        </span>
      )}
    </div>
  );
}