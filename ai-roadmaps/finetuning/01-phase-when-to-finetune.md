---
id: ft-01-when-to-finetune
track: finetuning
phase: 1
order: 10
title: When to Fine-Tune, and When Not To
duration: 1 week
duration_weeks: 1
energy_mix: [normal, low]
deliverable: portfolio/finetuning/01-when-to-finetune.md
exit_criteria: >
  You can walk a proposed use case through an ordered decision ladder — prompt,
  context, tool, fine-tune — and justify your stopping point in writing. You can
  state the behaviour-versus-facts distinction, name the five underestimated
  costs, and identify the narrow conditions under which fine-tuning is genuinely
  the right answer.
---

# Phase 1 — When to Fine-Tune, and When Not To

## Goal of this phase

This phase teaches you to **not fine-tune**, and to know precisely when that advice is wrong.

That is not a trick. Fine-tuning is the most over-recommended technique in applied AI. When someone's model output is unsatisfactory, "we should fine-tune it" is the reflex answer, and it is usually the expensive wrong one. It converts a two-hour prompting fix into a six-week project with a permanent maintenance obligation. The honest answer to "should I fine-tune?" is **no** in the large majority of cases — but only if you can explain *why*, because the cases where it is right are real and valuable, and you cannot recognise them by memorising "don't."

The organising idea is an **ordered decision ladder**. Each rung is cheaper and faster than the one below it, so you climb only when the rung you are on has genuinely been exhausted:

1. **Better prompt** — have you actually tried? Clear instructions, a worked example or two, a specified output format.
2. **Give it the information** — is the problem that the model *does not know* something? Then put the knowledge in the context (retrieval), which is what the RAG track covers.
3. **A tool** — is the problem that the model needs to *do* something, or fetch something current? That is a function call, not a weight update.
4. **Only then**, fine-tuning.

The reason this ordering matters is that the rungs solve *different problems*, and people reach for rung four to fix problems that live on rung two. A model that gives wrong answers about your company's refund policy does not need training; it needs the refund policy in the prompt. Training it to "know" the policy is the single most common expensive mistake in this field.

The second organising idea is a distinction you will use for the rest of your career:

> **Fine-tuning changes BEHAVIOUR. It is a poor way to inject FACTS.**

Behaviour means style, format, tone, structure, refusal patterns, and narrow task competence — *how* the model responds. Facts mean knowledge — *what* the model knows. Fine-tuning is good at the first and bad at the second, for reasons this phase develops in detail: it is expensive, the facts go stale the moment they change, the model cannot cite where a fact came from, and there is no reliable way to update one fact without retraining.

By the end you will have a written decision record for one real use case from your own work, with the ladder walked rung by rung and a justified stopping point. That document is the deliverable, and it is more valuable than a trained model would be, because you will write it many times and train rarely.

## Estimated time

**1 week** at 1–2 hours a day, 5 days a week. Roughly 6–8 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | The decision ladder, and why its order is the point | 1.5h |
| 2 | Behaviour versus facts — the distinction that decides most cases | 1.5h |
| 3 | The five underestimated costs | 1.5h |
| 4 | Where fine-tuning genuinely wins, and distillation | 1.5h |
| 5 | Writing your decision record | 1.5h |

If you only have two hours this week, do tasks 1, 3 and 11. Those give you the ladder, the behaviour/facts test, and the written decision — which is the phase.

## Skills you'll gain

- Walk a use case through an ordered decision ladder and justify where you stop.
- Distinguish a behaviour problem from a facts problem, and name the cheap fix for each.
- Explain why fine-tuning is a poor mechanism for injecting knowledge.
- Name the five underestimated costs of a fine-tuning project.
- Estimate whether a use case has the volume and stability to justify training.
- Recognise the conditions under which fine-tuning is genuinely the right tool.
- Explain what distillation is and why it is where fine-tuning most often wins.
- Write a decision record that a colleague could audit.

## Specific topics to learn

