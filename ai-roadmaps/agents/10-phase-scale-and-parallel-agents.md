---
id: agent-10-scale-and-parallel-agents
track: agents
phase: 10
order: 100
title: Working at Scale - Parallel Agents, Large Codebases, and Walking Away
duration: 2 weeks
duration_weeks: 2
energy_mix: [high, normal]
deliverable: portfolio/agents/10-scale-and-parallel-agents.md
exit_criteria: >
  You can choose the right parallelism mechanism for a piece of work and say why,
  isolate parallel sessions so they cannot collide, dispatch work that survives
  you closing the terminal, and attach a check that decides when it is finished
  rather than leaving yourself as the loop.
---

# Phase 10 — Working at Scale: Parallel Agents, Large Codebases, and Walking Away

## Goal of this phase

Phases 8 and 9 were about the layer around one agent: what it knows, and what it is permitted to do. This phase is about **what happens when there is more work than one agent, one context, or one afternoon can hold.**

Three distinct problems get bundled together in most discussions, and keeping them apart is most of the skill:

**Context is finite and everything competes for it.** A long session fills up with things you will never reference again. The fix is delegation — move the work out of the conversation and let a summary come back.

**Files are shared and parallel work collides.** Two sessions editing the same checkout overwrite each other. The fix is isolation — a separate working directory per session.

**Time is finite and you are not a scheduler.** The tempting promise is "set it running and walk away." That is real, and it is conditional on a check deciding when the work is done. Without one, walking away does not save your attention, it defers every mistake to a moment you are not watching.

**By the end you will have a rule for choosing between the mechanisms, the isolation primitive that makes parallel sessions safe, and — the part that matters most — a check that lets you leave.**

## Estimated time

**2 weeks** at 1–2 hours a day, 5 days a week. Roughly 14–18 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Part 1: the three questions the decision turns on | 1.5h |
| 2 | Part 2: the five ways, and what each one moves | 2h |
| 3 | Part 3: subagents, and what they cost | 2h |
| 4 | Part 4: worktrees, and the check you cannot disable | 2h |
| 5 | Part 5: teams and workflows, and the 7× question | 2h |
| 6 | Part 6: walking away, and the state model | 2h |
| 7 | Part 7: the check that decides when it is done | 2h |
| 8 | Part 8: large codebases, and one honest negative | 2h |
| 9 | Part 9: cost, and the audit | 1.5h |

If you only have four hours this week, do tasks 1, 7, 11 and 16. Those produce the decision table, two isolated parallel sessions, one dispatched background job with a check attached, and the audit.

This phase is more expensive than the last two, because the material is genuinely new and heavily dated. Budget the reading.

## Skills you'll gain

- Choose between a subagent, a worktree, a team, a workflow, and plain sequential work, and say why.
- Explain what each mechanism moves: context, filesystem, plan, or coordination.
- Isolate parallel sessions so they cannot overwrite each other.
- Dispatch work that continues without an open terminal.
- Read a state model and know which states need you.
- Attach a check that gates completion, and pick the right strength of gate.
- Configure a scheduled task and know its session-scoped limits.
- Set up code intelligence so an agent navigates by symbol rather than text.
- Reason about the token cost of parallelism before you dispatch.

## Specific topics to learn

- Who coordinates the work, and why that single question dominates the choice.
- The five published ways to work on several tasks at once.
- Subagents: isolated context, custom tools, their own requests against your usage.
- Worktrees as separate working directories sharing one history.
- Agent teams: messaging, a shared task list, and a lead.
- Dynamic workflows: a script holding the plan, with runtime caps.
- The supervisor process behind background sessions.
- The session state model, including which state means "a human is required".
- Scheduled tasks versus loops versus cloud schedules, and their differing limits.
- Verification gates: in-prompt, goal condition, Stop hook, second opinion.
- Language servers and symbol-level navigation.
- The two-level instruction-file split for monorepos.

## Tools for This Phase

- **A coding agent with a subagent and worktree mechanism.** Claude Code is the reference implementation documented here.
- **A git repository with real history.** Worktrees need a repository, and a repository with no branches makes the isolation invisible.
- **A test suite or linter you can run from the command line.** The verification gate in Part 7 needs something that passes or fails, and a prompt is not that.
- **Your agent's documentation index**, `https://code.claude.com/docs/llms.txt`, plus `git-scm.com/docs/git-worktree` for the underlying mechanism from the source that implements it.

## Free/cheap resources

