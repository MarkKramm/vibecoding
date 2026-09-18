// Reachability from main.jsx, computed properly and printed as a table.
// Written as a FILE because PowerShell has mangled inline node -e eight times.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, dirname, join, relative } from "node:path";

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.jsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

const SRC = "src";
const all = walk(SRC).map((f) => resolve(f));
const edges = new Map();

for (const f of all) {
  const text = readFileSync(f, "utf8");
  const set = new Set();
  const re = /(?:from|import)\s*\(?\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const spec = m[1];
    if (!spec.startsWith(".")) continue;
    const base = resolve(dirname(f), spec);
    for (const cand of [base, base + ".js", base + ".jsx", join(base, "index.js")]) {
      if (existsSync(cand) && statSync(cand).isFile()) { set.add(resolve(cand)); break; }
    }
  }
  edges.set(f, set);
}

const start = resolve(join(SRC, "main.jsx"));
if (!existsSync(start)) { console.log("NO src/main.jsx — aborting"); process.exit(1); }

const seen = new Set([start]);
const queue = [start];
while (queue.length) {
  const cur = queue.shift();
  for (const next of edges.get(cur) || []) {
    if (!seen.has(next)) { seen.add(next); queue.push(next); }
  }
}

const dead = all.filter((f) => !seen.has(f));
// Count only reachable files that still exist: an import specifier can resolve to
// a file outside SRC (there are none today), and `seen` starts with main.jsx
// before the walk, so a naive size comparison can report more reachable modules
// than total modules.
const reachableInSrc = all.filter((f) => seen.has(f));
console.log(`  total modules      : ${all.length}`);
console.log(`  reachable from main: ${reachableInSrc.length}`);
console.log(`  UNREACHABLE        : ${dead.length}`);
console.log("");
let bytes = 0, lines = 0;
for (const f of dead.sort()) {
  const t = readFileSync(f, "utf8");
  lines += t.split("\n").length;
  bytes += Buffer.byteLength(t);
  console.log(`    ${relative(SRC, f).replace(/\\/g, "/").padEnd(40)} ${String(t.split("\n").length).padStart(5)} lines`);
}
console.log("");
console.log(`  TOTAL: ${lines} lines, ${Math.round(bytes / 1024)} KB`);

// ---------------------------------------------------------------------------
// Exit status.
// ---------------------------------------------------------------------------
//
// The corpus has a history of accumulating ported-but-unreachable modules that
// every other check happily reads: `audit-projections.mjs` walks the tree, so it
// MENTIONS all of them, which looks like coverage in a grep. Fourteen such modules
// reached 1,740 lines before anyone walked reachability from `main.jsx`, and the
// documentation justified keeping them with a claim ("they are tested pure
// modules") that no guard could falsify because nothing tested them.
//
// So this exits non-zero the moment anything becomes unreachable again. A module
// with no path from the entry point is either a mistake or a feature nobody
// finished; both should stop the build and be a deliberate decision rather than a
// silent accumulation.
if (dead.length > 0) {
  console.log("");
  console.log(`\u2716 ${dead.length} module(s) under src/ are unreachable from src/main.jsx.`);
  console.log("  Either import it, or delete it. Do not leave it for the next reader to");
  console.log("  find — that is how the 1,740 lines this check was written for accumulated.");
  process.exit(1);
}

console.log("");
console.log("\u2713 reachability passed \u2014 every module under src/ is reachable from src/main.jsx");
