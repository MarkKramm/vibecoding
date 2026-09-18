---
id: intern-04-quantization
track: model-internals
phase: 4
order: 40
title: Quantization and Precision
duration: 1 week
duration_weeks: 1
energy_mix: "35% reading, 35% hands-on measurement, 20% writing, 10% review"
deliverable: portfolio/model-internals/04-quantization.md
exit_criteria: >
  You can explain what floating-point precision means in terms of exponent and
  mantissa bits, and why bf16 is usually preferred over fp16 for training. You
  can explain what int8 and int4 quantisation do to a weight matrix and where the
  error comes from. You can describe how GPTQ, AWQ and llama.cpp k-quants differ
  in approach, and you can say why a quantisation scheme's file size predicts its
  quality better than its label does. You can compute the memory a model needs at
  a given precision, including the KV cache, and say which of the two usually
  binds first. You can design a small evaluation that tells you whether a
  quantised model is acceptable for a specific task.
---

## Goal of this phase

You have learned what attention computes and what the KV cache costs. Now you meet the constraint that decides what you can actually run: **memory**. A model's weights have to fit in the memory you have, and at full precision most models people talk about do not fit on hardware people own.

Quantization is the set of techniques that make that fit. It is also, unfortunately, one of the most folklore-ridden corners of the field. You will meet confident claims like "Q4_K_M means four bits per weight" and "GGUF stands for GPT-Generated Unified Format". Both are wrong, and this phase shows you why — not to win an argument, but because the same reasoning that corrects them is the reasoning that lets you predict how a model will behave on your laptop.

The point of this phase is predictive power. Given a model's parameter count and a quantisation label, you will be able to *estimate* the file size before downloading it, and notice when the estimate misses. Given a task, you will be able to predict whether an aggressive quantisation will hurt it, and design a small measurement to check. Given a conversation length, you will be able to predict whether your weights or your KV cache is the thing that runs out first.

Phase 4 of the Model Internals track. The Foundations track gave you tokens, context, attention and the KV cache; this phase is where those numbers turn into a hardware budget.

## Estimated time

**1 week, roughly 8–10 hours.** A suggested split:

| Activity | Hours | Notes |
|---|---|---|
| Reading the lesson, with a pen | 3–4 | Part 3 and Part 5 are the ones people skip and need most |
| Bit-level exercises by hand | 1–2 | Paper and a calculator; no code required |
| Memory arithmetic on a real model | 1–2 | A spreadsheet is perfect for this |
| Running a quantised model locally, if your hardware allows | 2–3 | Optional — the arithmetic works without it |
| Writing your portfolio entry | 1–2 | Includes the evaluation design |

You do not need a GPU. The bit arithmetic, the memory formulas and the evaluation design are all doable on paper. Running a quantised model locally is a genuine pleasure and the best way to feel the tradeoff, but nobody should fail this phase because their laptop is old — see the Free vs Paid section at the end.

## Skills you'll gain

- Explain what a floating-point format is: sign, exponent, mantissa, and which bits buy range versus resolution.
- Compare fp32, fp16 and bf16 by bit budget, and say why bf16 is usually preferred for training.
- Explain int8 and int4 quantisation, and where the rounding error enters a weight matrix.
- Explain the difference in approach between GPTQ, AWQ and llama.cpp k-quants.
- Explain why a k-quant label is a naming convention rather than a measured bits-per-weight figure.
- Estimate a model's weight memory from parameter count and precision, and check it against a real file size.
- Estimate KV cache memory for a conversation, and say which of weights or cache binds first.
- Predict which capabilities degrade first under aggressive quantisation.
- Design a small, task-specific evaluation to decide whether a quantised model is acceptable.
- Date every volatile figure you write down, and describe what to re-check instead.

## Specific topics to learn

- Bits, bytes, and what a numeric format actually stores.
- Exponent versus mantissa: dynamic range versus resolution.
- fp32, fp16, bf16, tf32: the bit budgets and the tradeoffs.
- Floating-point special values: zero, subnormals, infinity, NaN.
- Rounding-to-nearest and the size of a quantisation error.
- Symmetric and asymmetric integer quantisation, scale and zero point.
- Per-tensor, per-channel and per-group granularity.
- Weight-only quantisation versus activation quantisation.
- Post-training quantisation versus quantisation-aware fine-tuning.
- GPTQ: layer-wise error compensation using second-order information.
- AWQ: protecting the small number of weights that matter most.
- GGUF and llama.cpp k-quants: mixed-precision blocks and metadata overhead.
- What degrades first: long-context retrieval, structured output, arithmetic, rare languages.
- Evaluation design for a quantised model.
- Weight memory versus KV cache memory as the binding constraint.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| `llama.cpp` | Run GGUF models locally and print real bits-per-weight | Free | https://github.com/ggml-org/llama.cpp | Task t04, t06 | Read the quantisation docs and the benchmark tables in-repo; no run required |
| `gguf-py` | Inspect a GGUF file's metadata and tensor types | Free | https://github.com/ggml-org/llama.cpp/tree/master/gguf-py | Task t05 | `llama.cpp`'s `gguf_dump`-style tooling, or read the spec in the repo |
| Hugging Face `transformers` | Load and compare models at different precisions | Free | https://huggingface.co/docs/transformers | Task t06, t08 | Read model cards and config files without downloading weights |
| Hugging Face Hub file listing | See real quantised file sizes before downloading | Free to browse | https://huggingface.co/models | Task t03, t05 | Any model card's "Files and versions" tab |
| Python 3 | Run the bit and memory arithmetic | Free | https://www.python.org/downloads/ | Task t01, t02, t03 | Any Python from your OS package manager |
| Google Colab | Free notebook with a small GPU for optional measurement | Freemium | https://colab.research.google.com/ | Optional extension to t06 | Your own CPU; the memory arithmetic does not need a GPU |
| `gptqmodel` or `AutoGPTQ` | See how GPTQ quantisation is actually applied | Free | https://github.com/ModelCloud/GPTQModel | Task t07 | Read the GPTQ paper and the repository README |
| `AutoAWQ` | See the AWQ implementation and its scaling search | Free | https://github.com/casper-hansen/AutoAWQ | Task t07 | Read the AWQ paper and the repository README |

