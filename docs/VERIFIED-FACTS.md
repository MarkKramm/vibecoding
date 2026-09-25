# Verified Facts, Debunked Claims, and Volatile Figures

**Purpose.** This document is the fact-checking backbone of the curriculum. It records:

1. **Debunked claims** — things widely repeated in AI writing that are *wrong*, with the correction and how it was verified.
2. **Volatile figures** — facts that are true but change often, so every appearance in a lesson must be dated.
3. **Verified citations** — papers and sources confirmed against a primary source, with correct identifiers.
4. **Unverified items** — claims nobody has confirmed, which must not be taught as fact.

**Why this exists.** The single most damaging thing a technical curriculum can do is teach a confident falsehood, because the reader has no way to tell it apart from the true claims around it. A curriculum that admits a gap is trustworthy about its other claims; one that invents a number has no credibility left for any of them.

**The authoring rule that follows from this:** before writing a specific claim into a lesson, check it here. If it is in the debunked list, teach the correction. If it is in the volatile list, date it and make the lesson's point survive the number being wrong. If it is unverified, mark it `**Unverified**` rather than asserting it.

> **Sourcing note.** The research behind this document was gathered without a working web-search endpoint, by fetching primary sources directly. That creates a **selection bias**: sources reachable by direct URL were checkable, while paywalled, JavaScript-rendered, or unlinked material was not. Several items therefore remain `**Unverified**` rather than guessed. A future pass with search access should revisit that list specifically.
>
> **Update, 2026-09-25 — that pass was done, without search access, and it worked anyway.** The
> bias above turned out to be beatable: every §2.2 tokenizer claim was confirmed by fetching the
> counting code itself, and the §4 WordPiece entry was *resolved* by reading two public
> implementations (see §4.1). The lesson is that **`**Unverified**` often means "we had not yet
> looked in the right place," not "this cannot be known," and that source code is a more
> decisive primary source than prose documentation — it cannot paraphrase. Two of the remaining
> unverified items (OSAID clause text, some model licences) genuinely require the unreachable
> document and stay open. §4.1 also records the more useful outcome: the reason WordPiece's merge
> criterion was unfindable is that **two algorithms share the name and only the inference one was
> ever released** — a finding that could only be stated after failing to find it.

---

## 1. Debunked claims — teach the correction

These are each widely repeated, each plausible, and each **contradicted by the primary source**. Several appear in this curriculum's own first draft of the research brief, which is why they are recorded here rather than quietly dropped.

### 1.1 The vLLM "60–80% of KV cache is wasted" figure is an inversion

**The claim:** "PagedAttention showed that 60–80% of KV cache memory is wasted."

**The correction:** The PagedAttention paper reports **utilisation**, not waste — measured at **20.4% to 38.2%**. Reading those as waste inverts the finding completely: the paper's point is that memory utilisation was *low*, not that a specific large fraction was wasted.

**Also correct:** the throughput result is **"2–4× higher throughput than FasterTransformer and Orca at the same latency level"**. There is no single multiplier — the two comparisons are separate, and the range applies to both.

**Verified against:** the PagedAttention / vLLM paper (Kwon et al., SOSP 2023).

**Why it matters for teaching:** the mechanism (paging KV cache into blocks to eliminate fragmentation) is the durable lesson. A lesson that leads with an inverted statistic has taught a number instead of the idea, and taught it wrong.

### 1.2 "Lost in the Middle" is not a "20% drop"

**The claim:** "Models lose 20% accuracy when relevant information is in the middle of the context."

**The correction:** That is not the paper's framing. The paper's anchor finding is that **middle-position accuracy falls below GPT-3.5-Turbo's 56.1% closed-book accuracy** — that is, in the middle of a long context, the model can do **worse than if it had no documents at all**. That is a considerably more striking and more precise claim than "a 20% drop", and it is the one the authors make.

**Also correct:** the experiments used document counts of **10, 20 and 30** — not 20 alone. The count matters because the degradation is a function of context length, so quoting one number misrepresents the setup.

**Verified against:** Liu et al., *Lost in the Middle: How Language Models Use Long Contexts*, arXiv:2307.03172 (2023).

**Teaching note:** modern long-context models have improved substantially, and the exact curve is model-specific. Teach the **qualitative** result — the middle of a long context is the weakest region, and adding documents can make things worse — while dating any specific curve.

