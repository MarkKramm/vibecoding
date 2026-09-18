---
id: prompt-06-prompt-chaining
track: prompting
phase: 6
order: 60
title: Decomposition and Prompt Chaining
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/prompting/06-prompt-chaining.md
exit_criteria: >
  You can take a task you would previously have written as one large prompt,
  split it into steps, and say for each step why it is a model step or a code
  step. You have built and run a chain of at least three steps in which
  deterministic code sits between the model calls, validating and transforming
  what the model returned. You can show one case where a single prompt failed
  in a way you could not localise and the chain localised it, and you can state
  in your own words the conditions under which chaining costs more than it is
  worth and a single prompt is the right answer.
---

# Phase 6 — Decomposition and Prompt Chaining

## Goal of this phase

Stop asking one prompt to do a whole job. Learn to break the job into steps, and — more importantly — learn which of those steps should not be a model call at all.

Here is the thing that separates someone who is good at prompting from someone who has memorised prompt tricks. A single large prompt is a machine you cannot inspect. When it produces something wrong, you have one artifact and no information: the wrong output is the only evidence you get, and every part of the prompt is a suspect. A chain is a machine with windows. Each step produces an artifact you can look at, and an error shows up in the step that caused it rather than somewhere downstream.

But the deeper half of this phase is not about prompting. It is about knowing when to stop using a model. **A language model is the right tool for exactly one thing: turning unstructured meaning into structured meaning. Date arithmetic, string formatting, arithmetic, and table lookups are not that.** A model that computes a due date is a model that will one day be confidently wrong about a due date, in a way that no amount of prompt engineering prevents, because confidently continuing plausible text is what it does. Moving that work into four lines of ordinary code makes it correct every time, instantly, for free, and testable.

That combination — narrow model steps, inspected in between, with deterministic code doing the deterministic parts — is what this phase teaches. By the end you will have built a real chain over a messy input, and more usefully, you will have a rule for deciding where the model belongs.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Day 1 is the lesson. Days 2–4 are the practice tasks, and the worked example in Part 4 is the spine of them — tasks 2 through 6 build it up piece by piece rather than asking you to do it all at once. Day 5 is the write-up and the comparison table.

Budget an extra half hour if you have never written a regular expression or parsed a date in code. That half hour is not a detour: the whole point of this phase is that some steps are code, and if all of your steps are model calls you have not yet learned the thing.

## Skills you'll gain

- Read a task and decide, step by step, whether each step is a model step or a code step
- Explain why narrowing a prompt's task reduces the set of plausible continuations, and therefore reduces error
- Write a chain in which deterministic code validates what the model returned before anything downstream trusts it
- Use a cheap model for extraction and a stronger model for reasoning, in the same pipeline
- Localise a failure to a specific step instead of staring at one giant output
- Convert a model failure into a code guard so the same failure cannot reach the next step silently
- Estimate when a chain's extra latency and tokens are worth paying for, and when they are not
- Say, without hedging, why date maths, arithmetic, formatting, and lookups should not be model calls
- Recognise the task that is genuinely one step and resist decomposing it

## Specific topics to learn

### Why a narrow step fails less

- The set of plausible continuations at each step, and how prompt width expands it
- Why "do five things" invites the model to blur the boundaries between them
- The difference between a step that is narrow and a step that is merely short
- Why an explicit output contract per step is what makes the next step possible

### Code between the steps

- Validation: does the model's output satisfy the schema, the enum, the range?
- Repair: one bounded retry with the validation error fed back, and why it needs a cap
- Transformation: parsing, formatting, sorting, deduplicating, joining
- Computation: dates, durations, totals, unit conversion
- Lookup: mapping a name to an ID from a table you control

### Routing work to the right model

- Cheap, fast models for extraction, classification, and reformatting
- Stronger models for judgement, ambiguity resolution, and anything with a budget for a wrong answer
- Keeping the interface identical so a step's model can be swapped without rewriting the chain

### Knowing when not to chain

- Latency compounding across sequential calls
- Token cost of re-sending context at every step
- Tasks that are genuinely one step, and the cost of inventing steps that do not exist
- The failure mode where every step is correct and the system is still wrong

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Python 3 | Write the chain and the guards between steps | Free | https://www.python.org/downloads/ | Every task in this phase | Any scripting language you already know — the shape is identical |
| `requests` | Make the individual model calls the chain is built from | Free | https://requests.readthedocs.io/ | Tasks t01, t03 and t05 | Python's built-in `urllib.request` |
| Ollama | Run a local model so a six-step chain costs nothing to run a hundred times | Free, open source | https://ollama.com/ | Tasks t03, t05 and t07 | A provider free tier, if your machine cannot run a model |
| `jsonschema` (Python) | Validate a model's JSON against a real schema instead of hoping | Free, open source | https://github.com/python-jsonschema/jsonschema | Task t04 | Hand-written checks in plain Python with `isinstance` and key tests |
| Pydantic | Define the shape of each step's output once and get validation for free | Free, open source | https://docs.pydantic.dev/ | Task t04 | `dataclasses` plus your own validators |
| `dateutil` | Parse messy human date strings in code, not in a prompt | Free, open source | https://github.com/dateutil/dateutil | Task t05 | Python's standard `datetime.strptime` with a list of formats you enumerate |
| Python `zoneinfo` and `datetime` | Do every date computation deterministically, including timezone conversion | Free, standard library | https://docs.python.org/3/library/zoneinfo.html | Task t05 and the worked example | Any language's standard date library — the point is that it is code |
| `pytest` | Test the code steps without calling a model at all | Free, open source | https://docs.pytest.org/ | Task t06 | Plain `assert` statements in a script you run by hand |
| Google AI Studio | A free-tier endpoint to compare a cheap model step against a strong one | Free tier | https://aistudio.google.com/ | Task t07 | Local models via Ollama — two sizes of local model give the same comparison |
| OpenRouter | Reach several models through one compatible endpoint to A/B a single step | Freemium | https://openrouter.ai/models | Task t07 | Providers' own free tiers, or two local models of different sizes |
| VS Code | Edit the chain and step through it | Free, open source | https://code.visualstudio.com/ | Every task | Any editor you already have |

## Free/cheap resources

- **Anthropic — Chain complex prompts for stronger performance** — https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/chain-prompts
- **OpenAI — Prompt engineering guide (splitting complex tasks)** — https://platform.openai.com/docs/guides/prompt-engineering
- **Google — Prompting strategies, including decomposition** — https://ai.google.dev/gemini-api/docs/prompting-strategies
- **Least-to-Most Prompting (Zhou et al., 2022)** — https://arxiv.org/abs/2205.10625 — decomposition as an explicit two-stage method: decompose, then solve the subproblems in order.
- **Plan-and-Solve Prompting (Wang et al., 2023)** — https://arxiv.org/abs/2305.04091 — a related argument that planning first and executing second beats one undivided prompt.
- **ReAct: Synergizing Reasoning and Acting (Yao et al., 2022)** — https://arxiv.org/abs/2210.03629 — where chaining meets tool calls, and the boundary this phase stops at.
- **Python — `datetime` documentation** — https://docs.python.org/3/library/datetime.html — the module that replaces every date-maths prompt you will ever be tempted to write.
- **Python — `re` documentation** — https://docs.python.org/3/library/re.html — for the string work that should never have been a model call.
- **JSON Schema — understanding JSON Schema** — https://json-schema.org/understanding-json-schema — the vocabulary for the validation step between calls.
- **Pydantic — documentation** — https://docs.pydantic.dev/ — the shortest path from "the model should return this shape" to "and here is what happens when it does not".
- **pytest — getting started** — https://docs.pytest.org/en/stable/getting-started.html — how to prove your code steps are correct without spending a token.
- **Ollama — OpenAI compatibility layer** — https://github.com/ollama/ollama/blob/main/docs/openai.md — point a chain at a local model and run it a hundred times for free.

