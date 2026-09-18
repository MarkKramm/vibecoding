// One checklist item. Toggling saves immediately — no save button, no
// confirmation. See docs/DESIGN-SYSTEM.md → Interaction rules.

import { renderInline } from "../lib/renderInline.jsx";

export default function ChecklistItem({ item, checked, onToggle }) {
  return (
    <label className={"check" + (checked ? " check--done" : "")}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(item.id)}
      />
      <span className="check__text">{renderInline(item.text, item.id)}</span>
      {item.energy && (
        <span className={"badge badge--" + item.energy}>{item.energy}</span>
      )}
    </label>
  );
}