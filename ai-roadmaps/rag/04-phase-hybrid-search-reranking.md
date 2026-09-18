---
id: rag-04-hybrid-search-reranking
track: rag
phase: 4
order: 40
title: Hybrid Search and Reranking
duration: 2 weeks
duration_weeks: 2
energy_mix: [normal, high]
deliverable: portfolio/rag/04-hybrid-search-reranking.md
exit_criteria: >
  You can build a retrieval pipeline that combines lexical and dense evidence
  with rank fusion, rerank the candidates with a cross-encoder, and show a
  measured improvement over either retriever alone.
---

# Phase 4 — Hybrid Search and Reranking

## Goal of this phase

Make retrieval actually good. By the end you will have a pipeline that runs lexical and dense retrieval in parallel, fuses their results by rank, reranks the candidates more carefully, and — critically — a measurement showing it beats dense-only on your corpus.

This is the phase where most real RAG systems improve the most. If you only do one upgrade from the previous phase, do this one.

## Estimated time

**2 weeks** at 1–2 hours a day, 5 days.

The first week covers lexical search and fusion. The second covers reranking and query transformation. Both halves pay off immediately, and both need measurement to confirm.

## Skills you'll gain

- Implement BM25 lexical search and explain why it fixes what embeddings miss
- Combine dense and lexical results with Reciprocal Rank Fusion
- Explain why rank-based fusion avoids the score-calibration problem
- Add a cross-encoder reranker and measure the gain
- Apply query transformations: rewriting, multi-query, HyDE, decomposition
- Show incremental improvement over dense-only with real numbers

## Specific topics to learn

### Lexical retrieval

- BM25 and what its components do
- Inverted indexes and why they are fast
- SQLite FTS5 as a free BM25 engine
- Why lexical and dense fail in opposite directions

### Fusion

- Why you cannot just add the scores
- Reciprocal Rank Fusion and the k constant
- Weighted fusion and when it is justified
- Choosing the candidate depth before fusion

### Reranking

- Bi-encoders versus cross-encoders
- Why cross-encoders are more accurate and much slower
- The retrieve-many-then-rerank-few architecture
- Choosing the rerank depth and the final k

### Query transformation

- Rewriting for retrieval
- Multi-query expansion
- HyDE: embedding a hypothetical answer
- Decomposition and step-back prompting

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| SQLite FTS5 | BM25 lexical search with zero setup | Free/open-source | https://sqlite.org/fts5.html | Index your chunks and run keyword queries | Whoosh, or `rank_bm25` in Python |
| rank_bm25 | Pure-Python BM25 for small corpora | Free/open-source | https://github.com/dorianbrown/rank_bm25 | Implement BM25 over your chunks and compare with FTS5 | Write it yourself in 60 lines |
| sentence-transformers CrossEncoder | Rerank candidates locally | Free/open-source | https://sbert.net/docs/cross_encoder/usage/usage.html | Rerank top-50 candidates and measure Recall@5 change | A hosted rerank API free tier |
| Qdrant | Hybrid search with built-in fusion | Free/open-source | https://qdrant.tech/documentation/concepts/hybrid-queries/ | Test server-side RRF against your own implementation | Chroma plus manual fusion |
| Ollama | Query rewriting and HyDE locally | Free/open-source | https://ollama.com/ | Generate query variants at no cost | Any free chat model |
| scikit-learn | Normalise and combine scores when needed | Free/open-source | https://scikit-learn.org/ | Min-max normalise scores for weighted fusion | numpy |

## Free/cheap resources

- **Cormack, Clarke & Buettcher — Reciprocal Rank Fusion (SIGIR 2009)** — https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf
- **Gao et al. — HyDE (arXiv:2212.10496)** — https://arxiv.org/abs/2212.10496
- **Zheng et al. — Step-Back Prompting (arXiv:2310.06117)** — https://arxiv.org/abs/2310.06117
- **Anthropic — Contextual Retrieval** — https://www.anthropic.com/news/contextual-retrieval
- **SQLite FTS5 documentation** — https://sqlite.org/fts5.html
- **sentence-transformers — Cross-Encoders** — https://sbert.net/docs/cross_encoder/usage/usage.html

