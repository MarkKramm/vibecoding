---
id: agent-07-mcp-and-evaluation
track: agents
phase: 7
order: 70
title: MCP and Evaluating Agents
duration: 2 weeks
duration_weeks: 2
energy_mix: [high, normal]
deliverable: portfolio/agents/07-mcp-and-evaluation.md
exit_criteria: >
  You can expose your tools through MCP so they are reusable, and you can measure
  an agent's reliability with pass^k over repeated runs, a failure taxonomy built
  from traces, and success verified in code rather than self-reported.
---

# Phase 7 — MCP and Evaluating Agents

## Goal of this phase

Two topics that belong together, because they are the two things that turn an agent from a demo into something you can defend.

**MCP** is a standard, and the important word is *standard*. It is not a model, a framework, or a capability. It is an agreed interface for connecting AI applications to external systems — tools, data sources and prompts — so that a server you write works with any client that speaks the protocol, and a client you write can use any server. That is genuinely useful, and it is also **not a capability upgrade**: an MCP server is the same tool code you already wrote, exposed through an agreed shape.

**Evaluation** is the half that matters more, and it is where this track lands. Phase 1 said loops amplify error. Phase 3 said reflection needs a reliable failure signal. Phase 6 said containment constrains capability but not correctness. This phase closes the loop: **how do you actually know whether your agent works?**

The answer is not "it seemed fine when I tried it." It is `pass^k` over repeated runs, a failure taxonomy built from the traces Phase 3 taught you to keep, and — the single most important habit in this phase — **checking success in code rather than trusting the agent's report.** Phase 4's demonstration showed why: a confident, honest, wrong summary is the normal case, not the exception.

By the end you will have an MCP server exposing your tools, and an evaluation suite that tells you a reliability number you can defend, a taxonomy of how your agent fails, and a checkable definition of success.

## Estimated time

**2 weeks** at 1–2 hours a day, 5 days a week. Roughly 14–18 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Part 1: what MCP is, and what it is not | 2h |
| 2 | Part 2: building an MCP server | 2h |
| 3 | Part 3: clients, and why the standard matters | 1.5h |
| 4 | Part 4: why pass@1 is the wrong metric for agents | 2h |
| 5 | Part 5: building the evaluation suite | 2h |
| 6 | Part 6: the failure taxonomy | 2h |
| 7 | Part 7: checking success by code | 2h |
| 8 | Part 8: evaluating the whole system, then the deliverable | 2h |

If you only have four hours this week, do tasks 4, 8, 10 and 12. Those produce the MCP server, the pass^k measurement, the failure taxonomy and the coded success check — which is the phase.

This phase is longer than the others in the track because it is where the track's claims get tested. Budget for running your evaluation suite many times; that repetition is the point.

## Skills you'll gain

- Explain what MCP standardises and what it does not do for you.
- Build an MCP server that exposes tools, and connect a client to it.
- Distinguish `pass@k` from `pass^k` and say which you need.
- Measure reliability over repeated runs rather than single attempts.
- Build an evaluation suite with a fixed task set and coded success checks.
- Verify success in code rather than accepting the agent's self-report.
- Build a failure taxonomy by classifying traces rather than guessing.
- Test with impossible tasks to detect fabrication.
- Evaluate cost and latency alongside correctness.
- State what your evaluation does not cover, and why that matters.

## Specific topics to learn

### MCP

- An open standard for connecting AI applications to external systems.
- **Versioned** — the specification has dated revisions.
- Clients and servers; a server exposes tools, resources, prompts.
- Transports: local (stdio) and remote.
- What it standardises: the interface, not the tools' quality.
- What it does not do: no capability upgrade, no safety, no evaluation.
- Building a server: define tools, handle calls, return results.
- Phase 2's rules still apply — descriptions, validation, result shaping.
- Why reusability is the payoff: one server, many clients.

### Why single-run testing fails

- `pass@k`: at least one of *k* attempts succeeds.
- `pass^k`: **all** *k* attempts succeed — the reliability metric.
- Why agent work needs the second: a product must work every time.
- Non-determinism: the same task takes different paths (Phase 1).
- Measuring variance across runs, not assuming it away.
- Sample size: how many runs before a number means anything.
- Reporting a reliability number as a range, not a point.

### The evaluation suite

- A **fixed task set**, versioned, so numbers are comparable.
- Coded success checks — a test, a state assertion, a schema validation.
- A held-out set, so you are not tuning on the test.
- Cost and latency per task, not just pass or fail.
- Running it after every change, because agents regress silently.
- The impossible-task test: does it fabricate or report failure?
- Phase 7 of RAG's harness discipline, applied to agents.

### The failure taxonomy

- Classify traces, do not guess at causes.
- Candidate categories: wrong tool, malformed arguments, lost context,
  loop exceeded, tool error unrecovered, fabricated result, gave up early.
- Counting categories tells you where to spend effort.
- **Localise before fixing** — the RAG Phase 6 diagnostic habit.
- Reading traces: the only way to see why, not just that.

### Checking success by code

- The agent's "done" is a **claim**, not a verification (Phases 1, 3).
- Coded checks: tests, assertions, schema validation, state comparison.
- Differential checks: compare before and after state.
- Rubric judges where code cannot check, with Phase 5 of RAG's bias caveats.
- Why self-assessment is near-worthless (sycophancy, arXiv:2310.13548).
- Sampling vs exhaustive checking, and what each costs.

### What evaluation does not cover

- Coverage: your task set is not the world.
- Distribution shift: real inputs differ from your suite.
- The gap between benchmark and production.
- Honest reporting: a number with its conditions attached.
- When to stop measuring and ship.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| MCP SDK (Python or TypeScript) | Build a server exposing your tools | Free/open-source | https://modelcontextprotocol.io/docs/sdk | Tasks t04, t05 — the server and a client connection | The protocol is documented; a minimal server is writable by hand |
| MCP Inspector | Verify your server's tools are discoverable and callable | Free/open-source | https://modelcontextprotocol.io/docs/tools/debugging | Task t06 — inspect the server before wiring an agent to it | Calling the server from your own client script |
| A local model via Ollama | Run the suite many times without a meter — essential for pass^k | Free/open-source | https://ollama.com/ | Tasks t08, t09 — repeated runs and variance measurement | A free hosted tier; check whether your repetition budget fits |
| `pytest` | Coded success checks, and the suite runner | Free/open-source | https://docs.pytest.org/ | Task t10 — assert on the resulting state, not on the agent's claim | Any test runner returning non-zero on failure |
| SQLite | Store every run so the taxonomy comes from data | Free/open-source | https://sqlite.org/ | Task t11 — one row per run: task, pass, steps, tool calls, cost, duration | JSONL |
| `jsonschema` | Validate the agent's structured output automatically | Free/open-source | https://python-jsonschema.readthedocs.io/ | Task t12 — a coded check that needs no judge | Hand-written assertions |

