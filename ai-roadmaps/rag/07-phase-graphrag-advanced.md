---
id: rag-07-graphrag-advanced
track: rag
phase: 7
order: 70
title: When RAG Is Not Enough
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal]
deliverable: portfolio/rag/07-graphrag-advanced.md
exit_criteria: >
  You can recognise the class of question that no single chunk answers, choose
  between GraphRAG, a cheaper map-reduce alternative and accepting the limit —
  and you can say why starting with GraphRAG is almost always the wrong move.
---

# Phase 7 — When RAG Is Not Enough

## Goal of this phase

Six phases built a retrieval system that answers questions by finding the passages that contain the answer. This phase is about the questions that have no such passage.

Ask "What are the main themes in these 200 documents?" and every technique you have learned fails — not through a bug, but because the question is the wrong shape. There is no chunk that contains the answer, so no amount of better retrieval produces it. The question asks about the corpus as a whole, and retrieval is designed to find local, specific passages.

By the end of this phase you will be able to recognise that class of question, understand what GraphRAG actually does about it (and what it does not claim), reach for a cheaper technique that usually suffices, and — most importantly — know when the honest answer is that you do not need any of this. **This phase's central recommendation is a negative one: do not start with GraphRAG.** The skill it teaches is a decision, not an implementation.

## Estimated time

**1 week** at 1–2 hours a day, 5 days. Roughly 6–8 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Part 1: the class of question retrieval cannot answer | 1.5h |
| 2 | Part 2: what GraphRAG actually does, and what it claims | 2h |
| 3 | Part 3: the cheap alternative — map-reduce over retrieved chunks | 1.5h |
| 4 | Part 4: the decision framework and the cost reality | 1.5h |
| 5 | Deliverable: your question taxonomy and your decision | 1.5h |

If you only have three hours this week, do tasks 1, 2, 6 and 11. Those classify your own questions, test your pipeline against a global one, build the cheap alternative and write the decision.

The build work here is deliberately light. GraphRAG's indexing cost is the reason it is a *reading and deciding* phase for a reader on a zero budget, and the phase is honest about that rather than pretending a laptop-scale GraphRAG is representative.

## Skills you'll gain

- Classify a question as local, multi-hop or global, and predict whether retrieval can answer it.
- Explain the difference between a retrieval task and a query-focused summarisation task.
- Describe GraphRAG's two indexing stages and its query flow accurately, including the scope of its claim.
- Build a map-reduce-summarise pipeline that answers many global questions at a fraction of the cost.
- Recognise multi-hop questions and decide between iterative retrieval and a graph.
- Apply a decision framework for escalating beyond plain RAG, and justify not escalating.
- Estimate the indexing cost of a graph approach before committing to it.
- State where graph approaches stop working, and which questions they never help with.

## Specific topics to learn

### The class of question retrieval cannot answer

- Local questions: the answer is in a passage. Retrieval is the right tool.
- Multi-hop questions: the answer needs several passages combined. Retrieval plus iteration.
- **Global questions**: the answer is a property of the corpus, not of any passage.
- Query-focused summarisation as the correct name for the global task.
- Why the failure is structural rather than a tuning problem.
- The tell: raising k does not help, and better chunks do not help.

### What GraphRAG actually does

- The problem it was built for: global sensemaking over private corpora.
- Stage one: an LLM derives an **entity knowledge graph** from the source documents.
- Stage two: **pre-generated community summaries** for groups of closely related entities.
- Query flow: each community summary produces a partial response, and the partials are summarised into a final answer.
- **The scope of the claim**: substantial improvements for a class of global sensemaking questions over datasets in the **1 million token range**, on **comprehensiveness and diversity**.
- What it does *not* claim: better answers to local questions, or a general accuracy win.
- Why the index is built with an LLM, and what that costs.

### The cheaper alternative

- Map-reduce over retrieved chunks: summarise each chunk, then summarise the summaries.
- Map-reduce over *all* chunks, when the corpus fits in a budget you can afford.
- Why this answers most global questions acceptably, and what it gives up.
- Hierarchical summarisation as a middle path: summarise sections, then summarise sections.
- Multi-hop via iterative retrieval: retrieve, extract, re-query.
- Choosing between them on cost, not on sophistication.

### The decision and its costs

