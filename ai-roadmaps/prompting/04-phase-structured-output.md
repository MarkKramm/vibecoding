---
id: prompt-04-structured-output
track: prompting
phase: 4
order: 40
title: Structured Output and Schema Enforcement
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/prompting/04-structured-output.md
exit_criteria: >
  You have built a working extraction pipeline that returns a typed object your
  code can index into without a try/except around json.loads, using at least two
  rungs of the reliability ladder. You have watched native JSON mode return
  perfectly valid JSON that is still wrong, and you have written a validator that
  catches a shape-valid, sense-invalid value. You can explain without notes why
  constrained decoding gives a hard guarantee and why a JSON Schema does not, and
  you can name the four places where constraint stops being the right tool.
---

# Phase 4 — Structured Output and Schema Enforcement

## Goal of this phase

Make a model into a **component**.

A component is something another piece of software can call without a human reading the result. That single sentence contains the entire problem of this phase. Everything you have done in Prompting so far — asking for a tone, a format, a length — has been a human reading a response and judging it. The moment code reads the response, "usually right" is not a grade. It is a crash, at 3 a.m., on the input you did not test.

Here is the fact that makes this phase necessary rather than nice: **a language model's output is a probability distribution over tokens, and nothing about that distribution knows what a valid object is.** There is no parser inside the model. There is no schema. There is no compiler. When you write "respond only in JSON", you have not constrained the model's output space — you have placed a very strong hint inside a distribution that still assigns non-zero probability to `Here is your JSON:` followed by a chunk of markdown.

So the whole phase reduces to one question: **where do you put the enforcement — in the prompt, in the decoder, or in your validator?** Those are three genuinely different places, with genuinely different guarantees, and confusing them is the most expensive mistake in this part of the field. A developer who believes their JSON Schema is enforced by the model will ship a system that fails on 1 request in 400 and will have no idea why. A developer who knows that only the *decoder* can make invalid output impossible builds differently — and sleeps differently.

By the end of this phase you will have climbed a ladder of five rungs, from asking politely to grammar-constrained decoding; you will have watched the strongest hosted API feature return JSON that satisfies your schema and is still nonsense; and you will have written the validation layer that catches it. You will also know precisely where this entire approach stops working, which is a shorter list than you would expect and a more useful one.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Day 1 is the lesson, and it is longer than usual because the ladder has five rungs and each one needs its mechanism. Days 2 and 3 are the extraction pipeline — build it on purpose at rung 2 first, so you feel the failure before you fix it. Day 4 is the validator and the repair path. Day 5 is the write-up.

There is one task in here that will eat a whole evening if you let it: getting a local model running with GBNF grammar constraints. Budget two hours, and if it is not working by then, use the `outlines` library instead and note the difference. The point is to *see* constrained decoding, not to win a build fight.

## Skills you'll gain

- Explain why a probability distribution over tokens has no concept of a valid object
- Name the five rungs of the reliability ladder and the guarantee each one does and does not give
- Build an extraction pipeline that returns a typed object your code indexes into directly
- Use enums to collapse a classification task into a constrained choice rather than a free-text guess
- Distinguish *schema-valid* from *correct*, and write a validator that tests the second
- Explain how grammar-constrained decoding masks invalid tokens to zero probability, and why that is a hard guarantee rather than a strong hint
- Recognise a JSON Schema feature that a given provider's supported subset does not include
- Design schemas that are flat, closed, and cheap to repair
- Write a repair path that handles a malformed response without silently discarding the work
- Say where structured output stops being the right tool

## Specific topics to learn

### The ladder of reliability

- Rung 1 — asking politely in prose, and why it fails unpredictably
- Rung 2 — the schema plus a worked example in the prompt
- Rung 3 — prefilling the assistant turn to block preamble
- Rung 4 — native JSON mode: valid JSON, unknown schema
- Rung 5 — schema-constrained structured outputs on the supported subset of JSON Schema
- Rung 6 — grammar-constrained decoding for open-weight models

### The mechanisms behind the rungs

- Why instruction-following is a probability shift and not a constraint
- Why prefill is cheap and effective, and which APIs allow it
- What a JSON mode actually guarantees at the token level
- How a grammar compiles to a token mask and what "zero probability" means mechanically
- Why the mask is a structural guarantee and not a semantic one

### Validation as a separate layer

- Shape versus sense, and the fact that a schema cannot tell you which is which
- Types that accept anything: `string`, `number`, `array` without constraints
- Range, format, and cross-field checks your schema cannot express
- Why a validator that never rejects anything is not a validator

### Practical schema design

- Flat over nested, and why depth costs you
- Enums for classification, used aggressively
- `required` and `additionalProperties: false` as the two fields that stop invented output
- Nullable fields versus missing fields
- Keeping the schema small enough that the model can hold it

### Repair, not retry

- Detecting failure precisely: transport, parse, shape, sense
- Feeding the validator's error back as the repair prompt
- The retry budget, and what to do when it is exhausted

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Pydantic (Python) | Define the target shape once, validate parsed output, and generate the JSON Schema you send to the model | Free, open source | https://docs.pydantic.dev/latest/ | Tasks 2, 6 | `jsonschema` for validation, and hand-written dataclasses with your own checks |
| jsonschema (Python) | Validate a parsed dict against a JSON Schema document independently of any framework | Free, open source | https://python-jsonschema.readthedocs.io/ | Tasks 6, 7 | `pydantic` for the same job, or `ajv` if you prefer JavaScript |
| OpenAI Structured Outputs docs | The reference for the hosted schema-constrained rung, including the supported and unsupported JSON Schema keywords | Free to read (API calls are paid) | https://platform.openai.com/docs/guides/structured-outputs | Tasks 4, 5 | Gemini or Mistral schema-constrained modes, or the local path below at zero cost per token |
| outlines | Grammar- and regex-constrained generation for open-weight models, in Python | Free, open source | https://github.com/dottxt-ai/outlines | Task 10 | llama.cpp GBNF grammars, or vLLM guided decoding |
| llama.cpp | Run a small open-weight model locally and constrain it with a GBNF grammar you write by hand | Free, open source | https://github.com/ggml-org/llama.cpp | Task 11 | `outlines` with a transformer backend, or Ollama with a model that supports format constraints |
| vLLM guided decoding | Server-side constrained decoding at throughput, with JSON Schema, regex, choice, and grammar backends | Free, open source | https://docs.vllm.ai/en/latest/features/structured_outputs.html | Task 12 | llama.cpp server, which exposes the same idea over an OpenAI-compatible endpoint |
| Ollama | The lowest-friction way to get a local model answering on an OpenAI-compatible endpoint | Free, open source | https://ollama.com/ | Task 1 | llama.cpp server directly, or any hosted provider's free tier if your machine is too small |

## Free/cheap resources

