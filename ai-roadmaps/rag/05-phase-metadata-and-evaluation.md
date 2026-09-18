---
id: rag-05-metadata-and-evaluation
track: rag
phase: 5
order: 50
title: Metadata Filtering and RAG Evaluation
duration: 2 weeks
duration_weeks: 2
energy_mix: [normal, high]
deliverable: portfolio/rag/05-metadata-and-evaluation.md
exit_criteria: >
  You can enforce access control as a retrieval filter rather than a prompt
  instruction, and you can measure retrieval and generation separately — with
  numbers for both — so that when an answer is wrong you know which half of the
  system produced it.
---

# Phase 5 — Metadata Filtering and RAG Evaluation

## Goal of this phase

Two subjects that look unrelated and are not. Metadata filtering is how you make retrieval *correct* — respecting who may see what, and narrowing a search before it happens rather than after. Evaluation is how you find out whether it *is* correct, and it is the single most skipped step in every RAG system ever built.

They belong together because they share a failure mode: both are things people implement as an afterthought, in the prompt, after the system already appears to work. Access control written as a prompt instruction is a security hole that demos perfectly. Quality assessed by reading a few outputs is a measurement that tells you nothing and feels like it told you something.

By the end of this phase you will have a filtered retrieval index that enforces permissions in code, a labelled question set with known answer passages, and separate numbers for retrieval quality and generation quality. That separation is the deliverable, because it is what converts "the answer was wrong" from a mystery into a diagnosis.

## Estimated time

**2 weeks** at 1–2 hours a day, 5 days. Roughly 12–14 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Part 1: metadata as a filter, and the access-control rule | 1.5h |
| 2 | Part 2: pre-filter vs post-filter, and why it matters at scale | 1.5h |
| 3 | Part 3: retrieval metrics — Recall@k, Precision@k, MRR, nDCG | 2h |
| 4 | Part 4: building your labelled set and measuring retrieval | 2h |
| 5 | Part 5: generation metrics, and RAGAS honestly | 1.5h |
| 6 | Part 6: the two-way diagnostic, then the deliverable | 2h |

If you only have four hours this week, do tasks 1, 4, 6 and 9. Those produce the filtered index, the labelled set, the separated measurements and the diagnostic, which is the phase in miniature.

The second week is the measurement week and it is the one people skip. Do not skip it — a RAG system without numbers is a system you cannot improve, because every change you make is a guess and you will never know which of your guesses helped.

## Skills you'll gain

- Attach metadata to chunks at ingestion time and filter on it at query time.
- Enforce access control as a retrieval filter, and explain why a prompt instruction is not a control.
- Choose between pre-filtering and post-filtering, and predict when post-filtering silently returns nothing.
- Compute Recall@k, Precision@k, MRR and nDCG, and say which question each one answers.
- Build a labelled question set with known answer passages, and split it so you do not tune on your test data.
- Measure retrieval and generation *separately*, and use the two-way injection test to localise a failure.
- Describe what RAGAS measures, what reference-free means, and what the framework inherits from LLM-as-judge.
- Recognise when a metric is being gamed by your own pipeline rather than measuring it.
- State where evaluation stops working: when the metric and the user's actual need diverge.

## Specific topics to learn

### Metadata and access control

- Metadata attached at ingestion: source, section, timestamp, author, tenant, classification.
- Filtering as a retrieval parameter, applied by the index rather than by you.
- **Access control as a filter, never as a prompt instruction.**
- Pre-filtering versus post-filtering: where the filter runs changes what you get.
- The top-k trap: post-filtering a top-10 that was never filtered can return nothing.
- Metadata as a retrieval *quality* tool, independent of security: date, document type, language.
- Why metadata must be set at ingestion, because retrofitting means re-indexing.

### Measuring retrieval

- Recall@k: of the questions, how many had a correct passage in the top k?
- Precision@k: of the k returned, how many were relevant?
- MRR: how high did the *first* relevant passage rank?
- nDCG: graded relevance with a position discount.
- Why Recall@k is usually the metric that matters most in RAG, and when it does not.
- Building a labelled set: real questions, known answer passages, and a dev/test split.
- Why 20–50 cases is enough to start and why "not enough data" is not a reason to skip.

### Measuring generation

- Faithfulness: is the answer supported by the retrieved context?
- Answer relevance: does it address the question asked?
- Context precision and context recall: did retrieval supply what was needed, and was it focused?
- **Reference-free evaluation** — what RAGAS introduced, and what that means practically.
- What the framework inherits: LLM-judge biases, and the mitigations from the evaluation discipline.
- When a programmatic check beats a judge, and why code should be preferred whenever the outcome is checkable.

### The diagnostic that ties them together

- The master test: inject the known-correct chunk and see whether the answer becomes right.
- Reading the four outcomes: retrieval broken, generation broken, both, or neither.
- The reverse test: remove the context and check that quality drops.
- Why a system that answers correctly without context is malfunctioning even though it looks fine.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| SQLite with FTS5 | Store chunks, metadata and filters in one place you can query directly | Free/open-source | https://sqlite.org/fts5.html | Tasks t02, t03 — add metadata columns and filter with `WHERE` before the vector step | A JSON index with a Python filter, or any local database |
| FAISS | Vector search with ID mapping, so you can filter on metadata you hold yourself | Free/open-source | https://github.com/facebookresearch/faiss | Task t02 — retrieve with `IDSelector` so the filter runs in the search | numpy brute force, which is fine at small scale |
| sentence-transformers | Local embeddings and cross-encoders, no API and no meter | Free/open-source | https://sbert.net/ | Tasks t01, t05 — embed your corpus and rerank candidates | Any local embedding model, or a provider free tier |
| `ranx` | Compute nDCG, MRR, Recall and Precision correctly instead of hand-rolling them | Free/open-source | https://github.com/AmenRa/ranx | Task t06 — check your hand-written metrics against a library | Write them yourself, then compare — the exercise is the point |
| RAGAS | Reference-free evaluation of faithfulness, relevance and context quality | Free/open-source; hosted tiers exist | https://github.com/explodinggradients/ragas | Task t09 — evaluate one pipeline and read every metric's definition before trusting the number | Write your own faithfulness check with a local model as judge |
| A local model via Ollama | Serve as your judge so evaluation is free and repeatable | Free/open-source | https://ollama.com/ | Tasks t05, t09 — judge faithfulness locally, and note where a small judge is unreliable | Any local runner; a free hosted tier for cases your judge cannot handle |
| pandas | Tabulate per-question results and diff two pipeline versions | Free/open-source | https://pandas.pydata.org/ | Task t08 — one row per question, one column per pipeline, and read the deltas | Python's `csv` module and a spreadsheet |
| pytest | Turn your evaluation set into a test that runs on every change | Free/open-source | https://docs.pytest.org/ | Task t11 — a regression suite that fails when quality drops | Any test runner, or a script that exits non-zero |
| Google AI Studio | A free hosted judge for cases where your local model is too weak | Free tier | https://aistudio.google.com/ | Task t09 optional — compare a small local judge against a stronger one | Any provider free tier, checked for data terms first |

