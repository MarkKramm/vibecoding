---
id: agent-06-safety-human-in-loop
track: agents
phase: 6
order: 60
title: Agent Safety and Human Approval
duration: 1 week
duration_weeks: 1
energy_mix: [normal, high]
deliverable: portfolio/agents/06-safety-human-in-loop.md
exit_criteria: >
  You can place a human approval gate at the correct level of your agent's action
  hierarchy, show a human exactly what will happen before it happens, and contain
  an agent so that a successful prompt injection cannot reach anything valuable.
---

# Phase 6 — Agent Safety and Human Approval

## Goal of this phase

Phase 5 ended with an uncomfortable admission: memory that persists can be poisoned, and the paper documenting the attack concluded that effective mitigations are **currently lacking**. This phase is the answer to the question that leaves open — not "how do we stop the model being fooled", but **"how do we build the system so that being fooled is survivable?"**

That reframing is the whole phase. The field spends a great deal of effort trying to make models resistant to manipulation through prompt instructions, and the premise is wrong in a specific way: **a prompt instruction is a preference, not a control.** If your safety property depends on the model choosing correctly, you do not have a safety property — you have a hope. This is the same argument Phase 6 of RAG made about access control, Phase 2 made about validation, and Phase 4 made about unverified summaries, now applied to the agent's own actions.

So this phase teaches three things that do not depend on the model behaving well. **Human approval gates** placed where irreversible actions happen. **Containment** — sandboxing, scoping, and least privilege — so that a compromised agent reaches nothing valuable. And **action previews** — showing a human exactly what is about to happen, in the concrete terms that make the decision real rather than nominal.

By the end you will have a working approval gate that fires on consequence rather than on tool name, a preview a human can genuinely evaluate, and a containment design where a successful injection has nothing worth stealing.

## Estimated time

**1 week** at 1–2 hours a day, 5 days. Roughly 8–10 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Part 1: why a prompt is not a control | 1.5h |
| 2 | Part 2: the human approval gate | 2h |
| 3 | Part 3: action previews that work | 2h |
| 4 | Part 4: containment | 2h |
| 5 | Part 5: injection, revisited with defences — then the deliverable | 1.5h |

If you only have three hours this week, do tasks 3, 5, 8 and 11. Those produce the gate, the preview comparison, the containment test and the injection re-run.

The containment work is where most of the practical value is, and it is ordinary systems engineering rather than AI-specific knowledge — which is good news, because much of it you may already know.

## Skills you'll gain

- Explain why a prompt instruction cannot enforce a safety property.
- Place approval gates by consequence and reversibility, not by tool name.
- Write an action preview a human can genuinely evaluate.
- Recognise previews that invite rubber-stamping.
- Design approval levels, from notify through to hard block.
- Contain an agent with least privilege, scoping and network restriction.
- Test containment by attempting escape rather than assuming it holds.
- Handle a blocked action so the agent recovers rather than loops.
- Re-run an injection test against your containment and report honestly.
- State where these controls stop working, and what residual risk remains.

## Specific topics to learn

### Why prompts are not controls

- A prompt is a **preference**; the executor is the **control** (Phase 2).
- The instruction hierarchy and its limits (arXiv:2404.13208).
- Defence in depth: every layer assumes the one above it failed.
- Why "the model knows not to" is not a security argument.
- The residual risk you accept when you ship.

### Approval gates

- **Consequence, not tool name** — the criterion is what the action does.
- Reversibility as the primary axis: reads, reversible writes, irreversible actions.
- Four levels: notify, approve-after, approve-before, hard block.
- Batching approvals: approve a plan (Phase 3) rather than every step.
- The friction tradeoff — too many prompts produce rubber-stamping.
- Timeouts and defaults when no human is present.
- Making a blocked action recoverable rather than a dead end.

### Action previews

- Show the **exact** action — the resolved command, the actual path, the real amount.
- Resolve variables, globs and indirection before showing.
- Show the **diff**, not the intention.
- Quantify the blast radius: how many rows, which files, what total.
- The rubber-stamp failure: a preview so vague that approval is meaningless.
- Preview the *consequence*, not the tool call's JSON.

### Containment

- **Least privilege**: the agent gets the minimum it needs, not what is convenient.
- Filesystem scoping: a working directory, read-only elsewhere, no traversal.
- Network egress restriction: the most commonly skipped control, and the exfiltration path.
- Process isolation: containers, separate users, resource limits.
- Secrets: never in the agent's environment if avoidable.
- Testing containment by attempting escape, deliberately.
- Why containment is the control that holds when everything else fails.

### Injection, with defences

