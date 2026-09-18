// Reading position within a long lesson, and the "carry on" prompt.
//
// WHY THIS EXISTS
// The longest lesson is ~15,500 words — measured at roughly 88 screens on a
// laptop. The browser scrollbar tells the reader how far through the *page* they
// are, but the page is mostly scaffolding below the lesson, so the scrollbar
// under-reports progress through the material by a wide margin and gives no
// sense of how much is left. This bar measures the lesson region specifically.
//
// It is a thin fixed strip across the top of the content column rather than a
// floating element, because anything floating over the prose competes with the
// reading itself. `aria-hidden` — it reports a visual position, and the
// equivalent information is already available to a screen reader from the table
// of contents, which names every section and marks the current one.
//
// The resume prompt is a suggestion, never an automatic jump: a reader who
// deliberately scrolled back to the top should not be yanked 15,000 words down
// on their next visit.

import { useEffect, useState } from "react";
import { renderInline } from "../lib/renderInline.jsx";

/**
 * Fraction (0–1) of the way through a lesson region.
 *
 * Measured against the lesson's own top and height rather than the document's,
 * so the checklist, tools, and exit criteria below it do not count as reading.
 */
export function useReadingProgress(active) {
  const [fraction, setFraction] = useState(0);

  useEffect(() => {
    if (!active) {
      setFraction(0);
      return;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = document.querySelector(".lesson");
      if (!el) {
        setFraction(0);
        return;
      }
      const top = el.offsetTop;
      const height = el.offsetHeight;
      // Where the viewport's reading line sits — a third of the way down, which
      // is roughly where the eye is while scrolling. Using the viewport top
      // would report 0% until the reader is already inside the lesson.
      const line = window.scrollY + window.innerHeight * 0.33;
      if (height <= 0) {
        setFraction(0);
        return;
      }
      const f = (line - top) / height;
      setFraction(Math.max(0, Math.min(1, f)));
    };

    // Coalesce to one measurement per frame: scroll fires far more often than
    // the browser paints, and this reads layout on every call.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [active]);

  return fraction;
}

/** The thin fixed strip. Renders nothing until the reader is into the lesson. */
export function ReadingBar({ fraction }) {
  const pct = Math.round(fraction * 100);
  return (
    <div className="reading-bar" aria-hidden="true">
      <div className="reading-bar__fill" style={{ width: pct + "%" }} />
    </div>
  );
}

/**
 * "You were at <section>" with a jump control.
 *
 * Hidden when the reader is already there, when there is no memory, or when the
 * remembered section is the first one (in which case the top of the page is
 * already the right place and the prompt would be noise).
 */
export function ResumePrompt({ section, firstSectionId, onJump }) {
  if (!section || !section.id) return null;
  if (section.id === firstSectionId) return null;

  return (
    <div className="resume">
      <span className="resume__text muted">
        You were reading{" "}
        <strong className="resume__section">
          {renderInline(section.text || section.id, "resume-text")}
        </strong>
      </span>
      <button type="button" className="btn btn--small" onClick={() => onJump(section.id)}>
        Jump back
      </button>
    </div>
  );
}