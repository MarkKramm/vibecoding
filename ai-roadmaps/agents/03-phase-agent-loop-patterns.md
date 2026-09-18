---
id: agent-03-agent-loop-patterns
track: agents
phase: 3
order: 30
title: The Agent Loop and Planning
duration: 1 week
duration_weeks: 1
energy_mix: [normal, high]
deliverable: portfolio/agents/03-agent-loop-patterns.md
exit_criteria: >
  You can implement a bounded agent loop with all six hygiene controls in place,
  choose between reacting, planning and reflecting for a given task, and say why
  reflection is only as good as the failure signal that drives it.
---

# Phase 3 — The Agent Loop and Planning

## Goal of this phase

Phase 1 defined the loop and Phase 2 built the tools it calls. This phase is about the loop's **internals** — how the model decides what to do next, and the hygiene that keeps a loop from quietly destroying your budget, your latency budget or your sanity.

Two things are taught here that are usually separated and should not be. The first is **pattern**: the recognised shapes a loop can take, from simple interleaved reasoning-and-acting through to planning up front and reflecting on failure. The second is **discipline**: the six controls that every loop needs regardless of its pattern, and which are mandatory rather than advisable.

They belong together because the patterns are what make loops capable and the discipline is what makes them safe to run. A loop with an elegant plan-and-execute pattern and no step cap is a liability; a loop with every cap and no coherent pattern never solves anything.

By the end you will have a working bounded loop with a trace you can read, and you will be able to say for a given task whether it needs to react, to plan, or to reflect — and, in the reflection case, whether you actually have the failure signal that makes reflection meaningful.

## Estimated time

**1 week** at 1–2 hours a day, 5 days. Roughly 8–10 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Part 1: ReAct — interleaving reasoning and acting | 2h |
| 2 | Part 2: loop hygiene, all six controls | 2h |
| 3 | Part 3: plan-and-execute, and choosing your planner | 1.5h |
| 4 | Part 4: reflection, and the failure-signal requirement | 2h |
| 5 | Part 5: choosing a pattern, then the deliverable | 1.5h |

If you only have three hours this week, do tasks 2, 4, 7 and 11. Those produce a working ReAct loop, the six controls verified by tripping each, the reflection experiment, and your pattern decision.

The coding is modest — a loop is a `while` — but the experiments matter. Each hygiene control should be verified by constructing an input that trips it, because a cap you have never tested is a cap you do not know works.

## Skills you'll gain

- Implement a ReAct-style loop that interleaves reasoning traces with tool actions.
- Explain why interleaving beats pure chain-of-thought and pure action generation.
- Implement all six hygiene controls and verify each by tripping it deliberately.
- Detect a stuck loop by recognising repeated identical calls.
- Implement plan-and-execute, and justify which model does the planning.
- Implement reflection and state the failure signal it depends on.
- Recognise when reflection is guessing rather than learning.
- Choose a loop pattern for a task on the basis of its structure.
- State where each pattern stops working, and when a single call would have been better.

## Specific topics to learn

### ReAct and interleaving

- Interleaving reasoning traces with actions, so each informs the other.
- Why pure chain-of-thought hallucinates: no contact with the world.
- Why pure acting is unfocused: no plan to guide the actions.
- The thought / action / observation cycle.
- What the ReAct paper measured, on which tasks, and against which baselines.
- Trajectory interpretability as a practical benefit, not a nice-to-have.

### Loop hygiene — all six, all mandatory

- **Step cap**: the blunt, reliable backstop.
- **Token and cost cap**: what protects your money, independently of steps.
- **Wall-clock timeout**: what protects the user.
- **Loop detection**: identical repeated calls, and what to do when you find one.
- **Progress check**: is the loop getting anywhere, and how would you know?
- **Tracing**: every step recorded, because the trajectory is the only evidence.
- Why each one is a separate control, and which failure each prevents alone.

### Plan-and-execute

- Plan once with a strong model, execute steps with a cheap one.
- When a plan is worth producing, and when it is overhead.
- Replanning: when to abandon a plan rather than push through it.
- The failure mode: a confident plan built on a wrong premise.
- Why plans should be explicit and inspectable rather than internal.

### Reflection

- Reflexion: verbal self-reflection reinforced through language, not weights.
- The reflective text held in an episodic memory buffer across attempts.
- **The failure-signal requirement**: reflection needs a reliable signal or it is guessing.
- Where reliable signals exist: tests, compilers, schemas, state checks.
- Where they do not: open-ended writing, judgement calls, anything you must read to assess.
- Why a coding agent has an unusually good signal, and what that implies.
- Sycophantic self-assessment: a model asked to judge its own work tends to approve.

### Choosing a pattern