- Indirect prompt injection revisited (arXiv:2302.12173).
- The paper's honest conclusion: effective mitigations are currently lacking.
- Provenance and review (Phase 5) as the memory-side defence.
- Why the human gate must see **resolved** actions to be meaningful.
- Capability limits as the strongest of the available controls.
- An injection that succeeds but reaches nothing valuable is a contained failure.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Docker or Podman | Process isolation with a scoped filesystem and no network by default | Free/open-source | https://docs.docker.com/ | Tasks t08, t10 — contain an agent and then attempt escape | A dedicated unprivileged OS user, or a VM |
| Linux namespaces / `unshare` | Filesystem and network scoping without a container runtime | Free/open-source | https://man7.org/linux/man-pages/man1/unshare.1.html | Task t08 — scope the filesystem to one directory | `chroot`, or a scoped user account |
| `iptables` / firewall rules | Deny egress so a compromised agent has nowhere to send data | Free/open-source | https://netfilter.org/ | Task t09 — allow only an allowlist and verify the rest is denied | Container `--network none` with a proxy |
| Python (standard library) | The gate is a conditional; the preview is string formatting | Free/open-source | https://docs.python.org/3/ | Tasks t03, t05 — the gate and the preview renderer | Any language |
| A local model via Ollama | Run injection attempts repeatedly without a meter | Free/open-source | https://ollama.com/ | Task t11 — re-run the injection test against containment | A free hosted tier, checked for limits |
| `git` | A diff is the honest preview for a file-modifying action | Free/open-source | https://git-scm.com/ | Task t06 — show the actual diff rather than "will edit the file" | `diff` against a copy |

## Free/cheap resources

- **Greshake et al. — Indirect Prompt Injection (arXiv:2302.12173)** — https://arxiv.org/abs/2302.12173
- **Wallace et al. — The Instruction Hierarchy (arXiv:2404.13208)** — https://arxiv.org/abs/2404.13208
- **Debenedetti et al. — AgentDojo: A Dynamic Environment to Evaluate Prompt Injection Attacks and Defenses for LLM Agents (arXiv:2406.13352)** — https://arxiv.org/abs/2406.13352
- **OWASP — Top 10 for LLM Applications** — https://owasp.org/www-project-top-10-for-large-language-model-applications/
- **NIST — AI Risk Management Framework** — https://www.nist.gov/itl/ai-risk-management-framework
- **Anthropic — Building effective agents** — https://www.anthropic.com/engineering/building-effective-agents

## Lesson: Controls That Do Not Depend on the Model

### Part 1 — Why a prompt is not a control

Begin with the argument, stated as sharply as possible, because everything in this phase follows from it.

> **If your safety property depends on the model choosing correctly, you do not have a safety property. You have a hope.**

Concretely: an agent's system prompt says *"never delete files outside the working directory."* Now consider the ways that can fail. The model can be manipulated by text it read (Phase 5's injection). It can misread a path. It can be asked to do something that *looks* like it stays inside while resolving outside — `../`, a symlink, a variable. It can simply be a weaker model than the prompt assumed. **Every one of those failures is a case where your guard was consulted and lost.** The guard had no enforcement power, because a prompt is text that the model may follow.

**The instruction hierarchy, stated accurately.** Wallace et al. (arXiv:2404.13208) identify the underlying vulnerability precisely: today's LLMs are susceptible to injection and jailbreaks partly because they **often consider system prompts to be the same priority as text from untrusted users and third parties.** Their proposal is an explicit hierarchy defining how a model should behave when instructions of different priority conflict, plus a data-generation method that teaches models to selectively ignore lower-privileged instructions. Applied to GPT-3.5, the method **drastically increased robustness — including against attack types not seen during training — while imposing minimal degradation on standard capabilities.**

Two things must be said about that result, and the second is the important one. It is a genuine and promising direction. And it is a **mitigation, not an enforcement mechanism**: it makes the model *more likely* to ignore a malicious instruction, which is categorically different from making it *unable* to act on one. An attacker who finds a bypass has bypassed your control entirely, because the control lived in the model's judgement. Phase 5's honest note stands — the injection paper's conclusion is that effective mitigations are currently lacking.

**So what does work?** The pattern is **defence in depth, where every layer assumes the one above it failed.**

| Layer | Assumes | Enforced by |
|---|---|---|
| Prompt instruction | — | The model's judgement (weakest) |
| Input provenance | The prompt failed | Your metadata (Phase 5) |
| Action preview + gate | Provenance failed | **A human** |
| Containment | The human failed or was absent | **The operating system** |
| Capability minimum | Containment failed | **Your tool design** |

Read the "enforced by" column downward and notice what changes. The top row is enforced by the thing you are trying to constrain. The bottom two are enforced by the operating system and by your own code — **things the model cannot talk its way past.** That gradient is the design principle of this phase: put your load-bearing controls as far down the table as you can, and treat the prompt as a courtesy that reduces how often the real controls fire.

**Where this stops working.** Containment is not free, and control strength trades against capability. An agent in a network-isolated container with a read-only filesystem and three narrow tools is very safe and can do very little. Somewhere between that and an unrestricted shell there is a real trade, and pretending otherwise produces either useless agents or unsafe ones. The honest position: **decide the residual risk you are willing to accept, and write it down** — Phase 7's evaluation and the Safety & Ethics track both build on that number existing.

### Part 2 — The approval gate

An approval gate is a point where your code stops and a human decides. The first design question is **where to put them**, and the common answer is wrong.

**Do not gate by tool name. Gate by consequence.** A tool-name rule like "approve all `write_file` calls" is both too strict and too loose. Too strict, because `write_file` on a scratch note in a temp directory is harmless and gating it trains the human to click through. Too loose, because `run_shell` can delete a database and `http_post` can exfiltrate every secret the agent can read — neither is called `write_file`.

**The primary axis is reversibility.** Three categories, and they map cleanly onto levels:

| Category | Examples | Consequence if wrong |
|---|---|---|
| **Read** | fetch, query, list, search | None — the data is already readable |
| **Reversible write** | create draft, stage, commit locally | Recoverable by undoing |
| **Irreversible or external** | send email, pay, delete, publish, deploy | Cannot be undone; affects third parties |

