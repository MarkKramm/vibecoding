---
id: cost-07-freemium-playbook
track: cost
phase: 7
order: 70
title: The Freemium Playbook
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal]
deliverable: portfolio/cost/07-freemium-playbook.md
exit_criteria: >
  You have one written zero-budget workflow for a real project of your own: the
  tier ladder with its real constraint at each rung, the decision rule you apply
  in order, an honest account of what being free costs you, and a named trigger
  for the first peso you ever spend.
---

# Phase 7 — The Freemium Playbook

## Goal of this phase

Every phase before this one mentioned free options in passing. This one assembles them into a single answer to the question you actually have: **I have no money. What is my workflow, today, end to end?**

This is the synthesis phase of the Cost track, and it is written for a specific situation — a learner in the Philippines on a zero budget, whose free API access is expiring, who wants a real skill rather than a collection of trial accounts. By the end you will have a tier ladder with the honest constraint written against each rung, a decision procedure you apply in a fixed order rather than a product list you follow, an accurate account of what free genuinely costs you, and a written trigger for the first peso you spend.

The thesis of the phase is in its last section and it is worth stating up front, because everything else is scaffolding for it: **free access was never the skill. It was the practice environment.** The mechanisms you have been learning transfer to any provider, including ones that do not exist yet, and the ones you have not learned do not transfer from any amount of credit.

## Estimated time

**1 week** at 1–2 hours a day, 5 days. Roughly 6–8 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Parts 1–2: the tier ladder, and what each rung actually costs you | 1.5h |
| 2 | Part 3: the decision procedure, applied to your own tasks | 1.5h |
| 3 | Part 4: the substitutes — reproducing paid-only mechanisms for free | 1.5h |
| 4 | Part 5: where free is enough and where it is not | 1h |
| 5 | Deliverable: the written workflow and your first-peso trigger | 1.5h |

If you have three hours this week, do tasks 1, 4, 7 and 11. Those produce the ladder, the honest gap list, the local reproduction and the written trigger, which is the phase in miniature.

This phase is deliberately the lightest in the track. Most of it is writing and deciding rather than building, because the thing it produces is a policy, and a policy that takes a week to write is a policy you will not maintain.

## Skills you'll gain

- Place any AI task on a four-rung ladder and name the real constraint at that rung rather than its marketing description.
- Apply a fixed-order decision procedure to a new task instead of shopping for a product.
- State precisely what you give up by being free, and separate the experiments it narrows from the understanding it does not.
- Reproduce a paid-only mechanism — caching, batching, reasoning effort — locally or by simulation, and explain the concept without the vendor.
- Predict which of your tasks free tiers will carry and which they will not, before you start.
- Read the data terms attached to a free tier and explain how they differ from the paid tier's.
- Convert an expiring trial into a plan rather than a panic, and name the trigger for your first peso.
- Explain why mechanism-level knowledge survives losing access and feature-level knowledge does not.
- Say where this playbook stops working: at the point where the task needs capability you cannot simulate.

## Specific topics to learn

### The tier ladder, honestly

- Rung 1: local models — the cost is your hardware, your electricity and your hours.
- Rung 2: free hosted tiers — the cost is rate limits, and often different data terms than paid.
- Rung 3: trial credits — the cost is expiry, which is a deadline rather than a price.
- Rung 4: paid — the cost is money, and it is the only rung where the constraint is currency.
- Why "free" and "cheap" are different claims, and which one you are actually making.
- The hidden costs at each rung: time, data, lock-in, and the obligation a trial creates.

### The decision procedure

- Try local first, because its marginal cost is near zero and its failure mode is informative.
- Escalate to a free tier when the task exceeds local capability, not when it exceeds local convenience.
- Pay only for the experiment that changes a decision, never for convenience.
- Why the order of the procedure matters more than the contents.
- Recognising the tasks where the procedure gives the same answer every time, and automating that judgement.

### What being free actually costs you

- Breadth of model comparison: fewer models to run the same eval against.
- Access to mechanisms: caching controls, batch endpoints, reasoning-effort settings, structured-output modes.
- Rate limits that make some workloads structurally impossible rather than merely slow.
- Data terms: free tiers frequently retain broader rights over your inputs than paid ones.
- Why this narrows experiments rather than understanding, and what that distinction is worth.

### Substitutes for paid-only mechanisms

- Cannot observe a real cache write? Reproduce prefix reuse locally and reason about the asymmetry.
- Cannot reach a batch endpoint? Simulate submit/poll/reconcile with a local queue.
- Cannot set reasoning effort? Compare a local model against itself with and without an explicit reasoning step.
- Cannot run schema-constrained decoding? Validate locally and measure your own retry rate.
- The general move: separate the mechanism from the vendor implementation, then reproduce the mechanism.
- Where substitution genuinely fails, and how to say so honestly.

### Where free is enough, and where it is not

- Genuinely enough: everything mechanism-level in this curriculum, most authoring and study, small-corpus retrieval, evaluation harness development.
- Genuinely not enough: large-scale embedding, long-context experiments at scale, high-volume evaluation, tasks needing frontier reasoning quality.
- The first-peso decision, and what makes an experiment worth funding.
- The transition out of expiring free access, completing the plan begun in Phase 5.
- The closing argument: which skills survive losing access, and why they are exactly the ones you have been building.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Ollama | The bottom rung of the ladder: run a model with no account and no meter | Free/open-source | https://ollama.com/ | Task t02 — establish your local baseline before reaching for anything hosted | `llama.cpp` directly, or LM Studio |
| Hugging Face model hub | Find open-weight models and read the licence before you depend on one | Free to browse | https://huggingface.co/models | Task t02 — pick a small model whose licence you have actually read | Any published model card |
| Google AI Studio | A free hosted tier for capability above your local ceiling | Free tier | https://aistudio.google.com/ | Task t05 — run the task your local model failed, and note the rate limits you hit | Any other provider's free tier, checked for coverage and payment first |
| A provider's rate-limit page | The document that decides whether a workload is possible at all | Free to read | https://platform.openai.com/docs/guides/rate-limits | Task t06 — find the limit at your actual tier, not the marketing tier | Each provider's own docs; compare two |
| A provider's data-usage policy | The page that says what happens to your inputs, and whether free differs from paid | Free to read | https://openai.com/policies/ | Task t08 — write down in your own words what the free tier may do with your inputs | The equivalent page at any provider you are considering |
| `sqlite3` | Simulate a batch queue: submit, persist, poll, reconcile — all locally | Free/open-source | https://sqlite.org/ | Task t09 — reproduce the batch lifecycle without a batch endpoint | A JSON file plus a script, or any local database |
| Python's `functools.lru_cache` | Observe prefix reuse concretely, and see what a cache hit changes | Free/open-source | https://docs.python.org/3/library/functools.html | Task t10 — instrument a cache to log hits and misses, then reason about the paid version | A hand-written dict cache with counters |
| A stopwatch and a spreadsheet | Measure your own rate-limit ceiling and cost-per-task in pesos | Free | https://www.libreoffice.org/discover/calc/ | Tasks t06, t12 — convert limits and prices into what you can actually run per day | Google Sheets free tier |
| Git and a local notes file | Keep the workflow written down where you will re-read it | Free/open-source | https://git-scm.com/ | Task t14 — version the playbook so you can see your own judgment change | Any text editor and a folder |
| Colab or Kaggle notebooks | Free GPU time for the experiments a laptop cannot run | Free tier | https://colab.research.google.com/ | Task t11 optional — run one small fine-tune or embedding job you could not run locally | Kaggle notebooks, which grant a separate free GPU quota |
| A provider's pricing page | The only pricing source that is not stale | Free to read | https://openai.com/api/pricing/ | Task t13 — price the one experiment you would fund, before you fund it | Any provider's pricing page; read two and compare |

