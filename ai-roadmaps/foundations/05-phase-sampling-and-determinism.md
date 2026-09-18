---
id: found-05-sampling-and-determinism
track: foundations
phase: 5
order: 50
title: Sampling, Temperature, and Why Output Varies
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/foundations/05-sampling-and-determinism.md
exit_criteria: >
  You can explain what the sampler does with the model's probability
  distribution, predict how a given temperature and top-p setting will change
  the shape of your output, read a log-probability table and say what it tells
  you about the model's confidence, and name at least three causes of variation
  that no setting can remove.
---

# Phase 5 — Sampling, Temperature, and Why Output Varies

## Goal of this phase

Understand the sampler: the separate piece of machinery that sits after the model and turns a probability distribution into an actual choice. By the end of this week you will be able to explain what temperature does to a distribution rather than calling it a "creativity dial", explain why top-p is usually preferred over top-k, read a log-probability table and say what it means, and — most importantly — name the problems that no sampling setting can fix.

Phase 1 told you that a model produces a distribution and something else chooses. This phase is about that something else. Phase 3 established that the distribution is over tokens, not words, and Phase 4 established that producing the distribution costs work that has to be repeated at every step. Everything here is downstream of those two facts.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Roughly 5–8 hours total. The conceptual material is about two hours of genuine work; the rest is experiment time. Do the experiments — this is one of the few phases where you can watch the mechanism operate in front of you with tools you already have.

## Skills you'll gain

- Explain the difference between greedy decoding, sampling, and beam search, and say what each is actually optimising for
- Explain the mechanism of temperature — what it does to the numbers, and therefore when it helps and when it destroys output
- Predict how top-k, top-p, and min-p will each change a specific generation, and explain why the candidate pool matters more than the cutoff value
- Explain why top-p is usually the better default than top-k
- Explain what repetition and presence penalties do to the distribution, and identify the cases where they cause harm
- Explain why temperature 0 is not perfectly deterministic — naming hardware, batching, and server-side causes
- Read a log-probability table and use it to detect guessing, estimate confidence, and build a classifier
- Choose settings for a task by reasoning about the task's structure rather than by trial and error
- Recognise the failures that sampling settings cannot fix

## Specific topics to learn

### The act of choosing

- Why a distribution is not a decision, and what has to happen between them
- Greedy decoding: always take the single highest-probability token
- Random sampling from the raw distribution
- Beam search: keeping several partial sequences alive at once
- Why beam search mostly lost to sampling for open-ended generation

### Reshaping the distribution

- Temperature as a division inside the exponent — why it sharpens or flattens
- Temperature 0 as a special case (greedy), and the myth that it equals determinism
- Top-k: keep the k highest-probability tokens, renormalise
- Top-p (nucleus): keep the smallest set whose probabilities sum to p, renormalise
- Min-p: keep tokens above a fraction of the top token's probability
- Why the adaptive size of the nucleus is the point

### Penalties

- Repetition penalty as division of already-seen scores
- Presence and frequency penalties as subtraction from logits
- The three ways they cause harm: breaking code, breaking proper nouns, breaking exact quoting

### Determinism and its limits

- Seeds and pseudo-random number generators
- Floating-point non-associativity on parallel hardware
- Batch composition changing the arithmetic
- Server-side model, prompt, and kernel changes
- What "reproducible enough" means in practice

### Log probabilities

- Log-probabilities as the model's own numbers, before the sampler touches them
- Reading a table: what a value of −0.1 versus −4.0 means in probability terms
- Why low probability is not the same as wrong
- Confidence estimation, scoring, classification, and catching guesses
- What logprobs cannot tell you

### Practical settings

- Task-by-task starting points and the reasoning behind them
- The failures sampling cannot repair

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| OpenAI API Playground | See temperature, top-p and logprobs exposed as controls | Paid (pay-per-token, no monthly fee) | https://platform.openai.com/playground | Run the same prompt at three temperatures and compare | Google AI Studio — free tier with temperature and top-p controls |
| Google AI Studio | Run temperature, top-k and top-p experiments at no cost | Free tier | https://aistudio.google.com/ | Do the temperature sweep in practice task 2 | Any provider's free trial tier |
| Ollama | Run a model locally so you control every sampler setting | Free | https://ollama.com/ | Run the greedy-versus-sampled comparison from practice task 3 | llama.cpp, or any local inference server |
| llama.cpp | Local inference with full sampler control including min-p and seeds | Free | https://github.com/ggml-org/llama.cpp | Test min-p and seed reproducibility | Ollama, LM Studio |
| Hugging Face Transformers | Generate with an explicit `do_sample`, seed and penalty settings | Free | https://huggingface.co/docs/transformers/main/en/main_classes/text_generation | Read the generation parameters documentation | vLLM docs, or your local server's documentation |
| Python + requests | Call an API and inspect the JSON that comes back | Free | https://requests.readthedocs.io/en/latest/ | Print a logprob table as readable text | curl, or your provider's own SDK |
| Python | Keep a settings log and script repeated generations | Free | https://www.python.org/ | Record every experiment in one place | Paper notebook |

## Free/cheap resources

- **Hugging Face — Text generation strategies** — https://huggingface.co/docs/transformers/main/en/generation_strategies
- **Hugging Face — GenerationConfig reference** — https://huggingface.co/docs/transformers/main/en/main_classes/text_generation
- **OpenAI — API reference: chat completions parameters** — https://platform.openai.com/docs/api-reference/chat
- **OpenAI — Cookbook: using logprobs** — https://cookbook.openai.com/examples/using_logprobs
- **Google AI Studio — prompting and parameters docs** — https://ai.google.dev/gemini-api/docs/prompting-strategies
- **Ollama — model file and parameter documentation** — https://github.com/ollama/ollama/blob/main/docs/modelfile.md
- **llama.cpp — sampler documentation** — https://github.com/ggml-org/llama.cpp/blob/master/examples/main/README.md
- **Andrej Karpathy — Let's build the GPT Tokenizer** — https://www.youtube.com/watch?v=zduSFxRajkE
- **Andrej Karpathy — Deep Dive into LLMs** — https://www.youtube.com/watch?v=7xTGNNLPyMI

