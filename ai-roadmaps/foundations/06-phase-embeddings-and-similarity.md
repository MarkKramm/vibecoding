---
id: found-06-embeddings-and-similarity
track: foundations
phase: 6
order: 60
title: Embeddings and Similarity
duration: 1 week
duration_weeks: 1
energy_mix: "25% reading, 45% hands-on vector work, 20% writing, 10% review"
deliverable: portfolio/foundations/06-embeddings-and-similarity.md
exit_criteria: >
  You can explain what an embedding is and why similar meanings land near each
  other. You can compute cosine similarity by hand on small vectors and explain
  when cosine, dot product and Euclidean distance give different answers. You can
  explain the difference between token embeddings and sentence embeddings and why
  swapping one for the other breaks things. You can run a tiny semantic search
  over your own text, show it succeeding where keyword search fails, and show it
  failing where keyword search succeeds. You can name three things embeddings do
  not capture.
---

# Phase 6 — Embeddings and Similarity

## Goal of this phase

Understand the single mechanism that makes retrieval, semantic search, clustering, recommendation and deduplication work: turning text into a list of numbers positioned in a high-dimensional space, so that distance in that space means something like distance in meaning.

By the end you will be able to build a working semantic search over your own notes with free tools, explain exactly why it works, and — more importantly — explain exactly where it stops working. That last part is what separates someone who has read about embeddings from someone who can decide whether to use them.

## Estimated time

**1 week** at 1–2 hours a day, 5 days. Roughly:

- 2.5 hours reading the lesson
- 4 hours on the hands-on tasks (most of it on task t03, the search engine you build)
- 1.5 hours writing the deliverable
- 1 hour on the quiz and review

The maths in Part 4 looks intimidating and is not. It is multiplication, addition, and one square root. If you can compute an average, you can compute a cosine similarity.

## Skills you'll gain

- Explain what an embedding is without saying "it's like a fingerprint" and stopping there
- Compute cosine similarity, dot product and Euclidean distance by hand on 2D and 3D vectors
- Say which of the three to use, and why the answer depends on whether vectors are normalised
- Explain why embedding models are separate from generation models, and why they are orders of magnitude cheaper
- Distinguish token embeddings from sentence/document embeddings and predict what breaks if you confuse them
- Build a semantic search index over your own text using only free tools
- Predict when semantic search will beat keyword search and when it will lose to it
- Name the specific failure modes: negation, opposites, rare identifiers, numbers, and staleness

## Specific topics to learn

### The mechanism

- What a vector is, and what a dimension is in this context
- Why models learn to place similar meanings near each other, as a side effect of prediction
- Embedding dimensionality: what 384, 768, 1536 or 3072 actually buys you
- Normalisation: what it means for a vector to have length 1, and why everyone does it

### The three similarity measures

- Dot product, cosine similarity, Euclidean distance
- The relationship between them, and the exact condition under which they agree
- When each one is the right choice

### Vocabulary that is not interchangeable

- Token embeddings: one vector per token, inside a model
- Sentence/document embeddings: one vector per passage, produced by a different model
- Why pooling exists, and what mean pooling destroys
- Why generation-model embeddings and dedicated embedding models are different tools

### Search

- Keyword search: exact matching, inverted indexes, and why it fails on paraphrase
- Semantic search: nearest-neighbour lookup, and why it fails on exact identifiers
- Similarity as a ranking score, not a truth score
- The limits: negation, opposites, numbers, named entities, frozen cutoffs

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Python 3 | All the numeric work and the search engine | Free | https://www.python.org/downloads/ | Every task | Any Python from your OS package manager |
| NumPy | Vector maths without writing loops | Free | https://numpy.org/install/ | Task t02 and t03 | Pure Python lists and `math.sqrt` |
| `sentence-transformers` | Run a real sentence embedding model on CPU | Free | https://sbert.net/ | Task t03 and t05 | The free embedding endpoint from Google AI Studio, or a Hugging Face Inference call |
| Hugging Face model hub | Find and read embedding model cards | Free to browse | https://huggingface.co/models | Task t05 | Any published model report |
| scikit-learn | Cosine similarity helper and a clustering baseline | Free | https://scikit-learn.org/stable/install.html | Task t04 and t06 | NumPy, twenty lines of your own code |
| Google AI Studio | Free API access to an embedding endpoint | Free tier | https://aistudio.google.com/ | Task t03 alternative path | Local `sentence-transformers`, which needs no account at all |
| Jupyter or VS Code | Interactive scratchpad | Free | https://jupyter.org/install | Task t01 and t02 | Any text editor plus `python file.py` |
| Google Colab | Free notebook if your laptop is slow | Freemium | https://colab.research.google.com/ | Optional for task t03 | Your own machine; embedding a few hundred sentences on CPU takes seconds |

## Free/cheap resources

- **Sentence-Transformers documentation** — https://sbert.net/
- **Sentence-Transformers pretrained models list** — https://sbert.net/docs/sentence_transformer/pretrained_models.html
- **Jay Alammar — The Illustrated Word2vec** — https://jalammar.github.io/illustrated-word2vec/
- **Hugging Face — NLP Course, Chapter on Word Embeddings** — https://huggingface.co/learn/nlp-course/chapter5/1
- **Hugging Face — MTEB leaderboard (embedding model rankings)** — https://huggingface.co/spaces/mteb/leaderboard
- **3Blue1Brown — But what is a neural network?** — https://www.youtube.com/watch?v=aircAruvnKk
- **scikit-learn — Cosine similarity reference** — https://scikit-learn.org/stable/modules/metrics.html
- **Google — Machine Learning Crash Course, Embeddings section** — https://developers.google.com/machine-learning/crash-course/embeddings