- **`https://code.claude.com/docs/en/agents.md`** — the five-way comparison table. The spine of Part 2.
- **`https://code.claude.com/docs/en/worktrees.md`** — the isolation checks.
- **`https://code.claude.com/docs/en/agent-teams.md`** — including its limitations section, which is the most useful part.
- **`https://code.claude.com/docs/en/agent-view.md`** — background sessions and the state model.
- **`https://code.claude.com/docs/en/scheduled-tasks.md`** — scheduling, with the limits.
- **`https://code.claude.com/docs/en/best-practices.md`** — the verification gates.
- **`https://git-scm.com/docs/git-worktree`** — git's own documentation, which carries a caveat the tool's docs do not repeat.
- **`https://code.claude.com/docs/en/large-codebases.md`** — monorepo configuration.
- **`https://code.claude.com/docs/en/costs.md`** — the source of the enterprise figures and the 7× multiplier quoted in Part 9.

**⚠️ Dated 2026-09-29, and this phase is the most volatile in the track.** Agent view is in **research preview** and the docs say the interface may change. Agent teams are **experimental and disabled by default**, behind an environment variable. Several features carry explicit version floors. **Treat the concepts as durable and every flag, name and default as a snapshot.** Where something is unreleased, gated, or unverified, this phase says so rather than describing it as though you could rely on it.

## Lesson: More Work Than One Session Can Hold

### Part 1 — The decision is one question, asked first

Before any of the mechanisms, there is a single question the documentation puts first, and it is worth internalising because it determines everything downstream:

> "The right approach depends on who coordinates the work, whether the workers need to communicate, and whether they edit the same files."

**Who coordinates?** If Claude delegates and collects results inside one conversation, you want **subagents**. If you hand off independent tasks and check back later, you want **background sessions**. If Claude plans, assigns, and supervises a group, you want a **team**. If *"a script holds the plan instead of Claude's turn-by-turn judgment"*, you want a **dynamic workflow**. Four answers, four mechanisms, and the question picks the mechanism.

**Do the workers need to talk to each other?** Subagents report back to the conversation that spawned them. In a team, *"teammates message each other directly"*. This is the question that separates a team from a pile of subagents, and it is the one people skip — a team where nobody needs to talk is a pile of subagents paying team prices.

**Do the tasks touch the same files?** This is where isolation stops being optional. The documentation's answer is blunt: *"Isolate the work with worktrees... Agent teams don't isolate teammates in worktrees, so partition the work so each teammate owns a different set of files."* **A team without a partitioning plan is a way to have two agents overwrite each other's work.**

**The one-line version, which is a derivation and not a quotation.** The three questions produce a rule, and the rule is more memorable than the questions:

> **Subagent moves work out of context. Worktree moves work out of the filesystem. Workflow moves the plan out of the model. A team moves coordination into the model.**

If you remember only that, you can reconstruct the right mechanism for most situations. Each mechanism is a way of moving one specific thing out of something that cannot hold it, and picking wrong means you paid the complexity cost for no gain.

### Part 2 — The five ways, as published

The documentation states it plainly: *"Claude Code has five ways to work on several tasks at once: subagents, agent view, agent teams, dynamic workflows, and projects."* The table, in the vendors' own words for when each is right:

| Approach | What it gives you | Use it when |
|---|---|---|
| **Subagents** | Delegated workers inside one session, doing a side task in their own context, returning a summary | A side task would flood your conversation with results you will not reference again |
| **Agent view** | One screen to dispatch and monitor background sessions | Several independent tasks; hand them off, check status, step in only when one needs you |
| **Agent teams** | Coordinated sessions with a shared task list and inter-agent messaging, run by a lead | Claude should split a project into pieces, assign them, and keep workers in sync |
| **Projects** | One ongoing conversation; Claude starts parallel sessions, gives each the project instructions, shows which need you | Work spans days or weeks, should keep running when your machine is off |
| **Dynamic workflows** | A script running many subagents and cross-checking results | A job outgrows a handful of subagents, or you want findings verified against each other |

**And one sentence that stops people inventing a sixth:**

> "In every approach the workers are Claude sessions. To involve a different tool, expose it to Claude as an MCP server."

**The distinction people miss: three of these are support, not separate ways to run agents.** Worktrees give each session a separate checkout. Cross-session messaging lets your sessions pass findings to each other. And `/batch` is *"a skill that has Claude split one large change into 5 to 30 worktree-isolated subagents"* — explicitly *"a packaged use of subagents and worktrees, not a separate coordination style."*

**So the honest count is five *approaches* and three *primitives*, and conflating them is how people end up maintaining six mental models for what is really one dispatcher plus an isolation mechanism.**

**A note on maturity, because it changes what you should build on.** Agent view is *"in research preview"*, and the docs add that the interface and shortcuts may change. Agent teams are *"experimental and disabled by default"*, requiring an environment variable to enable at all. **Subagents and worktrees are the two you should build on today.** The other three are worth understanding so you can recognise them, and not worth depending on.

### Part 3 — Subagents, and what they actually cost

