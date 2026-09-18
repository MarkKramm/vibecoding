---
id: intern-06-model-landscape
track: model-internals
phase: 6
order: 60
title: The Model Landscape and Scaling
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/model-internals/06-model-landscape.md
exit_criteria: >
  You can explain what parameter count does and does not predict, describe in
  your own words what the scaling-law results established and what the
  compute-optimal shift changed, distinguish total parameters from active
  parameters in a mixture-of-experts model, state precisely what open weights do
  and do not include, and pick a model for a real task by running a shortlist
  through your own small eval set and comparing cost per successful task rather
  than cost per token — including naming where benchmarks and leaderboards would
  have misled you.
---

# Phase 6 — The Model Landscape and Scaling

## Goal of this phase

Learn to choose a model without memorising anything that expires. Every leaderboard you can look up today will be misleading within weeks, and the model names in any list you write down will be wrong within months. What does not expire is the reasoning: what parameter count actually predicts, what the scaling results established, why mixture-of-experts breaks the simple relationship between size and cost, what "open weights" genuinely gives you, and how to run a small honest evaluation of your own.

Phase 5 in this track taught you to look inside a model; this phase teaches you to look at a shelf of them and decide. The last two parts are the ones that pay: a decision procedure you can execute in an afternoon, and a clear account of the ways benchmarks and leaderboards lie to you. By Friday you will have picked a model for a real task you care about, on evidence you generated yourself, and you will be able to say why the popular choice was or was not the right one.

If you have read the Foundations track, you already know what a token, a context window, a sampler and an API call are. Nothing here assumes that track is open in front of you.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Roughly 6–9 hours total. Reading the lesson is about two hours. The rest is the deliverable, and the deliverable is where the learning is: building a 30-item eval set, running a shortlist through it, and computing cost per successful task. Plan for the eval run to take longer than you expect the first time — it always does, and the reason is instructive.

One warning about pacing. This phase has a strong temptation built into it: reading about models is pleasant and feels like progress, and the news about models is endless. **Reading the landscape is not the skill. Choosing on evidence is the skill.** If you find yourself on day three still reading announcements, stop and go build the eval set.

## Skills you'll gain

- Explain what parameter count predicts (capacity, memory footprint at a given precision, rough latency class) and what it does not predict (quality, instruction-following, honesty, suitability for your task)
- Describe what the early scaling laws established, and explain why the compute-optimal result changed what labs did rather than merely adding a number
- Distinguish dense from mixture-of-experts models, and explain why total parameters and per-token compute can differ by an order of magnitude in the same model
- Say why a sparse model is a memory problem and a compute bargain at the same time, and what that implies for your hardware
- Separate base, instruct and reasoning models by their training objective rather than by their names, and predict which one suits a given task
- Explain test-time compute as a second scaling axis, and say on which kinds of task it buys accuracy and on which it does not
- State exactly what open weights include and what they almost never include — and therefore what "open" does and does not let you verify
- Build a small task-specific eval set and run a shortlist of candidate models through it
- Explain the three mechanisms by which benchmarks mislead: contamination, saturation, and task mismatch
- Compute cost per successful task, and explain why it can rank models in the opposite order to cost per token
- Execute a decision procedure that produces a defensible choice, with a dated record, that you can re-run when the landscape moves

## Specific topics to learn

### What size means

- Parameters as stored numbers, and the memory arithmetic at different precisions
- Total parameters versus what actually runs per token
- Capacity as a property of count, and why capacity is not capability
- Scaling laws as power laws: smooth, predictable loss curves over many orders of magnitude
- The compute-optimal result: parameters and tokens are two budgets, not one
- Why the field's centre of gravity moved toward more tokens rather than always more parameters
- Where scaling laws stop describing what you care about — loss is not task success

### Sparsity

- Mixture-of-experts routing: a gate, a small number of selected experts, and the rest idle
- Total parameters versus active parameters per token, and the memory/compute split that follows
- Why MoE is cheap to run and expensive to host
- Routing behaviour as the source of MoE failure modes
- Why "how big is it" is not one number

### Training stage and behaviour

- Pretraining as next-token prediction: the base model
- Instruction tuning and preference optimisation: the instruct model, and what changes
- Reasoning models: extended internal computation before the answer, and separately trained behaviour
- Test-time compute as a second scaling axis, and its task dependence
- Multimodal models: one model, several input encoders, and where the seams show

### Openness

- What open weights include: the parameters themselves
- What they usually do not include: the data, the code, the training recipe, the evaluation detail
- Licence terms that restrict use, and why "open weights" is not "open source"
- What you can and cannot verify about an open-weight model
- Which constraints push you toward local weights regardless of quality

### Choosing

- Shortlisting by structural requirement before shortlisting by quality
- Benchmarks and their three failure mechanisms: contamination, saturation, task mismatch
- Leaderboards, their aggregation choices, and who submits entries
- Building a small eval set from your own task, with a scoring rule that is not your own judgement in the moment
- Cost per token versus cost per successful task, and why they disagree
- Recording the choice with its date so it can be revisited deliberately

## Tools for This Phase

Every tool in this table has a free path, and the free path is enough to complete the phase. This is a phase about judgement, and judgement is cheap to practise.

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Hugging Face Hub | Inspect model cards, parameter counts, configuration files and licences | Freemium | https://huggingface.co/models | Look up the exact config of two models on your shortlist and record their parameter counts | Browsing and downloading public model cards, configs and files requires no account and no payment |
| Hugging Face Open LLM Leaderboard | See how evaluation on standard benchmarks is presented, and its caveats | Free | https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard | Read the methodology section and note one thing it does not measure | Open weights and local inference |
| LMArena | Observe preference-based ranking and how it differs from benchmark scoring | Free | https://lmarena.ai | Compare its ordering of two models you shortlisted against your own eval results | Direct pairwise assessment on your own eval set |
| Artificial Analysis | Compare latency, throughput and price across providers in one place | Freemium | https://artificialanalysis.ai | Record independent throughput and price measurements for two candidates in one sitting | Provider pricing pages, your own timing script |
| OpenRouter | Reach many models through one compatible endpoint, useful for running a shortlist | Freemium | https://openrouter.ai/models | Send the same eval prompt to three candidate models with one script | Providers' own free tiers, or local models via Ollama |
| Ollama | Run open-weight models locally with no key and no per-token cost | Free | https://ollama.com | Run your eval set against a local model as the zero-cost baseline | It is the free alternative |
| llama.cpp | Run quantised open-weight models on ordinary hardware, including CPU-only laptops | Free | https://github.com/ggml-org/llama.cpp | Run one quantised model locally and measure tokens per second on your own machine | It is the free alternative |
| vLLM | Serve open-weight models efficiently on a GPU you rent or own | Free | https://github.com/vllm-project/vllm | Only if you have GPU access: serve one model and compare throughput against your Ollama baseline | Ollama or llama.cpp for single-user local use |
| OpenAI token counting endpoint | Count tokens for a specific model exactly, before you spend anything | Freemium | https://platform.openai.com/docs/api-reference/responses/input-tokens | Measure the real token cost of one eval item rather than estimating it | Any local tokeniser library for the model family you are testing |
| Google AI Studio | Free-tier access to hosted models for building evals | Freemium | https://aistudio.google.com | Run a hosted model through your eval set without funding an account | Any provider free tier, or a local model |
| EleutherAI lm-evaluation-harness | Run standard benchmarks yourself instead of trusting a reported number | Free | https://github.com/EleutherAI/lm-evaluation-harness | Run one small benchmark on a model you can host and read the raw output | Reading the model card's reported numbers, with the caveats in Part 6 |
| Papers with Code | Trace a benchmark back to its paper and its stated protocol | Free | https://paperswithcode.com | Find the original paper for one benchmark on your shortlist's card | arXiv directly |