- The escalation ladder: plain RAG → cheaper global techniques → graph index.
- Why the honest default is to stay low on the ladder.
- Indexing cost: LLM calls proportional to the corpus, not to your queries.
- Maintenance: the graph is stale the moment a document changes.
- Evaluation difficulty: global questions are the hardest to score automatically.
- Questions GraphRAG never helps: local lookups, exact identifiers, structured data.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| A local model via Ollama | Run the map-reduce pipeline and the entity-extraction probe without a meter | Free/open-source | https://ollama.com/ | Tasks t04, t08 — summarise chunks locally and extract entities at small scale | A free hosted tier, checked for rate limits and data terms first |
| SQLite with FTS5 | Sample chunks and drive the map-reduce pass over a real subset | Free/open-source | https://sqlite.org/fts5.html | Task t04 — pull chunks by section and summarise hierarchically | Reading files directly with Python |
| `networkx` | Build a small entity graph so the concept is concrete, not abstract | Free/open-source | https://networkx.org/ | Task t07 optional — hand-build a graph over 20 documents and find communities | A dict of adjacency lists, which is enough to see the structure |
| pandas | Score and compare your pipeline against the map-reduce baseline | Free/open-source | https://pandas.pydata.org/ | Tasks t06, t09 — one row per question, one column per approach | Python's `csv` module and a spreadsheet |
| RAGAS | Score comprehensiveness and diversity, or your own proxies for them | Free/open-source; hosted tiers exist | https://github.com/explodinggradients/ragas | Task t09 — evaluate both approaches on the same global questions | Your own rubric with a local judge, hand-calibrated |
| Colab or Kaggle notebooks | Free GPU time if you want to run an entity-extraction pass at some scale | Free tier | https://colab.research.google.com/ | Task t08 — run entity extraction over a few hundred chunks and inspect the quality | Kaggle notebooks, a separate free GPU quota |
| GraphRAG documentation | Read the actual indexing pipeline and its configuration surface | Free/open-source | https://microsoft.github.io/graphrag/ | Task t10 — price the indexing before you run it, then decide | The paper, plus the repository's own README and cost notes |
| Google AI Studio | A free hosted model for entity extraction, which local models do unreliably | Free tier | https://aistudio.google.com/ | Task t08 — compare local extraction quality against a stronger model | Any provider free tier; check data terms before sending a corpus |

## Free/cheap resources

- **Edge et al. — From Local to Global: A Graph RAG Approach to Query-Focused Summarization (arXiv:2404.16130)** — https://arxiv.org/abs/2404.16130
- **GraphRAG documentation** — https://microsoft.github.io/graphrag/
- **Lewis et al. — Retrieval-Augmented Generation (arXiv:2005.11401)** — https://arxiv.org/abs/2005.11401
- **Liu et al. — Lost in the Middle (arXiv:2307.03172)** — https://arxiv.org/abs/2307.03172
- **Gao et al. — HyDE (arXiv:2212.10496)** — https://arxiv.org/abs/2212.10496
- **Zheng et al. — Step-Back Prompting (arXiv:2310.06117)** — https://arxiv.org/abs/2310.06117
- **Cormack, Clarke & Buettcher — Reciprocal Rank Fusion (SIGIR 2009)** — https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf
- **Anthropic — Contextual Retrieval** — https://www.anthropic.com/news/contextual-retrieval

## Lesson: The Questions Retrieval Was Never Built For

### Part 1 — Three shapes of question

Every technique in this track assumes something about the question, and making that assumption explicit is what lets you predict when the technique will fail. There are three shapes.

**Local questions.** The answer exists in one passage. "What is the retry limit?" "How do I configure authentication?" Retrieval is exactly the right tool, and Phases 1–6 built it. Recall@k is your metric, and the whole apparatus applies.

**Multi-hop questions.** The answer requires combining several passages. "Which of our services depends on the deprecated auth library?" needs one retrieval to find the services and another to check their dependencies. Retrieval still works, but it must be **iterated** — retrieve, extract what you learned, query again. Phase 4's query rewriting is the simple version of this.

**Global questions.** The answer is a property of the corpus *as a whole* and is not contained in any passage. "What are the main themes across these documents?" "What are the recurring complaints in this feedback?" "How has our policy on this changed over the three years of records?"

The third shape is this phase's subject, and the key insight is that **it is not a retrieval task at all.** The paper that introduced GraphRAG names the correct category precisely: this is **query-focused summarisation** (QFS), a task concerned with summarising a corpus in response to a query, rather than retrieving specific passages from it.

**Why no retrieval improvement can fix it.** Consider what retrieval does: it ranks passages by relevance to the query and returns the top k. For a global question, every passage is *partially* relevant and none is *the answer*, so:

- **Raising k does not help.** Retrieving 50 passages instead of 10 gives you more of the corpus, but you still have to summarise it, and you have no principled way to know when you have enough.
- **Better chunking does not help.** There is no chunk boundary at which "the main themes" becomes locally contained.
- **A reranker does not help.** It reorders passages by relevance to a query whose answer is distributed across all of them.
- **A better embedding model does not help.** The query embeds fine; the problem is that relevance is not the right relation here.

This is why the phase matters even if you never build a graph. **Recognising the question shape tells you that the tool you have is structurally wrong**, which stops you from spending a week tuning retrieval against a task it cannot do. Phase 6's step 0 asked whether the corpus answers the question; this asks a related question one level up — whether the *question shape* is one your architecture can serve.

**The tell in practice.** A global question produces a specific symptom pattern: retrieval returns passages that all look relevant, the answers are individually plausible and collectively unsatisfying, and the user says something like "that's true but it's not what I asked." When you hear that, stop tuning and reclassify the question.

**Where this classification stops working.** The three shapes are a useful simplification and real questions blur them. "What are the main themes, and what does the security policy say about them?" is global and local at once. A multi-hop question with twenty hops is effectively global. Classify by asking where the *evidence* has to come from — one passage, several, or the whole — and accept that some questions will need a hybrid.

