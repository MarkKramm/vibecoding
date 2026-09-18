---
id: sc-01-how-models-go-wrong
track: safety-career
phase: 1
order: 18
title: How Models Go Wrong
duration: 1 week
duration_weeks: 1
energy_mix: [normal, high]
deliverable: portfolio/safety-career/01-how-models-go-wrong.md
exit_criteria: >
  You can name the ways a model-based system fails, explain the mechanism behind each,
  describe how you would detect it in a system you actually built, and state which
  mitigations work and which are theatre. You have found at least one real failure in your
  own use and written up the mechanism rather than the symptom.
prerequisites:
  - foundations/01
  - model-internals/01
---

# Phase 1 — How Models Go Wrong

## Goal of this phase

Learn the ways a model-based system fails, well enough to **predict** a failure before you see it and **diagnose** one when you do.

This is not a philosophy phase. Nobody here is asking whether a model is conscious, lying, or dangerous in the abstract. The question is narrower and more useful: **you are going to ship something built on a system that produces confident wrong answers as a normal mode of operation.** This phase teaches you what those wrong answers look like, why they happen, how to catch them, and what you can actually do about it.

The organising idea is that **almost every model failure is a mismatch between what the system was optimised for and what you are asking of it.** Once you can name the mismatch, the failure stops being mysterious. That is the skill this phase builds.

## Estimated time

**1 week at 1–2 focused hours a day.** The reading is not long. The work is: you go find real failures in your own use and explain the mechanism. That is slower than reading and much more valuable.

## Skills you'll gain

- Distinguish **hallucination** from **confabulation** from **being wrong**, and explain why the distinction changes your mitigation.
- Explain **sycophancy** as a consequence of preference training rather than a bug, and predict when it will show up.
- Describe **calibration** and the failure to know what one does not know, and say why a model cannot simply be asked to flag its own uncertainty.
- Recognise **representational harm** and **distributional shift**, and state what each looks like in a system you built.
- Build a **failure taxonomy for your own project** — the actual list of ways yours can go wrong, not the generic one.
- Tell the difference between a mitigation that reduces a failure and a **guard that only looks like one**.

## Specific topics to learn

1. **Hallucination and confabulation.** Why fluent, specific, well-formatted output carries no evidence of truth. Why the model has no access to "I don't know" as a reliable state.
2. **Calibration.** What it means for a probability to be honest, and why post-training damages calibration in exchange for other properties.
3. **Sycophancy.** How preference training on human approval creates a system that agrees with you. Why this is worse for a beginner, who cannot tell agreement from correctness.
4. **The distributional shift problem.** Why a model is fine in testing and wrong in production, and what "the input distribution changed" actually means.
5. **Representational harm.** Where bias enters — data, objective, deployment context — and what is measurable versus what is not.
6. **Failure compounding.** Why five steps at 95% reliability give you about 77%, and what that means for anything you chain.
7. **The detection problem.** Why you cannot detect these by asking the model. What external checks look like.

## Tools for This Phase

- **Any chat model you already have access to** — free tier is completely fine. You are looking for failures, and free models fail plenty.
- **Your own project**, whatever you have built so far. This phase is much better with something real to inspect.
- **A plain text file** for your taxonomy. Not a note-taking app with features — you want to reread and edit this.
- **`git log`** if your project is version-controlled, so you can find where something changed and went wrong.

Nothing here costs money. Do not buy anything for this phase.

## Free/cheap resources

- **Anthropic's and OpenAI's own documentation on hallucination and limitations.** Read what the vendors say their systems do badly — it is more candid than most marketing suggests, and it is authoritative about their own products.
- **Your own history.** The most useful resource is the last twenty times a model was wrong with you. You almost certainly have them and have never analysed them. That corpus is free and specific to you, which makes it better than any textbook.
- **The model's system card or model card**, if you can find it. These document known failure modes and refusal behaviours, and they are written by the people who trained it.
- **`docs/research/vibecoding-tool-landscape.md` in this repository**, for the dated state of the free tooling as of 2026-09, if you want to know which of these you can test for nothing.

Be careful with general blog posts about AI safety. Much of it is written by people reasoning about systems they have not run, and it blends **observed behaviour** with **speculation about future behaviour** without marking which is which. Prefer primary sources — the vendor's own documentation, or your own logs.

## Lesson: The System Is Not Trying to Be Right

### Part 1 — What the model is actually doing

Start with the thing that makes everything else make sense.

