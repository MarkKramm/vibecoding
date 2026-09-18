---
id: ft-04-evaluation-fundamentals
track: finetuning
phase: 4
order: 40
title: Evaluation Fundamentals
duration: 2 weeks
duration_weeks: 2
energy_mix: [high, normal]
deliverable: portfolio/finetuning/04-evaluation-fundamentals.md
exit_criteria: >
  You have a golden dataset of real inputs with an objective pass criterion per
  case, a documented dev/test split, and a programmatic checker wherever the
  outcome is checkable. You can name the LLM judge's biases and the mitigations
  for each, and you can explain why benchmarks mislead.
---

# Phase 4 — Evaluation Fundamentals

## Goal of this phase

This is **the highest-leverage skill in the curriculum, and the most skipped.** If you learn one thing in this track properly, make it this.

The problem is statistical and it is not obvious until it bites you. Language model outputs are **stochastic** and **high-dimensional**. A single output is a sample from a distribution over an enormous space of possible responses. Judging a system by looking at a handful of its outputs is therefore a terrible estimator — you are sampling a few points and generalising to the whole distribution, and your sample is biased toward the inputs you happened to think of.

This is how **vibes-based development** arises. It is a real and very common way of working: change a prompt, look at two outputs, decide it feels better, ship. It produces systems that **demo beautifully and regress silently.** The demo shows the cases you chose; production finds the ones you did not. There is no step in that process where a regression would become visible, so it accumulates.

Evaluation replaces impressions with a number, and the number is the whole point. It is what lets you say "this change improved things" instead of "this change seems better", and only one of those sentences survives contact with a colleague asking how you know.

**The governing principle of this phase:**

> **Code beats a judge whenever the outcome is checkable.**

Everything else here elaborates that sentence. A programmatic check is deterministic, free, instant, and cannot be flattered by a well-written answer. A model judge is flexible and handles the open-ended cases code cannot reach — and it arrives with named, measurable biases that you must actively mitigate. Reach for the judge last, not first.

By the end you will have a golden dataset, objective pass criteria, a working harness, and an honest statement of what your evaluation does **not** cover. That last item is not padding; an evaluation whose limits are unstated will be trusted beyond what it earns.

## Estimated time

**2 weeks** at 1–2 hours a day, 5 days a week. Roughly 12–16 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Why impressions are a terrible estimator | 1.5h |
| 2 | Building the golden dataset | 2h |
| 3 | Objective pass criteria, and preferring code | 1.5h |
| 4 | Negative and adversarial cases | 1.5h |
| 5 | Dev and test splits, and versioning in git | 1h |
| 6 | LLM-as-judge: what it is good for | 2h |
| 7 | The judge's biases and their mitigations | 2h |
| 8 | Human evaluation, done properly | 1.5h |
| 9 | Why benchmarks mislead | 1.5h |
| 10 | Regression testing and writing it up | 1.5h |

If you only have four hours this week, do tasks 1, 4, 8 and 12. Those give you the golden dataset, the pass criteria, a working checker, and the limits statement.

The time here is mostly thinking rather than running. Building twenty good cases takes longer than running a thousand bad ones and is worth far more.

## Skills you'll gain

- Explain why a few outputs are a poor estimator of a stochastic system's quality.
- Build a golden dataset from real inputs with objective pass criteria.
- Write programmatic checkers, and know when code cannot decide.
- Recognise when a change is a regression rather than a preference.
- Design negative and adversarial cases deliberately.
- Maintain a dev/test split and version your evaluation in git.
- Use an LLM judge where code is insufficient, with mitigations for its biases.
- Run a blinded, randomized, rubric-based human evaluation.
- Explain contamination, Goodhart's law, saturation and task mismatch.
- Build regression tests that run on every change.
- State honestly what your evaluation does not cover.

## Specific topics to learn

