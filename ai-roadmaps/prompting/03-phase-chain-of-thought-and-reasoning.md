---
id: prompt-03-chain-of-thought-and-reasoning
track: prompting
phase: 3
order: 30
title: Chain-of-Thought and Reasoning Techniques
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/prompting/03-chain-of-thought-and-reasoning.md
exit_criteria: >
  You can choose between direct answering, chain-of-thought, self-consistency,
  decomposition, and reflection for a given task and model class, justify the
  choice from the mechanism rather than from fashion, state the cost and the
  failure mode you are accepting, and explain why a chain of thought is
  generated text rather than a faithful record of computation.
---

# Phase 3 — Chain-of-Thought and Reasoning Techniques

## Goal of this phase

Make a model show its working — and then understand precisely what "showing its working" does and does not buy you.

Phases 1 and 2 taught you to be specific: state the task, give the format, supply the context, constrain the output. That gets you a long way on tasks where one forward pass through the model is enough to produce the answer. This phase is about the tasks where it is not — arithmetic, multi-step logic, planning, anything where the answer depends on intermediate results that must be correct before the final answer can be.

By the end you will be able to do four things. First, explain *why* asking for intermediate steps changes the answer at all, in terms of the mechanism you already learned: a transformer's non-embedding computation per token is a fixed-depth circuit, so a hard problem needs more serial steps than one token's worth of computation can supply. Second, name the family of techniques that elicit those steps and pick between them. Third, and most importantly, say where each one stops working — because every technique in this phase has a domain where it does nothing at all, and several have a domain where they make things worse. Fourth, hold the correct mental model of a chain of thought: it is generated text, produced by the same next-token process as everything else, not a printout of the model's internal computation.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

| Day | Focus | Time |
|---|---|---|
| Mon | Read Parts 1–2 (the problem, and the mechanism that explains it) | 1–2h |
| Tue | Read Parts 3–4 (the technique family, and what it costs) | 1–2h |
| Wed | Hands-on: run the six-technique comparison on one task | 1–2h |
| Thu | Hands-on: the faithfulness experiment and the small-model test | 1–2h |
| Fri | Finish the deliverable, take the quiz, review what you got wrong | 1–2h |

The reading here is short compared to the measurement work. The whole phase turns on experiments you run yourself, because the interesting facts — the answer flips, the verbose wrong explanation, the technique that helps on one task and does nothing on the next — are only believable when you watch them happen on your own task.

## Skills you'll gain

- Explain why a chain of thought changes a model's answer in mechanistic terms, not vibes
- Distinguish a *scratchpad* from a *justification*, and know which one you are looking at
- Write a direct prompt and a chain-of-thought prompt for the same task and predict which will win
- Predict which task classes gain from intermediate reasoning and which ones gain nothing
- Run self-consistency sampling and state exactly which outputs it can and cannot be applied to
- Explain why self-consistency multiplies your token cost by the sample count, and decide when that is worth it on a free tier
- Decompose a problem with least-to-most prompting, and choose a decomposition that does not leak the answer
- Explain why tree-of-thought is a research technique with a real cost, not a default
- Use a verify-and-revise loop (reflexion) and say what makes its critique informative rather than decorative
- Recognise when explicit chain-of-thought instruction is redundant or counterproductive
- Run a short faithfulness experiment and report what it does and does not establish

## Specific topics to learn

### Why intermediate steps exist at all

- The fixed-depth problem: per-token compute in a transformer is bounded
- Serial vs parallel computation and why a longer answer can be a more powerful computation
- Token budget as compute budget: output tokens are the unit of extended reasoning
- Why the answer must be *generated* to be used, not merely implied

### The technique family

- Chain-of-thought (Wei et al., 2022): worked examples with steps
- Zero-shot CoT (Kojima et al., 2022): the elicitation phrase, and what it actually is
- Self-consistency (Wang et al., 2022): sample, then vote
- Least-to-most (Zhou et al., 2022): decompose, then solve in order
- Tree-of-thoughts (Yao et al., 2023): search over partial solutions
- Reflexion (Shinn et al., 2023): verbal critique fed back into the next attempt

### Costs and where each stops working

- Token cost multiplication and the free-tier consequence
- What a majority vote needs in order to be well-defined
- Non-reasoning tasks, perceptual tasks, and tasks where the model already knows the answer
- Small models and the scale-dependence of the original finding
- Reasoning models that do this internally: when instruction is redundant, and when it interferes

### Faithfulness

- The chain as generated text and post-hoc explanation
- Unfaithful explanations: plausible rationales for answers reached otherwise
- The practical consequence: evaluate outputs, not reasons

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Google AI Studio | Run the same prompt across several model sizes and thinking settings to see the scale and model-class effects | Free tier | https://aistudio.google.com/ | Run tasks 1, 2, and 8 — the CoT-vs-direct test across two model sizes | Any provider free tier that exposes more than one model size |
| Ollama | Sample the same prompt many times locally for self-consistency with no metering | Free, open source | https://ollama.com/ | Run task 6 — 10 samples at temperature above zero, on a small local model | llama.cpp built from source, or LM Studio |
| Python + the OpenAI Python library | Script the sample-and-vote loop and the faithfulness experiment reproducibly | Free, open source | https://github.com/openai/openai-python | Run tasks 4 and 9 — the voting script and the shuffled-example faithfulness test | Any HTTP client; the API is a plain POST |
| tiktoken | Measure the token cost multiplier of each technique so the cost claims are yours, not mine | Free, open source | https://github.com/openai/tiktoken | Run task 7 — count tokens for direct, CoT, and 10-sample self-consistency | Hugging Face `transformers` tokenizers |
| LibreOffice Calc | Tabulate the six-technique comparison and compute vote agreement | Free, open source | https://www.libreoffice.org/ | Run task 3 — the comparison matrix from tasks 1 and 2 | Google Sheets in any browser |
| Anthropic prompt engineering docs | See a current provider's position on reasoning models and when not to add CoT instruction | Free to read | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview | Run task 10 — find and summarise the current guidance, with the date you read it | The current prompt-guide docs of any provider you have access to |

