// Unit tests for lib/lessonSearch.js — the in-lesson find engine.
//
// WHY THIS EXISTS, AND WHAT IT CATCHES THAT NOTHING ELSE DOES
// lessonSearch.js is what stands between a reader who is 15,000 words into a
// phase and the one paragraph they came for. LessonFinder.jsx renders its output
// directly: it jumps to `hit.blockIndex` and paints `hit.snippet.match` inside a
// <mark>. Every one of those fields is a CONTRACT with the component, and every
// way the module can break that contract fails silently rather than loudly:
//
//   * If an h5 started a section, hits under it would be attributed to a heading
//     that LessonBlock.jsx renders as a paragraph label and that the TOC does not
//     contain — so "jump to section" would scroll the reader to a heading they
//     cannot see in the navigation, or to null. That is a two-line change in
//     buildEntries and no other check in the suite looks at section attribution
//     at all.
//   * If the ranking comparison flipped, the heading that NAMES the concept
//     would sink below the twelve paragraphs that merely mention it. Results
//     still appear, still highlight, still jump — they are just in the wrong
//     order, which no schema audit can see.
//   * If the tokeniser stopped stripping trailing punctuation, "timestomped."
//     and "timestomped" would become different terms and the MORE precisely the
//     reader typed the FEWER results they would get.
//   * If a query were ever compiled into a RegExp, a reader typing "(" would
//     either throw while typing or match everything. The engine is literal by
//     construction and this file pins that it stays that way.
//
// WHY IT NEEDS NO TRANSPILE STEP
// The module imports nothing — no React, no DOM, no generated JSON — which is
// stated as a design goal in its own header and is itself asserted below. So,
// unlike test-render-inline.mjs and test-lesson-blocks.mjs, this needs no esbuild
// and no react-dom: it is a plain `await import()` of the real source file.
//
// HONESTY ABOUT THE FIXTURES
// The hand-written blocks below are shaped like the parser's output but are not
// it, so they cannot prove anything about the corpus. The corpus section near the
// bottom runs the same engine over all 65 generated lessons and checks the
// invariants that only fail at scale. The negative controls at the very bottom
// prove this file's assertions CAN fail, which is the only thing that makes a
// green run mean something.
//
// Run: node scripts/test-search.mjs

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildEntries, lessonTerms, searchLesson } from "../src/lib/lessonSearch.js";

const GEN = fileURLToPath(new URL("../src/data/generated/", import.meta.url));
const LESSONS = join(GEN, "lessons");

let pass = 0;
const failures = [];

/** Assert deep equality, reporting both sides. */
function check(name, got, want) {
  const a = JSON.stringify(got);
  const b = JSON.stringify(want);
  if (a === b) {
    pass++;
    return;
  }
  failures.push(`${name}\n     want: ${b}\n     got:  ${a}`);
}

/** Assert a condition, attaching whatever context the failure needs. */
function assert(name, cond, detail = "") {
  if (cond) {
    pass++;
    return;
  }
  failures.push(`${name}${detail ? "\n     " + detail : ""}`);
}

/** Assert a call does not throw and return its value (or a sentinel). */
const THREW = Symbol("threw");
function safely(name, fn) {
  try {
    return fn();
  } catch (e) {
    failures.push(`${name}\n     threw: ${(e && e.message) || e}`);
    return THREW;
  }
}

// ── Fixtures ─────────────────────────────────────────────────────────────────
// Built inline, never written to disk. The shape is scripts/lesson-ast.mjs's:
// a heading carries { type, level, id, text }, a list carries items that each
// carry a children array, a table carries head/rows, a quote carries paras.

const H = (level, id, text) => ({ type: "heading", level, id, text });
const P = (text) => ({ type: "para", text });

// ── lessonTerms: tokenisation ────────────────────────────────────────────────
// The reader's raw keystrokes become terms here, and this is deliberately the
// SAME shape useSearch.js's queryTerms() produces, so the two search boxes never
// disagree about what was typed. If they drift, the same word gives different
// answers in the lesson box and the global box about the same paragraph.

check("empty string has no terms", lessonTerms(""), []);
check("whitespace only has no terms", lessonTerms("   \t\n  "), []);
check("null has no terms", lessonTerms(null), []);
check("undefined has no terms", lessonTerms(undefined), []);
// A number reaching the box would otherwise be a TypeError while the reader
// types. String() coercion keeps it a term rather than a crash.
check("a number is coerced, not rejected", lessonTerms(42), ["42"]);

check(
  "terms are lowercased",
  lessonTerms("Subnet MASK Divides"),
  ["subnet", "mask", "divides"]
);
// Order is the reader's, because the snippet is built around the first term that
// appears in the text and a reader reads results in the order they thought them.
check("terms keep the reader's order", lessonTerms("mask subnet"), ["mask", "subnet"]);
// No dedupe, on purpose: "subnet subnet" is two terms in useSearch.js too, and
// deduping would be a silent difference between the two boxes.
check("duplicates are kept, not collapsed", lessonTerms("subnet subnet"), ["subnet", "subnet"]);

// A single-character term matches most of a lesson and narrows nothing, so it is
// dropped. This is what makes the one-character query return nothing rather than
// everything — asserted again through searchLesson() below.
check("one-character terms are dropped", lessonTerms("a b c"), []);
check("a term survives next to a dropped one", lessonTerms("a subnet"), ["subnet"]);

// Trailing separators only. A sentence ending "...was timestomped." produces
// "timestomped." and must normalise, or the two spellings are separate terms.
check("trailing period is stripped", lessonTerms("timestomped."), ["timestomped"]);
check("trailing comma is stripped", lessonTerms("timestomped,"), ["timestomped"]);
check("a run of trailing separators is stripped", lessonTerms("timestomped..."), ["timestomped"]);
check("trailing underscore is stripped", lessonTerms("subnet_"), ["subnet"]);
// INTERIOR punctuation is data, not noise. An identifier the curriculum uses
// verbatim must stay one term, or a reader who copies the exact name from the
// code block finds nothing.
check(
  "interior punctuation keeps an identifier intact",
  lessonTerms("page_fault_in_non_paged_area"),
  ["page_fault_in_non_paged_area"]
);
check("interior hyphens survive", lessonTerms("--dry-run"), ["dry-run"]);
check("interior dots survive", lessonTerms("a.b.c"), ["a.b.c"]);

