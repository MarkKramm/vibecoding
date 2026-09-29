# Research: Harness Scale — Claude Code at Repository and Task Scale

Date read: 2026-09-29. All pages fetched from `code.claude.com` on that date unless stated.

## Method and honesty note

Discovery started at `https://code.claude.com/docs/llms.txt` (the documentation index), then followed links from it. Nineteen fetches total. Nineteen pages were read and each returned real body content, not navigation-only shell. Two claims this material was asked to confirm were **not** found in the fetched text and are marked `could not verify` in section 6 rather than asserted:

1. The docs never say in so many words that "grep fails on typed languages". The nearest verified statements are about *cost*, not *correctness* — see section 2.4.
2. The docs do not contain a decision rule stated as a single sentence. Section 1 is my derivation from three documented decision questions, and it is labelled as such.

---

## 1. Summary: the one decision rule

**Derived, not quoted.** The `agents.md` page gives three documented decision questions. Reading them in order produces one rule:

> **Count how much of the plan must survive the conversation. If the answer survives in a summary, delegate inside one session (subagent). If the workers must negotiate with each other, let Claude supervise them (agent team). If the plan itself must outlive one context window and you want it auditable and rerunnable, put it in a script (dynamic workflow). If the tasks are independent and the results land in separate branches, give each one its own checkout and stop coordinating (worktrees, agent view, or a project).**

The three questions as written in the docs:

> "The right approach depends on who coordinates the work, whether the workers need to communicate, and whether they edit the same files"

- "Who coordinates the work?" — Claude delegates and collects results inside one conversation: subagents. You hand off independent tasks and check back later: agent view. Claude plans, assigns, and supervises a group of workers: agent teams. "A script holds the plan instead of Claude's turn-by-turn judgment": dynamic workflows.
- "Do the workers need to talk to each other?" — Subagents report results back to the conversation that spawned them, and agent view sessions report results only to you. "Teammates in an agent team message each other directly and, when they have the Task tools, share a task list."
- "Do the tasks touch the same files?" — "Isolate the work with worktrees... Agent teams don't isolate teammates in worktrees, so partition the work so each teammate owns a different set of files."

One-line gloss for teaching: **subagent moves work out of context; worktree moves work out of the filesystem; workflow moves the plan out of the model; a team moves coordination into the model.**

---

## 2. Code intelligence and large codebases

### 2.1 Sources

**Source URL**: `https://code.claude.com/docs/en/large-codebases.md`
**Page title as read**: "Set up Claude Code in a monorepo or large codebase"
**Verification status**: verified from primary source
**Date read**: 2026-09-29

**Verbatim, on why defaults break at scale**:

> "Claude Code works at any size, but as the codebase grows, the defaults tuned for smaller projects can fill the context window with instructions and file reads unrelated to the task, costing tokens and degrading Claude's performance."

**Verbatim, on choosing a starting directory**:

> "In a large codebase, a single CLAUDE.md at the repository root tends to either grow to cover every subsystem's conventions, costing context on instructions unrelated to the current task, or stay too generic to be useful."

**Verbatim, on the two-level CLAUDE.md split** (paraphrase of structure, verbatim of rule):

> "Claude Code loads every CLAUDE.md file from your working directory and every parent directory at launch, then loads each subdirectory's file on demand when it reads files there."

**Verbatim, the specific claim about context**:

> "When you start Claude from `packages/api/`, it loads both `packages/api/CLAUDE.md` and the root `CLAUDE.md`. Claude sees the local instructions alongside the repository-wide rules, with no instructions from `packages/web/` in context."

**What it does**: a configuration guide for scoping the agent to part of a tree. Settings covered: `claudeMdExcludes`, `Read` deny rules in `permissions.deny`, code intelligence plugins, `worktree.sparsePaths`, `worktree.symlinkDirectories`, `--add-dir` / `additionalDirectories`, per-directory skills under `.claude/skills/`, and a `SessionStart` hook that recommends the right plugin at session start.

**When to use it**: monorepos with several packages, or a large single-tree codebase. The page says the same patterns apply either way.

**Limits and failure modes stated in the page**:
- "Managed policy CLAUDE.md files cannot be excluded, so organization-wide instructions always apply."
- `claudeMdExcludes` is "static, not a per-task switch."
- Project settings in `.claude/settings.json` "aren't inherited from parent directories the way CLAUDE.md files are."
- Skills: "with skills spread across many directories, the list Claude chooses from can grow large... some skills lose their descriptions entirely, which can strip the keywords Claude uses to decide whether a skill applies."
- Sparse checkout requires git's `extensions.worktreeConfig`, and go-git-based tools such as `tea` can fail to open the repository if the entry lingers.

**No file-count thresholds are given anywhere on this page.** The page speaks of "millions of lines" and "many packages" but sets no numeric limit. `could not verify` for any specific file-count ceiling.

### 2.2 Sources: code intelligence plugin

**Source URL**: `https://code.claude.com/docs/en/plugins/code-intelligence.md`
**Page title as read**: "Code intelligence plugins"
**Verification status**: verified from primary source
**Date read**: 2026-09-29

**Verbatim, what it is and why it beats text search**:

> "A code intelligence plugin gives Claude the live diagnostics and go-to-definition that your editor has, so Claude catches type errors and missing imports that its own edits introduce before you run your build, and finds definitions and references by symbol instead of by text search."

**Verbatim, the plugin's actual content**:

> "A code intelligence plugin tells Claude Code which command starts the language server and which file extensions it handles. It doesn't include the language server. You install the language server binary first, then the plugin, then confirm the server starts."

Official plugin and binary table, read verbatim from the page (Anthropic maintains all of these except Liquid, which Shopify maintains):

