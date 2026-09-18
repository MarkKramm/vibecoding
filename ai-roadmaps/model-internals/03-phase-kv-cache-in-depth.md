---
id: intern-03-kv-cache-in-depth
track: model-internals
phase: 3
order: 30
title: The KV Cache in Depth
duration: 2 weeks
duration_weeks: 2
energy_mix: "25% reading, 45% hands-on measurement, 20% writing, 10% review"
deliverable: portfolio/model-internals/03-kv-cache-in-depth.md
exit_criteria: >
  You can derive the KV cache size formula from the shape of attention rather
  than recall it, and you can compute cache bytes for a model described only by
  its layer count, key/value head count, head dimension and precision. You can
  explain precisely how grouped-query attention reduces the number of key/value
  heads while leaving the query heads untouched, and what that costs in quality
  headroom. You can state the corrected PagedAttention utilisation figures and
  explain why the inverted "60-80% wasted" version spread. You can distinguish
  the server-side KV cache from provider prompt caching in terms of scope,
  lifetime, and what each one is billed for, and you can name the situation
  where one of them silently stops helping.
---

## Goal of this phase

By the end of this phase you will understand the single concept that explains most of the cost, speed and memory behaviour you will ever observe in a real LLM system: the **KV cache**.

Foundations Phase 4 introduced it, and if you did that phase you already know the one-sentence version — keys and values of past tokens never change, so recomputing them is pure waste. This phase is the depth pass. You will derive the memory formula from the shape of attention rather than memorise it. You will compute it, by hand, for a model you choose. You will then learn the three levers that shrink it, and the serving trick — PagedAttention — that made it cheap to *manage* rather than merely cheap to compute. And you will learn one distinction that people who write production systems still get wrong: the KV cache and provider prompt caching are not the same thing, are not sized the same way, and are not billed the same way.

The point of this phase is that you should be able to *predict* behaviour you have not seen. Given a model card and a conversation length, predict the memory. Given a symptom — a server that can only hold a handful of concurrent users, or a long chat that slows down as it grows — name the mechanism. Given a pricing page with a "cached input" line item, explain what is actually being cached, by whom, and for how long.

Where this phase sits: Phase 2 gave you the architecture — what the layers are and what they compute. This phase takes one artifact of that architecture, the key/value state, and follows it all the way to the invoice.

## Estimated time

**2 weeks, roughly 8–12 hours per week.** A suggested split:

| Activity | Hours/week | Notes |
|---|---|---|
| Reading the lesson with a pen | 3–4 | Part 3 and Part 5 are the ones people skim and regret |
| Sizing calculations by hand, then in code | 2–3 | Calculator and Python, no GPU needed |
| The measurement and model-card tasks | 2–3 | Any laptop; everything here is arithmetic and reading |
| Reading two providers' caching documentation | 1 | Record the date you read them |
| Writing the portfolio entry | 1–2 | Week 2 only |

You do not need a GPU, a paid API key, or an account anywhere to finish this phase. If you completed Foundations Phase 4 you have already seen a lighter version of Part 1 and Part 2; do not skip them, because here you are deriving rather than accepting.

## Skills you'll gain

- Derive the KV cache memory formula from the shapes flowing through attention.
- Compute cache bytes for any model given layers, KV heads, head dimension and precision.
- Explain why the cache is valid only because attention is causal.
- Explain multi-query and grouped-query attention as changes to one number, not as new algorithms.
- Compute the exact factor by which a KV cache is quantized, and state the quality trade.
- Describe the memory fragmentation problem in a naive serving stack.
- Explain how block-based paging borrows virtual memory ideas to solve it.
- State the corrected vLLM utilisation range and explain why the inverted figure spread.
- Distinguish the server-side KV cache from provider prompt caching across five axes.
- Predict which prompt layout will and will not benefit from provider prompt caching.
- Estimate how many concurrent long conversations a given memory budget can hold.

## Specific topics to learn

- What exactly is stored: per-layer key and value tensors, one row per token.
- Why causal masking is the precondition for caching, not a separate optimisation.
- The KV cache memory formula and each factor in it, including the factor of 2.
- Prefill versus decode, and why the cache is written once and read many times.
- Multi-query attention, grouped-query attention, and the group-size arithmetic.
- KV cache quantization: fp16, fp8, int8, and 4-bit, and what each costs.
- PagedAttention and block tables: paging virtual memory ideas into the KV cache.
- Internal versus external fragmentation, and why a naive allocator wastes both.
- The corrected utilisation figures from the vLLM paper and the myth around them.
- Prefix sharing between requests, and how paging makes it nearly free.
- Provider prompt caching as a billed product feature layered on top.
- The contexts where the simple formula stops being a good predictor.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Python 3 | All the sizing and simulation work in this phase | Free | https://www.python.org/downloads/ | Tasks t01 through t05 | Any Python from your OS package manager |
| Hugging Face model cards | Read real layer counts, KV head counts and head dimensions | Free to browse | https://huggingface.co/models | Tasks t03 and t06 | Any published model report or paper page |
| Hugging Face `transformers` docs | See `num_key_value_heads` and cache configuration in a real API | Free | https://huggingface.co/docs/transformers | Task t06 | Read the open source on GitHub |
| vLLM documentation | The reference implementation of paged KV cache management | Free | https://docs.vllm.ai/ | Tasks t04 and t08 | Read the PagedAttention paper instead |
| PagedAttention paper (Kwon et al., SOSP 2023) | The utilisation figures and the fragmentation argument, from the source | Free | https://arxiv.org/abs/2309.06180 | Task t04 | The vLLM docs blog posts summarise the same argument |
| llama.cpp | Run a small model locally and watch the KV cache take memory | Free | https://github.com/ggml-org/llama.cpp | Task t05 | Any free CPU inference tool with a context-size flag |
| Google Colab | Free notebook with a small GPU, if you want to measure real memory | Freemium | https://colab.research.google.com/ | Optional extension to t05 | Your own laptop CPU; the formula carries most of the way |
| An LLM provider pricing page | Compare cached versus uncached input pricing | Free to read | https://platform.openai.com/docs/pricing | Tasks t07 and t08 | Any provider's documentation; read at least two |
| Anthropic prompt caching docs | A concrete, dated implementation of the prompt-cache product | Free | https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching | Task t07 | Any provider's caching documentation |
| draw.io or pen and paper | Draw the block table and the paging diagram | Free | https://app.diagrams.net/ | Task t04 | Paper. Paper is genuinely better here |