## Free/cheap resources

- **"Scaling Laws for Neural Language Models" (Kaplan et al., 2020)** — https://arxiv.org/abs/2001.08361 — the paper that made loss predictable from compute, data and parameters.
- **"Training Compute-Optimal Large Language Models" (Hoffmann et al., 2022)** — https://arxiv.org/abs/2203.15556 — the Chinchilla paper; read the abstract and the headline figures at minimum, because this is the result that moved the field's centre of gravity.
- **"Scaling Laws for Neural Machine Translation"** — https://arxiv.org/abs/2109.07740 — useful for seeing the same method applied in a different setting.
- **"Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity"** — https://arxiv.org/abs/2101.03961 — the clearest introduction to mixture-of-experts routing in a language model.
- **"Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer"** — https://arxiv.org/abs/1701.06538 — the original MoE-for-neural-networks paper; older but the mechanism is unchanged.
- **"Mixtral of Experts"** — https://arxiv.org/abs/2401.04088 — a worked, published sparse model where you can see the total-versus-active parameter split stated explicitly.
- **"Training language models to follow instructions with human feedback" (InstructGPT)** — https://arxiv.org/abs/2203.02155 — what instruction tuning and preference optimisation actually changed.
- **"Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"** — https://arxiv.org/abs/2201.11903 — the beginning of the test-time-compute thread.
- **"Tree of Thoughts: Deliberate Problem Solving with Large Language Models"** — https://arxiv.org/abs/2305.10601 — where spending more inference compute on search becomes explicit.
- **"Direct Preference Optimization: Your Language Model is Secretly a Reward Model"** — https://arxiv.org/abs/2305.18290 — the preference-tuning method behind many instruct models.
- **"Llama 2: Open Foundation and Fine-Tuned Chat Models"** — https://arxiv.org/abs/2307.09288 — read it with the "what is not included" question in mind; it is a good exercise in what a model card does not tell you.
- **"The Foundation Model Transparency Index"** — https://arxiv.org/abs/2310.12941 — a structured way to ask what a model developer has and has not disclosed.
- **"Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena"** — https://arxiv.org/abs/2306.05685 — read for the stated biases, not the rankings.
- **"Open LLM Leaderboard" documentation** — https://huggingface.co/docs/leaderboards/open_llm_leaderboard/about — how a widely used leaderboard defines what it measures.
- **Hugging Face model cards** — https://huggingface.co/docs/hub/model-cards — the format in which the information you actually need is (or is not) recorded.
- **Ollama model library** — https://ollama.com/library — practical starting points for local models, with size and quantisation visible per entry.
- **Stanford CRFM foundation model reports** — https://crfm.stanford.edu/ — periodic surveys of the ecosystem; useful for seeing how quickly the naming layer turns over.

## Lesson: Why Size Stopped Predicting Quality, and What to Do Instead

### Part 1 — Parameters predict memory, not skill

A parameter is a stored number, and in a dense transformer essentially all of them are used for every token you send. That gives you arithmetic you can do on paper — the one part of this landscape that does not move.

| Precision | Bytes per parameter | 7B model | 70B model | 400B model |
|---|---|---|---|---|
| FP32 | 4 | 28 GB | 280 GB | 1.6 TB |
| FP16 / BF16 | 2 | 14 GB | 140 GB | 800 GB |
| 8-bit quantised | ~1 | ~7 GB | ~70 GB | ~400 GB |
| 4-bit quantised | ~0.5 | ~3.5 GB | ~35 GB | ~200 GB |

**Read that table as a floor, not a specification.** It is weight storage alone. At inference you also hold the KV cache — which grows with context length and batch size — plus activations and runtime overhead. That is why a model whose weights fit in your memory can still fail to run, and why a "4-bit" label is a naming convention rather than a measurement. For the real number, look at the file size.

Do the arithmetic yourself before you trust anyone's table, including this one:

```python
# weight_memory.py — the floor, in decimal GB. 1e9 bytes per GB.
def weight_memory_gb(parameters_billions: float, bits_per_weight: float) -> float:
    return parameters_billions * 1e9 * (bits_per_weight / 8) / 1e9

for name, (params_b, bits) in {
    "7B fp16":      (7,   16),
    "70B fp16":     (70,  16),
    "70B 4-bit":    (70,  4),
    "400B 4-bit":   (400, 4),
}.items():
    print(f"{name:14s} ~{weight_memory_gb(params_b, bits):8.1f} GB of weights")
```

So parameter count reliably predicts three things: **how much memory the weights need, roughly what precision they can be stored at on your hardware, and what latency class you are in.** A larger dense model generates tokens more slowly on the same hardware and holds a larger KV cache at the same context. Size sets your budget; that is the whole of its predictive power.

Parameter count does **not** predict quality in any way you can act on directly. Three reasons, and they compound.

**Capacity is not capability.** More parameters give the model more room to represent distinctions. Whether it represents the distinctions *you* care about depends on what it was trained on and how it was trained afterwards. Two models with identical parameter counts, trained on different data mixes and tuned by different teams, behave like different tools — which is why a model half the size can beat one twice the size on your task.

**Training data is the other budget, and it is invisible from the parameter count.** A model trained on far more tokens than its parameter count would suggest can outperform a larger, less-trained sibling.

**The post-training stage changes behaviour enormously without changing a single parameter.** Instruction tuning and preference optimisation add no capacity; they select which behaviours the existing capacity expresses.