**Four levels of gate**, applied by category:

**1. Notify.** The agent acts and records it. Appropriate for reads. The value is the audit trail, not the gate.

**2. Approve after.** The agent acts, and the human is shown what happened with an easy undo. Appropriate for reversible writes where a delay costs more than a mistake.

**3. Approve before.** The agent stops and waits. **This is where irreversible actions belong** — payment, deletion, publication, external communication.

**4. Hard block.** The action is not available at all, in any circumstance. Some things should not be delegated to an agent regardless of approval, because an approval can itself be misled (Part 3).

**Batch approvals the way Phase 3 taught.** Approving every step of a ten-step loop is the fastest route to rubber-stamping. Approving **a plan** — "these are the six actions I intend to take, in this order" — gets a real decision at a point where the human has enough context to make one, and it is why plan-and-execute's inspectability matters.

**The friction tradeoff, which is the failure mode of this whole section.** Every additional prompt makes the human less attentive to the remaining ones. An agent that asks for approval forty times a day gets approved forty times a day, and the fortieth approval is not a decision — it is a reflex. **A gate that fires too often is worse than no gate**, because it produces a false record of consent: your logs show forty human approvals, and no human approved anything. Calibrate by consequence, and put the cheap stuff at level 1 so the expensive stuff keeps its weight.

**When no human is present**, every gate needs a defined default. The safe default is **deny and park**: don't act, record the pending action, and surface it when someone returns. The unsafe default — proceeding because no one objected — converts your gate into a delay. Decide this explicitly, because the alternative is deciding it accidentally.

**And make a blocked action recoverable.** An agent that hits a gate and receives a bare "denied" will often retry, or stall. Tell it what happened and what to do instead:

```
Action blocked: sending email to 214 customers requires human approval.
Status: pending approval (id: ap-8871).
Do not retry this action. Continue with steps that do not require
approval, or finish and report that approval is outstanding.
```

This is Phase 2's actionable-error principle and Phase 3's stuck-loop message, applied to the safety layer. A gate that produces an unrecoverable stall has converted a safety feature into a reliability problem — and the predictable consequence is that someone disables it.

**Where approval gates stop working.** They depend on a human who is present, attentive and able to evaluate the preview. Part 3 is about the third condition, which is the one that silently fails. And an approval does not make an action safe — it makes it **authorised**. If the preview was misleading, the authorisation is worthless while looking complete.

### Part 3 — Previews that are actually decidable

An approval gate is only as good as what the human is shown. This section is short and it is where most real-world gates quietly fail.

**The rubber-stamp failure.** A preview that says *"The agent wants to run a shell command. Approve?"* is not a decision — it is a prompt to click yes. The human has no basis for judgement, so they approve, and the gate produces a record of consent that means nothing. **This is more dangerous than no gate**, because it looks like oversight.

**Five rules for a preview that works.**

**1. Show the resolved action, not the intention.** Variables, globs and indirection must be expanded before display.

```
Bad:   Delete files matching the pattern
Good:  Delete 3 files:
         /work/out/report-2025-01.csv
         /work/out/report-2025-02.csv
         /work/out/report-2025-03.csv
```

The agent's *intention* is "clean up old reports". The *action* is three specific paths. A human can evaluate the second and cannot evaluate the first — and if the pattern resolved to 3,000 files instead of 3, only the resolved form reveals it.

**2. Show the diff, not the description.** For a file modification, the actual diff. For a database write, the actual rows. For a message, the actual text that will be sent. "Will update the configuration" is not reviewable; the four changed lines are.

**3. Quantify the blast radius.** How many records, which total amount, what fraction of the dataset.

```
Bad:   Pay outstanding invoices
Good:  Pay 12 invoices, total 148,300.00 PHP, to 9 distinct payees.
       Largest: 62,000.00 PHP to Acme Corp.
       This cannot be undone.
```

That preview supports an actual decision. The count, the total, the largest exposure, and the irreversibility are the four facts a reviewer needs.

**4. Show what changes if it goes wrong.** Naming the irreversibility is what separates a considered approval from a casual one. "This cannot be undone" is one line and it changes the interaction.

**5. Preview the consequence, not the JSON.** The tool call's raw arguments are the agent's internal representation of the action; the consequence is what happens in the world. Show the consequence. A human reviewing `{"path": "/var/lib/app/db.sqlite", "op": "truncate"}` is being asked to do the interpreter's job.

**And preview at the right level.** Phase 3's batching advice applies: previewing a plan is often better than previewing six actions, because the human sees the shape of the work and can object to the *approach* rather than to each step. The two are complementary — plan-level for direction, action-level for anything irreversible.

**Where previews stop working.** A preview cannot make a consequential action safe; it makes it **legible**. And legibility has limits: a human who does not know the system well can read a correct preview and still approve something harmful, which is why containment (Part 4) does not depend on the human's expertise. There is also a hard limit when volume is high — 200 approvals a day is not review, whatever the previews look like.

### Part 4 — Containment: the control that holds

Everything so far depends on a human or a model behaving well. Containment depends on neither. It is the layer where you assume **the model has been fully compromised** and ask: what can it reach?

That is the right mindset, and it makes the work concrete. **Assume a successful injection and design so that success is survivable.**

