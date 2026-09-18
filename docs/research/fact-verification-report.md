# Fact-Verification Report: Transformer Architecture, Attention, KV Cache, Inference Serving

Method note: at the time of this audit, the `web_search` tool was broken in this environment (404 model error). Every fact below was
verified by direct `web_fetch` of a primary source (arXiv abstract/HTML page, USENIX page, vendor model card,
or HF docs/config file). Every URL listed was actually fetched during this session.

> **Update (later session):** `web_search` now works. This note is kept as an accurate record of how *this* audit was
> performed, not as a statement about the current environment. The findings below were verified by direct fetch, which
> remains a stronger standard than a search snippet — so nothing here is invalidated. But the "could not verify"
> items listed in these research notes **have never been re-checked now that search is available**, and are worth
> revisiting. See `HANDOVER.md` §0.1.

---

## 1. "Attention Is All You Need" — VERIFIED

**(a) Verified facts**
- Title: *Attention Is All You Need*
- arXiv ID: **arXiv:1706.03762** [cs.CL]
- First author: **Ashish Vaswani** (Google Brain). Full author list as printed on arXiv:
  Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez,
  Lukasz Kaiser, Illia Polosukhin.
- Submitted **12 Jun 2017**; last revised 2 Aug 2023 (v7). (v1–v7 all listed; v1 Mon, 12 Jun 2017.)
- Published venue: **NeurIPS 2017 (NIPS 2017)**. NOTE: the arXiv page itself does *not* print the venue.
  I verified the paper's existence/date/authors/formulas from arXiv only. The NeurIPS 2017 venue is
  widely cited and consistent with the timeline, but I did **not** independently fetch a NeurIPS
  proceedings page in this session → treat "NeurIPS 2017" as **UNVERIFIED-from-primary-source here**
  (high confidence, but not fetched).

**Exact scaled dot-product attention formula (paper Eq. 1, verbatim):**
```
Attention(Q, K, V) = softmax( (Q K^T) / sqrt(d_k) ) V
```
> "The input consists of queries and keys of dimension d_k, and values of dimension d_v. We compute the
> dot products of the query with all keys, divide each by sqrt(d_k), and apply a softmax function to
> obtain the weights on the values."

**Correction flag (commonly mis-stated):** the scaling is `sqrt(d_k)` where `d_k` is the **key/query
dimension**, NOT `sqrt(d_model)`. With the paper's own hyperparameters h=8, d_model=512, d_k=d_v=64
the two happen to be numerically different (sqrt(64)=8 vs sqrt(512)≈22.6). In the paper's notation,
`d_k = d_v = d_model/h = 64`.

Related verbatim details:
- Multi-head: `MultiHead(Q,K,V) = Concat(head_1,...,head_h) W^O`, `head_i = Attention(Q W_i^Q, K W_i^K, V W_i^V)`;
  `h = 8`, `d_k = d_v = d_model/h = 64`, `d_model = 512`.
- Encoder/decoder: `N = 6` identical layers each. FFN: `FFN(x) = max(0, xW_1 + b_1)W_2 + b_2`, `d_ff = 2048`.
- Residual+norm written as `LayerNorm(x + Sublayer(x))` (post-norm in this paper).
- Complexity table: Self-Attention `O(n^2 · d)` per layer, `O(1)` sequential ops, `O(1)` max path length.

**Exact sinusoidal positional encoding formulas (paper §3.5, verbatim):**
```
PE_(pos, 2i)   = sin( pos / 10000^(2i/d_model) )
PE_(pos, 2i+1) = cos( pos / 10000^(2i/d_model) )
```
> "where pos is the position and i is the dimension. ... the wavelengths form a geometric progression
> from 2π to 10000 · 2π."

**(d) Not verified:** NeurIPS 2017 venue from a primary proceedings page. 28.4 BLEU (En-De) and
41.8 BLEU (En-Fr) appear in the abstract and are verified as printed there.

**Sources fetched:**
- https://arxiv.org/abs/1706.03762
- https://arxiv.org/html/1706.03762v7

---

## 2. Multi-Query Attention — VERIFIED, WITH A TITLE CORRECTION

**(a) Verified facts**
- Title: **"Fast Transformer Decoding: One Write-Head is All You Need"** — this is the actual title.
  "Multi-Query Attention" is the *informal/community* name, not the paper title.
- arXiv ID: **arXiv:1911.02150** [cs.NE] (cross-listed cs.CL, cs.LG)
- First author: **Noam Shazeer** (sole author)
- Submitted **6 Nov 2019** (v1 only, never revised)
- Venue: no conference listed on the arXiv page → appears to be an arXiv-only tech report.
  **UNVERIFIED** as to any peer-reviewed venue.

**Exact abstract text (verbatim):** "...We propose a variant called multi-query attention, where the keys
and values are shared across all of the different attention 'heads', greatly reducing the size of these
tensors and hence the memory bandwidth requirements of incremental decoding."

**(d) Source of confusion:** many secondary sources cite this paper as "Shazeer, *Multi-Query Attention*,
2019". That title does not exist. Cite it as *Fast Transformer Decoding: One Write-Head is All You Need*.

**Source fetched:** https://arxiv.org/abs/1911.02150

---

## 3. RoPE (Rotary Position Embedding) — PAPER VERIFIED; THETA VALUES VERIFIED FROM CONFIGS

**(a) Paper facts**
- Title: **"RoFormer: Enhanced Transformer with Rotary Position Embedding"**
- arXiv ID: **arXiv:2104.09864** [cs.CL]
- First author: **Jianlin Su**. Full list: Jianlin Su, Yu Lu, Shengfeng Pan, Ahmed Murtadha, Bo Wen, Yunfeng Liu.
- v1 **20 Apr 2021**; last revised 8 Nov 2023 (v5). License CC BY-NC-ND 4.0.
- Venue: no conference listed on the arXiv page. (Commonly cited as Neurocomputing 2024 — **UNVERIFIED**
  here; I did not fetch the journal page.)

**"RoPE theta" / base — what it means:**
`rope_theta` is the base of the geometric progression of rotation frequencies: in RoPE, dimension pair
`i` gets rotation frequency `θ_i = base^(-2i/d)`, i.e. `base = 10000` reproduces the Transformer's
sinusoidal-encoding wavelength progression. **The RoPE paper itself does not define or discuss a tunable
"rope_theta" hyperparameter** — the `rope_theta` name is a *library/config* convention (HF Transformers,
vLLM, etc.). This is an important distinction: 10000/500000/1000000 are **not** values from the RoPE paper.

**Common values now — VERIFIED directly from primary model config files (`config.json`):**