> Parameter count is like engine displacement. It tells you the fuel bill and roughly how hard the thing can pull, and it tells you nothing about whether the car is any good at the drive you are about to make.

That intuition breaks in a specific place: displacement is a physical measurement with a fixed relationship to the machine, whereas parameter count is a *design choice* a lab can spend densely, sparsely, or on a different training-data budget entirely.

**What this lets you predict:** whether a model can run at all on hardware you have, what quantisation you will need to accept, and roughly how fast it will generate. And the shape of a bad recommendation — anyone who tells you a model is better *because* it is bigger is telling you about memory, not about your task.

**Where this stops working:** as a ranking device, immediately. Between two models of similar size the parameter count carries almost no information about which will do better on your work, and between a dense and a sparse model of the same count it carries none at all. Treat it as a hardware filter, never as a quality signal.

---

### Part 2 — Scaling laws made loss predictable, and then moved the target

Why did the field believe in size at all? Because for a period, size worked, with a regularity that was genuinely surprising.

The scaling-law results (Kaplan et al., 2020) showed that test loss falls as a smooth **power law** in model size, dataset size and compute — across many orders of magnitude, with the same shape for different architectures and optimisers. That is the point people miss when they summarise it as "bigger is better". The claim was never vague: it was that **you can fit a curve to a handful of small runs and predict the loss of a run a thousand times larger before you pay for it.** That is why labs could commit enormous budgets with confidence.

Then the second result arrived and complicated it. The compute-optimal work (Hoffmann et al., 2022) concluded that for a fixed compute budget, **parameters and training tokens are two budgets that must be balanced, and the models of the day were badly unbalanced** — too many parameters for the tokens they had seen. The implication: a smaller model trained on substantially more data could match a larger one at the same compute.

This did not contradict the first result. Both are curves over the same three variables; the second asked a different question — *given a fixed compute budget, where do I sit?* — and found the frontier was not where the field had assumed. In practice the centre of gravity moved from "make it bigger" toward "train it on far more data". Vision does not follow the same recipe — image and video models are typically trained on far fewer tokens per parameter, because the data is more redundant — a reminder that these are empirical fits, not laws of nature.

**What this lets you predict:** that two models of the same size can differ enormously in quality because one saw much more text, so a parameter count with no accompanying training-token figure is half a specification. A new model *smaller* than its predecessor is not a downgrade until you know how much data it saw.

**Where this stops working:** the curves predict **loss**, and loss is not what you care about. They say nothing about a specific task, instruction following, honesty, or whether the model will format your JSON correctly. Anyone quoting a scaling law to tell you which model to use has changed the subject. Loss curves are how labs decide what to build; they are not how you decide what to call.

---

### Part 3 — Mixture-of-experts breaks the one number you were using

The memory table in Part 1 assumed a **dense** model: every parameter participates in computing every token. A **mixture-of-experts** model changes that. Its feed-forward layers are replaced by several parallel "expert" sub-networks plus a small **router**. For each token the router picks a small number of experts — commonly one to a handful — and only those run; every other expert sits idle.

The consequence is a split no single parameter count can express:

| Quantity | What it means | What it governs |
|---|---|---|
| Total parameters | Every weight in the model, experts included | Memory needed to hold the model |
| Active parameters per token | Only the weights actually computed for one token | Compute per token, and therefore speed |
| Expert count and top-k | How many experts exist, how many run per token | The ratio between the two rows above |

Take a published, checkable example: **Mixtral 8x7B** (Mistral AI, 2024 — a specific, dated instance, not a current recommendation) has roughly 47 billion total parameters and activates roughly 13 billion per token. The card says so explicitly, and this is exactly the kind of figure you should verify on the card rather than take from a summary — including this one. The shape is what matters: **the model needs the memory of a 47-billion-parameter model and does the arithmetic of a 13-billion-parameter one.**

**Why labs like them.** At a fixed compute budget per token you can afford far more total parameters than you could densely. More parameters means more capacity, and activating only a fraction means you pay for that capacity mostly in memory rather than in speed. On a cluster serving many users, memory is the resource you can buy and per-token compute is the resource that scales with your traffic — so trading the second for the first is a good deal. That is the whole of "cheap to run, expensive to host".

**Why they are awkward on your laptop.** Your constraint is memory. A sparse model demands memory proportional to its *total* parameters while giving you the speed of a much smaller dense model — the worst of both worlds under a fixed memory ceiling.

MoE also brings failure modes dense models do not have, all traceable to routing. **Load balancing** is the headline one: if the router sends most tokens to a few experts, those experts are the bottleneck and the rest of the parameters you paid to store contribute nothing. Training therefore includes auxiliary pressure to spread tokens across experts, and that pressure is a trade-off.

> A mixture-of-experts model is like a large hospital where each patient is seen by two specialists. The building is enormous and its rent is enormous, but the number of doctors actually working per patient is small.

Retire the analogy here: a hospital's specialists are assigned by triage rules that are visible and auditable, whereas a router is a learned function of the token's hidden state. It has no rules you can read, it can change between checkpoints of the same model, and the same word in two similar sentences can route differently.

**What this lets you predict:** that the "7B or 70B?" question is malformed once sparsity is on the table, and that a model advertised with a large number may be faster than a smaller dense one while needing far more memory. It also predicts where sparse models will disappoint you: on tight-memory local hardware, and on any task where you relied on all the capacity being available for every token.

**Where this stops working:** "active parameters" is a compute figure, not a capability figure. Two sparse models with the same active count and different totals will not perform the same, and a sparse model's active count does not place it on the same quality ladder as a dense model with that many parameters.

---

### Part 4 — Base, instruct, reasoning: the training stage is the real axis

Now the axis that is more useful to you than size, and which you can determine from documentation in about two minutes. Models of the same architecture and size come in different **behavioural regimes**, produced by different training stages. Three matter.

**Base (pretrained) models** are trained on one objective: predict the next token. That is all. They are extraordinary completion engines and terrible assistants. Ask a base model a question and it will often continue the *document* rather than answer, because in the text it learned from a question is usually followed by more questions. Run one once if you ever host an open-weight base model: you will understand instruction tuning from the inside.

**Instruct (chat, tuned) models** have gone through additional training — supervised examples of instructions and good responses, plus preference optimisation such as DPO (arXiv:2305.18290) or the reinforcement-from-human-feedback approach in InstructGPT (arXiv:2203.02155). The essential point: **this stage adds no capacity.** It selects which of the base model's existing behaviours get expressed, shaping them toward following instructions, adopting a format, and refusing certain requests.

