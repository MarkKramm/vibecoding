---
id: rag-01-why-retrieval
track: rag
phase: 1
order: 10
title: Why Retrieval Exists
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal]
deliverable: portfolio/rag/01-why-retrieval.md
exit_criteria: >
  You can decide whether a problem needs retrieval at all, explain what
  retrieval actually buys you, and name three situations where reaching for
  RAG would be the wrong move.
---

# Phase 1 — Why Retrieval Exists

## Goal of this phase

Understand what retrieval adds to a model, why it works, and — just as importantly — when it is the wrong tool. By the end you will be able to look at a problem and say whether it needs retrieval, long context, a prompt change, a tool, or nothing at all, and give a reason.

This phase is deliberately before any technique. Retrieval-Augmented Generation is one of the most over-applied ideas in this field: people build a vector database for a 40-page document that would fit in a prompt, or reach for RAG when the actual problem is that their prompt was vague. Knowing the decision comes first means you do not spend a week building a subsystem you did not need.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Most of this phase is reasoning rather than building. The hands-on tasks are diagnostic exercises on problems you already have, which is why they take less time than they look like they will.

## Skills you'll gain

- Explain the difference between parametric and non-parametric knowledge and why it decides everything in this track
- Name the three things retrieval buys: updatability, attribution, and exactness
- Decide when the corpus is small enough that retrieval is unnecessary
- Recognise problems that are reasoning failures rather than knowledge failures
- Sketch the modern RAG pipeline and say what each stage is for

## Specific topics to learn

### The knowledge problem

- Parametric knowledge: approximate, frozen, unverifiable
- Non-parametric knowledge: exact, current, checkable
- Why "the model does not know my documents" is a context problem, not a training problem

### What retrieval buys

- Updatability: change the file, change the answer
- Attribution: an answer you can trace to a source
- Exactness: the actual words, not a blurred impression

### When not to use RAG

- The corpus fits in context
- The problem is reasoning rather than recall
- The data is structured and should be queried, not embedded
- The need is a behaviour change

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Any long-context chat model | Test whether your corpus fits in a prompt | Free tier | https://chatgpt.com/ | Paste your whole document and ask a question from it | Google AI Studio, or a local model via Ollama |
| A token counter | Measure your corpus in tokens rather than pages | Free/open-source | https://github.com/openai/tiktoken | Count the tokens in your document and compare to a context limit | Provider token-count endpoints, or a local tokeniser |
| SQLite | The structured-data alternative to embedding everything | Free/open-source | https://sqlite.org/ | Answer a counting question with SQL instead of retrieval | A spreadsheet |
| Ollama | Run a local model for the "no retrieval" baseline | Free/open-source | https://ollama.com/ | Paste a small corpus into a local model and test the fit | llama.cpp directly |
| A text editor | Write the decision down before building | Free | https://code.visualstudio.com/ | Record which bucket your problem falls into and why | Paper |

## Free/cheap resources

- **Lewis et al. — Retrieval-Augmented Generation (arXiv:2005.11401)** — https://arxiv.org/abs/2005.11401
- **Anthropic — Contextual Retrieval** — https://www.anthropic.com/news/contextual-retrieval
- **Anthropic — Context windows** — https://docs.claude.com/en/docs/build-with-claude/context-windows
- **Liu et al. — Lost in the Middle (arXiv:2307.03172)** — https://arxiv.org/abs/2307.03172
- **Pinecone — What is RAG?** — https://www.pinecone.io/learn/retrieval-augmented-generation/
- **Jay Alammar — The Illustrated Word2vec** — https://jalammar.github.io/illustrated-word2vec/

## Lesson: The Model Does Not Know Your Documents

### Part 1 — Two kinds of knowing

Foundations Phase 1 introduced a distinction that this entire track depends on, so let me restate it precisely and then take it somewhere new.

**Parametric knowledge** lives in the model's weights. It is what training taught it. Its properties:

- Always available, with no setup
- **Blurred** — a compressed statistical impression, not a stored document
- **Frozen** at the training cutoff
- Expensive to update — retraining or fine-tuning, and neither is reliable for facts
- **Unverifiable from the inside** — the model cannot tell you where it learned something, or whether it learned it at all

**Non-parametric knowledge** lives outside the model, in text you supply. Its properties are the mirror image:

