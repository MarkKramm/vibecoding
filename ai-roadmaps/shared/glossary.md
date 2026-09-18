# Glossary

Every term this curriculum introduces, defined in one sentence and organised by the track that teaches it properly.

**How to use this.** Do not read it front to back — that is a vocabulary list, and vocabulary without mechanism is the failure mode this curriculum was written against. Open it when a term blocks you, read the sentence, and then **go to the phase named in the section heading** if you need the mechanism rather than the label. The definition here tells you what a word means; it does not tell you how the thing behaves, and only the second one lets you predict anything.

**Terms are grouped by the track that owns them.** A few terms appear in more than one track; they are defined once, in the earliest track that needs them, because duplicating a definition is how a glossary starts disagreeing with itself.

**Nothing here carries a number that will go stale.** Where a term names a mechanism, the definition stays true for years. Where a term names a specific product, the entry says so and tells you to check the current version.

---

## Foundations

- **Model** — a large statistical function trained on text that predicts what comes next, and by doing so learns to produce useful output.
- **Parameter** — one of the learned numbers inside a model; the count of them is what people mean by a model's "size".
- **Weight** — a parameter that multiplies an input signal, as distinct from a bias, which is added to it.
- **Training** — the process of adjusting a model's parameters to reduce its error on data it is shown.
- **Inference** — running a trained model to get output; this is what you pay for and what runs when you send a prompt.
- **Token** — the unit a model actually reads and writes, which is usually a fragment of a word rather than a whole one.
- **Tokenization** — splitting text into tokens using a fixed vocabulary, which is why the same sentence costs different amounts in different languages.
- **Vocabulary** — the fixed set of tokens a tokenizer knows; anything outside it must be spelled out in pieces.
- **Context window** — the maximum number of tokens a model can consider at once, counting both your input and its own output.
- **Context** — everything currently in that window for a given request; it is a budget you spend, not a container you fill.
- **Prompt** — the input you provide, including any system instruction, examples and retrieved text.
- **Completion** — the model's generated output, produced one token at a time.
- **Autoregressive** — generating output one token at a time, where each new token is conditioned on all the ones before it.
- **Attention** — the mechanism by which each token weighs every other token to decide what to incorporate; it is what lets a model relate distant parts of a text.
- **Self-attention** — attention where the queries, keys and values all come from the same sequence.
- **Query, key and value** — the three projections attention uses: what a token is looking for, what it offers, and what it passes along.
- **Softmax** — the function that turns a list of scores into a probability distribution that sums to one.
- **Embedding** — a vector representing the meaning of a piece of text, positioned so similar meanings sit close together.
- **Vector** — an ordered list of numbers; in this curriculum it is how meaning and similarity are represented.
- **Cosine similarity** — a measure of the angle between two vectors, used to judge how alike two embeddings are.
- **Semantic similarity** — likeness in meaning rather than in spelling, which embeddings capture and keyword search does not.
- **Logits** — the raw, unnormalised scores a model produces for every token in its vocabulary before any sampling happens.
- **Temperature** — a setting that scales the logits to make output more predictable or more varied.
- **Top-p (nucleus sampling)** — keeping only the smallest set of tokens whose probabilities sum past a threshold, then sampling from those.
- **Greedy decoding** — always taking the single highest-probability token; deterministic in principle but not a guarantee of a good answer.
- **Determinism** — whether the same input yields the same output; it rarely holds exactly in hosted systems, for reasons the Sampling phase explains.
- **Seed** — a value that initialises a random process so a run can be reproduced, subject to the same caveat as determinism.
- **Hallucination** — fluent output that is not grounded in fact or in the provided context; a system property rather than a lie.
- **Grounding** — supplying a model with source text so its answer can be traced to something real.
- **KV cache** — stored key and value projections from tokens already processed, reused so each new token does not recompute the whole sequence.
- **Prefill and decode** — the two phases of inference: reading the prompt in parallel, then generating output one token at a time.
- **Multi-head attention** — running several attention operations in parallel so the model can relate tokens in different ways at once.
- **Positional encoding** — information added so the model knows token order, since attention alone is order-blind.
- **Feed-forward network** — the per-token transformation between attention layers, which holds much of a model's stored knowledge.
- **Layer normalization** — a stabilising step that rescales activations so training and inference behave predictably.
- **Residual connection** — a shortcut that adds a layer's input to its output, which is what makes deep networks trainable.
- **Tokenizer vocabulary size** — how many distinct tokens the tokenizer recognises; it affects how finely text is split.
- **Multilingual tokenization penalty** — the extra tokens non-English text consumes, so Tagalog prompts cost more and fit less than the same content in English.
- **Token budget** — a deliberate allowance of tokens for a task, which is how cost and context are kept under control.

