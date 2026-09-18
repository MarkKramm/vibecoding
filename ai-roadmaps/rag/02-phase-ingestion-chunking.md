---
id: rag-02-ingestion-chunking
track: rag
phase: 2
order: 20
title: Ingestion and Chunking
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal]
deliverable: portfolio/rag/02-ingestion-chunking.md
exit_criteria: >
  You can take a real document, produce retrievable chunks you can justify,
  and explain why your chunk size is what it is rather than quoting a number
  you read somewhere.
---

# Phase 2 — Ingestion and Chunking

## Goal of this phase

Turn documents into units that can be retrieved well. By the end you will be able to parse a real document into clean text, split it into chunks with a defensible size and overlap, attach the metadata that makes filtering work, and measure whether your choices are actually good.

The reason this phase comes before embeddings is that **chunking decisions bound what retrieval can possibly achieve.** If the answer to a question is split across two chunks, no embedding model will retrieve it well, because neither chunk contains the answer. You cannot fix a chunking problem with a better vector search.

## Estimated time

**2 weeks** at 1–2 hours a day, 5 days.

The first week is parsing and splitting, which is mostly mechanical. The second is measurement, which is where the learning is — and it is slower than people expect, because building even a small retrieval evaluation takes an afternoon.

## Skills you'll gain

- Parse a real document into clean text and spot the garbage that parsers leave behind
- Choose a chunking strategy for a document shape and justify it
- Measure retrieval quality rather than guessing at a chunk size
- Attach metadata that makes filtering and access control possible later
- Explain why chunking constrains what retrieval can ever achieve
- Diagnose a chunk boundary that has split an answer in half

## Specific topics to learn

### Ingestion

- Parsing PDFs, HTML, Markdown, and structured formats
- Why PDF is the worst common format and what it does to your text
- Cleaning: headers, footers, page numbers, footnotes, hyphenation
- Verifying parsed text by eye before building anything

### Chunking strategies

- Fixed-size with overlap
- Recursive splitting on structure
- Semantic chunking
- Sentence-window and parent-document
- Structure-aware splitting

### Chunk size and overlap

- The precision/context tradeoff
- Why there is no universal correct size
- How to measure instead of guessing

### Metadata and contextual retrieval

- What to attach and why
- The chunk that cannot be found because it lacks its context
- Prepending chunk context before embedding

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| PyMuPDF / pdfplumber | Extract text from PDFs with layout awareness | Free/open-source | https://github.com/jsvine/pdfplumber | Parse a real PDF and read the output carefully | `pdftotext` from poppler |
| BeautifulSoup | Extract readable text from HTML | Free/open-source | https://www.crummy.com/software/BeautifulSoup/ | Strip navigation and boilerplate from a web page | Python's `html.parser` |
| LangChain text splitters | Recursive and structure-aware chunking | Free/open-source | https://python.langchain.com/docs/concepts/text_splitters/ | Split a document recursively and inspect the boundaries | Write the splitter yourself in 40 lines |
| tiktoken | Count tokens per chunk | Free/open-source | https://github.com/openai/tiktoken | Verify your chunks are the size you think they are | Provider token-count endpoints |
| Ollama | Generate chunk context locally at no cost | Free/open-source | https://ollama.com/ | Prepend a generated summary to each chunk | Any free model tier |
| SQLite + FTS5 | Store chunks with full-text search for the lexical half | Free/open-source | https://sqlite.org/fts5.html | Index your chunks for BM25 alongside embeddings | A plain inverted index in Python |

## Free/cheap resources

- **Anthropic — Contextual Retrieval** — https://www.anthropic.com/news/contextual-retrieval
- **LangChain — Text splitters** — https://python.langchain.com/docs/concepts/text_splitters/
- **Pinecone — Chunking strategies** — https://www.pinecone.io/learn/chunking-strategies/
- **pdfplumber documentation** — https://github.com/jsvine/pdfplumber
- **SQLite FTS5** — https://sqlite.org/fts5.html
- **Unstructured.io open-source library** — https://github.com/Unstructured-IO/unstructured

