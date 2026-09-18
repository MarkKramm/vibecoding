// One-off: rename the ported localStorage namespace from the sibling project's
// "cs-roadmap" to this project's "vibecoding".
//
// WHY THIS IS NOT COSMETIC
// localStorage is scoped per ORIGIN, not per path. If both sites are ever served
// from localhost:5173 — which is exactly what happens when you alternate between
// them during development — they share one storage area. Every key collides:
// ticking a checklist item in one site ticks it in the other, notes merge, and
// quiz answers from two different curricula interleave. The prefix is the only
// thing keeping them apart.
//
// The string appears in three forms and all three must move together:
//   "cs-roadmap:progress:v1"   storage keys
//   "cs-roadmap-backup"        exported file format tag
//   "CS Roadmap"               human-facing app name in exports
//
// The regex deliberately requires a `:` or `-` after the prefix so it cannot
// touch prose. A bare /cs-roadmap/ would also rewrite the explanatory comments in
// lib/transfer.js and data/roadmaps.js that legitimately REFER to the sibling
// project by name, and a comment that loses its meaning is a real loss.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath rather than `new URL(...).pathname` — see scripts/check-all.mjs.
const ROOT = fileURLToPath(new URL("../src/", import.meta.url));
const EXTS = new Set([".js", ".jsx"]);
const DRY = process.argv.includes("--dry");

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (EXTS.has(extname(e.name))) yield p;
  }
}

const RULES = [
  // Storage keys and format tags: prefix followed by a separator.
  [/cs-roadmap:/g, "vibecoding:"],
  [/cs-roadmap-backup/g, "vibecoding-backup"],
  [/cs-roadmap-phase/g, "vibecoding-phase"],
  // The regex literal in transfer.js that strips the prefix back off.
  [/\^cs-roadmap:/g, "^vibecoding:"],
  // A FOURTH form, missed on the first pass: the phase-filename builder in
  // transfer.js does a bare string concat, `"cs-roadmap-" + phase.id`, so there
  // is no `:` and no trailing keyword for the rules above to catch. Without
  // this, downloaded phase files are still named cs-roadmap-*.json while the
  // export tag has already moved to vibecoding-backup — an inconsistency that
  // only shows up when a reader tries to re-import a phase they exported.
  // Requiring the trailing hyphen keeps it off prose.
  [/cs-roadmap-/g, "vibecoding-"],
  // Quoted human-facing app name, only where it is a string literal value.
  [/"CS Roadmap"/g, '"Vibecoding & the AI Era"'],
  [/app: "CS Roadmap"/g, 'app: "Vibecoding & the AI Era"'],
];

let changed = 0;
for await (const file of walk(ROOT)) {
  const before = await readFile(file, "utf8");
  let after = before;
  const hits = [];
  for (const [re, to] of RULES) {
    const m = after.match(re);
    if (m) hits.push(...m);
    after = after.replace(re, to);
  }
  if (after !== before) {
    changed++;
    const rel = file.replace(/\\/g, "/").split("/src/")[1];
    console.log(`${DRY ? "[dry] " : ""}${rel}  (${hits.length} replacement${hits.length === 1 ? "" : "s"})`);
    if (!DRY) await writeFile(file, after, "utf8");
  }
}
console.log(`\n${changed} file(s) ${DRY ? "would change" : "changed"}`);