## Lesson: Two Retrievers That Fail Differently

### Part 1 — Why one retriever is never enough

The previous phase ended on a specific failure: dense retrieval cannot match exact identifiers. This phase begins with its mirror image, because the two failures are complementary in a way that makes the combination obviously right once you see it.

**Dense retrieval** matches *meaning*. It finds "how do I reset my password" when the document says "account recovery procedure". It fails on `ERR_CONN_4471` because a code has no meaning to represent.

**Lexical retrieval** matches *terms*. It nails `ERR_CONN_4471` precisely, because the string is in the index. It fails completely on paraphrases — a query for "reset password" does not match a document about "account recovery", because they share no words.

```text
Query: "how do I reset my password"
  Dense:  finds "account recovery procedure"      <- meaning, no shared terms
  Lexical: finds nothing                          <- no shared terms

Query: "ERR_CONN_4471"
  Dense:  finds ERR_CONN_4412 and 4470            <- similar-looking codes
  Lexical: finds ERR_CONN_4471 exactly            <- the string is in the index
```

**Their weaknesses are opposite, which is the entire argument for running both.** A document missing from one retriever's results is often found by the other, and fusion combines them.

#### BM25, and what it is doing

The standard lexical ranking function. It scores a document against a query with three components, and understanding them tells you when it will behave unexpectedly.

**Term frequency (TF), saturated.** A document containing a query term more often scores higher — but with diminishing returns. The tenth occurrence adds much less than the second. This saturation is deliberate: it stops a document from winning purely by repeating a word, which is the failure mode of raw term counting.

**Inverse document frequency (IDF).** Rare terms are worth more than common ones. A query term appearing in 3 of 10,000 documents is highly informative; one appearing in 9,000 tells you almost nothing. This is why stopwords matter so little — "the" carries nearly zero IDF, so its presence is naturally discounted.

**Length normalisation.** Longer documents contain more terms by chance, so they would otherwise win unfairly. BM25 divides by a length factor to compensate.

```text
score(query, doc) = sum over query terms t of:
    IDF(t) * ( saturated_TF(t, doc) )
            * ( length_normalisation(doc) )
```

Two practical consequences:

**Rare identifiers score extremely well.** An error code appearing in three documents has enormous IDF, so a query containing it ranks those three at the top. This is precisely the behaviour dense retrieval lacks, and it is why hybrid works.

**Common words score poorly.** "What is the policy for time off" — "is", "the", "for" contribute almost nothing, and even "policy" and "time" may be common. So BM25 is not a naive keyword matcher; it is a surprisingly strong baseline that in some benchmarks is competitive with dense retrieval on its own.

#### Free implementation

You do not need Elasticsearch. SQLite's FTS5 extension provides BM25 ranking in a single file with no server:

```sql
CREATE VIRTUAL TABLE chunks USING fts5(
    text,
    source_id UNINDEXED,
    section_path UNINDEXED,
    tokenize = 'porter unicode61'
);

SELECT source_id, bm25(chunks) AS score
FROM chunks
WHERE chunks MATCH ?
ORDER BY score
LIMIT 50;
```

Note that `bm25()` in SQLite returns a **negative** value where more negative is better, which has caught many people. Check your engine's sign convention before mixing scores — and as Part 2 explains, the cleanest fix is not to mix scores at all.

The `porter` tokenizer applies stemming, so "running" matches "run". That helps recall on English text and is worth testing on your corpus, since stemming can also merge terms you wanted distinct.

---

### Part 2 — Fusing two rankings without fusing two scales

Now you have two ranked lists and need one. The obvious approach is to add the scores, and it is wrong.