## Free/cheap resources

- **GPTQ paper (arXiv)** — https://arxiv.org/abs/2210.17323
- **AWQ paper (arXiv)** — https://arxiv.org/abs/2306.00978
- **LLM.int8() paper (arXiv)** — https://arxiv.org/abs/2208.07339
- **QLoRA paper (arXiv)** — https://arxiv.org/abs/2305.14314
- **SmoothQuant paper (arXiv)** — https://arxiv.org/abs/2211.10438
- **A Survey of Quantization Methods for Efficient Neural Network Inference (arXiv)** — https://arxiv.org/abs/2103.13630
- **llama.cpp quantisation documentation and measured bits/weight tables** — https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md
- **gguf-py README (the GGUF reader/writer package)** — https://github.com/ggml-org/llama.cpp/tree/master/gguf-py
- **GGUF specification** — https://github.com/ggml-org/ggml/blob/master/docs/gguf.md
- **Hugging Face, quantization concepts guide** — https://huggingface.co/docs/transformers/main/en/quantization/overview
- **Hugging Face blog on 4-bit quantization** — https://huggingface.co/blog/4bit-transformers-bitsandbytes
- **What Every Computer Scientist Should Know About Floating-Point Arithmetic (Goldberg)** — https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html
- **Tim Dettmers, 8-bit optimizers and the case for bf16 (blog)** — https://timdettmers.com/2022/08/17/llm-int8-and-emergent-features/

## Lesson: What You Lose When You Round

Every explanation of quantisation I have read starts with the formats. Yours starts with the problem, because the formats only make sense as answers to it — and because if you understand the problem precisely, you can predict what breaks, which no list of format names will ever let you do.

### Part 1 — The problem: a weight is a continuous number, and your memory is not

A trained language model is, at bottom, a very large collection of numbers. A 7-billion-parameter model holds seven billion distinct values: the entries of its weight matrices. During training, each of those numbers is stored and updated at 32-bit precision, because gradient updates are tiny and need room to be represented at all.

Now do the arithmetic that creates the entire field.

Seven billion parameters at 32 bits each is 28 billion bytes, or 28 GB. Add the optimiser state that training requires and you can double or triple that. That number is why training is done on clusters.

But here is the thing worth pausing on: you are not training. You are *running* a model that someone else already trained. And at inference time, the weights are read and multiplied, over and over, but never updated. They do not need room to change by one part in ten thousand. They need to be *approximately right*, consistently, forever.

So the question becomes: how far can you shrink each number before the model's behaviour changes in a way you care about? That is quantisation. Everything else in this phase is machinery for answering it well.

There is a second, subtler version of the same problem that will matter enormously in Part 6. While the model generates, it also stores *activations* — chiefly the key and value tensors of the KV cache, which grow with every token in the conversation. Those numbers are being produced fresh, and they are also stored in memory at some precision. So "what precision am I running at" is not one question. It is at least two: weights, and cache. They have different answers, different costs, and different failure modes.

> **The framing to hold on to:** quantisation is lossy compression of numbers that are already only approximately meaningful. Your job is not to avoid error. Your job is to know where the error lands.

### Part 2 — The mechanism: exactly what the bits buy you

A floating-point number in the IEEE 754 style is three fields glued together:

| Field | What it stores | What it controls |
|---|---|---|
| Sign | 1 bit | Positive or negative |
| Exponent | Some bits | **Dynamic range** — how large or small the magnitude can be |
| Mantissa (significand) | Remaining bits | **Resolution** — how finely spaced the values are within a given range |

The key insight, and the one that resolves most confusion about bf16 versus fp16, is that these two budgets are **independent**. Moving bits from the mantissa to the exponent does not make the format smaller. It changes *what kind of accuracy you have*: broad strokes over a wide range, or fine strokes over a narrow one.

Here are the three formats that matter, with their actual bit budgets:

| Format | Total bits | Exponent bits | Mantissa bits | Approximate decimal digits | Notes |
|---|---|---|---|---|---|
| fp32 | 32 | 8 | 23 | ~7 | The training default and the reference |
| fp16 | 16 | 5 | 10 | ~3 | Fine resolution, narrow range |
| bf16 | 16 | 8 | 7 | ~2 | fp32's range, coarser steps |

Look hard at fp16 versus bf16. Both are 16 bits. fp16 has its 8 exponent bits cut to 5 and spends the savings on mantissa, giving it three times the resolution of bf16 but a much narrower dynamic range. bf16 gives up resolution to keep fp32's *exponent width exactly*, meaning bf16 covers the same enormous range of magnitudes that fp32 does.

Why does that make bf16 the usual choice for training? Because training is full of quantities with wild dynamic ranges: gradients that can be extremely small, activations that spike, loss values, and the accumulation of many small terms. In fp16, a gradient smaller than about 6×10⁻⁵ is not representable as a normal number — it flushes toward zero, and the update simply does not happen. If a value overflows, fp16 turns it into infinity and the training run produces NaN. The standard workaround is *loss scaling*: multiply the loss by a large constant, compute gradients in a friendlier range, then divide back out. It works, but it is a maintenance burden and it is one more thing to get wrong.

bf16 needs none of that. You can use the same hyperparameters you would use for fp32 and it behaves, because the range is the same. You pay in resolution: bf16 has 7 mantissa bits, so it distinguishes about 1 part in 128 within a given exponent bucket, where fp32 distinguishes about 1 part in 8 million. That sounds catastrophic and is not, because the *aggregate* statistics of a weight matrix are what matter, and small per-weight errors average out across the millions of multiply-accumulates in a matrix product.

> bf16 is not "less precise fp16". It is a different trade: the same range as fp32, markedly less resolution, at half the storage. Those two claims — same range, less resolution — are what you should be able to say without hesitating.

Now push the same reasoning past floating point entirely. Integers have no exponent. An 8-bit integer holds 256 distinct values; a 4-bit integer holds 16. That is a devastatingly small number of levels for a weight that might, in principle, range over several orders of magnitude.

The fix is to stop trying to represent the *absolute* value and represent a *position on a ruler* instead. Choose a scale `s` and a zero point `z`, then map:

```text
quantise:    q = round(w / s) + z          # w is the fp weight, q is the stored integer
dequantise:  w_hat = s * (q - z)           # w_hat is what the model actually uses
```

The error is `w - w_hat`, and its worst case is half a step: `s / 2`. That single expression tells you almost everything about why quantisation hurts and where.

- The error is **absolute and uniform**. Every weight gets an error of up to `s/2`, regardless of how large or small that weight was.
- A large weight therefore suffers a *relatively* small error, and a small weight suffers a *relatively* large one. When the ruler spans a wide range, `s` is large, and small weights get mangled.
- The information the original format gave you for free — different resolutions at different magnitudes — is exactly what integer quantisation throws away.

That is the engine of everything that follows. The research programmes in Part 4 are all, in one way or another, attempts to spend the 16 or 256 available levels where they will do the least damage.

Two more pieces of vocabulary and then we can predict things. First, **granularity**: you do not have to use one `s` for a whole tensor. Per-tensor means one ruler for everything; per-channel means one ruler per output channel; per-group means one ruler per small block of, say, 32 or 128 weights. Finer granularity means each ruler spans a tighter range, so `s` is smaller and the error shrinks — at the cost of storing more scales, which is the seeds of the great misconception in Part 5.

Second, **which tensors you quantise**. *Weight-only* quantisation leaves the activations in a floating-point format and only compresses the stored weights, which is the common case for local inference. *Weight-and-activation* quantisation compresses both, which is harder, because activations are data-dependent and can contain a small number of enormous outlier values that a single scale would ruin.

### Part 3 — What this lets you predict

Now the payoff. Take a model of *P* parameters. Weights at *b* bits per parameter need:

```text
weight bytes ≈ P × b / 8
```

That formula is trivial and it is genuinely powerful, because it lets you falsify labels. Here are llama.cpp's own published measurements for an eight-billion-parameter model, taken from the quantisation README in the repository — I am citing these as a dated worked example of the method, not as a fact about all models:

| Format | Measured bits/weight | Size (GiB) | Naive prediction | Verdict |
|---|---|---|---|---|
| F16 | 16.0005 | 14.96 | ~14.9 GiB | Holds up almost exactly |
| Q8_0 | 8.5008 | 7.95 | ~8.0 GiB | Slightly above nominal |
| Q4_K_M | 4.8944 | 4.58 | ~4.7 GiB | Consistently above nominal |
| Q2_K | 3.1593 | 2.95 | ~3.1 GiB | Overhead is a larger share |

Notice two things at once. First, the measured bits per weight are **always at or above the nominal number in the name** — 8.5008 for something called "Q8", 4.8944 for something called "Q4". Second, the *gap* between nominal and measured matters proportionally more as you go lower: about 0.5 bits of overhead is 6% of an 8-bit file and 22% of a 4-bit one. That is why the low-bit end of the table is where naive arithmetic fails you worst, and it is why Part 5 exists.

The 4-bit row is where the folklore dies. But notice already that you can *notice*. A label is a claim. A file size is a measurement. When they disagree by 20%, one of them is describing something other than what you assumed.

The formula also gives you the shape of the whole tradeoff, and shapes are what you want in your head rather than numbers:

| Precision | Bytes per parameter | Relative size | Typical use |
|---|---|---|---|
| fp32 | 4 | 1× | Training, evaluation reference |
| bf16 / fp16 | 2 | ½ | Serving on real hardware, fine-tuning |
| int8 | 1 | ¼ | Serving with modest quality loss |
| 4-bit | ~0.5–0.7 | ~⅛ | Local inference, tight memory |

Halving the precision halves the weights. That linear relationship is the entire reason people care, and it is why the difference between "4 bits" and "4.89 bits" — a 22% size difference — is worth thirty seconds of attention rather than none.

Then the second, less obvious prediction. During generation, the model also holds a KV cache: for every token in the conversation, for every layer, a key vector and a value vector, at some precision. From the Foundations track you have the formula:

```text
kv_bytes = 2 × layers × kv_heads × head_dim × seq_len × bytes_per_element
```

The leading 2 is for the key *and* the value. The point of writing it here is the comparison it enables. Weights are a **fixed** cost — they do not care how long your conversation is. The cache is a **variable** cost that grows with every token. So there is always a conversation length at which the cache overtakes the weights, and you can compute it:

```text
crossover_seq_len ≈ weight_bytes / (2 × layers × kv_heads × head_dim × bytes_per_element)
```

Run that with plausible numbers for a mid-sized model with grouped-query attention and you will find the crossover lands somewhere in the tens of thousands of tokens. Which means: for a short chat, weights dominate your memory budget and quantising them is what lets the model load at all; for a long-context agent session, the weights are a fixed entry fee and the cache is what actually kills you. Quantising weights does nothing about the second problem. That asymmetry is the single most useful thing in this phase, and it is the reason Part 6 exists.

Finally, the prediction that matters most for your own work. What degrades first when you cut bits aggressively? The honest answer is that it depends on the model and the scheme, and anyone who gives you a ranked list as fact is overclaiming. But the *pattern* is predictable from what quantisation error is: relative error is worst for small-magnitude weights, and the behaviours most sensitive to fine numerical detail are the ones that involve precise, low-probability discriminations. In practice, report these as expectations to test rather than laws:

- **Long-context retrieval and needle-in-a-haystack tasks**, because they depend on faint signals surviving many layers of accumulation.
- **Structured output and exact-format adherence**, because a single token flip breaks a JSON document.
- **Arithmetic and exact string manipulation**, which need deterministic token selection.
- **Low-resource languages and unusual scripts**, which already sit in low-probability regions of the token distribution.
- **Code with long-range dependencies**, where a subtly wrong symbol still looks plausible.

And what tends to survive best? Broad, high-probability behaviour: fluency, tone, summarisation, classification into coarse categories, translation of common language pairs. A 4-bit model often *sounds* almost identical to its 16-bit sibling while failing a specific long-context task more often. That gap between "sounds fine" and "is fine for my task" is why Part 7 is about measurement rather than vibes.

### Part 4 — The schemes, and what each one is betting on

