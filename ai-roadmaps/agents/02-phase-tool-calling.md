---
id: agent-02-tool-calling
track: agents
phase: 2
order: 20
title: Tool Calling Mechanics
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal]
deliverable: portfolio/agents/02-tool-calling.md
exit_criteria: >
  You can define tool schemas a model can actually use, implement the execution
  layer yourself, and validate arguments in code so that a malformed call becomes
  a recoverable error rather than a crash or a silent wrong answer.
---

# Phase 2 — Tool Calling Mechanics

## Goal of this phase

Phase 1 established that an agent is a loop with tools and a stopping condition. This phase is about the tools — specifically, about the part that surprises people the first time they build one.

Here is the surprise: **the model never executes anything.** When a model "calls a tool", it produces a structured message containing a name and some JSON arguments. That is all. Nothing happens in the world until **your code** reads that message, validates it, runs something, and sends the result back. The model's role is to *propose*; yours is to *decide and act*.

That distinction sounds pedantic until you see what follows from it. Because your code is the executor, it is also the **validation layer**, the **security boundary**, and the **error-handling layer** — and each of those has a specific technique attached. By the end of this phase you will have written a tool layer that accepts a model's proposal, rejects malformed arguments with a message the model can act on, returns results concise enough not to destroy the context, and never runs anything the model could not justify.

## Estimated time

**1 week** at 1–2 hours a day, 5 days. Roughly 7–9 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Part 1: what actually happens when a model "calls a tool" | 1.5h |
| 2 | Part 2: schemas and descriptions as prompt engineering | 2h |
| 3 | Part 3: the execution layer, validation, and error feedback | 2h |
| 4 | Part 4: result shaping, and the context-cost of tool output | 1.5h |
| 5 | Part 5: safety boundaries, idempotency, parallel calls | 1.5h |

If you only have three hours this week, do tasks 2, 5, 7 and 10. Those produce a working tool layer, a validation experiment, a result-shaping comparison and a safety review — which is the phase.

Most of the work is in the execution layer, and it is ordinary software engineering once the mental model is right. The difficulty is almost entirely in getting that model right: people who believe the model executes the tool write fundamentally different and much worse code than people who know it does not.

## Skills you'll gain

- Describe the exact message flow of a tool call, and say what executes the action.
- Write tool schemas whose descriptions function as effective prompt engineering.
- Validate tool arguments in code and return errors the model can recover from.
- Shape tool results so they inform without consuming the context window.
- Choose narrow, safe tools over broad, dangerous ones, and explain the trade.
- Handle parallel tool calls and make execution idempotent where retries are possible.
- Recognise the failure modes of too many tools, vague descriptions and silent bad arguments.
- State where tool design stops helping: when the capability itself is missing.

## Specific topics to learn

### The message flow

- You declare tools: names, descriptions, parameter schemas.
- The model emits a tool call: a name and JSON arguments.
- **Your code executes it** — the model has no ability to act.
- You return the result as a message, and the loop continues.
- Why this makes your code the security boundary, not the model's instructions.

### Schemas and descriptions

- JSON Schema for parameters: types, enums, required fields, descriptions.
- **The description is prompt engineering** — it is how the model decides when and how to call.
- Naming: a tool's name is part of its prompt.
- Enums over free strings, where the set is known.
- Why fewer tools improve selection, and how many is too many.
- Required versus optional parameters, and how optionality invites omission.

### The execution layer

- A registry mapping names to functions — never dynamic dispatch on model output.
- **Validate arguments in code**: type, range, required, enum membership.
- Return **actionable errors** into the loop rather than raising and dying.
- Distinguish a validation failure from an execution failure.
- Timeouts and resource limits per tool.
- Logging every call and result, because the trajectory is the evidence.

### Result shaping

- The context cost of tool output: a large dump can destroy the window.
- Returning the fields that matter, not the whole response object.
- Truncation with an explicit marker, so the model knows it was truncated.
- Summarising large results, and when that loses the detail the model needed.
- Return formats: what reads well to a model versus what reads well to a human.

### Safety and robustness

- Narrow tools over broad ones: `read_invoice(id)` beats `run_sql(query)`.
- Why a shell tool is a last resort and what to do instead.
- Idempotency: retries may execute twice, so writes need idempotency keys.
- Parallel tool calls, and checking for conflicting side effects.
- Secrets: never in tool output, never in the schema.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| A local model via Ollama | Test tool selection and argument quality without a meter | Free/open-source | https://ollama.com/ | Tasks t03, t04 — measure selection accuracy with 3 tools, then with 12 | A free hosted tier; check whether tool calling is supported at your tier |
| Python (standard library) | The execution layer is a dict of functions and a validator | Free/open-source | https://docs.python.org/3/ | Tasks t05, t06 — registry, validation, and actionable errors | Any language with a JSON parser |
| `jsonschema` | Validate model-supplied arguments against your declared schema | Free/open-source | https://python-jsonschema.readthedocs.io/ | Task t06 — reject malformed arguments before they reach your code | Hand-written checks, which are fine for simple schemas |
| `requests` | Call the provider API directly so the tool-call message is visible | Free/open-source | https://requests.readthedocs.io/ | Task t02 — print the raw tool-call object before any framework hides it | `urllib.request` |
| SQLite | A real tool with a real risk surface, for the narrow-versus-broad exercise | Free/open-source | https://sqlite.org/ | Task t09 — compare a parameterised query tool against a raw SQL tool | Any local database |
| `pytest` | Test your validator against the malformed inputs a model produces | Free/open-source | https://docs.pytest.org/ | Task t08 — assert every bad-argument case returns a usable error | Any test runner |

