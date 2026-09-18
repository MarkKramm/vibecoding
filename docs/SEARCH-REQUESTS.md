# SEARCH REQUESTS — for the human to relay

**Why this file exists.** `web_search` is currently **off** on this machine — but, a
correction to what this file previously claimed, it is **not impossible**. It is a
configuration problem with a known fix.

The shipped provider (`dsh-web-search-deepseek`) is purpose-built for **DeepSeek's own
search**: its built-in default endpoint is `https://api.deepseek.com/anthropic/v1`, and
DeepSeek's Anthropic-compatible API supports the server-side `web_search` tool. What
breaks it is that `settings.yaml` → `web-search-deepseek.baseURL` points at the
Singularity beta instead, which does not serve `/v1/messages`.

**To turn it on**, two steps, both the user's:

1. Put a **valid** DeepSeek key in the credential store as `DEEPSEEK_API_KEY`.
2. Set `settings.yaml` → `web-search-deepseek.baseURL` to
   `https://api.deepseek.com/anthropic/v1`, then run one search. A **404** means the
   URL is wrong; a **401** means the key is.

Cost is roughly **$0.001 per search** — about 3k input and 1k output tokens on
`deepseek-flash` at off-peak rates — so a few dollars covers years at this project's
usage rate.

**Meanwhile `web_fetch` works, and it is the better default anyway:** an arXiv abstract
page or an official pricing page is authoritative where a search snippet is not. Use
this file only for what `web_fetch` genuinely cannot reach — questions where you do not
already know which URL holds the answer.

**How to use it.** The agent writes questions under "OPEN REQUESTS". The human
pastes the whole block into DeepSeek chat (or any assistant with live search),
copies the answer back under "ANSWERS", and the agent reads it on the next turn.

**Rules for the agent:**
- Only ask what `web_fetch` genuinely cannot reach. If a URL is known or guessable,
  fetch it directly — do not spend a human round-trip on it.
- Number every request. One question per numbered item, phrased so a single search
  can answer it.
- State the claim being checked and the file it lives in, so the human can see why
  it matters.
- Never treat an answer in this file as verified until it names a source. An
  answer without a URL is a lead, not a fact.
- When an answer resolves a request, move it to "RESOLVED" with the source URL.

---

## OPEN REQUESTS

*(none right now — see RESOLVED below for the shape of a good request)*

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