- Match the pattern to the task's structure, not to its prestige.
- Single call: no decisions needed, or the task is one step.
- ReAct loop: the next step genuinely depends on what you just learned.
- Plan-and-execute: the steps are knowable up front and the plan can be reviewed.
- Reflection: failures are detectable automatically.
- Combining patterns, and the cost of each addition.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| A local model via Ollama | Run loops repeatedly to observe convergence, stuck states and variance | Free/open-source | https://ollama.com/ | Tasks t02, t09 — run the loop ten times and classify how each ended | A free hosted tier, checked for tool-calling support |
| Python (standard library) | The loop, the caps, the detector and the tracer are all ordinary code | Free/open-source | https://docs.python.org/3/ | Tasks t02, t05 — implement the loop and all six controls | Any language |
| SQLite | Persist the trace so you can query what happened rather than re-reading logs | Free/open-source | https://sqlite.org/ | Task t06 — one row per iteration: step, tool, args, tokens, duration | A JSONL file, which is simpler and sufficient |
| `pytest` | A test harness is the reliable failure signal for a coding loop | Free/open-source | https://docs.pytest.org/ | Tasks t10, t11 — use test results as the reflection signal | Any test runner, or a script returning non-zero |
| `json` / `csv` (stdlib) | Turn a trace into a table you can actually analyse | Free/open-source | https://docs.python.org/3/library/json.html | Task t06 — compute steps per task, cost per task, and where calls repeated | A spreadsheet |
| Git | One commit per pattern so the comparison is attributable | Free/open-source | https://git-scm.com/ | Task t13 — keep each pattern's implementation separate and comparable | Dated copies of files |

## Free/cheap resources

- **Yao et al. — ReAct: Synergizing Reasoning and Acting in Language Models (arXiv:2210.03629)** — https://arxiv.org/abs/2210.03629
- **Shinn et al. — Reflexion: Language Agents with Verbal Reinforcement Learning (arXiv:2303.11366)** — https://arxiv.org/abs/2303.11366
- **Wang et al. — Plan-and-Solve Prompting (arXiv:2305.04091)** — https://arxiv.org/abs/2305.04091
- **Yao et al. — Tree of Thoughts (arXiv:2305.10601)** — https://arxiv.org/abs/2305.10601
- **Xi et al. — The Rise and Potential of LLM Based Agents (arXiv:2309.07864)** — https://arxiv.org/abs/2309.07864
- **Anthropic — Building effective agents** — https://www.anthropic.com/engineering/building-effective-agents

## Lesson: React, Plan, Reflect — and the Discipline Around All Three

### Part 1 — ReAct: why interleaving works

Start with the problem the pattern solves, because the pattern is a response to two failure modes that are easy to demonstrate.

**Pure chain-of-thought hallucinates.** Prompt a model to reason step by step with no contact with the outside world and it will produce a fluent chain that arrives at a confident answer. If any premise in that chain is wrong — a fact it half-remembered, a number it invented — the whole chain is wrong and nothing in it detects the error. The reasoning never touches reality, so it cannot be corrected by reality.

**Pure action is unfocused.** Give a model tools with no instruction to reason and it will call them, but without a plan the calls are driven by surface pattern-matching rather than by a goal. It fetches whatever seems related, then fetches more, and the trajectory drifts.

**ReAct interleaves the two.** The model emits a *thought* (reasoning about what it needs), then an *action* (a tool call), then receives an *observation* (the result), and repeats. Each part informs the other: the reasoning tracks and updates the plan, and the actions bring back information that the reasoning did not have.

```
Thought:  I need the invoice total for INV-4471.
Action:   get_invoice(id="INV-4471")
Observation: {"id": "INV-4471", "amount": 12500, "currency": "PHP", ...}
Thought:  The amount is 12500 centavos. The user asked in pesos, so I need
          to confirm the currency convention before answering.
Action:   get_currency_convention()
Observation: amounts are stored in centavos
Thought:  So the answer is 125.00 PHP. I can answer now.
```

Read that trace and you can see exactly why each action happened. That is not a presentational nicety — **it is the property that makes agent behaviour debuggable at all.** A system whose reasoning is invisible gives you an answer and no account of how it got there, which Phase 7's evaluation and Phase 6's approval gates both need.

**What the paper actually reported**, scoped correctly because the figures get quoted loosely. ReAct was evaluated on a diverse set including question answering (HotpotQA) and fact verification (Fever), and on two interactive decision-making benchmarks (ALFWorld and WebShop). On the QA and fact-verification tasks, the reported benefit is that ReAct **overcomes the hallucination and error-propagation problems prevalent in chain-of-thought reasoning** by interacting with a simple API, and produces more interpretable trajectories. On the interactive benchmarks it **outperformed imitation and reinforcement-learning methods by an absolute success rate of 34% and 10%** respectively, using only one or two in-context examples. The large percentages belong to the interactive benchmarks; quoting them as a general agent improvement misstates what was measured.

**Where interleaving stops helping.** Every thought is generated text, and text costs tokens and time. On a task where the next step is obvious — fetch this record, return this field — the reasoning trace is pure overhead, and it can actively hurt by giving the model an opportunity to talk itself into a worse plan. Interleaving earns its cost when the task genuinely branches on what was learned. Phase 1's instruction to choose the leftmost sufficient position applies inside the loop too: **do not add reasoning to a step that does not need to decide anything.**

### Part 2 — The six controls, which are not optional

A loop without these is a system whose cost, latency and termination are all unspecified. Each control prevents a distinct failure, and each must be verified rather than assumed.

**1. The step cap.** The blunt, reliable backstop. It bounds iterations absolutely and cannot be defeated by unexpected model behaviour — which is why it is the one control that must always exist, even when the loop also has smarter stopping conditions.