## Free/cheap resources

- **Es et al. — Ragas: Automated Evaluation of Retrieval Augmented Generation (arXiv:2309.15217)** — https://arxiv.org/abs/2309.15217
- **Zheng et al. — Judging LLM-as-a-Judge (arXiv:2306.05685)** — https://arxiv.org/abs/2306.05685
- **Liu et al. — Lost in the Middle (arXiv:2307.03172)** — https://arxiv.org/abs/2307.03172
- **Lewis et al. — Retrieval-Augmented Generation (arXiv:2005.11401)** — https://arxiv.org/abs/2005.11401
- **Cormack, Clarke & Buettcher — Reciprocal Rank Fusion (SIGIR 2009)** — https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf
- **RAGAS documentation — metric definitions** — https://docs.ragas.io/
- **ranx — evaluation metric library** — https://github.com/AmenRa/ranx
- **FAISS wiki — indexes and ID selectors** — https://github.com/facebookresearch/faiss/wiki
- **Anthropic — Contextual Retrieval** — https://www.anthropic.com/news/contextual-retrieval

## Lesson: Two Things You Cannot Add Later

### Part 1 — Metadata is set at ingestion or not at all

Here is the property that makes metadata different from almost everything else in this track: **it is cheap to add while you are loading documents and expensive to add afterwards.** Every other retrieval improvement can be applied to an existing index. Metadata generally cannot, because it lives inside the index structure, and adding a field means re-embedding or at least re-writing every chunk.

So the decision is made early, usually before you know which fields you need. The response is not to guess exhaustively — it is to attach a small set of obviously-useful fields from the start and accept that you will re-index eventually.

| Field | Why you will want it | Set when |
|---|---|---|
| `source` | Attribution, and filtering to one document set | Ingestion |
| `section` / heading path | Context in the prompt, and narrowing a search | Ingestion |
| `timestamp` or version | "What is current?" questions, and recency filtering | Ingestion |
| `tenant` / `owner` | **Access control** | Ingestion |
| `classification` | Access control for sensitivity tiers | Ingestion |
| `doc_type` | Filtering a policy from a tutorial from a changelog | Ingestion |
| `language` | Routing around the tokenization and representation problems Phase 3 measured | Ingestion |
| Chunk position | "The next paragraph" questions, and neighbour expansion | Ingestion |

Notice that four of these are about **who may see what** and the rest are about retrieval quality. That is the natural split, and both halves matter.

**Metadata also improves relevance, which people forget.** A query like "what changed in the last release?" is not well served by semantic similarity at all — every release note is semantically similar to every other release note. A `timestamp` filter turns an impossible semantic question into a trivial structured one. This is the same insight as Phase 1's "the data is structured and should be queried, not embedded", applied at the chunk level rather than the corpus level.

**Where it stops working.** Metadata only helps if it is *accurate*, and ingested metadata is frequently wrong in invisible ways. A `timestamp` scraped from a page footer may be the page's render date rather than the document's. A `tenant` field set by a buggy loader is worse than no field at all, because it produces confident wrong answers about permissions. **Verify your metadata against a sample by hand before you trust a filter on it** — this is a five-minute check that prevents the most dangerous class of bug in this phase.

### Part 2 — Access control is a filter, never an instruction

This is the most important paragraph in the phase, and it is short.

**Never enforce access control by telling the model what it may use.** It does not work, for the same reason every instruction-based control fails on a probabilistic system: it is a preference expressed to a model, not a constraint enforced by code. A user who phrases the request cleverly, or a document that contains instructions of its own, can defeat it. Phase 6 of the Safety track covers indirect prompt injection in depth; the point here is narrower and more practical — **the filter must run in the retrieval step, before the model sees anything.**

The correct arrangement has three properties:

1. **The filter is a query parameter**, passed to the index, not a sentence in a prompt.
2. **It is applied on the server**, derived from the authenticated user, not from anything the user supplies in the request body.
3. **The model never receives documents the user may not see**, so there is nothing to leak.

The third property is the one that makes this a *control* rather than a mitigation. If a forbidden document is never in the context window, no prompt can extract it.

**Pre-filter versus post-filter, which is where implementations quietly break.**

There are two ways to combine a filter with a vector search.

**Post-filtering** retrieves the top k nearest neighbours *first*, then discards those that fail the filter. It is easy to implement because it needs no index support — you search, then filter in your own code.

**Pre-filtering** applies the filter *inside* the search, so the k nearest neighbours are drawn only from the eligible set.

They produce the same answer only when the eligible set is large relative to k. Consider what happens when it is not.

> You have 10,000 chunks. A user is permitted to see 40 of them — one small project. You retrieve the top 10 by similarity and filter afterwards. The 40 permitted chunks are a 0.4% slice of the corpus, so the probability that any of them appears in an unfiltered top 10 is low. Your filtered result is very often **empty**, and your system reports "I could not find anything" to a user whose documents are sitting right there.