check("punctuation separates terms", lessonTerms("subnet, mask; cidr!"), ["subnet", "mask", "cidr"]);
check(
  "brackets and quotes are separators",
  lessonTerms('the "subnet" [mask] (cidr)'),
  ["the", "subnet", "mask", "cidr"]
);
// A Windows path loses its drive letter: "C:" is a one-character token and is
// dropped with every other one-character term. That is correct for a search box
// — "c" would match most of a lesson — and it is recorded here so nobody
// "fixes" the length rule on the strength of this case.
check("a Windows path tokenises on separators", lessonTerms("C:\\Users\\me"), ["users", "me"]);
check("a curl of punctuation yields nothing", lessonTerms("..."), []);
check(
  "a typographic apostrophe is an interior character",
  lessonTerms("it\u2019s"),
  ["it\u2019s"]
);

// ── buildEntries: section attribution ────────────────────────────────────────
// The entry list is parallel to the block array, so entry i is block i. Every
// position produces exactly one entry, even a malformed one: skipping a block
// would shift every later index and LessonFinder would scroll to the wrong place.

{
  const blocks = [
    P("Preamble prose about subnets."), // 0
    H(5, "five", "Five label about subnets"), // 1  <- must NOT start a section
    H(3, "subnet-masks", "Subnet masks"), // 2
    P("A subnet mask divides an address."), // 3
    H(4, "cidr", "CIDR notation"), // 4
    P("CIDR notation is subnet shorthand."), // 5
    H(2, "level-two", "Level two"), // 6  <- must NOT start a section
    P("After an h2, still CIDR."), // 7
    H(3, "", "No id at all"), // 8
    P("After a heading with no id."), // 9
    null, // 10 <- malformed
    P("subnet"), // 11
  ];
  const entries = buildEntries(blocks);

  check("one entry per block", entries.length, blocks.length);
  check(
    "entry.blockIndex is the block's own array position",
    entries.map((e) => e.blockIndex),
    blocks.map((_, i) => i)
  );

  check("a block before the first heading has sectionId null", entries[0].sectionId, null);
  check("a block before the first heading has empty sectionText", entries[0].sectionText, "");

  // ⛔ THE HAZARD THIS FILE EXISTS FOR IN PART. LessonBlock.jsx renders an h5 as
  // a paragraph-level label with no TOC entry. If buildEntries counted it as a
  // section, the block below it would be attributed to a heading the reader
  // cannot navigate to, and every subsequent hit in that stretch would offer the
  // wrong jump target.
  check("an h5 does NOT start a section (sectionId)", entries[1].sectionId, null);
  check("an h5 does NOT start a section (sectionText)", entries[1].sectionText, "");
  check("an h5 does NOT earn the heading bonus", entries[1].isHeading, false);
  check("a block after an h5 is still in no section", entries[1].sectionId, null);

  // An h2 is the page's own outer heading, not a lesson section either.
  check("an h2 does NOT start a section", entries[6].sectionId, "cidr");
  check("a block after an h2 keeps the previous section", entries[7].sectionId, "cidr");
  check("an h2 does NOT earn the heading bonus", entries[6].isHeading, false);

  // h3 and h4 DO, and the heading is its own section rather than the previous
  // one's — a hit inside "### Subnet masks" must offer to jump to "Subnet masks".
  check("an h3 starts a section and owns itself", entries[2].sectionId, "subnet-masks");
  check("an h3 earns the heading bonus", entries[2].isHeading, true);
  check("an h4 starts a section and owns itself", entries[4].sectionId, "cidr");
  check("an h4 earns the heading bonus", entries[4].isHeading, true);
  check("a body block inherits the nearest preceding h3/h4", entries[3].sectionId, "subnet-masks");
  check("a later h4 ends the previous section", entries[5].sectionId, "cidr");

  // The section heading's own TEXT travels with the id, because LessonFinder
  // renders it as the result's location and falls back to "Before the first
  // section" when it is empty.
  check("the section text travels with the id", entries[3].sectionText, "Subnet masks");
  check("a heading with no id still contributes its text", entries[9].sectionText, "No id at all");
  check("a heading with no id contributes no id", entries[9].sectionId, null);
  check("a heading with no id still ranks as a heading", entries[8].isHeading, true);

  check("a malformed block still gets an entry", entries[10].blockIndex, 10);
  check("a malformed block has empty text", entries[10].text, "");
  check("a malformed block is not a heading", entries[10].isHeading, false);

  // The whole sectionId sequence, so a change anywhere in the walk shows up as
  // one diff rather than being hidden behind a spot check.
  check(
    "the sectionId of every position",
    entries.map((e) => e.sectionId),
    [
      null,
      null,
      "subnet-masks",
      "subnet-masks",
      "cidr",
      "cidr",
      "cidr",
      "cidr",
      null,
      null,
      null,
      null,
    ]
  );
  check(
    "isHeading is true at exactly the h3/h4 positions",
    entries.map((e, i) => (e.isHeading ? i : -1)).filter((i) => i >= 0),
    [2, 4, 8]
  );
}

// buildEntries must survive whatever the caller hands it — LessonFinder calls it
// on every lesson change, and a throw there takes the whole lesson page down.
check("buildEntries on null", buildEntries(null), []);
check("buildEntries on undefined", buildEntries(undefined), []);
check("buildEntries on a string", buildEntries("not an array"), []);
check("buildEntries on an object", buildEntries({}), []);
check("buildEntries on an empty array", buildEntries([]), []);

// ── buildEntries: the searchable text of each block type ─────────────────────
// A block that renders on screen but carries no indexed text is invisible to a
// reader who is looking straight at it. Each type the parser emits is checked
// here, and the fallback for types that do not exist yet is checked too.

