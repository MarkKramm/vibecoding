---
id: sc-06-red-teaming-and-adversarial-evaluation
track: safety-career
phase: 6
order: 60
title: Red-Teaming and Adversarial Evaluation
duration: 1 week
duration_weeks: 1
energy_mix: [high, normal]
deliverable: portfolio/safety-career/06-red-teaming-and-adversarial-evaluation.md
exit_criteria: >
  You can define a threat model for one of your own systems with assets, attackers,
  and entry points. You can run at least three distinct attack classes against it
  (prompt injection, jailbreak, and data extraction) and record what succeeded and
  what did not. You can explain the difference between a benchmark score and an
  adversarial result, and why a system can pass one and fail the other. You have a
  written red-team report with reproduction steps and a mitigation you actually
  tried, not just proposed.
---

# Phase 6 — Red-Teaming and Adversarial Evaluation

## Goal of this phase

Every earlier phase in this track has taught you to *limit blast radius*: assume injection succeeds, shrink what it can reach, notice that it happened. This phase is about the other half of that sentence — *finding out whether it succeeds at all*, and how often, and against which defences, before a real attacker does.

The word "red-teaming" is used loosely enough to mean almost anything. Here it means something specific and repeatable: **a structured attempt to make a system do something its designers did not intend, conducted by someone who knows the system's own assumptions, with the results written down so they can be re-run.** That last clause is the one most people skip, and skipping it is what turns red-teaming into theatre — an afternoon of poking, a few screenshots, no change to the code.

The organising idea of this phase:

> **A benchmark tells you what a model can do on average. A red team tells you what it will do at the boundary.** You need both, and the second one is the one that determines whether your system ships safely, because attackers do not sample from the average case — they search for the edge.

By the end you will have a threat model for one real system you own, a small attack library you ran against it, a log of what worked, and one mitigation you implemented and re-tested rather than merely recommended.

## Estimated time

**1 week** at 1–2 hours a day. Roughly 8–10 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Threat modelling: assets, attackers, entry points | 1.5h |
| 2 | Prompt injection variants against your own system | 2h |
| 3 | Jailbreaks and instruction override | 1.5h |
| 4 | Data extraction and membership-style probes | 1.5h |
| 5 | Write the report and implement one mitigation | 2h |

If you only have three hours, do tasks 1, 6 and 10. Those give you the threat model, one working attack, and a written record.

## Skills you'll gain

- Write a threat model for an LLM system that names assets, attackers and entry points rather than vibes.
- Run at least three distinct attack classes and record reproducible steps.
- Distinguish a benchmark result from an adversarial result, and say which one gates a release.
- Implement one concrete mitigation and re-test against the same attack.
- Write a red-team report that another person could reproduce.

## Specific topics to learn

- Threat modelling for LLM systems: assets, trust boundaries, entry points.
- Direct and indirect prompt injection, and the difference between them.
- Jailbreak patterns: roleplay, encoding, multi-turn, and "ignore previous instructions".
- Data extraction: system prompt leakage, training-data probing, membership inference at a toy level.
- Adversarial evaluation: attack success rate, and why a single number hides the distribution.
- Benchmark vs. red-team: what each measures and what each misses.
- Mitigation categories: input filtering, output filtering, architectural isolation, human in the loop.
- Responsible disclosure and the ethics of testing systems you do not own.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Your own deployed or local system | The thing you are testing | Free | — | Always — only test what you own or have written permission to test | A local model run through a free runtime |
| A second model or API | Attacker model / judge model for automated probing | Free tier | Provider docs | Tasks t03, t07 — generating and classifying attack variants | A local model or a different free tier |
| `gitleaks` / `git log -S` | Secret scanning in history | Free/open-source | https://github.com/gitleaks/gitleaks | Task t09 — checking whether a successful extraction reached a secret | `git log -p` piped into `grep` |
| A spreadsheet or Markdown table | Attack log | Free | — | Tasks t04–t08 — the record is the deliverable | A plain Markdown table |
| `curl` / a small Python script | Reproducible request replay | Free | — | Task t06 — so an attack can be re-run by someone else | Any HTTP client, including `curl` |

## Free/cheap resources

- **OWASP Top 10 for LLM Applications** — https://owasp.org/www-project-top-10-for-large-language-model-applications/ — the canonical attack taxonomy; read the "Prompt Injection" and "Sensitive Information Disclosure" entries.
- **arXiv:2601.17548** — Maloyan and Namiot, *Prompt Injection Attacks on Agentic Coding Assistants* (January 2026) — the SoK paper this track already cites; re-read its taxonomy of 42 techniques.
- **Anthropic, "Many-shot jailbreaking"** — https://www.anthropic.com/research/many-shot-jailbreaking — a readable, reproducible attack family.
- **Simon Willison, "Prompt injection"** — https://simonwillison.net/series/prompt-injection/ — the running record of real incidents; the best source for "this actually happened" examples.
- **NIST AI Risk Management Framework** — https://www.nist.gov/itl/ai-risk-management-framework — the governance vocabulary; useful for the report's framing.

