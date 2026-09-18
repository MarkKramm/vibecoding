// audit-projections.mjs — a field read off the light projection must exist in it.
//
// WHY THIS EXISTS
// ---------------
// The build emits the curriculum TWICE from one parse (see DECISIONS.md -> D-002):
//
//   src/data/generated/index.json     the LIGHT projection, imported EAGERLY
//   src/data/generated/<track>.json   the FULL projection, imported LAZILY
//
// The light phase record carries exactly eleven fields — id, order, phase, title,
// duration, durationWeeks, goal, lessonWordCount, checklistIds, taskIds, quizIds —
// and no tools, resources, prose, or checklist/task/quiz OBJECTS. It carries those
// items' IDS, not their text.
//
// That is deliberate: the dashboard must not pull 1.3 MB of prose into the entry
// chunk to draw a card. It is also fragile in a way nothing saw. A component that
// reads a field the light projection does not carry does not throw. It gets
// `undefined`; `phase.tools || []` turns that into an empty list; and the page
// then states something confident and false:
//
//   The Tools library shipped reading `phase.tools` off `tracks` (the light
//   projection) and told the reader "0 tools across 10 written tracks" while the
//   corpus held 433 tool rows. It then showed "No tools match that filter",
//   which reads as a filter miss rather than as missing data.
//
// Every guard in this suite stayed green. audit-shapes checks that `tools` is an
// array of objects — in the FULL projection, where it is one. The tools-table
// contract check passes. The content build passes. The defect lived in the SEAM
// between two projections of the same data, and nothing looked at the seam.
//
// WHAT IT DOES, AND WHY THIS MECHANISM
// ------------------------------------
// It walks the site's real static import graph from src/main.jsx, finds every
// module that can reach generated/index.json, extracts every STATICALLY WRITTEN
// property access on a phase or track binding in those modules, and asserts each
// name is a field the light projection actually carries.
//
// Two alternatives were considered and rejected, and the rejection is the reason
// this mechanism was chosen:
//
//   * An expected field-set per projection, asserted against index.json. This
//     cannot catch defect 1 at all. The light projection's field list was — and
//     still is — exactly as intended; it was the CONSUMER that was wrong. That
//     assertion passes on the day the page renders "0 tools". It also cannot
//     catch defect 2 (the em-dash href), which is a present-but-meaningless
//     VALUE, not a missing field. It would have been a tautology with a report.
//
//   * Free alias matching on `p.` / `t.` / `phase.`. Tried first, and it produced
//     seven false positives in this codebase alone, because `t` and `p` are also
//     loop variables over DERIVED records: `const { track, checklistDone } =
//     perTrack` in Dashboard.jsx, `t.track.id` over the `started` array, `p.id`
//     in a `flatMap` over `allPhaseSummaries()`. A guard with a 100% false
//     positive rate is deleted within a week, and correctly so.
//
// So the check is anchored to the ONE binding that provably holds a light record:
// the `phases` array in src/data/roadmaps.js, which is `index.tracks[].phases`
// verbatim. Its elements are passed to a component as a prop named `phase` (via
// PhaseCard), and to helpers as parameters named `phase` / `p` / `ph`. Those
// bindings are enumerated in PHASE_BINDINGS with the reason each one is safe, and
// the enumeration is short enough to read and audit. Everything else is ignored,
// which is what keeps the false-positive rate at zero.
//
// WHAT IT CANNOT CATCH — read this before trusting it
// ---------------------------------------------------
//   1. Defect 2 in ANY form. An em dash reaching an `href`, a present-but-empty
//      `tools` array, a sentinel string passed through as data. This guard is
//      about field EXISTENCE. Nothing here would have caught `<a href="\u2014">`.
//   2. Access through a binding this guard does not enumerate. `phase[field]`, a
//      destructure it does not recognise, or a phase read by a name not listed in
//      PHASE_BINDINGS. A module that reads light phases only through such a name
//      is reported in the "no static access seen" list at the end of a run, so
//      silence is never presented as approval — but it is not checked.
//   3. The ported sibling-project modules in src/lib (pace.js, today.js,
//      review.js, pathOrder.js, yourWork.js, transfer.js). All six read phases;
//      none is imported by anything in this app; the graph walk proves it and
//      prints them every run. They cannot be checked against a projection
//      because no caller passes them one. Three of them additionally read
//      `phase.checklist` and `phase.tasks` — light-illegal names — but since they
//      are dead code and have no projection assignment, they are reported as dead
//      rather than counted as violations. THIS IS A CHECKED LIST, NOT AN
//      ALLOWLIST: the day any of them is imported again it enters the light
//      closure automatically, its fields are matched, and it is checked.
//   4. Whether a field is USED correctly once found. `phase.title.slice(0, 3)` is
//      not this guard's business.
//   5. A field the light projection SHOULD carry but does not, that nothing reads
//      yet. "The light index ought to include X" is a design question, not a
//      mechanical one.
//
// NAMES THAT EXIST IN BOTH PROJECTIONS AND ARE STILL WRONG ON A LIGHT PHASE
// -------------------------------------------------------------------------
// `tasks`, `checklist` and `quiz` are real fields — of the FULL projection, as
// arrays of objects. On a light phase they are `undefined`, so
// `(phase.checklist || []).length` is 0 and a progress ring reports that the
// reader has finished nothing. That is the shipped defect's exact shape, so those
// three names are rejected explicitly (PHASE_NEVER_IN_LIGHT) even though no live
// module currently reads them. An explicit rule for a known-wrong name is not a
// tautology: it fails the moment someone writes the access.
//
// Run: node scripts/audit-projections.mjs

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath rather than `new URL(...).pathname` — see scripts/check-all.mjs.
const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..");
const SRC = join(SITE, "src");
const GEN = join(SRC, "data", "generated");
const INDEX = join(GEN, "index.json");
const ENTRY = join(SRC, "main.jsx");

