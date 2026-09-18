# Phase Authoring Template

Copy this file's shape exactly. The build fails on a missing section, a wrong
field order, or a checklist item without an id, so starting from a passing
skeleton costs less than fixing one later.

**Replace every `<...>` placeholder. Delete nothing mandatory.**

---

```markdown
---
id: <track-short>-<NN>-<slug>
track: <track-id>
phase: <N>
order: <N * 10>
title: <Title Case Title>
duration: <N weeks>
duration_weeks: <N>
energy_mix: [low, normal]
deliverable: portfolio/<track-folder>/<NN>-<slug>.md
exit_criteria: >
  <One or two sentences. What the reader can DO. Not what they read.>
---

# Phase <N> — <Title>

## Goal of this phase

<One paragraph. Start from the problem, not the topic. What can the reader do
afterwards that they could not before? State it concretely.>

## Estimated time

**<N weeks>** at 1–2 hours a day, 5 days.

<One or two sentences on why that estimate is what it is, and what to do if the
reader has less time.>

## Skills you'll gain

- <Ability, phrased as something the reader can do>
- <Ability>
- <Ability>
- <Ability>

## Specific topics to learn

### <Sub-topic heading>

- <Topic>
- <Topic>

### <Sub-topic heading>

- <Topic>
- <Topic>

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| <Name> | <What it is for> | Free/open-source | <https://url> | <What to do with it> | <Alternative, or —> |

<Every row must have all 6 columns. A row whose Cost mentions paid or freemium
MUST name something in the last column, or the build fails.>

## Free/cheap resources

- **<Name>** — https://<url>
- **<Name>** — https://<url>

<Every bullet needs a URL. These render as clickable links.>

## Lesson: <A Real Title, Not "Introduction">

### Part 1 — <The problem this mechanism solves>

<Start from what breaks without it, in the reader's terms. Then the mechanism.
Then what it lets them predict. Then where it stops helping.>

<Use tables, code fences with a language, and blockquotes for asides.>

> <An analogy, followed on the page by where the analogy breaks.>

### Part 2 — <Next idea>

<...>

### Part <N> — <The limits>

<The fourth step — where the mechanism stops working and what that costs — is
the one most writing skips and the one that produces judgement. Do not skip it.>

## Hands-on practice tasks

1. <A real task with a concrete output.> <!-- id: <phase-id>-t01 band: quick energy: low -->
2. <A task taking 30–90 minutes.> <!-- id: <phase-id>-t02 band: focused energy: normal -->
3. <A task over 90 minutes.> <!-- id: <phase-id>-t03 band: deep energy: high -->
4. <Optional.> <!-- id: <phase-id>-t04 band: focused energy: normal -->

<Field order is FIXED: id, then band:, then energy:. band is one of
quick|focused|deep|ongoing. energy is one of low|normal|high.>

## Common Pitfalls

**<Mistake stated as a sentence.>** <Why it happens and what it costs.>

**<Mistake.>** <Explanation.>

**<Mistake.>** <Explanation.>

## Deliverable / proof of work

<Write `portfolio/<path>.md` containing:>

- **<Section>** — <what goes in it>
- **<Section>** — <what goes in it>
- **<Section>** — <what goes in it>

## Checklist

- [ ] <Ability> <!-- id: <phase-id>-c01 energy: low -->
- [ ] <Ability> <!-- id: <phase-id>-c02 energy: normal -->
- [ ] <Ability> <!-- id: <phase-id>-c03 energy: low -->

<Each item is an ABILITY ("I can X"), not a topic. energy uses the same
vocabulary.>

## Quiz

### Q1. <A scenario or distinction, not a definition recall.> <!-- id: <phase-id>-q01 energy: normal -->

- [ ] <Distractor a half-informed reader would believe>
- [x] <The correct answer>
- [ ] <Distractor>
- [ ] <Distractor>

**Why:** <Why the answer is right AND why the tempting wrong one is wrong.>

<Rules: at least 3 options, EXACTLY ONE [x], a **Why:** line immediately after
the options, an authored unique id, a valid energy. Vary the position of the
correct answer across questions — the audit fails a quiz where one position
exceeds 50%.>

### Q2. <...> <!-- id: <phase-id>-q02 energy: low -->

<...>

## You're ready to move on when...

<The same text as exit_criteria in front-matter, or a slightly fuller version.
Concrete and testable.>

## Free vs Paid

### What's free is enough

<Be specific about what the free path actually covers for THIS phase.>

### What a paid tier adds

<What money buys here, honestly. If nothing, say nothing and explain why.>

### When it's worth paying

<A real threshold, not "when you can afford it".>
```

---

## Checklist before submitting

Run these; do not eyeball them.

```bash
node scripts/build-content.mjs --check
node scripts/lint-content.mjs
node scripts/audit-lesson-ast.mjs
node scripts/audit-quiz.mjs
```

- [ ] Build passes with no errors
- [ ] `task ids: 0 minted from position` — every task has an authored id
- [ ] `task bands: 0 without a band`
- [ ] Every checklist item has `<!-- id: ... energy: ... -->`
- [ ] Every practice task comment is `id:` then `band:` then `energy:`
- [ ] No duplicate ids anywhere in the corpus
- [ ] Quiz: exactly one `[x]` per question, `**Why:**` on every one, positions varied
- [ ] Lesson is 2,500–4,500 words
- [ ] Every volatile specific is dated and flagged as changeable
- [ ] No invented citations, numbers, or API details
- [ ] Every free resource bullet has a URL
- [ ] Every paid tools row names a free alternative

## The quality bar

Three things separate a phase worth reading from one that merely passes the build:

**1. It teaches the mechanism, not the vocabulary.** The reader should be able to *predict* behaviour they have not seen. A lesson that defines terms has produced a glossary entry, and the glossary already exists.

**2. It explains where the technique stops working.** The fourth step. A reader who knows only what a technique does will apply it where it does not belong; one who knows its failure boundary will not. This is the section most likely to be missing and the one that produces judgement.

**3. Every volatile specific is dated.** "As of early 2026, X" plus a sentence saying it may have moved and where to check. Never a bare number presented as permanent fact. If you cannot verify a specific, mark it `**Unverified**` rather than asserting it.