- **Exact** — it is the actual document, not an impression of it
- **Current** — you chose it, so it is as fresh as you made it
- Updated instantly — change the file and the next answer changes
- **Verifiable** — you can read the source yourself and check the claim
- Limited by whether you supplied the *right* text

Every technique in this track is a way of moving knowledge from the first category to the second. That is the whole idea. Retrieval does not make the model smarter or teach it anything; **it puts the right text in front of a reader that was always capable of reading it.**

#### Why the blurred/frozen properties matter more than they sound

Two failure modes follow directly, and both show up constantly in practice.

**Blurred means approximately-recalled.** A model that has seen your company's documentation in training does not have the document. It has a statistical summary of text about your company, and it will produce fluent statements that are *nearly* right — the right product with the wrong version number, a real API with a renamed parameter, a policy from two years ago stated as current. There is no internal signal that distinguishes this from accurate recall, which is why it is dangerous.

**Frozen means the cutoff is a hard wall.** Foundations Phase 1 covered this, but it is worth restating as a retrieval motivation: the model cannot know about last week, and when asked, it will either admit ignorance (the good outcome, and not the most common one) or construct something plausible.

Both failures have the same fix, and it is not fine-tuning. **Put the text in the context.** A model reading the actual document does not need to recall it, and a model reading last week's changelog does not need to have been trained on it.

---

### Part 2 — What retrieval actually is

The paper that named the idea: Lewis et al., *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*, arXiv:2005.11401 (2020, NeurIPS). It combined a parametric generator with a non-parametric index of Wikipedia and showed the combination beating either alone on open-domain question answering.

An honest note on the paper, because it can confuse someone who reads it after using modern RAG tools: **the original system fine-tuned the retriever and generator jointly.** Almost nothing you build today does that. Modern RAG is a simpler pipeline in which a retriever fetches text and a frozen model reads it. The idea is the same; the training machinery is mostly gone. If you read the paper and it describes training you are not doing, that is expected and not a sign you have misunderstood.

#### The pipeline

```text
INGEST      documents -> parse -> clean -> normalize text
CHUNK       split into retrievable units, attach metadata
EMBED       each chunk -> a vector
INDEX       store vectors + text + metadata
--- at query time ---
RETRIEVE    query -> vector -> similarity search -> top-N candidates
RERANK      score candidates more carefully -> keep top-K
GENERATE    prompt = instructions + top-K chunks + query -> answer
--- and always ---
EVALUATE    measure retrieval and generation separately
```

Each stage is a separate failure surface, and this is the single most useful thing to internalise about RAG. When a RAG system gives a bad answer, the instinct is to fix the prompt. But the prompt is at the end of a five-stage pipeline, and **the failure is usually earlier.**

Here is the diagnostic that separates the halves in about thirty seconds, and it is worth memorising before you build anything:

> **Inject the known-correct chunk into the prompt by hand.** If the model then answers correctly, your problem is **retrieval**. If it still fails with the right text in front of it, your problem is **generation**.

And its mirror:

> **Remove the context entirely and ask again.** If the answer quality does not change, your retrieval is not being used at all — you have built a pipeline whose output the model is ignoring.

Both tests take less time than reading the code, and they tell you which half of the system to open. Most of this track is about the retrieval half, because that is where the defects usually are.

---

### Part 3 — What retrieval buys: updatability, attribution, exactness

Three properties, each of which solves a problem that prompting and fine-tuning cannot.

#### Updatability

Change the document, change the answer. No retraining, no redeployment, no release cycle.

The sharpest way to see the value is to compare the alternatives. If the fact lives in the **weights**, updating it means fine-tuning — expensive, slow, and unreliable for facts, as the Fine-tuning track will show. If the fact lives in a **prompt you paste by hand**, updating it means editing a prompt, which does not scale past a handful of documents. If the fact lives in a **retrieved corpus**, updating it means saving a file.

This property is why RAG dominates for knowledge that changes: product catalogues, policies, documentation, support articles, anything with a version number. And it is why RAG is the wrong tool for knowledge that does not change and is small, which is the next section.

#### Attribution

An answer that can be traced to a source.

When the text is in the context, the model can quote it, and — more importantly — **you can check the quote.** This inverts the usual trust problem. Foundations Phase 1 established that a model asked to cite sources will produce convincing citations that may not exist, because generating the shape of a citation and recalling a real one are the same operation from the inside. Retrieval changes that: the citation can point at a chunk *you supplied*, so verifying it is a string comparison rather than a research task.

