# Finetuning & Evals — Track Overview

> **Status: in progress.** One of this track's six phases is written and the remaining five are being authored now. This overview describes what the track **will** contain, based on the agreed plan, so you can decide whether to start it. Phase content is not yet available for the phases that are unwritten — do not expect to read them today.

## What this track is for

This track answers a question that beginners ask constantly and usually answer wrongly: **"should I fine-tune?"**

The honest answer, most of the time, is **no**. Fine-tuning changes *behaviour* — style, format, tone, narrow task competence. It is a poor way to add *facts*: it is expensive, the facts go stale, the model cannot cite them, and it often fails to memorise them at all. If your problem is "the model does not know about my documents", the answer is retrieval, and that is what the RAG track is for.

So this track teaches the decision framework **first**, and it teaches it as a genuine argument rather than a formality. Then it teaches what fine-tuning actually is — LoRA and QLoRA, the mechanisms that make it possible on hardware you can access for free — and how to run one.

**The second half of this track matters more than the first, and it is the part people skip.** Evaluation is the highest-leverage skill in this entire curriculum. A stochastic system producing high-dimensional output cannot be assessed by looking at a few results and forming an impression; that approach produces systems that demo beautifully and regress silently. Learning to build a small golden dataset, write objective pass criteria, use a judge honestly, and run a regression suite is what separates people who can build from people who can only demo.

It is also, per the Career track, **the most accessible junior entry point in the field.** If you are reading this curriculum with a job in mind, this track is not optional depth — it is the shortest route to employable evidence.

## Who this suits

You need **Prompting complete** and **Retrieval & RAG at least through Phase 5**. The evaluation material assumes you have tried to measure something already, and the fine-tuning material assumes you understand context, tokens and prompting.

You should be **comfortable with Python and with notebooks**. The training phases run in Colab or Kaggle, and debugging a training run is real programming work.

This track suits you if you have a **specific, high-volume, narrow, stable task** you already understand well — or if you want the evaluation skill, which is useful to absolutely everyone and is the reason to read this track even if you never train a model.

## What you need before starting

- **Prompting complete**, and RAG through Phase 5.
- **Python and basic notebook familiarity.**
- **A free Google account (for Colab) or a Kaggle account.** Both provide free GPU sessions, and both have session limits.
- **Somewhere persistent to save checkpoints.** Free notebook sessions are terminated without warning, and everything in the session filesystem is lost. This is the single most common way beginners lose a day's work.
- **Roughly 1–2 focused hours a day, five days a week.**

No paid compute is required. Every training phase is designed around free GPU sessions and small models. What you cannot do at zero cost is train anything large — and the track is honest that you do not need to, because the mechanism is the same at small scale.

## The phases, in order

| # | Phase | Length | Status | What it will establish |
|---|---|---|---|---|
| 1 | When to Fine-Tune, and When Not To | 1 week | **Written** | The decision framework: better prompt, then retrieval, then a tool, and only then fine-tuning. What fine-tuning changes versus what it cannot. The five underestimated costs |
| 2 | LoRA, QLoRA and PEFT | — | Planned | Full fine-tuning's memory cost and catastrophic forgetting; LoRA as a low-rank update that is mergeable; QLoRA making it fit on modest hardware; always comparing against the untuned baseline |
| 3 | Datasets and Running a Fine-Tune | — | Planned | The 80% of the work that is data: real inputs, verified outputs, the exact chat template, splitting by source, and why quality beats quantity |
| 4 | Evaluation Fundamentals | — | Planned | Golden datasets, objective pass criteria, LLM-as-judge with its biases and mitigations, and why benchmarks mislead |
| 5 | Distillation and Small Models | — | Planned | Training a small model on a larger one's outputs, the filtering step where quality is won, and the licence question |
| 6 | Running Evals in Practice | — | Planned | A minimal harness in about a hundred lines, cost control, failure classification, and the habit of regression testing |

**Read Phase 1 first regardless of the others.** It is written, it is the decision framework, and its honest answer — usually "don't" — will save you weeks.

**Do not start with Phase 2 if your actual goal is evaluation.** Phases 4 and 6 are the transferable ones. A learner who can build an evaluation suite but never trains a model is far more employable than one who has trained a model and cannot measure whether it helped.

## What you will be able to do at the end