## Free/cheap resources

- **Yao et al. — ReAct (arXiv:2210.03629)** — https://arxiv.org/abs/2210.03629
- **Model Context Protocol — tool and resource schemas** — https://modelcontextprotocol.io/
- **JSON Schema — the specification your parameter schemas follow** — https://json-schema.org/
- **Anthropic — Building effective agents** — https://www.anthropic.com/engineering/building-effective-agents
- **Anthropic — Writing tools for agents** — https://www.anthropic.com/engineering/writing-tools-for-agents
- **OpenAI — Function calling guide** — https://platform.openai.com/docs/guides/function-calling

## Lesson: Your Code Executes, Not the Model

### Part 1 — What actually happens in a tool call

Start with the message flow, because every design decision in this phase follows from it.

A tool call involves four steps, and the model participates in exactly **one** of them.

```
1. YOU declare tools        → names, descriptions, parameter schemas
2. THE MODEL emits a call   → {"name": "get_invoice", "arguments": {"id": "INV-4471"}}
3. YOUR CODE executes it    → you look up the function, validate, run it
4. YOU return the result    → appended to the conversation; the loop continues
```

**Step 3 is the one people get wrong.** When a model produces `{"name": "get_invoice", "arguments": {...}}`, it has produced *text that looks like a function call*. It has not invoked anything. It has no mechanism to invoke anything. It emitted a token sequence conforming to a schema you supplied, and it is now waiting for you to do something about it.

This is not a technicality about how a particular API is implemented. It is the structural reason tool-using systems are safe to build at all: **the model proposes, your code disposes.** Every guarantee you want about what your agent can do — what it can read, what it can change, how much it can spend — has to be implemented in step 3, because step 2 has no enforcement power whatsoever.

> A useful analogy is a restaurant order pad. The waiter writes "steak, rare" and hands it to the kitchen. The pad did not cook anything, and it cannot — but it also cannot be blamed for what the kitchen does with it. If the kitchen will cook anything written on any pad, the problem is the kitchen. **Your execution layer is the kitchen**, and this phase is about making it refuse orders it should not fill.

**Three consequences, and each one becomes a section of this phase.**

**Your code is the validation layer.** The model will produce arguments that are malformed, out of range, or plausible but wrong. If you pass them straight to a function, you get a crash at best and a bad write at worst. Validation is not defensive paranoia; it is a required component, because the producer of the arguments is a probabilistic text generator.

**Your code is the security boundary.** If a tool exists and is described, the model may call it — including as a result of instructions embedded in content it read, which Phase 6 covers. Nothing in the model's instructions constrains what your executor will do. The constraint must be in the executor.

**Your code is the error-handling layer.** A failed tool call should not kill the loop. It should produce a message the model can read and respond to — try a different argument, a different tool, or give up gracefully.

**Where this mental model stops working.** "The model executes nothing" is true of the *mechanism* and can be misleading about *causation*. In a working agent, the model's proposals drive everything that happens; your executor is powerful but not autonomous, and treating it as the sole locus of control leads to under-thinking the model's role in choosing *which* actions occur. The accurate statement is that the model decides **what to attempt** and your code decides **what to permit**. Both are load-bearing, and Phase 6 is about the design of the second.

### Part 2 — Descriptions are prompt engineering

If the model chooses tools and arguments based on text you wrote, then that text is a prompt. This is the single highest-leverage idea in the phase, and it reframes what looks like configuration as authoring.

**A tool description has three jobs**, and a good one does all three explicitly:

1. **Say what it does**, concretely, in the domain's vocabulary.
2. **Say when to use it** — and, more valuably, when *not* to. "Use for single-invoice lookups; for a customer's full history use `list_invoices`."
3. **Say what it returns**, so the model can plan around the shape of the result.

```python
# Weak: the model must guess when this applies and what it returns.
{"name": "search", "description": "Search for things."}

# Strong: scope, exclusions, and result shape are all stated.
{
  "name": "search_invoices",
  "description": (
    "Find invoices by customer name or invoice id. Returns up to 20 matching "
    "invoices with id, date, amount and status. Use this for lookups by name or "
    "id; use list_overdue_invoices for anything about payment status across "
    "customers. Does not search line items."
  ),
}
```