## Lesson: The Boundary Decides What Is Findable

### Part 1 — Garbage in, garbage retrieved

Start with the least interesting part, because it is the most common cause of bad retrieval and it is invisible once it happens.

**Your retriever can only return what you put in the index.** If the ingestion step produced mangled text, then every later stage is working with corrupted input, and no amount of tuning fixes it. The failure is silent: chunks exist, they have embeddings, retrieval returns results — the results are just built on text that does not mean what the document says.

#### Why PDF is the worst common format

A PDF is not a document format. It is a **page description language** — a set of instructions for placing glyphs at coordinates on a page. The words are in there, but so is everything else, and the structure a human sees is a rendering artifact rather than stored data.

The specific ways this hurts:

**Multi-column layouts.** A two-column paper extracts as interleaved lines, so sentence one of the left column is followed by sentence one of the right. The text is all present and the meaning is destroyed. This is the single most damaging parse failure and it affects most academic papers.

**Repeated headers and footers.** A journal name, page number, and running title appear on every page. Extracted naively, they become the most frequent text in the document, which means they contaminate every chunk and pollute lexical search with terms that appear everywhere and mean nothing.

**Tables.** A table's cell relationships exist visually, not textually. Extraction commonly produces a column of labels followed by a column of values, detached from each other, so a figure loses the row it belonged to.

**Footnotes and references.** Text that was marginal becomes inline, often mid-sentence, breaking the surrounding prose.

**Hyphenation across line breaks.** "retriev-\nal" becomes "retriev- al" or "retrieval" depending on the parser, and the wrong choice corrupts a searchable term.

```text
What the page shows:        What a naive extractor gives:

  Retrieval works by        Retrieval works by comparing
  comparing vectors.        vectors. Indexing is cheap.
  Indexing is cheap.        Comparing vectors is the
  Comparing vectors is      expensive part.
  the expensive part.
```

Every word is correct and the meaning is scrambled. **No embedding model recovers from this**, because the chunk's text genuinely does not contain the claim in a coherent form.

#### The one habit that prevents this

Before you build anything downstream, **print your parsed text and read it.** Not the first hundred characters — a full page, chosen at random, read as a human would.

```python
text = parse(pdf_path)
print(text[5000:9000])   # read this properly, do not skim
```

This takes two minutes and it catches the majority of ingestion problems before they become retrieval problems that are ten times harder to diagnose. Every experienced practitioner has a version of this habit, and it exists because the alternative is debugging a sophisticated pipeline whose input was never valid.

> Think of it as the retrieval equivalent of checking whether the microphone is plugged in. It is unglamorous, it is the first thing to check, and skipping it costs hours.

#### Cleaning checklist

| Problem | Detection | Fix |
|---|---|---|
| Repeated headers/footers | Same line on most pages | Strip lines appearing above a frequency threshold |
| Page numbers | Bare integers in consistent positions | Remove by pattern |
| Hyphenated line breaks | `\w+-\n\w+` | Join, removing the hyphen |
| Multi-column interleave | Sentences that do not follow | Layout-aware parser, or split by column detection |
| Broken tables | Labels and values separated | Layout-aware extraction, or convert tables to sentences |
| Footnotes inline | Superscript-like digits mid-text | Strip by pattern, or drop the footnote block |

---

### Part 2 — Chunking, and why it bounds everything

Now the central idea of the phase.

A retrieval system matches a query against **chunks**. It cannot match against a sentence that does not exist as a chunk, and it cannot match against a whole document if that document is not stored as a unit. So the chunk is the atomic unit of retrieval, and **what you make findable is decided entirely at chunking time.**

Consider a concrete failure. Your document says:

> The deployment window is Tuesday 02:00–04:00 UTC. During this period the API returns 503 for all write operations.

If you chunk as:

```text
Chunk 12: "...The deployment window is Tuesday 02:00-04:00 UTC."
Chunk 13: "During this period the API returns 503 for all write operations..."
```

