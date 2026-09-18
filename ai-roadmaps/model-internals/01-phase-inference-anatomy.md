---
id: intern-01-inference-anatomy
track: model-internals
phase: 1
order: 10
title: The Anatomy of Inference
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/model-internals/01-inference-anatomy.md
exit_criteria: >
  You can narrate the full path from a request string to a streamed token, name
  the five stages, and say what each one costs. You can explain why prefill is
  compute-bound and parallel while decode is memory-bandwidth-bound and
  sequential, use arithmetic intensity to say which of the two any given machine
  is bound by, and predict from that single distinction what time-to-first-token
  and tokens-per-second will each respond to. You can also state where this
  frame stops working - above all that decode is bandwidth-bound per sequence
  and becomes compute-bound once the batch is large.
---

# Phase 1 — The Anatomy of Inference

## Goal of this phase

Learn what actually happens between the moment you send a request and the moment tokens start appearing on your screen. Not the API mechanics — you have those — but the **computation**: how your text becomes integers, how those integers make one pass through a stack of layers, why that pass happens once per generated token and never in parallel with itself, and why the machine doing it is limited by two completely different things depending on which of the two phases it is in.

That last point is the frame for this entire track. **Prefill is compute-bound and parallel; decode is memory-bandwidth-bound and sequential.** Once you hold that single fact properly, the rest of Model Internals stops being a list of techniques and becomes a set of consequences. Why is the first token slow and the rest fast? Why does tokens-per-second barely move when you make your prompt longer, but time-to-first-token jumps? Why does batching help so much? Why does quantisation speed up some workloads and not others? Why does a bigger GPU help one phase more than the other? Every one of those has the same answer.

By the end of this week you will be able to look at any inference setup — a laptop running a local model, a hosted API, a chat product — and predict which of the two phases dominates its behaviour, what number to measure to confirm it, and what class of fix would and would not help.

This is Phase 1 of 6 in the Model Internals track. The Foundations track already gave you tokens and context windows, attention and the KV cache, and sampling. This phase assumes you know roughly what attention is; it does not assume you have any of those pages open.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

| Day | Focus | Time |
|---|---|---|
| Mon | Read Parts 1–3 (the five stages, one pass per token, the two phases) | 1–2h |
| Tue | Hands-on: run a local model and time the two phases separately | 1–2h |
| Wed | Read Parts 4–6 (arithmetic intensity, what it predicts, where it stops) | 1–2h |
| Thu | Hands-on: build the prediction table and test it against measurements | 1–2h |
| Fri | Finish the deliverable, take the quiz, review what you got wrong | 1–2h |

The reading is the smaller half of this phase. The measurements are where the frame becomes yours, because the whole claim of this phase is a *quantitative* claim about which resource runs out first, and you can watch it happen on hardware you already own.

## Skills you'll gain

- Narrate the five stages between a request string and a streamed token, in order, with what each one costs
- Explain why a language model does exactly one forward pass per generated token, and why it cannot start token *n+1* before token *n* exists
- Explain what prefill parallelises that decode cannot, using the matrix-shape argument rather than a slogan
- Explain why decode's arithmetic is inherently harder to feed than prefill's, at the level of bytes moved per useful operation
- Compute a rough arithmetic intensity for a decode step and compare it to a machine's compute-to-bandwidth ratio
- Predict whether a given request will be dominated by time-to-first-token or by tokens-per-second, and say why
- Explain why batching improves decode throughput far more than it improves decode latency
- Explain why the KV cache is what makes long-context decode bandwidth-heavy
- State the three conditions under which "decode is bandwidth-bound" stops predicting what you observe
- Explain why a small, uncertain model offered as a draft is the shape of fix that decode's bottleneck invites — and state the exact conditions under which it is distribution-exact

## Specific topics to learn

### The path of one request

- Tokenization: text to integer ids, and why the vocabulary is a frozen artifact
- Embedding lookup: id to vector, and the one place in the network that is a lookup rather than a multiply
- The forward pass: N identical blocks, each with attention then a small feed-forward network
- The output projection and softmax: hidden state to a probability distribution over the vocabulary
- Sampling and detokenization: distribution to one integer to text
- Which stages are compute the model does, and which are software around it

### One pass per token

- Autoregression: the output token is appended to the input and the whole thing runs again
- Why the second pass is cheaper than the first (the KV cache) but still not free
- Why no amount of parallel hardware can generate token *n+1* before token *n* exists
- What that sequential dependency does to latency, throughput, and the shape of every optimisation in this track

### The two phases

- Prefill: all prompt positions processed together, as large matrix-matrix products
- Decode: one position, as a matrix-vector product, reading the whole KV cache and all weights each step
- Why the first generated token costs a prefill and every later token does not
- Time-to-first-token versus tokens-per-second as two different measurements of two different phases

### Arithmetic intensity, intuitively

- Operations performed versus bytes moved from memory
- Why a big matrix-matrix multiply reuses each loaded weight many times
- Why a matrix-vector multiply reuses each loaded weight once
- Compute-to-bandwidth ratio as a property of the machine, and the crossover it defines

### What the frame predicts

- Why short prompts feel instant and long prompts feel slow
- Why streaming changes perceived speed without changing generation speed
- Why continuous batching is the central throughput optimisation
- Why quantisation helps a memory-bound step more than it helps a compute-bound one
- Why speculative decoding exists at all, and what it is and is not allowed to claim

### Where the frame stops working

- Decode becoming compute-bound at large batch sizes
- Short outputs, where prefill dominates the whole request
- Prompt caching turning prefill from a per-request cost into a one-time cost
- Attention's quadratic term becoming the binding constraint at very long prefill

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Ollama | Run a model locally so you can time prefill and decode separately with no metering | Free, open source (MIT) | https://ollama.com/ | Timing runs in tasks t01 and t04 | llama.cpp built from source, which is what Ollama wraps |
| llama.cpp | Direct access to prefill and decode timings in its own benchmark output | Free, open source | https://github.com/ggml-org/llama.cpp | Run its bundled benchmark and record the reported prefill and decode rates | Any local runtime that reports timings; most do |
| Google AI Studio | A free hosted endpoint to observe time-to-first-token on a shared server | Free tier | https://aistudio.google.com/ | Measure TTFT versus prompt length in task t03 | Any provider free tier that streams and reports usage |
| Python 3 | Script the timing runs and compute the ratios | Free | https://www.python.org/downloads/ | All measurement tasks | Any scripting language you already know |
| NVIDIA Technical Blog — Inference Optimization | The clearest public statement of the prefill/decode split | Free to read | https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/ | Read the prefill and decode sections before Part 3 | The vLLM docs, or any serving-framework design note |
| vLLM documentation | See how a production server schedules prefill and decode together | Free, open source | https://docs.vllm.ai/ | Read the scheduling concepts in task t08 | TensorRT-LLM documentation, or Hugging Face Text Generation Inference docs |
| LibreOffice Calc | Build the prediction table and the arithmetic-intensity calculations | Free, open source | https://www.libreoffice.org/ | Build the machine profile used in t05 | Google Sheets in any browser |
| lm-evaluation-harness | An optional free framework if you want a quality check before and after a quantised run | Free, open source | https://github.com/EleutherAI/lm-evaluation-harness | Optional extension to t06: score a task at two precisions | Any public eval script, or a hand-scored set of 30 items you wrote yourself |