```text
Without retrieval:  "According to the 2019 policy, section 4.2..."  <- verify by searching
With retrieval:     "According to chunk 7..."                      <- verify by reading chunk 7
```

One caveat worth stating now, because it is a real trap: **the model can still cite the wrong chunk.** It knows a chunk id exists; it is generating text, and the id it names is generated too. So attribution through RAG is better than attribution through parametric recall, but the citation still has to be checked — ideally in code, by asserting that the quoted span actually appears in the cited chunk. The evaluation phase covers how; the point here is that attribution becomes *mechanically checkable*, which is the actual gain.

#### Exactness

The actual words, rather than a blurred impression of them.

This is the property that matters for anything where precision is the point: error codes, version numbers, API parameter names, legal clause text, product SKUs, medical dosages, financial figures. Parameters cannot represent these exactly — a model that has seen ten thousand error codes in training has a statistical sense of what error codes look like, which is not the same as knowing yours.

Exactness is also what makes retrieval work for content the model has *never* seen: internal documents, private notes, a document written this morning. There is no training signal for material that was never public, and there does not need to be.

---

### Part 4 — When retrieval is the wrong tool

This section is the reason the phase exists. Every item here is a mistake people make, and each has a cheaper correct answer.

#### The corpus fits in the context window

If your whole knowledge base is small enough to paste into the prompt, do that instead. No chunking, no embeddings, no vector store, no retrieval evaluation, no reranking — and no retrieval bugs, which is the real saving.

Anthropic's Contextual Retrieval guidance puts a concrete boundary on this: **if your knowledge base is under roughly 200,000 tokens — on the order of 500 pages — you can often include the whole thing rather than building RAG**, especially where prompt caching makes the cost and latency acceptable. That is a practitioner recommendation from a major provider, and it is worth taking seriously precisely because it argues against building the thing the same document is about to teach you to build.

As of 2026-09 that threshold is approximate and moves with context windows and caching behaviour, so check current limits rather than treating 200k as a law. The principle is durable even as the number moves: **retrieval is a solution to a scale problem, and below that scale it is pure overhead.**

The worked comparison:

```text
40-page employee handbook, ~25,000 tokens
  Option A: paste it into every prompt
    - cost: input tokens on every call, mitigated heavily by prompt caching
    - effort: minutes
    - failure modes: context dilution if you add more documents
  Option B: build RAG
    - cost: embeddings, a vector store, chunking decisions, a retrieval eval suite
    - effort: a week or more
    - failure modes: retrieval miss, chunk boundary splits, stale index, bad chunk size
```

Option A wins, and it is not close. The instinct to build the impressive thing is the obstacle here, not the engineering.

#### The problem is reasoning, not recall

RAG supplies text. It does not make a model reason better.

If the model has all the facts and produces a bad argument, retrieval adds nothing — you will retrieve the same facts it already had. This is the distinction between a **knowledge failure** and a **capability failure**, and the diagnostic test is the injection test from Part 2: put the right text in front of it. If it still fails, the text was never the problem.

Typical capability failures that get misdiagnosed as knowledge problems:

- Multi-step arithmetic over retrieved numbers
- Combining facts from several documents into a comparison
- Following a complex constraint set
- Any task where the model must hold several things in mind at once

For the arithmetic case specifically, the fix is a **tool**, not retrieval: give the model a calculator. Foundations Phase 2 introduced the idea; the Agents track covers the mechanics. Dates, arithmetic, and string formatting should be code.

#### The data is structured and should be queried

If your data is rows in a database, answer questions about it with SQL.

"How many orders did we ship in March?" does not need semantic search. It needs a `COUNT` with a `WHERE` clause, and a vector index over a database is a worse database — it will give you approximate answers to exact questions, which is backwards.

The pattern people reach for here is **text-to-SQL**: the model generates a query from a natural-language question, and the database executes it. That is a genuinely good architecture, and it is not retrieval. The critical design note, which the Agents track expands: **validate the generated query before running it**, and prefer read-only credentials, because a model generating SQL is a model writing code that runs against your data.

#### The need is a behaviour change

Retrieval changes what the model **knows**. If your problem is how it **behaves** — the wrong tone, the wrong format, inconsistent style, failing to follow a template — more text will not fix it. That is a prompt problem first, and a fine-tuning problem second, and the Fine-tuning track argues at length that it is usually a prompt problem.

