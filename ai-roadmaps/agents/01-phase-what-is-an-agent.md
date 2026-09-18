---
id: agent-01-what-is-an-agent
track: agents
phase: 1
order: 10
title: What an Agent Actually Is
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal]
deliverable: portfolio/agents/01-what-is-an-agent.md
exit_criteria: >
  You can take any system described as "agentic" and identify whether it has a
  loop and a stopping condition, place it on the spectrum from fixed pipeline to
  autonomous loop, and argue for the leftmost point that solves the problem.
---

# Phase 1 — What an Agent Actually Is

## Goal of this phase

The word "agent" has become the most overloaded term in this field. It is used for a single API call with a tool attached, for a fixed three-step pipeline, for a chat assistant with memory, and for a system that runs unattended for hours. Those four things have almost nothing in common, and the confusion is expensive: people build loops where a pipeline would do, then discover that loops amplify errors as readily as capability.

This phase strips the term back to a mechanism. By the end you will be able to look at any system — yours or one you are evaluating — and say precisely where it sits on a spectrum from fixed pipeline to autonomous loop. You will know the two structural features that make something an agent rather than a program, why removing either one breaks it in a specific and predictable way, and why the correct engineering instinct is almost always to move **left** on that spectrum rather than right.

This is a definitional and conceptual phase with very little code. That is deliberate. The rest of the track teaches you to build loops, isolate context, manage state, gate dangerous actions and evaluate the result — and all of it is easier to get right if you first decide, honestly, how much loop you actually need.

## Estimated time

**1 week** at 1–2 hours a day, 5 days. Roughly 6–8 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Part 1: the two features that make an agent | 1.5h |
| 2 | Part 2: the spectrum, and the case for the leftmost point | 1.5h |
| 3 | Part 3: what loops amplify — capability and error | 1.5h |
| 4 | Part 4: recognising the failure modes, and where the definition breaks | 1.5h |
| 5 | Deliverable: classify real systems and justify your own design | 1.5h |

If you only have three hours this week, do tasks 1, 2, 5 and 8. Those classify real systems, measure a loop against a pipeline, and produce your own justified design.

The tasks are analytical rather than computational, which is why this phase takes less time than its length suggests. You are training a judgement, not building a system.

## Skills you'll gain

- Define an agent as a loop around a model with tool schemas and a stopping condition.
- Tell an agent from a pipeline, and explain what each is for.
- Place a system on the agentic spectrum and argue for moving left.
- Predict how loops amplify error as well as capability, and quantify it roughly.
- Recognise runaway loops, and the four stopping conditions that prevent them.
- Identify when a task is being made agentic for appearance rather than need.
- Explain why "it uses tools" does not make something an agent.
- State where the loop framing stops being useful: when the hard part is not the loop.

## Specific topics to learn

### The mechanism, stripped of marketing

- The **loop**: the model's output can change what happens next, and then the model runs again.
- The **tool schemas**: the actions the loop can take, declared in advance.
- The **stopping condition**: what ends the loop, decided before it starts.
- Why all three are required, and what breaks when one is missing.
- Why "it calls a tool" is not sufficient — a single call is not a loop.

### The spectrum

- Fixed pipeline: no decisions, deterministic sequence.
- Single tool call: one decision, then a fixed path.
- Bounded loop: the model chooses actions, with a hard cap.
- Autonomous: long-running, self-directed, open-ended.
- Why the leftmost sufficient point is the correct engineering choice.
- The cost of moving right: latency, money, unpredictability, debuggability.

### What loops amplify

- Compounding error: a per-step accuracy that decays multiplicatively.
- The arithmetic of a 95% reliable step over ten steps.
- Why a loop can reach answers a pipeline cannot, and the price of that reach.
- Variance: the same task giving different trajectories on different runs.
- Non-determinism in debugging: the same input producing different failures.

### Stopping conditions

