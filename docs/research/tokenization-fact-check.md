# Tokenization Facts — Rigorous Source Verification

Method: all facts below were checked by fetching primary sources directly with `web_fetch`
(no `web_search` used). Every claim carries the exact URL fetched. Items I could not confirm are
marked **UNVERIFIED**. I did not invent numbers.

**Environment notes that affect reproducibility:**
- `platform.openai.com/docs/*` now issues a cross-origin redirect to `developers.openai.com`.
- `help.openai.com` returns **HTTP 403** to automated fetches (bot-blocked) — see §5.
- Appending `.md` to `developers.openai.com/api/docs/...` URLs returns clean markdown.
- `dl.acm.org` and `lesswrong.com` HTML bodies are JS-gated; the LessWrong **JSON API** works.

---

## 1. BPE origin — CONFIRMED

**Verified fact.** Sennrich, Haddow, Birch, "Neural Machine Translation of Rare Words with Subword
Units", arXiv:1508.07909.

Exact abstract-page metadata as fetched:
- Submitted 31 Aug 2015 (v1); last revised 10 Jun 2016 (v5).
- Comments field reads verbatim: **"accepted at ACL 2016; new in this version: figure 3"**.
- Authors: Rico Sennrich, Barry Haddow, Alexandra Birch.
- Abstract confirms the method is "a segmentation based on the byte pair encoding compression
  algorithm," evaluated on WMT 15 English–German and English–Russian (+1.1 / +1.3 BLEU).

So "2015/2016, ACL 2016" is **correct**: v1 is 2015, the ACL-accepted version is 2016.

Source: https://arxiv.org/abs/1508.07909

**Gage 1994 — VERIFIED (indirectly, via peer-reviewed citation).**
I could not fetch Gage 1994 itself: `dl.acm.org/doi/10.5555/177910.177914` → HTTP 403, and the
pennelynn.com C Users Journal HTML mirror → fetch failed. However, the attribution to Gage 1994 is
confirmed in **two independent scholarly/primary-adjacent sources**:

1. The peer-reviewed Singh & Strouse paper (ACL-adjacent, arXiv:2402.14903) states:
   "the prevailing methods in today's frontier models are variants of Byte Pair Encoding (BPE)
   **(Gage, 1994; Sennrich et al., 2016)**."
   Source: https://arxiv.org/html/2402.14903v1
2. Wikipedia's Byte-pair encoding article: "an algorithm, **first described in 1994 by Philip
   Gage**, for encoding strings of text into smaller strings," citing Gage, Philip (1994),
   "A New Algorithm for Data Compression", *The C User Journal*.
   Source: https://en.wikipedia.org/wiki/Byte_pair_encoding

The Wikipedia article also documents the important nuance: the **original** Gage algorithm is a
pure compression algorithm (replace highest-frequency byte pair with an unused byte), whereas the
**modified** version used in LLMs builds a token vocabulary and does *not* aim for maximal
compression. This distinction is real and frequently elided.

**Status:** Gage 1994 is a valid attribution; I confirmed it through secondary scholarly attribution
but did **not** read the 1994 primary text. Treat the primary PDF as **UNVERIFIED (not directly
fetched)**.

---

## 2. WordPiece origin and merge criterion