The second version is longer and worth every token. It tells the model the boundary against a neighbouring tool, which is the information that prevents the most common selection error: picking a plausible tool that is *nearly* right.

**Naming is part of the prompt.** `get_invoice` and `fetch_invoice` and `invoice_lookup` all mean the same thing to you and different things to a model that must choose between them. Use one consistent verb vocabulary — `get_` for reads, `create_` for writes, `list_` for collections — and the model's selection improves without a word of description changing.

**Prefer enums to free strings.** If a parameter can only take a few values, declare them:

```python
# The model can invent "urgent" here, and you must handle it.
{"status": {"type": "string", "description": "The invoice status"}}

# The model cannot invent a value outside the set.
{"status": {"type": "string", "enum": ["draft", "sent", "paid", "void"]}}
```

This is the cheapest reliability win available in tool design. Every constraint you express in the schema is a constraint you do not have to validate and a class of malformed call that simply cannot occur.

**Fewer tools is better, and the effect is strong.** Tool selection degrades as the candidate set grows, because the model is choosing among increasingly similar descriptions. The practical consequence is that **consolidating** beats **proliferating**: one `search` tool with a `type` parameter usually outperforms five near-identical search tools, because there is no selection to get wrong.

There is no universal number, and any specific figure you read — including in this lesson — is a rule of thumb rather than a measurement from your system. The reliable method is Phase 7's: build a small suite of realistic requests, measure selection accuracy at 3, 6 and 12 tools, and let your own numbers decide. The direction is consistent; the threshold is yours.

**Where this stops working.** Descriptions cannot fix a tool that should not exist, and a very long description is itself a context cost paid on every single call. If your tool list plus descriptions runs to thousands of tokens, you are spending real money to explain your API on every iteration. At that point the correct move is to **split the tool set across agents** — Phase 4's context isolation applied to tools — rather than to keep writing more prose.

### Part 3 — The execution layer

Now the code. Four requirements, in order of how often people get them wrong.

**Requirement 1: dispatch through an explicit registry, never dynamically.**

```python
TOOLS = {"get_invoice": get_invoice, "list_invoices": list_invoices}

def execute(call):
    fn = TOOLS.get(call.name)
    if fn is None:
        return f"Error: no tool named {call.name!r}. Available: {list(TOOLS)}"
    return fn(**validated_args)
```

The registry is a whitelist. The model's output selects from it and nothing else — no `getattr`, no `eval`, no `importlib` on a model-supplied string. This matters more than it looks: a dynamic dispatch layer converts "the model chose an unexpected tool" from a handled error into arbitrary code execution.

**Requirement 2: validate arguments in code, against the declared schema.**

```python
def validate(name, args):
    schema = SCHEMAS[name]
    errors = jsonschema_errors(args, schema)   # types, required, enums
    errors += semantic_checks(name, args)      # ranges, existence, cross-field
    return errors
```

Two layers, and the second is the one people skip. Schema validation catches structural problems — a string where a number belongs, a missing required field. **Semantic validation** catches arguments that are structurally valid and operationally wrong: a date range where the end precedes the start, an id that matches no record, a quantity of negative five. The model can produce all of these, and they are exactly the cases that reach your database.

**Requirement 3: return errors as messages, not exceptions.**

This is the highest-value technique in the phase, and it is nearly free.

```python
# Bad: the loop dies and the user sees a traceback.
amount = int(args["amount"])          # ValueError: invalid literal

# Good: the model gets a usable correction and tries again.
if not isinstance(args.get("amount"), int) or args["amount"] <= 0:
    return ("Error: 'amount' must be a positive integer number of centavos. "
            f"Received: {args.get('amount')!r}. Example: 12500 for 125.00 PHP.")
```

The difference is not cosmetic. **A model that receives an actionable error can often fix its own call on the next iteration.** A model that receives a stack trace, or an empty failure, usually repeats the same mistake, because nothing told it what was wrong. This single technique converts a large class of loop failures into recoverable ones, and it costs a well-worded string.

Three properties make an error message actionable: **what was wrong**, **what was expected**, and **a worked example**. The example matters more than it seems — it demonstrates the format concretely, in a way a description of the format does not.

**Requirement 4: measure and log every call.**

Log the tool name, the validated arguments, the outcome, the duration, and the size of the result. Phase 7's evaluation depends on this, and Phase 6's approval gates read from it. The trajectory is the only evidence you will have about what an agent actually did.

**Where this stops working.** Validation cannot make a bad tool good. If a tool's semantics are ambiguous — "delete old records", where "old" is undefined — no amount of argument checking resolves which records the model intended to delete. That is a **tool design** problem, and the fix is to make the tool's parameters carry the ambiguity explicitly: `delete_records(older_than=<date>)` rather than a bare `delete_old_records()`. Validation protects the boundary; it does not define it.

### Part 4 — Result shaping, and the context bill

