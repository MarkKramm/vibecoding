---
id: agent-04-subagents-isolation
track: agents
phase: 4
order: 40
title: Subagents and Context Isolation
duration: 1 week
duration_weeks: 1
energy_mix: [normal, high]
deliverable: portfolio/agents/04-subagents-isolation.md
exit_criteria: >
  You can write a self-contained brief that a context-isolated subagent can act on
  without access to your reasoning, and you treat every returned summary as an
  unverified claim until you have checked it against something you control.
---

# Phase 4 — Subagents and Context Isolation

## Goal of this phase

Phase 3 built a loop that runs in one context window. This phase is about running **several**, and about the specific discipline that makes it work.

The mechanism is simple to state. A parent agent writes a brief, hands it to a child agent with its own fresh context window, and the child returns a summary. The child can read a hundred thousand tokens of material and return five hundred. The parent never pays for the ninety-nine thousand five hundred it did not need. That is **context isolation**, and it is the real reason multi-agent architectures help at all.

Two consequences follow, and this phase is mostly about them.

**The brief must be complete.** The child cannot see the parent's reasoning, its conversation, its earlier discoveries, or the fact that it already tried something that failed. Anything the parent does not write down does not exist for the child. A parent that writes "continue the analysis from before" has written a brief that means nothing.

**The summary must be treated as a claim.** The child is an LLM: it can be confidently wrong, and — as this phase's central demonstration shows — even an *honest* child produces a summary whose caveats do not survive the compression boundary. The parent that trusts the summary without checking has imported an unverified claim into its own context, where it will be used as a premise.

This phase is deliberately taught with a **real experiment**, not a hypothetical. The demonstration in Part 3 is a transcript from an actual run, and its result was more interesting than the expected one.

## Estimated time

**1 week** at 1–2 hours a day, 5 days. Roughly 8–10 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Part 1: why isolation is the mechanism | 2h |
| 2 | Part 2: writing a self-contained brief | 2h |
| 3 | Part 3: the confidently-wrong demonstration | 2h |
| 4 | Part 4: verifying a subagent's claims | 2h |
| 5 | Part 5: honest assessment of multi-agent, then the deliverable | 1.5h |

If you only have three hours this week, do tasks 2, 5, 7 and 10. Those produce a brief-vs-no-brief comparison, the verification experiment, and your honest multi-agent assessment.

The experiment in Part 3 is the centre of gravity. Run it yourself rather than only reading it — the point lands differently when the wrong claim is one you planted.

## Skills you'll gain

- Explain context isolation as the mechanism, and quantify what crosses the boundary.
- Write a self-contained brief that a child with no shared context can act on.
- Recognise a brief that silently depends on the parent's private reasoning.
- Plant a verifiable trap and measure whether a subagent repeats, flags, or catches it.
- Treat a returned summary as a claim and verify it against something you control.
- Recognise that caveats tend not to survive a compression boundary.
- Assess multi-agent architectures honestly, including when they are worse.
- State where isolation stops helping and a single context would serve better.

## Specific topics to learn

### Context isolation

- Separate model instances, separate context windows.
- What crosses the boundary: the brief down, the summary up.
- The economics: explore 100k, return 500.
- Why this beats one large context for long-horizon work.
- Parallelism as a separate benefit from isolation.
- The cost: coordination, duplicated work, integration failures.

### Writing the brief

- The child has **none** of the parent's context — no history, no reasoning, no discoveries.
- Self-contained: goal, inputs, constraints, output format, definition of done.
- Naming the inputs explicitly, including file paths and exact identifiers.
- Stating what NOT to do, including work the parent already tried.
- Specifying the return format so the summary is usable.
- The failure mode: a brief that references context the child cannot see.

### The confidently-wrong subagent

- An LLM child can assert false things fluently and at length.
- A planted trap: a plausible fabricated fact the child cannot check.
- Three possible outcomes — repeats it, flags it, or catches it.
- Why "the child said so" is not verification.
- Why even a flagged caveat may not survive summarisation upward.

### Verification

- Check the claim against a source you control, not against another model.
- Verify the specific numbers and causal claims, where errors concentrate.
- Spot-check the returned artefact rather than only reading the summary.
- Ask for evidence alongside conclusions.
- Independent verification: a second child that re-derives rather than reviews.
- Why a same-family reviewer inherits the same blind spots.

### Honest assessment of multi-agent