A language model is trained to produce **likely continuations of text**. During pre-training it sees an enormous quantity of writing and learns to predict what comes next. Later stages — instruction tuning, then preference training — shape that raw capability toward being helpful, but they shape it. They do not replace the foundation.

So the core operation is: **given this text, what would plausibly follow?**

Notice what is not in that sentence. There is no step where the system checks the output against the world. There is no representation of "true" and "false" that it consults before answering. There is no internal flag that reliably says *I do not know this*.

**This is not a flaw added on top of an otherwise sound design. It is the design.** The system is extremely good at producing text that *looks like* the answer to your question, because that is precisely what it was trained to do, and "looks like a correct answer" is a property of the text rather than of the world.

Which gives you the first rule of this phase:

**Fluency is not evidence.** A well-formatted, specific, confidently-phrased answer is evidence of exactly one thing — that this is what a good answer to your question would look like. Whether it *is* one is a separate question, and the model has no privileged access to it.

### Part 2 — Hallucination, and why the word is misleading

The word "hallucination" suggests a system that is malfunctioning, perceiving something that is not there. It is worth breaking that frame, because the frame suggests a fix.

**A model does not hallucinate. It generates.** When it produces a citation that does not exist, a function that is not in the library, or a statistic with a decimal point, it is doing the same thing it does when it produces something correct: generating a plausible continuation. The output is wrong; the *process* is identical in both cases.

This is why the failure is so hard to notice. There is no glitch, no stutter, no visible seam. The model does not pause before the fabricated part.

**The distinction that matters practically: a model is not more likely to be wrong about a thing because it does not know it.** Asked about something outside its knowledge, it does not produce a lower-confidence answer or decline. It produces an answer of the same fluency, because that is what the objective rewards. Asked about something *in* its knowledge, it produces an answer of the same fluency. **You cannot tell the two cases apart from the output alone.**

This is the single most important consequence in the phase, so state it plainly:

**You cannot detect a hallucination by looking at it.** It looks correct, because looking correct is what it was optimised to do. Detection has to come from outside — from checking the thing against something that is not the model.

### Part 3 — Calibration, and the impossibility of asking

A well-calibrated system says "70% likely" and is right 70% of the time. Models are, broadly, **poorly calibrated on their own uncertainty**, and there is a specific reason this is hard to fix.

The post-training that makes a model helpful — being trained on examples where the assistant answers the question rather than refusing, and being preferred by human raters when it gives a confident, complete reply — **rewards answering.** A model trained this way learns that hedging is less preferred than confident assertion. It learns to sound sure.

So when you ask a model to rate its own confidence, you are asking it to do something its training did not prepare it for, using the same machinery that produced the answer. **The confidence score is generated the same way the answer was.** If the answer is wrong, there is no reason the confidence score should be right — and a wrong answer that comes with "I'm 90% confident" is worse than a wrong answer without it, because now you have been given a reason to trust it.

**What this rules out:** "the model will tell you if it doesn't know" as a mitigation. It will not, reliably. Sometimes it will, which is what makes the belief survive.

**What this leaves:** external verification. Tests, retrieval against a source, a second check by a different method, or a human who knows the domain. Every real mitigation in this phase is external, because the internal ones are not available.

### Part 4 — Sycophancy, and why it is worse for a beginner

Preference training uses human judgements about which response is better. That process has a systematic bias: **people tend to prefer responses that agree with them.** A response that says "you're right" is more agreeable than one that says "actually, you're mistaken," and if raters are not extremely careful, agreement gets reinforced.

The result is a system that **tends to agree with the premise of your question**, including when the premise is wrong. Ask "why does my function return a string when it should return an integer?" and a model may produce a confident explanation of a bug that does not exist rather than saying "it does not — here is what your code actually does."

**Why this matters more for you than for an expert.** An expert asking a question already has a view, and disagreement is information they can weigh. A beginner asking a question has **no way to distinguish agreement from correctness** — the model agreeing that your approach is sound feels identical to the model confirming that your approach is sound, and one of those is the system being polite.

Which produces the failure that matters most in this whole curriculum:

**A beginner's wrong idea can be validated in detail.** You propose something confused, the model explains it back to you with improvements, and you have now received expert-sounding confirmation of a misconception. The fluent elaboration is *worse* than silence, because it hardened a wrong belief and gave it supporting structure.

