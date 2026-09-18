// Focus containment for overlays.
//
// WHY THIS IS A SHARED HOOK
// Four overlays in this app (the mobile drawer, ShortcutHelp, DataTransfer, and
// the LessonFinder) each needed the same three behaviours: keep Tab inside the
// panel, restore focus to whatever opened it, and stop the page behind from
// scrolling. Each had implemented roughly one of the three. Two declared
// `aria-modal="true"` while the content behind stayed fully tabbable, which is
// worse than saying nothing: it tells assistive tech the background is inert
// when it is not, so a screen-reader user is given a false picture of the page.
//
// The rule this encodes: MODAL MEANS MODAL. If a surface declares itself modal
// it must own the tab order, or it must stop claiming to be modal. `body {
// overflow: hidden }` only stops the scrollbar — it does nothing to the tab
// order, which is why every one of these panels was still escapable by keyboard.
//
// WHAT IT DOES NOT DO
// It does not render a backdrop, handle Escape, or manage open state — those
// differ per overlay and stay with the component. This is only the part that was
// identical and repeatedly got missed.

import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function focusableWithin(root) {
  if (!root) return [];
  // `offsetParent !== null` filters out anything display:none. It is not a full
  // visibility test (a zero-opacity element still passes), but it covers the
  // real case here: a collapsed section inside a dialog.
  return [...root.querySelectorAll(FOCUSABLE)].filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

/**
 * @param {boolean} active   whether the overlay is open
 * @param {object}  options
 * @param {import('react').RefObject<HTMLElement>} options.panelRef  the panel to contain focus in
 * @param {import('react').RefObject<HTMLElement>} [options.initialFocusRef]  focused on open; defaults to the first focusable
 * @param {boolean} [options.lockScroll=true]  freeze the page behind
 */
export function useFocusTrap(active, { panelRef, initialFocusRef, lockScroll = true } = {}) {
  // Captured on open so it survives re-renders while the overlay is up.
  const lastFocus = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const panel = panelRef?.current;
    if (!panel) return undefined;

    lastFocus.current = document.activeElement;

    // Move focus in. Prefer the caller's nominated element (usually a close
    // button) so the first Tab goes somewhere predictable.
    const target = initialFocusRef?.current || focusableWithin(panel)[0] || panel;
    if (typeof target.focus === "function") {
      // `preventScroll` matters on a 5,000–24,000 word lesson page: focusing an
      // element without it jumps the document to the top before the browser has
      // laid the dialog out.
      target.focus({ preventScroll: true });
    }

    function onKeyDown(e) {
      if (e.key !== "Tab") return;
      const items = focusableWithin(panel);
      if (items.length === 0) {
        // Nothing to focus inside — hold focus on the panel itself rather than
        // letting Tab walk into the obscured page behind it.
        e.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      if (e.shiftKey) {
        // Backwards off the top, or from outside the panel, wraps to the end.
        if (current === first || !panel.contains(current)) {
          e.preventDefault();
          last.focus({ preventScroll: true });
        }
      } else if (current === last || !panel.contains(current)) {
        e.preventDefault();
        first.focus({ preventScroll: true });
      }
    }

    // Capture phase: the app's global shortcut handler listens on document and
    // must not act on a keypress meant for the dialog.
    document.addEventListener("keydown", onKeyDown, true);

    let restoreScroll = null;
    if (lockScroll) {
      const body = document.body;
      const prevOverflow = body.style.overflow;
      // Compensate for the scrollbar so locking does not shift the layout behind.
      const gap = window.innerWidth - document.documentElement.clientWidth;
      body.style.overflow = "hidden";
      if (gap > 0) body.style.paddingRight = `${gap}px`;
      restoreScroll = () => {
        body.style.overflow = prevOverflow;
        body.style.paddingRight = "";
      };
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      if (restoreScroll) restoreScroll();
      const el = lastFocus.current;
      if (el && typeof el.focus === "function" && document.contains(el)) {
        el.focus({ preventScroll: true });
      }
    };
  }, [active, panelRef, initialFocusRef, lockScroll]);
}

export default useFocusTrap;
