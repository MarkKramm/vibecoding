---
id: cost-04-model-routing
track: cost
phase: 4
order: 40
title: Model Routing and Cascades
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/cost/04-model-routing.md
exit_criteria: >
  You can take one real task, split it into the cases that genuinely need a
  strong model and the cases that do not, and say what evidence justifies the
  split. You have built a cascade with a named validation gate, measured the
  gate's false-accept and false-reject rates on a labelled set, and compared the
  cascade against always-using-the-strong-model on accuracy, cost and latency —
  not on cost alone. You can state the one failure mode that makes a cascade
  dangerous, and you can say when the right answer is the low-machinery
  alternative instead: develop against one cheap model and reserve the strong
  model for final validation.
---

# Phase 4 — Model Routing and Cascades

## Goal of this phase

Your free beta access is ending. When it does, every call you make has a price, and the price is not the same for every call. The question this phase answers is the one that decides whether your projects survive that transition: **which requests actually needed the expensive model?**

Most of them did not. That is the uncomfortable fact at the centre of this phase. A large fraction of what you currently send to a frontier model is extraction, classification, reformatting, summarising, or looking something up in text you just handed it — work a model two orders of magnitude cheaper does just as well. Paying frontier prices for that work is the single largest avoidable cost in a hobby project, and it is invisible because you never see the counterfactual.

But the fix is not "use a smaller model". It is a **routing decision**, and a routing decision requires evidence. This phase teaches the three ways to make that decision — by task type, by input shape, and by measured difficulty — and then the hard part: **the cascade**, where a cheap model answers first and a check decides whether to escalate. Cascades are where this subject stops being obvious, because the check is a second model call that costs money and can be wrong in both directions, and a cascade that is not measured is a cascade that quietly ships worse answers while looking thrifty.

By the end you will have built one real cascade, measured whether it was worth building, and — most likely — concluded that for a $0 budget the honest answer is the low-machinery alternative.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Day 1 is the lesson and the eval-set decision. Days 2–3 build the labelled set and the deterministic gate. Day 4 builds the escalation path and runs the three-way measurement. Day 5 is the write-up and the honest recommendation.

Add a half-day if you have never computed a confusion matrix. The arithmetic is trivial — four counts and two ratios — but this phase's entire argument rests on you being able to read one, because that is the only thing that tells you whether your gate is doing anything.

Do the measurement while your free access still works. A three-way comparison (cheap model, strong model, cascade) over a hundred labelled cases is the most API-hungry thing in this track, and it is exactly the thing you cannot do cheaply after the beta ends.

## Skills you'll gain

- Classify a workload by task type, input length, and measured difficulty, and say which of the three justifies a routing split
- Explain why a cascade's saving is bounded by the fraction of traffic the cheap model handles unsupported, and compute that bound
- Choose a gate — schema validation, self-reported confidence, a small judge, or a deterministic rule — and say what each one can and cannot detect
- Measure a gate as a classifier: false-accept rate, false-reject rate, and the cost of each error in the other direction
- Build a cascade with a bounded escalation path, a per-request cost log, and a hard escalation ceiling
- Compare a cascade against always-using-the-strong-model on accuracy, cost **and** latency, and explain why reporting only cost is dishonest
- Name the failure mode where a cheap model produces plausible-but-wrong output that passes the gate, and say which gate designs are most exposed to it
- Recognise the case where routing is not worth its complexity, and run the low-machinery alternative instead
- Decide, before writing routing code, whether you have an eval set that could prove the cheap model is good enough

## Specific topics to learn

### The three axes of a routing decision

- Task type: classification, extraction, and reformatting have one defensible answer; open-ended reasoning does not
- Input length: long inputs cost more per call, and the model that can hold them is not always the model you want
- Measured difficulty: the same task type varies case by case, and per-case difficulty is the axis a cascade actually exploits
- Why task type is a static decision you can make once, and difficulty is a dynamic decision you make per request

### What a cascade is made of

- The cheap model's answer, the gate, and the escalation decision
- Why the gate — not the cheap model — is the component that determines whether the cascade works
- The token cost of the gate itself, and why a gate that re-reads the full context can erase the saving
- Bounded escalation: a maximum number of tiers, and a ceiling on spend per request

### Gate designs, and what each can see

- Schema validation: catches malformed structure, blind to wrong content
- Self-reported confidence: cheap, and unreliable in a specific and predictable direction
- A small judge model: catches more, costs more, and can be wrong in both directions
- A deterministic rule: free and exact where it applies, and it applies less often than you hope
- Combining gates: a cheap deterministic filter first, an expensive judge only on what survives

### Measuring the cascade honestly

- Accuracy of cheap, strong, and cascade on the same labelled set
- Cost per request for each of the three, including the gate's tokens
- Latency for each of the three, including the escalation penalty on escalated requests
- The threshold sweep: how accuracy and cost move as you move the gate's decision boundary
- Why a cascade usually has worse tail latency than always-using-the-strong-model

### The low-machinery alternative

- Developing against one cheap model and iterating for free
- Reserving the strong model for final validation of finished work rather than for the loop
- What this captures of the cascade's saving, and the one kind of saving it does not capture

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Python 3 | Write the cascade, the gate, and the measurement script | Free | https://www.python.org/downloads/ | Every task in this phase | Any scripting language you already know — the structure is identical |
| `requests` | Make the cheap-model, strong-model and gate calls the cascade is built from | Free | https://requests.readthedocs.io/ | Tasks t03, t05, t06 | Python's built-in `urllib.request` |
| Pydantic | Express the cheap model's output contract once and get the gate for free | Free, open source | https://docs.pydantic.dev/ | Task t04 | `dataclasses` plus hand-written `isinstance` and key checks |
| `jsonschema` (Python) | Validate model JSON against a real schema rather than hoping | Free, open source | https://github.com/python-jsonschema/jsonschema | Task t04 | Hand-written checks in plain Python |
| Ollama | Run two local models of different sizes so a hundred-case three-way comparison costs nothing | Free, open source | https://ollama.com/ | Tasks t02, t05, t06, t07 | A provider free tier, if your machine cannot run a model |
| `scikit-learn` | Compute the gate's confusion matrix and threshold sweep without writing the arithmetic yourself | Free, open source | https://scikit-learn.org/stable/modules/model_evaluation.html | Task t05 | Four counters and two divisions in plain Python |
| `statistics` (Python stdlib) | Put an interval on a small labelled set so you do not over-read a 3-point difference | Free, standard library | https://docs.python.org/3/library/statistics.html | Task t07 | Hand-computed standard error, or just report the raw counts |
| `rich` | Print the comparison tables so you can actually read them | Free, open source | https://rich.readthedocs.io/ | Task t06 | Plain `print` and a Markdown table pasted into your write-up |
| `pytest` | Test the gate against manufactured inputs with no model and no network | Free, open source | https://docs.pytest.org/ | Task t04 | Plain `assert` statements in a script you run by hand |
| lm-evaluation-harness | See what a standardised multi-task eval of a small model looks like | Free, open source | https://github.com/EleutherAI/lm-evaluation-harness | Task t08 | Your own labelled set — smaller, noisier, and about your task |
| OpenRouter | Reach several models of different sizes through one compatible endpoint to compare tiers | Freemium | https://openrouter.ai/models | Tasks t03, t06 | Providers' own free tiers, or two local models of different sizes |
| Google AI Studio | A free-tier endpoint for the strong side of a comparison | Free tier | https://aistudio.google.com/ | Tasks t03, t06 | A larger local model via Ollama — weaker than a frontier model but on the same axis |
| VS Code | Edit the cascade and step through the escalation path | Free, open source | https://code.visualstudio.com/ | Every task | Any editor you already have |