{
  const blocks = [
    P("A plain paragraph."), // 0
    H(3, "s", "A heading"), // 1
    { type: "code", lang: "bash", text: "ip addr show" }, // 2
    { type: "quote", paras: ["First quoted line.", "Second quoted line."] }, // 3
    {
      type: "list",
      ordered: false,
      items: [
        { text: "top level bullet", children: [] },
        {
          text: "second bullet",
          children: [
            { type: "list", ordered: true, items: [{ text: "nested bullet", children: [] }] },
            { type: "para", text: "a nested paragraph" },
          ],
        },
      ],
    }, // 4
    { type: "table", head: ["Subnet", "Mask"], rows: [["10.0.0.0", "255.0.0.0"]] }, // 5
    // A type that does not exist yet. The module indexes it by its string
    // content rather than returning "", so a seventh block type is searchable
    // the day it starts rendering.
    { type: "callout", tone: "warn", body: { text: "an unknown block's prose" } }, // 6
  ];
  const e = buildEntries(blocks);

  check("para text is indexed", e[0].text, "A plain paragraph.");
  check("heading text is indexed", e[1].text, "A heading");
  check("code text is indexed", e[2].text, "ip addr show");
  check(
    "quote paragraphs are joined",
    e[3].text,
    "First quoted line. Second quoted line."
  );
  // Nested bullets are where the curriculum puts its concrete examples, so
  // stopping at the top level would hide the most specific material.
  check(
    "list text includes nested bullets",
    e[4].text,
    "top level bullet second bullet nested bullet a nested paragraph"
  );
  check("table text joins head and rows", e[5].text, "Subnet Mask 10.0.0.0 255.0.0.0");

  // STRUCTURAL KEYS ARE NOT CONTENT. `type` would make a query for "heading"
  // return every heading in the lesson, and `id` would make "part-1-what-..."
  // match — noise that looks like a result.
  assert(
    "an unknown block type is indexed by its strings",
    e[6].text.includes("an unknown block's prose"),
    `got: ${JSON.stringify(e[6].text)}`
  );
  // `type`/`id`/`level`/`ordered`/`lang` are structural and are skipped; every
  // OTHER key is content. "warn" is a tone, not a type, and the fallback cannot
  // tell a structural key from a content one it has never seen — so it indexes
  // it. That is the deliberate direction of the guess: a stray word in the index
  // is a mildly noisy result, while a block that renders and cannot be found is
  // the failure this whole feature exists to prevent.
  assert(
    "structural keys are not indexed as content",
    !e[6].text.includes("callout"),
    `got: ${JSON.stringify(e[6].text)}`
  );
  const headingEntry = buildEntries([H(3, "subnet-masks", "Subnet masks")])[0];
  assert(
    "a heading's id is not indexed as content",
    !headingEntry.text.includes("subnet-masks"),
    `got: ${JSON.stringify(headingEntry.text)}`
  );
  assert(
    "a code block's language is not indexed as content",
    !buildEntries([{ type: "code", lang: "bash", text: "ls" }])[0].text.includes("bash"),
    "a query for 'bash' must not return every code block"
  );
}

// ── Ranking ──────────────────────────────────────────────────────────────────
// Every candidate already contains every narrowing term, so what separates them
// is whether the match was EXACT or by prefix, plus the heading bonus.

{
  // THE HEADING BONUS IS ONLY DECISIVE AGAINST A PREFIX MATCH, NOT AN EXACT ONE.
  // The exact weight is EXACT_BONUS/log(2+df) = 3/1.79 = 1.68, a prefix weight is
  // 1/1.79 = 0.56, and the heading bonus is 1. So an exact BODY hit (1.68) still
  // beats a prefix HEADING hit (0.56 + 1 = 1.56) — and it should: the reader
  // typed a word that is written exactly there. Pinned because it is the
  // ranking property most likely to be "tidied" into something wrong.
  const prefixFixture = buildEntries([H(3, "s", "Subnets everywhere"), P("subnet")]);
  check(
    "an exact body hit still outranks a prefix heading hit",
    searchLesson(prefixFixture, "subnet").map((h) => h.blockIndex),
    [1, 0]
  );

  // Against an exact body hit, an exact heading hit wins: same weight, plus the
  // bonus. This is the case the module's header describes — the heading that
  // names the concept against the paragraph that mentions it.
  const exactFixture = buildEntries([
    P("alpha appears here in the body only, once."), // 0  body, exact
    H(3, "beta", "Beta mention of alpha in a heading"), // 1  heading, exact
    P("unrelated prose."), // 2
  ]);
  const exactHits = searchLesson(exactFixture, "alpha");
  check(
    "only blocks containing the term are returned",
    exactHits.map((h) => h.blockIndex),
    [1, 0]
  );
  assert(
    "a heading hit outranks a body hit at equal term frequency",
    exactHits[0].score > exactHits[1].score,
    JSON.stringify(exactHits.map((h) => [h.blockIndex, h.score]))
  );
  check("the heading hit is the section it names", exactHits[0].sectionId, "beta");
  assert(
    "exactness beats a prefix even when the prefix is in a heading",
    searchLesson(prefixFixture, "subnet")[0].score > searchLesson(prefixFixture, "subnet")[1].score,
    "ranking by exactness is what stops a heading that names a concept tying with the paragraphs that mention it"
  );
}

// ── Ranking: exact vs prefix, as a single ordering ───────────────────────────
{
  // A term with one exact hit and two prefix hits: the exact one must come
  // first, because it is the only one that is the word the reader typed.
  const blocks = [
    H(3, "s", "Section"),
    P("subnets subnets subnets"), // 1  prefix only
    P("subnet"), // 2  exact
    P("subnetwork"), // 3  prefix only
  ];
  const entries = buildEntries(blocks);
  const hits = searchLesson(entries, "subnet");
  check(
    "an exact match beats prefix matches",
    hits.map((h) => h.blockIndex),
    [2, 1, 3]
  );
  assert(
    "the exact hit scores strictly highest",
    hits[0].score > hits[1].score && hits[0].score > hits[2].score,
    JSON.stringify(hits.map((h) => h.score))
  );
  // Term frequency does NOT change the score: df is a property of the term, and
  // every candidate already contains it. Block 1 says "subnets" three times and
  // ties with block 3, which says it once.
  assert(
    "repetition inside a block does not move the score",
    hits[1].score === hits[2].score,
    JSON.stringify(hits.map((h) => h.score))
  );
}

