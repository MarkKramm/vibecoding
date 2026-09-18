---
id: rag-03-embeddings-vector-search
track: rag
phase: 3
order: 30
title: Embeddings and Vector Search
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal]
deliverable: portfolio/rag/03-embeddings-vector-search.md
exit_criteria: >
  You can build a working vector index over a real corpus, explain why the
  search is approximate, and identify the queries your embedding model cannot
  handle before a user finds them for you.
---

# Phase 3 — Embeddings and Vector Search

## Goal of this phase

Build the matching layer. By the end you will have a working vector index over a real corpus, understand what similarity search is actually computing, know why it is approximate rather than exact, and — most importantly — be able to name the queries embeddings **cannot** answer, because that gap is what the next phase fills.

Foundations Phase 6 covered what an embedding is. This phase is about using them: which model, which index, which database, and which queries will fail.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Building a small index takes an afternoon. Most of the week goes into deliberately probing where it fails, which is the part that produces the judgement you need later.

## Skills you'll gain

- Choose an embedding model on measurable grounds rather than leaderboard position
- Build a vector index and query it
- Explain cosine similarity and why embeddings are usually normalised
- Explain why approximate nearest neighbour search exists and what it trades
- Recognise the queries dense retrieval will fail and predict them in advance
- Decide when a simple library beats a vector database

## Specific topics to learn

### The matching mechanism

- Embeddings as points in a high-dimensional space
- Cosine similarity, dot product, Euclidean distance, and when they agree
- Normalisation and why it collapses the three metrics into one
- Dimensionality and storage arithmetic

### Approximate search

- Why exact search is linear and becomes too slow
- HNSW: a navigable graph with layers
- IVF: clustering then searching nearby cells
- The recall/latency/memory tradeoff and its tuning knobs

### Storage options

- In-process libraries: FAISS, numpy
- Embedded databases: SQLite with a vector extension, LanceDB, Chroma
- Server databases: Qdrant, Weaviate, pgvector
- When a database is overkill

### Where embeddings fail

- Rare identifiers: error codes, SKUs, product names
- Exact strings: names, citations, function names
- Negation and subtle qualifiers
- Numerical comparison

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| sentence-transformers | Run embedding models locally | Free/open-source | https://sbert.net/ | Embed your corpus with no API cost | Ollama's embedding endpoint |
| FAISS | Fast approximate nearest neighbour search | Free/open-source | https://github.com/facebookresearch/faiss | Build an HNSW index and tune its parameters | numpy brute force |
| sqlite-vec | Vectors inside a single-file database | Free/open-source | https://github.com/asg017/sqlite-vec | Store chunks and vectors together with metadata | FAISS plus a JSON metadata file |
| Chroma | Embedded vector database for prototyping | Free/open-source | https://www.trychroma.com/ | Stand up a persisted index in a few lines | LanceDB |
| Qdrant | Vector database with metadata filtering | Free/open-source | https://qdrant.tech/ | Test pre-filtering against post-filtering | Chroma |
| MTEB leaderboard | Compare embedding models on real tasks | Free | https://huggingface.co/spaces/mteb/leaderboard | Pick a model by retrieval score, not overall rank | Eval on your own 20 questions |

## Free/cheap resources

- **sentence-transformers documentation** — https://sbert.net/
- **FAISS wiki** — https://github.com/facebookresearch/faiss/wiki
- **MTEB leaderboard** — https://huggingface.co/spaces/mteb/leaderboard
- **sqlite-vec** — https://github.com/asg017/sqlite-vec
- **Qdrant documentation** — https://qdrant.tech/documentation/
- **Malkov & Yashunin — HNSW (arXiv:1603.09320)** — https://arxiv.org/abs/1603.09320

## Lesson: Matching by Meaning, and Where It Breaks

### Part 1 — What similarity search computes

Foundations Phase 6 established that an embedding model maps text to a vector, positioned so that similar meanings land near each other. This phase uses that property, so let me be precise about what "near" means in code.

For two vectors **a** and **b**:

```text
dot product       a . b            = sum(a_i * b_i)
cosine similarity (a . b) / (|a| |b|)
euclidean         sqrt(sum((a_i - b_i)^2))
```

**If both vectors are normalised to unit length**, then `|a| = |b| = 1`, and:

```text
cosine similarity = a . b
euclidean distance = sqrt(2 - 2 * (a . b))
```

Both become monotonic functions of the dot product. That is why they rank results identically and why the choice rarely matters in practice — **provided you normalised.** If you did not normalise, they can disagree, and the disagreement is silent: results come back ranked, they are just ranked by a different notion of similarity than you assumed.

Most embedding models output normalised vectors, and most vector libraries normalise on insert if asked. **Check rather than assume**, and if you are computing similarities yourself, add the normalisation explicitly. It costs one line and removes a whole class of confusing results.

#### Dimensionality and storage, honestly

Embedding dimensions are commonly a few hundred to a couple of thousand. The storage arithmetic is simple and worth doing before you commit, because it decides whether you need compression:

```text
n_chunks x dimensions x bytes_per_float

Example: 100,000 chunks x 768 dims x 4 bytes (float32)
       = 100,000 x 768 x 4
       = 307,200,000 bytes
       ~ 307 MB

Add an HNSW graph: roughly 1.5-2x the raw vector size in practice
```

So a corpus of a hundred thousand chunks lands in the several-hundred-megabyte range — manageable on a laptop but not trivial, and growing linearly with your corpus. This arithmetic is why the compression techniques in Part 4 exist.

---

### Part 2 — Why the search is approximate

Here is the idea that surprises people, and understanding it makes the rest of the vector-database landscape make sense.

**Computing the true nearest neighbours of a query means comparing it against every vector you have.** That is a linear scan: *n* comparisons for one query. For ten thousand vectors it is instant. For ten million it is not, and it gets worse as you add documents — so a system that is fast today becomes slow next year without anything changing.

**Approximate nearest neighbour (ANN) search accepts an answer that is probably the true nearest neighbour, in exchange for not looking at everything.** The index is a data structure that lets the search skip most candidates with high probability of not missing the good ones.

This is a trade, not a trick, and the trade has a name:

| Property | Exact search | ANN search |
|---|---|---|
| Result quality | True nearest neighbours | Probably the true ones |
| Speed on large corpora | Slower and slower | Roughly constant per query |
| Memory | Vectors only | Vectors + index structure |
| Tunable | No | Yes — recall vs speed |

The tunable part is what matters operationally: **ANN lets you choose your recall.** You can make it faster and less accurate, or slower and more accurate, and most libraries expose the knobs.

#### HNSW, conceptually

The dominant ANN algorithm, from Malkov & Yashunin, arXiv:1603.09320.

Think of it as a **navigable graph with layers**, like a road network with motorways and local streets:

- The top layers have few nodes and long-range links — the motorways, letting you cross the space in a few hops.
- The bottom layer has every node and short links — the local streets, letting you find the exact destination.
- A search starts at the top, greedily moves toward the query, then descends to a finer layer and repeats.

```text
Layer 2:   A -------- F           few nodes, long links
Layer 1:   A --- C --- F --- H    more nodes, medium links
Layer 0:   A-B-C-D-E-F-G-H-I-J    every node, short links
           ^ enter here, greedy toward query, descend
```

It is fast because each layer halves the problem, and it is approximate because greedy descent can get stuck in a local region and miss a closer node elsewhere.

The two parameters you will actually tune:

**`M`** — how many links each node keeps. Higher means a better-connected graph, higher recall, and more memory. Commonly in the range of 16–64.

**`ef_search`** — how wide the search frontier is at query time. Higher means more candidates examined, better recall, slower queries. This is the knob you turn **at query time**, so you can tune recall per request without rebuilding.

**`ef_construction`** — the same idea applied while building the index. Higher means a better graph and a slower build. This is a build-time cost only.