| Model | `rope_theta` | Source (fetched) |
|---|---|---|
| Mixtral-8x7B-v0.1 | **1000000.0** | https://huggingface.co/mistralai/Mixtral-8x7B-v0.1/raw/main/config.json |
| Mixtral-8x7B-Instruct-v0.1 | **1000000.0** | https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1/raw/main/config.json |
| Meta-Llama-3-8B (config mirror; official repo gated) | **500000.0** | https://huggingface.co/NousResearch/Meta-Llama-3-8B/raw/main/config.json |
| Qwen3-235B-A22B | **1000000.0** | https://huggingface.co/Qwen/Qwen3-235B-A22B/raw/main/config.json |
| DeepSeek-V3 | **10000** (with YaRN scaling, factor 40, original_max_position_embeddings 4096) | https://huggingface.co/deepseek-ai/DeepSeek-V3/raw/main/config.json |
| DeepSeek-R1 | **10000** (same YaRN config) | https://huggingface.co/deepseek-ai/DeepSeek-R1/raw/main/config.json |

**Flag — VERIFY / nuance:** So "10000 vs 500000 vs 1000000" are all real, but they are *model/config*
choices, not paper facts. Llama-3-8B uses **500000**, Mixtral and Qwen3 use **1000000**, and
DeepSeek-V3/R1 keep **10000** and instead achieve long context via **YaRN** RoPE scaling. Any claim that
"modern models all use 1e6" is **false as stated**.

**Source of the YaRN method (used by DeepSeek):**
- Title: "YaRN: Efficient Context Window Extension of Large Language Models"; first author **Bowen Peng**;
  **arXiv:2309.00071**; v1 31 Aug 2023. Fetched: https://arxiv.org/abs/2309.00071

**(d) UNVERIFIED:** the RoFormer journal venue; any statement that the RoPE paper "recommends" a
particular theta.

---

## 4. ALiBi — VERIFIED

**(a) Verified facts**
- Title: **"Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation"**
- arXiv ID: **arXiv:2108.12409** [cs.CL]
- Authors: **Ofir Press, Noah A. Smith, Mike Lewis** (first author Ofir Press)
- v1 **27 Aug 2021**; v2 22 Apr 2022. Year: 2021 (original).
- Venue: no conference field on the arXiv page; widely cited as **ICLR 2022** → **UNVERIFIED-from-source
  here** (not fetched), though consistent with the Apr 2022 v2 date.

**Exact abstract claim (verbatim):** "...a 1.3 billion parameter model on input sequences of length 1024
that extrapolates to input sequences of length 2048, achieving the same perplexity as a sinusoidal
position embedding model trained on inputs of length 2048 but training **11% faster** and using
**11% less memory**." Method: "ALiBi does not add positional embeddings to word embeddings; instead, it
biases query-key attention scores with a penalty that is proportional to their distance."

**Source fetched:** https://arxiv.org/abs/2108.12409

---

## 5. "Lost in the Middle" — SETUP AND QUANTITATIVE CLAIMS VERIFIED

(Per instructions I did not re-verify the bibliographic record; I did fetch the paper to check the
quantitative claims. For completeness the fetched page confirms: arXiv:2307.03172, submitted 6 Jul 2023,
v3 20 Nov 2023, first author Nelson F. Liu, "Accepted for publication in TACL, 2023", 18 pages.)

**Multi-document QA setup (paper §2.1, verbatim-derived):**
- Task: model gets (i) a question and (ii) `k` documents, where **exactly one** document contains the
  answer and `k−1` are distractors. Requires locating the answer document and using it.
- Data: **NaturalQuestions-Open**, specifically **the 2655 queries where the annotated long answer is a
  paragraph** (not a list or table).
- Documents: **Wikipedia passages ("chunks of at most 100 tokens")**.
- Distractors: top `k−1` Wikipedia chunks retrieved by **Contriever fine-tuned on MS-MARCO** that do not
  contain any annotated answer; presented **in order of decreasing relevance**.
- Metric: accuracy = whether any of the NaturalQuestions annotated answers appears in the predicted output.
- Context length controlled by number of documents; tested with **10, 20, and 30 total documents**
  (the paper's appendix G has subsections "10 Total Retrieved Documents", "20 Total Retrieved Documents",
  "30 Total Retrieved Documents").

**Key quantitative claim — precisified:**
- The headline is a **U-shaped performance curve**: best when the relevant document is at the very
  beginning (primacy bias) or very end (recency bias), degrading in the middle.
- Exact anchor from §1 (verbatim): *"when relevant information is placed in the middle of its input
  context, GPT-3.5-Turbo's performance on the multi-document question task is **lower than its performance
  when predicting without any documents** (i.e., the closed-book setting; **56.1%**)."*
- **Correction flag:** the widely repeated phrasing "accuracy drops by 20% when the answer is in the
  middle" is **not** how the paper states it. The paper's concrete, quotable anchor is the comparison
  against the **56.1% closed-book** baseline. Do not attribute a specific "20% drop" number to this paper
  without locating the exact figure in the paper's plots (which are images and were not numerically
  extracted here).
- Models evaluated: MPT-30B-Instruct (max context 8192, uses ALiBi), LongChat-13B (16K),
  GPT-3.5-Turbo and GPT-3.5-Turbo (16K) (0613 versions), Claude-1.3 and Claude-1.3 (100K);
  plus Flan-T5-XXL / Flan-UL2 for the architecture study, and GPT-4 (8K) on a subset.
  **Important:** the headline "Lost in the Middle" result is on **GPT-3.5-Turbo and Claude-1.3-era models
  (mid-2023)**, not current models.
- Key-value retrieval task: **75, 140, and 300 key-value pairs** (500 examples each), random UUIDs.
  Worst-case performance reported as **45.6%** (GPT-3.5-Turbo-16K without query-aware contextualization).
- Extended-context models were **not** better at using context when the input fit in both windows.
- Open-domain QA case study (NaturalQuestions-Open, Contriever): using **50 documents instead of 20**
  improved performance only **~1.5% for GPT-3.5-Turbo** and **~1% for Claude-1.3**.
- Encoder-decoder robustness: Flan-UL2 showed **1.9% absolute** best-to-worst difference when evaluated
  within its 2048-token training context.
- MPT-30B base vs Instruct: instruction fine-tuning reduced worst-case disparity from **nearly 10% to
  around 4%**.

**(d) Not verified:** the exact per-position numeric accuracy values from the U-shaped figures
(figures are images; only ranges/anchors stated in prose were captured). The "20 documents ≈ 4K tokens"
characterization is consistent with the setup (20 × ≤100-token docs) but the paper does not state
"~4K tokens" as such — treat the token figure as an inference, not a quote.

**Source fetched:** https://arxiv.org/html/2307.03172v3 (plus abstract page https://arxiv.org/abs/2307.03172)

---