## Free/cheap resources

- **Wei et al., Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (2022)** — https://arxiv.org/abs/2201.11903
- **Kojima et al., Large Language Models are Zero-Shot Reasoners (2022)** — https://arxiv.org/abs/2205.11916
- **Wang et al., Self-Consistency Improves Chain of Thought Reasoning in Language Models (2022)** — https://arxiv.org/abs/2203.11171
- **Zhou et al., Least-to-Most Prompting Enables Complex Reasoning in Large Language Models (2022)** — https://arxiv.org/abs/2205.10625
- **Yao et al., Tree of Thoughts: Deliberate Problem Solving with Large Language Models (2023)** — https://arxiv.org/abs/2305.10601
- **Shinn et al., Reflexion: Language Agents with Verbal Reinforcement Learning (2023)** — https://arxiv.org/abs/2303.11366
- **Google AI Studio** — https://aistudio.google.com/
- **Ollama** — https://ollama.com/
- **tiktoken repository (open-source tokenizer)** — https://github.com/openai/tiktoken
- **Anthropic — Prompt engineering overview** — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview

## Lesson: Reasoning You Can Elicit, and Reasoning You Cannot Trust

### Part 1 — The problem is that one token of computation is a fixed-depth circuit

Start with the thing that makes this phase necessary.

A transformer produces one token by running its input through a fixed stack of layers. Whatever the model does to decide that token — attend here, combine this, transform that — happens inside those layers. The depth of the stack does not grow because your question is hard. It is the same stack for "the capital of France is" and for a three-step arithmetic word problem.

This is the crux, so let me say it the way the literature says it: the non-embedding part of a transformer is a circuit of bounded depth, so a problem requiring more serial steps than that circuit can carry in one pass cannot be solved in one pass. The model has a fixed number of sequential operations available per token. Some problems need more than that.

So how does anything hard ever get solved? By spreading the computation across tokens. When the model writes "First, 12 times 4 is 48," the token `48` is not just output — it becomes input for the next position. The next position attends back over it and can build on it. Each generated token buys another pass through the whole stack, conditioned on everything written so far.

That is the whole mechanism of chain-of-thought, and it is worth stating as a one-liner you can reuse:

> **A chain of thought converts a hard one-step problem into a series of easier problems, by letting intermediate results be written down and re-read.**

Three consequences follow immediately, and they are the ones you can predict things with.

**The chain must be generated, not merely implied.** A model that "knows" the intermediate steps but does not write them gets no benefit from them, because they never become input. This is why the elicitation works at all: you are not teaching the model arithmetic, you are bringing intermediate results into the context where the next step can attend to them.

**Longer output is not a side effect — it is the mechanism.** Reasoning cost and answer length are the same knob. This is also why thinking-model bills are dominated by output tokens, and why "just think harder" is a request for more computation rather than a request for a different attitude.

**Sometimes no amount of thinking helps.** If the required knowledge is not in the weights and not in the context, additional serial steps will produce a fluent chain that arrives at a confident wrong answer. Reasoning extends computation; it does not create information.

#### What the original result actually claimed

Wei et al. (2022), arXiv:2201.11903, showed that including worked examples with intermediate steps in the prompt improved performance on arithmetic, commonsense, and symbolic reasoning benchmarks — and, crucially, that **the gains were an emergent property of scale**. Small models did not benefit, and in some settings performed worse with chain-of-thought examples than with direct-answer examples. The ability to use a chain productively appeared as models got larger.

Hold onto that. It is the single most useful predictive fact in this phase, because it tells you that "add step-by-step instructions" is not a universal improvement. It is an intervention whose payoff depends on the model's capacity to do the steps at all.

Two clarifications, because this result gets garbled constantly online.

**It is not "big models think, small models cannot."** It is narrower and more useful: with chain-of-thought prompting, the measured benefit on those benchmarks appeared at larger scales. A small model may still benefit on a task that sits just above its one-pass capability — you have to test it, which is exactly what task 8 makes you do.

**The examples in the prompt are not the mechanism.** The examples teach the *format* of showing work. The gain comes from the model then producing its own steps and conditioning on them. This matters because it predicts something non-obvious: a zero-shot phrasing that elicits the same behaviour should get much of the same benefit. It does. That is Part 2.

### Part 2 — The phrase everyone memorised, and what it actually is

"Let's think step by step" comes from Kojima et al. (2022), arXiv:2205.11916. The paper's contribution was showing that a single elicitation sentence appended to the prompt, with **no worked examples at all**, produced large gains on reasoning benchmarks — the authors framed it as turning a language model into a "zero-shot reasoner."

The sentence in the paper is "*Let's think step by step.*" It was not handed down; it was found. The authors tried a range of elicitation phrasings and that one performed best. This is worth knowing because it explains the folklore around it: it is an empirically selected string, not a magic word, and its exact wording matters far less than its function.

**What the phrase does, mechanically.** It changes the distribution over what the next tokens are. Without it, the model's continuation is drawn from a distribution heavily weighted toward *answer-shaped* text — short, declarative, in the format the question suggests. With it, the continuation is drawn from a distribution weighted toward *worked-solution-shaped* text: numbered steps, intermediate quantities, connective phrases. You are not adding knowledge. You are selecting a different continuation mode, and that mode happens to emit intermediate results, which then become attended-to context for the final answer.

That is why it is fragile and why it is cheap. Fragile, because it is a steering operation on a distribution, not a guarantee — which is Part 4's subject. Cheap, because it costs one sentence of input rather than several worked examples.

**Two practical notes on zero-shot vs few-shot CoT.**

Few-shot CoT with worked examples costs input tokens on every call and is more reliable at locking a specific *format* — useful when you need the output to match a schema. Zero-shot CoT costs almost nothing and gets you most of the reasoning benefit. On a $0 budget with metered free tiers, the second is usually the better default; reach for examples when you need format control, not when you need thinking.

