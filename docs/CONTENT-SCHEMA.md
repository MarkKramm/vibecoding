# Content Schema

The contract between the study content (`ai-roadmaps/**/*.md`) and any tool that consumes it. It is implemented by [`scripts/build-content.mjs`](../scripts/build-content.mjs), which runs before every `dev` and `build` and **fails loudly** on a contract violation.

**Status: implemented.** Where this document and the build script disagree, the script is authoritative — correct this document to match it.

## Why this exists

The Markdown files are the single source of truth. A site that renders them must not duplicate their content. Instead, a build script walks the Markdown, extracts structured data, and emits JSON. The UI reads only the JSON.

If the site held its own copy of the curriculum, then editing a lesson would mean editing two places, and the second edit would be forgotten. The reader would eventually study a lesson the Markdown no longer contains. This schema exists to make that failure impossible: there is exactly one copy of every sentence, and it is the one you edit.

## Source: phase files

Each `NN-phase-*.md` file becomes one object in the generated JSON.

### Front-matter

Every phase file begins with YAML between `---` delimiters at the very top.

```yaml
---
id: ai-03-tokens-and-context        # stable, unique, never reused
track: foundations                  # one of the track ids in KNOWN_TRACKS
phase: 3                            # numeric phase index
order: 30                           # sort key; phase * 10
title: Tokens and Context
duration: 2 weeks
duration_weeks: 2
energy_mix: [low, normal]
deliverable: portfolio/ai/03-token-budget.md
exit_criteria: >
  You can estimate the token cost of a prompt, explain why the same sentence
  costs different amounts in different languages, and choose a context strategy
  for a document that does not fit.
---
```

Field notes:

- **`id`** is permanent. Renaming the file does not change it. Progress saved against `id` survives reorganization. This matters more than it looks: a learner's checklist ticks are stored by id, so an id that changes silently orphans real work.
- **`track`** must be one of the ids in `KNOWN_TRACKS` in [`scripts/build-content.mjs`](../scripts/build-content.mjs). A phase naming an unknown track **fails the build** rather than being dropped, because the track's own JSON is only emitted for a key that already exists — a typo would otherwise produce a phase that renders nowhere and is reported by nothing.
- **`order`** is `phase * 10` by convention, leaving room to insert phases later without renumbering.
- **`energy_mix`** lists which of `low` / `normal` / `high` energy modes a phase's tasks suit. Used by the site's daily-task picker.
- **`deliverable`** mirrors the `## Deliverable / proof of work` section's target path.
- **`exit_criteria`** mirrors `## You're ready to move on when…`. It is duplicated into front-matter because the dashboard shows the exit criteria of the phase you are working through without opening the lesson.

### Checklist task IDs

Each `- [ ]` line under `## Checklist` gets a trailing HTML comment with a stable ID:

```markdown
- [ ] I can explain what a token is without saying "a word". <!-- id: ai-03-c01 energy: low -->
- [ ] I can estimate a prompt's token count within 20%. <!-- id: ai-03-c02 energy: normal -->
- [ ] I can compute the KV cache size for a given model configuration. <!-- id: ai-03-c03 energy: high -->
```

- **ID format:** `<track>-<phase>-c<NN>`, zero-padded, sequential within the phase. Track is the track's short id, phase is the two-digit number from the filename. For example `found-03-c01`, `vibe-02-c04`.
- **IDs never change.** Adding a task appends a new ID. Removing a task retires its ID but does not renumber it.
- IDs must be **globally unique**, not merely unique within a phase — the build fails on a duplicate. The site treats an ID as the identity of a task, so a collision across two phases would make progress on one appear against the other.
- The `energy:` hint is optional in the raw file. When present, the site's low-energy mode only offers `energy: low` tasks.

HTML comments are invisible in every Markdown renderer, so the raw file stays clean on GitHub.

### Practice task IDs

Each line under `## Hands-on practice tasks` gets an id, authored inline:

```markdown
1. Count the tokens in a 500-word paragraph three ways. <!-- id: found-03-t01 band: quick energy: low -->
```

The comment carries three fields, and the **field order is fixed**: `id`, then `band`, then `energy`. The parser is deliberately **not order-tolerant** — a reordered comment is a build error rather than a guess, because a task whose metadata was silently misread would produce a wrong suggestion rather than no suggestion.

- **`id`** is `<phase-id>-t<NN>`, zero-padded and sequential within the phase, on the same permanent-identity principle as checklist ids: adding a task appends an id, and a learner's *answer* is stored against the id, so it cannot migrate to a different question.
- **`band`** describes how long one sitting takes. There are four values:

  | Band | Meaning |
  |---|---|
  | `quick` | Under 30 minutes. |
  | `focused` | 30–90 minutes. |
  | `deep` | Over 90 minutes. |
  | `ongoing` | **Not a single timed sitting.** Recurring, week-gated, multi-session or hardware-gated work. |

  `ongoing` is an exclusion rather than a length: it means *more time would not help*, so a task carrying it is never offered as a time-boxed suggestion.
