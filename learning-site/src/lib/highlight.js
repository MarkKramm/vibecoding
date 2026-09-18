// Query highlighting for search snippets.
//
// Kept out of Search.jsx so the matching rules can be tested without React.
// The logic is the risky part of the feature: a bad pattern either throws on a
// term like "c++" or silently marks the wrong span, and neither failure is
// visible until a reader sees a result with the wrong word underlined.

/**
 * The index matches stems, so a search for "timestomping" finds module 11's
 * "timestomped". This must produce the same stem the index uses, or a result
 * appears with nothing marked and reads as a broken search.
 */
export function stemOf(term) {
  return term.slice(0, Math.max(5, Math.floor(term.length * 0.75)));
}

/** Split a query into the terms a reader would expect to see marked. */
export function queryTerms(query) {
  return (String(query || "").toLowerCase().match(/[a-z0-9][a-z0-9'’._+-]*/g) || [])
    .filter((t) => t.length >= 2)
    .filter((t, i, a) => a.indexOf(t) === i)
    .sort((a, b) => b.length - a.length);
}

const escapeRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Find every occurrence of any pattern, anchored at a word start so "port"
 * does not light up "support". Returns null when nothing matches, so the caller
 * can tell "no matches" from "matched an empty list".
 *
 * @param {(text: string) => any} build - wraps one matched span.
 */
export function markMatches(text, patterns, build) {
  if (!patterns.length) return null;
  const re = new RegExp("(^|[^a-z0-9])(" + patterns.join("|") + ")", "gi");
  const nodes = [];
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    const at = m.index + m[1].length;
    if (at > last) nodes.push(text.slice(last, at));
    nodes.push(build(text.slice(at, at + m[2].length)));
    last = at + m[2].length;
    // A zero-width match cannot advance lastIndex, so guard against a loop.
    if (re.lastIndex <= at) re.lastIndex = at + 1;
  }
  if (!nodes.length) return null;
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/**
 * The snippet with matched terms wrapped by `build`.
 *
 * Matching is tiered, mirroring how the query engine scores. Terms as typed are
 * tried first so a word the reader typed in full is marked whole. Only when
 * that finds nothing are stems tried, which is what rescues the case where the
 * index matched a different form of the word. Applying the stem unconditionally
 * is wrong in the other direction: it would mark "audit" inside "auditd" and
 * underline half of a word the reader typed in full.
 */
export function highlight(text, query, build) {
  const terms = queryTerms(query);
  if (!terms.length || !text) return text;

  const exact = markMatches(text, terms.map(escapeRe), build);
  if (exact) return exact;

  const stems = [...new Set(terms.map(stemOf))]
    .filter((s) => s.length >= 2)
    .sort((a, b) => b.length - a.length);
  return markMatches(text, stems.map(escapeRe), build) || text;
}