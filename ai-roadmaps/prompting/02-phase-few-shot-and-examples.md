---
id: prompt-02-few-shot-and-examples
track: prompting
phase: 2
order: 20
title: Few-Shot Prompting and Examples
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/prompting/02-few-shot-and-examples.md
exit_criteria: >
  You can explain what an example actually does inside the forward pass, and why
  demonstrating a format is the highest-value use of one while extra examples for
  a straightforward classification task hit diminishing returns almost immediately.
  You have measured at least one case where adding an example made your output
  worse, named which failure mechanism caused it, and you have decided between
  fixed and dynamically retrieved examples for a real task while accounting for
  the fact that dynamic examples defeat prompt caching. You follow the recipe —
  zero-shot first, one example only if format is unreliable, more only when a
  measured eval improves — and you can state the conditions under which examples
  are the wrong tool entirely.
---

# Phase 2 — Few-Shot Prompting and Examples

## Goal of this phase

You already know how to write a prompt. Phase 1 of this track got you to the point where the model reliably does what you asked. This phase is about a different lever, one that beginners reach for first and understand last: **putting worked examples into the prompt.**

The lever is real. It is also the most overused technique in the field, and the overuse has a specific cost that nobody warns you about. Once you understand the mechanism, you will see that examples are not "more instruction" — they are **evidence**. And evidence, like any evidence, can be irrelevant, can be misleading, and can point at the wrong regularity entirely.

By the end of this phase you will know exactly what a worked example changes inside the forward pass, why a format demonstration is worth ten times what a classification demonstration is worth, and the four separate mechanisms by which adding a *good* example to a *good* prompt still makes the output worse. You will have measured your own diminishing returns curve rather than taking anyone's word for it, and you will have made a real decision about example selection while accounting for the fact that dynamic example selection silently destroys prompt caching — which on a zero budget is not a footnote, it is the whole bill.

Most of all, you will stop treating examples as a technique you apply and start treating them as a **hypothesis you test**.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Day 1 is the lesson. Days 2–4 are the practice tasks — and in this phase, more than most, the tasks *are* the content, because the central lesson is that the answer depends on measurement and you cannot measure by reading. Day 5 is the write-up.

Budget two extra hours somewhere in the week for task 6, the caching comparison. It is the slowest task here and the one with the largest payoff, because it converts an abstract warning into a number you personally observed.

You can do almost all of this phase with no API key at all if you follow the free path described in the Free vs Paid section. The one thing you cannot do for free is measure prompt caching, because caching is a hosted-provider feature.

## Skills you'll gain

- Explain what an example changes mechanistically, and why it is evidence rather than instruction
- Distinguish the three things a worked example can teach — format, task definition, and mapping — and say which one carries the value
- Build a labelled evaluation set small enough to run in an afternoon and honest enough to trust
- Measure the marginal effect of the first, second and fifth example on your own task instead of assuming it
- Identify recency bias, majority-label bias and shortcut learning by their signatures in your own output
- Count what an example block costs you in input tokens on every single call, and convert that into a monthly number
- Choose between fixed examples, retrieved examples and no examples, and say why
- Explain why dynamically selected examples defeat prefix caching, and design a prompt that keeps the cacheable part stable
- State the conditions under which examples are the wrong tool and a different technique is the answer

## Specific topics to learn

### The spectrum

- Zero-shot, one-shot and few-shot as points on one axis, not three separate techniques
- Why the honest framing is "how much evidence does this task need", not "which technique is best"
- The difference between an example that demonstrates *how to respond* and one that demonstrates *what to answer*

### What examples actually do

- In-context learning as conditioning: examples become part of the prefix the model conditions on
- Format induction — the strongest and most reliable effect
- Task induction — the weaker effect, and when it is doing the work
- Why the demonstration is not a gradient step and does not update any weights

### How more examples hurt

- Recency and ordering: the label nearest the question carries disproportionate weight
- Majority-label bias: the distribution of your examples becomes an implicit prior
- Shortcut learning: surface regularities correlated with the label in your sample but not in the task
- Cost and latency: examples are input tokens paid on every call, forever

### Choosing examples

- Fixed examples: stable, cacheable, blind to the input
- Retrieved examples: adaptive, and a cache-destroying change to your prefix
- Diversity-aware selection: covering the label space rather than sampling the centre
- Validation: never draw examples from the same pool you test on

### The caching tension

- Prompt caching matches a prefix, so the prefix is the thing you must keep stable
- Dynamic examples change the prefix, so nothing after the first differing token is cached
- Putting the varying block last, and what that costs you in attention behaviour
- Cache lifetime, write premiums and minimum prefix lengths as dated, volatile specifics

### The negative role of examples

- Examples cannot teach a capability the model lacks
- Examples do not fix ambiguity in the instruction; they hide it or amplify it
- Examples competing with instructions, and which one usually wins

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Python 3 | The language for every measurement script in this phase | Free | https://www.python.org/downloads/ | Build the harness that scores a prompt variant against your labelled set | Any language — the harness is arithmetic and string handling |
| `requests` | Send prompt variants to any HTTP API so you control the exact prefix | Free | https://requests.readthedocs.io/ | Run the same task with 0, 1, 2 and 5 examples and log the results | Python's built-in `urllib.request` |
| Ollama | Run a local model with no key and no bill, which is how you iterate freely | Free | https://ollama.com/ | Do all exploratory iteration locally, then confirm the pattern on a hosted model | A hosted provider's free tier, if your machine cannot run a local model |
| `tiktoken` | Count input tokens before you send, so example cost is a measurement | Free | https://github.com/openai/tiktoken | Measure the exact token cost of your example block separately from the instruction | Any tokeniser library for your model family, or the provider's own count endpoint |
| Prompt caching | Pay less for a repeated prefix, and see it break when examples move | Freemium — caching is a hosted-provider feature with its own pricing and expiry terms; provider terms change, so check current pricing | https://developers.openai.com/api/docs/guides/prompt-caching | Run one fixed-example prompt and one retrieved-example prompt and compare reported cached-token counts | No free equivalent exists — if you cannot use a hosted provider, record the caching task as unmeasurable and reason from the documented mechanism instead |
| Model Context Protocol | The open standard for connecting a model to external data, which is how retrieved examples arrive | Free | https://modelcontextprotocol.io/ | Sketch how a retrieved-example pipeline would fetch its examples from your own store | Plain Python functions reading a local file — the protocol is a convention, not a requirement |
| Scikit-learn | Split your labelled data honestly and compute agreement scores | Free | https://scikit-learn.org/ | Produce train/validation/test splits and a per-label breakdown of your errors | Hand-written splitting and counting code in a spreadsheet or a script |
| Jupyter | Keep the experiment, the numbers and the output in one place you can re-run | Free | https://jupyter.org/ | Record each prompt variant with its measured score in a single notebook | A Python script whose output you save to a file |
| Git | Version your prompts the way you version code, because prompt changes are code changes | Free | https://git-scm.com/ | Commit each prompt variant so "which version scored 0.81" is answerable | Any version control, or dated copies of the prompt file |