- Step cap: the blunt, reliable backstop.
- Cost and token caps: the ones that protect your money.
- Wall-clock timeout: the one that protects the user's patience.
- Loop detection: repeated identical calls.
- Success detection: how the loop knows it is done, and why that is harder than it looks.
- Why "the model decides it is finished" is a stopping condition with a failure mode.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| A local model via Ollama | Run a small loop many times to observe variance without a meter | Free/open-source | https://ollama.com/ | Task t05 — run the same task 10 times and count how many trajectories differ | A free hosted tier, checked for rate limits first |
| Python (standard library) | A loop is `while`, a list, and a function call — no framework needed | Free/open-source | https://docs.python.org/3/ | Tasks t04, t05 — build the minimal loop and the same task as a pipeline | Any language |
| `requests` | Call a provider API directly so the loop's mechanics are visible | Free/open-source | https://requests.readthedocs.io/ | Task t04 — write the loop against raw HTTP rather than an abstraction | Python's `urllib.request` |
| A spreadsheet (LibreOffice Calc) | Model compounding error: step accuracy against loop length | Free/open-source | https://www.libreoffice.org/discover/calc/ | Task t06 — compute end-to-end reliability at 95% per step for 1, 5, 10, 20 steps | Google Sheets free tier, or a three-line Python script |
| `time` / a stopwatch | Measure the wall-clock cost of one extra loop iteration | Free | https://docs.python.org/3/library/time.html | Task t07 — measure latency per iteration and multiply by your step cap | Your own observation and a phone timer |
| Git | Keep the pipeline version and the agent version side by side | Free/open-source | https://git-scm.com/ | Task t08 — diff a task's pipeline implementation against its loop implementation | Any version control |

## Free/cheap resources

- **Yao et al. — ReAct: Synergizing Reasoning and Acting in Language Models (arXiv:2210.03629)** — https://arxiv.org/abs/2210.03629
- **Shinn et al. — Reflexion: Language Agents with Verbal Reinforcement Learning (arXiv:2303.11366)** — https://arxiv.org/abs/2303.11366
- **Xi et al. — The Rise and Potential of Large Language Model Based Agents (arXiv:2309.07864)** — https://arxiv.org/abs/2309.07864
- **Model Context Protocol** — https://modelcontextprotocol.io/
- **Ollama documentation** — https://github.com/ollama/ollama/tree/main/docs
- **Anthropic — Building effective agents** — https://www.anthropic.com/engineering/building-effective-agents

## Lesson: A Loop, Some Tools, and a Way Out

### Part 1 — The two features, and why both are required

Strip away the branding and an agent is three things: **a loop around a language model, a set of tool schemas, and a stopping condition.** That is the whole definition, and the useful part is understanding what breaks when you remove any one of them.

**The loop** is the defining feature. It means the model's output determines what happens next, and then the model runs again with the result. Concretely:

```python
while not done:
    response = model(messages)          # the model decides
    if response.tool_call:              # it chose an action
        result = execute(response.tool_call)   # YOUR code runs it
        messages.append(result)         # the result goes back in
    else:
        done = True                     # no action requested
```

The critical property is that **the number of model calls is not fixed in advance.** A pipeline runs a known sequence of steps; a loop runs until something stops it. That is the difference, and it is the difference that matters.

**The tool schemas** are the actions the loop can choose from, declared before it runs. This is what makes the loop useful rather than merely repetitive: without tools the model can only produce text, and re-running a model on its own text with no new information is a very expensive way to think. Tools are how the loop acquires information it did not have.

**The stopping condition** is what ends it. This deserves more emphasis than it usually gets, because it is the component people omit and it is the one whose absence is catastrophic.

Now the part that is usually glossed: **all three are necessary, and removing each one produces a specific, predictable failure.**

| Missing | What you actually have | How it fails |
|---|---|---|
| **The loop** | A pipeline | Fine — if the task really is a fixed sequence. Brittle if the task needs decisions |
| **The tools** | An expensive way to re-read its own output | Burns tokens producing nothing; no new information enters |
| **The stopping condition** | A **runaway** | Unbounded cost, unbounded latency, potentially unbounded side effects |

**"It uses tools" is not the same as being an agent.** This is the most common confusion, and it comes from a real ambiguity: a single tool call is a decision, so it feels agentic. But if the code path after that call is fixed — call the weather tool, then format the answer — there is no loop. The model made one choice inside a pipeline. That is a pipeline with a model in it, and calling it an agent will lead you to give it a step budget and a cost cap it does not need, and to debug it as though its behaviour were open-ended when it is not.

> Think of the difference as a recipe versus a cook. A recipe is a fixed sequence of steps that produces a predictable result; a cook looks in the fridge, decides what is possible, tastes as they go, and stops when the dish is right. The cook is more capable and much harder to schedule. **Most software problems are recipes**, and the enthusiasm for agents has led to a lot of cooking where a recipe would have been faster, cheaper and identical every time.

**Where this definition stops working.** It is a *structural* definition — it tells you what a system is made of, not how well it works. Two systems can both have a loop, tools and a stopping condition while one is a research demo and the other is reliable production software. The definition also says nothing about **who decides the goal**: a tightly-scoped loop solving one task and an open-ended assistant pursuing a user's vague intention share the same three components and are wildly different engineering problems. Everything after this phase is about closing that gap.

### Part 2 — The spectrum, and why left is usually right

"Agentic" is not a binary. It is a spectrum, and the single most valuable habit this phase can give you is **choosing the leftmost point that solves the problem.**