### Part 2 — What GraphRAG actually does

Now the answer the field produced for global questions. It is worth understanding properly, including the precise scope of its claim, because the popular description of GraphRAG is broader than the paper.

**The problem statement, from the paper.** Retrieval-augmented generation "fails on global questions directed at an entire text corpus, such as 'What are the main themes in the dataset?', since this is inherently a query-focused summarization (QFS) task, rather than an explicit retrieval task." Prior QFS methods existed but did not scale to the quantities of text a RAG system indexes.

**The approach: an LLM builds a graph index in two stages.**

**Stage one — derive an entity knowledge graph.** An LLM reads the source documents and extracts entities and the relationships between them. This produces a graph whose nodes are things (people, systems, policies, concepts) and whose edges are the relations the text asserts. **This is the expensive part**, and the reason it is a *cost* question rather than a technique question: it is LLM work proportional to the size of your corpus, performed at indexing time, before any user asks anything.

**Stage two — pre-generate community summaries.** The graph is partitioned into groups of closely related entities — "communities" — and an LLM writes a summary for each. This is also corpus-proportional LLM work, and it happens at index time too.

**Query flow.** Given a question, each community summary produces a **partial response**, and all the partial responses are then summarised again into a final answer. That is a **map-reduce** shape: map over communities, reduce to one answer.

**Now the claim, stated with its actual scope, because this is where summaries mislead.** The paper reports that "for a class of global sensemaking questions over datasets in the **1 million token range**, GraphRAG leads to substantial improvements over a conventional RAG baseline for both the **comprehensiveness and diversity** of generated answers."

Four boundaries in that sentence, each of which matters:

- **"a class of global sensemaking questions"** — not all questions. Local questions are not claimed to improve, and there is no reason they would.
- **"in the 1 million token range"** — a scale statement. The paper's evaluation is at roughly a million tokens of source text, not at a hundred pages and not at a billion.
- **"over a conventional RAG baseline"** — the comparison is against naive RAG, not against the best cheap alternative. Part 3's map-reduce pipeline is a more interesting comparison and one you can run yourself.
- **"comprehensiveness and diversity"** — these are the measured dimensions. Comprehensiveness means covering more of what matters; diversity means covering more distinct aspects. A summarisation-quality claim, not a general accuracy claim.

**Why this precision is not pedantry.** A reader who takes away "GraphRAG is better" will reach for it on a question where it offers nothing — a local lookup, an exact identifier, a structured query — and pay a large indexing bill for no benefit. A reader who takes away the accurate claim knows exactly which question class it targets, and can check whether their corpus is anywhere near the scale where the improvement was measured.

**Where the approach stops working, on its own terms.** The graph is built at index time, so it is **stale as soon as a document changes** — and rebuilding means re-running the entity extraction over the corpus, which is the expensive stage, not a cheap incremental update. Entity extraction quality bounds everything downstream, and it is LLM work that is unreliable on small local models, so a free-tier learner's reproduction will be weaker than the paper's. And a graph does not help a question whose evidence is in one passage; it may actively hurt by replacing precise retrieval with a summary of a summary.

### Part 3 — The cheaper alternative that usually suffices

Here is the part that matters most for a reader with no budget, and it is the reason this phase is not a GraphRAG tutorial.

**You do not need a graph to summarise a corpus. You need a map-reduce loop, and you can build one in an afternoon.**

The shape:

1. **Map.** Take your corpus — or the subset relevant to the query — and summarise each chunk or section independently. One LLM call per unit, no dependencies between them.
2. **Reduce.** Take the summaries and summarise *them*, answering the actual question.
3. **(Optionally) recurse.** If there are too many summaries for one reduce call, summarise groups of summaries first — which is **hierarchical summarisation**, and it is exactly what "community summaries" are doing structurally.

```python
# Map: summarise each section independently, no shared state.
summaries = [llm(f"Summarise the key points of this section:\n\n{s}") for s in sections]

# Reduce: answer the user's question from the summaries.
answer = llm(f"Question: {question}\n\nSection summaries:\n{chr(10).join(summaries)}")
```

**Why this works, structurally.** It is the same map-reduce shape as GraphRAG's query flow — map over units, reduce to one answer. What GraphRAG adds on top is that its units are **communities of related entities** rather than arbitrary chunks or sections, which is a genuine improvement in grouping quality: summarising "everything related to billing and refunds" is better than summarising "chunks 40 through 60" if the chunks are not topically contiguous.

**What you give up, honestly.** Weaker grouping — sections and chunks are not organised by meaning. No relationship structure, so questions that need to trace *connections* across documents are not helped. And no pre-computation, so you pay the map cost **per query** rather than once at index time — which is a disadvantage at high query volume and an advantage when your corpus changes often.

**Where the alternative genuinely wins.** For a corpus that fits in a few hundred chunks, map-reduce is *better engineering* than a graph index: no indexing bill, no staleness problem, no entity-extraction quality risk, and a pipeline you can debug because it is forty lines you wrote. For a corpus that changes daily, pre-computed summaries are stale by design and per-query map-reduce is the correct architecture.

