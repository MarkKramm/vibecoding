---
id: found-07-reading-model-outputs
track: foundations
phase: 7
order: 70
title: Reading Model Outputs Critically
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal]
deliverable: portfolio/foundations/07-reading-model-outputs.md
exit_criteria: >
  You can look at any model output and say, before checking it, how much trust
  it deserves and why, by naming the task type, the structural tells, and the
  concrete check that would settle the question.
---

# Phase 7 — Reading Model Outputs Critically

## Goal of this phase

Turn everything you have learned about the mechanism into judgement. By the end of this phase you will be able to look at an answer and decide, in about ten seconds, how much of it you can act on without checking, what specifically needs checking, and what a realistic check even looks like. That is the skill; everything else here supports it.

This is the practical phase. Phases 1 through 6 explained how the machine works; this phase is about the moment where you are holding its output and have to decide what to do with it.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Roughly half of that is reading. The other half is deliberately manufacturing failures in your own domain and building the triage habit until it is automatic rather than effortful.

## Skills you'll gain

- Sort any task into one of four types — recall, reasoning, generation, transformation — and predict reliability before you see the answer
- Explain why transformation tasks are structurally safer than recall tasks, in terms of what constrains the output
- Recognise the structural tells of a probable hallucination, without needing to know the subject matter
- Explain why self-checking has limited value and identify the three things that do work instead
- Separate fluency, coherence and correctness as three independent axes and locate any output on all three
- Apply a fixed triage procedure to any output and reach a defensible trust decision
- Describe a realistic external check for a given claim, including its cost

## Specific topics to learn

### Calibrating trust by task type

- The four task types and what constrains the answer in each
- Why transformation is structurally different from the other three
- Where the task types blur, and how to tell when they have
- The two features that predict reliability more strongly than task type

### Hallucination tells

- Why structure is a tell even when you cannot judge content
- Suspicious specificity, and why numbers, dates, names and URLs are high risk
- Citations that are too clean, and what real references look like
- Confidence on niche topics as a signal, and confidence in general as a non-signal
- Agreeing with your own framing as a failure mode rather than a courtesy
- Tells that are weak or misleading, and the danger of over-reading them

### Self-checking

- Why asking the model to review its own answer is weak evidence
- What re-derivation by a different path actually buys you
- Unit checks and dimensional analysis as cheap external checks
- Boundary cases and known-answer tests
- The difference between a check and a second opinion

### The three axes

- Fluency, coherence and correctness defined separately
- The four combinations and what each one feels like in practice
- Why coherence is the axis that fools experts most reliably
- How each axis is best checked, and how much each check costs

### Triage

- A fixed procedure you can run on any output in under a minute
- Deciding what the output is going to be used for, and why that comes first
- Classifying claims by cost-of-being-wrong
- Choosing a proportionate response; over-checking is also a failure

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Any chat assistant you already have | Generate the outputs you will grade | Free tier | https://chatgpt.com/ | Ask it for citations on a niche topic, then open every URL | Any free chat model — the tells are the same everywhere |
| A second, different assistant | Compare where two systems fail, and check one against the other | Free tier | https://claude.ai/ | Give both the same transformation task and the same recall task | Google AI Studio, or a local model via Ollama |
| Google AI Studio | Free access to several models with adjustable settings, and a free API tier | Free tier | https://aistudio.google.com/ | Run the same prompt across two models and compare failure modes | Any provider's free API tier, or a local model |
| Ollama | Run a small model locally so you can test without limits or cost | Free, open source | https://ollama.com/ | Manufacture failures as many times as you want, offline | llama.cpp, or any free hosted playground |
| A spreadsheet or plain text file | Build your trust ledger and tally your predictions against outcomes | Free | https://www.libreoffice.org/ | Track each prediction and whether it held | Paper, or any notes app |
| Crossref metadata search | Confirm whether a cited paper actually exists, by its own metadata | Free | https://search.crossref.org/ | Paste a model-supplied paper title and see whether it resolves | Google Scholar, or the publisher's own site |
| A calculator or a real spreadsheet | Re-derive the model's arithmetic by a different path | Free | https://www.libreoffice.org/ | Recompute one quantitative claim independently | Any phone calculator |

## Free/cheap resources

- **OpenAI — Safety best practices** — https://developers.openai.com/api/docs/guides/safety-best-practices
- **OpenAI — Evals: getting started** — https://developers.openai.com/api/docs/guides/evals
- **Google — People + AI Guidebook** — https://pair.withgoogle.com/guidebook/
- **Microsoft — Introduction to prompt engineering** — https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering
- **Anthropic — Reduce hallucinations** — https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations
- **NIST AI Risk Management Framework** — https://www.nist.gov/itl/ai-risk-management-framework
- **Anthropic — Claude model documentation (context windows, cutoffs)** — https://platform.claude.com/docs/en/about-claude/models/overview

## Lesson: How Much of This Should You Believe

### Part 1 — Trust is a property of the task, not of the answer

Here is the mistake almost everyone makes. They read an answer, it looks good, and they conclude that the model is reliable. Then a month later it hands them a fabricated statistic and they conclude that the model is unreliable. Both conclusions are wrong in the same way: they are judgements about the *model*, drawn from a single *task*.

The more useful move is to stop asking "is this model good?" and start asking "what kind of task was that?" Because the amount of trust an output deserves is mostly fixed before the model produces a single token.

