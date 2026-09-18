# Content Guide

Authoring rules for the curriculum under `ai-roadmaps/`. This is the document to read before writing a new phase, and the one to check a draft against.

The contract that makes the content machine-readable is [`CONTENT-SCHEMA.md`](CONTENT-SCHEMA.md). **This** document is about the part no schema can check: whether the writing is actually any good.

---

## The one rule everything else serves

**Teach the mechanism, not the vocabulary.**

A reader who can define "context window" has learned a phrase. A reader who can say *why* a longer context costs more, *why* recall degrades in the middle of it, and *what they would do* about a document that does not fit has learned a mechanism. Only the second reader can handle a situation the lesson did not cover — which is every situation that matters, in a field that changes this fast.

The test for any paragraph: **does it let the reader predict something?** If a paragraph only names things, it is a glossary entry wearing a lesson's clothes. Glossaries earn their place in [`shared/glossary.md`](../ai-roadmaps/shared/glossary.md); lessons earn theirs by explaining.

---

## The volatility rule

This is the most important authoring constraint specific to this subject, and it exists because AI writing rots faster than any other technical writing.

**Separate the durable claim from the volatile one, and mark which is which.**

| Layer | Examples | Treatment |
|---|---|---|
| **Durable** | How attention computes weights; why a KV cache exists; what chunking does; why prompt caching rewards a stable prefix; why long contexts degrade | Teach it as fact. It follows from the architecture and will outlive the models |
| **Volatile** | Model names, context sizes, prices, benchmark scores, "the best model for X", API parameter names | Use as an *example*, date it, and never let a lesson's conclusion depend on it |

Every volatile figure must be:

1. **Dated** — "as of early 2026" or a specific month,
2. **Flagged** — a following sentence that says it may have changed and where to check, and
3. **Non-load-bearing** — the lesson's point must still hold when the number is wrong.

```markdown
<!-- Good: the number illustrates a stable point -->
A frontier model in 2026 might charge roughly $3 per million input tokens and
$15 per million output tokens — output is typically several times the input
price, because generating a token costs more compute than reading one. The
ratio is the durable part; the absolute figures will have moved by the time
you read this. Check the provider's pricing page.

<!-- Bad: the lesson *is* the number -->
The best model is Model X, which costs $3 per million tokens and has the
largest context window.
```

The second version is not merely likely to age badly. **It is a claim the curriculum cannot support**, because nothing in this repository can re-verify it. An unverifiable specific presented as fact is the failure mode this rule exists to prevent.

### Nothing invented, ever

No fabricated citations, benchmark numbers, API parameters, model capabilities, or dates. If a fact cannot be verified, either omit it or mark it explicitly:

```markdown
> **Unverified** — I could not confirm this against a primary source. Treat it
> as a lead to check, not as a fact.
```

A lesson that admits one gap is trustworthy about its other claims. A lesson that invents one number has no credibility left for any of them, and the reader has no way to tell which one it was.

---

## Phase file structure

Every `NN-phase-*.md` follows the same shape. The build fails on a missing mandatory section, so this is enforced rather than encouraged.

| Order | Heading | Mandatory | Purpose |
|---|---|---|---|
| 0 | YAML front-matter | ✅ | Machine-readable identity — see the schema |
| 1 | `# <Phase title>` | ✅ | Human title |
| 2 | `## Goal of this phase` | ✅ | One paragraph. What you can *do* afterwards |
| 3 | `## Estimated time` | ✅ | Realistic, not aspirational |
| 4 | `## Skills you'll gain` | ✅ | Bullets, phrased as abilities |
| 5 | `## Specific topics to learn` | ➖ | Sub-headings with bullet lists |
| 6 | `## Tools for This Phase` | ✅ | 6-column table |
| 7 | `## Free/cheap resources` | ✅ | `Name — URL` lines |
| 8 | `## Lesson: <a real title>` | ✅ | **The teaching.** The bulk of the file |
| 9 | `## Hands-on practice tasks` | ✅ | Numbered, with id/band/energy comments |
| 10 | `## Common Pitfalls` | ➖ | Mistakes that look like success |
| 11 | `## Deliverable / proof of work` | ✅ | What you build to prove the phase landed |
| 12 | `## Checklist` | ✅ | `- [ ]` with id/energy comments |
| 13 | `## Quiz` | ✅ | Questions with exactly one `[x]` and a `**Why:**` |
| 14 | `## You're ready to move on when...` | ✅ | Exit criteria, quoted in front-matter |
| 15 | `## Free vs Paid` | ✅ | Three sub-sections |

### The tools table

Columns are fixed, in this order:

```markdown
| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Ollama | Run open-weight models locally | Free/open-source | https://ollama.com/ | Pull a small model and compare it to a hosted one | llama.cpp directly |
```

A paid or freemium row **must** name a free alternative, and the build fails without one. The curriculum is built for a $0 budget; a tool that cannot be used without paying is not a tool this curriculum can recommend, only one it can mention.

Column order is not cosmetic — the build parses positionally, and a reordered table parses as nonsense rather than failing helpfully.

---

## Writing the lesson

The lesson is 80–95% of a phase file and the reason the curriculum is worth reading. Everything above is scaffolding around it.

### Length and shape

- **Target 2,500–4,500 words.** Under 2,500 is usually a phase that described its topic rather than taught it. Over 4,500 is usually two phases that should be split.
- **Structure with `###` parts.** A reader should be able to skim the headings and get the argument. Use `####` for sub-parts.
- **Front-load the point.** State what the mechanism is and why it matters before the details. A reader who stops after two paragraphs should still have gained something true.