| Language | Plugin | Binary |
| :- | :- | :- |
| C/C++ | `clangd-lsp` | `clangd` |
| C# | `csharp-lsp` | `csharp-ls` |
| Go | `gopls-lsp` | `gopls` |
| Java | `jdtls-lsp` | `jdtls` |
| Kotlin | `kotlin-lsp` | `kotlin-lsp` |
| Liquid | `liquid-lsp` | `shopify`, from the Shopify CLI |
| Lua | `lua-lsp` | `lua-language-server` |
| PHP | `php-lsp` | `intelephense` |
| Python | `pyright-lsp` | `pyright-langserver` |
| Ruby | `ruby-lsp` | `ruby-lsp` |
| Rust | `rust-analyzer-lsp` | `rust-analyzer` |
| Swift | `swift-lsp` | `sourcekit-lsp` |
| TypeScript and JavaScript | `typescript-lsp` | `typescript-language-server` |

Install command, verbatim: `/plugin install typescript-lsp@claude-plugins-official`

Confirmation signal, verbatim: `Found N new diagnostic issues in M files (ctrl+o to expand)` — "A diagnostics line appears... means the server started." Failure signal: `/plugin`, Errors tab, `Executable not found in $PATH: "<binary>"`.

**Two documented hard limits**:
- "Code intelligence plugins work in terminal sessions. In cloud sessions, Claude Code doesn't start plugin language servers, so Claude gets no diagnostics or code navigation there."
- The LSP tool is "read-only" and "Claude Code keeps the tool inactive until you install a code intelligence plugin for your language."
- Subagents running in the background lose most built-in tools. `LSP` is explicitly retained in the background allowlist: "a background subagent keeps every MCP tool but only these built-in tools: `Read`, `Grep`, `Glob`, `LSP`, `Bash`, `PowerShell`, `Edit`, `Write`, `NotebookEdit`, `WebFetch`, `WebSearch`, `TodoWrite`, `Skill`, `ToolSearch`, `EnterWorktree`, `ExitWorktree`, `Monitor`, `TaskStop`, `SendMessage`, and `Artifact`". Before v2.1.280 background subagents could not use `LSP`.

### 2.3 Sources: LSP tool surface

**Source URL**: `https://code.claude.com/docs/en/tools-reference.md`
**Page title as read**: "Tools reference"
**Verification status**: verified from primary source
**Date read**: 2026-09-29

**Verbatim, the seven navigations the `LSP` tool supports**:

> "* Jump to a symbol's definition
> * Find all references to a symbol
> * Get type information at a position
> * List symbols in a file
> * Search for a symbol by name across the workspace
> * Find implementations of an interface
> * Trace call hierarchies"

**Verbatim, why it matters** (same page, LSP section opening):

> "The LSP tool gives Claude code intelligence from a running language server. After each file edit, it automatically reports type errors and warnings so Claude can fix issues without a separate build step."

Also verified on this page, and load-bearing for the "when grep is the wrong tool" framing:

- `Grep` "is built on ripgrep and uses ripgrep's regex syntax, not POSIX grep." Default output mode is `files_with_matches`: "file paths only, no line content. This is the default."
- `Glob` "Results are sorted by modification time and capped at 100 files. If the cap is hit, Claude sees a truncation flag in the result."
- On macOS, Linux and WSL, `Glob` and `Grep` are "Absent by default" — Claude searches with `find` and `grep` through Bash instead.

**Cross-check, non-Anthropic source.** `https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/`, page title "Language Server Protocol Specification - 3.17", **verified from primary source**, read 2026-09-29. The spec defines `textDocument/definition`, `textDocument/references`, `textDocument/implementation`, `workspace/symbol`, and `textDocument/publishDiagnostics`, and states that capabilities "are exchanged between the client and server during the initialize request." The correspondence between Claude Code's documented seven LSP operations and these spec methods is direct, confirming the general concept independently of Anthropic.

### 2.4 What the docs actually say about when grep is the wrong tool

This is the weakest-sourced part of the brief. What is **verified**:

From `costs.md` ("Install code intelligence plugins for typed languages"), verbatim:

> "Code intelligence plugins give Claude precise symbol navigation instead of text-based search, reducing unnecessary file reads when exploring unfamiliar code. A single 'go to definition' call replaces what might otherwise be a grep followed by reading multiple candidate files. Installed language servers also report type errors automatically after edits, so Claude catches mistakes without running a compiler."

From `best-practices.md`, verbatim:

> "If you work in a typed language, install a code intelligence plugin to give Claude precise symbol navigation and automatic error detection after edits."

**What is `could not verify`**: any claim that grep *fails*, as opposed to *costs*, on typed languages. The docs do not argue that text search produces wrong answers for a symbol reached through an alias, a re-export, a generic instantiation, or an interface. They argue only about file reads and token spend. A curriculum that teaches "grep gets the wrong answer on typed code" would be teaching something this documentation does not support. Teach it as an efficiency argument unless you source the correctness claim elsewhere.

---

## 3. Parallel and long-running agents

### 3.1 The comparison table, as published

**Source URL**: `https://code.claude.com/docs/en/agents.md`
**Page title as read**: "Run agents in parallel"
**Verification status**: verified from primary source
**Date read**: 2026-09-29

Verbatim from the page:

> "Claude Code has five ways to work on several tasks at once: subagents, agent view, agent teams, dynamic workflows, and projects."

| Approach | What it gives you | Use it when |
| :- | :- | :- |
| Subagents | Delegated workers inside one session that do a side task in their own context and return a summary | A side task would flood your main conversation with search results, logs, or file contents you won't reference again |
| Agent view | One screen to dispatch and monitor sessions running in the background, opened with `claude agents`. Research preview | You have several independent tasks and want to hand them off, check status at a glance, and step in only when one needs you |
| Agent teams | Multiple coordinated sessions with a shared task list and inter-agent messaging, managed by a lead. Experimental and disabled by default | You want Claude to split a project into pieces, assign them, and keep the workers in sync |
| Projects | One ongoing conversation at claude.ai/code or in the desktop app. Claude starts parallel sessions called threads, in the cloud or, when you ask, on your computer through Remote Control, gives each one the project's instructions, and shows you which ones need you. Public beta on Pro and Max | The work spans many tasks over days or weeks, should keep running when your machine is off, and you'd rather describe it once than dispatch and track each session |
| Dynamic workflows | A script that runs many subagents and cross-checks their results, for work too big to coordinate one turn at a time or that needs more than a single pass | A job outgrows a handful of subagents, or you want findings verified against each other: a codebase-wide audit, a 500-file migration, cross-checked research, or a plan drafted from several angles |