## Lesson: The Geometry of Meaning

### Part 1 — The problem embeddings solve

Here is a problem you can feel. You have 400 notes on your laptop. You remember writing something about why a particular database kept timing out under load, and you want it back. You type "database slow" into your file search. You get nothing, because the note says "Postgres latency spiked once the connection pool was exhausted."

Zero words in common. Exact-match search is blind here, and no amount of keyword cleverness fixes it, because the two phrases share no string. A synonym list helps for "slow" and "latency" and dies immediately on "connection pool was exhausted."

Now flip the problem. You search for `ERR_4471`. Keyword search finds it instantly, in one note, with certainty. Semantic search — the kind that understands that "database slow" and "Postgres latency" are about the same thing — will happily return you twelve notes about databases and maybe miss the one with the error code, because `ERR_4471` is a meaningless string and the model has no idea it matters.

Those two failures are the entire story of this phase. Neither method wins; they fail in different directions. That is why Track 4 teaches hybrid retrieval: you cannot reason about it until you understand that these are two mechanisms with two failure modes.

To handle paraphrase, you need a representation where "database slow" and "Postgres latency" are *near each other* despite sharing no characters. That representation is an embedding.

**An embedding is a list of numbers that positions a piece of text as a point in a high-dimensional space, arranged so that distance in that space reflects similarity in meaning.**

A list of 2 numbers is a point on a flat sheet; 3 numbers is a point in the room you are sitting in; 768 numbers is a point in a space with 768 independent axes. You cannot picture that, and you should stop trying — the picture adds nothing after three axes. What matters is that directions in that space encode distinctions that often have no name. Nobody assigns those axes. They emerge.

### Part 2 — Why similar meanings end up near each other

This is the part most explanations skip, and it makes the rest predictable.

Embeddings are not designed as an end in themselves. They are a by-product of the same training objective from Phase 2: predict what comes next.

Suppose the model keeps seeing these fragments in training text:

```text
...the connection pool was exhausted, so the database became
...the connection pool was exhausted and the database got
...the connection pool was exhausted; the database turned
...the connection pool was exhausted, which made the database
```text

To predict what follows, the model does not need to know that "slow", "sluggish" and "latency spiked" are synonyms. It only needs a representation in which they are *interchangeable in the same slot*. And here is the key move: if two phrases can substitute for each other in the same contexts, then any representation that maps them to the same point is a good one, because the model need not learn separate predictions for each.

So the training pressure is: **things that appear in similar contexts get pushed to similar vectors.** Meaning, for a language model, is operationalised as *distributional similarity* — you shall know a word by the company it keeps. This is why a model never told the definition of "sluggish" still knows it can stand where "slow" stands.

An analogy worth having and worth retiring:

> An embedding is like a city map where every neighbourhood is placed according to what it is *for*, not where it is. Restaurants cluster together, hospitals cluster together, and a new restaurant opens near the other restaurants.

That gets you the clustering intuition, then breaks. On a real map, distance is meaningful in kilometres — you can say two things are 3 km apart. In embedding space the axes have no units and there is no meaningful "how far is far"; only the *ranking* of distances is trustworthy. Worse, embedding space has no external layout at all: the coordinates are an artefact of a training run, and two models trained on similar data produce different coordinates for the same word. You cannot compare a vector from model A to one from model B. Ever. They are different coordinate systems.

That is not academic. It is the most common bug in beginner retrieval code: mixing vectors from two models in one index. The code runs. It returns results. They are garbage, and nothing raises an error.

**What this lets you predict:** if a distinction never mattered for prediction, the embedding will not represent it. A model trained mostly on English web text will have crisp vectors for "invoice" and "receipt" and vague ones for a niche term from your local dialect, because that term's contexts are few and inconsistent. And if two things are always discussed together but mean opposites — "hot" and "cold" appear in the same weather sentences constantly — their vectors may end up uncomfortably close.

**Where this stops working:** distributional similarity is not meaning in the sense you want. "Not good" and "good" share almost all their surrounding context, as do "the vaccine is safe" and "the vaccine is not safe". A model that learns from co-occurrence has no built-in representation of negation, and a sentence's embedding is often nearly unchanged by inserting "not". The embedding knows what a passage is *about*; it does not know what the passage *claims* about it. Hold onto this — it is the source of half the failures later.

### Part 3 — Dimensions and normalisation

**What dimensionality buys you.** A 384-dimensional model can represent hundreds of independent directions; a 1536-dimensional one can represent more, so it can afford a direction for "legal contract language" and another for "error message tone" without them colliding.

More is not automatically better, and the reason recurs constantly in cost work:

| Effect of more dimensions | Consequence |
|---|---|
| More room for fine distinctions | Better retrieval quality on hard, subtle queries |
| Bigger storage per vector | A 1536-dim float32 vector is 6 KB; a million of them is 6 GB |
| Slower comparison | Search cost scales linearly with dimension |
| Lower similarity scores for everything | Distances concentrate: in high dimensions, random vectors are almost all roughly equidistant |