| Position | What it is | Model calls | Predictability |
|---|---|---|---|
| **1. Fixed pipeline** | Deterministic sequence; the model does not choose the path | Fixed | Total |
| **2. Single tool call** | One decision, then a fixed path | 1–2 | High |
| **3. Bounded loop** | The model chooses actions, with a hard cap | Variable, capped | Moderate |
| **4. Autonomous** | Long-running, self-directed, open-ended | Unbounded in principle | Low |

**Why moving right is costly, in five specific ways.**

**Latency compounds.** Every iteration is a full model round-trip. A five-step loop on a slow model is five sequential waits, and the user experiences the sum. Phase 3 of Cost covered this arithmetic for pipelines; loops make it worse because the count is not known in advance.

**Cost compounds, and unpredictably.** You cannot price a loop the way you price a pipeline, because the number of calls depends on what the model decides. Phase 5 of Cost's discipline — caps and logging — exists precisely because loops make the bill a random variable.

**Reliability decays.** Part 3 does the arithmetic, but the headline is that a per-step accuracy of 95% is not 95% end to end, and the decay is steep.

**Debuggability collapses.** A pipeline failure reproduces: same input, same path, same bug. A loop's failure may not reproduce at all, and even when it does, you are reading a trajectory rather than a stack trace — and the trajectory is generated text that may look reasonable at every step while being wrong overall.

**Variance becomes a product property.** Two runs of the same request can take different paths and produce different answers. For a demo that is fine. For a product it means your users do not have a reliable tool, and Phase 7's evaluation content exists because measuring a variable system needs different statistics.

**The argument for the leftmost point, stated plainly.** Position 1 and 2 are cheaper, faster, more predictable, and easier to test. A loop should be adopted when the task **requires decisions you cannot enumerate in advance** — not when it would be impressive, and not because the marketing of the field rewards the word. The honest question is: *which step in this task cannot be decided ahead of time?* If you can answer that, you know whether you need a loop and where. If you cannot answer it, you do not yet understand the task well enough to build the loop, and a pipeline will teach you faster.

**The reframe that makes this practical.** Instead of asking "is this agentic enough?", ask "what is the fixed version, and what specifically does it fail at?" Build the pipeline first. It is a working baseline, it is testable, and it fails in ways you can observe. Then add the minimum loop that fixes the observed failure — usually a bounded loop at exactly one step in the sequence, not a rewrite of the whole thing as autonomous.

**Where the spectrum framing stops working.** It implies smoothness, and the jump from 3 to 4 is a genuine discontinuity rather than an increment: a bounded loop has a cost ceiling and a terminating guarantee, and an autonomous system's *defining* property is that it does not. Treating position 4 as "a bigger version of 3" is how people end up with an unattended system and no cap. And the spectrum measures *autonomy*, not value — a fixed pipeline solving a real problem is worth more than an autonomous demo of nothing.

### Part 3 — What loops amplify, in both directions

Here is the part that repays the analytical effort, because the arithmetic is simple and its consequences are not.

**A loop amplifies capability.** This is why the technique exists. A loop can do things a pipeline cannot: look something up because it needs to, notice that an approach failed and try another, handle an input the designer did not anticipate. ReAct (Yao et al., arXiv:2210.03629) showed the mechanism clearly — interleaving reasoning traces with actions lets the model track and update a plan while gathering information from the environment, and the paper reports it overcoming the hallucination and error-propagation problems that pure chain-of-thought suffers on question-answering and fact-verification tasks. On the interactive decision-making benchmarks (ALFWorld and WebShop) it outperformed imitation and reinforcement-learning baselines by an absolute success rate of **34%** and **10%** respectively. Note the scoping: the large percentages are the interactive-benchmark results, not the QA results, whose gain is about hallucination and error propagation.

**A loop also amplifies error.** This is the part that is understood less well, and it is just compounding probability.

If each step independently succeeds with probability *p*, then a task requiring *n* steps succeeds with probability *pⁿ*:

| Per-step reliability | 1 step | 5 steps | 10 steps | 20 steps |
|---|---|---|---|---|
| 99% | 99.0% | 95.1% | 90.4% | 81.8% |
| 95% | 95.0% | 77.4% | 59.9% | 35.8% |
| 90% | 90.0% | 59.0% | 34.9% | 12.2% |
| 80% | 80.0% | 32.8% | 10.7% | 1.2% |

Read the 95% row. A step that is right nineteen times in twenty looks like a reliable component, and a ten-step loop built from it succeeds **about 60% of the time** — which is not a product. The same arithmetic is why a pipeline is more robust: its failure points are fewer and, more importantly, **fixed and testable**, so you can measure each one rather than inferring an aggregate.