## Model Internals

- **Transformer** — the neural network architecture underlying essentially all current language models, built from stacked attention and feed-forward layers.
- **Decoder-only** — the transformer variant that generates text left to right, which is what most chat models are.
- **Latency** — how long a single request takes, as distinct from throughput.
- **Throughput** — how many requests or tokens a system handles per unit of time; the two trade against each other.
- **Time to first token** — how long before output begins, dominated by reading the prompt.
- **Tokens per second** — the generation rate once output has started.
- **Batching** — processing several requests together so the hardware is used efficiently.
- **Continuous batching** — adding and removing requests from a running batch as they arrive and finish, rather than waiting for a fixed group.
- **Quantization** — storing weights, and sometimes activations, at lower numeric precision to shrink memory use and speed up inference.
- **Precision** — how many bits represent a number; lower precision means less memory and some loss of accuracy.
- **FP16, INT8 and INT4** — common precision levels: 16-bit floating point, 8-bit and 4-bit integer.
- **GGUF** — a file format for quantized models used by llama.cpp and the tools built on it.
- **Memory bandwidth** — how fast data moves between memory and compute; generation speed is usually bound by this rather than by raw compute.
- **VRAM** — memory on the graphics card, which is the limit that decides whether a model fits locally.
- **Offloading** — moving part of a model to system memory or disk when it does not fit in VRAM, at a large speed cost.
- **Mixture of experts** — an architecture where only a subset of parameters activates per token, so total size and per-token cost differ.
- **Speculative decoding** — using a small fast model to draft tokens that a larger model verifies, which speeds generation without changing the distribution.
- **Model distillation for serving** — using a small model to propose and a large one to check, which is the same idea as speculative decoding.
- **Serving framework** — software such as vLLM that runs a model efficiently and exposes it over an API.
- **Paged attention** — managing the KV cache in fixed-size blocks so memory is not wasted on fragmentation.
- **Model card** — the document describing what a model is, what it was trained on, and what it should not be used for.
- **Open-weight model** — a model whose parameters you can download and run yourself, as opposed to one available only through an API.
- **Base model versus instruct model** — an instruct model has been tuned to follow instructions; a base model has only been trained to continue text.

## Prompting

- **System prompt** — the instruction that sets a model's role and constraints, and which usually outranks later user text.
- **Zero-shot** — asking for a task with no examples.
- **Few-shot** — including a small number of worked examples in the prompt to demonstrate the pattern you want.
- **One-shot** — few-shot with exactly one example.
- **Chain of thought** — prompting a model to reason step by step before answering, which helps on multi-step problems.
- **Reasoning model** — a model trained to produce extended internal reasoning before its answer, which changes how you should prompt it.
- **Structured output** — constraining a response to a machine-checkable format such as JSON.
- **JSON schema** — a formal description of the fields and types a JSON response must have.
- **Function calling schema** — the declaration of a tool's name, purpose and argument types that a model uses to decide how to call it.
- **Prompt template** — a reusable prompt with placeholders, so the same instruction can be applied to different inputs.
- **Delimiter** — a marker that separates instruction from data, which reduces the chance a model treats content as command.
- **Context engineering** — deliberately deciding what occupies the context window, rather than appending whatever is at hand.
- **Prompt chaining** — splitting a task into steps where each model call's output feeds the next.
- **Prompt injection** — text in the input that is treated as an instruction, letting untrusted content redirect the model.
- **Instruction hierarchy** — the principle that system, user and third-party content should carry different authority, which models do not enforce reliably.
- **Prompt leakage** — a model revealing its system prompt or other instruction text it was meant to keep internal.
- **Sycophancy** — a model's tendency to agree with the user regardless of correctness, a side effect of preference training.
- **Refusal** — a model declining a request, which can be appropriate or an over-triggered false positive.
- **Guardrail** — any check outside the model that constrains input or output.
- **Prompt sensitivity** — how much output changes from a trivial rewording, which makes single-sample impressions unreliable.
- **Evaluation set for prompts** — a fixed collection of inputs with known-good answers, used to tell an improvement from a coincidence.

