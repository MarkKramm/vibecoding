---
id: vb-03-reading-generated-code
track: vibecoding
phase: 3
order: 12
title: Reading and Reviewing Generated Code
duration: 2 weeks
duration_weeks: 2
energy_mix: [high, normal]
deliverable: portfolio/vibecoding/03-reading-generated-code.md
exit_criteria: >
  You can review generated code at a chosen altitude rather than reading it
  top-to-bottom, name the red flags that justify a closer look, and verify that a
  dependency or API actually exists before accepting a call to it. You have produced
  a written review of a real generated file that separates what you verified by
  running something from what you only judged by reading.
---

# Phase 3 — Reading and Reviewing Generated Code

## Goal of this phase

This is the survival skill of the track. Everything else — specification, testing, debugging, agents — is built on the ability to look at generated code and decide whether it is trustworthy. If you can only do one thing from this track, do this.

The phase opens with a reframing that most people find counterintuitive: **reviewing generated code is not the same skill as writing code, and it is not easier.**

When you write code you build understanding incrementally, decision by decision — you know why each line is there because you put it there. When you review code you did not write, you are looking for the **absence** of things: a missing edge case, a wrong assumption, a dependency that does not exist. Absence is harder to see than presence, and it is hardest to see in code that reads fluently, which generated code does by construction. This is why a competent programmer can review their own code well and generated code badly, and why "I read it and it looked fine" is not evidence of anything.

Two ideas carry the phase.

**The first is altitude.** You do not read generated code line by line; you read it at the level the risk justifies, and you drop to a lower altitude when something earns it. Reading every line of a 400-line file costs an hour and often finds nothing, which trains you to stop doing it. Reading the shape first and descending on suspicion finds the real problems in ten minutes.

**The second is that the highest-value check in this phase is embarrassingly mechanical: does the thing it calls actually exist?**