Set it from measurement, not intuition. Run the task several times, observe the typical iteration count, and set the cap at a small multiple. A cap of 30 on a task that takes 5 steps is not caution.

**2. The token and cost cap.** Protects your money, and it is **independent of the step cap** because each iteration appends to the message history, so context grows across a run. A step cap of 5 with a growing context can cost more than a step cap of 15 with small ones. Phase 5 of Cost's logging discipline is what makes this visible.

**3. The wall-clock timeout.** Protects the user's patience. A loop making slow progress is, from the user's perspective, a system that has not answered. This is the control most often omitted, because developers measure their own patience rather than a user's.

**4. Loop detection.** The specific pathology of repeating an identical action and expecting a different result. Detect it on the tool name plus normalised arguments — sort the JSON keys, normalise whitespace and case — and count repeats.

```python
key = (call.name, json.dumps(call.args, sort_keys=True))
seen[key] = seen.get(key, 0) + 1
if seen[key] >= 3:
    return "Error: you have called {call.name} with identical arguments 3 times. "\
           "Repeating it will not change the result. Try a different approach, "\
           "or report what is blocking you."
```

Note that the response is not merely to abort — it is to **tell the model it is stuck**, which frequently produces a different approach on the next iteration. That is Phase 2's actionable-error principle applied to the loop itself.

**5. Progress check.** The hardest of the six, because "is this loop getting anywhere?" is genuinely difficult to answer mechanically. Useful proxies: is the set of distinct actions growing or oscillating? Are successive observations adding new information, or repeating what is already in the context? Has the goal-state changed at all?

You will not implement this perfectly. The honest position is that a crude progress signal — has anything new been learned in the last *n* steps — catches the common case, and that the step cap is the reliable backstop for the cases it misses.

**6. Tracing.** Every iteration recorded: the step number, the thought, the tool, the validated arguments, the result size, the duration and the token count. This is not logging for its own sake — **the trace is the only evidence you will have about what the agent did.** Phase 6's approval gates read from it, and Phase 7's failure taxonomy is built by classifying traces.

**Why all six, stated as a table of what each one alone prevents:**

| Control | Prevents, on its own |
|---|---|
| Step cap | Unbounded iteration |
| Token/cost cap | Unbounded spend at bounded step count |
| Wall-clock timeout | Unbounded user-perceived latency |
| Loop detection | The specific non-terminating repeat |
| Progress check | Long loops that are burning budget without advancing |
| Tracing | Undiagnosable behaviour, after the fact |

**Where this discipline stops working.** Controls bound *damage*; they do not produce *success*. A loop that routinely hits its step cap is failing while still spending money — the cap converted a runaway into a slow failure, which is better and is not success. When you see caps being hit regularly, the diagnosis is that the task is too hard for the available tools, too vague, or has the wrong stopping condition. Phase 6 of RAG's habit applies directly: a cap hit is a symptom, and the cause is upstream.

### Part 3 — Plan-and-execute, and which model plans

ReAct decides one step at a time. **Plan-and-execute** separates the two: a planning phase produces an explicit sequence of steps, and an execution phase carries them out.

```
Plan:  1. get_invoice(INV-4471)
       2. if status == "overdue", get_customer(customer_id)
       3. compute_late_fee(amount, due_date)
       4. summarise for the user

Execute each step in order, feeding results forward.
```

**Why separate them.** Three reasons, and each is a real gain in the right circumstances.

**You can use different models.** Planning benefits from a strong model's reasoning; executing a step is usually mechanical. Planning once with a capable model and executing with a cheap one is a direct cost saving — the same routing logic Phase 4 of Cost taught, applied within a single task.

**The plan is inspectable before it runs.** This is the reason that matters most for safety. A plan is a reviewable artefact: a human — or a cheap programmatic check — can read the four steps and see that step 2 wants to delete something before any deletion occurs. ReAct's step-at-a-time nature gives you no such checkpoint, because there is no moment at which the whole intended course of action exists in one place. Phase 6's approval gates depend on this, which is why batch-approving a plan is one of its techniques.

**Execution becomes cheaper and more predictable.** Follow a plan and you avoid re-deriving the approach on every step.

**The failure mode, which is specific and common.** A plan is built from what the model knew **before** it looked at anything. If its premise is wrong — the invoice is not in the system, the field it planned to read does not exist — the plan is confidently wrong and executing it wastes every step. This is why **replanning** is not an optional extra: if a step fails twice, or produces an observation that contradicts the plan's assumptions, the correct response is to abandon the plan and replan rather than to push through.

**Which model plans.** The honest answer is *the strongest one you have, on the step that is hardest to get right*. Planning is where a mistake propagates into every subsequent step, so it is the worst place to economise — which is exactly inverted from the common instinct to use the cheap model for "the thinking part" and the good model for the output. If you are choosing where to spend your one capable model call, spend it on the plan.

**Where plan-and-execute stops working.** It assumes the steps are knowable in advance, and for genuinely exploratory tasks they are not — you cannot plan a debugging session before seeing the error. It also assumes steps are largely independent once planned, and a task whose later steps depend on the shape of earlier results needs replanning so frequent that ReAct is the simpler choice. Use plan-and-execute when the shape of the work is predictable and reviewability matters; use ReAct when the next step genuinely depends on what you just learned.

### Part 4 — Reflection, and the signal it cannot do without