## Lesson: The chain is mostly not a prompt

### Part 1 — The problem with one big prompt

Start with a request a beginner writes and a beginner regrets:

> You are a helpful assistant. Read the email below and extract the meeting details, figure out what time that is in my timezone, decide whether it conflicts with anything on my calendar, add a reasonable duration if none is stated, write a calendar entry, list the action items with owners, assign due dates, and format everything as JSON.

That prompt is not badly written. It is well written — it is specific, it names the output format, it enumerates what is wanted. It will work, most of the time, on most emails. And that is exactly the problem, because the failures are the interesting part and the prompt gives you nothing to work with when they happen.

**What is actually happening when that prompt runs.** The model is producing a continuation, one token at a time, conditioned on everything before. At every position it holds a probability distribution over what comes next and picks from it. A prompt that specifies eight things creates a space of continuations in which all eight must be satisfied simultaneously. The model is not executing eight steps in order and checking its work; it is emitting text that looks like all eight steps were done. Nothing in the mechanism enforces that the JSON it writes is valid, that the timezone conversion it performed is arithmetically right, or that the action items it lists are the ones in the email rather than plausible-sounding ones.

So the failure modes are systematic, not random:

- **Arithmetic drift.** The model computes "two weeks from 12 March" and produces a date that is off by a day or two. It has no calculator; it has a pattern of date-like strings.
- **Boundary bleeding.** Asked for both a summary and a task list, it writes a summary that quietly becomes a task list halfway through.
- **Silent structural failure.** The JSON has a trailing comma, or a missing brace, or a field whose value is `"not specified"` when your parser expects an ISO timestamp — and the whole downstream system dies on step eight because of something that went wrong at step two.
- **Unlocalised error.** This is the big one. The output is wrong. You do not know which of the eight jobs went wrong. You edit the prompt — usually by adding another instruction — and run it again. Sometimes it gets better. You have learned nothing about *why*, so you cannot make it stay better.

That last point is the whole argument for this phase. **A single prompt is unobservable.** You cannot put a breakpoint in the middle of it, you cannot log the intermediate state, and you cannot reuse the part that worked while replacing the part that did not.

Now, before going further — that paragraph was not an argument that big prompts are always wrong. Part 8 is about when the single prompt wins, and the honest answer is "more often than the chaining literature implies". Hold that thought.

---

### Part 2 — The mechanism: narrowing the task narrows the failure space

Why does splitting help? Not because models "get confused by long instructions", which is a folk explanation. The real reason is about the distribution.

At each generated token the model assigns probability to possible next tokens. Accuracy at the end of a generation depends on that distribution being *concentrated* on the right answer. When you ask for one narrow thing, the prompt plus the format constraint plus the context leaves very few continuations that are both syntactically valid and semantically correct. When you ask for one narrow thing, wrong answers are usually *implausible* continuations.

Ask for eight things and the situation changes in three ways.

**The constraints interact.** "Extract the date" and "assume a duration if none is given" and "check for conflicts" are not independent. The duration you assume changes the conflict answer. In one prompt, the model has to hold all of that in a single stream of text, and a decision made early (a round duration of one hour) silently constrains a decision made later (does it conflict). Nothing forces consistency, and nothing flags inconsistency.

**Length compounds exposure.** Every token generated is a chance to go wrong. A 900-token JSON object has 900 opportunities for a slip; a 40-token extraction has 40. This is not a metaphor — it is the same mechanism that makes long generations drift away from an instruction given at the start.

**Nothing gates the next step.** In a single prompt, step 7 runs on whatever step 2 produced, correct or not. There is no place to say "stop, that date is not parseable".

Now add the second half of the mechanism, which is the part people skip. **Between two model calls you can put ordinary code.** That code can do four things a model cannot do reliably:

**Validate.** Check that the model's output satisfies a contract you wrote. Is it valid JSON? Does every field exist? Is `start_time` parseable as a timestamp? Is `priority` one of the three values you allow? Validation is exact, instant, free, and it turns a downstream corruption into an immediate, localised error.

**Compute.** Do the arithmetic. Add fourteen days. Convert `Asia/Manila` to `Asia/Tokyo`. Sum the line items. This is the rule that this phase repeats more than any other: **if the correct answer is determined by a rule, a lookup, or arithmetic, code produces it and the model must not be asked.** Not because models are bad at arithmetic in a vague way, but because a model produces the most plausible continuation of a string of digits, and plausibility is not correctness.

**Transform.** Reformat, sort, deduplicate, join, escape, truncate. Formatting a datetime as ISO 8601 is a one-line call and an unreliable generation.

**Fetch.** Look up the employee ID for a name, the customer record for an email address, the current exchange rate. A lookup against a table you control is a query. A lookup a model performs from memory is a guess with a confident tone, and it cannot be audited.

There is a fifth thing code does, and it is the one beginners always leave out: **it decides what happens next.** A model produces text; it does not choose the control flow of your program. "If the email proposes a new time, check the calendar; if it confirms an existing time, do nothing" is a branch, and a branch is an `if` statement. A single prompt cannot skip a stage, but a chain can, because you are the one writing the arrows.

**Put the two halves together and the architecture is:** *model, code, model, code*. The model converts unstructured meaning into structured meaning; the code enforces everything that has a right answer and decides what happens next. Each step's contract is explicit, so if the whole pipeline is wrong you know which step produced the wrong artifact.

One more thing about the shape of a step, because it is easy to get wrong while feeling right. A step should be narrow, and narrow is not the same as short. "Return the three most important sentences" is short and not narrow — it is a judgement with no contract. "Return every date-like string in this text, verbatim, in order of appearance, with its character offset, as a JSON array of objects with keys `text` and `offset`" is long and genuinely narrow: there is a fact of the matter about each answer, you can check it mechanically against the source, and two competent humans would produce nearly identical output. **Choose the width of a step by asking how many different answers would be defensible, not by counting the words in your instruction.** A long instruction that pins down one answer is easier for the model than a short instruction that admits twenty.

There is one more property that falls out of this and is worth naming separately, because it is where the money is.

**Each step can use a different model.** Extraction — "pull the fields out of this email" — is a task where a small, fast, cheap model is often as good as a large one, because the hard part is following a format, not reasoning. Judgement — "does this email actually mean the meeting is confirmed, or is it proposing it?" — is where the stronger model earns its price. A chain lets you put the cheap model where the work is mechanical and the expensive model where the work is genuinely hard. In a single prompt, you pay the expensive model for the mechanical parts too, because you cannot route inside one generation.