then the query "what happens to the API during the deployment window?" must match chunk 13, which never says "deployment" or "window". Chunk 12 has the term but not the consequence. **The answer exists in the document and does not exist in any chunk.**

This is the characteristic chunking failure: not that text is lost, but that **meaning is split across a boundary.** And it is invisible, because both chunks are perfectly good chunks — they are just individually incomplete.

#### The strategies, and what each is for

**Fixed-size with overlap.** Every N tokens, with the last M tokens of one chunk repeated at the start of the next.

- *Why it works:* trivial to implement and completely predictable.
- *What it breaks:* cuts mid-sentence and mid-idea. The overlap mitigates boundary loss but does not eliminate it, and overlap costs storage and can cause the same content to be retrieved twice.
- *Use when:* your text has no reliable structure to split on, or you are prototyping.

**Recursive splitting.** Try the largest natural boundary first — section headings — and fall back to paragraph breaks, then sentence breaks, then characters, until chunks fit the target size.

```text
try: split on "\n## "     (sections)
if too big: split on "\n\n"  (paragraphs)
if too big: split on ". "     (sentences)
if too big: split on characters
```

- *Why it works:* respects the author's own boundaries, which are where the meaning changes.
- *What it breaks:* a single long paragraph still gets cut arbitrarily, and structure varies by document.
- *Use when:* **by default.** This is the best general-purpose choice and the right first thing to try.

**Semantic chunking.** Embed each sentence, measure similarity between adjacent sentences, and split where similarity drops — on the theory that a topic shift shows up as a similarity drop.

- *Why it appeals:* it sounds like it splits at exactly the right place.
- *What it breaks:* it is slower, more complex, and the reported gains are **inconsistent**. Similarity between adjacent sentences is a noisy proxy for topic change, and the method can split in the middle of a coherent argument or fail to split where the topic genuinely shifts.
- *Use when:* you have measured a gain. Not before.

**Sentence-window.** Embed individual sentences, but when a sentence is retrieved, pass the surrounding N sentences to the model.

- *Why it works:* the sentence is a sharp matching unit, and the window supplies the context the sentence lacks. This directly attacks the boundary problem.
- *What it breaks:* more storage, more index entries, and a window size to tune. Retrieval returns a lot of overlapping text.
- *Use when:* precision matters and you can afford the storage.

**Parent-document.** Embed small chunks for matching, but retrieve and pass the *larger* parent unit for generation.

- *Why it works:* small units match well, large units read well. It gets both properties, which is the appeal.
- *What it breaks:* the parent may exceed your budget, so you may retrieve a lot of irrelevant text along with the relevant sentence.
- *Use when:* you have a clean hierarchy (document → section → paragraph).

**Structure-aware.** Split using the document's own structure: Markdown headings, HTML sections, or code function boundaries.

- *Why it works:* the boundaries are semantically meaningful by construction.
- *What it breaks:* needs format-specific parsing, and not every document has structure.
- *Use when:* your corpus is consistently structured — which is a real advantage worth engineering for.

#### The practical default

```text
recursive split on headings, then paragraphs, then sentences
target 300-800 tokens
overlap ~15%
+ rich metadata
+ contextual retrieval (Part 4) before exotic chunkers
```

The order matters here. **Add contextual retrieval before adding a clever chunker**, because contextual retrieval attacks the boundary problem directly and cheaply, while semantic chunking attacks it indirectly and expensively.

---

### Part 3 — Sizing, and why there is no correct number

This is the part where you will encounter more confident nonsense than anywhere else in the field.

**There is no universal correct chunk size.** Anyone giving you a fixed number — 512 tokens, 1000 characters — is repeating folklore. The tradeoff is real and it points in two directions at once:

**Small chunks.** The embedding represents one idea sharply, so matching is precise. But a chunk may lack the context to be *useful* for generation, and facts get split across boundaries.

**Large chunks.** Each chunk contains full context, so it reads well to the model. But the embedding averages several topics, so matching gets fuzzy, and you burn context budget on irrelevant text.