- **Pydantic documentation** — https://docs.pydantic.dev/latest/
- **JSON Schema, the specification and understanding docs** — https://json-schema.org/understanding-json-schema
- **OpenAI Structured Outputs guide** — https://platform.openai.com/docs/guides/structured-outputs
- **OpenAI function calling guide** — https://platform.openai.com/docs/guides/function-calling
- **outlines documentation** — https://dottxt-ai.github.io/outlines/latest/
- **llama.cpp GBNF grammar README** — https://github.com/ggml-org/llama.cpp/blob/master/grammars/README.md
- **vLLM structured outputs documentation** — https://docs.vllm.ai/en/latest/features/structured_outputs.html
- **Ollama documentation** — https://docs.ollama.com/
- **Gemini structured output documentation** — https://ai.google.dev/gemini-api/docs/structured-output
- **Mistral structured outputs documentation** — https://docs.mistral.ai/capabilities/structured-output/custom_structured_output/
- **Instructor, a library built around validation plus repair** — https://python.useinstructor.com/
- **Lost in the Middle (Liu et al., 2023), for how position in a long prompt changes what the model actually uses** — https://arxiv.org/abs/2307.03172

## Lesson: The Model Has No Parser

### Part 1 — A model's output is a distribution, and a distribution has no idea what a valid object is

Start with the mechanism, because everything else in this phase is a consequence of it.

When a model generates text, the final layer produces a score over the entire vocabulary — every token it knows, typically tens of thousands. Those scores pass through a softmax and become a probability distribution. The sampler picks one token, appends it to the sequence, and the process runs again. Repeat until a stop token appears.

Notice what is absent from that loop. There is no grammar. There is no stack. No notion of "we are inside an object, so the next token must be a string or a closing brace." The model has never executed a parser. It has read an enormous amount of text that *contains* JSON and learned a strong statistical association between prefixes and continuations. That association is real and powerful — which is exactly why this problem is confusing. It works well enough that it feels like a constraint.

It is not one. The distribution still assigns probability mass to `Sure! Here's the JSON you asked for:`. Your prompt shifted the mass; it removed none of it. **Any token with non-zero probability can be sampled.** At low temperature the tail is thin. Under an unusual input it is not. On the one request in five hundred routed through a slightly different internal state, the tail is where your output comes from.

> **The framing that fixes this.** You are not persuading a parser to accept your output. You are choosing *where the enforcement lives*. There are only three places: in the prompt (weak, probabilistic), in the decoder (hard, structural), or in your validator (hard, semantic). Any pipeline that matters should have at least two of the three, and the one people skip is always the third.

**Where this stops being the whole story.** The framing is precisely true and slightly incomplete. Instruction tuning does teach format compliance on common formats, and on a well-specified task with a short schema, rung 1 — just asking — can genuinely hit 99%+.

But 99% means something different depending on what is on the other side of the failure. In a chat window it is invisible. In a pipeline processing 50,000 records a night it is five hundred failures — five hundred exceptions if your code assumes a dict, or five hundred silent omissions nobody notices for two months if you wrapped the parse in a bare `except: continue`. **The size of the tail matters less than whether the code downstream can survive it.**

### Part 2 — The ladder: six rungs, and the guarantee each one actually buys

There is no single switch called "structured output". There is a ladder, and the rungs are not just "better" — they are *different kinds of thing*. Climbing changes the nature of the guarantee, not just its strength. Learn the ladder and you can predict which rung a given system is on from its symptoms.

**Rung 1 — asking politely.** A sentence in the system prompt: "Respond with JSON containing the fields title, author, and year." Nothing enforces this. The model will usually comply, and will sometimes produce markdown fences, a friendly preamble, a trailing explanation, or different field names because it decided `publication_year` was clearer. The failure mode is not random — it is *input-correlated*, which is worse. It fails on the long documents, the ambiguous ones, the ones with unusual characters. It fails exactly where you need it most, and inconsistently enough that tests pass.

**Rung 2 — the schema plus a worked example.** Show the model the exact JSON Schema you will validate against, then one complete, filled-in example of a real input and its correct output. This is a large jump, and the mechanism is worth naming: you have converted an abstract directive into a *pattern to continue*. Few-shot examples work by making the desired output an in-context continuation rather than an instruction to be interpreted. The model is no longer deciding what `year` should look like; it is copying the example's shape.

Two design notes matter more than they look. **The example must be genuinely correct** — a wrong example teaches the wrong shape harder than a right instruction. And **the example must not be confusable with the real input**, because then the model echoes the example's *values* instead of extracting from the real document. Vary the domains between example and reality.

**Rung 3 — prefilling the assistant turn.** Every chat-style API takes an array of messages with roles. Prefill means you supply a partial assistant message and let the model continue it. Send an assistant turn containing `{` and the model's first generated token continues a JSON object. It cannot open with "Sure!" because "Sure!" would be a continuation of `{`, and the model has essentially never seen that.

Prefill is the cheapest large win on the ladder and is under-used because it is invisible in most chat UIs. It eliminates the entire preamble class of failures and the markdown-fence class, because both require tokens that cannot follow an open brace. **Where it stops:** it does nothing about field names, types, or completeness. It is also not universally available — some providers and models do not permit a trailing assistant message. As of 2026-09 prefill support varies by provider and model family, so check current documentation rather than assuming; it is not part of the general message-array contract.

**Rung 4 — native JSON mode.** A request flag that guarantees the output is parseable JSON, mechanised at the decoder: only tokens that keep the output on a path to valid JSON can be chosen. It solves the parse problem completely.

It does not solve your problem. **JSON mode guarantees valid JSON, not your schema.** You can get back `{"result": "..."}` when you asked for `title`, `author`, and `year` — and it is perfectly valid JSON. You can get the right names with the wrong types, or a schema-shaped object with invented fields. This is the single most important distinction in the phase, and it produces the most confused bug reports in real teams: *the JSON parses fine and the data is wrong.*

```text
Rung 4, illustrated. The request asked for title / author / year.

{ "title": "Noli Me Tangere", "author": "José Rizal", "year": "1887" }
Valid JSON. Parses. year is a string, not a number, so `book["year"] - 1800`
raises TypeError at 3 a.m.

{ "book_title": "Noli Me Tangere", "writer": "José Rizal", "published": 1887 }
Valid JSON. Parses. Every field name is wrong, because "book_title" is a
perfectly reasonable thing to call a title and nothing said the name mattered.

{ "title": "Noli Me Tangere", "author": "José Rizal", "year": 1887,
  "publisher": "Berliner Buchdruckerei-Aktiengesellschaft",
  "isbn": "978-971-11-0000-0" }
Valid JSON. Parses. Two fields you never asked for, one of them invented.
This is the one that reaches production.
```

**Rung 5 — schema-constrained structured outputs.** A hosted API feature where you supply a JSON Schema and the provider constrains generation so the output conforms to it. Mechanically this is rung 6's machinery wired to a schema, and it is the strongest guarantee available from a hosted API.

