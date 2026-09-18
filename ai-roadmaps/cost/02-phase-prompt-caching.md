---
id: cost-02-prompt-caching
track: cost
phase: 2
order: 20
title: Prompt Caching
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/cost/02-prompt-caching.md
exit_criteria: >
  You can explain why prompt caching reuses work across requests while the KV
  cache reuses work within one, and say what each one is billed for. You can
  read a provider's caching documentation and extract the four numbers that
  decide whether it helps you: minimum cacheable length, write multiplier, read
  multiplier, and TTL. You can lay out a prompt so its stable prefix is
  genuinely stable, and name every common anti-pattern that silently destroys a
  cache. You can compute, with variables rather than memorised prices, the reuse
  count at which caching becomes cheaper than not caching — and you can say when
  caching is the wrong answer entirely.
---

# Phase 2 — Prompt Caching

## Goal of this phase

Prompt caching is the single largest cost lever available to most applications, and it is the one most teams either ignore or misconfigure into uselessness. By the end of this week you will understand it as a mechanism rather than a feature: if many of your requests share an identical *prefix*, the provider can store internal state for that prefix and reuse it, so you pay a premium once for the cache write and a discount many times for the cache reads.

The spine of this phase is a distinction that trips up almost everyone: **prompt caching is not the KV cache.** The KV cache from Foundations Phase 4 is server-side, automatic, per-request, and invisible — it is why your second message in a chat is cheaper than your first. Prompt caching is a *billed product feature* that reuses work *across separate requests*. One is how inference works; the other is something you buy. If you merge them in your head, every provider pricing page becomes unreadable.

You have free API access through a beta that is about to end. That is exactly the situation this phase is written for. Week one of paying full price is when the difference between a well-ordered prompt and a carelessly ordered one shows up on a bill — and you can find that difference this week, while the access is still free.

## Estimated time

**1 week**, roughly 6–9 hours.

| Day | Focus | Time |
|---|---|---|
| Mon | Read Parts 1–2 (the problem, and the mechanism) | 1–2h |
| Tue | Read Parts 3–4 (what is cacheable, and the standard layout) | 1–2h |
| Wed | Read the caching docs of two providers; build your own constants table | 1–2h |
| Thu | Read Parts 5–6 (anti-patterns, the arithmetic); run the reuse-count exercise | 1–2h |
| Fri | Write the deliverable, take the quiz, review what you got wrong | 1h |

The reading is about half of it. The phase only becomes real when you have taken a prompt you actually use, restructured its ordering, and computed the reuse count at which caching pays for itself in *your* application, with *your* numbers.

## Skills you'll gain

- Distinguish the server-side KV cache from provider prompt caching, and say which one appears on a bill
- Explain prefix matching: why a single changed character early in a prompt invalidates everything after it
- Lay out a prompt so that stable content comes first and variable content comes last, and say why the reverse is expensive
- Read a provider's caching documentation and extract minimum cacheable length, write multiplier, read multiplier, and TTL
- Compute the reuse count at which caching becomes cheaper than not caching, using variables rather than memorised prices
- Explain why a cache write usually costs more than normal input and a read costs much less, and what that implies about reuse
- Explain why TTL is measured from the start of a request rather than the end, and why long generations shrink your reuse window
- Recognise the six common anti-patterns that silently destroy a cache, including ones that look like good prompt engineering
- State the tension between attention-favouring retrieval order and cache-favouring stability, and propose how to measure both
- Decide when caching is the wrong optimisation and something else should be done instead

## Specific topics to learn

### The mechanism

- Prefix matching over a token sequence, and why it is exact rather than fuzzy
- Cache writes, cache reads, and the two different price multipliers
- Minimum cacheable length, and why it varies by provider and model
- TTL, cache refresh on use, and expiry that forces a rewrite
- How the KV cache and prompt caching relate: one is built on the other

### The practice

- The standard caching prompt layout: static first, variable last
- Cache breakpoints and segmented reuse (instructions, documents, history)
- Anti-patterns: timestamps, session IDs, reordered documents, dynamic few-shot, string-concatenated prompts, per-user content early
- Measuring cache hit rate instead of assuming it
- The reuse-count arithmetic, in variables
- The retrieval-order versus cache-stability tension

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Python 3 | Run the reuse-break-even arithmetic and simulate prompt hashing | Free | https://www.python.org/downloads/ | Tasks t01, t04, t05 | Any Python from your OS package manager |
| tiktoken | Count tokens locally so you can measure prefix lengths without spending credit | Free/open-source | https://github.com/openai/tiktoken | Tasks t02, t05 | Any local tokenizer library, or a provider's free counting endpoint |
| Tiktokenizer | See how a prompt splits into tokens in the browser, no install | Free | https://tiktokenizer.vercel.app/ | Task t02 | `tiktoken` in a local script |
| OpenAI prompt caching docs | Read the live minimum length, granularity, and retention rules | Free to read | https://platform.openai.com/docs/guides/prompt-caching | Tasks t03, t06 | Any provider's caching page; read at least two |
| Anthropic prompt caching docs | Read explicit breakpoints, TTL, and cache-write/read pricing columns | Free to read | https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching | Tasks t03, t06, t07 | Any provider's caching page |
| Google Gemini context caching docs | Compare implicit versus explicit caching and storage billing | Free to read | https://ai.google.dev/gemini-api/docs/caching | Task t03 | The other providers' equivalent pages |
| vLLM automatic prefix caching docs | See the same idea implemented in open-source serving, for free | Free/open-source | https://docs.vllm.ai/en/latest/features/automatic_prefix_caching.html | Task t07 | llama.cpp's prompt cache flags, also free |
| A provider usage dashboard | Observe reported cached versus uncached input tokens | Freemium; paid above the free tier | https://platform.openai.com/docs/guides/prompt-caching | Task t06 | Your provider's free tier usage page, or read the cached-token fields in a raw API response instead |