## Free/cheap resources

- **Brown et al. — Language Models are Few-Shot Learners (GPT-3 paper)** — https://arxiv.org/abs/2005.14165
- **Min et al. — Rethinking the Role of Demonstrations** — https://arxiv.org/abs/2202.12837
- **Lu et al. — Fantastically Ordered Prompts and Where to Find Them** — https://arxiv.org/abs/2104.08786
- **Zhao et al. — Calibrate Before Use: Improving Few-Shot Performance of Language Models** — https://arxiv.org/abs/2102.09690
- **Liu et al. — Lost in the Middle: How Language Models Use Long Contexts** — https://arxiv.org/abs/2307.03172
- **Wei et al. — Chain-of-Thought Prompting Elicits Reasoning in Large Language Models** — https://arxiv.org/abs/2201.11903
- **Khattab et al. — DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines** — https://arxiv.org/abs/2310.03714
- **OpenAI — Prompt caching guide** — https://developers.openai.com/api/docs/guides/prompt-caching
- **Anthropic — Prompt caching** — https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- **Anthropic — Use examples (multishot prompting)** — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/multishot-prompting
- **Google — Gemini API prompt design strategies** — https://ai.google.dev/gemini-api/docs/prompting-strategies
- **OpenAI — Token counting endpoint (`POST /v1/responses/input_tokens`)** — https://developers.openai.com/api/docs/guides/token-counting
- **Hugging Face — Open LLM Leaderboard, for reading what is actually measured** — https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard

## Lesson: Examples Are Evidence, Not Instruction

### Part 1 — The honest finding: format is the whole prize

Start with the problem this technique was invented to solve, because the folklore around it is built on a misreading.

The original observation, in the GPT-3 paper (Brown et al., arXiv:2005.14165), was that a large model could perform a task it had never been trained on if you wrote a few input-output pairs in the prompt before the real question. That result was remarkable and it launched the entire practice. What the field then did — understandably, and wrongly — was conclude that examples are a general-purpose quality lever: more examples, better answers.

The follow-up work is where the honest finding lives, and it should change how you write prompts permanently.

Min et al. (arXiv:2202.12837) ran the experiment you would design if you were suspicious: keep the *format* of the demonstrations but destroy the *content*. Replace the labels with random ones. Replace the input text with irrelevant text. In a striking set of cases, performance barely moved. What survived the destruction was the demonstration of the **label space and the output format** — the fact that answers look like `positive` and not like `Yes, I think this review is positive because...`. What died, when they destroyed the inputs, was the claim that the model was learning the task from the pairs.

Read that carefully, because it is the thesis of this phase:

> **The highest-value thing an example does is show the model the shape of an acceptable answer.** The second-highest is to show it a task it genuinely cannot identify from the instruction alone. The thing people assume it does — teach the model the task by example — is the part that has the weakest evidence behind it.

This is not a technicality. It directly predicts your day-to-day experience.

**Prediction 1.** If your task is a classification the model already understands, and you give it one example, you will see a large jump. From one to five examples you will see a small change, possibly none, possibly backwards. Because the first example did the format job and the rest added nothing the model did not have.

**Prediction 2.** If your task has an idiosyncratic output format — a specific JSON schema, a house style, a terse register, a domain-specific label set with slightly unusual names — examples will be worth their cost, and the second and third example may keep helping, because the format is complex enough that one demonstration does not pin it down.

**Prediction 3.** If your task definition is ambiguous in your instruction, examples will appear to fix it. They will not. They will pin down *one* reading — whichever reading your examples happen to embody — and you will get a false sense of having specified the task.

That third prediction is the trap that costs people weeks, and Part 4 returns to it.

The mechanism behind all of this comes straight from the model-internals track. A prompt is a prefix, and the model conditions its next-token distribution on that prefix. An example is not a training signal; no weight changes. It is a region of the prefix whose statistical texture resembles the texture of the task's solution. When the model generates after a well-formed example block, it is continuing a document that already looks like the kind of document you want. Phase 4's attention material explains why this works at all: the example tokens are available as keys for every later query token, so the final answer can attend back to them for style, for label vocabulary, and for the syntactic frame of a completed answer.

And that framing immediately tells you where the technique stops. **The model can only continue a pattern it can see.** If your examples require a capability the model does not have — a fact it was never trained on, a computation it cannot perform, a language it handles poorly — no number of examples will produce it, because you are not adding capability, you are adding conditioning. Examples shape *which* of the model's existing behaviours fire. They do not create new ones.

This is the first place the technique stops working, and it is the one that wastes the most time. If the model is getting your task wrong in a way that looks like it does not understand the concept at all, examples are the wrong tool. Check whether the task is genuinely within the model's capability before you write your fourth demonstration. The answer to "it cannot do this" is retrieval, or a different model, or finetuning — not a longer prompt.

### Part 2 — Zero-shot, one-shot, few-shot: one axis, not three techniques

The vocabulary suggests three techniques. It is one axis: **how much worked evidence you supply before the question.**

| Setting | What is in the prompt | What it is actually for |
|---|---|---|
| Zero-shot | Instructions only | Everything the instruction can carry: task, constraints, format description, persona |
| One-shot | Instructions plus one input-output pair | Pinning the output format; occasionally fixing a misunderstood label set |
| Few-shot | Instructions plus several pairs | Multi-part formats, or genuinely unusual tasks; and, often, an unexamined habit |

The axis is not "weak to strong". It is "cheap to expensive", and the interesting question is where the curve flattens — which is usually much earlier than people assume. The rest of this phase is about locating that point for *your* task rather than guessing.

Before you add a single example, know what you are giving up by staying at zero-shot, because zero-shot is not a consolation prize:

- **It is the cheapest possible prompt.** No example tokens, on every call, forever.
- **It is trivially cacheable.** A fixed instruction prefix with the user's text at the end is the ideal shape for provider prompt caching.
- **It is portable.** A model-agnostic instruction moves between providers; an example block tuned for one model's quirks may not.
- **It is honest about failure.** When zero-shot fails, you see exactly what the instruction failed to specify. A prompt that only works because of its examples hides that gap, and the gap reappears the moment a real input falls outside your example distribution.

