# Fact-Verification Report: Embeddings, Vector Search, and Quantization

**Method:** All facts below were checked by fetching primary sources directly with `web_fetch`
(arXiv abstract pages, official docs, raw GitHub READMEs/LICENSE files, Crossref/Semantic Scholar APIs).
`web_search` was not used. Every URL listed was actually fetched during this session.

**Legend:** ✅ VERIFIED (primary source fetched) · ⚠️ PARTIALLY VERIFIED / DISPUTED · ❌ UNVERIFIED (could not confirm) · 📣 VENDOR CLAIM (attributed, not independently verified)

---

## EMBEDDINGS

### 1. Word2vec — Mikolov et al. ✅ (with one correction on the 300-dim claim)

**Verified facts:**
- arXiv:1301.3781, "Efficient Estimation of Word Representations in Vector Space", authors **Tomas Mikolov, Kai Chen, Greg Corrado, Jeffrey Dean**. Submitted 16 Jan 2013; last revised 7 Sep 2013 (v3). Abstract confirms two novel model architectures (CBOW and Skip-gram) and reports learning from a **1.6 billion word** dataset in **less than a day**. Source: https://arxiv.org/abs/1301.3781
- arXiv:1310.4546, "Distributed Representations of Words and Phrases and their Compositionality", authors **Tomas Mikolov, Ilya Sutskever, Kai Chen, Greg Corrado, Jeffrey Dean**. Submitted 16 Oct 2013. Abstract confirms **negative sampling** as an alternative to hierarchical softmax, subsampling of frequent words, and phrase detection. Source: https://arxiv.org/abs/1310.4546

