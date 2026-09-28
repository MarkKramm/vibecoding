# Vendor research: Q1, Q8, Q9 — all pages read 2026-09-29

**One-line status: Q1 PARTIAL, Q8 CLOSED, Q9 CLOSED (three of four products verified; GitHub Copilot Free not re-verified in this pass).**

Scope: this file answers questions 1, 8 and 9 of `PASTE-THIS.txt` only. Every finding below was read
from a vendor-controlled page on 2026-09-29. No product was installed, run or billed, so nothing here
is a measurement — it is documentation as written. Where a vendor publishes no number, that absence is
itself the answer, and it is marked as such rather than filled in from a third party.

Verification status values used below:

- `verified from primary source` — the vendor's own page states it, quoted verbatim.
- `reported, not independently verified` — found in search results or a secondary page, not confirmed
  on a vendor page read in full during this pass.
- `could not verify` — no source found, or the vendor publishes no such statement.

---

## Q1. Context window per coding tool, and which tools do not publish the number

**Status: PARTIAL.** Three of the six tools publish a per-model figure (Cursor, GitHub Copilot, and
indirectly Claude Code). Three publish no context window number at all (OpenAI Codex, Google
Antigravity, Devin Desktop).

### Q1.1 Claude Code — publishes a 1M alias, not a per-model table

- **Answer:** Claude Code's model configuration documents `sonnet[1m]` and `opus[1m]` aliases, which
  switch the session to a 1 million token context window. The page does not publish a default or base
  context size for the un-suffixed models; it publishes how to opt into the long one.
- **Source URL:** https://code.claude.com/docs/en/model-config.md
- **Verbatim quote:** "Uses Sonnet with a 1 million token context window for long sessions"
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29

### Q1.2 OpenAI Codex — does not publish a number

- **Answer:** OpenAI's Codex documentation publishes model names, availability and retirement dates,
  but no context window figure. The configuration reference exposes a `model_context_window` key whose
  value is whatever the active model reports, described only as "Context window tokens available to the
  active model." No default value is documented.
- **Source URL:** https://learn.chatgpt.com/docs/config-file/config-reference.md (and
  https://learn.chatgpt.com/docs/models.md for the model list)
- **Verbatim quote:** "Context window tokens available to the active model."
- **Verification status:** `verified from primary source` (the key exists and is documented; the
  absence of any published number is a fact about both pages read in full)
- **Date read:** 2026-09-29
- **Note:** the model list page carries availability and retirement dates (for example GPT-5.5 is
  marked for retirement on 2026-10-14) but no context size. Because Codex context can also be
  overridden locally via `model_context_window`, "the Codex context window" is not a single number
  even for a fixed model.

### Q1.3 GitHub Copilot — publishes a 1M option, conditioned on client

- **Answer:** GitHub documents a one-million-token context window for supported models, but restricts
  it to two clients. It is an extended option rather than a default, and it is not a single fixed
  number for the product.
- **Source URL:** https://docs.github.com/en/copilot/reference/ai-models/supported-models
- **Verbatim quote:** "The 1 million token context window is available in Visual Studio Code and Copilot CLI only."
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Note:** a GitHub changelog entry dated 2026-06-04 ("Larger context windows and configurable
  reasoning levels for GitHub Copilot") describes the same change; that changelog was seen via search
  results and not read in full, so it is `reported, not independently verified` and is recorded only
  as corroboration.

### Q1.4 Google Antigravity — does not publish a number

- **Answer:** Antigravity's models page publishes a model-versus-plan availability table (which models
  are offered on which plan) and nothing about context size. There is no context window figure on the
  page.
- **Source URL:** https://antigravity.google/docs/models
- **Verbatim quote:** No context window text appears on the page; the only model data is the
  availability grid (Gemini 3.8 Flash, Gemini 3.7 Flash, Gemini 3.6 Flash, Gemini 3.1 Pro, Claude
  Sonnet 4.6 thinking, Claude Opus 4.6 thinking, GPT-OSS-120b, and their plan assignments).
- **Verification status:** `verified from primary source` (absence, established by reading the whole
  page)
- **Date read:** 2026-09-29

### Q1.5 Cursor — publishes the most complete table of the six