- **Stochasticity and the estimator problem** — why impressions fail.
- **Vibes-based development** — how silent regression accumulates.
- **The golden dataset** — real inputs, 20–50 cases to start.
- **Objective pass criteria** — a per-case definition of correct.
- **Programmatic checkers** — assertions on state, format, and content.
- **The escalation ladder** — code check, reference answer, rubric judge, no check.
- **Negative cases** — inputs that should be refused or produce "I don't know".
- **Adversarial cases** — inputs designed to break the system.
- **Dev versus test split** — and why tuning on the test set destroys it.
- **Versioning the evaluation in git** — so results are comparable over time.
- **Growing from production failures** — every real failure becomes a case.
- **LLM-as-judge** — what it is, and the reported agreement rate.
- **Judge biases** — position, verbosity, self-enhancement.
- **Judge mitigations** — position swapping, different model family, rubrics, reference answers, evidence quotes, structured verdicts, pinned versions.
- **Human evaluation** — pairwise, blinded, randomized, rubric-based.
- **Inter-rater agreement** — and being your own blinded rater.
- **Benchmark failure modes** — contamination, Goodhart, saturation, task mismatch.
- **Regression testing** — pin versions, run the full suite, track cost and latency.
- **Laundering a regression** by editing the expectation.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| `pytest` | Programmatic checkers and the suite runner | Free/open-source | https://docs.pytest.org/ | Tasks t06–t14 — assert on outcomes rather than impressions | Any test runner that exits non-zero on failure |
| `jsonschema` | Validate structured output automatically | Free/open-source | https://python-jsonschema.readthedocs.io/ | Task t07 — a checker that needs no judge | Hand-written assertions |
| `datasets` | Store the golden set and its splits | Free/open-source | https://huggingface.co/docs/datasets/index | Task t04 — version the cases alongside the code | A JSON file in your git repo |
| Promptfoo | Compare prompts and models across a case set | Free/open-source | https://www.promptfoo.dev/ | Task t15 — running the suite across two models | A hand-written script (about 100 lines — see Phase 6) |
| Ragas | Reference-free metrics for RAG-style systems | Free/open-source | https://docs.ragas.io/ | Task t11 — metrics where no gold answer exists | Write the check yourself from the definition |
| Weights & Biases | Track results across runs so comparisons survive | Freemium | https://wandb.ai/ | Task t16 — cost and latency alongside quality | TensorBoard, or a CSV committed to git |
| Google Sheets | Blinded human evaluation, with rows shuffled | Free | https://sheets.google.com/ | Task t13 — rate outputs without knowing which system produced them | Any spreadsheet, or a paper form |

## Free/cheap resources

- **The LLM-as-a-judge paper (arXiv:2306.05685)** — the primary source for the agreement rate and for the bias taxonomy. Read the abstract and the section naming the biases, because the mitigations you will apply come directly from it.
- **The RAG track's evaluation phases** — complementary perspective on retrieval-specific metrics, which matter if your system retrieves.
- **`pytest` documentation** — the first ten pages are enough. A checker is a function that returns pass or fail, and the framework is incidental.
- **Your own production failures** — the most valuable evaluation data you will ever have, and it is free. Every real failure you have seen is a case your suite is currently missing.
- **Your Phase 3 dataset** — if you built one, the inputs are reusable. Note that raw training data is not a golden set: it has no pass criteria and no adversarial cases.

## Lesson: Making "Better" a Number

### Why your impressions are not evidence

Consider what happens when you change a prompt and look at the output. You have observed **one sample** from a distribution, on **one input** that you chose. Then you form a belief about the system's quality across all inputs. Every part of that inference is unsound.

Three specific failure modes:

1. **Sample size one.** The same prompt on the same input can produce different outputs across runs. One observation tells you little about the distribution, and nothing about variance.
2. **Selection bias.** You tested the inputs you thought of, which are systematically the easy or interesting ones. The inputs that break your system are, by definition, the ones you did not think of.
3. **The change is invisible in the aggregate.** A prompt tweak that fixes the case in front of you may break two others you did not retest. You will never know, because you never looked.