**Least privilege.** The agent gets the minimum it needs to do its job — not the permissions that were convenient to grant. Practically: a dedicated unprivileged user, not root; write access to one working directory, not the home directory; the specific database it needs, not the database superuser.

**Filesystem scoping.** The working directory is writable; everything else is read-only or invisible. Watch for the classical escapes — `..` traversal, symlinks pointing outward, and absolute paths — which is why scoping must be enforced by the operating system rather than by checking path strings in your code.

```bash
# Scoped to one directory, no traversal out, no network.
docker run --rm \
  --network none \
  --read-only \
  --tmpfs /work:rw,size=64m \
  -v /host/project/inputs:/work/inputs:ro \
  --user 1000:1000 \
  --memory 512m --cpus 1 \
  agent-sandbox
```

Every flag there is a control, and reading them as a set is the lesson: **no network**, so exfiltration has nowhere to go; **read-only root**, so the agent cannot modify its own environment; **a small writable tmpfs**, so "write the plan to a file" still works; **inputs mounted read-only**, so source data cannot be corrupted; **a non-root user**; and **resource limits**, so a runaway loop (Phase 3) cannot take the host down.

**Network egress restriction is the most commonly skipped control and the one that matters most for injection.** Think about what an injection attack needs: it must get instructions *in* and data *out*. Getting instructions in is easy — the agent reads an untrusted document. **Getting data out is the step you can actually block.** An allowlist of destinations, or no network at all with a proxy for the tools that genuinely need it, converts "the agent exfiltrated every API key it could read" into "the agent tried to make a request and failed."

**Secrets — never in the agent's environment if avoidable.** If the agent can read a credential, an injection can steal it. Where a tool needs a credential, keep it in the tool's process, not in the model's context: the agent calls `send_report(...)`; the *tool* holds the SMTP password. This is Phase 2's execution layer doing security work, and it is the reason "your code executes" keeps paying dividends.

**Test containment by attempting escape.** A sandbox you have not attacked is a sandbox you do not know works — the identical argument Phase 3 made about untested caps. Deliberately try: write outside the working directory, resolve a symlink outward, reach the network, read a credential from the environment, allocate unbounded memory. **Record what succeeded.** Anything that succeeded is your actual attack surface, regardless of what the configuration was supposed to do. This is the single most valuable exercise in the phase.

**Where containment stops working.** Three honest limits. It constrains **capability but not correctness** — a contained agent can still produce wrong answers, and containment says nothing about whether the work is right. It has a **capability cost**, since the isolation that stops exfiltration also stops legitimate network tools. And it is **only as good as its configuration**, which is why task 10 exists: the gap between "I set up a container" and "I verified the container holds" is where most incidents live.

### Part 5 — Injection, with the defences in place

Phase 5 established the attack. This is the re-run with the controls built.

**The attack, restated compactly.** Indirect prompt injection (Greshake et al., arXiv:2302.12173) exploits the fact that LLM-integrated applications **blur the line between data and instructions**. An adversary with no direct interface injects prompts into data likely to be retrieved; the demonstrated attacks reach real systems and include data theft and worming. The paper's own conclusion is that **effective mitigations are currently lacking** — which is why this phase's approach is not "prevent the injection" but "make a successful injection not matter."

**Walk the attack through the five-layer table from Part 1**, because the point is to see which layers do work:

| Layer | What it does against the injection |
|---|---|
| Prompt instruction | May be overridden — assume it fails |
| Input provenance (Phase 5) | Marks the retrieved text as untrusted, so a derived write is flagged |
| Action preview + gate | A human sees *resolved* arguments — the exfiltration URL is visible |
| **Containment** | **No network, so there is nowhere to send the data** |
| **Capability minimum** | **No tool can read the secrets in the first place** |

The bottom two rows are the ones that hold under a *successful* injection, and that is the design conclusion of this phase. You are not trying to make the agent un-foolable. You are arranging things so that a fooled agent is an inconvenience.

**And note what makes the human layer weak on its own.** If the preview shows resolved actions, a careful reviewer can catch exfiltration — but only if they are paying attention to the fortieth approval of the day, and only if they recognise the URL as suspicious. **The human layer is real and it is not reliable**, which is exactly why it sits above containment rather than replacing it.

**Report your result honestly.** When you re-run the injection test from Phase 5 task 11 against your containment, one of three things happens, and all three are informative. The injection fails to reach memory — good, and you should note *which* layer stopped it. The injection reaches memory but cannot act — the contained failure, and a legitimate outcome. The injection reaches memory and acts — and you have found your real attack surface, which is the most valuable result you could get from this exercise.

**Where this whole approach stops working.** Residual risk is irreducible, and the honest engineering position is that you **accept** a specific amount of it rather than eliminating it. The frameworks are explicit about this: OWASP's Top 10 for LLM Applications and NIST's AI Risk Management Framework both treat risk as something to identify, measure and manage rather than to remove. Write down your residual risk — what a fully compromised agent could still reach after all five layers — and revisit it when the agent gains a tool or a permission. **The number is the deliverable of this phase, and it is the input to Phase 7's evaluation and to the Safety & Ethics track.**

## Hands-on practice tasks

