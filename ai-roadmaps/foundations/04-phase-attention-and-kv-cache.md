---
id: found-04-attention-and-kv-cache
track: foundations
phase: 4
order: 40
title: Attention and the KV Cache
duration: 2 weeks
duration_weeks: 2
energy_mix: "30% reading, 40% hands-on maths and measurement, 20% writing, 10% review"
deliverable: portfolio/foundations/04-attention-and-kv-cache.md
exit_criteria: >
  You can write the scaled dot-product attention formula from memory and explain
  every symbol. You can compute a small attention output by hand for three tokens.
  You can estimate KV cache memory for a given model shape and sequence length,
  and you can explain why grouped-query attention shrinks that number. You can
  clearly distinguish the server-side KV cache from provider prompt caching, and
  say what each one is billed for. You can explain why attention cost grows with
  the square of sequence length and name the point where that stops mattering.
---

## Goal of this phase

By the end of this phase you will understand the one operation that makes modern language models work: **attention**. Not the word "attention" as a slogan, but the actual arithmetic — what gets multiplied by what, why there are three separate projections instead of one, and why the number of operations explodes as your input gets longer.

Then you will learn something that almost no beginner course teaches and that explains most of the confusing behaviour you will meet in practice: the **KV cache**. It is the reason your second message in a chat is cheap and your first one is not. It is the reason long conversations slow down. It is the reason a 128k-context model can require more memory than the model weights themselves. It is the reason providers charge you differently for "cached input tokens" than for fresh ones.

The point of this phase is predictive power. Once you have attention and the KV cache in your head, you can look at a model card, see "32 layers, 32 heads, 8 KV heads, head dim 128", and *estimate* what a long chat will cost and why. You can look at a provider's pricing page and understand which line item applies to your workload. You can read about "grouped-query attention" and know exactly which number it changes.

Phase 3 gave you tokens and context windows — the raw material and the budget. This phase explains the machine that consumes that budget, and why the budget is expensive.

## Estimated time

**2 weeks, roughly 8–12 hours per week.** A suggested split:

| Activity | Hours/week | Notes |
|---|---|---|
| Reading the lesson, slowly, with a pen | 3–4 | Do not skim Part 4 and Part 5 |
| Hand-computing small attention examples | 2–3 | Paper and calculator, not code, the first time |
| Running the Python measurement tasks | 2–3 | Any laptop works; nothing here needs a GPU |
| Reading one real model card and one pricing page | 1 | Compare what you predicted to what they say |
| Writing your portfolio entry | 1–2 | Week 2 only |

You do not need a GPU, a paid API key, or an account anywhere to finish this phase. Everything can be done with Python, NumPy, and free web pages.

## Skills you'll gain

- Write the scaled dot-product attention formula from memory and explain each symbol.
- Compute a small attention output by hand for three or four tokens.
- Explain the difference between queries, keys, and values in causal (decoder-only) language models.
- Explain multi-head attention and what each head is doing.
- Explain why position has to be injected artificially and compare sinusoidal encodings with RoPE.
- Derive the KV cache memory formula from model shape, sequence length, and precision.
- Estimate KV cache size for a real model and a real conversation length.
- Explain what grouped-query attention changes and estimate the saving.
- Distinguish the KV cache from provider prompt caching, and say which one is billed.
- Explain the O(n²) attention cost and the regime where it stops being the bottleneck.

## Specific topics to learn

- Token embeddings as the input to attention.
- Query, key, value projections and why there are three.
- Dot products as similarity, and why they are scaled by the square root of the head dimension.
- Softmax as a normaliser that turns scores into weights.
- Causal masking and why a chat model cannot see the future.
- Multi-head attention: parallel subspaces, then concatenate and project.
- Positional information: sinusoidal encodings, learned positions, rotary position embeddings.
- The KV cache: what is stored, why it is reused, how big it gets.
- Grouped-query attention and multi-query attention.
- Prefill versus decode: two different phases with two different bottlenecks.
- Provider prompt caching as a separate, billed feature.
- The quadratic term in attention cost and where it actually bites.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Python 3 | Run all the numeric work in this phase | Free | https://www.python.org/downloads/ | Every task in this phase | Any Python install from your OS package manager |
| NumPy | Matrix maths without a GPU | Free | https://numpy.org/install/ | Task t01, t02, t04 | Pure Python lists, if you insist, but NumPy is free anyway |
| Jupyter Notebook or VS Code | Interactive scratchpad for attention experiments | Free | https://jupyter.org/install | Tasks t01 and t02 | Any text editor plus `python file.py` |
| Hugging Face model cards | Read real architecture numbers (layers, heads, head dim) | Free to browse | https://huggingface.co/models | Task t05 | Any published model report or paper page |
| Hugging Face `transformers` docs | See `num_key_value_heads` and cache config in real APIs | Free | https://huggingface.co/docs/transformers | Task t04 and t06 | Read the source on GitHub; it is open |
| Google Colab | Free notebook with a small GPU, if you want to measure real memory | Freemium | https://colab.research.google.com/ | Optional extension to t04 | Your own laptop CPU with NumPy, which is enough |
| An LLM provider pricing page | Compare cached vs uncached input pricing | Free to read | https://openai.com/api/pricing/ | Task t06 and the Free vs Paid section | Any provider's docs page; read at least two |
| draw.io or pen and paper | Draw the attention data flow | Free | https://app.diagrams.net/ | Task t03 | Paper. Paper is genuinely better here |

## Free/cheap resources

- **The Illustrated Transformer (Jay Alammar)** — https://jalammar.github.io/illustrated-transformer/
- **The Annotated Transformer (Harvard NLP)** — https://nlp.seas.harvard.edu/annotated-transformer/
- **Attention Is All You Need (the original paper, arXiv)** — https://arxiv.org/abs/1706.03762
- **Andrej Karpathy, Let's build GPT from scratch (video)** — https://www.youtube.com/watch?v=kCc8FmEb1nY
- **Andrej Karpathy, nanoGPT repository** — https://github.com/karpathy/nanoGPT
- **3Blue1Brown, Attention in transformers (visual)** — https://www.youtube.com/watch?v=eMlx5fFNoYc
- **Hugging Face, LLM course chapter on attention** — https://huggingface.co/learn/llm-course
- **Hugging Face blog on KV cache and generation strategies** — https://huggingface.co/blog/not-lain/kv-caching
- **RoFormer paper page (rotary position embeddings)** — https://arxiv.org/abs/2104.09864
- **EleutherAI, transformer maths walkthrough** — https://blog.eleuther.ai/transformer-math/
- **OpenAI prompt caching documentation** — https://platform.openai.com/docs/guides/prompt-caching

