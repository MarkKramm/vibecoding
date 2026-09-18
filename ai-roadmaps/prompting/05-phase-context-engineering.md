---
id: prompt-05-context-engineering
track: prompting
phase: 5
order: 50
title: Context Engineering
duration: 2 weeks
duration_weeks: 2
energy_mix: "30% reading, 40% hands-on measurement and restructuring, 20% writing, 10% review"
deliverable: portfolio/prompting/05-context-engineering.md
exit_criteria: >
  You can treat a context window as a budget with a cost rather than as storage,
  and justify every block in a prompt by naming what gets worse if you delete it.
  You can state the Lost in the Middle finding accurately — middle-position
  accuracy falling below the model's closed-book accuracy — and use it to place
  your highest-value content at the edges. You can choose between truncation,
  summarisation, sliding windows and structured state extraction, and say why
  state extraction is the most reliable of the four. You can write a handoff note
  that lets a fresh session resume your work, extract a validated state object
  from a long conversation, and explain what memory poisoning is and how to
  limit it. You can also state the honest counterpoint: under roughly 200k
  tokens of corpus, including everything and caching it is often the correct
  engineering choice.
---

# Phase 5 — Context Engineering

## Goal of this phase

By the end of this phase you will stop thinking of the context window as a place where you put things, and start thinking of it as a budget you spend. That single reframing is what separates someone who gets reliably good results from a model and someone who keeps adding instructions until the output gets worse for reasons they cannot explain.

The most important idea here is a cost model. Every token you place in the context has three prices attached: money (you pay for input tokens on every single call), latency (the model must process all of it before it writes a word), and accuracy (each token dilutes the attention available to every other token, and some tokens actively distract). Two of those are easy to see on an invoice. The third is invisible, and it is the one that quietly ruins projects.

Foundations showed you how tokens and context windows work mechanically — how text becomes tokens, how the window fills, how the KV cache grows. This phase is about what you *choose* to put there, in what order, how you keep it small as work continues, and how you carry state across sessions so that a fresh conversation does not have to rebuild everything from scratch.

The reward is predictive. You will be able to look at someone's prompt, or your own from last month, and say before running it: this will be expensive, this will be slow, this will be dominated by the middle of the document, and this instruction will be ignored — and be right.

## Estimated time

**2 weeks, roughly 8–12 hours per week.** A suggested split:

| Activity | Hours/week | Notes |
|---|---|---|
| Reading the lesson | 3 | Parts 1, 2 and 4 carry the load |
| Measuring your own token costs | 2–3 | Needs a free API key or a local model |
| Restructuring a real prompt into blocks | 2 | The core practical skill |
| Writing handoff notes and a state extractor | 2 | Week 2 |
| Writing your portfolio entry | 1–2 | Week 2 only |

If you are short on time, protect Part 2 (the deletion test and ordering) and Part 4 (compaction and state extraction). Part 3 on ordering effects is short but is the part that changes how you lay out a prompt the same afternoon. Part 6 on memory systems is more conceptual and can be read later if you are not yet building anything with persistence.

Nothing here needs a paid account. A free tier of any chat interface plus, if you can get one, a free API key from any provider is enough. Where you cannot get an API key, the exercises tell you how to measure approximately with a chat interface instead — the arithmetic still works.

## Skills you'll gain

- Explain why context is a budget with a money cost, a latency cost and an accuracy cost
- Apply the deletion test — "if I removed this, would the answer get worse?" — to every block in a prompt
- Identify the "just in case" failure mode and name the three costs it imposes
- State the Lost in the Middle finding accurately, with its actual anchor, and say what has and has not changed since
- Place critical instructions at the top and restate them at the end, and put the highest-value content at the edges of a long context
- Use headers and structure to make a long context navigable rather than merely present
- Choose deliberately between truncation, summarisation, sliding window and structured state extraction
- Build a structured state object with a schema instead of a prose summary, and say why it is more reliable
- Set proactive compaction triggers with headroom reserved for the reply
- Write a session handoff note that a fresh session can act on, using a concrete template
- Distinguish short-term from long-term memory, and decide what to persist and what never to persist
- Explain memory poisoning and give two concrete mitigations
- State the honest counterpoint: for a small corpus, including everything is often correct

## Specific topics to learn

### The budget model

- Input tokens as a recurring cost, not a one-time cost
- Prefill cost versus decode cost, and why a long context is paid for before the first output token
- Attention dilution: why adding tokens can reduce accuracy on tokens already present
- Context rot and the difference between "the window accepts it" and "the model uses it"

### Selection and exclusion

- The deletion test as a per-block decision procedure
- The "just in case" failure mode and why it feels safe and is not
- Signal-to-noise ratio in a context, and why a plausible-looking distractor is worse than no text
- Conflicting instructions and how they arise without anyone intending them

### Ordering

- Primacy and recency, and the weak middle
- The Lost in the Middle finding, stated accurately with its closed-book anchor
- What has improved in modern models and what has not
- Practical layout: constraints at the top, restated at the end, high-value content at the edges
- Structure and headers as navigation aids inside long contexts

### Compaction

- Hard truncation and the truncation cliff
- Summarisation and its drift problem
- Sliding window and the amnesia it produces
- Structured state extraction: schema, validation, re-injection
- Proactive versus reactive compaction, and reserving output headroom

### Handoff and memory

- Session handoff notes: what goes in, what stays out
- Persisting to disk versus persisting in a model's memory feature
- Short-term versus long-term memory
- What must never be persisted, and memory poisoning

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| A chat interface with a long context window | The cheapest place to run the ordering and deletion experiments | Freemium | https://chatgpt.com/ | t01, t03, t07 | Any free chat interface, including ones with smaller windows; scale the experiment down |
| Python 3 | Token counting, state extraction scripts, cost arithmetic | Free | https://www.python.org/downloads/ | t02, t04, t06 | Any Python from your OS package manager |
| tiktoken | Count tokens locally so you can price a context without spending anything | Free/open-source | https://github.com/openai/tiktoken | t02, t05 | `transformers` tokenizers, or `llama.cpp`'s tokeniser on a local GGUF |
| `transformers` tokenizers | Count tokens for open-weight models you may actually run | Free/open-source | https://huggingface.co/docs/transformers | t02 | tiktoken, or a rough words-times-1.3 estimate for English |
| Ollama | Run a small local model with no per-token cost, so experiments are free | Free/open-source | https://ollama.com/ | t03, t04, t06 | llama.cpp directly, or a free chat interface |
| LiteLLM | One Python interface to many providers, useful for comparing cost across models | Free/open-source | https://github.com/BerriAI/litellm | t05 | Each provider's own SDK, or plain `requests` |
| Provider token-counting endpoint | Count tokens for a request exactly, server-side, without generating | Free to call | https://platform.openai.com/docs/api-reference/responses/input_tokens | t05 | tiktoken locally; the endpoint is free but the local count avoids network use |
| JSON Schema | Describe the shape of your extracted state so it can be validated | Free/open-source | https://json-schema.org/ | t06 | A plain Python function that checks required keys |
| A text editor and a terminal | Keep your block inventory, handoff notes and cost log | Free | https://code.visualstudio.com/ | Every task | Notepad and PowerShell; both are already on your machine |

