---
id: found-01-what-a-model-is
track: foundations
phase: 1
order: 10
title: What a Model Actually Is
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal]
deliverable: portfolio/foundations/01-what-a-model-is.md
exit_criteria: >
  You can explain, without jargon, what a language model is doing when it
  answers you — and name two things it is definitely not doing.
---

# Phase 1 — What a Model Actually Is

## Goal of this phase

Build an accurate mental model of what a large language model is and what it is doing when it produces text. By the end you will be able to explain why it can be fluent and wrong at the same time, why it does not "look things up", and why the same question can produce different answers — and you will know which of those properties is a limitation and which is a design choice.

This phase contains no maths and no code. It is the conceptual foundation every later phase assumes, and getting it approximately right now prevents a great deal of confusion later.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

This is the shortest phase in the curriculum and one of the most important. Do not rush it because it looks easy — every misconception you carry out of here will resurface as a wrong prediction in Track 3.

## Skills you'll gain

- Explain what a language model computes, in plain language, without claiming it "thinks" or "knows"
- Distinguish a model from the product it is wrapped in (the chat app, the API, the agent)
- Explain why fluency and correctness are independent properties
- Explain why a model has a training cutoff and what that implies about its knowledge
- Predict, before trying, when a model is likely to be unreliable
- Correct the four most common misconceptions about what these systems are

## Specific topics to learn

### The core mechanic

- Next-token prediction as the entire training objective
- Why "predict the next token" produces something that looks like reasoning
- What the model produces at each step, and why the output feeds back in as input
- The difference between a *distribution over options* and a *choice*

### Model versus product

- The base model: a large file of numbers with no interface
- The chat product: the model plus a system prompt, a UI, memory, and safety layers
- The API: the model plus an interface designed for programs
- Why "the model said X" and "the app showed me X" are different claims

### What it is not

- Not a database — and why retrieval exists (Track 4)
- Not a search engine — and why it cannot cite what it never stored
- Not deterministic — and why that is often a feature
- Not a reasoning engine in the human sense — and what "reasoning" means when applied to it

### Knowledge and its limits

- Training data, and what "learned" means here
- The training cutoff, and why a model cannot know about last week
- Why it can still *talk about* last week if you tell it what happened
- Parametric versus non-parametric knowledge, in plain terms — the distinction that makes Track 4 make sense

### Fluency is not correctness

- Why the mechanism produces confident-sounding wrong answers
- Hallucination as a consequence of the objective, not a bug being patched
- Why "it sounds like it knows" is not evidence
- The asymmetry: a wrong answer is more dangerous than an absent one

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Any chat assistant you already have | Observe the behaviour this phase describes | Free tier | https://chatgpt.com/ | Ask it the same question three times and compare the answers | Any free chat model — the observation matters, not the brand |
| A second, different assistant | See that the properties are general, not one product's quirk | Free tier | https://claude.ai/ | Ask both the same nonsense question and compare how each fails | Google AI Studio, or a local model via Ollama |
| A notebook or text file | Record predictions before testing them | Free | — | Write your prediction, then check it | Paper |

## Free/cheap resources

- **Andrej Karpathy — Intro to Large Language Models** — https://www.youtube.com/watch?v=zjkBMFhNj_g
- **Andrej Karpathy — Deep Dive into LLMs** — https://www.youtube.com/watch?v=7xTGNNLPyMI
- **The Illustrated Transformer, Jay Alammar** — https://jalammar.github.io/illustrated-transformer/
- **3Blue1Brown — But what is a GPT?** — https://www.youtube.com/watch?v=wjZofJX0v4M
- **Anthropic — Intro to Claude (concepts)** — https://platform.claude.com/docs/en/intro-to-claude
- **OpenAI — Prompt Engineering Guide** — https://developers.openai.com/api/docs/guides/prompt-engineering

## Lesson: The Machine That Guesses the Next Word

### Part 1 — What it is actually doing

Start with the mechanism, stated as plainly as it can be stated, because almost every confusion in this field is downstream of not having it clearly.

**A language model is a function that takes a sequence of text and returns a probability for every possible next piece of text.**

