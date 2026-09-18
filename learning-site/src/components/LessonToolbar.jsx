// Sticky controls for the lesson: section progress, section tick-mode, and size.
//
// WHY A MODE TOGGLE
// Every `###`/`####` heading carries a done control, and a 24,000-word lesson
// has 66 of them. Shown unconditionally they add 66 interactive elements to a
// page whose purpose is reading. The control therefore has two modes:
//
// * **Reading** (default) — checkboxes are hidden and a completed section is
//   marked with a quiet tick in its heading. Nothing competes with the prose.
// * **Review** — every checkbox is visible, for the pass where the reader is
//   working through the section list rather than the text.
//
// The mode is local component state, not persisted: it is a within-session
// intent ("I am ticking things off now"), and a reader who reloads mid-lesson
// wants to be reading, which is the default.
//
// Progress here counts *lesson sections*, which is deliberately not the same
// number as the phase checklist below. The two are labelled differently and are
// stored separately, because conflating them would make one of the two lie.

import { SIZES } from "../hooks/useReadingSize.js";

export default function LessonToolbar({
  doneCount,
  total,
  tickMode,
  onToggleTickMode,
  size,
  onSizeChange,
  findOpen = false,
  onToggleFind,
}) {
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="lesson-tools">
      <div className="lesson-tools__progress">
        <span className="lesson-tools__count">
          {doneCount}/{total} sections
        </span>
        <span
          className="lesson-tools__track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={doneCount}
          aria-label="Lesson sections marked done"
        >
          <span className="lesson-tools__fill" style={{ width: pct + "%" }} />
        </span>
      </div>

      <div className="lesson-tools__actions">
        {typeof onToggleFind === "function" && (
          <button
            type="button"
            className={"chip" + (findOpen ? " is-active" : "")}
            aria-pressed={findOpen}
            aria-expanded={findOpen}
            onClick={onToggleFind}
            title={
              findOpen
                ? "Close the in-lesson finder"
                : "Find a word in this lesson without leaving it"
            }
          >
            Find in lesson
          </button>
        )}

        <button
          type="button"
          className={"chip" + (tickMode ? " is-active" : "")}
          aria-pressed={tickMode}
          onClick={onToggleTickMode}
          title={
            tickMode
              ? "Hide the per-section checkboxes and just read"
              : "Show a checkbox on every section to tick them off"
          }
        >
          {tickMode ? "Ticking off" : "Tick off sections"}
        </button>

        <fieldset className="lesson-tools__size">
          <legend className="lesson-tools__size-legend">Text size</legend>
          {SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={"chip chip--s size-" + s.id + (s.id === size ? " is-active" : "")}
              aria-pressed={s.id === size}
              title={s.label}
              onClick={() => onSizeChange(s.id)}
            >
              {s.id === "m" ? "A" : s.id === "l" ? "A+" : s.id === "xl" ? "A++" : "a"}
              <span className="sr-only">{s.label}</span>
            </button>
          ))}
        </fieldset>
      </div>
    </div>
  );
}