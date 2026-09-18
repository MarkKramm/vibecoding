---
id: intern-02-transformer-architecture
track: model-internals
phase: 2
order: 20
title: Transformer Architecture in Detail
duration: 2 weeks
duration_weeks: 2
energy_mix: "35% reading, 35% hands-on calculation and config reading, 20% writing, 10% review"
deliverable: portfolio/model-internals/02-transformer-architecture.md
exit_criteria: >
  You can draw one transformer block from memory — attention, MLP, the two
  normalisations, and the two residual adds — and say what each piece
  contributes. You can read a real model's config.json and use it to predict
  parameter counts, FFN width ratios, positional-encoding behaviour, and MoE
  memory versus compute. You can explain why attention is quadratic in sequence
  length while the MLP is linear, and name the regime where that stops being the
  bottleneck. You can state honestly what rope_theta is, what values real models
  actually use, and why no architecture number here should be memorised.
---

# Phase 2 — Transformer Architecture in Detail

## Goal of this phase

By the end of this phase you will be able to open a model's `config.json`, read eight or nine numbers out of it, and say something true and non-obvious about how that model will behave: how many of its parameters sit in the feed-forward blocks, how its memory will scale, whether it will need one GPU or eight, how gracefully it will handle a long input, and whether it is really the size its name claims.

That is a different skill from the one Foundations gave you. Foundations taught you what attention computes and why the KV cache exists — the shape of the machine and the cost of running it. This phase teaches you how the machine is *assembled*: how attention, the feed-forward block, the normalisations and the residual connections compose across depth, why the residual stream is the right mental model for the whole thing, and what changes when you swap a dense feed-forward block for a set of experts that are only sometimes used.

The reward is predictive. Right now, "a 70B model" is a name. In two weeks it will be a set of arithmetic you can run in your head.

## Estimated time

**2 weeks, roughly 8–12 hours per week.** A suggested split:

| Activity | Hours/week | Notes |
|---|---|---|
| Reading the lesson, with a pen and a calculator | 3–4 | Parts 2, 3 and 6 carry the load |
| Building and parameter-counting a block in NumPy | 2–3 | Any laptop; nothing here needs a GPU |
| Reading two real `config.json` files end to end | 2 | This is where the phase pays off |
| Writing your portfolio entry | 1–2 | Week 2 only |

If you have less time, protect Part 2 (the residual stream), Part 3 (the MLP) and Part 6 (MoE). Those three carry most of the predictive power. Part 5 on positional encoding is shorter and can be compressed, but the rope_theta section in it is a correction you should not skip, because it is repeated wrongly almost everywhere.

You do not need a GPU, a paid API key, or an account anywhere to finish this phase. Python, NumPy, `curl` and free web pages are enough.

## Skills you'll gain

- Draw a pre-norm transformer block from memory and name what each sub-layer contributes
- Explain the residual stream as a shared channel that every sub-layer reads from and adds to
- Explain why pre-norm replaced post-norm without claiming pre-norm is universally "better"
- Explain why the feed-forward block holds most of a dense model's parameters, and compute the split from a config
- Explain multi-head attention's division of labour, and why a head is not a designed specialist
- Explain scaling by `sqrt(d_k)` — the key dimension — and compute what breaks without it
- Derive why attention is O(n²) in sequence length while the MLP is O(n), and name the crossover regime
- Compare sinusoidal, learned, RoPE and ALiBi position handling, and say what each can and cannot do
- State what `rope_theta` actually is and give real verified values, correctly dated
- Read a Mixture-of-Experts config and compute total parameters, active parameters and serving memory separately
- Date every volatile architecture number and say what to check instead of memorising

## Specific topics to learn

### The block, drawn

- The residual stream as the model's shared working channel
- The two sub-layers: attention and the feed-forward network (MLP)
- Where the normalisations sit, and what "pre-norm" and "post-norm" mean concretely
- RMSNorm, and why it replaced LayerNorm in many models
- Reading a real block from a `transformers` implementation

### The feed-forward block

- The original two-matrix MLP and the modern gated variants (SwiGLU and relatives)
- `d_ff ≈ 4 × d_model` as a convention, not a law
- Why the MLP is position-wise and holds most of the parameters
- What the MLP being the parameter-dense part implies about MoE

### Attention in depth

- Multi-head attention as a division of labour, and the limits of that story
- `sqrt(d_k)` scaling, stated correctly
- Why attention is O(n²) and the MLP is O(n)
- What the difference implies for long-context serving

### Position

- Sinusoidal encodings: additive, fixed, weak extrapolation
- Learned position tables: simple, bounded by the training length
- RoPE: rotation, relative position, and what it does not tell you
- `rope_theta` as a Hugging Face / vLLM configuration convention, not a RoPE-paper fact
- Real verified values across model families, and the false claim that all models use one value
- Context extension (YaRN), and ALiBi as the extrapolation-first alternative

### Mixture-of-Experts

- Sparse activation and top-k routing
- Why total parameters and active parameters are different numbers answering different questions
- Why "8×7B" does not equal 56B
- Memory implications: all experts resident, few active

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Python 3 | Run the parameter arithmetic and the config reader | Free | https://www.python.org/downloads/ | t01, t02, t05 | Any Python from your OS package manager |
| NumPy | Build a transformer block from arrays, no framework | Free | https://numpy.org/install/ | t01, t03 | Pure Python lists, slowly |
| `transformers` (Hugging Face) | Print a real block's source with `inspect.getsource` | Free/open-source | https://huggingface.co/docs/transformers/installation | t04 | Read the same files on GitHub in a browser |
| Hugging Face model hub | Download `config.json` files — the best free primary source for architecture | Free to browse | https://huggingface.co/models | t05, t06, t08 | Any model release report or paper page |
| Ollama | Pull a small open-weight model and inspect its architecture metadata | Free/open-source | https://ollama.com/ | t06 | llama.cpp directly, or just read configs |
| Google Colab | Free notebook with a small GPU, if you want to load a tiny model | Freemium | https://colab.research.google.com/ | Optional extension to t04 | Your laptop CPU with NumPy; the configs are the real data |
| A text editor and a terminal | Read `config.json`, run scripts, keep dated notes | Free | https://code.visualstudio.com/ | Every task | Notepad and PowerShell; both are already on your machine |
| VS Code | Edit and run the small scripts in this phase | Free/open-source | https://code.visualstudio.com/ | t01–t08 | Any editor you already have |

## Free/cheap resources

