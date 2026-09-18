// Renders the real components and asserts on what a reader would actually see.
//
// WHY THIS EXISTS
// ---------------
// Three defects reached the RENDERED PAGE in this project while every content
// guard stayed green, and all three share one shape: the JSON was correct, the
// Markdown was correct, the shape audit was correct, and the component still put
// the wrong thing on screen.
//
//   1. THE WHOLE SITE RENDERED UNSTYLED. global.css styled 344 classes but
//      defined none of the top-level layout classes. No content check can see a
//      missing CSS rule, because a missing rule changes no text and breaks no
//      JSON field. (audit-css.mjs now covers the wiring; this file covers the
//      classes the components actually EMIT, which is the other half.)
//
//   2. THE TOOLS LIBRARY RENDERED "0 tools across 10 written tracks" while the
//      corpus held 433 tool rows. ToolsLibrary.jsx iterated `phase.tools` over
//      the LIGHT projection, which does not carry that field, and `|| []` turned
//      `undefined` into a confident, well-formatted, entirely false statement.
//      The page did not crash and did not say "missing" — it said zero.
//
//   3. 40 TOOL CARDS EMITTED `<a href="\u2014">`. The corpus writes `\u2014` in a table cell to mean
//      "there is none", and that placeholder was passed through as a URL where
//      `tool.url &&` accepted it as truthy, producing a link to nowhere.
//
// Each of these is an assertion about rendered markup, so each is caught here by
// rendering the component and reading the output. That is the whole point of this
// file: it is the only check in the suite that asks "what did the reader GET",
// rather than "what does the data SAY".
//
// HOW A .jsx COMPONENT LOADS IN PLAIN NODE
// ----------------------------------------
// Same technique as the sibling tests, and for the same reason: node cannot
// import a `.jsx` file, and nothing here is installed to teach it. The source is
// transpiled in memory with esbuild — already on disk as a dependency of Vite —
// and the import graph a component needs is concatenated into ONE self-contained
// module written to the OS temp directory, with every bare specifier rewritten to
// an absolute file: URL. The component under test is the REAL src/components/*.jsx
// source, transpiled, never a copy of its logic.
//
// WHY THE COMPONENTS ARE INVOKED DIRECTLY, AND WHY THAT IS HONEST HERE
// -------------------------------------------------------------------
// The ideal is `renderToStaticMarkup(<ToolCard tool={t} />)`, which is what the
// running app does: React owns the element and calls the component. Every
// component tested here is hook-free, so invoking it directly and serialising the
// element it RETURNS produces the same markup byte for byte -- verified rather
// than assumed, by rendering `ToolCard({ tool })` both ways and comparing.
//
// The reason to do it this way is Quiz: it calls `useQuizAnswers`, which reads
// `window.localStorage`, and there is no DOM in this process. Rendering it would
// mean either adding jsdom or testing-library -- a dependency this project
// deliberately does not have and this file will not add -- or stubbing the hook,
// which would make the assertion about the stub rather than about the component.
// Quiz is therefore driven through the pure function it exports for exactly this
// purpose (`normaliseQuestion`) and through `summarise` in lib/quiz.js, which
// together decide which option is right and what the why-line says. The part of
// Quiz that is genuinely hook-bound -- the click handler and the answered/not-
// answered styling -- is a STATED GAP, named at the bottom of this file rather
// than pretended away.
//
// So: the hook-free components are rendered for real, and Quiz is tested to the
// boundary of what can be reached without a DOM.
//
// A NOTE ON THE CORPUS FIXTURES
// -----------------------------
// Several assertions below run over EVERY phase in the generated JSON rather than
// a hand-written fixture, because a fixture proves the component works on the
// shape its author imagined and the corpus is the shape that actually ships. The
// generated directory is a build artifact, so the last section confirms it still
// matches its Markdown sources.
//
// Run: node scripts/test-components.mjs

import { readFileSync, readdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { transformSync } from "esbuild";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const GEN = fileURLToPath(new URL("../src/data/generated/", import.meta.url));
const SITE = fileURLToPath(new URL("..", import.meta.url));
const COMPONENTS = fileURLToPath(new URL("../src/components/", import.meta.url));

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

// ── Loading the real components ──────────────────────────────────────────────
// Each compiled module injects its OWN `import { jsx, jsxs } from "react/jsx-runtime"`,
// so concatenating two of them declares `jsx` twice, which is a SyntaxError in an
// ES module. Namespacing each module's runtime import and shadowing the bare
// identifiers inside it keeps the modules independent while leaving their bodies
// untouched — the technique test-lesson-blocks.mjs uses, and the two comments it
// carries about pass ORDER apply here unchanged:
//
//   1. The identifier rename runs on the BODY only, with the runtime import line
//      cut out first and spliced back after. Renaming the whole file rewrites the
//      `jsx` inside the specifier itself, producing a mangled path.
//   2. Relative imports are rewritten to absolute file: URLs in a SEPARATE pass,
//      before any identifier substitution, or the same rename corrupts the path.
const RUNTIME = import.meta.resolve("react/jsx-runtime");
const REACT = fileURLToPath(new URL("../node_modules/react/index.js", import.meta.url));

const tempDir = mkdtempSync(join(tmpdir(), "vbcomponents-"));

function compile(abs) {
  return transformSync(readFileSync(abs, "utf8"), {
    loader: "jsx",
    format: "esm",
    jsx: "automatic",
    sourcefile: abs,
  }).code;
}

/**
 * Compile one source file into a namespaced module body.
 *
 * `ns` prefixes the JSX runtime identifiers the transform injects, so two
 * concatenated modules cannot declare `jsx` twice.
 *
 * `drop` lists relative imports whose module is bundled in ahead of this one, so
 * the import line is DELETED rather than rewritten — rewriting it would leave a
 * path for the later identifier substitution to mangle.
 *
 * `rename` handles a bundled dependency: the caller names the identifier it is
 * renaming, so the declaration and every reference agree.
 */
function module(sourcePath, ns, { drop = [], rename = {} } = {}) {
  let code = compile(sourcePath);

  const header = code.match(/^import\s*\{[^}]*\}\s*from\s*"react\/jsx-runtime";?$/m);
  // Asserted, not assumed: a silent no-op here would leave two `jsx` declarations
  // and the failure would surface as a confusing SyntaxError from a temp file
  // rather than from this line.
  if (!header) throw new Error(`no JSX runtime import found to namespace in ${sourcePath}`);
  code = code.replace(header[0], "");

  for (const spec of drop) {
    // The specifier is escaped before it becomes a pattern: `../data/tools.js`
    // contains regex metacharacters, and an unescaped `.` would match anything.
    const pattern = new RegExp(
      `^import\\s*\\{[^}]*\\}\\s*from\\s*"${spec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}";?$`,
      "m"
    );
    // Asserted rather than assumed: a `drop` that silently matches nothing leaves
    // the bundled module imported a second time, and the failure would surface as
    // a confusing "already declared" SyntaxError from a temp file.
    if (!pattern.test(code)) {
      throw new Error(`no brace import of "${spec}" found in ${sourcePath} to drop`);
    }
    code = code.replace(pattern, "");
  }
  // `import ProgressBar from "./ProgressBar.jsx"` — a default import, which the
  // brace pattern above does not match. Same rule: deleted, because the module is
  // bundled ahead of this one and `ProgressBar` is already in scope.
  code = code.replace(/^import\s+[A-Za-z_$][\w$]*\s+from\s*"[^"]*";?$/m, "");

  code = code
    .replace(/\bjsxs?\b|\bFragment\b/g, (m) => `${ns}.${m}`)
    // esbuild emits the default export as a MULTI-LINE block at the end:
    //     export {
    //       PhaseCard as default
    //     };
    // This is rewritten into a `const <ns>_default = PhaseCard;` binding so the
    // three components can live side by side in one flat module under distinct
    // names. Leaving it in makes the concatenation re-export a name it also
    // declares, which fails as `SyntaxError: Unexpected identifier 'as'` from a
    // temp file rather than from anything in the component.
    .replace(
      /\bexport\s*\{\s*([A-Za-z_$][\w$]*)\s+as\s+default\s*\};?/g,
      (_, decl) =>
        // The component keeps its own name in the flat module, so its `const` and
        // the source's `function ToolCard` cannot collide — the alias is the only
        // new binding, and it is namespaced.
        `const ${ns}_default = ${decl};`
    )
    .replace(/\bexport\s*\{\s*[^}]*\};?/g, "")
    .replace(/\bexport\s+default\s+function\s+([A-Za-z_$][\w$]*)/g, "function $1")
    .replace(/^export\s+(const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm, "$1 $2");

  for (const [from, to] of Object.entries(rename)) {
    code = code.replace(new RegExp(`\\b${from}\\b`, "g"), to);
  }

  return `import * as ${ns} from ${JSON.stringify(RUNTIME)};\n${code}`;
}