**Recall tasks.** The answer exists outside the conversation and must come from the model's parameters. *What is the melting point of gallium? Who wrote the Noli Me Tangere? What is the default port for Postgres?* Nothing in your message contains the answer. The only source is what training compressed into the weights.

**Reasoning tasks.** The answer is derived from material present in the conversation, by steps. *Given this budget table, which option costs least over three years? If the server handles 40 requests a second and traffic triples, what do we need?* The inputs are in the context; the work is the derivation.

**Generation tasks.** Text is produced to fit an intent, where many outputs satisfy it equally well. *Write a subject line for this email. Suggest five names for a small bakery.* There is no single right answer to be right or wrong about.

**Transformation tasks.** Existing text is converted from one form to another while preserving its content. *Translate this paragraph into Filipino. Rewrite this at a grade-six reading level. Convert this JSON to CSV. Summarise this contract clause.*

> Think of it as the difference between a student answering from memory in a closed-book exam and a student working from a page of notes you handed them. Same student, same ability, very different error rate — because in the second case the material is in front of them.
>
> Where the analogy breaks: a human student who does not remember will often say so, and knows the difference between remembering and guessing. The model has no such signal, so it produces an answer from memory with exactly the same tone it uses when working from your notes. The mechanism tells you the *rate* of failure; it gives you no warning at the moment of failure.

Here is the ranking, from safest to riskiest:

| Task type | What constrains the output | Typical failure mode | Rough trust posture |
|---|---|---|---|
| **Transformation** | The source text is present; the model is re-encoding it | Dropping a clause, flattening nuance, changing a number while copying | Read it against the source. Cheap, and you already have the source |
| **Generation** | Your constraints and the intent | Bland, generic, wrong tone, invents a detail to fill the shape | Not right or wrong, just good or bad. Judge it as writing |
| **Reasoning** | The material you supplied plus the steps | Skips a step, misreads a premise, arithmetic slips | Check the steps and the inputs; the logic is visible |
| **Recall** | Nothing in the conversation | Confident fabrication | Assume unverified until an external source confirms it |

Look at the transformation row again, because that is the important one.

**In a transformation task, the answer is already in the conversation.** The model is not retrieving anything. Its job is to re-encode text sitting in its context window, and Phase 3 established that text in the context is passed to the model directly rather than compressed into parameters. So the failure mode changes character entirely. It stops being *invention* and becomes *loss* — a clause dropped, a number transcribed wrong, a tone flattened.

That is a much better class of failure. A dropped clause is visible when you diff the output against the input, and you can do that because you have the input. A hallucinated fact is invisible because you do not have the fact.

The practical consequence, and it is the single most valuable thing in this phase: **if you can restructure a task so that the source material is in the conversation, you have moved it from the risky category to the safer one.** "What are the rules for small business permits in my city?" is a recall task. "Here is the official page — list the requirements from this text" is a transformation task. Same goal, radically different failure profile, and you did it by pasting.

> This is, in one sentence, why Track 4 (Retrieval) exists as an entire track. Retrieval is a systematic way of converting recall tasks into transformation tasks by putting the right text in front of the model automatically. Everything in this phase is the manual, no-budget version of that idea.

### Part 2 — Two features that predict reliability better than task type

Task type is the first filter. Two other features cut across it and are, in practice, stronger predictors.

**Feature one: is the output asking for text, or asserting truth?** Some outputs make no claim about the world. "Rewrite this more simply" produces a sentence that is better or worse, not true or false. "Convert this to CSV" produces a file that parses or does not. None of these can be *wrong about the world*, because they are not about the world — they are about text you provided.

Other outputs assert something. "The regulation took effect in 2019." "The library's default is 8 megabytes." Now there is a fact-claim, and a fact-claim can be false.

**A task that makes no external factual claim is not a hallucination risk, no matter how it is phrased.** A task that makes even one inherits the whole risk, however small the claim looks. This is why a long, careful, well-grounded transformation can still contain a planted error: the model adds a clarifying aside — "this is the same rule that applied before 2019" — and that aside is a recall task smuggled into a transformation.

Train yourself to scan output for sentences that introduce information not present in your input. Those are the ones to check. The rest is transformation and can be read rather than verified.

**Feature two: the specificity of the claim.** Vague claims are hard to be wrong about and hard to act on; specific claims are easy to act on and easy to be wrong about. Precision is where the risk concentrates.

| Claim | Risk | Why |
|---|---|---|
| "Small businesses generally need a permit" | Low risk, low value | Too vague to be false in an interesting way |
| "The permit fee is 500 pesos" | High risk | A specific number, actionable, and no source in context |
| "The fee is around 500 pesos, but check with your LGU" | Medium risk, hedged | The number is still likely fabricated, but the hedge tells you to check |

That third row is the interesting one. A hedge is not proof of uncertainty — it is a *text pattern* associated with uncertainty in the training data, which the model can produce whether or not it is actually uncertain. But a hedge does reliably signal "the model had a flatter distribution here", which correlates with the answer being less well-grounded. A hedge is a weak tell that costs you nothing to act on.

### Part 3 — The structural tells of a probable hallucination

You cannot always check the content. Often you do not know the subject well enough to judge whether the answer is right — that is exactly the situation where you were hoping the model would help. This is the trap: the outputs you most need to check are the ones you are least equipped to check.

What you *can* always do is read the structure. Hallucination leaves fingerprints in the shape of the answer, and those fingerprints are visible even when the content is opaque to you.