## Free/cheap resources

- **NVIDIA Technical Blog — Mastering LLM Techniques: Inference Optimization** — https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/
- **vLLM documentation (home)** — https://docs.vllm.ai/
- **PagedAttention / vLLM paper page (Kwon et al., SOSP 2023)** — https://dl.acm.org/doi/10.1145/3600006.3613165
- **llama.cpp repository** — https://github.com/ggml-org/llama.cpp
- **Hugging Face — Text generation strategies** — https://huggingface.co/docs/transformers/main/en/generation_strategies
- **Hugging Face — KV cache blog post** — https://huggingface.co/blog/not-lain/kv-caching
- **Attention Is All You Need (Vaswani et al., arXiv:1706.03762)** — https://arxiv.org/abs/1706.03762
- **Andrej Karpathy — Let's build GPT from scratch** — https://www.youtube.com/watch?v=kCc8FmEb1nY
- **Andrej Karpathy — Deep Dive into LLMs** — https://www.youtube.com/watch?v=7xTGNNLPyMI
- **Google AI Studio** — https://aistudio.google.com/
- **Ollama** — https://ollama.com/

## Lesson: One Pass Per Token, and Why That Decides Everything

### Part 1 — Five stages, and only two of them are the model

Something has to happen between you pressing enter and a word appearing on your screen. Most explanations of this jump straight to "the model predicts the next token", which is true and useless, because it leaves out every part you can actually observe and measure.

Here is the whole path, in order.

**Stage 1 — Tokenization.** Your string of characters becomes a sequence of integers, each an index into a fixed vocabulary. This is software, not the model: it runs on your CPU, it is deterministic, and it costs a fraction of a millisecond. I am listing it because its *output size* determines the cost of everything after it — a prompt that tokenizes badly is expensive not because tokenizing is slow, but because it produced more positions for the next four stages to process.

**Stage 2 — Embedding lookup.** Each integer is replaced by a vector — a row pulled out of a table of `vocab_size × d_model` numbers. Looking up a row is not arithmetic; it is a memory read at a computed offset. This is the only place in the network that works this way, and it is worth noticing for one reason: it is a read, and reads have a cost that has nothing to do with how much maths you do with the result.

**Stage 3 — The forward pass.** This is the model. The sequence of vectors goes through a stack of N identical blocks. Each block does two things: an attention operation that lets each position pull information from other positions, and a small feed-forward network applied independently to each position. Every block is dense matrix multiplication plus a handful of cheap elementwise operations.

Three properties of Stage 3 matter for everything that follows.

- **The arithmetic is dominated by matrix multiplies.** Attention has the quadratic term you have met, and it is real, but at the lengths people actually use, the feed-forward networks inside the blocks usually contain more total arithmetic. Both are matrix multiplies.
- **The weights are enormous compared to the vectors moving through them.** A vector in the residual stream has `d_model` numbers — a few thousand. The weight matrices are `d_model × d_model` or larger, per block, per projection. This asymmetry is the seed of the entire bottleneck story: you are pushing something small through something huge.
- **The output of the last block is one vector per input position.** For a prompt of 2,000 tokens, you get 2,000 vectors back. The model did not answer; it produced a state for every position.

**Stage 4 — Output projection and softmax.** Only the *last* position's vector is used. It gets projected against the vocabulary — one score per vocabulary entry — and softmax turns those scores into a probability distribution over all possible next tokens. Because vocabularies are large, this projection is not a rounding error: it can be several percent of a step's total arithmetic.

**Stage 5 — Sampling, then detokenization.** The sampler picks one integer from that distribution. Serving stacks then do something slightly subtle: the chosen token's embedding is what gets appended to the running sequence on the GPU, and the *text* is produced separately by decoding the integer back into characters for display. This is the detail behind a symptom you may have noticed — text rendering as broken characters mid-stream and correcting itself, because a multi-byte character was split across token boundaries and the detokenizer held the partial bytes until the next token completed them.

> **The analogy, and where it dies.** People describe this as "the model reads your prompt and then writes an answer", which makes it sound like two behaviours. It is one behaviour performed many times: **the model's only operation is "given this sequence, what comes next"**, and answering a question is what that operation looks like when the sequence ends in a question. The analogy dies at the point where you need to predict cost, because "reads then writes" suggests reading is free and writing is the work. In fact reading the prompt is one very heavy parallel chunk of work and writing is many very light sequential chunks, and they are limited by different hardware resources. The next part is about why.

---

### Part 2 — The model does exactly one pass per token

Here is the fact this phase is built on, stated as plainly as I can:

**A language model produces one token per forward pass, and the token it just produced becomes part of the input to the next pass.**

Nothing about the architecture prevents a model from outputting several positions at once — it computes a state for *every* input position, as Stage 3 said. The constraint is logical, not architectural. If you want the model to produce the token at position 2,001, you must first know what token sits at position 2,000. You cannot know it until you have decided it. And you cannot decide it until you have the distribution, which requires the pass.

So generation is a loop, and the loop is sequential by construction.

```text
Pass 1:  [ p1 p2 p3 ... p2000 ]                      -> distribution
         sample                                    -> token 2001
Pass 2:  [ p1 p2 p3 ... p2000 t2001 ]                -> distribution
         sample                                    -> token 2002
Pass 3:  [ p1 p2 p3 ... p2000 t2001 t2002 ]          -> distribution
         sample                                    -> token 2003
   ...
```

Two things follow immediately, and both are load-bearing.

**First, the early passes are expensive and the later ones are cheap.** Pass 1 processes 2,000 positions. Pass 2 also has 2,001 positions in its sequence — so why is it cheaper? Because of the KV cache. Keys and values for positions 1 through 2,000 were computed in pass 1 and never change, since a causal model at position *j* depends only on positions up to *j*. Pass 2 reuses them and computes keys and values for exactly one new position. This is why a chat reply does not take a minute: without the cache, every generated token would cost a full re-read of the whole sequence, and the total work would grow with the square of the reply length *per token*.

