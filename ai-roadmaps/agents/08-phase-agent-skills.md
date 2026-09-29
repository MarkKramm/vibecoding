---
id: agent-08-agent-skills
track: agents
phase: 8
order: 80
title: Agent Skills and the Harness You Configure
duration: 2 weeks
duration_weeks: 2
energy_mix: [normal, high]
deliverable: portfolio/agents/08-agent-skills.md
exit_criteria: >
  You can write a skill that triggers on the requests you expect and stays quiet
  on the ones you do not, choose correctly between the extension points an agent
  harness offers, and explain what your harness is allowed to do on your behalf
  without you reading the source of every tool it holds.
---

# Phase 8 — Agent Skills and the Harness You Configure

## Goal of this phase

Everything in this track so far has been about the agent. This phase is about **the thing you configure around it.**

An agent harness is not just a chat box with tools. It is a layer of files on your disk — instruction files, skills, subagent definitions, hooks, settings — that decides what the agent knows, what it may do, and what happens when it touches something. **That layer is where most of the difference between a mediocre setup and a good one lives**, and almost none of it is in the model.

You have probably already met skills without knowing it. You have seen people on the internet talking about "skills" for their agents, and it can sound like a plugin system or a prompt pack or a marketplace. It is none of those. **A skill is a markdown file with a description, in a directory, that the agent loads when it becomes relevant.** That is the whole idea, and almost all of the difficulty is in the description.

By the end you will have written skills that trigger when you expect and stay quiet when you do not, a clear reason for using each of the extension points rather than piling everything into one file, and — because this project treats "it is the vendor's problem" as a failure mode — a written account of what your harness can do to your machine without asking.

## Estimated time

**2 weeks** at 1–2 hours a day, 5 days a week. Roughly 14–18 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Part 1: what a skill actually is | 2h |
| 2 | Part 2: the description, which is the whole skill | 2h |
| 3 | Part 3: writing your first skills | 2h |
| 4 | Part 4: the other extension points, and choosing between them | 2h |
| 5 | Part 5: tools, permissions, and what a skill may do | 2h |
| 6 | Part 6: the open standard, and what travels | 1.5h |
| 7 | Part 7: debugging skills that misbehave | 2h |
| 8 | Part 8: the harness audit, then the deliverable | 2h |

If you only have four hours this week, do tasks 1, 4, 9 and 12. Those produce three working skills, a written extension-point decision, and the audit — which is the phase.

Budget extra time on day 2. The description is the hard part, and it resists being written quickly.

## Skills you'll gain

- Explain what a skill is, and why it is not a prompt, a plugin, or a macro.
- Write a skill description that triggers on the requests you expect.
- Choose correctly between instruction files, skills, subagents, hooks, and MCP.
- Use frontmatter to control who can invoke a skill and with which tools.
- Run a skill in an isolated subagent context when the work is large.
- Distinguish the portable Agent Skills fields from the vendor extensions.
- Debug a skill that never triggers, triggers too often, or loses its description.
- Reason about the cost of a large skill catalogue in context-window terms.
- Audit what a configured harness is permitted to do on your behalf.

## Specific topics to learn

- The `SKILL.md` file: a markdown body plus YAML frontmatter.
- The `description` field, and why it is the only field that decides whether a skill fires.
- `disable-model-invocation` and `user-invocable`: manual-only and model-only skills.
- `context: fork`, `agent`, and `background`: running a skill in its own subagent.
- `allowed-tools` and `disallowed-tools`: scoping what a skill may touch.
- `paths`: activating a skill only for matching files.
- Instruction files (`CLAUDE.md`, `AGENTS.md`) versus skills: persistent facts versus on-demand procedures.
- Hooks as the event-driven layer, and why they are the most dangerous thing you will configure.
- The Agent Skills open standard and the six fields that travel with it.
- The skill listing budget, and what happens when you have too many skills.
- The security consequence: a configured harness holds standing authority.

## Tools for This Phase

- **A coding agent with a skills mechanism.** Claude Code is the reference implementation documented here, because it is the one whose docs name every field. Any harness that follows the Agent Skills standard will behave similarly for the portable fields.
- **A terminal.** You will create directories and files by hand at least once, deliberately, so you know exactly what the tool did.
- **A version-controlled repository.** Skills are files. They belong in git from the first commit, for the reasons Phase 2 of the Vibecoding track gives.
- **A scratch repository** with a real but small codebase, so skill triggers are observable.
- **Your agent's own documentation index.** For Claude Code that is `https://code.claude.com/docs/llms.txt`, a plain list of every page. Fetch the index before guessing a path; guessed deep links 404.

## Free/cheap resources

