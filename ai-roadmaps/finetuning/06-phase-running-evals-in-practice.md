---
id: ft-06-running-evals-in-practice
track: finetuning
phase: 6
order: 60
title: Running Evals in Practice
duration: 1 week
duration_weeks: 1
energy_mix: [high, normal]
deliverable: portfolio/finetuning/06-running-evals.md
exit_criteria: >
  You have a working evaluation harness of roughly 100 lines with no framework,
  reporting pass rates with per-case deltas against a baseline. You can classify
  a failure into a category, control the cost of running a suite, handle
  non-determinism honestly, and explain why an eval suite is what makes changing
  models survivable.
---

# Phase 6 — Running Evals in Practice

## Goal of this phase

Phase 4 built the evaluation. This phase makes it a **habit** — because an evaluation you run once is a document, and an evaluation you run on every change is a capability.

The gap between those two is not effort; it is friction. If running the suite takes forty minutes of setup, you will not run it. If it takes one command and thirty seconds, you will run it without thinking, and that is the entire difference between a project that regresses silently and one that does not.

So the centre of this phase is a deliberately small artifact: **a harness of roughly 100 lines, with no framework.** The most common failure here is not building a bad harness — it is not building one at all, because the task feels like it needs a tool, and the tool needs evaluating, and the setup grows until the original goal is forgotten. A hundred lines of plain code that runs your cases, applies your checkers, and prints a pass rate is genuinely enough, and you can write it in an afternoon.

Three further things this phase adds:

**Cost control.** Running a suite costs money or quota, and how you spend it determines how often you can afford to run it. Batch APIs are the cheapest way to execute a large suite; a cheap model lets you iterate and a strong model validates. Neither is obvious and both change what is practical.

**Handling failure properly.** When a case fails, the useful question is not "what do I change?" but "what *kind* of failure is this?" Classifying first prevents the most common debugging error, which is changing several things at once and learning nothing about which one mattered.

**Non-determinism, handled honestly.** The same input can produce different outputs across runs. A prompt that passes 60% of the time is a different product from one that passes 100%, and reporting a single pass or fail hides that entirely.

And the closing connection to your own situation: **an eval suite is what lets you change models when free access ends.** That is not a hypothetical for you — it is the specific event this whole curriculum was written around. Phase 4 gave you the measurement; this phase gives you the habit that turns a frightening migration into a measured one.

## Estimated time

**1 week** at 1–2 hours a day, 5 days a week. Roughly 6–8 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | The minimal harness — about 100 lines | 2h |
| 2 | Reporting: pass rates and per-case deltas | 1.5h |
| 3 | Cost control: batching, and cheap versus strong models | 1.5h |
| 4 | Classifying failures, and non-determinism | 1.5h |
| 5 | The migration drill, and making it a habit | 1.5h |

If you only have two hours, do tasks 1, 2 and 3. A working harness that reports a pass rate and per-case deltas is the phase; everything after it is refinement.

Resist the urge to add features on day 1. The harness you run beats the framework you configure.

## Skills you'll gain

- Write a minimal evaluation harness with no framework.
- Report pass rates with per-case deltas against a baseline.
- Control the cost of a suite run with batching and model choice.
- Classify failures into categories before changing anything.
- Measure and report non-determinism rather than hiding it.
- Avoid tuning on the test set in daily practice.
- Turn evaluation into a routine you actually follow.
- Use a suite to make a model migration a measured change.
- Apply the escalation ladder when deciding how to check a case.

## Specific topics to learn