## Free/cheap resources

- **FrugalGPT (Chen, Zaharia & Zou, 2023)** — https://arxiv.org/abs/2305.05176 — the paper that named the LLM cascade. Read the abstract and Section 3, not the whole thing: it reports matching a strong model's performance with up to 98% cost reduction, or improving accuracy over it by 4% at the same cost, on its own benchmark. Those are the paper's numbers on the paper's tasks, not a promise about yours.
- **RouteLLM (Ong et al., 2024)** — https://arxiv.org/abs/2406.18665 — routing as a trained binary classifier between a strong and a weak model, with preference data. Useful mainly as the honest counterpoint to hand-built gates: the authors train a router on data you do not have.
- **LLM-as-judge (Zheng et al., 2023)** — https://arxiv.org/abs/2306.05685 — the paper behind using a model to score output, including its documented biases. If your gate is a small judge, this is what you are trusting.
- **RAGAS (Es et al., 2023)** — https://arxiv.org/abs/2309.15217 — reference-free evaluation metrics. Relevant because a cascade gate is a cheap proxy for the evaluation you cannot afford to run per request.
- **Lost in the Middle (Liu et al., 2023)** — https://arxiv.org/abs/2307.03172 — why routing by input length is not the same as routing by difficulty. Its finding: on its multi-document QA setup, accuracy is highest when the relevant passage is at the start or end of the context, and middle position accuracy falls below the model's 56.1% closed-book accuracy. The setup used 10, 20 and 30 documents.
- **Self-Consistency (Wang et al., 2022)** — https://arxiv.org/abs/2203.11171 — sampling several answers and taking agreement. The original is about accuracy; the same agreement signal is a candidate difficulty estimate for routing, with the caveat that it costs you the samples.
- **Structured Outputs (OpenAI)** — https://platform.openai.com/docs/guides/structured-outputs — one provider's schema-constrained decoding. Read it for what it does and does not guarantee: it constrains shape, not meaning.
- **llama.cpp grammars** — https://github.com/ggml-org/llama.cpp/blob/master/grammars/README.md — the local-model equivalent, so a self-hosted cheap tier can be schema-constrained too.
- **JSON Schema — getting started** — https://json-schema.org/learn/getting-started-step-by-step — the vocabulary your structural gate is written in.
- **Pydantic — models** — https://docs.pydantic.dev/latest/concepts/models/ — the shortest path from an output contract to a gate that raises.
- **scikit-learn — model evaluation** — https://scikit-learn.org/stable/modules/model_evaluation.html — confusion matrices, precision, recall and their definitions, so you name the gate's two error types correctly.
- **Ollama — OpenAI compatibility** — https://github.com/ollama/ollama/blob/main/docs/openai.md — point the same cascade code at two local models and run the comparison a hundred times for free.
- **LiteLLM routing documentation** — https://docs.litellm.ai/docs/routing — what a production routing layer looks like when someone else has built it, including the failure handling you would otherwise write yourself. Read it to decide whether to build your own or not.

## Lesson: The cheap model is right more often than you think, and wrong in a way you cannot see

### Part 1 — The bill is not one number

Start with the shape of the problem, because it is not "the model is expensive".

You have one workflow. It makes, say, four hundred calls a day. Each call sends roughly the same request shape and gets back roughly the same response shape. Yesterday that cost nothing, because you were on a beta. Tomorrow it costs something, and the something is the same for a request that needed deep reasoning and a request that needed a label picked from a list of six.

That is the actual defect: **you are paying a single price for a heterogeneous workload.** The model does not know which of your four hundred calls was hard, and it charges the same rate either way. The rate is set by the hardest call the model can handle, not by the call in front of it.

So the first question is not "how do I make this cheaper". It is: **how much of my traffic is actually hard?**

You will usually find the answer is not much. Here is a real decomposition of a typical document-processing workflow, which is close enough to most beginner projects to be useful:

| Call type | Share of calls | Does the cheap tier get it right? | What makes it hard |
|---|---|---|---|
| Extract structured fields from a form | ~55% | Yes, and a schema gate proves it | Nothing, once the schema is tight |
| Classify into one of N known categories | ~20% | Yes | Nothing — the label set is closed |
| Rewrite for tone or length | ~15% | Mostly | Tone is a judgement; the cheap model drifts flat |
| Resolve ambiguity across two documents | ~8% | Sometimes | Requires holding both and comparing |
| Open-ended reasoning about what to do next | ~2% | No | Genuinely needs the strong model |

Read the last column first. Every row where that column says "nothing" is a row where you are currently paying frontier prices for a lookup. In this decomposition, roughly three quarters of the traffic has no defensible reason to touch an expensive model.

> Think of it as a hospital triage desk. Most people walking in need a bandage, a form, or a prescription refill, and one nurse handles all of them in four minutes. A small fraction need the consultant. The triage desk is not a compromise — it is what stops the consultant's queue from being eleven hours long.

Where the analogy breaks, and this is the whole rest of the phase: **a triage nurse can tell you she is unsure.** She has a body in front of her, a protocol, and the ability to say "I don't know, get the doctor". A cheap language model asked to do extraction will, when it does not know, produce a well-formed wrong answer in exactly the same tone as a well-formed right one. There is no uncertainty signal coming out of it by default. You have to build one, and building one is where cascades get interesting and where they get dangerous.

### Part 2 — Three axes, and only one of them is interesting

Routing decisions look like one skill. They are three, and they have very different costs of implementation.

**Axis 1 — task type.** This is a static decision. You look at a call site in your code and decide, once, which model class serves it. Classification goes to a small model, extraction goes to a small model, open-ended reasoning goes to a large one. There is no per-request logic, no gate, no escalation path. You write a function that maps a call site to a model name and you are done.

This axis is boring and it captures most of the available saving, which is the single most underrated fact in this phase. It requires no cascade at all.

**Axis 2 — input length.** A model capable of holding a 200,000-token context is usually priced for it, and long inputs are billed at the input rate multiplied by a very large number. So routing long inputs to a smaller-context model is a real lever.