- **`https://code.claude.com/docs/en/skills.md`** — the full skills reference, including the frontmatter table this phase is built on. Free, and the source of every specific claim here.
- **`https://code.claude.com/docs/en/features-overview.md`** — the extension-point comparison table, which is the spine of Part 4.
- **`https://agentskills.io`** — the open standard. Free, short, and the answer to "will this work in another tool".
- **`https://code.claude.com/docs/en/memory.md`** — instruction files, the thing skills are carved out of.
- **`https://code.claude.com/docs/en/hooks-guide.md`** — the event layer.
- **Your own repository's instruction file.** Whatever `AGENTS.md` or `CLAUDE.md` you already have is the best worked example available to you. Read it critically in Part 8.

**⚠️ Dated, 2026-09-29.** Every field name, default, and threshold in this phase was read from vendor documentation on that date. The skill mechanism is recent and moving fast — Claude Code alone changed how boolean frontmatter parses within a few releases, and several behaviours here are explicitly version-gated. **Treat the shape as durable and the specifics as a snapshot.** Where a version is named, it is because the behaviour changed at that version, not for decoration.

## Lesson: The File That Teaches the Agent

### Part 1 — What a skill actually is

Strip away the marketing and a skill is a directory containing a markdown file called `SKILL.md`. That file has two parts: YAML frontmatter at the top, and instructions below it.

That is the entire mechanism. There is no bytecode, no registration step, no manifest to install. **The agent reads a list of your skills' names and descriptions, decides one looks relevant, and reads the full body.** Everything interesting follows from that one sentence.

**Which gives you the two facts that should govern how you write them.**

**First, the body is free until it is used.** A skill's instructions load only when the skill is invoked. So a thousand lines of reference material that you never trigger cost you approximately nothing. The documentation is blunt about it: long reference content *"costs almost nothing until you need it."* This is why a skill is not a longer `CLAUDE.md`, and it is the entire reason skills exist as a separate concept.

**Second, the description is not documentation.** The description is a *routing decision*. It is what the agent matches your request against. Write a beautiful skill with a lazy description and it will sit there unused forever, and you will conclude that skills do not work.

**The distinction that makes the whole thing click, and it is the one people get backwards:**

| | Instruction file (`CLAUDE.md` / `AGENTS.md`) | Skill |
|---|---|---|
| Loaded | Every session, always | Only when relevant, or when you type `/name` |
| Holds | **Facts and conventions** | **Procedures and knowledge** |
| Cost | Every token, every session, forever | Only when used |
| Good for | "We use pnpm, not npm" | "Here is our deploy checklist" |

The vendor's own phrasing for when to carve something out into a skill is worth using as a test: create one when you keep pasting the same instructions, checklist, or multi-step procedure into chat, **or when a section of your instruction file has grown into a procedure rather than a fact.** That is a clean heuristic, and it is checkable: look at your instruction file, and ask of each line whether it is a fact about the project or a thing you would do.

**One more thing that changed recently and is worth knowing.** Older harnesses had "custom commands" and "skills" as two separate things. **They are now the same thing.** A file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` both produce `/deploy` and work identically; existing command files keep working. If you have seen tutorials describing these as different systems, that is out of date — and it means a skill is a superset, because it adds a directory for supporting files, frontmatter to control invocation, and the ability for the agent to load it automatically.

**A worked example of a reference skill**, which is the simpler of the two kinds:

```yaml
---
name: api-conventions
description: API design patterns for this codebase
---

