# SEARCH REQUESTS

> ## ðŸ‘‰ TO RELAY: paste [`docs/RELAY-PASTE.md`](RELAY-PASTE.md) — that file only.
>
> **Do not paste this file.** It contains agent-facing protocol and internal bookkeeping,
> and it used to be pasted whole — which failed **three times in a row**, for reasons now
> understood and recorded below under "Why the relay kept failing".
>
> `RELAY-PASTE.md` is a self-contained block written **for the web chat**, containing the
> questions and nothing else. Paste that. Bring the reply back under "ANSWERS" here.

---

## Why the relay kept failing — three defects, all in this file

The relay was attempted three times and came back with no answers each time. The cause was
not the questions. It was that this file was pasted into a web chat whose assistant then
correctly concluded it should not search.

**Defect 1 — the file instructed the reader NOT to search.** The line *"**Do not call
`web_search`.** It is off by decision and will return 402"* is addressed to **me** (the
agent). A web chat reads it as addressing **itself**, so it declined to search. This was the
fatal one, and it is the direct cause of three failed relays.

**Defect 2 — the file addressed the wrong reader.** It is written for an agent that has
`grep`, `web_fetch`, a 402 error and a filesystem. A web chat has none of those. The result
was a reply asking which of (a), (b) or (c) was intended — reasonable behaviour from a
confused reader, and entirely our fault for sending the wrong document.

**Defect 3 — the questions were buried.** 12 questions sat inside ~306 lines, roughly 170 of
which are internal bookkeeping (protocol header, my `web_fetch` log, resolved history from
earlier sessions). Even a reader who understood the task had to extract the questions from
irrelevant material.

**The fix, and the rule going forward.** Keep two documents with different audiences, and
never paste the agent's one:

| File | Audience | Contains |
|---|---|---|
| `RELAY-PASTE.md` | **The web chat** | Questions and reply instructions only |
| this file | **The agent** | Protocol, request queue, answer landing zone, history |

---

## Protocol for the agent (this file only — never paste)

**Why search is off.** `web_search` is **deliberately OFF** on this machine, by the user's
decision on 2026-09-19. The provider is correctly configured and it *works* — it was fixed
earlier and answered real queries. It is off because **the DeepSeek account balance went
negative** during a research subagent run. A 402 (Insufficient Balance) is what a search now
returns.

**This is a budget decision, not a defect.** Do not "fix" it by re-enabling search, and do
not diagnose the configuration — the configuration is right.

**What still works, and is free.** Only `web_search` routed through DeepSeek:

- `web_fetch` — a separate `http` provider. Use it freely on any URL you already know.
- `grep`, `glob`, `read`, `pwsh` — local, no network at all.

**So the rule is: fetch if you know the URL, ask the human only if you do not.** Strictly
better practice anyway — an official pricing page is authoritative where a snippet is not.

**⚠️ The cost estimate that used to be printed here was wrong.** It said "roughly $0.001 per
search… a few dollars covers years". Reading the provider source, one search request really
is tiny — the body is literally `{"text": "Perform a web search for the query: <q>"}` with
`max_tokens: 4096` and `max_uses: 5`, so roughly 30 input tokens. **Yet the balance still
went negative in a single session.** The per-search figure was measured against *my* searches
and did not account for a subagent running dozens of fetches across three nested agents, each
with an independent context. Do not repeat the confident "years of use" claim.

**Rules for the agent:**
- **Never paste this file into a chat.** Update `RELAY-PASTE.md` instead.
- Only ask what `web_fetch` genuinely cannot reach. If a URL is known or guessable, fetch it.
- **Do not call `web_search`.** It is off by decision and will return 402.
- Number every request. One question per item, answerable by a single search.
- State the claim being checked so the human can see why it matters.
- Never treat an answer as verified until it names a source. No URL means it is a lead.
- When an answer resolves a request, move it to "RESOLVED" with the source URL.
- **Subagents must be told this too**, with an explicit delegation bound.

---

## OPEN REQUESTS

**The questions now live in [`RELAY-PASTE.md`](RELAY-PASTE.md).** That file is written
for the chat and is the only thing to paste. The 12 requests below are kept as the
agent-side record — do not paste them.

### Queue: vibecoding phases 6-8 (asked 2026-09-19)

Status key: **OPEN** = needs the relay · **CLOSED** = answered with a source ·
**BLOCKED** = not reachable by any route we have.

| # | Claim it settles | Status |
|---|---|---|
| 1 | Coding-agent context windows, and which vendors withhold them | OPEN |
| 2 | What an agent does without asking, per tool | OPEN |
| 3 | Sandbox and approval defaults | OPEN |
| 4 | Prompt injection via repository content — documented incidents | OPEN |
| 5 | Git-as-safety-net authoritative guidance | OPEN |
| 6 | Evidence on agent self-reports being inaccurate | OPEN |
| 7 | Security defects in generated code beyond package hallucination | OPEN |
| 8 | Indemnity on free tiers (Anthropic CLOSED; GitHub/Google/OpenAI open) | PARTLY CLOSED |
| 9 | Training on free-tier code, per vendor | PARTLY CLOSED |
| 10 | Disclosure norms for AI-assisted work | OPEN |
| 11 | Documented production incidents from AI-assisted code | OPEN |
| 12 | Philippines availability (DPA half CLOSED via LawPhil) | PARTLY CLOSED |

The full wording of each is in `RELAY-PASTE.md` under the same numbers.
## ATTEMPTED WITH `web_fetch` — what closed, what is blocked

Run 2026-09-19, following this file's own rule (*fetch if you know the URL, ask the human
only if you do not*). **Two requests closed outright, two hard-blocked, eight genuinely need
search.** Recorded here so nobody repeats the attempts.