**Tell 1 — Suspicious specificity.** Real knowledge usually comes with the texture of its source: who reported it, when, under what conditions. Fabricated knowledge often arrives as a bare precise number. That precision feels like authority and is actually a warning. A confident specific with no chain of reasoning, no source and no hedging is the single most common shape of a plausible fabrication.

**Tell 2 — Citations that are too clean.** Real references are messy. They are formatted inconsistently across venues, they have awkward author lists, they sometimes have DOIs and sometimes only a journal and page range. A set of references that are perfectly parallel in structure, uniformly formatted, and suspiciously on-topic is the signature of generated text. Note that you must *open them*. A perfectly formatted citation can also be real; the format alone does not settle it.

**Tell 3 — Confident answers about niche topics.** Confidence should scale with how well-represented a topic was in training. A model is far more likely to be accurate about the capital of France, which appears millions of times in its data, than about a specific municipal ordinance or a paper published last month. When confidence and obscurity appear together, the confidence is not evidence — it is the default tone. Phase 1 established that a plausible-sounding answer fills the slot more reliably than an admission of ignorance, and that pressure is strongest exactly where the training signal is thinnest.

**Tell 4 — Agreement with your framing.** This one is subtle and the most dangerous, because it feels like cooperation. If you ask "why did the algorithm fail to converge in this case?", you have presupposed that it failed. The model will usually build you an explanation of the failure rather than questioning whether it happened. Answers that fit your question's assumptions *exactly*, including the ones you did not verify, should raise suspicion about your premise rather than confidence in the answer.

**Tell 5 — Completeness without hesitation.** A long, exhaustive, evenly-detailed answer to a broad question is worth less than a shorter one that stops where the model's knowledge stops. Real knowledge is lumpy. If everything has the same confident density — the well-known parts and the obscure parts alike — you are reading generated text filling a template rather than recall.

**Tells that are weak, and two that mislead.**

Hedging is weak. Fluency is not a tell at all: models are fluent when wrong. Length is not a tell. Formatting — bullet points, headers, tables — is not a tell; those come from the system prompt and the training data, not from the truth of the content.

Two tells actively mislead. First, **a source-like attribution** ("according to the WHO") is not evidence of a source; generating that phrase is exactly as easy as generating any other three tokens, and the citation can be attached to a fabricated number. Second, **being right about something adjacent** is not evidence of being right about the thing you asked. If the model correctly names the agency involved and then invents the regulation number, the correct part does not vouch for the rest. Each specific claim is separately true or false.

> A useful mental image: treat the answer as a page of claims with no footnotes, rather than as a document with a bibliography. Your job is not to grade the page. It is to decide which lines you would be willing to bet on, and which ones you would need to see a footnote for.
>
> The image breaks down here: a footnote-less page by a human author still encodes a person's actual knowledge and their awareness of its limits. The model's page encodes neither. You are not looking for the author's uncertainty; there is none to find.

Tell 4 deserves one more note because it is the one people resist. Sycophancy is not politeness that got out of hand; it follows from the objective in the same way hallucination does. In the training data, the text following a question that already implies an answer is overwhelmingly text that accepts the implication and continues. Predicting that continuation is what the model is for. The correction is procedural, not verbal: ask the neutral version of the question, or ask directly whether the premise holds, and see whether the answer changes shape.

### Part 4 — Why the model can't check its own work

The most natural instinct in the world is to follow a suspicious answer with "are you sure?" It feels like a review step. It is not one, and understanding why is the difference between a real verification habit and the feeling of one.

When you ask a model to check its answer, here is what happens: the previous answer is now part of its context, and the model generates a continuation of text that looks like a review. That continuation is produced by the same mechanism, from the same parameters, with the same training data, and — critically — with the original answer now sitting in the context as strongly-weighted material. Phase 4 explained why context matters so much: the text that is present shapes the prediction, and a model that just wrote something confidently is being asked to predict what follows it.

So the second pass is not independent. It shares the first pass's parameters, its training data, and now its conclusion. If the first answer came from a fabricated region of the model's knowledge, the second pass is drawing from the same region, anchored by the first answer. You have not added a second opinion. You have added a second rendering of the first opinion.

Three specific reasons self-checking underperforms what it feels like it should:

1. **The error and the check share a cause.** If the model does not have the fact, it does not have it on the second pass either. Re-derivation only helps when the first pass was a *procedural* slip — a dropped sign, a skipped step — rather than a knowledge gap.
2. **Anchoring.** The first answer is in the context. Agreement with it is the textually typical continuation of "here is my answer; check it."
3. **Visible chains are not always causal chains.** A model can produce a correction that reads as a genuine catch without the correction having been driven by the error. You cannot tell the difference by reading it.

Now, what does help. Three things.

**Verification against an external source.** Some artifact outside the conversation either agrees with the claim or does not. For a citation, that is the paper existing in a bibliographic database. For a legal requirement, that is the agency's published page. This is the only check that adds genuinely new information, because it draws on something the model did not produce. It is also the most expensive, which is why Parts 1 and 3 exist — they tell you which claims earn the expense.

**Re-derivation by a different path.** Not "check your arithmetic" but "compute it a different way." If the first route multiplied by a monthly rate, ask for the annual figure and divide. The point is that a different path has different *step-level* failure opportunities, so a procedural slip in the first route does not appear in the second. This genuinely helps on reasoning tasks and does essentially nothing on recall tasks, because recall has no path.