When writing API endpoints:
- Use RESTful naming conventions
- Return consistent error formats
- Include request validation
```

Seven lines, and it does something a fact in an instruction file could not: it stays out of your context until you touch an endpoint.

### Part 2 — The description is the whole skill

This is where the effort goes, and where most people quit. **Treat the description as an interface you are writing, not documentation you are writing.**

The mechanics are specific, and they come from the frontmatter reference:

- `description` is the only field marked *recommended*, and the docs say why: *"Claude uses this to decide when to apply the skill."*
- Omit it and the first non-empty line of the body is used instead. **So a skill with no description and no deliberate first line will route on whatever you happened to write first.**
- The combined `description` plus `when_to_use` text is **truncated at 1,536 characters** in the skill listing. Put the key use case first.
- `when_to_use` is a separate field for trigger phrases and example requests. It is appended to `description` in the listing and **counts against the same 1,536-character cap** — it is not free extra space.

**The failure mode to design against is over-triggering, and it is the one the docs lead with.** A skill that fires on everything pollutes every session, and the cure is a narrower description. This is the opposite of what people assume: the instinct is to make descriptions broad so the skill is "discoverable", and that is exactly what makes a catalogue unusable.

The vendor's own guidance for a skill that triggers too often is two steps: make the description more specific, and if you only ever want it manually, set `disable-model-invocation: true`.

**Which gives a rule you can actually check.** A good description answers three questions a matcher can use:

1. **What is this?** The noun phrase — a deploy checklist, an API convention set, a bug triage procedure.
2. **When should it fire?** The situation, not the topic. "When the user asks to ship" routes; "about deployment" does not.
3. **What words will the user actually say?** The description is matched against a request, so the vocabulary of the request is the vocabulary that must appear. This is why "trigger phrases" is the documented purpose of `when_to_use`.

Compare these, and the difference is the whole lesson:

- ✗ `description: Deployment help` — matches almost nothing, and matches the wrong things.
- ✗ `description: Use this for any task involving code` — matches everything. Useless.
- ✓ `description: Run the production deploy checklist — use when the user asks to deploy, ship to production, release, or cut a version. Triggers on "deploy", "ship it", "release".` — narrow, and carries the user's actual vocabulary.

**And there is a budget you did not know you were spending.** The agent loads a *listing* of every skill name and description into context so it knows what exists. **That listing has a budget of 1% of the model's context window.** When you exceed it, Claude Code drops descriptions — **starting with the skills you invoke least**, so the ones you use most keep their full text.

That is a genuinely good design decision, and it has an uncomfortable consequence: **a skill catalogue rots from the bottom.** The skills you stopped using are exactly the ones whose descriptions vanish first, which makes them harder to rediscover, which is how they get abandoned entirely. Run `/doctor` for an estimate of the listing's cost and its biggest contributors.

If you want to raise the budget there is a documented setting, `skillListingBudgetFraction` (`0.02` for 2%), or a fixed character count via the `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable. **Raise it rarely.** The honest fix for a catalogue that does not fit is to delete skills you do not use, not to buy more room for skills you do not.

### Part 3 — Writing skills that work

**Start with the smallest thing that annoys you.** The best first skill is not ambitious; it is one you can see the effect of. A deploy checklist, a "how do we do migrations here" procedure, a bug-triage routine. **If you cannot tell whether it fired, you cannot tell whether it works.**

Write the body as instructions, not as an essay. The documentation's rule is precise: *"State what to do rather than narrating how or why."* The reason is a cost, not a style preference: **once a skill loads, its content stays in context across turns.** Every line is a recurring charge for the rest of the conversation. This is the opposite of a reference file you read once.

**Then decide who may invoke it**, which is the field people skip and should not:

| Field | Set to | Effect |
|---|---|---|
| `disable-model-invocation` | `true` | The agent will never load it on its own; only you, via `/name` |
| `user-invocable` | `false` | Hidden from the `/` menu; only the agent may use it |

**The rule of thumb: procedures you would not want run unsupervised are `disable-model-invocation: true`.** A deploy is the canonical case, and the documentation's own deploy example sets it. So does anything touching production, anything that spends money, and anything irreversible. **You are choosing to require a human keystroke**, and that is one of the highest-value settings in the entire harness.

Now the second kind, which is the one that changes how you work at scale. Adding `context: fork` runs the skill in a **forked subagent**:

```yaml
---
name: deploy
description: Run the production deploy checklist
context: fork
disable-model-invocation: true
---
```

The work happens in its own context and returns a summary, which means **a large procedure no longer has to share your conversation's context window with everything else you are doing.** For research that reads fifty files and returns three findings, this is the difference between working and not. Setting `background: false` keeps you waiting for the result in the same turn instead of letting it run.

**A fourth field worth knowing now because it will save you later: `paths`.** A glob pattern limits the skill to activating when working with matching files. A skill that only applies to Python files should say so, and then it stops competing for attention during your TypeScript work.

### Part 4 — The other extension points, and choosing between them

Skills are the most flexible extension point, and therefore the easiest to overuse. **The real skill here is knowing when not to reach for one.** The vendor publishes a table mapping features to goals, and it is the most useful single artifact in this phase:

| Extension | What it does | When to use it |
|---|---|---|
| **Instruction file** (`CLAUDE.md`, `AGENTS.md`) | Persistent context every session | Conventions, "always do X" rules |
| **Skill** | Instructions, knowledge, workflows, on demand | Reusable content, repeatable tasks |
| **Subagent** | Isolated context returning a summary | Research across many files; parallel work |
| **Dynamic workflow** | A script the agent writes that runs many subagents | Work that outgrows a handful of subagents |
| **MCP** | Connect to external services | Query a database, post to Slack, drive a browser |
| **Hook** | Your script, on a lifecycle event | Automation that must run on *every* matching event |
| **Code intelligence** | Language-server navigation and diagnostics | Typed languages, large codebases |
| **Output style** | Role, tone, and response format for a session | A voice or format you want every response to have |
| **Cross-session messaging** | One session passes a message to another | Sessions you run that need each other's findings |
| **Artifact** | Publish output as a private web page | Output you would rather see than read as text |
| **Plugin** | Packages and distributes the above | Sharing a whole setup with other people |

