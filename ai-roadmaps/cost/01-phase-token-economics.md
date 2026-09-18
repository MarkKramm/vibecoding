---
id: cost-01-token-economics
track: cost
phase: 1
order: 10
title: Token Economics
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/cost/01-token-economics.md
exit_criteria: >
  You can predict, before sending a request, which parts of it will dominate the
  bill and roughly by how much; you can name every billing dimension beyond the
  input and output token counts; you can explain why your own language costs more
  per sentence than English and what that does to cost and latency; and you can
  state what one successful task costs you rather than what one call costs.
---

# Phase 1 — Token Economics

## Goal of this phase

Learn why a model's bill is not a price per question, and build the intuition that lets you predict a bill you have never seen.

Everyone arrives at this track with the same mental model: "using the AI costs some amount of money." That model is not wrong, but it is useless, because it cannot tell you *which* of two prompts will cost more, *which* change to your application will halve the bill, or *why* the same question costs more in Cebuano than in English.

By the end of this week you will be able to look at a request — the system prompt, the history, the documents, the instructions, the requested output — and say which parts will dominate the cost and roughly by how much. You will know the full list of billing dimensions that exist behind the headline "input and output tokens", so that no line on an invoice is a surprise. You will know how to look up current numbers instead of memorising numbers that expire. And you will have replaced the question "what does one call cost?" with the only question that survives contact with reality: **what does one successful task cost?**

One thing about your situation specifically. You currently have free API access through a beta that is ending. That is not a reason to postpone this phase — it is the reason to do it now. Everything here is practice you run while the meter is still at zero, so that on the day it starts running you already know where your money goes. The reader who learns this *after* the free access ends learns it by paying tuition.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

| Day | Focus | Time |
|---|---|---|
| Mon | Read Parts 1–2 (the two meters, and why output dominates) | 1–2h |
| Tue | Hands-on: the three-variant output-cost experiment (tasks 1–3) | 1–2h |
| Wed | Read Parts 3–4 (the bills you did not know about; your language) | 1–2h |
| Thu | Hands-on: the bilingual count (task 5) and the cache experiment (task 7) | 1–2h |
| Fri | Read Part 5, build the cost-per-success ledger, finish the deliverable | 1–2h |

The reading is short. The counting is where the understanding lands — this phase is about numbers you produce yourself, not numbers you read.

## Skills you'll gain

- Explain why input and output tokens are metered and priced separately, from the mechanism rather than from a price list
- Predict, before running it, whether a given request will be input-dominated or output-dominated
- Explain why "think step by step" is a purchase, not a free improvement, and when that purchase is a bad one
- Name every billing dimension beyond the headline token counts: cached input, batch, reasoning tokens, images, audio, tool use, cache writes, storage, hosted fine-tunes
- Explain the cache write/read asymmetry and predict when caching saves money and when it costs money
- Estimate token counts honestly, as a range with a stated reason, and know the limits of the four-characters-per-token rule
- Explain the Petrov et al. language-tokenization finding and what it costs a Filipino speaker specifically
- Compute a cost-per-successful-task figure and use it to choose between a cheap model and an expensive one
- Find current pricing from the authoritative page and state how long an answer stays true

## Specific topics to learn

### The two meters

- Input tokens and output tokens as separately metered, separately priced quantities
- The attention mechanism as the reason input is cheap and output is expensive
- Prefill and decode as two different kinds of work
- Why the output multiplier exists and what it is a multiple *of*
- Output-dominated versus input-dominated requests, and how to tell before you send

### The other meters

- Cached input: prefix caching, cache writes versus cache reads, TTL, and the break-even
- Batch processing: the discount and the latency you pay for it
- Reasoning and thinking tokens, and how they are commonly billed
- Multimodal input: images by resolution and detail setting, audio by duration
- Tool use: schemas in context, results back in context, and server-side tool charges
- Storage, file retention, and fine-tuned model hosting by uptime

### Measurement

- The four-characters-per-token rule: where it comes from and how badly it fails
- Tokenizer differences across models and providers
- Provider-side counting endpoints and offline tokenizers
- Reading a `usage` object and knowing which fields to trust

### Language equity

- The Petrov et al. finding: up to 15x difference in tokenized length across languages
- Why it survives multilingual tokenizers
- The three costs of the same sentence in your language
- What a Filipino builder can and cannot do about it

### The metric that matters

- Cost per call versus cost per successful task
- Retries, failures, and the hidden multiplier
- Why a cheap model can be the expensive choice

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Provider pricing pages | The only authoritative source for prices today | Free to read | https://developers.openai.com/api/docs/pricing | Build your own mechanism checklist and check whether each line item on it exists | The equivalent pricing page of whichever free-tier provider you already use |
| Token counting endpoint | Get an exact input token count before you send, including tools and images | Freemium | https://developers.openai.com/api/docs/guides/token-counting | Count a conversation, then the same conversation with a tool schema attached | Any free-tier provider counting endpoint, or an offline tokenizer run locally |
| tiktoken | Count tokens offline, per model family, with no network call | Free, open source | https://github.com/openai/tiktoken | Script the English-versus-your-language count for task 5 | Hugging Face `tokenizers`, or a browser tokenizer playground |
| Hugging Face tokenizer summary | See the different tokenization algorithms and where they came from | Free | https://huggingface.co/docs/transformers/tokenizer_summary | Read the BPE and SentencePiece sections and note which families use which | Any open tokenizer config file on the Hugging Face Hub |
| Google AI Studio | A free API key that reports real token usage on real requests | Free tier | https://aistudio.google.com/ | Run the three output variants and record actual usage numbers | Any provider's free tier that returns a `usage` object |
| Ollama | Run a local model so you can experiment with zero metering | Free, open source | https://ollama.com/ | Measure how output length changes wall-clock time, with no bill attached | llama.cpp built from source, which also ships a tokenizer you can call directly |
| LibreOffice Calc | Build the cost-per-success ledger and the break-even calculator | Free, open source | https://www.libreoffice.org/ | Build the ledger from task 10 and the cache break-even from task 8 | Google Sheets in any browser |

## Free/cheap resources

- **Petrov et al. — Language Model Tokenizers Introduce Unfairness Between Languages (NeurIPS 2023)** — https://arxiv.org/abs/2305.15425
- **Tokenization fairness project page (with the per-language results)** — https://aleksandarpetrov.github.io/tokenization-fairness/
- **OpenAI — Counting tokens (the input token count endpoint)** — https://developers.openai.com/api/docs/guides/token-counting
- **OpenAI — Prompt caching (cache writes, reads, TTL, and the break-even arithmetic)** — https://developers.openai.com/api/docs/guides/prompt-caching
- **OpenAI — Batch API (the discount and the turnaround window)** — https://developers.openai.com/api/docs/guides/batch
- **Anthropic — Prompt caching (the 1.25x / 2x write and 0.1x read multipliers, spelled out)** — https://docs.claude.com/en/docs/build-with-claude/prompt-caching
- **Anthropic — Pricing (a page that exposes the multipliers as a table)** — https://platform.claude.com/docs/en/about-claude/pricing
- **Anthropic — Batch processing** — https://docs.claude.com/en/docs/build-with-claude/batch-processing
- **Anthropic — Token counting** — https://docs.claude.com/en/docs/build-with-claude/token-counting
- **Google — Gemini API pricing (shows how per-modality pricing is presented)** — https://ai.google.dev/gemini-api/docs/pricing
- **Google — Gemini API token counting** — https://ai.google.dev/gemini-api/docs/tokens
- **Hugging Face — Summary of the tokenizers** — https://huggingface.co/docs/transformers/tokenizer_summary
- **tiktoken (offline tokenizer, open source)** — https://github.com/openai/tiktoken
- **OpenRouter — model list with per-model prices in one place** — https://openrouter.ai/models
- **Model Context Protocol — tools, and why tool schemas live in your context** — https://modelcontextprotocol.io/