#### Why you cannot add the scores

**BM25 scores are unbounded and corpus-dependent.** A rare term can produce a score of 40; a common one, 2. The range depends on your corpus size, document lengths, and query composition. There is no fixed scale.

**Cosine similarities are bounded, typically 0 to 1.** A good match might be 0.82 and a poor one 0.41. The range is narrow and absolute.

Adding them means the BM25 score dominates whenever it is large, and contributes nothing when it is small — so your "hybrid" system is really "BM25 with a tiebreaker", decided by an accident of scale rather than by any judgement you made. This is the single most common implementation error in hybrid search.

You *can* normalise first — min-max each list to 0–1, then weight:

```python
def minmax(scores):
    lo, hi = min(scores), max(scores)
    return [(s - lo) / (hi - lo) for s in scores]
```

But normalisation is fragile. It depends on the score distribution within each query's result set, so a query where all candidates are weak produces a top score of 1.0 by construction, making a bad result look excellent. **You are inventing comparability that the underlying numbers do not have.**

#### Reciprocal Rank Fusion

The fix is to stop comparing scores and compare **ranks**. Cormack, Clarke & Buettcher, SIGIR 2009.

```text
RRF_score(document) = sum over each retriever r of  1 / (k + rank_r(document))
```

Where `rank_r` is the document's 1-based position in retriever *r*'s list, and `k` is a constant, conventionally **60**.

Why this works, in three points:

**Ranks are comparable; scores are not.** Position 3 in the BM25 list and position 3 in the vector list both mean "third best according to this retriever". That is a meaningful, scale-free statement. A score of 40 and a score of 0.82 are not.

**The k constant damps the top.** Without it, rank 1 would score 1/1 = 1.0 and utterly dominate. With k=60, rank 1 scores 1/61 ≈ 0.0164 and rank 10 scores 1/70 ≈ 0.0143 — a real but modest difference. This means **agreement between retrievers matters more than excellence in one**, which is exactly the property you want: a document both retrievers rank highly is more likely genuinely relevant than one that tops a single list.

**It requires no tuning and no normalisation.** Rank-based fusion has no parameters to fit beyond k, which is stable across corpora. That robustness is why it is the default in most systems, including Qdrant's built-in hybrid queries.

A worked example:

```text
Document A: BM25 rank 1,  dense rank 40
  RRF = 1/(60+1) + 1/(60+40) = 0.01639 + 0.01000 = 0.02639

Document B: BM25 rank 5,  dense rank 3
  RRF = 1/(60+5) + 1/(60+3) = 0.01538 + 0.01587 = 0.03125

Document B wins.
```

Document A tops one list and is nearly absent from the other. Document B is strongly ranked by both. **RRF prefers B, and B is usually the better answer** — this is the whole idea in one example.

#### Implementing it

```python
def rrf(result_lists, k=60):
    scores = {}
    for results in result_lists:
        for rank, doc_id in enumerate(results, start=1):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
    return sorted(scores.items(), key=lambda x: -x[1])
```

Twelve lines, no dependencies, no tuning. Keep it and use it; writing your own makes the mechanism obvious in a way that calling a library does not.

#### How deep to retrieve before fusing

Fusion can only combine what it is given, so **retrieve deeper than your final *k*.** If you want 5 final results, retrieving 5 from each retriever gives fusion very little to work with — a document at BM25 rank 7 that dense ranks 2 will never be seen.

A common pattern is to retrieve around 50 from each retriever, fuse, then take the top 20 to rerank and the top 5 to generate. The extra work is cheap — lexical search is fast and vector search at 50 is barely different from 5 — and the recall gain is real.

```text
dense  top 50  ─┐
                ├─ RRF ─> top 20 ─> rerank ─> top 5 ─> prompt
lexical top 50 ─┘
```

#### When weighted fusion is justified