**Schuster & Nakajima 2012 — UNVERIFIED.** I attempted to locate a fetchable primary source for
"Japanese and Korean Voice Search" and did not successfully retrieve it (the ACL Anthology IDs I
tried returned unrelated papers: `D12-1091` = "An Empirical Investigation of Statistical
Significance in NLP"; `2022.mrl-1.1` = "Entity Retrieval from Multilingual Knowledge Graphs").
I will not assert the venue or the claim that it introduced WordPiece without having read it.
**Mark as UNVERIFIED — needs a targeted lookup (likely ICASSP 2012, not ACL Anthology).**

**BERT — CONFIRMED (that it popularized WordPiece).** arXiv:1810.04805, Devlin, Chang, Lee,
Toutanova; submitted 11 Oct 2018, revised 24 May 2019 (v2). Note: the **abstract itself does not
mention WordPiece** — the abstract page confirms the paper and "WordPiece" is used in the body.
Source: https://arxiv.org/abs/1810.04805

Hugging Face's course states directly: "**WordPiece is the tokenization algorithm Google developed
to pretrain BERT.**" It also states the key structural point: WordPiece "is very similar to BPE in
terms of the training, but the actual tokenization is done differently" — BPE tokenizes by applying
merges in learned order (respecting merge priority), while WordPiece uses **longest-match-first
(maximum matching)** at inference time.
Source: https://huggingface.co/learn/llm-course/chapter6/6

**The merge-criterion distinction (likelihood vs frequency) — COMMONLY STATED BUT THE EXACT
CRITERION IS CONTESTED / NOT CLEANLY SOURCED.** Here is what I can and cannot verify:

- **VERIFIED**: The WordPiece *inference* rule is longest-match-first / maximum matching. This is
  stated authoritatively in the Fast WordPiece paper: "When tokenizing a single word, WordPiece
  uses a longest-match-first strategy, known as maximum matching." Source: https://arxiv.org/abs/2012.15524
- **VERIFIED**: BPE's inference rule is the opposite — apply the learned merges **in the order they
  were learned**, which is a greedy frequency-derived ordering (Singh & Strouse, arXiv:2402.14903:
  "tokenization of new text proceeds by iteratively merging characters/tokens in the same order as
  learned on the training dataset").
- **NOT VERIFIED from a primary source**: the widely repeated claim that WordPiece's *training*
  merge criterion maximizes `count(pair) / (count(first) * count(second))` (a pointwise-mutual-
  information-like / likelihood ratio score) rather than raw frequency. I did **not** find this
  formula stated in a primary source I fetched. The Hugging Face WordPiece chapter body beyond the
  intro was truncated in my fetch, so I cannot confirm it from there either.

**Verdict:** The distinction "WordPiece = likelihood-based, BPE = frequency-based" is a *reasonable
summary of the commonly documented training objective* but I could **not** verify the exact
criterion from a primary source in this session. **Report it as "commonly stated; exact criterion
not verified here."** Do not present the specific ratio formula as established fact.

**Google's "Fast WordPiece Tokenization" (Song et al.) — CONFIRMED, WITH A DATE CORRECTION.**
- arXiv:2012.15524, "Fast WordPiece Tokenization", authors Xinying Song, Alex Salcianu, Yang Song,
  Dave Dopson, Denny Zhou.
- **It is a 2020 paper, not 2024** (submitted 31 Dec 2020; v3 5 Oct 2021).
- Comments field: **"Accepted to EMNLP 2021 as an oral paper"** — so it is an **EMNLP 2021** paper.
- Content: proposes strictly O(n) WordPiece tokenization inspired by Aho-Corasick, vs. prior
  O(n²)/O(nm); reports **8.2× faster than HuggingFace Tokenizers and 5.1× faster than
  TensorFlow Text** on average for general text tokenization.
Source: https://arxiv.org/abs/2012.15524

**Correction to the briefing:** the user wrote "Google's 2024 'Fast WordPiece Tokenization' paper
(arXiv 2012.15524, Song et al.)". The arXiv ID is right; the year is **2020** (published EMNLP 2021),
not 2024.

---

## 3. SentencePiece — CONFIRMED, including the whitespace mechanism

**Paper — CONFIRMED.** arXiv:1808.06226, Kudo & Richardson, "SentencePiece: A simple and language
independent subword tokenizer and detokenizer for Neural Text Processing". Comments field verbatim:
**"Accepted as a demo paper at EMNLP2018"**. Submitted 19 Aug 2018.
Source: https://arxiv.org/abs/1808.06226

Abstract confirms verbatim: "While existing subword segmentation tools assume that the input is
pre-tokenized into word sequences, SentencePiece can train subword models directly from raw
sentences, which allows us to make a purely end-to-end and language independent system." Licensed
Apache 2, code at github.com/google/sentencepiece.

**Implements BPE and unigram LM — CONFIRMED.** The official repo README states verbatim: "It
implements **subword units**—including **Byte-Pair-Encoding (BPE)** [Sennrich et al.] and the
**unigram language model** [Kudo]—with the ability to train directly from raw sentences."
Source: https://raw.githubusercontent.com/google/sentencepiece/master/README.md

**Unigram LM = Kudo 2018 "Subword Regularization" — CONFIRMED.** arXiv:1804.10959, Taku Kudo,
"Subword Regularization: Improving Neural Network Translation Models with Multiple Subword
Candidates", submitted 29 Apr 2018, **Comments: "Accepted as a long paper at ACL2018"**. Abstract
states verbatim: "we propose a new subword segmentation algorithm **based on a unigram language
model**."
Source: https://arxiv.org/abs/1804.10959

Note for precision: the *tokenizer algorithm* originates in 1804.10959 (ACL 2018); the
*SentencePiece tooling paper* is 1808.06226 (EMNLP 2018 demo). Both are Kudo. That is exactly the
relationship the user described.

**Language-independence via raw text incl. whitespace — CONFIRMED, with the precise mechanism.**
The README gives the exact mechanism, which is stronger and more specific than "whitespace treated
as a character":
- "By treating input text as a raw sequence of Unicode characters, SentencePiece enables a purely
  end-to-end, language-independent pipeline that completely eliminates the need for
  language-specific pre- or post-processing."
- "It **escapes whitespaces with a meta-symbol `▁` (U+2581) and includes it in the tokenization**."
  README's own worked example: `"I saw a girl with a telescope."` →
  `['▁I', '▁saw', '▁a', '▁girl', '▁with', '▁a', '▁', 'te', 'le', 's', 'c', 'o', 'pe', '.']`
- Rationale given: "Traditional tokenizers drop whitespace information (e.g., treating
  `Tokenize("World.")` identically to `Tokenize("World .")`), making detokenization ambiguous and
  language-dependent."
- Round-trip is `"".join(pieces).replace("▁", " ")` — lossless/reversible.
- Explicitly motivated for "languages without explicit word boundaries, such as Chinese, Japanese,
  and Thai."
- Also confirms **Subword Regularization for Unigram and BPE-Dropout for BPE**.

Source: https://raw.githubusercontent.com/google/sentencepiece/master/README.md

One caveat worth flagging: the README's performance benchmark table (SentencePiece vs "Hugging Face
Fast", FLORES-200, 24-core CPU) is a **self-reported vendor benchmark from the project's own README**,
not an independent evaluation. Treat those throughput numbers (e.g. 127.60 vs 31.49 MB/s) as
project-reported, not independently verified.

---

## 4. tiktoken — MOSTLY CONFIRMED, with two real corrections

**Repo — CONFIRMED.** github.com/openai/tiktoken, described in its own README as "a fast BPE
tokeniser for use with OpenAI's models."
Source: https://raw.githubusercontent.com/openai/tiktoken/main/README.md

**Rust + Python nature — CONFIRMED.** The README documents `pip install tiktoken` (the Python
distribution wrapping the Rust core) and notes performance "measured on 1GB of text using the GPT-2
tokeniser" and "between 3-6x faster than a comparable open source tokeniser." The Python API is
documented in `tiktoken/core.py`. The `tiktoken_ext` plugin mechanism (namespace packages, no
`tiktoken_ext/__init__.py`) confirms the Python extension surface, with `tiktoken_ext/openai_public.py`
as the reference implementation of the Rust-side encoding definitions.
Source: https://raw.githubusercontent.com/openai/tiktoken/main/README.md

**Encoding list — CONFIRMED for four of five; one is a naming nuance.**
- `r50k_base` — CONFIRMED (README + model.py; also aliased as `gpt2`).
- `p50k_base` — CONFIRMED (Codex models, text-davinci-002/003).
- `p50k_edit` — CONFIRMED (text-davinci-edit-001, code-davinci-edit-001).
- `cl100k_base` — CONFIRMED.
- `o200k_base` — CONFIRMED.
Source: https://raw.githubusercontent.com/openai/tiktoken/main/tiktoken/model.py

**NEW / MISSING FROM THE USER'S LIST: `o200k_harmony`.** `model.py` maps `gpt-oss-` → `o200k_harmony`.
So the user's list of five encodings is **incomplete** — there is at least a sixth
(`o200k_harmony`) plus `gpt2` as an alias.

**Model → encoding mapping — CONFIRMED and partially CORRECTED.** Verbatim from `model.py`:
- `o1`, `o3`, `o4-mini` → `o200k_base`
- **`gpt-5` → `o200k_base`** (both in `MODEL_TO_ENCODING` and prefix map)
- `gpt-4.1`, `gpt-4o`, `chatgpt-4o-`, `gpt-4.5-` → `o200k_base`
- `gpt-4`, `gpt-3.5-turbo`, `gpt-3.5`, `gpt-35-turbo` → `cl100k_base`
- `text-embedding-ada-002`, `text-embedding-3-small`, `text-embedding-3-large` → `cl100k_base`
- `davinci-002`, `babbage-002` → `cl100k_base`
- `text-davinci-003`, `text-davinci-002`, Codex models → `p50k_base`
- GPT-3 base models (`davinci`, `curie`, `babbage`, `ada`, etc.) → `r50k_base`
- `gpt-oss-` → `o200k_harmony`

So the user's summary — "cl100k_base for GPT-3.5/GPT-4 era, o200k_base for GPT-4o and newer" — is
**CORRECT**, and `o200k_base` does extend forward to **gpt-5** per this source of truth.
Source: https://raw.githubusercontent.com/openai/tiktoken/main/tiktoken/model.py

**Is tiktoken still the recommendation for CURRENT models? — NUANCED ANSWER; the user's instinct is
partly right.**
- tiktoken is still **maintained and current**: `model.py` maps `gpt-5` → `o200k_base`, and the code
  contains the revealing comment: `# TODO: these will likely be replaced by an API endpoint`.
- But OpenAI's own docs now steer users to a **server-side token-count API** (`/v1/responses/input_tokens`)
  instead of local tiktoken for accurate counting, and state tiktoken's limitations explicitly.
  See §7.
- So: tiktoken is **not deprecated**, but it is **no longer positioned as sufficient** for exact
  counts on current models/workloads. That is the accurate framing.

---

## 5. Token/word ratios, the "4 characters" rule, and cross-language cost

**The OpenAI "1 token ≈ 4 characters" rule — NOT CONFIRMED AT ITS ORIGINAL SOURCE (HTTP 403).**
I could not fetch the OpenAI Help Center article that is the canonical home of this rule:
`https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them` → **HTTP 403**
(and the same with a trailing `?`). I therefore **cannot confirm the exact original wording** or
whether that specific help-center page is still published. **Mark the exact wording as UNVERIFIED.**

What I *can* verify is the current OpenAI position on the rule, which is that it is **not reliable**:
the current token-counting guide lists as a limitation of local tokenizers that "**estimates like
`characters / 4` are inaccurate**" (for images/files, and by implication generally), and pitches the
API as the fix: "Avoid surprises with images and files—no more character-based estimation."
Source: https://developers.openai.com/api/docs/guides/token-counting.md

**A verifiable replacement for the ~4-characters intuition — CONFIRMED, with a unit caveat.**
The tiktoken README states: "It compresses the text: the token sequence is shorter than the bytes
corresponding to the original text. On average, in practice, **each token corresponds to about 4
bytes**." ⚠️ Note this is **4 BYTES, not 4 characters** — for ASCII English these coincide, but for
non-ASCII text (where one character can be 2–4 UTF-8 bytes) they diverge sharply. This is a very
common conflation. Source: https://raw.githubusercontent.com/openai/tiktoken/main/README.md

**~1.3 tokens/word or ~0.75 words/token — NOT VERIFIED as an authoritative figure.** I found no
primary source in this session stating either number. I explicitly decline to assert them. Reason
to be skeptical: the cookbook itself says token length varies with language, and "in some languages
tokens can be shorter than one character or longer than one word," which makes any single global
tokens-per-word constant unprincipled.

**Non-English / cross-language cost — CONFIRMED, with strong quantitative claims.** Petrov, La Malfa,
Torr, Bibi, "Language Model Tokenizers Introduce Unfairness Between Languages":
- Submitted 17 May 2023, revised 20 Oct 2023 (v2).
- **Comments: "Published at NeurIPS 2023"** — peer-reviewed.
- Abstract verbatim claims: "The same text translated into different languages can have drastically
  different tokenization lengths, with **differences up to 15 times** in some cases. These
  disparities persist even for tokenizers that are intentionally trained for multilingual support.
  **Character-level and byte-level models also exhibit over 4 times the difference** in the encoding
  length for some language pairs."
- It ties this explicitly to fairness: "unfair treatment for some language communities in regard to
  the cost of accessing commercial language services, the processing time and latency, as well as
  the amount of content that can be provided as context."
- Project page: https://aleksandarpetrov.github.io/tokenization-fairness ; code:
  https://github.com/AleksandarPetrov/tokenization-fairness
Source: https://arxiv.org/abs/2305.15425

**Ahia et al. "Do All Languages Cost the Same?" — UNVERIFIED.** I could **not** locate or fetch this
paper. My candidate arXiv IDs were both wrong: `2305.19187` = "Generating with Confidence:
Uncertainty Quantification for Black-box LLMs" (Lin, Trivedi, Sun), and `2205.06351` = "Interpretable
Climate Change Modeling With Progressive Cascade Networks". My ACL Anthology guesses
(`2022.findings-acl.277`, `2022.naacl-main.319`, `2022.bigscience-1.9`, `2022.mrl-1.1`) all returned
unrelated papers. The Semantic Scholar API returned **HTTP 429**. **Mark UNVERIFIED — I did not
verify this paper exists under that title or any of its numbers.** Do not cite it on my authority.

**Code / JSON / emoji tokenization — PARTIALLY CONFIRMED (mechanism, not exemptions).**
- **VERIFIED mechanism:** tiktoken applies a regex pre-tokenization split (`pat_str`) before BPE
  merges, so digits, punctuation, and whitespace are grouped in specific ways. Singh & Strouse
  confirm that cl100k_base's number behavior is "enforced by the cryptic `pat_str` parameter in
  their tokenization library," citing `tiktoken_ext/openai_public.py` line 76.
  Source: https://arxiv.org/html/2402.14903v1
- **VERIFIED by worked example** (cookbook, real outputs): `"2 + 2 = 4"` is **5 tokens** in
  r50k_base/p50k_base but **7 tokens** in cl100k_base/o200k_base — i.e. code/arithmetic got *more*
  expensive per character in the newer encodings. And `"お誕生日おめでとう"` is **14 tokens** in
  r50k/p50k, **9** in cl100k, **8** in o200k — showing non-English got *cheaper* but still far worse
  than English per character.
  Source: https://raw.githubusercontent.com/openai/openai-cookbook/main/examples/How_to_count_tokens_with_tiktoken.ipynb
- **UNVERIFIED:** I found no authoritative source in this session quantifying emoji tokenization
  specifically. Do not assert a figure.

---

## 6. The "strawberry" r-count quirk and tokenization-vs-arithmetic

**First, an honesty note: I could NOT find an authoritative primary source specifically on the
"how many r's in strawberry" phenomenon.** I did not fetch a paper, blog, or vendor doc that
analyzes that exact prompt. **Any specific causal claim about "strawberry" is UNVERIFIED here.** I
will not attribute it to tokenization on the strength of the widely repeated folk explanation alone.
The safest accurate statement: it is a *widely reported* failure on character-level string
operations, and multiple mechanisms are plausibly implicated; I did not verify which dominates.

What I **can** verify is the broader peer-reviewed context:

**Character-level / spelling difficulty is real and scale-dependent — CONFIRMED indirectly.**
Singh & Strouse cite it explicitly: "scale helping mitigate tokenization-induced spelling
difficulties ([Liu et al., 2023])". They also cite Wei (2023): "separating letters into individual
tokens can help in sorting words by the second letter." That is a *mitigation* result — evidence
that character-level tasks are sensitive to tokenization.
Source: https://arxiv.org/html/2402.14903v1

**Singh & Strouse (arXiv:2402.14903) — CONFIRMED, WITH CAREFUL SCOPE.**
- Authors: Aaditya K. Singh (Gatsby Computational Neuroscience Unit, UCL), DJ Strouse (Google DeepMind).
- Submitted 22 Feb 2024; 21 pages, 18 figures.
- **What it actually studies:** not character counting. It studies the effect of **number
  tokenization direction** on **multi-digit addition** in **GPT-3.5 and GPT-4 (March 2023
  checkpoints)**, plus follow-ups on gpt-3.5-turbo-0613/1106, gpt-4-0314/0613, and gpt-4-1106-preview.
- **Actual finding, stated precisely:** "right-to-left tokenization (enforced by comma separating
  numbers at inference time) leads to largely improved performance." Magnitude: "model accuracy is
  **up to 20% higher** when using R2L tokenization." At 8-shot, GPT-3.5 L2R ≈ 75.6% vs R2L ≈ 97.8%.
