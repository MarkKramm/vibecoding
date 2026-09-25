---
id: vb-07-working-with-coding-agents
track: vibecoding
phase: 7
order: 16
title: Working With Coding Agents
duration: 2 weeks
duration_weeks: 2
energy_mix: [high, normal]
deliverable: portfolio/vibecoding/07-working-with-coding-agents.md
exit_criteria: >
  You scope a task small enough for an agent to complete and verify without supervision,
  and you review the diff rather than the summary. You commit before an agent run as a
  matter of habit, you can state what an agent may do without asking, and you have
  measured a real agent run against a written prediction of what it would change.
---

# Phase 7 — Working With Coding Agents

## Goal of this phase

This is the phase where the failure mode changes character, and it is the reason the track saves it until after review, testing, debugging and context.

In Phases 1–6 you were working with a model that **proposes**. You read the output, you accepted or rejected it, and nothing happened to your repository until you acted. An **agent** is different in one specific and consequential way: **it acts.** It reads files, writes files, runs commands, installs packages, and reports back. The loop runs without you.

That change is genuinely productive, and the phase is not a warning against it. An agent can do work that would take you an afternoon — a refactor across twenty files, a test suite for an existing module, a migration — while you do something else. That is real leverage and refusing it is not rigour.

But it moves the work from **producing** to **supervising**, and supervision is harder, for a reason this track has now established thoroughly:

> **An agent's summary of what it did is a claim, not evidence.**

This is the phase's central idea, and it follows directly from Phase 3. The agent tells you "I added the endpoint and the tests pass". Both parts may be true. The summary is generated the same way its code is — as plausible text — and it is subject to the same failure modes: it may be optimistic, it may omit what it did not check, and it may describe the intent rather than the outcome. **A summary that was never wrong would be the only reliable text a model produces, and nothing in this track suggests that is the case.**

So the discipline has a specific shape, and every part of it is a habit from an earlier phase pointed at a new target:

| Phase | Idea | Applied to agents |
|---|---|---|
| 3 | Review the diff, not the description | Read the diff; the summary is a lead |
| 4 | Tests are the contract | The agent iterates against *your* tests, not its own |
| 6 | Externalise state | The brief and the commit are the agent's context |
| 2 | Bound the task | Non-goals become permissions |

The two practices worth naming before anything else, because they are what make agent work safe rather than merely fast:

**Commit before the run.** A clean commit is the boundary between an agent's work and yours. If the run goes badly, `git diff` shows exactly what happened and `git checkout` undoes it. Without that commit, an agent that touched forty files leaves you reconstructing what it changed from memory.

**Review the diff, not the summary.** The summary tells you what the agent believes it did. The diff tells you what it did. Those are different artefacts, and the whole phase rests on preferring the second.

By the end you will have run an agent on a scoped task, **written down what you predicted it would change before it ran**, and compared the prediction with the diff. That prediction is the deliverable, because the gap between what you expected and what happened is the most useful number in this phase.

## Estimated time

**2 weeks** at 1–2 hours a day, 5 days a week. Roughly 10–12 hours, and it is practice-dominated — most of it is running agents and reviewing what they produce.

| Day | Focus | Time |
|---|---|---|
| 1–2 | What changes when the model acts, and the two safety habits | 2.5h |
| 3–4 | Scoping a task an agent can actually finish | 3h |
| 5–6 | Writing the brief an agent will execute | 2.5h |
| 7–8 | Reviewing a diff, including what it touched unasked | 2.5h |
| 9–10 | The prediction comparison, and the write-up | 2.5h |

If you only have three hours, do tasks 4, 9 and 15. Those give you a scoped brief, a diff review, and the prediction comparison.

## Skills you'll gain

- Scope a task small enough that an agent can complete and verify it in one run.
- Write a brief that an agent can execute without asking questions it cannot ask.
- State what an agent may do without asking, for the tool you actually use.
- Commit before a run so that an agent's work is always reversible.
- Review an agent's diff, including files it touched that you did not ask about.
- Treat an agent's summary as a claim and check it against the diff.
- Predict what an agent will change, and learn from the gap.

## Specific topics to learn