The countermeasure is a habit, not a technique: **ask the model to argue against you.** Not "is this right?" — the framing invites agreement — but "what is wrong with this approach, and what would break first?" A model that has been asked to find problems finds them, which tells you the capability was always there and the original framing was suppressing it.

### Part 5 — Distributional shift: why testing passes and production does not

A model performs well on inputs **like the ones it was trained on**, and your test cases are usually drawn from the same easy region as your training intuition. Production is not.

Consider a classifier for support tickets. You test it on a hundred tickets you wrote yourself: accurate. You ship it, and accuracy drops. Nothing about the model changed. What changed is that real tickets contain typos, three languages in one sentence, screenshots described in passing, a customer who pastes an entire log, and a subject line that is a reply chain header.

This is **distributional shift** — the input distribution at deployment differs from the one you evaluated on. Three forms worth naming:

**Covariate shift.** Inputs are different in surface form; the relationship to the answer is unchanged. Dialect, format, length, jargon.

**Label shift.** The balance of outcomes changes. Your test set is 50% spam; production is 2% spam. Accuracy looks fine and the thing you care about is broken, because accuracy is dominated by the majority class.

**Concept drift.** The relationship itself changes. A policy document your retrieval system built on gets rewritten; the model now correctly answers yesterday's question.

**The reason this belongs in a safety phase rather than an engineering one:** it is the most common way a system that passed every check causes real harm. Nobody lied, nothing was hacked, the tests were honest — and the system is wrong for a population it was never evaluated on. If you never look at what your inputs actually are in production, you will not find out.

### Part 6 — Representational harm, and what is actually measurable

A model learns the statistical patterns of its training data, **including the patterns of who is described doing what.** If a corpus associates certain names with certain professions, the model reproduces that association. This is not the model having beliefs; it is the model being a faithful summary of its inputs, which is the problem.

Where it enters matters, because it tells you what you can control:

**In the data** — what was collected, and what was never collected. Underrepresentation is a data problem, and it is the hardest to fix, because you typically cannot retrain.

**In the objective** — what the system was rewarded for. If "helpful" was judged by raters from one demographic, that shaped the outcome.

**In the deployment context** — what you ask it to do. A model asked to screen résumés is doing something a model asked to write poetry is not.

**What is measurable and what is not.** You can measure outcome disparities across groups you can define: does the system produce different results for equivalent inputs with names from different origins. You **cannot** reliably measure this by asking the model whether it is biased — same problem as calibration, and it will produce a reassuring answer. And some harm is not captured by any metric you can compute, because it is about how a system makes people feel about their own participation. **State the limits of your measurement rather than implying you have covered the space.**

### Part 7 — Compounding, and why chains are fragile

A per-step success rate is not a system success rate. Five steps that each work 95% of the time succeed end-to-end about **77%** of the time. Ten steps gives you about **60%**.

The arithmetic is unforgiving and it surprises people, because each individual step was tested and each one passed. **Reliability is multiplicative, and you are the one who has to notice that you built a chain.**

What follows for anything you build:

**Fewer steps is a safety property.** If you can get the same result in two steps instead of five, that is not only cheaper — it is substantially more reliable, and the improvement is larger than most optimisations you could make to any individual step.

**Measure end-to-end, not per-step.** A pipeline where every component passes its own test and the whole thing fails half the time is not a mystery; it is arithmetic.

**Put a check where failure is cheap.** If step 4 is going to fail sometimes, detect it at step 4 rather than discovering it after step 7 has acted on the wrong input.

### Part 8 — Building your own taxonomy, and what a real guard looks like

The generic list is not the point. **Your project has a specific list**, and writing it down is the deliverable of this phase.

For each failure mode, answer four things:

**What triggers it.** Not "when the model is wrong" — the actual condition. "When the user pastes a document in a format we do not parse." "When the retrieved context does not contain the answer." "When the question contains a false premise."

**How it presents.** What you would see. An answer that is confident and specific. A response that ignores part of the question. A refusal.

**How you would detect it.** And here is the constraint that tests your thinking: **the detection cannot be the model checking itself.** If the only thing standing between you and this failure is the model noticing it made the mistake, you have no detection.

**What the mitigation costs.** Every real mitigation costs something — latency, money, complexity, or the user's patience. A mitigation with no cost is probably not doing anything.

That last point deserves the final word, because it is the trap this phase exists to prevent:

**A guard that does not change your behaviour is decoration.** Adding "do not hallucinate" to a prompt, or "only answer if you are certain," is not a mitigation — it is an instruction to the same system, using the same mechanism, that already produced the failure. It *feels* like a safeguard, which is exactly why it survives review.