1. Write down your agent's actions and classify each as read, reversible write, or irreversible. Note how many are currently gated. <!-- id: agent-06-safety-human-in-loop-t01 band: quick energy: low -->
2. Take a safety instruction from your system prompt and list three distinct ways it could be defeated without the model disobeying it. <!-- id: agent-06-safety-human-in-loop-t02 band: focused energy: high -->
3. Implement the four gate levels and assign each of your tools a level by consequence rather than by name. Justify every irreversible action's placement. <!-- id: agent-06-safety-human-in-loop-t03 band: deep energy: high -->
4. Implement the "deny and park" default for when no human is present, and show that a pending action surfaces later rather than disappearing. <!-- id: agent-06-safety-human-in-loop-t04 band: focused energy: normal -->
5. Build the preview renderer: resolved paths, expanded globs, the actual diff, quantified blast radius, and a line naming irreversibility. <!-- id: agent-06-safety-human-in-loop-t05 band: deep energy: high -->
6. Show the same file-modifying action as "will edit the file" and as an actual diff. Ask someone to decide from each and record whether the first was decidable at all. <!-- id: agent-06-safety-human-in-loop-t06 band: focused energy: high -->
7. Write the blocked-action message and verify the agent continues usefully rather than retrying or stalling. <!-- id: agent-06-safety-human-in-loop-t07 band: focused energy: normal -->
8. Contain an agent: separate user, one writable directory, no network, resource limits. Document every flag and what it prevents. <!-- id: agent-06-safety-human-in-loop-t08 band: deep energy: high -->
9. Restrict network egress to an allowlist and verify that a request to a non-listed destination fails. This is the exfiltration control. <!-- id: agent-06-safety-human-in-loop-t09 band: deep energy: high -->
10. **Attempt escape.** Try to write outside the working directory, resolve a symlink outward, reach the network, read a credential, exhaust memory. Record every attempt and its result. <!-- id: agent-06-safety-human-in-loop-t10 band: deep energy: high -->
11. Re-run the Phase 5 injection test against your contained agent. Record which layer stopped it, or that it succeeded and what it reached. <!-- id: agent-06-safety-human-in-loop-t11 band: deep energy: high -->
12. Measure your gate's firing rate over a real session. If it exceeds a handful per hour, find what to demote to a lower level. <!-- id: agent-06-safety-human-in-loop-t12 band: focused energy: normal -->
13. Move one credential out of the agent's environment and into the tool's process, so the agent calls the tool but never sees the secret. <!-- id: agent-06-safety-human-in-loop-t13 band: deep energy: high -->
14. Write your residual-risk statement: what a fully compromised agent could reach after all layers. Keep it current as tools and permissions are added. <!-- id: agent-06-safety-human-in-loop-t14 band: ongoing energy: normal -->

## Common Pitfalls

**Treating a prompt instruction as a security control.** An instruction is a preference the model may follow; the executor is the control. This is the phase's foundational error, and everything else here is a correction to it.

**Believing improved instruction-following solves injection.** The instruction hierarchy genuinely and substantially increases robustness, and it remains a mitigation rather than an enforcement mechanism — it makes the model more likely to ignore a malicious instruction, not unable to act on one. A bypass bypasses the control entirely, because the control lived in the model's judgement.

**Gating by tool name instead of by consequence.** "Approve all `write_file`" is too strict on harmless scratch writes, which trains click-through, and too loose on `run_shell` and `http_post`, which can delete a database or exfiltrate secrets without being called `write_file`.

**Firing the gate too often.** Forty prompts a day produce forty reflex approvals, and the fortieth is not a decision. A gate that fires constantly is worse than no gate, because it manufactures a record of consent that no human actually gave.

**Previewing the intention rather than the resolved action.** "Delete files matching the pattern" is undecidable; three specific paths are decidable — and only the resolved form reveals when a pattern matches 3,000 files instead of 3.

**Showing the tool call's JSON instead of the consequence.** Raw arguments are the agent's internal representation; the human is then made to do the interpreter's job, which is where misapprovals come from.

**Failing to quantify blast radius.** "Pay outstanding invoices" invites approval. "Pay 12 invoices, 148,300.00 PHP, largest 62,000.00 to Acme, cannot be undone" supports a decision.

**Leaving a blocked action as a dead end.** An agent that receives a bare denial retries or stalls, and the predictable outcome is that someone disables the gate. Say what was blocked, that it is pending, and what to do next.

**Proceeding when no human is present because nobody objected.** That converts the gate into a delay. The safe default is deny and park, decided explicitly rather than accidentally.

**Skipping network egress restriction.** It is the most commonly omitted control and the one that matters most against injection: getting instructions in is easy, and blocking data from getting *out* is the step you can actually enforce. Without it, an exfiltration attempt succeeds.

**Assuming a configured sandbox holds.** The gap between "I set up a container" and "I verified the container holds" is where incidents live. Attack your own containment deliberately and record what succeeded.

**Leaving credentials in the agent's environment.** If the agent can read a secret, an injection can steal it. Keep credentials in the tool's process so the agent calls the capability without seeing the key.

**Believing containment makes the work correct.** It constrains capability, not correctness. A perfectly contained agent can still produce confidently wrong output, which is Phase 7's problem.

## Deliverable / proof of work

Write `portfolio/agents/06-safety-human-in-loop.md` containing:

- **The safety-instruction analysis** — one prompt instruction and three distinct ways it could be defeated without the model disobeying it.
- **The gate design** — every tool assigned a level by consequence and reversibility, with the irreversible ones justified individually.
- **The preview comparison** — the same action shown as an intention and as a resolved, quantified preview, with a note on whether the first was decidable at all.
- **The gate firing rate** — measured over a real session, and what you demoted if it was too high.
- **The containment configuration** — every flag or control, with what each one prevents.
- **The escape attempts** — every attack you tried and its result, including what succeeded. This is the phase's most valuable evidence.
- **The injection re-run** — the Phase 5 test against your contained agent, which layer stopped it or what it reached, reported honestly.
- **The credential move** — one secret relocated from the agent's environment into the tool's process.
- **The residual-risk statement** — what a fully compromised agent could still reach, written down and dated.

## Checklist

- [ ] I can explain why a prompt instruction cannot enforce a safety property <!-- id: agent-06-safety-human-in-loop-c01 energy: high -->
- [ ] I can state what the instruction hierarchy does and does not solve <!-- id: agent-06-safety-human-in-loop-c02 energy: normal -->
- [ ] I gate by consequence and reversibility, not by tool name <!-- id: agent-06-safety-human-in-loop-c03 energy: high -->
- [ ] Every irreversible action in my agent requires approval before it runs <!-- id: agent-06-safety-human-in-loop-c04 energy: high -->
- [ ] My gate does not fire so often that approval becomes reflexive <!-- id: agent-06-safety-human-in-loop-c05 energy: high -->
- [ ] My previews show resolved actions, actual diffs and quantified blast radius <!-- id: agent-06-safety-human-in-loop-c06 energy: high -->
- [ ] My previews name irreversibility where it applies <!-- id: agent-06-safety-human-in-loop-c07 energy: normal -->
- [ ] A blocked action produces an actionable message and the agent continues usefully <!-- id: agent-06-safety-human-in-loop-c08 energy: normal -->
- [ ] I have an explicit deny-and-park default for when no human is present <!-- id: agent-06-safety-human-in-loop-c09 energy: high -->
- [ ] My agent runs with least privilege rather than with what was convenient <!-- id: agent-06-safety-human-in-loop-c10 energy: high -->
- [ ] My agent's filesystem is scoped and the scoping is enforced by the OS, not by path checks <!-- id: agent-06-safety-human-in-loop-c11 energy: high -->
- [ ] Network egress is restricted, so exfiltration has nowhere to go <!-- id: agent-06-safety-human-in-loop-c12 energy: high -->
- [ ] Credentials live in tools rather than in the agent's environment where possible <!-- id: agent-06-safety-human-in-loop-c13 energy: high -->
- [ ] I have deliberately attempted escape and recorded what succeeded <!-- id: agent-06-safety-human-in-loop-c14 energy: high -->
- [ ] I have re-run the injection test against my containment <!-- id: agent-06-safety-human-in-loop-c15 energy: high -->
- [ ] I have written down my residual risk rather than assuming it is zero <!-- id: agent-06-safety-human-in-loop-c16 energy: high -->
- [ ] I understand containment constrains capability, not correctness <!-- id: agent-06-safety-human-in-loop-c17 energy: normal -->

## Quiz

### Q1. Your system prompt says the agent must never delete files outside its working directory. Why is this not a security control? <!-- id: agent-06-safety-human-in-loop-q01 energy: high -->

- [x] Because it is a preference the model may follow, and every way it can fail — injection, misread path, traversal, a weaker model — is a case where the guard was consulted and lost, since it had no enforcement power
- [ ] Because system prompts are too short to express such rules
- [ ] Because models cannot understand filesystem paths
- [ ] Because the rule is too specific to generalise

**Why:** A control must be able to prevent an action regardless of what the model decides, and text the model may follow cannot do that — the same argument RAG Phase 6 made about access control in prompts and Phase 2 made about validation living in the executor. Traversal, symlinks and variable expansion are all cases where the *path* escapes while the instruction appears satisfied. Length and path comprehension are not the issue; the model may understand the rule perfectly and still act against it.

### Q2. The instruction hierarchy substantially increased robustness. What does the phase conclude from that? <!-- id: agent-06-safety-human-in-loop-q02 energy: high -->

- [ ] That prompt injection is now a solved problem
- [x] That it is a genuine mitigation rather than an enforcement mechanism — it makes the model more likely to ignore a malicious instruction, not unable to act on one, so a bypass bypasses the control entirely
- [ ] That containment is therefore unnecessary
- [ ] That only untrained attack types remain a risk

**Why:** The distinction between "more likely to resist" and "unable to comply" is the whole argument: a control that lives in the model's judgement is defeated by defeating the model's judgement. The work is real and promising — applied to GPT-3.5 it drastically increased robustness even against unseen attack types with minimal capability degradation — and it sits at the top of the defence-in-depth table precisely because the layers below assume it failed. The injection paper's own conclusion that effective mitigations are lacking remains the honest framing.

### Q3. Which is the correct axis for deciding where to place an approval gate? <!-- id: agent-06-safety-human-in-loop-q03 energy: high -->

- [ ] The tool's name
- [ ] The number of tokens the action costs
- [ ] Whether the action uses the network
- [x] The consequence and reversibility of the action

**Why:** Tool names are both too strict and too loose: gating all `write_file` calls trains click-through on harmless scratch writes, while `run_shell` and `http_post` can delete a database or exfiltrate secrets without carrying a name that looks dangerous. Reversibility maps cleanly onto the four levels — reads need no gate, reversible writes can be undone, and irreversible or externally-visible actions are where approval before the fact belongs. Network use is a useful signal for exfiltration risk but is neither necessary nor sufficient as the gating criterion.