And the one-line answer-extraction trick: after eliciting the steps, you often need the answer alone. Asking for it in a fixed shape — a final line, a tagged field — is Phase 1 and 2 material applied here. Elicit the steps, then constrain the extraction. Expect to spend a second call or a stricter format instruction on it.

#### Where this stops working

The honest answer is: on tasks that were never computation-limited in the first place.

**Perceptual and classification tasks.** Ask a model to label the sentiment of a sentence, classify a support ticket, or extract fields from an invoice. There is no intermediate result to compute. Adding "think step by step" makes the output longer and the bill larger, and it does not improve accuracy — it can measurably hurt, because the model now generates text that can drift off-task before it commits to the label.

**Tasks the model already solves in one pass.** If direct prompting is already at ceiling on your task, there is no headroom for reasoning to recover. Measure the direct baseline first. This is the most common wasted effort in prompt engineering: adding elaborate scaffolding to a task that was never broken.

**Small models, per the scale finding above.** Test before you assume.

**Closed-book recall.** "What year was X founded?" is a lookup, not a computation. Steps add latency and create opportunities for a hallucinated intermediate to contaminate a correct recall.

The rule you can carry forward: **chain-of-thought helps when the task decomposes into dependent intermediate results and the model has the per-step competence to produce them.** If either condition fails, it ranges from useless to harmful.

### Part 3 — Sampling the same problem many times and voting

Self-consistency (Wang et al., 2022, arXiv:2203.11171) starts from an observation about what a chain of thought actually is: **there are many valid reasoning paths to the same answer.** A model sampling with temperature above zero will take different routes on repeated draws — different orderings, different groupings, occasionally a different (wrong) route.

If the routes are diverse but the *answer* is constrained, then errors are likely to be idiosyncratic while correct answers converge. So: sample several chains at non-zero temperature, extract the final answer from each, and return the majority answer. The paper reported substantial improvements over greedy chain-of-thought decoding across several reasoning benchmarks. The mechanism is a vote, and it exploits the fact that consensual wrongness is rarer than individual wrongness.

Two properties you should hold precisely.

**It is a decode-time ensemble.** Nothing is trained, nothing is stored, and the model is unchanged. You spend more inference to buy accuracy at the output.

**It is domain-specific in a way that is easy to miss.** A majority vote requires that the samples produce *comparable answers that can be tallied*. Numbers, short expressions, multiple-choice letters, yes/no — these vote cleanly. Ask for a poem, a summary, or an open-ended explanation and there is no majority to take, because ten samples produce ten different strings. Self-consistency does **not** work for free-form generation. It is a technique for tasks with a small, checkable answer space.

The whole technique is short enough to write out. Note the two moving parts: the prompt must force each chain to end in a *machine-extractable* answer, and the vote must be over that extracted value rather than over the prose.

```text
PROMPT (one sample, repeated N times at temperature > 0):

  Solve the problem below. Show your steps.
  End your response with exactly one line in this form:
  ANSWER: <the final value, nothing else>

  Problem: <your problem here>

COLLECT:
  answers = [extract(line after "ANSWER:") for each of the N responses]

VOTE:
  final = the value appearing most often in answers
  agreement = (count of final) / N      <- report this, always
```

Two details that decide whether this works. **The extraction must be reliable** — if the format drifts, your regex silently grabs the wrong string and you are voting on noise. **Always report the agreement fraction alongside the answer.** Nine out of ten is a strong consensus; four out of ten with six different alternatives means the model is guessing and the majority is close to arbitrary. An answer without its agreement number is a number you cannot interpret.

#### The cost, and the free-tier consequence

Self-consistency costs roughly the sample count times a single chain: if one chain-of-thought call is *C* tokens of output, ten samples cost about 10*C*. That is the whole tradeoff, stated plainly — you are buying accuracy with a linear multiple of compute.

On a metered free tier this is the technique most likely to burn your day's quota. The practical mitigations, in order of how much I would actually do them:

- Measure the per-call cost first (task 7). Guessing that it "should be fine" is how people discover their quota by hitting it.
- Use a **local model** for the sampling. If you have a laptop that can run a small model through Ollama, the marginal cost of ten samples is electricity. This is the single best $0-budget move in this phase.
- Sample fewer times. The vote's benefit flattens as you add samples; five is often enough to see whether the technique works on your task before you commit to twenty.
- Sample the *answer*, not the essay. Keep each chain short by instructing a concise step format. Halving each chain halves the whole experiment.

#### Where this stops working

**Free-form output.** Covered above, and it is not a minor caveat — it eliminates most creative and most open-ended writing tasks outright.

**When the temperature is zero.** If sampling is deterministic, every draw is identical and the vote is unanimous over one path. Self-consistency needs diversity to exploit. If your provider routes you to greedy decoding regardless of the temperature parameter, you will get ten copies of the same wrong answer and conclude the technique failed when in fact you never ran it.

**When the errors are systematic.** The vote assumes wrong answers scatter. If the model has a consistent misconception — a wrong formula it always applies — every sample applies it, the majority is confidently wrong, and you have paid ten times for the same error. Consensus is evidence, not proof.

**Short numerical chains where the answer is one token of work.** For trivial arithmetic, the one-pass answer is usually right already and the vote is pure expense.

### Part 4 — Decomposition, search, and reflection

Three techniques each attack a different part of the problem. Learn what each one is actually for, because they get recommended interchangeably online and they are not interchangeable.

#### Least-to-most prompting

Zhou et al. (2022), arXiv:2205.10625. The mechanism is two phases: first ask the model to **decompose** the problem into a list of simpler subproblems ordered from easiest to hardest; then ask it to **solve them in sequence**, where each solution is shown to the model when it tackles the next subproblem.

The point is the ordering and the carry-forward. Easy-first means the model builds on solved ground rather than attempting the hard step cold, and the explicit subproblem list keeps later steps conditioned on earlier results instead of re-deriving them.

