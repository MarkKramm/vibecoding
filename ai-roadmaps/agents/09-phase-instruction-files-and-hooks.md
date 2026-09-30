---
id: agent-09-instruction-files-and-hooks
track: agents
phase: 9
order: 90
title: Instruction Files and Hooks - Request Versus Guarantee
duration: 2 weeks
duration_weeks: 2
energy_mix: [high, normal]
deliverable: portfolio/agents/09-instruction-files-and-hooks.md
exit_criteria: >
  You can say which of your project's rules are requests and which are enforced,
  place a rule in the right layer on the first attempt, and write a hook that
  blocks rather than advises - and you can explain why a rule you moved into a
  hook still fails under a scripted run.
---

# Phase 9 — Instruction Files and Hooks: Request Versus Guarantee

## Goal of this phase

Phase 8 taught you the extension points and how to choose between them. This phase goes deep on the two that carry the most authority, and it is built around a distinction that changes how you write every rule you will ever have for an agent.

**There are two ways to tell an agent not to do something, and they are not the same kind of thing at all.**

One is to write it down. It goes in a markdown file, the model reads it, and the model decides what to do about it. The documentation calls this exactly what it is — Claude *"treats them as context, not enforced configuration"*, delivered *"as a user message after the system prompt, not as part of the system prompt itself."*

The other is to hook it. The harness runs your code at a fixed point in the lifecycle, and your code can refuse.

**The vendor's own sentence is the whole phase, and you should be able to repeat it from memory:**

> "Put guardrails in hooks. An instruction like 'never edit `.env`' in CLAUDE.md or a skill is a request, not a guarantee. A `PreToolUse` hook that blocks the edit is enforcement. If a rule must hold every time, make it a hook rather than a prompt instruction."

Most people's instruction files are a wish list. By the end of this phase yours will be a specification, and you will be able to say which lines in it are enforced and which are requests.

## Estimated time

**2 weeks** at 1–2 hours a day, 5 days a week. Roughly 14–18 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Part 1: request versus guarantee | 2h |
| 2 | Part 2: which file, and what loads | 2h |
| 3 | Part 3: load order, concatenation, and conflicts | 1.5h |
| 4 | Part 4: size, and what actually reduces context | 2h |
| 5 | Part 5: path-scoped rules | 2h |
| 6 | Part 6: hooks, events, and handlers | 2h |
| 7 | Part 7: blocking, and the subtleties that bite | 2h |
| 8 | Part 8: the security layer and the audit | 2h |

If you only have four hours this week, do tasks 2, 10, 12 and 17. Those produce the classified rule inventory, a path-scoped rule, a blocking hook you have proved blocks, and the audit — which is the phase.

Budget extra time on day 3. Load order and concatenation are more surprising than they sound, and getting them wrong produces confusing failures.

## Skills you'll gain

- Distinguish an advisory instruction from an enforced control, and say which layer each belongs in.
- Choose between `CLAUDE.md` and `AGENTS.md` deliberately, including the trap that silently changes the answer.
- Predict what a harness will load, in what order, and how conflicts resolve.
- Explain why `@path` imports do not reduce context, and what does.
- Write a path-scoped rule with a glob, and debug one that applies to everything.
- Name the lifecycle events and say which ones can block.
- Write a hook that blocks an action rather than advising against it.
- Reason about trust, scope, and authority when running an agent non-interactively.
- Audit a project's rules and move the ones that must hold into enforced controls.

## Specific topics to learn

- Advisory context versus enforced configuration, and the mechanism behind each.
- `CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md`, and `AGENTS.md`, and the precedence rule between them.
- The four `Project instructions` values and what each one loads.
- Load order as concatenation, not override, from filesystem root down.
- Settings files, which merge key by key — the opposite model from instruction files.
- The 200-line target, and why exceeding it degrades adherence everywhere.
- `@path` imports, recursion limits, and why they do not save context.
- Path-scoped rules in `.claude/rules/`, glob syntax, and the expansion budget.
- Hook events grouped by cadence: per session, per turn, per tool call.
- The five handler types: `command`, `http`, `mcp_tool`, `prompt`, `agent`.
- Blocking by exit code and by structured JSON, and which events cannot block.
- Why exit 0 on a `PreToolUse` hook does not approve anything.
- Workspace trust, and why a scripted run is a different security posture.

## Tools for This Phase

- **A coding agent harness with instruction files and hooks.** Claude Code is the reference implementation documented here, because its docs name every precedence rule and every event.
- **A repository with a real instruction file** — ideally this one, which is a worked example you can criticise.
- **A scratch repository** so you can test precedence and trust behaviour without touching work in progress.
- **`claude --debug`** for parse errors, and the `InstructionsLoaded` hook event for tracing what actually loaded.
- **Your agent's documentation index.** For Claude Code, `https://code.claude.com/docs/llms.txt`. Fetch the index before guessing a path; the relevant pages are `memory.md`, `claude-directory.md`, `hooks-guide.md`, `hooks.md`, and `settings.md`.