## 6. "Context Rot" — EXISTS, CONFIRMED; IT IS A VENDOR TECH REPORT, NOT PEER-REVIEWED

**(a) Verified facts — your recollection is correct**
- Exact title: **"Context Rot: How Increasing Input Tokens Impacts LLM Performance"**
- Authors: **Kelly Hong, Anton Troynikov, Jeff Huber** — exactly as you recalled.
- Date: **July 14, 2025**.
- Publisher/institution: **Chroma**. Explicitly labeled **"Chroma Technical Report"** at the top of the page.
- URL: https://www.trychroma.com/research/context-rot
- **Status: NOT peer-reviewed. It is a vendor research report/blog-style technical report, NOT an arXiv
  paper and NOT a journal/conference publication.** I found no arXiv ID for it. Their own suggested
  citation is a `@techreport` with `institution = {Chroma}`.

**Main finding (verbatim from the report):** *"We observe that model performance varies significantly as
input length changes, even on simple tasks."* and *"Across all experiments, model performance consistently
degrades with increasing input length."* The core thesis is that LLMs **do not use context uniformly**;
performance becomes increasingly unreliable as input grows, even when task difficulty is held constant.

Specific verified details:
- **18 LLMs** evaluated, including GPT-4.1, Claude 4 (Opus/Sonnet), Gemini 2.5 (Pro/Flash), Qwen3.
- Tasks: an extension of Needle-in-a-Haystack (varying needle-question similarity, distractors,
  needle-haystack similarity, haystack structure), **LongMemEval** conversational QA, and a synthetic
  **Repeated Words** task.
- Experimental grid: 8 input lengths × 11 needle positions per needle type/haystack/structure combination;
  **194,480 total LLM calls** (they note 69 refusals = 0.035%).
- LongMemEval: prompts average **~113k tokens** (full) vs **~300 tokens** (focused), 306 prompts after
  filtering 38.
- Notable counterintuitive finding (verbatim headline): *"Surprisingly, we find that structural coherence
  consistently hurts model performance."* Models performed **better on shuffled haystacks** than on
  logically structured ones, across all 18 models.
- Repeated Words task lengths: 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 10000 words;
  1090 variations.

**(d) Caveats you should propagate:** vendor report, no peer review, and its own "Limitations" section
states the mechanisms behind degradation are **not** explained and that the evaluation is **not exhaustive**
of real-world use cases.

**Source fetched:** https://www.trychroma.com/research/context-rot

---

## 7. vLLM / PagedAttention — VERIFIED, WITH AN IMPORTANT NUMBER CORRECTION

**(a) Verified facts**
- Title: **"Efficient Memory Management for Large Language Model Serving with PagedAttention"**
- arXiv ID: **arXiv:2309.06180** [cs.LG]
- First author: **Woosuk Kwon**. Full list: Woosuk Kwon, Zhuohan Li, Siyuan Zhuang, Ying Sheng,
  Lianmin Zheng, Cody Hao Yu, Joseph E. Gonzalez, Hao Zhang, Ion Stoica. Affiliations: UC Berkeley,
  Stanford, Independent Researcher, UC San Diego.
- Submitted **12 Sep 2023** (v1 only).
- Venue: **SOSP 2023** — verified on the paper's own HTML page: "ACM SIGOPS 29th Symposium on Operating
  Systems Principles; October 23–26, 2023; Koblenz, Germany", "SOSP '23", **DOI 10.1145/3600006.3613165**,
  ISBN 979-8-4007-0229-7/23/10. The arXiv comments field also says "SOSP 2023".

**Memory-waste claim — EXACT QUOTE (this is the number to use):**
> "Indeed, our profiling results in Fig. 2 show that **only 20.4% - 38.2% of the KV cache memory is used
> to store the actual token states** in the existing systems."

And in §3.1 (verbatim): "...revealing that **the actual effective memory in previous systems can be as low
as 20.4%**."

**⚠️ Correction — a widely-repeated number that is NOT in the paper:** the common claim that *"existing
systems waste 60–80% of KV cache memory"* is an **inversion/rephrasing**. The paper reports the
**utilization** (20.4%–38.2% used), from which waste of ~61.8%–79.6% follows arithmetically — but the
paper never prints "60-80% wasted". Quote the 20.4%–38.2% figure. The three named sources of waste are
"reserved" slots for future tokens, **internal fragmentation** (over-provisioning to max sequence length),
and **external fragmentation** (buddy allocator).

**Throughput claim — EXACT QUOTE:**
> "vLLM improves the throughput of popular LLMs by **2-4×** with the same level of latency compared to the
> state-of-the-art systems, such as **FasterTransformer and Orca**."

**⚠️ Precision note:** the baseline is **two** systems (FasterTransformer **and** Orca), and the comparison
is at the **same level of latency**. The abstract/§1 say "2-4×"; the intro also says "2-4×" (the paper does
not state a single "X times faster" number). Do not cite "up to 24×" or similar — that figure is not in
this paper (that style of number comes from later vLLM/blog material).

**Other verified quotes/numbers:**
- Abstract: vLLM achieves "(1) **near-zero waste** in KV cache memory and (2) flexible sharing of KV cache
  within and across requests".
- 13B OPT worked example (verbatim): "the KV cache of a single token demands **800 KB** of space, calculated
  as **2 (key and value vectors) × 5120 (hidden state size) × 40 (number of layers) × 2 (bytes per FP16)**.
  Since OPT can generate sequences up to 2048 tokens, the memory required to store the KV cache of one
  request can be as much as **1.6 GB**." *(This is an authoritative worked example and directly supports
  topic 8.)*
- Sequence/prompt-KV sharing: "the KV cache of the prompt part, which accounts for **12%** of the total KV
  cache memory in our experiment (§6.3)"; beam search achieves "**up to 55% memory saving**".
- Fig. 1 context: for a 13B model on A100 40GB, "**Approximately 65%** of the memory is allocated for the
  model weights" and "**Close to 30%**" for KV cache.

**Source fetched:** https://arxiv.org/html/2309.06180v1 (plus abstract page https://arxiv.org/abs/2309.06180)

---

## 8. KV Cache Size Formula — VERIFIED (formula + authoritative worked examples)

**(a) The formula.** The standard decomposition is:

```
KV cache bytes = 2 × num_layers × num_kv_heads × head_dim × seq_len × batch_size × bytes_per_element
```
where the leading **2** accounts for storing both **K and V**.

Equivalently, and more commonly in practice:
```
KV cache bytes = 2 × num_layers × (num_kv_heads × head_dim) × seq_len × batch_len × bytes
```
Note `num_kv_heads × head_dim` is the KV projection width; for MHA it equals `hidden_size`, and for GQA/MQA
it is smaller (this is exactly why GQA/MQA shrink the cache).