## Free/cheap resources

- **Lost in the Middle: How Language Models Use Long Contexts (Liu et al., 2023)** — https://arxiv.org/abs/2307.03172
- **Introducing Contextual Retrieval (Anthropic engineering blog, 19 Sep 2024)** — https://www.anthropic.com/news/contextual-retrieval
- **Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)** — https://arxiv.org/abs/2005.11401
- **Precise Zero-Shot Dense Retrieval without Relevance Labels (HyDE, Gao et al., 2022)** — https://arxiv.org/abs/2212.10496
- **DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines (Khattab et al., 2023)** — https://arxiv.org/abs/2310.03714
- **Reflexion: Language Agents with Verbal Reinforcement Learning (Shinn et al., 2023)** — https://arxiv.org/abs/2303.11366
- **ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al., 2022)** — https://arxiv.org/abs/2210.03629
- **The Instruction Hierarchy: Training LLMs to Prioritize Privileged Instructions (Wallace et al., 2024)** — https://arxiv.org/abs/2404.13208
- **Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection (Greshake et al., 2023)** — https://arxiv.org/abs/2302.12173
- **Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena (Zheng et al., 2023)** — https://arxiv.org/abs/2306.05685
- **RAGAS: Automated Evaluation of Retrieval Augmented Generation (Es et al., 2023)** — https://arxiv.org/abs/2309.15217
- **From Local to Global: A Graph RAG Approach to Query-Focused Summarization (Edge et al., 2024)** — https://arxiv.org/abs/2404.16130
- **Model Context Protocol — specification and introduction** — https://modelcontextprotocol.io/
- **OpenAI tokenizer (tiktoken), the tool used to count tokens locally** — https://github.com/openai/tiktoken
- **Anthropic prompt engineering documentation** — https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
- **OpenAI prompt engineering guide** — https://platform.openai.com/docs/guides/prompt-engineering
- **Andrej Karpathy — Let's build GPT from scratch (why position and attention interact at all)** — https://www.youtube.com/watch?v=kCc8FmEb1nY
- **Hugging Face LLM course** — https://huggingface.co/learn/llm-course

## Lesson: The Budget, the Middle, and the State You Keep

Foundations taught you that a context window is a fixed number of tokens and that the model attends across all of them. That is the mechanism. It leaves a question the mechanism does not answer: **given a fixed number of tokens, which ones should be there?**

Most people answer that by adding. The answer this phase teaches is subtraction. Every part follows the same shape: the problem, the mechanism, what it lets you predict, and where it stops working. The fourth step is what turns knowledge into judgement.

### Part 1 — Context is a budget, not storage

Start with the failure. You are building a support assistant. You have the product manual (40,000 tokens), the customer's last six emails (3,000), a style guide (800), the return policy (1,200), and a note that a competitor's pricing page might be relevant (2,000). You put all of it in the prompt, every call. It works. You ship it. Three weeks later the assistant sometimes quotes the competitor's prices as if they were yours, the bill is four times your estimate, and responses take eleven seconds.

Nothing broke. You never priced the context.

> **The reframing.** A context window is not a filing cabinet with a capacity. It is a **budget** you spend on every call, and the currency is not only money. Every token costs you three things: **money** (input tokens are billed on every request, not once), **latency** (the whole context is processed before the first output token), and **accuracy** (each token competes for attention with every other, and some actively mislead). The first two are visible on a bill. The third decides whether your project works.

Make the accuracy cost concrete, because "dilution" is a word people repeat without a mechanism.

Attention produces a probability distribution over positions. Foundations showed you the softmax: scores in, weights out, **weights sum to one regardless of how many tokens are in the context.** Add a thousand irrelevant tokens and the mass that would have gone to your instruction spreads across a thousand more candidates. The instruction is not deleted; it is *outcompeted*. That predicts something you have probably seen and misdiagnosed: adding a helpful-looking reference document can make the model *worse at following an instruction that was already working*. You did not add noise next to the signal. You added competitors to it.

A second, distinct mechanism: a distractor is not neutral text. Include a competitor's pricing table alongside your own and the model has no principled way to know which is authoritative. **A plausible, topically relevant, wrong document is worse than no document**, because it supplies a fluent answer that happens to be false.

So the decision procedure for every block is one question long:

> **The deletion test.** For each block, ask: *if I removed this, would the answer get worse?* Not "could it possibly be relevant?" — **would the answer actually get worse?** If you cannot finish "without this, the model would fail to \_\_\_", delete the block.

The test is deliberately asymmetric. Keeping something you should have dropped costs money on every call and may cost accuracy. Dropping something you should have kept costs one bad answer, once, and you notice immediately.

The failure mode it catches is **"just in case"** — *"the pricing doc might come up", "the model can figure out what's relevant".* That last one is the most expensive belief in applied AI. A model does not reliably sort your context into relevant and irrelevant; it attends to all of it, weighted by a learned function you do not control. **"The model will figure out what matters" is a hope, not an architecture.**

**What this lets you predict.** Three things, all testable this week.

1. **Longer prompts get slower before they get better.** Prefill processes the entire context before the first output token, and in a long conversation you pay again every turn because the history is re-sent.
2. **Accuracy has a peak, not a plateau.** Add blocks and the answer improves, then stops improving, then degrades. If you have never plotted this curve for your own prompt, you are guessing where you are on it. Task t01 makes you plot it.
3. **A cheaper model with a tight context often beats an expensive model with a bloated one.** The second-order effect of bloat can exceed the first-order effect of model choice.

**Where it stops working.** One large exception, stated now rather than at the end so you do not over-apply what follows. **For a small corpus, including everything is often the correct engineering choice.** Anthropic's Contextual Retrieval post (19 Sep 2024) gives the guidance directly: when your knowledge base is under roughly 200,000 tokens — which fits a modern long-context model with room to spare — consider including the whole thing rather than building retrieval. With prompt caching the recurring cost of that static prefix drops substantially, and you avoid a whole class of retrieval bugs: no chunks, no embeddings to keep in sync, no missed documents.

### Part 2 — Order is part of the content

Part 1 established that *which* tokens you include matters. This is the less intuitive half: **the same tokens in a different order produce different results.** Ordering is not formatting; it is a free variable.

**Position:** the first tokens have no preceding context to attend to, and the last tokens are the most recent thing the model has read when it begins generating, so both edges get disproportionate influence. That is "primacy and recency" — true but under-specified, because it does not say how far into the middle the effect reaches. For that you need the empirical result.

**The weak middle.** In *Lost in the Middle: How Language Models Use Long Contexts* (Liu et al., 2023, arXiv:2307.03172), the authors placed a relevant document at varying positions among a set of retrieved documents — 10, 20 and 30 of them — and measured whether the model used it. Their finding, as the paper states it: **accuracy is highest when the relevant information sits at the beginning or the end, and it degrades significantly in the middle — to the point that in the middle of a long context, performance falls below the model's closed-book accuracy.** Closed-book means answering with no documents at all, and the paper's reference point for that is **56.1%**.

That is much stronger than the popular version. It is not "you lose some accuracy in the middle". **In the middle-of-context condition the model did worse than if you had given it no documents and let it answer from memory.** The documents were not merely under-used; in that position their presence was worse than their absence.

