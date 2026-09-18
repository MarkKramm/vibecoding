---
id: intern-05-serving-and-throughput
track: model-internals
phase: 5
order: 50
title: Serving, Batching, and Throughput
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/model-internals/05-serving-and-throughput.md
exit_criteria: >
  You can explain from memory why generation is bound by weight reads rather than
  arithmetic, and use that to predict what a larger batch does to per-token latency
  and to throughput. You can describe static batching and name the exact failure it
  has, then describe continuous batching as the fix and say what it gives up. You can
  state the speculative decoding guarantee precisely: distribution-exact, conditional
  on four named conditions, and only within hardware numerics per the original paper.
  You can explain prefix sharing, chunked prefill, tensor parallelism and pipeline
  parallelism well enough to say which bottleneck each one addresses and which it
  leaves untouched. You can take two providers serving the same open-weight model and
  write a ranked list of serving-stack differences that could explain a latency gap,
  and name the diagnostic that would distinguish them.
---

## Goal of this phase

Two providers serve the same open-weight model. Same weights, same tokenizer, same context limit. One answers in 400 milliseconds; the other takes two and a half seconds. Nothing in the model card explains the difference, because the difference is not in the model. It is in the serving stack — the layer of software that decides how requests share a GPU.

That layer is what this phase is about, and it is the part of inference almost nobody teaches to beginners. You have already met the two phases of generation in the attention phase: **prefill**, which chews through your prompt in parallel, and **decode**, which emits one token at a time. This phase explains why decode is the strange one. It is a job where the hardware does almost no arithmetic and spends nearly all its time waiting on memory — and once you see that, batching stops being an optimisation detail and becomes the central fact of LLM economics.

Get this right and you can predict things you have not measured. You can predict that doubling batch size barely moves your time-to-first-token but can transform cost per token. You can predict that a chatbot with wildly variable answer lengths is the worst case for a naive server and the best case for a modern one. You can predict that speculative decoding gives you speed at constant memory but goes *negative* on a memory-bound workload. And you can predict that "provider A is faster than provider B" is a statement about software, not about intelligence.

## Estimated time

**1 week** at 1–2 hours a day, 5 days. Roughly 6–8 hours total.

| Day | Focus | Time |
|---|---|---|
| 1 | Parts 1–2: the bandwith wall and static batching | 1.5h |
| 2 | Parts 3–4: continuous batching, and the arithmetic of throughput | 1.5h |
| 3 | Parts 5–7: speculative decoding, prefix sharing, chunked prefill, parallelism | 2h |
| 4 | Practice tasks, especially the queue simulator | 2h |
| 5 | Deliverable, quiz, and the prediction you got wrong | 1.5h |

No GPU is required. Every task in this phase runs on a laptop CPU in Python, because the thing being simulated is a *scheduler*, and a scheduler is just arithmetic plus a clock.

## Skills you'll gain

- Explain why decode is memory-bandwidth bound and prefill is compute bound, and predict which dominates for a given workload.
- Compute the arithmetic intensity of a decode step and say why it sits far below the hardware's balance point.
- Emit a batch of prompts as one tensor and explain why a naive batch left-pads and why that is wasteful.
- Simulate static batching and measure its wasted slots, then simulate continuous batching and compare.
- Explain what a PagedAttention-style block allocator buys, including internal and external fragmentation.
- State the speculative decoding guarantee exactly, and name all four conditions and how each one can break.
- Explain prefix sharing, chunked prefill, tensor parallelism, and pipeline parallelism, and name the bottleneck each addresses.
- Read a serving engine's configuration and predict which knob matters for your workload.
- Diagnose a latency gap between two providers of the same model without access to either one's internals.

## Specific topics to learn

### Why batching exists

- Arithmetic intensity, and why decode sits near 1 FLOP per byte regardless of model size.
- The hardware balance point, and why a decode step is far below it.
- The distinction between latency, per-request throughput, and aggregate throughput.
- Why the same weights are re-read for every token of every request.

### Batching strategies

- Static batching and the straggler problem.
- Left-padding, position ids, and attention masks for batched prompts.
- Continuous batching, also called in-flight batching: iteration-level scheduling.
- Prefill–decode interference when both kinds of work share one forward pass.
- Paged KV memory and block allocators.

### Speculative decoding

- Draft, verify, accept: the three-step loop.
- The four conditions for distribution-exactness.
- Why rejection sampling and lowest-cost resampling are not the same thing.
- Why greedy decoding has no guarantee at all.
- Self-speculation, and the difference between Medusa-1 and Medusa-2.

### Sharing and scaling

- Prefix sharing and how it relates to provider prompt caching.
- Chunked prefill and time-to-first-token versus stalling decode.
- Tensor parallelism, pipeline parallelism, and the communication they introduce.
- Data parallelism and what it does not fix.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Python 3 | Simulate a batching scheduler and compute the token wall | Free | https://www.python.org/downloads/ | Tasks t01, t03, t04, t09 | Any Python 3 from your OS package manager |
| vLLM documentation | Read the real continuous-batching and PagedAttention design | Free | https://docs.vllm.ai/ | Tasks t03, t05, t10 | Read the source on GitHub; it is Apache-2.0 |
| vLLM paper (PagedAttention) | The primary source for block-based KV memory | Free | https://arxiv.org/abs/2309.06180 | Task t05 and Part 3 | The SOSP 2023 PDF, also free |
| Hugging Face `transformers` docs | Learn how a batch is actually built: padding, position ids, attention masks | Free | https://huggingface.co/docs/transformers/main/en/padding_truncation_strategies | Tasks t01 and t02 | Read the library source on GitHub |
| Hugging Face model cards | Read real architecture numbers to compute parameter memory | Free to browse | https://huggingface.co/models | Tasks t01 and t09 | Any published model report or config file |
| Google Colab free tier | Optionally load a tiny model and measure real per-token latency | Freemium | https://colab.research.google.com/ | Optional extension to t09 | Your laptop CPU; a 100M-parameter model runs fine |
| Speculative decoding paper page | Read the algorithm and its stated guarantee in the original words | Free | https://arxiv.org/abs/2211.17192 | Part 5 and Task t06 | The arXiv HTML version; no account required |
| Medusa paper page | Check what exactly is claimed lossless, and what is not | Free | https://arxiv.org/abs/2401.10774 | Task t07 | Same paper on arXiv HTML; free |
| A provider status or pricing page | Compare two providers of the same open-weight model | Free to read | https://openrouter.ai/models | Tasks t10 and t12 | Any two providers' own docs and status pages |
| matplotlib | Draw your queue-depth and latency curves | Free | https://matplotlib.org/stable/install/index.html | Tasks t04 and t10 | Python's built-in `csv` plus a spreadsheet |

## Free/cheap resources