- **The minimal harness** — run, check, record, report, in about 100 lines.
- **The four columns** — result, output, tokens, latency.
- **Pass rate with per-case deltas** — what changed, not just the total.
- **Baselines** — every run compared against a stored one.
- **Batching** — the cheapest way to run a large suite.
- **Cheap versus strong models** — iterate cheaply, validate strongly.
- **Failure classification** — retrieval, generation, format, refusal, harness bug.
- **One change at a time** — and why it is a rule.
- **The harness-bug category** — when the failure is yours, not the model's.
- **Non-determinism** — repeated runs and stability reporting.
- **The 60%-versus-100% distinction** — stability as a product property.
- **The tuning trap** — using the test set as a development set.
- **The escalation ladder** — code, reference, rubric, nothing.
- **The migration drill** — swapping models behind a stable suite.
- **Habit design** — making the suite cheap enough to run every time.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Python standard library | The whole harness — no framework needed | Free/open-source | https://docs.python.org/3/library/ | Tasks t01–t04 — about 100 lines | Any language with HTTP and JSON |
| `pytest` | Optional runner if you prefer assertions | Free/open-source | https://docs.pytest.org/ | Task t05 — or skip it entirely | A plain script that exits non-zero |
| Promptfoo | Comparative runs across models without writing the loop | Free/open-source | https://www.promptfoo.dev/ | Task t12 — the migration drill | Your own harness, which is the point of the phase |
| Weights & Biases | Store runs so deltas survive across sessions | Freemium | https://wandb.ai/ | Task t06 — tracking the baseline | A JSON file committed to git |
| Batch API | Run a large suite at a reduced rate | Freemium | https://platform.openai.com/docs/guides/batch | Task t08 — measuring the saving | Your provider's equivalent, or spread runs across days |
| SQLite | Record every run so stability comes from data | Free/open-source | https://sqlite.org/ | Task t11 — one row per run per case | JSONL appended to a file |

## Free/cheap resources

- **The Python standard library** — genuinely all you need. A harness is a loop with an HTTP call and an `if`.
- **Your Phase 4 evaluation** — the cases and checkers already exist. This phase only adds the runner and the reporting.
- **The Cost track's batching phase** — the economics of running many requests cheaply, which is exactly the suite's problem.
- **The agents track's evaluation phase** — `pass^k` and failure taxonomies, from a different angle. The classification idea here is the same technique applied to a suite rather than an agent.
- **Your own git history** — the baselines you should have been keeping. Every past result is a comparison you can no longer make, which is the argument for starting the habit now.

## Lesson: A Hundred Lines That Change How You Work

### The harness

Everything in this phase rests on a small program. Here is its whole shape:

```python
import json, time, statistics

def run_case(case):
    """Call the system under test and record what happened."""
    start = time.time()
    raw = call_system(case["input"])          # your existing system
    latency = time.time() - start
    return {
        "id": case["id"],
        "output": raw["text"],
        "tokens": raw.get("tokens"),
        "latency": latency,
    }

def check(case, result):
    """Apply THIS case's checker. Returns (passed, detail)."""
    fn = CHECKERS.get(case["checker"])
    if fn is None:
        return None, "no checker"                # honestly unchecked, not passed
    try:
        ok = fn(case, result["output"])
        return bool(ok), "" if ok else "checker returned False"
    except Exception as e:
        return False, f"harness bug: {e}"        # the failure is YOURS

def run_suite(cases, repeat=1):
    rows = []
    for _ in range(repeat):
        for case in cases:
            result = run_case(case)
            passed, detail = check(case, result)
            rows.append({**result, "passed": passed, "detail": detail})
    return rows

def main():
    cases = load_json("golden.json")
    baseline = load_json("baseline.json")        # the previous run
    rows = run_suite(cases, repeat=3)            # repeat for stability

    by_id = {}
    for r in rows:
        by_id.setdefault(r["id"], []).append(r["passed"])

    # Pass rate, and stability per case
    total, passed = 0, 0
    for cid, outcomes in by_id.items():
        total += len(outcomes)
        passed += sum(1 for o in outcomes if o)

    print(f"pass rate: {passed}/{total} = {passed/total:.1%}")

    # Per-case deltas against the baseline
    for cid, outcomes in sorted(by_id.items()):
        rate = sum(1 for o in outcomes if o) / len(outcomes)
        before = baseline.get(cid)
        if before is not None and abs(before - rate) > 0.01:
            arrow = "improved" if rate > before else "REGRESSED"
            print(f"  {arrow}  {cid}: {before:.0%} -> {rate:.0%}")

    # Non-determinism: cases that are neither always pass nor always fail
    unstable = {c: sum(o for o in v) / len(v)
                for c, v in by_id.items()
                if 0 < sum(o for o in v) < len(v)}
    for cid, rate in sorted(unstable.items()):
        print(f"  UNSTABLE {cid}: passes {rate:.0%} of the time")

    save_json("baseline.json", {c: sum(o for o in v) / len(v)
                                for c, v in by_id.items()})
```

That is the whole thing, and it does four jobs the framework versions also do:

1. **Runs the system over the case set.**
2. **Applies each case's own checker.**
3. **Records result, output, tokens and latency** — the four columns, because quality without cost and latency is half a picture.
4. **Prints a pass rate with per-case deltas against the baseline.**