- **`energy`** is one of `low`, `normal`, `high`, matching the checklist's `energy:` hint.

**Positional minting is a fallback, not the normal path.** The build mints `<phase-id>-tNN` from position for any task line carrying no `<!-- id: … -->` comment, so a partially migrated file cannot fail the build — but it **reports the count**, because a silently minted id is the one thing that would let a learner's answer follow a position rather than a question. The build prints all three numbers on every run:

```text
task ids:     0 minted from position, 0 authored
task bands:   0 banded, 0 authored without a band
task energy:  0 of 0 practice task(s) carry an energy value
```

The minted-from-position count must be **0**. A future edit that adds a task without its comment raises that number instead of passing quietly, which is the signal to author the comment rather than to accept the mint.

The same `band`/`energy` pair is parsed for the dashboard's "what should I do today?" picker; `scripts/lesson-ast.mjs` and the site's `src/lib/today.js` both fail **closed** on an unknown or missing band, so an unrecognised value can never be treated as fitting every budget.

### Sections to extract

The build script reads these `##` headings. **Missing mandatory headings are a build error.**

| Heading | Maps to JSON key | Notes |
|---|---|---|
| `## Goal of this phase` | `goal` | Plain text, first paragraph only |
| `## Estimated time` | `duration` | Also parsed for `durationWeeks` |
| `## Skills you'll gain` | `skills` | Array of bullet strings |
| `## Tools for This Phase` | `tools` | Table rows → array of tool objects |
| `## Free/cheap resources` | `resources` | Array of `{ name, url }` |
| `## Hands-on practice tasks` | `tasks` | Array of numbered strings |
| `## Deliverable / proof of work` | `deliverableItems` | Array of bullet strings |
| `## Checklist` | `checklist` | Array of `{ id, text, energy }` |
| `## Quiz` | `quiz` | Array of question objects — see below |
| `## You're ready to move on when...` | `exitCriteria` | Plain text |
| `## Free vs Paid` | `freeVsPaid` | Object with three sub-fields |

Optional headings (`## Specific topics to learn`, `## Common Pitfalls`, `## Lab setup options`, `## Path options`, `## Required projects`, `## Recommended order`, `## Target roles`) map to `topics` as an array of `{ heading, items }` — except `## Quiz`, which is parsed into its own structure rather than into `topics`.

### The quiz section

`## Quiz` is **mandatory in this curriculum**, unlike the optional section it is in the CS Roadmap schema. Every phase teaches a body of vocabulary and mechanism, and a phase whose central distinction a reader cannot state back is a phase that did not land. The build reports coverage on every run rather than assuming it, because silent partial coverage reads as "every phase is quizzed" to anyone who only sees the build succeed.

The format reuses **Markdown task-list syntax**: `- [x]` marks the correct option. That choice is load-bearing rather than cosmetic — the print stylesheet exists so a phase can be studied offline, and a quiz encoded as HTML or JSON would be the one section that vanished on paper. Authored this way, the quiz reads correctly on GitHub, in a text editor, and in print, with no new vocabulary to learn.

```markdown
### Q1. A prompt is billed at 4,000 input tokens but the text is only 2,900 words. Why? <!-- id: found-03-q01 energy: normal -->

- [x] The text is not English and the tokenizer splits it more finely than English
- [ ] The provider rounds every request up to the nearest 4,000 tokens
- [ ] Words and tokens are the same thing, so one of the two counts is simply wrong
- [ ] The count includes the model's output as well as its input

**Why:** Tokenizers are trained mostly on English, so languages with different scripts and word structure consume more tokens per word. The gap is the tokenizer's vocabulary, not a billing rule.
```

| Element | Requirement |
|---|---|
| Heading | `### Q<n>. <question> <!-- id: <phase-id>-q<nn> energy: <low\|normal\|high> -->` |
| `id` | Authored, unique, matching the phase's own prefix — never minted from position |
| Options | At least 3, each `- [ ]` or `- [x]`, with **exactly one** `[x]` |
| Explanation | A single-line `**Why:**` after the options |
| `energy` | Reuses the checklist vocabulary so anything that reads energy already understands a question |

`energy` is `low` for quick factual recall, `normal` for reasoning about a scenario, `high` for multi-step judgement.

**The build fails rather than skipping** on a missing `[x]`, two `[x]` marks, a missing `**Why:**`, a duplicate id, an unknown energy, or a section with prose but no parseable questions. A quiz is a claim that one answer is right, so a malformed one is worse than a missing one — it tells the reader their correct answer is wrong.