The third pattern, and the one most often applied where it does not work.

**What Reflexion does** (Shinn et al., arXiv:2303.11366): rather than updating model weights, it reinforces an agent through **linguistic feedback**. After an attempt, the agent **verbally reflects** on the task feedback signal, stores that reflective text in an **episodic memory buffer**, and uses it to make better decisions on subsequent attempts. The paper reports that it accepts various types and sources of feedback — scalar or free-form, external or internally simulated — and that it achieves **91% pass@1 on the HumanEval coding benchmark**, against the 80% reported for GPT-4 at the time.

Note the shape: attempt → observe outcome → reflect in words → store → retry with the reflection available. No training, no weight updates. The learning lives in text.

**The requirement that decides whether it works at all.** Reflection needs a **reliable failure signal**. The reflected text is generated by the same model that made the mistake, reasoning about an outcome — and if the outcome is ambiguous, the reflection can only guess at what went wrong. A confident, plausible, wrong reflection stored in the memory buffer then **makes the next attempt worse**, because it directs the agent away from a correct approach for a reason that was invented.

This is the single most important idea in the phase, so here it is as a concrete contrast:

| Task | Failure signal | Is reflection meaningful? |
|---|---|---|
| Writing code | **Tests pass or fail** | Yes — the signal is external, deterministic and unarguable |
| Producing structured output | **Schema validation** | Yes — the output is valid or it is not |
| A multi-step computation | **A checkable answer** | Yes, if you can verify the result independently |
| Writing prose | None automatic | **Largely no** — "is this good?" is a judgement, not a signal |
| Choosing a strategy | None automatic | **No** — you cannot tell a bad strategy from a bad outcome |
| Analysing a document | Weak or subjective | **Usually no** |

**Why this makes coding agents unusually capable.** Look at the first row. Code has an *automatic, external, reliable* verifier: run the tests. That means a coding agent can attempt, check, reflect on a genuine failure, and retry — and the reflection is grounded in something that actually happened. It is not a coincidence that the most successful agent products are coding agents; the structure of the domain supplies the failure signal that the pattern requires. Reflexion's 91% HumanEval figure is a coding result, on a benchmark with automatic verification, and it should be read as exactly that rather than as a general claim about self-improvement.

**What to do when you have no signal.** Three options, in order of honesty.

**Build one.** If the task's output can be checked by code — a schema, a regex, a computation, a state comparison — build the check and you have a signal. This is usually available and usually skipped.

**Use an external judge, carefully.** A different model family with a rubric is a weak signal. It is better than nothing and it inherits Phase 5 of RAG's judge biases — length preference, self-preference, order sensitivity — so it must be calibrated by hand and must not be the *same* model that produced the work.

**Do not reflect.** If neither is available, skip the pattern. An agent that retries with an invented explanation is worse than one that retries identically, because the invented explanation actively misdirects.

**And the bias that undermines the naive version.** A model asked to evaluate its own work tends to approve of it. This is the sycophancy documented in the evaluation literature (Sharma et al., arXiv:2310.13548), and it means **self-assessment without an external check is close to worthless** — the agent will report success on work that failed. Phase 7's insistence on checking success by code rather than by the agent's self-report is the direct consequence.

**Where reflection stops working.** With a weak signal it makes things worse rather than better. With a strong signal it costs extra calls and context per attempt, which is worth paying when attempts are cheap and the signal is reliable, and not worth paying when you could simply fix the underlying tool or prompt instead. And reflection cannot invent information: if the agent failed because a tool cannot do what was needed, reflecting on the failure will not grant the capability. It is a way of using a signal you already have, not a substitute for having one.

### Part 5 — Choosing a pattern

Five patterns, and the task's structure — not the pattern's sophistication — decides.

| Pattern | Use when | Do not use when |
|---|---|---|
| **Single call** | No decisions needed; one step | Almost never worth adding a loop |
| **Fixed pipeline** | The sequence is known and does not vary | The next step depends on what you learn |
| **ReAct loop** | The next step genuinely depends on the previous observation | The path is knowable up front |
| **Plan-and-execute** | Steps are knowable in advance and reviewability matters | The task is exploratory |
| **Reflection** | Failures are detectable **automatically** | You have no reliable failure signal |

**Four questions that pick the pattern.** In order:

1. **Does the next step depend on what I learn?** No → pipeline. Yes → ReAct.
2. **Are the steps knowable up front, and does a human need to review them before execution?** Yes → plan-and-execute.
3. **Can I detect failure in code?** Yes → reflection is available and worth it. No → skip it.
4. **Could a single call do this?** If yes, stop. Phase 1's leftmost-position rule applies with full force here, and it is the question most often skipped.

**Combining patterns, and the cost.** These compose: plan up front, execute each step with a bounded ReAct loop, and reflect when a step fails a test. That is a legitimate architecture and each addition must be justified by a failure you observed. **Every pattern you add costs latency, tokens and debuggability**, and the failure mode of a sophisticated agent is that no one can tell which layer produced a wrong answer. Phase 7's failure taxonomy is how you keep that tractable.