Two design choices in that code are worth defending, because they are the difference between a harness and a decoration.

**`check` returns `None` for a case with no checker, not `True`.** A case that cannot be checked has *not passed* — it is unchecked, and counting it as a pass inflates your rate with cases nobody verified. This is the always-passing-checker problem from Phase 4, arriving through the back door of an overly generous default.

**An exception in a checker is reported as `harness bug`, not as a failure of the system.** When a checker crashes, the fault is yours. Filing it under model failures sends you debugging a system that is fine, which is one of the more irritating ways to lose an afternoon.

### Reporting: deltas, not totals

The per-case delta is the most valuable line of output, and it is why the baseline file matters.

A total pass rate tells you *whether* something changed. A delta tells you *what*: which cases improved and which regressed. Without it you know your score moved from 74% to 76% and have no idea whether that is two new passes, four new passes and two regressions, or a checker that broke.

**A regression that a total hides is the dangerous case.** If three cases improved and two broke, the total reads +1 and looks like progress. The two broken cases will be discovered in production. Per-case deltas are how you see them while they are still cheap to fix.

Store the baseline wherever it survives — a JSON file in git is fine and has the advantage of being diffable, so the history of your system's stability is in the repository alongside the code that produced it.

### Cost control

Running a suite has a price, and how you pay it determines how often you can run it — which determines whether the habit forms.

**Batching is the cheapest way to run a large suite.** Batch APIs process requests asynchronously, usually within a day, at a substantial discount. For a suite you run nightly or before a release, that discount applies to exactly the workload that suits it: many independent requests, no human waiting. It is the wrong tool for interactive iteration and the right one for a full regression run.

**Use a cheap model to iterate and a strong model to validate.** During development you are asking "did my change break anything obvious?", and a cheap model answers that for a fraction of the cost. Before you ship or report a number, run the same suite on the model you actually intend to use. Two models, two purposes, and conflating them either wastes money or produces numbers about the wrong thing.

**Count the cost of your suite before you build the habit.** Fifty cases, three repeats, is 150 calls per run. If that consumes a meaningful share of a free quota, you need to know now rather than after you have made running it a routine — because the routine will be the thing you drop first when the quota pinches.

### Classifying failures

When a case fails, resist the urge to change something immediately. Classify first.

| Category | What it looks like | Where the fix is |
|---|---|---|
| **Retrieval** | The answer needed information that was never supplied | The retrieval step, not the model |
| **Generation** | The information was there; the answer is wrong anyway | The prompt, or the model |
| **Format** | Content correct, structure violates the requirement | Constrain the output, don't retrain |
| **Refusal** | Declined when it should have answered, or vice versa | The prompt, and your refusal examples |
| **Harness bug** | The checker crashed or was wrong | Your code |

Two rules make classification pay.

**Fix one thing at a time.** Changing the prompt, the retrieval depth and the model in one pass gives you a different score and no information about which change caused it. This is the same discipline Phase 2 taught about hyperparameters, and it applies with more force here because a suite run is slower than a training run's feedback.

**Count the categories across the whole suite.** A suite where most failures are retrieval is telling you to work on retrieval; a suite where most are format is telling you the model is not the problem at all. The distribution directs effort far better than the individual failures do, precisely because any single failure is easy to over-interpret.

### Non-determinism, reported honestly

The same input can produce different outputs on different runs. A suite that runs each case once and reports pass or fail conceals this entirely — and the concealment is the problem, not the variation.

**Run each case multiple times and report stability.** Three repeats is usually enough to reveal the difference between a case that always passes and one that passes two times in three. The two require different responses: the first is working, the second is a coin flip that will fail in front of a user.

**A prompt that passes 60% of the time is a different product from one that passes 100%.** This is the single most useful sentence in the phase, and it is why the harness above prints an `UNSTABLE` section. An unstable case is not a passing case with a blemish — it is a feature that works most of the time, and whether that is acceptable depends entirely on what it does when it fails.

**Report stability alongside the pass rate.** "27 of 30 cases, of which 3 are unstable" is a materially different statement from "27 of 30", and the difference is invisible in the second.

### The trap: tuning on the test set

Phase 4 introduced the dev/test split. This is where it gets violated in practice, usually without intent.

The mechanism is simple. You run the full suite, see failures, fix them, run again, and repeat — until the suite passes. At that point the suite no longer measures your system's quality; it measures your ability to satisfy those specific cases. You have converted your test set into a training set, one iteration at a time.

