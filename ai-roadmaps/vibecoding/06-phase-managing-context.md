---
id: vb-06-managing-context
track: vibecoding
phase: 6
order: 15
title: Managing Context in a Coding Session
duration: 1 week
duration_weeks: 1
energy_mix: [normal, high]
deliverable: portfolio/vibecoding/06-managing-context.md
exit_criteria: >
  You can explain why a long session degrades rather than merely getting slower, and
  you externalise state to files so a fresh session can resume without re-explaining.
  You start a new session deliberately when the task changes rather than when the tool
  forces you to, and you have measured a real degradation in your own work.
---

# Phase 6 — Managing Context in a Coding Session

## Goal of this phase

This phase is about a failure that does not announce itself, which is why it costs so much. A long coding session does not break — it **degrades**, and the degradation looks like the model getting careless.

You have experienced this. An hour in, the model starts forgetting a constraint you established at the beginning. It re-suggests an approach you rejected. It edits a file in a way that contradicts something it wrote twenty minutes ago. It feels like the model got dumber, and the natural response is to repeat yourself, get more emphatic, or blame the tool.

None of that is what happened. **The model has no memory.** Every turn, the entire conversation is re-sent as input, and the model sees all of it fresh. What changes as a session grows is not the model — it is **what is competing for attention inside a fixed window**, and how much of the early, load-bearing information has been pushed far from the point where it is needed.

Two mechanisms produce the degradation, and they are worth separating.

**First, a hard limit that is closer than you think.** The context window is finite, and when a session exceeds it something must be dropped, summarised, or truncated. That is visible and mechanical.

**Second — and this is the one that bites first, long before any limit is reached — attention dilutes.** Even a session comfortably inside the window degrades, because a constraint stated at turn 2 is now 40,000 tokens away from turn 60 and competes with everything in between. The model does not weight your early constraint as a rule; it sees it as text among text.

The practical consequence is the phase's organising idea:

> **Context is a budget, and the state that matters should live in files, not in the conversation.**

A file is durable, diffable, reviewable, and survives the session ending. A conversation is none of those things. So the discipline is to move anything you would be annoyed to lose out of the chat and into the repository — and to start a fresh session deliberately when the work changes, rather than when the tool forces a truncation at the worst moment.

By the end you will have measured the degradation in your own work: the same task attempted in a long session and a fresh one, with an honest comparison.

## Estimated time

**1 week** at 1–2 hours a day, 5 days a week. Roughly 7–9 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Why sessions degrade: the two mechanisms, not one | 1.5h |
| 2 | The four things worth externalising, and where they go | 2h |
| 3 | Writing a handoff note a fresh session can resume from | 2h |
| 4 | When to start fresh, and when to continue | 1.5h |
| 5 | Measuring the degradation in your own work | 2h |

If you only have two hours, do tasks 3, 6 and 14. Those give you the externalisation habit, a real handoff note, and the measurement.

## Skills you'll gain

- Explain session degradation in terms of attention and window limits rather than model quality.
- Identify which information is load-bearing and must survive a session boundary.
- Externalise goal, constraints, decisions, and current state into files.
- Write a handoff note that lets a fresh session resume without re-explanation.
- Decide deliberately when to start a new session rather than when the tool forces it.
- Keep a long task coherent across several sessions.
- Recognise the symptoms of a degraded session and distinguish them from a model that is actually failing.

## Specific topics to learn