The mechanism is simple and the reason to use it is narrow:

> "Use one when a side task would flood your main conversation with search results, logs, or file contents you won't reference again: the subagent does that work in its own context and returns only the summary."

**That is the whole test.** A subagent is right when the intermediate work is large and the conclusion is small. It is the wrong tool when you need to interrogate the detail — you cannot ask a subagent follow-up questions about its own work in any depth, because you only received a summary.

**And the cost consequence, which is the part that is easy to skip and expensive to ignore:**

> "Each subagent runs in its own context window with a custom system prompt, specific tool access, and independent permissions. It also sends its own requests, which count toward the same usage limits as your main conversation."

Read that last clause again. **A subagent is not free context.** It has its own window, which is the point, and it makes its own requests against **the same quota**. Delegating five research tasks in one turn is five times the spend, not one.

**One more constraint, and it is a design decision rather than a bug:** if the combined descriptions of your subagents exceed **15,000 tokens**, you get a warning at startup with the total. That is a real ceiling on how many specialised agents you can define before their descriptions start competing for attention — the same failure mode as a skill catalogue that outgrows its listing budget, which Part 2 of Phase 8 covered. **Descriptions are always the scarce resource.**

### Part 4 — Worktrees, and the check you cannot disable

**This is the primitive that makes parallel work safe, and it is the one you should understand first.**

> "A git worktree is a separate working directory with its own files and branch, sharing the same repository history and remote as your main checkout. Running each Claude Code session in its own worktree means edits in one session never touch files in another, so one session can build a feature while a second fixes a bug."

**The underlying mechanism is git's, not the tool's**, and it is worth reading from git's own documentation because it carries a caution the tool does not repeat. Git states that a repository *"can support multiple working trees, allowing you to check out more than one branch at a time"*, and also that *"Multiple checkout in general is still experimental, and the support for submodules is incomplete. It is NOT recommended to make multiple checkout of a superproject."*

**That is a real limitation on monorepos with submodules**, and you will not find it in the agent's documentation. Check whether your repository uses submodules before building a worktree workflow on it.

**Now the part that makes this worth reading carefully: the isolation is enforced, not requested.** The tool implements four checks, and the fourth is the interesting one:

1. It blocks an edit, write, or notebook edit targeting a path in the main checkout.
2. It blocks a command whose working directory resolves to the main checkout.
3. It blocks a command that redirects git into the main checkout.
4. It blocks a command *"when it can't verify from the command text that any git the command runs stays inside the worktree."*

**And: "You can't turn this check off."**

**That is the right design, and the reason to understand it is that a check which fails open is not a check.** The fourth one is the most valuable precisely because it is the one triggered by uncertainty — when the tool cannot prove the command stays inside, it assumes it does not. **A control that only fires when you are certain is a control that fails open exactly when you need it.**

**Background sessions get this automatically**, which removes a decision you might otherwise get wrong: *"Every background session... starts in your working directory. Before editing files, Claude moves the session into an isolated git worktree... so parallel sessions can read the same checkout but each writes to its own."* If you are not in a git repository and have no worktree hook, that move is skipped — so **the isolation is conditional on being in a repository**, and that is worth knowing before you rely on it.

### Part 5 — Teams and workflows, and the 7× question

**Agent teams are the mechanism you will read about most and should adopt least.** The documentation is unusually honest about them, and the honesty is the most useful part.

They are *"experimental and disabled by default"*, requiring an environment variable, and the page opens by telling you to consider something smaller first: *"Before you set up a team, check whether a lighter option does the job."*

**The cost is documented as a multiple, and the multiple is scoped:** *"Agent teams use approximately 7x more tokens than standard sessions when teammates run in plan mode, because each teammate maintains its own context window and runs as a separate Claude instance."* **Note the scoping — that figure is for plan mode. Do not quote it as a general multiplier**, because the documentation does not state one outside plan mode.

**Size guidance is given as a number and a principle:** *"Start with 3-5 teammates for most workflows... If you have 15 independent tasks, 3 teammates is a good starting point"*, and *"Three focused teammates often outperform five scattered ones."* The principle is the transferable part — **partitioning beats headcount.**

**And the limitations list, which is the most instructive section in the whole area:**

- *"No session resumption with in-process teammates: `/resume` and `/rewind` do not restore in-process teammates."*
- *"Task status can lag: teammates sometimes fail to mark tasks as completed, which blocks dependent tasks."*
- *"Shutdown can be slow."*
- *"One team per session."*
- *"No nested teams."*
- *"No background subagents from in-process teammates: a teammate's own subagents run in the foreground, because a teammate's background work can't outlive the lead's process."*