**This is the single most important optimisation in language model inference**, and it is worth being precise about what it buys. It does not reduce the work of a step to zero; each decode step still computes the new position through all N blocks, and still has to *attend over* the entire cached history. That attention is `n` operations per step, so total attention work over a reply of length *m* against a prompt of length *n* is on the order of `n × m`. The cache changes the constant and the asymptotics dramatically. It does not make anything free.

**Second, no amount of hardware parallelism can break the chain.** This is the part people resist. Modern accelerators are built to run thousands of operations at once. Decode hands them a task where step *k+1* literally cannot be formulated until step *k* has produced a token. You can parallelise *within* a step — all the heads, all the layers' independent projections, all the vocabulary scores — but you cannot parallelise *across* steps.

> **Where "it is a sequential loop" stops being a useful picture.** It is accurate about a single request and misleading about a server. A serving system does not run one loop; it runs many unrelated loops at once, one per user request, and interleaves their steps. From the hardware's point of view the sequence is: many users' step-3s together, then many users' step-4s together. The chain still exists per request, but the *machine* is never idle waiting for it. This is precisely why batching matters so much, and it is why a latency-bound single-request computation is not the same object as a throughput-bound server.

---

### Part 3 — The two phases, and why they are different machines

The loop from Part 2 has two visibly different kinds of step, and naming them is the whole point of this phase.

**Prefill** is pass 1. It processes every prompt position at once. If your prompt is 2,000 tokens, prefill is doing the work for 2,000 positions simultaneously — which means its core operations are shaped like big matrix-matrix products. In a matrix-matrix product, each weight loaded from memory is used many times: once per prompt position. The arithmetic reuses the data.

**Decode** is every later pass. It processes exactly one new position. Its core operations are shaped like matrix-vector products. In a matrix-vector product, each weight loaded from memory is used **once**. The arithmetic does not reuse the data at all.

That difference in *shape* is the whole story, and it produces a difference in *bottleneck*:

| | Prefill | Decode |
|---|---|---|
| Positions processed per step | All prompt positions, in parallel | Exactly one |
| Dominant operation shape | Matrix × matrix | Matrix × vector |
| Data loaded from memory | Weights, plus your prompt | All weights, plus the entire KV cache |
| Reuse of each loaded weight | High — once per position | One — a single use |
| Limited by | Arithmetic throughput (compute) | Memory bandwidth |
| Analogy for the failure | Not enough hands to do the work | Not enough delivery speed to keep the hands busy |
| What improves it | Fast matrix maths, efficient kernels | Less data to move, or more requests sharing the same data |
| What it determines for the user | Time to first token | Tokens per second |

Read the last row carefully, because it explains a measurement confusion that catches almost everyone.

**Time-to-first-token (TTFT)** is a prefill measurement. It is the time from sending the request to receiving the first output token, and it consists almost entirely of reading and processing your entire prompt, plus queueing and network. **Tokens per second** is a decode measurement. It is how fast subsequent tokens appear, and it says essentially nothing about your prompt.

That is why the two numbers can move in opposite directions and why "the model is slow" is not a diagnosis:

- If **TTFT is high and tokens-per-second is fine**, your prompt is long, or you are queued behind other requests. Prefill is the cost, and shortening the prompt or reusing a cached prefix is the fix.
- If **TTFT is low and tokens-per-second is poor**, prefill was trivial and decode is starved. Your output is short-but-slow, and nothing you do to the prompt will help.
- If **both are poor**, you are probably on hardware that is both short on compute and short on memory bandwidth — an underpowered local machine, or an overloaded shared endpoint.

**Streaming**, which you met in the API phase, is now fully explicable. It does not make generation faster by one millisecond. It moves the *first* token's arrival to the front, and since prefill is a large parallel chunk of work that has to finish before anything can be emitted, the wait before token one is the part that feels bad. Streaming hands the user tokens while decode continues. Total time unchanged; experience transformed.

#### The KV cache is what makes decode bandwidth-heavy

Decode has to move the weights — unavoidable, they are needed for the arithmetic — and it also has to move the KV cache, which is the part that grows.

```text
Decode step, per layer, per request:
  read   all weights for the layer
  read   the KV cache entries for every position so far
  write  the new position's K and V
  compute one new token's state
```

The weights are a constant per step. The cache is not: at 2,000 tokens of context you read 2,000 tokens' worth of cached keys and values, at 100,000 tokens you read 100,000. Each of those bytes is read once per step to be used in one dot product.

So a long conversation makes decode *slower per token* even though the weights never changed size. This is the mechanism behind a symptom you have probably felt: a chat that starts snappy and gradually feels heavier. It is not the model getting tired and it is not the sampler. It is more bytes to move per step.

This is also where a fact from Foundations pays off in a new currency. Grouped-query attention reduces the number of key/value heads relative to query heads. Its usual motivation is memory capacity — fitting more concurrent requests into GPU memory — but the effect here is fewer bytes moved per decode step, which is exactly the resource decode is short of. Same change, two bottlenecks relieved.

**The forward pass is not the API call.** "Latency" as you experience it includes several things that are **not** the model:

- **Network round trip.** For a hosted API from the Philippines this is measurable — often tens to a few hundred milliseconds — and it happens before your request reaches a GPU at all.
- **Queueing.** Shared endpoints serve many customers, and your request may wait for capacity. This appears in TTFT and is invisible in tokens-per-second.
- **Safety filtering, routing, and other middleware.** Real, and not the model.
- **The serving framework's own overhead.** Request parsing, scheduling, detokenization, and the streaming transport.

The reason to separate these is diagnostic. If your TTFT is 4 seconds and you assume it is prefill, you might spend a week optimising your prompt when you were actually queued. **Measure locally before you attribute a hosted latency to a mechanism.**

---

### Part 4 — Arithmetic intensity, the idea that decides which resource runs out

You now have the shape of the argument. This part gives you the tool that makes it quantitative, at a level where you can apply it with a calculator.

**Arithmetic intensity is the ratio of arithmetic performed to bytes moved.** For an operation, it is roughly:

```text
arithmetic intensity ≈ (operations performed) / (bytes read from memory)
```

