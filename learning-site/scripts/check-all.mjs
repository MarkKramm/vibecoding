// Runs every site check that does NOT need a browser, in dependency order.
//
// WHY THIS IS A SCRIPT AND NOT A CHAIN OF `&&` IN package.json
// The order matters and the reason is not obvious from the command list:
//
//   1. The content must build first, because every later check reads the JSON it
//      emits. Auditing shapes against a stale generated directory would happily
//      pass while the Markdown it came from was broken.
//   2. audit-shapes runs before the browser tests, because it catches the cheap
//      class of bug (a field whose element type changed) in under a second. A
//      browser run is ~30 seconds; failing fast keeps the loop tight.
//   3. cost-tone depends on the generated cost strings, so it also runs after
//      the build.
//   4. audit-arithmetic also reads the corpus rather than the generated JSON, and
//      is cheap, so it sits next to the other corpus-reading checks.
//   5. encoding runs last because it is the cheapest of all and enforces rules no
//      other step can see.
//
// A shell `&&` chain expresses the order but not the reason, and on Windows it
// also buries which step failed behind exit-code noise. This script reports each
// step by name and stops at the first real failure.
//
// The browser checks are NOT here. They need a dev server running and a browser
// binary, so they live in `npm run test:browser`.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath, NOT `new URL(...).pathname`.
//
// On Windows `pathname` yields "/C:/Users/..." — a leading slash before the
// drive letter — so `join()` then produces "\C:\Users\..." and every spawned
// path is wrong. Stripping the leading slash with a regex appears to work and
// then breaks on a lowercase drive letter or a UNC path. fileURLToPath is the
// supported conversion and handles all of those cases.
const HERE = dirname(fileURLToPath(import.meta.url));
// HERE is learning-site/scripts. The curriculum build lives in the REPO's
// scripts/ directory, one level above the site, because it is shared by the
// content pipeline rather than owned by the site.
const SITE = join(HERE, "..");
const REPO = join(SITE, "..");

const STEPS = [
  {
    name: "content build (writes JSON)",
    cmd: "node",
    args: [join(REPO, "scripts", "build-content.mjs")],
    why: "every later check reads the JSON this emits",
  },
  {
    name: "field shapes",
    cmd: "node",
    args: [join(HERE, "audit-shapes.mjs")],
    why: "a changed element type only fails at render time, not at build time",
  },
  {
    name: "cost classification",
    cmd: "node",
    args: [join(HERE, "test-cost-tone.mjs")],
    why: "costTone is derived from the corpus, so it is re-checked against it",
  },
  {
    name: "worked-example arithmetic",
    cmd: "node",
    args: [join(HERE, "audit-arithmetic.mjs")],
    why: "cost/05 shipped a table whose stated numbers contradicted its own prose, and no other check could see it",
  },
  {
    name: "encoding and line endings",
    cmd: "node",
    args: [join(HERE, "audit-encoding.mjs")],
    why: "a CRLF file or a mojibake em dash is invisible in review and looks fine in an editor",
  },
  {
    name: "css wiring",
    cmd: "node",
    args: [join(HERE, "audit-css.mjs")],
    why: "the site once shipped with 40 layout classes that no stylesheet defined, and every content check stayed green while the page rendered unstyled",
  },
];

let failed = 0;
for (const step of STEPS) {
  process.stdout.write(`\n▶ ${step.name}\n`);
  const r = spawnSync(step.cmd, step.args, {
    stdio: "inherit",
    cwd: SITE,
    shell: false,
  });
  if (r.status !== 0) {
    console.log(`\n✗ ${step.name} FAILED (exit ${r.status})`);
    console.log(`  ${step.why}`);
    failed++;
    break;
  }
}

// The browser scripts are listed so a reader knows they exist and why they are
// separate, rather than assuming this suite is the whole story.
const browserScripts = [
  "verify-site.mjs",
  "verify-deep.mjs",
  "verify-quiz-correctness.mjs",
].filter((f) => existsSync(join(HERE, f)));

if (!failed) {
  console.log(`\n✓ all ${STEPS.length} offline checks passed`);
  if (browserScripts.length) {
    console.log(
      `\nNOT RUN HERE (need a dev server + a browser): ${browserScripts.join(", ")}`
    );
    console.log("  start the dev server, then: npm run test:browser");
  }
}

process.exit(failed ? 1 : 0);