## Lesson: Red-teaming is a measurement, not a vibe

### Part 1 — Threat model first, or you are just poking

A red team without a threat model is a collection of clever prompts. It feels productive and produces nothing you can act on, because you never defined what "success" meant.

A minimal threat model for an LLM system has four lines:

1. **Asset** — what is worth taking or breaking. The system prompt, a user's private data, the ability to send email, the integrity of a generated answer.
2. **Attacker** — who wants it and what they can reach. A user of your chat, a reader of a document your RAG ingests, a third party who can write to a tool's output.
3. **Entry point** — where untrusted text enters. The chat box, a retrieved chunk, a tool result, a file the agent reads.
4. **Impact** — what happens if the attack succeeds. Data leaves, an action runs, an answer changes.

Write these four lines *before* you write a single attack. They are the filter: an attack that does not touch an asset through an entry point you listed is not a finding, it is a demo.

### Part 2 — The three attack classes you must run

Run at least one of each. A red team that only runs injection is a red team that only found injection.

**Injection.** Can you make the model treat text it reads as instructions? Test both direct (you type it) and indirect (it arrives through a document, a tool result, or a retrieved chunk). The indirect case is the one that matters for agents, and it is the one most people never test because it requires setting up the ingestion path.

**Jailbreak.** Can you make the model produce something its instructions forbid? Roleplay frames ("pretend you are..."), encoding tricks (base64, leetspeak, translation), and multi-turn escalation. The point is not the specific trick — tricks rot — it is whether your defences are *pattern-matching on known tricks* or *reasoning about intent*, because only the second survives a new trick.

**Extraction.** Can you get the model to reveal something it should not? The system prompt, another user's data, or a confident fabrication presented as fact. System-prompt leakage is the cheap win; data extraction across users is the serious one.

### Part 3 — Why a benchmark is not a red team

A benchmark samples from a distribution and reports an average. A red team searches the tail. A model can score 95% on a benchmark and fail every one of your ten adversarial probes, because the benchmark's 5% failure rate is spread across cases no attacker cares about, while the red team's failures are concentrated in the cases an attacker will find first.

The practical rule: **a benchmark gates capability, a red team gates release.** You need the benchmark to know whether the model is good enough to ship at all. You need the red team to know whether shipping it is safe. Passing the first does not imply passing the second, and the gap between them is where incidents live.

### Part 4 — What to do with a finding

Three options, in order of preference:

1. **Fix the architecture.** Remove the entry point, shrink the asset's exposure, add a human in the loop. This is the only fix that survives a new attack.
2. **Add a filter.** Input or output filtering catches known patterns. It is cheap and it rots; treat it as a speed bump, not a wall.
3. **Accept and document.** Sometimes the risk is real and the fix is not worth the cost. Write that down explicitly, with the owner and the date, so it is a decision rather than an oversight.

The mitigation you implement in this phase should be option 1 or 2, and you must re-run the same attack afterwards and record whether it still works. A mitigation that was never re-tested is a hypothesis.

### Part 5 — The ethics line

Test only systems you own or have written permission to test. Running these attacks against a provider's chat interface in a way that violates its terms, or against a third party's deployed system, is not research — it is unauthorised access, and the fact that the payload was a prompt does not change that. If you find a real vulnerability in someone else's system, disclose it through their published channel and give them time to fix it before you publish.

## Hands-on practice tasks

1. Write a four-line threat model for one system you own or can run locally. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-t01 band: focused energy: high -->
2. Enumerate every place untrusted text can enter that system. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-t02 band: focused energy: normal -->
3. Craft and run five direct prompt-injection variants; record which succeeded. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-t03 band: focused energy: normal -->
4. Set up an indirect injection path through a document or tool result the system reads. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-t04 band: deep energy: high -->
5. Run five jailbreak variants (roleplay, encoding, multi-turn) and note which bypassed any filter. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-t05 band: focused energy: normal -->
6. Attempt system-prompt extraction with at least three techniques. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-t06 band: focused energy: normal -->
7. Probe for cross-user data leakage if the system has any user state. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-t07 band: deep energy: high -->
8. Compute an attack success rate over your probe set and note the denominator. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-t08 band: focused energy: normal -->
9. Implement one mitigation (architectural or filter) and re-run the same attacks. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-t09 band: deep energy: high -->
10. Write the red-team report as a reproducible Markdown file. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-t10 band: focused energy: normal -->

## Common Pitfalls

- **Testing only the chat box.** The indirect path through retrieved documents and tool results is where real attacks live; the chat box is the least interesting surface.
- **Counting a jailbreak that needed twenty turns as a finding without noting the cost.** An attack that requires sustained interaction has a different risk profile from one that works in a single message.
- **Treating a filter that blocks your five probes as a fix.** If you did not try variants, you do not know what it blocks.
- **No re-test after the mitigation.** The mitigation is a hypothesis until the same attack is re-run.
- **Testing a system you do not own.** This is not a red team; it is unauthorised access with extra steps.

