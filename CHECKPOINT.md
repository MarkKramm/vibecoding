# Checkpoint

A dated cold-start snapshot: what the project state was at the recorded verification point.

**Snapshot recorded:** 2026-09-18 at commit `a570682`; local and remote `main` were identical and
the working tree was clean. At that time, the recorded result was 17 checks and 759 assertions
(699 offline + 60 in the accessibility audit). These are historical results, not a claim about the
current checkout; rerun the checks before relying on them.

GitHub Pages was reported unreachable during the 2026-09-18 checkpoint. This is a historical
service observation, not verified current status; check the live URL before diagnosing deployment.

---

## What this is

A free, self-paced curriculum for learning how modern AI systems work and how to get hired
building with them. **65 phases across 10 tracks**, written for someone with a **$0 budget**
starting from beginner-to-intermediate.

It ships as a React site that reads compiled JSON from hand-authored Markdown.

**Live:** https://markkramm.github.io/vibecoding/
**Repo:** https://github.com/MarkKramm/vibecoding

---

## The shape of it

```
ai-roadmaps/*/NN-phase-*.md      <- SOURCE OF TRUTH (65 files, 22,246 lines)
        |
        |  scripts/build-content.mjs
        v
learning-site/src/data/generated/  <- gitignored, compiled
        |   index.json  (light, eager, ~72 KB)
        |   <track>.json (full, lazy, ~1.3 MB each)
        v
learning-site/src/  (React 18 + Vite 6)  ->  dist/  ->  GitHub Pages
```

**Markdown is the only source of truth.** The generated JSON is gitignored on purpose so a
stale bundle can never be committed.

⚠️ **Two projections exist and conflating them caused a shipped bug.** `index.json` phases
carry only `id, order, phase, title, duration, durationWeeks, goal, lessonWordCount,
checklistIds, taskIds, quizIds` — **no tools, resources or prose**. Full data loads lazily.

---

## State recorded 2026-09-18

Historical snapshot; the opening note records the commit and verification baseline. Re-run checks before treating these counts or statuses as current.

| | |
|---|---|
| Phases | 65 across 10 tracks |
| Authored Markdown | 24,035 lines in `ai-roadmaps/` across 90 files |
| Quiz questions | 549 |
| Practice tasks | 891 |
| Checklist items | 1,054 |
| Tool rows | 433 (237 after de-duplication) |
| Glossary terms | 254 across 10 categories |
| Catalogued resources | 71 across 14 groups |
| `npm test` checks at snapshot | 17 total, including 2 preview/browser-dependent checks |
| Recorded assertions | 759 (699 offline + 60 accessibility) |
| Guards proved to fail | all of them |
| `src/` modules | 48 — **every one reachable from `main.jsx`** |
| Views | 6 — Curriculum, Practice, Exams, Tools, Reference, Search |
| Section exams | 10, one per track, 80% pass mark |

Per track: Foundations 8, Model Internals 6, Prompting 7, RAG 7, Agents 7, Fine-tuning 6,
Cost 7, Vibecoding Craft 8, Safety & Career 5, Career 4.

---

## Ways to test yourself

The 549 questions are available through four distinct modes:

| Mode | Coverage | Graded? | Persistence |
|---|---|---|---|
| **Phase quiz** | One phase | no | chosen options may be saved for revisit |
| **Practice** | A track or the full question bank | no | no score |
| **Track exam** | Every question in one track | yes, 80% | best result only; timed answers are not stored |
| **All-track capstone** | 10 questions per written track; unseen questions are prioritized on later attempts | yes, 80% | best score and seen question IDs |
| **Comprehensive exam** | Every question across the current corpus | yes, 80% | untimed; current question and answers are resumable locally |

Practice answers *"what should I study next?"* and remains ungraded. Exams answer whether the
reader can demonstrate mastery. The comprehensive exam is deliberately untimed and resumable;
its local session stores question IDs, shuffled option order and selected option indexes, not the
question text or answer key. Active sessions stay local and are not included in backups.

---

## Commands

```bash
cd learning-site
npm run dev          # content rebuild + dev server on 5173
npm run build        # content rebuild + bundle to dist/
npm run preview      # serve dist/ on 4173
npm test             # 18 checks; 2 need a preview server or skip
npm run test:browser # needs a running server
```

⚠️ Exactly two of the 17 `npm test` steps — `accessibility (rendered page)` and `every phase renders (browser,
all 65)` — need `npm run preview` on 4173. They **skip with a loud notice rather than failing**
when no server answers, because a guard that fails for an unrelated reason gets disabled, and a
disabled guard is worse than none.

