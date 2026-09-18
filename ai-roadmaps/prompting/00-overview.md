# Prompting — Track Overview

## What this track is for

Most people prompt by trial and error, get a result that looks fine, and stop. This track replaces that with something you can do on purpose.

The central idea is that **a prompt is a specification, not a request**. When output is wrong, the useful question is not "how do I phrase this better?" but "what did I fail to specify?" That reframing is what makes prompting a skill rather than a knack.

You will learn to control what a model attends to, when examples help and when they mislead, why asking a model to reason changes its accuracy, how to get output you can parse in code, and — most importantly — how to tell whether a change actually improved anything. That last part is what separates prompting from guessing, and it is why this track ends with failure modes and evaluation rather than with a list of tricks.

## Who this suits

You need **Foundations Phases 1 through 5**, or equivalent. Specifically: you should know what a token is, how the context window behaves, and roughly what sampling does. The track does not re-teach those, and several phases will not make sense without them.

You do **not** need to be able to program for Phases 1–3 and 5–7. Phase 4 needs basic Python, because structured output is verified in code — the whole point of that phase is that a schema is enforced by a parser rather than trusted.

This track is the **highest-leverage starting point after Foundations** for someone who wants to be useful quickly. It applies immediately, needs no infrastructure, and is fully doable on a free tier.

## What you need before starting

- **Foundations complete through Phase 5.**
- **Basic Python** for Phase 4 (and helpful for Phase 7).
- **A free account with at least one hosted model provider**, plus ideally a local model for comparison. Two different model families make Phase 7 much more informative.
- **Roughly 1–2 focused hours a day, five days a week.**

Everything here works on free tiers. No paid API tier is required, and Phase 5 is written with the free-tier constraints in mind.

## The phases, in order

| # | Phase | Length | What it establishes |
|---|---|---|---|
| 1 | The Anatomy of a Prompt | 1 week | The parts of a prompt — instruction, context, data, format — and which part is failing when output is wrong |
| 2 | Few-Shot Prompting and Examples | 1 week | How examples steer behaviour, when they help, and the specific ways they mislead |
| 3 | Chain-of-Thought and Reasoning Techniques | 1 week | Why step-by-step reasoning improves accuracy, when it does not, and how reasoning models change the advice |
| 4 | Structured Output and Schema Enforcement | 1 week | Getting machine-parseable output reliably, with the validation that makes it trustworthy |
| 5 | Context Engineering | 2 weeks | Deliberately deciding what occupies the window — the phase that most repays the time |
| 6 | Decomposition and Prompt Chaining | 1 week | Splitting a task into steps, and the failure modes that appear when you do |
| 7 | Prompt Failure Modes and Evaluations | 1 week | How prompts fail, and how to measure an improvement instead of assuming one |

**Phases 1 through 4 are sequential.** Phase 5 is the pivot of the track and assumes 1–4. Phases 6 and 7 can be swapped. Do not skip Phase 7 — it is the one that makes everything before it checkable.

## What you will be able to do at the end

- Diagnose a bad output by identifying which part of the prompt was underspecified, rather than rewriting at random.
- Decide deliberately between zero-shot, few-shot and reasoning prompts, and explain the tradeoff.
- Explain why chain-of-thought helps on multi-step problems and hurts on some others, and why reasoning-trained models change the calculation.
- Get reliable JSON from a model and validate it in code rather than trusting it.
- Design what goes in a context window on purpose: what to include, what to summarise, what to drop, and where to put it.
- Break a task into chained steps and explain why a chain beats one large prompt for a given problem.
- Build a small evaluation set and use it to tell a real improvement from a coincidence.
- Recognise prompt injection as a structural risk rather than a phrasing problem.

## Roughly how long it takes

**7 phases, about 8 weeks at five sessions a week.** Phase 5 is the longest and the one most worth doing slowly.

At one hour a day, plan on ten to eleven weeks. The reading is lighter than Model Internals; the practice tasks take longer, because prompting is learned by iterating against real output.

## What being on a $0 budget costs you here

This track is nearly undiminished on free tiers, with two honest caveats.

**What you get in full:** every technique in the track. Prompt structure, examples, reasoning, schemas, context design, chaining and evaluation all work identically on a free tier or a local model. This is one of the three tracks that is effectively full-strength on zero budget.

**What you give up:**

1. **Reasoning-effort controls.** Several providers gate reasoning-token budgets or effort settings behind paid tiers. Phase 3 teaches the mechanism and tells you how to observe the same behaviour with a locally run reasoning-capable model, or by reasoning explicitly in the prompt instead.
2. **Comparing across many model families.** Free tiers give you one or two. Phase 7 is much richer if you can test the same prompt on two models, so use one hosted free tier plus one local model — that gives you the comparison without spending anything.
3. **High-volume iteration.** Free tiers are rate-limited, so a 200-case evaluation set is impractical. Phase 7 teaches the small-set approach deliberately: **20 to 50 well-chosen cases**, which is both affordable and, for learning purposes, better than a large noisy set.

Being free here costs you experiment *volume*, not experiment *quality*. And a smaller, well-chosen set is the honest recommendation regardless of budget.

## How this track connects to the others

**Before it:** Foundations, especially Phases 3, 4 and 5.

**Alongside it:** Vibecoding Craft is the recommended pairing — different parts of your attention, and the specification discipline transfers directly.

**After it:** Retrieval & RAG builds on context engineering more than on any other phase. Agents depends on structured output (Phase 4) and chaining (Phase 6) absolutely — tool calling is structured output with a loop around it. Finetuning & Evals picks up where Phase 7 leaves off.

## The honest caveat

Prompting is the fastest-moving surface in this curriculum. Specific techniques go in and out of fashion, and advice written for one model generation is often wrong for the next. **Reasoning-trained models in particular have invalidated a lot of previously good advice** — a technique that helped a base chat model can actively hurt a model that reasons internally.

So this track teaches *why* techniques work rather than a catalogue of them. If you understand that few-shot examples work by demonstrating a pattern in the context, you can evaluate for yourself whether the technique still applies when the model changes. If you only memorised "always use three examples", you cannot.

## Start here

1. Confirm Foundations Phases 1–5 are behind you.
2. Read [Phase 1](01-phase-anatomy-of-a-prompt.md).
3. Track your progress in [`checklist-master.md`](checklist-master.md).
4. Read [`../cost/07-phase-freemium-playbook.md`](../cost/07-phase-freemium-playbook.md) early if you are worried about rate limits — it is written for exactly your situation.