That is the whole thing. Given:

```text
The capital of France is
```

a model returns something like:

```text
Paris      0.91
the        0.03
a          0.02
located    0.01
...        (thousands more, each with a small number)
```

Then something picks one of those options — usually `Paris`, usually not always — appends it to the sequence, and the whole process runs again with the slightly longer input:

```text
The capital of France is Paris
```

And now the model predicts what comes after *that*, which might be a period, or a comma and a clause, or nothing at all.

This is called **autoregressive generation**, and it is worth understanding why the word matters. "Autoregressive" means the output of one step becomes part of the input to the next. The model is not writing a sentence; it is writing a single token, looking at what it just wrote, and writing the next one. Every piece of text you have ever received from a chat assistant was produced this way, one step at a time, with the growing text re-read at every step.

**The size of that "thousands more" is worth pausing on.** A model's output layer produces a score for every token in its vocabulary — commonly in the range of 50,000 to 200,000 possible pieces of text — and the probability distribution is over all of them. So the model is not choosing from a handful of plausible completions. It is scoring an enormous space and then something selects from it.

That "something" is the **sampler**, and it is a separate piece of machinery with its own settings — temperature, top-p — which is the subject of Phase 6. For now the important consequence is this: **the model produces a distribution, and a separate step chooses.** Two requests with identical input can produce different output, and that is not a malfunction.

#### Why this produces something that looks like reasoning

Here is the part that surprises people, and it is genuinely surprising.

Nothing in the objective says "think", "reason", or "be correct". The objective is: given this text, what comes next? That is all.

But consider what kind of text appears in the training data. It includes worked mathematics. It includes code with explanations. It includes arguments where a conclusion follows from premises. It includes the text of people reasoning out loud, correcting themselves, and arriving at answers.

**To predict the next token in *that* text accurately, a model has to develop internal structure that tracks the thing being reasoned about.** If you are trying to predict what comes after "therefore, the total is", the most useful internal representation is the running total. Predicting text well, across a corpus that contains reasoning, requires modelling the reasoning.

This is the single most important idea in this phase, and it cuts both ways:

- It explains why these systems can do things that look like genuine understanding, far beyond what "autocomplete" suggests.
- It explains why the failures look the way they do. **A model is optimised for text that is plausible in context — not for text that is true.** These usually coincide, because most text that is plausible in context is also true, or at least written by someone who believed it. But they come apart precisely where plausible-sounding falsehoods are common in the training data, or where a confident wrong answer is more *textually typical* than an honest "I don't know".

That last point is where hallucination comes from, and we will return to it in Part 5.

#### A concrete way to see the distribution

If you have API access to any provider, this is worth doing once — it will make everything else concrete. Most providers can return the *log probabilities* of the tokens they generated, which is the model's own confidence in each choice. Ask for a factual completion and read them.

If you do not have API access, you can observe the same thing from the outside: ask the same factual question with the same wording, several times, in several sessions. Watch which ones come back identical and which vary. **Facts the model is confident about come back the same. Facts it is marginal on vary** — because at low confidence, small differences in the sampling step flip the choice.

That variation is not the model "being creative". It is the distribution being flat and the sampler exploring it.

---

### Part 2 — The model is not the product

This distinction sounds pedantic and is not. A great deal of confused argument about AI comes from attributing a product's behaviour to the model inside it.

**The base model** is a large file of numbers. It has no interface, no memory, no personality, and no idea it is in a conversation. If you fed it `The capital of France is` it would continue that text, because continuing text is all it does. It has no notion of "you" or "a question".

**A chat product** is the base model wrapped in several layers:

1. **A system prompt** — instructions prepended to your conversation, written by the product's creators, that you usually do not see. This is where much of a product's "personality" and much of its refusal behaviour actually lives.
2. **The interface** — the box you type in, the streaming text, the conversation history being resent with every message.
3. **Memory and tooling** — conversation summaries, web search, code execution, file access.
4. **Safety layers** — classifier models that inspect inputs and outputs independently of the main model.

**An API** is the model plus an interface for programs: authentication, a request format, rate limits, and billing. It is closer to the base model than a chat app is, but it still carries a default system prompt and safety layers, and those differ by provider.