## Free/cheap resources

- **OpenAI, Prompt caching guide** — https://platform.openai.com/docs/guides/prompt-caching
- **Anthropic, Prompt caching documentation** — https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
- **Google, Gemini API context caching** — https://ai.google.dev/gemini-api/docs/caching
- **Google Cloud, Vertex AI context cache overview** — https://cloud.google.com/vertex-ai/generative-ai/docs/context-cache/context-cache-overview
- **AWS, Amazon Bedrock prompt caching** — https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html
- **vLLM, Automatic prefix caching** — https://docs.vllm.ai/en/latest/features/automatic_prefix_caching.html
- **vLLM, PagedAttention design (the KV cache foundation)** — https://docs.vllm.ai/en/latest/design/kernel/paged_attention.html
- **tiktoken (local token counting)** — https://github.com/openai/tiktoken
- **Tiktokenizer (browser tokenizer)** — https://tiktokenizer.vercel.app/
- **Anthropic, Introducing Contextual Retrieval (prompt-caching-friendly chunking)** — https://www.anthropic.com/news/contextual-retrieval
- **Lost in the Middle (why ordering changes retrieval quality)** — https://arxiv.org/abs/2307.03172
- **Attention Is All You Need (the architecture underneath all of this)** — https://arxiv.org/abs/1706.03762

## Lesson: Paying Once for a Prefix You Send a Thousand Times

I am going to build this the same way every time: the problem, the mechanism, what it lets you predict, and then where it stops working. The last part is where most writing about cost optimisation quits, and it is where the judgement lives.

### Part 1 — The problem: you are paying to re-read the same words

Picture an application you might actually build. A support assistant for a small business. Every request contains a 4,000-token instruction block: company policy, tone rules, escalation rules, the product list. Then a user question of maybe 60 tokens.

Send that request 10,000 times. You have transmitted and processed roughly 40 million tokens of instructions and 600,000 tokens of actual questions. Ninety-eight percent of what you paid for was material the model had already seen, byte for byte, on every single previous request.

That is not a rounding error. It is the entire cost structure of most applications built on top of a model. The distinguishing feature of a real application — as opposed to a chat window — is that it has a **fixed context**. A persona, a policy, a schema, a tool list, a document set. It does not change per user. That fixed part is where the money goes.

Now here is the thing that makes this frustrating rather than merely expensive. The model's own machinery *already knows* how to avoid recomputing a prefix. That is the KV cache from Foundations Phase 4: within a single request, when the model generates token 500, it does not recompute the keys and values for tokens 1–499, because those cannot have changed. Causality guarantees it.

So the machinery exists. The problem is that it is **scoped to one request**. When your 10,000th request arrives, the server has no memory that it processed a byte-identical 4,000-token prefix on the previous 9,999 requests. It starts from nothing.

> **Analogy:** the KV cache is your own working memory while solving one problem — you do not re-derive what you already worked out. Prompt caching is a shared whiteboard that survives between problems, so a colleague starting from the same diagram does not redraw it.
>
> **Where the analogy breaks, and this matters:** the whiteboard is not free to write on, and it is not free to keep. You pay a *premium* to put something on it, you pay again — less — every time someone reads it, and it gets wiped on a timer you do not control. If nobody reads it before it is wiped, you paid the premium for nothing. Your own working memory has none of those properties. And unlike a whiteboard, you cannot inspect the cached state, or check what was kept.

So the question is not "can the provider avoid recomputing my prefix". It is: **"under what conditions will it, and at what price?"** That is what the rest of this phase answers.

### Part 2 — The mechanism: store the prefix state, bill the write, discount the read

Prompt caching works on one principle, and everything else follows from it:

> If a request's token sequence **begins** with a sequence the provider has already computed, the provider can resume from the stored internal state instead of recomputing it.

Read the word "begins" again. It is the whole mechanism.

The provider walks your prompt from the start. It processes tokens until it reaches a point where your prompt diverges from something it has stored. Everything before that point can be reused. Everything from that point onward must be processed fresh. Providers are explicit that this is a lookup over cache boundaries, walking from the longest matching prefix to the shortest.

That gives you two kinds of token in every request:

| | Cache write | Cache read (hit) |
|---|---|---|
| What it is | You are the first to send this prefix; the provider computes and stores its state | The prefix was already stored; the provider resumes from it |
| Typical price relative to normal input | Higher — often a multiple of the normal input price | Much lower — often a small fraction of the normal input price |
| When it happens | Cold cache, first request, or after expiry | Warm cache, and the prefix matches exactly |

The asymmetry is the entire economics of the feature. A **write costs more than normal input.** A **read costs much less.** So caching is only ever a win when the same prefix is read more times than it takes to repay the write premium. If every request has a unique prefix, caching cannot help you at all — you pay the premium every time and never collect the discount.

Let me be precise about the multipliers without giving you numbers to memorise, because the numbers move. Define the provider's two multipliers relative to its normal input price:

```text
w = cache WRITE multiplier   (relative to normal input price; usually w > 1)
r = cache READ multiplier    (relative to normal input price; usually r < 1)
```

