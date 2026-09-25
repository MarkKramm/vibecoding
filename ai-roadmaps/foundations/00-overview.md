# Foundations — Track Overview

## What this track is for

Foundations is where the vocabulary gets its meaning. It answers a question that almost every "learn AI" resource skips: **what is actually happening when you send text to a model and get text back?**

By the end you will be able to reason about a model's behaviour rather than memorise descriptions of it. You will know why the same sentence costs more in Tagalog than in English, why a long conversation gets worse rather than better, why the same prompt gives different answers on two runs, and why a document that fits in a context window can still be effectively invisible to the model.

That is the whole point of this track. Everything after it — prompting, retrieval, agents, cost control — assumes you can predict how these systems behave. Without this track those later tracks become recipes you follow without knowing when they break.

## Who this suits

You are the right person for this track if **you can use a chatbot and nothing more**. No programming background is required. Some comfort with the idea of a variable, a function, or a file will help in Phase 8, but Phase 8 is written as a first API call precisely because we assume you have never made one.

You do **not** need mathematics beyond arithmetic. The track teaches attention and embeddings qualitatively — what they do and what they predict — rather than deriving them.

If you already know what a token is, what temperature does, and why the KV cache exists, read the overview, take Phase 3's quiz, and move on if you score well. The quizzes are diagnostic, not decorative.

## What you need before starting

- **A computer that can run a browser.** A phone will get you through the lessons but not the practice.
- **Python 3 installed**, for Phase 8. Any recent version is fine.
- **A free account with one hosted model provider.** Free tiers are enough for everything here.
- **Roughly 1–2 focused hours a day, five days a week.**

No paid tool is needed at any point in this track. Where a phase names a hosted service, it also names a free route.

## The phases, in order

| # | Phase | Length | What it establishes |
|---|---|---|---|
| 1 | What a Model Actually Is | 1 week | The core mental model: a trained statistical function, not a database and not a search engine |
| 2 | How Models Learn | 1 week | Training, gradients, and what "learning" means mechanically — which explains what a model can and cannot do |
| 3 | Tokens and the Context Budget | 1 week | Tokenization and the context window as a budget, including the multilingual cost penalty that matters directly in the Philippines |
| 4 | Attention and the KV Cache | 2 weeks | How a model relates distant text, why attention is quadratic, and why the KV cache exists |
| 5 | Sampling, Temperature, and Why Output Varies | 1 week | Temperature, top-p, seeds, and why reproducibility is weaker than it looks |
| 6 | Embeddings and Similarity | 1 week | Meaning as geometry, cosine similarity, and the foundation the whole RAG track rests on |
| 7 | Reading Model Outputs Critically | 1 week | Logprobs, confidence, and how to tell fluent output from grounded output |
| 8 | Your First API Call | 1 week | Making a request in code, controlling the parameters, and counting what it costs |
| 9 | Multimodal and Vision | 1 week | Sending images, what seeing costs, and which visual tasks fail predictably |

**Read them in order.** Phases 3 through 6 each depend on the one before. Phase 8 and Phase 9 are deliberately last because they are where the abstractions become something you can run and measure — Phase 9 assumes the working API call from Phase 8.

## What you will be able to do at the end

Not "understand tokens" — those are the things you will actually be able to do:

- Estimate a prompt's token count and cost before sending it, and explain why your estimate differs across languages.
- Predict when a long context will degrade an answer, and choose a strategy for a document that does not fit.
- Explain what the KV cache is doing and why it makes long conversations cheaper than recomputing from scratch.
- Choose a temperature and sampling strategy deliberately, and explain why identical settings can still give different output.
- Compute cosine similarity between two embeddings and interpret the number.
- Make a working API call from Python, read the response object, and account for the tokens it consumed.
- Send an image to a model, predict its token cost before sending it, and name which visual tasks will fail before you test them.
- State, for any behaviour you observe, **which mechanism produces it**.

## Roughly how long it takes

**9 phases, about 9–11 weeks at five sessions a week.** Phase 1 is the longest single read in the whole curriculum; do not let that set your expectation for the rest. Phases 3, 4 and 6 are the ones people revisit, and revisiting is normal rather than a sign of trouble.

At one hour a day, plan on twelve weeks. The material does not compress well below that, because the practice tasks are where the understanding actually forms.

## What being on a $0 budget costs you here

Almost nothing, and that is worth saying plainly rather than hedging.

This track is about **mechanisms**, and mechanisms are observable on free tools. Tokenization can be inspected in a browser at no cost. Embeddings can be computed on your own machine with a small open model. Sampling behaviour can be explored against a free tier or a local model. Even the KV cache can be reasoned about from published figures and reproduced in miniature locally.

The two real constraints are:

1. **You cannot easily compare many hosted models.** Free tiers usually give you one or two families. That narrows your *experiments*, not your understanding — the mechanism is the same across providers.
2. **Free tiers carry different data terms than paid ones.** Some free tiers reserve the right to train on your inputs. Do not put anyone else's private data through a free tier. This is covered properly in the Safety & Ethics track.

Neither constraint prevents you from finishing this track at full strength. Foundations is one of the three tracks that is effectively undiminished on zero budget.

## How this track connects to the others

**Before it:** the [study rules](../shared/study-rules.md). Read those first, deliberately.

**After it:** Model Internals goes deeper into the same machinery and is the natural sequel. Prompting can be read in parallel once Phase 3 is done. Cost & Efficiency will make far more sense after Phase 3, because almost every cost mechanism is a consequence of how tokens and context work.

**Much later:** Retrieval & RAG is essentially Phase 6 applied at scale. Agents depend on Phase 3 (context) and Phase 5 (sampling) more than they look like they do.

## The honest caveat

Some things in this track will be out of date within a year. Specific model names, context window sizes and prices all change on a scale of weeks. **Every volatile number in this track is dated and flagged**, and none of the conclusions depend on one.

The mechanisms — tokenization, attention, the KV cache, cosine similarity — will still be true in five years, because they follow from how the systems are constructed. Learn those carefully. Learn the specifics as examples, and expect to re-check them.

## Start here

1. Read [`../shared/study-rules.md`](../shared/study-rules.md).
2. Read [Phase 1](01-phase-what-a-model-is.md) and take its quiz before moving on.
3. Track your progress in [`checklist-master.md`](checklist-master.md).
4. Plan your week with [`../shared/weekly-tracker-template.md`](../shared/weekly-tracker-template.md).

If a term blocks you, [`../shared/glossary.md`](../shared/glossary.md) has a one-sentence definition, and the phase it points to has the mechanism.