**Reasoning (thinking) models** produce an extended internal deliberation before the final answer, and are trained — not merely prompted — to do so. Chain-of-thought as a prompting pattern is one thing; test-time compute as a *training* regime is the newer development.

The practical consequence is that a **second scaling axis** exists. A reasoning model costs more to run *at the same size*, because it emits many more tokens before answering — and, crucially, **you get to choose how many.** If the model or API exposes a reasoning-effort or thinking-budget setting, you are directly trading spend for accuracy at inference time. The correct question is therefore not "which model" but "which model at which effort level".

But the axis is task-dependent, and this is where people overgeneralise. Extended deliberation helps when the task has **verifiable structure and room for search**: arithmetic, multi-step deduction, code that either passes tests or does not, problems where a wrong path can be detected and abandoned. It helps much less on style, preference, or recall — you cannot deliberate your way to a better adjective, and thinking longer about a fact you do not know does not produce the fact. A reasoning model on a summarisation task is usually just a slower, more expensive summariser.

Multimodal models sit on a different axis again. A multimodal model is not a model that "understands images" in a general sense; it is an architecture in which a non-text encoder produces representations projected into the same space the language model consumes. Two consequences follow. First, capacity is shared: image understanding draws on the same weights that handle text, so a model heavily optimised for one may be weaker at the other. Second, **the seams show exactly where the projection is lossy** — fine spatial detail, small text in a screenshot, and precise counting of objects are the classic failure points, because the encoder compresses an image into a limited number of representations before the language model ever sees it.

**What this lets you predict:** that a disappointing result on a question-answering task may be the wrong *stage* rather than the wrong size — a base model where you needed an instruct one. That a reasoning model will shine on your maths and coding problems and add cost without benefit on your copy-editing. And that a multimodal model's vision weakness will cluster where compression loses the most.

**Where this stops working:** the three categories are a simplification of a continuum. Post-training is a pipeline, not a switch, and the names are marketing as much as taxonomy. Reasoning behaviour in particular blurs — some models are trained on deliberation data, some are prompted into it, and the boundary between "a reasoning model" and "an instruct model asked to think step by step" is not sharp.

---

### Part 5 — Open weights are one artefact, not the recipe

"Open" is the most over-read word in this landscape, so let us be exact about what is on disk when you download a model.

**You get the parameters.** That is the trained artefact, and it is the part that cost the most compute.

**You generally do not get the training data.** So you cannot audit what went into it, measure its composition, or retrain it from scratch. Data is frequently the most valuable and least disclosable part of the pipeline, often for legal reasons.

**You generally do not get the training code or the full recipe.** You may get an architecture definition and an inference implementation; you rarely get the data pipeline, the mixing ratios, the hyperparameters, or the post-training procedure in enough detail to reproduce the run.

**You generally do not get the evaluation detail.** Reported benchmark scores usually come without the exact prompts, the harness configuration, or the raw per-item outputs — precisely what you would need to check the number.

**You often do not get permissive terms.** Many "open-weight" models ship under licences with usage restrictions, thresholds, or acceptable-use clauses. **Open weights is not the same thing as open source.** Open source normally includes the source and the freedom to modify and redistribute; a weights download with a restricted licence is a different arrangement that happens to be downloadable.

This matters practically for one dominant reason: **your data.** If you are handling anything confidential, a model you can run on your own hardware is the only configuration in which the input never leaves your control, regardless of what any provider's terms say today. That is a constraint argument, not a quality argument, and it can outweigh a large quality gap. The same caution applies to your claims: with open weights you can *run* the model and test its behaviour, but you cannot verify how it was trained or what it saw. **"Open" changes what you can run, not what you can know.**

**What this lets you predict:** that a claim about a model's training data cannot be checked by downloading it, that per-item benchmark outputs will usually be unavailable, that a licence can block a use case even when the technical capability is present, and that local deployment answers a confidentiality requirement rather than a quality one.

**Where this stops working:** as a binary. Openness is a spectrum across weights, code, data, evaluation, and licence terms, and two models both described as "open" may sit at opposite ends of it. Licences get revised, too, so check the file for the checkpoint you are shipping and date your note.

---

### Part 6 — Why benchmarks mislead, and what to do instead

You now have the structural vocabulary. The tempting next move is to look up a leaderboard and pick the top entry. Do that and you will be wrong often, for three separable reasons.

**Contamination.** If a benchmark's questions appeared in a model's training data, the model may be recalling rather than reasoning. Benchmarks are published on the open web and pretraining data is largely the open web, so this is not hypothetical. A contaminated score measures memorisation, and a contaminated model can score highly while being *worse* at the underlying skill. It is very hard to rule out from outside — so treat a suspiciously large jump on a well-known benchmark as a question, not a result.

**Saturation.** A benchmark is useful while it discriminates and useless once everything scores near the ceiling. Once the top of the field clusters at 90-plus the remaining differences are inside the noise. An old benchmark does not become a better test over time. A leaderboard whose top twenty entries sit within a few points is not a close race — it is a saturated instrument.

**Task mismatch.** The benchmark measures a task that is not your task, and this is the one that actually costs you, because it looks like evidence. A multiple-choice knowledge benchmark tells you little about whether a model will follow your output format, admit uncertainty, or handle the mix of languages your users write in. If your work involves Tagalog, Taglish, Bisaya, or any code-switching register, English benchmark performance tells you much less than you would like — a documented equity problem, not a local complaint. The tokenization work of Petrov et al. (arXiv:2305.15425, NeurIPS 2023) showed that the token cost of the same content varies substantially by language, so both your cost and your effective context differ from the English assumptions baked into most evaluations. A benchmark run in English is an English-language result.

Preference-based leaderboards add a fourth issue: they measure **what people chose in a specific interface, on prompts they wrote themselves**. The paper behind the MT-Bench and Arena methodology (arXiv:2306.05685) documents the biases here — verbosity, position, self-enhancement. A model that wins a preference arena is a model people liked in that setting; whether it wins on your task is unanswered.

So what do you actually do? **You run your own eval, and it can be small.** Thirty items is enough to change your decisions, because the differences you are choosing between are usually much larger than thirty items can resolve. Four rules govern how you build it, and Part 7 sequences the steps.

**Use real items from your actual work, not invented ones.** Synthetic examples are cleaner than reality and flatter every candidate equally, so they measure nothing you care about.

**Write the scoring rule before you run anything.** Prefer a rule a script can apply: does the JSON parse, is the category in the list, does the summary contain the required entity. Where you must judge by hand, write the criterion down first. Deciding what counts as good *after* seeing the outputs is how you accidentally choose the model you already liked.