As of early 2026, across the major providers, `w` is typically greater than 1 and `r` is typically a small fraction of 1 — but the specific values differ per provider, per model, sometimes per TTL tier, and they change. Anthropic's documentation, for instance, prices different cache durations as separate columns, with longer TTLs costing more to write. **Do not carry a number from this page into your cost model.** Carry the method, and read the current table. I will give you the arithmetic in Part 5 so that you never need my numbers.

There are two other parameters, and you must look both of them up rather than assume:

**Minimum cacheable length.** A prefix below some length cannot be cached at all. This varies by provider *and by model*. Anthropic's documentation, read in early 2026, lists different minimums for different model families — some at 512 tokens, others at 2,048. Treat that as an illustration of the *variation*, not as a fact about your model. Check your model's row.

**TTL, and what restarts it.** A cache entry expires after a provider-defined window. The important mechanical detail, which surprises people, is how that window is measured:

> The lifetime is measured from the **start of the request** that writes or reads the cache entry — **not** from the end of its response. Time spent generating a response counts against the lifetime.

I am quoting the mechanism because it is exact and durable. Its consequence is not obvious: a request that takes four minutes to stream, against a five-minute window, has consumed four of its five minutes *before the user has finished reading the answer*. Your next request must arrive within roughly the remaining minute to hit. **Long generations eat your reuse window.** An application with slow, long outputs has a structurally worse cache hit rate than one with fast, short outputs — same prefix, same provider, different economics.

Some providers also *refresh* the window for free each time the cached content is used, which means a prefix under steady traffic can stay warm indefinitely while the same prefix under bursty traffic keeps expiring. That difference alone can decide whether caching is worth enabling for you.

**This is not the KV cache.** Put the two side by side, because the Cost track depends on you keeping them apart:

| | KV cache (Foundations Phase 4) | Prompt caching (this phase) |
|---|---|---|
| Where it lives | Inside the serving engine | A provider feature layered on top |
| Scope | One request, one conversation | **Across separate requests** |
| Lifetime | The request | A provider-defined window, often minutes |
| Enabled by you? | No — it is how inference works | Usually yes, implicitly or explicitly |
| Billed? | No separate line item | **Yes** — writes and reads are priced |
| Optimises | Making generation possible at all | Making a *repeated prefix* cheap |
| Fails when | Never; it is the mechanism | Your prefixes differ, or you run out of TTL |

The relationship is one of layering, not rivalry: prompt caching is a way to **keep KV state alive between requests** so that a later request can skip the prefill work. The KV cache is the thing being stored. Prompt caching is the product that stores it, on a timer, for a price.

**What this lets you predict.** Any application with a large fixed prefix should see a large cost reduction, and any application with no repeated prefix should see none. A chat application that resends full history will cache naturally, because each new turn *extends* the previous prefix — the old turns are a genuine prefix of the new request. An application that puts a timestamp at the top of its system prompt will cache *nothing*, ever, while looking completely normal in every code review. And an application with a slow model and long outputs will hit less often than the same application with a fast model, because generation time competes with TTL.

### Part 3 — What makes a prefix cacheable, and what silently destroys it

The rule is exact and unforgiving: **the match must be an exact prefix match.** Not semantically equivalent. Not "the same instructions in a different order". Not "the same words with different whitespace". One changed character early invalidates everything after it.

Why so strict? Because the stored state is the result of computation over a specific token sequence. Change an early token and every position after it has a different key and value. There is no partial credit: the provider resumes at the last matching boundary, and everything downstream is recomputed. This is a direct consequence of the attention mechanism you learned in Foundations Phase 4 — in a causal model, an early token influences everything after it, so "almost the same prefix" is not almost the same state. It is a different state.

The practical rule that follows is the one to burn in:

> **Stable content first. Variable content last. Always.**

Here is the standard layout for a caching-friendly prompt. Compare your own prompts against this column by column.

| Position | Content | Changes how often | Why it sits here |
|---|---|---|---|
| 1 | Static system instructions, persona, policy | Almost never | Longest-lived, so it repays its write premium the most times |
| 2 | Tool and function definitions | Rarely | Stable across a deployment; expensive to include, so worth caching |
| 3 | Fixed few-shot examples | Rarely | Same examples for every request means a real prefix |
| 4 | Stable reference documents (knowledge base, schema) | Daily or weekly | Stable enough to cache, and often the largest block |
| 5 | Growing conversation history | Every turn | Extends the prefix, so previous turns stay cacheable |
| 6 | The current user message | Every request | Genuinely variable; putting it last costs nothing |

Note what position 5 does. In a multi-turn chat, turn *n*'s prompt is turn *n−1*'s prompt plus a bit more. That is a genuine prefix relationship, so history caches naturally — which is why chat workloads often cache well without any deliberate design. What breaks it is anything variable that gets injected *before* history.

Now the anti-patterns. Each of these silently kills the cache, and each one looks reasonable in isolation. Several look like good prompt engineering.

**1. A timestamp or session ID near the top.** The classic. Someone adds `Current time: 2026-01-15 09:14:22` or `Session: abc-123` to the system prompt for observability. Every request now has a unique first-of-its-kind prefix, so nothing after it ever matches. Cache hit rate: zero. Cost: you pay the write premium on every request and never collect a read.

**2. Dynamically reordered retrieved documents.** A retrieval step returns the top *k* chunks and sorts them by relevance score. The scores fluctuate between near-identical queries, so the same five documents arrive in a different order, and the block is not a stable prefix. This is subtle because the *content* is stable; only the ordering moves. The cache cannot see the difference between "reordered" and "different".

