// Cross-track reference material: the glossary and the resource list.
//
// These live outside any single track because they are read the other way round
// from a lesson. A lesson is read start to finish; a glossary entry is looked up
// mid-sentence when a term appears that you have already forgotten. That is why
// this is a separate view with its own document switcher rather than two more
// phases buried in a track — you arrive here from somewhere else, with a
// specific word in mind.
//
// The blocks are the same shape the lesson renderer consumes, so LessonBlock is
// reused unchanged. That is deliberate: a glossary that formatted differently
// from a lesson would be a second renderer to keep in step, and the two would
// drift.

import { useEffect, useState } from "react";
import LessonBlock from "../components/LessonBlock.jsx";

// Loaded on demand rather than imported statically.
//
// The reference documents are ~25 KB of prose that a reader opens only when they
// want to look a term up mid-lesson. A static import puts all of it in the entry
// chunk, where it delays first paint for the many readers who never open this
// page at all. The lesson bodies are already loaded this way; this is the same
// treatment for the same reason.
const sharedPromise = import("../data/generated/shared.json").then(
  (m) => m.default || m
);

export default function Shared({ initialId = null }) {
  const [docs, setDocs] = useState(null);
  const [activeId, setActiveId] = useState(initialId);

  useEffect(() => {
    let alive = true;
    sharedPromise
      .then((data) => {
        if (!alive) return;
        setDocs(data.docs || []);
      })
      .catch(() => {
        if (alive) setDocs([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (docs === null) {
    return (
      <div className="sharedpage">
        <header className="page__head">
          <h1>Reference</h1>
        </header>
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (!docs.length) {
    return (
      <div className="sharedpage">
        <header className="page__head">
          <h1>Reference</h1>
        </header>
        <p className="muted">
          No shared reference documents have been written yet.
        </p>
      </div>
    );
  }

  const active = docs.find((d) => d.id === activeId) || docs[0];

  return (
    <div className="sharedpage">
      <header className="page__head">
        <h1>Reference</h1>
        <p className="muted">
          Material that spans the whole curriculum. Written to be looked up, not
          read through.
        </p>
      </header>

      <div className="toolbar">
        <div className="toolbar__group" role="tablist" aria-label="Reference documents">
          {docs.map((d) => (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={d.id === active.id}
              className={"chip" + (d.id === active.id ? " is-on" : "")}
              onClick={() => setActiveId(d.id)}
            >
              {d.title}
            </button>
          ))}
        </div>
      </div>

      <article className="card">
        <h2>{active.title}</h2>
        {active.blurb && <p className="muted">{active.blurb}</p>}

        {active.toc && active.toc.length > 0 && (
          <nav className="lesson__toc" aria-label="Contents">
            <div className="lesson__toc-title">On this page</div>
            <ol>
              {active.toc.map((t) => (
                <li
                  key={t.id}
                  className={"lesson__toc-item" + (t.level === 4 ? " is-sub" : "")}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(t.id);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    {t.text}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="lesson__body">
          {(active.blocks || []).map((b, i) => (
            <LessonBlock key={i} block={b} index={i} />
          ))}
        </div>
      </article>
    </div>
  );
}