But be careful about what it is a lever *on*. Length is not difficulty. A hundred pages of invoices is a long input and an easy task; a two-sentence question about a subtle contract clause is a short input and a hard task. If you route on length alone, you will send the hard short ones to the cheap model and the easy long ones to the expensive one — exactly backwards. Length is a **cost** axis, not a **capability** axis, and treating it as capability is a mistake you will make at least once.

There is a second length trap, and it is the one the Lost in the Middle result should make you expect: on multi-document question answering, putting the relevant passage in the middle of a long context measurably hurts accuracy compared to putting it at the start or the end. The paper's setup used 10, 20 and 30 documents and found middle-position accuracy falling below the model's 56.1% closed-book accuracy. So as you push more context at a cheaper small-context model, you are stacking two degradations — a weaker model and a worse position — and a cascade gate that only checks output format will not see either.

**Axis 3 — measured difficulty.** This is the interesting one, and it is the only one that justifies a cascade. The claim is that within a single task type, some cases are easy for the cheap model and some are not, and you can *detect which is which before paying for the strong model*.

Notice what that requires: an input-side or output-side signal that correlates with the cheap model being wrong. Difficulty routing is a prediction problem, and the cascade is just its implementation. This is the axis everything below is about.

| Axis | Decision made | Per-request logic | Machinery needed | Captures |
|---|---|---|---|---|
| Task type | Once, at design time | None | A mapping from call site to model | The largest share of the saving |
| Input length | Per request, from the input | A length threshold | A token count and a threshold | Cost, and only accidentally accuracy |
| Measured difficulty | Per request, from the model's own attempt | A gate and an escalation | A cascade: two models, a gate, a budget | The residual, and only if the gate works |

### Part 3 — What a cascade actually is, and why the gate is the whole thing

A cascade is four steps and one budget:

```text
                 request
                    │
                    ▼
        ┌───────────────────────┐
        │  cheap model attempts │  ← tier 1
        └───────────┬───────────┘
                    │ output
                    ▼
        ┌───────────────────────┐
        │        GATE           │  ← validation / confidence / judge / rule
        └───────┬───────┬───────┘
             pass│       │fail
                │       ▼
                │  ┌───────────────────────┐
                │  │ strong model attempts │  ← tier 2
                │  └───────────┬───────────┘
                │              │
                ▼              ▼
             return         return
                    │
                    ▼
          cost log: tier, tokens, gate tokens, escalated?
```

Everything that determines whether this architecture works lives in the box marked GATE. The cheap model is a commodity; you can swap it. The gate is the design.

Give the gate a name and it becomes obvious what you are building: **the gate is a classifier that predicts whether the cheap model's answer is acceptable.** It has a false-accept rate (cheap model was wrong, gate passed it) and a false-reject rate (cheap model was right, gate escalated anyway). Those two rates have completely different consequences, and this is the asymmetry the whole phase turns on:

| | Gate rejects (escalates) | Gate accepts (ships cheap answer) |
|---|---|---|
| **Cheap model was right** | False reject — you paid for the strong model and got nothing for it | True accept — the saving you were chasing |
| **Cheap model was wrong** | True reject — the cascade earned its cost | **False accept — silently wrong output ships** |

A false reject costs money. A false accept costs correctness, and it costs it *silently*, which is the only kind of error that is genuinely dangerous. And here is the trap: **the two metrics that look natural both reward the wrong thing.** Escalation rate is easy to measure and it rewards a gate that escalates everything. Average cost is easy to measure and it rewards a gate that escalates nothing. Neither number tells you what you need, which is the false-accept rate — and that requires knowing the cheap model's answers were wrong, which requires labels.

### Part 4 — Four gates, and what each one can actually see

You have four options, and they are ordered by cost and by how much they can see. None of them can see everything.

**Schema validation.** The cheapest gate and the only one that is exactly correct within its scope. If your output contract says `{"category": one of six strings, "confidence": float}`, a schema check is free, deterministic, and catches every malformed answer. What it cannot do is look at a well-formed answer and notice it is wrong. **A schema gate has a false-accept rate equal to the cheap model's semantic error rate on schema-valid outputs**, which is usually close to the cheap model's error rate overall. It is a floor, not a solution.

**Self-reported confidence.** Ask the cheap model to include a confidence score or a `"needs_escalation": true` flag, and escalate below a threshold. This costs one or two output tokens and is the gate everyone reaches for first. It is also the one with a well-documented failure direction: models are systematically overconfident, and the confidence number is itself a generated token, produced by the same machinery that produced the answer. **A model that hallucinated a field will report high confidence in the hallucinated field**, because both came from the same plausible-continuation process.

That does not make it useless. It makes it a *ranking* signal rather than a probability. If the cheap model's confidence is 0.3 on a case that turns out wrong four times as often as its 0.9 cases, the number is informative even though 0.9 does not mean 90%. You have to measure the relationship; you cannot assume it.

**A small judge.** A second model call that reads the input and the cheap answer and decides whether the answer is acceptable. This sees more than a schema and less than you are hoping, and it is the gate with the most literature behind it — which is also the literature warning you about it. The LLM-as-judge work (Zheng et al., 2023) documents position bias, verbosity bias, and self-enhancement bias in judge models. A judge drawn from the same family as the cheap model will share the cheap model's blind spots, so it will agree with a wrong answer for the same reason the wrong answer was produced. **Judge cost is the design constraint that matters most**: if the judge re-reads the whole input, the judge's tokens can be a large fraction of the strong model's, and the cascade's saving evaporates.

**A deterministic rule.** A regex, a lookup, a checksum, an arithmetic re-computation, a comparison against something you already know. Free, exact where it applies, and — this is the honest part — **it applies far less often than you want.** A rule can catch "the total does not equal the sum of the lines" or "the date is in the past" or "the country code is not in ISO 3166". It cannot catch "the summary missed the point".

The practical design is a **stack**, cheapest first:

```python
def gate(request, cheap_output):
    """Return (accept: bool, reason: str). Cheapest checks run first."""
    # 1. Deterministic: free, exact, narrow.
    if not looks_like_json(cheap_output):
        return False, "not-json"
    if total_mismatch(request, cheap_output):
        return False, "arithmetic-inconsistent"   # $0, and very high precision
    if cheap_output.get("category") not in ALLOWED_CATEGORIES:
        return False, "category-out-of-set"       # $0, exact

    # 2. Structural: free, exact, blind to meaning.
    try:
        Parsed.model_validate_json(cheap_output)
    except ValidationError as exc:
        return False, f"schema:{exc.error_count()}"

    # 3. Self-report: one or two output tokens. Weak, ranks rather than decides.
    if parsed.self_confidence < CONFIDENCE_FLOOR:
        return False, "low-self-confidence"

    # 4. Judge: expensive. Reserved for the band where 1-3 cannot decide.
    if difficulty_score(request) > JUDGE_BAND[0]:
        verdict, judge_tokens = small_judge(request, cheap_output)
        cost_log.add("judge", judge_tokens)
        if not verdict:
            return False, "judge-rejected"

    return True, "accepted"
```