```text
small chunks                          large chunks
+ precise matching                    + context preserved
+ cheap per chunk                     + fewer boundary splits
- context may be missing              - embedding blurs topics
- facts split across boundaries       - wastes context budget
```

#### Why the number depends on your corpus

Three properties move the right answer, and none of them is universal:

**Document structure.** A FAQ with short independent entries wants small chunks — each question is self-contained. A legal contract with long interdependent clauses wants bigger ones, because a clause means little without its context.

**Query type.** "What is the refund window?" wants a small, precise chunk. "Summarise the warranty terms" wants a large one.

**Embedding model.** Different models are trained on different input lengths. A model trained on short passages degrades on long ones, and vice versa. Your chunk size must respect the model's actual behaviour, not its advertised maximum.

#### How to actually decide

Do not pick a size. **Measure one.**

1. Write **20 questions** whose answers you know, and for each, note which passage contains the answer.
2. Index at a candidate size — say 256, 512, and 1024 tokens.
3. For each size, measure **Recall@k**: of your 20 questions, how many had the answer-containing passage in the top *k* retrieved chunks?
4. Pick the size with the best recall, then check that the retrieved chunks actually answer the question when passed to the model.

Twenty questions is enough to see a clear difference and small enough to write in an afternoon. This is the whole method, and it beats every heuristic in every blog post, because it measures **your** corpus against **your** queries.

```python
# The entire retrieval evaluation, in outline
for size in [256, 512, 1024]:
    index = build_index(docs, chunk_size=size)
    hits = 0
    for q in questions:
        retrieved = index.search(q.text, k=5)
        if q.answer_passage_id in {c.passage_id for c in retrieved}:
            hits += 1
    print(f"size={size}  recall@5={hits}/{len(questions)}")
```

Notice what this costs: no API calls at all if your embeddings run locally. **The measurement is free**, which removes the last excuse for guessing.

> **The number you should be suspicious of is the one you did not measure.** "512 tokens with 10% overlap" is not knowledge; it is a starting point someone else found adequate for a corpus you have never seen.

#### Overlap, and when it stops helping

Overlap exists to prevent a fact spanning a boundary from becoming unfindable in both chunks. That is a real problem and overlap genuinely mitigates it.

But overlap has costs that are easy to miss:

- **Duplicated storage**, in proportion to the overlap.
- **Duplicate retrieval** — the same content can appear in two retrieved chunks, wasting your context budget on repetition.
- **Distorted matching** — with heavy overlap, a single passage's text dominates many chunks, so it gets retrieved repeatedly and crowds out other relevant material.

A moderate overlap in the region of 10–20% is a reasonable default. Beyond that, you are usually paying storage and dilution to protect against a boundary problem that **contextual retrieval solves better** (Part 4), and that a slightly larger chunk solves more cheaply.

---

### Part 4 — Contextual retrieval: fixing the unfindable chunk

Here is the idea that addresses the boundary problem directly, and it is the highest-value technique in this phase.

**The problem, stated exactly.** A chunk often cannot be matched by a query that it fully answers, because the chunk does not contain the words the query uses. The canonical example, from Anthropic's Contextual Retrieval post:

> A chunk reading *"The company's revenue grew by 3% over the previous quarter"* is essentially unfindable for the question *"What was ACME's revenue growth in Q2 2023?"*

The chunk answers the question. It shares almost no vocabulary with it. It does not name ACME, and it does not say Q2 2023, because those were established earlier in the document and the chunk inherited them by position.

This is not an edge case. It is the normal condition of any document where context accumulates — which is most documents.

#### The fix

Before embedding a chunk, **use a model to generate a short context that situates the chunk in its document**, and prepend it:

```text
Original chunk:
  "The company's revenue grew by 3% over the previous quarter."

Contextualised chunk:
  "This chunk is from an SEC filing on ACME corp's performance in
   Q2 2023; the previous quarter's revenue was $314 million. The
   company's revenue grew by 3% over the previous quarter."
```