// The one module that imports the light projection. Named here so that a rename
// breaks this guard loudly instead of turning it into a check that finds nothing.
const LIGHT_IMPORTER = "data/roadmaps.js";

// ---------------------------------------------------------------------------
// The bindings that provably hold a LIGHT phase record.
// ---------------------------------------------------------------------------
// Each entry is a name plus the reason it is safe to match. This list is the
// guard's whole precision story: a name is here only because a light record is
// known to flow into it, and every claim below was checked against the codebase
// rather than assumed. Adding a name WIDENS what is checked (more chances to
// fail); removing one NARROWS it (more chances to miss). Both are reviewable.
//
// Kept deliberately SHORT. An earlier draft also matched `summary` (for App.jsx's
// light-index lookup), and that name turned out to be a local quiz result in
// Quiz.jsx and a summary array in lib/transfer.js — two false positives from one
// guessed name. A name earns its place here only if a light record demonstrably
// reaches it, and App.jsx's `summary` is checked through its `phase`-shaped
// reads instead.
const PHASE_BINDINGS = new Map([
  // The canonical one. `phases` in roadmaps.js is `t.phases` from index.json,
  // unmodified — the very array this guard is guarding — and PhaseCard receives
  // its elements as the prop `phase`.
  ["phase", "the `phase` prop / parameter downstream of track.phases"],
  // `p` inside Dashboard.jsx's `t.phases.map((p) => ...)` (LIGHT) and
  // ToolsLibrary's `(r.phases || []).map((p) => ...)` (FULL — exempted below),
  // plus `p` in roadmaps.js's own reducers over `allPhaseSummaries()`.
  ["p", "the short loop binding used over track.phases in this codebase"],
  // roadmaps.js's `t.phases.find((ph) => ph.id === ...)`.
  ["ph", "the loop binding in roadmaps.js's phase lookups"],
]);