## Lesson: The Sampler — Turning Belief Into a Choice

### Part 1 — The distribution is not a decision

Open a chat assistant and ask it to complete "The capital of France is". Do it ten times. You will get `Paris` ten times, almost certainly. Now ask for "a name for a small coffee shop in Cebu City". Ask ten times. You will get ten different names, and none is obviously more correct than the others. Both requests went through the same machinery; the difference is the *shape* of the distribution the model produced, and what the sampler did with it.

Recall from Phase 1: at every step, the model's final layer produces a score for every token in the vocabulary — commonly in the range of 50,000 to 200,000 tokens, depending on the model (as of early 2026; this changes between releases, so check your own model). Those scores pass through a softmax function, which converts arbitrary numbers into positive numbers that sum to 1. That is a probability distribution.

**A probability distribution is not a decision.** It describes how much the model favours each option; something still has to pick one. That something is the sampler — a genuinely separate component, often separate code in a serving stack, configured per request. The model does not know or care what it is set to.

Concretely, suppose the distribution for the next token after "The capital of France is" looked like this:

```text
Token      Probability
Paris        0.910
the          0.031
a            0.018
located      0.011
Lyon         0.004
... (everything else, ~0.026 spread over thousands of tokens)
```

Every sampler in this lesson, given this table, will produce `Paris`. When the distribution is *peaked*, almost everything you can configure is irrelevant, because the mass sits on one option. When it is *flat* — many options at 0.05, 0.03, 0.02 — every setting matters enormously.

> **The first thing to internalise:** sampling settings control how a *flat* distribution gets resolved, and have almost no effect on a *peaked* one. This is why "raise the temperature for more creative writing" and "raise the temperature to make it get my obscure question right" are completely different requests, and only the first is achievable.

#### Greedy decoding: always take the maximum

The simplest sampler is **greedy decoding**: take the single highest-probability token, append it, and repeat. No randomness at all. Deterministic given the same numbers.

Greedy is excellent when there is one right answer and the model is confident. It is also where the phrase "temperature 0" comes from, and several providers document it as "temperature 0 is roughly equivalent to greedy" (that phrasing is deliberate — Part 4 explains why "roughly"). It has two failure modes that matter.

**First, greedy is a trap for long outputs.** Choosing the locally best token at every step does not guarantee the best sequence overall. A model writing a closing sentence might produce a strong opening clause by greedy choice and then find itself committed to a grammatical structure that forces a weak ending. A slightly lower-probability first token could have opened a better whole sentence. Greedy cannot see that, because it only ever holds one path.

**Second, greedy is boring at scale.** In open-ended writing, the most likely next token is by definition the most *typical* continuation, and repeatedly taking it produces the most generic possible output — the average of everything the model has seen in that register. You can observe this: greedy decoding of creative prompts tends to produce clichés.

#### Random sampling: roll the dice

At the other extreme, **pure sampling** draws a token at random with probability equal to its model-assigned probability. `Paris` comes up 91% of the time, `the` 3.1% of the time, and every one of those thousands of tiny-probability tokens has a small but nonzero chance.

It is rarely used alone, for a reason worth stating precisely: with 100,000 tokens in the vocabulary, if the remaining 2.6% of mass is spread over 90,000 tokens, there is still a small chance per step of drawing something absurd. Over a 500-token response, "small chance per step" compounds into "this output will fall apart". The long tail is individually negligible and collectively dangerous — which is the problem top-k and top-p exist to solve.

#### Beam search: keep several paths alive

**Beam search** attacks greedy's short-sightedness directly. Instead of holding one partial sequence, hold several — the "beam" — and at each step expand all of them, score the results, and keep the best few. It genuinely helps where the whole sequence has a well-defined score and the space is constrained: machine translation was its home ground for years, and it is still used in speech recognition, where output is short and correctness is measurable.

For open-ended chat and writing, beam search mostly lost, for three reasons you can predict from what you already know:

1. **It produces bland text.** Optimising for high total sequence probability pushes toward sequences made entirely of high-probability tokens — the same genericness as greedy, but more thorough.
2. **It is expensive.** A beam of 5 means five times the generation work per step.
3. **A high-probability sequence is not a good one.** Beam search optimises the model's own score, and Part 5 explains why that score is a poor proxy for quality on open-ended tasks.

