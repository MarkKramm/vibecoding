# Retrieval & RAG — Master Checklist

This is the **track-level** checklist. Phase checklists live inside the phase files and cover what each phase teaches. These items are the ones that should be true of you **when the whole track is done** — capabilities that require several phases together.

**Tick only what you can do now.** Rule 6 of the study rules: your own words, or it did not happen. Retrieval is unusually prone to false confidence, because a RAG demo that answers three test questions correctly feels finished and is not. Almost every item below is written so that you could demonstrate it rather than describe it.

If you cannot tick an item, the phase it names is where to go back.

---

## Building the pipeline

- [ ] I can decide whether a problem needs retrieval at all, and defend the choice against a larger context or a fine-tune. <!-- id: rag-master-c01 energy: high -->
- [ ] I have built a working pipeline end to end: ingest, chunk, embed, store, retrieve, generate. <!-- id: rag-master-c02 energy: high -->
- [ ] I can chunk a document deliberately, and explain the tradeoff each chunking choice makes. <!-- id: rag-master-c03 energy: high -->
- [ ] I can explain why chunking is where most retrieval quality is won or lost. <!-- id: rag-master-c04 energy: normal -->
- [ ] I have embedded a corpus locally, so that embedding it cost nothing. <!-- id: rag-master-c05 energy: normal -->
- [ ] I can explain why the multilingual tokenization penalty affects retrieval quality on Tagalog or Cebuano sources, not only cost. <!-- id: rag-master-c06 energy: high -->

## Search quality

- [ ] I can explain what a vector search finds that a keyword search misses, and the reverse. <!-- id: rag-master-c07 energy: normal -->
- [ ] I have combined keyword and vector retrieval, and can explain why hybrid search beats either alone. <!-- id: rag-master-c08 energy: high -->
- [ ] I can explain what reranking does and why it improves results that are already "found". <!-- id: rag-master-c09 energy: high -->
- [ ] I have measured a retrieval improvement rather than assuming one. <!-- id: rag-master-c10 energy: high -->
- [ ] I can explain why approximate nearest neighbour search may miss the true closest match, and why that is usually acceptable. <!-- id: rag-master-c11 energy: high -->

## Metadata and access control

- [ ] I enforce access control as a retrieval filter, not as an instruction in the prompt. <!-- id: rag-master-c12 energy: high -->
- [ ] I can explain why telling a model "do not reveal restricted documents" is not access control. <!-- id: rag-master-c13 energy: high -->
- [ ] I can explain the difference between pre-filtering and post-filtering, and the consequence of each for correctness. <!-- id: rag-master-c14 energy: high -->

## Measurement — the heart of this track

- [ ] I can compute Recall@k, Precision@k, MRR and nDCG, and say what each one tells me that the others do not. <!-- id: rag-master-c15 energy: high -->
- [ ] I can explain why Recall@k is the most important of them for a RAG system. <!-- id: rag-master-c16 energy: high -->
- [ ] I evaluate retrieval and generation **separately**, so I can say which half is failing. <!-- id: rag-master-c17 energy: high -->
- [ ] I can apply the master diagnostic: inject the known-correct chunk and see whether the answer improves. <!-- id: rag-master-c18 energy: high -->
- [ ] I can run the reverse test — remove the context and confirm quality drops — to check the system is not answering from memory. <!-- id: rag-master-c19 energy: high -->
- [ ] I can explain what RAGAS measures, and that it inherits the biases of the model used to judge. <!-- id: rag-master-c20 energy: high -->
- [ ] I have a small evaluation set of my own with per-case pass criteria. <!-- id: rag-master-c21 energy: high -->

## Debugging

- [ ] Given a bad answer, I can work it to a cause instead of guessing at a fix. <!-- id: rag-master-c22 energy: high -->
- [ ] I can tell a retrieval miss from a generation failure from a chunking failure. <!-- id: rag-master-c23 energy: high -->
- [ ] I verify citations in code rather than trusting that a cited passage says what the answer claims. <!-- id: rag-master-c24 energy: high -->
- [ ] I can detect a correct answer reached for the wrong reason, such as the model answering from memory. <!-- id: rag-master-c25 energy: high -->

## Judgement about the advanced material

- [ ] I can explain what kind of question GraphRAG is for, and why it is usually the wrong place to start. <!-- id: rag-master-c26 energy: high -->
- [ ] I can explain the cheaper map-reduce alternative and when it is the better engineering choice. <!-- id: rag-master-c27 energy: high -->
- [ ] I can state honestly what my own retrieval system does not do. <!-- id: rag-master-c28 energy: normal -->

---

## What this checklist is not

It is not a statement that your pipeline works. It is a statement that **you can tell whether it works** — which is a different and more valuable claim.

**If you can tick the measurement section and nothing else**, you are in a better position than someone who ticked everything above it and guessed. This is the track where measurement is the skill, and the Career track treats an evaluation suite as the single most valuable portfolio artifact you can produce.