## Free/cheap resources

- **Model Context Protocol — documentation and specification** — https://modelcontextprotocol.io/
- **MCP — Architecture** — https://modelcontextprotocol.io/docs/learn/architecture
- **MCP — Building servers** — https://modelcontextprotocol.io/docs/develop/build-server
- **Debenedetti et al. — AgentDojo: A Dynamic Environment to Evaluate Attacks and Defenses for LLM Agents (arXiv:2406.13352)** — https://arxiv.org/abs/2406.13352
- **Liu et al. — AgentBench: Evaluating LLMs as Agents (arXiv:2308.03688)** — https://arxiv.org/abs/2308.03688
- **Sharma et al. — Towards Understanding Sycophancy in Language Models (arXiv:2310.13548)** — https://arxiv.org/abs/2310.13548

## Lesson: Standardise the Interface, Then Measure the Reliability

### Part 1 — What MCP actually is

MCP is an **open-source standard for connecting AI applications to external systems** — data sources, tools and workflows. The official documentation's own analogy is a USB-C port: a standardised connector, so that any device works with any port.

The analogy is a good one and it repays being pushed on, because it tells you precisely what is standardised and what is not. **USB-C standardises the connector, not the device.** A USB-C hard drive and a USB-C lamp have nothing in common beyond the plug, and neither is improved by the port's existence. Similarly, MCP standardises how a client discovers and calls tools on a server. It says nothing about whether those tools are well designed, safe, or useful.

**What MCP gives you, concretely:**

- **A server** exposes capabilities — tools, resources, prompts — in an agreed shape.
- **A client** discovers them and calls them, without bespoke integration code.
- **One server, many clients.** Write your invoice tools once; use them from any MCP-speaking application.
- **One client, many servers.** Your agent gains a whole ecosystem without writing an adapter per service.

**What MCP does not give you**, and this list is more important than the one above:

| MCP does not | Because |
|---|---|
| Make your tools better | It standardises the interface, not the design (Phase 2 still applies in full) |
| Provide any safety | Phase 6's gates and containment are unaffected |
| Evaluate anything | This phase's second half is entirely separate |
| Upgrade capability | It is the same tool code, in an agreed shape |
| Remove the need to read specs | The protocol is **versioned** and has changed between revisions |

**That last row deserves emphasis.** MCP is a versioned specification, and the versions are not cosmetic. As of 2026-09 the documentation carries revisions including `2024-11-05` (deprecated), `2025-06-18`, `2025-11-25` (stateful, superseded) and `2026-07-28` (**the current protocol version**). Knowing that a protocol is versioned is worth less than knowing *what changed* — so here is the difference that matters.

**`2025-11-25` is stateful. `2026-07-28` is stateless, and that is a rewrite rather than an iteration.**

| Concern | `2025-11-25` (stateful) | `2026-07-28` (stateless) |
| --- | --- | --- |
| Handshake | `initialize` + `notifications/initialized` | none — context travels in `_meta` on every request |
| Discovery | learned from the `initialize` result | a callable `server/discover` method |
| Sessions | `Mcp-Session-Id`, pinned by the server | none; `DELETE /mcp` is gone |
| Server→client requests | SSE-based (elicitation, sampling, roots) | Multi Round-Trip Requests (MRTR) |
| Long-lived stream | `GET /mcp` (SSE) | `subscriptions/listen` |
| Tasks | experimental, in core | an official extension with its own lifecycle |
| `roots` / `sampling` / `logging` | core | deprecated |

**The one shift that drives all the others: the protocol became stateless.** Sessions are gone, the handshake is gone, and every request is self-contained. That is why the rest of the table changes — and it is why a tutorial written against one revision can quietly mislead you about the other.

**Why this matters to you concretely.** In the stateful revision, a tool that needs input mid-call — an elicitation, an LLM sampling request, a `roots/list` — sends a server-initiated request over the session's SSE channel and waits. With no session to hold paused state, the stateless revision replaces that with **MRTR**: the call returns an "input required" result carrying an opaque `requestState`, the client answers, and the call resumes. The state has to be persisted somewhere by *you*, because the protocol no longer holds it.

**And the operational payoff is real:** stateless requests mean a load balancer can plain round-robin. No sticky sessions, no shared session store — each request stands alone. If you have ever wondered why a protocol would remove its own handshake, that is the answer.

**The curriculum's volatility rule applies at the protocol level here.** Check the current specification rather than any tutorial, including this table, because a standard that is actively developing is exactly where stale instructions cost the most time. Confirm two things before you build: **which revision your SDK targets**, and **which revision the server you are calling speaks**. A server pinned to one revision and a client expecting another is a class of bug that produces confusing transport errors rather than a clear "wrong version" message. Protocol version negotiation exists precisely because both parties can be right and still not understand each other.

**Where MCP stops helping.** For a single agent calling three tools you wrote yourself, MCP is overhead: you have added a protocol, a server process and a discovery step to replace a function call. Its value appears when tools are **shared** — across agents, across projects, across a team, or with clients you did not write. Phase 1's leftmost-position rule applies here as everywhere: adopt the standard when the reusability it buys exceeds the indirection it costs.

### Part 2 — Building a server, with Phase 2's rules intact

An MCP server is a program that declares tools and handles calls. The mechanics are protocol-specific and the documentation covers them; what matters here is that **nothing you learned in Phase 2 stops applying.**