- **Proposing versus acting** — the one difference that changes everything.
- **The summary is a claim** — why fluency makes it *more* dangerous, not less.
- **Commit first** — the safety habit, and what it makes possible.
- **Task sizing** — why a task that fits one run goes better than one that does not.
- **Agent permissions** — what runs without asking, and how the defaults differ.
- **Prompt injection via repository content** — untrusted input reaching an actor.
- **Diff review for agents** — scope, deletions, and untouched files that should have changed.
- **Bounded failure** — designing runs so that a mistake is cheap and visible.
- **When not to use an agent** — security-sensitive work, and anything you cannot verify.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| A coding agent | The subject of the phase | Free tier: **Antigravity CLI** or **Copilot Free** (no card, but trains on free-tier code) | https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli | Tasks 2–15 | Aider or Cline with a free API key |
| Git | Commit before the run — the core safety habit | Free | https://git-scm.com | Tasks 3, 6, 9 | — |
| A test suite | The contract the agent iterates against | Free | — | Tasks 5, 11 | Any runner |
| `docs/research/vibecoding-tool-landscape.md` | Verified free-tier facts, limits and training positions | Free | in this repository | Task 2 | — |
| A local model via Ollama | Agent work with no per-token cost | Free | https://ollama.com | Task 14 | — |

**A note on the free tier, verified 2026-09 and dated because it is volatile.** The brief in this repository records that Google Antigravity CLI and Copilot Free are genuinely free with **no credit card**, that both **train on free-tier code**, and that **neither publishes its quota** — so your limit is discovered empirically. Claude Code has **no free tier**. For a learner in the Philippines on $0 these are the usable options, and the training position is a real consideration for anything you would not want indexed.

## Free/cheap resources

- **`docs/research/vibecoding-tool-landscape.md`** — in this repository — the verified free-tier table, with the training position and credit-card requirement for each tool.
- **Agents Phase 3 (the agent loop and planning)** — in this repository — the mechanics underneath what this phase uses. Read it if you want to know *how* the loop works; this phase is about *supervising* it.
- **Agents Phase 6 (safety and human in the loop)** — in this repository — approval design, which this phase applies at the practitioner level.
- **Vibecoding Phase 3 (reviewing generated code)** — in this repository — the review discipline, which is the whole of agent supervision.
- **Vibecoding Phase 6 (managing context)** — in this repository — why an agent run needs a written brief and a clean starting state.
- **Vibecoding Phase 4 (tests as the contract)** — in this repository — the check an agent iterates against, which must be yours rather than its own.
- **shared/study-rules.md** — in this repository — relevant because agent runs are the easiest place to feel productive while learning nothing.

## Lesson: Supervising Something That Acts

### Part 1 — The one difference that matters

Review the distinction carefully, because the phase depends on it.

**A chat model proposes.** You paste code, it suggests a change, you apply it. Between the suggestion and your repository there is a human step, and that step is where all of Phases 1–6 lived. Nothing happens until you do it.

**An agent acts.** It has tools — read a file, write a file, run a command, search the codebase. It uses them in a loop, observing results and deciding what to do next. Between its decision and your repository there is **no human step**. You find out what happened afterwards.

Everything in this phase is a consequence of that removal. The productivity is real: a task with twenty mechanical edits is exactly what a loop is good at, and it will finish while you do something else. But the failure modes change too, and the change is not about severity — it is about **where the failure appears.**

In a chat, a wrong suggestion appears in front of you and you reject it. With an agent, a wrong action appears in your repository, and you find it in the diff. **The review step did not disappear; it moved from before the change to after it.** That is a real trade with a real cost: undoing is more expensive than declining, so the runs that go wrong cost more than the suggestions you would have rejected.

### Part 2 — The summary is a claim

Now the idea the phase is built on, and it follows from Phase 3 rather than from anything new.

When an agent finishes, it tells you what it did. Something like:

> I've added the rate-limiting middleware to `app/auth.py` and wired it into the login route. I also added tests covering the 429 behaviour, and all tests pass. I noticed the existing config used a hardcoded timeout so I moved it into the settings module for consistency.

Read that paragraph as a **claim**, because that is what it is. It was produced by the same system, in the same way, as the code — as plausible text. It is subject to every failure mode this track has established:

- **It may be optimistic.** "All tests pass" describes what the agent observed at the time, on the tests it ran, in the state it left. If it added a test that passes trivially, the statement is true and misleading.
- **It may omit what was not checked.** An agent that did not run a type checker will not mention types. Silence is not a claim of correctness, but it reads like one.
- **It may describe intent rather than outcome.** "Wired it into the login route" is what the agent meant to do. Whether the wiring is correct is a separate question the summary does not answer.
- **It may be wrong in the direction of completion.** An agent under pressure to finish a task reports finishing it.