**The set is validated separately**, in `scripts/audit-quiz.mjs`, because a per-question check cannot see a defect of the collection. A quiz can put seven of its ten correct answers in position C, so that every question is individually valid and the build is green, yet a reader answering "C" every time scores 70% without reading. The guard gates **position skew** above 50%, unused positions, and erratic option counts.

### Sections deliberately NOT extracted

Two headings appear in phase files but are **not** mapped to any JSON key. This is intentional, not an omission:

| Heading | Why it is excluded |
|---|---|
| `## Lesson` | Long-form teaching prose. It is reading material, not structured data. Rendering it as a field would duplicate the Markdown, which this schema exists to prevent — and it would bloat the generated JSON for every phase. The lesson stays in the Markdown file and is parsed into its own block file. |
| `## Common Pitfalls` | A distinct list of mistakes to avoid. It is advisory prose rather than a checklist or task list, and the site has no pitfalls component. Kept in Markdown only. |

Because neither is extracted into the phase object, the build does **not** validate their contents. The authoring requirements for `## Lesson` live in [`CONTENT-GUIDE.md`](CONTENT-GUIDE.md).

### Headings inside fenced code blocks

Section detection **tracks fence state**. A line beginning with `## ` or `### ` inside a ```` ``` ```` or `~~~` fence is body text, not a heading, so a lesson can safely show a report template, a JSON payload, or real API output containing genuine Markdown headings.

This matters because an AI lesson frequently quotes a document structure — a system prompt in Markdown, a chunking example, a prompt template with sections. Before fence tracking, such a template was parsed as phase structure: the phantom headings appeared in the section map, and a template's `## Checklist` was taken as *the* checklist section, failing the build with `checklist line without an id comment`.

Fences must be **balanced**. Every line after an unterminated fence is read as still inside it, so a missing closing fence hides the remainder of the document from extraction — which surfaces as a missing-mandatory-section error naming a heading that is plainly present in the file.

### Tools table parsing

Each row becomes:

```json
{
  "name": "Ollama",
  "purpose": "Run open-weight models locally",
  "cost": "Free/open-source",
  "url": "https://ollama.com/",
  "task": "Pull a small model, run it, and compare its answer to a hosted model's",
  "freeAlternative": "llama.cpp directly, or LM Studio"
}
```

Column order is fixed by [`CONTENT-GUIDE.md`](CONTENT-GUIDE.md): **Tool, Purpose, Cost, Link, Task, Free alternative**.

## The lesson region

Everything between `## Lesson: <Title>` and the next `## ` heading is the lesson — the part that actually teaches. It is the largest thing the schema carries, and the reason the site is worth opening. The authoring requirements (minimum length, voice, structure) live in [`CONTENT-GUIDE.md`](CONTENT-GUIDE.md).

The build parses it with [`scripts/lesson-ast.mjs`](../scripts/lesson-ast.mjs) into a block AST. The parser supports exactly the Markdown subset this curriculum uses: `###`/`####`/`#####` headings, paragraphs, bullet and ordered lists (including one level of nesting), tables, fenced code blocks, and blockquotes. Inline `**bold**`, `*italic*`, and `` `code` `` are carried through as raw text and formatted by the site's `renderInline.jsx`.

Block shapes:

```json
[
  { "type": "heading", "level": 3, "text": "Part 1 — …", "id": "part-1" },
  { "type": "para",    "text": "…" },
  { "type": "code",    "lang": "python", "text": "…" },
  { "type": "quote",   "paras": ["…"] },
  { "type": "table",   "head": ["Tool", "Purpose"], "rows": [["Ollama", "Run models locally"]] },
  { "type": "list",    "ordered": false,
    "items": [{ "text": "…", "children": [] }] }
]
```

Two rules the parser keeps:

- **Nothing is dropped.** A line that matches no block becomes a paragraph, and any construct the parser does not recognise is recorded in `unknown`, which **fails the build**. Content that cannot be rendered must be a loud error, not a silently missing paragraph.
- **Heading IDs are unique.** Duplicates get a numeric suffix so a table of contents never links two entries to the same anchor.

`node scripts/audit-lesson-ast.mjs` verifies both across every phase by comparing the AST's characters against the source with markup stripped. It reports the exact loss count per lesson. **Run it after any change to the parser.**

## Output: generated JSON

The build script emits a small index per track plus one file per lesson:

```text
learning-site/src/data/generated/<track-id>.json
learning-site/src/data/generated/lessons/<phase-id>.json
learning-site/src/data/generated/search.json
learning-site/src/data/generated/shared.json
```

Generated files are **not committed** — they are rebuilt from the Markdown before every `dev`, `build` and test run. See [`.gitignore`](../.gitignore).

### Why the lessons are separate files