/**
 * Bundle a PLAIN JS module — no JSX, so esbuild injects no runtime import and
 * there is nothing to namespace. `data/tools.js` is the only one.
 *
 * Written as a separate function rather than a flag on module() so the JSX path
 * keeps its assertion: a component that suddenly stopped getting a runtime import
 * is a real change worth failing on, while a .js data file never had one.
 */
function bundlePlain(sourcePath, rename = {}) {
  let code = transformSync(readFileSync(sourcePath, "utf8"), {
    loader: "js",
    format: "esm",
    sourcefile: sourcePath,
  }).code;
  if (/from\s*"react\/jsx-runtime"/.test(code)) {
    throw new Error(`${sourcePath} unexpectedly compiled to JSX and needs module() instead`);
  }
  code = code.replace(/^import[^\n]*\n/gm, "").replace(/^export\s+(?=const|let|var|function|class)/gm, "");
  // Same default-export shape as the JSX path: esbuild emits a multi-line
  // `export { costTone as default };` when a module has one.
  code = code.replace(/\bexport\s*\{\s*([A-Za-z_$][\w$]*)\s+as\s+default\s*\};?/g, "const __plainDefault = $1;")
    .replace(/\bexport\s*\{\s*[^}]*\};?/g, "");
  for (const [from, to] of Object.entries(rename)) {
    code = code.replace(new RegExp(`\\b${from}\\b`, "g"), to);
  }
  return code;
}

const REACT_IMPORT = `import { useCallback, useEffect, useId, useMemo, useRef, useState } from ${JSON.stringify(
  "file:///" + REACT.replace(/\\/g, "/")
)};`;

// The dependency graph, bundled flat in the order each module is needed. The
// components under test are the REAL sources; only their import statements are
// rewritten, and every body is untouched.
//
//   renderInline.jsx  -> bundled as __renderInline, used by ToolCard and PhaseCard
//   data/tools.js     -> costTone, bundled as __costTone, used by ToolCard
//   ProgressBar.jsx   -> rendered by PhaseCard, and tested directly
//   PhaseCard.jsx     -> under test
//   ToolCard.jsx      -> under test
const bundled = [
  module(fileURLToPath(new URL("../src/lib/renderInline.jsx", import.meta.url)), "__ri", {
    rename: { renderInline: "__renderInline" },
  }),
  bundlePlain(join(SITE, "src", "data", "tools.js"), { costTone: "__costTone" }),
  module(join(COMPONENTS, "ProgressBar.jsx"), "__pb"),
  module(join(COMPONENTS, "PhaseCard.jsx"), "__pc"),
  module(join(COMPONENTS, "ToolCard.jsx"), "__tc", {
    drop: ["../data/tools.js", "../lib/renderInline.jsx"],
    // ToolCard imports renderInline and costTone and calls both; the bundled
    // copies above declare them as __renderInline and __costTone, so every
    // reference has to be renamed to match or the component would call a name
    // that no longer exists in this module.
    rename: { renderInline: "__renderInline", costTone: "__costTone" },
  }),
];

const flatModule =
  REACT_IMPORT +
  "\n" +
  bundled.map((b) => b.replace(/^import\s*\{[^}]*\}\s*from\s*"react";?$/m, "")).join("\n") +
  // Each component's default export was bound to a distinctly named const by
  // module(), so the three live side by side in one flat module without colliding.
  `\nexport { __tc_default as ToolCard, __pc_default as PhaseCard, __pb_default as ProgressBar, __renderInline, __costTone };\n`;

const componentFile = join(tempDir, "components.test-module.mjs");
writeFileSync(componentFile, flatModule, "utf8");
const mod = await import("file:///" + componentFile.replace(/\\/g, "/"));

const { ToolCard, PhaseCard, ProgressBar } = mod;

assert("ToolCard.jsx loads as a component", typeof ToolCard === "function", `got ${typeof ToolCard}`);
assert("PhaseCard.jsx loads as a component", typeof PhaseCard === "function", `got ${typeof PhaseCard}`);
assert("ProgressBar.jsx loads as a component", typeof ProgressBar === "function", `got ${typeof ProgressBar}`);

const show = (component, props) => renderToStaticMarkup(component(props));

// ── Sources read as contracts, not as fixtures ───────────────────────────────
// Two things this file asserts about are DECLARED in other files: the light
// projection's phase fields, and the parser's placeholder guard. Both are read
// from source rather than restated here, so widening either without widening this
// test is a failure rather than a silent pass.
const BUILD_SRC = readFileSync(fileURLToPath(new URL("../../scripts/build-content.mjs", import.meta.url)), "utf8");
const INDEX = JSON.parse(readFileSync(join(GEN, "index.json"), "utf8"));

/**
 * The parser's placeholder rule, driven through the REAL pattern.
 *
 * PLACEHOLDER_CELL is read out of scripts/build-content.mjs and recompiled rather
 * than restated here, so a change to the guard is a change to this test's
 * behaviour. `eval` is deliberately not used: the body and flags are pulled out of
 * the source literal separately, which asserts against the real pattern without
 * executing anything.
 *
 * The `trim()` matters and is not decoration. PLACEHOLDER_CELL does not match a
 * bare space, but the parser's `cellValue` trims the cell before testing it, so a
 * whitespace-only cell becomes "" by a second route. Conflating the regex with the
 * function made an earlier draft of this file report a correct parser as broken.
 */
const PLACEHOLDER_SRC = BUILD_SRC.match(/const PLACEHOLDER_CELL = \/(.+)\/([a-z]*);/);
if (!PLACEHOLDER_SRC) {
  throw new Error(
    "PLACEHOLDER_CELL not found in scripts/build-content.mjs — the parser's dash guard was renamed or removed, and every placeholder assertion below depends on it"
  );
}
const PLACEHOLDER_CELL = new RegExp(PLACEHOLDER_SRC[1], PLACEHOLDER_SRC[2]);
const parserBlank = (cell) => {
  const s = String(cell == null ? "" : cell).trim();
  return PLACEHOLDER_CELL.test(s) ? "" : s;
};

const anchors = (html) => html.match(/<a\b[^>]*>/g) || [];
const hrefOf = (tag) => {
  const m = tag.match(/\shref="([^"]*)"/);
  return m ? m[1] : null;
};

