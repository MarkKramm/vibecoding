---
id: found-03-tokens-and-context
track: foundations
phase: 3
order: 30
title: Tokens and the Context Budget
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/foundations/03-tokens-and-context.md
exit_criteria: >
  You can estimate the token cost of a piece of text before sending it, explain
  why input and output share one budget, and name the strategies you would use
  when the budget runs out - with the tradeoff of each.
---

# Phase 3 — Tokens and the Context Budget

## Goal of this phase

Learn the two numbers that govern everything you will ever do with a language model: **how much text you are sending**, measured in tokens, and **how much text the model can hold at once**, measured as a context window.

By the end of this phase you will be able to look at a block of text and estimate its token count within a useful margin, explain why that estimate is much worse for code, JSON, Filipino, and emoji than for plain English, and describe exactly what happens when you exceed the budget. You will also understand why a larger context window does not remove the problem — only moves it — and you will have four concrete strategies for working within the limit.

This is the most immediately practical phase in the Foundations track. Phase 1 explained what a model is doing; Phase 2 explained how it learned. This phase explains the resource it consumes when it runs, which is the resource you will be managing for the rest of the curriculum.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

| Day | Focus | Time |
|---|---|---|
| Mon | Read Parts 1–3 (what a token is, BPE, why the ratio varies) | 1–2h |
| Tue | Hands-on: measure token counts on your own text | 1–2h |
| Wed | Read Parts 4–6 (the budget, degradation, strategies) | 1–2h |
| Thu | Hands-on: build the budget calculator and break it deliberately | 1–2h |
| Fri | Finish the deliverable, take the quiz, review what you got wrong | 1–2h |

The reading is not long, but the *measurement* work is where the understanding lands. Do not skip the tasks — the whole point of this phase is that your intuitions about text length are wrong in ways you can only see by counting.

## Skills you'll gain

- Explain what a token is and why models do not process characters or words
- Explain byte-pair encoding at the level where you can predict what will tokenize badly
- Estimate token counts for English prose, code, JSON, and non-Latin scripts, with a stated margin of error
- Reason about why the same sentence costs more tokens in Filipino than in English
- Explain the context window as a single shared budget for input *and* output
- Explain, accurately, what the "lost in the middle" finding says and what it does not say
- Predict which parts of a long prompt will actually influence an answer
- Choose between chunking, summarisation, trimming, and retrieval for a given overflow problem
- Explain why "just use a bigger context window" is not a solution, using mechanisms rather than opinion

## Specific topics to learn

### Tokens

- Characters, words, and tokens: three different units, three different counts
- Byte-pair encoding: merging frequent pairs, and what that produces
- The vocabulary as a fixed, frozen artifact
- Why whitespace, capitalisation, and punctuation change the count
- The English ratio and its actual variance, not its average
- Why code, JSON, and markup tokenize worse than prose
- Why non-Latin scripts and emoji can cost several times more per character
- Special tokens: the ones you never type

### The context budget

- The context window as a maximum, not a target
- Input and output sharing one budget
- The prefill/decode split and why it matters for planning (forward reference to Phase 4)
- Growth of a conversation: quadratic cost in a naive chat loop
- What actually happens on overflow, across providers

### Degradation inside the window

- The "lost in the middle" finding, described as a finding
- Why attention is a limited resource even when the window is not full
- Distractors: long contexts that contain the answer and still fail
- Position bias and why your instructions' location matters

### Strategies

- Chunking: splitting by meaning, not by length
- Summarisation: lossy compression with a decision about what to lose
- Trimming: dropping history, and what breaks when you do
- Retrieval: fetching only what is relevant (forward reference to Track 4)
- Ordering: putting the important thing where it is read

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| OpenAI Tokenizer playground | See exactly how text splits into tokens, live | Free | https://platform.openai.com/tokenizer | Paste a paragraph of English, then the same paragraph in Filipino, and compare counts | Any open tokenizer demo, or the `tiktoken` Python package run locally |
| Google AI Studio | A free API key for real token counting on real requests | Free tier | https://aistudio.google.com/ | Send a long prompt and read the reported input/output token counts | Any provider's free tier that returns usage numbers |
| tiktoken (Python package) | Count tokens programmatically so you can measure a whole file | Free, open source | https://github.com/openai/tiktoken | Write a script that counts tokens across a folder of your own files | Hugging Face `transformers` tokenizers, or `tokenizers` Rust/Python bindings |
| Hugging Face Tokenizers docs | Understand how tokenizer training actually works | Free | https://huggingface.co/docs/tokenizers/index | Read the BPE section and reproduce a merge on paper | The original BPE paper and any public tokenizer config file |
| Ollama | Run a local model so you can experiment with zero metering | Free, open source | https://ollama.com/ | Run a small model locally and watch how prompt length changes response time | llama.cpp built from source |
| LibreOffice Calc | Build the budget calculator and run the calibration checks | Free, open source | https://www.libreoffice.org/ | Build the calculator from task 5 and record predicted vs actual counts | Google Sheets in any browser |

## Free/cheap resources

- **OpenAI — Tokenizer (interactive)** — https://platform.openai.com/tokenizer
- **Hugging Face — Tokenizers documentation** — https://huggingface.co/docs/tokenizers/index
- **tiktoken repository (open source tokenizer)** — https://github.com/openai/tiktoken
- **Andrej Karpathy — Let's build the GPT Tokenizer** — https://www.youtube.com/watch?v=zduSFxRajkE
- **Andrej Karpathy — Deep Dive into LLMs** — https://www.youtube.com/watch?v=7xTGNNLPyMI
- **Anthropic — Context windows (docs)** — https://docs.claude.com/en/docs/build-with-claude/context-windows
- **Anthropic — Long context prompting tips** — https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/long-context-tips
- **Google AI Studio** — https://aistudio.google.com/
- **Ollama** — https://ollama.com/

## Lesson: The Two Numbers That Govern Everything

### Part 1 — A token is not a word, and that matters more than it sounds

