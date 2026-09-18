// The keyboard shortcut list, and the button that opens it.
//
// A shortcut nobody knows about is not a feature, so the list is discoverable
// from two places: the `?` key, and a visible control in the topbar. The control
// is always rendered rather than revealed on hover, because a touch user has no
// hover — the same rule the code-block copy button follows.

import { useRef } from "react";
import { SHORTCUTS } from "../hooks/useShortcuts.js";
import { useFocusTrap } from "../hooks/useFocusTrap.js";

export default function ShortcutHelp({ open, onClose }) {
  const closeRef = useRef(null);
  const panelRef = useRef(null);

  // Containment, focus restore and scroll lock all come from the shared hook.
  // This panel already had focus-in and focus-restore; what it lacked was the
  // tab trap, so a keyboard user could Tab straight out of a dialog that
  // declares `aria-modal="true"` into the ~40 controls behind it.
  useFocusTrap(open, { panelRef, initialFocusRef: closeRef });

  if (!open) return null;

  return (
    <div className="shortcuts-backdrop" role="presentation" onClick={onClose}>
      <div
        className="shortcuts"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shortcuts__head">
          <h2 id="shortcuts-title">Keyboard shortcuts</h2>
          <button
            type="button"
            className="shortcuts__close"
            aria-label="Close keyboard shortcuts"
            ref={closeRef}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <ul className="shortcuts__list">
          {SHORTCUTS.map((s) => (
            <li key={s.keys} className="shortcuts__row">
              <kbd className="kbd">{s.keys}</kbd>
              <span className="shortcuts__label">{s.label}</span>
            </li>
          ))}
        </ul>

        <p className="muted shortcuts__note">
          Shortcuts are ignored while you are typing in a field.
        </p>
      </div>
    </div>
  );
}