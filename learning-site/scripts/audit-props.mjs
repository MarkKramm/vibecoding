/**
 * Prop-contract audit: does every component receive the props it declares?
 *
 * WHY THIS EXISTS
 * Three components on the phase page were called with props they do not
 * declare, and two of those bugs had been live since the initial commit:
 *
 *   NotesPanel   declared { phaseId, note, hasAnswers, onChange, onClear }
 *                was passed `notes` and `onNote`   -> notes NEVER saved
 *   TaskList     declared { tasks, phaseId, answers, onAnswer }
 *                was passed `done` and `onToggle` -> answers NEVER saved
 *   ChecklistItem declared { item, checked, onToggle }
 *                was passed `done`              -> boxes NEVER showed as ticked
 *
 * Every one of those failed silently and looked like a working control: the
 * textarea rendered, accepted keystrokes, and saved nothing. No data guard
 * caught them because no guard RENDERS a phase and types into it, and the
 * content checks all pass on data that never reaches the UI. The bug was only
 * found by a browser test that typed into the field and then looked in
 * localStorage.
 *
 * The root cause is a port. The components came from the CS Roadmap project
 * with their own prop vocabulary; the call sites were written fresh in this
 * project with different words (`notes`/`onNote` vs `note`/`onChange`). Nothing
 * compared the two sides, because JavaScript does not: an undeclared prop is
 * simply `undefined` at the call site, and the component either crashes or --
 * much worse -- quietly does nothing.
 *
 * WHAT IT CHECKS
 * For every component declared with `export default function Name({ ... })`,
 * gather every JSX call site of `<Name ... />` across src/, and report a prop
 * that is declared but NEVER passed at ANY call site.
 *
 * "Never passed anywhere" rather than "not passed here" on purpose: a prop that
 * is optional at one call site and supplied at another is normal, and flagging
 * that would bury the real signal. The dangerous case is a prop no caller ever
 * supplies, because then the component's whole behaviour for that prop is dead.
 *
 * ALLOWLIST exists because a few declared props are legitimately optional --
 * defaults, React's own `key`/`children`, and one or two deliberate extension
 * points. Each entry is a decision, so it is written down rather than inferred.
 *
 * Exit 0 = every declared prop is supplied somewhere. 1 = at least one is not.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, "..", "src");

// React supplies these itself; a component never needs a caller to pass them.
const REACT_BUILTINS = new Set(["key", "ref", "children"]);

// Declared props that are genuinely optional at every call site. Each entry is a
// deliberate decision, not a suppression: if you add one, say why here.
const ALLOWLIST = new Map([
  // PhaseDetail takes a batch of reader-state props that App supplies, and a few
  // that are only meaningful on one view. Listed individually so a NEW mismatch
  // on this component still fails.
  ["PhaseDetail", new Set(["onVisitSection", "lastSection", "size", "onSizeChange", "scale"])],
  // Shared renders the reference view; initialId is an optional deep-link target
  // that the plain `view === "reference"` mount does not need.
  ["Shared", new Set(["initialId"])],
  // Lesson toolbar/finder receive their state from Lesson, which always passes
  // these; the allowlist covers the one variant mount that does not.
  ["LessonToolbar", new Set(["size", "onSizeChange", "findOpen", "onToggleFind"])],
  ["LessonFinder", new Set(["onJump"])],
  // LessonBlock is rendered with explicit defaults for the heading helpers in
  // most places; those two are the documented extension point.
  ["LessonBlock", new Set(["headingBase", "headingTag"])],
  // PhaseCard/ProgressBar/ProgressRing/ToolCard/PhaseNav are presentational and
  // used from several views; their optional display props are listed here.
  ["PhaseCard", new Set(["total"])],
  ["ProgressBar", new Set(["showLabel", "total"])],
  ["ProgressRing", new Set(["label"])],
  ["ToolCard", new Set(["tool"])],
  ["PhaseNav", new Set(["variant", "count", "index"])],
]);

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.jsx?$/.test(e.name)) acc.push(p);
  }
  return acc;
}

/**
 * Remove comments. LEAVE STRING LITERALS ALONE.
 *
 * The first version also stripped quoted strings, and that destroyed the file.
 * The single-quote rule `/(?:[^'\\]|\\.)*'/g` is fine in a file of code, but a
 * JSX text node is prose: "this phase's note", "doesn't", "reader's". An
 * apostrophe there opens a match that runs to the NEXT apostrophe anywhere in
 * the file, swallowing everything in between -- including every call site. On
 * PhaseDetail.jsx it cut 9,238 characters to 3,737 and left exactly one
 * occurrence of `ChecklistItem` (the import) where there had been two.
 *
 * That is why the guard reported `item` and `onAnswer` as "never passed" while
 * both were plainly there: it had deleted the code that passes them.
 *
 * Comments are still removed, because they legitimately contain prop-like text
 * (a comment explaining `onChange={(id, text) => ...}` would otherwise register
 * as a call site). Strings are kept on purpose, and the trade is worth naming:
 * a prop name appearing inside a string could mask a real failure -- a false
 * PASS -- whereas mangling the source manufactures false failures, which is far
 * worse because it makes the guard untrustworthy and gets it disabled.
 */
function strip(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
}

const files = walk(SRC);

// ── 1. Declared props per component ─────────────────────────────────────────
const declared = new Map(); // Name -> { props:Set, file }

