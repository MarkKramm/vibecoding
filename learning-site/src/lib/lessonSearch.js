// In-lesson search over the block AST the reader already has open.
//
// WHY THIS EXISTS
// The corpus-wide index (useSearch.js + search.json) answers "where in the
// curriculum is this?" — a question a reader asks *before* they commit to a
// lesson. Once they are 15,000 words into one phase, the word they want is
// usually in the next 2,000 words of the SAME page, and leaving the page to
// search all 23 lessons is a worse answer than scrolling.
//
// Browser find (Ctrl+F) is scoped correctly but cannot rank: it walks hits in
// document order, shows no surrounding context, and offers no way to jump
// straight to a section. So a reader looking for one specific paragraph in a
// lesson with 66 subheadings still has to step through every occurrence.
//
// This module searches ONE lesson, in memory. No index to fetch, no network, no
// React, no DOM. It is the sibling of useSearch.js and deliberately mirrors that
// engine's query semantics — see lessonTerms() — so the two search boxes never
// disagree about what the reader typed.
//
// PURE, ON PURPOSE
// Nothing here imports React, touches `window`, or reaches into ../data. That is
// what lets scripts/test-lesson-search.mjs import this file under plain Node,
// with no bundler and no generated JSON on disk, and it is what stops the module
// from quietly acquiring a dependency on build output.

/**
 * Words too common inside a single lesson to narrow anything.
 *
 * useSearch.js does not carry a list like this: it measures which terms are
 * common from the generated index, because across 23 lessons a word appearing in
 * a fifth of the segments is measurable and changes as the corpus grows. A lesson
 * has no index, so there is nothing to measure — the list is hard-coded instead.
 *
 * It is deliberately short and grammatical. Only function words are listed. The
 * corpus-wide index also flags content words like "user" and "data", and this
 * list must NOT copy them: within one lesson, "user" still separates the two
 * paragraphs that discuss accounts from the fifty that do not, so dropping it
 * from the AND would widen a two-word query into a useless one.
 *
 * These words are still MATCHED — a query of only stopwords falls back to the
 * rarest of them rather than returning nothing — they simply cannot exclude a
 * block from the result set.
 */
const STOPWORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "your", "yours", "with",
  "this", "that", "these", "those", "from", "they", "them", "their", "there",
  "have", "has", "had", "was", "were", "will", "would", "can", "could",
  "into", "onto", "out", "its", "it’s", "is", "be", "been", "being", "as",
  "at", "by", "or", "if", "we", "us", "our", "so", "do", "does", "did",
  "when", "what", "which", "who", "whom", "whose", "how", "all", "any",
  "each", "own", "too", "very", "just", "also", "more", "most", "some",
  "such", "only", "over", "under", "about", "after", "before", "because",
  "while", "where", "then", "than", "of", "to", "in", "on", "an", "a",
]);