**The practical discipline:** work against the **dev** split while iterating, and run the **test** split when you want a number you can report. If you find yourself repeatedly running test and adjusting, stop — the number stopped meaning anything several iterations ago. Adding cases from production failures is different and encouraged; that is growth, not tuning.

### The escalation ladder, applied

Phase 4's ladder decides how to check a case; in daily practice it decides what to do with a failure.

```text
code check  >  reference answer check  >  rubric judge  >  no check
```

When a case fails and you cannot tell whether it is the system or the expectation, walk down the ladder. If code cannot decide it, write a reference answer the case can be compared against. Only if that is impossible should a judge be involved, and a case that ends at "no check" should be labelled as unchecked rather than quietly counted as passing.

### The migration drill

Now the part that connects to your own situation.

**Your free access will end, or change, or become expensive.** That is not a risk to plan around later; it is the event this curriculum was written around. And the difference between a scary migration and a measured one is entirely the suite.

With a suite, changing models is a procedure:

```text
1. Run the suite on the current model.            <- the baseline
2. Run the identical suite on the new model.
3. Compare per-case deltas, not the totals.
4. Check cost and latency alongside quality.
5. Decide: migrate, stay, or route between both.
```

Every step is mechanical, and step 5 becomes a real decision with evidence behind it rather than a guess made under pressure. That is what makes the migration survivable: not that you avoid changing models — you will change models repeatedly — but that changing them is a measurement.

**Do the drill while nothing is forcing you to.** Run it on a model you are not going to switch to. A migration is the worst time to discover that your harness does not run, your baseline is stale, or your checkers were never verified to fail. Practising it costs an afternoon and removes the panic from the moment when it actually matters.

### Making it a habit

The final point, and the one that determines whether any of this survives contact with a busy week.

**Make it one command.** If running the suite means remembering flags and paths, it will not happen. A script with no arguments that prints the report is the target.

**Make it fast enough that you do not think about it.** A subset of the suite that runs in seconds is worth more than a complete one that takes ten minutes, because you will actually run the former. Keep the full run for before a release.

**Run it before every commit that touches the system** — prompts, retrieval, model choice, configuration. The cases you might have broken are precisely the ones you were not thinking about, which is the definition of a regression.

**Grow it from every production failure.** This is the only part that never stops. Each real failure becomes a case, and the suite becomes a record of everything that has ever gone wrong — which is the most valuable test set you will ever have, and it costs nothing but the discipline to write the case down.

An eval suite is not a project you complete. It is a practice you keep, and it is the thing that makes every future change to your system a measured one rather than a hopeful one.

## Hands-on practice tasks

1. Write a harness of roughly 100 lines that runs your case set and prints a pass rate. No framework. <!-- id: ft-06-running-evals-in-practice-t01 band: deep energy: high -->
2. Add per-case deltas against a stored baseline, and confirm a regression shows up as `REGRESSED` rather than being hidden in the total. <!-- id: ft-06-running-evals-in-practice-t02 band: deep energy: high -->
3. Record result, output, tokens and latency for every case, and confirm all four are visible in the report. <!-- id: ft-06-running-evals-in-practice-t03 band: focused energy: normal -->
4. Make a case with no checker report as unchecked rather than passing. Verify the pass rate does not inflate. <!-- id: ft-06-running-evals-in-practice-t04 band: focused energy: high -->
5. Break a checker deliberately and confirm the failure is reported as a harness bug, not as a system failure. <!-- id: ft-06-running-evals-in-practice-t05 band: focused energy: high -->
6. Commit your baseline to git and confirm that two runs are comparable by diffing. <!-- id: ft-06-running-evals-in-practice-t06 band: focused energy: normal -->
7. Time a full suite run and compute the number of calls it makes. Decide whether that is sustainable on your quota. <!-- id: ft-06-running-evals-in-practice-t07 band: focused energy: normal -->
8. Run the suite through a batch API and measure the cost and time difference against running it directly. <!-- id: ft-06-running-evals-in-practice-t08 band: deep energy: high -->
9. Run the suite on a cheap model, then on a strong one. Report both and state which you would iterate with. <!-- id: ft-06-running-evals-in-practice-t09 band: focused energy: normal -->
10. Classify every failure in your last run into the five categories. Name the largest category and your next action. <!-- id: ft-06-running-evals-in-practice-t10 band: deep energy: high -->
11. Run each case three times and identify which cases are unstable. Report their individual pass rates. <!-- id: ft-06-running-evals-in-practice-t11 band: deep energy: high -->
12. Do the migration drill: run the suite on a second model and compare per-case deltas. Decide whether you would migrate. <!-- id: ft-06-running-evals-in-practice-t12 band: deep energy: high -->
13. Deliberately make a change that improves one case and breaks another. Confirm your harness surfaces both. <!-- id: ft-06-running-evals-in-practice-t13 band: deep energy: high -->
14. Reduce the suite to a fast subset that runs in under a minute, and keep the full run for releases. <!-- id: ft-06-running-evals-in-practice-t14 band: focused energy: normal -->
15. Turn the suite into a single command with no arguments. Time it from a cold start. <!-- id: ft-06-running-evals-in-practice-t15 band: focused energy: normal -->
16. Add one case from a production failure and note where it came from. <!-- id: ft-06-running-evals-in-practice-t16 band: ongoing energy: low -->
17. Write down the conditions under which you will run the full suite rather than the subset. <!-- id: ft-06-running-evals-in-practice-t17 band: ongoing energy: low -->