### Voice

Write **to** the reader, as a knowledgeable person explaining something they find genuinely interesting. Direct address, plain language, no throat-clearing.

```markdown
<!-- Good -->
The KV cache exists to avoid recomputing something that cannot change. When a
model generates token 500, the keys and values for tokens 1–499 are identical
to what they were when it generated token 499 — so it stores them.

<!-- Bad -->
In this section, we will explore the concept of the KV cache. It is important
to note that the KV cache plays a crucial role in modern inference systems.
```

The second version says nothing, at length. "It is important to note" is a tell that the sentence following it was not important enough to note on its own.

### Structure of an explanation

The shape that works, used throughout this curriculum:

1. **The problem** — what breaks without this mechanism?
2. **The mechanism** — what is actually happening?
3. **The consequence** — what does it let you predict or do?
4. **The limit** — where does it stop helping, and what does that cost?

The fourth step is the one most writing skips, and it is the one that produces judgement. A reader who knows only what a technique does will apply it where it does not belong; a reader who knows its failure boundary will not.

### Analogies

Use them, then **break them on the page.** An analogy that is never retired becomes a misconception.

> Think of the context window as a desk. Everything on the desk is visible to the model at once, and things not on the desk may as well not exist. The analogy is useful right up to the point where it misleads: a desk has no *middle*, and attention does — material in the middle of a long context is measurably less likely to be used than material at either end.

### Concrete over abstract

Numbers, examples, and real snippets. "Chunk sizes between 200 and 800 tokens are a common starting range" beats "chunk size should be chosen carefully."

When you give an example of model output, **keep it short and label it as illustrative**. A long fake transcript teaches the reader to expect a fluency that the real system will not deliver.

### Code and commands

- Fence every block with a language: ```` ```python ````, ```` ```json ````, ```` ```bash ````.
- Keep examples runnable where possible, and say what output to expect.
- Prefer standard-library and free tooling. A lesson whose example requires a paid API key has excluded its own reader.
- **Never present an API detail you have not verified or dated.** Endpoint names and parameter names change; say which provider and roughly when.

### Marking tiers

When material is genuinely optional depth, say so rather than padding the main line:

```markdown
> **Optional depth.** This section goes further into the arithmetic than the
> rest of the phase needs. You can skip it and still complete the deliverable.
```

---

## Quizzes

Quizzes are **diagnostic, not decorative**. They exist so a reader can find out whether a phase landed before building three later phases on a misunderstanding.

So: **test the distinction, not the definition.** A question whose answer is a phrase the lesson bolded is a question about memory. A question that describes a situation and asks what follows is a question about understanding — and getting it wrong tells the reader something they can act on.

```markdown
<!-- Weak: tests that the term was read -->
### Q1. What is a context window? <!-- id: found-03-q01 energy: low -->

<!-- Strong: tests whether the mechanism transferred -->
### Q1. A prompt fits inside the context window but the model ignores an
instruction placed 60% of the way through. What is the most likely cause? <!-- id: found-03-q01 energy: normal -->
```

Distractor design is the whole craft. Every wrong option should be **something a reader who half-understood would believe** — otherwise the question measures nothing. "The provider's server is broken" is not a distractor, it is filler.

Rules the build enforces: at least 3 options, exactly one `[x]`, a `**Why:**` on the line after the options, an authored unique id, a valid energy. Rules the audit enforces: no correct-answer position above 50%, no unused positions.

The `**Why:**` is not optional and not a formality. It is what turns a wrong answer into a lesson, and it is the single highest-value sentence in the quiz.

---

## Checklist and task authoring

Checklist items are **abilities**, not topics.

```markdown
<!-- Good -->
- [ ] I can estimate whether a document fits a context window without pasting it. <!-- id: found-03-c04 energy: normal -->

<!-- Bad -->
- [ ] Context windows <!-- id: found-03-c04 energy: low -->
```

Every item needs an `id` and an `energy`. Every practice task needs an `id`, a `band`, and an `energy`. The field order in the comment is fixed and the parser rejects a reordered one — see the schema for why that strictness is deliberate.

**Bands must be honest.** `quick` means under 30 minutes. A task that takes three hours and is labelled `quick` will be offered to someone with 20 minutes, and will teach them that the schedule lies.

---

## Before you commit a phase

- [ ] All 11 mandatory headings present, in order, spelled exactly as the schema lists
- [ ] Front-matter `id`, `track`, `phase`, `order` consistent with the filename
- [ ] `duration` and `duration_weeks` agree with each other
- [ ] Every checklist item has `id` and `energy`
- [ ] Every practice task has `id`, `band`, `energy` **in that order**
- [ ] Tools table has 6 columns on every row, and every paid row names a free alternative
- [ ] Lesson is within the length range and every `###` part has a point
- [ ] Every volatile specific is dated and flagged
- [ ] Every analogy that could mislead is explicitly retired
- [ ] Quiz has ≥3 options per question, exactly one `[x]`, a `**Why:**` on each
- [ ] Correct answers are spread across positions
- [ ] `npm run lint:content` passes
- [ ] `node scripts/audit-lesson-ast.mjs` reports zero loss for this file

---

## A closing note on tone

The reader is smart and starting from nothing, and those two facts are compatible. Write for a capable adult who has simply never encountered this material — not for a child, and not for a peer who already knows the field and needs only the summary.

The most common failure in AI writing aimed at beginners is **starting with the abstraction** because it is easier to write. Resist it. Start with the problem the mechanism solves, in the reader's own terms, and let the term arrive once it has something to attach to.