The failure is nasty in two specific ways. It looks like a **content** problem rather than a permissions bug, so you will go looking for a missing document instead of a broken query. And it gets **worse as the corpus grows**, because a fixed permitted slice becomes a smaller and smaller fraction of the whole. A system that worked in testing with 200 chunks fails in production with 200,000, and nothing in the code changed.

```python
# POST-filter: retrieve first, discard after. Breaks on narrow permissions.
hits = index.search(query_vector, k=10)
allowed = [h for h in hits if h.metadata["tenant"] == user.tenant]

# PRE-filter: the k neighbours are drawn ONLY from the eligible set.
hits = index.search(query_vector, k=10, filter={"tenant": user.tenant})
```

**The engineering consequence.** Pre-filtering needs index support: FAISS exposes ID selectors, and most vector databases offer a filter argument. If your chosen store does not support filtered search, that is a **functional requirement you have discovered**, and it should change your choice of store rather than your architecture. Phase 3's storage decision was made on size and simplicity; this adds a constraint, and it is a more important one than either.

**A related trap: the filter is not a ranking signal.** Filtering on `doc_type = "policy"` returns policies, but among policies relevance is still decided by similarity. Do not expect the filter to sort by anything. If you need "most recent first within the permitted set", that is a sort, and it belongs in the same query as an explicit ordering rather than an assumed side effect of the filter.

**Where it stops working.** Pre-filtering is not free. A very restrictive filter can make an approximate index behave badly, because the graph or the clusters were built over the whole corpus and the eligible subset may not be well connected — you can get worse recall on the filtered set than a brute-force scan of it would give. This is Phase 3's approximation trade reappearing in a new place. At small eligible-set sizes, the honest answer is to retrieve from the eligible set directly by brute force rather than filtering an approximate index, and that is a decision you can only make if you are measuring.

### Part 3 — Retrieval metrics, and what each one actually asks

Now the measurement half. Phase 2 introduced Recall@k as a way to choose a chunk size, and Phase 4 used it to compare dense, hybrid and reranked pipelines. This part completes the set, because Recall@k alone cannot tell you *how* a pipeline is failing.

All four metrics need the same input: a set of questions, and for each one a **known-correct set of passages**. Building that is Part 4. First, what each metric asks.

| Metric | The question it answers | Sensitive to ordering? |
|---|---|---|
| **Recall@k** | Of all questions, how many had a correct passage inside the top k? | Only through the cutoff |
| **Precision@k** | Of the k passages returned, what fraction were relevant? | Only through the cutoff |
| **MRR** | How high did the *first* correct passage rank, averaged? | Yes, strongly |
| **nDCG@k** | How good is the whole ranking, with graded relevance and a position discount? | Yes, at every position |

**Recall@k** is the one to care about most in RAG, and the reason is a property of the pipeline rather than a preference. In RAG the retriever's job is to *put the answer in the context window*. If the correct passage is in the top k, a capable generator has a chance; if it is not, the generator cannot succeed no matter how good it is, because it does not have the information. Recall is therefore the **gate** on the whole system, and it is the first number to look at when answers are wrong.

**Precision@k** matters differently: it measures how much of the context window you are spending on irrelevant material. Low precision is not fatal — the generator can ignore a distractor — but it costs tokens and it interacts with the position effects Phase 5 of Prompting covered. A pipeline with 95% recall and 20% precision is often fine; one with 60% recall is broken regardless of its precision.

**MRR (Mean Reciprocal Rank)** asks how quickly the user meets the right answer, scoring the first correct result as 1/rank and averaging across questions. It is the metric that matches a **search-box** experience, where the user looks at the first result and gives up. It is less central in RAG, where several passages are passed to a generator and their order matters less than their presence — but it becomes important again the moment you build anything that shows a ranked list to a person.

**nDCG (normalised Discounted Cumulative Gain)** is the most complete and the most fiddly. It handles **graded** relevance — a passage can be perfect, useful, or tangential — and it discounts by position logarithmically, so moving a good passage up matters more near the top. It is the standard metric in the information-retrieval literature and in reranking work, which is why it appears in Phase 4's neighbourhood.

**Which to use.** Start with **Recall@k**, because it gates everything. Add **nDCG@k** when you are comparing rerankers, because it is sensitive to ordering and that is exactly what a reranker changes. Use **MRR** if you have or plan a ranked-list interface. Use **Precision@k** when token cost matters, which in RAG it always does.

**Two cautions that will save you from a wrong conclusion.**

**Recall@k is bounded by k, and comparing across k is meaningless.** Recall@5 of 80% and Recall@50 of 90% are not "an improvement" — they are different questions. Always state k.

**Recall@k can be 100% and the system still be bad.** If your labelled set has one correct passage per question and you retrieve 50 passages, recall is trivially high while the generator drowns in distractors. This is why recall is a *gate* and not a verdict, and why Part 5 exists.

**Where this stops working.** Every one of these metrics measures agreement with **your labels**, and your labels encode your judgement about what is relevant. If your labelled passages are wrong — because you marked a passage that mentions the topic but does not answer the question — every metric will be confidently meaningless. This is the most common way an evaluation suite produces numbers that do not correspond to quality, and the defence is Part 4's discipline: label from the *question's* perspective, asking "does this passage answer it?", not "is this passage about it?"

### Part 4 — Building a labelled set you can trust

You need a set of questions, each with the passages that genuinely answer it. The method matters more than the size.

**Use real questions.** Write them the way a user would ask, not the way your documents are written. If you have no users yet, use questions you have actually asked of the corpus, and questions from the domain's real vocabulary. Invented questions that paraphrase the document's own headings produce a set that measures nothing, because the retriever's job has been made trivial.

**20–50 cases is enough to start.** This is not a compromise; it is the correct size for the first version, because the purpose is to *detect direction*, and 25 well-chosen cases detect direction. The most common failure here is not starting because it feels too small — the second most common is trusting a 25-case number to two decimal places.

