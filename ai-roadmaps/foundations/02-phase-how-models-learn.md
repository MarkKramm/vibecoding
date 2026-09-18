---
id: found-02-how-models-learn
track: foundations
phase: 2
order: 20
title: How Models Learn
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal]
deliverable: portfolio/foundations/02-how-models-learn.md
exit_criteria: >
  You can explain what a training run actually does without calculus, say what
  pre-training and post-training each contribute, and name at least one thing
  post-training can never add.
---

# Phase 2 — How Models Learn

## Goal of this phase

Understand training as a procedure rather than a mystery. By the end you will be able to explain what a dataset is, what a loss function measures, what gradient descent is doing in plain language, why an instruction-tuned assistant behaves so differently from the raw base model it came from, and why two products built on the same base model can feel like different species.

The most valuable thing in this phase is the boundary: knowing exactly which behaviours training can create and which ones it cannot. Most bad predictions about AI come from expecting post-training to fix something that only pre-training could have provided.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

The conceptual load is higher than Phase 1 and the reading is longer, but there is still no maths and no code required. If you have a free notebook environment available, two of the practice tasks get sharper — but none of them depend on it.

## Skills you'll gain

- Describe what a dataset contributes to a model, and what "trained on the internet" actually means
- Explain a loss function as a score of wrongness, without calculus
- Explain gradient descent as repeated small correction, and say why it needs an enormous number of steps
- Distinguish pre-training from post-training and say what each one buys you
- Explain why a base model is not a usable assistant, and what instruction tuning adds on top
- Explain how human feedback shapes tone, format, and refusals
- Explain overfitting and generalisation well enough to predict when a model will fail on unusual input
- Name the classes of behaviour post-training cannot add, and predict what a model will simply not know

## Specific topics to learn

### The training loop

- Datasets: raw text, filtered text, and instruction/response pairs as three different kinds of material
- The loss function: a single number that says how surprised the model was
- Gradient descent: nudging millions of numbers to reduce that number, one small step at a time
- Why scale — data, parameters, and compute together — changes what the model can do
- Why a serious pre-training run is measured in months and in very large amounts of money

### Pre-training and post-training

- Pre-training: next-token prediction over a very large corpus; what it installs
- Instruction tuning: learning to treat a request as an instruction rather than as text to continue
- Preference learning and RLHF: learning which of two answers a human would prefer, and how that becomes a policy
- Why the same base model can become very different products after different post-training
- Refusals, tone, formatting, and hedging as trained behaviours rather than model properties

### Failure modes and boundaries

- Overfitting: memorising the practice set instead of learning the pattern
- Generalisation: performing well on material that was not in the training set
- Data contamination and why benchmark numbers deserve suspicion
- What post-training cannot do: add knowledge the pre-training never saw

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Hugging Face Chat | Compare a raw base model against an instruction-tuned one | Free | https://huggingface.co/chat/ | Ask both the same question and compare | Any local model via Ollama with a base and an instruct variant |
| Google AI Studio | Free interactive experimentation with prompts and model settings | Free | https://aistudio.google.com/ | Run the same prompt on different models to observe post-training differences | Hugging Face Chat, or a local model via Ollama |
| Ollama | Run open-weight models locally on your own machine | Free | https://ollama.com/ | Download a base model and an instruct model and compare them | Any hosted playground with a base-model option |
| Hugging Face Datasets | Inspect what real training data looks like | Free | https://huggingface.co/datasets | Open one instruction dataset and read raw examples | Browse dataset card pages without downloading |
| A notebook environment | Run tiny training-loop experiments | Free tier | https://colab.research.google.com/ | Train a tiny model on a tiny dataset and watch the loss | Kaggle Notebooks, or run the same code locally |
| A plain text file | Keep your predictions and results in one place | Free | — | Log every experiment with the prediction written first | Paper |

## Free/cheap resources

- **Andrej Karpathy — Deep Dive into LLMs like ChatGPT** — https://www.youtube.com/watch?v=7xTGNNLPyMI
- **Andrej Karpathy — Let's build GPT: from scratch** — https://www.youtube.com/watch?v=kCc8FmEb1nY
- **Andrej Karpathy — Let's reproduce GPT-2** — https://www.youtube.com/watch?v=l8pRSuU81PU
- **3Blue1Brown — Gradient descent, how neural networks learn** — https://www.youtube.com/watch?v=IHZwWFHWa-w
- **3Blue1Brown — Backpropagation, intuitively** — https://www.youtube.com/watch?v=Ilg3gGewQ5U
- **InstructGPT paper (Ouyang et al.)** — https://arxiv.org/abs/2203.02155
- **Hugging Face — NLP Course, fine-tuning chapter** — https://huggingface.co/learn/nlp-course/chapter3/1
- **Google Machine Learning Crash Course** — https://developers.google.com/machine-learning/crash-course
- **fast.ai — Practical Deep Learning for Coders** — https://course.fast.ai/
- **Stanford CS224N course page** — https://web.stanford.edu/class/cs224n/