## Free/cheap resources

- **PagedAttention / vLLM paper (Kwon et al., SOSP 2023)** — https://arxiv.org/abs/2309.06180
- **vLLM documentation** — https://docs.vllm.ai/
- **vLLM project on GitHub** — https://github.com/vllm-project/vllm
- **Hugging Face, KV cache explained** — https://huggingface.co/blog/not-lain/kv-caching
- **Hugging Face `transformers` documentation** — https://huggingface.co/docs/transformers
- **llama.cpp (GGML project) on GitHub** — https://github.com/ggml-org/llama.cpp
- **Attention Is All You Need (the original paper, arXiv)** — https://arxiv.org/abs/1706.03762
- **RoFormer paper page (rotary position embeddings)** — https://arxiv.org/abs/2104.09864
- **Anthropic prompt caching documentation** — https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
- **OpenAI prompt caching guide** — https://platform.openai.com/docs/guides/prompt-caching
- **OpenAI pricing page** — https://platform.openai.com/docs/pricing
- **Andrej Karpathy, Let's build GPT from scratch (video)** — https://www.youtube.com/watch?v=kCc8FmEb1nY
- **EleutherAI, transformer maths walkthrough** — https://blog.eleuther.ai/transformer-math/
- **Anthropic engineering, introducing Contextual Retrieval (19 Sep 2024)** — https://www.anthropic.com/news/contextual-retrieval

## Lesson: The Memory That Explains the Invoice

Most explanations of the KV cache stop at "it stores keys and values so you do not recompute them." True, and not enough. They do not tell you how big the thing gets, why a serving engine needs a whole subsystem to manage it, or why a pricing page has a line item that looks like the cache but is not the cache.

Seven parts follow: the problem, the mechanism, the two levers that shrink it, the serving trick that packs it, the famous number that gets misquoted, the distinction that decides your bill, and where it all stops working.

### Part 1 — The problem: the cache is an obligation, not an optimisation

A decoder-only model produces one token, appends it to the sequence, then runs the model over the whole sequence again to produce the next one. That is the loop, with no batching over time and no lookahead. Attention needs three things per token: a query, a key, a value. For the token being generated right now, all three are new. For every token before it, the key and value are *the same numbers computed on the previous step*. Not approximately the same. Exactly the same.

Why exactly? Token 7's key is a function of token 7's embedding and the layer's weight matrix, and of nothing after position 7. Run the model again with one more token appended and position 7 still sees the same inputs. Its key and value come out bit-identical. That is causality, and it is what makes caching valid rather than merely convenient.

> **Analogy:** imagine transcribing a long conversation and, after every new sentence, re-reading the entire transcript to rebuild your notes. The notes for sentence 40 cannot have changed just because sentence 41 was spoken.
>
> **Where the analogy breaks:** it suggests the waste is merely annoying. In a real model the "notes" are large dense tensors, and rebuilding them is a multiplicative cost — without a cache, generating 1,000 tokens costs on the order of 1,000 times more attention work than with one. Worse, it implies you have somewhere to *put* the notes for free. You do not: the cache is GPU memory, it is finite, and it decides how many users your server can serve. That is why this phase is about memory management, not speed.

So the cache is not a trick bolted on at the end. Causality makes it *available*; the economics of serving make it *mandatory*. And once you store it, you own it: a growing, per-request blob of GPU memory whose size you had better be able to predict before you deploy.

One consequence is the source of most later confusion. The **query** is the only thing computed fresh each step, and it is scored against *all* cached keys. So step *n* reads *n* keys and *n* values. Generation is cheap per step compared to recomputation, but not constant-cost: it grows linearly with how much has been generated. Total attention work over a reply of length *n* grows like *n²*. The cache converts an *n³* process into an *n²* one — a massive win that is still quadratic. If you remember one sentence from Part 1, make it that one.

**Where this stops working.** The argument rests on the architecture being causal and dense. Encoder-style bidirectional attention has no immutable past, so nothing can be cached. Architectures mixing in sliding-window, sparse, or state-based recurrent layers keep a different and usually much smaller object. And a model whose attention is modified at inference time by a retrofitted prefix or adapter must be examined carefully: "immutable" is a property of the *trained weights*, not of the architecture name.

### Part 2 — Deriving the size formula instead of memorising it

You can look the formula up and remember it for about a week. Derive it once and you will still have it in five years, because you will rebuild it from shapes. Attention, at one layer, works with:

| Tensor | Shape | Notes |
|---|---|---|
| Query | n × h_q × d_head | n is sequence length, h_q query heads |
| Key | n × h_kv × d_head | h_kv key/value heads, which need not equal h_q |
| Value | n × h_kv × d_head | same shape as the key |

Everything about the cache follows from the Key and Value rows.

**Step 1 — what must be stored.** Per layer, per token, that is `h_kv × d_head` numbers for the key and the same again for the value, so `2 × h_kv × d_head`.

**Step 2 — multiply by layers.** Each layer has its own key/value state. A 32-layer model stores 32 such blocks per token: `2 × L × h_kv × d_head`.

**Step 3 — multiply by tokens.** The sequence length includes the prompt and every token generated so far: `2 × L × h_kv × d_head × n_tokens`.

**Step 4 — multiply by bytes per number.** fp16 and bf16 are 2 bytes, fp8 and int8 are 1 byte, a 4-bit cache roughly 0.5 bytes plus per-block scale overhead.

Which gives you:

```text
kv_bytes = 2 * L * h_kv * d_head * n_tokens * bytes_per_element
```

Each factor is a decision someone makes:

| Factor | What it is | Who chooses it |
|---|---|---|
| 2 | One tensor for keys, one for values | Nobody; it is structural |
| L | Number of layers with attention | Architecture |
| h_kv | Number of key/value heads — not query heads | Architecture, and GQA changes exactly this |
| d_head | Dimension of one head | Architecture |
| n_tokens | Prompt plus generated tokens so far | You, and your users |
| bytes_per_element | Storage precision | Deployment configuration |

Two failure modes account for most wrong estimates: dropping the factor of 2 (you store *two* tensors per layer per token, so forgetting it halves your answer), and substituting `h_q` for `h_kv` (these differ by the group size, commonly 4 or 8, and using the wrong one multiplies your estimate by exactly that).

#### A worked example, in full

Take a model with 32 layers, 32 query heads, 8 key/value heads, and head dimension 128, stored in 16-bit precision — a group size of 4. Work it one factor at a time, out loud, the way you would on paper:

```text
per token, per layer:
  2 (K and V) * 8 (kv heads) * 128 (head dim) * 2 (bytes)
  = 4,096 bytes
  = 4 KB

per token, all 32 layers:
  4 KB * 32 = 128 KB

at a 2,000-token conversation:
  128 KB * 2,000 = 256,000 KB ≈ 250 MB

at a 16,000-token conversation:
  128 KB * 16,000 = 2,048,000 KB ≈ 2.0 GB

at a 128,000-token conversation:
  128 KB * 128,000 = 16,384,000 KB ≈ 16 GB
```

Sit with the last line. A single request with a very long context holds roughly **16 GB of cache** — as much memory as the model itself. That fact explains why long-context serving is expensive, why providers meter it carefully, and why the rest of this phase exists.

Turn it into a capacity plan. If a GPU has 80 GB and the weights and runtime take 60 GB, roughly 20 GB is left: at 16 GB per long request, *one* such conversation; at 2 GB per 16k-token conversation, ten. That is the calculation behind every "why can my server only handle N concurrent users" question.
> **Analogy:** the KV cache is like desk space in a shared office. Each person working on a long document spreads out more papers, and the office has a fixed number of desks.
>
> **Where the analogy breaks:** desk space is reclaimed the moment someone leaves. GPU memory must be *allocated* before you know how long each conversation will run, so a naive server reserves for the worst case and wastes the difference — the fragmentation problem in Part 4.

**What this lets you predict.** Given a model card, you can rank models by cache cost per token and explain *why* one is cheaper by pointing at a specific factor. You can estimate the maximum concurrent long-context requests a deployment can hold, and predict that a provider's cheapest long-context tier uses some combination of fewer KV heads, a quantized cache, or a shorter effective window. And doubling conversation length doubles memory footprint while per-token *compute* barely moves — which is why long chats fail by running out of memory rather than by degrading smoothly.

**Where it stops working.** Treat this as the right model for ratios and orders of magnitude, and a poor model for an exact budget. Real attention kernels pad head dimensions to hardware-friendly multiples, so a nominal `d_head` of 96 may be stored as 128. Serving stacks add block metadata and allocator overhead — small per block, but it multiplies. And the formula assumes every layer keeps a full-length cache; sliding-window and hybrid architectures do not. When a model advertises an unusually cheap long context, the honest question is not "is the formula wrong" but "which factor did they change".

### Part 3 — The two levers: fewer heads, fewer bits, and where quality goes

The formula has five factors. `2` is structural. `L` and `d_head` are architectural decisions expensive to change after training. `n_tokens` is set by your users. That leaves two levers a designer or deployment engineer can actually pull: **`h_kv`** and **`bytes_per_element`**. Almost everything you have read about KV cache optimisation is one of these two.

#### Lever one: fewer key/value heads

The observation is asymmetric. Query heads give the model its ability to attend to several things at once — as the foundations track established, multi-head attention buys *different subspaces*, not more raw capacity. Key/value heads are storage. The question is whether each query head genuinely needs its *own* stored keys and values, or whether several could read the same ones.

- **Multi-head attention (MHA):** one key/value head per query head. `h_kv = h_q`. Largest cache, maximum flexibility.
- **Multi-query attention (MQA):** every query head shares a *single* key/value head. `h_kv = 1`. Cache shrinks by a factor of `h_q`. Quality can degrade noticeably, and MQA models can be less stable to train.
- **Grouped-query attention (GQA):** query heads are partitioned into groups, each group sharing one key/value head. `h_kv` sits strictly between 1 and `h_q`, and the **group size** is `h_q / h_kv`.

Be precise about GQA, because this is where people hand-wave. GQA does not change the number of query heads, `d_head`, or the layer count, and it does not alter the attention formula's complexity. Within a group, *g* query heads each compute their own query vector and their own attention weights — they still attend to different things — but they all read the *same* stored keys and values. The saving is exactly the group size, and nothing else in the memory formula moves. With `h_kv = 8` against `h_q = 32`, group size is 4:

```text
MHA   (h_kv = 32): 2 * 32 * 32 * 128 * 2 * 16,000 bytes ≈ 8.0 GB
GQA-4 (h_kv =  8): 2 * 32 *  8 * 128 * 2 * 16,000 bytes ≈ 2.0 GB
MQA   (h_kv =  1): 2 * 32 *  1 * 128 * 2 * 16,000 bytes ≈ 250 MB
```

Same layers, same head dimension, same precision, same token count. The only moving part is `h_kv`, and the cache moves in exact proportion. That is why "which attention variant does this model use" is a cost question as much as a quality question.

As of early 2026, GQA is the common default across most widely used open-weight and hosted models, with group sizes that differ by model and generation. Verify against a current model card; architectures that mix attention variants, or replace some layers entirely, change the arithmetic this comparison cannot capture.
#### Lever two: fewer bits per element

`bytes_per_element` is the only factor you can change on a model that is already trained. Storing the cache in 8 bits instead of 16 halves it; 4 bits roughly quarters it.

```text
fp16 / bf16 : 2.0 bytes per element   (baseline)
fp8 / int8  : 1.0 byte  per element   (≈2x saving)
4-bit       : ≈0.5 bytes plus block scales (≈4x saving, with overhead)
```