Why this matters, concretely:

- When a chat app refuses something, the refusal may be coming from a **safety classifier**, not the model. The model never saw your message.
- When a chat app "remembers" a previous conversation, that is **the app resending the earlier text** with your new message. The model has no memory between requests. Every request is a fresh, complete, self-contained computation.
- When two products using the same underlying model behave differently — different tone, different refusals, different formatting — the difference is in the **system prompt and the layers around it**, not in the model.
- When the model's behaviour changes overnight without an announcement, the cause is often a system prompt edit or a safety-layer update, not a new model version.

> Think of the base model as an engine and the product as a car. The engine's properties are fixed and measurable. How the car drives depends on the transmission, the tyres, and who tuned it. Saying "the engine refused to start" when the battery is flat is the category error this distinction prevents.
>
> The analogy's limit: an engine is a physical object with one behaviour, while a base model is a probability distribution whose output depends on the sampler. Two cars with the same engine do drive differently — but two requests to the same model with the same engine *also* often differ, which no car does.

**The practical rule:** when you see a behaviour you want to change, ask which layer it lives in. A tone problem is a system prompt problem. A "it doesn't know about my document" problem is a context problem. A "it refuses this legitimate request" problem may be a safety-layer problem you cannot prompt your way out of. Misdiagnosing the layer means fixing the wrong thing, repeatedly.

---

### Part 3 — What it is not

Four denials, each of which prevents a specific wrong prediction later.

#### It is not a database

The model does not store text and look it up. Its training compressed a vast corpus into a set of parameters — numbers that shape its predictions. There is no `SELECT` happening, and no row for the fact you asked about.

This has a directly testable consequence: **a model can recall a fact approximately and be unable to tell you it is doing so.** A database either has the record or does not; it cannot return a 90%-correct record with full confidence. A model can, and will.

This is exactly why **Track 4 (Retrieval)** exists. When you need the model to answer from a specific document rather than from its compressed impression of the world, you retrieve the relevant text and put it in the context, so the model's answer can be grounded in text that is actually present rather than in parameters that encode a blurry version of it.

#### It is not a search engine

A search engine indexes documents and returns them. It can tell you where a claim came from, because it never generated anything — it found something.

A model generates. When it produces a citation, that citation is **generated text that looks like a citation**, and it may refer to a real paper, a real paper with the wrong title, a plausible-sounding paper that does not exist, or a real paper by the right authors in the wrong year. All four are produced by the same mechanism with the same confidence.

**Treat every citation, URL, statistic, quotation, and API detail from a model as unverified until you have opened it.** Not because the model is lying — it has no concept of lying — but because generating a convincing citation and recalling a real one are the same operation from the inside.

#### It is not deterministic

Same input, different output — often. Whether it happens depends on the sampling settings, and there is a common misconception worth correcting here: **setting temperature to zero makes a model much more deterministic but not perfectly so.**

Three reasons it can still vary:

1. **Floating-point arithmetic on parallel hardware is not associative.** Adding the same numbers in a different order gives slightly different results, and the order depends on how work is distributed across GPU cores, which is not fixed. Tiny differences can flip a near-tie in the distribution.
2. **Batching.** Providers process many requests together for efficiency. What else is in the batch affects the arithmetic.
3. **Version changes underneath you.** A provider may update the model, the system prompt, or the serving stack at any time, and your "same request" now hits a different system.

**Design consequence:** never build anything that depends on getting the exact same string twice. Validate structure, not text. This is why the structured-output work in Prompting Phase 4 (*The Model Has No Parser*) matters more than it first appears.

#### It is not "reasoning" in the human sense

This needs care, because it is where people talk past each other.

Modern models do something that is usefully described as reasoning: they work through intermediate steps, and those steps causally affect the answer — asking a model to show its work genuinely improves accuracy on multi-step problems. That is not an illusion.

But it differs from human reasoning in ways that matter operationally:

- **There is no persistent world model being updated.** Each step is computed from the sequence so far, within a single forward pass. There is no separate belief store being revised.
- **There is no ground truth being checked against.** The process optimises for a plausible continuation, not for consistency with reality.
- **The "reasoning" is not inspectable in the way it appears.** A model can produce a chain of steps that reads as valid and did not drive the answer, or that was constructed after the fact to justify an answer already reached. The chain is generated text, like everything else.
- **It does not know when it does not know** — not in the way a person does. It has no reliable internal signal that separates "I recall this" from "I am constructing something plausible."

**Practical upshot:** reasoning-style prompting is a real and effective technique (Track 3, Prompting), and it should be used. It is not a guarantee. The check on a model's reasoning is external — you verify the answer, you test it, you check it against a source. Track 8 is largely about building that habit into a workflow.

---

### Part 4 — Knowledge, cutoffs, and the two kinds of knowing

A model's knowledge comes entirely from its training data. Two consequences follow, and both are things beginners get wrong in predictable ways.

#### The training cutoff

Training takes time — weeks to months for a large model, between gathering the data and finishing the training run. So every model has a **cutoff**: a date past which it has no training data at all.

Ask a model about an event after its cutoff and one of several things happens, none of them good:

- It says it does not know. **This is the best outcome and not the most common one.**
- It confuses the event with a similar earlier one.
- It generates a plausible account assembled from related material, presented with the same confidence as a real memory.

The third is the dangerous one, because it is indistinguishable from a correct answer by tone alone.

**You can still get accurate answers about recent events — by telling the model about them.** Paste the article into the conversation and ask about *that*. The model is now working from text in front of it rather than from parameters. This is context, and it is one of the two kinds of knowledge.

#### Parametric versus non-parametric knowledge

This distinction is worth learning properly now, because it organises most of the second half of the curriculum.

**Parametric knowledge** lives in the model's weights. It is what training taught it. It is:

- always available, with no setup
- blurred — approximate recall, not exact storage
- frozen at the cutoff
- impossible to update without retraining or fine-tuning
- unverifiable from the inside; the model cannot tell you where it learned something

**Non-parametric knowledge** lives outside the model, in text you supply. It is:

- exact, because it is the actual document
- current, because you chose it
- updated instantly — change the file and the next answer changes
- verifiable, because you can read the source yourself
- limited by whether you supplied the *right* text, and by the context window

Every technique in Tracks 4 and 5 is a way of moving knowledge from the first category into the second:

| Problem | Track | Approach |
|---|---|---|
| The model does not know my documents | 4 (RAG) | Retrieve relevant passages, put them in context |
| The model does not know about last week | 4 (RAG) | Same — fetch current text |
| The model cannot use my tools | 5 (Agents) | Define tools, let it call them |
| The model's *style* is wrong | 6 (Finetuning) | Change the weights — usually the wrong tool |

**The rule of thumb, worth internalising now:** if the problem is *what the model knows*, put it in the context. If the problem is *how the model behaves*, consider changing the weights. Almost everything people reach for fine-tuning to fix is actually a context problem, and Track 6 explains why they reach for it anyway.

---

### Part 5 — Why it is fluent and wrong at the same time

This is the most practically important part of the phase.

Fluency and correctness are **independent properties**. A model can be:

| | Correct | Incorrect |
|---|---|---|
| **Fluent** | The good case | **The dangerous case** |
| **Awkward** | Rare, and easy to catch | Easy to catch, and harmless |

The top-right cell is where the damage happens. Fluent-but-wrong is dangerous precisely because the surface gives you no signal. A confident, well-structured, grammatically perfect wrong answer is *more* persuasive than a correct one hedged with uncertainty — and models are trained, through human feedback, to be confident and well-structured.

#### Where it comes from

Hallucination is not a separate bug bolted onto an otherwise reliable system. It follows from the objective.

**The model is optimised to produce text that is plausible given the context. In the training data, text in the position "the answer is ___" is overwhelmingly followed by an answer, not by "I don't know."** So the model's pressure is always toward producing something that fills the slot.

Consider the difference between these two continuations:

```text
Q: What year did the Treaty of Westphalia end the Thirty Years' War?
A: 1648
```
```text
Q: What year did the Treaty of Westphalia end the Thirty Years' War?
A: I'm not certain, and I'd rather not guess.
```

