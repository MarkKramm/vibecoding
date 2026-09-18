# Vibecoding Craft — Track Overview

> **Status: complete.** All eight phases of this track are written. The track is the one the project is named after, and every phase carries dated and flagged volatile claims, with `**Unverified**` markers where a claim could not be confirmed from a primary source.

## What this track is for

This is the track the whole project is named after, and it is the one with the sharpest thesis:

> **Speed is real, and so is the illusion of progress. The skill is telling them apart.**

Vibecoding means building software by directing models in natural language and iterating on results, rather than typing every line yourself. That makes an enormous amount of work genuinely easier — boilerplate, unfamiliar APIs, CRUD, tests, refactors. It also makes a specific kind of failure **deceptively** easy: code that looks plausible, reads fluently, and is wrong.

The central danger is stated as plainly as it can be: **code you cannot read is code you cannot own.** If you cannot explain what a function does, you cannot debug it, you cannot extend it, and you cannot defend it. You have not built software; you have acquired a liability that appears to work.

So this track teaches the craft around the model rather than the model itself: specifying what you want, reading what you got, testing it against a stated contract, debugging it when it breaks, managing a long session without losing the thread, working with agentic tools without trusting their summaries, and shipping something you can stand behind.

## Who this suits

You need **Foundations**, **Prompting**, and ideally **Agents**. This is the one track that genuinely needs several others behind it, because its every phase is an application of material taught elsewhere: specification is Prompting Phase 1, tests-as-contract is Agents Phase 3, context management is Agent Phase 5 and Prompting Phase 5, and review is the verification discipline from Finetuning & Evals.

You should be **comfortable reading and writing code** in at least one language — not expert, but able to look at a function and say what it does. **If you cannot yet read code at all, this track will not work for you yet**, and that is not a judgement about you; it is that the track's entire method is reading generated code critically, and there is nothing to build that on.

The right preparation is Prompting plus some real programming practice, in any language.

## What you need before starting

- **Foundations, Prompting, and preferably Agents and Prompting Phase 5.**
- **Able to read and write basic code**, in any language.
- **Git installed** and a GitHub account. Committing before an agent run is a safety practice this track teaches, not an aside.
- **An AI coding tool.** A free tier or a local model is sufficient; the track is written to work on a $0 budget, and the craft it teaches is not tool-specific.
- **Roughly 1–2 focused hours a day, five days a week.**

## The phases, in order

| # | Phase | Status | What it will establish |
|---|---|---|---|
| 1 | What Vibecoding Actually Is | Written | An honest definition, what it makes easy versus deceptively easy, the spectrum from autocomplete to agentic, and the track's thesis |
| 2 | Specification and Intent | Written | The real bottleneck is specification, not generation: goal, constraints, non-goals, acceptance criteria, and converting a vague wish into an executable brief |
| 3 | Reading and Reviewing Generated Code | Written | The core survival skill: reviewing at the right altitude, red flags, and verifying that an API exists rather than assuming it |
| 4 | Tests as the Contract | Written | Writing the test first as a specification, and why a test written to pass proves nothing |
| 5 | Debugging With and Without AI | Written | Forming a hypothesis before asking, giving the model real evidence, and knowing when to stop asking and start reading |
| 6 | Managing Context in a Coding Session | Written | Why long sessions degrade, externalising state to files, and when to reset rather than continue |
| 7 | Working With Coding Agents | Written | Bounded tasks, reviewing diffs rather than summaries, committing before a run, and spotting scope creep |
| 8 | Shipping What You Build | Written | Security review of generated code, dependency hygiene, licences, disclosure, and maintainability |

**Read them in order.** Phases 2, 3 and 4 are the load-bearing trio — specify, read, test — and everything after them assumes those three. Phase 8 is the one that turns a project into something you can publish and defend.

## What you will be able to do at the end

