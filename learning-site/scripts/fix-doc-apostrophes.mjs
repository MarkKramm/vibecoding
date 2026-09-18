// Normalise straight apostrophes to curly ones in DESIGN-SYSTEM.md, WITHOUT
// touching apostrophes inside backtick code spans or fenced code blocks.
//
// WHY THIS NEEDS A SCRIPT AND NOT A FIND-AND-REPLACE
// A blanket replace of ' with U+2019 would corrupt every piece of code in the
// document. In this file that means CSS custom properties, selectors and rules —
// `can't` never appears in code, but `'` does appear as a JS/CSS string quote.
// Rewriting a code sample to use a typographic quote would make the sample
// WRONG, and the whole point of the document is that its samples are accurate.
//
// So the file is split into code and prose, and only prose is rewritten. The
// same reasoning the project applies to its Markdown guard: understand the
// structure, then edit, rather than matching on characters alone.
//
// Run: node scripts/fix-doc-apostrophes.mjs [--dry]

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The target is REPO-ROOT docs/, not learning-site/docs/. This script lives in
// learning-site/scripts/, so that is three levels up.
const FILE = fileURLToPath(
  new URL("../../docs/DESIGN-SYSTEM.md", import.meta.url)
);
const DRY = process.argv.includes("--dry");

const src = readFileSync(FILE, "utf8");
const lines = src.split("\n");

let inFence = false;
let replaced = 0;
let skippedInCode = 0;

const out = lines.map((line, i) => {
  // Track fenced blocks. The project's fence rule requires openers on their own
  // line with a language tag, so a trimmed ``` test is exact here.
  if (/^\s*```/.test(line)) {
    inFence = !inFence;
    return line;
  }
  if (inFence) {
    skippedInCode += (line.match(/'/g) || []).length;
    return line;
  }

  // Split on inline code spans. Odd-indexed pieces are inside backticks.
  const parts = line.split(/(`[^`]*`)/);
  return parts
    .map((part, j) => {
      if (j % 2 === 1) {
        // Inside a code span: leave alone.
        skippedInCode += (part.match(/'/g) || []).length;
        return part;
      }
      const n = (part.match(/'/g) || []).length;
      if (!n) return part;
      replaced += n;
      // Possessive or contraction apostrophe: the character between two word
      // characters, or after a word character at a word end. A leading quote
      // (opening a quotation) becomes a left single quote instead.
      return part
        .replace(/(\w)'(\w)/g, "$1\u2019$2")
        .replace(/(\w)'(?=\s|$|[.,;:)])/g, "$1\u2019")
        .replace(/(^|[\s(])'(?=\w)/g, "$1\u2018");
    })
    .join("");
});

// Lines that did not change and had no apostrophe are returned as-is above.
if (DRY) {
  console.log(`would replace ${replaced} apostrophe(s) in prose`);
} else {
  writeFileSync(FILE, out.join("\n"), "utf8");
  console.log(`replaced ${replaced} apostrophe(s) in prose`);
}
console.log(`left untouched inside code: ${skippedInCode}`);

// Report anything still straight, so a miss is visible rather than silent.
//
// This re-checks the RESULT, not the input. An earlier version re-read `src` in
// dry mode, so every apostrophe it had just decided to fix was reported as
// "still straight" — a report that contradicts its own first line and would send
// the next reader hunting for a bug that is not there.
const result = DRY ? out.join("\n") : readFileSync(FILE, "utf8");
const after = result.split("\n");
let remaining = 0;
inFence = false;
after.forEach((line, i) => {
  if (/^\s*```/.test(line)) {
    inFence = !inFence;
    return;
  }
  if (inFence) return;
  const prose = line.split(/(`[^`]*`)/).filter((_, j) => j % 2 === 0).join("");
  const n = (prose.match(/'/g) || []).length;
  if (n) {
    remaining += n;
    console.log(`  STILL STRAIGHT  line ${i + 1}: ${line.trim().slice(0, 70)}`);
  }
});
console.log(
  remaining
    ? `${remaining} straight apostrophe(s) remain in prose`
    : "0 straight apostrophes left in prose"
);
