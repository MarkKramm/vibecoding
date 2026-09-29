# Research request — please search the web and cite sources

> ## ⛔ SUPERSEDED 2026-09-29 — do not paste this file
>
> **All twelve questions are answered.** Eleven are closed against primary
> sources; the twelfth (Q12) is closed for every tool except three that publish
> no supported-country list, which is a finding rather than a gap.
>
> **Nothing needs pasting.** This file was written because `web_search` was
> believed to be unavailable, so the questions had to be carried into a web chat
> by hand. Search works, the relay is finished, and the whole round-trip is
> obsolete.
>
> **Where the answers are:** `docs/SEARCH-REQUESTS.md` holds the per-request
> status and the reasoning. The findings themselves are in
> `RESEARCH-VENDOR-2026-09-29.md` (Q1, Q8, Q9),
> `RESEARCH-PERMISSIONS-2026-09-29.md` (Q2, Q3),
> `RESEARCH-INJECTION-2026-09-29.md` (Q4),
> `RESEARCH-SECURITY-AVAIL-2026-09-29.md` (Q5, Q7, Q12) and
> `RESEARCH-EU-AI-ACT-2026-09-29.md` (Q10).
>
> **This file and `PASTE-THIS.txt` are hand-maintained siblings that were meant
> to stay in step.** They agreed on the count and disagreed on the wording, and
> the wording in `PASTE-THIS.txt` was the one to paste. Both are now historical.
> **Do not re-synchronise them** — there is nothing left to synchronise.
>
> The original text follows, unaltered, as the record of what was asked.

I am writing a technical curriculum about building software with AI coding tools, and I
need answers accurate as of **September 2026**. **Please use web search.**

**How to reply:**
- Answer under the **same number** as the question.
- Give the answer **and a source URL** for each.
- **If you cannot find a reliable source, say "could not verify" — do not estimate.** An
  acknowledged gap is genuinely useful to me. A confident guess is worse than nothing,
  because I will publish it.
- **Partial answers are fine.** Answer what you can and mark the rest.

**Two questions are already partly answered — please do not redo them:**
- **Q8:** I already have Anthropic's commercial terms
  (https://www.anthropic.com/legal/commercial-terms) — the indemnity covers *"paid use"*,
  so free tiers are excluded. I need **the other three vendors only**.
- **Q12:** I already have the Philippine Data Privacy Act statute text
  (https://lawphil.net/statutes/repacts/ra2012/ra_10173_2012.html). I need **only the
  free-tier availability half**.

Twelve questions.

---

**1. Coding-agent context windows.** For Claude Code, OpenAI Codex, GitHub Copilot's agent
mode, Google Antigravity, Cursor, and Devin Desktop (formerly Windsurf) — what context
window does each use? Which vendors **do not publish** this number?

**2. Coding-agent default behaviour.** When a coding agent runs unattended, what will it
typically **do without asking** — run tests, install packages, edit files outside the
requested scope, make network calls, commit, push? I want observable behaviour, per tool,
from official docs.

**3. How those defaults are enforced.** Which coding agents run commands in a sandbox,
which ask for approval per command, and which run with full user permissions? **This is the
mechanism behind Q2's behaviour, so please answer it separately** rather than reusing Q2.

**4. Prompt injection through repository content.** Are there documented incidents, vendor
advisories, or research papers where malicious content in a repository — a README, an issue,
a dependency's file — caused a coding agent to take an unwanted action? Primary sources
preferred, not blog commentary.

**5. Git as an agent safety net.** Is there authoritative guidance — vendor documentation or
well-known engineering write-ups — recommending committing before an agent run, or reviewing
diffs rather than the agent's summary? I want to cite something real rather than assert it.

**6. Accuracy of agent self-reports.** Is there any study or documented case of a coding
agent's summary of its own work being inaccurate — claiming more verification than it
performed, or omitting what it did not check?

**7. Security defects in AI-generated code.** Beyond hallucinated package names (I already
have arXiv 2406.10279), what does research or vendor guidance say about other security
defects over-represented in generated code — SQL injection, hardcoded secrets, missing
authorisation checks, weak cryptography? Papers or official advisories with URLs.

**8. Indemnity on free tiers.** Do GitHub, Google, and OpenAI indemnify users against
copyright claims on AI-generated code, and **does that indemnity apply to free tiers or only
paid ones**? I need the actual terms pages. (I have already verified Anthropic's commercial
terms, which specify "paid use" — so I need the other three, and I specifically need to know
where the free tier is excluded.)

**9. Training on free-tier code.** For **GitHub Copilot Free**, **Google Antigravity**,
**Cursor Hobby**, and **Codex Free**: is free-tier code used for training by default, and is
there an opt-out? (I have a partial answer for Copilot: default since 2026-04-24. I need the
others confirmed.)

**10. Disclosure norms for AI-assisted code.** Is there any emerging standard — employer
policy, professional-body guidance, conference or open-source project policy — on disclosing
that code was AI-generated? I would rather teach something real than invent a rule.

**11. Real incidents.** Are there documented, sourced cases of AI-assisted code causing a
production outage or security incident? I need specific cases with post-mortems or news
coverage, not general warnings about risk.

**12. Availability from the Philippines.** Do these free tiers work from the Philippines
without a VPN or a foreign payment method — **Google Antigravity CLI, GitHub Copilot Free,
the Gemini API free tier, and Groq**? Are any region-restricted? Pricing or availability
pages preferred. *(The statute text itself is already sourced — I need only this
availability half.)*

---

*If you can only answer some of these, that is fine — please just say which ones you could
not verify rather than filling the gap.*
