---
id: rag-06-rag-debugging
track: rag
phase: 6
order: 60
title: Diagnosing RAG Failures
duration: 2 weeks
duration_weeks: 2
energy_mix: [normal, high]
deliverable: portfolio/rag/06-rag-debugging.md
exit_criteria: >
  You can take a wrong answer from a RAG system and localise it — to the
  corpus, the retrieval, the context assembly or the generation — using a
  diagnostic procedure rather than intuition, and you have a written
  symptom-to-cause table built from failures you actually diagnosed.
---

# Phase 6 — Diagnosing RAG Failures

## Goal of this phase

Phase 5 gave you the instruments. This phase is about using them under pressure, on real failures, when something is wrong and you do not yet know what.

The characteristic experience of building a RAG system is a wrong answer with no explanation. The output is fluent, the citation looks plausible, and nothing in the logs says "error". You are reduced to changing things and hoping — swapping an embedding model, raising k, rewriting the prompt — which is not debugging but a random walk through a large space, and it usually makes the system harder to reason about while appearing to help.

By the end of this phase you will have a **procedure** that localises a failure to one of four places, a **symptom-to-cause table** built from failures you diagnosed yourself, and the habit of verifying citations in code rather than trusting them. The deliverable is that table, because it is the artefact that turns each future bug from a mystery into a lookup.

## Estimated time

**2 weeks** at 1–2 hours a day, 5 days. Roughly 12–14 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Part 1: why RAG failures are hard, and the four places they live | 1.5h |
| 2 | Part 2: the ordered diagnostic procedure | 2h |
| 3 | Part 3: the symptom-to-cause table, part one — retrieval failures | 2h |
| 4 | Part 4: the symptom-to-cause table, part two — generation failures | 2h |
| 5 | Part 5: verifying citations in code | 1.5h |
| 6 | Part 6: one bad answer, walked end to end | 2h |
| 7 | Deliverable: your own table, built from your own failures | 2h |

If you only have four hours this week, do tasks 2, 4, 6 and 11. Those produce the diagnostic run on real failures, the citation verifier, one fully documented walkthrough, and your own table — which is the phase.

The value here is cumulative and it only accrues if you diagnose failures you actually have. Reading a symptom table teaches you the table. Diagnosing ten real failures teaches you to debug, and the table becomes yours.

## Skills you'll gain

- Localise a RAG failure to corpus, retrieval, context assembly or generation, in a fixed order.
- Recognise the symptom patterns that identify each cause without running the full procedure.
- Verify citations in code, and explain why a model's attribution cannot be trusted unaudited.
- Detect the "correct for the wrong reason" failure — memorisation — and distinguish it from grounding.
- Diagnose duplicate chunks and the retrieval dilution they cause.
- Detect facts split across chunk boundaries, and fix it at the right layer.
- Tell a retrieval miss apart from a ranking problem, using recall and rank separately.
- Write a symptom-to-cause entry precise enough that a future you can act on it.
- State where debugging by symptom fails: on failures with more than one cause, and on problems no unit of the pipeline is responsible for.

## Specific topics to learn

### Why these failures are hard

- No exception is raised: a wrong answer is a successful run.
- Fluency is uncorrelated with correctness, so reading the output tells you little.
- Failures are non-deterministic, so a single observation is weak evidence.
- The pipeline has four stages and the symptom does not name which one.
- The tempting failures: changing several things at once, and fixing the symptom rather than the cause.

### The four places a failure lives

- The **corpus**: the information is absent, stale, contradictory or wrong.
- **Retrieval**: the right passage exists and was not returned, or ranked too low.
- **Context assembly**: the passage was returned and then lost — truncated, deduplicated, reordered, or crowded out.
- **Generation**: the right passage was in the context and the model did not use it faithfully.

### The ordered diagnostic

- Step 0: is the question answerable from the corpus at all?
- Step 1: does the correct passage exist in the index? (Search by hand, by keyword.)
- Step 2: does retrieval return it, and at what rank?
- Step 3: does it survive into the final context sent to the model?
- Step 4: with the correct passage injected, does the answer become right?
- Why the order matters: each step eliminates a stage and constrains the next.

### Verifying citations in code

- Why citations are generated text and can name the wrong chunk confidently.
- Numbering chunks and requiring ids, so an answer can be checked mechanically.
- Asserting the quoted span appears in the cited chunk.
- Asserting the cited chunk was actually in the context.
- When a citation is correct but the answer still misrepresents it.

### The failure patterns

- Retrieval miss, and how to tell it from a ranking problem.
- Wrong-source citation.
- Model contradicting the document.
- Correct for the wrong reason (memorisation).
- Irrelevant chunks crowding the context.
- Duplicated chunks diluting the ranking.
- Good retrieval, bad answer.
- Facts split across chunk boundaries.
- Stale or contradictory documents in the corpus.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| SQLite with FTS5 | Search the corpus by hand to establish whether a passage exists at all | Free/open-source | https://sqlite.org/fts5.html | Task t03 — the step-1 check: does the answer exist in the index? | `grep` over your source files, which is often all you need |
| FAISS | Inspect what retrieval returns and at what rank, id by id | Free/open-source | https://github.com/facebookresearch/faiss | Tasks t03, t04 — dump retrieved ids and compare them against the known-correct chunk | numpy brute force, which gives you exact ranks |
| sentence-transformers | Re-embed and compare, when you suspect the embedding is the cause | Free/open-source | https://sbert.net/ | Task t06 — check whether the query and the correct chunk are close at all | Any local embedding model |
| A local model via Ollama | Re-run generation with an injected chunk, and test prompt variants | Free/open-source | https://ollama.com/ | Tasks t05, t08 — the injection test and the generation-side probes | A free hosted tier for cases your local model cannot handle |
| pandas | Tabulate every failure with its diagnosis, and find the distribution | Free/open-source | https://pandas.pydata.org/ | Task t11 — group failures by cause and see which one dominates | Python's `csv` module and a spreadsheet |
| pytest | Encode each diagnosed failure as a test that never regresses again | Free/open-source | https://docs.pytest.org/ | Task t12 — one test per diagnosed bug | Any test runner, or a script that exits non-zero |
| `difflib` (Python stdlib) | Compare an answer against the cited chunk to find unsupported claims | Free/open-source | https://docs.python.org/3/library/difflib.html | Task t09 — a crude but effective unsupported-span detector | Manual reading, which is slower and less consistent |
| Google AI Studio | A free stronger model for cases where local generation confounds the test | Free tier | https://aistudio.google.com/ | Task t08 optional — separate "weak model" from "bad context" | Any provider free tier |
| Git | Track every diagnostic change separately so you can attribute an effect | Free/open-source | https://git-scm.com/ | Task t02 — one commit per change, so a fix is attributable | Any version control, or dated copies of files |

