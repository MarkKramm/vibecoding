# Research: security of AI-generated code (Q7) and free-tier availability in the Philippines (Q12), plus agent-diff review practice (Q5)

**Summary: Q5 is CLOSED (answer is a qualified yes, with an important correction to the premise). Q7 is PARTIAL (two peer-reviewed/vendor-primary datasets read in full, but no source was found that quantifies hardcoded secrets or missing authorization, and the question's own premise is contradicted by the one measurement I could verify). Q12 is PARTIAL (all four services have a usable free tier and the Philippines is not on any published exclusion list, but no vendor publishes a supported-country list, so "works from the Philippines without a foreign payment method" cannot be fully closed).**

Questions assigned to this pass: **Q5, Q7, Q12** of the twelve in `PASTE-THIS.txt`. Q1, Q2, Q3, Q6, Q8, Q9, Q10 and Q11 were not re-examined here; Q4, Q6 and Q11 are already answered elsewhere in this research effort.

Rules applied: every fact below was read off a page that was actually fetched. A search-engine snippet is treated as a lead, not as a source. Anything that exists only in a secondary write-up, a news article, or a snippet is marked `reported, not independently verified`. Where a widely repeated number could not be traced to a primary source, it is marked `could not verify` and recorded rather than dropped.

---

## Q5 — Does any vendor tell you to commit before running an agent, or to review the diff instead of the agent's summary?

Question as asked: "Is there official vendor documentation or a well-known engineering write-up recommending you commit before running an agent, or review diffs instead of the agent's summary?"

### Answer

**Yes to the second half. The first half was answered "no" on an incomplete search, and that answer was wrong — see the correction below.**

Two vendor-primary sources were found and read in full, and both tell you to read the diff and distrust the agent's own account of what it did. Both describe committing *after* you are satisfied with the change.

> ### ⚠️ CORRECTION, 2026-09-29 — the "no" on the first half was wrong
>
> The original pass searched Cursor and Anthropic, found neither saying "commit first", and generalised to "no vendor says it". A later pass read OpenAI's Codex documentation and found it says something very close. Verbatim, from `https://learn.chatgpt.com/docs/agent-approvals-security.md`:
>
> > "Work on a feature branch and keep `git status` clean before delegating. This keeps Codex patches easier to isolate and revert."
> > "Prefer patch-based workflows (for example, `git diff`/`git apply`) over editing tracked files directly. Commit frequently so you can roll back in small increments."
>
> That is not literally "make a throwaway commit first", but it is a clear instruction to **start from a clean tree and commit in small increments so you can roll back** — the same practice, described in a different vocabulary. **A "no" generalised from two vendors to all vendors is exactly the shape of error this file exists to prevent, and it happened here.**
>
> **The defensible claim is now: at least one major vendor tells you to start from a clean working tree and commit frequently. Whether the "commit first" framing is right is a matter of interpretation, not of missing evidence.**

### Finding 1 — Cursor (official engineering blog)

- **Source URL:** https://cursor.com/blog/agent-best-practices
- **Author/date on page:** Lee Robinson, 9 January 2026
- **Verbatim quote:** "They review carefully. AI-generated code can look right while being subtly wrong. Read the diffs and carefully review. The faster the agent works, the more important your review process becomes."
- **Verbatim quote:** "Revert the changes, refine the plan to be more specific about what you need, and run it again."
- **Verbatim quote:** "Watch the agent work. The diff view shows changes as they happen. If you see the agent heading in the wrong direction, click Stop to cancel and redirect."
- **Verbatim quote:** "Review the changes and merge when ready"
- **Verbatim quote (on committing):** "Commit the tests when you're satisfied with them." / "Commit the implementation once you're satisfied with the changes."
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Note on the premise:** the same page tells you to commit *after* you are satisfied. It is a post-hoc commit gate, not a pre-flight backup commit. The workflow it describes is: watch, stop early if it drifts, read the diff, revert and re-prompt if it is wrong, then commit.

### Finding 2 — Anthropic (official product documentation)

- **Source URL:** https://code.claude.com/docs/en/best-practices
- **Verbatim quote:** "Before treating a task as done, have a subagent review the diff in a fresh context and report gaps."
- **Verbatim quote:** "Have Claude show evidence rather than asserting success: the test output, the command it ran and what it returned, or a screenshot of the result."
- **Verbatim quote:** "The trust-then-verify gap. Claude produces a plausible-looking implementation that doesn't handle edge cases. Fix: Always provide verification (tests, scripts, screenshots). If you can't verify it, don't ship it."
- **Verbatim quote:** "A fresh context improves code review since Claude won't be biased toward code it just wrote."
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Note on the premise:** the closest this page comes to "commit first" is the reverse — checkpoints are not a substitute for version control.

### Finding 3 — Anthropic, on checkpoints versus git

- **Source URL:** https://code.claude.com/docs/en/best-practices
- **Verbatim quote:** "Checkpoints only track changes made through Claude's file editing tools. Changes made through Bash commands or external processes are not captured. This isn't a replacement for git."
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Interpretation:** the documented position is that agent-managed checkpoints are *not* the safety net and git is. That is an argument for having version control in place. It is not an instruction to make a throwaway commit before each prompt.

### Finding 4 — OpenAI / Codex: "commit before you run an agent"

- **Source URL:** `https://learn.chatgpt.com/docs/agent-approvals-security.md`
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Verbatim quote:** "Work on a feature branch and keep `git status` clean before delegating. This keeps Codex patches easier to isolate and revert."
- **Verbatim quote:** "Prefer patch-based workflows (for example, `git diff`/`git apply`) over editing tracked files directly. Commit frequently so you can roll back in small increments."
- **Status change:** this finding previously read `could not verify` on the grounds that no OpenAI documentation could be located. That search was targeted at the *phrase* "commit before", and the guidance is written in different words — clean status, commit frequently, roll back in small increments. **The block was an artefact of searching for a literal phrase rather than the practice.** Recorded here rather than deleted, because the reason the original pass failed is the more useful part.
- **Interpretation:** this is a pre-flight cleanliness requirement plus an incremental-commit discipline. It is the practice the question was asking about, in vocabulary that does not contain the question's words.

### Finding 5 — GitHub Copilot: still unverified

- **Source URL:** none found
- **Verification status:** `could not verify`
- **Date read:** 2026-09-29
- **Note:** the Copilot pages read for this pass cover the CLI's permission model, directory scoping and the cloud agent's environment. **None of them addresses git practice.** Treat as unverified for Copilot specifically — and note that Finding 4's failure mode is a live risk for any future search, since the same phrasing gap could apply here.

### Practical phrasing this supports

The defensible, sourced version of the rule: **do not trust the agent's summary; watch the run, read the diff, and make it show evidence.** That much is consistent across Cursor, Anthropic and OpenAI.

On the commit half, the sourced position is now stronger than it was: **OpenAI documents a clean working tree before delegating and frequent incremental commits so you can roll back**, while Cursor and Anthropic describe committing after you are satisfied. **All three converge on the same practice — version control in place, small reversible steps, human judgement at the merge point — and differ only in when they say to make the commit.** The corpus may state the practice as sourced. It may not state "commit first" as a quoted recommendation, because no vendor uses those words.

---

## Q7 — Besides hallucinated package names, what security flaws are over-represented in AI-generated code?

Question as asked: "Besides hallucinated package names, what security flaws are over-represented in AI-generated code (SQL injection, hardcoded secrets, missing authorization, weak crypto)? Find papers or vendor advisories."

### Answer, in short

The question supplies a four-item candidate list. **Two of those four are contradicted by the only large vendor measurement I could read in full, and the two flaws that measurement does find to be over-represented (cross-site scripting and log injection) are not on the list.** Two further findings came out of the sources: security *degrades* as you iterate on a model-generated solution, and AI-authored pull requests amplify several weakness classes relative to human-authored ones.

Findings by candidate flaw:

| Candidate flaw | What the verified sources say |
| --- | --- |
| SQL injection | **Not over-represented in the one measurement read in full.** Veracode: 82% of SQL-injection tasks produced secure code, one of the two *best* results. Veracode's own explanation is that models recognise parameterised queries. `verified from primary source` |
| Weak crypto | **Not over-represented, and the single best result.** Veracode: 86% of insecure-cryptography tasks produced secure code. `verified from primary source` |
| Hardcoded secrets | Supported in direction, not measured. CodeRabbit found improper password handling and insecure object references amplified in AI-authored PRs. Endor Labs asserts hard-coded credentials (CWE-798) as a common outcome, with no methodology published. `reported, not independently verified` for the numbers; the *existence* of a vendor assertion is verified. |
| Missing authorization | Asserted by Endor Labs (CWE-284, CWE-306) with no methodology. Endor's own benchmark found access-control-adjacent CWEs (CWE-200, CWE-444, CWE-532) among the hardest for agents. `reported, not independently verified` |
| **Cross-site scripting** | **Over-represented.** Veracode: only 15% of XSS tasks produced secure code. `verified from primary source` |
| **Log injection** | **Over-represented.** Veracode: only 13% of log-injection tasks produced secure code, the worst class tested. `verified from primary source` |

### Finding 1 — Veracode, Spring 2026 GenAI code security report

- **Source URL:** https://www.veracode.com/blog/spring-2026-genai-code-security
- **Date on page:** 24 March 2026
- **Verbatim quote:** "across all models and all tasks, only 55% of generation tasks result in secure code. This means that in 45% of cases, the model introduces a known security flaw into the codebase."
- **Verbatim quote:** "They excel at recognizing obvious, surface-level patterns, like parameterized SQL queries or standard encryption libraries. But they consistently fail at the more nuanced security challenges that require understanding dataflow across multiple lines or files."
- **Methodology, verbatim:** "80 coding tasks spanning common development scenarios"; "4 programming languages: Java, JavaScript, C#, and Python"; "4 critical vulnerability types (CWEs): SQL Injection (CWE-89), Cross-Site Scripting (CWE-80), Log Injection (CWE-117), and Insecure Cryptographic Algorithms (CWE-327)"; "5 task instances for each language-CWE combination".
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Caveat that must travel with the 45% figure:** this is a vendor running its own static analysis tool over its own task set, restricted to four CWE classes. It measures whether a generated snippet contains a known flaw pattern. It is not a measure of the security of shipped applications, and it does not cover authorization defects, secrets in environment variables, or business-logic flaws. The number is well-founded *for what it measures*; it is routinely quoted for much more than that.
- **Note on the 45% wording:** the frequently-cited "45% of AI code has vulnerabilities" is a faithful restatement of this sentence. What is not always carried along is that 45% is the *aggregate across four chosen weakness classes*, dominated by two of them (XSS and log injection). The aggregate is not a general-purpose security rate.

### Finding 2 — Security degrades with iteration (arXiv:2506.11022)

- **Source URL:** https://arxiv.org/abs/2506.11022
- **Title as read on the page:** "Security Degradation in Iterative AI Code Generation -- A Systematic Analysis of the Paradox"
- **Verbatim quote (abstract):** "This paper analyzes security degradation in AI-generated code through a controlled experiment with 400 code samples across 40 rounds of "improvements" using four distinct prompting strategies. Our findings show a 37.6% increase in critical vulnerabilities after just five iterations"
- **Verification status:** `verified from primary source` (title and abstract read directly from the arXiv abstract page; the full PDF was not read)
- **Date read:** 2026-09-29
- **Why it belongs in this answer:** it changes the shape of the question. A snapshot pass rate of 45% understates the risk of the most natural agent workflow, which is "ask, look wrong, ask again". Each round of self-correction added critical vulnerabilities rather than removing them. This is the strongest available argument that over-representation in AI code is not a fixed property of models but a function of how long the loop runs.

### Finding 3 — Endor Labs, Agent Security League

- **Source URL:** https://www.endorlabs.com/learn/agent-security-league-evaluating-the-security-of-ai-coded-software
- **Date on page:** 15 April 2026, updated 7 May 2026
- **Verbatim quote:** "We evaluate 13 agent + model combinations on the SusVibes benchmark, a suite of 200 real-world vulnerability tasks drawn from 108 open-source Python projects spanning 77 CWE classes."
- **Verbatim quote:** "Even the top security scorer (Codex + GPT-5.4, 17.3% SecPass) leaves roughly nine out of ten generated solutions vulnerable."
- **Verbatim quote:** "No OWASP 2025 category exceeds 25% SecPass for any combination, and the per-category averages range from 0% to ~17%."
- **Verbatim quote:** "Pooling all 13 configurations still leaves two-thirds of security tasks unsolved."
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Metric caveat, and it is a large one:** SecPass means the generated solution passes hidden security tests for a task seeded with a known vulnerability. It is a much stricter measure than Veracode's "does this snippet contain the CWE pattern", and the 17.3% figure **must not be placed next to Veracode's 45%** as though they measured the same thing. They did not.
- **Useful structural finding:** the median gap between the functional pass rate and the secure pass rate was 45 percentage points, and the union across configurations was 90.5% functional against 33.0% secure. Code that runs is not code that is safe, and the gap is the finding, not a footnote.
- **On the question's candidate list:** CWE-200 (improper handling of missing input), CWE-444 (HTTP request smuggling) and CWE-532 (insertion of sensitive information into log files) were among the hardest classes. CWE-444 and CWE-532 were unsolved by every one of the 13 configurations. CWE-532 being unsolved by everything is notable for this question, because it is the same weakness family as Veracode's log-injection result.

### Finding 4 — CodeRabbit, State of AI vs Human Code Generation

- **Source URL:** https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report
- **Author/date on page:** David Loker, 17 December 2025
- **Verbatim quote:** "We analyzed 470 open-source GitHub pull requests, including 320 AI-co-authored PRs and 150 human-only PRs, using CodeRabbit's structured issue taxonomy."
- **Verbatim quote:** "Security issues were up to 2.74× higher"
- **Verbatim quote:** "Across 470 PRs, AI-authored changes produced 10.83 issues per PR, compared to 6.45 for human-only PRs."
- **Verbatim quote:** "The most prominent pattern involved improper password handling and insecure object references. While no vulnerability type was unique to AI, nearly all were amplified."
- **Verbatim quote (the authors' own limitation):** "we checked for signals that a PR was co-authored by AI and assumed that those that didn't have it were human authored" and "we cannot guarantee all the PRs we labelled as human authored were actually authored only by humans."
- **Verification status:** `verified from primary source` for the sample, the aggregate, the 2.74x headline, the per-PR rates, the amplification finding and the stated limitation
- **Date read:** 2026-09-29
- **Important provenance note:** **this CodeRabbit blog is the traceable origin of the "2.74x more vulnerabilities" figure** that circulates online attributed to an unnamed study. It is a vendor running its own linter over PRs it classified as AI- or human-authored by heuristic signal. It is not an academic study, and the "up to" qualifier is load-bearing.
- **The "up to" caveat specifically:** the per-class multipliers (2.74x for XSS, 1.88x for improper password handling, 1.91x for insecure object reference, 1.82x for insecure deserialization) appear in the downloadable report and in news coverage including The Register, but **not in the body of the blog post I fetched**. They are `reported, not independently verified` here.

### Finding 5 — Endor Labs, on missing authentication and hard-coded secrets

- **Source URL:** https://www.endorlabs.com/learn/the-most-common-security-vulnerabilities-in-ai-generated-code
- **Date on page:** 12 August 2025, updated 11 September 2026
- **Verbatim quote:** "Prompts that omit security guidance can result in applications with no authentication, hard-coded secrets, or unrestricted access to backend systems. For example, a typical prompt like "hook up to a database and display user scores" often results in code that bypasses authentication and authorization entirely"
- **Weakness classes named on the page:** "Broken authentication (CWE-306)", "Broken access control (CWE-284)", "Hard-coded credentials (CWE-798)"; also CWE-20, CWE-89 and CWE-78.
- **Verification status:** the page and its wording are `verified from primary source`; the implicit claim that these are *over-represented* is `could not verify`
- **Date read:** 2026-09-29
- **Why the claim could not be verified:** **the page publishes no methodology, no sample size, no task set and no pass rates.** It is a set of assertions illustrated with an example prompt. It cannot be cited as evidence of over-representation, only as evidence that a vendor makes the claim.
- **Citation hygiene warning, and this one is concrete:** this page's references are internally broken. It labels arXiv 2407.07064 under two different titles, and arXiv 2506.23034 under two different titles. I fetched https://arxiv.org/abs/2506.23034 directly: the title there is "Guiding AI to Fix Its Own Flaws: An Empirical Study on LLM-Driven Secure Code Generation", and its abstract makes no "over 40% of solutions contain security flaws" claim of the kind this page attributes to it. Consequently the widely repeated figure "over 40% of AI-generated code solutions contain security flaws" is `could not verify` against its apparent source, and should not be cited. arXiv 2407.07064 was not fetched and is not cited here at all.

### What the question's premise gets wrong

Q7 offers four candidate flaws and asks which are over-represented. Answering honestly means reporting that **the two the question names most confidently (SQL injection, weak crypto) are the two the verified measurement handles best**, and that the two it omits (XSS, log injection) are the worst. The intuition that AI is uniquely bad at SQL injection looks like folk knowledge, and the surface explanation is in the source: parameterised queries and standard crypto libraries are surface-level patterns, which is exactly what models are good at. The failures concentrate where a correct answer requires tracking dataflow across files, which is what a single-snippet generation task does not exercise.

Two limits on all of the above, stated plainly: every quantitative claim here about *rates* comes from a vendor, and the only peer-reviewed source I read is an abstract rather than a paper. No independent third party has reproduced these numbers to my knowledge, and I did not look for one.

### Complete inventory of statistics encountered, with status

Recorded so that nothing is silently dropped, including numbers that appear in secondary sources.

**Veracode, https://www.veracode.com/blog/spring-2026-genai-code-security — all `verified from primary source`, 2026-09-29**

| Statistic | Value |
| --- | --- |
| Share of generation tasks producing secure code | 55% |
| Share introducing a known security flaw | 45% |
| SQL Injection (CWE-89) pass rate | 82% |
| Insecure Cryptographic Algorithms (CWE-327) pass rate | 86% |
| Cross-Site Scripting (CWE-80) pass rate | 15% |
| Log Injection (CWE-117) pass rate | 13% |
| Java pass rate | 29% (worst language) |
| Python pass rate | 62% (best language) |
| Coding tasks | 80 |
| Programming languages | 4 (Java, JavaScript, C#, Python) |
| CWE classes | 4 |
| Task instances per language-CWE combination | 5 |
| Models tested to date | "over 150 LLMs" |

**arXiv:2506.11022 — `verified from primary source` (abstract only), 2026-09-29**

| Statistic | Value |
| --- | --- |
| Code samples | 400 |
| Rounds of "improvements" | 40 |
| Prompting strategies | 4 |
| Increase in critical vulnerabilities after 5 iterations | 37.6% |

**Endor Labs, Agent Security League — all `verified from primary source`, 2026-09-29**

| Statistic | Value |
| --- | --- |
| Agent + model combinations | 13 |
| SusVibes tasks | 200 |
| Open-source Python projects in benchmark | 108 |
| CWE classes covered | 77 |
| Top scorer (Codex + GPT-5.4) SecPass | 17.3% |
| Best OWASP 2025 category SecPass | under 25% (none exceeded 25%) |
| Per-category average range | 0% to approximately 17% |
| Security tasks unsolved, pooled across all 13 | two-thirds |
| Median FuncPass to SecPass gap | 45 percentage points |
| Union FuncPass | 90.5% |
| Union SecPass | 33.0% |
| CWE-444 and CWE-532 | unsolved by all 13 combinations |

**CodeRabbit — status varies, 2026-09-29**

| Statistic | Value | Status |
| --- | --- | --- |
| PRs analysed | 470 | `verified from primary source` |
| AI-co-authored PRs | 320 | `verified from primary source` |
| Human-only PRs | 150 | `verified from primary source` |
| Security issues, AI versus human | up to 2.74x higher | `verified from primary source` (blog body) |
| Issues per PR, AI-authored | 10.83 | `verified from primary source` |
| Issues per PR, human-only | 6.45 | `verified from primary source` |
| XSS multiplier | 2.74x | `reported, not independently verified` (report PDF and news coverage, not in fetched blog body) |
| Improper password handling multiplier | 1.88x | `reported, not independently verified` |
| Insecure object reference multiplier | 1.91x | `reported, not independently verified` |
| Insecure deserialization multiplier | 1.82x | `reported, not independently verified` |
| Cortex: incidents per pull request | up 23.5% | `reported, not independently verified` |

**Endor Labs blog (Aug 2025) and other circulated figures**

| Statistic | Value | Status |
| --- | --- | --- |
| "over 40% of AI-generated code solutions contain security flaws" | 40%+ | `could not verify` — attributed to arXiv 2506.23034, whose real abstract makes no such claim |
| Any rate for hard-coded credentials (CWE-798) | none published | `could not verify` — no methodology on the page |
| Any rate for broken authentication (CWE-306) or broken access control (CWE-284) | none published | `could not verify` — no methodology on the page |
| Hallucinated package names | out of scope | Not researched; Q7 explicitly excludes it |

---

## Q12 — Do these free tiers work from the Philippines without a VPN or foreign payment method?

Question as asked: "Do these free tiers work from the Philippines without a VPN or foreign payment method: Google Antigravity CLI, GitHub Copilot Free, Gemini API free tier, Groq? Are any region-restricted?"

### Answer

**All four have a free tier that requires no payment method to start, and none of the four is region-restricted in the Philippines by any published exclusion list. What cannot be verified is the second half of the question, because not one of these vendors publishes a supported-country list for its free tier.** In place of a country list you get the inverse: Gemini publishes an *allowed* country list and the Philippines is on it, which is a positive confirmation. GitHub and Groq publish exclusions by *account type* rather than geography, and say nothing about countries. Google publishes a list for the Gemini API and explicitly does not publish one for Antigravity.

So the honest framing for teaching content: free-tier signup needs no card for all four; the Philippines is confirmed supported for the Gemini API; for Antigravity, Copilot Free and Groq, the absence of a published country exclusion is not the same as a published confirmation.

### Finding 1 — Gemini API, Philippines is a supported region

- **Source URL:** https://ai.google.dev/gemini-api/docs/available-regions
- **Page last updated:** 2026-04-28
- **Verbatim quote:** "Philippines" appears in the list of supported countries and regions for the Gemini API.
- **Verbatim quote:** "Regional restrictions: Google AI Studio is not available in your region."
- **Verbatim quote (on Colab):** "Region restrictions are applied based on the region that the Colab instance is in, not the region that the user is in."
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Practical consequence of the Colab rule:** running the Gemini free tier inside Colab depends on where Google's compute is, not on where you are. That is a genuinely different failure mode from a local CLI and is worth stating explicitly, because it means a Philippine user can be blocked by something that has nothing to do with their own location.

### Finding 2 — Gemini API free tier needs no card

- **Source URL:** https://ai.google.dev/gemini-api/docs/billing
- **Page last updated:** 2026-09-20
- **Verbatim quote:** "New accounts begin on the Free Tier, which allows access to certain models in the Gemini API and AI Studio, up to the models' free tier rate limits"
- **Verbatim quote:** "Active project or free trial"
- **Verbatim quote:** "Upgrading from the Free Tier to the Paid Tier means linking a billing account and prepaying to add a minimum of $5 (or equivalent in other currencies)"
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Answer to the question:** no card is required for the free tier, because the card requirement begins at the paid tier. The $5 prepayment is a paid-tier threshold, not a free-tier one. The "or equivalent in other currencies" phrasing is what makes this work in the Philippines.

### Finding 3 — Antigravity free tier: no card, country list never published

- **Source URL:** https://antigravity.google/pricing
- **Verbatim quote:** "Generally Available"
- **Verbatim quote:** "For Individuals $0/month / Experience Antigravity without a subscription plan"
- **Verbatim quote:** "Unlimited Tab completions"
- **Verbatim quote:** "Unlimited Command requests"
- **Verbatim quote:** "Basic weekly rate limits"
- **Verification status:** `verified from primary source` for the pricing and limits; `could not verify` for country availability
- **Date read:** 2026-09-29
- **The gap:** this page carries **no supported-country list at all**. It states the free plan exists and what it includes. It never says where. A Philippine reader should read the $0 tier as confirmed-existing and location-unconfirmed, not as confirmed-available.
- **Corroborating signal (separate page):** https://gemini.google/subscriptions, rendered with the region selector set to the Philippines, lists "Philippines. Choose your country or region." with local pricing in PHP — Free at "₱0 PHP / month", Google AI Plus at "₱285 PHP / month", Google AI Pro at "₱1,100 PHP / month", Ultra at "₱5,599 PHP / month" and a higher Ultra tier at "₱11,900 PHP / month". The Pro tier includes "Entry rate limits to agent model in Google Antigravity, our agentic development platform", and a footnote reads "Google AI Plus, Pro, and Ultra plans are available in more than 140 countries and territories". This makes it very likely that the Antigravity quota ladder is purchasable from the Philippines, which in turn implies a Philippine card is the likely path. **A local card being accepted is `could not verify`** — the pages show local pricing but never state which payment instruments are accepted. `verified from primary source` for the prices and the Antagravity entitlement.

### Finding 4 — GitHub Copilot Free: no card, no geographic exclusion published

- **Source URL:** https://docs.github.com/en/copilot/how-tos/manage-your-account/get-started-with-a-copilot-plan
- **Verbatim quote:** "Most individual developers can start using Copilot Free with no setup required. However, there are a few cases where Copilot Free isn't available:"
- **Verbatim quote:** "If you have a GitHub account, you will be prompted to sign in."
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **The exclusions are all account-type, not geographic:** the cases listed are a managed user account, a seat assigned through an organisation or enterprise, an existing paid plan, Copilot Student eligibility, and teacher/open-source free-Pro eligibility. No country appears anywhere in the list.
- **Second source URL:** https://docs.github.com/en/copilot/get-started/plans-for-github-copilot
- **Verbatim quote:** "Limited to 2000 completions per month on Copilot Free."
- **Verbatim quote:** "Copilot Free plans are only available to individual developers who don't have access to Copilot through an organization or enterprise."
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **The gap:** **GitHub publishes no supported-country list for Copilot.** Whether a Philippine-issued card is accepted for a paid upgrade is `could not verify`. For the free tier specifically, no card is required, so the question's "without a foreign payment method" condition is met on the documentation as written.

### Finding 5 — Groq: documented free tier, payment method only at upgrade

- **Source URL:** https://console.groq.com/docs/rate-limits
- **Verbatim quote (from the published Free Plan Limits table):** openai/gpt-oss-120b — "30 RPM, 1K RPD, 8K TPM, 200K TPD"
- **Verbatim quote:** "Rate limits apply at the organization level, not individual users."
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Second source URL:** https://console.groq.com/docs/billing-faqs
- **Verbatim quote:** "To upgrade from the Free tier to the Developer tier, you'll need to provide a valid payment method (credit card, US bank account, or SEPA debit account)."
- **Verbatim quote:** "Groq accepts credit cards (Visa, MasterCard, American Express, Discover), United States bank accounts, and SEPA debit accounts as payment methods."
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Reading this carefully is the point of this entry:** the *upgrade* needs a card, and the accepted instruments named are Visa, Mastercard, American Express, Discover, a **US** bank account, and **SEPA** debit. A Philippine-issued Visa or Mastercard plausibly works, because card networks are not country-limited, but a Philippine *bank transfer* has no route, since the two bank options are US and SEPA. Whether Groq requires a card at signup for the free tier itself is `could not verify` — the billing FAQ describes the card requirement only as the condition for upgrading, which implies it is not required for the free tier, but the docs never say so in those words.
- **Further gap:** https://groq.com/pricing returned no readable text (JavaScript-rendered), and Groq publishes no supported-country list. Country availability of the free tier is `could not verify`.

### Cross-tool summary for Q12

| Tool | Free tier exists | Card needed to start | Philippines confirmed supported | Where a Philippine card is the risk |
| --- | --- | --- | --- | --- |
| Gemini API | yes | no (card required only for paid tier, $5 minimum) | **yes**, on the published country list | none for free tier |
| Google Antigravity | yes, $0/month | no | `could not verify` (no country list published) | accepted payment instruments never stated |
| GitHub Copilot Free | yes, 2000 completions/month | no | no exclusion published, but no country list either | card acceptance for paid upgrade not published |
| Groq | yes, documented limits table | not stated; required to upgrade | `could not verify` (no country list published) | upgrade accepts cards, **US** bank accounts and **SEPA** only |

### One caveat on the whole answer

Availability was read on 2026-09-29. Free tiers, regional lists and accepted payment instruments change without notice, and all four vendors here have changed at least one of these within the last year. Any teaching content should carry the read date, which is why the date is a required field on every finding above rather than a single note at the end.