There are many quantisation methods. You do not need all of them. You need the three approaches that dominate local inference, because each represents a different bet about where the error hurts most.

**GPTQ** (Frantar et al., arXiv:2210.17323) is a post-training, layer-wise method. The problem it attacks is that quantising weights one at a time is dumb: when you round weight *i*, you introduce an error, and that error propagates into the layer's output. GPTQ instead uses second-order information — an approximation of the Hessian, derived from a small calibration set of text — to decide, as it quantises weights in sequence, how to adjust the *remaining unquantised* weights to compensate for the error just introduced. It is error compensation: each rounding decision is made in light of the damage the previous ones did. The result is a weight-only quantisation scheme that works well at 4 bits and is fast enough to be practical.

**AWQ** (Lin et al., arXiv:2306.00978) starts from a different observation, stated in its own abstract: not all weights are equally important, and protecting only about **1% salient weights** can greatly reduce quantisation error. The channels that matter are identified from the *activation distribution*, not from the weight magnitudes — which is the "activation-aware" in the name. AWQ's bet is protective: find those salient channels using activation statistics from calibration data, and scale them up before quantisation so they land on the ruler with less relative error, applying an equivalent transformation so the scaling is exactly cancelled out in the unquantised parts. Note the elegance — you are not adding an approximation, you are moving where the precision lands. The paper also notes AWQ needs no backpropagation or reconstruction, which is why it generalises across domains without overfitting its calibration set.

**llama.cpp k-quants** are a different kind of thing entirely, and this is worth being precise about. GPTQ and AWQ are *algorithms* you apply to a model. The k-quants are a *file format and a family of block layouts*: the `Q4_K`, `Q5_K`, `Q6_K` and friends you see in GGUF filenames, defined by a super-block structure with per-block scales and minima, and mixed precision within the block — some sub-blocks stored at higher bit width than others. The "k" refers to the k-quant block design, not to a parameter count or a kernel. These formats are defined and benchmarked inside the llama.cpp repository.

Here is the crucial conceptual point. GPTQ and AWQ answer "how do I choose the numbers?" K-quants answer "how do I lay the numbers out in a file, and how many bits does each part get?" They are not competing answers to the same question. A GGUF file is a container; its quantisation type records a layout; and llama.cpp's own documentation publishes the *measured* bits per weight for each layout, which is where Part 5's central fact comes from.

| Scheme | Family | Core bet | Typical use |
|---|---|---|---|
| GPTQ | Algorithm | Compensate error using second-order information | 4-bit weight-only serving |
| AWQ | Algorithm | Protect salient channels via activation-aware scaling | 4-bit weight-only serving |
| llama.cpp k-quants | File format / block layout | Mixed precision in fixed-size blocks, scales included | Local CPU and GPU inference via GGUF |
| LLM.int8() | Algorithm | Handle activation outliers in a separate high-precision path | 8-bit weight-and-activation serving |

One further distinction that you will meet constantly and that is easy to conflate: **post-training quantisation (PTQ)** takes an already-trained model and compresses it, using a small calibration set to estimate scales. **Quantisation-aware training (QAT)** simulates the rounding *during* training so the model learns weights that survive it. PTQ is cheap and is what nearly all released quantised models use. QAT is more expensive and generally better at very low bit widths. QLoRA (arXiv:2305.14314) is the clever hybrid you will meet in the finetuning track: it quantises a frozen base model to 4 bits and trains small low-rank adapters on top, which means the base weights never need to be updated and therefore never need the precision that updating requires.

### Part 5 — Where it stops working: the label is not the measurement

Now the two corrections that this phase exists to make, and the reasoning that generalises past both of them.

**The label does not mean what you think.** `Q4_K_M` is often read as "4 bits per weight". It is not. In llama.cpp's own benchmark tables, `Q4_K_M` measures **4.8944 bits per weight**. The reason is structural, not a bug: a quantised file must also store the *scales*, the *minima*, the block metadata, and the higher-precision sub-blocks that the k-quant layout uses. Those bytes are real and they are per weight. At a block size of 32 or 256 with several scale values per block, plus mixed-precision sub-blocks, the effective cost per weight drifts well above the nominal number in the name.

This is not a llama.cpp wart. It is a **universal** property of block quantisation, and that is the transferable lesson. Every scheme that stores per-group scales — GPTQ with its group size, AWQ with its group size, every k-quant — has an effective bits-per-weight higher than its nominal one. The name is a *classification*, chosen for human convenience. Nobody should reason from it numerically.

So what should you reason from? **File size.** Download size, or the on-disk tensor bytes, is a measurement of the thing you actually care about. Here is the habit to build:

```text
effective_bits_per_weight ≈ file_bytes × 8 / parameter_count
```

Run that on any GGUF file and you get a real number, which you can then compare against the label. Do it once and you will never trust a quantisation label numerically again. Do it on three files and you will start to see the overhead pattern — and be able to predict a file's size before downloading it, which on a Philippine connection is not a trivial benefit.

**GGUF does not stand for what people say it does.** You will see "GPT-Generated Unified Format" repeated everywhere, including in otherwise careful write-ups. It is wrong. The official `gguf-py` README describes it as **"GGML Universal File"**, and the GGUF specification itself never expands the acronym at all. The honest statement is: GGUF is the successor to the older GGML and GGJT formats, its name is not officially expanded beyond "GGML Universal File", and any confident etymology you read online is someone's invention that got copied. This matters beyond pedantry because it is a live demonstration of the phase's real subject: **the ecosystem's folklore is confident, repeated, and wrong.** Your defence is not better memory. It is checking primary sources and measuring.

And here is where the whole approach stops working, which is the part you must not skip.

**Quantisation error is not uniform, and a single number cannot capture it.** Two files with identical measured bits-per-weight can behave completely differently, because the errors land in different places. Choosing between them requires running your task.

**The degradation is not smooth.** It is tempting to imagine quality falling by a few percent per bit removed. In practice, behaviour is often near-flat across a range and then falls off a cliff, and the cliff's location depends on the model, the scheme, and the task. Benchmarks that show an average score dropping 2% can hide a specific capability dropping 30%. Averages are exactly the wrong instrument here.