**Three caveats, because the model is a simplification and it matters that you know how.**

**Steps are not independent.** In practice a well-designed loop recovers from some failures — that is much of the point — so real success rates are better than pure *pⁿ*. The formula is an upper bound on failure, not a prediction.

**Not all steps are equally critical.** A loop where only three steps can actually fail is roughly a three-step problem, however many iterations it runs. Identify the critical steps and the arithmetic becomes useful rather than alarming.

**The model also gets *more* capable with information.** A later step with good tool results is easier than the same step without them, so *p* is not constant. This cuts in your favour and is the strongest argument for tools being genuinely informative rather than decorative.

**What this predicts, and the practical upshot.** If someone tells you a loop "just works", the useful question is *how many steps, and how reliable is each?* You now have the arithmetic to check. And the design consequence is direct: **fewer steps is a reliability feature, not just a cost saving.** A three-step loop at 95% per step succeeds about 86% of the time; a ten-step loop at the same per-step reliability succeeds about 60%. If you can achieve the task in three steps instead of ten, you have bought a large reliability improvement without touching the model — which is exactly why the phase's central recommendation is to move left on the spectrum.

**Where this stops working.** The arithmetic models **sequential dependency**, where each step needs the last to have succeeded. A loop with independent sub-tasks does not compound the same way, and a loop with a verification step can catch and retry a failure — which breaks the chain rather than multiplying through it. Reflexion (Shinn et al., arXiv:2303.11366) is precisely the pattern of using a failure signal to reflect and retry, and it is why Phase 3 will insist that reflection needs a *reliable* failure signal: without one, you are compounding guesses rather than correcting errors.

### Part 4 — Stopping conditions and the failures they prevent

If the loop is what makes an agent capable, the stopping condition is what makes it safe to run. Four are worth having, and they protect against different things.

**A step cap** is the blunt, reliable backstop. It bounds iterations absolutely, and it is the one control that cannot be defeated by a model behaving unexpectedly. Set it from measurement, not intuition: run the task a few times, see how many steps it typically takes, and set the cap at a small multiple. A cap of 25 when the task takes 4 steps is not caution, it is an unbounded bill with extra steps.

**Cost and token caps** protect your money. Loops can consume a surprising amount of context because every iteration appends to the message history — Phase 5 of Cost's logging discipline is what makes this visible rather than theoretical. Note that a step cap does **not** bound cost on its own, because a single step can carry a very large context.

**A wall-clock timeout** protects the user's patience. A loop that is making progress slowly is still, from the user's perspective, a system that has not answered. This cap is about experience rather than money, and it is the one most often forgotten.

**Loop detection** catches the specific pathology of repeating an identical action and expecting a different result. A model that has called the same tool with the same arguments three times is stuck, and more iterations will not help. Detect it on the tool name plus normalised arguments, break the loop, and report the impasse rather than burning the remaining budget.

**And then the hard one: detecting success.** "Stop when the model says it is finished" is a stopping condition, and it has a serious failure mode — the model can believe it succeeded when it did not. Phase 7 of this track builds the evaluation apparatus for exactly this problem, and the principle to carry forward now is: **the most reliable success signal is one you check in code**, not one the model asserts. If a test passes, the task succeeded. If the model says "done", you have a claim.

**The failure this prevents is worth naming concretely**, because "runaway" sounds abstract until you see the mechanism. Consider a loop whose stopping condition is the model reporting completion, with no cap. A model that is confused about its own progress — or that has been given a task it cannot complete — will continue producing plausible actions indefinitely. Every iteration appends to the context, the context grows, cost grows with it, and nothing in the system says stop. This is not a hypothetical edge case; it is the default behaviour of a loop without a cap, and the only reliable defence is a cap that does not depend on the model's judgement.

**Where this stops working.** A cap is a backstop, not a strategy. A loop that routinely hits its step cap is a loop that is failing while still spending money — the cap converted a runaway into a slow failure, which is better but is not success. When you see the cap being hit regularly, the diagnosis is that the task is too hard for the loop's tools, or too vague, or that the stopping condition is wrong. Phase 6 of RAG's diagnostic habit applies directly: a cap hit is a symptom, and the cause is upstream.

## Hands-on practice tasks