The professional consequence is **vibes-based development**: systems that demo well and degrade quietly. Nobody decides to work this way; it is the default that emerges when the alternative looks like overhead. And the overhead is real — building an evaluation takes days. It is also the only thing standing between you and shipping a regression you cannot see.

### The golden dataset

A golden dataset is a fixed set of inputs, each with an **objective pass criterion**. That is the whole definition, and both halves matter.

**Real inputs.** As in Phase 3: real beats invented for the same reason. Invented cases test your imagination of the failure space, and the unimagined failures are exactly the ones that reach production.

**Twenty to fifty cases to start.** Small is fine and small is *correct* at the beginning. A suite of twenty cases you actually run beats a suite of two hundred you do not, and it will already catch most regressions. Grow it from failures rather than trying to enumerate the space up front.

Each case has:

| Field | Example |
|---|---|
| Input | The exact request, verbatim from production where possible |
| Pass criterion | The objective definition of correct for this case |
| Checker | The code that decides pass or fail |
| Category | Classification, extraction, refusal, format, edge case |
| Notes | Why this case exists — often "production failure on 12 March" |

**The pass criterion is where the work is.** "A good answer" is not a criterion. "Output is valid JSON matching this schema, and the `total` field equals the sum of the `items` array" is a criterion, because code can decide it. If you cannot state the criterion objectively, you have not finished defining the task — and that is a finding about the task, not a limitation of evaluation.

### Code beats a judge

The phase's governing principle, stated as an escalation ladder. Stop at the **first** rung that works.

```text
1. CODE CHECK            ← prefer always
   Deterministic assertion on state, format, or content.
   Free, instant, reproducible, cannot be talked out of its verdict.

2. REFERENCE ANSWER CHECK
   Compare against a known-good output, exactly or by similarity.
   Deterministic, but needs a gold answer you trust.

3. RUBRIC JUDGE
   A model scores against explicit criteria.
   Flexible, handles open-ended output. Costs money, has biases, is stochastic.

4. NO CHECK              ← a finding, not a destination
   If you cannot check it at all, say so, and say what that means for trust.
```

The reason code is preferred is not cost, though it is also cheaper. It is that **a deterministic check cannot be persuaded.** A judge asked "is this a good answer?" will rate a confident, fluent, wrong answer highly, because fluency and confidence are what it was trained to value. Code asserting that the database row exists cannot be charmed.

Most "we need a judge" problems turn out to be checkable in code once the output is constrained. If the answer must be JSON, validate the schema. If it must name a source, assert that the source appears in the retrieved context. If it must not invent, supply inputs whose correct answer is "not found" and assert the refusal string.

**Three categories that are almost always code-checkable:**

- **Format** — schema validation, regex, parseability.
- **Grounding** — does every claim appear in the supplied context?
- **Refusal** — for an unanswerable input, did it decline with the expected signal?

⚠️ **The habit that makes any checker trustworthy:** verify that it **can** fail. Introduce a known-bad output and confirm the check catches it. A checker that always passes is worse than no checker, because it manufactures confidence — the same argument the agents track makes about unverified caps and the cost track about unverified budget limits. This is task t14 below and it is not optional.

### The LLM judge, used properly

Sometimes code genuinely cannot decide — summarisation quality, tone, whether an explanation is clear. For those, a strong model as judge is a legitimate and scalable tool, and the evidence supports it: strong judges **match human preference with over 80% agreement**, which the paper notes is *the same level of agreement found between humans*. That is the honest framing. The judge is not a worse substitute for a human; it is roughly as consistent with human preference as another human is.

It also has **named biases**, which you must mitigate rather than hope away:

| Bias | What it is | Mitigation |
|---|---|---|
| **Position** | Prefers the response shown first | Evaluate both orders and require consistency |
| **Verbosity** | Prefers longer answers | Give a rubric that rewards concision; cap length |
| **Self-enhancement** | Prefers its own family's outputs | Use a **different model family** as judge |
| **Weak reasoning** | Fails multi-step verification | Supply a reference answer; require evidence quotes |