If your corpus is skewed — heavily identifier-based, or purely prose — you may want to weight one retriever. RRF accommodates this by scaling each retriever's contribution:

```python
scores[doc_id] += weight * (1 / (k + rank))
```

The honest guidance: **start unweighted.** RRF's default behaviour is strong, weighting adds a parameter you must justify, and if you do weight, set it from a measurement on held-out queries rather than from intuition. A weight tuned on your test queries is a weight that has memorised them.

---

### Part 3 — Reranking: the best single upgrade

You now have a good candidate set. Reranking makes it much better, and the reason is architectural.

#### Bi-encoder versus cross-encoder

**A bi-encoder is what you have been using.** The query and each document are embedded **separately**, and similarity is computed from the two vectors.

- *Why it is fast:* document embeddings are computed once at index time and reused for every query. At query time you embed only the query.
- *What it costs:* the query never sees the document. The query embedding is a fixed point in space, and the document must happen to be near it. Subtle interactions between query and document — negations, qualifiers, whether the document actually answers *this* question — cannot be represented.

**A cross-encoder takes the query and document together** as a single input and produces a relevance score directly.

- *Why it is more accurate:* the model attends to query and document jointly, so it can judge whether this document answers this query, including negation and qualification.
- *What it costs:* **the score is query-specific, so nothing can be precomputed.** Reranking 10,000 documents means 10,000 forward passes. It is orders of magnitude slower.

That asymmetry dictates the architecture:

```text
CHEAP AND FAST, OVER EVERYTHING:
  bi-encoder retrieval  ->  candidates from the whole corpus

EXPENSIVE AND ACCURATE, OVER A FEW:
  cross-encoder rerank  ->  precise ordering of ~20-50 candidates
```

**You cannot rerank the whole corpus.** You can rerank a small candidate set that retrieval produced. So reranking improves *ordering*, and retrieval determines *whether the answer is present at all*. This is why the diagnostic from Phase 1 matters: if the right chunk is not in the candidate set, no reranker can save you.

#### Measuring the gain

This is where the phase earns its keep, and the measurement is small:

```python
questions = load_questions()   # with known answer chunk ids

# Baseline: fused results, no rerank
hits_fused = sum(q.answer_id in [d.id for d in rrf_results(q)][:5] for q in questions)

# With rerank: fused top-50, reranked, take 5
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
def reranked(q):
    cands = rrf_results(q)[:50]
    scores = reranker.predict([(q.text, c.text) for c in cands])
    return [c for _, c in sorted(zip(scores, cands), reverse=True)]
hits_reranked = sum(q.answer_id in [d.id for d in reranked(q)][:5] for q in questions)

print(f"fused: {hits_fused}/{len(questions)}   reranked: {hits_reranked}/{len(questions)}")
```

Anthropic's Contextual Retrieval results illustrate the typical shape: retrieval failure fell from 5.7% with embeddings alone to 2.9% with contextual BM25 added, then to 1.9% with reranking. Treat those as illustrative rather than predictive — but note the **pattern**, which is that reranking contributed a large share of the total improvement.

The model named above is small and runs locally for free. Larger rerankers exist and are better; the small ones are good enough that **the gain from adding any reranker usually exceeds the gain from upgrading to a better one**, which is the correct order to spend effort in.

#### Practical choices

**How many to rerank?** Enough to give the reranker room to work, not so many that latency suffers. 20–50 candidates is a common range. Reranking 10 is barely useful, because the reranker can only reorder what retrieval already ranked highly.

**What to take forward?** Fewer chunks means less dilution and less cost. 3–8 is typical. As always, measure — and note that "more context" is not automatically better, as the Prompting track's context-engineering material explains.

**Watch the latency.** A cross-encoder on 50 candidates at ~50 ms each is 2.5 seconds. Batch the predictions; use a GPU if you have one; consider reranking 20 rather than 50. Latency is the real cost of reranking, not money.