The second is honest. The first is what actually appears in the training data, thousands of times. **The model is doing its job when it produces the first one** — even when the correct answer is not in its parameters and what it produces instead is a plausible year assembled from surrounding material.

This is why "just tell it not to hallucinate" has limited effect. You are asking it to go against its objective in exactly the situations where the objective is most strongly expressed. Instruction helps at the margin — it genuinely raises the rate of honest uncertainty — but it does not remove the mechanism.

#### The asymmetry that decides everything

There is an asymmetry between these two errors, and it should shape how much you trust any output:

- **A wrong answer costs you the work of finding out it was wrong.** If you catch it, the cost is bounded and you learn something.
- **A missing answer costs you almost nothing.** You know immediately, and you go find the source.

**Wrong-and-confident is worse than absent.** A good system is designed to fail toward the second. This is the reasoning behind:

- Asking for explicit uncertainty, and giving the model somewhere to put it
- Making the model cite sources you can check (Track 4)
- Verifying outputs programmatically rather than reading them (Track 8)
- Preferring a system that says "not in the provided documents" over one that always answers

#### When it is most likely to happen

You can predict this before trying, which is the point of learning the mechanism. The risk is highest when:

| Condition | Why |
|---|---|
| **Specifics: numbers, dates, names, URLs, citations** | Exact strings cannot be usefully blurred; the model produces the *shape* of one |
| **The question presupposes something false** | The model answers the question as asked rather than correcting the premise |
| **Obscure or niche topics** | Less training signal, so the distribution is flatter and the plausible-looking wrong answer wins |
| **After the training cutoff** | No data at all — the model is extrapolating from related material |
| **Long, complex, multi-part requests** | Attention is spread thin; later constraints get dropped (Track 1 Phase 3) |
| **When you have signalled the answer you want** | Leading questions get agreeable answers — sycophancy, covered in Track 3 |
| **Code and API details** | The model produces plausible API calls for methods that never existed |

Notice that these are exactly the situations where you would most *want* to use an AI assistant. That is not a coincidence; it is the reason Track 8 exists as a whole.

---

### Part 6 — Doing this to yourself

Reading about the failure modes is much weaker than producing them deliberately. This exercise takes twenty minutes and will do more for your judgement than the rest of the phase.

**The plan:** write down your prediction, then test it.

1. **Pick five factual questions you know the answers to** — from your own life, your work, your city, a hobby. Not trivia, and not facts you would have to look up. Local things work best: your university, your barangay, a local business, a bus route.

2. **Before asking, write down what you expect.** For each: "I expect a correct answer", "I expect it to hedge", or "I expect it to make something up confidently".

3. **Ask a chat assistant each question in a fresh conversation.** Fresh matters — earlier context changes the answer.

4. **Score each response** against your prediction:
   - Correct and appropriately confident
   - Correct but oddly hedged
   - Wrong and confident ← **this is the one you are looking for**
   - Wrong but hedged (the least harmful failure)

5. **Then ask about something after the model's cutoff.** Write down your prediction first. Watch what it does when asked about an event it has no data for. Does it say it does not know? Does it produce an account anyway? Does it tell you its cutoff?

The results are usually more interesting than people expect. Local and niche questions produce confident errors at a rate that surprises almost everyone, and **seeing one produced in a domain where you are the expert is what converts this from a claim into knowledge.**

That experience is the actual deliverable of this phase. Everything else is scaffolding around it.

> **A note on predicting first.** Writing the prediction down before testing is not a formality. Without it, you will rationalise whatever happened as what you expected — a well-documented bias, and one that would completely destroy the value of this exercise. The written prediction is what makes the test a test.

---

### Part 7 — The vocabulary, stated once

Terms you will meet constantly, defined here so later phases can use them without re-explaining.

**Token** — the unit a model actually processes. Not a word and not a character; roughly three-quarters of a word in English, but highly variable. The subject of Phase 3, and the unit in which everything is priced.

**Context window** — the maximum number of tokens the model can consider at once, covering both your input and its own output. The central budget of everything you do.

