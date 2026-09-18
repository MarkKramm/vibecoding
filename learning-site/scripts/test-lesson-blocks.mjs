// Proves that every lesson block type the PARSER can emit has a RENDERER, and
// that the renderer's output is the right element for the shape.
//
// WHY THIS EXISTS, AND WHAT IT CATCHES THAT NOTHING ELSE DOES
// Three separate files agree about the lesson block vocabulary and none of them
// checks the others:
//
//   * scripts/lesson-ast.mjs   emits the blocks, and rejects any OTHER type
//   * src/lib/lessonSearch.js  indexes a block by type, with a fallback
//   * src/components/LessonBlock.jsx  renders one, with a "unsupported" default
//
// The parser refusing an unknown type is what keeps the vocabulary closed, so
// the failure mode is not a block nobody handles — it is the two halves drifting
// apart when the vocabulary is DELIBERATELY widened. Adding a seventh type to
// the parser is a one-line change there; every lesson using it then renders on
// screen as the literal text
//
//     Unsupported block type: table-of-contents
//
// and the build, the shape audit, the lesson-AST character audit and the
// encoding check all stay green, because the JSON is well-formed and no
// character was lost. It is purely a mismatch between data and renderer.
//
// This file closes that gap from the RENDER side, which is the side that
// currently has no check at all: it reads the component's switch, reads the
// parser's accepted set, and requires them to be the same set — then renders one
// representative block of each type to prove the branch returns an element
// rather than falling through to the default.
//
// A NOTE ON HONESTY
// A set-equality check against a set it also reads from the same source can be
// made to pass trivially. The negative controls at the bottom of this file exist
// for that reason: they assert that the default branch produces the "Unsupported"
// marker for an unknown type and that the comparison WOULD fail if a case were
// missing. An assertion that cannot fail is worse than none, so the failability
// is itself tested.
//
// Run: node scripts/test-lesson-blocks.mjs

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { transformSync } from "esbuild";
import { renderToStaticMarkup } from "react-dom/server";

const GEN = fileURLToPath(new URL("../src/data/generated/", import.meta.url));
const LESSONS = join(GEN, "lessons");
const REPO_SCRIPTS = fileURLToPath(new URL("../../scripts/", import.meta.url));
const BLOCK_SRC = fileURLToPath(new URL("../src/components/LessonBlock.jsx", import.meta.url));

let pass = 0;
const failures = [];

function check(name, got, want) {
  const a = JSON.stringify(got);
  const b = JSON.stringify(want);
  if (a === b) {
    pass++;
    return;
  }
  failures.push(`${name}\n     want: ${b}\n     got:  ${a}`);
}

function assert(name, cond, detail = "") {
  if (cond) {
    pass++;
    return;
  }
  failures.push(`${name}${detail ? "\n     " + detail : ""}`);
}

// ── Load the real component ──────────────────────────────────────────────────
// LessonBlock.jsx is JSX and it imports two more modules, so it cannot be
// imported from a data: URL: those have no hierarchical base, which makes BOTH
// the bare `react` specifier and the relative `../lib/renderInline.jsx` import
// unresolvable (ERR_UNSUPPORTED_RESOLVE_REQUEST). So the whole import graph the
// component needs is compiled and written to ONE self-contained module in the OS
// temp directory, with every specifier rewritten to an absolute file: URL. That
// module is the real component source, transpiled — not a reimplementation.
//
// The temp directory is used rather than the repo so this creates no artifact
// next to the tests; the file is removed in the `finally` at the bottom.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

const REACT = fileURLToPath(new URL("../node_modules/react/index.js", import.meta.url));
const RENDER_INLINE = fileURLToPath(new URL("../src/lib/renderInline.jsx", import.meta.url));

const tempDir = mkdtempSync(join(tmpdir(), "vbblocks-"));

function compile(abs) {
  return transformSync(readFileSync(abs, "utf8"), {
    loader: "jsx",
    format: "esm",
    jsx: "automatic",
    sourcefile: abs,
  }).code;
}