Two caveats. First, quantizing the cache is not like quantizing the weights. Weights are static and calibrated offline; the cache is produced at runtime from whatever the user typed, so its distribution is far less predictable. Quantizing keys aggressively is riskier than quantizing values, because keys pass through a softmax where a small error near the top can change which positions win. Second, a 4-bit cache is not literally half of an 8-bit one: block-quantization schemes store a scale, and often a zero point, per group, so the figure sits above the nominal 0.5 bytes.

> **Analogy:** shrinking the cache is like compressing a photograph. At high quality you cannot tell the difference; push the compression hard and you get visible artefacts — but only in the busy regions, while the smooth sky still looks fine.
>
> **Where the analogy breaks:** a photograph is judged by an eye that tolerates blur gracefully. A quantized key vector is fed into a softmax and then into arithmetic that decides, at every layer, which past tokens the model reads from. A tiny numeric error can flip a ranking rather than nudge a pixel. And you cannot look at the output and see the artefact: the model produces fluent, confident text that is subtly worse at the long-range recall you were relying on the cache to preserve.

**What this lets you predict.** Knowing the two levers lets you read a deployment configuration and know what was traded. A vendor advertising "4× longer context at the same memory" quantized the cache, used a larger group size, or both — and the honest question is what it did to recall on long inputs.

**Where it stops working.** Both levers have a floor. `h_kv = 1` is MQA; below one head is meaningless, and below roughly 4 bits per element block overhead eats the savings. More fundamentally, both are *approximations of the same thing*: the exact key/value state. Every saving is a bet that the model does not need the precision you removed. On short prompts with simple questions that bet almost always wins; on the exact-recall workload where the cache matters most, it is the bet you should test rather than assume.

### Part 4 — PagedAttention: the problem was never the arithmetic

Suppose you have accepted the formula and shrunk the cache with GQA and fp8. You have a model that *fits*. You deploy it, and the server still cannot hold as many concurrent conversations as your arithmetic said. The cache is not too big; it is too badly packed.

#### The fragmentation problem

A naive serving engine asks, per request, for one contiguous block of GPU memory sized for the maximum sequence length that request might reach. That single decision causes two kinds of waste.

**Internal fragmentation — reserving for a length you never reach.** You must allocate for the worst case, because the cache grows as tokens are generated and cannot be moved once allocated. Reserve 2,048 tokens, end the conversation after 200, and 90% of that reservation was never used — yet it was unavailable to anyone else for the entire lifetime of the request. Reserving for 128k tokens to answer a question that used 3k leaves almost all of it dead weight.

**External fragmentation — holes between allocations.** Because the reservations are contiguous and of varying sizes, free memory fragments. You might have 8 GB free in total and still be unable to satisfy a request needing a contiguous 2 GB. Operating systems solved this decades ago: stop requiring contiguity.
#### The paging solution

**PagedAttention** applies virtual memory ideas to the KV cache. The paper is Kwon et al., SOSP 2023, and the implementation is vLLM. The mechanism, in four moves:

1. **Chop the cache into fixed-size blocks.** The cache for a sequence becomes a list of blocks rather than one contiguous tensor, each holding the key and value rows for a fixed number of tokens — commonly a small number like 16 — across all layers and heads.
2. **Allocate blocks on demand.** As a new token needs space, the engine hands out one more block from a free pool. No reservation for a length you might never reach, because you never committed to a length.
3. **Keep a block table per sequence.** Each sequence has a small table mapping its logical block index to a physical block. Attention kernels read the table and gather from wherever blocks actually live. The sequence *behaves* as if its cache were contiguous; it is not, and the kernel does not care.
4. **Share blocks between sequences.** Because a block is referenced through a table rather than owned, two sequences with an identical prefix can point at the *same* physical blocks. Copy-on-write applies when one diverges.

The payoff: internal fragmentation shrinks to at most one partially-filled block per sequence — bounded by block size rather than by maximum sequence length — and external fragmentation largely disappears, because every allocation is the same size and blocks are interchangeable.

> **Analogy:** the naive allocator is a car park where each driver is assigned a row long enough for the longest car they might ever buy, and nobody else may use the empty part. PagedAttention is a car park with uniform bays and a valet recording which bay each car is in.
>
> **Where the analogy breaks:** a car occupies one bay and stays there. A KV cache block is written as generation proceeds, so "the same car" keeps growing and needs another bay attached. And the sharing case has no car-park equivalent: two drivers can genuinely share bays when their prefixes are identical — the more valuable half of the insight, and the part the analogy hides.

**What this lets you predict.** Block size trades one kind of waste against another: large blocks mean fewer table lookups and less metadata but more waste on the last partially-filled block; small blocks mean tighter packing but more overhead. Prefix sharing becomes nearly free rather than a special feature — the mechanism underneath provider prompt caching. Most usefully, **memory efficiency and throughput are the same question**: every byte not wasted on reservation is a byte available to another concurrent request.

**Where it stops working.** Paging costs something: attention kernels must gather from non-contiguous blocks, which is more complex and can be slower than one contiguous buffer. Where the cache is small or batch sizes are tiny, the fragmentation being solved may be negligible. And paging cannot create memory: if your requests genuinely need 16 GB each, no allocator packs them into 20 GB. The paper's utilisation figures are about *waste*, a fraction you can drive down — not a multiplier you can conjure capacity from. Finally, the technique is most valuable under exactly the conditions a production server has: many concurrent requests of unpredictable length. Single-request benchmarks understate it.

### Part 5 — The utilisation number, and how a correct result got inverted

This part is short and matters more than its length, because the wrong version of this number is repeated constantly, including in material you would expect to be careful.

What the PagedAttention paper reports is **memory utilisation between 20.4% and 38.2%** for existing systems — systems without paged attention were using only about a fifth to two-fifths of the KV cache memory they had reserved. Read the direction carefully. **20.4%–38.2% is a utilisation figure, not a waste figure.** The waste is the leftover: roughly 61.8% to 79.6%.

So where does "60–80% of KV cache is wasted" come from? From that complement, stated without its referent. The complement is arithmetically correct — 100% minus 20.4% is 79.6% unused — but it is a *derived* quantity, meaningless alone. Say "60–80% wasted" without "of reserved memory in existing systems" and you have dropped three qualifications at once: that the baseline is *reserved* memory rather than memory actually needed, that the figure describes systems *before* paging, and that the same paper's own system is what fixes it. Readers then carry a number that sounds like an indictment of the KV cache itself.

