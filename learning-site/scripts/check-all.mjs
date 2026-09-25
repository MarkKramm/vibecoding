// Runs the site checks in dependency order: offline first, rendered-page checks last.
//
// WHY THIS IS A SCRIPT AND NOT A CHAIN OF `&&` IN package.json
// The order matters and the reason is not obvious from the command list:
//
//   1. The content must build first, because every later check reads the JSON it
//      emits. Auditing shapes against a stale generated directory would happily
//      pass while the Markdown it came from was broken.
//   2. audit-shapes runs before the browser checks, because it catches the cheap
//      class of bug (a field whose element type changed) in under a second. A
//      browser run takes longer; failing fast keeps the loop tight.
//   3. The three renderer/logic tests follow the shape audit: they also read the
//      generated JSON, and they check the SITE's behaviour rather than the
//      content's shape. They are separate steps from audit-shapes because they
//      answer different questions — audit-shapes asks "is this field the right
//      type", these ask "does the component do the right thing with it".
//   4. cost-tone depends on the generated cost strings, so it also runs after
//      the build.
//   5. audit-arithmetic also reads the corpus rather than the generated JSON, and
//      is cheap, so it sits next to the other corpus-reading checks.
//   6. encoding runs last because it is the cheapest of all and enforces rules no
//      other step can see.
//
// A shell `&&` chain expresses the order but not the reason, and on Windows it
// also buries which step failed behind exit-code noise. This script reports each
// step by name and stops at the first real failure.
//
// Two rendered-page checks run in this suite after the fast checks: accessibility
// and the all-phase sweep. They require a browser and production preview, and each
// reports an explicit skip when no preview server responds.
//
// The unit logic tests run here because they do not need a browser. test-render-inline.mjs and
// test-lesson-blocks.mjs load the real .jsx components by transpiling them in
// memory with esbuild — already on disk as a dependency of Vite — and render
// them with react-dom/server, which needs no DOM. That is what keeps the unit
// tests inside the fast suite instead of behind a browser.