**Where this whole framing stops working.** It assumes the loop is the hard part. On many real tasks the difficulty is entirely elsewhere — a bad tool, a missing document, an ambiguous requirement — and no pattern choice helps. When a loop underperforms, the diagnostic habit from Phase 6 of RAG applies: localise the failure before redesigning the architecture. Reaching for a more sophisticated pattern is the agent equivalent of tuning retrieval against an unanswerable question.

## Hands-on practice tasks

1. Trace one human task you perform — a research question, a debugging session — and write it as a ReAct trace with explicit thoughts, actions and observations. Mark where the thought genuinely changed what you did next. <!-- id: agent-03-agent-loop-patterns-t01 band: quick energy: low -->
2. Implement a ReAct loop with no caps and run it on a task your tools cannot complete. Watch the cost and context grow, then stop it manually. This is the baseline your controls protect against. <!-- id: agent-03-agent-loop-patterns-t02 band: focused energy: high -->
3. Compare interleaved reasoning against no reasoning on the same task: same tools, same model, one variant with a thought step and one without. Report accuracy and cost for both. <!-- id: agent-03-agent-loop-patterns-t03 band: deep energy: high -->
4. Add all six controls and verify each one by constructing an input that trips it. Record for each what the loop did and what the user would have seen. <!-- id: agent-03-agent-loop-patterns-t04 band: deep energy: high -->
5. Implement loop detection on normalised arguments — sorted keys, collapsed whitespace. Confirm it fires on a genuinely stuck model and does *not* fire on legitimate repeated reads with different arguments. <!-- id: agent-03-agent-loop-patterns-t05 band: focused energy: high -->
6. Build the tracer: one row per iteration with step, tool, arguments, result size, tokens and duration. Then compute steps per task, cost per task, and the repeated-call rate across ten runs. <!-- id: agent-03-agent-loop-patterns-t06 band: focused energy: normal -->
7. Implement a crude progress check — has any new information arrived in the last three steps? — and report where it correctly caught a stuck loop and where it produced a false alarm. <!-- id: agent-03-agent-loop-patterns-t07 band: deep energy: high -->
8. Build the plan-and-execute version of the same task. Time the planning call and the execution calls separately and report what the split cost. <!-- id: agent-03-agent-loop-patterns-t08 band: focused energy: high -->
9. Run the ReAct loop and the plan-and-execute loop ten times each on the same task set. Compare success rate, mean steps, mean cost, and variance. Which is more predictable, and by how much? <!-- id: agent-03-agent-loop-patterns-t09 band: deep energy: high -->
10. Build a reflection loop on a task with a **reliable** signal — code plus tests. Report the pass rate on first attempt versus after reflection, and read the reflections to check they name real causes. <!-- id: agent-03-agent-loop-patterns-t10 band: deep energy: high -->
11. Build the same reflection loop on a task with **no** reliable signal. Read the reflections and find at least one that is confidently wrong. This is the phase's central demonstration. <!-- id: agent-03-agent-loop-patterns-t11 band: deep energy: high -->
12. Find a case where a confident wrong reflection made a subsequent attempt worse. If the model you use cannot produce one, explain why the mechanism makes it possible. <!-- id: agent-03-agent-loop-patterns-t12 band: focused energy: high -->
13. Apply the four pattern-selection questions to three of your own tasks and write the decision for each, including at least one where the answer is "a single call would do". <!-- id: agent-03-agent-loop-patterns-t13 band: focused energy: normal -->
14. Write your loop-hygiene checklist with your actual configured values and the evidence that each control works. Keep it as the template for every loop you build from here. <!-- id: agent-03-agent-loop-patterns-t14 band: ongoing energy: normal -->

## Common Pitfalls

**Adding reasoning to steps that decide nothing.** A thought step costs tokens and latency, and on an obvious next action it can actively hurt by giving the model an opportunity to talk itself into a worse plan. Interleaving earns its cost only when the task genuinely branches on what was just learned.

**Treating the six controls as optional or as "production hardening".** They are the difference between a system with bounded cost, latency and termination and one without. A loop missing even the step cap has unspecified behaviour, and "I'll add caps later" means the loop is currently unbounded.

**Assuming a step cap bounds your bill.** Steps and tokens are different resources. Each iteration appends to the history, so a short loop with a growing context can cost more than a long one with small iterations.

**Never testing a control.** A cap you have not tripped is a cap you do not know works — an off-by-one, a comparison against the wrong counter, or a check that never runs all look identical to a working control until the day they matter.

**Detecting loops on raw arguments.** Unordered JSON keys, trailing whitespace and case differences make identical calls look distinct, so the detector never fires on the case it was built for. Normalise before comparing.

**Aborting on a detected loop without saying so.** Telling the model it is stuck frequently produces a different approach on the next iteration. Silently terminating throws away the one piece of information that could have unblocked it.

**Planning with the cheap model and executing with the expensive one.** This is exactly inverted. An error in the plan propagates into every subsequent step, so planning is the worst place to economise — if you have one capable call to spend, spend it on the plan.

**Executing a plan after its premise has failed.** Plans are built from what the model knew before it looked. When a step fails twice or an observation contradicts the plan's assumptions, replan rather than pushing through; otherwise you spend every remaining step on a course of action already known to be wrong.

**Applying reflection without a reliable failure signal.** The reflection is generated by the model that made the mistake, reasoning about an ambiguous outcome, so a confident wrong reflection gets stored and then misdirects the next attempt. This makes the agent worse than one that retries without reflecting — one of the few cases where adding a technique actively harms.