- **No memory, full re-send** — what actually happens on every turn.
- **Attention dilution** — degradation well inside the window, and why it comes first.
- **The window limit** — truncation, summarisation, and what gets lost.
- **Externalising state** — goal, constraints, decisions, current state.
- **The handoff note** — the artefact this phase produces, and its structure.
- **Fresh-session discipline** — task boundaries as session boundaries.
- **Symptoms of degradation** — constraint amnesia, circular revisiting, contradictory edits.
- **What not to externalise** — the cost of an over-documented project.
- **Task size** — why a task that fits one session goes better than one that does not.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| A notes file in your repo | Where externalised state lives | Free | — | Tasks 3, 6 | Any file you will actually re-read |
| Git | The session boundary is a commit boundary | Free | https://git-scm.com | Tasks 5, 8 | — |
| A `NOTES.md` or `PLAN.md` convention | A predictable place a new session can be pointed at | Free | — | Task 6 | Any name, used consistently |
| Any AI coding tool | The session being managed | Free tier — try **Antigravity CLI** or **Copilot Free** | https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli | Tasks 2, 9 | A local model via Ollama, 16 GB RAM for gpt-oss-20b |
| Ollama (local) | A session with no per-token cost, so long runs are affordable | Free | https://ollama.com | Task 11 | — |

## Free/cheap resources

- **`docs/research/vibecoding-tool-landscape.md`** — in this repository — the verified free-tier table, including which tools need a credit card and which train on free-tier code.
- **Agents Phase 5 (context)** — in this repository — the same problem from the agent-design angle, with more on how context is assembled.
- **Prompting Phase 5 (long context)** — in this repository — what happens to information placed far from the point of use.
- **Vibecoding Phase 2 (specification)** — in this repository — the brief is the first thing worth externalising, because it is exactly what a long session forgets.
- **Vibecoding Phase 4 (tests as the contract)** — in this repository — a test suite is durable state that enforces itself, which is better than a note.
- **shared/study-rules.md** — in this repository — relevant because session-length discipline is really attention discipline.

## Lesson: Context Is a Budget, and Conversations Are Not Storage

### Part 1 — What actually happens on every turn

Start with the mechanism, because almost every bad intuition about long sessions comes from assuming the model remembers.

**The model has no memory of your conversation.** On every single turn, the entire history — your messages, its replies, the files it read, the command output — is sent again as input. The model sees all of it fresh, every time. There is no state carried between turns except what is in that payload.

Two consequences follow immediately, and they explain most of what people misattribute to model quality.

**The window is a hard limit.** When the accumulated history exceeds the context window, something must give: the oldest turns are dropped, or the middle is summarised, or content is truncated. Whatever mechanism is used, **information is lost**, and it is usually lost from the beginning — which is where your goal and constraints live.

**⚠️ Volatile, dated: as of 2026-09, context windows on free tiers are the binding constraint, and vendors generally do not publish them.** The verified brief in this repository records that several free tiers state only that "an allowance" exists without numbers (Copilot Free, Cursor Hobby, Codex Free), and that Google **removed the Gemini API free-tier rate limits from its public docs**. Treat your own observed behaviour as the data: if a session starts forgetting, you have found the limit empirically, which is more useful than a published number you cannot see.

### Part 2 — Attention dilution, which comes first

Here is the part people miss, and it is why "just start a new chat when it gets full" is incomplete advice.

**A session degrades long before it is full.** Suppose your goal and constraints were stated in the first two turns. Thirty turns later, that text is still in the window — nothing has been dropped — but it now sits tens of thousands of tokens away from the current question, competing with everything since. It has not been forgotten. It has been **diluted**.

So the constraint you set at the start behaves less like a rule and more like background text, and the model may violate it without any window limit being reached at all. This is why the degradation arrives earlier than the arithmetic suggests, and why it feels arbitrary: the session is nowhere near full, yet it has already started drifting.

Now a second effect, subtler and more damaging. **A session accumulates its own mistakes as context.** If the model proposed a wrong approach at turn 10 and you corrected it, that wrong approach is still in the window — and it is now part of the material the model is conditioning on. Corrected errors do not disappear; they become things that were said. A long session can therefore drift *because of its own history*, and it is one of the few failure modes where continuing makes things worse rather than better.

### Part 3 — The symptoms, so you can name what you are seeing

Worth listing, because recognising the pattern is most of the fix. A degrading session looks like:

**Constraint amnesia.** It violates a rule you established early — a dependency limit, a style, an interface. It is not ignoring you; the rule has been diluted.

**Circular revisiting.** It proposes something you rejected twenty minutes ago, or asks a question you already answered. The rejection is in the window but far away.