Five further practices that turn a judge from a vibe into an instrument:

- **Give a rubric**, not a vague request for a score.
- **Supply a reference answer** where one exists — judging against a target is far more reliable than judging in the abstract.
- **Require evidence quotes**, so the verdict is anchored to text in the output rather than an impression.
- **Force a structured verdict** — a fixed schema with a decision and a reason — so the result is parseable and comparable.
- **Pin the judge's version.** If the judge silently upgrades, your historical numbers stop being comparable, and you will not be told.

### Human evaluation, done properly

A human is still the reference standard for subjective quality, and the same statistical discipline applies.

- **Pairwise, not absolute.** "Which of these two is better?" is far more reliable than "rate this 1–10", because it removes scale drift.
- **Blinded.** The rater must not know which system produced which output.
- **Randomized order** to neutralise position effects in humans, who have them too.
- **A rubric**, so the judgement is about the stated criteria.
- **Inter-rater agreement.** If two raters disagree, the rubric is ambiguous, and the fix is the rubric rather than more ratings.

**You can be your own blinded rater.** Generate outputs from both systems, strip the labels, shuffle them, wait long enough to forget which was which, then rate. This sounds informal and it is genuinely effective — it removes the most damaging bias, which is knowing which answer you are supposed to prefer.

### Why benchmarks mislead

Public benchmarks are not useless, and they are routinely misread. Four named failure modes:

- **Contamination.** Test data leaks into training data. A model that has seen the answers scores well without the capability.
- **Goodhart's law.** When a measure becomes a target, it ceases to be a good measure. Optimising for the benchmark stops improving the thing it was meant to proxy.
- **Saturation.** When everyone scores near the ceiling, the benchmark cannot discriminate — and the remaining differences are noise.
- **Task mismatch.** A benchmark measures *its* task. Your task is different in input distribution, output format, and what counts as success.

The practical rule: **a benchmark tells you about the benchmark.** For your system you need your own cases. A leaderboard can help you choose a starting model; it cannot tell you whether your system works.

### Regression testing

An evaluation's daily value is in catching regressions. Four practices make that work:

1. **Version your prompts** in git, so a change is a diff.
2. **Pin your model versions.** An unpinned model can change under you, and your historical numbers become meaningless without any action on your part.
3. **Run the full suite on every change** — the complete suite, not the cases you think are affected. Regressions appear where you did not look.
4. **Track cost and latency alongside quality.** A change that improves quality by 2% while tripling cost is a decision, not an improvement, and you cannot make it without the other two numbers.

⚠️ **The trap worth naming explicitly: laundering a regression by editing the expectation.** When a change breaks a case, there are two responses — fix the system, or change what the case expects. The second is sometimes correct (the old expectation was wrong) and is far more often self-deception. The discipline: when you change an expectation, write down **why the old expectation was wrong**, and be suspicious if you cannot. A suite whose expectations are edited whenever they fail has been converted into a suite that always passes, which is the always-passing checker again, one level up.

### What your evaluation does not cover

This is required in your deliverable, and it is the mark of someone who understands measurement.

Every evaluation has limits. Yours might not cover: languages other than the ones you tested, inputs longer than your longest case, concurrent load, adversarial users, or the long tail of real traffic. Your suite of thirty cases was chosen by you, and it inherits your blind spots.

Stating the limits costs nothing and prevents the specific failure where a good number is trusted far beyond what it measures. "We pass 27 of 30 cases; the suite contains no non-English inputs and no inputs over 2,000 tokens" is an honest and useful sentence. "We pass 27 of 30" alone invites someone to conclude the system is 90% reliable in production, which you have not shown.

## Hands-on practice tasks