The practical consequence: **if retrieval quality is disappointing and you suspect the index, raise `ef_search` first.** It costs latency, requires no rebuild, and frequently recovers most of the difference.

#### IVF, conceptually

The other common family. Cluster your vectors into *n* groups (cells), then at query time compare only against the nearest few cells.

```text
1. k-means the corpus into n cells, store the centroids
2. at query time, find the c nearest centroids
3. compare the query against vectors in those c cells only
```

Fewer comparisons, faster, and `nprobe` — how many cells to search — is the recall knob. It is usually cheaper in memory than HNSW and often faster to build, at some cost in recall per unit of speed.

#### Where this matters to you

For a personal corpus of thousands or tens of thousands of chunks, **exact search is often fast enough** and you can skip the index entirely:

```python
# Brute force with numpy: exact, no index, no tuning
scores = embeddings @ query_embedding        # normalised, so this is cosine
top_k = np.argsort(-scores)[:k]
```

For 10,000 chunks of 768 dimensions that is a matrix multiply over about 7.7 million floats — milliseconds. Adding FAISS or a vector database at this scale makes your system more complex and no more correct.

**Reach for ANN when the linear scan is measurably too slow**, and let the measurement tell you. This is the same discipline as the chunk size in the previous phase: the correct configuration is the measured one, and the default answer for a small corpus is the simplest thing that works.

---

### Part 3 — Choosing a model

You need an embedding model. The choice matters more than most configuration decisions, and it is testable.

#### What to compare

**Retrieval performance, not overall rank.** The MTEB leaderboard reports many task types — classification, clustering, reranking, retrieval. **Read the retrieval column.** A model that tops the overall table may be mediocre at retrieval, and retrieval is what you are doing.

**Dimension.** Higher dimensions cost more storage and more compute per query. For a small corpus using a large model, the extra quality may not be worth the extra memory — but if quality is the bottleneck, dimensions are cheap compared to a bad answer.

**Maximum input length.** The model's advertised limit is not necessarily where it performs well. Models trained on short passages can degrade on long ones. Your chunk size must respect the model's **effective** range.

**Language coverage.** Critical for a reader in the Philippines, and worth its own paragraph.

**Licence and cost.** Open-weight models run locally for free. Hosted models charge per token, which is fine at small scale and significant at large scale.

#### The multilingual point, which is personal here

Petrov et al., arXiv:2305.15425 (NeurIPS 2023), measured something that should change how you think about cost: **the same content can require up to 15 times more tokens in one language than another**, and this disparity persists even in tokenizers designed to be multilingual.

Two consequences, and they are separate:

**Cost and speed.** A Tagalog, Cebuano, or Ilocano prompt costs more tokens than the English equivalent, so it costs more money and processes more slowly. If you are building something for Filipino users and budgeting from English measurements, you will be wrong — and wrong in the expensive direction. The Cost track's token economics material applies directly.

**Embedding quality.** A model with little training data in a language will represent it poorly, so retrieval quality drops in ways that are invisible if you only test in English. This is a real and under-discussed form of degradation, and it is the kind that a demo hides and production reveals.

The practical instruction: **if your corpus or your users are not English, test in the actual language.** Do not assume an English benchmark predicts Filipino performance. Run your 20-question retrieval measurement in the language your users write in, and if quality is poor, a genuinely multilingual model is the fix — a somewhat smaller multilingual model usually beats a larger English-centric one on non-English retrieval.

#### Testing rather than trusting

The leaderboard is a starting filter, not an answer. Run your own measurement:

```python
for model_name in candidate_models:
    emb = model_name.encode(chunks)
    hits = 0
    for q in my_20_questions:
        top = search(emb, model_name.encode(q.text), k=5)
        hits += (q.answer_chunk_id in top)
    print(model_name, hits, "/ 20")
```

Twenty questions, three models, an afternoon. **This result is worth more than any leaderboard position**, because it measures your corpus, your queries, and your language.

---

### Part 4 — Storage, and resisting the database

The vector database market is crowded and the marketing is loud. Here is the decision framed by size, which is the only thing that should drive it.

