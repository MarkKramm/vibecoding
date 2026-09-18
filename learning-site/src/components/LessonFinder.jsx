// Find inside the lesson you already have open.
//
// WHY THIS IS NOT THE GLOBAL SEARCH BOX
// Search.jsx answers "where in the curriculum is this?" — a question asked
// before committing to a lesson, and its index holds no prose, so every result
// row loads its own lesson just to build a snippet. Once a reader is 15,000
// words into one phase, the word they want is usually a few hundred words below
// them in the SAME page. Browser find (Ctrl+F) is scoped right but cannot rank,
// shows no surrounding context, and offers no way to jump to a section.
//
// So this searches the block AST already in memory, through the pure engine in
// lib/lessonSearch.js. No index to fetch, no network, no per-result lesson load:
// the results are available on the keystroke because the text is already here.
//
// WHY THE PANEL IS COLLAPSED BY DEFAULT
// The lesson toolbar is sticky and the page has one purpose — reading. A finder
// that sat open would take vertical space from the prose on every lesson, for a
// control most readers open rarely. It is a button until it is wanted, and
// Escape or the close control puts it away again.
//
// SNIPPET RENDERING
// searchLesson returns { before, match, after } — three plain strings, never
// markup. They are rendered as three text nodes with the middle one wrapped in
// <mark>, so nothing here parses HTML and nothing needs escaping.

import { useEffect, useMemo, useRef, useState } from "react";
import { buildEntries, searchLesson } from "../lib/lessonSearch.js";

export default function LessonFinder({ blocks, open, onClose, onJump }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  // Where focus was before the panel opened, so closing it returns the reader to
  // the control they used rather than to the top of the document. On a
  // 5,000–24,000 word lesson page, losing focus to <body> means the next Tab
  // restarts at the very beginning of the lesson.
  const lastFocus = useRef(null);

  // Index once per lesson, not once per keystroke. buildEntries walks every
  // block and every nested list, so rebuilding it while the reader types would
  // do the most work exactly when the box must feel fastest. `blocks` is a fresh
  // array on every render of Lesson, so the dependency is the array identity —
  // cheap to compare and correct when the lesson actually changes.
  const entries = useMemo(() => buildEntries(blocks), [blocks]);

  // Focus the input the moment the panel opens, so the reader can type without
  // a second click. Done in an effect rather than autoFocus so it also fires
  // when the panel is reopened after being closed.
  //
  // This is deliberately NOT useFocusTrap: the finder is an inline panel inside
  // the lesson, not a modal, so Tab should move on into the lesson when the
  // reader is done with it. Only the focus restore belongs here.
  useEffect(() => {
    if (!open) return undefined;
    lastFocus.current = document.activeElement;
    if (inputRef.current) inputRef.current.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      const el = lastFocus.current;
      if (el && typeof el.focus === "function" && document.contains(el)) {
        el.focus({ preventScroll: true });
      }
    };
  }, [open, onClose]);

  const trimmed = query.trim();
  // The engine never throws, but it also must not run on every render: a short
  // query is the common case and an empty one is the state on open.
  const hits = useMemo(
    () => (trimmed.length >= 2 ? searchLesson(entries, trimmed, 40) : []),
    [entries, trimmed]
  );

  if (!open) return null;

  return (
    <div className="lesson-find" role="search" aria-label="Find in this lesson">
      <div className="lesson-find__bar">
        <input
          ref={inputRef}
          type="search"
          className="lesson-find__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find in this lesson — a term, a command, an error string"
          aria-label="Find in this lesson"
          autoComplete="off"
        />
        <button
          type="button"
          className="lesson-find__close"
          onClick={onClose}
          aria-label="Close finder"
        >
          ✕
        </button>
      </div>

      {trimmed.length >= 2 && (
        <div className="lesson-find__results">
          {hits.length === 0 ? (
            <p className="lesson-find__note">
              Nothing in this lesson matches “{trimmed}”. The word may be in
              another phase — the search page covers every lesson.
            </p>
          ) : (
            <>
              <p className="lesson-find__count">
                {hits.length} {hits.length === 1 ? "match" : "matches"}
                {hits.length === 40 ? " (showing the first 40)" : ""}
              </p>
              <ul className="lesson-find__list">
                {hits.map((hit, i) => (
                  <li key={hit.blockIndex + "-" + i} className="lesson-find__item">
                    <button
                      type="button"
                      className="lesson-find__link"
                      onClick={() => onJump(hit)}
                    >
                      <span className="lesson-find__where">
                        {hit.sectionText || "Before the first section"}
                      </span>
                      <span className="lesson-find__snippet">
                        {hit.snippet.before}
                        {hit.snippet.match && <mark>{hit.snippet.match}</mark>}
                        {hit.snippet.after}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {trimmed.length > 0 && trimmed.length < 2 && (
        <p className="lesson-find__note">
          Type at least two characters.
        </p>
      )}
    </div>
  );
}