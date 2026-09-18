// How long the reader has today. Changes which practice task the dashboard
// offers as the next action.
//
// ---------------------------------------------------------------------------
// DEAD CODE — PORTED BUT UNREACHABLE
// ---------------------------------------------------------------------------
// Nothing renders this component, so the reader cannot set a time budget. This
// is the one file the dead-code audit is easiest to get wrong about: it is the
// ONLY importer of `lib/today.js`, so a check that asks "is `today.js` imported?"
// answers yes and concludes `today.js` is live. It is not — the importer is
// itself unreachable from `src/main.jsx`, and `bandInfo` (the single symbol it
// pulls) never renders. Reachability, not an import grep, is what settles it.
// See docs/DECISIONS.md → D-008.
//
// This also contradicts D-004, which says `today.js` "is still imported for its
// `BANDS` labels". The import line exists; the labels do not reach the screen.
//
// ⚠️ The claim in the first paragraph is therefore not true of this app. See the
// same note in `EnergyModeSelector.jsx`: `App.jsx` calls `useTimeBudget()` and
// prints the value in the footer, but no dashboard offers a task by budget.
//
// It is kept rather than deleted because removal would have to be redone if the
// career views return. See D-008.
//
// WHY THREE OPTIONS AND NOT A NUMBER
// The bands in lib/today.js are coarse because the underlying data is coarse —
// 82% of the 183 practice tasks sit between 20 and 90 minutes, so a minute
// slider would imply a precision nobody has. See docs/DECISIONS.md → D-021.
//
// WHY IT SAYS "ESTIMATE"
// The band on each task is an authored judgement, not a measurement. Nobody has
// timed these tasks. Presenting a guess with the same visual confidence as a
// measurement is the failure mode this label exists to prevent — a reader with
// an hour who is handed a "45 minute" task that is really a three-hour install
// will conclude the curriculum is unrealistic.
//
// WHY `ongoing` IS NOT AN OPTION
// It is a band a task can have, not an amount of time a reader can have. It
// appears in the legend below so the reader can see why some work never shows up
// as a suggestion.

import { BUDGETS } from "../hooks/useTimeBudget.js";
import { bandInfo } from "../lib/today.js";

// Reader-facing labels for the three budgets. Kept here rather than in the hook
// so the hook stays free of presentation, and rather than in lib/today.js so
// that module stays free of UI wording.
const LABELS = {
  quick: { label: "Under 30 min", short: "Short" },
  focused: { label: "30–90 min", short: "Focused" },
  deep: { label: "90 min +", short: "Deep" },
};

export default function TimeBudgetSelector({ budget, onChange }) {
  return (
    <fieldset className="budget">
      <legend className="budget__legend">Time today</legend>
      <div className="budget__options">
        {BUDGETS.map((id) => {
          const band = bandInfo(id);
          return (
            <label
              key={id}
              className={"budget__option" + (id === budget ? " is-active" : "")}
              title={band ? band.note : ""}
            >
              <input
                type="radio"
                name="time-budget"
                value={id}
                checked={id === budget}
                onChange={() => onChange(id)}
              />
              <span>{LABELS[id].label}</span>
            </label>
          );
        })}
      </div>
      <p className="budget__note">
        How long you have is an estimate — nobody has timed these tasks.
      </p>
    </fieldset>
  );
}