- **Answer:** Cursor publishes a "Default context" and a "Max context" column for every model it
  offers, so Cursor is the only one of the six where a per-model default is documented. Defaults
  range from 200k to 300k; a 1M maximum is listed for most Claude, Gemini, GPT-5.4+ and Kimi models.
  Some rows use "-" for max context, meaning no extended window is offered.
- **Source URL:** https://docs.cursor.com/en/models
- **Verbatim quote:** column headers "| Model | Provider | Default context | Max context |
  Capabilities | Notes |", with rows such as "| [Claude Opus 5.5](https://www.anthropic.com/claude/opus)
  | Anthropic | 300k | 1M |", "| [Claude Sonnet 5](https://www.anthropic.com/claude/sonnet) | Anthropic
  | 200k | 1M |", "| [GPT-5.6 Sol](https://openai.com/index/previewing-gpt-5-6-sol/) | OpenAI | 272k | 1M |",
  "| [Gemini 3.8 Flash](https://ai.google.dev/gemini-api/docs) | Google | 200k | 1M |", and
  "| [GLM 5.2](https://z.ai) | Z.ai | 200k | - |".
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Note:** this table is a pricing and capability table as much as a technical one, and the
  "Max context" column is tied to paid "Max Mode" on legacy request-based plans. The numbers describe
  what Cursor sells, which is not guaranteed to be the underlying model's full window.

### Q1.6 Devin Desktop (formerly Windsurf) — does not publish a number

- **Answer:** Devin Desktop's models page is a price and credit-cost table. It has no context window
  column and no context window text. Some model identifiers carry a `-1m` suffix, which suggests a
  long-context variant exists, but the vendor states no figure anywhere on the page.
- **Source URL:** https://docs.devin.ai/desktop/models.md
- **Verbatim quote:** No context window text appears on the page; the page exposes a JavaScript
  `modelCostData` price and credit table. Model identifiers observed include
  `claude-opus-4-6-1m`, `claude-sonnet-4-6-1m`, `glm-5-2-1m` and `glm-5-2-max-1m`.
- **Verification status:** `verified from primary source` for the absence of a figure; the `-1m`
  identifier suffixes are `reported, not independently verified` as a 1M window, because the vendor
  never says so in words.
- **Date read:** 2026-09-29
- **Note:** Devin Desktop is the former Windsurf product. The docs still reference Windsurf paths
  (`~/.codeium/windsurf/`, `.windsurf/`) and Windsurf-branded changelog entries, which confirms the
  rename rather than a separate product.

### Q1 summary table

| Tool | Publishes a context window number | What it publishes |
| --- | --- | --- |
| Cursor | Yes | Per-model default and max (200k–300k default, up to 1M max) |
| GitHub Copilot | Partly | 1M extended option, VS Code and Copilot CLI only |
| Claude Code | Partly | 1M via `[1m]` model aliases |
| OpenAI Codex | No | A `model_context_window` config key with no documented value |
| Google Antigravity | No | Model-to-plan availability only |
| Devin Desktop | No | Price and credit table only |

---

## Q8. Copyright indemnity scope for GitHub, Google and OpenAI

**Status: CLOSED.** The decisive finding is that all three confine indemnity to paid, business or
volume-licence arrangements, and that Google Antigravity — the product, not Google Enterprise — has
no indemnity clause at all.

### Q8.1 Google Antigravity — no indemnity clause exists

- **Answer:** The Google Antigravity Additional Terms of Service contain no copyright indemnity, no
  defence-of-claims commitment, and no equivalent of them. Read in full, the document governs the use
  of the service and the handling of Interactions, and that is all it does on this subject. This is
  the sharpest answer in this section: there is no tier, paid or free, that is covered, because
  nothing is covered.
- **Source URL:** https://antigravity.google/terms
- **Verbatim quote:** "We use Interactions to evaluate, develop, and improve Google and Alphabet
  research, products, services and machine learning technologies." and "If you don't want your
  Interactions used in this way, navigate to settings to change your preference on how such data is
  used."
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Caveat on method:** an absence claim is only as good as the reading. The whole document was read,
  and a search of its text for indemnity, defence, claim and copyright returned no clause. This is a
  strong negative, not a proof, and it should be described that way in downstream content.

### Q8.2 GitHub — indemnity is volume-licence only, and the governing document changed on 2026-03-05

- **Answer:** GitHub's indemnity reaches only customers who buy directly from GitHub under a volume
  licensing agreement, and only through the defense provision their own agreement already contains.
  GitHub does not write a standalone copyright promise. The Copilot-specific terms were deprecated on
  5 March 2026 and replaced by the GitHub Generative AI Services Terms, which carry the same
  volume-licence scope. Copilot Free and Copilot Individual personal accounts are explicitly excluded.
- **Source URL:** https://github.com/customer-terms/github-generative-ai-services-terms and
  https://github.com/customer-terms/github-copilot-product-specific-terms
- **Verbatim quote:** from the Generative AI Services Terms — "This document applies to your use of
  GitHub's Generative AI Services, when purchased directly from GitHub under a volume licensing
  agreement."; "If you do not purchase GitHub under a volume licensing agreement, this document does
  not apply to you."; "If your Agreement provides for the defense of third party claims, that
  provision will apply to your use of Generative AI Services, including to Outputs."; and "GitHub
  will not use Inputs or Outputs to train generative AI models, unless you have given us documented
  instructions to do so." From the deprecated Copilot terms — "These terms only apply to Copilot
  Business and Copilot Enterprise, and only when purchased directly from GitHub."; "If you purchase
  GitHub Copilot Individual, these terms do not apply to you and your use of GitHub Copilot is
  instead governed by the GitHub Terms of Service"; and "NOTE: These terms have been deprecated
  effective 5 March 2026."
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Note:** the page carries "Version: March 2026". Because the indemnity is delegated to the
  customer's own volume agreement, what GitHub actually promises depends on that agreement, not on
  GitHub's document. Any downstream claim of the form "GitHub indemnifies Copilot users" is wrong
  without those two qualifiers.

### Q8.3 OpenAI — indemnity is business, API, Enterprise and Business only

- **Answer:** OpenAI's indemnity lives in two documents, both of which scope themselves to business
  customers. The Services Agreement states outright that it does not apply to consumers or
  individuals unless specified. The output indemnity in the service terms is written for Enterprise
  customers and ChatGPT Business accounts. Codex is covered only by a licensing note about third
  party licenses, not by a dedicated indemnity, and Beta Services are excluded from indemnification
  altogether.
- **Source URL:** https://openai.com/policies/business-terms/ (Effective: January 1, 2026) and
  https://openai.com/policies/service-terms/ (Updated: September 21, 2026)
- **Verbatim quote:** from the Services Agreement — "This OpenAI Services Agreement only applies to
  use of OpenAI's APIs, ChatGPT Enterprise, ChatGPT Business, ChatGPT for Clinicians, and other
  services for customers who are businesses and developers, and does not apply to OpenAI services
  used by consumers or individuals unless specified above." and the section 13.1 heading "By OpenAI".
  From the service terms — the output indemnity scoped to "Enterprise customers" and "ChatGPT Business
  accounts"; "Beta Services ... are excluded from any indemnification obligations"; and "Codex and
  Code Generation: Output generated by code generation features of our Services, including OpenAI
  Codex, may be subject to third party licenses".
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Note:** the Services Agreement also states that the Service-Specific Terms indemnity "is not
  subject to any liability cap", which is the part most often quoted out of context. Quoting the
  uncapped-liability line without the business-only scope is the single easiest way to misstate
  OpenAI's position, so the scope sentence belongs next to it every time.

---

## Q9. Is free-tier code used for training by default, and is there an opt-out

**Status: CLOSED for Google Antigravity, Cursor and Codex. GitHub Copilot Free was not re-verified in
this pass.**

The pattern that matters for a learner: Cursor is the outlier and the other two are not. Cursor
requires explicit agreement before training. Antigravity and Codex both train by default and require
the user to turn it off.

### Q9.1 Google Antigravity — trained on by default, opt out in Settings

- **Answer:** Training on Interactions is the default under the Additional Terms, and the FAQ
  describes the opt-out as a user action in Settings. On the free plan there is therefore no
  contractual bar on your code being used for Google's research and model improvement until you
  change the setting.
- **Source URL:** https://antigravity.google/docs/faq and https://antigravity.google/terms
- **Verbatim quote:** from the FAQ — "What is Google Antigravity's stance on data collection?" /
  "Please refer to the Terms of Service. You may opt out of data collection at any point from the
  Settings panel." From the terms — "If you don't want your Interactions used in this way, navigate to
  settings to change your preference on how such data is used."
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Note:** "You may opt out" establishes that the default is the opposite, but the terms do not use
  the words "by default" anywhere. The inference is safe and should still be attributed as an
  inference.

### Q9.2 Cursor Hobby — opt-in, not opt-out

- **Answer:** Cursor's terms are the strongest position of the three. Training requires the user's
  explicit agreement, so nothing is trained on unless the user has agreed to it. A related and
  separate point for Q8: the Cursor terms contain no indemnity running toward the user at all. The
  indemnification section is one-directional, running from the user to Anysphere.
- **Source URL:** https://cursor.com/terms-of-service (Last updated September 3, 2026)
- **Verbatim quote:** "ANYSPHERE WILL NOT USE CONTENT TO TRAIN, OR ALLOW ANY THIRD PARTY TO TRAIN, ANY
  AI MODELS, UNLESS YOU'VE EXPLICITLY AGREED TO THE USE OF CONTENT FOR TRAINING."
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29

### Q9.3 Codex Free / ChatGPT Free — trained on by default, opt out in Data controls

- **Answer:** For individual services including Codex, OpenAI may use your content to train its models
  unless you opt out. The opt-out is the "Improve the model for everyone" setting in ChatGPT Data
  controls, or the Privacy Portal, and either one is sufficient. Codex has an additional, separate
  setting called "Include environments" for training on full environments, and changing the ChatGPT
  or Privacy Portal setting does not change that one. So a user who opts out of conversation training
  may still be shipping whole environments unless they also find that second switch.
- **Source URL:** https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance
- **Verbatim quote:** "When you use our services for individuals, such as ChatGPT and Codex, we may
  use your content to train our models."; "To opt out, turn off Improve the model for everyone under
  Settings > Data controls in ChatGPT, or select Do not train on my content in our Privacy Portal.";
  and "Codex has a separate Include environments setting in Codex settings for allowing training on
  full environments. Changing your settings in ChatGPT or the Privacy Portal does not change that
  setting."
- **Verification status:** `verified from primary source`
- **Date read:** 2026-09-29
- **Note:** the same article confirms the business side — "By default, we don't use inputs or outputs
  from ChatGPT Business, ChatGPT Enterprise, ChatGPT Edu, or our API to improve our models." — and
  warns that submitting thumbs up or thumbs down can send the whole conversation to training "even if
  you've opted out". The consumer privacy policy says the same in its own words: "we may use Content
  you provide us to improve our Services, for example to train the models that power ChatGPT".
  (https://openai.com/policies/privacy-policy/, Updated: July 30, 2026.)

### Q9.4 GitHub Copilot Free — could not verify in this pass

- **Answer:** Not re-verified against a primary source in this pass, and the owner states the default
  already changed on 2026-04-24. What the sources read here do establish is scoping rather than
  default: both GitHub documents that mention training or indemnity are scoped away from personal and
  free accounts, so a Copilot Free user is governed by the GitHub Terms of Service, not by either of
  them. The "will not train without documented instructions" sentence in the Generative AI Services
  Terms therefore cannot be quoted as the Copilot Free rule.
- **Source URL:** https://github.com/customer-terms/github-generative-ai-services-terms
- **Verbatim quote:** "If you do not purchase GitHub under a volume licensing agreement, this document
  does not apply to you. Your use of GitHub is instead governed by the GitHub Terms of Service,
  including the GitHub Terms for Additional Products and Features."
- **Verification status:** `could not verify` (the free-tier training default itself)
- **Date read:** 2026-09-29

---

## How to use this file

- The durable claims are the negative ones. Three of six tools publish no context window, one vendor
  offers no indemnity at all, and the two indemnity regimes that do exist are confined to paid
  business arrangements. Those facts are less likely to change than the specific numbers.
- The volatile claims are the numbers. Model line-ups, context sizes and prices in this file were
  true on 2026-09-29 and Cursor's own table shows how fast the list moves, with several Claude, GPT
  and Gemini generations appearing side by side.
- Re-verify before reuse. Every source here is a page that vendors edit in place, and no page carried
  a snapshot or archive link.
