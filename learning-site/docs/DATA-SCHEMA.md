# DATA-SCHEMA

The JSON contract the React components depend on.

Everything here is emitted by `scripts/build-content.mjs` from the Markdown in
`ai-roadmaps/`, and `learning-site/src/data/generated/` is git-ignored — a fresh
clone has no schema until the build runs. The shapes below were read out of the
generated files on disk, not recalled. Where a field is stated as an **array of
objects**, that is a correction worth reading section 12 about: getting it wrong
has already crashed the site once.

Throughout, "one element of the array" is what is being described. `skills` is an
array of strings; `topics` is an array of **objects**, and the distinction is the
whole point.

---

## 1. `index.json` — the light projection

The eager file. Read by `src/data/roadmaps.js` as a static import.

```jsonc
{
  "generatedAt": "2026-09-18T…Z",
  "tracks": [
    {
      "id": "foundations",
      "label": "Foundations",
      "blurb": "…",
      "short": "…",
      "note": "…",              // duplicate of blurb, for label fallback
      "phaseCount": 8,
      "phases": [ /* light phase records, below */ ]
    }
    // …all ten declared tracks, in curriculum order
  ]
}
```

A **light phase record** carries exactly these keys:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `string` | unique across the whole corpus, e.g. `found-01-what-a-model-is` |
| `order` | `number` | sort key within the track, e.g. `10` |
| `phase` | `number` | the phase number as authored, e.g. `1` |
| `title` | `string` | |
| `duration` | `string` | e.g. `"1 week"` |
| `durationWeeks` | `number` | |
| `goal` | `string` | may contain inline Markdown |
| `lessonWordCount` | `number` | |
| `checklistIds` | `string[]` | **IDs only** |
| `taskIds` | `string[]` | **IDs only** |
| `quizIds` | `string[]` | **IDs only** |

There is deliberately **no `tools`, `tasks`, `checklist` or `quiz` array** on a
light record — only the three ID lists. That is the entire point of the
projection: the dashboard renders every track at once, and a phase card shows a
title, a duration, a goal and a count. Including the tool records here would pull
most of the full projection's weight back into the entry bundle and undo the
split.

The three `…Ids` arrays exist so the dashboard and the top bar can count progress
without loading any phase prose. The **text** of a checklist item, a task or a
question lives only in the full track file. `corpusTotals()` and
`countDoneIds()` in `roadmaps.js`/`useProgress.js` both rely on this.

---

## 2. `<track>.json` — the full projection

One file per track, emitted only for tracks that have authored phases. A track
with no phases emits **no file at all**, which `loadTrackPhases()` treats as a
normal `"empty"` state, not an error.

```jsonc
{
  "track": "foundations",
  "label": "Foundations",
  "blurb": "…",
  "generatedAt": "2026-09-18T…Z",
  "phaseCount": 8,
  "phases": [ /* full phase records */ ]
}
```

A **full phase record** has every light field above except the `…Ids` arrays,
plus:

| Field | Type | Notes |
| --- | --- | --- |
| `energyMix` | `string[]` | e.g. `["low","normal"]` |
| `skills` | `string[]` | section 3 |
| `topics` | `{ heading, items }[]` | section 3 |
| `tools` | `{…}[]` | section 3 |
| `resources` | `{ name, url }[]` | section 3 |
| `tasks` | `{ id, text, band, energy }[]` | section 4 |
| `deliverableItems` | `string[]` | section 3 |
| `deliverable` | `string` | free prose, a separate field from `deliverableItems` |
| `checklist` | `{ id, text, energy }[]` | section 5 |
| `quiz` | `{…}[]` | section 6 |
| `lessonTitle` | `string` | |
| `lessonPath` | `string` | e.g. `lessons/found-01-what-a-model-is.json` |
| `lessonWordCount` | `number` | |
| `lessonBlockCount` | `number` | |
| `lessonHeadingCount` | `number` | |
| `exitCriteria` | `string` | may contain inline Markdown |
| `freeVsPaid` | `{ freeEnough, paidUpgrade, whenWorthPaying }` | each a multi-paragraph string, split on `\n\n` by the renderer |
| `sourcePath` | `string` | e.g. `ai-roadmaps/foundations/01-phase-what-a-model-is.md` |

