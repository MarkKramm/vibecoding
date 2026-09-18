// The time-aware half of "What should I do today?".
//
// ---------------------------------------------------------------------------
// DEAD CODE — PORTED BUT UNREACHABLE
// ---------------------------------------------------------------------------
// Nothing live imports this module. Its only importer is
// `components/TimeBudgetSelector.jsx`, which is itself unreachable — so
// `bandInfo` is not actually reached from `main.jsx` either. See
// docs/DECISIONS.md → D-008.
//
// Note this corrects a claim in D-004, which says `today.js` "is still imported
// for its `BANDS` labels". The import exists, but the importing component is
// dead, so the labels do not render. The import line is what a naive check sees;
// reachability from `main.jsx` is what matters.
//
// It is kept rather than deleted because removal would also touch the transfer
// KEYS list, the validators and the tests, and would have to be redone if the
// career views return. See D-008.
//
// ⚠️ THE HAZARD THIS MODULE CARRIES
// `addressedTaskIds` reads `phase.checklist` (line 125) and `phase.tasks`
// (line 127). Both are FULL projection fields; the light index carries only
// `checklistIds` and `taskIds`. Both reads are defended with `|| []`, so this
// module does not throw — but on the light index the "phase is fully checked
// off" rule silently never fires and no practice task is ever marked addressed,
// so the picker would keep offering work the reader has already done. Feed it
// full phase records from `loadTrackPhases`. See the header of
// src/data/roadmaps.js for the two projections.
//
// WHY THIS IS A PURE MODULE
// Same reason lib/yourWork.js and lib/transfer.js are: this is a decision over
// data, not a rendering concern, and its failure modes are quiet ones — a task
// offered that cannot be started in the time the reader has, a task offered
// twice because it was already answered, an `ongoing` commitment rendered as if
// it were a single sitting. None of those throw. So the behaviour is asserted
// under plain Node, with no React, no DOM and no build step.
//
// THE PROBLEM IT SOLVES
// The dashboard's focus card used to offer the next unfinished *checklist* item
// that matched today's energy. That answered "is this the right kind of work"
// and ignored "do I have time to start it". A reader with thirty minutes was
// shown a Packet Tracer build; a reader with a free afternoon was shown a
// fifteen-minute lookup. Both are the site failing its one job.
//
// WHY BANDS AND NOT MINUTES
// Measured against the corpus (see docs/DECISIONS.md → D-021): 82% of the 183
// practice tasks sit between 20 and 90 minutes, so any cut inside that range is
// arbitrary. Only two edges survive scrutiny — there is essentially nothing
// under 20 minutes, and tasks over 90 minutes are *structurally* different
// rather than merely longer (multi-session projects, tool-curriculum cliffs,
// large writing volumes). So the bands are coarse on purpose and the UI says
// they are estimates.
//
// WHAT IT DELIBERATELY DOES NOT DO
// It does not reorder the curriculum. It walks the reader's own order and skips
// what does not fit today, because "what should I do today" must not quietly
// become "what is the most efficient thing", and a picker that reshuffles the
// plan every morning is a second curriculum. It produces no score, no streak,
// and no completion measure — see docs/DESIGN-SYSTEM.md → Anti-patterns.

// Rank order is the whole matching rule: a task of rank R fits a budget of rank
// B when R <= B. `ongoing` has no rank and is never offered by time.
export const BANDS = [
  {
    id: "quick",
    rank: 0,
    label: "Under 30 minutes",
    short: "Quick",
    note: "Short enough to start without clearing space for it.",
  },
  {
    id: "focused",
    rank: 1,
    label: "30–90 minutes",
    short: "Focused",
    note: "A real sitting. Most of the curriculum lives here.",
  },
  {
    id: "deep",
    rank: 2,
    label: "90 minutes or more",
    short: "Deep",
    note: "Labs, long builds, and writing that needs a clear head.",
  },
  {
    id: "ongoing",
    rank: null,
    label: "Ongoing",
    short: "Ongoing",
    note:
      "Not a single sitting — a weekly habit, something gated on time passing, " +
      "or something your machine may not be able to do at all.",
  },
];

const BAND_BY_ID = Object.fromEntries(BANDS.map((b) => [b.id, b]));

/** The band record for an id, or null. Used by the UI to label a task. */
export function bandInfo(id) {
  return BAND_BY_ID[id] || null;
}

/**
 * Does a task in `band` fit a budget of `budget`?
 *
 * A thirty-minute task fits a three-hour afternoon; the reverse does not. An
 * unknown or missing band returns false rather than true — the honest default
 * when a task has not been judged is not to offer it as if it had been.
 */
export function fitsBand(budget, band) {
  const b = BAND_BY_ID[budget];
  const t = BAND_BY_ID[band];
  if (!b || !t) return false;
  if (b.rank === null || t.rank === null) return false;
  return t.rank <= b.rank;
}

/**
 * Which practice tasks are already behind the reader.
 *
 * There is no per-task tick, and inventing one would add a second progress
 * system beside the checklist. Two facts already recorded are enough:
 *
 *   1. The reader wrote an answer to it. The answer box exists (D-019), and a
 *      task you have written an answer to is a task you have dealt with. This is
 *      an inference, and it is stated rather than hidden — an unanswered task
 *      that is nonetheless finished will be offered again, which is mildly
 *      annoying and not harmful. Offering a task you already did is a smaller
 *      error than dropping one you did not.
 *   2. Its phase is fully checked off. Once every checklist item in a phase is
 *      ticked the reader has moved past it, so its practice tasks stop being
 *      offered. Without this rule the picker would keep suggesting Phase 1 work
 *      forever, which is the classic way a "next task" feature becomes noise.
 *
 * @param {object} notes  the notes store: { [phaseId]: { answers: {…} } }
 * @param {object} done   the progress store: { [checklistId]: true }
 * @param {Array}  phases the phases of the track being picked from
 * @returns {Set<string>} addressed practice-task ids
 */