**Read that list as a design brief.** Every entry is a way that "parallel" quietly becomes "sequential" or "fragile." A task list that lags blocks dependent work, so a team is only as parallel as its bookkeeping. And a teammate that cannot background its own work means a lead that dies takes everything with it.

**Dynamic workflows are the other escalation, and the trade is different.** A workflow moves the plan out of the model, into a script — which makes it *auditable and rerunnable* in a way a model's turn-by-turn judgement is not. The documented use is work that *"outgrows a handful of subagents, or you want findings verified against each other"*: a codebase-wide audit, a large migration, cross-checked research. **The reason to reach for it is not speed. It is that the plan survives the conversation.**

### Part 6 — Walking away, and the state model

This is the pattern that sounds like the future, and it is genuinely here.

> "Background sessions don't need any terminal open to keep working. A separate supervisor process runs them, so you can close agent view, close your shell, or start a new interactive session and your dispatched work keeps going."

**A supervisor process is the whole trick.** The work is not attached to your terminal; it is attached to a process that outlives it. And the persistence is broader than you would guess: *"Session state persists on disk through auto-updates and supervisor restarts. Sessions are also preserved when your machine sleeps. Their processes resume on wake."*

**But the honest part is the state model, and you should read it before you rely on the pattern.** A dispatched session is in one of six states: **Working, Needs input, Idle, Completed, Failed, Stopped.**

**"Needs input" is the state that defines the pattern.** It covers *"a question, a permission decision, or another prompt only you can answer, such as a sandbox prompt."* So walking away does not mean the work completes unattended. It means **the work that can complete unattended does, and the rest arrives as a short list of things that need you specifically.** That is a much better deal than supervising, and it is not the same thing as not needing you.

**And what it costs while you are away, stated plainly:** the one-line summary in each row *"is generated by a Haiku-class model"*, and — the part that matters — *"Each session uses your subscription quota independently."* **Five background sessions are five concurrent claims on your quota, whether or not you are watching.** Walking away does not reduce spend; it makes spend less visible.

**Scheduling is a related mechanism with different constraints, and the comparison is worth having:**

| | Cloud routines | Desktop scheduled tasks | A self-paced loop |
|---|---|---|---|
| Runs on | Anthropic-managed | Your machine | Your machine |
| Machine must be on | No | Yes | Yes |
| Open session needed | No | No | **Yes** |
| Access to local files | No — fresh clone | Yes | Yes |
| Runs autonomously, no prompts | Yes | Configurable | Inherits from session |
| Minimum interval | 1 hour | 1 minute | 1 minute |

**And the limits that decide which you pick.** Session-scoped tasks *"only fire while Claude Code is running and idle"*, there is *"no catch-up for missed fires"*, a session holds up to **50** at once, and — the one that surprises people — **recurring tasks expire automatically 7 days after creation**, firing once more and then deleting themselves.

**So a "daily standup task" you set up quietly stops existing after a week.** That is a designed default rather than a bug: an endlessly recurring unattended job with no human in the loop is not something you want to discover is still running. **But it does mean a schedule is not a durable automation, and treating it as one is how you end up with a task that silently stopped three weeks ago.**

### Part 7 — The check that decides when it is done

**Everything above is unsafe on its own, and the reason is stated better than I could state it:**

> "Claude stops when the work looks done. Without a check it can run, 'looks done' is the only signal available, and you become the verification loop: every mistake waits for you to notice it. Give Claude something that produces a pass or fail, and the loop closes on its own."

**Read the middle of that sentence carefully, because it is the actual argument.** The problem with a long autonomous run is not that the agent stops early — it is that **you become the loop**, and the loop only runs at the speed of your attention. A dispatched job that needs you to notice a problem is a job that ran for three hours to produce a question.

**Four gates, escalating, and the choice is about how much you trust the result:**

1. **In one prompt** — ask it to run the check and iterate in the same message. Cheapest, and fine for a focused task.
2. **Across a session** — set the check as a goal condition, where a separate evaluator re-checks after every turn and work continues until it resolves.
3. **As a deterministic gate** — a **Stop hook** runs your check as a script and blocks the turn from ending until it passes. This is Phase 9's distinction applied: the check is no longer a request.
4. **By a second opinion** — a verification subagent or workflow whose job is to try to **refute** the result, so the agent doing the work is not the one grading it.

**Gates 3 and 4 are the ones that make unattended work defensible**, and they are worth the extra machinery precisely because they are the two that do not depend on a model judging its own work. Phase 3 of this track established why that matters; a self-grading agent grading itself is the same failure with more tokens.

**And the honest warning, which belongs in any material that teaches this pattern:**

> "A reviewer prompted to find gaps will usually report some, even when the work is sound, because that is what it was asked to do. Chasing every finding leads to over-engineering."

