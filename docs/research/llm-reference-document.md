# Modern LLMs: A Dense Technical Reference for a Beginner-to-Intermediate Curriculum

**Audience:** a learner in the Philippines on a $0 budget who knows almost nothing about AI but wants to deeply understand modern LLMs.
**Purpose:** reference material for a fact-checked curriculum.
**Compiled:** from primary sources fetched during compilation (arXiv abstract & HTML pages, official vendor documentation, USENIX proceedings pages, model `config.json` files).

---

## 0. HOW TO READ THIS DOCUMENT (READ THIS FIRST)

This document follows one hard rule: **every specific number, version, date, or benchmark is either hedged, dated, or marked.**

Three markers are used throughout:

| Marker | Meaning |
| --- | --- |
| **[VERIFY]** | A specific number/version/date that is volatile. Confirm against the live source before publishing. Almost all provider pricing, model names, and context sizes carry this. |
| **[UNVERIFIED]** | We could not confirm this from a primary source. Treat as a lead, not a fact. Several of these are things the wider internet repeats confidently. |
| **[MYTH]** | A commonly-repeated claim that is wrong, inverted, or a significant oversimplification. |

### A warning about the state of the field *and* of this document

The provider documentation fetched while writing this reflects an **unusually advanced state** of the APIs — newer than the model landscape most tutorials assume. We hit, for example:

- OpenAI's current frontier model documented as **`gpt-6-astra`**, with **`gpt-5.1`** (`gpt-5.1-2025-11-13`) as a prior-generation model. **[VERIFY]**
- Anthropic's current lineup documented as **Claude Fable 5.1 / Opus 5 / Sonnet 5 / Haiku 4.5**. **[VERIFY]**
- Google's docs advertising **Gemini 3.8 Flash** (page footer: "Last updated 2026-09-02"). **[VERIFY]**
- OpenAI docs referencing an **Assistants API sunset of 26 August 2026**. **[VERIFY]**

**If any part of your curriculum depends on the exact current model matrix, re-check it against live docs on the day you publish.** The *concepts* in this document (tokenization, attention, KV cache, sampling) are stable for years; the *model names, prices, and context sizes* are not stable for months.

### A note on what could not be verified

Web search was unavailable in this session, so **all** verification was done by directly fetching primary sources. Where a source could not be reached (some vendor pages block automated fetches; the OpenAI help centre returns HTTP 403), this is stated rather than papered over. Section 11 collects every **[UNVERIFIED]** item in one place.

---

# 1. TOKENIZATION

## 1.1 What a token is

A token is the atomic unit a language model reads and writes. It is **not** a word and **not** a character — it is a chunk of bytes that the tokenizer's training decided was a useful common substring. Models never see text; they see a sequence of integer token IDs drawn from a fixed **vocabulary**, and they predict the next ID.

The tokenizer's job is to convert text → IDs (**encode**) and IDs → text (**decode**).

Three properties, stated by the tiktoken README as the desirable properties of BPE, are worth stating because they explain *why* this design won:

1. It is reversible and lossless — you can convert tokens back to the original text exactly.
2. It works on arbitrary text, **even text not in the tokenizer's training data**.
3. It compresses text — the token sequence is shorter than the bytes of the original.

*(Source: `tiktoken` README, fetched from `raw.githubusercontent.com/openai/tiktoken/main/README.md`.)*

## 1.2 Byte-pair encoding (BPE)

**BPE** is a compression algorithm repurposed for NLP. The algorithm:

1. Start with a base vocabulary (often individual bytes, or characters).
2. Count all adjacent symbol pairs in the training corpus.
3. Merge the most frequent pair into a new symbol.
4. Repeat for a fixed number of merges, building a vocabulary of subwords.