Tool results go back into the conversation, which means **every tool result is a permanent context cost for the rest of the run.** This is easy to forget because the cost is invisible at the point of return and grows with every iteration.

Consider what a careless tool does. It returns the full API response: nested objects, metadata, pagination envelopes, timestamps in three formats, and a hundred fields where four matter. A single such call can add tens of thousands of tokens, and an agent that makes eight calls has filled its window with administrative noise — which, per Phase 5 of Prompting, degrades the model's use of everything else in the context.

**Shape results deliberately, on four axes.**

**Return the fields that matter.** A `get_invoice` tool should return id, date, amount, status and customer — not the ORM object. The judgment is: what would a competent human need in order to act on this?

**Truncate explicitly, and say so.** If a result is long, cut it and mark the cut:

```
[showing 20 of 347 results; refine the query to narrow the set]
```

A silent truncation is worse than a large result, because the model reasons confidently from an incomplete picture without knowing it is incomplete. The marker converts a silent failure into information the model can act on — by narrowing the query, which is exactly what you want it to do.

**Summarise carefully, because summary loses detail.** Summarising a hundred records into "mostly billing complaints" is cheap and usually right. But if the model then needs the specific fifth record, the summary has destroyed it. The rule: summarise **collections**, return **individual records in full**. Do not summarise the one thing the model asked for.

**Write for the model, not for a human.** Verbose JSON with deep nesting is harder to use than a compact table of the same information. Field names should be self-describing. Consistent key names across tools (`invoice_id` everywhere, not `id` here and `invoiceId` there) let the model transfer what it learned from one result to the next.

**Measure it rather than guessing.** Log the token size of every tool result, and after a run look at the distribution. If one tool dominates, that is your optimisation target — and Phase 5 of Cost's logging discipline is the instrument.

**Where this stops working.** Result shaping loses information, and you cannot always know in advance which information the model needed. A tool that returns a lean summary makes the common case fast and the uncommon case impossible. The honest engineering answer is often **two tools**: a `search` that returns compact summaries, and a `get` that returns one full record — which is the same retrieve-then-expand shape Phases 2 and 4 of RAG established for documents, applied here to API results.

### Part 5 — Safety, idempotency and parallelism

Three topics that are small individually and each capable of causing a serious incident.

**Narrow tools beat broad tools, and the difference is not subtle.**

```python
# Broad: the model composes the query, and can reach anything.
{"name": "run_sql", "arguments": {"query": "string"}}

# Narrow: the surface is one parameter, validated in code.
{"name": "get_overdue_invoices",
 "arguments": {"customer_id": "string", "as_of": "date"}}
```

The broad tool is more flexible and hands the model authority you probably did not intend to delegate — including, in the SQL case, reading every table your connection can reach and, depending on the driver, writing. The narrow tool cannot do anything except what it is for.

This is a genuine trade rather than a free win: narrow tools multiply in number, and Part 2 established that many tools degrade selection. The resolution is usually **a small set of parameterised narrow tools** rather than either extreme — one `get_invoices(customer_id, status, since)` covering several lookup cases with validated parameters, instead of a raw query interface or five single-purpose tools.

**A shell tool is the last resort**, and deserves its own paragraph because it is the most common shortcut and the most dangerous. A `run_shell(command)` tool is maximally flexible and means your agent can do anything the process can do: read any file, exfiltrate secrets, install software, delete anything writable. If you genuinely need it, contain it — Phase 6 covers process isolation, filesystem scoping and network egress — and treat the containment as the primary control rather than the tool description. **Prefer building the narrow tool instead**, which takes twenty minutes and removes the entire class of risk.

**Idempotency, because retries double-execute.** Agents retry. Networks fail, timeouts fire, and a loop that receives no result may reasonably try again. If the tool was a read, nothing is lost. If it was a write, you may have created the record twice.

The standard remedy is an **idempotency key**: the caller generates a unique key per intended operation, the tool records which keys it has seen, and a repeated call with the same key returns the original result rather than re-executing. The important design consequence is that the key must be generated **before** the first attempt and reused on retries — a key generated per attempt provides no protection at all.

**Parallel tool calls, and the conflict check.** Modern APIs may return several tool calls in one response, which is a real efficiency win for independent reads. The rule to apply before parallelising: **do two of these actions interact?** Parallel reads of different invoices are safe. A read and a delete of the same record are not, because the outcome depends on which lands first. When in doubt, serialise — the latency cost is small and the debugging cost of a race is not.

**Where this stops working.** Safety by tool design reduces the attack surface but does not eliminate it. A narrow, well-validated, idempotent tool can still be called with the wrong arguments for a legitimate-looking reason, and it can still be called because a document the agent read contained instructions — Phase 6's indirect prompt injection. Tool design is one layer of defence among several, and the layer that actually stops a dangerous action is the human gate, which is why it gets its own phase.

## Hands-on practice tasks