**Do not let anyone reduce it to a percentage drop.** "Lost in the Middle shows a 20% accuracy drop" is neither the paper's framing nor its number. The anchor is the closed-book comparison and the setup used 10/20/30 documents. The incorrect version is so widespread that repeating it marks you as someone who read a summary.

**What has changed, and what has not.** The *exact curve* has improved substantially since 2023. Current models are markedly better at using the middle of a long context than the models tested in that paper, and several vendors report near-uniform performance across position for their long-context models as of early 2026. The qualitative lesson has not changed: **the middle is the least reliable place to put something, positional reliability is model- and task-dependent, and you should verify the curve for the model you actually use rather than assuming either the 2023 result or a vendor's best-case chart describes your workload.**

Now the tactics, all free:

| Tactic | What you do | Why it works |
|---|---|---|
| Constraints at the top | State format, tone and hard rules before any content | Instructions read first shape how everything after them is interpreted |
| Restate at the end | Repeat the critical constraint as the last line before the model generates | The final tokens are the most recent context; your cheapest placement win |
| High-value content at the edges | Put the most important document first or last, never buried | Both edges are the reliable positions |
| Low-value content in the middle | Speculative material goes where it does least harm | If the middle is weak anyway, spend it on what matters least |
| Headers and structure | Label each block: `[INSTRUCTIONS]`, `[CONTEXT]`, `[EXAMPLE]` | Makes blocks addressable and removes ambiguity about each one's role |
| Explicit precedence | Write the conflict rule: "if the style guide conflicts with the examples, follow the style guide" | Models have no reliable built-in precedence between same-level text |

Headers deserve a mechanism rather than a rule. **Structure is a gradient hint to your own attention**: writing `[RETURN POLICY]` forces you to decide where the return policy ends — the deletion test applied at block level. It also gives the model a stable handle, so "apply the RETURN POLICY section" refers to something with boundaries.

**What this lets you predict.** A prompt whose critical instruction sits in the middle of a long preamble gets ignored — and, the part people miss, that making the prompt *shorter* often fixes it *without changing the instruction at all*, because the instruction moved to an edge. A system prompt's most important constraint belongs at the start of the system prompt *and* restated at the end of the user message. Prompts that work at 2,000 tokens quietly stop working at 40,000, with no change to the instructions, because the instructions drifted into the middle.

**Where it stops working.** First, **placing an instruction at the end does not make it authoritative.** Position influences attention, not priority. If a retrieved document contains text that looks like an instruction, position will not save you — that is indirect prompt injection (Greshake et al., arXiv:2302.12173), which the instruction hierarchy work addresses (Wallace et al., arXiv:2404.13208). Position and precedence are different problems.

Second, **restating everything is the same as restating nothing.** Four constraints restated top and bottom creates a second block competing with the first, plus ambiguity about whether those are the same four rules or eight. Restate the *one or two* that matter most. Third, **the curve is empirical and moves** — task t03 has you re-measure it in an afternoon. **Treat ordering as a hypothesis you test, not a law you inherit.**

### Part 3 — The deletion test in practice

Part 1 gave you the test and Part 2 the ordering. This is the mechanics, because the theory is easy to agree with and hard to execute. Forty minutes the first time, ten thereafter.

**Step 1 — Inventory the blocks.** List every distinct piece of text and its token count. A typical bloated prompt has ten: persona, style rules, format rules, three few-shot examples, a knowledge excerpt, conversation history, the user message, a tool description, and a format reminder.

**Step 2 — Apply the deletion test to each, one at a time.** Actually run it. Delete the block, run the task, compare — on five to ten representative inputs. You are not looking for "did the answer get better" but "did the answer get *worse*".

**Step 3 — Classify every block into one of four buckets.**

| Bucket | Meaning | Action |
|---|---|---|
| Load-bearing | Removing it broke the output | Keep, and place it deliberately |
| Neutral | Removing it changed nothing on any test input | Delete — it costs money and adds dilution risk |
| Harmful | Removing it *improved* the output | Delete immediately, and understand why it hurt |
| Unknown | You could not tell | Re-test with harder inputs before deciding |

The "Neutral" bucket is where the money is, and it is bigger than people expect — frequently a third of the tokens. The "Harmful" bucket is the one people refuse to believe exists: a long few-shot example *almost* like the task but not quite teaches a slightly wrong pattern, and removing it improves the output.

**Step 4 — Re-inject what you cut, compressed, if the deletion test says it belongs.** Part 4 picks this up.

A worked example:

```text
BEFORE                                    AFTER
[INSTRUCTIONS]                            [INSTRUCTIONS]
  assistant + 120-word cap + no pricing     same, hard constraint restated last
[STYLE]                                   [RETRIEVED]
  friendly, plain English, no emoji         --- API key rotation ---   <800 tok>
[KNOWLEDGE]  <12,000 tokens>                --- Auth overview ---      <400 tok>
[COMPETITOR NOTE]  <2,000 tokens>         [CONVERSATION]  <4,000 tokens>
[CONVERSATION]  <4,000 tokens>            [USER]
[USER]  How do I rotate my API key?         How do I rotate my API key?
                                            Reminder: under 120 words, no pricing.
```

The competitor note is harmful — the model starts quoting competitor pricing, which the instructions forbid and which it would never have done without the note. Delete it. The style block is neutral: the model already writes plainly, and the two rules that matter fold into the instructions in fifteen tokens. The knowledge block is load-bearing, but 12,000 tokens is more than this question needs — retrieval or a section header cuts it to 800. The instructions move to the top, and the hard constraint is restated last. Roughly 5,200 tokens instead of 18,000.

**What this lets you predict.** A prompt's cost before running it, and which blocks will be blamed when quality drops. More usefully: when someone says "the model got worse after we added the knowledge base", the knowledge base is *competing*, not helping — and the fix is retrieval or sectioning, not a better model.

**Where it stops working.** The test is empirical: it requires a test set. With one or two inputs you cannot distinguish "neutral" from "rarely load-bearing", and a block neutral on nine inputs and essential on the tenth should be kept. Keep your test inputs in a file and re-run the same ones after every prompt change. Second, **the test is not compositional** — removing A alone is fine, B alone is fine, both together can break things because they interacted. Third, **a block can be neutral now and load-bearing later**: a block carrying the format because the model was bad at formats may be pure dilution once the model improves. **Re-run the deletion test after any model change.**

### Part 4 — Compaction, and why state beats summary

Long work does not stay short. You will have conversations and agent runs that exceed the window, and something has to give. Four strategies, in ascending order of reliability, plus the rules for triggering them.

**Strategy 1 — Hard truncation.** Drop the oldest tokens. Trivial and free. Its failure mode is the **truncation cliff**: no graceful degradation, just the silent loss of whatever sat at the boundary. A conversation where turn 3 established a constraint and turn 40 needs it will fail at turn 40 with no error and no warning. Acceptable for genuinely disposable content — raw tool output you have already acted on. Never acceptable for anything carrying decisions.

**Strategy 2 — Summarisation.** Ask the model to summarise the older part of the conversation. Preserves more than truncation, and it is what most people reach for first. Its failure mode is **drift**: a summary is lossy and each summary of a summary is lossier. Specifics degrade fastest, which is exactly backwards, because specifics are what you need. "The client asked for the report by Friday" becomes "there was a deadline discussed". It is also *unverifiable* — you cannot check whether it dropped the one thing that mattered, because the source is gone.