**Benchmark scores do not transfer to your task.** A model that wins on a public multiple-choice benchmark may be worse for your summarisation job. The benchmark measured a different distribution of work.

**Aggressive quantisation interacts with context length.** A model that behaves at 4 bits in a short chat may degrade much faster as context grows, because the error accumulates over more layers of attention with more items to attend to. If your task is long-context, always test at your real context length, never at a convenient short one.

**The KV cache is left out of the label entirely.** Every quantisation label describes the weights. It says nothing about the cache, which may be the thing that actually limits you. Reading a label as a complete description of a model's memory footprint is a category error.

**Very low bit widths are a different regime.** Below roughly 4 bits, methods that work fine at 4 start needing calibration quality you may not have, and QAT becomes genuinely preferable to PTQ. The methods do not degrade gracefully into the 2-bit world.

### Part 6 — The arithmetic that answers the real question

Let me make the memory reasoning concrete and reusable, because it is what you will actually do at a decision point.

The weights part:

```python
def weight_bytes(params, bits_per_weight):
    """Approximate weight memory. bits_per_weight is the EFFECTIVE figure,
    not the label — see Part 5."""
    return params * bits_per_weight / 8

# Illustrative only. Check current model cards; these change monthly.
for label, bpw in [("fp16 (nominal)", 16.0), ("Q8_0 (measured)", 8.5008), ("Q4_K_M (measured)", 4.8944)]:
    gb = weight_bytes(7_000_000_000, bpw) / 1e9
    print(f"{label:22s} ~{gb:6.35f} GB".replace("  ", " "))
```

The KV cache part, which is where people are surprised:

```python
def kv_cache_bytes(layers, kv_heads, head_dim, seq_len, bytes_per_element):
    """Key AND value, every layer, every token in the sequence."""
    return 2 * layers * kv_heads * head_dim * seq_len * bytes_per_element

# A plausible mid-size shape with grouped-query attention, bf16 cache.
per_token = 2 * 32 * 8 * 128 * 2
for seq_len in (4_096, 32_768, 131_072):
    print(seq_len, f"{per_token * seq_len / 1e9:.2f} GB")
```

Read those two functions together and the phase's practical lesson appears. The weights are a constant. The cache is a line with a slope. The slope is set by `layers × kv_heads × head_dim × bytes_per_element` — and notice that `bytes_per_element` is a precision choice you control. Halving the cache's precision halves its size, with the same class of tradeoff as weight quantisation. That is why KV cache quantisation is a real and separate technique, and why "what quant is this model" is an incomplete question: you need to ask about the weights *and* the cache, separately.

> **The predictive habit.** Before running anything, write down: weights (fixed), cache at your real context length (grows), and the sum. Then ask which term dominates. Short chat → weights. Long-context session → cache. This one habit prevents most out-of-memory surprises and most wasted downloads.

### Part 7 — Deciding whether a quantised model is acceptable

You now know that no label, benchmark, or blog post can answer this for you. Here is a small procedure that can, and that will fit in an afternoon.

**Step 1 — Define the task as a pass/fail, not a feeling.** Write down what a correct output looks like. Not "good summary" but "summary contains all four requested sections, invents no dates, and is under 150 words". If you cannot write the pass condition, you cannot evaluate the model, and no amount of compute will fix that.

**Step 2 — Build a small set of real cases.** Twenty to fifty examples from your actual work beats a thousand generic ones. Include the hard cases: the long document, the unusual format, the low-resource language if you use one, the exact-JSON requirement.

**Step 3 — Get a reference at high precision.** Run the same cases on the least-quantised version you can afford — the 16-bit model if it fits, otherwise the largest quant you can run. This is your baseline. Without it you are measuring nothing.

**Step 4 — Score both, mechanically.** For structured output, parse it. For extraction, compare fields. For free text, you can use an LLM judge — see the LLM-as-judge paper, arXiv:2306.05685 — but understand its limits: it has known position and verbosity biases, and it is itself a model that may be quantised. For a twenty-case set, your own eyes are honestly competitive and free.

**Step 5 — Run the cheap reference check first.** One famous trick: ask both models to repeat a fixed string, or answer a question about a paragraph you paste in. A quantised model that cannot reproduce a long passage verbatim, or that answers a question about text clearly present in its context, has failed before you write a single rubric. This is the fastest useful signal in the whole procedure.

**Step 6 — Test at your real context length.** Not 4k because it is fast. Your actual length, with your actual prompt structure.

**Step 7 — Decide, and record what you decided and when.** A dated note saying "Q4_K_M was acceptable for extraction, failed 3 of 20 on JSON schema; Q6 was clean; As of 2026-09" is worth more than any general opinion about quantisation, because it is a measurement rather than a belief.

The stopping rule: if the quantised model passes your cases at the precision you can afford, use it and stop optimising. If it does not, step up one precision level and try again, because the answer is usually the next quant up rather than a different model.

```text
Decision loop, in order:
  1. Does the smallest quant pass my 20–50 cases at my real context length?
     yes → use it. Stop.
  2. Does the next quant up pass?
     yes → use it if it still fits. Stop.
  3. Does the 16-bit model pass?
     no  → the problem is the MODEL, not the quantisation. Change model.
     yes → you need more memory, or a smaller model, or a shorter context.
```

That loop is the whole phase in seven lines. Notice that it produces a *decision*, not an opinion, and that it names "the model is the problem" as a possible outcome — which one-number benchmark comparisons never do.

## Hands-on practice tasks