Now the chunk contains "ACME", "Q2 2023", and "revenue" — the query's actual terms — while its meaning is unchanged. The added text is 50–100 tokens of pure retrieval signal.

Anthropic's reported results, on their own experimental setup with 800-token chunks and 8k-token documents:

| Configuration | Retrieval failure rate | Reduction |
|---|---|---|
| Baseline (embeddings only) | 5.7% | — |
| Contextual embeddings | 3.7% | 35% |
| + contextual BM25 | 2.9% | 49% |
| + reranking | 1.9% | 67% |

**Read those as what they are:** vendor-published results on a specific experimental configuration, not an independent benchmark. The direction is well-motivated and the technique is sound; the exact percentages will differ on your corpus.

#### Why it is affordable

Generating a context for every chunk sounds expensive — it is a model call per chunk, and a corpus has many chunks.

The trick is **prompt caching**, and it is the reason this technique is practical rather than theoretical. You put the *whole document* in the prompt once, cache it, and then ask for a context for each chunk in turn. The document is processed once and reused across all its chunks, so the marginal cost is the output tokens for each short context.

Anthropic quotes the resulting one-time preprocessing cost at roughly **$1.02 per million document tokens** with caching — a figure that will have moved, and one you should measure for yourself, but which illustrates that the technique is affordable rather than prohibitive.

```text
Without caching:  (document + chunk) per chunk  -> document cost x chunk count
With caching:     document once, chunk per call -> document cost + small per chunk
```

This is the Cost track's caching material paying off directly. **The cost of a technique is often determined by whether you structured the prompt to be cacheable**, and here that structure is the difference between affordable and not.

#### The free version

You do not need a paid API. A small local model through Ollama generates chunk contexts at zero marginal cost — just your own compute time. On a corpus of a few thousand chunks this is an overnight job on a laptop, and it is a genuinely good use of idle time.

#### What to put in the context

The document title and section path, the entities the chunk refers to, the time period, and any abbreviation the chunk relies on. Keep it short — 50–100 tokens. Longer contexts add cost and dilute rather than sharpen.

A useful test: **could this chunk be found by a question it answers?** If not, the context is doing its job; if yes, you can trim it.

---

### Part 5 — Metadata, and the one requirement that is not optional

Every chunk should carry metadata, attached at ingestion time. Retrofitting metadata means re-ingesting the whole corpus, so decide the schema before you build the index.

**What to attach:**

| Field | Why |
|---|---|
| `source_id` / document id | Attribution, and deleting a document's chunks |
| `source_path` | Human-readable citation |
| `section_path` | Heading breadcrumb — useful in the prompt and for filtering |
| `chunk_index` | Reconstructing order, and fetching neighbours |
| `token_count` | Budget arithmetic at retrieval time |
| `created_at` / `modified_at` | Recency filtering, and staleness detection |
| `content_hash` | Deduplicating at ingest |
| `language` | Filtering, and tokenizer cost estimation |
| `access_scope` | **Access control — see below** |

#### Access control is a security requirement, not an optimisation

This is the one item in this phase that is not about retrieval quality, and it is the most important to get right.

**If different users may see different documents, enforce that with metadata filters in the retrieval layer. Never rely on the prompt to avoid revealing restricted content.**

The reasoning is direct. Once a chunk is in the prompt, the model has it, and instructions not to mention it are a request rather than a control — and Foundations Phase 1 established that instructions are text which makes a continuation more likely, not a command with authority. A prompt injection in another retrieved document can ask for the restricted chunk. Your defence cannot live in the same place as the attack.

```python
# Correct: the filter is applied before the model ever sees anything
results = index.search(
    query_vector,
    k=10,
    filter={"access_scope": {"$in": user.allowed_scopes}},
)

# Wrong: retrieve everything, then ask the model not to mention what it should not
results = index.search(query_vector, k=10)
prompt = f"Context: {results}\nDo not reveal anything the user shouldn't see."
```

The second version is a data breach with a polite request attached.

#### Pre-filtering versus post-filtering

Vector databases differ in when the filter is applied:

- **Pre-filter:** restrict the candidate set first, then search within it. Correct results, but can be slow if the filter is very selective, because the index may need to scan more to find *k* matches.
- **Post-filter:** search first, then drop results failing the filter. Fast, but you may end up with fewer than *k* results — or, worse, with the relevant documents already excluded from the candidate set, so you get *k* results that are all irrelevant.

**Pre-filtering is usually what you want**, especially for access control where post-filtering can leak which documents exist by their absence. Check your database's actual behaviour rather than assuming; the option names and defaults vary.

---

## Hands-on practice tasks

1. Parse a real PDF you actually use and read a full page of the extracted text as a human. Write down every artifact you find. <!-- id: rag-02-t01 band: focused energy: normal -->
2. Check the same PDF for repeated headers or footers and strip them by frequency threshold. Verify the result on a second page. <!-- id: rag-02-t02 band: focused energy: normal -->
3. Chunk a document recursively at three different sizes and print the boundaries for one section. Look for a boundary that splits a meaningful statement. <!-- id: rag-02-t03 band: focused energy: normal -->
4. Write 20 questions with known answer passages from your document, then measure Recall@5 at three chunk sizes and report which wins. <!-- id: rag-02-t04 band: deep energy: high -->
5. Find a chunk in your corpus that answers a question but shares almost no vocabulary with it. Write the query and the chunk side by side. <!-- id: rag-02-t05 band: focused energy: normal -->
6. Generate a 50–100 token context for ten chunks using a local model, prepend it, and check whether each is now findable by a question it answers. <!-- id: rag-02-t06 band: deep energy: normal -->
7. Design your metadata schema on paper, including the access-control field, and state what query each field enables. <!-- id: rag-02-t07 band: quick energy: normal -->
8. Take one chunk and try to retrieve it with three differently-worded queries. Record which succeed and explain the failures. <!-- id: rag-02-t08 band: quick energy: low -->

## Common Pitfalls

**Never reading the parsed text.** The single most common cause of bad retrieval, and the cheapest to prevent. Two minutes of reading catches what an hour of pipeline debugging will not.

**Choosing a chunk size because a blog post said so.** The number depends on your structure, your query types, and your embedding model. Measure it; the measurement costs nothing if embeddings run locally.

**Semantic chunking before contextual retrieval.** Semantic chunking is slower, more complex, and inconsistently better. Contextual retrieval attacks the same boundary problem directly and cheaply. Do the cheap thing first.

**Heavy overlap as a substitute for good boundaries.** Above 20% or so you are paying storage and retrieval dilution to paper over a problem a larger chunk or a prepended context solves better.

**Attaching no metadata.** Retrofitting means re-ingesting everything. Decide the schema before the index exists, and include the access-control field from the start.

**Enforcing access control in the prompt.** Once the text is in the context, a polite instruction is not a control. Filter in the retrieval layer, before the model sees anything.

**Assuming a parse failure will announce itself.** It will not. Chunks will exist and retrieval will return results — just results built on scrambled text. Check by reading.

## Deliverable / proof of work

Write `portfolio/rag/02-ingestion-chunking.md` containing:

- **A parse-quality report** — the artifacts you found in a real document, with before/after samples showing what you cleaned
- **The chunking comparison** — boundaries at three sizes for one section, and the specific boundary that splits a meaningful statement
- **A retrieval measurement** — 20 questions with answer passages, Recall@5 at three chunk sizes, and the size you chose with the measured reason
- **Ten contextualised chunks** — showing the original, the generated context, and the query each is now findable by
- **Your metadata schema** — every field, what it enables, and which one enforces access control

## Checklist