1. Write down three changes you recently judged by looking at outputs. For each, state what a proper measurement would have required. <!-- id: ft-04-evaluation-fundamentals-t01 band: focused energy: normal -->
2. Build a golden dataset of at least 20 real inputs, each with a written objective pass criterion. <!-- id: ft-04-evaluation-fundamentals-t02 band: deep energy: high -->
3. For each case, label the category: format, grounding, classification, refusal, or other. Note which categories dominate. <!-- id: ft-04-evaluation-fundamentals-t03 band: focused energy: normal -->
4. Version your golden set in git alongside the code, with a commit message explaining each addition. <!-- id: ft-04-evaluation-fundamentals-t04 band: focused energy: normal -->
5. Sort your cases by how obvious the pass criterion is. Rewrite the three vaguest until code could decide them. <!-- id: ft-04-evaluation-fundamentals-t05 band: focused energy: high -->
6. Write programmatic checkers for every case where code can decide. Report how many cases that covers. <!-- id: ft-04-evaluation-fundamentals-t06 band: deep energy: high -->
7. Add schema validation for any structured output, including a failing example that proves it rejects malformed data. <!-- id: ft-04-evaluation-fundamentals-t07 band: focused energy: normal -->
8. Add at least five negative cases — inputs that should be refused or answered "not found". Assert the correct behaviour. <!-- id: ft-04-evaluation-fundamentals-t08 band: deep energy: high -->
9. Add at least three adversarial cases designed to break the system. Record whether they succeed. <!-- id: ft-04-evaluation-fundamentals-t09 band: deep energy: high -->
10. Split your cases into dev and test, and commit to not tuning on the test split. Write the rule down. <!-- id: ft-04-evaluation-fundamentals-t10 band: focused energy: normal -->
11. For cases code cannot check, write a rubric a judge could apply. If you cannot, ask whether the case is well-defined. <!-- id: ft-04-evaluation-fundamentals-t11 band: focused energy: high -->
12. Implement a judge with at least three mitigations: different model family, rubric, reference answer, evidence quotes, or structured verdict. <!-- id: ft-04-evaluation-fundamentals-t12 band: deep energy: high -->
13. Run a blinded human evaluation on at least ten outputs. Shuffle and strip labels before rating. <!-- id: ft-04-evaluation-fundamentals-t13 band: deep energy: high -->
14. Verify every checker by making it fail: introduce known-bad output and confirm each check catches it. Record which did not. <!-- id: ft-04-evaluation-fundamentals-t14 band: deep energy: high -->
15. Run your full suite against two different models. Report both scores and the per-case differences. <!-- id: ft-04-evaluation-fundamentals-t15 band: focused energy: normal -->
16. Record cost and latency per case alongside quality. Identify any change that trades one for another. <!-- id: ft-04-evaluation-fundamentals-t16 band: focused energy: normal -->
17. Deliberately change one expectation to make a failing case pass. Write down why the old expectation was wrong, then decide honestly whether it was. <!-- id: ft-04-evaluation-fundamentals-t17 band: deep energy: high -->
18. Write your limits statement: what your evaluation does not cover, and what someone should not conclude from your number. <!-- id: ft-04-evaluation-fundamentals-t18 band: ongoing energy: normal -->
19. Add one case from a real failure you have seen, and note where it came from. <!-- id: ft-04-evaluation-fundamentals-t19 band: ongoing energy: low -->

## Common Pitfalls

**Judging by looking at outputs.** The default failure, and the reason vibes-based development is so common. One output is a sample size of one, on an input you selected.

**Vague pass criteria.** "A good answer" is not checkable, and a suite of uncheckable cases is an opinion poll. If you cannot state the criterion objectively, the task is underdefined.

**Reaching for a judge first.** Most judge-shaped problems are code-checkable once the output is constrained. Judges cost money, are stochastic, and carry named biases.

**Never verifying that a checker can fail.** An always-passing check manufactures confidence and is worse than no check, because the number it produces looks like evidence.

**Tuning on the test set.** Once you have optimised against it, it measures your tuning, not your system. Keep a held-out split and leave it alone.

**Editing an expectation to make a regression disappear.** Occasionally correct, usually self-deception. Write down why the old expectation was wrong, and be suspicious if you cannot.