- **The decision ladder** — prompt, retrieval/context, tools, fine-tuning, in that order.
- **Behaviour versus facts** — the core distinction, with examples of each.
- **Instruction following versus knowledge injection** — why there are two different capabilities.
- **The five underestimated costs** — dataset construction, compute, evaluation, deployment, maintenance.
- **Maintenance forever** — every base-model update re-opens the work.
- **Staleness** — why a fact baked into weights has no update path.
- **The volume threshold** — how request volume interacts with the decision.
- **Task stability** — why a moving target defeats fine-tuning.
- **Distillation** — the technique that usually makes fine-tuning pay.
- **Catastrophic forgetting** — a preview, developed in Phase 2.
- **Parameter-efficient methods** — a preview: you rarely update all the weights.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| A notebook | Write the decision record and keep your reasoning auditable | Free/open-source | https://jupyter.org/ | Tasks t01–t12 — all written work lives here | Any text editor or Markdown file in a git repo |
| `tiktoken` | Count tokens so you can price a prompt-only fix against training | Free/open-source | https://github.com/openai/tiktoken | Task t06 — estimate the context cost of the retrieval rung | Any tokenizer library, or your provider's token-counting endpoint |
| Google Colab | Free GPU to feel what training is like before committing to it | Freemium | https://colab.research.google.com/ | Task t09 — a tiny LoRA run so the cost is concrete | Kaggle Notebooks (also free GPU, usually a longer weekly quota) |
| Kaggle Notebooks | Alternative free GPU with a generous weekly quota | Freemium | https://www.kaggle.com/code | Task t09 — use whichever gives you more hours this week | Colab free tier |
| Hugging Face Hub | Find open-weight models and their licences | Free/open-source | https://huggingface.co/models | Task t10 — check the licence of a model you might train | Model cards on the provider's own site |
| The base model's own documentation | Confirm what a provider's fine-tuning service actually supports | Freemium | https://developers.openai.com/api/docs/guides/fine-tuning | Task t07 — read the vendor's own guidance before believing a blog post | Open-weight model documentation |

## Free/cheap resources

- **The provider's own fine-tuning guide** — start here, always. Providers write these honestly because they would rather you not waste money on the wrong technique, and they state plainly that fine-tuning is for behaviour and format rather than knowledge.
- **The LoRA paper (arXiv:2106.09685)** — read the abstract and section 1 only, for now. It is more accessible than its reputation, and Phase 2 works through it properly.
- **The RAG track, phases 1–3** — the retrieval rung of the ladder. If you have not done those yet, this phase's ladder will still make sense, but the alternative to fine-tuning will be less concrete.
- **Your own past prompts** — the cheapest possible dataset of behaviour problems. Look at what you have been repeatedly correcting.

## Lesson: The Expensive Answer Is Usually "No"

### Why the reflex is wrong

Picture the most common fine-tuning request in the world. It sounds like this:

> "Our support assistant keeps getting the refund policy wrong. We think we need to fine-tune it on our documentation."

Every clause of that is plausible and the conclusion is wrong. The model is not *failing to know* the refund policy; it is *not being told* the refund policy. Those look identical from the outside, because in both cases the output is wrong. But they have completely different fixes, and one of them costs ₱0 and takes an afternoon.

Here is the test that separates them. Ask: **if I pasted the correct information directly into the prompt, would the output become correct?**

- If **yes**, it is a facts problem. The fix is retrieval or a longer prompt. Fine-tuning is the wrong tool.
- If **no** — the model has the information and still produces the wrong *shape*, style, or behaviour — then you have a genuine case for training.

Almost every "we should fine-tune it" turns out to be the first case. This is not because fine-tuning is bad. It is because the two failure modes are indistinguishable in a screenshot, and only one of them is a training problem.

### Behaviour versus facts

This is the distinction the whole phase turns on, so it is worth stating precisely.

| | **Behaviour** | **Facts** |
|---|---|---|
| What it is | *How* the model responds | *What* the model knows |
| Examples | Tone, format, JSON shape, brevity, refusal style, always-cite-sources, a narrow classification task | Your refund policy, today's prices, a customer's order status, a paper published last week |
| Fine-tuning | **Good at this** | **Poor at this** |
| The cheap fix | Prompt or a few examples | Retrieval, context, or a tool |
| Goes stale? | Slowly — behaviour is stable | Constantly — facts change |