#### A quick decision table

| What is actually wrong | Reach for |
|---|---|
| The model does not know my facts | **Retrieval** (or long context, if small) |
| The model knows the facts but argues badly | A tool, or a stronger model — not retrieval |
| The facts change often | **Retrieval** — fine-tuning cannot keep up |
| I need citations I can check | **Retrieval** |
| My corpus is small | **Long context** — skip retrieval entirely |
| The data is rows and columns | **SQL**, possibly text-to-SQL |
| The style or format is wrong | **Prompting**, then fine-tuning if extreme |
| The model needs to *act* | **Tools** (Agents track) |
| I need to cut cost at scale | Caching, batching, routing (Cost track) |

There is an important reading of this table that the next phase depends on: several rows are **complementary**, not exclusive. A production system often retrieves *and* prompts carefully *and* routes by difficulty. Being able to say which problem you have is what keeps you from fixing the wrong layer.

---

### Part 5 — Setting expectations honestly

One last thing before the techniques, and it is a warning rather than a promise.

**RAG is a subsystem, not a feature.** Building it means making decisions about chunk size, embedding model, candidate count, fusion weights, reranking, metadata schema, index freshness, and access control. Each of those can be wrong independently. A RAG system that "does not work" is almost never one bug; it is a set of choices that are individually defensible and collectively poor.

The most valuable expectation to set is this: **most bad RAG is bad retrieval, not bad generation.** When you look at a weak answer, resist the urge to rewrite the prompt. Check what was actually retrieved first. Print it. Read it. In my experience the retrieved text is either missing the answer entirely, or it is there but buried under four irrelevant chunks, and no prompt change fixes either.

The whole track is organised around that reality:

| Phase | What it fixes |
|---|---|
| 2 — Ingestion and chunking | The units being retrieved are wrong |
| 3 — Embeddings and vector search | The matching mechanism misses exact terms |
| 4 — Hybrid search and reranking | Dense-only retrieval is not enough |
| 5 — Metadata and evaluation | No access control, and no way to know if it works |
| 6 — Diagnosing failures | Which stage is broken, and how to tell |
| 7 — When RAG is not enough | Global questions it cannot answer at all |

Notice that only the last phase is about advanced technique. **The first six are about getting the basics right**, because that is where the wins are. GraphRAG and multi-hop retrieval are genuinely interesting and genuinely rarely the right first move.

---

## Hands-on practice tasks

1. Pick a document you actually use. Count its tokens and write down whether it fits a current context window. <!-- id: rag-01-t01 band: quick energy: low -->
2. Paste that whole document into a chat model and ask three questions that require it. Record the quality. This is your no-retrieval baseline. <!-- id: rag-01-t02 band: focused energy: low -->
3. Take three real problems from your own work and classify each using the decision table. Write the bucket and a one-sentence reason. <!-- id: rag-01-t03 band: focused energy: normal -->
4. Find one question about your own data that is better answered by SQL than by retrieval, and answer it with SQL. <!-- id: rag-01-t04 band: focused energy: normal -->
5. Write down a question your data cannot answer even with perfect retrieval, and say why retrieval would not help. <!-- id: rag-01-t05 band: quick energy: normal -->
6. Ask a model a question about a specific document it has never seen, without giving it the document. Then give it the document and ask again. Record both answers. <!-- id: rag-01-t06 band: focused energy: normal -->
7. Find a claim a model made about a specific niche topic and identify whether it was parametric recall or something else. Write down how you would tell them apart. <!-- id: rag-01-t07 band: quick energy: normal -->
8. Write your one-paragraph answer to "why not just fine-tune it?" before reading the Fine-tuning track. Keep it and compare later. <!-- id: rag-01-t08 band: quick energy: normal -->

## Common Pitfalls

**Building RAG for a corpus that fits in a prompt.** The most common over-engineering in this field. A 30-page document does not need a vector database, and the retrieval bugs you avoid are worth more than the pipeline you skip.

**Fixing the prompt when retrieval is broken.** The generation step is at the end of the pipeline, so it gets blamed first. Use the injection test before touching a prompt.

**Treating a reasoning failure as a knowledge failure.** If the model has the facts and reasons badly, more facts will not help. Retrieve the same text and watch it fail identically.

**Embedding structured data.** Rows and columns want SQL. A vector index answers approximate questions, which is the opposite of what a counting question needs.

