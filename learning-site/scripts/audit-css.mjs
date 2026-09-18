// CSS integrity: every class a component references must have a rule, and every
// token a rule consumes must be defined.
//
// WHY THIS EXISTS
// ---------------
// The site shipped with a 3634-line global.css that was missing EVERY top-level
// layout class the app uses -- .main, .topbar, .skip, .phasegrid, .statgrid,
// .toolgrid, .breadcrumb and about thirty more. The result was a page that
// rendered completely unstyled: the top navigation collapsed into a raw row,
// cards stacked full-width with no grid, and a stat block drew as a vertical
// list instead of columns.
//
// Nothing caught it. Every existing check reads CONTENT -- the build guards read
// Markdown and generated JSON, check-browser.mjs asserts that expected text
// appears in the DOM, and the shape audit inspects JSON fields. A class name that
// no stylesheet defines changes no text and breaks no field, so the entire
// suite stayed green while the page looked broken. It was found only by
// screenshotting the app and looking at it.
//
// A stylesheet is a contract between JSX and CSS, and nothing was checking it.
// This does.
//
// WHAT IT DOES NOT DO
// -------------------
// It cannot judge whether the CSS is GOOD. It only proves the wiring exists:
// no class is referenced without a rule, and no custom property is consumed
// without being defined. Taste still needs eyes.
//
// Deliberate allowances:
//   - utility classes that are set at runtime (is-*, has-*, js-*) are skipped,
//     since a ternary can build a name this cannot see
//   - `class` strings inside test fixtures are not scanned
// Anything skipped is REPORTED, so the allowlist cannot quietly grow.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..");
const SRC = join(SITE, "src");

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

const files = walk(SRC);
const jsFiles = files.filter((f) => f.endsWith(".jsx") || f.endsWith(".js"));
const cssFiles = files.filter((f) => f.endsWith(".css"));

if (cssFiles.length === 0) {
  console.error("\u2716 no stylesheets found under src/ \u2014 the check cannot run");
  process.exit(1);
}

const cssText = cssFiles.map((f) => readFileSync(f, "utf8")).join("\n");

// ---------------------------------------------------------------------------
// Collect class names referenced from JSX.
//
// Four forms appear in this codebase and all four are real, so all four are
// handled rather than the convenient one:
//   className="a b"
//   className={"a b"}
//   className={`a ${cond ? "b" : ""}`}
//   className={"base" + (on ? " is-on" : "")}
// ---------------------------------------------------------------------------
const referenced = new Map(); // class -> Set(files)
const skipped = new Set();

const note = (cls, file) => {
  if (!cls) return;
  // A class must start with a lowercase letter and contain only name chars.
  // This drops template fragments, numbers and interpolations.
  if (!/^[a-z][a-zA-Z0-9_-]*$/.test(cls)) return;
  // Runtime state classes are composed by ternaries; a static scan cannot prove
  // they are unused, so flagging them would be a false positive.
  if (/^(is|has|js)-/.test(cls)) { skipped.add(cls); return; }
  if (!referenced.has(cls)) referenced.set(cls, new Set());
  referenced.get(cls).add(relative(SITE, file));
};

for (const file of jsFiles) {
  const text = readFileSync(file, "utf8");

  for (const m of text.matchAll(/className="([^"]*)"/g)) {
    m[1].split(/\s+/).forEach((c) => note(c, file));
  }
  for (const m of text.matchAll(/className=\{"([^"]*)"\}/g)) {
    m[1].split(/\s+/).forEach((c) => note(c, file));
  }
  // Template literal: keep the literal segments, drop ${...} expressions.
  for (const m of text.matchAll(/className=\{`([^`]*)`\}/g)) {
    m[1].replace(/\$\{[^}]*\}/g, " ").split(/\s+/).forEach((c) => note(c, file));
  }
  // String concatenation: pull the quoted literals out of the expression.
  for (const m of text.matchAll(/className=\{([^}]*\+[^}]*)\}/g)) {
    for (const q of m[1].matchAll(/"([^"]*)"/g)) {
      q[1].split(/\s+/).forEach((c) => note(c, file));
    }
  }
}

// ---------------------------------------------------------------------------
// Check 1: referenced class has a rule.
//
// Contains-check on ".name" rather than a parsed selector match, because a class
// may legitimately appear in a compound selector (.a.b), a :not(), or a media
// query, and all of those mean "there is a rule". The failure this guards against
// is a class with NO occurrence at all.
// ---------------------------------------------------------------------------
const missing = [...referenced.entries()]
  .filter(([cls]) => !cssText.includes("." + cls))
  .sort((a, b) => b[1].size - a[1].size);

// ---------------------------------------------------------------------------
// Check 2: custom property consumed but never defined.
//
// var(--x, fallback) is NOT a failure -- a fallback is a deliberate default. Only
// a bare var(--x) with no definition anywhere is broken, because it resolves to
// nothing and the declaration is dropped silently by the browser.
// ---------------------------------------------------------------------------
const defined = new Set([...cssText.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
const consumed = new Map();
for (const m of cssText.matchAll(/var\(\s*(--[a-z0-9-]+)\s*([,)])/g)) {
  const [, name, next] = m;
  if (next === ",") continue; // has a fallback
  consumed.set(name, (consumed.get(name) || 0) + 1);
}
const undefinedTokens = [...consumed.entries()]
  .filter(([name]) => !defined.has(name))
  .sort((a, b) => b[1] - a[1]);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(`  js modules        ${jsFiles.length}`);
console.log(`  stylesheets       ${cssFiles.length} (${cssText.length} chars)`);
console.log(`  classes used      ${referenced.size}`);
console.log(`  runtime classes   ${skipped.size} skipped (is-*, has-*, js-*)`);
console.log(`  tokens defined    ${defined.size}`);

let failed = 0;

if (missing.length) {
  failed++;
  console.log(`\n\u2716 ${missing.length} class(es) referenced in JSX with NO css rule:\n`);
  for (const [cls, where] of missing) {
    console.log(`    .${cls}`);
    console.log(`        used in: ${[...where].join(", ")}`);
  }
  console.log(
    "\n  A class with no rule renders as an unstyled element. If it is only a\n" +
    "  semantic hook, remove it from the JSX instead of leaving it dangling."
  );
} else {
  console.log("\n\u2713 every referenced class has a rule");
}

if (undefinedTokens.length) {
  failed++;
  console.log(`\n\u2716 ${undefinedTokens.length} custom propert(ies) used without a definition or fallback:\n`);
  for (const [name, n] of undefinedTokens) console.log(`    ${name}  (${n} use${n === 1 ? "" : "s"})`);
  console.log("\n  A bare var(--x) with no definition resolves to nothing and the browser\n  drops the declaration silently.");
} else {
  console.log("\u2713 every consumed token is defined");
}

if (skipped.size) {
  console.log(`\n  runtime-composed classes not checked: ${[...skipped].sort().join(", ")}`);
}

if (failed) {
  console.log(`\n\u2716 css integrity failed \u2014 ${failed} problem class(es)\n`);
  process.exit(1);
}
console.log("\n\u2713 css integrity passed\n");