- **The specific mechanistic finding worth quoting:** in the "length mismatch" condition (answer has
  more digits than either addend), L2R accuracy **collapses to 8.25%**, and of the failures "the
  model **always gets the fourth digit wrong**" while always getting the first three digits right
  (which correspond exactly to the first output token). They call this "extremely stereotyped."
- **Controls ruled out:** comma-based semantic priors (they repeated with `' '`, `'.'`, `'$'`, `'#'`
  separators and found the model "largely agnostic to the separator used"), and "thinking tokens"
  (adding padding tokens to L2R did *not* recover performance).
- **Carries are NOT the explanation:** "The lack of any clear positive or negative trend indicates
  that model performance is not strongly affected by the number of carries."
- **Off-by-one errors at token boundaries:** "For nearly all these off-by-one errors ... we find that
  the error itself occurs in the **last digit of an output token**."
- **Scaling helps but does not eliminate:** "the gap between tokenization directions decreases when
  models are scaled, possibly indicating that larger models are better able to override this
  tokenization-dependent inductive bias." They note the effect "becomes stronger again" in GPT-4
  Turbo (presumably smaller than GPT-4).
- **Mitigation:** prompting the model to repeat the problem in its preferred (R2L) tokenization
  recovers most of the lost accuracy — "models can convert between tokenizations to solve problems
  correctly, but do not do so implicitly in the forward pass."