**Assuming the citation is correct because it is specific.** A model naming chunk 7 is still generating text. Verify in code that the quoted span appears in the chunk.

**Believing fine-tuning is the alternative to retrieval for facts.** It is expensive, goes stale, cannot cite, and often fails to memorise reliably. The Fine-tuning track explains why people reach for it anyway.

## Deliverable / proof of work

Write `portfolio/rag/01-why-retrieval.md` containing:

- **The token measurement** of a real document you use, with the context-window comparison and your verdict on whether it fits
- **The no-retrieval baseline** — the three questions you asked a model with the document pasted in, and the answers you got
- **Your decision table applied** to three real problems, each with a bucket and a reason
- **One problem you decided does NOT need retrieval**, with the cheaper correct answer named
- **A paragraph on why retrieval is not fine-tuning**, written before you read the Fine-tuning track

## Checklist

- [ ] I can explain parametric vs non-parametric knowledge without notes <!-- id: rag-01-c01 energy: low -->
- [ ] I can name the three things retrieval buys: updatability, attribution, exactness <!-- id: rag-01-c02 energy: low -->
- [ ] I can decide whether a corpus is small enough to skip retrieval entirely <!-- id: rag-01-c03 energy: normal -->
- [ ] I know the injection test and can apply it to separate retrieval failures from generation failures <!-- id: rag-01-c04 energy: normal -->
- [ ] I know the removal test and can tell whether retrieval is being used at all <!-- id: rag-01-c05 energy: normal -->
- [ ] I can distinguish a knowledge failure from a capability failure <!-- id: rag-01-c06 energy: normal -->
- [ ] I can name three situations where RAG is the wrong tool <!-- id: rag-01-c07 energy: low -->
- [ ] I can sketch the RAG pipeline and say what each stage is for <!-- id: rag-01-c08 energy: low -->
- [ ] I know why structured data wants SQL rather than embeddings <!-- id: rag-01-c09 energy: normal -->
- [ ] I can explain why a retrieval citation is still not automatically trustworthy <!-- id: rag-01-c10 energy: normal -->

## Quiz

### Q1. A model answers questions about your company's internal wiki fluently and confidently, but the version numbers are subtly wrong. What is the most likely explanation? <!-- id: rag-01-q01 energy: normal -->

- [x] It is producing approximate parametric recall — a blurred impression of similar text rather than the document — with no internal signal distinguishing that from accurate recall
- [ ] The wiki is corrupted in the training data
- [ ] The model is deliberately obfuscating its sources
- [ ] The model's tokenizer is mangling the numbers

**Why:** Parameters encode a statistical impression, not stored documents, so recall is approximately right in a way that feels exactly like being right. Subtly wrong version numbers are the classic signature. Supplying the actual document moves the fact from blurred parameters to exact context.

### Q2. Your RAG system gives a poor answer. You paste the correct source passage into the prompt by hand and the answer becomes correct. What have you learned? <!-- id: rag-01-q02 energy: normal -->

- [x] The problem is retrieval — the right passage was not being fetched or was buried
- [ ] The model is too small for the task
- [ ] The generation prompt needs work
- [ ] The embedding model needs replacing

**Why:** Injecting the known-correct chunk isolates the two halves of the pipeline. If the model succeeds with the right text in front of it, the model and prompt are adequate and the failure was upstream. If it still fails, the problem is generation. This test takes seconds and saves hours.

### Q3. Your knowledge base is 30 pages, about 20,000 tokens. What is the reasonable approach? <!-- id: rag-01-q03 energy: normal -->

- [ ] Build a vector store, since retrieval is best practice
- [x] Include the whole document in the prompt, especially with prompt caching, rather than building retrieval
- [ ] Fine-tune a model on the document
- [ ] Chunk it and store it in a database for keyword search

**Why:** Retrieval solves a scale problem, and below that scale it is pure overhead — embeddings, chunking decisions, an index to keep fresh, and a set of retrieval bugs you would otherwise not have. Practitioner guidance puts the skip threshold in the region of a few hundred thousand tokens. Verify current limits rather than trusting a fixed number.

### Q4. A user asks "how many orders shipped in March?" about your orders table. What is the right approach? <!-- id: rag-01-q04 energy: normal -->

- [ ] Embed the orders and retrieve the most similar rows
- [ ] Retrieve order documents and ask the model to count them
- [ ] Ask the model to estimate from a sample of orders
- [x] Generate and validate a SQL query and execute it against the database