**Label the passages that answer, not the passages that mention.** This is the whole discipline, stated once. For each question, the correct passage is the one a competent reader would need in order to answer. A passage that shares vocabulary but does not contain the answer is a **distractor**, and marking it correct is how you build a suite that reports success while the system fails.

**Include the cases that should fail.** Some questions have no answer in your corpus. Include them, with an empty correct set, so you can measure whether the system honestly says "not found" or invents something. This is the retrieval counterpart of the impossible-task test, and it catches a failure mode that no recall number will.

**Split dev and test, and mean it.** Tune on the dev half — chunk sizes, k, weights, reranker choice. Then measure on the test half and **do not adjust anything afterwards**. The moment you change a parameter in response to a test-set number, that half is no longer a test set, and your reported improvement is partly fitted to noise. With 25 cases this happens faster than you would think.

**Grow the set from real failures.** Every time the system gets something wrong in use, that question belongs in the set, with its known answer. A suite built this way is small, real, and gets sharper over time — which is a better instrument than a large synthetic set nobody maintains.

**Version it in git, with the corpus.** The questions and labels are content, and they change. If you cannot diff your test set, you cannot tell whether a metric moved because the system improved or because you edited the answers — and Phase 6's warning about "fixing an expectation to launder a regression" is exactly this failure.

**Then measure, per question, not just in aggregate.** An aggregate number tells you whether to worry. A per-question table tells you **what to fix**. Store one row per question with its retrieved ids, its rank of the first correct passage, and whether the correct passage was present at all — because the interesting information is in the questions that changed, in both directions.

### Part 5 — Generation metrics, and RAGAS honestly

Retrieval metrics tell you whether the right material reached the model. They say nothing about what the model did with it. A system can have excellent recall and still produce unfaithful answers — the model may ignore the context, blend it with parametric knowledge, or contradict it outright.

**The RAGAS framework** (Es et al., arXiv:2309.15217) is the standard reference here, and its most important contribution is easy to miss in a list of metrics. RAGAS is a framework for **reference-free** evaluation: it evaluates without requiring ground-truth human annotations. That is what made automated RAG evaluation practical at all, because hand-writing a gold answer for every question is the step that stops most teams from starting.

Its metrics decompose the pipeline the same way this phase does:

| Metric | What it assesses | Which half |
|---|---|---|
| **Faithfulness** | Is the answer supported by the retrieved context? | Generation |
| **Answer relevance** | Does the answer address the question asked? | Generation |
| **Context precision** | Of the retrieved context, how much was actually relevant? | Retrieval |
| **Context recall** | Was the information needed to answer present in the context? | Retrieval |

Notice the two halves appear again, under different names. Context precision and context recall are retrieval quality; faithfulness and answer relevance are generation quality. This is the same separation Part 6 will turn into a diagnostic.

**What reference-free does and does not mean.** It means you do not supply gold answers. It does **not** mean the evaluation is objective, because these metrics are computed by **an LLM acting as a judge**. That inherits every bias the judging literature documents (Zheng et al., arXiv:2306.05685): a preference for longer answers, a preference for its own outputs, and sensitivity to the order in which options appear.

**The mitigations are the same ones the evaluation discipline prescribes, and they are not optional here:**

- **Pin the judge's version.** A judge model that changes underneath you makes every historical number incomparable.
- **Use a different model family for the judge than for the generator.** A model judging its own outputs systematically prefers them.
- **Supply a reference answer where you have one.** It converts a judgement into a comparison.
- **Randomise or swap order** when comparing two answers, and require the verdict to be stable.
- **Read a sample of the judge's verdicts yourself.** Every automated metric needs human calibration, or you are measuring the judge rather than the system.

**And the governing principle, which comes from the evaluation phases and applies with full force: code beats a judge whenever the outcome is checkable.** Is the answer valid JSON? Does the cited span appear in the cited chunk? Is the number in the answer equal to the number computed from the data? Each of these is a programmatic check — deterministic, free, and immune to judge bias. Reserve the judge for what genuinely cannot be checked in code: whether prose is supported by a passage, whether an answer addresses a question.

**A practical note for a zero-budget reader.** You can run RAGAS with a **local model as the judge**, which makes evaluation free and repeatable — the property Phase 7 of the Cost track argued for, since evaluation is high-volume and low-stakes. The honest caveat is that a small local judge is **less reliable**, particularly on faithfulness judgements requiring careful reading. Use it for the dev loop, where you need direction and can tolerate noise; use a stronger judge sparingly for the numbers you intend to report, and always read a sample of verdicts yourself before you believe the aggregate.

**Where this stops working.** All of these metrics correlate with quality; none of them *is* quality. A system can score well on faithfulness, relevance and context recall while being useless, because none of these measures whether the answer is **actually correct** in the world — only whether it is supported by what you retrieved and relevant to what was asked. If your corpus is wrong, or your retrieval supplied a confidently-worded irrelevant passage, faithfulness will be high and the answer will be wrong. **The metrics are a diagnostic instrument, not a verdict**, and the moment you optimise them as a target you have entered the territory the Safety track calls reward hacking.

### Part 6 — The two-way test that localises any failure

You now have both halves measured. This part gives you the diagnostic that makes the separation operational, and it takes seconds.

**The forward test: inject the known-correct chunk.** Take a question your system gets wrong. Retrieve the passage you know answers it — from your labelled set — place it in the context **by hand**, and re-ask. Then read the outcome:

| Outcome | Diagnosis | What to fix |
|---|---|---|
| Correct with injected chunk, wrong without | **Retrieval is broken.** The generator is adequate. | Chunking, embedding model, hybrid search, reranking, k |
| Wrong with the injected chunk | **Generation is broken.** The right material was present. | Prompt, instruction-following, context ordering, model capability |
| Correct both ways | Nothing is broken on this case; it may be memorisation (see below) | Investigate before celebrating |
| Wrong both ways and wrong in a new way | Both halves are contributing failures | Fix retrieval first — it gates the rest |