1. Write out the four-step tool-call message flow in your own words, then print the raw tool-call object from a real API call before any framework processes it. Confirm with your own eyes that the model produced a message and nothing more. <!-- id: agent-02-tool-calling-t01 band: quick energy: low -->
2. Build three tools with deliberately vague one-line descriptions and three with descriptions that state purpose, exclusions and return shape. Run the same twenty requests against both sets and compare selection accuracy. <!-- id: agent-02-tool-calling-t02 band: deep energy: high -->
3. Measure selection accuracy with 3 tools, then 6, then 12 related tools. Report the trend in your own numbers rather than accepting a rule of thumb. <!-- id: agent-02-tool-calling-t03 band: focused energy: high -->
4. Add enum constraints to every parameter with a known value set, remove all other validation for those parameters, and verify the malformed calls you previously had to handle can no longer occur. <!-- id: agent-02-tool-calling-t04 band: focused energy: normal -->
5. Build the execution layer: an explicit registry, schema validation, and semantic validation for ranges and cross-field consistency. <!-- id: agent-02-tool-calling-t05 band: deep energy: high -->
6. Return actionable errors for five different malformed calls — wrong type, missing required, out of range, unknown enum value, nonexistent id — each naming what was wrong, what was expected, and a worked example. Measure how often the model corrects itself on the next iteration. <!-- id: agent-02-tool-calling-t06 band: deep energy: high -->
7. Log the token size of every tool result across a real run. Identify the worst offender and reshape it to return only the fields that matter, then re-measure. <!-- id: agent-02-tool-calling-t07 band: focused energy: high -->
8. Write tests for your validator covering every malformed shape you have observed a model produce. The suite should fail if a bad argument ever reaches your function. <!-- id: agent-02-tool-calling-t08 band: focused energy: normal -->
9. Implement the same capability twice: as a raw query tool and as a narrow parameterised tool. Write down what the broad version can reach that the narrow one cannot — this is your attack surface difference. <!-- id: agent-02-tool-calling-t09 band: deep energy: high -->
10. Add an idempotency key to one write tool, then deliberately retry the same operation twice and show that only one effect occurred. Test also that a per-attempt key fails to protect you. <!-- id: agent-02-tool-calling-t10 band: focused energy: high -->
11. Construct a malformed-call corpus: twenty arguments a model plausibly produces that your code must reject. Run it as a suite and report your pass rate. <!-- id: agent-02-tool-calling-t11 band: focused energy: normal -->
12. Find one tool you have built that is wider than it needs to be. Replace it with the narrow version and note what you had to add to cover the legitimate cases. <!-- id: agent-02-tool-calling-t12 band: focused energy: normal -->
13. Write your tool-design checklist: naming convention, description template, enum policy, validation layers, result shape, error format. Keep it for every tool you add from now on. <!-- id: agent-02-tool-calling-t13 band: ongoing energy: normal -->

## Common Pitfalls

**Believing the model executes the tool.** Everything downstream of this misunderstanding is wrong: you skip validation because "the model wouldn't send that", you put security in the prompt because "the model knows not to", and you leave errors unhandled because "the call succeeds or it doesn't". The model proposes; your code disposes.

**Writing weak tool descriptions.** A one-line description makes the model guess when the tool applies and what it returns, and the errors show up as wrong-tool selection and malformed arguments that look like model failures and are authoring failures. State purpose, exclusions and return shape.

**Letting the tool list grow.** Selection degrades as near-identical tools accumulate. Consolidating three similar tools into one parameterised tool is usually a reliability improvement, not just a tidiness one.

**Validating structurally and not semantically.** Schema checks catch a string where a number belongs. They do not catch an end date before a start date, a negative quantity, or an id that matches nothing — and those are the ones that reach your data.

**Raising exceptions instead of returning actionable errors.** A traceback tells the model nothing it can use, so it repeats the same call and burns iterations. An error naming what was wrong, what was expected and a concrete example frequently allows self-correction on the next step.

**Returning the raw API response.** Every tool result is a permanent context cost for the rest of the run, and a full response object with pagination metadata and a hundred fields where four matter can fill a window in a handful of calls. Shape results deliberately and log their token size.

**Truncating silently.** A model that receives a partial list without being told reasons confidently from an incomplete picture. Marking the truncation converts a silent failure into a signal the model can act on by narrowing the query.

**Offering a broad tool where a narrow one would do.** A raw query or shell interface hands the model authority you did not intend to delegate, and the flexibility is rarely used. A parameterised narrow tool takes twenty minutes to write and removes an entire class of risk.

**Forgetting idempotency on write tools.** Agents retry, and a retried write without an idempotency key creates the record twice. The key must be generated before the first attempt and reused on retries — a per-attempt key protects nothing.

**Parallelising calls whose effects interact.** Independent reads parallelise safely; a read and a write of the same record do not, because the outcome depends on ordering. Serialise when in doubt.

## Deliverable / proof of work

Write `portfolio/agents/02-tool-calling.md` containing:

- **The message flow, verified** — the four steps, plus the raw tool-call object you printed from a real call, showing that the model produced a message and your code performed the action.
- **The description experiment** — your two tool sets, the twenty requests, and the selection accuracy for each. This is the phase's core measurement.
- **The tool count curve** — selection accuracy at 3, 6 and 12 tools, in your own numbers, with the consolidation decision you drew from it.
- **The execution layer** — your registry, both validation layers, and the error format with a real example of a model recovering after receiving one.
- **The malformed-call corpus** — twenty plausible bad arguments and your rejection rate, kept as a suite.
- **The result-shaping comparison** — token size before and after reshaping your worst tool, and the before/after effect on a full run.
- **The safety review** — your broad-versus-narrow comparison with the reach difference stated, one idempotency key demonstrated protecting a retried write, and any tool you decided to narrow.
- **Your tool-design checklist** — the rules you will apply to every tool you add from here.

## Checklist

- [ ] I can state the four-step message flow and identify which step actually executes the action <!-- id: agent-02-tool-calling-c01 energy: normal -->
- [ ] I write descriptions that state purpose, exclusions and return shape <!-- id: agent-02-tool-calling-c02 energy: normal -->
- [ ] I have measured selection accuracy with weak descriptions against strong ones <!-- id: agent-02-tool-calling-c03 energy: high -->
- [ ] I have measured how selection changes as the tool count grows, in my own numbers <!-- id: agent-02-tool-calling-c04 energy: high -->
- [ ] I use enums for constrained parameters so malformed values cannot occur <!-- id: agent-02-tool-calling-c05 energy: normal -->
- [ ] I dispatch through an explicit registry and never dynamically on model output <!-- id: agent-02-tool-calling-c06 energy: high -->
- [ ] I validate both structurally and semantically before executing <!-- id: agent-02-tool-calling-c07 energy: high -->
- [ ] I return actionable errors and have observed a model self-correct from one <!-- id: agent-02-tool-calling-c08 energy: high -->
- [ ] I shape tool results and know the token cost of my worst tool <!-- id: agent-02-tool-calling-c09 energy: normal -->
- [ ] I mark truncation explicitly rather than truncating silently <!-- id: agent-02-tool-calling-c10 energy: normal -->
- [ ] I prefer narrow parameterised tools over broad ones and can state the reach difference <!-- id: agent-02-tool-calling-c11 energy: high -->
- [ ] My write tools are idempotent and I have demonstrated a retry producing one effect <!-- id: agent-02-tool-calling-c12 energy: high -->

## Quiz

### Q1. A model emits a tool call with name `delete_file` and arguments `{"path": "/etc/hosts"}`. What has actually happened at this moment? <!-- id: agent-02-tool-calling-q01 energy: normal -->

- [ ] The file has been deleted, and the model is reporting it
- [x] The model has produced a structured message proposing an action; nothing has executed until your code reads, validates and runs it
- [ ] The provider has queued the deletion and your code confirms it
- [ ] The model has deleted the file within its own sandbox

**Why:** The model's entire contribution is a token sequence conforming to the schema you declared, and it has no mechanism to act on the world. This is the structural reason tool-using systems can be made safe: your execution layer decides what actually happens, which means validation, permissions and scoping all belong there. Believing otherwise leads directly to skipping validation on the grounds that the model would not propose something dangerous — which is exactly the proposal above.

### Q2. Which of these makes a tool description effective? <!-- id: agent-02-tool-calling-q02 energy: normal -->

- [ ] Keeping it as short as possible to save context
- [ ] Listing the implementation details so the model understands the code
- [x] Stating what it does, when to use it and when not to, and what it returns
- [ ] Matching the wording of the user's likely request as closely as possible

**Why:** The description is a prompt, and its three jobs are scope, boundaries and result shape. The exclusion clause is the highest-value part because adjacent tools with overlapping descriptions are the main cause of wrong-tool selection, and only the description can disambiguate them. Extreme brevity makes the model guess; implementation details are irrelevant to selection; and mirroring user phrasing optimises for matching rather than for correct decisions.

### Q3. Why prefer enums over free-form strings for constrained parameters? <!-- id: agent-02-tool-calling-q03 energy: normal -->

- [ ] Because enums reduce the token cost of the schema
- [ ] Because models cannot read string parameters reliably
- [x] Because a declared value set makes an entire class of malformed call impossible, rather than something you must validate and handle
- [ ] Because enums allow the tool to run faster

**Why:** Every constraint expressed in the schema is a constraint you no longer have to enforce in code and a failure that cannot occur at all — which is strictly better than detecting and recovering from it. Token cost and execution speed are unaffected in any meaningful way, and models handle free-form strings perfectly well; the problem is that they can also invent values, which an enum removes as a possibility.

### Q4. A tool returns `ValueError: invalid literal for int()` when the model sends `{"amount": "twelve"}`. What is the better design? <!-- id: agent-02-tool-calling-q04 energy: high -->