Read that stack as a set of filters ordered by cost per unit of information gained, and notice the design principle it encodes: **every check you can move into the free tier shrinks the set of cases the expensive gate and the strong model ever see.** The arithmetic check costs nothing and catches a whole class of error exactly. Run it first, always.

### Part 5 — Designing one concrete cascade, with the numbers

Here is a worked design you can adapt. The task is support-ticket triage: given a customer message, produce a structured record with a category, a priority, and a one-line summary. You will build this in the practice tasks, so the numbers below are the shape of what you will measure rather than a result to copy.

**Tier 1 — the cheap model.** A small model, prompted to emit strict JSON against a three-field schema. Output is capped at a small token count; triage answers are short and a long answer is itself a signal.

**The gate, in order:**

1. JSON parses, and validates against the schema. Free. Catches malformed output.
2. `category` is in the allowed set and `priority` is one of `low|normal|high`. Free. Catches a class of error exactly — the label set is closed and there is no excuse for going outside it.
3. A deterministic rule from the ticket metadata you already have: if the message contains an account number, it must appear in the summary. Free, and it catches a specific and embarrassing error — the model summarising a ticket while losing the identifier the whole workflow depends on.
4. The cheap model's `self_confidence` field is at or above a floor you set by measuring. Near-free.
5. Only for cases in the middle band of a cheap difficulty score — a small judge model reads the ticket and the record and returns accept or reject. This is the expensive check and it sees the smallest share of traffic.

**Escalation.** Cases that fail the gate go to the strong model, which re-answers the original request from scratch — not the cheap model's answer, which would anchor it. Cap the tiers at two. There is no third tier, because a cascade with a third tier has three failure modes and a cost model nobody can hold in their head.

**Budget.** A per-request ceiling, and a running daily ceiling. **A cascade without a ceiling is a retry storm with better branding** — if the gate rejects aggressively, every rejection is a second full-price call, and at that point you are paying more than the always-strong baseline you were trying to beat.

Now the part that decides whether this was a good idea, and it is a single fraction. Let:

- $p$ be the fraction of requests the cheap model gets right.
- $a$ be the gate's false-accept rate — the share of the cheap model's *wrong* answers the gate lets through.
- $c$ be the cost of one cheap call (in whatever unit you like), $s$ the cost of one strong call, and $g$ the gate's cost per request.

The cascade's expected cost per request is roughly $c + g + (1 - p(1-a)) \cdot s$ — you always pay for the cheap attempt and the gate, and you pay the strong model whenever the cheap answer was wrong and got rejected, or was right and got rejected anyway. The always-strong baseline is just $s$.

Plug in numbers a beginner will actually see. If $c = 0.02s$, $g = 0.03s$, $p = 0.80$, and the gate is perfect ($a = 0$):

```text
50 labelled cases, three configurations

  config            correct   accuracy   cost/req   p50 latency   p95 latency
  cheap only         38/50      76%       0.02s        0.9 s         1.4 s
  strong only        47/50      94%       1.00s        2.1 s         3.8 s
  cascade            47/50      94%       0.41s        1.6 s         4.4 s
                                          ▲            ▲             ▲
                              the saving   the latency you paid
```

The cascade matched the strong model on accuracy and cost 41% of it. It was also slower at the median and *slower than the strong model alone* at the 95th percentile, because an escalated request pays for two model calls end to end. That pattern — big cost win, modest median latency loss, worse tail latency — is the normal shape of a working cascade, and you should expect it rather than be surprised by it.

Now break it. In the numbers above I set $a = 0$. Set $a = 0.35$ instead — a gate that misses a third of the cheap model's errors — and the accuracy drops below the strong baseline while the cost barely moves, because a gate that accepts more also escalates less. **This is the entire game.** A cascade's value is a function of its gate's false-accept rate, and nothing else about the architecture rescues a bad gate.

### Part 6 — The failure mode that matters: plausible and wrong, and the gate agrees

Everything so far has been setup for this.

The bad case is not a crash. It is not a malformed JSON, and it is not a model that says "I'm not sure". It is this: the cheap model produces a fluent, well-formed, entirely reasonable answer that is **wrong**, and the gate passes it.

Concretely, from the triage example:

```text
Customer message:
  "I was charged twice for the Pro plan on the 14th. My account is
   AC-88213. Please refund the duplicate."

Cheap model output (schema-valid, gate-passed):
  {
    "category": "billing",
    "priority": "normal",
    "summary": "Customer is asking about a charge on their Pro plan.",
    "self_confidence": 0.91,
    "refund_requested": true
  }
```

Every gate in the stack passes it. The JSON is valid. `billing` is in the allowed set. `normal` is a legal priority. The account-number rule fires only if you *wrote* that rule — and this is the moment to notice that the rule existed because someone already got burned. The self-confidence is 0.91. A judge asked "is this a reasonable triage record for this ticket?" will overwhelmingly say yes, because it is a reasonable triage record. It simply **dropped the duplicate charge**, which is the only thing in the ticket that mattered, and it downgraded a refund request to a question.

Why does this happen, mechanically? Because the cheap model was asked to compress an unstructured message into a structured summary, and every step of that is a plausibility judgement. "Customer asking about a charge on their Pro plan" is a plausible summary of any ticket containing "charged" and "Pro plan". The duplication is a detail that a smaller model's less sharply-resolved representation of the input did not preserve as salient. **The output is a good answer to a slightly different question than the one you asked**, and no structural check can tell the difference, because the structure is perfect.

Three things follow, and they are the practical content of this section.

**First: the gate must be chosen against the errors you actually observe, not the errors you imagine.** You find out that summaries drop load-bearing details by labelling a hundred outputs and reading them. Until you have done that, your gate is defending against malformed JSON while the real leak is semantic.

**Second: the exposure is worst exactly where the cascade looks most attractive.** High-volume, low-stakes-looking work — triage, summarisation, extraction — is where you route to the cheap tier and where a silent semantic error is cheapest to ship and hardest to notice. The cases where you would definitely notice are the cases you were already sending to the strong model.

**Third: the mitigation is not a better gate. It is a different instrument.** Sample the gate's accepted outputs continuously and label them. A gate has a false-accept rate whether or not you have measured it; the only question is whether you know the number. `<!-- This is why task t07 exists: a fixed labelled set tells you the rate once, and sampling tells you when it moves. -->`

> **Where the whole idea stops working.** A cascade is worth building when three things hold at once: the cheap model is genuinely good enough on a majority of your traffic, you have labels that let you measure the gate's two error rates, and the volume is high enough that the saving exceeds the complexity. Break any one and the cascade is the wrong architecture, not a badly tuned one.
>
> Specifically: **if you cannot measure the false-accept rate, do not build the cascade.** You will be shipping a quality regression you have not detected and calling it an optimisation. That is not a hypothetical — it is the normal outcome, because escalation rate and average cost both look healthy while accuracy falls.