## Lesson: The Two Meters, and the Bills You Did Not Know About

### Part 1 — Two meters, two prices, one asymmetry

Start with the problem, because the problem is not "prices are confusing".

The problem is that **a model does not bill you for a question. It bills you for two kinds of work, at two rates, and most people only ever think about one of them.**

When you send a request, the provider measures two quantities:

- **Input tokens** — everything the model reads: your instructions, the conversation so far, every document you attached, every tool schema, every image, plus the structural tokens the software adds so the model knows who said what.
- **Output tokens** — everything the model writes: the answer, any reasoning it produced along the way, any tool-call arguments it generated, and formatting tokens that never appear in the text you see.

These are metered and priced separately, and **output is typically several times more expensive per token than input.** As of early 2026 that multiple commonly sits around three to five times for a given model, and it can be much larger. Do not carry a number out of this lesson — carrying a number is exactly the mistake this phase exists to break. Carry the *shape*: output costs more per token, for a mechanical reason you can derive.

#### Why the asymmetry exists

**Reading is parallel. Writing is not.**

When the model receives your input, it processes all of it at once. Every token's key and value vectors get computed in a single pass, and the whole input is available to every position immediately. This stage is **prefill**, and it is the kind of work a GPU is built for: one large, dense, parallel matrix operation. Prefill is why long prompts are cheap per token — the tokens are processed together, not one after another.

Then generation begins. The model produces **one token at a time**, and each new token must be computed before the next can start, because the next one depends on it. This stage is **decode**, and it is the opposite of what a GPU is good at: a long chain of small, strictly sequential steps, each using a tiny fraction of the hardware's capacity and then waiting. The arithmetic is not free either — every new token attends over everything before it, so generating token 5,000 costs more than generating token 50.

That asymmetry is the entire reason output costs more. It is not a pricing decision layered on top of the technology; it reflects real computation. Two consequences you can use immediately:

1. **Generating 500 tokens takes many multiples longer than reading 500 tokens.** You will notice this as fast time-to-first-token and total latency proportional to output length.
2. **The ratio is not a law.** Providers set output prices where they choose. The mechanism is durable; the number is not.

> **Retire the analogy before it misleads you.** People describe this as "output costs more because it is more valuable." That framing is wrong in a way that matters: it suggests the price reflects what the text is worth to *you*. It does not. The price reflects GPU-seconds, and a token of useless rambling costs exactly as much as a token of brilliant insight. Once you internalise that, you stop expecting good output to be subsidised and start treating output *length* as the thing you control.

#### The inversion

Now put the two meters together, because their combination produces a result most people find backwards.

Suppose output costs four times what input costs per token. You write a careful, detailed, 900-token prompt explaining exactly what you want, and the model answers in 300 tokens.

```text
Input:   900 tokens at 1x   =  900 units
Output:  300 tokens at 4x   = 1200 units
                                ----
Total:                          2100 units

Output is 25% of the tokens, but 57% of the bill.
```

Now suppose you write a lazy 150-token prompt. The model does not know what you want, so it produces a 1,200-token answer that covers several possibilities.

```text
Input:   150 tokens at 1x   =   150 units
Output: 1200 tokens at 4x   =  4800 units
                                ----
Total:                          4950 units

The lazy prompt cost 2.4x the careful one.
```

Read those two blocks again, because they invert the instinct almost everyone has.

**Verbose input is relatively cheap. Verbose output is expensive.** The prompt you agonise over — the detailed instructions, the examples, the context — costs little relative to what it prevents. The answer you did not ask to be long costs a great deal. And the two are causally connected: underspecified prompts produce long, hedging, exploratory answers, because the model is trying to cover the space you left open.

So the first predictive rule of this phase:

> **For any request, ask which meter dominates. Instructions, context, and history push cost toward the input meter, where tokens are cheap. Anything that makes the model generate more — vagueness, requests for explanation, chains of reasoning, long formats, high verbosity settings — pushes cost toward the output meter, where tokens are expensive.**

#### "Think step by step" is a purchase

Techniques that ask a model to reason before answering are real and they work. Chain-of-thought prompting (Wei et al., arXiv:2201.11903) showed that eliciting intermediate reasoning steps improves performance on tasks requiring multi-step arithmetic, logic, and symbolic manipulation. Later work — zero-shot CoT (Kojima et al., arXiv:2205.11916), least-to-most prompting (Zhou et al., arXiv:2205.10625), self-consistency (Wang et al., arXiv:2203.11171), tree of thoughts (Yao et al., arXiv:2305.10601), plan-and-solve (Wang et al., arXiv:2305.04091) — extended the idea.

None of it is free here. **Every reasoning token is an output token.** Your prompt "let's think step by step" is a few input tokens — negligible. What it *causes* is the purchase: hundreds or thousands of output tokens of intermediate work, billed at the output rate. On a reasoning model that work frequently happens whether you ask or not, because thinking tokens are generated tokens; a higher reasoning-effort setting literally means "spend more output tokens before answering."

That does not make chain-of-thought a bad deal. It makes it a **transaction**, and transactions should be evaluated:

| The reasoning is... | Verdict |
|---|---|
| Necessary to get a correct answer at all | Buy it. A wrong answer you pay for is the expensive option. |
| Improving accuracy on a task you will run once | Buy it. The alternative is being wrong. |
| Improving accuracy on a task you will run 50,000 times | Buy it *if* the accuracy gain outweighs the token cost — and measure which it is. |
| Performed on a question the model already answers correctly | Do not buy it. You paid for theatre. |
| Included in the output when you only wanted the result | Do not buy it. Ask for the answer only, or discard the reasoning before it reaches a downstream call. |

That last row quietly bankrupts small projects. If a model produces 800 tokens of reasoning and a 20-token answer, and you feed the whole response into the *next* call of a chain, you have converted output tokens into input tokens for the next request — on every hop.

Two practices follow, and neither costs anything:

1. **Say what you do not want.** "Answer with only the JSON object, no explanation, no preamble." Vague politeness ("please explain your reasoning thoroughly") is an instruction to spend money.
2. **Keep reasoning out of your data path.** If you need it for debugging, log it; do not pass it down the pipeline.