That last point deserves a moment, because it is the reason this phase tells you to start at zero-shot rather than treating it as a fallback. **Examples can mask an under-specified instruction.** If your prompt is ambiguous and your examples resolve the ambiguity, your prompt now works — for inputs that resemble the examples. For inputs that do not, you have no idea what it does, because your instruction never actually said. You have built a system whose behaviour you cannot describe, which means you cannot predict it, which means you cannot debug it.

There is a related failure mode worth naming now, because Part 4 handles the other side of it. Several of the papers in the resources above — Zhao et al. (arXiv:2102.09690) on calibration, Lu et al. (arXiv:2104.08786) on ordering — established that the *choice and arrangement* of demonstrations can swing accuracy by large margins on the same task with the same model, independently of whether the examples are meaningfully "better" or "worse". The swings are artifacts of the sample you happened to draw.

Hold that thought. It means the last thing you should trust about a few-shot prompt is your intuition about it.

### Part 3 — What an example actually buys you: three distinct jobs

An example block can do three different jobs. They are worth wildly different amounts, and confusing them is why people over-invest in examples.

**Job 1: format induction.** You show the model that answers look like `{"sentiment": "negative", "confidence": "medium"}` rather than a sentence. This is the highest-value job and the most reliable one. It works because the model is continuing a document whose local statistics already look like your target output. It is the job the Min et al. result says survives even when the example content is nonsense.

Format induction is worth it whenever your output has any structure the instruction struggles to pin down: a specific JSON schema, a fixed number of fields, a house register, control tokens, a particular way of saying "I don't know". It is also the job that a *schema in the instruction* can often do nearly as well, for zero tokens of cost per call — which is the comparison you should always run before committing to examples.

**Job 2: task induction.** You show the model *what task this is* by demonstrating it. This matters when the instruction genuinely underdetermines the task. "Extract the key terms" is ambiguous: key to whom, for what purpose, how many, how long? An example resolves it by fiat.

The problem is that fiat resolution is not specification. You have not told the model what you want; you have shown it one instance and let it generalise, along whichever axis is most salient in your example — which may not be the axis you had in mind. When job 2 is doing the real work, your prompt is fragile in a way that only shows up on unusual inputs.

**Job 3: mapping.** You show the model the correct answer for specific inputs, hoping it applies that answer to similar inputs. For a narrow, repeated query set this can work — it is the crude ancestor of retrieval, which the retrieval track covers properly. But it is also the job most likely to produce shortcut learning (Part 4), because the model may latch onto a surface feature that correlates with the answer in your examples rather than the feature you intended.

The practical consequence: **always ask which job you are hiring an example to do.** If it is job 1, you can often replace the example with a schema description and save the tokens. If it is job 2, fix your instruction instead — that is nearly always the right repair, because an instruction generalises and an example does not. If it is job 3, you probably want retrieval rather than a fixed block.

Here is the shape of the difference in the prompt itself. Zero-shot, instructions carrying everything:

```text
Classify the customer message by urgency and by whether it needs a human.

Urgency is one of: critical, high, normal, low.
critical = service is down or data loss is occurring right now.
high     = a person is blocked from working and has no workaround.
normal   = degraded but there is a workaround.
low      = question, request, or cosmetic issue.

Escalate is one of: yes, no.
Answer with JSON only, exactly two keys: "urgency" and "escalate".
Do not add commentary, markdown fences, or explanation.

Message: <message>
```

One-shot, where the single example is hired purely for job 1 — it exists to demonstrate the exact output shape, and its content is deliberately boring so it does not teach anything about the task:

```text
Classify the customer message by urgency and by whether it needs a human.

Urgency is one of: critical, high, normal, low.
critical = service is down or data loss is occurring right now.
high     = a person is blocked from working and has no workaround.
normal   = degraded but there is a workaround.
low      = question, request, or cosmetic issue.

Escalate is one of: yes, no.
Answer with JSON only, exactly two keys: "urgency" and "escalate".
Do not add commentary, markdown fences, or explanation.

Example:
Message: The export button is greyed out on weekends.
{"urgency": "low", "escalate": "no"}

Message: <message>
```

Notice what the example is doing and what it is not. It demonstrates the exact JSON shape, the quoting style, the key order, and the absence of any preamble — four things the instruction described in prose and the example shows directly. It deliberately does *not* demonstrate a critical case, so it does not bias the label prior. Whether it earns its tokens is an empirical question, and task 4 below is how you answer it for your own task.

### Part 4 — The four ways more examples make it worse

Everyone teaches that examples help. Almost nobody teaches the failure mechanisms, which is why beginners are surprised when a bigger example block degrades output. There are four, and they are independent — you can hit any one of them while the others are fine.

**Mechanism 1: recency and ordering bias.** The label nearest the question carries more weight than the labels further up the prefix. This is the practical consequence of the attention mechanism, and it is measured, not folklore — Lu et al. (arXiv:2104.08786) found that simply reordering the same demonstrations produced large accuracy swings, and Zhao et al. (arXiv:2102.09690) found that this and related effects could be corrected by adjusting the model's output distribution toward uniformity. That correction working at all is strong evidence that the bias is a distributional artifact of the prompt rather than genuine evidence about the task.

The signature in your own logs: **your accuracy changes when you shuffle the examples and nothing else.** Same examples, same order-independent content, different score. If that happens, you have an ordering artifact and your "measured improvement" may be noise you got lucky with.

> **Analogy:** imagine asking five colleagues for advice in a fixed order and then deciding immediately after hearing the fifth. You will over-weight the last voice, not because it is wisest but because it is freshest.
>
> **Where it breaks:** your colleagues know they are in a sequence and can correct for it. The model has no such awareness, and there is no equivalent of "let me reconsider all five together". More importantly, unlike a conversation, you can *measure* the effect cheaply here — shuffle and re-run — and you cannot do that with your colleagues.

The mitigation is not "put the best example last", because you do not know which is best in advance and the effect interacts with the specific input. The mitigation is to **measure across orderings** rather than measuring one ordering and declaring victory. Task 5 makes you do this.

**Mechanism 2: majority-label bias.** Your examples carry an implicit prior over labels. If four of your five examples are `normal`, the model reads the prompt as a document in which `normal` is the ambient answer. This is not a bug in the model; it is a correct inference about the distribution of the document it is continuing.