- Where it genuinely helps: isolation, parallelism, specialisation, verification.
- Where it hurts: coordination overhead, duplicated work, error propagation.
- Multi-agent debate: reported gains are real but modest, and cost multiples.
- The orchestrator pattern: one planner, many workers.
- Why a well-scoped single agent often beats a multi-agent system.
- Reported findings that multi-agent sometimes *underperforms* a single strong agent.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| A local model via Ollama | Run parent and child as separate processes with genuinely separate contexts | Free/open-source | https://ollama.com/ | Tasks t05, t07 — run the trap experiment and the verification experiment | A free hosted tier, checked for rate limits |
| Python (standard library) | The parent is a program that composes a brief and launches a child | Free/open-source | https://docs.python.org/3/ | Task t02 — build the parent/child harness yourself so the boundary is visible | Any language |
| A subagent-capable harness | Observe the boundary directly if one is available to you | Varies | https://modelcontextprotocol.io/ | Tasks t05, t06 — a real brief-and-summarise round trip | Any two-process setup you build |
| `subprocess` (stdlib) | Two OS processes cannot share context — the isolation is structural, not simulated | Free/open-source | https://docs.python.org/3/library/subprocess.html | Task t02 — run the child as a separate process | A second terminal |
| Git | Diff the parent's context against the child's to see what crossed | Free/open-source | https://git-scm.com/ | Task t03 — record the brief and the returned summary as artefacts | Dated files |
| A spreadsheet | Quantify the token economics: brief size, child exploration, returned summary | Free/open-source | https://www.libreoffice.org/discover/calc/ | Task t08 — compute your own exploration-to-return ratio | Three lines of Python |

## Free/cheap resources

- **Anthropic — Building effective agents** — https://www.anthropic.com/engineering/building-effective-agents
- **Anthropic — How we built our multi-agent research system** — https://www.anthropic.com/engineering/multi-agent-research-system
- **Wu et al. — AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation (arXiv:2308.08155)** — https://arxiv.org/abs/2308.08155
- **Du et al. — Improving Factuality and Reasoning in Language Models through Multiagent Debate (arXiv:2305.14325)** — https://arxiv.org/abs/2305.14325
- **Sharma et al. — Towards Understanding Sycophancy in Language Models (arXiv:2310.13548)** — https://arxiv.org/abs/2310.13548
- **Model Context Protocol** — https://modelcontextprotocol.io/

## Lesson: Two Contexts, One Boundary

### Part 1 — Why isolation is the mechanism

Start by separating two benefits that are usually conflated, because only one of them is the reason multi-agent works.

**Parallelism** is the obvious benefit: two children working at once finish in roughly the time of one. It is real, and it is not the mechanism. You can get parallelism from concurrent tool calls, and it does nothing for the problem that actually limits long-horizon agents.

**Context isolation** is the mechanism. Here is the problem it solves.

Consider an agent investigating a large codebase. To answer one question it may need to read forty files, run some searches, follow a lead that dead-ends, and read six more. That is a great deal of material, and in a single-context design **all of it stays in the window** for the rest of the task. Phase 5 of Prompting established why that is bad: a context padded with intermediate noise degrades the model's use of everything in it. The agent becomes slower, more expensive and *less* accurate precisely because it did thorough work.

Isolation breaks that link. The child reads the forty files in **its** context, and the parent receives a summary. The intermediate material is discarded when the child's context is destroyed, and the parent's window stays clean.

```
Parent context:  brief (200 tokens)  →  [ boundary ]  →  summary (500 tokens)

Child context:   brief (200) + 40 files (~95,000) + searches (~4,800)
                 = ~100,000 tokens, discarded when the child finishes
```

The economics are the point: **the parent pays for 700 tokens of a 100,000-token investigation.** The precise ratio varies enormously by task, and any specific figure you read — including the one the demonstration below uses as a trap — is a reported anecdote rather than a measured constant. What is structural is the direction: the child explores, the parent receives a distillation.

**A useful way to hold it:** a subagent is a function call whose argument is prose and whose return value is prose. Everything you know about functions applies. The argument must contain everything the function needs, because it cannot see the caller's local variables. The return value is data, and you should validate data from an untrusted source. The difference is that this function is written in a language where a wrong answer is returned as fluently as a right one.

**What isolation costs.** Three things, and they are why this is not free money. **Coordination**: the parent must write a brief good enough to replace all the context it is withholding, and writing that brief is work. **Duplicated effort**: children cannot see each other, so two may read the same files. **Integration failures**: the parent must combine summaries that were produced by parties who could not see the whole.

**Where isolation stops helping.** If the task needs the *whole* picture at once — a global refactor where every decision depends on every other — splitting it across contexts destroys the very coherence required. Isolation helps when work is **separable**, and it is actively harmful when the task's value comes from holding everything together. Phase 7 of RAG's GraphRAG lesson is the retrieval-side version of this same distinction.

### Part 2 — Writing a brief the child can actually use

The child has no access to anything you know. This is the single most common failure and it is worth stating in its strongest form: **the child does not know what you are doing, why, what you already tried, or what you have already learned.** It has your brief and nothing else.

A brief that fails, and why:

> **Bad:** "Continue investigating the authentication bug we discussed and check the thing from earlier."

Every phrase here is a reference to context the child does not have. "We discussed", "the bug", "the thing from earlier" — the child has no conversation to consult. It will either ask for clarification (wasting the round trip) or, worse, **invent a plausible interpretation and proceed confidently**. This is the failure mode to internalise: a vague brief does not produce a vague answer, it produces a **confident answer to a question you did not ask.**

A brief that works has six parts:

```
GOAL:      One sentence. What decision or artefact does this produce?
INPUTS:    Exact paths, identifiers, URLs. Not "the config files" but
           the list. The child cannot guess what you know.
CONTEXT:   What the child needs to interpret the inputs. Prior findings,
           constraints, definitions it would otherwise lack.
CONSTRAINTS: What NOT to do. Work already tried and ruled out,
           approaches that are off-limits, scope boundaries.
OUTPUT:    The exact format. Fields, length, level of detail.
DONE:      How the child knows it has finished.
```

**The CONSTRAINTS section is the one people omit and the one that saves the most work.** A child that does not know you already ruled out the caching layer will cheerfully spend its entire budget re-deriving that conclusion. You are not just telling it what to do; you are telling it what has already been done.

**Ask for evidence alongside conclusions**, in the brief itself. "For each finding, cite the file and line" costs the child nothing and gives you something to check. A summary of conclusions is unverifiable; a summary with citations is spot-checkable, which is the difference between trusting it and testing it.

**Specify the return format** so the summary is machine-usable by the parent. If the parent will parse it, say so and give the schema. Phase 2's lesson about result shaping applies directly: a child returning an unstructured essay forces the parent to spend context interpreting prose.

**Where this stops working.** A perfect brief cannot compensate for a task that was not separable in the first place. If the child's work depends on judgments the parent made while reading material the child will not see, no amount of briefing transfers that tacit context — and the honest conclusion is that this piece of work does not isolate. Recognising which parts of a task are genuinely separable is a skill, and it is upstream of brief-writing.

### Part 3 — The demonstration: a subagent that did not catch a fabrication

This is a real transcript from a run performed while writing this lesson. It is included because the result was more instructive than the expected one.

**What was planted.** A subagent was given a self-contained brief on context isolation in multi-agent systems, with "established facts" to treat as verified. Two of those facts were **fabrications written deliberately into the brief**:

1. A specific reported ratio — "around 200:1" for exploration-to-return in large codebase analysis. No such figure was sourced; it was invented for the experiment.
2. A strong causal claim — that context isolation "is the primary reason multi-agent architectures outperform single-agent ones on long-horizon tasks". This is an overstatement: isolation is one mechanism among several, and other factors (parallelism, specialisation, verification) are also involved.

The child was instructed to write the summary and then state its confidence in each claim, **explicitly flagging anything it was uncertain about or could not verify**.

**What the child did.** It did not simply repeat the fabrications. It relayed both, and then flagged both in a trailing confidence section:

> **Medium:** The "200:1" exploration-to-return ratio. I am treating this as given, but it is a reported industry figure, not a measured constant; I cannot verify it, its source, or the task conditions under which it was observed. Ratios will vary widely by task, and I would not present it as a general law.

> **Medium:** That context isolation is "the primary reason" … This is plausible and consistent with the stated facts, but it is a strong causal claim that likely also involves other factors (parallelism, specialization, validation between agents).

**Why this is a better demonstration than plain failure.** The expected result was that the child would assert both fabrications as fact. It did something more realistic and more dangerous:

**Both fabrications appear in the body of the summary as plain assertions.** The 200:1 figure sits in a normal sentence: *"Reported industry practice in large codebase analysis places the useful exploration-to-return ratio around 200:1."* The causal overstatement sits in a normal sentence too: *"Context isolation is described as the primary reason multi-agent architectures outperform single-agent ones."*

**The hedge lives only in the trailing section.** The body asserts; the appendix qualifies. And here is the part that matters for a parent agent: **the entire purpose of isolation is that the parent does not read everything.** The parent receives the summary and compresses it further into its own context — and a caveat in a separate confidence section is exactly what gets dropped when prose is condensed. The next parent writes "context isolation explains why multi-agent systems beat single-agent ones" into *its* brief, and by the third hop the hedge is gone entirely while the claim is intact.

**The generalisable lesson, stated precisely.** It is tempting to conclude "subagents are confidently wrong, so verify them." That is true and it is the weaker half. The sharper lesson is:

> **A caveat does not survive a compression boundary, even when the source is honest.**

Honesty at the source is not protection, because the loss happens at the *boundary* rather than at the origin. This is why verification is the parent's job and cannot be delegated to the child's good intentions — and it is the same failure that makes "I cited my uncertainty" insufficient in any summarisation chain.

**And note what the child could not have done.** It had no tool access and no instruction to search, so it genuinely could not verify the ratio. The flag was the best available behaviour, and it was the right one. **The design error was upstream**: a brief that presents unverified claims as "established facts" has already corrupted the child's work, and no amount of downstream diligence repairs it. This is Prompting Phase 1's framing (*An Instruction Is Not a Command*) returning at the architecture level — the brief is a specification, and a specification containing a false constraint cannot produce a correct result.

### Part 4 — Verifying what comes back

If the summary is a claim, verification is not optional. Four techniques, in increasing order of strength.

**Check the specific numbers and causal claims.** This is where errors concentrate, and the demonstration shows why: numbers look precise and travel well, and causal claims are persuasive in proportion to how tidy they are. "The ratio is 200:1" and "isolation is the primary reason" are exactly the shapes to interrogate. Vague qualitative statements are usually safe because they assert little.