**Why:** This is an exact question about structured data, so it wants an exact answer from the structure. Embedding and counting retrieved rows gives an approximate answer to a question with one correct value. The model writes the query; the database computes it; you validate before executing.

### Q5. Which problem will retrieval NOT fix? <!-- id: rag-01-q05 energy: normal -->

- [ ] The model does not know about a document written last week
- [x] The model has all the facts but combines them into a valid-looking but wrong multi-step argument
- [ ] The model confuses two products with similar names
- [ ] The model does not know your internal error codes

**Why:** That is a capability failure rather than a knowledge failure. Retrieval supplies text, and retrieving facts the model already had changes nothing. The diagnostic is the same injection test: put the correct text in front of it and watch it reason badly anyway. Tools or a stronger model are the levers.

### Q6. Why did the original RAG paper's approach differ from what you build today? <!-- id: rag-01-q06 energy: high -->

- [ ] Because the paper's method was later shown to be incorrect
- [ ] Because modern providers forbid joint training
- [x] Because the original jointly trained retriever and generator, while modern RAG is usually a simpler pipeline where a frozen model reads retrieved text
- [ ] Because the original worked only on Wikipedia

**Why:** The idea — combining parametric generation with a non-parametric index — is what survived. The training machinery largely did not, because a general-purpose model reading retrieved text works well enough that joint training is rarely worth the complexity. Reading the paper and finding it describes training you are not doing is expected.

### Q7. Your RAG system returns plausible answers, and when you remove the retrieved context the answers barely change. What does that indicate? <!-- id: rag-01-q07 energy: high -->

- [ ] The retrieval is working unusually well
- [ ] The model is robust to missing context, which is desirable
- [ ] The context window is too small
- [x] Retrieval is not actually being used — the model is answering from parametric knowledge and the pipeline adds cost without grounding

**Why:** If removing the retrieved text does not degrade quality, the text was not contributing. The system is paying for embeddings and retrieval while the model answers from memory. That is a silent failure, because the outputs look reasonable — they are just ungrounded, and they will drift wrong exactly where parameters are blurred.

### Q8. A model cites "chunk 7" as the source of a claim. What is the correct level of trust? <!-- id: rag-01-q08 energy: normal -->

- [ ] Full trust, because the chunk exists and was supplied in the prompt
- [ ] No trust at all, since citations are always fabricated
- [x] Verify in code that the quoted span actually appears in chunk 7 — the chunk is real but the attribution is still generated text
- [ ] Trust it if the answer sounds consistent with the document

**Why:** Attribution through retrieval is better than parametric recall because the source is a chunk you supplied, making verification mechanical. But the model is still generating which chunk it names, and it can name the wrong one confidently. Assert the quoted span appears in the cited chunk.

## You're ready to move on when...

You can look at a problem and say, in one sentence, whether it needs retrieval — and when the answer is no, name the cheaper correct approach. You have measured a real document, compared it to a context window, and made a deliberate decision rather than a default one. You know the injection test and the removal test by name and can apply either in under a minute.

And you can explain, without notes, why the answer to "the model does not know my documents" is to show it the documents rather than to train it on them.

## Free vs Paid

### What's free is enough

This phase costs nothing at all. Every exercise is measurement, reasoning, and pasting text into a free chat model. The token counting is free locally, Ollama runs a local model at no cost, and SQLite is free. The decision table is free and is the most valuable thing in the phase.

There is a genuine advantage to the free path here: because you are not paying per experiment, you can run the no-retrieval baseline on several documents and get a real feel for where the boundary is, rather than guessing from a rule of thumb.

### What a paid tier adds

A long-context paid tier raises the size at which "just paste it in" remains viable, which expands the set of problems you can solve without building retrieval at all. Prompt caching reduces the cost of the repeated-prefix pattern that long-context approaches depend on.

Neither changes the reasoning in this phase. Both move the threshold, and the threshold is a number you should re-check rather than memorise.

### When it's worth paying

When your corpus has outgrown the point where pasting works and retrieval is genuinely required, at which point the cost moves to embeddings and inference — and the Free-vs-Paid sections of the later phases in this track address those. **For this phase specifically, there is no purchase to justify.** If you find yourself wanting to buy something to complete it, the likely issue is that you have decided to build retrieval before establishing that you need it, which is the exact mistake the phase exists to prevent.