⚠️ `localhost`, not `127.0.0.1` (dev server binds IPv6 only).
⚠️ Never set `VITE_BASE` locally — it produces a blank page.
⚠️ Rebuild content **then** rebuild **then** restart preview. Order matters.

---

## What is verified, and what is not

**Verified:**

- Content contract — 14 sections, fixed order and spelling, authored ids, quiz structure
- All 549 quiz questions: one correct option, a `**Why:**` line, a valid `energy`
- Field shapes against what the renderers consume
- Projection reads — no component reads a field its projection lacks
- Inline markdown, lesson-block coverage, search (all against the real corpus)
- Encoding — LF, UTF-8 no BOM, no tabs, no mojibake (205 files)
- CSS wiring — every JSX class has a rule, every token is defined
- **Accessibility** — 60 assertions across 6 views: contrast, accessible names, focus visibility,
  and keyboard reachability by control *kind*
- **Every one of the 65 phases renders** — opened in a real browser, not sampled
- **Mixed practice sets** — sampling, filtering, the no-score contract, and the question
  shape the *app* sees rather than the one the file stores
- **Reachability** — every module under `src/` is reachable from `main.jsx`
- Guards themselves — each was broken deliberately and shown to fail

**NOT verified:**

- ⚠️ **Mobile has only been emulated**, never touched on a real device.
- ⚠️ Volatile facts (free tiers, context windows, model availability) are **dated, not
  continuously verified**, because verification needs network access this project rations.

✅ **The live site HAS now been observed.** Loaded by the project owner on 2026-09-18 and all
four views render. This was the last significant unverified claim, and checking it immediately
found a serious defect — see below.

---

## The defect that only looking could find

The first time anyone loaded the live site, the Reference view was visibly wrong: raw Markdown
(`---`, `## The rules`) leaking as body text. Following that to the data found something much
worse.

**325 authored items were completely invisible.**

`shared-content.mjs` emits three shapes because the documents differ: `kind: "doc"` with
`blocks`, `kind: "glossary"` with `terms`, and `kind: "resources"` with `groups`. `Shared.jsx`
mapped `active.blocks` unconditionally, so two of the three kinds rendered an empty `<div>`.

| Document | Authored | Rendered |
|---|---|---|
| Glossary | 254 terms, 10 categories | **nothing** |
| Resource list | 71 links, 14 groups | **nothing** |

The tabs worked, titles and blurbs appeared, and the body was blank. The data was correct,
complete, compiled and deployed — no code path drew it.

**This is the fourth instance of one shape**, and it is the single most useful pattern in this
project:

> **Correct source, wrong screen — and every test green.**

The unstyled layout (40 CSS classes), the Tools library ("0 tools" with 433 rows), the 40 dead
links, and now this. Every check verified the *data*; the defect was always in the path from
data to screen. That is what component tests and a browser now cover.

---

## The defect that only clicking could find — **the fifth instance, and the purest one**

A new check that opens all 65 phases in a browser found, on its first run, that **the Previous
and Next phase buttons did absolutely nothing** — on every phase, in both variants.

`PhaseNav` called `onOpenPhase(prev.id)`: **one argument, a phase id.** But `App`'s handler is
`openPhase(tId, pId)`, which treats its **first** argument as a **track** id. So `findTrack`
rejected the phase id, the fallback scanned for a phase whose id is `undefined`, found none, and
the handler returned without changing anything.

> **This is the pattern in its purest form yet.** The data was correct. The buttons rendered
> correctly, with the right labels and the neighbouring phase's title and goal. They were
> enabled, focusable, and correctly styled. The click handler even fired — React's listener ran
> every time. **Nothing was wrong except that the page did not change.**

Nothing could see it but clicking, which is why it survived fourteen checks and dozens of manual
page opens. The old browser check verified **one track of six phases** against hardcoded strings,
so 59 phases had never been rendered at all.