- [ ] I have read a full page of my own parsed text and found artifacts in it <!-- id: rag-02-c01 energy: low -->
- [ ] I can name three ways PDF parsing corrupts text and detect each <!-- id: rag-02-c02 energy: normal -->
- [ ] I can explain why chunking bounds what retrieval can achieve <!-- id: rag-02-c03 energy: normal -->
- [ ] I can name the five chunking strategies and what each is for <!-- id: rag-02-c04 energy: normal -->
- [ ] I measured Recall@k at three chunk sizes rather than choosing a number <!-- id: rag-02-c05 energy: high -->
- [ ] I can explain the small-versus-large chunk tradeoff in both directions <!-- id: rag-02-c06 energy: normal -->
- [ ] I can identify a chunk that answers a question but cannot be matched by it <!-- id: rag-02-c07 energy: normal -->
- [ ] I can explain contextual retrieval and why prompt caching makes it affordable <!-- id: rag-02-c08 energy: high -->
- [ ] I know why access control must be a retrieval filter and not a prompt instruction <!-- id: rag-02-c09 energy: high -->
- [ ] I can distinguish pre-filtering from post-filtering and say why pre-filtering is usually right <!-- id: rag-02-c10 energy: normal -->
- [ ] My metadata schema includes source, section path, token count, timestamps and access scope <!-- id: rag-02-c11 energy: low -->
- [ ] I know why semantic chunking is not the default despite sounding better <!-- id: rag-02-c12 energy: normal -->

## Quiz

### Q1. A two-column research paper extracts with the left column's first sentence followed by the right column's first sentence. Why is this fatal for retrieval? <!-- id: rag-02-q01 energy: normal -->

- [ ] Because the token count becomes unpredictable
- [x] Every word is present but the meaning is scrambled, so chunks do not mean what the document says and no embedding model can recover the original claims
- [ ] Because duplicated text confuses the deduplication step
- [ ] Because it doubles the storage requirement

**Why:** Retrieval operates on chunk text, and if the text interleaves two columns the chunk no longer expresses a coherent claim. Embeddings represent meaning, and the meaning present is the scrambled one. The fix is layout-aware parsing, and the detection method is reading the output.

### Q2. Your document states the deployment window in one paragraph and the API behaviour during it in the next. Why might queries about API behaviour during deployment fail? <!-- id: rag-02-q02 energy: normal -->

- [ ] Because the embedding model is too small
- [ ] Because the second paragraph has fewer tokens
- [x] Because the two facts landed in different chunks, so neither chunk contains the whole answer and the one holding the consequence lacks the query's terms
- [ ] Because retrieval cannot handle time-based questions

**Why:** This is the characteristic boundary failure. Both chunks are individually reasonable; together they hold the answer; separately neither does. It is invisible because nothing is lost — the meaning is just divided. Overlap, larger chunks, or a prepended context each mitigate it.

### Q3. What is the most defensible way to choose a chunk size? <!-- id: rag-02-q03 energy: normal -->

- [ ] Use 512 tokens, the commonly recommended value
- [ ] Use the maximum input length of your embedding model
- [x] Measure Recall@k at several sizes against questions with known answer passages, and pick the best
- [ ] Match the average paragraph length in your corpus

**Why:** The right size depends on your document structure, your query types, and your embedding model's training, so no external number can be correct for your corpus. The measurement is cheap — free if embeddings run locally — which removes the reason to guess.

### Q4. What problem does contextual retrieval solve, and how? <!-- id: rag-02-q04 energy: high -->

- [ ] It reduces storage by compressing chunks
- [x] It prepends a short generated context situating each chunk in its document, so a chunk becomes findable by queries whose terms it did not previously contain
- [ ] It rewrites queries to match document vocabulary
- [ ] It removes duplicate chunks before indexing

**Why:** A chunk that says "revenue grew 3%" cannot be found by "ACME Q2 2023 revenue growth" because it names neither ACME nor the quarter. Prepending that context adds the missing retrieval signal without changing the chunk's meaning. Prompt caching is what makes the preprocessing affordable.

### Q5. Why is semantic chunking NOT the recommended default? <!-- id: rag-02-q05 energy: normal -->

- [ ] Because it is impossible to implement
- [ ] Because it produces chunks that are always too large
- [x] Because similarity between adjacent sentences is a noisy proxy for topic change, so gains are inconsistent while cost and complexity are certain
- [ ] Because it requires a paid embedding API