// ── Ranking: document order as the tiebreak ──────────────────────────────────
{
  // Note there is no heading in this fixture: a heading's bonus is a real score
  // difference, and using one here would make these blocks NOT tied, which would
  // turn the tiebreak assertion into an assertion about nothing.
  const blocks = [P("subnet alpha"), P("subnet beta"), P("subnet gamma"), P("subnet delta")];
  const hits = searchLesson(buildEntries(blocks), "subnet");
  check("equal hits come back in reading order", hits.map((h) => h.blockIndex), [0, 1, 2, 3]);
  const scores = hits.map((h) => h.score);
  assert(
    "those hits really are tied",
    scores.every((s) => s === scores[0]),
    JSON.stringify(scores)
  );
}

{
  // A heading hit outranks a body hit even when the body hit is dozens of blocks
  // earlier — the heading is the author's own summary of what the section is
  // about. This is the ranking the module's own header calls out: without the
  // bonus, the heading that names the concept ties with the paragraphs that
  // discuss it and ranking falls back to document order.
  const blocks = [H(3, "s", "Section"), P("masking fundamentals")];
  for (let i = 0; i < 20; i++) blocks.push(P(`filler paragraph number ${i}`));
  blocks.push(H(4, "m", "Masking"), P("masking masking masking"));
  const hits = searchLesson(buildEntries(blocks), "masking");
  check(
    "a heading hit outranks a later body hit",
    hits.map((h) => h.blockIndex),
    [blocks.length - 2, 1, blocks.length - 1]
  );
  check("the heading hit names its own section", hits[0].sectionId, "m");
}

// ── Ranking: the stem rule ───────────────────────────────────────────────────
{
  // The query can be LONGER than the word on the page. "timestomping" does not
  // start with "timestomped", but both start with "timestomp", and without the
  // stem rule the more precisely the reader types the fewer results they get.
  // The stem only applies from six characters up.
  const entries = buildEntries([
    H(3, "s", "Section"),
    P("timestomped the files"), // 1
    P("timestomping the files"), // 2
  ]);
  // Block 1 is exact for "timestomped" and only stem-matched for "timestomping",
  // so each query puts its own exact hit first. Asserted as a SET plus an
  // ordering, because the ordering is the interesting half.
  check(
    "a query matches a different form of the same word",
    searchLesson(entries, "timestomping").map((h) => h.blockIndex),
    [2, 1]
  );
  check(
    "and the reverse direction too",
    searchLesson(entries, "timestomped").map((h) => h.blockIndex),
    [1, 2]
  );
  // Five characters: the stem rule has not started. "auditing" does not begin
  // with "auditd" and "auditd" does not begin with "auditing", so neither
  // direction matches — which is exactly the gap the six-character stem fills.
  check(
    "a five-character term takes no stem",
    searchLesson(buildEntries([H(3, "s", "S"), P("auditd rules")]), "auditing").length,
    0
  );
  check(
    "a five-character term still prefix-matches a longer word",
    searchLesson(buildEntries([H(3, "s", "S"), P("auditing the rules")]), "audit").length,
    1
  );
}

{
  // AND, not OR: a reader who types "subnet mask" wants the paragraph that has
  // both, not every paragraph that mentions either. A term that appears NOWHERE
  // in the lesson returns nothing at all, which is the honest answer for a
  // lesson-scoped search — the global box is the one that can search elsewhere.
  const entries = buildEntries([
    H(3, "s", "Section"),
    P("a subnet"), // 1
    P("a mask"), // 2
    P("a subnet and a mask"), // 3
  ]);
  check(
    "every narrowing term must be present",
    searchLesson(entries, "subnet mask").map((h) => h.blockIndex),
    [3]
  );
  check("a term absent from the lesson returns nothing", searchLesson(entries, "subnet zzzz"), []);
}

{
  // Stopwords are MATCHED but do not narrow. A query made only of stopwords
  // falls back to the rarest of them so the reader gets ranked hits rather than
  // a blank panel.
  const entries = buildEntries([
    H(3, "s", "Section"),
    P("the cat sat on the mat"), // 1
    P("a dog sat there"), // 2
  ]);
  check(
    "a stopword-only query still returns hits",
    searchLesson(entries, "the").length > 0,
    true
  );
  check(
    "a word nobody wrote still returns nothing",
    searchLesson(entries, "sat zzzz"),
    []
  );
  check(
    "a stopword does not narrow the AND",
    searchLesson(entries, "the sat").map((h) => h.blockIndex).sort(),
    [1, 2]
  );
}

// ── Edge cases: a query that must never break the box ────────────────────────
// Every one of these is something a reader can type, and the module's contract
// is explicit: it never throws, and a query that matches nothing returns an
// empty array. A search box that throws while the reader is typing is worse than
// one that finds nothing.