**Reranking does not fix a bad candidate set.** If retrieval missed the answer, reranking reorders irrelevant documents. Measure retrieval recall *before* reranking, separately from after — otherwise you cannot tell which stage is failing.

---

### Part 4 — Query transformation

Everything so far processes the user's query as given. Often the query is the problem.

#### Rewriting

A follow-up question is usually incomprehensible on its own. In a conversation:

```text
User: "What's the refund window?"
Assistant: "30 days from delivery."
User: "And for digital goods?"
```

The second query, retrieved verbatim, has no content — "digital goods" might match anything. Rewriting with the conversation history produces "What is the refund window for digital goods?", which retrieves correctly.

This pattern is called **query rewriting** or **condensation**, and it is close to mandatory for any conversational RAG. One cheap model call, run on the query, producing a self-contained version. It is also a good example of a general principle from the Prompting track: **use a small model for a small, well-specified transformation.**

#### Multi-query

Generate several paraphrases of the query, retrieve for each, and fuse the results with RRF.

- *Why it works:* different phrasings match different documents, so you broaden the net without embedding a single query perfectly.
- *What it costs:* one generation call plus N retrievals. Latency grows.

Worth it when recall matters more than latency — a research tool rather than a chatbot.

#### HyDE — embedding a hypothetical answer

Gao et al., arXiv:2212.10496. A neat trick that exploits an asymmetry between questions and answers.

Questions and answers are **lexically dissimilar even when they match**. "What is the refund window?" and "Customers may return items within 30 days of delivery" share almost no vocabulary. Embedding the question and searching for the answer means matching across that gap.

HyDE's idea: **ask a model to invent a plausible answer, then embed the invented answer instead of the question.**

```text
Query:            "What is the refund window?"
Hypothetical:     "Customers may return items within 30 days of purchase
                   for a full refund, provided the item is unused."
Embed this:       the hypothetical, not the query
```

The invented answer is likely factually wrong — 30 days may be 14 — and **that does not matter.** What matters is that it is written in the *style and vocabulary of an answer*, so it lands near real answer passages in embedding space. You are using the model to translate from question-space to answer-space.

Caveats: it costs a generation call, it can hallucinate in a direction that misleads retrieval if the domain is unfamiliar, and it is most valuable for short vague queries where the question/answer vocabulary gap is largest. Test it — it helps a lot on some corpora and barely at all on others.

#### Decomposition

Some queries contain several questions. "Compare our refund policy with the industry standard" is two retrievals with different targets. Decomposing into sub-questions, retrieving for each, and synthesising is more reliable than retrieving once for a compound query, because the compound embedding averages the parts and matches neither well.

#### Step-back prompting

Zheng et al., arXiv:2310.06117. Instead of retrieving for the specific question, first generate a **more general** question and retrieve for that.

```text
Specific:  "Why did the build fail on commit a3f9c21?"
Step back: "What are the common causes of build failures in this project?"
Retrieve:  the step-back question, which finds conceptual documentation
Combine:   step-back results + specific results
```

The insight is that specific questions often need general background, and retrieving only for the specific query returns narrow documents that assume the background. Retrieving both, then answering with both, works better.

#### Where query transformation stops being worth it

Every transformation adds a model call before retrieval, so **latency and cost grow linearly while the benefit does not.** Three honest limits:

**If retrieval already works, transformations add little.** Measure first. Adding HyDE to a system with 95% recall at k=5 buys nothing.

**Each transformation is another failure point.** A rewriting step that mangles a query is worse than no rewriting, and it fails silently — you get confident results for the wrong question.

**Cache aggressively.** Query transformations on common queries are highly cacheable, which the Cost track covers, and this can remove most of the cost.

The disciplined order of operations:

```text
1. hybrid + RRF                 <- biggest, cheapest win
2. reranking                    <- second biggest win
3. contextual retrieval         <- fixes unfindable chunks (Phase 2)
4. query rewriting (if chat)     <- necessary for follow-ups
5. multi-query / HyDE / step-back <- only if measurement shows a remaining gap
```