**Contradictory edits.** It changes a file in a way that conflicts with its own earlier change. Two turns' worth of intent are now in tension and neither dominates.

**Confident drift.** Output stays fluent and confident throughout. **This is the dangerous property**: a degraded session does not look degraded. It looks like a model giving you plausible answers, which is exactly what it looked like when it was working.

**Repeating yourself with rising emphasis.** "I said no new dependencies." "Remember: no new dependencies." When you start escalating your phrasing, you are compensating for dilution manually — and you are adding more text to an already crowded window, which makes it slightly worse.

### Part 4 — The four things worth externalising

The fix is not to manage the conversation better. It is to **stop keeping important state in the conversation.**

Four categories, and each one has a natural home:

| State | Where it lives | Why there |
|---|---|---|
| Goal and constraints | `PLAN.md`, or the brief from Phase 2 | They change rarely and must survive every session |
| Decisions and their reasons | `DECISIONS.md` or a comment at the site | So a fresh session does not re-litigate settled questions |
| Current state — what works, what is next | `NOTES.md`, updated as you go | The thing you would otherwise re-explain every morning |
| Behaviour you rely on | Tests | They enforce themselves, and cannot drift |

That last row is the strongest one and deserves emphasis. **A test suite is externalised state that checks itself.** Phase 4's tests are not only a correctness tool; they are the most durable form of memory in a project, because they cannot silently rot the way a note can. If you want a constraint to survive sessions reliably, encode it as a test.

The others are prose, and prose can go stale. That is the honest cost of this technique: **a note that is wrong is worse than no note**, because a fresh session will trust it. So update them at session end rather than letting them drift, which is exactly the habit Part 6 formalises.

### Part 5 — The handoff note

The concrete artefact, and the one to get right. Its purpose: **a fresh session, with none of the history, can resume the work from this file alone.** That is the test — not "is it complete" but "does it work with zero history".

Structure that does the job:

```markdown
# Current state: <task>

## Goal
  What must be true when this works. (From the Phase 2 brief.)
  Do not restate the whole brief -- link to it.

## Constraints
  - Python 3.12, no new dependencies
  - Must not change POST /auth/login request or response shapes

## Decided, do not revisit
  - Rate limiting is per-username, not per-IP. Reason: shared
    office NAT would lock out whole teams. Decided 2026-09-14.
  - Counter lives in memory, not Redis. Accepted: resets on
    restart. Revisit only if we go multi-instance.

## Current state
  - record_failure() implemented and tested (tests/test_auth.py).
  - NOT done: the middleware that calls it has not been written.
  - Failing test exists: test_rate_limit_returns_429 -- currently
    fails with 200, which is correct, the middleware is missing.

## Next step
  Write the middleware. Signature agreed:
      async def rate_limit_middleware(request, call_next)

## Traps
  - Do not "fix" the test. It is failing on purpose.
  - A previous attempt used a per-IP limit; see Decided above.
```

Read what this does. `Decided, do not revisit` stops the session re-proposing a rejected approach — which is Part 2's accumulation problem, solved by making the rejection durable instead of conversational. `Traps` prevents the specific failure where a fresh session sees a failing test and "fixes" it. And `Next step` means you never begin a session by re-deriving where you were.

**The entry that takes the most discipline is the reason.** "Rate limiting is per-username" is a decision; "because shared office NAT would lock out whole teams" is why it will not be re-decided. Decisions without reasons get re-opened, because a fresh session has no way to know whether the constraint was principled or accidental.

### Part 6 — Starting fresh deliberately

The judgement this phase is really teaching: **when to end a session.**

Start a new session when:

- **the task changes.** This is the big one. A new task deserves a clean window with a handoff note, not a crowded window containing the previous task's debris. Most long sessions that go badly should have been two sessions.
- **you have corrected the same thing twice.** The correction is diluted; repeating it adds noise. Externalise it and restart.
- **the output has started contradicting itself.**
- **you are about to do something risky** — a large refactor, an agent run. A clean context means the instructions you give are the loudest thing present.
- **the session has a natural boundary.** Finish a feature, commit, write the note, start fresh.