This is the single highest-value diagnostic in the track, because it converts a vague "the RAG is bad" into a specific half to work on. Phase 1 used it conceptually; here it becomes a procedure you run on real failures.

**The reverse test: remove the context.** Take a question the system gets *right*, delete the retrieved context, and ask again.

If the answer stays correct, **the system was not using the retrieved context** — it was answering from parametric knowledge, and the whole retrieval apparatus is decoration that adds cost and latency while providing no grounding. Phase 1 covered this as the "correct for the wrong reason" failure. It is worth restating because it is silent: the outputs look right, so nothing prompts you to check, and you discover the problem only when the model's blurry parametric recall drifts wrong on a fact it used to get right.

**A third test for the corpus itself.** If a correct chunk injected into the prompt still produces a wrong answer, and you have verified the chunk is genuinely correct, then check whether the *question* is answerable from your corpus at all. A surprising share of "RAG failures" are questions the documents do not answer, and no pipeline improvement will fix that. Phase 6 of this track builds the full symptom-to-cause table; this is the branch that leads to "the corpus is the problem".

**Turn the whole thing into a regression suite.** Once you have measured both halves, the natural next step is to make the measurement run on every change — Phase 6 of Finetuning covers the harness in detail, and Phase 7 of Cost explains why keeping it on a local model is what makes it affordable to run constantly. The short version: a table of questions, a script that runs them and reports both halves' numbers, and a diff against the last run. **A RAG system without this is a system where every change is a gamble**, and the specific gamble is that you improved retrieval while breaking generation, which the aggregate answer-quality number will hide.

**Where the diagnostic stops working.** It localises failures for questions you have thought about, and tells you nothing about the questions you have not. A system can pass every case in your set and still fail on the input that matters, which is why the set must grow from real use rather than being fixed at build time. And the diagnostic assumes your labelled passage is genuinely correct — if you have mislabelled, the forward test sends you to fix the wrong half, confidently.

## Hands-on practice tasks

1. Choose five metadata fields for your corpus and justify each in one sentence — naming whether it serves access control or retrieval quality. Add them to your chunks at ingestion. <!-- id: rag-05-metadata-and-evaluation-t01 band: focused energy: normal -->
2. Add metadata columns to your store and implement **filtered** retrieval where the filter runs in the search, not after it. Verify by inspecting the returned ids, not by trusting the query. <!-- id: rag-05-metadata-and-evaluation-t02 band: deep energy: high -->
3. Demonstrate the top-k trap deliberately: create a narrow permission slice, retrieve unfiltered top-10 and post-filter it, and show the empty result. Then show pre-filtering returning correct results on the same query. <!-- id: rag-05-metadata-and-evaluation-t03 band: focused energy: high -->
4. Write 25 real questions for your corpus with their known answer passages, marking the passages that genuinely *answer* rather than ones that merely mention the topic. Include three questions the corpus cannot answer. <!-- id: rag-05-metadata-and-evaluation-t04 band: deep energy: high -->
5. Compute Recall@5, Recall@10, Precision@5, MRR and nDCG@5 for your current pipeline and put them in one table. State in writing which metric you will optimise and why. <!-- id: rag-05-metadata-and-evaluation-t05 band: deep energy: high -->
6. Hand-write one of the metrics from its formula, then check it against `ranx` or another library on the same data. Investigate any disagreement — the library is probably right, and finding out why is the lesson. <!-- id: rag-05-metadata-and-evaluation-t06 band: focused energy: normal -->
7. Split your set into dev and test halves. Tune one parameter on dev only, then measure on test once. Write down both numbers and note the gap. <!-- id: rag-05-metadata-and-evaluation-t07 band: focused energy: normal -->
8. Build the per-question table: one row per question with retrieved ids, rank of the first correct passage, and a present/absent flag. Read the rows rather than the aggregate. <!-- id: rag-05-metadata-and-evaluation-t08 band: focused energy: normal -->
9. Run RAGAS — or your own faithfulness check with a local judge — on your pipeline. Read every metric's definition before reading the number, then hand-verify three of the judge's verdicts against the context. <!-- id: rag-05-metadata-and-evaluation-t09 band: deep energy: high -->
10. Apply the forward test to three real failures: inject the known-correct chunk and record whether the answer becomes correct. Classify each as retrieval-broken or generation-broken. <!-- id: rag-05-metadata-and-evaluation-t10 band: focused energy: high -->
11. Apply the reverse test to three questions the system gets right: remove the context and check whether quality drops. Report any question where it does not, and treat that as a finding. <!-- id: rag-05-metadata-and-evaluation-t11 band: focused energy: normal -->
12. Turn your evaluation set into a runnable script that reports both halves' numbers and diffs against the previous run. Commit it beside the corpus. <!-- id: rag-05-metadata-and-evaluation-t12 band: deep energy: high -->
13. Audit your metadata for accuracy on a sample of twenty chunks by hand. Report every field you could not verify, and either fix the loader or stop filtering on that field. <!-- id: rag-05-metadata-and-evaluation-t13 band: focused energy: normal -->
14. Write the access-control section of your project's README: where the filter runs, what it is derived from, and what a user could see if it failed. If you cannot write the third part, you do not yet know your exposure. <!-- id: rag-05-metadata-and-evaluation-t14 band: ongoing energy: normal -->

## Common Pitfalls

**Enforcing access control with a prompt instruction.** Telling the model "only use documents the user is permitted to see" is a preference expressed to a probabilistic system, not a control enforced by code. It demos perfectly and fails to a cleverly-phrased request or a document carrying its own instructions. The filter belongs in the retrieval query, derived server-side from the authenticated user.

**Post-filtering and wondering why results are empty.** Retrieving top-10 and then discarding unauthorised chunks returns nothing whenever the permitted slice is small relative to the corpus — and it gets worse as the corpus grows, so it passes testing and fails in production. If your store cannot filter inside the search, that is a reason to change stores.