## Lesson: What the Model Actually Computes

You already know from Phase 3 that text becomes tokens, and tokens become vectors. You know context length is a budget. What you do not yet know is what happens *inside* between the embeddings going in and the next-token probabilities coming out. That gap is attention, and once you close it, a huge amount of model behaviour stops being mysterious.

I am going to build this the same way every time: the problem first, then the mechanism, then what you can predict with it, then — crucially — where it stops working. That last part is where most explanations quit, and it is where real understanding lives.

### Part 1 — The problem attention solves: meaning depends on context

Here is a sentence:

> The bank was steep and muddy, so we sat on the **bank** instead.

You read that twice without noticing, but your brain did something remarkable. The word "bank" appeared twice with two different meanings, and you resolved both from the surrounding words. You did not need a dictionary lookup that returns all meanings of "bank". You needed each occurrence to *pull information from specific other words* — "steep", "muddy" for the first, "sat" for the second.

Now consider what a model had before attention. Earlier neural approaches to sequences processed tokens left to right, carrying a single fixed-size hidden state. By the time it reached the end of a long sentence, that hidden state had to contain everything worth remembering. It was a funnel. Information from early tokens got overwritten or diluted. Long-range dependencies — where a pronoun at position 40 refers to a noun at position 3 — were exactly the thing these models were bad at.

The naive fix is obvious and terrible: let every token look at every other token directly. For a sequence of *n* tokens, that is *n × n* pairs. Each pair needs a comparison. That is the *n²* you have heard about, and we will get to why it hurts.

But there is a harder problem than cost. If every token just looked at every other token, what would "looking" even mean? You need something more specific than "mix them together". You need a mechanism where a token can ask a *question* and other tokens can *answer* it.

> **Analogy:** a room full of people, each holding a card with a topic written on it. One person stands up and asks "who knows about rivers?" The people whose cards say "river" raise their hands highest. The asker then collects information from the raised hands, weighted by how relevant each one was.
>
> **Where the analogy breaks:** the people in this room do not have fixed topics. In a transformer, the "topic card" a token holds is itself computed from the token's content, and the "question" is computed separately. The same token presents a different card depending on what is asked of it, because the card and the question come from different learned projections of the same vector. Also, everyone in the room speaks simultaneously in one parallel step — there is no turn-taking, no sequence of stand-ups. The room is a single matrix multiplication. And critically, in a chat model, most of the room is blindfolded: token 5 cannot hear token 7, because token 7 has not happened yet.

That last clause — the blindfold — is the whole reason we call it *causal* attention, and it is why a chat model can be trained to predict the next token.

### Part 2 — Queries, keys, values: the mechanism, made concrete

Take a single token at position *i*. It arrives as a vector, call it **x_i**, of dimension *d_model*. In a real model *d_model* might be 768, 4096, or larger. For your hand calculations, pretend it is 4.

The model learns three weight matrices, and it is worth pausing on the fact that there are three and not one:

- **W_Q** produces the **query**: what this token is looking for.
- **W_K** produces the **key**: what this token advertises about itself to others.
- **W_V** produces the **value**: what this token will actually hand over if selected.

So:

```text
q_i = x_i @ W_Q        # what token i asks
k_i = x_i @ W_K        # what token i offers, as a label
v_i = x_i @ W_V        # what token i offers, as content
```

Why three? Because asking, being-labelled, and giving are different jobs. A pronoun like "it" needs a query that means roughly "find me a recent concrete noun". A noun like "river" needs a key that means "I am a concrete noun, recent". But the content that "river" should hand over if selected is its full meaning, not merely the label "concrete noun". If you forced query and key to share a projection, you would be demanding that the thing you search *with* and the thing you search *against* live in the same space, which is a real restriction, not a convenience. Splitting them costs parameters and buys flexibility. That is the trade.

**Step 1: score.** To find out how much token *i* should attend to token *j*, take the dot product of the query of *i* with the key of *j*:

```text
score_ij = q_i · k_j
```

A dot product is large and positive when two vectors point the same way. So it is a learned similarity: "does what I am looking for match what you advertise?" This is why the mechanism is called *attention* — the score is how much attention *i* pays to *j*.

Do this for every pair, and you get an *n × n* matrix of scores. This is the quadratic object. Hold that thought.

**Step 2: scale.** Divide every score by the square root of the key dimension:

```text
scaled_ij = score_ij / sqrt(d_k)
```

This step looks like a superstition until you see what breaks without it. Dot products of *d_k*-dimensional vectors grow roughly with *d_k*: if the components are independent-ish with similar magnitude, the dot product accumulates *d_k* terms, so its typical magnitude grows like the square root of *d_k*. Push those larger numbers into a softmax and the distribution becomes extremely peaked — one weight close to 1, everything else close to 0. Peaked softmax means tiny gradients, and tiny gradients mean the model barely learns. Dividing by `sqrt(d_k)` keeps the scores in the range where softmax behaves. In the original transformer paper, this scaling is literally justified by that variance argument.

**Step 3: mask.** In a chat model, token *i* must not attend to tokens after *i*, because during training those tokens are the answer. So you set `scaled_ij = -infinity` for all *j > i*, before the softmax. Softmax of negative infinity is exactly zero, so those positions contribute nothing. This is *causal masking*, and it is what makes the model a next-token predictor rather than a fill-in-the-blank predictor.

**Step 4: normalise.** Apply softmax across each row, so every row is a set of non-negative weights summing to 1:

```text
a_ij = exp(scaled_ij) / sum_over_j( exp(scaled_ij) )
```

**Step 5: mix.** The output for token *i* is the weighted sum of the value vectors:

```text
out_i = sum_over_j( a_ij * v_j )
```

Put it all together, in the form you will see everywhere:

```text
Attention(Q, K, V) = softmax( (Q @ K^T) / sqrt(d_k) + M ) @ V
```

Every symbol, one line each:

| Symbol | Meaning | Shape |
|---|---|---|
| Q | Stacked queries, one row per token | n × d_k |
| K | Stacked keys, one row per token | n × d_k |
| V | Stacked values, one row per token | n × d_v |
| Q @ K^T | All pairwise query-key scores | n × n |
| d_k | Dimension of each key (and query) vector | scalar |
| sqrt(d_k) | The scaling divisor that keeps softmax sane | scalar |
| M | Mask, 0 for allowed positions and −infinity for disallowed | n × n |
| softmax(...) | Row-wise normalisation into weights | n × n |
| @ V | Weighted sum of values | n × d_v |

Some write the mask inside the softmax as I did; some fold it into the exponent. Same operation, different notation. Do not let a missing `+ M` in someone's formula make you think they omitted causality.

#### A worked example you can do on paper

Take three tokens, *d_k = 2*, and pretend the mask allows token 3 to see everything (as in an encoder, or during a single forward pass in training where we look at all positions at once).

```text
q_1 = [1, 0]     k_1 = [1, 0]     v_1 = [10, 0]
q_2 = [0, 1]     k_2 = [0, 1]     v_2 = [0, 10]
q_3 = [1, 1]     k_3 = [2, 0]     v_3 = [5, 5]
```

Scores for token 3: `q_3 · k_1 = 1`, `q_3 · k_2 = 1`, `q_3 · k_3 = 2`.

Scale by `sqrt(2) ≈ 1.414`: `0.707`, `0.707`, `1.414`.

Softmax: `exp` gives `2.028`, `2.028`, `4.113`; sum is `8.169`. Weights: `0.248`, `0.248`, `0.503`.

Output: `0.248 * [10,0] + 0.248 * [0,10] + 0.503 * [5,5] = [2.48 + 2.52, 2.48 + 2.52] = [5.00, 5.00]`.

Token 3 asked a question that matched key 3 best (its own), so it pulled mostly its own value, with an even contribution from the other two. Change `q_3` to `[1, 0]` and rerun it: now key 3 scores 2, key 1 scores 1, key 2 scores 0, and the weights shift toward tokens 1 and 3. That is the entire mechanism. It is dot products, a scale, a softmax, and a weighted average. There is no hidden magic below this layer.

**What this lets you predict.** Attention is a *content-addressed* lookup. The model does not retrieve by position ("the word four tokens back"); it retrieves by content ("whatever matches this query"). That predicts a real behaviour you have probably seen: models handle tasks that require matching a pattern anywhere in the context far better than tasks that require counting to an exact offset. It also predicts the famous "lost in the middle" effect, where information buried in the middle of a long context gets retrieved less reliably than information at the start or end. Nothing in the formula prefers the middle, but nothing protects it either, and the softmax has to divide attention among more and more competitors as context grows.

**Where it stops working.** Content-addressing is not reasoning. If the correct answer depends on a computation the model never learned to represent as a query-key match — precise arithmetic over many digits, tracking a state through a long chain of steps, counting occurrences exactly — attention gives you a smooth weighted average, not an algorithm. A weighted average over many similar candidates produces a blur, and blur is why models estimate "about seven" when you needed "exactly seven". Second: the softmax always sums to 1. Attention cannot choose to ignore everything. Even when no key is relevant, the weights have to go somewhere, so an irrelevant position still contributes. That is a structural source of hallucination, not a bug in a particular model. Third: everything above is about a *single* attention operation. Real models stack many of them, at every layer, with a small neural network between layers. The mechanism per layer is what I showed you; the depth is what turns "pattern matcher" into something that behaves like it is doing multi-step work.

### Part 3 — Multiple heads, and why one attention is not enough

So far, each token produces exactly one query, one key, and one value. That means each token gets exactly *one* distribution over the sequence. It can look for one thing at a time.

Language needs several things at once. In `the cat that the dog chased ran away`, resolving "ran" requires attending to "cat" syntactically while also tracking that "chased" is a subordinate verb. One weighted average has to compromise between those demands.

**Multi-head attention** solves this by splitting the *d_model*-dimensional vectors into *h* smaller pieces and running *h* independent attention operations in parallel. Each one is a **head**, with its own W_Q, W_K, W_V. If *d_model* is 512 and *h* is 8, each head works in 64 dimensions. Then you concatenate the head outputs back to *d_model* and multiply by an output projection W_O, which mixes the heads' findings together.

Two things are worth being precise about, because they are commonly garbled:

1. The heads are not "the grammar head", "the meaning head", "the position head". Interpretability research has found heads with strikingly specific roles in some models, but the roles are not assigned by design and most heads do not have a clean story. Treat named heads as an observation about particular trained models, not as an architecture guarantee.
2. Multi-head attention is *not* primarily a way to get more compute. Total work is roughly the same as a single head of full width, because you split the width as you multiply the head count. It buys *different subspaces*, not raw capacity.

> **Analogy:** a committee reading the same sentence, where each member is told to focus on a different kind of relationship — one tracks subject-verb agreement, one tracks which noun a pronoun refers to, one tracks nearby modifiers. They each write a short note, then a secretary merges the notes into one summary.
>
> **Where it breaks:** committee members are assigned roles; heads are not. Nobody tells head 3 to track pronouns — the model discovers whatever partition of the work reduces its training loss. Worse, if you delete a head at inference time the model often keeps working, because heads overlap in function. The committee analogy makes you expect a clean division of labour and clean failure when you remove a member. You get neither.

**What this lets you predict.** Heads explain why models can hold several simultaneous relationships in one layer, which is why a *single layer* of attention is already surprisingly capable at tasks like copying a token or matching brackets. It also explains why attention is so parallelisable: all heads across all positions compute at once, which is why transformers train so much faster on GPUs than the recurrent models they replaced, even though the recurrent model does asymptotically less arithmetic. The transformer does more work in a shape that hardware likes.

**Where it stops working.** Concatenation followed by W_O is a fixed mixing operation. The model cannot dynamically decide, per input, to route different problems to different heads; the partition is baked in at training time. And more heads is not monotonically better: with a fixed *d_model*, each head gets narrower as *h* grows, and a very narrow head has less room for a meaningful subspace. As of early 2026, most production models use head counts and head dimensions chosen by scaling experiments rather than by principle — a number that is stable in practice but not derivable from first principles, and one that changes between model generations.

### Part 4 — Position: the thing attention cannot see

Here is a fact that surprises almost everyone the first time: **the attention computation described above is permutation-invariant.** If you shuffle the input tokens' order, the set of outputs is the same set — just relabelled. Nothing in a dot product knows that token 5 comes after token 4.