#### Where the inversion stops working

**It stops working when a large input is re-sent repeatedly.** The inversion compares one request. Compare a *conversation* instead. The model is stateless: every turn re-sends the entire history as input. A 100,000-token document attached to a chat is charged as input on turn 1, again on turn 2, again on turn 3 — the same 100,000 tokens every time, until you remove it. A "cheap" input meter becomes the largest line on the invoice, because it is paid repeatedly for a document the model has already read. Output is expensive per token; input is expensive *per repetition*.

**It also stops working when the input meter has surcharges of its own.** Everything so far treats "input token" as one thing at one price. It is not.

---

### Part 2 — The output meter is the meter you control

If Part 1 established *that* output dominates, this part is about the lever, because the lever is the only thing that changes a bill.

**Output length is the most controllable quantity in the entire system, and almost nobody controls it.**

Input length is set by your application: the system prompt, the retrieved documents, the tool schemas. It is large but mostly fixed — you decide it once and it is the same on every call. Output length is decided *at generation time*, by a negotiation between the prompt's specificity and the model's defaults. That negotiation is winnable. Three mechanisms, in order of how much they matter:
**1. Specificity constrains the answer space.** A vague question has many acceptable answers; the model must produce something covering them. A specific question has one. Length follows. This is why the careful 900-token prompt in Part 1 was economically correct even though it looked extravagant: it bought a short answer.

**2. Explicit output constraints cap it.** "In one sentence." "As a JSON object with these three keys and nothing else." "No preamble." These work because generation is conditioned on the prompt, and these are part of the prompt. A constraint like this is a handful of input tokens purchasing a large reduction in output tokens.

**3. Output-token limits are a hard ceiling.** Every API lets you cap maximum output. The cap applies to *all* generated tokens including reasoning and formatting tokens that never appear in the visible text, and hitting it is not free — you are billed for everything generated before the cut, and you will likely run the request again. The cap is a safety device against runaway generation, not a cost optimisation.

**A worked prediction.** Here is the kind of estimate you should be able to produce in under a minute, on paper, before touching an API.

```text
Task: classify 2,000 short customer messages into 6 categories.

Design A - "chat" style:
  System prompt asking for helpful classification ..............  ~200 input tokens
  Message ........................................................  ~40 input tokens
  Model replies conversationally, explains its reasoning,
  restates the message, gives the category .....................  ~250 output tokens

  Per call:  240 input  +  250 output
  Output share of tokens: 51%
  Output share of cost (at 4x): 250*4 / (240 + 250*4) = 81%

Design B - constrained:
  Same system prompt + explicit "reply with the category word only" ~210 input tokens
  Message ........................................................  ~40 input tokens
  Model replies with one of six words ..........................    ~3 output tokens

  Per call:  250 input  +  3 output
  Output share of cost (at 4x): 12 / (250 + 12) = 5%

Ratio of total cost, A to B:  (240 + 1000) / (250 + 12)  ~=  4.7x
```

Same task. Same model. Same prices. **A factor of nearly five, bought entirely by constraining the output.**

> **The trap that follows from this.** Once you see that constraining output saves money, the temptation is to constrain everything and ask for one-word answers to every question. Do not. Part 5 explains why a cheap answer that is wrong is the most expensive thing you can buy.

**Predicting without measuring.** Before you run any experiment, answer this: *is this request input-dominated or output-dominated?* The heuristic:

- Long document, short answer → **input-dominated**. Optimise the document, not the answer.
- Short question, long answer → **output-dominated**. Optimise the answer, radically.
- Long conversation, short reply → **input-dominated, and growing**. Optimise history handling.
- Agent loop with tools → **both, and both are growing**, because every tool result is new input and every tool call is output.

"Generating text for a user to read" is only one of these four shapes, and it is the one people generalise from.
---

### Part 3 — The bills you did not know about

So far this lesson has treated the invoice as two numbers. Real invoices have more lines, and the lines are where budgets actually die — usually because nobody knew the line existed until it appeared.

I am going to give you mechanisms and tell you where to look up numbers, and I am deliberately quoting **no prices at all**. Prices in this field change on a scale of weeks, and a stale number is worse than no number because it is confidently wrong. The skill this part teaches is not "know the prices" — it is **know the questions to ask the pricing page.** Read the page and you will answer all of them in ten minutes.

#### 1. Cached input

**Mechanism.** Models are stateless, so you resend the same prefix — system prompt, tool definitions, background documents, conversation history — on every request. Providers can detect a recently processed prefix and reuse the internal state instead of recomputing it. Reusing is far cheaper, because recomputing is exactly the expensive prefill work from Part 1.

**The important asymmetry.** There are usually *two* cache prices, not one:

- A **cache read** (a hit) is typically a large discount — on the order of a tenth of the normal input rate on the pages I checked, as of early 2026.
- A **cache write** is often a *surcharge* — you pay more than the normal input rate to store the prefix, because writing it is extra work.

Read that again, because it is the opposite of most people's assumption: **you pay a premium to write, and a discount to read.**

**What that lets you predict.** Caching pays off only if the prefix is read back enough times to repay the write premium. Write once and read once, and you can easily lose money. The break-even is arithmetic you can do from the two multipliers and the reuse count — Anthropic's prompt caching documentation states its multipliers plainly (5-minute writes at 1.25x, 1-hour writes at 2x, reads at 0.1x, as of early 2026), and OpenAI's documents the same shape (writes at 1.25x, reads at 0.1x). Read both *as arithmetic examples*, not as price lists.

**And those examples are already drifting, which is the point.** Re-checked in 2026-09, Anthropic's pricing page still carries `1.25x` / `2x` / `0.1x` — but now with an explicit carve-out: reads are **`0.025x`** on two of its newest models, a quarter of the usual read multiplier. The lesson is not the new number; it is that **a per-provider multiplier has quietly become a per-model one**, so a figure you copied from a blog post last year can be wrong for the specific model you deploy. Two consequences worth carrying: the break-even arithmetic changes with it (a `0.025x` read repays a `1.25x` write far sooner), and **you cannot assume two models from the same provider share caching economics**.

**Where it stops working.** A cache hit requires the prefix to match **exactly**, from the very beginning. One changed character near the start — a timestamp, a reshuffled tool list, a reordered JSON schema — invalidates everything after it. Applications that put a dynamic value at the top of their prompt get a 0% hit rate and never understand why. There is also a minimum prefix length below which nothing is cached, and a time-to-live after which the entry expires (minutes, not days, on the pages I checked). So the predictor is:

> **Caching rewards a long, stable, frequently re-read prefix. It punishes dynamic content at the front, short prefixes, and one-off calls.**

Clearly correct: a tool-using agent with a large fixed instruction block, called hundreds of times a day. Clearly wrong: a one-shot request that will never be repeated.

#### 2. Batch

**Mechanism.** If your work does not need an answer right now, providers will run it in a queue on off-peak capacity and charge you less. OpenAI's Batch API documentation describes a 50% discount with a 24-hour completion window, as of early 2026; Anthropic's batch documentation describes a comparable discount with its own turnaround window. The discount exists because you are selling the provider your latency.