A second, subtler drift: throughput claims travel further than their conditions. The paper reports throughput improvements of **2–4× versus FasterTransformer *and* Orca at the same latency** — a range, against two named baselines, at matched latency. Retelling compresses it into a single multiplier applied to whatever system the reader runs.

> **Analogy:** a survey reports that a warehouse is 30% full. Someone repeats it as "70% of the warehouse is wasted space" — arithmetically defensible and operationally useless, saying nothing about whether the warehouse is badly packed, badly sized, or awaiting a delivery.
>
> **Where the analogy breaks:** a warehouse report is a snapshot nobody acts on. This utilisation figure is the *problem statement* motivating an entire serving architecture, so misquoting it inverts the argument: the paper says "existing systems are inefficient, here is a fix", while the misquote says "this memory is inherently wasteful" — pointing the reader at the wrong solution, shrinking the cache, when the finding was about packing it.

The transferable lesson: when you meet a dramatic figure — a percentage, a multiplier, an X-fold speedup — ask first *what is the denominator*, then *what were the baselines*. Both are usually recoverable from the paper in two minutes, and both are almost always missing from the retelling.
### Part 6 — The KV cache is not prompt caching, and Track 7 depends on it

You now know what the KV cache is. Here is what will confuse you on a pricing page if nobody tells you: **there are two different caches in an LLM API, and only one of them is a product.**

The first is the one you have just spent five parts on. Call it the **engine KV cache**. It lives inside the serving engine, in GPU memory. Its scope is **one request** and its lifetime is that request — when the response finishes, it is gone. **You do not enable it, configure it, or pay for it by name.** It is simply how generation works, and it is the reason a long context is expensive at all.

The second is **provider prompt caching**, a product feature layered on top of the first. It is exposed to you as an API option, and its scope is **across separate requests**. Its lifetime is a provider-defined window, usually on the order of minutes. **You typically enable it, and you are billed for it** — usually a cheaper rate for input that hits the cache, often a premium for writing into it. It is the reason you can send the same 20,000-token instruction block a thousand times without paying full price a thousand times.

Here is the comparison to keep:

| | Engine KV cache | Provider prompt caching |
|---|---|---|
| What is stored | Keys and values for one sequence, all layers | The computed state for a matching prompt prefix |
| Where it lives | GPU memory in the serving engine | Provider infrastructure, exposed as a feature |
| Scope | One request | Across separate requests |
| Lifetime | The request | A provider-defined window, often minutes |
| Enabled by you? | No — it is how inference works | Yes, usually explicitly |
| Billed? | No separate line item | Yes — hits are cheaper, writes may cost extra |
| What it optimises | Making generation possible at all | Making *repeated prefixes* cheap |
| Fails when | Never; it is the mechanism | Your prefix diverges from the cached one |

Three consequences follow, and each is a real decision:

**Ordering.** Prompt caching matches a **prefix**, comparing from the beginning and stopping at the first difference. So everything that varies between requests must come *after* everything stable. Put system instructions and reference documents first; put the user's question and any timestamp last. A timestamp at the top of a 20,000-token prompt does not cost you a little caching — it costs you all of it.

**Quality.** A prompt cache hit is a **billing and latency** event, not a quality event. The reused state is the same state that would have been computed. If output changes depending on whether the prefix was cached, that is an implementation artefact or a bug, not a feature.

**Scope of the saving.** Prompt caching helps *repeated prefixes* — a narrow workload of many requests sharing a long head. It does nothing for a single long document you will never send again, because there is no second request to amortise against. If your workload is one long document per user with no reuse, prompt caching is irrelevant and the thing you care about is the engine KV cache.

As of early 2026, several major providers offer prompt caching under different names, with different minimum cacheable prefix lengths, cache lifetimes, and write and read pricing multipliers. These details change frequently. Record the date you read them, and re-read before building a cost model — a pricing multiplier you memorised last quarter is a number, not a fact.

**Where the distinction stops being clean.** The two caches meet exactly where prefix sharing is implemented: a provider's prompt cache is, mechanically, retained engine-side state for a prefix, kept alive past the request that created it. One is the mechanism, the other a product wrapped around it. What you must never do is reason about your bill using the mechanism's properties (automatic, free, request-scoped) or about your architecture using the product's properties (survives the request, costs money, expires). Getting the direction of the dependency right — product built on mechanism — is the whole skill.

### Part 7 — What you can now predict, and the four ways it breaks

Without looking anything up, you should now be able to reason about all of the following.

**Sizing.** From layers, KV heads, head dimension and precision, compute cache bytes for any sequence length, and say what changes under MHA instead of GQA.

**Capacity.** From a memory budget and an average conversation length, estimate concurrent requests, and identify which factor you would change to double it.

**Symptoms.** A server degrading sharply as conversations grow is hitting cache memory, not compute. A slow first response then fast tokens is prefill-then-decode — the cache written, then read. A chat that gets steadily slower is the linear per-step read cost, *not* the quadratic term in any way you can feel at ordinary lengths.
**Vendor claims.** "Cheaper long context" means fewer KV heads, fewer bits, or a shorter effective window. "Faster with the same memory" means better packing. Ask which, because each has a different quality cost.

Four ways this model breaks:

1. **Architecture drift.** Hybrids interleaving full attention with sliding-window or state-based layers do not have one cache size; they have a schedule, and the formula overestimates them.
2. **Implementation details leak into the number.** Padded head dimensions, block metadata, kernel layouts, and activation memory all push measured usage above the estimate.
3. **Quality is not in the formula.** Every lever in Part 3 is an approximation. The formula says what a configuration costs, not what it loses on your task.
4. **The commercial layer moves monthly.** Cache pricing, lifetimes, prefix minimums, and model support are volatile. The mechanism is durable; the terms are not.