It is strongest on tasks with genuine compositional structure: word problems whose data must be assembled in stages, multi-hop questions, any task you would yourself solve by making a list. It is one or two extra calls, so it is far cheaper than sampling.

The two calls look like this. The first is deliberately kept abstract — that is the design decision that stops the leak.

```text
CALL 1 — decompose (do NOT supply the concrete values):

  To answer the question below, what sub-questions must be answered?
  List them from easiest to hardest, in order.
  Give the sub-questions only. Do not answer them, and do not
  substitute any numbers from the problem.

  Question: <your question here>

CALL 2 — solve in sequence, carrying results forward:

  Question: <your question here>
  Sub-questions:
    <output of call 1>

  Answer sub-question 1. Then use that result to answer
  sub-question 2. Continue in order, showing each result.
  Then give the final answer.
```

**Where it stops working.** The decomposition is itself a generated artefact and can be wrong — a missing subproblem, or a misordered one, propagates through every later step. And there is a specific failure worth guarding against: **the decompose step should not solve the problem.** If your decomposition prompt hands the model the concrete quantities it needs, you have leaked the answer into step one and the sequence is decorative. Ask for *what needs to be found out*, in general form, before you ask for the numbers. Task 11 makes you run both versions side by side so you can see the difference rather than take it on faith.

#### Tree-of-thoughts

Yao et al. (2023), arXiv:2305.10601. Chain-of-thought is a single path. Tree-of-thoughts makes the model generate several candidate partial solutions at each step, evaluates them, and searches — keeping promising branches, abandoning dead ones, possibly backtracking.

This is genuinely more powerful in the sense that it can recover from a wrong early commitment, which a single chain cannot. It is also expensive and fiddly: multiple generations per node, an evaluation step that is itself a model call and itself fallible, a search policy you have to choose, and a budget you have to set. The claimed gains come with real inference cost, and the technique requires you to build scaffolding around the model rather than write a better sentence.

**My honest assessment, which is the one you should carry:** tree-of-thoughts is a research technique and a good idea to understand, not a default to reach for. If you are solving puzzles with verifiable intermediate states and you have budget, it is the right tool. For the ordinary tasks in this curriculum — summarising, extracting, classifying, drafting, answering questions over documents — it is machinery you will not pay back. Knowing *why* it exists (single chains cannot backtrack) is more valuable than using it.

#### Reflexion

Shinn et al. (2023), arXiv:2303.11366. The model attempts a task, receives feedback about what went wrong, writes a verbal reflection on the failure, and that reflection is stored and supplied on the next attempt. The framing in the paper is verbal reinforcement learning: the "gradient" is text.

Two things determine whether this works, and only one of them is in your control.

**The feedback signal must carry information.** "That was wrong, try again" teaches nothing; the model has no new input. "Your answer claimed the total was 48 but the intermediate sum of the listed items is 52" gives the model something to condition on. Reflexion without a real error signal is a loop that regenerates variations and calls the variation improvement.

**The critique must be about the process, not the tone.** You want "the third step skipped a unit conversion," not "the answer could be clearer." Ask for the critique in the form of a specific defect and a specific fix.

**Where it stops working.** When you have no way to tell a right answer from a wrong one, the loop has no signal — and a model asked to critique its own work will produce a confident, plausible critique of a perfectly good answer, then "improve" it into something worse. Self-critique without ground truth is not verification; it is another generation.

### Part 5 — Reasoning models changed the default, and here is the mechanism

Everything above assumes you must elicit reasoning from a model that will not do it otherwise. Models that reason internally before answering — the "thinking" class, as of 2026-09 — change that assumption.

**What is different.** These models are trained to produce a long internal reasoning span before committing to an answer, and they are trained on tasks where that helps. The number of serial steps spent before the answer is a learned behaviour, and some providers let you control it with a parameter that trades latency and cost against depth.

This has a direct, practical consequence.

> **On a modern reasoning model, explicit chain-of-thought instruction is largely redundant, and can be counterproductive.**

Redundant, because the model is already producing the steps — your "think step by step" adds tokens without adding computation the model was not going to do anyway.

Counterproductive, and this is the part that surprises people, because several providers' current guidance warns against prescribing *how* such a model should reason. You are not improving its scratchpad; you are interfering with a process that was trained end to end. At best you duplicate work. At worst you impose a decomposition the model would not have chosen, and you get a worse answer from a more expensive call.

Two things that remain true and useful on these models:

**Structure still helps. Steps do not.** If you need the answer in a particular shape, ask for the shape. Specifying your output format is not telling the model how to think.

**Date this guidance and re-check it.** The position on this has moved more than once and is provider-specific. As of 2026-09, the practical habit is: check your provider's current prompt-engineering documentation before adding reasoning instructions to a reasoning model, and record the date you checked. Task 10 makes you do exactly that rather than take my word for it.

#### Which technique, for which task and model class

This is the table to keep. Read the "why" column as the mechanism, not as an opinion.

| Task shape | Non-reasoning model | Reasoning model | Why |
|---|---|---|---|
| Multi-step arithmetic or logic with a checkable answer | Chain-of-thought, or self-consistency if accuracy matters more than cost | Ask directly; consider raising the reasoning budget instead | The steps are already generated; voting still works if you can afford it |
| Classification, extraction, labelling | **No chain-of-thought** | **No explicit chain-of-thought** | No intermediate results exist; extra text is drift surface |
| Multi-hop question over several documents | Least-to-most, or CoT over retrieved passages | Retrieve well, then ask directly | The hard part is which facts to combine, so make decomposition explicit for non-reasoning models |
| Free-form writing, summaries, explanations | Direct, with format constraints | Direct, with format constraints | There is no answer to vote on, so self-consistency does not apply |
| Planning with clear subgoals | Least-to-most | Ask directly with the subgoal structure stated | Decomposition is the useful part; let the model order its own steps |
| Puzzle with verifiable intermediate states, and budget | Tree-of-thoughts | Constrain the reasoning budget and iterate | Only worth it where partial states can be scored |
| Task with an automatic checker (tests, schema, unit tests) | Reflexion with the checker's output | Reflexion with the checker's output | The signal is real, so revision has something to condition on |
| Task with no ground truth at all | Direct; do not self-critique | Direct; do not self-critique | Critique without a signal is another generation, not verification |