Continue when:

- the task is genuinely one coherent unit
- the window is comfortable and the output is still tracking your constraints
- **you are mid-debugging with live state you have not written down.** Restarting here loses the reproduction. Write the state down first — then restarting becomes possible and often helpful.

The last one is the tension worth naming: **fresh sessions are good, but not at the cost of unrecorded state.** The handoff note is what resolves it, which is why it is the deliverable rather than an aside.

**The 2026-09 free-tier layer.** On a metered free tier this phase becomes more than a quality practice. Verified limits in this repository's brief: Google Antigravity CLI and Copilot Free are genuinely free and **need no credit card**, both **train on free-tier code**, and neither publishes its quota. Claude Code has **no free tier at all**. A local model via Ollama removes the per-token cost entirely, so long sessions become affordable — at the price of a weaker model, and the verifiable requirement of roughly 16 GB of RAM for a capable local coding model. If you have the RAM, local is the one configuration where context discipline matters only for quality rather than for cost.

### Part 7 — What not to externalise

The failure mode in the other direction, since a phase about documentation can produce a documentation burden.

**Do not document what the code already says.** A file listing every function is duplication that will drift, and a stale duplicate is worse than nothing.

**Do not keep a changelog in a note.** That is what git is for, and git does it accurately.

**Do not write a note nobody reads.** If a file is not opened at the start of a session, it is not serving the purpose. The test is behavioural: does your next session actually start by reading it? If not, either the note is wrong or the habit is missing.

**Do not document speculative future work in detail.** Plans for work not started go stale fastest, because nothing forces them to be updated. One line saying what is next is enough; the detail belongs in the session that does it.

### Part 8 — Measure it, do not assume it

The phase argues that long sessions degrade. You should verify that claim about *your* workflow rather than accept it, because the size of the effect depends on the model, the window and the task — and because a measurement you did yourself is one you will act on.

The experiment: take two similar tasks of comparable size. Do one as the tail of a long session — two hours in, with the accumulated history. Do the other in a completely fresh session. Compare against the same criteria: constraint violations, how many corrections were needed before the output was right, and whether it was right at all.

**⚠️ A caution about this comparison, and it is a real confound.** The second task may go better because it is *second* — you have learned the shape, so both the brief and your review improve. That is a genuine alternative explanation and it does not invalidate the finding, but it does mean you should not report the comparison as clean evidence for session length alone. The honest write-up names the confound. This is the same standard the corpus applies elsewhere: a measurement with a known confound is still useful if the confound is stated, and misleading if it is not.

## Hands-on practice tasks