Lesson bodies total megabytes of JSON. Inlining them into the track indexes makes the site's single JS bundle several megabytes and delays first paint for content the reader has not asked for. Each lesson is therefore its own file, imported dynamically by `src/hooks/useLesson.js` when a phase is opened, and cached per phase id in memory.

### `search.json` — the full-text index

Search needs to find a phrase across every lesson without loading all of them. This file holds an **inverted index** — term to segment id — and **no prose**, so it does not duplicate the lesson files.

```json
{
  "v": 1,
  "segments": [
    { "h": "Part 4 — Why the KV cache exists", "a": "part-4-why-the-kv-cache-exists",
      "p": "found-04-attention-and-kv-cache", "pt": "Phase 4 — Attention and the KV Cache",
      "k": "foundations" }
  ],
  "terms": "kv:a,b,c\ntokenizer:1d,2f",
  "common": "the\nand\ntoken"
}
```

| Field | Meaning |
| --- | --- |
| `v` | Index format version. The site reads this and a mismatch is treated as a bug, not a fallback case. |
| `segments[].h` | The heading this segment sits under. Taken from the lesson's `###`/`####` headings. |
| `segments[].a` | The heading's anchor id, used to scroll to the hit. Empty for the lesson-level opening segment. |
| `segments[].p` | Phase id. Resolves to a lesson file at `lessons/<p>.json`. |
| `segments[].pt` | Phase title, for the result row. |
| `segments[].k` | Track id. Resolved against `tracks` in `src/data/roadmaps.js` to label the result row; a hardcoded track test here would label every hit with one track's name. |
| `terms` | One line per term, `term:delta,delta,…`, where the deltas are ascending segment indices encoded in base36. |
| `common` | Terms appearing in more than 20% of segments. Kept so the engine can match and report them, but excluded from the query's AND. |

Segment indices are positions in `segments`, so **the two arrays must stay in sync**; both are emitted from one pass. Segments are cut at `###`/`####` headings rather than per block or per lesson: per block gives a result list too long to read, per lesson gives too few hits to be useful.

### A track index file

```json
{
  "track": "foundations",
  "generatedAt": "2026-01-01T00:00:00Z",
  "phaseCount": 9,
  "phases": [
    {
      "id": "found-03-tokens-and-context",
      "order": 30,
      "title": "Tokens and Context",
      "duration": "2 weeks",
      "durationWeeks": 2,
      "goal": "...",
      "skills": ["...", "..."],
      "topics": [{ "heading": "Tokenization", "items": ["...", "..."] }],
      "tools": [{ "name": "tiktoken", "purpose": "...", "cost": "...", "url": "...", "task": "...", "freeAlternative": "..." }],
      "resources": [{ "name": "Tiktokenizer", "url": "https://..." }],
      "tasks": [{ "id": "found-03-t01", "text": "...", "band": "quick", "energy": "low" }],
      "deliverableItems": ["...", "..."],
      "checklist": [{ "id": "found-03-c01", "text": "...", "energy": "low" }],
      "quiz": [{ "id": "found-03-q01", "question": "...", "options": ["..."], "answerIndex": 0, "why": "...", "energy": "normal" }],
      "lessonTitle": "Tokens, Context, and the Cost of a Sentence",
      "lessonPath": "lessons/found-03-tokens-and-context.json",
      "lessonWordCount": 3200,
      "lessonBlockCount": 210,
      "exitCriteria": "...",
      "freeVsPaid": { "freeEnough": "...", "paidUpgrade": "...", "whenWorthPaying": "..." },
      "sourcePath": "ai-roadmaps/foundations/03-phase-tokens-and-context.md"
    }
  ]
}
```

A lesson file contains `{ id, title, blocks, toc }`. **The UI never reads the Markdown directly. It reads this JSON.**

## Validation rules

The build script fails on:

- A phase file missing front-matter.
- A phase file missing any of the 11 mandatory headings.
- A phase file whose `track` is not in `KNOWN_TRACKS`.
- A checklist line without an `<!-- id: … -->` comment.
- Two checklist items sharing an `id`, within a phase or across the corpus.
- Two phase files sharing a top-level `id`.
- A practice-task or quiz comment whose fields are out of order.
- A tools table row with fewer than 6 columns.
- A paid or freemium row without a `freeAlternative` value.
- A quiz question with no `[x]`, more than one `[x]`, no `**Why:**`, or an unknown energy.
- An unbalanced code fence.
- A lesson block the AST parser does not recognise.

Failures are reported with **file path and line number**. A build error that does not say where to look is a build error that costs more than it saves.

## What is deliberately not specified here

- **The build tool.** Decided when the site is scaffolded; it is Node, matching the site's own runtime so the repository needs one language.
- **Site-side state shape** (progress, filters, view state). That belongs in the site's own documentation.