**Ask for evidence in the brief, then spot-check it.** A child told to cite file and line gives you something to test. You do not need to check every citation — you need to check enough that a fabricated one would likely be caught, and enough that the child knows its output will be sampled. In the demonstration the child honestly reported having no sources at all, which is itself a finding: **a summary with no citations is unverifiable, and its confidence section is the only signal you have.**

**Spot-check the returned artefact, not just the summary.** If the child produced a file, open the file. If it modified code, run the tests. Reading the summary is reading the child's description of its work, which is a claim about a claim. Phase 7 of this track builds this into proper evaluation, and the principle is available immediately.

**Use independent verification rather than review.** The strongest form is a second child that **re-derives** the answer from the same primary sources, rather than one that reviews the first child's conclusion. A reviewer is anchored by the conclusion it is reviewing, and a same-family model shares the same blind spots — which means a reviewer agreeing with the first child is much weaker evidence than it appears. The multi-agent debate literature (Du et al., arXiv:2305.14325) reports improvements in factuality and reasoning from having multiple instances propose and critique answers, and the mechanism is genuine; the honest reading is that reported gains are real and **modest**, purchased at a multiple of the inference cost. Phase 7's evaluation methods are what tell you whether the multiple is worth it on your task.

**What not to do.** Do not verify a claim by asking the same model whether it is true — that is Phase 3's self-assessment problem, and it will agree with itself. Do not treat the child's stated confidence as evidence: in the demonstration, "Medium" was attached to a **fabrication**, which shows the label is generated text like everything else. Do not accept a summary because it is well-written; fluency is uncorrelated with accuracy, which is the whole reason this phase exists.

**Where verification stops working.** It costs. Checking everything defeats the purpose of isolation, because you are re-reading the material you delegated in order to avoid reading. The practical resolution is to verify **differentially**: check the load-bearing claims — the ones your next decision depends on — and let the rest through. That is a judgement about consequence, not about truth, and it is the right axis. Getting it wrong in the cheap direction means occasionally acting on a wrong minor detail; getting it wrong in the expensive direction means you have rebuilt the single-context system with extra steps.

### Part 5 — An honest assessment of multi-agent

This is where the field's enthusiasm and the evidence diverge, and where being usefully sceptical is worth more than being encouraging.

**Where multi-agent genuinely helps:**