And the routing has a second benefit that has nothing to do with cost. When one step behaves badly, you swap *that step's* model and re-run the chain, holding everything else fixed. That is an experiment. Editing a giant prompt and re-running it is a guess.

---

### Part 3 — What this lets you predict

Here is what you should now be able to say before running anything.

**A chain with validation between steps fails loudly; a single prompt fails quietly.** Predict the symptom: if you add a schema check after step 2 and the run stops with "field `start_time` is not a valid ISO timestamp", that is the chain working. If instead the failure shows up at the end as an empty calendar entry with no error, that is the single-prompt failure mode, and you now know to look for a missing check rather than a bad model.

**Adding an instruction to a failing prompt has a characteristic shape of result.** It usually improves the specific case you tested and often makes some untested case worse, and you cannot tell from a single run. Whereas moving a deterministic subtask out of the prompt into code produces a change that is *permanent*, because you removed the possibility rather than discouraged it. Predict: after you move date arithmetic into code, no prompt edit you make can reintroduce a date-arithmetic error. That is a stronger statement than any prompt phrasing can give you.

**Errors concentrate in the steps that are actually hard.** Once you can see per-step output, you can predict which step will have the worst accuracy: the one with the most ambiguity in its input. That is usually not the step you assumed. People expect extraction to be the weak point; often extraction is near-perfect and the "decide which of these three tasks is most urgent" step is where the judgement calls go wrong. You can only discover this because the steps are separate.

**Latency and cost are additive and predictable.** A chain of five steps takes roughly the sum of five round trips, and re-sends whatever shared context each step needs. If one call is 1.5 seconds, five sequential calls are not 1.5 seconds — they are more than 5, plus retries. Predict this before you build it, and you will notice when a chain is a bad fit.

**A swapped model produces a bounded diff.** Change the extraction model from a large one to a small one, and only the extraction step's outputs change. Everything downstream of a *validated* step is stable, because validation rejected what it could not accept. Predict which outputs can move and which cannot; a chain gives you that answer in advance.

**A chain has two distinct failure classes, and you can tell them apart from the logs alone.** The first is a *step failure*: validation rejected the output, or the step returned something structurally valid but visibly wrong. The second is a *composition failure*: every step passed, every artifact looks reasonable, and the final answer is still wrong because the steps disagree at a seam — extraction said "thurs 19th", the calendar said the 19th was a Tuesday, and nobody put those two facts next to each other. Both are failures, but only the first is visible in a per-step pass/fail column. Predict which of your own chains is more exposed to the second, and the answer will usually be the one with the most steps whose contracts do not cross-check each other.

That second class is the honest limit of what chaining buys you, and it is worth being clear about now rather than discovering it later. Chaining makes failures *localisable*. It does not make them impossible, and it does not automatically make a system correct. The cross-check in the worked example below — verifying that the claimed weekday matches the resolved date — is exactly the kind of guard that catches composition failures, and it is the reason that check is written as an assertion in code rather than as an instruction in a prompt.

---

### Part 4 — The worked example: one messy email

Time to build the thing. Read the email.

```text
From: Marites Dela Cruz <marites@example.com>
To: Team
Subject: re: re: Q3 planning - MOVING IT (again sorry!!)

hi all,

so the wednesday thing is moving. jose can't do wed so we're looking at
thurs 19th instead, same bat time - 3pm-ish? i think we said 90 mins
last time but honestly let's say a bit longer, maybe 2 hours to be safe.

can you do the room booking? the usual one, but i'm not sure if it's free.

also - @jose can you send over the updated numbers BEFORE the meeting,
like 2 days before, and @ana the slide deck the day before please.

oh and i still owe people the catering decision. i'll do that this week.

thanks!!
m
```

A beginner writes one prompt. You are going to write four steps and two pieces of code. Here is the whole chain, and I will annotate the decisions after.

**Step 1 — extraction (cheap model, narrow job).**

```text
You extract scheduling facts from an email. You do not compute dates,
you do not convert timezones, you do not decide anything.

Return JSON only, matching this schema:
{
  "meeting_proposed": true | false,
  "weekday_mentioned": string | null,   // as written, e.g. "wednesday"
  "day_of_month": integer | null,       // as written, e.g. 19
  "month": string | null,               // as written, e.g. "thurs 19th" -> null
  "start_time_local": string | null,    // as written, e.g. "3pm-ish"
  "duration_hint": string | null,       // as written, e.g. "maybe 2 hours"
  "location_hint": string | null,
  "action_items": [
    { "assignee": string | null, "verbatim": string }
  ]
}

Rules: copy what the email says. If a field is not stated, use null.
Never infer a date. Never convert a time.

EMAIL:
<email>
```

Notice what the schema forbids. There is no `start_time` field in ISO format, because producing ISO requires deciding, and deciding is not extraction. There is no `due_date`, because computing a due date is arithmetic. The labels say `_hint` where the email is vague, and the instruction says to copy the vagueness rather than resolve it. **A step that is allowed to resolve ambiguity is a step you cannot test.**

The model's output, on this email, is something like:

```json
{
  "meeting_proposed": true,
  "weekday_mentioned": "thurs",
  "day_of_month": 19,
  "month": null,
  "start_time_local": "3pm-ish",
  "duration_hint": "maybe 2 hours",
  "location_hint": "the usual one",
  "action_items": [
    { "assignee": null, "verbatim": "room booking" },
    { "assignee": "jose", "verbatim": "send over the updated numbers before the meeting, like 2 days before" },
    { "assignee": "ana", "verbatim": "the slide deck the day before" },
    { "assignee": "marites", "verbatim": "catering decision this week" }
  ]
}
```

**Code between step 1 and step 2 — validation and normalisation.**

This runs with no model involved.

```python
import json
import re
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

REQUIRED = {
    "meeting_proposed": bool,
    "weekday_mentioned": (str, type(None)),
    "day_of_month": (int, type(None)),
    "start_time_local": (str, type(None)),
    "duration_hint": (str, type(None)),
    "location_hint": (str, type(None)),
}

def validate_extraction(raw_text: str) -> dict:
    """Turn the model's reply into a dict, or raise with a precise reason."""
    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"extraction was not valid JSON: {exc}") from exc

    for key, expected in REQUIRED.items():
        if key not in data:
            raise ValueError(f"extraction is missing required field {key!r}")
        if not isinstance(data[key], expected):
            raise ValueError(
                f"field {key!r} has type {type(data[key]).__name__}, "
                f"expected {expected}"
            )

    if not isinstance(data.get("action_items"), list):
        raise ValueError("action_items must be a list")

    for i, item in enumerate(data["action_items"]):
        if not isinstance(item, dict) or "verbatim" not in item:
            raise ValueError(f"action_items[{i}] has no 'verbatim' string")

    return data
```

Two things about that function deserve naming.

It **checks types against a declared contract**, and it raises with a message that names the offending field. That message is not just for you — Part 5 feeds it back to the model on a bounded retry.