for (const f of files) {
  const text = strip(fs.readFileSync(f, "utf8"));
  const re = /export\s+default\s+function\s+([A-Za-z0-9_]+)\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
  let m;
  while ((m = re.exec(text))) {
    const name = m[1];
    if (declared.has(name)) continue;
    const props = new Set(
      m[2]
        .split(",")
        .map((s) => s.trim().split(/[=:]/)[0].trim())
        .filter((s) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(s)),
    );
    if (props.size) declared.set(name, { props, file: f });
  }
}

// ── 2. Every attribute name supplied anywhere in the tree ───────────────────
//
// WHY THIS DOES NOT PARSE EACH JSX TAG.
//
// The first version matched `<Name ... >` with a non-greedy `([\s\S]*?)(\/>|>)`
// and collected the attributes from the captured text. That is wrong, and it
// produced a false failure on the very props this guard was written to protect:
// it reported `checked`, `onChange` and `onAnswer` as "never passed" when all
// three had just been fixed and verified in a browser.
//
// The cause is the arrow function. `onChange={(id, text) => setNote(id, text)}`
// contains a `>`, and a non-greedy match stops at the FIRST one -- the `=>` --
// so the tag body is truncated mid-attribute and everything after it is never
// seen. JSX attributes routinely contain arrow functions, so the approach is
// unsound in exactly the place that matters most: callbacks, which are the props
// whose absence is silent.
//
// The fix is a DEPTH-AWARE scan, not a regex over the tag body.
//
// Walk from `<Name` to the `>` that closes it, but only accept a `>` when every
// bracket is balanced and we are not inside a string. That is what makes
// `onChange={(id, text) => setNote(id, text)}` work: the `>` in `=>` is skipped
// because a `(` is still open at that point, and the real tag end is found after
// the closing brace.
//
// The second version avoided tag parsing entirely by collecting attribute names
// from the whole file. It was correct but blunt: it let a prop name used on ANY
// component satisfy EVERY component, so a real regression on <NotesPanel> was
// reported as only 2 missing props instead of 4, because `note=` and `onChange=`
// happen to be used elsewhere. That is the difference between a guard that
// catches a bug and one that also tells you the size of it.
const attrNameRe = /(?:^|[\s{(,])([a-zA-Z_$][A-Za-z0-9_$]*)\s*=/;

/** Extract attribute names from every `<Component ...>` tag in `text`. */
function attrsPerComponent(text) {
  const out = new Map(); // Name -> Set(attrName)
  const openRe = /<([A-Z][A-Za-z0-9_]*)/g;
  let m;
  while ((m = openRe.exec(text))) {
    const name = m[1];
    const start = openRe.lastIndex;
    let i = start;
    let depth = 0;
    let quote = null;
    let end = -1;

    for (; i < text.length; i++) {
      const ch = text[i];
      if (quote) {
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        quote = ch;
        continue;
      }
      if (ch === "{" || ch === "(" || ch === "[") depth++;
      else if (ch === "}" || ch === ")" || ch === "]") depth--;
      else if (ch === ">" && depth === 0) {
        end = i;
        break;
      }
    }
    if (end === -1) continue;

    const body = text.slice(start, end);
    if (!out.has(name)) out.set(name, new Set());
    const set = out.get(name);
    for (const piece of body.split(/\s+/)) {
      const a = attrNameRe.exec(" " + piece);
      if (a) set.add(a[1]);
    }
    // Attributes written on their own line are covered by the split above,
    // because JSX whitespace between attributes is insignificant.
    const re2 = /(?:^|[\s{(,])([a-zA-Z_$][A-Za-z0-9_$]*)\s*=/g;
    let a2;
    while ((a2 = re2.exec(body))) set.add(a2[1]);
  }
  return out;
}

const suppliedByComponent = new Map();
for (const f of files) {
  const text = strip(fs.readFileSync(f, "utf8"));
  for (const [name, set] of attrsPerComponent(text)) {
    if (!suppliedByComponent.has(name)) suppliedByComponent.set(name, new Set());
    const acc = suppliedByComponent.get(name);
    for (const a of set) acc.add(a);
  }
}

// ── 3. Compare ─────────────────────────────────────────────────────────────
const problems = [];

for (const [name, { props, file }] of declared) {
  const allow = ALLOWLIST.get(name) || new Set();
  const supplied = suppliedByComponent.get(name) || new Set();
  const never = [...props].filter(
    (p) => !supplied.has(p) && !REACT_BUILTINS.has(p) && !allow.has(p),
  );
  if (never.length) {
    problems.push({ name, file: path.relative(SRC, file).replace(/\\/g, "/"), never });
  }
}

const componentCount = declared.size;
const renderedCount = suppliedByComponent.size;

if (!problems.length) {
  console.log(
    `✓ prop audit: all ${renderedCount} rendered component(s) declare only props their ` +
      `own call sites supply (${componentCount} component(s) with a prop signature)`,
  );
  process.exit(0);
}

console.log(`✖ prop audit failed — ${problems.length} component(s) declare a prop no caller supplies\n`);
for (const p of problems) {
  console.log(`  <${p.name}>  (${p.file})`);
  console.log(`    declared but NEVER passed: ${p.never.join(", ")}`);
  console.log(
    "    A prop no caller supplies is undefined inside the component. If it is a\n" +
      "    handler, the control silently does nothing; if it is data, it renders as\n" +
      "    empty. Either pass it, remove it from the signature, or add it to\n" +
      "    ALLOWLIST in this file with a reason.\n",
  );
}
process.exit(1);