All 42 written phases have a `lessonPath`; none has an empty `quiz`.

---

## 3. The fields where the element type is the whole story

These are the four that render as lists, and they do **not** share a shape.

### `skills` — array of **strings**

```json
[
  "Explain what a language model computes, in plain language, without claiming it \"thinks\" or \"knows\"",
  "Distinguish a model from the product it is wrapped in (the chat app, the API, the agent)"
]
```

Rendered by `PhaseDetail.jsx` as `<li>{renderInline(s)}</li>`. Strings may carry
inline Markdown (`**bold**`, `` `code` ``, `*italic*`), which `renderInline`
handles.

### `topics` — array of **objects** `{ heading: string, items: string[] }`

```json
[
  {
    "heading": "The core mechanic",
    "items": [
      "Next-token prediction as the entire training objective",
      "The difference between a *distribution over options* and a *choice*"
    ]
  }
]
```

**Not strings.** Each element is a group: the author's name for a cluster of
ideas, plus the bullets under it. `PhaseDetail.jsx` renders `topic.heading` as an
`h4` inside a `div.topicgroup` and `topic.items` as a nested `<ul class="plainlist">`.
It tolerates a plain string element as a fallback, rendering it as a one-item
list, so an older generated file still renders rather than throwing.

### `resources` — array of **objects** `{ name: string, url: string }`

```json
[
  {
    "name": "**Andrej Karpathy — Intro to Large Language Models** —",
    "url": "https://www.youtube.com/watch?v=zjkBMFhNj_g"
  }
]
```

**Not strings.** `name` frequently ends with a trailing dash, because the source
Markdown wrote the link as `name — url`; `PhaseDetail.jsx` uses `name` as the link
label and `url` as the target, trimming a trailing `—`, `–` or `-` so the
punctuation is not doubled. A resource with no `url` renders as plain text rather
than a dead link.

### `deliverableItems` — array of **strings**

```json
[
  "**Your prediction test** — the five questions, your predictions written *before* asking, the actual answers, and your scoring against your own predictions",
  "**One confident wrong answer you personally produced**, quoted verbatim, with an explanation of why the mechanism produced it"
]
```

Rendered as a `<ul class="plainlist">`, under the `deliverable` prose. Strings,
not objects — there is nothing to link and nothing to group.

---

## 4. `tasks` — array of `{ id, text, band, energy }`

```json
{
  "id": "found-01-t01",
  "text": "Ask one factual question three times in fresh conversations and compare the answers.",
  "band": "quick",
  "energy": "low"
}
```

`band` is one of `quick | focused | deep | ongoing`, defined by `BANDS` in
`src/lib/today.js` with their rank order and human labels. `ongoing` has no rank
and is never offered by a time budget, because it is not a single sitting.

`energy` is one of `low | normal | high`, matching `useEnergyMode`'s valid set.

`id` is the stable progress key. The build **mints** an id from the task's
position when the Markdown carries no explicit `<!-- id: … -->` comment, and
prints a warning for every minted id — a minted id can move to a different task
when one is inserted above it. Progress is stored against these ids, never
against task text, so rewording a task does not lose the reader's tick.

`text` is the authoring prose for the task. The reader's own typed answer is not
in the JSON at all; it lives in `vibecoding:notes:v1` keyed by task id.

---

## 5. `checklist` — array of `{ id, text, energy }`

```json
{
  "id": "found-01-c01",
  "text": "I can explain what a language model computes without using the word \"knows\"",
  "energy": "low"
}
```

No `band`. Checklist items are confirmations, not sittings, so the time-budget
machinery does not apply to them. `id` is the key written into
`vibecoding:progress:v1`, and the same id appears in the light index's
`checklistIds`.

---

## 6. `quiz` — array of `{ id, question, options, answerIndex, why, energy }`