And the third sentence is the important one to notice, because it is **buried**. "I noticed the existing config used a hardcoded timeout so I moved it into the settings module" — that is a change you did not ask for, reported as a helpful aside, in a sentence that reads like good news. **Scope expansion is announced in the same tone as success**, which is why reading the summary carefully is not enough. The diff is the only place the scope is visible.

> **The summary is a lead, not evidence. The diff is the evidence.**

This is not cynicism about agents. It is the same standard Phase 3 applied to code: a claim about an artefact, checked against the artefact. The difference is that here the claim arrives in fluent, confident, well-organised English, which is precisely the format you are least inclined to distrust.

### Part 3 — Commit first

The single habit that makes agent work safe rather than merely fast, and it takes five seconds.

**Commit before you start the agent.** A clean working tree at a known commit means:

- **The boundary is precise.** `git diff` shows exactly what the agent did, and nothing else. Without a commit, the diff mixes the agent's changes with yours and you cannot tell them apart.
- **Reversal is trivial.** `git checkout .` or `git reset --hard` returns you to a known-good state. Without a commit, undoing means reconstructing — by memory, across however many files the agent touched.
- **The run is bounded in time.** A commit gives you a point to compare against, which is what makes "did it touch anything unexpected" answerable in one command.

The habit costs nothing and it converts a class of catastrophic outcomes into a class of annoying ones. **A bad agent run against a clean commit is a `git reset` away from being a non-event.** That is the whole argument, and it is why this is a safety practice rather than a preference.

Two refinements worth adopting:

**Commit *your* work first, separately.** If you have uncommitted changes when the agent starts, its diff includes them and you lose the boundary. Commit yours, then run the agent.

**Check `git status` before and after.** Before, to confirm a clean tree. After, to see what appeared — including untracked files, which are where an agent's stray scripts and scratch files show up.

### Part 4 — Task sizing, and the invisible ceiling

An agent's run is bounded by its context, and the bound is closer than it looks — this is Phase 6's material, arriving with a new consequence.

A task that fits comfortably in one run goes well. The agent holds the goal, the relevant files and the results of its commands simultaneously, and its decisions are made with all of that present. A task that **does not** fit degrades in exactly the way Phase 6 described: early constraints dilute, the agent forgets a rule it was given, and it may begin contradicting its own earlier edits.

The practical rule: **scope the task so that it can be finished, verified and reviewed in one run.** Concretely —

- **One coherent change.** "Add rate limiting to the login endpoint" is one change. "Add authentication" is five, and will produce a run that does three of them adequately.
- **A verifiable finish line.** The agent needs a way to know it is done. Your tests are that, which is why they must exist before the run.
- **Files you can review afterwards.** If the diff is four hundred lines across thirty files, you will not review it, and an unreviewed agent run is Phase 1's failure with extra steps.

**⚠️ Volatile, dated: as of 2026-09, free-tier agent quotas and context windows are generally NOT published.** The verified brief in this repository records that Copilot Free, Cursor Hobby and Codex Free describe only "an allowance" or "limited requests", and that Google removed the Gemini API free-tier rate limits from its public documentation. You will discover your ceiling by hitting it. **Treat the first truncated-feeling run as a measurement**, and scope the next one below it — which is more useful than a published number you cannot verify.

### Part 5 — What an agent may do without asking

The question that determines how much damage a bad run can do, and the answer differs by tool and by configuration rather than by model.

Agents differ on roughly four axes, and it is worth knowing where yours sits on each:

| Axis | Range | Why it matters |
|---|---|---|
| File writes | Within named files ↔ anywhere in the repo | Scope expansion, and damage to files you did not consider |
| Command execution | Sandboxed ↔ your full user permissions | Anything your shell can do, including network and deletion |
| Approval | Per-action prompt ↔ fully unattended | How fast a mistake compounds |
| Network | Off ↔ unrestricted | Whether a hallucinated package can actually install |

The **network** axis deserves specific attention, because it connects this phase to Phase 3's measured finding. Recall the numbers: hallucinated packages appeared in **at least 5.2% of samples from commercial models and 21.7% from open-source models** ([arXiv:2406.10279](https://arxiv.org/abs/2406.10279)). In a chat, a hallucinated import is text you can catch on review. **In an agent run with network access, the agent may install it** — and if the name has been registered by an attacker, that is the slopsquatting path executing rather than being described.