**Read the "when to use it" column, because that is the part people skip.** The mistakes it prevents:

- **Putting a convention in a skill.** "We use pnpm" is a fact. Facts belong in the instruction file, loaded every session, and putting them in a skill means the agent may not know them when it matters.
- **Using a skill for something that must always happen.** Hooks are the event layer. A skill that reformats code after every edit is worse than a hook, because a hook *cannot be forgotten* and a skill can fail to trigger.
- **Using a subagent when you want a conversation.** Subagents return summaries. If you need to interrogate the result, do the work yourself.
- **Using a workflow when three subagents would do.** Dynamic workflows are for work that has outgrown a handful of parallel workers.

**The order the vendor recommends building your setup is itself the advice: start with the instruction file, then add other extensions as specific triggers come up.** That is the opposite of how people actually set these up, which is to spend an afternoon configuring everything and then not know which piece is doing the work. **Add an extension when you notice yourself repeating yourself or repeating an instruction.** One skill at a time, each with a reason.

### Part 5 — Tools, permissions, and what a skill may do

This is the part that connects this phase to the rest of the track, and to the safety material in the Safety track.

Two frontmatter fields scope a skill's capabilities:

- **`allowed-tools`** — tools usable *without asking permission* for the turn that invokes the skill. The grant **clears when you send your next message**, which is a genuinely good design: it does not become standing authority.
- **`disallowed-tools`** — tools *removed* while the skill is active. The documentation's example is an autonomous loop that should never call `AskUserQuestion`, which is exactly right: a background task cannot ask a question nobody is there to answer.

**That clearing behaviour is the distinction worth internalising.** A permission grant inside a skill is scoped to one turn. A permission grant in an interactive session, as Phase 7 of the Vibecoding track found across three different tools, can be *written to disk and apply to every future session in that repository*. **Same word, wildly different blast radius.** When you are reading a harness configuration, the question is never "is this permitted" but "for how long, and does it survive this session".

**And the framing that ties the phase together: hooks are the most powerful thing you will configure, and the most dangerous.** A hook runs your script, or an HTTP request, or an MCP tool call, on a lifecycle event — every file edited, every tool used, every session start. That is a standing capability with no per-invocation approval, which is exactly what the safety track means by *authority*. Before you install one, you should be able to answer what it can reach, what it sends anywhere, and what happens if it fails.

**And here is the specific thing that should make you careful, because it is not obvious and it is documented.** Whether a repository's hooks run before you have agreed to trust the repository **depends on how you launched the agent.**

> "**Interactive session**: Claude Code holds back hooks from every settings file, including your own `~/.claude/settings.json`, until you accept the workspace trust dialog for the folder, or for a parent directory whose trust extends to it."
>
> "**`-p` or SDK session**: Claude Code never shows the dialog and treats the folder as trusted, so hooks committed in a repository's `.claude/settings.json` run in a folder you've never trusted."

**Read that second line again, because it is the whole risk.** The interactive trust dialog you may have been relying on as a safety net **does not exist in a scripted or SDK run.** In those modes a repository you have never trusted is treated as trusted, and its committed hooks execute.

**And the asymmetry inside your own configuration, which is the detail to carry away:** hooks declared in a project **skill** follow the same rule as settings-file hooks, so they are registered *"including in a `-p` run in a folder you haven't trusted."* Hooks declared in a project **subagent** are stricter — they run only after you accept the trust dialog, and *"a `-p` session doesn't count as accepting it."* **Two files in the same project directory, same mechanism, opposite trust behaviour.** That is exactly the kind of thing you cannot hold in your head reliably and should therefore check in the documentation.

**The mitigations are documented too, which is the useful part**, because this is a solvable problem rather than a reason to avoid automation: before you script `claude -p` over a repository you did not write, review its `.claude/` settings files, start with `--bare`, or disable hooks for that run with `--settings '{"disableAllHooks": true}'`.

**Connect it back to this week's security research and the pattern completes.** A hostile repository does not need a clever payload if the harness will run its configuration automatically. Hidden instructions in an instruction file (Phase 2 of this track) are one vector; **committed hooks in an untrusted folder under a scripted run are another, and they execute code rather than text.** Both are the same lesson from a different layer: **your agent's configuration is part of your supply chain**, and "I wrote this repo" is not the same as "this configuration is mine."