The row I want you to internalise is the second-to-last. **Reflexion is worth it exactly to the extent that your feedback carries information.** The presence of a real checker — a compiler, a test suite, a schema validator, a calculator — is what turns reflection from a ritual into a loop. That is also the bridge to the rest of this track: the moment your "feedback" is produced by a model rather than by an oracle, you are back in Part 6.

### Part 6 — A chain of thought is text, not a log

Now the most important idea in the phase.

When a model writes "First I compute 12 × 4 = 48, then I add 9 to get 57," you are reading generated text. It was produced by the same next-token process that produces a poem. It is **not** a readout of the model's internal computation, because there is no such readout — the computation that produced the final answer is what happened across the layers when each token was chosen, and the words are a parallel output stream, not a transcript of it.

These two things come apart, and when they do, the fluent explanation is the more misleading of the two.

**The stated reasoning can be post-hoc.** The model may produce the final answer through mechanisms the chain does not mention — a memorised association, a strong prior from the prompt's framing, a pattern in the options — and then generate a plausible chain that appears to justify it. The chain reads like a derivation. It is an explanation-shaped continuation.

**The stated reasoning can be wrong while the answer is right.** Models frequently produce correct answers with flawed or irrelevant intermediate steps. From the outside this looks like the chain "worked." It did not; the answer came from somewhere else and you got lucky about which.

**Changing the reasoning need not change the answer.** This is the experiment that makes the point stick, and it is in your task list. Perturb the chain — reorder the examples in the prompt, tweak the wording, insert a filler sentence that should matter if the chain were causally in charge — and watch the final answer stay put. If the chain were the computation, editing it would move the answer.

```text
Baseline prompt  -> answer A0, chain C0
Variant 1: reorder the worked examples in the prompt
Variant 2: reword the intermediate steps without changing values
Variant 3: insert one irrelevant sentence before the question

For each variant, record:  final answer, and the step sequence.

Interpreting the four outcomes:
  answer changes, chain changes   -> the chain plausibly did the work
  answer same,    chain changes   -> the chain is not the computation
                                     (this is the interesting cell)
  answer changes, chain same      -> something other than the chain is in charge
  both same                       -> the perturbation was too weak to conclude anything
```

The third row is the one people forget, and it is why a single perturbation is weak evidence. Run several variants and count how often the answer holds while the steps move. That count is your result, and it is a far more honest artefact than a paragraph asserting that chains are unfaithful.

**And the reverse: the chain can be made to say what you want and the answer follows.** Which is the safety-relevant direction. A model that will produce a chain arguing for a conclusion is not evidence that it reasoned its way there.

#### What this means for how you work

**Evaluate answers, not explanations.** The deliverable of a CoT prompt is a more accurate answer. The steps are a means, not an artefact to audit. If your process rewards prompts whose chains read well, you are selecting for readability — and readability is cheap to generate and uncorrelated with correctness.

**Never use a chain as evidence of correctness.** "It showed its work" is not a verification. The only verifications are external: a calculator, a test, a schema, a second independent method, a human who knows the domain.

**Do not build chains into audit trails.** If you are producing reasoning traces for a regulated process or for a user-facing "here's why," understand that you are publishing generated text, not a decision record. It may be a useful summary of the answer. It is not a record of how the answer was produced.

**Ask for the chain when you want a better answer, not when you want to check one.** Those are different objectives and this technique serves only the first.

**Use a chain to spot-check, not to certify.** Reading a chain can surface a wrong assumption — "it used last year's rate." That is a debugging aid and it is genuinely useful. It is not proof, and a chain with no visible flaw is not a correct answer.

The honest summary of this whole phase: chain-of-thought gives the model more serial computation by letting it write intermediate results into its own context. That is a real and useful mechanism. The written chain is the *vehicle* for that computation, not a window into it. Techniques that add diversity (self-consistency), structure (least-to-most), or search (tree-of-thoughts) change how the computation is organised. None of them turn the resulting text into a truthful account of itself. Build on the answer, verify externally, and treat the reasoning as scaffolding that has already done its job.

---

## Hands-on practice tasks