- Code/results: https://github.com/aadityasingh/TokenizationCounts
Source (abstract): https://arxiv.org/abs/2402.14903
Source (full text, all quotes above): https://arxiv.org/html/2402.14903v1

**Do NOT overstate this.** The paper's own framing is modest and it is explicit about being the
first study of a narrow question. Verbatim from its Discussion: "we analyze tokenization-dependent
effects on numerical reasoning in GPT-3.5 and GPT-4." It does **not** claim tokenization is the
general cause of LLM arithmetic failure. It notes the "gold experiment" (same architecture/data,
varying number tokenization) is "intractable in academic settings" and remains **unrun** — so the
core question is not settled by a controlled ablation. It also restricts itself to **addition** and
to an **older (2023) model generation**. Also relevant: the paper's Table 1 shows modern frontier
models mostly moved to **single-digit** tokens (PaLM, Llama 1&2, Mistral), so the specific
1–3-digit L2R artifact studied may not apply to current models.

**A useful corroborating primary source list** (from the paper's own related work, so these
attributions are at least second-hand-verified): Bostrom & Durrett 2020 ("Byte pair encoding is
suboptimal for language model pretraining", Findings of EMNLP 2020); Rumbelow & mwatkins 2023 (glitch
tokens — see §9); Lundberg 2023 (token healing); Razeghi et al. 2022 (term frequency affects
arithmetic in GPT-J).

