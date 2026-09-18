# AI Coding Tool Landscape — Research Brief

**Audience:** a learner in the Philippines with a **$0 budget**.
**Compiled:** 2026-09-18.
**Scope:** the current state of AI coding tools, the free tiers that are genuinely usable, free API access, local models, and the security and licensing facts a beginner must know.

Every factual claim below is followed by a URL that was **actually fetched** during this session. A search snippet was treated as a lead, never as evidence. Aggregator and listicle sites (morphllm, cloudzero, nxcode, apidog, theaiagentindex and similar) were used to *find* primary pages and are never cited as sources.

**How to read the dates.** Volatile facts (prices, limits, model names) are stamped `as of 2026-09`. Where a vendor page prints its own “last updated” or “effective” date, that date is quoted too, because it tells you how stale the number might already be.

**The single most decision-relevant fact.** The tool that most published tutorials recommend as *the* free option — **Gemini CLI** — **stopped serving free users on 2026-06-18**. Google replaced it with **Antigravity CLI**, which does have a real $0 tier, but the free path is a different product with different commands, different config paths and a different quota model. Any lesson written before June 2026 that says “install Gemini CLI and log in with Google” is now wrong. See [§1](#1-which-tools-have-a-genuinely-usable-free-tier) and [§5](#5-what-changed-recently).

## 1. Which tools have a genuinely usable free tier

Summary table first. Details and URLs follow.

| Tool | Free tier? | Credit card? | Free code used for training? | Notes |
| --- | --- | --- | --- | --- |
| Google Antigravity CLI / 2.0 | Yes — real | No | Yes (free tier) | Replaced Gemini CLI on 2026-06-18 |
| GitHub Copilot Free | Yes — real but small | No | **Yes, since 2026-04-24** | Opt-out in personal settings |
| Cursor Hobby | Yes — “limited agent requests” | No (stated) | No by default | Limits not published numerically |
| Devin Desktop (was Windsurf) | Yes — “light quota” | No | **Unverified** | Rebranded; docs moved to docs.devin.ai |
| Cline | BYOK or rotating free promos | No | Depends on provider | No standing free model of its own |
| Continue | Free, Apache-2.0 | No | Depends on provider | **Repo now read-only — unmaintained** |
| Zed Free | Yes — editor + BYO key | No | Depends on provider | Hosted models need Pro |
| Aider | Free, open source | No | Depends on provider | BYO key; still active |
| Claude Code | **No free tier** | n/a | n/a | Requires Pro/Max or API credits |
| OpenAI Codex | Yes — Free plan exists | No | **Unverified** for free tier | Quota not published numerically |
| Qwen Code | Yes — 2,000 requests/day | No | **Unverified** | Not re-verified this session |
| OpenCode | Free, open source | No | Depends on provider | BYO key or OpenCode Zen |

### 1.1 Google Antigravity (the Gemini CLI replacement)

Gemini CLI’s free tier is **gone**. Google’s own developer blog announces the transition and prints the timeline:

> “On June 18, 2026, Gemini CLI and Gemini Code Assist IDE extensions will stop serving requests for Google AI Pro and Ultra, as well as those using it free of charge using Gemini Code Assist for individuals.”

— https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli (posted MAY 19, 2026)

The deprecation is confirmed again on the Gemini Code Assist side, with the added detail that the **“Login with Google”** option no longer works at all for those tiers:

> “Starting June 18, 2026, Gemini Code Assist IDE extensions stopped serving requests for the Gemini Code Assist for individuals, Google AI Pro, and Google AI Ultra tiers. This also applies to usage of Gemini CLI. As part of the deprecation, you can no longer use the **Login with Google** option to access the IDE extensions or Gemini CLI.”

— https://developers.google.com/gemini-code-assist/docs/deprecations/code-assist-individuals (last updated 2026-09-02 UTC)

Note the carve-out: **enterprise** access is unchanged. “If your organization uses Gemini CLI or our IDE extensions via a Gemini Code Assist Standard or Enterprise license … your access remains unchanged.” (same blog URL)

**What replaced it, and whether it is free.** The pricing page lists a **“For Individuals — $0/month”** tier, described as “Experience Antigravity without a subscription plan”:

- Agent model access to Gemini 3.8 Flash, Gemini 3.7 Flash, Gemini 3.6 Flash, Gemini 3.1 Pro, Claude Sonnet & Opus 4.6, and gpt-oss-120b
- Unlimited Tab completions
- Unlimited Command requests
- “Basic weekly rate limits”

— https://antigravity.google/pricing `as of 2026-09`

The docs page is careful to say the numbers are **not published as a number**:

> “Users not on AI Pro and Ultra plans receive: Meaningful quota, refreshed weekly; Weekly rate limit. The baseline rate limits are primarily determined to the degree we have capacity, and exist to prevent abuse. Under the hood, the rate limits are correlated with the amount of work done by the agent, which can differ from prompt to prompt.”

— https://antigravity.google/docs/plans `as of 2026-09`

Two more things from that page that matter for a lesson plan:

- There is **no bring-your-own-key**: “There is currently no support for: Bring-your-own-key or bring-your-own-endpoint for additional rate limits.”
- Free-tier overage is not purchasable: only “Users on Google AI Pro or Ultra plans can utilize purchased AI credits … for additional overage usage above the baseline provided quota.”

The migration guide matters because the config paths changed. Skills moved from `.gemini/skills/` to `.agents/skills/`, MCP config moved out of `~/.gemini/settings.json` into a standalone `mcp_config.json`, and the remote-server schema key changed from `url`/`httpUrl` to `serverUrl`. Note also that `GEMINI.md` and `AGENTS.md` are still honoured.

— https://antigravity.google/docs/cli/gcli-migration `as of 2026-09`

**Credit card:** not stated as required anywhere on the pricing or plans pages; the tier is labelled $0/month. Treat “no card required” as **likely but not explicitly documented**.

### 1.2 GitHub Copilot Free

Copilot Free still exists, but **its limits are no longer published as countable numbers**. The plans table lists the allowance as simply “An allowance of GitHub AI Credits”, where “1 AI credit = $0.01 USD”:

> “All individual plans—Copilot Free, Copilot Pro, Copilot Pro+, and Copilot Max—include a monthly GitHub AI Credits allowance that varies by plan.”

— https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing `as of 2026-09`

The one hard number that *is* published for the free tier is inline completions:

> “Copilot Free includes 2000 code completions per month and Copilot Student includes unlimited code completions.”

— same URL

Model access is restricted: “On Copilot Free and Copilot Student plans, access to models is available through **auto model selection only**.” Free also excludes the cloud agent, third-party agents, and org-wide controls, and its code review is limited to “Review selection” in VS Code.

— https://docs.github.com/en/copilot/get-started/plans `as of 2026-09`

**This is a change worth flagging in any lesson:** older write-ups describe “Copilot Free = 50 chat messages + 2,000 completions per month”. As of 2026-09 the completions figure survives but the chat allowance has been replaced by an undisclosed credit allowance. **The exact size of the Copilot Free credit allowance is Unverified** — GitHub’s own pages say only that an allowance exists, and I could not find a page stating the number.

**Credit card:** GitHub’s ToS says plainly, “Free Accounts are not required to provide payment information.”
— https://docs.github.com/en/site-policy/github-terms/github-terms-of-service (effective April 27, 2026)

### 1.3 Cursor Hobby

Cursor’s free tier is **Hobby — Free**, and it is the only plan listed as needing no card:

> “### Hobby / For the tinkerer / Free / Includes: ✓ No credit card required / ✓ Limited Agent requests / ✓ Access to Composer”

— https://cursor.com/pricing `as of 2026-09`

The limits are described only qualitatively as “Limited Agent requests” and “Limited” models. **The numeric limit is Unverified** — Cursor does not publish it on the pricing page, and its docs page on models and pricing covers paid pools only. Note the paid tiers are $20 (Individual/Pro), $40/user (Teams) and custom (Enterprise), so there is no cheap middle tier.

Cursor’s docs also reveal a **regional product**: “Start, our plan for developers in India, covers the Cursor Models pool.”
— https://cursor.com/docs/models-and-pricing `as of 2026-09`
No equivalent plan for the Philippines is documented.

### 1.4 Devin Desktop — formerly Windsurf

**Windsurf is no longer called Windsurf, and its docs have moved.** `docs.windsurf.com/windsurf/accounts/usage` now redirects cross-origin to `docs.devin.ai`, and `windsurf.com/pricing` redirects to `devin.ai`. The docs still carry a “Windsurf Plugins” section, so the brand survives as a plugin line inside Devin.

— redirect targets observed directly: https://docs.windsurf.com/windsurf/accounts/usage → `https://docs.devin.ai`; https://windsurf.com/pricing → `https://devin.ai`

The current pricing page lists a **Free $0** individual plan:

> “Free / $0 / Light quota to code with agents / Limited model availability / Unlimited inline edits / Unlimited Tab completions”

— https://devin.ai/pricing `as of 2026-09`

The usage docs confirm the plan list and explain that the credit system was replaced:

> “In March 2026, Devin Desktop replaced the credit-based system with a **quota-based usage system**. Instead of buying and spending credits, your plan now includes a daily and weekly usage allowance that refreshes automatically. … The cost per token varies by model, and **free models don’t count against your quota at all**.”

— https://docs.devin.ai/desktop/accounts/quota `as of 2026-09`

Two practical warnings from the trials section:

> “Trials are generally not offered to: Customers who have previously used Devin, Windsurf, or Codeium (including under a different account or plan). … **Eligibility is determined automatically by our systems and is not subject to appeal.**”

— https://docs.devin.ai/desktop/accounts/usage `as of 2026-09`

**Unverified:** whether Devin/Windsurf free-tier code is used for training. The terms page at `windsurf.com/terms-of-service` returns 404 and its footer link redirects cross-origin to `devin.ai`, which could not be fetched. Do not state a training position for this tool.

### 1.5 Cline

Cline is **bring-your-own-key** with no standing free model of its own. Its own docs describe the free offering as promotional and explicitly rotating:

> “Cline periodically offers **free model promotions** that let you try select models at no cost, up to a limited usage quota. … Free model promotions are offered on a rotating, limited-time basis. The specific free models available may change over time.”

— https://docs.cline.bot/getting-started/free-models `as of 2026-09`

After the free quota, the documented paths are ClinePass at **$9.99/month** (“2-5x the usage on popular open coding models compared to standard API rate”) or pay-as-you-go credits.

— https://docs.cline.bot/getting-started/clinepass and https://docs.cline.bot/getting-started/authorizing-with-cline `as of 2026-09`

For a $0 learner the useful fact is that Cline is a **free client** — the extension costs nothing and you point it at a free API key or a local model. Its cost is whatever provider you attach.

### 1.6 Continue — free, but no longer maintained

**This is a correction to a lot of current advice.** Continue is Apache-2.0 and still installable, but its repository is now **read-only**:

> “_Note: The `continuedev/continue` repository is no longer actively maintained and is read-only for all users._”
> “## Final 2.0.0 Release — We polished Continue and did a final 2.0.0 release of the VS Code extension, CLI, and JetBrains plugin.”

— https://raw.githubusercontent.com/continuedev/continue/main/README.md `as of 2026-09`

The same README states the licence: “Apache 2.0 © 2023-2026 Continue Dev, Inc.”

The docs site is still live and still recommends models, but those recommendations are visibly dated — the “Best open models” table still leads with Qwen3 Coder, Devstral, and Claude Opus 4.1, and the local-models section still leads with Qwen2.5-Coder and Gemma 3.
— https://docs.continue.dev/customize/models `as of 2026-09`

**Recommendation for the curriculum:** present Continue as “free and open source, but in maintenance-only mode — fine to use, do not expect fixes”. Do not present it as an actively developed recommendation without that caveat.

### 1.7 Zed

Zed’s free tier is genuine and clearly documented in a comparison table:

| | Free | Pro | Student | Business |
| --- | --- | --- | --- | --- |
| Zed-hosted AI models | — | ✓ | ✓ | ✓ |
| AI via own API keys | ✓ | ✓ | ✓ | ✓ |
| External Agents | ✓ | ✓ | ✓ | ✓ |
| Edit Predictions | Limited | Unlimited | Unlimited | Unlimited |

> “Zed works without AI features or a subscription. **No authentication is required for the editor itself.** … Zed Free: Zed is free to use. You can configure AI agents with your own API keys via Use API Access. Edit Predictions are available on a limited basis. **Zed’s hosted models require a Pro subscription.**”

— https://zed.dev/docs/account/plans-and-pricing `as of 2026-09`

Zed also offers a trial with a stated no-card property, but it automatically ends:

> “Trials include $5 of GPT Luna and unlimited Edit Predictions for 14 days … **No credit card is required.** Trials automatically convert to Zed Free when they end.”

— same URL

There is a student plan with “$10/month in token credits” for “verified university students” for one year, but the pricing table labels it “Student” and the docs say “Available free for one year to verified university students” — **a Philippine learner would need to check whether their institution qualifies; eligibility by country is Unverified.**

— same URL

### 1.8 Aider

Aider remains free and open source — “Aider is AI pair programming in your terminal” — and works by bringing your own key, including local models via Ollama.
— https://raw.githubusercontent.com/Aider-AI/aider/main/README.md `as of 2026-09`

It is **still actively developed**: its release history contains entries for Claude 4.5/4.6, Gemini 3 preview models, GPT-5.x variants and DeepSeek Reasoner, and the repo README advertises a “Singularity 88%” badge for the last release.
— https://aider.chat/HISTORY.html and https://raw.githubusercontent.com/Aider-AI/aider/main/README.md `as of 2026-09`

Caution for lesson-writing: **Aider’s own benchmark leaderboard is stale.** Its polyglot leaderboard’s newest entries are dated 2025-08-25 and no current frontier model appears.
— https://aider.chat/docs/leaderboards/ `as of 2026-09`
Do not cite Aider’s leaderboard as evidence about 2026 model quality.

There is an open community issue titled “Thoughts and questions about the future direction of aider”, which I fetched but whose body is rendered client-side and did not decode into readable text. **The content of that issue is Unverified** — I am recording only that it exists, not what it says.
— https://github.com/Aider-AI/aider/issues/4751

### 1.9 Claude Code — no free tier

Claude Code is **not free at any level**. Its cost docs open with:

> “Claude Code charges by API token consumption. For subscription plan pricing (Pro, Max, Team, Enterprise), see claude.com/pricing.”

— https://code.claude.com/docs/en/costs `as of 2026-09`

The same page gives a realistic cost anchor: “Across enterprise deployments, the average cost is around \$13 per developer per active day and \$150-250 per developer per month”. That is the number to quote to a learner who asks “can I just use Claude Code?” — **the answer is no, not on $0.**

Model pricing confirms the scale: Claude Sonnet 5 at $2/$10 per MTok, Opus 5 at $5/$25.
— https://platform.claude.com/docs/en/about-claude/pricing `as of 2026-09`

One genuinely useful correction from that page: “The $2/$10 per million input/output token pricing for Claude Sonnet 5, announced at launch as introductory pricing through August 31, 2026, is now the standard price. The previously scheduled increase to $3/$15 per million input/output tokens on September 1, 2026 **will not occur**.”

### 1.10 OpenAI Codex

Codex **does** have a Free plan:

> “Free / Explore Codex capabilities on quick coding tasks. / $0 / month”
— https://learn.chatgpt.com/docs/pricing.md `as of 2026-09`

But the usage-limits tables on that page list columns for **Plus, Pro 5x, Pro 20x, Standard Business and API Key only** — there is no Free column. So the free quota exists but its size is **Unverified**.

Two dated facts from the same page that a lesson should not get wrong:

- “GPT-5.5 retires from ChatGPT, ChatGPT Work, and Codex on all plans on **October 14, 2026**.”
- “Image generation isn’t available on the Free plan.”

Also note the plan naming has drifted far from the tutorials: the current model family is **GPT-5.6 (Sol, Terra, Luna)** plus GPT-6 Astra, and the paid tiers are Free / Go ($8) / Plus ($20) / Pro (from $100) / Business ($20/user) / Enterprise.

**Credit card:** not documented for Free. **Training on free-tier Codex data: Unverified** — OpenAI’s terms pages returned HTTP 403 to this session on repeated attempts (see [§6](#6-what-could-not-be-verified-and-why)).

### 1.11 Qwen Code

Qwen Code’s documentation site is live and its authentication page exists at https://qwenlm.github.io/qwen-code-docs/en/users/configuration/auth/, but the page body did not decode into readable text on fetch and the raw-markdown mirror returned 404. **The Qwen Code free-tier specifics are therefore Unverified in this session.** The widely-repeated claim of “2,000 requests per day free” is **not confirmed from a primary source here** — do not state it as fact without re-checking.

What *is* confirmed is that Qwen Code is a real, actively documented CLI with VS Code, Zed and JetBrains integrations, subagents, MCP, sandboxing and a daemon mode.
— https://qwenlm.github.io/qwen-code-docs/en/users/configuration/auth/ (navigation and page structure fetched) `as of 2026-09`

### 1.12 OpenCode

OpenCode is an open-source terminal agent, “available as a terminal-based interface, desktop app, or IDE extension”, licensed by Anomaly. It is **BYOK-first**:

> “With OpenCode you can use any LLM provider by configuring their API keys. If you are new to using LLM providers, we recommend using OpenCode Zen. It’s a curated list of models that have been tested and verified by the OpenCode team.”

— https://opencode.ai/docs/ `as of 2026-09`
The page footer carries “Last updated: Sep 18, 2026”, so it is current. OpenCode Zen requires sign-in and billing details, so it is not a free tier.

## 2. Free API access

Three providers clear the bar for a Philippine learner with no card: **Google AI Studio / Gemini API**, **Groq**, and **OpenRouter**. Cloudflare Workers AI is a smaller fourth. Everything else verified here either has no free tier, requires a card, or requires a minimum top-up.

| Provider | Free tier | Card needed? | Trains on your data? | PH status |
| --- | --- | --- | --- | --- |
| Google AI Studio / Gemini API | Yes — free models incl. Gemini 3.8 Flash | No | **Yes** (free tier) | **Explicitly listed** |
| Groq | Yes — 1K RPD on gpt-oss-120b | No | **No, by default** | No block found |
| OpenRouter | Yes — 50 RPD on `:free` models | No | Provider-dependent | No block found |
| Cloudflare Workers AI | Yes — 10,000 Neurons/day | No | **No** | No block found |
| Z.AI / GLM | Yes — Flash models free | Likely no | Not verified | Not verified |
| Mistral | Limited-period free coding endpoint | Unverified | Unverified | Unverified |
| Cerebras | **No permanent free tier** | **Yes** | — | — |
| DeepSeek | **No** — requires topped-up balance | Yes | — | — |
| Moonshot / Kimi | **No** — “recharge at least $1 to start using” | Yes | — | — |
| Together AI | **No** free allowance documented | — | May use for product improvement | — |
| GitHub Models | **Retired 2026-07-30** | — | — | — |

### 2.1 Google AI Studio / Gemini API

**The Philippines is explicitly supported.** Google’s available-regions page lists “Philippines” among available countries and territories.
— https://ai.google.dev/gemini-api/docs/available-regions (last updated 2026-04-28)

This matters because Google’s terms contain a *region* restriction that could have excluded a learner: “You may use only Paid Services when making API Clients available to users in the European Economic Area, Switzerland, or the United Kingdom.” The Philippines is not in that set, so building for Philippine users on the free tier is permitted.
— https://ai.google.dev/gemini-api/terms (effective March 23, 2026)

**Which models are free.** Gemini 3.8 Flash, Gemini 3.6 Flash, Gemini 3.5 Flash, Gemini 3.5 Flash-Lite, Gemini 3.1 Flash-Lite, Gemini 3 Flash Preview, Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 2.5 Flash-Lite, Gemma 4 and Gemini Embedding 2 are free of charge. Explicitly **not available** on the free tier: Gemini 3.7 Flash, Gemini 3.1 Pro Preview, Gemini 3.1 Flash Image, Gemini 3 Pro Image, Veo 3.1, Lyria and others. The free tier also has **no Grounding with Google Search**.
— https://ai.google.dev/gemini-api/docs/pricing `as of 2026-09`

Gemini 3.8 Flash is the one that matters for coding — the same pricing page describes it as “engineered for long-horizon software engineering, autonomous agents”. Paid price is $0.75/$3.75 per 1M tokens **through December 31, 2026**, after which it doubles.

**Exact rate limits are no longer published.** This is a change worth knowing, because third-party blogs still quote numbers that Google has withdrawn. The rate-limits page now says only: “Rate limits depend on a variety of factors (such as your usage tier) and can be viewed in Google AI Studio.” It confirms the mechanics — limits are RPM / TPM(input) / RPD, applied **per project not per API key**, with RPD resetting at midnight Pacific — and that spend-based limits are “N/A” on the free tier, whose qualification is “Active project or free trial”.
— https://ai.google.dev/gemini-api/docs/rate-limits (last updated 2026-09-02 UTC)

**Any specific “15 RPM / 1,500 RPD” figure you see quoted is unsourced as of 2026-09.** The numbers live behind a signed-in AI Studio page.

**The free tier trains on your data, and humans can read it.** This is the cost of the free tier and it is stated bluntly:

> “When you use Unpaid Services, including, for example, **Google AI Studio and the unpaid quota on Gemini API, Google uses the content you submit to the Services and any generated responses to provide, improve, and develop Google products and services and machine learning technologies** … To help with quality and improve our products, **human reviewers may read, annotate, and process your API input and output.** … **Do not submit sensitive, confidential, or personal information to the Unpaid Services.**”

The paid tier is the opposite: “When you use Paid Services … Google doesn’t use your prompts … or responses to improve our products.” The pricing page reduces this to one line per model: “Used to improve our products: Yes (Free Tier) / No (Paid Tier).”
— https://ai.google.dev/gemini-api/terms and https://ai.google.dev/gemini-api/docs/pricing

There is a **trap documented in the same terms** that inverts the naive reading: “Your access to Google AI Studio is a 'Paid Service' even when it is offered free of charge, as long as the account you are using to access Google AI Studio has access to a Cloud Project with an associated and active Cloud Billing account.” Linking billing anywhere on the account flips the whole account to paid data treatment — better privacy, but also no longer the free quota.

Two eligibility constraints, both stated in the terms: “You must be 18 years of age or older to use the APIs”, and use is “for developers building with Google AI models for professional or business purposes, **not for consumer use**”.

**Card:** none needed for the free tier; billing is only required to reach Tier 1.

### 2.2 Groq — the best data policy of the free tiers

Groq’s free plan is genuine, requires no card, and — unusually — **does not retain your data by default**:

> “By default, Groq does not retain customer data for inference requests.” Retention applies only to opt-in features (batch, fine-tuning) or for reliability and abuse, up to 30 days. “All customers may enable Zero Data Retention (ZDR) in Data Controls settings.”

— https://console.groq.com/docs/your-data

Free-plan rate limits, from the published table `as of 2026-09`:

| Model | RPM | RPD | TPM | TPD |
| --- | --- | --- | --- | --- |
| `openai/gpt-oss-120b` | 30 | 1,000 | 8K | 200K |
| `openai/gpt-oss-20b` | 30 | 1,000 | 8K | 200K |
| `qwen/qwen3.8-27b` | 30 | 1,000 | 8K | 200K |
| `groq/compound` | 30 | 250 | 70K | — |

— https://console.groq.com/docs/rate-limits

Two notes from that page: limits “apply at the organization level, not individual users”, and “Cached tokens do not count towards your rate limits.”

**Card:** “To upgrade from the Free tier to the Developer tier, you’ll need to provide a valid payment method.” The free tier itself requires none. Accepted methods when you do pay are credit cards, US bank accounts and SEPA debit accounts.
— https://console.groq.com/docs/billing-faqs

**Caveat:** Groq’s public website Terms of Use explicitly **exclude** the API — “These Terms do not apply to you in connection with your use of Groq’s cloud services … the Groq Services Agreement governs” — and that agreement could not be fetched. **Whether GroqCloud’s customer terms contain a country-eligibility restriction is Unverified.** No Philippine block was found, but “not blocked” is not the same as “affirmatively permitted”.
— https://groq.com/terms-of-use (effective October 15, 2025)

### 2.3 OpenRouter — variety, but a tight daily cap

OpenRouter’s free tier is real and needs no card, but the daily ceiling is low:

| Credits purchased (all time) | Requests per minute | Requests per day |
| --- | --- | --- |
| Less than $10 | 20 | **50** |
| At least $10 | 20 | **1,000** |

— https://openrouter.ai/docs/api_reference/limits and https://openrouter.ai/docs/faq `as of 2026-09`

Two constraints from the same pages: “Making additional accounts or API keys will not affect your rate limits, as we govern capacity globally”, and “If your account has a negative credit balance, you may see 402 errors, including for free models.”

**22 `:free` models were live at the time of research**, verified by filtering the live catalogue endpoint for IDs ending in `:free`. Coding-relevant ones include `deepseek/deepseek-v4-flash-0731:free` (1,048,576 context), `z-ai/glm-5.2:free` (32,768 context, described as “suited for long-horizon agent workflows, project-level software engineering”), `qwen/qwen3.8-27b:free` (262,144 context), `cohere/north-mini-code:free`, `poolside/laguna-s-2.1:free` and `nvidia/nemotron-3-ultra-550b-a55b:free`.
— https://openrouter.ai/api/v1/models `as of 2026-09`

One model carries an explicit anti-recommendation in its own description: `liquid/lfm-2.5-2.6b` — “Liquid advises against using it for agentic coding”. (same endpoint)

**The training policy is provider-dependent, and that is the catch.** OpenRouter itself is clean — “OpenRouter does not store your prompts or responses, unless you opt in” — but the upstream provider may not be:

> “Each provider on OpenRouter has its own data handling policies... On your account settings page, you can set whether you would like to allow routing to providers that may train on your data (according to their own policies). **There are separate settings for paid and free models.**”
> “Providers that do log, or where we have been unable to confirm their policy, **will not be routed to unless the model training toggle is switched on** in the privacy settings tab.”

— https://openrouter.ai/docs/guides/privacy/provider-logging and https://openrouter.ai/docs/faq

**Unverified:** the per-provider train/don’t-train flag for each individual `:free` model. That table is client-rendered and was not present in the fetched HTML. **Unverified:** OpenRouter’s terms-level Philippine eligibility (the terms page rendered client-side with no readable body), though no block was found.

### 2.4 Cloudflare Workers AI — small, but the cleanest data terms

> “Workers AI is included in both the Free and Paid Workers plans and is priced at **$0.011 per 1,000 Neurons**. Our free allocation allows anyone to use a total of **10,000 Neurons per day at no charge**... All limits reset daily at 00:00 UTC.”

— https://developers.cloudflare.com/workers-ai/platform/pricing/ (last updated Sep 17, 2026)
Text generation is capped at 300 requests per minute — https://developers.cloudflare.com/workers-ai/platform/limits/ (last updated Sep 17, 2026)

The data policy is the strongest of any provider found:

> “Cloudflare does not use your Customer Content to (1) train any AI models made available on Workers AI or (2) improve any Cloudflare or third-party services, and would not do so unless we received your explicit consent.”

— https://developers.cloudflare.com/workers-ai/platform/data-usage/ (last updated Apr 21, 2026)

**Important catch:** the best coding models require a paid billing method. Named explicitly as paid-only: `@cf/moonshotai/kimi-k2.6`, `@cf/moonshotai/kimi-k2.7-code`, `@cf/zai-org/glm-5.2`, `@cf/zai-org/glm-5.3`, `@cf/zai-org/glm-5.3-flash`, `@cf/deepseek-ai/deepseek-v4-flash-0731` and `@cf/deepseek-ai/deepseek-v4-pro-0813`. Free-tier-usable coding models include `@cf/qwen/qwen2.5-coder-32b-instruct` and `@cf/openai/gpt-oss-120b`.

**Reality check on the size:** at 10,000 Neurons/day, `qwen2.5-coder-32b-instruct` yields roughly **160K input tokens per day**. That is a real allowance but a small one — enough for a study session, not a working day.

### 2.5 Z.AI / GLM — free Flash models

Z.AI’s pricing page lists several models with every price column reading “Free”: **GLM-4.7-Flash**, **GLM-4.5-Flash** and **GLM-4.6V-Flash** (a vision model). Everything else is paid (GLM-5.3 at $1.4/$4.4 per 1M, GLM-5.3-Flash at $0.15/$0.50).
— https://docs.z.ai/guides/overview/pricing `as of 2026-09`

Signup is documented as: “Access Z.AI Open Platform, Register or Login. Access Billing Page to top up **if needed**. Create an API Key.” The “if needed” phrasing implies the free models work without payment.
— https://docs.z.ai/guides/overview/quick-start

**Unverified:** Z.AI’s rate limits for the free Flash models (no rate-limit page found), whether a card is required at signup, and Philippine eligibility. The docs’ own upsell copy — “Tired of limits? GLM Coding Plan — monthly access... All from just $18/month” — implies the free tiers are meaningfully rate-limited.

### 2.6 Mistral — a free coding endpoint exists, but the free *plan* is unverifiable

The documented “Experiment” plan URL returns **HTTP 404**; Mistral restructured its docs around Vibe / Studio / Admin, and the `laplateforme/tier` path is dead — including the `.md` variant that Mistral’s own `llms.txt` still advertises.
— https://docs.mistral.ai/deployment/laplateforme/tier/ → 404; https://docs.mistral.ai/llms.txt

What *is* verified: Mistral’s API pricing page carries a “Coding API endpoint” line reading “We are keeping this endpoint highly accessible for a **limited period** to gather realistic feedback and observability data to fuel the next generation of verified code models. **Free**”, and marks Mistral Moderation 2 as free.
— https://mistral.ai/pricing/api/

**Unverified:** the existence, shape and limits of any “Experiment” plan, whether a card is required, the free endpoint’s model name and rate limits, and PH eligibility. **Do not put numbers in a lesson.**

### 2.7 Providers with no usable free tier for a $0 learner

**Cerebras — no permanently free tier, and the trial needs a card.** Their rate-limits FAQ is unambiguous:

> “New accounts receive **$5 in free credits after adding a verified payment method**. These credits expire 30 days after they’re granted... If you skip adding a payment method at sign-up, Playground and API access remain inactive until you do.”
> “**Is there a permanently free tier? No.** ... Cerebras doesn’t currently offer a no-cost tier that renews automatically or a per-model always-free allowance.”

— https://inference-docs.cerebras.ai/support/rate-limits

This is a direct correction to the common belief that Cerebras is a generous free provider. It fails on both card and permanence.

**GitHub Models — retired.** “As of **July 30, 2026**, GitHub Models has been fully retired. The playground, model catalog, inference API, and bring your own key (BYOK) are no longer available to any customer.”
— https://docs.github.com/en/github-models

**DeepSeek — no free tier.** Pricing is per-token, and the docs state the cost “will be directly deducted from your topped-up balance or granted balance”. A topped-up balance is required.
— https://api-docs.deepseek.com/quick_start/pricing

**Moonshot / Kimi — requires a minimum top-up.** “To prevent abuse, you need to **recharge at least $1 to start using**, and when your cumulative recharge reaches $5, you will receive a $5 voucher.” Rate limits are keyed to cumulative recharge.
— https://platform.kimi.ai/docs/pricing/limits

**Together AI — no documented free allowance.** “Together uses **dynamic rate limits** instead of fixed thresholds... there are **no fixed per-model limits published**.” Its privacy page also notes that “By default, Together stores the prompts you send and the responses models return, and **may use them for product improvements**.”
— https://docs.together.ai/docs/serverless/rate-limits and https://docs.together.ai/docs/privacy-and-security

**Not investigated:** NVIDIA NIM, Fireworks, and Alibaba Model Studio / Qwen. No official pages were fetched, so no claim is made about their free allowances or PH access.

### 2.8 The practical $0 API stack

The strongest verified combination is **Gemini free tier for capability, Groq free tier for privacy and volume, OpenRouter for model variety**. That covers a learner’s needs without a card. The trade to teach explicitly: **Gemini’s free tier is the most capable and the least private** — Google states that human reviewers may read free-tier prompts and outputs. Groq inverts that: 1,000 requests/day on gpt-oss-120b with no retention by default.

## 3. Local and open models

**The uncomfortable headline: the best open-weight coding models in the world as of 2026-09 are datacenter-only.** GLM-5, Kimi K3 and DeepSeek V4 are all 290B–2.8T-parameter models whose minimum practical footprint is measured in hundreds of gigabytes. Their licences are genuinely open (some MIT), but “open weights” here means “downloadable by anyone with a cluster”, not “runnable by anyone”. **A learner on a laptop cannot run them at any quantisation.**

The realistic local tier is **7B–30B**, where the honest standouts are **Gemma 4 12B**, **Qwen3-Coder-30B-A3B**, **gpt-oss-20b** and **Qwen3.8-27B** — three of which are Apache-2.0, and one of which (gpt-oss-20b) has an explicit vendor memory target that fits a 16 GB laptop.

### 3.1 Three model names that do not exist

These came up as candidates and are **false as of 2026-09**. Do not let them into a lesson.

| Commonly written | Reality |
| --- | --- |
| “Qwen3.5-Coder” / “Qwen3.8-Coder” | **Does not exist.** The official coder line ends at **Qwen3-Coder** (30B-A3B, 480B-A35B). The Qwen main line moved to Qwen3.8-27B / Qwen3.8-2.4T-A95B. |
| “Llama 5” | **Does not exist.** Meta’s newest open weights are still **Llama 4 Scout/Maverick (April 2025)** — roughly 17 months old. “Llama 5 leak” blog posts are not evidence. |
| “DeepSeek-Coder-V3” | Superseded. The current release is **DeepSeek V4** (V4-Pro 1.6T / V4-Flash 290B), MIT-licensed. |

Verified by enumerating the Hugging Face API listings for those organisations — third-party fine-tunes with those names exist, official ones do not.
— https://huggingface.co/api/models?author=meta-llama&sort=createdAt&direction=-1&limit=20 `as of 2026-09`

### 3.2 Frontier open-weight tier — not runnable by an individual

| Model | Params (total / active) | Context | Licence | Runnable on |
| --- | --- | --- | --- | --- |
| GLM-5 (Z.ai) | 744B / 40B MoE | 200K | **MIT** | 8× H200/H20 minimum |
| Kimi K3 (Moonshot) | 2.8T / 104B MoE | 1,048,576 | **Custom “Kimi K3 License”** | Datacenter |
| DeepSeek V4-Pro | 1.6T / 49B MoE | 1M | **MIT** | ~860 GB at FP8 |
| DeepSeek V4-Flash | 290B / 13B MoE | 1M | **MIT** | ~160 GB at FP8 |
| Qwen3.8-2.4T-A95B | 2.4T / 95B MoE | — | `license: other` | Datacenter |

The tell for GLM-5 is in its own deployment recipe: `--tensor-parallel-size 8`. A Hugging Face community analysis is blunt about the consequence — “you’ll need at least 8 H200s (or H20s) for FP8 inference… It is an API model for 99% of users.”
— https://huggingface.co/zai-org/GLM-5 and https://huggingface.co/blog/mlabonne/glm-5

**Do not call Kimi K3 “open source” without qualification.** Its licence is permissive for individuals, but §2 requires a separate agreement with Moonshot if you operate a “Model as a Service” business above $20M revenue over any 12 months, and §3 requires prominent UI attribution above 100M MAU or $20M monthly revenue. Irrelevant to a Filipino learner in practice; wrong as a blanket claim.
— https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE

DeepSeek V4's licence and parameter counts were verified directly from the Hugging Face API (`license:mit`; safetensors totals 290.9B for Flash and 1.599T for Pro; `quant_method: fp8`).
— https://huggingface.co/api/models/deepseek-ai/DeepSeek-V4-Flash and https://huggingface.co/api/models/deepseek-ai/DeepSeek-V4-Pro

### 3.3 The realistic local tier

GGUF sizes marked *(measured)* come from the Hugging Face API blob listing, not from estimates.

| Model | Params (total / active) | Context | Licence | Notable quants (measured sizes) |
| --- | --- | --- | --- | --- |
| **Gemma 4 12B-it** | 12B dense | 262,144 | **Apache-2.0** | Q4_K_M **7.12 GB**, IQ4_XS **6.38 GB**, Q8_0 12.67 GB, UD-Q2_K_XL 4.66 GB |
| **gpt-oss-20b** (OpenAI) | 21B / 3.6B MoE | 131,072 | **Apache-2.0** | MXFP4/F16 **13.79 GB**, Q4_K_M **11.62 GB** |
| **Qwen3-Coder-30B-A3B** | 30.5B / 3.3B MoE | 262,144 native | **Apache-2.0** | UD-Q4_K_XL **17.67 GB**, Q4_K_M **18.56 GB**, UD-IQ2_XXS 10.33 GB |
| **Qwen3.8-27B** | 27B dense | 262,144 → 1M (YaRN) | **Apache-2.0** | Q4_0 **16.06 GB**, UD-Q4_K_M **16.46 GB**, UD-IQ2_XXS 7.27 GB |
| **Devstral-Small-2-24B** | 24B dense | 262,144 | **Apache-2.0** | FP8 as shipped |
| gpt-oss-120b | 117B / 5.1B MoE | 131,072 | **Apache-2.0** | 65 GB — needs an 80 GB GPU |
| Llama 4 Scout | 109B / 17B MoE | 10M | **`license:other`** (Llama Community) | — |
| Llama 4 Maverick | 400B / 17B MoE | 1M | **`license:other`** | — |

— https://huggingface.co/api/models/unsloth/gemma-4-12b-it-GGUF?blobs=true · https://huggingface.co/openai/gpt-oss-20b · https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct · https://huggingface.co/Qwen/Qwen3.8-27B · https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512 · https://ollama.com/library/qwen3-coder:30b `as of 2026-09`

**A licence flag not to soften:** **Llama 4 is `license:other`, not Apache-2.0.** It is the Llama Community Licence with its own acceptable-use and naming terms. Several “open model” round-ups list it alongside Apache-2.0 models without that distinction.

### 3.4 Minimum hardware

Two pieces of *official vendor* hardware guidance exist and are worth quoting verbatim:

> **gpt-oss-20b:** “The models were post-trained with MXFP4 quantization of the MoE weights, making gpt-oss-120b run on a single 80GB GPU (like NVIDIA H100 or AMD MI300X) and the gpt-oss-20b model **run within 16GB of memory**.”

— https://huggingface.co/openai/gpt-oss-20b

> **Devstral Small 2:** “with its compact size of just 24 billion parameters, Devstral is light enough to **run on a single RTX 4090 or a Mac with 32GB RAM**.”

— https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512

Ollama’s library page corroborates the mechanism: MXFP4 “enables the smaller model to run on systems with as little as 16GB memory.”
— https://ollama.com/library/gpt-oss

| Machine | What realistically runs | Notes |
| --- | --- | --- |
| **8 GB RAM, no GPU** | Gemma 4 12B at UD-Q2_K_XL (4.66 GB) or IQ4_XS (6.38 GB), tight; ~3–4B models comfortably | **No official vendor guidance exists for 8 GB** — this row is inference from measured file sizes, not a verified claim. Expect slow CPU-only generation. |
| **16 GB RAM, no GPU** | **gpt-oss-20b Q4_K_M (11.62 GB)** — the vendor-stated target; Gemma 4 12B Q4_K_M (7.12 GB) with room to spare | The realistic sweet spot for this brief’s audience. |
| **16 GB RAM + 8 GB VRAM** | gpt-oss-20b, Gemma 4 12B, Qwen3.8-27B at Q4 | MoE models offload experts to CPU; llama.cpp supports CPU+GPU hybrid inference. |
| **32 GB RAM / M-series Mac** | **Devstral-Small-2-24B** (vendor-stated); Qwen3-Coder-30B at Q4 (~17.7 GB) | Qwen3-Coder is MoE with 3.3B active, so it generates fast even when memory-bound. |
| **24 GB VRAM (RTX 4090)** | Everything above at Q4/Q5; gpt-oss-120b still needs 80 GB | |

**The context-length caveat matters more than people expect.** A 262K-token context is not free. Qwen’s own card warns: “If you encounter out-of-memory (OOM) issues, consider reducing the context length to a shorter value, such as 32,768.”
— https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
For agentic coding on a small machine, budget 16K–32K, not 256K.

### 3.5 The quality gap — honestly stated

**Every benchmark figure in this section is vendor-reported (self-reported). No third-party-verified SWE-bench number could be obtained**, because the SWE-bench leaderboard is JavaScript-rendered and returned no ranking rows to fetch (see [§6](#6-what-could-not-be-verified-and-why)).

**At the frontier, the gap has effectively closed on paper.** GLM-5 reports **77.8** on SWE-bench Verified against Claude Opus 4.5's **80.9** — a ~3-point gap within benchmark noise — and Z.ai’s own card shows GLM-5 beating Gemini 3 Pro (76.2) on several agentic suites. But none of that is available to a learner: those models need 8 GPUs.
— https://huggingface.co/zai-org/GLM-5

**At the tier you can actually run, the gap is qualitatively different, not a few points.** Devstral Small 2 (24B) reports **68.0** on SWE-bench Verified — about 13 points below Opus 4.5 — but the more revealing number is its **Terminal Bench 2 score of 22.5 against GPT-5.1 Codex Max’s 60.4**. That is the real finding: **short-horizon code generation is where small models are respectable; long-horizon agentic task execution is where they fall apart.**
— https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512

Qwen reports Qwen3.8-27B at LiveCodeBench v6 = 90.3, SWE-bench Pro = 61.7 and Terminal Bench 2.1 = 73.0, against Opus 4.6 Max at 78.2 on Terminal Bench 2.1. Note Qwen ran all of these itself through the Claude Code harness.
— https://huggingface.co/Qwen/Qwen3.8-27B

**A serious caution about SWE-bench Verified as an instrument.** A Hugging Face community analysis reports that “The SWE-bench Verified verifier has been shown to accept approximately 8.5% of functionally incorrect solutions”, and that on **DeepSWE**, a contamination-free benchmark across 91 repositories and 5 programming languages, DeepSeek V4-Pro scores **8% pass@1 against GPT-5.5 at 70%** — while the same model reports 80.6 on SWE-bench Verified. This is a **single unverified third-party claim**, but the 8-versus-70 spread is the strongest available signal that SWE-bench Verified has saturated and no longer separates models. Treat it as a warning against quoting SWE-bench Verified as if it settled a comparison.
— https://huggingface.co/blog/ResterChed/deepseek-v4-ga-architecture

**The translation for a learner:** a 12B–30B local model is genuinely useful for autocomplete, explaining unfamiliar code, writing self-contained functions, generating tests, and refactoring a single file. It is **not** a substitute for a frontier agent on a multi-file, multi-hour task — it loses the thread, mis-uses tools, and needs far more supervision. Continue’s own docs make the same point in one sentence: open local models’ “limited tool calling and reasoning capabilities will make it challenging to use agent mode.”
— https://docs.continue.dev/customize/models

**Do not write a lesson claiming local models match hosted frontier models.** Nothing verified here supports it, and the vendor sources that address it say otherwise.

### 3.6 Local tooling — free, and OpenAI-compatible

All verified free of charge; licences read from the actual LICENSE file, not assumed.

| Tool | Licence | OpenAI-compatible endpoint? |
| --- | --- | --- |
| **Ollama** | **MIT** | Yes — `http://localhost:11434/v1/` |
| **llama.cpp** | **MIT** | Yes — `llama serve` |
| **LM Studio** | **MIT** (Element Labs) | Yes — `http://localhost:1234/v1`, plus `/v1/responses` for Codex |
| **Jan** | **Apache-2.0** (Menlo Research) | Yes |
| **vLLM** | **Apache-2.0** | Yes — but targets GPU servers |

— https://raw.githubusercontent.com/ollama/ollama/main/LICENSE · https://docs.ollama.com/api/openai-compatibility · https://raw.githubusercontent.com/ggml-org/llama.cpp/master/README.md · https://lmstudio.ai/docs/developer/openai-compat · https://raw.githubusercontent.com/janhq/jan/dev/LICENSE · https://raw.githubusercontent.com/vllm-project/vllm/main/LICENSE `as of 2026-09`

For a Philippine learner the ranking is **Ollama first** (simplest install, native MXFP4 support for gpt-oss, documented `/v1` endpoint), **LM Studio second** (GUI, and the only one verified as implementing `POST /v1/responses`, which Codex needs), **llama.cpp** for maximum control and CPU-only machines. **vLLM is the wrong tool here** — it targets GPU servers.

Compatibility with the coding clients is confirmed from the model cards themselves: Qwen3-Coder’s card states “Agentic Coding supporting for most platform such as Qwen Code, **CLINE**”, and Devstral Small 2's card lists **Cline, Kilo Code, Claude Code, OpenHands, SWE Agent** plus llama.cpp, LM Studio and Ollama.
— https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct and https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512

**A warning:** Ollama also offers a **cloud** path at `https://ollama.com/v1` with an API key, but that is a **paid hosted service**, not a $0 local option. Do not present it as free.

### 3.7 The context-window trap

Aider’s Ollama documentation contains a warning worth teaching verbatim, because it is a silent failure rather than an error:

> “Ollama uses a 2k context window by default, which is very small for working with aider. It also **silently** discards context that exceeds the window. This is especially dangerous because many users don’t even realize that most of their data is being discarded by Ollama.”

— https://aider.chat/docs/llms/ollama.html `as of 2026-09`

The workaround is to set `OLLAMA_CONTEXT_LENGTH` or `num_ctx` explicitly. **Any lesson that installs Ollama and stops there will produce a tool that quietly throws away the learner’s code.** Raise the context window as a required step, not an advanced tip.

Aider confirms local models are a first-class path: “Aider can work also with local models, for example using Ollama. It can also access local models that provide an Open AI compatible API.”
— https://aider.chat/docs/llms.html `as of 2026-09`
## 4. Security and licensing

### 4.1 You own your output — but the clauses differ more than they look

The good news first: on every free tier where a clause could be read, the vendor either assigns you the output or disclaims ownership. The bad news: “you own it” is not the same as “you are protected”, and the difference is [§4.2](#42-indemnification-is-a-paid-tier-feature).

**GitHub** — ownership plus an explicit non-claim, in the terms that govern individual Copilot users:

> “**Ownership.** GitHub does not claim ownership of your Input or Output.
> Output may contain material that resembles code or content in the model’s training data or that is subject to third-party copyrights or open source license terms. **You are responsible for determining whether your use of Output requires a third-party license and for complying with any such license.**“

— https://docs.github.com/en/site-policy/github-terms/github-terms-of-service (effective April 27, 2026), §J.2

Note how much work that second paragraph does: GitHub does not claim your output, and simultaneously tells you that clearing third-party rights is **your** problem.

**Anthropic** — the strongest language of any vendor found, and it is an actual assignment:

> “As between the parties and to the extent permitted by applicable law, Anthropic agrees that Customer (a) retains all rights to its Inputs, and (b) **owns its Outputs**. … **Anthropic hereby assigns to Customer its right, title and interest (if any) in and to Outputs.**”

— https://www.anthropic.com/legal/commercial-terms (effective June 17, 2025), §B

The consumer terms give free users the same assignment: “Subject to your compliance with our Terms, **we assign to you all of our right, title, and interest—if any—in Outputs.**”
— https://www.anthropic.com/legal/consumer-terms (effective October 8, 2025), §4

**Cursor** — also an assignment:

> “**You retain all of your right, title, and interest that you have in Inputs, and Anysphere hereby assigns to you all of our right, title, and interest if any in and to any Suggestions.**”

— https://cursor.com/terms-of-service (last updated September 3, 2026), §5.3

Cursor immediately pairs it with the caveat every AI vendor writes: “Suggestions are generated automatically by machine learning technology and **may be similar to or the same as Suggestions provided to other customers**, and no rights to any Suggestions generated, provided, or returned by the Service for or to other customers are granted to you.” (§1.4)

**Google** — noticeably weaker. It is a non-assertion, not an assignment, and it does not say you own it:

> “**Google won’t claim ownership over that content.** You acknowledge that Google may generate the same or similar content for others and that we reserve all rights to do so. … Use discretion before relying on generated content, including [code]. **You’re responsible for your use of generated content**.”

— https://ai.google.dev/gemini-api/terms (effective March 23, 2026)

**OpenAI — Unverified.** `openai.com` terms pages returned HTTP 403 on repeated attempts (`/policies/terms-of-use/`, `/policies/business-terms/`, `/policies/row-terms-of-use/`). No ownership or indemnity claim for OpenAI is made in this brief.

**Windsurf / Devin — Unverified.** `windsurf.com/terms-of-service` returns 404; the footer’s `terms-of-service-individual` redirects cross-origin to `devin.ai` and could not be fetched.

### 4.2 Indemnification is a paid-tier feature

**The single most important legal fact for a $0 learner: you almost certainly have no intellectual-property indemnity from any vendor on a free tier.** Every indemnity that could be verified is conditioned on *paid* use.

**Anthropic** is the clearest example because the word is in the clause:

> “Anthropic will defend Customer … and indemnify them for any judgment that a court of competent jurisdiction grants a third party on such Customer Claim … 'Customer Claim' means a third-party claim, suit, or proceeding alleging that **Customer’s paid use of the Services** … or Outputs generated through such authorized use violates any third-party intellectual property right.”

— https://www.anthropic.com/legal/commercial-terms (effective June 17, 2025), §K.1

The same section carries exclusions that would surprise most users — protection can lapse if you **modify** the output or **combine** it: §K.3 excludes “(a) modifications made by Customer to the Services or Outputs; (b) the combination of the Services or Outputs with technology or content not provided by Anthropic.”

Anthropic’s **consumer** terms contain the reverse — an indemnity running *from the user to Anthropic* — and none to the user (§11).
— https://www.anthropic.com/legal/consumer-terms

**Google’s** indemnity is explicitly tier-scoped. The FAQ is headed for “Gemini Code Assist **Standard and Enterprise**” and states: “Gemini Code Assist is a Generative AI Indemnified Service. If you are challenged on copyright grounds after using content generated by Gemini, then we assume certain responsibility for the potential legal risks involved.”
— https://docs.cloud.google.com/gemini/docs/codeassist/faqs (last updated 2026-09-15)
The Gemini API Additional Terms grant no indemnity at all.

**Cursor’s** §13 runs the other way: “you are responsible for your use of the Service, and you will defend and indemnify Anysphere … from and against any and all liabilities, claims, damages, expenses … arising out of or relating to: … (3) any claim that your Input violates any third-party intellectual property, publicity, confidentiality, privacy, or other rights.”
— https://cursor.com/terms-of-service

**GitHub** routes indemnity to Business and Enterprise: “For GitHub Copilot Business and Copilot Enterprise license holders who purchase directly from GitHub, your use of GitHub Copilot is governed by the GitHub Generative AI Services Terms. … For all other GitHub Copilot users, your use of GitHub Copilot is governed by Section J.” Section Q then has the individual user indemnify GitHub.
— https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features (version effective August 27, 2026) and https://docs.github.com/en/site-policy/github-terms/github-terms-of-service §Q

**Practical framing for a lesson:** you own the code, and you carry the risk. For a learner building personal projects this is almost always fine. For anything commercial, the free tier is the wrong tool, and no amount of reading the licence changes that.

### 4.3 The public-code-matching filter

GitHub Copilot can filter suggestions that duplicate public code:

> “If you choose to block suggestions matching public code, in most GitHub Copilot products, GitHub Copilot checks code suggestions with their surrounding code of **about 150 characters** against public code on GitHub. If there is a match, or a near match, the suggestion is not shown to you.”

— https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies `as of 2026-09`

Two caveats from the same page that matter for a lesson:

- **It is not universal.** “If you choose to allow suggestions matching public code **or use a product that does not support 'Block' mode**…” — so the filter is absent in some Copilot surfaces.
- **Managed accounts cannot change it.** “If you are a member of an organization on GitHub Enterprise Cloud who has been assigned a GitHub Copilot seat through your organization, you will not be able to configure suggestions matching public code in your personal account settings.”

**The factory default for Copilot Free is Unverified.** The docs describe the setting and how to toggle it but do not print the default in the text fetched. **Check it in-app rather than asserting it.**

No equivalent documented filter was found for Cursor, Anthropic, OpenAI or Google in any page fetched. That is weak evidence of absence, not proof.

### 4.4 Package hallucination and slopsquatting

This is the highest-value security topic in the whole brief, because it is measured, repeatable, and has already been exploited.

**The original research.** The USENIX Security '25 paper (Distinguished Paper Award) is:

> “Using **16 popular LLMs** for code generation and two unique prompt datasets, we generate **576,000 code samples** in two programming languages that we analyze for package hallucinations. Our findings reveal that the average percentage of hallucinated packages is **at least 5.2% for commercial models and 21.7% for open-source models**, including a staggering **205,474 unique examples of hallucinated package names**.”

“We Have a Package for You! A Comprehensive Analysis of Package Hallucinations by Code Generating LLMs” — Spracklen, Wijewickrama, Sakib, Maiti, Viswanath, Jadliwala. USENIX Security '25, pages 3687–3706.
— https://www.usenix.org/conference/usenixsecurity25/presentation/spracklen

**The finding that turns this from an annoyance into an attack.** What makes it exploitable is not the error rate but the *repeatability* — the same prompt produces the *same* fake package name again:

- **43%** of hallucinated package names reappeared on **every** run of an identical prompt (10 runs each)
- **58%** reappeared on more than one run
- 39% were unique to a single run

Reported by the Cloud Security Alliance research note (published 2026-04-19), attributing these figures to the USENIX paper.
— https://labs.cloudsecurityalliance.org/research/csa-research-note-slopsquatting-ai-supply-chain-20260419-csa/

That is what makes a fake name worth registering: an attacker who can predict the hallucination can pre-register the package and wait. The term **“slopsquatting”** was coined by **Seth Larson**, developer-in-residence at the Python Software Foundation (same CSA source).

The same note gives a useful taxonomy of how the fakes are formed: **pure fabrications 51%**, **conflations 38%**, **typo variants 13%**, and notes that **8.7%** of Python packages hallucinated by models actually exist in the **npm** registry — cross-registry confusion. Model spread runs from **CodeLlama above 33%** in some configurations to **GPT-4 Turbo at 3.59%** (same source).

**A discrepancy to record honestly.** The CSA note states the researchers generated **2.23 million** code samples and that **440,445 (19.7%)** contained at least one hallucinated package name, while the USENIX abstract itself says **576,000** samples. These are different denominators and could not be reconciled. **The USENIX page is authoritative for the 576,000 figure; the 2.23M/19.7% pair is reported-by-CSA only.** The USENIX PDF returned “unsupported content type” to this session’s fetcher, so the body could not be checked.

**Documented real-world exploitation,** per the CSA note describing Aikido Security’s research:

- **`unused-imports`** (npm) — models hallucinate this in place of the legitimate `eslint-plugin-unused-imports`. The CSA note states the malicious package was still available in early February 2026 with roughly **233 weekly downloads** despite being security-held by npm.
- **`huggingface-cli`** — reported by researcher **Bar Lanyado**: Alibaba copied an AI-recommended install command into public repository documentation, accumulating **30,000+ downloads in three months**.
- **`react-codeshift`** (a conflation of `jscodeshift` and `react-codemod`) — found by **Charlie Eriksen** propagating through **237 repositories via AI-generated agent skills**, with downloads driven by autonomous agents rather than humans.

— https://labs.cloudsecurityalliance.org/research/csa-research-note-slopsquatting-ai-supply-chain-20260419-csa/
The underlying vendor page (https://www.aikido.dev/blog/slopsquatting-ai-package-hallucination-attacks) fetched but was mostly navigation chrome, so these incident figures are **one step removed from primary** and are flagged as such.

**The lesson this justifies, and it costs nothing:** before installing any package a model suggests, **search the registry for the exact name and check the download count, publisher and publish date.** An agent that installs a dependency for you can install a fake one.

**Government guidance on this: Unverified.** The OWASP GenAI LLM Top 10 supply-chain entry returned 404 and the index had no readable risk text; no NIST or CISA guidance on package hallucination was found in any page fetched.

### 4.5 Documented attacks on coding agents

**“Comment and Control” (April 2026) — credential theft from three vendors’ CI agents.** Researchers Aonan Guan, with Johns Hopkins University’s Zhengyu Liu and Gavin Zhong, demonstrated prompt injection against three widely deployed GitHub Actions coding agents, exfiltrating each host repository’s own CI secrets using GitHub itself as the command-and-control channel.

| Agent | Injection surface | Credentials leaked | Exfil channel |
| --- | --- | --- | --- |
| Anthropic Claude Code Security Review | PR **title** (unsanitized interpolation) | `ANTHROPIC_API_KEY`, `GITHUB_TOKEN` | PR review comment |
| Google Gemini CLI Action | Issue title/body + comments | `GEMINI_API_KEY` | Issue comment |
| GitHub Copilot Agent | **Hidden HTML comment** in issue body | `GITHUB_TOKEN`, `GITHUB_COPILOT_API_TOKEN`, `GITHUB_PERSONAL_ACCESS_TOKEN` | Git commit (base64) |

— https://oddguan.com/blog/comment-and-control-prompt-injection-credential-theft-claude-code-gemini-cli-github-copilot/

Details that make this teachable:

- **Copilot’s three defence layers were each bypassed.** GitHub filtered ~20 sensitive environment variables from the bash subprocess, but `ps auxeww` read the *parent* Node process, which still held them. Secret scanning looked for `ghs_`/`ghu_` prefixes and was defeated by **base64 encoding**. The network firewall allowed `github.com`, so the secret left as an ordinary `git push`.
- **The Copilot attack is invisible to the victim.** The payload sits in an HTML comment that does not render, so the person assigning the issue sees innocent text.
- **Anthropic retroactively downgraded severity from Critical (CVSS 9.4) to None on 2026-04-20**, on the stated basis that the action “is not designed to be hardened against prompt injection.”
- Per CSA’s independent note, **none of the three vendors issued a CVE or public advisory**.
  — https://labs.cloudsecurityalliance.org/research/csa-research-note-comment-control-github-prompt-injection-20/ (2026-04-17)

A conflict to record: CSA frames the Anthropic bounty as $1,337 paid, while the researcher’s own page records **$100**. The researcher’s figure is used above.

**“Rules File Backdoor” (March 2025) — prompt injection via repository config files.** Pillar Security demonstrated poisoned rule files (`.cursor/rules`, Copilot instruction files) using **invisible Unicode** — zero-width joiners and bidirectional text markers — to hide instructions from human reviewers while leaving them fully readable to the model. A rule file that looked like benign “HTML best practices” caused the agent to silently inject an attacker-controlled `<script>` tag, and the agent did not mention the change in its chat response.

— https://www.pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents

Two vendor responses worth quoting, because they define the user’s actual exposure:

- **Cursor** replied on 2025-03-06 that “this risk falls under the users’ responsibility” and maintained that position.
- **GitHub** replied on 2025-03-12 that “users are responsible for reviewing and accepting suggestions.” GitHub later shipped a hidden-Unicode warning on github.com on 2025-05-01.

**The generalisable rule for a learner:** treat a repository’s instruction files, issue text, PR titles and README content as **untrusted input to your agent**, because that is what they are.

Two further incidents are cited by the CSA note but were **not** independently verified against the CVE record or the original vendor post in this session, and are recorded as leads only: **CVE-2025-59145 (“CamoLeak”, CVSS 9.6)**, a prompt injection causing Copilot Chat to exfiltrate code and secrets via GitHub’s Camo image proxy, mitigated August 2025; and a **BeyondTrust Phantom Labs** finding of command injection in OpenAI Codex via a GitHub branch-name parameter.

### 4.6 Which free tiers train on your code

**GitHub Copilot — this changed, and it is the biggest privacy change in the space.** GitHub’s own docs:

> “**Starting on April 24, 2026, if you have a Copilot Free, Copilot Pro, Copilot Pro+, or Copilot Max plan, GitHub may use your interactions with GitHub features and services—including inputs, outputs, code snippets, and associated context—to train and improve AI models.** This change allows us to build more intelligent, context-aware coding assistance based on real-world development patterns. **You can opt-out** from allowing your data to be used for training in your personal settings for GitHub Copilot.”
> “GitHub does not use Copilot Business or Copilot Enterprise customer data to train AI models.”

— https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies `as of 2026-09`

This is corroborated in the ToS itself, which frames it as a licence you grant unless you opt out:

> “You also grant GitHub and its Affiliates a license to collect and use your Inputs and Outputs to develop, train and improve artificial intelligence and machine learning models … **unless (a) you opt out through your account settings**, or (b) your use of the Service is governed by a GitHub Customer Agreement or volume licensing agreement.”

— https://docs.github.com/en/site-policy/github-terms/github-terms-of-service (effective April 27, 2026), §J.3

The opt-out path is documented: Copilot settings → “Allow GitHub to use my data for AI model training” → **Disabled**. The setting is **not displayed** for Business/Enterprise accounts.

**→ Copilot Free code is used for training by default as of 2026-04-24.** This directly contradicts the widely repeated older claim that Copilot free-tier data is not used for training. Any lesson that still says that is wrong.

**Google AI Studio / Gemini API free tier** — used to train, with **human reviewers** able to read prompts and outputs, and an explicit warning not to submit confidential information (quoted in full in [§2.1](#21-google-ai-studio--gemini-api--free-tier-and-the-philippines-is-supported)).
— https://ai.google.dev/gemini-api/terms

**Anthropic** — free tier trains by default with an opt-out that has holes:

> “**We may use Materials to provide, maintain, and improve the Services and to develop other products and services, including training our models, unless you opt out of training through your account settings.** Even if you opt out, we will use Materials for model training when: (1) you provide Feedback to us regarding any Materials, or (2) your Materials are flagged for safety review…”

— https://www.anthropic.com/legal/consumer-terms (effective October 8, 2025), §4
The paid API is the opposite: “Anthropic may not train models on Customer Content from Services.” (Commercial Terms §B)

**Cursor** — the outlier in the learner’s favour, off by default:

> “**We do not use Inputs or Suggestions to train our models, or permit third parties to use them for training, unless:** (1) they are flagged for security review …, (2) you explicitly report them to us (for example, as Feedback), or (3) you’ve explicitly agreed to their use for such training purposes.”

— https://cursor.com/privacy (last updated October 6, 2025)

Cursor’s ToS §1.3 reinforces it in capitals, and the Data Use page explains that **Privacy Mode must be ON** for zero retention from model providers: “If you choose to **turn off** 'Privacy Mode': we may use and store codebase data, prompts, editor actions, code snippets, and other code data and actions to improve our AI features and train our models.”
— https://cursor.com/terms-of-service and https://cursor.com/data-use (last updated September 3, 2026)

Cursor’s Data Use page also contradicts a common assumption about BYOK: even with your own API key, “your requests will still go through our backend.”

**OpenAI API — not trained on.** “Your data is your data. As of March 1, 2023, data sent to the OpenAI API is not used to train or improve OpenAI models (unless you explicitly opt in to share data with us).” Abuse-monitoring logs are retained up to 30 days by default.
— https://developers.openai.com/api/docs/guides/your-data

**OpenAI free ChatGPT tier — Unverified.** That page is the platform/API data-controls doc, and OpenAI’s consumer terms pages returned 403. **No claim is made about whether free ChatGPT conversations are used for training.**

**Windsurf / Devin — Unverified.** Terms page 404s; the linked page redirects cross-origin. No claim made.

## 5. What changed recently

This section exists because a lesson written before mid-2026 will contain material errors. Each item is dated and sourced.

**2026-06-18 — Gemini CLI’s free tier ended.** The most consequential change. Gemini CLI and the Gemini Code Assist IDE extensions stopped serving Google AI Pro, AI Ultra and free individual users; “Login with Google” no longer works for them. Replacement: **Antigravity CLI** and Antigravity 2.0. Enterprise/Standard customers are unaffected, and Gemini CLI remains reachable with paid API keys.
— https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli and https://developers.google.com/gemini-code-assist/docs/deprecations/code-assist-individuals

**2026-04-24 — GitHub Copilot began training on individual-tier data by default.** Copilot Free, Pro, Pro+ and Max interactions — including inputs, outputs and code snippets — may be used to train models unless the user opts out in personal settings. Business and Enterprise are excluded.
— https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies

**2026-03 — Windsurf became Devin Desktop and replaced credits with quotas.** “In March 2026, Devin Desktop replaced the credit-based system with a quota-based usage system.” The docs host moved from `docs.windsurf.com` to `docs.devin.ai`. Any lesson that tells a learner to open Windsurf’s credit dashboard is out of date.
— https://docs.devin.ai/desktop/accounts/quota

**2026-07-30 — GitHub Models retired.** “As of July 30, 2026, GitHub Models has been fully retired. The playground, model catalog, inference API, and bring your own key (BYOK) are no longer available to any customer.”
— https://docs.github.com/en/github-models
This removes a route that many “free LLM API” listicles still recommend.

**2026 — Cline’s free models became explicitly promotional.** The free-model page now describes them as “rotating, limited-time” rather than a standing tier, and pushes ClinePass at $9.99/month.
— https://docs.cline.bot/getting-started/free-models

**2026 — Continue went into maintenance-only mode.** The repository is read-only after a “final 2.0.0 release.” Continue is still installable and still Apache-2.0, but it is no longer actively developed.
— https://raw.githubusercontent.com/continuedev/continue/main/README.md

**2026-09-01 — a Claude price increase was cancelled.** “The previously scheduled increase to $3/$15 per million input/output tokens on September 1, 2026 will not occur” — Sonnet 5 stays at $2/$10.
— https://platform.claude.com/docs/en/about-claude/pricing

**2026-10-14 — an upcoming retirement to plan around.** “GPT-5.5 retires from ChatGPT, ChatGPT Work, and Codex on all plans on October 14, 2026.”
— https://learn.chatgpt.com/docs/pricing.md
A lesson recorded before this date that names GPT-5.5 will be wrong shortly after it.

**Model names have moved a long way.** The current Copilot supported-model list includes Claude Opus 5, Claude Opus 4.8, Claude Haiku 4.5, Kimi K3 and MAI-Code-1.1-Flash (https://docs.github.com/en/copilot/get-started/plans); Cursor’s model set includes Claude Sonnet 5, Claude Opus 5, Claude Fable 5.1, Gemini 3.1 Pro, Gemini 3.8 Flash, GPT-5.6 Sol/Terra/Luna, Grok 4.6 and Composer 2.5 (https://cursor.com/docs/models-and-pricing); Codex runs the GPT-5.6 family plus GPT-6 Astra (https://learn.chatgpt.com/docs/pricing.md). **Any lesson naming GPT-4, Claude 3.5 Sonnet or Gemini 2.5 as “current” is stale.**

## 5b. Facts that contradict common belief

These are the findings most likely to be **wrong in existing lesson material**. Each is a direct correction, with its source.

1. **“Gemini CLI is the best free coding tool.”** It **stopped serving free users on 2026-06-18**. The replacement, Antigravity CLI, is free but is a different product with different config paths.
   — https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli

2. **“Copilot Free doesn’t train on your code.”** It does, **by default, since 2026-04-24**, including “inputs, outputs, code snippets, and associated context”. Opt-out is in personal settings.
   — https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies

3. **“Copilot Free gives you 50 chats and 2,000 completions.”** The completions figure is still published; the **chat allowance is now an undisclosed “AI credit” allowance**. The number 50 is not in GitHub’s current docs.
   — https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing

4. **“Cerebras has a generous free tier.”** It does not. “**Is there a permanently free tier? No.**” The $5 trial requires “**a verified payment method**” and expires in 30 days.
   — https://inference-docs.cerebras.ai/support/rate-limits

5. **“GitHub Models is a good free API.”** **Retired 2026-07-30** — playground, catalog, inference API and BYOK all withdrawn.
   — https://docs.github.com/en/github-models

6. **“Windsurf is free.”** Windsurf no longer exists under that name — it is **Devin Desktop**, its docs moved to `docs.devin.ai`, and its credit system was replaced by quotas in March 2026. There *is* a Free plan, but every tutorial’s dashboard instructions are stale.
   — https://docs.devin.ai/desktop/accounts/quota

7. **“Continue is a great actively-maintained open-source assistant.”** It is Apache-2.0 and installable, but the **repository is read-only** after a “final 2.0.0 release”.
   — https://raw.githubusercontent.com/continuedev/continue/main/README.md

8. **“Claude Code has a free tier.”** It does not. Claude Code “charges by API token consumption” and needs Pro/Max or API credits — around **$13 per developer per active day** in enterprise deployments.
   — https://code.claude.com/docs/en/costs

9. **“Open models are basically as good as frontier models now.”** **Only at the frontier tier, which you cannot run.** GLM-5's 77.8 vs Opus 4.5's 80.9 is real, and GLM-5 needs 8× H200. At the 12B–30B tier a learner can actually run, Devstral Small 2's **22.5 on Terminal Bench 2 against 60.4 for GPT-5.1 Codex Max** is the honest number.
   — https://huggingface.co/zai-org/GLM-5 and https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512

10. **“Llama 4 is open source like Qwen is.”** Llama 4 is tagged **`license:other`** — the Llama Community Licence — not Apache-2.0 or MIT.
    — https://huggingface.co/api/models?author=meta-llama&sort=createdAt&direction=-1&limit=20

11. **“There’s a Qwen3.5-Coder / Llama 5.”** Neither exists. The Qwen coder line ends at Qwen3-Coder; Meta’s newest open weights are Llama 4, from April 2025.
    — same HF API URL

12. **“Gemini API free tier gives 15 requests/minute, 1,500/day.”** Google **withdrew those numbers from its public docs**; the rate-limits page now defers to a signed-in AI Studio page.
    — https://ai.google.dev/gemini-api/docs/rate-limits

13. **“Free AI tools don’t take your code.”** On **Google’s** free tier, “**human reviewers may read, annotate, and process your API input and output**”, with an explicit instruction not to submit confidential information. Groq and Cloudflare are the outliers that do not retain or train at all.
    — https://ai.google.dev/gemini-api/terms · https://console.groq.com/docs/your-data · https://developers.cloudflare.com/workers-ai/platform/data-usage/

14. **“My free-tier code is legally protected.”** **No vendor provides IP indemnity on a free tier.** Anthropic’s covers “**paid** use” only; Google’s is scoped to Code Assist Standard and Enterprise; Cursor’s and GitHub’s individual terms are user-side indemnities running the *other* way.
    — https://www.anthropic.com/legal/commercial-terms §K.1 · https://docs.cloud.google.com/gemini/docs/codeassist/faqs · https://cursor.com/terms-of-service §13

15. **“Llama 4 / DeepSeek V4 is Apache-2.0.”** DeepSeek V4 *is* MIT (verified). Llama 4 is **not** permissive in the same sense. And **Kimi K3 is neither** — it is a custom licence with revenue and MAU thresholds.
    — https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE

16. **“Just install Ollama and point your tool at it.”** Ollama defaults to a **2k context window and silently discards** the excess — a silent failure, not an error, that quietly throws away the learner’s code.
    — https://aider.chat/docs/llms/ollama.html

17. **“Aider’s leaderboard tells you the best model.”** Its newest entry is **2025-08-25** — it cannot support a 2026 claim.
    — https://aider.chat/docs/leaderboards/

18. **“Mistral has a free Experiment tier.”** The documented URL **returns 404**; Mistral restructured its docs. Only a “limited period” free coding endpoint is verifiable, with no published limits.
    — https://docs.mistral.ai/deployment/laplateforme/tier/

## 5c. The $0 stack this brief supports

Built only from verified facts, in the order a lesson should introduce them.

**Start here — no card, no cost, works in the Philippines:**
1. **Antigravity CLI (Individual, $0)** or **Copilot Free** as the primary agent. Neither publishes its quota; both are “enough to learn, not enough to depend on”.
2. **Gemini API free tier** as the free API, with the explicit warning that **Google may train on and human-review free-tier prompts** — never paste secrets, credentials or private client data.
3. **Groq free tier** when the privacy matters more than the model: 1,000 requests/day on gpt-oss-120b, no retention by default, no card.
4. **A local model via Ollama** if the learner’s machine has 16 GB of RAM — gpt-oss-20b at Q4_K_M (11.62 GB), Apache-2.0 — with the context window raised explicitly.

**Habits to teach from lesson one, because they are free and they are the actual risk reduction:**
- Verify every package name against the registry before installing. Package hallucination runs at **5.2% for commercial models and 21.7% for open-source models**, and **43% of fake names recur on every identical prompt** — which is precisely what makes them worth registering by an attacker.
- Treat repository instruction files, issue text, PR titles and README content as **untrusted input to your agent**, not as trustworthy configuration.
- Read the generated code. **You own it, and no vendor indemnifies you for it on a free tier.**

## 6. What could not be verified, and why

Recorded honestly rather than filled with plausible guesses.

1. **Exact Copilot Free AI-credit allowance.** GitHub’s own pages state only that “an allowance” exists. No page stating the number was found. The 2,000-completions figure *is* published.
2. **Exact Cursor Hobby limits.** Described only as “Limited Agent requests”. Not published numerically.
3. **Exact Codex Free quota.** The pricing page’s usage tables have no Free column.
4. **Copilot Free factory default for “suggestions matching public code.”** Docs describe the setting but do not print the default.
5. **OpenAI ownership, indemnity, and free-tier training position.** `openai.com` terms pages returned **HTTP 403** on repeated attempts across four URLs. Nothing about OpenAI’s legal terms is asserted in this brief.
6. **Windsurf / Devin terms and training position.** `windsurf.com/terms-of-service` returns 404; its replacement link redirects cross-origin to `devin.ai` and could not be fetched.
7. **Qwen Code free-tier limits.** The authentication page fetched but its body did not decode to readable text, and the raw-markdown mirror returned 404. The “2,000 requests/day” figure is **not confirmed here**.
8. **Gemini API free-tier rate limits.** Google **removed the numbers from its public docs**. The rate-limits page now defers to a signed-in AI Studio page, so **any specific “15 RPM / 1,500 RPD” figure circulating online is unsourced as of 2026-09.** The per-model free/paid status *is* verified, as is the PH region listing and the free-tier training position.
9. **Third-party SWE-bench numbers — the most significant benchmark gap.** `swebench.com/verified.html` fetched with HTTP 200 but the leaderboard table is JavaScript-rendered and returned **no ranking rows**; the HF dataset card returned only the schema (`num_examples: 500`). **Every SWE-bench figure in this brief is therefore vendor-reported.** Aider’s polyglot and LiveCodeBench leaderboards were not fetched directly either.
10. **Official 8 GB-RAM guidance.** No vendor page states requirements for 8 GB. OpenAI says 16 GB, Mistral says 32 GB/RTX 4090. The 8 GB row in [§3.4](#34-minimum-hardware) is **inference from measured GGUF sizes plus context overhead, not a verified claim.**
11. **GPT4All’s licence and OpenAI compatibility.** Not verified; excluded from [§3.6](#36-local-tooling--free-and-openai-compatible) rather than guessed.
12. **NVIDIA NIM, Fireworks, and Alibaba Model Studio / Qwen.** No official pages fetched, so no claim is made about their free allowances or PH access.
13. **Aider GitHub issue #4751's content.** The page fetched but the issue body is client-rendered and did not decode. Only its existence and title are recorded.
14. **Aider’s benchmark currency.** Its leaderboard’s newest entry is 2025-08-25, so it cannot support claims about 2026 models.
15. **USENIX sample-size discrepancy.** The USENIX abstract says 576,000 samples; the CSA note says 2.23 million at 19.7%. Unreconciled; the PDF could not be parsed by the fetcher.
16. **DeepSeek V4's benchmark and VRAM figures** (80.6 SWE-bench, ~160 GB) come from a **Hugging Face community blog**, not DeepSeek’s official card. The model’s existence, parameter counts, quantisation format and MIT licence *were* verified directly against the HF API. The **8% DeepSWE versus 70% GPT-5.5** claim is single-source and unverified.
17. **CSA-cited incidents not independently verified:** CVE-2025-59145 (CamoLeak) and the BeyondTrust Codex command-injection finding. The “Muse Spark” open-weights question is likewise unresolved — it appears only in third-party posts, and no such model appears in Meta’s HF organisation.
18. **Aikido’s specific incident figures** (233 weekly downloads, 30,000+ downloads, 237 repositories) come from the CSA note’s description of Aikido’s research, because Aikido’s own article page rendered mostly as navigation chrome. One step removed from primary.
19. **OWASP and NIST/CISA guidance on package hallucination.** OWASP’s LLM Top 10 supply-chain entry returned 404 and the index had no readable risk text; no NIST or CISA material was found.
20. **Public-code-matching filters in non-GitHub tools.** No documented equivalent found for Cursor, Anthropic, OpenAI or Google — weak evidence of absence, not proof.
21. **Antigravity credit-card requirement.** Not stated anywhere fetched; the $0/month label implies none, but this is inference, not documentation.
22. **Per-provider train/don’t-train flags on OpenRouter `:free` models.** That table is client-rendered from an API endpoint and was absent from the fetched HTML.
23. **Terms-level Philippine eligibility for Groq and OpenRouter.** Groq’s website Terms explicitly exclude the API and the governing GroqCloud agreement could not be fetched; OpenRouter’s terms page rendered client-side. No PH block was found for either, but “not blocked” is not “affirmatively permitted”.
24. **Mistral’s “Experiment” plan.** Both the documented URL and the `.md` variant still advertised in Mistral’s own `llms.txt` return HTTP 404 — the docs were restructured around Vibe/Studio/Admin. Only a “limited period” free coding endpoint is verified, with no published limits.
25. **Z.AI free-model rate limits, card requirement, and PH eligibility.** No rate-limit page found; card requirement inferred from the phrase “if needed” next to top-up.
26. **PH-issued card acceptance.** No provider documents its payment processor’s country coverage. Irrelevant to free tiers, relevant if a learner ever tops up.
27. **Whether free ChatGPT (consumer) conversations train models.** OpenAI’s platform/API data-controls page was fetched and is clear that the **API** does not train; OpenAI’s consumer terms pages returned 403, so **no claim is made** about the free web tier.

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
- https://ai.google.dev/gemini-api/docs/rate-limits
- https://ai.google.dev/gemini-api/docs/pricing
- https://docs.cloud.google.com/gemini/docs/codeassist/faqs

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
- https://www.aikido.dev/blog/slopsquatting-ai-package-hallucination-attacks

**Free API providers**
- https://console.groq.com/docs/rate-limits
- https://console.groq.com/docs/billing-faqs
- https://console.groq.com/docs/your-data
- https://groq.com/terms-of-use
- https://openrouter.ai/docs/api_reference/limits
- https://openrouter.ai/docs/faq
- https://openrouter.ai/api/v1/models
- https://openrouter.ai/models?max_price=0
- https://openrouter.ai/docs/guides/privacy/provider-logging
- https://openrouter.ai/docs/guides/privacy/data-collection
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/workers-ai/platform/limits/
- https://developers.cloudflare.com/workers-ai/platform/data-usage/
- https://docs.z.ai/guides/overview/pricing
- https://docs.z.ai/guides/overview/quick-start
- https://api-docs.deepseek.com/quick_start/pricing
- https://platform.kimi.ai/docs/pricing/limits
- https://docs.together.ai/docs/serverless/rate-limits
- https://docs.together.ai/docs/privacy-and-security
- https://inference-docs.cerebras.ai/support/rate-limits
- https://mistral.ai/pricing/api/

**Local models and tooling**
- https://huggingface.co/api/models?author=meta-llama&sort=createdAt&direction=-1&limit=20
- https://huggingface.co/zai-org/GLM-5
- https://huggingface.co/blog/mlabonne/glm-5
- https://huggingface.co/moonshotai/Kimi-K3
- https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- https://huggingface.co/api/models/deepseek-ai/DeepSeek-V4-Flash
- https://huggingface.co/api/models/deepseek-ai/DeepSeek-V4-Pro
- https://huggingface.co/blog/ResterChed/deepseek-v4-ga-architecture
- https://huggingface.co/openai/gpt-oss-20b
- https://huggingface.co/openai/gpt-oss-120b
- https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- https://huggingface.co/Qwen/Qwen3.8-27B
- https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512
- https://huggingface.co/api/models/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF?blobs=true
- https://huggingface.co/api/models/unsloth/Qwen3.8-27B-GGUF?blobs=true
- https://huggingface.co/api/models/unsloth/gemma-4-12b-it-GGUF?blobs=true
- https://huggingface.co/api/models/unsloth/gpt-oss-20b-GGUF?blobs=true
- https://ollama.com/library/gpt-oss
- https://ollama.com/library/qwen3-coder:30b
- https://docs.ollama.com/api/openai-compatibility
- https://raw.githubusercontent.com/ollama/ollama/main/LICENSE
- https://raw.githubusercontent.com/ggml-org/llama.cpp/master/README.md
- https://lmstudio.ai/docs/developer/openai-compat
- https://raw.githubusercontent.com/lmstudio-ai/lmstudio.js/main/LICENSE
- https://raw.githubusercontent.com/janhq/jan/dev/LICENSE
- https://raw.githubusercontent.com/vllm-project/vllm/main/LICENSE
- https://www.swebench.com/verified.html (fetched — returned no ranking rows)
