// Job applications, persisted in localStorage.
//
// Same shape as useProgress and usePortfolio: lazy load, persist on change,
// useCallback mutators. Its own key, so clearing one tracker never touches
// another.
//
// `followUpOn` is kept because an application you forgot to chase is the
// common failure — it is shown as a nudge, never as a red alarm. Burnout
// prevention means no shame UI, and that applies to job hunting most of all.
// See docs/DESIGN-SYSTEM.md → Anti-patterns.

import { useState, useEffect, useCallback } from "react";

const KEY = "vibecoding:applications:v1";

// Ordered by how far along the application is, so the filter chips read as a
// pipeline rather than an alphabetical list.
export const STATUSES = [
  { id: "applied", label: "Applied" },
  { id: "screening", label: "Screening" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Rejected" },
  { id: "withdrawn", label: "Withdrawn" },
];

const VALID_STATUS = STATUSES.map((s) => s.id);

// Statuses that mean the application is finished, one way or another.
export const CLOSED_STATUS = ["rejected", "withdrawn"];

function newId() {
  return (
    "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

/**
 * Read the stored applications without subscribing to them.
 *
 * Same reasoning as readPortfolio: the dashboard's rail counts them, and a
 * second live copy of the key would let a stale write drop an entry.
 */
export function readApplications() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useApplications() {
  const [entries, setEntries] = useState(readApplications);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(entries));
    } catch {
      // Storage unavailable or full. Entries work for the session but will
      // not persist. Not fatal, so we do not surface an error to the user.
    }
  }, [entries]);

  const add = useCallback((fields) => {
    const company = String(fields.company || "").trim();
    const role = String(fields.role || "").trim();
    if (!company || !role) return;
    const entry = {
      id: newId(),
      company,
      role,
      source: String(fields.source || "").trim(),
      url: String(fields.url || "").trim(),
      appliedOn: fields.appliedOn || new Date().toISOString().slice(0, 10),
      status: VALID_STATUS.includes(fields.status) ? fields.status : "applied",
      followUpOn: fields.followUpOn || "",
      notes: String(fields.notes || "").trim(),
    };
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const setStatus = useCallback((id, status) => {
    if (!VALID_STATUS.includes(status)) return;
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  }, []);

  const setFollowUp = useCallback((id, followUpOn) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, followUpOn } : e))
    );
  }, []);

  const remove = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { entries, add, setStatus, setFollowUp, remove };
}