**Authoritative corroboration — vLLM paper, verbatim (best single source):**
> "for the 13B parameter OPT model, the KV cache of a single token demands **800 KB** of space, calculated as
> **2 (key and value vectors) × 5120 (hidden state size) × 40 (number of layers) × 2 (bytes per FP16)**."
> → 2 × 5120 × 40 × 2 = **819,200 bytes ≈ 800 KB per token**. Verified arithmetic: matches exactly.

**(b) Authoritative worked examples.**

*Example A — 13B OPT, from the vLLM paper (SOSP 2023):* **800 KB per token** in FP16;
**1.6 GB** for a 2048-token sequence. (Verified: 2×5120×40×2 bytes = 800 KB; ×2048 ≈ 1.6 GB.)

*Example B — Llama 3.1 family, from the official Hugging Face Llama 3.1 release blog (July 23, 2024),
FP16 KV cache table (verbatim values):*

| Model | 1k tokens | 16k tokens | 128k tokens |
|---|---|---|---|
| 8B | 0.125 GB | 1.95 GB | 15.62 GB |
| 70B | 0.313 GB | 4.88 GB | 39.06 GB |
| 405B | 0.984 GB | 15.38 GB | 123.05 GB |

Cross-check for **Llama-3-8B** using the formula and its real config
(`num_hidden_layers=32`, `num_key_value_heads=8`, `hidden_size=4096`, so head_dim=128;
KV width = 8×128 = 1024):
`2 × 32 × 8 × 128 × 1024 tokens × 2 bytes = 134,217,728 bytes = 0.125 GB` ✔ **matches the blog's 0.125 GB
exactly**. At 128k: `2×32×8×128×131072×2 = 17.18 GB` — the blog says **15.62 GB**.
⚠️ **Discrepancy flag:** my formula-based 128k figure (17.18 GB) does **not** match the blog's 15.62 GB,
though the 1k figure matches perfectly. The exact per-token value implied by the blog is
`15.62 GB / 131072 ≈ 128 KB/token`, which equals `2 × 32 × 8 × 128 × 2 bytes = 131,072 bytes = 128 KiB`
using **K**iB/GiB (binary) units — i.e. the blog's "0.125 GB" and "15.62 GB" are in **binary GiB**, and my
arithmetic above was in decimal GB. In binary units my formula gives 0.125 GiB and 16.0 GiB; the blog's
15.62 GiB still differs slightly, so the blog's 128k column appears to use a slightly different assumption
(e.g. rounded head_dim or a 128k figure that is not exactly 131072 tokens). **Recommendation:** cite the
1k-token per-token figure (which matches exactly under either unit convention) and derive longer lengths
with the formula yourself; do not quote the blog's 128k column as exact.

*Note on Llama-2-7B:* I did **not** find an authoritative published KV-cache-per-token number for
Llama-2-7B in the sources I fetched. Computed from its well-known config (32 layers, 32 KV heads,
head_dim 128) it would be `2×32×32×128×2 B = 512 KB/token` in FP16 (0.5 MiB) — but this is **my
computation, not a fetched source** → mark **UNVERIFIED by source** if you need a citation.

**(d) What is verified vs not:** the formula is verified and is exactly the one used explicitly in the
vLLM paper, and it reproduces the HF Llama-3.1 1k-token figure exactly. The "20 documents"/Llama-2-7B
specific figure is UNVERIFIED. Note also that the formula above describes **standard MHA/GQA**. Models with
**MLA** (DeepSeek-V3/R1) do **not** follow it — they cache a compressed latent plus a decoupled RoPE key
(`kv_lora_rank=512`, `qk_rope_head_dim=64`, verified in the DeepSeek-V3 config), which is dramatically
smaller than `2 × layers × kv_heads × head_dim`.

**Sources fetched:**
- https://arxiv.org/html/2309.06180v1 (formula + OPT worked example)
- https://huggingface.co/blog/llama31 (Llama 3.1 FP16 KV cache table)
- https://raw.githubusercontent.com/huggingface/transformers/main/docs/source/en/kv_cache.md
  (HF Transformers cache docs: DynamicCache/StaticCache/QuantizedCache/offloading/prefix caching)
- https://huggingface.co/NousResearch/Meta-Llama-3-8B/raw/main/config.json (Architecture params)
- https://huggingface.co/deepseek-ai/DeepSeek-V3/raw/main/config.json (MLA params)
- https://huggingface.co/blog/not-lain/kv-caching (community article; describes K/V caching mechanics
  and reports a T4 benchmark: 11.7 s with caching vs 1 min 1 s without, ~5.21× — *community article, not
  peer-reviewed; treat the 5.21× as anecdotal*)

---

## 9. Continuous Batching / Orca — VERIFIED