## Free/cheap resources

- **`https://code.claude.com/docs/en/memory.md`** — instruction files, precedence, load order, path-scoped rules, imports, size guidance. The source of most of this phase.
- **`https://code.claude.com/docs/en/hooks.md`** — the hooks reference, including the full event table, handler types, blocking semantics, and the security section.
- **`https://code.claude.com/docs/en/hooks-guide.md`** — the task-oriented guide to writing your first hook.
- **`https://code.claude.com/docs/en/claude-directory.md`** — what lives in `.claude/`, item by item.
- **`https://code.claude.com/docs/en/settings.md`** — settings precedence, which behaves differently from instruction files in a way worth understanding.
- **`https://agentskills.io`** — the portable format, for the cross-tool note in Part 2.

**⚠️ Dated, 2026-09-29, and this phase is unusually version-sensitive.** Instruction-file precedence, the `AGENTS.md` support, and the event list are all recent and partly version-gated — the documentation states that reading `AGENTS.md` directly requires a specific version or later, that some earlier versions read `CLAUDE.md` files only, and that several hook events and options carry version floors. **Read the numbers as a snapshot of one implementation on one day.** The *shape* of the distinction in Part 1 is durable; the specifics will move, and the habit of checking your own documentation is the transferable part.

## Lesson: Request, or Guarantee

### Part 1 — The distinction everything else follows from

**Start with a rule you have written and ask what happens when the agent ignores it.**

If it is in a markdown file, the honest answer is: nothing. The file is context. The model read it, weighed it against everything else in its context, and decided otherwise — perhaps because the task looked urgent, or because a different instruction ranked higher, or because a page of fetched content told it the file was outdated.

That is not a bug and it is not a misconfiguration. It is what the mechanism does. The documentation is careful about the word: instruction content is *"delivered as a user message after the system prompt, not as part of the system prompt itself."* It is a message, and messages are persuasive rather than binding.

**A hook is a different kind of object entirely.** It is not content the model reads and interprets. It is code the *harness* runs, at a point the harness chooses, whether or not the model has any opinion. The handler can return a decision that stops the action.

**So the diagnostic question for every rule you will ever write is: how badly would this hurt if the agent ignored it once?**

| If ignoring it would... | Put it in |
|---|---|
| Be embarrassing, or slow you down | The instruction file. It is a preference. |
| Corrupt data, leak a credential, or cost money | A hook. It must hold every time. |
| Be irreversible | A hook, *and* scope the agent so it cannot do it anyway |

**The third row is the one people skip, and it is the more important half.** A hook that blocks the edit is enforcement; a sandbox that makes the path unwritable in the first place is a boundary. **Both, if you can.** This is the same argument as the credential-lifetime finding from the Safety track: prefer a control where failure is impossible over a control where failure must be detected.

**And note what "guarantee" actually means here, because it is narrower than it sounds.** A hook guarantees *your* code ran and returned your decision. It does not guarantee the harness called it — which is exactly the subject of Part 7, and exactly the thing that makes hooks in a scripted run a security problem rather than a safety net.

### Part 2 — Which file, and what actually loads

There is more than one instruction file, and the rule for choosing between them is mechanical rather than a matter of taste. It is also a trap.

**The decisive table, from the documentation:**

| Your repository has | Claude reads |
|---|---|
| An `AGENTS.md`, and **no** `CLAUDE.md` or `CLAUDE.local.md` in your working directory or above it | Your `AGENTS.md` |
| An `AGENTS.md` **and** a `CLAUDE.md` or `CLAUDE.local.md` in your working directory or above it | Your `CLAUDE.md` files **only** |
| A `CLAUDE.md` that already imports `AGENTS.md` | Your `CLAUDE.md`, with `AGENTS.md` included through the import |

**Read the second row again.** `AGENTS.md` is not merged alongside `CLAUDE.md`. It is **replaced** by it. And which files count toward that check is specific:

- **Count** — a `CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` in your working directory **or any directory above it**.
- **Do not count** — your `~/.claude/CLAUDE.md`, your organisation's managed file, and `.claude/rules/`.

**The trap, stated by the documentation in as many words:**

> "Because `CLAUDE.local.md` counts, adding one to keep your own uncommitted instructions in a project that relies on `AGENTS.md` stops Claude from reading `AGENTS.md` for you."

So: you maintain a project on `AGENTS.md`, you add a local scratch file to keep personal notes out of git, and **your entire project instruction file silently stops being read.** No error, no warning, no symptom other than the agent suddenly not knowing things it knew yesterday. This is the single most valuable thing in Part 2, and it costs nothing to check.

**The escape hatch is a setting, and it has four values**, set via `/config` or in settings under `pluginConfigs`. The four strings, because a setting you cannot name is a setting you cannot look up:

| Value | What Claude reads |
|---|---|
| `claude-md-or-agents-md` | Your `CLAUDE.md` files, or your `AGENTS.md` files when you have no `CLAUDE.md` or `CLAUDE.local.md` in your working directory or above it. **The default.** |
| `claude-md-and-agents-md` | Both together, each directory's `CLAUDE.md` first and its `AGENTS.md` after. An `AGENTS.md` your `CLAUDE.md` already imports or symlinks to is not read twice. |
| `claude-md` | Your `CLAUDE.md` files only — `AGENTS.md` is never read. |
| `managed-only` | Only your organisation's managed `CLAUDE.md` and auto memory at launch. Project, local and user `CLAUDE.md`, `.claude/rules/`, and every `AGENTS.md` are left out. |

**If you maintain an `AGENTS.md` and use `CLAUDE.local.md`, you want `claude-md-and-agents-md`** — that is the configuration that makes the two additive instead of exclusive. The trap worth naming: on the default, having *either* file silently disables the other, and the symptom is "my `AGENTS.md` is being ignored", which reads like a bug in the file rather than a setting.

**The cross-tool note, and it is a genuinely good one.** `AGENTS.md` is the portable *instruction* convention, and `SKILL.md` is the portable *capability* convention, under the open Agent Skills standard. That pairing — `AGENTS.md` for what is true about the project, `SKILL.md` for what the agent can do — is the story you can carry between tools without over-claiming, because the skills format is a published standard while `AGENTS.md` support is a feature of this particular harness. **Verify the second half in your own tool before relying on it.**

### Part 3 — Load order, concatenation, and why conflicts are scary

**Here is the fact that changes how you think about all of it: instruction files are concatenated, not merged or overridden.**

> "All discovered files are concatenated into context rather than overriding each other. Across the directory tree, content is ordered from the filesystem root down to your working directory. For the `foo/bar/` example, `foo/CLAUDE.md` appears in context before `foo/bar/CLAUDE.md`, so instructions closer to where you launched Claude are read last. Within each directory, `CLAUDE.local.md` is appended after `CLAUDE.md`, so your personal notes are the last thing Claude reads at that level."

Two consequences.

**The nearest file wins by position, not by authority.** There is no hierarchy where a subdirectory file is "more specific" and therefore takes precedence. It is simply later in the context, and later tends to land harder. **This is why a repository-root file saying "always use tabs" and a subdirectory file saying "this package uses spaces" resolves the way you would want** — and it works by ordering, not by a rule engine.

**And conflicts are not resolved at all.** The documentation says it twice, in two forms:

> "if two rules contradict each other, Claude may pick one arbitrarily"

> "Claude Code loads user-level rules before project rules, so a project rule appears later in Claude's context than a user rule. Neither set overrides the other: if a user rule and a project rule conflict, Claude may follow either one, so keep the two consistent."

**"May follow either one" is the sentence to remember.** A conflict is not a resolution, it is a coin flip that reruns every session. **The only fix is to keep the two consistent** — which is a documentation problem, and it is your problem, because the harness will not resolve it for you.

**Now compare that with settings files, because the model is the exact opposite and the contrast is the lesson.** Settings **merge key by key**, with a documented precedence stack, highest first: managed settings, then command line arguments, then project local settings, then shared project settings, then user settings. And explicitly: *"Environment variables aren't a level in this stack."*

**Instruction files concatenate. Settings files merge. Instruction files cannot override anything, and a later file does not win — it is just later.** A curriculum that leaves you without this distinction will have you expecting override semantics everywhere, and you will be wrong in a way that is hard to debug.

### Part 4 — Size, and what actually reduces context

**The documented target is under 200 lines per instruction file**, with a stated reason: *"Longer files consume more context and reduce adherence."* You get a warning at startup and from `/status` when you exceed it. There is also a hard limit — a file above 4 MiB is skipped entirely rather than truncated.

**But the reason is the part that matters, and it is not "context is expensive".** Every line in the file is in *every* request, for the whole session, in every task. So a bloated instruction file does not degrade the one task it was written for — **it degrades adherence everywhere, permanently, for free.** The cost is not tokens. The cost is that a rule buried on line 180 of a file about something else is a rule that will eventually be missed.

**And here is the counter-intuitive part that this phase exists to correct. Splitting your instruction file does not reduce context.**

Imports use `@path/to/import` syntax, and they resolve relative to the file containing the import, not the working directory, and can recurse up to four hops. They are genuinely useful for organisation. But the documentation says plainly:

> "Splitting into imports helps organization but doesn't reduce context, since imported files load at launch."

**Imports are a filing system, not a lazy loader.** If the content belongs in context, an import does not move the moment it is needed — it moves nothing.

**So what does reduce context? Path-scoped rules.** Those load only when the agent is working with matching files, which makes them the actual answer to "my instruction file is too big." The documented advice follows exactly this logic: *"If your instructions are growing large, use path-scoped rules so instructions load only when Claude works with matching files."*