## Free/cheap resources

- **Lewis et al. — Retrieval-Augmented Generation (arXiv:2005.11401)** — https://arxiv.org/abs/2005.11401
- **Liu et al. — Lost in the Middle (arXiv:2307.03172)** — https://arxiv.org/abs/2307.03172
- **Es et al. — Ragas: Automated Evaluation of RAG (arXiv:2309.15217)** — https://arxiv.org/abs/2309.15217
- **Anthropic — Contextual Retrieval** — https://www.anthropic.com/news/contextual-retrieval
- **SQLite FTS5 documentation** — https://sqlite.org/fts5.html
- **FAISS wiki — troubleshooting and index selection** — https://github.com/facebookresearch/faiss/wiki
- **Sentence-Transformers — retrieve and rerank** — https://sbert.net/examples/applications/retrieve_rerank/README.html

## Lesson: Finding Which Stage Broke

### Part 1 — Why a wrong answer tells you almost nothing

Start with the property that makes this track's debugging different from ordinary programming: **there is no exception.** A retrieval miss does not raise. A truncated context does not warn. A model that contradicts its source returns HTTP 200 with a fluent paragraph. Every failure you will diagnose in this phase arrives looking like success.

Three consequences follow, and each one is a specific way people go wrong.

**Fluency is uncorrelated with correctness.** A model that has ignored its context writes just as confidently as one that used it, and usually more smoothly, because it is not constrained by awkward source text. Reading the output cannot tell you which happened. This is why Phase 1's reverse test exists and why Phase 5 made you run it.

**One observation is weak evidence.** Temperature is non-zero, sampling varies, and a retrieval system with an approximate index can return different neighbours for near-identical queries. A single wrong answer might be a systematic bug or a tail event, and you cannot tell from one sample. When a failure matters, run it several times before diagnosing — if it appears in three of five runs it is systematic; if once in twenty it may still matter for a user-facing system (a 5% failure rate is a bad product) but it changes how you investigate.

**The symptom does not name the stage.** "The answer is wrong" is consistent with at least nine distinct causes spread across four stages. This is the actual difficulty, and it is why the rest of this phase is an ordering rather than a list of things to try.

**The four places, and the temptation to skip one.**

| Stage | The failure | Looks like |
|---|---|---|
| **Corpus** | The information is absent, stale, contradictory or wrong | A confident wrong answer, or an honest "not found" |
| **Retrieval** | The right passage exists and was not returned, or ranked too low | "I could not find that" or an off-topic answer |
| **Context assembly** | The passage was retrieved and then lost or crowded out | An answer missing the detail that was retrieved |
| **Generation** | The passage was in the context and the model misused it | A fluent answer that contradicts its source |

**The temptation worth naming explicitly is the instinct to change several things at once.** Swapping the embedding model, raising k, and rewriting the prompt in one sitting is the standard response to a confusing failure, and it is the reason the failure stays confusing. If the answer improves you do not know which change did it, so you cannot generalise the fix or undo the parts that did not help. **One change per commit**, which is why git is in the tools table for this phase rather than assumed.

**Where this framing stops working.** It assumes failures have a single cause in a single stage, and some do not. A pipeline can retrieve a merely-adequate chunk that leads the generator into a partially correct answer, where both halves contribute. The procedure still helps — it tells you the retrieval half is imperfect — but the clean four-way classification will not fit, and you should record "both" honestly rather than forcing a single label.

### Part 2 — The ordered diagnostic

Here is the procedure. It runs from the outside in, and the order is the entire method: **each step eliminates a stage, so the remaining steps get cheaper and more specific.**

#### Step 0 — Is the question answerable from the corpus at all?

Before anything else, check whether the source documents contain the answer. Search them by hand, with `grep` or a keyword search, for the distinctive terms in the question. This takes a minute and it prevents the most wasted debugging session in this track: carefully optimising retrieval for a question whose answer does not exist.

A surprising share of reported RAG failures are corpus gaps or corpus errors. If the answer is not in the documents, no retrieval improvement will produce it, and the correct fix is to add or correct the source — which is a content task, not a pipeline task. Record it as a corpus-class failure and move on.

**If the answer exists, note *where*, precisely.** The file, the section, and the chunk. You will need that chunk in step 1, and finding it by hand now is what makes the following steps mechanical.

#### Step 1 — Is the correct passage in the index?

Confirm the chunk you identified in step 0 is actually present in the vector index, with the metadata you expect. Ingestion bugs are common and quiet: a document silently skipped by the loader, a chunk dropped at a size boundary, metadata written as the wrong type, duplicates never created.

This is a **lookup, not a search** — you are asking "is id X in the index?", not "what is similar to this query?". Keeping it a lookup is what makes it decisive: if the chunk is absent, you have found the bug and every downstream measurement is irrelevant.

