// The selected energy mode, persisted so it survives a reload.
// Separate from progress: this is a preference, not an accomplishment.

import { useState, useEffect, useCallback } from "react";

const KEY = "vibecoding:energy-mode:v1";
const VALID = ["low", "normal", "high"];

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return VALID.includes(raw) ? raw : "normal";
  } catch {
    return "normal";
  }
}

export function useEnergyMode() {
  const [mode, setMode] = useState(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, mode);
    } catch {
      // Preference will not persist. Not fatal.
    }
  }, [mode]);

  const change = useCallback((next) => {
    if (VALID.includes(next)) setMode(next);
  }, []);

  return { mode, change };
}