**Using the same model family as judge.** Self-enhancement bias is documented. Use a different family, and say which one you used.

**Leaving the judge's version unpinned.** A silent upgrade breaks comparability of every historical number, and nothing tells you it happened.

**Trusting a benchmark as evidence about your system.** Contamination, Goodhart, saturation and task mismatch all operate. A benchmark describes the benchmark.

**Omitting the limits statement.** A number without its boundaries will be trusted beyond what it measures, and that is your responsibility rather than the reader's.

## Deliverable / proof of work

Create `portfolio/finetuning/04-evaluation-fundamentals.md` containing:

1. **The golden dataset** — at least 20 real cases, each with an objective pass criterion, committed to git.
2. **The checker inventory** — which cases are code-checked, which need a judge, and how many fall into each.
3. **The proof that checkers fail** — the known-bad outputs you introduced and confirmation each check caught them.
4. **The judge configuration**, if you used one: which model, which family, the rubric, and every mitigation applied.
5. **The human evaluation** — how you blinded and randomized it, and what it found.
6. **The dev/test split rule**, stated explicitly.
7. **A comparison of two systems or models**, with per-case differences rather than only totals.
8. **Cost and latency** alongside quality.
9. **The limits statement** — what this evaluation does not cover.

Item 3 is required. An evaluation without a demonstrated-failing checker has not been shown to work, and that distinction is the difference between a measurement and a decoration.

## Checklist

- [ ] I can explain why a few outputs are a poor estimator <!-- id: ft-04-evaluation-fundamentals-c01 energy: normal -->
- [ ] I have at least 20 real inputs, not invented ones <!-- id: ft-04-evaluation-fundamentals-c02 energy: high -->
- [ ] Every case has a written objective pass criterion <!-- id: ft-04-evaluation-fundamentals-c03 energy: high -->
- [ ] I use code wherever the outcome is checkable <!-- id: ft-04-evaluation-fundamentals-c04 energy: high -->
- [ ] I have proven that every checker can fail <!-- id: ft-04-evaluation-fundamentals-c05 energy: high -->
- [ ] I have negative cases that assert correct refusal <!-- id: ft-04-evaluation-fundamentals-c06 energy: high -->
- [ ] I have adversarial cases designed to break the system <!-- id: ft-04-evaluation-fundamentals-c07 energy: normal -->
- [ ] My evaluation is versioned in git <!-- id: ft-04-evaluation-fundamentals-c08 energy: normal -->
- [ ] I maintain a held-out test split and do not tune on it <!-- id: ft-04-evaluation-fundamentals-c09 energy: high -->
- [ ] I can name the judge's position, verbosity and self-enhancement biases <!-- id: ft-04-evaluation-fundamentals-c10 energy: normal -->
- [ ] My judge uses a different model family from the system under test <!-- id: ft-04-evaluation-fundamentals-c11 energy: normal -->
- [ ] My judge has a rubric, and a reference answer where one exists <!-- id: ft-04-evaluation-fundamentals-c12 energy: normal -->
- [ ] My judge's version is pinned <!-- id: ft-04-evaluation-fundamentals-c13 energy: normal -->
- [ ] My human evaluation was blinded and randomized <!-- id: ft-04-evaluation-fundamentals-c14 energy: normal -->
- [ ] I can explain what contamination and Goodhart's law do to benchmarks <!-- id: ft-04-evaluation-fundamentals-c15 energy: normal -->
- [ ] I run the full suite on every change, not a selected subset <!-- id: ft-04-evaluation-fundamentals-c16 energy: high -->
- [ ] I track cost and latency next to quality <!-- id: ft-04-evaluation-fundamentals-c17 energy: normal -->
- [ ] I have written down what my evaluation does not cover <!-- id: ft-04-evaluation-fundamentals-c18 energy: high -->

## Quiz

### Q1. Why is looking at a few outputs a poor way to judge a system? <!-- id: ft-04-evaluation-fundamentals-q01 energy: high -->