**Which inverts the obvious refactor.** The instinct on hitting a large file is to split it into imports, because that is what a large file has always been split into. Here it makes the file easier to read and does nothing for the actual problem. **Split for readers; scope for context.** Those are different jobs and they need different tools.

One more thing not to conflate: there is a separate auto-memory mechanism with its own budget — the first 200 lines, or first 25KB, of a separate memory file load at the start of every conversation, and it is toggled separately. It is a different file with a different lifecycle, and it is not your instruction file.

### Part 5 — Path-scoped rules

**This is the mechanism that actually does what people want imports to do.** A rule file in `.claude/rules/` carries a `paths` glob, and it applies only when the agent is working with matching files.

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules

- All API endpoints must include input validation
```

Note what is being claimed: these *"only apply when Claude is working with files matching the specified patterns"*, and they *"trigger when Claude reads files matching the pattern, not on every tool use."* **That last clause is a real design decision** — the rule attaches to reading the file, not to every action thereafter, which is what makes the mechanism affordable.

**The glob syntax is small, which is a relief:**

| Pattern | Matches |
|---|---|
| `**/*.ts` | All TypeScript files in any directory |
| `src/**/*` | All files under `src/` |
| `*.md` | Markdown files in the project root |
| `src/components/*.tsx` | React components in one directory |

Brace expansion works, so `"src/**/*.{ts,tsx}"` is valid. There is a documented budget: a rule's whole `paths` list shares **1,000 expanded patterns and 4 MiB**, and patterns without braces do not count against it. And one bracket trap worth knowing because it fails silently: a `[` that cannot be read as a bracket expression is invalid and **matches nothing**, so a literal bracket in a path must be escaped.

**One field is read, and any other is ignored without an error.** For a rule file, `paths` is the only frontmatter field the harness reads. You can add others and they will be silently discarded — the same class of quiet failure as malformed skill frontmatter in Phase 8, and worth watching for in both places.

**The failure mode to recognise: malformed YAML makes a scoped rule apply to everything.** If the frontmatter does not parse, the rule loads *as if it had no `paths`*. Your carefully scoped API rule becomes a global one that fires on every file you touch. Run `claude --debug` for the parse error, and use the `InstructionsLoaded` hook event to trace what actually loaded and why — it fires with a load reason, including when a rule matched by path.

**And note the security consequence of the same mechanism.** A rule that is supposed to be narrow can be global, and a global rule applies to everything. That is a failure of *restriction*, which is the safer direction. But the mirror image exists: a project rule file is project configuration that anyone opening the repository can write, and the next phase's trust discussion is exactly about who gets to run yours.

### Part 6 — Hooks, events, and what can be a handler

**A hook is code the harness runs at a named point in the lifecycle.** The documented event list is long — **thirty-three** — and the useful way to hold it is not as a list but as three cadences:

- **Per session:** `SessionStart`, `SessionEnd`.
- **Per turn:** `UserPromptSubmit`, `Stop`, `StopFailure`.
- **On every tool call inside the agentic loop:** `PreToolUse` and `PostToolUse` — and note the documented exception, that `EndConversation` calls skip both.

**Everything else is a refinement of those.** Around the core sit compaction (`PreCompact`, `PostCompact`), model switching (`PreModelSwitch`, `PostModelSwitch`), subagent lifecycle (`SubagentStart`, `SubagentStop`), worktree creation and removal, permission decisions, MCP elicitation, configuration and directory changes, and task tracking. `StopFailure` even filters on the reason the turn ended, from `rate_limit` through to `billing_error` and `server_error`.

**The handful worth learning first, because they cover most real needs:** `PreToolUse` to block an action, `PostToolUse` to react after one succeeds, `UserPromptSubmit` to inspect a prompt before it is processed, `SessionStart` to load state, `PreCompact` to preserve something across compaction, and `Stop` to gate completion.

**Five kinds of handler, and the choice is a real decision rather than a detail:**

| Type | What it does |
|---|---|
| `command` | Runs a shell command. Receives the event's JSON on stdin, returns via exit codes and stdout |
| `http` | Sends the event's JSON as an HTTP POST to a URL |
| `mcp_tool` | Calls a tool on a configured MCP server |
| `prompt` | Sends a single-turn prompt to a model, which returns a decision as JSON |
| `agent` | Spawns a subagent that can use tools to verify a condition before deciding |

**The last two are the interesting ones and the ones to use carefully.** A `prompt` handler is a model judging a condition — useful for a judgement call like "is this commit message honest", and you should assume it is expensive and non-deterministic. An `agent` handler gets real tools, so it can *verify* rather than *judge*, which is strictly better where it applies — but the documentation marks agent hooks as experimental and liable to change.

