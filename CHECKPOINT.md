# Checkpoint

A cold-start snapshot: what this project is, where it stands, and what is true right now.

**Last verified:** all 11 offline checks green, all 315 unit-test assertions passing, every
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
| Offline checks | 11 |
| Unit-test assertions | 315 |
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
npm test             # 11 offline checks
npm run test:browser # needs a running server
```

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

- ⚠️ **The live page has never been observed loading.** `*.github.io` is IPv6-only and
  unreachable from where this was built. The *artifact* is verified (deployment success,
  artifact size, bundle contents, and local rendering of the same bundle). That is not the
  same as having loaded the URL.
- ⚠️ **Mobile has only been emulated**, never touched on a real device.
- ⚠️ **No automated accessibility audit.** Contrast, heading order and keyboard reachability
  are hand-checked only.
- ⚠️ Browser checks **sample** phases, not all 65.
- ⚠️ Volatile facts (free tiers, context windows, model availability) are **dated, not
  continuously verified**, because verification needs network access this project rations.

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

**If you do exactly one thing:** open the live site and confirm it renders. It is the only
significant claim here that has never actually been checked.

---

## A note on why this file is short

It states what is true, not what was done. The history is in
[CHANGELOG.md](CHANGELOG.md); the engineering lessons, mistakes included, are in
[HANDOVER.md](HANDOVER.md).

A checkpoint that grows without bound stops being a checkpoint.