The signature: **your predicted label distribution does not match your true label distribution, and it drifts toward your example distribution.** If your real traffic is 5% critical and your model outputs 1% critical, and your examples were 0% critical, you have found it.

The mitigation is to balance the example block across labels rather than sampling it to match your traffic. Counter-intuitively, matching the base rate is *worse* here — if 90% of your traffic is one class, a proportional example block is nearly a majority-label prompt.

**Mechanism 3: shortcut learning.** This is the most damaging and the hardest to see. If some surface feature correlates with the label *in your examples* but not *in the task*, the model may learn the surface feature. You showed it five positive reviews that all happened to be long. It may now treat length as evidence.

The signature: **your accuracy looks excellent on inputs that resemble your examples and collapses on inputs that do not.** If a shuffled split scores 0.94 and your hand-picked set of real examples scores 0.6, you almost certainly have this. The gap between the two is the size of your problem.

The mitigation is diversity-aware selection (Part 5) and, above all, drawing your test set from a different source than your examples. If you select examples by looking at the same data you evaluate on, you are measuring memorisation.

**Mechanism 4: cost and latency, forever.** This one is not a correctness bug, and it is the one that actually stops people.

Examples are input tokens. They sit in the prefix of **every single call**. They are not paid once at development time; they are paid on call one, call ten thousand, and call one million. Phase 3's token material and Phase 8's usage logging both apply directly here, and the arithmetic is unforgiving:

```python
# Cost of one example block, measured rather than assumed.
import tiktoken

enc = tiktoken.get_encoding("cl100k_base")   # use the encoding for YOUR model family

example_block = """Example:
Message: The export button is greyed out on weekends.
{"urgency": "low", "escalate": "no"}

"""

n_examples = 5
tokens_per_example = len(enc.encode(example_block))
extra = tokens_per_example * n_examples
calls_per_day = 5_000

print(f"{tokens_per_example} tokens per example")
print(f"{extra} extra input tokens per call")
print(f"{extra * calls_per_day:,} extra input tokens per day")
print(f"{extra * calls_per_day * 30:,} extra input tokens per month")
```

Run that before you decide, not after. The number is usually larger than people expect, because they compare the example to the *question* — a sentence — rather than to the *instruction*, which may already be most of the prompt.

Tokenisers differ by model family, so treat the count above as an estimate and reconcile it against the provider's reported `usage` field, which is the authority. And note the asymmetry: extra input tokens cost less than extra output tokens at most providers, but the example block is on **every** call while the output exists once. Compare per-call totals, not per-token prices.

Latency matters too. More input tokens means more prefill work per call, and — through the mechanism Phase 4 covers — a longer prefix for the final answer tokens to attend over. The effect is usually modest against generation time, but it is not free.

### Part 5 — Where the examples come from: fixed, retrieved, or none

Now the design decision. You have a task that seems to want examples. Where do they come from?

**Fixed examples.** A hand-written block, identical on every call.

- *Wins:* stable prefix, therefore cacheable; easy to version and review; predictable cost; you can reason about exactly what evidence the model sees.
- *Loses:* blind to the input. A fixed block that demonstrates `critical` cases will be shown to a question about a cosmetic issue, and the demonstration is at best neutral there.
- *Choose it when:* the job is format induction. Format does not vary by input, so there is nothing for a dynamic block to adapt to.

**Retrieved examples.** At runtime, find the examples most similar to the current input and build the block from those. This is the natural extension of the embeddings track — Phase 6 of foundations — and it is a real technique with real results.

- *Wins:* the evidence is relevant to the input; you can have a large example library (hundreds) while paying for only a few; it handles long-tail inputs far better than a fixed block can.
- *Loses:* **the prefix changes on every call**, which is the entire problem discussed below; it adds a retrieval component to maintain and evaluate; poor retrieval silently degrades quality in a way that looks like a model problem.
- *Choose it when:* inputs are genuinely heterogeneous, you have a labelled library big enough to retrieve from, and you have measured that the gain exceeds the caching loss.

**Diversity-aware selection.** A refinement that applies to both, and the fix for shortcut learning. Rather than picking the examples that look most like each other, or the ones nearest the query, deliberately cover the space:

- Cover the **label space** evenly — every label appears, so no label becomes the ambient prior.
- Cover the **surface space** — vary length, tone, formatting, and register independently of the label, so no surface feature correlates with a label.
- Cover the **task space** — include the boundaries. A `normal`-versus-`high` example is more informative than a third unambiguous `low`.

The third point is the one people miss. Unambiguous examples teach the format; boundary examples teach the *decision*, and the decision is usually where the errors live.

Two hard rules apply to all three approaches:

**Never draw examples from the set you evaluate on.** If you do, your measurement is partly memorisation, and the very shortcut-learning signal you need to detect is the signal you have destroyed. Split first, then choose examples only from the training side.

**Keep the example block a labelled artifact in version control.** Prompts are code. "Which version of the prompt scored 0.81" must be answerable six weeks later, and it is not answerable if you have been editing a string in a script.

### Part 6 — The tension nobody mentions: dynamic examples destroy caching

This is the part of the phase that matters most on a zero budget, and it is the part that most few-shot tutorials omit entirely.

Recall the distinction from the foundations track, because it is load-bearing: the **KV cache** is automatic and exists within a single request; **provider prompt caching** is a product feature that operates *across* requests and is billed — typically a cheaper rate for a cache hit, sometimes a premium to write the cache in the first place, and an expiry window after which the entry is gone.

The mechanism of provider caching is **prefix matching**. The provider stores the computed state for a prefix of your prompt and reuses it when a later request begins with the identical prefix. It matches at the *beginning*. The moment your prompt diverges from the stored prefix, nothing after that point can be reused.

Now put the two ideas together, because the collision is immediate:

> **Fixed examples are a stable prefix and cache perfectly. Retrieved examples change the prefix on every call, so every call is a cache miss.**

Every request with a different example block forces the provider to compute that whole block from scratch. On top of that, if the retrieved block sits at the *front* of your prompt, it also invalidates the instruction text behind it — because matching stopped at the first difference. You have not merely paid for your examples; you have paid full price for everything after them too.

On a paid account with a large volume, this is a line item. On a zero budget, it is often decisive: caching is frequently the single largest available discount on a repeated-prefix workload, and dynamic examples are the single easiest way to forfeit it.