```json
{
  "id": "found-01-q01",
  "question": "A model gives a different answer each time to the same factual question. What does this most likely indicate?",
  "options": [
    "The model's weights are being changed between requests",
    "The probability distribution over possible answers is relatively flat, so sampling picks different options",
    "The provider is deliberately randomising output to prevent copying",
    "The model is searching the web and finding different sources each time"
  ],
  "answerIndex": 1,
  "why": "A flat distribution means several continuations have similar probability, so the sampler's choice varies between runs. …",
  "energy": "normal"
}
```

`options` is an array of **strings**. Correctness is carried by `answerIndex`, a
zero-based index into that array — never by inspecting the option text.

This is the shape that reaches `src/data/roadmaps.js`. It does **not** reach the
components. `normaliseQuestion` converts it at the data boundary into

```json
{
  "id": "found-01-q01",
  "question": "…",
  "energy": "normal",
  "options": [{ "text": "…", "correct": false }, { "text": "…", "correct": true }],
  "explanation": "…"
}
```

which is what `Quiz.jsx` and `src/lib/quiz.js` were written against. See
ARCHITECTURE.md §5 for why the adaptation lives there and what it costs.

The build guard requires at least two options and exactly one `[x]` option in the
source Markdown, and `audit-shapes.mjs` re-checks that `answerIndex` is a number
in range and that `why` is non-empty.

---

## 7. `tools` — array of `{ name, purpose, cost, url, task, freeAlternative }`

```json
{
  "name": "Any chat assistant you already have",
  "purpose": "Observe the behaviour this phase describes",
  "cost": "Free tier",
  "url": "https://chatgpt.com/",
  "task": "Ask it the same question three times and compare the answers",
  "freeAlternative": "Any free chat model — the observation matters, not the brand"
}
```

`cost` is a **free-form string**, not an enum. The corpus currently carries
**24 distinct cost strings across 324 tool rows**, and most of them are
sentences, because the point of the Cost track is that "free" is rarely one word:

```
[102x] Free/open-source
[100x] Free
[ 41x] Free, open source
[ 24x] Free tier
[ 15x] Freemium
[ 14x] Free to read
[  8x] Free to browse
…
[  1x] Paid (pay-per-token, no monthly fee)
[  1x] Varies
```

The badge tone comes from `costTone()` in `src/data/tools.js`, which classifies
in a deliberate order — explicit zero-cost phrasing first, then freemium, then
paid, then freemium as the default for the indeterminate — so that a string like
`"Free to read (API calls are paid)"` reads as free, while `"Varies"` never reads
as free. `test-cost-tone.mjs` re-derives the classification against the real
corpus on every run, so a new cost phrase surfaces rather than silently
mis-tiering. See VERIFICATION.md §2.

`name` is the de-duplication key for ToolsLibrary (lower-cased and trimmed), and
each tool record also appears in that phase's light index record, so the tools
page can be built without loading a track file.

---

## 8. Lesson files — `{ id, title, blocks, toc }`

`lessons/<phase-id>.json`, one per phase, 42 today. `useLesson.js` resolves it
through `phase.lessonPath` and caches it per path.

```jsonc
{
  "id": "found-01-what-a-model-is",
  "title": "The Machine That Guesses the Next Word",
  "blocks": [ /* typed AST, below */ ],
  "toc": [
    { "level": 3, "text": "Part 1 — What it is actually doing", "id": "part-1-…" }
  ]
}
```

`toc` entries are `{ level, text, id }` for **every heading in the lesson**, in
document order. `Lesson.jsx` uses them for the on-this-page list and to observe
which section is on screen, and `block.id` for a heading is the same string as
its `toc` entry's `id`, which is what makes anchors and search-result jumps work.

### The six block types

Every block carries a `type`. Across the 42 lessons there are **3,671 blocks**
and exactly six types, with these key sets — no others appear anywhere in the
corpus:

| Type | Count | Keys besides `type` |
| --- | --- | --- |
| `para` | 2,694 | `text` |
| `heading` | 427 | `level`, `text`, `id` |
| `code` | 219 | `lang`, `text` |
| `list` | 130 | `ordered`, `items` |
| `table` | 103 | `head`, `rows` |
| `quote` | 98 | `paras` |