Do not take my word for it; this is the single most valuable thing to check yourself in the whole phase. Build the Q, K, V matrices for a three-token sequence, compute the outputs, then permute the rows of Q, K, V by the same permutation and recompute. The outputs come back permuted identically. The model literally cannot tell "dog bites man" from "man bites dog" from the arithmetic alone.

That is a fatal defect for language. Word order carries most of the syntax and a lot of the meaning.

The fix is to inject position into the vectors. Three approaches matter:

**Sinusoidal encodings.** The original approach: for each position *p* and each dimension index, add a fixed value derived from sine and cosine functions of different frequencies. Low dimensions oscillate fast, high dimensions oscillate slowly — like the digits of a clock, where some digits change every second and others once a day. This gives every position a distinct, smooth fingerprint, and it extrapolates in a mathematically pretty way.

**Learned positions.** Simpler: give the model a lookup table of one position vector per slot up to the maximum context length, and let training fill it in.

**Rotary position embeddings (RoPE).** The approach used by essentially every major open and closed LLM as of early 2026, though the specific variants and scaling tricks differ by model and change frequently. Instead of *adding* a position vector, RoPE *rotates* the query and key vectors by an angle proportional to their position, in pairs of dimensions. The trick is that the dot product between a rotated query and a rotated key depends only on the *relative* angle between them — that is, on the distance between the two tokens. So the score `q_i · k_j` automatically becomes a function of `i − j`.

> **Analogy:** sinusoidal encodings are like stamping each token with a timestamp before filing it. RoPE is like turning each token on a turntable by an amount set by its position, so that what matters when two tokens meet is the angle between them, not their absolute headings.
>
> **Where it breaks:** the timestamp analogy suggests you can read the position back out of the vector, and with additive encodings you roughly can. With RoPE you cannot — the position information only exists as a relationship. Also, "depends only on relative distance" is a property of the *dot product*, not of the vectors, so you cannot inspect a single RoPE-encoded key and say where it came from. And the whole scheme degrades for positions far beyond what training covered; extending context length is a real engineering problem, not a free parameter, which is why you see named "context extension" techniques rather than models simply declaring longer windows.

**What this lets you predict.** Relative-position schemes are why a model trained with a shorter context can sometimes be stretched to a longer one, with some quality loss and some engineering effort — the mechanism generalises partially. It also predicts an important failure: if a model is trained on short sequences and you feed it long ones, position handling degrades in ways that are not obvious from the output text quality on a short question. A model can answer a simple question about a 200k-token document while quietly ignoring material in the middle.

**Where it stops working.** Position encoding fixes *ordering*, not *distance reasoning*. A model that knows token A precedes token B by 40,000 positions does not thereby reason "40,000 positions ago, so this is an old topic". There is no clock in the model, only geometry. And every positional scheme has a range beyond which it was never trained; that range is a hard practical limit regardless of what a context window claims.

### Part 5 — The KV cache: the concept beginners are missing

Now the part that pays for the whole phase.

#### The problem: generation is one token at a time

When a model writes a response, it does not produce the whole answer at once. It produces one token, appends it to the sequence, then runs the *entire model again* over the whole sequence to produce the next token. Repeat.

So consider generating the 500th token of a reply. The input to this forward pass is all 500 tokens plus everything before them. Without any optimisation, the model would recompute the keys and values for **all** of those tokens — every layer, every head — even though those keys and values were already computed on the previous step and have not changed.

Here is the key insight, and it is worth stating plainly:

> For a token at position *j*, its key `k_j` and value `v_j` depend only on the token's own embedding and the layer's weight matrices. They do **not** depend on any later token. So once computed, they are final. The query is the only thing that must be recomputed each step, because the query belongs to the newest token.

Causality, which we introduced as a mask, is exactly what makes the cache possible. In a non-causal model, changing token 500 would change the keys and values of every earlier token, and caching would be impossible. Causal masking is not just a training convenience; it is the precondition for cheap inference.

#### The mechanism: store K and V, compute only the new row

The **KV cache** is the memory that holds the keys and values for every token already processed, at every layer. On each step:

1. Compute the query, key, and value for the *new* token only.
2. Append the new key and value to the cache.
3. Score the new query against *all* cached keys.
4. Softmax, and take the weighted sum over *all* cached values.
5. Emit the next token, and repeat.

This turns generation from "recompute everything, every step" into "compute one row, every step". The saving is enormous — without it, generating a 1,000-token reply would cost on the order of 1,000× more work than with it.

But you have not made the *per-step* cost constant. Even with the cache, step *n* must score its query against all *n* cached keys. So per-step attention work grows linearly with how much has been generated. Total generation work over a reply of length *n* grows like *n²*. The cache converts an *n³* process into an *n²* one — a massive win that is still quadratic. That is the honest version of the story.

#### The memory footprint, and how to estimate it

The cache is not free; it is *memory that grows with every token you generate*. Here is the formula you should be able to reconstruct rather than memorise:

```text
kv_bytes = 2            # one K tensor and one V tensor
         * L            # number of layers
         * H_kv         # number of key/value heads (NOT query heads)
         * d_head       # dimension per head
         * n_tokens     # sequence length, including prompt + generated
         * bytes_per_value   # 2 for fp16/bf16, 1 for fp8/int8
```

The factor of 2 is the easiest thing to forget and doubles your answer when you do.

A worked estimate. Suppose a model has 32 layers, 32 query heads but 8 key/value heads, head dimension 128, and stores in 16-bit precision (2 bytes):

```text
per token per layer = 2 * 8 * 128 * 2 = 4,096 bytes = 4 KB
per token, all layers = 4 KB * 32 = 128 KB
at 8,000 tokens = 128 KB * 8,000 = 1,024,000 KB ≈ 1.0 GB
```

One conversation, 8,000 tokens of history, about a gigabyte of cache. Now push it to 128,000 tokens: roughly 16 GB. **The cache alone can exceed the model weights.** That single sentence explains a large fraction of why long-context serving is hard and expensive, and why providers meter long contexts so carefully.

Three consequences follow directly, and you should be able to derive each one:

- **Longer conversation costs more memory, monotonically.** Not more compute per token in the same way — more *memory held for the lifetime of the request*.
- **More concurrent users cost more memory, multiplicatively.** A server serving 50 simultaneous conversations multiplies that cache by 50 (ignoring prefix sharing). This is why inference throughput is memory-bandwidth-bound and why batching strategies matter so much.
- **Precision directly halves or doubles it.** fp8 KV cache is a real, widely used optimisation with real quality trade-offs.