```python
# Sketch — the shape, not the full protocol details.
# Consult the current MCP SDK docs for the specifics of your version.

@server.tool()
def get_invoice(invoice_id: str) -> dict:
    """Find one invoice by its id.

    Returns id, date, amount (in centavos), status and customer_id.
    Use this for a single known invoice; use search_invoices to look up
    by customer name. Does not search line items.
    """
    # 1. Validate — structurally and semantically (Phase 2).
    if not re.fullmatch(r"INV-\d{4}", invoice_id):
        return error(
            "'invoice_id' must match INV- followed by 4 digits. "
            f"Received: {invoice_id!r}. Example: INV-4471."
        )
    # 2. Execute through the registry.
    row = db.get_invoice(invoice_id)
    if row is None:
        return error(f"No invoice with id {invoice_id!r}.")
    # 3. Shape the result — the fields that matter, not the row (Phase 2).
    return {"id": row.id, "date": row.date, "amount_centavos": row.amount,
            "currency": "PHP", "status": row.status,
            "customer_id": row.customer_id}
```

Look at what that function demonstrates, because each point is a prior phase:

- **The description states purpose, exclusions and return shape** — Phase 2's three jobs, unchanged.
- **Validation happens in code** before anything executes — Phase 2's executor principle.
- **The error is actionable**, naming what was wrong, what was expected and a worked example — Phase 2's highest-value technique.
- **The result is shaped**, carrying the fields that matter rather than the database row — Phase 2's context-cost discipline.
- **The credential never appears** — `db` holds it in the server process, not the model's context — Phase 6's secrets rule.

**And one thing changes.** Because a server may be used by clients you do not control, the *trust boundary moves*. A tool that assumed a trusted caller now has an unknown one. Concretely: **validate as though the caller might be hostile**, because with a shared server it might be — and Phase 5's provenance and Phase 6's gate levels apply to what the server exposes, not only to the agent calling it.

**Verify the server before wiring an agent to it.** Use the MCP Inspector or your own client script to confirm the tools are discoverable and return what you expect. This is ordinary software testing and it is worth doing first: an agent debugging a broken server is a much harder problem than you debugging a broken server, because the failure presents as model confusion.

**Where this stops working.** A server is a process with a lifecycle, failures and versions. A shared server that changes breaks clients that depended on it, so **version your tool interfaces** and treat a breaking change as a breaking change — the same discipline any API demands. A local stdio server you wrote and run yourself has a much smaller blast radius than a remote server someone else operates; the trust and versioning questions scale with that distance.

### Part 3 — Why pass@1 is the wrong metric

Now the half of this phase that matters more.

Start with the metric everyone reaches for. **`pass@k`** is the probability that **at least one** of *k* attempts succeeds. It is the standard metric in code-generation benchmarks, and it is the right metric for its purpose: if you generate ten candidate solutions and a human picks the good one, "at least one worked" is exactly what you want to know.

**`pass@k` is the wrong metric for an agent, and the reason is structural.** If you generate ten candidates and pick one, the user gets the good one. If your agent runs and *the agent's output is the product*, nobody is picking. The user gets **whichever run happened**. So the question is not "can it ever succeed" but **"does it succeed, reliably, every time."**

That is **`pass^k`**: the probability that **all** *k* attempts succeed. Or, in the form a product owner cares about, the per-run success rate measured over enough runs to be meaningful.

The gap between the two is where most agent disappointments live:

```
pass@10 = 0.95   meaning at least one of ten runs works
per-run = 0.60   meaning a given run works 60% of the time
```

An agent with those numbers is a good *research demo* — look, it can do it! — and an unusable *product*. Phase 1's compounding-error arithmetic predicted exactly this from per-step reliability, and this is the same phenomenon measured at the task level.

**Measure per-run success over repeated runs.** Concretely: run the same task *n* times, count successes, and report the rate with the *n*. Ten runs is a floor for a rough sense; you need more before small differences mean anything, and a rate quoted without its sample size is not a measurement.

**Report a range, not a point.** If 6 of 10 runs pass, the honest statement is "about 60%, from 10 runs" — with the uncertainty that implies. Quoting "60%" from ten runs as though it were precise is the most common form of false confidence in agent evaluation, and it is the same discipline Phase 3 of this track applied to variance and Phase 5 of RAG applied to retrieval metrics.

**And measure cost and latency per task alongside correctness.** An agent that succeeds 90% of the time at three times the cost of a pipeline that succeeds 85% may still be the wrong choice — Phase 1's spectrum argument, now with numbers attached. This is where the whole track's economics become decidable rather than rhetorical.

**Where this stops working.** `pass^k` measures **your task set**, which is not the world. A high rate on twelve tasks you wrote is evidence about those twelve tasks and nothing more, and the failure mode is treating your suite as a benchmark rather than as a sample. It also says nothing about *why* failures happen, which is Part 5's job — and a reliability number without a taxonomy tells you there is a problem without telling you where.

### Part 4 — Building the evaluation suite

The suite is the instrument. Four properties make it trustworthy.

**A fixed, versioned task set.** The same tasks every time, so numbers are comparable across changes. When you add or modify tasks, version the set — otherwise "reliability improved from 60% to 75%" may mean nothing more than that the tasks got easier. This is RAG's evaluation-harness discipline, and it is the difference between a measurement and an anecdote.

**Coded success checks** — Part 6 is dedicated to this, because it is the phase's most important technique.

**A held-out set.** Keep some tasks you never use to debug. Tuning against your whole suite produces an agent that passes your suite and nothing else — the classic overfitting failure, and agents are especially prone to it because prompt tweaks are so cheap to make.

**Cost and latency recorded per task**, from Phase 3's trace. These are not secondary: they decide whether a successful agent is worth running.

```
tasks/          12 fixed tasks, versioned
  t01_find_invoice/
    input.json
    check.py     <- coded success check
    expected.json
  ...
runner.py       runs the agent n times per task, records everything
runs.db         one row per run: task, attempt, pass, steps, tools,
                tokens, cost, duration, trace_path
```

**Run it after every change**, because agents regress silently. A prompt edit that fixes one task commonly breaks another; a tool-description change shifts selection; a model switch changes everything at once. Without a suite you learn about regressions from users.

**Include impossible tasks.** Add tasks that genuinely cannot be completed — a record that does not exist, a question the available tools cannot answer. **A good agent reports failure; a bad one fabricates a result.** This is the single most valuable test in the suite and the one most often omitted, because it feels like testing for failure rather than success. It is how you detect the behaviour Phase 7's whole evaluation argument exists to catch.