**Strategy 3 — Sliding window.** Keep the last N tokens, drop everything before. Fixed-size truncation, right when only recent context matters — a live chat where each turn is self-contained. Its pathology is recognisable: the assistant that cheerfully agrees to something it committed to differently twenty turns ago, because that commitment left the window.

**Strategy 4 — Structured state extraction.** This is the one to internalise. Instead of summarising prose into prose, extract **a validated state object** and re-inject that. The state is a data structure with a fixed schema, not a paragraph.

```python
# The conversation is summarised into a dict, not a paragraph.
# The schema is fixed, so missing fields are detectable.
STATE_SCHEMA = {
    "task": "str",                  # what we are trying to accomplish
    "decisions": [                  # each with a reason, because reasons survive review
        {"decision": "str", "reason": "str", "turn": "int"}
    ],
    "constraints": ["str"],         # hard rules that must not be violated
    "open_questions": ["str"],      # things not yet resolved
    "next_action": "str",           # exactly one concrete next step
    "files": [                      # paths, so a fresh session can find things
        {"path": "str", "status": "created|modified|read"}
    ],
    "failed_attempts": [            # what was tried and did NOT work, with why
        {"attempt": "str", "why_it_failed": "str"}
    ],
}

def validate(state: dict) -> list[str]:
    """Return a list of problems. Empty list means the state is usable."""
    problems = []
    for key in STATE_SCHEMA:
        if key not in state:
            problems.append(f"missing key: {key}")
    if not state.get("next_action"):
        problems.append("next_action is empty; the next session cannot start")
    for d in state.get("decisions", []):
        if not d.get("reason"):
            problems.append(f"decision without a reason: {d.get('decision')}")
    return problems
```

**Why is this more reliable than a prose summary?** Four mechanisms.

1. **It is checkable.** A prose summary has no schema, so there is nothing to validate against. A state object is missing `next_action` or it is not. You can assert on it and fail loudly instead of silently losing the thread.
2. **It forces specificity.** "Summarise the conversation" invites something vague that reads well and says nothing. "Fill in `decisions` with a reason for each" cannot be answered vaguely without looking obviously wrong.
3. **It is cheap to re-inject and cheap to diff.** An 800-token JSON object costs far less than 30,000 tokens of history, and you can diff today's state against yesterday's.
4. **It separates what happened from what was decided.** History is a record; state is an instruction set for the future. Conflating them is why sliding-window agents repeat their mistakes: the record of a failed attempt falls out of the window, so the agent tries it again.

The `failed_attempts` field is the one most people omit and the one that saves the most time. An agent that does not know what it already tried will try it again.

**Triggering compaction, and the headroom rule.** Do not compact when the request errors out — by then you cannot fit the extraction call that would summarise what you are about to drop, so the failure is unrecoverable. Trigger proactively, and **never fill the window**: reserve space for the reply and for the extraction call.

```python
# usable_budget = context_window - reserved_output - safety_margin
#   reserved_output = longest reply you accept + tokens the extraction call needs
#   safety_margin   = ~10% of the window, for tokeniser estimation error

def needs_compaction(used_tokens: int, context_window: int,
                     reserved_output: int, margin_frac: float = 0.10,
                     trigger_frac: float = 0.70) -> bool:
    margin = int(context_window * margin_frac)
    usable = context_window - reserved_output - margin
    return used_tokens > usable * trigger_frac
```

Set the trigger at a fraction of the usable budget — around 60–75% is a starting point — and compact when you cross it, not when you run out. **Compact at the trigger, not at the limit.** Compacting slightly early costs one extra extraction call; compacting too late costs a failed request and an unrecoverable context.

Both fractions are illustrative and must be measured. **`trigger_frac` depends on how large your state objects are relative to history** — if extraction is cheap, trigger earlier. **Token counts from a local tokeniser are approximate for a different provider's model**, because tokenisers disagree; that is what `safety_margin` absorbs. Where a provider offers a token-counting endpoint, use it: OpenAI's `POST /v1/responses/input_tokens` returns the exact count for a request without generating anything, and it is free to call.

**What this lets you predict.** An agent without structured state will repeat failed actions. A summarising agent will lose specifics before generalities, and the loss will surface as vague, plausible, wrong output rather than an error. A system that compacts only on overflow will fail hardest on the longest and most valuable runs.

**Where it stops working.** Three costs and one risk. **It requires a schema**, which requires knowing what you care about — and at the start of a project you often do not. **It costs an extra model call**, in money and latency. And **it drops what the schema did not anticipate**, because a schema is a filter.

The risk is worse: **extraction is itself a model call, and it can be wrong.** If the extractor hallucinates a decision that was never made, or misattributes a constraint, that error is now in your state and gets re-injected into every subsequent turn with the authority of a structured field. Its errors are *stickier* than prose errors precisely because they look authoritative. Two mitigations: keep the raw history on disk even after compaction so you can re-extract from source, and treat any state field whose provenance you cannot trace as suspect.

### Part 5 — Handoff notes: the state you carry between sessions

Part 4 handled compaction within a session. This part handles the harder boundary: **between sessions.** You close the laptop; tomorrow you open a fresh conversation; everything is gone.

The naive fix is "paste the old transcript". It is 40,000 tokens, it costs money, it buries today's instruction in the middle, and it carries forward every wrong turn. The right fix is a handoff note: a short written artefact on disk that lets a fresh session resume — the same idea as structured state extraction, but written for a human-plus-model audience and stored as a file rather than re-injected into a live loop.

Here is the template. Copy it.

```markdown
# Handoff — <project> — <YYYY-MM-DD>

### Objective
One sentence. What "done" looks like.

### State
What exists right now. File paths, with one line on what each contains.
- `src/scraper.py` — working; handles pagination; no retry logic
- `data/raw/2026-01-14.jsonl` — 4,200 records; 3 fields null in ~8%

### Decisions (and why)
- Used SQLite over Postgres — single-user tool, no server to run, ₱0 hosting
- Chunk size 512 tokens — measured; 1024 lost cross-references in test set

### Constraints
- Must run offline on a laptop with 8 GB RAM
- No paid APIs; everything must work on free tiers
- Output must be valid JSON matching `schema/out.json`

### Tried and rejected
- Regex extraction — failed on nested tables, 40% field error rate
- Embeddings-only retrieval — missed exact-ID lookups; hybrid needed

### Open questions
- Does the 8% null rate come from the source or the parser? Unresolved.

### Next action
Write a retry wrapper for `scraper.py` and re-run against the 2026-01-15
snapshot. Start here; nothing else is blocked by it.
```

The rules that make it work are mechanisms, not style preferences.

