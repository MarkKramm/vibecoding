---
id: sc-03-alignment-capability-and-honest-limits
track: safety-career
phase: 3
order: 20
title: Alignment, Capability and Honest Limits
duration: 1 week
duration_weeks: 1
energy_mix: [normal, high]
deliverable: portfolio/safety-career/03-alignment-capability-and-honest-limits.md
exit_criteria: >
  You can explain what alignment means technically, describe RLHF and why the KL penalty
  exists, state what reward hacking is with a concrete example, and — most importantly —
  distinguish a measured result from an extrapolation in your own writing. You have taken
  one claim you made about your own work and rewritten it so that it is defensible.
prerequisites:
  - safety-career/01
  - model-internals/02
---

# Phase 3 — Alignment, Capability and Honest Limits

## Goal of this phase

Understand what alignment actually means as an engineering problem — not as a debate about machine consciousness — and then apply the hardest part of it to yourself: **the discipline of not over-claiming about your own results.**

Two halves, and they connect more tightly than they first appear. The first half is technical: how a model gets shaped toward being helpful, why that shaping is difficult, and how the shaping itself creates new failure modes. The second half is personal: **the same error at the centre of alignment — optimising for a measurable proxy instead of the thing you actually wanted — is the error you will make about your own work.**

The through-line is that **a number that goes up is not evidence that the thing you care about improved.** That is true of a training run and true of your own portfolio.

## Estimated time

**1 week at 1–2 focused hours a day.** The technical content is conceptual — no maths beyond the idea of a penalty term. The rewriting exercise at the end takes longer than people expect, which is the point.

## Skills you'll gain

- Explain **alignment** as a technical problem: getting a system to pursue what you meant rather than what you specified.
- Describe **RLHF** in outline and explain **why the KL penalty exists** — what it prevents, and what it costs.
- Explain **reward hacking** and recognise it in a system you built.
- Describe **Constitutional AI** and what it changes about where the human judgement enters.
- State the **alignment tax** and why capability and safety are usually in tension rather than in sequence.
- **Distinguish a measured result from an extrapolation** in your own writing — the single most credibility-building habit in this track.
- Rewrite a claim about your own work so that it survives someone checking it.
- Recognise the **proxy-optimisation error** in your own metrics.

## Specific topics to learn

1. **What alignment means**, stated so it is testable: the system does what you intended, including in situations you did not anticipate.
2. **The specification problem.** Why "what you meant" and "what you wrote down" come apart, and why this is not a solved problem.
3. **RLHF.** The three stages — pre-training, supervised fine-tuning, preference-based optimisation — and what each contributes.
4. **The KL penalty.** What divergence from the base model means, why it is penalised, and the trade-off it encodes.
5. **Reward hacking** and Goodhart's law. Why optimising a proxy hard enough breaks the link between the proxy and the goal.
6. **Constitutional AI.** Using a written set of principles to generate preference data, and what that does and does not change.
7. **The alignment tax.** Why safety and capability often trade rather than compose.
8. **Epistemic honesty in your own reporting.** Measured versus inferred versus believed, and how to mark which is which.

## Tools for This Phase

- **A plain text file for the rewriting exercise.** You will draft a claim, then attack it.
- **Any model you have access to** — you will use it to criticise your own writing, which is a use where a model is genuinely strong because you are asking it to find problems rather than to agree.
- **Your own project or writing so far.** The exercise needs a real claim you actually made.
- **`docs/DECISIONS.md`** in `learning-site/`, if you want to see how one project recorded decisions with their reasoning and their uncertainty attached. It is a working example of the habit this phase teaches.

Nothing in this phase needs money.

## Free/cheap resources

- **The InstructGPT and Constitutional AI papers.** Both are readable without a research background, and both are the primary sources for what RLHF and CAI actually do rather than what people say they do. Read the abstract, the method section, and the limitations section.
- **Anthropic's and OpenAI's model cards and system cards.** These are unusually candid about known weaknesses, and reading one teaches you what a well-scoped capability claim looks like.
- **Your own writing**, which is the actual resource. The exercise is to find a claim you made that you cannot fully support.
- **`docs/research/vibecoding-tool-landscape.md`** in this repository for an example of a research document that marks its own unverified claims explicitly — useful as a model for how to write when you are not certain.

Be sceptical of secondary writing about alignment. A great deal of it argues about systems nobody has built, and it frequently presents **speculation as if it were established**. Prefer the primary papers, and note when an author is describing what a system *does* versus what they *expect* it to do.