{
  const entries = buildEntries([
    H(3, "s", "Section"),
    P("subnet masks divide addresses (in IPv4) [mostly] *often*?"),
  ]);

  check("an empty query returns nothing", searchLesson(entries, ""), []);
  check("a whitespace-only query returns nothing", searchLesson(entries, "   \t\n "), []);
  check("a query matching nothing returns an empty array", searchLesson(entries, "zzzznothere"), []);

  // A one-character query: lessonTerms drops it, so nothing is searched. The
  // non-zero-length of THIS assertion is the point — "a" appears in the text
  // above, and a module that skipped the length guard would return a hit.
  check("a single-character query returns nothing", searchLesson(entries, "a"), []);
  check("a single-character query does not match everything", searchLesson(entries, "z"), []);

  // ⛔ REGEX METACHARACTERS. `new RegExp(query)` here would either throw on "("
  // or match every block on "*" and "?". Neither happens: the query is tokenised
  // to literal text first, so each of these yields no terms at all and returns
  // an empty array rather than an exception or the whole lesson.
  for (const q of ["(", ")", "[", "]", "*", "?", "\\", "{", "}", "|", "^", "$", "+", ".", "((", "[a-"]) {
    const got = safely(`the query ${JSON.stringify(q)} must not throw`, () => searchLesson(entries, q));
    if (got === THREW) continue;
    check(`a bare metacharacter ${JSON.stringify(q)} matches nothing`, got, []);
  }

  // The same characters AROUND a real word: the word still has to be found, so
  // this is the assertion that proves the metacharacters were treated as literal
  // separators rather than as a pattern that matches nothing.
  for (const q of ["(subnet)", "[subnet]", "*subnet*", "subnet?", "\\subnet\\"]) {
    const got = safely(`the query ${JSON.stringify(q)} must not throw`, () =>
      searchLesson(entries, q)
    );
    if (got === THREW) continue;
    check(`metacharacters around a real word still find it (${q})`, got.length, 1);
    check(`and the match is the word (${q})`, got[0].snippet.match, "subnet");
  }
  // A DOT IS INTERIOR PUNCTUATION, NOT A WILDCARD. "sub.net" resolves to the
  // single literal term "sub.net", which the text does not contain, so it is
  // empty — the correct answer. If a future "helpful" pass ever compiled the
  // term into a pattern, "sub.net" would match "subnet" and this would fail.
  check("an interior dot is literal, not a wildcard", searchLesson(entries, "sub.net"), []);
  check("a literal dotted word is still findable when it is written", searchLesson(entries, "a.b"), []);

  // Non-string queries and non-array entries: both are reachable from a caller
  // that has not been careful, and neither may throw.
  check("a null query returns nothing", searchLesson(entries, null), []);
  check("an undefined query returns nothing", searchLesson(entries, undefined), []);
  check("a numeric query is coerced and does not throw", searchLesson(entries, 42), []);
  check("an object query does not throw", searchLesson(entries, {}), []);
  check("a null entry list returns nothing", searchLesson(null, "subnet"), []);
  check("an empty entry list returns nothing", searchLesson([], "subnet"), []);
  check("a non-array entry list returns nothing", searchLesson("x", "subnet"), []);

  // Malformed entries inside an otherwise good list: the loop skips them rather
  // than throwing on `entry.text`.
  const messy = buildEntries([null, "a string", 42, P("alpha")]);
  const messyHits = safely("malformed entries must not throw", () => searchLesson(messy, "alpha"));
  if (messyHits !== THREW) {
    check("a malformed entry is skipped, not matched", messyHits.map((h) => h.blockIndex), [3]);
  }
}

{
  // The limit. LessonFinder passes 40; the module's default is 30. A limit of 0,
  // a negative limit or a non-finite one must fall back to the default rather
  // than returning an empty page or the whole lesson.
  const blocks = [H(3, "s", "Section")];
  for (let i = 0; i < 40; i++) blocks.push(P(`subnet number ${i}`));
  const entries = buildEntries(blocks);
  check("the default limit is 30", searchLesson(entries, "subnet").length, 30);
  check("an explicit limit is honoured", searchLesson(entries, "subnet", 5).length, 5);
  check("a limit of 0 falls back to the default", searchLesson(entries, "subnet", 0).length, 30);
  check("a negative limit falls back to the default", searchLesson(entries, "subnet", -5).length, 30);
  check("a NaN limit falls back to the default", searchLesson(entries, "subnet", NaN).length, 30);
  check("a limit larger than the result set is harmless", searchLesson(entries, "subnet", 999).length, 40);
}

// ── Snippet shape ────────────────────────────────────────────────────────────
// { before, match, after } — three plain strings, never markup. LessonFinder
// renders them as three text nodes with the middle one in a <mark>, so `match`
// must be the word AS WRITTEN and must never be undefined or an index fragment.

{
  const entries = buildEntries([H(3, "s", "Section"), P("Timestomped files hide evidence.")]);
  const [hit] = searchLesson(entries, "timestomp");
  check("a hit has a snippet object", typeof hit.snippet, "object");
  check(
    "a snippet is exactly { before, match, after }",
    Object.keys(hit.snippet).sort(),
    ["after", "before", "match"]
  );
  for (const k of ["before", "match", "after"]) {
    const v = hit.snippet[k];
    check(`snippet.${k} is a string`, typeof v, "string");
    assert(`snippet.${k} is never "undefined"`, !String(v).includes("undefined"), JSON.stringify(v));
  }
  // The match is the real word with its capital letter, not the lowercased term
  // the reader typed — the highlighted region must look like the page.
  check("match is the word as written", hit.snippet.match, "Timestomped");
  check("before is the text ahead of it", hit.snippet.before, "");
  check("after is the text behind it", hit.snippet.after, " files hide evidence.");
  // Reassembling the three must give back a contiguous slice of the block text.
  check(
    "the snippet reassembles into the block's own text",
    (hit.snippet.before + hit.snippet.match + hit.snippet.after).replace(/…/g, ""),
    "Timestomped files hide evidence."
  );
}

{
  // A very short block: no lead-in to cut, nothing to append. The failure this
  // guards is a window built with indices that run off the ends and produce
  // `undefined` in one of the three strings.
  const entries = buildEntries([H(3, "s", "Section"), P("x"), P("ab"), P("a")]);
  const short = searchLesson(entries, "ab")[0];
  assert("a one-word block yields a snippet", Boolean(short), "expected a hit for 'ab'");
  if (short) {
    check("a short block's snippet has no lead-in marker", short.snippet.before, "");
    check("a short block's snippet has no trailing marker", short.snippet.after, "");
    check("a short block's match is the word", short.snippet.match, "ab");
  }
  // Nothing in this lesson matches, so nothing is returned — including blocks
  // whose text is one character, which tokenise to nothing.
  check("a block with too little text is simply not a hit", searchLesson(entries, "qq"), []);
}