**Four bugs in the new check had to die before it could find this one**, each caught by
disbelieving its own output: it assumed a track opens a *grid* of phase cards (it opens phase 1);
headless had **no viewport**, putting the button at y=18,865px so clicks never landed; it flagged
six phases for the word "undefined" that was legitimate **quiz prose** ("Cosine similarity is
undefined for out-of-vocabulary words"); and it counted checklist items with **two wrong selectors
in a row**, because `ChecklistItem` renders a `label.check`, not an `li`.

---

## The sixth instance — and the one where the tests agreed with the bug

The Practice view (mixed question sets) crashed on its first render with React error #31,
*"objects are not valid as a React child"*.

There are **two question shapes**. `generated/<track>.json` stores
`options: ["a","b","c","d"], answerIndex, why`. `normaliseQuestion` transforms it to
`options: [{text, correct}], explanation` before any component sees it. `practice.js` read the
raw shape; the view was handed the normalised one.

> **All 91 unit tests passed. They agreed with the bug, because they read the same JSON files
> the bug did.**

This is the same failure as the 325 glossary and resource items that rendered into an empty
`<div>`: **correct data, wrong assumption about its shape, every check green.** A test that reads
the *source file* proves the source file is fine — it says nothing about what the app receives.

The fix has three parts, and the middle one is the generalisable bit:

1. `poolFrom` now accepts **either** shape and normalises.
2. The corpus-wide test builds its pool **through the app's own normaliser**, so it cannot agree
   with a shape mismatch again.
3. That normaliser cannot be imported under Node (`roadmaps.js` imports JSON, which needs an
   import attribute Vite does not require), so it is **mirrored and its source read and
   asserted** to still do what the mirror assumes. Change `normaliseQuestion` and the test fails
   pointing at itself.

Two more real finds from the same suite: `normaliseQuestionShape` took the *first* correct option
via `findIndex`, so a two-answer question would be silently marked against one of them; and an
assertion demanded a 30-question draw span all 10 tracks 50% of the time when the true figure is
~44% (the two smallest tracks are missed 18% and 25% of the time) — confirmed against a log-space
hypergeometric calculation, 47.8% theoretical vs 43.8% observed.

---

## The thing to know before touching anything

**Three times in this project a guard was documented as enforcing a rule it did not enforce**,
and once the entire site rendered unstyled with every check green.

> **A check that passes is evidence about the check, not about the thing.**

The specific manifestations:

- `AGENTS.md` claimed section **ordering** was checked. Nothing compared order to anything.
  `## Specific topics to learn` and `## Common Pitfalls` were in **no** guard list — renaming
  one to `## CommonPitfalls` passed everything and was silently absorbed as body text.
- `audit-quiz.mjs` opened by claiming it verified "a valid energy". The string `energy`
  appeared in that file **once** — in that comment.
- `audit-encoding.mjs` decided coverage by **extension**, so `.gitignore` and every workflow
  were never read. A stray CR reached `.gitignore` and **git warned on push** while the guard
  said clean.

And: **suspect the instrument before the subject.** **Thirteen** times an implausible result
was the query's fault — an inline regex that lost its `$` to PowerShell reported all 17 hooks as
dead when the answer was 2; a probe looked for `o.correct` on quiz options and returned an
all-zero histogram across 549 questions; and a sweep of all 65 phases reported every one as
broken when the selector had been guessed from a container's tag instead of read off the
component.

**A guard's blind spot is exactly as wide as the selector it uses.** Four instances: a directory
list, an extension list, a hardcoded file list, and `[tabindex]` matched at *any* value.

---

## If you are picking this up

1. Read **[WORKFLOW.md](WORKFLOW.md)** — the edit loop and the two traps that fail quietly.
2. Read **[ROADMAP.md](ROADMAP.md)** — what is genuinely left, honestly stated.
3. Read **[AGENTS.md](AGENTS.md)** before editing any phase file.
4. Check **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** before debugging anything.

**If you do exactly one thing:** open the live site and **click all the way through a track** —
not just look at the views. That is now the highest-yield check available. Looking found the 325
invisible glossary and resource items; *clicking* found that Previous and Next did nothing. Both
were invisible to a fully green test suite. Visual inspection is not redundant with automated
checks here; it catches a class they structurally cannot.

---

## Exam feature decision — implemented in the current worktree

The agreed scope is a rotating balanced capstone (10 questions per written track, prioritizing unseen IDs), a separate untimed/resumable comprehensive exam over all 549 current questions, and track-exam result summaries on the dashboard. Verify and refresh this snapshot after the implementation is committed.

Deliberately **not** queued: the share-link (progress in a URL fragment). It was offered and
passed over twice — do not start it without being asked again.

---

## Still open, and honestly so

- **P0 — mobile has been emulated, never touched.** Every browser check here sets a viewport
  override; no one has held this site on a real phone. Emulation has already hidden one bug
  class (the off-screen-click problem), so treat mobile as **unverified**.
- **P2 — volatile facts are unverified.** Free tiers, pricing and model availability are dated
  in the content but not re-checked, because `web_search` returns HTTP 402 on this account.
  `docs/SEARCH-REQUESTS.md` holds the list; it needs a human to paste it into a web chat.

---

It states what is true, not what was done. The history is in
[CHANGELOG.md](CHANGELOG.md); the engineering lessons, mistakes included, are in
[HANDOVER.md](HANDOVER.md).

A checkpoint that grows without bound stops being a checkpoint.