**The mitigation is to put the varying block last.** Order your prompt so that the parts which are identical across calls — system instruction, task rules, output schema, fixed format demonstration — come first, and the parts which vary — retrieved examples, then the user's input — come last. That way a cache hit still covers the stable head, and you pay fresh only for the tail.

```text
+--------------------------------------------------+
| STABLE PREFIX  (identical every call)            |  <- cacheable
|   system instruction                             |
|   task rules and label definitions               |
|   output schema                                  |
|   ONE fixed format demonstration                 |
+--------------------------------------------------+
| RETRIEVED EXAMPLES  (changes per call)           |  <- never cached
+--------------------------------------------------+
| USER INPUT                                       |  <- never cached
+--------------------------------------------------+
```

Three honest caveats before you build on this.

**The retrieval decision is a cost decision, not just a quality one.** The right comparison is not "retrieved examples versus fixed examples" on accuracy alone. It is "the accuracy gain from relevance" against "the caching discount you just gave up, plus the latency of the retrieval step". Measure both sides. Task 6 is exactly this measurement.

**Caching is a hosted-provider feature with volatile terms.** Minimum prefix lengths, cache lifetimes, whether writes carry a premium, whether caching is automatic or opt-in, and how it is reported in the usage object all differ between providers and all change. As of 2026-09 these terms vary substantially across the major providers — read the current documentation for your provider rather than any summary here, including this one.

**The ordering fix has its own cost.** Retrieved examples placed after the instruction rather than immediately before the question are further from the question, and the recency effect from Part 4 says the nearest evidence weighs most. You are trading a little evidence salience for a lot of cache. On most workloads that trade is clearly worth it; on a short prompt with expensive examples and a small caching discount, it may not be. No universal answer, only a measurement.

### Part 7 — The recipe, and where examples stop working

Here is the procedure. It is deliberately conservative, and it is the thing to take away from this phase even if you forget every mechanism above.

1. **Start zero-shot.** Write the instruction so it carries the whole specification: the task, the constraints, the output shape, and what to do when the input is ambiguous. Run it against your labelled evaluation set and record the score.
2. **If the output format is unreliable — right shape wrong sometimes, extra prose, malformed JSON — add exactly ONE example.** One, not five. Position it as a pure format demonstration, with deliberately unremarkable content so it does not bias the label prior. Re-run the same evaluation set and compare.
3. **If the format is now stable and the score is good enough, stop.** You are done. Every additional example is now purely a cost with no measured benefit.
4. **Only add more examples when a measured eval improves.** Not when it feels better. Not when the output looks nicer in the three cases you happened to try. A measured improvement on a held-out set, larger than the run-to-run variation you observed, and ideally stable across orderings.
5. **Re-check the whole curve whenever you change the model.** Example counts tuned for one model do not transfer. A model with stronger instruction-following may need zero examples for a task where a weaker one needed three, and the extra examples on the stronger model are now pure cost — or worse, they may actively move the label prior.

Step 4 is where discipline is required, and it is worth being blunt about why. **The default direction of prompt drift is more examples, and the default reason is superstition.** Someone adds an example because an output was wrong once. Nobody removes examples, because removing them feels like losing safety. Prompt blocks grow monotonically and nobody measures the cost. The recipe is a counter-pressure.

Now the mandatory question: **where does this stop working entirely?**

**When the model lacks the capability.** Examples condition existing behaviour; they do not add ability. If the task requires knowledge the model does not have, arithmetic it cannot do reliably, or a language it handles poorly, a longer example block produces more confident wrong answers in a better format. The fix is retrieval, a different model, or finetuning — the tracks that exist for exactly this reason.

**When the task definition is ambiguous rather than the format.** Examples will paper over it, and Part 2 explained why that is worse than it looks. Fix the instruction.

**When inputs are far more heterogeneous than your examples can cover.** A fixed block of five examples covering five input styles will fail on the sixth style, and you will not know it is failing because your evaluation set was drawn from the same five styles. This is the case that genuinely justifies retrieval — or a much larger evaluation set before you trust any number.

**When the prompt is already near the context limit.** Every example competes with your retrieved documents and your conversation history. In a long-context pipeline, examples are usually the first thing that should go, and the Lost in the Middle result (arXiv:2307.03172) is the reason to be careful about where the survivors sit: that work found information placed in the middle of a long context is used least reliably, with middle-position accuracy falling below the model's closed-book accuracy of 56.1% in their setup of 10, 20 and 30 documents. Reordering a long context is not cosmetic.

That result is worth stating precisely, because it is widely misreported. The finding is not "a 20% drop". It is that *position matters measurably*, and that in their configuration the middle was bad enough to underperform answering with no documents at all. Test position explicitly rather than assuming first-is-best or last-is-best.

**When a determinism or audit requirement exists.** Few-shot prompts are more sensitive to ordering and to provider-side changes than instructions are, because they introduce more surface for artifacts. If your output must be reproducible, prefer instructions and schemas, pin your model snapshot, and budget for re-baselining.

**When the task is a capability benchmark rather than a product feature.** If you find yourself adding examples to squeeze out the last few points on a public benchmark, check what the benchmark's own few-shot convention is before comparing your number to anyone else's. Comparing an n-shot run against a zero-shot published number is the most common way to fool yourself in this field.

## Hands-on practice tasks