**Know your tool's defaults before you rely on them**, and do not assume the default is the cautious one. A prompt that appears before each command is friction you may want to remove for speed; a network-enabled agent with no approval is a different risk profile, and the choice should be deliberate rather than inherited from whatever the tool shipped with.

### Part 6 — Prompt injection, stated plainly

The risk that is specific to agents, and it is worth understanding even without a citation, because the mechanism is structural.

**An agent reads content you did not write.** It reads your dependencies, your README, files in the repository, issues and pull request descriptions, and sometimes web pages. All of that text enters the same context as your instructions — and a model does not reliably distinguish **"instruction from the user"** from **"text that looks like an instruction"**. That distinction is a security boundary the model does not enforce.

So malicious content in a repository file can function as a command. A comment in a dependency, an issue body, a crafted README can contain text addressed to the agent, and the agent may follow it. This is **indirect prompt injection**, and its significance here is that the agent is an **actor**: injected text does not just produce a wrong answer, it can cause an action — writing a file, exfiltrating a secret it can read, running a command.

Three practical consequences, and this is a control rather than a fix:

**Treat repository content as untrusted input to your agent.** Not "read the README carefully" — rather, that the same content is simultaneously your documentation and potential input to an actor with tools.

**Give an agent the minimum access the task needs.** If the task is editing one module, an agent that can read your entire filesystem and reach the network has more reach than the task requires. Least privilege is a familiar idea; it is unusual here only in that the thing holding privileges is not a person.

**Keep a human in the loop for irreversible actions.** Pushing, deploying, deleting, and anything touching credentials or money. The pattern is the same as Part 3's commit habit: bound the failure so a mistake is cheap and visible rather than expensive and silent.