**And one warning that should stop you using the wrong tool for the job.** The `if` field on a hook holds exactly one permission rule, with no `&&` or `||` syntax — and, verbatim: *"When Claude Code can't determine which commands the Bash input runs, it runs your hook regardless of the pattern. Because the `if` filter is best-effort, use the permission system rather than a hook to enforce a hard allow or deny."*

**A filter that sometimes does not apply is not enforcement.** If you need a hard allow or deny, that is the permission system. A hook is for the things permissions cannot express.

### Part 7 — Blocking, and the subtleties that bite

**Blocking is the entire point, so it is worth understanding properly rather than assuming it works.**

There are two mechanisms. **Exit code 2** blocks the action, with the reason written to stderr. And **structured JSON** carrying a permission decision — on `PreToolUse` the values are `allow`, `deny`, `ask`, and `defer`. The events differ in shape: `PostToolUse` and `Stop` use a top-level `decision: "block"` field, and `PermissionRequest` uses a nested behaviour field.

**Four subtleties, each of which will cost you a day if you meet them unprepared.**

**Not every event can block.** Exit 2 blocks — *"but some events can't be blocked: for `SessionStart` and others, exit 2 shows stderr to the user and execution continues."* So a `SessionStart` hook that tries to refuse the session does not get to. **Check which events are in the blocking set before you design around one.**

**Exit 0 does not mean approved.** This is the one that surprises people, because the intuition is the opposite. Verbatim: for a `PreToolUse` hook, exit 0 means your hook reports no objection — *"but this doesn't approve the tool call: the normal permission flow still applies."* Your hook not objecting is not your hook agreeing.

**The most restrictive answer wins, but siblings still run.** For `PreToolUse`, the order is `deny`, then `defer`, then `ask`, then `allow`. So one hook denying is sufficient to block. However: *"One hook returning `deny` doesn't stop sibling hooks from executing. Don't rely on one hook's `deny` to suppress side effects in another hook."* **Blocking an action does not un-run the other hooks that fired.**

**The `Stop` hook has a circuit breaker.** Claude Code overrides a `Stop` hook after it blocks eight times in a row without progress — a guard against a hook that prevents the agent from ever finishing. There is a documented field and environment variable to manage it. **Design for it: a completion check that keeps failing is worse than no completion check, because it stops the work.**

**A worked example, because the shape matters more than the syntax.** The classic useful hook is a format check on `PostToolUse`, matched to file edits, running your formatter and failing on a non-zero exit so the agent sees the diff it must fix. Note what makes it good: it runs on an *event*, not on a request, so **it cannot be forgotten by a model that got distracted.** That is the entire argument for this layer, and it is the same argument as "make it a hook rather than a prompt instruction."

### Part 8 — The security layer, and the audit

**Read this twice, because it is the reason the rest of the phase matters.**

The documented warning on command hooks is unambiguous:

> "Command hooks execute shell commands with your full user permissions. They can modify, delete, or access any files your user account can access. Review and test all hook commands before adding them to your configuration."

There is no sandbox around a hook. A hook is your shell, running as you, at a moment the harness chose.

**And the trust behaviour differs by how you launched the agent:**

- **Interactive session** — hooks from settings files are held back until you accept the workspace trust dialog for the folder, or a parent whose trust extends to it.
- **`-p` or SDK session** — *"Claude Code never shows the dialog and treats the folder as trusted, so hooks committed in a repository's `.claude/settings.json` run in a folder you've never trusted."*

**So the dialog you may have been treating as a safety net does not exist in a scripted run.** A repository you did not write can carry code that executes as you, and nothing will ask.

**The documented mitigations are specific and worth memorising:** before scripting the agent over a repository you did not write, review its `.claude/` settings files, start with the bare-mode flag, or disable hooks for that run with the `disableAllHooks` setting. The bare-mode advice is the generalisable one — **a tool that can execute configuration from a repository should not be pointed at a repository you have not read, in any mode.**

**Then do the audit, and this is the deliverable. For every rule in your project, in one table, three columns:**

| Rule | Where it lives | Request or guarantee? |
|---|---|---|
| "Use pnpm, not npm" | `CLAUDE.md` | Request. Fine — it is a preference. |
| "Never edit `.env`" | ... | **Move it to a `PreToolUse` hook.** |
| "Never commit secrets" | ... | Request, and the Safety track says enforce it anyway. |

**Then, for every hook you have configured, three more answers: what can it reach, what does it send anywhere, and what happens if it fails.** And a fourth that this project would insist on: **would you recognise a change to it?** An extension you did not write, or could not diff, is not a control you have — it is one you have inherited.

**The standard for the deliverable: a competent engineer who has never seen your project should be able to read it and state, without opening another file, which of your agent's rules are enforced and which are requests.** If they would have to inspect your configuration to find out, the audit is not finished — and neither is the phase.

## Hands-on practice tasks