**Where this stops working.** The chunk existing does not mean the *right version* exists. A stale document still indexed, or two versions of a policy both present, will pass this step and produce contradictions later. When a corpus contains conflicting sources, check whether both are indexed — the model may be faithfully reporting the wrong one, which step 4 will confirm.

#### Step 2 — Does retrieval return it, and at what rank?

Now the first real search. Run the user's actual query through your retriever and inspect the returned ids in order.

Two questions, and keeping them separate is the point:

- **Is the correct chunk in the returned set at all?** If not, this is a **retrieval miss**.
- **If it is present, at what rank?** If it is present but ranked 40th when you retrieve 10, that is a **ranking problem**, not a miss, and the fixes are different.

| Finding | Diagnosis | Where the fix lives |
|---|---|---|
| Correct chunk absent from top-k | Retrieval miss | Chunking, embedding model, hybrid search, k |
| Present but ranked below the cutoff | Ranking problem | Reranking, rank fusion weights, k |
| Present and ranked high, answer still wrong | Retrieval is fine | Go to step 3 |

Phase 5 established the metric that distinguishes these in aggregate — Recall@k for the miss, MRR and nDCG for the ranking — and here they appear as a single-case inspection. **Inspect the ids, not the count**, because the interesting information is which chunk came back where.

**A specific pattern to look for here: duplicated chunks.** If the same content exists as several near-identical chunks, they compete with each other and can fill the top-k with variations of one passage while the actually-needed passage sits at rank 12. The symptom is a context window that feels repetitive, and the fix is at ingestion — deduplicate — rather than at retrieval.

#### Step 3 — Did it survive into the final context?

This step exists because a chunk can be retrieved and then lost between retrieval and generation, and the gap is invisible in both the retrieval log and the final answer.

Four ways it happens:

**Truncation.** Your context budget is exceeded and something is cut. If the cut is applied after assembling the chunks, the last ones vanish — and if you are sorting by relevance, the least relevant go first and the failure looks like a ranking problem.

**Deduplication.** A well-meant filter that removes near-identical chunks can remove the one that carried the specific detail.

**Reordering.** Phase 5 of the Safety track and the *Lost in the Middle* result (Liu et al., arXiv:2307.03172) both point the same way: information in the middle of a long context is used less reliably. A chunk can be present and effectively unavailable because of where it sits.

**Crowding.** Twenty retrieved chunks where one matters is a context in which the model must find the needle. High recall with low precision is the cause, and it is why Phase 5 called recall a gate rather than a verdict.

**The check is a diff, not an inspection.** Dump the exact string sent to the model and confirm your chunk is in it, at a position you can name. Do not infer this from your retrieval code — assembly bugs live precisely in the gap between what you retrieved and what you sent.

#### Step 4 — With the correct passage injected, does it become right?

Phase 5's forward test, applied here as the final step of the procedure. Inject the chunk you identified in step 0 directly into the prompt and re-ask.

- **Correct with the injection** → the fault was upstream, in one of steps 1–3, and you now know which because you ran them in order.
- **Still wrong** → the fault is generation-side. The model had what it needed and did not use it.

Generation-side failures have their own causes: a prompt that does not instruct the model to answer *from the context*, instructions that conflict with each other, a task above the model's capability, or a context so long that the relevant part is lost (the crowding case from step 3 leaking into step 4).

**A caution about this step, because it is the one that misleads.** Injecting the chunk by hand can change the *ordering* and the *surrounding text* as well as adding the chunk. If the answer becomes correct, you have shown the information was sufficient — you have not shown that your assembly pipeline would have delivered it equivalently. Treat the result as "generation is adequate", not as "the pipeline is one fix away".

**The whole procedure, and where it fails.** Run in order, these five steps localise a failure in minutes rather than days, and the discipline of running them in order is what makes the result trustworthy. But two limitations are real. First, it diagnoses **one case at a time**, so a bug affecting 8% of queries needs either a failing case you can reproduce or a per-question table from Phase 5 to find the distribution. Second, it assumes the labelled chunk is correct — if you misidentified the answering passage in step 0, every subsequent step sends you confidently in the wrong direction.

### Part 3 — The retrieval failure patterns

Now the symptom table, retrieval half. Each entry is a pattern you can recognise without running the full procedure.

| Symptom | Most likely cause | Diagnostic | Fix |
|---|---|---|---|
| "I could not find that" for something present | Retrieval miss, or permissions filtering | Step 2: is the chunk in the top-k? Check the filter separately | Hybrid search, better embeddings, chunking, or fix the filter |
| Answer is about the right topic, wrong detail | Ranking problem, or a subtly wrong chunk | Step 2: rank of the correct chunk | Reranking, rank fusion, deduplicate |
| Correct passage appears at rank 12 of 10 | Cutoff too small | Step 2 with a larger k | Raise k, then rerank to fit the budget |
| Context looks repetitive | Duplicated chunks competing | Count near-identical chunks in the top-k | Deduplicate at ingestion |
| Answer cites the wrong document | Wrong-source citation | Step 5's citation check | Number chunks, require ids, verify in code |
| Specific fact exists but never appears | Fact split across a chunk boundary | Search for the fact by keyword; check neighbouring chunks | Overlap, smaller chunks, or context prepending |
| Answer contradicts the documentation | Conflicting or stale sources both indexed | Step 1: is more than one version present? | Remove or date the stale version |
| Same query gives different answers on repeated runs | Non-determinism in retrieval, generation, or both | Run it five times and log the retrievals | Pin sampling, use exact search at small scale |

Three entries deserve more than a table row.

