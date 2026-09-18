// One-off probe: does a `####` heading jammed against the preceding paragraph
// still parse as a heading? Checked against the GENERATED lesson JSON, because
// that is the artifact the site actually renders -- reading the markdown only
// tells you what was written, not what survived the parser.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Resolve against the repo root, not the cwd: this script is run from
// learning-site/ but the JSON lives under learning-site/src/, so a cwd-relative
// path silently doubles the directory and ENOENTs.
const ROOT = fileURLToPath(new URL("../../", import.meta.url));
// NOTE the layout: per-TRACK JSON sits directly in generated/, while per-LESSON
// bodies live in generated/lessons/. This probe wants the per-lesson body, since
// that is the one carrying the parsed block tree.
const path = `${ROOT}learning-site/src/data/generated/lessons/cost-01-token-economics.json`;
const d = JSON.parse(readFileSync(path, "utf8"));

const json = JSON.stringify(d);
const target = "Reasoning and thinking tokens";

console.log(`  "${target}" present in generated JSON:`, json.includes(target));

// Walk the tree looking for a heading node carrying that text.
let asHeading = 0;
let asText = 0;
const walk = (node) => {
  if (node === null || typeof node !== "object") return;
  if (Array.isArray(node)) return node.forEach(walk);
  if (typeof node.text === "string" && node.text.includes(target)) {
    if (node.type === "heading") asHeading++;
    else asText++;
  }
  if (typeof node.value === "string" && node.value.includes(target)) {
    if (node.type === "heading") asHeading++;
  }
  for (const v of Object.values(node)) walk(v);
};
walk(d);

console.log(`  occurrences as a heading node: ${asHeading}`);
console.log(`  occurrences as other nodes:    ${asText}`);
console.log(asHeading > 0 ? "  -> jammed heading DOES parse" : "  -> jammed heading does NOT parse as a heading");