The units are usually floating-point operations per byte, written FLOP/byte. What matters is not the exact value but the *comparison*: every machine has a **compute-to-bandwidth ratio** — how many operations per second it can perform, divided by how many bytes per second it can deliver. If an operation's arithmetic intensity is below the machine's ratio, the operation is **memory-bound**: the arithmetic units finish long before the data arrives, and adding compute changes nothing. If it is above, the operation is **compute-bound**: data arrives fast enough and the arithmetic units are the limit.

Let me make this concrete with a deliberately round example, so the arithmetic is easy to follow. Real numbers vary enormously by chip — do not carry these forward as facts about any particular hardware.

Take a weight matrix of 4,096 × 4,096 numbers, stored in 2 bytes each. That is about 33.5 million bytes, or roughly 0.0335 GB.

```text
Matrix-VECTOR product  (this is decode's shape)
  x has 4,096 numbers
  operations: 4096 x 4096 multiply-adds = 2 x 4096^2 = ~33.5 million FLOPs
  bytes read: the whole matrix = ~33.5 million bytes
  intensity:  33.5e6 / 33.5e6  =  ~1 FLOP per byte

Matrix-MATRIX product  (this is prefill's shape, 2,000 positions)
  X has 2,000 rows of 4,096 numbers
  operations: 2 x 2000 x 4096 x 4096 = ~67 billion FLOPs
  bytes read: the same matrix, plus the activations
              ~33.5 million bytes for the matrix
  intensity:  ~67e9 / ~33.5e6  =  ~2000 FLOPs per byte
```

Look at what did *not* change. The weights are the same matrix, the same size, loaded the same way. What changed is how many times each loaded value got used: once in the first case, roughly two thousand times in the second.

Now suppose a machine's ratio is a few hundred FLOPs per byte. These are illustrative figures in a realistic ballpark for modern accelerators; the point is the comparison, not the numbers:

- Decode at ~1 FLOP/byte is **far below** the machine's ratio. It is memory-bound by roughly two to three orders of magnitude, the compute units sit mostly idle, and buying more compute does nothing.
- Prefill at ~2,000 FLOPs/byte is **far above** the machine's ratio. It is compute-bound; faster memory does nothing for it, and faster arithmetic units help directly.

**This is the entire content of "prefill is compute-bound and decode is bandwidth-bound", and now you can derive it** rather than repeat it.

> **Where the arithmetic-intensity framing stops working.** It is a *steady-state* model of a *specific* kernel, and real systems violate its assumptions constantly. Kernels fuse operations, so measured bytes moved is far below the nominal count. Caches mean a "read" might not touch main memory at all. Sequences are not the lengths you assumed. And a real decode step is a stack of operations plus attention, each with its own intensity, so the step's intensity is a weighted mixture rather than one number. Use this framing to decide *which way* a bottleneck leans and *what class of fix* is appropriate. Do not use it to predict a specific latency.

#### Batching, explained by the same arithmetic

The most important throughput optimisation in serving is batching — running many requests' decode steps together — and now it is obvious why.

Process one request's decode step and the weight matrix is read once and used once: 1 FLOP/byte. Process 64 requests' steps *together* and the same matrix is read once and used 64 times, pushing intensity toward prefill's regime. **You added no compute and no bandwidth. You changed the shape of the operation so the data you already had to move does more work.**

That consequence explains most of the economic shape of the inference business: why a provider serves far more tokens per second in aggregate than a single-user run of the same model, and why the *latency* of one request improves far less — batching raises throughput precisely because decode was wasting the hardware, which a single sequence cannot fix alone.

---

### Part 5 — What this frame lets you predict

Here is a table of symptoms with their mechanisms and their fixes. This is the payout of the phase: you should be able to generate this table yourself for a case that is not in it.

| What you observe | Which phase is implicated | Mechanism | What actually helps | What does not help |
|---|---|---|---|---|
| 3,000-token prompt takes 2 seconds before the first word | Prefill | Every prompt position must be processed before any token can be emitted | Shorter prompt; cached prefix; faster compute | Streaming; a smaller output limit |
| Reply appears quickly, then crawls | Decode | One position per step, reading all weights and the whole cache each time | Fewer bytes to move; more requests sharing the step; fewer bytes per weight | A shorter prompt |
| Same model is much faster on a server than on your laptop | Both, differently | Server batches many users into one step; your laptop runs one | Serve more requests at once | Buying a faster single-user path |
| Long chat gets slower as it goes | Decode | The KV cache grows, so bytes read per step grow | Trim or summarise history; a cache-shrinking architecture | Nothing about the sampler |
| Time-to-first-token improves after a provider adds prefix caching | Prefill | A repeated prefix is no longer recomputed per request | Reuse a stable prefix | Anything on the decode side |
| Quantising to a smaller precision speeds up one workload a lot and another barely | Depends | Quantisation cuts bytes moved, which is decode's bottleneck, and does not cut operations, which is prefill's | Quantise when decode-bound | Expecting a compute-bound workload to speed up |

Three further predictions worth stating explicitly, because they are the ones that generalise.

**Prediction: output length drives total time far more than input length does.** Prefill is one big parallel chunk. Decode is *m* sequential chunks for *m* output tokens. So a 2,000-token reply costs roughly 2,000 decode-step times however you slice it, while doubling the prompt adds one prefill that may cost well under a second. This is why "keep outputs short" is usually a bigger latency lever than "keep inputs short" — the opposite of what people assume, because inputs are what they wrote.

**Prediction: throughput and latency are different products, and no single lever buys both.** Batching raises throughput and barely moves per-request latency. Speculative decoding can lower latency but needs a draft model and spare compute. Caching removes repeated prefill and does nothing for a one-shot request. When something is claimed to make inference "faster", the useful question is *faster at what*, and arithmetic intensity tells you which phase the technique touches.

**Prediction: a bytes-moved fix and an operation-reducing fix are not interchangeable.** Bytes-moved fixes — quantisation, cache-shrinking attention variants, prefix reuse — target the bandwidth-bound phase. Operation-reducing fixes — better kernels, fused operations, algorithmic changes — target the compute-bound phase. Applying one to the other's problem produces a disappointing result and no error message, which is why this distinction is worth internalising rather than looking up.

#### Speculative decoding, as the shape decode invites

Decode's bottleneck is that one sequence cannot use the available compute. Any fix has to put that idle compute to work on something useful. Speculative decoding is the clever one, and it is worth understanding *as a consequence* of Part 4 rather than as a named technique.

The idea: use a small, cheap draft model to propose several tokens ahead in one cheap pass, then verify the whole proposed run with a single pass of the real model — a pass which, because it processes several positions at once, is shaped like prefill and therefore uses the hardware well. If the proposals are accepted, you got several tokens for the cost of one big step.