The guarantee is real and bounded, and the bound is the word **subset**. Providers do not implement all of JSON Schema; they implement the part that compiles into a decoder constraint. That subset typically covers declared properties, `required`, `enum`, primitive types, arrays with an `items` schema, and `additionalProperties: false`. It typically does not cover — or covers with restrictions — constructs that are hard to enforce token-by-token: deep recursion, some composition keywords, `pattern` in some implementations, numeric bounds like `minimum` and `maximum` in others. Sending an unsupported keyword is usually a request-time error rather than a silent downgrade, which is the good case. **The exact supported-keyword list is provider-specific and moves with releases, so treat every item above as an example of the *kind* of gap rather than a claim about your provider — read the current "supported schemas" section of that provider's own documentation before you rely on a keyword.** As of 2026-09 the primary sources worth reading are OpenAI's structured outputs guide and Anthropic's structured outputs page, which documents `output_config.format` and lists its own unsupported set (recursive schemas, external `$ref`, numerical constraints such as `minimum`/`maximum`/`multipleOf`, and `additionalProperties` set to anything other than `false`) — **Unverified** here for the keyword-by-keyword detail on every other provider.

**The trap on rung 5 is a type that accepts anything.** A property typed as `string` is a promise the decoder can keep for *any* string. So `{"date": "not a date"}` is a fully conforming output, and so is `{"sentiment": "mostly fine I guess"}` when you wanted one of three labels, unless you wrote an `enum`. **Schema enforcement is shape enforcement. It has no opinion about whether the value is true, sensible, or in range.** Rung 5 is where beginners stop, and it is one rung too early.

**Rung 6 — grammar-constrained decoding.** For open-weight models you own the sampler, so you can do the constraint yourself.

At each generation step the model produces a score over the whole vocabulary. Constrained decoding inserts one operation between scoring and sampling: **a mask**. The grammar — a JSON Schema, a regex, or a hand-written GBNF grammar — is maintained as a state machine, so at every step the decoder knows which states are still reachable. It computes the tokens that can be legally appended while staying on a path to a valid completion, and sets the score of every other token to negative infinity. After the softmax those tokens have probability exactly zero.

That is the whole trick, and the consequence is worth stating precisely: **the invalid output does not become unlikely, it becomes unreachable.** No temperature setting, no adversarial input, no unusual context can produce it, because the sampler never sees those tokens as candidates. This is a hard structural guarantee, categorically different from every rung above it.

```python
# The mechanism, in about twelve lines. No library, no model — just the
# shape of what every constrained-decoding implementation does.

import math

NEG_INF = float("-inf")

def apply_grammar_mask(scores: dict[str, float],
                       allowed_tokens: set[str]) -> dict[str, float]:
    """Set every token the grammar forbids to negative infinity.

    scores maps token -> logit from the model's final layer.
    allowed_tokens is what the grammar's current state permits next.
    """
    return {t: (s if t in allowed_tokens else NEG_INF)
            for t, s in scores.items()}

def softmax(scores: dict[str, float]) -> dict[str, float]:
    # math.exp(-inf) == 0.0, so masked tokens come out at exactly zero
    # probability. Nothing downstream can sample them.
    m = max(scores.values())
    exps = {t: math.exp(s - m) for t, s in scores.items()}
    total = sum(exps.values())
    return {t: e / total for t, e in exps.items()}

# The grammar is inside a JSON object and requires the next key to be
# "sentiment". Only tokens that begin that key survive the mask.
scores = {'"sentiment"': 12.4, 'Sure': 9.1, 'Here': 8.7, '```': 11.0}
probs = softmax(apply_grammar_mask(scores, {'"sentiment"'}))

print(probs['"sentiment"'])   # 1.0
print(probs['Sure'])          # 0.0
print(probs['```'])           # 0.0
```

Three implementations you can actually run, all free, all open source. **outlines** compiles a JSON Schema or regex into a token-level index and applies it during sampling in Python. **llama.cpp** uses GBNF, a grammar notation you write by hand, enforced in the C++ sampler — the most educational, because you can read your own grammar file and see exactly what it forbids. **vLLM** exposes guided decoding as a server feature with JSON Schema, regex, choice, and grammar backends, so an OpenAI-compatible endpoint gets the same hard guarantee. As of 2026-09 all three are installable packages whose documentation changes faster than any summary — read the current docs, not this paragraph.

**Where rung 6 stops.** The mask constrains *structure*, and only structure. It cannot make the model know the author's name or make a value true. A grammar-constrained model will happily emit `{"year": 0}` or `{"author": ""}` if the grammar permits an integer and a string, because those are structurally fine. Constrained decoding changes *which* completions are reachable; it does not change which one the model thinks is best among them. There is a real cost too: maintaining grammar state and masking the vocabulary at every step is work, and the tighter the constraint, the more of the model's natural distribution you override — which on a hard task can mean forcing it into a corner where the only legal continuations are bad ones.

> **The ladder, compressed.** Rungs 1–3 change the probability of correct output. Rungs 4–6 change the *space* of possible output. Rung 4 fixes parseability. Rung 5 fixes shape. Rung 6 fixes shape with a guarantee that cannot be defeated. None of them fix truth. That last job is yours, and it is Part 3.

### Part 3 — A schema guarantees shape, not sense: validation is mandatory

Here is the sentence to carry out of this phase: **your schema can be perfectly enforced and your data can still be garbage.**

Every rung from 4 upward makes the *structure* trustworthy and leaves the *content* unverified. A schema says `year` is an integer. It does not say the integer is between 1000 and 2100. A schema says `sentiment` is a string; an `enum` says the string is one of three values, but not that the value is the *right* one for this document. A schema says `author` is present. It does not say the author is not empty, not `"Unknown"`, and not the example value you pasted into your prompt.

This produces a specific and dangerous failure state: **a pipeline that never throws.** Everything parses. Every object validates. `additionalProperties: false` is set, `required` is complete, the decoder is constrained. And the output is wrong in ways that are semantically invisible — a percentage field that says `9500` instead of `95`, a date that came back as the string `"next Tuesday"`, a summary confidently about a different document. The failure surfaces weeks later, when someone asks why a number is impossible.

So validation is not a fallback for when the schema is missing. **Validation is a second, independent layer testing a different property.** Build it in four stages, and make each stage report which one failed:

**Stage 1 — transport.** Did you get a response at all, and did it finish or get truncated by a length limit? A truncated JSON object is a transport failure that looks like a parse failure, and treating it as the latter sends you to fix the wrong thing.

**Stage 2 — parse.** Does it decode as JSON? On rung 4 and above this should be impossible to fail, and *if it fails anyway that is a signal about the rung, not the model* — a truncated response, a proxy that rewrote the body, an error page returned with a 200.

**Stage 3 — shape.** Does it conform to the schema? Field names, types, required fields, no extra fields. At rung 5 and above this is largely a formality — but do it anyway, because "largely" is not "always", and your validator is what catches the day the provider changes something.

**Stage 4 — sense.** Does the data mean what you need it to mean? Ranges, formats, cross-field consistency, non-emptiness, values from your domain. This stage has no automatic solution, and it is the one that catches the interesting bugs.

```python
# Stages 3 and 4, on an object that passed the schema and should not have.