**The practical recommendation, stated plainly.** If you have a global question today, **build the map-reduce version and measure it.** It costs an afternoon and a small number of local model calls. If it answers your question acceptably — and for most corpora at learner scale it does — you have your answer and you have learned the mechanism. If it demonstrably fails, you now have a baseline and a specific reason to escalate, which is a much better position than escalating first and never knowing whether you needed to.

**Multi-hop, briefly, since it is the other non-local shape.** The cheap technique is **iterative retrieval**: retrieve, extract the entities or facts you learned, use them to form a second query, repeat. The paper this pattern is usually associated with in this curriculum's agents track is ReAct (arXiv:2210.03629), and the general shape is "reason, act, observe, repeat" with a step cap. Reach for a graph only when the *relationships themselves* are the query subject and iteration keeps failing to surface them — which is a rarer condition than the enthusiasm for graph approaches suggests.

### Part 4 — The decision framework

Now the escalation decision, which is this phase's actual deliverable.

The ladder has four rungs, and the discipline is to move up only when the rung below has demonstrably failed.

| Rung | Technique | Try when | Cost |
|---|---|---|---|
| 1 | Plain RAG | The question is local | Baseline; you have it |
| 2 | Iterative retrieval | The question is multi-hop | A few extra calls per query |
| 3 | Map-reduce summarisation | The question is global | One call per unit, per query |
| 4 | Graph index | Rung 3 failed *and* the corpus is large, stable, and the question needs relationships or themes | Corpus-proportional indexing, plus staleness and maintenance |

**The order is the recommendation.** Rungs 1–3 are cheap, quick to build, and debuggable with the tools from Phase 6. Rung 4 requires an indexing pipeline, an LLM pass over your entire corpus, a rebuild strategy for when documents change, and a way to evaluate summaries — and it targets questions that rung 3 very often answers.

**Four questions to ask before escalating to a graph.** All four should be yes.

1. **Is the question genuinely global or relationship-shaped, and did map-reduce demonstrably fail on it?** Not "might it be better" — a specific question where the cheaper pipeline produced an answer you can point at and say is inadequate.
2. **Is the corpus large and stable enough to justify pre-computation?** Pre-computed summaries pay off when the corpus is big and changes rarely. A corpus that changes weekly pays the indexing bill repeatedly and answers from a stale index in between.
3. **Can you afford the indexing pass, in money or hours?** Entity extraction is LLM calls proportional to corpus size. On a local model that is hours of laptop time and lower extraction quality; on a paid API it is a real bill. **Estimate this before running it**, which is Phase 7 of Cost's priced-experiment discipline applied here.
4. **Can you evaluate the result?** Global questions are the hardest to score automatically — there is no single correct passage to check against, and Phase 5's retrieval metrics do not apply. If you cannot say how you would know the graph approach helped, you cannot justify its cost.

**If any answer is no, stay at rung 3.** This is not a compromise; it is the correct engineering decision, and it is worth being able to articulate: you have not avoided the sophisticated approach out of timidity, you have declined it because the cheaper one is sufficient and the expensive one is unjustified. That is a judgement a future employer should find more impressive than a graph index nobody needed.

**The cost reality, stated without hedging.** GraphRAG's indexing is a genuine expense, and it is proportional to corpus size rather than query volume. That means the cost is **front-loaded and paid whether or not the approach turns out to help** — the opposite of the query-time costs you have been managing throughout this track. For a reader on a zero budget with a laptop, a faithful reproduction at the paper's scale is not available, and building a toy version teaches the mechanism without validating the claim. Both of those facts belong in your write-up.

**And the rung you should look at first: do you need this at all?** A large share of requests that arrive as global questions are better served by a **structured** answer. "What are the main themes?" is sometimes a real summarisation request, and sometimes it is a user who wants counts, trends or categories that a `GROUP BY` would answer exactly, immediately, and for free. Phase 1 made this point at the corpus level and Phase 5 at the chunk level; here it is the cheapest possible resolution — before building any summarisation pipeline, ask whether the question has a structural answer.

**Where this framework stops working.** It optimises for a reader at learner scale on a small budget. An organisation with a million-token corpus, a stable document set, a funded indexing budget and a real need for thematic synthesis is the case the paper describes, and for them rung 4 is the right answer. The framework is not "graphs are bad"; it is "the escalation should be justified by a failure you observed, at a scale where the technique was actually validated."

## Hands-on practice tasks