/**
 * HTML-escape a string the way React's serializer does.
 *
 * Needed because an AUTHORED string does not appear verbatim in the markup: a
 * goal containing a double quote renders as `&quot;`, and a naive
 * `html.includes(goal)` therefore fails against a component that rendered it
 * perfectly. An earlier draft of this file made exactly that mistake and reported
 * "goal did not reach the output" for eight phases whose goals were on screen.
 * An assertion that fails on correct output is worse than no assertion, so the
 * comparison is done on the escaped form.
 */
const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

// ── A. ToolCard: no URL must mean NO ANCHOR ──────────────────────────────────
// The regression that shipped: 40 tool rows carried a placeholder dash where a URL
// belongs, `tool.url &&` accepted `"\u2014"` as truthy, and the tools library drew
// `<a href="\u2014">Official site</a>` — a link that goes nowhere, styled exactly like
// a working one, with no way for the reader to tell the two apart.
//
// The dash case is the important one and it is asserted EXPLICITLY rather than
// inferred from the empty-string case, because the two fail for different reasons:
// an empty string fails the truthiness test and is caught by accident, while a
// placeholder needs the component to know it is not a URL. The parser normalises
// `\u2014` to `""` today (see PLACEHOLDER_CELL in scripts/build-content.mjs), which is
// precisely why the component's own behaviour must be pinned here: if either half
// of that arrangement is ever reverted, only one of them has a test.

const TOOL_FULL = {
  name: "Ollama",
  purpose: "Run models locally without a hosted account",
  cost: "Free/open-source",
  url: "https://ollama.com/",
  task: "Pull a small model and run the same prompt ten times",
  freeAlternative: "A free hosted tier, checked for rate limits first",
};

{
  // The claim in this file's header, TESTED rather than asserted in prose: for a
  // hook-free component, calling it directly and serialising the result produces
  // the same markup as handing React the element and letting IT call the
  // component. If that ever stops being true -- a hook added to ToolCard, say --
  // every assertion below would be testing something the browser does not do, and
  // this is the check that catches it.
  const direct = renderToStaticMarkup(ToolCard({ tool: TOOL_FULL }));
  const viaReact = renderToStaticMarkup(createElement(ToolCard, { tool: TOOL_FULL }));
  check("calling ToolCard directly matches rendering it as a React element", direct, viaReact);

  // The same for ProgressBar, which PhaseCard delegates to.
  const directPb = renderToStaticMarkup(ProgressBar({ done: 3, total: 4 }));
  const viaReactPb = renderToStaticMarkup(createElement(ProgressBar, { done: 3, total: 4 }));
  check("calling ProgressBar directly matches rendering it as a React element", directPb, viaReactPb);
}

{
  const html = show(ToolCard, { tool: TOOL_FULL });
  const as = anchors(html);
  check("a tool with a real URL emits exactly one anchor", as.length, 1);
  check("...and its href is the tool's URL", hrefOf(as[0] || ""), "https://ollama.com/");
  assert(
    "...and the anchor opens in a new tab without leaking a referrer",
    as[0] && as[0].includes('target="_blank"') && as[0].includes('rel="noreferrer"'),
    as[0]
  );
  assert("...and the anchor is labelled for a reader", html.includes("Official site"), html.slice(0, 200));
  // The rest of the card must survive: a fix that removed the anchor by removing
  // the whole card would otherwise pass the assertions above.
  assert("...and the name, purpose, cost and task all render", html.includes("Ollama") &&
    html.includes("Run models locally") && html.includes("Free/open-source") && html.includes("Pull a small model"), html);
  assert("...and the free alternative renders", html.includes("Free alternative"), html);
}

{
  const html = show(ToolCard, { tool: { ...TOOL_FULL, url: "" } });
  check("a tool with url \"\" emits NO anchor", anchors(html).length, 0);
  // The rest of the card must survive. A "fix" that removed the anchor by
  // removing the whole card would otherwise pass the assertion above.
  assert(
    "...and the name, purpose, cost and task all still render",
    html.includes("Ollama") && html.includes("Run models locally") && html.includes("Free/open-source"),
    html.slice(0, 300)
  );
  assert("...and the link label is absent, not merely unlinked", !html.includes("Official site"), html.slice(0, 300));
}

{
  // THE ONE THAT SHIPPED, AND WHERE THE FIX ACTUALLY LIVES.
  //
  // 40 tool rows carried `url: "\u2014"` and ToolCard emitted `<a href="\u2014">` for
  // every one of them. ToolCard STILL DOES NOT GUARD AGAINST THIS: it has no URL
  // validation of any kind, and `tool.url &&` accepts any non-empty string. Given
  // `url: "\u2014"` directly it renders a live link to nowhere — asserted below,
  // because that is the truth and a test that claimed otherwise would be lying
  // about the component.
  //
  // The corpus is clean only because the fix was applied at the PARSE BOUNDARY:
  // PLACEHOLDER_CELL in scripts/build-content.mjs maps `\u2014`, `\u2013`, `-`, `n/a`,
  // `none`, `null` and `tbd` to "" before the JSON is written. That is a
  // defensible place to fix it, and it is why the shipped site has no dash links.
  //
  // The consequence is that the component is safe ONLY while every producer
  // remembers to normalise. A second producer, a hand-edited JSON file, or a
  // reverted parser would all put the dash back on the page, and the component
  // would render it as a link again. Both halves are therefore pinned here: the
  // parser's normalisation as a PASSING assertion, and the component's silence as
  // a REPORTED one.
  const emDashHtml = show(ToolCard, { tool: { ...TOOL_FULL, url: "\u2014" } });
  const emDashAnchors = anchors(emDashHtml);
  assert(
    "ToolCard given an em-dash url still emits a link (the component has no URL guard)",
    emDashAnchors.length === 1 && hrefOf(emDashAnchors[0]) === "\u2014",
    `rendered ${emDashAnchors.length} anchor(s): ${emDashAnchors.join(" ")}`
  );

  // ...and the guard that DOES exist, asserted where it lives. The parser is the
  // shipped protection, so the regex is read out of the build script and the dash
  // spellings the corpus uses are run against it. See parserBlank() above: it
  // recompiles the real pattern, and it is the single definition of the parser's
  // behaviour used by every assertion about placeholders in this file.
  const DASHES = ["\u2014", "\u2013", "-", "n/a", "N/A", "none", "null", "tbd", "TBD"];
  check("the parser blanks every placeholder spelling the corpus uses", DASHES.filter((d) => parserBlank(d) !== ""), []);
  check("...and the pattern was actually driven, not stubbed", DASHES.filter((d) => parserBlank(d) === "").length, DASHES.length);
  // The guard must not be a regex that matches everything. One that blanked real
  // URLs would satisfy every assertion above while destroying the corpus.
  const realUrls = ["https://ollama.com/", "http://localhost:3000", "https://github.com/foo/bar"];
  check("...and it does not blank a real URL", realUrls.filter((u) => parserBlank(u) !== u), []);
  // Whitespace, by contrast, IS blanked — by the trim rather than by the regex,
  // which is exactly the distinction this helper exists to keep straight.
  check("...and a whitespace-only cell blanks too", [" ", "   ", "\t"].filter((u) => parserBlank(u) !== ""), []);
}