**Unit checks and boundary cases.** Cheap, mechanical, and independent of the model's opinions. Do the units cancel? Is the magnitude sensible — is a monthly bandwidth figure really a thousand times the daily figure? Does the answer hold at zero, at one, at a negative? A sanity check on magnitude catches a large fraction of arithmetic errors at almost no cost, and — this is the point — it is an *external* check even though you are doing it on the model's numbers.

**A second opinion from a different model is a weak version of the first of these.** Weaker than checking a source, because two models can share a training-data misconception and converge on the same wrong answer. But strictly better than asking the same model twice, because it does not share parameters or context. If two independent systems agree, your confidence should rise a little. If they disagree, you have learned something valuable at very low cost: at least one is wrong, and the claim is not safe to act on.Here is the honest summary, and it is the sentence to carry out of this part:

> Self-checking converts your question from "is this right?" into "is this internally consistent?" Those are different questions with different answers, and only the second one is cheap.

### Part 5 — Fluency, coherence, correctness: three axes, not one

People talk about output quality as a single scale, running from bad to good. It is at least three scales, and they move independently. Learning to score them separately is what stops you from being fooled.

**Fluency** is whether the text reads as well-formed language. Grammar, word choice, natural rhythm. Models are uniformly excellent at this, which means it carries almost no information. A fluent answer tells you the model is working, not that the answer is true.

**Coherence** is whether the parts fit together — whether the reasoning connects, whether the sections support the conclusion, whether the numbers are consistent with each other. This is subtler than fluency and much more useful, because a coherent-sounding answer can be built entirely from fabricated parts. Coherence is a property of the *relationships* between claims, and those relationships can be generated just as easily as the claims.

**Correctness** is whether the claims match the world. This is the only one of the three that requires something outside the conversation to establish.

The combinations are worth knowing by feel, because each has a distinct signature:

| | Correct | Incorrect |
|---|---|---|
| **Fluent and coherent** | The answer you want. Also the answer that teaches you nothing about how to check | **The dangerous quadrant.** Persuasive, well-organised, internally consistent, and wrong |
| **Fluent but incoherent** | Rare | Noticeable — the parts do not fit, so you catch it. Usually a sign of a confused or overloaded request |

And the combination that catches people with real subject knowledge: **coherent but incorrect with high confidence in a domain you know.** You read it, the structure is sound, the vocabulary is right, the steps are in a sensible order. Everything you would normally use to judge a technical answer is present and correct. The only thing missing is that the content is false, and the only way to find that out is to know the domain well enough to spot it — or to check the specific claims against a source.

"It fooled me" is almost always a statement about coherence, not fluency. Nobody is fooled by a model's grammar; people are fooled by its structure.

**How each axis is best checked, and what it costs:**

| Axis | How you check it | Cost | Reliability of the check |
|---|---|---|---|
| Fluency | Read it | Seconds | High, and nearly worthless as evidence |
| Coherence | Read carefully for internal consistency; check whether the numbers agree with each other and the method matches the result | Minutes | Moderate — catches generated padding and internal contradictions |
| Correctness | Compare a specific claim against a source outside the conversation | Minutes to hours | The only check that actually establishes anything |

Notice the shape of that table. The cheap checks are the ones that tell you least. The expensive check is the one that matters. That is precisely why triage — Part 6 — is the skill and not an afterthought.

### Part 6 — Triage: applying this to an output in under a minute

Everything above is analysis. This is the procedure. Run it on any output you are about to act on.

**Step 0 — What am I going to do with this?**

This comes first and dominates everything else, because trust is not a property of the answer, it is a property of the *use*. The same sentence has completely different verification requirements depending on whether it lands in your personal notes or in a client-facing document you sign.

Three destinations, three postures:

- **Read-only.** You are reading it for orientation and nothing downstream depends on it. **Posture: read it, note the uncertainty, act on nothing.** Do not over-verify orientation reading.
- **Decision input.** You will choose something based on it, but there is a cheap way to back out. **Posture: verify the load-bearing claims only.** The one or two specific claims that actually determine your choice. Not the whole answer.
- **Irreversible or published.** Money, contracts, code that runs on real data, anything with your name on it. **Posture: every factual claim needs an external source, in writing.** And if you cannot verify a claim that matters, the correct move is to remove the claim, not to soften it.

**Step 1 — Classify the task.** Recall, reasoning, generation or transformation? This is where you set the prior, before reading closely. Recall bias: sceptical until sourced. Transformation bias: read it against the source. Generation: judge it as writing. Reasoning: check the inputs and the steps.

**Step 2 — Circle every external factual claim.** Scan for sentences that assert something about the world that you did not supply. Ignore the rest. Skipping this step means verifying everything (too expensive, so you verify nothing) instead of verifying the few lines that matter.

**Step 3 — Sort those claims by reversibility.** Which of them, if wrong, costs you something you cannot get back? Mark those. Usually there are one or two, and usually they are the specific ones — a number, a date, a name.

**Step 4 — Look for structural tells on the marked claims.** Suspicious specificity, too-clean citations, confidence on niche ground, exact agreement with your framing. Tells do not verify anything; they tell you where to spend your check.

**Step 5 — Assign a check to each marked claim, and refuse to leave a claim with no check.**

