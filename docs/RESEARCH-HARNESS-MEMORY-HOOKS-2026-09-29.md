# Research: instruction files and hooks (Claude Code)

- **Date read:** 2026-09-29
- **Author:** research subagent (one-shot, no network beyond the pages listed)
- **Scope:** the two extension points that decide what an agent harness *knows* and what it *always does*.

---

## 1. Summary

**What they are actually for.**

Instruction files (`CLAUDE.md`, `AGENTS.md`, `.claude/rules/`) inject *context* the model reads and tries to follow. They are advisory: the docs state plainly that Claude "treats them as context, not enforced configuration" and that content is "delivered as a user message after the system prompt, not as part of the system prompt itself". Hooks are *code Claude Code itself runs* at fixed lifecycle points, whether or not the model wants to. The determinism gap between those two sentences is the whole curriculum.

**The one-sentence rule for choosing between them.** Verbatim from the features overview:

> "**Put guardrails in hooks.** An instruction like "never edit `.env`" in CLAUDE.md or a skill is a request, not a guarantee. A `PreToolUse` hook that blocks the edit is enforcement. If a rule must hold every time, make it a hook rather than a prompt instruction."

And, on the same page:

> "Settings rules are enforced by the client regardless of what Claude decides to do. CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer."

**The second decision** (CLAUDE.md vs AGENTS.md) is not about style or preference; it is about whether any `CLAUDE.md` or `CLAUDE.local.md` exists at or above your working directory. That single fact determines the default outcome. Details in section 2.1.

---

## 2. Instruction files

### 2.1 CLAUDE.md vs AGENTS.md: the precedence rule

Source: `https://code.claude.com/docs/en/memory.md`, page title as read "How Claude remembers your project". Status: **verified from primary source**. Date read: 2026-09-29.

The doc gives one decisive table, quoted verbatim:

> | Your repository has | Claude reads |
> | :- | :- |
> | An `AGENTS.md`, and no `CLAUDE.md` or `CLAUDE.local.md` in your working directory or above it | Your `AGENTS.md` |
> | An `AGENTS.md` and a `CLAUDE.md` or `CLAUDE.local.md` in your working directory or above it | Your `CLAUDE.md` files only |
> | A `CLAUDE.md` that already [imports `AGENTS.md`](#share-one-file-with-other-coding-tools) | Your `CLAUDE.md`, with `AGENTS.md` included through the import |

Which files "count" for that check, verbatim:

> * **Count, so Claude reads them instead of `AGENTS.md`**: a `CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` in your working directory or any directory above it
> * **Don't count, and keep loading alongside `AGENTS.md`**: your `~/.claude/CLAUDE.md`, your organization's managed `CLAUDE.md`, and `.claude/rules/` files

**The trap a curriculum must call out** (verbatim note):

> "Because `CLAUDE.local.md` counts, adding one to keep your own uncommitted instructions in a project that relies on `AGENTS.md` stops Claude from reading `AGENTS.md` for you."

**When `AGENTS.md` is loaded, and how** (verbatim):

> * **At session start**: every `AGENTS.md` and `.claude/AGENTS.md` in your working directory and the directories above it. In an interactive session you see a line such as `no CLAUDE.md found; AGENTS.md loaded: /home/you/repo/AGENTS.md` in the conversation
> * **As Claude works in subdirectories**: a subdirectory's `AGENTS.md`, when Claude opens a file there with the Read tool and that subdirectory has none of the three `CLAUDE.md` files of its own
> * **Inside each `AGENTS.md`**: [`@path` imports](#import-additional-files) are expanded, [`claudeMdExcludes`](#exclude-specific-claude-md-files) patterns apply, and subagents that [skip project instructions](/docs/en/sub-agents#what-loads-at-startup) skip these files too
> * **Not read**: `AGENTS.local.md`, `AGENTS.override.md`, or anything under a `.agents/` directory

**The four `Project instructions` values** (verbatim table, set via `/config` or in settings under `pluginConfigs`):

| Value | What Claude reads |
| :- | :- |
| `claude-md-or-agents-md` | Your `CLAUDE.md` files, or your `AGENTS.md` files when you have no `CLAUDE.md` or `CLAUDE.local.md` in your working directory or above it. This is the default |
| `claude-md-and-agents-md` | Your `CLAUDE.md` and `AGENTS.md` files together, each directory's `CLAUDE.md` files first and its `AGENTS.md` after them. Claude Code skips an `AGENTS.md` it has already loaded, so one that your `CLAUDE.md` imports or symlinks to isn't read twice |
| `claude-md` | Your `CLAUDE.md` files only |
| `managed-only` | Only your organization's managed `CLAUDE.md` and [auto memory](#auto-memory) at launch. Your project, local, and user `CLAUDE.md` files, your `.claude/rules/` files, and every `AGENTS.md` are left out. A subdirectory's `CLAUDE.md` and `.claude/rules/` files, and [path-scoped rules](#path-specific-rules), still load when Claude reads a file there |

The settings-file spelling of that choice, as read on the same page:

```json
{
  "pluginConfigs": {
    "agents-md@builtin": {
      "options": { "instructionFiles": "claude-md-and-agents-md" }
    }
  }
}
```

Note the doc's own caveat: "Claude Code ignores it in project and local settings files."

**Version caveats (verbatim, and important for a curriculum dated 2026):**

> "Reading `AGENTS.md` directly requires Claude Code v2.1.277 or later. In some sessions Claude [can't read `AGENTS.md`](#when-agents-md-support-is-unavailable), so [import it from a `CLAUDE.md`](#share-one-file-with-other-coding-tools) there instead."

> "Before v2.1.281, some sessions, such as those on Amazon Bedrock or with telemetry disabled, read `CLAUDE.md` files only."

#### Field schema: `CLAUDE.md` / `AGENTS.md`

- **Source URL:** `https://code.claude.com/docs/en/memory.md`
- **Page title as read:** "How Claude remembers your project"
- **Verification status:** verified from primary source
- **Date read:** 2026-09-29
- **What it does:** markdown instructions read at the start of every session and injected into context.
- **When to use it:** for facts Claude should hold in every session. The doc's trigger list, verbatim: "Claude makes the same mistake a second time / A code review catches something Claude should have known about this codebase / You type the same correction or clarification into chat that you typed last session / A new teammate would need the same context to be productive".
- **Security implications:** an `@path` import in a *project-level* memory file whose path resolves outside the working directory is treated as external and triggers an approval dialog. Verbatim: "An import in a project-level memory file is external when its path resolves outside your working directory... The first time Claude Code encounters external imports in a project, it shows an approval dialog listing the files. If you decline, the imports stay disabled and the dialog doesn't appear again." Note this protection applies to project-scope; "User-scope memory files, such as `~/.claude/CLAUDE.md` and `~/.claude/rules/`, are files you wrote yourself" and load without the dialog.
- **Version caveats:** `AGENTS.md` support is v2.1.277+, fully reliable from v2.1.281. `/doctor prompt-audit` requires v2.1.283 or later.

### 2.2 Levels and load order

Source as above. Status: **verified from primary source**.

The doc's own table is ordered "in load order, from broadest scope to most specific":

| Scope | Location | Purpose | Shared with |
| - | - | - | - |
| **Managed policy** | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`; Linux and WSL: `/etc/claude-code/CLAUDE.md`; Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | Organization-wide instructions managed by IT/DevOps | All users in organization |
| **User instructions** | `~/.claude/CLAUDE.md` | Personal preferences for all projects | Just you (all projects) |
| **Project instructions** | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Team-shared instructions for the project | Team members via source control |
| **Local instructions** | `./CLAUDE.local.md` | Personal project-specific preferences; add to `.gitignore` | Just you (current project) |

Note this is *concatenation order*, not override order. Verbatim on how they combine:

> "All discovered files are concatenated into context rather than overriding each other. Across the directory tree, content is ordered from the filesystem root down to your working directory. For the `foo/bar/` example, `foo/CLAUDE.md` appears in context before `foo/bar/CLAUDE.md`, so instructions closer to where you launched Claude are read last. Within each directory, `CLAUDE.local.md` is appended after `CLAUDE.md`, so your personal notes are the last thing Claude reads at that level."

> "Claude also discovers `CLAUDE.md` and `CLAUDE.local.md` files in subdirectories under your current working directory. Instead of loading them at launch, they are included when Claude reads files in those subdirectories."

**Conflict behaviour, verbatim:**

> "if two rules contradict each other, Claude may pick one arbitrarily"

> "Claude Code loads user-level rules before project rules, so a project rule appears later in Claude's context than a user rule. Neither set overrides the other: if a user rule and a project rule conflict, Claude may follow either one, so keep the two consistent."

The `.claude/` explorer page adds a shorter phrasing of the same point: "When instructions conflict, project-level instructions take priority."

**Monorepo / exclusion knob:** the `claudeMdExcludes` setting, an array of glob patterns matched against absolute file paths, configurable at user, project, local, or managed policy level, with arrays merging across layers. Verbatim: "Managed policy CLAUDE.md files cannot be excluded."

### 2.3 Path-specific rules (`.claude/rules/`)

Source as above. Status: **verified from primary source**.

Format: markdown in `.claude/rules/`, discovered recursively, with YAML frontmatter between `---` markers. Verbatim from the frontmatter reference table: "`paths` is the only field Claude Code reads from a rule; any other field is ignored without an error."

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules

- All API endpoints must include input validation
```

What it enables, verbatim: "These conditional rules only apply when Claude is working with files matching the specified patterns." and "Path-scoped rules trigger when Claude reads files matching the pattern, not on every tool use."

**Glob syntax table, verbatim:**

| Pattern | Matches |
| - | - |
| `**/*.ts` | All TypeScript files in any directory |
| `src/**/*` | All files under `src/` directory |
| `*.md` | Markdown files in the project root |
| `src/components/*.tsx` | React components in a specific directory |

Brace expansion is supported: `"src/**/*.{ts,tsx}"`. There is a documented expansion budget — verbatim: "a rule's whole `paths` list shares one budget of 1,000 expanded patterns and 4 MiB, and patterns without braces don't count against it." And a documented bracket gotcha: "Glob syntax treats `[` as the start of a bracket expression such as `[abc]`. A pattern with a `[` that can't be read as a bracket expression... is invalid: it matches nothing... To match a literal `[` in a file name, escape it as `photos \[2024/**`."

Error behaviour, verbatim: "If the YAML between the markers doesn't parse, Claude Code ignores the frontmatter and loads the rule as if it had no `paths`. Run `claude --debug` to see the parse error."

**`InstructionsLoaded` hook** is the documented debugging tool for this: matcher values `session_start`, `nested_traversal`, `path_glob_match`, `include`, `compact` (from the hooks reference). Caveat worth teaching: "`InstructionsLoaded` hooks [...] Don't fire" for an `AGENTS.md` "read through the [Project instructions] setting".

### 2.4 Imports

Source as above. Status: **verified from primary source**.

Syntax, verbatim: "CLAUDE.md files can import additional files using `@path/to/import` syntax. Imported files are expanded and loaded into context at launch alongside the CLAUDE.md that references them."

Rules that matter:

- "Both relative and absolute paths are allowed. Relative paths resolve relative to the file containing the import, not the working directory."
- "Imported files can recursively import other files, with a maximum depth of four hops."
- "Import parsing skips Markdown code spans and fenced code blocks. To mention a path in your CLAUDE.md without importing it, wrap it in backticks: writing `` `@README` `` keeps the text literal, while `@README` outside backticks imports the file."

**The size caveat is load-bearing** and cuts against a common intuition: imports are *organisation*, not *lazy loading*. Verbatim: "You can also split content into [imports] for organization, though imported files still load and enter the context window at launch." Restated: "Splitting into [`@path` imports](#import-additional-files) helps organization but doesn't reduce context, since imported files load at launch." The mechanism that *does* reduce context is path-scoped rules.

### 2.5 Size guidance

Source as above. Status: **verified from primary source**.

Verbatim: "**Size**: target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence. If your instructions are growing large, use [path-scoped rules] so instructions load only when Claude works with matching files."

Hard limit, verbatim: "This limit applies only to `MEMORY.md`. Claude Code loads a CLAUDE.md file of up to 4 MiB in full and skips a larger file. Shorter files produce better adherence."

Warning behaviour, verbatim: "If one of your instruction files is over the recommended length, you see a warning at startup and when you run `/status`."

**Auto memory** is a separate mechanism with its own budget and should not be conflated with CLAUDE.md. Verbatim: "The first 200 lines of `MEMORY.md`, or the first 25KB, whichever comes first, are loaded at the start of every conversation." Location: `~/.claude/projects/<project>/memory/`. Toggle: `autoMemoryEnabled`, or `/memory`; env var `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`.

**Security implication of the size rule is worth stating explicitly in teaching material:** because every line is in every request, a bloated CLAUDE.md degrades adherence everywhere, not just in the one place it was written for.

### 2.6 `.claude/` directory, item by item

Source: `https://code.claude.com/docs/en/claude-directory.md`, page title as read "Explore the .claude directory". Status: **verified from primary source** (the page body is a React component whose data literal was returned in the fetch; the one-liners below are quoted from that literal, not paraphrased). Date read: 2026-09-29.

Project tree, as read:

| Path | What it is (as documented) |
| - | - |
| `CLAUDE.md` | "Project instructions Claude reads every session". Also accepted at `.claude/CLAUDE.md`. |
| `.mcp.json` | "Project-scoped MCP servers, shared with your team". Lives at the project root, not inside `.claude/`. |
| `.worktreeinclude` | "Gitignored files to copy into new worktrees". Lives at the project root. |
| `.claude/settings.json` | "Permissions, hooks, and configuration". Enforced, unlike CLAUDE.md: "Unlike CLAUDE.md, which Claude reads as guidance, these are enforced whether Claude follows them or not." Contains `permissions` (allow/deny/ask), `hooks`, `statusLine`, `model`, `env`, `outputStyle`. |
| `.claude/settings.local.json` | "Your personal settings overrides for this project". Gitignored. "Highest of the user-editable settings files; CLI flags and managed settings still take precedence". |
| `.claude/rules/` | "Topic-scoped instructions, optionally gated by file paths". "Like CLAUDE.md, rules are guidance Claude reads, not configuration Claude Code enforces. For guaranteed behavior use hooks or permissions." |
| `.claude/skills/` | "Reusable prompts you or Claude invoke by name". Each is a folder with `SKILL.md` plus supporting files. Frontmatter controls invocability: `disable-model-invocation: true` (user-only), `user-invocable: false` (hidden from `/` menu). |
| `.claude/commands/` | "Single-file prompts invoked with `/name`". The page carries a note: "Commands and skills are now the same mechanism. For new workflows, use skills/ instead". Also: "If a skill and command share a name, the skill takes precedence". |
| `.claude/output-styles/` | "Project-scoped output styles, if your team shares any". Read at startup. |
| `.claude/agents/` | "Specialized subagents with their own context window". Each markdown file has `name`, `description`, optional `tools:` restriction. |
| `.claude/workflows/` | "Dynamic workflow scripts that orchestrate many subagents". Each `.js` file becomes a `/<name>` command. |
| `.claude/agent-memory/` | "Subagent persistent memory, separate from your main session auto memory". Autogenerated, only for subagents setting the `memory:` frontmatter field. |

Global (`~/`) tree, as read: `.claude.json` (app state, personal MCP servers, per-project trust), `.claude/CLAUDE.md`, `.claude/settings.json`, `.claude/keybindings.json`, `.claude/themes/`, `.claude/projects/` (auto memory), `.claude/rules/`, `.claude/skills/`, `.claude/commands/`, `.claude/output-styles/`, `.claude/agents/`, `.claude/workflows/`, `.claude/agent-memory/`.

Note the doc's own caution about splitting CLAUDE.md into rules: "When CLAUDE.md approaches 200 lines, start splitting into rules".

### 2.7 Settings precedence (needed context for both extension points)

Source: `https://code.claude.com/docs/en/settings.md`, page title as read "Settings files and precedence". Status: **verified from primary source**.

Verbatim, highest first: "1. **Managed settings** ... 2. **Command line arguments** ... 3. **Project local settings** (`.claude/settings.local.json`) ... 4. **Shared project settings** (`.claude/settings.json`) ... 5. **User settings** (`~/.claude/settings.json`)".

And: "Environment variables aren't a level in this stack." List keys such as `permissions.allow` merge rather than override.

This matters because it is the *opposite* model from instruction files. Verbatim from the explorer page: "This is different from CLAUDE.md, where global and project files are both loaded into context rather than merged key by key."

### 2.8 Cross-tool portability

Source: `https://agentskills.io`, page title as read "Agent Skills Overview". Status: **verified from primary source**, but note this page describes the *skills* format, not the CLAUDE.md/AGENTS.md question. Date read: 2026-09-29.

Relevant for the instruction-file half: the Agent Skills format is an open cross-vendor standard (SKILL.md with `name` + `description`, optional `scripts/`, `references/`, `assets/`), adopted by a long client list including Claude Code, Cursor, GitHub Copilot, VS Code, Gemini CLI, OpenCode, OpenHands, and others. Verbatim: "The Agent Skills format was originally developed by Anthropic, released as an open standard, and has been adopted by a growing number of agent products."

`AGENTS.md` is the analogous portable *instruction* file, and Claude Code now reads it directly (section 2.1). That pairing — `AGENTS.md` for instructions, `SKILL.md` for capabilities — is the portable story a curriculum can teach without over-claiming. I did not verify a cross-vendor spec for `AGENTS.md` itself; see section 5.

---

## 3. Hooks

### 3.1 What a hook is

- **Source URL:** `https://code.claude.com/docs/en/hooks-guide.md` (guide) and `https://code.claude.com/docs/en/hooks.md` (reference)
- **Page titles as read:** "Automate actions with hooks" and "Hooks reference"
- **Verification status:** verified from primary source
- **Date read:** 2026-09-29
- **What it does:** runs your handler at a lifecycle event, outside the model's discretion.
- **When to use it:** "Use a hook when the action must happen the same way every time and doesn't need Claude to think." (features overview, verbatim)
- **Security implications:** see 3.6. This is the sharpest security surface in the extension layer.
- **Version caveats:** `type: "agent"` is explicitly experimental.

The determinism framing, verbatim from the hooks reference: "Hooks are user-defined shell commands, HTTP endpoints, MCP tool calls, LLM prompts, or subagents that execute automatically at specific points in Claude Code's lifecycle." And from the features overview's context-cost table: hooks cost "Zero, unless the hook returns output that gets added as messages to your conversation."

### 3.2 Configuration format

Three levels of nesting, verbatim from the reference:

> "1. Choose a hook event to respond to, like `PreToolUse` or `Stop`
> 2. Add a matcher group to filter when it fires, like "only for the Bash tool"
> 3. Define one or more hook handlers to run when matched"

The terminology is prescribed: "**hook event** for the lifecycle point, **matcher group** for the filter, and **hook handler** for the shell command, HTTP endpoint, MCP tool, prompt, or agent that runs."

### 3.3 Handler types

Five, verbatim from the reference:

- `type: "command"` -- "run a shell command. Your script receives the event's JSON input on stdin and communicates results back through exit codes and stdout."
- `type: "http"` -- "send the event's JSON input as an HTTP POST request to a URL."
- `type: "mcp_tool"` -- "call a tool on a configured MCP server. The tool's text output is treated like command-hook stdout."
- `type: "prompt"` -- "send a prompt to a Claude model for single-turn evaluation. The model returns its decision as JSON."
- `type: "agent"` -- "spawn a subagent that can use tools like Read, Grep, and Glob to verify conditions before returning a decision. Agent hooks are experimental and may change."

**This directly answers the task's question about what a handler may be: shell command, HTTP request, MCP tool call, prompt, or subagent.** All five are confirmed in the fetched text.

Per-type fields, as read:

| Type | Fields |
| - | - |
| `command` | `command` (required), `args`, `async`, `asyncRewake`, `shell` (`"bash"` or `"powershell"`) |
| `http` | `url` (required), `headers`, `allowedEnvVars` |
| `mcp_tool` | `server` (required), `tool` (required), `input` |
| `prompt` / `agent` | `prompt` (required), `model` |

Common to all: `type`, `if`, `timeout`, `statusMessage`, `once`.

Notable `if` semantics, verbatim: "The `if` field holds exactly one permission rule. There is no `&&`, `||`, or list syntax for combining rules". And a warning that matters: "When Claude Code can't determine which commands the Bash input runs, it runs your hook regardless of the pattern. Because the `if` filter is best-effort, use the [permission system] rather than a hook to enforce a hard allow or deny."

### 3.4 Full list of lifecycle events confirmed

Every event name in the table below was read in the fetched text of both `hooks-guide.md` and `hooks.md`, where the two tables are identical. Status: **verified from primary source**.

| Event | When it fires (doc's wording) | Matcher filters on |
| - | - | - |
| `SessionStart` | When a session begins or resumes | `startup`, `resume`, `clear`, `compact`, `fork` |
| `Setup` | "When you start Claude Code with `--init-only`, or with `--init` or `--maintenance` in `-p` mode. For one-time preparation in CI or scripts" | `init`, `maintenance` |
| `UserPromptSubmit` | When you submit a prompt, before Claude processes it | no matcher support |
| `UserPromptExpansion` | "When a user-typed command expands into a prompt, before it reaches Claude. Can block the expansion" | command name |
| `PreToolUse` | "Before a tool call executes. Can block it" | tool name |
| `PermissionRequest` | When a tool call needs a permission decision | tool name |
| `PermissionDenied` | "When auto mode denies a tool call, including denials without a classifier verdict" | tool name |
| `PostToolUse` | After a tool call succeeds | tool name |
| `PostToolUseFailure` | After a tool call fails | tool name |
| `PostToolBatch` | "After a full batch of parallel tool calls resolves, before the next model call" | no matcher support |
| `Notification` | When Claude Code sends a notification | notification type (see below) |
| `MessageDisplay` | While assistant message text is displayed | no matcher support |
| `SubagentStart` | When a subagent is spawned | agent type |
| `SubagentStop` | When a subagent finishes | agent type |
| `TaskCreated` | "When a task is being created via `TaskCreate`" | no matcher support |
| `TaskCompleted` | "When a task is being marked as completed" | no matcher support |
| `Stop` | When Claude finishes responding | no matcher support |
| `StopFailure` | When the turn ends due to an API error | error type |
| `TeammateIdle` | "When an agent team teammate is about to go idle" | no matcher support |
| `InstructionsLoaded` | "When a CLAUDE.md or `.claude/rules/*.md` file is loaded into context" | load reason |
| `ConfigChange` | When a configuration file changes during a session | configuration source |
| `CwdChanged` | "When the working directory changes, for example when Claude executes a `cd` command" | no matcher support |
| `DirectoryAdded` | "When a working directory is added mid-session via `/add-dir` or the SDK `register_repo_root` control request" | how the directory was added |
| `FileChanged` | "When a watched file changes on disk. The `matcher` field specifies which filenames to watch" | literal filenames |
| `WorktreeCreate` | "When a worktree is being created via `--worktree`, `isolation: "worktree"`, or for a background session" | no matcher support |
| `WorktreeRemove` | "When a worktree is being removed at session exit, when a subagent finishes, or when you delete a background session" | no matcher support |
| `PreCompact` | Before context compaction | `manual`, `auto` |
| `PostCompact` | After context compaction completes | `manual`, `auto` |
| `PreModelSwitch` | "Before Claude Code applies a model switch that you or a client requested. Can block the switch" | canonical model name |
| `PostModelSwitch` | "After the session's model changes, including changes Claude Code makes on its own" | canonical model name |
| `Elicitation` | "When an MCP server requests user input during a tool call" | MCP server name |
| `ElicitationResult` | "After a user responds to an MCP elicitation, before the response is sent back to the server" | MCP server name |
| `SessionEnd` | When a session terminates | reason the session ended |

**Thirty-three events.** The task brief anticipated "and any others" -- there are many more than the eight named in the brief; `Setup`, `PostToolBatch`, `FileChanged`, `InstructionsLoaded`, `ConfigChange`, `CwdChanged`, `DirectoryAdded`, `WorktreeCreate`, `WorktreeRemove`, `PostCompact`, `PostModelSwitch`, `MessageDisplay`, `TaskCreated`, `TaskCompleted`, `StopFailure`, `TeammateIdle`, `Elicitation`, `ElicitationResult`, `PermissionRequest`, `PermissionDenied`, `PostToolUseFailure`, `UserPromptExpansion` all exist beyond the classic eight.

Note `StopFailure` matcher values, verbatim: `rate_limit`, `overloaded`, `authentication_failed`, `oauth_org_not_allowed`, `account_on_hold`, `billing_error`, `invalid_request`, `model_not_found`, `server_error`, `max_output_tokens`, `cloud_credential_error`, `unknown`.

Cadence, verbatim from the reference: "Events fall into three cadences: * per session: `SessionStart` and `SessionEnd` * per turn: `UserPromptSubmit`, `Stop`, and `StopFailure` * on every tool call inside the agentic loop: `PreToolUse` and `PostToolUse`, except `EndConversation` calls, which skip both".

### 3.5 Blocking and permissions

**Can a hook block?** Yes, several ways. Confirmed mechanisms:

1. **Exit code 2.** Verbatim: "**Exit 2**: Claude Code blocks the action. Write a reason to stderr." With an important non-uniformity: "Some events can't be blocked: for `SessionStart` and others, exit 2 shows stderr to the user and execution continues."
2. **Structured JSON with `permissionDecision`.** On `PreToolUse`, the values are `allow`, `deny`, `ask`, and `defer` (defer only in `-p` non-interactive mode). On `PreModelSwitch`, the same field with `allow`/`deny`/`ask`.
3. **Top-level `decision: "block"`** for `PostToolUse` and `Stop`. Verbatim: "Other events use different decision patterns. For example, `PostToolUse` and `Stop` hooks use a top-level `decision: "block"` field, while `PermissionRequest` uses `hookSpecificOutput.decision.behavior`."
4. **`PermissionRequest` auto-approval.** Verbatim: "if your hook returns `"behavior": "allow"`, Claude Code answers the request on your behalf."

**Combine order, verbatim:** "For `PreToolUse` permission decisions, the most restrictive answer applies, in the order `deny`, `defer`, `ask`, `allow`." And a caveat about side effects: "One hook returning `deny` doesn't stop sibling hooks from executing. Don't rely on one hook's `deny` to suppress side effects in another hook."

**The exit-0 non-approval subtlety**, verbatim and worth teaching: "**Exit 0**: your hook reports no objection through its exit code. * For a `PreToolUse` hook this doesn't approve the tool call: the normal permission flow still applies."

**Stop hook cap, verbatim:** "Claude Code overrides a Stop hook after it blocks eight times in a row without progress." The fix is the `stop_hook_active` input field; the cap is raisable via `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`.

### 3.6 Security guidance

Verbatim warning from the hooks reference, the load-bearing one:

> "Command hooks execute shell commands with your full user permissions. They can modify, delete, or access any files your user account can access. Review and test all hook commands before adding them to your configuration."

**Workspace trust, verbatim:**

> "* **Interactive session**: Claude Code holds back hooks from every settings file, including your own `~/.claude/settings.json`, until you accept the workspace trust dialog for the folder, or for a parent directory whose trust extends to it
> * **`-p` or SDK session**: Claude Code never shows the dialog and treats the folder as trusted, so hooks committed in a repository's `.claude/settings.json` run in a folder you've never trusted"

That second bullet is the single most important security fact in this document for a curriculum: **the trust dialog that protects you interactively does not exist in headless runs.** The doc's own mitigation advice: "Before you script `claude -p` over a repository you didn't write, review its `.claude/` settings files, start with `--bare`, or turn hooks off for that run with `--settings '{"disableAllHooks": true}'`."

**Best practices list, verbatim:**

> * **Validate and sanitize inputs**: never trust input data blindly
> * **Always quote shell variables**: use `"$VAR"` not `$VAR`
> * **Block path traversal**: check for `..` in file paths
> * **Use absolute paths**: specify full paths for scripts. In exec form, use `${CLAUDE_PROJECT_DIR}` and the path needs no quoting. In shell form, wrap it in double quotes
> * **Skip sensitive files**: avoid `.env`, `.git/`, keys, etc.

**Enterprise control:** `allowManagedHooksOnly` exists and "Your user, project, local, and plugin hooks are blocked."

**HTTP hooks** are gated by allowlists: "when defined at any settings level, Claude Code runs an HTTP hook handler only if its URL matches the merged allowlist" (`allowedHttpHookUrls`), and "Claude Code interpolates only the environment variables on that list into hook headers" (`httpHookAllowedEnvVars`).

**Shell injection caveat, verbatim:** "Header values support environment variable interpolation using `$VAR_NAME` or `${VAR_NAME}` syntax. Only variables listed in the `allowedEnvVars` array are resolved; all other `$VAR` references remain empty."

**Frontmatter hooks and trust**, verbatim: "Frontmatter hooks in a project skill follow the same workspace trust rule as hooks in settings files. Claude Code registers them when you or Claude invoke the skill, including in a `-p` run in a folder you haven't trusted." And for subagents it is stricter: "Frontmatter hooks in a project subagent run only after you accept the workspace trust dialog for the folder the agent file came from. A `-p` session doesn't count as accepting it."

**Injection defence for shell-form hooks, verbatim from the troubleshooting section:** "If your hook prints valid JSON, but the decision doesn't take effect and no error appears in the transcript." Cause: "something else writes to stdout first, usually an unconditional `echo` in your shell profile, so the output no longer starts with `{`". Also: "When your hook returns `permissionDecision` or `additionalContext` at the top level instead of inside `hookSpecificOutput`, the JSON still parses, and Claude Code ignores the misplaced fields without reporting an error."

### 3.7 `once` and hooks in skills

Source: hooks reference. Status: **verified from primary source**.

`once`, verbatim from the common-fields table: "**`once`** | no | If `true`, Claude Code removes the hook after its first successful run. A run that fails, blocks with exit code 2, or times out leaves the hook in place, so it runs again on the next matching event. Only honored for hooks declared in [skill frontmatter]; ignored in settings files and agent frontmatter"

That last clause is the trap: **`once` does nothing in `settings.json`.** A curriculum must not teach `once` as a general hook option.

**Hooks in skills and agents, verbatim:**

> "* **Subagent hooks**: Claude Code runs them only while that subagent is running and removes them when it finishes. Claude Code converts a `Stop` hook here to `SubagentStop`, the event it fires when a subagent completes.
> * **Skill hooks**: Claude Code registers them when you or Claude invoke the skill and keeps running them for the rest of the session, on turns after the skill's own turn as well. To have Claude Code remove a hook after its first successful run instead, set [`once: true`] on it."

YAML form, as read:

```yaml
---
name: secure-operations
description: Perform operations with security checks
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
---
```

### 3.8 Where hooks are declared

Verbatim table, confirmed identically on both pages:

| Location | Scope | Shareable |
| - | - | - |
| `~/.claude/settings.json` | All your projects | No |
| `.claude/settings.json` | Single project | Yes |
| `.claude/settings.local.json` | Single project | No |
| Managed policy settings | Organization-wide | Yes, admin-controlled |
| Plugin `hooks/hooks.json` | When plugin is enabled | Yes |
| Skill frontmatter | Rest of session once invoked | Yes |
| Subagent frontmatter | While that subagent is running | Yes |

**Hooks merge, they do not override.** Verbatim: "Hook entries merge across settings levels rather than replacing each other: user, project, and local settings add their own hooks without removing managed ones, and the [`disableAllHooks`] setting can't disable managed hooks from outside managed settings." Contrast with skills and subagents, which "override by name" (features overview, verbatim).

Escape hatch, verbatim: `disableAllHooks: true`, with the reach caveat: "Claude Code reads the value left after settings precedence applies, so a project's settings file can override yours. Hooks configured in managed settings still run unless `disableAllHooks` is also set there."

Also confirmed: "All matching hooks run in parallel. If you define the same handler in more than one settings file, it runs once. A plugin's or skill's copy of the same handler stays separate."

---

## 4. What this supports in a curriculum

1. **Distinguishing context from control.** The single most transferable idea: instruction files are loaded text the model reads and tries to follow; hooks are code the client runs. Everything downstream -- how you split a file, when you reach for a hook, how you review a PR that touches either -- follows from this.
2. **Choosing between `CLAUDE.md` and `AGENTS.md` as a *detection* problem, not a preference problem.** The decision rule is mechanical: does any `CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` exist at or above the working directory? Teaching only one file name produces a curriculum that silently breaks on any repo set up for another agent. The `CLAUDE.local.md` trap is the exam question.
3. **Reading and repairing a real precedence chain.** Parent directories load at launch, subdirectories load lazily, everything concatenates rather than overrides, and conflicts are resolved by the model ("may pick one arbitrarily"). That last clause is the honest answer to "why didn't my instruction apply" -- and it is a debugging skill, not trivia.
4. **Scaling instruction files without burning context.** The 200-line target, the 4 MiB skip, the `paths` glob, and the fact that `@path` imports organise but do *not* defer loading. A learner who thinks `@import` saves tokens will build a file that quietly costs them on every request.
5. **Portability as a first-class design goal.** `AGENTS.md` for instructions and `SKILL.md` for capabilities is the cross-tool pattern; `SKILL.md` is an open standard with a long published client list. A curriculum that teaches a vendor-locked filename teaches the wrong instinct.
6. **Writing a hook that blocks, and one that does not.** Exit codes, `permissionDecision` values, `decision: "block"` for the events that use it, and the merge order `deny` > `defer` > `ask` > `allow`. Including the exit-0 non-approval subtlety, because a hook that "succeeded" has not approved anything.
7. **Picking the right event.** Thirty-three events is a reference table, not knowledge. The teachable subset is roughly: `PreToolUse` (gate), `PostToolUse` (react), `UserPromptSubmit` (inject), `SessionStart` (environment), `Stop` / `SubagentStop` (turn end), `PreCompact` / `SessionStart`+`compact` (survive compaction), `Notification` (attention), `InstructionsLoaded` (debug instruction loading). Everything else is lookup.
8. **Scope declarations and merging semantics.** Hooks merge across settings levels; skills and subagents override by name. Conflating these two is how people end up with a `once: true` that silently does nothing in `settings.json`.
9. **Security review as a first-class competency.** A hook is arbitrary code with the user's full permissions, gated by a workspace-trust dialog that **does not appear in `-p` or SDK runs**. Any curriculum that teaches hooks must teach that asymmetry, the `allowedHttpHookUrls` / `httpHookAllowedEnvVars` allowlists, `allowManagedHooksOnly`, and the quoted-variable / path-traversal hygiene list.
10. **Version awareness as a professional habit.** `AGENTS.md` needs v2.1.277+ and is only fully reliable from v2.1.281. `once` is skill-frontmatter-only. `agent` hooks are experimental. These are the kind of facts a teaching phase should date-stamp rather than state flatly, because they change.

---

## 5. What remains open

Genuinely unsourced or partially sourced. Nothing below was read in a fetched document.

1. **A cross-vendor specification for `AGENTS.md` itself.** I read the Claude Code side (that it is read, and how). `agentskills.io` documents the *skills* format, not an `AGENTS.md` standard. Any claim about who else reads `AGENTS.md`, or a governing spec, is **could not verify** from what I fetched.
2. **Exact `AGENTS.md` blob semantics under `claude-md-and-agents-md` beyond what memory.md states.** The doc gives the ordering rule ("each directory's `CLAUDE.md` files first and its `AGENTS.md` after them") and the dedup rule, but I did not fetch `sub-agents.md#what-loads-at-startup` in full, so the complete subagent-side interaction between `AGENTS.md` and `omitClaudeMd` is not fully mapped.
3. **Per-event exit-code-2 semantics.** The hooks guide explicitly defers: "Some events can't be blocked: for `SessionStart` and others, exit 2 shows stderr to the user and execution continues. See [exit code 2 behavior per event] for the full list." I did not fetch that subsection. Which events can and cannot be blocked is therefore **partially verified**: I can confirm exit 2 blocks *on the events the guide demonstrates*, not that it blocks on all of them.
4. **The complete `JSON output` schema per event.** Same deferral. I confirmed the `PreToolUse`, `PermissionRequest`, `UserPromptSubmit`, and top-level `decision: "block"` shapes from examples, plus the existence of `additionalContext`, `systemMessage`, `reason`, and `stopReason`. I did not read the reference's per-event decision-control table in full, so **do not** treat my field list as exhaustive.
5. **`async` / `asyncRewake` / `CLAUDE_ENV_FILE` / `watchPaths` semantics.** These appear in field tables and passing references in what I fetched. The dedicated `Run hooks in the background` and `Persist environment variables` sections were not read. **Partial.**
6. **`disableAllHooks` full reach across all five settings tiers.** The docs say it "can't disable managed hooks from outside managed settings" and point to a separate settings-reference section I did not fetch.
7. **`HTTP response handling` and `allowedHttpHookUrls` exact merge algorithm.** Confirmed the keys exist and their one-line semantics; the merge procedure was deferred to the settings reference.
8. **Current Claude Code version string.** The docs name many specific versions (v2.1.277, v2.1.281, v2.1.283 for AGENTS.md-related behaviour) but I did not fetch the changelog to establish what the current release is. **Could not verify.**
9. **Anything about `CLAUDE.md` size *warnings* thresholds.** I confirmed a 200-line recommendation and a 4 MiB skip, and that a warning appears at startup and in `/status`, including a combined limit across multiple files -- but the **numeric combined limit was not stated** in what I read. **Could not verify.**
10. **Cost and performance figures for hooks.** Not attempted; not present in the pages read.

### Claims I hold with least confidence

Stated plainly, per the verification discipline:

- **The count of thirty-three lifecycle events.** Every individual name was read in the fetched text, but "thirty-three" is my arithmetic on the table, not a number the docs state. If a phase says "33 events", that number is mine, not Anthropic's.
- **The `.claude/` directory contents.** The explorer page returns its content as a JavaScript component. I read the data literal inside it, which is legitimate source text, but the page is generated rather than hand-written prose. I marked every entry `verified from primary source` because I read the strings; a reviewer should know the strings are literals in a component, not narrative.
- **Matcher value lists for `Notification` and `StopFailure`.** Long lists read verbatim, but the guide also notes several require specific minimum versions (v2.1.198, v2.1.234, v2.1.246, v2.1.248) which are scattered across paragraphs rather than tabulated. I did not attempt to build a complete version-to-value mapping.
- **The "hook vs skill" one-liner quoted in section 1** comes from `features-overview.md`, which I fetched but did not scrutinise with the same care as the two pages the brief named. It is accurate as far as I read it.