And it **does not silently repair**. The temptation is to write `data.setdefault("day_of_month", None)` and carry on. Do not. A field that the model omitted and a field that the email did not state are different situations, and collapsing them destroys the information you need to diagnose the chain.

**Code between step 1 and step 2 — the arithmetic, in code.**

Now the part that this whole phase is really about. The email says "thurs 19th", "3pm-ish", and "maybe 2 hours". Resolving those into an actual timestamp is three deterministic operations and one judgement call, and the judgement call is small enough to be a rule.

```python
WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday",
            "friday", "saturday", "sunday"]

def resolve_start(data: dict, reference: datetime, tz_name: str) -> datetime:
    """Resolve the extracted hints into a concrete local start time.

    Deterministic: given the same extraction and the same reference date,
    this returns the same answer, always, with no model involved.
    """
    tz = ZoneInfo(tz_name)

    day = data["day_of_month"]
    if day is None:
        raise ValueError("no day of month in the extraction; cannot schedule")

    weekday_word = (data["weekday_mentioned"] or "").lower()
    weekday_word = re.sub(r"[^a-z]", "", weekday_word)

    # Pick the candidate month: the next occurrence of that day of month
    # on or after the reference date.
    year = reference.year
    month = reference.month
    if day < reference.day:
        month += 1
        if month == 13:
            month, year = 1, year + 1

    candidate = datetime(year, month, day, tzinfo=tz)

    # Verify the weekday that was claimed. This is the check a prompt
    # cannot give you: 19 March 2026 really is a Thursday, or it is not,
    # and python says so.
    if weekday_word:
        wanted = next(
            (i for i, name in enumerate(WEEKDAYS) if name.startswith(weekday_word)),
            None,
        )
        if wanted is None:
            raise ValueError(f"unrecognised weekday {weekday_word!r}")
        if candidate.weekday() != wanted:
            raise ValueError(
                f"email says {weekday_word} {day}, but {candidate.date()} "
                f"is a {WEEKDAYS[candidate.weekday()]}"
            )

    # "3pm-ish" -> 15:00. Parse with an explicit pattern; never ask a
    # model to turn a time string into a number.
    raw_time = data["start_time_local"] or ""
    match = re.search(r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", raw_time.lower())
    if not match:
        raise ValueError(f"cannot parse a start time from {raw_time!r}")
    hour = int(match.group(1))
    minute = int(match.group(2) or 0)
    meridiem = match.group(3)
    if meridiem == "pm" and hour != 12:
        hour += 12
    elif meridiem == "am" and hour == 12:
        hour = 0

    return candidate.replace(hour=hour, minute=minute)
```

Look at the third paragraph of that function. **It verifies the weekday claim.** The email says "thurs 19th". If the 19th of the relevant month is a Tuesday, the email is internally inconsistent — probably a typo, probably the wrong month — and this code catches it and says so, precisely. That is not a check you can ask a prompt to perform. It is a fact about the calendar, and the calendar is data.

Now duration. The email says "we said 90 mins last time but honestly let's say a bit longer, maybe 2 hours to be safe". Turning that into a number is a rule, not a judgement:

```python
def resolve_duration_minutes(data: dict, default_minutes: int = 60) -> int:
    hint = (data["duration_hint"] or "").lower()
    hours = re.search(r"(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b", hint)
    if hours:
        return int(float(hours.group(1)) * 60)
    minutes = re.search(r"(\d+)\s*(?:minutes?|mins?|m)\b", hint)
    if minutes:
        return int(minutes.group(1))
    if "longer" in hint:
        return 90
    return default_minutes
```

On this email it returns 120. On the next email it returns 60. Both are wrong sometimes, and that is fine — this is a policy choice you made explicit and can test, not an inference the model made invisibly. **This is the distinction that matters:** a rule you wrote and can change is different from a behaviour you cannot see.

**Step 2 — judgement (stronger model, narrow job).** Here is where the model genuinely belongs, and the job is deliberately small.

```text
You are given a meeting that has already been resolved into concrete
values, and a list of raw action-item sentences from the same email.

Your only job is to decide two things per action item:
  1. whether it is assigned to someone else or to the sender
  2. which of these buckets it falls into:
     before_meeting | after_meeting | unrelated_to_meeting

Do not invent due dates. Do not reword the items. Do not add items.

RESOLVED MEETING:
{ "start": "2026-03-19T15:00:00+08:00", "minutes": 120 }

RAW ACTION ITEMS:
{json.dumps(data["action_items"], indent=2)}

Return JSON only:
{ "classified": [ { "index": integer, "bucket": string } ] }
```

The model is not asked for a date. It is asked the question that has no deterministic answer: is "send over the updated numbers before the meeting" work that is *part of the meeting* or work that merely has to happen *before* it? That is a reading-comprehension judgement on ambiguous human language. There is no lookup table for it. **This is the test for whether a step deserves to be a model call: can you write a function that returns the right answer every time? If yes, write the function. If no, and only then, call a model.**

**Code between step 2 and the end — the due dates.**

The email gives relative deadlines: "2 days before", "the day before", "this week".

```python
def due_date(bucket: str, start: datetime, offset_days: int) -> datetime:
    """Every due date in this pipeline is arithmetic on a datetime object."""
    return start - timedelta(days=offset_days)

# The offsets are policy, written down and testable, not inferred.
OFFSETS = {
    "before_meeting": 2,
    "after_meeting": 0,
    "unrelated_to_meeting": 0,
}
```

Run this on 19 March 2026 with a start of 15:00 and the offsets above, and the due date for Jose's item is 17 March 2026. That answer is correct in every timezone, on every run, forever, at zero cost. **Ask a model for the same date and you will get the right answer most of the time — and the times it is wrong, it will be wrong with total confidence, and you will not know which times those are.**

**Code at the end — formatting.**

Finally the calendar event and the task list are *formatted*, not generated:

```python
def to_ical_utc(start_local: datetime, minutes: int) -> dict:
    end_local = start_local + timedelta(minutes=minutes)
    return {
        "DTSTART": start_local.astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
        "DTEND": end_local.astimezone(timezone.utc).strftime("%Y%m%dT%H%M%SZ"),
        "SUMMARY": "Q3 planning",
        "LOCATION": "the usual room",
    }
```

The timezone conversion happens here, in `astimezone`, using the IANA timezone database. It does not happen in a prompt. Predict what that buys you: **no prompt edit, no model upgrade, and no model swap can ever produce a wrong UTC offset in this pipeline again**, because no model is involved in producing it. The Philippines does not observe daylight saving, but your readers' calendars might, and `zoneinfo` knows the historical rules for every zone including the ones that changed their rules three times in the last twenty years.

**The shape of the finished chain.**

```text
email text
   |
   v
[ MODEL ]  extraction, cheap model, schema-constrained, copies not computes
   |
   v
[ CODE  ]  validate types and required fields; raise with a named field
   |
   v
[ CODE  ]  resolve weekday/day/time with a real calendar; verify consistency
   |
   v
[ CODE  ]  duration from an explicit, testable policy
   |
   v
[ MODEL ]  classification and ownership: the genuine judgement call
   |
   v
[ CODE  ]  due dates by timedelta; formatting to iCal; timezone conversion
   |
   v
structured event + task list
```