Here is the problem this phase exists to solve.

You want to know two things before you send anything to a model: *will it fit*, and *what will it cost*. Both questions have the same answer — a count of tokens — and you cannot answer either by looking at your text. You can count characters. You can count words. Neither is the number you need.

So people develop a habit: "a token is about four characters" or "a token is about three-quarters of a word". Both are true on average, for English prose, and both will mislead you badly the moment your text stops being English prose. The average is not the mechanism. This part gives you the mechanism, so you can predict when the average fails instead of being surprised by it.

**A token is a chunk of text that the model treats as one unit.** The model's first layer does one job: it converts your text into a sequence of integers, each an index into a fixed list called the **vocabulary**. Everything downstream — every attention operation, every cost calculation, every context limit — operates on that sequence. The model never sees your characters. It sees numbers, and those numbers are tokens.
**The vocabulary size is fixed when the model is built**, commonly 50,000 to 200,000 entries. As of early 2026 that range covers essentially all the models you are likely to use, but it has drifted upward over time and will keep drifting — check rather than assume.

Now the important part. **Which chunks become tokens is not decided by meaning, or by grammar, or by anything a human would choose.** It is decided by frequency, by an algorithm called byte-pair encoding.

> **The analogy:** think of BPE as a compression scheme that has memorised which letter sequences are common. It is useful for the intuition that frequent strings become single units, but retire it immediately, because it breaks in a specific way: compression schemes are designed to be reversed exactly. A tokenizer is applied to text in *conversation order*, with no lookahead, and must handle any byte sequence you can produce — including strings that never appeared in training. The analogy tells you why common things get merged. It tells you nothing about the boundaries, where the interesting failures live.

---

### Part 2 — How byte-pair encoding actually works

BPE is a compression algorithm from the 1990s that was borrowed for tokenization. The training procedure is startlingly simple.

**Step 0.** Start with a base vocabulary of single bytes. Not characters — bytes. This is what makes modern tokenizers robust: any text you can encode as UTF-8, which is any text at all, can be represented as bytes, so no input is ever "unknown". If a tokenizer has never seen a particular emoji, it encodes it as three or four individual bytes.

**Step 1.** Look at a large training corpus. Count every adjacent pair of symbols.

**Step 2.** Find the most frequent pair. Merge it into a new single symbol, and add that symbol to the vocabulary.

**Step 3.** Repeat several thousand times.

That is the whole algorithm — greedy, frequency-driven, with no notion of what a word is. Let me run it on a toy corpus so you see the mechanic, not just the description.

```text
Corpus: "low lower lowest low"

Start, characters only:
  l o w _ l o w e r _ l o w e s t _ l o w

Count adjacent pairs:
  (l,o) appears 4 times   <- most frequent
  (o,w) appears 4 times
  (w,_) appears 3 times
  (_ ,l) appears 3 times
  ...

Merge (l,o) -> "lo". Vocabulary now has "lo".
  lo w _ lo w e r _ lo w e s t _ lo w

Recount. Now (lo,w) appears 4 times. Merge it.
  low _ low e r _ low e s t _ low

Recount. (low,_) appears 3 times, (e,r) appears 1...
  Merge (low,_) -> "low_"

And so on. After enough merges you get:
  low_ low er_ low est_ low
```

Look at what just happened. The corpus contained the words *low*, *lower*, and *lowest*. The tokenizer did not learn "these are related words". It learned that `low` is a frequent string and that `er` and `est` are frequent strings. The word *lower* is now two tokens: `low` and `er`. The word *lowest* is also two tokens: `low` and `est`.

**This is why the vocabulary is full of fragments.** Real tokenizers end up with entries like `ing`, `tion`, ` pre`, `ization`, `</`, `());`, and `\n\n`. These are not linguistic units. They are the highest-frequency byte sequences in the training corpus, and that corpus is mostly English web text and code.

Now you can predict things.

**Prediction 1: whitespace is a token boundary, and leading spaces matter.** In most tokenizers the space attaches to the *following* token, not the preceding one, so ` the` and `the` are usually different tokens. Trimming, re-indenting, or changing a space can change your token count without changing your meaning.

**Prediction 2: common English words are usually one token.** `the`, `and`, `of`, `time`, `people`. Common *phrases* sometimes become one token — a frequent bigram or short stock phrase may be a single vocabulary entry.

**Prediction 3: rare words shatter.** A long technical term, a surname, a place name the tokenizer rarely saw, a made-up product name — these break into fragments. A fifteen-character unfamiliar word might be five or six tokens; a fifteen-character common word might be two.

**Prediction 4: the count depends on the tokenizer, not the text alone.** Two models can tokenize the same sentence into different numbers of tokens. If you are estimating cost across providers, use each provider's own tokenizer. As of early 2026, essentially every major provider publishes or ships a tokenizer you can run locally — but tool names and availability change, so check rather than assume.

**One more category: tokens you never type.** Tokenizers also reserve **special tokens** — entries that carry structural meaning rather than text, marking where a system instruction ends, where a user turn begins, where a document boundary sits, or where the model should stop. They are inserted by the software around the model, not by you, and they consume budget like anything else. This is a large part of why the fixed overhead from Part 4 exists, and it is why "my text was only 500 tokens" and "the request reported 900 tokens" are both true.

**Where the "pieces of words" framing stops working.** People often say tokens are "word pieces". That is roughly right for alphabetic languages and wrong for the rest. For Chinese, Japanese, and Korean, a character often carries a whole word's worth of meaning, and a common character may be one token. For a low-resource language barely represented in the training corpus, a tokenizer built mostly from English has few useful merges, so words get encoded as individual bytes — one character can cost two, three, or four tokens. The framing "tokens are pieces of words" quietly assumes the tokenizer was trained on your language. Check that before relying on it.

---

### Part 3 — The ratio, and why you should not trust it

The rule of thumb you will see everywhere is: **one token is about three-quarters of an English word**, or equivalently, **about four characters of English text**.