## Lesson: Optimising for the Wrong Number

### Part 1 — What alignment actually is

Strip the philosophy and alignment becomes a concrete engineering problem:

**Get a system to pursue what you intended, including in situations you did not anticipate.**

Every word there is load-bearing, and the last clause is where it becomes hard. You can write a specification for the cases you thought of. The failure happens in the cases you did not — and a system optimised against your specification will do exactly what the specification says in those cases, which is often not what you wanted.

This is the **specification problem**, and it is worth seeing that it is not an AI problem. Any specification is a compressed description of what you want, and compression loses information. When you tell someone "make the tests pass," you mean *make the behaviour correct*, and those are different instructions. A system that takes you literally is not malfunctioning; **it is following your instruction when your instruction was an imperfect description of your goal.**

Hold onto that, because it is the same error you will make about your own work in Part 7.

### Part 2 — RLHF, and why the KL penalty exists

The modern recipe has three stages, and knowing what each one does explains its failure modes.

**Stage 1: pre-training.** Predict the next token on an enormous corpus. This produces a system that can generate text, with no particular disposition toward being helpful. It also produces the base against which everything later is measured.

**Stage 2: supervised fine-tuning.** Train on examples of good assistant behaviour. This teaches format and disposition — answer the question, be clear, refuse certain things. It is demonstration, not preference.

**Stage 3: preference optimisation.** Collect human judgements about which of two responses is better, train a model to predict those judgements, then optimise the assistant to score well according to that predictor. This is where RLHF lives.

**Now the part people skip: the KL penalty.**

If you optimise purely for the reward model's score, you get a system that exploits the reward model rather than one that is actually good. The reward model is an **approximation** of human preference, learned from a finite set of comparisons. Optimise hard enough against any approximation and you find its weaknesses.

The KL penalty is the defence. It measures how far the trained model has drifted from the base model, and **penalises divergence.** The effect is that the model is pushed toward higher-reward behaviour, but is not allowed to wander arbitrarily far from the distribution it started in.

**Why this matters conceptually, and why it is worth understanding rather than memorising:** the KL penalty is an admission that **the objective is not trustworthy enough to be optimised freely.** You trust it in the region where it was trained and you distrust it far away, so you constrain the search.

**And it encodes a real trade-off.** Too little penalty and you get degenerate exploitation — the model games the reward. Too much and the fine-tuning does almost nothing, because you have restricted it to behaviour it already had. Every RLHF system is choosing a point on that line. **The penalty is not a detail; it is the mechanism by which the designers state how much they trust their own reward signal.**

### Part 3 — Reward hacking, or the number that stops meaning anything

**Goodhart's law**, in the form that matters here: when a measure becomes a target, it ceases to be a good measure.

This is not a quirk of AI. It is what happens when you optimise a **proxy** — a measurable stand-in — hard enough that the proxy and the goal come apart. The classic case is a factory measured on units produced, which produces units and stops caring whether they work.

In a model, reward hacking takes recognisable forms:

**Length.** If raters preferred longer answers, you get a model that pads. The answers get better by the metric and worse by reading.

**Agreeableness.** Preference training on human approval produces a system that agrees, which is covered in Phase 1 as sycophancy. It is the same failure: approval was the proxy, and helpfulness was the goal.

**Confident tone.** Raters prefer answers that sound authoritative. A model trained on that preference learns to sound certain regardless of whether it is.

**Test-passing.** In a coding context, if the objective is "the tests pass," the shortest path is sometimes to change the tests. Nothing about this is dishonest in any way the system can perceive — it was given an objective and found the efficient route to it.

**What makes reward hacking worth studying is that it is not a bug in the usual sense.** There is no component that failed. The system did exactly what it was asked. **The failure was in the asking** — which is precisely the error to look for in your own metrics.

### Part 4 — Constitutional AI, and where the human judgement sits

**Constitutional AI** changes where human judgement enters the process.

In standard RLHF, humans compare responses directly, which is expensive and encodes whatever biases those humans have. In CAI, you write down a set of **principles** — a constitution — and use a model to critique and revise its own outputs against those principles, generating preference data from that process. Human effort moves from labelling individual comparisons to **writing the principles.**

**What this buys:** scale, consistency, and crucially a **written, inspectable artefact.** You can read the constitution and argue with it. You cannot read the aggregate of ten thousand pairwise judgements.