#### Grouped-query attention: the one number that changes

Look back at the formula. Everything is fixed by the architecture except `H_kv`. So the cheapest lever on cache size is *how many key/value heads you keep*.

- **Multi-head attention (MHA):** one key/value head per query head. `H_kv = H_q`. Biggest cache, best quality headroom.
- **Multi-query attention (MQA):** all query heads share a *single* key/value head. `H_kv = 1`. Cache shrinks by a factor of `H_q` — in our example, 32×, from 1 GB to 32 MB. Quality can suffer noticeably.
- **Grouped-query attention (GQA):** the middle ground. Query heads are divided into groups; each group shares one key/value head. `H_kv` is some number between 1 and `H_q`, commonly a quarter or an eighth of it.

In the example above, `H_kv = 8` versus `H_q = 32` is exactly GQA with a group size of 4, and it cuts the cache by 4× compared with full MHA. As of early 2026, GQA is the default in most widely used open-weight and hosted models — but the specific ratios differ per model and per generation, and some newer architectures change the picture again with different attention variants, so verify against a current model card rather than assuming.

**What this lets you predict.** Given a model card listing layers, query heads, KV heads, and head dimension, you can estimate cache memory for any conversation length, and therefore estimate how many concurrent conversations fit on a given GPU. You can also predict why a provider's long-context tier costs what it does, and why "just use a bigger context window" is not free. When you read about a new model advertising a huge context at low cost, the first question to ask is what its `H_kv` and precision are.

**Where it stops working.** Shrinking the KV cache is not free quality-wise — fewer KV heads means several query heads must share the same stored information, which is a real information bottleneck. It works because several query heads often want similar things, not because the information was redundant in general. Second, the KV-cache model I gave you assumes a standard dense transformer with full attention at every layer. Architectures that mix in sliding-window, sparse, or state-based layers have different and often much smaller caches, and the simple formula will mislead you there. Third, the formula counts memory for K and V only. Real serving stacks add fragmentation, allocator overhead, and the space needed for the batch, so measured memory runs meaningfully above the estimate. Use the formula for orders of magnitude and ratios, never as an exact budget.

#### Prefill and decode: two phases, two bottlenecks

Once you have the cache, an asymmetry becomes visible that explains a lot of API behaviour.

| | Prefill | Decode |
|---|---|---|
| What happens | The whole prompt is processed at once | One token at a time, output appended |
| Attention shape | n × n — all pairs, in parallel | 1 × n — one query against all cached keys |
| Bottleneck | Compute (big matrix multiplies) | Memory bandwidth (reading the whole cache per token) |
| KV cache | Built up from nothing | Read and appended |
| Your prompt length affects | This, directly | The per-token read cost of the cache |

This is why a large prompt and a small prompt have very different latency profiles, why time-to-first-token scales with prompt length, and why output tokens are typically priced higher than input tokens. Decode is inefficient: each generated token forces the server to read the entire cache, so the hardware is starved for bandwidth rather than compute.

**Where this model stops working.** Real serving systems batch many requests together, and the compute-versus-bandwidth split shifts with batch size. At large batch sizes, decode can become compute-bound again and the neat table above stops predicting latency. Treat it as the right mental model for a single request and a rough one for a busy server.

### Part 6 — The KV cache is not prompt caching (get this right)

This distinction is load-bearing for the Cost track, and conflating the two will make provider pricing pages unreadable.

**The KV cache is automatic, server-side, per-request, and not billed as a separate line item.** It exists because generation is sequential, it lives for the duration of one request, and it is discarded when the request ends. You do not enable it, configure it, or pay for it by name. It is simply how the model runs.

**Provider prompt caching is a product feature.** It is opt-in or semi-automatic, it operates *across* requests, and it is explicitly billed. The idea: if many of your requests share a long identical prefix — a system prompt, a document, a few-shot example block — the provider can keep the computed state for that prefix and reuse it instead of reprocessing it. Providers typically charge *less* for a cache hit than for fresh input tokens, and may charge a *premium* to write into the cache in the first place, with the cached entry expiring after a short time window.

Here is the comparison, and this is the table to remember:

| | KV cache | Provider prompt caching |
|---|---|---|
| Where it lives | Inside the serving engine | A provider feature built on top of that |
| Scope | One request, one conversation | Across separate requests |
| Lifetime | The request | A provider-defined window, often minutes |
| Enabled by you? | No — it is how inference works | Usually yes, either implicitly or explicitly |
| Billed? | No separate charge; it is why long context costs more | Yes — hits cheaper than fresh input, writes may cost a premium |
| What it optimises | Making generation possible at reasonable cost | Making *repeated prefixes* cheap |
| Fails when | Never; it is the mechanism | Your prompt prefix differs at the start, so nothing matches |

Two practical consequences. First, the ordering of your prompt determines whether prompt caching helps at all: caching matches on a *prefix*, so anything that varies must go at the *end*. Put your fixed instructions first and your per-request user text last. Second, a cache hit is a *billing and latency* event, not a *quality* event — the model's output should be identical either way, because the reused state is the same state. If you ever see different output for a cached versus uncached prefix, that is a bug or an approximation in the provider's implementation, not something to design around.

> **Analogy:** the KV cache is your own working memory while solving one problem — you do not re-derive everything you already figured out. Prompt caching is a shared whiteboard in the office that several people reuse when they all start from the same diagram.
>
> **Where it breaks:** working memory is free and effortless; the KV cache consumes real GPU memory proportional to every token, and it is precisely what makes long contexts expensive rather than cheap. And the whiteboard gets erased after a while, but the cost of a miss is invisible to you — you only notice it on the bill and in latency. Also, unlike a whiteboard, you cannot read the cached state or inspect what was kept.

As of early 2026, several major providers offer prompt caching with different names, minimum prefix lengths, cache lifetimes, and pricing multipliers, and these details change often. Verify the current terms on the provider's own documentation before you build a cost model on them.

### Part 7 — Why attention is O(n²), and where that stops mattering

The score matrix is *n × n*. Double your context length and you quadruple the pairwise work. That is the quadratic term, and it appears in the prefill phase — processing the prompt — and in the memory needed for intermediate scores.

Three things are commonly conflated here, and separating them is the point of this part:

1. **Attention compute during prefill** is O(n²) in the sequence length.
2. **Attention compute during decode** is O(n) per generated token, and O(n²) over the whole generation.
3. **KV cache memory** is O(n) in sequence length — linear, not quadratic. It is the *product* of a linear term with the number of concurrent requests that gets you into trouble.