// Word-shaped run of characters, tolerating the interior punctuation that real
// identifiers carry. The same shape queryTerms() uses in useSearch.js, and it
// must stay the same: if the two drift, a reader searching the lesson box for
// "timestomped" and the same reader searching the global box for "timestomped"
// would get different answers about the same paragraph.
//
// `i` rather than lowercasing the haystack, because some Unicode lowercasings
// change a character's length (İ -> i̇) and that would slide every snippet index.
const TOKEN_RE = /[a-z0-9][a-z0-9'’._+-]*/gi;

// Trailing separators only. A sentence ending "...was timestomped." produces the
// token "timestomped." and must normalise to "timestomped" — otherwise the two
// spellings are separate terms and the more precisely the reader types, the
// fewer results they get. Interior punctuation is left alone so identifiers such
// as "page_fault_in_non_paged_area" stay intact.
const TRAILING = /[._+-]+$/;

const EXACT_BONUS = 3;
// A heading is the author's own summary of what the section is about, so the
// same words there are stronger evidence than a sentence that merely mentions
// them. Without this, the heading that names the concept ties with the twelve
// paragraphs that discuss it and the ranking falls back to document order.
const HEADING_BOOST = 1;
const DEFAULT_LIMIT = 30;

const SNIPPET_LEN = 150;
const SNIPPET_LEAD = 60;

/**
 * Tokenise a query string into the same term shape the global index uses.
 *
 * Identical in behaviour to queryTerms() in useSearch.js, including its refusal
 * to dedupe: "subnet subnet" is two terms there and two terms here. Deduping
 * would be a silent difference between the two search boxes about what the
 * reader typed, and the duplicate is harmless — the AND is idempotent.
 *
 * Differences, all deliberate and all outside the token shape itself:
 *
 *   * No prefix/stem handling here. queryTerms never did any — useSearch.js does
 *     that at match time, and so does searchLesson().
 *   * Terms shorter than two characters are dropped. A single letter matches
 *     most of the lesson and narrows nothing.
 *
 * @param  {unknown} query raw text from a search box
 * @return {string[]}      lowercase terms, in the order the reader typed them
 */
export function lessonTerms(query) {
  const m = String(query ?? "").toLowerCase().match(/[a-z0-9][a-z0-9'’._+-]*/g) || [];
  const out = [];
  for (const w of m) {
    const t = w.replace(TRAILING, "");
    if (t.length >= 2) out.push(t);
  }
  return out;
}

/** Split raw text into a Set of normalised tokens. */
function tokenize(text) {
  const out = new Set();
  TOKEN_RE.lastIndex = 0;
  let m;
  while ((m = TOKEN_RE.exec(text)) !== null) {
    const t = m[0].toLowerCase().replace(TRAILING, "");
    if (t) out.add(t);
  }
  return out;
}

/**
 * Keys on a block that describe its SHAPE rather than its content.
 *
 * Only the generic fallback in blockText() consults this. `id` is a slug derived
 * from the heading text, and `type`/`level`/`ordered`/`lang` are structural, so
 * indexing them would let a query for "heading" or "list" match every block of
 * that kind — noise that looks like a result.
 */
const STRUCTURAL_KEYS = new Set(["type", "id", "level", "ordered", "lang"]);

/**
 * Index a block type this module does not know about, by whatever string content
 * it carries.
 *
 * The alternative — returning "" for an unrecognised type — is exactly the
 * failure this feature exists to prevent: a block that renders on screen and
 * cannot be found by search is invisible to the reader who is looking for it.
 * A new block type added to scripts/lesson-ast.mjs therefore shows up in results
 * the day it starts rendering, even before anyone writes a case for it here.
 *
 * The depth cap is insurance against a malformed or self-referential AST: a
 * cycle would otherwise recurse until the stack gives out, and a search box that
 * crashes the page is worse than one that misses a block.
 */
function looseText(value, depth = 0, out = []) {
  if (depth > 6 || value == null) return out;
  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const v of value) looseText(v, depth + 1, out);
    return out;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (STRUCTURAL_KEYS.has(k)) continue;
      looseText(v, depth + 1, out);
    }
  }
  return out;
}

/** Flatten a list block, descending into every nested child list. */
function listText(list, depth = 0) {
  if (!list || depth > 8 || !Array.isArray(list.items)) return "";
  const parts = [];
  for (const item of list.items) {
    if (!item) continue;
    if (typeof item.text === "string") parts.push(item.text);
    for (const child of item.children || []) {
      if (!child) continue;
      // Nested bullets are where the curriculum puts its concrete examples, so
      // stopping at the top level would hide the most specific material in the
      // lesson — the exact bullets a reader searches for by name.
      if (child.type === "list") parts.push(listText(child, depth + 1));
      else if (typeof child.text === "string") parts.push(child.text);
    }
  }
  return parts.join(" ");
}

/** Flatten a table block: the header cells and every row's cells. */
function tableText(table) {
  const parts = [];
  for (const cell of table.head || []) if (typeof cell === "string") parts.push(cell);
  for (const row of table.rows || []) {
    if (!Array.isArray(row)) continue;
    for (const cell of row) if (typeof cell === "string") parts.push(cell);
  }
  return parts.join(" ");
}