**3. Dynamically selected few-shot examples placed early.** Choosing examples per-request based on the query is a real quality technique. Placing them near the top of the prompt makes every request a new prefix. If you must select dynamically, the selection has to interact with caching deliberately — either move the examples after the stable block, or accept that you have traded your cache for accuracy and measure whether the trade paid.

**4. String-concatenated system prompts.** You build the system prompt by concatenating pieces in the order they happen to be assembled by your code — and one piece is an empty string on some paths, or a feature-flag branch adds a sentence. The prompt is *logically* the same and *textually* different. Cache miss. The fix is to make the assembled prefix deterministic and to test that it is.

**5. Per-user content injected before the shared prefix.** `Account tier: Pro. Name: Ana.` prepended to a shared instruction block. Every user is now a distinct prefix, and your cache is partitioned into thousands of one-read entries — each of which paid the write premium. If per-user context is needed, it goes *after* everything shared.

**6. A near-miss that is invisible.** Trailing whitespace differences, a dictionary whose key order varies between runs, a date rendered with a different format, a JSON payload serialized without sorted keys. These produce textually different prefixes from logically identical inputs. You will not find these by reading your prompt; you find them by hashing the assembled prefix in a test and asserting it is stable.

> **Analogy for the whole family:** think of the cache as a filing cabinet keyed on the first paragraph of a document. File a document with one word changed in the opening line, and it does not almost-match the existing folder — it is a new folder, and you pay to create it.
>
> **Where it breaks:** a filing cabinet lets you look inside and see the near-duplicate. A prompt cache gives you only a number: how many tokens were read from cache versus written. You cannot diff what was stored. That is why the diagnostic discipline in Task t05 — hashing your own prefix — is not optional. You must build the observation the provider does not give you.

**What this lets you predict.** You can now look at any prompt-assembly code and predict its cache behaviour before running it. Ask one question of each piece: *is this identical across the requests I want to share a cache?* If a piece varies, everything after it is unprotected. You can also predict that any prompt assembled from a dictionary or a set will have a *nondeterministic* prefix unless you sort it — and that a cache that works in testing can vanish in production when the iteration order changes.

### Part 4 — Segmented caching: more than one breakpoint

Treating caching as all-or-nothing is the second most common mistake, after timestamps. Real applications have content with **different lifetimes** mixed together. Your instructions change monthly; your knowledge base changes daily; your conversation changes every turn.

If you cache only one prefix, the fastest-changing element determines the lifetime of everything before it. Update the knowledge base, and you have invalidated the instructions too — because the instructions are a prefix of the documents, and the documents changed.

Providers solve this with **multiple cache breakpoints**: you mark several positions in the prompt, and each becomes a separately reusable segment.

| Segment | Content | Lifetime | What updating it invalidates |
|---|---|---|---|
| 1 | Tools and instructions | Months | Only segment 1, and everything after — so update it rarely |
| 2 | Reference documents | Days | Segments 2 and after; segment 1 survives |
| 3 | Conversation history | Every turn | Segment 3 onward; segments 1 and 2 survive |

The reason this matters: **a change at a breakpoint invalidates that segment and everything after it, but not the segments before it.** So the ordering principle from Part 3 generalises. Put your most stable material first, your least stable last, and place breakpoints at the boundaries between them. Then a document refresh costs you a write on the documents while your instructions stay warm.

Anthropic's documentation, read in early 2026, describes exactly this shape with four segments — tools, system instructions, documents, then conversation history — and notes the reuse consequences per segment. Other providers expose the same idea with different names: some cache automatically at model-chosen intervals, others let you mark explicit positions, and some support both. Read your provider's page for which you have.

**What this lets you predict.** Segmented caching predicts a specific, checkable pattern in your metrics: a document update should produce a *partial* cache miss, not a total one. If refreshing your knowledge base drops your cache hit rate to zero, your segments are misordered — most likely your documents sit before your instructions, or you have no breakpoints at all and everything is one segment whose lifetime is set by its fastest-changing member. That is a diagnosis you can make from one graph.

### Part 5 — The arithmetic: when does caching actually pay?

This is the part that turns caching from a belief into a decision. I will do it in variables so it survives every price change, and so you can plug in your own provider's current numbers.

Suppose a cached prefix of `P` tokens is written once and then read on `N` subsequent requests — so `N + 1` requests in total share it.

```text
Without caching, the prefix costs, in units of normal input price:
    C_plain = (N + 1) * P

With caching, that same prefix costs:
    C_cached = w * P            # one write
             + r * P * N        # N reads

Caching wins when C_cached < C_plain:
    w * P + r * P * N  <  (N + 1) * P

Divide both sides by P (P > 0, so the prefix length cancels):
    w + r * N  <  N + 1

Solve for N:
    w - 1  <  N * (1 - r)
    N      >  (w - 1) / (1 - r)
```

That last line is the whole phase in one expression:

```text
break-even reuse count:  N* = (w - 1) / (1 - r)
```

where `w` is the write multiplier and `r` is the read multiplier, both relative to normal input price.

Two things fall out of this immediately, and they are worth more than any memorised figure.

**The prefix length does not appear in the answer.** `P` cancelled. If the prefix is above the provider's minimum cacheable length, its *size* does not change how many times you must reuse it to break even. A 2,000-token prefix and a 200,000-token prefix break even at the same reuse count. What the size changes is the *absolute* saving, which scales linearly with `P` — so caching a long prefix is worth more money, but is not easier or harder to justify. This is genuinely counter-intuitive and worth checking yourself.

**The answer depends only on the provider's multipliers, not on prices.** When the provider changes its per-token price, `w` and `r` are usually unchanged, so your break-even count is unchanged too. That is why this formula is durable and a table of dollar figures is not.