People say "attention is quadratic" as though it settles the question of long context. It does not. Here is why:

- The feed-forward network between attention layers — the small neural net at each layer — is O(n) in sequence length but with a *large* constant, typically far more total arithmetic than attention at moderate lengths. For a long time, and for many practical context lengths, attention was not the dominant cost at all.
- The quadratic term has a small constant relative to the linear terms, so it only dominates past some crossover point. Where that crossover sits depends on the model, the hardware, and the lengths involved — not something to assert as a universal number.
- Implementations matter enormously. Memory-efficient attention kernels avoid materialising the full *n × n* score matrix, which changes the memory story substantially while leaving the arithmetic count alone. That is why a model can handle a context that would obviously blow up if you literally built the score matrix.
- A large family of techniques — sliding-window attention, sparse patterns, and recurrent or state-based layers — reduce the effective exponent at some cost in what the model can retrieve. Their existence tells you the quadratic term is real and worth engineering around. It does not tell you which technique wins; as of early 2026 this is an active area and the "best" answer shifts between model generations.

**What this lets you predict.** Prompt length affects prefill latency and cost superlinearly; that is why extremely long prompts feel disproportionately slow. Generation length affects total cost quadratically but each step only linearly, which is why a long chat degrades gradually rather than falling off a cliff. And KV cache memory — the linear one — is what caps how many long conversations a server can hold at once.

**Where it stops working.** Do not quote "attention is O(n²)" as the reason a specific model is slow. At short contexts it is simply not the bottleneck; at long ones, memory bandwidth and cache pressure often bite before raw arithmetic does. And asymptotics are statements about limits, not about the length you are actually using. A model with a 200k-token window answering a 2,000-token question is nowhere near the quadratic regime that matters, even though the label is technically true.

### Part 8 — What you should now be able to do

If this phase landed, you can now do the following without looking anything up. Read a model card and identify layers, query heads, KV heads, and head dimension, and compute the KV cache size for a given conversation length. Explain why your second message in a chat is cheaper than your first. Explain why the ordering of a prompt determines whether prompt caching helps. Explain why a model cannot tell "dog bites man" from "man bites dog" without positional information. Explain why dividing by the square root of the head dimension is not cosmetic. And explain, in your own words, why deleting an attention head sometimes changes nothing.

Where this phase stops: it tells you the shape of the computation and its costs. It does not tell you how the model *decides* what to say next — that is Phase 5, sampling. It does not tell you how meaning gets into the embeddings in the first place — that is Phase 6. And it does not tell you how to read a model's output critically — Phase 7. Those three phases take the machine you just built apart from three different angles.

## Hands-on practice tasks

1. Implement scaled dot-product attention from scratch in NumPy, with no machine-learning library, for a random sequence of 5 tokens with d_k = 8 and d_v = 8. Verify your weight rows each sum to 1.0 within floating-point tolerance. <!-- id: found-04-attention-and-kv-cache-t01 band: quick energy: normal -->
2. Do the three-token worked example in Part 2 entirely on paper, then reproduce it in code and check your hand arithmetic matches. Then change q_3 to [1, 0] and predict the new weights *before* running it. <!-- id: found-04-attention-and-kv-cache-t02 band: focused energy: normal -->
3. Prove permutation-invariance to yourself: compute attention outputs for a 4-token sequence, then permute the input rows, recompute, and confirm the outputs are the same permutation of each other. Write two sentences in your notes on why this means position must be injected. <!-- id: found-04-attention-and-kv-cache-t03 band: focused energy: normal -->
4. Write a small function `kv_bytes(layers, kv_heads, head_dim, tokens, bytes_per_value)` and use it to produce a table of cache sizes for 1k, 4k, 16k, 64k, and 128k tokens, for a model with 32 layers, 8 KV heads, head dim 128, at 2 bytes and at 1 byte. Note the ratio between the two precisions. <!-- id: found-04-attention-and-kv-cache-t04 band: focused energy: normal -->
5. Open three real model cards on Hugging Face from different families. For each, record layers, hidden size, query heads, and KV heads from the config. Compute the cache size per 1,000 tokens for each, and rank them. Note any card where a number you expected is not published. <!-- id: found-04-attention-and-kv-cache-t05 band: deep energy: high -->
6. Read the prompt-caching documentation of two different providers. Build a small table comparing: minimum cacheable prefix length, cache lifetime, cost of a cache write, and cost of a cache hit, relative to normal input pricing. Do not memorise the numbers — record the date you read them. <!-- id: found-04-attention-and-kv-cache-t06 band: deep energy: normal -->
7. Design a prompt layout for an assistant that gets 500 requests a day with the same 4,000-token instruction block and a different user question each time. Write out the exact ordering of the prompt and explain in three sentences which parts are cacheable and which are not, and what would break caching. <!-- id: found-04-attention-and-kv-cache-t07 band: focused energy: normal -->
8. Keep a week-long log: every time you use an LLM, note whether the interaction felt slow at the start (prefill-dominated) or slow per token during output (decode-dominated), and whether a long conversation seemed to degrade. At the end of the week, write a paragraph connecting each observation to a mechanism from this phase. <!-- id: found-04-attention-and-kv-cache-t08 band: ongoing energy: low -->

## Common Pitfalls

- **Forgetting the factor of 2 in the KV cache formula.** You are storing both keys and values. Half the mistakes people make when estimating cache size come from this one omission.
- **Using query head count instead of KV head count.** In a GQA model these differ, and using `H_q` overestimates the cache by the group size — commonly 4× or 8×.
- **Confusing the KV cache with prompt caching.** One is an inference mechanism, the other is a billed product feature. If you write "the KV cache saves me money across requests", you have merged them.
- **Thinking multi-head attention multiplies the compute by the head count.** It splits the width, so total work is roughly constant. What varies is the shape and the number of independent subspaces.
- **Believing attention has an inherent notion of order.** It does not. Position is added or rotated in, and if you remove that step the model becomes order-blind.
- **Treating the quadratic cost as the universal explanation for slowness.** At short contexts, the feed-forward layers and memory bandwidth usually dominate. Match the explanation to the regime.
- **Quoting model architecture numbers as permanent facts.** Head counts, context sizes, and caching policies all change between model generations. Record the date when you write a number down.
- **Assuming a cache hit changes the answer.** Prompt caching is a latency and billing optimisation. If output changes, that is an implementation artefact, not a feature to exploit.