### CLOSED — Request 12, part 2 (Philippine Data Privacy Act)

**Source:** https://lawphil.net/statutes/repacts/ra2012/ra_10173_2012.html — the full text of
**Republic Act No. 10173**, served by the LawPhil Project (Arellano Law Foundation), signed
15 August 2012. Fetched in full, HTTP 200.

**Note on the obvious URL:** `privacy.gov.ph` (the National Privacy Commission's own site)
returns **HTTP 403 with a Cloudflare challenge** ("Just a moment..."). **LawPhil is the
workaround and it is better for citation anyway** — it is the statute text itself rather than
a summary of it.

The four obligations that actually bind someone building a small app:

- **S.20(f) — breach notification, mandatory.** The controller *"shall promptly notify the
  Commission and affected data subjects"* when personal information *"reasonably believed to
  have been acquired by an unauthorized person"* and likely to give rise to *"a real risk of
  serious harm"*. The notification must describe the nature of the breach, the data possibly
  involved, and the measures taken. Delay is permitted only to determine scope, prevent
  further disclosure, or restore system integrity.
- **S.30 — concealing a breach is itself a crime.** 1 year 6 months to 5 years and a fine of
  Php500,000“1,000,000 for anyone who, knowing of a breach and of the S.20(f) duty,
  *"intentionally or by omission conceals"* it. **This is the clause that makes logging and
  silence the wrong strategy**, and it is the most useful thing in the whole Act for a
  developer.
- **S.12 — processing needs a lawful basis**, one of six: consent, contract, legal
  obligation, vital interests, public order/authority, or legitimate interests.
- **S.13 — sensitive personal information is PROHIBITED unless an exception applies.**
  Sensitive means race, ethnic origin, marital status, age, colour, religious/philosophical/
  political affiliation, health, education, genetic or sexual life, legal proceedings, and
  government-issued identifiers including **social security numbers and tax returns**.
  Consent must be *"specific to the purpose prior to the processing"*.

Penalties scale with negligence and volume: **S.26** covers access *"due to negligence"*
(1“3 years / Php500k“2M for personal; 3“6 years / Php500k“4M for sensitive), **S.35** imposes
the maximum when **at least 100 persons** are affected, and **S.34** puts liability on
*"responsible officers"* of a corporation who participated or *"by their gross negligence,
allowed"* it — which is the clause that makes this a personal risk, not only a company one.

**Still open in request 12:** whether the named free tiers are usable from the Philippines
without a VPN or foreign payment method. **That part needs search** — it depends on current
vendor availability pages, not on a statute.

### CLOSED — Request 8, partly (Anthropic indemnity and ownership)

**Source:** https://www.anthropic.com/legal/commercial-terms — Commercial Terms of Service,
**effective June 17, 2025**, fetched in full, HTTP 200.

- **Ownership (Â§B).** *"Customer... (b) owns its Outputs. Anthropic disclaims any rights it
  receives to the Customer Content under these Terms... Anthropic hereby assigns to Customer
  its right, title and interest (if any) in and to Outputs."*
- **Training (Â§B), verbatim:** *"Anthropic may not train models on Customer Content from
  Services."* This is a **commercial-terms** commitment; the consumer terms are a different
  document and this quote must not be used for `claude.ai`.
- **Indemnity (Â§K.1), and here is the free-tier answer.** Anthropic will defend the customer
  against a claim that *"Customer's **paid** use of the Services... violates any third-party
  intellectual property right."* **The word "paid" is the exclusion, in the terms
  themselves** — so the commercial indemnity is not available on a free tier, and this is a
  direct answer to the question request 8 asked.
- **Six exclusions (Â§K.3), and one of them matters enormously for this track:** the indemnity
  does **not** apply where the claim arises from *"(a) modifications made by Customer to the
  Services or Outputs"*, *"(b) the combination of the Services or Outputs with technology or
  content not provided by Anthropic"*, *"(c) Inputs or other data provided by Customer"*,
  *"(d) use... Customer knows or reasonably should know violates or infringes the rights of
  others"*, *"(e) the practice of a patented invention contained in an Output"*, or *"(f) an
  alleged violation of trademark based on use of an Output in trade or commerce"*.

**Why K.3(a) is the finding.** Every phase of the vibecoding track teaches the reader to
**modify** generated code — that is the entire discipline. On Anthropic's commercial terms,
modifying the output is one of the stated ways to lose the indemnity. That is a real and
specific consequence, and it belongs in phase 8. Note carefully that this is Anthropic's
commercial terms only; **the other vendors' terms were not reachable and must not be assumed
to match.**

### BLOCKED — not fetchable, needs search or another route

**GitHub's docs truncate their article body when fetched.** Three attempted:
`docs.github.com/.../manage-policies` and `.../individuals/billing` both return **HTTP 200
with the correct page title but only the navigation, no article content** (the response ends
`(Content truncated. Fetch a more specific URL or section for the full text.)`). A `#fragment`
does not help — the fragment is client-side and was ignored, which was a wasted fetch. **This
blocks requests 8 (GitHub part) and 9 (Copilot training default)** from this direction.

**`privacy.gov.ph` returns HTTP 403, Cloudflare-challenged.** See above for the LawPhil
workaround, which solved the part that mattered.

### STILL OPEN — genuinely needs search

Requests **1, 2, 3, 4, 5, 6, 7, 10, 11** in full, plus the availability half of 12 and the
GitHub half of 8 and 9. These ask for current vendor behaviour (agent context limits, default
permissions, sandboxing), documented incidents, research papers whose identifiers I do not
have, or pages that block fetching. **No amount of URL-guessing closes them** — which is the
honest boundary this file exists to record.

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

**Sources:** https://modelcontextprotocol.io/specification/2025-11-25/changelog Â·
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