The claim this is allowed to make is narrower than you will read elsewhere, and the difference matters. Speculative decoding is **distribution-exact**, not "produces identical output". Distribution-exact means the *distribution* over the next token is preserved, and even that holds only under four conditions:

1. The draft model's distribution `q` must be **exact**, not an approximation of the target's.
2. The accept/reject/resample rule must be implemented exactly as specified.
3. Sampling must be cast to the **adjusted distribution** before the accept step.
4. The guarantee is "within hardware numerics" — floating-point arithmetic means bit-identical output is not promised.

Two further limits: **naive rejection sampling is not lossless**, and among the Medusa variants **only Medusa-1 is claimed lossless — not Medusa-2**. So if someone tells you speculative decoding gives you "the same answer, faster", the accurate correction is that it preserves the distribution when specified and implemented correctly, and does not promise identical text.

**Where speculative decoding stops working.** It is a bet that your draft model is often right on *your* workload. It costs extra compute at verification and extra memory for the draft. On a compute-bound, prefill-heavy workload it buys nothing. On hardware where decode is already well-utilised because the batch is large, there is no idle compute to harvest and it can make things worse. Its acceptance rate is data-dependent, so the speedup is workload-dependent and not something to assume.

---

### Part 6 — Where prefill-versus-decode stops predicting what you see

This is the part most write-ups skip, which is why people who have read them get surprised by real systems. The frame is a model. Here is where it breaks.

**Break 1: decode is bandwidth-bound only at low batch sizes.** This is the big one. The arithmetic-intensity argument assumed one sequence per step, where the weight matrix is used once. At a large enough batch, the same weights are used many times per step, and decode migrates into the compute-bound regime. **At that point every prediction flips**: quantisation stops helping as much, batching stops being free, and throughput is limited by arithmetic rather than by memory. Production servers often operate closer to this regime than the single-user picture suggests. So the honest statement of the frame is not "decode is bandwidth-bound" but **"decode is bandwidth-bound when the batch is small, which is the case for local single-user inference and for latency-sensitive low-batch serving."**

**Break 2: the phase split is about the whole request only when outputs are long.** If a request generates twenty tokens, prefill may dominate the total time, and every decode-side optimisation is irrelevant to it. "Prefill versus decode" is a description of a computation; which one *you* care about depends on the ratio of prompt length to output length.

**Break 3: a cached prefix moves work out of the request entirely.** Provider prefix caching turns a prefill you would have paid for on every request into a one-time cost. Same feature, different accounting: **the KV cache** is a per-request inference mechanism that makes decode cheap; **provider prompt caching** is a billed product feature that reuses a prefix across requests and makes prefill cheap. If you conflate them you will mis-predict both cost and latency. A related trap: anything variable at the *start* of your prompt — a timestamp, a request id — invalidates the whole cached prefix, because prefix matching stops at the first divergence.

**Break 4: at very long prompts, attention's quadratic term becomes the binding constraint on prefill.** At 2,000 tokens it is not the bottleneck and the feed-forward layers probably contain more arithmetic. At very long contexts the pairwise term takes over, and then prefill is limited by something neither of the two regimes above describes, which is why memory-efficient attention kernels and long-context attention variants exist at all. Where that crossover sits depends on the model, the hardware, and the length — do not assert a number.

**Break 5: your measurement may not be measuring the phase you think.** Hosted TTFT includes network, queueing, and middleware. A local runtime's reported prefill and decode timings are the honest ones. This is not a footnote: attributing a queueing delay to prefill is the single most common way a reader of this phase reaches a wrong conclusion with confidence.

> **The frame in one sentence, with its limit attached.** Prefill processes your whole prompt in parallel and is limited by arithmetic throughput; decode produces one token per pass, sequentially, and — at small batch sizes — is limited by how fast bytes can be moved. Change the batch, cache the prefix, or generate twenty tokens instead of two thousand, and the sentence's *conclusion* about your request changes while the mechanism stays exactly the same.

---

### Part 7 — Deciding with the frame, and what comes next

A working procedure, five questions, each one you can answer in less time than it takes to write it down.

```text
1. Which phase dominates THIS request?
   Compare prompt length to output length.
   Tiny output  -> prefill dominates. Long output -> decode dominates.

2. What is the user actually unhappy about?
   The wait before the first word   -> TTFT, a prefill symptom.
   The speed after it starts        -> tokens per second, a decode symptom.
   Both                             -> hardware or queueing, not a phase.

3. Is it bandwidth or compute?
   Bandwidth symptoms: fixed memory, growing context, low batch, quantisation helps.
   Compute symptoms: long parallel prompt, high batch, fusion and kernels help.

4. Is the cost inside the model at all?
   Measure locally before blaming a mechanism.
   Network, queueing and middleware all land in TTFT and none of them is inference.

5. What class of fix does that imply?
   Bytes-moved fixes for bandwidth. Operation fixes for compute.
   A fix aimed at the wrong resource produces no error, only disappointment.
```

**What this phase deliberately did not cover.** It described the machine and its bottlenecks; it did not explain the internals of the transformer blocks, which is Phase 2. It did not quantify the KV cache, which is Phase 3 — this phase told you *why* the cache is what decode drags around; Phase 3 tells you how big it gets and how it is managed. It did not cover quantisation as a discipline, which is Phase 4. It did not cover serving and scheduling — how a real server decides whose prefill runs next to whose decode — which is Phase 5. And it did not cover how to choose between the growing set of models and providers, which is Phase 6.

What it did do is give you the frame all five of those phases are consequences of. If you remember one sentence from this lesson, this is the one: **reading a prompt is a big parallel job limited by arithmetic, and writing an answer is thousands of tiny sequential jobs limited by data movement — and almost everything peculiar about the cost, speed, and engineering of language models follows from that asymmetry.**

## Hands-on practice tasks