Two model calls, four code stages. The model does the two things that require reading meaning; everything with a right answer is code.

---

### Part 5 — Where it stops working

Everything above is true and none of it is free. Four boundaries.

**Boundary 1: the model step still fails, and you must handle it.** A validated step is not a correct step. The extraction schema above accepts `"day_of_month": 19` when the email meant the 19th of a different month, and no type check catches that. Validation catches *structural* failure; it does not catch *semantic* failure. So the chain needs a repair path, and the repair path needs a cap:

```python
def extract_with_repair(email_text: str, max_attempts: int = 2) -> dict:
    last_error = None
    for attempt in range(max_attempts):
        raw = call_model(build_extraction_prompt(email_text, last_error))
        try:
            return validate_extraction(raw)
        except ValueError as exc:
            # Feed the validator's own message back. It names the field,
            # which is more useful to the model than "try again".
            last_error = str(exc)
    raise RuntimeError(f"extraction failed after {max_attempts} attempts: {last_error}")
```

The cap matters more than the retry. A retry loop around a model call is a loop that can spend money without making progress; two attempts and then a hard failure into a human queue is a design decision, and it is the correct one. Note also what is *not* happening: the repair retry does not re-run steps 2 through 4. Because the steps are separate, a failed extraction costs one cheap call, not the whole pipeline.

**Boundary 2: latency is additive, and it compounds with retries.** Five sequential calls at 1.5 seconds each is 7.5 seconds before you add any prompt-processing time, any retry, and any network variance. For a batch job that is irrelevant. For an interactive interface it is fatal, and no amount of architectural elegance fixes it — the only fixes are fewer steps, parallel steps where the dependency graph allows, or streaming the early steps' results so the user sees progress. **The latency budget is a design input, not an implementation detail**, and if you write the chain first and measure later you will discover this at the worst possible moment.

**Boundary 3: cost is additive too, and context re-sending multiplies it.** Each step that needs the original email re-sends the original email. A five-step chain that passes the full input to every step pays for that input five times. The mitigations are real but partial: pass the extraction rather than the email, keep the shared prefix identical across steps so prompt caching can apply where the provider offers it, and route the mechanical steps to a cheap model. But the honest statement is that a chain costs more tokens than a single prompt covering the same work, and the justification has to be correctness or diagnosability rather than economy.

**Boundary 4, the one that matters most: some tasks are genuinely one step, and decomposing them makes the system worse.** Consider "rewrite this paragraph so it sounds less defensive". There is no intermediate artifact worth inspecting. There is no deterministic subtask. Splitting it into "identify the defensive phrases" then "rewrite them" adds a call, adds latency, adds a place for the two steps to disagree, and produces a *worse* result than asking once — because the rewrite step now works from a list of phrases rather than from the paragraph's whole meaning. You have decomposed the task into a shape the model was never confused about in the first place.

The warning sign is a step whose output nobody would ever look at except the next step, doing work that has no right answer. That is not a step; that is the model's own reasoning, and you have just made it worse by forcing it through a text bottleneck.

---

### Part 6 — The tradeoff, in a table

| Property | One big prompt | Chain of steps |
|---|---|---|
| Calls per task | 1 | 3–8 typically, more with retries |
| Latency | One round trip | Sum of round trips, plus retries |
| Token cost | Paid once | Paid per step; shared context re-sent unless you trim it |
| Debuggability | One artifact; every instruction is a suspect | Per-step artifacts; failure points at a step |
| Localisation of errors | None without ablation experiments | Immediate, if you log each step's input and output |
| Validation points | Only at the end, if at all | After every step |
| Deterministic subtasks | Attempted by the model, unreliably | Moved to code, correct by construction |
| Model routing | One model pays for everything | Cheap model for mechanical steps, strong for judgement |
| Partial reuse | The whole prompt is the unit | Steps are swappable independently |
| Failure blast radius | Any sub-task can corrupt the whole output | A failed step fails at its own boundary |
| Testability | Whole-task eval only | Code steps get unit tests with no model cost |
| Best when | The task is one skill, and latency or cost dominates | Sub-skills are distinct, or you must validate or branch |
| Worst when | Failures are frequent and you cannot localise them | The "steps" are not really separate and you invented them |

Read the last two rows together. They are the decision.

---

### Part 7 — How to decide, in order

When you are handed a task, ask these in sequence and stop at the first yes.

**1. Is the whole task one skill?** If a competent human would do it in one pass without writing anything down, it is one step. Do not decompose it. "Summarise this", "translate this", "rewrite this in a friendlier tone" — one prompt, measure it, move on.

**2. Can any part of it be answered by a rule, a lookup, or arithmetic?** If yes, that part is code, and it is code *regardless* of whether you chain the rest. This question is independent of chaining and you should ask it first, because it is where most of the correctness comes from. Dates, durations, totals, IDs, formatting, sorting, unit conversion, status codes, name-to-record lookups.

**3. Can you validate each stage's output against something exact?** If your task has natural checkpoints — a schema, an enum, a required field, a checksum, a cross-check against a table — those checkpoints are step boundaries. A boundary you cannot validate is a boundary you cannot benefit from.

**4. Does the task branch?** If step 3's result determines whether step 4 happens at all, you need steps, because a single prompt cannot skip a stage. "If the email proposes a new time, check the calendar; if it confirms an existing time, do not" is a branch, and branches live in code.

**5. Are there genuinely distinct sub-skills that need different models?** Extraction and judgement are different jobs and respond to different model sizes. If your task contains both, chaining lets you route each to the right one.

**6. Are the failures frequent, and can you not localise them?** This is the practical trigger. If a single prompt is right 95% of the time on your traffic, the chain is probably not worth its latency. If it is right 70% of the time and you cannot tell which of six things went wrong, chaining is what converts that 70% into something you can improve, because now you can see where the 30% lives.

Put the other way, do not chain when:

- **Latency dominates.** A user waiting on a response will notice a five-call chain.
- **Cost dominates and correctness is adequate.** Batch jobs with a tolerance for errors are the clearest case.
- **The task is genuinely one step.** Most rewriting, summarising, translating, and classifying tasks are.
- **You cannot validate the boundaries.** If the steps have no contract, chaining just gives you more places to be wrong, at more expense.
- **You are chaining to look sophisticated.** This is more common than anyone admits. A four-step chain that produces the same output as one good prompt, more slowly, is a regression with better architecture diagrams.

---

### Part 8 — What you should carry forward

The lesson of this phase is not "always chain". It is that a task is made of parts, some of which have right answers, and **the parts with right answers should not be given to a model.**

Prompt chaining is how you get the model out of the parts it should never have been in. Each boundary between steps is a place where you can check the work, replace the worker, or take the job away from the model entirely and hand it to code. The chain is not the goal; the chain is the instrument that makes the division of labour possible.

Which gives you the test to carry into every later phase, and it is one sentence: **before you write a prompt for a step, ask what a function would return.**