| Claim looks like | Minimum honest check |
|---|---|
| A citation, DOI, paper title or URL | Open it. Does the thing exist and say what was claimed? |
| A number, date, name or measurement | Find one source outside the conversation. One is enough to promote it from "unverified" to "sourced once" |
| A procedural, legal or medical requirement | The authoritative body's own published material, not a summary of it |
| Arithmetic or a derived quantity | Recompute by a different path; check units and magnitude |
| A code API or library detail | Run it, or read the official documentation |
| A claim about your own provided text | Diff it against the text you supplied |

**Step 6 — Decide, and write the decision down.** One of: *unverified, will check before use*; *unverified, does not matter, using it anyway*; *verified against X on date Y*; or *rejected*. The fourth option is real and should not feel like failure. Rejecting an unverifiable load-bearing claim is often the correct outcome, and it is the behaviour that separates people who use these systems well from people who get burned by them.

Two closing rules for triage.

**The default is unverified, not false.** You are not assuming the model lied. You are recording that nothing outside the conversation has confirmed the claim yet. This matters because the alternative posture — distrusting everything — is as unusable as trusting everything.

**Over-checking is also a failure.** If you verify every sentence of orientation reading, you will stop doing it within a week and be back to verifying nothing. Match the cost of the check to the cost of being wrong. A triage habit you actually sustain beats a rigorous one you abandon.

### Part 7 — Verifying is a skill, not a mood

There is a way this phase can go wrong, and it is worth naming because it is common.

You learn about hallucination, you get burned once, and you swing into permanent low-grade distrust. You start prefacing everything with caveats. You re-check things you already know. You stop using the tool for the tasks it is genuinely excellent at because you cannot fully verify them. That is not caution; it is the loss of a useful instrument.

The correct frame is the one this phase has been building toward. Verification is a **skill** — a set of techniques with different costs and different strengths, which you deploy selectively based on what the output is for. It has three components you can actually practise:

1. **Task classification.** Getting faster and more accurate at recognising which of the four types you are looking at, including the hard case where a transformation has recall smuggled into it.
2. **Tell recognition.** Getting better at spotting the structural signatures, so your attention lands on the two claims that need it instead of being spread evenly across forty.
3. **Check selection.** Building a small personal library of reliable sources and cheap re-derivations for the domains you actually work in — the two or three sites that settle questions in your field, the quick way to re-derive the calculation you do often.

All three improve with practice and all three are trackable. That is what makes verification a skill rather than an attitude, and it is why the portfolio for this phase is a ledger of your predictions rather than an essay about being careful.

Keep the distinction sharp:

> Distrust is a posture. Verification is a procedure. A posture costs you the tool; a procedure costs you minutes on the outputs that deserve them.

There is one more thing worth saying, and it is why this phase sits where it does. Everything from Phases 1 to 6 — that the model is a next-token predictor, that knowledge in parameters is blurred and knowledge in context is exact, that the context window is what the model actually sees, that the model has no internal signal separating recall from construction — is what makes the triage procedure in Part 6 *derivable* rather than arbitrary. You are not memorising a checklist. You are applying a mechanism. When you hit a situation this phase did not cover, you can reason from the mechanism to the answer, and that is the whole point of learning the mechanism first.

Track 8 takes this further: designing workflows where verification is built into the structure, so the check does not depend on your remembering to perform it. That is the mature version of what you are practising by hand this week. You start by hand because a habit you built yourself survives contact with a deadline; a habit you were told about usually does not.

## Hands-on practice tasks

1. Take five outputs you already have from any chat assistant and label each one recall, reasoning, generation or transformation. Record whether your label matched what the task actually required. <!-- id: found-07-reading-model-outputs-t01 band: quick energy: low -->
2. Ask a model for the same factual content two ways: once as a recall question, once with the source text pasted in as a transformation task. Compare the answers and record every difference. <!-- id: found-07-reading-model-outputs-t02 band: focused energy: normal -->
3. Ask for three citations on a niche topic in your own field. Open every URL. Classify each as real, real-but-mismatched, or nonexistent. Do this for three different niche topics. <!-- id: found-07-reading-model-outputs-t03 band: focused energy: normal -->
4. Take one answer you find convincing and ask the model to double-check it. Then check the same claim against an external source yourself. Record which of the two caught something the other missed. <!-- id: found-07-reading-model-outputs-t04 band: focused energy: normal -->
5. Write a leading question that presupposes a false premise, and a neutral version of the same question. Ask both. Record how the answers differ in shape, not just in content. <!-- id: found-07-reading-model-outputs-t05 band: quick energy: normal -->
6. Take a paragraph of real text you did not write and ask for a transformation — translate it, simplify it, or convert its format. Diff the output against the source and mark every piece of information that was dropped, altered or added. <!-- id: found-07-reading-model-outputs-t06 band: focused energy: normal -->
7. Build a trust ledger: over the week, log every model output you act on with columns for task type, what you used it for, whether you checked it, how you checked it, and whether the check changed anything. Aim for at least fifteen rows. <!-- id: found-07-reading-model-outputs-t07 band: ongoing energy: normal -->
8. Ask a model a quantitative question about your own work or household — a budget, a rate, a total — then recompute it independently by a different route and check the units and the magnitude. Record how the two routes differed. <!-- id: found-07-reading-model-outputs-t08 band: focused energy: normal -->
9. Take one answer and score it separately on fluency, coherence and correctness, writing one sentence of justification for each score. Do this for five answers from the same model and look for the pattern. <!-- id: found-07-reading-model-outputs-t09 band: quick energy: low -->
10. Apply the six-step triage procedure from Part 6 to a real output you actually need, and write the resulting decision in one of the four allowed forms. Then do it again for a different output and time yourself. <!-- id: found-07-reading-model-outputs-t10 band: focused energy: high -->
11. Deliberately manufacture a hallucination in a domain where you are the expert: ask a narrow, specific question you know the true answer to and watch what gets produced. Quote it verbatim. <!-- id: found-07-reading-model-outputs-t11 band: quick energy: normal -->
12. Write a short verification kit for your own field: the three or four sources that settle factual questions in it, and the fastest independent re-derivation for the calculation you do most often. <!-- id: found-07-reading-model-outputs-t12 band: deep energy: high -->