Here is where that number comes from, and here is exactly how it fails.

For ordinary English prose — a news article, an essay, a chat message — the ratio holds well. A 1,000-word English document usually lands somewhere in the region of 1,300 to 1,400 tokens. If you remember "words × 1.3" for rough planning, you will not be badly wrong.

For anything else, it collapses. The table below gives the *shape* of the failure. Treat the numbers as illustrative ranges, not measurements — they vary by tokenizer, and the whole point is that you should measure your own text rather than trust a table.

| Content type | Rough tokens per 1,000 characters | Why |
|---|---|---|
| Plain English prose | ~250 | Frequent words and common morphemes are single tokens; the tokenizer was trained on this |
| English with heavy jargon | ~350–450 | Domain terms are rare in the corpus, so they fragment |
| Source code (Python, JS) | ~300–400 | Indentation is whitespace tokens; identifiers are often camelCase or snake_case fragments; short punctuation is nearly always its own token |
| Minified JSON | ~450–600 | Quoting, braces, colons, and commas every few characters; long runs of punctuation tokenize as single characters |
| Filipino / Tagalog | ~400–600 | Genuine under-representation in the training corpus; common affixes like *nag-*, *-han*, *pinag-* may not exist as single tokens |
| Chinese, Japanese, Korean | ~400–700 | Mixed: common characters may be one token each, rarer ones cost two or three |
| Emoji and symbols | Very high, hundreds of tokens per 1,000 characters | Each emoji is several bytes, and byte-level fallback means each byte can be its own token |

Read that table as a set of predictions, then verify it on your own text — that is task 2. The lesson's point does not depend on any single number in it being exactly right. The point is that **the spread between the best and worst case in that table is roughly a factor of three**, so a planning estimate built on English prose will be wrong by a factor of two or three for a Filipino user sending JSON with emoji.

That is not a rounding error. If you budget a context window or a cost on the assumption of 250 tokens per 1,000 characters and you are actually sending 600, you will run out of room at less than half the length you planned for.

**Concrete arithmetic.** Suppose you have a 5,000-character Filipino document with some JSON embedded, and you want to estimate.

```text
Worst mistake: assume English prose
  5,000 chars / 4 chars-per-token  =  1,250 tokens

Better: use the table's range for Filipino + JSON
  Low  estimate:  5,000 * 0.40  =  2,000 tokens
  High estimate:  5,000 * 0.60  =  3,000 tokens

So your honest answer is: "somewhere between 2,000 and 3,000 tokens,
probably near 2,500 - and I will confirm rather than guess."
```

Note what the honest answer looks like: a range, with the confidence stated. That is what a competent practitioner says. "About 1,250" is what someone who learned only the English rule of thumb says, and they would be off by more than half.

#### Why this matters for cost and limits

Two consequences, and both are load-bearing for the rest of the curriculum.

**Cost.** Nearly every commercial API prices by token, with input and output priced separately — output usually costs more, because generating tokens is computationally heavier per token than reading them (Phase 4 explains that asymmetry). Prices change on a scale of weeks, so this lesson quotes none. The durable fact is the *shape*: your bill is a function of token counts you can estimate and control, and the biggest lever is not the price per token — it is how many tokens you send. Track 7 is entirely about that lever.

**Limits.** A model has a hard maximum number of tokens it can process in one request. That maximum is the context window, and it is the subject of the next part.

> **The mistake to avoid here.** Do not walk away thinking "tokens are just a pricing unit". They are the model's actual input representation. Everything the model does — every pattern it can notice, every instruction it can follow, every fact it can use — has to survive the trip through that integer sequence. When text tokenizes badly, the model is not merely paying more; it is receiving a *choppier* view of your text, where meaningful units have been split across token boundaries. This is one honest reason non-English performance can trail English performance on the same model, independent of how much the model "knows".

---

### Part 4 — The context window is one shared budget

Now the second number.

**The context window is the maximum number of tokens a model can process in a single request, counting everything: your instructions, the conversation history, any documents you pasted, and the model's own output.**

The "and its own output" part is the one people miss, and it is the part that causes real failures. Input and output do not get separate allowances. They draw from the same pool.

```text
A model with a context window of N tokens, handling one request:

  [ system prompt ][ conversation history ][ your message ][ ...room... ]
                                                                  |
                                                                  v
                                                    [ its response goes HERE ]

  Everything above the line is input. The response is written into
  whatever space is left. If the input is 95% of N, the response has
  5% of N to work with.
```

This produces a failure mode that looks mysterious until you have the model of it: you paste a huge document, ask a question, and the answer is abruptly truncated mid-sentence. The model did not "decide" to stop. It ran out of the shared budget.

Every provider exposes this differently, and the specifics are volatile. As of early 2026, common behaviours include: rejecting the request with an error if the input alone exceeds the window; accepting it but capping generation at a smaller max-output setting; or silently truncating the oldest part of your input. **Which you get depends on the provider and the endpoint, and it has changed repeatedly — test it rather than assuming, because silent truncation is the dangerous one.** If history is dropped without telling you, your prompt appears to work and quietly answers a different question than the one you asked.

#### The conversation growth trap

Here is the arithmetic that catches nearly everyone building their first chat loop.

Suppose every message in a conversation is 200 tokens, and the model's reply is also 200 tokens.

```text
Turn 1: send [m1]                      -> 200 in,  200 out
Turn 2: send [m1, r1, m2]              -> 600 in,  200 out
Turn 3: send [m1, r1, m2, r2, m3]      -> 1000 in, 200 out
Turn 4:                                 -> 1400 in, 200 out
Turn n:                                 -> 200n in (roughly)

Total tokens billed across 20 turns:
  200 * (1 + 2 + 3 + ... + 20)  =  200 * 210  =  42,000 tokens
  ...to have a conversation whose actual content is 20 * 400 = 8,000 tokens
```

Because the model is stateless — Phase 1 established this — you resend the *entire* conversation on every turn. So the cost of a conversation grows with the square of its length, not linearly. Turn 20 costs twenty times what turn 1 cost, for the same new information.