### 1.3 Speculative decoding is distribution-exact, not "identical output"

**The claim:** "Speculative decoding produces identical output to normal decoding."

**The correction:** It is **distribution-exact** — the output distribution is preserved — and that is a weaker and more precise claim than "identical output". It holds only under four conditions:

1. The draft model's distribution `q` must be **exact**, not approximate.
2. The accept/reject/resample rule must be **exactly** the specified one.
3. Sampling must be **cast to an adjusted distribution** before the accept step.
4. Per Chen et al., the guarantee is **"within hardware numerics"** — floating-point arithmetic means bit-identical output is not promised.

**Also correct:** naive rejection sampling is **not** lossless. And **only Medusa-1 is claimed lossless — not Medusa-2.**

**Verified against:** Leviathan et al. (speculative decoding) and the Medusa paper, plus Chen et al.

**Why it matters:** this is a case where a simplified version of a true claim becomes a false one. "Same distribution" and "same output" are different promises, and a reader who needs the guarantee needs to know which they have.

### 1.4 `rope_theta` is a config convention, not a RoPE-paper fact

**The claim:** "Modern models all use `rope_theta = 1e6`."

**The correction:** `rope_theta` is an **Hugging Face / vLLM configuration convention**, not a fact from the RoPE paper. Verified values in real models span a wide range:

| Value | Model(s) |
|---|---|
| `1e4` (10,000) | DeepSeek-V3 / R1 (with YaRN) |
| `5e5` (500,000) | Llama-3-8B |
| `1e6` (1,000,000) | Mixtral, Qwen3 |

So "all modern models use 1e6" is **false**, and the paper itself does not specify a value.

**Verified against:** model configuration files, and the RoPE paper (Su et al., arXiv:2104.09864) for what it does and does not state.

### 1.5 Attention scales by `sqrt(d_k)`, the key dimension

**The claim:** "Attention is scaled by the square root of the model dimension."

**The correction:** the scaling factor is **`sqrt(d_k)`** — the **key** dimension (equivalently the per-head dimension), **not** `d_model`, the model's hidden size. In a multi-head model these differ by a factor of the head count, so confusing them produces a wrong formula.

**Verified against:** Vaswani et al., *Attention Is All You Need*, arXiv:1706.03762.

### 1.6 Matryoshka Representation Learning did **not** win a NeurIPS 2022 Outstanding Paper Award

**The claim:** "MRL won a NeurIPS 2022 Outstanding Paper Award."

**The correction:** It did not. The official NeurIPS 2022 awards page lists **all 15 Outstanding Papers**, and Matryoshka Representation Learning is **absent** from that list. (It was published at NeurIPS 2022 as a regular paper; the award claim is a separate and false assertion.)

**Verified against:** the official NeurIPS 2022 awards listing, fetched directly.

**Why record it:** this is a prestige claim that gets attached to a real technique to make it sound more validated than it is. The technique is genuinely useful; the award is invented. Note also that MRL *itself* is real and worth teaching on its own merits — see the embeddings notes.

### 1.7 GGUF does **not** stand for "GPT-Generated Unified Format"

**The claim:** "GGUF stands for GPT-Generated Unified Format."

**The correction:** the official `gguf-py` README says **"GGUF (GGML Universal File)"**, and the ggml specification **never expands the acronym** at all. "GPT-Generated Unified Format" appears to be a backronym that spread through blog posts.

**Verified against:** the `gguf-py` README and the ggml spec.

### 1.8 "Q4_K_M means 4 bits per weight" is a label, not a measurement

**The claim:** "A Q4_K_M quantized model uses 4 bits per weight."

**The correction:** that is the **label**, not the measured value. llama.cpp's own benchmarks report Q4_K_M at **4.8944 bits per weight**, because the quantisation scheme includes stored scales and metadata beyond the nominal width.

**Teaching consequence:** when a lesson cites a bits-per-weight figure for memory arithmetic, use the **measured** value or say it is nominal. A memory estimate built from the label understates real usage — which is exactly the kind of estimate a reader would make before downloading a model onto hardware that cannot hold it.

---

## 2. Volatile figures — always date these

These are true as of the date noted and **change often**. Every appearance in a lesson must be dated, followed by a note that it may have changed, and **must not be load-bearing** — the lesson's point has to survive the number being wrong.

