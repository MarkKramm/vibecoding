# Retrieval & RAG — Track Overview

## What this track is for

A model knows what was in its training data. It does not know your documents, your company's policies, last week's memo, or anything written after its training cut-off. Retrieval is how you give it that knowledge.

**RAG — retrieval-augmented generation — is the pattern of finding relevant passages and putting them in the context before the model answers.** It sounds simple. It is not, and the gap between "a RAG demo that works on my three test questions" and "a retrieval system that works" is where this track lives.

Most of that gap is not in the model. It is in chunking, in the choice between keyword and vector search, in reranking, in metadata, and above all in **measurement**. A retrieval system you cannot evaluate is a retrieval system you cannot improve, and you will not know it is broken until a user tells you an answer was wrong.

This track is also the most directly employable one in the curriculum. Evaluation and data work around retrieval systems is the most accessible junior entry point in the field, and this is the track that teaches it.

## Who this suits

You need **Foundations** (especially Phase 6, embeddings) and **Prompting Phase 5** (context engineering). The track assumes you know what an embedding is and that you have thought about what belongs in a context window.

You should be **comfortable writing basic Python**. This is the first track where the practice tasks are real programs rather than notebook experiments. Nothing here is advanced — file reading, loops, lists, dictionaries — but you will be writing code, not just reading it.

This is the right track for you if you have ever wanted a model to answer questions about **your** material: notes, documentation, a manual, a set of regulations, a corpus you care about.

## What you need before starting

- **Foundations complete**, and Prompting through Phase 5.
- **Python 3 with the ability to install packages** (`pip` or `uv`).
- **A local embedding model.** Small open embedding models run on a CPU. This matters, because embedding a corpus through a paid API is the single most common way a beginner accidentally spends money.
- **Roughly 1–2 focused hours a day, five days a week.**

Everything in this track is achievable on a free tier or locally. The one place budget genuinely bites is large-scale embedding, and Phase 3 addresses it directly.

## The phases, in order

| # | Phase | Length | What it establishes |
|---|---|---|---|
| 1 | Why Retrieval Exists | 1 week | What a model cannot know, when retrieval is the right answer versus a bigger context or fine-tuning, and the shape of the pipeline |
| 2 | Ingestion and Chunking | 1 week | Getting documents in, and splitting them — where most retrieval quality is won or lost |
| 3 | Embeddings and Vector Search | 1 week | Embedding a corpus locally, nearest-neighbour search, and the multilingual penalty that affects Tagalog and Cebuano sources |
| 4 | Hybrid Search and Reranking | 2 weeks | Combining keyword and vector search, then rescoring — the largest single quality jump in the track |
| 5 | Metadata Filtering and RAG Evaluation | 2 weeks | Access control as a filter rather than an instruction, and measuring retrieval and generation separately |
| 6 | Diagnosing RAG Failures | 2 weeks | A symptom-to-cause-to-fix discipline, so a bad answer becomes a diagnosis instead of a guess |
| 7 | When RAG Is Not Enough | 1 week | Global questions no single chunk answers, GraphRAG, and an honest assessment of when not to use it |

**Read 1 through 6 in order.** They form one argument: build it, then measure it, then debug it. **Phase 7 is optional and deliberately last** — it teaches an expensive technique and recommends against starting there.

## What you will be able to do at the end

- Explain when retrieval is the right solution and when a larger context or a fine-tune is, and defend the choice.
- Build a working pipeline: ingest, chunk, embed, store, retrieve, rerank, generate.
- Chunk a document deliberately, and explain the tradeoff each chunking choice makes.
- Run embeddings locally so that embedding a corpus costs nothing.
- Combine keyword and vector retrieval so each covers the other's blind spot.
- Add reranking and measure the improvement.
- Enforce access control as a retrieval filter, and explain why doing it in the prompt is a security failure.
- **Measure retrieval and generation separately**, with Recall@k, Precision@k, MRR and nDCG, and use the master diagnostic to tell which half of a broken system is at fault.
- Take a bad answer and work it to a cause using a symptom-to-fix procedure.
- Explain honestly why GraphRAG is expensive, narrow, and usually the wrong first move.

## Roughly how long it takes

**7 phases, about 10 weeks at five sessions a week.** Three phases are two weeks, and they are the ones that carry the evaluation and debugging discipline.

At one hour a day, plan on thirteen to fourteen weeks. This is one of the two longest tracks, and the length is in the practice rather than the reading — you cannot learn to debug retrieval without debugging retrieval.

## What being on a $0 budget costs you here

This track is where the budget starts to matter, and it is worth being precise about where.

**What you get in full:** the entire pipeline. Ingestion, chunking, local embeddings, vector search, hybrid search, reranking with a small cross-encoder, metadata filtering, evaluation metrics, and the debugging discipline all run locally at no cost. Reranking is the one part people assume is expensive; a small open cross-encoder runs acceptably on a CPU over a shortlist of a few dozen candidates.

**What you genuinely give up:**

1. **Embedding a large corpus through a hosted API.** This is the real constraint. Embedding a million documents through a paid API is a genuine cost, and free tiers will not cover it. **The substitute is to embed locally**, which is slower but free, and to work at a smaller scale — a few thousand chunks teaches everything this track teaches. Where you cannot embed at scale, the honest answer is to embed a representative subset rather than to skip the phase.
2. **Very long-context experiments.** Testing a 200k-token context against a retrieval pipeline is not feasible on a free tier. Phase 1 teaches the comparison conceptually instead, which is enough to make the decision.
3. **High-volume evaluation.** Running a 1,000-case evaluation set through a hosted judge is both rate-limited and costly. Phase 5 teaches the small-set approach deliberately — **20 to 50 cases with objective pass criteria**, which is affordable and is the better practice anyway.
4. **Some rerankers and some vector databases** are freemium with limits at scale. Every phase names a free alternative, and for learner-scale corpora the free tiers are genuinely sufficient.

The honest summary: **you can build and evaluate a real retrieval system at zero cost, at small scale.** What you cannot do is prove it works at production volume. That distinction matters when you write it up, and the Career track tells you to state it rather than hide it.

## How this track connects to the others

**Before it:** Foundations Phase 6, Prompting Phase 5.

**Alongside it:** Finetuning & Evals. Phase 5's evaluation material and the evaluation fundamentals track reinforce each other strongly, and evaluation is the skill that transfers to every other track.

**After it:** Agents. An agent with a retrieval tool is the standard production shape. Cost & Efficiency becomes very relevant once you are embedding and retrieving at volume — caching and routing are how a RAG system becomes affordable.

## The honest caveat

The retrieval *mechanisms* are durable: BM25, cosine similarity, reciprocal rank fusion, cross-encoder reranking, Recall@k. Those will still be correct in five years, and they are most of this track.

What moves is the tooling and the model landscape. Vector database features, embedding model names, and leaderboard positions all change on a scale of weeks. The phases date those where they appear, and none of the conclusions depend on them.

One thing that will **not** change, and is worth stating as the track's thesis: **a retrieval system you cannot measure is a retrieval system you are guessing about.** Whatever tools you use in five years, that will still be true.

## Start here

1. Confirm Foundations Phase 6 and Prompting Phase 5 are behind you.
2. Read [Phase 1](01-phase-why-retrieval.md).
3. Track your progress in [`checklist-master.md`](checklist-master.md).
4. If free-tier limits worry you, read [`../cost/07-phase-freemium-playbook.md`](../cost/07-phase-freemium-playbook.md) — it covers the local-embedding decision directly.
