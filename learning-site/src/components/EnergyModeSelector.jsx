// Low / Normal / High. Changes which tasks the dashboard offers as the next
// action — a low-energy day should not be shown a 3-hour lab.
// See docs/DESIGN-SYSTEM.md → <EnergyModeSelector>.
//
// ---------------------------------------------------------------------------
// DEAD CODE — PORTED BUT UNREACHABLE
// ---------------------------------------------------------------------------
// Nothing renders this component. `App.jsx` calls `useEnergyMode()` and prints
// the mode in the footer, but this selector — the only way to *change* it — is
// never mounted, so the value is whatever the hook defaults to and the reader
// cannot alter it. See docs/DECISIONS.md → D-008.
//
// ⚠️ The claim in the first paragraph is therefore not true of this app. No
// dashboard offers "the next action" by energy, and neither `energy` nor
// `budget` is passed to any page: `App.jsx` reads both only for the footer text
// on line 305. `acceptsTask` below is dead with the rest of the file. The
// picker it was written for — `lib/today.js`'s `pickToday` — is dead too.
//
// It is kept rather than deleted because removal would have to be redone if the
// career views return. See D-008.

export const MODES = [
  {
    id: "low",
    label: "Low",
    note: "Short review and reading tasks only.",
    accepts: ["low"],
  },
  {
    id: "normal",
    label: "Normal",
    note: "Lessons, practice, and hands-on labs.",
    accepts: ["low", "normal"],
  },
  {
    id: "high",
    label: "High",
    note: "Anything, including long lab sessions.",
    accepts: ["low", "normal", "high"],
  },
];

export function acceptsTask(mode, task) {
  const m = MODES.find((x) => x.id === mode) || MODES[1];
  const energy = task.energy || "normal";
  return m.accepts.includes(energy);
}

export default function EnergyModeSelector({ mode, onChange }) {
  return (
    <fieldset className="energy">
      <legend className="energy__legend">Energy today</legend>
      <div className="energy__options">
        {MODES.map((m) => (
          <label
            key={m.id}
            className={"energy__option" + (m.id === mode ? " is-active" : "")}
            title={m.note}
          >
            <input
              type="radio"
              name="energy-mode"
              value={m.id}
              checked={m.id === mode}
              onChange={() => onChange(m.id)}
            />
            <span>{m.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}