1. Compute by hand the byte size of a sign field, an 8-bit exponent field and a 10-bit mantissa field, then write out the fp32, fp16 and bf16 bit budgets in a table and state in one sentence what each format gives up. <!-- id: intern-04-quantization-t01 band: quick energy: low -->
2. Find the smallest positive *normal* fp16 number and the smallest positive *normal* bf16 number from their exponent widths, and explain in two sentences why training gradients are more likely to vanish in fp16. <!-- id: intern-04-quantization-t02 band: focused energy: normal -->
3. Pick any quantised model on Hugging Face, read its actual file sizes from the "Files and versions" tab, and compute the effective bits per weight from file size and parameter count. Compare that to the quantisation label. <!-- id: intern-04-quantization-t03 band: focused energy: normal -->
4. Open llama.cpp's quantisation documentation and find its own measured bits-per-weight table. Record the `Q4_K_M` figure and explain in your own words where the extra bits beyond 4 come from. <!-- id: intern-04-quantization-t04 band: quick energy: low -->
5. Inspect a GGUF file's metadata with the `gguf-py` tooling or the repository spec, and list every field that is not a quantised weight tensor. That list is your explanation of the overhead. <!-- id: intern-04-quantization-t05 band: focused energy: normal -->
6. Run the same three prompts — one factual, one requiring exact JSON, one requiring verbatim reproduction of a pasted paragraph — against the largest and smallest quantisation you can run, and write down where they diverge. <!-- id: intern-04-quantization-t06 band: deep energy: high -->
7. Read the GPTQ and AWQ abstracts and write one paragraph each, in your own words, on what each method is betting about where quantisation error matters most. <!-- id: intern-04-quantization-t07 band: focused energy: normal -->
8. Build a memory budget spreadsheet: parameter count, effective bits per weight, layers, KV heads, head dimension, and your target context length. Compute weights, cache, and total, and state which term binds. <!-- id: intern-04-quantization-t08 band: deep energy: high -->
9. Write a 20-case evaluation set from your own real work, define the pass condition for each case in writing before you run anything, and score a quantised model against them. <!-- id: intern-04-quantization-t09 band: deep energy: high -->
10. Design and run one experiment that separates weight quantisation from KV cache quantisation: hold the weights fixed and vary only the cache precision, then describe what changed. <!-- id: intern-04-quantization-t10 band: deep energy: high -->
11. Keep a dated log of every number you wrote down in this phase that could change — model sizes, benchmark figures, supported formats — and note what you would re-check rather than what you would remember. <!-- id: intern-04-quantization-t11 band: ongoing energy: low -->

## Common Pitfalls

- **Reading a quantisation label as a measurement.** `Q4_K_M` measured 4.8944 bits per weight in llama.cpp's own benchmarks. Always compute effective bits from file size and parameter count.
- **Repeating the "GPT-Generated Unified Format" expansion.** The official `gguf-py` README says "GGML Universal File", and the specification never expands the acronym. Check the primary source.
- **Assuming the weights are your memory problem.** For any conversation of real length, the KV cache may dominate. Compute both before deciding what to quantise.
- **Trusting an aggregate benchmark score.** A 2% average drop can hide a 30% drop on the one capability your task depends on. Test your task.
- **Testing at a short context because it is fast.** Quantisation degradation often grows with context length. Test at the length you will actually use.
- **Comparing two quantised models with no high-precision baseline.** Without the 16-bit reference you cannot attribute a difference to quantisation at all.
- **Assuming quality falls smoothly with bits.** Behaviour is frequently near-flat and then falls off a cliff, and the cliff's location is model- and task-specific.
- **Confusing GPTQ and AWQ with GGUF.** The first two are algorithms that choose numbers; GGUF is a container format and the k-quants are block layouts. They answer different questions.
- **Thinking bf16 is "worse fp16".** It has fp32's range and less resolution. That is a deliberate trade, not a defect.
- **Hardcoding any model size, price, or context limit as fact.** This landscape changes monthly. Date every figure you write down.

## Deliverable / proof of work

Write `portfolio/model-internals/04-quantization.md` containing:

1. **The bit budget table, in your own words.** fp32, fp16 and bf16 with exponent and mantissa widths, plus one sentence each on what that format gives up. Do not copy mine.
2. **A worked quantisation error example.** Take eight small invented weight values, choose a scale, quantise and dequantise them by hand, and show the error for each. Then state which weight suffered the worst *relative* error and why.
3. **A label-versus-measurement table.** At least four quantisation types from one real quantised model family, with nominal bits, measured file size, computed effective bits per weight, and the percentage overhead. Include the `Q4_K_M` row.
4. **A memory budget table.** One model, at least three context lengths, weights column, KV cache column, total, and a sentence naming the crossover length where the cache overtakes the weights.
5. **The evaluation design.** Your pass condition writing, your case list or a representative excerpt, the baseline you chose, and your results table.
6. **A dated volatility note.** Every number you recorded that could change, with the date you checked it and what you would re-check rather than remember.
7. **A prediction you got wrong.** One thing in this phase that contradicted what you expected, and what the mechanism actually implies. Include it even if it is three sentences; it is the most valuable section.

## Checklist

- [ ] I can name the three fields of a floating-point number and say what each one controls <!-- id: intern-04-quantization-c01 energy: low -->
- [ ] I can state the exponent and mantissa widths of fp32, fp16 and bf16 from memory <!-- id: intern-04-quantization-c02 energy: normal -->
- [ ] I can explain why bf16 is usually preferred over fp16 for training, in terms of range rather than precision <!-- id: intern-04-quantization-c03 energy: normal -->
- [ ] I can explain what loss scaling is and why bf16 does not need it <!-- id: intern-04-quantization-c04 energy: normal -->
- [ ] I can write the quantise and dequantise equations and say why the worst-case error is half a step <!-- id: intern-04-quantization-c05 energy: normal -->
- [ ] I can explain why small weights suffer worse relative error than large ones <!-- id: intern-04-quantization-c06 energy: normal -->
- [ ] I can explain the difference between per-tensor, per-channel and per-group granularity <!-- id: intern-04-quantization-c07 energy: normal -->
- [ ] I can describe GPTQ's error-compensation idea and AWQ's salient-channel idea without confusing them <!-- id: intern-04-quantization-c08 energy: normal -->
- [ ] I can explain why GPTQ and AWQ are algorithms while k-quants are a file layout <!-- id: intern-04-quantization-c09 energy: normal -->
- [ ] I can state, unprompted, that `Q4_K_M` measures 4.8944 bits per weight in llama.cpp's benchmarks, and why <!-- id: intern-04-quantization-c10 energy: normal -->
- [ ] I can compute effective bits per weight from a file size and a parameter count <!-- id: intern-04-quantization-c11 energy: normal -->
- [ ] I can state what GGUF's official README calls it, and that the spec never expands the acronym <!-- id: intern-04-quantization-c12 energy: low -->
- [ ] I can estimate weight memory for a given parameter count and precision <!-- id: intern-04-quantization-c13 energy: normal -->
- [ ] I can write the KV cache memory formula and say which term precision affects <!-- id: intern-04-quantization-c14 energy: normal -->
- [ ] I can compute the conversation length at which the KV cache overtakes the weights in memory <!-- id: intern-04-quantization-c15 energy: high -->
- [ ] I can list the task types most likely to degrade first under aggressive quantisation, and say that these are expectations to test <!-- id: intern-04-quantization-c16 energy: normal -->
- [ ] I have designed a task-specific evaluation with a written pass condition and a high-precision baseline <!-- id: intern-04-quantization-c17 energy: high -->
- [ ] I have dated every volatile figure in my deliverable and said what to re-check <!-- id: intern-04-quantization-c18 energy: low -->