> **1. Write it at the END of a session, in the same session.** The value of a handoff note is that it holds what you know *now* and would not know tomorrow. Writing it at the start of the next session means reconstructing a mental state you have already lost — and the reconstruction will be a plausible guess rather than a record. This is the most-violated rule and the most expensive.
>
> **2. File paths, not descriptions.** "The scraper script" is useless in three weeks when there are four scripts. `src/scraper.py` is a fact.
>
> **3. Decisions carry their reasons.** A decision without a reason gets relitigated — and worse, you cannot tell when it has become wrong. "Use SQLite" is permanent; "use SQLite *because this is single-user and needs no server*" tells you exactly what would invalidate it.
>
> **4. Constraints go in their own section.** Constraints are the facts that do not change and that a fresh session will otherwise violate in good faith. "Must run offline on 8 GB" prevents a whole category of confidently wrong suggestions.
>
> **5. Record what failed.** The rejected-attempts section is the highest-value part of the note and the one people skip, because it feels like admitting fault. It is the only thing standing between you and re-trying the same dead end in three weeks with the same result.
>
> **6. Keep it short.** One screen. An 8,000-token handoff note has recreated the context problem you were solving. If it does not fit, your objective is too vague and your state is a file listing rather than a status.
>
> **7. One next action, not a task list.** Ten next steps produce paralysis and stale entries. One concrete action gives the fresh session somewhere to start, and it will produce the next one when it finishes.

**What this lets you predict.** A project without handoff notes will re-derive the same decisions and re-try the same failures, and the cost grows with the gaps between sessions. A project with them survives a two-week interruption with almost no loss. And the "tried and rejected" section will save more time than every other section combined — because the most expensive thing in any project is a smart person re-attempting a dead end with fresh enthusiasm.

**Where it stops working.** A handoff note is a snapshot, and snapshots go stale. A note written on the 3rd and read on the 20th describes a repository that has moved. **Date the note and check the files it names before trusting it** — it tells you what was true, not what is true. Second, it is only as good as the session's honesty: "State: mostly working" is worse than no note, because it is confidently wrong. Third, it does not help if the *task* was under-specified, only if the *execution* was interrupted.

### Part 6 — Memory systems, and why "just put everything in" eventually fails

Part 5 gave you portable state. This part is about systems that persist state automatically, and the honest limits of the whole approach.

**Short-term memory is the context window** — fast, precise, what the model can attend to right now, and it evaporates. Parts 1–4 live here.

**Long-term memory is anything outside the window** you can bring back in: files on disk, a database, a vector store, a provider's memory feature. Durable, effectively unbounded, and *not attended to until you retrieve it.* The critical consequence: **long-term memory does nothing by itself.** It is inert until something selects a piece of it and puts it in the short-term window. Every long-term memory system is really a selection system, and selection is where it succeeds or fails.

So when someone says "our agent has memory", the only question that matters is: *how does it decide what to bring back, and how do we know the decision was right?* With no answer, the memory is a lottery.

**What to persist, and what never to.** Persist what is expensive to re-derive, stable, and small. Refuse anything whose re-injection would be worse than its absence.

| Persist | Never persist |
|---|---|
| Decisions and their reasons — expensive to reconstruct, and the reason is what you forget | Secrets, API keys and credentials — memory is text that gets re-injected, logged and sometimes synced |
| Constraints and hard rules — cheap to store, catastrophic to violate | Full transcripts by default — that is the context problem, frozen; summarise to state instead |
| File paths and what is in them — the map of your work | Unverified model claims — a hallucination in storage looks like fact |
| Failed attempts — the highest-value, lowest-cost item in any store | Other people's personal data — you become its custodian |

**Memory poisoning.** The failure mode specific to persistence, and it deserves a precise definition rather than a scary name.

> **Memory poisoning** is where incorrect or adversarial information is written into long-term memory and then re-injected as authoritative context in future sessions.

Two paths in. **The accidental path**: the model hallucinates a fact, the fact is saved as memory, and from then on the model sees its own error presented as established context — so it repeats it with confidence and elaborates on it. The error becomes self-reinforcing and survives every future correction that does not explicitly target the memory store. **The adversarial path**: content read from an untrusted source — a web page, a document, an email, a tool result — persuades the system to remember something false, or to remember an instruction as a constraint. This is indirect prompt injection (arXiv:2302.12173) with a persistence layer attached, which makes it substantially worse: an injection affecting one turn is a bad answer; an injection that writes to memory affects every future turn.

Three cheap mitigations. **Write only from trusted sources** — from your own summarisation of the session, never directly from retrieved content; anything the model *read* is untrusted input. **Confirm before persisting** — the friction is the point, because a wrong memory is far more expensive to remove than a wrong answer is to ignore. And **keep provenance and an expiry** — a fact with no source and no date cannot be audited, and audit is the only way you will ever find a poisoned memory, because it reads exactly like a correct one.

**The honest counterpoint.** Everything above argues for less context, and it would be easy to conclude you should always retrieve, always compact, always minimise. **That conclusion is wrong for a large class of real systems, and getting it wrong costs more time than context bloat ever would.**

Anthropic's Contextual Retrieval post (19 Sep 2024) gives the concrete guidance: **if your knowledge base is under roughly 200,000 tokens, consider just including it in the prompt instead of building retrieval.** With prompt caching the static prefix is cheap to re-send, and you skip an entire category of bugs. This is not a corner case — a company's policies, a product's documentation, a personal knowledge base, a project's design docs. A large share of real use cases fit under that line.

The reasoning is a straight trade. Building retrieval means choosing an embedding model, chunking, keeping the index in sync, handling queries retrieval gets wrong, and debugging failures that could come from the chunker, the embedder, the index, the query, or the model. Days of work and a permanent maintenance surface. **If the corpus fits, the retrieval system's failure modes cost more than the context's.** The 200k figure is dated guidance from that post, not a law — check current window sizes and cache pricing before applying it — but the shape of the reasoning is stable. So build retrieval when the corpus does not fit, when the query rate makes even cached tokens expensive, when the corpus changes constantly, or when access control means different users must see different subsets. Otherwise, include it and cache it.

**And when "just put everything in" genuinely fails.** Eight distinct mechanisms, not the same thing said eight ways.

1. **Cost.** Input tokens are billed per call. A 200,000-token prefix at a high query rate is a permanent line item that caching reduces but does not eliminate.
2. **Latency.** The whole prefix is processed before the first output token, on every call.
3. **Attention dilution.** Softmax weights sum to one regardless of length, so more tokens means less weight per token — Part 1's mechanism.
4. **Truncation cliffs.** At the limit something silently disappears. The system does not degrade; it fails at a boundary you cannot see.
5. **Distraction and interference.** Relevant-looking but wrong content competes, and the model cannot know which of two plausible documents is authoritative.
6. **Conflicting instructions.** Two documents written at different times, both authoritative, both different. Include everything and you have imported the conflict along with the content, with no precedence rule unless you wrote one.
7. **Security surface.** Every token of context is an instruction candidate, so an attacker who gets one document into your corpus can attempt to steer the model — and, with memory, to persist that steering.
8. **Undebuggability.** The one that hurts most in practice and is discussed least. When a 200,000-token context produces a bad answer, which of the 200,000 tokens caused it? **A context with nothing excluded is a context you cannot experiment on.** That alone often justifies building selection even when the corpus fits.

**Where the whole approach stops working.** First, **no ordering or compaction strategy makes a bad context good.** If the information the model needs is not in the corpus, no arrangement of the corpus helps. Context engineering is a *selection and presentation* discipline, not a knowledge-acquisition one.