**Labelling passages that mention instead of passages that answer.** A chunk sharing vocabulary with the question is a distractor, and marking it correct produces a suite that reports healthy recall while users get wrong answers. Label from the question's perspective: would a competent reader need this passage to answer?

**Tuning on the test set and reporting the result.** The moment a parameter changes in response to a test-set number, that half is a dev set. With 25 cases the fitting happens faster than intuition suggests, and the reported improvement is partly noise. Split once and then leave the test half alone.

**Trusting a 25-case number to two decimal places.** Small sets detect direction, not magnitude. "Recall@5 improved from roughly 60% to roughly 85%" is a real finding; "improved from 63.3% to 84.7%" is false precision on a measurement whose confidence interval spans most of that gap.

**Reporting one aggregate number.** An average tells you whether to worry and nothing about what to fix. The per-question table is where the diagnosis lives — especially the questions that changed, in both directions, because a pipeline change that fixes five cases and breaks three is not an improvement even when the average rises.

**Treating RAGAS scores as a verdict rather than a diagnostic.** The metrics measure support and relevance, not truth. A faithfully-grounded answer built from a wrong corpus scores well and is wrong. Optimising these numbers as a target rather than reading them as an instrument is the reward-hacking failure in miniature.

**Forgetting to pin the judge.** An unpinned judge model means last month's numbers are not comparable to this month's, and every trend line you drew is meaningless. Pin the version, and record it beside the results.

**Never running the reverse test.** A system that answers correctly without its retrieved context looks fine and is ungrounded. The outputs are plausible, so nothing prompts you to check, and you find out when parametric recall drifts on a fact that used to be right.

## Deliverable / proof of work

Write `portfolio/rag/05-metadata-and-evaluation.md` containing:

- **The metadata schema** — your fields, each justified as access control or retrieval quality, with the accuracy audit from task 13 and any field you stopped trusting.
- **The access-control design** — where the filter runs, what it derives from, and a demonstrated example of the top-k trap showing post-filtering returning empty where pre-filtering succeeds.
- **The labelled set** — your questions with known answer passages, the dev/test split, the three unanswerable cases, and your labelling rule stated in one sentence.
- **Retrieval numbers** — Recall@k at two values of k, Precision@k, MRR and nDCG, per-question detail alongside the aggregates, and the metric you chose to optimise with your reason.
- **Generation numbers** — faithfulness and answer relevance, or your own equivalent, with the judge named and its version pinned, and your hand-verification of three verdicts.
- **The two-way diagnostic** — the forward test applied to real failures and the reverse test applied to real successes, with each case classified. This section is the phase's core output.
- **What the numbers do not tell you** — the honest paragraph: where your metrics agree with your own reading of quality, and where they do not.

## Checklist

- [ ] I attach metadata at ingestion and can justify each field as access control or retrieval quality <!-- id: rag-05-metadata-and-evaluation-c01 energy: normal -->
- [ ] I enforce access control as a retrieval filter derived server-side, and never as a prompt instruction <!-- id: rag-05-metadata-and-evaluation-c02 energy: high -->
- [ ] I can demonstrate the top-k trap and explain why post-filtering degrades as the corpus grows <!-- id: rag-05-metadata-and-evaluation-c03 energy: high -->
- [ ] I have a labelled question set of 25 or more real questions with answer passages, including unanswerable cases <!-- id: rag-05-metadata-and-evaluation-c04 energy: high -->
- [ ] I can compute Recall@k, Precision@k, MRR and nDCG and say which question each one answers <!-- id: rag-05-metadata-and-evaluation-c05 energy: normal -->
- [ ] I measure retrieval and generation separately, with a number for each <!-- id: rag-05-metadata-and-evaluation-c06 energy: high -->
- [ ] I can run the forward injection test and classify a failure as retrieval-side or generation-side <!-- id: rag-05-metadata-and-evaluation-c07 energy: high -->
- [ ] I have run the reverse test and can name any question answered without its context <!-- id: rag-05-metadata-and-evaluation-c08 energy: normal -->
- [ ] I keep a dev/test split and I have not tuned on the test half <!-- id: rag-05-metadata-and-evaluation-c09 energy: normal -->
- [ ] My judge's identity and version are pinned and recorded beside my results <!-- id: rag-05-metadata-and-evaluation-c10 energy: low -->
- [ ] I can state what my metrics do not measure, and where they would disagree with a human reader <!-- id: rag-05-metadata-and-evaluation-c11 energy: high -->
- [ ] My evaluation runs as a script or test, not as a manual inspection I might skip <!-- id: rag-05-metadata-and-evaluation-c12 energy: normal -->

## Quiz

### Q1. A user reports that your RAG system says "I could not find any relevant documents" for questions about their own small project. Their project has 40 chunks in a 10,000-chunk corpus. What is the most likely cause? <!-- id: rag-05-metadata-and-evaluation-q01 energy: high -->

- [x] You retrieve the top 10 unfiltered and then discard unauthorised chunks, so the permitted 0.4% slice rarely appears in the unfiltered top 10
- [ ] The embedding model is too weak to represent their project's vocabulary
- [ ] The user's chunks were never ingested, since no results are returned
- [ ] The vector index needs rebuilding because the corpus has grown

**Why:** The arithmetic is decisive: a fixed permitted slice of 0.4% of the corpus will very rarely appear in an unfiltered top 10, so a post-filtering implementation returns empty for a user whose documents are present and correct. The failure looks like a content problem, which is why people look for a missing document or a weak model instead of a broken query. The fix is to filter inside the search, so the k neighbours are drawn only from the eligible set.

### Q2. Why is a prompt instruction insufficient for access control? <!-- id: rag-05-metadata-and-evaluation-q02 energy: normal -->

- [ ] Because models cannot reliably read permission metadata
- [x] Because it is a preference expressed to a probabilistic system rather than a constraint enforced by code, so documents the user may not see still enter the context window
- [ ] Because prompt instructions cost tokens that could be spent on retrieval
- [ ] Because providers strip permission-related content during safety filtering