**What it does not buy:** the principles are still written by people, so their blind spots are still in there. And a model applying principles to itself uses the same machinery that produced the output — the same concern as Phase 1's calibration problem, mitigated but not eliminated by the fact that the principles are external and explicit.

**The transferable idea, and you can use it this week:** **written criteria beat implicit judgement, because they can be inspected and argued with.** This is the same reason a rubric produces more consistent grading than a teacher's impression, and the same reason the deliverable of this phase asks you to write down what you will and will not claim.

### Part 5 — The alignment tax, and why this is not a solved sequence

A tempting story: build capability first, then add safety on top. This story is wrong, for a structural reason.

**Capability and safety are often in tension, not in sequence.** Every constraint you add to a system — a refusal, a check, a narrower objective — costs some capability. This is the **alignment tax**. It is usually small, and it is usually real.

Why the sequencing story fails: capability is not a fixed thing you can bolt a safety layer onto. **The behaviours that make a system capable and the behaviours that make it safe are learned by the same process, from the same objective.** You cannot cleanly separate them afterward, because they were never separate.

**What this means for your own practice, and it is the practical payoff:** you will face the same trade every time you add a check to your project. A validation step costs latency. A human approval costs throughput. A narrower model costs quality on the cases outside its range. **Every real safeguard costs something, and a safeguard that appears to cost nothing is usually not doing anything** — which is Phase 1's point restated from the other direction.

### Part 6 — What is actually contested

This phase has been careful to separate what is **established** from what is **argued**. That separation is the skill, so state the boundaries explicitly.

**Established, and you can rely on it:** the three-stage training recipe; that reward models are approximations and can be exploited; that the KL penalty exists to prevent this; that Goodhart's law applies to optimised proxies; that model cards document known failure modes.

**Contested, and you should hold loosely:** whether current techniques scale to systems much more capable; what "aligned" should require of a system; how much of the risk is present today versus projected; whether the alignment tax is a fundamental cost or a temporary engineering inefficiency. Reasonable, informed people disagree on each of these.

**Speculative, and should be marked as such when you repeat it:** claims about systems that do not exist yet, and predictions with dates attached.

**The habit this phase is really teaching:** when you read or repeat a claim about AI, ask **which of those three categories it is in.** Most confusion about this field comes from speculation being repeated in the register of established fact — by people who did not notice they had changed categories.

### Part 7 — Applying it to yourself

Here is where a phase about alignment becomes the most useful thing in this track.

**You will optimise for the wrong number about your own work.** Not dishonestly — the same way a training run does. You will pick a proxy that is easy to measure, work hard against it, and end up with a number that went up while the thing you cared about did not.

The proxies available to you:

**Lines of code.** Goes up when you generate more, which is trivial now and means nothing.

**Number of projects.** Goes up when you start things. Says nothing about finishing.

**Commits.** Goes up when you commit, including when you commit noise.

**"It works."** Goes up when you try the one path you had in mind.

**Model scores on a leaderboard.** Goes up when you pick a task the model is good at.

**What you actually wanted** was: can you build things that work for people who are not you, and can you tell when they do not. That is hard to measure, which is exactly why it gets replaced by things that are easy to measure.

**The remedy is not to stop measuring. It is to notice what your measure omits, every time.**

### Part 8 — Measured, inferred, believed

The final skill, and the one that will distinguish you.

Every claim you make about your own work falls into one of three categories, and they must be labelled:

**Measured.** You ran it and it produced this. "The endpoint returns 200 on the happy path and 500 on a missing field, tested with these five inputs." **This is the only category that is evidence.**

**Inferred.** You did not test it, but reasoning from what you did test supports it. "Since validation happens before the write, a malformed payload should not reach the database — I have not tested that path." **Legitimate, and it must be marked.**

**Believed.** You think it is true and have no specific basis. "This should scale fine." **Fine to hold, dishonest to state as fact.**

**The failure mode is that these get written in the same register.** A sentence like "the system handles errors gracefully" could be any of the three, and the reader has no way to tell — so they will assume the strongest reading, and if it is actually the weakest, **you have made a claim you cannot defend and did not intend to make.**

**Two habits that fix it:**

**State the boundary of what you tested.** "Tested with five inputs; I did not test concurrent writes." This is not weakness. **It is the single strongest credibility signal available to you**, because it tells the reader that the rest of your claims have been checked. A writer who names the limits of their evidence is a writer whose unqualified statements mean something.