**`heading`**

```json
{ "type": "heading", "level": 3, "text": "Part 1 — What it is actually doing", "id": "part-1-…" }
```

`level` is 3 or 4 in every lesson body, because a lesson is authored inside a
`## Lesson: …` section. `LessonBlock.jsx` renders it as `h + min(headingTag + (level − headingBase), 5)`,
with `headingBase = 3` and `headingTag = 3` for lessons, so levels 3 and 4 map to
`h3` and `h4`. The shared strategy documents are parsed with base 1, so their
title maps to `h2` and the page keeps exactly one `h1` — the same renderer, two
origins, no second component.

`id` is a slug derived from the heading text. It is what the TOC, the section
tick store and a search result's anchor all agree on.

**`para`**

```json
{ "type": "para", "text": "Start with the mechanism, stated as plainly as it can be stated. …" }
```

Rendered as `<p>{renderInline(text)}</p>`. Inline Markdown is **retained** in the
text — `**bold**`, `` `code` ``, `*italic*` — and interpreted at render time by
`src/lib/renderInline.jsx`, not stripped at parse time.

**`code`**

```json
{ "type": "code", "lang": "text", "text": "The capital of France is" }
```

`lang` is the fence's info string and may be the empty string — 14 of the 219
code blocks carry `""`, which is why `LessonBlock.jsx` writes
`data-lang={block.lang || undefined}` rather than the attribute unconditionally.
Distinct values in the corpus: `text` (129), `python` (64), `""` (14), `json` (6),
`sql` (3), `javascript`, `markdown`, `bash` (1 each). The `lang` is currently a
presentational attribute only; there is no syntax highlighter wired to it.

**`quote`**

```json
{ "type": "quote", "paras": ["Think of the base model as an engine…", "The analogy's limit: …"] }
```

A quote holds **paragraphs**, not one text run. `paras` is `string[]`, and
`LessonBlock.jsx` maps it to a `<p>` per element inside a `<blockquote>`.

**`list`**

```json
{
  "type": "list",
  "ordered": false,
  "items": [
    { "text": "It explains why these systems can do things that look like genuine understanding…", "children": [] },
    { "text": "It explains why the failures look the way they do. **A model is optimised for text that is plausible in context — not for text that is true.**", "children": [] }
  ]
}
```

Each item is an **object**, not a string: `{ text, children }`. `ordered` picks
`<ol>` versus `<ul>`. `children` is an array that may hold nested `list` blocks
(`{ type: "list", ordered, items }`, the same shape recursively); the recursion is
bounded in `LessonBlock.jsx`'s `List` component and up to depth 8 in
`lib/lessonSearch.js`. Nested bullets matter — they are where the curriculum puts
its concrete examples — so a schema change that flattens them would hide the most
specific material from both the renderer and the in-lesson search.

An item may also carry an optional `checked` boolean, which makes `LessonBlock`
draw a **non-interactive** checkbox glyph (a styled `<span>`, deliberately not an
`<input>`) for the weekly-tracker template. **No item in the current corpus
carries `checked`** — all 42 lessons have zero — so that path renders nothing
today. It exists for the shared tracker document.

**`table`**

```json
{
  "type": "table",
  "head": ["Problem", "Track", "Approach"],
  "rows": [
    ["The model does not know my documents", "4 (RAG)", "Retrieve relevant passages, put them in context"],
    ["The model cannot use my tools", "5 (Agents)", "Define tools, let them call them"]
  ]
}
```

`head` is `string[]`; `rows` is `string[][]` — a rectangular grid, not objects.
No row is padded at parse time, so a renderer must not assume every row has
`head.length` cells. Cells go through `renderInline`. Tables run up to six columns,
which is why `LessonBlock.jsx` wraps them in a horizontal scroll container.