And the crucial sentence on what is *not* a separate mechanism:

> "In every approach the workers are Claude sessions. To involve a different tool, expose it to Claude as an MCP server."

**Verbatim, what the page says is support rather than a separate way to run agents**:

> "Three more tools support this work without being a way to run agents themselves:
> * Worktrees give each session a separate git checkout, so parallel sessions never edit the same files. Use them for sessions you run yourself...
> * Cross-session messaging lets Claude list and message your other Claude Code sessions on this machine, on another machine, or in the cloud, so sessions you run yourself can pass findings and status between themselves.
> * `/batch` is a skill that has Claude split one large change into 5 to 30 worktree-isolated subagents. It's a packaged use of subagents and worktrees, not a separate coordination style."

**How to check on running work, verbatim**:

> "* For background sessions, `claude agents` opens agent view...
> * For subagents in the current session, named background subagents appear in the @-mention typeahead with their status. As of v2.1.198, `/agents` no longer opens a panel; it prints a notice pointing to the subagent file locations... Despite the similar name, `/agents` is separate from `claude agents`.
> * For anything running in the background of the current session, `/tasks` lists each item and lets you check on, attach to, or stop it. The list also includes subagents that have finished.
> * For dynamic workflows, `/workflows` lists running and completed runs, the phase each is in, and how many agents have finished."

### 3.2 Subagents

**Source URL**: `https://code.claude.com/docs/en/sub-agents.md`
**Page title as read**: "Create custom subagents"
**Verification status**: verified from primary source
**Date read**: 2026-09-29

**Verbatim, the definition**:

> "Subagents are specialized AI assistants that handle specific types of tasks. Use one when a side task would flood your main conversation with search results, logs, or file contents you won't reference again: the subagent does that work in its own context and returns only the summary."

**Verbatim, the cost consequence** — note this is often omitted and it matters:

> "Each subagent runs in its own context window with a custom system prompt, specific tool access, and independent permissions. It also sends its own requests, which count toward the same usage limits as your main conversation."

**Built-in subagents, as read**: Explore (read-only, capped at Opus on the Claude API; "As of v2.1.198, Explore inherits the main conversation's model instead of always running on Haiku"), Plan (read-only, used in plan mode), general-purpose (every tool), plus `claude`, `statusline-setup`, and `claude-code-guide`.

**Verified constraint**: "When the combined descriptions of your subagents, except the built-in ones, exceed 15,000 tokens, Claude Code shows a warning at startup with the total token count."

**Verified frontmatter fields** (read from the table, not inferred): `name`, `description`, `tools`, `disallowedTools`, `model`, `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`, `background`, `omitClaudeMd`, `effort`, `isolation`, `color`, `initialPrompt`, `experimental`. Only `name` and `description` are required.

**Verified model resolution order**: "1. The per-invocation `model` parameter 2. The subagent definition's `model` frontmatter, where `inherit` selects the main conversation's model 3. The `CLAUDE_CODE_SUBAGENT_MODEL` environment variable... 4. The main conversation's model".

### 3.3 Agent teams

**Source URL**: `https://code.claude.com/docs/en/agent-teams.md`
**Page title as read**: "Orchestrate teams of Claude Code sessions"
**Verification status**: verified from primary source
**Date read**: 2026-09-29

**Verbatim, the warning at the top of the page**:

> "Agent teams are experimental and disabled by default. Enable them by setting `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in your settings.json or environment. Without that variable, no team is set up at session start, no team directories are written, and Claude does not spawn or propose teammates."

**Verbatim, the pre-check the docs insist on**:

> "Before you set up a team, check whether a lighter option does the job. Subagents work within a single session, and with cross-session messaging Claude can pass findings between the sessions you run yourself."

**The published subagents-vs-teams table, verbatim**:

| | Subagents | Agent teams |
| :- | :- | :- |
| **Context** | Own context window; results return to the caller | Own context window; fully independent |
| **Communication** | Return a result to the caller. Subagents that Claude named when it spawned them can also message each other | Teammates message each other directly |
| **Coordination** | Main agent manages all work | Self-coordination through messages, plus a shared task list for agents that have the Task tools |
| **Best for** | Focused tasks where only the result matters | Complex work requiring discussion and collaboration |
| **Token cost** | Lower: results summarized back to main context | Higher: each teammate is a separate Claude instance |

**Architecture, verbatim**: team lead, teammates, a task list ("Tasks have three states: pending, in progress, and completed"), and a mailbox ("Each agent's mailbox is a JSON file at `~/.claude/teams/{team-name}/inboxes/{agent-name}.json`").

**Verified cost figure**, from `costs.md`: "Agent teams use approximately 7x more tokens than standard sessions when teammates run in plan mode, because each teammate maintains its own context window and runs as a separate Claude instance."

**Verified guidance on team size, verbatim**: "Start with 3-5 teammates for most workflows... If you have 15 independent tasks, 3 teammates is a good starting point." And: "Three focused teammates often outperform five scattered ones."

**The limitations section, verbatim and complete** — every one of these is teachable:
- "No session resumption with in-process teammates: `/resume` and `/rewind` do not restore in-process teammates."
- "Task status can lag: teammates sometimes fail to mark tasks as completed, which blocks dependent tasks."
- "Shutdown can be slow."
- "One team per session."
- "No nested teams: teammates cannot spawn their own teammates."
- "No background subagents from in-process teammates: an in-process teammate's own subagents run in the foreground, because a teammate's background work can't outlive the lead's process."
- "Lead is fixed: the main session is the lead for its lifetime."
- "Permissions set at spawn."
- "Split panes require tmux or iTerm2... Split-pane mode isn't supported in VS Code's integrated terminal, Windows Terminal, or Ghostty."

### 3.4 Dynamic workflows

**Source URL**: `https://code.claude.com/docs/en/workflows.md`
**Page title as read**: "Orchestrate subagents at scale with dynamic workflows"
**Verification status**: verified from primary source
**Date read**: 2026-09-29

**Verbatim, what it is** — this is the sentence the brief asked for:

> "A dynamic workflow is a JavaScript script that orchestrates many subagents at once. Claude writes the script for the task you describe, and a runtime executes it in the background while your session stays responsive."

**Verbatim, the core argument**:

> "A workflow moves the plan into code. With subagents, skills, and agent teams, Claude is the orchestrator: it decides turn by turn what to spawn or assign next, and every result goes into a context window. A workflow script holds the loop, the branching, and the intermediate results itself, so Claude's context holds only the final answer."

**The five-axis comparison table, verbatim**:

| | Subagents | Skills | Agent teams | Workflows |
| :- | :- | :- | :- | :- |
| What it is | A worker Claude spawns | Instructions Claude follows | A lead agent supervising peer sessions | A script the runtime executes |
| Who decides what runs next | Claude, turn by turn | Claude, following the prompt | The lead agent, turn by turn | The script |
| Where intermediate results live | Claude's context window | Claude's context window | A shared task list | Script variables |
| What's repeatable | The worker definition | The instructions | The team definition | The orchestration itself |
| Scale | A few delegated tasks per turn | Same as subagents | A handful of long-running peers | Dozens to hundreds of agents per run |
| Interruption | Restarts the turn | Restarts the turn | Teammates keep running | Resumable in the same session |

**The runtime's documented limits — the numbers a curriculum can teach, all verbatim from the "Behavior and limits" table**:

| Constraint | Why |
| :- | :- |
| No mid-run user input | A run pauses on its own only for agent permission prompts and a usage-limit wait. For sign-off between stages, run each stage as its own workflow |
| No direct filesystem or shell access from the workflow itself | Agents read, write, and run commands. The script coordinates the agents |
| No module loading: a script that contains `import()` fails before the run starts | The script body is plain JavaScript |
| Up to 16 concurrent agents by default, fewer when Claude Code has fewer CPUs available | Bounds local resource use |
| In a fan-out, agents that share the first agent's prompt-cache prefix start up to 5 seconds after it by default | Read the prefix the first agent cached |
| Up to 4,096 items in a single `parallel()` or `pipeline()` call: the runtime rejects a longer list with an error | A silent cap would drop part of the workload |
| 1,000 agents total per run | Prevents runaway loops |

`CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS` raises the concurrency cap from 1 to 256 and requires v2.1.269 or later.

**Cost, verbatim**: "Claude Code also flags a run that grows unusually large. When a workflow schedules more than 25 agents, or its projected token total passes 1.5 million, its progress line... shows a `Large workflow` warning." And: "The warning is advisory: it doesn't pause or limit the run."

**Size guideline, verbatim** — an agent-count target, not a cap: `unrestricted` (no guideline), `small` ("Fewer than 5 agents"), `medium` ("Fewer than 10 agents"), `large` ("Fewer than 50 agents"). "Claude Code sends the guideline to Claude as advice, not a cap, so a prompt that calls for a different scale still overrides it."

**The script shape, verbatim from the page** — this is what "a script Claude writes" concretely is:

```javascript
export const meta = {
  name: 'audit-routes',
  description: 'Audit every route handler for missing auth checks',
}

const found = await agent('List every .ts file under src/routes/.', {
  schema: { type: 'object', required: ['files'], properties: { files: { type: 'array', items: { type: 'string' } } } }
})

const audits = await pipeline(found.files, file =>
  agent(`Audit ${file} for missing authentication checks.`, { label: file }),
)

return audits.filter(Boolean)
```

Verbatim: "`agent()` spawns one subagent, `pipeline()` runs one per item in a list, and `parallel()` runs a set of agent tasks at the same time and waits for all of them." And: "An `agent()` call resolves to `null` if you stop it mid-run or it hits an unrecoverable API error."

**Determinism requirement, verbatim**: "Claude Code makes `Date.now()`, `Math.random()`, and a no-argument `new Date()` throw inside the script, so that a relaunched run repeats the same `agent()` calls."

**How you start one, verbatim**: include the keyword `ultracode` in a prompt, or run `/effort ultracode`. "Claude Code highlights the keyword in your input and Claude writes a workflow script for the task instead of working through it turn by turn." The keyword "only chooses how Claude structures the work: the agents' tool calls receive the same permission checks and sandboxing as any other tool call."

**Bundled workflow**: `/deep-research <question>`, which "fans out web searches on a question across several angles, fetches and cross-checks the sources it finds, votes on each claim, and returns a cited report with claims that didn't survive cross-checking filtered out. Requires the WebSearch tool to be available."

**Availability, verbatim**: "Dynamic workflows are available on all paid plans, with Anthropic API access, and on Amazon Bedrock, Google Cloud's Agent Platform, and Microsoft Foundry. On Pro, turn them on from the Dynamic workflows row in `/config`."

**Failure mode worth teaching, verbatim**: "That last case means a failure in the middle of a fan-out reruns work that already finished. If a script starts A, B, C, and D in that order and B fails, relaunching returns A from cache and runs B, C, and D again."

### 3.5 Worktrees

**Source URL**: `https://code.claude.com/docs/en/worktrees.md`
**Page title as read**: "Run parallel sessions with worktrees"
**Verification status**: verified from primary source
**Date read**: 2026-09-29

**Verbatim, the collision problem it solves**:

> "A git worktree is a separate working directory with its own files and branch, sharing the same repository history and remote as your main checkout. Running each Claude Code session in its own worktree means edits in one session never touch files in another, so one session can build a feature while a second fixes a bug."

**Verified mechanics**: `claude --worktree feature-auth` or `-w`. "By default, the worktree is created under `.claude/worktrees/<name>/` at your repository root, on a new branch named `worktree-<name>`." Omitting the name generates one "such as `bright-running-fox`". `--worktree "#1234"` branches from a PR/MR.

**Verified isolation enforcement — four checks, verbatim, and the fourth cannot be disabled**:

> "Claude Code blocks an `Edit`, `Write`, or `NotebookEdit` that targets a path in the main checkout." / "blocks a Bash, PowerShell, or Monitor command whose working directory resolves to the main checkout" / "blocks a Bash or Monitor command that redirects git into the main checkout" / "blocks a Bash or Monitor command when it can't verify from the command text that any git the command runs stays inside the worktree... You can't turn this check off."