**Where this stops working.** A suite is a **sample**, not a census. Twelve tasks you wrote reflect your imagination of the problem, not its distribution, and the tasks you did not think of are exactly where production failures occur. The honest position is that a passing suite is evidence of *no known regressions*, not evidence of correctness — and Part 7 says what to do about that.

### Part 5 — The failure taxonomy

A reliability number tells you *that* your agent fails. A taxonomy tells you **where to spend your effort**, and it is built from traces rather than guesses.

**Build it from data.** Take your failing runs, read the traces Phase 3 taught you to keep, and classify each failure. Then count. The distribution is what tells you what to fix, and it is frequently surprising — the thing you assumed was the problem often is not.

**A starting taxonomy**, which you should adapt to what your traces actually show:

| Category | What it looks like | Usual fix |
|---|---|---|
| **Wrong tool** | Called a plausible but incorrect tool | Phase 2: description, exclusions, fewer tools |
| **Malformed arguments** | Valid name, invalid or missing parameters | Phase 2: enums, schema, semantic validation |
| **Lost context** | Forgot a constraint or an earlier finding | Phase 5: externalise state, structured compaction |
| **Exceeded step cap** | Hit the cap without finishing | Phase 3: too many steps, or tools insufficient |
| **Unrecovered tool error** | A tool failed and the agent did not adapt | Phase 2: actionable errors |
| **Fabricated result** | Asserted something no tool returned | The most serious — see below |
| **Gave up early** | Stopped with a partial answer | Stopping condition or prompt |
| **Stuck loop** | Repeated identical calls | Phase 3: loop detection |

**Three categories deserve special attention.**

**Fabricated result** is the most serious and the least tolerable, because it is the failure that makes an agent *worse than useless* — it produces confident wrong output that a downstream consumer may act on. It is also the one your impossible-task tests are designed to surface. If this category is non-trivial in your counts, stop optimising and fix it first.

**Exceeded step cap** is a **symptom rather than a cause**, as Phase 3 established. Classify it, then look upstream at *why* the agent needed more steps — usually insufficient tools or a vague task.

**Lost context** points at Phase 5, and it will show up as an agent re-attempting something it already ruled out, or violating a constraint given early in the run.

**Localise before fixing.** This is the RAG Phase 6 diagnostic habit, and it is the reason the taxonomy exists. Reading the distribution prevents the most common waste in agent development: **rewriting the architecture when the problem is one vague tool description.** A taxonomy that shows 60% wrong-tool failures is telling you to fix descriptions, not to add a planning layer.

**Where this stops working.** Categories are not mutually exclusive — a failure is often a wrong tool *because* context was lost — and forcing one label per failure loses that. Record the primary cause and any contributing ones. Reading traces also does not scale: past a few dozen failures, you need sampling or automated classification, and Phase 5 of RAG's judge caveats apply to any automated classifier you build.

### Part 6 — Checking success by code

The most important technique in this phase, and the one that has appeared as a warning in every previous phase.

**The agent's "done" is a claim.** Phase 1 established it, Phase 3 built the evaluation argument on it, Phase 4 demonstrated a confident wrong summary, and Phase 5 showed that even an honest caveat does not survive compression. A model that can be wrong can be wrong about whether it was wrong, and the two errors are correlated because they come from the same source — the sycophancy literature (Sharma et al., arXiv:2310.13548) documents the tendency of models to approve of their own work.

**So the success signal must come from outside the model.** Four techniques, in increasing strength:

**1. Assert on the resulting state, not on the agent's description of it.** If the task was to reconcile invoices, query the database and check the reconciliation. Do not read the agent's summary. This is the single change that most improves an evaluation's trustworthiness, and it is often a ten-line function.

```python
def check_reconcile(run) -> bool:
    # Ask the world, not the agent.
    unmatched = db.query("SELECT count(*) FROM invoices WHERE matched IS NULL")
    return unmatched == 0 and db.query("SELECT count(*) FROM ledger_errors") == 0
```

**2. Run tests.** For coding agents the test suite is the signal, and it is why Phase 3 argued that reflection works on code and not on prose. `pytest` returning non-zero is unarguable in a way a model's opinion never is.

**3. Validate structured output against a schema.** If the agent must return JSON, validate it. This catches a large class of near-misses automatically and costs nothing.

**4. Use a rubric judge only where code cannot check** — and then with Phase 5 of RAG's full set of caveats: judges prefer longer answers, prefer their own outputs, and are order-sensitive. Calibrate the judge by hand against a sample you have scored yourself, **do not use the same model that produced the work**, and never let a judge verdict outweigh a coded check.

**Include differential checks**, which are cheap and catch a class of error the others miss: compare state before and after and assert that *only* the expected things changed. An agent that achieves the goal while also modifying three unrelated records has not succeeded, and a goal-only check will not notice.

**Sample rather than check everything, when volume demands it.** Exhaustive checking is best and is not always affordable. The practical resolution is to check **the load-bearing outputs exhaustively** and sample the rest — the same consequence-based triage Phase 6 applied to approvals.

**And answer the honest question: what would make this check pass wrongly?** A check that always passes is worse than no check, because it manufactures confidence. Verify each check by making it **fail** — introduce a known-bad result and confirm the check catches it. A test suite you have never seen fail is a test suite you do not know works, which is the same argument Phase 3 made about caps and Phase 6 made about sandboxes.

**Where this stops working.** Many real tasks have no crisp coded check: "is this analysis good", "is this summary faithful", "is this recommendation sound". For those you have a weak signal, and Phase 3's conclusion applies — **reflection and self-assessment are unreliable, and a judge is a weak proxy that must be calibrated rather than trusted.** The honest move is to make the check as concrete as the task allows (assert on the facts the summary must contain) and to state plainly in your evaluation that the remainder is judged, with the limitations that implies.

### Part 7 — What your evaluation does not cover

The phase ends where honest engineering always ends: with the limits of your evidence.

**Coverage.** Your task set is not the world. It reflects the cases you imagined, and production failures concentrate in the cases you did not. This is not an argument against suites — they catch regressions reliably — but against mistaking a green suite for correctness.

**Distribution shift.** Real inputs differ from your suite's: messier, longer, more ambiguous, and in a language you did not test. An agent at 90% on your suite may be at 50% on real traffic, and the only way to know is to measure on production samples — carefully, and with Phase 6's gates in place.

