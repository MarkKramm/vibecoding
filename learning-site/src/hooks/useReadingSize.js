// Reading size for lesson prose.
//
// A lesson runs 5,000–24,000 words, which is several hours of continuous
// reading, and a 16px system default is not right for everyone at that length.
// The control scales ONE custom property on the lesson body rather than the
// document, so navigation, sidebars and tables keep their designed proportions;
// scaling the root font size would reflow the entire application to fix a
// reading problem.
//
// Persisted like the energy mode: a preference, not an accomplishment.

import { useState, useEffect, useCallback } from "react";

const KEY = "vibecoding:reading-size:v1";

// Percentage of the default lesson text size. Three steps rather than a slider:
// a slider invites fiddling instead of reading, and these three cover the useful
// range for a dark-surface long-form page.
export const SIZES = [
  { id: "s", label: "Small", scale: 0.92 },
  { id: "m", label: "Default", scale: 1 },
  { id: "l", label: "Large", scale: 1.12 },
  { id: "xl", label: "Extra large", scale: 1.26 },
];

const VALID = SIZES.map((s) => s.id);

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return VALID.includes(raw) ? raw : "m";
  } catch {
    return "m";
  }
}

export function scaleFor(id) {
  const s = SIZES.find((x) => x.id === id);
  return s ? s.scale : 1;
}

export function useReadingSize() {
  const [size, setSize] = useState(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, size);
    } catch {
      // Preference will not persist. Not fatal.
    }
  }, [size]);

  const change = useCallback((next) => {
    if (VALID.includes(next)) setSize(next);
  }, []);

  return { size, change, scale: scaleFor(size) };
}