The asymmetry is not arbitrary; it comes from what training actually does. Training adjusts the model's tendencies — the distribution of what it produces next. That is a natural fit for shaping output. Facts, by contrast, have to be *stored*, and a model stores them diffusely across billions of parameters with no index, no update path, and no way to say where a particular belief came from.

**Four concrete reasons facts resist being trained in:**

1. **It is expensive per fact.** You are paying a full training run to teach something you could paste in a prompt.
2. **It goes stale with no update mechanism.** Prices change on Tuesday. You cannot edit the model's weights on Tuesday. You retrain, or you go back to retrieval — which is what you should have done.
3. **It cannot cite.** A production system usually needs to say *where* a claim came from. A fact in the weights has no provenance, and the model will state it with the same confidence whether it is right or hallucinated.
4. **It often fails to memorise anyway.** This is the part that surprises people. Fine-tuning on facts frequently teaches the model the *format* of your examples rather than the facts in them. You get beautifully formatted answers containing the same old errors. The literature on this is consistent, and it is why the practical guidance from providers is to use retrieval for knowledge.

⚠️ **Volatile:** specific provider fine-tuning services, their supported models and their prices change frequently. Check the current documentation before relying on any figure, and date what you find.

### The decision ladder

Now the ladder in full. Climb it in order, and stop at the first rung that solves your problem.

```text
1. PROMPT
   Have you tried clear instructions, 2-3 worked examples, and a specified format?
   Cost: minutes. Reversible. Try this first, always.

2. CONTEXT / RETRIEVAL
   Does the model lack the information? Put it in the prompt, retrieved if large.
   Cost: hours to days. The RAG track. Handles facts, citations, freshness.

3. TOOLS
   Does the model need to act, compute, or fetch something current?
   Cost: hours to days. Handles anything that must be live or exact.

4. FINE-TUNE
   Only when 1-3 are exhausted AND all of the following hold:
     - the task is high-volume and stable
     - you have real input data and trustworthy outputs
     - you can measure the improvement with an eval suite
     - there is cost or latency pressure that justifies the work
```

Two properties of this ladder are easy to miss.

**The rungs are not interchangeable.** People talk about "prompting versus RAG versus fine-tuning" as three ways to do the same thing. They are not. Each solves a different problem class, and using the wrong rung does not produce a worse result — it produces *no* result, at full cost. Training facts in is not an expensive way to get retrieval; it is a way to get stale, uncitable, often-absent facts, having paid for training.

**The rungs compose.** The realistic production system is not one rung. It is retrieval *plus* tools *plus* a fine-tuned smaller model doing the easy majority of work — which is exactly where Phase 5's distillation lands. Fine-tuning earns its place as the *last* addition to a working system, not the first attempt at a broken one. You cannot fine-tune your way out of a problem you have not yet measured, because you would have nothing to compare against.

### Where it genuinely wins

Fine-tuning is the right answer in narrower conditions than its reputation suggests, but they are real. It wins when **several** of these hold together:

- **High volume, narrow, stable task.** Classification, extraction into a fixed schema, a specific transformation — done thousands of times, against a spec that is not moving.
- **You have data.** Real inputs from production, and outputs you trust. Not invented examples. Phase 3 is entirely about this, and it is the gate that stops most projects.
- **You can measure it.** An eval suite exists, so "better" is a number and not an impression. Phase 4 is this.
- **There is cost or latency pressure.** This is the one that actually pays the bills. A small fine-tuned model serving the easy majority of traffic at a fraction of the cost per call is a business case, not a hobby.
- **The behaviour is genuinely hard to specify in a prompt.** Some output constraints are easy to state and hard to enforce by instruction alone.

Notice how many of those are *preconditions* rather than benefits. Three of the five are things you must already have before training is even possible. That is the real shape of the decision: fine-tuning is not a technique you reach for when things are going badly; it is a technique you can *afford* once things are already going well enough that you have data, evals, and volume.