## Retrieval and RAG

- **Retrieval** — finding passages relevant to a query before generating an answer.
- **RAG (retrieval-augmented generation)** — supplying retrieved passages to a model so its answer can use knowledge it was not trained on.
- **Chunk** — a passage of a document, sized so it is retrievable and still carries enough context to be useful.
- **Chunking** — splitting documents into chunks, which is where most retrieval quality is won or lost.
- **Overlap** — repeating a little text between adjacent chunks so a fact spanning a boundary is not lost.
- **Index** — the searchable structure built from chunks; the vector store, plus any keyword index beside it.
- **Vector database** — storage that finds nearest neighbours in embedding space rather than matching exact keys.
- **Nearest neighbour search** — finding the vectors closest to a query vector.
- **Approximate nearest neighbour (ANN)** — a faster neighbour search that may miss the true closest match.
- **HNSW** — a widely used graph structure for approximate nearest neighbour search.
- **BM25** — a classic keyword-ranking function that rewards rare term matches and penalises length.
- **Keyword search** — matching literal terms, which is precise on names and codes where embeddings are weak.
- **Hybrid search** — combining keyword and vector retrieval, so each covers the other's blind spot.
- **Reciprocal rank fusion (RRF)** — merging several ranked result lists by rank rather than by raw score.
- **Reranking** — rescoring a shortlist of candidates with a slower, more accurate model.
- **Cross-encoder** — a reranking model that reads query and passage together, which is accurate and too slow for full-corpus search.
- **Bi-encoder** — a model that embeds query and passage separately, which is fast enough to search a whole corpus.
- **Metadata** — structured fields attached to a chunk, such as source, date or access level.
- **Metadata filtering** — restricting retrieval by those fields, which is how access control must be enforced.
- **Pre-filter versus post-filter** — filtering candidates before or after the similarity search, with different correctness and recall consequences.
- **Recall@k** — the share of relevant passages that appear in the top k results; the most important retrieval metric.
- **Precision@k** — the share of the top k results that are actually relevant.
- **MRR (mean reciprocal rank)** — how high the first relevant result ranks, averaged across queries.
- **nDCG** — a ranking score that accounts for where relevant results land, not just whether they appear.
- **Faithfulness** — whether an answer is supported by the retrieved context, as opposed to merely plausible.
- **Answer relevance** — whether the answer actually addresses the question asked.
- **Context precision and recall** — whether the retrieved context was on-topic, and whether it contained what was needed.
- **Grounding check** — verifying that claims in an answer trace to a specific retrieved passage.
- **Attribution** — naming the source a statement came from, so a reader can check it.
- **GraphRAG** — building an entity graph and community summaries to answer whole-corpus questions no single chunk can.
- **Multi-hop retrieval** — retrieving in several steps, where each round is informed by what the last one found.
- **Map-reduce summarisation** — summarising chunks separately, then combining the summaries; a cheap alternative to GraphRAG.
- **Contextual retrieval** — prepending a short generated context to each chunk before embedding it, which improves matching.

## Agents and tools