**One last predictive skill.** A chatbot with a fixed 3,000-token system prompt and a different question every time: the engine cache is rebuilt per request, and the prompt cache nearly eliminates the repeated prefill. A one-shot analysis of a 200,000-token report: the engine cache is enormous for that request, and prompt caching does nothing. Both follow from four properties: scope, lifetime, cost, and what each matches on. That is where Track 7 picks up.

## Hands-on practice tasks

1. Write the KV cache formula from memory on paper, then check it against Part 2. For each of the five factors, write one sentence saying who decides it. <!-- id: intern-03-kv-cache-in-depth-t01 band: quick energy: low -->
2. Work the full Part 2 example by hand for a 4,000-token conversation. Show every multiplication and keep the units. Then redo it for fp8 and state the ratio in one sentence. <!-- id: intern-03-kv-cache-in-depth-t02 band: focused energy: normal -->
3. Write a Python function `kv_bytes(layers, kv_heads, head_dim, tokens, bytes_per_element)` and use it to produce a table: rows for 1k, 4k, 16k, 64k and 128k tokens; columns for MHA, GQA-4, GQA-8 and MQA, all at fp16. Explain the column ratios in one paragraph. <!-- id: intern-03-kv-cache-in-depth-t03 band: focused energy: normal -->
4. Read the PagedAttention paper (arXiv:2309.06180). Find the utilisation figures and write down the exact sentence and the section it appears in. Then write the correct statement and the incorrect statement side by side, and in three sentences explain the inversion. <!-- id: intern-03-kv-cache-in-depth-t04 band: deep energy: high -->
5. Simulate a cache allocator in Python: generate 200 requests with sequence lengths drawn from a realistic distribution, and compare total memory used by (a) reserving a fixed maximum length per request and (b) allocating fixed-size blocks on demand. Report the utilisation ratio for each and the block size you chose. <!-- id: intern-03-kv-cache-in-depth-t05 band: deep energy: high -->
6. Open three real model cards from different families and record layers, query heads, KV heads and head dimension from each config. Compute cache bytes per 1,000 tokens for each and rank them. Note the date you read them and any number the card does not publish. <!-- id: intern-03-kv-cache-in-depth-t06 band: deep energy: normal -->
7. Read the prompt caching documentation of two different providers. Build a table of minimum cacheable prefix length, cache lifetime, write price and read price relative to normal input pricing. Do not memorise the numbers; date them. <!-- id: intern-03-kv-cache-in-depth-t07 band: deep energy: normal -->
8. Design a prompt layout for an assistant handling 800 requests a day that share a 6,000-token instruction block, with a per-user account summary and a per-request question. Write the exact ordering, mark which parts are cacheable by the provider, and name three changes that would silently break the cache. <!-- id: intern-03-kv-cache-in-depth-t08 band: focused energy: normal -->
9. Write a one-page decision note for a fictional team: 12 GB of GPU memory available for cache, conversations averaging 9,000 tokens. State how many concurrent requests fit, which single factor you would change first to double that, and what you would measure before and after to know whether the change was safe. <!-- id: intern-03-kv-cache-in-depth-t09 band: focused energy: high -->
10. Keep a week-long log. Every time an LLM interaction feels slow, record whether the slowness was at the start or during output, and how long the conversation was. At the end of the week, connect each entry to prefill, decode, or cache growth. <!-- id: intern-03-kv-cache-in-depth-t10 band: ongoing energy: low -->

## Common Pitfalls

- **Forgetting the factor of 2.** You store keys *and* values. This single omission halves the answer and is the most common error in the whole topic.
- **Using query heads where KV heads belong.** In a GQA model these differ. Substituting `h_q` inflates your estimate by exactly the group size.
- **Repeating "60–80% of the KV cache is wasted."** The paper reports *utilisation* of 20.4%–38.2% in existing systems. The complement is derived, not the finding, and it describes reserved memory before paging.
- **Compressing "2–4× versus FasterTransformer and Orca at the same latency" into a single multiplier.** It is a range, against two named baselines, at matched latency.
- **Thoughtlessly quoting a speedup or utilisation figure without its denominator and baselines.** Almost every distorted number in this field lost one of the two in retelling.
- **Believing GQA reduces the number of query heads.** It does not. Query heads are untouched; their keys and values are shared within a group.
- **Confusing the engine KV cache with provider prompt caching.** One is an automatic per-request inference mechanism; the other is a billed feature spanning requests. Conflating them makes pricing pages unreadable.
- **Assuming a prompt cache hit changes the output.** Caching is a billing and latency optimisation over identical state. If output differs, that is a bug or an artefact.
- **Putting a variable value at the start of a cacheable prompt.** Prefix matching stops at the first difference, so a leading timestamp invalidates the entire cached block.
- **Treating the formula as an exact budget.** Padded head dimensions, block metadata and activation memory push measured usage above the estimate. Use it for ratios and capacity planning.
- **Assuming quantizing the KV cache is as safe as quantizing weights.** Weights are calibrated offline and static; cache values are produced at runtime and their distribution is far less predictable.
- **Hardcoding any layer count, head count, context size or cache price as a permanent fact.** These change between model generations and pricing revisions. Date every number you write down.

## Deliverable / proof of work

Write `portfolio/model-internals/03-phase-kv-cache-in-depth.md` containing:

1. **The formula, derived not copied.** Rebuild it yourself from the shapes of the key and value tensors, then state it in one line and give a table naming each factor and who decides it.
2. **A worked example in your own numbers.** Pick a model shape — from a real model card or invented, but say which — and compute cache size at four sequence lengths at fp16, then repeat at fp8. Show the intermediate arithmetic, including the units.
3. **A lever comparison.** A table with MHA, GQA and MQA columns showing cache bytes at one fixed sequence length, with the group-size ratio stated. Add two sentences on what each variant gives up.
4. **The corrected utilisation statement.** Write both the correct and the incorrect version of the PagedAttention finding, cite the paper with its arXiv id, and explain in a short paragraph why the inverted version is so persistent.
5. **A fragmentation simulation result.** From Task t05, report the utilisation you measured for the naive allocator and for blocked allocation, state your block size, and name one thing your simulation ignores that a real engine must handle.
6. **Your own two-cache table.** Engine KV cache versus provider prompt caching across scope, lifetime, who enables it, what it is billed for, and what it matches on. Written by you, not copied from Part 6.
7. **A dated note.** Every volatile specific you recorded — a model architecture number, a cache price, a cache lifetime — with the date you read it, and one sentence on what you would re-check before relying on it.
8. **A prediction you got wrong.** One thing in this phase that contradicted what you expected, and what the mechanism actually implies. Include this even if it is three sentences.