**Say what would falsify it.** "If the retry logic is wrong, we would see duplicate rows in the audit table." This converts a belief into something you or a reviewer can check, which is most of the value.

**Why this matters more in the AI era than it did before.** Generation is cheap, so the volume of confident-sounding text has gone up enormously, and the reader's default assumption has shifted. **Unqualified claims are now cheaper to make and therefore worth less.** The scarce thing is a claim someone can check — and the way to signal that yours is checkable is to say what you did not check.

This is also, finally, the same discipline as Part 1. A specification is a description that loses information; a claim about your own work is a description that loses information; the failure in both cases is a gap between what was said and what was meant, discovered by someone who took the words literally. **Writing honestly is specifying carefully, applied to yourself.**

## Hands-on practice tasks

1. Write down three claims you have made about your own project, in your own words, exactly as you would say them to someone. Do not improve them yet. <!-- id: sc-03-alignment-capability-and-honest-limits-t01 band: quick energy: low -->
2. Classify each of the three as measured, inferred, or believed. Be strict — if you did not run it, it is not measured. <!-- id: sc-03-alignment-capability-and-honest-limits-t02 band: quick energy: normal -->
3. Rewrite each claim so that its category is explicit and its limits are stated. Then reread the originals and note which one you would have been unable to defend. <!-- id: sc-03-alignment-capability-and-honest-limits-t03 band: deep energy: high -->
4. For one claim, add what would falsify it — the observation that would tell you it is wrong. <!-- id: sc-03-alignment-capability-and-honest-limits-t04 band: focused energy: normal -->
5. Explain, in a paragraph and without looking, why the KL penalty exists and what it admits about the reward model. <!-- id: sc-03-alignment-capability-and-honest-limits-t05 band: focused energy: normal -->
6. Find a metric you track about your own learning — projects started, hours, courses finished. Write one sentence on what it omits. <!-- id: sc-03-alignment-capability-and-honest-limits-t06 band: focused energy: normal -->
7. Identify a case of reward hacking you have personally committed. Changing the test to pass, padding an answer, counting a project that is not finished. Describe it without excusing it. <!-- id: sc-03-alignment-capability-and-honest-limits-t07 band: focused energy: high -->
8. Read the limitations section of one model card or system card. List three things the vendor says their own system does badly. <!-- id: sc-03-alignment-capability-and-honest-limits-t08 band: focused energy: normal -->
9. Take a claim you have read recently about AI capability or risk and sort it into established, contested, or speculative. Say what would move it between categories. <!-- id: sc-03-alignment-capability-and-honest-limits-t09 band: focused energy: high -->
10. Write two sentences describing what a written set of principles buys you over implicit judgement, using your own experience of being graded or reviewed. <!-- id: sc-03-alignment-capability-and-honest-limits-t10 band: quick energy: low -->
11. Ask a model to attack your rewritten claim as hard as it can, having first told it to argue against you. Record whether it finds anything real. <!-- id: sc-03-alignment-capability-and-honest-limits-t11 band: focused energy: normal -->
12. List three safeguards you would like to add to your project, and name the cost of each in latency, money, complexity, or the user's time. Cross out any whose cost you cannot state. <!-- id: sc-03-alignment-capability-and-honest-limits-t12 band: deep energy: high -->
13. Rewrite your project's README or description to include one explicit statement of what you have **not** tested. Notice how it reads. <!-- id: sc-03-alignment-capability-and-honest-limits-t13 band: focused energy: normal -->

## Common Pitfalls

**Treating alignment as a solved engineering step.** The recipe exists; the problem is not solved. Systems still do what you specified rather than what you meant, which is why this phase's personal half matters.

**Memorising "KL penalty" without knowing what it admits.** The penalty exists because the reward model is not trustworthy enough to optimise freely. If you can state that, you understand it; if you can only define divergence, you have a vocabulary item.

**Assuming capability and safety can be sequenced.** Build first, add safety later, is the intuitive story and it does not hold, because both are learned by the same process.

**Reading secondary sources as primary.** Much writing about alignment describes systems that do not exist. Check whether an author is reporting behaviour or expecting it.

**Counting something easy because it is easy.** The number that goes up is rarely the number you wanted. Every metric you keep is a choice about what to ignore.