Steps 1 and 2 are where the improvement is. Steps 4 and 5 are refinements, and reaching for them before 1 and 2 is a common way to add complexity without adding quality.

---

## Hands-on practice tasks

1. Index your chunks in SQLite FTS5 and run ten keyword queries, including one with an exact identifier. <!-- id: rag-04-t01 band: focused energy: normal -->
2. Run the same ten queries through your dense index and record where the two lists disagree. <!-- id: rag-04-t02 band: focused energy: normal -->
3. Implement RRF in your own code and fuse the two lists. Print the fused top 10 for three queries. <!-- id: rag-04-t03 band: focused energy: normal -->
4. Show that adding raw BM25 and cosine scores together produces different and worse rankings than RRF on the same data. <!-- id: rag-04-t04 band: deep energy: high -->
5. Add a cross-encoder reranker over fused top-50 and measure Recall@5 before and after on your question set. <!-- id: rag-04-t05 band: deep energy: high -->
6. Experiment with reranking 10, 25 and 50 candidates, and record recall and latency for each. <!-- id: rag-04-t06 band: focused energy: normal -->
7. Take a vague query you know performs badly and try HyDE on it. Record whether the hypothetical answer retrieves better than the question. <!-- id: rag-04-t07 band: focused energy: normal -->
8. Write the incremental results table showing dense-only, hybrid, and hybrid-plus-rerank scores on the same 20 questions. <!-- id: rag-04-t08 band: focused energy: normal -->

## Common Pitfalls

**Adding BM25 and cosine scores directly.** The scales are incomparable, so the larger-ranged score silently dominates. Use rank-based fusion.

**Retrieving too few candidates to fuse.** Fusion cannot combine what it was not given. Retrieve deeper — around 50 from each — before fusing.

**Reranking the whole corpus.** Impossible: cross-encoder scores cannot be precomputed, so it is one forward pass per document. Reranking is a second stage over a small candidate set.

**Expecting reranking to fix a retrieval miss.** If the answer is not in the candidate set, reranking reorders irrelevant documents. Measure retrieval recall separately from reranked recall.

**Weighting retrievers before measuring.** Start unweighted. A weight tuned on your test queries has memorised them.

**Stacking query transformations before fixing the basics.** Hybrid and reranking come first. HyDE on a system with good recall buys nothing and costs a generation call per query.

**Ignoring the reranker's latency.** Fifty candidates at 50 ms each is 2.5 seconds. Batch, reduce the candidate count, or accept a slower system knowingly.

## Deliverable / proof of work

Write `portfolio/rag/04-hybrid-search-reranking.md` containing:

- **A working hybrid pipeline** — lexical plus dense, fused with RRF, with your own RRF implementation shown
- **A disagreement analysis** — queries where lexical and dense returned different results, with the reason for each
- **The score-fusion demonstration** — rankings from adding raw scores versus RRF on the same data
- **A reranking measurement** — Recall@5 for dense-only, hybrid, and hybrid+rerank on the same question set
- **A candidate-depth experiment** — recall and latency at three rerank depths
- **An incremental improvement table** showing what each stage contributed

## Checklist