/**
 * The searchable text of one block.
 *
 * Every type the parser emits is handled explicitly. The default is not a
 * silent skip: an unknown type is indexed by its string content (looseText), so
 * the only way a block becomes unsearchable is by carrying no text at all.
 *
 * Handled explicitly: para, heading, code, quote, list, table.
 * Not indexed as such, but still covered by the fallback: nothing today. The
 * fallback exists for block types that do not exist yet.
 */
function blockText(block) {
  switch (block.type) {
    case "para":
    case "heading":
    case "code":
      return typeof block.text === "string" ? block.text : "";
    case "quote":
      return (block.paras || []).filter((p) => typeof p === "string").join(" ");
    case "list":
      return listText(block);
    case "table":
      return tableText(block);
    default:
      return looseText(block).join(" ");
  }
}

/**
 * Flatten a lesson's blocks into searchable entries.
 *
 * Each entry records:
 *   sectionId    id of the owning section heading, or null before the first one
 *   sectionText  that heading's text, so a result can name its section
 *   blockIndex   the block's position in the array, so a result can be scrolled to
 *   text         the searchable text, assembled per block type
 *   isHeading    internal ranking metadata (see searchLesson)
 *
 * SECTION ATTRIBUTION
 * A block belongs to the nearest PRECEDING h3/h4. A heading of level 3 or 4 is
 * its own section rather than the previous one's — a hit inside "### Subnet
 * masks" must offer to jump to "Subnet masks", not to the section above it,
 * which is the bug a literal reading of "preceding" would produce.
 *
 * h5 deliberately starts no section: LessonBlock.jsx renders it as a
 * paragraph-level label with no TOC entry, so treating it as a section would
 * attribute hits to a heading the reader cannot navigate to.
 *
 * A block before the first heading gets sectionId null and sectionText "". It is
 * still indexed and still returned — the lesson preamble is prose the reader can
 * legitimately search, it simply has no section to jump to.
 *
 * ENTRY PER BLOCK, ALWAYS
 * Every position in the array produces exactly one entry, even a malformed one
 * with no text. entry.blockIndex is therefore always the block's own array
 * position; skipping a block would shift every later index and scroll the reader
 * to the wrong place.
 *
 * @param  {Array} blocks lesson blocks from scripts/lesson-ast.mjs
 * @return {Array}        entries, parallel to the input array
 */
export function buildEntries(blocks) {
  const out = [];
  if (!Array.isArray(blocks)) return out;

  let sectionId = null;
  let sectionText = "";

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (!block || typeof block !== "object") {
      out.push({ sectionId, sectionText, blockIndex: i, text: "", isHeading: false });
      continue;
    }

    const isSection = block.type === "heading" && (block.level === 3 || block.level === 4);
    if (isSection) {
      sectionId = typeof block.id === "string" && block.id ? block.id : null;
      sectionText = typeof block.text === "string" ? block.text : "";
    }

    out.push({
      sectionId,
      sectionText,
      blockIndex: i,
      text: blockText(block),
      // Only a real section heading earns the ranking bonus; an h5 is a label.
      isHeading: isSection,
    });
  }

  return out;
}

/**
 * Does a token satisfy a query term?
 *
 * Mirrors useSearch.js exactly: an exact token, or — for terms of three or more
 * characters — a token that extends the term, which is what makes the box feel
 * live while typing ("subn" finds "subnet"). Terms of six or more characters
 * also match on a stem, because the query can be LONGER than the word on the
 * page: "timestomping" does not start with "timestomped", but both start with
 * "timestomp", and without the stem rule the more precisely the reader types the
 * fewer results they get.
 */
function tokenMatches(token, term, stem) {
  if (token === term) return true;
  if (term.length >= 3 && token.startsWith(term)) return true;
  if (stem && token.startsWith(stem)) return true;
  return false;
}

/** The stem a term of six or more characters is allowed to match on. */
function stemOf(term) {
  if (term.length < 6) return null;
  return term.slice(0, Math.max(5, Math.floor(term.length * 0.75)));
}

/**
 * Locate the first token in `flat` that satisfies any of `terms`.
 *
 * Returns the offset and length of the WORD as it is actually written, so the
 * highlighted region in a snippet is the real word — "Timestomped", not "timestomp"
 * — and never includes the sentence punctuation that follows it.
 */