- [ ] Catch the exception, log it, and end the loop so the user can retry
- [ ] Coerce the string to a number and continue, defaulting to zero on failure
- [ ] Add the type to the schema and trust the model to comply
- [x] Validate before executing and return an actionable message naming what was wrong, what was expected, and a worked example, so the model can correct itself

**Why:** An actionable error turns a loop failure into a recoverable one, and models frequently fix their own call on the next iteration when told precisely what was expected — which is why this is the highest-value technique in the phase. Ending the loop discards the work and the model's ability to recover. Coercing to zero silently produces a wrong amount, which is worse than an error. Schema types help and are necessary, but they are a declaration the model may still violate, so they complement validation rather than replacing it.

### Q5. Why does returning a raw API response from a tool cause problems? <!-- id: agent-02-tool-calling-q05 energy: high -->

- [ ] Because models cannot parse nested JSON
- [ ] Because the provider charges extra for large tool results
- [ ] Because it exposes internal implementation details to the user
- [x] Because every tool result becomes a permanent context cost for the rest of the run, so a hundred-field response can fill the window across a handful of calls

**Why:** Tool results accumulate in the conversation, so the cost is not paid once but carried through every subsequent iteration — and a context padded with administrative noise degrades the model's use of everything in it, which is the mechanism Prompting Phase 5 described. Models parse nested JSON perfectly well; the issue is volume, not structure. Provider pricing depends on tokens rather than on tool results specifically, which is the same cost expressed differently.

### Q6. A tool truncates a list of 347 invoices to 20 without any indication. Why is this worse than returning all 347? <!-- id: agent-02-tool-calling-q06 energy: high -->

- [x] The model reasons confidently from an incomplete picture without knowing it is incomplete, whereas an explicit marker lets it act by narrowing the query
- [ ] Because truncation loses data that might be needed later
- [ ] Because the model will request the same tool again indefinitely
- [ ] Because silent truncation violates the tool description contract

**Why:** The failure is epistemic rather than informational: a model that knows it received 20 of 347 can respond correctly by refining its query, and a model that believes it received everything will report a total that is wrong. The marker converts a silent wrong answer into a signal the agent can act on, which is the same principle as the honest-blocker reporting that Phase 7 evaluates. Losing data is a real cost but a known one, and an unmarked truncation is worse precisely because it is unknown.

### Q7. Why is `run_sql(query)` a worse tool design than `get_overdue_invoices(customer_id, as_of)`? <!-- id: agent-02-tool-calling-q07 energy: high -->

- [ ] Because raw SQL is slower to execute than a prepared statement
- [x] The broad tool hands the model authority you did not intend to delegate — it can reach anything the connection can reach — while the narrow tool's surface is one validated parameter
- [ ] Because the model cannot write correct SQL
- [ ] Because the narrow tool returns more accurate results

**Why:** The difference is reach, not correctness, and it is the central safety argument for narrow tools. A raw query interface lets the model read every table the connection can access and, depending on the driver, write — authority you probably never intended to grant, and which can be reached not only by a badly-phrased user request but by instructions embedded in content the agent read. Models write SQL well, which is precisely why the broad tool is dangerous rather than useless.

### Q8. An agent retries a write tool after a timeout and the record is created twice. What would have prevented this? <!-- id: agent-02-tool-calling-q08 energy: normal -->

- [ ] A longer timeout, so the first attempt completes
- [ ] A higher step cap, so the agent has more room
- [ ] Validating the arguments before execution
- [x] An idempotency key generated before the first attempt and reused on the retry, so the tool recognises a repeat and returns the original result

**Why:** Retries are normal agent behaviour, so the protection has to be part of the tool's contract rather than something you hope does not happen. The key detail is that the key must exist before the first attempt: a key generated per attempt looks different each time and therefore protects nothing, which is why task 10 asks you to demonstrate both the working and the failing case. Validation prevents bad arguments, not duplicate execution, and neither timeout nor step-cap changes address the underlying non-idempotency.

### Q9. When is it safe to execute several tool calls from one response in parallel? <!-- id: agent-02-tool-calling-q09 energy: normal -->

- [x] When the actions are independent — parallel reads of different records are safe, while a read and a write of the same record produce an outcome that depends on ordering
- [ ] Whenever the provider returns them in a single response
- [ ] Always, since each tool call is independent by definition
- [ ] Only when the tools are read-only, without exception

**Why:** The test is whether two actions interact, not whether they arrived together. A response containing several calls is a formatting opportunity, not a guarantee about their semantics, and the outcome of a read alongside a write of the same record depends on which lands first — which is a race condition with a debugging cost far exceeding the latency saved. Restricting to read-only tools is a safe approximation rather than the rule, since independent writes to unrelated records parallelise fine.

### Q10. What is the phase's central claim about where control lives in a tool-using system? <!-- id: agent-02-tool-calling-q10 energy: low -->