## Common Pitfalls

**Trusting the whole answer because part of it checked out.** Verification is per claim, not per answer. A model that correctly names the agency and invents the regulation number has one true claim and one false one, and the true one does not vouch for the false one. Never promote an unchecked claim because a neighbouring claim survived.

**Treating "are you sure?" as a review step.** It generates a second rendering from the same parameters with the first answer anchored in the context. It is useful for catching procedural slips and nearly useless for catching knowledge gaps, which is the failure you were worried about.

**Assuming a hedge means the model knows it is guessing.** A hedge is a text pattern, not a calibrated signal. It correlates loosely with flatter distributions and is worth noticing, but it is not an admission and its absence is not confidence.

**Over-reading the tells.** Every structural tell in Part 3 has counterexamples. Real references are sometimes formatted cleanly; real knowledge sometimes is a bare specific number. Tells tell you where to look. They never settle the question, and treating one as proof produces both false alarms and false comfort.

**Verifying everything.** It is not sustainable, and the predictable result is that you abandon verification entirely within a fortnight. Sort by reversibility and spend your checks where being wrong is expensive.

**Using a second model as a verdict rather than as a signal.** Two models can share a misconception. Agreement raises confidence a little; disagreement is strong evidence that at least one is wrong and the claim is not safe. Neither is a source.

**Concluding "so it is useless."** The reasoning, transformation and generation categories are where most of the practical value lives, and they are exactly the categories where checking is cheap or unnecessary. The correct response to a hallucination-prone recall task is to restructure it, not to stop using the tool.

**Skipping the "what am I going to do with this" step.** Without it you have no criterion for how much checking is enough, so you either check nothing or check everything. The destination of the output determines the posture, and it takes five seconds to establish.

## Deliverable / proof of work

Write `portfolio/foundations/07-reading-model-outputs.md` containing:

- **Your trust ledger** from practice task 7 — at least fifteen rows, with task type, intended use, whether and how you checked, and whether the check changed your decision. This is the core of the deliverable.
- **Three hallucinations you personally produced**, quoted verbatim, each labelled with its task type, the structural tell that was present, and the specific external check that exposed it. At least one must come from a domain where you are the expert.
- **One transformation failure** — a task where you supplied the source text and the output still lost or altered something. Show the diff and explain why supplying the source did not make it perfect.
- **One case where self-checking failed** — an answer you asked the model to verify, that survived the review, and that external checking later contradicted. Explain in two or three sentences why the second pass shared the first pass's cause.
- **Your written triage procedure**, in your own words and no more than a page, adapted to the kinds of work you actually do. It must state your default posture for each of the three destinations in Part 6 Step 0.
- **Your verification kit** from practice task 12 — the sources and re-derivations you will use for your own field.
- **A short section titled "Where I will keep distrust out"** — two or three task types where you have decided the checking cost exceeds the risk, with your reasoning. Naming these explicitly is what prevents verification from hardening into permanent distrust.

## Checklist

- [ ] I can sort a task into recall, reasoning, generation or transformation before seeing the answer <!-- id: found-07-reading-model-outputs-c01 energy: normal -->
- [ ] I can explain why transformation tasks are structurally safer than recall tasks, in terms of what constrains the output <!-- id: found-07-reading-model-outputs-c02 energy: normal -->
- [ ] I can restructure a recall question into a transformation task by supplying the source text <!-- id: found-07-reading-model-outputs-c03 energy: normal -->
- [ ] I can name four structural tells of a probable hallucination without knowing the subject matter <!-- id: found-07-reading-model-outputs-c04 energy: normal -->
- [ ] I can identify the sentences in an output that introduce external factual claims, and ignore the rest <!-- id: found-07-reading-model-outputs-c05 energy: high -->
- [ ] I can explain why asking a model to check its own work is weak evidence <!-- id: found-07-reading-model-outputs-c06 energy: high -->
- [ ] I can name three checks that genuinely add information, and say which task types each one works for <!-- id: found-07-reading-model-outputs-c07 energy: normal -->
- [ ] I can distinguish fluency, coherence and correctness and score an output on all three separately <!-- id: found-07-reading-model-outputs-c08 energy: normal -->
- [ ] I can explain why coherence is the axis that fools people with domain knowledge <!-- id: found-07-reading-model-outputs-c09 energy: high -->
- [ ] I can run the six-step triage procedure on an output in under a minute <!-- id: found-07-reading-model-outputs-c10 energy: high -->
- [ ] I can state my default trust posture for each of the three output destinations <!-- id: found-07-reading-model-outputs-c11 energy: low -->
- [ ] I know my own field's verification kit — the sources and re-derivations I will actually use <!-- id: found-07-reading-model-outputs-c12 energy: normal -->
- [ ] I have decided which task types I deliberately will not verify, and can justify each <!-- id: found-07-reading-model-outputs-c13 energy: normal -->
- [ ] I can explain why telling a model not to hallucinate has limited effect <!-- id: found-07-reading-model-outputs-c14 energy: low -->