- State honestly what vibecoding is good at and where it fails, and place your own workflow on the spectrum from autocomplete to autonomous agent.
- Turn a vague wish into a brief an agent can execute, including non-goals and acceptance criteria.
- Review generated code at the right altitude, and name the specific red flags that indicate a real defect.
- Verify that an API or library method actually exists before trusting code that calls it.
- Write tests as a specification and use them as the gate for accepting a change.
- Explain why a test that was written to pass proves nothing.
- Form a hypothesis before asking a model for help, and supply real evidence rather than a description.
- Recognise when a coding session has degraded, and reset with a handoff note instead of continuing.
- Give an agent a bounded task and review the diff rather than the summary.
- Commit before an agent run so you can revert.
- Review generated code for the real risks: secrets, missing authorization, injection, dependency supply chain.
- Write an honest README and a writeup that states what your project does not do.

## Roughly how long it takes

**8 phases, about 9 weeks at five sessions a week** once the phases are written.

At one hour a day, plan on twelve to thirteen weeks. This track is practice-heavy by design; the reading is short and the iteration is not.

## What being on a $0 budget costs you here

This track is more budget-sensitive than most, and honestly so.

**What is achievable for free:** the entire craft. Specification discipline, code review, test-first workflow, debugging method, context management and shipping hygiene are all free — they are habits and techniques, not compute. A free coding tool or a local model supports every practice task.

**What you genuinely give up:**

1. **Frontier coding models.** The strongest coding agents are paid, and the difference in capability is real. On a free tier or a local model you will see more wrong code, more invented APIs, and weaker long-context behaviour. **This is inconvenient but not disqualifying** — arguably the opposite: if you learn to review and test against a weaker model, you will be better at reviewing and testing than someone who never had to.
2. **Long autonomous agent runs.** Agentic coding consumes context and tokens quickly, and free tiers are rate-limited. This is the strongest practical argument for a local coding model, and it is why Phase 6 (context management) and Phase 7 (working with agents) reward careful reading rather than skimming.
3. **Some proprietary tooling.** Some agentic coding environments are paid. Every phase names a free route, and the craft transfers — the discipline of reviewing a diff is the same whether the diff was produced locally or by a paid agent.

**One honest warning.** Because AI-assisted development consumes quota fast, a $0 budget makes **discipline more important, not less.** An undisciplined workflow on a free tier runs out of quota before it runs out of task, and then you are debugging a half-finished change with no budget to finish it. The commitment-before-you-run habit in Phase 7 exists for exactly this reason.

## How this track connects to the others

**Before it:** Foundations, Prompting, and ideally Agents.

**Alongside it:** nothing, deliberately. This track needs your full attention, because it is about how you work rather than what you know.

**After it:** Safety & Ethics, which covers the security, privacy and honesty questions this track raises, and Career, which teaches you how to turn what you built here into evidence.

The recommended pairing **earlier** in the curriculum is Prompting alongside Vibecoding Craft, because specification and prompt design are the same skill seen from two angles.

## The honest caveat

This is the **most volatile track in the curriculum**, and by a wide margin. Coding tools, agent frameworks and model capabilities in this area are changing on a scale of months, and specific workflow advice goes stale faster here than anywhere else.

So the track teaches the *durable* discipline and treats the tools as interchangeable: **specify precisely, read critically, test against a stated contract, debug by hypothesis, manage context deliberately, review the diff and not the summary.** Those practices are model-independent and will still be correct when today's tools are unrecognisable.

What will date: which tool is best, what a free tier includes, what a coding agent can do unsupervised. Every such claim in this track will be dated and flagged, and no conclusion will depend on one.

## Start here

1. Confirm you have Foundations and Prompting behind you, and that you can read basic code.
2. Read [`../shared/study-rules.md`](../shared/study-rules.md) if you have not — this track is where the anti-burnout rules earn their keep, because AI-assisted work makes it very easy to feel productive while learning nothing.
3. Track your progress in [`checklist-master.md`](checklist-master.md).
4. Begin with [Phase 1](01-phase-what-vibecoding-is.md). Work in order — the phases depend on each other more than any other track's do, and Phase 3 is the one the rest rest on.

> **On reading the phases in order.** Every phase here assumes the one before it. Phase 3 — reading generated code — is the one to prioritise if you must choose, because it is the phase that makes the rest safe: Phases 4 through 8 are all verification against a stated intent, and none of them work if you cannot tell whether the code does what it claims. **Phase 1 carries dated, volatile claims about tools that will date quickly. Its failure taxonomy will not** — that follows from how the models work, and it has outlived several generations of them.