function locate(flat, terms) {
  TOKEN_RE.lastIndex = 0;
  let m;
  while ((m = TOKEN_RE.exec(flat)) !== null) {
    const word = m[0];
    const token = word.toLowerCase().replace(TRAILING, "");
    if (token.length < 2) continue;
    for (const term of terms) {
      if (tokenMatches(token, term, stemOf(term))) return { index: m.index, length: token.length };
    }
  }
  return null;
}

/**
 * Build a display window around the first match in a block's text.
 *
 * REPRESENTATION: { before, match, after } — three plain strings.
 *
 * Chosen over sentinel markers (e.g. "\u0001term\u0001") because a sentinel is a
 * character that could appear in real lesson text, and over raw HTML because
 * this module must never hand markup to a caller that would have to trust it.
 * Three strings let the UI render three text nodes and emphasise the middle one
 * with no parsing, no escaping and no innerHTML.
 *
 * The text is whitespace-collapsed first: a code block or a multi-line list item
 * would otherwise produce a "snippet" containing raw newlines, which renders as
 * a ragged block rather than a one-line preview. Indentation is lost — this is a
 * preview, and the reader jumps to the block itself.
 *
 * A leading/trailing "…" marks where the window was cut, so a truncated fragment
 * never reads as a complete sentence.
 *
 * Defensive path: if no term can be located in the collapsed text, the window
 * degrades to a plain preview in `before` with an empty `match`. That cannot
 * happen for a real hit — the entry must contain every narrowing term or it
 * would not have been ranked — but a snippet builder that throws would take the
 * whole result list down with it.
 */
function makeSnippet(text, terms) {
  const flat = String(text || "").replace(/\s+/g, " ").trim();
  if (!flat) return { before: "", match: "", after: "" };
  if (!terms.length) return { before: flat.slice(0, SNIPPET_LEN), match: "", after: "" };

  const found = locate(flat, terms);
  if (!found) return { before: flat.slice(0, SNIPPET_LEN), match: "", after: "" };

  const { index, length } = found;
  let start = Math.max(0, index - SNIPPET_LEAD);
  let end = Math.min(flat.length, start + SNIPPET_LEN);
  // Near the end of a long block the window must slide back rather than come up
  // short, or the match would sit outside it.
  if (end === flat.length) start = Math.max(0, end - SNIPPET_LEN);

  // Snap to word boundaries, but never past the match.
  if (start > 0) {
    const space = flat.indexOf(" ", start);
    if (space >= 0 && space < index) start = space + 1;
  }
  if (end < flat.length) {
    const space = flat.lastIndexOf(" ", end);
    if (space > index + length) end = space;
  }

  return {
    before: (start > 0 ? "…" : "") + flat.slice(start, index),
    match: flat.slice(index, index + length),
    after: flat.slice(index + length, end) + (end < flat.length ? "…" : ""),
  };
}

/**
 * Rank entries for a query.
 *
 * AND, like useSearch.js: every non-stopword term must appear in the entry. A
 * reader who types "subnet mask" inside a lesson wants the paragraph that has
 * both, not every paragraph that mentions either — an OR here would return most
 * of the lesson and rank it by nothing the reader cares about.
 *
 * A term that appears nowhere in the lesson therefore returns nothing at all,
 * which is the honest answer for a lesson-scoped search: the words are not in
 * this lesson, and the global search box is the one that can find them
 * elsewhere. (This is the one place the sibling differs on purpose. useSearch.js
 * tolerates an unresolvable term and still returns hits for the rest, because
 * across 23 lessons a term missing from the index may simply be an indexing gap.
 * In one lesson there is no index to have a gap.)
 *
 * Stopwords are matched but do not narrow — see STOPWORDS. If EVERY term is a
 * stopword, the rarest of them is used instead, mirroring useSearch.js, so that
 * a reader who types "the" gets ranked hits rather than a blank panel.
 *
 * SCORING
 * Every candidate already contains every narrowing term, so term rarity is a
 * property of the term, not of the entry: df is identical for all candidates.
 * What separates them is whether the match was EXACT or by prefix, plus the
 * heading bonus. Weighting by rarity is what lets an exact hit on a term only
 * three blocks share outrank an exact hit on one that forty blocks share.
 *
 * Hits: { sectionId, sectionText, blockIndex, score, snippet }.
 * Ties break on blockIndex, so equally good hits appear in reading order.
 *
 * Never throws. An empty query, an empty entry list, a non-string query or a
 * query that matches nothing all return an empty array — a search box that
 * throws while the reader is typing is worse than one that finds nothing.
 *
 * @param  {Array}  entries from buildEntries()
 * @param  {unknown} query  raw text from a search box
 * @param  {number} limit   maximum hits to return (default 30)
 * @return {Array}          ranked hits, best first
 */