**Judged criteria.** Where code cannot check, your number contains judge error that no amount of repetition removes.

**Cost under real conditions.** Your suite's cost per task is measured on your tasks; a real workload's mix may be much more expensive, particularly if it contains more long loops (Phase 3's cap behaviour) or larger contexts (Phase 5's compaction).

**And the gap that cannot be closed.** Benchmarks and production differ, and no evaluation design removes that. The response is not to demand certainty but to **state your number with its conditions attached**: "87% over 20 runs on a 12-task suite, coded checks on 10, judged on 2, cost 0.04 PHP per task, measured 2026-01." That sentence is worth more than any bare percentage, because a reader can see exactly what it does and does not claim.

**When to stop measuring and ship.** Evaluation is not free, and past a point the marginal run adds little. The practical rule: **ship when your reliability number is above the threshold your use case requires, your failure taxonomy shows no dominant serious category (fabrication especially), and your coded checks are in place.** Below that threshold you are guessing; above it, more measurement is a way of avoiding the decision.

**Where this whole phase stops working.** It is worth stating plainly, because this is the track's final lesson. **A perfect evaluation of the wrong agent is wasted work.** If the task should have been a pipeline (Phase 1), if the loop has too many steps (Phase 3), if the tools are vague (Phase 2) — measurement will tell you the agent is unreliable, and the fix is upstream. Evaluation tells you *that* and *where*; it does not tell you *what the system should have been*. That judgement is the whole track, and it is the thing no metric replaces.

## Hands-on practice tasks

1. Read the current MCP specification and note its version. Write down three things a stale tutorial might get wrong about it. <!-- id: agent-07-mcp-and-evaluation-t01 band: quick energy: low -->
2. Write down what MCP would and would not change about your current agent. Include one case where adopting it is overhead rather than a win. <!-- id: agent-07-mcp-and-evaluation-t02 band: quick energy: low -->
3. Expose three of your existing tools as an MCP server, carrying over Phase 2's descriptions, validation, actionable errors and result shaping unchanged. <!-- id: agent-07-mcp-and-evaluation-t03 band: deep energy: high -->
4. Connect a client to your server and confirm the tools are discoverable and callable. Then verify the server with the MCP Inspector before involving a model. <!-- id: agent-07-mcp-and-evaluation-t04 band: focused energy: normal -->
5. Confirm the trust boundary has moved: treat the caller as untrusted and check that every tool validates as though it might be hostile. <!-- id: agent-07-mcp-and-evaluation-t05 band: focused energy: high -->
6. Write down a versioning policy for your server's tool interfaces, including what counts as a breaking change. <!-- id: agent-07-mcp-and-evaluation-t06 band: focused energy: normal -->
7. Explain in your own words the difference between `pass@k` and `pass^k`, and why the first is the wrong metric when the agent's output is the product. <!-- id: agent-07-mcp-and-evaluation-t07 band: focused energy: normal -->
8. Build a 10-12 task suite with a coded success check per task, then run each task 10 times and record the per-run success rate with its sample size. <!-- id: agent-07-mcp-and-evaluation-t08 band: deep energy: high -->
9. Compare your `pass@10` against your per-run rate. Quantify the gap and state what it means for a user who gets one run. <!-- id: agent-07-mcp-and-evaluation-t09 band: focused energy: high -->
10. Replace every self-reported success check with one that asserts on resulting state or runs a test. Measure how the number changes. <!-- id: agent-07-mcp-and-evaluation-t10 band: deep energy: high -->
11. Classify every failure in your runs into the taxonomy and count the categories. Name the single category you should fix first. <!-- id: agent-07-mcp-and-evaluation-t11 band: deep energy: high -->
12. Add impossible tasks — a nonexistent record, an unanswerable question — and record whether the agent reports failure or fabricates a result. <!-- id: agent-07-mcp-and-evaluation-t12 band: deep energy: high -->
13. Verify each coded check by making it fail: introduce a known-bad result and confirm the check catches it. <!-- id: agent-07-mcp-and-evaluation-t13 band: focused energy: high -->
14. Record cost and latency per task, then compare your agent's reliability and cost against the pipeline version from Phase 1. Decide which you would ship. <!-- id: agent-07-mcp-and-evaluation-t14 band: deep energy: high -->
15. Build a held-out task set you do not debug against, and report your suite number and your held-out number separately. <!-- id: agent-07-mcp-and-evaluation-t15 band: deep energy: high -->
16. Write your reliability statement in the full form: rate, sample size, suite size, coded versus judged, cost, and date. <!-- id: agent-07-mcp-and-evaluation-t16 band: ongoing energy: normal -->

## Common Pitfalls

**Treating MCP as a capability upgrade.** It standardises the interface, not the tools. A badly described tool is badly described whether it is reached by a function call or an MCP server, and Phase 2's rules apply unchanged. The payoff is reusability across clients, and it is worth paying for only when tools are genuinely shared.

**Following a stale MCP tutorial.** The specification is versioned and has genuinely diverged — the `2025-11-25` and `2026-07-28` revisions differ on whether the protocol is stateful at all, so a tutorial written against one can be actively wrong about the other rather than merely out of date. Anything about transports, capabilities or extensions should be checked against the current documentation rather than a blog post, including summaries in lessons like this one.

**Assuming a trusted caller when you publish a server.** Exposing tools to unknown clients moves the trust boundary. Validate as though the caller might be hostile, because with a shared server it might be — and Phase 5's provenance and Phase 6's gates apply to what the server exposes.

**Reporting `pass@k` as though it were reliability.** At-least-one-of-k is the right metric when a human picks the best candidate and the wrong metric when the agent's output is the product, because the user gets whichever run happened. The gap between `pass@10 = 0.95` and a per-run rate of 0.60 is where agent disappointments live.

**Quoting a rate without its sample size.** "60%" from ten runs is a rough indication with substantial uncertainty, not a measurement. Report the rate with the *n*, and as a range rather than a point.

**Measuring only correctness.** An agent that succeeds 90% of the time at triple the cost may still be the wrong choice; cost and latency belong in the same table as the pass rate.