## Common Pitfalls

**Not starting because it feels too big.** The most common failure, and the reason the harness is 100 lines. A framework you configure is worth less than a script you run.

**Counting unchecked cases as passing.** Inflates the rate with cases nobody verified. Unchecked is its own state, and it should be visible in the report.

**Reporting a total without per-case deltas.** A total hides regressions behind improvements. Three cases fixed and two broken reads as progress.

**Changing several things at once after a failure.** You get a different score and no information about which change mattered.

**Tuning on the test set.** Iterating against the full suite until it passes converts your test set into a training set, one run at a time. Iterate on dev; report from test.

**Running each case once and reporting pass or fail.** This conceals non-determinism entirely, and a case that passes 60% of the time is not a passing case.

**Filing a checker crash as a model failure.** The bug is yours. Misclassifying it sends you debugging a system that works.

**Letting the suite cost more than the habit can bear.** If a run eats a meaningful share of your quota, you will stop running it. Measure the cost before you rely on the routine.

**Practising the migration for the first time under pressure.** Do the drill while nothing forces you to, because the worst moment to discover a stale baseline is when your access is ending.

## Deliverable / proof of work

Create `portfolio/finetuning/06-running-evals.md` containing:

1. **The harness** — the code, with a note on its line count and the command that runs it.
2. **A sample report output**, showing a pass rate, per-case deltas, and any unstable cases.
3. **The cost and time** of one full run, with the number of calls it makes.
4. **The batch comparison**, if you ran one, with the saving measured.
5. **The failure classification** for your most recent run, with counts per category.
6. **The stability report** — which cases are unstable and at what rates.
7. **The migration drill result** — two models compared, with per-case deltas and a decision.
8. **The habit plan** — the command, the fast subset, and when you run the full suite.
9. **The new cases** you added from real failures since Phase 4.

Items 6 and 7 are the ones most people omit and the ones that most change how you work. Stability is a product property, and the migration drill is the specific skill that protects you when your free access ends.

## Checklist

- [ ] I have a working harness of roughly 100 lines with no framework <!-- id: ft-06-running-evals-in-practice-c01 energy: high -->
- [ ] It prints a pass rate with per-case deltas against a baseline <!-- id: ft-06-running-evals-in-practice-c02 energy: high -->
- [ ] It records result, output, tokens and latency <!-- id: ft-06-running-evals-in-practice-c03 energy: normal -->
- [ ] Unchecked cases are reported as unchecked, not as passing <!-- id: ft-06-running-evals-in-practice-c04 energy: high -->
- [ ] A checker crash is reported as a harness bug <!-- id: ft-06-running-evals-in-practice-c05 energy: normal -->
- [ ] My baseline is stored where it survives between sessions <!-- id: ft-06-running-evals-in-practice-c06 energy: normal -->
- [ ] I know how many calls one run makes and what it costs <!-- id: ft-06-running-evals-in-practice-c07 energy: normal -->
- [ ] I understand the batch saving and when it applies <!-- id: ft-06-running-evals-in-practice-c08 energy: normal -->
- [ ] I know which model I iterate with and which I validate with <!-- id: ft-06-running-evals-in-practice-c09 energy: normal -->
- [ ] I can classify failures into retrieval, generation, format, refusal and harness bug <!-- id: ft-06-running-evals-in-practice-c10 energy: high -->
- [ ] I fix one thing at a time <!-- id: ft-06-running-evals-in-practice-c11 energy: high -->
- [ ] I run each case multiple times and report stability <!-- id: ft-06-running-evals-in-practice-c12 energy: high -->
- [ ] I understand why a 60% case is a different product from a 100% case <!-- id: ft-06-running-evals-in-practice-c13 energy: high -->
- [ ] I iterate on dev and report from test <!-- id: ft-06-running-evals-in-practice-c14 energy: high -->
- [ ] I have run the migration drill on a second model <!-- id: ft-06-running-evals-in-practice-c15 energy: high -->
- [ ] The suite runs as a single command with no arguments <!-- id: ft-06-running-evals-in-practice-c16 energy: normal -->
- [ ] I have a fast subset and know when to run the full suite <!-- id: ft-06-running-evals-in-practice-c17 energy: normal -->
- [ ] I add a case from every real failure <!-- id: ft-06-running-evals-in-practice-c18 energy: low -->