## Hands-on practice tasks

1. Take a task you have previously written as one large prompt and write out, in plain text, every distinct thing you asked for. Count them. That number is your starting point. <!-- id: prompt-06-prompt-chaining-t01 band: quick energy: low -->
2. Build the extraction step from Part 4 against your own model. Feed it five different messy emails and record exactly which fields it got wrong and how. <!-- id: prompt-06-prompt-chaining-t02 band: focused energy: normal -->
3. Add `validate_extraction` to your code. Run it against the fifty worst extractions you can manufacture — deliberately malformed JSON, missing fields, wrong types — and confirm each one is rejected with a message that names the offending field. <!-- id: prompt-06-prompt-chaining-t03 band: focused energy: high -->
4. Replace every date computation in your chain with `datetime` and `zoneinfo`. Then write a test that proves the weekday-consistency check catches "thurs 19th" when the 19th is not a Thursday. <!-- id: prompt-06-prompt-chaining-t04 band: deep energy: high -->
5. Implement the bounded repair retry. Prove it gives up after the cap by feeding it input that can never validate, and confirm the failure is loud rather than silent. <!-- id: prompt-06-prompt-chaining-t05 band: focused energy: normal -->
6. Write `pytest` tests for every code stage in your chain — the date resolution, the duration policy, the due-date offsets, the iCal formatting. These tests must run with no model and no network. <!-- id: prompt-06-prompt-chaining-t06 band: deep energy: normal -->
7. Run your extraction step against two models of very different size or price. Record per-field accuracy for both. Then run your judgement step against the same two and compare — the interesting result is usually that they differ by a lot on one step and barely at all on the other. <!-- id: prompt-06-prompt-chaining-t07 band: deep energy: high -->
8. Build the same task as a single prompt and as your chain. Run both on ten identical inputs. Record total tokens, total wall-clock time, and the number of correct outputs for each. <!-- id: prompt-06-prompt-chaining-t08 band: deep energy: high -->
9. Take one prompt you wrote that failed and you never diagnosed. Break it into steps now and find which step the failure lived in. Write down what the single prompt had been hiding from you. <!-- id: prompt-06-prompt-chaining-t09 band: deep energy: high -->
10. Deliberately over-decompose. Take a one-step task such as "rewrite this paragraph to be less defensive" and split it into three steps. Compare the result against the single prompt and write one paragraph on what the extra steps cost you. <!-- id: prompt-06-prompt-chaining-t10 band: focused energy: normal -->
11. Add per-step logging: the step name, the model, the input token count, the output token count, the latency, and whether validation passed. Run the chain ten times and read the log as if you were diagnosing someone else's failure. <!-- id: prompt-06-prompt-chaining-t11 band: focused energy: normal -->
12. Identify one step in your chain where you could replace the model with a lookup table or a regex, and do it. Measure the accuracy change honestly, including the cases where the table is worse than the model. <!-- id: prompt-06-prompt-chaining-t12 band: deep energy: high -->
13. Measure the latency of your chain at each step and draw the timeline. Then compute what the same task would cost at 1,000 requests a day, using your measured token counts. <!-- id: prompt-06-prompt-chaining-t13 band: focused energy: normal -->
14. Write your own decision rule — the sequence of questions you will ask before chaining a task — in under ten lines. Then test it against three tasks you have already built, and note where it would have given you the wrong answer. <!-- id: prompt-06-prompt-chaining-t14 band: ongoing energy: normal -->
15. Find one place in your chain where the correct behaviour is a rule you invented (a default duration, an offset, a bucket definition) and promote it to a named constant with a comment saying why that value. Then change it and watch only that behaviour change. <!-- id: prompt-06-prompt-chaining-t15 band: quick energy: low -->
16. Take the same email example and convert the extraction step to accept a JSON schema enforced by a provider's structured-output feature, if your provider offers one, and compare failure rates against your prompt-only version. <!-- id: prompt-06-prompt-chaining-t16 band: focused energy: normal -->

## Common Pitfalls

**Asking the model to do arithmetic.** This is the pitfall the phase exists to eliminate. Any date difference, duration, total, percentage, or unit conversion the model performs is a plausible string of digits rather than a computed value. If the answer is determined by a rule, write the rule.

**Asking the model for today's date or the current time.** It does not know, and it will produce a date that looks right. Inject the current time into the prompt as data, from your own clock, or keep it entirely in code.

**Letting the extraction step resolve ambiguity.** A schema field called `start_time_iso` forces the extraction step to make decisions it is not equipped to make and that you cannot test. Extract the hints verbatim; resolve them in code where you can see the rule.

**Validating only at the end.** A chain that checks its final output has one checkpoint and therefore no localisation. The value of chaining is that checkpoints sit *between* steps; a chain without them is a single prompt with extra latency.

**Silently repairing invalid model output.** `setdefault`, coercing a string to an int, dropping a malformed item — each of these converts a visible failure into an invisible one. Fail loudly at the boundary and decide at the top level whether to retry or fall back.

**Retrying without a cap.** A repair loop around a model call spends money. Two attempts then a hard failure is a design decision; unbounded retries are a bill.

**Assuming a validated step is a correct step.** Validation catches structure, not meaning. A schema-valid extraction can still be semantically wrong, and the semantics are exactly what a human has to review.

**Passing the full input to every step.** Sending the original email to five steps pays for it five times. Pass the smallest sufficient context, and keep any shared prefix byte-identical if your provider offers prompt caching.

**Inventing steps that are not there.** If nobody would ever look at a step's output except the next step, and the work has no right answer, you have chopped the model's own reasoning in half and made it worse.

**Measuring nothing.** A chain without per-step token, latency, and pass/fail logging is a chain you cannot tune. Add the logging on the first version, not the version after the bill.

**Forgetting that the model behind a step can change under you.** A floating model alias can be repointed, changing one step's behaviour without any change to your code. Pin what you can, and keep a small regression set you re-run after any model change — the finetuning and evaluation track builds this properly.

**Treating the chain as a permanent architecture.** Steps exist to be removed. Every time you find a step where the model agrees with a simple rule, that step is a candidate for deletion, and deleting it makes the system faster, cheaper, and more correct at the same time.

## Deliverable / proof of work

Write `portfolio/prompting/06-prompt-chaining.md` containing:

- **The task you decomposed**, stated in one paragraph, plus the single prompt you would previously have written for it.
- **Your step list**, with each step labelled `MODEL` or `CODE` and one sentence justifying the label. Every `CODE` label must say what rule, lookup, or arithmetic it performs.
- **Your working chain**, run end to end, with the actual output pasted in for at least three different inputs — including one input that makes the chain fail loudly, with the failure message.
- **The validator**, and evidence that it rejects at least five distinct classes of malformed model output with a message naming the offending field.
- **Your unit tests** for the code stages, with the output of a test run, and a note on how many tests run without touching a model.
- **A per-step measurement table**: step name, model used, input tokens, output tokens, latency, validation pass or fail, across at least ten runs.
- **A side-by-side comparison** of the chain against the single big prompt on the same ten inputs — total tokens, total time, and correct outputs for each.
- **A section titled "What I moved out of the model"** — every deterministic computation or lookup you removed from a prompt, and what replaced it.
- **A section titled "Where this chain should not be used"** — the conditions under which your own chain is the wrong choice, using the decision rule from Part 7.
- **Your decision rule**, in under ten lines, as a reusable checklist for your future self.