1. Take one arithmetic word problem you can check by hand. Prompt a non-reasoning model three ways: direct answer only, "show your work then give the final answer," and the zero-shot elicitation phrase. Record all three answers and correct them. <!-- id: prompt-03-chain-of-thought-and-reasoning-t01 band: quick energy: low -->
2. Repeat task 1 on a classification task — sentiment, intent, or category labels for twenty short texts. Note whether chain-of-thought helped, did nothing, or hurt. Report the accuracy for both prompt styles. <!-- id: prompt-03-chain-of-thought-and-reasoning-t02 band: focused energy: normal -->
3. Build the comparison matrix: rows are the techniques (direct, zero-shot CoT, few-shot CoT, least-to-most, self-consistency, reflexion), columns are accuracy, total tokens, number of calls, and wall-clock time. Fill it from your own runs on two tasks of different shapes. <!-- id: prompt-03-chain-of-thought-and-reasoning-t03 band: deep energy: high -->
4. Write a script that sends the same reasoning problem N times at a temperature above zero, extracts the final answer from each response with a regex or a tagged field, and prints the tally. Run it at N equal to 5, 10, and 20 and record how the majority answer and the agreement fraction change. <!-- id: prompt-03-chain-of-thought-and-reasoning-t04 band: deep energy: high -->
5. Take a free-form task — a poem, a product description, a summary — and apply the same voting procedure you used in task 4. Report what happens when you try to tally the outputs, and write down the exact reason self-consistency does not apply here. <!-- id: prompt-03-chain-of-thought-and-reasoning-t05 band: focused energy: normal -->
6. Move task 4 to a local model through Ollama so the sampling is unmetered. Run twenty samples and note both the vote result and how long it took on your hardware. <!-- id: prompt-03-chain-of-thought-and-reasoning-t06 band: focused energy: normal -->
7. Measure the cost multiplier of every technique you tried: count the output tokens for one direct answer, one chain-of-thought answer, and one ten-sample self-consistency run. Express each as a multiple of the direct answer and write the numbers down. <!-- id: prompt-03-chain-of-thought-and-reasoning-t07 band: focused energy: normal -->
8. Take the same two prompts — direct and chain-of-thought — to a small model and a large model. Record whether the CoT gain appears in both, in only the large one, or in neither. This is the scale-dependence test; report it as your own measurement. <!-- id: prompt-03-chain-of-thought-and-reasoning-t08 band: deep energy: high -->
9. Run the faithfulness experiment: ask the same reasoning question several times with the prompt's examples shuffled or with a filler sentence inserted. Record how often the final answer stays the same while the intermediate steps change. Then take one response whose answer is correct and mark each step as necessary, irrelevant, or wrong. <!-- id: prompt-03-chain-of-thought-and-reasoning-t09 band: deep energy: high -->
10. Find your provider's current guidance on prompting reasoning or thinking models, note the date you read it, and write two sentences on where it agrees or disagrees with what this lesson said. Do not record a version number as a permanent fact; record what you read and when. <!-- id: prompt-03-chain-of-thought-and-reasoning-t10 band: focused energy: normal -->
11. Apply least-to-most to a multi-hop question over two or three documents. Then run the same decomposition where the first step is given the concrete quantities, and compare. Write down which version leaked the answer. <!-- id: prompt-03-chain-of-thought-and-reasoning-t11 band: focused energy: normal -->
12. Write your own task-shape-to-technique table with six rows drawn from work or study you actually do, each row giving the technique, the cost you accept, and the observation that would tell you the choice was wrong. Keep it and revise it every time a technique fails you. <!-- id: prompt-03-chain-of-thought-and-reasoning-t12 band: ongoing energy: low -->

## Common Pitfalls

**Adding "think step by step" to everything.** On classification, extraction, and recall tasks there is no intermediate result to compute. You pay for longer outputs and add surface area for drift. Measure the direct baseline before you add anything.

**Assuming a chain of thought is a faithful computation log.** It is generated text, produced by the same process as any other continuation, and it can be a post-hoc explanation for an answer reached otherwise. Check the answer externally; do not certify it by reading the steps.

**Voting on free-form output.** Self-consistency needs comparable answers to tally. Poems, summaries, and open-ended explanations produce ten different strings and no majority. This is a domain limit, not an implementation detail.

**Running self-consistency at temperature zero.** Identical samples make a unanimous vote over one path. If your provider decodes greedily regardless of the parameter, you have not run the technique — you have run the same call ten times and paid ten times.

**Ignoring the linear cost of sampling.** Ten samples cost about ten chains. On a metered free tier this is the fastest way to lose a day's quota; sample locally if you can, and measure the per-call cost before committing to a large N.

**Believing the majority must be right.** The vote exploits errors being scattered. A consistent misconception is a unanimous wrong answer, and consensus is evidence rather than proof.

**Letting the decomposition step do the work.** If your least-to-most prompt supplies the concrete quantities in the first call, the ordered solution sequence is theatre. Ask what needs to be found before you ask for the numbers.

**Reaching for tree-of-thoughts by default.** It is expensive, needs a scoring step that is itself fallible, and needs a search policy and a budget. Know why it exists; use it when you have verifiable partial states and the budget to spend on them.

**Running reflexion with no error signal.** "Try again, that was wrong" gives the model nothing new to condition on, and self-critique with no ground truth rewrites good answers into different ones. Reflection is worth exactly what your feedback carries.

**Telling a reasoning model how to think.** As of 2026-09, several providers advise against prescribing reasoning steps for models that already reason internally. Ask for the output format you need and let the model choose its own process. Check current guidance, and date your check.

**Treating a well-formatted chain as evidence for a regulation or an audit.** You are publishing generated text. It may summarise the answer usefully; it is not a decision record. Say so plainly to anyone who asks for one.

**Choosing a technique by reputation instead of by task shape.** The right question is never "which technique is best" but "does this task decompose into dependent intermediate results, and can the answer be compared across samples." Answer those two and the technique picks itself.

## Deliverable / proof of work

Write `portfolio/prompting/03-chain-of-thought-and-reasoning.md` containing:

- **Your technique comparison matrix** from task 3 — six techniques against two task shapes, with accuracy, total tokens, call count, and wall-clock time from your own runs, and one sentence on which cell surprised you
- **Your cost multipliers** from task 7 — direct vs chain-of-thought vs ten-sample self-consistency, as multiples, with the token counts they came from
- **Your voting results** from tasks 4 and 5 — the tally at N equal to 5, 10, and 20, the agreement fraction at each, and your one-paragraph explanation of why the free-form task cannot be voted on
- **Your scale-dependence result** from task 8, written as a claim you can defend, including the case where the small model did not improve
- **Your faithfulness report** from task 9 — the answer-stability count across perturbations, plus one marked-up response whose answer was correct and whose steps were not
- **Your provider-guidance note** from task 10, including the date you read it and where it disagrees with this lesson
- **A task-shape-to-technique table** with six rows from your own work or study, each with the technique, the cost accepted, and the observation that would prove the choice wrong
- **A short section titled "What I will not use a chain of thought for"** — the task classes where you measured no benefit or a loss, so future-you does not re-litigate them

## Checklist