## Free/cheap resources

- **Petrov et al. — Tokenization equity across languages (arXiv:2305.15425)** — https://arxiv.org/abs/2305.15425
- **Lewis et al. — Retrieval-Augmented Generation (arXiv:2005.11401)** — https://arxiv.org/abs/2005.11401
- **RAGAS — Automated Evaluation of Retrieval Augmented Generation (arXiv:2309.15217)** — https://arxiv.org/abs/2309.15217
- **LoRA — Low-Rank Adaptation of Large Language Models (arXiv:2106.09685)** — https://arxiv.org/abs/2106.09685
- **QLoRA — Efficient Finetuning of Quantized LLMs (arXiv:2305.14314)** — https://arxiv.org/abs/2305.14314
- **Ollama documentation** — https://github.com/ollama/ollama/tree/main/docs
- **llama.cpp — quantisation and hardware notes** — https://github.com/ggml-org/llama.cpp
- **Model Context Protocol** — https://modelcontextprotocol.io/
- **Hugging Face — free course on LLM and diffusion systems** — https://huggingface.co/learn

## Lesson: The Freemium Playbook

### Part 1 — What "free" is actually four different things

The word "free" is the single most expensive ambiguity in this field, because it describes four arrangements whose constraints have nothing in common, and people compare them as if they were prices.

Consider four ways to run the same prompt. You can run it on a model on your own laptop. You can send it to a hosted service that charges nothing but caps how often you may call. You can send it to a service that has given you a pile of trial credit which expires on a date. Or you can pay per token.

The instinct is to treat these as one ladder ordered by price, with "free" at the bottom and "paid" at the top. That instinct is what this part corrects, because **the four rungs do not differ in price. They differ in what they charge you with.**

> Think of it as four ways to borrow a car. One is a car you already own, which costs you fuel and maintenance. One is a friend's car you may use but only on weekday afternoons. One is a rental with a voucher that expires on Friday. One is a rental you pay for by the kilometre. Only the last one has a price. The other three have **conditions**, and conditions are what actually decide whether you can make the trip.

Here is the same table without the analogy. Fill in the numbers for your own situation; the point is the shape of the constraint, not the figures.

| Rung | What it is | What it actually charges you | Failure mode |
|---|---|---|---|
| Local | A model running on your own hardware | Hardware you own, electricity, and **your hours** | Too weak for the task; slow; you spend the week tuning instead of building |
| Free hosted tier | A capped allowance on someone else's model | **Rate limits**, and often broader **data terms** than paid | The workload is structurally impossible, not merely slow |
| Trial credit | A finite balance, usually with an expiry date | **A deadline**, and often a lingering account obligation | You build on it, it expires, and your system stops mid-project |
| Paid | Per-token billing | **Money**, per unit of work | A bug becomes an invoice; usage scales without your noticing |

Read the third column again, because it is the whole lesson. Local charges **time**, free tiers charge **limits and data rights**, trials charge **expiry**, paid charges **currency**. These are not points on a single axis. That is why the sentence "local is cheaper than the API" is not merely imprecise — it is a category error, and Phase 6 spent a whole lesson on the arithmetic that replaces it.

**There is a fourth column worth adding yourself.** Every rung except local charges you **a dependency**. Your free tier can change its limits, its model list, or its terms on a Tuesday, without asking you, because you are not a customer — you are capacity utilisation. This is not cynicism; it is the normal behaviour of a business, and planning around it is just planning.

**What this predicts.** If someone tells you a provider is "free", you can now ask the question that resolves it in one move: *free in which currency, and what is the condition?* A free tier with a 20-requests-per-day cap is not a cheaper version of a paid account. It is a different tool that supports a different class of workload, and knowing which class yours falls into takes ten minutes of reading and saves a week of building.

**Where this stops working.** The ladder describes *capability and cost*. It says nothing about **quality**, and quality can invalidate a rung entirely: if the local model cannot do the task, its cost is irrelevant because the option is not available. Phase 6 made this point about the crossover; here it takes a sharper form. A rung is only a candidate if it can actually complete the work. Everything else is arithmetic on an unavailable option.

### Part 2 — The honest cost of each rung

Part 1 gave you the shape of the constraints. This part prices them, in the only currency that matters for you: what it takes out of your week.

#### Rung 1: local, where the cost is your hours

Local inference has a near-zero marginal cost, and this is genuinely the most valuable property in the whole ladder for a person with no money. A call you make locally does not consume a limit, does not touch a deadline, and does not send your data anywhere. For the overwhelming majority of the exercises in this curriculum, that is not a compromise — it is the **better** arrangement, because it lets you iterate two hundred times without thinking about the meter.

What it charges is time, in three places that are easy to underestimate.

**Setup.** Installing a runner is an afternoon. Getting a model to fit in your memory is an afternoon you may repeat several times as you learn what "fits" means. Phase 6 gave you the mechanism — bytes, not parameter count — and this is where you feel it.

**Throughput.** A small model on a laptop generates tokens slowly enough that a task you would describe as "run this on a hundred items" becomes an hour rather than a minute. This is a real constraint on how much you can practice, and it is the reason free hosted tiers exist as a rung at all.