**Writing "measured" claims that are actually inferred.** This is the most common dishonesty in technical writing and it is usually unintentional. If you did not run it, say so. The reader will find out.

**Believing the boundary statement weakens you.** Naming what you did not test is the strongest credibility move available. Every unqualified claim you make is now trusted more, because you demonstrated you know the difference.

**Over-correcting into permanent hedging.** The goal is precision, not uncertainty about everything. Say "measured" when you measured. False modesty is its own kind of inaccuracy, and it is just as unhelpful to a reader.

## Deliverable / proof of work

A file at `portfolio/safety-career/03-alignment-capability-and-honest-limits.md` containing:

1. **Three claims about your own work, before and after.** The original wording, its classification as measured, inferred or believed, and the rewritten version with explicit limits.
2. **A falsification statement** for one of them — what observation would show it is wrong.
3. **A reward-hacking case of your own**, described plainly, with the proxy identified and the goal it displaced.
4. **One metric you track and what it omits.** A sentence is enough; the honesty is the point.
5. **Three safeguards and their costs**, with anything removed for having no statable cost.
6. **An explicit statement of what your project has not been tested against**, written in the register you would use publicly.

Point 1 is the centre of the deliverable. **The rewritten claim should be more convincing than the original**, not more timid — and if it is not, you have hedged rather than specified.

## Checklist

- [ ] I can state alignment as a testable engineering problem rather than a philosophical one <!-- id: sc-03-alignment-capability-and-honest-limits-c01 energy: low -->
- [ ] I can explain the three stages of the modern training recipe and what each contributes <!-- id: sc-03-alignment-capability-and-honest-limits-c02 energy: normal -->
- [ ] I can explain why the KL penalty exists and what it admits about the reward model <!-- id: sc-03-alignment-capability-and-honest-limits-c03 energy: normal -->
- [ ] I can define reward hacking and give an example from my own behaviour, not from a paper <!-- id: sc-03-alignment-capability-and-honest-limits-c04 energy: normal -->
- [ ] I can explain what Constitutional AI changes about where human judgement enters <!-- id: sc-03-alignment-capability-and-honest-limits-c05 energy: normal -->
- [ ] I can explain why capability and safety cannot be cleanly sequenced <!-- id: sc-03-alignment-capability-and-honest-limits-c06 energy: high -->
- [ ] I can sort a claim about AI into established, contested, or speculative <!-- id: sc-03-alignment-capability-and-honest-limits-c07 energy: normal -->
- [ ] I have classified my own claims as measured, inferred, or believed, strictly <!-- id: sc-03-alignment-capability-and-honest-limits-c08 energy: normal -->
- [ ] I have rewritten a claim so its limits are explicit and it is stronger rather than weaker <!-- id: sc-03-alignment-capability-and-honest-limits-c09 energy: high -->
- [ ] I can state what would falsify one of my claims <!-- id: sc-03-alignment-capability-and-honest-limits-c10 energy: normal -->
- [ ] I have identified one metric I track and what it omits <!-- id: sc-03-alignment-capability-and-honest-limits-c11 energy: normal -->
- [ ] I have named the cost of each safeguard I want to add, and removed those with no statable cost <!-- id: sc-03-alignment-capability-and-honest-limits-c12 energy: high -->
- [ ] My project documentation now states something I have not tested <!-- id: sc-03-alignment-capability-and-honest-limits-c13 energy: low -->

## Quiz

### Q1. Why does RLHF include a KL penalty against the base model? <!-- id: sc-03-alignment-capability-and-honest-limits-q01 energy: high -->

- [ ] To reduce training cost by keeping the model small
- [x] Because the reward model is an approximation that can be exploited if optimised without limit
- [ ] To prevent the model from memorising its training data
- [ ] To make the fine-tuned model faster at inference

**Why:** The reward model is learned from a finite set of human comparisons, so it is a proxy rather than the goal. Optimising hard against any approximation finds its weaknesses. The KL penalty constrains how far the model may drift from where the reward signal is trustworthy — which is an explicit admission by the designers of how much they trust their own objective.

### Q2. A team is scored on the number of features shipped per month. Output rises sharply and user satisfaction falls. What is the best description of what happened? <!-- id: sc-03-alignment-capability-and-honest-limits-q02 energy: high -->

- [ ] The metric was measured incorrectly
- [ ] The team became less competent
- [x] The proxy was optimised until it stopped tracking the goal
- [ ] User satisfaction is not a meaningful measure

