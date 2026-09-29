# Research: sandboxing and approval defaults, wider sample (Windsurf, Cline, Aider, OpenHands)

**Summary: the finding survives, and it gets sharper.** The "no two agree" result from
`docs/RESEARCH-PERMISSIONS-2026-09-29.md` was drawn from six tools that mostly advertise their
safety story. Widening the sample to four more produces a second kind of disagreement, not just a
fourth variant of the first: two of these four publish a permission model with no stated default
(Windsurf's Cascade, Cline), one publishes a container default and an explicit "unsafe" escape
hatch (OpenHands), and one publishes **no sandbox story at all** and instead documents a single
blanket kill switch (aider's `--yes-always`). On the question this corpus actually cares about —
native Windows — the wider sample is **no better than the original six**: not one of these four
states a native Windows sandbox. Three of the four do not even publish a sandbox default in
readable prose, and one (Windsurf) publishes its permissions model under a different product name
than the one people search for.

That last point is not trivia. `docs.windsurf.com/llms.txt` is titled "Windsurf Docs" and indexes
Cascade as Windsurf's own agent, while the same host's root serves a site branded
**Devin Desktop**. More precisely, and verified against `windsurf/terminal.md`: *"Auto-execution
levels apply to Cascade. The Devin Local agent replaces them with its own permissions model, which
controls command execution with allow, ask, and deny rules instead."* So **Windsurf ships two
different permission models and which one you get depends on which agent is active.** A reader
who searched "Windsurf sandbox permissions" and landed on the Devin Local page would have concluded
Cascade had a declarative deny/ask/allow model with OS-level sandboxing and session-wide grants.
Those are the **Devin Local agent's** properties. Cascade's own model is a four-level
auto-execution ladder — Disabled, Allowlist Only, Auto, Turbo — plus allow and deny lists where
**the denylist takes precedence**, the same precedence rule Cursor documents. Anyone writing a
lesson from a single fetch of that page would have merged two products.

Dates are read dates. Defaults change with releases.

---

## Comparison

| Tool | Sandbox default | Native Windows sandbox | Approval default |
|---|---|---|---|
| **Windsurf / Cascade** | **Not stated** — four auto-execution levels offered, shipped selection not published | Not stated | Not stated — level ladder defaults to "all commands require manual approval" as the lowest rung, but which rung ships is not published |
| **Windsurf / Devin Local** (successor agent, same docs site) | **Opt-in** — "When enabled" | Not stated | Not stated; MCP is the one documented exception and its default *is* stated |
| **Cline** | **Not stated** — no sandbox page exists in the docs index | Not stated | Not stated for the extension; the SDK states a default and it is permissive |
| **Aider** | **None published** — containerisation is a docker image you launch yourself | Not stated | Not stated in prose; a documented blanket override exists |
| **OpenHands** | **On by default** — Docker sandbox, `RUNTIME=docker` | Not stated (Docker on Windows not discussed) | Not stated for the product; the SDK offers three named policies |
| *existing six (for contrast)* | two on, three off/opt-in, one split by platform | Codex only | prompt-first in all six |

Read the Windows column before the first one. Nine tools surveyed, and **Codex remains the only
one with a published native Windows sandbox.**

---

## 1. Windsurf — Cascade and the Devin Local agent

- **Vendor and product.** Cognition (Codeium lineage). Windsurf Editor; the agent inside it is
  Cascade. As of this read, the same docs site also documents a successor agent, "Devin Local",
  which is described as the same harness as Devin CLI.
- **Source URLs.**
  - `https://docs.windsurf.com/llms.txt` (documentation index)
  - `https://docs.windsurf.com/windsurf/terminal.md` (auto-execution levels, allow/deny lists)
  - `https://docs.windsurf.com/windsurf/cascade/cascade.md` (Cascade overview)
  - `https://docs.windsurf.com/windsurf/devin-local.md` (Devin Local agent: sandboxing and permissions)
- **Verification status.** `verified from primary source`.
- **Date read.** 2026-09-29.
- **Sandbox default.** Cascade: **not stated**. Cascade's control surface is an auto-execution
  level, not a sandbox; the page describes no sandbox for Cascade at all. Devin Local:
  **opt-in** — sandboxing is described as conditional on being enabled.
- **Native Windows sandbox support.** **Not stated.** The editor downloads for Windows; the
  sandboxing section says "OS-level sandboxing" without naming platforms.
- **Approval default.** Cascade: **not stated**. Four levels are offered and the shipped selection
  is not published. The lowest, Disabled, is described as "All commands require manual approval
  before execution", which is the conservative end of the ladder, but naming it the default would be
  an inference from a menu, not a sourced fact. Devin Local: **not stated** for general actions;
  the MCP default *is* stated and is prompting.
- **Enforcement mechanism.** Cascade: a command-pattern allow/deny list plus a level. Devin Local:
  OS-level sandbox with filesystem isolation and network filtering. The specific OS primitives are
  not named.
- **Permission / grant language.** A level ladder for Cascade (Disabled, Allowlist Only, Auto,
  Turbo); a declarative three-rule priority system for Devin Local — **Deny** beats **Ask** beats
  **Allow** — scoped to file reads, file writes, command execution, HTTP fetches and MCP tools, with
  glob rules such as `Read(**/*.pem)`. Admins can set an org-wide *maximum* auto-execution level,
  below which members may choose freely.
- **Session or persistent grant broader than the individual action.** **Yes, explicitly, and in
  three shapes**: a persistent team-wide allowlist or denylist; an "always-allow" response on a
  permission card; and a session-wide grant that applies to the root agent *and its subagents*.
  MCP grants are separately offered "either for the current session or permanently", and enterprise
  admins can default-allow specific MCP servers or tools.
- **Load-bearing quotes.**

  > | **Disabled** | Auto-execution is completely disabled. All commands require manual approval before execution. |

  > The Devin Local agent supports OS-level sandboxing. When enabled, the sandbox enforces:

  > **Session-wide grants** — an approval you grant for the session applies to every later request in that session, so the root agent and its subagents don't re-prompt for a scope you already granted.

  > Unlike Cascade, the default configuration of the Devin Local agent prompts for approval before calling any MCP tool.

- **Note on the merge hazard.** Cascade and Devin Local are documented side by side and the Devin
  Local page explicitly contrasts itself with Cascade. **Correction, verified against the
  primary source: Cascade is NOT deprecated and its full documentation tree is still live in
  `llms.txt`.** The accurate and more interesting statement is narrower: the Devin Local agent
  *replaces* Cascade's four-level auto-execution ladder with its own allow/ask/deny model, so
  **Windsurf ships two permission models and which one you get depends on which agent is active.**
  Quoting "Windsurf has a deny/ask/allow permission model with OS-level sandboxing" would be a
  category error sourced from a real page.

---

## 2. Cline

- **Vendor and product.** Cline (open source). Product: the Cline VS Code extension, plus a CLI and
  an SDK (`@cline/sdk`, ClineCore).
- **Source URLs.**
  - `https://docs.cline.bot/llms.txt` (documentation index)
  - `https://docs.cline.bot/features/auto-approve.md`
  - `https://docs.cline.bot/sdk/guides/permission-handling.md`
- **Verification status.** `verified from primary source`.
- **Date read.** 2026-09-29.
- **Sandbox default.** **Not stated — and there is no sandbox page.** The index was searched for
  sandbox, Seatbelt, bwrap and container terms; the only hits were unrelated (AWS IAM, "sandboxed
  environments" appearing inside a code sample). Cline's documentation is entirely about approval,
  not containment. Absence of a sandbox page is a real finding, but it is evidence about the
  *documentation*, not proof that no containment exists in the product.
- **Native Windows sandbox support.** **Not stated** — consistent with there being no sandbox
  feature described at all.
- **Approval default.** Extension: **not stated**. The docs give a *recommended* setup ("Enable
  **Read project files** ... Leave edits, commands, browser, and MCP off") but never declare the
  shipped state of those toggles. SDK: **stated, and permissive** — an unlisted tool defaults to
  enabled and auto-approved.
- **Enforcement mechanism.** **None.** No OS-level containment is described. The safety argument is
  per-tool-call gating, and safety-versus-danger classification is delegated to the model.
- **Permission / grant language.** A category-toggle matrix in the extension (Read project files,
  Read all files, Edit project files, Edit all files, Execute safe commands, Execute all commands,
  Use the browser, Use MCP servers), with an "all files" variant that is inert unless its base
  toggle is on. In the SDK, a declarative `toolPolicies` object: `{ autoApprove: true }`,
  `{ autoApprove: false }`, `{ enabled: false }`, or absent.
- **Session or persistent grant broader than the individual action.** **Yes, in two shapes.** The
  toggle settings are persistent configuration, and their scope is categorical and system-wide —
  "All file operations anywhere on your system" is what YOLO mode grants. On top of that, the SDK
  lets an integrator supply a programmatic approval handler, which is unbounded by design:
  `requestToolApproval: async () => ({ approved: true })`.
- **Load-bearing quotes.**

  > Cline does not use a fixed allowlist. The model marks each command with a `requires_approval` flag based on the command and arguments. These are examples, not guarantees.

  > | No policy set | Defaults to enabled and auto-approved |

  > YOLO mode disables all safety checks. Cline executes whatever it decides without asking permission.

  > When you use the in-chat `/run` command, it will be running shell commands inside the docker container.

- **The sharpest thing in this pass.** Cline's own docs instruct the integrator, when
  auto-approving everything, to do it only where "the agent's actions are either sandboxed or fully
  trusted" — and then describe a one-line handler that approves everything. The vendor documents a
  containment precondition for a configuration whose entire effect is to remove the gate. If no
  sandbox exists, the remaining option is "fully trusted", which is the same as no gate.

---

## 3. Aider

- **Vendor and product.** Aider AI (Paul Gauthier). Open source. Product: the `aider` CLI.
- **Source URLs.**
  - `https://aider.chat/docs/` (documentation index, read via the rendered nav)
  - `https://aider.chat/docs/config/options.html` (`--yes-always`)
  - `https://aider.chat/docs/install/docker.html`
  - `https://aider.chat/docs/usage/lint-test.html`, `https://aider.chat/docs/git.html`
- **Verification status.** `verified from primary source`.
- **Date read.** 2026-09-29.
- **Sandbox default.** **None published.** Aider's documentation contains no sandbox concept. The
  only isolation mechanism on offer is running aider inside a published docker image, which is a
  distribution decision by the user, not a setting. Note the docs say containerised aider cannot
  reach the host audio device and that `/run` executes inside the container — isolation is presented
  as a limitation to work around, never as a protection to enable.
- **Native Windows sandbox support.** **Not stated**, and **no** is the accurate reading: there is
  no sandbox feature to support. Aider itself runs on Windows; nothing confines it.
- **Approval default.** **Not stated in prose.** The docs confirm confirmations exist — a sample
  transcript shows `Add the output to the chat? y` — and confirm the option to suppress all of them,
  but no page declares what ships enabled.
- **Enforcement mechanism.** **None.** Aider runs in the user's own shell with the user's own
  privileges. Its only default mitigations are conservative and are worth naming because they are
  real: it commits every change to git, it pre-commits pre-existing dirty files before editing them,
  and it commits and attributes those commits to `(aider)`.
- **Permission / grant language.** A single binary, not a matrix — `--yes-always`, environment
  variable `AIDER_YES_ALWAYS`. Everything else is scope narrowing rather than permission granting:
  `--read FILE` marks a file read-only, `--no-auto-commits`, `--no-auto-lint`, `--no-git`.
- **Session or persistent grant broader than the individual action.** **Yes — the broadest in the
  whole nine-tool sample.** One flag, and it is not scoped to an action, a tool, a path or a
  session. It is a process-lifetime and command-lifetime blanket, "Always say yes to every
  confirmation". There is no documented intermediate: no per-directory rule, no per-command
  allowlist, no deny list.
- **Load-bearing quotes.**

  > `--yes-always` — Always say yes to every confirmation

  > Whenever aider edits a file, it commits those changes with a descriptive commit message. This makes it easy to undo or review aider's changes.

  > Aider takes special care before editing files that already have uncommitted changes (dirty files). Aider will first commit any preexisting changes with a descriptive commit message.

- **On that last quote.** Git is not a sandbox and must not be presented as one. It bounds damage
  by making edits reversible; it does not stop `curl | sh`, and aider's `/run` command and
  `--test-cmd` execute arbitrary shell commands with full user privilege.

---

## 4. OpenHands

- **Vendor and product.** OpenHands (All Hands AI). Open source. Products: the OpenHands platform
  (V1 Web App / CLI) and the separate OpenHands Software Agent SDK.
- **Source URLs.**
  - `https://docs.all-hands.dev/llms.txt` (documentation index)
  - `https://docs.openhands.dev/openhands/usage/sandboxes/overview.md`
  - `https://docs.openhands.dev/openhands/usage/sandboxes/docker.md`
  - `https://docs.openhands.dev/openhands/usage/sandboxes/process.md`
  - `https://docs.openhands.dev/sdk/guides/security.md`
  - `https://docs.openhands.dev/openhands/usage/advanced/configuration-options.md`
- **Verification status.** `verified from primary source`.
- **Date read.** 2026-09-29.
- **Sandbox default.** **On by default**, and the only tool in this pass that states it plainly:
  Docker, with `RUNTIME=docker` given as the default and Docker called "the default and
  recommended option for most users". The escape hatch is labelled unsafe in the vendor's own words.
- **Native Windows sandbox support.** **Not stated.** Docker Desktop provides a Windows container
  backend, but the docs never discuss it, and the documented launcher is
  `openhands serve --mount-cwd` with no platform qualification. Do not fill this cell with an
  assumption.
- **Approval default.** **Not stated for the product.** The *SDK* publishes three named policies —
  `AlwaysConfirm()`, `NeverConfirm()`, `ConfirmRisky()` — but no page declares which the Web app or
  CLI ships with. A security analyzer assigning risk levels is documented alongside them, so
  `ConfirmRisky()` is plausible as the shipped default; that would be a guess and is not recorded
  as one.
- **Enforcement mechanism.** Docker containers. Also documented: Apptainer (rootless, for HPC) and
  a remote provider. Writable scope is the mount set — the docs warn that anything mounted
  read-write into `/workspace` "can be modified by the agent".
- **Permission / grant language.** Two orthogonal layers, named explicitly. **Confirmation policy**
  (always / never / risky-only), settable on a `Conversation`, with a custom handler
  `requestToolApproval` equivalent via `reject_pending_actions`. **Security analyzer**, which assigns
  risk levels to actions. This is the closest any of the nine tools comes to separating the
  "what can it technically do" question from the "when must it ask" question — the same split the
  existing survey attributes to Codex's two named layers.
- **Session or persistent grant broader than the individual action.** **Partially — and this is a
  genuine "not stated".** A custom confirmation handler is arbitrary user code and therefore
  unbounded by construction, but **the documentation does not describe any session-scoped or
  persistent "always allow" grant the way Windsurf, Claude Code, Copilot CLI and Antigravity all
  do.** Batch confirmation is granted per `get_unmatched_actions` call, which suggests a group
  rather than a standing rule. Treat this as open.
- **Load-bearing quotes.**

  > * **Docker sandbox (recommended)**
  >   * Runs the agent server inside a Docker container.
  >   * Good isolation from your host machine.

  > * `RUNTIME=docker` (default)

  > This mode provides **no sandbox isolation**. The agent can read/write files your user account can access and execute commands on your host system.

  > Available policies:
  > * **`AlwaysConfirm()`** - Require approval for all actions
  > * **`NeverConfirm()`** - Execute all actions without approval
  > * **`ConfirmRisky()`** - Only require approval for risky actions (requires security analyzer)

- **Note on terminology drift.** The docs are mid-migration: V1 user-facing prose says "sandbox"
  while the configuration knob is still `RUNTIME`. A reader comparing V0 and V1 pages will find two
  names for one thing, and legacy pages were deliberately excluded from the LLM index. Any corpus
  claim about OpenHands should name the version.

---

## What this supports in the corpus

1. **The "no two agree" finding holds, and the wider sample splits into two distinct kinds of
   disagreement.** The original six disagree about *defaults*. These four mostly disagree about
   *whether a default is a thing worth publishing*. Windsurf and Cline document a permission model
   and leave the shipped state unspecified; aider publishes a kill switch and no model; OpenHands
   publishes the clearest sandbox default of the nine and still will not name its shipped approval
   policy. Absence of a stated default is now a third category alongside on and off, and it is
   common enough to be its own lesson.

2. **Nine tools surveyed, Codex is still the only one with a published native Windows sandbox.**
   Not one of these four adds a Windows row. OpenHands comes closest by way of Docker, and the docs
   never say so. A curriculum item that says "sandbox it" is still unusable on native Windows for
   the large majority of the tools it could name.

3. **The standing-grant risk generalises, and aider is the extreme case.** Claude Code, Copilot
   CLI and Antigravity persist broad grants; Windsurf offers session-wide grants that extend to
   subagents plus permanent MCP grants; Cline offers categorical system-wide toggles plus an
   SDK escape hatch; and aider collapses the whole axis into one binary flag with no intermediate
   scope at all. The pattern is consistent enough to state as a rule: **wherever a persistent grant
   exists, it is at least as broad as the action that created it, and nobody ships a durable grant
   narrower than the action.** Aider's `--yes-always` is the cleanest teaching example in the set
   because there is nothing else to analyse.

4. **Confirmation and containment are documented by different teams and rarely in the same
   breath.** Windsurf's Cascade page documents a command ladder and no sandbox; its Devin Local
   page documents a sandbox and a full permission model and points away from Cascade. Cline
   documents approval exhaustively and sandbox not at all. Aider documents neither and relies on
   git. OpenHands is the only tool in the nine whose docs make containment the default rather than
   a bolt-on — and it still declines to state its approval default.

5. **Documentation correctness is now a first-class hazard in this corpus, not a footnote.** Two
   pages in the previous pass returned HTTP 200 carrying only site chrome. In this pass,
   `docs.windsurf.com` served a site branded Devin Desktop at its root, while the same host's index
  still documents Cascade as Windsurf's own agent with a different model, so a
   confident, well-formed, entirely wrong answer about "Windsurf's permission model" was available
   to anyone who read one page and stopped. The vendor's own index explicitly warns that legacy
   docs exist in a separate section. Any lesson built on vendor documentation needs the product
   name, version and doc-section checked, not just the URL.

6. **Git commits, dirty-file pre-commits, `(aider)` attribution and undo are recovery, not
   containment.** Aider's docs make reversibility look like safety, and it is genuinely valuable —
   but none of it stops a destructive shell command. The corpus should say "recoverable" when it
   means reversible and "contained" when it means confined. Conflating them is how a reader ends up
   believing aider is sandboxed.

---

## What remains open

Every item below was searched for and not found in primary documentation on 2026-09-29. Each is
recorded as an open question, not filled by inference.

**Windsurf**
- Which auto-execution level Cascade ships with. The ladder is documented; the default is not.
- Whether Cascade has any sandbox at all. No page describes one.
- Whether Devin Local's OS-level sandbox supports native Windows, and what the OS primitives are.
- Whether Devin Local's sandbox is on by default for individual users (the org-wide *enforcement*
  setting is documented; the per-user default is not).
- The rule syntax for Devin Local permissions beyond the single `Read(**/*.pem)` example, and the
  canonical page it links to (`/cli/reference/permissions`) was not fetched.

**Cline**
- Whether Cline has any containment feature at all. The documentation index has no sandbox page;
  that is an absence of documentation, not proof of absence.
- The shipped default state of every Auto Approve toggle in the extension. The docs give a
  recommendation, never a default.
- Any Windows-specific behaviour.

**Aider**
- The default approval behaviour, in prose. Confirmations are demonstrated and `--yes-always` is
  documented; no page states what is enabled out of the box.
- Whether aider ships or documents any sandboxing. No sandbox concept appears anywhere in the docs
  read.
- Windows-specific behaviour.
- The precise scope and lifetime of `--yes-always` — process, session and repo were not stated.

**OpenHands**
- Which confirmation policy the V1 Web App and CLI ship with. Only the SDK's three policies are
  documented.
- Windows sandbox support, and whether Docker Desktop is a supported configuration.
- Whether OpenHands has a session-scoped or persistent "always allow" grant, and if so how broad it
  is. Not described.
- Which security analyzer risk thresholds are used in practice.
- Whether the Docker sandbox is the default in the managed cloud product as well as self-hosted.

**Cross-cutting**
- The Devin CLI row in the existing survey and this pass's Windsurf/Devin Local row describe the
  same harness across two doc sites. They were not reconciled against each other here, and the
  duplicate should be resolved before either is cited alongside the other.
- No version numbers, release numbers or dates were recorded for any of these four tools. The docs
  pages fetched carry no version banner; only the read date is known.