This is also why long chats eventually fail. At some point the accumulated history alone approaches the window, leaving no room for a response. Every chat product has some strategy for this — summarising old turns, dropping them, or starting a new thread — and each is lossy in a way worth understanding. That is the rest of this phase.

#### What fills the budget that you did not write

Before you can manage a budget, you need to know what is spent without your knowledge. In a chat product, the system prompt alone may occupy a substantial number of tokens — product instructions, tool definitions, formatting rules, safety guidance. In a tool-using system, every tool's description and parameter schema is in the context on every call. In a retrieval system (Track 4), the documents pulled in can dwarf your actual question by a factor of fifty.

A useful discipline: **your question is usually the smallest part of your prompt.** When something overflows, look at the fixed overhead first, not the sentence you typed.

> **Where "it is a budget" stops being a good analogy.** Budgets are about money, and money is fungible — a peso saved in one category can be spent in another, and only the total matters. The context window is not like that. Position matters, and content interacts. Two prompts with identical token counts can behave completely differently depending on where the important instruction sits and how much irrelevant material surrounds it. Spend your tokens in the right *place*, not just in the right *amount*. The next part is about why.

---

### Part 5 — Large windows do not mean uniform attention

This is the part that separates people who have read about context windows from people who understand them.

**The finding.** In 2023, researchers studying how well language models use long inputs reported a consistent pattern: when the relevant information sat at the **beginning** or the **end** of a long context, models performed noticeably better than when the same information sat in the **middle**. Performance traced a U-shaped curve across position.

This became known as **"lost in the middle"**. I am describing it as a *finding from a study on the models available at that time* — not as a law of nature. Two honest caveats:

1. **It is empirical, not architectural.** Nothing in the design of a transformer requires the middle to be worse. It is an observed behaviour of trained models on a benchmark task.
2. **It has been partially mitigated and it varies.** Later models and training methods have improved at long-context use, and different models show the effect to different degrees. As of early 2026, the effect is weaker and less universal than in the original study, but it has not disappeared, and **the magnitude reported for any current model will be out of date by the time you read this.** Do not memorise a number. Test your own model on your own task.

The lesson's point survives all of that, because the point is not the number:

> **A model's ability to use information is not uniform across the context. "It fits" and "it will be used" are different claims.**

#### Why this happens, mechanistically

You need a mechanism, not just a caveat, or you will treat this as a superstition.

Attention is how a model moves information between positions — Phase 4 covers it properly, but the relevant shape is this: at every layer, each position computes how much to draw from every other position, and the result is a weighted average. A model with a very long context has an enormous number of candidates to average over.

Three things follow, and none of them require the middle to be specially cursed:

- **The budget of attention is finite per position.** A position can only attend to so much before the average becomes a blur. With 200 relevant tokens among 100,000, the signal competes against a great deal of noise.
- **Training distribution matters.** Models are trained on text where beginnings and endings carry disproportionate weight — abstracts, introductions, conclusions, the last message in a chat. Behaviour follows training.
- **Recency is reinforced by how chat data looks.** The latest message is usually the one that matters, so the model develops a strong bias toward it.

Two more effects you will observe, both consistent with the above:
- **Distractors actively hurt.** Long contexts that contain the answer *and* a lot of superficially similar material often perform worse than short contexts containing only the answer. It is not just dilution; similar-looking text competes for attention.
- **Ordering changes outcomes at fixed token count.** Moving your instruction from the middle to the end can change the answer without changing a token of content. Your token count was identical; your result was not.

#### What this lets you predict

- If you paste a 50-page document and ask a question about something in the middle, expect a worse answer than the same question about page 1 or page 50 — especially if the document contains repeated similar structures (contracts, logs, transcripts).
- If your system prompt contains a critical instruction and you then paste a long document, the instruction's influence is diluted. Repeat the critical constraint *after* the document.
- If you add "distractor" documents to be helpful, you may make it worse. Relevance beats volume.
- If a model with a 200,000-token window and a model with a 20,000-token window both fit your input, the smaller one is not automatically worse. Fitting everything is not the goal; fitting the *right* thing is.

> **Where the U-curve framing stops working.** It is a summary of average behaviour on a particular kind of task — find a fact in a long document. It is not a rule about where to put things in a prompt of 500 tokens, where the effect is negligible, and it is not a claim that the middle is *worthless*. If the middle contains the only relevant information and the ends contain none, the middle obviously still matters. Position is a factor, not a verdict.

---

### Part 6 — Managing a budget you cannot expand

You have three inputs to this decision: how many tokens you are sending, how many the model will accept, and how much of that it will actually use. The first you control. The second you can look up, but it moves. The third you must test.

Here are the four real strategies, and what each costs you.

#### Strategy 1 — Chunking

**What it is.** Split the material into pieces small enough to handle, and work on pieces.

**The mechanism.** Since the budget is per-request, sending one 200,000-token document is impossible if the window is 100,000, but sending forty 5,000-token chunks in forty requests is trivial. The model never sees the whole thing; you assemble the results.

**The decision that matters.** *Where you cut.* Cutting by character count slices sentences, tables, and code blocks in half — and because tokenization is not character-aligned, a boundary through the middle of a word or a JSON object is genuinely damaging. Cut on structure: paragraph boundaries, headings, function definitions, records. Track 4 goes deep on this because chunking is retrieval's foundation.

**The failure mode.** You lose cross-chunk context. A question whose answer requires joining chunk 3 and chunk 37 will not be answered by either chunk alone, however good the model is. Chunking solves the budget problem by refusing to solve the connection problem.

**Cost to you.** More requests, more code, and a new failure mode to test for.

#### Strategy 2 — Summarisation

**What it is.** Replace the verbatim content with a shorter version produced by a model, then work from the summary.

**The mechanism.** Compression. You trade fidelity for space, and the trade is *lossy in a way you did not choose* — the model decides what mattered, using the same judgement you are trying to support.

