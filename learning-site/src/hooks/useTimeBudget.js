// How long the reader has today, persisted so it survives a reload.
//
// WHY IT IS A PREFERENCE AND NOT A FORM
// The dashboard asks one question — "what should I do today?" — and answering it
// needs two facts: how much time there is, and how much energy there is. Energy
// already has a persisted setting (useEnergyMode). Time gets the same treatment
// for the same reason: a reader who usually studies in the evening for an hour
// should not re-answer that every morning, and a control that resets on reload
// is a control nobody uses.
//
// WHY IT IS NOT PART OF PROGRESS
// It is not an accomplishment and nothing counts it. Separate key, and
// registered in lib/transfer.js → KEYS so a backup carries it.
//
// DEFAULT IS "focused", NOT "quick" OR "deep".
// Defaulting to the smallest budget would hide most of the curriculum from a
// reader who never touched the control, and defaulting to the largest would
// offer a three-hour lab to someone with half an hour. `focused` is where 82% of
// the practice tasks actually sit (docs/DECISIONS.md → D-021), so it is the
// least wrong guess for a reader who has expressed no preference.

import { useState, useEffect, useCallback } from "react";

const KEY = "vibecoding:time-budget:v1";

// The three usable budgets, in the order the control renders them. `ongoing` is
// deliberately absent: it is a band a task can have, not an amount of time a
// reader can have. See lib/today.js → BANDS.
export const BUDGETS = ["quick", "focused", "deep"];

export const DEFAULT_BUDGET = "focused";

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return BUDGETS.includes(raw) ? raw : DEFAULT_BUDGET;
  } catch {
    return DEFAULT_BUDGET;
  }
}

export function useTimeBudget() {
  const [budget, setBudget] = useState(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, budget);
    } catch {
      // Preference will not persist. Not fatal.
    }
  }, [budget]);

  const change = useCallback((next) => {
    if (BUDGETS.includes(next)) setBudget(next);
  }, []);

  return { budget, change };
}