**Trusting the agent's self-assessment.** A model asked whether it succeeded tends to say yes. Without an external check, self-reported success is close to worthless, which is why Phase 7 insists success be verified in code.

**Reaching for a more sophisticated pattern when the loop is not the problem.** A bad tool, a missing document or an ambiguous requirement will not be fixed by switching from ReAct to plan-and-execute. Localise the failure before redesigning the architecture.

## Deliverable / proof of work

Write `portfolio/agents/03-agent-loop-patterns.md` containing:

- **The ReAct trace** — a real trajectory with thoughts, actions and observations, annotated to show where a thought changed the next action. Include your no-reasoning comparison and what it cost.
- **The unbounded baseline** — what happened when you removed all caps, with the cost and context growth recorded. This is the evidence that justifies the controls.
- **The six controls, verified** — each control, its configured value, and the input you constructed to trip it, with what the loop and the user experienced.
- **The trace analysis** — steps per task, cost per task, and repeated-call rate across ten runs, from your trace table rather than from memory.
- **The pattern comparison** — ReAct against plan-and-execute on the same task set: success rate, mean steps, mean cost and variance. State which is more predictable and by how much.
- **The reflection experiment** — the same reflection loop run on a task **with** a reliable signal and on one **without**, with the pass rates and, critically, at least one confidently wrong reflection quoted. This is the phase's central demonstration.
- **The pattern decisions** — three of your own tasks through the four selection questions, including one where you conclude a single call suffices.
- **Your hygiene checklist** — the six controls with your values and your evidence, as a reusable template.

## Checklist

- [ ] I can write a ReAct trace and explain why interleaving beats pure reasoning and pure action <!-- id: agent-03-agent-loop-patterns-c01 energy: normal -->
- [ ] I can state what the ReAct paper measured on which tasks, without conflating the benchmarks <!-- id: agent-03-agent-loop-patterns-c02 energy: normal -->
- [ ] I implement all six hygiene controls and have verified each by tripping it <!-- id: agent-03-agent-loop-patterns-c03 energy: high -->
- [ ] I understand that a step cap and a token cap protect against different things <!-- id: agent-03-agent-loop-patterns-c04 energy: normal -->
- [ ] My loop detector normalises arguments and I have shown it firing correctly <!-- id: agent-03-agent-loop-patterns-c05 energy: high -->
- [ ] I tell the model when it is stuck rather than aborting silently <!-- id: agent-03-agent-loop-patterns-c06 energy: normal -->
- [ ] I have a trace I can analyse, and I have computed steps and cost per task from it <!-- id: agent-03-agent-loop-patterns-c07 energy: normal -->
- [ ] I implement plan-and-execute and spend my strongest model on the planning step <!-- id: agent-03-agent-loop-patterns-c08 energy: high -->
- [ ] I replan when a plan's premise fails rather than pushing through <!-- id: agent-03-agent-loop-patterns-c09 energy: normal -->
- [ ] I can name the failure signal reflection depends on and say whether my task has one <!-- id: agent-03-agent-loop-patterns-c10 energy: high -->
- [ ] I have observed a confidently wrong reflection and can explain why it makes things worse <!-- id: agent-03-agent-loop-patterns-c11 energy: high -->
- [ ] I choose patterns by task structure and can justify declining a more sophisticated one <!-- id: agent-03-agent-loop-patterns-c12 energy: normal -->

## Quiz

### Q1. Why does interleaving reasoning with actions outperform pure chain-of-thought on knowledge tasks? <!-- id: agent-03-agent-loop-patterns-q01 energy: high -->

- [x] Because the reasoning can be corrected by information from the environment, so wrong premises are caught rather than carried through a fluent chain
- [ ] Because reasoning traces make the model larger and more capable
- [ ] Because actions replace the need for reasoning altogether
- [ ] Because chain-of-thought uses more tokens than is efficient

**Why:** Pure chain-of-thought has no contact with reality, so a half-remembered fact or an invented number propagates through the whole chain undetected and produces a confident wrong answer. Interleaving gives the reasoning access to observations, which is what lets it notice and correct a bad premise. The ReAct paper describes this specifically as overcoming the hallucination and error-propagation problems prevalent in chain-of-thought. Actions complement reasoning rather than replacing it, and token efficiency is not the mechanism.

### Q2. ReAct reports absolute success-rate improvements of 34% and 10%. Which tasks produced those figures? <!-- id: agent-03-agent-loop-patterns-q02 energy: high -->

- [ ] Question answering and fact verification, against chain-of-thought
- [x] Interactive decision-making — ALFWorld and WebShop — against imitation and reinforcement-learning methods
- [ ] An average across all four evaluation tasks
- [ ] Code generation benchmarks against a fine-tuned baseline

**Why:** The large percentages come from the two interactive benchmarks, where ReAct outperformed imitation and RL methods while being prompted with only one or two in-context examples. On question answering and fact verification the reported benefit is different in kind — overcoming hallucination and error propagation by interacting with an API, and producing more interpretable trajectories. Attaching 34% to the QA tasks overstates a result measured on specific benchmarks against specific baselines, which is the kind of compression that makes a reader expect more from the technique than it delivers.