## Lesson: What the Training Run Actually Does

### Part 1 — A dataset is a curriculum, and the curriculum is a choice

Start with a question that sounds trivial and is not: what is a dataset?

You already know from Phase 1 that a model predicts the next token. Training is the process that makes those predictions good. The raw material for that process is text — enormous quantities of it — and the first thing to understand is that the text is not "the internet". It is a selection from the internet, assembled by people who made choices.

Those choices run something like this. Start with a crawl: a large automated sweep of public web pages. Then filter. Remove pages that are mostly navigation boilerplate. Remove obvious spam and machine-generated garbage. Remove duplicates, because a page repeated ten thousand times is not ten thousand times as informative — it just skews what the model thinks is normal. Then add curated sources: books, code repositories, Wikipedia, scientific text, question-and-answer sites. Then weigh things. Code might be included at a higher proportion than its natural share of the web, because code teaches structure and long-range dependency unusually well. Then deduplicate again, filter for quality using a classifier trained to recognise "good" text, and remove material you do not want the model to reproduce.

Every one of those steps is a judgement call, and every one of them shapes the model. This is the first mechanism worth internalising:

> **The model's sense of what is normal is exactly the distribution of its training data.** Not the world's distribution. The dataset's.

That single sentence explains more model behaviour than any other in this phase. If your training corpus is mostly English, the model is mostly an English machine. If your corpus over-represents formal writing, the model will over-produce formal writing when unsure. If a topic appears rarely in the corpus, the model's predictions about that topic come from very little evidence — and a model with little evidence still produces fluent output, because fluency is a property of the architecture, not of the evidence.

Then there is the axis of *format*. The dataset determines not just what the model knows but what shapes of text it has seen. In the pre-training corpus, a question is almost always followed by an answer. A list of steps is almost always followed by more steps. A code block is almost always followed by prose explaining it or by more code. The model learns these continuations. It does not learn "questions deserve answers"; it learns that text after a question mark tends to look like an answer. This distinction matters enormously in Part 5.

For a sense of scale, well-documented open pre-training datasets have been described in the range of hundreds of billions to over a trillion tokens, drawn from filtered crawls plus curated sources. **As of 2026-09**, the specific figures for the largest frontier models are not published and likely never will be; treat any precise number you see for a closed model as a guess. What is stable and worth remembering is the shape: the corpus is vastly larger than any human could read, and it is filtered rather than raw. If the exact token counts turn out to be wrong by a factor of two, nothing in this lesson changes.

The takeaway you should carry forward: a dataset is a designed curriculum. "The model was trained on the internet" is true in the way that "a library contains the internet" is true. The filtering, weighting, and deduplication are where the character of the model is decided long before anyone trains anything.

**Where this stops working.** Not everything the model appears to know comes from next-token prediction on text. Some capabilities are reliably produced by how the model is trained to reason step by step rather than by what was in the corpus — the training procedure itself teaches a behaviour, not just a fact. So "the dataset explains everything" is itself an over-simplification. The dataset sets the ceiling on knowledge; the procedure determines how well the model uses what the dataset contains. Keep those separate.

### Part 2 — The loss function is a score of wrongness, and that is all it is

Now the mechanism. You have a model with a very large number of internal numbers, called parameters or weights. At the start of training those numbers are random, so the model's predictions are meaningless. At the end they will be arranged so the predictions are good. Something has to move them.

The thing that moves them is a score. Call it the loss.

Here is the whole idea, without calculus. Take a chunk of training text. Hide the next token. Ask the model: what is the probability you assign to the token that is actually there? If the model assigns it high probability, the model was not surprised, and the loss is low. If the model assigns it low probability, the model was surprised, and the loss is high. Do this across millions of positions and average the results. You now have one number that says, in a single figure, how badly this model predicts this text.

That number is the entire objective. Nothing else is being optimised.

What follows from that is worth stating precisely, because it is the root of nearly every model failure you will ever observe:

- The model is rewarded for **assigning high probability to what actually appears in the training data**.
- The model is **not** rewarded for being true, helpful, honest, harmless, or internally consistent.
- The model is **not** penalised for producing something false, as long as that false thing is a plausible continuation of the text so far.
- The model is **not** rewarded for saying "I do not know", because in the training data, the position after a question is filled with an answer far more often than with an admission of ignorance.