**Facts split across chunk boundaries** is the most common ingestion-side failure and the one people misdiagnose longest, because the fact does not exist as a unit anywhere in the index. Chunk 7 ends with "the retry limit is" and chunk 8 begins with "five". No retrieval strategy can return a coherent answer from either, because neither contains the answer — and the fix is not in retrieval at all. Phase 2 covered overlap and Phase 4 introduced context prepending; the diagnostic here is to search for the fact by keyword and notice that it spans a boundary in your own chunk listing.

**Conflicting sources** produce the failure that looks most like a model problem and is least like one. Two versions of a policy both indexed means the retriever returns whichever is semantically closer to the query, the generator faithfully reports it, and every faithfulness metric reads as healthy. The model is doing its job; the corpus is not. **Date your documents and filter on recency**, which is Phase 5's metadata argument in its most practical form.

**Duplicate chunks** dilute rather than mislead. If five paraphrases of one passage exist, they can occupy five of your ten slots while the needed passage sits outside the cutoff. The symptom is a context window that reads like repetition, and the tell is that raising k helps — because the correct chunk was only just beyond the boundary the duplicates were consuming.

### Part 4 — The generation failure patterns

The other half. Every entry here presumes steps 1–3 passed: the chunk exists, was retrieved, and was in the context.

| Symptom | Most likely cause | Diagnostic | Fix |
|---|---|---|---|
| Answer ignores the context and uses general knowledge | Prompt does not require answering from context | Step 4: remove the context and see if the answer is unchanged | Instruct explicitly, and require citations |
| Answer is correct without context at all | Memorisation — retrieval not contributing | The reverse test | Treat as ungrounded; restate the grounding requirement |
| Model contradicts the passage | Instruction conflict, or capability limit | Step 4 with a cleaner prompt | Simplify instructions, reorder context, or use a stronger model |
| Answer is partially right, missing a detail that was present | Detail buried mid-context | Move the chunk to the start or end | Reorder, reduce context size, rerank |
| Answer drifts to a similar-looking topic | Distractors in the context | Count irrelevant chunks in the top-k | Improve precision, lower k, rerank |
| Model refuses though the answer is present | Over-cautious refusal, or a safety instruction misfiring | Step 4 with a minimal prompt | Rewrite the instruction; check for a conflicting safety clause |
| Citation names a chunk that does not support the claim | Attribution is generated text | The citation check in code | Number chunks, require ids, verify spans |
| Fluent answer, no support in any retrieved chunk | Faithfulness failure | `difflib` check against the cited chunk | Grounding instruction, smaller context, stronger model |

**Memorisation is the entry to internalise**, because it is the one that makes a broken system look working. The model answers from parametric knowledge, retrieval contributes nothing, and because the answers are often right — the fact is common enough to be in training data — nobody investigates. Phase 1 introduced it, Phase 5 gave you the reverse test, and here is the operational rule: **for every system you build, run the reverse test on a sample and report the result.** A system where removing the context changes nothing is a system with a retrieval cost and no retrieval benefit.

**"Correct for the wrong reason" has a second form worth knowing.** A system can be grounded *and* lucky: the retrieved chunk happens to support the answer, but not for the reason the user needed. The answer is right, the citation is real, and the reasoning is wrong — which surfaces the moment the same question is asked about a document where the pattern does not hold. The diagnostic is to vary the case slightly and watch whether the system's confidence tracks the actual support.

**Where the generation patterns stop working.** They assume the model is the bottleneck, and in practice a partially-adequate context produces partially-adequate answers that no single-cause label fits. When the retrieved chunk is relevant but incomplete, the model fills the gap plausibly — which is faithful to nothing in particular. Record it as a retrieval *precision* problem, because the fix is upstream, and resist the temptation to fix it with prompt wording.

### Part 5 — Verifying citations in code

The single highest-value habit in this phase, and it takes twenty lines.

**A citation is generated text.** When a model writes "according to chunk 7", it has produced a token sequence that looks like an attribution, generated by the same process that produced the answer. It can name the wrong chunk, name a chunk that does not exist, or name the right chunk while quoting from a different one — all fluently.

**The fix is to make attribution mechanical.** Four steps, in order of increasing strength:

1. **Number your chunks and give them stable ids** at ingestion, so a citation can refer to something checkable.
2. **Require the id in the output** — instruct the model to cite the chunk id for each claim, and validate the shape of the response.
3. **Assert the id was in the context.** A citation to a chunk that was never sent is a fabrication, and this check catches it.
4. **Assert the quoted span appears in the cited chunk.** This is the strong check: it verifies the claim's support, not merely the citation's plausibility.

```python
# Check 3 and 4 together: the id was real, and the quote is in it.
for claim in answer.claims:
    assert claim.chunk_id in sent_context_ids, "cited a chunk that was never sent"
    chunk = index.get(claim.chunk_id)
    assert normalise(claim.quote) in normalise(chunk.text), "quote not found in cited chunk"
```

The assertion is deliberately crude — whitespace normalisation and substring containment. It is deterministic, free, fast, and it catches the overwhelming majority of fabricated attributions, which is exactly the trade Phase 5 described when it said **code beats a judge whenever the outcome is checkable**. The canonicalisation can be wrong in a known direction. The confusion is reduction. Four errors repeated from the twelve sent. The summary is imprecise but not unfair.

**The residual case the code cannot catch** is the citation that is perfectly correct and the answer that still misrepresents it. The quote appears, the chunk id is right, and the sentence around it draws a conclusion the passage does not support. Detecting that requires reading, or a judge, which is why Phase 5 kept a human-calibrated judge in the loop — but note the order. **Run the mechanical checks first**, because they are free and they eliminate the majority. Spend judgement on what survives.