// ---------------------------------------------------------------------------
// Exemptions. Three, each with its reason, each narrow enough to verify by hand
// in under a minute — which is the test an exemption has to pass.
// ---------------------------------------------------------------------------
// (a) A module whose PHASE data comes from the full projection even though it is
//     in the light closure.
//
//     This list is the guard's ONE real judgement call, and it is deliberately
//     short. Every entry says why, and every entry is a module that reaches the
//     light importer in the graph but whose `phase` binding is filled from a
//     lazily loaded full track file. Getting this list WRONG in the permissive
//     direction is how a guard goes blind, so each entry below names the line
//     that supplies its phases, and the summary prints the list on every run.
const FULL_DATA_PHASES = new Map([
  [
    "pages/ToolsLibrary.jsx",
    "loads every track's FULL phases via loadTrackPhases(); imports `tracks` " +
      "from the light projection for the track list only",
  ],
  [
    "pages/PhaseDetail.jsx",
    "receives `phase` from App.jsx's `detail.phase`, which comes from " +
      "usePhaseDetail -> loadTrackPhases() -> the FULL track file",
  ],
  [
    "hooks/useLesson.js",
    "takes the FULL phase as its argument so it can read `lessonPath`",
  ],
  [
    "lib/transfer.js",
    "exports a transfer/summary helper over FULL phases; called with " +
      "`detail.phase`, never with a light record",
  ],
  [
    "lib/practice.js",
    "takes FULL phases: its whole purpose is to collect `phase.quiz` across " +
      "phases, and the light projection carries only `quizIds` (ids without " +
      "questions), so a light record could not build a practice set at all. Fed by " +
      "pages/Practice.jsx -> loadTrackPhases() -> the FULL track file",
  ],
  [
    "lib/exam.js",
    "takes the pooled questions from lib/practice.js, which are FULL-data — an " +
      "exam needs the question text, the options and the answer, none of which the " +
      "light projection carries. Fed by pages/Exam.jsx -> loadTrackPhases()",
  ],
  // The ported sibling-project modules. They are dead code today (see
  // DEAD_EXPECTED), and they read `phase.checklist` / `phase.tasks` / `phase.quiz`
  // — full-only names — so if they were ever wired to the light index this guard
  // must FAIL. They are therefore NOT in FULL_DATA_PHASES, and they are not
  // treated as dead-and-excused either: they are checked against the light field
  // set, and the violations below are reported as DEAD CODE NOTES rather than as
  // build failures. That distinction is the point — see the report section.
]);

// Modules that are known dead, whose light-illegal accesses are reported but do
// not fail the run, because no caller passes them a projection at all. Making
// them fatal would fail every build in the repository for code nothing runs;
// silencing them would hide the fact that they would break if revived. So they
// are printed, counted, and explicitly labelled.
const DEAD_NOTE_ONLY = new Set(["lib/review.js", "lib/today.js"]);

// (b) A single FUNCTION in roadmaps.js whose `phase` parameter is a full record.
//
//     `normalisePhase(phase)` is the ONLY function in the site named `phase`
//     that does not take a light record, and it is called exactly once — at
//     roadmaps.js line 151, `(data.phases || []).map(normalisePhase)` — on the
//     payload of a lazily imported generated/<track>.json. `phase.quiz` there is
//     correct, and it is precisely the adapter that makes the FULL shape legal for
//     every component downstream.
//
//     Exempting the function rather than the file matters: a `phase.tools` added
//     anywhere ELSE in roadmaps.js is still reported, and roadmaps.js is one of
//     the two files most likely to grow a light-projection read (the other being
//     App.jsx). Verified by grep during construction: `normalisePhase` has one
//     call site, and it is the full-data one.
const FULL_DATA_FUNCTIONS = [
  { file: "data/roadmaps.js", name: "normalisePhase", line: 109, span: 8 },
];

// Models under src/ that no import path from src/main.jsx reaches. This is NOT a
// suppression list — nothing here is excused from checking. It exists so the
// report can say which ported modules are dead, and so the graph walk has a
// named place to look when one of them comes back to life.
const DEAD_EXPECTED = new Set([
  "components/EmptyState.jsx",
  "components/EnergyModeSelector.jsx",
  "components/ReviewQueue.jsx",
  "components/TimeBudgetSelector.jsx",
  "hooks/useApplications.js",
  "hooks/useCertifications.js",
  "hooks/usePortfolio.js",
  "hooks/useSchedule.js",
  "lib/highlight.js",
  "lib/pace.js",
  "lib/pathOrder.js",
  "lib/review.js",
  "lib/today.js",
  "lib/yourWork.js",
]);

