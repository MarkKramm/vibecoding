// The reader's own work: one free-text note per phase, one answer per practice
// task. Persisted in localStorage.
//
// WHY THIS EXISTS
// The curriculum constantly asks the reader to produce something — a baseline, a
// ticket log, an incident report, an interview story, a risk register. Nine
// phases were rewritten specifically to end in an artefact the reader keeps. The
// site's entire support for that was a checkbox: there was nowhere to write the
// answer to the exercise you are looking at, so notes lived in another app or
// nowhere, and the connection to the phase was lost.
//
// WHAT IT IS NOT
// It is not a grade, a score, or a progress signal. There is no completion
// count, no percentage, no "N of M answered", and nothing here feeds the
// dashboard. A reader who writes one line and a reader who writes nothing look
// the same to every other part of the site, deliberately — see the anti-patterns
// in docs/DESIGN-SYSTEM.md. This is a workspace, not a report card.
//
// KEYED BY STABLE IDS
// Answers are keyed by the task's minted id (`<phase-id>-t01`), never by array
// position, so a reader's answer cannot silently reappear under a different
// question. See scripts/build-content.mjs → numberedWithIds for the limitation
// that remains.
//
// Registered in lib/transfer.js → KEYS, so Back up & restore carries it.
// See docs/DECISIONS.md → D-019.

import { useState, useEffect, useCallback, useRef } from "react";

const KEY = "vibecoding:notes:v1";

// The shape is { [phaseId]: { note: string, answers: { [taskId]: string } } }.
// Read standalone so the dashboard or any other read-only consumer can count
// without subscribing — the same discipline readPortfolio() follows.
export function readNotes() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

// An entry that holds no text is not worth storing. Dropping empties on write
// keeps the backup file honest: a phase the reader opened and typed nothing into
// does not appear in it, and a note they cleared is removed rather than kept as
// an empty string.
function prune(entry) {
  const note = typeof entry.note === "string" ? entry.note : "";
  const answers = {};
  for (const [taskId, value] of Object.entries(entry.answers || {})) {
    if (typeof value === "string" && value.trim() !== "") answers[taskId] = value;
  }
  const hasNote = note.trim() !== "";
  if (!hasNote && Object.keys(answers).length === 0) return null;
  return { note: hasNote ? note : "", answers };
}

export function useNotes() {
  const [notes, setNotes] = useState(readNotes);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(notes));
    } catch {
      // Storage unavailable or full. Notes work for the session but will not
      // persist. Not fatal, so it is not surfaced as an error — same call as
      // useProgress and usePortfolio make.
    }
  }, [notes]);

  // FLUSH ON UNMOUNT.
  //
  // The effect above writes after paint, which is correct for a keystroke and
  // wrong for the last keystroke before this hook goes away. `useNotes` is
  // instantiated inside `PhaseDetail`, which unmounts on every phase navigation.
  // A reader who types and then immediately clicks "Next phase" in the same
  // interaction frame can have the final characters dropped: the state update is
  // scheduled, the component goes away, and the write effect never runs.
  //
  // The fix is that `latest` is NOT a mirror updated during render. It is the
  // authoritative value, written SYNCHRONOUSLY inside every setter below, and the
  // React state is a projection of it. That distinction is the whole fix, and the
  // first attempt at this got it wrong:
  //
  //   FAILED: `latest.current = notes` during render, on the theory that the ref
  //           would be current by unmount. It is not. If the input event and the
  //           unmount happen with no render in between -- which is exactly the
  //           race being fixed -- React never re-renders, the assignment never
  //           runs, and the ref still holds the pre-typing value.
  //
  //   WORKS:  the setter computes the next object, stores it in the ref, and only
  //           then hands it to setState. The ref is correct the instant the
  //           keystroke is handled, whether or not a render ever happens.
  //
  // This was caught by scripts/verify-notes-flush.mjs, which typed into the right
  // field and still found nothing persisted. A fix that "looks right" and is not
  // is the reason that script exists.
  //
  // The write effect above remains the primary path; this is the safety net.
  const latest = useRef(notes);

  useEffect(
    () => () => {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(latest.current));
      } catch {
        // Same reasoning as above: a failed final flush must not throw during
        // unmount, which would take the navigation down with it.
      }
    },
    [],
  );

  // The single write path. It computes the next store from `latest.current`,
  // stores it in the ref FIRST, and only then hands it to setState. Every setter
  // goes through this, which is what makes the unmount flush see the newest value
  // regardless of whether React has re-rendered.
  //
  // This reads the ref rather than using a functional setState updater on
  // purpose. A functional updater would be correct for the state, but it would
  // leave `latest.current` stale until the next render -- which is the exact
  // failure being fixed. Two keystrokes in one tick still compose correctly here,
  // because the second call reads the ref the first one just wrote.
  const commit = useCallback((updater) => {
    const next = updater(latest.current);
    latest.current = next;
    setNotes(next);
  }, []);

  // Write one phase's note. Emptying it removes the phase from the store rather
  // than leaving a husk behind.
  const setNote = useCallback(
    (phaseId, text) => {
      if (!phaseId) return;
      commit((prev) => {
        const current = prev[phaseId] || { note: "", answers: {} };
        const next = prune({ ...current, note: String(text) });
        const out = { ...prev };
        if (next) out[phaseId] = next;
        else delete out[phaseId];
        return out;
      });
    },
    [commit],
  );

  // Write one task's answer. Keyed by the minted task id, never by index.
  const setAnswer = useCallback(
    (phaseId, taskId, text) => {
      if (!phaseId || !taskId) return;
      commit((prev) => {
        const current = prev[phaseId] || { note: "", answers: {} };
        const answers = { ...current.answers };
        const value = String(text);
        if (value.trim() === "") delete answers[taskId];
        else answers[taskId] = value;
        const next = prune({ ...current, answers });
        const out = { ...prev };
        if (next) out[phaseId] = next;
        else delete out[phaseId];
        return out;
      });
    },
    [commit],
  );

  // Clear one phase's note and all of its answers, leaving every other phase
  // untouched. Scoped to the phase on purpose: a single "clear everything"
  // button on a page a reader visits 23 times is a footgun.
  const clearPhase = useCallback(
    (phaseId) => {
      commit((prev) => {
        if (!prev[phaseId]) return prev;
        const out = { ...prev };
        delete out[phaseId];
        return out;
      });
    },
    [commit],
  );

  return { notes, setNote, setAnswer, clearPhase };
}

/** How many phases hold any writing at all. Used for a neutral summary line. */
export function countPhasesWithNotes(notes) {
  return Object.keys(notes || {}).length;
}