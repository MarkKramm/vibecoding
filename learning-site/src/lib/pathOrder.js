// ---------------------------------------------------------------------------
// DEAD CODE — PORTED BUT UNREACHABLE
// ---------------------------------------------------------------------------
// Nothing imports this module. PathOrder is one of the six career-specific views
// the sibling project had and this curriculum deliberately does not — see
// docs/DECISIONS.md → D-008, and `App.jsx`'s "WHAT IS DELIBERATELY NOT HERE"
// comment.
//
// It is kept rather than deleted because removal would have to be redone if the
// career views return. See D-008.
//
// The no-shame wording rule below is still live elsewhere — D-019, D-020 and
// `components/ProgressRing.jsx` carry the same constraint — so deleting this
// file would not delete the principle, only this statement of it.
//
// ⚠️ PROJECTION NOTE. Line 58 reads `phase.checklist || []`. `checklist` is a
// FULL projection field; the light index carries only `checklistIds`. The `|| []`
// means this cannot throw, but against the light index every phase would classify
// as `untouched` — a wrong answer that looks like a real one, the same shape as
// the Tools-library bug. Feed it full phase records from `loadTrackPhases`. See
// the header of src/data/roadmaps.js.
//
// Which phases have no work recorded yet — stated as where things are, never as
// what is missing.
//
// WHY THIS IS A PURE MODULE
// The rule this feature has to obey is a *wording* rule, and wording rules are
// the ones that rot. A component can drift into "you have 6 phases remaining"
// during a routine edit and nothing would catch it. Putting the classification
// here means `test-phase-order.mjs` can assert the shape directly: there is no
// `remaining` field, no `missing` field, no percentage, and no count of what the
// reader has not done.
//
// WHY IT IS NOT A COMPLETION SCORE
// The sidebar lets a reader open any phase in any order, and the roadmap is a
// sequence. Surfacing the phases skipped over is genuinely useful — a reader who
// jumped to Phase 9 to answer a work question has lost the thread and would
// benefit from seeing it. But the same list is one adjective away from a scold,
// and this curriculum is explicitly built for someone at risk of burning out.
//
// So the classification answers "where has this reader been?" rather than "how
// far behind is this reader?", and the distinction is structural:
//
//   * `untouched`  — no checklist item ticked and no note written. A fact.
//   * `in-progress`— some work, not all. The normal state of a phase.
//   * `complete`   — every checklist item ticked. Also just a fact.
//
// There is deliberately no `skipped` label. A phase is never *skipped*; it is
// either started or not yet started, and both are descriptions of the reader's
// own file, not judgements about their pace.

/**
 * Classify every phase in a track by how much of the reader's own work is in it.
 *
 * @param {object} track   a track from data/roadmaps.js
 * @param {object} done    the progress map, task id -> true
 * @param {object} notes   the notes map, phaseId -> { note, answers }
 * @returns {Array<{phase, state, done, total, hasNote, answers}>}
 */
export function classifyPhases(track, done, notes) {
  const doneMap = done || {};
  const notesMap = notes || {};

  return (track.phases || []).map((phase) => {
    const checklist = phase.checklist || [];
    const total = checklist.length;
    let doneCount = 0;
    for (const item of checklist) {
      if (doneMap[item.id]) doneCount++;
    }

    const entry = notesMap[phase.id] || null;
    const note = entry && typeof entry.note === "string" ? entry.note.trim() : "";
    const answers = entry && entry.answers ? entry.answers : {};
    const answerCount = Object.values(answers).filter(
      (a) => typeof a === "string" && a.trim() !== ""
    ).length;

    // Written-in counts as work even with nothing ticked. A reader who opened a
    // phase, wrote a note and ticked nothing has been there, and reporting them
    // as "not started" would be wrong about their own file.
    let state = "untouched";
    if (total > 0 && doneCount >= total) state = "complete";
    else if (doneCount > 0 || note !== "" || answerCount > 0) state = "in-progress";

    return {
      phase,
      state,
      done: doneCount,
      total,
      hasNote: note !== "",
      answers: answerCount,
    };
  });
}

/**
 * The phases a reader has not started, in curriculum order.
 *
 * Returns phase rows rather than a count, because a count is the shape that
 * invites "N to go". Callers render the list; nothing here offers a total.
 */
export function untouchedPhases(track, done, notes) {
  return classifyPhases(track, done, notes).filter((r) => r.state === "untouched");
}

/**
 * The phases a reader has started but not finished, in curriculum order.
 *
 * This is the "where was I" list, and it is the more useful of the two for a
 * reader returning after a break.
 */
export function openPhases(track, done, notes) {
  return classifyPhases(track, done, notes).filter((r) => r.state === "in-progress");
}