import json
from datetime import date
from jsonschema import validate, ValidationError

SCHEMA = {
    "type": "object",
    "properties": {
        "title":     {"type": "string"},
        "author":    {"type": "string"},
        "year":      {"type": "integer"},
        "sentiment": {"type": "string",
                      "enum": ["positive", "neutral", "negative"]},
        "summary":   {"type": "string"},
    },
    "required": ["title", "author", "year", "sentiment", "summary"],
    "additionalProperties": False,
}

# The decoder was constrained to this schema. It produced this.
RAW = '{"title": "Noli Me Tangere", "author": "", "year": 0, ' \
      '"sentiment": "neutral", "summary": "A novel."}'

def check_sense(obj: dict) -> list[str]:
    """Stage 4. Returns problems. Empty list means it passed."""
    problems = []

    if not obj["author"].strip():
        problems.append("author is empty or whitespace")

    # The schema said integer. It did not say which integers are plausible.
    if not (1000 <= obj["year"] <= date.today().year):
        problems.append(f"year {obj['year']} is outside 1000..{date.today().year}")

    if len(obj["summary"]) < 40:
        problems.append("summary is too short to be a summary")

    # Cross-field: check relationships your types cannot express.
    if obj["title"].lower() in obj["summary"].lower() and len(obj["summary"]) < 60:
        problems.append("summary merely restates the title")

    return problems

obj = json.loads(RAW)                              # stage 2: parse

try:
    validate(instance=obj, schema=SCHEMA)          # stage 3: shape
    print("shape: OK")
except ValidationError as err:
    print("shape: FAILED ->", err.message)
    raise

for p in check_sense(obj):                         # stage 4: sense
    print("sense: FAILED -", p)
```

Run that and you get `shape: OK` followed by three sense problems. That output is the entire argument of this part in four lines. **Every enforcement mechanism in this phase would have approved that object.** Constrained and validated, and worthless.

Two design principles fall out of it.

**Do not type a field as `string` when you mean a closed set.** If the answer is one of three labels, write the `enum`. Rungs 5 and 6 both enforce enums, so an enum converts a fuzzy semantic judgement into a structural guarantee — the single highest-leverage thing you can do in a schema. This is why classification tasks are the easiest to make reliable and creative extraction tasks the hardest: classification can be pushed onto the ladder, extraction always ends in stage 4.

**Every field you cannot validate is a field you are trusting.** A schema field with no sense-check beside it is an assumption, and assumptions in a pipeline are where the wrong data lives.

**Where validation stops.** Your validator only tests what you thought to test. A range check on `year` will not notice the year belongs to a different book. A cross-field check will not notice the whole object describes the wrong document — the classic failure when a chunked document leaks across a boundary. There is an economic boundary too: each check is code that itself needs testing, and a validator with a bug rejects good data, which is its own outage.

**Validation catches the failures you have already imagined.** It is a floor, not a ceiling. The failures you have not imagined are what evaluation and monitoring are for — a later track — but the instinct to ask "what would a wrong-but-valid object look like here?" belongs to this one.

### Part 4 — Designing schemas the model can actually hit

A schema is not a description of your database. It is a *target for a sampler*, and designing it as though the two are the same is how people end up with 60% conformance and no idea why.

**Keep it flat.** Deep nesting means more grammar state and more structure for the model to hold in mind at once. Every level is a place where an object gets closed early, a required field gets dropped, or a sibling gets attached to the wrong parent. Flat schemas with dotted names — `author_name`, `author_birth_year` — are uglier and more reliable. If you need hierarchy, ask whether it is real or whether you are mirroring a UI.

**Use enums aggressively.** Every field whose value space you control should be an enum: sentiment, category, priority, language code, status, document type. This is not a style preference; it is the difference between a field that is enforced and one that is hoped for. It has a second effect worth knowing — constraining the choice space helps the model choose sensibly, because the decision becomes a comparison among listed options rather than a free generation.

**Set `additionalProperties: false` and be complete with `required`.** Together these stop the two opposite failure modes: invented fields (the model adding `isbn` and `publisher` you never asked for, which leak into your database and logs) and silent omissions (a field simply not appearing, so your code gets a `KeyError` or, worse, a `.get()` default). Both are in the supported subset of the hosted schema modes as of 2026-09. If your provider rejects `additionalProperties: false`, that is information about its supported subset and worth knowing rather than working around silently.

**Make nullability explicit.** "The field is missing" and "the field is present and null" mean different things — not stated versus stated-as-unknown — and a schema with only one of those states forces the model to guess which you meant.

**Keep the schema small enough to be a target.** A forty-field, three-level schema is not a harder instruction; it is a *weaker* one, because the constraint surface is so large that partial compliance is easy. When a schema gets long, the fix is usually to split the extraction into two passes over the same text with two small schemas, and accept the second call as the price of reliability.

### Part 5 — The failure you will actually hit: shape-valid, sense-invalid

Let us make the failure concrete, because the abstract version does not stick.

You build a contract-extraction pipeline. The schema has `party_name`, `effective_date`, `term_months`, `governing_law`, and `auto_renews`. You wire it to the schema-constrained rung and run it on two hundred contracts. One hundred and ninety-eight come back clean. Two do not, in different ways.

**Contract 17** returns `{"effective_date": "the first of next month", ...}`. Your schema typed `effective_date` as `string`. The decoder obliged. Nothing in the schema was violated. Your downstream code parses that string as a date and throws — the *good* outcome, because it threw loudly on the first run rather than writing a bad row.

**Contract 83** returns `{"term_months": 12, "auto_renews": true, ...}` for a contract whose term is 24 months and which does not auto-renew. Structurally perfect. Numerically plausible. Wrong. Nothing throws. This is the failure that survives to production, and it exists because you asked for extraction from a long document and the model answered from the part it attended to, which was the wrong part.

Now notice what each fix addresses.

Contract 17 is a **schema-design** failure. Had `effective_date` been a structured `{"year": int, "month": int, "day": int}` object instead of a free string, the failure would have been impossible at rung 5 or 6. The lesson is not "add a regex". It is: **when a value has internal structure, do not hide it inside a `string`.** Every time you do, you have moved enforcement out of the decoder and into your validator, and your validator may or may not check it that day.

Contract 83 is not fixable in the schema at all. The problem is that the model read the wrong part of the document, and your options are all outside the schema: give it less text so there is less to get wrong (the retrieval track's whole argument), run it twice and check agreement, add a stage-4 consistency rule, or route low-confidence extractions to a human. **Some failures are not schema failures, and no amount of schema engineering will reach them.**

That split is the predictive tool this phase gives you. When structured output fails, ask which of the four stages failed, then ask whether the fix belongs in the prompt, the schema, the decoder, or the validator. Rung 1 failures are prompt failures. Shape failures are schema or decoder failures. Sense failures are validator or architecture failures.

### Part 6 — Repair, not retry

Even with the strongest rung you will get failures: truncated responses, transport errors, request-time schema rejections, and — always — stage-4 problems. What you do next is a design decision, and the wrong default is the one most people pick.

**The wrong default is `retry`.** Resending an identical request to a decoder constrained to be deterministic produces an identical failure; even when it is not deterministic, resending with no new information is a coin flip you are paying for. Retrying is right for *transport* failures — a timeout, a 5xx, a rate limit — and exactly wrong for shape and sense failures, which are deterministic properties of your input and schema.

**The right pattern is repair**, and the mechanism is straightforward: **the failure message is information, so feed it back.** If stage 3 failed with "additional property 'isbn' is not allowed", that string goes into the repair prompt. If stage 4 failed with "year 0 is outside 1000..2026", that goes in too. You are no longer asking the same question again; you are asking a narrower question with the exact defect named. This converts a retry into a *correction*, and the difference in success rate is large.

```python
def repair_prompt(original_text: str, bad_output: str, problems: list[str]) -> str:
    bullet_list = "\n".join(f"- {p}" for p in problems)
    return (
        "Your previous output failed validation. Fix ONLY the problems listed.\n\n"
        f"PROBLEMS:\n{bullet_list}\n\n"
        f"YOUR PREVIOUS OUTPUT:\n{bad_output}\n\n"
        f"SOURCE TEXT:\n{original_text}\n\n"
        "Return the corrected object. If a value cannot be determined from the "
        "source text, use null rather than guessing."
    )