1. In your current project, find one constraint you established at the start of a long session. Check whether the most recent output still respects it. Constraint amnesia is the easiest symptom to observe and the most convincing when you see it in your own work. <!-- id: vb-06-managing-context-t01 band: focused energy: normal -->
2. Deliberately trigger degradation: start a session, state a constraint early, then have a long unrelated exchange, then ask for something the constraint governs. Record whether it held. This is Part 2 demonstrated rather than asserted. <!-- id: vb-06-managing-context-t02 band: focused energy: normal -->
3. List the four categories of state from Part 4 for your current project and write one line under each. If a category is empty, that is information — usually it means the decisions were never made explicit. <!-- id: vb-06-managing-context-t03 band: focused energy: normal -->
4. Write a `PLAN.md` containing only your goal and constraints, taken from your Phase 2 brief. Keep it under twenty lines; a plan nobody reads is not a plan. <!-- id: vb-06-managing-context-t04 band: focused energy: low -->
5. Create a `DECISIONS.md` with three entries from your project: the decision, its reason, and the date. The reason is the part that stops a fresh session re-litigating it, so write the reason in terms of what would go wrong otherwise. <!-- id: vb-06-managing-context-t05 band: focused energy: normal -->
6. Write a full handoff note using the Part 5 structure. Then test it properly: **open a completely fresh session, give it only that file, and ask it to state the next step.** If it cannot, the note is incomplete. This test is the whole phase in one action. <!-- id: vb-06-managing-context-t06 band: deep energy: high -->
7. Deliberately write a handoff note that omits the reasons for a decision. Give it to a fresh session and see whether the session proposes revisiting that decision. Then add the reasons and try again. <!-- id: vb-06-managing-context-t07 band: focused energy: high -->
8. At the end of your next real session, commit your work and start a fresh session pointed at your handoff note. Note whether the fresh session needed any re-explanation. <!-- id: vb-06-managing-context-t08 band: quick energy: normal -->
9. Take a task you are currently doing in one long session and split it into two sessions at a natural boundary. Compare how each half went against how the combined session was going. <!-- id: vb-06-managing-context-t09 band: focused energy: normal -->
10. Convert one constraint from your notes into a **test** instead. Note that it now enforces itself and cannot go stale. Prefer this over prose wherever the constraint is checkable, per Phase 4. <!-- id: vb-06-managing-context-t10 band: focused energy: high -->
11. If you have 16 GB of RAM and have not tried a local model, install Ollama and run a coding model. Note whether the absence of per-token cost changes how long you are willing to let a session run — that change in behaviour is the point, and it is the one place where context discipline is about quality alone rather than cost. <!-- id: vb-06-managing-context-t11 band: deep energy: high -->
12. Find a note in your project that has gone stale — it says something the code no longer does. Either fix it or delete it. A wrong note is worse than no note, because a fresh session will trust it. <!-- id: vb-06-managing-context-t12 band: focused energy: normal -->
13. Audit your notes for duplication of what the code already says. Delete the duplication. This is the over-documentation failure from Part 7, and it is more common than under-documentation once people learn this phase. <!-- id: vb-06-managing-context-t13 band: focused energy: low -->
14. Run the measurement from Part 8: two comparable tasks, one at the tail of a long session and one fresh. Record constraint violations, correction count, and whether the output was right. **Name the learning confound explicitly in your write-up** — the second task benefits from what you learned doing the first, and pretending otherwise would make the comparison dishonest. <!-- id: vb-06-managing-context-t14 band: deep energy: high -->
15. Write a one-sentence rule for yourself about when you will start a fresh session. A rule you have decided is more likely to be followed than a principle you have read. <!-- id: vb-06-managing-context-t15 band: quick energy: low -->

## Common Pitfalls

**Believing the model remembers.** It does not. Every turn re-sends the whole conversation. Once you internalise this, the rest of the phase follows — and until you do, long-session behaviour looks like a personality flaw in the tool.

**Waiting for the window to fill before restarting.** Attention dilutes long before the limit is reached, so a session can be badly degraded while nowhere near full. Part 2's experiment (task 2) is designed to make this visible.

**Escalating your phrasing instead of externalising.** "I said no new dependencies" adds text to a crowded window and makes dilution slightly worse. Move the constraint into a file and point at the file.

**Writing a handoff note you never test.** The note's only real test is whether a fresh session can resume from it alone. Task 6 does exactly that, and most first attempts fail it.

**Recording decisions without reasons.** "Use per-username limiting" invites re-litigation; "use per-username limiting because shared office NAT would lock out whole teams" does not. A fresh session has no way to tell a principled constraint from an accidental one.

**Restarting and losing live state.** A fresh session is good; a fresh session that has lost your reproduction is worse than a degraded one. Write the state down first, then restart — which is what the handoff note is for.

**Keeping a note that has gone stale.** A fresh session trusts the note. If it is wrong, the freshness makes the error more efficient to propagate, not less.

**Documenting what the code already says.** Duplication drifts, and stale duplication is worse than nothing. Notes are for goal, constraints, decisions and state — not for restating the implementation.

**Over-documenting as procrastination.** Writing about the work is not the work. If the note is longer than the code it describes, something has gone wrong.

## Deliverable / proof of work