- [ ] I can explain why dense and lexical retrieval fail in opposite directions <!-- id: rag-04-c01 energy: normal -->
- [ ] I can describe what BM25's term frequency, IDF and length normalisation each do <!-- id: rag-04-c02 energy: normal -->
- [ ] I have implemented BM25 with SQLite FTS5 or rank_bm25 over my own chunks <!-- id: rag-04-c03 energy: normal -->
- [ ] I can explain why adding BM25 and cosine scores directly is wrong <!-- id: rag-04-c04 energy: normal -->
- [ ] I have implemented RRF from the formula and can explain what k=60 does <!-- id: rag-04-c05 energy: high -->
- [ ] I retrieve deeper than my final k before fusing <!-- id: rag-04-c06 energy: normal -->
- [ ] I can explain the bi-encoder versus cross-encoder tradeoff and why it dictates the architecture <!-- id: rag-04-c07 energy: normal -->
- [ ] I have measured the recall gain from reranking on my own questions <!-- id: rag-04-c08 energy: high -->
- [ ] I know reranking cannot fix a candidate set that lacks the answer <!-- id: rag-04-c09 energy: normal -->
- [ ] I can explain HyDE and why a factually wrong hypothetical still helps <!-- id: rag-04-c10 energy: normal -->
- [ ] I know why query rewriting is close to mandatory for conversational RAG <!-- id: rag-04-c11 energy: normal -->
- [ ] I can state the order of upgrades and why hybrid and rerank come before query transformation <!-- id: rag-04-c12 energy: high -->

## Quiz

### Q1. Why should you not add a BM25 score and a cosine similarity together to rank results? <!-- id: rag-04-q01 energy: normal -->

- [ ] Because BM25 is always more accurate than cosine similarity
- [x] Because BM25 scores are unbounded and corpus-dependent while cosine is bounded, so the wider-ranged score silently dominates the ranking
- [ ] Because cosine similarity must be used alone by definition
- [ ] Because BM25 returns negative values that invert the ordering

**Why:** The scales carry different meanings and no shared unit. Adding them means an accident of range decides which retriever wins, and your "hybrid" system is really one retriever with a tiebreaker. Rank-based fusion sidesteps the problem by comparing positions rather than scores.

### Q2. In Reciprocal Rank Fusion with k=60, why does a document ranked 5th by both retrievers beat one ranked 1st by one and 40th by the other? <!-- id: rag-04-q02 energy: high -->

- [ ] Because rank 1 is penalised for being too confident
- [ ] Because the second document is likely longer
- [x] Because the k constant damps the top of each list, so consistent agreement across retrievers outweighs excellence in a single one
- [ ] Because the formula weights later ranks more heavily

**Why:** With k=60, rank 1 contributes about 0.0164 and rank 40 about 0.0100, so topping one list is worth only slightly more than being 40th. Meanwhile being 5th and 3rd contributes on both sides. The design intent is exactly this: agreement across independent retrievers is better evidence of relevance than one retriever's enthusiasm.

### Q3. What is the fundamental reason a cross-encoder is more accurate than a bi-encoder? <!-- id: rag-04-q03 energy: normal -->

- [ ] It uses more parameters
- [x] It processes query and document together, so it can judge whether this document answers this query, including negation and qualifiers
- [ ] It is trained on more data
- [ ] It uses a larger embedding dimension

**Why:** A bi-encoder embeds the query and each document independently, so the query never sees the document — the document must happen to land near a fixed query point. A cross-encoder attends to both jointly, which is why it can represent interaction, and why its scores cannot be precomputed and it must run per candidate.

### Q4. You add a reranker but recall at k=5 does not improve. What should you check first? <!-- id: rag-04-q04 energy: high -->

- [ ] Whether the reranker model is large enough
- [ ] Whether you should rerank more candidates
- [x] Whether the answer is present in the candidate set at all — if retrieval missed it, reranking can only reorder irrelevant documents
- [ ] Whether the chunks are too small

**Why:** Retrieval determines whether the answer is reachable; reranking determines its ordering. Measuring retrieval recall before reranking, separately from after, is what distinguishes the two. A reranker cannot recover a document that was never retrieved, and this is the most common reason reranking appears to do nothing.

### Q5. Why can you not rerank the entire corpus with a cross-encoder? <!-- id: rag-04-q05 energy: normal -->

- [ ] Because cross-encoders only support a limited vocabulary
- [ ] Because rerankers require a GPU
- [x] Because a cross-encoder score is query-specific, so nothing can be precomputed and every document needs its own forward pass
- [ ] Because the corpus would exceed the model's context window