**Pin the identifier and record the date.** A floating alias can be repointed at a different model without any change to your code, and then your results describe something you are no longer using. Pinning makes your eval a measurement rather than an anecdote.

**Record failures, not just totals.** A model at 24/30 whose six failures are all one category is often a better choice than one at 25/30 whose failures are scattered unpredictably, because the first one's weakness is something you can route around.

Then compute cost per successful task rather than cost per token. Cost per token answers "how much does a token cost"; your question is "how much does a working answer cost". The two rank models differently whenever output length or success rate differ: a cheap-per-token model that reasons at length, or that needs two retries to produce parseable output, can cost more per success than an expensive-per-token model that gets it right once.

| Model | Cost per 1M tokens | Avg tokens per attempt | Attempts per success | Cost per success |
|---|---|---|---|---|
| A | low | long | 1.0 | ? |
| B | high | short | 1.0 | ? |
| C | low | moderate | 2.0 | ? |

Fill those in with your own measurements — the numbers are the exercise. Here is the calculation as code, so you can run it against your own eval results:

```python
# cost_per_success.py — run this on your own eval results.
# Every number in `results` comes from YOUR measurements, not from a pricing page.

PRICE_PER_1M = {          # USD per 1M tokens, read from the provider's page TODAY
    "candidate-a": 0.0,   # fill in
    "candidate-b": 0.0,
    "candidate-c": 0.0,
}

# From your eval run: total tokens produced+consumed per attempt for that model,
# and how many attempts it took, on average, to get one scorable success.
results = {
    #                tokens/attempt, attempts/success
    "candidate-a": (          2400,            1.0),
    "candidate-b": (           380,            1.0),
    "candidate-c": (          1150,            2.0),
}

for name, (tokens_per_attempt, attempts_per_success) in results.items():
    cost_per_success = (
        tokens_per_attempt * attempts_per_success / 1_000_000
    ) * PRICE_PER_1M[name]
    print(f"{name:12s} cost per successful task: ${cost_per_success:.6f}")
```

The lesson is in the second column of each tuple. **A model that fails 40% of the time at a third of the price is not cheaper.** It is more expensive, and it also costs you engineering time to detect and retry the failures.

Two things about the landscape itself, which you must hold consciously. **Your eval has a shelf life.** It measured a specific checkpoint on a specific date, and model updates can change behaviour without changing the name. **And the landscape as of early 2026 will have changed by the time you read this.** Model names, version numbers, context windows, prices, licences and leaderboard orderings all move on a scale of weeks. Nothing in this lesson names a current model as a fact, and you should distrust any source that does.

**What this lets you predict:** that a leaderboard's top entry will frequently not be your best choice, especially when your task is narrow, your language is not English, or your constraint is local deployment. A recommendation from someone with a different task, language, budget or hardware constraint is evidence about *their* decision, not yours.

**Where this stops working:** thirty items cannot resolve small differences. If two candidates land within a few points of each other, your eval has told you they are equivalent *on this sample* — not that they are equal. At that point, decide on what your eval cannot see: licence, latency, provider reliability, cost headroom, how much you already understand the tooling.

---

### Part 7 — The procedure, and where it expires

Here is the whole phase compressed into something you can execute on a Saturday, and then the honest limits of it.

**Step 0 — Write down the constraint.** Does the data need to stay on your machine? What is the memory ceiling? What is the latency budget for a human waiting? Is there a language requirement? Is there a hard budget? Constraints do the heavy lifting: they remove most of the field before quality is discussed.

**Step 1 — Write the task as input and output.** Not "summarise documents" but "given a 500-word Taglish customer complaint, output a JSON object with a category from this fixed list and a one-sentence English summary." A task you cannot write down this precisely is a task you cannot evaluate.

**Step 2 — Build the eval set and the scoring rule.** Thirty real items, rule written first, by the four rules in Part 6.

**Step 3 — Shortlist 3–4 by structure.** Meets the constraints, plausible on the task, different from each other in a way that would teach you something. Keep the shortlist as a file so the filter is auditable and reusable next time a model is announced:

```json
[
  {"name": "replace-with-actual-identifier",
   "run": "local",
   "total_params_b": null,
   "active_params_b": null,
   "weights_memory_gb": null,
   "context_tokens": null,
   "licence": "read-the-licence-file",
   "supports_my_language": null,
   "reason_on_shortlist": "fits memory ceiling; runs offline",
   "pinned_at": "YYYY-MM-DD"}
]
```

Every `null` is a field you must fill from the model card, the config file, or your own measurement. Every field whose value could change next month carries the date you read it.

**Step 4 — Run and score.** Same items, same settings, identifiers pinned, date recorded.

**Step 5 — Compute cost per successful task.** Including retries. This is usually where the honest answer appears.

**Step 6 — Decide, and write down why.** One paragraph: what you chose, what you rejected, what evidence decided it, what you would switch to if a constraint changed, and today's date.

**Step 7 — Set a re-check trigger.** Not a calendar reminder you will ignore, but a condition: "when I upgrade the model, when the eval drops below X, when my monthly cost exceeds Y, or when a constraint changes."

**Step 8 — Re-run the eval when triggered.** The eval set is now an asset. It is the only part of this that compounds.

**What this lets you predict:** your own next decision. If a new model appears next month, you do not start over — you add it to the shortlist, run the set, and compare against a number you already trust. Constrained choices are usually decided in Step 0, and quality comparisons only matter among the survivors.

**Where it stops working, precisely.** The procedure answers "which of these candidates is best for this task, now". It does not answer "what will be possible in six months", and no procedure does. It degrades when the task drifts — a task fitted to a slowly changing distribution needs its eval set refreshed, or it will keep certifying a model for work you no longer do. It cannot see the failure that only appears at scale: thirty items will not reveal a rare catastrophic output mode, so if your application has a high cost of being wrong, a small eval is a screening instrument and not a safety argument.

The durable content of this phase is not a list. It is the set of structural questions — how many parameters are *active*, which *stage* of training produced this behaviour, what is *actually inside* the "open" label, what does my *own* eval say, what does a *working* answer cost — plus one deliberately disposable artefact: your dated eval and your written reason. Everything else here will be superseded.

## Hands-on practice tasks

