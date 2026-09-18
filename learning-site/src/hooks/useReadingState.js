// Reading state: the last section the reader reached in a phase, and where they
// were overall.
//
// Two jobs, one key, because both answer "where was I":
//
// 1. **Resume.** A phase takes weeks and the sidebar has no memory, so opening a
//    phase always lands at the top of a 24,000-word lesson. `lastSection` records
//    the heading the reader was last looking at, and the phase offers to jump
//    back to it rather than doing so silently — a reader who deliberately
//    scrolled to the top should not be yanked back down.
// 2. **Global position.** `lastPhaseId` and `lastTrackId` let the dashboard offer
//    the phase the reader was last in, which on a multi-week curriculum is a more
//    useful default than the top of the track.
//
// Deliberately NOT a scroll offset: an offset into a lesson whose content can be
// re-generated is a number with no meaning after a content edit. A heading id is
// stable for the same reason checklist ids are.

import { useState, useEffect, useCallback } from "react";

const KEY = "vibecoding:reading:v1";

const EMPTY = {
  lastTrackId: "",
  lastPhaseId: "",
  // { [phaseId]: { id, text } } — the heading the reader last had on screen.
  lastSection: {},
};

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return EMPTY;
    return {
      lastTrackId: parsed.lastTrackId || "",
      lastPhaseId: parsed.lastPhaseId || "",
      lastSection:
        parsed.lastSection && typeof parsed.lastSection === "object"
          ? parsed.lastSection
          : {},
    };
  } catch {
    return EMPTY;
  }
}

export function useReadingState() {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable or full. Resume works for the session only.
    }
  }, [state]);

  /** Record which phase is open, so the dashboard can offer it back. */
  const visitPhase = useCallback((trackId, phaseId) => {
    setState((prev) =>
      prev.lastTrackId === trackId && prev.lastPhaseId === phaseId
        ? prev
        : { ...prev, lastTrackId: trackId, lastPhaseId: phaseId }
    );
  }, []);

  /** Record the heading currently on screen for a phase. */
  const visitSection = useCallback((phaseId, sectionId, sectionText) => {
    if (!phaseId || !sectionId) return;
    setState((prev) => {
      const current = prev.lastSection[phaseId];
      if (current && current.id === sectionId) return prev;
      return {
        ...prev,
        lastSection: {
          ...prev.lastSection,
          [phaseId]: { id: sectionId, text: sectionText || "" },
        },
      };
    });
  }, []);

  /** Drop a phase's memory — used when its checklist is reset. */
  const forgetPhase = useCallback((phaseId) => {
    setState((prev) => {
      if (!prev.lastSection[phaseId]) return prev;
      const next = { ...prev.lastSection };
      delete next[phaseId];
      return {
        ...prev,
        lastSection: next,
        lastPhaseId: prev.lastPhaseId === phaseId ? "" : prev.lastPhaseId,
      };
    });
  }, []);

  return { ...state, visitPhase, visitSection, forgetPhase };
}