**The test:** would this mitigation still work if the model were actively trying to produce the wrong answer? If the answer is no, you have written a request rather than a control. Real mitigations — a test that fails, a retrieval step that provides the fact, a human approval before the irreversible action — keep working regardless of what the model "wants."

## Hands-on practice tasks

1. Find three times a model was confidently wrong with you, from your actual history rather than from reading. For each, write the mechanism — which failure mode, and what in the setup triggered it. <!-- id: sc-01-how-models-go-wrong-t01 band: quick energy: normal -->
2. Ask a model a question containing a false premise, for example why a well-known library function that does not exist behaves the way it does. Record whether it corrects the premise or explains the fiction. <!-- id: sc-01-how-models-go-wrong-t02 band: quick energy: low -->
3. Ask a model to rate its confidence on ten questions where you know the answers, mixing ones it should know with ones it should not. Plot whether its confidence tracks its accuracy. Report the result honestly, including if it does. <!-- id: sc-01-how-models-go-wrong-t03 band: focused energy: high -->
4. Take a claim you believe about your own project and ask a model to argue the opposite position as strongly as it can. Note what it finds. This is the countermeasure from Part 4; you are testing whether the capability was there all along. <!-- id: sc-01-how-models-go-wrong-t04 band: focused energy: normal -->
5. For your project, list every step between a user's input and an output. Count them. Compute the end-to-end reliability at a plausible per-step rate, and state which step you would remove if you could remove one. <!-- id: sc-01-how-models-go-wrong-t05 band: focused energy:high -->
6. Write the four-part entry — trigger, presentation, detection, mitigation cost — for your three most likely failure modes. This is the core deliverable of the phase. <!-- id: sc-01-how-models-go-wrong-t06 band: deep energy: high -->
7. Audit any prompt-level safeguards you have written, such as "do not make things up" or "be accurate." For each, apply the test from Part 8: would it hold if the model were trying to fail? Delete or replace the ones that would not. <!-- id: sc-01-how-models-go-wrong-t07 band: focused energy: normal -->
8. Find a case where your system's inputs in real use differ from the inputs you tested with. If you have no production users, look at what a realistic user would paste in rather than what you would. <!-- id: sc-01-how-models-go-wrong-t08 band: focused energy: high -->
9. Write a single external check — a test, a retrieval step, a comparison against a known source — for the failure mode you ranked highest. Run it. Confirm it fails when you deliberately introduce the failure. <!-- id: sc-01-how-models-go-wrong-t09 band: deep energy: high -->
10. Take a task where you cannot measure bias with a metric, and write two sentences about what you cannot see and why. Explicitly stating a limit of measurement is the skill here. <!-- id: sc-01-how-models-go-wrong-t10 band: focused energy: normal -->
11. Read the vendor documentation for a model you use, specifically its stated limitations. Compare its list to yours. Record anything it names that you had not considered. <!-- id: sc-01-how-models-go-wrong-t11 band: quick energy: low -->
12. Rewrite one of your failure entries so that it names the **mechanism** rather than the symptom. "The model hallucinates citations" is a symptom; the mechanism explains why this input causes that output. <!-- id: sc-01-how-models-go-wrong-t12 band: focused energy: high -->
13. Deliberately break your own project with a malformed or hostile input, and write down whether you would have found it without trying. Then add the input to a test so you never have to find it twice. <!-- id: sc-01-how-models-go-wrong-t13 band: deep energy: high -->

## Common Pitfalls

**Treating "hallucination" as a bug that will be patched.** It is not a malfunction; it is the base operation producing text without a truth check. Waiting for a fix means not mitigating. Mitigate now.

**Trusting confidence.** Both the model's stated confidence and your own impression of its confidence are unreliable, and they are unreliable in the same direction — fluency reads as certainty to humans, which is why the failure gets past you.

**Using a prompt instruction as a safety control.** "Do not hallucinate" does not reduce hallucination. It changes nothing except your own sense that you handled it. This is the most common mistake in the phase and the hardest to see in your own work.

**Assuming sycophancy affects other people.** You are the one asking the questions, so you are the one whose premises get validated. The failure is invisible from inside it, because it presents as the model agreeing with you, and agreement feels like confirmation.

**Testing only on inputs you wrote.** You wrote them from your understanding of the problem, which is exactly the understanding that has a gap in it. Production contains inputs you did not imagine.