{
  // The component's behaviour on the values the parser produces, and on the
  // shapes a half-migrated data file could produce.
  const bad = [];
  for (const url of [""]) {
    const html = show(ToolCard, { tool: { ...TOOL_FULL, url } });
    if (anchors(html).length !== 0) bad.push(`${JSON.stringify(url)} -> ${anchors(html).join(" ")}`);
  }
  check("a blanked url renders no anchor", bad, []);

  // A missing or non-string url must not throw. `{}` and `[]` are truthy and DO
  // render an anchor (recorded below); the falsy ones do not.
  const threw = [];
  for (const url of [undefined, null, 0, false, {}, []]) {
    try {
      show(ToolCard, { tool: { ...TOOL_FULL, url } });
    } catch (e) {
      threw.push(`${JSON.stringify(url)} -> threw ${(e && e.message) || e}`);
    }
  }
  check("no url value makes ToolCard throw", threw, []);
  check(
    "a falsy url renders no anchor",
    [undefined, null, 0, false].filter(
      (u) => anchors(show(ToolCard, { tool: { ...TOOL_FULL, url: u } })).length !== 0
    ),
    []
  );
  // A truthy non-string IS rendered as a link by the unguarded component: an
  // object serialises into the href as "[object Object]". Named so the shape of
  // the gap is on the record — `tool.url &&` tests truthiness, not stringness.
  const objHtml = show(ToolCard, { tool: { ...TOOL_FULL, url: {} } });
  assert(
    "a truthy non-string url becomes a link to \"[object Object]\"",
    anchors(objHtml).length === 1 && hrefOf(anchors(objHtml)[0]) === "[object Object]",
    anchors(objHtml).join(" ")
  );
}