## Quiz

### Q1. Which task type is structurally safest, and why? <!-- id: found-07-reading-model-outputs-q01 energy: normal -->

- [ ] Recall, because the model has seen the fact before during training
- [ ] Generation, because there is no correct answer to get wrong
- [x] Transformation, because the source text is in the context and constrains what the output can contain
- [ ] Reasoning, because the steps are visible and can be followed

**Why:** In a transformation the answer is already present in the conversation, so the model is re-encoding text rather than retrieving from parameters. That removes invention as a failure mode and leaves loss — a dropped clause or a mis-transcribed number — which is visible when you diff the output against a source you still have.

### Q2. You ask a model about a specific municipal ordinance in your city and it answers in detail and with confidence. What should this make you think? <!-- id: found-07-reading-model-outputs-q02 energy: normal -->

- [ ] Confidence plus detail indicates the model found the ordinance in its training data
- [ ] The model must have a live connection to local government records
- [ ] The answer is likely accurate because local topics are well represented online
- [x] Confidence is the model's default tone, and a niche topic is where the training signal is thinnest, so the answer needs an external source before you rely on it

**Why:** Phase 1 established that the pressure toward filling the answer slot is strongest where the model knows least, and that a plausible construction and a real recall are indistinguishable from the inside. Niche and local topics are exactly where that pressure produces fluent invention, and confidence carries no calibration.

### Q3. Why does asking a model to double-check its own answer add less than it appears to? <!-- id: found-07-reading-model-outputs-q03 energy: high -->

- [ ] Because the model refuses to review its own output by design
- [ ] Because review costs additional tokens and is therefore less thorough
- [x] Because the second pass uses the same parameters and training data and has the first answer anchored in its context, so a knowledge gap is shared rather than caught
- [ ] Because models cannot read their own previous messages

**Why:** The review is generated by the same mechanism from the same knowledge, with the original answer now present as strongly-weighted context. It can catch a procedural slip, where a different path has different step-level failure opportunities, but it cannot catch a fact the model never had — the second pass does not have it either.

### Q4. Which of these is a genuine external verification of a model's claim? <!-- id: found-07-reading-model-outputs-q04 energy: normal -->

- [ ] Asking the same model the same question in a fresh conversation
- [x] Looking up the claim in the authoritative source and confirming it says what was claimed
- [ ] Asking the model to rate its own confidence from one to ten
- [ ] Asking a second model whether the first model was right

**Why:** Only a check that draws on something the model did not produce adds new information. A fresh conversation shares the parameters and the knowledge gap; a self-rating is generated text like any other; a second model is a weak signal because two models can share a misconception, and it raises confidence rather than establishing anything.

### Q5. An answer reads beautifully, is well organised, cites four papers in consistent APA style, and contains two invented findings. Which axis failed, and which did not? <!-- id: found-07-reading-model-outputs-q05 energy: high -->

- [ ] Fluency failed; coherence and correctness held
- [ ] Fluency and coherence both failed
- [ ] All three failed together
- [x] Fluency and coherence held; correctness failed

**Why:** Fluency is well-formed language and coherence is internal consistency between the parts — both can be generated independently of truth, and a fabricated answer built from consistent-sounding parts passes both. Correctness is the only axis that requires something outside the conversation to establish, which is why a clean, well-structured answer can be entirely wrong.

### Q6. Which of these is a structural tell that raises suspicion, independent of whether you know the subject? <!-- id: found-07-reading-model-outputs-q06 energy: normal -->

- [ ] The answer is longer than you expected
- [ ] The answer uses bullet points and headings
- [ ] The answer was produced faster than you expected
- [x] The answer gives a precise, specific figure with no source, no derivation and no hedge

**Why:** Precision without provenance is where risk concentrates, because a bare specific is actionable and easy to fabricate. Length and formatting come from the system prompt and the training data rather than from the truth of the content, and generation speed tells you nothing about correctness.

### Q7. You ask "why did our deployment fail to converge?" and receive a detailed, plausible explanation. What is the most important thing to check first? <!-- id: found-07-reading-model-outputs-q07 energy: high -->

- [ ] Whether the explanation names the correct optimiser
- [ ] Whether the explanation is consistent with itself
- [ ] Whether a second model gives the same explanation
- [x] Whether the deployment actually failed to converge, because your question presupposed it and the model tends to accept the premise

**Why:** A question that already implies an answer gets text that accepts the implication and continues, because that is the textually typical continuation in the training data. The check therefore belongs on your own framing before it belongs on any of the content the model produced.

### Q8. Which statement about a smooth, well-structured, confidently written model output is correct? <!-- id: found-07-reading-model-outputs-q08 energy: normal -->

- [ ] Its coherence guarantees that a qualified reader would catch any error
- [x] Its fluency is weak evidence of correctness, since models are fluent when wrong too
- [ ] Its confidence level reflects how well represented the topic was in training
- [ ] Its consistent formatting indicates the claims were drawn from real sources