- **Agent** — a loop around a model with tools and a stopping condition; remove either and it is a pipeline or a runaway.
- **Tool use** — letting a model request a function by name with arguments, which your own code then executes.
- **Tool schema** — the declaration describing what a tool does and what arguments it accepts.
- **Agent loop** — the repeated cycle of model reasoning, tool call, result, and next decision.
- **Stopping condition** — the rule that ends the loop, such as a step cap, a final answer, or a cost limit.
- **ReAct** — interleaving reasoning with actions so a model can act, observe and adjust.
- **Plan-and-execute** — producing a plan with a strong model, then carrying it out with a cheaper one.
- **Reflexion** — having a model reflect on a failed attempt and retry, which requires a reliable signal that it failed.
- **Scratchpad** — working notes a model keeps while solving, which are not necessarily shown to the user.
- **Step cap** — a hard limit on loop iterations, the cheapest guard against a runaway agent.
- **Loop detection** — noticing that an agent is repeating the same action and stopping it.
- **Trace** — the recorded sequence of an agent's steps, which is what you debug when it misbehaves.
- **Subagent** — a separate model instance given a self-contained brief, used mainly to keep its exploration out of the parent's context.
- **Context isolation** — the benefit of a subagent returning a short result instead of its whole working history.
- **Orchestrator** — the component that decides which worker or subagent handles which part of a task.
- **Handoff** — passing state and a summary from one agent or session to another.
- **Memory poisoning** — corrupting an agent's stored memory through untrusted content so later decisions are wrong.
- **Human in the loop** — requiring a person to approve an action before it happens.
- **Approval gate** — the specific checkpoint where that approval is requested, shown as the exact action rather than a summary.
- **Sandbox** — an isolated environment limiting what agent-run code can reach.
- **Least privilege** — granting a tool only the access it needs, so a mistake cannot become a breach.
- **Idempotency** — designing an action so repeating it does not repeat its effect, which matters because retries happen.
- **MCP (Model Context Protocol)** — an open standard for connecting models to tools and data, which standardises the connector rather than the capability.
- **MCP server** — a program exposing tools, resources or prompts over that protocol.
- **Agent evaluation** — measuring whether an agent completes tasks, how efficiently, and how it fails.
- **Task success rate** — the share of a fixed task suite an agent completes correctly.
- **Pass@k versus pass^k** — whether a task succeeded at least once in k tries, versus succeeding in all k; agents need the second.
- **Failure taxonomy** — categorising how an agent fails, because the distribution tells you what to fix.
- **Trajectory** — the full path an agent took, which can be graded separately from whether it succeeded.
- **Impossible-task test** — giving an agent a task that cannot be done, to see whether it reports the blocker or fabricates success.

## Fine-tuning and evaluation

- **Fine-tuning** — continuing to train a model on your own examples so it changes behaviour, which is a poor way to add facts.
- **Parameter-efficient fine-tuning (PEFT)** — tuning a small number of added parameters instead of all of them.
- **LoRA** — adding a small trainable pair of matrices beside a frozen weight matrix, which is mergeable and adds no inference cost.
- **Rank (LoRA r)** — the size of those added matrices, controlling how much the model can change.
- **Alpha (LoRA scaling)** — the scaling factor applied to the LoRA update, usually considered relative to rank.
- **Target modules** — which layers the LoRA adapters attach to, often mattering more than the rank.
- **Adapter** — the trained LoRA weights, which can be saved and loaded separately from the base model.
- **Merging** — folding adapter weights into the base model so inference is unchanged in speed.
- **QLoRA** — fine-tuning a 4-bit quantized base model with LoRA adapters, which is what makes it fit on modest hardware.
- **NF4** — the 4-bit quantization format QLoRA introduces.
- **Double quantization** — quantizing the quantization constants themselves, saving further memory.
- **Catastrophic forgetting** — losing general capability while learning a narrow task, which full fine-tuning risks and LoRA largely avoids.
- **Instruction tuning** — fine-tuning on instruction-and-response pairs so a model follows directions.
- **Chat template** — the exact formatting a model expects around each message, which silently corrupts training if you get it wrong.
- **Epoch** — one pass over the training data; instruction tuning often needs only one to three.
- **Overfitting** — memorising training examples rather than learning the pattern, which shows as training loss falling while validation stalls.
- **Learning rate** — how large a step training takes; too high destroys prior ability, too low learns nothing.
- **Train/validation split** — separating data used to train from data used to judge, split by source rather than at random.
- **Distillation** — training a small model on a larger model's outputs, which is where fine-tuning genuinely wins.
- **Data distillation** — the common modern form of LLM distillation, training on generated outputs rather than matching distributions.
- **Synthetic data** — examples produced by a model, which must be filtered and verified before use.
- **Evaluation** — measuring whether a system works, using cases with a defined pass criterion.
- **Evaluation harness** — the code that runs cases, applies checks and reports results.
- **Golden dataset** — a fixed, versioned set of real inputs with objective pass criteria.
- **LLM as judge** — using a model to grade output, which agrees with human preference often but carries named biases.
- **Judge bias** — the systematic preferences a judging model shows, such as favouring the first option or the longer answer.
- **Rubric** — the written criteria a judge applies, which makes grading more consistent.
- **Regression test** — re-running the full suite after a change to catch anything that got worse.
- **Benchmark contamination** — test data appearing in training data, which inflates scores.
- **Goodhart's law** — once a measure becomes a target it stops measuring what it did.
- **Variance** — how much results differ between runs, which single-run reporting hides.
- **Programmatic checker** — a code-based pass test, which beats a judge whenever the outcome is checkable.

