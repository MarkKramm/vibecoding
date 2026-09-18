# AI Coding Tool Landscape — Research Brief

**Audience:** a learner in the Philippines with a **$0 budget**.
**Compiled:** 2026-09-18.
**Scope:** the current state of AI coding tools, the free tiers that are genuinely usable, free API access, local models, and the security and licensing facts a beginner must know.

Every factual claim below is followed by a URL that was **actually fetched** during this session. A search snippet was treated as a lead, never as evidence. Aggregator and listicle sites (morphllm, cloudzero, nxcode, apidog, theaiagentindex and similar) were used to *find* primary pages and are never cited as sources.

**How to read the dates.** Volatile facts (prices, limits, model names) are stamped `as of 2026-09`. Where a vendor page prints its own "last updated" or "effective" date, that date is quoted too, because it tells you how stale the number might already be.

**The single most decision-relevant fact.** The tool that most published tutorials recommend as *the* free option — **Gemini CLI** — **stopped serving free users on 2026-06-18**. Google replaced it with **Antigravity CLI**, which does have a real $0 tier, but the free path is a different product with different commands, different config paths and a different quota model. Any lesson written before June 2026 that says "install Gemini CLI and log in with Google" is now wrong. See [§1](#1-which-tools-have-a-genuinely-usable-free-tier) and [§5](#5-what-changed-recently).

## 1. Which tools have a genuinely usable free tier

Summary table first. Details and URLs follow.

| Tool | Free tier? | Credit card? | Free code used for training? | Notes |
| --- | --- | --- | --- | --- |
| Google Antigravity CLI / 2.0 | Yes — real | No | Yes (free tier) | Replaced Gemini CLI on 2026-06-18 |
| GitHub Copilot Free | Yes — real but small | No | **Yes, since 2026-04-24** | Opt-out in personal settings |
| Cursor Hobby | Yes — "limited agent requests" | No (stated) | No by default | Limits not published numerically |
| Devin Desktop (was Windsurf) | Yes — "light quota" | No | **Unverified** | Rebranded; docs moved to docs.devin.ai |
| Cline | BYOK or rotating free promos | No | Depends on provider | No standing free model of its own |
| Continue | Free, Apache-2.0 | No | Depends on provider | **Repo now read-only — unmaintained** |
| Zed Free | Yes — editor + BYO key | No | Depends on provider | Hosted models need Pro |
| Aider | Free, open source | No | Depends on provider | BYO key; still active |
| Claude Code | **No free tier** | n/a | n/a | Requires Pro/Max or API credits |
| OpenAI Codex | Yes — Free plan exists | No | **Unverified** for free tier | Quota not published numerically |
| Qwen Code | Yes — 2,000 requests/day | No | **Unverified** | Not re-verified this session |
| OpenCode | Free, open source | No | Depends on provider | BYO key or OpenCode Zen |

### 1.1 Google Antigravity (the Gemini CLI replacement)

Gemini CLI's free tier is **gone**. Google's own developer blog announces the transition and prints the timeline:

> "On June 18, 2026, Gemini CLI and Gemini Code Assist IDE extensions will stop serving requests for Google AI Pro and Ultra, as well as those using it free of charge using Gemini Code Assist for individuals."

— https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli (posted MAY 19, 2026)

The deprecation is confirmed again on the Gemini Code Assist side, with the added detail that the **"Login with Google"** option no longer works at all for those tiers:

> "Starting June 18, 2026, Gemini Code Assist IDE extensions stopped serving requests for the Gemini Code Assist for individuals, Google AI Pro, and Google AI Ultra tiers. This also applies to usage of Gemini CLI. As part of the deprecation, you can no longer use the **Login with Google** option to access the IDE extensions or Gemini CLI."

— https://developers.google.com/gemini-code-assist/docs/deprecations/code-assist-individuals (last updated 2026-09-02 UTC)

Note the carve-out: **enterprise** access is unchanged. "If your organization uses Gemini CLI or our IDE extensions via a Gemini Code Assist Standard or Enterprise license … your access remains unchanged." (same blog URL)

**What replaced it, and whether it is free.** The pricing page lists a **"For Individuals — $0/month"** tier, described as "Experience Antigravity without a subscription plan":

- Agent model access to Gemini 3.8 Flash, Gemini 3.7 Flash, Gemini 3.6 Flash, Gemini 3.1 Pro, Claude Sonnet & Opus 4.6, and gpt-oss-120b
- Unlimited Tab completions
- Unlimited Command requests
- "Basic weekly rate limits"

— https://antigravity.google/pricing `as of 2026-09`

The docs page is careful to say the numbers are **not published as a number**:

> "Users not on AI Pro and Ultra plans receive: Meaningful quota, refreshed weekly; Weekly rate limit. The baseline rate limits are primarily determined to the degree we have capacity, and exist to prevent abuse. Under the hood, the rate limits are correlated with the amount of work done by the agent, which can differ from prompt to prompt."

— https://antigravity.google/docs/plans `as of 2026-09`

Two more things from that page that matter for a lesson plan:

- There is **no bring-your-own-key**: "There is currently no support for: Bring-your-own-key or bring-your-own-endpoint for additional rate limits."
- Free-tier overage is not purchasable: only "Users on Google AI Pro or Ultra plans can utilize purchased AI credits … for additional overage usage above the baseline provided quota."

The migration guide matters because the config paths changed. Skills moved from `.gemini/skills/` to `.agents/skills/`, MCP config moved out of `~/.gemini/settings.json` into a standalone `mcp_config.json`, and the remote-server schema key changed from `url`/`httpUrl` to `serverUrl`. Note also that `GEMINI.md` and `AGENTS.md` are still honoured.

— https://antigravity.google/docs/cli/gcli-migration `as of 2026-09`

**Credit card:** not stated as required anywhere on the pricing or plans pages; the tier is labelled $0/month. Treat "no card required" as **likely but not explicitly documented**.

### 1.2 GitHub Copilot Free

Copilot Free still exists, but **its limits are no longer published as countable numbers**. The plans table lists the allowance as simply "An allowance of GitHub AI Credits", where "1 AI credit = $0.01 USD":

> "All individual plans—Copilot Free, Copilot Pro, Copilot Pro+, and Copilot Max—include a monthly GitHub AI Credits allowance that varies by plan."

— https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing `as of 2026-09`

The one hard number that *is* published for the free tier is inline completions:

> "Copilot Free includes 2000 code completions per month and Copilot Student includes unlimited code completions."

— same URL

Model access is restricted: "On Copilot Free and Copilot Student plans, access to models is available through **auto model selection only**." Free also excludes the cloud agent, third-party agents, and org-wide controls, and its code review is limited to "Review selection" in VS Code.

— https://docs.github.com/en/copilot/get-started/plans `as of 2026-09`

**This is a change worth flagging in any lesson:** older write-ups describe "Copilot Free = 50 chat messages + 2,000 completions per month". As of 2026-09 the completions figure survives but the chat allowance has been replaced by an undisclosed credit allowance. **The exact size of the Copilot Free credit allowance is Unverified** — GitHub's own pages say only that an allowance exists, and I could not find a page stating the number.

**Credit card:** GitHub's ToS says plainly, "Free Accounts are not required to provide payment information."
— https://docs.github.com/en/site-policy/github-terms/github-terms-of-service (effective April 27, 2026)

### 1.3 Cursor Hobby

Cursor's free tier is **Hobby — Free**, and it is the only plan listed as needing no card:

> "### Hobby / For the tinkerer / Free / Includes: ✓ No credit card required / ✓ Limited Agent requests / ✓ Access to Composer"

— https://cursor.com/pricing `as of 2026-09`

The limits are described only qualitatively as "Limited Agent requests" and "Limited" models. **The numeric limit is Unverified** — Cursor does not publish it on the pricing page, and its docs page on models and pricing covers paid pools only. Note the paid tiers are $20 (Individual/Pro), $40/user (Teams) and custom (Enterprise), so there is no cheap middle tier.

Cursor's docs also reveal a **regional product**: "Start, our plan for developers in India, covers the Cursor Models pool."
— https://cursor.com/docs/models-and-pricing `as of 2026-09`
No equivalent plan for the Philippines is documented.

### 1.4 Devin Desktop — formerly Windsurf

**Windsurf is no longer called Windsurf, and its docs have moved.** `docs.windsurf.com/windsurf/accounts/usage` now redirects cross-origin to `docs.devin.ai`, and `windsurf.com/pricing` redirects to `devin.ai`. The docs still carry a "Windsurf Plugins" section, so the brand survives as a plugin line inside Devin.

— redirect targets observed directly: https://docs.windsurf.com/windsurf/accounts/usage → `https://docs.devin.ai`; https://windsurf.com/pricing → `https://devin.ai`

The current pricing page lists a **Free $0** individual plan:

> "Free / $0 / Light quota to code with agents / Limited model availability / Unlimited inline edits / Unlimited Tab completions"

— https://devin.ai/pricing `as of 2026-09`

The usage docs confirm the plan list and explain that the credit system was replaced:

> "In March 2026, Devin Desktop replaced the credit-based system with a **quota-based usage system**. Instead of buying and spending credits, your plan now includes a daily and weekly usage allowance that refreshes automatically. … The cost per token varies by model, and **free models don't count against your quota at all**."

— https://docs.devin.ai/desktop/accounts/quota `as of 2026-09`

Two practical warnings from the trials section:

> "Trials are generally not offered to: Customers who have previously used Devin, Windsurf, or Codeium (including under a different account or plan). … **Eligibility is determined automatically by our systems and is not subject to appeal.**"

— https://docs.devin.ai/desktop/accounts/usage `as of 2026-09`

**Unverified:** whether Devin/Windsurf free-tier code is used for training. The terms page at `windsurf.com/terms-of-service` returns 404 and its footer link redirects cross-origin to `devin.ai`, which could not be fetched. Do not state a training position for this tool.

### 1.5 Cline

Cline is **bring-your-own-key** with no standing free model of its own. Its own docs describe the free offering as promotional and explicitly rotating:

> "Cline periodically offers **free model promotions** that let you try select models at no cost, up to a limited usage quota. … Free model promotions are offered on a rotating, limited-time basis. The specific free models available may change over time."

— https://docs.cline.bot/getting-started/free-models `as of 2026-09`

After the free quota, the documented paths are ClinePass at **$9.99/month** ("2-5x the usage on popular open coding models compared to standard API rate") or pay-as-you-go credits.

— https://docs.cline.bot/getting-started/clinepass and https://docs.cline.bot/getting-started/authorizing-with-cline `as of 2026-09`

For a $0 learner the useful fact is that Cline is a **free client** — the extension costs nothing and you point it at a free API key or a local model. Its cost is whatever provider you attach.

### 1.6 Continue — free, but no longer maintained

**This is a correction to a lot of current advice.** Continue is Apache-2.0 and still installable, but its repository is now **read-only**:

> "_Note: The `continuedev/continue` repository is no longer actively maintained and is read-only for all users._"
> "## Final 2.0.0 Release — We polished Continue and did a final 2.0.0 release of the VS Code extension, CLI, and JetBrains plugin."

— https://raw.githubusercontent.com/continuedev/continue/main/README.md `as of 2026-09`

The same README states the licence: "Apache 2.0 © 2023-2026 Continue Dev, Inc."

The docs site is still live and still recommends models, but those recommendations are visibly dated — the "Best open models" table still leads with Qwen3 Coder, Devstral, and Claude Opus 4.1, and the local-models section still leads with Qwen2.5-Coder and Gemma 3.
— https://docs.continue.dev/customize/models `as of 2026-09`

**Recommendation for the curriculum:** present Continue as "free and open source, but in maintenance-only mode — fine to use, do not expect fixes". Do not present it as an actively developed recommendation without that caveat.

### 1.7 Zed

Zed's free tier is genuine and clearly documented in a comparison table:

| | Free | Pro | Student | Business |
| --- | --- | --- | --- | --- |
| Zed-hosted AI models | — | ✓ | ✓ | ✓ |
| AI via own API keys | ✓ | ✓ | ✓ | ✓ |
| External Agents | ✓ | ✓ | ✓ | ✓ |
| Edit Predictions | Limited | Unlimited | Unlimited | Unlimited |

> "Zed works without AI features or a subscription. **No authentication is required for the editor itself.** … Zed Free: Zed is free to use. You can configure AI agents with your own API keys via Use API Access. Edit Predictions are available on a limited basis. **Zed's hosted models require a Pro subscription.**"

— https://zed.dev/docs/account/plans-and-pricing `as of 2026-09`

Zed also offers a trial with a stated no-card property, but it automatically ends:

> "Trials include $5 of GPT Luna and unlimited Edit Predictions for 14 days … **No credit card is required.** Trials automatically convert to Zed Free when they end."

— same URL

There is a student plan with "$10/month in token credits" for "verified university students" for one year, but the pricing table labels it "Student" and the docs say "Available free for one year to verified university students" — **a Philippine learner would need to check whether their institution qualifies; eligibility by country is Unverified.**

— same URL

### 1.8 Aider

Aider remains free and open source — "Aider is AI pair programming in your terminal" — and works by bringing your own key, including local models via Ollama.
— https://raw.githubusercontent.com/Aider-AI/aider/main/README.md `as of 2026-09`

It is **still actively developed**: its release history contains entries for Claude 4.5/4.6, Gemini 3 preview models, GPT-5.x variants and DeepSeek Reasoner, and the repo README advertises a "Singularity 88%" badge for the last release.
— https://aider.chat/HISTORY.html and https://raw.githubusercontent.com/Aider-AI/aider/main/README.md `as of 2026-09`

Caution for lesson-writing: **Aider's own benchmark leaderboard is stale.** Its polyglot leaderboard's newest entries are dated 2025-08-25 and no current frontier model appears.
— https://aider.chat/docs/leaderboards/ `as of 2026-09`
Do not cite Aider's leaderboard as evidence about 2026 model quality.

There is an open community issue titled "Thoughts and questions about the future direction of aider", which I fetched but whose body is rendered client-side and did not decode into readable text. **The content of that issue is Unverified** — I am recording only that it exists, not what it says.
— https://github.com/Aider-AI/aider/issues/4751

### 1.9 Claude Code — no free tier

Claude Code is **not free at any level**. Its cost docs open with:

> "Claude Code charges by API token consumption. For subscription plan pricing (Pro, Max, Team, Enterprise), see claude.com/pricing."

— https://code.claude.com/docs/en/costs `as of 2026-09`

The same page gives a realistic cost anchor: "Across enterprise deployments, the average cost is around \$13 per developer per active day and \$150-250 per developer per month". That is the number to quote to a learner who asks "can I just use Claude Code?" — **the answer is no, not on $0.**

Model pricing confirms the scale: Claude Sonnet 5 at $2/$10 per MTok, Opus 5 at $5/$25.
— https://platform.claude.com/docs/en/about-claude/pricing `as of 2026-09`

One genuinely useful correction from that page: "The $2/$10 per million input/output token pricing for Claude Sonnet 5, announced at launch as introductory pricing through August 31, 2026, is now the standard price. The previously scheduled increase to $3/$15 per million input/output tokens on September 1, 2026 **will not occur**."

### 1.10 OpenAI Codex

Codex **does** have a Free plan:

> "Free / Explore Codex capabilities on quick coding tasks. / $0 / month"
— https://learn.chatgpt.com/docs/pricing.md `as of 2026-09`

But the usage-limits tables on that page list columns for **Plus, Pro 5x, Pro 20x, Standard Business and API Key only** — there is no Free column. So the free quota exists but its size is **Unverified**.

Two dated facts from the same page that a lesson should not get wrong:

- "GPT-5.5 retires from ChatGPT, ChatGPT Work, and Codex on all plans on **October 14, 2026**."
- "Image generation isn't available on the Free plan."

Also note the plan naming has drifted far from the tutorials: the current model family is **GPT-5.6 (Sol, Terra, Luna)** plus GPT-6 Astra, and the paid tiers are Free / Go ($8) / Plus ($20) / Pro (from $100) / Business ($20/user) / Enterprise.

**Credit card:** not documented for Free. **Training on free-tier Codex data: Unverified** — OpenAI's terms pages returned HTTP 403 to this session on repeated attempts (see [§6](#6-what-could-not-be-verified-and-why)).

### 1.11 Qwen Code

Qwen Code's documentation site is live and its authentication page exists at https://qwenlm.github.io/qwen-code-docs/en/users/configuration/auth/, but the page body did not decode into readable text on fetch and the raw-markdown mirror returned 404. **The Qwen Code free-tier specifics are therefore Unverified in this session.** The widely-repeated claim of "2,000 requests per day free" is **not confirmed from a primary source here** — do not state it as fact without re-checking.

What *is* confirmed is that Qwen Code is a real, actively documented CLI with VS Code, Zed and JetBrains integrations, subagents, MCP, sandboxing and a daemon mode.
— https://qwenlm.github.io/qwen-code-docs/en/users/configuration/auth/ (navigation and page structure fetched) `as of 2026-09`

### 1.12 OpenCode

OpenCode is an open-source terminal agent, "available as a terminal-based interface, desktop app, or IDE extension", licensed by Anomaly. It is **BYOK-first**:

> "With OpenCode you can use any LLM provider by configuring their API keys. If you are new to using LLM providers, we recommend using OpenCode Zen. It's a curated list of models that have been tested and verified by the OpenCode team."

— https://opencode.ai/docs/ `as of 2026-09`
The page footer carries "Last updated: Sep 18, 2026", so it is current. OpenCode Zen requires sign-in and billing details, so it is not a free tier.

## 2. Free API access

See [§6](#6-what-could-not-be-verified-and-why) for the status of this section — a dedicated research pass on free API providers was still running when this brief was written, and only the findings that were independently verified are recorded below. **This section is deliberately thin rather than padded.**

### 2.1 Google AI Studio / Gemini API — free tier, and the Philippines is supported

Two facts a Philippine learner specifically needs:

- **The Philippines is an available region** for the Gemini API. Google's available-regions page lists it.
  — https://ai.google.dev/gemini-api/docs/available-regions (page last updated 2026-04-28)
- **The free tier is not the same as the paid tier for data use.** Google's own terms draw a hard line:

> "When you use Unpaid Services, including, for example, **Google AI Studio and the unpaid quota on Gemini API, Google uses the content you submit to the Services and any generated responses to provide, improve, and develop Google products and services and machine learning technologies** … To help with quality and improve our products, **human reviewers may read, annotate, and process your API input and output.** … **Do not submit sensitive, confidential, or personal information to the Unpaid Services.**"

> "When you use Paid Services … **Google doesn't use your prompts … or responses to improve our products.**"

— https://ai.google.dev/gemini-api/terms (effective March 23, 2026)

There is a **trap documented on that same page** that inverts the naive reading: "Your access to Google AI Studio is a 'Paid Service' even when it is offered free of charge, as long as the account you are using to access Google AI Studio has access to a Cloud Project with an associated and active Cloud Billing account." Linking billing anywhere on the account flips the whole account to paid data treatment — which cuts both ways (better privacy, but no longer the free quota).

Also from the same terms: the services are "for developers building with Google AI models for professional or business purposes, **not for consumer use**", and users "must be 18 years of age or older".

**Exact free-tier rate limits for the Philippines: Unverified in this session.** The rate-limits page was not fetched. Do not quote a requests-per-day number without checking https://ai.google.dev/gemini-api/docs/rate-limits directly.

### 2.2 OpenRouter free models

OpenRouter exposes models tagged `:free`. The `:free` catalogue is real and browsable.
— https://openrouter.ai/models?max_price=0

A prior finding from this session's research pass records the limits as **20 requests/minute and 50 requests/day**, rising to 1,000/day once $10 of credits have been purchased all-time, with tier selection based on all-time credits purchased.
— https://openrouter.ai/docs/api-reference/limits

**Treat those numbers as needing a re-check before publication** — I did not personally fetch that limits page, and OpenRouter changes them. The structurally important point, which is stable: **the `:free` tier on OpenRouter trains on your data by default unless you disable it in privacy settings**, which is the standard trade for a free model. Verify the current wording at https://openrouter.ai/docs/features/privacy-and-logging before teaching it.

### 2.3 Providers with no usable free tier for a $0 learner

**Cerebras — no permanently free tier, and the trial needs a card.** Their rate-limits FAQ states that new accounts receive $5 in free credits **after adding a verified payment method**, expiring 30 days after they are granted, and answers the permanent-tier question directly with "No."
— https://inference-docs.cerebras.ai/support/rate-limits

**GitHub Models — retired.** It is gone, not merely rate-limited.
— https://docs.github.com/en/github-models

### 2.4 Free-model access inside the paid clients, revisited

The cheapest genuine "free but limited" path for a learner is not a free API at all — it is one of the $0 client tiers in [§1](#1-which-tools-have-a-genuinely-usable-free-tier) whose quota is metered in *agent work* rather than tokens. Antigravity Individual and Copilot Free are the two strongest, and neither publishes a countable number, which is itself the honest answer to "how much do I get?" — **enough to learn, not enough to rely on.**

## 3. Local and open models

A dedicated research pass on local models was still running when this brief was written. What follows is only what was verified directly. **This section is the largest acknowledged gap in the document.**

### 3.1 What the free clients themselves recommend

Continue's own docs give the most useful short list of models that are actually runnable locally, together with an honest capability warning:

> "These models can be run on your computer if you have enough VRAM. **Their limited tool calling and reasoning capabilities will make it challenging to use agent mode.**"

The local models it names: Qwen3 Coder 30B, gpt-oss-20b, Devstral Small 27B, Qwen2.5-Coder 7B, Gemma 3 4B, Qwen2.5-Coder 1.5B.
— https://docs.continue.dev/customize/models `as of 2026-09`

That warning is the single most important quality statement in this section, and it comes from a vendor with every incentive to be optimistic. **A small local model is fine for autocomplete and single-file edits, and unreliable for multi-step agent work.**

Continue's role-by-role table also states the gap plainly: for agent planning it lists "Closed models are slightly better than open models", and for apply/edit it says "Closed models are better than open models".
— same URL

### 3.2 Running local models, and the context-window trap

Aider's Ollama documentation contains a warning that is worth teaching verbatim, because it is a silent failure rather than an error:

> "Ollama uses a 2k context window by default, which is very small for working with aider. It also **silently** discards context that exceeds the window. This is especially dangerous because many users don't even realize that most of their data is being discarded by Ollama."

— https://aider.chat/docs/llms/ollama.html `as of 2026-09`

The workaround Aider documents is to set `OLLAMA_CONTEXT_LENGTH` or `num_ctx` explicitly. **Any lesson that installs Ollama and stops there will produce a tool that quietly throws away the learner's code.** Raise the context window as a required step, not an advanced tip.

Aider confirms local models are a first-class path: "Aider can work also with local models, for example using Ollama. It can also access local models that provide an Open AI compatible API."
— https://aider.chat/docs/llms.html `as of 2026-09`

### 3.3 The honest quality gap

**Partially Unverified.** No current benchmark number is recorded in this brief, because the benchmark sources that were reachable were stale and the current ones were not fetched.

What can be said from a verified source:

- Aider's polyglot leaderboard — the classic citation for "which model is best at editing code" — has **no entry newer than 2025-08-25**. Its top score is gpt-5 (high) at 88.0%.
  — https://aider.chat/docs/leaderboards/ `as of 2026-09`
- Continue, a vendor, describes open models as "approaching" closed ones for some roles and worse for others, and warns explicitly about tool-calling reliability.
  — https://docs.continue.dev/customize/models
- The only quantified gap found anywhere in this research is for **package hallucination**, where the USENIX study measured a roughly fourfold difference between model classes — 5.2% for commercial vs 21.7% for open-source models. That is a *reliability* gap, not a capability score, but it is a real and citable one: see [§4.4](#44-package-hallucination-and-slopsquatting).

**Do not write a lesson that claims local models match hosted frontier models.** Nothing verified in this session supports that, and the two vendor sources that address it say otherwise.

## 4. Security and licensing

### 4.1 You own your output — but the clauses differ more than they look

The good news first: on every free tier where a clause could be read, the vendor either assigns you the output or disclaims ownership. The bad news: "you own it" is not the same as "you are protected", and the difference is [§4.2](#42-indemnification-is-a-paid-tier-feature).

**GitHub** — ownership plus an explicit non-claim, in the terms that govern individual Copilot users:

> "**Ownership.** GitHub does not claim ownership of your Input or Output.
> Output may contain material that resembles code or content in the model's training data or that is subject to third-party copyrights or open source license terms. **You are responsible for determining whether your use of Output requires a third-party license and for complying with any such license.**"

— https://docs.github.com/en/site-policy/github-terms/github-terms-of-service (effective April 27, 2026), §J.2

Note how much work that second paragraph does: GitHub does not claim your output, and simultaneously tells you that clearing third-party rights is **your** problem.

**Anthropic** — the strongest language of any vendor found, and it is an actual assignment:

> "As between the parties and to the extent permitted by applicable law, Anthropic agrees that Customer (a) retains all rights to its Inputs, and (b) **owns its Outputs**. … **Anthropic hereby assigns to Customer its right, title and interest (if any) in and to Outputs.**"

— https://www.anthropic.com/legal/commercial-terms (effective June 17, 2025), §B

The consumer terms give free users the same assignment: "Subject to your compliance with our Terms, **we assign to you all of our right, title, and interest—if any—in Outputs.**"
— https://www.anthropic.com/legal/consumer-terms (effective October 8, 2025), §4

**Cursor** — also an assignment:

> "**You retain all of your right, title, and interest that you have in Inputs, and Anysphere hereby assigns to you all of our right, title, and interest if any in and to any Suggestions.**"

— https://cursor.com/terms-of-service (last updated September 3, 2026), §5.3

Cursor immediately pairs it with the caveat every AI vendor writes: "Suggestions are generated automatically by machine learning technology and **may be similar to or the same as Suggestions provided to other customers**, and no rights to any Suggestions generated, provided, or returned by the Service for or to other customers are granted to you." (§1.4)

**Google** — noticeably weaker. It is a non-assertion, not an assignment, and it does not say you own it:

> "**Google won't claim ownership over that content.** You acknowledge that Google may generate the same or similar content for others and that we reserve all rights to do so. … Use discretion before relying on generated content, including [code]. **You're responsible for your use of generated content**."

— https://ai.google.dev/gemini-api/terms (effective March 23, 2026)

**OpenAI — Unverified.** `openai.com` terms pages returned HTTP 403 on repeated attempts (`/policies/terms-of-use/`, `/policies/business-terms/`, `/policies/row-terms-of-use/`). No ownership or indemnity claim for OpenAI is made in this brief.

**Windsurf / Devin — Unverified.** `windsurf.com/terms-of-service` returns 404; the footer's `terms-of-service-individual` redirects cross-origin to `devin.ai` and could not be fetched.

### 4.2 Indemnification is a paid-tier feature

**The single most important legal fact for a $0 learner: you almost certainly have no intellectual-property indemnity from any vendor on a free tier.** Every indemnity that could be verified is conditioned on *paid* use.

**Anthropic** is the clearest example because the word is in the clause:

> "Anthropic will defend Customer … and indemnify them for any judgment that a court of competent jurisdiction grants a third party on such Customer Claim … 'Customer Claim' means a third-party claim, suit, or proceeding alleging that **Customer's paid use of the Services** … or Outputs generated through such authorized use violates any third-party intellectual property right."

— https://www.anthropic.com/legal/commercial-terms (effective June 17, 2025), §K.1

The same section carries exclusions that would surprise most users — protection can lapse if you **modify** the output or **combine** it: §K.3 excludes "(a) modifications made by Customer to the Services or Outputs; (b) the combination of the Services or Outputs with technology or content not provided by Anthropic."

Anthropic's **consumer** terms contain the reverse — an indemnity running *from the user to Anthropic* — and none to the user (§11).
— https://www.anthropic.com/legal/consumer-terms

**Google's** indemnity is explicitly tier-scoped. The FAQ is headed for "Gemini Code Assist **Standard and Enterprise**" and states: "Gemini Code Assist is a Generative AI Indemnified Service. If you are challenged on copyright grounds after using content generated by Gemini, then we assume certain responsibility for the potential legal risks involved."
— https://docs.cloud.google.com/gemini/docs/codeassist/faqs (last updated 2026-09-15)
The Gemini API Additional Terms grant no indemnity at all.

**Cursor's** §13 runs the other way: "you are responsible for your use of the Service, and you will defend and indemnify Anysphere … from and against any and all liabilities, claims, damages, expenses … arising out of or relating to: … (3) any claim that your Input violates any third-party intellectual property, publicity, confidentiality, privacy, or other rights."
— https://cursor.com/terms-of-service

**GitHub** routes indemnity to Business and Enterprise: "For GitHub Copilot Business and Copilot Enterprise license holders who purchase directly from GitHub, your use of GitHub Copilot is governed by the GitHub Generative AI Services Terms. … For all other GitHub Copilot users, your use of GitHub Copilot is governed by Section J." Section Q then has the individual user indemnify GitHub.
— https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features (version effective August 27, 2026) and https://docs.github.com/en/site-policy/github-terms/github-terms-of-service §Q

**Practical framing for a lesson:** you own the code, and you carry the risk. For a learner building personal projects this is almost always fine. For anything commercial, the free tier is the wrong tool, and no amount of reading the licence changes that.

### 4.3 The public-code-matching filter

GitHub Copilot can filter suggestions that duplicate public code:

> "If you choose to block suggestions matching public code, in most GitHub Copilot products, GitHub Copilot checks code suggestions with their surrounding code of **about 150 characters** against public code on GitHub. If there is a match, or a near match, the suggestion is not shown to you."

— https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies `as of 2026-09`

Two caveats from the same page that matter for a lesson:

- **It is not universal.** "If you choose to allow suggestions matching public code **or use a product that does not support 'Block' mode**…" — so the filter is absent in some Copilot surfaces.
- **Managed accounts cannot change it.** "If you are a member of an organization on GitHub Enterprise Cloud who has been assigned a GitHub Copilot seat through your organization, you will not be able to configure suggestions matching public code in your personal account settings."

**The factory default for Copilot Free is Unverified.** The docs describe the setting and how to toggle it but do not print the default in the text fetched. **Check it in-app rather than asserting it.**

No equivalent documented filter was found for Cursor, Anthropic, OpenAI or Google in any page fetched. That is weak evidence of absence, not proof.

### 4.4 Package hallucination and slopsquatting

This is the highest-value security topic in the whole brief, because it is measured, repeatable, and has already been exploited.

**The original research.** The USENIX Security '25 paper (Distinguished Paper Award) is:

> "Using **16 popular LLMs** for code generation and two unique prompt datasets, we generate **576,000 code samples** in two programming languages that we analyze for package hallucinations. Our findings reveal that the average percentage of hallucinated packages is **at least 5.2% for commercial models and 21.7% for open-source models**, including a staggering **205,474 unique examples of hallucinated package names**."

"We Have a Package for You! A Comprehensive Analysis of Package Hallucinations by Code Generating LLMs" — Spracklen, Wijewickrama, Sakib, Maiti, Viswanath, Jadliwala. USENIX Security '25, pages 3687–3706.
— https://www.usenix.org/conference/usenixsecurity25/presentation/spracklen

**The finding that turns this from an annoyance into an attack.** What makes it exploitable is not the error rate but the *repeatability* — the same prompt produces the *same* fake package name again:

- **43%** of hallucinated package names reappeared on **every** run of an identical prompt (10 runs each)
- **58%** reappeared on more than one run
- 39% were unique to a single run

Reported by the Cloud Security Alliance research note (published 2026-04-19), attributing these figures to the USENIX paper.
— https://labs.cloudsecurityalliance.org/research/csa-research-note-slopsquatting-ai-supply-chain-20260419-csa/

That is what makes a fake name worth registering: an attacker who can predict the hallucination can pre-register the package and wait. The term **"slopsquatting"** was coined by **Seth Larson**, developer-in-residence at the Python Software Foundation (same CSA source).

The same note gives a useful taxonomy of how the fakes are formed: **pure fabrications 51%**, **conflations 38%**, **typo variants 13%**, and notes that **8.7%** of Python packages hallucinated by models actually exist in the **npm** registry — cross-registry confusion. Model spread runs from **CodeLlama above 33%** in some configurations to **GPT-4 Turbo at 3.59%** (same source).

**A discrepancy to record honestly.** The CSA note states the researchers generated **2.23 million** code samples and that **440,445 (19.7%)** contained at least one hallucinated package name, while the USENIX abstract itself says **576,000** samples. These are different denominators and could not be reconciled. **The USENIX page is authoritative for the 576,000 figure; the 2.23M/19.7% pair is reported-by-CSA only.** The USENIX PDF returned "unsupported content type" to this session's fetcher, so the body could not be checked.

**Documented real-world exploitation,** per the CSA note describing Aikido Security's research:

- **`unused-imports`** (npm) — models hallucinate this in place of the legitimate `eslint-plugin-unused-imports`. The CSA note states the malicious package was still available in early February 2026 with roughly **233 weekly downloads** despite being security-held by npm.
- **`huggingface-cli`** — reported by researcher **Bar Lanyado**: Alibaba copied an AI-recommended install command into public repository documentation, accumulating **30,000+ downloads in three months**.
- **`react-codeshift`** (a conflation of `jscodeshift` and `react-codemod`) — found by **Charlie Eriksen** propagating through **237 repositories via AI-generated agent skills**, with downloads driven by autonomous agents rather than humans.

— https://labs.cloudsecurityalliance.org/research/csa-research-note-slopsquatting-ai-supply-chain-20260419-csa/
The underlying vendor page (https://www.aikido.dev/blog/slopsquatting-ai-package-hallucination-attacks) fetched but was mostly navigation chrome, so these incident figures are **one step removed from primary** and are flagged as such.

**The lesson this justifies, and it costs nothing:** before installing any package a model suggests, **search the registry for the exact name and check the download count, publisher and publish date.** An agent that installs a dependency for you can install a fake one.

**Government guidance on this: Unverified.** The OWASP GenAI LLM Top 10 supply-chain entry returned 404 and the index had no readable risk text; no NIST or CISA guidance on package hallucination was found in any page fetched.

### 4.5 Documented attacks on coding agents

**"Comment and Control" (April 2026) — credential theft from three vendors' CI agents.** Researchers Aonan Guan, with Johns Hopkins University's Zhengyu Liu and Gavin Zhong, demonstrated prompt injection against three widely deployed GitHub Actions coding agents, exfiltrating each host repository's own CI secrets using GitHub itself as the command-and-control channel.

| Agent | Injection surface | Credentials leaked | Exfil channel |
| --- | --- | --- | --- |
| Anthropic Claude Code Security Review | PR **title** (unsanitized interpolation) | `ANTHROPIC_API_KEY`, `GITHUB_TOKEN` | PR review comment |
| Google Gemini CLI Action | Issue title/body + comments | `GEMINI_API_KEY` | Issue comment |
| GitHub Copilot Agent | **Hidden HTML comment** in issue body | `GITHUB_TOKEN`, `GITHUB_COPILOT_API_TOKEN`, `GITHUB_PERSONAL_ACCESS_TOKEN` | Git commit (base64) |

— https://oddguan.com/blog/comment-and-control-prompt-injection-credential-theft-claude-code-gemini-cli-github-copilot/

Details that make this teachable:

- **Copilot's three defence layers were each bypassed.** GitHub filtered ~20 sensitive environment variables from the bash subprocess, but `ps auxeww` read the *parent* Node process, which still held them. Secret scanning looked for `ghs_`/`ghu_` prefixes and was defeated by **base64 encoding**. The network firewall allowed `github.com`, so the secret left as an ordinary `git push`.
- **The Copilot attack is invisible to the victim.** The payload sits in an HTML comment that does not render, so the person assigning the issue sees innocent text.
- **Anthropic retroactively downgraded severity from Critical (CVSS 9.4) to None on 2026-04-20**, on the stated basis that the action "is not designed to be hardened against prompt injection."
- Per CSA's independent note, **none of the three vendors issued a CVE or public advisory**.
  — https://labs.cloudsecurityalliance.org/research/csa-research-note-comment-control-github-prompt-injection-20/ (2026-04-17)

A conflict to record: CSA frames the Anthropic bounty as $1,337 paid, while the researcher's own page records **$100**. The researcher's figure is used above.

**"Rules File Backdoor" (March 2025) — prompt injection via repository config files.** Pillar Security demonstrated poisoned rule files (`.cursor/rules`, Copilot instruction files) using **invisible Unicode** — zero-width joiners and bidirectional text markers — to hide instructions from human reviewers while leaving them fully readable to the model. A rule file that looked like benign "HTML best practices" caused the agent to silently inject an attacker-controlled `<script>` tag, and the agent did not mention the change in its chat response.

— https://www.pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents

Two vendor responses worth quoting, because they define the user's actual exposure:

- **Cursor** replied on 2025-03-06 that "this risk falls under the users' responsibility" and maintained that position.
- **GitHub** replied on 2025-03-12 that "users are responsible for reviewing and accepting suggestions." GitHub later shipped a hidden-Unicode warning on github.com on 2025-05-01.

**The generalisable rule for a learner:** treat a repository's instruction files, issue text, PR titles and README content as **untrusted input to your agent**, because that is what they are.

Two further incidents are cited by the CSA note but were **not** independently verified against the CVE record or the original vendor post in this session, and are recorded as leads only: **CVE-2025-59145 ("CamoLeak", CVSS 9.6)**, a prompt injection causing Copilot Chat to exfiltrate code and secrets via GitHub's Camo image proxy, mitigated August 2025; and a **BeyondTrust Phantom Labs** finding of command injection in OpenAI Codex via a GitHub branch-name parameter.

### 4.6 Which free tiers train on your code

**GitHub Copilot — this changed, and it is the biggest privacy change in the space.** GitHub's own docs:

> "**Starting on April 24, 2026, if you have a Copilot Free, Copilot Pro, Copilot Pro+, or Copilot Max plan, GitHub may use your interactions with GitHub features and services—including inputs, outputs, code snippets, and associated context—to train and improve AI models.** This change allows us to build more intelligent, context-aware coding assistance based on real-world development patterns. **You can opt-out** from allowing your data to be used for training in your personal settings for GitHub Copilot."
> "GitHub does not use Copilot Business or Copilot Enterprise customer data to train AI models."

— https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies `as of 2026-09`

This is corroborated in the ToS itself, which frames it as a licence you grant unless you opt out:

> "You also grant GitHub and its Affiliates a license to collect and use your Inputs and Outputs to develop, train and improve artificial intelligence and machine learning models … **unless (a) you opt out through your account settings**, or (b) your use of the Service is governed by a GitHub Customer Agreement or volume licensing agreement."

— https://docs.github.com/en/site-policy/github-terms/github-terms-of-service (effective April 27, 2026), §J.3

The opt-out path is documented: Copilot settings → "Allow GitHub to use my data for AI model training" → **Disabled**. The setting is **not displayed** for Business/Enterprise accounts.

**→ Copilot Free code is used for training by default as of 2026-04-24.** This directly contradicts the widely repeated older claim that Copilot free-tier data is not used for training. Any lesson that still says that is wrong.

**Google AI Studio / Gemini API free tier** — used to train, with **human reviewers** able to read prompts and outputs, and an explicit warning not to submit confidential information (quoted in full in [§2.1](#21-google-ai-studio--gemini-api--free-tier-and-the-philippines-is-supported)).
— https://ai.google.dev/gemini-api/terms

**Anthropic** — free tier trains by default with an opt-out that has holes:

> "**We may use Materials to provide, maintain, and improve the Services and to develop other products and services, including training our models, unless you opt out of training through your account settings.** Even if you opt out, we will use Materials for model training when: (1) you provide Feedback to us regarding any Materials, or (2) your Materials are flagged for safety review…"

— https://www.anthropic.com/legal/consumer-terms (effective October 8, 2025), §4
The paid API is the opposite: "Anthropic may not train models on Customer Content from Services." (Commercial Terms §B)

**Cursor** — the outlier in the learner's favour, off by default:

> "**We do not use Inputs or Suggestions to train our models, or permit third parties to use them for training, unless:** (1) they are flagged for security review …, (2) you explicitly report them to us (for example, as Feedback), or (3) you've explicitly agreed to their use for such training purposes."

— https://cursor.com/privacy (last updated October 6, 2025)

Cursor's ToS §1.3 reinforces it in capitals, and the Data Use page explains that **Privacy Mode must be ON** for zero retention from model providers: "If you choose to **turn off** 'Privacy Mode': we may use and store codebase data, prompts, editor actions, code snippets, and other code data and actions to improve our AI features and train our models."
— https://cursor.com/terms-of-service and https://cursor.com/data-use (last updated September 3, 2026)

Cursor's Data Use page also contradicts a common assumption about BYOK: even with your own API key, "your requests will still go through our backend."

**OpenAI API — not trained on.** "Your data is your data. As of March 1, 2023, data sent to the OpenAI API is not used to train or improve OpenAI models (unless you explicitly opt in to share data with us)." Abuse-monitoring logs are retained up to 30 days by default.
— https://developers.openai.com/api/docs/guides/your-data

**OpenAI free ChatGPT tier — Unverified.** That page is the platform/API data-controls doc, and OpenAI's consumer terms pages returned 403. **No claim is made about whether free ChatGPT conversations are used for training.**

**Windsurf / Devin — Unverified.** Terms page 404s; the linked page redirects cross-origin. No claim made.

## 5. What changed recently

This section exists because a lesson written before mid-2026 will contain material errors. Each item is dated and sourced.

**2026-06-18 — Gemini CLI's free tier ended.** The most consequential change. Gemini CLI and the Gemini Code Assist IDE extensions stopped serving Google AI Pro, AI Ultra and free individual users; "Login with Google" no longer works for them. Replacement: **Antigravity CLI** and Antigravity 2.0. Enterprise/Standard customers are unaffected, and Gemini CLI remains reachable with paid API keys.
— https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli and https://developers.google.com/gemini-code-assist/docs/deprecations/code-assist-individuals

**2026-04-24 — GitHub Copilot began training on individual-tier data by default.** Copilot Free, Pro, Pro+ and Max interactions — including inputs, outputs and code snippets — may be used to train models unless the user opts out in personal settings. Business and Enterprise are excluded.
— https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies

**2026-03 — Windsurf became Devin Desktop and replaced credits with quotas.** "In March 2026, Devin Desktop replaced the credit-based system with a quota-based usage system." The docs host moved from `docs.windsurf.com` to `docs.devin.ai`. Any lesson that tells a learner to open Windsurf's credit dashboard is out of date.
— https://docs.devin.ai/desktop/accounts/quota

**2026-07-30 — GitHub Models retired.** "As of July 30, 2026, GitHub Models has been fully retired. The playground, model catalog, inference API, and bring your own key (BYOK) are no longer available to any customer."
— https://docs.github.com/en/github-models
This removes a route that many "free LLM API" listicles still recommend.

**2026 — Cline's free models became explicitly promotional.** The free-model page now describes them as "rotating, limited-time" rather than a standing tier, and pushes ClinePass at $9.99/month.
— https://docs.cline.bot/getting-started/free-models

**2026 — Continue went into maintenance-only mode.** The repository is read-only after a "final 2.0.0 release." Continue is still installable and still Apache-2.0, but it is no longer actively developed.
— https://raw.githubusercontent.com/continuedev/continue/main/README.md

**2026-09-01 — a Claude price increase was cancelled.** "The previously scheduled increase to $3/$15 per million input/output tokens on September 1, 2026 will not occur" — Sonnet 5 stays at $2/$10.
— https://platform.claude.com/docs/en/about-claude/pricing

**2026-10-14 — an upcoming retirement to plan around.** "GPT-5.5 retires from ChatGPT, ChatGPT Work, and Codex on all plans on October 14, 2026."
— https://learn.chatgpt.com/docs/pricing.md
A lesson recorded before this date that names GPT-5.5 will be wrong shortly after it.

**Model names have moved a long way.** The current Copilot supported-model list includes Claude Opus 5, Claude Opus 4.8, Claude Haiku 4.5, Kimi K3 and MAI-Code-1.1-Flash (https://docs.github.com/en/copilot/get-started/plans); Cursor's model set includes Claude Sonnet 5, Claude Opus 5, Claude Fable 5.1, Gemini 3.1 Pro, Gemini 3.8 Flash, GPT-5.6 Sol/Terra/Luna, Grok 4.6 and Composer 2.5 (https://cursor.com/docs/models-and-pricing); Codex runs the GPT-5.6 family plus GPT-6 Astra (https://learn.chatgpt.com/docs/pricing.md). **Any lesson naming GPT-4, Claude 3.5 Sonnet or Gemini 2.5 as "current" is stale.**

## 6. What could not be verified, and why

Recorded honestly rather than filled with plausible guesses.

1. **Exact Copilot Free AI-credit allowance.** GitHub's own pages state only that "an allowance" exists. No page stating the number was found. The 2,000-completions figure *is* published.
2. **Exact Cursor Hobby limits.** Described only as "Limited Agent requests". Not published numerically.
3. **Exact Codex Free quota.** The pricing page's usage tables have no Free column.
4. **Copilot Free factory default for "suggestions matching public code."** Docs describe the setting but do not print the default.
5. **OpenAI ownership, indemnity, and free-tier training position.** `openai.com` terms pages returned **HTTP 403** on repeated attempts across four URLs. Nothing about OpenAI's legal terms is asserted in this brief.
6. **Windsurf / Devin terms and training position.** `windsurf.com/terms-of-service` returns 404; its replacement link redirects cross-origin to `devin.ai` and could not be fetched.
7. **Qwen Code free-tier limits.** The authentication page fetched but its body did not decode to readable text, and the raw-markdown mirror returned 404. The "2,000 requests/day" figure is **not confirmed here**.
8. **Gemini API free-tier rate limits, and the exact Philippines eligibility wording.** The available-regions page was confirmed to list the Philippines, but the rate-limits page was not fetched. The free-tier **training** position *is* verified.
9. **Free-tier API providers generally** — a dedicated research pass on free API access (Groq, OpenRouter, Mistral, Together, DeepSeek, Z.ai/GLM, Moonshot and others) was still running when this brief was written. **Section 2 is thin by design, not by conclusion.**
10. **Local model parameters, licences, quantisation sizes and hardware minimums** — a dedicated research pass was still running. **Section 3 is the largest gap in this document**, and no current benchmark score is recorded anywhere in it.
11. **Aider GitHub issue #4751's content.** The page fetched but the issue body is client-rendered and did not decode. Only its existence and title are recorded.
12. **Aider's benchmark currency.** Its leaderboard's newest entry is 2025-08-25, so it cannot support claims about 2026 models.
13. **USENIX sample-size discrepancy.** The USENIX abstract says 576,000 samples; the CSA note says 2.23 million at 19.7%. Unreconciled; the PDF could not be parsed by the fetcher.
14. **CSA-cited incidents not independently verified:** CVE-2025-59145 (CamoLeak) and the BeyondTrust Codex command-injection finding.
15. **Aikido's specific incident figures** (233 weekly downloads, 30,000+ downloads, 237 repositories) come from the CSA note's description of Aikido's research, because Aikido's own article page rendered mostly as navigation chrome. One step removed from primary.
16. **OWASP and NIST/CISA guidance on package hallucination.** OWASP's LLM Top 10 supply-chain entry returned 404 and the index had no readable risk text; no NIST or CISA material was found.
17. **Public-code-matching filters in non-GitHub tools.** No documented equivalent found for Cursor, Anthropic, OpenAI or Google — weak evidence of absence, not proof.
18. **Antigravity credit-card requirement.** Not stated anywhere fetched; the $0/month label implies none, but this is inference, not documentation.

## 7. Sources fetched

Primary and vendor pages actually retrieved during this session, grouped by topic. Where a page redirected, the final URL is given.

**Google / Antigravity**
- https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli
- https://developers.google.com/gemini-code-assist/docs/deprecations/code-assist-individuals
- https://developers.google.com/gemini-code-assist/docs/overview
- https://geminicli.com/docs/resources/quota-and-pricing/
- https://antigravity.google/pricing
- https://antigravity.google/docs/plans
- https://antigravity.google/docs/cli/gcli-migration
- https://ai.google.dev/gemini-api/terms
- https://ai.google.dev/gemini-api/docs/available-regions

**GitHub**
- https://docs.github.com/en/copilot/get-started/plans
- https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing.md
- https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies.md
- https://docs.github.com/en/site-policy/github-terms/github-terms-of-service.md
- https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features.md
- https://docs.github.com/en/github-models
- https://raw.githubusercontent.com/github/docs/main/content/copilot/get-started/plans.md

**Cursor, Devin/Windsurf, Zed**
- https://cursor.com/pricing
- https://cursor.com/docs/models-and-pricing
- https://cursor.com/terms-of-service
- https://cursor.com/privacy
- https://cursor.com/data-use
- https://devin.ai/pricing
- https://docs.devin.ai/desktop/accounts/usage
- https://docs.devin.ai/desktop/accounts/quota
- https://zed.dev/docs/account/plans-and-pricing
- https://zed.dev/docs/ai/quick-start

**Cline, Continue, Aider, OpenCode**
- https://docs.cline.bot/getting-started/free-models
- https://docs.cline.bot/getting-started/clinepass
- https://docs.cline.bot/getting-started/authorizing-with-cline
- https://docs.continue.dev/ and https://docs.continue.dev/customize/models
- https://raw.githubusercontent.com/continuedev/continue/main/README.md
- https://aider.chat/docs/llms.html
- https://aider.chat/docs/llms/ollama.html
- https://aider.chat/docs/leaderboards/
- https://aider.chat/HISTORY.html
- https://raw.githubusercontent.com/Aider-AI/aider/main/README.md
- https://opencode.ai/docs/

**Anthropic, OpenAI, Qwen**
- https://platform.claude.com/docs/en/about-claude/pricing
- https://code.claude.com/docs/en/costs.md
- https://www.anthropic.com/legal/commercial-terms
- https://www.anthropic.com/legal/consumer-terms
- https://learn.chatgpt.com/docs/pricing.md
- https://developers.openai.com/api/docs/guides/your-data
- https://qwenlm.github.io/qwen-code-docs/en/users/configuration/auth/

**Security and licensing research**
- https://www.usenix.org/conference/usenixsecurity25/presentation/spracklen
- https://labs.cloudsecurityalliance.org/research/csa-research-note-slopsquatting-ai-supply-chain-20260419-csa/
- https://labs.cloudsecurityalliance.org/research/csa-research-note-comment-control-github-prompt-injection-20/
- https://oddguan.com/blog/comment-and-control-prompt-injection-credential-theft-claude-code-gemini-cli-github-copilot/
- https://www.pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents
- https://docs.cloud.google.com/gemini/docs/codeassist/faqs
- https://www.aikido.dev/blog/slopsquatting-ai-package-hallucination-attacks

**Other providers**
- https://inference-docs.cerebras.ai/support/rate-limits
- https://openrouter.ai/models?max_price=0