---

## 7. Token counting in practice — MAJOR CORRECTIONS

### 7a. OpenAI — the user's hypothesis is WRONG: there IS a public token-count endpoint

**CONFIRMED.** OpenAI now documents a dedicated token-counting endpoint:
- Endpoint: **`POST /v1/responses/input_tokens`**
- Response shape: "The response includes `input_tokens` (integer) and `object: "response.input_tokens"`."
- Python SDK: `client.responses.input_tokens.count(model=..., input=...)` → `response.input_tokens`
- Also available in JS, Go, Java, Ruby, C#/.NET, plus a CLI: `openai responses:input-tokens count`
- Scope: "accepts the same input format as the Responses API. Pass text, messages, images, files,
  tools, or conversations—the API returns the exact count the model will receive."
- It "includes formatting tokens used to represent request structure, such as message roles and
  boundaries. These tokens might not appear in the text or fields you tokenize locally."
Source: https://developers.openai.com/api/docs/guides/token-counting.md

So: **the briefing's premise "I don't think OpenAI has a public token-count endpoint — verify" is
incorrect as of the current docs.** This is the single most important correction in this report.

**Official tokenizer library recommendation — tiktoken, but no longer for exact counts.**
OpenAI still names tiktoken as the local tokenizer ("Local tokenizers like
[tiktoken](https://github.com/openai/tiktoken) work for plain text"), while listing its limitations
(images/files unsupported; `characters / 4` inaccurate; tools/schemas hard to count; model-specific
behavior such as reasoning/caching changes tokenization). Same URL as above.

### 7b. Anthropic — CONFIRMED, plus a significant tokenizer change

**Endpoint CONFIRMED:** `POST https://api.anthropic.com/v1/messages/count_tokens`
(headers: `x-api-key`, `content-type: application/json`, `anthropic-version: 2023-06-01`).
Response: `{ "input_tokens": 14 }`. Python: `client.messages.count_tokens(...)`; TS:
`client.messages.countTokens(...)`. Also a CLI: `ant messages count-tokens`.

**Important caveats, verbatim from the docs:**
- "The token count is an **estimate**. In some cases, the actual number of input tokens used when
  creating a message might differ by a small amount."
- Free to use, but rate-limited by usage tier (Start 5,000 RPM; Build 10,000; Scale 20,000), with
  separate limits from message creation.
- Rejects server tools (web search, web fetch, code execution, tool search), MCP connector, and
  `image`/`document` blocks with `url` or `file` sources — images/PDFs must be base64.
- Does not use prompt caching.

**⚠️ Major finding — tokenizer change at Claude 4.7+:** "Claude 4.7 and later models and Claude
Mythos Preview use a **newer tokenizer**. The same input text produces **approximately 30 percent
more tokens** than on earlier models. The exact increase depends on the content and workload shape.
Recount prompts against the model you plan to use rather than reusing counts measured against
earlier models."

This directly refutes the idea of any stable cross-vendor "tokens per word" constant.
Source: https://platform.claude.com/docs/en/build-with-claude/token-counting.md
(HTML version: https://platform.claude.com/en/docs/build-with-claude/token-counting — note
`docs.anthropic.com` and `docs.claude.com` now redirect to `platform.claude.com`.)

### 7c. Google Gemini — CONFIRMED, exact method name

**Method CONFIRMED: `models.countTokens`**
- Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/{model=models/*}:countTokens`
- Purpose (docs): "Runs the model's tokenizer on the input `Content` and returns the token count."
- Python SDK: `client.models.count_tokens(model=..., contents=...)`; Node: `ai.models.countTokens({...})`
  → `countTokensResponse.totalTokens`; Go: `client.Models.CountTokens(ctx, model, contents, nil)`
  → `countResp.TotalTokens`
- Alternatively, `usage_metadata` on a `generateContent` response gives `prompt_token_count`,
  `candidates_token_count`, `total_token_count`.
Source: https://ai.google.dev/api/tokens

### 7d. Hugging Face — CONFIRMED

- `tokenizers` library: "provides an implementation of today's most used tokenizers, with a focus on
  performance and versatility"; "Extremely fast (both training and tokenization), thanks to the
  **Rust implementation**. Takes less than 20 seconds to tokenize a GB of text on a server's CPU."
  Also: "These tokenizers are also used in 🤗 Transformers."
  Source: https://huggingface.co/docs/tokenizers/index
- `AutoTokenizer` is documented (the "Auto classes" page exists in Transformers docs; the fetch
  returned only navigation/title content, so the `AutoTokenizer` class page itself is **VERIFIED to
  exist but its parameter details were not retrieved**).
  Source: https://huggingface.co/docs/transformers/main/en/model_doc/auto

### 7e. Chat message overhead — CONFIRMED, BUT THE NUMBER IS NOW 3, NOT 4

**This is the second most important correction.** The user cited "every message adds ~4 tokens, plus
~3 for the reply priming." From the current OpenAI cookbook notebook, verbatim code:

```python
if model in {
    "gpt-3.5-turbo-0125", "gpt-4-0314", "gpt-4-32k-0314", "gpt-4-0613",
    "gpt-4-32k-0613", "gpt-4o-mini-2024-07-18", "gpt-4o-2024-08-06"
    }:
    tokens_per_message = 3
    tokens_per_name = 1
...
num_tokens += 3  # every reply is primed with <|start|>assistant<|message|>
```

So for the currently documented models the figure is **`tokens_per_message = 3`**, `tokens_per_name = 1`,
and **+3** for reply priming. The notebook also **validates** this against the live API:
- gpt-3.5-turbo: 129 counted locally vs 129 from API
- gpt-4-0613: 129 vs 129
- gpt-4o: 124 vs 124
- gpt-4o-mini: 124 vs 124

The older "4 tokens per message" value was the pre-`gpt-3.5-turbo-0301`/`gpt-4-0314` figure and is
now **stale** in this notebook. Note the notebook's own framing also makes the model-dependence
explicit: "Note that the exact way that tokens are counted from messages **may change from model to
model**. Consider the counts from the function below an estimate, **not a timeless guarantee**."

Tool/function-call overhead is also model-dependent and separately tabulated:
gpt-4o/gpt-4o-mini use `func_init=7, prop_init=3, prop_key=3, enum_init=-3, enum_item=3, func_end=12`;
gpt-3.5-turbo/gpt-4 use `func_init=10` with the rest the same.
Source: https://raw.githubusercontent.com/openai/openai-cookbook/main/examples/How_to_count_tokens_with_tiktoken.ipynb

**Also note:** OpenAI's newer docs reframe this entirely — output token counts now include
non-visible tokens: "Some models, including GPT-5 models, generate tokens used to format or delimit
response channels, tool calls, and other message structure. These formatting tokens don't appear in
message content or `logprobs` ... the reported output or completion token count can be higher than
the number of visible tokens ... even when the reported `reasoning_tokens` value is `0`."
Source: https://developers.openai.com/api/docs/guides/token-counting.md

---

## 8. Is "words × 1.33" reliable? — NO; it is a heuristic, and I found no source endorsing it

**I found no primary source stating "words × 1.33." Mark that specific formula UNVERIFIED.**
What I *can* verify is a consistent, well-sourced body of evidence that any fixed ratio is not
reliable:

1. **OpenAI, explicitly.** The cookbook says token length varies by language, and "in some languages
   tokens can be shorter than one character or longer than one word." If a token can be longer than
   a word or shorter than a character, a single tokens-per-word multiplier is unprincipled.
   Source: https://raw.githubusercontent.com/openai/openai-cookbook/main/examples/How_to_count_tokens_with_tiktoken.ipynb
2. **OpenAI, explicitly, on the character rule.** "estimates like `characters / 4` are inaccurate";
   "no more character-based estimation."
   Source: https://developers.openai.com/api/docs/guides/token-counting.md
3. **OpenAI, explicitly, on model dependence.** Token counting "may change from model to model";
   counts are "an estimate, not a timeless guarantee."
   Source: https://raw.githubusercontent.com/openai/openai-cookbook/main/examples/How_to_count_tokens_with_tiktoken.ipynb
4. **Demonstrated empirically by OpenAI's own numbers.** The same string is 5 vs 7 tokens across
   encodings (`"2 + 2 = 4"`), and 14 vs 8 tokens across encodings (`"お誕生日おめでとう"`), and 5 vs 6
   tokens across encodings (`"antidisestablishmentarianism"`). Same text, different tokenizer,
   different ratio. Source: same cookbook URL.
5. **Anthropic, explicitly.** ~30% more tokens on Claude 4.7+ "for the same input text," varying by
   content and workload shape. Source: https://platform.claude.com/docs/en/build-with-claude/token-counting.md
6. **Peer-reviewed.** Up to 15× tokenization-length differences across translations of the same text
   (Petrov et al., NeurIPS 2023). Source: https://arxiv.org/abs/2305.15425

**Conclusion:** "words × 1.33" is a **heuristic at best, and should be labeled as such.** It is not a
reliable rule, it is tokenizer- and language-dependent, and for anything cost- or limit-sensitive the
correct approach is to call the provider's count endpoint or run the actual tokenizer.

---

## 9. Glitch tokens / SolidGoldMagikarp — CONFIRMED as a community post, explicitly NOT peer-reviewed

**Source CONFIRMED.** "SolidGoldMagikarp (plus, prompt generation)" by **Jessica Rumbelow** and
**mwatkins** (Matthew Watkins), LessWrong, dated **2023-02-05**, 680 points, **Curated**, tagged
"Glitch Tokens". Fetched via the LessWrong JSON API (the HTML page body is JS-gated and returns
essentially empty).

Source: https://www.lesswrong.com/api/post/aPeJE8bSo6rAFoLqg
(HTML: https://www.lesswrong.com/posts/aPeJE8bSo6rAFoLqg/solidgoldmagikarp-plus-prompt-generation)

**Peer-review status: EXPLICITLY NOT PEER-REVIEWED.** It is a LessWrong community blog post. It is,
however, **Curated** on LessWrong and was **cited in the peer-reviewed Singh & Strouse paper** as
"[Rumbelow & mwatkins (2023)] found many tokens which were artifacts of the data used to pre-train
the tokenizer, but presumably weren't present in the model's training data, leading to highly
unpredictable (and often comical) completions." So it has scholarly uptake, but it is a blog post,
not a paper. State it that way.

**What it actually demonstrated (verbatim/near-verbatim from the post):**
- Affiliation: "Work done at SERI-MATS, over the past two months, by Jessica Rumbelow and Matthew
  Watkins."
- "We have found a set of anomalous tokens which result in a previously undocumented failure mode
  for **GPT-2 and GPT-3** models." Instruct models "are particularly deranged."
- "Many of these tokens reliably break determinism in the OpenAI GPT-3 playground at **temperature
  0** (which theoretically shouldn't happen)."
- **How they were found:** via k-means clustering of the token embedding space; the anomalous tokens
  were disproportionately those closest to the **centroid of the entire set of 50,257 tokens**. They
  explicitly note a wrong hypothesis first (closest to origin / smallest norm — "That turned out to
  be wrong").
- **The canonical example:** asking the model to repeat `' SolidGoldMagikarp'` returned
  **`'distribute'`**. Others: `' TheNitromeFan'` → `'182'`; `' guiActiveUn'` → `' reception'`;
  `' Smartstocks'` → `'Followers'` (later `'406'`, then stalling). Behaviors were taxonomized as
  evasion ("I can't hear you"), hallucinatory completions, inter-referential hallucinations,
  **insults** (the post notes it "reliably insulted Matthew"), bizarre/ominous humour, spelling,
  pronunciation, security/testing-style deflections, religious themes, and an obsession with the
  token `' newcom'`.
- **Scale of the finding:** they ran all 50,257 tokens through "Please repeat..." prompts at
  temperature 0, narrowed to **374** problematic tokens, split into about **133 "truly weird"** and
  **241 "merely confused"**; the final published list is **141** candidate weird tokens (the author's
  footnote notes "A few new glitch tokens have been added since this was originally posted with a
  list of 133"). The "merely confused" ones are fragments of common words, e.g. `'bsite'` → "website",
  `'ignty'` → "sovereignty", `'ysics'` → "physics".
- **Their proposed (explicitly partial) explanation, verbatim:** the tokenizer "involved scraping web
  content," while "the text used to *train* GPT models is more heavily curated." Many anomalous
  tokens look scraped from e-commerce backends, Reddit threads, game-server logs — "sources which
  may well have not been included in the training corpuses." Hence "the anomalous tokens may be
  those which had very little involvement in training, so that the model 'doesn't know what to do'
  when it encounters them." They flag this as a hypothesis, and note "we don't have a good argument
  for why this would be the case" re: centroid clustering. They *guess* the temperature-0
  nondeterminism comes from floating-point errors during forward propagation.
- **Status update in the post:** "UPDATE (14th Feb 2023): ChatGPT appears to have been patched!
  However, very strange behaviour can still be elicited in the OpenAI playground."
- The post is self-described as "a work in progress," with two follow-up posts.

**So the accurate framing:** this is a **community-reported, well-documented, subsequently-cited but
not peer-reviewed** finding about GPT-2/GPT-3-era tokenizers. The causal story (tokens undertrained
because absent from the training corpus) is the authors' **hypothesis**, not a demonstrated mechanism.

---

## Summary table of corrections to the briefing

| # | Briefing said | Verified status |
|---|---|---|
| 1 | BPE = Sennrich 2015/2016 ACL 2016 | ✅ CONFIRMED exactly |
| 1 | Gage 1994 data compression origin | ⚠️ Confirmed via scholarly citation (Singh&Strouse; Wikipedia); primary 1994 text NOT fetched |
| 2 | Schuster & Nakajima 2012 | ❌ **UNVERIFIED** — could not locate/fetch |
| 2 | BERT popularized WordPiece (1810.04805) | ✅ CONFIRMED (abstract page; "WordPiece" is in body, not abstract) |
| 2 | WordPiece = likelihood-based vs BPE frequency-based | ⚠️ **Commonly stated; exact criterion NOT verified.** Inference rule (longest-match-first) IS verified |
| 2 | "Fast WordPiece Tokenization" is 2024 | ❌ **Wrong — it is 2020 (EMNLP 2021)**; ID 2012.15524 correct |
| 3 | SentencePiece 1808.06226, EMNLP 2018 demo | ✅ CONFIRMED verbatim |
| 3 | Implements BPE + unigram LM | ✅ CONFIRMED verbatim from repo README |
| 3 | Unigram LM = Kudo 1804.10959 | ✅ CONFIRMED (ACL 2018 long paper) |
| 3 | Language-independent via whitespace-as-char | ✅ CONFIRMED — mechanism is `▁` (U+2581) meta-symbol |
| 4 | tiktoken encodings: the five listed | ⚠️ CONFIRMED, but **incomplete — `o200k_harmony` also exists** |
| 4 | cl100k for 3.5/4, o200k for 4o+ | ✅ CONFIRMED, and o200k extends to **gpt-5** |
| 4 | Rust + Python | ✅ CONFIRMED |
| 4 | OpenAI may recommend a newer lib for GPT-5-era | ⚠️ **Partly right**: tiktoken still current (gpt-5→o200k_base) but OpenAI now steers to a **count API** |
| 5 | ~1.3 tok/word, 0.75 words/tok | ❌ **UNVERIFIED** — no primary source found |
| 5 | OpenAI "1 token ≈ 4 chars" | ⚠️ **Exact wording UNVERIFIED (help.openai.com = HTTP 403)**; current docs call `characters / 4` **inaccurate**. tiktoken says ~4 **bytes** |
| 5 | Non-English costs more | ✅ CONFIRMED, peer-reviewed (NeurIPS 2023): up to **15×** |
| 5 | Ahia et al. "Do All Languages Cost the Same?" | ❌ **UNVERIFIED** — could not locate |
| 6 | "strawberry" r-count | ❌ **UNVERIFIED** — no authoritative source found; do not assert causation |
| 6 | Singh & Strouse 2402.14903 finding | ✅ CONFIRMED precisely (R2L helps up to 20%; length-mismatch collapses to 8.25%; always digit-4 wrong) |
| 7 | OpenAI has NO public token-count endpoint | ❌ **WRONG — `POST /v1/responses/input_tokens` exists** |
| 7 | Anthropic count_tokens | ✅ CONFIRMED: `POST /v1/messages/count_tokens`. **Also: Claude 4.7+ new tokenizer = ~30% more tokens** |
| 7 | Gemini countTokens | ✅ CONFIRMED: `models.countTokens` |
| 7 | HF `tokenizers` + `AutoTokenizer` | ✅ CONFIRMED |
| 7 | ~4 tokens/message + 3 priming | ❌ **STALE — current cookbook uses `tokens_per_message = 3` + 3 priming** |
| 8 | words × 1.33 reliable? | ❌ No — heuristic only; six independent sources say it varies |
| 9 | SolidGoldMagikarp glitch tokens | ✅ CONFIRMED; **LessWrong blog post, NOT peer-reviewed**; hypothesis not mechanism |
