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
  Php500,000–1,000,000 for anyone who, knowing of a breach and of the S.20(f) duty,
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
(1–3 years / Php500k–2M for personal; 3–6 years / Php500k–4M for sensitive), **S.35** imposes
the maximum when **at least 100 persons** are affected, and **S.34** puts liability on
*"responsible officers"* of a corporation who participated or *"by their gross negligence,
allowed"* it — which is the clause that makes this a personal risk, not only a company one.

**Still open in request 12:** whether the named free tiers are usable from the Philippines
without a VPN or foreign payment method. **That part needs search** — it depends on current
vendor availability pages, not on a statute.

### CLOSED — Request 8, partly (Anthropic indemnity and ownership)

**Source:** https://www.anthropic.com/legal/commercial-terms — Commercial Terms of Service,
**effective June 17, 2025**, fetched in full, HTTP 200.

- **Ownership (§B).** *"Customer... (b) owns its Outputs. Anthropic disclaims any rights it
  receives to the Customer Content under these Terms... Anthropic hereby assigns to Customer
  its right, title and interest (if any) in and to Outputs."*
- **Training (§B), verbatim:** *"Anthropic may not train models on Customer Content from
  Services."* This is a **commercial-terms** commitment; the consumer terms are a different
  document and this quote must not be used for `claude.ai`.
- **Indemnity (§K.1), and here is the free-tier answer.** Anthropic will defend the customer
  against a claim that *"Customer's **paid** use of the Services... violates any third-party
  intellectual property right."* **The word "paid" is the exclusion, in the terms
  themselves** — so the commercial indemnity is not available on a free tier, and this is a
  direct answer to the question request 8 asked.
- **Six exclusions (§K.3), and one of them matters enormously for this track:** the indemnity
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