1. List every rule in your project's instruction files. For each, write one sentence on what would happen if the agent ignored it once. <!-- id: agent-09-instruction-files-and-hooks-t01 band: quick energy: low -->
2. Sort your rules into two columns: things that are preferences, and things that must hold. Do not fix anything yet. <!-- id: agent-09-instruction-files-and-hooks-t02 band: quick energy: low -->
3. Determine empirically which instruction file your agent actually reads, and confirm it is the one you think. <!-- id: agent-09-instruction-files-and-hooks-t03 band: focused energy: normal -->
4. If your project uses `AGENTS.md`, add a `CLAUDE.local.md` and observe whether the project instructions stop loading. Remove it. <!-- id: agent-09-instruction-files-and-hooks-t04 band: focused energy: normal -->
5. Draw the load order for your project: every instruction file from the filesystem root down, and which content lands last. <!-- id: agent-09-instruction-files-and-hooks-t05 band: focused energy: normal -->
6. Find two rules in your setup that contradict each other. Decide which to keep, and delete or rewrite the other. <!-- id: agent-09-instruction-files-and-hooks-t06 band: focused energy: normal -->
7. Count the lines in your largest instruction file. If over 200, list which lines could move to a path-scoped rule. <!-- id: agent-09-instruction-files-and-hooks-t07 band: focused energy: normal -->
8. Split one section of your instruction file into an `@path` import. Measure the context cost before and after, and confirm it did not change. <!-- id: agent-09-instruction-files-and-hooks-t08 band: focused energy: normal -->
9. Move one section into a path-scoped rule instead, and confirm the context cost actually fell. <!-- id: agent-09-instruction-files-and-hooks-t09 band: focused energy: normal -->
10. Write a path-scoped rule for your most common file type. Use an `InstructionsLoaded` hook to trace when it fires. <!-- id: agent-09-instruction-files-and-hooks-t10 band: focused energy: normal -->
11. Break a path-scoped rule's frontmatter deliberately. Confirm it loads as if it had no `paths`, and find the parse error with debug output. <!-- id: agent-09-instruction-files-and-hooks-t11 band: focused energy: normal -->
12. Write a `PreToolUse` hook that blocks edits to a file you must never touch. Prove it blocks by trying to edit that file. <!-- id: agent-09-instruction-files-and-hooks-t12 band: focused energy: normal -->
13. Write a second hook on the same event that returns allow. Confirm the deny still wins, and that the sibling hook still ran. <!-- id: agent-09-instruction-files-and-hooks-t13 band: focused energy: normal -->
14. Enumerate the three lifecycle events you could use for a formatting check, and write the one you would actually install. <!-- id: agent-09-instruction-files-and-hooks-t14 band: focused energy: normal -->
15. Run your agent non-interactively over a repository you did not write. Record which hooks executed before you had agreed to trust it. <!-- id: agent-09-instruction-files-and-hooks-t15 band: focused energy: normal -->
16. Take the must-hold column from task 2 and move every entry to an enforced control, where one is possible. Record which could not be. <!-- id: agent-09-instruction-files-and-hooks-t16 band: deep energy: high -->
17. For each of your hooks, answer: what can it reach, what does it send anywhere, what happens if it fails, and would you notice a change to it. <!-- id: agent-09-instruction-files-and-hooks-t17 band: deep energy: high -->
18. Have a colleague read only your audit and state which rules are enforced. Correct anything they cannot determine without opening your configuration. <!-- id: agent-09-instruction-files-and-hooks-t18 band: deep energy: high -->
19. Keep a weekly log for three weeks: every time the agent contradicted an instruction file, record whether it was a request that should have been a hook. <!-- id: agent-09-instruction-files-and-hooks-t19 band: ongoing energy: normal -->

## Common Pitfalls

1. **Treating an instruction file as a control.** "Never edit `.env`" in markdown is a request. The documentation's own rule: if a rule must hold every time, make it a hook.
2. **Adding `CLAUDE.local.md` to an `AGENTS.md` project and silently losing your instructions.** It counts toward the precedence check, so the project file stops being read.
3. **Expecting override semantics.** Instruction files **concatenate** in load order. A later file is not a winner, and the documentation says contradictory rules mean Claude *"may pick one arbitrarily."*
4. **Splitting a large instruction file into imports and expecting context savings.** Imports load at launch. **Path-scoped rules are what reduce context.**
5. **Putting hooks in every event because they exist.** There are thirty-three. The ones that matter are per-session, per-turn, and per-tool-call.
6. **Using a hook `if` filter as a hard allow or deny.** The documentation says the filter is best-effort and runs the hook when it cannot parse the command. Use the permission system for hard rules.
7. **Reading exit 0 as approval.** On `PreToolUse`, exit 0 means no objection. The normal permission flow still applies.
8. **Relying on one hook's `deny` to suppress another hook's side effects.** Sibling hooks still run.
9. **Writing a `Stop` hook that blocks indefinitely.** There is a circuit breaker after eight consecutive blocks without progress.
10. **Treating a malformed rule's `paths` as harmless.** A parse failure makes a scoped rule apply to **everything**.
11. **Running the agent non-interactively over a repository you did not read.** The workspace trust dialog does not exist in a scripted run, and committed hooks execute as you.
12. **Assuming a hook is sandboxed.** It is your shell, at your permissions, at a moment the harness chose.
13. **Confusing auto-memory with your instruction file.** Separate file, separate budget, separate lifecycle.
14. **Reading this phase's specifics as durable.** Precedence and events are version-sensitive; the request-versus-guarantee distinction is not.