Let me make it concrete with illustrative values, clearly labelled as invented-for-illustration rather than quoted:

> **Illustrative.** Suppose a provider's write multiplier is `w = 1.25` and its read multiplier is `r = 0.10`. Then `N* = (1.25 − 1) / (1 − 0.10) = 0.25 / 0.90 ≈ 0.28`. In plain terms: caching pays off essentially immediately, on the very first reuse. That is a provider whose reads are cheap and whose write premium is small. These numbers are made up to show the shape of the calculation; substitute your provider's real multipliers.

Now change one variable and watch the decision flip:

> **Illustrative.** Suppose instead `w = 2.0` (writing costs twice normal input) and `r = 0.5` (reads cost half). Then `N* = (2.0 − 1) / (1 − 0.5) = 1 / 0.5 = 2`. You need at least **three** requests sharing the prefix — one write and two reads — before caching beats not caching. With two requests total you lose money, and with one request you have handed the provider a premium for nothing.

That second case is the one to internalise, because it is the realistic one for many workloads. Notice what it means: **if your reuse is lower than `N*`, enabling caching makes you slower and poorer at the same time.** Caching is not a free optimisation you should switch on. It is a bet that the same prefix will be seen `N*` or more times before it expires.

And now bring TTL back into the arithmetic, because `N` is not a number you choose — it is a number you *observe*:

```text
N_reachable ≈ (number of requests sharing the prefix)
              that arrive within the TTL
```

TTL is what makes `N` smaller than your total request count. If your traffic is bursty, or your generations are long (Part 2), you will not reach `N*` even with thousands of daily requests. So the honest procedure is:

1. Read `w` and `r` from your provider's current pricing table. Compute `N*`.
2. Measure your actual reuse within the TTL window — not your total request count.
3. Enable caching only if step 2 exceeds step 1. Then measure again, because the second measurement is the real one.

**What this lets you predict.** You can predict that a high-traffic application with a short prefix and long, slow generations may genuinely lose money on caching — the TTL expires mid-generation. You can predict that a low-traffic internal tool with a huge policy document may still win, if its few requests arrive within the window. And you can predict that a provider raising the write multiplier raises your `N*` and can turn a working cache into a losing one without any change to your code. That last one is why you re-derive `N*` instead of remembering an answer.

### Part 6 — The real tension, and where caching stops working

Here is the honest centre of this phase. Prompt layout for caching and prompt layout for *quality* sometimes point in opposite directions, and you cannot optimise both without measuring.

Since Lost in the Middle (Liu et al., arXiv:2307.03172), it has been clear that position affects how reliably a model uses retrieved material. The paper's setup placed the relevant document at varying positions among 10, 20, or 30 documents, and found that accuracy is highest when the relevant document is at the beginning or the end, and degrades when it sits in the middle — with the striking anchor that in the middle position, accuracy fell **below the model's 56.1% closed-book accuracy**, meaning the model did worse than if it had not been given the documents at all. That is the finding to carry: the *middle* is the danger zone, not "the end is bad".

Now put that next to Part 3. Caching wants stable content first and variable content last. Retrieval quality wants the most relevant chunk at an edge — preferably the *start*, where attention favours it.

These conflict when the most relevant chunk changes per request. You cannot have the highest-relevance chunk both first (for attention) and last (for caching). Something must give.

The resolution is not a clever trick. It is measurement, and it looks like this:

- **Default to caching order** when your retrieved block is large and your stable prefix is larger. The cost saving is certain and computable; the quality effect of ordering is real but smaller than the cost effect for most tasks.
- **Prefer attention-favouring order** when retrieval quality is the binding constraint — when you are already failing accuracy targets and the cost of a wrong answer exceeds the cost of the tokens.
- **Measure both.** Hold the prompt content fixed and vary only the ordering; measure task accuracy. Then measure cache hit rate for each ordering. You now have two numbers per configuration and a real trade-off curve instead of an opinion.

There is a third option that often beats both, and it is the reason I listed Contextual Retrieval in the resources: make the documents block *stable* rather than reordered. If the same document set is present in the same order for every request in a session or a tenant, the ordering problem disappears — you get a cacheable block and you can place it early enough that attention still favours it. Anthropic's engineering write-up on Contextual Retrieval (19 Sep 2024) is worth reading here precisely because it treats retrieval quality and prefix stability as things to be designed together rather than traded off blindly.

Now, where does prompt caching stop working?

**It does nothing for unique prefixes.** This is the boundary, and it is not a soft one. If every request genuinely needs different material at the top of the prompt, caching has no purchase. You pay the write premium and you never collect. Do not enable it out of optimism.

**It does not reduce output cost.** Caching applies to input. If your bill is dominated by generated tokens, prompt caching is aimed at the wrong term. Fix the output side — shorter answers, better stopping conditions, a smaller model for easy requests — before spending effort on input caching.

**It does not survive long gaps or low volume.** Below `N*`, or with arrivals spaced beyond TTL, it is a net loss. Compute before enabling.

**It does not fix context bloat.** Caching makes a large fixed prefix *cheaper per request*, which can tempt you to keep material in the prompt that should be removed. A cached token is still cheaper than an uncached one and still more expensive than a token you never sent. Caching changes the price of a mistake; it does not stop it being a mistake.

**It is provider-specific and moves.** Minimum lengths, granularity, TTL options, refresh behaviour, routing and retention rules, and multipliers all differ across providers and change over time. As of early 2026 the major providers all offer prefix caching and all describe it differently. Anything you read on this page about a specific provider's numbers is a snapshot. **The method transfers; the numbers do not.**