## Quiz

### Q1. In a floating-point format, what does the exponent field control? <!-- id: intern-04-quantization-q01 energy: normal -->

- [x] The dynamic range — how large or small a magnitude the format can represent
- [ ] The resolution — how finely spaced values are within a range
- [ ] The sign of the stored value
- [ ] The number of decimal digits printed by default

**Why:** The exponent sets the scale of the number, which is why bf16 keeps fp32's 8 exponent bits and gets fp32's enormous range. The mantissa is what controls resolution. Keeping these two budgets separate is what makes the bf16-versus-fp16 comparison legible instead of confusing.

### Q2. A weight matrix has one very large value and many values a thousand times smaller. Under symmetric integer quantisation with a single per-tensor scale, which values suffer the worst relative error? <!-- id: intern-04-quantization-q02 energy: high -->

- [ ] The largest value, because it dominates the sum
- [ ] All values equally, since the absolute error is constant
- [x] The smallest values, because the absolute error is roughly constant while their own magnitude is tiny
- [ ] None; relative error is independent of the scale chosen

**Why:** The quantisation step is `s`, and the worst-case absolute error is `s/2` for every weight. Since `s` must be large enough to span the largest magnitude, small weights get the same absolute error against a much smaller denominator — a large relative error. That is precisely the damage AWQ's activation-aware scaling is designed to reduce.

### Q3. Why is bf16 usually preferred over fp16 for training large models? <!-- id: intern-04-quantization-q03 energy: high -->

- [ ] bf16 has a wider mantissa, so it represents values more precisely
- [ ] bf16 uses fewer bits in total, so training is faster
- [ ] bf16 is supported on more hardware than fp16
- [x] bf16 keeps fp32's exponent width, so it has the same dynamic range and does not need loss scaling

**Why:** The mantissa claim is backwards: bf16 has 7 mantissa bits against fp16's 10, so it is *less* precise. Both are 16 bits in total. What bf16 buys is range, which removes the gradient underflow and overflow failures that force fp16 training to use loss scaling.

### Q4. A GGUF file named for a 4-bit k-quant measures 4.8944 bits per weight in llama.cpp's benchmarks. Where does the extra roughly 0.9 bits per weight come from? <!-- id: intern-04-quantization-q04 energy: high -->

- [ ] The file is stored uncompressed and includes padding for alignment
- [ ] The parameter count in the model card is understated
- [x] Scales, minima, and other block metadata are stored alongside the weights and count toward the file size
- [ ] The benchmark measured a different model

**Why:** Block quantisation cannot avoid storing the per-block scales and related metadata that make dequantisation possible. Those bytes are real and are counted per weight. This overhead is universal across block schemes — GPTQ and AWQ with group sizes have it too — which is why a quantisation label is a classification and never a measurement.

### Q5. What is the core idea behind AWQ? <!-- id: intern-04-quantization-q05 energy: normal -->

- [ ] Quantise weights one at a time and adjust later weights to compensate for each error
- [x] Use activation statistics to find the small set of salient channels and scale them so they quantise with less relative error
- [ ] Store a separate high-precision path for activation outliers
- [ ] Train the model with simulated rounding so it becomes robust to quantisation

**Why:** AWQ's bet is that a small fraction of channels matter disproportionately, identified by the magnitude of the activations flowing through them. The scaling is applied so it cancels out in the unquantised parts, moving where precision lands rather than adding an approximation. The error-compensation description belongs to GPTQ, and the outlier-path description belongs to LLM.int8().

### Q6. You need a model to serve a long-context agent session of roughly 100,000 tokens. Your weights fit comfortably at 4-bit. What should you check before assuming you are fine? <!-- id: intern-04-quantization-q06 energy: high -->

- [ ] Whether the 4-bit file's label says four bits per weight
- [x] The KV cache size at that context length, because it grows with tokens while the weights do not
- [ ] Whether the model was trained on 4-bit weights
- [ ] Whether a smaller model exists at 8-bit

**Why:** Weight memory is a fixed cost, but cache memory is `2 × layers × kv_heads × head_dim × seq_len × bytes_per_element` and scales linearly with sequence length. At very long contexts the cache routinely exceeds the weights. Quantising the weights does nothing about this, which is why cache precision is a separate decision.

### Q7. What is the fundamental difference between GPTQ or AWQ on one hand, and llama.cpp's k-quants on the other? <!-- id: intern-04-quantization-q07 energy: normal -->

- [ ] GPTQ and AWQ are for GPUs; k-quants are for CPUs only
- [ ] GPTQ and AWQ are lossless; k-quants are lossy
- [ ] GPTQ and AWQ quantise activations; k-quants quantise weights
- [x] GPTQ and AWQ are algorithms for choosing values; k-quants are a block layout and file format

**Why:** They answer different questions. The algorithms decide which numbers to store given a bit budget, using calibration data. The k-quants define how bytes are arranged in a GGUF file — super-blocks, per-block scales and minima, and mixed sub-block precision. Neither is lossless, and both are used on both CPUs and GPUs.

### Q8. Which practice gives the most reliable answer to "is this quantised model good enough for my task"? <!-- id: intern-04-quantization-q08 energy: high -->