So a base model is, mechanically, a machine that continues text in the way its corpus suggests. That is not a flaw bolted on top; it is the objective, working exactly as specified. Everything in the next four parts is about how people build useful things on top of an objective this narrow.

**Where this stops working.** The loss is a proxy. It measures prediction of held-out text, and prediction of text is not the same as being useful to a person. A model can achieve a lower loss and be worse at the thing you actually care about. Lower loss is a reliable signal that the model is learning *something*, and it is a much weaker signal that the model is learning the thing *you* want. This gap is the entire reason Part 5 exists. When you see a training run described as successful because loss went down, remember that loss going down is necessary and nowhere near sufficient.

### Part 3 — Gradient descent is a correction loop, not an insight

You have a score of wrongness. You need to reduce it. The procedure that does so is gradient descent.

Without calculus, here is the shape of it. Imagine the loss as a height, and the parameters as a position on a vast landscape. You cannot see the landscape. But at your current position you can measure which direction is downhill — that measurement is the gradient, and computing it is the hard technical part, not the conceptual one. Once you know the direction, you take a small step. Then you measure again. Then you take another small step. Millions of times.

That is the whole algorithm. Measure which way is downhill; step; repeat.

```python
# The shape of every training loop ever written, in pseudocode.
# Nothing here is provider-specific; it is the skeleton.
for batch in dataset:              # a batch is a few hundred chunks of text
    predictions = model(batch)     # forward pass: model guesses next tokens
    loss = measure_wrongness(predictions, actual_next_tokens)
    direction = downhill_direction(loss)   # the gradient
    nudge_all_parameters_a_tiny_bit(direction)
    # -> repeat several million more times
```

Three consequences follow directly, and each one explains something you have observed.

**First, why it takes so long.** Each step changes the parameters by a very small amount. That is not timidity; it is necessary. Step too far and you overshoot the bottom of the dip and the loss gets worse, then oscillates, then diverges. So the only safe step size is small, and a small step size means you need an enormous number of steps. A serious pre-training run is hundreds of thousands to millions of these steps over enormous batches. At that scale the run is measured in weeks to months of wall-clock time on thousands of specialised chips running continuously.

**Second, why it costs so much.** The cost is not intellectual, it is physical: electricity and hardware time. Thousands of accelerators running flat out for months, plus the human and engineering cost of keeping that run from collapsing, plus the cost of every failed run before it. **As of 2026-09**, public reporting on frontier pre-training runs has cited figures in the tens to hundreds of millions of dollars, and there is genuine disagreement about the accounting. Treat any single number as contested. The durable point is structural rather than numeric: the expense scales with the number of steps multiplied by the size of the model multiplied by the size of each batch, and all three are large. You do not need the dollar figure to know why only a handful of organisations do this.

**Third, why the result is not inspectable.** Nothing in this process writes down a rule. There is no point at which someone says "the model now believes X". There is only a very large set of numbers that has been nudged a few million times in the direction that made prediction slightly less wrong. This is why interpretability is genuinely hard and why nobody can give you a clean inventory of what a trained model contains. Phase 1 made this point about the output; here is the reason for it at the source.

There is one more piece worth naming, because you will meet it constantly in later tracks: the **learning rate**. It is the size of the step. Too large and training diverges; too small and it never finishes. Nearly all practical skill in training is managing this and related knobs, and nearly all training failures that are not hardware failures are step-size failures wearing a costume.

**Where this stops working.** Gradient descent finds a good set of parameters, not the best one, and not a meaningful one. It is a downhill walk with no map. It can settle into a valley that is merely acceptable. It can be led astray by a dataset whose flaws it faithfully learns. And "the loss went down" tells you the walk was descending — not that the destination answers your question. If you take one thing from this part: the process optimises the score you gave it, and you get what you measured, not what you meant.

### Part 4 — Overfitting is memorising the practice test

There is a failure mode in training that is worth understanding intuitively because it predicts real behaviour, and because it is the clearest illustration of what "learning" means here.

Imagine two students preparing for an exam. One studies past papers by memorising the answers to the exact questions. The other studies the underlying subject. On the past papers, the memoriser wins. On a new paper with different wording, the memoriser collapses while the other student copes. The memoriser **overfit**; the other student **generalised**.

Now translate that. During pre-training the model sees an enormous amount of text. If it learns general patterns — grammar, factual associations, the way arguments are structured, what kinds of sentence follow what — it will do well on text it has never seen. That is generalisation, and it is the entire point. If instead it memorises specific passages, it will predict those passages perfectly and be helpless anywhere else.

Why does this matter to you practically? Because the symptoms of overfitting are visible from the outside:

- Near-perfect performance on material that resembles its training data, and sharp collapse on material that does not.
- Unusually confident reproduction of specific phrasings, especially distinctive ones — the model is not reasoning toward an answer, it is continuing a memorised sequence.
- Strange failures on inputs that are merely *unusual in format* rather than hard in content. A differently-shaped request breaks it because it does not resemble the shape it memorised.

And the counter-force is data diversity. A model trained on a narrow, repetitive corpus overfits; a model trained on a broad, varied one generalises. This is the real reason dataset filtering is not just about removing garbage — it is about keeping variety.

The related trap is **contamination**. If text from a benchmark was present in the training corpus, the model may have memorised the answers rather than learned the skill, and its score on that benchmark is inflated. This is known to have happened repeatedly across the field and is one of the reasons to treat any single benchmark number with suspicion. The mechanism is exactly the exam-memoriser problem at industrial scale.

> **Careful with this analogy.** The student analogy breaks at one important point: a student is understood to have intentions, effort, and a self that is doing the learning. A model has none of those. "Overfitting" does not mean the model was lazy; it means the optimisation found a set of parameters that scores well on the training distribution specifically. Drop the mental image the moment it starts suggesting the model is *trying* to take a shortcut.

**Where this stops working.** "Overfitting" is not a complete explanation of every strange failure. Some failures are about the *serving* setup rather than the training: a differently configured sampler, a wrapped prompt, or a context limit being exceeded will change behaviour with no training issue involved at all. Before blaming training, check the layer. Phase 1's model-versus-product distinction applies here.

### Part 5 — Post-training is where the assistant is manufactured

Now the part that answers the question you have probably been holding since Part 2: if the objective is just "continue the text plausibly", why does a chat assistant refuse things, format things, and address you politely?

The answer is that a chat assistant is not the pre-trained model. It is the pre-trained model plus one or more additional training stages. This is the single most useful structural fact in the phase.

**Pre-training** is Part 2 and Part 3: next-token prediction over a huge corpus, producing a base model. A base model is a text continuer. Ask it a question and it will often continue with more questions, because in its corpus questions frequently appear in lists of questions. Give it a partial sentence and it completes it. It has no stable notion that it is an assistant, because nothing in its training said so. It is not broken; it is doing precisely what it was trained to do.

**Instruction tuning** is the second stage. Here the data changes completely and becomes small by comparison — typically thousands to hundreds of thousands of examples rather than trillions of tokens. Each example has a specific shape: a request, and an ideal response. The training objective is still next-token prediction, but now the corpus consists of demonstrations of a helpful assistant responding to requests. The model is shown, over and over, what "the text after a request" looks like when the author is a good assistant. It learns the pattern: when the input looks like a request, produce a response rather than more requests.

That is the mechanism, and it is worth being blunt about what it does and does not do. Instruction tuning **does not add knowledge**. Its data is vastly smaller than the pre-training corpus and contributes almost no new facts. What it does is reshape *behaviour*: it teaches the model to treat instructions as instructions, to adopt a shape and a register that matches the demonstrations, and to stop being a raw continuer. This is why a base model and its instruction-tuned sibling can score similarly on knowledge tests while feeling like entirely different products.

**Preference learning and RLHF** is the third stage, and it is where tone, helpfulness, and refusals mostly come from. The core idea is simple: instead of demonstrating the single best answer, show a human two candidate answers to the same request and record which one they prefer. Collect a large number of those comparisons — this is where "human feedback" enters the pipeline, and it is also where human bias enters, which is a subject in its own right.

Then train a separate model, often called a reward model, to predict which response a human would prefer. It learns the preferences from the comparison data. Finally, use that reward model as the score during further training of the main model: generate responses, let the reward model score them, and nudge the main model toward higher-scoring responses. The model is not being told the answers; it is being shaped toward the region of behaviour that the reward model likes.

This is why two products built on the same base model feel different. The base is identical. The instruction-tuning data, the preference data, who labelled it, what guidelines the labellers worked from, and how strongly the optimisation is pushed toward the reward model — all of those differ. A lab that prioritises cautious refusals produces a cautious assistant. A lab that prioritises permissiveness produces a permissive one. Neither is a property of the underlying model; both are properties of the post-training pipeline.

Here is the summary structure, which is the table to memorise from this phase:

| Stage | Data | What it installs | What it cannot install |
|---|---|---|---|
| Pre-training | Trillions of tokens of filtered text | Knowledge, language, associations, patterns | Assistant behaviour, instruction-following, format discipline |
| Instruction tuning | Thousands to hundreds of thousands of request/response pairs | Treating a request as an instruction; response shape and register | New factual knowledge at any meaningful scale |
| Preference learning / RLHF | Human comparisons between candidate responses | Tone, helpfulness, refusal behaviour, hedging, formatting preferences | Knowledge the pre-training never saw; guarantees of truth |