### Q4. Why is a gate that fires very frequently worse than no gate at all? <!-- id: agent-06-safety-human-in-loop-q04 energy: high -->

- [x] Because forty prompts a day produce forty reflex approvals, so the gate manufactures a record of consent that no human actually gave
- [ ] Because it slows the agent down significantly
- [ ] Because it increases token cost on every step
- [ ] Because humans will disable the agent entirely

**Why:** The harm is epistemic rather than operational: you end up with logs showing forty human approvals and no human having approved anything, which is a false audit trail and worse than having no gate because it looks like oversight exists. Latency and token cost are real but secondary, and disabling the agent is one possible outcome among several — the more common and more dangerous one is that the gate stays in place and stops meaning anything.

### Q5. Which preview allows a human to make a real decision about a file-deleting action? <!-- id: agent-06-safety-human-in-loop-q05 energy: normal -->

- [ ] "The agent wants to clean up old report files"
- [ ] "The agent wants to call delete_files with a glob pattern"
- [x] The three resolved absolute paths that will be deleted, with a note that deletion cannot be undone
- [ ] The JSON arguments of the tool call

**Why:** Only the resolved form is decidable, and the reason is that resolution is where surprises appear — a pattern intended to match three files may match three thousand, and nothing short of the resolved list reveals it. Raw JSON makes the human do the interpreter's job, which is where misapprovals originate. Describing the intention or the mechanism gives the reviewer nothing to evaluate, which is the rubber-stamp failure.

### Q6. Why is network egress restriction especially important against prompt injection? <!-- id: agent-06-safety-human-in-loop-q06 energy: high -->

- [x] Because an attack must get instructions in *and* data out, and blocking egress is the step you can actually enforce — so exfiltration has nowhere to go
- [ ] Because untrusted documents are usually fetched over the network
- [ ] Because restricting egress makes the model less likely to follow injected instructions
- [ ] Because it reduces token costs by limiting retrieval

**Why:** Getting instructions in is easy, since the agent reads untrusted content by design; getting data out is the enforceable half of the attack, and it is the half most commonly left open. An exfiltration attempt that fails turns a data breach into a logged error. Egress rules do not change the model's behaviour at all — that is the point, since the control does not depend on the model resisting anything.

### Q7. Your agent is in a container with no network, a read-only root and a scoped tmpfs. What does this guarantee? <!-- id: agent-06-safety-human-in-loop-q07 energy: high -->

- [ ] That the agent's output is correct
- [ ] That the agent cannot be manipulated by injected instructions
- [ ] That the agent cannot consume excessive resources
- [x] That a compromised agent cannot easily reach or exfiltrate anything valuable — while saying nothing about whether its work is correct or whether it can still be fooled

**Why:** Containment constrains capability, not correctness or susceptibility: a perfectly contained agent can still be manipulated into producing confidently wrong output, which is Phase 7's problem rather than this phase's. Fooling the agent is what injection does, and containment is designed on the assumption that fooling succeeds. Resource exhaustion is addressed separately — by the memory and CPU limits that are a distinct part of the configuration.

### Q8. Why is testing containment by attempting escape essential? <!-- id: agent-06-safety-human-in-loop-q08 energy: high -->

- [ ] Because it proves the sandbox is correctly configured
- [x] Because a sandbox you have not attacked is one you do not know works — the gap between "I set up a container" and "I verified it holds" is where incidents live, and anything that escaped is your real attack surface
- [ ] Because it is required by security frameworks
- [ ] Because it measures the agent's capability

**Why:** Configuration intent and configuration effect differ, and the only way to learn which you have is to attack it — the same argument Phase 3 made about never testing a cap. Crucially, a successful escape is a *useful* result rather than a failure: it tells you what your actual exposure is, whereas an untested sandbox tells you only what you hoped. Frameworks recommend risk assessment generally, and capability measurement is a different exercise.

### Q9. Your agent hits an approval gate and the action is denied. What should the agent receive? <!-- id: agent-06-safety-human-in-loop-q09 energy: normal -->

- [ ] Nothing, so it cannot infer anything about the safety system
- [x] A message naming what was blocked, that it is pending approval, and instruction not to retry but to continue with permitted work — so the gate does not become an unrecoverable stall
- [ ] A generic error, to keep the gate's logic opaque
- [ ] A prompt to try an alternative approach that achieves the same effect

**Why:** A bare denial causes the agent to retry or stall, and the predictable outcome is that a human disables the gate to restore function — a safety feature that produces a reliability problem gets removed. Phase 2's actionable-error principle and Phase 3's stuck-loop message both apply. Instructing the agent to seek an alternative route to the same effect would be actively wrong, since that is circumvention rather than recovery.

### Q10. What is the correct mindset for designing containment? <!-- id: agent-06-safety-human-in-loop-q10 energy: low -->

- [ ] Assume the model will resist manipulation and add belt-and-braces
- [ ] Assume the injection cannot happen and focus on efficiency
- [x] Assume the model has been fully compromised, and design so that a successful injection is survivable rather than prevented
- [ ] Assume a human will always be watching and design for their convenience