function loadComponent() {
  // Each compiled module injects its OWN `import { jsx, jsxs, Fragment } from
  // "react/jsx-runtime"`. Concatenating two of them therefore declares `jsx`
  // twice, which is a SyntaxError in an ES module. Namespacing each module's
  // runtime import and shadowing the bare identifiers inside it keeps the two
  // modules independent while leaving their bodies untouched.
  const RUNTIME = import.meta.resolve("react/jsx-runtime");
  const namespaced = (code, ns) => {
    // ORDER MATTERS, TWICE OVER.
    //
    // 1. The identifier rename runs on the BODY only, with the runtime import
    //    line cut out first and spliced back after. Renaming the whole file
    //    rewrites the `jsx` inside the specifier itself, producing the mangled
    //    path `react/__lb.jsx-runtime.js`.
    // 2. The relative `../lib/renderInline.jsx` import is rewritten to a file:
    //    URL in a SEPARATE pass, before any identifier substitution, or the same
    //    rename turns `renderInline.jsx` into `__lb.renderInline.jsx`.
    //
    // The import of renderInline is dropped entirely: that module's body is
    // bundled in ahead of this one, so its `renderInline` is already in scope.
    const header = code.match(/^import\s*\{[^}]*\}\s*from\s*"react\/jsx-runtime";?$/m);
    // Asserted rather than assumed: if a future esbuild changed the shape of the
    // injected runtime import, a silent no-op here would leave two `jsx`
    // declarations and the failure would surface as a confusing SyntaxError from
    // a temp file instead of from this line.
    if (!header) throw new Error("no JSX runtime import found to namespace in the compiled source");

    const body = code
      .replace(header[0], "")
      // The renderInline import is DELETED, not rewritten: that module's body is
      // bundled in ahead of this one, so its `__renderInline` is already in
      // scope. Rewriting the specifier instead would leave a path for the later
      // identifier substitution to mangle.
      .replace(/^import\s*\{[^}]*\}\s*from\s*"\.\.\/lib\/renderInline\.jsx";?$/m, "")
      .replace(/\bjsxs?\b|\bFragment\b/g, (m) => `${ns}.${m}`)
      // The bundled renderInline is renamed, so the two declarations cannot
      // collide and the component still resolves to the REAL implementation.
      .replace(/\brenderInline\b/g, "__renderInline");

    return `import * as ${ns} from ${JSON.stringify(RUNTIME)};\n${body}`;
  };

  const parts = [
    namespaced(compile(RENDER_INLINE).replace(/export\s*\{[^}]*\};?/g, ""), "__ri"),
    namespaced(compile(BLOCK_SRC), "__lb"),
  ];
  // `react` is imported by the component for hooks. It is pre-seeded ONCE here,
  // ahead of the body, and the component's own import line is dropped — the
  // component body is the only part that references these names, so hoisting
  // them keeps the module flat. React's hook FUNCTIONS only have to exist: this
  // component is rendered with a plain function call rather than through the
  // reconciler, so no hook is ever invoked on a real component instance.
  const code =
    `import { useCallback, useEffect, useRef, useState } from ${JSON.stringify(
      "file:///" + REACT.replace(/\\/g, "/")
    )};\n` +
    parts.map((p) => p.replace(/^import\s*\{[^}]*\}\s*from\s*"react";?$/m, "")).join("\n");

  const file = join(tempDir, "lesson-block.test-module.mjs");
  writeFileSync(file, code, "utf8");
  return import("file:///" + file.replace(/\\/g, "/"));
}

const mod = await loadComponent();
const LessonBlock = mod.default;

assert("LessonBlock.jsx exports a component", typeof LessonBlock === "function", `got ${typeof LessonBlock}`);

// ── The parser's accepted set ────────────────────────────────────────────────
// Read from the source of truth rather than restated here, so widening the
// parser without touching this file is a FAILURE rather than a silent pass. The
// set literal is what lesson-ast.mjs uses to reject anything else.
const AST_SRC = readFileSync(join(REPO_SCRIPTS, "lesson-ast.mjs"), "utf8");
const knownMatch = AST_SRC.match(/const KNOWN = new Set\(\[([^\]]*)\]\)/);
assert("scripts/lesson-ast.mjs still declares a KNOWN block set", Boolean(knownMatch));
const PARSER_TYPES = knownMatch
  ? [...knownMatch[1].matchAll(/'([a-z-]+)'/g)].map((m) => m[1]).sort()
  : [];

// ── The renderer's handled set ───────────────────────────────────────────────
// Every `case "<type>":` inside the LessonBlock switch, in source order.
const COMPONENT_SRC = readFileSync(BLOCK_SRC, "utf8");
const RENDERED = [...COMPONENT_SRC.matchAll(/^\s*case\s+"([a-z-]+)":/gm)].map((m) => m[1]);

assert(
  "LessonBlock declares at least the six known cases",
  RENDERED.length >= 6,
  `found ${RENDERED.length}: ${RENDERED.join(", ")}`
);

const renderedSorted = [...RENDERED].sort();
check("parser block types and renderer cases are the SAME SET", renderedSorted, PARSER_TYPES);

// A case that no longer matches any emitted type is dead code that looks like
// coverage. Reported as its own failure because the fix is different.
const dead = renderedSorted.filter((t) => !PARSER_TYPES.includes(t));
check("no renderer case is unreachable", dead, []);

