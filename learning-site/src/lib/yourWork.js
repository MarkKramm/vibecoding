// Collect the reader's own writing into one ordered, readable structure.
//
// ---------------------------------------------------------------------------
// DEAD CODE — PORTED BUT UNREACHABLE
// ---------------------------------------------------------------------------
// Nothing imports this module. YourWork is one of the six career-specific views
// the sibling project had and this curriculum deliberately does not — see
// docs/DECISIONS.md → D-008 and `App.jsx`'s "WHAT IS DELIBERATELY NOT HERE"
// comment. Nothing in the site reads the reader's notes back in one place; the
// PhaseDetail notes panel is the only read side, and per phase.
//
// It is kept rather than deleted because removal would also touch the transfer
// KEYS list, the validators and the tests, and would have to be redone if the
// career views return. See D-008. It also carries D-019 and D-020 into the code.
//
// ⚠️ PROJECTION NOTE. Line 51 reads `phase.tasks || []`. `tasks` is a FULL
// projection field; the light index carries only `taskIds`. The `|| []` means
// this cannot throw, but against the light index every task text would come back
// empty, so collected answers would render with no question beside them. Feed it
// full phase records from `loadTrackPhases`. See the header of
// src/data/roadmaps.js.
//
// WHY THIS IS A PURE MODULE AND NOT PART OF THE PAGE
// The same reason lib/transfer.js is: the logic is data transformation, not
// rendering, so it can be exercised under plain Node with no React, no DOM and
// no build step. The failure modes here are quiet — an answer attached to the
// wrong task, a phase silently dropped, an orphaned answer vanishing — and a
// quiet failure in a page is one nobody notices for months.
//
// WHY IT EXISTS AT ALL
// D-019 gave the reader somewhere to write and, deliberately, nowhere to read it
// back. A note was reachable only by navigating to the phase that owned it. On a
// curriculum of this size — 31 phases — writing goes in and never comes out, which
// is a silo rather than a workspace. This module is the read side.
//
// IT IS NOT A SCOREBOARD
// Nothing here produces a completion measure. `summariseWork` returns raw
// counts of what EXISTS, with no denominator — "4 phases have writing" is a
// statement about location, not about progress, and there is no "4 of 31".
// The figures in this comment are read from the corpus, not maintained by hand:
// nothing in this module depends on how many phases there are, because every
// phase arrives as a parameter. See docs/DECISIONS.md → D-019 and D-020.

/**
 * Order the reader's writing by track and phase.
 *
 * Output order follows the curriculum's own order rather than the order things
 * were written, because a read-back view is for finding something again, and the
 * reader knows where it lives in the curriculum.
 *
 * @param {object} notes  `{ [phaseId]: { note, answers: { [taskId]: string } } }`
 * @param {Array}  tracks the `tracks` array from data/roadmaps.js
 * @returns {Array<{
 *   phaseId: string, phaseTitle: string, trackId: string, trackLabel: string,
 *   note: string,
 *   answers: Array<{ taskId: string, taskText: string, answer: string, orphaned: boolean }>,
 * }>}
 */
export function collectWork(notes, tracks) {
  const out = [];
  const all = notes && typeof notes === "object" ? notes : {};

  for (const track of tracks || []) {
    for (const phase of track.phases || []) {
      const entry = all[phase.id];
      if (!entry || typeof entry !== "object") continue;

      const note = typeof entry.note === "string" ? entry.note : "";
      const answersMap =
        entry.answers && typeof entry.answers === "object" ? entry.answers : {};
      const tasks = phase.tasks || [];

      // Answers are ordered by the phase's own task order, not by the key order
      // of the stored object. Object key order depends on the order the reader
      // happened to type in, which changes between sessions and makes the page
      // reshuffle itself for no reason the reader can see.
      const answers = [];
      const seen = new Set();
      for (const task of tasks) {
        const value = answersMap[task.id];
        if (typeof value !== "string" || value.trim() === "") continue;
        seen.add(task.id);
        answers.push({
          taskId: task.id,
          taskText: task.text,
          answer: value,
          orphaned: false,
        });
      }

      // An answer whose task id is no longer in the curriculum. This happens if
      // a task is renumbered by an edit, and the note in build-content.mjs about
      // position-minted ids says exactly that it can. Dropping it silently would
      // delete writing the reader did, so it is kept and flagged instead — the
      // page can say the task it belonged to is gone, which is honest, rather
      // than pretending the reader never wrote it.
      for (const [taskId, value] of Object.entries(answersMap)) {
        if (seen.has(taskId)) continue;
        if (typeof value !== "string" || value.trim() === "") continue;
        answers.push({ taskId, taskText: "", answer: value, orphaned: true });
      }

      if (note.trim() === "" && answers.length === 0) continue;

      out.push({
        phaseId: phase.id,
        phaseTitle: phase.title,
        trackId: track.id,
        trackLabel: track.label,
        note: note.trim() === "" ? "" : note,
        answers,
      });
    }
  }

  return out;
}

/**
 * Counts of what exists. No denominator, deliberately — see the header.
 *
 * @param {Array} groups output of collectWork
 * @returns {{ phases: number, notes: number, answers: number, orphaned: number }}
 */
export function summariseWork(groups) {
  let notes = 0;
  let answers = 0;
  let orphaned = 0;
  for (const g of groups || []) {
    if (g.note) notes++;
    answers += g.answers.length;
    orphaned += g.answers.filter((a) => a.orphaned).length;
  }
  return { phases: (groups || []).length, notes, answers, orphaned };
}