{
  // Every real tool row in the corpus. A `javascript:` or `data:` URL authored
  // into a table cell would be emitted verbatim into an href, and this is the
  // only place that would notice.
  //
  // THE INVARIANT, AND THE ONE THAT WAS ALMOST TRUE. "An anchor's href is always
  // http(s)" is the property worth having, and it is not the property the
  // COMPONENT provides — ToolCard has no URL validation at all. It holds today
  // because the PARSER enforces it: PLACEHOLDER_CELL blanks the dash spellings,
  // and a later commit added a guard requiring the url column to actually contain
  // a URL. Two rows did once slip through as `url: "in this repository"` (a plain
  // English phrase, which PLACEHOLDER_CELL does not recognise), rendering
  // `<a href="in this repository">` — a RELATIVE link that 404s. That is the em
  // dash defect one layer further along: a placeholder the placeholder guard did
  // not know about.
  //
  // So the assertion checks what IS true and worth defending — the anchor count
  // matches the presence of a url, and no href uses an executable scheme — while
  // any non-http href is COUNTED AND NAMED in the output. Reporting rather than
  // failing is the right call here: the fix belongs in the parser, this file may
  // not edit components or libs, and a silent zero would hide the next one.
  const rows = readCorpusTools();
  const bad = [];
  const nonHttp = [];
  for (const { tool, where } of rows) {
    const html = show(ToolCard, { tool });
    const as = anchors(html);
    // A tool with no url gets no anchor; a tool with one gets exactly one.
    if (tool.url ? as.length !== 1 : as.length !== 0) {
      bad.push(`${where}: url ${JSON.stringify(tool.url)} produced ${as.length} anchor(s)`);
    }
    for (const tag of as) {
      const href = hrefOf(tag) || "";
      // Executable and embedded-document schemes. React blocks `javascript:` in
      // the browser with a warning, but nothing here rejects it, and the corpus is
      // hand-authored Markdown.
      if (/^\s*(javascript|data|vbscript|file):/i.test(href)) bad.push(`${where}: executable href ${JSON.stringify(href)}`);
      if (!/^https?:\/\//.test(href)) nonHttp.push(`${where}: href ${JSON.stringify(href)}`);
    }
  }
  check(`all ${rows.length} corpus tool row(s) render an anchor exactly when they have a url`, bad.slice(0, 10), []);
  check("no corpus tool emits an executable href", bad.filter((b) => b.includes("executable")), []);
  // The count is asserted, not just reported, so a regression that reintroduced
  // relative links FAILS rather than scrolling past in a log. Reported above it
  // with the offending rows named, because "2 of 433" is not actionable alone.
  check("every corpus href is an absolute http(s) URL", nonHttp.length, 0);
  if (nonHttp.length) {
    for (const n of nonHttp.slice(0, 10)) console.log(`  ${n}`);
    if (nonHttp.length > 10) console.log(`  ... and ${nonHttp.length - 10} more`);
  }
}

// ── B. PhaseCard: a component reading a missing field ────────────────────────
// This is the Tools-library shape. `tracks` in data/roadmaps.js is built from the
// LIGHT projection — generated/index.json — whose phases carry only the ids of
// their checklist/tasks/quiz, not the entries themselves and not `tools`,
// `resources` or any lesson prose. Asking a light phase for `tools` does not
// throw; it yields `undefined`, and a `|| []` around it turns that into an empty
// list that the page then reports as a fact.
//
// PhaseCard is the component every track page renders, and it reads three fields
// off a phase: `title`, `duration` and `goal`. All three ARE in the light
// projection, so the light fixture below must render in full. The second half is
// the valuable half: a phase MISSING one of those fields must degrade visibly.

const LIGHT_BLOCK = BUILD_SRC.match(/const indexFor = \(output\) => \(\{[\s\S]*?\n  \}\);/);
// Only the PHASE objects are read. The block also carries a track-level id,
// label, blurb and phaseCount, which are not phase fields and would otherwise be
// mistaken for the projection's phase shape.
const LIGHT_PHASE_BLOCK = LIGHT_BLOCK ? LIGHT_BLOCK[0].match(/phases:[\s\S]*/) : null;
const LIGHT_FIELDS = LIGHT_PHASE_BLOCK
  ? [...LIGHT_PHASE_BLOCK[0].matchAll(/^\s+([a-zA-Z]+):/gm)].map((m) => m[1])
  : [];

// The contract stated in the task this file was written for, restated as a
// literal so a change to either side is a failure rather than a silent pass.
const LIGHT_FIELDS_CONTRACT = [
  "id",
  "order",
  "phase",
  "title",
  "duration",
  "durationWeeks",
  "goal",
  "lessonWordCount",
  "checklistIds",
  "taskIds",
  "quizIds",
];

const LIGHT_PHASE = INDEX.tracks[0].phases[0];

{
  assert(
    "the light projection was actually parsed out of scripts/build-content.mjs",
    LIGHT_FIELDS.length === LIGHT_FIELDS_CONTRACT.length,
    `parsed: ${JSON.stringify(LIGHT_FIELDS)}`
  );
  check("the light phase projection carries exactly the contracted fields", LIGHT_FIELDS, LIGHT_FIELDS_CONTRACT);
  assert(
    "the light projection carries no `tools` field (the Tools-library defect)",
    !LIGHT_FIELDS.includes("tools"),
    `parsed: ${JSON.stringify(LIGHT_FIELDS)}`
  );
  assert(
    "...nor resources, quiz, tasks or checklist entries, only their ids",
    !["resources", "quiz", "tasks", "checklist", "freeVsPaid", "skills", "topics"].some((f) =>
      LIGHT_FIELDS.includes(f)
    ),
    `parsed: ${JSON.stringify(LIGHT_FIELDS)}`
  );
  // The corpus is the other half: the projection's own output must agree.
  check(
    "no phase in the generated light index carries a tools field",
    INDEX.tracks.flatMap((t) => (t.phases || []).filter((p) => "tools" in p).map((p) => p.id)).slice(0, 5),
    []
  );
  // The one that matters: the light phase's OWN key set must equal the contract.
  // A field the projection quietly started emitting, or stopped emitting, changes
  // what every card on the dashboard can read.
  const lightKeys = new Set();
  for (const t of INDEX.tracks || []) for (const p of t.phases || []) Object.keys(p).forEach((k) => lightKeys.add(k));
  check("the generated light index's phases carry exactly those keys", [...lightKeys].sort(), [...LIGHT_FIELDS_CONTRACT].sort());
}

{
  // The real light projection, rendered. This must NOT crash and must NOT render
  // empty: every field PhaseCard reads is genuinely present in the light shape.
  //
  // The equivalence check from the header, repeated here because PhaseCard is the
  // component this file renders most and it is the one that would break first if a
  // hook were ever added to it.
  check(
    "calling PhaseCard directly matches rendering it as a React element",
    renderToStaticMarkup(PhaseCard({ phase: LIGHT_PHASE, done: 3, total: 12, onOpen: () => {} })),
    renderToStaticMarkup(createElement(PhaseCard, { phase: LIGHT_PHASE, done: 3, total: 12, onOpen: () => {} }))
  );

  const html = show(PhaseCard, { phase: LIGHT_PHASE, done: 3, total: 12, onOpen: () => {} });
  assert("a light-projection phase renders without crashing", typeof html === "string" && html.length > 0);
  assert("...and renders the phase title", html.includes(LIGHT_PHASE.title), html.slice(0, 240));
  assert("...and renders the duration", html.includes(LIGHT_PHASE.duration), html.slice(0, 240));
  assert("...and renders the goal, inline-formatted", html.includes("mental model"), html.slice(0, 400));
  assert("...and renders the phase-card wrapper", html.includes('class="phase-card"'), html.slice(0, 200));
  assert("...and renders progress as text, not colour alone", /\d+\/\d+/.test(html), html);
}

{
  // EVERY phase in the light index, not just the first. A single phase with a
  // missing field would otherwise render a blank card on one track page and no
  // check would see it.
  const broken = [];
  let n = 0;
  for (const track of INDEX.tracks || []) {
    for (const p of track.phases || []) {
      n++;
      let html;
      try {
        html = show(PhaseCard, { phase: p, done: 0, total: 0, onOpen: () => {} });
      } catch (e) {
        broken.push(`${p.id}: threw ${(e && e.message) || e}`);
        continue;
      }
      for (const field of ["title", "duration", "goal"]) {
        if (!html.includes(esc(p[field]))) broken.push(`${p.id}: ${field} did not reach the output`);
      }
    }
  }
  check(`all ${n} light-projection phase(s) render their title, duration and goal`, broken.slice(0, 8), []);
}

// ── B2. The valuable half: a MISSING field must degrade VISIBLY ──────────────
// `undefined` in JSX renders as NOTHING AT ALL. No error, no placeholder, no
// console warning, no failed build. A card whose `title` went missing rendered as
// a heading with no text; a card whose `goal` went missing rendered as an empty
// paragraph; and the page looked like a styling problem rather than a data one.
//
// That silence is the actual defect class behind all three shipped bugs: the Tools
// library did not crash, it reported "0 tools across 10 written tracks" and looked
// entirely healthy. A missing value that renders as a plausible one is worse than
// a crash, because a crash gets fixed.
//
// PHASECARD HAS SINCE BEEN FIXED FOR THE TITLE, and the assertions below pin the
// FIX rather than the defect. `orPlaceholder()` falls back to `(title missing)`,
// so the card is visibly wrong instead of looking-fine-and-being-wrong, and the
// button's accessible name is no longer empty.
//
// THE GOAL AND THE DURATION ARE STILL UNGUARDED and still render empty elements.
// That half is asserted as current behaviour so it stays recorded rather than
// being quietly dropped once the title was handled.

{
  const bare = { ...LIGHT_PHASE, title: undefined };
  const html = show(PhaseCard, { phase: bare, done: 0, total: 0, onOpen: () => {} });
  const heading = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
  check("a missing title renders a VISIBLE marker, not an empty heading", heading ? heading[1] : null, "(title missing)");
  // The load-bearing word is "visible", and it has to be tested on the TEXT a
  // reader sees rather than on the markup: the class name `phase-card__title` is
  // in the HTML either way, so a naive substring test for "title" would pass
  // whatever the component did. Tags are stripped first.
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  assert(
    "...and the marker reaches the reader's own text",
    text.includes("(title missing)"),
    `visible text: ${JSON.stringify(text.slice(0, 160))}`
  );
  // The accessible name was the other half of the fix: with an empty h3 the button
  // announced as just "1 week" to a screen reader.
  assert(
    "...and the button's accessible name is not empty",
    html.includes('aria-label="(title missing)"'),
    html.slice(0, 200)
  );
  // A whitespace-only title renders a blank heading and is just as broken as
  // `undefined`, so it takes the same path.
  const blank = show(PhaseCard, { phase: { ...LIGHT_PHASE, title: "   " }, done: 0, total: 0, onOpen: () => {} });
  assert("...and a whitespace-only title is treated as missing", blank.includes("(title missing)"), blank.slice(0, 200));
  // The guard must not fire on a healthy card -- a fallback that always rendered
  // would be its own defect.
  const good = show(PhaseCard, { phase: LIGHT_PHASE, done: 0, total: 0, onOpen: () => {} });
  assert(
    "...and a real title renders unchanged, with no marker anywhere",
    good.includes(LIGHT_PHASE.title) && !good.includes("missing"),
    good.slice(0, 240)
  );
}

{
  // FORMERLY A DEFECT RECORD, NOW A REGRESSION GUARD.
  //
  // This block originally asserted that `phase.goal` and `phase.duration` had NO
  // placeholder guard — a missing one rendered an EMPTY element, a visible gap on
  // the card with nothing saying anything was wrong, which is the same defect the
  // title had. That finding was correct and it has since been fixed, so these
  // assertions now pin the FIXED behaviour rather than recording the old one.
  //
  // The distinction matters: an assertion written against broken behaviour starts
  // failing the moment someone repairs it, which trains the next reader to treat a
  // red test as noise. A regression guard fails only if the fix is undone.
  const bare = { ...LIGHT_PHASE, goal: undefined };
  const html = show(PhaseCard, { phase: bare, done: 0, total: 0, onOpen: () => {} });
  const para = html.match(/<p class="phase-card__goal muted">([\s\S]*?)<\/p>/);
  check("a missing goal now says so, rather than rendering empty", para ? para[1] : null, "(goal missing)");
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  assert(
    "...so the gap is visible instead of reading as a styled blank",
    /missing/i.test(text) && !/undefined|null|NaN/i.test(text),
    `visible text: ${JSON.stringify(text.slice(0, 140))}`
  );

  const noDur = show(PhaseCard, {
    phase: { ...LIGHT_PHASE, duration: undefined },
    done: 0,
    total: 0,
    onOpen: () => {},
  });
  const span = noDur.match(/<span class="muted phase-card__duration">([\s\S]*?)<\/span>/);
  check("a missing duration says so too", span ? span[1] : null, "(duration missing)");
}

{
  // A phase object missing the field ENTIRELY, rather than carrying it as
  // undefined, must behave the same way — that is the shape the light projection
  // produces for `tools`, and the shape a stale generated file produces for a
  // newly-added field.
  const absent = { id: LIGHT_PHASE.id, order: LIGHT_PHASE.order, phase: LIGHT_PHASE.phase };
  let html;
  let threw = null;
  try {
    html = show(PhaseCard, { phase: absent, done: 0, total: 0, onOpen: () => {} });
  } catch (e) {
    threw = (e && e.message) || String(e);
  }
  check("a phase carrying none of the rendered fields does not throw", threw, null);
  assert(
    "...and still renders the card chrome around the gaps",
    typeof html === "string" && html.includes('class="phase-card"'),
    String(html).slice(0, 200)
  );
}

{
  // The degradation through the ProgressBar, which PhaseCard delegates to.
  //
  // THIS WAS A DEFECT AND IS NOW A GUARD, which is why the assertions read the way
  // they do. The original code interpolated `done` and `total` RAW into the visible
  // label and the aria-label, while `pct` was already guarded. So a caller that
  // omitted `total` rendered a dangling "0/ · 0%" -- a fraction with no
  // denominator -- and announced "0 of undefined tasks complete" to a screen
  // reader, while the bar itself drew a perfectly plausible 0%. A missing `done`
  // was worse: "NaN%" in the label and an invalid `aria-valuenow="NaN"`.
  //
  // That combination is the worst kind -- it looks like a working component
  // showing a real zero, which is the same shape as the Tools library reporting
  // "0 tools" with 433 rows in the corpus. ProgressBar now coerces both through a
  // `num()` helper. These assertions pin the FIXED behaviour, so a regression to
  // raw interpolation fails here rather than on a reader's screen.
  const missingTotal = show(PhaseCard, { phase: LIGHT_PHASE, done: 0, total: undefined, onOpen: () => {} });
  assert(
    "a missing total renders 0/0, not a dangling fraction or the word undefined",
    missingTotal.includes('<span class="progress__label">0/0 \u00b7 0%</span>'),
    missingTotal
  );
  assert(
    "...and its accessible name states a real denominator",
    missingTotal.includes('aria-label="0 of 0 tasks complete"') && !/undefined|NaN/.test(missingTotal),
    missingTotal
  );

  const missingDone = show(PhaseCard, { phase: LIGHT_PHASE, done: undefined, total: 8, onOpen: () => {} });
  assert(
    "a missing done count renders 0/8, not NaN",
    missingDone.includes('<span class="progress__label">0/8 \u00b7 0%</span>') && !missingDone.includes("NaN"),
    missingDone
  );
  assert(
    "...and aria-valuenow stays a valid ARIA number",
    missingDone.includes('aria-valuenow="0"') && !missingDone.includes('aria-valuenow="NaN"'),
    missingDone
  );
  // Both directions of a non-numeric value, through the component directly, since
  // this is the helper the fix introduced and half its job is the strings a
  // half-parsed JSON file produces.
  const bad = [];
  for (const [done, total, label] of [
    ["3", "12", "3/12 \u00b7 25%"],
    ["abc", 8, "0/8 \u00b7 0%"],
    [null, null, "0/0 \u00b7 0%"],
    [NaN, 4, "0/4 \u00b7 0%"],
    [Infinity, 4, "0/4 \u00b7 0%"],
    [-2, 4, "-2/4 \u00b7 -50%"],
  ]) {
    const html = renderToStaticMarkup(ProgressBar({ done, total }));
    if (!html.includes(`>${label}</span>`)) bad.push(`${JSON.stringify([done, total])} -> expected ${JSON.stringify(label)}`);
    if (/NaN|undefined/.test(html)) bad.push(`${JSON.stringify([done, total])} -> rendered NaN or undefined`);
  }
  check("a non-numeric count never reaches the label as NaN or undefined", bad, []);

  // A genuinely real proportion must still be right -- the fix must not have
  // flattened every value to zero.
  const real = renderToStaticMarkup(ProgressBar({ done: 3, total: 12 }));
  assert("...and a real proportion still computes correctly", real.includes("3/12 \u00b7 25%"), real);
}

{
  // `onOpen` must be called with the phase ID, and only when the card is clicked.
  // The id is what routes the reader to a phase, so a card that passed the ORDER
  // or the title instead would open the wrong page — or nothing.
  //
  // The handler is not serialised into markup, so it is driven directly: the
  // component's own `onClick` is called with a spy, which tests the real closure
  // the browser would invoke rather than a reimplementation of it.
  const html = show(PhaseCard, { phase: LIGHT_PHASE, done: 0, total: 1, onOpen: () => {} });
  assert("the card is a button, since clicking it opens the phase", html.startsWith("<button"), html.slice(0, 80));
  assert("...and its type is explicit, so it cannot submit a surrounding form", html.includes('type="button"'), html.slice(0, 80));

  const opened = [];
  const el = PhaseCard({ phase: LIGHT_PHASE, done: 0, total: 1, onOpen: (id) => opened.push(id) });
  el.props.onClick();
  check("clicking the card reports the phase ID, not its order or its title", opened, [LIGHT_PHASE.id]);
  assert(
    "...and the id it reports is the one that routes, not the numeric `order`",
    opened[0] === LIGHT_PHASE.id && opened[0] !== LIGHT_PHASE.order,
    `reported ${JSON.stringify(opened[0])}, id is ${JSON.stringify(LIGHT_PHASE.id)}, order is ${JSON.stringify(LIGHT_PHASE.order)}`
  );
}

// ── C. Quiz: the correct option and its **Why:** line ────────────────────────
// The failure this protects against is recorded in the components: an earlier
// reading of the quiz data assumed options were OBJECTS carrying their own
// `correct` flag, when the generated corpus emits options as plain STRINGS with
// the right one named by `answerIndex`. That mismatch produced an all-zero
// histogram across 549 questions — every answer recorded against an option that
// did not exist — and nothing in the suite noticed, because the two shapes are
// both valid JSON.
//
// Quiz.jsx cannot be rendered through react-dom/server here without a DOM: it
// calls `useQuizAnswers`, which reads `window.localStorage`, and the alternative
// would be a stubbed hook — an assertion about the stub. It DOES export the pure
// normalisation it delegates to, so that is driven directly, and the exported
// `summarise` from lib/quiz.js is driven on the normalised output. Together those
// are the whole of "which option is right, and what does the why-line say".

const QUIZ_SRC = readFileSync(join(COMPONENTS, "Quiz.jsx"), "utf8");
const QUIZ_FNS = compile(join(COMPONENTS, "Quiz.jsx"))
  .replace(/^import\s*\{[^}]*\}\s*from\s*"react\/jsx-runtime";?$/m, "")
  .replace(/^import\s*\{[^}]*\}\s*from\s*"react";?$/m, "")
  .replace(/^import\s*\{[^}]*\}\s*from\s*"[^"]*renderInline\.jsx";?$/m, "")
  .replace(/^import\s*\{[^}]*\}\s*from\s*"[^"]*quiz\.js";?$/m, "")
  .replace(/^import\s*\{[^}]*\}\s*from\s*"[^"]*useQuizAnswers\.js";?$/m, "")
  .replace(/\bjsxs?\b|\bFragment\b/g, (m) => `__rq.${m}`)
  // The normalisation functions reference no imports, so the rest of the module
  // can be reduced to them. Everything below `export default function Quiz` is
  // JSX that needs the runtime names this flat module does not provide.
  .replace(/export default function Quiz[\s\S]*$/, "export { normaliseQuestion };\n");