### Part 7 — The honest alternative for a $0 budget

Here is the recommendation, and it is deliberately unglamorous.

**Use one cheap model for development and iteration. Reserve the strong model for final validation.**

Development is where the calls are. You will run your prompt fifty times while tuning it, then fifty more when you change the schema, then a hundred when you widen the eval set. That is thousands of calls against a workload where you are not producing value yet — you are producing *information about your prompt*. Doing that on the strong model burns your budget on the phase of the work where the answer does not need to be good, only informative.

So:

1. Point your whole development loop at one cheap model. Tune the prompt, the schema, the examples, the guardrails against it.
2. Build your labelled set — a hundred cases with known-correct answers — and run it against the cheap model. This gives you $p$, the number that decides everything else.
3. If the cheap model is good enough on the cases you care about, you may be finished: a single cheap model with no routing is a *valid terminal answer*, not a compromise. The task-type axis from Part 2 already captured the saving.
4. Where it is not good enough, change one thing at a time and re-run: a tighter schema, a few-shot example for the failing class, a smaller input, a decomposition into two narrow calls. Most "the cheap model can't do this" conclusions are actually "my prompt asks it to do three things".
5. When you have a working pipeline, send the finished prompt and a bounded sample — twenty or fifty cases, not your whole traffic — to the strong model, and use its outputs as your reference labels. This is the strong model used as an **oracle for evaluation**, which is the highest-value use of an expensive model available to you.

What this captures: the dominant share of the saving, because the dominant share comes from *not using the strong model in your loop*. What it does not capture: per-request difficulty routing. You are making one static decision, not a per-request one, so you pay the cheap model's error rate on the tail of hard cases instead of escalating them.

That is a real loss and you should name it, not paper over it. The question is what it costs you relative to the cascade. Compare:

| | One cheap model | Cascade | How to decide |
|---|---|---|---|
| Code you write | A model name in a config | Two calls, a gate, a budget, a cost log, a label set | — |
| Failure modes | The cheap model is wrong | The cheap model is wrong, **and** the gate lets it through, **and** you have not measured it | — |
| Measurable in a week | Yes | Yes, if you have labels | — |
| Saving vs always-strong | The whole delta on the traffic you route | The same delta on accepted traffic, minus the gate's tokens, minus the strong calls you still make | Measure both |
| When it wins | Volume is modest, complexity is dear, or you lack labels | Volume is high, labels exist, and the gate's false-accept rate is low | The crossover is a number you compute, not a preference |

For a beginner on a $0 budget building a personal project, the left column is usually correct for the first year. Not because cascades do not work — they do, and the FrugalGPT results show what a well-built one can achieve — but because a cascade is a *measurement* project wearing an optimisation project's clothes, and the measurement is the part you have not built yet.

### Part 8 — The rule, and where it stops

One rule, stated before the code:

> **Do not build a cascade until you have an eval set proving the cheap model is good enough for the cases you would route to it — and a measurement of the gate's false-accept rate on those cases.**

Both halves are load-bearing. The first stops you routing work the cheap model cannot do. The second stops you shipping the errors it can. If you have neither, you have a hypothesis, and building the cascade is how you find out you were wrong at production cost.

And where the rule itself stops working: it assumes your traffic is stable enough that a fixed eval set stays representative. If the distribution of your requests drifts — new request types, new languages, new user behaviour — the eval set goes stale and the false-accept rate you measured stops being the one you have. That is not a reason to skip the measurement. It is a reason to keep the sample-of-accepted-outputs loop running, which is the same instrument by another name.

## Hands-on practice tasks

1. Take one workflow you currently run against whatever model you have and list every distinct call site. For each, write one sentence saying whether it is classification, extraction, reformatting, ambiguity resolution, or open-ended reasoning. <!-- id: cost-04-model-routing-t01 band: quick energy: low -->
2. Write the split from task 1 as a table with a share-of-traffic column and a "does the cheap model get this right?" column. You will not know the second column yet — write your guess and mark it as a guess. That table is the hypothesis the rest of this phase tests. <!-- id: cost-04-model-routing-t02 band: focused energy: normal -->
3. Build a labelled set of at least 100 cases for the single highest-volume call site. Correct answers authored by you, not by a model. Store it as JSON lines with the input and the expected output. <!-- id: cost-04-model-routing-t03 band: deep energy: high -->
4. Write the gate for that call site as a function returning `(accept, reason)`, with the deterministic and structural checks first and no model call in them. Write `pytest` tests that feed it fifty manufactured malformed outputs and confirm each is rejected with a reason naming the failing check. <!-- id: cost-04-model-routing-t04 band: deep energy: high -->
5. Run both models over your labelled set and compute the gate's confusion matrix: true accepts, false accepts, true rejects, false rejects. Compute the false-accept rate and the false-reject rate. Then sweep the gate's threshold and plot accuracy against escalation rate — the shape of that curve is the whole cascade. <!-- id: cost-04-model-routing-t05 band: deep energy: high -->
6. Implement the full cascade with a two-tier cap, a per-request cost log recording tier and tokens, and a per-request spend ceiling that aborts. Run cheap-only, strong-only and cascade over the same labelled set and record accuracy, cost per request, p50 latency and p95 latency for each. <!-- id: cost-04-model-routing-t06 band: deep energy: high -->
7. Take twenty outputs your cascade *accepted* and read them against the ground truth without looking at which model produced them. Count how many are wrong. That count is your measured false-accept rate — compare it against the one you computed in task 5 and explain any gap. <!-- id: cost-04-model-routing-t07 band: deep energy: high -->
8. Replace your judge gate with a self-reported confidence gate and re-run task 5. Record how the false-accept rate changes and whether the model's confidence is monotonic in its accuracy. Do not assume the number is a probability; check whether it merely ranks. <!-- id: cost-04-model-routing-t08 band: deep energy: normal -->
9. Add a deterministic rule that catches one class of semantic error specific to your task — an arithmetic re-check, an identifier-presence check, a cross-field consistency check. Measure how much of the false-accept rate it removes for free. <!-- id: cost-04-model-routing-t09 band: focused energy: high -->
10. Run your cascade against the same task with a *long* input by concatenating three cases into one request. Compare accuracy to the three separate requests. Record what changed; this is the input-length axis being confounded with difficulty. <!-- id: cost-04-model-routing-t10 band: focused energy: normal -->
11. Compute your cascade's expected cost from $p$, $a$, $c$, $s$ and $g$, then compare it against the cost you actually measured in task 6. Explain the difference — retries, the judge re-reading context, or output length are the usual culprits. <!-- id: cost-04-model-routing-t11 band: focused energy: high -->
12. Deliberately build a bad gate: accept everything. Confirm that it produces zero escalations, the best possible cost number, and the cheap model's accuracy. Write down why the cost dashboard looked excellent. <!-- id: cost-04-model-routing-t12 band: quick energy: low -->
13. Deliberately build a paranoid gate: reject unless confidence is near 1.0. Measure the escalation rate, cost and accuracy. Confirm you have reproduced the always-strong baseline at a *higher* price, and explain where the extra cost came from. <!-- id: cost-04-model-routing-t13 band: focused energy: normal -->
14. Run the low-machinery alternative end to end: develop against the cheap model only, then validate a fifty-case sample against the strong model. Record how many of your cheap-model outputs the strong model would have changed, and word the difference as a rate. <!-- id: cost-04-model-routing-t14 band: deep energy: high -->
15. Using your measured numbers and your real daily volume, compute the point at which a cascade beats the low-machinery alternative in pesos per month. State the volume, the assumption it depends on, and what would invalidate it. <!-- id: cost-04-model-routing-t15 band: focused energy: high -->
16. Write your own routing decision rule in under ten lines — the questions you will ask before adding a second model to any pipeline — and test it against three pipelines you have already built, noting where it gives the wrong answer. <!-- id: cost-04-model-routing-t16 band: ongoing energy: normal -->
17. Take the split from task 2 and re-label every row's "does the cheap model get this right?" column with what you actually measured, marking rows where your guess was wrong. The size of that correction is the value of the whole phase. <!-- id: cost-04-model-routing-t17 band: focused energy: normal -->
18. Add a sampling loop that logs a fraction of your gate's accepted outputs for later review, with the input and the gate's reason, and a field for a human verdict. Run it for three days and read what accumulated. <!-- id: cost-04-model-routing-t18 band: ongoing energy: normal -->