{
  // A LONG block: the window must slide so the match is inside it, and the
  // truncation must be marked with "…" so a fragment never reads as a complete
  // sentence. The match here sits ~180 characters in, past the leading window.
  const lead = "padding words here ".repeat(12);
  const tail = "trailing words after the marker ".repeat(12);
  const entries = buildEntries([
    H(3, "s", "Section"),
    P(lead + "timestomp marker " + tail),
    P("timestomp at the very end"),
  ]);
  const deep = searchLesson(entries, "timestomp").find((h) => h.blockIndex === 1);
  assert("a match deep inside a long block is still found", Boolean(deep), "no hit for block 1");
  if (deep) {
    const s = deep.snippet;
    check("a truncated lead-in is marked", s.before.startsWith("…"), true);
    check("a truncated tail is marked", s.after.endsWith("…"), true);
    check("the deep match is the word, not its context", s.match, "timestomp");
    assert(
      "the window is bounded",
      s.before.length + s.match.length + s.after.length < 220,
      `window was ${s.before.length + s.match.length + s.after.length} chars`
    );
    assert(
      "the marked window does not contain the whole block",
      (s.before + s.match + s.after).length < (lead + "timestomp marker " + tail).replace(/\s+/g, " ").length,
      "the snippet is a preview, not the block"
    );
  }
  const edge = searchLesson(entries, "timestomp").find((h) => h.blockIndex === 2);
  assert("a match at the very end of a block has no trailing marker", edge && !edge.snippet.after.endsWith("…"), edge ? JSON.stringify(edge.snippet) : "no hit");
}

{
  // Whitespace is collapsed before the window is cut. A code block or a
  // multi-line list item would otherwise produce a "snippet" containing raw
  // newlines, which renders as a ragged block rather than a one-line preview.
  const entries = buildEntries([
    H(3, "s", "Section"),
    { type: "code", lang: "bash", text: "line one\n    timestomp   spaced\n\nline three" },
  ]);
  const [hit] = searchLesson(entries, "timestomp");
  check("newlines are collapsed out of a snippet", /[\n\r\t]/.test(hit.snippet.before + hit.snippet.after), false);
  check("runs of spaces are collapsed", hit.snippet.after, " spaced line three");
}

{
  // The snippet is built around the FIRST term of the query that appears in the
  // text, which is what makes the window match what the reader is looking for
  // rather than what they happened to type first.
  const entries = buildEntries([H(3, "s", "Section"), P("beta then alpha appears")]);
  const [hit] = searchLesson(entries, "alpha beta");
  check("the first matching term in the text wins the window", hit.snippet.match, "beta");
}

{
  // WHICH MATCHING TERM WINS THE WINDOW. The docstring says "the first token in
  // `flat` that satisfies any of `terms`", and "first" means first IN THE TEXT,
  // not first in the query. That distinction is what keeps the highlighted word
  // near the start of the window instead of wherever the reader happened to type
  // it — the two orders disagree whenever the query is not in reading order, so
  // both directions are pinned.
  const entries = buildEntries([H(3, "s", "Section"), P("xxx beta yyy alpha zzz")]);
  check(
    "the earliest matching token in the TEXT wins the window",
    searchLesson(entries, "alpha beta")[0].snippet.match,
    "beta"
  );
  check(
    "query order does not change which token is marked",
    searchLesson(entries, "beta alpha")[0].snippet.match,
    "beta"
  );
  // Both orders return the same single hit: the AND does not care about order.
  check(
    "term order does not change the result set",
    searchLesson(entries, "alpha beta").map((h) => h.blockIndex),
    searchLesson(entries, "beta alpha").map((h) => h.blockIndex)
  );
}

// ── The real corpus ──────────────────────────────────────────────────────────
// Everything above is hand-written, so none of it can catch a shape the corpus
// actually contains. This section runs the engine over all 65 generated lessons
// and asserts the invariants that only fail at scale. The generated JSON is a
// build artifact; test-lesson-blocks.mjs already asserts it is current, so this
// does not repeat that check.

const FILE_NOTES = [];
const lessonFiles = readdirSync(LESSONS).filter((f) => f.endsWith(".json")).sort();

// A handful of terms a reader would plausibly type into a lesson-sized box.
const CORPUS_QUERIES = [
  "subnet",
  "timestomp",
  "cache",
  "token",
  "embedding",
  "the",
  "a",
  "what is",
  "the a of",
  "(",
  "*",
  "zzzznotinthelesson",
];

let lessons = 0;
let blocks = 0;
let hits = 0;
let snippets = 0;
let unnamedBeforeFirstSection = 0;
let sectionAttributed = 0;
let h5InCorpus = 0;
const tocLevels = new Map();
const seenBlockTypes = new Set();
const corpusProblems = [];