- **Attention Is All You Need (Vaswani et al., 2017)** — https://arxiv.org/abs/1706.03762
- **The Illustrated Transformer (Jay Alammar)** — https://jalammar.github.io/illustrated-transformer/
- **The Annotated Transformer (Harvard NLP)** — https://nlp.seas.harvard.edu/annotated-transformer/
- **Andrej Karpathy — Let's build GPT from scratch** — https://www.youtube.com/watch?v=kCc8FmEb1nY
- **Andrej Karpathy — nanoGPT** — https://github.com/karpathy/nanoGPT
- **3Blue1Brown — Attention in transformers, step by step** — https://www.youtube.com/watch?v=eMlx5fFNoYc
- **Hugging Face LLM course** — https://huggingface.co/learn/llm-course
- **EleutherAI — Transformer Math 101** — https://blog.eleuther.ai/transformer-math/
- **Brendan Bycroft — LLM Visualisation (the whole forward pass, in the browser)** — https://bbycroft.net/llm
- **RoFormer / RoPE (Su et al., 2021)** — https://arxiv.org/abs/2104.09864
- **Train Short, Test Long (ALiBi, Press et al., 2021)** — https://arxiv.org/abs/2108.12409
- **YaRN: Efficient Context Window Extension (Peng et al., 2023)** — https://arxiv.org/abs/2309.00071
- **Outrageously Large Neural Networks (sparsely-gated MoE, Shazeer et al., 2017)** — https://arxiv.org/abs/1701.06538
- **Switch Transformers (Fedus et al., 2021)** — https://arxiv.org/abs/2101.03961
- **Mixtral of Experts (2024)** — https://arxiv.org/abs/2401.04088
- **Efficient Memory Management for LLM Serving with PagedAttention (vLLM, SOSP 2023)** — https://arxiv.org/abs/2309.06180
- **Hugging Face Transformers documentation** — https://huggingface.co/docs/transformers
- **llama.cpp (open-source local inference)** — https://github.com/ggml-org/llama.cpp

## Lesson: The Block, the Stream, and the Experts

Foundations showed you what attention computes: scaled dot products, a softmax, a weighted average of values. That was the right first pass, and it leaves one enormous question unanswered. A real model does not have *an* attention operation. It has sixty-odd layers, each containing attention plus a small neural network, wired together in a specific way. **Almost everything that makes a deep model behave differently from a shallow one lives in that wiring, not in the attention arithmetic.**

So this phase is about composition, built the same way each time: what breaks without this piece, what the piece actually is, what it lets you predict, and where it stops working. That last step is what most architecture writing skips, and it is what produces judgement rather than a diagram you can redraw but not use.

### Part 1 — The residual stream, or: what a layer is actually adding

Start with the failure that makes the whole design necessary. Suppose you stacked attention blocks naively: the output of block 1 is the input of block 2, and so on for sixty blocks. Training works by asking "if I nudge this weight, how much does the loss change?" and pushing the weight in the helpful direction. In a long chain of transformations that signal is multiplied by a Jacobian at every step, and sixty multiplications of numbers typically smaller than one leaves something vanishingly small by the time it reaches layer 2. **The early layers barely learn, and the model does not train.** That is the vanishing-gradient problem, and it is structural, not a tuning issue.

The fix is the single most important architectural idea in the whole transformer:

```text
x = x + sublayer(x)
```

Each sub-layer does not *replace* its input. It computes something and **adds** it back. In the 2017 paper this is a plain residual connection around each sub-layer, and it works because the "identity path" — the `+ x` — has a derivative of exactly 1 with respect to `x`. That gives gradient a highway from the loss back to layer 2 through sixty additions rather than sixty learned multiplications.

Now the mental model, which is worth more than the mechanics.

> **The residual stream.** Think of a single vector of width `d_model` running from a token's embedding all the way to the final layer. Every sub-layer *reads* from this stream, computes something, and *writes its result back by addition*. Attention writes "information gathered from other tokens"; the MLP writes "a per-token transformation of what is already there". Nothing overwrites the stream. Information accumulates.
>
> This is not a metaphor I invented — it is how interpretability researchers describe the architecture, and it is load-bearing because it predicts real behaviour. Because writes are additive, the stream has a *capacity*: a finite width shared by everything every layer wants to say. It also predicts that a layer's contribution is a small perturbation on a large accumulated state, which is why **removing one layer from a deep model often degrades output mildly rather than destroying it**, and why ablating one attention head frequently changes nothing at all.

The stream also explains the shape of the rest of the block: if it is `d_model` wide, everything that writes into it must produce a `d_model`-wide vector.

```text
# Pre-norm transformer block (decoder-only), shapes annotated
x = x + attention(norm1(x))     # x: [n_tokens, d_model]
x = x + mlp(norm2(x))           # same shape in, same shape out
```

Two lines. Every large language model you have used is a stack of sixty-odd copies of those two, with different weights, plus an embedding at the bottom and an output projection at the top.

**Where the normalisation sits is not cosmetic.** The 2017 paper put it *after* the addition (`x = LayerNorm(x + sublayer(x))`, post-norm). Most modern decoder-only models put it *before* the sub-layer, on the branch (`x = x + sublayer(LayerNorm(x))`, pre-norm). The difference is where the identity path runs: in post-norm the residual add is *inside* the normalisation, so the clean `+1` derivative highway does not exist. In pre-norm the addition is untouched and the normalisation affects only the branch computing the new contribution.

**What this lets you predict.** Pre-norm models train stably at depths where post-norm models need careful learning-rate warmup, which is why essentially every decoder-only model of recent years uses a pre-norm variant. It also predicts a real quirk: in a pre-norm model the residual stream's magnitude *grows* with depth, because each layer adds to a stream that is never renormalised — which is why a final normalisation sits before the output projection. The other modern change is the normaliser itself: many models replace LayerNorm with **RMSNorm**, which rescales by the root-mean-square of the activations and skips mean-centring. It is cheaper and works about as well.

**Where it stops working.** Two honest limits. First, the identity path does not make a network infinitely deep: the accumulated residual state grows, sub-layer contributions must stay small relative to it, and at some depth more layers stop buying capability — an empirical question answered by training runs, not an equation. Second, RMSNorm is not consequence-free: by removing the mean it discards the component of the activation along the all-ones direction, a trade that was measured and accepted rather than proven harmless.

Finally, resist saying pre-norm is simply *better*. It is better for the property people care about — training deep stacks without babysitting the learning rate. Post-norm was not a mistake; it was the original formulation, and variants of it are still studied. **Architecture choices like this are bundles of tradeoffs settled by experiment, and "everyone does X" is evidence about training stability and engineering cost, not proof that X is optimal.**

### Part 2 — The feed-forward block, or: where the parameters actually live

Here is a fact that surprises almost everyone: **in a dense transformer, most of the parameters are not in attention.** They are in the small neural network that runs after it, once per layer, independently on every token.

In the original paper the feed-forward network is two linear layers with a ReLU between them (`FFN(x) = max(0, x @ W1 + b1) @ W2 + b2`), with `d_ff = 2048` against `d_model = 512` — a ratio of 4. That ratio, `d_ff ≈ 4 × d_model`, became a convention most dense models still roughly follow, though it is a convention and not a law, and gated variants change the arithmetic.

The modern form is a **gated** MLP: project up twice — one copy through an activation function, one unchanged — multiply them elementwise, then project back down:

```text
# Gated MLP, as used by most modern open-weight models
# h is typically around 8/3 * d_model rather than 4 * d_model,
# because the gate adds a third matrix. Check the config.
gate = silu(x @ W_gate)     # [n_tokens, d_ff]
up   = x @ W_up             # [n_tokens, d_ff]
h    = gate * up            # elementwise product
out  = h @ W_down           # [n_tokens, d_model]
```