## Deliverable / proof of work

A Markdown file at `portfolio/safety-career/06-red-teaming-and-adversarial-evaluation.md` containing: the four-line threat model; the list of entry points; the attack log (attack, class, result, reproduction step); the attack success rate with its denominator; the mitigation implemented and the re-test result; and a short "what I would do next" section. Commit it.

## Checklist

- [ ] I can write a four-line threat model for a system I own. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-c01 energy: normal -->
- [ ] I can run direct and indirect prompt injection against my own system. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-c02 energy: normal -->
- [ ] I can distinguish a jailbreak from an injection. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-c03 energy: normal -->
- [ ] I can attempt system-prompt and data extraction and record the result. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-c04 energy: normal -->
- [ ] I can compute an attack success rate with a stated denominator. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-c05 energy: normal -->
- [ ] I can explain why a benchmark pass does not imply a red-team pass. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-c06 energy: normal -->
- [ ] I have implemented one mitigation and re-tested it. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-c07 energy: high -->
- [ ] I have a reproducible red-team report. <!-- id: sc-06-red-teaming-and-adversarial-evaluation-c08 energy: normal -->

## Quiz

### Q1. A model scores 96% on a standard benchmark. Your red team finds it complies with 4 of 10 injection probes. What does this tell you? <!-- id: sc-06-red-teaming-and-adversarial-evaluation-q01 energy: normal -->

- [ ] The benchmark is broken and should be discarded
- [ ] The model is unusable and should not ship
- [x] The benchmark measures average-case capability and the red team measures boundary behaviour — both are needed
- [ ] A red-team result overrides a benchmark result in all cases

**Why:** A benchmark samples the distribution and reports an average; a red team searches the tail. A model can be strong on average and weak at the boundary an attacker will probe, so the two measurements answer different questions and neither replaces the other.

### Q2. Which mitigation should you prefer first? <!-- id: sc-06-red-teaming-and-adversarial-evaluation-q02 energy: normal -->

- [ ] Add a keyword filter over the input
- [ ] Switch to a larger model
- [x] Remove the entry point or shrink the asset's exposure architecturally
- [ ] Accept and document the risk without changing anything

**Why:** Filters catch known patterns and rot as new ones appear; a larger model does not remove the attack surface. Changing the architecture so a successful injection reaches nothing worth taking is the only fix that keeps working against attacks you have not seen.

### Q3. Indirect prompt injection differs from direct injection because: <!-- id: sc-06-red-teaming-and-adversarial-evaluation-q03 energy: normal -->

- [x] It arrives through untrusted content the system reads, not through the user's own message
- [ ] It only works on smaller models
- [ ] It cannot affect tool calls
- [ ] It is always blocked by a strong system prompt

**Why:** Direct injection is typed by the user; indirect injection is carried by a document, a retrieved chunk, or a tool result. That is why an agent that reads untrusted content is a different risk class from a chat that only sees the user's text.

### Q4. An attack that needs fifteen turns to succeed is best described as: <!-- id: sc-06-red-teaming-and-adversarial-evaluation-q04 energy: normal -->

- [ ] Not a real attack
- [x] A high-cost attack with a different risk profile from a single-message attack
- [ ] Impossible to mitigate
- [ ] Equivalent to a single-message attack

**Why:** Cost matters to the attacker as much as success. A fifteen-turn attack is still a finding, but it belongs in the report with its cost stated, because the mitigation priority is different from a single-message bypass.

### Q5. Before running any attack, you should first: <!-- id: sc-06-red-teaming-and-adversarial-evaluation-q05 energy: normal -->

- [ ] Try the most clever prompt you can think of
- [x] Write a threat model naming assets, attackers, entry points and impact
- [ ] Run an automated fuzzer
- [ ] Read the model's system card

**Why:** Without a threat model, an attack that does not touch a named asset through a named entry point is a demo, not a finding. The model filters what you should test and what the result means.

### Q6. Testing a system you do not own and have no permission to test is: <!-- id: sc-06-red-teaming-and-adversarial-evaluation-q06 energy: normal -->

- [ ] Acceptable if you disclose it afterwards
- [ ] Research
- [x] Unauthorised access regardless of the payload
- [ ] Only a problem if data leaves the system

**Why:** The payload being a prompt does not change the fact that you are probing a system without authorisation. Real red-team work happens on systems you own or on systems whose owner has written permission to test.

## You're ready to move on when...

- You can write a four-line threat model for a system you own.
- You have run injection, jailbreak and extraction probes and recorded what happened.
- You can say why a benchmark pass does not imply a red-team pass.
- You have implemented one mitigation and re-tested the same attacks.
- Your report is reproducible from the steps you wrote down.

## Free vs Paid

**Everything in this phase is free.** You attack a system you already have, with prompts you write yourself. A second model as an attacker or judge fits inside free tiers, and the tools listed above are open-source or already installed. The only cost is your time, which is the point: a red team you ran yourself is more useful than a report you bought.
