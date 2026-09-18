// Certifications the reader is considering, pursuing, or has passed.
//
// WHY THIS EXISTS
// Cybersecurity Phase 07 ("Certifications") is 8,929 words that end by asking the
// reader to produce a decision document with a target certification, a cost
// checked on the official site, job-post evidence, a topic gap table, and an exam
// date decision. The site had nowhere to keep any of it. The reader who did that
// work — which the phase calls the single most valuable task in it — wrote the
// answer into the phase's own note box at best, where it was reachable only by
// remembering which phase it belonged to.
//
// The decision is also the longest-lived thing the curriculum asks for. A
// certification is a three-to-twelve month commitment inside a thirty-four to
// one-hundred-and-twelve week plan, and an exam date is a real calendar date the
// reader has paid for. That is closer to a job application than to a note, which
// is why the shape below follows `useApplications` rather than `useNotes`.
//
// WHAT THIS IS NOT
// It is not a study log, a readiness score, or a progress measure. There is no
// hours-studied field, no percentage ready, no count of objectives cleared, and
// nothing here feeds the dashboard's completion language. **A certification
// tracker that starts measuring study is a report card**, and this product does
// not grade the reader. The fields are all statements of fact the reader already
// knows: which cert, what it costs, when the exam is, and whether they have
// booked it. See docs/DESIGN-SYSTEM.md -> the no-shame rule.
//
// `booked` is kept because booking is the step that turns an intention into a
// date, and it is the step the phase warns is easiest to postpone indefinitely.
// It is shown as a plain fact, never as a red alarm for not having booked yet —
// the same reasoning as `followUpOn` in useApplications.
//
// Registered in lib/transfer.js -> KEYS, so Back up & restore carries it.

import { useState, useEffect, useCallback } from "react";

const KEY = "vibecoding:certifications:v1";

// Ordered by how far along the decision is. `considering` first because that is
// where the phase leaves the reader, and `passed` last because it is the only
// terminal state.
//
// `deferred` is a real outcome rather than a failure: the phase explicitly says
// that deciding to delay, with a reason, is a valid result of the exercise. A
// tracker with no way to record that would push the reader toward buying an exam
// they are not ready for.
export const CERT_STATUSES = [
  { id: "considering", label: "Considering" },
  { id: "studying", label: "Studying" },
  { id: "booked", label: "Booked" },
  { id: "passed", label: "Passed" },
  { id: "deferred", label: "Deferred" },
];

const VALID_STATUS = CERT_STATUSES.map((s) => s.id);

function newId() {
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Read the stored certifications without subscribing to them.
 *
 * Same reasoning as readApplications and readPortfolio: a read-only consumer gets
 * a snapshot rather than a second live copy of one localStorage key, because two
 * live copies drift and a stale write silently drops an entry.
 */
export function readCertifications() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useCertifications() {
  const [entries, setEntries] = useState(readCertifications);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(entries));
    } catch {
      // Storage unavailable or full. Entries work for the session but will not
      // persist. Not fatal, so it is not surfaced as an error.
    }
  }, [entries]);

  // Only a name is required. The phase asks for cost and an exam date, but a
  // reader who has just started thinking about a certification should be able to
  // write the name down and come back -- refusing to record it until they have
  // checked the official price would lose the thought, which is the opposite of
  // what a tracker is for.
  const add = useCallback((fields) => {
    const name = String(fields.name || "").trim();
    if (!name) return;
    const entry = {
      id: newId(),
      name,
      issuer: String(fields.issuer || "").trim(),
      status: VALID_STATUS.includes(fields.status) ? fields.status : "considering",
      // Free text, deliberately. The phase says to check the price on the
      // official site and record it in PHP or USD; forcing a currency or a
      // number here would discard the qualifier that makes it honest, such as
      // "about $400 with the training bundle".
      cost: String(fields.cost || "").trim(),
      examOn: fields.examOn || "",
      // The phase's own words: "Topic gap table". Kept as free text because the
      // useful version of it is a list of the specific objectives the reader
      // could not explain, which does not fit a fixed schema.
      gaps: String(fields.gaps || "").trim(),
      notes: String(fields.notes || "").trim(),
    };
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const update = useCallback((id, fields) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const next = { ...e };
        for (const [k, v] of Object.entries(fields || {})) {
          if (k === "status") {
            if (VALID_STATUS.includes(v)) next.status = v;
          } else if (k === "examOn") {
            next.examOn = v || "";
          } else if (k in next) {
            next[k] = String(v || "").trim();
          }
        }
        return next;
      }),
    );
  }, []);

  const remove = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { entries, add, update, remove };
}