### 2.1 Model names, versions, and context sizes

**As of the research date, the provider landscape had moved well past what this curriculum's brief assumed:** frontier models observed included an OpenAI model with a ~1,050,000-token context, Anthropic's 1M-context family, and a Gemini 3.x Flash generation — plus a documented Assistants API sunset date.

**Re-checked 2026-09-25, and the landscape has moved again — which is the point of this section.**
OpenAI's own model index now leads with a **GPT-6 "Astra"** flagship and **GPT-5.6 Terra/Luna**
tiers, with pricing pages listing long-context variants and per-model cache-write rates. The names
recorded above are already historical. **This is a live demonstration, not a failure:** the section
predicted exactly this, and the reason it reads as outdated is that it is *supposed* to age
visibly. Nothing in the curriculum depends on it.

**The rule this implies — and it is the most important authoring instruction in this document:**

> **Do not hardcode a model matrix into the curriculum.** Model names, prices, context sizes, and feature support do **not** stay stable for months. Concepts stay stable for years.

No lesson may conclude anything from a specific model name, version, or context size. Where an example is useful, use it as an illustration, date it, and state what to check instead.

**Enforcement status — independently verified 2026-09-25, and it holds.** A scan of all 66 phase
files for hardcoded frontier identifiers (`gpt-4/5/6`, `claude-3/4`, `gemini-N`, `o1-`, `o3-`)
returns **exactly one hit**: `cost/05:787`, `model="gpt-4"` as a string argument in example
`log_call()` usage. That is a placeholder in illustrative code, not a claim about the landscape,
and it is correctly non-load-bearing — a reader copying the snippet loses nothing when that model
retires. **One placeholder across 66 phases is the rule working, not a near miss.** Re-scanned
when Foundations gained its ninth phase (*Multimodal and Vision*); that phase uses no model name
at all, so the count is unchanged.

### 2.2 Tokenizer and API details

| Item | Status | Note |
|---|---|---|
| OpenAI token-count endpoint | **Exists** | `POST /v1/responses/input_tokens` — a public endpoint. (An early draft of the brief wrongly said this did not exist.) |
| Chat overhead per message | **3 tokens** per message (+3 priming) — **now verified in source** | The widely-cited figure of **4 is stale**. Confirmed 2026-09-25 against the OpenAI cookbook's own function: `tokens_per_message = 3`, `tokens_per_name = 1`, and `num_tokens += 3  # every reply is primed with <|start|>assistant<|message|>`. This number changes; verify before using it in arithmetic. |
| tiktoken | **Still current** | `gpt-5` → `o200k_base`. But OpenAI now steers users toward the count API rather than local tokenisation, because local encodings can drift from server behaviour. |
| A sixth encoding | **Exists — confirmed in source** | `o200k_harmony`, used for gpt-oss models. Easy to miss when listing encodings — and confirmed 2026-09-25 by reading `tiktoken_ext/openai_public.py`, where it is a real `ENCODING_CONSTRUCTORS` entry sharing `o200k_base`'s mergeable ranks but adding harmony control tokens (`<\|start\|>`, `<\|message\|>`, `<\|channel\|>`). The "easy to miss" warning is well founded: the cookbook's public encoding table lists only **four** encodings and omits it. |

> **How §2.2 was verified (2026-09-25).** Three of the four rows are now confirmed against
> primary source rather than noted: the cookbook's `num_tokens_from_messages`, and tiktoken's
> `openai_public.py`. The general rule this demonstrates is worth keeping — **a claim about
> token counts is arithmetic, so it is checkable, and reading the counting code settles it in a
> way that reading the prose never will.** One correction to this document's earlier framing:
> the cookbook table is not wrong, it is simply narrower than the library, which is exactly the
> gap that makes `o200k_harmony` easy to omit.

### 2.3 Free-tier quotas

Colab and Kaggle GPU allocations (GPU model, weekly hours, session length) change without notice and vary by region and account. **Never quote a specific quota as fact.** Describe the *constraint structure* — sessions are time-limited, GPUs are not guaranteed, checkpoints matter — and tell the reader to check the current docs.

---

## 3. Verified citations

Confirmed against a primary source. Use these exact identifiers.