1. Take twenty questions you would actually ask of your corpus and classify each as local, multi-hop or global. For each global one, write the sentence a perfect answer would contain — you will need it to evaluate later. <!-- id: rag-07-graphrag-advanced-t01 band: focused energy: normal -->
2. Run three of your global questions through your existing retrieval pipeline with k raised to its maximum. Show that raising k does not produce the answer, and write down how the failure reads. <!-- id: rag-07-graphrag-advanced-t02 band: focused energy: normal -->
3. Write the retrieval-versus-summarisation distinction in your own words, using one of your own questions as the example. If you cannot, re-read Part 1 before continuing. <!-- id: rag-07-graphrag-advanced-t03 band: quick energy: low -->
4. Build the map-reduce pipeline: summarise each section independently, then answer the query from the summaries. Keep it under fifty lines. <!-- id: rag-07-graphrag-advanced-t04 band: deep energy: high -->
5. Extend it to hierarchical summarisation: group summaries and summarise the groups before the final reduce. Compare the answer against the flat version on the same question. <!-- id: rag-07-graphrag-advanced-t05 band: focused energy: normal -->
6. Evaluate both approaches on your global questions with a rubric you write yourself — comprehensiveness and diversity are the useful dimensions, since they are what the paper measured. <!-- id: rag-07-graphrag-advanced-t06 band: deep energy: high -->
7. Optional but recommended: build a small entity graph over 20 documents with `networkx` — entities as nodes, co-occurrence as edges — and look at what communities emerge. This teaches the mechanism concretely without an indexing bill. <!-- id: rag-07-graphrag-advanced-t07 band: deep energy: high -->
8. Probe entity-extraction quality: run extraction over 50 chunks with a local model and again with a stronger hosted model. Count the entities each misses or invents. This is the quality ceiling of any graph approach you build. <!-- id: rag-07-graphrag-advanced-t08 band: focused energy: high -->
9. Score your map-reduce pipeline against plain retrieval on the same global questions, and report where each wins. Do not assume the summarisation approach is better everywhere. <!-- id: rag-07-graphrag-advanced-t09 band: deep energy: high -->
10. Price a graph index for your corpus before building one: count chunks, estimate entity-extraction calls, and convert to hours on your hardware or money at published rates. Write the number down. <!-- id: rag-07-graphrag-advanced-t10 band: focused energy: normal -->
11. Apply the four escalation questions to one real global question of yours and write the decision: escalate to rung 4, stay at rung 3, or resolve it structurally instead. Justify with the answers, not with a preference. <!-- id: rag-07-graphrag-advanced-t11 band: deep energy: high -->
12. Build the iterative-retrieval loop for one multi-hop question: retrieve, extract what you learned, form a second query, repeat, with a hard step cap. <!-- id: rag-07-graphrag-advanced-t12 band: focused energy: high -->
13. Find one question in your list that a SQL query or a spreadsheet would answer exactly. Note how often the "global question" framing was masking a structured question. <!-- id: rag-07-graphrag-advanced-t13 band: quick energy: low -->
14. Write your decision record: the question taxonomy for your corpus, what you built, what you measured, what you declined and why. Keep it where your future self will find it. <!-- id: rag-07-graphrag-advanced-t14 band: ongoing energy: normal -->

## Common Pitfalls

**Reaching for GraphRAG because the question is hard rather than because it is global.** The technique targets a specific question class — global sensemaking at a stated scale — and offers nothing for local lookups, exact identifiers or structured questions. Applying it there buys a large indexing bill and no improvement.

**Tuning retrieval against a global question.** Raising k, re-chunking, reranking and swapping embeddings all fail, because the question has no answering passage for any of them to find. The symptom is a set of individually relevant answers that collectively miss the point, and the fix is to reclassify the question rather than tune harder.

**Not building the cheap version first.** Map-reduce is an afternoon's work and answers most global questions at learner scale. Escalating to a graph without a measured failure at rung 3 means you never learn whether you needed it, and you have no baseline to justify the cost.

**Quoting GraphRAG's result more broadly than the paper does.** The claim is scoped to a class of global sensemaking questions over datasets in the 1 million token range, on comprehensiveness and diversity, against a conventional RAG baseline. Saying "GraphRAG is better" drops every boundary and will lead you to use it where it does not apply.

**Forgetting that the index is built with an LLM.** Entity extraction is corpus-proportional LLM work, done at index time, and its quality bounds everything downstream. On a small local model the extraction is unreliable, so a free reproduction teaches the mechanism without reproducing the paper's results.

**Ignoring staleness.** The graph is stale as soon as a document changes, and rebuilding means re-running the expensive stage. A corpus that changes weekly pays the indexing cost repeatedly and answers from a stale index in between.

**Escalating without a way to evaluate.** Global questions are the hardest to score automatically — there is no correct passage to check and Phase 5's retrieval metrics do not apply. Without a rubric or a comparison, you cannot know whether the graph helped, which means you cannot justify its cost even after paying it.

**Treating "global question" as a reason to skip the structured answer.** A meaningful share of thematic questions want counts, trends or categories that a query would answer exactly and instantly. Before building any summarisation pipeline, check whether the question has a structural answer.

## Deliverable / proof of work

Write `portfolio/rag/07-graphrag-advanced.md` containing:

- **Your question taxonomy** — twenty of your own questions classified as local, multi-hop or global, with the tell you used for each global one and the perfect-answer sentence you would check against.
- **The negative result** — one global question run through your existing pipeline at maximum k, showing that the failure is structural rather than a tuning problem.
- **The cheap alternative, built and measured** — your map-reduce pipeline, the hierarchical variant, and both scored against plain retrieval on your global questions using a rubric you wrote. Where did each approach win?
- **The extraction probe** — entity-extraction quality on your corpus with a local model versus a stronger one, as the ceiling on any graph approach you would build.
- **The priced index** — your estimate of a graph index for your corpus: chunk count, extraction calls, hours or money, written before any decision.
- **The decision record** — the four escalation questions answered for one real question of yours, and your decision with its justification. If you declined to escalate, say so explicitly and explain why the cheaper rung was sufficient. This section is the phase's core output.
- **The structured-answer check** — any question in your list that a query would answer exactly, and what that says about how the question was framed.