**Prompt** — everything you send: system instructions, conversation history, retrieved documents, your message. In the API, all of it is billed as input.

**Completion / output** — the tokens the model generates. Usually priced higher than input, because generating is more expensive than reading.

**Parameters / weights** — the learned numbers inside the model. "A 70B model" has roughly 70 billion of them. Size correlates with capability and with the hardware needed to run it, but is far from the whole story (Track 2).

**Inference** — running the model to get an output. Distinct from *training*, which produced the weights, and from *fine-tuning*, which adjusts them.

**Training cutoff** — the date past which the model has no training data.

**Parametric / non-parametric knowledge** — knowledge in the weights versus knowledge in the context. The distinction that organises Tracks 4–6.

**Hallucination** — fluent output that is not grounded in fact or in the provided context. A consequence of the objective, not an independent defect.

**Temperature, top-p** — sampler settings controlling how the distribution is sampled. Phase 6.

**System prompt** — instructions prepended by the product or by you, distinct from the user's message, and often invisible.

**Grounding** — supplying source text so an answer can be based on it rather than on parameters. The core idea of Track 4.

---

### Part 8 — The four misconceptions to drop

Stated as corrections, because each one causes a specific wrong prediction later.

**"It's a search engine for facts."**
It generates text. It has no index and cannot look anything up unless a tool is attached. This is why it invents citations.

**"It knows things the way I know things."**
It has a compressed statistical impression of text about a subject. It cannot distinguish recalling from constructing, and neither can you from the outside.

**"If it's confident, it's probably right."**
Confidence is a property of the generated text's style, not a calibrated signal. Models are trained toward confident, well-formed answers. The most dangerous output is the fluent wrong one.

**"Bigger/newer means it will know my specific thing."**
No amount of scale gives a model access to a document it was never trained on, or an event after its cutoff. That is what context, retrieval and tools are for.

---

## Hands-on practice tasks

1. Ask one factual question three times in fresh conversations and compare the answers. Record whether they differ and how. <!-- id: found-01-t01 band: quick energy: low -->
2. Write down five facts you are personally expert in, predict how the model will handle each, then test all five and score yourself against your predictions. <!-- id: found-01-t02 band: focused energy: normal -->
3. Ask a model about an event after its cutoff without telling it when the event happened. Observe whether it admits ignorance or invents. Then paste in a real article about the event and ask again. <!-- id: found-01-t03 band: focused energy: normal -->
4. Ask the same model the same question through two different products (or two different system prompts) and identify what changed — tone, refusal, format, content. Decide which layer caused the change. <!-- id: found-01-t04 band: focused energy: normal -->
5. Ask a model to cite three sources for a niche claim. Open every URL. Record how many were real, how many were real-but-mismatched, and how many did not exist. <!-- id: found-01-t05 band: focused energy: normal -->
6. Ask a model to describe a well-known local place, person or institution you know well, and mark every detail that is wrong. <!-- id: found-01-t06 band: quick energy: low -->
7. Set the same prompt to run with temperature 0 five times (through an API if you have access, or by asking the same thing in fresh conversations if you do not). Document every difference you find. <!-- id: found-01-t07 band: focused energy: normal -->
8. Write a 200-word explanation of what a language model does, without using the words "AI", "understand", "know", or "think". Rewrite until it is accurate. <!-- id: found-01-t08 band: quick energy: normal -->

## Common Pitfalls

**Mistaking the product for the model.** Most confusion about AI behaviour comes from attributing something to the model that belongs to the surrounding system prompt or safety layer. Before concluding anything about a model, ask which layer produced what you saw.

**Treating confident tone as a confidence signal.** It is not calibrated. A model's fluency is roughly constant whether it is right or wrong, which is precisely what makes the wrong case dangerous.

**Concluding "it's just autocomplete" and dismissing it.** The mechanism is next-token prediction; the capability that emerges from doing it at scale across a corpus full of reasoning is real and substantial. Both halves of that sentence are true, and dropping either one leads to bad predictions.

**Concluding "it understands, so I can trust it."** The opposite error, and the more expensive one. Capability and reliability are separate axes, and the second does not follow from the first.