## Common Pitfalls

**Reporting cost without accuracy.** The most common dishonest cascade write-up is "my cascade cut costs by 60%" with no accuracy column. Cutting cost by accepting more cheap answers always reduces cost, including when it reduces quality to the cheap model's level. Any comparison that does not put accuracy, cost and latency in the same table is not a measurement.

**Reporting median latency and hiding the tail.** A cascade's median latency is close to the cheap model's, which looks great. Its 95th percentile is worse than the strong model alone, because escalated requests pay for two sequential calls. If your users notice the slow ones — and they always notice the slow ones — the tail is the number that matters.

**Building the cascade before the eval set.** If you cannot state the cheap model's accuracy on your task, you do not know whether there is anything to route. Build twenty labelled cases before you write the gate; build a hundred before you trust the result.

**Assuming self-reported confidence is a probability.** It is a generated token. It correlates with correctness imperfectly and it is systematically overconfident, especially on the cases where the model invented the answer. Measure whether it ranks before you use it as a threshold, and never report it as a probability.

**Using a judge from the same model family as the cheap tier.** Shared training lineage means shared blind spots. The judge will agree with the wrong answer for the same reason the wrong answer was produced, and your false-accept rate will look deceptively good.

**Letting the judge re-read the whole context.** Judge tokens are real tokens. A judge that receives the full input on every request can cost more than the escalation it was meant to prevent. Give the judge the minimum it needs to decide.

**Routing on input length and calling it difficulty.** Length is a cost axis. A long easy task and a short hard task are both common, and a length threshold routes both of them wrong.

**No escalation ceiling.** An aggressive gate plus an unbounded escalation path is more expensive than never routing at all. Cap the tiers at two and cap the spend per request, in code, so the abort happens before the call rather than after the invoice.

**Passing the cheap model's answer to the strong model on escalation.** It anchors the strong model toward the cheap model's framing, which is exactly the framing that failed. Re-ask the original request.

**Treating the cascade as permanent.** Every gate rule that turns out to be exact should become a code check, and every task type where the cheap model is simply good enough should drop the cascade entirely. A cascade is scaffolding around a decision you have not finished making.

**Not pinning the model behind a tier.** A floating alias can be repointed under you, changing the cheap tier's accuracy and therefore your gate's calibration, with no change to your code. Pin what you can and re-run your labelled set after any model change — the finetuning and evaluation track builds that habit properly.

## Deliverable / proof of work

Write `portfolio/cost/04-model-routing.md` containing:

- **Your routing hypothesis** — the call-site table from task 2, with the share-of-traffic column and your initial guess at cheap-model adequacy, marked as a guess.
- **Your labelled set** — at least 100 cases with ground truth, the file path, and one paragraph on how you authored the answers and what you did about cases where you were unsure of the ground truth yourself.
- **The gate** — the code, the ordered stack of checks, and for each check one sentence on what class of error it can and cannot see.
- **The confusion matrix** — true accepts, false accepts, true rejects, false rejects, with the false-accept rate and false-reject rate computed and stated as percentages.
- **The threshold sweep** — a table or plot of accuracy against escalation rate across at least five thresholds, with one sentence on where you chose to sit and why.
- **The three-way comparison** — cheap-only, strong-only and cascade on the same labelled set, with accuracy, cost per request, p50 latency and p95 latency for each. Cost alone is not acceptable.
- **A section titled "The errors the gate let through"** — at least five verbatim examples of plausible-but-wrong output that passed your gate, with what the correct output was and which check should have caught it.
- **The expected-vs-measured cost reconciliation** — your $p$, $a$, $c$, $s$, $g$ arithmetic against the measured cost, and where they disagreed.
- **A section titled "Why I am or am not shipping this"** — your recommendation, the volume threshold at which it changes, and the assumption it depends on.
- **Your routing decision rule**, in under ten lines, as a reusable checklist.

## Checklist