## Quiz

### Q1. Why does this phase insist on a harness with no framework? <!-- id: ft-06-running-evals-in-practice-q01 energy: high -->

- [x] Because the most common failure is not starting at all — a framework feels like a prerequisite and the setup grows until the goal is forgotten
- [ ] Because frameworks are unreliable
- [ ] Because frameworks cannot handle multiple models
- [ ] Because plain code is faster

**Why:** The obstacle is friction, not capability. Configuring a tool introduces its own learning curve and evaluation problem, and that overhead is what stops people building the habit — the exact opposite of the goal. About a hundred lines of plain code runs cases, applies checkers, records the four columns and prints deltas, which is everything the phase requires. A script you actually run beats a framework you configured once and abandoned.

### Q2. Why is a per-case delta more useful than a total pass rate? <!-- id: ft-06-running-evals-in-practice-q02 energy: high -->

- [ ] Because totals are usually wrong
- [ ] Because deltas are easier to compute
- [x] Because a total hides regressions behind improvements — three cases fixed and two broken reads as progress
- [ ] Because totals cannot be compared across runs

**Why:** A total answers whether something changed; a delta answers what. When improvements and regressions offset, the total moves slightly upward and looks like progress, while the two broken cases will be found in production instead of in your report. Computing the delta requires storing a baseline, which is why the baseline file is a core part of the harness rather than an optional extra.

### Q3. A case fails and your checker crashed. How should this be reported? <!-- id: ft-06-running-evals-in-practice-q03 energy: normal -->

- [ ] As a failure of the system under test
- [ ] As a pass, since the check did not complete
- [ ] As an unstable case
- [x] As a harness bug — the fault is in your code, and filing it as a system failure sends you debugging a working system

**Why:** The distinction changes where you look. A system failure sends you to prompts, retrieval and model choice; a harness bug sends you to your own checker, which is where the problem actually is. Conflating them costs an afternoon of investigating a system that is fine, and it pollutes your failure statistics with cases that were never really about the system.

### Q4. Why run each case multiple times? <!-- id: ft-06-running-evals-in-practice-q04 energy: high -->

- [x] To reveal which cases are unstable — a case passing 60% of the time is a different product from one passing 100%, and one run conceals the difference entirely
- [ ] To make the pass rate more accurate by averaging
- [ ] Because the model is deterministic
- [ ] To increase the dataset size

**Why:** A single run per case reports a binary outcome for a stochastic process, so a coin-flip case and a working case look identical. Three repeats separate them, and the two demand different responses: one is working, the other is a feature that fails in front of users some of the time. Reporting stability alongside the pass rate — "27 of 30, of which 3 are unstable" — is a materially different statement from the total alone.

### Q5. What is the tuning trap in daily practice? <!-- id: ft-06-running-evals-in-practice-q05 energy: high -->

- [ ] Training the model too long
- [ ] Using a model that is too small
- [ ] Running the suite too often
- [x] Iterating against the full suite until it passes, which converts the test set into a training set one run at a time

**Why:** The mechanism is gradual and mostly unintentional: run the suite, see failures, fix, repeat until green. By then the suite measures your ability to satisfy those cases rather than your system's quality. The fix is procedural rather than clever — iterate on the dev split and run the test split only when you want a number to report. Adding cases from production failures is different, and encouraged; that is the suite growing, not being fitted.