**What that lets you predict.** Anything naturally asynchronous — overnight classification of a dataset, bulk embeddings, evaluation runs, index building — should be batched. For a large one-off job, batch often saves more than every prompt trick in this lesson combined, because it applies to the whole bill rather than to one term of it.

**Where it stops working.** It stops working the moment a human is waiting. Discounts *stack* rather than replace each other — Anthropic's caching documentation notes that its cache multipliers combine with the Batch API discount — but whether any two discounts combine is a per-provider question. And a failed batch job is one you discover later, so batch suits work you have finished iterating on.

#### 3. Reasoning and thinking tokens

**Mechanism.** On reasoning models, the model generates internal deliberation before its answer. Those tokens are generated, so they are metered as **output** tokens on the providers I checked — billed at the expensive rate, not the cheap one.

**What that lets you predict.** A reasoning model can produce a short visible answer at high cost, because you never saw the tokens you paid for. Budget by eyeballing response length and you will under-estimate, sometimes by a large factor. The `usage` object is ground truth here and usually itemises reasoning separately; read it, do not estimate it.

**Where it stops working.** The temptation is to conclude "reasoning models are a rip-off." Wrong lesson. Reasoning is a purchase, and Part 1's transaction test applies. It also interacts with latency — more thinking tokens means more sequential decode steps, so the wait grows too. The controlling setting is often exposed (`reasoning_effort` and equivalents), and a high setting is an explicit instruction to spend output tokens: a knob to test, not to leave at its default.

#### 4. Images and audio

**Mechanism.** Neither is priced per file. Images are converted into a number of tokens determined by **resolution and a detail setting**; audio is priced by **duration**. OpenAI's token-counting documentation states that images consume tokens based on size and detail level, that its counting endpoint accepts images, and that local character-based estimates are inaccurate for them.

**What that lets you predict.** Cost scales with pixel dimensions, not with how important the image is or how well you compressed the file. A full-page scan and a small crop of the same document may differ by a large factor. A **low detail setting** exists on several providers precisely because it maps the image to a much smaller, fixed token budget — the biggest image-cost lever most people never touch.

**Where it stops working.** Downscaling has consequences: at some point the text in the image is no longer legible, and you have saved money by making the task impossible. Shrink and detail-reduce until accuracy on your own examples starts to fall, then back off one step — and use a token-counting endpoint rather than a guess, because images are where guessing fails.

#### 5. Tool use

**Mechanism.** Tool use touches the bill twice, and both are easy to miss:

- Every tool's name, description, and parameter schema sits in the **context** on every call, whether or not the tool is used. A dozen tools can be a substantial fixed input cost per request, forever.
- Every tool **result** returns to the context as new input, and in an agent loop the results accumulate turn after turn.

Providers may also run some tools **server-side** — web search, code execution, file handling — and charge for them separately from tokens.

**What that lets you predict.** An agent's cost is not "one model call". It is the sum over all loop iterations of a context that keeps growing, plus any per-invocation tool fees. An agent taking eight steps can cost many times what the same question costs in a single call, and growth is superlinear because each step re-sends everything before it.

**Where it stops working.** Cutting tools has a hard floor: a tool the model needs but cannot see is not a saving, it is a failed task. The right move is not fewer tools but *deferred* tool loading and stable tool definitions. Several providers document loading tool definitions only when needed, and OpenAI's caching documentation notes that keeping tool definitions, ordering, and schemas stable is what makes the prefix cacheable in the first place. Change your tool list between requests and you broke caching too.

#### 6. Storage, files, and hosted fine-tunes

**Mechanism.** Two lines that have nothing to do with tokens:

- **Storage.** Uploaded files that persist for retrieval, retained batch output files, and vector-store storage are often metered by size and time. Small individually, they quietly accumulate.
- **Hosted fine-tuned models.** A fine-tuned model you deploy is frequently billed **per hour of uptime**, not per token. It is a rented server, not a metered API.

**What that lets you predict.** A hosted fine-tune receiving no traffic still costs money, roughly *(hourly rate) x (hours in the month)* regardless of usage. That changes when fine-tuning is rational: it suits a steady, high volume of a narrow task, and fits poorly a project running a few hundred requests a day. The economics here differ from everything else in this lesson — worth reading the fine-tuning pricing page specifically to see the uptime line.

**Where it stops working.** If your usage is bursty or low, the break-even against a general model given good instructions and good examples may never arrive. Prompting costs nothing to try; hosting a model costs money every hour.

#### The checklist that replaces memorising prices

Here is the durable artifact from this part. Before you commit to any provider, answer these by reading their pricing and caching pages, and write the answers down with the date.

```text
[ ] What is the input price per token, and the output price?
[ ] What is the output-to-input multiple? (this tells you which meter to optimise)
[ ] Is there prompt caching? What is the cache WRITE price and the cache READ price?
[ ] What is the minimum cacheable prefix length, and the cache time-to-live?
[ ] Is there a batch/async discount, and what is the turnaround window?
[ ] Are reasoning tokens billed as output, and are they itemised in `usage`?
[ ] How are images priced - by resolution, by tiles, or by a detail setting?
[ ] How is audio priced - per second, per minute, or per token?
[ ] Are server-side tools (search, code execution) charged separately?
[ ] Is there storage or file-retention billing?
[ ] For fine-tuned models: per token, or per hour of hosting?
[ ] Are there free-tier limits, and what happens when they are hit?
[ ] DATE THIS CHECKLIST. Prices change. Re-check before you rely on it.
```

That checklist, re-run every few months, is worth more than any table of numbers anyone could put in a lesson.

---

### Part 4 — Your language costs more than English, and here is the exact mechanism

Everything so far has assumed that a token is a token. For you, reading this in the Philippines, that assumption is false in a way that is personal, structural, and not your fault.

**The finding.** In *Language Model Tokenizers Introduce Unfairness Between Languages* (Petrov, La Malfa, Torr, and Bibi; arXiv:2305.15425; published at NeurIPS 2023), the authors measured how the same content tokenizes across languages. Their result: the same text translated into different languages can differ in tokenized length by **up to 15 times** in some cases. Crucially, they also found that **these disparities persist even for tokenizers that are intentionally trained for multilingual support**. Character-level and byte-level models showed over 4 times the difference for some language pairs.

The paper names three consequences directly, and they are exactly the three things this phase has been about: **the cost of accessing commercial language services, the processing time and latency, and the amount of content that can be provided as context.**

**The mechanism, which you already have.** A tokenizer's vocabulary is built by frequency-driven merging over a training corpus. If a language was well represented there, common words and affixes became single tokens. If it was barely represented, the tokenizer has few useful merges for it and its text falls back toward smaller units — sometimes individual bytes, where one character can cost several tokens.

This is why the disparity persists in "multilingual" tokenizers. Being trained with multilingual support is not the same as being trained with *balanced* multilingual support. A fixed vocabulary size allocated mostly to high-resource languages leaves less room for the rest, and the merges that never got learned are the ones your language needed.

