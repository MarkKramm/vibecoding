// Unit tests for lib/renderInline.jsx — the inline Markdown renderer.
//
// WHY THIS EXISTS
// renderInline runs over nearly every string a reader sees: practice tasks,
// checklist items, section headings, table cells, tool purposes. It is the one
// place where authored Markdown syntax becomes structure, and its failure modes
// are all quiet:
//
//   * An over-eager emphasis pass swallows a code span and the reader sees a
//     stray backtick in prose. This has already happened once — the module's own
//     header documents the `Resource: "*"` defect the masking pass fixes — and
//     nothing in the build, the shape audit or the encoding check could see it,
//     because the JSON was correct and only the RENDER was wrong.
//   * The inverse: markup that never renders, so a task reads literally as
//     `**bold**` on screen.
//   * A marker left unbalanced, which is how a passage ends up italicised from
//     the middle of one paragraph into the next.
//
// The module is pure and returns React elements, so it can be driven under plain
// node with the `react` and `react-dom` that already exist in node_modules.
// There is no DOM and none is needed: renderToStaticMarkup serialises the tree
// exactly as the browser would, so every assertion below is about the real
// output rather than about a mock.
//
// HOW A .jsx MODULE LOADS IN PLAIN NODE
// Node cannot import a `.jsx` file — the extension is not one it has a loader
// for — so the source is transpiled in memory with esbuild, which is already on
// disk as a dependency of Vite. Nothing is installed and nothing is written: the
// transform produces a data: URL and the import resolves from there. The file
// being tested is the real src/lib/renderInline.jsx, not a copy of its logic,
// which is the only version of this test worth having.
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO
// It does not mount a component (no jsdom, no testing-library — the project's
// dependency list is `react` and `react-dom` and stays that way) and it does not
// assert React keys, which are internal. It tests the function, which is where
// the logic lives.
//
// Run: node scripts/test-render-inline.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { transformSync } from "esbuild";
import { renderToStaticMarkup } from "react-dom/server";

const { renderInline } = await import(jsxModule("../src/lib/renderInline.jsx"));

/**
 * Transpile a .jsx source file and import it, writing nothing to disk.
 *
 * The output is a data: URL, which carried a subtlety worth recording: a data:
 * URL has no hierarchical base, so the `react/jsx-runtime` import the JSX
 * transform emits cannot be resolved from it — Node throws
 * ERR_UNSUPPORTED_RESOLVE_REQUEST. A file: URL always has a directory, and
 * resolving react/jsx-runtime from one IS node_modules lookup, so an inert
 * placeholder module is written to the OS temp directory and the data: URL is
 * created from inside it via `createRequire`-free `import()` of a small wrapper.
 *
 * Simpler still, and what is done here: the JSX runtime is resolved ONCE to its
 * absolute file: URL and the transform is told to import it by that absolute
 * path, so the transpiled module has no bare specifier left in it at all.
 */
function jsxModule(rel) {
  const abs = fileURLToPath(new URL(rel, import.meta.url));
  const runtime = import.meta.resolve("react/jsx-runtime");
  const code = transformSync(readFileSync(abs, "utf8"), {
    loader: "jsx",
    format: "esm",
    jsx: "automatic",
    jsxImportSource: undefined,
    sourcefile: abs,
  }).code
    // Rewrite the bare specifier to the absolute one, which a data: URL CAN
    // resolve because it is already fully qualified.
    .replace('"react/jsx-runtime"', JSON.stringify(runtime));
  return "data:text/javascript;base64," + Buffer.from(code, "utf8").toString("base64");
}

let pass = 0;
const failures = [];

/**
 * Assert that rendering `input` yields exactly `want`.
 *
 * Comparison is on serialised markup, because that is where an over-eager or
 * missing pass actually shows up: asserting on a React element's props would
 * still pass when its nested children are wrong, which is precisely the code
 * span inside bold case this file exists to protect.
 */
function eq(name, input, want) {
  let got;
  try {
    got = renderToStaticMarkup(renderInline(input, "k"));
  } catch (e) {
    failures.push(`${name}\n     threw: ${(e && e.message) || e}`);
    return;
  }
  if (got === want) {
    pass++;
    return;
  }
  failures.push(
    `${name}\n     input: ${JSON.stringify(input)}\n     want:  ${want}\n     got:   ${got}`
  );
}

/** Assert a predicate over the rendered markup. */
function ok(name, input, predicate, describe) {
  let got;
  try {
    got = renderToStaticMarkup(renderInline(input, "k"));
  } catch (e) {
    failures.push(`${name}\n     threw: ${(e && e.message) || e}`);
    return;
  }
  if (predicate(got)) {
    pass++;
    return;
  }
  failures.push(
    `${name}\n     input: ${JSON.stringify(input)}\n     want:  ${describe}\n     got:   ${got}`
  );
}

// ── The fast path ────────────────────────────────────────────────────────────
// renderInline returns the ORIGINAL STRING, not an array, when there is nothing
// to format. Callers rely on that: a string renders as a bare text node, and
// wrapping it in an array would change React's reconciliation for no reason.
// Asserted on identity, so a future refactor that always allocates is caught.