const { normaliseQuestion } = await import(
  "data:text/javascript;base64," +
    Buffer.from(
      `import * as __rq from ${JSON.stringify(RUNTIME)};\n` +
        QUIZ_FNS.replace(/^import[^\n]*\n/gm, ""),
      "utf8"
    ).toString("base64")
);

assert(
  "Quiz.jsx exports normaliseQuestion for exactly this purpose",
  typeof normaliseQuestion === "function",
  `got ${typeof normaliseQuestion}`
);

const { correctIndex, summarise } = await import("../src/lib/quiz.js");

{
  // THE SHAPE. Read from the corpus, because getting this wrong is the mistake
  // that produced the zero histogram: options are strings, and `answerIndex`
  // names the right one. If a future pipeline emitted objects with a `correct`
  // flag, this assertion fires and every fixture below has to be revisited.
  const trackFiles = readdirSync(GEN).filter(
    (f) => f.endsWith(".json") && !["index.json", "search.json", "shared.json", "tracks.json"].includes(f)
  );
  const shapes = new Set();
  const offContract = [];
  let questions = 0;
  for (const file of trackFiles) {
    const data = JSON.parse(readFileSync(join(GEN, file), "utf8"));
    for (const phase of data.phases || []) {
      for (const q of phase.quiz || []) {
        questions++;
        shapes.add(Array.isArray(q.options) ? typeof q.options[0] : "not-an-array");
        if (!Array.isArray(q.options) || typeof q.options[0] !== "string") {
          offContract.push(`${q.id}: options[0] is ${typeof (q.options || [])[0]}`);
        }
        if (typeof q.answerIndex !== "number") offContract.push(`${q.id}: answerIndex is ${typeof q.answerIndex}`);
      }
    }
  }
  check("quiz options in the corpus are STRINGS, not { text, correct } objects", [...shapes], ["string"]);
  check("every corpus question carries a numeric answerIndex", offContract.slice(0, 5), []);
  console.log(`\ncorpus: ${questions} quiz question(s), options are strings + answerIndex`);
}