**The quality ceiling.** This is the one that costs the most and is discussed the least. On easy and medium tasks a small local model does respectable work. On tasks requiring careful multi-step reasoning, precise instruction-following, or reliable structured output, it fails — and it fails in the specific way these models always fail, which is confidently and plausibly. Phase 5's failure modes and Phase 6's quality-gap exercise are the instruments for finding where your model's ceiling is. **Until you have measured that ceiling, you cannot use the ladder**, because you do not know whether rung 1 is available for the task in front of you.

> A metered connection deserves its own line, because in the Philippines it is frequently the binding constraint rather than a footnote. A model download is tens of gigabytes. On a prepaid capped plan that is a direct charge against a finite budget, and the first model you try is rarely the one you keep. Phase 6's download-cost task exists for exactly this reason. Compute it before you download, not after.

#### Rung 2: free hosted tiers, where the cost is limits and data rights

A free hosted tier gives you a frontier-adjacent model — usually a strong one, sometimes a slightly older or smaller variant of the flagship — with no payment method required. For a learner this is the most valuable rung after local, because it is where you get to *touch* the capability ceiling you have been reading about.

It charges you in two ways, and only one of them is usually discussed.

**Rate limits.** Every free tier caps something: requests per minute, requests per day, tokens per minute, or all three. The important distinction is between a limit you can **plan around** and a limit that **breaks you**. A daily cap of a few hundred requests is usually plan-around-able for study. A per-minute cap on tokens can make a batch workload impossible in principle, because you cannot fit the work into the window no matter how patient you are. Read the limit, then compute whether your task fits inside it. If it does not, no amount of clever scheduling fixes it — the rung is simply unavailable.

**Data terms, which are the part people skip.** Free tiers frequently carry **broader rights over your inputs than paid tiers at the same provider**. It is common for a free tier to reserve the right to use your inputs to improve the service, and for the paid tier to explicitly not do so, or to offer an opt-out that the free tier does not. This is entirely rational from the provider's side: you are not paying, so the arrangement is a trade rather than a purchase.

**The consequence is worth stating plainly, because it inverts the naive intuition.** For anything sensitive, the free tier is often the **riskier** option, not the safer one. People reach for free because it feels low-stakes. On the data axis it is frequently high-stakes. Phase 6 introduced the Philippine Data Privacy Act of 2012 (RA 10173) as an obligation that attaches when you process personal data through a third party; this is the rung where that obligation has teeth, because the terms you are accepting are different from the ones you would be accepting if you paid.

**Verify this yourself rather than trusting any summary, including this one.** Terms change, and they differ per provider and per tier. **Volatile, undated by design: read the actual policy page for the actual tier you are using, today.** It takes ten minutes and it is not optional if other people's data is involved.

#### Rung 3: trial credits, where the cost is a deadline

Trial credit is the rung you are on right now, and it is the one that produces the most damage, because it *feels* like paid access while behaving like an expiring one.

While credit lasts you have the whole capability ceiling, no meaningful rate limits, and every paid feature. This is genuinely valuable and you should use it hard. What it charges is **a deadline**, and deadlines have a property that prices do not: they arrive whether or not you have finished.

Three specific failure modes, all of which you can avoid:

**Building a dependency on an expiring resource.** If your project's core loop runs on trial credit, your project stops on the expiry date, and it stops at the worst possible moment — in the middle of something, after you have built around it. The mitigation is Phase 5's transition plan: know what you will cut, shrink, or move to local when the access ends, *before* it ends.

**Mistaking the trial for the skill.** The most expensive thing a trial does is let you learn *vendor features* instead of *mechanisms*. A learner who spends a credit balance memorising one provider's caching API, batch submission format and reasoning-effort parameter has learned things that expire alongside the credit. A learner who spends it understanding prefix reuse, asynchronous scheduling and test-time compute has learned things that transfer to the next provider, and the one after that.

**The lingering obligation.** Some trials require a payment method to start, which means the trial is a subscription with a grace period, and forgetting the expiry date converts a free resource into a charge. If you ever do attach a card, set a spending cap and a calendar reminder in the same sitting. This is Phase 5's caps discipline applied to a specific and common trap.

**How to spend a trial well.** Treat the remaining credit as **a budget for experiments you cannot run any other way** — not as free general-purpose usage. The question to ask of each call is: *could I run this locally or on a free tier?* If yes, run it there and save the credit. If no, you have found exactly what the trial is for, and you should spend it deliberately and log what you learn. That reframing turns an expiring resource from a source of anxiety into a targeted instrument.

#### Rung 4: paid, where the cost is money

Paid per-token access is the only rung whose constraint is currency, and for you it is presently unavailable. That is a real limitation and it is worth naming rather than working around with euphemism.

It is also, of the four rungs, **the one you can most afford to defer**. Almost everything in this curriculum is mechanism-level, and mechanism-level work runs on rungs 1 and 2. The phases where paid access is genuinely load-bearing are narrow and specific, and Part 5 names them. The honest summary is that you are not blocked from learning; you are blocked from a small number of particular experiments, and knowing which ones is the difference between feeling blocked and being blocked.

### Part 3 — The decision procedure

Parts 1 and 2 described the ladder. This part gives you the thing that turns it into behaviour: a **procedure with a fixed order**.

The order is the whole point. Given a task, you ask the following questions **in this sequence**, and you stop at the first yes.

```
1. Can a local model do this task acceptably?          -> do it locally
2. If not, can a free hosted tier do it within its
   rate limits and acceptable data terms?              -> use the free tier
3. If not, is this experiment worth spending credit
   or money on, because it changes a decision?         -> spend, deliberately
4. If not, is this task actually necessary this week?  -> defer it, and say so
```

Four observations about why this specific order, because a procedure you do not understand is a procedure you will abandon the first time it is inconvenient.

**Local comes first, and not for cost reasons.** It comes first because local is the only rung where you can iterate without a counter, and iteration is how you learn. Its near-zero marginal cost means you can run the same prompt forty times while you work out why it fails — which is precisely the behaviour that builds judgement. A learner on a metered rung unconsciously runs fewer experiments, and runs them less carefully, because each one has a price. Putting local first protects your **experiment rate**, which is the actual thing being rationed.

**Escalate on capability, not convenience.** The second question is *can the tier do the task*, not *is the tier nicer to use*. It is tempting to reach for the hosted model because it is faster and its answers are better, and that temptation is how people burn a free tier on work their laptop could have done. The local model being slower is not a reason to escalate. The local model being **wrong** is.