**Why:** This reframing is the phase's answer to Phase 5's admission that effective injection mitigations are lacking: if you cannot prevent the compromise, arrange things so the compromise does not matter. It also explains why the strongest layers are enforced by the operating system and by capability limits rather than by the model — they hold under exactly the assumption that the model has failed. Assuming a human is always present is a separate and unsafe assumption, which is why every gate needs a deny-and-park default.

## You're ready to move on when...

You can explain why a prompt instruction is a preference rather than a control, and state accurately what the instruction hierarchy does and does not solve. Every tool in your agent is assigned a gate level by **consequence and reversibility**, and every irreversible action requires approval before it runs.

Your previews show **resolved** actions — expanded paths and globs, actual diffs, quantified blast radius, and a line naming irreversibility — and you have shown someone the same action as an intention and as a resolved preview and recorded whether the first was decidable. You have measured your gate's firing rate over a real session and demoted anything that made approval reflexive. A blocked action produces a message the agent can act on, and you have an explicit deny-and-park default for when nobody is present.

Your agent runs with least privilege, a scoped filesystem enforced by the operating system, and **restricted network egress**. Credentials live in tools rather than in the agent's environment where you could manage it. You have **deliberately attempted escape** and recorded what succeeded — including any success, which is your real attack surface.

And you have re-run the Phase 5 injection test against your contained agent, reported which layer stopped it or what it reached, and written down your **residual risk**: what a fully compromised agent could still reach after all five layers. That number is the deliverable, and it is the input to Phase 7.

## Free vs Paid

### What's free is enough

The whole phase, and this is the one where a zero-budget setup is genuinely at no disadvantage — because **containment is operating-system work, not model work.**

Docker or Podman, a dedicated unprivileged user, filesystem scoping, firewall rules and resource limits are all free and open source. The gate is a conditional and the preview is string formatting. Everything load-bearing in this phase runs on infrastructure you already have, and none of it consults an API.

**The escape-attempt exercise is free and is the phase's best evidence.** Attacking your own sandbox costs only time. The result — a list of what actually escaped — is worth more than any configuration review, and it does not improve with a larger budget.

**The injection re-run needs repetition rather than capability.** Running injection attempts repeatedly against your contained agent is exactly the workload Phase 7 of Cost argued belongs on a local model, and a weaker model is *more* likely to comply with an injection, which makes the test more informative rather than less. You want the attack to succeed often enough to exercise your containment, and a small local model supplies that.

**The credentials work is free and is the highest-leverage change available.** Moving a secret out of the agent's environment and into the tool's process removes an entire exfiltration path for the cost of some refactoring. A frontier model does not make an agent-read credential safer.

**Two honest limitations.** Resource limits and isolation are more awkward without container tooling, and on Windows or macOS the namespace facilities differ from Linux — but a container runtime or a VM covers both. And the *preview quality* does depend on the model somewhat, since a weaker model produces messier resolved arguments; that is a legibility problem rather than a security one, and the containment layer does not care.

### What a paid tier adds

Three things, and the honest framing is that they improve the **upper** layers of the defence-in-depth table rather than the load-bearing ones.

**Better instruction-following, which reduces how often the real controls fire.** A capable model follows safety instructions more reliably and attempts fewer dangerous actions, so your gate fires less and your containment is exercised less. This is a genuine reduction in operational friction and **not** a security guarantee — instruction-hierarchy work makes the model more likely to resist, not unable to comply, and a bypass bypasses the control entirely.

**Better judgment about when an action warrants caution**, which produces better previews and fewer badly-aimed tool calls. Again: fewer incidents, not a different class of safety.

**Stronger resistance to injected instructions**, which reduces attack frequency. The caveat is the one Phase 5 stated and this phase repeated: the injection literature's own conclusion is that effective mitigations are currently lacking, and that applies across model capability. A more capable model is a harder target and still a target.

**What money does not buy** is the design. Whether an action is gated by consequence or by name, whether the preview shows resolved arguments, whether egress is restricted, whether credentials sit in the tool or the environment, and what residual risk you are accepting are all engineering decisions. A frontier model with unrestricted network access and credentials in its environment is one successful injection away from a serious incident, and its fluency makes the resulting action harder to notice.

**Volatile, dated: as of 2026-09, prompt-injection defences, instruction-hierarchy training, and agent security benchmarks such as AgentDojo (arXiv:2406.13352) are all active research areas rather than settled ones. Check current work rather than assuming any mitigation, including those described in this lesson, is sufficient.**

### When it's worth paying

**Not for this phase.** Every task runs locally or on free infrastructure, and the deliverables are a gate design, a preview comparison, an escape-attempt log and a residual-risk statement.

The threshold is specific: **when your agent is failing at the task rather than at safety, and you have already built the controls.** Those are different problems and the ordering matters. If your agent takes unsafe actions, a better model will take fewer of them — and you still cannot ship an agent whose safety depends on the model choosing well, because the remaining failures are exactly the ones your controls exist for. Build the gate and the containment first; then a stronger model is an optimisation on top of a system that is already safe when it fails.

If your controls are in place and the agent is simply not capable enough to do the work, then you have isolated a capability gap, and one paid comparison against your own task suite is a decision-changing experiment in Phase 7 of Cost's sense. Note what paying does not change: the residual-risk number. A more capable agent may reach less often, and the consequences of reaching are identical — so the gate levels, the resolved previews and the containment configuration remain yours to get right at any price.