SwiGLU is the best-known instance. The structural point is not which activation is used — it is that **the MLP is where the model spends its parameter budget.** Run the arithmetic for a plain two-matrix MLP:

```text
params per MLP  = 2 * d_model * d_ff
params per attention block = 4 * d_model^2   (W_Q, W_K, W_V, W_O, ignoring biases and GQA)
```

With `d_ff = 4 * d_model`, those are `8 * d_model^2` versus `4 * d_model^2`: the MLP holds about twice what attention holds, so roughly two-thirds of the weights in each layer sit in the MLP. With grouped-query attention shrinking the K and V projections the MLP share is even higher. That two-thirds figure is a *consequence of the ratio*, not a universal constant — change `d_ff` and the split changes. **Read the config and compute it rather than quoting a percentage.**

**Why does the model want that much capacity there?** Attention moves information *between* positions; the MLP transforms information *at* a position. Attention is constrained by the softmax to produce a convex combination of value vectors. The MLP has no such constraint — it is a free per-token function approximator, and stacking many of them is what lets the network compute things not expressible as a weighted average.

**What this lets you predict.** Three things, all practically useful.

1. **Quantisation and MoE both target the MLP, and now you know why.** Most of the weights to compress or multiply are there. This is the arithmetic that makes replacing FFN blocks with experts worth doing: you are sparsifying the parameter-dense part.
2. **You can estimate a model's parameter count from a config** and check whether the headline number matches the architecture. Read `num_hidden_layers`, `hidden_size` and `intermediate_size`, then compute:

```text
params ≈ embeddings + L * (attention_params + mlp_params)
        attention_params ≈ 4 * d_model^2                       (with MHA; less with GQA)
        mlp_params       ≈ 3 * d_model * d_ff   (gated)  or  2 * d_model * d_ff   (plain)
        embeddings       ≈ vocab_size * d_model  (often tied to the output projection)
```

You will usually land within a few percent of the published figure. When you do not, the discrepancy is informative — usually tied embeddings, a different accounting basis, or an MoE you mistook for dense.

3. **It tells you where an MoE's memory goes.** Hold that thought for Part 5.

**Where it stops working.** The "MLP holds two-thirds of parameters" claim is a *description of a configuration*, not a mechanism. It tells you nothing about which parameters matter, and it does not survive unusual architectures: MoE models deliberately move almost all parameters into many MLP copies and activate a few, and designs with much narrower `d_ff` shift the ratio substantially. Second, parameter count is not compute — a wide shallow model and a narrow deep model with the same parameter count behave quite differently. Third, and most important: **you cannot read capability off a parameter count.** It tells you about memory, the shape of the arithmetic, and what fits on your hardware. It does not tell you how good the model is — that is what evaluation is for, and Track 6 is where you learn to do it.

### Part 3 — Attention in depth: the division of labour and the square

Foundations gave you the formula. This part is about the two things people get wrong when they use it: what multi-head attention is for, and what the `sqrt(d_k)` actually divides.

#### Heads are parallel subspaces, not assigned jobs

Multi-head attention splits the `d_model`-wide vectors into `h` narrower pieces and runs `h` independent attention operations, each with its own projection matrices, then concatenates and projects back with `W_O`. In the original paper: `h = 8`, `d_model = 512`, so `d_k = d_v = 64`.

```text
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) @ W_O
head_i = Attention(Q @ W_Q_i, K @ W_K_i, V @ W_V_i)
```

Two corrections that matter, because both are commonly stated as fact and both are wrong.

**Total compute is roughly unchanged.** Splitting 512 dimensions into 8 heads of 64 does not multiply the work by 8 — you divide the width as you multiply the count. Multi-head attention buys *different subspaces*, different ways of asking and answering, not more arithmetic. This predicts that adding heads at fixed `d_model` is not a free capability boost: each head gets narrower, and a very narrow head has less room for a meaningful subspace.

**Heads are not designed specialists.** You will read that "head 3 tracks syntax" and "head 7 tracks coreference". Interpretability research has found heads with strikingly clean roles in specific trained models, and those findings are real — but the roles were not assigned by the architecture. Nothing in the design says a head should track pronouns. The model discovers whatever partition reduces its training loss, and most heads have no clean story. The sharpest evidence against the committee-of-specialists picture is behavioural: **delete a head at inference time and the model frequently keeps working**, because heads overlap in function. That is not what happens when you remove a member with a unique job.

#### The square root divides the key dimension

```text
Attention(Q, K, V) = softmax( (Q @ K^T) / sqrt(d_k) + M ) @ V
```

**`d_k` is the dimension of each key vector — equivalently, the per-head dimension — not `d_model`.** In the original paper's numbers the two differ by the head count: `sqrt(d_k) = sqrt(64) = 8` against `sqrt(d_model) = sqrt(512) ≈ 22.6`. Confusing them gives a formula wrong by a factor of about 2.8 there, and the error grows with the head count.

Why divide at all? A dot product of `d_k`-dimensional vectors accumulates `d_k` terms, so its typical magnitude grows roughly with the square root of `d_k` — meaning score *variance* grows roughly linearly with `d_k`. Large scores pushed into a softmax saturate the distribution: one weight near 1, the rest near 0, and in that region the softmax gradient is tiny, so the model barely learns. Dividing by `sqrt(d_k)` holds score variance roughly constant and keeps the softmax where it has usable gradient.

**What this lets you predict.** A model trained with a larger per-head dimension without appropriate scaling is hard to train, and the scaling is *per-head* — change the head count at fixed `d_model` and the correct divisor changes. That is why the distinction from `d_model` matters in practice. Note that this is a variance argument, not an output normalisation: output vectors are not unit length and are not meant to be.

**Where it stops working.** The argument assumes roughly independent, similarly-scaled components. Real trained models violate that: activations have heavy tails and some dimensions matter far more than others. So the scaling is a *stabilising heuristic justified by an idealised variance argument*, not a derivation guaranteeing well-behaved softmax in a trained network. Nearly universal and the right default — but not a proof.

#### Two different exponents, and what they cost

Attention and the MLP scale completely differently with sequence length.

| Operation | Work as a function of sequence length `n` | Why |
|---|---|---|
| Attention scores (`Q @ K^T`) | `O(n² · d_k)` | One score per *pair* of tokens, `n × n` of them |
| Attention output (`softmax @ V`) | `O(n² · d_v)` | Same pairwise structure |
| MLP (both projections) | `O(n · d_model · d_ff)` | Position-wise: each token is transformed independently |
| Normalisation and residual adds | `O(n · d_model)` | Position-wise, elementwise |

Read that table as the reason long context is a different problem from long output. **Attention work is quadratic** because the score matrix has one entry per token *pair* — double the sequence, quadruple the work. **The MLP is linear** because it never compares two positions; it applies the same function to each token's vector separately, so ten times the tokens is ten times the work, not a hundred.