**A related point, and the reason this phase ends where it does.** A configured harness accumulates authority quietly. Instruction files, skills, subagents, hooks, MCP servers: each one is reasonable, and together they are an agent that can read your repository, run commands, and reach the network **without asking you about any of it in particular.** This week's own security research in this project is the worked example — a repository whose hidden instructions were placed in exactly the files this phase teaches you to write. **Writing `CLAUDE.md` well and knowing that a hostile one is a delivery mechanism are the same skill.**

### Part 6 — The open standard, and what travels

Here is the part that makes skills worth learning rather than a tool-specific trick: **skills are a standard, and the standard is smaller than the implementation.**

Claude Code skills follow the **Agent Skills** open standard, which works across multiple AI tools. Claude Code extends it with invocation control, subagent execution, and dynamic context injection. But **only six frontmatter fields are portable:**

| Where you use it | Fields you may use |
|---|---|
| Claude Code, at any level, including plugins | Every documented field |
| Uploads to claude.ai, the Skills API, and `package_skill.py` from `anthropics/skills` | `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools` |

**The failure mode is sharp, and it is worth remembering precisely: an unexpected field is not ignored, it is a hard error.**

```
Unexpected key(s) in SKILL.md frontmatter: argument-hint.
Allowed properties are: allowed-tools, compatibility, description, license, metadata, name
```

So a skill carrying `context: fork` or `paths` — genuinely useful, and both real — **will fail to package for another tool.** And the reverse also holds: frontmatter restricted to the six spec fields loads in Claude Code without changes, because Claude Code accepts all six.

**The practical rule: keep the body portable, put the vendor extensions in frontmatter, and be honest in your commit message about which is which.** If you want a skill that works everywhere, restrict it to the six. If you want `context: fork`, you are writing a Claude Code skill that happens to use a standard file format, and that is a fine thing to want — it just should not be a surprise later.

### Part 7 — Debugging skills that misbehave

Four failure modes, all documented, all of which you will hit.

**The skill never triggers.** Four ordered steps: check the description contains keywords a user would naturally say; verify it appears in the available-skills listing; rephrase your request to match the description more closely; invoke it directly with `/name` if it is user-invocable.

**And a silent failure worth knowing because it wastes hours:** *if your frontmatter YAML is malformed, the skill still loads — with no fields set.* So `/name` works, the body runs, and the agent **cannot match your description**, because there is no description. It looks exactly like "my description is bad" and it is not. Run with `--debug` to see the parse error, or validate the directory with `claude plugin validate .claude/skills`.

**The skill triggers too often.** Make the description more specific; or set `disable-model-invocation: true` if manual invocation is what you actually wanted all along.

**The skill's description is cut short.** This one is not your fault and is worth recognising instantly. The listing contains **every** skill name, but descriptions are dropped when the listing exceeds its 1% budget — **starting with the least-used skills.** So a skill that used to trigger may have stopped, purely because you added other skills. `/context` reports the listing's size after the budget is applied, which is the number that matches what the model actually receives.

**Your personal skills disappeared.** If folders you created under your personal skills directory are gone, look in the `.trash` subfolder. The documented cause is a file named `manifest.json` sitting in that directory, which caused the listed skill folders to be moved into a timestamped trash folder and stop loading. Restore by moving the folder back — **before the retention sweep, 30 days after the move, deletes trash entries.**

**The general habit this phase is really teaching is the one from Phase 3 of this track: when something does not work, go and look at what actually happened rather than adjusting the thing you wish were wrong.** Four of these five failures are invisible from the outside. The debug flag, the context report, and the validation command are how you find out which one you have.

### Part 8 — The harness audit

**Write down what your setup can do.** Not what you intended it to do — what it is *currently configured* to do. This is the deliverable that separates a hobbyist setup from a reviewable one, and it costs about twenty minutes.

For every extension you have configured, four questions:

1. **What does it do, and when?** The trigger: every session, a model judgement, a slash command, a lifecycle event, or a glob.
2. **What can it reach?** Files, network, commands, credentials. Be specific enough that a reader could check it.
3. **How long is its authority?** One turn, one session, or persistent across sessions in this repository?
4. **Who wrote it, and would you recognise a change?** If you cannot answer this, you have found your next task.

**Then delete anything you cannot justify.** An extension you cannot explain is an extension you cannot review, and the honest finding is usually that you have three skills where one would do.

**And read your own instruction file critically, as a security artifact.** Because this week's research established that these files are where a hostile repository puts its instructions. Ask: what does this file tell the agent to do, does any of it grant standing authority, and would I be comfortable with it arriving from a pull request I had not read closely?