The paper that brought BPE to NLP is **Sennrich, Haddow & Birch, "Neural Machine Translation of Rare Words with Subword Units"** — [arXiv:1508.07909](https://arxiv.org/abs/1508.07909). Verified details: v1 submitted **31 Aug 2015**, v5 **10 Jun 2016**, comments field reads **"accepted at ACL 2016"**.

The algorithm's origin is conventionally attributed to **Gage (1994)**, a data-compression article. **[UNVERIFIED]** — the primary text could not be fetched (publisher blocked automated access); the attribution is confirmed only via secondary citation.

> **A concrete intuition.** Because English "ing" is a common subword, BPE tends to split "encoding" into `encod` + `ing` rather than `enc` + `oding`. The model therefore sees the same `ing` token across many different words, which helps it generalise grammar. *(This exact example is from the tiktoken README.)*

## 1.3 WordPiece

WordPiece is the tokenizer associated with **BERT** (Devlin et al., [arXiv:1810.04805](https://arxiv.org/abs/1810.04805)).

- It is commonly attributed to **Schuster & Nakajima (2012)**, "Japanese and Korean Voice Search". **[UNVERIFIED]** — we could not locate or fetch this paper; it is likely an ICASSP 2012 paper and is not in the ACL Anthology.
- **The inference rule is verified and is the practical difference:** WordPiece encoding uses **longest-match-first** greedy matching. This is confirmed in **Song et al., "Fast WordPiece Tokenization"**, [arXiv:2012.15524](https://arxiv.org/abs/2012.15524). **Note the date correction: this paper is 2020 / EMNLP 2021, NOT 2024.**
- **The merge criterion is [UNVERIFIED].** WordPiece is usually described as merging the pair that maximises the *likelihood* of the training data, `count(pair) / (count(a) * count(b))`, as opposed to BPE's raw *frequency*. This distinction is repeated everywhere but we could **not** confirm the formula from a primary source. State it as "commonly stated; exact criterion not verified from a primary source."

## 1.4 SentencePiece

**Kudo & Richardson, "SentencePiece: A simple and language independent subword tokenizer and detokenizer for Neural Text Processing"** — [arXiv:1808.06226](https://arxiv.org/abs/1808.06226), an **EMNLP 2018 system demonstration** paper. Verified.

Two facts matter:

1. **SentencePiece is a toolkit, not an algorithm.** It implements **both** BPE and the **unigram language model** algorithm. The unigram variant comes from **Kudo, "Subword Regularization"**, [arXiv:1804.10959](https://arxiv.org/abs/1804.10959), an **ACL 2018** long paper. Verified.
2. **Why it is "language independent":** it operates on raw text **without pre-tokenization** (no assumption that words are separated by spaces). The precise mechanism, verified from the SentencePiece README, is that it **escapes whitespace as a meta-symbol `▁` (U+2581) and tokenizes it** — so whitespace becomes an ordinary in-vocabulary symbol rather than a delimiter the tokenizer relies on. This is **stronger and more precise** than the common hand-wave "whitespace is treated as a character."

This is why SentencePiece is the default choice for Japanese, Chinese, and Thai, where "words" are not space-delimited — and why it is used by Llama-family and T5-family models.

## 1.5 tiktoken

**`tiktoken`** is OpenAI's fast BPE tokenizer, written in **Rust with Python bindings** (repo: `github.com/openai/tiktoken`). The README claims it is **3–6× faster** than a comparable open-source tokenizer, measured on 1 GB of text with the GPT-2 tokenizer against `tokenizers==0.13.2` / `transformers==4.24.0` / `tiktoken==0.2.0`. **Note: that benchmark is old and the pinned versions are stale — treat the 3–6× as historical. [VERIFY]**

### Encodings (verified directly from `tiktoken/model.py` source)

The commonly-cited list is `r50k_base, p50k_base, p50k_edit, cl100k_base, o200k_base`. **There is a sixth that the standard list omits: `o200k_harmony`.**

Verified model → encoding mapping from the source:

| Encoding | Models |
| --- | --- |
| `o200k_base` | `o1`, `o3`, `o4-mini`, **`gpt-5`**, `gpt-4.5-*`, `gpt-4.1-*`, `gpt-4o-*`, `chatgpt-4o-*` |
| `o200k_harmony` | `gpt-oss-*` |
| `cl100k_base` | `gpt-4-*`, `gpt-3.5-turbo-*`, `text-embedding-ada-002`, `text-embedding-3-small`, `text-embedding-3-large` |
| `p50k_base` / `p50k_edit` | deprecated `text-davinci-002/003`, Codex, edit models |
| `r50k_base` | deprecated GPT-3 base models, `davinci`/`curie`/`babbage`/`ada` |
| `gpt2` | `gpt2` |

### Is tiktoken still current? — the nuanced answer

**Partly.** The precise situation, verified from source:

- tiktoken **is still maintained** and is **not** deprecated. `gpt-5` maps to `o200k_base`, so `o200k_base` **is** still current for that model.
- **But** the source file contains the comment `# TODO: these will likely be replaced by an API endpoint`, and OpenAI's own *Counting tokens* guide now **steers users to the server-side count API** and lists tiktoken's limitations explicitly.

> The instinct that "tiktoken's exactness is slipping for newest models" is half-right, but **for a different reason than usually assumed**: it is not that a new encoding silently replaced `o200k_base`, but that (a) a genuinely new encoding `o200k_harmony` exists for `gpt-oss`, and (b) OpenAI now recommends the API because model-specific behaviour (reasoning, caching, tools) changes the count in ways a local tokenizer cannot see.

*(Sources: `raw.githubusercontent.com/openai/tiktoken/main/tiktoken/model.py` and `README.md`; `developers.openai.com/api/docs/guides/token-counting.md`.)*

## 1.6 Tokens per word — and why the ratio varies

**This is the single most repeated and most misleading number in beginner material.**

### What is actually well-sourced

- **Google/Gemini docs (fetched, `ai.google.dev/gemini-api/docs/tokens`):** "**For Gemini models, a token is equivalent to about 4 characters. 100 tokens is equal to about 60-80 English words.**" This is a *Gemini-specific* statement, and it is a range, not a constant.
- **tiktoken README:** the claim is "**each token corresponds to about 4 bytes**". Note this says **bytes**, not characters. **Conflating "4 bytes" with "4 characters" is a very common error and it breaks immediately for non-ASCII text** (see §1.7).

### What is NOT well-sourced

- **"~1.3 tokens per word" and its inverse "~0.75 words per token": [UNVERIFIED].** No primary source was found. These are folklore derived from the ~4-characters figure. **Do not publish them as facts.**
- **The exact original wording of OpenAI's "1 token ≈ 4 characters" help-centre rule: [UNVERIFIED].** `help.openai.com` returns HTTP 403 to automated fetches, so we could neither confirm the wording nor whether it is still published.
- **Critically, OpenAI's current docs call character-based estimation inaccurate.** The token-counting guide states that local tokenizers "work for plain text, but they have limitations", and lists: "**Images and files are not supported — estimates like `characters / 4` are inaccurate**", tools and schemas add hard-to-count tokens, and model-specific behaviour can change tokenization. *(Fetched from `developers.openai.com/api/docs/guides/token-counting.md`.)*

### Why the ratio genuinely varies — the mechanisms

There is no universal constant because the ratio depends on **three independent things**:

1. **The tokenizer's training corpus.** A vocabulary trained mostly on English will have long English subwords and short fragments for everything else.
2. **The content domain.** Code, JSON, and markup use punctuation and identifiers the vocabulary under-represents.
3. **The language.** This is the big one — see below.

## 1.7 What tokenization does to code, JSON, non-English languages, and emoji

### Non-English languages — this is peer-reviewed and quantified

**Petrov, La Malfa, Torr & Bibi, "Language Model Tokenizers Introduce Unfairness Between Languages"** — [arXiv:2305.15425](https://arxiv.org/abs/2305.15425), **published at NeurIPS 2023**. Verified verbatim from the abstract:

- "The same text translated into different languages can have **drastically different tokenization lengths, with differences up to 15 times** in some cases."
- "These disparities **persist even for tokenizers that are intentionally trained for multilingual support**."
- "**Character-level and byte-level models also exhibit over 4 times the difference** in the encoding length for some language pairs."
- The paper explicitly ties this to "**the cost of accessing commercial language services, the processing time and latency, as well as the amount of content that can be provided as context**."

**This is a genuinely important equity point for a learner in the Philippines.** The practical consequence: *the same prompt costs more, runs slower, and consumes more of the context window in Tagalog, Cebuano, or Ilocano than in English.* The unfairness is measurable and peer-reviewed, not a rumour.

- **Ahia et al., "Do All Languages Cost the Same?": [UNVERIFIED].** We could not locate this paper; candidate arXiv IDs returned unrelated papers and Semantic Scholar rate-limited the lookup. Do not cite it without a targeted lookup.

### Code and JSON

Code and structured text tokenize less efficiently than prose because they contain:

- **Rare identifiers** — long variable/function names are split into fragments.
- **Dense punctuation** — braces, brackets, quotes, colons, and commas each tend to consume tokens, and long runs of whitespace/indentation tokenize poorly.
- **Serialised data** repeats keys and structural characters constantly.

**We found no authoritative benchmark quantifying tokens-per-line-of-code or per-JSON-object. [UNVERIFIED] — do not invent one.** The correct teaching move is to tell learners to **measure with the actual tokenizer** rather than assume a ratio.

### Emoji

**We found no authoritative quantification of emoji tokenization costs. [UNVERIFIED].** Emoji are multi-byte UTF-8 sequences and are frequently *absent or rare* in tokenizer training data, so they commonly fragment across several tokens — but **state this as a mechanism, not as a measured number.**

## 1.8 Why tokenization matters

Three concrete consequences:

1. **Cost.** Providers bill per token, on both input and output. Since token count varies by language and content type, *the same conceptual request has different prices depending on language and formatting.*
2. **Context limits.** The context window is measured in tokens, not words or characters. A document that "fits" in English may not fit after translation.
3. **Model behaviour.** The token boundaries are the units the model actually manipulates. This creates real, measurable reasoning artifacts (next section).

## 1.9 Known tokenizer quirks — stated carefully

### Arithmetic and number tokenization: verified, and more interesting than the folklore

**Singh & Strouse, "Tokenization counts: the impact of tokenization on arithmetic in frontier LLMs"** — [arXiv:2402.14903](https://arxiv.org/abs/2402.14903), submitted **22 Feb 2024**. Verified from the abstract:

- Different models use different number schemes: "**popular models like LLaMa and PaLM opting for single-digit tokenization while GPT-3.5 and GPT-4 have separate tokens for each 1-, 2-, and 3-digit numbers**."
- **The headline finding:** for GPT-3.5 and GPT-4, "**right-to-left tokenization (enforced by comma separating numbers at inference time) leads to largely improved performance**" relative to standard left-to-right tokenization.
- "**Model errors when using standard left-to-right tokenization follow stereotyped error patterns, suggesting that model computations are systematic rather than approximate.**"
- The model "**is able to convert between tokenizations easily**", so chain-of-thought-style approaches can recover performance on left-to-right inputs.
- **The gap shrinks as models get larger**, "possibly indicating that larger models are better able to override this tokenization-dependent inductive bias."

**The honest teaching conclusion:** tokenization demonstrably induces a *measurable, stereotyped* bias in arithmetic. It is **not** the sole cause of arithmetic failure, and the effect **weakens with scale**. Both halves of that sentence matter.

### The "strawberry" r-counting quirk — **[MYTH] as usually told**

The widely-repeated claim is that models fail to count the r's in "strawberry" *because of tokenization*.

**We found no authoritative source analysing that specific prompt, and we deliberately decline to attribute it to tokenization.** What *is* supported is weaker and adjacent:

- Singh & Strouse cite prior work on "tokenization-induced spelling difficulties".
- Character-level sensitivity is real, and there is a **mitigation** result: splitting letters into individual tokens helps with tasks like sorting by the second letter.

**Publishable framing:** "Models are inconsistent at character-level manipulation. Tokenization is a plausible contributor, but the specific 'strawberry' example is folklore; a documented, measurable, related finding is that *number* tokenization direction measurably changes arithmetic accuracy (Singh & Strouse 2024)."

### Glitch tokens

**"SolidGoldMagikarp"** — a write-up by **Jessica Rumbelow and mwatkins, LessWrong, dated 2023-02-05**. Verified by fetching the LessWrong post via its JSON API.

**Status: a community investigation, CURATED BUT NOT PEER-REVIEWED.** It documented that certain rare tokens in `cl100k_base` (including the string "SolidGoldMagikarp") produced bizarre model behaviour such as evasion, insults, or confusion when included in prompts. The leading explanation is that these tokens were effectively **untrained** — present in the vocabulary but essentially never seen as targets during training. Treat it as a well-documented community finding, not as a peer-reviewed result.

## 1.10 How to count tokens in practice

### OpenAI — **there IS a public token-count endpoint** (contrary to a common assumption)

The widely-believed claim "OpenAI has no token-count endpoint" **is now wrong.** Verified from `developers.openai.com/api/docs/guides/token-counting.md`:

```
POST /v1/responses/input_tokens
```
- Response contains `input_tokens` (integer) and `object: "response.input_tokens"`.
- Python SDK: `client.responses.input_tokens.count(model=..., input=...)`
- It accepts the **same payload as `responses.create`** — text, messages, images, files, tools, conversations — and "returns the exact count the model will receive."
- It counts **formatting tokens** for message roles/boundaries that local tokenization would miss.
- It is **input-only** (it counts input tokens, not output).

**Important caveat about output tokens** (verbatim from the same guide): reported output usage "includes all tokens generated by the model, not only the text visible in a response." Some models "generate tokens used to format or delimit response channels, tool calls, and other message structure. These formatting tokens don't appear in message content or `logprobs`." So **reported output count can exceed the visible tokens even when `reasoning_tokens` is 0.** Do not assume a fixed gap.

### The chat-message overhead figure — **the famous "4" is stale**

The well-known cookbook figure is "**every message adds ~4 tokens, plus 3 for the reply priming**". **Current verified state:** the current `How_to_count_tokens_with_tiktoken.ipynb` in the openai-cookbook sets:

- `tokens_per_message = 3`
- `tokens_per_name = 1`
- `num_tokens += 3` for reply priming

for `gpt-3.5-turbo-0125`, `gpt-4-0314/0613`, `gpt-4o-mini-2024-07-18`, `gpt-4o-2024-08-06`. The notebook validates these against the live API (e.g. **129 vs 129** for `gpt-4`; **124 vs 124** for `gpt-4o`).

**So the "4 tokens per message" figure is the older, pre-0613-era number and is now stale.** The notebook also warns explicitly: "the exact way that tokens are counted from messages may change from model to model. Consider the counts from the function below an estimate, not a timeless guarantee."

*(Note these are **legacy chat models**; the modern path is the `input_tokens` endpoint. Treat all hand-rolled overhead arithmetic as legacy-era.)*

### Anthropic

- Endpoint: **`POST https://api.anthropic.com/v1/messages/count_tokens`**, returning `{"input_tokens": N}`. Verified.
- Takes the same structured inputs as Messages, incl. system prompts, tools, images, PDFs.
- Returns `invalid_request_error` for **server tools** (web search, web fetch, code execution, tool search — *except* the advisor tool), the MCP connector, and `image`/`document` blocks with a `url` or `file` source. Send images/PDFs as base64 to count them.
- The count is **an estimate** — "the actual number of input tokens used when creating a message might differ by a small amount."
- May include **tokens added automatically by Anthropic for system optimizations**; "**You are not billed for system-added tokens.**"
- **Critical, and it kills every fixed cross-vendor ratio:** "**Claude 4.7 and later models and Claude Mythos Preview use a newer tokenizer. The same input text produces approximately 30 percent more tokens than on earlier models.**" Anthropic warns to recount against the target model rather than reuse older counts. **[VERIFY]**

*(Source: `platform.claude.com/docs/en/build-with-claude/token-counting`.)*

### Google Gemini

- Method: **`models.countTokens`**; REST `POST https://generativelanguage.googleapis.com/v1beta/{model=models/*}:countTokens`. Verified.
- Python: `client.models.count_tokens(model=..., contents=...)`; JS: `client.models.countTokens(...)`.
- Returns the **input only**; use the response `usage` for output/thinking/cached/tool breakdowns.
- Docs state the tokenizer is approximately **4 characters per token / 100 tokens ≈ 60–80 English words**.

### Hugging Face

- The **`tokenizers`** library (Rust core, Python bindings) and **`transformers`**' **`AutoTokenizer`** are the standard open-source path.
- `AutoTokenizer.from_pretrained(model_id)` loads the tokenizer matching a model, which is essential because **tokenizers are model-specific** and cannot be swapped without changing token counts.

### The practical lesson for a $0-budget learner

Use free local tooling to **measure** rather than guess:

```python
# Open-weight models (free, offline, exact for that model)
from transformers import AutoTokenizer
tok = AutoTokenizer.from_pretrained("model-id-here")
print(len(tok.encode("your text here")))

# Legacy OpenAI models only
import tiktoken
enc = tiktoken.get_encoding("o200k_base")
print(len(enc.encode("your text here")))
```

**And measure the same sentence in English and in your own language.** That single experiment teaches §1.7 better than any paragraph.

---

# 2. CONTEXT WINDOWS

## 2.1 What the context window is

The context window is **all the text a model can reference when generating a response, including the response itself.** Anthropic's docs put it well: it is a "working memory" for the model, distinct from the training corpus.

Everything in the request counts:
- the system prompt / instructions,
- every message (including tool results, images, documents),
- **your tool definitions** — a frequently-forgotten cost,
- and the model's **generated output**, including **extended thinking / reasoning tokens**.

## 2.2 Context window sizes across generations and providers **[VERIFY — ALL OF IT]**

**This entire subsection is volatile. It is dated to the fetch date of this document. Re-verify before publishing.**

### Anthropic (fetched from `platform.claude.com/docs/en/build-with-claude/context-windows`)

- Models with a **1M-token** context window include: Claude Fable 5.1, Claude Mythos 5.1, Claude Fable 5, Claude Mythos 5, Claude Opus 5, Claude Opus 4.8, Claude Opus 4.7, Claude Opus 4.6, Claude Sonnet 5, Claude Sonnet 4.6, and Claude Mythos Preview.
- A single request to any of them can generate up to **128k output tokens** (`max_tokens`).
- **Other Claude models, including Claude Sonnet 4.5, have a 200k-token context window.**
- For 1M-window models, **1M is the default** — no beta header needed, billed at standard pricing.
- A single request can include **up to 600 images or PDF pages** (100 for 200k-context models).
- Historical note for curriculum purposes: the **200k** window was the long-standing Claude default, and **1M** arrived later. **[VERIFY exact dates before publishing a timeline.]**

### OpenAI (fetched from `developers.openai.com/api/docs/models/...`)

- `gpt-6-astra`: **1,050,000** context window, **922,000 max input tokens**, **128,000 max output tokens**. **[VERIFY]**
- `gpt-5.1`: **400,000** context window, **128,000 max output tokens**. **[VERIFY]**
- Note the distinction OpenAI draws between **context window** and **max input tokens** — they are not the same number.

### Google Gemini (fetched from `ai.google.dev/gemini-api/docs/models/gemini-3.8-flash`)

- `gemini-3.8-flash`: input token limit **1,048,576**, output token limit **65,536**. **[VERIFY]**

### Historical progression (the shape, which is more useful than exact numbers)

For teaching purposes the *trajectory* is the point:

| Era (approx.) | Typical context | Notes |
| --- | --- | --- |
| Original transformer (2017) | 512 tokens | The paper's base config |
| GPT-2 era | 1,024 | |
| GPT-3 era | 2,048 → 4,096 | |
| GPT-3.5 / GPT-4 (2023) | 4k–32k, later 128k | |
| Claude 2 / 2.1 (2023) | 100k → 200k | The first big jump |
| 2024–2026 | 128k–200k common; 1M available | |

**Every number in that table is approximate and should be verified or presented as "roughly". [VERIFY]**

## 2.3 "Lost in the middle" (Liu et al.) — the accurate version

**Liu, Lin, Hewitt, Paranjape, Bevilacqua, Petroni & Liang, "Lost in the Middle: How Language Models Use Long Contexts"** — [arXiv:2307.03172](https://arxiv.org/abs/2307.03172). Verified: submitted **6 Jul 2023**, v3 **20 Nov 2023**, **accepted for publication in TACL 2023**.

**The actual finding (verbatim from the abstract):**

> "we observe that performance is often highest when relevant information occurs at the beginning or end of the input context, and significantly degrades when models must access relevant information in the middle of long contexts, **even for explicitly long-context models**."

### The precise setup (get this right — most retellings don't)

- Task: **multi-document question answering** and **key-value retrieval**.
- **2,655 NaturalQuestions-Open queries** whose annotated long answer is a paragraph.
- Documents: **Wikipedia passages of at most 100 tokens**; exactly **1 answer document + k−1 distractor documents** retrieved by Contriever(MS-MARCO), presented in decreasing-relevance order.
- **Context sizes tested: 10, 20 AND 30 documents** (appendix G covers all three). So "20 documents" is **one of three** conditions, not the only one.
- Accuracy metric: any annotated answer appears in the output.
- Models evaluated were **mid-2023**: MPT-30B-Instruct, LongChat-13B-16K, GPT-3.5-Turbo (+16K), Claude-1.3 (+100K), plus Flan-T5-XXL / Flan-UL2 and a subset with GPT-4.

### **[MYTH] The "20% accuracy drop" framing is not the paper's**

The famous claim "GPT-3.5-Turbo accuracy drops by 20% when the answer is in the middle" **is not how the paper states it.**

**The paper's actual anchor is a comparison to closed-book performance:** with the relevant information in the middle, GPT-3.5-Turbo's multi-document QA accuracy is **lower than its closed-book (no documents at all) accuracy of 56.1%**. That is a far more striking claim — *providing the answer made it worse than providing nothing.*

Other verified figures:
- Key-value retrieval used **75 / 140 / 300** pairs; worst case for MPT-30B was **45.6%**.
- Open-domain QA: going from 20 → 50 retrieved documents gained only **~1.5%** (GPT-3.5-Turbo) and **~1%** (Claude-1.3).
- Flan-UL2 within-2048: worst-vs-best difference **1.9% absolute**.
- MPT base → Instruct narrowed the worst-case gap from **~10% to ~4%**.
- **Per-position figure values: [UNVERIFIED]** — the values are in figures, not extractable text.

### Why this matters practically

Retrieval-augmented generation (RAG) is often taught as "stuff more documents in context; more context = better." Liu et al. and the work below show that **is false**. **Where** you put information matters as much as **whether** you include it. Put critical instructions and evidence at the **start or end**, not buried in the middle.

## 2.4 Context rot / long-context degradation

**Two distinct things share this name. Separate them.**

### (a) The Chroma technical report — verified real, but NOT peer-reviewed

**"Context Rot: How Increasing Input Tokens Impacts LLM Performance"** — authors **Kelly Hong, Anton Troynikov, Jeff Huber**, dated **14 July 2025**, published by **Chroma** and explicitly labelled a **"Chroma Technical Report"**. URL: **https://www.trychroma.com/research/context-rot**.

**Status — state this clearly in the curriculum: it is a VENDOR technical report, NOT peer-reviewed, and we found no arXiv preprint.** Its own citation uses `@techreport institution={Chroma}`.

Verified contents:
- **18 LLMs** evaluated (GPT-4.1, Claude 4, Gemini 2.5, Qwen3).
- Main finding (verbatim): "**model performance varies significantly as input length changes, even on simple tasks**"; "Across all experiments, model performance consistently degrades with increasing input length."
- Tasks: NIAH (needle-in-a-haystack) extensions, **LongMemEval** (113k-token full vs ~300-token focused prompts, 306 prompts), and a **Repeated Words** task (12 lengths, 1090 variations).
- Scale: a grid of **8 input lengths × 11 needle positions**; **194,480 LLM calls**; 69 refusals (0.035%).
- **Counterintuitive verified finding:** "**structural coherence consistently hurts model performance**" — **shuffled haystacks BEAT logically structured ones across all 18 models.**
- The report's own stated limitations: **mechanisms are unexplained**; the task set is not exhaustive of real use.

### (b) Vendor-confirmed terminology

Notably, **Anthropic's own official documentation now uses the term "context rot"** in its Context Windows page:

> "A larger context window allows the model to handle more complex and lengthy prompts, but **more context isn't automatically better. As token count grows, accuracy and recall degrade, a phenomenon known as _context rot_.** This makes curating what's in context just as important as how much space is available."

*(Fetched from `platform.claude.com/docs/en/build-with-claude/context-windows`.)*

**This is a genuinely strong signal for the curriculum:** the phenomenon is now acknowledged by a frontier lab in official docs, *and* the underlying quantitative study is a non-peer-reviewed vendor report. Teach both halves honestly.

## 2.5 Prompt vs completion tokens, and how the window is shared

- **Prompt (input) tokens:** everything you send.
- **Completion (output) tokens:** everything the model generates, **including invisible formatting tokens and reasoning tokens**.
- **The window is shared.** Both count against the same budget. Anthropic: "**Everything in the request counts toward the context window: the system prompt, every message in `messages` (including tool results, images, and documents), and your tool definitions. The output Claude generates for the turn, including its extended thinking, counts too.**"
- **Providers report actual consumption in a `usage` field.** Anthropic splits input count across `input_tokens`, `cache_read_input_tokens`, and `cache_creation_input_tokens` — **and all three count toward the window.**
- **Prompt caching does not exempt tokens from context or rate limits.** OpenAI: "**Cached input tokens still count toward tokens-per-minute limits.**"
- **Reasoning tokens are billed as output tokens** (Anthropic) and are a subset of `max_tokens`.

**A subtlety worth teaching:** with reasoning models, **"I sent 500 tokens and got a 200-token answer" can still consume thousands of tokens**, because reasoning tokens are generated, billed, and (on some models) retained in context for later turns.

**Multi-turn accumulation:** each turn re-sends the growing history, so **a conversation's per-turn input grows roughly linearly in the number of turns.** This is why cost in chat applications grows super-linearly in conversation length.

## 2.6 Practical strategies for working within limits

| Strategy | What it does | Trade-off |
| --- | --- | --- |
| **Trimming** | Drop oldest turns | Loses context; may break references |
| **Summarisation / compaction** | Replace old turns with a model-written summary | Lossy; costs a model call; **breaks prompt-cache prefixes** |
| **Retrieval (RAG)** | Fetch only relevant chunks per query | Needs an embedding/index pipeline; retrieval can miss |
| **Chunking** | Split documents into smaller units for retrieval | Chunk-size choice affects retrieval quality |
| **Reranking** | Re-score retrieved chunks with a stronger model | Extra latency/cost (see §6.9) |
| **Prompt caching** | Reuse a stable prefix cheaply | Prefix must be byte-identical; see §4.6 |
| **Put key info at the edges** | Exploits the lost-in-the-middle effect | Requires knowing what matters |

### The single most important practical rule

**A big context window is not a substitute for good retrieval.** The evidence in §2.3 and §2.4 says performance degrades with length *even on easy tasks*, and that adding documents can help less than expected. Anthropic's own docs now recommend **curating** context rather than maximising it.

**For a $0-budget learner:** the winning strategy is almost always **retrieve a few highly relevant chunks and put them at the start or end**, not "paste the whole document."

---

# 3. ATTENTION & TRANSFORMER ARCHITECTURE

## 3.1 The original architecture

**Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser & Polosukhin, "Attention Is All You Need"** — [arXiv:1706.03762](https://arxiv.org/abs/1706.03762). Verified: **submitted 12 Jun 2017**; last revised v7, 2 Aug 2023.

- **Venue: NeurIPS 2017 is widely cited but [UNVERIFIED] from a primary proceedings page** — the arXiv page does not print a venue. High confidence, not fetched.
- Verified hyperparameters: **h = 8 heads**, **d_model = 512**, **d_k = d_v = 64**, **N = 6** encoder and decoder layers, **d_ff = 2048**.
- The paper reports **28.4 BLEU** (En-De) and **41.8 BLEU** (En-Fr) — verified as printed in the abstract.

## 3.2 Self-attention: queries, keys, values

The intuition, in plain language:

- Every token produces three vectors: a **query** ("what am I looking for?"), a **key** ("what do I contain?"), and a **value** ("what do I pass along if attended to?").
- Each token compares its query to every token's key. The comparison is a **dot product** — high dot product means "relevant to me."
- Those scores are scaled, passed through **softmax** to become weights summing to 1, and used to take a weighted average of the **value** vectors.

So each token's output is a **weighted blend of information from all tokens it attends to** — this is how context flows between positions.

### The scaled dot-product attention formula (paper Eq. 1)

```
Attention(Q, K, V) = softmax( (Q Kᵀ) / sqrt(d_k) ) V
```

Verbatim from the paper: "The input consists of queries and keys of dimension d_k, and values of dimension d_v. We compute the dot products of the query with all keys, divide each by sqrt(d_k), and apply a softmax function to obtain the weights on the values."

> ### **[MYTH] The scaling factor is `sqrt(d_k)`, the KEY/QUERY dimension — NOT `sqrt(d_model)`**
> This is frequently mis-stated. With the paper's own numbers the two differ: `sqrt(64) = 8` versus `sqrt(512) ≈ 22.6`. In the paper's notation `d_k = d_v = d_model / h = 64`.
>
> **Why divide at all?** For large `d_k`, dot products grow in magnitude, which pushes softmax into regions with extremely small gradients (saturation). Scaling by `sqrt(d_k)` keeps the variance of the scores roughly constant.

## 3.3 Multi-head attention

Instead of one attention operation, run **h** of them in parallel on **projected** versions of Q, K, V, then concatenate and project:

```
MultiHead(Q,K,V) = Concat(head_1, …, head_h) W^O
head_i = Attention(Q W_i^Q,  K W_i^K,  V W_i^V)
```

The paper uses **h = 8**, with **d_k = d_v = d_model/h = 64**.

**Why it helps:** each head can specialise in a different relationship (one might track syntactic dependencies, another coreference, another positional adjacency). The projection to `d_k = d_model/h` keeps total compute roughly constant versus single-head attention at full width — so multi-head is nearly free relative to its benefit.

> **Important for §4:** multi-head attention *decouples* the number of **query heads** from the number of **key/value heads**. Standard MHA sets them equal. GQA and MQA deliberately make them differ. This distinction is the entire basis of modern KV-cache memory savings.

## 3.4 Positional encodings

Attention is **permutation-invariant** — on its own it has no notion of order. "Dog bites man" and "man bites dog" would look identical. So position must be injected.

### Sinusoidal (the original, 2017)

Verified verbatim from the paper (§3.5):

```
PE_(pos, 2i)   = sin( pos / 10000^(2i/d_model) )
PE_(pos, 2i+1) = cos( pos / 10000^(2i/d_model) )
```

"where pos is the position and i is the dimension. … the wavelengths form a geometric progression from 2π to 10000 · 2π."

These are **added** to the input embeddings. Theoretical appeal: the fixed wavelengths might let the model extrapolate to sequence lengths longer than seen in training — **though in practice this extrapolation is weak.**

### RoPE — Rotary Position Embedding

**Su et al., "RoFormer: Enhanced Transformer with Rotary Position Embedding"** — [arXiv:2104.09864](https://arxiv.org/abs/2104.09864). Verified: first author **Jianlin Su**, v1 **20 Apr 2021**, v5 **8 Nov 2023**.

**Idea:** rather than *adding* a position vector, **rotate** the query and key vectors by an angle proportional to position. Because rotations compose, the **relative** angle between two positions is what enters the attention dot product — so RoPE encodes **relative** position naturally. It has become the dominant choice in modern open-weight models.

#### `rope_theta` — a critical clarification

> ### **[MYTH] "RoPE uses theta = 10000" / "modern models all use 1,000,000"**
> **`rope_theta` (a.k.a. `rope_base`) is NOT a fact from the RoPE paper.** It is a **Hugging Face / vLLM configuration convention**. The RoPE paper never defines a tunable theta.

**Verified values from raw `config.json` files:**

| Model | `rope_theta` | Scaling |
| --- | --- | --- |
| Mixtral-8x7B | **1,000,000** | — |
| Llama-3-8B | **500,000** | — |
| Qwen3-235B-A22B | **1,000,000** | — |
| DeepSeek-V3 | **10,000** | `yarn` (factor 40, `original_max_position_embeddings` 4096) |
| DeepSeek-R1 | **10,000** | `yarn` (same) |

**So the claim that modern models uniformly use 1e6 is FALSE.** Values genuinely span 10⁴, 5×10⁵, and 10⁶, and some models keep a small theta and instead extend context with a scaling method.

**Higher theta slows the rotation, which helps long-context generalisation** — this is the intuition, and it is why the value is tuned upward in long-context models. State the intuition as intuition.

### YaRN — context extension method

**Peng, Quesnelle, Fan & Shippole, "YaRN: Efficient Context Window Extension of Large Language Models"** — [arXiv:2309.00071](https://arxiv.org/abs/2309.00071), first author **Bowen Peng**, v1 **31 Aug 2023**. Verified claim: "a compute-efficient method to extend the context window of such models, requiring **10× less tokens and 2.5× less training steps** than previous methods."

### ALiBi

**Press, Smith & Lewis, "Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation"** — [arXiv:2108.12409](https://arxiv.org/abs/2108.12409). Verified: first author **Ofir Press**, v1 **27 Aug 2021**, v2 **22 Apr 2022**. ICLR 2022 venue **[UNVERIFIED]** (not on the arXiv page).

Verified claim: a **1.3B model trained on 1024 tokens extrapolates to 2048**, matching a sinusoidal model trained at 2048, "**while training 11% faster and using 11% less memory**."

**Idea:** instead of adding positional vectors, add a **fixed bias that penalises attention to distant tokens**, linearly with distance. Nothing is learned and nothing depends on absolute position, so length extrapolation is more graceful. It has largely been superseded by RoPE variants in practice.

## 3.5 Encoder-only vs decoder-only vs encoder-decoder

| Type | Attention | Trained to | Typical use | Examples |
| --- | --- | --- | --- | --- |
| **Encoder-only** | Bidirectional (sees both sides) | Masked-token prediction | Understanding: classification, embeddings, reranking | BERT-family |
| **Decoder-only** | Causal (each token sees only the past) | Next-token prediction | Generation; **the dominant modern LLM form** | GPT-family, Llama, Claude, Gemini, DeepSeek |
| **Encoder-decoder** | Both | Sequence-to-sequence | Translation, summarisation | Original Transformer, T5, BART |

**Modern generative LLMs are overwhelmingly decoder-only.** This is why the rest of this document (KV cache, prefill/decode, autoregressive sampling) is described in decoder-only terms. **Encoder-only models still matter enormously in this curriculum** — they are what power the embedding and reranking models in §6.

## 3.6 Feed-forward layers, residual connections, layer normalisation

- **Feed-forward network (FFN):** each layer has a position-wise MLP. Paper: `FFN(x) = max(0, xW₁ + b₁)W₂ + b₂`, with **d_ff = 2048** against d_model = 512. Modern models use gated variants (SwiGLU etc.) and usually set `d_ff ≈ 4 × d_model`.
  - **FFNs hold most of a model's parameters.** In modern LLMs the FFN blocks typically contain roughly **two-thirds** of all weights. **[VERIFY against a specific model if you quote a percentage]**. This is exactly why MoE (§3.9) replaces *FFN* blocks with experts.
- **Residual connections:** `LayerNorm(x + Sublayer(x))` — the input is added to the sublayer's output. This creates a gradient "highway" that makes very deep networks trainable. **It is the single most important architectural trick for depth.**
- **Layer normalisation:** normalises activations across the feature dimension to stabilise training. The original paper used **post-norm** (`LayerNorm(x + Sublayer(x))`); most modern LLMs use **pre-norm** (`x + Sublayer(LayerNorm(x))`), which trains more stably without warmup tricks. Modern models often replace LayerNorm with **RMSNorm** (no mean-centering, cheaper).

## 3.7 Why attention is O(n²) — and what it implies

Self-attention compares **every token with every other token**. For a sequence of length `n`:

- There are `n × n` attention scores → the score matrix is `n²` entries.
- Compute is **O(n² · d)** per layer (verified from the paper's own complexity table).
- **Memory to materialise the score matrix is O(n²)** — this is the practical killer.

**Implications:**

1. **Doubling context quadruples attention compute and memory.** 10× context ≈ 100× attention cost.
2. **Long context is disproportionately expensive**, even though providers charge per token linearly. The provider absorbs the quadratic cost.
3. **Training on long sequences is memory-bound before it is compute-bound** — which is precisely the problem FlashAttention addresses.
4. It is why the whole family of efficient-attention methods (sparse, linear, sliding-window, and FlashAttention) exists.

**Contrast:** the paper's table lists self-attention as **O(n² · d)** with **O(1) sequential operations** and **O(1) maximum path length** — versus recurrent layers' **O(n · d²)** compute but **O(n)** sequential operations. **The transformer's advantage is parallelism, not asymptotically lower compute.** This is a subtle and valuable teaching point.

## 3.8 FlashAttention — what problem it solves

**Dao, Fu, Ermon, Rudra & Ré, "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness"** — [arXiv:2205.14135](https://arxiv.org/abs/2205.14135). Verified: v1 **27 May 2022**, v2 **23 Jun 2022**.

**The key insight — and the word "exact" is the whole point.** Earlier efficient-attention methods were *approximate*: they traded model quality for lower compute complexity, "but often do not achieve wall-clock speedup."

FlashAttention's argument: **the bottleneck is not arithmetic, it is memory movement between GPU HBM (large, slow) and on-chip SRAM (tiny, fast).** It:

1. **Tiles** the attention computation into blocks that fit in SRAM.
2. Uses **online softmax** to compute the softmax incrementally without materialising the full n×n matrix.
3. **Never writes the n×n attention matrix to HBM.**

**Result: an EXACT attention algorithm** (same mathematical output as standard attention) that "requires fewer HBM accesses than standard attention, and is optimal for a range of SRAM sizes."

Verified speedups from the abstract: **15% end-to-end wall-clock speedup on BERT-large** (seq 512) vs the MLPerf 1.1 training speed record; **3× on GPT-2** (seq 1K); **2.4× on long-range arena** (seq 1K–4K). Also enabled **Path-X (seq 16K) at 61.4%** and **Path-256 (seq 64K) at 63.1%** — "the first Transformers to achieve better-than-chance performance" on those.

### Later versions

- **FlashAttention-2** — [arXiv:2307.08691](https://arxiv.org/abs/2307.08691), **Tri Dao sole author**, **17 Jul 2023**. Verified improvement: FA1's inefficiency was "suboptimal work partitioning between different thread blocks and warps … causing either low-occupancy or unnecessary shared memory reads/writes." FA2 does: (1) fewer non-matmul FLOPs, (2) **parallelise even a single head across thread blocks** for occupancy, (3) better warp-level work distribution to cut shared-memory traffic. **~2× faster than FA1**, reaching **50–73% of A100 peak** (FA1 was 25–40%); up to **225 TFLOPs/s (72% MFU)**.
- **FlashAttention-3** — [arXiv:2407.08608](https://arxiv.org/abs/2407.08608), **first author Jay Shah, Tri Dao is LAST author** — **[MYTH] it is often wrongly attributed to Dao as first author.** v1 **11 Jul 2024**. FA2 reached only **35% utilisation on H100**; FA3 is **1.5–2.0× faster**, **740 TFLOPs/s FP16 (75% util)**, **~1.2 PFLOPs/s FP8**, and **2.6× lower FP8 numerical error** than baseline.
- **Peer-review venues for FA2/FA3: [UNVERIFIED]** — their arXiv pages list none. Community attributions (ICLR'24 / NeurIPS'24) are unconfirmed.

## 3.9 Mixture-of-Experts (MoE)

**Core idea: decouple total parameters from compute per token.** Replace each dense FFN with **N expert FFNs** plus a **router**. For each token, the router picks the top-`k` experts; only those run. **Sparse activation** means the model has enormous capacity but computes only a fraction per token.

### The classics

- **Shazeer et al., "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer"** — [arXiv:1701.06538](https://arxiv.org/abs/1701.06538), **23 Jan 2017**. Verified: **">1000× model capacity"**, up to **137B parameters**.
- **Fedus, Zoph & Shazeer, "Switch Transformers"** — [arXiv:2101.03961](https://arxiv.org/abs/2101.03961), v1 **11 Jan 2021**; comments field says **JMLR**. Verified: **7× pre-training speedup**, **4× over T5-XXL**, 101 languages.

### Modern verified specs

**Mixtral 8x7B** ([arXiv:2401.04088](https://arxiv.org/abs/2401.04088), 8 Jan 2024) — verbatim from the abstract: "**each token has access to 47B parameters, but only uses 13B active parameters during inference**"; **8 experts per layer, 2 selected per token**; trained with **32k context**; **Apache 2.0 license**.

Resolved from raw `config.json`: 32 layers, hidden 4096, intermediate 14336, 32 attention heads, **8 KV heads (GQA)**, `rope_theta` 1e6, vocab 32000.

> **A genuine, unresolvable-by-us conflict:** config-derived totals give **≈47.4B total / ≈13.6B active**, while the popular figures are **46.7B / 12.9B**. The difference is **accounting basis** (whether embedding and tied weights are counted). **Whichever you publish, state the basis.** The abstract's rounded "47B / 13B" is the safest quote.
>
> **Also: it is NOT literally "8 × 7B = 56B".** Each "expert" is a 3-matrix FFN *inside* a 4096-wide model, and the shared attention is counted once. That is exactly why 8×7B ≠ 56B. This naming is genuinely confusing and worth teaching explicitly.

**DeepSeek-V3** ([arXiv:2412.19437](https://arxiv.org/abs/2412.19437), 27 Dec 2024) — verbatim from the abstract: **671B total / 37B activated**. Config: **256 routed experts + 1 shared expert**, **8 experts per token**, 61 layers, hidden 7168, `first_k_dense_replace` 3, `n_group` 8, `topk_group` 4. Trained on 14.8T tokens using **2.788M H800 GPU-hours**, stated cost **$5.576M**; context 32K → 128K. **[VERIFY the cost/token figures before quoting — they are famous and frequently misquoted.]**

**DeepSeek-R1** ([arXiv:2501.12948](https://arxiv.org/abs/2501.12948), 22 Jan 2025) — **peer-reviewed: journal reference is _Nature_ volume 645, pages 633–638 (2025), DOI 10.1038/s41586-025-09422-z.** Architecture-identical to V3 (256+1 experts, top-8, 61 layers), hence **671B/37B** — **but note that R1's own abstract does not restate those numbers**; they are inherited from V3.

**Qwen3-235B-A22B** — config verified: **128 experts, 8 per token**, 94 layers, hidden 4096, moe_intermediate 1536, 64 attention heads, **4 KV heads**, head_dim 128, `rope_theta` 1e6, 40960 context. **The "235B total / 22B active" numbers come from the model *name* convention and card, not from a quotable numeric statement. [UNVERIFIED]-from-authoritative-prose.**

### Why MoE matters for cost — and the honest caveat

**Benefit:** you get the *quality* of a much larger model at the *compute* cost of a much smaller one. Mixtral's abstract reports it "outperforms or matches Llama 2 70B and GPT-3.5 across all evaluated benchmarks" while activating only ~13B. **This is the single most important cost lever in modern open-weight models.**

**Caveats to teach honestly:**

1. **Memory does not shrink.** *All* experts must be resident in VRAM even though only a few activate. MoE saves **compute**, not **memory**. A 671B MoE still needs enormous memory to serve — this is the main reason MoE models are hard to run locally.
2. **Training stability** — routing can collapse. This is why auxiliary load-balancing losses exist.
3. **Batching interacts with routing** — different tokens in a batch use different experts, which complicates efficient serving.
4. **"Active parameters" is the right number for compute comparisons, but "total parameters" is the right number for memory requirements.** Confusing the two is a common error.

## 3.10 Prefill vs decode — the two phases of inference

This distinction underlies §4, §5, and §7, so it belongs here.

**Prefill (the prompt-processing phase):**
- All input tokens are processed **in parallel**.
- The workload is **compute-bound** — large matrix multiplications saturate the GPU.
- Produces the **KV cache** for all prompt tokens.
- Determines **time-to-first-token (TTFT)**.

**Decode (the generation phase):**
- Tokens are generated **one at a time**, autoregressively.
- Each step processes **a single new token** but must attend to the entire cache.
- The workload becomes **memory-bandwidth-bound** — the GPU spends most time *reading* weights and cache rather than doing arithmetic. Utilisation of compute units is typically low.
- Determines **time-per-output-token / tokens-per-second (TPS)**.

**The crucial asymmetry:** the maths is identical in both phases; what differs is the *shape* of the computation and therefore *which resource is the bottleneck*. Every inference optimisation targets one phase or the other:

| Optimisation | Phase targeted |
| --- | --- |
| FlashAttention | Both (prefill especially) |
| Continuous batching | Decode (throughput) |
| KV cache | Decode (avoids recompute) |
| PagedAttention | Both (memory management) |
| Speculative decoding | Decode (latency) |
| Quantisation | Both (memory bandwidth + footprint) |

**This table is the backbone of §4–§7.** If a learner understands prefill-is-compute-bound vs decode-is-bandwidth-bound, most serving behaviour becomes predictable.

---

# 4. THE KV CACHE

## 4.1 What it is and why it exists

In autoregressive decoding, generating token `t+1` requires attention over **all** previous tokens. Naively, that means recomputing keys and values for the entire prefix at every step — which would make generation **O(n²)** in total and waste enormous compute, since the K and V of past tokens **never change**.

**The KV cache stores the key and value vectors of all previously processed tokens**, so each decode step computes K and V only for the **new** token and appends them. This turns generation from quadratic work into linear work per step.

**Cost of the cache:** memory. And it is a substantial, growing, per-request cost.

## 4.2 The memory footprint formula

```
KV cache bytes = 2            (one K tensor + one V tensor)
               × num_layers
               × num_kv_heads  ← NOT num_attention_heads
               × head_dim
               × seq_len
               × batch_size
               × bytes_per_element   (2 for fp16/bf16, 1 for int8)
```

**Authoritative worked example — verbatim from the vLLM paper:** "the KV cache of a single token demands **800 KB**, calculated as **2 (key and value vectors) × 5120 (hidden state size) × 40 (number of layers) × 2 (bytes per FP16)**." The arithmetic checks out exactly: 819,200 bytes.

*Note that 5120 here equals `num_kv_heads × head_dim` for that model — the "hidden state size" phrasing is the paper's, and it collapses the two terms. When teaching, keep them separate, because GQA is precisely what makes them differ.*

**Independent verified cross-check (Hugging Face Llama 3.1 blog, 23 July 2024), FP16 KV cache:**

| Model | 1k | 16k | 128k |
| --- | --- | --- | --- |
| 8B | 0.125 GB | 1.95 GB | 15.62 GB |
| 70B | 0.313 GB | 4.88 GB | 39.06 GB |
| 405B | 0.984 GB | 15.38 GB | 123.05 GB |

Cross-checking Llama-3-8B against its real config (**32 layers, 8 KV heads, head_dim 128**):
`2 × 32 × 8 × 128 × 1024 × 2 = 134,217,728 bytes = 0.125 GiB` — **exact match.**

> **Material flag:** at 128k the blog says **15.62 GB** but the formula gives **16.0 GiB**. The **1k basis matches perfectly; the 128k column does not.** So **cite the per-token / 1k figure and derive longer lengths yourself** rather than quoting the long-context column.
>
> **Llama-2-7B per-token figure: [UNVERIFIED]** — no authoritative source found. (Any figure you see is someone's own computation.)

### The teaching takeaway

**KV cache memory scales linearly in sequence length and batch size, and it is often the binding constraint on how many requests you can serve concurrently.** A 128k-context request on an 8B model needs ~16 GB just for the cache — comparable to the model weights themselves.

### Important exception: MLA

> **DeepSeek-V3 and R1 do NOT follow this formula.** They use **Multi-head Latent Attention (MLA)**, which caches a **compressed latent** (`kv_lora_rank = 512`) plus a **decoupled RoPE key** (`qk_rope_head_dim = 64`) — verified in their configs. This is a major architectural reason their KV cache is far smaller than the formula above would predict. **Do not apply the standard formula to MLA models.**

## 4.3 MQA and GQA — reducing KV cache by sharing heads

Recall from §3.3 that standard **multi-head attention (MHA)** has `num_kv_heads = num_attention_heads`. The KV cache scales with `num_kv_heads`, so **cutting that number is the most direct saving.**

| Variant | KV heads | KV cache | Quality |
| --- | --- | --- | --- |
| **MHA** | = query heads (e.g. 32) | Largest | Baseline |
| **GQA** | between 1 and query heads (e.g. 8) | Intermediate | Close to MHA |
| **MQA** | **1** | Smallest | Some degradation |

### MQA

**Shazeer, "Fast Transformer Decoding: One Write-Head is All You Need"** — [arXiv:1911.02150](https://arxiv.org/abs/1911.02150), **sole author, 6 Nov 2019**.

> ### **[MYTH] The paper is NOT titled "Multi-Query Attention"**
> The actual title is **"Fast Transformer Decoding: One Write-Head is All You Need."** "Multi-query attention" is the *informal name* introduced in the abstract. Many secondary sources cite a title that does not exist. **Venue: [UNVERIFIED]** — no conference listed on the arXiv page; appears to be an arXiv-only tech report.

Verbatim: "We propose a variant called **multi-query attention**, where the keys and values are **shared across all of the different attention 'heads'**, greatly reducing the size of these tensors and hence the memory bandwidth requirements of incremental decoding."

**Saving:** KV cache shrinks by a factor of `num_attention_heads` (e.g. 32×). **Cost:** quality degradation — which is why GQA exists.

### GQA

**Ainslie, Lee-Thorp, de Jong, Zemlyanskiy, Lebrón & Sanghai, "GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints"** — [arXiv:2305.13245](https://arxiv.org/abs/2305.13245). Verified: v1 **22 May 2023**, v3 **23 Dec 2023**, **accepted at EMNLP 2023**.

Two contributions, both verified:
1. **An uptraining recipe** to convert existing MHA checkpoints to MQA using **5% of the original pre-training compute** — so you need not train from scratch.
2. **GQA itself:** "a generalization of multi-query attention which uses an intermediate (**more than one, less than number of query heads**) number of key-value heads."

**Verified result:** "uptrained GQA achieves **quality close to multi-head attention with comparable speed to MQA**."

**GQA is now the near-universal default in modern open-weight LLMs.** Concrete verified examples: **Llama-3-8B** (8 KV heads vs 32 attention heads → 4× cache reduction), **Mixtral 8x7B** (8 KV heads, 32 attention heads), **Qwen3-235B-A22B** (4 KV heads, 64 attention heads → 16× reduction).

## 4.4 Quantised KV cache

The formula's `bytes_per_element` term is a direct lever: storing K and V in **int8** instead of fp16 **halves** the cache; **int4** quarters it.

**Trade-off:** quantisation adds error to attention scores. Keys are typically more sensitive than values, and aggressive KV quantisation is a well-known source of long-context quality loss. Quality impact depends on the method, the bit-width, and how tolerant the task is. **We found no single authoritative accuracy-vs-bitwidth number to quote here — [UNVERIFIED]. Do not invent one.**

**Why it matters more than weight quantisation for serving:** at long context and high batch size, the KV cache can exceed the weights in memory. So KV quantisation can buy more concurrent throughput than weight quantisation.

## 4.5 PagedAttention / vLLM

**Kwon, Li, Zhuang, Sheng, Zheng, Yu, Gonzalez, Zhang & Stoica, "Efficient Memory Management for Large Language Model Serving with PagedAttention"** — [arXiv:2309.06180](https://arxiv.org/abs/2309.06180). Verified: submitted **12 Sep 2023**.

**Venue verified on the paper's own HTML: SOSP '23, Koblenz, Germany, 23–26 Oct 2023, DOI 10.1145/3600006.3613165.**

### The problem

Naive serving allocates a **contiguous** block of KV memory per request, sized to the maximum possible length. Because actual output lengths are unknown in advance, this wastes memory through:

- **Internal fragmentation** — reserved-but-unused space.
- **External fragmentation** — gaps between allocations.
- **Redundant duplication** — e.g. the same system prompt stored separately per request.

### The solution

**PagedAttention** borrows **virtual memory and paging from operating systems**: KV cache is stored in fixed-size **blocks** that need not be contiguous, with a per-request **block table** mapping logical positions to physical blocks. Benefits: **near-zero waste**, and **flexible sharing** of KV blocks within and across requests (so a shared prompt prefix is stored once).

vLLM is the serving system built on it.

### **[MYTH] The famous "60–80% wasted" figure is an INVERSION of the paper**

Most retellings say "existing systems wasted 60–80% of KV cache memory." **The paper never prints that.** It reports **utilisation**:

> "only **20.4% – 38.2%** of the KV cache memory is used to store the actual token states in the existing systems."
> "the actual effective memory in previous systems can be **as low as 20.4%**."

You can *derive* ~61.8–79.6% waste from that, but the paper's own framing is **utilisation**, and quoting "60–80% wasted" as if it were the paper's number is a citation error.

### Throughput claim — exact wording

> "vLLM improves the throughput of popular LLMs by **2-4× with the same level of latency** compared to the state-of-the-art systems, such as **FasterTransformer and Orca**."

Note carefully: **2–4×**, against **two** baselines, **at the same latency**. There is **no single "X times faster" number** in the paper. The improvement "is more pronounced with longer sequences, larger models, and more complex decoding algorithms."

Other verified details: prompt KV sharing accounted for **12%** of total KV in their measurement; beam search sharing saved up to **55%**.

## 4.6 Why provider-side prompt caching differs from KV cache reuse

These are related but **not the same thing**, and conflating them is a common error.

| | **KV cache (inference)** | **Prompt caching (provider)** |
| --- | --- | --- |
| **Scope** | One request's decoding loop | **Across separate API requests** |
| **Lifetime** | The request | Minutes to hours, provider-defined |
| **What's stored** | K and V tensors for the sequence | K/V tensors for a reusable **prefix** |
| **Who controls it** | The serving engine | The API contract + request shape |
| **Billing** | Not directly billed | **Explicitly billed at a discount** |
| **Hit condition** | Automatic | Requires an **exact prefix match** |

### What OpenAI's docs actually say (verified)

- "The prompt cache stores **key-value (KV) tensors**, not the tokens themselves." **So it is genuinely KV reuse — but at a different scope.**
- **Cache reuse requires the entire rendered prefix to match.** "If content or a relevant setting changes before a breakpoint, the prefix after that change cannot match."
- **A minimum cacheable length applies.** For GPT-5.6 and later: **1,024 tokens**; hidden system content does not count toward it. Earlier models vary by request settings.
- **Pricing:** cached input is discounted "**up to 90%**". For GPT-5.6+: **cache reads cost 0.1× uncached input**; **cache writes cost 1.25×**. Worked example from the docs: one write + one full reuse = **1.35×** ordinary input cost, vs **2×** for processing twice uncached; across ten requests, one write + nine reads = **2.15×** vs **10×**.
- **Cache lifetime:** GPT-5.6+ default **30 minutes** after the most recent write or reuse. Earlier models: `in_memory` ≈ 5–10 minutes inactivity (up to 1 hour), or `24h` extended retention.
- **Settings that break the prefix** (verified list): `model`, `tools`, `parallel_tool_calls`, `text.format`, `reasoning.effort`, `text.verbosity`, `context_management`.
- **Caching does NOT change output:** "Prompt caching does not change how the model generates output tokens… identical requests are not guaranteed to produce identical outputs."
- **Cached tokens still count toward rate limits.**
- **Caches are per-machine and not shared across organizations**, and "traffic above 15 requests per minute can lead to overflow routing" — which is why `prompt_cache_key` exists for routing on models before GPT-5.6.

### Anthropic's version (verified)

- Enabled via `cache_control`, either **automatic caching** (one top-level `cache_control` field; the breakpoint moves forward as the conversation grows) or **explicit cache breakpoints** on individual content blocks.
- **Default lifetime 5 minutes**, refreshed at no cost on each use. **A 1-hour duration is available at additional cost.**
- **Important timing subtlety, verified:** "The lifetime is measured from the **start of the request** that writes or reads the cache entry, not from the end of its response. **Time spent generating a response counts against the lifetime**: if a response takes 4 minutes to stream, a follow-up request that reuses the same cached prefix must start within about 1 minute of that response completing."

### **The single most important practical rule**

> **Put stable content FIRST and variable content LAST.** System prompts, tool definitions, few-shot examples, and reference documents go at the beginning; the user's changing question goes at the end. Otherwise the prefix differs on every request and **nothing caches**.

**For the $0-budget learner:** prompt caching is a cost optimisation for paid APIs. But **the prefix-stability principle is still worth learning**, because the same ordering discipline (stable-first, variable-last) is good prompt hygiene everywhere and is what makes any caching — including local engines' prompt reuse — work.

---

# 5. SAMPLING & DECODING

## 5.1 The base situation

A model outputs a **logit** for every token in the vocabulary at each step. Softmax turns logits into a probability distribution. **Decoding** is the policy for choosing a token from that distribution. **The same model with different decoding can produce dramatically different text** — this is the central finding of the nucleus-sampling paper below.

## 5.2 Greedy vs beam search vs sampling

| Method | Rule | Character |
| --- | --- | --- |
| **Greedy** | Always take the highest-probability token | Deterministic (given identical inputs); fast; prone to repetition and blandness |
| **Beam search** | Keep the top-`k` partial sequences, expand all, prune | Better on tasks with a clear correct answer (translation); **expensive (k× compute) and poor for open-ended text** |
| **Pure sampling** | Sample from the full distribution | Diverse but incoherent — the "tail" is full of nonsense |

**Holtzman, Buys, Du, Forbes & Choi, "The Curious Case of Neural Text Degeneration"** — [arXiv:1904.09751](https://arxiv.org/abs/1904.09751). Verified: v1 **22 Apr 2019**, v2 **14 Feb 2020**, **published in ICLR 2020**.

The paper's core observation (verbatim): "even though the use of likelihood as training objective leads to high quality models … **using likelihood as a decoding objective leads to text that is bland and strangely repetitive**."

The fix it introduces is **nucleus (top-p) sampling**: sample "from the dynamic nucleus of the probability distribution, which allows for diversity while effectively truncating the less reliable tail."

**Key teaching point:** maximising likelihood is right for *training* and wrong for *decoding*. This is counterintuitive and worth dwelling on.

## 5.3 Temperature — what it does mathematically

Temperature `T` **rescales the logits before softmax**:

```
p_i = softmax(z_i / T)
```

- **T → 0:** the distribution collapses toward the argmax → approaches greedy.
- **T = 1:** the model's raw distribution.
- **T > 1:** flattens the distribution → more diversity, more incoherence.

**The precise mechanism:** dividing logits by `T` changes the *ratio* between probabilities. Since `softmax(z_i/T) ∝ exp(z_i/T)`, lowering `T` **exponentially amplifies** the gap between the top logit and the rest.

**Important:** temperature is applied **before** truncation methods (top-k/top-p) in the standard pipeline, so they interact. **The exact order of operations varies by implementation — [VERIFY] for any specific engine before stating it as universal.**

## 5.4 Top-k, top-p (nucleus), min-p, typical sampling

### Top-k
**Fan, Lewis & Dauphin, "Hierarchical Neural Story Generation"** — [arXiv:1805.04833](https://arxiv.org/abs/1805.04833), v1 **13 May 2018**. Keep only the `k` highest-probability tokens, renormalise, sample.

**Weakness:** `k` is **fixed**, so it is too restrictive when the model is confident (many high-probability options truncated) and too permissive when it is uncertain (nonsense enters the top-k).

### Top-p / nucleus
Keep the smallest set of tokens whose **cumulative probability ≥ p** (e.g. 0.9), then renormalise and sample. The set size **adapts** to the model's confidence — this is precisely why it fixed top-k's weakness. **This is the most widely used truncation method.**

### Min-p
Keep only tokens whose probability is at least `min_p × p_max` (a **fraction of the top token's probability**). Because the threshold scales with the top token's confidence, it adapts **more sharply** than top-p: when the model is very confident, min-p prunes aggressively; when uncertain, it keeps more. Popular in local/open-weight tooling.

**[VERIFY]:** we did not verify a canonical peer-reviewed origin paper for min-p. Treat it as a community-popularised method and attribute it as such rather than citing a specific paper.

### Typical sampling
Selects tokens whose **information content** (`-log p`) is close to the **entropy** of the distribution — keeping tokens that are "typical" for the model's current uncertainty, rather than merely high-probability. Introduced alongside top-p in the same Holtzman et al. paper. Less commonly exposed in APIs than top-k/top-p.

## 5.5 Repetition, frequency, and presence penalties

These modify logits based on **how often a token has already appeared** in the generated text:

| Penalty | Mechanism |
| --- | --- |
| **Presence penalty** | Flat penalty applied **once** if a token has appeared at all |
| **Frequency penalty** | Penalty **proportional to the number of occurrences** |
| **Repetition penalty** | Divides/scales logits of already-used tokens (multiplicative; common in open-weight tooling) |

**Effect:** discourage loops. **Trade-off:** too much penalty degrades quality — it can push the model off necessary repeated tokens (e.g. a variable name it must keep using, or structural tokens in code/JSON). **Signs and exact formulas differ between OpenAI-style and open-weight-style implementations — [VERIFY] before stating a sign convention as universal.**

## 5.6 Seed, determinism, and why outputs are not perfectly reproducible

**Why "temperature = 0" does not guarantee identical outputs:**

1. **Floating-point non-associativity.** GPU kernels sum in parallel with an order that depends on **batch composition, sequence length, and kernel selection**. Different summation order → slightly different results.
2. **Batching changes numerics.** Your request is batched with others; the batch size and content affect reduction order.
3. **Kernel autotuning.** Engines select among mathematically equivalent kernels based on shape; the choice can change between runs or versions.
4. **Nondeterministic GPU operations.** Some atomics and reductions are inherently order-nondeterministic.
5. **MoE routing** can be sensitive to tiny numerical differences, amplifying divergence.
6. **Provider-side changes** — model versions, system prompts, and safety layers change without notice.

**Seeds** make sampling *more* reproducible by fixing the random stream, and `seed` is a widely supported parameter. **But [VERIFY] — providers generally do not guarantee bit-exact reproducibility, and OpenAI's docs explicitly note that "identical requests are not guaranteed to produce identical outputs" even with prompt caching.** The seed reduces variance from sampling; it does not remove numerical nondeterminism.

**Teaching takeaway:** treat LLM outputs as **stochastic** and build evaluations accordingly. Never unit-test on exact string equality.

## 5.7 Logprobs

**What they are:** the log-probabilities the model assigned to the tokens it actually generated (and optionally to the top-N alternatives at each position).

**Legitimate, verified uses:**
- **Confidence estimation** — flag low-confidence outputs for human review.
- **Classification** — read off the probability of specific label tokens (this is a well-established technique).
- **Scoring/ranking** — compare candidate completions.
- **Debugging** — see where the model was uncertain.

**Critical caveats:**

1. **OpenAI's docs state that logprobs do NOT include all generated tokens.** Verified: some models "generate tokens used to format or delimit response channels, tool calls, and other message structure. **These formatting tokens don't appear in message content or `logprobs`**". So **visible logprobs ≠ complete picture**, and reported output counts can exceed what logprobs cover.
2. **Logprobs are not calibrated probabilities of correctness.** A model can be confidently wrong — high logprob does not mean "true". This is the most important caveat for a curriculum, because "confidence scores" are routinely over-trusted.
3. **Availability varies** by provider, model, and endpoint. **[VERIFY] per model before relying on it.**

**A useful mental model:** logprobs tell you what the model *expected to say next*, not what is *true*.

---

# 6. EMBEDDINGS & VECTOR SEARCH

## 6.1 What an embedding is

An embedding maps text to a **fixed-length vector of floating-point numbers** such that **semantic similarity corresponds to geometric proximity**. OpenAI's docs: "The distance between two vectors measures their relatedness. Small distances suggest high relatedness and large distances suggest low relatedness."

**Origins:**
- **word2vec:** Mikolov, Chen, Corrado & Dean, "Efficient Estimation of Word Representations in Vector Space" — [arXiv:1301.3781](https://arxiv.org/abs/1301.3781), **16 Jan 2013**; and Mikolov, Sutskever, Chen, Corrado & Dean, "Distributed Representations of Words and Phrases and their Compositionality" — [arXiv:1310.4546](https://arxiv.org/abs/1310.4546), **16 Oct 2013**. Both verified. These produced **300-dimensional** vectors (typical for the released models).
- **Sentence-BERT (SBERT):** Reimers & Gurevych — [arXiv:1908.10084](https://arxiv.org/abs/1908.10084), **27 Aug 2019**, "Published at EMNLP 2019". Verified. This is the origin of practical **sentence** embeddings and the **bi-encoder** pattern. Verified claim: siamese/triplet structures produce embeddings "compared using cosine-similarity", cutting a task from **65 hours to about 5 seconds**.

## 6.2 Dimensionality

Typical dimensions, with sources:

| Model | Dimensions | Source |
| --- | --- | --- |
| word2vec | 300 | Classic default |
| OpenAI `text-embedding-3-small` | **1536** (default) | Verified, OpenAI docs |
| OpenAI `text-embedding-3-large` | **3072** (default) | Verified, OpenAI docs |
| Voyage `voyage-4-*` | **1024** default; 256/512/2048 selectable | Verified, Anthropic docs |
| Voyage `voyage-context-*` | 1024 default; 256/512/2048 | Verified |

**Bigger is not automatically better.** Diminishing returns are real, and storage/search cost scales linearly with dimension. This is what Matryoshka embeddings exploit (§6.7).

**Verified MTEB scores from OpenAI's own docs — and a warning:** the docs still list `text-embedding-3-small` at **62.3%** and `text-embedding-3-large` at **64.6%** on MTEB, with `text-embedding-ada-002` at **61.0%**, all with **8192 max input**. **[VERIFY]** — these scores date from the v3 launch and the MTEB leaderboard has moved substantially since; **do not present them as current state of the art.**

**Confirmed: `text-embedding-3-small` and `text-embedding-3-large` ARE still OpenAI's current embedding models.** The live model catalog lists exactly **three** embedding models (3-large, 3-small, ada-002). Note a confusing artifact: frontier **chat** model pages display "Embeddings | Not supported", which means *that chat model* cannot be used on `v1/embeddings` — it does **not** mean OpenAI has dropped embeddings. The embedding models themselves show `v1/embeddings | Supported`.

**MTEB's successor is MMTEB, not "MTEB v2".** The follow-up benchmark is **MMTEB** — [arXiv:2502.13595](https://arxiv.org/abs/2502.13595), **Feb 2025**. **[VERIFY]**. "v2" is a **per-benchmark version suffix** in the `mteb` library (e.g. `mteb.get_benchmark("MTEB(eng, v2)")`), not a separate benchmark. Leaderboard: `huggingface.co/spaces/mteb/leaderboard` (**JS-rendered; rankings could not be read programmatically**).

**Anthropic does not offer its own embedding model** (verified): "Anthropic does not offer its own embedding model," and its docs recommend **Voyage AI** instead. This is a nice illustration that not every lab offers every capability.

## 6.3 Cosine similarity vs dot product vs Euclidean

The relationships, stated precisely:

- **Cosine similarity** = `(a · b) / (‖a‖ ‖b‖)` — the cosine of the angle between vectors; **scale-invariant**.
- **Dot product** = `a · b` — depends on both angle **and magnitude**.
- **Euclidean distance** = `‖a − b‖`.

**Verified from OpenAI's own documentation** (an unusually clean authoritative statement):

> "OpenAI embeddings are **normalized to length 1**, which means that:
> - Cosine similarity can be computed **slightly faster using just a dot product**
> - **Cosine similarity and Euclidean distance will result in identical rankings**"

**The same consequence is corroborated by two independent tools' own docs:**
- **FAISS README:** "It also supports cosine similarity, since this is **a dot product on normalized vectors**."
- **pgvector README:** "If vectors are normalized to length 1 (like OpenAI embeddings), **use inner product for best performance**."

**The general mathematical facts to teach:**

1. If vectors are **L2-normalised**, then **dot product = cosine similarity**, so their rankings are identical. This is why many systems normalise on ingest and then use the much cheaper inner-product index.
2. For **L2-normalised** vectors, `‖a − b‖² = 2 − 2·cos(a, b)`, so Euclidean distance is a **monotone decreasing function** of cosine similarity — **ranking-preserving, but not a linear rescale.** (Teach it as "same ordering", not "same numbers".)
3. **If vectors are NOT normalised, dot product and cosine can rank differently** — a long document's un-normalised embedding can win on magnitude alone. **This is a real and common bug.**

**OpenAI's guidance (verified):** "We recommend cosine similarity. **The choice of distance function typically doesn't matter much**" — *given* their normalised embeddings. That caveat is essential; the statement is not universal.

## 6.4 Sentence embeddings vs token embeddings

| | **Token embeddings** | **Sentence embeddings** |
| --- | --- | --- |
| Granularity | One vector per token | One vector per text (sentence/passage) |
| Where | Inside the model, first layer | Output of a dedicated encoder |
| Used for | Model input | Retrieval, clustering, classification |
| Comparable across texts? | Not meaningfully | Yes — that is the point |

**How sentence embeddings are made from a token-level encoder** (pooling strategies): take the **mean** of token vectors, use the **`[CLS]` token**'s vector, or use a **last-token** vector. SBERT popularised mean pooling.

**A critical practical point:** you must use a model **explicitly trained/fine-tuned for sentence similarity**. Taking mean-pooled token embeddings from an arbitrary base LM produces poor similarity geometry — this is a famous failure mode (anisotropy). **Do not assume any model's hidden states work as embeddings.**

## 6.5 Similarity search: exact vs approximate (ANN)

- **Exact (brute-force / flat) search:** compare the query to every vector. Guaranteed correct; **O(n·d)** per query. Fine up to maybe ~10⁵–10⁶ vectors. **[VERIFY the crossover — it is hardware-dependent; do not quote a hard threshold.]**
- **Approximate nearest neighbour (ANN):** trade a little recall for large speed gains. Returns *most* of the true nearest neighbours, fast.

**ANN is the entire reason vector search at scale is practical**, and it is inherently a **recall/latency/memory trade-off**. Teaching it as "the same but faster" is wrong — it is "nearly the same, much faster, and tunable."

## 6.6 HNSW, IVF, and product quantisation

### HNSW
**Malkov & Yashunin, "Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs"** — [arXiv:1603.09320](https://arxiv.org/abs/1603.09320). Verified: v1 **30 Mar 2016**, v4 **14 Aug 2018**.

**Idea:** build a **multi-layer graph** where upper layers are sparse "express lanes" and the bottom layer is dense. Search greedily descends from the top, zooming in. **This is the dominant ANN index today.**

**Key parameters (conceptual):**
- **`M`** — number of connections per node. Higher = better recall, more memory.
- **`efConstruction`** — search width during build. Higher = better graph quality, slower build.
- **`efSearch`** — search width at query time. Higher = better recall, slower queries.

**`efSearch` is the knob you tune at runtime** — it is the direct recall/latency dial.

### IVF (inverted file index)
**Idea:** cluster vectors with k-means into `nlist` cells. At query time, search only the nearest `nprobe` cells. **Trades recall for speed by ignoring most of the data.** Related: **IVF+PQ** combines this with compression.

### Product quantisation (PQ)
**Jégou, Douze & Schmid, "Product Quantization for Nearest Neighbor Search"**, *IEEE TPAMI* **vol. 33, issue 1, pp. 117–128, Jan 2011**, **DOI 10.1109/TPAMI.2010.57**. *(Verified via the Crossref and Semantic Scholar APIs, because IEEE blocks automated fetches. **Note: PQ has NO arXiv version** — if a citation gives you an arXiv ID for it, that ID is wrong.)*

**Idea:** split a high-dimensional vector into `m` sub-vectors, and quantise each sub-vector against its own small codebook of centroids. A 128-dim float32 vector (512 bytes) can compress to a few bytes.

**The elegant consequence:** because a vector is encoded as a **tuple of centroid IDs**, distances can be computed by **table lookup** rather than multiplication — so PQ speeds up *both* memory and compute.

**FAISS:** Johnson, Douze & Jégou, "Billion-scale similarity search with GPUs" — [arXiv:1702.08734](https://arxiv.org/abs/1702.08734), **28 Feb 2017**. Verified. Repo: `github.com/facebookresearch/faiss`. **FAISS is a library, not a database** — it gives you indexes, and you supply the storage, filtering, and persistence.

**Typical composition:** real systems combine these, e.g. **IVF-PQ** (cluster + compress) or **HNSW** on top of compressed vectors, plus a **reranker** (§6.9) to recover precision.

## 6.7 Matryoshka embeddings and binary quantisation

### Matryoshka Representation Learning (MRL)
**Kusupati et al., "Matryoshka Representation Learning"** — [arXiv:2205.13147](https://arxiv.org/abs/2205.13147). Verified paper.

> ### **[MYTH] Matryoshka Representation Learning did NOT win a NeurIPS 2022 Outstanding Paper Award**
> This award claim is repeated often, including in otherwise-careful writeups. It is **false**. The official NeurIPS 2022 awards page lists all **15** Outstanding Papers, and MRL **is absent** from it. The MRL arXiv Comments field carries **no award** either.
>
> **Do not repeat the award claim.** Cite the paper for the *technique*, which is genuine and widely adopted.

**Idea (named after nested Russian dolls):** train so that the **first `k` dimensions** of the vector are themselves a usable embedding, for many values of `k`. You can then **truncate** the vector to trade accuracy for storage/speed, **without retraining**.

**Verified in production by OpenAI:** "Both of our new embedding models were trained **with a technique** that allows developers to trade-off performance and cost of using embeddings. Specifically, developers can **shorten embeddings (i.e. remove some numbers from the end of the sequence)** without the embedding losing its concept-representing properties by passing in the `dimensions` API parameter." OpenAI's docs cite **arXiv:2205.13147** explicitly.

**Verified claim from OpenAI's docs:** on MTEB, "a `text-embedding-3-large` embedding can be **shortened to a size of 256 while still outperforming an unshortened `text-embedding-ada-002` embedding with a size of 1536**."

**A practical caveat from the same docs:** "When you change the dimension manually, you need to be sure to **normalize** the dimensions of the embedding." Truncating breaks unit norm — a real implementation gotcha.

### Binary quantisation
Store each dimension as **1 bit** (sign only). **Memory reduction: 32× vs float32** — this is **arithmetic, not a claim** (32 bits → 1 bit), and it is **safe to state.**

> ### **[MYTH] The "retains 96% of performance" figure is a VENDOR CLAIM — and the qualifier is always dropped**
> Hugging Face's own materials state "**up to** ~96%" **with rescoring**, and disclose that "**without the rescoring … roughly ~92.5%**".
>
> **Always quote the rescoring qualifier.** Binary quantisation is normally paired with a **rescoring** step that recovers most of the lost precision; the headline number is measured *with* that step. The rescoring method is attributed to **Yamada et al. 2021** ([arXiv:2106.00882](https://arxiv.org/abs/2106.00882)) — **[UNVERIFIED]** in this session.
>
> **The honest statement:** binary quantisation gives a **32× memory reduction** at a **task- and model-dependent** recall cost, and **requires rescoring** to approach the headline quality figures.

## 6.8 Vector database landscape

**Conceptual framing first — the most useful thing to teach:** these tools differ mainly along three axes:

1. **Library vs server** — a library runs in your process; a server is a separate service.
2. **Embedded vs distributed** — embedded (in-process, single node) versus a clustered system.
3. **Open source vs managed service** — and note a product can be *both* (open-source core + paid cloud).

| Tool | Kind | Licence / notes |
| --- | --- | --- |
| **FAISS** | **Library** | Meta AI Research ("developed primarily at Meta's Fundamental AI Research group"). **MIT licence (verified).** Indexes only; no storage/server/filtering layer. |
| **Chroma** | Library/embedded + server | Popular for prototyping and RAG. *[Licence VERIFY]* |
| **Qdrant** | Server (Rust) | Open-source vector DB with filtering. *[Licence VERIFY]* |
| **pgvector** | **PostgreSQL extension** | Vectors *inside* Postgres — combine SQL filtering with vector search. *[Exact SPDX id VERIFY]* |
| **Pinecone** | **Proprietary managed service** | Fully hosted; not self-hostable. |
| **LanceDB** | Embedded | Built on the Lance columnar format. *[Exact SPDX id VERIFY]* |
| **sqlite-vec** | **SQLite extension** | By **Alex Garcia (asg017)**; the **successor to `sqlite-vss`**. Runs anywhere SQLite does — notably strong for mobile/edge. |
| **Milvus** | Server, distributed | Designed for large-scale deployments. *[Licence VERIFY]* |
| **Weaviate** | Server | Open-source vector DB with hybrid search. *[Licence VERIFY]* |

**[VERIFY] the licence for every entry above before publishing.** We verified **FAISS = MIT** explicitly, and deliberately left the rest unstated rather than guessing.

**The recommendation for a $0-budget learner:** start with **`sqlite-vec`** or **`pgvector`** or **FAISS** — all free, all run locally, and all teach the actual concepts without a cloud bill. You do **not** need a managed vector database to learn retrieval; at small scale, **exact search over NumPy arrays is often faster than the ANN machinery.**

## 6.9 Reranking: cross-encoders vs bi-encoders

**Nogueira & Cho, "Passage Re-ranking with BERT"** — [arXiv:1901.04085](https://arxiv.org/abs/1901.04085), **2019**. Verified. This is the canonical cross-encoder reranking paper.

| | **Bi-encoder** | **Cross-encoder** |
| --- | --- | --- |
| Encodes query and document | **Separately** | **Together**, as one input |
| Document embeddings | **Precomputable** | **Cannot be precomputed** |
| Cost per query | One encode + ANN lookup | **One forward pass per candidate** |
| Accuracy | Good | **Better** |
| Role | **Retrieval** (recall-oriented) | **Reranking** (precision-oriented) |

**Why the asymmetry:** a bi-encoder can precompute all document vectors because documents are encoded independently of the query. A cross-encoder lets query and document tokens **attend to each other**, which is far more expressive — but the score depends on the pair, so **every (query, document) pair needs its own forward pass.** That makes it **O(n) forward passes per query**.

**This is exactly why they are used in a two-stage pipeline:**

1. **Retrieve** a few hundred candidates cheaply with a bi-encoder + ANN.
2. **Rerank** the top ~50–100 with a cross-encoder, and keep the best few.

**The two-stage design is the single most important practical pattern in modern retrieval.** It gives near-cross-encoder quality at near-bi-encoder cost.

**Modern rerankers (verified to exist with dimensions/context):** Voyage `rerank-2.5` and `rerank-2.5-lite` (**32,000 context**), listed in Anthropic's docs. Others commonly used include Cohere Rerank and the open-source BGE reranker family. **[VERIFY] specific model names and benchmarks before publishing.**

**Free option for the learner:** open-weight rerankers (e.g. BGE cross-encoder models) run locally at no cost — a genuinely viable $0 path.

---

# 7. INFERENCE & SERVING

## 7.1 Prefill vs decode; TTFT vs TPS

Recall §3.10. The two user-visible metrics map onto the two phases:

- **Time-to-first-token (TTFT)** — dominated by **prefill**. Scales with **prompt length** and is compute-bound.
- **Tokens-per-second (TPS)** — dominated by **decode**. Scales with **memory bandwidth** and **batch size**, not with prompt length.

**These trade off against each other.** Large batches improve **aggregate throughput** (total tokens/sec across all users) but can **increase per-request TTFT and sometimes per-token latency**. This is why a provider's "tokens per second" benchmark means little without stating **batch size and latency percentile**.

**A practical diagnostic worth teaching:** if TTFT is high but TPS is fine, your *prompt* is too long. If TPS is low but TTFT is fine, you are bandwidth- or batch-limited. **These are different fixes.**

## 7.2 Batching: static vs continuous

### The problem with static batching

**Orca, "A Distributed Serving System for Transformer-Based Generative Models"** — Yu, Jeong, Kim, Kim & Chun. Verified from the official USENIX page: **16th USENIX OSDI '22, Carlsbad, CA, July 2022, pp. 521–538, ISBN 978-1-939133-28-1.**

The abstract states the static-batching problem verbatim: with static batching, "requests that have finished earlier than other requests in a batch **cannot return to the client**, while newly arrived requests **have to wait until the current batch completely finishes**."

Because generation lengths vary wildly, a static batch runs at the speed of its **longest** member, and finished slots idle as padding.

### The solution — and a terminology correction

> ### **[MYTH] Orca does not use the phrase "continuous batching"**
> **Orca's own terms are "iteration-level scheduling" and "selective batching"** (both verbatim from the abstract). **"Continuous batching" is the community/vLLM/Anyscale name** for the same technique.

**How it works:** the scheduler operates at the granularity of a **single decoding iteration**. After each iteration, **finished requests are removed** and **new ones are admitted**. Slots never sit idle waiting for the longest sequence, and padding is eliminated.

**Verified result:** Orca achieved **36.9× throughput** vs NVIDIA FasterTransformer at the same latency. **Note: the USENIX page renders this as "36:9×" — a typographical artifact; the intended figure is 36.9×.** Anyscale's widely-cited "23×" figure was **[UNVERIFIED]** (not fetched). The **cellular batching** paper (Gao et al., 2018) was also not fetched — **[UNVERIFIED]**.

**Why this matters:** continuous batching is the main reason modern serving engines achieve far higher throughput than naive implementations. It is arguably the single biggest serving-side win of the last few years, and it is **orthogonal** to model quality.

## 7.3 Speculative decoding

**Two concurrent origin papers, both verified:**

1. **Leviathan, Kalman & Matias, "Fast Inference from Transformers via Speculative Decoding"** — [arXiv:2211.17192](https://arxiv.org/abs/2211.17192), v1 **30 Nov 2022**, v2 **18 May 2023**, comments field: **"ICML 2023 Oral"**. **Google Research — not DeepMind.** T5-XXL: **2×–3×** vs standard T5X.
2. **Chen, Borgeaud, Irving, Lespiau, Sifre & Jumper, "Accelerating Large Language Model Decoding with Speculative Sampling"** — [arXiv:2302.01318](https://arxiv.org/abs/2302.01318), **2 Feb 2023**, **DeepMind**. **No venue listed → arXiv-only.** Chinchilla 70B: **2–2.5× speedup**.

### The mechanism

A small, cheap **draft model** generates `γ` candidate tokens autoregressively. The large **target model** then evaluates **all `γ` candidates in a single parallel forward pass** (which is efficient because it is compute-bound rather than bandwidth-bound). Candidates are accepted or rejected by a rule that preserves the target distribution; on first rejection, the rest are discarded and the process repeats.

**Why it works:** it converts `γ` *sequential* target-model calls into **one** parallel call — exploiting exactly the prefill/decode asymmetry from §3.10. Decode is bandwidth-bound and underutilises compute; speculation uses that idle compute.

### **[MYTH] "Speculative decoding produces identical output" is imprecise**

The papers claim **distribution-exactness**, not identical text. Verified verbatim from Leviathan:

> "guaranteeing that the outputs from our system have the **same distribution** as those from the target model alone" … "It's easy to show … that for any distributions p(x) and q(x), and x sampled in this way, indeed x ~ p(x)."

**The exact accept/reject rule (verbatim):** "sample x ~ q(x), keeping it if q(x) ≤ p(x), and in case q(x) > p(x) we reject the sample with probability 1 − p(x)/q(x) and sample x again from an adjusted distribution **p'(x) = norm(max(0, p(x) − q(x)))**."

**Four precise caveats — all four matter:**

1. Losslessness means **matching the distribution**, not producing identical strings. Two runs still differ.
2. It requires the **exact** draft probabilities `q` and the **exact** accept/reject/resample rule. Any approximation (e.g. approximating `q`) **breaks exactness**.
3. Sampling schemes (temperature/top-k/top-p) must **first be cast into standard sampling from an adjusted distribution** (§2.2 "Standardized Sampling") for the argument to apply.
4. **Chen et al. claim exactness only "within hardware numerics"** — floating-point differences are acknowledged, not theoretically excluded.

There is a dedicated §A.2 **"Speculative Sampling vs. Rejection Sampling"**: naive rejection sampling is **NOT** lossless. This is the most commonly botched detail.

### When it helps — and when it hurts

**Requires:** spare compute to evaluate `γ+1` tokens concurrently, a genuinely **cheaper** draft model, and a **memory-bandwidth-bound** target. **If the target is compute-bound (e.g. very large batch), speculation can slow you down.**

The theoretical guarantee is on the **number of serial runs** — it "can never, even in the worst case, be larger" — **not on wall-clock time**. **Wall-clock can still regress.** Expected tokens per round: `E(#tokens) = (1 − α^(γ+1))/(1 − α)`, where `α = E(min(p,q))`.

### Related methods (verified)

- **Medusa** — Cai et al., [arXiv:2401.10774](https://arxiv.org/abs/2401.10774), **19 Jan 2024**. Adds extra **decoding heads** + tree attention. **Medusa-1: >2.2× "without compromising generation quality" (lossless, frozen backbone); Medusa-2: 2.3–3.6× but requires a special training recipe.** **[MYTH] Only Medusa-1 is claimed lossless — do not call Medusa uniformly lossless.**
- **Lookahead decoding** — Fu, Bailis, Stoica & Zhang, [arXiv:2402.02057](https://arxiv.org/abs/2402.02057), **3 Feb 2024**. "exact, parallel decoding … **without needing auxiliary models or data stores**"; up to **1.8× on MT-bench**, **4×** on multi-GPU code completion.
- **The clean contrast to teach:** speculative decoding needs a **draft model**; Medusa needs **extra trained heads**; lookahead needs **neither**.

## 7.4 Quantisation

**The core trade:** fewer bits per weight → less memory and less bandwidth → **faster decode** (because decode is bandwidth-bound), at some accuracy cost.

**Numerical formats:**

| Format | Bits/weight | Notes |
| --- | --- | --- |
| **fp32** | 32 | Training standard; rarely used for inference |
| **fp16 / bf16** | 16 | Standard inference format |
| **int8** | 8 | ~2× smaller than fp16; usually small quality loss |
| **int4** | 4 | ~4× smaller; larger quality loss, heavily method-dependent |

**bf16 vs fp16:** bf16 keeps fp32's *exponent range* with fewer mantissa bits; fp16 has more mantissa but a narrower range. bf16 is generally preferred for training; both are common for inference.

### GGUF

**GGUF** is the file format used by **llama.cpp**, and it **replaced the older GGML format** (and, before that, GGMF/GGJT). It packages weights **plus metadata (architecture, tokenizer, hyperparameters) in a single file** — which is why you can download one `.gguf` file and run it.

> ### **[MYTH] GGUF does NOT stand for "GPT-Generated Unified Format"**
> That expansion is a widely-circulated backronym. The official `llama.cpp` `gguf-py` README expands it as **"GGUF (GGML Universal File)"**, and the official ggml spec (`ggml-org/ggml/docs/gguf.md`) **never expands the acronym at all**. **Treat "GPT-Generated Unified Format" as false / unverified.**

**Common quantisation names and what they mean:**
- **`Q4_K_M`, `Q5_K_M`, `Q8_0`**, etc.
- **`Q4`** ≈ 4 bits per weight; **`Q8`** ≈ 8 bits. **(See the important caveat below.)**
- **`_K`** = a **"K-quant"**, a newer mixed-precision scheme that assigns **different bit-widths to different tensors** based on sensitivity (e.g. attention weights get more bits than some FFN weights). **K-quants generally beat legacy quants at the same average size.**
- **`_M`** = **"medium"**, part of a family (`_S` small, `_M` medium, `_L` large) indicating how aggressively sensitive tensors are up-quantised.
- **`_0` / `_1`** suffixes (e.g. `Q8_0`) mark legacy, non-K quantisation schemes.

> ### **The `Q4` label is a name, not a literal bit-width**
> llama.cpp's **own benchmark table** (Llama-3.1-8B) measures **`Q4_K_M` at 4.8944 bits per weight** and **`Q8_0` at 8.5008 bits per weight**. Metadata, scales, and mixed-precision tensors all add overhead.
>
> **So do not state "Q4_K_M is 4 bits per weight."** Say "nominally 4-bit; in practice about **4.9 bits/weight** including overhead." This is exactly the kind of plausible-sounding precision error that a fact-check should catch.

**[VERIFY] exact file sizes and perplexity numbers per quant before quoting.** These depend on the model, and community tables go stale. The reliable teaching points are the *structure* (`Q<bits>_<scheme><variant>`) and the fact that **labels round while benchmarks don't**.

### Method families

- **GPTQ** — Frantar et al., "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers", [arXiv:2210.17323](https://arxiv.org/abs/2210.17323). **Verified venue: ICLR 2023** (stated in the arXiv comments field). A **layer-wise, second-order (OBQ-derived)** method that quantises weights one at a time and **compensates the error** in the remaining weights using Hessian information.
- **AWQ** — Lin et al., "AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration", [arXiv:2306.00978](https://arxiv.org/abs/2306.00978). **Verified venue — and stronger than commonly stated: the arXiv comments field reads "MLSys 2024 Best Paper Award".** Key idea, and the contrast worth teaching: **AWQ protects salient weights based on ACTIVATION magnitude** — it observes that a small fraction of weights matter disproportionately because they align with large activations, and preserves those.
  - **The clean distinction:** GPTQ is **error-compensating** (second-order, weight-error driven); AWQ is **activation-aware protection** (salience-driven).
- **bitsandbytes** — provides **8-bit** and **4-bit (NF4)** quantisation for Hugging Face workflows. **NF4 was introduced in the QLoRA paper: Dettmers et al., [arXiv:2305.14314](https://arxiv.org/abs/2305.14314).** Verified verbatim from that abstract: "**4-bit NormalFloat (NF4), a new data type that is information theoretically optimal for normally distributed weights**." *(Attribution of the bitsandbytes library itself was not separately verified — [UNVERIFIED].)*

### Accuracy/size tradeoffs — what can and cannot be said honestly

**What is safe to say:** int8 typically costs little quality; int4 costs more and the cost is **method-dependent** (a good 4-bit method can beat a naive 8-bit one on real tasks); aggressive quantisation hurts **reasoning and long-context tasks more than simple generation**; and **KV-cache quantisation is a separate axis** with its own sensitivity profile.

**What is NOT safe to say:** any specific "Q4 loses X% accuracy" figure. **These numbers are model- and benchmark-specific, and the widely circulated tables are frequently vendor-produced.** **[VERIFY] and attribute — or better, tell learners to measure on their own task.**

## 7.5 Open-weight models and running locally

| Tool | What it is | Licence (verified where stated) |
| --- | --- | --- |
| **llama.cpp** | C/C++ inference engine | Repo `github.com/ggml-org/llama.cpp`. **MIT licence (verified via README badge).** Runs GGUF on CPU, GPU, and Apple Silicon. **The foundation most local tooling is built on.** |
| **Ollama** | Local model runner + **REST API** | `ollama.com`. **MIT licence (verified by fetching the LICENSE file).** REST API on **port 11434**. Its README states supported backends include the **llama.cpp project, founded by Georgi Gerganov**. |
| **LM Studio** | **GUI desktop app** | `lmstudio.ai`. Published by **Element Labs, Inc.**, governed by "LM Studio Desktop App **Terms of Service**" — i.e. **proprietary/closed-source**, free to use. **Governing terms: [VERIFY] before publishing details.** |
| **vLLM** | High-throughput serving engine | `docs.vllm.ai`, `github.com/vllm-project/vllm`. **Licence: [UNVERIFIED]** — the README does not state it and the LICENSE file was not fetched. Commonly reported as Apache 2.0; **check before publishing.** |

**The distinction worth teaching:** **llama.cpp** = *engine*; **Ollama** = *engine + packaging + API*; **LM Studio** = *GUI*; **vLLM** = *high-throughput server*. They overlap but solve different problems, and llama.cpp underpins several of the others.

**Hardware reality for the $0-budget learner (state as general principles, not promises):**

- **Model size ≈ parameters × bytes-per-weight.** A 7B model at 4-bit is roughly **3.5–4 GB** of weights, plus KV cache and overhead. **[VERIFY per model.]**
- **More RAM than the weight file is needed**, because of the KV cache and runtime overhead.
- **CPU inference works but is slow** (single-digit tokens/sec is normal); **Apple Silicon unified memory** is unusually good for this; **consumer GPUs** are fastest but VRAM-limited.
- **Quantised small models are the realistic $0 path.** A 3B–8B model at Q4 on CPU is genuinely usable for learning, even if slow.

---

# 8. THE MODEL LANDSCAPE

## 8.1 Major frontier labs

**[VERIFY EVERYTHING IN THIS SECTION — it changes monthly.]**

| Lab | Model family | Notes |
| --- | --- | --- |
| **OpenAI** | GPT-x, o-series reasoning | Closed weights. Current frontier documented as `gpt-6-astra`. |
| **Anthropic** | Claude (Fable/Opus/Sonnet/Haiku tiers) | Closed weights. |
| **Google DeepMind** | Gemini (Pro/Flash/Flash-Lite tiers) | Closed weights; multimodal from the start. |
| **Meta** | Llama | "Open weights" with a **custom community licence** — see §8.2. |
| **Mistral AI** | Mistral, Mixtral, and others | Mix of Apache 2.0 and proprietary. |
| **DeepSeek** | DeepSeek-V3, R1 | Open weights; MoE + MLA; R1 published in *Nature*. |
| **Alibaba** | Qwen | Very broad open-weight family. |
| **xAI** | Grok | Closed weights. |
| **Cohere** | Command; strong in embeddings/reranking | Mixed. |

**Also relevant to a curriculum (open-weight, non-frontier-lab):** Microsoft (Phi), Google (Gemma), TII (Falcon), EleutherAI (Pythia), Allen AI (OLMo — notable for releasing training data/code too).

## 8.2 Open-weight vs closed — what "open weights" does and does not mean

> ### **[MYTH] "Open weights" ≠ "open source"**
> These are **different standards**, and conflating them is the most common error in AI licensing discussions.

**"Open weights"** means you can **download the trained parameters** and run them. It does **not** necessarily give you:
- the **training data**,
- the **training code**,
- the **data-processing pipeline**,
- freedom from **licence restrictions** on use.

### The OSI's Open Source AI Definition (OSAID)

The **Open Source Initiative** published the **Open Source AI Definition (OSAID) 1.0**, which sets a formal bar for calling an AI system "open source" — requiring, among other things, access to **data information** sufficient to recreate the system, the **code**, and the **parameters**, under terms permitting free use, study, modification, and sharing.

**[UNVERIFIED in detail]** — the OSI page (`opensource.org/ai/open-source-ai-definition`) was fetched and returned HTTP 200 but rendered **no usable body text** to automated fetching. **Verify the exact OSAID requirements from the page directly before publishing a detailed summary.**

### The practical spectrum

| Level | You get | Example framing |
| --- | --- | --- |
| **Closed / API-only** | Access via API; no weights | GPT, Claude, Gemini |
| **Open weights, restricted licence** | Weights, with usage limits | Some Llama releases |
| **Open weights, permissive licence** | Weights under Apache-2.0/MIT | Many Qwen sizes; DeepSeek-R1 |
| **Fully open** | Weights + code + data | OLMo, Pythia |

> ### **[MYTH] Meta's Llama licence is NOT OSI-approved**
> Llama is released under a **custom community licence with usage restrictions**. **Verified from the Llama 3.1 Community License text itself**, which includes: a **700M monthly-active-user cap** above which you need a grant from Meta **at its sole discretion**; an **Acceptable Use Policy**; a **"Built with Llama"** attribution requirement; **no trademark licence**; and **retaliatory termination** provisions. This is **"open weights", not "open source"** in the OSI sense.
>
> **Check the specific version's licence text before publishing details — the terms have changed across releases**, and we verified **Llama 3.1 only** (not Llama 4). Similarly, **OpenRAIL** licences include behavioural use restrictions and are **not** OSI-approved. *[OpenRAIL terms not fetched — UNVERIFIED.]*

**Verified licence data points (re-check each before publishing):**
- **Mixtral 8x7B: Apache 2.0** — verified verbatim from the paper's abstract: "Both the base and instruct models are released under the Apache 2.0 license."
- **DeepSeek-R1: MIT** — verified from the Hugging Face model card. **[VERIFY at publication]**
- **Qwen: Apache 2.0** for at least `Qwen2.5-7B-Instruct` and `Qwen3-8B` — verified from their HF cards. **Licensing varies across the Qwen family by size, so check per model. [VERIFY]**

## 8.3 Model sizes, parameter counts, and what scaling laws say

### Parameter count intuition

- **Parameters are the learned weights.** Model size is usually quoted in billions (B).
- **Memory ≈ parameters × bytes per weight** (§7.4). This is why quantisation matters.
- **Rough scale bands (approximate, for intuition):**
  - < 1B — tiny; classification, embeddings, edge
  - 1–4B — small; runs on phones/laptops
  - 7–9B — the classic "runs locally" size
  - 13–34B — needs a good GPU or lots of RAM
  - 70B — serious hardware
  - 100s of B – T+ — datacentre only

**[VERIFY] the exact bands if you present them as facts; the boundaries are conventions, not laws.**

### Scaling laws

**Kaplan et al., "Scaling Laws for Neural Language Models"** — [arXiv:2001.08361](https://arxiv.org/abs/2001.08361), **23 Jan 2020**. Verified verbatim: loss "scales as a **power-law** with model size, dataset size, and the amount of compute used for training, with some trends spanning **more than seven orders of magnitude**." Notably: "**Other architectural details such as network width or depth have minimal effects within a wide range.**" And: "**Larger models are significantly more sample-efficient**", such that compute-optimal training involves training very large models on modest data and stopping well before convergence.

**Hoffmann et al. (Chinchilla), "Training Compute-Optimal Large Language Models"** — [arXiv:2203.15556](https://arxiv.org/abs/2203.15556), **29 Mar 2022**. Verified verbatim: trained "over 400 language models ranging from **70 million to over 16 billion parameters** on **5 to 500 billion tokens**", finding that "for compute-optimal training, **the model size and the number of training tokens should be scaled equally: for every doubling of model size the number of training tokens should also be doubled.**"

Verified result: **Chinchilla (70B, 4× more data) outperformed Gopher (280B), GPT-3 (175B), Jurassic-1 (178B), and Megatron-Turing NLG (530B)**, reaching **67.5% on MMLU, a >7% improvement over Gopher.**

### **The important correction to the popular telling**

> ### **[MYTH] "Bigger models are always better" — and "Chinchilla means models were too big"**
> The two papers **disagree**, and that disagreement is the actual lesson:
> - **Kaplan (2020)** implied: for a fixed compute budget, **prioritise model size** and train on relatively less data.
> - **Chinchilla (2022)** corrected this: **scale model size and data roughly equally.**
>
> The practical consequence was that **most pre-2022 models were significantly undertrained**, and the field shifted to training smaller models on far more data. This is why a modern ~8B model can outperform a 2020-era 175B model on many tasks.
>
> **Scaling laws describe loss, not capability.** They predict a smooth decrease in **cross-entropy loss** on the training distribution. They do **not** promise smooth improvement on any particular task, and **emergent capability** claims are actively disputed. **Teach scaling laws as a *loss* prediction, not a capability law.**

**Also important:** these are **empirical fits to specific training setups**, not physical laws. Constants and exponents do not transfer cleanly across architectures, data mixtures, or optimisers. **[VERIFY any specific exponent before quoting.]**

## 8.4 Reasoning / thinking models and test-time compute

**The shift:** instead of only scaling **training** compute, spend more compute **at inference time** — let the model generate a long internal chain of reasoning before answering.

**DeepSeek-R1** ([arXiv:2501.12948](https://arxiv.org/abs/2501.12948)) is the verified landmark. Verbatim from the abstract: "the reasoning abilities of LLMs can be **incentivized through pure reinforcement learning (RL), obviating the need for human-labeled reasoning trajectories**." The RL framework "facilitates the emergent development of advanced reasoning patterns, such as **self-reflection, verification, and dynamic strategy adaptation**", achieving "superior performance on **verifiable tasks** such as mathematics, coding competitions, and STEM fields."

**Peer-review status: verified** — journal reference ***Nature* volume 645, pages 633–638 (2025)**, DOI 10.1038/s41586-025-09422-z.

**Verified trade-offs and behaviours to teach:**

1. **Reasoning tokens are billed as output tokens** and are typically the **most expensive** tokens. A "thinking" model can cost many times more than a non-thinking one for the same answer.
2. **Reasoning tokens count toward the context window** and, on some models, are **retained across turns** (Anthropic's docs describe per-model "thinking block preservation").
3. **Latency is much higher** — reasoning happens before the visible answer.
4. **The control surface is now an API parameter:** OpenAI exposes `reasoning.effort` with values **`none`, `low`, `medium`, `high`, `xhigh`, `max`** depending on model; Anthropic exposes **effort** levels; Gemini exposes **thinking** levels (`low`, `medium`, `high`). **[VERIFY per model.]**
5. **Anthropic's docs note a subtlety:** with **interleaved thinking**, the model can think between tool calls; and **tool-use turns require returning the thinking block unmodified** (the API cryptographically signs it). This is a real implementation constraint.
6. **Verifiable-domain bias:** RL-on-verifiable-rewards works best where correctness can be checked automatically (maths, code). **Do not assume the same gains transfer to open-ended tasks** — this is an active research question.

## 8.5 Multimodal models

**Concept:** models that accept and/or produce more than one modality (text, image, audio, video).

**Verified current examples:**
- **Gemini 3.8 Flash** (fetched): inputs **Text, Image, Video, Audio, and PDF**; output **Text**. **[VERIFY]**
- **Claude models** (fetched): "All current models support **text and image input, text output**, multilingual capabilities, vision, and tool use." **[VERIFY]**
- **OpenAI `gpt-6-astra`** (fetched): "Input modalities: **text, image**; Output modalities: **text**." **[VERIFY]**

**Key technical points:**

1. **Modalities are tokenised too.** Images become **patches**; audio becomes **frames**; video becomes **frames over time plus possibly audio**. Anthropic's docs confirm "All input to and output from the Gemini API is tokenized, including text, image files, and other non-text modalities."
2. **Images consume tokens**, often a lot. **Verified, important caveat:** OpenAI's token-counting guide states images "consume tokens based on size and detail level" and that "estimates like `characters / 4` are inaccurate" for them — **use the count endpoint.** Anthropic allows **up to 600 images or PDF pages per request** (100 for 200k-context models). **[VERIFY]**
3. **Multimodal embeddings exist** — e.g. Voyage's `voyage-multimodal-3.5`, verified to "vectorize interleaved text, images, and video" with **32,000 context** and **1024 default dimensions**. **[VERIFY]**
4. **A separate output modality is a different model/endpoint.** Generating images (Gemini's Imagen/Veo/Nano Banana, OpenAI's image generation) is generally **not** the same call as text generation.

**The teaching point:** "multimodal" spans a wide range — *image input* (nearly universal now), *audio input*, *video input*, *image output*, *audio output*. **Be specific about which capability you mean.** "The model is multimodal" is close to meaningless on its own.

---

# 9. MYTHS AND OVERSIMPLIFICATIONS — CONSOLIDATED

The highest-value section for fact-checking. Each item is a claim you will encounter, and what is actually true.

| # | Common claim | Reality |
| --- | --- | --- |
| 1 | "The attention scaling is `sqrt(d_model)`" | **`sqrt(d_k)`** — the key/query dimension. Differs numerically (8 vs ~22.6 in the paper). |
| 2 | "The multi-query attention paper is titled *Multi-Query Attention*" | Actual title: **"Fast Transformer Decoding: One Write-Head is All You Need"**. |
| 3 | "RoPE uses theta = 10000" / "modern models all use 1e6" | **`rope_theta` is a config convention, not a RoPE-paper fact.** Verified values span **10⁴ (DeepSeek-V3/R1), 5×10⁵ (Llama-3-8B), 10⁶ (Mixtral, Qwen3)**. |
| 4 | "vLLM found 60–80% of KV cache wasted" | The paper reports **UTILISATION of 20.4%–38.2%**. "60–80% wasted" is a derived inversion, not the paper's number. |
| 5 | "vLLM is X times faster" | Exactly **"2-4× with the same level of latency"** vs **FasterTransformer AND Orca**. No single multiplier exists. |
| 6 | "Lost in the Middle shows a 20% accuracy drop" | The paper's anchor: middle-position accuracy falls **below GPT-3.5-Turbo's 56.1% closed-book accuracy**. Setup used **10/20/30** docs. |
| 7 | "Speculative decoding produces identical output" | It is **distribution-exact** under 4 conditions, **not** identical text. Naive rejection sampling is **not** lossless. |
| 8 | "Medusa is lossless" | Only **Medusa-1** is claimed lossless. **Medusa-2 is not.** |
| 9 | "Continuous batching comes from Orca" | Orca's terms are **"iteration-level scheduling"** and **"selective batching"**. "Continuous batching" is the community name. |
| 10 | "FlashAttention is approximate" | It is **EXACT** — that is its headline claim. Earlier efficient-attention methods were approximate. |
| 11 | "FlashAttention-3 is by Tri Dao (first author)" | First author is **Jay Shah**; Dao is **last** author. |
| 12 | "Open weights = open source" | Different standards. **Llama's licence is not OSI-approved.** |
| 13 | "1 token ≈ 4 characters" | tiktoken says ~4 **bytes**. OpenAI now calls `characters / 4` **inaccurate** for anything but plain text. |
| 14 | "Every chat message adds ~4 tokens" | Current cookbook uses **3** (+3 priming). The "4" is stale, and this is legacy-chat-model territory anyway. |
| 15 | "~1.3 tokens per word" | **[UNVERIFIED]** — no primary source. Varies by tokenizer, language, and content. |
| 16 | "Tokenization explains the strawberry r-counting failure" | **[UNVERIFIED]** — no authoritative source for that prompt. The *documented* related finding is that **number** tokenization direction changes **arithmetic** accuracy. |
| 17 | "Bigger models are always better" | Chinchilla showed most pre-2022 models were **undertrained**. Modern small models beat old huge ones. |
| 18 | "Scaling laws predict capability" | They predict **cross-entropy loss**. Capability, especially "emergent" ability, is not guaranteed. |
| 19 | "MoE models are cheaper to run" | Cheaper in **compute**, not **memory** — all experts must be resident. |
| 20 | "Mixtral 8x7B is 8 × 7B = 56B" | **≈47B total / ≈13B active.** Experts share attention; it is not 8 whole models. |
| 21 | "More context is always better" | **Context rot** is real and acknowledged in Anthropic's own docs. Curation beats volume. |
| 22 | "A bigger context window means I can skip retrieval" | Liu et al. and the Chroma report both show degradation with length, even on easy tasks. |
| 23 | "Logprobs tell you if the answer is right" | They are **token likelihoods**, not correctness probabilities. Models are confidently wrong. |
| 24 | "Temperature 0 gives reproducible output" | **Not guaranteed** — batching, kernel selection, and float non-associativity all vary. |
| 25 | "Cross-encoders can be precomputed like bi-encoders" | **No** — they score (query, doc) pairs, so cost is **O(n) forward passes**. |
| 26 | "Vector databases are required for retrieval" | At small scale, **exact search over NumPy arrays is fine** — often simpler and faster. |
| 27 | "The "context rot" study proves long context is broken" | It is a **vendor technical report (Chroma), not peer-reviewed**. The finding is real and directionally corroborated, but cite it as a tech report. |
| 28 | "BERT-style and GPT-style models are interchangeable" | Encoder-only (bidirectional) vs decoder-only (causal) — different training, different uses. |
| 29 | "Reasoning models are strictly better" | They are better on **verifiable** tasks and cost **far more** output tokens and latency. |
| 30 | "Anthropic makes embedding models" | **Verified: it does not.** Its docs recommend Voyage AI. |
| 31 | "Matryoshka Representation Learning won a NeurIPS 2022 Outstanding Paper Award" | **FALSE.** The official NeurIPS 2022 awards page lists all 15 Outstanding Papers and **MRL is absent**. The paper is real; the award is not. |
| 32 | "GGUF stands for GPT-Generated Unified Format" | **FALSE backronym.** The official `gguf-py` README says **"GGUF (GGML Universal File)"**; the ggml spec never expands it. |
| 33 | "Q4_K_M means 4 bits per weight" | A **label**, not a measurement. llama.cpp benchmarks it at **4.8944 bits/weight**; `Q8_0` at **8.5008**. |
| 34 | "Binary quantisation retains ~96% of performance" | **"Up to ~96%" WITH rescoring**; **~92.5% without it**. The qualifier is routinely dropped. 32× memory saving *is* safe (arithmetic). |
| 35 | "MTEB v2 is the successor benchmark" | "v2" is a **version suffix** in the `mteb` library. The actual successor is **MMTEB** (arXiv 2502.13595). |
| 36 | "vLLM is Apache 2.0" | Widely repeated and probably right, but **[UNVERIFIED]** in this session — the README doesn't state it. |

---

# 10. A $0-BUDGET LEARNING PATH (PHILIPPINES-CONTEXT NOTES)

This is curriculum scaffolding that follows from the technical content, not new factual claims.

**Tier 1 — no hardware beyond a laptop:**
- Use **free web chat interfaces** to build intuition (all major labs have free tiers).
- Do the **tokenization experiment**: count the same sentence in English and Tagalog with a free local tokenizer. This makes §1.7 visceral.
- Read the **original papers' abstracts** (free on arXiv) — not the full papers. The abstracts of Vaswani, Liu, Holtzman, and the Chinchilla paper are genuinely readable.

**Tier 2 — free APIs and free tooling:**
- **Free API tiers** exist at most providers; they are rate-limited but adequate for learning. **[VERIFY current free tiers — they change constantly.]**
- **Google AI Studio** has historically offered a generous free tier. **[VERIFY]**
- **Hugging Face** hosts free models, datasets, and Spaces.

**Tier 3 — local inference:**
- **Ollama** or **LM Studio** for the easiest path; **llama.cpp** to understand what's underneath.
- A 3B–8B model at **Q4_K_M** is the realistic target for a modest laptop. **Expect slow CPU speeds; that is normal, not a failure.**
- **This tier is where the KV-cache and quantisation concepts become tangible** — because you can watch memory usage scale with context length.

**Tier 4 — build something:**
- A **RAG pipeline** with `sqlite-vec` or FAISS and a small local model: this exercises embeddings, ANN search, chunking, reranking, and context-window management in one project — and costs nothing.

**Currency and regional notes:**
- **Billing, pricing, and free-tier availability for the Philippines: [VERIFY] individually.** Payment-method availability and regional pricing vary and change; do not state specific peso costs or card requirements without checking.
- **Latency from the Philippines to US-hosted APIs is non-trivial.** This makes the **TTFT/prefill distinction** (§7.1) practically relevant, not academic.

---

# 11. CONSOLIDATED [UNVERIFIED] LIST

Everything below could **not** be confirmed from a primary source during compilation. **Do not publish these as facts.**

**Tokenization:**
1. Schuster & Nakajima (2012), "Japanese and Korean Voice Search" — could not locate/fetch.
2. The exact **WordPiece merge criterion** formula — only the *inference* rule (longest-match-first) is verified.
3. The **"strawberry" r-counting** phenomenon — no authoritative source.
4. Ahia et al., "Do All Languages Cost the Same?" — could not locate.
5. **~1.3 tokens/word** and **~0.75 words/token** — no primary source.
6. Exact original wording of OpenAI's "1 token ≈ 4 characters" rule (help centre returns HTTP 403).
7. **Gage (1994)** primary text — attribution only via secondary citation.
8. **Emoji tokenization** quantification — none found.
9. **Code/JSON tokens-per-line** benchmarks — none found.

**Architecture / serving:**
10. NeurIPS 2017 venue for *Attention Is All You Need* — not on the arXiv page.
11. Peer-review venues for RoFormer, ALiBi, FA2, FA3, Medusa, lookahead, and Chen et al. — not listed on their arXiv pages.
12. **Lost in the Middle** per-position figure *values* — in images, not extractable.
13. **Llama-2-7B per-token KV cache** figure — no authoritative source exists.
14. **Mixtral parameter totals**: config-derived ≈47.4B/≈13.6B vs popular 46.7B/12.9B — **accounting-basis conflict, unresolved**.
15. **Qwen3-235B-A22B** "235B/22B" from authoritative prose — from naming convention/card only (the 128-expert/top-8 structure *is* verified).
16. **Mistral blog's** parameter count — page body did not render.
17. **Anyscale's "23×"** continuous-batching figure and the **cellular batching** (Gao 2018) paper.
18. **Matryoshka NeurIPS award** — **now confirmed FALSE**, not merely unverified (see §6.7 and myth #31).
19. **GGUF backronym** — **confirmed FALSE**; official expansion is "GGML Universal File" (see §7.4 and myth #32).
20. **word2vec "300 dimensions"** — plausible and widely true (GoogleNews-vectors-negative300) but **NOT stated in either abstract**. Was not verified from a primary source.
21. **Yamada et al. 2021** rescoring method (arXiv 2106.00882) — cited for binary-quantisation rescoring; not fetched.
22. **MTEB leaderboard rankings** — JS-rendered; could not be read. **MMTEB** (arXiv 2502.13595) likewise not fetched.
23. **Cohere Rerank** details — JS-rendered.
24. **Ollama licence** and **LM Studio terms** — now **partially verified**: Ollama = MIT (LICENSE fetched); LM Studio = proprietary, governed by "Desktop App Terms of Service" **but exact terms not read**. **vLLM licence [UNVERIFIED].** Chroma/Qdrant/Milvus/Weaviate/LanceDB/pgvector licences **not verified**.
25. **OpenAI "GPT-5-era" tokenizer exactness** — the *reason* is now understood (`o200k_harmony` for gpt-oss; API steered over local), but a definitive statement about the newest models' local tokenizer exactness is unconfirmed.
26. **KV-cache quantisation accuracy-vs-bitwidth** numbers — none authoritative found.
27. **Specific quantisation accuracy-loss percentages** (e.g. "Q4 loses X%") — model/benchmark-specific; not verified.
28. **OSAID 1.0** detailed requirements and release date — the OSI page rendered **title only**, no usable body text.
29. **"Open weights" formal definition** and **OpenRAIL** licence terms — not fetched.
30. **Llama 4 licence** — only **Llama 3.1** was verified.
31. **bitsandbytes library attribution** — NF4 itself is verified from QLoRA; the library's own provenance was not.
32. **Free API tier** availability and **Philippines-specific** billing/pricing — not verified.
33. **Min-p** origin paper — not verified.

---

# 12. PRIMARY SOURCES INDEX

Every source below was **actually fetched** during compilation.

**Papers (arXiv)**
- Attention Is All You Need — https://arxiv.org/abs/1706.03762
- Fast Transformer Decoding (MQA) — https://arxiv.org/abs/1911.02150
- RoFormer / RoPE — https://arxiv.org/abs/2104.09864
- ALiBi — https://arxiv.org/abs/2108.12409
- YaRN — https://arxiv.org/abs/2309.00071
- Lost in the Middle — https://arxiv.org/abs/2307.03172
- Attention Is All You Need (HTML, v7) — https://arxiv.org/html/1706.03762v7
- FlashAttention — https://arxiv.org/abs/2205.14135
- FlashAttention-2 — https://arxiv.org/abs/2307.08691
- FlashAttention-3 — https://arxiv.org/abs/2407.08608
- GQA — https://arxiv.org/abs/2305.13245
- PagedAttention / vLLM — https://arxiv.org/abs/2309.06180
- Speculative Decoding — https://arxiv.org/abs/2211.17192
- Speculative Sampling (DeepMind) — https://arxiv.org/abs/2302.01318
- Medusa — https://arxiv.org/abs/2401.10774
- Lookahead Decoding — https://arxiv.org/abs/2402.02057
- Outrageously Large Neural Networks — https://arxiv.org/abs/1701.06538
- Switch Transformers — https://arxiv.org/abs/2101.03961
- Mixtral of Experts — https://arxiv.org/abs/2401.04088
- DeepSeek-V3 — https://arxiv.org/abs/2412.19437
- DeepSeek-R1 — https://arxiv.org/abs/2501.12948
- Scaling Laws — https://arxiv.org/abs/2001.08361
- Chinchilla — https://arxiv.org/abs/2203.15556
- BPE (Sennrich) — https://arxiv.org/abs/1508.07909
- BERT — https://arxiv.org/abs/1810.04805
- Fast WordPiece — https://arxiv.org/abs/2012.15524
- SentencePiece — https://arxiv.org/abs/1808.06226
- Subword Regularization — https://arxiv.org/abs/1804.10959
- Tokenizer unfairness (Petrov) — https://arxiv.org/abs/2305.15425
- Tokenization counts (arithmetic) — https://arxiv.org/abs/2402.14903
- Curious Case of Neural Text Degeneration — https://arxiv.org/abs/1904.09751
- Hierarchical Neural Story Generation (top-k) — https://arxiv.org/abs/1805.04833
- word2vec — https://arxiv.org/abs/1301.3781, https://arxiv.org/abs/1310.4546
- Sentence-BERT — https://arxiv.org/abs/1908.10084
- MTEB — https://arxiv.org/abs/2210.07316
- HNSW — https://arxiv.org/abs/1603.09320
- FAISS — https://arxiv.org/abs/1702.08734
- Matryoshka — https://arxiv.org/abs/2205.13147
- Passage Re-ranking with BERT — https://arxiv.org/abs/1901.04085
- GPTQ — https://arxiv.org/abs/2210.17323
- AWQ — https://arxiv.org/abs/2306.00978
- QLoRA (NF4) — https://arxiv.org/abs/2305.14314

**Official documentation**
- OpenAI — Models: https://developers.openai.com/api/docs/models
- OpenAI — Counting tokens: https://developers.openai.com/api/docs/guides/token-counting.md
- OpenAI — Prompt caching: https://developers.openai.com/api/docs/guides/prompt-caching.md
- OpenAI — Embeddings: https://developers.openai.com/api/docs/guides/embeddings.md
- OpenAI — Text generation: https://developers.openai.com/api/docs/guides/text.md
- OpenAI — GPT-6 Astra model page: https://developers.openai.com/api/docs/models/gpt-6-astra.md
- OpenAI — GPT-5.1 model page: https://developers.openai.com/api/docs/models/gpt-5.1.md
- OpenAI — tiktoken README / model.py (raw): https://raw.githubusercontent.com/openai/tiktoken/main/README.md
- Anthropic — Models overview: https://platform.claude.com/docs/en/models/overview
- Anthropic — Context windows: https://platform.claude.com/docs/en/build-with-claude/context-windows
- Anthropic — Prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- Anthropic — Token counting: https://platform.claude.com/docs/en/build-with-claude/token-counting
- Anthropic — Embeddings: https://platform.claude.com/docs/en/build-with-claude/embeddings
- Google — Gemini models: https://ai.google.dev/gemini-api/docs/models
- Google — Gemini 3.8 Flash: https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash
- Google — Counting tokens: https://ai.google.dev/gemini-api/docs/tokens
- Open Source Initiative — OSAID: https://opensource.org/ai/open-source-ai-definition
- Chroma — Context Rot: https://www.trychroma.com/research/context-rot
- USENIX — Orca (OSDI '22): https://www.usenix.org/conference/osdi22/presentation/yu

**A practical tip discovered during research:** appending **`.md`** to OpenAI documentation URLs (`developers.openai.com/api/docs/.../page.md`) returns clean, dense markdown instead of navigation-heavy HTML. Extremely useful for both reading and for feeding docs to an LLM.

---

# 13. VERIFICATION METHOD NOTES (FOR WHOEVER FACT-CHECKS THIS)

These techniques made the verification possible and are reusable for keeping the curriculum current.

**Getting past hostile sources:**
- **Vendor docs often serve clean Markdown.** Append `.md` to OpenAI docs URLs. This is the single highest-value trick found.
- **GitHub HTML truncates long READMEs.** Fetch `raw.githubusercontent.com/<owner>/<repo>/<branch>/README.md` and `.../LICENSE` instead. This is how the Ollama MIT licence and the tiktoken model mapping were verified.
- **The OpenAI help centre returns HTTP 403** to automated fetches. Documentation that only exists there cannot be verified this way.
- **IEEE/ACM/Elsevier block automated fetches (403/Cloudflare).** For bibliographic metadata, use the **Crossref API** (`api.crossref.org/works/<DOI>`) and the **Semantic Scholar API** (`api.semanticscholar.org/graph/v1/paper/DOI:<DOI>`). This is how the PQ TPAMI DOI was confirmed.
- **JS-rendered pages return only chrome.** The MTEB leaderboard and Cohere's docs could not be read this way.
- **Platform docs have moved and redirect cross-origin.** `platform.openai.com/docs` → `developers.openai.com`; `docs.anthropic.com` / `docs.claude.com` → `platform.claude.com`. Some fetchers do not follow cross-origin redirects, so use the destination URL directly.
- **Model `config.json` files are excellent primary sources** for architectural facts (layer counts, head counts, `rope_theta`, expert counts). They are authoritative, machine-readable, and immune to blog paraphrasing. Many of the strongest findings here came from raw configs.

**Two independent claims were falsified by this process — both were "common knowledge":**
1. The **Matryoshka NeurIPS award** (checked against the official awards page, which lists all 15 papers).
2. The **GGUF backronym** (checked against the official spec and package README).

**The general lesson for the curriculum:** *a claim being repeated widely is not evidence.* Both false claims above appear in otherwise-reliable sources. **Every number in a curriculum should trace to a primary source, or carry a visible marker saying it doesn't.**

**A known limitation of this document:** web search was unavailable during compilation, so verification relied on fetching primary sources directly from URLs already known or guessable. **This creates a selection bias** — sources that are hard to fetch (OSAID's body text, IEEE papers, JS-rendered leaderboards) remained unverified even where a search would have found a fetchable mirror. A fact-checker with search access should re-examine the §11 list.

---

*End of reference document. All model names, prices, context sizes, and version numbers are dated to the compilation date and marked [VERIFY]; re-check them against live vendor documentation before publishing.*