## Checklist

- [ ] I can explain why narrowing a prompt's task reduces the chance of a wrong answer <!-- id: prompt-06-prompt-chaining-c01 energy: normal -->
- [ ] I can explain why a single large prompt is hard to debug rather than merely hard to write <!-- id: prompt-06-prompt-chaining-c02 energy: normal -->
- [ ] I have split a real task of mine into labelled MODEL and CODE steps <!-- id: prompt-06-prompt-chaining-c03 energy: normal -->
- [ ] I can name four kinds of work that belong in code between steps <!-- id: prompt-06-prompt-chaining-c04 energy: low -->
- [ ] I never ask a model to perform date arithmetic, and I can say why <!-- id: prompt-06-prompt-chaining-c05 energy: normal -->
- [ ] I never ask a model for the current date or time without injecting it as data <!-- id: prompt-06-prompt-chaining-c06 energy: normal -->
- [ ] My extraction step copies what the input says instead of resolving it <!-- id: prompt-06-prompt-chaining-c07 energy: normal -->
- [ ] I have a validator that rejects malformed model output with a message naming the field <!-- id: prompt-06-prompt-chaining-c08 energy: high -->
- [ ] My validator raises on missing or wrong-typed fields instead of repairing them quietly <!-- id: prompt-06-prompt-chaining-c09 energy: normal -->
- [ ] I have a repair retry with a maximum attempt count and a loud failure when it gives up <!-- id: prompt-06-prompt-chaining-c10 energy: high -->
- [ ] I understand that validation catches structure and not meaning <!-- id: prompt-06-prompt-chaining-c11 energy: normal -->
- [ ] I have unit tests for the code stages that need no model and no network <!-- id: prompt-06-prompt-chaining-c12 energy: high -->
- [ ] I have compared a cheap model and a strong model on the same step and recorded per-step accuracy <!-- id: prompt-06-prompt-chaining-c13 energy: high -->
- [ ] I log tokens, latency, and validation outcome for every step <!-- id: prompt-06-prompt-chaining-c14 energy: normal -->
- [ ] I have measured my chain's total latency and total tokens, not estimated them <!-- id: prompt-06-prompt-chaining-c15 energy: normal -->
- [ ] I know that a chain costs more tokens and more time than a single prompt doing the same work <!-- id: prompt-06-prompt-chaining-c16 energy: normal -->
- [ ] I have built one deliberately over-decomposed version and seen it perform worse <!-- id: prompt-06-prompt-chaining-c17 energy: high -->
- [ ] I can state the conditions under which a single prompt is the right answer <!-- id: prompt-06-prompt-chaining-c18 energy: normal -->
- [ ] I have a written decision rule I will apply before chaining anything in future <!-- id: prompt-06-prompt-chaining-c19 energy: normal -->
- [ ] I can name at least one step in my own chain that could be deleted and replaced by a rule <!-- id: prompt-06-prompt-chaining-c20 energy: normal -->

## Quiz

### Q1. Your extraction prompt asks for a meeting start time as an ISO 8601 timestamp with an offset. The model returns a well-formed one, but it is one hour off. What is the most useful change? <!-- id: prompt-06-prompt-chaining-q01 energy: normal -->

- [ ] Add a worked example of a correct timestamp to the prompt so the model has a pattern to copy
- [x] Extract the raw time string and the timezone separately, and do the conversion in code with a real timezone library
- [ ] Raise the temperature to zero so the conversion becomes deterministic
- [ ] Ask the model to show its reasoning before producing the timestamp

**Why:** A wrong-but-well-formed timestamp is a semantic failure, which no amount of format instruction or few-shot example reliably prevents. The conversion from a local time and a timezone name to an instant is fully determined by the IANA timezone database, so the correct move is to take that computation away from the model. Temperature has no bearing on whether a computation is right, and reasoning traces do not add a calendar.

### Q2. A prompt does five things. Outputs are wrong about 30% of the time, and you cannot tell which of the five is failing. What does chaining actually give you? <!-- id: prompt-06-prompt-chaining-q02 energy: high -->

- [ ] Higher accuracy immediately, because models handle short prompts better
- [ ] Lower cost, because each call is smaller
- [x] Visibility — each step produces an artifact you can inspect, so the 30% localises to a step you can then fix or replace
- [ ] Guaranteed correctness, because every step can be validated

**Why:** Chaining does not fix anything by itself, and it usually costs more in tokens and latency. Its first and most important product is diagnosability: a failure that was smeared across one opaque output becomes an error at a named step. Once localised, the fix may be a code replacement, a better model for that step, or a prompt change — but you could not have chosen any of them before.

### Q3. Which of these should be a model call rather than a code step? <!-- id: prompt-06-prompt-chaining-q03 energy: normal -->

- [ ] Computing the due date fourteen days after a stated start date
- [ ] Converting a local start time to UTC
- [ ] Looking up an employee's ID from their email address in your directory
- [x] Deciding whether "let's say a bit longer, maybe 2 hours to be safe" settles the duration or merely proposes it

**Why:** The first three have exactly one correct answer, determined by arithmetic, the timezone database, and your own data respectively, so code produces them correctly every time and can be tested without a model. The fourth is a reading-comprehension judgement on ambiguous human language with no lookup table behind it. Ask the test question: could you write a function that returns the right answer every time? If yes, write the function.

### Q4. A chain of five steps each takes 1.2 seconds, and it is correct 60% of the time. What is the most important consequence? <!-- id: prompt-06-prompt-chaining-q04 energy: high -->

- [x] The chain's total latency is at least six seconds before retries, which may disqualify it for interactive use regardless of its accuracy
- [ ] The provider is throttling you, and rate limiting explains the errors
- [ ] Latency and accuracy trade off against each other, so the chain cannot be improved
- [ ] The correct fix is to merge the five steps into one larger prompt

**Why:** Sequential model calls add: five round trips is five times one round trip, plus prompt processing, plus any repair retries, plus network variance. That is a design input you must measure before building, not after. Accuracy and latency are separate axes — you can improve one without worsening the other, by replacing a failing step with code or a different model — but if the latency budget is blown, nothing else about the chain matters.

### Q5. Your validator rejects 8% of the extraction step's outputs. What should the chain do about that 8%? <!-- id: prompt-06-prompt-chaining-q05 energy: normal -->

- [ ] Coerce the malformed output into a valid shape so the pipeline continues
- [ ] Raise an exception that crashes the whole run
- [x] Retry the extraction once with the validator's own error message fed back, then fail loudly into a human queue if it still does not validate
- [ ] Discard the record silently and continue with the rest of the batch