**The deliverable is the three files: three skills with deliberate descriptions and a stated reason for each, a one-page extension-point decision, and this audit.** If the audit is uncomfortable, that is the phase working.

## Hands-on practice tasks

1. Inventory every instruction file and agent configuration on your machine. Record the path, what it configures, and when you last read it. <!-- id: agent-08-agent-skills-t01 band: quick energy: low -->
2. Write one sentence for each item in your inventory answering: what would break if I deleted this? <!-- id: agent-08-agent-skills-t02 band: quick energy: low -->
3. Choose one procedure you have pasted into a chat more than twice. Write it as a reference skill with a `description` and a body under fifteen lines. <!-- id: agent-08-agent-skills-t03 band: focused energy: normal -->
4. Write three candidate descriptions for that skill: one too narrow, one too broad, one deliberate. Save all three before choosing. <!-- id: agent-08-agent-skills-t04 band: focused energy: normal -->
5. Test each description against five realistic requests, three that should trigger and two that should not. Record which fired. <!-- id: agent-08-agent-skills-t05 band: focused energy: normal -->
6. Set `disable-model-invocation: true` on the skill and confirm the agent no longer loads it on its own while `/name` still works. <!-- id: agent-08-agent-skills-t06 band: focused energy: normal -->
7. Take your longest instruction-file section and classify every line as a fact about the project or a procedure. Move the procedures into skills. <!-- id: agent-08-agent-skills-t07 band: focused energy: normal -->
8. Add `context: fork` to your largest skill and measure whether a research task that previously crowded your context now returns cleanly. <!-- id: agent-08-agent-skills-t08 band: focused energy: normal -->
9. Add `paths` to a language-specific skill and verify it stops activating during work in another language. <!-- id: agent-08-agent-skills-t09 band: focused energy: normal -->
10. Using the extension-point table, write a one-page decision record: which extension you use for conventions, for procedures, for always-run automation, and for external services, and why. <!-- id: agent-08-agent-skills-t10 band: focused energy: normal -->
11. Create a deliberately malformed frontmatter block in a scratch skill. Observe that the skill loads with empty metadata, and find it with `--debug`. <!-- id: agent-08-agent-skills-t11 band: focused energy: normal -->
12. Restrict one of your skills to the six portable Agent Skills fields. Attempt to package it for another tool and record exactly which fields it rejected. <!-- id: agent-08-agent-skills-t12 band: focused energy: normal -->
13. Add a sixth skill and watch the listing budget. Record the size `/context` reports and which descriptions get dropped. <!-- id: agent-08-agent-skills-t13 band: focused energy: normal -->
14. Install one hook on a low-risk event. Write down before installing what it can reach and what happens if it fails. <!-- id: agent-08-agent-skills-t14 band: focused energy: normal -->
15. Run the harness audit from Part 8 across every extension you have configured. Produce the four answers for each. <!-- id: agent-08-agent-skills-t15 band: deep energy: high -->
16. Delete every extension you cannot justify in the audit, then re-run a normal task and confirm nothing broke. <!-- id: agent-08-agent-skills-t16 band: deep energy: high -->
17. Read your own instruction file as a hostile artifact. List every line that grants standing authority, and decide whether you would accept each from an unreviewed pull request. <!-- id: agent-08-agent-skills-t17 band: deep energy: high -->
18. Pair with a colleague and swap setups. Write down every difference you find and which one is better and why. <!-- id: agent-08-agent-skills-t18 band: deep energy: high -->
19. Keep a running log for two weeks: for each session, which skills triggered, which you expected, and what you would change. <!-- id: agent-08-agent-skills-t19 band: ongoing energy: normal -->

## Common Pitfalls

1. **Writing a description as documentation.** The description is a routing decision matched against a request. `Deployment assistance` routes to nothing. `Use when the user asks to deploy, ship, or release` routes.
2. **Making descriptions broad to be "discoverable".** Over-triggering is the documented failure and the one the vendor leads with. A skill that fires on everything makes the whole catalogue worse.
3. **Assuming a skill that does not fire has a bad description.** Malformed frontmatter loads the skill with **no fields set**, so `/name` works and the model cannot match. This looks identical to a bad description and is not one.
4. **Putting facts in skills.** Conventions belong in the instruction file, loaded every session. A skill may not be there when the convention matters.
5. **Not deleting skills.** The listing budget drops descriptions for the *least-used* skills, so an abandoned catalogue rots from the bottom and the abandoned skills get harder to rediscover.
6. **Treating `allowed-tools` as a standing grant.** It clears when you send your next message. That is the good case; understand why before you rely on it, and do not confuse it with a session-level permission, which can persist.
7. **Adding a hook before you understand events.** Hooks run on lifecycle events with no per-invocation approval. Know what it can reach before installing, not after.
8. **Assuming vendor extensions travel.** A skill using `context: fork` or `paths` fails to package for another tool with a hard error. Keep portability in mind if you plan to share.
9. **Configuring everything at once.** The recommended order is one instruction file, then extensions as specific triggers appear. A setup you built in an afternoon is a setup you cannot review.
10. **Writing a skill body that narrates.** Once loaded, it stays in context across turns. State what to do, not how or why.
11. **Believing the harness is just the model.** Every extension you add is standing authority, and the files this phase teaches you to write are also the files an attacker targets.
12. **Treating this phase's field list as durable.** It is a dated snapshot of a fast-moving feature, with several behaviours explicitly version-gated.