#### In-process, no database

FAISS, or numpy for a small corpus.

- No server, no network, no deployment
- The index is a file you load
- You manage persistence, concurrency, and updates yourself
- **Right for:** personal projects, prototyping, corpora up to a few hundred thousand chunks, anything read-only

For a learner building a portfolio project, **this is almost always the correct choice**, and choosing it demonstrates judgement rather than naivety.

#### Embedded database

sqlite-vec, LanceDB, Chroma in local mode.

- Single file or directory, no server process
- Metadata filtering built in
- Persistence and updates handled for you
- **Right for:** projects that need filtered search and durable storage without operational overhead

sqlite-vec is worth particular attention for a learner: your chunks, vectors, and metadata live in one SQLite file, and **SQLite's FTS5 extension gives you BM25 over the same rows** — which means the entire hybrid search of the next phase runs against one file with no services at all. That is a genuinely elegant fit for a $0 project.

#### Server database

Qdrant, Weaviate, pgvector.

- Network service, concurrency, replication
- Rich filtering, sometimes better ANN implementations
- Operational cost: a process to run, secure, and back up
- **Right for:** multi-user systems, concurrent writes, corpora where an in-process index does not fit in memory

#### Compression, if memory is the constraint

Two techniques that matter when your index outgrows your RAM.

**Matryoshka embeddings.** Some models are trained so that a **prefix** of the vector is itself a usable embedding — truncating 1536 dimensions to 256 still gives a meaningful vector, just a coarser one. The usual pattern is a two-stage search: a short prefix for a fast first pass, then the full vector to rescore the candidates.

**Binary and scalar quantization.** Store each dimension as one bit (sign only) or one byte instead of four. Binary quantization cuts memory by roughly 32 times; a small float rescoring pass on the candidates recovers much of the accuracy. The pattern is the same as Matryoshka's: **cheap approximate search, then accurate rescoring on a small set.**

None of this matters below a few hundred thousand chunks. Know it exists; measure before adopting it.

#### What embeddings cannot do

This is the most valuable section in the phase, because it prevents a class of production failure.

**Embeddings capture semantic similarity. They are not exact-match machines.** Concretely, dense retrieval degrades on:

**Rare identifiers.** Error codes, SKUs, order numbers, ticket IDs, hashes, version strings. A model has no meaningful representation for `ERR_CONN_4471` beyond "looks like an error code", so it will match other error codes. Worse, it may match a *similar-looking* code and return a confidently wrong source.

**Exact strings.** Function names, API parameters, proper nouns, legal citations. `get_user_by_email` and `get_user_by_id` are nearly identical to an embedding model and semantically opposite to a programmer.

**Negation and qualifiers.** "Which models do NOT support streaming?" is a hard query, because the embedding of the question is close to the embedding of text about streaming support generally. The word "not" barely moves the vector.

**Numerical comparison.** "Which plans cost less than $20?" is not a similarity question. No amount of embedding quality answers it.

**Recent or rare terminology.** A term coined last month may tokenize into fragments and embed near whatever those fragments usually mean.

```text
Query: "what does error ERR_CONN_4471 mean?"
Dense retrieval returns:
  1. Documentation for ERR_CONN_4412          <- wrong code, high similarity
  2. A page about connection errors generally <- right topic, no answer
  3. Troubleshooting guide mentioning ERR_CONN_4470 <- one digit off
```

Burying the actual answer, which is on a page that never says "connection" because it says "socket timeout". **The exact-match failure and the semantic failure are opposite**, which is exactly why they combine well — and that is the subject of the next phase.

#### How to find your failures before your users do

Build a **failure probe set**: queries containing your domain's rare identifiers.

```text
- exact error codes from your logs
- SKUs and product names with similar spellings
- API parameter names that differ by one word
- negated questions
- numeric comparisons
```

Run them against your index and record which fail. A probe set of twenty queries takes an hour to write and tells you precisely where hybrid search is needed. **Do this before you launch**, because once users hit these queries you will be fixing them under pressure, and the fix — adding lexical search — is architectural rather than a prompt tweak.