## Deliverable / proof of work

**`portfolio/agents/09-instruction-files-and-hooks.md`**, containing:

1. **The rule inventory** from tasks 1 and 2: every rule in your project, sorted into preferences and must-holds, with a sentence of justification for each classification.
2. **A precedence record**: which instruction file your agent reads, the full load order for your project, and the output of the `CLAUDE.local.md` experiment if your project uses `AGENTS.md`.
3. **Two before-and-after context measurements** — one showing that splitting a file into imports did not reduce context, one showing that a path-scoped rule did.
4. **A path-scoped rule** committed to your repository, plus the `InstructionsLoaded` trace showing when it fires.
5. **Two hooks**: one that blocks an action you must never allow, one that runs a check on a lifecycle event. For each, the trigger, the enforcement mechanism, and a note on what happens if it fails.
6. **The audit table** from Part 8: every rule marked request or guarantee, and the four questions answered for every hook.
7. **A dated note** recording that precedence rules, the event list, and version floors come from documentation read on 2026-09-29, and naming which behaviours are version-gated.

The standard: **a colleague should be able to read the audit alone and state which of your agent's rules would survive the agent deciding to ignore them.** If they cannot, you have described your intentions rather than your configuration.

## Checklist

- [ ] I can explain the difference between an advisory instruction and an enforced control, and quote the rule for choosing <!-- id: agent-09-instruction-files-and-hooks-c01 energy: low -->
- [ ] I know which instruction file my project actually uses, and I can explain why <!-- id: agent-09-instruction-files-and-hooks-c02 energy: normal -->
- [ ] I can state what `CLAUDE.local.md` does to an `AGENTS.md` project <!-- id: agent-09-instruction-files-and-hooks-c03 energy: normal -->
- [ ] I can describe load order and say why a later file is not a winner <!-- id: agent-09-instruction-files-and-hooks-c04 energy: high -->
- [ ] I know that instruction files concatenate and settings files merge, and why the difference matters <!-- id: agent-09-instruction-files-and-hooks-c05 energy: high -->
- [ ] I can explain why `@path` imports do not reduce context and path-scoped rules do <!-- id: agent-09-instruction-files-and-hooks-c06 energy: high -->
- [ ] I can write a path-scoped rule and debug one whose frontmatter failed to parse <!-- id: agent-09-instruction-files-and-hooks-c07 energy: normal -->
- [ ] I can name the three hook cadences and say which events can block <!-- id: agent-09-instruction-files-and-hooks-c08 energy: normal -->
- [ ] I can write a hook that blocks rather than advises, and prove it blocks <!-- id: agent-09-instruction-files-and-hooks-c09 energy: high -->
- [ ] I know that exit 0 on a `PreToolUse` hook does not approve the call <!-- id: agent-09-instruction-files-and-hooks-c10 energy: high -->
- [ ] I know why a hook's `if` filter is not a substitute for a permission rule <!-- id: agent-09-instruction-files-and-hooks-c11 energy: high -->
- [ ] I can explain why a scripted run is a different trust posture from an interactive one <!-- id: agent-09-instruction-files-and-hooks-c12 energy: high -->
- [ ] I have a rule inventory with every rule marked request or guarantee <!-- id: agent-09-instruction-files-and-hooks-c13 energy: high -->
- [ ] I know what a hook can reach, and that it runs at my full user permissions <!-- id: agent-09-instruction-files-and-hooks-c14 energy: high -->

## Quiz

### Q1. According to the vendor documentation, an instruction like "never edit `.env`" placed in an instruction file is: <!-- id: agent-09-instruction-files-and-hooks-q01 energy: low -->

- [ ] Enforced by the harness before the tool runs
- [ ] Ignored unless the file is under 200 lines
- [ ] Converted into a permission rule automatically
- [x] A request rather than a guarantee, and should be moved to a hook if it must always hold

**Why:** This is the phase's central distinction, stated by the vendor: instruction content is delivered as a user message and is not enforced configuration. A rule that must hold every time needs a `PreToolUse` hook, which the harness runs independently of what the model decides.

### Q2. You maintain a project on `AGENTS.md` and add a `CLAUDE.local.md`. What happens? <!-- id: agent-09-instruction-files-and-hooks-q02 energy: high -->