**And it does not touch the KV cache.** To close the loop on the spine of this phase: the KV cache is still there, still automatic, still per-request, still unbilled. Prompt caching is the paid feature that lets one request's KV state be reused by a *later* request. When you read a provider's pricing page and see a line for cached input, that is the product. When your second chat message is cheap, that is the mechanism. They are different things, and you now know which is which.

## Hands-on practice tasks

1. Write down, for one prompt you actually send, the assembled prompt as an ordered list of blocks and mark each block as stable-per-request, stable-per-day, or variable. Identify the first variable block and state which blocks after it are unprotected. <!-- id: cost-02-prompt-caching-t01 band: quick energy: low -->
2. Measure a real prefix locally: read your system prompt into `tiktoken` or Tiktokenizer and count its tokens. Compare against your provider's published minimum cacheable length for your model, from its caching docs. Record both numbers and the date you read them. <!-- id: cost-02-prompt-caching-t02 band: quick energy: normal -->
3. Open the prompt-caching documentation for two different providers. Build a comparison table with exactly four rows: minimum cacheable length, cache-write multiplier, cache-read multiplier, and TTL. Note where a provider does not publish a value. Date the table. <!-- id: cost-02-prompt-caching-t03 band: focused energy: normal -->
4. Implement `break_even(w, r)` returning `(w - 1) / (1 - r)` in Python, then produce a table of `N*` for `r` in {0.05, 0.1, 0.25, 0.5} crossed with `w` in {1.0, 1.25, 1.5, 2.0}. Identify the cells where caching is never worth it and explain why in one sentence each. <!-- id: cost-02-prompt-caching-t04 band: focused energy: normal -->
5. Build a prefix-stability test: write a function that assembles your prompt from its parts and returns a SHA-256 hash of the assembled string. Call it twice with logically identical inputs. If the hashes differ, find out why — suspect dict ordering, timestamps, or unsorted lists. Fix it and assert the hash is stable. <!-- id: cost-02-prompt-caching-t05 band: focused energy: normal -->
6. Send the same request twice to a provider that reports cached token counts, and read the usage fields in the raw response. Record how many input tokens were reported as cached versus fresh on each call. Then change one character near the start of the prompt and send a third time. Record what happens to the cached count. <!-- id: cost-02-prompt-caching-t06 band: deep energy: high -->
7. Take a prompt that injects a per-user greeting or session ID near the top. Rewrite it so all shared content precedes all per-user content, then compute the token length of the newly protected shared prefix and estimate its saving using your own `N*` from Task t04. <!-- id: cost-02-prompt-caching-t07 band: focused energy: normal -->
8. Design a segmented cache layout for an application with monthly-changing instructions, a daily-changing document set, and per-turn conversation history. Mark where each breakpoint goes and state, for a document update, exactly which segments survive. <!-- id: cost-02-prompt-caching-t08 band: deep energy: normal -->
9. Keep a two-week log, starting now while your access is free: for each day you use a model API, record the total input tokens, the cached input tokens if reported, and whether you changed anything in the prompt's first half that day. At the end, write a paragraph connecting each cache miss to a specific anti-pattern from Part 3. <!-- id: cost-02-prompt-caching-t09 band: ongoing energy: low -->

## Common Pitfalls

- **Confusing prompt caching with the KV cache.** One is automatic, per-request, and unbilled; the other is a billed product feature spanning requests. If you write "the KV cache saves me money across requests", you have merged them.
- **Putting anything variable before anything stable.** The first variable token ends the match. This single mistake accounts for most zero-hit-rate caches.
- **Assuming a minimum cacheable length instead of looking it up.** It varies by provider and by model within a provider. A prefix below the minimum is silently uncacheable.
- **Enabling caching without computing `N*`.** Below the break-even reuse count you pay a premium and receive nothing. Caching is a bet, and the bet has arithmetic.
- **Forgetting that TTL starts at the beginning of the request.** Long generations consume the window. A prefix that "should" stay warm can expire while the previous answer is still streaming.
- **Measuring total requests instead of reuse within the TTL.** A thousand requests a day is meaningless if they are spread so that the cache expires between each one.
- **Building a prompt by concatenation whose text varies between logically identical runs.** Dict ordering, unsorted lists, and formatting drift produce different prefixes. Hash your assembled prompt in a test.
- **Caching a prefix so you can afford to keep bloated material in it.** A cached token is cheaper than a fresh one and still more expensive than a token you never sent.
- **Assuming a cache hit changes the answer.** Caching is a latency and billing optimisation. The reused state is the same state; if output differs, that is an implementation detail or a bug, not a feature to design around.
- **Writing a provider's numbers into your architecture.** Minimums, TTLs, and multipliers change. Keep the multipliers in configuration, re-derive `N*`, and date every figure you record.

## Deliverable / proof of work

Write `portfolio/cost/02-prompt-caching.md` containing:

1. **The distinction, in your own words.** Two short paragraphs separating the KV cache from prompt caching, covering scope, lifetime, and which one is billed. State the relationship between them in one sentence.
2. **A prompt audit of something real.** One prompt you actually send, decomposed into ordered blocks, each labelled stable-per-request, stable-per-day, or variable. Mark the first variable block and list the blocks it invalidates.
3. **Your constants table, dated.** Minimum cacheable length, write multiplier, read multiplier, and TTL for two providers. Include the date you read each page and an explicit note that the values will move.
4. **The break-even working.** Your `break_even` function, the table from Task t04, and a paragraph explaining why the prefix length drops out of the formula and what that implies for how you prioritise caching work.
5. **A segmented layout.** Your breakpoints, the lifetime of each segment, and precisely which segments survive a document refresh and why.
6. **The tension, resolved for one case.** Describe a prompt where attention-favouring order and cache-favouring order conflict. Say which you chose, what you measured to decide, and what result would have changed your mind.
7. **A prediction you got wrong.** One thing in this phase that contradicted what you expected before reading it, and what the mechanism actually implies. This is the most valuable section — include it even if it is three sentences.