---

## Hands-on practice tasks

1. Embed 100 chunks with a local sentence-transformers model and search for five queries. Print the top 3 with scores for each. <!-- id: rag-03-t01 band: focused energy: normal -->
2. Verify whether your model's vectors are already normalised, then confirm cosine and dot product give identical rankings. <!-- id: rag-03-t02 band: quick energy: low -->
3. Build the same index with numpy brute force and with FAISS HNSW, and compare query latency at your corpus size. <!-- id: rag-03-t03 band: focused energy: normal -->
4. Take the HNSW index and measure recall against brute force at three settings of `ef_search`. Report the recall/latency tradeoff as a table. <!-- id: rag-03-t04 band: deep energy: high -->
5. Compute the storage your corpus requires at float32, and estimate what binary quantization would reduce it to. <!-- id: rag-03-t05 band: quick energy: low -->
6. Write a failure probe set of 20 queries using your domain's exact identifiers, error codes or SKUs, and run it. Record the failure rate. <!-- id: rag-03-t06 band: deep energy: normal -->
7. Test the same five queries against two different embedding models and record which retrieves better on your corpus. <!-- id: rag-03-t07 band: focused energy: normal -->
8. If your content is not English, run your retrieval measurement in the actual language and compare quality against the English version. <!-- id: rag-03-t08 band: deep energy: high -->

## Common Pitfalls

**Assuming vectors are normalised.** If they are not, cosine and dot product diverge and you are ranking by something you did not intend. Check, and normalise explicitly when computing similarities yourself.

**Reaching for a vector database on a small corpus.** A numpy matrix multiply over ten thousand vectors takes milliseconds. A database adds a service, a network hop, and a deployment problem in exchange for nothing measurable at that scale.

**Judging an embedding model by overall leaderboard rank.** Read the retrieval column, test on your corpus, and test in your users' language.

**Not testing non-English content in its own language.** English benchmarks do not predict Filipino retrieval quality. Petrov et al. showed up to a 15x token disparity across languages, which affects both cost and representation quality.

**Expecting embeddings to match exact identifiers.** Error codes, SKUs, and function names are where dense retrieval is weakest, and it fails by returning confidently similar wrong answers rather than nothing.

**Tuning ANN parameters when the problem is elsewhere.** If recall is poor, raise `ef_search` first. But if the retrieved chunks simply do not contain the answer, no index tuning helps — that is a chunking or matching-model problem.

**Tuning on the queries you test with.** Keep a few queries aside. The evaluation phase covers why, and the reason is the same one that makes held-out test sets standard everywhere else.

## Deliverable / proof of work

Write `portfolio/rag/03-embeddings-vector-search.md` containing:

- **A working index** over a real corpus, with the model named and the choice justified
- **Five queries with their top-3 results and scores**, showing what similarity search returns
- **A storage calculation** for your corpus at float32, with the arithmetic shown
- **A recall/latency table** for HNSW at three `ef_search` settings against brute-force ground truth
- **A failure probe set** of at least 20 identifier queries, with the observed failure rate and three example failures
- **A model comparison** — two or more candidates scored on your own retrieval questions, with the winner justified

## Checklist

- [ ] I can explain cosine similarity and why normalisation makes the metrics agree <!-- id: rag-03-c01 energy: normal -->
- [ ] I have verified whether my embedding model's vectors are normalised <!-- id: rag-03-c02 energy: low -->
- [ ] I can compute the storage my corpus needs at float32 from dimensions and count <!-- id: rag-03-c03 energy: low -->
- [ ] I can explain why ANN search is approximate and what it trades <!-- id: rag-03-c04 energy: normal -->
- [ ] I can describe HNSW as a layered navigable graph and name its tuning parameters <!-- id: rag-03-c05 energy: normal -->
- [ ] I know that `ef_search` tunes recall at query time without a rebuild <!-- id: rag-03-c06 energy: normal -->
- [ ] I have compared brute force against an ANN index at my own corpus size <!-- id: rag-03-c07 energy: normal -->
- [ ] I chose an embedding model by retrieval performance on my own data <!-- id: rag-03-c08 energy: high -->
- [ ] I can name four query types dense retrieval will fail <!-- id: rag-03-c09 energy: normal -->
- [ ] I have built a failure probe set from my own domain's identifiers <!-- id: rag-03-c10 energy: high -->
- [ ] I know what Matryoshka embeddings and binary quantization buy <!-- id: rag-03-c11 energy: normal -->
- [ ] I can justify my storage choice by size rather than by popularity <!-- id: rag-03-c12 energy: normal -->