## Checklist

- [ ] I can classify a question as local, multi-hop or global and predict whether retrieval can answer it <!-- id: rag-07-graphrag-advanced-c01 energy: normal -->
- [ ] I can explain why a global question is a summarisation task rather than a retrieval task <!-- id: rag-07-graphrag-advanced-c02 energy: normal -->
- [ ] I can describe GraphRAG's two indexing stages and its query flow accurately <!-- id: rag-07-graphrag-advanced-c03 energy: normal -->
- [ ] I can state the scope of GraphRAG's claim — question class, corpus scale, and the measured dimensions <!-- id: rag-07-graphrag-advanced-c04 energy: high -->
- [ ] I have built a map-reduce pipeline that answers a global question about my corpus <!-- id: rag-07-graphrag-advanced-c05 energy: high -->
- [ ] I have measured the cheaper approach against plain retrieval rather than assuming it is better <!-- id: rag-07-graphrag-advanced-c06 energy: high -->
- [ ] I can price a graph index for my corpus before committing to building one <!-- id: rag-07-graphrag-advanced-c07 energy: normal -->
- [ ] I apply the four escalation questions and can decline to escalate with a stated justification <!-- id: rag-07-graphrag-advanced-c08 energy: high -->
- [ ] I can build iterative retrieval for a multi-hop question with a step cap <!-- id: rag-07-graphrag-advanced-c09 energy: normal -->
- [ ] I check whether a global question has a structural answer before building a summarisation pipeline <!-- id: rag-07-graphrag-advanced-c10 energy: low -->
- [ ] I can say which questions a graph approach never helps with <!-- id: rag-07-graphrag-advanced-c11 energy: normal -->
- [ ] I have a written decision record for one real question, including what I declined <!-- id: rag-07-graphrag-advanced-c12 energy: normal -->

## Quiz

### Q1. A user asks "What are the recurring complaints across these 400 support tickets?" Why does raising k not fix this? <!-- id: rag-07-graphrag-advanced-q01 energy: normal -->

- [x] Because no single ticket contains the answer — the question asks about a property of the whole corpus, so it is a summarisation task rather than a retrieval task
- [ ] Because the tickets are too short for embeddings to represent well
- [ ] Because the reranker is optimising for the wrong objective
- [ ] Because the corpus needs re-chunking before retrieval can work

**Why:** The answer is a pattern distributed across the corpus, so every ticket is partially relevant and none is the answer — which means relevance ranking has nothing to rank toward. Raising k returns more partially relevant tickets and still leaves you summarising them, with no principled stopping point. Better chunking, embeddings and reranking all assume there is an answering passage to find, and here there is not. The correct category is query-focused summarisation, and the correct tool is a map-reduce or graph approach.

### Q2. Which statement most accurately describes GraphRAG's reported result? <!-- id: rag-07-graphrag-advanced-q02 energy: high -->

- [ ] GraphRAG outperforms conventional RAG on question answering generally
- [ ] GraphRAG eliminates the need for retrieval by replacing it with a graph
- [x] For a class of global sensemaking questions over datasets in the 1 million token range, it substantially improves comprehensiveness and diversity of answers over a conventional RAG baseline
- [ ] GraphRAG is cheaper than conventional RAG because the graph replaces embeddings

**Why:** Every boundary in the accurate statement matters. The question class is global sensemaking, not all questions; the scale is a million-token range, which is a specific evaluation scope; the comparison is against a conventional RAG baseline rather than against the best cheap alternative; and the measured dimensions are comprehensiveness and diversity — summarisation quality, not general accuracy. The other options each drop one or more boundaries, and dropping them leads directly to using the technique where it does not apply, which is the mistake this phase exists to prevent.

### Q3. What does GraphRAG's indexing stage actually do? <!-- id: rag-07-graphrag-advanced-q03 energy: normal -->

- [ ] It embeds each document and stores the vectors in a graph database
- [x] An LLM derives an entity knowledge graph from the source documents, then pre-generates summaries for communities of closely related entities
- [ ] It builds a citation graph from the links between documents
- [ ] It clusters document embeddings and stores the cluster centroids

**Why:** Both stages are LLM work over the corpus, which is why indexing cost is proportional to corpus size and is paid before any query. The first stage extracts entities and their relationships; the second partitions that graph into communities and writes a summary for each. At query time each community summary produces a partial response, and the partials are reduced into a final answer — a map-reduce shape. Embedding- or citation-based clustering would not require an LLM pass, which is the property that makes this approach expensive.

### Q4. You have a global question about a 300-chunk corpus that changes weekly. What is the strongest argument against building a graph index? <!-- id: rag-07-graphrag-advanced-q04 energy: high -->

