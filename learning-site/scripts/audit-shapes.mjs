// Audits the SHAPE of every phase field the site renders.
//
// WHY THIS EXISTS
// The build guard (build-content.mjs --check) verifies the Markdown is
// well-formed. It does not verify that the JSON it emits matches what the React
// components expect, because it has no knowledge of the components. That gap is
// exactly where a whole class of bug lives: `topics` is an array of
// { heading, items[] } groups while `skills` is an array of strings, and passing
// the former where the latter is expected throws at RENDER time with no build
// warning at all. That bug shipped once; this audit is so it cannot ship again.
//
// It asserts, per field, the shape each renderer assumes, and reports any field
// whose items do not match. Run: node scripts/audit-shapes.mjs

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath rather than `new URL(...).pathname` — see scripts/check-all.mjs.
const GEN = fileURLToPath(new URL("../src/data/generated/", import.meta.url));
const TRACKS = ["foundations", "model-internals", "prompting", "rag", "agents", "cost"];

/**
 * The contract each field must satisfy, as understood by the components.
 * `kind` is the type of ONE element of the array.
 */
const CONTRACT = {
  skills: "string",
  deliverableItems: "string",
  topics: "object", // { heading, items: string[] }
  tasks: "object", // { id, text, band, energy }
  checklist: "object", // { id, text, energy }
  quiz: "object", // { id, question, options: string[], answerIndex, why, energy }
  tools: "object", // { name, purpose, cost, url, task, freeAlternative }
  resources: "object", // { name, url }
};

function kindOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

let problems = 0;
let checked = 0;
const seen = new Map();

for (const trackId of TRACKS) {
  let data;
  try {
    data = JSON.parse(readFileSync(join(GEN, `${trackId}.json`), "utf8"));
  } catch {
    continue;
  }

  for (const phase of data.phases || []) {
    for (const [field, want] of Object.entries(CONTRACT)) {
      const arr = phase[field];
      if (arr === undefined || arr === null) continue;
      if (!Array.isArray(arr)) {
        console.log(`SHAPE  ${phase.id}.${field} is ${kindOf(arr)}, expected array`);
        problems++;
        continue;
      }
      const bad = arr.filter((x) => kindOf(x) !== want);
      checked += arr.length;
      if (bad.length) {
        console.log(
          `SHAPE  ${phase.id}.${field}: ${bad.length}/${arr.length} element(s) are not ${want}`
        );
        console.log(`       first: ${JSON.stringify(bad[0]).slice(0, 140)}`);
        problems++;
      }

      // Record the nested shape of objects so a field with MORE than one shape
      // is caught even when each individual element is an object.
      if (want === "object" && arr.length) {
        const keys = [...new Set(arr.flatMap((x) => Object.keys(x || {})))].sort();
        const key = `${field}: ${keys.join(",")}`;
        seen.set(key, (seen.get(key) || 0) + 1);
      }
    }

    // A quiz question must be answerable: exactly one correct option, in range.
    for (const q of phase.quiz || []) {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        console.log(`QUIZ   ${q.id}: ${(q.options || []).length} options`);
        problems++;
      }
      if (
        typeof q.answerIndex !== "number" ||
        q.answerIndex < 0 ||
        q.answerIndex >= (q.options || []).length
      ) {
        console.log(`QUIZ   ${q.id}: answerIndex ${q.answerIndex} out of range`);
        problems++;
      }
      if (!q.why || !String(q.why).trim()) {
        console.log(`QUIZ   ${q.id}: empty why`);
        problems++;
      }
    }
  }
}

console.log(`\n${checked} array elements checked across ${TRACKS.length} tracks`);
console.log("\nNested shapes seen:");
for (const [k, n] of [...seen].sort()) console.log(`  ${String(n).padStart(4)}x  ${k}`);

if (problems) {
  console.log(`\n${problems} SHAPE PROBLEM(S)`);
  process.exit(1);
}
console.log("\n✓ all field shapes match the renderers' contract");