**Anything else** hits the `switch` default in `LessonBlock.jsx` and renders a
visible `Unsupported block type: <code>…</code>` paragraph. That is deliberate:
a new type added to `scripts/lesson-ast.mjs` without a renderer here fails loudly
on screen instead of vanishing silently. `verify-deep.mjs` asserts the string
never appears anywhere (§3 of VERIFICATION.md).

---

## 9. `search.json`

Built by `scripts/search-index.mjs`. Not prose — term postings and a list of
segments.

```jsonc
{
  "segments": [ { "p": "found-01-…", "a": "part-1-…", "h": "Part 1 — …", "pt": "Foundations" } ],
  "terms": "term:delta,delta,delta\n…",   // base36 deltas, ascending, one term per line
  "common": "the\nand\n…",                // too common to narrow, newline separated
  "termCount": 12345
}
```

Two things the consumer must know. Postings are **delta-encoded in base36**, so
`useSearch.js` accumulates them back to absolute segment ids. And the segment's
`p` is a **phase id**, not a track code — the index deliberately carries no track
code, because the codes it used to carry (`found`, `intern`) are not track ids
(`foundations`, `model-internals`) and passing one straight to a navigation
handler produced a search result that silently did not open. `trackIdForPhase()`
in `roadmaps.js` resolves the track from the phase id against the light index
instead, keeping one source of truth.

`useSearch.js` also reads `common` so it can tell the reader which of their words
were matched but set aside, rather than silently dropping them.

---

## 10. `shared.json`

The cross-track reference documents, from `ai-roadmaps/shared/`.

```jsonc
{
  "generatedAt": "…",
  "docs": [
    {
      "id": "study-rules",
      "kind": "…",
      "title": "…",
      "blurb": "…",
      "sourcePath": "ai-roadmaps/shared/study-rules.md",
      "blocks": [ /* the same six block types as a lesson */ ],
      "toc": [ /* same shape */ ],
      "blockCount": 123
    }
  ]
}
```

`blocks` is the same AST a lesson uses, which is what lets `Shared.jsx` reuse
`LessonBlock` unchanged. Two documents exist today (`study-rules`,
`weekly-tracker-template`); `resource-list.md` and `glossary.md` are registered in
the build's `SHARED_DOCS` but have not been authored, so they do not appear.
`Shared.jsx` renders an honest "nothing written yet" state when `docs` is empty
and lets the build log a note rather than failing.

---

## 11. `tracks.json`

A small, flat track list — `{ id, label, blurb, folder, phaseCount }` per track —
emitted for tooling that wants the ten declared tracks without the light index.
It is not imported by any component today, which is itself worth knowing before
you assume it is load-bearing.

---

## 12. Why `scripts/audit-shapes.mjs` exists

The `topics` and `resources` shapes have already caused a real crash.

A component that maps over an array and interpolates each element into a text node
does not care what the element is — until the element is an object. React throws
`Objects are not valid as a React child` at **render time**. `vite build` compiles
that component perfectly happily, because the mistake is not a syntax error, a
missing import, or a type error: it is a fact about data that the component never
sees at build time. The build guard,
`node scripts/build-content.mjs --check`, is green throughout, because it verifies
the **Markdown** is well-formed and knows nothing about what the React components
expect.

So the audit asserts, per field, the type of **one element of the array** — that
`skills` and `deliverableItems` are strings, and that `topics`, `tasks`,
`checklist`, `quiz`, `tools` and `resources` are objects — and it also records the
**nested key set** of each object field, so a field that quietly acquires a second
shape is caught even when every individual element is still an object. It
additionally checks each quiz question for at least two options, an in-range
`answerIndex`, and a non-empty `why`.

Run it after any change to the build or the Markdown:

```
node scripts/audit-shapes.mjs
```

It is fast (sub-second), needs no browser, and is the first offline step in
`scripts/check-all.mjs` for exactly that reason — it catches the cheapest class of
bug before anything slower runs.

If you add a field to a phase, add it to the `CONTRACT` map at the top of
`audit-shapes.mjs` in the same commit. A field the audit does not know about is a
field that can change shape unnoticed, which is the bug this file exists to stop.
