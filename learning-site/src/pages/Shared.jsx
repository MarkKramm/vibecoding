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
import { renderInline } from "../lib/renderInline.jsx";

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

        {/* The three document kinds do NOT share a shape, and this component
            only ever rendered one of them.

            `shared-content.mjs` emits `kind: "doc"` with `blocks`, but
            `kind: "glossary"` with `terms`/`categories` and
            `kind: "resources"` with `groups` -- deliberately, because a glossary
            is looked up by term and a resource list is a set of links, and both
            would be worse as prose.

            This component mapped `active.blocks` unconditionally, so for those
            two kinds it rendered an empty div. The tabs worked, the titles and
            blurbs appeared, and the body was blank -- 254 glossary terms across
            10 categories and 71 resources across 14 groups were authored,
            compiled, shipped, and INVISIBLE on the live site.

            Nothing caught it because every check verified the DATA, which was
            correct and complete. The defect was entirely in the render path,
            which is the same shape as the Tools library reporting "0 tools" and
            the unstyled layout: correct data, wrong screen. */}

        {active.kind === "doc" && (
          <div className="lesson__body">
            {(active.blocks || []).map((b, i) => (
              <LessonBlock key={i} block={b} index={i} />
            ))}
          </div>
        )}

        {active.kind === "glossary" && <Glossary doc={active} />}

        {active.kind === "resources" && <ResourceGroups doc={active} />}
      </article>
    </div>
  );
}

/**
 * The glossary: 254 authored terms, grouped by category.
 *
 * Rendered as a definition list because that is what it is — a term and its
 * definition have a real semantic relationship, and a screen reader announcing
 * "254 items" in a plain list of paragraphs loses it.
 *
 * The category headings come from the document's own `## ` headings, in
 * document order, rather than being sorted: the glossary's order is pedagogical
 * (foundations first), and alphabetising it would destroy that.
 */
function Glossary({ doc }) {
  const terms = doc.terms || [];
  const categories = doc.categories || [];

  if (!terms.length) {
    return <p className="muted">This glossary has no entries yet.</p>;
  }

  // Group without losing the category order the author chose.
  const byCategory = new Map();
  for (const t of terms) {
    const key = t.category || "";
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key).push(t);
  }
  const ordered = categories
    .filter((c) => byCategory.has(c))
    .map((c) => [c, byCategory.get(c)]);
  // Any entry whose category is not in `categories` still gets rendered rather
  // than being dropped — an ungrouped term is far better than a missing one.
  for (const [key, list] of byCategory) {
    if (!categories.includes(key)) ordered.push([key, list]);
  }

  return (
    <div className="glossary">
      {ordered.map(([category, list]) => (
        <section key={category || "(uncategorised)"} className="glossary__group">
          {category && <h3 className="glossary__category">{category}</h3>}
          <dl className="glossary__list">
            {list.map((t, i) => (
              <div className="glossary__entry" key={`${t.term}-${i}`}>
                <dt className="glossary__term">{t.term}</dt>
                <dd className="glossary__def">{renderInline(t.definition, `glossary-${i}`)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

/**
 * The resource list: 71 links in 14 groups.
 *
 * Each entry is a real anchor. `renderInline` handles bold, code and italic and
 * deliberately does not autolink, so a resource list rendered as prose would be
 * a wall of unclickable URLs — which is exactly what the build comments say the
 * `resources` shape exists to avoid.
 */
function ResourceGroups({ doc }) {
  const groups = doc.groups || [];

  if (!groups.length) {
    return <p className="muted">This resource list has no entries yet.</p>;
  }

  return (
    <div className="resgroups">
      {groups.map((g) => (
        <section key={g.heading} className="resgroup">
          <h3 className="resgroup__title">{g.heading}</h3>
          {/* The blurbs are authored Markdown and contain bold spans, which
              rendered as literal `**asterisks**` when interpolated directly. */}
          {g.blurb && (
            <p className="muted resgroup__blurb">
              {renderInline(g.blurb, `resgroup-blurb-${g.heading}`)}
            </p>
          )}
          <ul className="reslist">
            {g.resources.map((r, i) => (
              <li key={`${r.url}-${i}`}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}