```python
import numpy as np

def work_ratio(n, d_model=4096, d_ff=14336, n_heads=32):
    """Rough per-layer FLOP ratio: attention vs MLP, ignoring constants."""
    d_head = d_model // n_heads
    # Q@K^T and softmax@V: 2 matmuls of n x d_head x n, plus the projections
    attn = 4 * n * d_model**2 + 2 * n * n * d_head * n_heads
    mlp = 3 * 2 * n * d_model * d_ff   # gated MLP: three matrices
    return attn / mlp

for n in (512, 2048, 8192, 32768):
    print(n, round(work_ratio(n), 3))
```

Run it. At short sequences the MLP dominates by a wide margin; the crossover sits in the low thousands of tokens for these dimensions, and past it attention takes over. **The exact crossover depends on `d_model`, `d_ff` and the head layout — compute it for a real config rather than memorising a number.**

**What this lets you predict.** Several things you have probably observed without explanation.

- A long *prompt* is disproportionately expensive to process, because prefill carries the quadratic term — the O(n²) you were told about, now located in a specific part of the layer.
- A long *output* costs more per token as it grows, because decoding step `n` scores one query against `n` cached keys: linear per step, quadratic over the whole reply.
- Long-context serving is memory-bound before it is compute-bound. The KV cache is linear in sequence length and competes with the weights for the same GPU memory. The quadratic term is real, but it is not the first wall you hit.
- Training on long sequences is a memory problem more than an arithmetic one, because materialising the `n × n` score matrix is what blows up. That is exactly the problem FlashAttention addresses by tiling and never writing the full matrix to GPU high-bandwidth memory. It is an *exact* algorithm — it changes memory traffic, not the mathematics.

**Where it stops working.** Do not quote "attention is O(n²)" as an explanation for a specific latency number. At the sequence lengths most people use, the MLP and memory bandwidth often dominate. Asymptotics describe a limit as `n` grows, not your operating point — a model with a huge advertised context answering a short question is nowhere near the regime where the quadratic term decides anything. Second, the quadratic term motivated a whole family of alternatives — sliding-window attention, sparse patterns, state-based layers — and their existence proves the term is real without telling you which wins. That is an active area whose answer moves between model generations. **Check the current model's own documentation rather than assuming the 2017 complexity table still describes what is running.**

### Part 4 — Positional encoding: four approaches and what each one actually promises

Foundations showed you that attention is permutation-invariant and that position therefore has to be injected artificially. This part is how four schemes do it, and — more usefully — what each is and is not able to promise.

The design space is small. You can **add** a position vector, **learn** one, **rotate** by position, or **bias** by distance.

**Sinusoidal encodings (2017).** Fixed, not learned: for each position and dimension pair, add a sine or cosine of a frequency spanning a geometric progression, with wavelengths from `2π` to `10000 · 2π`. Low dimension indices oscillate quickly, high ones slowly — like a clock where some digits change every second and others once a day. The appeal was extrapolation: nothing in the formula is bounded by the training length, so a model trained at 512 positions has *defined* encodings at position 4,000. **In practice that extrapolation was weak.** Define-able is not the same as useful: the model never learned what to do with those patterns.

**Learned position tables.** A lookup table with one vector per position slot up to the maximum training length, filled in by training. Simple, effective, and completely bounded: there is no row for position 8,193 if the table has 8,192 rows — a clean learned representation in exchange for a hard ceiling.

**RoPE (rotary position embedding).** Instead of adding a vector, RoPE *rotates* the query and key vectors by an angle proportional to position, in pairs of dimensions. What makes it work is that rotations compose: rotate the query at position `i` by `i·θ` and the key at position `j` by `j·θ`, and their dot product depends only on the *difference* `i − j`. Relative position falls out of the geometry rather than being added in. This is why RoPE is the dominant choice in open-weight models and, As of 2026-09, the default across most major model families — though variants and scaling tricks change frequently and differ by model, so verify against a current config rather than assuming.

> **Analogy:** additive positional encodings are like stamping each token with a timestamp before filing it. RoPE is like putting each token on a turntable turned by an amount set by its position, so what matters when two tokens meet is the angle between them.
>
> **Where the analogy breaks.** A timestamp can be read back out of a filed document; with RoPE it cannot. The position information exists only as a relationship between two vectors, so you cannot inspect a single RoPE-encoded key and say where it came from. And "depends only on relative distance" is a property of the **dot product**, not of the vectors — the individual rotated vectors still encode absolute position. A timestamp mental model would have you expecting to subtract positions, and to expect far better long-range behaviour than the scheme delivers.

**ALiBi (attention with linear biases).** No positional vectors at all: add a fixed penalty to each attention score that grows linearly with the distance between the two positions, so nearer tokens are penalised less. Nothing is learned and nothing depends on absolute position. The paper's verified headline result is a 1.3B model trained on 1,024-token sequences that extrapolates to 2,048 while matching a sinusoidal model trained at 2,048, training 11% faster and using 11% less memory. ALiBi's bet is that graceful extrapolation beats a rich learned positional signal. It has largely been superseded by RoPE variants, which get better quality at trained lengths and can be extended with explicit scaling methods.

#### `rope_theta` — the correction you should not skip

You will read, in many otherwise good explanations, that "modern models all use `rope_theta = 1e6`". **That is false, and the underlying framing is also wrong.**

**`rope_theta` (also called `rope_base`) is not a fact from the RoPE paper.** It is a **Hugging Face / vLLM configuration convention** — a field in a model's config file setting the base of the rotation frequencies. The RoPE paper does not define a tunable theta at all. Any sentence of the form "the RoPE paper says theta is X" is a category error: it describes a library convention and attributes it to a paper that never had the parameter.

What real models use spans an order of magnitude or more. These values come from reading raw `config.json` files:

| Model | `rope_theta` | Scaling |
|---|---|---|
| DeepSeek-V3 | `1e4` (10,000) | `yarn` (context extension; `original_max_position_embeddings` 4096) |
| DeepSeek-R1 | `1e4` (10,000) | `yarn` (same) |
| Llama-3-8B | `5e5` (500,000) | — |
| Mixtral-8x7B | `1e6` (1,000,000) | — |
| Qwen3-235B-A22B | `1e6` (1,000,000) | — |

So: **values genuinely span `1e4`, `5e5` and `1e6`**, some models keep a small theta and extend context with a separate scaling method instead, and the value is a tuning choice. The intuition behind raising it — a higher base slows the rotation and helps long-context generalisation — is an intuition, and you should state it as one rather than as a derived result.

**Where this stops working, and why it matters.** The deeper lesson is not the three numbers. It is that **a configuration convention in a serving library is not an architectural fact from a paper**, and the two get conflated constantly, because most writers read library documentation and cite papers. When you see a claim of the form "the paper says [field name]", the field name is a strong hint that you are looking at library documentation. Go and check which one it is. That habit will save you more often than any number in this phase, because the numbers will be stale in a year and the habit will not.

### Part 5 — Mixture-of-Experts: buying capacity without buying compute

Everything so far assumed a dense model: every parameter participates in every token's forward pass. Now break that assumption deliberately, because it is the single biggest lever on the cost-versus-capability tradeoff in modern open-weight models, and it is routinely misunderstood.

Start with the tension. Part 2 showed that the MLP holds most of a dense model's parameters. So the naive way to make a model more capable is to make its MLPs wider — more parameters, more capacity. But the cost is brutal: **every extra parameter must be read for every token generated**, because it is part of the arithmetic. In dense models, capacity and compute-per-token are welded together.