### Q3. Your loop has a step cap of 6. Why does it still need a token cap? <!-- id: agent-03-agent-loop-patterns-q03 energy: high -->

- [ ] Because the step cap may be bypassed by parallel tool calls
- [ ] Because token caps are enforced by the provider and step caps are not
- [x] Because each iteration appends to the message history, so a bounded number of steps with growing context can still be expensive — steps and tokens are different resources
- [ ] Because the model may generate more tokens than the schema allows

**Why:** The two caps prevent different failures: the step cap bounds iteration count and the token cap bounds spend, and neither implies the other. Context grows across a run as every thought, call and result is appended, so six iterations carrying large tool results can cost far more than fifteen carrying small ones. The step cap is enforced in your code, which is what makes it reliable, and parallel calls still count as actions within a step.

### Q4. When does reflection make an agent perform *worse* than simply retrying? <!-- id: agent-03-agent-loop-patterns-q04 energy: high -->

- [ ] When the task is too easy, so reflection is unnecessary
- [ ] When the model is too small to produce coherent text
- [ ] When the reflection buffer is stored in memory rather than on disk
- [x] When there is no reliable failure signal, so the reflection guesses at the cause and a confident wrong explanation misdirects the next attempt

**Why:** The reflected text is generated by the model that made the mistake, reasoning about an outcome it cannot reliably assess. With no external signal — no tests, no schema, no verifiable answer — the reflection invents a plausible cause, and a stored wrong explanation is actively harmful because it steers the next attempt away from a correct approach. Task difficulty is irrelevant to the mechanism, and the storage location affects durability rather than correctness.

### Q5. Why are coding agents unusually well suited to reflection? <!-- id: agent-03-agent-loop-patterns-q05 energy: normal -->

- [x] Because running tests supplies an automatic, external and unarguable failure signal, which is exactly what reflection requires
- [ ] Because code is shorter than prose and therefore cheaper to reflect on
- [ ] Because programming languages are unambiguous while natural language is not
- [ ] Because models were trained predominantly on code

**Why:** The pattern needs a reliable failure signal, and code has one built in: the tests pass or they fail, and no amount of confident reasoning changes that. Reflexion's reported 91% pass@1 on HumanEval is a coding result on a benchmark with automatic verification, and it should be read in that light rather than as a general claim that agents can improve themselves. Length and training-data composition are not the mechanism, and natural-language ambiguity is a separate issue from signal reliability.

### Q6. A model is asked to assess whether its own answer is correct, with no external check. What is the main problem? <!-- id: agent-03-agent-loop-patterns-q06 energy: normal -->

- [ ] It cannot produce an assessment at all without a rubric
- [ ] It will refuse to assess its own output
- [x] It tends to approve of its own work, so a self-reported success is close to worthless without an external verification
- [ ] It will assess correctly but at excessive token cost

**Why:** This is the sycophancy documented in the judging literature, and it is why Phase 7 requires success to be checked in code rather than accepted from the agent's self-report. A model that can be wrong can also be wrong about whether it was wrong, and the two errors are correlated because they come from the same source. Models produce self-assessments readily; the issue is their reliability, not their availability.

### Q7. Your plan-and-execute agent's plan step 1 fails twice. What should happen? <!-- id: agent-03-agent-loop-patterns-q07 energy: high -->

- [ ] Continue to step 2, since the plan was reviewed and approved
- [ ] Retry step 1 with a longer timeout until it succeeds
- [ ] Abandon the task and report failure to the user
- [x] Replan, because the plan was built from what the model knew before it looked and its premise may now be known to be wrong

**Why:** A plan is constructed from prior assumptions, so a step failing twice — or an observation contradicting those assumptions — is evidence the plan is unsound rather than evidence that one step is unlucky. Pushing on spends every remaining step on a course of action already indicated to be wrong, which is the characteristic plan-and-execute failure. Replanning uses the new information, which is the whole reason the plan is explicit and inspectable rather than internal.

### Q8. You have one capable model call and one cheap one for a plan-and-execute task. Where should the capable model go? <!-- id: agent-03-agent-loop-patterns-q08 energy: normal -->

- [ ] On execution, since that is where the user-visible output is produced
- [x] On planning, because an error in the plan propagates into every subsequent step
- [ ] On whichever step uses the most tokens
- [ ] It does not matter as long as both are used consistently

**Why:** The plan is the highest-leverage artefact: get it wrong and every execution step inherits the mistake, while a slightly weaker execution of a correct plan is usually recoverable. This is the direct inversion of the common instinct to spend the good model on the output. Token volume is a cost signal rather than an impact signal, and consistency of model choice is a separate concern from where capability matters most.

### Q9. What is the correct response when loop detection fires? <!-- id: agent-03-agent-loop-patterns-q09 energy: normal -->

- [ ] Terminate immediately and return a generic error
- [x] Tell the model it has repeated the same call with identical arguments and that repeating it will not change the result, so it should try a different approach or report the blocker
- [ ] Reset the conversation and start the task over
- [ ] Increase the step cap so the model has room to find a way forward

**Why:** Informing the model converts a stuck loop into a recoverable one, because a model told precisely what it is doing wrong frequently changes approach on the next iteration — the same principle as Phase 2's actionable tool errors. Silent termination discards the one piece of information that could have unblocked it, resetting loses all accumulated progress, and raising the cap gives a stuck model more opportunities to repeat itself at greater expense.