1. Install a local runtime, pull one small model, and generate a fixed reply with a very short prompt and again with a very long prompt. Record the wall-clock time before the first character appears and the total time, for both. <!-- id: intern-01-inference-anatomy-t01 band: focused energy: normal -->
2. From task 1, compute tokens-per-second for the long-output case. Then write two sentences naming which phase each of your two measurements is a proxy for. <!-- id: intern-01-inference-anatomy-t02 band: quick energy: low -->
3. Hold the output length constant and vary the prompt across four very different lengths. Record time-to-first-token for each and plot prompt tokens against TTFT. Then repeat with a fixed prompt and four output lengths. State in one sentence which relationship is closer to linear. <!-- id: intern-01-inference-anatomy-t03 band: deep energy: high -->
4. Run your runtime's own benchmark mode and compare the prefill rate and decode rate it reports against your hand measurements. Note any disagreement and give one plausible cause — startup, model loading, or measurement overhead are all candidates. <!-- id: intern-01-inference-anatomy-t04 band: focused energy: normal -->
5. Compute the arithmetic intensity of a matrix-vector product and a matrix-matrix product for a matrix size you choose, showing your working. Then look up the memory bandwidth and the peak arithmetic rate of any machine you can find published figures for, form the ratio, and state whether each of the two operations is compute- or bandwidth-bound on it. <!-- id: intern-01-inference-anatomy-t05 band: deep energy: high -->
6. Quantise a model you already have to a smaller precision and re-run task 1. Compare tokens-per-second before and after. Then write two sentences predicting what would happen to a large-batch or long-prompt workload, and why your prediction differs. <!-- id: intern-01-inference-anatomy-t06 band: deep energy: normal -->
7. Write your own one-page version of the five-stage path from Part 1, in your own words, for a reader who has never seen an API. Include the one thing you found hardest to believe. <!-- id: intern-01-inference-anatomy-t07 band: focused energy: normal -->
8. Read enough of a real serving framework's documentation to answer: what does it batch, exactly, and at which point in the step? Write three sentences on how that scheduler interacts with the fact that different requests are at different points in their own sequential chains. <!-- id: intern-01-inference-anatomy-t08 band: deep energy: high -->
9. Write a one-page prediction table in the shape of the Part 5 table, but with six symptoms from your own experience rather than the lesson's. For each, name the phase, the mechanism, one fix that would help, and one common fix that would not. <!-- id: intern-01-inference-anatomy-t09 band: focused energy: normal -->
10. Find one technique being discussed online as a way to make inference faster. Classify it: does it reduce bytes moved, reduce operations, raise batch utilisation, or remove repeated work? Then state which phase it targets and one workload where it would do nothing. <!-- id: intern-01-inference-anatomy-t10 band: focused energy: normal -->
11. Separate network from model on a hosted endpoint: time an empty or near-empty request and subtract that from a real request's TTFT. Report the residual and say what is left in it besides prefill. <!-- id: intern-01-inference-anatomy-t11 band: focused energy: normal -->
12. Keep a one-week log of every LLM interaction where you noticed the wait. For each, note whether the delay was before the first token or during the stream, and write one line naming the mechanism you believe was responsible. <!-- id: intern-01-inference-anatomy-t12 band: ongoing energy: low -->

## Common Pitfalls

**Believing the model generates a whole answer in one go.** It generates one token per forward pass, and each pass depends on the last. Everything about decode's cost, latency, and optimisation follows from this one fact rather than from any architectural limitation.

**Confusing latency with throughput.** A local single-user run and a server serving thousands of users are doing different jobs. Batching is what makes the server efficient, and batching is exactly what a single-user run cannot do. Comparing their tokens-per-second and concluding one "is faster" compares two different measurements.

**Attributing all latency to the model.** Network round trip, queueing, safety middleware and detokenization are not inference. Measure locally before you attribute a hosted delay to a mechanism you are about to spend a week optimising.

**Saying "decode is memory-bandwidth-bound" without the batch qualifier.** At large batch sizes decode moves into the compute-bound regime and the predictions invert. The unqualified claim is the single most common overgeneralisation in this area.

**Treating time-to-first-token and tokens-per-second as one metric.** They measure two different phases. A change that improves one can leave the other untouched or worsen it, and a report that quotes a single "latency" number is telling you almost nothing.

**Expecting quantisation to speed up everything.** It reduces bytes moved. Compute-bound work gains little or nothing, and in some configurations a quantised kernel can be slower than a well-optimised higher-precision one.

**Confusing the KV cache with provider prompt caching.** One is a per-request inference mechanism that makes decode cheap; the other is a billed feature that reuses a prefix across requests and makes prefill cheap. They are related by a shared idea and different in what they cost you.

**Putting anything variable at the start of a cached prompt.** Prefix caching matches from the beginning and stops at the first divergence, so a timestamp or request id at the top invalidates everything after it.

**Assuming speculative decoding gives identical output.** It is distribution-exact under four specific conditions and within hardware numerics — not bit-identical, and naive rejection sampling is not lossless at all.

**Quoting a hardware number as a fact.** Compute-to-bandwidth ratios, achievable bandwidth, and peak rates vary enormously across chips and change with every generation. Use the comparison, not the constant, and date anything you write down.

**Optimising the wrong phase.** A bytes-reducing fix applied to a compute-bound problem produces no error, no crash, and no improvement — just a week gone. Identify the phase first.

## Deliverable / proof of work

Write `portfolio/model-internals/01-inference-anatomy.md` containing:

1. **A diagram of the five stages**, drawn by you, from request string to streamed token, with a one-line note on what each stage costs and whether it is the model or software around it.
2. **Your two-phase measurements** — the short-prompt and long-prompt runs from tasks 1 and 2, with TTFT and tokens-per-second recorded separately and labelled with the phase each one measures.
3. **Your prompt-length and output-length sweeps** from task 3, as a small table or plot, with the one-sentence conclusion about which relationship is closer to linear and why.
4. **Your arithmetic-intensity working** from task 5 — the two calculations shown in full, the machine ratio you looked up with the date you looked it up, and a clear statement of which operation is bound by what on that machine.
5. **Your six-row prediction table** from task 9, covering symptoms you have actually experienced, with mechanism, a fix that addresses the right resource, and a plausible fix that addresses the wrong one.
6. **A prediction you got wrong.** One thing in this phase that contradicted what you expected before reading it, and what the mechanism actually implies. Keep this section even if it is three sentences — it is the most valuable page in the file.
7. **A dated note on every hardware or pricing figure you wrote down**, stating that it is expected to be stale and what you would check to refresh it.

## Checklist