Read that table as a division of labour. Pre-training decides what the model *can* know. Post-training decides how it *behaves* with what it knows.

**Where this stops working.** Post-training also runs the overfitting risk, and more sharply. Preference data is small and expensive, and a reward model is an approximation of human judgement, not human judgement itself. Optimise hard against an approximate score and you get responses that score well and satisfy nobody — the same memoriser-versus-learner failure as Part 4, with a proxy instead of a true objective. It is also genuinely hard to train a model to be honest in general, because "honest" is not a property a next-token objective can measure; only specific demonstrations and specific preferred answers can be.

### Part 6 — The boundary: what post-training cannot do

This is the part of the phase that pays for itself, because it lets you predict failures instead of being surprised by them.

You now have a two-layer picture. Pre-training deposits a body of associations from a fixed corpus. Post-training shapes how the model behaves when it draws on them. The consequence is a hard boundary:

> **Post-training cannot add knowledge that pre-training never saw. It can only change how the model uses what it already has.**

Everything practical follows from that sentence.

**Why a model cannot know about an event after its training cutoff.** The cutoff is when the pre-training corpus stopped being collected. After that, the model's parameters simply contain nothing about the event — it is not filed under "unknown", it is absent. Post-training does not help. So when you ask about a post-cutoff event, the model has two bad options: produce a plausible-sounding continuation, or refuse. Which it does depends entirely on how its post-training shaped its behaviour around ignorance, not on anything it knows. This is exactly why instruction tuning and RLHF are the reason assistants do not simply hallucinate every time — but also why they cannot make the answer correct.

**Why giving it more instructions does not fix a missing fact.** "Be accurate" is a behaviour instruction. It can make a model more cautious, more hedged, more willing to say it is unsure. It cannot conjure a fact that is not represented in the parameters. If you want the model to know something, the fix is retrieval or fine-tuning, which is Track 4 and Track 6 territory — not post-training, and not a better prompt.

**Why a niche topic produces confident nonsense.** Rare topics appear rarely in the corpus. With little evidence, the model has a flat distribution over continuations, and a flat distribution still gets sampled into a fluent sentence. Post-training may have taught it to hedge in general, but the hedge is a behaviour, and behaviour competes with the strong pull toward producing an answer-shaped string. This is why hallucination is a natural consequence of the objective rather than a bug, exactly as Phase 1 argued.

**Why "it knows X, so it must know the prerequisite Y" is unreliable.** Knowledge is an association structure, not a syllabus. Prerequisites are relationships in the data; if the data rarely expresses them, the model may produce one without the other. You cannot assume a dependency graph.

**Why the same prompt gets different answers from different products.** Part 5. The base may be identical; the post-training differs. Tone, refusal boundaries, formatting conventions, whether it offers to help further — all of that is trained behaviour and all of it is product-specific.

> **Retiring the "two-layer" analogy.** It is useful for the knowledge/behaviour split and it breaks if you take it too literally, in two ways. First, the stages are not cleanly separated — some post-training data does contain facts, just not many, and heavy post-training on a narrow domain can shift behaviour so far that it looks like new knowledge. Second, real pipelines have more stages than three: there is often a preliminary supervised stage before preference learning, and additional safety-specific tuning afterwards. The two-layer picture is a model of the division of labour, not an architectural diagram.

**Where the whole framework stops working.** Everything in this phase describes how a model comes to have its parameters. It says nothing about how a *deployed system* behaves. Prompting, retrieval, tool use, memory, and the surrounding agent scaffolding can change system behaviour more than any training decision — and they sit entirely outside this lesson. When a system does something surprising, check the invisible layer first: what was in the prompt, what did the harness inject, what did retrieval return. Training explains the distribution of habits. The deployment explains the specific behaviour you just saw.

## Hands-on practice tasks