- [ ] The model decides what happens and your code records it
- [ ] Control is shared, so both the model and your code enforce policy
- [x] The model decides what to attempt and your code decides what to permit — so validation, security and error handling all live in the executor
- [ ] The provider enforces policy between the model and your tools

**Why:** Both halves are load-bearing, and getting either wrong is costly. Treating the model as the executor leads to unvalidated arguments, permissions expressed in prompts, and unhandled errors. Treating your executor as the sole locus of control under-thinks the model's role in choosing which actions occur, which is where Phase 6's approval design and Phase 7's failure taxonomy do their work. Policy in a prompt is a preference, not a control — the same argument Phase 6 of RAG made about access control.

## You're ready to move on when...

You have printed a raw tool-call object from a real call and can explain, from that evidence, that the model produced a message and your code performed the action. You can state the four-step flow without notes and identify which step enforces what.

You have measured something rather than accepting a rule: selection accuracy with weak descriptions against strong ones, and the same accuracy as your tool count grew. You have drawn at least one consolidation decision from that data. Every constrained parameter in your schemas uses an enum, and every parameter is validated both structurally and semantically before execution.

You return actionable errors, and you have watched a model recover from one — with the self-correction rate recorded. You know the token cost of your worst tool and have reshaped it. Your dispatch is an explicit registry, your write tools are idempotent with a demonstrated retry producing exactly one effect, and you can state the reach difference between the broadest tool you considered and the narrow one you built.

## Free vs Paid

### What's free is enough

The whole phase. Tool calling is an API feature, not a premium one, and everything this phase asks you to build is ordinary Python.

A local model runs the description experiment, the tool-count curve, the self-correction measurement and the malformed-call corpus — all of which need **many repetitions** to produce a rate rather than an anecdote, which is exactly the workload Phase 7 of Cost argued belongs on a local model. The registry is a dict, validation is `jsonschema` plus your own checks, the tests are `pytest`, and the demonstrations are a SQLite file and a shell. Logging is a function call. The specs — JSON Schema, the MCP documentation, the provider function-calling guides — are free pages.

**One honest caveat about the free path here, and it matters.** Tool-calling reliability varies substantially between models, and small local models are noticeably weaker at producing well-formed arguments and choosing correctly among similar tools. That is a limitation of your *test subject*, not of the phase: the techniques you are learning — descriptions as prompts, enums, validation, actionable errors, result shaping — exist precisely because models get this wrong, and a weaker model makes the failures easier to observe. A learner testing on a small model will see the problems more clearly than one testing on a frontier model, which is an advantage for understanding and a disadvantage for building something that works unattended.

**And note what the errors are for.** The actionable-error technique is most valuable exactly when the model is weakest, because a weak model given a precise correction often recovers, while a weak model given a stack trace repeats itself. This is the phase where a zero-budget learner can build something genuinely usable with a local model, provided the validation layer is good.

### What a paid tier adds

Three things, and the first is the one that changes what is possible.

**Higher tool-calling reliability.** This is the real gain — better-formed arguments, correct selection among similar tools, and fewer malformed calls, which together mean your loop completes more tasks and your validation layer fires less often. It is a genuine capability difference rather than a convenience, and Phase 7's evaluation is how you would measure it on your own suite rather than assuming it.

**Longer, more complex tool-use chains.** Tasks requiring many sequential tool calls with dependencies between them are where frontier models separate from small ones, because each step's reliability compounds — Phase 1's arithmetic — and the absolute level of *p* decides whether a long chain is viable at all.

**Provider-side tool infrastructure.** Some providers offer hosted tool execution, built-in connectors, or managed retrieval tools that reduce the code you write. These buy convenience rather than capability, and every one of them is reproducible with the execution layer you built in this phase plus a budget.

**What money does not buy** is the design work. The description quality, the enum decisions, the validation layers, the error format, the result shaping and the narrow-versus-broad call are all authoring and engineering judgements, and a frontier model behind a vague description with an unvalidated executor will fail in exactly the ways this phase documents — more gracefully, and at a higher price.

**Volatile, dated: as of 2026-09, which models support tool calling reliably, how many tools they handle well, and what those calls cost all change on the order of months. Measure selection accuracy on your own suite rather than trusting any figure, including any in this lesson.**

### When it's worth paying

**Not for this phase.** Every task runs locally, and the deliverables are measurements, a validation layer and a design checklist.

The threshold is specific: **when your loop is failing because the model cannot produce usable calls, and you have already fixed the design.** That ordering matters. If selection is poor because your descriptions are vague, or arguments are malformed because your schemas are loose, a better model masks the problem without fixing it — and you will carry the weak design into every tool you add. The test is whether you have measured selection accuracy on a suite and can say the remaining failures are capability rather than authoring. If you can, one paid comparison against your own suite is a decision-changing experiment in Phase 7 of Cost's sense: it tells you how much of your failure rate money would remove. If you cannot, the cheaper fix is still on your side of the ledger.