{
  // The real shape, through the real normalisation.
  const raw = {
    id: "found-01-q01",
    question: "Which one?",
    energy: "normal",
    options: ["The first", "The second", "The third", "The fourth"],
    answerIndex: 1,
    why: "The second is right because the mechanism described only holds there.",
  };
  const opts = normaliseQuestion(raw);
  check(
    "normaliseQuestion flags exactly the answerIndex option",
    opts.map((o) => o.correct),
    [false, true, false, false]
  );
  check("normaliseQuestion carries the option text through", opts.map((o) => o.text), raw.options);
  check("normaliseQuestion hangs the why-line off the array", opts.explanation, raw.why);
  check("the normalised options are readable by correctIndex", correctIndex({ options: opts }), 1);
}

{
  // A question whose option TEXT claims to be correct must not be believed. The
  // `correct` flag is derived from the index and from nothing else.
  const opts = normaliseQuestion({
    options: ["This is definitely the correct answer", "the real one", "also correct", "correct"],
    answerIndex: 3,
  });
  check(
    "option text containing the word 'correct' does not win",
    opts.map((o) => o.correct),
    [false, false, false, true]
  );
}

{
  // The object shape the component ALSO accepts, because older lesson JSON still
  // carries it. Both pipelines must agree on which option is right.
  const opts = normaliseQuestion({
    options: [
      { text: "a", correct: false },
      { text: "b", correct: true },
      { text: "c", correct: false },
      { text: "d", correct: false },
    ],
    explanation: "because b",
  });
  check("the object shape normalises to flag the right option", opts.map((o) => o.correct), [false, true, false, false]);
  check("the object shape keeps its labels", opts.map((o) => o.text), ["a", "b", "c", "d"]);
  check("the older `explanation` field is read when `why` is absent", opts.explanation, "because b");

  // Both markers present: the flag wins, so a question cannot be read the wrong
  // way round. Asserted because the precedence is a deliberate decision in the
  // component and reversing it would silently flip an answer.
  const both = normaliseQuestion({
    options: [
      { text: "a", correct: false },
      { text: "b", correct: true },
      { text: "c", correct: false },
    ],
    answerIndex: 2,
  });
  check("the correct flag wins over a disagreeing answerIndex", correctIndex({ options: both }), 1);
}

{
  // A malformed question must mark NOTHING correct rather than the wrong thing.
  // The reader is then told what the answer was not, instead of being taught a
  // distractor — and lib/quiz.js returns -1 for exactly the same reason.
  const cases = [
    ["no answerIndex", { options: ["a", "b", "c", "d"] }],
    ["answerIndex null", { options: ["a", "b", "c", "d"], answerIndex: null }],
    ["answerIndex a string", { options: ["a", "b", "c", "d"], answerIndex: "1" }],
    ["answerIndex out of range", { options: ["a", "b", "c", "d"], answerIndex: 9 }],
    ["answerIndex negative", { options: ["a", "b", "c", "d"], answerIndex: -1 }],
    ["no options at all", { answerIndex: 0 }],
  ];
  const bad = [];
  for (const [name, raw] of cases) {
    const opts = normaliseQuestion(raw);
    if (opts.some((o) => o.correct)) bad.push(`${name}: marked an option correct`);
    if (correctIndex({ options: opts }) !== -1) bad.push(`${name}: correctIndex is not -1`);
    if (typeof opts.explanation !== "string") bad.push(`${name}: explanation is not a string`);
  }
  check("a malformed question marks nothing correct and stays renderable", bad, []);

  // A non-string, non-object option is kept as text, not dropped: dropping it
  // would renumber every option after it and shift the answer.
  const mixed = normaliseQuestion({ options: ["a", 42, { text: "c" }, null], answerIndex: 2 });
  check("a malformed option keeps its position", mixed.length, 4);
  check("...and the answer still lands on the intended index", mixed.map((o) => o.correct), [false, false, true, false]);
}

{
  // The summary the reader sees at the foot of the quiz, driven on normalised
  // questions — so this is the real path, not a reimplementation of it.
  const prepared = [
    { id: "a", options: normaliseQuestion({ options: ["1", "2", "3", "4"], answerIndex: 0 }) },
    { id: "b", options: normaliseQuestion({ options: ["1", "2", "3", "4"], answerIndex: 1 }) },
  ];
  check("the ordinary correct-answer summary", summarise(prepared, { a: 0, b: 1 }), {
    kind: "perfect",
    text: "Every answer correct \u2014 you can hold this material in conversation.",
  });
  check("a wrong answer names the question by its 1-based position", summarise(prepared, { a: 0, b: 0 }).numbers, [2]);
  check("thankfully no score is ever computed", "text" in summarise(prepared, { a: 0, b: 0 }), true);
  assert(
    "the summary never reports a percentage or a mark",
    !/%|\d+\s*\/\s*\d+|score/i.test(summarise(prepared, { a: 0, b: 0 }).text),
    summarise(prepared, { a: 0, b: 0 }).text
  );
}

{
  // The **Why:** line, on a real phase's real quiz. The component renders it from
  // `q.options.explanation`, which normalisation attaches; if that attachment
  // were dropped the why-line would vanish from every question on the site while
  // every JSON check stayed green — the same shape of silent loss as the tool
  // link and the tools library.
  const trackFiles = readdirSync(GEN).filter(
    (f) => f.endsWith(".json") && !["index.json", "search.json", "shared.json", "tracks.json"].includes(f)
  );
  const lost = [];
  let questions = 0;
  for (const file of trackFiles) {
    const data = JSON.parse(readFileSync(join(GEN, file), "utf8"));
    for (const phase of data.phases || []) {
      for (const q of phase.quiz || []) {
        questions++;
        const opts = normaliseQuestion(q);
        if (!opts.explanation) lost.push(`${q.id}: no explanation survives normalisation`);
        if (opts.explanation !== q.why) lost.push(`${q.id}: explanation is not the authored why-line`);
        if (correctIndex({ options: opts }) !== q.answerIndex) {
          lost.push(`${q.id}: normalises to answer ${correctIndex({ options: opts })}, source says ${q.answerIndex}`);
        }
      }
    }
  }
  check(`all ${questions} corpus question(s) keep their answer and their why-line`, lost.slice(0, 8), []);
}