**Distillation is where it wins most often.** If you have a working system powered by an expensive model, and most of its traffic is the easy case, you can generate outputs with the strong model, filter them, and train a small open-weight model on the survivors. Now the easy majority runs on hardware you control at near-zero marginal cost. That is the single most compelling economic case for fine-tuning, and it is Phase 5's entire subject.

### The five underestimated costs

Here is where projects actually die. Everyone budgets for compute; almost nobody budgets for the rest, and the rest is the bulk.

| Cost | Reality | Why it is underestimated |
|---|---|---|
| **Dataset construction** | Roughly **80% of the work** | People assume the data exists and is clean. It does not, and it is not |
| **Compute** | The one cost people do budget | It is the *smallest* and most predictable line item |
| **Evaluation** | Needs a suite before you can claim improvement | Without it you have no way to know if training helped or hurt |
| **Deployment** | Serving, versioning, rollback, monitoring | A trained model is a new artifact with a new lifecycle |
| **Maintenance, forever** | **Every base-model update re-opens the work** | The one nobody plans for, and the one that never ends |

**Maintenance is the cost that changes decisions.** When your provider releases a new base model — and they will, repeatedly — your fine-tune does not come along. You retrain, re-evaluate, and redeploy, or you stay on a model that is now behind. That is not a one-time project; it is a permanent obligation attached to a moving target. This single fact disqualifies a large fraction of otherwise reasonable fine-tuning proposals, and it is why the volume and stability preconditions matter so much: you are not buying a model, you are signing up to maintain one.

### What to do instead of fine-tuning

When the ladder's first three rungs are the answer, these are the actual techniques:

- **Better instructions.** Specify the format explicitly, state the constraint, give the reason. Most "the model can't do this" is an underspecified request.
- **Few-shot examples.** Two or three worked examples in the prompt teach format and tone more reliably and far more cheaply than training. This is behaviour shaping at rung one.
- **Retrieval.** For anything factual, current, or needing citation. See the RAG track.
- **Constrained decoding or a schema.** If the output must be valid JSON, enforce it structurally rather than hoping training will.
- **Post-processing.** Sometimes the fix is a five-line function after the model, not a training run.

None of these are compromises. For the problems they solve, they are strictly better than fine-tuning: faster, cheaper, reversible, and easier to debug.

### The honest summary

Fine-tuning is a real and powerful technique with a narrow, identifiable set of winning conditions. The skill this phase teaches is not "how to fine-tune" — that is phases 2 and 3 — but **how to tell whether you should**, because the default answer is no and the people who get this right are the ones who can explain why.

Write your decision down. A decision record that says "we evaluated four rungs and stopped at retrieval, here is the evidence" is worth more than a trained model, because it is reusable reasoning. Phases 2 through 6 assume you have cleared this gate honestly. If your own use case does not clear it, that is a **successful** outcome of this phase, and you should say so in your deliverable.

## Hands-on practice tasks