**Pay for the experiment that changes a decision.** This phrasing matters, and it comes directly from Phase 6's threshold. Money should buy **information you would otherwise not have**, not comfort. "I want to see how a frontier model handles my hardest twenty cases" is a decision-changing experiment: the result tells you whether your local model's ceiling is close to the frontier's, which changes what you build. "I want the answers to come back faster" is convenience, and it is not worth your money while you are learning.

**Deferring is a legitimate outcome, and saying so is a skill.** The fourth step exists because the honest answer to some tasks is *not yet*. A learner who can say "this experiment needs capability I do not have, so it goes on the list for after I can fund it" is in a much stronger position than one who either gives up on the whole curriculum or burns their last credit proving something they already suspected. **Write the deferred task down.** A written list of what you are deferring is a plan; an unwritten one is just a vague sense of being behind.

**What this procedure predicts.** Applied honestly, it gives the same answer for most of your work — local, occasionally free tier — and this is a feature rather than a failure. Most of what you do while learning is mechanism-level practice, and mechanism-level practice belongs on the rung with no meter. If you find yourself reaching for the top rung often, the useful question is not whether you can afford it but what your local model is failing at, because that is the information the escalation was supposed to buy.

**Where this stops working.** The procedure optimises for **learning under a budget**. It is not a production architecture and it is not a business decision. A real system has latency requirements, reliability requirements, and users who do not care which rung you can afford; Phase 6's hybrid assignment is the tool for that, and it is a different question from the one this phase answers. Confusing the two produces the strange failure of building a study project with production constraints it does not need.

### Part 4 — Substitutes: reproducing what you cannot buy

Here is the part that decides whether being free costs you **understanding** or merely **convenience**.

Several mechanisms in this curriculum are gated behind paid tiers: prompt caching controls, batch endpoints, reasoning-effort settings, schema-constrained decoding, large-scale embedding. If you conclude that you therefore cannot learn them, you have made a mistake about what a mechanism is.

**A mechanism is a behaviour that follows from a structure.** A vendor feature is one implementation of that behaviour. When you understand the structure, you can reproduce the behaviour on hardware you own, at small scale, and observe the same thing. You will not reproduce the provider's throughput; you will reproduce the **concept**, which is what transfers.

The general move has three steps:

1. **Name the mechanism** without any product name. Not "how do I use provider X's cache", but "what happens when a repeated prefix can be reused instead of recomputed".
2. **Build the smallest possible reproduction** locally. It does not need to be efficient, realistic in scale, or production-shaped. It needs to be *observable*.
3. **Measure the thing the vendor feature would have measured**, then read the vendor's documentation with that measurement in hand — at which point the documentation describes something you have already seen rather than something you are memorising.

Four concrete substitutions, drawn from phases you have already done.

| Paid mechanism | What it actually is | Free reproduction | What you observe |
|---|---|---|---|
| Prompt caching | Reusing computation for a repeated prefix | Instrument a local cache (`functools.lru_cache` or a dict with counters) over a "prefix" you define | Hit rate, and what a hit costs versus a miss — the asymmetry is the lesson |
| Batch endpoints | Asynchronous work scheduled when capacity is idle | A local queue table in SQLite with `submit`/`poll`/`reconcile` states and a worker script | That the discount is the price of the scheduling constraint, and that missing results are routine |
| Reasoning-effort settings | Spending more inference-time compute | Run a local model with and without an explicit reasoning step on the same task set | Where extra reasoning helps, and where it just produces longer wrong answers |
| Schema-constrained output | Preventing invalid structure at generation time | Generate freely, validate locally, and log your actual retry rate | The cost of *not* having the constraint — which is the argument for paying for it |

Each of these teaches the mechanism through its **failure mode**, which is better than learning it through success. A locally instrumented cache shows you what a miss costs because you can watch the counter increment. A simulated batch queue shows you why reconciliation exists because you will produce a missing result on your first run. A no-constraint structured-output task shows you why constrained decoding is worth money, because you will pay for it in retries.

**The honest limits of substitution.** Some things genuinely do not reproduce, and pretending otherwise would be exactly the dishonesty this curriculum is written against.

**Scale.** You cannot simulate the behaviour of an embedding model over ten million documents on a laptop, because the behaviour at that scale — index behaviour, recall degradation, cost structure — is partly a function of the scale. You can learn the mechanism; you cannot learn the operational reality.

**Frontier capability.** If your task needs reasoning quality above your local ceiling, no substitution produces it. This is the one gap that money genuinely closes and simulation does not. Name it and defer it rather than pretending a small model will do.

**Vendor-specific behaviour.** Some features have no mechanism beneath them worth learning, because they are commercial packaging. If a feature exists mainly to make a provider's offering distinct, learning it is learning a product, and you should decide deliberately whether that is worth your attention. Often it is not.

**Where this stops working.** Substitution teaches the concept but not the **operational judgment** that comes from running something at real scale with real consequences. A learner who has only ever simulated a batch pipeline will make different — and worse — decisions about retries, idempotency and reconciliation than one who has run a real job with a real failure rate. This is not a reason to pay; it is a reason to be honest in your own writing about which of your knowledge is conceptual and which is operational. Phase 3's `**Why:**` habit of stating limits applies to your own competence as well as to the content.

### Part 5 — Where free is enough, and where it is not

This part is a list, and its purpose is to let you stop worrying about a general question by replacing it with a specific one.

#### Free is genuinely enough for

**Almost all of this curriculum.** Foundations, Model Internals, Prompting, the mechanism parts of Cost, most of RAG, and the conceptual parts of everything after. These are structure and behaviour, and structure and behaviour are observable at small scale on hardware you already own.

**Evaluation harness development.** Phase 6's point, repeated because it is the highest-leverage free activity in the whole plan: evaluation is high-volume and low-stakes, which is exactly the workload a local model carries acceptably and exactly the workload that would generate a real bill against a frontier model. Building your eval harness on a local model costs nothing, which means you can afford to run it constantly, which is what makes it good.

**Study, writing, and your portfolio.** Authoring, explaining, and documenting are where a mid-tier model is entirely sufficient. Do not spend credit writing prose you could write locally.

**Small-corpus retrieval.** Embedding a few thousand chunks locally is a genuine, complete RAG experience — ingestion, chunking, hybrid search, reranking, evaluation. The mechanism does not change at scale; the operational concerns do, and those are the ones you are deferring.