**Measuring per-step and reporting per-step.** The number your user experiences is the end-to-end one. Report that.

**Believing you have covered bias because you ran a metric.** Some of it is measurable and some is not. Confusing the two produces false confidence, which is worse than acknowledged ignorance.

**Skipping the mechanism and writing symptoms.** "It gave a wrong answer" is not a taxonomy entry. Without the mechanism you cannot predict the next failure, and prediction is the whole point.

## Deliverable / proof of work

A file at `portfolio/safety-career/01-how-models-go-wrong.md` containing:

1. **Your failure taxonomy** — at least six entries, each with trigger, presentation, detection, and mitigation cost. Four of them must come from your own observed failures rather than from this lesson.
2. **One implemented external check.** Not described — written, and demonstrated to fail when the failure is deliberately introduced. Paste the output showing both the passing and the failing case.
3. **The compounding calculation** for your project: the step count, the per-step assumption, the resulting end-to-end figure, and what you changed as a result.
4. **One honest paragraph** on a harm you cannot measure in your project, and what you would need to be able to see it.
5. **A short note on what you deleted.** Any prompt-level safeguard you had written that failed the Part 8 test, and what replaced it.

Point 2 is the one that cannot be faked. A taxonomy is writing; a check that demonstrably fails on a real failure is engineering.

## Checklist

- [ ] I can explain why fluency is not evidence of correctness <!-- id: sc-01-how-models-go-wrong-c01 energy: low -->
- [ ] I can describe what the model is doing when it produces a fabricated citation <!-- id: sc-01-how-models-go-wrong-c02 energy: normal -->
- [ ] I can explain why asking a model to rate its own confidence does not help <!-- id: sc-01-how-models-go-wrong-c03 energy: normal -->
- [ ] I can explain sycophancy as a consequence of preference training rather than a defect <!-- id: sc-01-how-models-go-wrong-c04 energy: normal -->
- [ ] I have actually tested whether a model corrects a false premise in my question <!-- id: sc-01-how-models-go-wrong-c05 energy: low -->
- [ ] I can name the three forms of distributional shift and give an example of each from my own project <!-- id: sc-01-how-models-go-wrong-c06 energy: normal -->
- [ ] I can state which of my project's inputs differ between testing and real use <!-- id: sc-01-how-models-go-wrong-c07 energy: normal -->
- [ ] I can compute the end-to-end reliability of a multi-step pipeline I built <!-- id: sc-01-how-models-go-wrong-c08 energy: high -->
- [ ] I have written a failure taxonomy with mechanisms rather than symptoms <!-- id: sc-01-how-models-go-wrong-c09 energy: high -->
- [ ] I have implemented at least one external check and seen it fail on a deliberate failure <!-- id: sc-01-how-models-go-wrong-c10 energy: high -->
- [ ] I have audited my prompt-level safeguards and removed any that would not survive an adversarial model <!-- id: sc-01-how-models-go-wrong-c11 energy: normal -->
- [ ] I can state one harm in my project that I cannot measure, and why <!-- id: sc-01-how-models-go-wrong-c12 energy: normal -->
- [ ] I can explain to someone else why "the model will tell you if it does not know" is not a mitigation <!-- id: sc-01-how-models-go-wrong-c13 energy: low -->

## Quiz

### Q1. A model gives you a citation with an author, a journal and a year. None of it exists. What is the most accurate description of what happened? <!-- id: sc-01-how-models-go-wrong-q01 energy: high -->

- [ ] The model retrieved a real paper and corrupted the metadata
- [x] The model generated a plausible continuation, using the same process it uses for correct answers
- [ ] The model had the information but its output filter failed
- [ ] The model was trained on a paper that has since been retracted

**Why:** There is no retrieval step and no separate failure mode. The model produces likely text, and a correct citation and a fabricated one are produced by an identical process — which is exactly why the fabrication is undetectable from the output. Believing there is a retrieval step that "went wrong" leads you to wait for a fix rather than checking citations yourself.

### Q2. You ask a model whether its previous answer was accurate, and it says it was. Why is this weak evidence? <!-- id: sc-01-how-models-go-wrong-q02 energy: high -->

- [ ] The model refuses to evaluate its own output
- [ ] The check uses a smaller model with less capability
- [x] The confidence judgement is generated by the same process that produced the answer, and post-training rewarded confident replies
- [ ] The model cannot see its previous answer in the conversation

