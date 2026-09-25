# Changelog

This project was built in a small number of very long sessions, so a date-based changelog
would be useless — nearly every commit shares a date. It is organised by **what changed and
why**, newest first.

The full commit history is the authoritative record: `git log --oneline`.

---

## Unreleased

### Foundations gains a ninth phase: Multimodal and Vision

- **A topic-coverage sweep of all 65 phases found exactly one first-class capability with no
  phase.** Multimodal input was mentioned 7 times in the whole corpus, and only once
  substantively — a single subsection of `model-internals/06`. Every other apparent hole the
  sweep reported (FlashAttention, Mixture-of-Experts, jailbreaking, GraphRAG, PII) turned out to
  be **covered under different spelling**, which is the eighth time in this project that an
  implausible result was the instrument's fault rather than the corpus's.
- **New phase `foundations/09-phase-multimodal-and-vision.md`.** Mechanism-first, in the house
  style: patching and the lossy projection, why file size does not determine token cost while
  resolution does, predicting which visual tasks fail before testing them, screenshot-to-schema
  with a cross-field check, and the privacy duty that no technical mitigation covers. 17 practice
  tasks, 22 checklist items, 6 quiz questions, 9 tool rows.
- **Corpus is now 66 phases / 555 quiz questions / 903 practice tasks / 1,076 checklist items /
  442 tool rows**, across 91 Markdown files.
- **Four hardcoded corpus counts in the test suite were replaced with values read from the
  corpus.** `test-practice.mjs` asserted 549 questions and 65 phases, `test-exam.mjs` asserted
  549, and `test-components.mjs` asserted 433 tool rows. Adding one phase turned all four red for
  the one reason that is never a defect — the content grew — and each red test said nothing about
  the logic it guarded. They now assert the *property* (the pool is complete; the full projection
  carries rows the light one cannot; comprehensive mode covers the pool) with a floor that still
  fails on an empty corpus.
- **`docs/free-toolkit.md` drifted the moment the corpus changed, and the guard caught it.** The
  page written last session said 237 distinct tools; the corpus now said 243. This is the check
  working exactly as designed, and it is the only check in the suite that reads `docs/` at all.

### Every citation checked, and a guard that could not see its own blind spot

- **All 48 arXiv IDs verified against the arXiv Atom API — 48 correct, 0 wrong.** The failure
  mode this project was bitten by before (`2202.11903`, the Chain-of-Thought paper cited as an
  *astrophysics* paper) does not occur anywhere in the corpus. Two of the IDs looked most like
  fabrications and were both genuine: `2601.17548` (prompt injection in agentic coding
  assistants, Jan 2026) and `2406.10279` (package hallucinations, USENIX Security 2025), each
  independently corroborated down to its statistics. **"A recent ID is probably invented" is
  recorded as the wrong instinct** — fetch, do not discount on plausibility.
- **GitHub's documentation was recorded as un-fetchable and never was.** The log said three
  fetches returned only navigation and concluded that requests 8 and 9 were blocked "by any route
  we have". Appending `.md` to the article URL returns the full body, verified in both forms for
  the same page. The blocker sat on the books while a one-character fix went untried: *"this page
  truncates"* does not support *"this source is unreachable"*.
- **The Copilot training claim was confirmed and its scope corrected.** `2026-04-24` is right,
  but the corpus framed it as a free-tier cost. GitHub applies it to **Free, Pro, Pro+ and Max**,
  excluding only Business and Enterprise — the line is **individual-versus-business, not
  free-versus-paid**, so "I pay, therefore my code is not used" is false. Three phases corrected.
- **Six internal-consistency defects fixed, including a live duplicate of one already "fixed".**
  The earlier check grepped for `Prompting Phase 10`; the file also said *"Phase 10 of
  Prompting's framing"*, which that pattern cannot match — and the re-check searched for the same
  literal string and reported clean. **The fix reproduced the false confidence that created it.**
  Also fixed: two references to the wrong phase (resolving, but to the wrong subject), a reference
  past the end of a track, a concept attributed to a phase that never taught it, a 40-vs-41%
  disagreement inside one file, and **`README.md` claiming 63 phases when the corpus has held 65**.
- **A port collision that made browser checks read two websites at once.** Two `vite preview`
  servers can bind 4173 together; the sweep then failed all ten tracks while reporting "0 phase(s)
  with problems". The content was fine. Recorded in `WORKFLOW.md` as trap 3, with the rules:
  count the listeners, never kill a server you did not start, use a private port with
  `--strictPort`.
- **The exam feature from the previous session landed, with a data-loss bug found in review.**
  The backup merge for the rotating capstone rebuilt the record from `seenIds`/`best`/`attempts`
  and **dropped `comprehensive`**, so restoring a backup destroyed a passed comprehensive result
  silently. Every existing fixture used `comprehensive: { best: null }`, so no assertion read the
  dropped field. Seven assertions now cover it and were proved to fail for the right reason.

### The first person to open the live site found what eleven green checks had missed

- **325 authored items were rendering into an empty `<div>`.** The Reference view showed raw
  Markdown, and following that to the data found that the Glossary (**254 terms** across 10
  categories) and the Resource List (**71 links** across 14 groups) had never rendered at all.
  `shared-content.mjs` emits three document shapes — `doc` with `blocks`, `glossary` with
  `terms`, `resources` with `groups` — and `Shared.jsx` mapped `active.blocks` unconditionally.
  For two of the three kinds that is `undefined`, so the component drew nothing. The tabs
  worked, the titles appeared, and the body was blank.
- **This is the fourth instance of one shape**, and the pattern is now unmistakable: *correct
  source, wrong screen, and every test green*. The unstyled layout (40 CSS classes with no rule),
  the Tools library reporting "0 tools" while 433 rows existed, 40 tool cards linking to
  `href="—"`, and now 325 invisible items. Every check verified the **data**; the defect was
  always in the path from data to screen. Which is why "open the site and click through all four
  views" is now the highest-yield check in this repository, and why a component test layer and a
  browser-driven audit were added.

### An accessibility audit, and the four bugs in the audit itself

- **Added `audit-a11y.mjs`** as the 13th check: 44 assertions across all four views, driving Edge
  over raw CDP with no new dependency. It found three real defects immediately — a skip link that
  set the hash and scrolled but left focus on `<body>`, and two placeholders at 3.27:1 because
  `::placeholder` was styled for one input and not the other. All three fixed and measured.
- **The harness was harder to get right than the assertions.** `[tabindex]` matched at any value,
  so the correct `tabindex="-1"` fix made the audit report a fake failure in four views. The
  audit leaked Edge process trees, so a later connection hung and Node blamed a line number that
  moved between runs — 26 orphaned processes accumulated. `send()` had no deadline, so a dead
  socket hung forever. And the skip-link probe read a CSS transition frozen at `currentTime: 0`
  and called the link invisible; neither a 400ms sleep nor awaiting `finished` helped.
- **A baseline that outlives its defect.** Fixing the three defects made `--baseline` exit 1 with
  no explanation, because the recorded entries could no longer match. Replaced with `--strict`
  now that there is nothing to baseline, and documented in `WORKFLOW.md`.

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

- **65 phases across 10 tracks**, **24,035 lines** across 90 authored Markdown files in the
  current corpus (22,246 in the 65 phase files; the remaining lines are in overviews, checklists,
  and shared reference documents), 549 quiz questions, 891 practice tasks, 1,054 checklist items.
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
