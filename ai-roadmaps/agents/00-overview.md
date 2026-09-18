# Agents & Tools — Track Overview

## What this track is for

An agent is a loop around a model, with tools and a stopping condition. That is the whole definition, and stripping the marketing away from it is where this track starts.

Everything interesting follows from that definition. A loop **amplifies capability and error equally** — an agent that is 90% reliable per step is roughly 35% reliable over ten steps. So this track is as much about containment as it is about capability: step caps, cost caps, loop detection, human approval gates, and evaluation that checks success in code rather than trusting the agent's own report.

By the end you will be able to build an agent that does something useful, and — more importantly — to tell whether it actually worked. That second skill is rarer than the first and is what employers are looking for.

The track also covers **MCP**, the open standard for connecting models to tools. Writing a small MCP server is one of the best portfolio projects available at zero cost, and Phase 7 treats it that way.

## Who this suits

You need **Prompting Phases 4 and 6** absolutely — tool calling is structured output inside a loop, and chaining is the mental model for multi-step execution. **Foundations Phase 3** matters for context management, and Phase 5 for sampling.

You should be **comfortable writing and debugging Python**. This is the most code-heavy track in the curriculum before Vibecoding. You will write tool schemas, validate arguments, handle errors returned into a loop, and build a small server.

Be warned: this track has a **disproportionate capacity to burn free-tier quota**. An agent makes many model calls per task, and a loop that does not terminate makes them indefinitely. Phase 6 is not optional reading — it is what keeps a free tier usable, and its caps discipline is a prerequisite for the rest of the track in practice.

## What you need before starting

- **Prompting complete**, or at least Phases 4 and 6.
- **Foundations Phase 3**, for the context budget.
- **Python 3** with the ability to install packages.
- **A free hosted tier and, strongly recommended, a local model.** Local models make agent iteration affordable, because agent development involves a great deal of repeated running.
- **Roughly 1–2 focused hours a day, five days a week.**

Everything is achievable at zero cost. The practical constraint is quota, not money, and the track addresses it directly.

## The phases, in order

| # | Phase | Length | What it establishes |
|---|---|---|---|
| 1 | What an Agent Actually Is | 1 week | The loop, the tools and the stopping condition — and why "agentic" is a spectrum, not a category |
| 2 | Tool Calling Mechanics | 1 week | Schemas, argument validation, and the fact that **your code executes and the model never does** |
| 3 | The Agent Loop and Planning | 1 week | ReAct, loop hygiene as mandatory rather than optional, and self-reflection that needs a real failure signal |
| 4 | Subagents and Context Isolation | 1 week | Why context isolation is the strongest argument for subagents, and what a complete brief costs you |
| 5 | Memory and State in Agents | 1 week | Working, episodic, semantic and procedural memory, and the robustness of externalising state to files |
| 6 | Agent Safety and Human Approval | 1 week | Approval gates, sandboxing, least privilege, and indirect prompt injection as a structural risk |
| 7 | MCP and Evaluating Agents | 2 weeks | The integration standard, plus how to measure whether an agent works — with failure taxonomy and pass^k |

**Read them in order.** Phases 1–3 build the loop, 4–5 scale it, 6 contains it, and 7 measures it and connects it to the outside world.

Phase 6 is the one people skip and should not. If you build the agent before you build the guardrails, you will learn why the hard way.

## What you will be able to do at the end

- Define an agent precisely and explain why a pipeline is often the better engineering choice.
- Write tool schemas, validate arguments in code, and return errors into the loop so the agent can recover.
- Explain why the model never executes anything, and design accordingly.
- Implement an agent loop with all five mandatory guards: step cap, token/cost cap, timeout, loop detection and tracing.
- Explain why self-reflection needs a reliable failure signal, and why tests provide one.
- Use a subagent for context isolation, with a brief complete enough that the subagent needs no shared memory.
- Externalise agent state to files so it survives compaction and session boundaries.
- Build an approval gate that shows the **exact** action, and explain why a gate users click through reflexively is theatre rather than safety.
- Explain indirect prompt injection and instruction hierarchy, and design with defence in depth.
- Run a small MCP server and describe what the protocol does and does not give you.
- Evaluate an agent on a fixed task suite, check success in code, and report pass^k rather than a single lucky run.
- Produce a failure taxonomy from your own results and use it to decide what to fix.