**Mixture-of-Experts cuts that weld.** Replace each layer's single MLP with `N` separate MLP copies — the *experts* — plus a small **router** network. For each token, the router scores the experts and selects the top `k` (commonly 1, 2 or 8). **Only those experts run for that token.**

```text
# Schematic MoE layer (illustrative — real routers differ in detail)
scores  = router(x)                       # [n_tokens, n_experts]
top_k   = argsort(scores)[:, -k:]         # each token picks its k experts
weights = softmax(gather(scores, top_k))  # combine selected expert outputs
out     = sum(weights[i] * expert[top_k[i]](x) for i in range(k))
```

The consequence is the whole point: **total parameters and active parameters become different numbers.**

| Model | Total parameters | Active per token | Experts (per layer), top-k |
|---|---|---|---|
| Mixtral-8x7B | ~47B | ~13B | 8 experts, top-2 |
| DeepSeek-V3 | 671B | 37B | 256 routed + 1 shared, top-8 |

Those figures are from the model releases themselves (Mixtral's abstract states "each token has access to 47B parameters, but only uses 13B active parameters during inference"; DeepSeek-V3's abstract states 671B total / 37B activated). **They are dated examples As of 2026-09; the next generation will have different numbers — the mechanism is what you are learning, not the table.** DeepSeek-V3 is also a *fine-grained* MoE: 256 routed experts with only 8 selected, plus one shared expert every token uses.

**The naming trap.** "Mixtral 8x7B" invites the arithmetic 8 × 7B = 56B. It is not 56B, and the reason is instructive. Each "expert" is not a standalone 7B model — it is the three-matrix MLP *inside* a model whose hidden width is 4,096. Replacing one MLP with eight multiplies the parameter count of the MLP blocks, but the attention blocks, embeddings and output projection are shared and counted once. So the total lands near 47B. **The name is a marketing convention, not a parameter count.** Read the config and compute it.

**What MoE lets you predict — and this is where the phase earns its keep.**

1. **Compute falls; memory does not.** Only `k` experts run per token, so per-token FLOPs approximate a dense model of the *active* size. But **all experts must be resident in memory**, because the router can send any token to any expert and you cannot predict which before the token arrives. A 671B-parameter MoE needs memory for 671B parameters of weights even though its per-token compute resembles a far smaller model. **Active parameters is the right number for compute; total parameters is the right number for memory.** Confusing the two is the most common MoE error, and it produces exactly the wrong conclusion about whether a model will run on your hardware.
2. **It changes what you can serve, not what you can run on a laptop.** Big MoE models are the wrong target for a modest local machine unless you offload experts to system RAM or disk, which costs speed. A dense model of the active size often fits where the MoE does not.
3. **Routing makes batching messier.** Different tokens in the same batch select different experts, so a serving engine must gather and scatter work rather than running one clean matrix multiply — a real systems cost that partially offsets the FLOPs saving in high-throughput serving.
4. **Load balancing is a live problem.** If the router settles into sending most tokens to a few experts, the others never train. Real MoE training adds auxiliary losses to encourage balanced routing, meaning the router is not a free learned optimizer but a component that has to be *shaped*.

**Where it stops working.** MoE is not a free capability multiplier, and the field has not settled how much of the benefit is capacity versus the routing recipe. The honest statement As of 2026-09 is that sparsely-activated models have matched or exceeded dense models of comparable *active* size on many benchmarks while requiring the memory of a much larger dense model — a real trade, not a strict win.

Second: **the total-parameter number is not comparable across architectures.** "671B total" for a fine-grained MoE with 256 experts and "671B" for a hypothetical dense model describe very different things, with very different memory footprints and failure modes. Every parameter count needs the word "total" or "active" attached, plus the expert configuration, before it means anything.

Third, routing amplifies numerical sensitivity. Foundations noted that the same input can produce different outputs because floating-point addition is not associative and batching changes the arithmetic. In an MoE that is amplified: a token near a routing boundary can be sent to a different expert by a difference that would be negligible elsewhere. **You can predict that MoE models will tend to show more run-to-run variation than dense models of comparable quality** — a prediction worth testing rather than taking on faith.

### Part 6 — Reading a config: the skill this phase is actually for

Here is the payoff. Everything above collapses into one concrete habit: **when you meet a new model, read its `config.json` before you read its marketing.**

A `config.json` on the Hugging Face hub is authoritative in a way that no blog post is: it is machine-readable, it is the actual file the loader uses, and it cannot paraphrase itself. Field names vary between model families and libraries, but the same handful of facts are always in there.

```json
{
  "_comment": "Illustrative shape only — field names and values differ by model family.",
  "hidden_size": 4096,
  "num_hidden_layers": 32,
  "num_attention_heads": 32,
  "num_key_value_heads": 8,
  "head_dim": 128,
  "intermediate_size": 14336,
  "max_position_embeddings": 32768,
  "rope_theta": 1000000.0,
  "vocab_size": 32000,
  "num_local_experts": 8,
  "num_experts_per_tok": 2
}
```

Do not memorise those values — I have deliberately not attached them to a model name, because the point is the *reading*, not the numbers. Here is what to extract and what each field lets you predict:

| Field | What it controls | What you can predict from it |
|---|---|---|
| `hidden_size` (`d_model`) | Width of the residual stream | Parameter scale; memory for activations |
| `num_hidden_layers` | Depth | Roughly linear scaling of params; KV cache size |
| `num_attention_heads` | Query heads | Per-head dimension = `hidden_size / heads` — this is `d_k` |
| `num_key_value_heads` | KV heads | KV cache size; if fewer than query heads, the model uses GQA |
| `head_dim` (often implicit) | Per-head dimension | The `sqrt(d_k)` divisor; cache formula |
| `intermediate_size` (`d_ff`) | MLP width | Where most parameters sit; MLP FLOPs |
| `max_position_embeddings` | Trained position range | The context the model was actually trained for |
| `rope_theta` | Rotation base (library convention) | How positional frequencies are spread; not a quality signal |
| `vocab_size` | Output layer width | A large chunk of parameters, especially in small models |
| `num_local_experts`, `num_experts_per_tok` | MoE shape | Total vs active parameters; memory vs compute |

Note how much of this track you can now answer from ten numbers. KV cache per token needs layers, KV heads, head dim and precision — four of the fields above. Where the parameters live: `hidden_size` and `intermediate_size`. Whether it is a MoE and what that costs in memory: the two expert fields. Whether the context window is a training-time property or a bolted-on extension: `max_position_embeddings` together with whether a scaling field is present.

**Where this stops working.** Three boundaries, and they are why this phase cannot be replaced by a config-reading script.

First, **a config tells you nothing about capability.** Two models with identical configs can differ enormously in quality, because the config does not contain the data, the training recipe, or the token count. Architecture is necessary context and insufficient evidence.

Second, **names and defaults lie in both directions.** A field may be absent and defaulted by the library; a name may count things on a different basis (Mixtral's total is reported as both ~46.7B and ~47.4B depending on whether embeddings and tied weights are counted — the abstract's rounded figures are the safest to quote). When your arithmetic disagrees with a published number by a few percent, you have usually found an accounting difference, not an error.