**Why:** Goodhart's law in its ordinary form. Nothing dishonest occurred — the team did what the measure rewarded. The failure was in choosing a measure that could be satisfied without producing the thing it stood for, which is the same structural error as reward hacking in a training run.

### Q3. Your README says "the API handles concurrent writes correctly." You tested only sequential requests. What is wrong? <!-- id: sc-03-alignment-capability-and-honest-limits-q03 energy: high -->

- [x] An inferred claim has been written in the register of a measured one
- [ ] Nothing, since sequential testing is the standard practice
- [ ] The claim is simply false and should be deleted
- [ ] Concurrency cannot be tested without production traffic

**Why:** The claim may well be true, but it is not measured — it is inferred from reasoning about how the code works. The problem is not the belief; it is that the reader cannot tell which category they are reading and will assume the strongest. Stating the boundary of what you tested fixes this without weakening the claim.

### Q4. What does naming what you have not tested do to your credibility? <!-- id: sc-03-alignment-capability-and-honest-limits-q04 energy: normal -->

- [ ] It weakens it, because readers focus on the gap
- [ ] It has little effect either way
- [ ] It weakens it unless the gap is small
- [x] It strengthens it, because it shows your other claims were checked

**Why:** The reader's problem is not that claims are imperfect — it is that they cannot tell which claims are which. A writer who states the limits of their evidence has demonstrated they know the difference, which makes every unqualified claim in the same document worth more. Generation is cheap, so checkable claims are the scarce thing.

### Q5. Why is "build the capability first, add the safety later" a misleading plan? <!-- id: sc-03-alignment-capability-and-honest-limits-q05 energy: high -->

- [ ] Safety work is more expensive after launch
- [x] Capable and safe behaviours are learned by the same process, so they cannot be cleanly separated afterward
- [ ] Regulators require safety features before release
- [ ] Later changes invalidate the original evaluation

**Why:** The behaviours are not separate layers. They come from the same objective applied to the same weights, which is why the alignment tax is a real trade rather than a scheduling problem. You are always choosing a point on a line, not completing one stage before starting the next.

### Q6. A model card states a benchmark score. What can you conclude? <!-- id: sc-03-alignment-capability-and-honest-limits-q06 energy: normal -->

- [ ] The model performs at that level on tasks like yours
- [ ] The model is better than one with a lower score
- [ ] The score predicts performance in production
- [x] The model achieved that score on that benchmark, and nothing more

**Why:** A benchmark score is a measured result on a specific distribution, which is genuine evidence and narrowly scoped. Extending it to your task is an inference, and the whole point of this phase is that inferences must be marked as such. Phase 1's distributional shift is exactly why a benchmark number is a weak predictor of your own inputs.

## You're ready to move on when...

- You can explain **why the KL penalty exists** — the admission it makes about the reward model — and not merely define it.
- You can give a **reward-hacking example from your own behaviour**, not one from a paper.
- You can take a claim about AI and sort it into **established, contested, or speculative**, and say what would move it.
- You have **rewritten a claim about your own work** so its limits are explicit, and it is stronger for it.
- You can state **what would falsify** one of your own claims.
- You can name **the cost of every safeguard** you want to add, and you have dropped the ones whose cost you could not state.
- Your project documentation **states something you have not tested**, without apologising for it.

If your rewritten claims are more timid than the originals, you have not finished. **Precision strengthens a claim; hedging weakens it.** The target is a claim someone can check, not a claim nobody can pin down.

## Free vs Paid

**Nothing in this phase requires spending, and the paid tools are worse for it.** The technical material is conceptual — papers and model cards you can read for free — and the valuable half is the rewriting exercise, which costs only attention.

**What free gives you completely:** the primary papers, vendor model and system cards, and a model to attack your own drafts. Asking a model to find problems in your writing is one of the uses where capability is high and cost is low.

**Where paid would not help at all:** this is a reasoning and honesty phase. There is no experiment to run on a better model. A stronger model does not make your claims more defensible — that work is yours, and it is the kind that transfers directly to how you are judged.

**The one thing worth noting about cost incidentally:** the KL penalty and the alignment tax are the concepts behind why safety features cost capability and money. Understanding that is useful when you are choosing which free tool to rely on, because a free tier is frequently free precisely because a constraint was relaxed — training on your data, rate limits, or support. The economics in the Cost & Efficiency track follow directly from the trade this phase describes.