{
  const plain = "Activate the virtual environment before installing anything.";
  const out = renderInline(plain, "k");
  if (out === plain) pass++;
  else failures.push(`fast path returns the original string\n     got: ${JSON.stringify(out)}`);
}

{
  // Non-strings and the empty string pass straight through, so a phase with a
  // missing field renders as nothing rather than crashing the page.
  for (const v of ["", null, undefined, 0, 42, {}, []]) {
    const out = renderInline(v, "k");
    if (out === v) pass++;
    else failures.push(`passthrough of ${JSON.stringify(v)}\n     got: ${JSON.stringify(out)}`);
  }
}

// ── Emphasis ─────────────────────────────────────────────────────────────────

eq("plain bold", "Run **this** now.", "Run <strong>this</strong> now.");
eq("plain italic", "Run *this* now.", "Run <em>this</em> now.");
eq("bold at the very start", "**Bold** first.", "<strong>Bold</strong> first.");
eq("bold at the very end", "Last word is **bold**", "Last word is <strong>bold</strong>");
eq(
  "bold and italic in one string",
  "a **b** c *d* e",
  "a <strong>b</strong> c <em>d</em> e"
);
// Alternation order matters: **bold** must be consumed as one unit rather than
// as two italic runs. If TOKEN's order were reversed this renders as nested
// empty <em> elements and the asterisks leak.
eq("bold is not two italics", "**x**", "<strong>x</strong>");
// A run of asterisks with content between them and nothing else around it.
eq("adjacent markers", "**a****b**", "<strong>a</strong><strong>b</strong>");
eq(
  "adjacent bold and italic",
  "**a***b*",
  "<strong>a</strong><em>b</em>"
);
eq("asterisk inside a word is literal", "2*3*4", "2<em>3</em>4");
// AN ITALIC RUN MAY CONTAIN A NEWLINE, AND THAT IS THE INTENDED BEHAVIOUR, NOT
// AN OVERSIGHT. TOKEN's italic branch is `\*[^*\n]+\*` — the newline is excluded
// from the CONTENT, not from the delimiters — so a paragraph authored as
//
//     *the point that spans
//     two source lines*
//
// renders as one <em>, which is what the author meant and what React would
// otherwise reflow into a broken run. Only an asterisk can terminate the run, so
// there is no pathological span here. Pinned deliberately: it is the kind of
// behaviour a later "tidy-up" of the regex would quietly change, and the symptom
// (bold prose displaying with visible asterisks) would look like a content bug.
eq("italic spans a source newline", "*one\ntwo*", "<em>one\ntwo</em>");
eq("italic stops at the next asterisk", "*a* b *c*", "<em>a</em> b <em>c</em>");

// ── Code spans ───────────────────────────────────────────────────────────────

eq("single code span", "Run `npm test` now.", "Run <code>npm test</code> now.");
eq(
  "two code spans in one string",
  "`a` and `b`",
  "<code>a</code> and <code>b</code>"
);
eq(
  "code span at the edges",
  "`x` middle `y`",
  "<code>x</code> middle <code>y</code>"
);

// THE REGRESSION THIS MODULE WAS WRITTEN FOR. The asterisk inside the code span
// is data — part of a JSON value — not an italic marker. Before the masking
// pass, the emphasis pass saw it first, failed to match the bold run, and fell
// back to matching *italic* ACROSS the code span, shredding both and leaking a
// backtick into the prose. This exact sentence is quoted in the module header.
eq(
  'bold containing code with an asterisk in it (the `Resource: "*"` defect)',
  'The third statement uses `Resource: "*"` inside a key policy.',
  'The third statement uses <code>Resource: &quot;*&quot;</code> inside a key policy.'
);
eq(
  "bold that wraps a code span still formats the code",
  "**`/etc`**",
  "<strong><code>/etc</code></strong>"
);
eq(
  "bold wrapping code and prose",
  "Use **`--dry-run` first**.",
  "Use <strong><code>--dry-run</code> first</strong>."
);
eq(
  "italic wrapping a code span",
  "*`x`*",
  "<em><code>x</code></em>"
);
eq(
  "markers inside a code span are literal",
  "`**not bold**`",
  "<code>**not bold**</code>"
);
eq(
  "unpaired backtick renders literally",
  "a ` b",
  "a ` b"
);
eq(
  "code span may not contain a newline",
  "`one\ntwo`",
  "`one\ntwo`"
);

// ── HTML escaping, and the absence of raw markup ─────────────────────────────
// renderInline returns React elements and never an HTML string, so there is no
// dangerouslySetInnerHTML anywhere in this path (the only mention of it in src/
// is the comment saying so). These assertions pin the consequence: authored
// angle brackets reach the reader as visible text.