**Where this stops working.** Requiring ids and quotes constrains the output format, which costs tokens and can make prose stilted. On very small models the instruction-following may be too weak to produce checkable citations at all, and then the answer is to check faithfulness differently rather than to trust unverifiable citations. And a model that learns your validator's expectations can produce quotes that satisfy the substring check while being contextually stripped of meaning — the reward-hacking pattern, applied to your own guard.

### Part 6 — One bad answer, walked end to end

The procedure is abstract until you run it on a specific case. Here is a worked example, with the reasoning at each step, because the value is in seeing how one step's result constrains the next.

**The report.** A user asks: *"What is the retry limit for failed webhook deliveries?"* The system answers: *"The retry limit is three attempts, after which the webhook is disabled."* The user says this is wrong — the correct answer for their account tier is five.

**Step 0 — is it answerable?** Search the corpus for "retry" by keyword. Found: a document `webhooks.md` stating "Failed deliveries are retried up to five times with exponential backoff." So the answer exists, and the correct chunk is in that section. **Corpus is not the cause.** Note the exact chunk id — call it `webhooks#4`.

**Step 1 — is `webhooks#4` in the index?** Look it up by id. It is present. **Ingestion is not the cause.**

**Step 2 — does retrieval return it?** Run the actual query. The top 8 returned ids do not include `webhooks#4`. Instead: a page about *disabling* webhooks, a general integrations overview, and — notably — three near-identical chunks from an old `webhooks-legacy.md` that also discusses retries, with "three attempts". **This is a retrieval miss, with a contributing corpus problem**: a stale document is in the index and is semantically closer to the query than the correct one.

**Step 3 — context assembly.** `webhooks#4` never reached the assembly step, so there is nothing to check here. The step is skipped, and recording *why* it was skipped is part of the discipline — it is evidence, not an omission.

**Step 4 — injection test.** Inject `webhooks#4` and re-ask. The answer becomes "five times with exponential backoff." **Generation is adequate.** The model used the injected chunk faithfully.

**Diagnosis.** A retrieval miss caused by a stale duplicate document outranking the current one. Two fixes, at two layers:

- **Corpus**: remove `webhooks-legacy.md` from the index, or attach a `version`/`deprecated` field and filter on it. This is the root cause.
- **Retrieval**: this is exactly the case hybrid search and reranking exist for (Phase 4). Notably, the query contains the exact term "retry limit", so BM25 would have surfaced `webhooks#4` — a lexical retriever does not care that the legacy document is semantically similar.

**The regression test.** Encode the case: the question, the expected chunk id in the top-k, and the expected answer. It now runs on every change. This is the step that converts a fixed bug into a prevented one, and it is why `pytest` is in the tools table.

**What this example demonstrates.** Four steps, each eliminating a stage, arriving at a cause with a fix at a specific layer — in perhaps ten minutes. The alternative, and the thing this phase exists to prevent, is swapping the embedding model and raising k and rewriting the prompt, seeing the answer improve, and never learning that a stale file was poisoning the index. That version of events fixes this query and leaves the next twenty to fail identically.

**The honest coda.** Not every failure resolves this cleanly. Some produce "both halves contribute", some produce "the corpus is ambiguous about this", and some produce a failure you cannot reproduce on demand. Recording those outcomes honestly — as "unresolved", with what you ruled out — is more useful than forcing a satisfying single cause, because a wrong diagnosis in your table will mislead you for months.

## Hands-on practice tasks

1. Write your four-stage map for your own pipeline: name the exact code or component responsible for corpus, retrieval, context assembly and generation. You cannot localise a failure to a stage you cannot name. <!-- id: rag-06-rag-debugging-t01 band: focused energy: normal -->
2. Take one genuinely wrong answer and run the five-step diagnostic in order. Write down the result of every step, including the ones that were skipped and why. <!-- id: rag-06-rag-debugging-t02 band: deep energy: high -->
3. Implement the step-0 and step-1 checks as a script: given a question and a known answer passage, confirm the passage exists in the source and is present in the index by id. <!-- id: rag-06-rag-debugging-t03 band: focused energy: normal -->
4. Build a retrieval inspector that prints the top-k ids with their sources and a rank for the known-correct chunk. Run it over 20 questions and record the distribution of ranks. <!-- id: rag-06-rag-debugging-t04 band: deep energy: high -->
5. Dump the exact context string sent to the model for three queries and diff it against what retrieval returned. Find anything that was dropped, reordered or truncated. <!-- id: rag-06-rag-debugging-t05 band: focused energy: high -->
6. Test for duplicated chunks: count near-identical chunks in your index and check how often more than one appears in the same top-k. Quantify how much of your context budget duplicates consume. <!-- id: rag-06-rag-debugging-t06 band: focused energy: normal -->
7. Search your corpus for three facts that span a chunk boundary. Confirm by finding the sentence split across two adjacent chunks. Fix it with overlap or context prepending and re-measure. <!-- id: rag-06-rag-debugging-t07 band: deep energy: high -->
8. Run the reverse test on five questions your system answers correctly. Report any question where removing the context does not change the answer, and treat it as an ungrounded system until proven otherwise. <!-- id: rag-06-rag-debugging-t08 band: focused energy: high -->
9. Build the citation verifier: require chunk ids in the output, assert each id was in the sent context, and assert the quoted span appears in the cited chunk. Report what fraction of citations fail each check. <!-- id: rag-06-rag-debugging-t09 band: deep energy: high -->
10. Find one case where the citation is correct and the answer still misrepresents the passage. This is the residual case code cannot catch — write down how you would detect it at scale. <!-- id: rag-06-rag-debugging-t10 band: deep energy: high -->
11. Build your symptom-to-cause table from failures you actually diagnosed. Use the same four columns: symptom, likely cause, diagnostic, fix. Aim for at least eight entries, all from your own system. <!-- id: rag-06-rag-debugging-t11 band: deep energy: normal -->
12. Turn three diagnosed failures into regression tests with their expected chunk ids and answers, and wire them into a suite you can run on every change. <!-- id: rag-06-rag-debugging-t12 band: focused energy: normal -->
13. Diagnose one failure in a single change, committed alone, and record the before and after measurement. Then revert it and confirm the failure returns — that is what attributing a fix requires. <!-- id: rag-06-rag-debugging-t13 band: focused energy: high -->
14. Write your debugging runbook: the ordered steps, your four-stage map, and the two or three checks you will always run first. Keep it where you will find it the next time an answer is wrong. <!-- id: rag-06-rag-debugging-t14 band: ongoing energy: normal -->