- `portfolio/vibecoding/06-managing-context.md`, containing:
  - your `PLAN.md` content: goal and constraints only (task 4)
  - your `DECISIONS.md` entries with reasons and dates (task 5)
  - the full handoff note (task 6)
  - **the result of the fresh-session test** — what the fresh session could and could not determine from the note alone
  - the omitted-reasons experiment and its outcome (task 7)
  - the measurement from task 14, with the learning confound named explicitly
  - your one-sentence rule for starting fresh (task 15)
- `PLAN.md`, `DECISIONS.md` and the handoff note in your actual project — the deliverable is the working practice, not the write-up.

## Checklist

- [ ] I can explain that the model has no memory and the whole conversation is re-sent each turn <!-- id: vb-06-managing-context-c01 energy: normal -->
- [ ] I can distinguish attention dilution from the hard window limit, and say which comes first <!-- id: vb-06-managing-context-c02 energy: normal -->
- [ ] I can name the five symptoms of a degraded session <!-- id: vb-06-managing-context-c03 energy: normal -->
- [ ] I can list the four categories of state worth externalising and where each belongs <!-- id: vb-06-managing-context-c04 energy: normal -->
- [ ] I write decisions with their reasons, not just their conclusions <!-- id: vb-06-managing-context-c05 energy: normal -->
- [ ] I can write a handoff note a fresh session can resume from with no history <!-- id: vb-06-managing-context-c06 energy: normal -->
- [ ] I have tested a handoff note by giving it to a fresh session <!-- id: vb-06-managing-context-c07 energy: normal -->
- [ ] I start a new session when the task changes rather than when the tool forces it <!-- id: vb-06-managing-context-c08 energy: normal -->
- [ ] I convert checkable constraints into tests so they enforce themselves <!-- id: vb-06-managing-context-c09 energy: normal -->
- [ ] I know that a stale note is worse than no note <!-- id: vb-06-managing-context-c10 energy: low -->
- [ ] I have measured session degradation in my own work and named the confound <!-- id: vb-06-managing-context-c11 energy: normal -->
- [ ] I know which free coding tools need no credit card and which train on free-tier code <!-- id: vb-06-managing-context-c12 energy: low -->

## Quiz

### Q1. What happens to the conversation on each new turn? <!-- id: vb-06-managing-context-q01 energy: normal -->

- [ ] The model retains a compressed memory of earlier turns
- [x] The entire conversation is re-sent as input and seen fresh every time
- [ ] Only the most recent exchange is sent, plus a summary
- [ ] The model stores state in a session file between turns

**Why:** There is no state carried between turns except what is in the payload, which is why long-session behaviour has nothing to do with the model remembering or forgetting. Once this is internalised, the rest of the phase follows — and until it is, degradation looks like a personality flaw in the tool rather than a property of the window.

### Q2. Why does a session degrade before its context window is full? <!-- id: vb-06-managing-context-q02 energy: high -->

- [ ] Because the model slows down as the context grows
- [ ] Because vendors secretly reduce the window on free tiers
- [ ] Because the model summarises the middle of the conversation automatically
- [x] Attention dilutes: an early constraint competes with everything since, even with nothing dropped

**Why:** This is why "start a new chat when it is full" is incomplete advice. A constraint stated at turn 2 and needed at turn 60 is tens of thousands of tokens away and behaves more like background text than like a rule. Task 2 is designed to make this visible in your own work, since the arithmetic alone would suggest you have plenty of room.

### Q3. Which form of externalised state enforces itself and cannot go stale? <!-- id: vb-06-managing-context-q03 energy: normal -->

- [ ] A `NOTES.md` updated at the end of each session
- [ ] A `DECISIONS.md` entry with a date and reason
- [ ] A comment at the site of the constraint
- [x] A test

**Why:** Prose can rot silently, and a fresh session will trust a stale note. A test runs on every change and fails loudly when the constraint is violated, which is why the phase says to prefer encoding a checkable constraint as a test. Note that the other three are all legitimate — they are simply weaker than the one that checks itself.