- [ ] I can explain why a fixed-depth per-token computation makes intermediate steps useful <!-- id: prompt-03-chain-of-thought-and-reasoning-c01 energy: normal -->
- [ ] I can explain why the chain must be generated rather than merely implied <!-- id: prompt-03-chain-of-thought-and-reasoning-c02 energy: normal -->
- [ ] I can state the scale-dependence finding without overstating it <!-- id: prompt-03-chain-of-thought-and-reasoning-c03 energy: normal -->
- [ ] I can describe what the zero-shot elicitation phrase does to the next-token distribution <!-- id: prompt-03-chain-of-thought-and-reasoning-c04 energy: normal -->
- [ ] I know which task classes gain nothing from chain-of-thought, and I measured at least one <!-- id: prompt-03-chain-of-thought-and-reasoning-c05 energy: normal -->
- [ ] I can state the two conditions self-consistency requires: a comparable answer space and non-zero sampling diversity <!-- id: prompt-03-chain-of-thought-and-reasoning-c06 energy: normal -->
- [ ] I know my own measured token multiplier for ten-sample self-consistency <!-- id: prompt-03-chain-of-thought-and-reasoning-c07 energy: low -->
- [ ] I can explain why self-consistency cannot be applied to free-form generation <!-- id: prompt-03-chain-of-thought-and-reasoning-c08 energy: normal -->
- [ ] I can write a least-to-most decomposition that does not leak the answer <!-- id: prompt-03-chain-of-thought-and-reasoning-c09 energy: normal -->
- [ ] I can say why tree-of-thoughts exists without recommending it as a default <!-- id: prompt-03-chain-of-thought-and-reasoning-c10 energy: normal -->
- [ ] I can name what makes a reflexion loop worth running, and what makes it a ritual <!-- id: prompt-03-chain-of-thought-and-reasoning-c11 energy: normal -->
- [ ] I have run the faithfulness experiment and can describe what it established <!-- id: prompt-03-chain-of-thought-and-reasoning-c12 energy: high -->
- [ ] I never treat a chain of thought as proof that an answer is correct <!-- id: prompt-03-chain-of-thought-and-reasoning-c13 energy: normal -->
- [ ] I know the current position of at least one provider on prompting reasoning models, and the date I checked <!-- id: prompt-03-chain-of-thought-and-reasoning-c14 energy: low -->
- [ ] I can choose a technique from task shape and model class rather than from reputation <!-- id: prompt-03-chain-of-thought-and-reasoning-c15 energy: normal -->

## Quiz

### Q1. Why does writing out intermediate steps improve a model's answer on a multi-step problem? <!-- id: prompt-03-chain-of-thought-and-reasoning-q01 energy: high -->

- [ ] The written steps are read by a separate reasoning module that corrects errors
- [x] Each generated step becomes input that later positions attend to, so the computation is spread across more serial operations than one token's fixed-depth pass allows
- [ ] The model searches its training data for a matching worked solution
- [ ] Longer outputs give the model more time to load additional parameters

**Why:** The non-embedding computation for a single token is a bounded-depth circuit, so a problem needing more serial steps than that cannot be finished in one pass. Generating a step writes it into the context, and the next position conditions on it. The chain's length is not a side effect of the mechanism — it *is* the mechanism.

### Q2. You add "think step by step" to a support-ticket classification prompt and accuracy drops. What is the best explanation? <!-- id: prompt-03-chain-of-thought-and-reasoning-q02 energy: high -->

- [x] There are no dependent intermediate results to compute, so the added text is drift surface — generated reasoning can wander before the label is committed
- [ ] The phrase confuses the model because classification tasks have no steps
- [ ] The model needs the phrase in the system prompt rather than the user prompt
- [ ] Classification requires a temperature change alongside the phrase

**Why:** Chain-of-thought pays off when a task decomposes into intermediate results that must be correct before the answer can be. Classification is a mapping, not a computation. You spend tokens and give the model room to reason itself into a different label. Measure the direct baseline first — this is the most commonly wasted effort in prompt engineering.

### Q3. Which task is self-consistency genuinely unable to help with? <!-- id: prompt-03-chain-of-thought-and-reasoning-q03 energy: normal -->

- [ ] Multiple-choice questions with four options
- [ ] Grade-school arithmetic word problems
- [ ] Yes/no entailment decisions
- [x] Writing a product description in a specified tone

**Why:** The technique is a majority vote, and a vote requires comparable answers that can be tallied. Numbers, letters, and short expressions vote cleanly. Ten free-form descriptions are ten different strings with no majority to take. Self-consistency is for tasks with a small, checkable answer space — not an open-ended one.

### Q4. You run self-consistency with ten samples and every response is identical. What most likely happened? <!-- id: prompt-03-chain-of-thought-and-reasoning-q04 energy: normal -->

- [ ] The model memorised the answer during training and refuses to vary
- [ ] Ten samples is below the threshold at which voting becomes meaningful
- [ ] The prompt lacked a worked example, so the chains collapsed to one form
- [x] Sampling was effectively deterministic, so the vote was unanimous over a single path and the technique never ran

**Why:** Self-consistency buys accuracy by exploiting diversity across sampled paths. With greedy or near-greedy decoding, every draw is the same draw. If your provider decodes greedily regardless of the temperature parameter, you have made the same call ten times and paid ten times for one sample's information.

### Q5. In a least-to-most prompt, which decomposition is correctly written? <!-- id: prompt-03-chain-of-thought-and-reasoning-q05 energy: normal -->

- [x] "List the sub-questions that must be answered to solve this, from easiest to hardest, without solving them"
- [ ] "List the sub-questions and give the numeric value each one needs"
- [ ] "State the final answer first, then list the steps that produce it"
- [ ] "Rewrite the problem using smaller numbers so it is easier"

**Why:** The whole value of the technique is that the model assembles each stage's result before facing the next. If the decomposition already supplies the concrete quantities, the ordered solution sequence is decorative — you leaked the answer into step one. A list of sub-questions in general form keeps the actual work in the solving phase.

### Q6. Why is tree-of-thoughts not the default technique you should reach for? <!-- id: prompt-03-chain-of-thought-and-reasoning-q06 energy: high -->