| Technique | Citation | ID / Venue |
|---|---|---|
| Transformer / attention | Vaswani et al., *Attention Is All You Need* | arXiv:1706.03762 (2017) |
| RAG | Lewis et al., *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks* | arXiv:2005.11401 (2020, NeurIPS) |
| LoRA | Hu et al., *LoRA: Low-Rank Adaptation of Large Language Models* | arXiv:2106.09685 (2021) |
| RoPE | Su et al., *RoFormer: Enhanced Transformer with Rotary Position Embedding* | arXiv:2104.09864 (2021) |
| Chain-of-Thought | Wei et al., *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models* | arXiv:2201.11903 (2022) |
| Self-Consistency | Wang et al., *Self-Consistency Improves Chain of Thought Reasoning* | arXiv:2203.11171 (2022, ICLR 2023) |
| InstructGPT / RLHF | Ouyang et al., *Training language models to follow instructions with human feedback* | arXiv:2203.02155 (2022) |
| Least-to-Most | Zhou et al., *Least-to-Most Prompting Enables Complex Reasoning* | arXiv:2205.10625 (2022, ICLR 2023) |
| Zero-shot CoT | Kojima et al., *Large Language Models are Zero-Shot Reasoners* | arXiv:2205.11916 (2022) |
| ReAct | Yao et al., *ReAct: Synergizing Reasoning and Acting in Language Models* | arXiv:2210.03629 (2022, ICLR 2023) |
| APE | Zhou et al., *Large Language Models Are Human-Level Prompt Engineers* | arXiv:2211.01910 (2022) |
| HyDE | Gao et al., *Precise Zero-Shot Dense Retrieval without Relevance Labels* | arXiv:2212.10496 (2022) |
| Constitutional AI | Bai et al., *Constitutional AI: Harmlessness from AI Feedback* | arXiv:2212.08073 (2022) |
| Indirect prompt injection | Greshake et al., *Not what you've signed up for* | arXiv:2302.12173 (2023) |
| Reflexion | Shinn et al., *Reflexion: Language Agents with Verbal Reinforcement Learning* | arXiv:2303.11366 (2023) |
| Plan-and-Solve | Wang et al., *Plan-and-Solve Prompting* | arXiv:2305.04091 (2023) |
| Tree of Thoughts | Yao et al., *Tree of Thoughts: Deliberate Problem Solving with LLMs* | arXiv:2305.10601 (2023, NeurIPS) |
| QLoRA | Dettmers et al., *QLoRA: Efficient Finetuning of Quantized LLMs* | arXiv:2305.14314 (2023) |
| DPO | Rafailov et al., *Direct Preference Optimization* | arXiv:2305.18290 (2023) |
| LLM-as-judge | Zheng et al., *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena* | arXiv:2306.05685 (2023, NeurIPS D&B) |
| Lost in the Middle | Liu et al., *Lost in the Middle: How Language Models Use Long Contexts* | arXiv:2307.03172 (2023) |
| Agent survey | Xi et al., *The Rise and Potential of Large Language Model Based Agents* | arXiv:2309.07864 (2023) |
| RAGAS | Es et al., *Ragas: Automated Evaluation of Retrieval Augmented Generation* | arXiv:2309.15217 (2023) |
| DSPy | Khattab et al., *DSPy: Compiling Declarative Language Model Calls* | arXiv:2310.03714 (2023) |
| Step-back prompting | Zheng et al., *Take a Step Back: Evoking Reasoning via Abstraction* | arXiv:2310.06117 (2023) |
| Sycophancy | Sharma et al., *Towards Understanding Sycophancy in Language Models* | arXiv:2310.13548 (2023) |
| Tokenization equity | Petrov et al., *Language Model Tokenizers Introduce Unfairness Between Languages* | arXiv:2305.15425 (2023, NeurIPS) |
| GraphRAG | Edge et al., *From Local to Global: A Graph RAG Approach* | arXiv:2404.16130 (2024) |
| Instruction hierarchy | Wallace et al., *The Instruction Hierarchy* | arXiv:2404.13208 (2024) |
| PagedAttention / vLLM | Kwon et al. | SOSP 2023 (not arXiv) |
| Reciprocal Rank Fusion | Cormack, Clarke & Buettcher | SIGIR 2009 (not arXiv) |
| Contextual Retrieval | Anthropic engineering blog | Published 19 Sep 2024 |
| Model Context Protocol | modelcontextprotocol.io | Versioned spec — check current |
| Ollama licence | **MIT** | Verified from the repository |