- [ ] I can name the three axes of a routing decision and say which one justifies a cascade <!-- id: cost-04-model-routing-c01 energy: normal -->
- [ ] I can explain why task type captures most of the available saving with none of the machinery <!-- id: cost-04-model-routing-c02 energy: normal -->
- [ ] I can explain why input length is a cost axis and not a capability axis <!-- id: cost-04-model-routing-c03 energy: normal -->
- [ ] I have a labelled set of my own cases with ground truth I authored <!-- id: cost-04-model-routing-c04 energy: high -->
- [ ] I can say what the cheap model's accuracy is on my task, as a measured number rather than a guess <!-- id: cost-04-model-routing-c05 energy: high -->
- [ ] I can describe a cascade as a cheap attempt plus a gate plus an escalation decision <!-- id: cost-04-model-routing-c06 energy: low -->
- [ ] I can name four gate designs and state one class of error each one cannot see <!-- id: cost-04-model-routing-c07 energy: normal -->
- [ ] I order my gate checks cheapest-first so free checks shrink the set the expensive ones see <!-- id: cost-04-model-routing-c08 energy: normal -->
- [ ] I can compute a gate's false-accept and false-reject rates from a confusion matrix <!-- id: cost-04-model-routing-c09 energy: high -->
- [ ] I can explain why a false accept is worse than a false reject, and why it is harder to see <!-- id: cost-04-model-routing-c10 energy: normal -->
- [ ] I know that a schema gate's false-accept rate equals the model's semantic error rate on valid output <!-- id: cost-04-model-routing-c11 energy: normal -->
- [ ] I have measured whether self-reported confidence ranks cases by correctness, instead of assuming it is a probability <!-- id: cost-04-model-routing-c12 energy: high -->
- [ ] I know my judge's token cost per request and it is small relative to the escalation it prevents <!-- id: cost-04-model-routing-c13 energy: normal -->
- [ ] I have compared cheap, strong and cascade on accuracy, cost AND latency, not cost alone <!-- id: cost-04-model-routing-c14 energy: high -->
- [ ] I have reported p95 latency for my cascade and can explain why it is worse than the strong model's <!-- id: cost-04-model-routing-c15 energy: normal -->
- [ ] My cascade caps tiers at two and aborts on a per-request spend ceiling <!-- id: cost-04-model-routing-c16 energy: normal -->
- [ ] My escalation path re-asks the original request rather than passing the cheap answer forward <!-- id: cost-04-model-routing-c17 energy: normal -->
- [ ] I have at least five verbatim examples of plausible-but-wrong output that passed my gate <!-- id: cost-04-model-routing-c18 energy: high -->
- [ ] I have a sampling loop that reviews accepted output, because my false-accept rate can drift <!-- id: cost-04-model-routing-c19 energy: normal -->
- [ ] I can state when I would not build a cascade at all, and I have run the low-machinery alternative <!-- id: cost-04-model-routing-c20 energy: high -->
- [ ] I have a written routing decision rule I will apply before adding a second model to anything <!-- id: cost-04-model-routing-c21 energy: normal -->
- [ ] I can say why a cascade is a measurement project rather than an optimisation project <!-- id: cost-04-model-routing-c22 energy: normal -->

## Quiz

### Q1. Your cascade routes 80% of traffic to a cheap model and escalates the rest. Cost dropped 55%, and the escalation rate looks healthy at 20%. What is missing from this report? <!-- id: cost-04-model-routing-q01 energy: normal -->

- [x] The accuracy of the cascade against always-using-the-strong-model on the same cases
- [ ] The exact per-token price of both models
- [ ] The name and version of the judge model
- [ ] The number of requests per day

**Why:** Cost and escalation rate are both consistent with a gate that accepts everything and ships the cheap model's errors. Neither number can distinguish a working cascade from a broken one, because a broken gate makes both look better. Accuracy on a labelled set is the only figure that separates them, and any comparison that omits it is a claim about spend rather than about quality.

### Q2. A schema gate validates every output against a strict JSON schema with closed enums, and nothing malformed ever gets through. What is the gate's remaining weakness? <!-- id: cost-04-model-routing-q02 energy: normal -->

- [ ] It is too slow to run on every request
- [ ] It cannot handle nested objects
- [x] It sees structure and not meaning, so a well-formed output with the wrong content passes
- [ ] It fails whenever the model adds an explanation before the JSON

**Why:** Schema validation is exact within its scope, and its scope is shape. A record with a valid category, a legal priority and a plausible summary can still have dropped the one detail that mattered. The practical consequence is that a schema gate's false-accept rate is approximately the model's semantic error rate on schema-valid output — usually close to its error rate overall — so it is a floor rather than a solution.

### Q3. You give the cheap model a `self_confidence` field and escalate anything below 0.7. Which behaviour should you expect? <!-- id: cost-04-model-routing-q03 energy: high -->

- [ ] Confidence will be a well-calibrated probability, because the model is reporting its own state
- [ ] Confidence will be random, so the gate is equivalent to escalating a random 30% of traffic
- [ ] Confidence will rank cases perfectly, so any threshold gives the same result
- [x] Confidence will be systematically overconfident and will correlate with correctness only imperfectly, so it ranks better than it calibrates

**Why:** The confidence value is a generated token, produced by the same process that produced the answer, so a model that invented a field tends to report high confidence in the invented field. That does not make it useless: if cases scored 0.3 are wrong several times as often as cases scored 0.9, the number is an informative ranking signal even though 0.9 is not 90%. Use it as a rank, measure the relationship on labels, and never report it as a probability.

### Q4. Your gate's false-accept rate is 30% and its false-reject rate is 5%. Why is this worse than the reverse? <!-- id: cost-04-model-routing-q04 energy: high -->

- [ ] False accepts are more expensive per request than false rejects
- [x] False accepts ship wrong answers silently, while false rejects only cost money and are visible in the spend
- [ ] False rejects cause the strong model to be called twice on the same request
- [ ] There is no difference; the two rates are interchangeable

**Why:** A false reject sends a correct cheap answer to the strong model, which almost always produces a correct answer anyway — you lose money and can see the loss in your cost log. A false accept ships the cheap model's error to the user with a valid schema and a passing gate, and nothing in your telemetry flags it. The errors you cannot see are the ones that decide whether the system is any good, which is why the false-accept rate needs labels to measure.

### Q5. You route on input length: short prompts to the cheap model, long ones to the strong model. What goes wrong? <!-- id: cost-04-model-routing-q05 energy: normal -->

- [ ] Nothing; long inputs are always harder, so the split is correct
- [ ] The cheap model cannot accept short inputs at all
- [x] Length measures cost, not difficulty, so hard short questions go cheap and easy long documents go expensive
- [ ] The strong model will refuse inputs above its context window

**Why:** A two-sentence question about a subtle contract clause is short and hard; a hundred pages of invoices is long and easy. A length threshold routes both of them the wrong way, and it does so invisibly because the routing decision looks principled. Length is a real lever on cost and only accidentally related to capability — and stacking a weak model on top of a long context also exposes you to the position effects that multi-document QA work documents.

### Q6. Which gate check should run first in your stack? <!-- id: cost-04-model-routing-q06 energy: normal -->

- [ ] The judge model, because it is the most accurate check and should see every request
- [x] A deterministic rule, because it is free and exact where it applies, and it shrinks the set every later check sees
- [ ] The self-reported confidence threshold, because it is cheapest to produce
- [ ] The schema validation, because it catches the most errors overall

**Why:** Ordering by cost per unit of information gained is what keeps the cascade's overhead small. A free arithmetic or identifier check catches a whole class of error exactly at zero token cost, and because it runs first, the expensive judge and the strong model only ever see the cases that survive it. Putting the judge first means paying judge tokens on requests a regex would have rejected, which is how a cascade's saving disappears into its own gate.

### Q7. You have a working cascade and you want to know whether it is still behaving. What instrument actually tells you? <!-- id: cost-04-model-routing-q07 energy: high -->

- [ ] The escalation rate, because it should stay stable
- [ ] The average cost per request, because it summarises everything
- [ ] The percentage of requests that failed schema validation
- [x] Sampling the gate's accepted outputs and labelling them, because the false-accept rate is the quantity that can drift undetected

