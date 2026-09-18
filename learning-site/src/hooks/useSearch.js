// Full-text search across every lesson.
//
// The index (search.json) holds term -> segment-id postings and no prose. It is
// fetched once, lazily, on the reader's first search — never at page load, so a
// reader who does not search pays nothing. Snippets are rendered from the
// lesson JSON the site already downloads when a phase is opened.
//
// See scripts/search-index.mjs for why the index has this shape.

import { useEffect, useRef, useState } from "react";

// Vite resolves this at build time. It is a separate chunk because it is
// imported dynamically, so it stays out of the initial bundle.
let indexPromise = null;

function loadIndex() {
  if (!indexPromise) {
    indexPromise = import("../data/generated/search.json").then((m) => {
      const raw = m.default || m;
      return {
        segments: raw.segments,
        terms: parsePostings(raw.terms),
        // Words too common to narrow a search. Kept so the engine can match
        // them and tell the reader it ignored them, rather than silently
        // returning nothing.
        common: new Set((raw.common || "").split("\n").filter(Boolean)),
      };
    });
  }
  return indexPromise;
}

/**
 * Decode `term:delta,delta,...` lines into a Map of term -> segment ids.
 * Deltas are base36 and ascending, so they are accumulated back to absolute.
 */
function parsePostings(text) {
  const map = new Map();
  if (!text) return map;
  for (const line of text.split("\n")) {
    if (!line) continue;
    const i = line.indexOf(":");
    if (i < 0) continue;
    const term = line.slice(0, i);
    const body = line.slice(i + 1);
    const ids = [];
    let prev = 0;
    if (body) {
      for (const d of body.split(",")) {
        prev += parseInt(d, 36);
        ids.push(prev);
      }
    }
    map.set(term, ids);
  }
  return map;
}

/**
 * Lowercase a query into the same term shape the index was built with.
 *
 * The trailing-punctuation strip must match scripts/search-index.mjs exactly. If
 * the two drift, a reader searching "timestomped" misses a lesson that indexed
 * "...was timestomped." — the index and the query engine would disagree while
 * both looked correct in isolation.
 */
