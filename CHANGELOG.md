# Changelog

This project was built in a small number of very long sessions, so a date-based changelog
would be useless — nearly every commit shares a date. It is organised by **what changed and
why**, newest first.

The full commit history is the authoritative record: `git log --oneline`.

---

## Unreleased

### Guards that stated a rule they did not enforce

- **Quiz `energy` is now required.** A quiz heading written without `energy:` built cleanly and
  shipped as `null`. The check read `if (energy && …)` — it validated an energy that was
  *present* and said nothing about one that was *absent*. A missing energy is worse than an
  invalid one: the time-budget picker selects by energy, so a `null` question is simply never
  offered. Silent exclusion, not loud failure.
- **All 14 phase sections are enforced, in order.** `AGENTS.md` claimed "a guard checks
  ordering positionally". Nothing compared section order to anything, and
  `## Specific topics to learn` and `## Common Pitfalls` were in no guard list at all — so
  renaming one to `## CommonPitfalls` passed every check. An unrecognised `##` heading is not
  a parser error; it is silently absorbed as body text. The build now reports a **near-miss**
  as a spelling problem ("spelled X, contract requires Y") rather than a bare "missing",
  because a typo and an omission need different fixes.
- **A guard's own docstring was false.** `audit-quiz.mjs` opened by claiming it checks "a valid
  energy". The string `energy` appeared in that file exactly once — in that comment.

### Defects found by rendering the app rather than by any check

- **The site was rendering completely unstyled.** `global.css` was 3634 lines and styled 344
  classes but was missing **every top-level layout class**: `.main`, `.topbar`, `.skip`,
  `.footer`, `.phasegrid`, `.statgrid`, `.toolgrid`, `.breadcrumb` and ~33 more. The topbar
  collapsed into a raw row, the stat block drew as a vertical list, cards stacked full-width.
  **Every content check stayed green**, because a missing CSS rule changes no text and breaks
  no JSON field. Root cause: the stylesheet was written against a different DOM shape — it
  defines `.app-shell` and hyphenated `.phase-grid`/`.stat-grid`, while the components render
  `.phasegrid`/`.statgrid` and no shell at all.
- **The Tools library never worked.** It rendered *"0 tools across 10 written tracks"* while
  the corpus held 433 tool rows. It read the **light** projection, whose phases carry the
  *ids* of their checklist/tasks/quiz and deliberately no tools, so `phase.tools` was
  `undefined` and `|| []` made it an empty list.
- **40 tool cards linked to nowhere.** The hand-authored tables use an em dash for "no URL",
  and that dash was passed through as data — so `tool.url` was the literal string `"—"`, which
  a `tool.url &&` guard accepts as truthy. Placeholder dashes are now normalised at the parse
  boundary.
- **A malformed CSS declaration** (`color: var(--text);g-subtle);`) survived a build and a
  guard run, because a malformed declaration is not a missing class.

### Guards added

Five offline checks became **eleven**, with **315 unit-test assertions**.

| Guard | Catches |
|---|---|
| `audit-css.mjs` | a class used in JSX with no CSS rule; an undefined token |
| `audit-projections.mjs` | a component reading a field absent from the projection it imports |
| `test-render-inline.mjs` | 38 assertions on inline markdown (incl. all 195 authored strings) |
| `test-quiz.mjs` | 58 assertions, incl. all 549 questions |
| `test-lesson-blocks.mjs` | 39 assertions on renderer coverage |
| `test-search.mjs` | 180 assertions over 6,007 real search hits |

Every new test was **proved capable of failing** by deliberate mutation (dropping a `case` from
`LessonBlock.jsx`, no-op'ing `maskCodeSpans`, breaking 1-based quiz numbering, flipping the
search ranking, adding `phase.tools` to `PhaseCard.jsx`), then restored byte-identical.

No test framework and no new dependency: JSX is transformed in memory with **esbuild** (already
on disk as a Vite dependency) and rendered via `react-dom/server`.

### The encoding guard was checking less than it appeared to

Coverage was decided by file **extension**, so `.gitignore`, `.editorconfig` and
`.github/workflows/*.yml` were never opened. A stray CR reached `.gitignore` and **git itself
warned on push** while the guard reported "all clean" — because it had never read the file.
Files scanned: 190 → 205.

This is the **third** instance of the same lesson: a guard's blind spot is exactly as wide as
the selector it uses to find its input.

### Documentation

- `SETUP.md`, `TROUBLESHOOTING.md` — the silent traps: the stale generated bundle, the
  `VITE_BASE` blank page, the IPv6 `localhost` binding, the write-API encoding trap, and the
  console-mojibake false alarm.
- Corrected stale claims in `README.md` ("gaps" that were already closed), `AGENTS.md`
  (two false statements about what the build enforces), `HANDOVER.md` (§6 and §13 describing
  work as owed that was done) and `DECISIONS.md` D-008 (said four dead hooks; it is two).

### Deploy

- `.github/workflows/pages.yml` and `ci.yml`. Both green on first run. Live at
  **https://markkramm.github.io/vibecoding/**. The integrity gate runs **before** any install
  step, so a broken content file fails fast.

---

## Earlier — the curriculum

- **65 phases across 10 tracks**, **35,383 lines** of authored Markdown across 89 files
  (32,970 in the 65 phase files, 2,413 in the per-track overviews, master checklists and
  shared reference documents), 549 quiz questions, 886 practice tasks, 1054 checklist items.
- Tracks: Foundations (8), Model Internals (6), Prompting (7), RAG (7), Agents (7),
  Fine-tuning (6), Cost & Efficiency (7), Vibecoding Craft (8), Safety & Career (5),
  Career & Getting Hired (4), plus shared reference documents.
- Every phase follows a **14-section contract**, machine-verified: fixed section order and
  spelling, authored stable ids (`band`/`energy`), exactly four quiz options with exactly one
  correct, spread answer positions, and a `**Why:**` line.
- Content guards: `build-content.mjs --check`, `audit-quiz.mjs`, `audit-lesson-ast.mjs`
  (0 character loss), `audit-arithmetic.mjs`, `audit-shapes.mjs`, `test-cost-tone.mjs`.
- Provider URLs migrated: `platform.openai.com` 43→1, `docs.claude.com` 21→0.

---

## A note on how this changelog is written

Entries describe **what was wrong**, not just what was added, because most of the interesting
work here was finding that something already believed to be working was not. Three separate
guards were described as enforcing rules they did not enforce, and the site shipped a
completely unstyled page with a fully green test suite.

`HANDOVER.md` §12 carries the full list of mistakes made along the way, deliberately. A project
that teaches verification should be candid about its own.
