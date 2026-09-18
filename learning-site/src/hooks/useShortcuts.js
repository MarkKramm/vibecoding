// Global keyboard shortcuts.
//
// WHY THIS EXISTS
// Every phase has a previous and a next neighbour, and the sidebar is the only
// route between them. A reader working through nine or fourteen phases one-handed
// — laptop on a knee, notes in the other hand — should not have to aim at a
// 260px column to advance. This adds the two keys the pattern implies, plus a
// way into search from inside a 24,000-word lesson, which is where the reader
// actually wants it.
//
// KEYS
//   /         focus search (the convention on documentation sites)
//   ctrl/cmd+k  focus search too, because half the audience expects this one
//   j / k     next / previous phase — vim order: j is down, k is up
//   n / p     the same, spelled out
//   g then d  go to the dashboard (a two-key sequence, so a stray `d` is safe)
//   ?         show the shortcut list
//   escape    close the list, or blur the field you are in
//
// WHAT IS DELIBERATELY ABSENT
// No shortcut toggles a checkbox. A single keystroke that mutates saved progress
// with no visible target is how a reader marks four tasks done by leaning on the
// keyboard, and progress state is the one thing here that is not cheap to
// rebuild.
//
// Keys are ignored while the target is an input, textarea, select, or anything
// contentEditable, so typing "jk" into a job-notes field does not navigate away
// from it.

import { useEffect, useRef, useState } from "react";

export const SHORTCUTS = [
  { keys: "/", label: "Focus search" },
  { keys: "Ctrl/⌘ K", label: "Focus search" },
  { keys: "j", label: "Next phase" },
  { keys: "k", label: "Previous phase" },
  { keys: "n / p", label: "Next / previous phase" },
  { keys: "g d", label: "Go to the dashboard" },
  { keys: "g s", label: "Go to the schedule" },
  { keys: "?", label: "Show or hide this list" },
  { keys: "Esc", label: "Close this list" },
];

/** True when the event target is a field the reader is typing into. */
export function isTypingTarget(el) {
  if (!el) return false;
  const tag = String(el.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (el.isContentEditable) return true;
  return false;
}

/**
 * @param {object} handlers
 * @param {Function} handlers.onNext     move to the next phase
 * @param {Function} handlers.onPrev     move to the previous phase
 * @param {Function} handlers.onSearch   open the search view and focus the box
 * @param {Function} handlers.onView     go to a named view ("dashboard"|"schedule")
 */
export function useShortcuts({ onNext, onPrev, onSearch, onView }) {
  const [helpOpen, setHelpOpen] = useState(false);

  // The "g then d" sequence needs one byte of memory, and it lives in a ref
  // rather than inside the effect below so that a re-subscribe cannot swallow it
  // mid-sequence. Checked rather than assumed: `neighbours()` returns references
  // into the module-level phase array, so `next`/`prev` are identity-stable
  // across renders and the handlers below are `useCallback`-stable — the effect
  // does NOT currently re-subscribe between the two keys, and there was no
  // observed failure here. Keeping the memory in a ref costs nothing and removes
  // the failure mode entirely, which matters because the symptom would be `g`
  // silently doing nothing rather than an error.
  const pending = useRef("");

  useEffect(() => {
    function onKey(e) {
      // Never swallow a browser or OS shortcut. Ctrl+K is claimed below only
      // when there is no other modifier, so Ctrl+Shift+K and friends still work.
      if (e.altKey) return;
      if (e.metaKey || e.ctrlKey) {
        if ((e.key === "k" || e.key === "K") && !e.shiftKey) {
          e.preventDefault();
          onSearch && onSearch();
        }
        return;
      }

      const typing = isTypingTarget(e.target);

      if (e.key === "Escape") {
        if (helpOpen) {
          setHelpOpen(false);
          return;
        }
        // Blur the focused field so Escape returns the keyboard to the page,
        // which is what it does everywhere else on the web.
        if (typing && e.target && typeof e.target.blur === "function") {
          e.target.blur();
        }
        return;
      }

      if (typing) return;

      // "g" arms a two-key sequence; anything else clears it.
      if (pending.current === "g") {
        pending.current = "";
        if (e.key === "d") {
          e.preventDefault();
          onView && onView("dashboard");
          return;
        }
        if (e.key === "s") {
          e.preventDefault();
          onView && onView("schedule");
          return;
        }
      }

      switch (e.key) {
        case "/":
          e.preventDefault();
          onSearch && onSearch();
          return;
        case "?":
          e.preventDefault();
          setHelpOpen((v) => !v);
          return;
        case "g":
          pending.current = "g";
          return;
        case "j":
        case "n":
          e.preventDefault();
          onNext && onNext();
          return;
        case "k":
        case "p":
          e.preventDefault();
          onPrev && onPrev();
          return;
        default:
          return;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onPrev, onSearch, onView, helpOpen]);

  return { helpOpen, setHelpOpen, toggleHelp: () => setHelpOpen((v) => !v) };
}