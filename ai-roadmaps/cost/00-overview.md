# Cost & Efficiency — Track Overview

## What this track is for

This is the track written for your exact situation. **You have no money to spend, and the free access you do have will not last forever.**

Cost & Efficiency teaches two things at once. The first is the economics of these systems: how tokens are billed, what makes a request expensive, and which mechanisms let you get the same capability for less. The second, and more important, is **how to be effective when you cannot pay for anything** — which is not a compromise version of the skill, it is the skill.

The honest framing, stated up front: **free access was never the skill. It was the practice environment.** Everything mechanism-level in this track survives losing your free tier. What does not survive is a workflow built entirely on one provider's convenience, and this track is largely about not building that.

Phase 7 is the freemium playbook — a single end-to-end answer to "I have ₱0. What is my actual workflow, today?" It is the synthesis of the track and, for you specifically, the most important phase in the curriculum.

## Who this suits

You need **Foundations Phase 3** above all — the context budget is the foundation of every cost mechanism here. Prompting Phase 5 helps. The rest is self-contained.

You should be able to **read a pricing page critically** and do arithmetic with per-million-token rates. That is the only mathematics required.

This track is unusually well suited to being read **early**, before you have spent anything. The study rules say not to spend money in the first month; this track is the reason, and it will tell you what your first peso should buy when the time comes.

## What you need before starting

- **Foundations Phase 3** at minimum. Without the token/context model, this track is a list of tips.
- **Basic Python** for Phases 5 and 7, where you write cost accounting and caps.
- **One free hosted tier, and ideally one local model.** The track is much more concrete if you can compare them.
- **Roughly 1–2 focused hours a day, five days a week.**

No paid tier is required for any phase. Several phases teach mechanisms that are gated on paid providers, and every one of them supplies a free or local substitute — that substitution is a deliberate part of the design, not an apology.

## The phases, in order

| # | Phase | Length | What it establishes |
|---|---|---|---|
| 1 | Token Economics | 1 week | How billing actually works, why cost per task beats cost per token, and where money really goes |
| 2 | Prompt Caching | 1 week | Reusing a repeated prefix, and how to reproduce the mechanism locally when your tier does not offer it |
| 3 | Batch APIs and Asynchronous Work | 1 week | Trading latency for price, and simulating the submit-poll-reconcile lifecycle on hardware you have |
| 4 | Model Routing and Cascades | 1 week | Sending each request to the cheapest model that can handle it, with verification rather than hope |
| 5 | Monitoring, Budgets, and Spend Caps | 1 week | Measuring cost per request, setting hard caps, and planning the exit from expiring free access |
| 6 | Local Models and Provider Strategy | 1 week | Running models yourself, and the threshold at which local beats hosted |
| 7 | The Freemium Playbook | 1 week | The complete zero-budget workflow, end to end — the phase this track exists for |

**Read 1, 2 and 3 first** — they are the mechanisms. **Phases 5 and 6** give you the discipline and the fallback. **Phase 7 depends on all of them** and should be read last, because it assembles them into a single procedure.

If you are short on time and worried about your free access ending, **read Phase 7 early anyway** and come back to fill in the mechanisms. It is written to be actionable on its own.

## What you will be able to do at the end

- Estimate the cost of a task before running it, and identify which part of a prompt dominates the bill.
- Explain why the same request costs different amounts across languages, and estimate the penalty for Tagalog or Cebuano input.
- Explain prompt caching as prefix reuse, describe the asymmetry that makes it work, and **reproduce the behaviour locally** when your tier does not offer it.
- Describe the batch submit-poll-reconcile lifecycle and simulate it with a local queue.
- Route requests by difficulty and **verify** that the cheap path was good enough rather than assuming it.
- Instrument a program to log tokens, latency and cost per request, and set a hard cap that a runaway loop cannot exceed.
- Decide when a local model beats a hosted one, using a threshold rather than a feeling.
- Write a complete zero-budget workflow for a real project, and name the specific experiment that would justify your first peso.
- Explain which of your skills survive losing free access, and which were only ever familiarity with one provider's interface.

## Roughly how long it takes

**7 phases, about 7–8 weeks at five sessions a week.** Every phase is one week, which makes this the most evenly paced track in the curriculum.

At one hour a day, plan on ten weeks. The material is not heavy; the discipline it installs takes repetition.

## What being on a $0 budget costs you here

This is the track where the answer is most interesting, because **the constraint is the subject**.

**What you give up, honestly:**

1. **Access to mechanisms, not just capacity.** Some providers gate prompt caching, batch APIs, or reasoning-effort settings behind paid tiers. You may be able to read the documentation but not observe a real cache write on your own account. **The substitute is a local reproduction plus reasoning about the asymmetry** — which teaches the mechanism, and is the approach Phase 2 takes deliberately.
2. **Scale.** You cannot run a 10,000-item batch job or a high-volume evaluation. Every phase teaches the small-scale version, chosen so the mechanism is visible.
3. **Breadth of model comparison.** Free tiers give you one or two families, so routing experiments (Phase 4) are limited. Use one hosted free tier plus one local model — that is genuinely enough to learn routing.
4. **Different data terms.** Free tiers often reserve broader rights over your inputs than paid ones. This is a real cost that is not measured in pesos, and it constrains what data you can put through them. The Safety & Ethics track covers the obligation this creates.
5. **Reliability.** Free tiers are rate-limited and occasionally unavailable. A workflow that depends on one free tier is fragile, which is precisely why the track teaches a ladder rather than a favourite provider.

**What you do not give up:** the understanding. Every mechanism here is learnable from documentation plus a local reproduction, and that separation — **the concept is separable from the vendor implementation** — is the single most valuable idea in the track.

## How this track connects to the others

**Before it:** Foundations Phase 3.

**Alongside it:** Model Internals is the recommended pairing — this track says how to spend fewer resources, Internals says what consumes them.

**After it:** every other track benefits, because cost discipline is what makes a project sustainable. Phase 5's deliverable, a dated transition plan for losing free access, is deliberately completed by Phase 7, and both connect to the Career track's advice on what to build.

## The honest caveat

**Cost is the most volatile subject in this curriculum.** Prices, free-tier limits, caching discounts and batch rates change constantly — a specific price is stale far more often than any other kind of number. Every such figure here is dated and flagged, and **no conclusion in this track depends on one**.

What is durable: that cost scales with tokens, that caching works by prefix reuse, that batching trades latency for price, that routing saves money when verification is cheap, that a hard cap prevents a runaway from becoming a bill. Those remain true whatever the prices do.

If you take one rule from this track, take this one: **never let a lesson's conclusion rest on a price.** Prices move; the mechanisms that make something cheaper do not.

## Start here

1. Confirm Foundations Phase 3 is behind you.
2. Read [Phase 1](01-phase-token-economics.md).
3. **If your free access is expiring soon, jump to [Phase 7](07-phase-freemium-playbook.md) first**, then come back.
4. Track your progress in [`checklist-master.md`](checklist-master.md).
5. Keep [`../shared/resource-list.md`](../shared/resource-list.md) open — the free-tier section is the practical companion to this track.