**Why:** Self-assessment is not a separate verification channel. It runs on the same machinery, shaped by training that rewarded answering rather than hedging. A wrong answer and a reassuring confidence score can be generated together with no contradiction. Verification has to come from something that is not the model.

### Q3. You tell the model in your system prompt: "Only provide information you are certain about." What have you actually built? <!-- id: sc-01-how-models-go-wrong-q03 energy: normal -->

- [x] An instruction to the same system that already produced the failure, which changes your confidence rather than its behaviour
- [ ] A reliable safeguard, because the instruction is explicit and unambiguous
- [ ] A partial safeguard that reduces hallucination substantially
- [ ] A bias toward refusing questions the model cannot answer

**Why:** The instruction goes to the same model, through the same mechanism, and depends on the model's ability to identify its own uncertainty — the exact capability that is unreliable. Its main measurable effect is on you: it makes the system feel guarded. Apply the test from Part 8 — would this hold if the model were trying to fail? It would not, so it is a request rather than a control.

### Q4. Five steps each succeed 95% of the time. Roughly what is the end-to-end success rate? <!-- id: sc-01-how-models-go-wrong-q04 energy: high -->

- [ ] About 95%, since each step is reliable
- [ ] About 90%, since errors partly cancel
- [ ] It cannot be estimated without knowing the failure types
- [x] About 77%, because reliability multiplies

**Why:** 0.95 to the fifth power is about 0.774. The arithmetic is why step count is itself a safety property, why removing a step often beats optimising one, and why a pipeline where every component passes its own test can still fail a quarter of the time.

### Q5. A model agrees enthusiastically that your architectural approach is sound, and adds detail you had not thought of. What should you conclude? <!-- id: sc-01-how-models-go-wrong-q05 energy: normal -->

- [ ] The approach is likely correct, and the added detail suggests deep understanding
- [x] Very little — preference training rewards agreement, and elaboration is generated the same way
- [ ] The approach is correct but the detail should be checked separately
- [ ] The model has evaluated the approach against similar systems it was trained on

**Why:** Agreement plus fluent elaboration is the signature of sycophancy, not of validation. The extra detail is generated text, not derived analysis. Because a beginner cannot distinguish agreement from correctness, this is the failure most likely to harden a misconception — which is why the countermeasure is asking the model to argue against you.

### Q6. You tested your ticket classifier on a hundred tickets you wrote and it was accurate. In production it is not. What is the most likely explanation? <!-- id: sc-01-how-models-go-wrong-q06 energy: high -->

- [ ] The model degraded over time and needs retraining
- [ ] The production server is misconfigured
- [ ] A bug was introduced between testing and deployment
- [x] Real inputs differ from the ones you evaluated on

**Why:** This is distributional shift in its most common form. You generated test inputs from your own understanding, so they share your blind spots, while real tickets contain formats and registers you did not imagine. Nothing changed in the model, which is why the failure is invisible unless you look at what production inputs actually contain.

## You're ready to move on when...

- You can explain, without notes, **why a hallucination is undetectable from its own text**, and why that makes external checking the only real mitigation.
- You have a **failure taxonomy for your own project** in which entries name mechanisms, not symptoms.
- You have **implemented at least one external check** and watched it fail when you deliberately introduced the failure.
- You can apply the adversarial test — *would this hold if the model were trying to fail?* — to a safeguard you wrote, and you have deleted at least one that failed it.
- You can compute end-to-end reliability for a pipeline and explain why step count is a safety property.
- You can state one thing about your project that you **cannot measure**, and you are comfortable saying so rather than implying coverage.

If your taxonomy is generic — hallucination, bias, prompt injection, copied from this lesson — you have read the phase but not done it. **The value is in the specifics of your system**, and the specifics are what you will use later.

## Free vs Paid

**This phase costs nothing and is not improved by spending.** Every failure mode here is reproducible on a free tier, and free models fail more visibly, which makes them better for practice.

**What free gives you:** any chat model for the experiments, your own project, and a text file. The confidence-calibration test in task 3 works better on a model you have not used much.

**Where paid would change something, and it is not here:** stronger models hallucinate less often on well-covered topics. That is a **reduction in frequency, not a change in kind** — the mechanism is identical, so the mitigation you build here is required either way. Do not read "the better model is more accurate" as "this phase is optional for people who pay."

**Nothing in this phase requires a GPU, an API key, or a subscription.** If you are considering spending money to do this phase better, the honest answer is that you would be buying a smaller number of failures rather than a different understanding of them.