Third, and most important: **every number in that table is volatile.** As of 2026-09, MoE is widespread, GQA is close to default, RoPE dominates, and gated MLPs are standard — and none of those sentences is guaranteed true in two years. The method survives; the values do not. **Date what you write down, say what to check instead, and never let a conclusion rest on a number you cannot re-derive.**

That is the difference between someone who memorised that a particular model has 32 layers, and someone who can open the config of a model released next month and say what it will cost to serve. Only the second is still right next year.

---

## Hands-on practice tasks

1. Open any dense model's `config.json` on the Hugging Face hub. Read `hidden_size` and `intermediate_size`, and compute the ratio `intermediate_size / hidden_size`. Record it and the date you read it. <!-- id: intern-02-transformer-architecture-t01 band: quick energy: low -->
2. Build one pre-norm transformer block in NumPy with `d_model=64`, `d_ff=256`, 4 heads. Feed in a random sequence of 8 tokens. Print the shape after each sub-step and verify every intermediate matches the shape table in Part 1 before moving on. <!-- id: intern-02-transformer-architecture-t02 band: focused energy: normal -->
3. Prove the `sqrt(d_k)` scaling matters by experiment: run your NumPy attention at `head_dim = 4` and again at `head_dim = 256` at the *same* `d_model`, once with the divisor and once without. Print the maximum softmax weight for each of the four runs. Record how saturation behaves as the head dimension grows. <!-- id: intern-02-transformer-architecture-t03 band: focused energy: normal -->
4. Install the `transformers` library and print a real model's attention class with `inspect.getsource`. Find the exact line where the query-key product is divided, and confirm for yourself which dimension the divisor uses. Quote the line in your notes. <!-- id: intern-02-transformer-architecture-t04 band: focused energy: normal -->
5. Write a function that estimates a dense model's parameter count from `num_hidden_layers`, `hidden_size`, `intermediate_size` and `vocab_size`, then compare your estimate against the actual file sizes or published parameter counts for three different models. For each one, write one sentence explaining any gap larger than 5%. <!-- id: intern-02-transformer-architecture-t05 band: deep energy: high -->
6. Read three `config.json` files from different model families and record `rope_theta`, `max_position_embeddings` and any context-scaling field. Build a table with a "date read" column. Then write two sentences on what this table would have looked like wrong if you had believed the claim that all modern models use `1e6`. <!-- id: intern-02-transformer-architecture-t06 band: focused energy: normal -->
7. Take one MoE model's config and compute three separate numbers: total parameters, active parameters per token, and the memory needed to hold the weights at 8-bit precision. Then write a sentence that correctly uses each of the three, and a sentence that wrongly conflates two of them. <!-- id: intern-02-transformer-architecture-t07 band: deep energy: high -->
8. Keep a week-long log with two columns. In the left column, note when a model seems to slow down on long prompts versus long outputs. In the right, note whether the MLP-linear or attention-quadratic term best explains it at that length. At the end of the week, write a paragraph naming at least one case where you expected the quadratic term to dominate and it did not. <!-- id: intern-02-transformer-architecture-t08 band: ongoing energy: low -->

## Common Pitfalls

**Saying attention is scaled by `sqrt(d_model)`.** It is scaled by `sqrt(d_k)` — the per-head key dimension. In the original paper these differ by a factor of the head count, so the error is large and gets worse with more heads.

**Treating "the MLP holds two-thirds of the parameters" as a law.** It is implied by `d_ff ≈ 4 × d_model`, which is a convention. Read `intermediate_size` from the config and compute the actual split for the model in front of you.

**Believing pre-norm is simply better engineering.** Pre-norm buys training stability at depth. It also lets the residual stream grow unboundedly, which is why a final normalisation is there. Post-norm was the original formulation, not a mistake, and "everyone does X now" is evidence about stability and cost, not proof of optimality.

**Thinking more heads means more compute.** Multi-head splits the width as it multiplies the count, so total work is roughly constant. What changes is the number of independent subspaces, and narrower heads are not automatically better.

**Assuming named heads reflect a designed role.** Heads with clean roles exist in specific trained models, but the roles are discovered, not assigned, and deleting a head often changes nothing. The division of labour is a partition found by training, not a specification.

**Quoting a `rope_theta` value from memory.** It is a config convention, the paper does not define it, and verified values span `1e4`, `5e5` and `1e6`. Read the config for the model you are actually discussing.

**Confusing total parameters with active parameters in a MoE.** Active parameters predict compute; total parameters predict memory. Getting this backwards produces the wrong conclusion about whether a model fits on your hardware.

**Doing `8 × 7B = 56B` for an MoE name.** Expert count times a nominal size is not a parameter count. The attention blocks, embeddings and output projection are shared and counted once.

**Quoting "attention is O(n²)" as the cause of a specific latency.** At realistic lengths the MLP and memory bandwidth usually dominate. Compute the crossover for the actual config before blaming the quadratic term.

**Writing down an architecture number as a permanent fact.** Head counts, `d_ff` ratios, rope bases, expert configurations and context sizes all change between model generations. Record the date, and record what to check instead.

## Deliverable / proof of work

Write `portfolio/model-internals/02-transformer-architecture.md` containing:

- **Your block diagram, drawn by hand.** One pre-norm transformer block with every arrow labelled with its shape: input, `norm1`, attention, the first residual add, `norm2`, the MLP, the second residual add. Do this from memory before checking anything, then correct it in a different colour and say what you got wrong.
- **A parameter-split table.** For three real dense models, read `hidden_size`, `intermediate_size` and `num_hidden_layers` from the config, compute the attention-versus-MLP parameter split, and record your estimate against the published count. Include one sentence per model on any gap above 5%.
- **A `rope_theta` table with a date column.** At least three models from different families, with `max_position_embeddings` and any context-scaling field alongside. Underneath, write the two-sentence correction: what `rope_theta` actually is, and why the "all models use `1e6`" claim is false.
- **An MoE cost sheet.** One MoE model's total parameters, active parameters, and weight memory at two precisions, with a sentence each on which number answers the compute question and which answers the memory question. Include the derivation, not just the result.
- **Your attention-versus-MLP crossover.** The output of the `work_ratio` script for one real config, with the sequence length at which the two terms cross, and a sentence on what that implies about the lengths you actually use.
- **A prediction you got wrong.** One thing in this phase that contradicted what you expected before reading it, and what the mechanism actually implies. This is the most valuable section. Three sentences is enough.

## Checklist

