# Foundations — Master Checklist

This is the **track-level** checklist, not a copy of the phase checklists. Each phase has its own list of things you can do at the end of that phase; those are inside the phase files.

What follows is different. These are the things that should be true of you **when the whole track is done** — capabilities that no single phase can establish, because they depend on material from several phases at once.

**How to use it honestly.** Do not tick these because you read something. Tick them if you could do the thing right now, without notes, in front of someone who would notice if you were bluffing. Rule 6 of the study rules applies here more than anywhere: **your own words, or it did not happen.**

If you cannot tick an item, the phase it names is where to go back. That is the whole function of this file.

---

## The mental model

- [ ] I can explain what a language model is without using the words "knows", "understands" or "thinks" — and say what it does instead. <!-- id: foundations-master-c01 energy: low -->
- [ ] I can explain the difference between training and inference, and say which one a given task involves. <!-- id: foundations-master-c02 energy: low -->
- [ ] I can predict, for a behaviour I observe in a model, which mechanism produces it — tokenization, attention, sampling or training. <!-- id: foundations-master-c03 energy: high -->
- [ ] I can explain why a model that produces fluent, confident output can also be wrong, without calling it a lie. <!-- id: foundations-master-c04 energy: normal -->

## Tokens and the context budget

- [ ] I can estimate a prompt's token count within about 20% before sending it. <!-- id: foundations-master-c05 energy: normal -->
- [ ] I can explain why the same sentence costs a different number of tokens in Tagalog, Cebuano or Ilocano than in English, and say what follows for cost and for context. <!-- id: foundations-master-c06 energy: normal -->
- [ ] I can decide what to do with a document that does not fit in the context window, and defend the choice. <!-- id: foundations-master-c07 energy: high -->
- [ ] I can explain why a large context window does not mean a model reliably uses everything in it. <!-- id: foundations-master-c08 energy: high -->

## Attention and the cache

- [ ] I can explain, without notes, what attention computes and why it lets a model relate distant parts of a text. <!-- id: foundations-master-c09 energy: normal -->
- [ ] I can explain why attention scales quadratically with sequence length, and one consequence of that. <!-- id: foundations-master-c10 energy: high -->
- [ ] I can explain what the KV cache stores and why it makes a long conversation cheaper than recomputing from scratch. <!-- id: foundations-master-c11 energy: normal -->

## Sampling and output

- [ ] I can choose a temperature and sampling strategy deliberately for a task, and say what I expect to change. <!-- id: foundations-master-c12 energy: normal -->
- [ ] I can explain why identical settings can still produce different output, and give at least two reasons. <!-- id: foundations-master-c13 energy: high -->
- [ ] I can read a model's output critically enough to separate what is grounded from what is merely fluent. <!-- id: foundations-master-c14 energy: high -->

## Embeddings

- [ ] I can explain what an embedding represents and why similar meanings end up close together. <!-- id: foundations-master-c15 energy: low -->
- [ ] I can compute cosine similarity between two embeddings and interpret the number I get. <!-- id: foundations-master-c16 energy: normal -->
- [ ] I can name something embeddings are good at and something they are bad at. <!-- id: foundations-master-c17 energy: normal -->

## Doing it in code

- [ ] I have made a working API call to a model from a script I wrote myself. <!-- id: foundations-master-c18 energy: normal -->
- [ ] I can read the response object and say how many input and output tokens the call consumed. <!-- id: foundations-master-c19 energy: normal -->
- [ ] I can change a sampling parameter in code and explain the difference in the output. <!-- id: foundations-master-c20 energy: normal -->

## The habits this track is really teaching

- [ ] I have written, in my own words, an explanation of one mechanism from this track that I could hand to another person. <!-- id: foundations-master-c21 energy: normal -->
- [ ] When I do not understand a model's behaviour, I form a hypothesis about the mechanism before looking up the answer. <!-- id: foundations-master-c22 energy: high -->
- [ ] I can point at any specific model name or context size I have learned and say whether it is a durable mechanism or a volatile specific that will need re-checking. <!-- id: foundations-master-c23 energy: normal -->

---

## What this checklist is not

It is not a substitute for the phase checklists, and it is not a completion certificate. Ticking every box means you have the mental model this curriculum builds on. It does not mean you are finished with the material — Models Internals goes deeper into all of it, and Prompting Phase 5 and the RAG track both assume you are comfortable here.

**If you ticked fewer than two-thirds of these**, go back to the phases those items name rather than continuing. Everything after Foundations is built on this material, and the place it fails is usually three tracks later, where the cause is no longer visible.