## Quiz

### Q1. Two vectors are not normalised. What is the consequence? <!-- id: rag-03-q01 energy: normal -->

- [ ] Cosine similarity cannot be computed at all
- [x] Cosine similarity and dot product can rank results differently, so you may be ranking by something other than the similarity you intended
- [ ] The vectors become unusable for search
- [ ] Euclidean distance becomes the only valid metric

**Why:** Cosine divides by both magnitudes, dot product does not, so they only agree when the magnitudes are equal or one. Most models normalise, which hides this — but if you compute similarities yourself or use a model that does not, the divergence is silent and the results still look valid.

### Q2. Why does approximate nearest neighbour search exist? <!-- id: rag-03-q02 energy: high -->

- [ ] Because exact nearest neighbour is mathematically ill-defined in high dimensions
- [ ] Because embeddings are lossy and exact search would be misleading
- [x] Because exact search requires comparing against every vector, which becomes too slow as the corpus grows, so ANN trades a small chance of missing the true neighbour for roughly constant query time
- [ ] Because vector databases cannot store exact floats

**Why:** Brute force is exact and genuinely fine for small corpora — a matrix multiply over ten thousand vectors takes milliseconds. The problem is that it scales linearly, so a system that is fast today becomes slow next year. ANN accepts probable correctness in exchange for scale, and exposes the recall knob.

### Q3. Retrieval quality on your HNSW index looks worse than brute force. What is the cheapest first thing to try? <!-- id: rag-03-q03 energy: normal -->

- [ ] Rebuild the index with a higher `M`
- [ ] Switch to a larger embedding model
- [x] Raise `ef_search`, which widens the query-time search frontier without rebuilding anything
- [ ] Reduce the number of chunks

**Why:** `ef_search` is a query-time parameter, so raising it costs latency and nothing else — no rebuild, no re-embedding. `M` and `ef_construction` are build-time and require a full index rebuild. Exhaust the cheap knob before paying for the expensive one.

### Q4. A user searches for error code `ERR_CONN_4471`. Dense retrieval returns documentation for `ERR_CONN_4412`, a general connection-errors page, and a guide mentioning `ERR_CONN_4470`. What does this demonstrate? <!-- id: rag-03-q04 energy: normal -->

- [x] Dense retrieval has no meaningful representation for rare identifiers, so it matches similar-looking strings and the true answer may sit on a page that uses entirely different vocabulary
- [ ] The index needs more vectors per node
- [ ] The embedding model is broken and should be replaced
- [ ] The chunks are too small

**Why:** Embeddings encode semantics, and an error code has no semantics beyond "looks like an error code". So near-identical codes match closely and the real answer — on a page about socket timeouts that never says "connection" — is missed by both mechanisms in opposite directions. This is exactly the gap lexical search fills.

### Q5. Your corpus is 8,000 chunks of 768 dimensions. What storage approach is most defensible? <!-- id: rag-03-q05 energy: normal -->

- [ ] A server-based vector database, for scalability
- [x] In-process vectors with a brute-force numpy search, because exact search at this size is milliseconds and adds no operational complexity
- [ ] FAISS with HNSW and binary quantization
- [ ] A managed vector service with replication