### Q10. Which question decides whether you need a loop rather than a pipeline? <!-- id: agent-03-agent-loop-patterns-q10 energy: low -->

- [ ] Whether the task involves more than one tool
- [ ] Whether the task takes longer than one model call
- [x] Whether the next step genuinely depends on what you learn from the previous one
- [ ] Whether the model is capable enough to plan

**Why:** Dependency of the next action on the previous observation is the structural property that requires a loop; without it, the sequence is fixed and a pipeline is cheaper, faster, more predictable and easier to test. Tool count and call count are consequences rather than causes — a two-tool task with a fixed sequence is still a pipeline — and model capability affects how well a loop performs, not whether the task's structure calls for one. This is Phase 1's leftmost-position rule, restated for pattern choice.

## You're ready to move on when...

You have a ReAct loop with a trace you can read, and you have annotated a real trajectory to show where a thought changed the next action. You have also run it with no caps on a task it cannot complete, and recorded what that cost — because the evidence for the controls is the baseline without them.

All six controls are implemented and each has been verified by an input you constructed to trip it, with the configured values recorded. Your loop detector normalises arguments, fires on a genuine stall, and does not fire on legitimate repeated reads. Your trace table gives you steps per task, cost per task and repeated-call rate.

You have compared ReAct against plan-and-execute on the same task set and can say which is more predictable and by how much. You can name the failure signal reflection depends on, and you have run reflection **both** with a reliable signal and without — quoting at least one confidently wrong reflection from the second case and explaining why storing it made the next attempt worse.

And you have applied the four selection questions to three of your own tasks, including one where the honest answer is that a single call would do.

## Free vs Paid

### What's free is enough

The whole phase, and this one has a specific structural advantage for a local setup.

Everything here is ordinary Python: the loop, six controls, a detector, a tracer and a trace table. Local models run the experiments, and reflection is particularly well served because it needs **repeated attempts** — the same task run many times to compare first-attempt against post-reflection pass rates. That is the high-volume low-stakes shape a local model carries and a paid meter rations, which Phase 7 of Cost argued for evaluation harnesses generally.

The failure-signal experiment is free and is the phase's most valuable output: writing code and running tests gives you a reliable signal, and `pytest` is free. That experiment teaches the pattern's central requirement more convincingly than any description, and it costs nothing.

The papers — ReAct, Reflexion, plan-and-solve, Tree of Thoughts, the agent survey — are all on arXiv, and the engineering write-ups are free pages.

**One honest caveat specific to this phase.** Small local models are weaker at the two things loops depend on most: producing well-formed tool calls (Phase 2) and reasoning usefully about what to do next. That will show up as loops that wander, plans that miss obvious steps, and reflections that name the wrong cause. **This is a limitation of your test subject, and it is also the best possible teaching material** — the failure modes this phase documents are exactly the ones a weak model exhibits readily, and a learner who has watched a model reflect confidently and wrongly understands the requirement in a way that reading about it does not deliver.

### What a paid tier adds

Three things, and the first is the one that determines whether a given loop works at all.

**Higher per-step reliability, which compounds through the loop.** This is the big one, and Phase 1's arithmetic says why: at 95% per step over ten steps the task succeeds about 60% of the time, and at 99% it succeeds about 90%. A frontier model does not merely make each step nicer; it moves the whole loop from unreliable to viable. This is the clearest case in the track where the capability gap is structural rather than cosmetic.

**Coherent multi-step planning.** Producing a plan that survives contact with execution needs reasoning quality that small models often lack, and a bad plan is worse than no plan because it commits every subsequent step to a wrong course.

**Reliable reflection.** A capable model's reflection on a genuine failure signal is a real improvement; a weak model's reflection on the same signal is frequently noise. Since reflection requires a signal anyway, the paid tier compounds the benefit rather than substituting for it.

**What money does not buy** is the diagnosis of whether you needed any of this. The pattern choice, the six controls, the failure-signal requirement and the decision that a single call would suffice are all judgements. A frontier model inside an unnecessary reflection loop with no failure signal is an expensive way to guess — and it will guess confidently, which is worse.

**Volatile, dated: as of 2026-09, which models can drive a given loop reliably, what they cost per step, and what context they support all change on the order of months. Measure success rate and cost per task on your own suite rather than trusting any figure, including those in this lesson, whose percentages come from the papers' own benchmarks rather than your workload.**

### When it's worth paying

**Not for this phase.** Every task runs locally, and the deliverables are a tracer, an experiment table, a reflection demonstration and a decision.

The threshold is measurable rather than intuitive, and the trace you built is the instrument: **when your loop is failing at a per-step rate that compounds into an unusable task success rate, and you have already reduced the step count to its minimum.** Both halves are required. If your loop takes fifteen steps when four would do, fixing that is free and may be sufficient — Phase 1 established that fewer steps raises end-to-end reliability without touching the model. If your steps are already minimal and each is individually below the reliability the task needs, you have isolated a capability gap, and one paid comparison on your own suite is a decision-changing experiment in Phase 7 of Cost's sense. Note that reflection is not the answer here: if a step fails because the capability is absent, reflecting on the failure will not supply it.