**Verified subagent isolation**: `isolation: worktree` in subagent frontmatter, or ask Claude to "use worktrees for your agents". "Each subagent gets a temporary worktree that Claude Code removes automatically when the subagent finishes without changes."

**Cross-check, non-Anthropic**. `https://git-scm.com/docs/git-worktree`, page title "git-worktree - Manage multiple working trees", **verified from primary source**, read 2026-09-29 (page footer: "last updated in 2.56.0"). Confirms the underlying mechanism independently: "A git repository can support multiple working trees, allowing you to check out more than one branch at a time." Also confirms the mechanism's own stated caveat, which Claude Code does not repeat: "Multiple checkout in general is still experimental, and the support for submodules is incomplete. It is NOT recommended to make multiple checkouts of a superproject."

### 3.6 Agent view, and the "set it running and walk away" pattern

**Source URL**: `https://code.claude.com/docs/en/agent-view.md`
**Page title as read**: "Manage multiple agents with agent view"
**Verification status**: verified from primary source
**Date read**: 2026-09-29

**Status, verbatim**: "Agent view is in research preview. The interface and keyboard shortcuts may change as the feature evolves."

**The walk-away mechanism, verbatim** — this is the sentence that matters:

> "Background sessions don't need any terminal open to keep working. A separate supervisor process runs them, so you can close agent view, close your shell, or start a new interactive session and your dispatched work keeps going."

And: "Session state persists on disk through auto-updates and supervisor restarts. Sessions are also preserved when your machine sleeps. Their processes resume on wake."

**How you dispatch, verbatim**: `claude agents` to open the view; `claude --bg "<prompt>"` to background straight from the shell; `claude --bg --exec 'pytest -x'` to run a shell command as a background job instead of a session. `/bg` or `/background` from inside a session moves it to the background.

**Automatic worktree move, verbatim**:

> "Every background session, whether started from agent view, `/bg`, or `claude --bg`, starts in your working directory. Before editing files, Claude moves the session into an isolated git worktree under `.claude/worktrees/`, so parallel sessions can read the same checkout but each writes to its own."

Opt out with `worktree.bgIsolation: "none"`. Verified skip conditions: already inside a linked git worktree; the file being edited is inside a linked worktree; not a git repository and no `WorktreeCreate` hook; the write is outside the working directory.

**The state model, verbatim** — teachable because it is a real state machine: Working, Needs input, Idle, Completed, Failed, Stopped. "Needs input" covers "a question, a permission decision, or another prompt only you can answer, such as a sandbox prompt". This is why the "walk away" pattern has a defined return trip: you come back to the rows that need you.

**What costs money while you are away, verbatim**: "The one-line summary in each row is generated by a Haiku-class model." And, "Each session uses your subscription quota independently."

### 3.7 Headless and programmatic use

**Source URL**: `https://code.claude.com/docs/en/headless.md`
**Page title as read**: "Run Claude Code programmatically"
**Verification status**: verified from primary source
**Date read**: 2026-09-29

Verified entry points: `claude -p "<prompt>"` for non-interactive runs; `--output-format text | json | stream-json`; `--json-schema` for validated structured output; `--allowedTools` for pre-approval; `--permission-mode auto | dontAsk | acceptEdits`; `--permission-prompts none` for unattended runs.

Verified flags read verbatim, with the version floors the docs attach:

| Flag | Read verbatim from the page |
| :- | :- |
| `--bare` | "reduce startup time by skipping auto-discovery of hooks, skills, custom commands, subagents, installed plugins, MCP servers, auto memory, and CLAUDE.md" |
| `--allowedTools` | accepts permission rule syntax; `Bash(git diff *)` prefix-matches, "The space before `*` is important: without it, `Bash(git diff*)` would also match `git diff-index`" |
| `--permission-prompts` | "Pass `--permission-prompts none` when nobody is available to answer permission prompts"; requires v2.1.259 or later |
| `--agents` | JSON on the command line, or a path to a JSON file with `-p`; the file form requires v2.1.281 or later |
| `--output-format json` | "the response payload includes `total_cost_usd` and a per-model cost breakdown" |

Note on `--bare`, verbatim: "`--bare` is the recommended mode for scripted and SDK calls, and will become the default for `-p` in a future release." That is a forward-looking claim in the docs, not a current default.

**The parallelism interaction, verbatim** — a real, teachable gotcha:

> "If Claude starts a background subagent or workflow, `claude -p` instead stays open until that work completes, because its result is part of the final output. By default the wait ends after 10 minutes of continuous idle waiting, so a stuck subagent or workflow can't hold the process open indefinitely."

And: "Claude Code rejects `--bg` combined with `-p` or `--print` before any session is created, because `--print` never starts the interactive session that `claude agents` attaches to."

Also verified: "Claude Code exits with code 0 on success and a non-zero code when the run fails, so your scripts can branch on the exit status." Piped stdin is "capped at 10MB".

**Python and TypeScript**: `headless.md` only states they exist and links onward. The page says: "For the Python and TypeScript SDK packages with structured outputs, tool approval callbacks, and native message objects, see the full Agent SDK documentation." I did not fetch the Agent SDK pages, so SDK-specific API surface is `could not verify`.

### 3.8 Scheduling and long-running autonomous work

**Source URL**: `https://code.claude.com/docs/en/scheduled-tasks.md`
**Page title as read**: "Run prompts on a schedule"
**Verification status**: verified from primary source
**Date read**: 2026-09-29

**The three-way scheduling comparison, verbatim**:

| | Cloud (Routines) | Desktop (scheduled tasks) | `/loop` |
| :- | :- | :- | :- |
| Runs on | Cloud, Anthropic-managed by default | Your machine | Your machine |
| Requires machine on | No | Yes | Yes |
| Requires open session | No | No | Yes |
| Persistent across restarts | Yes | Yes | Restored on `--resume`, with exceptions |
| Access to local files | No (fresh clone) | Yes | Yes |
| MCP servers | Connectors configured per task | Config files and connectors | Inherits from session |
| Permission prompts | No (runs autonomously) | Configurable per task | Inherits from session |
| Customizable schedule | Via `/schedule` in the CLI | Yes | Yes |
| Minimum interval | 1 hour | 1 minute | 1 minute |