1. Find three recent online posts or videos recommending fine-tuning for a problem. For each, identify which rung of the ladder the actual problem belongs to. <!-- id: ft-01-when-to-finetune-t01 band: quick energy: low -->
2. Write down the last time a model gave you a wrong answer. Apply the paste test: would putting the correct information in the prompt have fixed it? Classify the problem as behaviour or facts. <!-- id: ft-01-when-to-finetune-t02 band: quick energy: low -->
3. Take a real use case of your own and walk it through all four rungs in writing. State at which rung you stop and what evidence justifies stopping there. <!-- id: ft-01-when-to-finetune-t03 band: focused energy: normal -->
4. Find one claim you believe the model has memorised incorrectly. Test whether it is a facts problem by supplying the correct information in the prompt and observing whether the output changes. <!-- id: ft-01-when-to-finetune-t04 band: focused energy: normal -->
5. Write out the five underestimated costs and estimate each one for your use case in hours rather than money. Identify the largest. <!-- id: ft-01-when-to-finetune-t05 band: focused energy: normal -->
6. Count the tokens in a realistic prompt for your use case, then price one month of that prompt at your current request volume. Compare it to the cost of one training run plus its maintenance. <!-- id: ft-01-when-to-finetune-t06 band: deep energy: high -->
7. Read the fine-tuning documentation of one major provider end to end. Extract what they say it is for and what they say it is not for, and quote them. <!-- id: ft-01-when-to-finetune-t07 band: focused energy: normal -->
8. Write a one-paragraph argument *for* fine-tuning your use case, as persuasively as you can. Then write the rebuttal. Decide which is stronger and why. <!-- id: ft-01-when-to-finetune-t08 band: focused energy: high -->
9. Run a tiny LoRA fine-tune on a free GPU tier, purely to feel the mechanics and the wall-clock time. Record how long it took and how much of that was setup versus training. <!-- id: ft-01-when-to-finetune-t09 band: deep energy: high -->
10. Choose an open-weight model you might realistically train. Read its licence and write down any restriction that would affect a commercial product. <!-- id: ft-01-when-to-finetune-t10 band: focused energy: normal -->
11. Write your decision record: the use case, the four rungs with evidence for each, your stopping point, and the conditions under which you would revisit. <!-- id: ft-01-when-to-finetune-t11 band: deep energy: high -->
12. List the specific signals that would tell you the decision was wrong — for example eval scores plateauing after a prompt fix — and where you would look for them. <!-- id: ft-01-when-to-finetune-t12 band: ongoing energy: normal -->

## Common Pitfalls

**Fine-tuning to inject facts.** The most expensive mistake in applied AI. Facts belong in retrieval, where they can be updated, cited and verified. Fine-tuning often teaches the *shape* of your examples without the content, so you pay for training and keep the wrong answers — now in a consistent format that makes them look more authoritative.

**Treating the rungs as interchangeable.** "Prompting versus RAG versus fine-tuning" is not a menu of three equivalent options. Each solves a different problem class, and picking wrong yields nothing rather than something worse.

**Skipping the prompt rung because it feels unserious.** Two well-chosen examples frequently move output quality more than a training run, at a ten-thousandth of the cost, and you can iterate in minutes.

**Forgetting maintenance.** Every base-model release re-opens the work. A fine-tune is a permanent commitment to a moving target, and this cost alone should disqualify most proposals.

**Training without an eval suite.** You will not be able to tell whether it helped. "It seems better" after paying for compute is not evidence, and silent regressions are the norm — a lesson Phase 4 develops at length.

**Assuming your data is ready because it exists.** Real production logs are duplicated, imbalanced, inconsistently formatted and full of exactly the errors you want to remove. Dataset construction is around 80% of the work, and Phase 3 exists because of it.

**Letting a vendor's marketing set the bar.** Fine-tuning endpoints are easy to call, which makes them feel like the intended next step. Read the same vendor's own guidance on when to use them, which is usually more conservative than the landing page.

## Deliverable / proof of work

Create `portfolio/finetuning/01-when-to-finetune.md` containing:

1. **The use case**, described concretely enough that someone else could evaluate it.
2. **The ladder, walked rung by rung**, with evidence for each: what you tried at the prompt rung, what a retrieval solution would look like, whether a tool fits. Not assertions — evidence.
3. **Your stopping point**, and the specific reason the rung below it is unnecessary.
4. **A behaviour-or-facts classification**, with the paste test applied.
5. **Cost estimates** for the five categories in hours, naming the largest.
6. **A revisit condition** — the concrete signal that would change your mind.

If your conclusion is "do not fine-tune," **state that plainly and say so in your own words.** That is a correct and complete deliverable. The remaining phases in this track are still worth doing, because they teach you to evaluate the technique and because distillation — Phase 5 — depends on them.

## Checklist