**Why:** The intuition is appealing and the measurement does not reliably support it. Adjacent-sentence similarity drops for reasons unrelated to topic — a short sentence, a list item, a quotation — so the method splits in the wrong places and misses real shifts. Recursive splitting plus contextual retrieval is the better use of the same effort.

### Q6. Your system has documents that some users may not see. Where must the access check happen? <!-- id: rag-02-q06 energy: high -->

- [ ] In the system prompt, instructing the model not to reveal restricted content
- [x] In the retrieval filter, so restricted chunks never enter the prompt at all
- [ ] In a post-processing step that redacts the final answer
- [ ] In the client, by hiding the sources list from unauthorised users

**Why:** Once a chunk is in the context the model has it, and an instruction is a request rather than a control — vulnerable to an injection in another retrieved document. Filtering before the model sees anything keeps the defence outside the reach of the text it is defending against.

### Q7. What does heavy chunk overlap cost you? <!-- id: rag-02-q07 energy: normal -->

- [ ] Nothing measurable, which is why more overlap is safer
- [ ] Only storage, which is cheap
- [x] Duplicated storage and retrieval, plus distortion where one passage's text dominates many chunks and crowds out other relevant material
- [ ] Only a slightly larger index

**Why:** Overlap reduces boundary loss but inflates the index in proportion, causes the same content to be retrieved more than once, and can make a single passage dominate results. Beyond roughly 10-20% you are usually paying this to address a problem contextual retrieval handles better.

### Q8. You index a corpus of legal contracts where clauses depend heavily on earlier definitions. What chunking approach fits best? <!-- id: rag-02-q08 energy: high -->

- [ ] Small fixed-size chunks, for precise matching
- [x] Structure-aware chunks following clause boundaries, with contextual retrieval to supply the definitions each clause relies on
- [ ] Semantic chunking on similarity drops
- [ ] One chunk per document, for full context

**Why:** The document's own structure is meaningful, so splitting on it preserves clause integrity. But a clause still depends on definitions established earlier, which is exactly what a prepended context supplies. One chunk per document destroys matching precision and overflows the budget; small fixed chunks cut clauses mid-definition.

## You're ready to move on when...

You can take a document you have never processed, produce clean text you have verified by reading, split it into chunks whose boundaries you can defend, and state your chunk size as a measured result rather than a number you were told. You have run a retrieval measurement on your own corpus and can say which size won and by how much.

And you can explain why a chunk that answers a question might be unmatchable by it — and what you do about that.

## Free vs Paid

### What's free is enough

Ingestion and chunking are entirely free. `pdfplumber`, BeautifulSoup, LangChain's splitters, and tiktoken are all open source. SQLite with FTS5 gives you the lexical half of hybrid search at no cost. Ollama generates contextual-retrieval context locally, which turns a paid preprocessing step into an overnight local job.

The measurement is free too, and this matters: with local embeddings, evaluating three chunk sizes costs nothing but time, which means the recommendation to measure rather than guess has no financial barrier behind it. **That is the whole reason the phase insists on measuring.**

### What a paid tier adds

A paid API makes contextual retrieval faster to process over a large corpus, since the cached-document trick depends on prompt caching being available. A paid vector database adds managed infrastructure — replication, monitoring, larger indexes — none of which matters for a personal corpus.

Layout-aware commercial PDF parsers exist and are better than the open-source options on genuinely difficult documents: dense tables, scanned pages requiring OCR, complex multi-column layouts with figures. If your corpus is like that, a paid parser may be the difference between usable and unusable text.

### When it's worth paying

For the parser, when your documents are hard enough that the free tools produce text you cannot use, and you have verified that by reading the output. That is a real and common situation with scanned or heavily formatted PDFs.

For contextual retrieval at scale, only if your corpus is large enough that local processing time becomes the bottleneck rather than the cost — which for a personal corpus it rarely is. A few thousand chunks overnight on a laptop is a good trade, and it costs nothing.