- [ ] It only works on mathematical tasks and has no other use
- [x] It requires many generations per node plus an evaluation step and a search policy, so it is expensive and needs scaffolding — worth it only where partial solutions can actually be scored
- [ ] It has been superseded and no longer works on current models
- [ ] It requires fine-tuning and cannot be used with a hosted API

**Why:** Tree-of-thoughts exists because a single chain cannot backtrack past a wrong early commitment, and it genuinely fixes that. The cost is real: branching generations, a fallible scoring call, a search policy, and a budget. It is the right tool for puzzles with verifiable intermediate states. For summarising, extracting, classifying, and answering questions over documents, you will not pay it back.

### Q7. Which condition makes a reflexion loop worth running? <!-- id: prompt-03-chain-of-thought-and-reasoning-q07 energy: normal -->

- [ ] Asking the model to reflect twice rather than once
- [ ] Setting the temperature high so each attempt differs
- [ ] Instructing the model to be self-critical and honest
- [x] Having real feedback that carries information, such as a failing test, a schema violation, or an arithmetic check

**Why:** Reflection works to the extent that the critique supplies something the model can condition on. "That was wrong, try again" adds nothing, and self-critique without ground truth tends to rewrite good answers into merely different ones. The presence of an external checker — tests, a validator, a calculator — is what turns the loop from a ritual into a mechanism.

### Q8. A model returns the correct final answer with an intermediate step that is plainly wrong. What does this tell you? <!-- id: prompt-03-chain-of-thought-and-reasoning-q08 energy: high -->

- [x] The model must have used a different, hidden method that the step misrepresents — treat the chain as an explanation rather than a computation log
- [ ] The model computed the answer correctly and made a typographical error in the step
- [ ] The answer is unreliable and should be discarded even though it is correct
- [ ] Nothing; chains are random and carry no information at all

**Why:** The chain is generated text from the same next-token process as any other continuation, not a readout of the internal computation. A correct answer produced alongside a wrong step is direct evidence that the two come apart, and that reading the reasoning is not the same as verifying the answer. The correct response is to verify externally, not to trust or to discard on the basis of the prose.

### Q9. As of 2026-09, what is the defensible approach to a prompt for a model that already reasons internally before answering? <!-- id: prompt-03-chain-of-thought-and-reasoning-q09 energy: normal -->

- [ ] Always prepend the zero-shot elicitation phrase, since it is free
- [ ] Never request reasoning steps, because reasoning models ignore instructions entirely
- [x] State the output format and constraints you need, skip instructions on how to reason, and check the provider's current guidance rather than treating any of this as permanent
- [ ] Write the steps yourself in the prompt so the model only has to follow them

**Why:** These models already perform the serial computation the chain would have elicited, so explicit chain-of-thought instruction is largely redundant and can interfere with a process trained end to end. Several providers advise against prescribing reasoning steps. Format instructions are different — they constrain the result, not the process. Because this guidance is recent and moves, date your check instead of memorising a rule.

## You're ready to move on when...

You can look at a task you have never seen and say, before running anything, whether it decomposes into dependent intermediate results and whether its answers can be compared across samples — and pick a technique from those two answers rather than from what is fashionable. You can write a chain-of-thought prompt, a least-to-most decomposition that does not leak the answer, and a sample-and-vote script that extracts and tallies answers correctly. You can state the token multiplier of each technique in your own measurements, not in mine. You can explain, without notes, why a chain of thought is generated text rather than a log of computation, and give an experiment you ran that shows the two coming apart. And you can say plainly which tasks you have stopped adding reasoning instructions to, and why.

## Free vs Paid

### What's free is enough

Every technique in this phase is a prompting pattern, not a product. Chain-of-thought, zero-shot elicitation, least-to-most, and reflexion are text you type. Nothing in the mechanism is gated behind a subscription, and the papers are on arXiv for free.

The measurement work is free too, with one caveat that this phase takes seriously. Self-consistency's cost is a linear multiple of the sample count, which is exactly the kind of technique that eats a metered free tier. The answer is not to skip it — it is the most interesting technique here — but to run it where the marginal cost is zero. **Ollama running a small model on your own laptop makes task 6 free in money and expensive only in your own patience.** Run the sample-and-vote loop locally, watch the vote tally, and you have learned the mechanism without spending quota. Do the same experiment on a hosted free tier once, with a small N, so you can see the difference between a small local model and a large hosted one.

The provider free tiers also make the scale-dependence test in task 8 possible at no cost, provided the tier exposes more than one model size. Google AI Studio is convenient here because it does; if yours does not, a local model at two different sizes covers the same ground.

The one thing free tiers do not reliably give you is **thinking-model access**, which is what task 10 is about. Free chat interfaces often do expose a reasoning mode, and that is enough to feel the difference: ask a reasoning model to think step by step and watch it produce a longer answer without a better one.

### What a paid tier adds

A paid API tier removes the rate limits that make experimentation with N equal to 20 annoying, and it gives you adjustable reasoning budgets so you can trade latency and cost against depth directly — the parameter that replaces prompt-level chain-of-thought on reasoning models. It also gets you access to the largest reasoning models, which is where the scale-dependence question stops being academic.

### When it's worth paying

**Not for this phase.** If you are on a $0 budget, the local-model path covers every experiment in the task list, and the token-cost arithmetic you are practising is provider-independent — a measured multiplier from a local model is as valid a lesson as one from a hosted API.

Two honest exceptions. If you already pay for API access, spend a little of it here on task 11's multi-document decomposition, because long-context behaviour differs enough between models that a single local result can mislead you. And if you are repeatedly hitting rate limits hard enough that your experiment loop stalls — which is common when you run self-consistency on a free tier — the smallest paid tier is a fair purchase. But check first whether the fix is simply moving the sampling to your own machine, which costs nothing but time.

The threshold that actually matters: pay when you have a task where a wrong answer costs you something real, and the reasoning-budget parameter on a hosted reasoning model lets you buy accuracy you can measure. That is a deliberate purchase. Paying to run twenty samples of a toy arithmetic problem is not.
