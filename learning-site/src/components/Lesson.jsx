// The lesson body: a table of contents plus the rendered blocks.
//
// A lesson runs 5,000–24,000 words, so the TOC is not decoration — without it
// the page is unnavigable. The active section is tracked with IntersectionObserver
// so the reader always knows where they are, and clicking an entry scrolls to it.
//
// Two pieces of state are tracked per section and they are NOT the same thing:
//
// * **active** — where the reader is looking, recomputed from scroll position.
// * **done**   — what the reader has ticked off, persisted per phase.
//
// Keeping them apart is what lets the TOC show both at once: the current section
// is highlighted, and completed sections are marked, without either pretending
// to be the other.

import { useCallback, useEffect, useRef, useState } from "react";
import LessonBlock from "./LessonBlock.jsx";
import LessonFinder from "./LessonFinder.jsx";
import LessonToolbar from "./LessonToolbar.jsx";
import { renderInline } from "../lib/renderInline.jsx";
import { useLessonProgress } from "../hooks/useLessonProgress.js";

export default function Lesson({
  title,
  blocks,
  toc,
  anchorRef,
  phaseId,
  onActiveSection,
  size,
  onSizeChange,
  scale = 1,
}) {
  const [activeId, setActiveId] = useState(toc.length ? toc[0].id : null);
  const [tickMode, setTickMode] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const bodyRef = useRef(null);

  const { done, toggle, doneCount, total } = useLessonProgress(phaseId, toc);

  // A search result opens a phase with a specific heading in mind. Scroll there
  // once the blocks have rendered, then clear the ref so a later navigation does
  // not jump again. Uses an instant scroll because the reader is arriving, not
  // moving within a page they are already reading.
  useEffect(() => {
    if (!anchorRef || !anchorRef.current) return;
    const id = anchorRef.current;
    anchorRef.current = "";
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ block: "start" });
      setActiveId(id);
    }
  }, [anchorRef, blocks]);

  // Track which heading is currently on screen. Observing the headings rather
  // than scroll offsets keeps this correct when images or tables change height.
  useEffect(() => {
    if (!toc.length) return;
    const nodes = toc
      .map((t) => document.getElementById(t.id))
      .filter(Boolean);
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      // A band near the top of the viewport: a heading counts as "current"
      // once it reaches the upper third, which matches where the eye is.
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [toc, blocks]);

  // Report the current section upward so the phase can remember it for the
  // resume prompt. Separate effect from the observer above because it writes to
  // persistent storage, and the observer fires on every scroll.
  const textFor = useCallback(
    (id) => {
      const entry = toc.find((t) => t.id === id);
      return entry ? entry.text : "";
    },
    [toc]
  );

  useEffect(() => {
    if (!onActiveSection || !activeId) return;
    onActiveSection(activeId, textFor(activeId));
  }, [activeId, onActiveSection, textFor]);

  function jump(id) {
    const el = document.getElementById(id);
    if (!el) return;
    // scroll-margin-top on the heading keeps it clear of the sticky topbar.
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }

  // A finder hit carries the section it belongs to, not a DOM id: the engine
  // works on the block array and knows nothing about the rendered page. Jumping
  // to that section heading is what the reader asked for — "show me the part of
  // this lesson that talks about this" — and it is why the heading is the unit
  // the engine attributes hits to in the first place. A hit before the first
  // heading has no section to jump to, so the lesson body itself is the target.
  function jumpToHit(hit) {
    if (hit.sectionId) {
      jump(hit.sectionId);
      return;
    }
    if (bodyRef.current) {
      bodyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (!blocks || !blocks.length) {
    return (
      <section className="card">
        <h2>{title || "Lesson"}</h2>
        <p className="muted">
          This phase has no lesson body. The checklist and practice tasks below
          are the whole of it.
        </p>
      </section>
    );
  }

  return (
    <section className="lesson" aria-labelledby="lesson-heading">
      <h2 id="lesson-heading">{title || "Lesson"}</h2>

      <LessonToolbar
        doneCount={doneCount}
        total={total}
        tickMode={tickMode}
        onToggleTickMode={() => setTickMode((v) => !v)}
        size={size}
        onSizeChange={onSizeChange}
        findOpen={findOpen}
        onToggleFind={() => setFindOpen((v) => !v)}
      />

      <LessonFinder
        blocks={blocks}
        open={findOpen}
        onClose={() => setFindOpen(false)}
        onJump={jumpToHit}
      />

      {toc.length > 0 && (
        <nav className="lesson__toc" aria-label="Lesson contents">
          <div className="lesson__toc-title">On this page</div>
          <ol>
            {toc.map((t) => (
              <li
                key={t.id}
                className={
                  "lesson__toc-item" +
                  (t.level === 4 ? " is-sub" : "") +
                  (t.id === activeId ? " is-active" : "") +
                  (done(t.id) ? " is-done" : "")
                }
              >
                <button type="button" onClick={() => jump(t.id)}>
                  <span className="lesson__toc-mark" aria-hidden="true">
                    {done(t.id) ? "✓" : ""}
                  </span>
                  {renderInline(t.text, "toc-" + t.id)}
                  <span className="sr-only">
                    {done(t.id) ? " — marked done" : ""}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div
        className={"lesson__body" + (tickMode ? " is-ticking" : "")}
        ref={bodyRef}
        style={scale !== 1 ? { "--lesson-scale": String(scale) } : undefined}
      >
        {blocks.map((b, i) => (
          <LessonBlock
            key={i}
            block={b}
            index={i}
            sectionDone={
              b.type === "heading" && (b.level === 3 || b.level === 4)
                ? done(b.id)
                : false
            }
            onToggleSection={toggle}
            tickMode={tickMode}
          />
        ))}
      </div>
    </section>
  );
}