## Deliverable / proof of work

**`portfolio/agents/08-agent-skills.md`**, containing:

1. **Three working skills**, committed to a repository, each with a deliberate `description`, a `when_to_use` where it helps, a body under fifteen lines, and a one-line statement of which frontmatter fields are portable and which are vendor extensions.
2. **The triggering test table** from task 5: five requests, what was expected, what actually fired, and what you changed as a result.
3. **The extension-point decision record** from task 10, naming the extension you use for each of the four categories and why.
4. **The harness audit** from task 8, covering every extension you have configured, with the four answers for each and a list of what you deleted and why.
5. **The instruction-file security review** from task 17: every line granting standing authority, and your judgement on each.
6. **A dated note** stating that the field list, defaults, and thresholds come from vendor documentation read on 2026-09-29, and which behaviours are version-gated.

The standard for this deliverable: **a competent engineer who has never used your harness could read the audit and tell exactly what your agent is permitted to do to your machine.** If that reader would need to open your configuration files to find out, the audit is not finished.

## Checklist

- [ ] I can explain what a skill is and why it is not a prompt, a plugin, or a macro <!-- id: agent-08-agent-skills-c01 energy: low -->
- [ ] I can write a description that triggers on real requests and stays quiet on the rest <!-- id: agent-08-agent-skills-c02 energy: normal -->
- [ ] I can explain why the description is a routing decision rather than documentation <!-- id: agent-08-agent-skills-c03 energy: normal -->
- [ ] I can state the rule for when a line belongs in an instruction file versus a skill <!-- id: agent-08-agent-skills-c04 energy: normal -->
- [ ] I can use `disable-model-invocation` to require a human keystroke on a risky procedure <!-- id: agent-08-agent-skills-c05 energy: normal -->
- [ ] I can run a skill in a forked subagent and say why I would <!-- id: agent-08-agent-skills-c06 energy: normal -->
- [ ] I can choose between an instruction file, a skill, a subagent, a hook, and MCP for a given need <!-- id: agent-08-agent-skills-c07 energy: normal -->
- [ ] I can scope a skill with `allowed-tools` and `disallowed-tools` <!-- id: agent-08-agent-skills-c08 energy: normal -->
- [ ] I can say how long a skill's tool grant lasts and how that differs from a session permission <!-- id: agent-08-agent-skills-c09 energy: high -->
- [ ] I can list the six portable Agent Skills fields and what happens on an unexpected one <!-- id: agent-08-agent-skills-c10 energy: normal -->
- [ ] I can debug a skill that never triggers, and know that malformed YAML is silent <!-- id: agent-08-agent-skills-c11 energy: normal -->
- [ ] I can explain the skill listing budget and why an unused skill loses its description <!-- id: agent-08-agent-skills-c12 energy: high -->
- [ ] I can describe what a hook can do and why it needs more scrutiny than a skill <!-- id: agent-08-agent-skills-c13 energy: normal -->
- [ ] I have audited every extension I have configured and deleted what I cannot justify <!-- id: agent-08-agent-skills-c14 energy: high -->
- [ ] I can read my own instruction file as an attack surface <!-- id: agent-08-agent-skills-c15 energy: high -->

## Quiz

### Q1. A skill's `description` is described in the vendor documentation as which of the following? <!-- id: agent-08-agent-skills-q01 energy: low -->

- [ ] Optional decoration shown in the slash-command menu
- [ ] A cache key that determines load order
- [ ] A fallback used only when the frontmatter YAML fails to parse
- [x] The field Claude uses to decide when to apply the skill

**Why:** The frontmatter reference marks `description` as the only field it recommends, precisely because routing depends on it. It is the field matched against a user's request. The YAML-failure case is the *opposite* — a parse failure leaves every field unset, which is a bug mode, not a designed fallback.

### Q2. Malformed YAML in a skill's frontmatter causes which behaviour? <!-- id: agent-08-agent-skills-q02 energy: high -->