## Deliverable / proof of work

Write `portfolio/foundations/04-attention-and-kv-cache.md` containing:

1. **The formula, in your own handwriting or your own LaTeX.** Get the mask term in there. Then write a symbol table like the one in Part 2, but in your own words, without copying mine.
2. **One hand-worked attention example.** Photo or transcription of your paper arithmetic for a three-token case, including the softmax step. Show the numbers, not just the result.
3. **A KV cache sizing table.** At least five sequence lengths, at least two precisions, with the formula stated and the factor of 2 visible in the working.
4. **A real comparison.** One paragraph comparing the KV cache formula's estimate against a measured or published figure for real hardware or a real provider tier, and a sentence on where the discrepancy comes from.
5. **The KV cache versus prompt caching table**, written by you, with a short explanation of which one a provider bills and why.
6. **A prediction you got wrong.** Describe one thing in this phase that contradicted what you expected before reading it, and what the mechanism actually implies. This is the most valuable section — include it even if it is only three sentences.

## Checklist

- [ ] I can write scaled dot-product attention from memory and explain every symbol in it <!-- id: found-04-attention-and-kv-cache-c01 energy: normal -->
- [ ] I can explain why there are three projections (Q, K, V) rather than one, without hand-waving <!-- id: found-04-attention-and-kv-cache-c02 energy: normal -->
- [ ] I can explain what breaks if you remove the divide by the square root of the head dimension <!-- id: found-04-attention-and-kv-cache-c03 energy: normal -->
- [ ] I have hand-computed a complete attention output for at least three tokens, including softmax <!-- id: found-04-attention-and-kv-cache-c04 energy: high -->
- [ ] I have personally verified that attention without positional information is permutation-invariant <!-- id: found-04-attention-and-kv-cache-c05 energy: normal -->
- [ ] I can explain multi-head attention without claiming the heads have designed roles <!-- id: found-04-attention-and-kv-cache-c06 energy: normal -->
- [ ] I can describe what RoPE rotates and why the resulting dot product depends on relative position <!-- id: found-04-attention-and-kv-cache-c07 energy: normal -->
- [ ] I can state, from memory, why the KV cache is valid: keys and values of past tokens never change <!-- id: found-04-attention-and-kv-cache-c08 energy: normal -->
- [ ] I can write the KV cache memory formula and name each factor, including the factor of 2 <!-- id: found-04-attention-and-kv-cache-c09 energy: normal -->
- [ ] I have estimated KV cache size for a real model at two different sequence lengths and two precisions <!-- id: found-04-attention-and-kv-cache-c10 energy: high -->
- [ ] I can explain how grouped-query attention reduces the cache and what it costs in quality headroom <!-- id: found-04-attention-and-kv-cache-c11 energy: normal -->
- [ ] I can distinguish prefill from decode and say which resource each is bound by <!-- id: found-04-attention-and-kv-cache-c12 energy: normal -->
- [ ] I can explain the difference between the KV cache and provider prompt caching in one sentence each <!-- id: found-04-attention-and-kv-cache-c13 energy: normal -->
- [ ] I understand why prompt prefix ordering determines whether prompt caching helps at all <!-- id: found-04-attention-and-kv-cache-c14 energy: normal -->
- [ ] I can explain the O(n squared) term, and name the situation where it is not the bottleneck <!-- id: found-04-attention-and-kv-cache-c15 energy: normal -->
- [ ] I have written the deliverable file and included a prediction I got wrong <!-- id: found-04-attention-and-kv-cache-c16 energy: high -->

## Quiz

### Q1. In a decoder-only model, why is the key and value for an earlier token not recomputed on the next generation step? <!-- id: found-04-attention-and-kv-cache-q01 energy: normal -->

- [ ] Because the model reuses the previous step's full output tensor wholesale
- [ ] Because the server stores the token text and hashes it
- [x] Because causal masking means a token's key and value depend only on tokens at or before it, so they never change once computed
- [ ] Because the provider's prompt caching keeps them alive across requests

**Why:** Causality is what makes caching valid. A key or value at position j is a function of the embeddings up to j and the layer weights, both fixed. This is also why non-causal models cannot use the same trick.

### Q2. Attention work during prefill grows with the square of the sequence length, while KV cache memory grows with the first power of it. Which statement about that difference is correct? <!-- id: found-04-attention-and-kv-cache-q02 energy: high -->

- [ ] Both quantities are quadratic, so the distinction is cosmetic
- [ ] The KV cache is quadratic because it stores a score for every token pair
- [x] The score matrix has one entry per token pair, while the cache stores a fixed number of bytes per token per layer
- [ ] The KV cache is linear only because grouped-query attention removes the quadratic term

**Why:** The n×n object is the pairwise score matrix produced during prefill; the cache is a per-token, per-layer block of key and value bytes, so it scales with n. Grouped-query attention reduces the constant factor on that linear term, not the exponent. Keeping these three quantities separate — prefill compute, total generation compute, and cache memory — prevents most confused cost reasoning.

### Q3. What does dividing the attention scores by the square root of the key dimension actually accomplish? <!-- id: found-04-attention-and-kv-cache-q03 energy: normal -->

- [ ] It normalises the output vectors to unit length
- [ ] It makes the attention weights uniform across positions
- [ ] It reduces the number of operations from quadratic to linear
- [x] It keeps score magnitudes from growing with dimension, preventing softmax from saturating and killing gradients

**Why:** Dot products accumulate variance roughly with the dimension, so unscaled scores get large, softmax becomes extremely peaked, and gradients vanish. The scaling is a variance correction, not a normalisation of the output or a complexity change.

### Q4. Which statement correctly separates the KV cache from provider prompt caching? <!-- id: found-04-attention-and-kv-cache-q04 energy: normal -->

- [ ] The KV cache is billed per token; prompt caching is free
- [x] The KV cache is an automatic per-request inference mechanism, while prompt caching is a billed feature that reuses a prefix across requests
- [ ] They are two names for the same thing at different scales
- [ ] The KV cache works across requests; prompt caching only within one

**Why:** The KV cache is how generation works at all and is not a separate line item. Prompt caching is a product layered on top, spanning requests, with a defined lifetime, usually a cheaper hit price and sometimes a premium write price.

### Q5. Why can a transformer not distinguish "dog bites man" from "man bites dog" without positional information? <!-- id: found-04-attention-and-kv-cache-q05 energy: normal -->