## Checklist

- [ ] I can explain the difference between the KV cache and prompt caching without merging them <!-- id: cost-02-prompt-caching-c01 energy: normal -->
- [ ] I can describe the relationship between them: prompt caching keeps KV state alive across requests <!-- id: cost-02-prompt-caching-c02 energy: normal -->
- [ ] I can explain why prefix matching is exact, and why one early change invalidates everything after it <!-- id: cost-02-prompt-caching-c03 energy: normal -->
- [ ] I can write the standard caching prompt layout from memory, with stable content first <!-- id: cost-02-prompt-caching-c04 energy: normal -->
- [ ] I have looked up the minimum cacheable length for my model rather than assuming one <!-- id: cost-02-prompt-caching-c05 energy: low -->
- [ ] I can explain why a cache write costs more than normal input and a read costs less <!-- id: cost-02-prompt-caching-c06 energy: normal -->
- [ ] I can derive the break-even reuse count and explain why prefix length cancels out of it <!-- id: cost-02-prompt-caching-c07 energy: high -->
- [ ] I can explain why TTL is measured from the start of a request, and what long generations do to reuse <!-- id: cost-02-prompt-caching-c08 energy: normal -->
- [ ] I can name at least five anti-patterns that silently destroy a cache <!-- id: cost-02-prompt-caching-c09 energy: normal -->
- [ ] I have hashed an assembled prompt and confirmed it is stable across logically identical runs <!-- id: cost-02-prompt-caching-c10 energy: normal -->
- [ ] I can explain segmented caching and which segments survive a document refresh <!-- id: cost-02-prompt-caching-c11 energy: normal -->
- [ ] I can describe the tension between retrieval order and cache stability, and how I would measure it <!-- id: cost-02-prompt-caching-c12 energy: high -->
- [ ] I can state where prompt caching stops working, including the case where it costs money <!-- id: cost-02-prompt-caching-c13 energy: normal -->
- [ ] I have dated every provider figure I recorded and noted that it will change <!-- id: cost-02-prompt-caching-c14 energy: low -->
- [ ] I have written the deliverable and included a prediction I got wrong <!-- id: cost-02-prompt-caching-c15 energy: high -->

## Quiz

### Q1. Which statement correctly separates the KV cache from provider prompt caching? <!-- id: cost-02-prompt-caching-q01 energy: normal -->

- [x] The KV cache is an automatic per-request inference mechanism, while prompt caching is a billed feature that reuses a prefix across requests
- [ ] The KV cache is billed per token, while prompt caching is free
- [ ] They are two names for the same mechanism at different scales
- [ ] The KV cache works across requests, while prompt caching works only within one

**Why:** The KV cache is how generation works at all and carries no separate charge. Prompt caching is a product layered on top of it that keeps that computed state alive between requests, with a defined TTL and separate prices for writes and reads. The relationship is layering, not rivalry.

### Q2. Your application prepends `Current time: <timestamp>` to a 5,000-token system prompt on every request. What happens? <!-- id: cost-02-prompt-caching-q02 energy: normal -->

- [ ] Nothing; caching matches on content anywhere in the prompt
- [x] Nothing after the timestamp can ever match, so you pay a write premium on every request and collect no reads
- [ ] Caching still works, but at half the discount
- [ ] Only the KV cache is affected; prompt caching is unaffected

**Why:** Prefix matching starts at the beginning and stops at the first divergence. A unique first token makes every request a brand-new prefix, so the cache is written and never read. This is the most common cause of a zero hit rate.

### Q3. Two requests share a 3,000-token prefix, and the provider's read multiplier is 0.1 while its write multiplier is 1.25. Using `N* = (w − 1) / (1 − r)`, what does the arithmetic say? <!-- id: cost-02-prompt-caching-q03 energy: high -->

- [ ] Caching is never worthwhile below 1,000 requests
- [ ] The prefix is too short to cache, so the arithmetic does not apply
- [x] Break-even is well under one reuse, so caching pays off from the first reuse
- [ ] You need exactly 1.25 reuses, since the write multiplier sets the count

**Why:** Substituting gives `(1.25 − 1) / (1 − 0.1) = 0.25 / 0.9 ≈ 0.28`, so any reuse repays the write premium. Note that the prefix length never entered the calculation — it cancels — so size changes the absolute saving, not the break-even count.

### Q4. Why does the prefix length `P` not appear in the break-even formula `N* = (w − 1) / (1 − r)`? <!-- id: cost-02-prompt-caching-q04 energy: high -->

- [ ] Because longer prefixes are always cached and shorter ones never are
- [ ] Because providers bill cached tokens at a flat rate regardless of count
- [x] Because `P` cancels when you divide both the cached and uncached cost by it
- [ ] Because the minimum cacheable length is the same for every model

**Why:** Both sides of the inequality scale linearly with `P`, so dividing through removes it. The consequence is counter-intuitive and useful: a longer prefix is worth more money to cache, but it is not easier or harder to justify. Only the provider's multipliers set the reuse count you need.