export function queryTerms(q) {
  const m = String(q || "").toLowerCase().match(/[a-z0-9][a-z0-9'’._+-]*/g) || [];
  const out = [];
  for (const w of m) {
    const t = w.replace(/[._+-]+$/, "");
    if (t.length >= 2) out.push(t);
  }
  return out;
}

/**
 * Score segments for a query.
 *
 * Terms that are not too common must ALL appear (AND), because a reader who
 * types "auditd rules" wants segments containing both. Terms flagged as common
 * ("user", "data", "the") are matched but do NOT narrow the result set — a word
 * in a fifth of the corpus excludes almost nothing, and requiring it would let a
 * single common word silently return zero results. If every term is common, the
 * rarest of them is used, so a query still returns something sensible.
 *
 * Prefix matching applies to the final term, which makes the box feel live
 * while typing — "subn" finds "subnet" — without indexing every prefix.
 *
 * Rarer terms score higher: `auditd` matching 4 segments is better evidence
 * than `data` matching 171, and without this the common term dominates ordering.
 *
 * @returns {{hits: Array, ignored: Array<string>, missing: Array<string>}}
 */
export function search(segments, postings, query, common, limit = 30) {
  const terms = queryTerms(query);
  const empty = { hits: [], ignored: [], missing: [] };
  if (!terms.length) return empty;

  const resolved = [];
  const missing = [];
  for (const term of terms) {
    // An exact match is strong evidence; a prefix match is weaker. They are
    // collected SEPARATELY rather than merged, because merging loses that
    // distinction. Typing "STAR" exactly matches the STAR interview method
    // (8 segments) but also prefixes "start", "startup", "starved" (227
    // segments across all 23 lessons) — merged, the exact hits are drowned and
    // the lesson that actually teaches STAR falls off the end of the results.
    //
    // This also fixes the inverse bug: the index holds both "timestomping"
    // (modules 10, 12) and "timestomped" (module 11). Matching only the exact
    // form meant that the MORE precisely you typed, the FEWER results you got.
    const exactIds = postings.get(term);
    const looseIds = [];

    if (term.length >= 3) {
      // Prefix: live typing ("subn" -> "subnet") and variants that extend the
      // query ("timestomp" -> "timestomping").
      for (const [k, v] of postings) {
        if (k !== term && k.startsWith(term)) looseIds.push(...v);
      }
      // A query term may be LONGER than the indexed form, which a prefix test
      // cannot catch: "timestomping" does not start with "timestomped", but
      // both start with the stem "timestomp".
      if (term.length >= 6) {
        const stem = term.slice(0, Math.max(5, Math.floor(term.length * 0.75)));
        for (const [k, v] of postings) {
          if (k !== term && !k.startsWith(term) && k.startsWith(stem)) looseIds.push(...v);
        }
      }
    }

    if (exactIds || looseIds.length) {
      resolved.push({
        term,
        exact: exactIds ? exactIds : [],
        loose: [...new Set(looseIds)],
      });
      continue;
    }

    // Unresolvable. It may be a common (unindexed-for-narrowing) word, or
    // genuinely absent. Either way it must not silently kill the query.
    missing.push(term);
  }

  // Words that are too common to discriminate do not constrain the AND.
  const ignored = resolved.filter((r) => common.has(r.term)).map((r) => r.term);
  let narrow = resolved.filter((r) => !common.has(r.term));

  // Everything the reader typed was common — fall back to the rarest of them so
  // the query still returns the best available evidence rather than nothing.
  if (!narrow.length) {
    if (!resolved.length) return { hits: [], ignored, missing };
    narrow = [resolved.slice().sort((a, b) => a.ids.length - b.ids.length)[0]];
  }

  // Which segments satisfy EVERY term? A segment qualifies on a term if it is
  // in that term's exact set OR its loose set.
  const perTerm = narrow.map((r) => new Set([...r.exact, ...r.loose]));

  // Rarest term first keeps the intersection small.
  const order = narrow
    .map((r, i) => ({ i, n: perTerm[i].size }))
    .sort((a, b) => a.n - b.n);

  const counts = new Map();
  for (const id of perTerm[order[0].i]) counts.set(id, 1);
  for (let s = 1; s < order.length; s++) {
    const set = perTerm[order[s].i];
    for (const [id, n] of counts) {
      if (set.has(id)) counts.set(id, n + 1);
    }
  }

  const total = order.length;
  const EXACT_BONUS = 3;
  const results = [];
  for (const [id, n] of counts) {
    if (n !== total) continue;
    // Score: rarity, plus a strong bonus for segments matched EXACTLY rather
    // than by prefix. Without the bonus, "STAR" ranks a segment containing
    // "startup" alongside one teaching the STAR method, and the method lesson
    // can fall outside the result limit entirely.
    let score = 0;
    for (let i = 0; i < narrow.length; i++) {
      const r = narrow[i];
      const inExact = r.exact.length ? r.exact.includes(id) : false;
      const size = perTerm[i].size || 1;
      score += (inExact ? EXACT_BONUS : 1) / Math.log(2 + size);
    }
    results.push({ id, score });
  }

  results.sort((a, b) => b.score - a.score || a.id - b.id);
  return {
    hits: results.slice(0, limit).map((r) => segments[r.id]),
    ignored,
    missing,
  };
}

/**
 * React hook. Returns the search state plus a `run` function.
 *
 * The index loads on first call, so mounting this hook costs nothing.
 */
export function useSearch() {
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [message, setMessage] = useState("");
  const [results, setResults] = useState([]);
  const [ignored, setIgnored] = useState([]);
  const [missing, setMissing] = useState([]);
  const [query, setQuery] = useState("");
  const dataRef = useRef(null);

  const apply = (data, q) => {
    const r = search(data.segments, data.terms, q, data.common);
    setResults(r.hits);
    setIgnored(r.ignored);
    setMissing(r.missing);
  };

  useEffect(() => {
    let alive = true;
    if (status !== "loading") return;
    loadIndex()
      .then((data) => {
        if (!alive) return;
        dataRef.current = data;
        setStatus("ready");
        if (query) apply(data, query);
      })
      .catch((e) => {
        if (!alive) return;
        setStatus("error");
        setMessage(String((e && e.message) || e));
      });
    return () => {
      alive = false;
    };
  }, [status, query]);

  function run(q) {
    setQuery(q);
    if (!dataRef.current) {
      if (status === "idle") setStatus("loading");
      // The effect above runs the query once the index arrives.
      return;
    }
    apply(dataRef.current, q);
  }

  return { status, message, results, ignored, missing, run, query };
}