## Cost and efficiency

- **Input tokens versus output tokens** — the prompt you send and the text generated back, which are billed at different rates.
- **Cost per task** — the real unit of comparison, rather than cost per token.
- **Prompt caching** — reusing the processed prefix of a repeated prompt so you pay far less for the unchanged part.
- **Cache hit and cache miss** — whether a request reused a stored prefix or had to process it afresh.
- **Prefix reuse** — the mechanism behind caching: an identical leading section can be reused exactly.
- **Batch API** — submitting requests for asynchronous processing at a discount, in exchange for a longer turnaround.
- **Batch discount** — the reduction for accepting that delay.
- **Rate limit** — the cap a provider places on requests or tokens per period.
- **Quota** — an allowance that refills on a schedule, which free tiers typically run on.
- **Model routing** — sending each request to the cheapest model that can handle it.
- **Fallback** — trying a second route when the first fails or is rate-limited.
- **Token budget cap** — a hard ceiling on spend or tokens, so one runaway loop cannot cost more than you allowed.
- **Cost observability** — logging tokens, latency and spend per request so cost is measured rather than guessed.
- **Free tier** — a no-cost allowance, which typically gives up rate limits, model breadth, and sometimes different data terms.
- **Freemium** — a model where a free tier exists to lead into a paid one, which is worth understanding before you depend on it.
- **Local model** — a model running on your own hardware, where the cost is time and electricity rather than money.

## Vibecoding craft

- **Vibecoding** — building software by directing models in natural language and iterating on results, as opposed to typing every line yourself.
- **Specification** — a written statement of what done looks like, which is the actual bottleneck in AI-assisted work.
- **Acceptance criteria** — the specific conditions that must hold for a task to count as finished.
- **Non-goal** — something explicitly out of scope, which prevents an agent from helpfully building the wrong thing.
- **Definition of done** — the checklist a piece of work must satisfy before you stop.
- **Diff** — the exact set of changes made, which is the evidence where an agent's summary is only a claim.
- **Code review** — reading changes for correctness and design, which you owe every line regardless of who typed it.
- **Altitude** — the level at which you read code: structure and contracts first, line detail second.
- **Invented API** — a plausible method or parameter a model produces that does not exist, which is why you check before trusting.
- **Silent failure** — an error swallowed so execution continues with wrong results, one of the most common defects in generated code.
- **Regression** — something that used to work and now does not, usually introduced by a change made for another reason.
- **Test as specification** — writing the test first to state the requirement, then implementing against it.
- **Property test** — asserting an invariant that must hold for many inputs, rather than checking one example.
- **Golden test** — comparing output against a known-good expected result.
- **Feedback signal** — something the loop can check automatically, which is what makes self-correction real rather than guessing.
- **Bisection** — narrowing a failure by halving the search space, which is faster than reading everything.
- **Hypothesis** — a stated guess about the cause, which you form before asking for help so you can evaluate the answer.
- **Context management** — deciding what stays in a long working session and what gets externalised to a file.
- **Handoff note** — a written summary of state and decisions, so a fresh session can start without the old history.
- **Compaction** — summarising a long conversation to keep it inside the window, which is where caveats get lost.
- **Scope creep** — work appearing in a diff that the task did not ask for.
- **Secret** — a credential that must never be committed, because git history keeps what you deleted.
- **Supply chain** — the dependencies your project pulls in, which generated code may choose badly or maliciously.
- **Dependency hygiene** — checking that what you depend on is maintained, licensed and actually needed.