---

## 4. Unverified — do not teach as fact

Each of these was checked and **could not be confirmed** against a primary source. They must be marked `**Unverified**` in a lesson, or omitted.

| Claim | Why it is unverified |
|---|---|
| ~~WordPiece's exact merge criterion~~ — **RESOLVED, see §4.1** | Was: "the widely-repeated formulation could not be confirmed against a primary source." It now can be, and the reason it could not before is the finding. |
| "Roughly 1.3 tokens per word" | A rule of thumb with no citable source. Our own guidance (~0.75 words per token, ~4 characters per token for English) should also be presented as approximate and measured per tokenizer. |
| The "strawberry" letter-counting phenomenon as a tokenization fact | Frequently asserted as *the* explanation for letter-counting failures. Tokenization plausibly contributes, but the causal claim as usually stated is **not** established. Present it as a hypothesis, not a fact. |
| Llama-2-7B KV cache bytes per token | Could not confirm the specific figure. Teach the **formula** instead (see below), which is durable and lets the reader compute any model's value. |
| OSAID clause text | Body text not fetchable. Do not quote clauses. |
| Several model licences | Not all were verifiable. **LM Studio is proprietary (ToS) — verified.** Do not assert licences for models that were not checked; tell the reader to read the licence themselves. |

### 4.1 WordPiece — why the merge criterion was unfindable, and what is true instead

**Resolved 2026-09-25.** The reason this entry sat here unresolved is not obscurity. It is that
**two different algorithms share the name "WordPiece", and only one of them was ever released.**

**1. The inference algorithm — public, and it does not use a merge criterion at all.**
`google-research/bert`'s `tokenization.py` runs `WordpieceTokenizer`, documented in its own
docstring as *"a greedy longest-match-first algorithm."* For each whitespace token it takes the
longest prefix present in the vocabulary, emits it (prefixing `##` for continuations), and
advances. There is **no score, no probability, and no merge step** — it is a greedy lookup
against a vocabulary someone else already built. Reading it settles the question: a search for
WordPiece's "merge criterion" in the only released implementation finds nothing, because in the
inference path there is nothing to find.

**2. The vocabulary-building algorithm — never released, which is the actual answer.**
BERT's README says so explicitly, and this is the sentence that resolves the entry:

> "This repository does not include code for *learning* a new WordPiece vocabulary. The reason is
> that the code used in the paper was implemented in C++ with dependencies on Google's internal
> libraries."

So the widely-repeated merge formula (the `freq(pair) / (freq(left) × freq(right))` score)
describes a training procedure whose reference implementation is **not public**. That is why it
could not be confirmed against a primary source, and the honest statement is not "this formula is
wrong" but **"this formula is unattributable — no released implementation is its source."**

**3. The nearest public relative is a different algorithm, and knowing that prevents a second
error.** BERT's WordPiece descends from tensor2tensor's `SubwordTextEncoder`, which BERT's README
links as the basis. That class *does* contain a real vocabulary-building loop — it counts
substrings along current boundaries and keeps those above `min_count` — but it is **frequency
thresholding with count-decrementing of prefixes, not a ratio-scored merge**. Its `encode` path
is separately documented as greedy and explicitly *"won't necessarily produce the best list of
subtotokens."* Treating tensor2tensor's builder as "the WordPiece algorithm" would be a
misattribution, which is presumably why the earlier pass declined to do it.

**What to teach, and what this curriculum already does.** WordPiece is not mentioned anywhere in
the 66-phase corpus, so no lesson is currently wrong. If it is ever added, teach the qualitatively
correct and fully-sourced mechanism — **greedy longest-match-first against a fixed vocabulary,
with `##` marking continuations** — and describe vocabulary construction only as
"frequency-driven subword selection, whose reference implementation was never released." Do not
print the ratio formula as fact. Note also that modern open models overwhelmingly use **BPE or
Unigram/SentencePiece**, both of which *are* public, and `foundations/03` already teaches BPE
correctly from that footing; WordPiece is a historical special case, not the general case.