**On "typically 300-dim" — ⚠️ NUANCED, not stated in either abstract.**
I fetched both abstract pages. **Neither abstract states that 300 dimensions was the typical/default size.** The 300-dim figure is real and extremely well known (Google's released `GoogleNews-vectors-negative300.bin` is 300-dimensional, and the papers' tables report 300-dim configurations), but I could **not** confirm the word "typical 300-dim" from the abstract text I fetched. To verify it properly you would need the paper body/PDF (e.g. https://arxiv.org/pdf/1301.3781) rather than the abstract page. **Mark as: plausible and widely repeated, but UNVERIFIED from the sources I fetched.**

### 2. Sentence-BERT (SBERT) ✅ VERIFIED

- arXiv:1908.10084, "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks", **Nils Reimers, Iryna Gurevych**. Submitted 27 Aug 2019. arXiv comment field states: **"Published at EMNLP 2019"**.
- Abstract confirms exactly the claimed points: BERT requires both sentences fed into the network causing massive overhead — finding the most similar pair among **10,000 sentences** requires about **50 million inference computations (~65 hours)** with BERT; SBERT uses **siamese and triplet network structures** to derive sentence embeddings "**that can be compared using cosine-similarity**", reducing 65 hours to **about 5 seconds**.
- Source: https://arxiv.org/abs/1908.10084

This is a solid primary source for the origin-of-practical-sentence-embeddings and bi-encoder claim.

### 3. Cosine similarity vs dot product vs Euclidean ✅ VERIFIED (with a strong source)

**Verified, from OpenAI's official embeddings guide** (a reputable engineering source that states the relationship plainly):

> "OpenAI embeddings are normalized to length 1, which means that:
> - Cosine similarity can be computed slightly faster using just a dot product
> - Cosine similarity and Euclidean distance will result in the identical rankings"

Also: "We recommend cosine similarity. The choice of distance function typically doesn't matter much."
Source: https://developers.openai.com/api/docs/guides/embeddings.md

**Verified, from the FAISS README** (Meta's official repository) — states the same mathematical relationship for normalized vectors:

> "It assumes that the instances are represented as vectors ... and that the vectors can be compared with L2 (Euclidean) distances or dot products. Vectors that are similar to a query vector are those that have the lowest L2 distance or the highest dot product with the query vector. **It also supports cosine similarity, since this is a dot product on normalized vectors.**"
Source: https://raw.githubusercontent.com/facebookresearch/faiss/main/README.md

**Verified, from pgvector's official README** — confirms the practical recommendation that follows from normalization:

> "If vectors are normalized to length 1 (like OpenAI embeddings), use inner product for best performance."
Source: https://raw.githubusercontent.com/pgvector/pgvector/master/README.md

**Assessment of the three mathematical claims as stated in the request:**
- *For L2-normalized vectors, cosine similarity and dot product produce the same ranking* — **VERIFIED** (directly implied and stated by both OpenAI and FAISS: cosine of normalized vectors *is* the dot product, so identical ordering).
- *Euclidean distance on normalized vectors is monotonically related to cosine similarity* — **VERIFIED in substance** by OpenAI's statement that cosine similarity and Euclidean distance produce "**identical rankings**". Note the precise math: for unit vectors, ‖a−b‖² = 2 − 2·(a·b) = 2 − 2·cos, so Euclidean distance is a strictly decreasing function of cosine similarity — i.e. ranking-preserving but **not** a linear rescaling. The OpenAI page states the ranking consequence rather than deriving it.
- *So many systems normalize and use inner product* — **VERIFIED** by pgvector's explicit recommendation and FAISS's implementation note.

### 4. MTEB ✅ VERIFIED, and a successor DOES exist

- arXiv:2210.07316, "MTEB: Massive Text Embedding Benchmark", authors **Niklas Muennighoff, Nouamane Tazi, Loïc Magne, Nils Reimers**. Submitted 13 Oct 2022; last revised 19 Mar 2023 (v3). Abstract confirms: **8 embedding tasks, 58 datasets, 112 languages**, benchmarking **33 models**. Source: https://arxiv.org/abs/2210.07316

- **Successor verified: MMTEB (Massive Multilingual Text Embedding Benchmark)** — arXiv:2502.13595, published **19 Feb 2025**. The official MTEB repo README states: *"MTEB was introduced in 'MTEB: Massive Text Embedding Benchmark', and **heavily expanded** in 'MMTEB: Massive Multilingual Text Embedding Benchmark'. When using `mteb`, we recommend that you cite both articles."* Source: https://raw.githubusercontent.com/embeddings-benchmark/mteb/main/README.md and https://huggingface.co/papers/2502.13595

- **On "MTEB v2":** ⚠️ There is no product called "MTEB v2" as a successor benchmark. Instead, the MTEB codebase uses **versioned benchmark configurations**, e.g. the README shows `mteb.get_benchmark("MTEB(eng, v2)")` and task IDs like `Banking77Classification.v2`. So "v2" is a **version suffix on individual benchmarks/tasks**, while the actual successor benchmark is **MMTEB**. This distinction matters.

- **Current leaderboard URL:** https://huggingface.co/spaces/mteb/leaderboard — confirmed as the linked Leaderboard in the official repo README. I fetched this Space; it returned HTTP 200 but the interactive app content is JS-rendered and did not expose model rankings in the fetched HTML. **The URL is verified as canonical; individual ranking numbers on it were NOT verified.**
- Repo: https://github.com/embeddings-benchmark/mteb

### 5. Matryoshka Representation Learning — paper ✅, award claim ❌ DISPUTED, OpenAI ✅

**Paper VERIFIED:**
- arXiv:2205.13147, "Matryoshka Representation Learning", first author **Aditya Kusupati** (full author list: Kusupati, Bhatt, Rege, Wallingford, Sinha, Ramanujan, Howard-Snyder, Chen, Kakade, Jain, Farhadi). Submitted 26 May 2022; v4 8 Feb 2024.
- **Core idea VERIFIED from the abstract**: MRL "encodes information at different granularities and allows a single embedding to adapt to the computational constraints of downstream tasks"; "MRL learns **coarse-to-fine representations**"; it imposes no additional cost at inference. Claimed benefits in the abstract: up to **14x smaller embedding size** for ImageNet-1K at the same accuracy, up to **14x real-world speed-ups** for large-scale retrieval, and up to **2% accuracy improvements** for long-tail few-shot classification. Code: https://github.com/RAIVNLab/MRL
- Source: https://arxiv.org/abs/2205.13147

**Nested/truncatable property VERIFIED from Hugging Face's official blog:**
> "These Matryoshka embedding models are trained such that these small truncated embeddings would still be useful... Matryoshka embedding models aim to store more important information in earlier dimensions, and less important information in later dimensions. This characteristic ... allows us to truncate the original (large) embedding produced by the model, while still retaining enough of the information..."
> **Important caveat also verified here:** "Do note that if the embeddings were normalized, then after truncating they will no longer be, so you may want to re-normalize."
- Source: https://huggingface.co/blog/matryoshka

**❌ "NeurIPS 2022 Outstanding Paper Award" — NOT VERIFIED; evidence indicates it is INCORRECT.**
I fetched the official NeurIPS 2022 awards page listing all Outstanding Papers: https://neurips.cc/virtual/2022/awards_detail
The list includes: "On-Demand Sampling", "Beyond neural scaling laws", "Gradient Estimation with Discrete Stein Operators", "MineDojo", "Gradient Descent: The Ultimate Optimizer", "Photorealistic Text-to-Image Diffusion Models (Imagen)", "Using natural language and program abstractions", "An empirical analysis of compute-optimal large language model training (Chinchilla)", "A Neural Corpus Indexer", "Riemannian Score-Based Generative Modelling", "Elucidating the Design Space of Diffusion-Based Generative Models", "ProcTHOR", "Is Out-of-Distribution Detection Learnable?", "High-dimensional limit theorems for SGD", "LAION-5B".
**Matryoshka Representation Learning does NOT appear on that list.** Also note: the arXiv page for 2205.13147 has **no award comment** in its Comments field (it reads "Edited related work to include intrinsic dimensionality works"), whereas papers with awards typically say so. **Conclusion: the NeurIPS 2022 Outstanding Paper claim should be treated as FALSE unless a different award (e.g. a workshop award or a NeurIPS 2022 *Datasets & Benchmarks* track award) is meant — I found no evidence for any such award.** ⚠️ Note: MRL *was* accepted at NeurIPS 2022 as a main-conference paper (this is consistent with it appearing in the proceedings), but acceptance ≠ Outstanding Paper Award.

**OpenAI `dimensions` parameter ✅ VERIFIED — exact statement found:**
From https://developers.openai.com/api/docs/guides/embeddings.md :
> "By default, the length of the embedding vector is `1536` for `text-embedding-3-small` or `3072` for `text-embedding-3-large`. To reduce the embedding's dimensions without losing its concept-representing properties, pass in the [`dimensions` parameter]."

> "Both of our new embedding models were trained **with a technique** that allows developers to trade-off performance and cost of using embeddings. Specifically, developers can shorten embeddings (i.e. remove some numbers from the end of the sequence) without the embedding losing its concept-representing properties by passing in the `dimensions` API parameter."

**And OpenAI explicitly cites the Matryoshka paper** — the phrase "with a technique" links directly to **https://arxiv.org/abs/2205.13147** in the docs. Additional verified OpenAI statements:
- "For example, on the MTEB benchmark, a `text-embedding-3-large` embedding can be shortened to a size of **256** while still outperforming an unshortened `text-embedding-ada-002` embedding with a size of **1536**."
- "In general, using the `dimensions` parameter when creating the embedding is the suggested approach."
- Manual truncation requires re-normalization (worked code examples for this are in the docs).

**OpenAI CURRENT embedding model recommendations ✅ VERIFIED — text-embedding-3 is still current:**
From the live model catalog: https://developers.openai.com/api/docs/models.md
The **only three embedding models** listed are:
- `text-embedding-3-large` — "Most capable embedding model"
- `text-embedding-3-small` — "Small embedding model"
- `text-embedding-ada-002` — "Older embedding model"

**No newer OpenAI embedding model has replaced text-embedding-3.** Model-specific pages confirm support status (fetched: https://developers.openai.com/api/docs/models/text-embedding-3-large.md and .../text-embedding-3-small.md):
- For `text-embedding-3-large` / `-small`: **Embeddings endpoint `v1/embeddings`: Supported**. Batch: Supported. **Chat Completions / Responses / Realtime etc.: Not supported.**
- ⚠️ **Important clarification of the user's observation about "Embeddings: Not supported":** that label appears on **chat/reasoning model** pages (e.g. GPT-5.x family), and it means *that chat model cannot be used on the embeddings endpoint* — **not** that OpenAI has dropped embeddings. The embedding models are separate entries in the catalog and they *do* support `v1/embeddings`. **The user's inference was correct; this is now confirmed.**
- Verified pricing/dimensions from the docs guide: `text-embedding-3-small` $0.02 / 1M tokens, 1536 dims, MTEB 62.3%, max input 8192; `text-embedding-3-large` $0.13 / 1M tokens, 3072 dims, MTEB 64.6%, max input 8192; `text-embedding-ada-002` 61.0% MTEB.
- Also verified from the docs FAQ: v3 embedding models "lack knowledge of events that occurred after September 2021."

### 6. Binary quantization ✅ VERIFIED, with the marketing numbers properly attributed

**Definition and the 32x claim — VERIFIED from Hugging Face's official engineering blog** ("Binary and Scalar Embedding Quantization for Significantly Faster & Cheaper Retrieval", published 22 March 2024, by Aamir Shakir, Tom Aarsen, SeanLee):
> "In particular, binary quantization refers to the conversion of the `float32` values in an embedding to **1-bit values, resulting in a 32x reduction in memory and storage usage**."

> "To quantize `float32` embeddings to binary, we simply threshold normalized embeddings at 0" — i.e. f(x) = 0 if x ≤ 0, 1 if x > 0. Retrieval uses **Hamming distance**.

**The "~96% retained" claim — FOUND, and it is correctly attributed to a specific setup:**
> "By applying this novel rescoring step, we are able to **preserve up to ~96% of the total retrieval performance**, while reducing the memory and disk space usage by 32x and improving the retrieval speed by up to 32x as well. **Without the rescoring, we are able to preserve roughly ~92.5%** of the total retrieval performance."

This is a **vendor/advocacy blog claim** (Hugging Face promoting its own quantization tooling), but it is *specific, hedged ("up to"), and discloses the no-rescoring baseline (~92.5%)*. 📣 **Attribution: Hugging Face blog, March 2024 — an interested party. Treat ~96% as "up to 96% with rescoring, on their benchmark", not as a universal guarantee.**
Source: https://huggingface.co/blog/embedding-quantization

**Also verified from that same source:** the rescoring trick is attributed to **Yamada et al. (2021), arXiv:2106.00882** ("introduced a rescore step, which they called *rerank*"): retrieve `rescore_multiplier * top_k` with binary embeddings, then rescore that list using the float32 query embedding against binary document embeddings via dot product.

**The LSH paper requested ✅ VERIFIED:** arXiv:1509.02897, "Practical and Optimal LSH for Angular Distance", authors **Alexandr Andoni, Piotr Indyk, Thijs Laarhoven, Ilya Razenshteyn, Ludwig Schmidt**, submitted 9 Sep 2015. Comment field confirms: "an extended abstract is to appear in the proceedings of the **29th Annual Conference on Neural Information Processing Systems (NIPS 2015)**". Abstract confirms an LSH family for angular distance with asymptotically optimal running time exponent, a multiprobe version, and a fine-grained lower bound. Source: https://arxiv.org/abs/1509.02897
⚠️ Note: this paper is about *LSH for angular distance* (theory + practice) — it is a legitimate citation for the *theoretical basis* of binary/sign-based hashing, but it does **not** itself state the 32x/96% vendor numbers. Don't conflate the two.

**Corroboration that binary quantization is real and used in production (VERIFIED from primary docs):** pgvector's README documents a `binary_quantize(vector) → bit` function and recommends exactly the two-stage pattern: "**Re-rank by the original vectors for better recall**" (fetch candidates by Hamming distance, then reorder with `<=>` on the 3072... i.e. full-precision vectors). Source: https://raw.githubusercontent.com/pgvector/pgvector/master/README.md

---

## VECTOR SEARCH

### 7. HNSW ✅ VERIFIED, including M and efConstruction/efSearch semantics

**Paper VERIFIED:**
- arXiv:1603.09320, "Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs", authors **Yu. A. Malkov, D. A. Yashunin**. Submitted 30 Mar 2016 (v1); last revised 14 Aug 2018 (v4). Subject cs.DS. Abstract confirms: fully graph-based with **no additional search structures**; "incrementally builds a **multi-layer structure** consisting from hierarchical set of proximity graphs (layers) for nested subsets of the stored elements"; "The maximum layer in which an element is present is selected randomly with an **exponentially decaying probability distribution**"; "allows a **logarithmic complexity scaling**"; "Additional employment of a **heuristic for selecting proximity graph neighbors** significantly increases performance at high recall and in case of highly clustered data." Source: https://arxiv.org/abs/1603.09320
- (Note: the hnswlib README cites the journal version as IEEE TPAMI vol. 42, no. 4, pp. 824–836, 2018.)

**Parameter semantics VERIFIED from hnswlib's official `ALGO_PARAMS.md`** (the reference HNSW implementation by co-author Yury Malkov):
- **`M`** — "the number of bi-directional links created for every new element during construction. Reasonable range for `M` is **2-100**. Higher `M` work better on datasets with **high intrinsic dimensionality and/or high recall**, while low `M` work better for datasets with low intrinsic dimensionality and/or low recalls. The parameter also determines the algorithm's **memory consumption, which is roughly `M * 8-10` bytes per stored element`**." Also: for `dim`=4 random vectors optimal M ≈ 6, while for high-dimensional data (word embeddings) "`M`=48-64 for optimal performance at high recall. The range `M`=12-48 is ok for the most of the use cases."
- **`ef_construction`** — "the parameter has the same meaning as `ef`, but controls the **index_time/index_accuracy**. Bigger `ef_construction` leads to **longer construction, but better index quality**. At some point, increasing ef_construction does not improve the quality of the index."
- **`ef`** (search-time; exposed as **`efSearch`** in most libraries) — "the size of the dynamic list for the nearest neighbors (used during the search). **Higher `ef` leads to more accurate but slower search.** `ef` cannot be set lower than the number of queried nearest neighbors `k`."
- Source: https://raw.githubusercontent.com/nmslib/hnswlib/master/ALGO_PARAMS.md

**Independent corroboration of the same tradeoffs from pgvector's README** (fetched): `m` default 16, `ef_construction` default **64**; "A higher value of `ef_construction` provides better recall at the cost of index build time / insert speed."; `hnsw.ef_search` default **40**; "A higher value provides better recall at the cost of speed."; and "An HNSW index creates a multilayer graph. It has better query performance than IVFFlat (in terms of speed-recall tradeoff), but has **slower build times and uses more memory**." Source: https://raw.githubusercontent.com/pgvector/pgvector/master/README.md

### 8. IVF, Product Quantization, and FAISS ✅ VERIFIED (with the exact DOI)

**Product Quantization origin VERIFIED with full bibliographic details** (via Crossref API, since IEEE Xplore blocks automated fetches):
- Title: **"Product Quantization for Nearest Neighbor Search"**
- Authors: **H. Jégou, M. Douze, C. Schmid**
- Venue: **IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI)**, vol. **33**, issue **1**, pages **117–128**, published print **January 2011**
- **DOI: 10.1109/TPAMI.2010.57** — resolve at https://doi.org/10.1109/TPAMI.2010.57
- Crossref record: https://api.crossref.org/works/10.1109/TPAMI.2010.57 (publisher: IEEE; is-referenced-by-count: 2306)
- Semantic Scholar record also confirms title/authors/venue/year and an open-access PDF at https://inria.hal.science/inria-00514462 : https://api.semanticscholar.org/graph/v1/paper/DOI:10.1109/TPAMI.2010.57
- ⚠️ **There is no arXiv preprint** of this paper. It is a journal article (IEEE TPAMI). The user asked to "find the arXiv or DOI" — the answer is: **use the DOI; no arXiv version exists.**
- Abstract (from Semantic Scholar) confirms the core mechanism: "decompose the space into a **Cartesian product of low-dimensional subspaces** and to quantize each subspace separately. A vector is represented by a short code composed of its subspace quantization indices"; "An **asymmetric version** increases precision, as it computes the approximate distance between a vector and a code"; "in particular in combination with an **inverted file system**"; scalability "validated on a data set of **two billion vectors**."

**IVF VERIFIED** (from pgvector README): "An IVFFlat index **divides vectors into lists**, and then searches a subset of those lists that are closest to the query vector. It has **faster build times and uses less memory than HNSW, but has lower query performance** (in terms of speed-recall tradeoff)." Guidance verified: create the index *after* data exists; `lists ≈ rows/1000` for up to 1M rows and `sqrt(rows)` above 1M; `probes ≈ sqrt(lists)`; default `probes` = 1.

**FAISS origin and license VERIFIED:**
- arXiv:1702.08734, "Billion-scale similarity search with GPUs", authors **Jeff Johnson, Matthijs Douze, Hervé Jégou**. Submitted 28 Feb 2017. Abstract confirms a k-selection design "at up to **55% of theoretical peak performance**", "**8.5x faster** than prior GPU state of the art", building a k-NN graph on **95 million images** from Yfcc100M in **35 minutes**, and a graph connecting **1 billion vectors in less than 12 hours on 4 Maxwell Titan X GPUs**. Source: https://arxiv.org/abs/1702.08734
- **FAISS GitHub canonical URL VERIFIED: https://github.com/facebookresearch/faiss** — README states: "It is **developed primarily at Meta's Fundamental AI Research group**." **License: MIT** — README's Legal section: "Faiss is **MIT-licensed** ... Copyright © Meta Platforms, Inc." Source: https://raw.githubusercontent.com/facebookresearch/faiss/main/README.md
- Note the README also gives a newer citation for the library itself: Douze et al., "The Faiss library", arXiv:2401.08281 (2024).
- ⚠️ Correction to the user's phrasing: FAISS is written primarily in **C++ with Python/numpy wrappers**, and it is a **library, not a server/database** (see item 9).

### 9. Vector databases — canonical URLs, type, and licenses ✅ ALL VERIFIED

| Product | Canonical URL | Library or Server? | License / Model | Notes (verified) |
|---|---|---|---|---|
| **FAISS** | https://github.com/facebookresearch/faiss | **Library** (C++ w/ Python wrappers); no server, no built-in persistence/CRUD | **MIT** (open source) | Meta Fundamental AI Research. Supports L2, dot product, cosine (as dot product on normalized vectors). |
| **Chroma** | https://github.com/chroma-core/chroma | **Both**: embedded library (`pip install chromadb`) *and* client-server (`chroma run --path ...`) | **Apache 2.0** (open source) | README: "Chroma — the open-source data infrastructure for AI"; "License: Apache 2.0". Has a managed offering, **Chroma Cloud**. |
| **Qdrant** | https://github.com/qdrant/qdrant | **Server** (client-server; Docker `qdrant/qdrant`) | **Apache 2.0** (open source) | Written in Rust. Also a managed **Qdrant Cloud** (free tier). "Vector similarity search engine and vector database." |
| **pgvector** | https://github.com/pgvector/pgvector | **PostgreSQL extension** (not a standalone server) | **Open source** (PostgreSQL-licensed style; repo is a Postgres extension) | README: "**Open-source vector similarity search for Postgres**". `CREATE EXTENSION vector;`. Supports exact + ANN (HNSW, IVFFlat), L2/inner product/cosine/L1/Hamming/Jaccard, `vector`/`halfvec`/`bit`/`sparsevec`. |
| **Pinecone** | https://www.pinecone.io (docs: https://docs.pinecone.io) | **Managed cloud service** | **PROPRIETARY** (closed source; no public source repo) | Docs verified at https://docs.pinecone.io/guides/get-started/overview (fetched; covers serverless/pod-based indexes, namespaces, hybrid search, reranking, BYOC). |
| **LanceDB** | https://github.com/lancedb/lancedb | **Embedded library** (+ a cloud service) | **Open source** (README: "**100% open source**, runs locally or in your cloud. No vendor lock-in.") | Built on the **Lance columnar format**. Multimodal: vector + full-text + SQL. Has **LanceDB Cloud**. ⚠️ I did not fetch the LICENSE file to confirm the exact SPDX identifier (Apache-2.0 is the widely reported one) — **exact license name UNVERIFIED**. |
| **sqlite-vec** | https://github.com/asg017/sqlite-vec | **SQLite extension** (not a server) | **Open source** | ✅ **Author and lineage VERIFIED**: repo owner is `asg017` (**Alex Garcia**), and the README's first line states it is "**A successor to [`sqlite-vss`](https://github.com/asg017/sqlite-vss)**". Written in **pure C, no dependencies**, runs anywhere SQLite runs (Linux/macOS/Windows, **WASM in the browser**, Raspberry Pi). Stores float, int8, and binary vectors in `vec0` virtual tables. **Important status warning from the README: "`sqlite-vec` is a pre-v1, so expect breaking changes!"** Backed by Mozilla Builders + Fly.io/Turso/SQLite Cloud/Shinkai. |
| **Milvus** | https://github.com/milvus-io/milvus | **Server** (distributed, K8s-native; also Standalone mode and embedded **Milvus Lite**) | **Apache 2.0** (open source), under the **LF AI & Data Foundation**, with **Zilliz** as major contributor | Written in Go and C++. Managed service: **Zilliz Cloud**. Supports HNSW, IVF, FLAT, SCANN, DiskANN, quantization variants. |
| **Weaviate** | https://github.com/weaviate/weaviate | **Server** (cloud-native, Docker/K8s) | **BSD 3-Clause** (open source) | README: "**Weaviate** is an open-source, cloud-native vector database that stores both objects and vectors". Built in Go. Has **Weaviate Cloud**. |

Sources fetched for this table: the raw README of each project (URLs above), plus https://docs.pinecone.io/guides/get-started/overview.

**Licenses I did NOT independently confirm by fetching the LICENSE file:** LanceDB (README says "100% open source" but the exact SPDX id was not on the page I fetched) and pgvector (README says "Open-source" without naming a license). **Mark those two exact license names as UNVERIFIED.**

### 10. Reranking: bi-encoder vs cross-encoder ✅ VERIFIED

**Canonical source VERIFIED:**
- arXiv:1901.04085, "Passage Re-ranking with BERT", authors **Rodrigo Nogueira, Kyunghyun Cho**. Submitted 13 Jan 2019 (v1); v5 14 Apr 2020. Abstract: "we describe a **simple re-implementation of BERT for query-based passage re-ranking**. Our system is the state of the art on the TREC-CAR dataset and the top entry in the leaderboard of the MS MARCO passage retrieval task, **outperforming the previous state of the art by 27% (relative) in MRR@10**." Code: https://github.com/nyu-dl/dl4marco-bert. Source: https://arxiv.org/abs/1901.04085

**The bi-encoder vs cross-encoder distinction VERIFIED from Voyage AI's official docs (now part of MongoDB):**
> "Unlike [embedding] models that **encode queries and documents separately**, rerankers are **cross-encoders** that **jointly process a pair of query and document**, enabling more accurate relevancy prediction. Thus, it is a common practice to apply a reranker on the top candidates retrieved with embedding-based search (or with lexical search algorithms such as BM25 and TF-IDF)."
Source: https://docs.voyageai.com/docs/reranker

**The same distinction VERIFIED from BAAI's official FlagEmbedding README** (the BGE project): the model table describes `bge-reranker-base` and `bge-reranker-large` as "**a cross-encoder model which is more accurate but less efficient**", and the news entry for 09/12/2023 states: "release cross-encoder models `BAAI/bge-reranker-base` and `BAAI/bge-reranker-large`, which are **more powerful than embedding model**. We recommend to use/fine-tune them to **re-rank top-k documents returned by embedding models**." Source: https://raw.githubusercontent.com/FlagOpen/FlagEmbedding/master/README.md

**Modern rerankers exist ✅ VERIFIED (3 independent vendors/models):**
- **Cohere Rerank** — product docs page exists at https://docs.cohere.com/docs/rerank-overview (fetched; the page is a JS-heavy docs site and returned mostly navigation chrome, so I confirmed **existence of the product/docs page but not detailed claims** — ⚠️ PARTIALLY VERIFIED).
- **BGE reranker** — ✅ fully verified above, and it's **open source under MIT** (FlagEmbedding repo license: MIT). Note the repo README is somewhat dated (latest entries are 2024/2025) but explicitly lists bge-reranker-v2-m3, v2-gemma, v2-minicpm-layerwise, v2.5-gemma2-lightweight.
- **Voyage rerank** — ✅ VERIFIED: models `rerank-3`, `rerank-3-lite` (in preview), `rerank-2.5`, `rerank-2.5-lite` (32,000 token context), plus legacy rerank-2 / rerank-2-lite / rerank-1 / rerank-lite-1. REST endpoint `POST https://api.voyageai.com/v1/rerank`. **Hard limits verified from the docs: "The number of documents cannot exceed 1,000"** and total tokens capped at 600K. Voyage AI is now **Voyage AI by MongoDB**.
- Also verified: **Pinecone** ships a rerank feature (docs sidebar includes "Rerank results" at https://docs.pinecone.io/guides/search/rerank-results).

**The key tradeoff (cross-encoders more accurate but O(n) forward passes, cannot be precomputed) ✅ VERIFIED in substance.**
- The "more accurate but less efficient" characterization is stated verbatim by BAAI, and the joint-processing (hence non-precomputable) mechanism is stated verbatim by Voyage.
- The *reason* precomputation is impossible — a cross-encoder's score depends on the (query, document) **pair**, so document representations cannot be computed and cached independently of the query; the only way to precompute is the bi-encoder's separate encoding — follows directly from the verified "jointly process a pair" statement. The **O(n) forward passes per query** cost is the direct consequence and is consistent with the SBERT abstract's verified 65-hour vs 5-second figure for the analogous bi-encoder speedup.
- ⚠️ **I did not find a single primary source that states the literal sentence "cross-encoders cannot be precomputed."** It is an inference from verified mechanism statements, not a directly quoted claim. Mark the *explicit sentence* as UNVERIFIED-as-quoted, while the *mechanism* is verified.

---

## QUANTIZATION / LOCAL INFERENCE

### 11. GGUF ⚠️ IMPORTANT CORRECTION on the expansion of the acronym

**What I verified — and an important discrepancy:**

- **GGUF IS the successor to GGML ✅ VERIFIED.** From the official spec (ggml docs):
  > "It is a **successor file format to GGML, GGMF and GGJT**, and is designed to be unambiguous by containing all the information needed to load a model."
  > "At present, there are three GGML file formats floating around for LLMs: **GGML** (unversioned) ... **GGMF** (versioned) ... **GGJT** ..."
- **GGUF IS used by llama.cpp ✅ VERIFIED.** llama.cpp's README describes it as "LLM inference in C/C++" built on the ggml library, and its quantize tool "takes a **GGUF input model file**". The ggml doc says "GGUF is a file format for storing models for **inference with GGML and executors based on GGML**."
- **Official spec URL ✅ VERIFIED: https://github.com/ggml-org/ggml/blob/master/docs/gguf.md** (raw: https://raw.githubusercontent.com/ggml-org/ggml/master/docs/gguf.md). This documents the format: magic `GGUF` (`0x47 0x47 0x55 0x46`), version must be **3** for the current spec (v1 initial, v2 uint32→uint64 counts, v3 adds big-endian), tensor types enum, metadata key-value structure, naming convention, `general.alignment` default 32. Verified tensor type enum values include `GGML_TYPE_Q4_0 = 2`, `Q5_0 = 6`, `Q8_0 = 8`, `Q2_K = 10`, `Q3_K = 11`, `Q4_K = 12`, `Q5_K = 13`, `Q6_K = 14`, `Q8_K = 15`, plus IQ* (i-quant) types and `MXFP4 = 39`.
- **❌ "GPT-Generated Unified Format" — NOT VERIFIED, and contradicted by the official repo.** The official llama.cpp Python package README states:
  > "This is a Python package for writing binary files in the **GGUF (GGML Universal File)** format."
  Source: https://raw.githubusercontent.com/ggml-org/llama.cpp/master/gguf-py/README.md
  The official ggml spec page I fetched **never expands the acronym** and never uses the phrase "GPT-Generated Unified Format". **Conclusion: "GPT-Generated Unified Format" appears to be a widely-circulated backronym with no support in the official documentation I fetched. The official expansion given by the project is "GGML Universal File". Treat "GPT-Generated Unified Format" as UNVERIFIED / likely incorrect.**

**Quantization naming ✅ VERIFIED, and Q4_K_M's meaning ✅ VERIFIED:**
- **Q4_K_M, Q5_K_M, Q8_0 all exist** ✅ — verified as officially supported quant types in llama.cpp's quantize tool README (benchmark tables list `Q4_K_S`, `Q4_K_M`, `Q5_K_S`, `Q5_K_M`, `Q6_K`, `Q8_0`, alongside IQ* and legacy types), and `Q4_K_M`/`Q5_K_M`/`Q8_0` appear in the official GGUF naming-convention examples (e.g. `mtp-Qwen3-27B-v1.0-Q4_K_M.gguf`, `mmproj-gemma-4-E2B-it-Q8_0.gguf`).
- **Q4_K_M roughly means "4-bit, K-quant, Medium"** ✅ VERIFIED as the naming convention. Official examples of `--output-tensor-type q5_k`, `--token-embedding-type q3_k`, and the FAQ guidance to quantize "to `Q4_K_M`".
- **K-quants vs legacy quants ✅ VERIFIED to be a real, documented distinction.** The quantize README has a "Background information" section linking **"k-quants" (PR #1684)** separately from later "k-quants improvements and i-quants" PRs, and provides a `--pure` flag documented as "**disable k-quant mixtures** and quantizes all tensors to the same type". Legacy types appear as `Q4_0`, `Q5_0`, `Q5_1`, `Q8_0` vs K-quant types `Q2_K`…`Q6_K`. The ggml spec doc's `file_type` enum confirms distinct entries: `MOSTLY_Q4_0 = 2`, `MOSTLY_Q4_1 = 3`, `MOSTLY_Q8_0 = 7`, `MOSTLY_Q5_0 = 8`, `MOSTLY_Q5_1 = 9` (legacy) vs `MOSTLY_Q2_K = 10` … `MOSTLY_Q6_K = 18` (K-quants).
- **⚠️ CAREFUL WITH BIT-WIDTH CLAIMS — verified actual measured bits/weight (Llama-3.1-8B, from the official quantize README):**
  - `Q2_K` = **3.1593** bits/weight; `Q2_K_S` = 2.9697
  - `Q3_K_S` = 3.6429; `Q3_K_M` = 3.9960; `Q3_K_L` = 4.2979
  - `Q4_K_S` = **4.6672**; **`Q4_K_M` = 4.8944**; `Q4_K_L` not listed
  - `Q5_K_S` = **5.5704**; **`Q5_K_M` = 5.7036**; `Q6_K` = 6.5633
  - **`Q8_0` = 8.5008**; `F16` = 16.0005; `IQ4_XS` = 4.4597; `IQ4_NL` = 4.6818
  **So "Q4_K_M = 4-bit" is a label, not the measured average: it is ~4.89 bits/weight in llama.cpp's own benchmark, because K-quants mix precisions across tensors (and "M"/"S" denote the mix). Q8_0 is ~8.5 bits/weight, not 8.0.** This is exactly the "be careful with bit-width claims" caveat — verified with official numbers.
- **Verified size figures** (official, Llama 3.1): 8B model 32.1 GB original → **4.9 GB at Q4_K_M**; 70B 280.9 GB → 43.1 GB; 405B 1,625.1 GB → 249.1 GB.

### 12. AWQ and GPTQ ✅ VERIFIED — including a bonus finding that AWQ won a Best Paper Award

**AWQ ✅ VERIFIED:**
- arXiv:2306.00978, "AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration", first author **Ji Lin** (full list: Lin, Jiaming Tang, Haotian Tang, Shang Yang, Wei-Ming Chen, Wei-Chen Wang, Guangxuan Xiao, Xingyu Dang, Chuang Gan, Song Han). Submitted 1 Jun 2023.
- **Venue VERIFIED, and stronger than expected:** the arXiv Comments field reads **"MLSys 2024 Best Paper Award."** So the user's "MLSys 2024" is confirmed **and** it was the **Best Paper**. Code: https://github.com/mit-han-lab/llm-awq
- **Approach VERIFIED from the abstract, matching the user's description precisely:**
  > "AWQ finds that **not all weights in an LLM are equally important. Protecting only 1% salient weights** can greatly reduce quantization error. To identify salient weight channels, we should **refer to the activation distribution, not weights**. To avoid the hardware-inefficient mix-precision quantization, we mathematically derive that **scaling up the salient channels can reduce the quantization error**. AWQ employs an **equivalent transformation to scale the salient weight channels** to protect them. The scale is determined by **collecting the activation statistics offline**. AWQ **does not rely on any backpropagation or reconstruction**."
  Also verified: it's **weight-only** quantization, and TinyChat gives "more than **3x speedup** over the Huggingface FP16 implementation".
- Source: https://arxiv.org/abs/2306.00978

**GPTQ ✅ VERIFIED:**
- arXiv:2210.17323, "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers", authors **Elias Frantar, Saleh Ashkboos, Torsten Hoefler, Dan Alistarh**. Submitted 31 Oct 2022; v2 22 Mar 2023.
- **Venue VERIFIED: the arXiv Comments field reads "ICLR 2023"** — the user's claim is correct. Code: https://github.com/IST-DASLab/gptq. License: CC BY 4.0 (per arXiv license icon).
- **Approach VERIFIED from the abstract, matching "layer-wise second-order/OBQ-based error compensation":**
  > "we propose GPTQ, a **new one-shot weight quantization method based on approximate second-order information**, that is both highly-accurate and highly-efficient."
  > "GPTQ can quantize GPT models with **175 billion parameters in approximately four GPU hours**, reducing the bitwidth down to **3 or 4 bits per weight**, with **negligible accuracy degradation** relative to the uncompressed baseline."
  > "Our method **more than doubles the compression gains relative to previously-proposed one-shot quantization methods**"; also reports 2-bit and ternary feasibility; end-to-end inference speedups over FP16 of "around **3.25x**" on A100 and "**4.5x**" on A6000.
  ⚠️ The abstract says "approximate second-order information" but does **not** name OBQ (Optimal Brain Quantization) in the abstract; the OBQ lineage is in the paper body. **"OBQ-based" specifically: UNVERIFIED from the abstract I fetched** (the second-order / layer-wise error-compensation claim IS verified).

**Key difference between AWQ and GPTQ ✅ VERIFIED** and matches the user's framing: **AWQ** = protect a small set (~1%) of **activation-magnitude-salient** weight channels via an equivalent scaling transform, **no backprop, no reconstruction**, better generalization across domains/modalities. **GPTQ** = **approximate second-order** (Hessian-based) **error compensation**, layer-wise/one-shot, quantizing to 3–4 bits.

### 13. bitsandbytes / NF4 / QLoRA ✅ VERIFIED for NF4 and QLoRA

- arXiv:2305.14314, "QLoRA: Efficient Finetuning of Quantized LLMs", authors **Tim Dettmers, Artidoro Pagnoni, Ari Holtzman, Luke Zettlemoyer**. Submitted 23 May 2023. arXiv comment: "Extended NeurIPS submission". License: CC BY 4.0.
- **NF4 introduction VERIFIED verbatim from the abstract:**
  > "QLoRA introduces a number of innovations to save memory without sacrificing performance: (a) **4-bit NormalFloat (NF4), a new data type that is information theoretically optimal for normally distributed weights** (b) **double quantization** to reduce the average memory footprint by quantizing the quantization constants, and (c) **paged optimizers** to manage memory spikes."
  Also verified: "reduces memory usage enough to **finetune a 65B parameter model on a single 48GB GPU** while preserving full 16-bit finetuning task performance"; "backpropagates gradients through a **frozen, 4-bit quantized pretrained language model** into Low Rank Adapters (LoRA)"; the **Guanaco** model family "reaching **99.3% of the performance level of ChatGPT**" on the Vicuna benchmark after 24 hours on a single GPU; finetuned **more than 1,000 models**.
- Source: https://arxiv.org/abs/2305.14314
- **⚠️ The QLoRA paper introduces NF4, so "QLoRA introduced NF4" is VERIFIED.** However, **the paper does not itself mention "bitsandbytes"** in the abstract. The claim "bitsandbytes is the library that implements 8-bit and 4-bit (NF4) quantization, used by QLoRA" is **strongly corroborated** (bitsandbytes is the well-known Dettmers library and implements both `LLM.int8()` and NF4), but I did **not fetch** the bitsandbytes repo/docs in this session. **Mark "bitsandbytes is the library for 8-bit and NF4" as UNVERIFIED in this session** — I verified only that NF4 was introduced by the QLoRA paper.

### 14. Ollama ✅ VERIFIED

- **Canonical URL ✅ VERIFIED: https://ollama.com** — the official README's logo links to `https://ollama.com`, install scripts are at `https://ollama.com/install.sh` (macOS/Linux) and `https://ollama.com/install.ps1` (Windows), and the model library is `https://ollama.com/library`.
- **Built around llama.cpp ✅ VERIFIED.** The README has a "Supported backends" section whose sole entry is: "**[llama.cpp](https://github.com/ggml-org/llama.cpp) project founded by Georgi Gerganov.**" The development doc confirms native CGO code with CMake builds and `-DOLLAMA_LLAMA_BACKENDS="cuda_v13;vulkan"` options (supported values: `cuda_v12`, `cuda_v13`, `rocm_v7_1`, `rocm_v7_2`, `vulkan`, `cuda_jetpack5`, `cuda_jetpack6`).
- **REST API ✅ VERIFIED.** README: "**Ollama has a REST API for running and managing models.**" with the example `curl http://localhost:11434/api/chat -d '{...}'` (note the **default port 11434**), and API documentation at https://docs.ollama.com/api. Official Python (`pip install ollama`) and JS (`npm i ollama`) clients verified.
- **License ✅ VERIFIED: MIT.** I fetched https://raw.githubusercontent.com/ollama/ollama/main/LICENSE — "MIT License, Copyright (c) Ollama". So Ollama is **open source (MIT)**.
- Source: https://raw.githubusercontent.com/ollama/ollama/main/README.md
- ⚠️ One nuance worth flagging: Ollama's **current** README is brand-forward ("Start building with open models", agent integrations, "ollama launch claude"), and the development docs show a **MLX engine** option in addition to llama.cpp. So "built around llama.cpp" remains true as the primary documented backend, but the codebase now also supports an MLX path.

### 15. LM Studio ✅ VERIFIED as proprietary — licensing claim checked carefully

- **Canonical URL ✅ VERIFIED: https://lmstudio.ai** (the page I fetched was https://lmstudio.ai/app-terms, which self-identifies as LM Studio's terms page; the README-independent site navigation confirms `/download`, `/docs`, `/models`).
- **GUI app ✅ VERIFIED** — the terms are titled "**LM Studio Desktop App Terms of Service**", covering "the LM Studio Desktop App" and downloads (`.dmg`/`.exe` style docs at `/docs`), i.e. a desktop GUI application (there is also a separate CLI, `lms`).
- **PROPRIETARY — VERIFIED, and the licensing claim is NOT "free for personal use" in the way often assumed.** From the Terms (Version: August 23, 2026) at https://lmstudio.ai/app-terms :
  - The contracting entity is **"Element Labs, Inc."** and the terms are between the user and that company.
  - The license grant is: "Company grants to You a **non-exclusive, non-transferable license** to use the Software solely for **Your personal and / or internal business purposes** and solely in accordance with the Documentation." — Note: this covers **internal business purposes too**, not only personal use.
  - **Restrictions on Use** explicitly prohibit: "(a) modify, adapt, alter, translate, or **create derivative works** from the Software"; "(b) integrate the Software with other software other than through Company published interfaces"; "(d) sublicense, distribute, sell, use for service bureau use, as an application service provider, or a software-as-a-service, lease, rent, loan, or otherwise transfer the Software"; "(e) **reverse engineer, decompile, disassemble**, or otherwise attempt to derive the source code for the Software".
  - "**Proprietary Rights** ... The Software and Documentation, and all worldwide Intellectual Property Rights therein, are the **exclusive property of Company** and its suppliers."
  - There is a **"Paid Features and Billing"** section (subscriptions, usage-based charges, usage credits) — so free-tier use coexists with paid tiers (the site also advertises `Enterprise`). I did **not** find a clause literally saying "free for personal use".
  - ⚠️ **No open-source license is granted anywhere in the fetched terms.** It explicitly forbids combining with the Software in a way that would impose open-source obligations on it.
- **Conclusion:** LM Studio = **proprietary, closed-source desktop application** by Element Labs, Inc., with a free tier and paid features; **not** open source. The precise phrase "free for personal use" is **UNVERIFIED** — what the terms actually grant is a free-of-charge-looking non-transferable license for "personal and/or internal business purposes", alongside separately-priced Paid Features.

### 16. vLLM and llama.cpp licenses ✅ VERIFIED

- **vLLM canonical URLs ✅ VERIFIED:**
  - Docs: **https://docs.vllm.ai** (README links "Documentation" → https://docs.vllm.ai; deep links such as `https://docs.vllm.ai/en/latest/` verified in text)
  - GitHub: **https://github.com/vllm-project/vllm**
  - README: "vLLM is a fast and easy-to-use **library for LLM inference and serving**." "Originally developed in the **Sky Computing Lab** at **UC Berkeley**", now "over 2000 contributors". Ships an **OpenAI-compatible API server**, plus Anthropic Messages API and gRPC. Paper: Kwon et al., "Efficient Memory Management for Large Language Model Serving with PagedAttention", **arXiv:2309.06180** (SOSP). Quantization support verified: "FP8, MXFP8/MXFP4, NVFP4, INT8, INT4, **GPTQ/AWQ**, **GGUF**, compressed-tensors, ModelOpt, TorchAO".
  - **License Apache 2.0: ⚠️ PARTIALLY VERIFIED.** The README I fetched **does not state the license** (no badge/section). Apache-2.0 is the widely known vLLM license, but **I did not fetch the LICENSE file**, so I am marking the exact license as **UNVERIFIED from my own fetches**. (This is trivially confirmable at https://raw.githubusercontent.com/vllm-project/vllm/main/LICENSE.)
- **llama.cpp license ✅ VERIFIED: MIT.** The README's very first badge is `[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)`.
- Source: https://raw.githubusercontent.com/vllm-project/vllm/main/README.md and https://raw.githubusercontent.com/ggml-org/llama.cpp/master/README.md

### 17. Open Weights vs Open Source AI, and the model-license landscape ⚠️ MIXED

**OSAID (Open Source AI Definition) — existence and URL ✅, full text ⚠️ PARTIALLY VERIFIED:**
- The canonical OSAID page exists at **https://opensource.org/ai/open-source-ai-definition** and is titled "**The Open Source AI Definition – 1.0**" (fetched, HTTP 200). The OSI "Open Source AI" hub page is **https://opensource.org/ai** (fetched, HTTP 200).
- ⚠️ Both pages are JS-rendered and returned **only the title with no body text** ("Content truncated. Fetch a more specific URL or section for the full text."). **I could NOT read the actual four freedoms / clause text of OSAID 1.0, and could NOT verify the "released Oct 2024" date from the page content.**
- **Mark as UNVERIFIED:** (a) the exact release date "October 2024"; (b) the precise textual definition/freedoms; (c) the specific requirement language about training data. The page and its title **do** exist and are reachable, so OSAID 1.0 is real and that is its canonical URL. (Several OSI blog URLs I tried — `/blog/introducing-the-open-source-ai-definition`, `/blog/open-source-ai-definition-1-0` — returned **404**, and the OSAID GitHub repos I guessed (`OpenSourceAI/definition`, `OpenSourceAI/osaid`) returned **404**, so I could not reach a markdown source.)

**"Open weights" vs open source — ⚠️ UNVERIFIED as a cited definition.** I could not retrieve an authoritative page that defines "open weights" and contrasts it with OSAID. The **conceptual distinction the user describes (open weights = you can download and run the weights, but not necessarily the training data and/or training code) is consistent with** why OSAID exists and why the Llama license fails OSI criteria — but I have **no fetched source stating it**. **Treat the definition as UNVERIFIED; the Llama evidence below is the concrete, verified illustration of the gap.**

**Meta's Llama license is NOT OSI-approved ✅ VERIFIED — the restriction is documented in the license text itself.**
I fetched the **Llama 3.1 Community License Agreement** in full: https://raw.githubusercontent.com/meta-llama/llama-models/main/models/llama3_1/LICENSE
Verified restrictive clauses that make it non-open-source:
1. **Section 2, "Additional Commercial Terms":** "If, on the Llama 3.1 version release date, the **monthly active users** of the products or services made available by or for Licensee, or Licensee's affiliates, is **greater than 700 million monthly active users** in the preceding calendar month, **you must request a license from Meta, which Meta may grant to you in its sole discretion**, and you are **not authorized to exercise any of the rights under this Agreement** unless or until Meta otherwise expressly grants you such rights." → **This is a field-of-use/scale restriction, which is incompatible with open-source definitions.**
2. **Acceptable Use Policy incorporation** (Section 1.b.iv): use "must comply with applicable laws and regulations ... and **adhere to the Acceptable Use Policy**" — a use restriction.
3. **Mandatory attribution/branding** (Section 1.b.i): must "prominently display '**Built with Llama**'" and, for derivative models, "include '**Llama**' at the beginning of any such AI model name."
4. **Trademark limits** (Section 5.a): "**No trademark licenses are granted**."
5. **Retaliatory termination** (Section 5.c): if you sue Meta alleging the Llama Materials infringe your IP, "**any licenses granted to you under this Agreement shall terminate**."
6. It is titled a "non-exclusive, worldwide, **non-transferable** and royalty-free **limited license**" — and the definitions call Llama 3.1 "**Meta's proprietary Llama 3.1**".
**Conclusion: the Llama license is a community license with restrictions and is NOT OSI-approved. VERIFIED from the primary license text.** (Note: I did not fetch an OSI page *listing* Llama as non-approved, because the OSI pages would not render — the license text itself is the primary evidence and it is conclusive on the restrictions.)

**DeepSeek-R1 license ✅ VERIFIED: MIT.**
The Hugging Face model card for `deepseek-ai/DeepSeek-R1` displays **"License: mit"**. Source: https://huggingface.co/deepseek-ai/DeepSeek-R1

**Qwen license ✅ VERIFIED: Apache-2.0 for the sizes checked.**
- `Qwen/Qwen2.5-7B-Instruct` → **"License: apache-2.0"** : https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- `Qwen/Qwen3-8B` → **"License: apache-2.0"** : https://huggingface.co/Qwen/Qwen3-8B
- ⚠️ I verified only these two sizes. The user's hedge ("Apache 2.0 for many sizes") is appropriate — **I did not verify the license of every Qwen size** (some Qwen releases, e.g. certain larger or research models, have had different terms historically). Mark "all sizes" as UNVERIFIED.

**OpenRAIL licenses — ⚠️ UNVERIFIED.** I did not fetch any OpenRAIL license text (e.g. BigScience's BLOOM RAIL / CreativeML OpenRAIL-M) in this session. **I cannot confirm or deny anything specific about OpenRAIL terms. Mark UNVERIFIED.**

**The "recent shift" to permissive licensing — ⚠️ PARTIALLY VERIFIED.** I verified the *endpoints* (DeepSeek-R1 = MIT, Qwen = Apache-2.0, Llama 3.1 = restrictive community license), which is the substance of the claimed shift. **I did NOT verify the specific claim about "Llama 4" licensing**, since I fetched the Llama **3.1** license, not a Llama 4 license. **Mark the "Llama 4" specific claim as UNVERIFIED.** Also unverified: any claim about gpt-oss licensing, Mistral, Gemma, etc.

---

## SUMMARY OF UNVERIFIED / DISPUTED ITEMS (read this first)

| # | Claim | Status |
|---|---|---|
| 1 | word2vec embeddings "typically 300-dim" | ⚠️ Not in the abstracts I fetched. Widely true (GoogleNews vectors are 300d) but **UNVERIFIED from primary text**; needs the PDF body. |
| 5 | **MRL won a NeurIPS 2022 Outstanding Paper Award** | ❌ **CONTRADICTED.** MRL is absent from the official NeurIPS 2022 Outstanding Paper list; the arXiv entry carries no award. **Treat as false.** |
| 5 | MTEB has a "v2" successor | ⚠️ No "MTEB v2" product; the real successor is **MMTEB** (arXiv 2502.13595, Feb 2025). "v2" is a per-benchmark version suffix (e.g. `MTEB(eng, v2)`). |
| 5 | MTEB leaderboard rankings | ⚠️ URL verified canonical; the Space is JS-rendered so **rankings not verified**. |
| 5 | OpenAI embedding recommendations | ✅ Still `text-embedding-3-small` / `-large` (+ legacy ada-002). "Embeddings: Not supported" applies to *chat* models, now confirmed. |
| 9 | LanceDB exact license SPDX id; pgvector exact license | ⚠️ Both say "open source" in README; **exact license names UNVERIFIED** (LICENSE files not fetched). |
| 10 | Literal sentence "cross-encoders cannot be precomputed" | ⚠️ Mechanism verified; the **exact phrasing is an inference**, not a quote. |
| 11 | **GGUF = "GPT-Generated Unified Format"** | ❌ **NOT SUPPORTED.** Official llama.cpp `gguf-py` README says **"GGUF (GGML Universal File)"**. Treat the backronym as unverified/likely wrong. |
| 11 | "Q4_K_M = 4-bit" | ⚠️ It's a *label*; official measured average is **4.8944 bits/weight** (and `Q8_0` = **8.5008**). |
| 12 | GPTQ is "OBQ-based" | ⚠️ Abstract says "approximate second-order information"; **OBQ not named in the abstract**. |
| 12 | AWQ venue = MLSys 2024 | ✅ Verified **and it was the MLSys 2024 Best Paper Award**. |
| 13 | bitsandbytes is the 8-bit/NF4 library | ⚠️ QLoRA paper verifies **NF4**; the bitsandbytes attribution was **not fetched** this session. |
| 16 | vLLM license = Apache 2.0 | ⚠️ README doesn't state it; **LICENSE file not fetched.** (llama.cpp = MIT ✅ verified via badge.) |
| 17 | OSAID released Oct 2024; its detailed definition | ⚠️ Page exists (title verified) but **body would not render**; date and clause text **UNVERIFIED**. |
| 17 | "Open weights" authoritative definition | ❌ **UNVERIFIED** — no source fetched. |
| 17 | OpenRAIL licenses | ❌ **UNVERIFIED** — not fetched. |
| 17 | "Llama 4" license shift | ❌ **UNVERIFIED** — I verified Llama **3.1** only (non-OSI, 700M MAU cap). |
| 17 | Qwen Apache-2.0 "for many sizes" | ✅ Verified for Qwen2.5-7B-Instruct and Qwen3-8B; **other sizes UNVERIFIED**. |

## VENDOR MARKETING NUMBERS — USE WITH ATTRIBUTION

| Number | Source | Caveat |
|---|---|---|
| Binary quantization = **32x** memory/storage reduction | Hugging Face blog (Mar 2024) | Mathematically sound: 32-bit float → 1 bit. This one is safe. |
| Binary quantization preserves **"up to ~96%"** of retrieval performance | Hugging Face blog (Mar 2024) | 📣 **Vendor claim.** "Up to", with **rescoring**, on their benchmark. **Without rescoring: ~92.5%.** Always quote the rescoring qualifier. |
| Binary quantization gives **up to 32x** retrieval speedup | Hugging Face blog | 📣 Vendor claim, "up to". |
| MRL: **14x** smaller embeddings / **14x** speedups | MRL paper abstract (ImageNet-1K) | Paper's own claim. Note it's **vision (ImageNet)**, not text — don't transplant to text retrieval. Also verified **HF measured 93.1% retention at 12x compression for OpenAI text-embedding-3-large**, a more modest figure. |
| Qdrant: quantization "cuts RAM usage by **up to 97%**" | Qdrant README | 📣 Vendor claim, "up to", exact configuration unspecified. |
| OpenAI: text-embedding-3-large shortened to **256** dims still beats ada-002 (1536) | OpenAI docs | Vendor claim but specific, hedged, and reproducible on MTEB. |
| GPTQ: **3.25x/4.5x** end-to-end speedup; 175B in ~4 GPU hours | GPTQ abstract | Peer-reviewed (ICLR 2023) but still the authors' own benchmark. |
| AWQ: **>3x** speedup vs HF FP16 | AWQ abstract | Best Paper, MLSys 2024; authors' own benchmark. |
| vLLM/FAISS/BGE/MTEB figures | respective papers/repos | Peer-reviewed or official; still author-reported. |

## NOTES ON METHOD / LIMITATIONS

- **arXiv abstract pages were reliable** and gave definitive title/author/date/venue/comment metadata.
- **GitHub HTML pages truncate the README**; fetching `raw.githubusercontent.com/.../README.md` and `.../LICENSE` gave complete, clean text. Prefer raw URLs.
- **IEEE Xplore, ACM DL, and some publisher DOIs blocked automated fetches** (HTTP 403/202 with empty or Cloudflare bodies). I verified the PQ paper via the **Crossref API** and **Semantic Scholar API** instead — both returned full bibliographic metadata including the DOI, volume, issue, and page range.
- **Several official documentation sites are JS-rendered** and returned only navigation chrome: `opensource.org/ai/*` (OSAID body), `huggingface.co/spaces/mteb/leaderboard` (rankings), `docs.cohere.com` (Rerank details), `docs.pinecone.io` (overview body). Their **existence and URLs are verified**; their detailed content is not.
- **`developers.openai.com` serves clean Markdown** by appending `.md` to a docs URL (e.g. `.../guides/embeddings.md`, `.../docs/models.md`). This was the most productive source for OpenAI facts; the legacy `platform.openai.com/docs/...` URL now redirects cross-origin to `developers.openai.com`.