**Verified session-scoped limits, verbatim and teachable**:
- "Tasks only fire while Claude Code is running and idle. Closing the terminal or letting the session exit stops them firing."
- "No catch-up for missed fires."
- "A session can hold up to 50 scheduled tasks at once."
- "Recurring tasks automatically expire 7 days after creation. The task fires one final time, then deletes itself."
- "A self-paced `/loop` isn't restored, so run `/loop` again to restart it. Background Bash and monitor tasks are never restored on resume."
- Disable with `CLAUDE_CODE_DISABLE_CRON=1`.

**Verified tool surface**: `CronCreate` ("Accepts a 5-field cron expression, the prompt to run, and whether it recurs or fires once"), `CronList`, `CronDelete`, plus `ScheduleWakeup` for self-paced loops ("between one minute and one hour out"). Standard 5-field cron only; "Extended syntax like `L`, `W`, `?`, and name aliases such as `MON` or `JAN` is not supported."

**Undocumented on this page, referenced elsewhere**: `/goal` (keeps working until a condition holds), channels (push events in), routines (cloud schedules). I read their names and one-line descriptions in the index and in cross-references but did not fetch those pages. Marked `could not verify` beyond the descriptions quoted here.

### 3.9 The verification loop, which is what makes "walk away" safe

**Source URL**: `https://code.claude.com/docs/en/best-practices.md`
**Page title as read**: "Best practices for Claude Code"
**Verification status**: verified from primary source
**Date read**: 2026-09-29

**Verbatim, the framing**:

> "Claude stops when the work looks done. Without a check it can run, 'looks done' is the only signal available, and you become the verification loop: every mistake waits for you to notice it. Give Claude something that produces a pass or fail, and the loop closes on its own."

**Verbatim, the four escalating gates**:

> "Once the check exists, decide how hard it gates the stop:
> * In one prompt: ask Claude to run the check and iterate in the same message.
> * Across a session: set the check as a `/goal` condition. A separate evaluator re-checks it after every turn and Claude keeps working until the goal resolves.
> * As a deterministic gate: a Stop hook runs your check as a script and blocks the turn from ending until it passes.
> * By a second opinion: a verification subagent or a dynamic workflow that checks its own findings has a fresh model try to refute the result, so the agent doing the work isn't the one grading it."

**Verbatim, the honest warning about adversarial review**, which belongs in any curriculum that teaches this pattern:

> "A reviewer prompted to find gaps will usually report some, even when the work is sound, because that is what it was asked to do. Chasing every finding leads to over-engineering."

### 3.10 Cost, the constraint that bounds all of the above

**Source URL**: `https://code.claude.com/docs/en/costs.md`
**Page title as read**: "Manage costs effectively"
**Verification status**: verified from primary source
**Date read**: 2026-09-29

Verbatim: "Running several sessions or subagents at once multiplies token usage."

Verbatim, the published enterprise figure — useful as an order-of-magnitude anchor, and it should be dated in any teaching material: "Across enterprise deployments, the average cost is around $13 per developer per active day and $150-250 per developer per month, with costs remaining below $30 per active day for 90% of users."

Verbatim, the agent-team multiplier: "Agent teams use approximately 7x more tokens than standard sessions when teammates run in plan mode."

Verbatim, the guidance: "Use Sonnet for teammates. It balances capability and cost for coordination tasks." / "Keep teams small." / "Keep spawn prompts focused." / "Shut down teammates when their work is done. Each active teammate continues consuming tokens until it exits or the session ends."

Verbatim, the general model guidance: "Sonnet handles most coding tasks well and costs less than Opus. Reserve Opus for complex architectural decisions or multi-step reasoning."

---

## 4. Model and effort configuration for agentic work

**Source URL**: `https://code.claude.com/docs/en/model-config.md`
**Page title as read**: "Model configuration"
**Verification status**: verified from primary source
**Date read**: 2026-09-29

### 4.1 Effort levels, verbatim

> "Effort levels control adaptive reasoning, which lets the model decide whether and how much to think on each step based on task complexity. Lower effort is faster and cheaper for straightforward tasks, while higher effort provides deeper reasoning for complex problems."

**Which levels exist, per model, verbatim from the table**:

| Model | Levels |
| :- | :- |
| Fable 5.1 and Fable 5 | `low`, `medium`, `high`, `xhigh`, `max` |
| Opus 5.5, Sonnet 5.5, Opus 5, Sonnet 5, Opus 4.8, and Opus 4.7 | `low`, `medium`, `high`, `xhigh`, `max` |
| Opus 4.6 and Sonnet 4.6 | `low`, `medium`, `high`, `max` |

Fallback, verbatim: "If you set a level the active model does not support, Claude Code falls back to the highest supported level at or below the one set. For example, `xhigh` runs as `high` on Opus 4.6."

**When to use each, verbatim from the "Choose an effort level" table**:

| Level | When to use it |
| :- | :- |
| `low` | Quick exchanges where you review each result, such as brainstorming, a first sketch, or a small change like a rename |
| `medium` | The default on Opus 5.5 and Sonnet 5.5, where it fits day-to-day engineering work with a clear scope, such as implementing a new feature. On other models, reduces token usage for cost-sensitive work that can trade off some intelligence |
| `high` | Work where verification matters or edge cases are likely, such as fixing a bug in an existing codebase. The default on every model except Opus 5.5, Sonnet 5.5, and Opus 4.7 |
| `xhigh` | Deeper reasoning at higher token spend. The default on Opus 4.7 |
| `max` | Hard problems you want Claude to work through without you, such as finding security vulnerabilities. `max` may show diminishing returns and is prone to overthinking, so test before adopting it broadly |
| `ultracode` | A Claude Code setting rather than a level: plans a dynamic workflow for each substantive task at any effort level |

**Resolution order, verbatim**: 1. `CLAUDE_CODE_EFFORT_LEVEL`, `--effort`, or `/effort`. 2. Your settings (`modelSettings` per model, or a top-level `effortLevel`). 3. "The model's default effort: `high` on every model that supports effort, except that Opus 5.5 and Sonnet 5.5 default to `medium`, Opus 4.7 defaults to `xhigh`".