- [ ] I can name the five stages from request string to streamed token, in order <!-- id: intern-01-inference-anatomy-c01 energy: low -->
- [ ] I can say which stages are the model and which are software around it <!-- id: intern-01-inference-anatomy-c02 energy: low -->
- [ ] I can explain why the output projection is not a negligible cost <!-- id: intern-01-inference-anatomy-c03 energy: normal -->
- [ ] I can explain why a model does exactly one forward pass per generated token <!-- id: intern-01-inference-anatomy-c04 energy: normal -->
- [ ] I can explain what the KV cache removes from the second pass and what it does not remove <!-- id: intern-01-inference-anatomy-c05 energy: normal -->
- [ ] I have measured time-to-first-token on my own hardware, not just read about it <!-- id: intern-01-inference-anatomy-c06 energy: normal -->
- [ ] I can explain why token n+1 cannot exist before token n, and what that does to parallelism <!-- id: intern-01-inference-anatomy-c07 energy: normal -->
- [ ] I can explain prefill's parallelism using the shape of the matrix operation, not a slogan <!-- id: intern-01-inference-anatomy-c08 energy: normal -->
- [ ] I can compute a rough arithmetic intensity for a decode step and compare it to a machine ratio <!-- id: intern-01-inference-anatomy-c09 energy: high -->
- [ ] I can explain why batching raises decode throughput without changing its arithmetic <!-- id: intern-01-inference-anatomy-c10 energy: high -->
- [ ] I can say which phase each of TTFT and tokens-per-second measures <!-- id: intern-01-inference-anatomy-c11 energy: low -->
- [ ] I can explain why streaming changes perceived speed and not generation speed <!-- id: intern-01-inference-anatomy-c12 energy: low -->
- [ ] I can explain why a long conversation makes decode slower per token <!-- id: intern-01-inference-anatomy-c13 energy: normal -->
- [ ] I can classify a proposed optimisation as reducing bytes moved, reducing operations, or raising batch utilisation <!-- id: intern-01-inference-anatomy-c14 energy: high -->
- [ ] I can state the conditions under which decode stops being bandwidth-bound <!-- id: intern-01-inference-anatomy-c15 energy: high -->
- [ ] I can state what speculative decoding does and does not guarantee <!-- id: intern-01-inference-anatomy-c16 energy: high -->
- [ ] I can distinguish the KV cache from provider prompt caching and say what each makes cheap <!-- id: intern-01-inference-anatomy-c17 energy: normal -->
- [ ] I can name two costs inside my measured latency that are not the model <!-- id: intern-01-inference-anatomy-c18 energy: normal -->
- [ ] I have written a prediction table with fixes for both the right and the wrong resource <!-- id: intern-01-inference-anatomy-c19 energy: normal -->
- [ ] Every hardware figure in my deliverable is dated, with a note on what to re-check <!-- id: intern-01-inference-anatomy-c20 energy: low -->
- [ ] My deliverable includes a prediction I got wrong and why <!-- id: intern-01-inference-anatomy-c21 energy: normal -->
- [ ] I have re-measured one number I predicted last week, and reported whether it held <!-- id: intern-01-inference-anatomy-c22 energy: low -->

## Quiz

### Q1. A language model has computed a state for every position of your prompt. Why does it still produce only one token per forward pass? <!-- id: intern-01-inference-anatomy-q01 energy: normal -->

- [ ] Because the output projection can only select one vocabulary entry at a time
- [x] Because the next token's input includes the token just generated, so position n+1 cannot be formulated until position n exists
- [ ] Because the KV cache stores only one position at a time
- [ ] Because softmax normalises probabilities to sum to one

**Why:** The constraint is logical, not architectural. The model does compute a state for every position, and could in principle emit several at once, but a causal sequence is built left to right: to score position 2,001 you need to know what sits at position 2,000, and that is not known until it has been sampled. Everything about decode's cost follows from this.

### Q2. Your prompt is 4,000 tokens and the reply is 30 tokens. Which dominates the total time, and which measurement should you improve? <!-- id: intern-01-inference-anatomy-q02 energy: high -->

- [ ] Decode dominates; improve tokens per second
- [ ] They are always equal, because both phases process the same tokens
- [x] Prefill dominates; improve time-to-first-token by shortening or caching the prompt
- [ ] Neither; total time is set by the network round trip

**Why:** Prefill is a single large parallel chunk whose size is your prompt; decode is one sequential step per output token. With a long prompt and a very short reply, the prefill chunk is most of the work. Improving decode would leave the number that actually matters untouched.

### Q3. Which change raises decode's arithmetic intensity without adding any compute or memory bandwidth? <!-- id: intern-01-inference-anatomy-q03 energy: high -->

- [ ] Using a lower-precision data type for the weights
- [x] Processing several requests' decode steps in the same step, so each loaded weight is used many times
- [ ] Increasing the model's context window
- [ ] Turning off the KV cache

**Why:** Arithmetic intensity is operations performed per byte moved. Batching changes how many times each loaded weight participates in arithmetic, so the same bytes do more work. Precision changes bytes moved rather than reuse, a larger window increases bytes moved, and disabling the cache increases work dramatically.

### Q4. A provider announces that speculative decoding is now enabled, "producing identical output, just faster". What is the accurate correction? <!-- id: intern-01-inference-anatomy-q04 energy: high -->

- [ ] It is accurate; speculative decoding is mathematically identical to normal decoding
- [ ] It produces different output and offers no guarantee of any kind
- [ ] It is accurate only when the draft model is larger than the target model
- [x] It is distribution-exact under four specific conditions and only within hardware numerics, so it does not promise identical text

**Why:** The guarantee is that the output distribution is preserved, and it holds only if the draft distribution is exact, the accept/reject rule is implemented exactly, sampling is cast to the adjusted distribution, and one accepts the "within hardware numerics" caveat. Naive rejection sampling is not lossless, and among the Medusa variants only Medusa-1 is claimed lossless.

### Q5. Decode is described as memory-bandwidth-bound. Which situation makes that description stop predicting what you observe? <!-- id: intern-01-inference-anatomy-q05 energy: high -->

- [ ] When the prompt is longer than the output
- [ ] When the model uses grouped-query attention
- [x] When the batch is large enough that each loaded weight is reused many times, moving the step into the compute-bound regime
- [ ] When the request is streamed rather than buffered

**Why:** The bandwidth claim rests on one sequence per step using each weight once. At a sufficient batch size the same weights serve many sequences per step and the step becomes compute-bound, at which point quantisation and batching stop helping the way the single-user picture predicts. The mechanism is unchanged; the conclusion about your request is not.

### Q6. A user complains that a chat assistant "gets slower as the conversation goes on". What is the mechanism? <!-- id: intern-01-inference-anatomy-q06 energy: normal -->

- [ ] The temperature setting drifts upward as the conversation grows
- [ ] The provider throttles long conversations to protect capacity
- [ ] The tokenizer produces more tokens for the same text later in a conversation
- [x] Each decode step reads the whole KV cache, which grows with the conversation, so more bytes must be moved per token

**Why:** Weights are a fixed cost per decode step; the KV cache is not. At 100,000 tokens of context each step reads 100,000 tokens' worth of cached keys and values, all of it read to feed dot products that use each byte once. The model is not degrading and the settings have not changed — there is simply more data to move.