## Checklist

- [ ] I can state why the key and value of a past token never change, and name the property of attention that makes it true <!-- id: intern-03-kv-cache-in-depth-c01 energy: normal -->
- [ ] I can derive the KV cache formula from tensor shapes rather than recalling it <!-- id: intern-03-kv-cache-in-depth-c02 energy: normal -->
- [ ] I can name all five factors in the formula and say who decides each one <!-- id: intern-03-kv-cache-in-depth-c03 energy: normal -->
- [ ] I have computed cache bytes by hand for a full worked example, at two precisions <!-- id: intern-03-kv-cache-in-depth-c04 energy: normal -->
- [ ] I can explain precisely how GQA reduces `h_kv` while leaving the query heads and head dimension unchanged <!-- id: intern-03-kv-cache-in-depth-c05 energy: normal -->
- [ ] I can compute the group size and the exact cache reduction from a model card <!-- id: intern-03-kv-cache-in-depth-c06 energy: normal -->
- [ ] I can describe the quality risk of KV cache quantization and say where it bites hardest <!-- id: intern-03-kv-cache-in-depth-c07 energy: normal -->
- [ ] I can explain internal and external fragmentation in a naive serving allocator <!-- id: intern-03-kv-cache-in-depth-c08 energy: normal -->
- [ ] I can draw the block table and explain how paging removes the contiguity requirement <!-- id: intern-03-kv-cache-in-depth-c09 energy: normal -->
- [ ] I can state the corrected vLLM utilisation range and explain why the inverted figure spread <!-- id: intern-03-kv-cache-in-depth-c10 energy: normal -->
- [ ] I have read the utilisation figures in the PagedAttention paper itself, not a summary <!-- id: intern-03-kv-cache-in-depth-c11 energy: high -->
- [ ] I can distinguish the engine KV cache from provider prompt caching across scope, lifetime and billing <!-- id: intern-03-kv-cache-in-depth-c12 energy: normal -->
- [ ] I can explain why prefix ordering determines whether provider prompt caching helps at all <!-- id: intern-03-kv-cache-in-depth-c13 energy: normal -->
- [ ] I can name a workload where provider prompt caching is irrelevant and say why <!-- id: intern-03-kv-cache-in-depth-c14 energy: normal -->
- [ ] I have estimated concurrent request capacity from a memory budget and named a lever to double it <!-- id: intern-03-kv-cache-in-depth-c15 energy: high -->
- [ ] I can name the four ways the simple cache model breaks in practice <!-- id: intern-03-kv-cache-in-depth-c16 energy: normal -->
- [ ] I have dated every volatile number in my notes and know each may already be stale <!-- id: intern-03-kv-cache-in-depth-c17 energy: low -->
- [ ] I have written the deliverable file and included a prediction I got wrong <!-- id: intern-03-kv-cache-in-depth-c18 energy: high -->

## Quiz

### Q1. Why is a past token's key and value still valid on the next generation step? <!-- id: intern-03-kv-cache-in-depth-q01 energy: normal -->

- [x] Because the key and value at that position are a function only of earlier embeddings and the layer weights, both already fixed
- [ ] Because causal masking means it depends only on tokens at or before its position, so nothing later can change it
- [ ] Because the provider's prompt cache keeps it alive across requests
- [ ] Because attention re-derives it from the cached query on every step

**Why:** Causality is what makes caching valid, not a side effect of it. The key at position *j* is a function of embeddings up to *j* and the layer's weights — both fixed once computed. This is also why a bidirectional encoder cannot use the same trick.

### Q2. Two models have identical layer counts, head dimensions and precision, but model A has 32 KV heads where model B has 8. At the same sequence length, how do their cache sizes compare? <!-- id: intern-03-kv-cache-in-depth-q02 energy: normal -->

- [ ] They are equal, because attention output width is unchanged
- [x] A needs 4 times as much cache as B, because cache size is linear in `h_kv`
- [ ] A needs 16 times as much cache as B, because both heads and values double
- [ ] B needs more cache, because grouped-query attention adds bookkeeping per group

**Why:** Every factor in the formula other than `h_kv` is held fixed, and `h_kv` enters as a straight multiplier. 32 / 8 = 4. The factor of 2 for keys and values applies to both models equally, so it cannot change the ratio.

### Q3. A colleague writes: "PagedAttention showed that 60–80% of KV cache memory is wasted." What is wrong with the claim? <!-- id: intern-03-kv-cache-in-depth-q03 energy: high -->

- [x] The paper reports *utilisation* of 20.4%–38.2% in existing systems; the complement is a derived quantity whose qualifications get dropped
- [ ] Nothing; the paper reports waste in that range
- [ ] The range should be 40–60%, not 60–80%
- [ ] The paper reports waste for batching but not for the cache itself, which it measures as fully packed

**Why:** 100% minus 20.4% is 79.6%, so the arithmetic is defensible, but the claim has lost its denominator. The figure describes reserved memory in systems *before* paging, which is exactly the problem the paper's own system solves. Repeat the utilisation range and its baseline instead.

### Q4. Which change leaves the KV cache size per token completely unaffected? <!-- id: intern-03-kv-cache-in-depth-q04 energy: normal -->

- [ ] Halving the number of key/value heads
- [ ] Storing the cache in fp8 instead of fp16
- [x] Increasing the number of query heads while keeping the key/value head count fixed
- [ ] Doubling the conversation length

**Why:** Cache bytes are `2 × L × h_kv × d_head × bytes`. Query head count `h_q` does not appear at all. That is precisely the asymmetry GQA exploits: you can keep many query heads while storing few key/value heads.

### Q5. What does the KV cache's lifetime look like compared with provider prompt caching? <!-- id: intern-03-kv-cache-in-depth-q05 energy: normal -->