// Names that are real in the FULL projection and are always a bug on a light
// phase, because the light projection replaced them with an ID array.
const PHASE_NEVER_IN_LIGHT = {
  tasks: "the light projection carries `taskIds` (strings); `tasks` (objects) is full-only",
  checklist: "the light projection carries `checklistIds`; `checklist` (objects) is full-only",
  quiz: "the light projection carries `quizIds`; `quiz` (objects) is full-only",
  // The remaining full-only fields, listed so a violation message can name the
  // right remedy rather than only reporting an unknown name.
  tools: "tools live only in the full track file; load it with loadTrackPhases()",
  resources: "resources live only in the full track file",
  skills: "skills live only in the full track file",
  topics: "topics live only in the full track file",
  freeVsPaid: "freeVsPaid lives only in the full track file",
  deliverableItems: "deliverableItems live only in the full track file",
  exitCriteria: "exitCriteria lives only in the full track file",
  lessonPath: "lessonPath lives only in the full track file",
  energyMix: "energyMix lives only in the full track file",
  sourcePath: "sourcePath is build provenance; it is in no projection the site reads",
};

// Properties that follow a phase binding but are methods or props, not fields.
// Everything a phase binding's `.` can legitimately reach besides a light field.
// Small on purpose: if this list grows, the guard is drifting.
const NOT_A_FIELD = new Set([
  "id", // a light field, but also an extremely common local; harmless either way
  "map",
  "filter",
  "find",
  "findIndex",
  "some",
  "every",
  "flatMap",
  "reduce",
  "forEach",
  "slice",
  "join",
  "split",
  "replace",
  "trim",
  "includes",
  "sort",
  "concat",
  "length",
  "keys",
  "values",
  "entries",
  "toLowerCase",
  "toString",
  "onOpen",
  "onOpenPhase",
  "onToggle",
  "onClick",
  "onBack",
  "onVisitSection",
  "trackId",
  "trackLabel",
  "done",
  "total",
  "index",
  "error",
  "status",
  "type",
  "value",
]);

const SCAN_EXT = /\.(js|jsx)$/;

// ---------------------------------------------------------------------------
// 0. Provenance. The generated directory is git-ignored, so it may simply not be
//    there. Fail with the command to run — never pass because the input is
//    missing.
// ---------------------------------------------------------------------------
if (!existsSync(INDEX)) {
  console.error(
    "\n\u2716 cannot run \u2014 src/data/generated/index.json is missing.\n" +
      "  That directory is git-ignored, so a fresh clone must build it first:\n" +
      "    node scripts/build-content.mjs      (from the repo root)\n" +
      "    npm run build:content               (from learning-site/)\n"
  );
  process.exit(1);
}
if (!existsSync(ENTRY)) {
  console.error(`\n\u2716 app entry src/main.jsx not found \u2014 cannot build the import graph.`);
  process.exit(1);
}

const light = JSON.parse(readFileSync(INDEX, "utf8"));

// ---------------------------------------------------------------------------
// 1. The light projection's ACTUAL field set, READ from the artifact.
// ---------------------------------------------------------------------------
// Read, not hardcoded, and this is the detail that keeps the guard honest: a
// hardcoded copy of the light shape is a second source of truth that drifts from
// scripts/build-content.mjs's indexFor(). If the two disagree, a hardcoded guard
// either misses a real violation (the emitted field was dropped from the list) or
// fails a correct build (a field was added in the build and not in the list),
// and the second one is how guards get disabled.
//
// Reading index.json inverts that. The build adds `resources` to the light
// projection tomorrow and this guard accepts `phase.resources` the same day; the
// build drops `durationWeeks` and this guard starts failing every reader of it.
// The one thing the read cannot do is notice a field the light projection was
// SUPPOSED to carry and does not — that is a design question, listed under
// WHAT IT CANNOT CATCH above.
const phaseKeys = new Set();
const trackKeys = new Set();
let phaseCount = 0;
let tracksWithPhases = 0;

for (const t of light.tracks || []) {
  for (const k of Object.keys(t)) trackKeys.add(k);
  const phases = t.phases || [];
  if (phases.length) tracksWithPhases++;
  for (const p of phases) {
    phaseCount++;
    for (const k of Object.keys(p)) phaseKeys.add(k);
  }
}

if (phaseCount === 0 || phaseKeys.size === 0) {
  console.error(
    "\n\u2716 index.json carries 0 phases \u2014 there is nothing to check against.\n" +
      "  Rebuild: node scripts/build-content.mjs"
  );
  process.exit(1);
}

