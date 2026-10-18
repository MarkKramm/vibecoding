---
id: sc-07-ai-governance-and-compliance
track: safety-career
phase: 7
order: 70
title: AI Governance, Compliance and Model Cards
duration: 1 week
duration_weeks: 1
energy_mix: [normal, low]
deliverable: portfolio/safety-career/07-ai-governance-and-compliance.md
exit_criteria: >
  You can place an AI system in the EU AI Act's four risk tiers and say which
  obligations follow. You can write a model card for a system you built, naming
  intended use, limitations and evaluation evidence. You can state the difference
  between a provider and a deployer, and which duties attach to each. You can say
  what the Act's Article 50 transparency rule does and does not cover, including
  the negative finding about source code. You have a one-page compliance memo for
  one real project.
---

# Phase 7 — AI Governance, Compliance and Model Cards

## Goal of this phase

"Governance" sounds like a department you do not have. For a solo builder it is something narrower and more useful: **the set of written decisions that let someone else understand what your system is for, what it must not be used for, and what evidence you have that it works.** That is also what regulators ask for, which is why this phase is practical rather than bureaucratic — the document you write for an auditor is the same document that saves you from shipping a system into a use it was never built for.

The organising idea:

> **Compliance is a documentation problem before it is a legal one.** You cannot demonstrate that a system is safe, fair, or lawful if you never wrote down what it does, who it affects, and how you checked. The law mostly makes those documents mandatory for certain systems; writing them is useful even when it does not.

By the end you will have placed a real system in a risk tier, written a model card for it, and produced a one-page compliance memo that names the obligations that actually apply and the ones that do not. The "do not" half is as important as the "do": a large part of AI compliance anxiety comes from people complying with rules that were never aimed at them.

## Estimated time

**1 week** at 1–2 hours a day. Roughly 7–9 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | The four risk tiers and who is a provider vs. a deployer | 1.5h |
| 2 | Article 50 transparency, and the source-code negative finding | 1.5h |
| 3 | Model cards and system cards: what goes in one | 1.5h |
| 4 | Data protection duties that survive regardless of jurisdiction | 1.5h |
| 5 | Write the model card and the compliance memo | 2h |

If you only have three hours, do tasks 1, 5 and 9.

## Skills you'll gain

- Place a system in the EU AI Act's risk tiers and name the obligations that follow.
- Distinguish a provider's duties from a deployer's.
- Write a model card with intended use, limitations and evaluation evidence.
- Explain what Article 50 covers, including what it does not.
- Produce a one-page compliance memo that is honest about uncertainty.

## Specific topics to learn

- The EU AI Act's four tiers: unacceptable, high-risk, limited-risk, minimal-risk.
- Provider vs. deployer: who owes what.
- Article 50 transparency duties for synthetic audio, image, video and text.
- General-purpose AI model obligations and the role of codes of practice.
- Model cards and system cards: intended use, limitations, evaluation, and misuse.
- Data-protection principles that apply in most jurisdictions: purpose limitation, minimisation, retention, breach notification.
- Documentation as evidence: what an auditor can check and what only you can attest.
- The difference between a legal duty and a good practice.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| A Markdown editor | Write the model card and memo | Free | — | Tasks t05–t10 | Any plain-text editor |
| The EU AI Act text | Primary source for tier and Article 50 questions | Free | https://eur-lex.europa.eu/eli/reg/2024/1689/oj | Tasks t01–t04 | The same text on EUR-Lex, free to read |
| Your own project README | The raw material for the model card | Free | — | Task t06 | Your own project notes |
| A model card template | Structure and prompts | Free | https://huggingface.co/docs/hub/model-cards | Task t05 | A hand-written template |

## Free/cheap resources

- **Regulation (EU) 2024/1689 (the EU AI Act), official text** — https://eur-lex.europa.eu/eli/reg/2024/1689/oj — read the definitions and Article 50 directly; the summaries elsewhere are frequently wrong about scope.
- **`docs/RESEARCH-EU-AI-ACT-2026-09-29.md` in this repository** — records the article-by-article finding that Article 50 does not cover source code.
- **NIST AI Risk Management Framework** — https://www.nist.gov/itl/ai-risk-management-framework — a voluntary vocabulary that maps onto the Act's concepts.
- **Hugging Face model card guide** — https://huggingface.co/docs/hub/model-cards — the most widely used model-card format.
- **The Data Privacy Act of 2012 (RA 10173)** — https://lawphil.net/statutes/repacts/ra2012/ra_10173_2012.html — already covered in phase 2; revisit its retention and breach duties here as documentation obligations.

## Lesson: The document is the deliverable

### Part 1 — The four tiers

The EU AI Act sorts systems by risk, not by technology.

- **Unacceptable risk** — prohibited outright (for example, certain social-scoring and manipulative uses). If your system is here, the question is not compliance, it is whether to build it.
- **High risk** — permitted but heavily regulated: conformity assessment, risk management, technical documentation, human oversight, logging. Examples include systems used in employment, education, credit, and critical infrastructure.
- **Limited risk** — transparency duties. A chatbot must tell you it is a chatbot; synthetic media must be marked; deep fakes must be disclosed.
- **Minimal risk** — no specific obligations under the Act. Most small projects live here, and saying so plainly is a legitimate outcome.