**Why:** Eight thousand vectors is roughly 25 MB and a single matrix multiply per query. An index structure, a server, or compression buys nothing measurable and costs deployment, tuning surface, and a new class of bug. Choose by size, and let measurement tell you when to escalate.

### Q6. Which query will dense retrieval handle WORST? <!-- id: rag-03-q06 energy: normal -->

- [ ] "How do I configure authentication for the API?"
- [ ] "What are the limits on file uploads?"
- [ ] "Explain how the caching layer works"
- [x] "Which of our plans do NOT include SSO?"

**Why:** Negation barely moves an embedding vector — the question embeds close to text about SSO support generally, so it retrieves pages describing which plans do include it. The qualifier that carries the entire meaning is the one the embedding represents least. Negated queries belong in your failure probe set.

### Q7. What is the point of Matryoshka embeddings? <!-- id: rag-03-q07 energy: high -->

- [x] A prefix of the vector is itself usable, so you can search cheaply with a short prefix and rescore candidates with the full vector
- [ ] They increase the number of dimensions to improve accuracy
- [ ] They compress text before embedding it
- [ ] They allow a single index to serve multiple languages

**Why:** The model is trained so that truncating dimensions degrades gracefully rather than destroying the vector. That enables a two-stage search: a fast coarse pass over short prefixes, then an accurate rescoring of a small candidate set. It pairs naturally with binary quantization, which uses the same cheap-then-rescore pattern.

### Q8. Your content is in Tagalog and retrieval quality seems worse than your English tests suggested. What is the most likely explanation? <!-- id: rag-03-q08 energy: high -->

- [ ] Tagalog text cannot be embedded
- [ ] The index parameters need retuning for non-English text
- [ ] The chunk size must be larger for non-English text
- [x] The model has less training data in that language, so it represents it poorly — and tokenization disparities mean the same content costs more tokens, so English benchmarks do not predict non-English retrieval

**Why:** Petrov et al. measured up to a 15x token disparity across languages that persists even in multilingual tokenizers, and representation quality tracks training data volume. The fix is to measure in the actual language and switch to a genuinely multilingual model — a somewhat smaller multilingual model usually beats a larger English-centric one.

## You're ready to move on when...

You have a working index over your own corpus and can state its storage requirement from arithmetic rather than guesswork. You have compared brute force against an ANN index at your actual size and can say which you need. You have run a failure probe set built from your own domain's exact identifiers, and you can list the query types your dense retrieval will miss.

The judgement to carry forward is knowing that **embeddings fail in a specific, predictable direction** — toward semantically similar but exactly wrong — and that this is not a defect to fix but a gap to fill.

## Free vs Paid

### What's free is enough

This entire phase is free. sentence-transformers runs state-of-the-art embedding models locally with no API cost, and Ollama exposes embedding endpoints through the same local server. FAISS, sqlite-vec, Chroma, LanceDB, and Qdrant are all open source. The MTEB leaderboard is free to read.

Running embeddings locally has a specific advantage beyond cost that is worth naming: **your retrieval measurement becomes free**, so you can test three models at three chunk sizes without thinking about the bill. That removes the friction from the measurement habit, and the measurement is what makes the choices in this phase defensible rather than borrowed.

### What a paid tier adds

A hosted embedding API removes the compute burden and may offer models that are genuinely stronger on some tasks. At large corpus sizes the local compute time for initial embedding becomes real, and a hosted service parallelises it.

A managed vector service adds operations you would otherwise handle: replication, backups, concurrent writes, monitoring, larger-than-memory indexes. At personal scale these solve problems you do not have.

Some hosted embedding models are genuinely better on specific languages or domains, and if your measurement shows a clear gap on your corpus, that is a legitimate reason to pay.

### When it's worth paying

When your own measurement shows a hosted model retrieving meaningfully better on your corpus and your language, and the improvement survives held-out queries. That is a measurable case with a clear answer.

Not before. Local models are strong, the measurement is free, and the corpus sizes where local compute becomes painful are well beyond a portfolio project. If your index does not fit in memory, you will know — and that is a scale problem you can address when you reach it.