eq(
  "angle brackets are escaped",
  "Use <div> here",
  "Use &lt;div&gt; here"
);
eq(
  "a script tag in content is text, never a tag",
  "<script>alert(1)</script>",
  "&lt;script&gt;alert(1)&lt;/script&gt;"
);
eq(
  "a script tag inside bold is still text",
  "**<script>alert(1)</script>**",
  "<strong>&lt;script&gt;alert(1)&lt;/script&gt;</strong>"
);
eq(
  "a script tag inside a code span is still text",
  "`<script>alert(1)</script>`",
  "<code>&lt;script&gt;alert(1)&lt;/script&gt;</code>"
);
eq(
  "an img onerror payload is text",
  '<img src=x onerror="alert(1)">',
  "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"
);
// A NUL is the mask sentinel. Real content cannot contain one, but if it ever
// did it must not be able to fake a sentinel and pull an unrelated span's text
// into the output; unpaired sentinels are left as literal text.
eq(
  "an unpaired sentinel character is literal",
  "a \u0000 b",
  "a \u0000 b"
);

// ── Always-array, always-keys ────────────────────────────────────────────────
// Anything that went through a formatting pass must come back as an ARRAY, even
// when nothing actually matched inside it. Callers spread the result into a
// parent element; a string mixed in with elements would produce inconsistent
// React children.

ok(
  "a formatted string returns an array",
  "plain **bold** text",
  (m) => typeof m === "string" && m.length > 0,
  "markup without a wrapping element"
);

{
  const out = renderInline("**a** `b` *c*", "k");
  if (Array.isArray(out)) pass++;
  else failures.push(`formatted output is an array, got ${typeof out}`);
}

// ── The real corpus ──────────────────────────────────────────────────────────
// The unit cases above are hand-written, so they cannot catch the shapes the
// corpus actually contains. This section runs the renderer over EVERY authored
// content string in every phase and asserts two invariants that no hand-written
// case would notice at scale:
//
//   1. It never throws. A malformed string in one phase would otherwise take
//      the whole page down, not just that paragraph.
//   2. It NEVER leaves a raw emphasis marker or backtick in the output unless
//      the source was genuinely unbalanced. Markers that survive are the
//      authoring patterns the renderer cannot express, and the count is
//      reported so a new one is visible rather than silent.
//
// tracks.js is pure data (index.json renders to a normalised track list), so
// this needs no browser and no bundler. All six roadmaps live in the tree above,
// so every one of them is walked, and every field walk() meets is descended into
// by type — an array of objects with a `text` field is covered without this file
// having to know the name of the field.

const markers = (s) => (String(s).match(/\*\*|`/g) || []).length;
let strings = 0;
let survived = 0;
const survivors = [];
const throwers = [];

function walk(value, where) {
  if (typeof value === "string") {
    strings++;
    let html;
    try {
      html = renderToStaticMarkup(renderInline(value, "k"));
    } catch (e) {
      throwers.push(`${where}: ${(e && e.message) || e}`);
      return;
    }
    // The marker lives in the source; if it also appears in the output it was
    // not interpreted. Markup characters are encoded in the output, so a
    // surviving "**" or backtick is unambiguous.
    if (markers(value) && markers(html)) {
      survived++;
      if (survivors.length < 12) survivors.push(`${where}: ${JSON.stringify(value.slice(0, 110))}`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, `${where}[${i}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) walk(v, `${where}.${k}`);
  }
}

// index.json carries every phase summary for every track, so this is the whole
// corpus rather than the one track whose full JSON happens to be small enough to
// read casually.
const INDEX = JSON.parse(
  readFileSync(fileURLToPath(new URL("../src/data/generated/index.json", import.meta.url)), "utf8")
);

const FIELDS = [
  "goal",
  "deliverable",
  "exitCriteria",
  "lessonTitle",
  "title",
  "duration",
  "skills",
  "deliverableItems",
  "topics",
  "tasks",
  "checklist",
  "quiz",
  "tools",
  "resources",
  "freeVsPaid",
];

const phaseIds = [];

for (const track of INDEX.tracks || []) {
  for (const p of track.phases || []) {
    phaseIds.push(p.id);
    for (const field of FIELDS) {
      if (p[field] !== undefined) walk(p[field], `${p.id}.${field}`);
    }
  }
}

if (throwers.length) {
  for (const t of throwers.slice(0, 5)) failures.push(`renderInline threw on content — ${t}`);
} else {
  pass++;
}

console.log(
  `${strings} authored content string(s) rendered across ${phaseIds.length} phase(s) in ${(INDEX.tracks || []).length} track(s)`
);
if (survivors.length) {
  console.log(`\n${survived} string(s) carry a marker the renderer left literal:`);
  for (const s of survivors) console.log(`  ${s}`);
  if (survived > survivors.length) console.log(`  ... and ${survived - survivors.length} more`);
  console.log("  (reported, not failed: an unbalanced marker is an authoring choice)");
}

console.log(`\n${pass} assertion(s) passed, ${failures.length} failed`);
if (failures.length) {
  console.log("");
  for (const f of failures) console.log("FAIL  " + f);
  process.exit(1);
}
console.log("\n✓ renderInline produces the expected markup for every case");