**Volatile:** the Act's application dates and the guidance around general-purpose models are still settling as of 2026-10. Re-read the official text before quoting a date.

The practical move is to ask what the system *decides or influences for someone*, not what model it uses. A summariser that drafts a memo a human edits is not the same risk as a system that ranks job applicants.

### Part 2 — Provider or deployer?

The Act splits duties:

- A **provider** places a system on the market or puts it into service. Providers carry the technical-documentation and conformity duties for high-risk systems.
- A **deployer** uses a system under its own authority. Deployers carry duties around use, monitoring and, in some cases, informing people.

If you build a tool for your own use, you are usually a deployer of the model and a provider of the tool. If you publish it, you are a provider. Getting this wrong is how people either over-comply (writing conformity documents for a minimal-risk tool) or under-comply (assuming the model vendor's paperwork covers their use).

### Part 3 — Article 50 in one paragraph, and the negative finding

Article 50 is the transparency provision. It requires, broadly: that people be told when they are interacting with an AI system; that providers of systems generating synthetic **audio, image, video or text** mark the output in a machine-readable way; that emotion-recognition and biometric-categorisation deployers inform exposed people; and that deep fakes and certain public-interest text be disclosed.

**What it does not do, and this is the useful part:** it does not create a disclosure duty for AI-generated source code. The phrase "source code" appears in the Regulation only in provisions about a *provider's own* model — regulator access and confidentiality — never as a duty on the person shipping AI-assisted code. That was established article by article in `docs/RESEARCH-EU-AI-ACT-2026-09-29.md`, and it is worth knowing because the common summary ("the Act requires disclosure of AI-generated content") is true and still does not reach code, which is an enumerated list rather than an interpretation.

### Part 4 — The model card is the artefact

A model card is a short document with a standard shape:

- **What it is** — the model or system, the task, the version.
- **Intended use** — who it is for, and what it is not for.
- **How it was evaluated** — benchmarks, adversarial tests, and their limits.
- **Known limitations and failure modes** — including the ones you found.
- **Out-of-scope uses** — the uses you explicitly do not support.

The last two are the ones people omit, and they are the ones an auditor and a user both need. "Intended for summarising public documents; not evaluated for legal, medical or financial advice" is a complete sentence that prevents a whole class of misuse.

### Part 5 — What survives any jurisdiction

Whatever the Act says, a small number of data-protection principles are close to universal and cheap to follow: collect only what you need, say why you have it, keep it no longer than necessary, secure it, and have a plan for a breach. Phase 2 covered the Philippine duties; this phase's job is to turn them into written decisions that a model card and a memo can point at.

### Part 6 — Write the "does not apply" section

The most valuable page in a compliance memo is the one that says which rules do not apply and why. It stops a future reader from re-litigating the question, and it is the difference between a memo and a copy of a regulation. State the tier, state the reasoning, state the date you checked, and name the source.

## Hands-on practice tasks

1. List three AI systems you use and place each in a risk tier with a one-sentence reason. <!-- id: sc-07-ai-governance-and-compliance-t01 band: quick energy: low -->
2. Read the EU AI Act's definition of "high-risk" and name one example that is not in this lesson. <!-- id: sc-07-ai-governance-and-compliance-t02 band: focused energy: normal -->
3. For one system you built, decide whether you are a provider, a deployer, or both. <!-- id: sc-07-ai-governance-and-compliance-t03 band: focused energy: normal -->
4. Read Article 50 and list every media type it names; note that code is absent. <!-- id: sc-07-ai-governance-and-compliance-t04 band: focused energy: normal -->
5. Write a model card for one system you built, including out-of-scope uses. <!-- id: sc-07-ai-governance-and-compliance-t05 band: deep energy: high -->
6. Gather the evaluation evidence you actually have for that system, and mark what is missing. <!-- id: sc-07-ai-governance-and-compliance-t06 band: focused energy: normal -->
7. Map the data your system holds to purpose, retention and lawful basis. <!-- id: sc-07-ai-governance-and-compliance-t07 band: deep energy: high -->
8. Draft a breach-notification checklist for the same system. <!-- id: sc-07-ai-governance-and-compliance-t08 band: focused energy: normal -->
9. Write a one-page compliance memo with a "does not apply" section. <!-- id: sc-07-ai-governance-and-compliance-t09 band: deep energy: high -->
10. Date every claim in the memo and name its source. <!-- id: sc-07-ai-governance-and-compliance-t10 band: quick energy: low -->

## Common Pitfalls

- **Treating the model vendor's compliance as your compliance.** Their model card does not cover your use, your data, or your users.
- **Claiming a tier without reading the definition.** "Minimal risk" is a conclusion you earn by reading the categories, not a default you assume.
- **Writing a model card with no limitations section.** A card that admits nothing reads as marketing and helps no one.
- **Copying a regulation into a memo.** The memo's value is the mapping to your system, not the text.
- **Leaving out the date.** Governance guidance moves; an undated memo is un-auditable.

## Deliverable / proof of work

A Markdown file at `portfolio/safety-career/07-ai-governance-and-compliance.md` containing: the risk-tier placement for one system with its reasoning; a model card with intended use, evaluation and out-of-scope uses; the provider/deployer determination; and a one-page compliance memo with a "does not apply" section, every claim dated and sourced.

## Checklist

- [ ] I can name the four EU AI Act risk tiers and what each implies. <!-- id: sc-07-ai-governance-and-compliance-c01 energy: low -->
- [ ] I can place a real system in a tier and defend the placement. <!-- id: sc-07-ai-governance-and-compliance-c02 energy: normal -->
- [ ] I can explain provider vs. deployer duties. <!-- id: sc-07-ai-governance-and-compliance-c03 energy: normal -->
- [ ] I can describe what Article 50 covers and what it does not. <!-- id: sc-07-ai-governance-and-compliance-c04 energy: normal -->
- [ ] I have written a model card with out-of-scope uses. <!-- id: sc-07-ai-governance-and-compliance-c05 energy: high -->
- [ ] I can map data to purpose, retention and lawful basis. <!-- id: sc-07-ai-governance-and-compliance-c06 energy: normal -->
- [ ] I have a breach-notification checklist. <!-- id: sc-07-ai-governance-and-compliance-c07 energy: normal -->
- [ ] My compliance memo has a "does not apply" section with dates and sources. <!-- id: sc-07-ai-governance-and-compliance-c08 energy: normal -->

## Quiz

### Q1. A summariser drafts memos that a human always reviews and edits before sending. Which tier is the best fit? <!-- id: sc-07-ai-governance-and-compliance-q01 energy: normal -->

- [ ] Unacceptable risk
- [ ] High risk
- [x] Limited or minimal risk, depending on what it is used for and whether any transparency duty attaches
- [ ] The Act does not apply to software

**Why:** Risk is about what the system decides or influences for people, not the model behind it. A human-reviewed draft is a different risk from a system that ranks applicants, though the final tier still depends on the actual use.

### Q2. Who carries the conformity and technical-documentation duties for a high-risk system? <!-- id: sc-07-ai-governance-and-compliance-q02 energy: normal -->

- [ ] The model vendor, always
- [x] The provider that places the system on the market or puts it into service
- [ ] The deployer, always
- [ ] The end user

**Why:** The Act assigns the heavy duties to providers; deployers have their own duties around use and monitoring. Assuming the model vendor's paperwork covers your use is the common mistake.

### Q3. Article 50's disclosure and marking duties attach to which of these? <!-- id: sc-07-ai-governance-and-compliance-q03 energy: normal -->

- [ ] AI-generated source code
- [ ] Every AI system without exception
- [x] Synthetic audio, image, video or text, plus specified interaction and deep-fake cases
- [ ] Only open-source models

**Why:** The obligations are tied to enumerated media types and situations. Code is absent from that list, which is the negative finding recorded in the repository's EU AI Act research file.

### Q4. Why is a "does not apply" section valuable in a compliance memo? <!-- id: sc-07-ai-governance-and-compliance-q04 energy: normal -->

- [x] It records which rules were considered and why they are out of scope, so the question is not re-litigated
- [ ] It reduces the page count
- [ ] It is required by the Act for all systems
- [ ] It replaces the need for a model card

**Why:** A memo that maps rules to a system is useful; one that only says "not applicable" with no reasoning is not. Naming what does not apply, with a date and source, is what makes the conclusion reviewable.

### Q5. Which belongs in a model card's out-of-scope section? <!-- id: sc-07-ai-governance-and-compliance-q05 energy: normal -->

- [ ] The model's parameter count
- [x] Uses the system was not evaluated for and does not support
- [ ] The vendor's marketing claims
- [ ] The training dataset's licence

**Why:** The out-of-scope section is the misuse-prevention part of the card. "Not evaluated for legal, medical or financial advice" is a complete statement that changes how a reader may use the system.

### Q6. Governance guidance changes. What should every claim in your memo carry? <!-- id: sc-07-ai-governance-and-compliance-q06 energy: low -->

- [ ] A confidence percentage
- [ ] A legal citation
- [x] A date and a source
- [ ] A signature

**Why:** An undated claim cannot be re-checked and a sourced one can. The date says when the rule was read; the source says where to read it again.

## You're ready to move on when...

- You can place a system in a tier and defend it from the definitions.
- You have written a model card with real limitations and out-of-scope uses.
- You can say what Article 50 covers and what it does not.
- Your memo names what does not apply and why.
- Every claim in your memo is dated and sourced.

## Free vs Paid

**Everything in this phase is free.** The primary legal texts are published openly, model-card formats are open, and the work is writing. There is no paid tool that substitutes for reading the definition and mapping it to your own system.