1. Take five systems described as "agentic" — products, open-source projects, or your own past work — and classify each on the four-position spectrum. Justify each placement with one sentence naming what decides the path. <!-- id: agent-01-what-is-an-agent-t01 band: focused energy: normal -->
2. Pick any system you use and identify its loop, its tools and its stopping condition. If you cannot find one of the three, write down which is missing and what failure that predicts. <!-- id: agent-01-what-is-an-agent-t02 band: quick energy: low -->
3. Write the definition of an agent in your own words in under forty words, then test it against a single-tool-call system and a chat assistant. Does your definition classify both correctly? If not, sharpen it. <!-- id: agent-01-what-is-an-agent-t03 band: quick energy: low -->
4. Write the same small task twice: once as a fixed pipeline with a known sequence, and once as a loop where the model picks each next action. Both must produce an answer. <!-- id: agent-01-what-is-an-agent-t04 band: deep energy: high -->
5. Run the loop version ten times on the same input. Record the number of iterations, the tools called, and whether the answer was correct each time. Note how many trajectories differed. <!-- id: agent-01-what-is-an-agent-t05 band: focused energy: high -->
6. Build the compounding-error table for your own task: estimate per-step reliability and the number of critical steps, then compute end-to-end success. Compare the prediction against your ten runs from task 5. <!-- id: agent-01-what-is-an-agent-t06 band: focused energy: high -->
7. Measure the wall-clock and token cost of one loop iteration, then multiply by your step cap. That is your worst case. Decide whether you would accept it as a user. <!-- id: agent-01-what-is-an-agent-t07 band: focused energy: normal -->
8. Take the loop from task 4 and reduce it to the fewest steps that still solves the task. Measure both accuracy and cost before and after. Fewer steps is a reliability feature. <!-- id: agent-01-what-is-an-agent-t08 band: deep energy: high -->
9. Remove the stopping condition from a copy of your loop, run it on a task it cannot complete, and observe what happens to cost and context until you stop it manually. Do this with a hard external limit you control. <!-- id: agent-01-what-is-an-agent-t09 band: focused energy: high -->
10. Add all four stopping conditions — step cap, token cap, wall-clock timeout, loop detection — and verify each one by constructing an input that trips it. <!-- id: agent-01-what-is-an-agent-t10 band: deep energy: high -->
11. Write down, for your own task, which step genuinely cannot be decided in advance. If you cannot name one, that is your answer: it should be a pipeline. <!-- id: agent-01-what-is-an-agent-t11 band: focused energy: normal -->
12. Find one task in your own work currently solved by a loop that would work as a pipeline. Estimate what you would gain in reliability, cost and debuggability by moving left. <!-- id: agent-01-what-is-an-agent-t12 band: focused energy: normal -->
13. Write your design note: the task, the leftmost position that solves it, the failure you observed that justified any loop, and your stopping conditions. This is the deliverable's spine. <!-- id: agent-01-what-is-an-agent-t13 band: ongoing energy: normal -->

## Common Pitfalls

**Calling a single tool call an agent.** One decision followed by a fixed path is a pipeline with a model in it. The cost of the mislabel is concrete: you give it a step budget and a cost cap it does not need, and you debug open-ended behaviour that is not actually open-ended.

**Adding a loop for appearance rather than need.** Loops are more impressive in a demo and worse in almost every measurable dimension. The honest test is whether you can name the step that cannot be decided in advance — and if you cannot, a pipeline will teach you the task faster and fail in ways you can reproduce.

**Shipping a loop with no stopping condition.** A loop without a cap does not terminate when the model is confused or the task is impossible; it continues producing plausible actions while the context and the bill grow. This is the default behaviour, not an edge case, and no prompt instruction reliably prevents it.

**Setting the step cap by intuition rather than measurement.** A cap of 25 on a task that takes 4 steps is not caution — it is an unbounded bill with extra steps. Measure the typical iteration count, then set the cap at a small multiple.

**Assuming a step cap bounds cost.** It bounds iterations, not tokens. A single iteration can carry a very large context, so a modest step count with growing history can still produce a large bill. Cost caps and step caps protect against different things.

**Trusting the model's report that it finished.** "Done" is a claim, not a verification. The reliable success signal is one you check in code — a test that passes, a state you can inspect — and Phase 7 builds the apparatus for measuring the difference.

**Building a long loop because each step is "reliable enough".** At 95% per step, ten steps succeed about 60% of the time and twenty about 36%. Per-step reliability that looks impressive in isolation rarely survives a long chain, which is why reducing the number of steps is a reliability improvement rather than only a saving.

**Never removing the stopping condition to see what happens.** A cap you have never tested is a cap you do not know works. Construct an input that trips each one — deliberately, in a controlled way — rather than discovering the gap in production.

## Deliverable / proof of work

Write `portfolio/agents/01-what-is-an-agent.md` containing:

- **Your definition** — the mechanism in your own words, tested against at least three systems it should classify correctly, including one that is commonly mislabelled.
- **Five classified systems** — the systems from task 1, each placed on the spectrum with the observation that decided it, and at least one where you conclude a loop was unnecessary.
- **The pipeline and the loop** — both implementations of the same task, with their measured accuracy, cost and latency side by side.
- **The ten runs** — your variance data: iteration counts, tools called, correctness, and how many trajectories differed. This is the section that makes the non-determinism concrete.
- **The error arithmetic** — your per-step reliability estimate, your critical step count, the predicted end-to-end success, and how the prediction compared against observation. Where they disagree, say why.
- **The stopping conditions** — each of the four, its configured value and how you verified it, plus your worst-case cost at the step cap.
- **The justification** — the step in your task that genuinely cannot be decided in advance, and therefore the leftmost spectrum position you chose and why. If the honest answer is "this should be a pipeline", write that and defend it.

## Checklist

- [ ] I can state the three components of an agent and what breaks when each is missing <!-- id: agent-01-what-is-an-agent-c01 energy: normal -->
- [ ] I can tell a pipeline from an agent, and explain why a single tool call is not an agent <!-- id: agent-01-what-is-an-agent-c02 energy: normal -->
- [ ] I can place a system on the four-position spectrum and justify the placement <!-- id: agent-01-what-is-an-agent-c03 energy: normal -->
- [ ] I choose the leftmost position that solves the task, and I can name the step that forced any loop <!-- id: agent-01-what-is-an-agent-c04 energy: high -->
- [ ] I can compute compounding error from per-step reliability and step count <!-- id: agent-01-what-is-an-agent-c05 energy: high -->
- [ ] I have measured variance by running the same task repeatedly, not by assuming it <!-- id: agent-01-what-is-an-agent-c06 energy: normal -->
- [ ] I implement all four stopping conditions and I have verified each one <!-- id: agent-01-what-is-an-agent-c07 energy: high -->
- [ ] I know my worst-case cost at the step cap and would accept it as a user <!-- id: agent-01-what-is-an-agent-c08 energy: normal -->
- [ ] I understand that a step cap does not bound token cost <!-- id: agent-01-what-is-an-agent-c09 energy: normal -->
- [ ] I do not treat the model's "done" as proof of success <!-- id: agent-01-what-is-an-agent-c10 energy: high -->
- [ ] I can explain why fewer steps is a reliability feature rather than only a saving <!-- id: agent-01-what-is-an-agent-c11 energy: normal -->
- [ ] I have written a design note justifying my chosen position on the spectrum <!-- id: agent-01-what-is-an-agent-c12 energy: normal -->

## Quiz

### Q1. A system calls a weather API, then formats the result into a sentence, using fixed code for the formatting. Is it an agent? <!-- id: agent-01-what-is-an-agent-q01 energy: normal -->

- [ ] Yes, because a model decided to call a tool
- [x] No — the model made one decision and the path after it is fixed, so it is a pipeline with a model in it
- [ ] Yes, because tools are what distinguish agents from chatbots
- [ ] No, because agents require more than one tool

**Why:** The defining feature of an agent is a loop, meaning the number of model calls is not fixed in advance. Here the sequence is determined: one decision, then a known formatting step, so there is no loop and the behaviour is fully predictable. "It uses tools" is the most common mislabel in the field, and the cost of accepting it is that you build cost caps and step budgets for a system that has neither, and debug fixed behaviour as though it were open-ended.

### Q2. What does a loop without a stopping condition actually do? <!-- id: agent-01-what-is-an-agent-q02 energy: normal -->

- [ ] It terminates when the model has nothing more to say, so the risk is low
- [ ] It fails immediately with an error, making the problem obvious
- [ ] It falls back to the fixed pipeline path automatically
- [x] It continues producing plausible actions, appending to the context and growing cost, because nothing in the system is capable of saying stop

**Why:** This is the default behaviour rather than an edge case: a confused model, or one given an impossible task, keeps generating reasonable-looking next steps, and every iteration adds to the message history so cost grows alongside the step count. Nothing detects the impasse, because detecting it was the job of the missing component. The "nothing more to say" intuition assumes the model recognises its own lack of progress, which is exactly the judgement a runaway loop has already demonstrated it lacks.

### Q3. Each step of a loop is correct 95% of the time. Roughly what is the end-to-end success rate over ten steps? <!-- id: agent-01-what-is-an-agent-q03 energy: high -->

- [ ] About 95%, since per-step reliability is what matters
- [ ] About 90%, allowing for some variance
- [x] About 60%, because independent per-step reliabilities compound multiplicatively
- [ ] About 99%, because errors are usually corrected downstream

**Why:** 0.95¹⁰ ≈ 0.599, so a component that is right nineteen times in twenty produces a ten-step task that succeeds about three times in five — which is not a product. This is the arithmetic that makes reducing step count a reliability improvement rather than only a cost saving. The 95% option treats the chain as a single step, and the 99% option assumes recovery that a plain compounding model does not include — real loops do recover from some failures, which is why the formula is an upper bound on failure rather than a prediction.