**Where it genuinely works.** Rolling conversation summaries in a long chat. Compressing a transcript where you need the gist. Condensing several documents into a briefing before a decision.
**The failure mode, and it is the sharp one.** The detail you need later may be the detail the summary dropped. A contract summary that keeps the parties and the value but drops the termination clause has destroyed the one sentence you needed. Summarisation is a bet that you know what matters in advance. You usually do not.

**Mitigation.** Keep the original. Summarise for *navigation*, not *replacement* — use the summary to decide which verbatim chunks to pull back in.

#### Strategy 3 — Trimming

**What it is.** Drop content by rule, without asking a model. Keep the last N turns. Drop tool outputs older than M steps. Remove the retrieved documents that scored below a threshold.

**The mechanism.** Deterministic deletion. Cheap, predictable, and transparent in a way summarisation is not.

**Where it genuinely works.** Chat history, where old turns are less likely to matter. Agent loops, where old tool outputs are stale by construction. Any case where you can state the rule clearly.

**The failure mode.** Conversations and agent trajectories have long-range dependencies. If the user said "always respond in Filipino" at turn 2 and you trim at turn 10, the instruction vanishes and the behaviour changes with no error message. In agents, dropping an early tool result often makes the model repeat work it already did, costing more than you saved.

**Mitigation.** Trim the expendable, pin the durable. System instructions, key constraints, and the user's original goal should be protected explicitly rather than surviving by luck.

#### Strategy 4 — Retrieval

**What it is.** Do not put everything in the context. Store it elsewhere, and at request time fetch only the small number of pieces that look relevant to *this* question.

**The mechanism.** You replace a fixed, always-present context with a dynamic, query-dependent one. The document collection can be arbitrarily large, because it lives outside the window. The window holds only the handful of passages that matter.

**Why it is the interesting one.** It is the only strategy that scales without loss for questions where relevance is *local* — answerable from a few passages. It is also the only one whose selection step can be evaluated separately from generation, which makes retrieval engineering a discipline rather than a hope.

**The failure mode.** Retrieval can fetch the wrong things. When it does, the model answers confidently from irrelevant context, and the failure looks like a model failure when it is a search failure. Questions requiring synthesis across many documents are also badly served: if the answer needs all forty passages, retrieving three does not help.
**Cost to you.** Real infrastructure — embeddings, an index, a similarity search — and a new evaluation problem. Track 4 exists for this.

**The selection rule.** Use this to choose rather than agonising:

| Situation | Strategy | Why |
|---|---|---|
| Material is a fixed corpus, questions are local | **Retrieval** | Scales to any size, no loss for local questions |
| Material is a conversation that keeps growing | **Summarise old + trim expendable + pin instructions** | Long-range dependencies are real; don't drop goals |
| Material is one document, too big to fit | **Chunk**, then retrieve or map over chunks | There is no way to fit it; structure the cut |
| Material is an agent's tool history | **Trim by recency, keep the original goal pinned** | Old tool output is stale by construction |
| Material fits, but the answer quality is poor | **None of the above** — it is a positioning or distractor problem | Check Part 5 before spending effort on compression |

That last row is the one people get wrong. Reaching for chunking when the real problem is an instruction buried under three irrelevant documents is a lot of engineering for nothing.

#### Why "just use a bigger context window" is not a solution

This is the belief this phase most wants to remove, so let me argue it properly rather than dismissing it.

**It does not remove the budget; it raises the ceiling.** Your conversation still grows quadratically, your documents are still unbounded, and your agent's tool history still accumulates. If input grows faster than the window, the window will be exceeded eventually. A bigger window changes *when* you hit the problem, not *whether*.

**It is expensive per token, and cost scales with what you send.** Sending 100,000 tokens of mostly irrelevant context on every request means paying for 100,000 tokens on every request — per call, not once. Padding your prompt is a recurring charge for material the model mostly does not use.

**It does not fix degradation.** Part 5's finding is precisely that a larger window does not come with a proportionally larger ability to use it. Fitting more in does not mean getting more out. If anything, a bigger window makes it easier to build a prompt that mostly fails, because it removes the pressure that would have forced you to select.

**It is slower.** More input tokens means more work before the first output token appears — a direct consequence of how inference works (Phase 4: prefill processes the whole input before generation starts). For anything interactive, latency is a feature and long prompts cost it.

**It hides relevance problems rather than solving them.** If you cannot say which three passages matter, you do not have a retrieval quality problem you can measure — only an implicit hope that the model will sort it out. Systems built on that hope break unpredictably and leave no diagnostic.

**What a bigger window *is* good for.** It is genuinely useful — a one-off analysis of a large document where you can afford the tokens and latency, tasks that truly need global view, and a safety margin so normal operation never hits the edge. Use it as headroom, not as a strategy: headroom absorbs spikes; a strategy handles the steady state.

---

### Part 7 — Estimating, as a working habit

Put the pieces together into something you can actually do in ten seconds.

```text
1. Identify the content type.
   English prose? Use ~1.3 tokens per word.
   Code, JSON, or markup? Use ~1 token per 3 characters or worse.
   Non-Latin script or heavy emoji? Assume 2-4x your English instinct.

2. Add the fixed overhead you did not write.
   System prompt, tool schemas, special tokens, pinned instructions.
   In a chat product this is invisible; assume it is not zero.

3. Add the conversation history, if this is turn n of a chat.
   Roughly (average turn size) x (n) - and remember it is growing.

4. Compare against the window, and subtract your expected output length.
   The output comes out of the same pool. If you want a 2,000-token
   answer, that 2,000 is part of your total.

5. State your answer as a range and say you will confirm it.
```

**Step 5 is the discipline.** Confirm the estimate with a real tokenizer before you ship. The reason this phase made you do the arithmetic by hand is so the judgement becomes fast and roughly right — and so you know when an estimate is uncertain enough to measure.