**That is a real and underappreciated cost.** Adversarial review has a false-positive rate, and a team that treats every finding as real spends its second pass fixing problems that were never there. **A second opinion is worth having; it is not worth obeying unconditionally.** The correct response to a review finding is to check it, not to implement it.

### Part 8 — Large codebases, and one honest negative

**The failure mode at scale is not that the agent cannot cope. It is that the context fills with things unrelated to the task:**

> "As the codebase grows, the defaults tuned for smaller projects can fill the context window with instructions and file reads unrelated to the task, costing tokens and degrading Claude's performance."

**And the instruction-file problem has a specific shape**, quoted from the monorepo guide: *"In a large codebase, a single CLAUDE.md at the repository root tends to either grow to cover every subsystem's conventions, costing context on instructions unrelated to the current task, or stay too generic to be useful."* **A file written for a whole monorepo is bad in exactly the two ways you would expect, and both are context problems.**

**The fix is scoping, and it is the two-level split you met in Phase 9:** files load from your working directory and its parents at launch, and *"each subdirectory's file on demand when it reads files there."* So starting from one package means *"it loads both `packages/api/CLAUDE.md` and the root `CLAUDE.md`... with no instructions from `packages/web/` in context."*

**And the tool for finding things, which is the second half of scale.** A code intelligence plugin *"gives Claude the live diagnostics and go-to-definition that your editor has"* and *"finds definitions and references by symbol instead of by text search."* Note what it is not: *"It doesn't include the language server. You install the language server binary first, then the plugin."* Official plugins exist for the common languages — C/C++, C#, Go, Java, Kotlin, Lua, PHP, Python, Ruby, Rust, Swift.

**Now the honest negative, and this is the part worth reading twice.** It is widely said that text search is *wrong* for typed languages, and it is the kind of claim a curriculum repeats without checking. **The documentation does not make that claim.** What it says is about cost: a single go-to-definition call replaces *"what might otherwise be a grep followed by reading multiple candidate files."*

**Cost, not correctness.** Text search still finds the definition; it just gets there by reading more than one file to do it. **So the honest teaching is that code intelligence is primarily a context-efficiency tool, and that a claim about it being more *accurate* is not supported by the source.** That distinction is worth internalising separately from the phase: a secondary claim that sounds obviously right is not the same as a documented one, and this project's whole research discipline exists because those two come apart.

**One more scale finding, and it is a real limitation of the instruction-file approach:** with skills spread across many directories, *"the list Claude chooses from can grow large... some skills lose their descriptions entirely, which can strip the keywords Claude uses to decide whether a skill applies."* **The same listing budget from Phase 8 bites harder in a monorepo**, and it degrades by removing exactly the words needed to match.

### Part 9 — Cost, and the audit

**Parallelism multiplies spend, and it is the constraint that bounds every choice in this phase.**

> "Running several sessions or subagents at once multiplies token usage."

**Two published anchors, both dated and both vendor figures rather than measured costs:**

- **Agent teams: approximately 7× standard sessions when teammates run in plan mode.** Scoped, as noted in Part 5 — do not generalise it.
- **Enterprise deployments: *"Across enterprise deployments, the average cost is around $13 per developer per active day and $150-250 per developer per month, with costs remaining below $30 per active day for 90% of users."* From `costs.md`, read 2026-09-29. Reported by the vendor, not independently verified, and it is an average across deployments that will not describe you — but it is the right order of magnitude for "what does a day of agentic work cost."

**The guidance is about restraint, not optimisation:** use a mid-tier model for teammates, *"keep teams small"*, *"keep spawn prompts focused"*, and — the one people forget — *"Shut down teammates when their work is done. Each active teammate continues consuming tokens until it exits or the session ends."*

**An idle teammate is a bill that keeps arriving.** There is no reason for a finished session to keep consuming, and in this repository's own tooling the same principle governs hooks and scheduled tasks: everything unattended should have a defined stopping condition.

**So the audit, and it is the deliverable. For every piece of work you have dispatched or plan to:**

1. **Which mechanism, and which of the four things did it move** — context, filesystem, plan, or coordination?
2. **What stops it?** Not "I will check" — a named gate: a command, a goal condition, a Stop hook, or a review.
3. **What is its isolation**, and is that isolation actually active — a repository, a worktree, or a partitioning plan?
4. **What does it cost per hour while it runs, and what stops the meter?**

**The standard for the deliverable: a colleague should be able to read your table and tell you, for each dispatched job, what it is waiting for and what it is spending.** If the answer to "what stops it" is "nothing, I just check", then you have not automated anything — you have moved the supervision somewhere with worse visibility, and the honest thing is to keep the work sequential until a real gate exists.

## Hands-on practice tasks