**Letting the agent grade its own work.** Self-assessment is close to worthless — a model asked whether it succeeded tends to say yes — and Phase 4's demonstration showed a competent child producing a confidently wrong summary. Assert on the resulting state instead.

**Tuning against your entire suite.** Without a held-out set you produce an agent that passes your tasks and nothing else, and prompt tweaks are cheap enough to make this overfitting very easy to do accidentally.

**Omitting impossible tasks.** They are the only way to detect fabrication, which is the failure that makes an agent worse than useless because it produces confident wrong output. The test feels like testing for failure and is how you find the most serious one.

**Never verifying a coded check can fail.** A check that always passes is worse than no check because it manufactures confidence. Introduce a known-bad result and confirm it is caught — a suite never seen failing is a suite you do not know works.

**Adding or changing tasks without versioning the set.** "Reliability improved from 60% to 75%" may only mean the tasks got easier, and you will not be able to tell.

**Classifying failures by assumption rather than by reading traces.** The thing you assume is the problem frequently is not, and a taxonomy built from guesses leads to fixing the wrong layer — usually by rewriting the architecture when one tool description was vague.

**Treating a green suite as correctness.** It is evidence of no *known* regressions on tasks you wrote, and production failures concentrate in the cases you did not imagine. State the number with its conditions attached rather than as a property of the system.

## Deliverable / proof of work

Write `portfolio/agents/07-mcp-and-evaluation.md` containing:

- **The MCP server** — your tools exposed, with a note on what carried over from Phase 2 unchanged and how you handled the moved trust boundary.
- **The client verification** — evidence the tools are discoverable and callable, plus your server's versioning policy.
- **The task suite** — 10–12 versioned tasks with a coded success check each, described well enough to be reproducible.
- **The reliability measurement** — per-run success over repeated runs, with the sample size, and your `pass@k` alongside it so the gap is visible.
- **The check-failure verification** — for each coded check, the known-bad result you used to confirm it fails.
- **The failure taxonomy** — every failure classified, with counts, and the single category you concluded to fix first with your reasoning.
- **The impossible-task results** — whether the agent reported failure or fabricated, recorded honestly.
- **The cost and latency table** — per task, and your agent's reliability and cost compared against the pipeline version from Phase 1, with a ship or do-not-ship decision.
- **The held-out number** — reported separately from the suite number.
- **Your reliability statement** — in the full form: rate, sample size, suite size, coded versus judged, cost, and date.

## Checklist

- [ ] I can explain what MCP standardises and what it does not do for me <!-- id: agent-07-mcp-and-evaluation-c01 energy: normal -->
- [ ] I checked the current MCP specification version rather than trusting a tutorial <!-- id: agent-07-mcp-and-evaluation-c02 energy: normal -->
- [ ] I have exposed tools as an MCP server and verified them with a client <!-- id: agent-07-mcp-and-evaluation-c03 energy: high -->
- [ ] I carried Phase 2's descriptions, validation, errors and result shaping into the server unchanged <!-- id: agent-07-mcp-and-evaluation-c04 energy: normal -->
- [ ] I treat the server's caller as untrusted and validate accordingly <!-- id: agent-07-mcp-and-evaluation-c05 energy: high -->
- [ ] I can distinguish `pass@k` from `pass^k` and I know which one my product needs <!-- id: agent-07-mcp-and-evaluation-c06 energy: high -->
- [ ] I measure per-run success over repeated runs, not a single attempt <!-- id: agent-07-mcp-and-evaluation-c07 energy: high -->
- [ ] I report my rate with its sample size and as a range, not as a bare percentage <!-- id: agent-07-mcp-and-evaluation-c08 energy: high -->
- [ ] I have a fixed, versioned task set so my numbers are comparable over time <!-- id: agent-07-mcp-and-evaluation-c09 energy: normal -->
- [ ] My success checks assert on resulting state rather than on the agent's report <!-- id: agent-07-mcp-and-evaluation-c10 energy: high -->
- [ ] I have verified each coded check by making it fail on a known-bad result <!-- id: agent-07-mcp-and-evaluation-c11 energy: high -->
- [ ] I use a rubric judge only where code cannot check, and never as the same model that produced the work <!-- id: agent-07-mcp-and-evaluation-c12 energy: normal -->
- [ ] I include differential checks that catch unintended side effects <!-- id: agent-07-mcp-and-evaluation-c13 energy: normal -->
- [ ] I have built a failure taxonomy from traces rather than from assumptions <!-- id: agent-07-mcp-and-evaluation-c14 energy: high -->
- [ ] I have run impossible tasks and recorded whether the agent fabricated <!-- id: agent-07-mcp-and-evaluation-c15 energy: high -->
- [ ] I measure cost and latency alongside correctness, and I have compared my agent against a pipeline <!-- id: agent-07-mcp-and-evaluation-c16 energy: high -->
- [ ] I keep a held-out set and report it separately <!-- id: agent-07-mcp-and-evaluation-c17 energy: high -->
- [ ] I can state what my evaluation does not cover <!-- id: agent-07-mcp-and-evaluation-c18 energy: normal -->

## Quiz

### Q1. What does MCP standardise? <!-- id: agent-07-mcp-and-evaluation-q01 energy: normal -->

- [x] The interface for connecting AI applications to external systems — how tools are discovered and called — not the quality of the tools or the safety of the system
- [ ] The model's reasoning process
- [ ] The tools themselves, including their implementation
- [ ] The evaluation of agent reliability

**Why:** The USB-C analogy the documentation uses is precise: the connector is standardised, not the device, and a hard drive and a lamp share the port while sharing nothing else. So Phase 2's description, validation, error and result-shaping rules apply to an MCP server unchanged, Phase 6's gates are unaffected, and evaluation remains entirely separate — which is why this phase's second half exists. MCP's payoff is that one server works with many clients, and that value appears when tools are shared.

### Q2. Why is `pass@k` the wrong metric when the agent's output is the product? <!-- id: agent-07-mcp-and-evaluation-q02 energy: high -->

- [ ] Because it is too expensive to compute
- [x] Because at-least-one-of-k measures whether the agent *can* succeed, while a user receives whichever single run happened — so the relevant question is whether it succeeds reliably every time
- [ ] Because it overestimates difficulty
- [ ] Because it cannot be compared across models