Second, **context rot is real and the curve is empirical.** The window is a hard limit; effective use of the window is a soft one that depends on the model, the task, and the content. "It fits in the window" and "the model will use it" are different claims, and the second determines whether your system works. **Measure the curve for your model and your task. That is a two-hour experiment and it will tell you more than any guideline in this phase, including mine.**

---

## Hands-on practice tasks

1. Take a real prompt you use, list every distinct block in it, and write a one-line justification for each using the deletion test: "without this, the model would fail to ___". Delete every block you cannot finish that sentence for. Record the before and after token counts. <!-- id: prompt-05-context-engineering-t01 band: focused energy: normal -->
2. Install `tiktoken` and write a five-line script that counts the tokens in your prompt and multiplies by your provider's current input price per million tokens. Run it on three draft versions of the same prompt and record which costs most. Note the date you read the price. <!-- id: prompt-05-context-engineering-t02 band: quick energy: low -->
3. Build a position experiment: take five documents where only one contains the answer, and place that document at positions 1, 3, and 5. Run each arrangement ten times. Record accuracy per position. Write two sentences on where your curve agrees with Liu et al. and where it does not. <!-- id: prompt-05-context-engineering-t03 band: deep energy: high -->
4. Write a `extract_state(history) -> dict` function producing the schema from Part 4, plus a `validate(state)` function that returns a list of problems. Run it on a long conversation and list every validation failure. Fix the prompt until the extractor passes on three consecutive runs. <!-- id: prompt-05-context-engineering-t04 band: deep energy: high -->
5. Compact a 30,000-token conversation two ways: once as a prose summary, once as a structured state object. Re-inject each into a fresh session and ask the same three follow-up questions. Score both by how many specifics survived (names, paths, numbers, decisions). Record the token count of each. <!-- id: prompt-05-context-engineering-t05 band: focused energy: normal -->
6. Write a handoff note for your current project using the Part 5 template, at the END of a working session rather than the start of the next one. Then open a fresh session, paste only the note, and see whether it can state your next action correctly without asking a question. <!-- id: prompt-05-context-engineering-t06 band: quick energy: low -->
7. Design a test for attention dilution: take a prompt that works reliably, then add 5,000 tokens of topically-related but irrelevant text, then 20,000. Measure accuracy at each size across ten inputs. Write a paragraph on whether the degradation you observed looks like dilution or like distraction. <!-- id: prompt-05-context-engineering-t07 band: deep energy: high -->
8. Keep a two-column log for a week. Left: every time you add something to a context "just in case". Right: whether the deletion test would have passed it, and what it cost. At the end, write a paragraph on the pattern in your own decisions. <!-- id: prompt-05-context-engineering-t08 band: ongoing energy: low -->

## Common Pitfalls

**Believing the model will sort relevant from irrelevant.** It attends to what you gave it, weighted by a learned function you do not control. A plausible distractor with no label is worse than no text at all, because it supplies a fluent wrong answer.

**Reducing Lost in the Middle to "a 20% drop".** That is not the paper's framing and not its number. The anchor is that middle-position accuracy fell *below* the model's closed-book accuracy, with 56.1% as the closed-book reference and 10/20/30 documents in the setup. Cite it correctly.

**Assuming the Lost in the Middle curve is still accurate as published.** The exact curve has improved substantially in modern models as of early 2026. The qualitative lesson — the middle is the least reliable position and you should verify your own curve — has held. Do not quote the 2023 numbers as if they describe today's model.

**Restating every instruction at top and bottom.** Repetition competes with itself. Restate the one or two constraints that matter most; a second full block of instructions creates ambiguity about whether it is a duplicate or an addition.

**Compacting only when the request errors out.** By then you cannot summarise what you are dropping, because you cannot fit the extraction call. Trigger on a threshold with headroom reserved for output, not on failure.

**Using a prose summary when a state object would do.** Summaries drift, lose specifics first, and cannot be validated. A schema-checked object tells you when it is broken.

**Omitting failed attempts from state or handoff notes.** It is the highest-value, lowest-cost field, and without it an agent or a fresh session will re-try the same dead end with the same result.

**Writing the handoff note at the start of the next session.** The point is to record what you know now. Tomorrow you will reconstruct a plausible guess instead.

**Persisting secrets or full transcripts into memory.** Memory is text that gets re-injected, logged and possibly synced. Store state, never credentials.

**Treating saved model output as verified fact.** A hallucination that gets written to memory comes back as authoritative context and becomes self-reinforcing. Write only from trusted sources, with provenance and dates.

**Assuming "it fits in the window" means "the model will use it".** Fitting is a mechanical property; using it is an empirical one. Measure the curve for your model and your task.

**Over-applying the budget model to a small corpus.** Under roughly 200k tokens, including everything and caching it is often the right call — that guidance comes from Anthropic's Contextual Retrieval post (19 Sep 2024). Building retrieval has its own failure modes, and below that line they usually cost more than the context does.

## Deliverable / proof of work

Write `portfolio/prompting/05-context-engineering.md` containing:

- **A block inventory of one real prompt.** Every distinct block with its token count, its deletion-test verdict (load-bearing / neutral / harmful / unknown), and the one-sentence justification. Include the before-and-after token totals.
- **Your position curve.** The results of task t03: accuracy per document position for the model you actually used, with the date and the model noted, plus two sentences on where it agrees with and diverges from the Lost in the Middle finding.
- **A one-paragraph correct statement of Lost in the Middle.** Written without looking at your notes, including the closed-book anchor and what has changed since publication. If you write "20% drop", rewrite it.
- **A structured state extractor.** The working code from task t04 with its schema and validator, plus the output for one real conversation and a note on which validation failures showed up most.
- **A prose-summary versus state-object comparison.** Task t05's results, with the token count of each and a count of specifics that survived.
- **A handoff note for your actual current project,** using the Part 5 template, written at the end of a real session. Note whether a fresh session could act on it without asking a question.
- **A compaction policy.** Your trigger threshold, your reserved output headroom, your safety margin, and one sentence per number on how you chose it and what would make you change it.
- **A one-page decision record:** for your current project, whether to include everything and cache it, or to build retrieval. State the corpus size, the query rate, and the reasons, and cite the Anthropic guidance you are applying with its date.
- **The prediction you got wrong.** One thing in this phase that contradicted what you expected. Three sentences is enough, and this is the most valuable section.

## Checklist