1. Write down the three decision questions and answer them for three pieces of work you actually have pending. <!-- id: agent-10-scale-and-parallel-agents-t01 band: quick energy: low -->
2. For each of those three, name which of context, filesystem, plan, or coordination is the binding constraint. <!-- id: agent-10-scale-and-parallel-agents-t02 band: focused energy: normal -->
3. Take one side task that would flood your context and delegate it to a subagent. Record what you received back versus what you would have received. <!-- id: agent-10-scale-and-parallel-agents-t03 band: focused energy: normal -->
4. Check your usage before and after. Write down the ratio between the subagent's spend and yours, and reason about whether the trade was worth it. <!-- id: agent-10-scale-and-parallel-agents-t04 band: focused energy: normal -->
5. Create a worktree and run a session inside it. Confirm the branch and directory, and that it shares the repository history. <!-- id: agent-10-scale-and-parallel-agents-t05 band: focused energy: normal -->
6. Attempt, from inside the worktree, to edit a file in your main checkout. Record what the tool did and what it said. <!-- id: agent-10-scale-and-parallel-agents-t06 band: focused energy: normal -->
7. Run two sessions in two worktrees on two independent changes. Confirm neither could see the other's edits. <!-- id: agent-10-scale-and-parallel-agents-t07 band: focused energy: normal -->
8. Dispatch one background job, close the terminal, and confirm the supervisor keeps it running. Reopen and check its state. <!-- id: agent-10-scale-and-parallel-agents-t08 band: focused energy: normal -->
9. Set a recurring scheduled task. Confirm when it fires, then confirm whether it is still scheduled after its expiry window. <!-- id: agent-10-scale-and-parallel-agents-t09 band: focused energy: normal -->
10. Identify a command in your project that produces a pass or fail with a non-zero exit. Write it down as your gate. <!-- id: agent-10-scale-and-parallel-agents-t10 band: focused energy: normal -->
11. Attach that gate to a dispatched job two ways: once as an in-prompt instruction, once as a Stop hook. Compare what each actually guarantees. <!-- id: agent-10-scale-and-parallel-agents-t11 band: focused energy: normal -->
12. Have a separate reviewer try to refute the job's output. Record every finding it raised, and mark which were real. <!-- id: agent-10-scale-and-parallel-agents-t12 band: focused energy: normal -->
13. Install a language server and its code intelligence plugin for one language in your project. Compare a symbol lookup against a text search. <!-- id: agent-10-scale-and-parallel-agents-t13 band: focused energy: normal -->
14. Measure the context a symbol lookup costs against a text search followed by reading candidate files. Record both. <!-- id: agent-10-scale-and-parallel-agents-t14 band: focused energy: normal -->
15. Check whether your repository uses submodules, and whether git's documented caveat about multiple checkouts applies to it. <!-- id: agent-10-scale-and-parallel-agents-t15 band: focused energy: normal -->
16. Build the audit table from Part 9 for every dispatched or planned job. Record what stops each one and what it costs per hour. <!-- id: agent-10-scale-and-parallel-agents-t16 band: deep energy: high -->
17. Take one job whose answer to "what stops it" is "I just check", and either give it a real gate or bring it back to sequential work. <!-- id: agent-10-scale-and-parallel-agents-t17 band: deep energy: high -->
18. Find every teammate, subagent, or scheduled task you left running. Shut down the finished ones and record what each had been costing. <!-- id: agent-10-scale-and-parallel-agents-t18 band: deep energy: high -->
19. Keep a log for two weeks: for every parallel job, whether the mechanism matched the constraint, what it cost, and what stopped it. <!-- id: agent-10-scale-and-parallel-agents-t19 band: ongoing energy: normal -->

## Common Pitfalls

1. **Reaching for a team first.** The documentation says check whether a lighter option does the job. Most work needs a subagent.
2. **Forgetting that subagents spend your quota.** A subagent has its own context *and* makes its own requests against the same usage limits.
3. **Running parallel sessions in one checkout.** This is the collision worktrees exist to prevent, and the enforcement is there for a reason.
4. **Assuming worktree isolation is unconditional.** It requires a repository, and git's own docs caution against multiple checkouts of a superproject.
5. **Believing a check is a feature that runs itself.** The agent stops when the work looks done. Without a gate, you are the loop.
6. **Quoting the 7× figure without its scope.** It is documented for teammates running in plan mode. The docs state no general multiplier.
7. **Leaving finished teammates running.** Each active one keeps consuming tokens until it exits or the session ends.
8. **Treating a scheduled task as durable automation.** Recurring tasks expire automatically after seven days, and there is no catch-up for missed fires.
9. **Reading "Needs input" as a failure.** It is the state that defines the walk-away pattern — it is the list of things that need you specifically.
10. **Obeying every review finding.** A reviewer prompted to find gaps will report some even when the work is sound.
11. **Claiming text search is inaccurate on typed languages.** The documentation supports a *cost* argument, not a correctness one.
12. **Writing one instruction file for a whole monorepo.** It grows to cover everything and costs context on unrelated tasks, or stays too generic to be useful.
13. **Letting a skill catalogue grow across many directories.** Descriptions start being dropped, taking the matching keywords with them.
14. **Using experimental features as a foundation.** Agent teams are disabled by default; agent view is a research preview.

