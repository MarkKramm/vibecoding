# Cost & Efficiency — Master Checklist

This is the **track-level** checklist. Phase checklists are inside the phase files. These items should be true of you **when the whole track is done** — cross-cutting capabilities that need several phases together.

**Tick only what you can do now.** Rule 6 of the study rules: your own words, or it did not happen. This track is unusually practical, so almost everything below can be demonstrated rather than described — a script you wrote, a cap you set, a workflow you can explain to someone else with no budget.

If you cannot tick an item, the phase it names is where to return.

---

## Understanding the bill

- [ ] I can estimate the cost of a task before running it. <!-- id: cost-master-c01 energy: normal -->
- [ ] I can identify which part of a prompt dominates its cost. <!-- id: cost-master-c02 energy: normal -->
- [ ] I can explain why cost per task is the meaningful measure rather than cost per token. <!-- id: cost-master-c03 energy: normal -->
- [ ] I can explain why the same request costs different amounts in different languages, and estimate the penalty for Tagalog input. <!-- id: cost-master-c04 energy: high -->
- [ ] I can explain the difference between input and output token pricing and why it affects how I design a prompt. <!-- id: cost-master-c05 energy: low -->

## The mechanisms

- [ ] I can explain prompt caching as prefix reuse, and describe the asymmetry that makes it work. <!-- id: cost-master-c06 energy: high -->
- [ ] I have reproduced prefix-reuse behaviour locally, or reasoned through it on hardware I have, without needing a paid tier. <!-- id: cost-master-c07 energy: high -->
- [ ] I can explain the batch submit-poll-reconcile lifecycle and why it trades latency for price. <!-- id: cost-master-c08 energy: normal -->
- [ ] I can route requests by difficulty and **verify** that the cheap path was good enough rather than assuming it. <!-- id: cost-master-c09 energy: high -->
- [ ] I can explain why routing without verification is just a way to be wrong more cheaply. <!-- id: cost-master-c10 energy: high -->

## Discipline and control

- [ ] I have software that logs tokens, latency and cost per request. <!-- id: cost-master-c11 energy: normal -->
- [ ] I have a hard cap in place that a runaway loop cannot exceed. <!-- id: cost-master-c12 energy: high -->
- [ ] I can explain why a cap must be enforced in code rather than trusted to the caller. <!-- id: cost-master-c13 energy: high -->
- [ ] I can tell whether a cost increase came from more requests or more expensive requests. <!-- id: cost-master-c14 energy: high -->

## Local versus hosted

- [ ] I run at least one model locally and can describe what it costs me in time and hardware rather than money. <!-- id: cost-master-c15 energy: normal -->
- [ ] I can name the threshold at which a local model becomes the better choice, and defend it with something other than a feeling. <!-- id: cost-master-c16 energy: high -->
- [ ] I can explain what a local model cannot do that a hosted one can. <!-- id: cost-master-c17 energy: normal -->

## The zero-budget workflow — the point of this track

- [ ] I have written a complete zero-budget workflow for one real project, end to end. <!-- id: cost-master-c18 energy: high -->
- [ ] I can state the tier ladder honestly: what each rung costs me, and in what currency that cost is paid. <!-- id: cost-master-c19 energy: normal -->
- [ ] I can name what I genuinely gave up by being free, and separate that from what I only appeared to give up. <!-- id: cost-master-c20 energy: high -->
- [ ] I can describe the decision procedure rather than a product list: try local, then free tier, then pay. <!-- id: cost-master-c21 energy: normal -->
- [ ] I have named my first-peso trigger — the specific experiment that would justify spending, and the decision it would change. <!-- id: cost-master-c22 energy: high -->
- [ ] I have a dated plan for the transition out of expiring free access. <!-- id: cost-master-c23 energy: high -->
- [ ] I can explain why free tiers may carry different data terms than paid ones, and what that constrains. <!-- id: cost-master-c24 energy: high -->

## The closing argument

- [ ] I can explain which of my skills survive losing free access, and which were only familiarity with one provider's interface. <!-- id: cost-master-c25 energy: high -->
- [ ] I can state, in one sentence, why the concept is separable from the vendor implementation — and give an example. <!-- id: cost-master-c26 energy: high -->
- [ ] I no longer let a lesson's conclusion rest on a price, because I know prices move and mechanisms do not. <!-- id: cost-master-c27 energy: high -->

---

## What this checklist is not

It is not a claim that you have optimised anything, and it is certainly not a claim that you can keep up with current prices — nobody can, and this track does not try to teach you to.

It is a claim that **you can make cost decisions deliberately, on any tier, including the one where you have nothing to spend.** That is the durable skill, and for a reader on a $0 budget it is also the immediately useful one.

**If you tick only one section**, make it the zero-budget workflow. Everything else in this track is in service of it.