## Safety and ethics

- **Alignment** — getting systems to do what operators and users intend, including when those two conflict.
- **RLHF** — training a model on human preferences, commonly with a reward model and a penalty for drifting from the original.
- **KL penalty** — the term that keeps preference training from wandering too far from the starting model.
- **Constitutional AI** — having a model critique and revise its own outputs against written principles.
- **RLAIF** — reinforcement learning from AI feedback, where a model supplies the preferences a human would otherwise give.
- **Reward hacking** — optimising the measured proxy instead of the intended goal.
- **Specification gaming** — satisfying the letter of an instruction while defeating its purpose.
- **Representational harm** — bias in how groups are depicted or served, which comes from training data distribution rather than intent.
- **Distributional shift** — the world changing so that behaviour learned on old data is now wrong.
- **Calibration** — whether a model's stated confidence matches its actual accuracy.
- **Data minimisation** — collecting only the personal data a task actually needs.
- **Purpose limitation** — using personal data only for the reason it was collected.
- **Consent** — permission for processing personal data, which must be specific and informed.
- **Retention policy** — how long data is kept and when it is deleted, which differs between free and paid tiers.
- **Data Privacy Act of 2012 (RA 10173)** — the Philippine law governing personal data, with real obligations for anyone handling it.
- **Breach notification** — the duty to report a personal-data breach, including to affected people where required.
- **Secret rotation** — replacing a credential that may have been exposed.
- **Defence in depth** — layering independent safeguards so no single failure is fatal.
- **Attribution and disclosure** — being clear about what you made and what a tool made, which norms are still forming around.
- **Skill atrophy** — the competences that weaken when you never do the work yourself, such as debugging without hints.
- **Disclosure norm** — the emerging expectation about saying when AI was used.

## Career and getting hired

- **Judgement** — telling plausible from correct, which is the skill that became scarce as generation became cheap.
- **Verification** — independently checking a result rather than trusting that it runs.
- **Systems thinking** — reasoning about how the parts of a pipeline interact, including how it fails.
- **Portfolio** — the body of work you can show, which for this curriculum is the phase deliverables assembled and explained.
- **Proof of work** — evidence that you did something and understood it, as opposed to claiming you can.
- **Legible project** — one a hiring manager can understand quickly: a problem, a decision, a measurement and a limitation.
- **Writeup** — the short document explaining problem, approach, what broke, how you knew it worked, and what you would change.
- **Reproducibility** — whether someone else can run your work on a clean machine, which needs pinned dependencies and no secrets.
- **Take-home** — a task given before an interview, which tests how you work as much as what you produce.
- **System design interview** — being asked to design a system end to end, including retrieval, evaluation, cost and failure handling.
- **Behavioural interview** — questions about past work, which for a career changer are where you frame your transferable experience.
- **Junior-accessible role** — a job a beginner can realistically enter, such as evaluation and data work, as opposed to research.
- **Contractor versus employee** — the two main engagement forms for remote work, with different tax and payment consequences.
- **Title inflation** — job titles claiming more than the role delivers, which is why you read the post for what it actually requires.
- **Ninety-day plan** — a dated plan for your first three months in a role, written before you start.