**Why:** The metric's validity depends on who selects. When ten candidates are generated and a human picks the good one, at-least-one is exactly right, which is why it dominates code-generation benchmarks. When the agent's output *is* the product, nobody selects, so the failure rate is what the user experiences. The gap is stark — `pass@10 = 0.95` can coexist with a per-run rate of 0.60 — and it is Phase 1's compounding-error arithmetic measured at task level. Cost and comparability are separate concerns.

### Q3. What is the most important property of a success check? <!-- id: agent-07-mcp-and-evaluation-q03 energy: high -->

- [x] That it asserts on the resulting state or runs a test, so the signal comes from outside the model rather than from the agent's report
- [ ] That it is fast to run
- [ ] That it covers every possible output
- [ ] That it uses an LLM judge for flexibility

**Why:** The agent's "done" is a claim — established in Phases 1 and 3, demonstrated in Phase 4 with a confident wrong summary, and reinforced by the sycophancy literature showing models approve of their own work. A check that asks the world (query the database, run the tests, validate the schema) cannot be talked out of its verdict, which is why replacing self-reported checks with state assertions is the single change that most improves an evaluation's trustworthiness. Speed and completeness are desirable; a judge is the weakest option and reserved for what code cannot check.

### Q4. Why must you verify that a coded check *can* fail? <!-- id: agent-07-mcp-and-evaluation-q04 energy: normal -->

- [ ] To measure the check's execution time
- [ ] To confirm the check is syntactically valid
- [x] Because a check that always passes is worse than no check — it manufactures confidence — and a suite never seen failing is one you do not know works
- [ ] Because failing checks improve the agent's score

**Why:** This is the same argument Phase 3 made about untested caps and Phase 6 made about unverified sandboxes: configuration intent and configuration effect differ, and only a deliberate failure reveals which you have. Introducing a known-bad result and confirming it is caught is the test. An always-passing check is actively harmful because the number it produces looks like evidence and is not, which is worse than an acknowledged absence of measurement.

### Q5. Your taxonomy shows 60% of failures are wrong-tool selection. What should you do? <!-- id: agent-07-mcp-and-evaluation-q05 energy: high -->

- [ ] Add a planning layer so the agent reasons more before choosing
- [ ] Switch to a stronger model
- [x] Fix the tool descriptions — exclusions and boundaries — and consider consolidating similar tools, since the taxonomy is telling you the problem is authoring rather than architecture
- [ ] Increase the step cap so the agent has more chances to recover

**Why:** This is the diagnostic habit from RAG Phase 6: localise before fixing, and let the distribution of failures decide where effort goes. Wrong-tool selection points directly at Phase 2's description rules and tool-count effect, both of which are free to fix. Adding a planning layer is the most common waste in agent development — rewriting the architecture when one group of descriptions is vague — and raising the step cap treats a symptom by giving the agent more opportunities to choose wrongly.

### Q6. Why include tasks the agent cannot possibly complete? <!-- id: agent-07-mcp-and-evaluation-q06 energy: high -->

- [ ] To lower the average score so it is more realistic
- [ ] To test the step cap
- [ ] To measure latency under load
- [x] Because they are the only reliable way to detect fabrication — a good agent reports failure while a bad one invents a result, and fabrication makes an agent worse than useless

**Why:** Fabricated results are the most serious failure category because they produce confident wrong output that a downstream consumer may act on, and ordinary tasks cannot reveal the behaviour since the agent can often succeed legitimately. An impossible task forces the choice between admitting failure and inventing an answer. The test feels like testing for failure, which is exactly why it is so often omitted and so valuable — the same logic as Phase 4's planted trap.

### Q7. What is the main limit of your evaluation suite? <!-- id: agent-07-mcp-and-evaluation-q07 energy: normal -->

- [ ] That it takes too long to run
- [x] That it is a sample of the cases you imagined rather than the distribution of real inputs, so a green suite is evidence of no known regressions rather than of correctness
- [ ] That it cannot measure cost
- [ ] That it cannot be versioned

**Why:** Coverage and distribution shift are the honest limits: production failures concentrate in the cases you did not think to write, and real inputs are messier, longer and more ambiguous than your tasks. This is not an argument against suites, which catch regressions reliably and cheaply, but against mistaking a passing suite for a property of the system. The correct response is to report the number with its conditions attached — suite size, coded versus judged, cost, date — and to measure production samples separately. Cost is measurable and versioning is a practice, not a limitation.

### Q8. When is a rubric judge appropriate? <!-- id: agent-07-mcp-and-evaluation-q08 energy: normal -->

- [ ] Whenever a coded check is inconvenient to write
- [ ] As the primary success signal, with coded checks as backup
- [x] Only where code cannot check, calibrated by hand, and never using the same model that produced the work
- [ ] Whenever you need to evaluate many runs quickly

**Why:** Judges carry documented biases — preferring longer answers, preferring their own outputs, and being order-sensitive — so a judge verdict is a weak proxy rather than a measurement, and using the producing model to judge its own work compounds the problem directly. Where the task allows a coded check, the coded check wins every time, which is why making checks as concrete as possible is the recommended move before reaching for a judge. Convenience is precisely the wrong reason to prefer a judge.

### Q9. Why keep a held-out task set? <!-- id: agent-07-mcp-and-evaluation-q09 energy: normal -->

- [ ] Because it reduces the cost of running the suite
- [ ] Because held-out tasks are harder and give a better range
- [ ] Because it is required for statistical significance
- [x] Because tuning against your whole suite produces an agent that passes your tasks and nothing else, and prompt tweaks are cheap enough to make that overfitting accidental

**Why:** The mechanism is ordinary overfitting, and agents are unusually prone to it because iterating on a prompt is nearly free — so the loop of "change prompt, re-run suite, keep what improves the number" runs very quickly. A held-out set you never debug against gives an honest estimate, and reporting the two numbers separately makes the gap visible. Held-out tasks are not systematically harder, and sample size rather than set composition is what affects statistical meaning.

### Q10. An agent succeeds 90% of the time at three times the cost of a pipeline that succeeds 85%. What does the phase say to do? <!-- id: agent-07-mcp-and-evaluation-q10 energy: high -->

- [ ] Always choose the higher reliability
- [ ] Always choose the pipeline, since it is deterministic
- [ ] Run the agent twice and take the better answer
- [x] Compare reliability and cost together and decide — cost and latency belong in the same table, because this is Phase 1's spectrum argument with numbers attached rather than rhetoric