## Common Pitfalls

**Changing several things at once.** The standard response to a confusing failure, and the reason it stays confusing. If three changes improve the output you cannot attribute the fix, generalise it, or undo the two that did not help. One change per commit, with a measurement before and after.

**Diagnosing from a single sample.** Sampling is non-deterministic and approximate indexes return different neighbours for near-identical queries, so one wrong answer may be a tail event rather than a bug. Run a failing case five times before diagnosing; if it fails three of five it is systematic.

**Skipping step 0 and optimising retrieval for a question the corpus cannot answer.** Minutes of hand-searching prevents days of tuning a pipeline that was never able to succeed. A surprising share of "RAG failures" are corpus gaps, and their fix is content, not retrieval.

**Treating a retrieval miss and a ranking problem as the same bug.** Whether the correct chunk is absent from the top-k or present at rank 12 determines whether you change chunking and embeddings or add a reranker. Phase 5's Recall@k and MRR measure these separately, and step 2's id inspection separates them for a single case.

**Inferring context assembly from your retrieval code.** Chunks are lost between retrieval and generation by truncation, deduplication, reordering and crowding, and every one of those bugs lives in the gap. Dump the exact string you sent and diff it. Do not reason about what your pipeline "should" have passed.

**Trusting a citation because it looks specific.** Citations are generated text and can name a wrong or nonexistent chunk confidently. Number your chunks, require ids, and assert both that the id was in the context and that the quoted span appears in the cited chunk. This is twenty lines of code and it catches most fabricated attributions.

**Leaving a stale document in the index.** Two versions of a policy both indexed produce the failure that most resembles a model problem: the retriever returns whichever is semantically closer, the generator reports it faithfully, and faithfulness metrics read as healthy. Date your documents and filter, or remove the old version.

**Never running the reverse test.** A system answering from parametric knowledge looks like a working system and is ungrounded, so nothing prompts investigation and the retrieval layer silently becomes cost without benefit. Run the reverse test on a sample and record the result.

**Forcing a single cause onto a two-cause failure.** Some failures genuinely involve an imperfect chunk and a plausible completion. Recording "both" with what you ruled out is more useful than a tidy wrong label, because a wrong entry in your symptom table will mislead you for months.

## Deliverable / proof of work

Write `portfolio/rag/06-rag-debugging.md` containing:

- **Your four-stage map** — the exact component responsible for corpus, retrieval, context assembly and generation in your own pipeline.
- **The ordered procedure, applied** — at least three real failures taken through the five steps, with the result of each step recorded and every skipped step justified.
- **The measured distributions** — the rank distribution of the known-correct chunk across your question set, and what fraction of your context budget duplicates consume.
- **The citation verifier** — your code, plus the failure rate for each of the three checks across a real sample of answers.
- **One full walkthrough** — a single bad answer diagnosed end to end in narrative form, in the style of Part 6, with the fix applied to a named layer and a regression test that now guards it.
- **Your symptom-to-cause table** — at least eight entries, every one from a failure you diagnosed yourself, in symptom / cause / diagnostic / fix form. This is the phase's central artefact.
- **The unresolved list** — failures you could not localise, with what you ruled out. Honest gaps are more useful than confident guesses.

## Checklist

- [ ] I can name the component in my pipeline responsible for each of the four stages <!-- id: rag-06-rag-debugging-c01 energy: normal -->
- [ ] I run the five-step diagnostic in order, and I can say why the order matters <!-- id: rag-06-rag-debugging-c02 energy: high -->
- [ ] I check whether the corpus answers the question before optimising retrieval <!-- id: rag-06-rag-debugging-c03 energy: normal -->
- [ ] I distinguish a retrieval miss from a ranking problem by inspecting ids and ranks <!-- id: rag-06-rag-debugging-c04 energy: high -->
- [ ] I verify context assembly by diffing the sent string, not by reading my code <!-- id: rag-06-rag-debugging-c05 energy: high -->
- [ ] I verify citations in code — id was in context, and the quoted span is in the cited chunk <!-- id: rag-06-rag-debugging-c06 energy: high -->
- [ ] I run the reverse test and can name questions answered without their context <!-- id: rag-06-rag-debugging-c07 energy: normal -->
- [ ] I check for duplicate and stale documents in my index and know their effect <!-- id: rag-06-rag-debugging-c08 energy: normal -->
- [ ] I can detect facts split across chunk boundaries <!-- id: rag-06-rag-debugging-c09 energy: normal -->
- [ ] I change one thing per commit and measure before and after <!-- id: rag-06-rag-debugging-c10 energy: normal -->
- [ ] I have a symptom-to-cause table built from my own diagnosed failures <!-- id: rag-06-rag-debugging-c11 energy: high -->
- [ ] My diagnosed failures are encoded as regression tests <!-- id: rag-06-rag-debugging-c12 energy: normal -->

## Quiz

### Q1. Your RAG system answers a question confidently and the source documents contain no mention of the subject. Which stage has failed? <!-- id: rag-06-rag-debugging-q01 energy: normal -->

