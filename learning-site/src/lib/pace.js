// Study pace: how the plan compares to elapsed time.
//
// WHY THIS EXISTS
// Every phase carries `duration_weeks` and every track therefore has a planned
// length — 34 weeks for IT, 112 for cyber — but nothing in the site used those
// numbers for anything. The dashboard showed a percentage complete with no
// reference point, so "0/90 · 0%" could only be read as "you have not started"
// and never as "you are N weeks in and this much done".
//
// This module computes the comparison and nothing else: no streaks, no penalties,
// no projections that turn a slow week into a failure. A pace figure on a
// burnout-aware curriculum has to be a readout, not a verdict — see
// docs/DESIGN-SYSTEM.md → Anti-patterns.

/** ISO date (YYYY-MM-DD) for the start of a track's plan, or "" if unset. */
export function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Whole days from `from` to `to`, both YYYY-MM-DD.
 *
 * Parsed as UTC midnight so a DST transition cannot make the difference between
 * two dates come out as 0.96 days and round the wrong way.
 */
export function daysBetween(from, to) {
  if (!from || !to) return null;
  const a = Date.parse(from + "T00:00:00Z");
  const b = Date.parse(to + "T00:00:00Z");
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((b - a) / 86400000);
}

/** Add whole weeks to a YYYY-MM-DD date. */
export function addWeeks(iso, weeks) {
  if (!iso) return "";
  const t = Date.parse(iso + "T00:00:00Z");
  if (!Number.isFinite(t)) return "";
  return new Date(t + weeks * 7 * 86400000).toISOString().slice(0, 10);
}

/**
 * A week count as a reader would say it: "2 weeks", "1w 3d", "4 days".
 *
 * Shared by the Schedule page and the dashboard's rail so the two cannot round
 * the same number two different ways.
 */
export function fmtWeeks(w) {
  if (w === null || w === undefined) return "—";
  const whole = Math.floor(w);
  const days = Math.round((w - whole) * 7);
  if (whole === 0) return days + (days === 1 ? " day" : " days");
  if (days === 0) return whole + (whole === 1 ? " week" : " weeks");
  return whole + "w " + days + "d";
}

/**
 * A YYYY-MM-DD date in the reader's own format.
 *
 * Parsed and formatted as UTC so the displayed day is the stored day. Formatting
 * a UTC midnight in local time renders the previous day anywhere west of
 * Greenwich, which turns a planned finish date into a wrong one.
 */
export function fmtDate(iso) {
  if (!iso) return "—";
  const t = Date.parse(iso + "T00:00:00Z");
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Where the plan stands.
 *
 * @param {object} track       a track from data/roadmaps.js
 * @param {string} startedOn   YYYY-MM-DD the reader began, or ""
 * @param {number} doneTasks   completed checklist items across the track
 * @param {number} totalTasks  checklist items in the track
 * @returns {object|null} null when no start date is set yet
 */
export function paceFor(track, startedOn, doneTasks, totalTasks) {
  const totalWeeks = (track.phases || []).reduce(
    (n, p) => n + (Number(p.durationWeeks) || 0),
    0
  );
  if (!startedOn) {
    return { planned: totalWeeks, startedOn: "", elapsedWeeks: null, remaining: null };
  }

  const elapsedDays = daysBetween(startedOn, today());
  const elapsedWeeks = elapsedDays === null ? null : Math.max(0, elapsedDays / 7);
  const remaining = Math.max(0, totalWeeks - (elapsedWeeks || 0));

  const taskPct = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
  const timePct =
    totalWeeks > 0 && elapsedWeeks !== null
      ? Math.min(100, (elapsedWeeks / totalWeeks) * 100)
      : 0;

  // The comparison is the whole point: are tasks landing faster or slower than
  // the calendar? A 10-point band either way is "on plan", because week-level
  // precision on a part-time self-study plan is false precision.
  let verdict = "on-plan";
  if (elapsedWeeks === null) verdict = "unknown";
  else if (taskPct - timePct > 10) verdict = "ahead";
  else if (timePct - taskPct > 10) verdict = "behind";

  return {
    planned: totalWeeks,
    startedOn,
    elapsedDays,
    elapsedWeeks,
    remaining,
    taskPct,
    timePct,
    verdict,
    finishOn: addWeeks(startedOn, totalWeeks),
  };
}

/**
 * The phases that fit in `weeks`, in order, with the running date for each.
 *
 * This is the "what does the next stretch look like" list. It stops at the first
 * phase that does not fit rather than truncating mid-phase, because a schedule
 * that ends halfway through a phase is not a schedule.
 */
export function upcomingPhases(track, fromIso, done, weeks) {
  const out = [];
  let cursor = fromIso;
  let remaining = weeks;
  for (const phase of track.phases || []) {
    const w = Number(phase.durationWeeks) || 0;
    if (w > remaining) break;
    const finished = phase.checklist.every((c) => done[c.id]);
    if (finished) {
      cursor = addWeeks(cursor, w);
      continue;
    }
    out.push({
      phase,
      startsOn: cursor,
      endsOn: addWeeks(cursor, w),
      weeks: w,
    });
    cursor = addWeeks(cursor, w);
    remaining -= w;
  }
  return out;
}