**Why:** Correctness alone cannot settle an architecture choice: a 5-point reliability gain at triple the cost may or may not be worth it depending on the consequence of failure and the budget, and that is a decision rather than a formula. Always choosing the pipeline ignores the cases where the reliability difference matters more than the money. Running twice and picking the better answer requires a way to tell which is better — which is the evaluation problem this phase is about, and it does not exist for free.

## You're ready to move on when...

You can explain what MCP standardises and what it leaves entirely alone, you have checked the current specification's version rather than trusting a tutorial, and your tools are exposed as a server that a client can discover and call. You carried Phase 2's descriptions, validation, errors and result shaping over unchanged, and you validate as though the caller might be hostile because the trust boundary moved.

You can distinguish `pass@k` from `pass^k`, and you have **measured per-run success over repeated runs** — reporting the rate with its sample size and as a range rather than as a bare percentage. You have the `pass@k` figure beside it so the gap is visible, and you can explain what that gap means to a user who receives exactly one run.

Your success checks **assert on resulting state or run tests**, and you have verified each one by making it fail on a known-bad result. You use a judge only where code cannot check, never the producing model, and you keep a held-out set reported separately.

You have built a **failure taxonomy from traces**, counted the categories, and named the one to fix first with your reasoning. You have run **impossible tasks** and recorded whether your agent reported failure or fabricated. You measure cost and latency alongside correctness, and you have compared your agent against the pipeline version from Phase 1 and made a ship or do-not-ship decision.

And you can write your reliability statement in the full form — rate, sample size, suite size, coded versus judged, cost, date — and say what your evaluation does not cover.

## Free vs Paid

### What's free is enough

The whole phase, and for the second half this is not a compromise — **a zero-budget setup is genuinely well suited to it.**

**MCP is free and open source**, the specification and documentation are free pages, the SDKs are free, and the Inspector is free. Building a server costs nothing.

**Evaluation needs repetition above all else, and repetition is what a local model makes affordable.** This is the argument Phase 7 of Cost made for evaluation harnesses and Phase 3 made for variance measurement, and here it is load-bearing: `pass^k` requires running each task many times, and a suite of twelve tasks at ten runs is a hundred and twenty executions. Doing that by hand is tedious; doing it on a metered API is expensive; doing it locally is free and therefore actually happens. **A learner on a zero budget can afford a larger sample than someone rationing API calls**, which means the reliability number you produce may be better founded than theirs.

**The coded checks are the heart of the phase and cost nothing.** Asserting on database state, running `pytest`, validating a schema, comparing before-and-after — all free, all local, and all more trustworthy than any judge. The most valuable technique here is the cheapest one.

**The taxonomy is trace reading**, which is free and improves with practice rather than with budget.

**Two honest limitations.** A weaker local model produces a **lower and noisier** reliability number, so your measurements describe your model rather than agents in general — which is fine, since the number you need is the one for your system. And judged criteria, where you cannot avoid them, are weaker on a small model; the mitigation is to make checks as concrete as the task allows, which is the recommended move regardless.

**And one genuine advantage.** Because a small model fails more often, **you will build a richer failure taxonomy than someone testing a frontier model.** Failure categories that appear a handful of times on a capable model will be abundant on yours, which makes the diagnostic skill this phase teaches much easier to develop. The same asymmetry made Phase 4's trap experiment and Phase 5's poisoning test land harder.

### What a paid tier adds

Three things, and the first changes your headline number directly.

**A higher per-run success rate**, which is what `pass^k` measures. This is the honest, large effect: a frontier model may move a task from 60% to 90%+, and that difference is frequently the gap between a demo and something shippable. Note what it does **not** do — it does not make the number 100%, and Phase 1's arithmetic still applies to whatever the per-step rate is.

**Fewer fabricated results**, which is the most valuable single improvement. Fabrication is the failure that makes an agent worse than useless, and capable models are substantially better at admitting that a task cannot be completed. Your impossible-task test is how you would measure this on your own suite rather than assuming it.

**Better tool selection and argument formation** (Phase 2), which shifts the failure taxonomy away from the cheap authoring categories and toward genuine capability limits. This is a real gain and note the diagnostic implication: **fewer failures does not mean fewer fixes** — it means the remaining failures are harder, and a taxonomy built on a capable model may be thinner and less instructive than one built locally.

**What money does not buy** is the evaluation itself. Whether your checks assert on state or on the agent's report, whether your task set is versioned, whether you have a held-out set, whether you included impossible tasks, and whether you verified your checks can fail are all practices. A frontier model evaluated with self-reported success and no held-out set gives you an impressive number that means nothing — and it will be more convincing, which makes it more dangerous.

**Volatile, dated: as of 2026-09, the MCP specification is versioned and actively developing — `2026-07-28` is the current protocol version and is stateless, having removed the `initialize` handshake and protocol-level sessions; `2025-11-25` is the previous, stateful revision. Agent evaluation benchmarks are an active research area, and model reliability on agentic tasks changes on the order of months. Your own suite is the only number that describes your own system, so measure rather than cite.**

### When it's worth paying

**Not for this phase.** Every task runs locally or on free infrastructure, and the deliverables are a server, a suite, a taxonomy and a reliability statement.

The threshold is the clearest in the whole track, because this phase produces the instrument that answers it: **when your measured per-run reliability is below what your use case requires, your failure taxonomy shows the dominant categories are capability rather than authoring, and you have already fixed the cheap categories.**

All three conditions matter. If wrong-tool selection dominates, that is a description fix (Phase 2) and it is free. If context loss dominates, that is externalisation (Phase 5) and it is free. If the step cap is being hit, the task needs fewer steps or better tools (Phase 3) and that is free. **Only when the authoring categories are cleared and the remaining failures are the model failing at steps it should manage** have you isolated a capability gap — and at that point one paid comparison on your own suite is a decision-changing experiment in Phase 7 of Cost's sense, because it tells you exactly how much of your failure rate money would remove.

And note what remains yours at any price: the checks, the held-out set, the impossible tasks, the taxonomy, and the honesty of the number you report. Those are the difference between knowing your agent works and believing it does — and the whole Agents track has been building toward that distinction.