### Q4. You have a task that always requires the same four operations in the same order, but one operation's input depends on a value only known at runtime. What is the right design? <!-- id: agent-01-what-is-an-agent-q04 energy: high -->

- [x] A pipeline with a parameter, since the sequence is fixed — the runtime value is data, not a decision about the path
- [ ] A bounded loop, because runtime-dependent behaviour requires an agent
- [ ] An autonomous agent, to handle any variation safely
- [ ] A loop with a high step cap, to leave room for unexpected cases

**Why:** The distinction is between a value that varies and a *path* that varies. A fixed sequence parameterised by runtime data is a pipeline, and it keeps all the properties that make a pipeline good: reproducible, testable, cheap and fast. Reaching for a loop here buys nothing and costs latency, money, variance and debuggability. The other options mistake "dynamic input" for "dynamic control flow", which is the confusion that leads to agents where pipelines belong.

### Q5. Why is a step cap insufficient to bound your bill? <!-- id: agent-01-what-is-an-agent-q05 energy: normal -->

- [ ] Because steps can be retried internally without counting
- [ ] Because the cap is enforced by the model rather than by your code
- [x] Because a single iteration can carry a very large context, so modest step counts with growing history can still be expensive
- [ ] Because token cost is fixed per call regardless of context length

**Why:** Step caps bound iterations and cost caps bound tokens, and they protect against different things — which is why both are on the list. Every iteration appends to the message history, so context grows across a run, and one step carrying a large context can cost more than many small ones. The cap is enforced by your code, which is what makes it reliable, and retries do count as further model calls.

### Q6. The ReAct paper reports absolute success-rate improvements of 34% and 10%. What are those figures from? <!-- id: agent-01-what-is-an-agent-q06 energy: high -->

- [ ] Question answering and fact verification, against chain-of-thought baselines
- [x] Interactive decision-making benchmarks — ALFWorld and WebShop — against imitation and reinforcement-learning baselines
- [ ] A single average across all four tasks the paper evaluates
- [ ] Summarisation and translation tasks against supervised fine-tuning

**Why:** The paper's largest reported numbers come from the two interactive decision-making benchmarks, where ReAct outperformed imitation and RL methods by those absolute margins. On the question-answering and fact-verification tasks the reported benefit is different in kind — overcoming the hallucination and error-propagation problems that affect pure chain-of-thought by interacting with an API. Keeping the figures attached to the right tasks matters, because quoting 34% as a general agent improvement overstates a result that was measured on specific benchmarks with specific baselines.

### Q7. Which of these is the strongest signal that a loop has finished successfully? <!-- id: agent-01-what-is-an-agent-q07 energy: normal -->

- [ ] The model states that the task is complete
- [ ] The loop has run more than the typical number of steps
- [x] A check in code passes — a test succeeds or the resulting state is verified
- [ ] No further tool calls were requested

**Why:** The model's report is a claim generated the same way its answers are, and the failure mode of a loop is precisely that it believes it succeeded when it did not — the impossibility test in Phase 7 exists for this reason. A code check is external to the model and cannot be talked out of its verdict. Running longer than typical suggests something is wrong rather than right, and the absence of further tool calls is a formatting behaviour rather than evidence about the world.

### Q8. Why does moving right on the agentic spectrum make debugging harder? <!-- id: agent-01-what-is-an-agent-q08 energy: normal -->

- [x] The path is chosen at runtime and may not reproduce, so you read a generated trajectory instead of a stack trace — and every step can look reasonable while the whole is wrong
- [ ] Because agents cannot be logged
- [ ] Because tool calls hide their inputs from the developer
- [ ] Because models change between runs and invalidate the logs

**Why:** A pipeline failure reproduces: same input, same path, same bug, and the stack trace names the line. A loop's path depends on model decisions, so the same input may not produce the same failure, and what you inspect is a sequence of plausible-looking steps whose reasoning is itself generated text. Logging is not the obstacle — thorough tracing is mandatory loop hygiene — and tool inputs are fully visible to your code, which is what executes them.

### Q9. A loop you built is hitting its step cap regularly but not erroring. What does that indicate? <!-- id: agent-01-what-is-an-agent-q09 energy: high -->

- [ ] The cap is set too low and should be increased
- [ ] The model needs a larger context window
- [ ] Nothing — hitting the cap is the cap working as designed
- [x] The cap has converted a runaway into a slow failure, which is a symptom that the task is too hard for the available tools, too vague, or has a wrong stopping condition