### Q6. Why use a cheap model to iterate and a strong model to validate? <!-- id: ft-06-running-evals-in-practice-q06 energy: normal -->

- [ ] Because strong models are unreliable
- [x] Because during development you are asking whether anything obvious broke, which a cheap model answers for a fraction of the cost, while a number you report should describe the model you actually intend to use
- [ ] Because cheap models are more accurate
- [ ] To compare model families

**Why:** The two runs answer different questions. Iteration is a fast filter for obvious breakage, and paying full price for it wastes quota that the habit depends on. Validation is a claim about the system you will ship, and reporting a number produced by a different model than the one deployed is simply the wrong measurement. Conflating them either wastes money or produces numbers about something other than the product.

### Q7. Why is an eval suite what makes losing free access survivable? <!-- id: ft-06-running-evals-in-practice-q07 energy: high -->

- [x] Because it turns a model migration from a guess into a measurement — run the suite on both, compare per-case deltas and cost, and decide
- [ ] Because it reduces the cost of the new model
- [ ] Because it prevents the free tier from ending
- [ ] Because it stores your prompts

**Why:** You will change models repeatedly; the question is whether the change is measured or hopeful. With a suite, migration is a mechanical procedure: baseline the current model, run the identical suite on the new one, compare per-case deltas rather than totals, check cost and latency alongside quality, then decide. That converts a frightening event into an engineering decision with evidence behind it — which is why the drill is worth practising while nothing is forcing you to.

### Q8. Why is adding a case from every production failure different from tuning on the test set? <!-- id: ft-06-running-evals-in-practice-q08 energy: high -->

- [ ] It is not different; both invalidate the suite
- [ ] Because production failures are always easy cases
- [x] Growth expands coverage to include a real failure the suite was missing, while tuning fits your changes to cases you are being scored on
- [ ] Because production failures are rare

**Why:** The direction of the influence is what matters. Adding a failure case increases what the suite knows about the world, and the case was not chosen to make your system look good — it was discovered by reality. Tuning is the reverse: repeatedly adjusting the system against a fixed set until it passes, which makes the score a measure of your fitting rather than of quality. A suite that grows from production failures becomes the most valuable test set you have, and it costs only the discipline to write each one down.

## You're ready to move on when...

- You have a harness you actually run, and it is one command.
- Your report shows a pass rate, per-case deltas, and unstable cases.
- You can classify a failure into a category without guessing.
- You know what a run costs and which model you validate with.
- You have completed the migration drill and know what changing models would involve.
- You add a case every time something fails in the real world.

## Free vs Paid

**The harness is free, and deliberately so.** Python's standard library is enough; `pytest` is optional; a JSON file stores the baseline. Nothing in this phase requires a purchase, which is the point — the habit has to survive the weeks when you have no budget.

**The free path, concretely.** Write the harness on your own machine. Use whatever model access you have, and run the fast subset constantly while reserving the full suite for before a release so you stay inside your quota. Store the baseline as a JSON file committed to git, which costs nothing and makes your stability history diffable.

**Where the free path genuinely pinches, and the mitigation.** A suite of 50 cases with 3 repeats is 150 calls per run, which is real consumption on a free tier. Three responses, in order: use the **fast subset** for daily iteration; run the **full suite** when you actually need a number; and use a **batch API** where your provider offers one, since asynchronous processing is substantially cheaper and a regression run fits it exactly. Count the cost of a run before you make it a routine, because the routine is the first thing to go when the quota pinches.

**Honest limits.** Free-tier models are weaker and more variable, so your stability report will look worse than a paid system's — and that is accurate rather than a flaw in your measurement. Judge calls on a free tier consume quota quickly if you use a judge for many cases, which is one more argument for the phase's preference for code checkers. You also cannot run comparisons across several models frequently, so batch them deliberately rather than experimenting continuously.

**What paid tiers add, and when it matters.** Batch pricing, higher rate limits, and stronger models for validation. All three make the habit cheaper to sustain. None changes the design: the harness is the same hundred lines, and the discipline of per-case deltas and stability reporting is what makes the number mean anything.

**The durable asset.** Your suite, your baselines and your failure history belong to you permanently. They do not expire with a free tier, they do not change when a provider renames a model, and they are the reason the next migration — whichever direction it goes, free or paid — is a measurement rather than a gamble. That is the last thing this track teaches, and it is the one that keeps paying after everything else in it has been forgotten.