**Skipping this phase because it looks basic.** Every misconception left standing here becomes a wrong prediction in Track 3 or an expensive mistake in Track 7.

**Testing on topics you do not know.** You cannot detect a confident wrong answer in a domain where you cannot tell. The whole exercise in Part 6 depends on testing where you are the expert.

## Deliverable / proof of work

Write `portfolio/foundations/01-what-a-model-is.md` containing:

- **Your prediction test** — the five questions, your predictions written *before* asking, the actual answers, and your scoring against your own predictions
- **One confident wrong answer you personally produced**, quoted verbatim, with an explanation of why the mechanism produced it
- **Your 200-word explanation** from practice task 8, with no forbidden words, and a note on which word you kept reaching for and why
- **A short section titled "What I will not trust this for"** — three specific task types you will not hand to a model without verifying, and the reason for each

## Checklist

- [ ] I can explain what a language model computes without using the word "knows" <!-- id: found-01-c01 energy: low -->
- [ ] I can distinguish the base model from the chat product and from the API <!-- id: found-01-c02 energy: low -->
- [ ] I can name three differences between the model and the product wrapping it <!-- id: found-01-c03 energy: normal -->
- [ ] I can explain why fluency and correctness are independent properties <!-- id: found-01-c04 energy: normal -->
- [ ] I can explain why hallucination follows from the training objective rather than being a separate bug <!-- id: found-01-c05 energy: normal -->
- [ ] I can name three things a model is definitely not <!-- id: found-01-c06 energy: low -->
- [ ] I can predict, before asking, which kinds of question are most likely to produce a confident error <!-- id: found-01-c07 energy: normal -->
- [ ] I can explain why temperature 0 is not perfectly deterministic <!-- id: found-01-c08 energy: high -->
- [ ] I can distinguish parametric from non-parametric knowledge and say which one retrieval addresses <!-- id: found-01-c09 energy: normal -->
- [ ] I have personally produced a confident wrong answer and identified its cause <!-- id: found-01-c10 energy: normal -->
- [ ] I can explain the training cutoff and what happens when you ask past it <!-- id: found-01-c11 energy: low -->
- [ ] I can name the layers between a base model and a chat product <!-- id: found-01-c12 energy: normal -->

## Quiz

### Q1. A model gives a different answer each time to the same factual question. What does this most likely indicate? <!-- id: found-01-q01 energy: normal -->

- [ ] The model's weights are being changed between requests
- [x] The probability distribution over possible answers is relatively flat, so sampling picks different options
- [ ] The provider is deliberately randomising output to prevent copying
- [ ] The model is searching the web and finding different sources each time

**Why:** A flat distribution means several continuations have similar probability, so the sampler's choice varies between runs. A confident fact produces a peaked distribution and repeated identical answers; variation is a signal of the model's own uncertainty.

### Q2. You ask about a niche local event and get a detailed, confident, entirely wrong account. What is the best explanation? <!-- id: found-01-q02 energy: high -->

- [ ] The model deliberately invented the answer to mislead
- [ ] The model retrieved the wrong document from its training data
- [x] The model generated text that is plausible in the position "an answer goes here", which is what its objective rewards
- [ ] The model has a bug specific to local information

**Why:** The objective is plausible continuation, and in the training data the slot after a question is almost always filled with an answer rather than with an admission of ignorance. Niche topics give a flatter distribution, so a plausible-looking construction wins.

### Q3. A chat product refuses a request, but the same request succeeds through the provider's API. What most likely explains the difference? <!-- id: found-01-q03 energy: high -->

- [ ] The API uses a more capable model than the product does
- [ ] The product's model is a different, older version
- [ ] The API bypasses the model's training
- [x] The product applies its own safety layer or system prompt that the API request did not go through

**Why:** A chat product wraps the model in a system prompt and often independent classifier models that inspect inputs and outputs. Those layers are absent or configured differently on the API path, so the underlying model's behaviour is unchanged while the surrounding behaviour is not.

### Q4. Why can a model answer accurately about an event that happened after its training cutoff? <!-- id: found-01-q04 energy: normal -->