**This is no longer a theoretical mechanism — there is a research literature, and it is not reassuring.** A **Systematization of Knowledge** paper by Maloyan and Namiot, *"Prompt Injection Attacks on Agentic Coding Assistants: A Systematic Analysis of Vulnerabilities in Skills, Tools, and Protocol Ecosystems"* ([arXiv:2601.17548](https://arxiv.org/abs/2601.17548), January 2026), meta-analyses **78 studies from 2021–2026** and catalogues **42 distinct attack techniques** across input manipulation, tool poisoning, protocol exploitation, multimodal injection and cross-origin context poisoning. It covers Claude Code, GitHub Copilot, Cursor and skill-based architectures built on the Model Context Protocol.

**Two findings from it are worth carrying:**

**Attack success rates exceed 85% against state-of-the-art defenses** when the attacker adapts. And of **18 defense mechanisms** the authors reviewed, **most achieve under 50% mitigation** against sophisticated adaptive attacks.

**Read those together and the conclusion is uncomfortable but clear: filtering does not solve this.** The authors' own recommendation is that prompt injection must be treated as a **first-class vulnerability class needing architectural mitigation, not ad-hoc filtering**. What that means for you in practice is that **the controls below are about limiting damage, not preventing the attack** — you are choosing blast radius, not immunity. If someone tells you a particular agent "handles" prompt injection, that is a claim to check against this paper rather than accept.

**⚠️ Still dated and partly open.** The *mechanism* and the *research* are now sourced. What remains unverified for this lesson is the **current per-tool default behaviour** — sandboxing, approval prompts, and what each agent does without asking. Those change every release. The specifics are recorded in `docs/SEARCH-REQUESTS.md` as open requests, and the numbers in that paper describe the state of the field in **early 2026**.

### Part 7 — Reviewing the diff

Phase 3's diff discipline, applied where the stakes are higher because the agent had write access.

**Start with the file list, not the hunks.** `git diff --stat` before anything else. The question is not "is this change correct" but **"is this only what I asked for"** — and a task that named two files and changed nine has a finding more important than any line within it.

Specific things to look for, in rough order of how often they matter:

**Files you did not name.** The agent's own judgement about what was in scope. Sometimes reasonable, and it is your decision to accept it, not its decision to make.

**Deletions.** Read removed lines deliberately, because in the final file they leave no trace — a removed validation or check is exactly the absence Phase 3 trained you to find.

**Tests it wrote or modified.** If the agent changed a test to make it pass, that is the Phase 4 failure arriving through a new door. **Check the tests it touched with more suspicion than the code.**

**Configuration, dependency and lock files.** These change behaviour globally and are the least interesting to review, which is why they get skimmed.

**Anything that should have changed and did not.** Callers of a changed function, tests asserting old behaviour, migrations, documentation. A diff is silent about omissions, which is why the prediction in Part 8 exists.

**And read the summary last.** Having formed your own view from the diff, the summary is now a useful cross-check rather than the thing you trusted. Notice specifically whether it mentioned the scope expansion you found. If it did not, that is the calibration you needed.

### Part 8 — Predict, then compare

The practice that turns agent experience into judgement, and the reason for this phase's deliverable.

**Before the run, write down what you expect the agent to change.** Not a vague sense — a list of files and a description of the change in each. Then run it, then compare, then read the diff.

The prediction is valuable because **the gap is diagnostic**, and its direction tells you which way you are miscalibrated:

- **It changed more than predicted.** Your prompts are under-specified on scope. The fix is Phase 2's non-goals, applied to permissions: name what is out of bounds.
- **It changed less than predicted.** Your task was ambiguous, or too large for one run, or it stopped early and reported success. Check the summary against the diff particularly carefully here.
- **It changed something you did not anticipate at all.** The most interesting case. This is where you learn what the tool treats as implied — the connected file, the config it noticed, the refactor it judged helpful. It is also where scope expansion lives.
- **It did exactly what you predicted.** You have a calibrated model of this tool. That is the goal, and it took several runs to build.

The comparison is also **the honest test of Part 2**. If you predict, then read the diff, you find out whether the summary was accurate — and you will find that it usually is, most of the time, on the things the agent thought about. The failures cluster in the gaps. **That distribution is the finding**, and you only see it by writing the prediction down first. Reading the summary first destroys the measurement, because it anchors you.

## Hands-on practice tasks

1. Before running anything, find out what your chosen agent may do without asking, on all four axes from Part 5: file writes, command execution, approval mode, network. Write it down from the tool's own documentation or settings, not from assumption. <!-- id: vb-07-working-with-coding-agents-t01 band: focused energy: normal -->
2. Check the training and privacy position for your agent, using the verified table in `docs/research/vibecoding-tool-landscape.md`. Note whether your free-tier code may be used for training, and whether there is an opt-out. This matters before you point it at anything real. <!-- id: vb-07-working-with-coding-agents-t02 band: quick energy: low -->
3. Establish the safety baseline: commit everything, confirm `git status` is clean, and record the commit hash. Do this before any agent run, every time, until it is automatic. <!-- id: vb-07-working-with-coding-agents-t03 band: quick energy: low -->
4. Write an agent brief for a small real task. It needs a goal, the files in scope, the non-goals as explicit bounds, and how the agent will know it is done. **The finish line is the part people omit**, and an agent without one either stops early or keeps going. <!-- id: vb-07-working-with-coding-agents-t04 band: focused energy: high -->
5. Ensure your tests exist and pass *before* the run. The agent must iterate against your contract rather than inventing one, and if the tests are missing it will write both the code and the check — which is Phase 4's failure inside an agent loop. <!-- id: vb-07-working-with-coding-agents-t05 band: focused energy: normal -->
6. **Before running the agent, write your prediction**: which files it will change and what it will do in each. Be specific. This is the phase's central measurement and it cannot be recovered afterwards, so do it now. <!-- id: vb-07-working-with-coding-agents-t06 band: focused energy: high -->
7. Run the scoped task and let it finish. Do not intervene unless it does something destructive. Note how long it took and whether it asked for anything. <!-- id: vb-07-working-with-coding-agents-t07 band: focused energy: normal -->
8. **Read the summary and record it verbatim, before looking at the diff.** Note specifically what it claims about tests, and whether it mentions any change you did not request. Then set it aside. <!-- id: vb-07-working-with-coding-agents-t08 band: focused energy: normal -->
9. Resolve the central question: **read the diff and compare it with your prediction from task 6.** Record the gap and its direction — more than predicted, less, unanticipated, or exact. This comparison is the deliverable's core. <!-- id: vb-07-working-with-coding-agents-t09 band: deep energy: high -->
10. Run `git diff --stat` and count the files. List every file the agent touched that your brief did not name. For each, decide: was it in scope, and did the summary mention it? <!-- id: vb-07-working-with-coding-agents-t10 band: focused energy: high -->
11. Examine every test the agent wrote or modified, with more suspicion than the code. Check specifically whether it weakened an assertion or changed an expected value to make something pass. This is the Phase 4 failure arriving through the agent. <!-- id: vb-07-working-with-coding-agents-t11 band: deep energy: high -->
12. Check the deletions in the diff. List every removed line and ask what capability it removed. Generated removals are invisible in the final file, which is why this needs its own pass. <!-- id: vb-07-working-with-coding-agents-t12 band: focused energy: normal -->
13. Compare the summary from task 8 against what you found in tasks 9–12. Score it: accurate, optimistic, or containing an omission. Note whether anything was claimed that you could not confirm. <!-- id: vb-07-working-with-coding-agents-t13 band: focused energy: high -->
14. Run a second, differently shaped task and repeat tasks 4, 6, 7 and 9 — this time on a **local model** via Ollama if your machine has the RAM. Compare the prediction gaps. A weaker model typically expands scope more and follows the brief less precisely, which is worth knowing if your budget pushes you local. <!-- id: vb-07-working-with-coding-agents-t14 band: deep energy: high -->
15. Write it up as `portfolio/vibecoding/07-working-with-coding-agents.md`: the four-axis permission profile from task 1, the brief, your prediction from task 6, the verbatim summary from task 8, the actual diff scope from task 10, the prediction gap from task 9, the test-scrutiny result from task 11, and your summary-accuracy verdict from task 13. **If the summary was accurate, say so** — it usually is on the things the agent considered, and the finding is where it fails, not that it fails. <!-- id: vb-07-working-with-coding-agents-t15 band: deep energy: high -->
16. Write one sentence on what you would need to see before you would let this agent run unattended on a task touching authentication or money. Most people find their honest answer is "nothing would", which is worth knowing about yourself. <!-- id: vb-07-working-with-coding-agents-t16 band: quick energy: low -->

## Common Pitfalls

**Trusting the summary instead of reading the diff.** The phase's central error. The summary is generated text about the work, subject to the same failure modes as generated text anywhere — and it is written in confident prose, which is the format you are least inclined to distrust.

**Not committing first.** It takes five seconds and it converts a catastrophic outcome into an annoying one. Without a commit, the diff mixes the agent's changes with yours and reversal becomes reconstruction from memory.

**Tasks too large for one run.** An agent's context is finite and its degradation is Phase 6's: early constraints dilute, and it may contradict its own earlier edits. Scope so the task can be finished, verified and reviewed in one run.

**No verifiable finish line.** An agent without a way to know it is done will either stop early and report success or keep going. Your tests are the finish line, and they must exist before the run rather than being written by the agent alongside the code.

**Letting the agent write its own tests.** This is Phase 4's failure inside a loop: the agent writes the code, then writes tests that assert what the code does, and reports that all tests pass. Both statements are true and the suite certifies whatever the code does.

**Skimming configuration and dependency changes.** They are the least interesting to read and they change behaviour globally. A lockfile diff is where an unexpected dependency appears.

**Reading the summary before the diff.** It anchors you. Your prediction and your own read of the diff are the measurement; reading the summary first destroys it, and you will find what the summary told you to find.

**Assuming the default permissions are cautious.** Tools differ on file scope, command execution, approval and network, and the permissive default is common. Know where yours sits before you rely on it, and prefer least privilege — an agent that can reach the network can install a hallucinated package.

**Treating repository content as trusted.** An agent reads your dependencies, READMEs and issue text, and a model does not reliably separate "instruction from the user" from "text that looks like an instruction". Malicious content in a file the agent reads can function as a command to an actor with tools.

**Running an agent on security-sensitive work unattended.** Authentication, money, credentials, data deletion. Task 16 asks what would change your mind; for most people the honest answer reveals the boundary they already have.

## Deliverable / proof of work

- `portfolio/vibecoding/07-working-with-coding-agents.md`, containing:
  - your agent's permission profile on all four axes (task 1)
  - the training and privacy position for your agent (task 2)
  - the commit hash of the clean starting state (task 3)
  - the full agent brief, including non-goals and the finish line (task 4)
  - **your written prediction, made before the run** (task 6)
  - the agent's summary, quoted verbatim (task 8)
  - the diff scope: files touched versus files named (task 10)
  - the prediction gap and its direction (task 9)
  - the test-scrutiny result — whether any assertion was weakened (task 11)
  - your summary-accuracy verdict: accurate, optimistic, or omitting (task 13)
  - the local-versus-hosted comparison, if you ran task 14
  - one sentence on what would let you run an agent unattended on sensitive work (task 16)
- The reviewed diff itself, kept in your git history — the commit pair *is* the evidence.

## Checklist

- [ ] I can explain what changes when a model acts rather than proposes <!-- id: vb-07-working-with-coding-agents-c01 energy: normal -->
- [ ] I treat an agent's summary as a claim and check it against the diff <!-- id: vb-07-working-with-coding-agents-c02 energy: normal -->
- [ ] I commit before every agent run, and confirm a clean tree first <!-- id: vb-07-working-with-coding-agents-c03 energy: low -->
- [ ] I can scope a task that fits one run and has a verifiable finish line <!-- id: vb-07-working-with-coding-agents-c04 energy: normal -->
- [ ] I know what my agent may do without asking, on all four axes <!-- id: vb-07-working-with-coding-agents-c05 energy: normal -->
- [ ] I ensure my tests exist and pass before the run, so the agent iterates against my contract <!-- id: vb-07-working-with-coding-agents-c06 energy: normal -->
- [ ] I run `git diff --stat` and identify files touched but not named <!-- id: vb-07-working-with-coding-agents-c07 energy: low -->
- [ ] I scrutinise agent-written tests more than agent-written code <!-- id: vb-07-working-with-coding-agents-c08 energy: normal -->
- [ ] I check deletions, because they are invisible in the final file <!-- id: vb-07-working-with-coding-agents-c09 energy: normal -->
- [ ] I read the diff before the summary, not after <!-- id: vb-07-working-with-coding-agents-c10 energy: normal -->
- [ ] I can state the prompt-injection mechanism and why it matters more for an actor <!-- id: vb-07-working-with-coding-agents-c11 energy: normal -->
- [ ] I have written a prediction before a run and measured the gap <!-- id: vb-07-working-with-coding-agents-c12 energy: normal -->
- [ ] I know the training position of my agent's free tier <!-- id: vb-07-working-with-coding-agents-c13 energy: low -->

## Quiz

### Q1. What is the single change that makes supervising an agent harder than reviewing a suggestion? <!-- id: vb-07-working-with-coding-agents-q01 energy: normal -->

- [ ] The agent produces more code than a chat model
- [ ] The agent uses a different and less capable model
- [x] It acts on your repository without a human step, so the review moves from before the change to after it
- [ ] The agent cannot explain its reasoning

**Why:** With a chat model, a wrong suggestion appears in front of you and you decline it. With an agent, a wrong action appears in your repository and you find it in the diff. The review did not disappear — it moved — and undoing is more expensive than declining, which is why the runs that go wrong cost more.

### Q2. Why is an agent's summary a claim rather than evidence? <!-- id: vb-07-working-with-coding-agents-q02 energy: high -->

- [ ] Because agents deliberately conceal what they did
- [x] It is generated the same way as the code, so it can be optimistic, omit what was unchecked, and describe intent rather than outcome
- [ ] Because summaries are written before the work is finished
- [ ] Because it is too short to contain the necessary detail

**Why:** A summary that was never wrong would be the only reliable text a model produces, and nothing in this track suggests that is the case. Note the fourth failure in Part 2: unrequested scope expansion is announced in the same cheerful tone as success, which is why the diff rather than the summary is the only place the scope is visible.

### Q3. What does committing before an agent run actually make possible? <!-- id: vb-07-working-with-coding-agents-q03 energy: normal -->

- [ ] It prevents the agent from making mistakes
- [ ] It lets the agent read the codebase more efficiently
- [ ] It reduces the number of tokens the agent consumes
- [x] A precise boundary and trivial reversal, converting a catastrophic outcome into an annoying one

**Why:** Without a commit, the diff mixes the agent's changes with yours and undoing means reconstructing from memory across however many files it touched. The habit takes five seconds, and it is why a bad run against a clean commit is a `git reset` away from being a non-event.

### Q4. Why must the tests exist and pass *before* the agent run? <!-- id: vb-07-working-with-coding-agents-q04 energy: normal -->

- [ ] Because agents cannot run tests that do not exist
- [ ] Because it reduces the agent's context usage
- [x] Otherwise the agent writes both the code and the check, which is Phase 4's failure inside a loop
- [ ] Because a failing test confuses the agent's planning

**Why:** An agent asked to implement a feature will, if no tests exist, write tests that assert what its code does — and then truthfully report that all tests pass. Both statements are true and the suite certifies whatever the code does, which is exactly the derivation problem Phase 4 identified, now arriving via an actor.

### Q5. Why does network access add a specific risk to an agent run? <!-- id: vb-07-working-with-coding-agents-q05 energy: high -->

- [ ] It slows the agent down with unnecessary requests
- [ ] It consumes quota that the task did not need
- [ ] It allows the agent to read documentation it should not
- [x] The agent may install a hallucinated package, which is the slopsquatting path executing rather than being described

**Why:** Recall the measured rates — at least 5.2% of commercial-model samples and 21.7% of open-source ones contained hallucinated packages ([arXiv:2406.10279](https://arxiv.org/abs/2406.10279)). In a chat that is text you can catch on review. With an agent that has network access, the install succeeds, and a pre-registered name means hostile code runs.

### Q6. Why does the phase require writing a prediction before reading the summary or the diff? <!-- id: vb-07-working-with-coding-agents-q06 energy: high -->

- [ ] To prove the agent was wrong if it was
- [ ] To give the agent clearer instructions
- [x] Reading the summary first anchors you, destroying the measurement of your own calibration
- [ ] Because predictions reduce the number of agent runs needed

**Why:** The gap between prediction and diff is diagnostic, and its *direction* tells you which way you are miscalibrated — more than predicted means scope is under-specified, less means the task was ambiguous or stopped early, and unanticipated changes show what the tool treats as implied. That distribution is the finding, and it is only visible if the prediction exists first.

## You're ready to move on when...

You know what your agent may do without asking, on all four axes, from its own configuration rather than from assumption. You commit before every run and could not imagine starting one without a clean tree. You scope tasks that fit a single run and have a finish line your tests provide. You have written a prediction, run an agent, read the diff before the summary, and measured the gap honestly — and you know whether your miscalibration tends toward expecting too little or too much. You check agent-written tests with more suspicion than agent-written code, and you can explain why repository content is untrusted input to something with tools.

## Free vs Paid

### Free path

Agent work is available at $0 and the phase is written to work that way. **Antigravity CLI** (which replaced Gemini CLI on 2026-06-18) and **Copilot Free** are genuinely free with **no credit card**, and **Claude Code has no free tier**. The two real constraints are worth stating plainly: **quotas are unpublished**, so you discover your ceiling by hitting it, and **your code may be used for training** — GitHub's documentation ([fetched 2026-09-25](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies)) applies this to **Free, Pro, Pro+ and Max since 2026-04-24**, excluding only Business and Enterprise. So anything you would not want indexed belongs elsewhere — a local model, or not in the repository.

If your machine has **16 GB of RAM**, a local model via Ollama removes per-token cost entirely, which changes agent work materially: long runs become affordable, at the cost of a weaker model that expands scope more and follows briefs less precisely.

**This is the phase where the budget gap is largest**, and the honest statement is that a $0 budget buys fewer and shorter runs rather than a different method. The discipline in this phase — commit, scope small, review the diff — is what makes a limited number of runs count.

### Paid path

A paid agent gives you four things that matter here. **Longer runs**, so a task too large for one free-tier run fits comfortably. **Larger context**, which raises the ceiling on task complexity before Phase 6's degradation sets in. **Published, higher quotas**, so you are not discovering the limit by hitting it mid-task. And **no training on your code**, which for a repository containing anything sensitive is a substantive difference rather than a nicety.

### Where the money genuinely matters

It matters most in this phase of any in the track, and the reason is task size. **A paid tier lets you attempt tasks that a free tier cannot finish**, which is a difference in what is possible rather than in how pleasant it is. The free-tier compensation is to decompose: a task that does not fit one run can often be split into three that do, each with its own commit and diff review — which is better practice anyway, and on a free tier it is also the difference between finishing and not.

There is one genuine capability the free path lacks, and it is worth naming rather than glossing: **running an agent unattended on a long task**. Free tiers do not publish quotas and will run out partway, which makes truly hands-off work unreliable. The workaround is to stay in the loop, which is what this phase teaches anyway — so the free path costs you the opposite of what you would expect. It costs you the ability to walk away, not the ability to work.