- [ ] I can draw a pre-norm transformer block from memory with both residual adds marked <!-- id: intern-02-transformer-architecture-c01 energy: normal -->
- [ ] I can explain the residual stream without using the phrase "skip connection" as the whole explanation <!-- id: intern-02-transformer-architecture-c02 energy: normal -->
- [ ] I can state what breaks without residual connections, in gradient terms <!-- id: intern-02-transformer-architecture-c03 energy: normal -->
- [ ] I can explain the difference between pre-norm and post-norm and say what pre-norm buys <!-- id: intern-02-transformer-architecture-c04 energy: normal -->
- [ ] I can compute the attention-versus-MLP parameter split from a real config <!-- id: intern-02-transformer-architecture-c05 energy: high -->
- [ ] I can state the scaling divisor correctly and explain what happens to the softmax without it <!-- id: intern-02-transformer-architecture-c06 energy: normal -->
- [ ] I can explain why attention is O(n squared) and the MLP is O(n), from the shape of the computation <!-- id: intern-02-transformer-architecture-c07 energy: normal -->
- [ ] I have computed the attention-versus-MLP crossover for a real config rather than quoting a number <!-- id: intern-02-transformer-architecture-c08 energy: high -->
- [ ] I can name the regime where the quadratic term is not the bottleneck <!-- id: intern-02-transformer-architecture-c09 energy: normal -->
- [ ] I can compare sinusoidal, learned, RoPE and ALiBi position handling and say what each cannot do <!-- id: intern-02-transformer-architecture-c10 energy: normal -->
- [ ] I can explain what `rope_theta` is, and why it is not a RoPE-paper fact <!-- id: intern-02-transformer-architecture-c11 energy: normal -->
- [ ] I can give three real `rope_theta` values from different models and say the "all models use 1e6" claim is false <!-- id: intern-02-transformer-architecture-c12 energy: normal -->
- [ ] I can explain sparse activation and top-k routing in a Mixture-of-Experts layer <!-- id: intern-02-transformer-architecture-c13 energy: normal -->
- [ ] I can explain why active parameters predict compute while total parameters predict memory <!-- id: intern-02-transformer-architecture-c14 energy: high -->
- [ ] I can explain why an "8x7B" MoE is not 56B parameters <!-- id: intern-02-transformer-architecture-c15 energy: normal -->
- [ ] I have read at least three real config files and dated every number I wrote down <!-- id: intern-02-transformer-architecture-c16 energy: normal -->
- [ ] I have written the deliverable file and included a prediction I got wrong <!-- id: intern-02-transformer-architecture-c17 energy: high -->

## Quiz

### Q1. A model card lists a scaling divisor of `sqrt(64)` for an attention layer with `d_model = 512` and 8 heads. A colleague insists it should be `sqrt(512)`. Which is correct, and why does the difference matter? <!-- id: intern-02-transformer-architecture-q01 energy: high -->

- [x] `sqrt(64)`, because the divisor is the key/query dimension per head, and using `d_model` would over-scale by roughly a factor of 2.8 here
- [ ] `sqrt(512)`, because scaling must account for the full model width
- [ ] Either works, since both keep the softmax in a usable range
- [ ] `sqrt(64)`, because the divisor normalises the output vectors to unit length

**Why:** The divisor is `sqrt(d_k)` — the per-head key dimension — and in this model `d_k = 512 / 8 = 64`, so `sqrt(d_k) = 8` against `sqrt(d_model) ≈ 22.6`. The scaling exists to hold score variance roughly constant as the head dimension grows; using `d_model` over-scales and shrinks the score spread. It does not normalise the output vectors, which are not unit length and are not meant to be.

### Q2. You are reading a Mixture-of-Experts config: 671B total parameters, 37B active per token. Your laptop has 64 GB of RAM. What does the memory requirement actually look like? <!-- id: intern-02-transformer-architecture-q02 energy: high -->

- [ ] It should fit, since only 37B parameters are used per token
- [ ] It depends only on the context length, not on the parameter count
- [x] It needs memory for all 671B parameters of weights, because the router can send any token to any expert
- [ ] It needs memory for 37B parameters plus the KV cache, since inactive experts can be paged in on demand at no cost

**Why:** Every expert must be resident because routing decisions are made per token at inference time and cannot be predicted ahead. Sparse activation reduces compute, not memory — which is precisely why total parameters is the right number for memory and active parameters is the right number for compute. Offloading experts to system RAM or disk is possible but costs speed, so it is a trade rather than a free fix.

### Q3. A dense transformer's MLP blocks hold roughly twice the parameters of its attention blocks. What is the most accurate reading of that fact? <!-- id: intern-02-transformer-architecture-q03 energy: high -->

- [x] It follows from the width convention `d_ff ≈ 4 × d_model`, so it is a property of the configuration rather than a law
- [ ] Attention is a minor part of the architecture and could be removed with little effect
- [ ] It shows that most model capability comes from the MLP and attention mainly handles formatting
- [ ] It means the MLP is the only part worth quantising

**Why:** Run the arithmetic — attention is roughly `4 × d_model²` and a plain MLP is `2 × d_model × d_ff`, which is `8 × d_model²` when `d_ff = 4 × d_model`. The ratio is a consequence of the width convention, and it shifts with gated MLPs and with GQA shrinking the K and V projections. Parameter share tells you where the weights are; it says nothing about which component matters more for capability.

### Q4. A pre-norm transformer is written as `x = x + sublayer(LayerNorm(x))`. What does putting the normalisation on the branch actually buy? <!-- id: intern-02-transformer-architecture-q04 energy: normal -->

- [ ] It reduces the number of parameters in the block
- [ ] It removes the need for a final normalisation before the output projection
- [ ] It shortens the KV cache by normalising keys before they are stored
- [x] It leaves the residual addition as a clean identity path, which stabilises gradient flow and trains at greater depth

**Why:** The identity path's derivative is exactly 1, so gradient reaches early layers through a chain of additions rather than through a chain of normalisations and learned multiplications. That is what makes deep stacks trainable without delicate learning-rate warmup. It does not reduce parameters, does not shorten the KV cache, and does not remove the need for the final normalisation — the stream's magnitude grows with depth precisely because it is never renormalised.

### Q5. A model handles a 200,000-token document window. During prefill of a long prompt, which term dominates the layer's FLOPs? <!-- id: intern-02-transformer-architecture-q05 energy: high -->

- [x] Attention, because its work grows with the square of sequence length while the MLP grows linearly
- [ ] The MLP, because it holds most of the parameters
- [ ] The normalisation layers, because they run on every token at every layer
- [ ] Neither; both are linear in sequence length at every scale

**Why:** Attention produces one score per token pair, so its work is `O(n² · d)`, while the MLP applies the same transformation to each token independently and is `O(n · d · d_ff)`. Past the crossover — which you should compute from the real `d_model` and `d_ff` rather than assume — the quadratic term dominates. Note the trap in the first option: parameter count does not determine FLOP scaling.

### Q6. A team reads that `rope_theta` must be `1e6` and plans to change a model's config accordingly. What is wrong with this plan? <!-- id: intern-02-transformer-architecture-q06 energy: normal -->

- [ ] The correct value is always 10000, as specified in the RoPE paper
- [ ] `rope_theta` only affects inference speed and has no effect on quality
- [ ] The correct value is always 500000, because that is what the most widely used model family does
- [x] `rope_theta` is a Hugging Face / vLLM configuration convention rather than a RoPE-paper fact, and verified model values span `1e4`, `5e5` and `1e6`

