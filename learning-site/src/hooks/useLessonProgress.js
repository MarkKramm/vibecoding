// Per-section completion inside a lesson body.
//
// WHY THIS EXISTS
// A lesson runs 5,000–24,000 words and is the substance of a phase: 84–95% of
// the phase file by measurement (D-011). The phase checklist that tracks
// completion sits *below* the lesson, so the reader's only progress signal for
// the part they are actually reading is the browser's scrollbar. A lesson with
// 66 subheadings is therefore 66 unmarked obligations.
//
// This gives every `###`/`####` lesson heading a done toggle, persisted under
// its own key. Two deliberate separations:
//
// * A **separate storage key** from useProgress. A section is not a checklist
//   item, and "Reset progress" must not silently discard reading state that the
//   reader never associated with the checklist.
// * **Keyed by heading id**, which the lesson parser already emits and which
//   `audit-lesson-ast.mjs` and the smoke test both require to be unique within a
//   lesson. The id is derived from the heading text, so rewording a heading
//   retires its state rather than mis-attributing it — the same rule the
//   checklist IDs follow (docs/CONTENT-SCHEMA.md → Checklist task IDs).

import { useState, useEffect, useCallback } from "react";

const KEY = "vibecoding:lesson-sections:v1";

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Section state for ONE lesson.
 *
 * @param {string} phaseId  the owning phase, used to namespace every key so two
 *                          lessons can never collide on a heading id
 * @param {Array}  toc      the lesson's table of contents (`{ id, text, level }`)
 */
export function useLessonProgress(phaseId, toc) {
  const [all, setAll] = useState(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(all));
    } catch {
      // Storage unavailable or full. Sections work for the session but will not
      // persist. Not fatal, so we do not surface an error to the reader.
    }
  }, [all]);

  const key = useCallback(
    (sectionId) => (phaseId ? phaseId + "#" + sectionId : sectionId),
    [phaseId]
  );

  const done = useCallback(
    (sectionId) => Boolean(all[key(sectionId)]),
    [all, key]
  );

  const toggle = useCallback(
    (sectionId) => {
      const k = key(sectionId);
      setAll((prev) => {
        const next = { ...prev };
        if (next[k]) delete next[k];
        else next[k] = true;
        return next;
      });
    },
    [key]
  );

  // Only sections that still exist are counted, so a lesson that loses a
  // heading does not leave a phantom completion behind its progress bar.
  const sectionIds = (toc || []).map((t) => t.id);
  const doneCount = sectionIds.filter((id) => all[key(id)]).length;

  return { done, toggle, doneCount, total: sectionIds.length, all };
}

/** Count of completed sections for a lesson, from raw storage. */
export function countLessonSections(all, phaseId, toc) {
  if (!all || !phaseId) return 0;
  let n = 0;
  for (const t of toc || []) if (all[phaseId + "#" + t.id]) n++;
  return n;
}