**Primary sources read:** `google-research/bert` `tokenization.py` (WordpieceTokenizer docstring
and loop, lines ~308–357) and `README.md` (the "Learning a new WordPiece vocabulary" section);
`tensorflow/tensor2tensor` `text_encoder.py` (`SubwordTextEncoder` class docstring and
`build_from_token_counts`).

### The formula to teach instead of a table of numbers

For the KV cache, teach the arithmetic rather than a memorised figure. It is durable, and it lets a reader answer the question for any model:

```text
KV cache bytes per token = 2 × layers × kv_heads × head_dim × bytes_per_element
```

The `2` is for keys and values. `kv_heads` is the number of **key/value heads** — smaller than the attention head count in a model using grouped-query attention, which is precisely why GQA saves memory. Multiply by sequence length and batch size for a full request.

This is the pattern to prefer throughout the curriculum: **teach the relationship, not the number**, because the relationship survives every model release and the number does not.

---

## 5. Two findings worth building lessons around

### 5.1 Language tokenization equity — directly relevant to this reader

**Petrov et al., arXiv:2305.15425 (NeurIPS 2023, peer-reviewed)** established that the same content translated into different languages can differ by **up to 15× in tokenized length**, and that this **persists even in multilingual tokenizers**.

**Why this matters here, concretely.** The reader of this curriculum is in the Philippines. The practical consequences are measurable and personal:

- The same prompt **costs more** in Tagalog, Cebuano, or Ilocano than in English.
- It **runs slower**.
- It **consumes more of the context window**, so less room for everything else.
- A context budget computed from English word counts will be **wrong** for a Filipino-language prompt.

This is a genuinely valuable, peer-reviewed, locally relevant finding rather than a rumour — and it makes an excellent free hands-on exercise: count one sentence in English and the same sentence in the reader's own language, locally, at no cost.

**Teaching note:** present it as an equity issue with a mechanism (tokenizer vocabulary coverage), not as a curiosity. The mechanism explains why 15× is possible and why it improves as tokenizers get more multilingual training.

### 5.2 "Context rot" — teach both halves honestly

Anthropic's own official documentation now uses the term **"context rot"** in its context-windows page. The underlying quantitative study (Hong, Troynikov & Huber, 14 July 2025) is a **Chroma vendor technical report** — it is **not peer-reviewed and not on arXiv**.

**How to teach it:** state that the *phenomenon* is documented by multiple sources including a major provider's official docs, **and** that the most-cited quantitative study is a vendor report rather than peer-reviewed research. Both halves are true and the reader is better off knowing which is which. This is a good, concrete example of the volatility rule in action: the mechanism is credible, the specific numbers are less so, and saying so costs nothing.

---

## 6. How to use this document when writing a lesson

**Before asserting any specific fact:**

1. **Is it in §1 (debunked)?** → Teach the correction, and consider teaching *why the wrong version is so widespread*. That is often more instructive than the fact itself.
2. **Is it in §2 (volatile)?** → Date it, flag it, and make sure removing it would not change the lesson's conclusion.
3. **Is it in §3 (verified citations)?** → Use the exact identifier. Note the venue.
4. **Is it in §4 (unverified)?** → Mark it `**Unverified**` or teach the underlying relationship instead. Note that §4.1 has since been **resolved**, so check there before treating a §4 row as closed — an entry leaving this list is the system working.
5. **Is it in none of them?** → It has not been checked. Either verify it, mark it, or find a durable way to make the point that does not depend on it.

**The last case is the one that matters most**, because it is the default state of a fact you just thought of. A number that feels familiar is not a number that has been checked — and the familiarity is exactly what makes it dangerous to write down.

**And a sixth case, added 2026-09-25 because it is the one that actually resolved the WordPiece entry:**

6. **Is the claim about an *algorithm*?** → Read the source code, not the description of it. Code cannot paraphrase, and the WordPiece case shows why this matters: the merge criterion was unfindable through prose because the released implementation never had one (see §4.1). A search that returns nothing is a result — record *why* it returned nothing, because "two things share this name and only one was published" is more useful to a reader than the formula would have been.

**One closing principle, which is the reason this file exists at all:**

> **Teach the relationship, not the number.** A lesson built on "the KV cache is N GB" is wrong on a schedule you do not control. A lesson built on "here is how to compute it, and here is why GQA makes it smaller" is still correct when the model it was written about no longer exists.