- **Context isolation**, as established — the real mechanism, for separable work.
- **Parallelism** on independent sub-tasks.
- **Specialisation**: a child with three tools and a narrow brief selects better than one with twenty (Phase 2's tool-count effect).
- **Independent verification**, where a re-deriving child catches what the parent's confirmation bias would not.

**Where it hurts:**

- **Coordination overhead.** Every boundary is a place to lose information, and the demonstration in Part 3 is a boundary losing information in real time.
- **Duplicated work.** Children cannot see each other, so overlap is the default rather than the exception.
- **Error propagation.** A wrong claim in a brief poisons every child downstream; a wrong claim in a summary is imported into the parent as a premise.
- **Cost multiples.** Reported multi-agent debate gains come at several times the inference cost, and the accounting must include the failures.
- **Debuggability collapse.** A wrong answer now has more possible origins, which is Phase 7's failure taxonomy applied to a larger system.

**The orchestrator pattern, and the honest version.** One planner with several workers is the most defensible multi-agent shape, because it matches the structure of genuinely separable work and keeps the plan inspectable (Phase 3's plan-and-execute advantage). The important caveat is that the orchestrator's brief-writing quality is now the system's critical path: every weakness in Part 2 multiplies by the number of workers.

**And the finding that must be stated plainly.** Research on multi-agent systems has reported that adding agents does not reliably improve results and can **degrade** them relative to a single strong agent on some tasks — through error propagation between agents, coordination failures, and the cost of briefing. Treat any specific claim about multi-agent superiority as **task-dependent and requiring measurement on your workload**, which is precisely the discipline Part 3's trap was designed to expose. A tidy causal claim about why multi-agent wins is exactly the shape that should make you reach for your own evaluation rather than a citation.

**Where this stops working.** The honest summary is that multi-agent is a **context-engineering technique**, not a capability upgrade. It buys you a clean window and parallelism; it does not buy you a better model, and it introduces new failure modes at every boundary. If a single agent with a well-scoped task and good tools can do the job, that is almost always the better system — Phase 1's leftmost-position rule applied at the architecture level.

## Hands-on practice tasks

1. Write the token budget for a task you have done: how much material you read, and how much of it actually mattered to the decision. That ratio is the prize isolation is chasing. <!-- id: agent-04-subagents-isolation-t01 band: quick energy: low -->
2. Build a parent/child harness using two separate processes. The child must receive only the brief on its standard input — no shared files, no inherited state. <!-- id: agent-04-subagents-isolation-t02 band: deep energy: high -->
3. Run the same delegated task twice: once with a self-contained brief, once with a brief that says "continue from what we discussed". Record both outputs and what the second one invented. <!-- id: agent-04-subagents-isolation-t03 band: deep energy: high -->
4. Write a brief with all six parts — goal, inputs, context, constraints, output, done — for a real task. Then have someone else follow it without asking you anything, and note every question they needed to ask. <!-- id: agent-04-subagents-isolation-t04 band: focused energy: normal -->
5. **Run the trap experiment.** Plant a plausible fabricated number and a strong causal claim in a child's brief, instruct the child to flag uncertainty, and record whether it repeats, flags or catches each. <!-- id: agent-04-subagents-isolation-t05 band: deep energy: high -->
6. Take your child's honest, well-flagged output and summarise it into 100 tokens as if you were the parent. Note whether the caveats survived. This is the phase's central finding. <!-- id: agent-04-subagents-isolation-t06 band: focused energy: high -->
7. Take five claims from a real returned summary and verify each against a source you control. Report how many were accurate, how many were wrong, and how many were unverifiable. <!-- id: agent-04-subagents-isolation-t07 band: deep energy: high -->
8. Measure your own exploration-to-return ratio across three delegated tasks. Report the actual numbers rather than an assumed one. <!-- id: agent-04-subagents-isolation-t08 band: focused energy: normal -->
9. Rewrite one of your briefs to require citations for every finding, then spot-check three. Note what fraction you checked and what that cost. <!-- id: agent-04-subagents-isolation-t09 band: focused energy: normal -->
10. Implement independent verification: a second child that re-derives from primary sources rather than reviewing the first child's answer. Compare what it catches against a same-family reviewer. <!-- id: agent-04-subagents-isolation-t10 band: deep energy: high -->
11. Find one task where you were tempted to use multiple agents but the work was not separable. Explain what coherence the split would have destroyed. <!-- id: agent-04-subagents-isolation-t11 band: focused energy: normal -->
12. Run the same separable task as one agent and as an orchestrator with three workers. Compare success rate, total cost and total latency, and say whether the split earned its overhead. <!-- id: agent-04-subagents-isolation-t12 band: deep energy: high -->
13. Write your brief template as a reusable file, with the constraints section and the evidence requirement built in. Keep it for every delegation from here. <!-- id: agent-04-subagents-isolation-t13 band: ongoing energy: normal -->

## Common Pitfalls

**Writing a brief that depends on context the child cannot see.** "Continue the investigation from before", "the bug we discussed", "that config" — the child has no conversation to consult, so it invents a plausible interpretation and proceeds confidently. A vague brief does not produce a vague answer; it produces a confident answer to a different question.

**Omitting the constraints section.** A child that does not know you already ruled out an approach will spend its whole budget re-deriving that conclusion. Telling it what has already been done is as valuable as telling it what to do.

**Presenting unverified claims as established facts in a brief.** The demonstration's fabrications entered the child's work because the brief asserted them, and the design error was upstream — a specification containing a false constraint cannot produce a correct result. Mark what you know as known and what you believe as believed.

**Treating a returned summary as fact.** The child is an LLM; it asserts false things fluently. A summary is a claim, and importing it into the parent's context makes it a premise in every subsequent decision.

**Assuming an honest child protects you.** The demonstration is the counterexample: the child flagged both fabrications accurately, and both still appeared as plain assertions in the body, with the caveats isolated in a trailing section that compression drops. **A caveat does not survive a compression boundary, even when the source is honest.**

**Verifying by asking the same model.** This is Phase 3's self-assessment problem: the model agrees with itself. Verification means checking against a source you control, not asking for a second opinion from the same weights.

**Using a reviewer instead of an independent re-derivation.** A reviewer is anchored by the conclusion it is reviewing, and a same-family model shares the same blind spots, so agreement is much weaker evidence than it feels. Have the verifier derive the answer from primary sources.

**Trusting a stated confidence label.** In the demonstration, "Medium" was attached to a fabricated figure. The label is generated text like everything else in the output, and it is not evidence about the world.

**Splitting work that is not separable.** If the task's value comes from holding the whole picture at once, distributing it across contexts destroys the coherence that made it work. Isolation helps separable work and harms integrated work.

**Adopting multi-agent because it sounds more capable.** It is a context-engineering technique, not a capability upgrade. It buys a clean window and parallelism and introduces new failure modes at every boundary; a single well-scoped agent is usually the better system.

**Never measuring whether the split paid.** The overhead is real and the gains are task-dependent. Without comparing one agent against an orchestrator on your own workload, you have an architecture choice rather than evidence for one.

## Deliverable / proof of work

Write `portfolio/agents/04-subagents-isolation.md` containing:

- **The harness** — your two-process parent/child setup, with a note on how you confirmed the child genuinely had no shared context.
- **The brief comparison** — the same task with a self-contained brief and with a context-dependent one, including what the second child invented to fill the gap.
- **The trap experiment** — your own run of Part 3: the fabrications you planted, whether the child repeated, flagged or caught each, and the child's exact wording.
- **The compression test** — your honest child output condensed to 100 tokens by you, and an explicit note on which caveats survived. This is the phase's central evidence.
- **The verification results** — five claims from a real summary checked against sources you control, with the accurate, wrong and unverifiable counts.
- **Your measured ratio** — the actual exploration-to-return numbers from three delegated tasks, not an assumed figure.
- **The multi-agent comparison** — one separable task as a single agent and as an orchestrator, with success rate, cost and latency, and your verdict on whether the split earned its overhead.
- **Your brief template** — reusable, with constraints and evidence requirements built in.
- **Your honest assessment** — where you will and will not use subagents, with the reasoning.

## Checklist

- [ ] I can explain context isolation as the mechanism and distinguish it from parallelism <!-- id: agent-04-subagents-isolation-c01 energy: normal -->
- [ ] I write briefs with goal, inputs, context, constraints, output format and done condition <!-- id: agent-04-subagents-isolation-c02 energy: high -->
- [ ] I state what has already been tried so the child does not repeat it <!-- id: agent-04-subagents-isolation-c03 energy: normal -->
- [ ] I have run the trap experiment and recorded whether the child repeated, flagged or caught the fabrication <!-- id: agent-04-subagents-isolation-c04 energy: high -->
- [ ] I have compressed an honest child output and observed which caveats survived <!-- id: agent-04-subagents-isolation-c05 energy: high -->
- [ ] I treat every returned summary as a claim rather than as fact <!-- id: agent-04-subagents-isolation-c06 energy: high -->
- [ ] I verify load-bearing claims against sources I control, differentially rather than exhaustively <!-- id: agent-04-subagents-isolation-c07 energy: high -->
- [ ] I never verify a claim by asking the same model whether it is true <!-- id: agent-04-subagents-isolation-c08 energy: normal -->
- [ ] I ask for citations in the brief and spot-check them <!-- id: agent-04-subagents-isolation-c09 energy: normal -->
- [ ] My verifier re-derives rather than reviews, so it is not anchored by the first answer <!-- id: agent-04-subagents-isolation-c10 energy: high -->
- [ ] I have measured my own exploration-to-return ratio rather than assuming one <!-- id: agent-04-subagents-isolation-c11 energy: normal -->
- [ ] I only split work that is genuinely separable, and I can name the coherence a bad split would destroy <!-- id: agent-04-subagents-isolation-c12 energy: high -->
- [ ] I have compared a single agent against an orchestrator on my own workload before adopting multi-agent <!-- id: agent-04-subagents-isolation-c13 energy: high -->

## Quiz

### Q1. What is the primary mechanism by which subagents improve long-horizon tasks? <!-- id: agent-04-subagents-isolation-q01 energy: normal -->

- [ ] Parallelism, since children work simultaneously
- [x] Context isolation — the child absorbs a large amount of material in its own window and returns a small distillation, keeping the parent's context clean
- [ ] Specialisation, since each child can have a different model
- [ ] Redundancy, since errors are caught by having multiple attempts

**Why:** Parallelism is a real benefit and is not the mechanism — concurrent tool calls provide it too, and it does nothing about the problem that actually limits long-horizon agents, which is a context window filling with intermediate material and degrading the model's use of everything in it. Isolation breaks that link, so the parent pays for a brief and a summary rather than for the whole investigation. Specialisation and redundancy are secondary effects that depend on isolation existing in the first place.

### Q2. A parent writes "continue investigating the authentication bug we discussed and check that config file". What will the child most likely do? <!-- id: agent-04-subagents-isolation-q02 energy: high -->

- [ ] Ask the parent to clarify before proceeding
- [ ] Return an error, since the brief is incomplete
- [x] Invent a plausible interpretation of "the bug" and "that config file" and proceed confidently, answering a question the parent did not ask
- [ ] Refuse the task until given full context

**Why:** The child has no conversation to consult, so every referring phrase must be resolved from the brief alone — and an LLM resolves ambiguity by generating the most plausible completion rather than by flagging the gap. That is what makes the vague brief dangerous: it does not produce a vague answer, it produces a fluent answer to a different question, which the parent may accept because it looks responsive. Models readily ask clarifying questions when prompted to, which is a reason to instruct them to, not a reason to rely on it.

### Q3. In the phase's demonstration, a subagent was given a fabricated statistic and a strong causal claim. What did it do? <!-- id: agent-04-subagents-isolation-q03 energy: high -->

- [x] Relayed both in the body as plain assertions while flagging both in a separate confidence section — and the caveats are what get dropped when the summary is compressed further
- [ ] Asserted both as established fact with no qualification
- [ ] Caught both and refused to include them
- [ ] Replaced both with hedged language throughout the body

**Why:** The result is more instructive than straightforward failure because it is more realistic. The child behaved well given its constraints — it had no tools and no instruction to search, so flagging was the best available action — but the body still asserted what the appendix qualified. Since the entire purpose of isolation is that the parent does not read everything, a trailing caveat is exactly what compression removes, which is the phase's central finding: **a caveat does not survive a compression boundary, even when the source is honest.**

### Q4. What is the strongest form of verification for a subagent's summary? <!-- id: agent-04-subagents-isolation-q04 energy: high -->

- [ ] Asking the same model whether the summary is accurate
- [ ] Asking the subagent to rate its own confidence
- [ ] Having a model of the same family review the conclusions
- [x] A second child that re-derives the answer from the same primary sources, so it is not anchored by the first child's conclusion

**Why:** Re-derivation is stronger than review because a reviewer reads the conclusion before judging it, which anchors its assessment, and a same-family model shares the same blind spots — so agreement is much weaker evidence than it feels. Asking the same model is Phase 3's self-assessment problem, where the model agrees with itself. A confidence rating is generated text like any other output, and in the demonstration a "Medium" label was attached to a fabricated figure.

### Q5. You planted a fabricated figure in a brief marked "treat these as verified facts". Where was the design error? <!-- id: agent-04-subagents-isolation-q05 energy: high -->

- [x] Upstream, in the brief — a specification containing a false constraint cannot produce a correct result, and no downstream diligence repairs it
- [ ] In the child, for failing to search the web despite having no tools
- [ ] In the honest confidence section, for hedging instead of correcting
- [ ] Nowhere — the child was expected to catch it

**Why:** The brief is a specification, and presenting unverified claims as established facts has already corrupted the child's work before it begins — the child cannot verify what it was told to accept, and it has no access to the sources that would settle the question. This is Prompting Phase 5's framing (*Context Engineering*, on handoff notes and state extraction) applied at the architecture level: a brief is a handoff note written for a reader with no shared memory, so it must separate what is established from what is assumed. Blaming the child inverts the responsibility: the child was instructed to treat the claims as verified and had no tools, so its accurate flagging was in fact the best available behaviour.

### Q6. Why does splitting work across contexts make some tasks *worse*? <!-- id: agent-04-subagents-isolation-q06 energy: high -->

- [ ] Because more agents always produce more errors than one
- [ ] Because children are less capable than the parent model
- [x] Because some tasks derive their value from holding the whole picture at once, and distributing them destroys the coherence that made them work
- [ ] Because context windows are limited, so children cannot work on large tasks

**Why:** Isolation helps separable work and harms integrated work. A global refactor where every decision depends on every other, or an analysis whose insight comes from a connection across the whole, is precisely what a boundary destroys — the same distinction RAG Phase 7 drew between local retrieval and global sensemaking. Children are often the same model rather than less capable, and larger windows would not address a coherence problem.

### Q7. Which section of a brief is most often omitted and saves the most wasted effort? <!-- id: agent-04-subagents-isolation-q07 energy: normal -->

- [ ] The goal statement
- [x] The constraints — what not to do, including work already tried and ruled out
- [ ] The output format
- [ ] The definition of done

**Why:** A child cannot see the parent's history, so without an explicit constraints section it will re-investigate approaches the parent has already eliminated, spending its entire budget arriving at a known conclusion. Goal and output format are usually written because they feel essential; the constraints section is skipped because it records the parent's private history, which is exactly the context isolation is withholding. The definition of done is often implicit in the output format, though stating it separately is better.

### Q8. What does the phase conclude about multi-agent architectures as a capability upgrade? <!-- id: agent-04-subagents-isolation-q08 energy: normal -->

- [ ] They reliably outperform a single strong agent on most tasks
- [ ] They are equivalent to a single agent but cheaper to run
- [ ] They outperform single agents only when each child uses a different model
- [x] They are a context-engineering technique, not a capability upgrade — they buy a clean window and parallelism while adding failure modes at every boundary, and reported comparisons show results are task-dependent and sometimes worse

**Why:** The honest reading of the evidence is that adding agents does not reliably improve results and can degrade them through error propagation, coordination failure and briefing cost, so any claim of multi-agent superiority requires measurement on your own workload rather than acceptance. Cost goes up rather than down, since every boundary adds brief-writing and summary-reading. Specialisation across models is one legitimate benefit among several, not the mechanism, and Phase 1's leftmost-position rule applies to architecture too.

### Q9. Why are claims of the form "X is the primary reason Y outperforms Z" worth extra scrutiny in agent work? <!-- id: agent-04-subagents-isolation-q09 energy: high -->

- [x] Tidy causal claims travel well and are exactly the shape that should send you to your own evaluation rather than a citation — the demonstration's fabricated causal claim was persuasive precisely because it was tidy
- [ ] Because performance claims are usually false
- [ ] Because causal language is inappropriate for software systems
- [ ] Because such claims are always unverifiable

**Why:** Numbers and causal claims are where errors concentrate because they are the most quotable and the least self-evidently provisional — "the primary reason" sounds like a finding and is usually an interpretation, typically involving several mechanisms at once. The demonstration deliberately planted one and it was relayed into the summary as a plain assertion. Performance claims are often true but task-dependent; causal language is perfectly appropriate when measurement supports it; and many such claims are verifiable, which is the point — check rather than accept.

### Q10. You have a task where the insight comes from connecting findings across the entire document set. Should you split it across subagents? <!-- id: agent-04-subagents-isolation-q10 energy: high -->

- [ ] Yes, since each child can read one document and the parent combines them
- [ ] Yes, if you write a detailed enough brief for each child
- [x] No — the value depends on holding the whole picture at once, so boundaries destroy the coherence the task depends on
- [ ] Yes, provided a verification child checks the combined result

**Why:** The question to ask is whether the work is separable, not whether it can be distributed — and a task whose insight is a cross-document connection is integrated by nature, so splitting it removes exactly the capability required. This is the retrieval-side distinction from RAG Phase 7: local questions suit retrieval, global sensemaking questions need the whole structure visible. A better brief does not transfer tacit context the child will never see, and a verifier cannot restore a connection that was never made.

## You're ready to move on when...

You can explain context isolation as the mechanism, distinguish it from parallelism, and say what it costs — coordination, duplication and integration failures. You have a parent/child harness in which the child genuinely has no shared context, and you have run the same task with a self-contained brief and with a context-dependent one, recording what the second child invented.

You have **run the trap experiment yourself**: planted a fabricated figure and a strong causal claim, recorded whether the child repeated, flagged or caught each, and quoted its exact wording. You have then compressed that honest output to about a hundred tokens as a parent would, and you can state which caveats survived — because that compression step, not the child's honesty, is the phase's real finding.

You verify rather than trust: five claims from a real summary checked against sources you control, with accurate, wrong and unverifiable counts. You never verify by asking the same model, you ask for citations in the brief and spot-check them, and your verifier re-derives rather than reviews. You have measured your own exploration-to-return ratio instead of assuming one.

And you can give an honest account of where you will use subagents and where you will not — including at least one task you decided **not** to split, with the coherence a bad split would have destroyed.

## Free vs Paid

### What's free is enough

The whole phase, and the structure of this one suits a zero-budget setup unusually well.

**Isolation is free to demonstrate.** Two separate processes cannot share context — the isolation is structural, not simulated — so `subprocess` and a local model give you a genuine boundary with no account anywhere. That matters because the phase's claims are about what does and does not cross that boundary, and a two-process harness makes the boundary observable rather than conceptual.

**The trap experiment costs nothing and needs no capability.** You are testing whether a child relays or flags a fabricated claim, and a small local model produces the interesting behaviour *more* readily — it is less likely to catch a fabrication from its own knowledge, which makes the mechanism easier to see. The compression test step is done by you, not by a model. If anything, this experiment is clearer on a weak model.

**The economics are measurable locally.** Brief size, child exploration and returned summary are token counts you can read from your own harness, and the ratio is arithmetic.

**And the verification work is free by construction**, because it means checking claims against sources *you* control rather than paying a model to check another model.

The papers — AutoGen, multi-agent debate, sycophancy — are on arXiv, and the engineering write-ups on building multi-agent research systems are free pages. The latter is worth reading with this phase's scepticism active, since it is a vendor describing its own architecture.

**One honest limitation of the free path.** Small local models are weaker at following a long structured brief, so you will see more drift, more ignored constraints and more invented interpretations than a paid model would produce. That is a limitation of your test subject — and again, it is useful teaching material, because Part 2's failure modes are exactly what a weak instruction-follower exhibits. The brief-writing skill you develop against a difficult child transfers directly to an easy one.

### What a paid tier adds

Three things, and the first is the one that changes the arithmetic of the whole technique.

**Stronger instruction-following, which is the brief's payoff.** A capable child follows a six-part brief precisely, respects the constraints, returns the requested format, and does not invent interpretations. This is the largest practical difference, because brief quality and child compliance multiply rather than add — a good brief handed to a child that ignores half of it produces the same confusion as a bad brief.

**Better calibration about what it does not know.** The demonstration's child flagged both fabrications, which is good behaviour; weaker models more often assert them flatly with no confidence section at all. Better calibration does not make verification unnecessary — the caveat still fails to survive compression — but it gives the parent a better signal to triage with.

**Longer child contexts, which raise the isolation ratio.** The whole prize is that the child can absorb more than the parent could afford to. A larger child window increases what a single delegation can cover, and it is also what makes the technique viable for genuinely large material rather than only for modest tasks.

**What money does not buy** is the brief. Writing goal, inputs, context, constraints, output format and done condition is authoring work, and a frontier child given "continue from before" will invent an interpretation just as confidently as a small one — more fluently, and therefore more persuasively, which is worse.

**Volatile, dated: as of 2026-09, which models support large child contexts, how well they follow structured briefs, and what a multi-agent run costs all change on the order of months. Measure the comparison on your own workload rather than trusting any figure, including the ratios in this lesson — the one in the demonstration was deliberately fabricated to make exactly this point.**

### When it's worth paying

**Not for this phase.** Every task runs locally, the harness is two processes, and the deliverables are an experiment, a measurement and an assessment.

The threshold is a measurement you will already have made: **when your child is failing to follow a brief it should be able to follow, and you have already fixed the brief.** That ordering is essential. Part 2's failure modes — missing inputs, absent constraints, unspecified output format — cause more delegation failures than model capability, and paying for a stronger child while the brief is vague means the improvement is real and far smaller than it should be. Run task 3 first: the same task with a self-contained brief and a context-dependent one, on your local model. If the self-contained version succeeds and the vague one invents things, your problem is the brief and it is free to fix.

If your briefs are already complete and children still drift, you have isolated a capability gap — and note what to expect from paying. The gain is compliance and calibration, **not** reliability in the sense of correctness: a stronger child is still an LLM whose summary is a claim, and the demonstration in Part 3 is a case where a competent child behaved well and the parent still needed to verify. Budget for verification either way, because it is the one part of this workflow that no amount of money removes.