- Decide, defensibly, whether a problem calls for fine-tuning, retrieval, a better prompt, or nothing at all — and explain the ordering.
- Explain what LoRA is mathematically and why it is mergeable with no inference cost, and what QLoRA adds that makes training possible on free hardware.
- Build a dataset from real inputs, format it in a model's exact chat template, and split it so your evaluation is honest.
- Run a fine-tune on a free GPU session and save the result somewhere persistent.
- Build a golden dataset with objective pass criteria, and explain why code beats a judge whenever the outcome is checkable.
- Describe the named biases of LLM-as-judge and the specific mitigations for each.
- Distil a larger model's behaviour into a small one, including the filtering step that decides whether it works.
- Write a minimal evaluation harness and use it as a regression gate on every change.
- Classify failures by type and fix one thing at a time.

## Roughly how long it takes

**6 phases, about 7 weeks at five sessions a week** once all phases are written. Phase 1 is available now; the rest are in progress.

At one hour a day, plan on ten weeks. The training phases are unpredictable — a failed run costs hours — so build slack into your plan.

## What being on a $0 budget costs you here

This track is genuinely constrained by budget, and it is better to say so clearly than to imply otherwise.

**What is achievable for free:**

1. **The entire evaluation half of the track.** Building golden datasets, writing checkers, using a judge, running regression suites and computing pass rates costs no money and needs no GPU. This is the more valuable half and it is fully available to you.
2. **Fine-tuning a small model to demonstrate the mechanism.** A small open-weight model, QLoRA, and a free Colab or Kaggle GPU session is enough to run a real fine-tune and measure the result. LoRA and QLoRA exist precisely so that this is possible on hardware like this.

**What you genuinely give up:**

1. **Training anything large.** Free sessions cannot train a large model, and the sessions are time-limited. The honest position: you do not need to. The mechanism is identical at small scale, and the writeup of a well-measured small fine-tune is worth more than an unmeasured large one.
2. **Long training runs.** Free sessions terminate, often without warning, and a run that exceeds the session limit is lost. Phase 3 will cover checkpointing to persistent storage as a mandatory habit rather than a tip.
3. **Distilling from a commercial API.** Beyond the cost, **many providers' terms prohibit training on their outputs.** This is a contractual restriction, not merely an expense, and Phase 5 will treat reading those terms as part of the work.
4. **Large-scale evaluation.** A judge running over thousands of cases is both rate-limited and costly on a free tier. The track teaches small suites deliberately — **20 to 50 cases** — which is the correct practice anyway.
5. **Comparing against many base models.** Free tiers limit you to a few families, so your comparisons will be narrow.

**The honest summary:** you can learn every mechanism in this track for free, run a real fine-tune on a real model, and build a genuinely useful evaluation suite. What you cannot do is train at scale, and no beginner needs to.

## How this track connects to the others

**Before it:** Prompting (all of it), RAG through Phase 5.

**Alongside it:** RAG Phase 5 covers evaluation for retrieval specifically; this track covers evaluation in general. Read them close together and the material compounds.

**After it:** Career. The evaluation skill built here is the most directly employable thing in the curriculum, and Phase 4's harness is a portfolio artifact that fits the Career track's "one deep project with an eval suite beats five demos" argument exactly.

## The honest caveat

Fine-tuning practice moves quickly: frameworks, quantized formats and free-notebook policies all change on a scale of weeks, and specific model names in this track are volatile by nature.

The durable parts: fine-tuning changes behaviour more than it adds knowledge; LoRA is a low-rank update to a frozen weight matrix; QLoRA makes it fit; catastrophic forgetting is real and LoRA reduces it; you must compare against an untuned baseline; and a judge has known biases that must be mitigated. Those will still be true in five years, and they are what the track is for.

**The evaluation half is the least volatile material in the entire curriculum.** Code-beats-judge, golden datasets, pass criteria, regression suites and failure taxonomies are not going to change.

## Start here

1. Confirm Prompting is complete and RAG is through Phase 5.
2. Read [Phase 1](01-phase-when-to-finetune.md) — it is written and it is the decision framework.
3. Track your progress in [`checklist-master.md`](checklist-master.md).
4. If your goal is employment rather than training models, read the checklist's evaluation section first and treat it as your priority.