**The habit that matters most.** Measure once, then reason from the measurement. Counting tokens for every payload is absurd; counting tokens for *one representative payload* of each type you send gives you a calibrated multiplier you can reuse for months. That is the difference between a rule of thumb you inherited and one you own.

---

## Hands-on practice tasks

1. Paste a 200-word paragraph of English into an online tokenizer and record the token count. Divide characters by tokens and write down your personal ratio. <!-- id: found-03-tokens-and-context-t01 band: quick energy: low -->
2. Take the same 200-word paragraph and run it through the tokenizer, then a Tagalog translation of the same paragraph, then a JSON version of the same information, then the same text with emoji added. Record all four token counts and compute the ratio between the cheapest and the most expensive. <!-- id: found-03-tokens-and-context-t02 band: focused energy: normal -->
3. Find a tokenization surprise: a single short word, name, or string that splits into five or more tokens. Explain why, in terms of frequency in the training corpus. <!-- id: found-03-tokens-and-context-t03 band: quick energy: low -->
4. Write a script (or use a tokenizer tool by hand) that counts tokens over a folder of your own files — notes, code, whatever you have. Report the total, and the count for the largest single file. <!-- id: found-03-tokens-and-context-t04 band: focused energy: normal -->
5. Build a budget calculator in a spreadsheet: input cells for words, content-type multiplier, history turns, average turn size, and desired output length; output cell for total estimated tokens. Then check it against a real tokenizer three times and adjust the multipliers until your error is under 15 percent. <!-- id: found-03-tokens-and-context-t05 band: deep energy: high -->
6. Deliberately overflow a context window. Take a long document, pad it until the request fails or the output truncates, and document exactly what the provider did — error, truncation, silent drop. Record the observable symptom of each. <!-- id: found-03-tokens-and-context-t06 band: deep energy: high -->
7. Run the position test: take a document with one clear answer inside it and ask the same question three times, placing the answer at the start, the middle, and the end. Compare the three answers. Repeat with a second document to check the pattern is not a fluke. <!-- id: found-03-tokens-and-context-t07 band: deep energy: high -->
8. Run the distractor test: ask a question with only the relevant passage in context, then ask it again with five irrelevant passages of similar length added. Compare quality, not just correctness. <!-- id: found-03-tokens-and-context-t08 band: focused energy: normal -->
9. Take a long chat you have actually had and estimate what proportion of its final context was your words versus accumulated history. Then start a fresh chat with a hand-written summary of the old one and note what you lost. <!-- id: found-03-tokens-and-context-t09 band: focused energy: normal -->
10. Write four short paragraphs — one per strategy from Part 6 — describing a situation where that strategy is the right choice, and one situation where it fails. Your own examples, not the lesson's. <!-- id: found-03-tokens-and-context-t10 band: focused energy: normal -->
11. Measure the same prompt sent to two different models or providers and record the reported input token counts. Note the difference and what it implies for cross-provider cost estimation. <!-- id: found-03-tokens-and-context-t11 band: focused energy: normal -->
12. Keep a running token log for one week: every time you send something substantial to a model, note the estimated and (if available) actual token count. Keep this as an ongoing habit rather than a one-off task. <!-- id: found-03-tokens-and-context-t12 band: ongoing energy: low -->

## Common Pitfalls

**Using the English rule of thumb for everything.** "Four characters per token" is a statement about English prose as tokenized by a typical English-heavy tokenizer. Applied to JSON, code, or Filipino it can be wrong by more than a factor of two. Measure your own content type once and carry your own number.

**Forgetting that output shares the budget.** People budget the input carefully and then wonder why answers truncate. Reserve your expected output length *before* you decide how much input to send.

**Believing a bigger window removes the need to manage context.** It raises the ceiling and does not change the slope. Conversations still grow quadratically, corpora are still unbounded, and degradation inside the window is still real.

**Treating "it fits" as "it will be used."** The most expensive mistake in this phase. A prompt that fits and a prompt that works are different prompts, and the difference is usually position and relevance, not length.

**Cutting chunks by character count.** Because tokenization is not character-aligned, a character-count cut lands in the middle of words, code blocks, and JSON objects. Cut on structure.

**Summarising without keeping the original.** A summary is a decision about what matters, made by something that does not know your downstream question. Keep the source.

**Trimming instructions along with history.** If you drop turns by recency, anything durable that was stated early disappears silently. Pin what must survive; do not rely on it surviving the trim.

**Assuming the system prompt is free.** In a chat product it can be thousands of tokens you never see. In an agent, tool schemas are re-sent on every call. Your question is often the smallest thing in your prompt.

**Estimating once with an English ratio and never checking.** A single measurement of a representative payload gives you a calibrated multiplier. Skipping that measurement means every future estimate inherits the error.

**Confusing token count with information content.** A verbose prompt and a dense prompt can cost the same and perform very differently. Tokens measure the bill, not the quality.

## Deliverable / proof of work

Write `portfolio/foundations/03-tokens-and-context.md` containing:

- **Your tokenization table** from tasks 1 and 2 — the same content in English, Tagalog, JSON, and with emoji, with real counts, the ratio between cheapest and most expensive, and one sentence explaining the mechanism behind the gap
- **Your budget calculator**, as a copy of the spreadsheet contents or the script, with the three calibration checks from task 5 showing predicted versus actual
- **Your overflow log** from task 6 — what you sent, roughly how many tokens, what the provider did, and what an unattended system would have done with that failure
- **Your position and distractor results** from tasks 7 and 8, written as a claim you are willing to defend: "in my testing, placing X at position Y changed the result in this way"
- **A decision table** with five realistic situations from your own work or study, each with the strategy you would choose, the tradeoff you are accepting, and what would tell you the choice was wrong
- **A section titled "My working numbers"** — the three or four token ratios you personally measured, stated with their approximate uncertainty, so that six months from now you know where they came from

## Checklist