1. Find a dataset card on Hugging Face for an instruction-tuning dataset and read five raw examples. Note the exact format of each request/response pair. <!-- id: found-02-how-models-learn-t01 band: quick energy: low -->
2. Ask a chat assistant what its training cutoff is, then ask about an event you know happened after it. Record whether it admits ignorance, hedges, or invents — and write down which of those you predicted first. <!-- id: found-02-how-models-learn-t02 band: quick energy: normal -->
3. If any provider you can access offers a base or completion model, give it a plain question with no chat formatting and no system prompt. Compare its response to the same question through the chat product. Describe the difference in terms of instruction tuning. <!-- id: found-02-how-models-learn-t03 band: focused energy: normal -->
4. Ask the same question through four different chat products. Record the differences in tone, length, formatting, hedging, and willingness to answer. Attribute each difference to post-training rather than to the base model, and say why. <!-- id: found-02-how-models-learn-t04 band: focused energy: normal -->
5. Pick a niche topic you know deeply — a local place, a small organisation, a specialised hobby. Ask ten factual questions about it. Count how many answers are correct, plausible-but-wrong, or refusals, and relate the pattern to how often that topic likely appeared in a filtered web crawl. <!-- id: found-02-how-models-learn-t05 band: focused energy: normal -->
6. Write an instruction that asks the model to be maximally accurate and to admit uncertainty. Then ask it the ten niche questions again. Record how much the instruction changed the outcome, and state plainly whether behaviour instructions fixed the knowledge gap. <!-- id: found-02-how-models-learn-t06 band: focused energy: high -->
7. In a free notebook, write a tiny training loop in pseudocode or Python that fits a curve to a handful of points. Watch the loss fall. Then add more points and re-run. Write down in plain words what changed and why. <!-- id: found-02-how-models-learn-t07 band: deep energy: high -->
8. Take one prompt and change only its *format* — a request phrased as a filling-the-blank sentence rather than as a question. Observe whether behaviour degrades. Explain the result in terms of what shapes of text the model saw during training. <!-- id: found-02-how-models-learn-t08 band: focused energy: normal -->
9. Find a public benchmark leaderboard and locate its statement about data contamination or its limitations section. Write two sentences on why you would not take the top score at face value. <!-- id: found-02-how-models-learn-t09 band: quick energy: low -->
10. Over the week, keep a log of every model failure you personally encounter and label each one as knowledge-boundary, behaviour/post-training, format/generalisation, or deployment-layer. <!-- id: found-02-how-models-learn-t10 band: ongoing energy: low -->

## Common Pitfalls

**Believing post-training adds knowledge.** This is the mistake this phase exists to prevent. Instruction tuning and preference learning change how the model behaves; they add almost no facts. If you want the model to know something new, post-training is the wrong tool — retrieval or fine-tuning is the right one.

**Reading "trained on the internet" literally.** The corpus is filtered, deduplicated, weighted, and shaped by human decisions. The model's sense of normal is the dataset's distribution, not the world's.

**Treating loss going down as success.** Loss measures prediction of text. Your goal is usefulness. The gap between them is where post-training lives, and even post-training only narrows it, it does not close it.

**Assuming a bigger model fixes a behaviour problem.** If the problem is tone, format, or refusal, it is post-training. A larger base model with the same post-training pipeline may not help at all.

**Blaming training for a serving-layer problem.** Before concluding anything about how a model was trained, check the prompt, the system message, the sampler settings, and whether retrieval injected anything. Some "training" problems are configuration.

**Expecting honesty to be trainable in general.** Honesty is not a property a next-token objective can measure. Post-training can reward demonstrated honesty and preferred answers; it cannot install a general truth-tracking instinct.

**Taking benchmark scores at face value.** If benchmark text was in the training corpus, the score measures memorisation, not skill. This has happened repeatedly and is well documented.

**Assuming prerequisite knowledge transfers.** Knowledge is an association structure, not a syllabus. Knowing X does not reliably imply knowing the prerequisite Y.

## Deliverable / proof of work

Write `portfolio/foundations/02-how-models-learn.md` containing:

- **The dataset inspection** from practice task 1 — the dataset name, five raw examples quoted or paraphrased, and what the format tells you about what the model was being taught to do
- **Your cutoff experiment** from practice task 2 — your prediction written before you asked, the actual behaviour, and which of the three possible behaviours occurred
- **Your base-versus-instruct comparison** from practice task 3, or, if you had no access to a base model, a written description of what you would expect to differ and why
- **The four-product comparison** from practice task 4, as a table with one row per product and one column per behavioural axis (tone, length, formatting, hedging, willingness)
- **Your niche-topic scorecard** from tasks 5 and 6, with a clear verdict on whether the accuracy instruction closed the knowledge gap
- **A section titled "Where the boundary is"** — three things you now believe post-training can never give a model, each with the mechanism-level reason, not just the claim
- **A short section titled "My layer diagnosis"** — take three real failures from your task 10 log and say which layer caused each one

## Checklist