#### Free is genuinely not enough for

**Large-scale embedding.** Embedding a real corpus at production volume needs either a paid embedding endpoint or GPU time you do not have. Colab and Kaggle grant free GPU sessions that let you *sample* this, which is enough to learn the mechanism and not enough to run it as a service.

**Long-context experiments at scale.** Testing retrieval strategies across very large contexts requires both a large context window and the ability to run many trials. Free tiers cap the first and rate-limit the second. You can reason about it from the mechanism; you cannot benchmark it yourself.

**High-volume evaluation against a frontier model.** If your task requires judging a frontier model's outputs, running that suite two hundred times is a real bill. This is the clearest case of an experiment that money genuinely buys.

**Tasks at the quality ceiling.** Stated plainly: if your task needs capability above your local model, and above the free tiers you can access, then it is deferred. Not abandoned — **deferred**, and written on the list.

#### The first-peso decision

When free access ends, or when your credit runs out, you will face a decision. Here is the trigger, stated as a rule you can apply without re-deriving it.

**Spend your first peso when, and only when, you have a specific experiment that changes a decision you are about to make, and no free rung can run it.**

Three components, all required:

**A specific experiment.** Not "access to a better model" — an actual task set you will run, with a number of calls you have estimated and priced at current published rates. Phase 6's pricing task is the rehearsal for this.

**A decision it changes.** Name the decision in advance. *If the frontier model handles my twenty hardest cases correctly, I will build the tool; if it does not, I will narrow the scope.* An experiment that does not change what you do next is a purchase, not an experiment.

**No free rung available.** You have genuinely tried local and the free tiers, and you can say what you tried and how it failed. This is why the decision procedure has its order: it produces the evidence that makes the spend defensible rather than impulsive.

**When you spend, spend small and log from the first call.** Enough for one month at your measured usage, not more. Set the provider's spending cap immediately if one exists. Then keep the usage log Phase 5 taught you, because from that moment the log is the instrument you steer with — and a paid account without logging is how a learning budget quietly becomes a monthly subscription.

#### Completing the transition plan

Phase 5 asked you to write a transition plan: what you will cut, shrink, or move to local hardware when the free access ends. **This phase is where that plan gets finished**, and the finishing move is to attach each item to a rung.

Go through your plan item by item and assign it:

- **Move to local** — mechanism-level practice, evaluation runs, study and authoring.
- **Move to a free tier** — tasks that exceeded local capability but fit inside a free tier's limits and data terms.
- **Defer** — the experiments from the "not enough" list above, written down with what would unblock them.
- **Cut** — work that was only happening because the credit made it free. Be honest here; a surprising amount of what you do on an unmetered account is activity rather than progress.

That four-way sort is the deliverable's spine, and it converts the expiring trial from a deadline you are dreading into a plan you have already made.

#### The closing argument

Everything in this phase has been scaffolding for one claim, and here it is.

**Free access was never the skill. It was the practice environment.**

The specific resources you have right now — this trial, these free tiers, whatever credit remains — are temporary by construction. They will end, and the field will change again after that, and the model names and prices and limits in every document you read this year will be stale within months. If your competence lived in those specifics, it would expire with them.

But it does not, because of what you have actually been building. Prefix reuse is prefix reuse whether it is a vendor feature or forty lines of your own. Asynchronous scheduling is asynchronous scheduling whether it is a batch endpoint or a table in SQLite. The evaluation loop, the chunking decision, the retrieval failure taxonomy, the loop with a stopping condition — none of these are anyone's product. They are structure, and you have been learning structure deliberately, which is why this curriculum keeps making you write down where each mechanism **stops working**. A boundary is a property of the mechanism, not of the vendor.

So the honest position at the end of the Cost track is this. You are not a person who is learning AI on a temporary free account, waiting until you can afford the real thing. You are a person who has learned the mechanisms on whatever hardware was available, which is the only way anyone has ever learned them — and the free access was the practice environment that let you do it sooner. Treat it as the gift it is, use it hard while it lasts, and do not mistake it for the thing you are actually building.

## Hands-on practice tasks

1. Write your own tier ladder. Four rungs, and against each one the constraint in the currency it actually charges — time, limits and data rights, a deadline, or money — plus your current status on that rung. <!-- id: cost-07-freemium-playbook-t01 band: quick energy: low -->
2. Establish your local baseline. Pull one model that fits comfortably and run five real tasks of yours through it. Record where it succeeds, and the specific failures — not "it's worse", but what it got wrong. <!-- id: cost-07-freemium-playbook-t02 band: focused energy: normal -->
3. List every AI task you performed last week and mark each one local, free tier, or paid. Then re-mark them using the decision procedure in Part 3 and note every task where the two answers differ. <!-- id: cost-07-freemium-playbook-t03 band: focused energy: normal -->
4. Take the Part 4 substitution table and complete it for your own work: for each paid mechanism you cannot access, write the smallest local reproduction and what you would observe. Then build the first one. <!-- id: cost-07-freemium-playbook-t04 band: deep energy: high -->
5. Run the task your local model failed in task 2 on a free hosted tier. Note whether it succeeded, and log the rate limits you encountered while finding out. <!-- id: cost-07-freemium-playbook-t05 band: focused energy: normal -->
6. Find the rate limit at your actual tier — not the marketing tier — for each free tier you use. Convert each limit into *tasks per day* for a task of your size, and identify any workload that is structurally impossible rather than merely slow. <!-- id: cost-07-freemium-playbook-t06 band: focused energy: normal -->
7. Write your deferred list. Every experiment you cannot run on any available rung, what would unblock it, and the decision it would change. This list is a plan, not a record of failure. <!-- id: cost-07-freemium-playbook-t07 band: quick energy: low -->
8. Read the data-usage policy of your free tier and of the same provider's paid tier. Write down, in your own words, the specific difference in what each may do with your inputs. If there is no difference, write that down too. <!-- id: cost-07-freemium-playbook-t08 band: focused energy: normal -->
9. Simulate the batch lifecycle locally: a SQLite table with submitted ids, a worker that processes them, a deliberate failure rate, and a reconciliation step. Find the missing results and re-submit them. <!-- id: cost-07-freemium-playbook-t09 band: deep energy: high -->
10. Instrument a local cache over a repeated prefix and log hits and misses. Compute the cost asymmetry between a hit and a miss, then read a provider's prompt-caching documentation and note what it is actually selling you. <!-- id: cost-07-freemium-playbook-t10 band: deep energy: normal -->
11. Complete Phase 5's transition plan by sorting every item into move-to-local, move-to-free-tier, defer, or cut. Be honest about the cut pile — what were you doing only because it was free? <!-- id: cost-07-freemium-playbook-t11 band: deep energy: high -->
12. Price your first-peso experiment: pick one deferred item, estimate the number of calls it needs, price it at current published rates, and write the decision it would change. Do not run it. The output is the estimate. <!-- id: cost-07-freemium-playbook-t12 band: focused energy: normal -->
13. Compute your effective cost per GB on your actual connection and price the three local models you would most like to try. Decide which single download is worth the data, and why. <!-- id: cost-07-freemium-playbook-t13 band: quick energy: low -->
14. Write the playbook. One real project of your own, the workflow end to end, the ladder, the decision rules, what you gave up, and your first-peso trigger. Version it in git so next quarter's version shows how your judgment changed. <!-- id: cost-07-freemium-playbook-t14 band: deep energy: high -->
15. Take one mechanism you learned from a vendor's documentation during the trial and write it up without naming the vendor. If you cannot, the knowledge is feature-level and you have found something to relearn. <!-- id: cost-07-freemium-playbook-t15 band: focused energy: high -->
16. Set a monthly calendar reminder to re-read your playbook, re-check your free tiers' limits and terms, and update the ladder. This is an ongoing habit, not a one-off task. <!-- id: cost-07-freemium-playbook-t16 band: ongoing energy: low -->