1. Pick one task you actually care about and write a zero-shot prompt for it with a fully specified output format. Record the prompt, the model, and the version in git. <!-- id: prompt-02-few-shot-and-examples-t01 band: quick energy: low -->
2. Build a labelled evaluation set of 30–50 examples for that task, drawn from inputs you did not use to design the prompt. Store it as a file the harness reads. <!-- id: prompt-02-few-shot-and-examples-t02 band: focused energy: normal -->
3. Write a scoring harness that runs a prompt variant against the whole evaluation set and reports accuracy plus a per-label breakdown. Run it on your zero-shot prompt. <!-- id: prompt-02-few-shot-and-examples-t03 band: focused energy: normal -->
4. Build the diminishing-returns curve: run the same task with 0, 1, 2, 3 and 5 examples and plot accuracy against example count. Find where the curve flattens on your task. <!-- id: prompt-02-few-shot-and-examples-t04 band: deep energy: high -->
5. Take your best few-shot prompt and run the *same* examples in five different orderings. Record the spread. If the spread is larger than the difference you were celebrating, you have found an ordering artifact. <!-- id: prompt-02-few-shot-and-examples-t05 band: deep energy: high -->
6. The caching comparison: run a fixed-example prompt and a retrieved-example prompt on a hosted provider and compare the cached-token counts reported in the usage object, plus measured latency. Compute what the difference costs across your expected call volume. <!-- id: prompt-02-few-shot-and-examples-t06 band: deep energy: high -->
7. Deliberately construct majority-label bias: build an example block that is 80% one label and run it against a balanced evaluation set. Record how the predicted label distribution shifts. Then rebuild with balanced examples and re-measure. <!-- id: prompt-02-few-shot-and-examples-t07 band: focused energy: normal -->
8. Deliberately construct shortcut learning: take one label in your set and build examples where that label always co-occurs with a surface feature such as length or formatting. Show the model exploiting it, then break the correlation and re-measure. <!-- id: prompt-02-few-shot-and-examples-t08 band: deep energy: high -->
9. Measure the exact input-token cost of your example block with a tokeniser, then compute that cost across 1,000, 10,000 and 100,000 calls. Reconcile your estimate against the provider's reported usage on a real call. <!-- id: prompt-02-few-shot-and-examples-t09 band: focused energy: normal -->
10. Take a working few-shot prompt and rewrite it as zero-shot by encoding the example's information as an explicit rule or a JSON schema in the instruction. Compare the score and the token cost. <!-- id: prompt-02-few-shot-and-examples-t10 band: focused energy: high -->
11. Produce a confidence-band table: dump every evaluation item with its predicted and true label, sort by whether it was correct, and look for a surface pattern in the errors. Write down what the pattern suggests about your examples. <!-- id: prompt-02-few-shot-and-examples-t11 band: focused energy: normal -->
12. Take one genuinely ambiguous input from your set, and write the instruction so it resolves the ambiguity explicitly without any example. Confirm the model handles the ambiguous input the way the instruction says, not the way your examples suggested. <!-- id: prompt-02-few-shot-and-examples-t12 band: focused energy: high -->
13. Build both fixed and retrieved example blocks for the same task, and measure accuracy for each. Note which one wins and by how much, and whether the gap exceeds your run-to-run variation. <!-- id: prompt-02-few-shot-and-examples-t13 band: deep energy: high -->
14. Break your prompt on purpose: feed it an input from a category your evaluation set does not contain, and record whether it fails loudly or quietly. Quiet failure is the finding worth writing down. <!-- id: prompt-02-few-shot-and-examples-t14 band: focused energy: normal -->
15. Do the whole phase on a local model through Ollama first, then repeat tasks 4 and 5 on a hosted model. Note where the optimal example count and the optimal ordering differ between them. <!-- id: prompt-02-few-shot-and-examples-t15 band: ongoing energy: normal -->
16. Write a one-page decision note for your own project: for each task you are building, whether it gets zero-shot, one example, a fixed block, or retrieval — and the measurement that justifies each choice. <!-- id: prompt-02-few-shot-and-examples-t16 band: ongoing energy: low -->

## Common Pitfalls

**Assuming more examples means better output.** The curve flattens fast for straightforward tasks and can turn downward through any of the four mechanisms in Part 4. Measure the marginal value of the example you are about to add, or do not add it.

**Reaching for examples before fixing the instruction.** If the instruction is ambiguous, an example hides the ambiguity instead of resolving it, and the hidden ambiguity resurfaces on inputs that do not resemble your examples.

**Using examples to teach a capability the model does not have.** You are conditioning, not training. A longer prompt cannot install knowledge or arithmetic. Reach for retrieval, a different model, or finetuning.

**Ordering blindness.** The same examples in a different order can score meaningfully differently. If you never shuffle, you are reporting a number that includes an artifact you did not control for.

**Building the example block from the evaluation set.** Guarantees an inflated score and destroys your ability to detect shortcut learning, because you have removed exactly the distribution shift that would reveal it.

**Examples that correlate a surface feature with a label.** Five positive examples that all happen to be long teach length, not sentiment. Vary length, tone and formatting independently of the label.

**Matching your example distribution to your traffic distribution.** When traffic is imbalanced, a proportional block is close to a majority-label prompt. Balance the labels in the block instead.

**Ignoring the token cost because "it's only a few examples".** Five examples are on every call forever. Compute the monthly number before you commit, not after the bill arrives.

**Dynamically selecting examples without thinking about caching.** A per-call example block is a per-call cache miss, and if it sits at the front of the prompt it invalidates everything behind it too. Put the varying block last and measure what the relevance gain actually buys you.

**Re-tuning example counts after changing the model.** Optimal example count is model-specific. Carrying a block tuned for one model onto a stronger one usually means paying for examples that no longer do anything.

**Judging prompt quality by reading outputs.** Three outputs looking good is not evidence. Build the labelled set first, then decide with a number — this is the whole methodological point of the phase.

**Confusing few-shot prompting with finetuning.** Nothing in the prompt changes the weights, nothing persists after the request, and nothing is learned in any durable sense. The vocabulary invites the confusion; the mechanism does not support it.

**Forgetting that examples compete for context.** In a pipeline with retrieved documents and conversation history, the example block is one more claimant on the same window, and it should justify its space like anything else.

## Deliverable / proof of work

Write `portfolio/prompting/02-few-shot-and-examples.md` containing:

- **Your task and your zero-shot prompt**, with the output format fully specified in the instruction and the whole thing committed to git so the version is identifiable.
- **Your evaluation set** — a description of where the 30–50 items came from, how you split them, and an explicit statement that no example was drawn from the evaluation side.
- **The diminishing-returns curve**: a table of example count against measured accuracy (0, 1, 2, 3, 5), plus one sentence naming where the curve flattened on your task and what you think that says about which job the examples were doing.
- **The ordering experiment**: the same examples in five orderings with the resulting scores, and the spread. State honestly whether your headline improvement survives the spread.
- **One deliberate failure you caused**: majority-label bias, shortcut learning, or an ordering artifact. Show the prompt, the measurement that exposed it, and the fix.
- **The token arithmetic**: measured tokens per example, extra input tokens per call, and the projected monthly input-token volume at a stated call rate. Reconcile the estimate against the provider's reported usage from at least one real call.
- **The caching comparison** — the fixed-example and retrieved-example runs, with cached-token counts and latency where your provider reports them. If you could not use a hosted provider, write the caching section from the documented mechanism instead, and explicitly mark it as unverified on your setup.
- **Your recipe applied**: the final prompt you would actually ship, with a written justification for the number of examples in it — or a justification for zero.
- **A section titled "Where examples are the wrong tool here"** — at least two concrete cases from your own work, with the alternative technique you would use instead.

## Checklist