**Why:** A cap is a backstop, not a strategy. Hitting it consistently means the loop is failing while still spending money, which is better than an unbounded runaway and still not success. Raising the cap treats the symptom by removing the signal, and a larger context window does not address a task the tools cannot complete. The diagnostic habit from RAG Phase 6 applies: a cap hit is a symptom, and the cause is upstream.

### Q10. What is the phase's central design recommendation? <!-- id: agent-01-what-is-an-agent-q10 energy: low -->

- [ ] Build autonomous agents and constrain them afterwards with caps
- [ ] Use a loop whenever the task involves a model and tools
- [ ] Prefer agents because they generalise better to inputs you did not anticipate
- [x] Build the fixed version first and add the minimum loop that fixes an observed failure — choose the leftmost point on the spectrum that solves the problem

**Why:** The recommendation is an ordering that produces evidence. A pipeline is a working, testable baseline that fails in reproducible ways, so building it first tells you which step genuinely needs a decision — and often the answer is that none does. Adding the minimum loop keeps the reliability, cost and debuggability you already had. Building autonomous first and capping afterwards means starting from the least predictable end, with a cap that hides failures rather than preventing the need for them.

## You're ready to move on when...

You can take any system described as agentic and say, in one sentence, whether it has a loop and a stopping condition, and where it sits on the spectrum. You can define an agent in your own words and your definition correctly classifies a single-tool-call system as not one.

You have built the same task twice — once as a pipeline, once as a loop — and measured accuracy, cost and latency for both. You have run the loop ten times and can describe its variance from data rather than intuition. You can compute compounding error from per-step reliability and say why reducing step count improves reliability rather than only reducing cost.

You implement all four stopping conditions, you have verified each by tripping it deliberately, and you know your worst-case cost at the step cap and would accept it as a user. And you can name the step in your own task that genuinely cannot be decided in advance — or state, with justification, that the honest answer is a pipeline.

## Free vs Paid

### What's free is enough

This phase is fully free, and unusually so, because it is mostly thinking and measuring rather than generating.

The loop is a `while` statement, a list of messages, and a function call — no framework, and building it yourself is the point, because a framework would hide the mechanism this phase exists to teach. Your local model runs the ten-repetition variance test without a meter, which matters more here than anywhere: measuring variance needs **many runs**, and that is exactly the high-volume low-stakes workload a local model carries and a paid meter punishes. The compounding-error table is a spreadsheet or three lines of Python. The design note is prose.

The papers are on arXiv. The Anthropic engineering post on building effective agents is a free page and is worth reading alongside this phase. Everything the deliverable asks for — a definition, five classified systems, two implementations, ten runs, an arithmetic table, four stopping conditions and a justification — is producible on a laptop with no account anywhere.

**And the free path has a specific advantage for the variance work.** Running the same task ten or twenty times to characterise a loop is the only way to see non-determinism, and it is precisely the kind of repeated measurement that a paid tier would make you ration. Phase 7 of Cost made this argument for evaluation harnesses; here it applies to characterising a single system.

### What a paid tier adds

Two things, and neither is required for this phase.

**A stronger model, which changes the per-step reliability term.** This is the real one, and it is worth being precise about why it matters less than it sounds. A better model raises *p*, and the compounding table shows how much that buys: going from 90% to 99% per step turns a ten-step task from roughly 35% to roughly 90%. That is a large effect — but so is going from ten steps to five at constant *p*, and step reduction is free. **Reach for the cheaper lever first.**

**Longer, more reliable loops.** Tasks that need many steps, or that require careful multi-step reasoning inside each step, are where a frontier model's advantage shows up. This is the capability gap Phase 5 of Cost described, and it is genuine — some loops simply do not work with a small local model, and no amount of design compensates.

**What money does not buy here** is the judgement this phase trains. Whether a task needs a loop at all, which position on the spectrum is leftmost-sufficient, and what stopping conditions to set are decisions that a stronger model does not make for you. A frontier model inside an unnecessary loop is still an unnecessary loop, now with a larger bill.

**Volatile, dated: as of 2026-09, which models are strong enough to run a given loop reliably, and what that costs, changes on the order of months. Check current model lists and pricing rather than any summary, including this one.**

### When it's worth paying

**Not for this phase.** Every task runs locally and the deliverables are analysis, measurement and prose.

The threshold is specific and it is the same one the whole track uses: **when you have a loop that is failing for capability reasons rather than structural ones.** If you have reduced the step count to its minimum, given the loop the tools it needs, set proper caps, and your local model still cannot complete steps a stronger one would, then you have found a genuine capability gap — and one paid run settles it, because you are testing a specific hypothesis rather than exploring. If instead your loop is failing because it takes fifteen steps when three would do, or has no cap and wanders, a better model will not fix it. It will produce more convincing wandering.