- [ ] I can state the four rungs of the decision ladder in order <!-- id: ft-01-when-to-finetune-c01 energy: low -->
- [ ] I can apply the paste test to distinguish a behaviour problem from a facts problem <!-- id: ft-01-when-to-finetune-c02 energy: normal -->
- [ ] I can explain why fine-tuning is a poor mechanism for injecting facts <!-- id: ft-01-when-to-finetune-c03 energy: normal -->
- [ ] I can name all five underestimated costs without looking them up <!-- id: ft-01-when-to-finetune-c04 energy: normal -->
- [ ] I understand that maintenance is permanent because base models keep changing <!-- id: ft-01-when-to-finetune-c05 energy: normal -->
- [ ] I have walked a real use case through all four rungs in writing <!-- id: ft-01-when-to-finetune-c06 energy: high -->
- [ ] I have estimated the largest cost category for my use case <!-- id: ft-01-when-to-finetune-c07 energy: normal -->
- [ ] I can name the preconditions — volume, stability, data, evals — that must all hold <!-- id: ft-01-when-to-finetune-c08 energy: normal -->
- [ ] I can explain why distillation is where fine-tuning most often pays off <!-- id: ft-01-when-to-finetune-c09 energy: normal -->
- [ ] I have read one provider's own fine-tuning guidance rather than a blog post <!-- id: ft-01-when-to-finetune-c10 energy: normal -->
- [ ] I have written a decision record with a stated revisit condition <!-- id: ft-01-when-to-finetune-c11 energy: high -->
- [ ] I accept that "do not fine-tune" is a legitimate and common result <!-- id: ft-01-when-to-finetune-c12 energy: low -->

## Quiz

### Q1. Your support assistant gives wrong answers about your refund policy. What is the correct first fix? <!-- id: ft-01-when-to-finetune-q01 energy: normal -->

- [ ] Fine-tune on the policy document so the model memorises it
- [x] Put the policy in the prompt, retrieved if it is long — the model is not failing to know it, it is not being told it
- [ ] Switch to a larger and more expensive model
- [ ] Increase the maximum output length

**Why:** This is the paste test in its most common form. The model is not lacking the capability to answer policy questions; it is lacking the policy. Retrieval fixes it in an afternoon, keeps the answer citable, and updates the moment the policy changes — whereas a fine-tune gets expensive, goes stale on the next policy revision, and may not memorise the content anyway. A larger model does not help because knowledge it was never given is not a scale problem.

### Q2. What is the central distinction this phase teaches? <!-- id: ft-01-when-to-finetune-q02 energy: normal -->

- [ ] Open-weight versus closed models
- [x] Fine-tuning changes behaviour; it is a poor way to inject facts
- [ ] Supervised versus unsupervised learning
- [ ] Training versus inference cost

**Why:** Almost every fine-tuning decision resolves on this distinction. Behaviour — format, tone, structure, narrow task competence — is what training shapes naturally, because training adjusts the model's tendencies. Facts need to be stored with provenance, updated when they change, and cited when used, and weights provide none of those. The four reasons facts resist training — expense, staleness, no citation, and frequent failure to memorise — all follow from it.

### Q3. Which cost is most often forgotten and most changes the decision? <!-- id: ft-01-when-to-finetune-q03 energy: normal -->

- [ ] Compute
- [ ] Dataset construction
- [x] Maintenance — every base-model update re-opens the work permanently
- [ ] Deployment

**Why:** Compute is the smallest and most predictable line, and dataset construction is the largest but at least visible once you start. Maintenance is the one nobody plans for, because it is not part of the project — it is an obligation that begins when the project ends. When a provider ships a new base model, your fine-tune does not migrate; you retrain, re-evaluate and redeploy, or fall behind. This is why stability and volume are preconditions rather than nice-to-haves.

### Q4. When is fine-tuning genuinely the right choice? <!-- id: ft-01-when-to-finetune-q04 energy: high -->

- [x] When the task is high-volume, narrow and stable, you have real data and evals, and there is cost or latency pressure
- [ ] Whenever the current output quality is unsatisfactory
- [ ] Whenever you have more than a thousand examples
- [ ] Whenever the model is too slow

**Why:** Those conditions are largely *preconditions* rather than benefits — three of them are things you must already possess before training is possible at all. That is the true shape of the decision: fine-tuning is affordable once a system already works well enough to have generated data and measurements, not a rescue for one that does not. Slowness alone is a latency problem with rung-one and rung-three fixes, and example count without volume, stability and evals proves nothing.