- [ ] I can explain what a token is without saying "a piece of a word" <!-- id: found-03-tokens-and-context-c01 energy: low -->
- [ ] I can describe byte-pair encoding as a merge procedure rather than a linguistic rule <!-- id: found-03-tokens-and-context-c02 energy: normal -->
- [ ] I can explain why the tokenizer starts from bytes rather than characters <!-- id: found-03-tokens-and-context-c03 energy: normal -->
- [ ] I can predict which words will shatter into many tokens and why <!-- id: found-03-tokens-and-context-c04 energy: normal -->
- [ ] I know my own measured tokens-per-word ratio for English prose <!-- id: found-03-tokens-and-context-c05 energy: low -->
- [ ] I can explain why the same paragraph costs more tokens in Filipino or Chinese than in English <!-- id: found-03-tokens-and-context-c06 energy: normal -->
- [ ] I can explain why JSON and code cost more per character than prose <!-- id: found-03-tokens-and-context-c07 energy: normal -->
- [ ] I can state the context window as a shared budget for input and output <!-- id: found-03-tokens-and-context-c08 energy: low -->
- [ ] I can explain why a chat conversation's cost grows faster than its length <!-- id: found-03-tokens-and-context-c09 energy: high -->
- [ ] I can describe the lost-in-the-middle finding accurately and say what it does not claim <!-- id: found-03-tokens-and-context-c10 energy: high -->
- [ ] I can name one mechanism that would produce non-uniform use of a long context <!-- id: found-03-tokens-and-context-c11 energy: high -->
- [ ] I can explain why distractors can hurt even when the answer is present <!-- id: found-03-tokens-and-context-c12 energy: normal -->
- [ ] I can choose between chunking, summarisation, trimming, and retrieval for a given overflow problem <!-- id: found-03-tokens-and-context-c13 energy: normal -->
- [ ] I can name the failure mode of each of the four strategies <!-- id: found-03-tokens-and-context-c14 energy: high -->
- [ ] I can argue why a larger context window is headroom rather than a strategy <!-- id: found-03-tokens-and-context-c15 energy: normal -->
- [ ] I have deliberately overflowed a context window and documented what happened <!-- id: found-03-tokens-and-context-c16 energy: normal -->
- [ ] I have a written decision table mapping situations to strategies <!-- id: found-03-tokens-and-context-c17 energy: normal -->
- [ ] I can estimate the token count of a new payload within 20 percent before measuring it <!-- id: found-03-tokens-and-context-c18 energy: high -->
- [ ] I know which parts of a long prompt do not depend on position <!-- id: found-03-tokens-and-context-c19 energy: normal -->
- [ ] I can explain why token count and information content are different things <!-- id: found-03-tokens-and-context-c20 energy: normal -->

## Quiz

### Q1. A model returns a long, detailed answer that stops mid-sentence with no error. What most likely happened? <!-- id: found-03-tokens-and-context-q01 energy: normal -->

- [ ] The model crashed and the provider returned a partial buffer
- [ ] The model decided the answer was complete
- [x] The input plus the generated output reached the context window limit, so generation had to stop
- [ ] The answer exceeded a copyright filter

**Why:** Input and output share one budget. When the running total reaches the window maximum, generation stops wherever it happens to be. Nothing signalled a problem because nothing went wrong — the budget was simply exhausted. Reserving expected output length before sizing your input prevents this.

### Q2. You send a 5,000-character Filipino document with embedded JSON and estimate 1,250 tokens using "four characters per token". What is the likely direction and size of your error? <!-- id: found-03-tokens-and-context-q02 energy: high -->

- [ ] Roughly correct — the ratio holds across languages
- [ ] Slightly over — English ratios overestimate other content
- [ ] Slightly under, by around 10 percent
- [x] Substantially under — likely by a factor of two or more, because Filipino and JSON both tokenize far worse than English prose

**Why:** The four-characters-per-token rule describes English prose as seen by an English-heavy tokenizer. Under-represented languages get few useful merges so words fragment toward bytes, and JSON spends tokens on punctuation and quoting. The two effects compound. Estimate a range, then measure the real count before you budget on it.

### Q3. In a twenty-turn chat where each message is 200 tokens and each reply is 200 tokens, why is the total billed input far larger than the total content? <!-- id: found-03-tokens-and-context-q03 energy: high -->

- [ ] The provider caches and re-bills previous turns
- [ ] The model internally re-reads its own weights on each turn
- [x] The model is stateless, so the entire conversation is resent as input on every turn, making cost grow roughly with the square of the length
- [ ] Each reply is billed twice, once as output and once as input

**Why:** Every request is a complete, self-contained computation. Turn n sends all n−1 prior exchanges plus the new message, so the sum over turns grows quadratically. This is also why long chats eventually run out of window — the history itself consumes the budget.

### Q4. A study reported that models use information at the start and end of a long context better than information in the middle. Which statement is most accurate? <!-- id: found-03-tokens-and-context-q04 energy: high -->

- [ ] It is a proven architectural property of transformers, so it will always hold
- [ ] It means information in the middle of a context is never used
- [ ] It was measured once and has been replicated identically on every model since
- [x] It is an empirical finding on models available at the time, mitigated to varying degrees since, and should be re-tested on your own model and task

**Why:** The U-shaped curve came from benchmarking, not from the architecture. Later training and models have reduced it without eliminating it, and the magnitude you read about is dated the moment it is published. The durable point is that fitting inside a window and being used by the model are different claims.

### Q5. You have a 100,000-token corpus and questions that are almost always answerable from two or three passages. Which strategy fits best? <!-- id: found-03-tokens-and-context-q05 energy: normal -->

- [ ] Send the whole corpus, since modern windows can hold it
- [ ] Summarise the corpus into 5,000 tokens and answer from the summary
- [x] Retrieve only the relevant passages per question, because relevance here is local
- [ ] Trim the corpus to the first 20,000 tokens

**Why:** Retrieval scales to any corpus size without loss when relevance is local, and it is the only strategy whose selection step can be evaluated separately from generation. Sending everything costs on every request and invites distractor effects. Summarising discards the exact wording that answers a specific question, and trimming by position discards arbitrarily.