Notice also that this is not a knowledge problem. The model may understand Tagalog perfectly well. Tokenization happens *before* the model is invoked at all — the paper's own framing is that the disparity arises "well before a model is even invoked." You are charged a different price for the same meaning by a component that does not know what meaning is.

**What this predicts for you, concretely.** Take one sentence. Write it in English. Write the same sentence in Tagalog, or Cebuano, or Ilocano. All three are the same content. Then predict, before measuring:

| Effect | Why |
|---|---|
| **It costs more per request** | More tokens, same per-token price. The multiplier is the token ratio. |
| **It is slower** | More input tokens means more prefill work before the first output token; more output tokens means more sequential decode steps. |
| **It consumes more of your context window** | A window measured in tokens holds less of your language than of English. The same document may fit in English and overflow in Cebuano. |
| **It is not fixed by "using a better model"** | The tokenizer is a separate artifact. A stronger model with the same tokenizer has the same disparity. |

That third row is the one people miss, and it is the most expensive. If you build retrieval, summarisation, or anything that stuffs documents into a context window, your effective capacity is smaller in your own language than the specification suggests.

**A word about code-switching.** Everyday Filipino speech mixes languages mid-sentence — English technical terms inside a Tagalog frame, or vice versa. That mix often tokenizes *better* than pure Tagalog, because the English fragments land on merges that exist. Measure it on your own text, and name what it means: the cheapest way to write your own language is sometimes to write it less like it.

**What you can and cannot do about it.** You cannot retrain a provider's tokenizer. What you can do:

1. **Measure your own ratio once, and carry it.** One sentence, two languages, one tokenizer. That number is the multiplier you apply to every English-based estimate for the rest of this track.
2. **Prefer tokenizers that treat your language better when the choice exists.** The fairness project's page has per-language comparisons. Tokenizers change, so re-check rather than assume.
3. **Compress where compression is free.** Redundant boilerplate costs you more than it costs an English speaker.
4. **Budget the window in your language, not in English.** Reserve context using your measured ratio, not the four-characters rule.

And do not conclude that Filipino is a bad language for AI work. It is well-supported by world standards. The 15x figure is the extreme end across many language pairs, not a figure for Tagalog specifically — measure your own rather than assume the worst.

---

### Part 5 — Cost per successful task is the only number that matters

Parts 1 through 4 were about making one call cheaper. This part is about the fact that making one call cheaper is often how you make the whole job more expensive.

**Here is the trap.** You compare two models. Model A is the cheap one. Model B costs several times more per token. You run a few prompts, both look fine, you ship Model A. Then the bill arrives larger than the Model B estimate — because Model A failed on a meaningful fraction of inputs, your retry logic ran the request again, and the failures were not uniform: the hard inputs, the long ones, the ones that mattered, failed and retried.

The correction is a change of unit:

```text
Cost per call        =  (input tokens * input price) + (output tokens * output price)

Cost per SUCCESS     =  total spend on the task
                        ------------------------------
                        number of outputs that were actually usable

which expands to:

                     =  (cost per attempt) * (attempts per success)
```

And `attempts per success` is where the cheap model loses. It is the reciprocal of your success rate, and it grows **non-linearly** as success rate falls:

| Success rate per attempt | Attempts per success | Effective cost multiplier |
|---|---|---|
| 95% | ~1.05 | 1.05x |
| 90% | ~1.11 | 1.11x |
| 70% | ~1.43 | 1.43x |
| 50% | 2.0 | 2.0x |
| 25% | 4.0 | 4.0x |
| 10% | 10.0 | 10.0x |

(Assuming independent retries, which is generous — models tend to fail on the *same* hard inputs repeatedly, so real retry counts are worse.)

Read the bottom half. **A model four times cheaper per token that succeeds a quarter of the time is exactly break-even, before you count your own time, the latency, or the damage from outputs that failed *silently*.** Silent failure — an output that looks plausible, passes your checks, and is wrong — costs the most of all, because it is never retried. It just poisons whatever consumes it.

This is why Part 1's advice to constrain output aggressively carries a warning. "Answer with one word" cut that bill by a factor of five. But if the constrained format makes the model drop the genuinely ambiguous cases, your cost per call fell and your cost per success rose. **You cannot evaluate a cost optimisation without measuring quality at the same time.** That is not a moral point; it is arithmetic.

#### The ledger

The deliverable for this phase is a ledger with five columns per task configuration — deliberately simple, because a complicated model you do not fill in is worse than a simple one you do.
```text
| Configuration | Cost per attempt | Attempts per success | Cost per success | Notes |
|---|---|---|---|---|
| Model A, terse prompt     | ... | ... | ... | baseline |
| Model A, careful prompt   | ... | ... | ... | output length down, success up? |
| Model B, careful prompt   | ... | ... | ... | is the premium repaid? |
| Model B + batch           | ... | ... | ... | async only |
| Model B + caching         | ... | ... | ... | only if prefix is reused |
```

Fill the first column from real `usage` numbers. Fill the second by running the task 20–30 times and counting usable outputs against a definition of "usable" you wrote down *before* you started — a definition invented after seeing the results is not a measurement. The third column is column one times column two.

**What the ledger lets you predict.** Once you have it for one task, you can predict the bill at a different volume by multiplying, and judge whether a proposed change is worth making before you make it. That is the point of the phase: not to know prices, but to answer "what will this cost, and is that cheaper?" without running it.

#### Where "cost per success" itself stops working

Three limits, and they are real.

**It needs a definition of success, and some tasks do not have one.** Classification accuracy is measurable. "Was this a good summary?" is measurable only through a proxy — a rubric, a judge model, a human — and every proxy is itself fallible and costs money to run. Without a measurable criterion you are not doing cost engineering, you are guessing with extra steps.

**It flattens heterogeneous failures.** A 90% success rate built from "10% of outputs have a typo" is a different system from a 90% success rate built from "10% of outputs are confidently wrong." The metric cannot tell them apart; your judgement has to.

**It ignores latency and the cost of your own time.** A configuration costing a tenth as much per success but taking 40 seconds per attempt and needing manual review has not saved you anything.

> **The one number to remember from this phase.** Not a price, not a ratio, not a multiple. It is: **cost per completed task, measured, with the failure rate attached.** Everything else in this phase is machinery for moving that number.

## Hands-on practice tasks