export function addressedTaskIds(notes, done, phases) {
  const out = new Set();
  const all = notes && typeof notes === "object" ? notes : {};

  for (const phase of phases || []) {
    const entry = all[phase.id];
    if (entry && entry.answers && typeof entry.answers === "object") {
      for (const [taskId, value] of Object.entries(entry.answers)) {
        if (typeof value === "string" && value.trim() !== "") out.add(taskId);
      }
    }

    const checklist = phase.checklist || [];
    if (checklist.length > 0 && checklist.every((c) => done && done[c.id])) {
      for (const t of phase.tasks || []) out.add(t.id);
    }
  }

  return out;
}

/**
 * The single task to offer, or a reason there is none.
 *
 * Walks `tasks` in the order given — which is the curriculum's order, flattened
 * per phase — and returns the first one that is unaddressed, fits the time
 * budget, and suits the energy level.
 *
 * @returns {{
 *   task: object|null,
 *   reason:
 *     | "ok"              a task was found
 *     | "no-budget"       no usable time budget was supplied
 *     | "empty"           there are no practice tasks at all
 *     | "all-addressed"   every unaddressed task has been dealt with
 *     | "none-fit"        the next task needs a longer sitting
 *     | "none-fit-energy" the next task fits the time but not today's energy
 *     | "only-ongoing"    what is left is not a single sitting
 *     | "unjudged"        what is left has no band, so it cannot be offered
 *   // The band that would have fitted if the reader had longer, so the UI can
 *   // say something useful instead of only "nothing". Null when not applicable.
 *   smallestBlocking: string|null,
 *   // How many unaddressed tasks fall in each of the two non-sitting buckets.
 *   // Surfaced so a caller can mention them alongside the main reason rather
 *   // than having to choose one true sentence and drop the other.
 *   ongoingCount: number,
 *   unjudgedCount: number,
 * }}
 */
export function pickToday({ tasks, budget, energy, addressed, accepts }) {
  const EMPTY_COUNTS = { ongoingCount: 0, unjudgedCount: 0 };
  const list = Array.isArray(tasks) ? tasks : [];
  if (list.length === 0) {
    return { task: null, reason: "empty", smallestBlocking: null, ...EMPTY_COUNTS };
  }
  if (!BAND_BY_ID[budget] || BAND_BY_ID[budget].rank === null) {
    return { task: null, reason: "no-budget", smallestBlocking: null, ...EMPTY_COUNTS };
  }

  const isAddressed = addressed instanceof Set ? addressed : new Set();
  const allow = typeof accepts === "function" ? accepts : () => true;

  let unaddressed = 0;
  let energyBlocked = 0;
  let smallestBlocking = null;
  let ongoingCount = 0;
  let unjudgedCount = 0;

  for (const task of list) {
    if (isAddressed.has(task.id)) continue;
    unaddressed++;

    if (!fitsBand(budget, task.band)) {
      // Three different things can stop a task fitting, and they mean three
      // different things to the reader. Collapsing them into one "does not fit"
      // is what let an ongoing commitment fall through to "nothing left".
      const b = BAND_BY_ID[task.band];
      if (b && b.rank !== null) {
        // A real duration that is simply longer than the budget. Remember the
        // cheapest such band, so the UI can say "the next one needs 30–90
        // minutes" rather than a bare nothing.
        if (smallestBlocking === null || b.rank < BAND_BY_ID[smallestBlocking].rank) {
          smallestBlocking = task.band;
        }
      } else if (b) {
        // `ongoing`: not a sitting at all. More time would not help.
        ongoingCount++;
      } else {
        // No band, or an unknown one. Nobody has judged this task, so offering
        // it would present a guess as a measurement.
        unjudgedCount++;
      }
      continue;
    }

    if (!allow(energy, task)) {
      energyBlocked++;
      continue;
    }

    return {
      task,
      reason: "ok",
      smallestBlocking: null,
      ongoingCount: 0,
      unjudgedCount: 0,
    };
  }

  const counts = { ongoingCount, unjudgedCount };

  if (unaddressed === 0) {
    return { task: null, reason: "all-addressed", smallestBlocking: null, ...counts };
  }
  // Order matters. A task that needs a longer sitting is the most actionable
  // thing to report — the reader can make time for it. Energy comes next,
  // because it is a fact about today. The two buckets that no amount of time
  // will fix come last.
  if (smallestBlocking !== null) {
    return { task: null, reason: "none-fit", smallestBlocking, ...counts };
  }
  if (energyBlocked > 0) {
    return { task: null, reason: "none-fit-energy", smallestBlocking: null, ...counts };
  }
  if (ongoingCount > 0) {
    return { task: null, reason: "only-ongoing", smallestBlocking: null, ...counts };
  }
  // Unreachable while every task carries a band, and kept anyway: if a future
  // edit adds a task without one, "nothing left" would be a lie.
  return { task: null, reason: "unjudged", smallestBlocking: null, ...counts };
}