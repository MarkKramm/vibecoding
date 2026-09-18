# Model Internals — Track Overview

## What this track is for

Foundations taught you what these systems *are*. Model Internals teaches you what happens when one actually runs, and what that costs.

This is the track that turns you from someone who uses a model into someone who can reason about why a deployment behaves the way it does. Why does generation slow down as a conversation gets longer? Why does the first token take noticeably longer than the rest? Why does a quantized model fit on hardware the full-precision one does not? Why does serving more users not cost proportionally more?

Those are not trivia. They are the questions that decide whether a system you build is affordable, whether it fits on the hardware you have, and whether the latency is acceptable to a real user. You answer them by understanding the machinery, not by memorising benchmarks.

This track is also the honest counterweight to a lot of marketing. "Efficient inference", "quantized", "2–4× faster" — once you know what the KV cache is and what memory bandwidth does, those claims become checkable rather than impressive.

## Who this suits

You should have finished **Foundations**, or already know what tokens, attention and the KV cache are. This track assumes Phase 3, 4 and 5 of Foundations and does not re-teach them.

Some comfort with reading a diagram and a table is useful. No mathematics beyond arithmetic and the idea of a ratio. Phase 2 is the most technical read in the curriculum; it is written to be readable by someone who has never seen a matrix multiplication, but it does not pretend the material is simple.

**This is not the track to start with.** If you are impatient to build things, do Prompting and Vibecoding Craft first and come back. Internals is slower reading, and its payoff is that everything else becomes reasoning rather than recipe.

## What you need before starting

- **Foundations complete**, or equivalent knowledge.
- **A computer that can run Python.** Phase 4 benefits from a machine with a discrete GPU, but every phase has a CPU-only path.
- **Roughly 1–2 focused hours a day, five days a week.** The two-week phases here are genuinely two weeks.
- **Patience with reading.** This track has more diagrams and fewer runnable commands than any other.

No paid tool is required. The memory arithmetic in Phases 3 and 4 is done on paper and in a notebook; you do not need to rent a GPU to understand why a model does or does not fit in one.

## The phases, in order

| # | Phase | Length | What it establishes |
|---|---|---|---|
| 1 | The Anatomy of Inference | 1 week | The two-phase structure of generation — prefill and decode — and why they have completely different bottlenecks |
| 2 | Transformer Architecture in Detail | 2 weeks | The full stack: attention variants, feed-forward layers, normalization, positional encoding, and how they fit together |
| 3 | The KV Cache in Depth | 2 weeks | How the cache is sized, why it grows, what it costs in memory, and how serving systems manage it |
| 4 | Quantization and Precision | 1 week | Numeric precision, what quantization trades away, and why a 4-bit model is not simply "worse" |
| 5 | Serving, Batching, and Throughput | 1 week | How real deployments serve many requests at once, and the latency-versus-throughput trade |
| 6 | The Model Landscape and Scaling | 1 week | Why models differ, what scale buys, and how to read a model card without being misled |

**Read Phases 1 through 3 in order** — they build one argument about where time and memory actually go. Phases 4, 5 and 6 can be read in any order after Phase 3, and Phase 6 is the most volatile.

## What you will be able to do at the end

- Estimate the memory a model needs at a given precision, and say whether it fits on a named piece of hardware.
- Estimate KV cache size from sequence length, layer count and head dimensions — the arithmetic that explains most long-context behaviour.
- Explain why time to first token and tokens per second are governed by different resources, and predict which one a change will affect.
- Explain the difference between the two phases of inference to someone who thinks generation is one process.
- Describe what quantization trades away and choose a precision for a given constraint.
- Read a model card and identify which claims are measured, which are marketing, and which are simply not comparable to another model's numbers.
- Explain why batching improves throughput and can worsen latency, and why continuous batching changes the picture.

## Roughly how long it takes

**6 phases, about 8–9 weeks at five sessions a week.** Two of the six phases are two-week reads, and they are the ones that carry the core argument.

At one hour a day, plan on eleven to twelve weeks. This is the slowest track in the curriculum per phase, and that is deliberate rather than a defect.

## What being on a $0 budget costs you here

Less than you would expect, and the honest limits are specific.

**What you can do for free:** all the memory and cache arithmetic, quantization comparisons on a small model you run locally, and every conceptual part of Phases 1, 2, 3 and 6. A small open-weight model on your own machine demonstrates prefill-versus-decode timing, cache growth, and the effect of different quantization levels. That is the entire mechanism, observed directly.

**What you genuinely give up:**

1. **Large-scale serving behaviour.** Continuous batching and paged attention are properties of serving frameworks under concurrent load. You can read about them and reason about them, but you cannot reproduce a production workload on free hardware. The honest substitute is a local server with a handful of concurrent requests, which shows the shape of the effect even at toy scale.
2. **Frontier-scale models.** You will not run a very large model locally. This does not block the track, because the arithmetic that predicts *why* you cannot is exactly the thing being taught.
3. **Breadth of comparison.** Free tiers give you one or two model families, so cross-model comparisons are limited. The concepts transfer; the specific numbers do not.

Being free narrows the *scale of experiments*, not the *depth of understanding*. The mechanism is the same at 1B parameters as at 400B.

## How this track connects to the others

**Before it:** Foundations.

**Alongside it:** Cost & Efficiency. The two tracks are two views of the same economics — this one explains what consumes the resources, Cost explains how to spend fewer of them. Reading them together is genuinely useful and is one of the few pairings the study rules encourage.

**After it:** Prompting and Retrieval & RAG both become clearer, and Agents becomes cheaper to reason about. Phase 6 is worth re-reading once you have used a few different models.

## The honest caveat

**This is the most volatile track in the curriculum by marker count, tied with Cost.** Specific model names, context sizes, GPU costs and throughput figures all change on a scale of weeks. Every such number here is dated and flagged, and no conclusion in this track depends on one.

The durable parts — that attention is quadratic in sequence length, that the KV cache grows linearly with tokens, that generation is usually memory-bandwidth bound, that quantization trades precision for memory — will still be true in five years. Those are what you are here for.

One specific warning worth carrying forward: **do not build a model comparison table and treat it as knowledge.** It will be wrong within a month, and it substitutes the appearance of expertise for the thing itself.

## Start here

1. Confirm you have Foundations behind you. If not, go back.
2. Read [Phase 1](01-phase-inference-anatomy.md).
3. Track your progress in [`checklist-master.md`](checklist-master.md).
4. Keep [`../shared/glossary.md`](../shared/glossary.md) open — this track introduces more precise vocabulary than any other.