1. Compute the weight memory for three model sizes at three precisions, by hand, then verify two of them against a config file you actually opened on the Hub. <!-- id: intern-06-model-landscape-t01 band: quick energy: low -->
2. Find two model cards and extract, for each: parameter count, training token count if stated, context length, licence, and whether the architecture is dense or sparse. Note every field the card omits. <!-- id: intern-06-model-landscape-t02 band: focused energy: normal -->
3. Write a one-page explanation, from memory, of the compute-optimal result and how it differs from the earlier scaling laws. Then check it against Hoffmann et al. (2022) and correct yourself in a different colour. <!-- id: intern-06-model-landscape-t03 band: focused energy: normal -->
4. Take one sparse model and one dense model of comparable total parameters. Record total parameters, active parameters per token, and memory needed for each. Write two sentences on which you would run locally and why. <!-- id: intern-06-model-landscape-t04 band: focused energy: normal -->
5. If you can host a base model locally, ask it a question and record the raw completion. Then ask the instruct version of the same family the same question. Write three sentences on what changed. If you cannot host a base model, find a published base-versus-instruct comparison and analyse it the same way. <!-- id: intern-06-model-landscape-t05 band: focused energy: normal -->
6. List five tasks you actually do. For each, mark whether extended deliberation before answering should help, and justify it by the task's structure — is there room for search and error-correction? <!-- id: intern-06-model-landscape-t06 band: quick energy: low -->
7. Read a licence file for one open-weight model end to end. Write down the three clauses that would most affect you if you shipped a product with it. <!-- id: intern-06-model-landscape-t07 band: focused energy: normal -->
8. Build a 30-item eval set from your own real work, and write the scoring rule before you run anything. Commit both to a file. This is the core artefact of the phase. <!-- id: intern-06-model-landscape-t08 band: deep energy: high -->
9. Run three candidate models through that eval set at identical settings. Pin every identifier. Record the date, and record per-item results, not just totals. <!-- id: intern-06-model-landscape-t09 band: deep energy: high -->
10. Compute cost per successful task for all three candidates, including retries, and show the arithmetic. State which model wins on cost per token and which wins on cost per successful task. <!-- id: intern-06-model-landscape-t10 band: focused energy: high -->
11. Take one benchmark score from a model card and write down three specific reasons it might not transfer to your task. Be concrete about your task, not generic about benchmarks. <!-- id: intern-06-model-landscape-t11 band: quick energy: normal -->
12. Look up the original paper or documentation for one benchmark you have seen cited. Note what it actually measures and one thing it explicitly does not. <!-- id: intern-06-model-landscape-t12 band: focused energy: normal -->
13. Tokenise the same short passage in English and in the Philippine language or register you actually use. Compare token counts. Write two sentences on what the difference does to your cost and your effective context budget. <!-- id: intern-06-model-landscape-t13 band: focused energy: normal -->
14. Write your decision paragraph: the model you chose, the ones you rejected, the evidence, the date, and one constraint that would flip the decision. <!-- id: intern-06-model-landscape-t14 band: focused energy: normal -->
15. Write your re-check trigger as a condition, not a date. Then name the last time a model you relied on changed under you, or state that it has not happened yet and what you would have noticed. <!-- id: intern-06-model-landscape-t15 band: quick energy: low -->
16. Keep a one-line dated log for the rest of the track: any model name, price or context size you encounter, with the date you saw it. Notice how fast the entries stop being current. <!-- id: intern-06-model-landscape-t16 band: ongoing energy: low -->

## Common Pitfalls

**Treating parameter count as a quality ranking.** It is a memory and compute filter. Between models of similar size it says almost nothing about your task, and between a dense and a sparse model of the same count it says nothing at all.

**Assuming a bigger model is automatically better.** Training data volume, data quality and post-training all move behaviour without changing a single parameter. A smaller model trained on far more data can beat a larger one, and the compute-optimal result is exactly the finding that made this the expected case rather than a surprise.

**Comparing a sparse model's active parameters to a dense model's parameters.** There is no conversion. Active parameters are a compute figure; a sparse model with the same active count as a dense model is not equivalent to it and does not sit at the same place on any quality ladder.

**Downloading a large sparse model for a small machine.** You must fit the total parameters in memory while only getting the speed of the active ones. Confirm the total size before you start the download, not after.

**Reading "open weights" as "open source".** You usually get parameters and nothing else — not the data, not the training code, not the evaluation detail, and often not permissive licence terms. Access to run is not access to verify.

**Judging a model by benchmark scores without naming the mechanism.** Contamination, saturation and task mismatch are three different failures and each has a different tell. A benchmark where the whole field clusters near the ceiling is saturated; a suspicious jump on a widely published test invites a contamination question; a task mismatch simply means the number is about a different job.

**Assuming English benchmark results transfer to Tagalog, Taglish or Bisaya usage.** Token costs and effective context differ by language, and evaluations run in English measured English. This is a documented equity issue, not a minor caveat.

**Comparing cost per token across models and calling it a cost decision.** Cost per successful task accounts for output length and failure rate, and it frequently reverses the ranking. The model that fails a third of the time at a third of the price is more expensive, and it also costs you the engineering to notice.

**Building an eval set out of invented examples.** Synthetic items are cleaner than your real inputs and flatter every candidate equally, which means they measure nothing you care about.

**Writing the scoring rule after seeing the outputs.** This is how you choose the model you already preferred and then produce evidence for it. Write the rule first, in the file, before the first run.

**Leaving a floating model alias unpinned.** An alias can be repointed at a different model with no change to your code, silently invalidating every number you have and every prompt you have tuned.

**Never re-running the eval.** Models change; your task changes; an eval you ran once is a historical document. Set a trigger condition, not a vague intention.

**Recording model names and prices as facts in your notes without dates.** Every one of them will be wrong eventually. A dated entry tells you what you knew and when, which is the only defensible form.

## Deliverable / proof of work

Write `portfolio/model-internals/06-model-landscape.md` containing:

- **Your written task definition** — the real task, expressed as a testable input and output, with its constraints listed separately: data locality, memory ceiling, latency budget, language requirement, hard budget.
- **Your 30-item eval set**, with the scoring rule written above it in the file, and a note that the rule predates the first run.
- **Per-item results for three candidates**, all run at identical settings, with pinned identifiers and the date of the run. Totals alone are not sufficient — include the failure list.
- **Your cost-per-successful-task table**, with the arithmetic shown, and one paragraph on whether it ranked the candidates differently from cost per token.
- **Your decision paragraph** — what you chose, what you rejected, what evidence decided it, one constraint whose change would flip it, and the date.
- **Your re-check trigger**, written as a condition.
- **A parameter comparison** of one dense and one sparse model, showing total parameters, active parameters per token, and memory required, with the source you read it from.
- **A resource audit** for one open-weight model: what you actually received and what was absent — data, training code, evaluation detail, licence terms. At least five items in each column.
- **A section titled "What I will re-verify in three months"** — three specific things, each with the place you will check them.