- [ ] Graph indexes are theoretically inferior to vector indexes
- [ ] A 300-chunk corpus is too small to build a graph over
- [x] Map-reduce answers global questions at this scale for a fraction of the cost, and pre-computed summaries go stale weekly, so you would pay repeated indexing costs to query a stale index
- [ ] Graphs cannot represent entities that appear in only one document

**Why:** Two independent costs compound. The indexing pass is LLM work proportional to the corpus, so a weekly-changing corpus pays it repeatedly — the opposite of the stability that makes pre-computation worthwhile — and between rebuilds you answer from summaries that no longer match the documents. Meanwhile map-reduce pays per query, which is the right cost structure for a corpus in flux, and at 300 chunks it is an afternoon's work. The theoretical-superiority framing is wrong in both directions, and a 300-chunk graph is buildable — it is simply unjustified.

### Q5. What is the structural relationship between map-reduce summarisation and GraphRAG's query flow? <!-- id: rag-07-graphrag-advanced-q05 energy: normal -->

- [x] Both map over units and reduce to one answer; GraphRAG's refinement is that the units are communities of related entities rather than arbitrary chunks or sections
- [ ] They are unrelated approaches that happen to produce similar outputs
- [ ] Map-reduce is a simplified version of GraphRAG that discards relationships entirely
- [ ] GraphRAG replaced map-reduce because the latter does not scale

**Why:** Seeing the shared shape is what makes the cheap alternative legible as a real version of the idea rather than a poor substitute. Both summarise independent units and then summarise the summaries — the difference is the quality of the grouping, since communities of related entities group by meaning while sections group by position. Map-reduce does give up relationship structure, and it does scale, which is why the choice between them is about grouping quality, staleness and cost rather than about which one works.

### Q6. When is a graph approach genuinely the right escalation? <!-- id: rag-07-graphrag-advanced-q06 energy: high -->

- [ ] Whenever the question mentions more than one document
- [ ] Whenever retrieval returns results that feel unsatisfying
- [ ] Whenever the corpus exceeds a few thousand chunks
- [x] When the question is global or relationship-shaped, map-reduce has demonstrably failed on it, the corpus is large and stable enough to justify pre-computation, the indexing cost is affordable, and you can evaluate the result

**Why:** The four conditions are jointly necessary, and each rules out a different bad reason to escalate. A question mentioning two documents is usually multi-hop and served by iterative retrieval. Unsatisfying results may be a chunking or ranking bug that Phase 6 would localise. And corpus size alone is not the trigger — a large corpus that changes constantly defeats pre-computation. The evaluation condition is the one most often skipped and the most important: without a way to know whether the graph helped, its cost cannot be justified even retrospectively.

### Q7. Why does GraphRAG's cost structure differ from the query-time costs in the rest of this track? <!-- id: rag-07-graphrag-advanced-q07 energy: normal -->

- [x] Because indexing is LLM work proportional to corpus size, paid up front whether or not the approach turns out to help, rather than per query as you go
- [ ] Because graph databases charge per stored node rather than per query
- [ ] Because the graph must be rebuilt on every query to stay current
- [ ] Because entity extraction uses a more expensive model than generation does

**Why:** The rest of the track taught you to manage per-call costs that scale with usage, so you can stop when the bill grows. GraphRAG inverts that: the expense is front-loaded and sunk, and its size follows from how much text you have rather than how much you ask. That asymmetry is why the phase insists on pricing the index **before** building it, and why a demonstrated failure at the cheaper rung is a prerequisite — you are committing a fixed cost against an uncertain benefit, which is a different kind of decision.

### Q8. What should you check before building any summarisation pipeline for a "thematic" question? <!-- id: rag-07-graphrag-advanced-q08 energy: normal -->

- [ ] Whether a larger context window would fit the whole corpus
- [ ] Whether the embedding model supports long documents
- [x] Whether the question has a structural answer that a query, count or grouping would give exactly and immediately
- [ ] Whether the corpus has been deduplicated recently

**Why:** A meaningful share of questions arriving as thematic requests actually want counts, categories or trends — "how many complaints mention billing" is a `GROUP BY`, not a summarisation task, and the structured answer is exact, instant and free. Phase 1 made this point at the corpus level and Phase 5 at the chunk level; here it is the cheapest resolution available and it should be checked before any pipeline is built. Fitting the corpus into context is a legitimate question for small corpora but it does not resolve the question shape, and deduplication is a hygiene step rather than a decision input.

### Q9. Why are global questions the hardest to evaluate? <!-- id: rag-07-graphrag-advanced-q09 energy: high -->

- [ ] Because they require the largest models to generate answers
- [ ] Because they take longer to run, so fewer samples are practical
- [ ] Because they cannot be evaluated by a language model at all
- [x] Because there is no correct passage to check against, so retrieval metrics do not apply and quality must be judged on dimensions like comprehensiveness and diversity

**Why:** The whole evaluation apparatus from Phase 5 rests on labelled answer passages — Recall@k, MRR and nDCG all compare retrieved ids against a known-correct set, which does not exist for a question whose answer is a property of the corpus. What remains are judgement-based dimensions, which is exactly why the paper measured comprehensiveness and diversity, and why this phase makes "can you evaluate the result?" a prerequisite for escalation. A judge can be used, but its verdicts must be calibrated by hand, and it has no ground truth to anchor to.