- [x] Running your own cases at your real context length against a high-precision baseline, with a written pass condition
- [ ] Comparing aggregate benchmark scores between the quantised and original model
- [ ] Choosing the quantisation whose label matches your available memory
- [ ] Asking the model whether it feels degraded at this precision

**Why:** Aggregate scores hide capability-specific cliffs, labels are classifications rather than measurements, and self-report tells you nothing about capability. A small set of real cases with a defined pass condition and a high-precision reference is the only method that produces a decision about your task rather than an opinion about quantisation in general.

### Q9. Which statement about quantisation degradation is most accurate? <!-- id: intern-04-quantization-q09 energy: normal -->

- [ ] Quality falls by a predictable few percent for each bit removed
- [x] Behaviour is often near-flat across a range and then falls off a cliff whose location depends on model, scheme and task
- [ ] Degradation is identical across all tasks for a given bit width
- [ ] Degradation affects only very large models

**Why:** The error is not uniformly distributed across weights or across capabilities, so a single "percentage per bit" model is wrong. This is exactly why a small task-specific evaluation beats an aggregate benchmark: averages smooth over the cliffs that decide whether your use case works.

### Q10. What does the official `gguf-py` README say GGUF stands for? <!-- id: intern-04-quantization-q10 energy: low -->

- [ ] GPT-Generated Unified Format
- [ ] General GPU Unified Format
- [ ] GGML Unified Format
- [x] GGML Universal File

**Why:** The README describes it as "GGML Universal File", and the GGUF specification never expands the acronym at all. "GPT-Generated Unified Format" is widely repeated and appears in no primary source. This is the phase's folklore lesson in miniature: check the primary source rather than the most confident write-up.

### Q11. What does quantising only the weights leave untouched? <!-- id: intern-04-quantization-q11 energy: normal -->

- [x] The precision of the activations and the KV cache, which are separate storage decisions
- [ ] The model's output distribution, since weights determine everything
- [ ] Nothing; weight quantisation determines total memory use
- [ ] The number of layers, which must also be reduced

**Why:** Weight-only quantisation — the most common scheme for local inference — compresses the stored weights while activations and the cache remain in a floating-point format unless you separately quantise them. Total memory is weights plus cache plus overhead, and each term is a separate choice.

### Q12. When does post-training quantisation start to be a poor choice relative to quantisation-aware training? <!-- id: intern-04-quantization-q12 energy: normal -->

- [ ] Never; PTQ is always preferable because it is cheaper
- [ ] Only when the model has fewer than one billion parameters
- [ ] Only when the calibration set is smaller than a thousand examples
- [x] At very low bit widths, where requiring the weights to survive rounding during training becomes worth the extra cost

**Why:** PTQ is cheap and is what nearly all released quantised models use, so it is the right default. As bit width drops toward and below roughly 4 bits, the rounding becomes severe enough that adapting the weights to it during training produces meaningfully better results, which is the trade QAT makes.

## You're ready to move on when...

- You can write the fp32, fp16 and bf16 bit budgets from memory and say what each format trades away.
- You can explain quantisation error as an absolute half-step error and derive from that why small weights suffer most.
- You can describe GPTQ, AWQ and k-quants as answers to different questions, not as competitors.
- You can state the measured bits-per-weight for `Q4_K_M` and explain the overhead structurally rather than as a quirk.
- You can say what GGUF's official README calls it, and name what you would check instead of trusting a confident online expansion.
- You have computed effective bits per weight from a real file size and compared it to the label.
- You can estimate weight memory and KV cache memory for a real model at a real context length, and say which one binds.
- You can list the task types most likely to degrade first — and you say so as an expectation to test rather than a rule you read.
- You have run a small evaluation with a written pass condition and a high-precision baseline, and it produced a decision.
- Every volatile number in your deliverable is dated, with a note on what to re-check.
- Your deliverable exists at `portfolio/model-internals/04-quantization.md` and includes a prediction you got wrong.

## Free vs Paid

Everything in this phase can be completed for **zero pesos**.

**What is genuinely free.** Python, and any spreadsheet, will carry the entire bit and memory arithmetic. The GPTQ, AWQ, LLM.int8(), SmoothQuant and QLoRA papers are free on arXiv. llama.cpp is open source, and its quantisation documentation and measured bits-per-weight tables are in the repository — which means the central factual correction of this phase is verifiable by you, for free, from the primary source. The `gguf-py` README and the GGUF specification are likewise free, and reading them takes five minutes and settles the acronym question permanently. Hugging Face lets you browse a model's file listing and read real file sizes without downloading anything, which is all Task t03 needs. If you own any computer, you can finish this phase completely.

**What costs money, and whether you need it.**

- **Enough RAM or VRAM to actually run a quantised model.** This is the one genuinely useful thing money buys, and it is optional. The measurement tasks are much more satisfying when you run them yourself, but every prediction in this phase is derivable from paper arithmetic and published file sizes. If your machine cannot run a model, do the arithmetic and read someone else's measurements, and say so in your deliverable — that is honest work, not a shortcut.
- **Cloud GPU rental.** Only worth it if you want to run a model larger than your hardware allows. Free notebook tiers with small GPUs exist and change frequently; check what is currently offered rather than trusting any figure written down here. Do not rent a GPU to "understand quantisation" — the understanding is in Parts 2 and 5, which need no hardware.
- **A paid course on quantisation.** As of 2026-09, the free resources above are better than most paid treatments, for a simple reason: the primary sources are public, and the field moves fast enough that any fixed curriculum is dated on arrival. Pay for structure if you want structure. Do not pay for the content.
- **A faster internet connection.** Worth naming honestly. Downloading several quantised models to compare them is the most bandwidth-hungry part of this phase, and on a metered or slow connection it is a real cost. The fix is free: read the "Files and versions" tab, take the file sizes, and do your comparison arithmetically. You can learn everything here without downloading a single gigabyte.

**The honest budget:** ₱0, roughly 8–10 hours over one week, a spreadsheet, and a browser. If you have a laptop with a few gigabytes of free memory, you can also *feel* the tradeoff by running a small quantised model — and that is the nicest version of this phase. But the reasoning, the corrections, and the memory arithmetic that make you able to predict behaviour are all free, and they are all in the pages above.