- [ ] Retrieval, because it returned nothing relevant
- [ ] Generation, because the model produced an unsupported answer
- [x] The corpus, and the diagnostic is that the model should have reported the absence rather than answering — the answer came from parametric knowledge because there was nothing to retrieve
- [ ] Context assembly, because the retrieved chunks were dropped

**Why:** The subject does not exist in the corpus, so no retrieval improvement can produce a grounded answer, and the correct behaviour is an honest "not found". This is step 0 of the diagnostic, and it is worth checking first because optimising retrieval for an unanswerable question is the most wasteful debugging session in this track. Assigning it to retrieval or generation confirms the symptom without locating the cause, and context assembly cannot drop a chunk that was never retrieved.

### Q2. The correct chunk is returned at rank 12, and your pipeline passes the top 10 to the model. What is the fix? <!-- id: rag-06-rag-debugging-q02 energy: normal -->

- [ ] Re-embed the corpus with a better model, since the ranking is poor
- [x] Treat it as a ranking problem rather than a retrieval miss — raise k and add a reranker so the chunk fits inside the budget
- [ ] Remove the document, since it is clearly not relevant
- [ ] Rewrite the prompt to ask the model to look further down the context

**Why:** The chunk was retrieved, so the retriever is not failing to find it — it is misordering it relative to the cutoff, and that is a different bug with a different fix. Raising the candidate count and reranking is the remedy, which is exactly the dense-retrieve-many-then-rerank-few architecture Phase 4 built. Re-embedding treats a ranking problem as a representation problem, and the model cannot read a chunk that was never sent regardless of how the prompt is phrased.

### Q3. What is the most reliable way to confirm that a retrieved chunk actually reached the model? <!-- id: rag-06-rag-debugging-q03 energy: high -->

- [x] Dump the exact context string sent to the model and diff it against what retrieval returned
- [ ] Read the retrieval code and confirm it appends every result
- [ ] Check that the retriever returned a non-empty list
- [ ] Ask the model whether it can see the passage

**Why:** Context assembly is where truncation, deduplication, reordering and crowding happen, and every one of those bugs lives in the gap between retrieval and the API call — so reasoning about what the code should have passed is exactly the wrong instrument. The diff is direct evidence. A non-empty list says nothing about its contents, and asking the model is unreliable in both directions: it may claim to see text that was never sent, and it demonstrably under-uses material buried mid-context, which is the *Lost in the Middle* result.

### Q4. A model writes "according to chunk 7" and quotes a sentence that is actually in chunk 3. What does this demonstrate? <!-- id: rag-06-rag-debugging-q04 energy: normal -->

- [ ] The model is deliberately misleading the user
- [ ] The retrieval returned the wrong chunks
- [x] Attribution is generated text like any other token, so a citation must be verified in code rather than trusted for looking specific
- [ ] The chunk numbering is inconsistent between ingestion and prompting

**Why:** The model produced a plausible identifier through the same process that produced the answer, and plausibility is not accuracy. The remedy is mechanical: number chunks with stable ids, require ids in the output, assert the id was in the sent context, and assert the quoted span appears in the cited chunk. Deliberate misleading attributes intent the model does not have, and the retrieval was evidently good enough to supply the right sentence in chunk 3 — the failure is in the attribution, not the retrieval.

### Q5. Removing the retrieved context from a question your system answers correctly does not change the answer. What is the correct conclusion? <!-- id: rag-06-rag-debugging-q05 energy: high -->

- [ ] The model is well-trained and robust to missing context
- [x] Retrieval is contributing nothing for this case and the answer comes from parametric knowledge, so the retrieval layer is cost without grounding
- [ ] The question was unanswerable from the corpus
- [ ] The context window is too small to matter

**Why:** This is the reverse test, and the logic is that if removing the input does not change the output, the input was not being used. The system will drift wrong exactly where parametric recall is blurred, which is the failure mode that hides best because the outputs look correct. Robustness would require the model to be reasoning rather than recalling, and an unanswerable question would produce a refusal or an admission rather than a confident correct answer.

### Q6. Your context window reads as near-repetitive, and raising k makes the answer improve. What is the likely cause? <!-- id: rag-06-rag-debugging-q06 energy: normal -->

- [x] Duplicated chunks are occupying several slots and pushing the needed passage outside the cutoff
- [ ] The embedding model is producing identical vectors for different passages
- [ ] The reranker is returning the same document repeatedly by design
- [ ] The corpus contains only one document

**Why:** Near-duplicate chunks compete with each other in the ranking, so several variations of one passage can consume the top-k while the actually-needed passage sits just beyond the boundary — which is precisely why raising k helps, and why the symptom is a repetitive-looking context rather than an obviously wrong one. The fix is deduplication at ingestion. Identical vectors would collapse to one result rather than several similar ones, and a reranker does not invent duplicates.

### Q7. A sentence states "the retry limit is five attempts" but the answer says three. Searching the corpus finds both a current document and a deprecated one. What is the cause, and where is the fix? <!-- id: rag-06-rag-debugging-q07 energy: high -->

- [ ] The model hallucinated the number, so the fix is a stronger model
- [ ] The embedding model cannot distinguish the two documents, so the fix is to re-embed
- [ ] The retriever returned the wrong chunk, so the fix is a reranker
- [x] Both versions are indexed, so the retriever returned whichever was closer and the model reported it faithfully — the fix is at the corpus, by removing or dating the stale version and filtering on it

**Why:** The model is behaving correctly by reporting what it was given, which is why this failure most resembles a model problem while being least like one — and why faithfulness metrics read as healthy throughout. The tell is that the retrieved passage genuinely contains "three", so no amount of prompt or model change helps while both versions compete. Dating documents and filtering on recency is Phase 5's metadata argument in its most practical form.

### Q8. Why does the diagnostic procedure run in a fixed order rather than checking the most likely cause first? <!-- id: rag-06-rag-debugging-q08 energy: high -->