- [x] The skill loads with no fields set, so `/name` works but the model cannot match the description
- [ ] The skill fails to load and reports a parse error
- [ ] The skill loads but its body is ignored
- [ ] The skill loads and every field keeps its default value

**Why:** This is the documented failure mode and it is silent, which is why it costs hours. The skill still loads, so invoking it directly works and the body runs; the metadata is simply empty, so the model has no description to match against. The tell is that direct invocation succeeds while automatic triggering never does.

### Q3. What happens when your skill catalogue exceeds the listing budget? <!-- id: agent-08-agent-skills-q03 energy: high -->

- [ ] Older skills are dropped from the catalogue entirely
- [x] Descriptions are dropped starting with the least-used skills
- [ ] The full listing is kept and the context window is reduced instead
- [ ] Skills beyond the budget load in full but without their bodies

**Why:** Every skill *name* is always present; it is the descriptions that are dropped to fit a budget of 1% of the model's context window, and the ones dropped are the least-used. This is a good design and a trap: an abandoned skill loses the keywords that would let you rediscover it, so the catalogue rots from the bottom rather than uniformly.

### Q4. Which frontmatter fields travel with the Agent Skills open standard? <!-- id: agent-08-agent-skills-q04 energy: normal -->

- [x] `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`
- [ ] Every field Claude Code supports, for maximum flexibility
- [ ] `name`, `description`, and `context`
- [ ] Whatever the skill's author chooses; the standard does not constrain fields

**Why:** The standard defines six fields, and using an unexpected one is a hard packaging error rather than a warning. Claude Code accepts all six plus its own extensions, so a skill restricted to the six loads in Claude Code unchanged and also packages elsewhere. A skill using `context: fork` or `paths` is a Claude Code skill that uses a standard file format.

### Q5. `allowed-tools` in a skill grants tools without permission for which period? <!-- id: agent-08-agent-skills-q05 energy: high -->

- [ ] Until the repository is re-cloned
- [ ] For the whole session, and across future sessions in that repository
- [x] For the turn that invokes the skill, clearing when you send your next message
- [ ] Until the skill's body finishes executing

**Why:** The grant is scoped to the invoking turn and clears on your next message, which is the good case. It is worth being precise about because a session-level permission in other tools can be written to disk and apply to every future session in the repository. Same idea, vastly different blast radius.

### Q6. A hook is generally more dangerous than a skill because: <!-- id: agent-08-agent-skills-q06 energy: high -->

- [ ] Hooks are written in a compiled language and cannot be read
- [ ] Hooks are executed by the model rather than by the harness
- [ ] Hooks cannot be removed once installed
- [x] Hooks run on lifecycle events with no per-invocation approval

**Why:** A hook fires on a lifecycle event — every file edited, every tool used — so it carries standing authority with no prompt in front of it. A skill at least has to be matched and loaded, and a badly-described one simply does not fire. The asymmetry is frequency and inevitability, not inspectability.

## You're ready to move on when...

- You have three committed skills, each with a description you can justify word by word, and a recorded triggering test showing what fired and what did not.
- You can name, without looking anything up, which extension point you would use for a convention, a repeatable procedure, automation that must never be skipped, and connecting to an external service — and say why each is not one of the others.
- You have audited every agent extension on your machine and deleted at least one you could not justify.
- You can explain the difference between a one-turn tool grant and a persistent session permission, and why that difference decides whether an incident is an inconvenience.
- You have read your own instruction file as an attack surface and can list what it grants.
- You can state the six portable Agent Skills fields and predict what happens if you package a skill using `context: fork` for another tool.

## Free vs Paid

**Everything in this phase is free.** A skills mechanism, an instruction file, and the documentation are all available at no cost, and a scratch repository is free. The reference implementation documented here has a free tier sufficient for everything in this phase.

**Where money would go, and why it is not needed for this phase.** Paid tiers tend to buy more usage, larger context windows, or model access — useful for the volume and depth work in the Cost track, but not for anything here. **The competence this phase teaches is a competence about writing, not about budget**, and it is fully exercisable on a free tier.

**The one honest caveat.** Harness features move fast, and some behaviours in this phase are version-gated. A paid or newer tier may give you access to a feature this phase could not cover. **If you notice a field or behaviour here that your tool does not have, that is the volatile-facts problem the Cost track addresses** — and the right response is to check your own documentation rather than to assume this phase is wrong.

**And a boundary worth keeping.** Local models are covered properly in the Cost and Model Internals tracks, and running a harness against a local model is a real configuration. But it is not this phase's subject, and reaching for it here would mean debugging inference speed while trying to learn something about descriptions.