**Important caveat the docs state twice**: "The effort scale is calibrated per model, so the same level name does not represent the same underlying value across models." And: "Opus 5.5 starts at `medium` unless one of the sources above sets a level for it, and a top-level `effortLevel` in your user settings file doesn't count for Opus 5.5."

**One-off deep reasoning, verbatim**: "Include `ultrathink` anywhere in your prompt to request deeper reasoning on that turn without changing your session effort setting... The effort level sent to the API is unchanged. Claude Code passes other phrases such as 'think', 'think hard', and 'think more' through as ordinary prompt text and doesn't recognize them as keywords."

### 4.2 Model choice for agentic work

**Verbatim, what the docs say about Fable, the model positioned for the longest agentic runs**:

> "Claude Fable 5.1 and Claude Fable 5 are the most capable models in Claude Code, suited to tasks larger than a single sitting. They sustain long autonomous sessions, investigate before acting, and verify their work more often than smaller models."

**Verbatim, how to use it**:

> "* Describe the outcome, not the steps: hand it the result you want and let it plan the path. To keep it working toward that outcome, set a goal.
> * Hand it ambiguous problems: root-cause investigations, outage debugging, and architecture decisions are where the extra investigation and verification pay off.
> * Skip the verification reminders: it verifies its own work with less prompting, so reminders to test or check are usually unnecessary.
> * Size up larger tasks: give it work you would normally break into pieces. It holds long sessions without losing the thread."

**Verbatim, alias semantics** (each verified from the alias table): `best` "Uses the model the `fable` alias resolves to where Fable is available to you, otherwise the same model as `opus`". `opusplan` is "Special mode that uses `opus` during plan mode, then switches to `sonnet` for execution".

**Verbatim, the model-to-task guidance the brief asked for** — the page delegates it rather than stating it:

> "For guidance on which model and effort level fit different kinds of work, see Choosing a Claude model and effort level in Claude Code on the blog."

I did not fetch that blog post. The `model-config.md` page's own per-model alias descriptions (`sonnet` "for daily coding tasks", `opus` "for complex reasoning tasks", `haiku` "for simple tasks", `fable` "for your hardest and longest-running tasks") plus the `costs.md` guidance quoted in 3.10 are what I can stand behind.

**Verified cost-conscious subagent routing**, from `sub-agents.md`: define `model: haiku` in a subagent to keep exploration on a lower-cost model; define one of `Explore` yourself, since "A user or project subagent named `Explore` overrides the built-in and keeps its own `model` field".

### 4.3 Plan mode and auto mode

Neither is documented in `model-config.md` in detail; both are cross-referenced from it. **Verified facts about auto mode, read on the pages fetched:**
- `best-practices.md`: "With Claude Code v2.1.283 or later, auto mode is the built-in starting permission mode for interactive terminal and VS Code sessions: a separate classifier model reviews most actions instead of you and blocks only what looks risky, such as scope escalation, unknown infrastructure, or hostile-content-driven actions."
- `model-config.md`: the auto mode classifier's "Claude Sonnet 5 default applies only when the allowlist permits Sonnet 5. When it's excluded, the classifier runs on the session's model."
- `workflows.md`: "In auto mode, the prompt your script passes to `agent()` doesn't count as a request from you when the classifier reviews that subagent's actions, because Claude Code marks it as text the script computed."

**`could not verify`**: plan mode's mechanics. I did not fetch `permission-modes.md`. Only the one-line cross-reference descriptions were seen.

---

## 5. What this supports in a curriculum

1. **A decision procedure, taught as three questions in order.** "Who coordinates? Do the workers need to talk? Do they touch the same files?" — all three are verbatim from `agents.md` and each has a documented answer. This is the spine of a "how do I run this" phase.
2. **A single sentence of mental model per mechanism.** Subagent moves work out of context; worktree moves work out of the filesystem; workflow moves the plan out of the model; team moves coordination into the model. All four clauses are supported by the `agents.md` and `workflows.md` tables above.
3. **A hard teaching point that grep is a cost problem, not a correctness problem.** Verified in `costs.md` and `large-codebases.md`. Do not teach that text search returns wrong answers for symbols in typed code; this documentation does not say that.
4. **A concrete, reproducible setup task for a monorepo.** Nested `CLAUDE.md`, `claudeMdExcludes`, `Read` deny rules, per-directory skills, and `worktree.sparsePaths` — the full example tree and per-area settings file are printed on `large-codebases.md` and can be turned into a hands-on exercise with a verifiable end state (run `/context` and see the expected file list).
5. **A typed-language exercise with a pass/fail signal.** Install the language server binary, install the plugin, then introduce a type error on purpose and look for `Found N new diagnostic issues in M files`. That signal is documented and machine-checkable.
6. **A numbered, teachable list of agent team limitations**, all nine, each with the consequence stated. A team phase that omits "no nested teams", "lead is fixed", and "no session resumption with in-process teammates" teaches a mechanism that looks more reliable than it is.
7. **A workflow script exercise.** Have the agent write a workflow that fans out one agent per file and cross-checks findings, then read the saved script in `.claude/workflows/` and identify `meta`, `agent()`, `pipeline()`, and `parallel()`. The exact shape is printed in the docs, so the exercise is checkable.
8. **The runtime caps as arithmetic, not lore.** 16 concurrent agents by default, 4,096 items per `parallel()`/`pipeline()` call, 1,000 agents per run, a 25-agent or 1.5M-token advisory warning. Every number is documented with a stated reason.
9. **A determinism rule with a stated reason**: `Date.now()`, `Math.random()`, and no-argument `new Date()` throw inside a workflow script so a relaunch repeats the same calls. This is a genuinely good software-engineering lesson that happens to be product-documented.
10. **A failure-mode drill on workflow resume**: one failed agent in the middle of a fan-out reruns everything after it, including already-completed agents. The docs give the A, B, C, D example explicitly. Ask learners to predict the behaviour before revealing it.
11. **A comparison exercise on scheduling**, using the published table. "Which option runs when my laptop is closed?" has one correct row (cloud), and the answer flips for "which one can read my local files".
12. **Effort-level calibration as an empirical exercise.** Have the same task run at `low`, `medium`, and `high` and compare cost and outcome. The docs' own finding is a good hypothesis to test: "In tests on Opus 5.5 and Fable 5.1, Claude at a higher level tested more edge cases and verified more of its work before answering."
13. **The per-model-calibration caveat as a lesson in not generalizing.** "The effort scale is calibrated per model, so the same level name does not represent the same underlying value across models."
14. **A cost model with real numbers.** $13 per developer per active day average; 7x for agent teams in plan mode; "Running several sessions or subagents at once multiplies token usage." A curriculum can make cost a first-class design constraint rather than an afterthought.
15. **The verification ladder as an autonomy ladder.** Prompt-level check, then `/goal`, then a Stop hook, then an adversarial second opinion. Each rung buys unattended correctness with setup cost, and the docs state that tradeoff.
16. **A caution about adversarial review**, quoted verbatim above. Teaching the reviewer pattern without this caveat produces over-engineering.
17. **The isolation checks as a security lesson.** Four worktree enforcement checks, the last one not disableable. This is a good example of defense in depth implemented as tool-call validation rather than as a permission dialog.
18. **A cross-vendor grounding exercise.** Fetch `git-scm.com/docs/git-worktree` alongside the Claude Code worktrees page. The two agree on the mechanism; git adds its own caveat that multiple checkouts are still experimental and submodules are incompletely supported, which Claude Code does not repeat. Good material for "read the substrate docs, not only the product docs".