## Deliverable / proof of work

**`portfolio/agents/10-scale-and-parallel-agents.md`**, containing:

1. **The decision table** from task 1: three pieces of work, the three questions answered for each, the mechanism chosen, and the constraint it moved.
2. **Two isolated parallel sessions** — worktree paths, branches, and the recorded result of attempting to reach outside one.
3. **One dispatched background job** with its state recorded before and after you closed the terminal, and the audit of what it was spending while idle.
4. **Two gates on the same job** — in-prompt and Stop hook — with what each actually guarantees, written from observation rather than expectation.
5. **The refutation pass** from task 12: every finding the reviewer raised, each marked real or not. **The false positives are the interesting half of this document.**
6. **The context measurement** from task 14: symbol lookup against text search, with both numbers.
7. **The audit table** from Part 9, for every parallel or dispatched job you have.
8. **A dated note** recording that these features were read on 2026-09-29, which of them are research preview or experimental, and which figures are vendor-reported.

The standard: **a colleague should be able to read this and tell you, for each dispatched job, what it is waiting for and what it is spending.** If anything in the table is answered "I will check", say so plainly rather than dressing it up.

## Checklist

- [ ] I can name the three questions the parallelism decision turns on <!-- id: agent-10-scale-and-parallel-agents-c01 energy: low -->
- [ ] I can say what each mechanism moves: context, filesystem, plan, or coordination <!-- id: agent-10-scale-and-parallel-agents-c02 energy: normal -->
- [ ] I can choose between subagent, worktree, team, and workflow for a given piece of work <!-- id: agent-10-scale-and-parallel-agents-c03 energy: normal -->
- [ ] I know that a subagent makes its own requests against the same usage limits <!-- id: agent-10-scale-and-parallel-agents-c04 energy: high -->
- [ ] I can explain what a worktree is and why parallel sessions need one <!-- id: agent-10-scale-and-parallel-agents-c05 energy: normal -->
- [ ] I know that worktree isolation cannot be disabled, and why a check that fails open is not a check <!-- id: agent-10-scale-and-parallel-agents-c06 energy: high -->
- [ ] I know git's own caveat about multiple checkouts and superprojects <!-- id: agent-10-scale-and-parallel-agents-c07 energy: normal -->
- [ ] I can state the documented cost of agent teams and the scope that figure is limited to <!-- id: agent-10-scale-and-parallel-agents-c08 energy: high -->
- [ ] I can list at least three documented limitations of agent teams <!-- id: agent-10-scale-and-parallel-agents-c09 energy: normal -->
- [ ] I understand that "needs input" is the state that defines the walk-away pattern <!-- id: agent-10-scale-and-parallel-agents-c10 energy: normal -->
- [ ] I know that each background session consumes quota independently <!-- id: agent-10-scale-and-parallel-agents-c11 energy: high -->
- [ ] I know that recurring scheduled tasks expire, and that there is no catch-up for missed fires <!-- id: agent-10-scale-and-parallel-agents-c12 energy: high -->
- [ ] I can name a command in my project that produces a pass or fail <!-- id: agent-10-scale-and-parallel-agents-c13 energy: normal -->
- [ ] I can explain why a Stop hook is a stronger gate than a prompt instruction <!-- id: agent-10-scale-and-parallel-agents-c14 energy: high -->
- [ ] I know that a reviewer prompted to find gaps over-reports, and what to do about it <!-- id: agent-10-scale-and-parallel-agents-c15 energy: high -->
- [ ] I can say what code intelligence buys, and that the documented argument is cost rather than accuracy <!-- id: agent-10-scale-and-parallel-agents-c16 energy: high -->

## Quiz

### Q1. The documentation says the choice between parallelism mechanisms turns on three questions. What are they? <!-- id: agent-10-scale-and-parallel-agents-q01 energy: low -->

- [ ] Model size, context window, and quota
- [x] Who coordinates the work, whether workers need to communicate, and whether they edit the same files
- [ ] Number of tasks, size of the repository, and team experience
- [ ] Whether the work is sequential, batched, or continuous

**Why:** It is the vendors' own framing, and the third question is the one that makes isolation non-optional. The others are things a reader might assume matter and that the documentation does not list.