**Why:** The RoPE paper never defines a tunable theta; the field belongs to the serving-library configuration format. Real values include `1e4` for DeepSeek-V3 and R1 (which extend context with YaRN instead), `5e5` for Llama-3-8B, and `1e6` for Mixtral and Qwen3. Changing it arbitrarily alters the positional frequency structure the model was trained with, so it is a change to the model's behaviour, not a correctness fix — and the "all modern models use `1e6`" claim is simply false.

### Q7. A dense model has `d_ff = 4 × d_model`. What does that ratio tell you, and what does it not tell you? <!-- id: intern-02-transformer-architecture-q07 energy: high -->

- [ ] It tells you the model's capability tier, and it does not tell you the memory requirement
- [ ] It tells you the number of attention heads, and it does not tell you the number of layers
- [x] It tells you roughly where the parameters sit and how MLP FLOPs scale, and it does not tell you how good the model is
- [ ] It tells you the KV cache size, and it does not tell you the training data size

**Why:** The ratio determines the attention-versus-MLP parameter split and the MLP's per-token compute, both of which are genuinely useful. It carries no information about capability, because capability depends on the data, the training recipe and the token count — none of which are in the config. It also does not set the KV cache size, which is governed by layers, KV heads, head dimension and precision.

### Q8. An MoE layer routes each token to 2 of 8 experts. What happens to memory and compute compared with replacing it with a single dense MLP of the same total parameter count? <!-- id: intern-02-transformer-architecture-q08 energy: high -->

- [ ] Both memory and compute are reduced proportionally to the number of active experts
- [x] Compute per token is lower because only the selected experts run, while the weights of all experts must still be resident in memory
- [ ] Memory is lower because inactive experts can be discarded, while compute is unchanged
- [ ] Both are unchanged, because the router adds equivalent overhead to each

**Why:** Sparse activation decouples capacity from per-token compute: only `k` experts participate in the forward pass, so the FLOPs resemble a smaller dense model. But any token may be routed to any expert, so all expert weights must be available, which is why a large MoE is hard to run on constrained hardware even though its active parameter count is modest. This is the memory-versus-compute distinction that the phrase "MoE models are cheaper to run" quietly gets wrong.

### Q9. Why does adding expert capacity to a model change what it can be served on, but not necessarily what it can be trained to do cheaply? <!-- id: intern-02-transformer-architecture-q09 energy: high -->

- [ ] Because training is compute-bound and inference is always memory-bound in every regime
- [ ] Because experts are trained one at a time, so training cost grows only with the number of layers
- [ ] Because the router makes inference cheaper by skipping layers entirely
- [x] Because sparse activation means training and inference both touch only a fraction of the experts per token, so per-token compute stays near the active size while the weight footprint stays near the total

**Why:** The router selects a small subset of experts for each token in both training and inference, so per-token compute tracks the active parameter count rather than the total. The full set of weights must still exist and be resident, which is a memory cost rather than a compute one. The first option overstates a general rule — training and inference bottlenecks both shift with batch size and sequence length.

### Q10. Which statement about attention's quadratic cost is the most defensible? <!-- id: intern-02-transformer-architecture-q10 energy: normal -->

- [ ] Attention is quadratic in all implementations, so long-context models must be slow
- [x] Attention is quadratic in sequence length, but at realistic lengths the MLP and memory bandwidth often dominate, so compute the crossover for the actual config
- [ ] The quadratic term applies only to encoder models, not to decoder-only chat models
- [ ] FlashAttention removes the quadratic term by approximating the attention matrix

**Why:** The score matrix is genuinely `n × n`, so the term is real and motivated a whole family of efficient-attention methods. But asymptotics describe a limit as `n` grows, not your operating point, and the MLP is `O(n)` with a large constant. FlashAttention is an *exact* algorithm that tiles the computation to reduce memory traffic — it changes memory behaviour, not the arithmetic count.

## You're ready to move on when...

- You can draw one pre-norm transformer block from memory, with both residual adds and both normalisations in the right places, and explain what each one contributes.
- You have computed the attention-versus-MLP parameter split for at least two real models from their configs, and you know it follows from the width convention rather than being a law.
- You can state the scaling divisor as `sqrt(d_k)` and explain, in variance terms, what breaks without it.
- You have computed the sequence length at which attention overtakes the MLP for one real config, rather than quoting someone else's number.
- You can compare sinusoidal, learned, RoPE and ALiBi position handling, and name one thing each of them cannot do.
- You can say what `rope_theta` actually is, give three real values from different model families, and explain why the "all models use `1e6`" claim is false.
- You can read an MoE config and produce three separate numbers — total parameters, active parameters, and resident weight memory — and say which question each answers.
- Every architecture number in your portfolio carries the date you read it and a note on what to check instead.
- Your deliverable file exists at `portfolio/model-internals/02-transformer-architecture.md` and includes a prediction you got wrong.

## Free vs Paid

### What's free is enough

Everything in this phase is free, permanently. Python and NumPy cost nothing. The transformer paper, the RoPE paper, the ALiBi paper, the YaRN paper, the sparsely-gated MoE paper, the Mixtral and DeepSeek release papers, and the PagedAttention paper are all open on arXiv. Jay Alammar's Illustrated Transformer, Harvard's Annotated Transformer, Karpathy's video and nanoGPT repository, 3Blue1Brown's attention series, Brendan Bycroft's in-browser forward-pass visualisation, EleutherAI's Transformer Math 101 and the Hugging Face LLM course are all free to read or watch.

Crucially, **`config.json` files are free and require no account**. They are the primary source this phase is built on, they are machine-readable, and they cannot paraphrase themselves the way a blog post can. You can fetch any of them with `curl` or read them in a browser on the model's Hugging Face page. The single highest-value activity in this phase costs nothing and takes an afternoon: open three configs from different families and do the arithmetic yourself.

You do not need a GPU. Every calculation here is small matrix arithmetic that a laptop CPU finishes instantly, and the parameter estimates are arithmetic, not measurement.

### What a paid tier adds

Very little, honestly. A paid API key would let you *observe* serving behaviour — latency profiles on long prompts versus long outputs — which sharpens the prediction tasks in Part 3. A Colab paid tier or rented GPU would let you load a small model and read its actual layer shapes from the loaded object rather than from the config, which is a slightly more direct form of the same evidence. Neither changes what you learn.

The one thing money genuinely buys here is speed on the optional extension tasks. Nothing in the deliverable depends on it.

### When it's worth paying

**Not in this phase.** There is no threshold to cross here, because the material is fully public and the primary sources are free.

The honest version: the time to spend money is when you reach Track 7 and want to measure what your own workloads cost, or when you reach Track 6 and want a GPU to fine-tune something. Those are real constraints that free tiers genuinely cannot cover. Reading a `config.json` and doing parameter arithmetic is not one of them — and if you find yourself wanting to rent a GPU "to understand the architecture better", you have misread the phase. The understanding lives in the arithmetic you do by hand and in the configs you read, not in the hardware.

**The budget for this phase is ₱0**, roughly 16–24 hours over two weeks, and an internet connection. The constraint that will actually bite is not money. It is the temptation to memorise the numbers in Parts 1 through 5 instead of the reading method in Part 6 — and those numbers will be wrong within a year, while the method will still be how you evaluate whatever ships next.