## Common Pitfalls

**Treating the four rungs as one price axis.** The instinct is to rank local, free, trial and paid by cost and pick the cheapest that works. The rungs differ in *what they charge you with* — hours, limits and data rights, a deadline, money — so they are not comparable on a single scale. This produces the specific error of calling local "free" while spending a week of evenings on it, which is not free at all unless you decide the learning was the point.

**Escalating rungs on convenience rather than capability.** Reaching for the hosted model because it is faster and its answers feel better is how a free tier or a credit balance gets consumed by work your laptop could have done. The escalation trigger is the local model being **wrong**, not the local model being slow.

**Reading the headline limit instead of the tier limit.** Free tiers advertise generously and cap specifically. The number that decides whether your workload is possible is the one on the rate-limits page for your actual tier, converted into tasks per day. Finding out by hitting the limit mid-experiment wastes the experiment.

**Assuming free is the privacy-safe option.** It is frequently the opposite. Free tiers often retain broader rights over your inputs than paid tiers at the same provider. If other people's data is involved, read the policy for the specific tier before you send anything — and remember that RA 10173 attaches to the processing regardless of which rung you used.

**Spending trial credit on things that run fine locally.** A credit balance feels like a budget and gets treated as free usage. Each call should pass the question *could I have run this on rung 1?* If yes, the credit was wasted, because the credit is the only resource you have for experiments no other rung can run.

**Learning vendor features instead of mechanisms.** The most expensive thing a trial does is make vendor-specific knowledge feel like progress. If you cannot explain what you learned without naming the product, the knowledge expires with the account. Task 15 is a direct test for this and it is uncomfortable on purpose.

**Believing substitution removes the gap entirely.** Local reproductions teach the concept; they do not teach the operational reality of running something at scale with real failure rates and real consequences. Be honest in your own writing about which of your knowledge is conceptual and which is operational, because the difference shows up in interviews and in production.

**Deferring without writing it down.** An unwritten deferred list becomes a vague sense of being behind, which is worse than the limitation itself. A written list with unblock conditions is a plan, and it is something you can act on the moment your situation changes.

## Deliverable / proof of work

Write `portfolio/cost/07-freemium-playbook.md` containing:

- **The ladder** — four rungs, and for each: what it charges you in its own currency, the specific constraint you measured on it, and your current status. Include the real numbers you found, not categories.
- **The decision rule, applied** — the four-step procedure in your own words, plus a table of ten or more of your own real tasks with the rung the procedure assigns and the reason. Mark where your instinct disagreed with the procedure.
- **What free costs you** — your honest gap list: the experiments you could not run, the data-terms difference you actually read, and the rate limits you converted into tasks per day. Name the workloads that are structurally impossible rather than slow.
- **Substitutions built** — the mechanism reproductions you actually built, what you measured, and what you learned that the vendor feature would have hidden. Include at least one, with its output.
- **The transition, completed** — Phase 5's plan sorted into move-to-local, move-to-free-tier, defer, and cut, with the cut pile justified.
- **The first-peso trigger** — the specific experiment you would fund, its estimated cost at current published rates and a date you checked them, the decision it changes, and the evidence that no free rung can run it.
- **The closing statement** — in your own words, which of your skills survive losing free access and which do not. This is the section a future employer would find most interesting, because it is a judgement about your own competence.

## Checklist

- [ ] I can place any task on the four-rung ladder and name its constraint in the currency that rung actually charges <!-- id: cost-07-freemium-playbook-c01 energy: normal -->
- [ ] I have measured my local model's ceiling on my own tasks and can state its specific failure modes <!-- id: cost-07-freemium-playbook-c02 energy: high -->
- [ ] I apply the decision procedure in order, and I can explain why local comes first <!-- id: cost-07-freemium-playbook-c03 energy: normal -->
- [ ] I know the rate limit at my actual tier, converted into tasks per day, for every free tier I use <!-- id: cost-07-freemium-playbook-c04 energy: normal -->
- [ ] I have read the data-usage terms of my free tier and can state how they differ from the paid tier's <!-- id: cost-07-freemium-playbook-c05 energy: normal -->
- [ ] I have built at least one local reproduction of a paid-only mechanism and measured something with it <!-- id: cost-07-freemium-playbook-c06 energy: high -->
- [ ] I can separate a mechanism from a vendor implementation in my own explanation <!-- id: cost-07-freemium-playbook-c07 energy: normal -->
- [ ] I have a written deferred list with unblock conditions, not a vague sense of being blocked <!-- id: cost-07-freemium-playbook-c08 energy: low -->
- [ ] Phase 5's transition plan is completed and every item is assigned to a rung or cut <!-- id: cost-07-freemium-playbook-c09 energy: normal -->
- [ ] I can name my first-peso trigger, the experiment, its cost, and the decision it changes <!-- id: cost-07-freemium-playbook-c10 energy: normal -->
- [ ] I can state which of my skills survive losing free access, and which do not <!-- id: cost-07-freemium-playbook-c11 energy: low -->
- [ ] My playbook is written down, versioned, and has a recurring date to be revisited <!-- id: cost-07-freemium-playbook-c12 energy: low -->