### Q2. A subagent is described as running in its own context. What does that cost you? <!-- id: agent-10-scale-and-parallel-agents-q02 energy: high -->

- [ ] Nothing, because the subagent has a separate budget
- [ ] Only the summary it returns
- [ ] A second session's worth of infrastructure and setup
- [x] It sends its own requests, which count against the same usage limits as your main conversation

**Why:** The isolation is the point — a subagent reads fifty files in a window you never see — but the requests are still yours. Delegating five research tasks in one turn is five times the spend, which is the cost people discover after the fact rather than before.

### Q3. Worktree isolation includes a check that fires when the tool cannot verify a command stays inside the worktree. What is notable about it? <!-- id: agent-10-scale-and-parallel-agents-q03 energy: high -->

- [ ] It is the only one you can disable
- [x] It cannot be turned off, and it fails safe rather than open
- [ ] It only applies to edits, not to shell commands
- [ ] It requires you to enable it per session

**Why:** The interesting property is the direction of its failure. A check that only fires when the tool is certain is a check that fails open precisely when you need it; this one treats "cannot prove it is safe" as unsafe, and the documentation says it cannot be turned off.

### Q4. The documented figure of roughly 7× more tokens for agent teams is scoped to which situation? <!-- id: agent-10-scale-and-parallel-agents-q04 energy: high -->

- [x] Sessions running in plan mode
- [ ] All agent team sessions
- [ ] Teams with more than five teammates
- [ ] The first hour of a team's life

**Why:** The figure is stated for teammates running in plan mode, because each maintains its own context window as a separate instance. The documentation gives no general multiplier, so quoting it without the scope overstates the cost outside plan mode and understates it inside.

### Q5. A recurring scheduled task is described as expiring automatically. After how long? <!-- id: agent-10-scale-and-parallel-agents-q05 energy: normal -->

- [ ] 24 hours
- [ ] 30 days
- [ ] It does not expire while the session is open
- [x] 7 days, firing once more before deleting itself

**Why:** Seven days, with one final fire. It is a designed default — an endlessly recurring unattended job with nobody in the loop is not something you want to discover is still running — but it means a schedule is not durable automation, and one that silently stopped three weeks ago looks identical to one that never existed.

### Q6. What is the documented reason a long autonomous run needs a check? <!-- id: agent-10-scale-and-parallel-agents-q06 energy: high -->

- [x] Without a check the only completion signal is that it looks done, so you become the verification loop
- [ ] Agents cannot tell when they have finished a task
- [ ] Checks reduce the token cost of long runs
- [ ] Tools refuse to run without an explicit completion signal

**Why:** The stated problem is not premature stopping but where the loop runs. A dispatched job that needs you to notice produces work and then a question, and the loop only runs at the speed of your attention. A check that produces a pass or fail closes it.

## You're ready to move on when...

- You can pick a mechanism for a new piece of work and name which of context, filesystem, plan, or coordination was the binding constraint.
- You have run two sessions in isolated worktrees and can explain what stops one reaching the other's files.
- You have dispatched a job, closed the terminal, and come back to a state you can interpret — including what "needs input" is asking of you.
- You can name a command in your project that produces a pass or fail, and have attached it to a job as a gate.
- You have run a refutation pass and can show which of its findings were false, and what you did about that.
- You can state the cost of your parallelism per hour, and you have shut down everything that was finished.
- You can explain what code intelligence gives you and that the documented argument is about context cost, not accuracy.
- You can list at least three documented limitations of agent teams, and say why you would reach for one anyway or not at all.

## Free vs Paid

**Every mechanism in this phase is available on a free tier**, and the mechanics are the point. The multi-session surface, worktrees, subagents, and scheduled tasks do not require a paid plan.

**Where money genuinely bites, and it is worth being blunt about it.** Parallelism is the most expensive habit in this curriculum, because the cost multiplies: documented guidance is to keep teams small, use a mid-tier model for teammates, keep spawn prompts focused, and shut down teammates when they are done. **On a free or limited quota, the right parallelism is usually one session plus the occasional subagent, and the disciplined answer to "should I run five at once" is usually no.** A tier with a larger quota does not make the coordination free; it makes the same mistake more expensive per hour.

**The 7× figure and the enterprise averages in Part 9 are vendor-reported and dated**, not measured costs, and they are the reason this phase tells you to compute your own rather than adopt theirs. The Cost track covers that arithmetic properly; this phase only needs you to know the multiplier exists before you reach for the mechanism.

**One boundary worth keeping.** Cloud-hosted scheduled work keeps running when your machine is off, and that is genuinely useful — but it is also a recurring cloud cost on a schedule you have to remember you created, given that recurring tasks expire on their own. Check the current terms before relying on it, and treat "it runs while I sleep" as a bill, not a convenience.