**Why:** The decisive point is that the forbidden document reaches the model at all. Once it is in the context window, extraction depends only on how the request is phrased, and a document carrying its own instructions can also influence the outcome. Enforcement in the retrieval query means the model never receives what the user may not see, so there is nothing to leak regardless of phrasing. Cost is a real but secondary concern, and the metadata-reading and provider-stripping claims are not the mechanism.

### Q3. Your retrieval shows Recall@10 of 92% and the answers are still frequently wrong. What is the most useful next measurement? <!-- id: rag-05-metadata-and-evaluation-q03 energy: high -->

- [ ] Raise k to 50 and see whether recall improves further
- [ ] Replace the embedding model with a larger one
- [ ] Add a reranker to improve the ordering of the retrieved set
- [x] Apply the forward test — inject the known-correct chunk and see whether the answer becomes right — because high recall means the failure is probably generation-side

**Why:** High recall means the answer material is reaching the context window, so retrieval is unlikely to be the gate and the remaining suspect is what the model does with it. Injecting the known-correct chunk separates the two cleanly in seconds: correct with the injected chunk isolates the problem to generation, and still-wrong points at the prompt, the ordering, or the model's capability. Raising k is wrong because recall is already high — more passages adds distractors rather than information. A reranker improves ordering, which recall does not measure but also does not explain with the answer material already present.

### Q4. What does it mean that RAGAS is a reference-free evaluation framework? <!-- id: rag-05-metadata-and-evaluation-q04 energy: normal -->

- [ ] That its metrics require no labels and are therefore objective and bias-free
- [ ] That it evaluates retrieval without using a language model
- [x] That it evaluates without requiring ground-truth human annotations, which is what makes automated RAG evaluation practical — while the metrics are still computed by an LLM judge and inherit that judge's biases
- [ ] That it can be run without a corpus

**Why:** Reference-free is the property that removed the step stopping most teams from evaluating at all, because hand-writing a gold answer per question is expensive. It does not mean the measurement is objective: faithfulness and relevance are judged by a language model, which brings the documented preferences for longer answers, for its own outputs, and for particular option orderings. The two halves of the correct answer belong together — reference-free is a genuine practical advance, and the judge dependency is a genuine limitation that requires pinning the version, using a different model family, and reading a sample of verdicts.

### Q5. You tune your chunk size on a 25-question set, find the best value, and report that recall improved from 63.3% to 84.7% on the same set. What is wrong? <!-- id: rag-05-metadata-and-evaluation-q05 energy: high -->

- [x] You tuned and reported on the same set, so the improvement is partly fitted to noise, and 25 cases cannot support two-decimal precision
- [ ] Nothing — a 21-point improvement is far too large to be noise
- [ ] Chunk size does not affect recall, so the measurement is meaningless
- [ ] You should have used Recall@10 rather than the k you chose

**Why:** Two distinct errors compound here. Tuning on a set and then reporting on it converts that set into training data, so part of the gain is the parameter fitting the particular questions rather than a general improvement — which is why the dev/test split must be made once and the test half left alone. And with 25 cases the confidence interval is wide enough that the decimal places are false precision: the honest report is "roughly 60% to roughly 85%", which is a real and useful finding. Chunk size genuinely affects recall, as Phase 2 established.

### Q6. You mark a retrieved passage as correct because it discusses the same topic as the question, though it does not contain the answer. What is the consequence? <!-- id: rag-05-metadata-and-evaluation-q06 energy: normal -->

- [ ] None, since topical relevance is what retrieval is supposed to measure
- [x] Your metrics will report healthy retrieval while users receive wrong answers, because your labels now encode a different question from the one that matters
- [ ] Recall will fall but precision will rise, and the two will cancel out
- [ ] The generator will compensate by reasoning from the passage

**Why:** Every retrieval metric measures agreement with your labels, so labels that ask "is this about the topic?" measure topical similarity rather than answerability, and the numbers will look good while the system fails. This is the most common way an evaluation suite becomes confidently meaningless, and no metric can detect it from the inside. The labelling rule that prevents it is to ask, from the question's perspective, whether a competent reader would need this passage in order to answer.

### Q7. Your system answers a question correctly. You remove the retrieved context and it still answers correctly. What have you learned? <!-- id: rag-05-metadata-and-evaluation-q07 energy: high -->

- [ ] The model is robust to missing context, which is a desirable property
- [ ] The retrieval is working unusually well and can be reduced to save cost
- [ ] The question was unanswerable from the corpus, so the correct answer was coincidental
- [x] The pipeline was not actually using the retrieved context — the answer came from parametric knowledge, so the retrieval adds cost without grounding

**Why:** This is the reverse test, and it detects the failure mode that hides best because the outputs look right. If removing the context does not degrade quality, the context was not contributing, and the system is paying for embeddings and retrieval while answering from memory — which will drift wrong exactly where parametric recall is blurred. Robustness is not the explanation, since the model is answering from somewhere and the question is which. Reduced cost is the wrong conclusion to draw from an ungrounded system, and coincidental correctness on an unanswerable question is the separate branch the forward test investigates.

### Q8. Which of these should be a programmatic check rather than an LLM judge? <!-- id: rag-05-metadata-and-evaluation-q08 energy: normal -->

- [ ] Whether an answer's prose is supported by the retrieved passage
- [ ] Whether an answer addresses the question that was asked
- [x] Whether the quoted span actually appears in the chunk the answer cites
- [ ] Whether an answer is thorough enough to be useful

**Why:** The governing principle is that code beats a judge whenever the outcome is checkable, and substring containment is exactly checkable — deterministic, free, and immune to judge bias. Support and relevance are genuinely judgement calls about prose, which is what the judge is for, and they are where its biases must be managed. Thoroughness is not reliably measurable by either, which is why it is a poor metric and usually a proxy for length, the very thing judges are documented to over-reward.

### Q9. What does high faithfulness with a wrong final answer tell you? <!-- id: rag-05-metadata-and-evaluation-q09 energy: high -->

