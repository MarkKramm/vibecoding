// Portfolio entries, persisted in localStorage.
//
// Same shape as useProgress: lazy load, persist on change, useCallback
// mutators. Separate key, because these are artifacts you made, not tasks you
// finished — resetting progress must not delete your portfolio.
//
// An entry may name the phase it came from, but it is not required to. The
// curriculum suggests deliverables; what you actually built is yours to name.
// See docs/DESIGN-SYSTEM.md → <EmptyState> for the empty case.

import { useState, useEffect, useCallback } from "react";

const KEY = "vibecoding:portfolio:v1";

export const STATUSES = [
  { id: "idea", label: "Idea" },
  { id: "in-progress", label: "In progress" },
  { id: "done", label: "Done" },
];

const VALID_STATUS = STATUSES.map((s) => s.id);

// crypto.randomUUID needs a secure context, which a local file:// page is not.
// A timestamp plus a random suffix is unique enough for a solo local list.
function newId() {
  return (
    "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

/**
 * Read the stored entries without subscribing to them.
 *
 * The dashboard's rail shows a count and must not own the list: two live copies
 * of one key drift, and the stale one writing back would drop an entry the
 * reader just added on the Portfolio page. Read-only is the whole contract.
 */
export function readPortfolio() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function usePortfolio() {
  const [entries, setEntries] = useState(readPortfolio);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(entries));
    } catch {
      // Storage unavailable or full. Entries work for the session but will
      // not persist. Not fatal, so we do not surface an error to the user.
    }
  }, [entries]);

  const add = useCallback((fields) => {
    const title = String(fields.title || "").trim();
    if (!title) return;
    const entry = {
      id: newId(),
      title,
      phaseId: fields.phaseId || "",
      repoUrl: String(fields.repoUrl || "").trim(),
      liveUrl: String(fields.liveUrl || "").trim(),
      status: VALID_STATUS.includes(fields.status) ? fields.status : "idea",
      notes: String(fields.notes || "").trim(),
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const setStatus = useCallback((id, status) => {
    if (!VALID_STATUS.includes(status)) return;
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  }, []);

  const remove = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { entries, add, setStatus, remove };
}