**Why:** Bi-encoder document embeddings are computed once and reused across queries, which is what makes corpus-wide search feasible. A cross-encoder's judgement depends on the query, so covering 10,000 documents means 10,000 forward passes per query. That asymmetry is why the architecture is retrieve-many-then-rerank-few.

### Q6. In HyDE, the model generates a hypothetical answer that is usually factually wrong. Why does this still improve retrieval? <!-- id: rag-04-q06 energy: high -->

- [ ] Because the model's factual errors are corrected later
- [ ] Because the wrong answer still contains keywords from the query
- [x] Because the hypothetical is written in the vocabulary and style of an answer, so embedding it lands near real answer passages rather than near other questions
- [ ] Because it increases the number of retrievals performed

**Why:** Questions and answers share little vocabulary even when they match perfectly. HyDE exploits that: it translates the query from question-space into answer-space, and factual accuracy is irrelevant to the translation — only the register matters. It helps most on short vague queries where the vocabulary gap is widest.

### Q7. For a conversational RAG system, why is query rewriting close to mandatory? <!-- id: rag-04-q07 energy: normal -->

- [ ] Because it improves the embedding model's accuracy
- [x] Because follow-up questions are typically uninterpretable alone, so retrieving them verbatim matches the wrong content
- [ ] Because it reduces token cost
- [ ] Because it prevents prompt injection

**Why:** "And for digital goods?" has almost no retrievable content on its own — the subject lives in the previous turn. Rewriting with the conversation produces a self-contained query. It is one cheap model call per turn, and without it, every follow-up retrieves poorly.

### Q8. You have dense retrieval with 95% Recall@5 on your corpus. What is the reasonable next step? <!-- id: rag-04-q08 energy: high -->

- [ ] Add HyDE and multi-query to push recall higher
- [ ] Add a larger reranker
- [x] Verify the remaining failures and consider whether the retrieval half needs work at all before adding more stages
- [ ] Reduce the chunk size

**Why:** High recall means retrieval is rarely the bottleneck, so query transformation adds a generation call per query for almost nothing. The remaining 5% may be chunking, or the questions may be unanswerable from the corpus. Adding stages to a system that already works is how pipelines become slow and fragile without becoming better.

## You're ready to move on when...

You can show a table where dense-only, hybrid, and hybrid-plus-rerank are scored on the same question set, and each stage improves. You have implemented RRF from the formula rather than calling it. You can explain, without notes, why the two retrievers fail in opposite directions.

And you know the order of upgrades — hybrid and rerank first, query transformation later — and can say why reaching for the later steps first is a mistake.

## Free vs Paid

### What's free is enough

This phase is almost entirely free, and this is one of the clearest cases in the curriculum.

SQLite FTS5 gives you BM25 in a single file. `rank_bm25` gives it to you in pure Python. RRF is twelve lines you write yourself. sentence-transformers ships cross-encoder rerankers that run locally, including small models that are fast enough on CPU for a candidate set of 20–50. Query rewriting and HyDE run through Ollama at no marginal cost.

The measurement is free too, which matters more here than anywhere: this phase's value is **proving** hybrid and reranking help on your corpus, and if each experiment cost money you would run fewer of them and end up copying someone else's configuration.

### What a paid tier adds

A hosted rerank API typically offers larger, stronger rerankers and handles the compute, which matters if your candidate set is large or your latency budget is tight. Qdrant and similar databases offer server-side fusion and filtering that you would otherwise implement — convenient, not different in kind.

Larger local rerankers exist and are free; they are simply slower on CPU. If you have a GPU, the gap narrows to nothing.

### When it's worth paying

When reranking 50 candidates locally exceeds your latency budget and a hosted reranker is faster than your CPU. That is a real situation for interactive systems and a non-issue for anything asynchronous — and note that batch processing, from the Cost track, dissolves this constraint entirely by removing the latency requirement.