### Q6. Why does adding five irrelevant documents to a prompt that already contained the answer sometimes make the answer worse? <!-- id: found-03-tokens-and-context-q06 energy: high -->

- [ ] The added documents push the total past the context window
- [x] Attention is a finite resource per position, and superficially similar material competes with the relevant passage for it
- [ ] The model gets confused about which document is the user's question
- [ ] Providers apply penalties for oversized prompts

**Why:** Distractor content does not merely dilute; similar-looking text actively competes when the model forms its weighted average over positions. Performance on long contexts that contain the answer and many near-misses is often worse than on short contexts containing only the answer. Relevance beats volume.

### Q7. Which statement best explains why a larger context window does not solve context management? <!-- id: found-03-tokens-and-context-q07 energy: high -->

- [ ] Larger windows are slower to download
- [ ] Larger windows are only available on paid tiers
- [ ] Larger windows use a different tokenizer that counts more accurately
- [x] It raises the ceiling but not the slope — unbounded inputs still grow past it, and cost, latency, and non-uniform use all scale with what you send

**Why:** A conversation still grows quadratically and a corpus is still unbounded, so a bigger window changes when the limit is reached rather than whether. Meanwhile you pay per token on every request, wait longer for the first output token, and still face non-uniform use of the window. Headroom absorbs spikes; it is not a strategy.

### Q8. Which of these tokenizes worst per character, and why? <!-- id: found-03-tokens-and-context-q08 energy: normal -->

- [ ] A paragraph of common English words
- [ ] A paragraph of ordinary English with some proper nouns
- [x] A minified JSON blob densely packed with quotes, braces, commas, and colons
- [ ] A paragraph of technical English with long domain terms

**Why:** BPE merges whatever is most frequent in the training corpus. Prose made of common words merges into single tokens. Minified JSON is mostly punctuation, and punctuation sequences that rarely appeared as units in training remain as individual tokens, so a few characters can consume several tokens. Jargon costs more than common English but far less than dense punctuation.

### Q9. You need to keep a long agent session under budget. Which approach is most defensible? <!-- id: found-03-tokens-and-context-q09 energy: normal -->

- [ ] Summarise everything older than the last two steps
- [ ] Drop the oldest 50 percent of tokens at regular intervals
- [ ] Send only the most recent tool output and nothing else
- [x] Trim stale tool output by recency while explicitly pinning the original goal and durable constraints

**Why:** Old tool output is stale by construction, so trimming it is safe and predictable. Goals and constraints are not — they are stated once and must survive arbitrarily many steps. Trimming by pure recency silently drops them, and dropping the goal causes repeated work that costs more than the tokens saved.

### Q10. What does a token actually represent to the model? <!-- id: found-03-tokens-and-context-q10 energy: normal -->

- [ ] A word, always bounded by spaces
- [ ] A single character, so counts are predictable from character counts
- [x] An index into a fixed vocabulary, whose entries are frequent byte sequences learned by a merge procedure
- [ ] A semantic concept chosen by the model at inference time

**Why:** The tokenizer converts text into integers that index a frozen vocabulary, and everything downstream operates on those integers. The entries come from frequency-driven byte-pair merges over the training corpus, which is why `low` is one token, `lower` may be two, and a rare emoji may be several bytes each occupying a token.

## You're ready to move on when...

You can pick up a piece of text you have never seen — a paragraph, a code file, a data dump, a message in a language other than English — and give a token estimate as a *range* with a stated reason, then measure it and land within about 20 percent. You can explain, without notes, why input and output share one budget and why a conversation's cost grows faster than its length. You can describe the lost-in-the-middle finding accurately enough that you also state its limits, and you can name the four strategies for managing overflow along with what each one costs you. And you can argue, in your own words, why a bigger context window is headroom rather than a plan.

## Free vs Paid

### What's free is enough

Everything in this phase is fully learnable at zero cost, and unusually for this curriculum it is also *measurable* at zero cost.

Online tokenizer playgrounds are free to use in a browser with no account, which covers every tokenization experiment in the tasks. Provider free tiers — Google AI Studio being the most useful here — give you a real API key that reports actual input and output token counts, which is how you verify your estimates against reality. Open-source tokenizer libraries run locally on any laptop and let you count tokens across an entire folder of your own files without a network call. A local model runner like Ollama lets you experiment with prompt lengths freely, with no metering at all, and gives you a second tokenizer to compare against the first.

The context-window overflow experiments in task 6 are also free on any free tier — you are sending long prompts, not expensive ones, and the failure behaviour is observable regardless of which model you use. You may hit rate limits on a free tier before you hit a context limit; if that happens, use a local model where the only limit is your own RAM.

### What a paid tier adds

A paid API tier removes rate limits, which matters for task 11 (comparing token counts across providers) and for any experiment needing many sequential long requests. It also gets you access to the largest windows, which makes the position and distractor tests easier to run at realistic scale and lets you observe overflow behaviour on the models people actually deploy.

A paid chat subscription adds longer context in the interface and larger uploads, which makes task 9 (estimating the composition of a long chat) more interesting because the chats can get genuinely long.

### When it's worth paying

**Almost never for this phase specifically.** The free path covers every measurement in the task list, and the arithmetic you are practising is provider-independent — the mechanism does not care which tokenizer you use, and comparing two free tokenizers teaches the cross-provider lesson as well as comparing two paid ones.

Two honest exceptions. If you have already paid for any API access, use it here for task 11, because real usage numbers from two providers make the cross-provider estimation problem concrete in a way that a single free tokenizer cannot. And if you are hitting free-tier rate limits so often that your experiment loop stalls, the smallest paid tier is a fair purchase — but note that the fix for a stalled loop is usually a local model, which costs nothing but your own hardware.

The threshold that actually matters: pay when you reach Track 7 and want to measure *your own* token usage on *your own* workloads. That is when the numbers stop being exercises and start being a bill, and by then this phase will have given you the judgement to spend deliberately instead of guessing.