### Q4. Which detail belongs in a handoff note's "decided, do not revisit" entry? <!-- id: vb-06-managing-context-q04 energy: high -->

- [x] The decision and the reason it was made
- [ ] The decision alone, stated as a rule
- [ ] A list of alternatives that were considered
- [ ] The date the decision was made and who made it

**Why:** A decision without a reason gets re-opened, because a fresh session cannot tell a principled constraint from an accidental one. Task 7 has you deliberately omit the reasons and observe a fresh session propose revisiting the decision — that experiment is the argument for this entry's shape, and dates alone do not substitute for it.

### Q5. You are mid-debugging with a reproduction you have not written down, and the session is degrading. What should you do? <!-- id: vb-06-managing-context-q05 energy: normal -->

- [ ] Start a fresh session immediately, since the current one is degraded
- [x] Write the state down first, then restart
- [ ] Continue, because restarting always loses more than it gains
- [ ] Escalate your phrasing to make the model attend to the constraint

**Why:** Fresh sessions are good, but not at the cost of unrecorded live state. Writing the state down is what makes restarting possible, and it is precisely the tension the handoff note resolves — which is why the note is this phase's deliverable rather than an optional extra. Escalating phrasing adds text to an already crowded window.

### Q6. Why does the measurement in task 14 require naming a confound? <!-- id: vb-06-managing-context-q06 energy: high -->

- [x] The second task benefits from what you learned doing the first, so the comparison is not clean evidence for session length alone
- [ ] Because the second task is always easier than the first
- [ ] Because session length cannot be measured directly
- [ ] Because free-tier quotas make the two runs unequal

**Why:** The improved brief and better review on the second task are a genuine alternative explanation, and the phase requires it stated rather than ignored. A measurement with a known confound is still useful when the confound is named, and misleading when it is not — which is the same standard the verification work elsewhere in this repository applies.

## You're ready to move on when...

You can explain, without reference to model quality, why a long session drifts — and you have seen it happen in your own work rather than taking it on faith. You keep your goal, constraints and decisions in files, and you write decisions with reasons so they do not get re-opened. You have written a handoff note and proved it works by giving it to a fresh session with no history. You start new sessions at task boundaries rather than at truncation, and you write state down before restarting rather than after. You have measured the degradation honestly, naming the learning confound, and you have a rule you decided rather than a principle you read.

## Free vs Paid

### Free path

Everything here is free, and this is the phase where a $0 budget has the *least* disadvantage, because context discipline is about habits rather than headroom. **Google Antigravity CLI** (which replaced Gemini CLI on 2026-06-18) and **Copilot Free** are genuinely free with no credit card, neither publishes its quota — so your own observed behaviour is the real limit — and **Copilot may use your inputs and outputs for training on Free, Pro, Pro+ and Max since 2026-04-24** ([docs.github.com](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies), fetched 2026-09-25).

If your machine has **16 GB of RAM**, a local model via Ollama removes per-token cost entirely. That is the one configuration where session length is limited by quality rather than by budget, and for a long agentic task it is the most forgiving option available at $0.

### Paid path

A paid tier buys two relevant things, not three. **A larger context window**, which raises the ceiling on how long a session can usefully run — though note Part 2: dilution still arrives before the limit does, so a bigger window helps less than the number suggests. And **published, higher quotas**, so you are not discovering the limit by hitting it. It does **not** automatically buy privacy from training: on GitHub's individual plans the training scope runs from Free through Pro, Pro+ and Max, with only **Business and Enterprise** excluded — so if that is your reason for upgrading, change the setting instead, or check the specific vendor's terms before paying.

### Where the money genuinely matters

It matters for **long agentic tasks**, which is Phase 7's subject. A coding agent working across many files needs a large window and consumes quota quickly, and free-tier quotas are not published, so the practical difference is between a task that completes and one that runs out partway. The free-tier compensation is structural rather than clever: **keep tasks small enough to fit one session.** That is good practice on any budget — and on a free tier it is also the difference between finishing and not, which makes the phase's discipline load-bearing rather than merely advisable.