import { spawnSync } from "node:child_process";
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
// Browser-dependent steps use the built production preview. Override this when
// the default port is occupied or serves another project.
const PREVIEW_URL = process.env.VITE_PREVIEW_URL || "http://localhost:4173";

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
    name: "projection reads",
    cmd: "node",
    args: [join(HERE, "audit-projections.mjs")],
    why: "the build emits the curriculum TWICE — a light index.json and full per-track files — and a component that reads a field the projection it actually imports does not carry gets `undefined`, not an error. The Tools library shipped reading `phase.tools` off the light index and told the reader '0 tools across 10 written tracks' while the corpus held 433 tool rows; every other check in this suite reads the SOURCE data or the FULL projection, where `tools` is present and correctly shaped, so all of them stayed green while the rendered page was empty. This is the only step that compares what a component ACCESSES against the projection that SUPPLIES it",
  },
  // The following logic tests check the site's OWN behavior rather than content.
  // They need no browser, unlike the rendered-page checks later in the suite, and
  // read the same generated JSON as the surrounding steps, so they must run after
  // above do, so they must run after the build for the same reason.
  {
    name: "inline markdown rendering",
    cmd: "node",
    args: [join(HERE, "test-render-inline.mjs")],
    why: "renderInline is the only thing standing between authored **bold** and the reader; a masking bug leaks literal asterisks and backticks into prose, and the JSON stays perfectly valid so no content check can see it",
  },
  {
    name: "quiz correctness",
    cmd: "node",
    args: [join(HERE, "test-quiz.mjs")],
    why: "the browser quiz test only ever opens foundations/01, so a malformed answerIndex in any of the other 64 phases would mark a distractor correct and nothing else would notice",
  },
  {
    name: "lesson block renderer coverage",
    cmd: "node",
    args: [join(HERE, "test-lesson-blocks.mjs")],
    why: "the parser rejects an unknown block type but the renderer only reports one, so widening the vocabulary leaves lessons rendering 'Unsupported block type: ...' while the build, the shape audit and the AST character audit all stay green",
  },
  {
    name: "component rendering",
    cmd: "node",
    args: [join(HERE, "test-components.mjs")],
    why: "this is the only step that asserts on RENDERED MARKUP, and three defects reached the page while every other check stayed green because each one was correct as data and wrong on screen: global.css styled 344 classes but none of the top-level layout ones, so the site rendered unstyled; the Tools library iterated `phase.tools` off the LIGHT projection, which does not carry that field, so `|| []` turned `undefined` into the confident and entirely false '0 tools across 10 written tracks'; and 40 tool cards emitted `<a href=\"—\">` because an em-dash placeholder passed through the parser where `tool.url &&` accepted it as truthy. All three are caught by rendering the component and reading the output, which is what this step does — it also pins that a component reading a field the light projection does not carry degrades VISIBLY rather than silently claiming success, which is the shape all three share",
  },
  {
    name: "in-lesson search",
    cmd: "node",
    args: [join(HERE, "test-search.mjs")],
    why: "lessonSearch.js is the only module whose OUTPUT the reader is scrolled to: LessonFinder jumps to hit.blockIndex and paints hit.snippet.match inside a <mark>. An h5 wrongly counted as a section, a flipped ranking comparison or a match that is not a verbatim slice of its own block all produce results that render, highlight and jump — to the wrong place — so every content check stays green while the finder quietly lies about where the text is",
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
  {
    // ⚠️ THIS STEP IS DIFFERENT FROM EVERY OTHER ONE ABOVE, AND THE DIFFERENCE
    // IS THE POINT.
    //
    // It needs a BROWSER and a PREVIEW SERVER. It is in this suite because
    // accessibility is the one category where a source-level
    // check is structurally incapable of telling the truth: `role="status"` in
    // Search.jsx does not prove the count is announced after a query runs,
    // `.skip` in App.jsx does not prove the skip link moves focus, and
    // `:focus-visible` in global.css does not prove any given element gets a
    // visible ring. Only a rendered page answers those.
    //
    // The precondition is handled by the script itself: if no preview server
    // answers, it reports that it could not run and exits 0 with a loud notice,
    // rather than failing the suite for a missing server. A step that fails for
    // an unrelated reason gets disabled, and a disabled guard is worse than none.
    //
    // It runs in --strict mode: every failure exits non-zero. The three defects
    // found on the day this check was written (two placeholder contrast failures
    // at 3.27:1, and a skip link that moved the hash but not focus) are FIXED, so
    // there is nothing to baseline. The counts are recorded here only so the next
    // reader knows what a regression would look like.
    //
    // Note the mode is deliberately the strict one: a baseline records defects
    // that are the site's to fix, and leaving entries in place after the fix
    // makes the audit claim a fixed thing is still broken.
    name: "accessibility (rendered page)",
    cmd: "node",
    args: [join(HERE, "audit-a11y.mjs"), PREVIEW_URL, "--strict"],
    why: "every a11y claim in this project was hand-checked, and a hand-check of accessibility has one specific failure mode: the attribute is in the SOURCE and the rendered page does something else. Twelve other steps read data; this is the only one that asks a browser what a keyboard-only or screen-reader user actually gets. It catches the class nothing else can see — a skip link that scrolls without moving focus (shipped), placeholder text at 3.27:1 because ::placeholder was styled for one input and not another (shipped), an icon control with no accessible name, a heading level skipped, or a control that takes focus with no visible indicator. Without it, all of those reach the reader silently, and the suite stays green",
  },
  {
    // The precondition is handled by the script itself: with no server answering
    // it reports that it could not run and exits 0 with a loud notice, rather
    // than failing for an unrelated reason.
    //
    // This is the ONLY step in the npm test suite that opens every page of the corpus. Its reason for
    // existing is in its own header, but the short version is that it found the
    // Previous/Next phase buttons doing nothing at all — a defect that is
    // invisible to every other check here, because the data was correct and the
    // buttons were correctly rendered, labelled, enabled and focusable. Only
    // clicking them revealed that they had no effect.
    name: "every phase renders (browser, all 65)",
    cmd: "node",
    args: [join(HERE, "sweep-phases.mjs"), PREVIEW_URL],
    why: "The accessibility check covers six views, but data checks and sampled page checks cannot prove that every phase works. This walks all 65 phases across all 10 tracks, clicking through them the way a reader does, and asserts each renders its title, all six sections, a tappable checklist and a working quiz explanation. It found the Previous/Next buttons silently doing nothing — a defect no data check can see, because the data was right and the buttons were correctly rendered, labelled, enabled and focusable. Only clicking them revealed that they had no effect. Without it, one broken phase page can reach readers while every data check stays green",
  },
  {
    name: "mixed practice sets",
    cmd: "node",
    args: [join(HERE, "test-practice.mjs")],
    why: "the Practice view samples questions across phases and tracks, which no other check touches — and its first version crashed on render with React error #31 because it read the GENERATED question shape while the app is handed the NORMALISED one (options as {text, correct}, why renamed to explanation). The unit tests all passed, because they read the same JSON files the bug did: the tests agreed with the bug. This suite now builds its pool through the app's own shape and asserts the normaliser's source still matches, so the two cannot drift apart silently again",
  },
  {
    name: "section exams (scoring and pass marks)",
    cmd: "node",
    args: [join(HERE, "test-exam.mjs")],
    why: "this is the only code in the project that produces a number a reader is judged by, so it is tested harder than anything else here. The dangerous failure is not a crash — it is a WRONG SCORE that still looks plausible: shuffle the options without carrying the answer index and every question is marked against the wrong option, producing a believable mark and a confident, incorrect verdict. Also asserted: score arithmetic for every possible count, the exact pass boundary, that unanswered counts as wrong rather than being excluded, and that a backup restore does not silently discard a pass",
  },
  {
    name: "reachability (nothing is dead)",
    cmd: "node",
    args: [join(HERE, "check-reachability.mjs")],
    why: "fourteen modules once sat in src/ with no path from main.jsx — 1,740 lines, 71 KB — and every other check read them happily, because audit-projections walks the tree and therefore MENTIONS them, which looks like coverage in a grep. The documentation justified keeping them by calling them 'tested pure modules', which was false: no test file imported any of them, and no guard could falsify the claim because nothing tested them. This walks reachability from the entry point and fails if anything becomes unreachable, so the dead set cannot silently grow back. A module nothing can reach is either a mistake or a feature nobody finished, and both deserve to stop the build",
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

if (!failed) {
  console.log(`\n✓ all ${STEPS.length} checks passed (browser-dependent checks pass or explicitly skip)`);
}

process.exit(failed ? 1 : 0);