export function searchLesson(entries, query, limit = DEFAULT_LIMIT) {
  if (!Array.isArray(entries) || entries.length === 0) return [];
  const terms = lessonTerms(query);
  if (terms.length === 0) return [];

  const max = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_LIMIT;

  // Token sets are cached per entry for this call only. The caller owns the
  // entries and may rebuild them at any time, so nothing is memoised across
  // calls and a stale lesson can never be searched.
  const cache = new Map();
  const tokensOf = (entry) => {
    let set = cache.get(entry);
    if (!set) {
      set = tokenize(typeof entry.text === "string" ? entry.text : "");
      cache.set(entry, set);
    }
    return set;
  };

  const resolved = [];
  for (const term of terms) {
    const stem = stemOf(term);
    const exact = [];
    const loose = [];
    for (const entry of entries) {
      if (!entry || typeof entry !== "object") continue;
      let isExact = false;
      let isLoose = false;
      for (const token of tokensOf(entry)) {
        if (token === term) {
          isExact = true;
          break;
        }
        if (!isLoose && tokenMatches(token, term, stem)) isLoose = true;
      }
      // An entry holding both the exact word and a longer form is exact: the
      // stronger evidence wins, the same way useSearch.js keeps its exact and
      // loose id sets separate and prefers the exact one when scoring.
      if (isExact) exact.push(entry);
      else if (isLoose) loose.push(entry);
    }
    resolved.push({
      term,
      exact,
      loose,
      exactSet: new Set(exact),
      df: exact.length + loose.length,
    });
  }

  let narrow = resolved.filter((r) => !STOPWORDS.has(r.term));
  if (narrow.length === 0) {
    // Everything the reader typed was a stopword. Fall back to the rarest of
    // them so the query still returns the best available evidence.
    narrow = [resolved.slice().sort((a, b) => a.df - b.df)[0]];
  }

  // Intersect, rarest term first so the working set starts as small as possible.
  const sets = narrow.map((r) => new Set([...r.exact, ...r.loose]));
  const order = narrow
    .map((r, i) => ({ i, size: sets[i].size }))
    .sort((a, b) => a.size - b.size);

  const counts = new Map();
  for (const entry of sets[order[0].i]) counts.set(entry, 1);
  for (let s = 1; s < order.length; s++) {
    const set = sets[order[s].i];
    for (const [entry, n] of counts) {
      if (set.has(entry)) counts.set(entry, n + 1);
    }
  }

  const total = order.length;
  const snippetTerms = narrow.map((r) => r.term);
  const hits = [];

  for (const [entry, n] of counts) {
    if (n !== total) continue;
    let score = 0;
    for (const r of narrow) {
      const weight = r.exactSet.has(entry) ? EXACT_BONUS : 1;
      score += weight / Math.log(2 + (r.df || 1));
    }
    if (entry.isHeading) score += HEADING_BOOST;
    hits.push({
      sectionId: entry.sectionId ?? null,
      sectionText: entry.sectionText ?? "",
      blockIndex: entry.blockIndex,
      score,
      snippet: makeSnippet(entry.text, snippetTerms),
    });
  }

  hits.sort((a, b) => b.score - a.score || a.blockIndex - b.blockIndex);
  return hits.slice(0, max);
}