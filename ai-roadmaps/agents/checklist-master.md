# Agents & Tools — Master Checklist

This is the **track-level** checklist. Phase checklists live inside the phase files. These items should be true of you **when the whole track is done** — capabilities that require several phases together.

**Tick only what you can actually do.** Rule 6 of the study rules: your own words, or it did not happen. Agents are the easiest track in this curriculum to feel competent at, because a demo that runs looks like a system that works. Almost every item below is written so you would have to demonstrate it, not describe it.

If you cannot tick an item, the phase it names is where to go back.

---

## The fundamentals

- [ ] I can define an agent precisely — a loop with tools and a stopping condition — and explain why a pipeline is often the better choice. <!-- id: agent-master-c01 energy: normal -->
- [ ] I can place a system on the spectrum from fixed pipeline to autonomous loop, and say which end is preferable. <!-- id: agent-master-c02 energy: normal -->
- [ ] I can explain why a loop amplifies error as well as capability, with a concrete example of compounding. <!-- id: agent-master-c03 energy: high -->

## Tools

- [ ] I have written a tool schema and handled the model's call in my own code. <!-- id: agent-master-c04 energy: normal -->
- [ ] I can explain that the model never executes anything, and what follows from that for how I design tools. <!-- id: agent-master-c05 energy: normal -->
- [ ] I validate tool arguments in code and return actionable errors into the loop. <!-- id: agent-master-c06 energy: high -->
- [ ] I can explain why fewer, narrower tools improve selection accuracy. <!-- id: agent-master-c07 energy: normal -->
- [ ] I keep tool results concise, and can explain why a large tool dump damages the rest of a run. <!-- id: agent-master-c08 energy: normal -->
- [ ] I design for idempotency, because a retry may execute an action twice. <!-- id: agent-master-c09 energy: high -->

## The loop

- [ ] I have implemented an agent loop from scratch rather than only through a framework. <!-- id: agent-master-c10 energy: high -->
- [ ] My loop has all five guards: step cap, token or cost cap, wall-clock timeout, loop detection and tracing. <!-- id: agent-master-c11 energy: high -->
- [ ] I can explain why each guard is necessary rather than defensive habit. <!-- id: agent-master-c12 energy: high -->
- [ ] I can explain when plan-and-execute beats a single reactive loop. <!-- id: agent-master-c13 energy: high -->
- [ ] I can explain why self-reflection requires a reliable failure signal, and what makes tests such a signal. <!-- id: agent-master-c14 energy: high -->

## Isolation, state and memory

- [ ] I have used a subagent for context isolation and can explain what it bought me. <!-- id: agent-master-c15 energy: high -->
- [ ] I can write a subagent brief complete enough that it needs no shared memory. <!-- id: agent-master-c16 energy: high -->
- [ ] I verify a subagent's output rather than trusting it, and can explain why that is necessary. <!-- id: agent-master-c17 energy: high -->
- [ ] I externalise agent state to files so it survives compaction and a new session. <!-- id: agent-master-c18 energy: high -->
- [ ] I can explain why externalised state is more robust than state held in a context window. <!-- id: agent-master-c19 energy: high -->
- [ ] I treat memory writes as privileged, because untrusted content can poison them. <!-- id: agent-master-c20 energy: high -->

## Safety

- [ ] My agent requires human approval for irreversible or outward-facing actions. <!-- id: agent-master-c21 energy: high -->
- [ ] My approval gate shows the **exact** action rather than a summary. <!-- id: agent-master-c22 energy: high -->
- [ ] I can explain why a gate that is cheap to click through becomes theatre. <!-- id: agent-master-c23 energy: high -->
- [ ] I enforce filesystem and permission scoping in code rather than in a prompt. <!-- id: agent-master-c24 energy: high -->
- [ ] I assume ingested content is hostile, and can explain indirect prompt injection concretely. <!-- id: agent-master-c25 energy: high -->
- [ ] I can explain what instruction hierarchy mitigates and what it does not guarantee. <!-- id: agent-master-c26 energy: high -->
- [ ] I never auto-merge agent-produced code to a production environment. <!-- id: agent-master-c27 energy: normal -->

## Evaluation

- [ ] I have evaluated an agent on a fixed task suite and reported a success rate. <!-- id: agent-master-c28 energy: high -->
- [ ] I check success **by code** — tests or state — rather than by the agent's self-report. <!-- id: agent-master-c29 energy: high -->
- [ ] I run each task more than once and report pass^k rather than a single lucky run. <!-- id: agent-master-c30 energy: high -->
- [ ] I have produced a failure taxonomy from my own results and used it to decide what to fix next. <!-- id: agent-master-c31 energy: high -->
- [ ] I have run the impossible-task test and observed whether my agent reported the blocker or fabricated success. <!-- id: agent-master-c32 energy: high -->

## The wider frame

- [ ] I can explain what MCP standardises and what it does not. <!-- id: agent-master-c33 energy: normal -->
- [ ] I have written or run a small MCP server. <!-- id: agent-master-c34 energy: high -->
- [ ] I can state honestly, in writing, what my own agent does not do reliably. <!-- id: agent-master-c35 energy: normal -->

---

## What this checklist is not

It is not a claim that your agent is production-ready, and it is not a list of framework features. It is a claim that **you can build a bounded, contained, measurable agent** — and that you know why each guard exists.

**If you can tick the safety and evaluation sections and nothing else**, you are in a stronger position than someone who ticked everything above them. An agent that acts on the world without a gate, and that you cannot measure, is not a project — it is a liability with a demo attached.