- [ ] I can explain why every token in my context has a money cost, a latency cost and an accuracy cost <!-- id: prompt-05-context-engineering-c01 energy: normal -->
- [ ] I can apply the deletion test to any block without hedging <!-- id: prompt-05-context-engineering-c02 energy: normal -->
- [ ] I can name the "just in case" failure mode and say why keeping is not the safe default <!-- id: prompt-05-context-engineering-c03 energy: normal -->
- [ ] I can explain attention dilution in terms of softmax weights summing to one <!-- id: prompt-05-context-engineering-c04 energy: high -->
- [ ] I can state the Lost in the Middle finding accurately, with its closed-book anchor, and not as a percentage drop <!-- id: prompt-05-context-engineering-c05 energy: normal -->
- [ ] I can say what has improved in modern position curves and what qualitative lesson still holds <!-- id: prompt-05-context-engineering-c06 energy: normal -->
- [ ] I can name four ordering tactics and say which one is cheapest to apply <!-- id: prompt-05-context-engineering-c07 energy: normal -->
- [ ] I can explain why headers and structure help beyond mere tidiness <!-- id: prompt-05-context-engineering-c08 energy: normal -->
- [ ] I can compare truncation, summarisation, sliding window and state extraction, and name each one's failure mode <!-- id: prompt-05-context-engineering-c09 energy: normal -->
- [ ] I can write a validated state schema and explain why it beats a prose summary <!-- id: prompt-05-context-engineering-c10 energy: high -->
- [ ] I can set a compaction trigger with reserved output headroom and justify the number <!-- id: prompt-05-context-engineering-c11 energy: high -->
- [ ] I have written a handoff note at the end of a session and tested it in a fresh one <!-- id: prompt-05-context-engineering-c12 energy: normal -->
- [ ] I can list what to persist and three things never to persist into memory <!-- id: prompt-05-context-engineering-c13 energy: normal -->
- [ ] I can define memory poisoning and give two mitigations <!-- id: prompt-05-context-engineering-c14 energy: normal -->
- [ ] I can list at least five distinct reasons the "put everything in" approach fails <!-- id: prompt-05-context-engineering-c15 energy: high -->
- [ ] I can state the honest counterpoint about small corpora and caching, with its source and date <!-- id: prompt-05-context-engineering-c16 energy: normal -->
- [ ] I have measured my own position curve rather than quoting the 2023 paper's <!-- id: prompt-05-context-engineering-c17 energy: high -->
- [ ] I have written the deliverable file and included a prediction I got wrong <!-- id: prompt-05-context-engineering-c18 energy: high -->

## Quiz

### Q1. You are choosing where to place the single most important document in a 40,000-token context. Which placement is best supported by the evidence? <!-- id: prompt-05-context-engineering-q01 energy: normal -->

- [ ] In the middle, so it is surrounded by supporting material
- [x] At the start or the end, because both edges are the more reliable positions
- [ ] In the middle, because the model attends most strongly to what it read most recently before generating
- [ ] Position does not matter once the document is inside the window

**Why:** Liu et al. (arXiv:2307.03172) placed a relevant document at varying positions among 10, 20 and 30 documents and found accuracy highest at the beginning and end, degrading in the middle. The middle-in-context condition was severe enough that performance fell below the model's closed-book accuracy, whose reference point was 56.1%. The exact curve has improved in modern models, so re-measure it for the model you use — but the edges remain the default place for your highest-value content.

### Q2. A colleague summarises the Lost in the Middle paper as "it shows a 20% accuracy drop for information in the middle". How should you correct this? <!-- id: prompt-05-context-engineering-q02 energy: normal -->

- [ ] They are right; the paper reports a 20% drop in the middle
- [ ] The figure is 10%, not 20%
- [x] The paper's anchor is different — middle-position accuracy fell below the model's closed-book accuracy of 56.1%, using 10/20/30 documents
- [ ] The paper only tested models with small context windows, so no correction is needed

**Why:** The paper's framing is a comparison against answering with no documents at all, not a percentage drop from a best-case position. The closed-book reference is 56.1%, and the experiments used 10, 20 and 30 documents. This matters practically: "some accuracy loss" suggests the content is merely under-used, whereas the paper's actual statement is that in the middle of a long context the document was worse than absent. That is a stronger and more actionable claim.

### Q3. Your support assistant has a style block, a 12,000-token knowledge base, a competitor note, and a format rule. Which block most likely belongs in the "harmful" bucket of a deletion test? <!-- id: prompt-05-context-engineering-q03 energy: normal -->

- [ ] The style block, because style instructions always reduce accuracy
- [ ] The knowledge base, because long documents dilute attention and should always be shortened
- [ ] The format rule, because format constraints conflict with content constraints
- [x] The competitor note, because plausible but wrong content competes for attention and supplies a fluent wrong answer

**Why:** A distractor is not neutral. Topically relevant but incorrect or inappropriate content gives the model a fluent candidate answer it has no way to reject, and it competes for attention mass against the content you actually want quoted. Style and format blocks are often *neutral* — safe to delete because they change nothing — but that is a weaker claim than harmful. The knowledge base is load-bearing; the right move there is retrieval or sectioning, not deletion.

### Q4. You need to keep a long agent run inside the window. Which compaction strategy loses the least, and why? <!-- id: prompt-05-context-engineering-q04 energy: high -->

- [x] Structured state extraction, because a schema-checked object can be validated and re-injected cheaply
- [ ] Hard truncation, because it preserves the original wording exactly
- [ ] Sliding window, because recent context is always the most relevant
- [ ] Prose summarisation, because it preserves narrative continuity

**Why:** A state object has a fixed schema, so a missing `next_action` or a decision without a reason is detectable — you can assert on it and fail loudly instead of silently losing the thread. It also forces specificity, re-injects for far fewer tokens than history, and can be diffed between runs. Prose summaries drift, lose specifics first, and cannot be validated; truncation and sliding windows drop content at a boundary you cannot see.

### Q5. Your agent keeps repeating an approach that already failed two hours ago. Which fix addresses the actual mechanism? <!-- id: prompt-05-context-engineering-q05 energy: high -->

- [x] Add a `failed_attempts` field to the state object, recording the attempt and why it failed
- [ ] Increase the context window by switching to a model that accepts more tokens
- [ ] Add an instruction telling the model not to repeat itself
- [ ] Lower the temperature so the model is less likely to wander

**Why:** The record of the failed attempt fell out of the window during compaction, so the agent has no information that it was tried. A larger window defers the problem; an instruction not to repeat cannot work, because the model does not know what it repeated; and temperature has nothing to do with it. Encoding failures explicitly in the extracted state is the fix, and it is why that field is the highest-value field in the schema.

### Q6. When should compaction trigger? <!-- id: prompt-05-context-engineering-q06 energy: normal -->

- [ ] As soon as the context reaches 100% of the window, detected by the request failing
- [ ] Only when the conversation has ended and you are archiving it
- [ ] Whenever the conversation exceeds ten turns, regardless of token count
- [x] At a threshold well below the window, with headroom reserved for the reply and the extraction call itself

**Why:** If you wait for an overflow error, you can no longer fit the extraction call that would summarise what you are about to drop — the failure is unrecoverable. Triggering at roughly 60–75% of a usable budget that already reserves output space and a safety margin costs one extra call and avoids the cliff entirely. The exact fraction is illustrative and should be calibrated to how large your state objects are relative to your history.

### Q7. You are deciding whether to build a retrieval pipeline for an internal knowledge base of about 90,000 tokens, queried roughly 50 times a day. What is the best-supported starting point? <!-- id: prompt-05-context-engineering-q07 energy: high -->

- [x] Include the whole corpus in the prompt and use prompt caching, then revisit if cost or quality degrades
- [ ] Build retrieval immediately, because including everything always fails
- [ ] Split the corpus into 512-token chunks and embed them before doing anything else
- [ ] Truncate the corpus to the most recent documents only