Nothing in this deliverable requires a paid account. Three candidates can be a local model via Ollama, a provider free tier, and a second free tier, or a single model at two different reasoning settings plus a quantised local variant. If you have exactly one free model available, run it at two effort settings and compare against a smaller local model — the eval discipline is identical, and the discipline is the deliverable.

## Checklist

- [ ] I can state what parameter count predicts and what it does not <!-- id: intern-06-model-landscape-c01 energy: low -->
- [ ] I can compute weight memory from parameter count and precision without looking it up <!-- id: intern-06-model-landscape-c02 energy: normal -->
- [ ] I can explain why weight memory is a floor rather than a total <!-- id: intern-06-model-landscape-c03 energy: normal -->
- [ ] I can describe scaling laws as power laws and say what makes them useful for planning <!-- id: intern-06-model-landscape-c04 energy: normal -->
- [ ] I can explain what the compute-optimal result changed, and why it did not contradict the earlier laws <!-- id: intern-06-model-landscape-c05 energy: high -->
- [ ] I can explain why the predicted quantity is loss and not task success <!-- id: intern-06-model-landscape-c06 energy: high -->
- [ ] I can explain what a router does and why only some experts run per token <!-- id: intern-06-model-landscape-c07 energy: normal -->
- [ ] I can distinguish total parameters from active parameters and say what each governs <!-- id: intern-06-model-landscape-c08 energy: normal -->
- [ ] I can explain why sparse models are cheap to run and expensive to host <!-- id: intern-06-model-landscape-c09 energy: high -->
- [ ] I can predict which tasks extended deliberation helps and which it does not <!-- id: intern-06-model-landscape-c10 energy: high -->
- [ ] I can tell a base model from an instruct model by behaviour and explain what the tuning stage changed <!-- id: intern-06-model-landscape-c11 energy: normal -->
- [ ] I can list what open weights include and at least four things they usually do not <!-- id: intern-06-model-landscape-c12 energy: normal -->
- [ ] I can explain why "open weights" is not the same as "open source" <!-- id: intern-06-model-landscape-c13 energy: low -->
- [ ] I can predict where a multimodal model's failures will cluster and say why <!-- id: intern-06-model-landscape-c14 energy: normal -->
- [ ] I have built a small eval set from my own real inputs and written the scoring rule before running it <!-- id: intern-06-model-landscape-c15 energy: high -->
- [ ] I have run at least three candidates through it at identical settings with pinned identifiers <!-- id: intern-06-model-landscape-c16 energy: high -->
- [ ] I can name the three mechanisms by which benchmarks mislead and give an example of each <!-- id: intern-06-model-landscape-c17 energy: normal -->
- [ ] I can explain why cost per successful task can reverse a cost-per-token ranking <!-- id: intern-06-model-landscape-c18 energy: high -->
- [ ] I can state where my own eval stops being valid and what it cannot see <!-- id: intern-06-model-landscape-c19 energy: high -->
- [ ] I have written my decision with its date and a re-check condition <!-- id: intern-06-model-landscape-c20 energy: normal -->
- [ ] I can explain why any model name, price or context size I record needs a date attached <!-- id: intern-06-model-landscape-c21 energy: low -->
- [ ] I have compared token counts for the same content in English and in the language I actually use <!-- id: intern-06-model-landscape-c22 energy: normal -->

## Quiz

### Q1. A model advertises 47 billion total parameters and about 13 billion active per token. What does this tell you? <!-- id: intern-06-model-landscape-q01 energy: normal -->

- [x] It is sparse, so you must fit every expert in memory while only paying compute for the active ones
- [ ] It is dense, and the two numbers differ because of quantisation
- [ ] It is dense, and the second number counts only the attention layers
- [ ] It is sparse, so it will need less memory than a 13-billion-parameter dense model

**Why:** A gap between total and active parameters is the signature of a mixture-of-experts architecture: all experts must be resident in memory, but the router activates only a few per token. That makes it a memory problem and a compute bargain simultaneously — the opposite of what the last option claims, and neither of the dense explanations accounts for the gap.

### Q2. You are choosing between a model that costs a third as much per token but fails 40% of your eval items, and one that costs three times as much and fails 4%. Which framing decides this correctly? <!-- id: intern-06-model-landscape-q02 energy: high -->

- [ ] Cost per token, because the cheaper model's failures can be filtered by a retry
- [x] Cost per successful task including retries, because failure rate and output length are part of what a working answer costs
- [ ] Total monthly token volume, because that is what the bill reflects
- [ ] Latency, because the cheaper model will be slower on the failures

**Why:** Cost per token answers a question you are not asking. Once failures require retries, the cheap model's effective cost per working answer rises by the retry factor, and the ranking can reverse. The engineering cost of detecting those failures never appears on a pricing page, which is why it belongs in the decision rather than outside it.

### Q3. A model card reports a large improvement on a well-known published benchmark. What is the most useful first question? <!-- id: intern-06-model-landscape-q03 energy: normal -->

- [ ] Whether the benchmark is run in English or in several languages
- [ ] Whether the model was evaluated at full precision or quantised
- [x] Whether the benchmark's questions could have appeared in the training data
- [ ] Whether the improvement is large enough to matter for the price

**Why:** Benchmarks are published on the open web and pretraining data is largely the open web, so contamination is the failure mode that most easily produces an impressive and meaningless number. Precision and language are real considerations, but they do not explain a suspicious jump, and a contaminated score can be large, small, or anywhere in between.

### Q4. What did the compute-optimal scaling work establish relative to the earlier scaling laws? <!-- id: intern-06-model-landscape-q04 energy: high -->

- [ ] That the earlier laws were wrong and loss is not predictable from scale
- [ ] That parameter count is the only variable that matters at a fixed compute budget
- [x] That at a fixed compute budget parameters and training tokens must be balanced, and models of the day were over-parameterised for their data
- [ ] That training data volume matters less than was previously believed

**Why:** The two results are curves over the same variables answering different questions — how loss scales with compute, and where to sit given a fixed budget. The second found the frontier was elsewhere, which shifted practice toward training on far more data rather than toward ever-larger parameter counts. Neither result says loss is unpredictable or that data matters less.

### Q5. You download an open-weight model. Which list best describes what you have? <!-- id: intern-06-model-landscape-q05 energy: normal -->

- [ ] The weights, the training data, the training code, and the evaluation harness
- [ ] The weights and the training code, but not the data
- [x] The weights, and usually not the data, the training code, the full recipe, or the evaluation detail — and often under restrictive licence terms
- [ ] The weights and the full training recipe, since releasing weights implies reproducibility