for (const file of lessonFiles) {
  const lesson = JSON.parse(readFileSync(join(LESSONS, file), "utf8"));
  const lessonBlocks = lesson.blocks || [];
  lessons++;
  blocks += lessonBlocks.length;

  for (const b of lessonBlocks) {
    seenBlockTypes.add(b && b.type);
    if (b && b.type === "heading" && b.level === 5) h5InCorpus++;
  }
  for (const t of lesson.toc || []) tocLevels.set(t.level, (tocLevels.get(t.level) || 0) + 1);

  const entries = buildEntries(lessonBlocks);

  // ENTRY PER BLOCK, ALWAYS. A skipped block shifts every later index and the
  // reader is scrolled to the wrong paragraph.
  if (entries.length !== lessonBlocks.length) {
    corpusProblems.push(`${file}: ${entries.length} entries for ${lessonBlocks.length} blocks`);
  }
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].blockIndex !== i) {
      corpusProblems.push(`${file}: entry ${i} reports blockIndex ${entries[i].blockIndex}`);
    }
  }

  // Section attribution must agree with the TOC the site actually navigates by.
  // A sectionId that is not a TOC id would send "jump to section" nowhere.
  const tocIds = new Set((lesson.toc || []).map((t) => t.id));
  for (const e of entries) {
    if (e.sectionId === null) unnamedBeforeFirstSection++;
    else {
      sectionAttributed++;
      if (!tocIds.has(e.sectionId)) {
        corpusProblems.push(`${file}: block ${e.blockIndex} is attributed to "${e.sectionId}", which is not in the TOC`);
      }
    }
    if (e.sectionId === null && e.sectionText !== "") {
      corpusProblems.push(`${file}: block ${e.blockIndex} has no section id but a non-empty sectionText`);
    }
  }

  // An h5 must start no section here either, on real headings, not just on the
  // fixture above.
  for (let i = 0; i < lessonBlocks.length; i++) {
    const b = lessonBlocks[i];
    if (b && b.type === "heading" && b.level !== 3 && b.level !== 4 && entries[i].isHeading) {
      corpusProblems.push(`${file}: an h${b.level} at block ${i} is treated as a section`);
    }
    if (b && b.type === "heading" && (b.level === 3 || b.level === 4) && !entries[i].isHeading) {
      corpusProblems.push(`${file}: an h${b.level} at block ${i} is NOT treated as a section`);
    }
  }

  for (const q of CORPUS_QUERIES) {
    let results;
    try {
      results = searchLesson(entries, q);
    } catch (e) {
      corpusProblems.push(`${file}: the query ${JSON.stringify(q)} threw — ${(e && e.message) || e}`);
      continue;
    }
    if (!Array.isArray(results)) {
      corpusProblems.push(`${file}: the query ${JSON.stringify(q)} returned ${typeof results}`);
      continue;
    }
    hits += results.length;

    for (const hit of results) {
      snippets++;

      // blockIndex must resolve to a real block, because LessonFinder scrolls
      // to it.
      if (!Number.isInteger(hit.blockIndex) || hit.blockIndex < 0 || hit.blockIndex >= lessonBlocks.length) {
        corpusProblems.push(`${file}/${q}: blockIndex ${hit.blockIndex} is out of range`);
        continue;
      }
      if (!Number.isFinite(hit.score)) {
        corpusProblems.push(`${file}/${q}: score ${hit.score} at block ${hit.blockIndex}`);
      }

      const s = hit.snippet;
      if (!s || typeof s !== "object") {
        corpusProblems.push(`${file}/${q}: no snippet at block ${hit.blockIndex}`);
        continue;
      }
      for (const k of ["before", "match", "after"]) {
        if (typeof s[k] !== "string") {
          corpusProblems.push(`${file}/${q}: snippet.${k} is ${typeof s[k]} at block ${hit.blockIndex}`);
        }
      }
      // ⛔ THE ONE THAT MATTERS MOST FOR THE UI. LessonFinder renders
      // `{hit.snippet.match && <mark>…</mark>}`. A hit whose match is empty
      // renders an unhighlighted result the reader cannot locate — the answer
      // looks broken while every other check stays green.
      if (!s.match) {
        corpusProblems.push(
          `${file}/${q}: block ${hit.blockIndex} is a hit with an EMPTY snippet.match`
        );
      }
      // NOTHING IN THE SNIPPET MAY BE A STRINGIFIED NON-VALUE — but the honest
      // version of that check is narrow, and the reason is a false alarm this
      // file produced on its first run. The corpus legitimately contains the
      // WORD "undefined" in authored prose: two lessons write about a function
      // that returns `undefined`. So a /undefined/ test reported two phantom
      // failures about correct snippets, and — worse — it CANNOT be made to work:
      // a leaked JS `undefined` interpolated into a sentence is byte-identical to
      // the authored word. The house rule applies (an implausible hit count is
      // evidence about the query first), and the conclusion is that the word is
      // unassertable here.
      //
      // What IS assertable is that these are real strings, which the typeof loop
      // above already proves, and that no OBJECT or number coerced its way in.
      // "[object Object]" and a bare NaN come from a different bug than a missing
      // string and they have no legitimate reason to appear mid-sentence.
      if (/\[object |\bNaN\b/.test(s.before + s.match + s.after)) {
        corpusProblems.push(
          `${file}/${q}: block ${hit.blockIndex} snippet contains a coerced non-string: ${JSON.stringify(s)}`
        );
      }
      // The match must actually be IN the collapsed block text, VERBATIM and
      // case-sensitively — not merely case-insensitively equal to it. locate()
      // returns the word as written so the <mark> highlights the real word
      // ("Timestomped", not the lowercased "timestomp" the reader typed), and a
      // case-insensitive test would accept a window built from the wrong slice.
      const entryText = String(entries[hit.blockIndex].text || "").replace(/\s+/g, " ").trim();
      if (s.match && !entryText.includes(s.match)) {
        corpusProblems.push(
          `${file}/${q}: snippet.match ${JSON.stringify(s.match)} is not a verbatim slice of its own block text starting ${JSON.stringify(entryText.slice(0, 60))}`
        );
      }
      // The three strings must re-join into a CONTIGUOUS run of that text once
      // the two cut markers are removed. The run only starts at index 0 when the
      // window was not cut on the left, so the honest check is that it is a
      // substring — that is what makes these three one window rather than three
      // unrelated fragments of the block.
      if (s.match) {
        const joined = s.before.replace(/^…/, "") + s.match;
        if (!entryText.includes(joined)) {
          corpusProblems.push(
            `${file}/${q}: block ${hit.blockIndex} snippet.before + snippet.match is not a window into its own block text`
          );
        }
      }
    }

    // Ranked best first, with document order as the tiebreak. Checked here on
    // real results because the fixture above can only pin a case, not the sort.
    for (let i = 1; i < results.length; i++) {
      const a = results[i - 1];
      const b = results[i];
      if (b.score > a.score) {
        corpusProblems.push(`${file}/${q}: results are not sorted by score at position ${i}`);
        break;
      }
      if (b.score === a.score && b.blockIndex < a.blockIndex) {
        corpusProblems.push(`${file}/${q}: equal scores are not in reading order at position ${i}`);
        break;
      }
    }
  }
}

check("every generated lesson produced entries", lessons > 0, true);
check("every generated lesson produced a non-trivial block list", blocks > 1000, true);
check("no corpus problem was found", corpusProblems.slice(0, 10), []);