- [ ] I can explain what a training dataset is and why it is a designed selection rather than raw web text <!-- id: found-02-how-models-learn-c01 energy: low -->
- [ ] I can explain a loss function as a score of wrongness without using calculus <!-- id: found-02-how-models-learn-c02 energy: normal -->
- [ ] I can explain gradient descent as measure-step-repeat and say why it requires millions of iterations <!-- id: found-02-how-models-learn-c03 energy: normal -->
- [ ] I can name the three things that scale together and explain why the cost is enormous <!-- id: found-02-how-models-learn-c04 energy: normal -->
- [ ] I can explain why training does not produce an inspectable list of rules <!-- id: found-02-how-models-learn-c05 energy: normal -->
- [ ] I can explain overfitting and generalisation using the memoriser-versus-learner distinction, and say where that analogy breaks <!-- id: found-02-how-models-learn-c06 energy: normal -->
- [ ] I can explain why a base model is not a usable assistant, in mechanism terms <!-- id: found-02-how-models-learn-c07 energy: normal -->
- [ ] I can explain what instruction tuning adds and why it adds almost no new knowledge <!-- id: found-02-how-models-learn-c08 energy: normal -->
- [ ] I can explain how human preference comparisons become a training signal <!-- id: found-02-how-models-learn-c09 energy: high -->
- [ ] I can explain why the same base model becomes different products after different post-training <!-- id: found-02-how-models-learn-c10 energy: normal -->
- [ ] I can name at least three behaviours that come from post-training rather than the base model <!-- id: found-02-how-models-learn-c11 energy: normal -->
- [ ] I can state the hard boundary: post-training cannot add knowledge pre-training never saw <!-- id: found-02-how-models-learn-c12 energy: low -->
- [ ] I can predict, before asking, whether a failure is a knowledge boundary or a behaviour problem <!-- id: found-02-how-models-learn-c13 energy: normal -->
- [ ] I can explain why benchmark contamination inflates scores <!-- id: found-02-how-models-learn-c14 energy: normal -->
- [ ] I have personally compared a base model and an instruction-tuned model, or written a reasoned expectation of the difference <!-- id: found-02-how-models-learn-c15 energy: high -->

## Quiz

### Q1. A model is trained to predict the next token with high accuracy on a large text corpus. Which property does this objective directly reward? <!-- id: found-02-how-models-learn-q01 energy: low -->

- [ ] Producing factually true statements and refusing when unsure
- [x] Assigning high probability to tokens that actually appear in the training data
- [ ] Staying consistent across repeated questions
- [ ] Declining requests it cannot fulfil correctly

**Why:** The loss measures surprise at the actual next token. Nothing in that objective references truth, consistency, or refusal. Those properties, where they exist, come from separate training stages or from the surrounding system.

### Q2. Why does a serious pre-training run take months rather than hours? <!-- id: found-02-how-models-learn-q02 energy: high -->

- [ ] Because datasets must be downloaded from the internet slowly
- [ ] Because each parameter is trained one at a time by a human
- [x] Because the step size must be small for stability, so an enormous number of steps is required
- [ ] Because the model must be retrained from scratch after every batch

**Why:** Large steps overshoot and destabilise the loss, so steps must be small, and small steps mean millions of iterations. The wall-clock cost is that iteration count multiplied by model size and batch size.

### Q3. A base model, asked a question with no chat formatting, responds by producing more questions. What is the best explanation? <!-- id: found-02-how-models-learn-q03 energy: high -->

- [ ] The model is broken by a training bug
- [ ] The model is refusing to answer
- [ ] The model has been trained to be unhelpful
- [x] In its pre-training corpus, questions frequently appear in sequences of questions, and it is continuing that pattern

**Why:** A base model has no notion of being an assistant because nothing in pre-training established one. It continues the shape it has seen. Instruction tuning is the stage that teaches it that text following a request should be a response.

### Q4. A lab instruction-tunes a base model on 50,000 high-quality request/response pairs. What should you expect to change most? <!-- id: found-02-how-models-learn-q04 energy: normal -->

- [ ] Its factual knowledge of the world will expand substantially
- [x] Its behaviour — instruction-following, response shape, and register — rather than its knowledge
- [ ] Its context window will grow
- [ ] Its number of parameters will increase

**Why:** Instruction-tuning data is tiny compared to a pre-training corpus and contributes almost no new facts. What it reshapes is behaviour: treating a request as an instruction and producing answers in the demonstrated shape.

### Q5. Two chat products use the same publicly released base model but behave very differently. What is the most likely cause? <!-- id: found-02-how-models-learn-q05 energy: high -->

- [ ] One is secretly running a different architecture
- [ ] The base model changes its behaviour randomly between deployments
- [ ] One of them is not actually using a language model
- [x] They differ in post-training: instruction data, preference data, labelling guidelines, and optimisation

**Why:** The pre-trained parameters can be identical while the instruction-tuning data, the preference comparisons, who labelled them, and how hard the reward model is optimised all differ. Post-training is where tone and refusal behaviour are manufactured.

### Q6. You ask about an event that happened after the training cutoff and get a confident, detailed, wrong account. What is the correct diagnosis? <!-- id: found-02-how-models-learn-q06 energy: normal -->