## Roughly how long it takes

**7 phases, about 8 weeks at five sessions a week.** Phase 7 is two weeks because MCP and evaluation are both substantial.

At one hour a day, plan on eleven weeks. Budget extra: agent development is iterative, and a meaningful fraction of your time goes on debugging loops rather than reading.

## What being on a $0 budget costs you here

This is the track where the free tier hurts most, and pretending otherwise would be dishonest.

**The core problem:** an agent makes many model calls per task. A single agent run might be five to twenty requests. A day of development might be hundreds. **Free tiers are rate-limited, and agent development is exactly the workload that hits those limits.** This is the strongest practical argument in the whole curriculum for running a model locally.

**The free-tier workflow that actually works:**

1. **Develop against a local model.** Iterate on loop logic, tool schemas and error handling locally, where calls cost nothing and are not rate-limited. The model is weaker, which is a feature: if your loop works with a weak model, the loop is sound.
2. **Use the hosted free tier for the hard steps.** When you need reliable reasoning, use the free tier sparingly — and structure your agent so the expensive model handles planning while local models handle the routine steps. That is model routing from the Cost track, applied to agents.
3. **Cache aggressively during development.** Repeated identical calls should be cached to disk so an iteration does not re-spend quota.
4. **Keep the evaluation suite small.** Twenty cases run several times each is a realistic agent evaluation on a free tier, and it is enough to see a failure taxonomy emerge.

**What you genuinely give up:**

1. **Frontier model quality.** Tool calling in particular is a capability where stronger models are meaningfully better. A small local model will call the wrong tool more often. You can still learn and build the entire mechanism — the loop, the guards, the evaluation — and you should write down honestly that your system's tool-selection accuracy reflects the model you could afford.
2. **Multi-agent experiments at scale.** Multi-agent debate and orchestrator patterns need many calls. Phase 4 covers them and is honest about their limits, but you will not run a large experiment.
3. **Long-context agent runs.** Long trajectories fill a context window fast, and long-context models are expensive. Phase 5's file-externalisation pattern is genuinely the mitigation, not a workaround.

**What you do not give up:** the entire engineering discipline of this track. Loop hygiene, approval gates, sandboxing, context isolation, failure taxonomies and pass^k evaluation are all free — they are design and code, not compute.

## How this track connects to the others

**Before it:** Prompting (especially 4 and 6), Foundations Phase 3.

**Alongside it:** Cost & Efficiency. Routing and caps are agent concerns as much as cost concerns.

**After it:** Vibecoding Craft. Working with a coding agent is this track's loop in a different interface, and Phase 7's evaluation material returns in the Vibecoding track as tests-as-the-contract.

## The honest caveat

Agent tooling is the **fastest-moving area in this curriculum**. Frameworks, SDKs and protocols all change quickly, and half the agent code written two years ago does not run today.

The durable parts: a loop needs a stopping condition; errors compound; state should be externalised; approval gates catch what instructions do not; success must be verified in code; and a single successful run proves very little. Those will outlast every framework named in this track.

Phase 7's MCP material is deliberately framed as **versioned**, because the protocol has already undergone a significant architectural revision. Read the current specification rather than a tutorial, and treat any specific version number here as volatile.

## Start here

1. Confirm Prompting Phases 4 and 6 are behind you.
2. Read [Phase 1](01-phase-what-is-an-agent.md).
3. **Read [Phase 6](06-phase-safety-human-in-loop.md) before building anything that can act on the world.** This is the one ordering suggestion in the curriculum that exists for safety rather than pedagogy.
4. Track your progress in [`checklist-master.md`](checklist-master.md).
