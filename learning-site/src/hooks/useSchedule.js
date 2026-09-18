// The start date for a track's plan. One preference, one key.
//
// ---------------------------------------------------------------------------
// DEAD CODE — PORTED BUT UNREACHABLE, KEY STILL REGISTERED
// ---------------------------------------------------------------------------
// Nothing imports this hook. Schedule is one of the six career-specific views
// this curriculum deliberately does not have. See docs/DECISIONS.md → D-008,
// which already names this hook as unreferenced.
//
// Note the coupling: this hook is the only writer of the start dates that
// `lib/pace.js` reads, and `pace.js` is dead too. The two are a matched pair —
// neither is useful without the other and without a view that renders them.
//
// Why it is kept: `vibecoding:schedule:v1` is registered in `lib/transfer.js` and
// named in `labelFor` as "Schedule start dates (not used in this app)". Deleting
// the key would silently drop that field from a reader's backup on the next
// restore (D-008, D-016).
//
// Kept separate from progress and from energy mode for the same reason those are
// separate from each other: resetting progress must not forget when you started,
// and changing the start date must not touch a single completed task.

import { useState, useEffect, useCallback } from "react";

const KEY = "vibecoding:schedule:v1";
const VALID_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Read the stored start dates without subscribing to them.
 *
 * The dashboard's rail shows the same pace figures, but it must not own the
 * preference: two live copies of one key drift, and the stale one writing back
 * would overwrite a date the reader just set on the Schedule page. A reader only
 * ever reads it on the dashboard, and the dashboard remounts on every view
 * change — so a plain read at mount is both correct and safe.
 */
export function readStarts() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return {};
    const out = {};
    for (const [trackId, date] of Object.entries(parsed)) {
      if (typeof date === "string" && VALID_DATE.test(date)) out[trackId] = date;
    }
    return out;
  } catch {
    return {};
  }
}

export function useSchedule() {
  const [starts, setStarts] = useState(readStarts);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(starts));
    } catch {
      // Storage unavailable or full. The date works for the session only.
    }
  }, [starts]);

  const setStart = useCallback((trackId, date) => {
    setStarts((prev) => {
      const next = { ...prev };
      if (!date) delete next[trackId];
      else if (VALID_DATE.test(date)) next[trackId] = date;
      else return prev;
      return next;
    });
  }, []);

  return { starts, setStart };
}