- [ ] Because outputs are always wrong the first time
- [x] Because outputs are stochastic and high-dimensional, so a few samples on self-selected inputs is a biased estimator of the whole distribution
- [ ] Because judging takes too long
- [ ] Because the model changes between runs

**Why:** Three problems compound. The sample is tiny, so it says little about the distribution or its variance; the inputs were chosen by you, so they systematically exclude the cases that break the system; and a change that fixes the case in front of you may break others you never retested. Together these produce systems that demo beautifully and regress silently — not through carelessness, but because the process contains no step where a regression would become visible.

### Q2. When should you use an LLM judge rather than code? <!-- id: ft-04-evaluation-fundamentals-q02 energy: high -->

- [ ] Whenever the output is longer than a sentence
- [ ] Whenever you need a score between 1 and 10
- [x] Only when code genuinely cannot decide — for example open-ended quality or tone — and then with mitigations
- [ ] Whenever you have no time to write assertions

**Why:** Code is deterministic, free, instant and cannot be persuaded, which is why it is the first rung of the escalation ladder. A judge is flexible and handles what code cannot reach, and it arrives with documented biases. In practice most judge-shaped problems become code-checkable once the output is constrained: if it must be JSON, validate the schema; if every claim must be grounded, assert the claims appear in the context; if declining is required, assert the refusal signal on an unanswerable input.

### Q3. What does the evidence say about a strong LLM judge's agreement with humans? <!-- id: ft-04-evaluation-fundamentals-q03 energy: normal -->

- [ ] It is far lower than human-human agreement, so judges should not be used
- [x] Over 80% — the same level of agreement found between humans, which is why judges are a legitimate scalable tool for subjective cases
- [ ] It is perfect, so judges can replace human evaluation
- [ ] It varies so much that no conclusion is possible

**Why:** The framing matters in both directions. The judge is not a degraded substitute for a human — it is roughly as consistent with human preference as another human is, which is a genuinely strong result and the reason the technique is widely used. It is equally not perfect, and "same as human agreement" is not the same as "correct". The named biases are real and require the mitigations this phase lists, and the judge remains stochastic and costs money per call.

### Q4. Your system under test is built on one model family. Which judge should you use? <!-- id: ft-04-evaluation-fundamentals-q04 energy: normal -->

- [ ] The same family, because it understands the output style best
- [x] A different family, because self-enhancement bias means a judge favours its own family's outputs
- [ ] The largest model available regardless of family
- [ ] Any model — the bias is negligible

**Why:** Self-enhancement bias is documented: judges rate outputs from their own family more favourably. Using the same family therefore inflates your scores in a way that is invisible, because the judge is not wrong in any detectable manner — it is just systematically generous toward the thing you are measuring. Using a different family is a one-line configuration change that removes the bias, and you should state which judge you used so the choice is auditable.

### Q5. What does Goodhart's law mean for benchmarks? <!-- id: ft-04-evaluation-fundamentals-q05 energy: low -->

- [ ] Benchmarks are always wrong
- [x] When a measure becomes a target it stops being a good measure — optimising for the benchmark stops improving the thing it was meant to proxy
- [ ] Benchmarks should be replaced every year
- [ ] Larger benchmarks are more reliable

**Why:** The measure was only ever a proxy for capability, and once it becomes the objective, effort flows toward the measure rather than the underlying thing. Contamination compounds this, since a model that has seen the answers scores well without the capability, and saturation finishes the job by removing the benchmark's ability to discriminate at all. The practical conclusion is not that benchmarks are worthless — they help you pick a starting model — but that a benchmark describes the benchmark, not your system.

### Q6. Why must you verify that a checker can fail? <!-- id: ft-04-evaluation-fundamentals-q06 energy: high -->

- [ ] To measure how fast it runs
- [ ] To confirm it has no syntax errors
- [x] Because an always-passing check manufactures confidence — it produces a number that looks like evidence and is not, which is worse than an acknowledged absence of measurement
- [ ] Because failing checks improve the system's score

