# SEARCH REQUESTS — for the human to relay

**Why this file exists.** `web_search` is **deliberately OFF** on this machine, by the
user's decision on 2026-09-19. The provider is correctly configured and it *works* — it
was fixed earlier this session and answered real queries. It is off because **the DeepSeek
account balance went negative** during a research subagent run, and the user does not want
further spend on it. A 402 (Insufficient Balance) is what a search now returns.

**This is a budget decision, not a defect.** Do not "fix" it by re-enabling search, and do
not diagnose the configuration — the configuration is right. The correct behaviour is to
write requests into this file instead.

**What still works, and is free.** Only `web_search` was routed through DeepSeek. These do
not touch that key and remain available:

- `web_fetch` — a separate `http` provider. Use it freely on any URL you already know.
- `grep`, `glob`, `read`, `pwsh` — local, no network at all.

**So the rule is: fetch if you know the URL, ask the human only if you do not.** That is
strictly better practice anyway — an arXiv abstract or an official pricing page is
authoritative where a search snippet is not, and this project has already been burned by
treating a snippet as evidence.

**⚠️ The cost estimate that used to be printed here was wrong, or at least incomplete.**
It said "roughly $0.001 per search… a few dollars covers years". Reading the provider
source, one search request really is tiny — the body is literally
`{"text": "Perform a web search for the query: <q>"}` with `max_tokens: 4096` and
`max_uses: 5`, so roughly 30 input tokens. **Yet the balance still went negative in a
single session.** The honest conclusion is that the per-search figure was measured against
*my* searches and did not account for a subagent running dozens of fetches across three
nested agents, each with an independent context. Do not repeat the confident "years of
use" claim: the observed cost per session was two orders of magnitude above it.

**How to use it.** The agent writes questions under "OPEN REQUESTS". The human
pastes the whole block into Gemini Pro, DeepSeek web chat, or any assistant with live
search, copies the answer back under "ANSWERS", and the agent reads it on the next turn.

**Rules for the agent:**
- Only ask what `web_fetch` genuinely cannot reach. If a URL is known or guessable,
  fetch it directly — do not spend a human round-trip on it.
- **Do not call `web_search`.** It is off by decision and will return 402.
- Number every request. One question per numbered item, phrased so a single search
  can answer it.
- State the claim being checked and the file it lives in, so the human can see why
  it matters.
- Never treat an answer in this file as verified until it names a source. An
  answer without a URL is a lead, not a fact.
- When an answer resolves a request, move it to "RESOLVED" with the source URL.
- **Subagents must be told this too.** A subagent that is not told will search, spend,
  and may spawn further agents. Every research delegation carries the delegation bound.

---

## OPEN REQUESTS

**Paste the block below into Gemini Pro / DeepSeek web chat.** Answers go under
"ANSWERS" with a source URL for each. Anything without a URL is a lead, not a fact.

---

### For vibecoding phases 6, 7 and 8 (asked 2026-09-19)

I am writing lessons that must be accurate as of **2026-09**. For each question, please
give the answer **and a source URL**. If you cannot find a reliable source, say so
plainly rather than estimating — "I could not verify this" is a useful answer and a
plausible guess is not.

1. **Coding-agent context limits as of 2026-09.** For the main AI coding agents —
   Claude Code, OpenAI Codex, GitHub Copilot's agent mode, Google Antigravity, Cursor,
   Devin Desktop (formerly Windsurf) — what context window does each use, and are the
   numbers published? I specifically want to know which vendors *do not* publish them.

2. **What a coding agent does NOT do by default.** When an agent is given a task and runs
   unattended, what does it typically do without asking — run tests, install packages,
   edit files outside the requested scope, make network calls, commit, push? I want
   documented default behaviour and permission prompts, per tool, with URLs.

3. **Sandboxing and approval defaults.** Which coding agents run commands in a sandbox by
   default, which ask for approval per command, and which run with full user permissions?
   This is for a lesson on bounded tasks. Official docs preferred.