- **Efficient Memory Management for Large Language Model Serving with PagedAttention (Kwon et al., SOSP 2023)** — https://arxiv.org/abs/2309.06180
- **vLLM project documentation** — https://docs.vllm.ai/
- **vLLM source repository** — https://github.com/vllm-project/vllm
- **Fast Inference from Transformers via Speculative Decoding (Leviathan et al., 2022)** — https://arxiv.org/abs/2211.17192
- **Accelerating Large Language Model Decoding with Speculative Sampling (Chen et al., 2023)** — https://arxiv.org/abs/2302.01318
- **Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads** — https://arxiv.org/abs/2401.10774
- **Orca: A Distributed Serving System for Transformer-Based Generative Models (Yu et al., OSDI 2022)** — https://www.usenix.org/conference/osdi22/presentation/yu
- **Hugging Face documentation on padding and truncation strategies** — https://huggingface.co/docs/transformers/main/en/padding_truncation_strategies
- **Hugging Face documentation on text generation strategies** — https://huggingface.co/docs/transformers/main/en/generation_strategies
- **NVIDIA, Mastering LLM Techniques: Inference Optimization** — https://developer.nvidia.com/blog/mastering-llm-techniques-inference-optimization/
- **Andrej Karpathy, Let's build GPT from scratch (for the decode loop itself)** — https://www.youtube.com/watch?v=kCc8FmEb1nY

## Lesson: Why the Same Model Costs Different Amounts Everywhere

You now know what a transformer computes and what the KV cache holds. What you do not yet know is why *serving* — the software layer between your HTTP request and the GPU — changes the price by an order of magnitude without changing a single weight. I will build this the same way every time: the problem, then the mechanism, then what you can predict with it, then where it stops working.

### Part 1 — Decode is not arithmetic, it is a trip to the memory bank

Start with the problem. You have one token, a vector of length `d`, passing through `L` layers. In each layer it is multiplied by four weight matrices of roughly `d × d` (the attention projections and the two feed-forward matrices).

Count the arithmetic. Each `d × d` matrix times a `d`-vector costs about `2d²` FLOPs — `d²` multiplies and `d²` adds. Four per layer is `8d²`; across `L` layers, `8Ld²`. That is the whole computation.

Now count the bytes. To do that arithmetic you must read all four matrices from memory: `4d²` numbers per layer, times `L` layers, times the bytes per number. At two bytes each, `8Ld²` bytes.

Divide FLOPs by bytes: `8Ld² / 8Ld² = 1`.

**One FLOP per byte read.** That ratio has a name — arithmetic intensity — and it does not depend on model size, layer count, or hidden width; it cancels out. A 1-billion-parameter model and a 400-billion-parameter model both sit at roughly 1 FLOP per byte during single-request decode.

Now compare it to the hardware. A datacentre accelerator has a **balance point** — the arithmetic intensity at which it stops being bound by memory and starts being bound by its compute units — somewhere in the low hundreds of FLOPs per byte. As of 2026-09, look up the actual figure for your part rather than trusting a curriculum; you will find it two orders of magnitude above 1. Check it yourself: peak FLOPs divided by memory bandwidth, both from the vendor's datasheet.

> **The thing to hold on to:** during single-request decode, over 99% of the hardware's arithmetic capacity sits idle. Not because the code is bad, but because there is not enough work to do between memory loads.

**What this lets you predict.** Generation never gets cheaper per token — every token is a fresh trip through the weights, and slightly *more* expensive than the last because the KV cache you must also read grows with context length. And the fix for a memory-bound workload is to use each memory read more than once. That is all batching is: read the weight matrix once and multiply it by 64 different token vectors, and arithmetic intensity rises 64×. This is why a serving engine will process 64 unrelated requests in one forward pass — from the weights' point of view they are indistinguishable.

**Where it stops working.** All of the above is decode *at batch size 1*.

- With a large enough batch, decode becomes compute bound and the story reverts to ordinary FLOP counting. The crossover depends on the model, precision, sequence length, and hardware.
- Prefill is a different regime entirely. Prefill multiplies the same weights by *n* prompt tokens at once, so its arithmetic intensity is already around *n* FLOPs per byte. A 4,000-token prompt reaches the balance point on its own. Prefill is compute bound, and quoting "inference is memory bound" at a prefill-dominated workload is exactly wrong: time-to-first-token on a long prompt is arithmetic, not bandwidth.
- The KV cache read, which I ignored above, changes the shape. Decode must also read the keys and values of every previous token, and at long context cache reads can exceed weight reads. This is the mechanism behind the phase-4 observation that decode degrades as a conversation lengthens.

### Part 2 — Static batching, and the flaw that is not a bug

You now know why to batch. Here is the obvious way to do it, and why it breaks.

Put 32 requests in a list. Wait until all 32 have arrived. Run them together. Return results as they finish. That is **static batching** — also called request-level batching — and it is what the tutorials teach, because it is what `model.generate()` does when you hand it a list of 32 prompts. Two problems appear, and only one is obvious.

The obvious one is **padding**. Sequences have different lengths and tensors are rectangular. If request 1 has a 12-token prompt and request 2 has a 900-token one, you pad both to 900 — on the *left*, because with a causal mask the real tokens must end at the same position, or the final position's logits (your next-token prediction) would come after padding.
```python
import torch

prompts = [[101, 102], [201, 202, 203, 204], [301]]   # lengths 2, 4, 1
pad_id = 0
max_len = max(len(p) for p in prompts)

# Left-pad so every row's real tokens END at the same index.
input_ids = torch.tensor([[pad_id] * (max_len - len(p)) + p for p in prompts])
attention_mask = (input_ids != pad_id).long()

# Position ids start at 0 for the first REAL token of each row, so padding
# shifts nothing real. This matters for RoPE, where position feeds a rotation.
position_ids = attention_mask.cumsum(dim=-1) - 1
position_ids.masked_fill_(attention_mask == 0, 0)

print(input_ids.tolist())       # [[0, 101, 102], [201, 202, 203, 204], [0, 0, 301]]
print(attention_mask.tolist())  # [[0, 1, 1], [1, 1, 1, 1], [0, 0, 1]]
print(position_ids.tolist())    # [[0, 0, 1], [0, 1, 2, 3], [0, 0, 0]]
```

Twelve slots, seven real tokens — 42% padding, and production batches are worse because real prompts have a long tail: a few huge ones among many small ones.

The non-obvious problem is the **straggler**, and it is fatal. The whole batch runs until every sequence has emitted its end-of-sequence token. Decode is sequential — token *t+1* needs token *t* — so members finish at different times and the batch cannot advance past the longest. If 31 requests want 40 tokens each and one wants 2,000, then for the last 1,960 steps, 31 of your 32 slots hold finished sequences doing nothing. Ideal slot usage would be about `(31 × 40 + 2000) / 32 ≈ 101` steps' worth; static batching takes 2,000. This is not a rare case but the *normal* one: real chat traffic mixes "what's the capital of France" with "walk me through this stack trace".

