// Full-text search across every lesson.
//
// The engine lives in lib/lessonSearch.js and the index in search.json; this
// page is only the interface. Two behaviours are worth naming because they are
// the difference between a search that helps and one that lies:
//
//   * `ignored` — words too common to narrow anything ("the", "and"). They are
//     MATCHED, not dropped, so the reader is told they were set aside. Silently
//     ignoring a term is how a search returns confident nonsense.
//   * `missing` — words with no postings at all. A reader who typos "embedings"
//     should be told nothing matched, rather than shown the results for the
//     other word in their query.
//
// Results are attributed to a HEADING, not a line. A lesson runs thousands of
// words, so "it's in this lesson somewhere" is not an answer; the reader is sent
// to the section, and the anchor travels with the result so PhaseDetail can
// scroll straight to it.

import { useEffect, useRef } from "react";
import { useSearch } from "../hooks/useSearch.js";
import { renderInline } from "../lib/renderInline.jsx";
import { trackIdForPhase } from "../data/roadmaps.js";

export default function Search({ initialQuery, onOpenPhase }) {
  const { status, message, results, ignored, missing, run, query } = useSearch();
  const inputRef = useRef(null);

  // A search opened from elsewhere (a shortcut, or a failed lookup) arrives with
  // a query already set, so the reader lands on results rather than an empty box.
  useEffect(() => {
    if (initialQuery) run(initialQuery);
    if (inputRef.current) inputRef.current.focus();
    // Deliberately keyed on initialQuery only: re-running whenever `run`
    // changed identity would re-fire the search on every keystroke render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  function onSubmit(e) {
    e.preventDefault();
    run(inputRef.current ? inputRef.current.value : "");
  }

  return (
    <div className="searchpage">
      <header className="page__head">
        <h1>Search</h1>
        <p className="muted">
          Searches every lesson body. Results point at the section, not just the
          phase.
        </p>
      </header>

      <form className="searchform" onSubmit={onSubmit} role="search">
        <label className="sr-only" htmlFor="search-input">
          Search lessons
        </label>
        <input
          id="search-input"
          ref={inputRef}
          type="search"
          defaultValue={initialQuery || ""}
          placeholder="e.g. reranking, stop reason, KV cache"
          autoComplete="off"
        />
        <button type="submit">Search</button>
      </form>

      {status === "loading" && <p className="muted">Building the index…</p>}
      {status === "error" && (
        <p className="muted">Search is unavailable ({message}).</p>
      )}

      {status === "ready" && query && (
        <>
          <p className="muted searchmeta">
            {results.length === 0
              ? "No matches."
              : `${results.length} match${results.length === 1 ? "" : "es"}.`}
            {ignored.length > 0 && (
              <>
                {" "}
                Ignored as too common:{" "}
                <span className="term">{ignored.join(", ")}</span>.
              </>
            )}
            {missing.length > 0 && (
              <>
                {" "}
                No occurrence of:{" "}
                <span className="term">{missing.join(", ")}</span>.
              </>
            )}
          </p>

          {results.length > 0 && (
            <ol className="results">
              {results.map((r, i) => (
                <li key={`${r.p}-${r.a}-${i}`}>
                  <button
                    type="button"
                    className="linkish result__head"
                    onClick={() => onOpenPhase(trackIdForPhase(r.p), r.p, r.a)}
                  >
                    {renderInline(r.h, `sr-${i}`)}
                  </button>
                  <span className="muted result__where"> in {r.pt}</span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}

      {status === "ready" && !query && (
        <p className="muted">
          Type a term to search. Words are matched on prefixes, so “embed”
          finds “embeddings”.
        </p>
      )}
    </div>
  );
}