**Why:** The validator's message names the offending field, which is far more useful to the model than a generic instruction to try again, so one bounded retry is worth its cost. But the retry needs a cap: a loop around a model call spends money, and a model that cannot satisfy a schema on attempt two usually will not on attempt nine. Silent coercion and silent discard both destroy the evidence you need to fix the extraction prompt, and an uncaught crash loses the rest of a good batch.

### Q6. Which statement about validation between steps is correct? <!-- id: prompt-06-prompt-chaining-q06 energy: normal -->

- [ ] A step that passes schema validation has produced the correct answer
- [ ] Validation is unnecessary if the model was given a JSON schema in the prompt
- [ ] Validation should be applied only to the chain's final output, to save complexity
- [x] Validation guarantees structure and not meaning, so a schema-valid output can still be semantically wrong

**Why:** A schema check confirms that the right keys exist with the right types. It cannot tell you that the extracted day of month refers to the month the sender meant, or that a task was assigned to the right person. Structural and semantic failure are different problems, and only the first is cheap to check in code — which is precisely why the second is where a human review or an evaluation set belongs.

### Q7. When is a single large prompt the better choice than a chain? <!-- id: prompt-06-prompt-chaining-q07 energy: normal -->

- [ ] When the task involves more than three distinct instructions
- [ ] When you want the most accurate possible result regardless of cost
- [ ] When the task takes a human more than a minute to do
- [x] When the task is genuinely one skill, latency or cost dominates, and the boundaries between steps have nothing exact to check against

**Why:** The number of instructions in a prompt is not the criterion — whether the instructions are separable sub-skills is. A chain pays for itself through validation and localisation; if there is nothing exact to validate at the boundaries, you have added calls, latency, and token cost in exchange for nothing. And when a single skill is involved, forcing a text bottleneck between two halves of one act of reasoning usually produces a worse answer than asking once.

### Q8. A step's output is only ever read by the next step, and nobody would ever want to inspect it. It has no single correct answer. What does that tell you? <!-- id: prompt-06-prompt-chaining-q08 energy: high -->

- [x] It is probably not a real step and you have split the model's own reasoning, which tends to make the result worse
- [ ] It is a well-designed step, because intermediate artifacts should be small
- [ ] It should be given to a stronger model so its output becomes reliable
- [ ] It should be merged with the following step's prompt, which achieves the same thing as removing it

**Why:** A genuine step boundary is a place where you can validate, branch, swap the worker, or hand the job to code. A boundary with none of those properties is a text bottleneck inserted into the middle of a single act of reasoning, adding a round trip and a chance for the two halves to disagree. Merging it back into the neighbouring prompt is not the same as deleting it, because the surrounding decomposition may still be wrong.

### Q9. Which of these is arithmetic that should never be given to a model? <!-- id: prompt-06-prompt-chaining-q09 energy: low -->

- [ ] Rewriting a rambling paragraph into three clear bullet points
- [x] Adding up the line items on an invoice and applying a discount percentage
- [ ] Classifying a support message as billing, technical, or account
- [ ] Turning a transcript into a list of decisions that were made

**Why:** A sum with a percentage applied has exactly one correct value, computable by a rule, and a model has no calculator — it produces the most plausible string of digits, which is right most of the time and confidently wrong the rest. The other three have no single correct answer determined by a rule, which is exactly the test for whether a step deserves a model call.

## You're ready to move on when...

You have taken a task you used to write as one prompt and built it as a chain, with real code sitting between the model calls. You can point at each boundary in that chain and say what it checks or computes, and you can show the validator rejecting malformed model output with a message that names the field. You have deleted at least one thing the model was doing and replaced it with a function — a date, a duration, a lookup, a format — and you can state plainly why that computation had no business being a generation. You have measured the chain's total latency and total tokens against the single-prompt version on the same inputs, so you know what you paid for the visibility. You have built one deliberately over-decomposed version and watched it do worse. And when you are handed a new task, you can run your decision rule out loud: is this one skill, is any part of it a rule, can I validate a boundary, does it branch — and then either chain it or leave it alone. If you cannot yet say when *not* to chain, you have not finished the phase.

## Free vs Paid

### What's free is enough

Every mechanic in this phase is free, and one of them is free in a way that matters more here than anywhere else in the track: a chain is run many times. You will run your chain on ten inputs, then twenty, then re-run it after every change. That is not a workload a metered API is kind to, and it is exactly the workload a local model handles without complaint.

Run the whole phase against a local model served by Ollama through its OpenAI-compatible endpoint. The extraction step in the worked example is a small, format-following job that a modest local model does well, and the classification step is small enough to run locally too. You will get real per-step token counts, real latency, and real validation failures, and you will pay nothing for the hundred runs it takes to tune them. The free tiers offered by hosted providers cover the same ground if your machine cannot run a model, though daily caps will make you ration the long comparison runs in tasks t08 and t13.

The comparison in task t07 — cheap model versus strong model on the same step — is also free if you run two local models of different sizes. You lose the ability to compare against a frontier model, but you keep the thing you are actually learning: that the difference between models is not uniform across steps, and that each step can be routed independently.

### What a paid tier adds

**Access to a genuinely stronger reasoning model for the judgement step.** This is the real one. Classification, ambiguity resolution, and anything where the input is human language at its messiest is where the gap between a small local model and a frontier model is widest. Since a chain lets you apply the strong model to one step instead of all of them, the cost of using it is far lower than paying for it on every call — which is arguably the single most practical financial argument for chaining.

**Prompt caching, which changes the arithmetic on shared context.** Several providers cache a repeated prefix and charge substantially less for the cached portion. A chain that re-sends the same instruction block to every step is the natural beneficiary, though the exact discount, the minimum prefix length, and the cache lifetime are provider-specific and change. **Volatile, dated: as of 2026-09, caching terms, minimum lengths, and pricing differ substantially between providers and are revised without much notice — read the current pricing and caching documentation rather than relying on any summary, including this one.**

**Higher rate limits, which matter for the comparison tasks.** Running ten inputs through a chain of five steps is fifty calls; doing that for a chain and a single-prompt baseline on the same ten inputs is more. Free-tier daily caps make that tedious rather than impossible.

**Structured output enforcement.** Several providers can constrain generation to a JSON schema at the decoding level rather than by instruction. That reduces the malformed-JSON class of failure substantially, though it does nothing about semantic errors — the schema constrains shape, not meaning. Check whether your provider offers it and what it does and does not guarantee; the feature and its guarantees vary.

### When it's worth paying

**Not to learn this.** Every mechanism here — the narrow step, the validator, the arithmetic in code, the bounded retry, the per-step logging, the comparison against a single prompt — runs identically on a local model for zero pesos. Do all of it free, including the over-decomposition task, which requires running the same task several times and is the task you would most regret paying for.

The honest threshold is when your chain works and you want to know how much better the judgement step would be on a stronger model. That is a specific, bounded experiment: one step, a fixed input set, two models, and a comparison you can look at. Fund that experiment rather than a general account balance. And when you do start paying, note that a chain is precisely the architecture that lets a small budget go further — you are buying the expensive model only for the steps where it earns its price, and leaving the mechanical work on the cheap one. That routing decision is the practical payoff of this phase, and it is the reason the cost track will keep asking you which step a token was actually spent on.