## Quiz

### Q1. You describe your local model as "free" because it costs nothing per token. What is the most accurate correction? <!-- id: cost-07-freemium-playbook-q01 energy: normal -->

- [x] It has a near-zero marginal cost but a real fixed cost in hardware, electricity and your hours, so "free" describes one side of its cost structure rather than its cost
- [ ] It is free only if you already owned the hardware, so the claim is conditional on your past spending
- [ ] Local models are not free because the software requires a licence
- [ ] It is free for personal use but paid for commercial use

**Why:** The claim is not false so much as incomplete in a way that misleads. Local inference genuinely costs nothing per call, which is its most valuable property for a learner. But hardware, electricity and — the term people omit — your hours are paid whether or not you use it, and the hours are frequently the largest term when you are learning. The licence framing is wrong because open-weight models are typically permissively licensed, and the personal-versus-commercial distinction conflates licensing with cost.

### Q2. Your laptop runs a task slowly but correctly. You have a free tier available. According to the decision procedure, what should you do? <!-- id: cost-07-freemium-playbook-q02 energy: normal -->

- [ ] Move it to the free tier, because free tiers are for exactly this kind of overflow
- [ ] Move it to the free tier, because speed affects how many experiments you can run
- [x] Keep it local — escalation is triggered by the local model being wrong, not by it being slow
- [ ] Split the task, running half locally and half on the free tier

**Why:** The escalation trigger is capability, not convenience. A slow-but-correct local run costs you time and consumes nothing; a free-tier run consumes a finite allowance that you cannot get back, and the allowance is the resource you will need for the tasks local genuinely cannot do. The two tempting alternatives are wrong because local's slowness does not reduce your experiment count enough to matter — you can still run the experiment, and you can run it forty times without a counter.

### Q3. A free tier fails at 15 requests per minute on tokens, and your task needs 400 requests of moderate size. What is the correct conclusion? <!-- id: cost-07-freemium-playbook-q03 energy: high -->

- [ ] Schedule the requests across the hour so the per-minute limit is never reached
- [ ] Retry on failure, since rate limits are frequently soft
- [ ] Use a second account to double the available limit
- [x] Determine whether the workload fits inside the window at all — if it cannot, the rung is structurally unavailable and no scheduling fixes it

**Why:** This is the distinction between a limit you plan around and a limit that breaks you. Some limits are throughput constraints that patient scheduling absorbs; others bound the total work possible in a period, and no amount of clever arrangement fits more work inside a fixed window. The arithmetic — task size times request count against tokens per minute — takes two minutes and prevents a week of building on a rung that was never available. Retrying is wrong because a hard limit is not a transient error, and multiple accounts is both a terms violation and a way to be surprised later.

### Q4. You have trial credit that expires in three weeks. Which is the best use of it? <!-- id: cost-07-freemium-playbook-q04 energy: high -->

- [ ] Run all your daily work through it while it lasts, to get maximum value
- [x] Spend it on the specific experiments that no other rung can run, and run everything else locally
- [ ] Save it until you have a project that needs it
- [ ] Convert as much of it as possible into completed portfolio pieces before it expires

**Why:** The credit is the only resource you have for experiments that exceed local and free-tier capability, so spending it on work your laptop could have done converts a scarce resource into an ordinary one. Running daily work through it feels like maximizing value and is actually the opposite. Saving it *entirely* is also wrong — an unused credit is worth nothing after the expiry date, so the goal is targeted spending, not hoarding. The portfolio option is a pleasant by-product of a well-chosen experiment, not a reason to spend.

### Q5. A provider's documentation shows you how to set reasoning effort on its API. You cannot access the paid tier where it lives. What is the best way to learn the mechanism? <!-- id: cost-07-freemium-playbook-q05 energy: normal -->

- [ ] Read the documentation carefully and memorise the parameter values available
- [ ] Accept that this mechanism is unavailable to you until you can pay
- [x] Run a local model with and without an explicit reasoning step on the same task set, and observe where extra inference-time compute helps and where it only produces longer wrong answers
- [ ] Find a tutorial that demonstrates the feature on the paid tier and follow along

**Why:** Reasoning effort is a mechanism — spending more inference-time compute — and the mechanism is reproducible without the vendor. What you cannot reproduce is the provider's specific implementation, and that is the part that expires anyway. Memorising parameter values is feature-level knowledge that will be stale within months; the local comparison produces a boundary you can state without naming any product. The tutorial option teaches you to watch someone else use a feature, which is the weakest of the available forms of learning.

### Q6. Your free tier's policy says inputs may be used to improve the service, and the same provider's paid tier says they will not be. What is the correct inference? <!-- id: cost-07-freemium-playbook-q06 energy: high -->

- [ ] The provider is acting in bad faith and should be avoided
- [ ] The free tier is safe because no money changes hands
- [ ] The difference is marketing language and has no practical effect
- [x] For anything sensitive the free tier is the riskier option, and this difference can be a reason to pay independent of capability

**Why:** You are not paying on the free tier, so the arrangement is a trade rather than a purchase, and broader rights over your inputs are part of what you are trading. This inverts the naive intuition that free is low-stakes: on the data axis free is frequently high-stakes, and if you are processing other people's personal data the terms you accept matter under RA 10173 regardless of what you paid. The bad-faith reading is wrong because the arrangement is disclosed and rational; the "no practical effect" reading is wrong because it is precisely the clause that decides whether you may send a given dataset.

### Q7. You cannot access a batch endpoint. You build a local SQLite queue with submit, poll and reconcile steps, and deliberately inject a failure rate. What have you learned that reading the documentation would not teach you? <!-- id: cost-07-freemium-playbook-q07 energy: high -->

- [ ] The exact syntax a real batch API expects for submission
- [x] Why reconciliation exists as a routine step, because you produced missing results and had to find them
- [ ] That batch processing is always cheaper than synchronous calls
- [ ] The provider's real throughput characteristics under load

**Why:** The simulation teaches the mechanism through its failure mode, which is more durable than learning it through success. Documentation tells you reconciliation is good practice; running your own queue with a deliberate failure rate shows you what happens to your dataset when you skip it, which is the version you will remember and act on. The syntax of a specific API is exactly the feature-level knowledge that expires. The pricing claim is not what the simulation teaches, and you cannot learn a provider's real throughput from a laptop.