- [ ] Both files load, `CLAUDE.local.md` first
- [x] `AGENTS.md` stops being read, because `CLAUDE.local.md` counts toward the precedence check
- [ ] `AGENTS.md` is merged in, with project rules overriding local ones
- [ ] Nothing changes until you restart the session

**Why:** `AGENTS.md` is read only when there is no `CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` in the working directory or above it. Adding the local file silently switches the project off `AGENTS.md`, with no error — which is why it is worth testing deliberately rather than discovering.

### Q3. Instruction files and settings files differ in how multiple sources combine. Which statement is correct? <!-- id: agent-09-instruction-files-and-hooks-q03 energy: high -->

- [ ] Both override, with the more specific file winning
- [ ] Both concatenate, with later files taking precedence
- [x] Instruction files concatenate into context; settings files merge key by key with a precedence stack
- [ ] Instruction files merge key by key; settings files concatenate

**Why:** The documentation is explicit that discovered instruction files are "concatenated into context rather than overriding each other," and separately that the settings model is a merge across a documented precedence order. The practical consequence is that a contradictory instruction pair is not resolved at all — Claude "may pick one arbitrarily."

### Q4. Which change actually reduces how much context an instruction consumes? <!-- id: agent-09-instruction-files-and-hooks-q04 energy: high -->

- [x] Converting sections into path-scoped rules with `paths` globs
- [ ] Splitting the file into several `@path` imports
- [ ] Compressing the prose and removing examples
- [ ] Moving content into a skill

**Why:** Imports are organisation, not lazy loading: "imported files load and enter the context window at launch." Path-scoped rules are the documented answer — they apply only when the agent is working with matching files, which is why the size guidance points at them specifically. A skill is closer, but its trigger is a description match rather than a path, so it is less precise for this purpose.

### Q5. A `PreToolUse` hook exits with code 0 and prints nothing. What does that mean? <!-- id: agent-09-instruction-files-and-hooks-q05 energy: high -->

- [ ] The tool call is approved automatically
- [x] The hook reports no objection; the normal permission flow still applies
- [ ] The tool call is blocked because the hook produced no decision
- [ ] The hook is retried with a stricter rule

**Why:** The intuition runs the other way, which is exactly why it is worth knowing. Exit 2 blocks; exit 0 is the absence of objection, and the documentation states plainly that for a `PreToolUse` hook this "doesn't approve the tool call." Your hook declining to object is not the same as the hook agreeing.

### Q6. Why is running an agent non-interactively over an unfamiliar repository a distinct security risk? <!-- id: agent-09-instruction-files-and-hooks-q06 energy: high -->

- [ ] Command hooks cannot run without a terminal
- [ ] Non-interactive runs use a weaker model by default
- [ ] Settings files are ignored in non-interactive mode
- [x] The workspace trust dialog is skipped and the folder is treated as trusted, so committed hooks execute

**Why:** In an interactive session, hooks from settings files are held back until you accept the workspace trust dialog. Under `-p` or in an SDK session that dialog is never shown and the folder is treated as trusted, so hooks committed in a repository's `.claude/settings.json` run in a folder you have never trusted — at your full user permissions.

## You're ready to move on when...

- You have a rule inventory in which every rule is marked as a request or a guarantee, and the must-holds have been moved to enforced controls where that is possible.
- You can explain, without checking, why `AGENTS.md` stops loading when you add a `CLAUDE.local.md`.
- You can say what order your project's instruction files load in, and name two rules in your setup that contradict each other and what you did about it.
- You have measured that splitting a file into imports did not reduce context, and that a path-scoped rule did.
- You have a `PreToolUse` hook that blocks an action, and you have proven it blocks rather than advises.
- You can explain the three hook cadences, and say which events can block and which cannot.
- You can state what each of your hooks can reach, and you would notice a change to it.
- You can explain why a scripted run is a different trust posture, and what you would do before pointing one at a repository you did not write.

## Free vs Paid

**Everything in this phase is free.** Instruction files, rules, hooks, and the documentation cost nothing, and the work is entirely about judgment rather than budget.

**Where money would go, and why it is not needed here.** Paid tiers buy usage, context, and model access — the Cost track's territory. The competence here is knowing the difference between a request and a control, which is entirely free to practise.

**Two honest caveats.** First, **hooks cost you tokens and time even on a free tier**, because a hook that shells out runs on every matching event; a formatting check on every file edit is a real recurring cost, and that is a Cost-track calculation rather than a reason to skip the phase. Second, the more advanced handler types — `prompt` and `agent` — invoke a model at the hook, which is the expensive case and the one to reach for last.

**And a boundary worth keeping.** Building a harness that runs unattended for hours is the subject of the scale material researched for this track and belongs in the Cost track's coverage of local models and provider strategy. This phase is about making the rules you already have true, which is a smaller and more immediately useful job.
