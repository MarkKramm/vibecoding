// Tests costTone against the REAL cost strings in the generated corpus.
//
// This is not a hypothetical unit test. The classification is derived from the
// data each time, so if an author writes a new cost phrase the test surfaces it
// rather than silently mis-tiering it. Run: node scripts/test-cost-tone.mjs

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { costTone, TONES } from "../src/data/tools.js";

// fileURLToPath rather than `new URL(...).pathname`: on Windows pathname keeps a
// leading slash before the drive letter, which join() then turns into a broken
// path. See scripts/check-all.mjs for the longer note.
const GEN = fileURLToPath(new URL("../src/data/generated/", import.meta.url));
const SKIP = new Set(["tracks.json", "search.json", "shared.json"]);

// Collect every distinct cost string actually present.
const costs = new Map();
for (const f of readdirSync(GEN)) {
  if (!f.endsWith(".json") || SKIP.has(f)) continue;
  const data = JSON.parse(readFileSync(join(GEN, f), "utf8"));
  for (const p of data.phases || []) {
    for (const t of p.tools || []) {
      if (!t.cost) continue;
      costs.set(t.cost, (costs.get(t.cost) || 0) + 1);
    }
  }
}

// Expected tone for the cases where a wrong answer would mislead a reader.
// Anything not listed is checked only for being a valid tone.
const EXPECTED = {
  "Free": "free",
  "Free/open-source": "free",
  "Free, open source": "free",
  "Free, open source (MIT)": "free",
  "Free, standard library": "free",
  "Free to read": "free",
  "Free to browse": "free",
  "Free to call": "free",
  "Free tier": "free",
  "Free self-hosted, paid cloud tiers exist": "free",
  "Free to read (API calls are paid)": "free",
  "Free to submit; tokens billed at a discount": "free",
  "Freemium": "freemium",
  "Freemium, free tier": "freemium",
  "Freemium; paid above the free tier": "freemium",
  "Paid (pay-per-token, no monthly fee)": "paid",
  // The honest one: we do not know, so it must not claim "free".
  "Varies": "freemium",
};

let pass = 0;
let fail = 0;
const unknown = [];

for (const [cost, count] of [...costs].sort((a, b) => a[0].localeCompare(b[0]))) {
  const got = costTone(cost);
  const want = EXPECTED[cost];

  if (!TONES.includes(got)) {
    console.log(`INVALID TONE  ${got}  <- ${cost}`);
    fail++;
    continue;
  }
  if (want === undefined) {
    unknown.push([cost, got, count]);
    pass++;
    continue;
  }
  if (got === want) {
    pass++;
  } else {
    console.log(`FAIL  want=${want} got=${got}  <- ${cost}`);
    fail++;
  }
}

console.log(`\n${costs.size} distinct cost strings, ${pass} ok, ${fail} failed`);
if (unknown.length) {
  console.log(`\n${unknown.length} string(s) with no explicit expectation (tone accepted):`);
  for (const [c, t, n] of unknown) console.log(`  [${n}x] ${t.padEnd(9)} <- ${c}`);
}
process.exit(fail ? 1 : 0);