> **The rule that follows:** in static batching, throughput per step is fixed and the number of steps is set by the longest member. Total cost is governed by the worst request in the batch, not the average one. Adding a second long request to a batch that already has one is nearly free; adding a long request to a batch of short ones is catastrophic.

There is a second, quieter cost: **the queue**. Requests arriving while a batch runs must wait for the whole batch, because the next batch is assembled only when this one finishes — a wait that lands directly on **time-to-first-token**. Under load, static batching produces sawtooth latency and throughput well below what the hardware can do.

**What this lets you predict.** From a workload's output-length distribution you can estimate slot waste before running anything, and queuing delay is a step function that resets at batch boundaries — see that sawtooth in a latency histogram and you are looking at request-level batching.

**Where it stops working.** When outputs are genuinely uniform and known — classification, embedding extraction, fixed-length JSON extraction — the straggler evaporates and static batching is adequate. It remains the right model for offline batch jobs where latency does not matter. The failure is specific to interactive, variable-length generation.

### Part 3 — Continuous batching: schedule by the step, not by the request

The fix is one idea: **stop scheduling at the granularity of requests; start scheduling at the granularity of decoding steps.**

In **continuous batching** — vLLM's documentation calls it continuous batching, Orca's paper calls the same idea iteration-level scheduling — each decoding step the scheduler looks at every sequence in the running set. Any sequence that emitted an end-of-sequence token (or hit its max-token limit) leaves immediately, its result returning and its memory releasing. Any request in the waiting queue is admitted into the free slot for the *next* step, with its prefill scheduled — possibly split across steps, which is Part 7.

Nothing else changes: each sequence still attends over its own KV cache, and outputs are what they would have been alone. The only change is *when a slot may be reused* — at the end of a token instead of the end of a request.

With continuous batching, the 31 short requests finish at step 40, their slots are refilled at step 41, and the long request keeps running without blocking anybody. Throughput is limited by how much work you can keep in flight, not by the longest member of an arbitrary group. Critically — and this surprises people — it improves **both** metrics at once. Admitting new work immediately means a new request does not wait for an unrelated long generation, so its time-to-first-token drops, while the batch stays full, so aggregate throughput rises. There is no latency-versus-throughput trade here, which is why the change was adopted so completely.