- [ ] Because the model updates its weights when it learns new information in a conversation
- [x] Because you supplied text describing the event, so the answer is grounded in the provided context rather than in the weights
- [ ] Because its training data actually extends past the stated cutoff
- [ ] Because it searched the internet before answering

**Why:** This is the parametric/non-parametric distinction. Supplying the text moves the knowledge from blurred and frozen parameters into exact and current context. The model itself has not learned anything that persists.

### Q5. Which output is more dangerous, and why? <!-- id: found-01-q05 energy: high -->

- [ ] A refusal to answer, because it stops your work entirely
- [ ] An awkward, hedged, uncertain wrong answer, because it is harder to read
- [ ] A short answer, because it omits necessary detail
- [x] A fluent, confident, well-structured wrong answer, because nothing about its presentation signals that it should be checked

**Why:** The danger is the absence of a signal. Awkward output and refusals both announce themselves and cost you only the time to notice. Fluent wrong output is persuasive and looks exactly like correct output, which is why verification has to be designed into a workflow rather than left to judgement.

### Q6. A model produces a citation with a real author, a real journal, and a plausible title, but the paper does not exist. What is the mechanism? <!-- id: found-01-q06 energy: normal -->

- [ ] The model looked up a real paper and reported the wrong one
- [x] Generating the shape of a citation and recalling a real one are the same operation from the model's side, and it has no mechanism to tell them apart
- [ ] The citation exists but was removed from publication
- [ ] The model is trained to invent citations for copyright reasons

**Why:** The model has no lookup and no internal truth signal. A citation is generated text like any other; when the exact paper is not in its parameters, it produces something with the right structure and cannot distinguish that from genuine recall.

### Q7. Which statement about temperature 0 is accurate? <!-- id: found-01-q07 energy: high -->

- [ ] It guarantees byte-identical output for identical input
- [ ] It disables the sampling step entirely, so the model becomes deterministic
- [x] It makes output much more consistent but not perfectly reproducible, because hardware arithmetic, batching and server-side changes all introduce variation
- [ ] It has no measurable effect on consistency

**Why:** Temperature 0 makes the sampler near-greedy, which removes most variation, but floating-point addition order on parallel hardware, what else shares the batch, and any server-side model or prompt update all still change results. Structure can be relied on; exact text cannot.

### Q8. A model claims it remembers your earlier conversation. What is actually happening? <!-- id: found-01-q08 energy: normal -->

- [ ] The model stored the conversation in its weights
- [ ] The model has a persistent memory database inside it
- [ ] The provider fine-tuned the model on your conversation
- [x] The application is resending the earlier messages as part of the input, so they are present in the context

**Why:** The model is stateless between requests. Every request is a complete, self-contained computation. What looks like memory is the surrounding application including the prior text in the input — which is also why long conversations consume more of the context window and cost more per message.

## You're ready to move on when...

You can explain to a non-technical friend, in your own words and without hedging, what a language model is doing when it answers — and you can name at least two things it is definitely not doing. You have personally produced a confident wrong answer, predicted it would happen before it did, or understood after the fact exactly why the mechanism produced it.

## Free vs Paid

### What's free is enough

Everything in this phase needs no tooling beyond a free chat assistant and something to take notes in. Both major assistants have free tiers, and the properties this phase teaches — nondeterminism, confident errors, cutoff behaviour, the model/product split — are observable on any of them. The free path costs nothing and teaches the same thing.

### What a paid tier adds

A paid chat tier adds access to stronger models, longer context, file uploads and higher usage limits. An API key adds the ability to see log probabilities, control the sampler, and script experiments — which makes some of the practice tasks sharper, particularly the determinism test.

### When it's worth paying

**Not in this phase.** If you have API access already through a free beta, use it for the log-probability observation, because it makes the distribution concrete in a way nothing else does. Otherwise skip it.

The honest threshold: pay for API access when you reach Track 3 and want to run the same prompt against several models in a loop, or when you reach Track 7 and want to measure your own token usage. By then you will know exactly what you are buying, which is the condition under which the purchase is a decision rather than a guess.