1. Take one question that produces a paragraph-length answer. Send it to a model from your free beta key three times: as-is, with "answer in one sentence", and with "answer as JSON with keys `answer` and `confidence`, nothing else". Record input and output tokens for all three from the `usage` object. <!-- id: cost-01-token-economics-t01 band: quick energy: low -->
2. Compute the output-to-input price multiple for your current provider from its pricing page, then multiply each of the three runs from task 1 by it and rank them by *cost*, not by token count. Write down the rank order and how much it differs from the token-count order. <!-- id: cost-01-token-economics-t02 band: focused energy: normal -->
3. Take the same question and add "think step by step before answering". Record output tokens. Then compare against the terse JSON variant. State in one sentence what that instruction actually bought you, and whether it was worth the tokens on this specific question. <!-- id: cost-01-token-economics-t03 band: focused energy: normal -->
4. Send one question that you already know the model answers correctly, both with and without a chain-of-thought instruction. If the answer is the same, you have demonstrated buying nothing. Write down the token difference. <!-- id: cost-01-token-economics-t04 band: quick energy: low -->
5. **The bilingual count.** Take one sentence of ordinary, natural English — something you would actually say. Translate it into your own language (Tagalog, Cebuano, Ilocano, or whichever you speak) and write it down. Count the tokens in each using tiktoken, a browser tokenizer, or your provider's counting endpoint. Record both counts and the ratio. Then repeat with a second, longer passage of 100+ words. Then write one paragraph explaining, in your own words, what that ratio means for a prompt you send 1,000 times a month. <!-- id: cost-01-token-economics-t05 band: deep energy: high -->
6. Extend task 5 with a code-switched variant: the same content written the way you would actually write it in a group chat, mixing languages mid-sentence. Count it. Does the mix tokenize better or worse than the pure form? Propose a mechanism for what you observe. <!-- id: cost-01-token-economics-t06 band: focused energy: normal -->
7. Build a long, stable prefix — a few hundred words of fixed instructions, plus a tool schema if your provider supports one — and send it ten times in a row with a different one-line question each time. Record `cached_tokens` (or your provider's equivalent field) on each call and watch it appear after the first. <!-- id: cost-01-token-economics-t07 band: focused energy: normal -->
8. Take the prefix from task 7 and add a timestamp line at the very top: "Today is <date>." Repeat the ten calls. Did the cache still hit? Explain what happened using the prefix-matching mechanism. Then move the timestamp into the user message instead and try again. <!-- id: cost-01-token-economics-t08 band: deep energy: high -->
9. Using the cache write and cache read multipliers from your provider's caching page, build a spreadsheet that answers: at what number of reuses does caching this prefix become cheaper than not caching it? Then enter your actual measured prefix length and reuse count and see which side of the break-even you are on. <!-- id: cost-01-token-economics-t09 band: deep energy: high -->
10. Pick a real, repetitive task you actually do — classifying messages, tagging notes, extracting fields, summarising links. Run it 20 to 30 times on one model. Before you start, write down your definition of a "usable" output. Then count how many were usable, and compute cost per attempt and cost per success. <!-- id: cost-01-token-economics-t10 band: deep energy: high -->
11. Repeat task 10 with a second, cheaper model on the same inputs and the same written definition of usable. Put both rows in the ledger. State which you would ship and what evidence would change your mind. <!-- id: cost-01-token-economics-t11 band: deep energy: high -->
12. Read the pricing page of your current provider with the checklist from Part 3 open beside you, and fill in every line you can. Mark every line you could not find an answer to, and note where you would have to look next. Date the result. <!-- id: cost-01-token-economics-t12 band: focused energy: normal -->
13. Write a 200-word explanation of why output tokens cost more than input tokens, addressed to someone who has never heard the words prefill or decode. Do not use the word "parallel" without explaining what is parallel. <!-- id: cost-01-token-economics-t13 band: focused energy: normal -->
14. Estimate, before measuring, the token count of a 500-word English paragraph. Then measure it. Then do the same for a 500-word paragraph in your own language. Record both errors as percentages. <!-- id: cost-01-token-economics-t14 band: quick energy: low -->
15. Keep a running log for the rest of this track: for every task you run, note the model, the input and output token counts, and whether the output was usable. This becomes the evidence base for the rest of the Cost track. <!-- id: cost-01-token-economics-t15 band: ongoing energy: low -->

## Common Pitfalls

**Believing the bill follows the token count.** It follows a weighted token count where output tokens carry a larger weight. A request that is 70% input by tokens can be 80% output by cost. Always weight before comparing.

**Optimising the wrong meter.** People spend days trimming a system prompt — the input meter — and never once look at output length, which is where the money is and which is easier to control.

**Treating "think step by step" as free.** It is an instruction to generate hundreds or thousands of extra output tokens. Sometimes that is a good purchase. It is never a free one, and it is a waste on questions the model already answers correctly.

**Passing reasoning text downstream.** Reasoning you paid output rates for becomes input you pay for again on every subsequent hop of a chain. Log it if you need it; do not forward it.

**Assuming caching is a pure discount.** Writes are often surcharged. A prefix written once and read once can cost more than no caching at all. Do the break-even arithmetic for your reuse count before enabling it.

**Putting dynamic content at the front of a cached prefix.** A date, a username, a session ID, or a reordered tool list at the top of the prompt invalidates the cache for everything after it. Stable first, variable last.

**Confusing the four-characters rule with a measurement.** "One token is about four characters of English" is a rough rule of thumb for English prose, and nothing more. It fails badly for code, JSON, markup, technical vocabulary, and — most importantly for you — every language that is not English. It is a starting guess, never an answer.

**Estimating token counts for images, audio, or tool schemas by hand.** These are exactly the categories where character-based estimation is worst. Use a counting endpoint or read the `usage` object.

**Reading a price and treating it as a fact.** Prices change on the order of weeks. A number from a lesson, a blog post, or a model's own answer is a historical artifact. The pricing page, opened today, is the only source that is not stale.

**Comparing models on price per token.** Price per token is half of a fraction. The other half is how often the model succeeds. Comparing one without the other is not an analysis.

**Measuring success rate without writing down the definition first.** A criterion invented after seeing the results is how you talk yourself into the cheap model you already wanted to ship.

**Forgetting that a hosted fine-tune bills while idle.** Per-hour hosting is a different economic shape from per-token billing. A model with no traffic still has a meter running.

**Assuming your free beta will be replaced by something equally free.** It will not, in general. Use the free period to measure, so that when the meter starts you already know which of your habits are cheap and which are not.

**Treating your language's token penalty as a personal failing.** It is a property of the tokenizer, it was measured and published (arXiv:2305.15425), and it is documented to persist even in multilingual tokenizers. Account for it in your budgets; do not apologise for it.

## Deliverable / proof of work

Write `portfolio/cost/01-token-economics.md` containing:

- **The three-variant output experiment** from tasks 1–3: the same question answered three ways, with real input and output token counts pulled from `usage`, the weighted cost ranking, and one sentence on what the constraint bought
- **Your bilingual token table** from tasks 5 and 6 — one English sentence, the same sentence in your own language, and the code-switched version, each with a real count and a computed ratio. Plus your 100+ word passage, and the paragraph explaining what the ratio means at 1,000 requests a month
- **Your measured English-to-your-language multiplier**, stated as a range, with the tokenizer and model you measured it on named
- **Your cache experiment results** from tasks 7 and 8 — the `cached_tokens` values across ten calls, the effect of adding a timestamp at the front, and the break-even calculation from task 9 with your own numbers substituted in
- **Your completed pricing checklist** from task 12, every line answered or explicitly marked "not found", with the date you checked and the exact URL you read
- **The cost-per-success ledger** from tasks 10 and 11: two or more configurations, each with cost per attempt, attempts per success, cost per success, and the definition of "usable" you wrote *before* running the experiment
- **A written decision** — which configuration you would ship for that task, and what observation would change your mind
- **A section titled "My working numbers"** listing: your multiplier for output versus input cost, your English-to-your-language token ratio, your measured tokens-per-word for English, and the date each was measured — so that in six months you know exactly which of them to distrust

## Checklist

- [ ] I can explain why input and output tokens are priced separately, from the prefill/decode mechanism rather than from a price list <!-- id: cost-01-token-economics-c01 energy: normal -->
- [ ] I can state the output-to-input cost multiple as something I look up rather than something I remember <!-- id: cost-01-token-economics-c02 energy: low -->
- [ ] I can predict, before sending, whether a request will be input-dominated or output-dominated <!-- id: cost-01-token-economics-c03 energy: normal -->
- [ ] I can explain why "think step by step" is an output-token purchase and name a case where it is a bad one <!-- id: cost-01-token-economics-c04 energy: normal -->
- [ ] I can explain why a detailed, verbose prompt can be cheaper than a terse one <!-- id: cost-01-token-economics-c05 energy: normal -->
- [ ] I can name at least six billing dimensions beyond input and output token counts <!-- id: cost-01-token-economics-c06 energy: normal -->
- [ ] I can explain the cache write/read asymmetry and compute when caching pays off for a given reuse count <!-- id: cost-01-token-economics-c07 energy: high -->
- [ ] I can explain why a timestamp at the top of a prompt destroys cache hits <!-- id: cost-01-token-economics-c08 energy: normal -->
- [ ] I can describe what a batch discount is buying and when it is the wrong choice <!-- id: cost-01-token-economics-c09 energy: low -->
- [ ] I know how reasoning tokens are billed and why reasoning models can cost more than their visible output suggests <!-- id: cost-01-token-economics-c10 energy: normal -->
- [ ] I can explain how images are priced in tokens, and what the detail setting does to that number <!-- id: cost-01-token-economics-c11 energy: normal -->
- [ ] I can explain why tool definitions and tool results both add to the bill on every loop iteration <!-- id: cost-01-token-economics-c12 energy: normal -->
- [ ] I can explain why a hosted fine-tune's cost does not go to zero when traffic does <!-- id: cost-01-token-economics-c13 energy: normal -->
- [ ] I can state the four-characters-per-token rule as a rough rule of thumb and name three places it fails badly <!-- id: cost-01-token-economics-c14 energy: low -->
- [ ] I have measured my own English-to-my-language token ratio and can state it as a range <!-- id: cost-01-token-economics-c15 energy: normal -->
- [ ] I can explain the Petrov et al. finding and its three consequences without overstating what it says <!-- id: cost-01-token-economics-c16 energy: high -->
- [ ] I can explain what the language penalty does to my usable context window, not just to my bill <!-- id: cost-01-token-economics-c17 energy: high -->
- [ ] I have a dated pricing checklist from my own provider, with gaps marked as gaps <!-- id: cost-01-token-economics-c18 energy: normal -->
- [ ] I can compute cost per attempt and cost per success and explain why they differ <!-- id: cost-01-token-economics-c19 energy: normal -->
- [ ] I have a cost-per-success ledger with at least two configurations and a pre-written definition of "usable" <!-- id: cost-01-token-economics-c20 energy: high -->
- [ ] I can name three situations where cost per success is not a sufficient metric <!-- id: cost-01-token-economics-c21 energy: high -->
- [ ] I know exactly which of my current habits will cost me money the day the free beta ends <!-- id: cost-01-token-economics-c22 energy: normal -->

## Quiz

### Q1. A request is 900 input tokens and 300 output tokens. Output is priced at roughly four times input per token. Which statement is correct? <!-- id: cost-01-token-economics-q01 energy: normal -->

- [ ] Input accounts for most of the bill because it is most of the tokens
- [x] Output accounts for roughly 57 percent of the bill despite being a quarter of the tokens
- [ ] The two contribute equally, since the total is what is billed
- [ ] The bill depends only on the total token count, not on the split

**Why:** Weight before comparing. Input contributes 900 units, output contributes 300 times 4, or 1200 units, out of 2100 — about 57 percent. The tokens are three-quarters input, but the money is majority output. This is the single most useful calculation in the phase, and it takes ten seconds.

### Q2. Why does generating output cost more per token than reading input? <!-- id: cost-01-token-economics-q02 energy: normal -->

- [x] Input is processed in one parallel pass, while output is generated one token at a time in a strictly sequential chain
- [ ] Output tokens are larger in the vocabulary and take more memory
- [ ] Providers add a margin to output because it is the visible product
- [ ] Output tokens are encrypted before being returned to the caller

**Why:** Prefill computes the whole input at once, which suits the hardware. Decode produces one token at a time, each depending on the previous, so the hardware is underused and the work cannot be batched away. The price multiple reflects that real computational asymmetry, and it is why total latency tracks output length rather than input length.

### Q3. You want to halve the bill on a task that classifies 2,000 short messages. Which change is most likely to achieve it? <!-- id: cost-01-token-economics-q03 energy: normal -->

- [ ] Shortening the system prompt by half
- [ ] Switching to a model with a smaller context window
- [x] Constraining the output to the category word only, instead of a conversational reply with reasoning
- [ ] Compressing the messages before sending them

**Why:** Each call is short-question, long-answer, so it is output-dominated, and output carries the higher price. Cutting a 250-token conversational reply down to a 3-token category removes the dominant term on every one of 2,000 calls. Shortening the system prompt attacks the cheaper meter, and compressing 40-token messages saves almost nothing.

### Q4. Prompt caching on a provider you are evaluating charges a premium to write a prefix and a discount to read it. When does caching clearly pay off? <!-- id: cost-01-token-economics-q04 energy: high -->

- [x] When a long, stable prefix is re-read many times before it expires
- [ ] Whenever the prompt contains a long document
- [ ] Whenever the provider offers caching at all
- [ ] When the prefix is short enough to fit in the minimum cacheable length

**Why:** The write premium has to be repaid by reads. Long and stable gives you something worth caching; many re-reads gives you enough of them to beat the premium; and the time-to-live bounds how many re-reads are realistically available. A long document attached to a one-off request hits none of those conditions.

### Q5. You add the line "Today is 14 March" to the very top of your system prompt to make answers timelier. Your cache hit rate collapses to zero. Why? <!-- id: cost-01-token-economics-q05 energy: normal -->

- [ ] The provider disables caching for prompts containing dates
- [ ] Dates tokenize into many tokens, pushing the prompt over the cache minimum
- [ ] Caching only works for user messages, never for system prompts
- [x] Cache matching is a prefix match, so a change at the very start invalidates everything after it

**Why:** A cached prefix must match from the beginning. Putting a value that changes daily at position zero means no request's prefix ever matches the previous one, so nothing after it can be reused. Move the dynamic value to the end — into the user message — and the stable prefix in front of it stays cacheable.

### Q6. A reasoning model returns a 40-word answer and the `usage` object shows a much larger output token count than 40 words would explain. What is happening? <!-- id: cost-01-token-economics-q06 energy: normal -->

- [ ] The provider is padding the count as a billing practice
- [x] Thinking tokens and formatting tokens are generated tokens and are billed as output
- [ ] The answer was generated several times and the best one returned
- [ ] Input tokens are being miscounted as output tokens

**Why:** Generation is generation. Reasoning tokens are produced by the model, so they are metered on the output side at the expensive rate, and providers commonly itemise them separately in `usage`. This is why a reasoning model can produce a short visible answer at a high cost, and why budgeting by eyeballing response length fails.

### Q7. What does Petrov et al. (arXiv:2305.15425) actually report about tokenization across languages? <!-- id: cost-01-token-economics-q07 energy: high -->

- [ ] That most modern tokenizers produce roughly equal token counts across languages
- [ ] That only character-level models show any cross-language disparity
- [x] That the same content can differ in tokenized length by up to 15 times, and the disparity persists even in multilingual tokenizers
- [ ] That the disparity disappears once a model is trained on more than one language

**Why:** The paper reports differences of up to 15 times in tokenized length for the same text translated across languages, and finds that the disparity persists even for tokenizers intentionally trained for multilingual support. It names three consequences: the cost of commercial language services, processing time and latency, and how much content fits in the context window.

### Q8. Which consequence of the tokenization disparity do people most often overlook? <!-- id: cost-01-token-economics-q08 energy: high -->

- [ ] That it makes the bill larger
- [x] That it shrinks how much content actually fits in the context window
- [ ] That it makes responses slower
- [ ] That it makes the model understand the language less well

**Why:** Cost and latency are visible enough that people notice them. The window is specified in tokens, so a language that needs more tokens per unit of meaning fits less of the same material — and the disparity arises at the tokenization stage, before the model is invoked at all. It is a capacity problem disguised as a length problem, and it bites hardest in retrieval and summarisation. It is also not a knowledge problem: the model's understanding is a separate matter from how many tokens its tokenizer charges you.

### Q9. Model A costs a quarter as much per token as Model B, but produces usable output on only 25 percent of attempts. What is the cost per successful task, assuming retries? <!-- id: cost-01-token-economics-q09 energy: high -->

- [ ] Model A is four times cheaper per success
- [ ] Model A is still cheaper, but only slightly
- [x] Roughly break-even with Model B, before counting latency, your time, or silent failures
- [ ] Impossible to say without knowing the exact prices

**Why:** Cost per success is cost per attempt times attempts per success. A 25 percent success rate means about four attempts per success, which exactly cancels a four-times-lower price. And that comparison is optimistic: failures tend to cluster on the same hard inputs, retries are not independent, and an output that looks fine and is wrong is never retried at all.

### Q10. Which statement best captures why quoting a specific price in a lesson like this is a bad idea? <!-- id: cost-01-token-economics-q10 energy: low -->

- [ ] Prices differ between countries, so no single number is correct
- [ ] Providers forbid their prices being reproduced
- [ ] Prices are always negotiable, so any published number is misleading
- [x] Prices change on the order of weeks, and a confidently wrong number is worse than knowing where to look

**Why:** The durable knowledge is the checklist of questions to ask and the mechanism behind each line item. A number copied into a lesson becomes wrong silently — the lesson still reads as authoritative, but the budget built on it does not survive. Learning to read the pricing page today, and date what you found, is a skill that never expires; memorising a price is a skill that expires in weeks.

## You're ready to move on when...

You can take a request you have never sent — a system prompt, a document, a conversation, a tool list, and an instruction — and say which meter will dominate the cost and roughly by how much, then check your prediction against the `usage` object and land in the right ballpark. You can name every billing dimension on your provider's pricing page without looking, and you can say for each one whether it applies to your work. You know your own English-to-your-language token ratio as a measured number, not a suspicion, and you can explain what it does to both your bill and your usable context window. You have run at least one task end to end on two model configurations and computed cost per successful task for both, with the definition of "successful" written down before you started. And you can explain, without notes, why the cheapest model is often not the cheapest option — and when it genuinely is.

## Free vs Paid

### What's free is enough

Everything in this phase is measurable at zero cost, and right now that matters more to you than to most readers, because your free beta access is about to end. Use it hard while it lasts.

Your free API key covers every experiment here: the three output variants, the chain-of-thought comparison, the cache-hit investigation, the 20-to-30-run success measurement, and the bilingual counting. Those runs cost tokens, and while you are on beta access, tokens are free — which makes this the one moment when you can measure generously instead of guarding every call. The `usage` object you get back is the same object a paying customer sees.

The part that does not need any API key at all is the counting. tiktoken runs offline on your own laptop, which means the bilingual experiment — the one most personally relevant to you — can be run for nothing, indefinitely, with no rate limits and no key. Do that one first, so it is done regardless of what happens to your beta access. Browser tokenizer playgrounds cover the same ground with no install.

Every pricing page in the resource list is free to read. Reading them is the actual skill of Part 3, and it costs nothing but attention. The fairness paper and its project page are free. LibreOffice Calc is free, and the ledger is a spreadsheet.

The honest constraint on the free path is rate limits, not money. A free tier may cap you before you finish 30 runs for the success-rate measurement. If that happens, reduce to 10 runs with the same pre-written success definition and report the wider uncertainty honestly — a smaller measurement with a stated margin beats a fabricated one.

### What a paid tier adds

Two things, and only two, genuinely require money.

The first is **volume of measurement**. Comparing several model configurations on the same task, 30 runs each, is where cost-per-success numbers become trustworthy. Free tiers make that slow rather than impossible. This is the single best use of a small amount of paid credit.

The second is **access to the mechanisms**. Caching, batch processing, and reasoning-effort settings are sometimes unavailable or differently behaved on free tiers. If you cannot observe a cache write on your free tier, you cannot complete tasks 7 through 9 properly. A few dollars of credit is enough to run the cache experiment and see the write/read asymmetry with your own eyes — and that experiment is the one that most changes how people build.

### When it's worth paying

**Not for this phase's reading, and not for the counting.** Those are free, permanently.

Pay the moment your beta access ends and you have a task you actually want to run — because at that point you are not paying to learn, you are paying to do something, and this phase has given you the judgement to do it deliberately. Concretely, the first purchase that makes sense is a small credit balance on a single provider with caching and batch support, used to (a) confirm your bilingual ratio on a real endpoint, (b) run the cache experiment, and (c) measure one real task end to end.

What you should not buy, in this phase or the next: a hosted fine-tune. It bills by uptime, you do not yet have the volume that justifies it, and the same money spent on better prompting and a better-chosen model will beat it for a long time. That comparison is Track 6's job.

**The one purchase that pays for itself immediately** is not a subscription at all. It is the hour you spend, before the beta ends, running your own numbers through tasks 1 through 11 and writing them into your portfolio. The reader who does that walks into the paid era knowing where the money goes. The reader who does not will learn the same lessons from an invoice, later, at a worse time.