**Why:** The same argument appears in the agents track about untested caps and in the cost track about unverified budget limits: intent and effect differ, and only a deliberate failure reveals which you have. Introduce a known-bad output and confirm the check catches it. Without that step you do not know whether your 90% pass rate reflects the system or a checker that would pass anything — and the confidence the number creates is actively harmful, because it will be acted upon.

### Q7. What is wrong with editing a failing expectation so the suite passes? <!-- id: ft-04-evaluation-fundamentals-q07 energy: high -->

- [ ] Nothing — expectations go stale
- [ ] It is fine if you also improve the system
- [x] It is sometimes correct but usually self-deception, so write down why the OLD expectation was wrong and be suspicious if you cannot
- [ ] It invalidates the whole suite

**Why:** Sometimes the expectation genuinely was wrong, and updating it is correct maintenance. Far more often the change broke a real case and editing the expectation converts a detected regression into a passing suite — which is the always-passing checker one level up, and harder to spot because every individual edit looks reasonable. The written justification is the discipline: if you cannot articulate why the previous expectation was mistaken, you are probably laundering a regression rather than fixing an error.

### Q8. Why must you state what your evaluation does not cover? <!-- id: ft-04-evaluation-fundamentals-q08 energy: high -->

- [ ] To make the document longer
- [ ] Because regulations require it
- [x] Because a number without its boundaries will be trusted beyond what it measures, and preventing that misreading is your responsibility
- [ ] Because it improves the pass rate

**Why:** Your suite of thirty cases was chosen by you and inherits your blind spots — the languages you did not test, the input lengths you never tried, the load you never simulated. "We pass 27 of 30 cases, and the suite contains no non-English inputs" is honest and useful; "we pass 27 of 30" alone invites the conclusion that the system is 90% reliable in production, which has not been shown. Stating limits costs one paragraph and prevents a specific, predictable misreading.

## You're ready to move on when...

- You can explain why a handful of outputs is not evidence, in statistical terms.
- You have a versioned golden dataset with objective pass criteria per case.
- Most of your cases are code-checked, and you have proven each checker can fail.
- You can name the judge's biases and the mitigation for each.
- You have run a blinded human evaluation and know why blinding mattered.
- You maintain a held-out test split and can say what tuning on it would destroy.
- You have a written limits statement.

## Free vs Paid

**The entire phase is free.** Every tool listed is open-source or has a free tier, and the main input — your own failing cases — costs nothing but attention. A golden dataset of twenty cases built in a spreadsheet and checked with `pytest` is a complete, professional evaluation.

**The free path, concretely.** Store the golden set as a JSON or CSV file in your git repository, so it versions alongside the code. Write checkers as plain functions returning pass or fail, and run them with `pytest` or a short script. For cases needing a judge, use whatever model access you already have — and note that the free tier's smaller models are weaker judges, which is a real limitation to record rather than ignore. Run human evaluation in a free spreadsheet with the labels stripped and rows shuffled.

**Honest limits of the free path.** Judge calls consume your model quota, so a suite of fifty cases with a judge on each is fifty requests per run — affordable on most free tiers, and worth counting before you build a habit of running it constantly. Free-tier judges are often smaller models with weaker reasoning, which matters most for multi-step verification; supplying a reference answer compensates substantially. You cannot run a large suite against several models frequently, so batch your model comparisons rather than iterating live.

**What paid tiers add, and when they matter.** More judge capacity, and stronger judges. Neither changes the phase's central advice, which is to prefer code: a paid judge is still a stochastic, biased instrument, and every case you make code-checkable is one you no longer pay to evaluate. Spend on judge capacity only after you have exhausted what code can decide.

**The evaluation asset that is genuinely durable.** Unlike a model version or a price, your golden dataset and its checkers are yours permanently. They survive model changes, provider changes, and the end of any free tier — which is precisely why Phase 6 frames an eval suite as the thing that makes losing free access survivable rather than catastrophic.