### Q5. A provider documents its cache lifetime as measured from the start of the request that writes or reads the entry. Why does this matter for an application with long, slow outputs? <!-- id: cost-02-prompt-caching-q05 energy: high -->

- [ ] It does not matter, because generation happens after the cache is written
- [ ] It matters only if the outputs exceed the minimum cacheable length
- [ ] It makes caching cheaper, since the cache is written once per session
- [x] Generation time counts against the window, so a slow response can leave almost no TTL for the next request

**Why:** If TTL is five minutes and a response streams for four, the following request has roughly a minute of warmth left. Same prefix, same provider, but a slower model or longer output produces a structurally worse hit rate. This is why measuring reuse within the window beats counting daily requests.

### Q6. Your retrieval step returns the same five documents each time but sorts them by a fluctuating relevance score. What is the effect on caching? <!-- id: cost-02-prompt-caching-q06 energy: normal -->

- [x] The reordering changes the token sequence, so the block stops being a stable prefix
- [ ] None, because the document content is identical across requests
- [ ] Caching improves, because sorting makes the prefix deterministic
- [ ] Only the first document needs to stay fixed for the cache to hold

**Why:** The cache compares token sequences, not meanings. A different ordering is a different sequence, so the block is no longer a prefix of what was stored. Stable content is not sufficient; stable *ordering* is required, which is why sorting by a floating-point score is a cache anti-pattern.

### Q7. Which of these is a reason to decide *against* enabling prompt caching? <!-- id: cost-02-prompt-caching-q07 energy: normal -->

- [ ] Your prefix contains tool definitions rather than prose
- [ ] Your provider supports explicit cache breakpoints
- [x] Your reuse within the TTL is below the break-even count `N*`
- [ ] Your prompts are longer than the provider's minimum cacheable length

**Why:** Below `N*` you pay the write premium and never recover it, so caching makes you slower and poorer simultaneously. Caching is a bet on reuse, and the reuse must be measured within the TTL window rather than assumed from total traffic.

### Q8. You refresh your knowledge base daily while instructions and tools stay unchanged. Which layout keeps the instructions warm across the refresh? <!-- id: cost-02-prompt-caching-q08 energy: normal -->

- [ ] Put the documents first, so they are always the freshest part of the prefix
- [ ] Put everything in one segment and let the provider decide the boundaries
- [ ] Put the changing documents in the middle, between tools and history
- [x] Put instructions and tools first with a breakpoint, then documents in a later segment

**Why:** A change at a breakpoint invalidates that segment and everything after it, but not the segments before it. Ordering by stability and placing breakpoints at the boundaries means a document refresh costs a write on the documents while the instructions stay cached.

## You're ready to move on when...

- You can explain the difference between the KV cache and prompt caching in one sentence each, and state how the two relate.
- You can write the standard caching prompt layout from memory, with stable content first and variable content last, and justify each position.
- You have looked up minimum cacheable length, write multiplier, read multiplier, and TTL for two providers, and you have dated the table.
- You can derive `N* = (w − 1) / (1 − r)` and explain why the prefix length cancels out of it.
- You can explain why TTL is measured from the start of a request, and what that does to an application with slow, long generations.
- You can name five anti-patterns that silently destroy a cache, and you have hashed an assembled prompt to prove yours is stable.
- You can describe the tension between attention-favouring retrieval order and cache-favouring stability, and say what you would measure to decide.
- You can state at least two situations where enabling caching would cost you money rather than save it.
- Your deliverable file exists at `portfolio/cost/02-prompt-caching.md` and includes a prediction you got wrong.

## Free vs Paid

Everything in this phase can be completed for **zero pesos**, and the most valuable parts of it cost nothing at all.

**What is genuinely free.** Every provider's prompt-caching documentation page is free to read without an account, and reading two of them side by side is the highest-value free activity in this phase — it is where you get the four constants that decide everything. Python and `tiktoken` are free and let you count tokens locally, so you can measure your own prefix lengths without spending a single token of credit. Tiktokenizer does the same in a browser with no install. vLLM's automatic prefix caching documentation shows the same idea implemented in open-source serving, and its PagedAttention design page connects this phase back to the KV cache. The break-even arithmetic in Part 5 is a formula and a calculator; it requires no API access whatsoever. And the deliverable is a Markdown file.

**What costs money, and whether you need it.**

- **Paid API access.** Needed only to *observe* a real cache hit in a usage report or response body, as in Task t06. The mechanism is fully explainable from the documentation, and the arithmetic is fully checkable on paper. If your beta access ends before you finish, Task t06 becomes a task you defer — not one that blocks the phase.
- **A provider's long-TTL or extended-cache tier.** Some providers sell longer cache lifetimes at a higher write price. This changes `w` in your formula and therefore raises `N*`. You do not need to buy it to understand it, and it is often the wrong purchase for low-traffic applications.
- **A monitoring or observability service.** Useful once you are running production traffic at volume, because it is how you track hit rate over time. For this phase, the cached-token field in a raw API response and a text log are enough.
- **A paid course on LLM cost optimisation.** As of early 2026 the provider documentation listed above is more current and more specific than any course can be, because it is the primary source and it is updated when prices change. Pay for structure or a certificate if you want them; not for the content.

**The honest budget:** ₱0, about 6–9 hours, and a text editor. If you have free access through a beta, use this week to *measure* rather than to guess — record your cached-token counts, hash your prefixes, and compute `N*` for your own workload while the experiment is free. When the beta ends, the only thing that changes is that a mistake now has a price. The understanding you build this week is what keeps the price small.