- [ ] I can explain what an example changes in the forward pass and why no weights are updated <!-- id: prompt-02-few-shot-and-examples-c01 energy: low -->
- [ ] I can name the three jobs an example can do and say which one carries most of the value <!-- id: prompt-02-few-shot-and-examples-c02 energy: normal -->
- [ ] I can state the honest finding about format demonstration versus extra examples for straightforward classification <!-- id: prompt-02-few-shot-and-examples-c03 energy: normal -->
- [ ] I have a labelled evaluation set with 30 or more items that I did not use to build the prompt <!-- id: prompt-02-few-shot-and-examples-c04 energy: normal -->
- [ ] I have measured my own diminishing-returns curve rather than assuming where it flattens <!-- id: prompt-02-few-shot-and-examples-c05 energy: high -->
- [ ] I have run the same examples in multiple orderings and know my ordering spread <!-- id: prompt-02-few-shot-and-examples-c06 energy: high -->
- [ ] I can describe the signature of majority-label bias and how to fix it <!-- id: prompt-02-few-shot-and-examples-c07 energy: normal -->
- [ ] I can describe the signature of shortcut learning and how to fix it <!-- id: prompt-02-few-shot-and-examples-c08 energy: high -->
- [ ] I have deliberately caused one of these failures and shown the measurement that exposed it <!-- id: prompt-02-few-shot-and-examples-c09 energy: high -->
- [ ] I can compute what my example block costs in input tokens per call and per month <!-- id: prompt-02-few-shot-and-examples-c10 energy: normal -->
- [ ] I can explain why examples are paid on every call rather than once <!-- id: prompt-02-few-shot-and-examples-c11 energy: normal -->
- [ ] I can explain why dynamically retrieved examples defeat prefix caching <!-- id: prompt-02-few-shot-and-examples-c12 energy: high -->
- [ ] I have ordered my prompt so the cacheable part is a stable prefix and the varying part is last <!-- id: prompt-02-few-shot-and-examples-c13 energy: normal -->
- [ ] I can state what a cache hit and a cache miss cost on my provider, with the caveat that the terms change <!-- id: prompt-02-few-shot-and-examples-c14 energy: normal -->
- [ ] I can explain why examples cannot add a capability the model lacks <!-- id: prompt-02-few-shot-and-examples-c15 energy: normal -->
- [ ] I can explain why an example can hide an under-specified instruction rather than fixing it <!-- id: prompt-02-few-shot-and-examples-c16 energy: high -->
- [ ] I keep my prompts in version control and can say which version produced which score <!-- id: prompt-02-few-shot-and-examples-c17 energy: low -->
- [ ] I can name at least two situations where examples are the wrong tool and say what to use instead <!-- id: prompt-02-few-shot-and-examples-c18 energy: normal -->
- [ ] I know that optimal example count is model-specific and I re-check it when I change models <!-- id: prompt-02-few-shot-and-examples-c19 energy: normal -->
- [ ] I have actually removed an example because a measurement said it did not help <!-- id: prompt-02-few-shot-and-examples-c20 energy: high -->

## Quiz

### Q1. You add four more examples to a working few-shot sentiment classifier and accuracy does not move. What is the best explanation? <!-- id: prompt-02-few-shot-and-examples-q01 energy: high -->

- [x] The first example already demonstrated the format and label space, which is the part examples reliably teach, so the extra demonstrations added little
- [ ] The model is at its capability ceiling for this task
- [ ] The provider is truncating your prompt before the extra examples
- [ ] Accuracy measurements on classification tasks are too noisy to detect a change

**Why:** The demonstrations literature — notably Min et al. (arXiv:2202.12837), where randomising labels and inputs left performance surprisingly intact — points to format and label-space demonstration as the durable effect. Once your first example has pinned the output shape, additional examples for a task the model already understands are mostly redundant evidence. That is not a noise problem and not a truncation problem; it is the curve flattening.

### Q2. A colleague says the model "learned the task from the examples in the prompt". What is wrong with that statement? <!-- id: prompt-02-few-shot-and-examples-q02 energy: normal -->

- [ ] Nothing — few-shot prompting is a form of gradient descent with a very small learning rate
- [ ] It is wrong only because the learning is temporary and is discarded at the end of the day
- [x] No weights change; the examples are prefix text the model conditions on, so nothing is learned in any durable sense
- [ ] It is wrong because the model learns only from the system prompt, not from the user turns

**Why:** In-context learning is conditioning, not training. The examples become part of the prefix and shift the next-token distribution for this request only. Nothing persists after the response is returned, and the same prompt with the examples removed behaves as if they had never existed. This is also why examples cannot add a capability the model does not already have.

### Q3. Your model outputs one label far more often than your traffic warrants. Your example block contains five examples, four of which carry that label. What is happening? <!-- id: prompt-02-few-shot-and-examples-q03 energy: normal -->

- [ ] The model is overfitting to your training data at inference time
- [ ] The tokeniser is biasing the model toward shorter labels
- [ ] The provider's safety layer is collapsing your label space
- [x] Majority-label bias — the distribution of labels in your examples acts as an implicit prior the model infers from the prompt

**Why:** The example block is a document the model continues, and the relative frequency of labels in that document is evidence about the ambient distribution. A block that is 80% one label tells the model that label is the default answer. The fix is to balance labels across the example block rather than sampling them to match traffic, which on skewed traffic makes the problem worse.

### Q4. Your prompt scores well on your evaluation set but performs poorly on new inputs from a slightly different source. What is the most likely cause? <!-- id: prompt-02-few-shot-and-examples-q04 energy: high -->

- [ ] The model degrades over time between calls
- [x] Shortcut learning — the examples share a surface feature correlated with the label in your sample but not in the task, so the model learned the feature
- [ ] Your evaluation set is too small to be meaningful in any circumstance
- [ ] The provider changed the model silently between your two test runs

**Why:** This gap is the signature. When examples are drawn from one distribution and tested on another, the model's learned surface regularities stop applying and accuracy collapses. The corrections are diversity-aware selection — varying length, tone and formatting independently of the label — and constructing examples so that no surface feature predicts the label.

### Q5. You replace a fixed example block with dynamically retrieved examples to improve relevance. What is the cost you may have just incurred? <!-- id: prompt-02-few-shot-and-examples-q05 energy: high -->

- [ ] A higher output-token bill, because retrieval makes answers longer
- [x] Every call now has a different prefix, so provider prompt caching misses on every request — and if the examples sit at the front, everything after them is recomputed too
- [ ] Loss of access to the model's KV cache, which retrieval disables
- [ ] Retrieval forces a higher temperature, which increases variance