### Q5. Why is fine-tuning a weak way to store facts? <!-- id: ft-01-when-to-finetune-q05 energy: high -->

- [ ] Because models cannot store information in their weights
- [ ] Because training data is always too small
- [ ] Because facts are too large to fit in a model
- [x] Because facts go stale with no update path, cannot be cited, cost a full training run each, and often fail to be memorised at all

**Why:** Models demonstrably do store information, so the objection is not capacity — it is lifecycle. A fact in weights has no edit, no timestamp, no source and no way to expire, which is exactly the opposite of what factual claims in a production system need. The fourth reason is the one that surprises people: training on facts often teaches the format of the examples while leaving the content wrong, so you pay for training and keep the errors. Retrieval supplies all four missing properties for free.

### Q6. A candidate says "we tried better prompts and it did not help, so we need to fine-tune." What is missing from that reasoning? <!-- id: ft-01-when-to-finetune-q06 energy: high -->

- [ ] Nothing — that is a sound conclusion
- [x] They skipped rungs two and three: whether the model lacks information (retrieval) or needs to act on current data (a tool)
- [ ] They should have tried a larger model first
- [ ] They need more training data

**Why:** Failing at the prompt rung is evidence about the prompt rung only. It says nothing about whether the problem is factual — fixed by retrieval — or dynamic — fixed by a tool. Jumping from rung one to rung four is the most common path to an expensive project that solves the wrong problem, and the ladder's ordering exists precisely to make that jump visible. Rung four is reached only after two and three have been tested and shown insufficient.

### Q7. What connects this phase to distillation in Phase 5? <!-- id: ft-01-when-to-finetune-q07 energy: normal -->

- [x] Distillation is the case where fine-tuning most often pays: a small model learns the easy majority from a strong model, cutting the cost of a working workload
- [ ] Distillation is a way to avoid needing any data
- [ ] Distillation replaces evaluation
- [ ] Distillation is a synonym for fine-tuning

**Why:** Distillation satisfies the winning conditions rather than dodging them. There is volume by construction, the task is narrow, the teacher generates the training targets, and the eval suite already exists because the teacher system was already measured. That is why it is the strongest economic argument for training at all, and it is the reason this track does not end at "usually do not fine-tune" — it ends at knowing the narrow shape of the case where you should.

## You're ready to move on when...

- You can recite the four rungs in order and explain why the order matters.
- You can apply the paste test to a new problem without hesitating.
- You can name all five underestimated costs, and explain why maintenance is the decisive one.
- You have a written decision record for a real use case, with evidence at each rung.
- You can state the preconditions that make fine-tuning viable, and recognise that most of them are things you must already have.
- You understand that "do not fine-tune" is the common, correct outcome — and that Phase 2 is still worth learning.

## Free vs Paid

**Everything in this phase is free.** It is a decision-making phase, and the deliverable is a written document. There is nothing to buy and no service to subscribe to.

**The free path, concretely:** write your decision record in a Markdown file in the git repository you have been using since the Foundations track. Use your existing model access for the prompt-rung experiments. If you want to feel the mechanics of training, Google Colab and Kaggle Notebooks both provide free GPU time on a weekly quota, and either is enough for a tiny LoRA run on a small model — which is exactly what task 9 asks for.

**What the paid tiers would add, and why you do not need them here:** hosted fine-tuning endpoints let you upload data and get a trained model back without managing hardware. They are genuinely convenient, and they are the wrong purchase at this stage — you have not yet established that you *should* fine-tune, and buying the capability before clearing the decision is the mistake this phase exists to prevent. Free GPU tiers also impose honest limits worth knowing: sessions are time-limited and disconnect, so checkpoints must be saved to persistent storage rather than left in the ephemeral session, and small models on free hardware have real capability ceilings. Phase 3 covers that workflow properly.

**The one cost that is not free, and matters:** your time. The realistic estimate is 6–8 hours for this phase, most of it spent thinking and writing rather than running anything. That is the correct allocation. A well-argued decision to *not* train has saved you weeks, and it costs only the afternoon you spent deciding.