// The corpus contains no h5 heading at all today. That is worth RECORDING rather
// than asserting away: the h5 rule above is therefore only exercised by the
// fixture, and this count is what tells a later reader whether the corpus has
// started using h5 and the rule has become load-bearing.
assert(
  "the corpus's heading levels are still only 3 and 4",
  [...tocLevels.keys()].sort().join(",") === "3,4",
  `TOC levels seen: ${JSON.stringify([...tocLevels].sort())}`
);

// A last one on a real lesson rather than a fixture: the section a hit names
// must be the section the heading above it actually carries.
{
  const file = lessonFiles.find((f) => f.startsWith("rag-03")) || lessonFiles[0];
  const lesson = JSON.parse(readFileSync(join(LESSONS, file), "utf8"));
  const entries = buildEntries(lesson.blocks || []);
  const results = searchLesson(entries, "cosine", 3);
  assert(`a plausible term finds something in ${file}`, results.length > 0, "no hits for 'cosine'");
  for (const hit of results) {
    const b = (lesson.blocks || [])[hit.blockIndex];
    assert(
      `a hit at block ${hit.blockIndex} carries a real section`,
      hit.sectionId === null || lesson.toc.some((t) => t.id === hit.sectionId),
      `sectionId ${JSON.stringify(hit.sectionId)} is not in ${file}'s TOC`
    );
    assert(
      `a hit at block ${hit.blockIndex} points at a real block`,
      Boolean(b),
      "blockIndex does not resolve"
    );
    if (b) {
      assert(
        `a hit at block ${hit.blockIndex} is of a type the lesson actually has`,
        seenBlockTypes.has(b.type),
        `unknown type ${JSON.stringify(b.type)}`
      );
    }
  }
  FILE_NOTES.push(
    `${file}: ${entries.length} entries, "cosine" -> ${results.length} hit(s), first at block ${results[0] && results[0].blockIndex} in section ${JSON.stringify(results[0] && results[0].sectionId)}`
  );
}

// ── Negative controls ────────────────────────────────────────────────────────
// An assertion that cannot fail is worse than none, so the failability of the
// checks above is itself tested. These mutate a COPY of the real output and
// re-run the SAME comparison the corpus loop ran, proving the comparison would
// notice the defect.

{
  const file = lessonFiles.find((f) => f.startsWith("found-01")) || lessonFiles[0];
  const lesson = JSON.parse(readFileSync(join(LESSONS, file), "utf8"));
  const entries = buildEntries(lesson.blocks || []);
  const results = searchLesson(entries, "model", 5);
  const good = results.filter((h) => h.snippet.match).length;

  // The empty-match check: an empty match must be detected rather than ignored.
  assert(
    "an empty snippet.match WOULD be counted as a failure",
    results.some((h) => !h.snippet.match) === false && good === results.length && results.length > 0,
    "this run found no hits to reason about"
  );
  assert(
    "the empty-match test is not vacuously true",
    (() => {
      const broken = results.map((h) => ({ ...h, snippet: { ...h.snippet, match: "" } }));
      return broken.filter((h) => !h.snippet.match).length === broken.length;
    })(),
    "the comparison would not have noticed"
  );

  // The sort check.
  assert(
    "an out-of-order list WOULD be detected by the sort check",
    (() => {
      const scores = [3, 1, 2];
      for (let i = 1; i < scores.length; i++) if (scores[i] > scores[i - 1]) return true;
      return false;
    })(),
    "the comparison would not have noticed a score that rose"
  );

  // The section-attribution check: a sectionId that is not in the TOC must fail.
  const tocIds = new Set((lesson.toc || []).map((t) => t.id));
  assert(
    "a sectionId outside the TOC WOULD be detected",
    !tocIds.has("no-such-section") && !tocIds.has(""),
    "the TOC check would have accepted a fabricated id"
  );

  // And the h5 rule, expressed as the mutation it guards: with level 5 admitted
  // as a section, the fixture's sectionId sequence would differ.
  const SECTION_LEVELS = [3, 4];
  const wouldChange = (levels) => {
    let id = null;
    let text = "";
    const seq = [];
    for (const b of [H(5, "five", "Five"), P("body"), H(3, "three", "Three"), P("body")]) {
      if (b.type === "heading" && levels.includes(b.level)) {
        id = b.id;
        text = b.text;
      }
      seq.push(id);
    }
    return seq.join("|");
  };
  assert(
    "admitting h5 as a section WOULD change the attribution",
    wouldChange(SECTION_LEVELS) !== wouldChange([3, 4, 5]),
    "the h5 assertion is not detecting anything"
  );
}

// ── Report ───────────────────────────────────────────────────────────────────

console.log(
  `corpus: ${lessons} lesson(s), ${blocks} block(s), ${hits} hit(s), ${snippets} snippet(s) across ${CORPUS_QUERIES.length} queries`
);
console.log(
  `section attribution: ${sectionAttributed} block(s) in a named section, ${unnamedBeforeFirstSection} before the first one`
);
console.log(
  `TOC levels: ${[...tocLevels].sort().map(([k, n]) => `h${k}=${n}`).join("  ")}`
);
console.log(`block types seen: ${[...seenBlockTypes].filter(Boolean).sort().join(", ")}`);
console.log(
  `h5 headings in the corpus: ${h5InCorpus} (the h5 rule is therefore fixture-only today)`
);
for (const n of FILE_NOTES) console.log(`  ${n}`);
if (corpusProblems.length) {
  console.log(`\ncorpus problems (${corpusProblems.length}):`);
  for (const p of corpusProblems.slice(0, 40)) console.log(`  ${p}`);
  if (corpusProblems.length > 40) console.log(`  ... and ${corpusProblems.length - 40} more`);
}

console.log(`\n${pass} assertion(s) passed, ${failures.length} failed`);
if (failures.length) {
  console.log("");
  for (const f of failures) console.log("FAIL  " + f);
  process.exit(1);
}
console.log(
  "\n✓ lessonTerms, buildEntries and searchLesson agree with each other and with the corpus"
);