### Q10. What is the phase's central recommendation? <!-- id: rag-07-graphrag-advanced-q10 energy: low -->

- [ ] Build a graph index as soon as your corpus exceeds a few thousand chunks
- [x] Do not start with GraphRAG — build the cheap map-reduce version, measure it, and escalate only on a demonstrated failure at a scale where the technique was validated
- [ ] Avoid graph approaches entirely because they are not worth the cost
- [ ] Use GraphRAG for global questions and plain RAG for local ones, in a fixed split

**Why:** The recommendation is about ordering, not prohibition. The paper describes a real and well-scoped improvement for organisations with large, stable corpora and a funded indexing budget; for a learner at a few hundred chunks the cheaper rung is better engineering, and declining the sophisticated option with a stated justification is the judgement being trained. "Always escalate" wastes an indexing bill; "never escalate" refuses a validated technique where it applies. The fixed-split option mistakes a decision framework for a routing table and ignores the question class entirely.

## You're ready to move on when...

You can classify a question as local, multi-hop or global, and say why retrieval is or is not the right tool for it. You have run one of your own global questions through your existing pipeline at maximum k and can explain why the failure is structural rather than a tuning problem.

You have built a map-reduce pipeline that answers a global question about your own corpus, extended it hierarchically, and **measured it against plain retrieval** rather than assuming it is better. You have probed entity-extraction quality with a local model and know the ceiling on any graph approach you would build. You have priced a graph index for your corpus in hours or pesos, before deciding.

And you have a written decision record applying the four escalation questions to one real question, with your justification — including the case where you declined to escalate. If you cannot say why the cheaper rung was sufficient, or why the expensive one was warranted, you have read the phase and not decided anything.

## Free vs Paid

### What's free is enough

Everything except one specific experiment, and the phase names it rather than hiding it.

The taxonomy is thinking. The negative result — raising k on a global question — costs a handful of calls you can run locally. The map-reduce pipeline is forty lines and runs on a local model, and hierarchical summarisation is a second loop around the same code. The rubric is yours to write. The entity-extraction probe needs a local model and a stronger one to compare, and a free hosted tier supplies the second. `networkx` builds a small graph so the concept becomes concrete. The GraphRAG documentation and the paper are free, and reading them properly is most of the intellectual work in this phase.

**The one thing that is not free is a faithful reproduction of GraphRAG at the paper's scale.** Indexing is LLM work proportional to a million tokens of source text, and the paper's results are from that scale. On a laptop you can build a toy version and watch the mechanism work; you cannot validate the claim, and it would be dishonest to pretend the two are the same. That distinction belongs in your write-up.

**And for most readers at this stage, the free path is not merely adequate but preferable.** The map-reduce pipeline is the better engineering choice at a few hundred chunks regardless of budget: no indexing bill, no staleness, no dependency on extraction quality, and a pipeline short enough to debug with Phase 6's tools. Declining the graph is not a concession to poverty here; it is the correct call.

### What a paid tier adds

Three things, and only one is a genuine capability gain.

**A stronger model for entity extraction.** This is the real one. Entity extraction quality bounds every downstream result in a graph approach, and local models are unreliable at it — they miss entities, invent relationships, and produce inconsistent naming that fragments the graph. If you were building a graph pipeline in earnest, a capable model for the extraction pass is the load-bearing purchase.

**Affordable indexing at scale.** Corpus-proportional LLM work is a real bill, and it is the cost the paper's results require. This is Phase 7 of Cost's "workload that is structurally impossible at your tier" category: at a million tokens of source, the indexing pass is not something a free tier's limits permit.

**Managed graph and summarisation services.** Hosted offerings exist that run the pipeline for you. They buy convenience and operational history rather than capability, and everything they do is reproducible with the open-source implementation plus a budget.

**Volatile, dated: as of early 2026, which models extract entities reliably, what corpus-scale indexing costs, and what the managed services charge all move on the order of months. Price the pass yourself against current rates before committing, rather than relying on any figure in this lesson.**

**What money does not buy.** It does not buy the decision. Whether to escalate is a judgement about your question class, your corpus stability and your ability to evaluate the result, and a funded indexing budget with no way to score the output produces an expensive pipeline nobody can defend. That judgement is the deliverable, and it is free.

### When it's worth paying

**Not for this phase.** The decision record, the map-reduce pipeline, the probe and the priced estimate all run on a local model and free tooling, and declining to escalate is a legitimate and expected outcome.

The threshold arrives only when rung 3 has demonstrably failed and the four escalation questions are all answered yes — which in practice means a corpus in the hundreds of thousands of tokens or more, a document set stable enough that pre-computation stays valid, a question class that is genuinely global or relationship-shaped, and a rubric you already trust. Until then, **the correct purchase is none**, and the correct output is a written justification for staying where you are.

If those conditions are met, the honest sequence is: price the indexing pass first as a single experiment, run it over a sample of your corpus rather than all of it to check extraction quality, and only then commit to the full pass. That is Phase 7 of Cost's rule — spend on the experiment that changes a decision — applied to the one technique in this track whose cost is paid before you learn anything.