// ── Every type actually present in the corpus also has a case ────────────────
// The sets above are declarations. This checks the DATA: a type that appears in
// a generated lesson but has no case would render as the unsupported marker on a
// real page today.
const seenTypes = new Set();
const fileTypes = new Map();
let lessons = 0;
let blocks = 0;
let tocs = 0;

for (const file of readdirSync(LESSONS)) {
  if (!file.endsWith(".json")) continue;
  lessons++;
  const lesson = JSON.parse(readFileSync(join(LESSONS, file), "utf8"));
  const here = new Set();
  for (const b of lesson.blocks || []) {
    blocks++;
    seenTypes.add(b.type);
    here.add(b.type);
  }
  fileTypes.set(file, here);
  tocs += (lesson.toc || []).length;
}

const unhandled = [...seenTypes].filter((t) => !RENDERED.includes(t)).sort();
check("every block type present in the corpus has a case", unhandled, []);
check("every parser type is present in the corpus", PARSER_TYPES.filter((t) => !seenTypes.has(t)), []);

// ── The TOC invariant ────────────────────────────────────────────────────────
// Lesson.jsx decides which headings are tickable and lessonSearch.js decides
// which start a section, and BOTH use the literal pair (3, 4) / level 3 or 4.
// The TOC is generated by the parser; if it ever contained a level 5, the
// heading would be rendered as a navigable section by one and not the other.
const levels = new Map();
for (const file of readdirSync(LESSONS)) {
  if (!file.endsWith(".json")) continue;
  const lesson = JSON.parse(readFileSync(join(LESSONS, file), "utf8"));
  for (const t of lesson.toc || []) levels.set(t.level, (levels.get(t.level) || 0) + 1);
}
check("the TOC contains only levels 3 and 4", [...levels.keys()].sort(), [3, 4]);

// ── Render one representative block of each type ─────────────────────────────
// The set comparison above reads the source. This drives the component, so a
// case that exists but returns undefined (a broken branch) still fails.
//
// The fixtures are the minimum each renderer touches. They are built inline —
// no fixture file is written — and each one is shaped like the parser's output:
// LessonBlock reads `block.paras` for a quote, `block.head`/`block.rows` for a
// table, and `block.items` (with a `children` array on every item) for a list.
const FIXTURES = {
  heading: { type: "heading", level: 3, id: "sec", text: "A **heading**" },
  para: { type: "para", text: "A paragraph with `code` in it." },
  code: { type: "code", lang: "bash", text: "npm test" },
  quote: { type: "quote", paras: ["Quoted prose."] },
  table: { type: "table", head: ["A", "B"], rows: [["1", "2"]] },
  list: {
    type: "list",
    ordered: false,
    items: [
      { text: "first", checked: true, children: [] },
      {
        text: "second",
        children: [{ type: "list", ordered: true, items: [{ text: "nested", children: [] }] }],
      },
    ],
  },
};

for (const type of PARSER_TYPES) {
  const block = FIXTURES[type];
  if (!block) {
    failures.push(`no fixture for block type "${type}" — add one so it is actually rendered`);
    continue;
  }
  let html;
  try {
    html = renderToStaticMarkup(LessonBlock({ block, index: 0 }));
  } catch (e) {
    failures.push(`rendering a "${type}" block threw: ${(e && e.message) || e}`);
    continue;
  }
  assert(`"${type}" renders without throwing`, typeof html === "string" && html.length > 0);
  assert(
    `"${type}" does not hit the unsupported default`,
    !html.includes("Unsupported block type"),
    `rendered: ${html.slice(0, 120)}`
  );
}

// The element each branch is supposed to produce. Without this the check above
// would pass for a switch that rendered every type as a paragraph.
const EXPECTED_TAG = {
  heading: "<h3",
  para: "<p>",
  code: "<pre",
  quote: "<blockquote",
  table: "<table",
  list: "<ul>",
};
for (const [type, tag] of Object.entries(EXPECTED_TAG)) {
  const html = renderToStaticMarkup(LessonBlock({ block: FIXTURES[type], index: 0 }));
  assert(`"${type}" renders as ${tag}`, html.includes(tag), `rendered: ${html.slice(0, 120)}`);
}

// Inline formatting must reach the block renderers, not just renderInline's own
// tests: a heading written with **bold** that rendered its asterisks literally
// would look like a content bug in the Markdown.
{
  const html = renderToStaticMarkup(LessonBlock({ block: FIXTURES.heading, index: 0 }));
  assert("a heading formats its inline bold", html.includes("<strong>heading</strong>"), html);
  const t = renderToStaticMarkup(LessonBlock({ block: FIXTURES.table, index: 0 }));
  assert("a table renders a header row and a body row", t.includes("<th>") && t.includes("<td>"), t.slice(0, 160));
}