**Why:** Fluency is roughly constant whether the output is right or wrong, so it carries almost no information. Coherence is generateable from fabricated parts and is exactly what fools domain experts. Confidence is the model's default register rather than a calibration signal, and formatting comes from the system prompt, not from the content being sourced.

### Q9. Why is scoring an output on fluency, coherence and correctness separately more useful than giving it one quality rating? <!-- id: found-07-reading-model-outputs-q09 energy: high -->

- [ ] Because those three are the metrics model providers report
- [x] Because the axes move independently, and knowing which one failed tells you what kind of check would fix it
- [ ] Because correctness cannot be assessed without the other two
- [ ] Because fluency and coherence are always high for large models

**Why:** The three properties fail separately and each requires a different remedy. Low fluency is not a real failure mode worth acting on. Low coherence points you at internal inconsistency you can find by reading. Low correctness is the only one that needs an external source, so identifying it tells you whether you need to leave the conversation at all.

### Q10. You must summarise a client contract, and the summary will be attached to a signed document. Which posture is correct? <!-- id: found-07-reading-model-outputs-q10 energy: high -->

- [ ] Read it once for plausibility; the model is generally reliable on text it was given
- [ ] Ask the model to confirm each clause is accurately represented
- [ ] Use it as-is but add a note that it was AI-assisted
- [x] Check every factual and legal claim against the contract itself, and remove any claim you cannot confirm rather than softening it

**Why:** Published and irreversible use is the strictest destination in the triage procedure, and verification is per claim rather than per answer. Self-checking shares the first pass's cause and adds little, and a disclaimer does not reduce the cost of a wrong clause. Removing an unconfirmable claim is the correct failure direction.

### Q11. Over-checking every sentence of orientation reading is a problem because: <!-- id: found-07-reading-model-outputs-q11 energy: normal -->

- [ ] It costs money in tokens
- [x] It is not sustainable, and the predictable result is abandoning verification altogether
- [ ] It makes the model less accurate over time
- [ ] It wastes the provider's compute

**Why:** Triage exists because checks have different costs and different strengths. Spending the expensive check on outputs that carry no consequence exhausts the habit, and a sustainable procedure beats a rigorous one you drop within a fortnight. Match the cost of the check to the cost of being wrong.

### Q12. Which framing of verification does this phase argue for? <!-- id: found-07-reading-model-outputs-q12 energy: low -->

- [ ] A permanent posture of low-grade distrust toward all model output
- [ ] A rule that model output should never be used for anything important
- [x] A skill, composed of task classification, tell recognition and check selection, that improves with deliberate practice
- [ ] A belief that newer and larger models have solved the problem

**Why:** Distrust is a posture and costs you the instrument; verification is a procedure deployed selectively according to what the output is for. Its components are concrete and trackable, which is why the deliverable for this phase is a ledger of predictions against outcomes rather than an essay about being careful.

## You're ready to move on when...

You can be handed any model output, glance at it, and say out loud: this is a transformation task, but there is a recall claim smuggled into paragraph three, that claim carries a precise number with no provenance, it matters because I would act on it, so here is the one source that would settle it — and here is why the model's own review of it would not have helped.

You can do that in under a minute, and you know which outputs you are deliberately not checking and why.

## Free vs Paid

### What's free is enough

Everything in this phase runs on a free chat assistant, a text editor and a willingness to open links. Two or three free assistants give you the cross-model comparison, and several providers offer free API tiers with a handful of models, which is enough to run the same prompt across systems as often as this phase needs. Google AI Studio and similar free playgrounds cover the model-comparison work at no cost.

The verification side is entirely free, and this is the point worth emphasising: the authoritative sources you will check against — government pages, official documentation, bibliographic databases, standards bodies — are open to everyone. Verification is not a paid feature. It is reading the primary source instead of a summary of it, and no subscription changes that.

If you want unlimited repetition for manufacturing failures, a small model running locally through Ollama costs nothing after the download and has no rate limit, which makes it ideal for the deliberate-failure practice in this phase. Check its licence terms before using it for anything beyond your own learning.

### What a paid tier adds

A paid chat tier gives you stronger models, longer context for pasting large sources, file uploads and more messages per day. More context genuinely helps the central technique of this phase, because transformation tasks eat context — pasting a long document to make a task safe is the main way you buy reliability here.

An API key adds scripting: running the same prompt across several models, logging outputs for your ledger automatically, and comparing failure rates over dozens of runs rather than a handful. That turns anecdotal impressions into something closer to a measurement.

A few providers offer features aimed at grounding — retrieval over your own documents, or built-in search with visible sources. These are exactly the mechanisms Track 4 covers, and paying for them is buying an automated version of the manual paste-the-source move you are practising this week.

### When it's worth paying

**Not for this phase.** The judgements this phase teaches are not improved by a stronger model. A weaker free model actually produces hallucinations more readily, which makes it a better training ground — you will see the failure modes sooner and more often. Practice on the free tier and save the money.

The honest threshold: pay when a specific bottleneck appears that you can name. If you find yourself routinely running out of context while pasting sources for transformation tasks, a longer context window has a concrete value you can measure. If you start running batches of prompts to measure failure rates across models, an API key turns that from tedious into trivial. And when you reach Track 4 and want retrieval over your own documents, that is a real capability rather than a convenience.

Until one of those is true, the free path teaches this phase completely. If you do have a free API tier available, use it for one thing: running the same prompt across two models side by side, which is the cheapest way to see that the failure modes belong to the mechanism rather than to a particular product.