**Why:** Anthropic's Contextual Retrieval post (19 Sep 2024) advises that when a knowledge base is under roughly 200,000 tokens, you should consider simply including it in the prompt rather than building retrieval — with caching, the static prefix is cheap to re-send. A 90,000-token corpus queried 50 times a day sits comfortably inside that guidance, and skipping retrieval avoids chunking, index-sync and retrieval-failure bugs entirely. Check current window sizes and cache pricing before applying the figure, since it is a dated guideline rather than a law.

### Q8. A web-scraping agent saves a page summary to long-term memory. Weeks later the agent confidently states a false fact as an established constraint. What happened, and what is the cheapest mitigation? <!-- id: prompt-05-context-engineering-q08 energy: high -->

- [ ] Context dilution; the fix is a shorter memory store
- [x] Memory poisoning via untrusted input; the fix is to write memory only from trusted sources, with provenance and expiry
- [ ] A tokenisation error; the fix is switching to a different tokeniser
- [ ] A temperature setting; the fix is to set temperature to zero

**Why:** Memory poisoning is incorrect or adversarial content written into long-term memory and re-injected as authoritative context — here through the indirect prompt injection path (arXiv:2302.12173), which is far worse than a single bad turn because it affects every future turn. Crucially, a poisoned memory reads exactly like a correct one, so you cannot spot it by inspection; provenance and dates make it auditable. Zero temperature does not help, because the error was already accepted as fact when it was written.

### Q9. Which of these is the strongest argument for building a selection layer even when the corpus comfortably fits in the window? <!-- id: prompt-05-context-engineering-q09 energy: normal -->

- [ ] Selection always improves accuracy
- [ ] Retrieval is required by every production system
- [x] Debuggability — when everything is always present, you cannot vary one thing at a time
- [ ] Caching does not work with large contexts

**Why:** A context with nothing excluded is a context you cannot experiment on. With a 200,000-token prefix that always contains every document, a bad answer gives you no way to isolate the cause, because you cannot remove a single block without changing the task. Cost, latency and dilution are real but often manageable with caching; undebuggability is the reason that most often justifies selection even when it is not economically necessary.

### Q10. Why does adding 20,000 tokens of topically relevant but unnecessary text tend to make a prompt worse rather than merely slower? <!-- id: prompt-05-context-engineering-q10 energy: high -->

- [ ] Because the model's parameters are fixed and cannot represent additional context
- [ ] Because tokenisation changes when the context grows past a threshold
- [ ] Because the model drops the oldest tokens automatically once it is full
- [x] Because softmax attention weights sum to one, so more candidates means less weight per existing token, and plausible distractors supply fluent wrong answers

**Why:** The attention distribution is normalised regardless of context length, so adding candidates necessarily reduces the share available to your existing instruction — it is outcompeted, not deleted. Separately, a topically relevant but wrong document gives the model a fluent candidate answer with no signal that it should be rejected. Neither effect is about model capacity or tokenisation; they are properties of how attention and instruction-following work at any context length.

## You're ready to move on when...

- You can look at any prompt and justify every block with a completed sentence: "without this, the model would fail to ___".
- You have actually deleted blocks from a real prompt and measured the result, rather than reasoning about it.
- You can state the Lost in the Middle finding with its closed-book anchor and the 10/20/30-document setup, and you can say what has improved since without claiming the lesson is obsolete.
- You have measured your own position curve on at least one model and written down where it diverges from the published result.
- You can name four ordering tactics and explain the mechanism behind the cheapest one.
- You can compare truncation, summarisation, sliding window and state extraction, and name each one's specific failure mode.
- You have written a working state schema with a validator that fails loudly on missing fields.
- You can set a compaction trigger with reserved output headroom, and justify the number with reference to your own state sizes.
- You have written a handoff note at the end of a session and confirmed a fresh session could act on it without asking a question.
- You can define memory poisoning, name both paths into it, and give two mitigations.
- You can list at least five distinct mechanisms by which "put everything in the context" fails, and explain why undebuggability is often the decisive one.
- You can state the small-corpus counterpoint with its source and date, and say what would change your mind for a specific project.
- Your deliverable file exists at `portfolio/prompting/05-context-engineering.md` and includes a prediction you got wrong.

## Free vs Paid

### What's free is enough

Almost all of this phase is free, permanently, and the parts that are not are optional. `tiktoken`, the Hugging Face tokenizers, `json-schema`, `LiteLLM`, Ollama and `llama.cpp` are all open source. The Lost in the Middle paper, the indirect prompt injection paper, the instruction hierarchy paper, the DSPy and Reflexion papers, and the RAG papers are open on arXiv. Anthropic's Contextual Retrieval post, the Model Context Protocol specification, and both major vendors' prompt engineering guides are free to read.

The two highest-value activities cost nothing at all. **The deletion test** is you, a text editor, and five test inputs — no API, no tool, no account. **The handoff note** is a Markdown file on your own disk. Those two together will change your results more than any subscription, because they attack the two biggest sources of waste: content that should not be there and state you failed to carry forward.

For measurement, a free-tier chat interface is enough to run the position experiment in task t03 at a reduced scale — fewer documents, shorter contexts. A local model via Ollama gives you unlimited runs at zero marginal cost, which is genuinely better for iteration than a paid API, even though the model is weaker. The curve you are measuring is a property of attention over positions; you do not need the strongest model to see it.

`tiktoken` gives you exact local token counts, so you can price a context without spending a peso. Where a provider offers a token-counting endpoint — OpenAI's `POST /v1/responses/input_tokens` is one — it is free to call and returns the exact count for a request without generating anything.

### What a paid tier adds

A paid API key buys three real things here. **Exact cost data**: your own invoice tells you what a token actually costs for your traffic, rather than what a price page says. **Exact token counts for proprietary models**, via the token-counting endpoint, which removes the estimation error your safety margin exists to absorb. **Access to the strongest long-context models**, which matters for task t03 specifically — you want to know whether the middle-of-context weakness has flattened on the model you actually ship on, and that model may be a paid one.

Paid tiers also make prompt caching available on most providers, which is the single feature that changes the economics of "include everything and cache it". Whether caching is included, discounted, or separately priced varies by provider and changes often — check the current pricing page rather than trusting a figure, and note the date you checked.

### When it's worth paying

**Not for this phase's core material, and not yet.** The skills here are selection, ordering, compaction and handoff, and all four are free to practise. If you have ₱0, do the whole phase without an API key and use a free chat interface plus a local model for the experiments. You will learn the same mechanisms.

The honest threshold for spending is when you have a real workload with a real query rate, because that is when cost and latency become measurable facts rather than estimates. If you are running a few hundred calls a month, your context inefficiency is a rounding error and your time is better spent on the deletion test. If you are running a hundred thousand, a 30% context reduction is a salary.

One place it is genuinely worth a small amount, if you can spare it: a few dollars of API credit specifically for task t03 and task t05, so you can measure the position curve and the summary-versus-state comparison on the model you actually use. Those two experiments produce facts about *your* system that no free resource can give you. Everything else in this phase is free.

**The budget for this phase is ₱0** — roughly 16–24 hours over two weeks, a text editor, and a free chat interface or a local model. The constraint that will actually bite is not money. It is the pull toward adding one more document "just in case", because adding feels like diligence and deleting feels like risk. The deletion test exists because those two feelings are backwards, and the invoice and the accuracy curve will both confirm it.