- [ ] The metric is broken and should be replaced
- [ ] The judge is biased toward the generator's outputs
- [x] The answer was supported by the retrieved context, so the fault is either in the corpus or in retrieval having supplied a confidently-worded passage that does not answer the question
- [ ] The generator ignored the context and answered from parametric knowledge

**Why:** Faithfulness measures support, not truth — so a well-grounded answer built from a wrong or irrelevant source scores highly and is still wrong. The two remaining suspects are the corpus containing incorrect material, or retrieval supplying a passage that reads as authoritative without answering the question. This is precisely why the metrics are a diagnostic instrument rather than a verdict, and why the forward test follows the numbers rather than replacing them: it distinguishes "the right passage was absent" from "the wrong passage was present". Parametric answering would show up in the reverse test instead.

### Q10. Why is Recall@k described as a gate rather than a verdict? <!-- id: rag-05-metadata-and-evaluation-q10 energy: normal -->

- [x] Because if the answer passage is not in the context the generator cannot succeed, so recall bounds what is possible — while recall can be high and the system still be bad
- [ ] Because recall is the only metric that can be computed without labels
- [ ] Because recall is unaffected by the ordering of retrieved passages
- [ ] Because recall measures the generator as well as the retriever

**Why:** Both halves of the claim matter. Recall is a gate because it determines whether the needed information is available at all, which is why it is the first number to inspect when answers are wrong. It is not a verdict because retrieving 50 passages for a single-passage answer gives near-perfect recall while drowning the generator in distractors — so precision, ordering and generation quality all still have to be measured. Recall does require labels, contrary to the second option, and it measures retrieval only, though it is unaffected by ordering except through the cutoff.

## You're ready to move on when...

You have a retrieval index that filters inside the search, and you have demonstrated the top-k trap by making post-filtering return empty where pre-filtering succeeds. You can say where your access control is enforced, what it derives from, and what a user would see if it failed.

You have a labelled set of at least 25 real questions with known answer passages, including cases your corpus cannot answer, split into dev and test with the test half untouched after tuning. You have numbers for retrieval — Recall@k, Precision@k, MRR, nDCG — and separate numbers for generation, with your judge pinned and three of its verdicts hand-verified. You can read the per-question table, not just the aggregate.

And you can run the diagnostic without notes: inject the known-correct chunk and classify the failure as retrieval-side or generation-side, and remove the context from a correct answer and say whether the system was grounded. If you cannot yet localise a failure to one half, the numbers are not yet doing their job.

## Free vs Paid

### What's free is enough

The entire phase, without qualification. This is one of the clearest cases in the curriculum where the free path is not a compromise.

Every tool is free and open-source: SQLite with FTS5, FAISS, sentence-transformers, `ranx`, RAGAS itself, pandas, pytest. Every metric in this phase is a formula you can implement in twenty lines, and implementing one by hand then checking it against a library is one of the prescribed tasks. Your embeddings and your cross-encoder run locally. Every paper — RAGAS, LLM-as-judge, Lost in the Middle, the original RAG paper — is on arXiv, and RRF is a freely available SIGIR paper.

The labellers are you, and the labelled set is a Markdown or CSV file you write. The dev/test split is a line in that file. The evaluation script is a hundred lines you own.

**And the free path has a genuine advantage here, which is worth stating because it is not obvious.** Evaluating with a **local model as judge** makes the loop free, which makes it fast, which means you run it constantly — and an evaluation suite you run constantly is dramatically more useful than one you run when you can afford it. This is the same argument Phase 7 of Cost made for keeping evaluation off a paid meter: the workload is high-volume and low-stakes, which is exactly the shape a local model handles acceptably.

The honest limitation of the free path is the **judge's quality**. A small local model is a less reliable faithfulness judge, particularly on cases requiring careful reading, and it will produce noisy verdicts. The prescribed response is to use it for the dev loop where you need direction and can tolerate noise, hand-verify a sample of its verdicts, and reserve a stronger judge for the numbers you intend to report.

### What a paid tier adds

Three things, and only the first is load-bearing.

**A stronger judge, which improves generation-metric reliability.** This is the real one. Faithfulness and relevance judgements are the part of evaluation where model capability shows up most directly, and a weak judge produces numbers you have to discount. A paid frontier model as judge, used sparingly on a fixed suite, gives you generation metrics you can report with confidence. **Volatile, dated: as of 2026-09, which models judge most reliably, and what that costs per run, changes on the order of months — check current model lists and pricing rather than any summary, including this one.**

**Volume that makes a large suite practical.** If your test set grows to thousands of cases, or you want to evaluate with several judge configurations, the per-call cost becomes real and a free tier's limits bind. This is Phase 7 of Cost's "rate limits that make a workload structurally impossible" category — the suite simply cannot run at your tier.

**Hosted RAGAS and evaluation dashboards.** Managed evaluation services exist that run the framework for you and track results over time. They buy convenience and history-keeping, not capability, and everything they do is reproducible with the open-source library plus a script and a git repository.

**One thing money does not buy here, which is worth saying plainly.** It does not buy you a **labelled set**. The questions and answer passages are human judgement, and no tier produces them. This is the step that stops teams from evaluating, and it is free — it costs attention rather than money. A reader on a zero budget with 25 well-labelled questions and a local judge is in a stronger position than one with a paid frontier judge and no labels, because the labels are what the metrics measure against.

### When it's worth paying

**Not for this phase.** Every task runs on a local model and free tooling, and the deliverables are a filtered index, a labelled set, and measurements — none of which a paid tier improves.

The threshold arrives later and it is specific: **when you have a suite you trust and a decision you need to make with it.** If you are choosing between two retrieval architectures for a real system, or you need generation numbers you intend to show someone, then a stronger judge on a pinned suite is a decision-changing purchase in Phase 7 of Cost's sense — the experiment produces information you would not otherwise have. Until you have labels and a harness, a better judge only gives you more confident numbers about a suite that does not measure the right thing.