**Why:** Escalation rate and average cost are both blind to the failure that matters, and both improve when the gate gets worse at its job. Schema-failure rate only covers structure. The false-accept rate is what determines whether the cascade is shipping wrong answers, it can drift when a floating model alias is repointed or your traffic changes shape, and the only way to see it is to periodically take accepted output and check it against ground truth.

### Q8. You have no labelled eval set, no time to build one this month, and a real task to ship. What is the right architecture? <!-- id: cost-04-model-routing-q08 energy: normal -->

- [x] One cheap model for the whole development loop, with the strong model used on a bounded sample to validate the finished prompt
- [ ] A cascade with a lenient gate, since a lenient gate is safe
- [ ] Always use the strong model, since you cannot measure anything
- [ ] Two models with the choice made at random, so you can at least compare them later

**Why:** Without labels you cannot measure a gate's false-accept rate, and an unmeasured gate ships quality regressions that nothing in your telemetry reveals — so a cascade here is a decision made blind. Routing the development loop to the cheap model captures the largest share of the saving, because most calls happen during iteration where only the information matters. The strong model still earns its price as an oracle over a bounded sample, which is a use you can afford without any routing machinery.

### Q9. Your cascade matched the strong model's accuracy at 40% of its cost. What should you check before calling it a win? <!-- id: cost-04-model-routing-q09 energy: normal -->

- [ ] Whether the cheap model's provider offers a free tier
- [ ] Whether the labelled set had exactly 100 cases
- [ ] Whether the judge model's temperature was set to zero
- [x] The p95 latency, the labelled set's size, and whether the gate's measured false-accept rate holds on traffic outside the set

**Why:** Three separate ways a cascade win is overstated. Tail latency is usually worse than the strong model alone, because escalated requests pay for two sequential calls, and if users notice slow responses the median is the misleading number. A hundred-case set puts wide error bars on a few points of accuracy difference. And a gate calibrated on a fixed set can drift when traffic or the underlying model changes, so a false-accept rate measured once is a snapshot rather than a property.

## You're ready to move on when...

You have taken one real workflow and split it into the calls that need a strong model and the calls that do not, with a measured number behind the split rather than an intuition. You have built a gate as an ordered stack of checks, cheapest first, and you can say for each check what class of error it can see and what it is blind to. You have computed the gate's false-accept and false-reject rates from a confusion matrix on labelled cases, and you have read at least twenty accepted outputs against ground truth and copied out the ones that were wrong but passed. You have compared cheap-only, strong-only and cascade on accuracy, cost, and both p50 and p95 latency, and you can explain why the tail is worse. You have implemented the escalation with a two-tier cap and a spend ceiling that aborts before the call. You have run the low-machinery alternative on the same task and can state in pesos which one wins at your actual volume and what assumption that depends on. And you can state the rule without hedging: you do not build a cascade until you have an eval set proving the cheap model is good enough for the cases you route to it, and a measurement of the gate's false-accept rate on those cases. If you cannot yet say when a cascade is the wrong architecture, you have not finished the phase.

## Free vs Paid

### What's free is enough

Everything in this phase runs on free infrastructure, and the reason is more specific than usual: the artefacts you need are small. A hundred labelled cases is a text file. Two local models of different sizes give you a cheap tier and a strong tier with no per-token cost at all, which matters enormously here because a three-way comparison over a hundred cases is the most API-hungry experiment in this track — three configurations, a hundred cases, plus the gate's own calls is several hundred model calls for one table. Run that against a metered API and you will ration it, and a rationed comparison is a comparison you will not repeat when you change the gate.

The gate is free by construction: `jsonschema`, Pydantic, a regular expression, and `pytest` are all open source and run with no network. The confusion matrix and the threshold sweep need a few counters and two divisions, or `scikit-learn` if you prefer not to write them yourself. The whole measurement apparatus costs zero pesos, which is the point — the expensive part of a cascade is the models, and the local models remove that.

The honest limitation is that two local models are both weak relative to a frontier model. You will measure a smaller capability gap than a hosted comparison would show, so your false-accept numbers will look better than they would with a large strong tier. Compensate by treating the local result as the shape of the finding rather than the magnitude, and by reading the FrugalGPT and RouteLLM abstracts for what the magnitude looks like when the tiers are far apart.

### What a paid tier adds

**A genuinely stronger escalation target.** This is the substantive one, and it is the whole premise of the architecture: a cascade only pays when the second tier is meaningfully better than the first. Two similar-sized local models produce a cascade with almost nothing to escalate to, and you will measure a saving with no accuracy story behind it. **Volatile, dated: as of early 2026, the gap between the best free-tier models and the best paid models varies by task and changes monthly — read current pricing and benchmark pages rather than any summary, including this one.** A cheap paid tier can also beat a local model on your specific task while costing a fraction of the frontier price, which makes it the right escalation target for a cascade rather than the frontier model itself.

**A provider-side structured-output guarantee.** Several providers can constrain decoding to a JSON schema, which collapses the malformed-output class of failure and therefore lets your gate spend its budget on semantic checks instead of parsing. It constrains shape and not meaning — the same boundary as a schema gate you write yourself — so it simplifies the cheapest check rather than replacing the hard part.

**Prompt caching on the gate.** A judge or a repeated cheap-tier prompt with a long shared prefix is the natural beneficiary of caching, and it changes the arithmetic on a gate that re-reads context. Terms, minimum prefix lengths and lifetimes are provider-specific and revised without much notice; check the current documentation.

**Higher rate limits, which matter for the measurement.** A hundred labelled cases through three configurations, with a judge call on a fraction of one of them, is a few hundred requests. Free-tier daily caps make that a multi-day exercise rather than an afternoon, and the measurement is the part of this phase you should least want to stretch out.

### When it's worth paying

**Not to learn this.** Build the labelled set, the gate, the confusion matrix and the three-way comparison entirely on free infrastructure. The finding you are after — that your gate's false-accept rate is what decides whether the cascade works, and that it is probably higher than you guessed — is a finding about your task, and it comes out the same on a local model. The one thing you cannot replicate locally is the size of the capability gap, and you do not need to replicate it to learn the mechanism.

The honest threshold is narrow and specific: **pay for an escalation target once your labelled set shows the cheap model failing on a class of cases the strong model would get right, and the volume is high enough that escalating only those cases is cheaper than always using the strong model.** That is a calculation, not a feeling — you have $p$, $a$, and your daily volume, so compute the crossover and compare it against the price difference. If the crossover sits above your real volume, the correct answer for now is the low-machinery alternative, and that is not a compromise: a cheap model you have measured thoroughly beats a cascade you have not measured at all. And when you do start paying, note that this is the phase whose entire point is to buy less of the expensive model — so the first thing to do with any budget is spend it on the eval set that proves you needed it.

Note also that the saving you get from routing is not the same as the saving you get from doing less work. Before you buy a second tier to route between, check whether the task needs the call at all: a cache, a narrower prompt, or a deterministic rule removes the call rather than moving it. That question belongs to the phase before this one, and it is still the cheaper answer.