const LIGHT_PHASE = [...phaseKeys].sort();
const LIGHT_TRACK = [...trackKeys].sort();

// ---------------------------------------------------------------------------
// 2. The static import graph, from the app entry.
// ---------------------------------------------------------------------------
// Static `import ... from "..."` only. `import.meta.glob("./generated/*.json")`
// in roadmaps.js is deliberately NOT followed: that glob is the lazy FULL-track
// loader, and following it would fold both projections together — the exact
// confusion this guard exists to prevent. The loadTrackPhases call sites are
// handled by FULL_DATA_PHASES instead, which is a judgement a glob cannot make.

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Site-relative, forward-slashed — the form every report and key uses. */
const rel = (abs) => relative(SRC, abs).split("\\").join("/");

const allFiles = walk(SRC).filter((f) => SCAN_EXT.test(f));
const sources = new Map();
const staticImports = new Map();

for (const file of allFiles) {
  const source = readFileSync(file, "utf8");
  const key = rel(file);
  sources.set(key, source);

  const deps = [];
  const re = /import\s[^;]*?from\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    if (!m[1].startsWith(".")) continue; // react, node:fs, ...
    const base = join(dirname(file), m[1]);
    for (const cand of [base, `${base}.js`, `${base}.jsx`, join(base, "index.js")]) {
      if (existsSync(cand) && statSync(cand).isFile()) {
        deps.push(rel(cand));
        break;
      }
    }
  }
  staticImports.set(key, deps);
}

const reachable = new Set();
{
  const stack = [rel(ENTRY)];
  while (stack.length) {
    const node = stack.pop();
    if (reachable.has(node)) continue;
    reachable.add(node);
    for (const dep of staticImports.get(node) || []) stack.push(dep);
  }
}

const dead = [...staticImports.keys()].filter((f) => !reachable.has(f)).sort();

// ---------------------------------------------------------------------------
// 3. Which modules can reach the light projection.
// ---------------------------------------------------------------------------
// "Directly" is not enough, and the shipped defect proves it: ToolsLibrary.jsx
// never mentions index.json — it imports roadmaps.js, one hop away.
//
// The closure walks in BOTH directions, and the second direction is not optional.
// Walking only towards the importers (who imports roadmaps.js?) found App,
// Dashboard, Search, ToolsLibrary and usePhaseDetail — and MISSED PhaseCard.jsx,
// which is where a light phase actually lands:
//
//   Dashboard.jsx  <p.phases.map((p) => <PhaseCard phase={p} .../>)>
//   PhaseCard.jsx  <phase.title / phase.goal / phase.tools>
//
// PhaseCard is a DEPENDENCY of Dashboard, not a dependent of roadmaps.js, so the
// importers-only walk never reached it. That was caught by this guard's own
// negative control — an added `phase.tools` in PhaseCard.jsx passed silently —
// and it is the single most important line in this file, because a child
// component reading a field off a phase prop is the shipped bug's exact shape.
// A component that receives a light record is holding a light record; the module
// graph, not the import statement, is what decides.
//
// The walk therefore starts from the light importer and follows BOTH edges —
// everything that can reach a module holding light records, and everything such
// a module can reach. That is a bounded, closed set: it is the light importer's
// whole connected component inside src/.

const lightImporters = [...staticImports.keys()].filter((f) =>
  /from\s*["'][^"']*generated\/index\.json["']/.test(sources.get(f))
);

if (lightImporters.length !== 1 || lightImporters[0] !== LIGHT_IMPORTER) {
  console.error(
    `\n\u2716 expected exactly one module to import generated/index.json ` +
      `(${LIGHT_IMPORTER}); found: ${lightImporters.join(", ") || "none"}.\n` +
      "  The light projection moved. Update LIGHT_IMPORTER here so this check\n" +
      "  keeps guarding the right module instead of silently guarding nothing."
  );
  process.exit(1);
}