- [ ] The model knows the facts but chose to lie about them
- [ ] Post-training failed and should have taught it the event
- [ ] The model retrieved an incorrect document from its training data
- [x] The facts are absent from the parameters, and the model produced a plausible continuation in the shape of an answer

**Why:** There is no retrieval during a normal forward pass, and post-training cannot add knowledge pre-training never saw. The event is simply not represented, and the objective rewards an answer-shaped continuation over an admission of ignorance.

### Q7. A model performs brilliantly on inputs resembling its training data but collapses on slightly unusual formatting of the same request. What does this illustrate? <!-- id: found-02-how-models-learn-q07 energy: normal -->

- [ ] The model has a specific bug for that format
- [x] Generalisation has limits: performance depends on resembling the distribution the model learned from
- [ ] The model is refusing because it does not understand the request
- [ ] The input exceeded the context window

**Why:** Learning a distribution means doing well on that distribution and poorly outside it. Unusual formatting moves the input outside the familiar region even when the content is identical, which is the same phenomenon as overfitting shown from the outside.

### Q8. A model tops a public benchmark leaderboard. Why should you be cautious? <!-- id: found-02-how-models-learn-q08 energy: high -->

- [ ] Benchmarks are always measured incorrectly
- [ ] Leaderboards only include small models
- [ ] High scores always indicate a model that is slow to run
- [x] Benchmark text may have been present in the training corpus, so the score could reflect memorisation rather than skill

**Why:** Contamination is the exam-memoriser problem at industrial scale. If the model has seen the answers, a high score is evidence of memorisation, not of the underlying capability the benchmark was meant to measure.

### Q9. Why is it not possible to give a complete inventory of what a trained model knows? <!-- id: found-02-how-models-learn-q09 energy: high -->

- [ ] The information is proprietary and deliberately hidden
- [ ] The knowledge is stored in a separate database that is not shared
- [x] Knowledge is stored as billions of numbers adjusted by optimisation, with no explicit rules or records written anywhere
- [ ] Models forget their training data immediately after training

**Why:** The training process never writes down a rule or a fact. It nudges a very large set of numbers in the direction that reduces prediction error. Recovering any structured account of what those numbers encode is a research problem, not a lookup.

### Q10. You want a model to know the contents of a document it has never seen. What is the appropriate fix? <!-- id: found-02-how-models-learn-q10 energy: normal -->

- [ ] Instruct it to be accurate and to check its facts
- [ ] Use a stronger base model with more parameters
- [ ] Nothing — models learn new documents automatically when prompted
- [x] Supply the document in the prompt or through retrieval, or fine-tune on it

**Why:** Post-training shapes behaviour and cannot inject knowledge the pre-training never contained. Instructions change how the model uses what it has; they cannot create absent information. That requires getting the text into the context or into the parameters.

## You're ready to move on when...

You can describe a training run end to end in plain language — dataset, loss, descent, and the enormous number of small steps — without reaching for calculus and without hand-waving. You can point at any behaviour a chat assistant exhibits and say whether it came from pre-training, from instruction tuning, from preference learning, or from the deployment layer around it.

And critically: you can state the boundary without hedging. You know that post-training reshapes behaviour and that it cannot add knowledge the pre-training never saw, and you have personally watched a model fail in a way that confirms it — a confident answer about something it could not possibly have had in its parameters.

## Free vs Paid

### What's free is enough

Everything in this phase is observable with a free chat tier and something to take notes in. The dataset inspection uses public dataset cards. The base-versus-instruct comparison is the only task that wants a playground with a base model, and plenty of free playgrounds offer completion-style models — and if none is available to you, writing the reasoned expectation is an acceptable substitute, because the mechanism is what you are learning.

The notebook task is optional. If you have access to a free hosted notebook, it makes the loss curve concrete in a way that reading does not. If you do not, read the pseudocode loop in Part 3 carefully and move on; you will meet real training code in later tracks.

### What a paid tier adds

A paid chat tier adds stronger models and higher limits, which makes the four-product comparison in practice task 4 more interesting because you can include the frontier models. API access adds the ability to set system prompts explicitly and to compare a base endpoint against a chat endpoint, which turns practice task 3 from a reasoned expectation into a direct observation.

None of that changes what the phase teaches. The knowledge/behaviour boundary is visible in free products.

### When it's worth paying

**Not in this phase.** There is no experiment here that requires payment to be understood.

The honest threshold: consider API access when you reach Track 3 and want to control the sampler directly, or Track 4 when you start building retrieval and need to measure what the model actually received. By then the purchase is a decision about a specific experiment rather than a subscription you hope will teach you something. And note that the phase you are in right now is the one that tells you *why* retrieval will be necessary — because no amount of post-training can put a document into parameters that never saw it.