---

## 6. What remains open

Everything below is unsourced from the fetched text. Treat as a research task, not as curriculum content, until filled.

1. **Why grep fails on typed languages.** No page fetched makes the correctness argument. Only the cost argument exists. `could not verify`.
2. **Any numeric repository-size limit.** No file-count, line-count, or package-count ceiling appears on `large-codebases.md`. The phrase used is "millions of lines". `could not verify` for any specific threshold.
3. **"How do I run this agent" as a stated rule.** Section 1 is my derivation. No page states it as a single sentence. `could not verify` as a quote.
4. **Agent SDK Python and TypeScript API surface.** `headless.md` links onward; I did not fetch `agent-sdk/*`. Package names, entry points, and callback signatures: `could not verify`.
5. **Plan mode mechanics.** `permission-modes.md` not fetched. Only cross-reference one-liners were seen. `could not verify`.
6. **Auto mode's classifier thresholds and prompt.** `auto-mode-config.md` not fetched. Only the summary behaviour quoted in 4.3 is verified.
7. **Cross-session messaging in detail.** Seen only as a named capability and a `ListAgents` / `SendMessage` tool description. `cross-session-messaging.md` not fetched.
8. **`/goal` evaluation.** Named in the index and in `best-practices.md`; page not fetched. How the goal is judged, and what "a model judges it impossible" means: `could not verify`.
9. **Routines (cloud scheduling).** Seen in the comparison table and in the index only. `routines.md` not fetched.
10. **Model names and version availability are volatile.** This document names Opus 5.5, Sonnet 5.5, Fable 5.1, Sonnet 4.6, Opus 4.8, Opus 4.7, Opus 4.6, Sonnet 4.5. The alias-to-version mapping is documented as provider-dependent and is explicitly time-varying ("Aliases point to the recommended version for your provider and update over time"). Any teaching material naming a model version needs a date attached to it.
11. **Every version floor cited here** (v2.1.198, v2.1.203, v2.1.257, v2.1.269, v2.1.271, v2.1.280, v2.1.283, v2.1.284, and the rest) is a snapshot of the docs as read on 2026-09-29. These move fast.
12. **Cost figures** are enterprise averages as published, not measured values, and are not independent of plan mix.
13. **Whether the 7x agent-team multiplier is load-bearing.** The docs scope it: "when teammates run in plan mode". Outside plan mode the multiplier is not stated.
14. **The blog post "Choosing a Claude model and effort level in Claude Code"** is the page `model-config.md` itself defers to for model-to-task guidance. Not fetched. This is the single highest-value remaining fetch for section 4.

---

## Source register

| Source URL | Page title as read | Status | Date read |
| :- | :- | :- | :- |
| `code.claude.com/docs/llms.txt` | Claude Code Docs (index) | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/large-codebases.md` | Set up Claude Code in a monorepo or large codebase | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/agents.md` | Run agents in parallel | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/sub-agents.md` | Create custom subagents | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/agent-view.md` | Manage multiple agents with agent view | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/agent-teams.md` | Orchestrate teams of Claude Code sessions | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/workflows.md` | Orchestrate subagents at scale with dynamic workflows | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/worktrees.md` | Run parallel sessions with worktrees | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/claude-projects.md` | Let Claude coordinate ongoing work with Projects | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/plugins/code-intelligence.md` | Code intelligence plugins | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/tools-reference.md` | Tools reference | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/model-config.md` | Model configuration | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/headless.md` | Run Claude Code programmatically | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/scheduled-tasks.md` | Run prompts on a schedule | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/context-window.md` | Explore the context window | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/best-practices.md` | Best practices for Claude Code | verified from primary source | 2026-09-29 |
| `code.claude.com/docs/en/costs.md` | Manage costs effectively | verified from primary source | 2026-09-29 |
| `git-scm.com/docs/git-worktree` | git-worktree - Manage multiple working trees | verified from primary source | 2026-09-29 |
| `microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/` | Language Server Protocol Specification - 3.17 | verified from primary source | 2026-09-29 |

One fetch failed and is recorded for completeness: `microsoft.github.io/language-server-protocol/docs/lsp_intro/` returned HTTP 404. The spec URL above was used instead and returned content.

**Note on `context-window.md`**: the page rendered as a large embedded interactive component rather than prose. The token figures inside it are labelled "illustrative" by the page itself, so no numbers from it are cited as authoritative here. Its one usable fact, that file reads dominate context and that a subagent's reads never touch the main window, is corroborated in `best-practices.md` and `sub-agents.md` and is cited from there instead.