### Q8. Which activity is genuinely NOT well served by free rungs, according to this phase? <!-- id: cost-07-freemium-playbook-q08 energy: normal -->

- [ ] Building and iterating on an evaluation harness
- [ ] Learning retrieval mechanisms on a small corpus
- [ ] Study, writing and portfolio authoring
- [x] High-volume evaluation runs against a frontier model's outputs

**Why:** Evaluation is the highest-leverage free activity when it runs locally — high-volume, low-stakes, and therefore something you can afford to repeat constantly. But when the thing being evaluated requires a frontier model's judgment, the suite itself becomes the bill, and this is the clearest case of an experiment that money genuinely buys. The other three are mechanism-level or mid-tier work, which is exactly the category free rungs carry well.

### Q9. When is spending your first peso justified? <!-- id: cost-07-freemium-playbook-q09 energy: normal -->

- [x] When you have a specific priced experiment that changes a decision you are about to make, and no free rung can run it
- [ ] When a provider offers a discount or a promotional rate
- [ ] When your free credit expires, since you need to keep working
- [ ] When your local model becomes too slow to be practical

**Why:** All three components are required, and each does a job. The priced experiment makes the spend finite and known in advance; the named decision makes it an experiment rather than a purchase; and the exhausted free rungs produce the evidence that makes it defensible. Expiry alone is not a reason — the correct response to expiry is the transition plan, most of which moves to local rather than to paid. A promotion is a reason to buy something you already decided to buy. Slowness is convenience, which the decision procedure explicitly does not fund.

### Q10. What is the phase's central claim about free access? <!-- id: cost-07-freemium-playbook-q10 energy: low -->

- [ ] Free access is sufficient for the entire curriculum and paid access is unnecessary
- [ ] Free access is a temporary advantage that serious learners should replace as soon as possible
- [x] Free access was the practice environment, not the skill — the mechanisms transfer to any provider, and feature-level knowledge expires with the account
- [ ] Free access is a compromise that limits how much you can learn

**Why:** The claim is about which knowledge is durable, not about whether free is enough. Some experiments genuinely need money, and this phase names them rather than pretending otherwise. The point is that what you learn about structure and behaviour — prefix reuse, asynchronous scheduling, the evaluation loop, retrieval failure modes — belongs to no provider and survives losing access, whereas vendor-specific knowledge does not. The third option is the closest error: it treats free as second-best, when for mechanism-level learning it is frequently the better environment precisely because it removes the meter that would make you iterate less.

## You're ready to move on when...

You have one written workflow for one real project of your own, end to end, and it is specific rather than general. You can name your local model's ceiling and its failure modes from your own measurement. You know the rate limit at your actual tier, converted into tasks per day, for every free tier you use. You have read the data terms of your free tier and can state how they differ from paid. You have built at least one local reproduction of a mechanism you cannot buy, and you measured something with it.

You have a deferred list with unblock conditions, and Phase 5's transition plan is finished with every item assigned to a rung or honestly cut. You can name your first-peso trigger: the experiment, its cost at rates you checked on a date you can state, and the decision it changes.

And you can answer the closing question in your own words: which of your skills survive losing free access, and which do not. If you can only answer it vaguely, you have not yet separated what you learned from where you learned it — and that separation is the entire point of the Cost track.

## Free vs Paid

### What's free is enough

Everything this phase asks you to produce is free, and the free path is not a degraded one. It is, for most of this work, the better one.

The ladder is writing. The decision procedure is applied to tasks you already perform. Your local baseline comes from a model you download once. Rate limits, pricing pages and data-usage policies are public documents. The batch simulation runs in SQLite, the cache instrument is a Python decorator, and the reasoning comparison needs only a local model and a task set. Phase 5's transition plan is finished with a text editor. Your playbook is a Markdown file.

Two of the substitutes are genuinely better learned on the free path. Instrumenting your own cache teaches the hit/miss asymmetry more concretely than paying for a provider's cache ever would, because you can watch the counters move. Simulating the batch lifecycle with a deliberate failure rate teaches why reconciliation is routine in a way that a working endpoint never will, because a working endpoint hides the failures it is handling for you.

The one thing free cannot give you is the frontier capability gap in Part 5, and this phase's response is not to pretend otherwise but to **name it, price it, and defer it**. That is a different thing from being blocked, and the difference is the deliverable.

### What a paid tier adds

Four things, and it is worth being precise about which of them you actually need.

**Capability above your free ceilings.** This is the only one that is genuinely load-bearing, and it is narrow. It matters for tasks where reasoning quality decides the outcome — hard debugging, complex multi-step planning, judging subtle output quality — and it does not matter for the mechanism-level work that makes up most of this curriculum.

**Rate limits that permit volume.** Free tiers cap low enough that some workloads cannot run at all. If your evaluation suite needs thousands of calls against a frontier model, the tier is the blocker and money removes it. This is the second genuine reason, and it is the one most likely to bind on a real project.

**Feature access that changes the arithmetic.** Prompt caching, batch pricing, and schema-constrained decoding are frequently paid-tier features or paid-tier-discounted. Since these move a bill more than the headline rate does, paying for access can make the paid option cheaper for a specific high-volume workload. Worth computing rather than assuming — and worth remembering that you can learn each of these mechanisms free, which is what Phase 6 and Part 4 are for.

**Data terms you can live with.** If you process other people's personal data, a narrower retention and training-use policy is sometimes the whole reason to pay, entirely independent of capability. Under RA 10173 this is an obligation rather than a preference, and it is the one place where the free option can be the wrong choice on grounds that have nothing to do with money.

**Volatile, dated: as of early 2026, which models are frontier, what they cost, what the free tiers allow and what their terms say all change on the order of months. Check the current pages for the current tier rather than any summary, including this one.**

### When it's worth paying

**Not this week, and probably not this quarter.** Every task in this phase runs on a local model, public pages, and writing. The deliverable is a policy, not inference volume.

The threshold is the trigger from Part 5, restated because it is the phase's practical conclusion: **spend when you have a specific, priced experiment that changes a decision you are about to make, and no free rung can run it.** When that condition is met, spend small — one month at your measured usage, not more — set the provider's spending cap in the same sitting if one exists, and start your usage log with the first call, because from that moment the log is what you steer with.

And keep the claim in view while you do it. The money buys you access to capability and volume. It does not buy you the mechanisms, which you have already been learning on hardware you own, and it does not buy you the judgement about when to spend — that is the thing this phase was actually for.