- [ ] Because the tokenizer assigns identical ids to both sentences
- [ ] Because softmax discards ordering when it normalises the weights
- [x] Because attention is permutation-invariant — reordering the inputs merely reorders the outputs
- [ ] Because the KV cache is built in generation order

**Why:** Dot products contain no notion of index. Permuting the input rows permutes the outputs identically, so the computation is blind to order until position is added or rotated into the vectors. The tokenizer gives different ids for different orders, so that is not the cause.

### Q6. In the prefill phase versus the decode phase, which pairing of bottleneck and resource is correct? <!-- id: found-04-attention-and-kv-cache-q06 energy: normal -->

- [ ] Prefill is memory-bandwidth bound; decode is compute bound
- [ ] Both are purely bandwidth bound
- [x] Prefill is compute bound on large matrix multiplies; decode is typically memory-bandwidth bound because it reads the whole cache per token
- [ ] Both are limited by network latency to the provider

**Why:** Prefill processes all prompt positions in parallel, which is arithmetic-heavy. Decode produces one token at a time and must read the entire KV cache for each one, so it starves on bandwidth — at least for a single request. With very large batches the balance shifts back toward compute, which is why this is a model, not a law.

### Q7. What does grouped-query attention change relative to full multi-head attention? <!-- id: found-04-attention-and-kv-cache-q07 energy: normal -->

- [ ] It removes the softmax from attention
- [ ] It reduces the number of layers in the model
- [ ] It makes attention sub-quadratic in sequence length
- [x] It makes several query heads share one key/value head, shrinking the KV cache by the group size

**Why:** GQA leaves the query side alone and reduces the number of distinct key/value heads, which is the multiplier on cache size. It does not change the attention formula's complexity, the layer count, or the softmax.

### Q8. Your team reuses a 5,000-token instruction block across thousands of requests but prepends a timestamp to the very start of the prompt. What is the consequence? <!-- id: found-04-attention-and-kv-cache-q08 energy: normal -->

- [ ] Nothing; prompt caching matches on content anywhere in the prompt
- [x] Prompt caching matches on a prefix, so the varying timestamp at the start invalidates the whole cached block
- [ ] The KV cache grows but prompt caching is unaffected
- [ ] Caching still works but at half the discount

**Why:** Prefix caching compares from the beginning and stops at the first divergence. Anything variable must go at the end, after all the stable material. This is the single most common practical mistake with prompt caching.

### Q9. Which quantity scales linearly, not quadratically, with sequence length? <!-- id: found-04-attention-and-kv-cache-q09 energy: normal -->

- [ ] The number of pairwise query-key scores in prefill
- [ ] The total attention arithmetic over a full generation of n tokens
- [x] The KV cache memory for a single sequence
- [ ] The size of the score matrix before softmax

**Why:** Cache memory is O(n): it stores a fixed number of bytes per token. The score matrix and prefill pairwise work are O(n²), and total generation arithmetic is also O(n²) across the whole reply. Keeping these three separate prevents a lot of confused cost reasoning.

### Q10. Which is the best reason to be cautious about claiming "this model is slow because attention is quadratic"? <!-- id: found-04-attention-and-kv-cache-q10 energy: normal -->

- [ ] Attention is actually linear in all modern implementations
- [ ] The quadratic term only exists in encoder models
- [ ] Quadratic costs only matter above one million tokens
- [x] At realistic context lengths other costs often dominate, and asymptotics describe a limit rather than your actual operating point

**Why:** The feed-forward layers, memory bandwidth, and cache pressure frequently dominate at the lengths people actually use. The quadratic term is real and worth engineering around, but quoting it as the cause of a specific latency number without checking the regime is a non-explanation.

## You're ready to move on when...

- You can write `softmax(Q K^T / sqrt(d_k) + M) V` from memory and explain each term, including why the mask is there.
- You have hand-computed at least one full attention output, softmax and all, and it matched your code.
- You have personally observed permutation-invariance by running the permutation test, not just read about it.
- You can write the KV cache memory formula and use it on a real model card without looking it up.
- You can explain in one sentence each: what the KV cache is for, what GQA changes, and how prompt caching differs from both.
- You can say which of prefill or decode a given symptom points to, and name a case where your answer would be wrong.
- You have a dated note in your portfolio recording any architecture or pricing number you wrote down, and you know it may already be stale.
- Your deliverable file exists at `portfolio/foundations/04-attention-and-kv-cache.md` and includes a prediction you got wrong.

## Free vs Paid

Everything in this phase can be completed for **zero pesos**.

**What is genuinely free.** Python, NumPy, Jupyter, and VS Code cost nothing. The original transformer paper, the Annotated Transformer, Karpathy's video and nanoGPT repository, the Illustrated Transformer, and the Hugging Face LLM course are all free to read or watch. Hugging Face model cards — which is where you will get the real layer counts and KV head counts for Task t05 — are free to browse without an account. Provider pricing and prompt-caching documentation pages are free to read, and reading two of them side by side is one of the highest-value free activities in this phase. You do not need a GPU: every calculation here is small matrix arithmetic that a laptop CPU handles instantly.

**What costs money, and whether you need it.**

- **A GPU.** Only useful if you want to *measure* real memory usage during generation rather than compute it. Google Colab offers a free tier with a small GPU, which is enough for a tiny model. You do not need this to finish the phase; the formula and a calculator carry you most of the way.
- **Paid API access.** Needed only if you want to *observe* prompt caching on a real provider, since you cannot see a cache hit without a bill. Free tiers on several providers exist and change frequently. If you spend nothing, Task t06 — reading two providers' documentation — still gives you the full conceptual picture, just not a measured invoice.
- **A course.** There are paid courses on transformers. As of early 2026 the free resources listed above cover this material at least as well as most paid introductions, because the material itself is public and well documented. Pay only if you specifically want structure, deadlines, or a certificate — not for the content.
- **Cloud notebook credits.** Not needed. If you find yourself wanting to rent a large GPU to "understand attention better", you have misunderstood the phase; the understanding lives in the hand computation, not in the hardware.

**The honest budget:** ₱0, roughly 16–24 hours over two weeks, and a notebook. If you have ₱0 but a working laptop and an internet connection, nothing here is out of reach. The one thing money buys that genuinely helps is API access for seeing a cache hit on a real bill — and even that is optional, because the mechanism is fully explainable from the documentation.