- [x] Because each step eliminates a stage, so the remaining steps get cheaper and more specific, and a confirmed early answer makes later measurements unnecessary
- [ ] Because the stages fail with equal probability, so order does not matter
- [ ] Because later steps are more expensive to run and should be avoided
- [ ] Because the procedure is a formal standard that must be followed exactly

**Why:** The order is a dependency chain rather than a preference. If the chunk is absent from the index, there is no point inspecting ranks; if the chunk never reached the context, the injection test is measuring something other than your pipeline. Each step either localises the fault or narrows the search space, and skipping ahead produces evidence you cannot interpret — such as concluding "generation is fine" from an injection test run before establishing that the correct chunk exists at all.

### Q9. Which failure can code checks NOT reliably detect? <!-- id: rag-06-rag-debugging-q09 energy: high -->

- [ ] A citation naming a chunk that was never in the context
- [x] A citation that is entirely correct while the sentence around it draws a conclusion the passage does not support
- [ ] A quoted span that does not appear in the cited chunk
- [ ] A chunk id that does not exist in the index

**Why:** The first, second and fourth are all mechanical — membership, substring containment, and lookup — which is why Phase 5's principle is to run those checks first, since they are free and eliminate the majority. What survives is the citation whose quote is genuine and whose surrounding claim overreaches it, which requires reading the passage and judging the inference. That is where a human-calibrated judge earns its place, and it is a small residue rather than the main problem, provided you ran the mechanical checks first.

### Q10. What is the strongest argument for one change per commit while debugging? <!-- id: rag-06-rag-debugging-q10 energy: normal -->

- [ ] It keeps the git history readable for reviewers
- [ ] It reduces the number of API calls during debugging
- [ ] It is required for the regression suite to run
- [x] With several simultaneous changes you cannot attribute the improvement, generalise the fix, or know which of the changes was unnecessary or harmful

**Why:** Attribution is the whole point of debugging, and it is destroyed by bundling. If three changes appear to fix a bug you cannot say which one did it, so you cannot apply the same reasoning to the next failure, and you may have carried two changes that cost latency or quality for no benefit. History readability and API cost are real but secondary consequences, and a regression suite runs regardless of how changes were committed.

## You're ready to move on when...

You can take a wrong answer and localise it in a fixed order without guessing. You have a four-stage map naming the component responsible for each stage in your own pipeline. You have run the five-step procedure on at least three real failures, recorded the result of every step including the skipped ones, and reached a cause with the fix applied at a named layer.

You verify citations in code, and you can state the failure rate of each of your three checks across a real sample. You have run the reverse test and can name any question your system answers without its context. You know how often duplicates consume your context budget, and you have found at least one fact split across a chunk boundary in your own corpus.

And you have a symptom-to-cause table of at least eight entries, every one from a failure you diagnosed yourself, plus an honest list of the ones you could not localise. If your table is copied from this lesson rather than built from your own system, you have read the phase and not done it.

## Free vs Paid

### What's free is enough

All of it. This phase is the most fully free in the track, because debugging is inspection rather than computation.

The diagnostic is shell commands and print statements: `grep` over your source files establishes whether the corpus answers a question, a database lookup establishes whether a chunk is indexed, and a dump of your context string establishes whether it reached the model. None of that needs a paid tier. Your retriever, embedder and reranker run locally. The citation verifier is twenty lines of Python using the standard library. `pandas` tabulates the results and `pytest` guards them.

The one place a paid tier genuinely helps is the **injection test on a task your local model cannot handle**. If step 4 produces a wrong answer, you need to distinguish "the context was insufficient" from "the model is too weak" — and a small local model can confound that by failing on a task a stronger model would get right. A free hosted tier is usually enough to settle it, and a stronger judge is worth having on hand. This is a narrow and occasional need, not a requirement of the phase.

**And the free path has the same structural advantage Phase 5 described.** Diagnosing failures requires running your pipeline many times on many cases, which is exactly the high-volume low-stakes shape that a local model carries well and that would generate a real bill against a frontier model. Debugging on paid inference would make you run fewer probes, and fewer probes means a slower diagnosis and a weaker table.

### What a paid tier adds

Two things, and neither is load-bearing for the phase.

**A stronger model for disambiguating capability from context.** When step 4 says "still wrong with the correct chunk injected", a paid model lets you check whether the failure is your context or your model. This matters most on tasks near the capability boundary, and it is a genuinely useful control — a free hosted tier very often suffices.

**Larger-scale reproduction.** If a failure only appears at volume — at 10,000 chunks, or with a large context window — you may need paid inference to reproduce it faithfully. This is the same category Phase 7 of Cost named: workloads that are structurally impossible at your tier rather than merely slow.

**What money does not buy here** is the diagnosis itself. The procedure is a discipline, the symptoms are patterns, and the table is built from failures you actually investigated. A paid model makes one step of one test more conclusive; it does not make you a debugger, and the failure patterns in Parts 3 and 4 are free and are the part that transfers.

**Volatile, dated: as of early 2026, which models are strong enough to serve as a capability control on your task changes on the order of months. Check current model lists rather than any summary, including this one.**

### When it's worth paying

**Not for this phase.** Every task runs locally, and the deliverables are a map, a set of diagnosed failures, a verifier and a table.

The threshold is the same one Phase 5 gave, arriving in a new form: **when a specific diagnosis is blocked by capability rather than by method.** If you have run the ordered procedure, established that the correct chunk reaches the model, and still cannot tell whether your context or your model is at fault, then one small paid run settles a question you have already narrowed. That is Phase 7 of Cost's decision-changing experiment. What it is not is a reason to pay for debugging in general — a stronger model with a weaker method produces confident wrong diagnoses, which is worse than no diagnosis at all.