That last row is counter-intuitive. In 2D, two random vectors can be nearly parallel or nearly perpendicular, and the range of similarities is wide. In 1536 dimensions, two random vectors are almost always close to perpendicular, and the scores of unrelated pairs crowd near zero. So a cosine of 0.72 does not mean "72% similar" and is not comparable across models. Treat similarity as a *ranking* signal only.

> Practical rule: never hard-code a similarity threshold from a tutorial. Measure the score distribution on your own data — what do obvious matches score? What do obvious non-matches score? Pick the threshold in the gap, and revisit it when you change models.

**Normalisation.** Two terms to use correctly:

- The **norm** (magnitude, length) of a vector is the square root of the sum of its squared components. In 2D it is Pythagoras: `(3, 4)` has norm 5.
- A **normalised** (unit) vector is one whose norm has been divided down to exactly 1.

Nearly every embedding model returns unit vectors already, or raw vectors plus an instruction to normalise. The reason: raw vectors carry two kinds of information — *direction* (what the text is about) and *magnitude* (a length artefact of the model's arithmetic). For comparing meaning you want direction only, and normalising throws magnitude away.

Once every vector has norm 1, two things follow, and they are worth proving to yourself rather than taking on faith:

- Dot product and cosine similarity become **identical**.
- Euclidean distance becomes a monotonic function of cosine similarity, so it produces the **same ranking**.

So in the common case — normalised vectors, ranking by similarity — the three measures agree and the choice does not matter for *ordering*. It matters when vectors are unnormalised (dot product then rewards magnitude, sometimes exactly what you want) or when you need an interpretable number.

### Part 4 — The three measures, and a worked example by hand

Take three tiny 2D vectors, which we will pretend are embeddings. Two dimensions is a stand-in for 768; the arithmetic is identical, only longer.

```text
a = (1, 0)     "about cats"
b = (0.8, 0.6) "about kittens"
c = (0, 1)     "about motorcycle repair"
```text

**Dot product.** Multiply matching components and add.

```text
a · b = (1 × 0.8) + (0 × 0.6) = 0.8
a · c = (1 × 0)   + (0 × 1)   = 0.0
b · c = (0.8 × 0) + (0.6 × 1) = 0.6
```text

Interpretation: the dot product is large and positive when two vectors point the same way, zero when perpendicular, negative when opposed. It is the same quantity Phase 4 used for attention scores, and for the same reason — it is a direction-agreement score.

**Norm.** Square each component, add, take the square root.

```text
|a| = sqrt(1² + 0²)       = sqrt(1.00) ≈ 1.000
|b| = sqrt(0.8² + 0.6²)   = sqrt(0.64 + 0.36) = sqrt(1.00) = 1.000
|c| = sqrt(0² + 1²)       = sqrt(1.00) = 1.000
```text

All three already have norm 1, which is typical of real embeddings.

**Cosine similarity.** The dot product divided by the product of the norms.

```text
cos(a, b) = (a · b) / (|a| × |b|) = 0.8 / (1.0 × 1.0) = 0.80
cos(a, c) = 0.0 / 1.0                                 = 0.00
cos(b, c) = 0.6 / 1.0                                 = 0.60
```text

Read those numbers as answers to the question "how much do these two point the same way?":

- cats vs kittens: **0.80** — closely related, as expected
- cats vs motorcycle repair: **0.00** — orthogonal, unrelated
- kittens vs motorcycle repair: **0.60** — which is *wrong*, and instructive

Why is `b` closer to `c` than to being unrelated? Because `b = (0.8, 0.6)` sits diagonally: 80% of the way toward the "cats" direction and 60% toward "motorcycle repair". In a real 768-dimensional space this leakage is spread across hundreds of axes and mostly averages out, which is why low-dimensional demos mislead and real embeddings work. It also shows the honest limit: similarity is a *projection*, and a vector blending two topics genuinely sits between them.

**Euclidean distance.** Straight-line distance between the points.

```text
d(a, b) = sqrt((1 − 0.8)² + (0 − 0.6)²) = sqrt(0.04 + 0.36) = sqrt(0.40) ≈ 0.632
d(a, c) = sqrt((1 − 0)² + (0 − 1)²)     = sqrt(1 + 1)       = sqrt(2.00) ≈ 1.414
d(b, c) = sqrt((0.8 − 0)² + (0.6 − 1)²) = sqrt(0.64 + 0.16) = sqrt(0.80) ≈ 0.894
```text

Note the ranking: `a`–`b` is nearest, then `b`–`c`, then `a`–`c`. Cosine ranked them the same way (0.80 > 0.60 > 0.00). For unit vectors, that always happens. Distance and similarity rank identically; they just point in opposite directions, so sorting ascending by distance equals sorting descending by similarity.

Now break that agreement deliberately. Un-normalise `b` by tripling it:

```text
b' = (2.4, 1.8)          |b'| = 3.0
a · b' = 2.4             cos(a, b') = 2.4 / 3.0 = 0.80   (unchanged)
d(a, b') = sqrt((1 − 2.4)² + (0 − 1.8)²) = sqrt(1.96 + 3.24) = sqrt(5.20) ≈ 2.280
```text

The cosine is exactly the same — direction only. The dot product tripled and the Euclidean distance jumped. **This is the whole practical difference between the measures, in one example.** Same direction, different magnitude, and now the three measures disagree.

| Measure | What it rewards | Use it when |
|---|---|---|
| Cosine similarity | Direction only, magnitude-invariant | Default choice. Comparing text of different lengths, mixing models or corpora, wanting a bounded −1 to 1 score |
| Dot product | Direction **and** magnitude | Vectors are already normalised (then it equals cosine and is faster), or magnitude is genuinely meaningful — some retrieval models are trained to encode relevance in the norm |
| Euclidean distance | Absolute position | You care about how far points sit in the space itself, e.g. clustering with distance-based algorithms, or anomaly detection |

**Where the three stop being interchangeable:** the moment magnitude carries information. Some embedding models are explicitly trained so that the dot product is the intended score, and the vector's length encodes something. Normalising those before comparison throws away signal the model was trained to produce. The practical consequence: **follow the model card.** If it says "use the dot product", use the dot product. If it says "normalise", normalise. Getting this wrong degrades quality silently — no error, just worse results.

### Part 5 — Token embeddings are not sentence embeddings

Now the distinction that causes the most wasted debugging time.

When Phase 4 described attention, it said the input is a sequence of token embeddings: one vector per token. That is a real embedding, and it lives inside a generation model. A sentence embedding is a different object produced by a different model: **one vector for a whole passage.**

| | Token embedding | Sentence / document embedding |
|---|---|---|
| Granularity | One vector per token | One vector per passage you chose to embed |
| Produced by | The generation model's input layer, plus its layers | A dedicated embedding model, or a pooling step over one |
| Typical dimensions | The model's hidden size; varies widely | Commonly 384 to 3072, varies by model |
| Intended use | Feeding attention inside the model | Retrieval, clustering, deduplication, ranking |
| Comparable across models? | No | No |
| Same word, different context | Yes — contextual, differs by sentence | Not applicable; context is baked into the whole-passage vector |

Two ways beginners get this wrong:

**Mistake one: average the token embeddings from a generation model and call it a passage embedding.** It runs and produces a vector, and it is a bad retriever, because the generation model was never trained to make that average meaningful. Averaging is *mean pooling*, and it is exactly right for models trained with mean pooling and unreliable for models that were not. Other pooling choices — the first token's vector, the last token's, a designated `[CLS]` token — each only work for models trained that way.

**Mistake two: assume one vector per passage can represent a long passage.** It cannot, and this is structural, not a tuning issue. Squeezing a 3,000-word document into 768 numbers forces the model to pick a summary. A passage covering four topics produces a vector sitting between them, and it will be a mediocre match for any specific query about one of the four. This is why Track 4 teaches *chunking*: embed passages small enough that one vector can represent them, and accept that the retrieval unit is now a fragment.

**What this lets you predict:** retrieval quality depends far more on how you chunked than on which embedding model you chose. A modest model over well-chosen 200-word chunks will beat a strong model over whole documents. If your semantic search disappoints, look at chunk size before shopping for a better model.

**Where it stops working:** one vector per chunk genuinely cannot answer "which of these two documents is longer" or "does this document mention my name in the footer". Position, exact strings, and counts are all destroyed by embedding. Anything that needs them must go through keyword search or metadata filters.

### Part 6 — Semantic versus keyword search, and why both fail

You now have enough to state the trade precisely.

**Keyword search** builds an inverted index: for each term, the list of documents containing it. It matches strings. It is exact, fast, explainable, and trivially updatable. It fails when the query and the document use different words for the same thing, which is *most* of the time for natural-language queries.

**Semantic search** embeds the query and every passage, then finds the nearest passage vectors. It matches meaning. It fails when the query contains something whose identity is the string itself.

| Query | Keyword | Semantic | Why |
|---|---|---|---|
| "database slow" vs "Postgres latency spiked" | Fails | Succeeds | No shared strings; shared meaning |
| `ERR_4471` | Succeeds | Unreliable | The code is an arbitrary string; the model has no reason to place it near anything |
| "papers by Dela Cruz 2019" | Succeeds | Weak | Names and years are identifiers, not concepts |
| "how do I stop the thing from timing out" | Fails | Succeeds | Paraphrase with no technical vocabulary |
| "not about authentication" | Partial | Fails badly | Negation is weakly represented |
| "section 4.2" | Succeeds | Fails | Structure is invisible to embeddings |

Look at the failure columns. They are almost complementary, which is the argument for running both and merging the results — the hybrid retrieval of Track 4. But notice something more important: the *exact* cases where semantic search fails are the cases where a wrong answer is most expensive. If a search for an error code confidently returns a plausible-looking but wrong chunk and you paste it into a debugging session, you have lost more than you would have by getting no result. Keyword search fails loudly by returning nothing. Semantic search fails quietly by returning something that looks relevant.

**What this lets you predict:** any system where semantic search is the only retriever will produce confident, plausible, wrong context — and a generation model handed that context will write a fluent answer grounded in the wrong passage. That is the mechanism behind a large share of "RAG hallucinated" complaints. The model did its job. The retriever handed it the wrong page.

**Where it stops working:** semantic search also has no notion of *authority* or *recency*. The nearest neighbour may be an outdated note, a joke, or a rant. Similarity is not quality, and it is not truth. If your corpus mixes drafts with final versions, the drafts are just as close.

### Part 7 — Limits you have to design around

Five specific limits.

**1. Similarity is not truth.** Two passages are near each other because they are about the same thing, not because either is correct. A well-written false claim sits right next to the true claims about its topic. Embeddings rank relevance; they say nothing about accuracy.

**2. Opposites can be close.** "The vaccine is safe" and "the vaccine is not safe" differ by one word and share nearly all context, so their vectors are often very close — as are "increase the budget" and "do not increase the budget". This follows directly from Part 2: co-occurrence is not truth, and negation barely changes the bag of topics a sentence is about. If your application must distinguish claims from counter-claims, embeddings alone will not do it. You need the generation model reading the text, or an explicit filter.

**3. Frozen at the model's training cutoff.** An embedding model learned its geometry from data up to some date. A product name, slang term, or organisation that became prominent after that date has no meaningful position, because the contexts that would have taught the model what it means are not in its training data. It will not error — it will return a vector that is essentially an average of whatever it could pattern-match, and your search degrades in a way that is hard to notice. **Dated specific: as of 2026-09, most widely used open embedding models were trained on corpora ending somewhere in the 2023–2024 range, with newer releases appearing every few months. Check the model card for the actual date — this changes fast, and any number written here is already old.** The point survives any date: text newer than a model's cutoff is embedded less reliably.

**4. Everything is a claim about the model, not the text.** The same text embedded by two models gives two incomparable vectors. You cannot upgrade your embedding model without re-embedding your entire corpus. That is a real operational cost and the main reason people delay upgrades — which is how indexes drift years behind.

**5. Scores are not calibrated.** A cosine of 0.81 is not "81% relevant". Some models put all their scores in a narrow band around 0.7; others spread them from 0.1 to 0.9. Never port a threshold from a blog post. Measure on your own data.

And a softer sixth: **embeddings are inference, not compression.** You cannot decode a passage back out of its vector. That is a feature for privacy (the vector is lossy about exact wording) and a bug for auditing (you cannot tell why two passages matched without looking at both).

### Part 8 — Cost, and why embedding models are cheap

Embedding models and generation models are separate products doing different jobs, and the cost difference is structural, not a small constant factor.

A generation model does a forward pass, samples a token, then feeds that token back and does *another full forward pass* over the whole sequence — once per output token. An embedding model does **one** forward pass over the input and returns a vector. No sampling. No loop.

| | Forward passes | Rough scaling |
|---|---|---|
| Generation | n + 1 | Cost grows with input length **times** output length |
| Embedding | 1 | Cost grows with input length only |

So to produce a 500-token answer to a 500-token prompt, generation takes roughly 500 passes where embedding the same prompt takes one. That is the source of the price gap.

**Dated specifics — illustration, not fact.** As of 2026-09, the major providers listed dedicated embedding endpoints at a small fraction of the input price of their generation models, and embedding prices had generally trended downward while generation prices rose with capability. **These numbers change frequently — check the provider's pricing page rather than trusting any figure in a lesson.** Notice how non-load-bearing this is: the *shape* of the argument (one pass versus many, linear versus multiplicative) is what to remember, and it held before these prices existed and will hold after they change.

Three more cost facts that matter in practice:

- **You pay to embed your corpus once**, then never again until you change the model or the chunking. The recurring cost is embedding *queries*, which are tiny.
- **Storage is usually a bigger bill than computation** at small scale. Ten thousand chunks at 768 dimensions is about 31 MB of float32 — trivial. Ten million chunks is 31 GB, and now you are shopping for an index.
- **Generation is still the expensive part of a RAG system.** Retrieval adds a little input; answering spends output. If your bill is high, the retriever is almost never the reason.

**Where the cheapness stops being a bargain:** embedding models are smaller and less capable by design, because separating "represent meaning" from "produce language" lets each be optimised. The price is that they cannot reason, cannot follow instructions, and cannot tell you why two things matched. The moment you need a judgement rather than a distance, you are back to generation prices.

> Phase 4 established that attention cost grows with the square of sequence length. Embedding sidesteps that, because there is no per-token output loop and, in modern encoder architectures, no causal mask — every token can attend to every other in one pass. That is the architectural reason embeddings are cheap.

### Part 9 — Retiring the analogy

Back to the city map, properly retired.

The map metaphor is useful for one thing: it makes "meaning has a location" intuitive. It breaks on four points and you should be able to name them.

1. **No units.** You cannot say two ideas are "3 apart", only that one pair is closer than another.
2. **No shared geometry across models.** Every model redraws the map with different axes. Vectors are not portable.
3. **No symmetry of meaning.** Distance is symmetric in the geometry but not in relevance. "How do I fix a flat tyre" and "tyre repair" are the same distance apart in either direction, yet a query and a document play different roles.
4. **No truth.** A map tells you where things are, not whether they are true. Embedding space is the same, and Part 7 is the consequence.

Once you have retired it, what is left is the honest statement: an embedding is a learned, high-dimensional, model-specific coordinate for a piece of text, whose only guaranteed property is that texts which were interchangeable in training contexts tend to land near each other.

That is less exciting than the map, and it is enough to build a search engine on.

## Hands-on practice tasks

1. Write down, in one sentence each, what you expect the embedding of "bank" to be near: a river bank, a financial bank, or both equally. Then check with a real model in task t03 and record what actually happened. <!-- id: found-06-embeddings-and-similarity-t01 band: quick energy: low -->
2. Implement dot product, norm, cosine similarity and Euclidean distance in pure Python — no NumPy — and verify your functions reproduce every number in the Part 4 worked example: `cos(a,b)=0.80`, `cos(b,c)=0.60`, `d(a,b)≈0.632`. Then run them on `b'` and confirm cosine is unchanged while distance is not. <!-- id: found-06-embeddings-and-similarity-t02 band: focused energy: normal -->
3. Build a semantic search over 100 of your own notes, messages or saved articles. Embed them locally with `sentence-transformers` (or a free API), store the vectors in a plain list or a NumPy array, and write a search function that embeds a query and returns the top 5 by cosine similarity. Run at least 10 queries. For each, record whether the answer you wanted was in the top 5. <!-- id: found-06-embeddings-and-similarity-t03 band: deep energy: high -->
4. Run your 10 queries through plain keyword search as well — a one-line substring or word-overlap search is enough. Build a table of which method won for each query, and add a column for *why* you think it won. Confirm or refute the failure patterns in the Part 6 table. <!-- id: found-06-embeddings-and-similarity-t04 band: focused energy: normal -->
5. Take 30 sentences from your corpus and cluster the embeddings into groups with scikit-learn or a hand-written distance loop. Read the clusters and name each one. Record every pair the model placed together that a human would not — those are your negation and opposite cases. <!-- id: found-06-embeddings-and-similarity-t05 band: deep energy: normal -->
6. Deliberately construct a failure. Add these five to your corpus: a passage containing an error code, a passage containing a person's full name and a year, a passage that says "X is safe", a passage that says "X is not safe", and a paragraph that covers three unrelated topics at once. Write a query for each and show, with the scores printed, that semantic search fails on at least three of them. <!-- id: found-06-embeddings-and-similarity-t06 band: focused energy: normal -->
7. Check the model card for the embedding model you used: dimensions, recommended similarity measure (cosine or dot product), maximum input length, and training data description. Then re-run t03 both with and without normalisation and report whether the top-5 rankings changed. <!-- id: found-06-embeddings-and-similarity-t07 band: quick energy: low -->
8. Write 200 words explaining to a smart friend why "database slow" finds "Postgres latency spiked" and why `ERR_4471` does not, without using the words "understand", "know", or "AI". <!-- id: found-06-embeddings-and-similarity-t08 band: quick energy: normal -->
9. Keep your index and re-run one query per day for the rest of the week. Note any query where the top result changes because you added new notes. <!-- id: found-06-embeddings-and-similarity-t09 band: ongoing energy: low -->

## Common Pitfalls

**Comparing vectors from two different models.** You will get a number, it will look plausible, and it will be meaningless. Pick one model, one version, and re-embed everything if you change it. Write the model name and version into your index file so you cannot forget which one produced it.

**Confusing token embeddings with sentence embeddings.** Averaging a generation model's token embeddings is not the same operation as using a model trained for sentence embeddings. If your retrieval is bad and you built the embeddings yourself from hidden states, suspect this first.

**Embedding whole documents.** One vector cannot faithfully represent a long multi-topic document. Chunk first. Chunk size will move your quality more than model choice will.

**Hard-coding a similarity threshold.** Scores are not calibrated and not comparable across models. Measure the distribution on your own data and find the gap.

**Expecting negation to work.** "Not safe" and "safe" are close. If your application depends on that distinction, embeddings alone cannot provide it.

**Treating a high similarity score as evidence of correctness.** The nearest passage is the most *relevant* passage, which is frequently an outdated, satirical, or wrong one. Relevance and truth are different axes.

**Assuming an old embedding model knows new words.** Anything from after the model's training cutoff has a poorly formed position in the space. Check the cutoff, and re-embed with a newer model when your corpus drifts into new vocabulary.

**Skipping the hand computation because the library does it.** The library hides exactly the bugs that matter — wrong measure, unnormalised vectors, mismatched dimensions. Twenty minutes with pen and paper in Part 4 buys you the ability to diagnose all three.

## Deliverable / proof of work

Write `portfolio/foundations/06-embeddings-and-similarity.md` containing:

- **Your by-hand worked example** — the Part 4 computation redone with three vectors of your own choosing, showing dot product, norms, cosine and Euclidean distance, plus your un-normalised comparison and a one-paragraph statement of what changed and why
- **Your semantic search** — the code (or an exact description plus the key function), the model name and version you used, the number of passages indexed, and your chunking choice with a sentence on why
- **The 10-query results table** from tasks t03 and t04: query, semantic top result, keyword top result, which won, and why
- **At least three documented failures** from task t06, each with the printed scores, and a sentence naming which of the Part 7 limits caused it
- **A section titled "What embeddings do not capture"** — five specific things, each with an example from your own corpus rather than a generic statement
- **A short section titled "When I would use keyword search instead"** — at least three query types where you would deliberately not use embeddings

## Checklist

- [ ] I can define an embedding in one sentence without using an analogy <!-- id: found-06-embeddings-and-similarity-c01 energy: low -->
- [ ] I can explain why similar meanings end up near each other, in terms of the prediction objective <!-- id: found-06-embeddings-and-similarity-c02 energy: normal -->
- [ ] I can compute dot product, norm, cosine similarity and Euclidean distance by hand on 3D vectors <!-- id: found-06-embeddings-and-similarity-c03 energy: normal -->
- [ ] I can state the exact condition under which cosine, dot product and Euclidean ranking agree <!-- id: found-06-embeddings-and-similarity-c04 energy: high -->
- [ ] I can say what normalisation removes and when removing it is wrong <!-- id: found-06-embeddings-and-similarity-c05 energy: normal -->
- [ ] I can explain what more dimensions buys and what it costs <!-- id: found-06-embeddings-and-similarity-c06 energy: normal -->
- [ ] I can distinguish token embeddings from sentence embeddings and say why they are not interchangeable <!-- id: found-06-embeddings-and-similarity-c07 energy: normal -->
- [ ] I can explain why one vector cannot represent a long multi-topic document <!-- id: found-06-embeddings-and-similarity-c08 energy: normal -->
- [ ] I have built a working semantic search over my own text with free tools <!-- id: found-06-embeddings-and-similarity-c09 energy: high -->
- [ ] I can name three query types where semantic search loses to keyword search <!-- id: found-06-embeddings-and-similarity-c10 energy: normal -->
- [ ] I have produced a documented case where an opposite or negation was placed too close <!-- id: found-06-embeddings-and-similarity-c11 energy: normal -->
- [ ] I can explain why embedding is a single forward pass while generation is many <!-- id: found-06-embeddings-and-similarity-c12 energy: normal -->
- [ ] I know the training cutoff of the embedding model I used and what it implies <!-- id: found-06-embeddings-and-similarity-c13 energy: low -->
- [ ] I can explain why similarity is not truth, with an example from my own index <!-- id: found-06-embeddings-and-similarity-c14 energy: normal -->
- [ ] I can explain why a RAG system can hallucinate even when the generation model behaved correctly <!-- id: found-06-embeddings-and-similarity-c15 energy: high -->

## Quiz

### Q1. Two passages share no words at all: "Postgres latency spiked" and "database slow". Why can an embedding model still match them? <!-- id: found-06-embeddings-and-similarity-q01 energy: normal -->

- [ ] It maintains a synonym dictionary built from WordNet
- [x] Both phrases appear in similar contexts during training, so the objective pushed their vectors toward similar directions
- [ ] It translates both passages into a shared formal language before comparing
- [ ] It compares the passages character by character and scores partial overlaps

**Why:** The training objective rewards representing words that are interchangeable in a slot with similar vectors. Words used in the same kinds of sentence get pulled to the same region of the space. There is no dictionary and no translation step; the similarity is a by-product of prediction.

### Q2. You have unit-normalised embeddings. Which statement is correct? <!-- id: found-06-embeddings-and-similarity-q02 energy: high -->

- [ ] Cosine similarity, dot product and Euclidean distance all give the same numeric value
- [ ] Cosine similarity is the only valid measure and the others become undefined
- [ ] Normalisation makes all similarity scores between unrelated texts increase
- [x] Dot product and cosine similarity give identical values, and Euclidean distance gives the same ranking in the opposite direction

**Why:** For a unit vector, the norm is 1, so dividing by the product of norms changes nothing and the dot product is the cosine. Euclidean distance between unit vectors is a monotonic decreasing function of their cosine, so sorting by distance ascending is the same ordering as sorting by cosine descending — the numbers differ, the ranking does not.

### Q3. You embed 4,000-word policy documents as single vectors and queries return vague, generic passages. What is the most likely cause? <!-- id: found-06-embeddings-and-similarity-q03 energy: normal -->

- [ ] The embedding model is too small for legal text
- [x] One vector cannot represent a document covering many topics, so the passages are blended into a mediocre average
- [ ] Cosine similarity is the wrong measure for long documents
- [ ] Legal text after the training cutoff cannot be embedded

**Why:** A single fixed-length vector has to summarise everything in the passage. Multi-topic documents land between their topics and match nothing specifically. The fix is chunking into passage-sized units, not switching models or measures — chunking will move quality far more than model choice.

### Q4. Your search must reliably find the error code `ERR_4471`. Which approach is correct? <!-- id: found-06-embeddings-and-similarity-q04 energy: normal -->

- [ ] Semantic search, because it generalises better than string matching
- [ ] Semantic search with a lowered similarity threshold
- [ ] Embed the code with a larger model so its vector is more precise
- [x] Keyword or exact-match search, optionally fused with semantic results

**Why:** An arbitrary identifier has no distributional meaning, so nothing in training teaches the model where to place it. Its vector will be an artefact of whatever substrings it could pattern-match. Semantic search fails quietly here; exact matching succeeds with certainty. This is the argument for hybrid retrieval.

### Q5. A retrieval query returns a passage that discusses the right topic but states the opposite of what is true. What is the mechanism? <!-- id: found-06-embeddings-and-similarity-q05 energy: high -->

- [ ] The embedding model has a bug that inverts certain vectors
- [x] A claim and its negation share nearly all their surrounding context, so their vectors are close, and similarity measures topic rather than stance
- [ ] The index was built with the wrong similarity measure
- [ ] The chunk was too small to embed correctly

**Why:** Co-occurrence is not truth. "X is safe" and "X is not safe" appear in nearly the same contexts, differ by one token, and are about the same thing. Embeddings position text by topic, and negation barely changes the topic. Distinguishing stance requires the generation model reading the text, or an explicit filter.

### Q6. Why is embedding a document far cheaper than asking a model to summarise the same document? <!-- id: found-06-embeddings-and-similarity-q06 energy: normal -->

- [ ] Embedding models use a cheaper floating-point format
- [ ] Embedding providers subsidise embedding calls to attract customers
- [ ] Embedding models skip most of their layers for short inputs
- [x] Embedding is one forward pass over the input, while generation does a full pass per output token

**Why:** Generating N tokens requires roughly N sequential forward passes, each reprocessing the growing sequence, so cost scales with input length multiplied by output length. Embedding does a single pass and returns a vector — no sampling, no loop. That structural difference, not pricing policy, is the source of the gap.

### Q7. You build a new index with an updated embedding model and compare a document's new vector to the old model's query vector. What happens? <!-- id: found-06-embeddings-and-similarity-q07 energy: high -->

- [ ] The comparison works if both models have the same number of dimensions
- [ ] The comparison works after you normalise both vectors
- [x] The comparison is meaningless, because each model defines its own coordinate system with no correspondence between axes
- [ ] The comparison works but scores are shifted by a constant offset

**Why:** Dimensions are not aligned features; they are arbitrary coordinates produced by a training run. Two models place the same word in unrelated positions, so a cross-model similarity is a number without meaning. Changing the model means re-embedding the entire corpus — which is why index upgrades are deferred, and why indexes drift.

### Q8. Your team lowers the similarity threshold until every query returns something. What is the main risk? <!-- id: found-06-embeddings-and-similarity-q08 energy: normal -->

- [ ] Search latency increases roughly linearly with the number of results
- [x] The retriever starts handing irrelevant passages to the generation model, which then writes a fluent answer grounded in the wrong context
- [ ] Storage costs rise because more vectors must be kept
- [ ] The embedding model stops producing normalised vectors

**Why:** Similarity is a ranking, not a calibration, so a low threshold converts "no match" into "a confident-looking wrong match". When a generation model receives that passage it does its job faithfully and produces plausible text about the wrong thing. This is a common mechanism behind RAG systems that appear to hallucinate.

### Q9. Which task is a poor fit for a single-vector sentence embedding? <!-- id: found-06-embeddings-and-similarity-q09 energy: normal -->

- [ ] Finding passages that paraphrase a user's question
- [ ] Grouping 500 support tickets into themes
- [ ] Detecting near-duplicate product descriptions
- [x] Answering whether a specific person's name appears in the footer of a contract

**Why:** Embedding discards position, exact strings, and counts. A name buried in a footer contributes almost nothing to the whole-passage vector, and a name is an identifier rather than a concept. This needs exact matching or structural parsing, not nearest-neighbour search.

### Q10. A query uses a slang term that became popular last month. Semantic search returns unrelated results with no error. Why? <!-- id: found-06-embeddings-and-similarity-q10 energy: normal -->

- [ ] The tokenizer maps unknown words to a special error token that is skipped
- [ ] The index needs rebuilding because vectors expire over time
- [x] The embedding model was trained before the term existed, so it has no well-formed position for it and returns a vector derived from whatever it could pattern-match
- [ ] Cosine similarity is undefined for out-of-vocabulary words

**Why:** An embedding model's geometry comes from its training data, and text newer than its cutoff has few or no contexts to learn from. The model does not fail loudly — it produces a plausible-looking vector that places the term somewhere roughly unrelated. This is a staleness problem, and the remedy is a newer model plus a full re-embed.

## You're ready to move on when...

You can take a piece of your own text, break it into passages, embed them with a free model, run a natural-language query, and get back something relevant — and then explain, without notes, exactly why it worked for that query and why it would have failed for a query containing an error code or a negation. You have personally seen a bad match come back with a high score, and you know that no amount of threshold tuning fixes an embedding model that was never taught to care about stance or exact strings.

You should also be able to say what happens next: this phase gives you a way to find passages. Track 4 uses it, alongside keyword search, to feed a generation model with the right text — and the reason hybrid retrieval exists is written all over Part 6 of this lesson.

## Free vs Paid

### What's free is enough

Everything in this phase is doable at $0, permanently. `sentence-transformers` runs real, good-quality embedding models on an ordinary laptop CPU; embedding a few hundred passages takes seconds and no account, no API key and no credit card. NumPy does the arithmetic. A plain Python list or a NumPy array is a perfectly good vector index at your scale — brute-force comparison across a few thousand vectors is instant, and it has the advantage that you can read the code and see exactly what it does.

You also do not need an index library, a database, or a vector store. Those exist to solve scale problems you do not have yet, and adding one now hides the mechanism this phase is about.

### What a paid tier adds

A hosted embedding endpoint (via a provider's API) adds convenience, larger models, and no local download. A paid chat subscription adds nothing to this phase at all — the models people pay for are generation models, and their token-level hidden states are exactly the wrong tool for passage retrieval (Part 5).

Beyond that, money buys scale: approximate nearest-neighbour indexes, managed vector databases, and dedicated storage when your corpus reaches millions of chunks. **Dated note: as of 2026-09 the hosted embedding endpoints from the major providers were priced low enough that a personal-scale index cost cents, but provider pricing moves often — check the current pricing page rather than trusting any figure here.**

### When it's worth paying

**Not in this phase.** Free local embeddings are the same class of model that the paid endpoints serve, and they teach the mechanism identically. If anything, the local path teaches it better, because you can inspect the vectors.

The honest threshold is scale and operational need, not quality: pay when you have more passages than brute-force search can handle in acceptable time, when you need the index to stay fresh without you re-running a script, or when you are serving other people and cannot ship a model download to each of them. Until then, spend nothing, and spend the saved effort on chunking — which, as Part 5 argued, will move your retrieval quality more than any upgrade you could buy.
