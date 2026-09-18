# Checkpoint

A cold-start snapshot: what this project is, where it stands, and what is true right now.

**Last verified:** all 13 offline checks green, all 451 assertions passing, every
GitHub Actions run green, deployment `state=success`.

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
ai-roadmaps/*/NN-phase-*.md      <- SOURCE OF TRUTH (65 files, 32,970 lines)
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

## Current state

| | |
|---|---|
| Phases | 65 across 10 tracks |
| Authored Markdown | 35,383 lines across 89 files |
| Quiz questions | 549 |
| Practice tasks | 886 |
| Checklist items | 1,054 |
| Tool rows | 433 (237 after de-duplication) |
| Glossary terms | 254 across 10 categories |
| Catalogued resources | 71 across 14 groups |
| Offline checks | 12 |
| Unit-test assertions | 435 |
| Guards proved to fail | all of them |

Per track: Foundations 8, Model Internals 6, Prompting 7, RAG 7, Agents 7, Fine-tuning 6,
Cost 7, Vibecoding Craft 8, Safety & Career 5, Career 4.

---

## Commands

```bash
cd learning-site
npm run dev          # content rebuild + dev server on 5173
npm run build        # content rebuild + bundle to dist/
npm run preview      # serve dist/ on 4173
npm test             # 13 offline checks
npm run test:browser # needs a running server
```

⚠️ Exactly one of the 13 — `accessibility (rendered page)` — needs `npm run preview` running on
4173. It is the only step that opens a browser; the other twelve read data. It skips with a loud
notice rather than failing when no server answers, because a guard that fails for an unrelated
reason gets disabled, and a disabled guard is worse than none.

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
- Guards themselves — each was broken deliberately and shown to fail

**NOT verified:**

- ⚠️ **Mobile has only been emulated**, never touched on a real device.
- ⚠️ **No automated accessibility audit.** Contrast, heading order and keyboard reachability
  are hand-checked only.
- ⚠️ Browser checks **sample** phases, not all 65.
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

And: **suspect the instrument before the subject.** Eight times an implausible result was the
query's fault — an inline regex that lost its `$` to PowerShell reported all 17 hooks as dead
when the answer was 2; a probe looked for `o.correct` on quiz options and returned an all-zero
histogram across 549 questions.

---

## If you are picking this up

1. Read **[WORKFLOW.md](WORKFLOW.md)** — the edit loop and the two traps that fail quietly.
2. Read **[ROADMAP.md](ROADMAP.md)** — what is genuinely left, honestly stated.
3. Read **[AGENTS.md](AGENTS.md)** before editing any phase file.
4. Check **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** before debugging anything.

**If you do exactly one thing:** open the live site and click through all four views. That is
now the highest-yield check available, and it is how the 325 invisible glossary and resource
items were found — after a fully green test suite had missed them. Visual inspection is not
redundant with automated checks here; it catches a class they structurally cannot.

---

## A note on why this file is short

It states what is true, not what was done. The history is in
[CHANGELOG.md](CHANGELOG.md); the engineering lessons, mistakes included, are in
[HANDOVER.md](HANDOVER.md).

A checkpoint that grows without bound stops being a checkpoint.