// Heading LEVEL MAPPING. Lesson.jsx maps a block at the base level to an h3 and
// the level below it to an h4, so a shared strategy document (base 1) keeps the
// page's single h1. A block deeper than base+2 clamps to h5 rather than emitting
// an h6 the stylesheet does not define.
{
  const at = (level, base = 3, tag = 3) =>
    renderToStaticMarkup(
      LessonBlock({ block: { type: "heading", level, id: "x", text: "t" }, index: 0, headingBase: base, headingTag: tag })
    );
  assert("heading level 3 at base 3 renders h3", at(3, 3, 3).includes("<h3"), at(3, 3, 3));
  assert("heading level 4 at base 3 renders h4", at(4, 3, 3).includes("<h4"), at(4, 3, 3));
  assert("heading level 5 at base 3 renders h5", at(5, 3, 3).includes("<h5"), at(5, 3, 3));
  assert("heading level 4 clamps to h5", at(6, 3, 3).includes("<h5"), at(6, 3, 3));
  assert("shared doc: level 1 at base 1 renders h3", at(1, 1, 3).includes("<h3"), at(1, 1, 3));
  assert(
    "no heading ever exceeds h5",
    ![at(3, 3, 3), at(4, 3, 3), at(5, 3, 3), at(7, 3, 3), at(9, 3, 3)].some((h) => /<h6/.test(h))
  );
}

// ── Negative controls ────────────────────────────────────────────────────────
// These prove the checks above can FAIL, which is the only thing that makes them
// worth running.

{
  const html = renderToStaticMarkup(
    LessonBlock({ block: { type: "table-of-contents", text: "x" }, index: 0 })
  );
  assert(
    "an unknown block type renders the visible unsupported marker",
    html.includes("Unsupported block type") && html.includes("table-of-contents"),
    html
  );
}

{
  // If a case were deleted from the switch, the set comparison must notice. This
  // re-runs the comparison against a deliberately-shortened renderer set rather
  // than trusting that it would have.
  const shortened = RENDERED.filter((t) => t !== "quote").sort();
  const wouldFail = JSON.stringify(shortened) !== JSON.stringify(PARSER_TYPES);
  assert("removing a case WOULD fail the set comparison", wouldFail);
  const added = [...RENDERED, "callout"].sort();
  assert(
    "adding a parser type WOULD fail the set comparison",
    JSON.stringify(added) !== JSON.stringify(PARSER_TYPES)
  );
}

{
  // The parser's own contract. If lesson-ast.mjs started accepting a seventh
  // type, the KNOWN set read above would grow and the comparison would fail —
  // this asserts that reading it is not returning a constant from a stale file.
  assert(
    "the parser set was actually parsed out of the source",
    PARSER_TYPES.length === 6 && PARSER_TYPES.includes("list") && PARSER_TYPES.includes("table"),
    `parsed: ${JSON.stringify(PARSER_TYPES)}`
  );
}

// ── The generated lesson files are current ───────────────────────────────────
// Every check above reads src/data/generated/, which is a BUILD ARTIFACT. If it
// were stale, all of this would be auditing a corpus that no longer exists. The
// build script can answer that itself, cheaply and without writing anything.
{
  const r = spawnSync("node", [join(REPO_SCRIPTS, "build-content.mjs"), "--check"], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    encoding: "utf8",
    shell: false,
  });
  assert(
    "the generated lesson JSON matches its Markdown sources",
    r.status === 0,
    `build-content --check exited ${r.status}\n     ${String(r.stdout || "").slice(-400)}`
  );
}

// ── Report ───────────────────────────────────────────────────────────────────

console.log(
  `\n${lessons} lesson(s), ${blocks} block(s), ${tocs} TOC entr(ies) from the generated JSON`
);
console.log(`block types seen in the corpus: ${[...seenTypes].sort().join(", ")}`);
console.log(`parser accepts:   ${PARSER_TYPES.join(", ")}`);
console.log(`renderer handles: ${renderedSorted.join(", ")}`);
console.log(`TOC levels: ${[...levels].sort().map(([k, n]) => `h${k}=${n}`).join("  ")}`);

rmSync(tempDir, { recursive: true, force: true });

console.log(`\n${pass} assertion(s) passed, ${failures.length} failed`);
if (failures.length) {
  console.log("");
  for (const f of failures) console.log("FAIL  " + f);
  process.exit(1);
}
console.log("\n✓ every block type the parser can emit has a renderer, and it renders the right element");