**(a) Verified facts (from the USENIX OSDI '22 official page):**
- Title: **"Orca: A Distributed Serving System for Transformer-Based Generative Models"**
- Authors: **Gyeong-In Yu** and **Joo Seong Jeong** (Seoul National University); **Geon-Woo Kim**
  (FriendliAI and SNU); **Soojeong Kim** (FriendliAI); **Byung-Gon Chun** (FriendliAI and SNU)
- Venue: **16th USENIX Symposium on Operating Systems Design and Implementation (OSDI '22)**, Carlsbad, CA,
  **July 2022**, pages **521–538**, ISBN 978-1-939133-28-1, publisher USENIX Association.
- BibTeX key/URL: https://www.usenix.org/conference/osdi22/presentation/yu
- PDF: https://www.usenix.org/system/files/osdi22-yu.pdf (not fetched; page is authoritative for metadata)

**The origin term — IMPORTANT NUANCE:** the Orca paper does **not** use the phrase "continuous batching".
Its own terms are **"iteration-level scheduling"** and **"selective batching"**. Verbatim from the abstract:
> "we propose **iteration-level scheduling**, a new scheduling mechanism that schedules execution at the
> granularity of iteration (instead of request) where the scheduler invokes the execution engine to run
> only a single iteration of the model on the batch. In addition, to apply batching and iteration-level
> scheduling to a Transformer model at the same time, we suggest **selective batching**, which applies
> batching only to a selected set of operations."

So: **"continuous batching" is the community/industry name for the concept Orca introduced as
"iteration-level scheduling"**, and the term is strongly associated with **vLLM and Anyscale**. The vLLM
paper corroborates and cites it (verbatim, §2.3 of arXiv:2309.06180): "fine-grained batching mechanisms,
such as **cellular batching** (Gao et al., 2018) and **iteration-level scheduling** (Yu et al., 2022), have
been proposed. Unlike traditional methods that work at the request level, these techniques operate at the
iteration level. After each iteration, completed requests are removed from the batch, and new ones are
added."

**How it differs from static batching (verified from both sources):**
- *Static batching:* all requests in a batch must wait for the **longest** request to finish before any
  returns; new arrivals wait for the whole batch to complete; inputs/outputs typically padded to equal
  length (wasting compute and memory). Orca's abstract (verbatim): "requests that have finished earlier
  than other requests in a batch cannot return to the client, while newly arrived requests have to wait
  until the current batch completely finishes."
- *Continuous/iteration-level batching:* scheduling happens **per iteration**; finished sequences are
  evicted and new requests admitted **after a single iteration**; with suitable kernels, padding is
  eliminated.

**Orca's headline result (verbatim from the USENIX abstract):** "Our evaluation on a **GPT-3 175B** model
shows that ORCA can significantly outperform **NVIDIA FasterTransformer** in terms of both latency and
throughput: **36.9× throughput improvement** at the same level of latency." ⚠️ Note the page renders this
as "36:9×" due to a decimal-point typo in the HTML; the intended figure is **36.9×**. Cite carefully.

**⚠️ Attribution caution:** the term "continuous batching" is *most* strongly associated with **vLLM /
Anyscale** in industry writing (e.g. Anyscale's "How continuous batching enables 23x throughput in LLM
inference" blog), while the *technique's* origin is Orca (OSDI '22). Both attributions are defensible;
be explicit about which you mean ("term" vs "technique").

**(d) UNVERIFIED:** I did not fetch Anyscale's blog post, so the specific "23×" Anyscale figure is
**UNVERIFIED**. I also did not fetch the cellular-batching (Gao et al. 2018) paper.

**Sources fetched:**
- https://www.usenix.org/conference/osdi22/presentation/yu
- https://arxiv.org/html/2309.06180v1 (for the vLLM cross-reference and terminology)

---

## 10. Speculative Decoding — BOTH VERIFIED; LOSSLESSNESS CONDITION PRECISIFIED

### 10a. Leviathan et al. — VERIFIED
- Title: **"Fast Inference from Transformers via Speculative Decoding"**
- arXiv ID: **arXiv:2211.17192** [cs.LG]
- Authors: **Yaniv Leviathan, Matan Kalman, Yossi Matias** (all Google Research) — first author Yaniv
  Leviathan. (Note: authors are Google Research, **not** DeepMind.)
- Submitted **30 Nov 2022** (v1); v2 18 May 2023.
- Venue: **ICML 2023 Oral** — verified in the arXiv comments field ("ICML 2023 Oral").

**Headline result (verbatim abstract):** "...we introduce speculative decoding ... without any changes to
the outputs ... We demonstrate it on **T5-XXL** and show a **2X-3X acceleration** compared to the standard
**T5X** implementation, **with identical outputs**."

### 10b. Chen et al. (DeepMind) — VERIFIED
- Title: **"Accelerating Large Language Model Decoding with Speculative Sampling"**
- arXiv ID: **arXiv:2302.01318** [cs.CL]
- Authors: **Charlie Chen, Sebastian Borgeaud, Geoffrey Irving, Jean-Baptiste Lespiau, Laurent Sifre,
  John Jumper** — first author Charlie Chen. (DeepMind; confirmed by the paper's affiliation context and
  the Chinchilla benchmark.)
- Submitted **2 Feb 2023** (v1 only).
- Venue: none listed on the arXiv page → **appears to be an arXiv-only tech report. UNVERIFIED** as
  peer-reviewed.

**Headline result (verbatim abstract):** "We benchmark speculative sampling with **Chinchilla**, a **70
billion parameter** language model, achieving a **2-2.5x decoding speedup** in a distributed setup, without
compromising the sample quality or making modifications to the model itself."

### The LOSSLESSNESS claim — VERIFIED, and here is the precise statement

**This is the part most often misstated. The exact wording matters.**

Leviathan et al. (verbatim, §2.3): *"...guaranteeing that the outputs from our system have the same
distribution as those from the target model alone."* And: *"It's easy to show (see Section A.1) that for
any distributions p(x) and q(x), and x sampled in this way, indeed x ∼ p(x)."*

The actual acceptance rule (verbatim, §2.3):
> "To sample x ∼ p(x), we instead sample x ∼ q(x), keeping it if **q(x) ≤ p(x)**, and in case **q(x) > p(x)**
> we reject the sample with probability **1 − p(x)/q(x)** and sample x again from an adjusted distribution
> **p'(x) = norm(max(0, p(x) − q(x)))** instead."

And Theorem 3.5: **β = 1 − D_LK(p, q)**, where `D_LK(p,q) = Σ_x |p(x) − M(x)|` with
`M(x) = (p(x)+q(x))/2`; Corollary 3.6: **α = 1 − E(D_LK(p,q)) = E(min(p,q))**.
Expected tokens per target-model run: **E(#tokens) = (1 − α^(γ+1)) / (1 − α)** (their Eq. 1), with `γ` the
number of draft guesses.

**Precise conditions for losslessness (three caveats that are commonly dropped):**
1. **It is distribution-exact, not "identical token strings".** Losslessness means the *sampled
   distribution* matches the target model's — two runs can produce different text while both are exact
   samples from `p`. Saying speculative decoding "produces identical output" (as opposed to "identical
   distribution / identical outputs for the same random seed" in the greedy/argmax case) is imprecise.
2. **It requires exact, correct draft-model probabilities `q(x)`** for the prefix the target model is
   verifying, and requires the acceptance test to be applied exactly as specified (accept if `q ≤ p`,
   else reject with prob `1 − p/q` and resample from `norm(max(0, p − q))`). Any *approximation* to this
   scheme (e.g. truncating the draft distribution, an approximate/typical-acceptance variant, or a
   nondeterministic/stale draft) **breaks exactness**.
3. **Fixed/quantized arithmetic and the sampling method matter.** Chen et al. state their guarantee only
   "within hardware numerics" (verbatim: "preserves the distribution of the target model **within hardware
   numerics**") — i.e. floating-point differences are acknowledged, not theoretically excluded.
   Additionally, both papers note that non-standard sampling schemes (temperature, top-k, nucleus) must be
   **cast into a standard adjusted probability distribution first** for the argument to apply
   (Leviathan §2.2 "Standardized Sampling"). Losslessness is claimed for sampling from a properly adjusted
   distribution; it is **not** a claim about arbitrary logit post-processing.

**Key condition for speedup (verified):** the speedup depends on the **acceptance rate α** and the cost
ratio between draft and target models. Leviathan §3.3 states walltime improvement requires having enough
compute to run `γ+1` concurrent evaluations, and the analysis assumes the **draft model is much cheaper
than the target** and that decoding is **memory-bandwidth bound** rather than compute bound (verbatim from §1:
"inference from large models is often not bottlenecked on arithmetic operations, but rather on memory
bandwidth and communication, so additional computation resources might be available"). The paper also
gives a **worst case guarantee**: "each parallel run of the target model M_p will produce at least one new
token (so the number of serial runs of the target model can never, even in the worst case, be larger than
the simple autoregressive method)". ⚠️ Note that this is a guarantee on the **number of serial runs**, not
on wall-clock — wall-clock can still regress if the verification batch is expensive.

**A third, easy-to-miss point:** Leviathan et al. explicitly note §2.2 that Argmax/top-k/nucleus/temperature
"can all easily be cast into standard sampling from an adjusted probability distribution," so the
correctness argument covers them **after** that casting. Rejection-sampling variants that skip the
`max(0, p−q)` correction are **not** lossless (the paper has a dedicated §A.2 "Speculative Sampling vs.
Rejection Sampling" on precisely this).

**Sources fetched:**
- https://arxiv.org/abs/2211.17192
- https://arxiv.org/html/2211.17192v2 (full text: Algorithm 1, §2.2, §2.3, §3.1, Thm 3.5, Cor 3.6, §3.3)
- https://arxiv.org/abs/2302.01318

---

## 11. FlashAttention — v1, v2, v3 ALL VERIFIED

### FlashAttention (v1) — your record confirmed
- Title: **"FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness"**
- **arXiv:2205.14135**; first author **Tri Dao**; authors Tri Dao, Daniel Y. Fu, Stefano Ermon,
  Atri Rudra, Christopher Ré. v1 **27 May 2022**; v2 23 Jun 2022.
- Key verified numbers: **15%** end-to-end wall-clock speedup on BERT-large (seq 512) vs the MLPerf 1.1
  training speed record; **3×** speedup on GPT-2 (seq 1K); **2.4×** on long-range arena (seq 1K–4K);
  "0.7 better perplexity on GPT-2"; "6.4 points of lift on long-document classification"; Path-X
  (seq 16K) **61.4%** accuracy; Path-256 (seq 64K) **63.1%** accuracy.
- ✅ Your "arXiv 2205.14135, Tri Dao et al., May 2022" is **correct**.

### FlashAttention-2 — VERIFIED (your guessed ID is right)
- Title: **"FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning"**
- **arXiv:2307.08691** ✅ (your guess confirmed)
- First author: **Tri Dao** (sole author this time)
- Submitted **17 Jul 2023** (v1 only)
- Venue: none listed on the arXiv page → **appears to be an arXiv-only tech report. UNVERIFIED** as
  peer-reviewed (it was later presented at ICLR 2024 per community sources — not verified here).

**What FA2 specifically improved (verbatim from the abstract):**
> "We observe that the inefficiency is due to **suboptimal work partitioning** between different thread
> blocks and warps on the GPU, causing either **low-occupancy** or **unnecessary shared memory reads/writes**.
> We propose FlashAttention-2, with better work partitioning to address these issues. In particular, we
> (1) **tweak the algorithm to reduce the number of non-matmul FLOPs**, (2) **parallelize the attention
> computation, even for a single head, across different thread blocks to increase occupancy**, and
> (3) **within each thread block, distribute the work between warps to reduce communication through shared
> memory**. These yield around **2× speedup compared to FlashAttention**, reaching **50-73% of the
> theoretical maximum FLOPs/s on A100** and getting close to the efficiency of GEMM operations."

Verified baseline/target context: FA1 "reaching only **25-40%** of the theoretical maximum FLOPs/s";
FA2 end-to-end training reaches "up to **225 TFLOPs/s per A100 GPU (72% model FLOPs utilization)**".

### FlashAttention-3 — VERIFIED (it exists)
- Title: **"FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision"**
- **arXiv:2407.08608**; v1 **11 Jul 2024**, v2 12 Jul 2024.
- Authors: **Jay Shah, Ganesh Bikshandi, Ying Zhang, Vijay Thakkar, Pradeep Ramani, Tri Dao**
  — first author **Jay Shah**, **not** Tri Dao (Tri Dao is last author).
- Venue: none listed on the arXiv page → **UNVERIFIED** as peer-reviewed (presented at NeurIPS 2024 per
  community sources — not verified here).

**Verified FA3 claims (verbatim):** "with FlashAttention-2 achieving only **35% utilization on the H100
GPU**"; "FlashAttention-3 achieves speedup on H100 GPUs by **1.5-2.0×** with FP16 reaching up to
**740 TFLOPs/s (75% utilization)**, and with FP8 reaching close to **1.2 PFLOPs/s**"; "FP8 FlashAttention-3
achieves **2.6× lower numerical error** than a baseline FP8 attention." Its three techniques:
"warp-specialization" to overlap computation and data movement via Tensor Core/TMA asynchrony,
"interleave block-wise matmul and softmax operations", and "block quantization and incoherent processing"
for FP8.

**Sources fetched:**
- https://arxiv.org/abs/2205.14135
- https://arxiv.org/abs/2307.08691
- https://arxiv.org/abs/2407.08608

---

## 12. Mixture-of-Experts — CLASSICS + MODERN SPECS VERIFIED

### Classic papers — VERIFIED
1. **"Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer"**
   - **arXiv:1701.06538**; submitted **23 Jan 2017** (v1 only)
   - Authors: **Noam Shazeer, Azalia Mirhoseini, Krzysztof Maziarz, Andy Davis, Quoc Le, Geoffrey Hinton,
     Jeff Dean** — first author **Noam Shazeer**
   - Verified highlight: "achieving greater than **1000x improvements in model capacity** with only minor
     losses in computational efficiency"; "a MoE with up to **137 billion parameters** is applied
     convolutionally between stacked LSTM layers".
2. **"Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity"**
   - **arXiv:2101.03961**; v1 **11 Jan 2021**, v3 16 Jun 2022
   - Authors: **William Fedus, Barret Zoph, Noam Shazeer** — first author **William Fedus**
   - Comments field: **"JMLR"** (i.e. published in JMLR)
   - Verified highlights: "up to **7x increases in pre-training speed**"; "pre-training up to **trillion
     parameter models**"; "**4x speedup** over the T5-XXL model"; gains measured "over the mT5-Base version
     across all **101 languages**".

### Modern MoE open-weight models — VERIFIED from primary configs/model cards

**⚠️ Critical framing:** the widely-repeated "Mixtral 8x7B is a 46.7B / 47B model" figure is a *marketing*
name; the actual config-derived totals are below, computed by me from the official `config.json`
(hidden_size 4096, intermediate_size 14336, 32 layers, 8 experts, vocab 32000):

| Model | Total params | Active params/token | # Experts | Experts/token | Source |
|---|---|---|---|---|---|
| **Mixtral 8x7B** (v0.1 & Instruct v0.1) | **≈47.4B** (computed: 47,375,712,256) | **≈13.6B** (computed: 13,552,844,800) | **8** routed (`num_local_experts: 8`) | **2** (`num_experts_per_tok: 2`) | config.json (fetched) |
| **DeepSeek-V3** | **671B** | **37B** | **256 routed + 1 shared** (`n_routed_experts: 256`, `n_shared_experts: 1`) | **8** (`num_experts_per_tok: 8`) | paper abstract + config.json |
| **DeepSeek-R1** | **671B total / 37B active** (same architecture as V3) | 37B | 256 routed + 1 shared | 8 | config.json + paper |
| **Qwen3-235B-A22B** | **235B** (per model name; config-derived architecture) | **22B** (per model name) | **128** (`num_experts: 128`) | **8** (`num_experts_per_tok: 8`) | config.json + model card |

**Detail — Mixtral 8x7B (VERIFIED from config.json):** `num_local_experts: 8`,
`num_experts_per_tok: 2`, `num_hidden_layers: 32`, `hidden_size: 4096`, `intermediate_size: 14336`,
`num_attention_heads: 32`, `num_key_value_heads: 8` (GQA), `rope_theta: 1000000.0`,
`max_position_embeddings: 32768`, `vocab_size: 32000`.
- **Naming caveat worth stating loudly:** it is *not* "8 × 7B". Each expert is a ~**three-matrix FFN**
  inside a 4096-wide model, not a standalone 7B model; the "7B" refers to the size of the *attention
  plus a single expert's FFN*-style block, and the shared attention is counted once. That is exactly why
  8 × 7B ≠ 47B, and why the total is ~47B, not ~56B.
- Since 2 of 8 experts fire per token, active ≈ 13.6B — again confirming "8x7B" is not literal.
- Note the Mixtral model card (fetched) does **not** state a parameter count; only the config does.
  The Mistral release blog (https://mistral.ai/news/mixtral-of-experts/) was fetched but the body content
  was **not retrievable** (the page returned navigation chrome only) → **UNVERIFIED** from that blog.

**Detail — DeepSeek-V3 (VERIFIED):** abstract verbatim: *"a strong Mixture-of-Experts (MoE) language model
with **671B total parameters with 37B activated for each token**."* Config verification:
`n_routed_experts: 256`, `n_shared_experts: 1`, `num_experts_per_tok: 8`, `num_hidden_layers: 61`,
`hidden_size: 7168`, `first_k_dense_replace: 3`, `moe_intermediate_size: 2048`, `n_group: 8`,
`topk_group: 4`. Also verified: pre-trained on **14.8 trillion** tokens; **2.788M H800 GPU hours** total
training (~**$5.576M** at $2/GPU-hour); context extended to 32K then **128K**; uses **MLA** + **DeepSeekMoE**
+ auxiliary-loss-free load balancing + multi-token prediction. arXiv **2412.19437**, submitted
**27 Dec 2024**, v2 18 Feb 2025. Author list is "DeepSeek-AI" (a large collective; no single first author).

**Detail — DeepSeek-R1 (VERIFIED):** arXiv **2501.12948**, v1 **22 Jan 2025**, v2 4 Jan 2026. First-listed
author entity **DeepSeek-AI** (then Daya Guo, Dejian Yang, ...). Journal reference (on the arXiv page):
**Nature volume 645, pages 633–638 (2025)**, DOI **10.1038/s41586-025-09422-z** — so R1 *is* peer-reviewed
in Nature. Its `config.json` is **byte-identical in architecture fields to DeepSeek-V3**
(same 256 routed + 1 shared experts, 8 per token, 61 layers) → **671B total / 37B active**,
though the R1 abstract itself does not restate those numbers. **Flag:** the "671B/37B" figures for R1 are
inherited from the V3 architecture + config, not read off the R1 abstract → high confidence but
marked as architecture-derived rather than directly quoted.

**Detail — Qwen3-235B-A22B (VERIFIED from config.json):** `num_experts: 128`,
`num_experts_per_tok: 8`, `num_hidden_layers: 94`, `hidden_size: 4096`, `moe_intermediate_size: 1536`,
`num_attention_heads: 64`, `num_key_value_heads: 4` (GQA), `head_dim: 128`, `rope_theta: 1000000.0`,
`max_position_embeddings: 40960`, `vocab_size: 151936`, `norm_topk_prob: true`.
The **235B total / 22B active** figures come from the model's own name convention
("235B-A22B" = 235B total, 22B activated) and the model card; I did **not** independently sum the
parameters or find the figures quoted numerically on the fetched card text
→ **the 235B/22B numbers are UNVERIFIED-from-authoritative-prose**, though strongly implied by the name.
The **128 experts / top-8** structure IS verified from config.

**(d) Conflicts / gaps to note:**
- "Mixtral 8x7B = 46.7B" vs my computed **47.4B**: the commonly cited 46.7B likely excludes embeddings
  and/or uses different vocabulary accounting. My 47.4B includes the `vocab_size × hidden_size`
  embedding (131.1M) once, with no tied embeddings (`tie_word_embeddings: false`, so there are *two*
  such matrices). **Flag this as a genuine small conflict**; both figures circulate.
- "Mixtral 8x7B active = 12.9B": I computed **13.6B** on the same basis as my 47.4B. The ~12.9B figure
  also circulates. **Conflict — state which accounting you use.**
- DeepSeek-V3's "37B activated" is the paper's own number and should be quoted directly.

**Sources fetched:**
- https://arxiv.org/abs/1701.06538
- https://arxiv.org/abs/2101.03961
- https://arxiv.org/abs/2412.19437 and https://arxiv.org/html/2412.19437v2
- https://arxiv.org/abs/2501.12948
- https://huggingface.co/deepseek-ai/DeepSeek-V3/raw/main/config.json
- https://huggingface.co/deepseek-ai/DeepSeek-R1/raw/main/config.json
- https://huggingface.co/mistralai/Mixtral-8x7B-v0.1/raw/main/config.json
- https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1/raw/main/config.json
- https://huggingface.co/Qwen/Qwen3-235B-A22B/raw/main/config.json
- https://huggingface.co/Qwen/Qwen3-235B-A22B (model card)
- https://huggingface.co/mistralai/Mixtral-8x7B-v0.1/raw/main/README.md (model card — no param count)

---

## 13. Medusa and Lookahead Decoding — QUICK VERIFICATION

### Medusa — VERIFIED
- Title: **"Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads"**
- **arXiv:2401.10774**; v1 **19 Jan 2024**, v3 14 Jun 2024
- Authors: **Tianle Cai, Yuhong Li, Zhengyang Geng, Hongwu Peng, Jason D. Lee, Deming Chen, Tri Dao**
  — first author **Tianle Cai**
- Venue: none on the arXiv page → **UNVERIFIED** as peer-reviewed (was ICML 2024 per community sources).

**Verified claims (verbatim):** adds "extra decoding heads to predict multiple subsequent tokens in
parallel", verified with "a tree-based attention mechanism". Two variants: "**Medusa-1**: Medusa is directly
fine-tuned on top of a **frozen backbone LLM**, enabling **lossless inference acceleration**";
"**Medusa-2**: Medusa is fine-tuned together with the backbone LLM ... needing a special training recipe
that preserves the backbone model's capabilities." Results: "**Medusa-1 can achieve over 2.2x speedup
without compromising generation quality**, while **Medusa-2 further improves the speedup to 2.3-3.6x**."
Also proposes self-distillation for when no training data is available, and a typical-acceptance scheme.
**Note:** only **Medusa-1** is claimed lossless; Medusa-2 trades exactness for more speedup. Do not
describe Medusa as uniformly lossless.

### Lookahead Decoding — VERIFIED
- Title: **"Break the Sequential Dependency of LLM Inference Using Lookahead Decoding"**
- **arXiv:2402.02057**; submitted **3 Feb 2024** (v1 only)
- Authors: **Yichao Fu, Peter Bailis, Ion Stoica, Hao Zhang** — first author **Yichao Fu**
- Venue: none on arXiv page → **UNVERIFIED** as peer-reviewed (was ICML 2024 per community sources).

**Verified claims (verbatim):** "**an exact, parallel decoding algorithm** that accelerates LLM decoding
**without needing auxiliary models or data stores**"; "allows trading per-step log(FLOPs) to reduce the
number of total decoding steps"; "compatible with concurrent memory-efficient attention (e.g.,
FlashAttention)"; "can speed up autoregressive decoding by up to **1.8x on MT-bench** and **4x with strong
scaling on multiple GPUs in code completion tasks**." It too is described as **exact** (no draft model).

**(d) Note the contrast:** speculative decoding (topic 10) needs a **draft model**; Medusa needs **extra
trained heads**; lookahead decoding needs **neither** a draft model nor a data store. That distinction is
the main reason to cite these together.

**Sources fetched:**
- https://arxiv.org/abs/2401.10774
- https://arxiv.org/abs/2402.02057

---

## SUMMARY: WIDELY-REPEATED CLAIMS THAT DIFFER FROM THE PRIMARY SOURCES

These are the "say it loudly" items:

1. **vLLM memory waste.** The paper reports **20.4%–38.2% of KV cache memory was USED** (i.e. ~62–80%
   wasted) — it never says "60–80% wasted". And the throughput claim is exactly **2–4× vs
   FasterTransformer AND Orca at the same latency**. Source: arXiv:2309.06180.
2. **"Shazeer 2019 Multi-Query Attention".** The actual title is *"Fast Transformer Decoding:
   One Write-Head is All You Need"* (arXiv:1911.02150). "Multi-Query Attention" is the informal name.
3. **"RoPE theta" values.** These are **library/model config choices, not RoPE-paper facts**. Verified
   real values span 10000 (DeepSeek-V3/R1, + YaRN), 500000 (Llama-3-8B), and 1000000 (Mixtral, Qwen3).
   Any blanket "modern models use 1e6" or "the RoPE paper specifies theta" is wrong.
4. **"Lost in the Middle = 20% accuracy drop."** The paper's own anchor is that middle-position
   GPT-3.5-Turbo performance falls **below its 56.1% closed-book accuracy**. Setup: 2655 NQ-Open queries,
   ≤100-token Wikipedia passages, **10/20/30** documents (not only 20). Source: arXiv:2307.03172v3.
5. **"Mixtral 8x7B = 46.7B total / 12.9B active."** Config-derived values are **≈47.4B total / ≈13.6B
   active** on an inclusive accounting; the popular figures differ slightly by accounting method.
   **8 experts, 2 activated.** DeepSeek-V3's **671B/37B, 256 routed + 1 shared, top-8** is directly
   quoted from the paper.
6. **"Speculative decoding is lossless."** True only in the precise sense of **matching the target model's
   output *distribution*** (not identical text), requiring **exact draft probabilities `q`**, the exact
   accept/reject rule (`accept if q ≤ p`, else reject w.p. `1 − p/q`, resample from `norm(max(0,p−q))`),
   sampling schemes first **cast to a standard adjusted distribution**, and (per Chen et al.) only
   "**within hardware numerics**". Chen et al. use the phrase "within hardware numerics"; Leviathan et al.
   claim distribution-exactness. Sources: arXiv:2211.17192 (esp. §2.2, §2.3, Thm 3.5, §3.3),
   arXiv:2302.01318.
7. **"Continuous batching — the term."** Orca (OSDI '22) introduced it as **"iteration-level scheduling"**
   (+ **"selective batching"**). "Continuous batching" is the community/vLLM/Anyscale name.
8. **Orca's speedup is 36.9×**, and the USENIX page renders it with a typo ("36:9×").
9. **Attention scaling is `sqrt(d_k)`**, the **key dimension** — not `sqrt(d_model)`.
10. **Context Rot is a Chroma vendor technical report (Jul 14 2025, Hong/Troynikov/Huber), not
    peer-reviewed and not on arXiv.** Cite it as a tech report.

---

## EXPLICIT UNVERIFIED LIST

- NeurIPS 2017 (NIPS) venue page for "Attention Is All You Need" — not fetched.
- RoFormer (RoPE) peer-reviewed journal venue (commonly cited as Neurocomputing 2024) — not fetched.
- ALiBi ICLR 2022 venue — not fetched (arXiv page lists no venue).
- Peer-review status of: Shazeer MQA (2019), FlashAttention-2 (ICLR 2024?), FlashAttention-3
  (NeurIPS 2024?), Medusa (ICML 2024?), Lookahead decoding (ICML 2024?), Chen et al. speculative sampling.
  In every case the **arXiv page lists no conference**, so I mark them as arXiv tech reports /
  UNVERIFIED-for-venue.
- The exact per-position numeric accuracies in the "Lost in the Middle" U-shaped figures (figures are
  images and were not numerically extracted).
- A source-verified KV-cache-per-token figure for **Llama-2-7B** specifically (my 512 KB/token is a
  computation, not a citation). The **13B OPT = 800 KB/token** figure IS source-verified (vLLM paper),
  as is **Llama-3.1-8B = 0.125 GiB per 1k tokens** (HF blog, matches the formula exactly).
- The exact Mixtral release-blog parameter count (the Mistral blog body did not render).
- Qwen3-235B-A22B's "235B total / 22B active" as numeric prose on an authoritative page (only the
  **128 experts / top-8** structure was verified from config).
- Anyscale's "23× continuous batching" figure and the cellular-batching (Gao et al. 2018) paper.
- Any claim that DeepSeek-R1's abstract itself states "671B/37B" (it does not; inherited from V3).