That check matters more than any stylistic review, because missing dependencies are not a rare curiosity — they are measured, systemic, and they have a documented attack path. A USENIX Security 2025 study generated 576,000 code samples from 16 models and found hallucinated packages in **at least 5.2% of samples from commercial models and 21.7% from open-source models**, with **205,474 unique invented package names** ([arXiv:2406.10279](https://arxiv.org/abs/2406.10279)). Five percent sounds small until you multiply it by every import statement you will accept this year.

By the end you will have written a real review of a real generated file, and — this is the part that matters — you will have separated in writing **what you verified by running something** from **what you only judged by reading**. Most people discover their reviews were almost entirely the second kind.

## Estimated time

**2 weeks** at 1–2 hours a day, 5 days a week. Roughly 10–14 hours. This phase is longer than its neighbours because it is the one that needs repetition to become a habit.

| Day | Focus | Time |
|---|---|---|
| 1–2 | Why reviewing is a different skill, and the altitude model | 3h |
| 3–4 | The red-flag taxonomy, and how to descend on suspicion | 3h |
| 5–6 | Verifying that things exist: APIs, packages, arguments | 3h |
| 7–8 | Reviewing diffs rather than files, and reviewing what was not changed | 3h |
| 9–10 | The written review, and separating verified from judged | 2h |

If you only have three hours, do tasks 3, 8 and 15. Those give you the verification habit, one full written review, and the verified-versus-judged split.

## Skills you'll gain

- Choose a review altitude deliberately, based on risk rather than on habit.
- Name the red flags that justify descending to a line-level read.
- Verify that an API, package or argument actually exists before accepting it.
- Detect hallucinated dependencies and understand the attack path they open.
- Review a diff for both what changed and what was touched without being asked.
- Distinguish checks that touch reality from judgements made by reading.
- Write a review that records which claims were verified and how.

## Specific topics to learn

- **Reviewing as a distinct skill** — searching for absence, not composing presence.
- **The altitude model** — shape, then structure, then lines, descending on suspicion.
- **The red-flag taxonomy** — invented APIs, unhandled edges, silent failures, security smells, unnecessary dependencies.
- **Package hallucination** — measured rates, and why the attack works (slopsquatting).
- **The existence check** — how to verify an import, a method signature and an argument order in under a minute.
- **Diff review versus file review** — and why untouched files are part of the diff.
- **Verified versus judged** — the distinction that keeps a review honest.
- **The three-question read** — what does it do, what happens when it fails, what did it assume.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Package registry for your language | The existence check — the highest-value habit here | Free | https://pypi.org · https://www.npmjs.com | Tasks 3, 4 | The language's own package manager |
| Official API documentation | Verifying a method signature and argument order | Free | — | Task 5 | The library's source, if docs are poor |
| Git | Reading diffs, which is how review works in practice | Free | https://git-scm.com | Tasks 8, 9 | — |
| A linter for your language | Catches the mechanical subset so you can spend attention elsewhere | Free | — | Task 11 | Most languages ship one |
| Any AI coding tool | Producing the code under review | Free tier sufficient | — | Tasks 2, 6, 15 | A local coding model |

## Free/cheap resources

- **We Have a Package for You! A Comprehensive Analysis of Package Hallucinations by Code Generating LLMs** — https://arxiv.org/abs/2406.10279 — USENIX Security 2025. The measured case for the existence check, with per-model breakdowns and mitigation strategies that were tested rather than assumed.
- **Foundations track** — in this repository — how models produce text, which is the mechanism behind invented calls.
- **Prompting Phase 6 (verification)** — in this repository — the same discipline applied to prose claims rather than code.
- **Finetuning & Evals track** — in this repository — the verification mindset in its most rigorous form.
- **Vibecoding Phase 1** — in this repository — the failure taxonomy this phase teaches you to detect.
- **shared/study-rules.md** — in this repository — worth re-reading, because review is the phase where people most often mistake recognition for comprehension.

## Lesson: Altitude, Red Flags, and the Existence Check

### Part 1 — Why reading generated code is a different skill

Start with the honest difficulty, because "just review it" is advice that assumes a skill most people have not built.

**Writing is constructive. Reviewing is detective work.** When you write, understanding accumulates: you decide to handle the empty case, so you know it is handled. When you review, you get a finished artefact and must infer the decisions that produced it — and the decision that was *never made* leaves no trace to find. The empty case that was not considered looks exactly like the empty case that was considered and handled elsewhere. In the first case you have a bug; in the second you do not; from the outside they can be identical.

Now add the property from Phase 1: generated code is fluent. It has consistent style, sensible naming, plausible structure. Your pattern-recognition instinct — trained over years on code written by people who understood it — reports "this looks fine" with high confidence. In Phase 1 that was the mechanism behind failures that look like success. Here it is the reason **reading a file and feeling good about it is not a review.**

So what is a review? It is a set of checks, some of which touch reality and some of which do not. The whole method of this phase is to **maximise the proportion that touch reality**, because those are the ones that can actually fail.

> **A judgement made by reading can be wrong without you ever finding out. A check that runs something tells you the answer.**

### Part 2 — The altitude model

You cannot read everything at maximum depth; you would spend your life reviewing and never ship, and you would find almost nothing for the effort. So altitude is chosen, not defaulted.

| Altitude | What you look at | Time for 400 lines | What it catches |
|---|---|---|---|
| 1. Shape | File structure, public interface, what it imports | 2–3 min | Wrong abstraction, huge dependency, missing piece |
| 2. Structure | Control flow, error paths, data flow | 5–10 min | Unhandled cases, wrong ordering, silent failure |
| 3. Lines | Individual statements, off-by-one, boundary logic | 20–40 min | Subtle logic errors, wrong comparison |

**The rule is: start high, descend on suspicion, and never descend everywhere.** Altitude 1 is where the cheap wins are, and it is the level people skip. Three minutes on imports catches a hallucinated dependency; three minutes on the public interface catches "this returns a dict but the caller expects a list".

**What earns a descent to altitude 3:**

- money, authentication, permissions, or anything with a legal consequence
- a boundary — `<` versus `<=`, first item, last item, empty input
- a loop with an index, or anything doing arithmetic on positions
- concurrency: threads, async, locks, shared state
- anything you cannot explain after two readings

The last item is the important one and it is diagnostic rather than categorical. **If you have read something twice and cannot say what it does, stop and go deeper** — either it is genuinely subtle, in which case you need to understand it, or it is confused, in which case you need to replace it. Both outcomes require the same action.

### Part 3 — The red-flag taxonomy

These are the patterns worth descending for. They are ranked by how often they cost real time.

**1. A call to something that might not exist.** The flagship failure. Every import, every method call on an unfamiliar object, every keyword argument. Measured rates below.

**2. Unhandled edges.** What happens on empty input, one item, a very large item, None/null, a duplicate key, a failed network call? The model solved the case you described; it did not raise the cases you did not describe. This is the most common *silent* defect.

**3. Error paths that swallow.** A bare `except: pass`, a catch that logs and continues, a default returned on failure that is indistinguishable from success. Generated code is often optimistic, and an optimistic error path is worse than no error path because it hides the failure.

**4. Unnecessary dependencies.** A new library for something the standard library does. Every dependency is supply-chain surface, licence exposure and a future upgrade. If the brief said "no new dependencies", this is a violation rather than a preference.

**5. Security smells.** String-concatenated SQL. Shell commands built from input. Secrets in code. `eval`. Broad permissions. Missing authorisation on an endpoint that has authentication. Phase 8 goes deep; the flag belongs here.

**6. Tests that match the code.** If tests arrived with the implementation, they assert what the code does. That includes the bugs. Phase 4 is entirely this problem, and it is listed here because it is a red flag *while reviewing*, not only while testing.

**7. Confident comments that contradict the code.** A docstring promising validation the function does not perform. The comment is not evidence; it is generated from the same distribution as the code and can be wrong in the same direction.

### Part 4 — The existence check, and why it is the highest-value habit here

Now the measured part, and it justifies more attention than every stylistic consideration combined.

A USENIX Security 2025 study generated **576,000 code samples** across 16 models and two languages and analysed the packages they recommended. The findings ([arXiv:2406.10279](https://arxiv.org/abs/2406.10279)):

- **At least 5.2% of samples from commercial models contained hallucinated packages.**
- **21.7% for open-source models** — roughly four times the rate.
- **205,474 unique invented package names** across the dataset.

Read the second number carefully if you use local or open-weight models. On a $0 budget that is likely you, and the exposure is materially higher than it is for someone on a paid frontier model. This is one of the few places in this track where the budget gap changes the *risk* rather than only the headroom.

**Why this is worse than an ordinary bug.** A missing package is a supply-chain attack surface. If you write `import reqeusts` — one transposition — your package manager will try to install a package that does not exist. It fails, you notice, you fix the typo. But if someone has *registered* `reqeusts` and published something malicious under that name, the install succeeds. This is **slopsquatting**: an attacker registers the names models most reliably hallucinate, and waits. An ordinary bug costs you time; this one can cost you your machine and your credentials.

The check itself takes under a minute and is entirely mechanical:

1. **For an import** — open the registry (PyPI, npm) and confirm the package exists, is spelled exactly that way, and look at who publishes it and when it was last updated.
2. **For a method call** — open the official documentation and confirm the method name, the argument order, and whether those keyword arguments exist in *your* version.
3. **For an unfamiliar API** — search the official docs for the exact string. If it only appears in blog posts and tutorials, that is a signal, not a confirmation.

**⚠️ Volatile, dated: as of 2026-09, the 5.2% and 21.7% figures come from the v3 revision of that paper and describe the 16 models it evaluated.** Newer models hallucinate fewer packages; the phenomenon has not been eliminated, and the existence check is cheap regardless of the base rate. Re-check the numbers, keep the habit.

### Part 5 — Reviewing diffs, not files

In practice you will rarely review a whole file. You will review a **diff** — and the most important thing to understand about diffs is what they do not show you.

A diff shows what changed. It does not show:

- **files that were touched in ways not visible in the hunks you looked at** — a helper edited, an import removed, a config value changed
- **files that should have changed and did not** — the caller that needed updating, the test that now asserts something stale, the migration that was never written
- **deletions** — a removed validation, a dropped check, a permission that quietly disappeared

So the review question is not "is this diff correct?" but **"is this diff complete, and is it only what I asked for?"** Two habits follow.

**First, list the changed files before reading any diff hunks.** `git diff --stat` takes a second. If a task asked for one file and six changed, you have found something more important than any line-level issue.

**Second, read deletions as carefully as additions.** A removed line is invisible in the final file — the file simply lacks it — and absence is what this whole phase trains you to notice. A deleted authorisation check leaves no trace in the code you review.

### Part 6 — The three-question read

For code you must understand without reading it exhaustively, three questions do most of the work. This is the skill Part 5 of Phase 1 called "describe its behaviour and its failure modes", reduced to a repeatable routine.

**1. What does it do?** In one sentence, in terms of inputs and outputs, in your own words. Not "it processes the data" — that is a restatement of the name. "Given a list of orders it returns the total for orders in the last 30 days, counting refunded orders as zero."

**2. What happens when it fails?** Follow every error path. Does it raise, return a sentinel, log and continue, or silently produce a wrong answer? **The dangerous answer is the last one**, and it is the most common in generated code.

**3. What did it assume?** Every function assumes something about its inputs. Not empty. Sorted. Unique. Under a size limit. Already validated. Encoding is UTF-8. The timezone is UTC. The model made these assumptions silently, because they are what the surrounding code in its training data assumed.

If you can answer all three, you own the code in the sense that matters — even if you did not read every line. If you cannot answer the second or third, you have a research task, not a review.

### Part 7 — Verified versus judged

End with the discipline that keeps the whole phase honest, and it is the one thing to take from this phase if you take nothing else.

Every statement in a review is one of two kinds:

- **Verified** — you ran something and observed a result. *"The package `httpx` exists on PyPI and is published by the encode organisation."* *"Calling with an empty list raises `IndexError`."* *"The test fails when I invert the comparison."*
- **Judged** — you read it and formed an opinion. *"The error handling looks reasonable."* *"This naming is clear."* *"The logic seems right."*

Both are legitimate. The failure is **not knowing which you are doing** — reporting a judgement with the confidence of a verification. That is precisely how a bad review passes: it is full of true statements about the code, none of which were tested.

So write reviews with the two separated. A practical format:

```text
VERIFIED
  - httpx exists, published by encode (pypi.org/project/httpx checked)
  - empty input raises IndexError (ran it)
  - tests pass (ran pytest, 12 passed)

JUDGED
  - error handling looks reasonable but returns None on failure,
    which the caller treats as "no results" -- likely a bug
  - naming is clear
  - no obvious security issue, but I did not check the SQL construction

NOT CHECKED
  - behaviour with >10,000 rows
  - concurrent calls
```

The `NOT CHECKED` section is the one people omit and the one that makes a review trustworthy. It states the boundary of what you actually did, which is what lets a colleague decide whether to rely on your review.

## Hands-on practice tasks

1. Generate a 200–400 line file with a model: a small CLI tool, a data-processing script, or similar. Do not read it yet. Save it, and note how you feel about it — that feeling is the thing this phase recalibrates. <!-- id: vb-03-reading-generated-code-t01 band: focused energy: normal -->
2. Review that file at altitude 1 only: structure, public interface, imports. Time yourself and cap it at three minutes. Write down every question you have. Do not answer them yet. <!-- id: vb-03-reading-generated-code-t02 band: quick energy: low -->
3. Run the existence check on every import in the file. For each: does the package exist, is it spelled exactly that way, who publishes it, when was it last updated? Record the result for each, including the boring confirmations — the point is the habit, and the habit only forms if you do the easy ones too. <!-- id: vb-03-reading-generated-code-t03 band: focused energy: normal -->
4. Deliberately induce a package hallucination. Ask a model for code using an obscure or nonexistent library, or introduce a subtle typo into an existing import. Then visit the registry and see what happens when the name does not exist — and check whether a similarly-named package *does*, which is the slopsquatting risk made concrete. <!-- id: vb-03-reading-generated-code-t04 band: focused energy: high -->
5. Pick three method calls on unfamiliar objects and verify each against the official documentation: method name, argument order, and whether those keyword arguments exist in your installed version. Record how many were exactly right. The answer is usually most, which is the point — a high base rate is exactly why the failures survive review. <!-- id: vb-03-reading-generated-code-t05 band: focused energy: normal -->
6. Ask a model to extend the file from task 1 with one small feature. Then run `git diff --stat` before reading any of the diff. Count the files that changed. If more than you asked for changed, that is the finding. <!-- id: vb-03-reading-generated-code-t06 band: focused energy: normal -->
7. Read that diff hunting specifically for **deletions**. Find every removed line and ask what capability it removed. A deleted validation or authorisation check is invisible in the final file, which is why this task needs its own pass. <!-- id: vb-03-reading-generated-code-t07 band: focused energy: high -->
8. Apply the three-question read to three functions in the file: what does it do, what happens when it fails, what did it assume. Write the answers. Where you cannot answer question 2 or 3, mark it as a research task rather than guessing. <!-- id: vb-03-reading-generated-code-t08 band: focused energy: normal -->
9. Find every error path in the file and classify each: raises, returns a sentinel, logs and continues, or silently produces a wrong answer. The last category is the dangerous one; count how many you find. <!-- id: vb-03-reading-generated-code-t09 band: focused energy: high -->
10. Check the input assumptions empirically. Call two or three functions with empty input, a single item, and something invalid. Record what actually happens rather than what the code suggests will happen. This task converts judgements into verifications, which is the skill. <!-- id: vb-03-reading-generated-code-t10 band: focused energy: normal -->
11. If your language has a linter, run it and note what it catches that you missed. Then note what it did **not** catch — the boundary logic, the unhandled case, the invented API. Understanding the boundary of automated review is the point. <!-- id: vb-03-reading-generated-code-t11 band: focused energy: low -->
12. Have a model review its own code from task 1 and read the review sceptically. Find one issue it claims is fine that is not, or one it flags that is not a problem. A model reviewing its own output shares the assumptions that produced it. <!-- id: vb-03-reading-generated-code-t12 band: focused energy: normal -->
13. Take the same 400-line file and review it at altitude 3. Time how long it takes and what you find that altitudes 1 and 2 missed. Most people find the expensive read has a poor return, which is the argument for the altitude model rather than against review. <!-- id: vb-03-reading-generated-code-t13 band: deep energy: high -->
14. Pick one function and read it until you can state its behaviour and failure modes in three sentences without looking. Record how many attempts it took. This is the baseline skill every later phase assumes. <!-- id: vb-03-reading-generated-code-t14 band: focused energy: high -->
15. Write the review as `portfolio/vibecoding/03-reading-generated-code.md`, using the VERIFIED / JUDGED / NOT CHECKED structure. Every line in VERIFIED must name what you ran or opened. Be strict about this: if you only read it, it goes in JUDGED. <!-- id: vb-03-reading-generated-code-t15 band: deep energy: high -->
16. Count the lines in each of your three sections. If VERIFIED is much smaller than JUDGED, that is the honest finding of this phase — most reviews are mostly opinion — and it is the thing to fix next time. <!-- id: vb-03-reading-generated-code-t16 band: quick energy: low -->

## Common Pitfalls

**Reading top-to-bottom and calling it a review.** It is the most natural approach and the least effective. Start at altitude 1, descend on suspicion, and accept that depth everywhere is unaffordable and unnecessary.

**Trusting the feeling of comprehension.** Generated code is designed by its statistics to read smoothly. Understanding the *shape* of a file is not understanding its behaviour, and the gap between the two is where the bugs are.

**Skipping the existence check because the code looks right.** This is the highest-value check in the phase and it takes under a minute. The measured base rate — 5.2% for commercial models, 21.7% for open-source — means skipping it is not a small risk, and on a free or local model your exposure is at the higher end.

**Reading the diff but not the file list.** `git diff --stat` first, every time. A task that asked for one file and changed six has a problem that no line-level review will reveal.

**Ignoring deletions.** Added lines are visually obvious in a diff; removed lines are not, and in the final file they leave no trace at all. A deleted check is exactly the kind of absence this phase trains you to find.

**Treating a model's self-review as independent.** Asking the same model that wrote the code to review it produces a review sharing the original assumptions. It can still be useful, but it is not a second opinion.

**Reporting judgements as if they were verifications.** The single most consequential habit to break. "The error handling looks fine" and "I ran it with invalid input and it returned None, which the caller treats as empty" are different kinds of statement, and conflating them is how a review gives false assurance.

**Reviewing for style instead of for failure.** Formatting, naming and comment quality are the cheapest things to notice and the least likely to hurt you. Spend the attention on existence, edges and error paths, and let the linter handle the rest.

## Deliverable / proof of work

- `portfolio/vibecoding/03-reading-generated-code.md`, containing:
  - the full review in VERIFIED / JUDGED / NOT CHECKED form, with each verified line naming what you ran or opened
  - the existence-check results for every import (task 3)
  - the API verification results for three unfamiliar calls (task 5)
  - the deletion pass findings (task 7)
  - the error-path classification, with the silently-wrong count (task 9)
  - the empirical input-assumption results (task 10)
  - the line counts of each section from task 16, and what the ratio tells you
- The generated file itself, kept in your notes — Phase 4 will use it to build a contract.

## Checklist

- [ ] I can explain why reviewing generated code is a different skill from writing code <!-- id: vb-03-reading-generated-code-c01 energy: normal -->
- [ ] I can choose a review altitude deliberately and name what earns a descent <!-- id: vb-03-reading-generated-code-c02 energy: normal -->
- [ ] I can list the red flags in rough order of how often they cost real time <!-- id: vb-03-reading-generated-code-c03 energy: normal -->
- [ ] I check that every import and unfamiliar API actually exists, every time <!-- id: vb-03-reading-generated-code-c04 energy: low -->
- [ ] I can state the measured package-hallucination rates and why they are higher for open models <!-- id: vb-03-reading-generated-code-c05 energy: normal -->
- [ ] I can explain the slopsquatting attack path in two sentences <!-- id: vb-03-reading-generated-code-c06 energy: normal -->
- [ ] I run `git diff --stat` before reading any diff hunks <!-- id: vb-03-reading-generated-code-c07 energy: low -->
- [ ] I read deletions as carefully as additions <!-- id: vb-03-reading-generated-code-c08 energy: normal -->
- [ ] I can apply the three-question read to an unfamiliar function <!-- id: vb-03-reading-generated-code-c09 energy: normal -->
- [ ] I classify every error path rather than assuming errors are handled <!-- id: vb-03-reading-generated-code-c10 energy: normal -->
- [ ] I separate what I verified from what I judged when writing a review <!-- id: vb-03-reading-generated-code-c11 energy: normal -->
- [ ] I state what I did not check, rather than letting silence imply coverage <!-- id: vb-03-reading-generated-code-c12 energy: low -->

## Quiz

### Q1. Why does this phase argue that reviewing generated code is not easier than writing it? <!-- id: vb-03-reading-generated-code-q01 energy: high -->

- [x] Reviewing means searching for absence, and absence is harder to see than presence in fluent code
- [ ] Generated code is longer than hand-written code
- [ ] Reviewing requires knowledge of more programming languages
- [ ] Generated code lacks the comments that explain intent

**Why:** Writing accumulates understanding as decisions are made; reviewing must infer the decisions that produced the artefact, and a decision that was *never made* leaves no trace. The unconsidered empty case and the deliberately handled one can look identical from outside, which is why reading a file and feeling good about it is not a review.

### Q2. A study of 576,000 generated code samples found hallucinated packages in at least what proportion of open-source model outputs? <!-- id: vb-03-reading-generated-code-q02 energy: normal -->

- [ ] About 1.2%
- [ ] About 5.2%
- [x] About 21.7%
- [ ] About 47%

**Why:** USENIX Security 2025 reported at least 5.2% for commercial models and **21.7% for open-source models** — roughly four times the rate ([arXiv:2406.10279](https://arxiv.org/abs/2406.10279)). 5.2% is the commercial figure and is the trap answer; the budget gap in this track changes the *risk* here, not only the headroom.

### Q3. Why is a hallucinated package more dangerous than an ordinary bug? <!-- id: vb-03-reading-generated-code-q03 energy: high -->

- [ ] It is harder to debug because no error is raised
- [ ] It slows down the build without failing it
- [ ] It only affects open-source models, which are less tested
- [x] An attacker can register the invented name, so the install succeeds and runs hostile code

**Why:** An invented name normally fails to install and you notice. But **slopsquatting** pre-registers the names models most reliably hallucinate, and then the install succeeds rather than failing — turning a typo into a supply-chain compromise. The 205,474 unique invented names are what makes the target list large enough to be worth an attacker's time.

### Q4. You are reviewing a diff from a task that asked for one file to be edited. What is the first thing to check? <!-- id: vb-03-reading-generated-code-q04 energy: normal -->

- [ ] Whether the added lines follow the project's style guide
- [x] Which files changed, before reading any hunks
- [ ] Whether the new code has adequate comments
- [ ] Whether the tests still pass

**Why:** `git diff --stat` takes a second and answers a question no hunk-level review can: is this diff *only* what I asked for? A task that asked for one file and changed six has a scope problem more important than any line-level issue. Style and comments are the cheapest things to notice and the least likely to hurt you.

### Q5. What does the three-question read ask? <!-- id: vb-03-reading-generated-code-q05 energy: normal -->

- [ ] What does it do, is it efficient, and does it follow conventions
- [ ] Who wrote it, when, and why
- [x] What does it do, what happens when it fails, and what did it assume
- [ ] Does it compile, does it pass tests, and is it documented

**Why:** The three questions reduce the ownership bar from Phase 1 — "describe its behaviour and failure modes" — into a repeatable routine. The second question is the dangerous one, because the worst answer is a silent wrong result rather than an exception, and the third surfaces the assumptions the model made without mentioning them.

### Q6. Which of these is a VERIFIED statement rather than a judged one? <!-- id: vb-03-reading-generated-code-q06 energy: normal -->

- [ ] The error handling looks reasonable
- [ ] The logic appears correct for the documented cases
- [ ] The naming is clear and consistent with the codebase
- [x] Calling the function with an empty list raises IndexError

**Why:** Verified means you ran something and observed a result. The other three are judgements by reading — legitimate, but reporting them with the confidence of a verification is exactly how a review gives false assurance. That is why the deliverable requires each verified line to name what was run or opened.

## You're ready to move on when...

You can review an unfamiliar generated file at altitude 1 in under three minutes and produce specific questions rather than a vague impression. You check every import and unfamiliar API against the registry or the official docs without deciding whether it is worth it — the check is a habit, not a judgement call. You run `git diff --stat` before reading any diff, and you read deletions deliberately. You can apply the three-question read to a function and, where you cannot answer questions two and three, mark it as a research task instead of guessing. Your written review separates verified from judged, names what you did not check, and you have looked honestly at the ratio between the sections.

## Free vs Paid

### Free path

Everything in this phase is free and the tools are already on your machine: a package registry in a browser tab, official docs, git, and a linter that ships with your language. The existence check costs one minute per import and no money. The paper is open access.

Note the asymmetry this phase establishes, because it is unusual in this track: **on a $0 budget your package-hallucination risk is higher, not lower**, because open-source and local models scored 21.7% against 5.2% for commercial ones. On a free tier the existence check is not a best practice; it is the specific thing standing between you and a supply-chain compromise.

### Paid path

A paid frontier model gives you fewer hallucinated imports, better adherence to constraints, and — most relevant here — **a larger context window, so you can give the reviewer the surrounding code** rather than a single file. Reviewing a function without its callers is genuinely harder, and context is what fixes that.

What money does not buy is the review itself. A stronger model produces code that reads better, which if anything makes the altitude discipline *more* necessary, not less: fluency is what makes absence hard to see, and a better writer of fluent code is a better producer of convincing wrong answers.

### Where the money genuinely matters

It matters in two places. **Context size** determines whether you can review a change in the context of the files it touches, which is the difference between reviewing a function and reviewing a change. And **quota** determines how much code you can afford to generate in order to practise reviewing, which is a real constraint in a phase whose whole method is repetition. The free-tier compensation is to review other people's code — open-source pull requests, your own older work — which is free, plentiful, and taught in the `career` track.