4. **The "prompt injection via repository content" risk in coding agents.** Are there
   documented incidents, vendor advisories, or research papers where malicious content in
   a repo (a README, an issue, a dependency's file) caused a coding agent to take an
   unwanted action? I need primary sources, not blog commentary.

5. **Git as an agent safety net — the specific practices.** Is there authoritative
   guidance (vendor docs, or well-known engineering write-ups) recommending committing
   before an agent run, or reviewing diffs rather than summaries? I want to cite something
   real rather than assert it.

6. **Agent-generated commit messages and summaries.** Is there any study or documented
   case of an agent's summary of its own work being inaccurate — i.e. claiming more
   verification than it performed? Primary sources preferred.

7. **Security review of AI-generated code specifically.** Beyond package hallucination
   (which I have: arXiv 2406.10279), what does the research or vendor guidance say about
   *other* security defects over-represented in generated code — injection, hardcoded
   secrets, missing authorisation, weak crypto? Papers or official advisories with URLs.

8. **Licence and IP status of AI-generated code as of 2026-09.** Do the major vendors
   (GitHub, Google, Anthropic, OpenAI) indemnify users for copyright claims, and does that
   indemnity extend to **free tiers**? I need the actual terms pages, and I need to know
   where the free tier is excluded — that distinction matters a lot to my reader.

9. **Training on free-tier code.** Confirm, with URLs, the current position for GitHub
   Copilot Free, Google Antigravity, Cursor Hobby, and Codex Free: is free-tier code used
   for training by default, and is there an opt-out? (I have a partial answer for Copilot:
   default since 2026-04-24. I need the others.)

10. **Disclosure norms for AI-assisted work.** Is there any emerging standard — employer
    policy, professional-body guidance, conference or open-source policy — on disclosing
    that code was AI-generated? I want to teach this honestly rather than invent a rule.

11. **The "publish to production" failure cases.** Are there documented, sourced incidents
    of AI-assisted code causing a real production outage or security incident? Specific
    cases with post-mortems or news coverage, not general warnings.

12. **Philippines-specific, for a $0-budget reader.** Do the free tiers named above
    (Antigravity CLI, Copilot Free, Gemini API free tier, Groq) work from the Philippines
    without a VPN or a foreign payment method? Are any region-restricted? And is there an
    authoritative summary of the **Data Privacy Act of 2012 (RA 10173)** obligations that
    would apply to someone building a small app handling personal data?

---

## ANSWERS

*(paste the assistant's replies here, per numbered item, with URLs)*

---

## RESOLVED

### 1. MCP specification revisions — RESOLVED 2026-09-18

**Asked:** Which MCP spec revisions are current, and are `2025-11-25` and
`2026-07-28` both real? What actually differs between them?

**Why:** `ai-roadmaps/agents/07-phase-mcp-and-evaluation.md` described them as
merely "dated revisions", implying a cosmetic difference.

**Answer:** Both real, and the difference is architectural, not cosmetic.
`2025-11-25` is the **stable, stateful** revision (initialize handshake,
`Mcp-Session-Id` sessions, SSE). `2026-07-28` is a **stateless** revision — no
handshake, no sessions, server→client requests via Multi Round-Trip Requests,
`roots`/`sampling`/`logging` deprecated.

**Sources:** https://modelcontextprotocol.io/specification/2025-11-25/changelog ·
https://github.com/modelcontextprotocol/modelcontextprotocol/releases/tag/2025-11-25

**Outcome:** Fixed in commit `3fd5a9b`. The phase now carries the comparison table.

---

### 2. The `2026-07-28` revision — RESOLVED 2026-09-18 (was a false alarm)

**Asked:** Is `2026-07-28` an official MCP revision or a third-party gateway's
label?

**Why this was asked:** the first source found describing it came from a
**third-party gateway's** documentation (`mcpg.dev`), not from the MCP project.
That is a weak source for a claim about an official spec, so the phase's statement
was flagged as possibly wrong.

**Answer:** `2026-07-28` **IS** an official MCP revision. Settled from the MCP
project's own release list, which is authoritative:

| Tag | Status | Published |
| --- | --- | --- |
| `2024-10-07`, `2024-11-05` | superseded | 2024 |
| `2025-03-26`, `2025-06-18` | superseded | 2025 |
| `2025-11-25` | **stable release** | 25 Nov 2025 |
| `2026-07-28` | **stable release** (RC May 2026) | 28 Jul 2026 |

Both revisions appear as non-prerelease "stable release" entries in the project's
own repository.

**Source:** https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/releases
(fetched 2026-09-18; `web_fetch` — not `web_search`)

**Outcome:** No change needed; `agents/07` is correct. **The lesson is the
method, not the fact:** `web_fetch` against an authoritative API beats a search
snippet *and* beats a plausible-looking third-party page. When a claim about an
official artifact is being checked, fetch the official artifact.

---

## FORMAT TEMPLATE

Copy this when adding a request:

```
### N. <short title>

**Asked:** <the precise question, phrased so one search answers it>

**Why:** <the claim and the file, e.g. "cost/04 says X — is that still true?">

**Answer:** <paste back here>

**Sources:** <URL — required, or it stays a lead>

**Outcome:** <what changed in the repo, with a commit if applicable>
```
