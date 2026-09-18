// A single-value progress ring. Replaces the bar where a proportion is being
// reported rather than a task being tracked.
//
// WHY THIS EXISTS
// The dashboard had a wide empty half and one number worth repeating in it: how
// far through the track the reader is. A ring is a progress bar bent into a
// circle, and it carries two obligations a bar does not:
//
// 1. It is a chart, so it must not be the only carrier of the value. The
//    percentage and the raw count are rendered as text beside it, and the svg is
//    aria-hidden — a screen reader gets the sentence, not the circle.
// 2. It animates nothing. The arc is drawn at its final length with no
//    transition, because this is a readout, not a reward.
//
// The radius is fixed and expressed in the same units as the viewBox, so the
// dash arithmetic below cannot drift from the rendered geometry.

const SIZE = 96;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProgressRing({ value, label }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const filled = (pct / 100) * CIRCUMFERENCE;

  return (
    <svg
      className="ring"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      role="img"
      aria-label={label || pct + "% complete"}
    >
      <circle
        className="ring__track"
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        strokeWidth={STROKE}
        fill="none"
      />
      {/* Rotated so the arc starts at twelve o'clock and fills clockwise, which
          is the direction everyone reads a clock in. */}
      <circle
        className="ring__fill"
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        strokeWidth={STROKE}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={filled + " " + CIRCUMFERENCE}
        transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
      />
    </svg>
  );
}