// ── D. Other defect shapes found while reading the components ────────────────
// Three more, all of which can render something wrong today. None is fixed here:
// this file asserts the CURRENT behaviour so that a change to it is deliberate,
// and the accompanying report names all three.

{
  // D1. A light phase fed to PhaseCard renders correctly; a light phase fed to
  // anything that reads `tools` renders a confident ZERO. PhaseCard does not read
  // `tools`, so the defect cannot show up in the card — which is why the guard
  // belongs on the DATA, not on the component. Asserted here as the invariant the
  // Tools library depends on: a light phase is missing fields, and once `|| []`
  // has run, "the field is absent" and "the field is empty" are the same value.
  const light = LIGHT_PHASE;
  check("a light phase has no tools field to iterate", light.tools, undefined);
  check("...and `|| []` turns that into a confident zero", (light.tools || []).length, 0);
  assert(
    "...so an empty tools library and an unread field are indistinguishable at render time",
    (light.tools || []).length === (light.noSuchField || []).length,
    "the defect class behind '0 tools across 10 written tracks'"
  );
  // The consequences, stated as what a reader would have seen. These are the
  // numbers the bug produced, reconstructed from the current data so the scale is
  // on the record: 433 rows across the full projection, 0 across the light one.
  const fullTools = readCorpusTools().length;
  check("the full projection holds 433 tool rows that the light one cannot reach", fullTools, 433);
  assert(
    "...and 0 of them are reachable from a light phase, which is what rendered as a fact",
    (light.tools || []).length === 0 && fullTools > 0,
    `${fullTools} rows exist, 0 are visible through the light projection`
  );
}

{
  // D2. renderInline passes non-strings straight through, and JSX renders
  // `undefined` as nothing. So a tool whose NAME is missing renders a card with a
  // blank heading and a valid-looking cost badge, rather than an error. Asserted
  // so the silent-empty behaviour is on the record.
  const html = show(ToolCard, { tool: { ...TOOL_FULL, name: undefined, purpose: undefined, task: undefined } });
  assert("a tool missing its name renders without throwing", typeof html === "string");
  const heading = html.match(/<span class="tool-card__name">([\s\S]*?)<\/span>/);
  check("...and its name span is EMPTY, with nothing saying it is missing", heading ? heading[1] : null, "");
  assert(
    "...while the cost badge still renders as if the row were complete",
    html.includes("Free/open-source"),
    html.slice(0, 240)
  );
  // The visible text is what matters, and it says nothing about the gap.
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  assert(
    "...and no visible text mentions the missing field",
    !/missing|undefined|null/i.test(text),
    `visible text: ${JSON.stringify(text.slice(0, 140))}`
  );
}

{
  // D3. `tool.url` is injected into an href VERBATIM. The parser now requires the
  // url column to contain a URL, so the corpus is clean, but ToolCard itself
  // still performs no validation: whatever string is in `tool.url` becomes the
  // href. React 18 emits a console warning for a `javascript:` URL and (per that
  // warning) a future version will block it outright — so the protection here is
  // a library deprecation, not a decision this codebase made.
  //
  // Recorded rather than fixed: the parser is the right place to reject a scheme,
  // and this file may not edit components or libs.
  const html = show(ToolCard, { tool: { ...TOOL_FULL, url: "javascript:alert(1)" } });
  const href = hrefOf(anchors(html)[0] || "");
  assert(
    "a javascript: url is passed through to href with no validation",
    href === "javascript:alert(1)",
    `href rendered as ${JSON.stringify(href)} — recording the behaviour, not endorsing it`
  );
  // The cheap fix, asserted as the property the component OUGHT to have, so a
  // future change can be checked against it without this file editing anything.
  const schemes = ["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "vbscript:x", "file:///etc/passwd"];
  const executable = schemes.filter((u) => {
    const h = hrefOf(anchors(show(ToolCard, { tool: { ...TOOL_FULL, url: u } }))[0] || "") || "";
    return /^\s*(javascript|data|vbscript|file):/i.test(h);
  });
  check("every executable scheme reaches the href unchecked", executable.length, schemes.length);
}

// ── The generated data these assertions read is current ──────────────────────
// Everything above reads src/data/generated/, which is a BUILD ARTIFACT and is
// gitignored. Auditing a stale corpus would be auditing a curriculum that no
// longer exists, and the build script can answer that itself without writing.
{
  const r = spawnSync("node", [join(SITE, "..", "scripts", "build-content.mjs"), "--check"], {
    cwd: SITE,
    encoding: "utf8",
    shell: false,
  });
  assert(
    "the generated JSON these assertions render matches its Markdown sources",
    r.status === 0,
    `build-content --check exited ${r.status}\n     ${String(r.stdout || "").slice(-400)}`
  );
}

// ── STATED GAP: what this file does NOT reach ────────────────────────────────
// Written down so the coverage claim is not overstated. All three items need a
// DOM, which needs a dependency this project does not have.
//
//   1. `Quiz`'s own element tree. The option buttons, the `quiz__opt--correct`
//      class, the "Correct" / "Your answer" badges and the summary paragraph are
//      rendered by the component and are NOT asserted here. What IS asserted is
//      everything they are computed FROM: normaliseQuestion decides the correct
//      index, and lib/quiz.js's summarise decides the wording. A defect in the
//      JSX that maps those onto class names would not be caught.
//
//   2. The click handlers. `choose(q.id, oi)` is never called, so the wiring from
//      a click to a stored answer is untested. `verify-quiz-correctness.mjs`
//      covers it in a real browser, which is where it belongs.
//
//   3. The visual result. "Renders the right markup" is not "looks right": a
//      correct class name bound to a rule that sets the wrong colour, or a card
//      whose content is right but laid out unreadably, is invisible to every
//      assertion here. audit-css.mjs proves the wiring; only a screenshot catches
//      the rest, and `shots/` is where those live.
//
// The cheapest way to close the first two is `npm run test:browser`, which already
// exists for this reason.

// ── Report ───────────────────────────────────────────────────────────────────

// The temp directory is removed here rather than in a `finally` so it is gone
// before the exit, and ALSO on the failure path -- a suite that returned early
// would otherwise leave a vbcomponents-* directory behind on every run. Node's
// own exit hook covers the case where a throw escapes above this point, which is
// what an earlier version of this file leaked nine of them from.
process.on("exit", () => {
  try {
    rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // Nothing useful to do at exit; a stale temp directory is harmless and the OS
    // clears it. Swallowing keeps a cleanup failure from masking the real one.
  }
});
rmSync(tempDir, { recursive: true, force: true });

console.log(`\n${pass} assertion(s) passed, ${failures.length} failed`);
if (failures.length) {
  console.log("");
  for (const f of failures) console.log("FAIL  " + f);
  process.exit(1);
}
console.log("\n\u2713 the components render the right thing, and degrade visibly when they cannot");

/**
 * Every tool row in the corpus, with the phase it came from, for the sweep above.
 *
 * Read here rather than at the top so the file's own ordering reads as the story
 * of the three defects: the fixtures first, then the corpus that produced them.
 */
function readCorpusTools() {
  const trackFiles = readdirSync(GEN).filter(
    (f) => f.endsWith(".json") && !["index.json", "search.json", "shared.json", "tracks.json"].includes(f)
  );
  const out = [];
  for (const file of trackFiles) {
    const data = JSON.parse(readFileSync(join(GEN, file), "utf8"));
    for (const phase of data.phases || []) {
      for (const tool of phase.tools || []) out.push({ tool, where: `${phase.id}/${tool.name}` });
    }
  }
  return out;
}