The published result is worth stating precisely, because it gets mangled constantly. The PagedAttention/vLLM paper (Kwon et al., SOSP 2023, [arXiv:2309.06180](https://arxiv.org/abs/2309.06180)) reports that vLLM "improves the throughput of popular LLMs by 2–4× with the same level of latency compared to the state-of-the-art systems, such as FasterTransformer and Orca." Note the structure: a *range*, against *two named baselines*, at *matched latency*. Not a single multiplier, not a universal speedup, and not a claim about latency.

Now the memory side. Sequences arrive and leave constantly, each with a KV cache that grows token by token. Give each request one contiguous block sized for its maximum length and the waste is brutal in two ways: **internal fragmentation** (you reserved 4,096 slots; the request used 300) and **external fragmentation** (free memory scattered in pieces too small to fit a new request, unusable even though the total suffices).

PagedAttention answers this the way an operating system does: store the KV cache in fixed-size **blocks**, keep a block table per sequence mapping logical positions to physical blocks, and allocate on demand. Sequences sharing a prefix can point at the *same* physical blocks, which is how prefix sharing becomes nearly free. The abstract describes the result as "near-zero waste in KV cache memory" plus flexible sharing within and across requests — the abstract's words, and the right ones to quote. If you have seen a claim that the paper measures 60–80% of KV cache wasted, that inverts its tables, which report memory *utilisation* in the low tens of percent for the compared systems and near-full utilisation for vLLM. Read the tables yourself; they are short.

**What this lets you predict.** Variable output lengths gain the most from continuous batching; uniform ones gain the least, because there was no straggler to eliminate. And the *only* remaining batch-size limit is KV memory: once request-level waste is gone, your concurrency ceiling is "how many sequences' worth of KV cache fit in the VRAM left after the weights".

**Where it stops working.** Continuous batching is not free.

- **Prefill and decode interfere.** A newly admitted long prompt needs a compute-bound prefill pass; sequences mid-decode need a bandwidth-bound step. In one forward pass neither gets ideal treatment, and decoding sequences see their inter-token latency spike whenever a long prompt is admitted. Hence prefill token caps per step, and **chunked prefill** (Part 7).
- **Per-sequence work is not zero.** Padding to the longest *current sequence* remains, plus block-table bookkeeping and per-sequence sampling.
- **It does not create memory.** The hard limit is still KV cache bytes; continuous batching ensures you *use* what you have. Run 8,000-token prompts at high concurrency and no scheduler will save you.

### Part 4 — Where the speedup comes from, in one table

"Throughput" is used for several different quantities, and mixing them makes the whole subject feel arbitrary.

| Quantity | Definition | What improves it |
|---|---|---|
| Per-request latency | Wall-clock time for one request: TTFT + (tokens × TPOT) | Smaller model, shorter prompt, faster interconnect, speculation |
| Per-request throughput | Tokens per second *for one user's stream* | Batch size *up to the crossover*, then it declines |
| Aggregate throughput | Total tokens per second across all users | Batch size, continuous batching, paged memory |
| Goodput | Requests per second that meet an SLO (e.g. TTFT < 1s) | All of the above, plus admission control |

The counter-intuitive entry is the second row. As batch size grows from 1, per-token time for a single request *improves* at first — you are finally using memory bandwidth you were paying for anyway. Then, once the batch is large enough that arithmetic units become the limit, it worsens roughly linearly. So per-request latency versus batch size is a shallow **U**, while aggregate throughput rises and then flattens at the compute ceiling. Providers live on that curve and pick different points: one targets interactive latency with a smaller batch and expensive over-provisioning; another maximises tokens per peso and accepts a longer queue. **Same weights, different position on the curve, different price and different feel.** Hold that for Part 8.

```python
def step_us(b, params_b, bytes_per_param=2, bw_gb_s=2000,
            peak_tflops=400, overhead_us=12):
    """One decode step: the LONGER of streaming weights or computing."""
    mem = params_b * 1e9 * bytes_per_param / (bw_gb_s * 1e9) * 1e6
    flops = 2 * params_b * 1e9 * b / (peak_tflops * 1e12) * 1e6
    return overhead_us + max(mem, flops)


print([round(step_us(b, 7) / 1000, 2) for b in (1, 8, 32, 64, 128, 256)])
```

Run it with your own hardware constants: ms/token/user falls to a minimum around batch 32, then rises, while total tokens per second plateaus. Lower the bandwidth constant and the U gets shallower; lower the compute constant and the plateau arrives earlier. **The optimal batch size is a property of your hardware and workload, not a constant.**

**Where it stops working.** This model ignores the KV cache read, which at long context dominates and changes the shape of the U — the memory term stops being constant in batch size and starts growing with it, flattening per-user gains and pulling the plateau down. It ignores prefill and tensor-parallel communication, and assumes the two terms overlap perfectly, which they do not at the edges. Use it for direction, never for an absolute millisecond figure.

### Part 5 — Speculative decoding: buying latency with spare compute

Go back to the asymmetry in Part 1. During decode, arithmetic units are idle and memory bandwidth is saturated: there is a huge amount of *free* compute and no free bandwidth. Speculative decoding is the cleverest use of that free compute in modern inference, and the way it is usually described is subtly wrong.

The mechanism, in three steps:

1. **Draft.** A cheap model — a smaller model trained on the same data, or extra prediction heads bolted onto the target — proposes the next *k* tokens, typically 4 or 5, autoregressively. Fast precisely because the draft is small.
2. **Verify.** The full target model runs a *single* forward pass over the prompt plus all *k* proposals. This is where the trick lives: because the target processes sequence positions in parallel, it computes its own next-token distribution at every one of those *k* positions in one pass — the same cost as generating one token — plus a bonus distribution after the last proposal.
3. **Accept or reject.** Walk the proposals left to right, comparing the draft's probability for the proposed token against the target's. On rejection, discard that proposal and everything after it.

If the draft is good, you accepted *k* tokens for the price of one target-model pass. The paper reports speedups of roughly 2–3× on the workloads it tested (Leviathan et al., 2022, [arXiv:2211.17192](https://arxiv.org/abs/2211.17192)). Now the precision that matters, because "speculative decoding produces identical output" is a claim that will get you corrected by anyone who has implemented it.

**The guarantee is that the output distribution is exactly the target model's distribution — not that the output is identical.** Those are different statements, and identity is much stronger: two samples from the same distribution are usually *not* the same string. Distribution-exactness means the sampler with speculation draws from precisely the distribution the target model defines; nothing is distorted. The particular random draw can still differ, exactly as between two runs of ordinary sampling with different seeds. Want bit-identical output to a specific non-speculative run? You need the same random number stream and the same numerics, which you do not get for free.
**The guarantee is conditional on four things.** Break any one and it is no longer exact:

1. **The draft is drawn from a distribution you know exactly.** The acceptance rule needs the draft's probability for the proposed token. Quantized or approximated draft sampling makes the correction term wrong.
2. **The accept/reject/resample rule is implemented exactly as specified.** Accept proposal *x* with probability `min(1, p_target(x) / p_draft(x))`; on rejection, resample from the *adjusted* distribution `max(0, p_target − p_draft)` renormalised. That adjustment is the whole point. **Naive rejection sampling — accept or reject, then draw from the unadjusted target distribution — is not lossless.** It over-samples where target and draft agree and under-samples where they disagree, silently changing your outputs.
3. **Sampling is cast into the adjusted distribution, and every sampling transform is applied consistently to both.** Top-k, top-p, temperature and repetition penalties each reshape the distribution. Apply them to the target but not the draft, or at different stages in the two paths, and the adjusted distribution you resample from is not the one you intended. This is the condition most often violated in practice, and why an engine can be exact for plain temperature sampling and subtly inexact once a repetition penalty is switched on.
4. **Within hardware numerics.** The Chen et al. formulation (2023, [arXiv:2302.01318](https://arxiv.org/abs/2302.01318)) adds this qualifier explicitly: equivalence holds subject to the numerical precision of the hardware, because `p_target(x) / p_draft(x)` in floating point is not the real-number ratio. So the honest phrasing is "distribution-exact up to floating-point error", not "provably exact".

A fifth practical condition, not one of the four: **greedy decoding has no guarantee at all.** There is no distribution to be exact about — you are taking an argmax — and different engines make different accept-rule choices, which can change the argmax result. Decode greedily and "lossless" is simply the wrong word.

**The "lossless" label, applied carefully.** Medusa (Cai et al., 2024, [arXiv:2401.10774](https://arxiv.org/abs/2401.10774)) adds extra decoding heads and separates two training procedures. **Medusa-1**, fine-tuned on a *frozen* backbone, is the one described as enabling lossless inference acceleration — the backbone is untouched, so the target distribution is untouched. **Medusa-2**, fine-tuned *together with* the backbone, gets better acceptance and higher speedups (the abstract reports 2.3–3.6× versus over 2.2× for Medusa-1), but it changes the backbone's weights and therefore its distribution. It is not claimed lossless, and calling it so misreads the abstract. For a separate-draft-model setup, replace "lossless" with "distribution-exact under the four conditions above".

Medusa's tree-based verification shows what the verification pass makes possible: rather than one chain of *k* proposals, verify a *tree* of candidate continuations in one pass, because verification is parallel over positions and the causal mask lets you evaluate branches sharing a prefix.

**What this lets you predict.** Speculation buys latency with *spare compute*, so:

- It **helps** when you are memory bound — single-request or small-batch decode, the interactive chatbot case. The ceiling is set by **acceptance rate**: if the draft agrees 40% of the time, you accepted about 0.4 useful tokens per target pass.
- It **stops helping, and can hurt**, when you are already compute bound. At a large batch, arithmetic units are saturated with real work, so speculative tokens compete for units that were never idle, and heavy concurrent traffic makes speculation pure overhead. The speedup shrinks toward zero and can go negative.
- It costs **memory** for the draft weights, competing with KV cache for the same VRAM, so on a memory-tight server it can reduce your maximum batch size.
- It needs low target/draft divergence to pay at all, and it breaks exact-match reproducibility: a regression suite will move when you switch speculation on even though the distribution is unchanged.

### Part 6 — Prefix sharing: the cache nobody had to copy

The KV cache for a prefix is a function of the prefix tokens and the model weights, so it never changes once computed. Prefix sharing takes the next step: **if two sequences have the same prefix, their KV blocks are identical, so they should be the same physical blocks.**

With block-based memory this is trivial. Sequence A's block table points at physical blocks 7, 12, 31. Sequence B's prompt starts with the same 512 tokens, so B's table points at the *same* blocks, then diverges into its own. The blocks are reference-counted and freed when the last sequence using them finishes. No copying, no extra memory, and the prefill for those tokens is skipped entirely — a direct saving in time-to-first-token.

This is the server-side mechanism underneath what providers sell as **prompt caching**, and the two are not the same thing. Prefix sharing is an inference-engine technique that reduces memory and skips prefill; it is why a system prompt shared by thousands of users costs the server almost nothing after the first request. Provider prompt caching is a product feature with a price list — typically a premium to *write* a prefix and a discount to *read* it. The discount exists because the provider's cost genuinely is lower, but the price points are a business decision.

The practical trap follows from the mechanism: **matching is on a prefix, from the beginning.** A single varying token at the start — a timestamp, a session id, a user's name — makes every block table diverge at block zero and nothing can be shared. Everything stable goes first, everything variable last. And because blocks are fixed-size, the shared portion rounds down to a block boundary: a 500-token shared prefix with a 16-token block size shares 496 tokens. Eviction policy and minimum cacheable length are provider-specific and change; As of 2026-09 they differ between providers, so check rather than assume.

**What this lets you predict.** A RAG system with a 4,000-token instruction block and a different retrieved chunk per request gets sharing on the instruction block and not the chunk. Inject a timestamp before the instruction block and you get nothing.

**Where it stops working.** Prefix sharing cannot help when prefixes genuinely differ, and it does not survive eviction: free the shared blocks between requests and the next request pays full prefill again. It also interacts badly with **load balancing** — you can only hit a cached block on the machine that holds it, so a request routed to a different replica finds nothing. That is why serious deployments use prefix-aware routing rather than round-robin.

### Part 7 — Chunked prefill, and the two ways to split a model

Four more mechanisms: recognise them and know what each is for.

**Chunked prefill** addresses the interference from Part 3. A 30,000-token prompt is a long compute-bound burst. Run it as one prefill step and every sequence currently decoding stalls for its duration — inter-token latency spikes and a user watching a stream sees the text freeze. Chunked prefill breaks the prompt into fixed-size chunks (say 2,048 tokens) and processes one per scheduling step, mixed with other sequences' decode work. The honest trade-off: decode latency stops spiking, but the long prompt's prefill now takes several steps, so *its* time-to-first-token gets worse. You are choosing which user waits, which is why engines expose a prefill token budget per step.

**Tensor parallelism** splits *within* a layer. Every device holds a slice of every weight matrix — typically the feed-forward intermediate dimension and the attention heads are partitioned, with an all-reduce to combine partial results. It is the right tool when a *single forward pass* does not fit or is too slow: it cuts memory per device *and* compute per device. Its cost is communication on every layer of every step, so it needs fast interconnect. Note the interaction with Part 1: it does **not** fix the memory-bandwidth wall, because each device still streams its own slice of weights once per step.

**Pipeline parallelism** splits *across* layers. Device 0 holds layers 0–15, device 1 holds 16–31, and a micro-batch flows through stage by stage. The cost is the **bubble**: while device 0 works on micro-batch 3, device 1 may have nothing to do, which you fill with enough micro-batches in flight. It needs far less inter-device bandwidth than tensor parallelism — only activations cross stage boundaries — but needs many concurrent sequences to stay busy.

**Data parallelism** is the one to keep separate: N complete copies of the model, with requests routed to them. It does not make any single request faster; it multiplies capacity. "One request is too slow" is not a data-parallelism problem; "we are out of room for concurrent users" is — provided you handle prefix-aware routing.

Real engines combine these, and providers rarely publish which. What matters is the symptom-to-mechanism mapping: *single request too slow* → tensor parallelism or a smaller model. *Throughput ceiling too low* → batching and continuous batching. *First token takes too long* → queueing and chunked prefill. *Out of memory* → quantization, GQA, paged KV, or fewer concurrent sequences.

### Part 8 — Why two providers of the same model feel different

Now the payoff. Same weights, same tokenizer, different latency. Ranked list of explanations, with what each looks like in your measurements:

1. **Batch size and operating point on the U-curve** — cheap tokens, high time-to-first-token, low inter-token jitter.
2. **Queue depth and admission control** — TTFT spikes under load while TPOT stays stable, correlating with time of day rather than your prompt.
3. **Scheduler quality** — sawtooth latency, with TPOT tracking the longest *other* request co-scheduled with yours.
4. **Prefix caching and routing** — repeated prompts fast, novel prompts slow.
5. **Quantization** — small systematic quality drift alongside a large speed change.
6. **Speculation on or off** — TPOT much better at low concurrency and flat at high.
7. **Parallelism strategy** — long prompts and long outputs scale differently.
8. **Interconnect and distance** — uniform additive latency, visible as an RTT floor on a trivial prompt.
9. **Hardware generation, power limits, partitioning** — a whole-curve shift, visible as differing throughput per peso.
10. **Genuinely different weights or revisions** — differences neither small nor systematic, confirmed at temperature 0.

The most useful split in that list is **time-to-first-token versus time-per-output-token**, because they isolate different parts of the stack. A TTFT difference with equal TPOT points at queueing, prefill compute, prefix caching, or network. A TPOT difference with equal TTFT points at the decode path: batch size, speculation, quantization, parallelism. You can also predict the *shape* of a complaint before you hear it — "fast when I test it, slow for my users" is queue depth and batch size; "the first token takes forever, then it's fine" is prefill and queueing.

> **The claim to internalise:** when two providers serve the same open-weight model at different speeds, you are almost never looking at a difference in the model. You are looking at two different schedulers, two different memory managers, and two different choices about where to sit on the latency–throughput curve. Both are "the model". Only one of them is what you experience.

**Where it stops working.** All of this is inference from black-box measurements. You cannot see a provider's batch size or scheduler, and a measured difference can have several simultaneous causes you cannot separate without their telemetry. Published benchmarks use hardware and sequence lengths that rarely match your workload, and the numbers change on a scale of weeks. What does not change is the mechanism: bandwidth-bound decode, batching to amortise weight reads, scheduling per step rather than per request, sharing what is shareable, and spending spare compute on speculation.

**Where this whole phase stops working.** Nothing here tells you what the model will *say*. Serving determines how fast and how cheaply tokens appear, not whether they are any good — a tuned serving stack will produce fluent nonsense at 4,000 tokens per second. Judging the output is a different skill, and it is not in this track.

## Hands-on practice tasks

1. Compute the arithmetic intensity of a single decode step for three model sizes, assuming two bytes per weight, and show that the FLOPs-per-byte ratio is the same for all three. Then look up one accelerator's peak FLOPs and memory bandwidth and state its balance point. Write one sentence on what the gap means. <!-- id: intern-05-serving-and-throughput-t01 band: focused energy: normal -->
2. Emit three prompts of lengths 2, 4, and 9 as a single left-padded tensor. Print the `input_ids`, the attention mask, and the position ids. Then predict — before running it — what breaks if you switch to right-padding while keeping the same position ids, and why. <!-- id: intern-05-serving-and-throughput-t02 band: quick energy: low -->
3. Write a simulator for static batching: a list of output lengths, a batch size, and a rule that the batch ends when the longest member finishes. Report slot utilisation for each batch and overall. Then run it on a realistic distribution: 90% of requests 40–80 tokens, 10% at 600–2,000 tokens. <!-- id: intern-05-serving-and-throughput-t03 band: deep energy: high -->
4. Extend your simulator to continuous batching: free a slot the step a sequence finishes, and admit a waiting request into it immediately. Plot slot utilisation over time for both schedulers on the same workload, and plot time-to-first-token for each. Write three sentences on which metric improved more and why. <!-- id: intern-05-serving-and-throughput-t04 band: deep energy: high -->
5. Read the vLLM paper's tables. Find the memory utilisation percentages it reports for the baselines and for vLLM, and write them down with the table number. Then write one sentence explaining why "vLLM wastes 60–80% of the KV cache" is the opposite of what the tables show. <!-- id: intern-05-serving-and-throughput-t05 band: focused energy: normal -->
6. Read the speculative decoding paper's algorithm listing. Write out the accept/reject/resample rule in your own notation, then deliberately break it: describe what distribution you actually sample from if, on rejection, you resample from the unadjusted target distribution. Explain in two sentences why that is not lossless. <!-- id: intern-05-serving-and-throughput-t06 band: focused energy: normal -->
7. Read the Medusa abstract carefully. Write down which of Medusa-1 and Medusa-2 is described as lossless, and what the paper says the other one trades for its higher speedup. Note the exact reported speedup ranges for each. <!-- id: intern-05-serving-and-throughput-t07 band: quick energy: low -->
8. Design a prompt layout for a customer-support assistant that handles 2,000 requests a day with a shared 3,500-token policy document, a per-user account summary, and a fresh question. State the exact order, identify which parts share KV blocks, and name two realistic changes to the layout that would destroy sharing. <!-- id: intern-05-serving-and-throughput-t08 band: focused energy: normal -->
9. Build the toy step-cost model from Part 4 and run it for a 7B and a 70B model at two bytes per weight. Sweep batch size 1 to 256 and find the batch that minimises per-user milliseconds per token for each. Then halve the memory bandwidth constant and find it again. Explain the shift. <!-- id: intern-05-serving-and-throughput-t09 band: deep energy: high -->
10. Pick one open-weight model and find two providers serving it. For each, measure time-to-first-token and time-per-output-token separately on the same prompt, using a streamed response, at three different times of day. Record the date, model name, and provider. Build a two-column comparison and rank the explanations from Part 8 that fit your data. <!-- id: intern-05-serving-and-throughput-t10 band: deep energy: normal -->
11. Write, in twenty lines or fewer, a function that takes a list of prompts sharing a common prefix and computes the fraction of prefill tokens that can be shared, given a fixed block size. Run it on your own RAG prompt template. <!-- id: intern-05-serving-and-throughput-t11 band: focused energy: normal -->
12. Open any serving engine's configuration reference and read the knobs that control batching: maximum batched tokens, maximum sequences, prefill chunk size, GPU memory utilisation fraction. Write one line per knob saying which workload it helps and which it hurts. Do not memorise the defaults. <!-- id: intern-05-serving-and-throughput-t12 band: focused energy: normal -->
13. Keep a two-week log of every LLM interaction that felt slow. For each, record whether the delay was before the first token or spread across the output, and whether other people were likely using the service at that moment. At the end, write a paragraph connecting each entry to a mechanism from this phase. <!-- id: intern-05-serving-and-throughput-t13 band: ongoing energy: low -->

## Common Pitfalls

- **Saying "speculative decoding produces identical output".** The guarantee is distribution-exactness under four conditions. Identical bytes require the same RNG stream and numerics too, which is a different and stronger claim.
- **Calling naive rejection sampling lossless.** Resampling from the unadjusted target distribution instead of `max(0, p_target − p_draft)` renormalised changes what you are sampling from. It is a real bug, and it is quiet.
- **Saying Medusa-2 is lossless.** The paper describes Medusa-1, on a frozen backbone, as the lossless one. Medusa-2 fine-tunes the backbone for higher speedup and makes no such claim.
- **Claiming "lossless" for greedy decoding.** There is no distribution to preserve in an argmax. Use the word only where a distribution exists.
- **Quoting the vLLM paper as "2–4× faster" or as a percentage of wasted cache.** It is 2–4× *throughput* at the *same latency* versus *FasterTransformer and Orca*, and its tables report utilisation percentages, not a waste figure.
- **Assuming batching always helps latency.** Per-request latency as a function of batch size is a shallow U. Past the crossover, more batching makes each individual user slower, and it can push you past a time-to-first-token SLO.
- **Treating "inference is memory-bandwidth bound" as universal.** It describes single-request decode. Prefill is compute bound, and large-batch decode is compute bound. Match the claim to the regime.
- **Ignoring the KV read when reasoning about long context.** At long sequence lengths the cache read can dwarf the weight read, which is why long-context decode degrades and why very long prompts at high concurrency are memory bound.
- **Confusing prefix sharing with provider prompt caching.** One is an engine technique; the other is a priced feature that exists because of it. Neither is the KV cache you met in phase 4.
- **Forgetting that cached prefixes are per replica.** Round-robin load balancing silently destroys the benefit. Prefix-aware routing is part of the mechanism, not an optimisation on top of it.
- **Writing down a specific provider's cache lifetime, price, or latency as a fact.** Date it. These change monthly and the mechanism is what you are actually learning.
- **Believing a published benchmark tells you about your workload.** Batch size, sequence length mix, hardware, and engine version all differ. Benchmarks are evidence about the mechanism, not predictions about your bill.

## Deliverable / proof of work

Write `portfolio/model-internals/05-serving-and-throughput.md` containing:

1. **The bandwidth wall, derived.** Show the FLOPs-per-byte calculation for one decode step, cancel the terms, and state the ratio. Then give one real accelerator's balance point and the ratio of that figure to yours.
2. **A batching comparison you generated yourself.** Slot-utilisation-over-time for static batching and continuous batching on the same synthetic workload, plus a table of overall utilisation for each. Include the workload's length distribution so the result can be judged.
3. **A latency table from two providers.** One model, two providers, streamed responses, TTFT and TPOT recorded separately, at three times of day, with the date. Include the model name and version string exactly as the API reports it.
4. **A ranked explanation.** For whichever latency gap you observed, list the Part 8 mechanisms in the order you would investigate them for *your specific* data, and name the one measurement that would confirm or eliminate the top candidate.
5. **The speculative decoding conditions, in your own words.** All four, each followed by a concrete example of how it gets broken in a real implementation.
6. **A prediction you got wrong.** One thing in this phase that contradicted your expectation. If your batching simulation came out differently from what you guessed, that is the ideal entry. Three sentences is enough.

## Checklist

- [ ] I can derive the FLOPs-per-byte ratio of a decode step and show it is independent of model size <!-- id: intern-05-serving-and-throughput-c01 energy: high -->
- [ ] I can state one accelerator's balance point and the gap between it and single-request decode <!-- id: intern-05-serving-and-throughput-c02 energy: normal -->
- [ ] I can explain why prefill is compute bound while single-request decode is bandwidth bound <!-- id: intern-05-serving-and-throughput-c03 energy: normal -->
- [ ] I have emitted a left-padded batch by hand, including position ids, and explained why left <!-- id: intern-05-serving-and-throughput-c04 energy: normal -->
- [ ] I can explain the straggler problem in static batching without using the word "inefficient" <!-- id: intern-05-serving-and-throughput-c05 energy: normal -->
- [ ] I have measured slot waste for static batching on a realistic output-length distribution <!-- id: intern-05-serving-and-throughput-c06 energy: high -->
- [ ] I can describe continuous batching as iteration-level scheduling, not as "a smarter queue" <!-- id: intern-05-serving-and-throughput-c07 energy: normal -->
- [ ] I have simulated both schedulers and can say which metric improved more <!-- id: intern-05-serving-and-throughput-c08 energy: high -->
- [ ] I can distinguish internal from external fragmentation and say what block allocation fixes <!-- id: intern-05-serving-and-throughput-c09 energy: normal -->
- [ ] I can state PagedAttention's headline result with its baselines, its unit, and its condition <!-- id: intern-05-serving-and-throughput-c10 energy: normal -->
- [ ] I can name all three steps of speculative decoding and explain why verification is a single pass <!-- id: intern-05-serving-and-throughput-c11 energy: normal -->
- [ ] I can state the four conditions for distribution-exactness from memory <!-- id: intern-05-serving-and-throughput-c12 energy: high -->
- [ ] I can explain why naive rejection sampling is not lossless <!-- id: intern-05-serving-and-throughput-c13 energy: high -->
- [ ] I can say which Medusa variant is claimed lossless and why the other is not <!-- id: intern-05-serving-and-throughput-c14 energy: normal -->
- [ ] I can explain why speculative decoding can reduce throughput even while improving latency <!-- id: intern-05-serving-and-throughput-c15 energy: normal -->
- [ ] I can explain prefix sharing as shared physical KV blocks, not as a copy <!-- id: intern-05-serving-and-throughput-c16 energy: normal -->
- [ ] I can state why prefix-aware routing is required for caching to pay off across replicas <!-- id: intern-05-serving-and-throughput-c17 energy: normal -->
- [ ] I can describe chunked prefill's trade-off in terms of which user waits longer <!-- id: intern-05-serving-and-throughput-c18 energy: normal -->
- [ ] I can distinguish tensor from pipeline parallelism by what they split and what they cost <!-- id: intern-05-serving-and-throughput-c19 energy: normal -->
- [ ] I have written the deliverable file and included a prediction I got wrong <!-- id: intern-05-serving-and-throughput-c20 energy: high -->

## Quiz

### Q1. During single-request decode, roughly how much arithmetic work does the hardware do per byte of model weights read, and what follows from it? <!-- id: intern-05-serving-and-throughput-q01 energy: normal -->

- [ ] Around 1,000 FLOPs per byte; decode is compute bound and needs better kernels
- [x] Around 1 FLOP per byte, independent of model size; decode is memory-bandwidth bound and most arithmetic units idle
- [ ] It scales with parameter count, so larger models are proportionally more bandwidth bound
- [ ] It depends only on the number of attention heads, which is why GQA helps latency

**Why:** Each layer reads four weight matrices of about d² numbers and does about 8d² FLOPs with them, so FLOPs and bytes both scale as Ld² and the ratio cancels to roughly 1 for two-byte weights. That is two orders of magnitude below a modern accelerator's balance point, which is why single-request decode wastes nearly all of the machine's arithmetic capacity and why batching — reusing each weight read across many tokens — is the central optimisation.

### Q2. Which of the following is the fatal flaw of static (request-level) batching? <!-- id: intern-05-serving-and-throughput-q02 energy: normal -->

- [x] The whole batch runs until the longest member finishes, so short sequences hold slots doing nothing
- [ ] It cannot pad sequences to a common length, so it produces wrong outputs
- [ ] It recomputes the KV cache for every request on every step
- [ ] It prevents the use of a KV cache at all

**Why:** Decode is sequential, so a batch cannot advance past the sequence that still needs tokens. With mixed output lengths — which is normal chat traffic — most slots sit finished for most of the batch's lifetime, and utilisation can collapse into single digits. Padding is a real cost but it is a constant-factor nuisance; the straggler is what makes request-level scheduling unusable for interactive generation.

### Q3. What does continuous batching actually change? <!-- id: intern-05-serving-and-throughput-q03 energy: normal -->

- [ ] It processes several tokens per step per sequence by predicting ahead
- [ ] It removes the attention mask so padding no longer costs anything
- [ ] It replaces the transformer with a faster architecture at the same quality
- [x] It schedules at the granularity of decoding steps, so a finished sequence frees its slot immediately and a waiting request is admitted

**Why:** The only change is when a slot may be reused — at the end of a token rather than the end of a request. Outputs are unchanged because each sequence still attends over its own cache. That single change raises throughput and lowers time-to-first-token simultaneously, which is why the usual latency-versus-throughput trade does not apply here.

### Q4. The PagedAttention paper reports what result, exactly? <!-- id: intern-05-serving-and-throughput-q04 energy: normal -->

- [ ] A 60–80% reduction in wasted KV cache memory, measured against a naive allocator
- [ ] A universal 4× latency reduction on all models and sequence lengths
- [x] A 2–4× throughput improvement at the same latency versus FasterTransformer and Orca
- [ ] Near-zero memory use, because blocks are shared between all requests

**Why:** The abstract states a throughput improvement of 2–4× with the same level of latency compared to the state-of-the-art systems, such as FasterTransformer and Orca. It is a range against two named baselines, not a single multiplier, and it is throughput, not latency. The memory numbers in the paper's tables are utilisation percentages, which is why the commonly repeated "60–80% wasted" inversion gets the direction backwards.

### Q5. What exactly does speculative decoding guarantee? <!-- id: intern-05-serving-and-throughput-q05 energy: high -->

- [ ] That the output tokens are identical to a non-speculative run
- [x] That the sampler draws from the target model's distribution exactly, under four stated conditions
- [ ] That the perplexity of the output is unchanged on average across a dataset
- [ ] That acceptance is guaranteed for the first draft token in every step

**Why:** Distribution-exactness is weaker than identity. Two draws from the same distribution are usually different strings, so identical output would require matching the random stream and the numerics as well. The guarantee holds only if the draft distribution is known exactly, the accept/reject/resample rule is implemented exactly, sampling is cast into the adjusted distribution consistently, and we stay within hardware numerics.

### Q6. Which statement about the "lossless" label in the Medusa paper is correct? <!-- id: intern-05-serving-and-throughput-q06 energy: normal -->

- [ ] Both Medusa-1 and Medusa-2 are claimed lossless, with different speedups
- [ ] Neither is claimed lossless; both change the backbone's distribution
- [x] Medusa-1, fine-tuned on a frozen backbone, is the one described as lossless; Medusa-2 fine-tunes the backbone for a higher speedup
- [ ] Medusa-2 is lossless because tree attention verifies all candidates in parallel

**Why:** The abstract separates the two procedures explicitly. Medusa-1 trains the extra heads on top of a frozen backbone, so the target distribution is untouched. Medusa-2 trains the backbone jointly, which raises the acceptance rate and the reported speedup to 2.3–3.6×, but changing the backbone's weights changes its distribution, so the lossless claim does not carry over.

### Q7. A serving team enables speculative decoding on a server that already runs at a very large batch size. Throughput drops. Why? <!-- id: intern-05-serving-and-throughput-q07 energy: high -->

- [ ] The draft model's KV cache evicts the target model's weights from VRAM
- [ ] Verification changes the output distribution, so results must be retried
- [ ] Large batches are memory-bandwidth bound, so speculation has no spare bandwidth to exploit
- [x] At a large batch the forward pass is compute bound, so draft and verification tokens consume arithmetic capacity that was already fully used

**Why:** Speculation converts spare compute into fewer sequential steps. It pays only when arithmetic units are idle, which is the small-batch, bandwidth-bound regime. Past the crossover a step is compute bound, so speculative tokens compete with real work rather than filling otherwise-empty units, and the extra overhead makes things worse. The draft weights also compete with KV cache for memory, which can lower the maximum batch size on top of this.

### Q8. Two providers serve the same open-weight model. Provider A has much lower time-per-output-token but the same time-to-first-token. Which difference is most consistent with that pattern? <!-- id: intern-05-serving-and-throughput-q08 energy: normal -->

- [x] A applies batch-size, quantization, or speculative-decoding differences on the decode path
- [ ] A is hosted in a datacentre closer to you, cutting network round-trip time
- [ ] A has a longer and more aggressive prompt-caching lifetime
- [ ] A runs a smaller batch size to reduce queueing

**Why:** TTFT is dominated by queueing and prefill; TPOT is the decode path. Equal TTFT rules out the queue, the prefix cache, and network distance as the main cause, because all three would move the first token. What remains is what changes per-step decode: batch operating point, weight precision, speculation, and parallelism strategy.

### Q9. Why does sharing a prefix across replicas require prefix-aware routing rather than ordinary round-robin load balancing? <!-- id: intern-05-serving-and-throughput-q09 energy: high -->

- [x] Because the cached KV blocks live in one machine's memory, so a request routed elsewhere must recompute the prefix
- [ ] Because the KV blocks are compressed and must be decompressed by the original worker
- [ ] Because round-robin cannot preserve the order in which requests arrived
- [ ] Because prefix sharing only works within a single HTTP connection

**Why:** Prefix sharing is a pointer to physical memory, not a copy of data. The blocks exist on the device that computed them, and replicas do not share memory. A request that lands on a different replica finds no matching blocks and pays full prefill again — so routing policy is part of the caching mechanism, not an optional refinement above it.

### Q10. A user reports that a streaming answer starts quickly and then slows down noticeably as it goes on. Which explanation fits best? <!-- id: intern-05-serving-and-throughput-q10 energy: normal -->

- [ ] The scheduler is switching from continuous to static batching mid-response
- [ ] Queueing delay is increasing because more users arrived during the answer
- [x] The KV cache read grows with every generated token, so each decode step reads more memory
- [ ] Speculative decoding is being disabled automatically after a fixed number of tokens

**Why:** Every decode step must read the keys and values of all previous tokens, so the memory traffic per step rises as the sequence lengthens. At long enough contexts the cache read can exceed the weight read and become the dominant term. It is a smooth, monotonic degradation tied to position in the output, which is what distinguishes it from a queueing or scheduling explanation.

## You're ready to move on when...

- You can derive the FLOPs-per-byte ratio of a decode step on a whiteboard and say what it implies about batch size.
- You can explain the straggler problem to someone who has never heard of batching, using a concrete example with numbers.
- You have simulated both static and continuous batching on the same workload and can point at the difference in your own plot.
- You can state the four conditions for speculative decoding's exactness without notes, and describe a concrete implementation that violates each one.
- You can explain in one sentence each why naive rejection sampling is not lossless, why Medusa-2 is not the lossless variant, and why greedy decoding has no guarantee.
- You can map four symptoms — slow first token, slow steady output, degrading output, low ceiling — to four different mechanisms.
- You have measured TTFT and TPOT separately for two providers of the same model and dated your notes.
- You can say which of tensor and pipeline parallelism you would reach for given a specific bottleneck, and what each costs.
- Your deliverable file exists at `portfolio/model-internals/05-serving-and-throughput.md` and includes a prediction you got wrong.

## Free vs Paid

Everything in this phase is completable for **zero pesos**.

### What is free

Python, matplotlib, and every calculation and simulation here cost nothing, and none of them need a GPU — a scheduler simulator is arithmetic and a clock. The vLLM paper is on arXiv and the engine's documentation and source are free; reading them costs only time. The speculative decoding papers and the Medusa paper are all free on arXiv, and reading the original wording of the four conditions is worth far more than any secondary summary, including this one. Hugging Face model cards and configuration files are free to browse without an account, which is all Task t01 needs. Provider status pages, pricing pages, and model listings are free to read, and a free-tier API key from any provider is enough for the two-provider latency measurement in Task t10 — you only need a handful of calls, and you can use the shortest available prompt.

### What costs money

- **A GPU.** Only needed if you want to *measure* real decoding throughput rather than simulate it. Google Colab's free tier can load a small model and let you time per-token generation, which is enough to see the batch-size curve with your own eyes. You do not need it to finish the phase.
- **Paid API access at scale.** Task t10 works on free tiers. What you cannot do for free is measure a provider's behaviour under heavy concurrency, because that requires sending real traffic and paying for it. Accept that limitation and note it in your deliverable rather than guessing.
- **A rented multi-GPU box.** Not needed and not useful here. You cannot see tensor or pipeline parallelism in action without a cluster, and the concepts are fully graspable from the descriptions and the papers. Renting hardware to "feel" parallelism is a good way to spend money and learn little.
- **A hosted inference service with published throughput guarantees.** Useful only if you are choosing a production vendor. For understanding, the free tier plus the mechanism is sufficient.

### When paying is genuinely worth it

Pay when you are about to spend real money on tokens and want to know which operating point you are buying. At that point, the cheapest useful experiment is a small paid run against two providers, measuring TTFT and TPOT separately at your real prompt length and output length. That costs cents and tells you more than any benchmark table, because it measures your workload rather than someone else's. Pay for *evidence about your own traffic*, never for the concepts — those are free and they are what this phase was for.

Phase 6 closes this track with the model landscape: who builds what, why open weights exist, and how to read a model release without being fooled by it. Everything you learned here about serving will reappear there as a question you can now answer: when a provider claims a speed advantage, you will know which layer to ask about.