**Why:** Prompt caching matches on a shared prefix. A per-call example block means no two requests share a full prefix, so the cached state is never reusable, and any stable instruction text placed after the varying block is invalidated along with it. The standard mitigation is to order the prompt so the stable instruction and schema come first and the retrieved examples come last.

### Q6. Which statement about example ordering is correct? <!-- id: prompt-02-few-shot-and-examples-q06 energy: normal -->

- [x] Ordering measurably changes accuracy, so the same examples in a different sequence can produce a different score
- [ ] Ordering has no measurable effect as long as the same examples are present
- [ ] Ordering matters only when examples are longer than the instruction
- [ ] Ordering matters only for tasks with more than ten labels

**Why:** Lu et al. (arXiv:2104.08786) found large accuracy swings from reordering the same demonstrations, and Zhao et al. (arXiv:2102.09690) found related biases that could be corrected by adjusting the model's output distribution. If you never shuffle your examples, the number you report includes an ordering artifact you did not control for.

### Q7. When is a worked example most clearly worth its token cost? <!-- id: prompt-02-few-shot-and-examples-q07 energy: normal -->

- [ ] When the task is a straightforward classification the model already understands
- [ ] When the model lacks the domain knowledge the task requires
- [ ] When you want the model to learn a new skill from the demonstrations
- [x] When the output has a specific structure — a particular JSON schema or house format — that prose instructions keep failing to pin down

**Why:** Format induction is the most reliable thing an example does, and it is the job that survives even when the example's content is destroyed. It is also the job you can sometimes replace with an explicit schema at zero per-call token cost, which is always the comparison to run first. Examples do not add missing knowledge — that is retrieval or finetuning — and they do not install new skills.

### Q8. You are on a zero budget with a fixed, high-volume daily call count. What is the right default? <!-- id: prompt-02-few-shot-and-examples-q08 energy: high -->

- [ ] Use dynamically retrieved examples, because relevance always beats token cost
- [ ] Use at least five examples, because more evidence is a safer default than too little
- [x] Start zero-shot, add exactly one example only if the output format is unreliable, and add more only when a measured evaluation improves
- [ ] Drop examples entirely and rely on raising the temperature for variety

**Why:** The recipe is conservative because the default direction of prompt drift is toward more examples and the default reason is superstition. Adding examples is a hypothesis that costs input tokens on every call forever; it should be accepted only when a held-out measurement shows a gain larger than your run-to-run variation. On a fixed budget, that discipline is also the cheapest correctness practice available.

## You're ready to move on when...

You can explain, without notes, what an example changes inside the forward pass and why no weights move. You have measured your own diminishing-returns curve on a real task and can say where it flattened and which job the examples were doing. You have deliberately caused one of the four failure mechanisms — ordering, majority-label bias, shortcut learning, or the cost of an example block — and shown the measurement that caught it. You can compute what your examples cost in input tokens per call and per month, and you can explain why dynamically retrieved examples defeat prefix caching and how to order a prompt so the cacheable part stays stable. You have applied the recipe end to end at least once: zero-shot, then one example for format, then more only when a number said so. And you can name at least two situations in your own work where examples are the wrong tool entirely, along with the technique you would use instead.

## Free vs Paid

### What's free is enough

Everything in this phase that matters can be done at zero cost, and the parts that cannot are clearly marked.

**Exploration and iteration costs nothing if you go local.** Ollama runs a model on your own machine with no key and no per-token bill. Every exploratory step — the diminishing-returns curve, the ordering experiment, the deliberate majority-label and shortcut-learning failures — is better done locally anyway, because you will run each variant dozens of times and you want to be free to be wasteful. The mechanisms you observe transfer; only the exact numbers differ.

**The measurement harness is free.** A labelled set of 30–50 items, a scoring script, and a token counter are all plain Python with no dependencies that cost anything. `tiktoken` is free and open source, and it also happens to be the honest way to answer the cost question rather than guessing.

**A prompt-counting endpoint exists and is public.** If you want the provider's own count before sending, OpenAI publishes `POST /v1/responses/input_tokens` as a documented endpoint, which means pre-flight token counting is not a guessing game on that provider. Check whether your provider offers an equivalent.

**Version control is free.** Git is the difference between "which prompt scored 0.81" being answerable and being a guess. There is no cheaper quality practice in this phase.

### What a paid tier adds

Exactly one thing in this phase genuinely requires a hosted, funded account, and it is worth being precise about which.

**Prompt caching is a hosted-provider feature.** There is no local equivalent you can measure, because the caching discount is a billing arrangement between you and the provider, not a property of the model. Caching terms — minimum prefix lengths, cache lifetimes, whether writing to the cache carries a premium, whether caching is automatic or opt-in, and how cached tokens appear in the usage object — differ between providers and change. **These are volatile specifics: as of 2026-09 they vary substantially across the major providers, so read the current documentation for the provider you are actually using rather than any summary, including this one.** For one concrete calibration, Anthropic's current caching page prices a cache read at 0.1x the base input rate and a 5-minute cache write at 1.25x (1-hour writes at 2x), with a 5-minute default lifetime and an optional 1-hour TTL — but treat those as one provider's numbers on one date, not a general rule, because the multipliers and lifetimes differ elsewhere. If your provider reports cached-token counts in its usage object, task 6 gives you a real number for the caching penalty of dynamic examples. If you cannot use a hosted provider, do task 6 by reasoning from the documented mechanism and mark it in your deliverable as unverified on your setup.

**A smaller second benefit is realism.** Free tiers tend to serve smaller or older models with tighter rate limits. Since the optimal example count and the optimal ordering are model-specific, doing tasks 4 and 5 on the model you actually intend to ship with is worth something. But it is a refinement, not a prerequisite — a local model with a different optimal example count still teaches you that the optimal count exists and must be re-measured.

### When it's worth paying

**Not for this phase.** Every mechanism here is visible on a local model, and the one hosted-only measurement can be reasoned about correctly from the documented behaviour of prefix matching without spending anything. If you have a provider free tier, use it for task 6 and stop there.

The honest threshold arrives later, and it is a cost threshold rather than a learning one. Once you are shipping something with a real call volume and a stable repeated prefix, prompt caching stops being a curiosity and becomes the single largest lever on your input bill — and at that point the example block's size and position are not style choices, they are the difference between paying for your prefix once and paying for it a million times. That is the moment to fund an account and measure properly.

Until then: build the harness, run the curve, keep the examples in version control, and start every new prompt at zero-shot.