Almost every chat API does not expose beam search (as of early 2026; check your provider's parameters before assuming). You will meet it in local inference tools and older machine-translation code, and you do not need to tune it. You do need to know it exists, because "just search harder for the best answer" sounds like it should be the right approach, and understanding why it isn't tells you something real about what these models can be asked to optimise.

### Part 2 — Temperature: dividing inside the exponent

Temperature has the worst reputation-to-understanding ratio of any setting here. It is described everywhere as a "creativity dial" or "randomness knob", which tells you what it feels like and nothing about what it does.

Here is the mechanism. Before softmax turns scores into probabilities, temperature divides the scores:

```text
p_i = exp(z_i / T) / sum_j exp(z_j / T)
```

where `z_i` is the raw score for token *i* (the "logit") and `T` is the temperature.

You do not need to compute this by hand. You need the one structural fact: **`T` is inside the exponent, so it compresses or stretches the gaps between scores before they become ratios.**

- **`T < 1` (e.g. 0.2):** dividing by a small number *magnifies* the differences between scores. A score 3 points above another becomes 15 points above. After softmax, that difference becomes a much larger probability ratio. The distribution **sharpens** — probability concentrates on the leaders.
- **`T = 1`:** no change. The distribution is exactly what the model produced.
- **`T > 1` (e.g. 1.5):** dividing by a large number *shrinks* the differences. Scores that were far apart become closer. The distribution **flattens** — probability spreads toward the tail.

Numbers make this concrete. Take four made-up tokens:

| Token | p at T = 0.5 | p at T = 1.0 | p at T = 1.5 |
|---|---|---|---|
| `Paris` | 0.988 | 0.910 | 0.760 |
| `the` | 0.009 | 0.031 | 0.090 |
| `a` | 0.002 | 0.018 | 0.070 |
| `Lyon` | 0.000 | 0.004 | 0.030 |

Read the top row against the bottom. At `T = 0.5`, `Paris` is 494 times more likely than `Lyon`. At `T = 1.5`, only about 25 times. Nothing about the model changed — its scores were identical in all three columns. Temperature only changed how much those scores were allowed to matter.

> **The analogy, and where it breaks.** People call temperature a "confidence filter" — turning it down filters out the model's uncertain guesses. That is accurate on a peaked distribution and breaks completely on a flat one. If the model genuinely has five options at roughly equal probability, temperature does not concentrate them onto the right one; it just makes the arbitrary winner more decisive. **Temperature cannot create certainty that is not in the distribution.** It can only amplify or suppress certainty already there. This is the most consequential sentence in the phase, and Part 6 returns to it.

#### What this predicts

Now you can predict rather than guess. **Lower temperature → less variation between runs, more repetition within a long output:** each step concentrates mass, so the same likely token gets picked again, and over 500 tokens that shows up as looping and cliché. **Higher temperature → more variation, more tail tokens, more incoherence:** the tail is where the strange tokens live, and some of that strangeness is useful for creative work — it is how you get an unexpected metaphor — while some is `\n\n` mid-sentence or a switch into another language. And **the effect depends entirely on how peaked the distribution was:** on a fact the model knows cold, `T = 1.0` versus `T = 1.5` changes nothing, while on a genuinely ambiguous prompt the same change is dramatic.

That is why "the best temperature for my task" is not a well-formed question. The honest version is "the best temperature for my task *at the model's typical confidence on this kind of prompt*". Relatedly, most APIs treat 0 as greedy, and the common belief is that `temperature = 0` gives you a deterministic function. It does not — Part 4 is entirely about why. The summary: temperature 0 removes *sampler* randomness and nothing else.

### Part 3 — Truncation: choosing the candidate pool before choosing

Temperature reshapes the whole distribution but still leaves every one of those 100,000 tokens as a possible draw. Truncation takes a different approach: **delete the tail first, then sample from what remains.**

#### Top-k: keep the k best

**Top-k** is the simplest: sort tokens by probability, keep the top *k*, discard the rest, renormalise the survivors so they sum to 1, then sample. With `k = 1` you get greedy; with `k = 5` you sample from the five most likely tokens. The long tail is gone entirely, so the absurd-token problem from Part 1 disappears.

The problem is that **k is fixed, and the shape of the distribution is not.** Consider two steps in one generation. In Step A — completing "The capital of France is" — the top 5 tokens hold essentially all the mass, so `k = 50` includes 45 tokens at around 0.0001: noise that has been renormalised into the pool and can now be drawn. In Step B — choosing adjectives for a coffee shop name — mass is spread across 200 tokens, so `k = 5` throws away 195 legitimate options and forces a choice among a handful.

**Top-k is simultaneously too permissive when the model is confident and too restrictive when it is uncertain.** That is not a tuning problem you can solve by picking a better k — it is a structural mismatch between a fixed pool size and a variable distribution shape.

#### Top-p (nucleus sampling): keep the smallest set that sums to p

**Top-p**, also called **nucleus sampling**, fixes exactly that. Instead of a fixed *number* of tokens, keep the smallest set of highest-probability tokens whose probabilities sum at least to *p*. Then renormalise and sample.

The candidate pool becomes **adaptive**, which is the whole idea:

| Situation | p = 0.9 nucleus contains | Effect |
|---|---|---|
| Model is confident (Paris at 0.91) | 1 token | Effectively greedy; no risk of a wild draw |
| Model is moderately confident | ~5–10 tokens | Small, sensible pool |
| Model is genuinely uncertain | ~50–200 tokens | Keeps the real options alive |

Run the two steps from the top-k example against top-p and the mismatch disappears: Step A gets a nucleus of one token, Step B gets two hundred. **One setting behaves sensibly on both, because it is expressed in the currency of the distribution — probability mass — rather than an arbitrary count.** That is why top-p became the usual default and top-k a secondary control: its units match the thing being controlled.

Typical defaults sit around `p = 0.9` to `0.95`. Setting `p = 1.0` disables truncation entirely, leaving pure sampling.

#### Min-p: a relative floor

**Min-p** is a newer, simpler rule: keep every token whose probability is at least some fraction of the *top* token's probability. With `min_p = 0.05`, if the best token is at 0.6, the cutoff is 0.03, and everything below is dropped.

It is defined relative to the leader, so it also adapts. Its behaviour differs from top-p in one interesting case: when the model is extremely confident (top token at 0.95), a top-p nucleus of 0.9 keeps only that one token, while min-p with a small threshold still keeps a handful of alternatives — avoiding the degenerate case where a confident model becomes effectively greedy, which some people prefer for creative work.

Min-p is not universally supported, and implementations differ in the exact rule (as of early 2026; check your tool's documentation rather than assuming). Treat it as a third option to experiment with, not a default.

If your output is incoherent you have two knobs: cool it down (lose variety everywhere) or tighten the pool (lose only the tail). Tightening is more surgical, because it targets the actual failure — tail tokens — rather than globally shrinking every choice. **Try top-p before temperature.** You can combine truncation methods, since they chain and the pool only shrinks, but combining is usually unnecessary and makes settings harder to reason about. Pick one and adjust.

### Part 4 — Seeds, and why determinism is imperfect

This is the part most material skips, and the part that bites people in production.

#### Seeds

Random sampling needs random numbers. In practice it uses a **pseudo-random number generator** (PRNG): a deterministic algorithm producing a long sequence of numbers that look random, starting from an initial value called the **seed**. Same seed, same sequence.

So: fix the seed, fix the settings, send the same prompt, and you should get the same output. Often you do. **This is a strong regularity, not a guarantee**, for four independent reasons.

#### Cause 1 — Floating-point addition is not associative

In ordinary arithmetic, `(a + b) + c` equals `a + (b + c)`. In the floating-point arithmetic computers actually use, **it often does not.** Rounding happens at every operation, so which intermediate values get rounded depends on the order of operations.

Matrix multiplication — the operation that dominates everything a transformer does — is a giant pile of additions. A GPU kernel sums them in whatever order is fastest for the hardware: splitting a row across threads, using partial accumulators, reorganising for cache locality. That order can vary between runs based on the *shape of the work*, not your prompt.

Tiny differences in the accumulated sum propagate. The model's scores shift in the last few decimal places. Usually the token ranking is unchanged and your output is identical. Occasionally two tokens are so close that the shift flips which one leads, and from there the generation diverges completely — one token different means every subsequent step operates on a different context. **"The same computation" on parallel hardware is not bit-for-bit the same computation**, and that is a property of the hardware and the numerical format, not a bug anyone will fix.

#### Cause 2 — Batching

The same insight, applied to the server. To be economical, providers process many users' requests simultaneously in a **batch**, so your request's work is interleaved with strangers' requests.

Two consequences. First, batch composition changes the shapes of the matrices involved, which changes the summation order from Cause 1. Second, serving systems group requests dynamically and free memory as sequences finish, so the arithmetic your request undergoes depends on what else was arriving at that moment. Your request cannot be computed identically twice, because the surrounding computation differs. This is why determinism is worse through a hosted API than on your own laptop with no batching — and why a run can be reproducible in the morning and not in the afternoon.

#### Cause 3 — Server-side changes

Providers update models, system prompts, safety classifiers, and serving kernels without announcement. A decimal point in a default setting you never touched can change. Your seed is preserved; the thing being seeded is not the same.

#### Cause 4 — Hardware and library differences

Run the same model on two different GPUs, or the same GPU with a different driver or kernel library version, and you can get different outputs from the same seed: different hardware has different reduction orders and different fast-math approximations. A model is a file of numbers; the arithmetic applied to those numbers is not standardised across machines.

#### What this means in practice

You cannot rely on byte-identical output from a hosted API; you can usually get it locally with a fixed seed, build and hardware; you can rely on *structural* stability at temperature near 0 even when wording drifts; and for evaluation you should average over several runs rather than pinning one.

> **The engineering lesson:** design for structural stability, not textual identity. If your program breaks when the wording changes, the problem is your program, not the sampler. Parse the JSON, validate the schema, compare the semantics — do not string-compare the response. This is the most valuable practical habit in the phase.

Notice what this does to "temperature 0 means deterministic". It is false in the strict sense and *useful* in the loose sense: temperature 0 removes one of five sources of variation, and it happens to be the cheapest one.

### Part 5 — Log probabilities: reading the model's own numbers

Everything so far has been about *changing* the distribution. **Log probabilities** — `logprobs` — let you *look at* it.

#### What they are

A **logit** is a raw score. A **probability** is that score after softmax. A **log-probability** is the natural logarithm of that probability. Providers that support logprobs return the log-probability the model assigned to the tokens it generated, and often the top few alternatives too. Logs are used because they behave better numerically and because they add instead of multiplying: the log-probability of a whole sequence is approximately the sum of its tokens' log-probabilities.

You do not need to compute logarithms. These reference points are enough:

| Logprob | Probability | How to read it |
|---|---|---|
| 0.0 | 1.0 (100%) | Absolute certainty. Almost never happens |
| about −0.1 | about 0.90 | Very confident |
| about −0.7 | about 0.50 | A coin flip between this token and something else |
| about −1.6 | about 0.20 | Genuinely uncertain |
| about −2.3 | about 0.10 | The model is choosing among roughly ten options |
| −4.0 or lower | under 0.02 | The model is guessing or has no idea |

Hold on to this: **a logprob is the model's number before the sampler touched it.** Depending on the provider, the logprobs you receive may be reported after temperature is applied — so they are most interpretable at the default temperature, where they reflect the distribution the model actually produced (as of early 2026; check your provider's documentation, because this varies and has changed).

#### Reading a table

Suppose you ask a model to classify a support ticket, and you request logprobs. What comes back, made readable, looks like:

```text
position 4  "billing"    logprob -0.03     alternatives:
                                          "technical"  -3.51
                                          "account"    -5.02
```

That is a confident classification. The model put essentially all its mass on `billing`, and the runner-up is roughly e^-3.5 ≈ 3% as likely.

Now compare:

```text
position 4  "billing"    logprob -0.71    alternatives:
                                          "technical"  -0.82
                                          "account"    -1.94
```

This is not a classification. `billing` is only about twice as likely as `technical`, and the model is effectively tossing a coin. **The generated token looks the same in both cases — the difference is entirely in numbers you would never see from the text alone.** The text tells you what the sampler chose; the logprobs tell you *how close the choice was*.

#### What logprobs are genuinely useful for

**1. Confidence estimation.** A high top logprob plus a large gap to the runner-up means the model had a clear preference. A low logprob or a narrow gap means it did not. You can route on that: answer directly when confident, retrieve or escalate when not.

**2. Classification without generation.** You do not need the model to write anything. Ask a question whose answer is a single token, request logprobs, and read the probabilities off the candidate answers. This is faster and cheaper, and gives you a score rather than a label, so you set your own threshold.

**3. Catching guessing.** A testable signature: when a model is fabricating a fact, its per-token logprobs often sit much lower than when it is recalling one, because it is producing plausible text rather than retrieving a strong association. Low logprobs across a factual span are a genuine warning sign that the content deserves verification.

**4. Comparing prompts without eyeballing.** Instead of judging which of two prompts "seems better", measure the log-probability of a known-correct answer under each. Lower is better. This turns prompt engineering from taste into measurement, and Track 3 builds on it directly.

#### Where logprobs stop working

This part is mandatory, and it is where most writing on the topic goes quiet.

- **Low logprob is not the same as wrong.** A model can be genuinely uncertain and correct — consider a question with two defensible answers. High logprob is not the same as right either: a model can be confidently, fluently wrong, and the confidence that makes a wrong answer dangerous is exactly what makes its logprobs look reassuring. **Logprobs measure internal confidence, not accuracy.**
- **They are not calibrated.** A logprob of −0.1 does not mean "90% likely to be correct". Models are overconfident on some task types and underconfident on others. Using logprobs as probabilities means calibrating them against labelled examples *for your task*, and the calibration is task-specific and can break when the model updates.
- **Per-token is not per-answer.** A reasoning chain that wanders may have high per-token confidence throughout and still reach a wrong conclusion, because each step was locally plausible. Averaging logprobs over a long output measures fluency, not correctness.
- **Not every model or endpoint returns them**, and the fields differ between providers (as of early 2026; read your provider's reference rather than assuming a shape). A technique you cannot rely on across models is a technique for one pipeline.
- **They are affected by everything in Part 4.** Logprobs shift with floating-point reduction order, quantisation, and model version. Do not build a threshold at 0.05 precision and expect it to survive an update.
- **They tell you nothing about whether the content is true.** A model with no knowledge of your subject has a flat distribution over plausible-sounding fabrications; logprobs faithfully report that flatness, and a flat distribution over wrong answers is still wrong.
### Part 6 — Practical settings, and the problems settings cannot fix

#### Settings by task

These are starting points, not recommendations to follow blindly. Reason about *why* each is what it is, then test.

| Task | Temperature | Top-p | Reasoning |
|---|---|---|---|
| Extraction, classification, structured output | 0 – 0.2 | 0.9 | One defensible answer; variation breaks parsing |
| Factual Q&A, summarisation | 0.2 – 0.4 | 0.9 | Mostly one right answer; slack avoids awkward phrasing |
| Code generation | 0 – 0.3 | 0.95 | Correctness-constrained; be maximally decisive |
| Editing, rewriting, translation | 0.3 – 0.6 | 0.9 | Some phrasing freedom, meaning fixed |
| Chat and general assistance | 0.6 – 0.8 | 0.9 – 0.95 | Variety is pleasant and rarely harmful |
| Brainstorming, naming, creative writing | 0.8 – 1.1 | 0.9 – 0.95 | You want the tail; that is where unexpected ideas are |

Two habits worth forming. First, **keep top-p fixed while you vary temperature**, then adjust top-p only if output is falling apart; changing two knobs at once teaches you nothing about either. Second, **write down what you changed and what happened.** Sampling settings are not memorisable; they are empirical, and a log of settings and outputs beats any table, including this one.

#### The problems settings cannot fix

Each of these is a real problem people try to solve with a temperature slider, and each attempt fails for a structural reason.

**A model that lacks knowledge does not gain it from temperature.** The headline case. If the model has no strong association for a fact, its distribution over the answer tokens is flat. Lowering temperature makes it commit harder to one of the plausible fabrications; raising temperature spreads it toward the wild tail. Neither produces the fact. **The fact was never in the distribution, and the sampler can only choose from what is there.** If the model does not know, the answer is retrieval or a different model — Track 4 and Track 6. That is also why chained "try again with different settings" loops on a knowledge question mostly waste effort.

**A model that cannot follow a format does not learn it from temperature.** Malformed JSON stays malformed at temperature 0, just *consistently* so. The fix is a clearer specification, a schema constraint, or a provider feature built for structured output.

**A model that reasons badly does not reason better from temperature.** If it takes a wrong step in a multi-step problem, lower temperature makes it take that same wrong step reliably. Higher temperature might stumble onto a right path, but you cannot tell whether it reasoned or guessed, and the result will not reproduce. Change the *problem decomposition* instead (Track 3).

**A model that hallucinates does not stop from temperature.** Fluency and truthfulness are separate axes, as Phase 1 established. Temperature controls variety within the space of plausible continuations; hallucination is a property of which continuations the model finds plausible. Temperature 0 produces the most plausible fabrication, often the most convincing one. And **safety behaviour does not change meaningfully with temperature**: whether a request is refused depends on training and surrounding layers, not your sampler.

**Cost and latency do not improve from sampling settings.** Every configuration here costs the same.

Sampling settings are a small, cheap, real lever on *style and variety* — not on *capability*. The practical test: **if a setting change made the output better, it changed which of several acceptable outputs you got. If it seems to have made the model smarter, you are probably reading noise from a single sample.** Run the same prompt five times before believing an improvement; the variance you are chasing may exceed the effect.

## Hands-on practice tasks

1. Write down, before running anything, your prediction for each: (a) asking a model the capital of France ten times at temperature 0.9, (b) asking for a coffee shop name ten times at temperature 0.9, (c) the same coffee-shop ask at temperature 0.1. Then run all 30 and score yourself. <!-- id: found-05-t01 band: quick energy: low -->

2. Temperature sweep. Take one prompt with a genuinely ambiguous answer — a short creative or recommendation prompt. Run it at temperature 0.1, 0.5, 0.9 and 1.3, with top-p held at 0.9 throughout. Five runs each. Put all twenty outputs in a table and write one sentence per temperature describing what changed. <!-- id: found-05-t02 band: focused energy: normal -->

3. Greedy versus sampled. Run the same long-generation prompt (300+ tokens) with greedy decoding and again at temperature 0.9. Read both fully. Identify the specific sentences where greedy produced a cliché or looped, and quote them. This is the clearest demonstration of Part 1's claim that greedy is boring at scale. <!-- id: found-05-t03 band: focused energy: normal -->

4. Top-k versus top-p on the same run. Find a prompt where the model's uncertainty varies during the output — a short story opening works well. Generate once with top-k 40 and once with top-p 0.9 at the same temperature. Then either read the token probabilities if your tool exposes them, or judge from the outputs: at which points did the two differ, and does the difference match the prediction that top-k is too tight when the model is uncertain and too loose when it is confident? <!-- id: found-05-t04 band: deep energy: high -->

5. Find the failure mode of penalties. Take a prompt whose correct answer depends on exact repetition: ask for a code snippet containing a repeated identifier, or ask for a verbatim quote, or ask for a list where the same word must appear in every item. Compare its output with repetition and presence penalties off versus at moderately high values. Document exactly what broke and at what setting. <!-- id: found-05-t05 band: focused energy: normal -->

6. The determinism audit. Pick one provider or local model and run the identical prompt with temperature 0 twenty times. Record how many responses are byte-identical. Then, if you have a local model, run the same twenty with a fixed seed and compare the counts. Write up the difference and attribute it to the causes in Part 4. <!-- id: found-05-t06 band: deep energy: high -->

7. Read a logprob table. If you have API access with logprobs support, or use a free tier that exposes them, ask a factual question the model will know and one you believe it will not. Print the logprobs for the answer tokens with the top alternatives. Compare the two tables and write down the numeric difference. If you have no logprobs access, do the text-only version: ask the same obscure question ten times at temperature 1.0 and use the *variation between answers* as your proxy for a flat distribution. <!-- id: found-05-t07 band: deep energy: high -->

8. Build a confidence router. With logprobs available, classify twenty short texts you have labelled yourself into two or three categories using single-token answers. Record the top logprob for each. Find the threshold that best separates your correct from your incorrect classifications, and report how many you would have had to escalate. If a threshold works suspiciously well on twenty examples, note that yourself — that is a sign you need more examples, not that you have found a law. <!-- id: found-05-t08 band: deep energy: high -->

9. Build your own task-to-settings table. Take three real tasks you actually do. For each, pick a setting by *reasoning* about whether the task has one right answer or many, write the reasoning down, then test. Compare your predicted best setting with the measured one and record where you were wrong. <!-- id: found-05-t09 band: focused energy: normal -->

10. Start a settings log you will keep for the rest of the curriculum: one row per experiment with task, model, temperature, top-p, penalty settings, a one-line output summary, and your verdict. Reuse it in Phase 7 and in the Prompting track. <!-- id: found-05-t10 band: ongoing energy: low -->

11. Write the 300-word explainer from the deliverable, out loud first, without notes. If you cannot get through the temperature paragraph without reaching for "creativity", you have not finished Part 2. <!-- id: found-05-t11 band: focused energy: normal -->

12. Adversarial habit check. Find one prompt where lowering the temperature made the output *worse* — flatter, more repetitive, or more confidently wrong. Document it. Most people only test the direction they expect to help, and this task breaks that habit. <!-- id: found-05-t12 band: quick energy: low -->

## Common Pitfalls

**Believing temperature 0 means deterministic.** It removes sampler randomness and nothing else. Floating-point reduction order, batch composition, server-side updates and hardware differences all still apply. Test your own setup; do not inherit someone else's claim.

**Treating temperature as a knowledge dial.** Raising temperature does not help a model recall a fact it does not have. It changes which plausible continuation you get, and a fact that is absent from the distribution cannot be reached by any setting.

**Tuning temperature and top-p at the same time.** You will not be able to attribute the change to either. Fix one, vary the other, and record what happened.

**Setting top-p to 1.0 without realising what that means.** It disables truncation entirely and quietly converts your generation into pure sampling from the full vocabulary, tail included.

**Cranking repetition penalties to stop looping.** This is a real temptation because it appears to work at first. Then it mangles code with repeated identifiers, breaks proper nouns, and makes exact quoting impossible. If the model is looping, the cause is usually a prompt that gives it nothing new to say — or a temperature too low for a long creative output.

**Trusting a single sample.** Sampling settings produce variance by design. One output is not evidence about a setting. Five runs is the minimum before concluding anything.

**Assuming logprobs measure correctness.** They measure the model's internal confidence, which is a different quantity, and models are not well calibrated. Use them to find guessing; do not use them to certify truth.

**Building string comparisons against model output.** Even at temperature 0, wording can drift. Parse and validate structure instead. Almost every "the model became unreliable overnight" incident is this.

**Assuming another provider's temperature scale matches.** Temperature is a divisor, and different models are trained and tuned with different logit scales. Temperature 0.7 on one model is not temperature 0.7 on another, in any meaningful sense. Re-tune per model rather than copying a number across.

**Reading settings advice as permanent fact.** Default values, supported parameters and even whether a provider returns logprobs all change between releases. Every number in this lesson that could shift is marked as of early 2026 for that reason.

## Deliverable / proof of work

Write `portfolio/foundations/05-sampling-and-determinism.md` containing:

- **Your prediction scorecard** from practice task 1 — the predictions you wrote first, the results, and where you were wrong
- **A completed temperature sweep table** from task 2, with your one-sentence reading of each temperature
- **Your two logprob tables** from task 7 — confident and uncertain side by side — or, if you had no logprobs access, ten varied answers to an obscure question with a note explaining why variation is a proxy for a flat distribution rather than a measurement of one
- **The determinism audit** from task 6 — your identical-response count, your seed comparison if you had one, and your attribution of the differences to specific causes in Part 4
- **Your own task-to-settings table** from task 9, including the cases where your prediction was wrong and why
- **A 300-word explainer, written for a friend who has never heard of temperature**, that explains the mechanism, gives one prediction it makes, and names one thing it cannot do. No use of the word "creativity" as an explanation
- **A section titled "What I will not try to fix with settings"** — three specific failure types you have personally seen, each with the reason settings cannot address it and what you will do instead
- **Your settings log** from task 10, started and at least five rows long

## Checklist

- [ ] I can explain why a probability distribution is not a decision <!-- id: found-05-c01 energy: low -->
- [ ] I can describe greedy decoding, sampling and beam search, and say what each optimises for <!-- id: found-05-c02 energy: normal -->
- [ ] I can explain why beam search produces bland output <!-- id: found-05-c03 energy: normal -->
- [ ] I can explain what temperature does to scores *before* softmax, not just what it feels like <!-- id: found-05-c04 energy: high -->
- [ ] I can predict how a given temperature will change a distribution of a known shape <!-- id: found-05-c05 energy: normal -->
- [ ] I can explain why temperature cannot create certainty that is not in the distribution <!-- id: found-05-c06 energy: high -->
- [ ] I can explain what top-k, top-p and min-p each keep and each discard <!-- id: found-05-c07 energy: normal -->
- [ ] I can explain why top-p is usually preferred over top-k, in terms of adaptive pool size <!-- id: found-05-c08 energy: normal -->
- [ ] I can explain what repetition, presence and frequency penalties change, and name a case where each causes harm <!-- id: found-05-c09 energy: normal -->
- [ ] I can name the four causes of non-determinism beyond sampler randomness <!-- id: found-05-c10 energy: high -->
- [ ] I can explain why floating-point addition order affects the output at all <!-- id: found-05-c11 energy: high -->
- [ ] I can read a logprob value and say roughly what probability it corresponds to <!-- id: found-05-c12 energy: normal -->
- [ ] I can explain the difference between the model's confidence and the model's correctness <!-- id: found-05-c13 energy: normal -->
- [ ] I can state at least three things logprobs cannot tell me <!-- id: found-05-c14 energy: normal -->
- [ ] I can pick a starting setting for a new task by reasoning about its structure <!-- id: found-05-c15 energy: normal -->
- [ ] I have run the temperature sweep and recorded the results <!-- id: found-05-c16 energy: normal -->
- [ ] I have run the determinism audit and attributed the variation to specific causes <!-- id: found-05-c17 energy: high -->
- [ ] I have a personal task-to-settings table with at least three tested entries <!-- id: found-05-c18 energy: normal -->
- [ ] I have started a settings log I will keep using <!-- id: found-05-c19 energy: low -->
- [ ] I can name three failure types that no sampling setting can fix <!-- id: found-05-c20 energy: normal -->

## Quiz

### Q1. You need a model to always return valid JSON for an automated pipeline. What is the correct approach? <!-- id: found-05-q01 energy: normal -->

- [x] Lower the temperature and specify the format precisely, ideally using a structured-output feature, because sampling settings cannot teach a format the model has not been told
- [ ] Set temperature to 1.0 so the model has freedom to find the right format
- [ ] Raise top-p to 1.0 so all valid formats remain available
- [ ] Add a repetition penalty so the model does not repeat malformed output

**Why:** Format compliance is a specification problem, not a sampling problem. Temperature 0 makes a malformed format malformed consistently rather than fixing it. The reliable levers are a clearer specification, a schema constraint, or a provider feature built for structured output.

### Q2. Why is top-p usually preferred over top-k as a default? <!-- id: found-05-q02 energy: normal -->

- [ ] Because top-p keeps more tokens and therefore produces more accurate answers
- [ ] Because top-k is mathematically equivalent but slower to compute
- [x] Because the nucleus adapts its size to how confident the model is, while a fixed k is too permissive on confident steps and too restrictive on uncertain ones
- [ ] Because top-p removes the need to set a temperature

**Why:** A fixed k is the wrong shape of control for a distribution whose shape changes from step to step. Top-p is expressed in probability mass, the same currency as the thing being controlled, so one value behaves sensibly in both the confident and the uncertain case.

### Q3. What does temperature actually do to the model's output distribution? <!-- id: found-05-q03 energy: high -->

- [x] It divides the raw scores before softmax, which magnifies or shrinks the gaps between them and therefore sharpens or flattens the resulting probabilities
- [ ] It randomly deletes low-probability tokens from the vocabulary
- [ ] It adds noise directly to each token's probability
- [ ] It retrains the output layer on the fly to favour novel tokens

**Why:** Temperature sits inside the exponent of the softmax. Below 1 it stretches score differences so the distribution sharpens; above 1 it compresses them so it flattens. The probabilities change, but the model's scores are untouched, which is why temperature cannot add information the scores do not contain.

### Q4. A model you are calling through an API gives a different answer on two identical requests, both at temperature 0. Which explanation is most likely? <!-- id: found-05-q04 energy: high -->

- [x] Floating-point addition is not associative on parallel hardware, and batch composition changes the order of operations between requests
- [ ] The provider ignores the temperature parameter on free tiers
- [ ] The model is loading different weights for each request
- [ ] Temperature 0 is a marketing term and always samples randomly

**Why:** Temperature 0 makes the sampler near-greedy, which removes sampler randomness. What remains is arithmetic variation: GPU kernels sum in whatever order is fastest, and that order depends on what else is in the batch. Tiny score differences usually change nothing and occasionally flip a close call, after which the generation diverges.

### Q5. You ask a model about a niche local event and it produces a detailed answer. The logprobs are low across the factual tokens. What should you conclude? <!-- id: found-05-q05 energy: high -->

- [ ] The answer is correct but phrased unusually
- [x] The model has a flat distribution here, so it is constructing plausible text rather than recalling a strong association — treat the content as unverified
- [ ] The logprobs are low because the answer is long
- [ ] Low logprobs always mean the answer is false

**Why:** Low logprobs across a factual span are a genuine warning sign of guessing, because the model is producing plausible-sounding continuation instead of a strong association. The correct conclusion is caution, not certainty of error: logprobs measure the model's internal confidence, not the truth of the content.

### Q6. A model keeps looping and repeating the same phrase in a long creative output. What is the most likely structural cause? <!-- id: found-05-q06 energy: normal -->

- [x] Each repeated token becomes more likely to be chosen again, because the growing context makes the loop a self-reinforcingly plausible continuation
- [ ] The model has a bug that only appears in creative writing
- [ ] Top-p is set too high for the task
- [ ] The seed was not fixed

**Why:** Repetition is partly self-reinforcing: once a phrase appears twice, continuing it is a plausible continuation of the context that now contains it. Cooling the output makes it worse rather than better. Useful responses include giving the model somewhere new to go, raising temperature, or choosing a model less prone to it — not maximum penalties, which break other behaviours.

### Q7. Which statement about using logprobs for classification is accurate? <!-- id: found-05-q07 energy: normal -->

- [ ] Logprobs let you skip labelling data entirely, because they are already calibrated probabilities of correctness
- [ ] Logprobs give a valid confidence measure that transfers unchanged between models and tasks
- [x] Logprobs give you a useful score to threshold on, but you must calibrate the threshold against your own labelled examples and re-check it when the model changes
- [ ] Logprobs cannot be used for classification because classification requires generation

**Why:** Reading probabilities off single-token answers is a genuinely good technique — faster and cheaper than generating text, and it gives a score rather than a label. But model confidence is not calibrated accuracy, calibration is task-specific, and logprobs shift with model version and quantisation, so thresholds need re-validation.

### Q8. You raise the temperature on a factual question the model keeps getting wrong, hoping variety will eventually produce the right answer. Why does this fail in principle? <!-- id: found-05-q08 energy: high -->

- [ ] Because the model caches its first answer and reuses it
- [x] Because if the fact is absent from the distribution, every setting only reshuffles the plausible fabrications that are present — the information was never there to select
- [ ] Because high temperature causes the model to ignore the question
- [ ] Because the sampler only reshapes probabilities for creative prompts

**Why:** The sampler chooses from the distribution; it cannot add mass to a token whose score is low because the model lacks the association. Higher temperature spreads mass toward the tail, which contains more fabrications rather than the right answer. Knowledge problems need retrieval or a different model, not different settings.

### Q9. A repetition penalty of 1.3 visibly stops an annoying loop in chat output. You then apply it to a prompt asking for a code snippet and the output breaks. Why? <!-- id: found-05-q09 energy: normal -->

- [ ] The penalty only works on models with fewer than 8 billion parameters
- [x] A repetition penalty down-weights every token that has already appeared, and in code the same identifier, bracket or keyword legitimately must appear many times
- [ ] Code tokens are exempt from penalty calculation and get distorted
- [ ] The model switched to a different sampling method automatically

**Why:** The penalty is applied blindly to the token sequence, with no notion of whether a repeat is legitimate. Chat tolerates it because natural language has redundancy to spare; code, verbatim quotes, proper nouns and formatted lists do not, and there the penalty destroys correctness rather than improving it.

### Q10. Which of these is genuinely fixed by choosing the right sampling settings? <!-- id: found-05-q10 energy: normal -->

- [ ] The model's lack of knowledge about a topic it was never trained on
- [x] The amount of variety in the phrasing of otherwise equivalent answers
- [ ] The model's inability to follow a multi-step argument
- [ ] The rate at which the provider updates the model behind the API

**Why:** Sampling settings act on style and variety: how much the output wanders among acceptable options. They cannot supply knowledge, repair reasoning, or change what the provider ships. Recognising which class a problem belongs to is what stops you from spending an afternoon tuning a slider that cannot help.

### Q11. Your script compares model output to an expected string. It passes in testing and fails intermittently in production, at temperature 0. What is the correct diagnosis? <!-- id: found-05-q11 energy: normal -->

- [ ] The production server is running a different model version, which must be the cause
- [ ] Temperature 0 is unreliable and you should switch to temperature 0.2
- [x] The script is fragile, because textual identity is not guaranteed at temperature 0 — it should validate structure and meaning instead
- [ ] The API is injecting random whitespace to defeat caching

**Why:** Temperature 0 removes sampler randomness, not arithmetic variation, batching effects or provider updates, so wording can drift. The durable fix is to parse and validate structure rather than compare strings. Diagnosing this as a service problem is the mistake that keeps the flakiness in place.

## You're ready to move on when...

You can take a prompt you have never seen, look at what kind of answer it needs, and say out loud what temperature and top-p you would start with and *why* — in terms of whether the task has one defensible answer or many, and whether the model is likely to be confident. You can read a logprob table and say whether the model knew the answer or guessed it, while also stating what that does and does not tell you about whether the answer is true. You have run the determinism audit on your own setup and can attribute the variation you saw to specific causes rather than shrugging at it.

And you can name, without looking, three problems that no sampling setting will fix — starting with the one that matters most: a model that does not know something will not learn it by turning a dial.

## Free vs Paid

### What's free is enough

Every mechanism in this phase can be learned with zero spending. Google AI Studio's free tier exposes temperature, top-k and top-p controls, which covers Parts 1 through 3 entirely. Ollama runs a capable small model on a laptop with no account and no cost, and it gives you the sampler settings most hosted services hide — min-p, explicit seeds, penalty controls — plus a way to run twenty identical generations in a loop for the determinism audit. Hugging Face's documentation is free and is the most precise public description of what each parameter does.

If your machine is modest, a small quantised model is still perfectly adequate here. This phase is about the *shape* of distributions and the *behaviour* of a sampler, and those are identical in a 3-billion-parameter model and a frontier one. You are not measuring capability. Do not let hardware be the reason you skip the experiments.

### What a paid tier adds

Two things, and only two, are genuinely easier with money.

**Logprobs.** This is the real gap. Many free chat interfaces do not return them, and reading a logprob table is qualitatively better than inferring a flat distribution from repeated answers. The text-only proxy in practice task 7 works, but it is an inference rather than a measurement.

**Scale.** Running the twenty-generation determinism audit or a five-run sweep per setting is faster and less rate-limited on a paid tier. Convenience, not capability.

A paid chat subscription adds neither of these directly — it gives you a better model, which is a different thing from better observability. If you were considering paying for a chatbot subscription to do this phase, that is the wrong purchase.

### When it's worth paying

**Not for this phase, unless logprobs are the specific thing blocking you.** Most providers' pay-as-you-go APIs have no monthly minimum, and the experiments here use short prompts in small quantities. A few dozen short calls typically costs well under a dollar (as of early 2026; check current pricing, which changes often and varies by model). If you can put a small credit on an account with logprobs support, it directly buys the practice task 7 and task 8 measurements, and those are the two exercises that connect this phase to the Prompting and Cost tracks.

The honest threshold: pay when a specific technique requires a specific capability you cannot otherwise reach. Logprob access qualifies, because it is a measurement rather than a stronger model. A better model does not qualify — it will make your outputs nicer and teach you nothing new about the sampler.

If your budget is genuinely zero, do not treat this as a gap in your education. Do the free experiments properly, write the text-only proxy version of task 7 with an honest note about its limits, and move on. The mechanism is what matters, and you will have it.