- [ ] Both persist until the provider's cache window expires
- [ ] The KV cache persists across requests; prompt caching lasts one request
- [ ] Both last exactly as long as the HTTP connection is open
- [x] The KV cache lasts one request and is discarded; prompt caching persists across requests for a provider-defined window

**Why:** The engine KV cache is per-request state and is released when the response finishes. Provider prompt caching is designed for the opposite job — reusing a prefix across *separate* requests — so it survives the request, typically for minutes, and is billed accordingly.

### Q6. A 16-bit KV cache entry is 2 bytes. Roughly what happens to cache size if you store it as a well-implemented 4-bit cache? <!-- id: intern-03-kv-cache-in-depth-q06 energy: normal -->

- [ ] It falls to exactly one sixteenth
- [x] It falls to roughly a quarter, slightly above that once per-block scales are counted
- [ ] It is unchanged, because attention still reads the same number of values
- [ ] It falls to roughly a half, the same as fp8

**Why:** 4 bits is half of 8 bits and a quarter of 16 bits, so the element storage falls about 4×. Block-quantization schemes store a scale, and often a zero point, per group of elements, so the real figure sits modestly above a clean quarter. The number of values read is unchanged — only their width.

### Q7. Why does putting a per-request timestamp at the very start of a long prompt break provider prompt caching? <!-- id: intern-03-kv-cache-in-depth-q07 energy: normal -->

- [ ] It does not; prompt caching matches on content anywhere in the prompt
- [ ] It only breaks caching if the timestamp changes by more than a minute
- [x] Prefix matching compares from the beginning and stops at the first difference, so a leading variable invalidates everything after it
- [ ] It breaks the engine KV cache but leaves prompt caching intact

**Why:** Caching reuses a *prefix*. The match runs from the first token and ends at the first divergence, so anything variable must come after everything stable. This is the single most common practical mistake with prompt caching, and it costs the entire saving rather than a fraction of it.

### Q8. You send a 200,000-token report to a model exactly once and never reuse it. Which statement is correct? <!-- id: intern-03-kv-cache-in-depth-q08 energy: high -->

- [ ] The engine KV cache is large for the duration of that request, and provider prompt caching offers no benefit because there is no repeated prefix
- [ ] Provider prompt caching halves the cost, because the prefix is long
- [ ] Neither cache is involved, because both require repeated requests
- [x] The engine KV cache is built for that request and is the reason a single huge context is expensive, while prompt caching has nothing to amortise

**Why:** Prompt caching amortises a prefix across requests; with one request there is nothing to amortise, so it does nothing. The engine KV cache is still built — it is how generation works — and it is exactly why a single huge context is expensive. This is the workload where the two caches are most often conflated.

## You're ready to move on when...

- You can derive `kv_bytes = 2 × L × h_kv × d_head × n_tokens × bytes_per_element` from tensor shapes, without looking it up.
- You have computed cache size by hand for a real or stated model shape, at two precisions, showing the arithmetic.
- You can explain in one sentence why `h_q` does not appear in the formula, and what GQA does to `h_kv`.
- You can state the corrected PagedAttention utilisation range, name what it measures, and explain why the inverted version spread.
- You can describe block-based paging and the two kinds of fragmentation it removes, and name one thing paging cannot do.
- You can draw the engine-versus-provider cache comparison from memory across scope, lifetime, who enables it, and billing.
- You can name a workload where provider prompt caching is irrelevant, and say why.
- You can estimate concurrent request capacity from a memory budget and identify a lever that would double it.
- You can name at least three ways the simple formula overestimates or underestimates real usage.
- Every volatile number in your notes carries the date you read it.
- Your deliverable file exists at `portfolio/model-internals/03-phase-kv-cache-in-depth.md` and includes a prediction you got wrong.

## Free vs Paid

### What you can do for free

Everything essential in this phase costs **₱0**. The KV cache formula is arithmetic you can do on paper or in any Python install. Model cards on Hugging Face are free to browse without an account, and they are where the real layer counts and KV head counts live. The PagedAttention paper is free on arXiv, and reading the utilisation figures in the paper itself — Task t04 — is the single highest-value free activity here, because it is the moment the inverted figure stops being something you might repeat. Provider pricing and caching documentation pages are free to read, and reading two of them side by side costs nothing but an hour.

You do not need a GPU. Every computation in this phase is multiplication and division on numbers you can read off a model card. The fragmentation simulation in Task t05 is a few dozen lines of Python with no library beyond the standard one.

### What costs money, and whether you need it

- **A GPU or GPU rental.** Only useful if you want to *measure* cache memory during real generation instead of computing it. A free Google Colab tier with a small GPU is enough to load a tiny model and watch memory move as context grows. It is a nice confirmation and it is not required — the formula and the simulation teach the mechanism.
- **Paid API access.** Only needed to *observe* a prompt cache hit on a real bill. Free tiers exist on several providers and change frequently. If you spend nothing, Task t07 still gives you the full conceptual picture from documentation alone; you just do not see the invoice line.
- **A local model runner.** llama.cpp is free and open source, but running a model locally needs RAM and disk. A small quantized model on a laptop with 8 GB is usually enough to watch the context size flag change memory use. Treat this as optional and skip it if your machine is tight.
- **A course.** As of early 2026 the free resources above — the paper, the project documentation, the model cards — cover this material better than most paid introductions, because the material is public and well documented. Pay for structure or a certificate, not for the content.

### When paying is actually worth it

One case justifies spending, and only one: if you are *building* something whose cost depends on cache behaviour, a small amount of paid API credit buys you a measured cache hit, a real latency difference, and a real invoice line. That converts every claim in Part 6 from something you read into something you observed. It is worth a few hundred pesos once, and it is worth nothing at all before you have done the free reading, because you will not know which number on the bill you are looking at.

**The honest budget:** ₱0, roughly 16–24 hours over two weeks, a notebook, and a laptop that can run Python. Everything else — the paper, the model cards, the pricing pages, the documentation — is free, and the one thing money buys is a confirmation of a mechanism you can already explain.