```

Three lines in that prompt are doing real work. **"Fix ONLY the problems listed"** prevents the repair pass from regenerating the whole object and introducing new errors in fields that were already correct — a common regression. **Including the previous output** gives the model a starting point rather than a blank slate, making a minimal edit possible. **The explicit null instruction** matters because the most common repair failure is a model that, told its `year` was invalid, invents a plausible one to satisfy you. The sycophancy literature (Sharma et al., arXiv:2310.13548) documents exactly this tendency — models shifting toward what they take to be the user's preferred answer — so a legitimate escape hatch is not a nicety, it is a correctness requirement.

Then bound it. **A repair budget of one, occasionally two.** A loop that repairs indefinitely on an ambiguous document burns tokens producing variations of the same wrong answer. When the budget is exhausted, route the item to a failure queue with the original text and the validation errors attached. That queue is not a defeat; it is the honest output of a system that knows what it does not know, and far more valuable than a silent wrong row.

**Where repair stops.** Repair works when the failure is *local and nameable* — a wrong type, a missing field, an out-of-range value. It does not work when the failure is *architectural*: if the model extracted from the wrong chunk, telling it "year is out of range" produces a different wrong year. If repairs succeed less than about half the time on a given field, the field's problem is not the field. The input is wrong, or the schema is wrong, or the task needs a human.

### Part 7 — Where schema enforcement stops working

Four boundaries, and knowing them is how you avoid building the wrong thing confidently.

**When the output is for a human.** If a person will read the result, a well-written prose answer beats a JSON object they have to mentally unflatten. Structured output exists for code. Forcing a chat assistant to answer in a schema degrades the answer and pleases nobody.

**When the task is genuinely open-ended.** A schema constrains the space of possible answers, and on some tasks the right answer is outside the space you drew. Summarisation into fixed fields is fine; "explain why this bug happens" forced into `{"cause": string, "fix": string}` produces a conforming answer that omits everything interesting. **The tighter the constraint, the more you are choosing the answer's shape on the model's behalf — and sometimes you are choosing wrong.**

**When the schema cannot express the constraint.** Some rules are not local to a field: "the line items sum to the total", "the end date is after the start date". Most providers' supported subsets cannot express these. They live in stage 4, in your code, and no rung of the ladder will move them. Do not spend a week encoding a business rule in JSON Schema; write the validator.

**When the constraint costs more than it saves.** Constrained decoding is not free — grammar state must be maintained and the vocabulary masked at every step, and on a large schema that is real work for you and the serving stack. More subtly, a hard constraint can *degrade quality* on a task the model is barely capable of: if the only legal continuations are bad ones, the constraint forces a bad one rather than the honest "I cannot tell from this text". On hard tasks, a schema with an explicit escape field often beats a strict schema with none. That trade-off has no universal answer; measuring it on your own data is the only honest way to settle it.

That is the boundary of the whole phase. Structured output makes a model *reliable*, not *correct*. It converts an unpredictable interface into a predictable one and leaves the question of truth exactly where it was — in your validation, your evaluation, and your willingness to build a failure queue instead of pretending the failures are not there.

## Hands-on practice tasks

1. Get any model answering on your machine, local or hosted, and make one call that returns prose. Save the raw response text to a file. You will use this same task against every rung. <!-- id: prompt-04-structured-output-t01 band: quick energy: low -->
2. Define your extraction target as a Pydantic model for a document type you actually care about — an invoice, a recipe, a news article, a job posting. Print `model_json_schema()` and read it. Note which fields you typed as `string` because you had not decided what they really are. <!-- id: prompt-04-structured-output-t02 band: focused energy: normal -->
3. Run the same extraction twenty times at rung 1 — prose instruction only, no schema, no example. Parse each response with `json.loads` inside a try/except and count how many fail. Save every failure verbatim. <!-- id: prompt-04-structured-output-t03 band: focused energy: normal -->
4. Add the JSON Schema and one worked example to the prompt, and rerun the same twenty inputs. Count failures again. Compare the *kinds* of failure, not just the count — you will find the failures changed character rather than only shrinking. <!-- id: prompt-04-structured-output-t04 band: focused energy: normal -->
5. Add an assistant prefill of `{` and rerun. Then, on the same provider, deliberately send an assistant turn that does not end in an open brace and observe what changes. Record whether your provider and model permit prefill at all, and date the note. <!-- id: prompt-04-structured-output-t05 band: focused energy: normal -->
6. Turn on native JSON mode and rerun. Confirm every response parses. Then hunt for the ones that parse and are still wrong — print the parsed object next to the source text and find at least one structural mismatch: a wrong field name, a wrong type, or an invented field. <!-- id: prompt-04-structured-output-t06 band: deep energy: high -->
7. Write a stage-4 sense validator for your schema: a range check, a format check, a non-emptiness check, and one cross-field rule. Run it across every response you have collected so far and count how many passed shape but failed sense. <!-- id: prompt-04-structured-output-t07 band: deep energy: high -->
8. Deliberately construct an input that will produce a shape-valid, sense-invalid object — a document with no date in it, or an ambiguous author. Confirm that schema enforcement permits the bad output, and write down which stage caught it. <!-- id: prompt-04-structured-output-t08 band: focused energy: normal -->
9. Take one free-text field in your schema that is really a closed set, convert it to an `enum`, and measure the change in correctness across twenty inputs. This is the highest-leverage single edit in the phase; do it and see the number. <!-- id: prompt-04-structured-output-t09 band: focused energy: normal -->
10. Constrain a local model with `outlines` using a regex or JSON Schema and generate a hundred outputs. Try to make it emit something invalid — with an adversarial prompt, with high temperature, with a long confusing input. Record your best attempt and the exact output. <!-- id: prompt-04-structured-output-t10 band: deep energy: high -->
11. Write a GBNF grammar by hand for a two-field object and run it in llama.cpp. Then break your own grammar deliberately — remove the closing brace rule — and watch the failure mode change. Explaining that change is the point of the task. <!-- id: prompt-04-structured-output-t11 band: deep energy: high -->
12. If you can run vLLM, serve a small model with guided decoding and hit it with the same twenty inputs through the OpenAI-compatible endpoint. Compare conformance against rung 4 on the same model. <!-- id: prompt-04-structured-output-t12 band: deep energy: high -->
13. Send a schema containing a keyword your provider's supported subset does not include — a recursive `$ref`, or a `minimum` if you have checked that yours ignores it. Record the exact error and update your notes on what the subset covers, with a date. <!-- id: prompt-04-structured-output-t13 band: focused energy: normal -->
14. Add `additionalProperties: false` and a complete `required` list, rerun, and diff the outputs against the previous run. Look specifically for invented fields disappearing and for new failures introduced by the stricter schema. <!-- id: prompt-04-structured-output-t14 band: focused energy: normal -->
15. Implement the repair path: on a stage-3 or stage-4 failure, send the validator's message back as a repair prompt with a budget of two. Measure how often the first repair succeeds, and record which field fails most often. <!-- id: prompt-04-structured-output-t15 band: deep energy: high -->
16. Break the repair loop on purpose: feed it a document that genuinely does not contain the required information, with no null option in the schema, and observe what the model invents. Then add a nullable field and run it again. <!-- id: prompt-04-structured-output-t16 band: deep energy: high -->
17. Run your full pipeline over fifty real inputs and produce a failure table: how many failed transport, parse, shape, and sense, and what the repair pass recovered in each class. <!-- id: prompt-04-structured-output-t17 band: deep energy: normal -->
18. Write a short note titled "Where I would not use a schema", naming three tasks from your own work where constraint would destroy the answer. Date it. <!-- id: prompt-04-structured-output-t18 band: ongoing energy: low -->

## Common Pitfalls

**Believing JSON mode enforces your schema.** The most common and most expensive confusion in this phase. JSON mode guarantees parseability and nothing else. You can get valid JSON with the wrong field names, the wrong types, and invented fields. Conformance to *your* schema requires schema-constrained generation or a validator, and ideally both.

**Stopping at the schema-constrained rung and skipping validation.** Stronger enforcement makes validation feel redundant, which is exactly backwards. The stronger the enforcement, the more confident the output looks, and the less likely anyone is to notice that `{"date": "not a date"}` satisfies a `string`.

**Typing anything as `string` when you mean a closed set.** An enum is enforceable; a free string is not. Every classification you express as prose is a classification you have chosen not to enforce.

**Leaving `additionalProperties` unset.** The model invents fields. They leak into your database, your logs, and your downstream code, and they are the hardest kind of schema drift to notice because everything still works.

**Nesting because your data model nests.** Your database's normalisation is not the model's target. Deep schemas produce dropped fields and mis-parented siblings. Flatten first, and only add depth when you have measured that you need it.

**Putting a structured value inside a string.** A date, a currency amount, a phone number, or an address hidden in a `string` field moves enforcement out of the decoder and into your validator. If a value has internal structure, model the structure.

**Using an example that resembles the real input.** The model echoes the example's values into the output, and you get perfectly-shaped data about the wrong document. Vary the domains between example and reality, and check for it explicitly.

**Treating a validation failure as a retry condition.** Resending an identical request to a constrained decoder reproduces the failure. Retry is for transport. Repair is for structure and sense.

**Repairing without naming the defect.** "That was wrong, try again" is a retry wearing a repair costume. The validator's actual message is the useful payload; send it.

**Forgetting the null escape hatch.** A model told its value was invalid, and given no legal way to say "not present in the source", will invent a plausible one. This is the documented sycophancy tendency, and a nullable field is the fix.

**Repairing forever.** A repair loop with no budget on a genuinely ambiguous input produces variations of the same wrong answer at full price. Bound it, and route the residue to a queue.

**Assuming a schema that works on one provider works on another.** The supported subset of JSON Schema differs between providers and changes over time. Features that compile on one are request-time errors on another. Test your schema against the provider you are actually using, and date the note.

**Ignoring `finish_reason` after adding schema enforcement.** A truncated response fails at stage 1 and looks like a stage-2 failure. Three hours of schema debugging later, the real problem is an output token limit.

**Splitting an over-large schema into two passes only after a crisis.** Two small schemas over the same text with two calls is usually more reliable than one forty-field schema. Reach for it earlier than feels necessary.

## Deliverable / proof of work

Write `portfolio/prompting/04-structured-output.md` containing:

- **Your target schema**, as the actual Pydantic model or JSON Schema document, with a short paragraph explaining each design decision: what you flattened, what you made an enum, what you left nullable, and what you could not express.
- **A rung-by-rung table** with real measured numbers from at least three rungs — 20 inputs each, with failures counted and classified as transport, parse, shape, or sense. Not estimates. Your own counts.
- **The rung-4 demonstration.** One verbatim response that parses as valid JSON and is still wrong, with a sentence on which of your schema fields permitted it.
- **Your sense validator**, as code, with at least four checks across three categories (range, format, cross-field), and the number of shape-valid outputs it rejected.
- **The worked failure**, written up properly: the source input, the verbatim bad output, the validation error, the repair prompt you sent, and the repaired output. If the repair failed, that is a better write-up — include what you did instead.
- **Your repair function**, with the budget enforced in code and a demonstration that it gives up and routes to a failure queue.
- **Your grammar or constraint artifact** — a GBNF file, an `outlines` call, or a vLLM guided-decoding request — plus your best attempt at defeating it and the evidence that you could not.
- **A dated note on the supported subset** of whichever provider you used: which JSON Schema keywords compiled, which were rejected, and the exact errors.
- **A section titled "Where I would not use a schema"** — three tasks from your own context, each with the reason constraint would make the output worse.

## Checklist

- [ ] I can explain why a probability distribution over tokens has no concept of a valid object <!-- id: prompt-04-structured-output-c01 energy: normal -->
- [ ] I have run the same extraction task at three or more rungs of the ladder and measured the difference myself <!-- id: prompt-04-structured-output-c02 energy: high -->
- [ ] I can name the six rungs and say what each one does and does not guarantee <!-- id: prompt-04-structured-output-c03 energy: normal -->
- [ ] I can explain why prefill blocks the preamble class of failures and what it does not fix <!-- id: prompt-04-structured-output-c04 energy: normal -->
- [ ] I have checked whether my provider and model support assistant prefill, and dated the note <!-- id: prompt-04-structured-output-c05 energy: low -->
- [ ] I can explain the difference between JSON mode guaranteeing valid JSON and guaranteeing my schema <!-- id: prompt-04-structured-output-c06 energy: normal -->
- [ ] I have seen a schema-constrained response that was valid, conformant, and wrong <!-- id: prompt-04-structured-output-c07 energy: normal -->
- [ ] I can explain how a grammar mask sets forbidden tokens to zero probability and why that is a hard guarantee <!-- id: prompt-04-structured-output-c08 energy: high -->
- [ ] I have run grammar-constrained decoding myself with outlines, llama.cpp, or vLLM guided decoding <!-- id: prompt-04-structured-output-c09 energy: high -->
- [ ] I tried to defeat my own grammar constraint and can say exactly why I could not <!-- id: prompt-04-structured-output-c10 energy: high -->
- [ ] I can state which JSON Schema keywords my provider's supported subset accepts and which it rejects <!-- id: prompt-04-structured-output-c11 energy: normal -->
- [ ] My schema uses enums for every field whose value space is closed <!-- id: prompt-04-structured-output-c12 energy: normal -->
- [ ] My schema sets additionalProperties false and lists every required field <!-- id: prompt-04-structured-output-c13 energy: low -->
- [ ] I can explain why nesting costs reliability and what I flattened to avoid it <!-- id: prompt-04-structured-output-c14 energy: normal -->
- [ ] I do not hide structured values like dates or amounts inside plain string fields <!-- id: prompt-04-structured-output-c15 energy: normal -->
- [ ] I have written a stage-4 validator covering range, format, and one cross-field rule <!-- id: prompt-04-structured-output-c16 energy: high -->
- [ ] My validator has actually rejected at least one output that passed the schema <!-- id: prompt-04-structured-output-c17 energy: normal -->
- [ ] I can explain why schema enforcement guarantees shape and never sense <!-- id: prompt-04-structured-output-c18 energy: normal -->
- [ ] My pipeline distinguishes transport, parse, shape, and sense failures and reports which stage failed <!-- id: prompt-04-structured-output-c19 energy: high -->
- [ ] I have implemented a repair path that sends the validator's error message back, with a bounded budget <!-- id: prompt-04-structured-output-c20 energy: high -->
- [ ] My repair path gives up and routes to a failure queue rather than looping indefinitely <!-- id: prompt-04-structured-output-c21 energy: normal -->
- [ ] I can explain why retrying a shape or sense failure is different from repairing it <!-- id: prompt-04-structured-output-c22 energy: normal -->
- [ ] My schema offers a legal way to say a value is absent, so the model does not invent one <!-- id: prompt-04-structured-output-c23 energy: normal -->
- [ ] My examples are correct and their domains differ from the real inputs <!-- id: prompt-04-structured-output-c24 energy: low -->
- [ ] I can name three tasks where constraint would destroy the answer <!-- id: prompt-04-structured-output-c25 energy: normal -->
- [ ] I can say where schema enforcement stops working and why that is a design boundary rather than a bug <!-- id: prompt-04-structured-output-c26 energy: normal -->

## Quiz

### Q1. You enable native JSON mode and every response now parses cleanly. What have you actually guaranteed? <!-- id: prompt-04-structured-output-q01 energy: normal -->

- [x] That the output is valid JSON — but not that it has your field names, your types, or without invented fields
- [ ] That the output conforms to the schema you sent in the prompt
- [ ] That the output is factually correct because the decoder was constrained
- [ ] That the model will refuse inputs it cannot extract from

**Why:** JSON mode constrains generation to paths that produce parseable JSON. It has no knowledge of which fields you wanted, so `{"result": "..."}` and `{"title": ..., "publisher": ...}` are both perfectly acceptable outputs to it. Conformance to your schema needs schema-constrained generation, and correctness needs your validator.

### Q2. A grammar-constrained decoder forbids certain tokens at each step. What does that do to the probability of an invalid output? <!-- id: prompt-04-structured-output-q02 energy: high -->

- [ ] It makes it very unlikely, so a low temperature is still needed as a second safeguard
- [ ] It reduces it in proportion to how tightly the grammar is written
- [x] It sets it to exactly zero, because forbidden tokens receive negative-infinite scores and the sampler never sees them as candidates
- [ ] It does not change the probability, only the reported logprobs

**Why:** The mask is applied to the logits before the softmax, and exponentiating negative infinity yields zero. This is why constrained decoding is a structural guarantee rather than a strong hint: the invalid continuation is not improbable, it is unreachable. Temperature then only chooses among the legal options.

### Q3. Your schema-constrained extraction returns `{"effective_date": "the first of next month"}`. The schema types `effective_date` as `string`. What happened? <!-- id: prompt-04-structured-output-q03 energy: normal -->

- [x] Nothing failed — a string is a string, and the schema never said the value had to be a date
- [ ] The provider silently ignored the schema
- [ ] The decoder failed and fell back to unconstrained generation
- [ ] The schema was rejected at request time and the request was downgraded

**Why:** Schema enforcement validates shape, not sense. A `string` type is a promise any string can satisfy, so the decoder had no reason to reject that value. The fix is to model the structure — a pattern, or a nested object with year, month, and day — or to catch it in a stage-4 validator.

### Q4. You suppress preamble with an assistant prefill of `{`. Which failure class does this fix, and which does it leave untouched? <!-- id: prompt-04-structured-output-q04 energy: normal -->

- [ ] It fixes invented fields and leaves wrong types untouched
- [ ] It fixes wrong types and leaves preambles untouched
- [ ] It fixes everything structural except truncation
- [x] It fixes preambles and markdown fences, because those tokens cannot follow an open brace, and leaves field names, types, and completeness untouched

**Why:** Prefill works because the model continues a partial message, so the first token must be a legal continuation of `{`. That rules out conversational openers and code fences outright. It says nothing about what keys appear inside the object, what types they hold, or whether a required field shows up at all.

### Q5. A validation failure comes back as "additional property 'isbn' is not allowed". What is the correct next action? <!-- id: prompt-04-structured-output-q05 energy: normal -->

- [ ] Resend the identical request — the extra field was a sampling fluke
- [x] Send a repair request containing that exact error message and the previous output, with a bounded number of attempts
- [ ] Lower the temperature and resend the identical request
- [ ] Abandon schema enforcement and go back to a prose instruction

**Why:** Retrying an identical request against a constrained decoder reproduces the failure, because the same input and the same schema produce the same output. The validator's message is the useful payload: naming the defect turns a retry into a correction. Then bound it — if repair fails, route the item to a failure queue rather than looping.

### Q6. Which of these most reduces the *sense* risk in a schema without changing the prompt? <!-- id: prompt-04-structured-output-q06 energy: normal -->

- [ ] Adding a second worked example with different values
- [x] Replacing a free-text string field with an `enum` of the values you will actually accept
- [ ] Adding `additionalProperties: false` to every object
- [ ] Prefilling the assistant turn with `{`

**Why:** An enum converts a fuzzy semantic judgement into a structural constraint, which the decoder enforces — the model can only choose among your listed values. `additionalProperties: false` and prefill fix disjoint structural problems and neither touches whether the chosen value is right. Few-shot examples help but remain probabilistic.

### Q7. Your schema has `account` as a `string` and `verified` as a `boolean`. The model returns `{"account": "Acme", "verified": true}` for a company with no verification on file. Which statement is accurate? <!-- id: prompt-04-structured-output-q07 energy: high -->

- [x] Every enforcement rung would approve this object, and the gap is a missing stage-4 check or a missing escape value, not a schema defect
- [ ] The schema is broken, because booleans should always be nullable
- [ ] The provider's constrained decoding is not working
- [ ] No fix is possible; this class of error is why structured output is unreliable

**Why:** The output is structurally perfect, so the decoder, the schema, and even a strict validator testing types would all pass it. The failure is semantic: the model had to answer true or false and had no legal way to say "unknown". The fixes are a nullable or tri-state field, a cross-field consistency rule, or routing the case to a human.

### Q8. You put a date field in your prompt's JSON Schema using an unsupported keyword. What should you expect? <!-- id: prompt-04-structured-output-q08 energy: normal -->

- [ ] The provider silently ignores the keyword and returns conforming output anyway
- [ ] A warning in the response body with the schema downgraded to JSON mode
- [x] Typically a request-time error, because the provider's supported subset does not include that keyword
- [ ] The model itself rejects the schema during generation

**Why:** Hosted schema-constrained modes compile your schema into a decoder constraint, so keywords outside the supported subset cannot be enforced and are rejected when the request is validated. That is the good outcome — a loud failure rather than a silent downgrade. Which keywords are supported differs by provider and changes over time, so test against the one you use.

### Q9. Why does a repair prompt need to say "fix ONLY the problems listed"? <!-- id: prompt-04-structured-output-q09 energy: normal -->

- [ ] Because it reduces the token count of the repair call
- [ ] Because providers reject repair requests that do not use that phrasing
- [ ] Because it makes the repair deterministic at temperature 0
- [x] Because without it the model regenerates the whole object and can introduce new errors in fields that were already correct

**Why:** A repair pass that rewrites everything is a fresh extraction with a hint, and fresh extractions carry their own failure rate. Constraining the change to the named defects keeps the validated fields validated. This is why you include the previous output as the starting point as well — it makes a minimal edit possible.

### Q10. A schema constrains a summary field to a fixed pair of `cause` and `fix` strings. On hard debugging questions the outputs are technically conformant and unhelpful. What is the right read? <!-- id: prompt-04-structured-output-q10 energy: high -->

- [ ] The schema needs `maxLength` and `minLength` bounds
- [ ] The provider is not enforcing the schema strictly enough
- [ ] The model is too small for the task
- [x] The constraint is choosing the answer's shape on the model's behalf, and this task's answer does not fit that shape

**Why:** Structure is not free. A schema restricts the space of possible answers, and when the useful answer falls outside it, the model must produce a conformant answer that is worse than the one it would have written freely. Some tasks are for prose. Recognising them is part of knowing where enforcement stops being the right tool.

## You're ready to move on when...

You have a pipeline that returns an object your code indexes into directly, and you built it by climbing the ladder rather than jumping to the top — you can show the measurements from at least three rungs on the same twenty inputs, classified by failure stage. You have watched native JSON mode return something that parses perfectly and is still wrong, and you can say which field in your schema permitted it. You have written a validator that has actually rejected an output the schema accepted, and you can explain why that had to happen. You have run grammar-constrained decoding yourself and tried to defeat it and failed, and you can explain in your own words why the mask makes invalid output unreachable rather than unlikely. Your schema uses enums where the value space is closed, forbids additional properties, and does not hide structured values inside strings. Your repair path names the defect, is bounded, and gives up into a failure queue. And you can name three tasks where you would not use a schema at all, plus the reason.

## Free vs Paid

### What's free is enough

Everything in this phase runs at zero cost, including the strongest rung on the ladder.

Grammar-constrained decoding is open source and free by construction: outlines, llama.cpp, and vLLM are all installable today with no account and no key. That matters more than usual here, because it means the *hardest guarantee in the phase* — tokens masked to zero probability — is the one you can experiment with most freely. There is no rate limit on your own machine, so you can run a hundred adversarial attempts at defeating your own grammar and it costs nothing but electricity. Tasks 10, 11, and 12 exist for exactly this reason.

Validation is free in every direction. Pydantic and jsonschema are open source, and a validator you write by hand is a few dozen lines. The repair loop is free to build and free to test against a local model.

The only rung with a real cost is the hosted schema-constrained mode, and even there most providers offer a free tier or trial credit that will cover a week of twenty-input experiments comfortably. If you would rather not sign up at all, you can reach the same understanding through the local path: `outlines` with a JSON Schema gives you the same hard structural guarantee that a hosted structured-output mode gives, on the same schema language.

The free path costs you two things, and both are worth naming. You will not exercise a hosted provider's *supported subset* — which keywords compile, which are rejected, and what the exact error looks like — and that knowledge is genuinely useful because it differs between providers. And a small local model will fail the *sense* stage more often than a large hosted one, which is inconvenient for production and excellent for learning: you get more interesting failures to validate against, sooner.

### What a paid tier adds

**Hosted schema-constrained generation with a production SLA.** The guarantee is the same as the local path, but the model behind it is stronger, the latency is better, and you do not maintain the serving stack. **Volatile, dated: as of 2026-09 the supported JSON Schema subset, the exact request parameter name, and which models offer schema-constrained mode all differ between providers and change without much notice — read the current documentation for the provider you are using rather than any summary, including this one.**

**Structured output combined with tool calling.** Tool and function arguments are structured output by another name, and the hosted implementations coordinate the two. This matters more in the agents track than here.

**Larger models, which move the stage-4 failure rate.** Schema enforcement makes the *shape* reliable regardless of model size. It does not make a small model good at extracting a date from a dense contract. If your sense-failure rate is the thing blocking you, the honest fix is usually a better model or better inputs, not more schema engineering.

### When it's worth paying

**Not to finish this phase.** Climb the whole ladder free, including the constrained-decoding rung on a local model. You will learn the mechanisms identically, you will get a better supply of instructive failures, and you will spend nothing.

The threshold is the point where you are putting this pipeline in front of real users or real data. At that point two things change. First, the sense-failure rate starts having consequences, and a stronger model measurably reduces it — that is a purchase with a number attached, and you can measure it on your own inputs before deciding. Second, you will want a provider whose supported subset you have tested and whose terms you have read, because once the extracted data is anything sensitive, the provider's data-handling terms matter more than the price per token.

One caution before you spend anything: measure the free path first. The most common waste in this part of the field is paying for a stronger model to fix what is actually a schema design problem — a date hiding in a `string`, a classification written as free text, or a forty-field nested schema that should have been two small flat ones. Every one of those is free to fix, and no amount of model quality will fix them for you.