const lightModules = new Set();
{
  const byDependent = new Map();
  for (const [file, deps] of staticImports) {
    for (const d of deps) {
      if (!byDependent.has(d)) byDependent.set(d, []);
      byDependent.get(d).push(file);
    }
  }
  const queue = [LIGHT_IMPORTER];
  const seen = new Set(queue);
  while (queue.length) {
    const node = queue.shift();
    lightModules.add(node);
    const neighbours = [
      ...(byDependent.get(node) || []), // who imports this
      ...(staticImports.get(node) || []), // what this imports
    ];
    for (const neighbour of neighbours) {
      // Only modules this guard actually scans. The graph resolves .js/.jsx and
      // nothing else, but a defensive filter here costs nothing and keeps a
      // future .json or .css import from entering a set that is read as source.
      if (!sources.has(neighbour)) continue;
      if (seen.has(neighbour)) continue;
      seen.add(neighbour);
      queue.push(neighbour);
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Every statically written access on a light-phase binding.
// ---------------------------------------------------------------------------
// The regex is anchored to the enumerated bindings and requires a `.` between the
// binding and the name, so `phaseTitle` and `trackLabel` — real locals, and the
// names that produced the false positives in the alias-based first attempt — are
// never matched. Comments and strings are NOT stripped, so a comment that writes
// `phase.tools` is reported too. That is intentional and was tested: the shipped
// defect is documented in a comment in ToolsLibrary.jsx, and a guard that reads
// its own documentation as an assertion is a guard whose negative control cannot
// be written.

const problems = [];
const deadNotes = [];
const checked = [];
const seenNoAccess = [];

const bindings = [...PHASE_BINDINGS.keys()];
const accessRe = new RegExp(
  `(?:^|[^\\w$.])(${bindings.join("|")})\\.([A-Za-z_$][\\w$]*)`,
  "g"
);
// `const { id, title, goal } = phase` — destructuring is a real access that a
// `.`-based regex cannot see, and it is how a phase is most often consumed.
const destructureRe = new RegExp(
  `(?:const|let|var)\\s*\\{([^}]*)\\}\\s*=\\s*(${bindings.join("|")})\\b`,
  "g"
);

/** 1-based line number of a match index in `source`. */
const lineAt = (source, index) => source.slice(0, index).split("\n").length;

/**
 * Blank out comments while preserving offsets and line numbers.
 *
 * WHY THIS EXISTS. Without it the guard reads PROSE. A comment in PhaseCard.jsx
 * explaining the Tools-library defect — "`phase.tools` off the light projection"
 * — was reported as a violation of that same defect, and failed `npm test`
 * before the component tests could even run.
 *
 * The fix is not to reword the comment. A guard that punishes accurate
 * documentation of a bug is worse than no guard, because the rational response
 * is to stop documenting bugs, and this codebase's comments are a substantial
 * part of its value. So the guard reads CODE, not prose.
 *
 * Every comment character is replaced by a SPACE rather than deleted, so that
 * (a) `m.index` still maps to the original line via `lineAt`, and (b) two tokens
 * separated by a comment cannot be joined into a false match.
 *
 * String and template literals are tracked so that `//` inside a URL like
 * `"https://…"` is not mistaken for a comment — which would blank the rest of
 * the line and could hide a real access after it.
 */
function stripComments(source) {
  let out = "";
  let i = 0;
  const n = source.length;

  while (i < n) {
    const c = source[i];
    const next = source[i + 1];

    // Line comment.
    if (c === "/" && next === "/") {
      while (i < n && source[i] !== "\n") {
        out += " ";
        i += 1;
      }
      continue;
    }

    // Block comment — newlines preserved so line numbers stay correct.
    if (c === "/" && next === "*") {
      out += "  ";
      i += 2;
      while (i < n && !(source[i] === "*" && source[i + 1] === "/")) {
        out += source[i] === "\n" ? "\n" : " ";
        i += 1;
      }
      if (i < n) {
        out += "  ";
        i += 2;
      }
      continue;
    }

    // String / template literal — copied verbatim so its contents are not
    // parsed as code or as a comment.
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      out += c;
      i += 1;
      while (i < n) {
        if (source[i] === "\\") {
          out += source[i] + (source[i + 1] ?? "");
          i += 2;
          continue;
        }
        out += source[i];
        if (source[i] === quote) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }

    out += c;
    i += 1;
  }

  return out;
}

for (const file of [...lightModules].sort()) {
  if (FULL_DATA_PHASES.has(file)) {
    checked.push({ file, note: FULL_DATA_PHASES.get(file), exempt: true });
    continue;
  }

  const source = sources.get(file);
  const lines = source.split("\n");

  // Scan CODE, not prose. Comments are blanked to spaces so `lineAt` still maps
  // to the right line, but a comment mentioning `phase.tools` — which is how a
  // reader is told about the defect this guard exists to catch — is not itself
  // reported as the defect. See stripComments() for why this is the fix rather
  // than rewording the comment.
  const code = stripComments(source);

  // The line ranges of functions whose `phase` parameter is a FULL record. An
  // access on one of these lines is not an access on a light record.
  const exemptSpans = FULL_DATA_FUNCTIONS.filter((f) => f.file === file).map((f) => ({
    from: f.line,
    to: f.line + f.span,
    why: `${f.name}() takes a FULL phase record`,
  }));
  const spanFor = (line) => exemptSpans.find((s) => line >= s.from && line <= s.to) || null;

  // A line is also skipped when it NAMES the exempt full-data function, because
  // the call itself (`map(normalisePhase)`) reads no field.
  const namesExemptFn = (line) =>
    FULL_DATA_FUNCTIONS.some((f) => f.file === file && lines[line - 1].includes(f.name));

  const found = new Map(); // field -> where it was written
  const exemptedHits = [];

  let m;
  while ((m = accessRe.exec(code)) !== null) {
    const line = lineAt(code, m.index);
    const where = `${m[1]}.${m[2]} on line ${line}`;
    const span = spanFor(line);
    if (span) {
      exemptedHits.push(`${where} (${span.why})`);
      continue;
    }
    if (!found.has(m[2])) found.set(m[2], where);
  }
  while ((m = destructureRe.exec(code)) !== null) {
    const line = lineAt(code, m.index);
    if (spanFor(line) || namesExemptFn(line)) continue;
    for (const part of m[1].split(",")) {
      const name = part.split(":")[0].trim();
      if (!/^[A-Za-z_$][\w$]*$/.test(name)) continue;
      if (!found.has(name)) found.set(name, `{ ${name} } = ${m[2]} on line ${line}`);
    }
  }

  checked.push({
    file,
    note: `${found.size} field access(es)` +
      (exemptedHits.length ? `, ${exemptedHits.length} exempted` : ""),
    exempt: false,
    exemptedHits,
  });
  if (found.size === 0 && exemptedHits.length === 0) {
    seenNoAccess.push(file);
    continue;
  }

  for (const [field, where] of [...found].sort()) {
    if (phaseKeys.has(field)) continue; // present in the light projection. Fine.
    if (NOT_A_FIELD.has(field)) continue; // a method or a prop, not a field.
    const why =
      PHASE_NEVER_IN_LIGHT[field] ||
      `the light projection carries: ${LIGHT_PHASE.join(", ")}`;
    const message = `${file}: ${where} \u2014 ${field} is NOT in the light projection. ${why}`;
    // A module that is provably dead has no projection at all, so its accesses
    // are a note about what would break if it were revived — not a build failure.
    if (DEAD_NOTE_ONLY.has(file)) deadNotes.push(message);
    else problems.push(message);
  }
}

// A DEAD_NOTE_ONLY module that is no longer dead is a failure, not a note: the
// moment something imports it, its `phase.checklist` becomes a live read and the
// excuse for not failing evaporates.
//
// DELETED IS A THIRD STATE, and this guard used to confuse it with REVIVED.
// `dead` is computed by walking reachability over the files that EXIST; once the
// ported-but-unreachable modules were deleted outright (D-008, resolved), they
// stopped appearing in `dead` — and this loop reported every one of them as
// "reachable again", which is the opposite of what happened. The check below asks
// whether the file is still on disk first, so a deletion reads as a deletion.
//
// The distinction is worth keeping rather than dropping the loop: an import of one
// of these files reappearing is a real event that must fail the build, and that can
// only happen if the file exists.
for (const file of [...DEAD_NOTE_ONLY].sort()) {
  const onDisk = existsSync(join(SRC, file));
  if (!onDisk) continue; // deleted outright — nothing to excuse and nothing to read.
  if (!dead.includes(file)) {
    problems.push(
      `${file}: listed in DEAD_NOTE_ONLY but is now reachable. ` +
        "Its full-only phase accesses are live again — either fix it or, if it " +
        "genuinely takes full phases, move it to FULL_DATA_PHASES with a reason."
    );
  }
}

// ---------------------------------------------------------------------------
// 5. Report.
// ---------------------------------------------------------------------------

console.log(
  `light projection (generated/index.json): ${phaseCount} phases across ` +
    `${tracksWithPhases} written track(s) of ${(light.tracks || []).length}`
);
console.log(`  phase fields: ${LIGHT_PHASE.join(", ")}`);
console.log(`  track fields: ${LIGHT_TRACK.join(", ")}`);

console.log(`\n${lightModules.size} module(s) can reach ${LIGHT_IMPORTER}:`);
let totalAccesses = 0;
for (const { file, note, exempt, exemptedHits } of checked) {
  console.log(`  ${file}${exempt ? "  \u2014 EXEMPT" : ""}`);
  console.log(`      ${note}`);
  for (const hit of exemptedHits || []) console.log(`      NOT CHECKED: ${hit}`);
  if (!exempt) totalAccesses += Number(note.split(" ")[0]) || 0;
}

if (dead.length) {
  console.log(
    `\n${dead.length} module(s) under src/ are unreachable from src/main.jsx, so no`
  );
  console.log("projection reaches them. Checked against DEAD_EXPECTED in this guard:");
  for (const f of dead) {
    console.log(`  ${DEAD_EXPECTED.has(f) ? " " : "?"} ${f}`);
  }
  const unexpected = dead.filter((f) => !DEAD_EXPECTED.has(f));
  if (unexpected.length) {
    console.log(
      "\n  ? marks a module that is dead but was not expected to be. It is not a"
    );
    console.log(
      "  failure — but if it was meant to be wired in, it is silently unchecked."
    );
  }
  const revived = [...DEAD_EXPECTED].filter((f) => !dead.includes(f)).sort();
  if (revived.length) {
    console.log(
      `\n  ${revived.length} module(s) listed as dead are now REACHABLE and were`
    );
    console.log("  checked this run. Remove them from DEAD_EXPECTED:");
    for (const f of revived) console.log(`    ${f}`);
  }
}

if (seenNoAccess.length) {
  console.log(
    `\n${seenNoAccess.length} module(s) in the light closure wrote no phase field`
  );
  console.log(
    "access this guard can see. That is normal for a module that passes a phase"
  );
  console.log("straight through, and it is listed rather than counted as clean:");
  for (const f of seenNoAccess) console.log(`  ${f}`);
}

// Dead code that reads full-only names. Reported, never swallowed: a note that
// nothing prints is indistinguishable from a pass, which is the failure this
// whole file exists to prevent. These do NOT fail the run, because no caller
// passes them a projection — but they are the first place to look the day one of
// these modules is imported again, at which point the check above turns them into
// hard failures.
if (deadNotes.length) {
  console.log(
    `\n${deadNotes.length} NOTE(S) from dead code. Not failures \u2014 nothing calls`
  );
  console.log(
    "these modules, so no projection is passed to them. If one is revived, it"
  );
  console.log("fails the run instead:");
  for (const n of deadNotes) console.log(`  \u26a0 ${n}`);
}

if (problems.length) {
  console.log(`\n${problems.length} PROJECTION VIOLATION(S):\n`);
  for (const p of problems) console.log(`  \u2716 ${p}`);
  console.log(
    "\nA field read off a phase that the light projection does not carry is\n" +
      "`undefined` at runtime, and a `|| []` around it renders EMPTY rather than\n" +
      "MISSING \u2014 which is how the Tools library reported \"0 tools across 10 written\n" +
      "tracks\" with 433 tool rows in the corpus. Two remedies:\n" +
      "  * read the field from the full track file \u2014 loadTrackPhases() in\n" +
      "    src/data/roadmaps.js and the `status: loading | ready | empty | error`\n" +
      "    states that come with it; or\n" +
      "  * add the field to the light projection in scripts/build-content.mjs's\n" +
      "    indexFor(), and re-run the content build."
  );
  process.exit(1);
}

console.log(
  `\n\u2713 every one of the ${totalAccesses} phase field access(es) across ` +
    `${lightModules.size} light-closure module(s) exists in the light ` +
    `projection's ${phaseKeys.size} fields`
);