**Why:** Weights are one artefact of a pipeline. Data is frequently the least disclosable part, the pipeline and hyperparameters are rarely published in reproducible detail, and per-item evaluation outputs are usually absent. Licences frequently restrict use as well. Open weights is not open source, and access to run is not access to verify.

### Q6. Your task is summarising customer support threads into two sentences. Where does a reasoning model most likely stop helping? <!-- id: intern-06-model-landscape-q06 energy: high -->

- [ ] When the threads are long, because deliberation handles long context badly
- [x] When the task is a matter of compression and style rather than search with verifiable steps
- [ ] When the output must be in a fixed JSON schema
- [ ] When more than one thread must be summarised in the same call

**Why:** Extended deliberation buys accuracy where a wrong path can be detected and abandoned — arithmetic, multi-step deduction, code that passes or fails tests. Summarisation has no search space to explore, so extra thinking tokens add cost and latency without improving the result. Format and length are separate concerns that other mechanisms address.

### Q7. A leaderboard shows the top twenty models within three points of each other. What does this most likely indicate? <!-- id: intern-06-model-landscape-q07 energy: normal -->

- [ ] A genuine and closely fought race that the leaderboard has measured precisely
- [x] The benchmark is saturated, so the remaining differences are inside the noise
- [ ] The models are architecturally nearly identical
- [ ] The leaderboard has been contaminated by submissions from model developers

**Why:** An instrument stops discriminating once everything scores near the ceiling, and rankings within that cluster are effectively arbitrary despite being printed to two decimal places. Saturation is a property of the benchmark's difficulty relative to the field, not evidence of architectural similarity or misconduct.

### Q8. You ran a 30-item eval once and chose a model. What is the most accurate statement about that result now? <!-- id: intern-06-model-landscape-q08 energy: normal -->

- [ ] It is a permanent measurement, since the eval set has not changed
- [ ] It is proof the model is the best available for the task
- [ ] It is invalid, because 30 items is too few to decide anything
- [x] It measured a specific checkpoint on a specific date and should be re-run when the model, the task, or a constraint changes

**Why:** The eval set is stable; the things it measured are not. Model updates can shift behaviour without changing the identifier, and a floating alias can be repointed without any change to your code. Thirty items is a real signal — it reliably separates candidates that differ substantially — but it has a shelf life, a sampling limit, and no visibility into rare catastrophic failures.

## You're ready to move on when...

You can look at any model announcement and separate the durable claims from the volatile ones without much effort — knowing which numbers describe memory, which describe compute, which describe training, and which will be different next month. You can read a model card and say what is missing from it. You can explain, without notes, why a sparse model with many total parameters and few active ones is a different kind of object from a dense model of the same size, and why nobody should draw one quality line through both. You can say exactly what you did and did not get when you downloaded an open-weight model, and why that answers a confidentiality question rather than a quality one.

And you have done the thing this phase exists for: you took a real task of your own, wrote it as a testable input and output, built a small eval set with the scoring rule written first, ran three candidates through it at identical settings, and computed what a *successful* answer actually costs. You have a written decision with a date on it and a condition that would make you re-run. If someone hands you a leaderboard tomorrow, you will read it as a hypothesis to test against your own thirty items rather than as an answer — and that habit is the last thing this track was trying to install in you.

## Free vs Paid

### What's free is enough

Every step of this phase runs at zero cost, and the free path teaches the same judgements as a funded one. The reasoning you are practising does not depend on which models you point it at.

The eval discipline is entirely free. Thirty items from your own work, a scoring rule you write, three candidates run at identical settings, and arithmetic you do on paper — none of that touches a billing page. Free tiers from hosted providers give you real models for the shortlist, and a local model through Ollama or llama.cpp gives you a candidate with no key, no per-token cost, and no rate limit, which is genuinely the *better* baseline to include: it tells you what you can get for nothing, and any hosted model has to beat it by enough to justify its cost.

Model cards, configuration files, licences, papers and documentation are all free and are where the structural facts live. The Hub shows you parameter counts and architecture without an account. Pricing and throughput pages are free to read, and reading them — rather than trusting a summary, including this one — is the actual skill.

One honest limitation of the free path: free-tier rate limits make running a 30-item eval across three hosted candidates slower than it would be with credit, and a local model will be slower still on modest hardware. That is a wall-clock cost, not a learning cost. Run the eval overnight, or reduce to twenty items and accept a wider margin.

### What a paid tier adds

Paying buys four things here, and it is worth knowing which one you would actually be buying.

**Headroom to run the eval at a realistic scale.** This is the real one. A 30-item eval across three candidates is 90 calls plus retries, and free-tier daily caps can turn one afternoon into three days. On a funded account with a spending limit set, the eval completes while you are still interested in the result.

**Access to the stronger models and to reasoning-effort controls.** Several providers gate their most capable models and their thinking-budget settings behind paid access. For this phase specifically, that narrows the range of candidates you can compare — which matters, because a shortlist of three similar mid-tier models teaches less than a shortlist that spans a real capability gap.

**Larger context windows.** If your task involves long documents, a free tier's smaller window may exclude the candidates you most want to test, and a context-length rejection on a free tier can look like a model limitation when it is a tier limitation. Phase 8 of Foundations covers that failure; here it affects your shortlist.

**Volume for the re-check.** Once you are running the eval on a trigger — after an upgrade, or when a cost threshold trips — the calls are recurring rather than one-off. That is precisely when a free tier's cap starts blocking the habit this phase is trying to build.

### When it's worth paying

**Not to finish this phase.** Finish it free. Run the local model as a candidate, use free tiers for the other two, keep the eval small enough to fit inside the caps, and accept slower wall-clock. You will produce the same deliverable and learn the same reasoning.

The honest threshold is the moment your eval set becomes something you rely on rather than something you built once — when you are re-running it after upgrades, comparing new arrivals against a stored baseline, and the free tier's cap is what stops you. At that point, put a small amount of credit on one account, set a spending limit if the provider offers one, and keep your cost-per-successful-task table current, because the whole point of that table is that it decides where the money goes.

**Volatile, dated: as of early 2026, free-tier limits, credit grants and which models sit behind a paywall differ substantially between providers and change without much notice.** Ignore any specific figure you have read here or elsewhere, including in this curriculum's own resource lists — read the current pricing page for the provider you are actually considering, and check the terms for whether free-tier inputs may be used for training. That question matters more than the price difference the moment you are sending anything confidential, and if you are, a model you run locally is not the budget option. It is the only option — and by now you know how to evaluate whether it is good enough.