### Q7. A hosted API's time-to-first-token is 3.5 seconds and the tokens-per-second rate is normal. What is the most defensible first conclusion? <!-- id: intern-01-inference-anatomy-q07 energy: normal -->

- [ ] The model is underpowered and should be replaced
- [ ] Decode is starved of memory bandwidth
- [x] The delay is in the pre-answer stage, and network round trip, queueing and prefix processing all live there
- [ ] The temperature is too low

**Why:** TTFT is the prefill-shaped measurement and it also contains everything that happens before the GPU starts: the network round trip, waiting for capacity, middleware, and prefill itself. A normal decode rate rules out a bandwidth-starved step. Measure locally to separate queueing from prefill before optimising anything.

### Q8. You quantise a model to a smaller precision. Which workload is most likely to speed up, and why? <!-- id: intern-01-inference-anatomy-q08 energy: high -->

- [ ] A very long prompt on a large batch, because precision reduces the number of operations
- [ ] Neither; quantisation only changes memory capacity, never speed
- [ ] Both equally, because every phase reads the same weights
- [x] Single-sequence generation, because the step is limited by bytes moved and smaller weights mean fewer bytes

**Why:** Quantisation reduces the size of each number, so it cuts bytes moved; it does not cut the number of multiply-adds. That makes it a bandwidth fix, which helps the bandwidth-bound regime — small-batch decode — and helps compute-bound work much less or not at all, since a long prompt on a large batch is limited by arithmetic rather than by delivery.

### Q9. Two runs report the same tokens per second: your laptop on a local model, and a hosted endpoint serving many users. What can you conclude? <!-- id: intern-01-inference-anatomy-q09 energy: normal -->

- [ ] The two setups have equivalent hardware, since the rate matches
- [ ] The hosted endpoint is poorly configured
- [x] Almost nothing — the hosted run batches many requests per step, so its aggregate throughput and your single-user rate measure different quantities
- [ ] The local model must have a smaller parameter count

**Why:** Batching is what makes a server efficient, and it is exactly what a single-user run cannot do, so equal per-user rates can sit on top of wildly different aggregate throughput. A further wrinkle: two models with similar tokens-per-second numbers are not comparable at all if their tokenizers differ, because a token represents different amounts of text.

### Q10. Which pair correctly matches a symptom to the resource it points at? <!-- id: intern-01-inference-anatomy-q10 energy: normal -->

- [ ] Slow first token points at bandwidth; slow per-token generation points at compute
- [ ] Both symptoms point at network latency
- [ ] Both symptoms point at the sampler's settings
- [x] Slow first token points at prefill and compute; slow per-token generation points at decode and memory bandwidth

**Why:** Prefill processes every prompt position in parallel, so it is shaped like large matrix multiplies and limited by arithmetic throughput. Decode processes one position per step, reading all weights and the whole cache, so at small batch it is limited by how fast bytes can be moved. Matching the symptom to the wrong resource is how a week of optimisation produces no improvement.

## You're ready to move on when...

You can tell the story of a request end to end without notes — tokenization, embedding lookup, the forward pass, the output projection, sampling and detokenization — and say for each stage whether it is the model or software around it. You can explain, using the shape of the matrix operations rather than a slogan, why prefill is compute-bound and parallel while decode is memory-bandwidth-bound and sequential, and you can compute a rough arithmetic intensity for a decode step and compare it to a machine's compute-to-bandwidth ratio. You can look at a symptom — slow first token, slow stream, a chat that degrades — and name the phase, the mechanism, and a fix aimed at the right resource, plus one commonly suggested fix aimed at the wrong one. You can state, without prompting, the conditions under which the whole frame stops predicting what you see: large batches, very short outputs, cached prefixes, and very long prompts where attention's quadratic term takes over. And your portfolio contains a measurement you made yourself, a table of predictions, and at least one prediction that turned out wrong.

## Free vs Paid

### What's free is enough

Everything in this phase is learnable for ₱0, and unusually for a systems topic, most of it is *measurable* for ₱0.

A local model runtime is free and open source — Ollama is MIT-licensed, and llama.cpp underneath it is free as well. Running a small model on your own laptop gives you something no free API tier gives you: an unmetered, uncapped environment where you can run the prompt-length and output-length sweeps from task 3 as many times as you like, and a runtime whose own benchmark reports prefill and decode rates separately, which is exactly the two-number split this phase is about. A hosted free tier is a useful second data point for observing TTFT on a shared server, and the point of using it is to see the difference between a server's behaviour and your own machine's.

The reading is free too. The NVIDIA inference-optimisation post is the clearest public statement of the prefill/decode split and the arithmetic-intensity argument, the vLLM documentation shows how production scheduling actually treats the two phases, and the papers and videos in the resource list cost nothing. So does every spreadsheet you need for task 5, and the machine specifications for the arithmetic-intensity ratio are published by the vendors.

### What a paid tier adds

**A paid API tier** removes rate limits and gives you headroom to run many sequential long-prompt requests, which makes the prompt-length sweep smoother than a free tier allows. It also tends to expose more usage detail — cached-token accounting, for instance — which makes the prefix-caching mechanism in Part 6 observable rather than merely described. Neither is required: every mechanism in this phase is measurable locally.

**A GPU rental or a cloud notebook** lets you test the one thing a laptop cannot easily show you: what happens to all these predictions when the batch gets large. That is the single most interesting experiment in this phase, and it is the one that most directly tests the frame's limits. It is also entirely optional — the frame's failure mode is stated in Part 6, and understanding *why* it fails does not require you to reproduce it.

**A more powerful local machine** is the one purchase that genuinely changes what you can do here, because a laptop's memory bandwidth is the number that determines your tokens per second, and it is not upgradeable. But note what this phase has taught you: a faster machine helps decode in proportion to its bandwidth, and its compute-to-bandwidth ratio is what decides which phase a given workload is bound by. Buying compute when your workload is bandwidth-bound is the mistake this phase exists to prevent.

### When it's worth paying

**Not for this phase.** Every measurement in the task list runs on free, open-source tooling and hardware you already own, and the concepts do not become clearer with a bigger bill. The arithmetic-intensity comparison in task 5 needs published specifications you can read for free and a calculator.

The honest threshold is later and specific: pay when **Phase 4** arrives and you want to measure quantisation's effect on a model too large for your machine, or when **Phase 5** arrives and you want to observe continuous batching on a server you control. Both of those are genuine reasons. Buying capacity to understand prefill and decode is not one — the frame you just learned is what tells you that.
