---
id: vb-04-tests-as-the-contract
track: vibecoding
phase: 4
order: 13
title: Tests as the Contract
duration: 2 weeks
duration_weeks: 2
energy_mix: [high, normal]
deliverable: portfolio/vibecoding/04-tests-as-the-contract.md
exit_criteria: >
  You write a test before the implementation as a statement of intent, confirm it
  fails for the right reason, and can explain why a test written after the code
  cannot validate it. You can distinguish a test that asserts behaviour from one
  that restates the implementation, and you have demonstrated on your own code that
  a green suite can certify a defect.
---

# Phase 4 — Tests as the Contract

## Goal of this phase

This phase is about the single most counterintuitive claim in the track, and the one that changes the most behaviour once it lands:

> **A test written to pass proves nothing.**

Not "proves little". Proves nothing about correctness, because it was derived from the code rather than from what you wanted. If you ask a model to write a function and then ask it to write tests for that function, you receive tests that assert what the code currently does — including every bug in it — and they will be green. The green then does something worse than being uninformative: it *certifies*. You now have evidence, of exactly the kind you would show a colleague, that a defect is correct.

The alternative is to treat the test as a **contract**: a written statement of intent that exists *before* the implementation and constrains what may be built. This is the TDD discipline, and its relevance to AI-assisted work is not sentimental. A 2024 study evaluating TDD in LLM code generation found that *"including test cases leads to higher success in solving programming challenges"* across MBPP and HumanEval with GPT-4 and Llama 3 — and identified the mechanism that matters here: tests *"enable developers to verify the correctness of generated code against predefined tests"* ([arXiv:2402.13521](https://arxiv.org/abs/2402.13521)). The tests came first, so they could not have been derived from the answer.

This phase has three load-bearing ideas.

**First, the test is the specification made executable.** Phase 2 asked you to write acceptance criteria that could each be checked by running something. A test *is* that criterion, in a form a machine can enforce. The two phases are the same act at different levels of formality.

**Second, order is what creates independence.** A test written before the code is evidence about intent. A test written after is a description of behaviour. Same file, same syntax, completely different epistemic status — and the difference is entirely the *sequence*, which is why this cannot be fixed by making the later test "more careful".

**Third, the real danger is a test that passes for the wrong reason.** A test can be green because the code is correct, because the assertion is weak, because the code path was never reached, or because the test agreed with a bug. Three of those four are invisible in a passing suite, which is why the discipline in this phase is about *making tests fail on purpose* — the only way to know a test can fail at all.

By the end you will have written tests first, watched them fail, implemented, and then deliberately broken the implementation to prove your tests catch it. That last step is mutation testing done by hand, and it is what separates a suite that demonstrates something from a suite that merely exists.

## Estimated time

**2 weeks** at 1–2 hours a day, 5 days a week. Roughly 10–12 hours, and it is practice-dominated: this is not a phase to read.

| Day | Focus | Time |
|---|---|---|
| 1–2 | Why a test written after the code cannot validate it | 2.5h |
| 3–4 | Writing tests first: from acceptance criterion to failing test | 3h |
| 5–6 | The failure discipline — confirming a test fails for the right reason | 2.5h |
| 7–8 | Assertions that constrain versus assertions that restate | 2.5h |
| 9–10 | Breaking the implementation to prove the tests catch it | 2.5h |

If you only have three hours, do tasks 4, 7 and 14. Those give you the failing-test discipline, the weak-assertion diagnosis, and the proof that your suite can fail.

## Skills you'll gain

- Convert an acceptance criterion into a test that fails before the implementation exists.
- Confirm a new test fails for the intended reason rather than for a setup error.
- Distinguish an assertion that constrains behaviour from one that restates the implementation.
- Explain why a test written after the code cannot serve as validation.
- Prove a suite can fail by deliberately introducing defects.
- Recognise the weak-assertion patterns that make a green suite worthless.
- Decide what not to test, and why testing everything is not the goal.

## Specific topics to learn

- **The order problem** — why sequence, not care, determines evidential value.
- **Tests as executable specification** — the link from Phase 2's acceptance criteria.
- **The failing-test discipline** — red, green, and why the red must be inspected.
- **Assertion strength** — constraining behaviour versus restating implementation.
- **Behaviour versus implementation testing** — what breaks when you refactor.
- **Mutation by hand** — breaking the code to prove the test can catch it.
- **Weak-assertion smells** — `assert result is not None`, truthiness checks, snapshot tests of the wrong thing.
- **The coverage trap** — why 100% line coverage is compatible with every bug being present.
- **What not to test** — generated code, trivial getters, third-party behaviour.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Your language's test runner | Running the suite, and watching it fail | Free | — | All tasks | Built into most standard libraries |
| `pytest` / `jest` / equivalent | The framework used in examples below | Free | https://pytest.org · https://jestjs.io | Tasks 4–9 | `unittest`, `node:test` |
| `coverage.py` / `c8` (optional) | To see why coverage is a weak signal | Free | https://coverage.readthedocs.io | Task 11 | Built into some runners |
| Git | Committing the failing test before implementing | Free | https://git-scm.com | Task 4 | — |
| Any AI coding tool | Writing the implementation that must satisfy your tests | Free tier sufficient | — | Tasks 5, 6, 14 | A local coding model |

## Free/cheap resources

- **Test-Driven Development for Code Generation** — https://arxiv.org/abs/2402.13521 — the empirical case for this phase. Found that including test cases improves success on MBPP and HumanEval, and that predefined tests let developers verify generated code rather than describe it.
- **Vibecoding Phase 2 (specification)** — in this repository — acceptance criteria, which this phase converts into runnable tests.
- **Agents Phase 3 (the agent loop)** — in this repository — where tests become the check an agent iterates against.
- **Finetuning & Evals track** — in this repository — evaluation discipline, of which this is the function-level version.
- **shared/study-rules.md** — in this repository — relevant because this phase is the easiest in the track to fake: a green suite looks like progress regardless of what it proves.

## Lesson: Why the Order Is the Whole Thing

### Part 1 — Two identical files, opposite meanings

Consider two test files with byte-identical contents.

**Case A.** You wrote the tests first, from a brief. You watched each one fail. You implemented until they passed.

**Case B.** You asked a model for a function. Then you asked it for tests. They passed immediately.

The files are the same. What you know is not. In case A the suite is evidence that the implementation matches a stated intent that existed independently of it. In case B the suite is evidence that the implementation is **self-consistent** — that it does what it does. If the implementation is wrong, the tests are wrong in the same direction, and the suite is a certificate of a defect.

> **A test derived from code cannot validate that code, because it shares the code's assumptions.**

This is why "write tests" is not the advice. The advice is **write tests first**, and the ordering is not a ritual or a productivity methodology. It is the only thing that makes the tests independent of the answer.

**Where AI makes this worse.** Normally, writing tests after code is a mild weakness — you might unconsciously test the happy path and skip the edge that you also forgot to implement. With generated code the problem is sharper, because the tests are generated by the same system from the same assumptions, and they inherit the same blind spots with none of the friction. Phase 1's task 5 had you do this deliberately: ask for a function, ask for its tests, break the function, and watch the tests stay green. If you did that task, you have already seen this failure with your own eyes. If you did not, do it now — the rest of this phase assumes it.

### Part 2 — The test is the acceptance criterion, made runnable

In Phase 2 you wrote acceptance criteria with the rule that each must be checkable by running something. A test is that criterion expressed in a form a machine can execute repeatedly.

So the pipeline is continuous, and it is worth seeing as one motion rather than three separate activities:

```text
Intent (Phase 2 brief)
    -> "Ten failed attempts within 60 seconds returns HTTP 429"  (acceptance criterion)
        -> def test_rate_limit_returns_429_after_ten_failures()  (test)
            -> the implementation that satisfies it               (code)
```

Read downward, each layer is a more concrete version of the one above. **Nothing in this pipeline is derived from the layer below it** — and that is the property that makes the whole thing work. The test does not know what the implementation looks like, which is exactly why it can disagree with it.

This also settles a practical question: **how do you decide what to test?** You do not sit and think about tests. You take your acceptance criteria, which you already wrote because Phase 2 taught you to, and you convert them. If you skipped Phase 2, this phase is much harder than it needs to be, and that is not a coincidence — it is the dependency being real.

### Part 3 — The failing-test discipline

Writing the test before the implementation has a mechanical consequence: **the test must fail.** It has nothing to test yet, so it cannot pass. That failure is not an inconvenience; it is the most valuable signal in the whole workflow, and there is one rule about it:

> **Read the failure. Confirm it fails for the reason you intended.**

A test can fail for reasons that have nothing to do with the behaviour you are specifying:

- **an import error** — the module does not exist yet (expected at this stage, but make sure it is *that* error)
- **a typo in the test** — you called something that does not exist
- **a setup problem** — the fixture is broken, the file is missing, the database is not there
- **a syntax error**
- **the wrong exception** — it raised `TypeError`, not the `ValueError` you are asserting

Here is the trap. If you write a test, run it, see red, and move on to implementing, you have learned nothing about whether the test is correct. **A test that fails for the wrong reason will pass for the wrong reason.** You will implement, the suite will go green, and the green will mean "the setup error got fixed" rather than "the behaviour is right".

The pattern:

```text
1. Write the test.                    -> RED
2. Read the red. It must say          -> "AssertionError: expected 429, got 200"
   what you expect, or a missing-        not "ImportError: no module 'x'"
   implementation error.
3. Implement minimally.               -> GREEN
4. Re-read the test. Does it still
   assert what you meant, now that
   you have seen the implementation?
5. Break the implementation on        -> RED
   purpose. Does the test catch it?
```

Step 5 is mutation testing by hand, and it is the step everyone skips. Part 6 is about it.

### Part 4 — Assertions that constrain versus assertions that restate

Not all passing tests mean the same thing, because not all assertions constrain the same amount.

**An assertion that constrains** says something the implementation could have got wrong: `assert response.status == 429`. The code either returns 429 or it does not.

**An assertion that restates** says what the code already does, in a way that would pass for almost any behaviour:

```python
result = parse_config(path)
assert result is not None            # passes for any non-None return
assert len(result) > 0               # passes for any non-empty result
assert isinstance(result, dict)      # passes for {} -- a wrong parse
```

Every one of these is green, and together they tell you almost nothing. If `parse_config` returned `{"error": "unparseable"}`, all three still pass. The test **occupied space in the suite without constraining anything**.

The weak-assertion smells, and they are common in generated tests:

| Smell | Why it is weak |
|---|---|
| `assert result is not None` | Any non-None value passes, including wrong ones |
| `assert len(result) > 0` | Says nothing about contents |
| `assert isinstance(result, dict)` | An empty or error dict passes |
| `assert result` (truthiness) | `{}`, `[]`, `0`, `""` fail but `{"error": ...}` passes |
| `assert "key" in result` | The key can hold anything |
| Snapshot/golden of a whole output | Records current behaviour; no intent expressed |
| Multiple unrelated asserts in one test | First failure hides the rest |

The fix is to **assert the specific value you expect**:

```python
assert parse_config(path) == {"host": "localhost", "port": 8080}
```

One assertion, in one line, that the implementation cannot satisfy by accident. Notice this is *also* shorter — weak tests are not cheaper, they are just less informative.

**The tension worth naming.** Over-specifying asserts implementation details: if the test asserts an exact string with a timestamp in it, it will fail whenever the timestamp changes, which trains people to ignore failures. The line is **assert the behaviour you specified, not the mechanism you observed.** Exact equality on a configuration dict is behaviour. Exact equality on a log line including a generated request ID is mechanism.

### Part 5 — Behaviour versus implementation, and the refactor test

A related distinction that determines whether your suite helps or hurts.

**A behaviour test** asserts what the code does in terms of inputs and outputs. It survives refactoring: change the internals, keep the behaviour, and the test stays green. It is a contract.

**An implementation test** asserts how the code does it — that a particular helper was called, that a list was sorted before being returned, that an internal attribute has a particular value. It breaks when you refactor *even though behaviour is unchanged*. It is a description of a mechanism.

The practical significance for AI-assisted work is large, and it is the reverse of what you might expect: **implementation tests actively obstruct you.** When you ask a model to improve or restructure working code — a legitimate and common thing to want — implementation tests make the refactor look like a regression. You then either abandon a good refactor or update tests that should not have needed updating, and each update is a chance to weaken them.

The check is a question: **if I rewrote this function to return the same results by a different route, would this test still pass?** If yes, it is a behaviour test. If no, ask whether you care about the route. Usually you do not.

### Part 6 — Break it on purpose

Now the technique that makes everything above verifiable, and the one practice from this phase worth keeping permanently.

**A test you have never seen fail is a test whose value you are assuming.** Green means the test ran and its assertion held — but an assertion can hold because the code is right, because the assertion is too weak, because the code path was never reached, or because the test agreed with a bug. Three of those four look identical to the fourth from the outside.

So after your implementation is green, **deliberately introduce a defect and confirm the suite goes red.** Change `<=` to `<`. Off-by-one an index. Invert a condition. Return early. Remove a validation. Each time: does the suite catch it?

This is **mutation testing**, done by hand rather than by a tool. Its value is not the tooling; it is the three answers you get.

1. **The suite goes red for the right test.** Good — that assertion is load-bearing.
2. **The suite stays green.** You have found a defect the suite does not cover, and you must decide whether it *should*. Sometimes the honest answer is that the mutation is not a behaviour change you care about; often it is a real gap.
3. **A different test goes red than you expected.** Your mental model of the suite was wrong, which is worth knowing.

A suite that survives a mutation is not necessarily bad. A suite that has **never been shown to fail** is unverified, and by this phase's own standard, unverified means you do not know.

**The coverage trap, stated plainly.** Coverage measures which lines executed. A test can execute a line and assert nothing about it. **100% line coverage is fully compatible with every bug still being present**, which is why coverage is a weak signal and why this phase does not set a coverage target. Use it to find code no test touches, not to judge whether the tests are good.

### Part 7 — What not to test

The final idea, and it keeps the phase from turning into an obligation to test everything, which is a real way to burn out and stop testing.

**Do not test generated code by re-asserting its implementation.** The temptation with AI-assisted work is to write tests that confirm the code does what the code does. That is Part 1's failure with extra steps.

**Do not test trivial accessors.** A getter that returns a field is tested by the compiler.

**Do not test third-party behaviour.** You are not validating `requests`; you are validating your use of it. Assert what your code does with the response, not that the library works.

**Do not test what the type system already guarantees** in a typed language. Testing that a function rejects a string when the signature says `int` is testing the compiler.

**Do not chase a coverage number.** Part 6 explains why the number is compatible with total failure.

What you *do* test, and this is the whole list: **the acceptance criteria from your brief, the boundaries, and the error paths.** Boundaries because that is where the off-by-ones live. Error paths because those are the branches generated code is most optimistic about, and the ones whose failure is most likely to be silent. That is a small, focused list, and it is where essentially all the value is.

**⚠️ Volatile, dated: as of 2026-09, the TDD finding above comes from a specific study of GPT-4 and Llama 3 on MBPP and HumanEval.** The models and benchmarks will date; the *mechanism* — that a test defined before the implementation is independent of it, and a test derived after is not — is a property of logic rather than of models, and it will not date at all. Keep the second thing.

## Hands-on practice tasks

1. Reproduce the central failure if you have not already. Ask a model for a function; ask it for tests; run them (green); introduce a real bug into the function; run them again. Record whether anything failed. Keep the transcript — this is your evidence for the whole phase, and it goes in the deliverable. <!-- id: vb-04-tests-as-the-contract-t01 band: focused energy: normal -->
2. Take three acceptance criteria from your Phase 2 brief and convert each into a single test function. Do not implement anything. The tests will not run; that is correct at this stage. <!-- id: vb-04-tests-as-the-contract-t02 band: focused energy: normal -->
3. Write one test for a function you have already built, from the criterion rather than from the code. Specifically: do not look at the implementation while writing the assertion. This is harder than it sounds, and that difficulty is the lesson. <!-- id: vb-04-tests-as-the-contract-t03 band: focused energy: high -->
4. Run a test before the implementation exists and **read the failure output carefully**. Confirm it fails for the reason you intended — an assertion failure about behaviour, not an import error or a typo. Commit the failing test at this point; the git history is your proof of order. <!-- id: vb-04-tests-as-the-contract-t04 band: focused energy: normal -->
5. Implement the minimum that satisfies the tests from task 4. Resist adding anything the tests do not require — if you want extra behaviour, write the test first. <!-- id: vb-04-tests-as-the-contract-t05 band: focused energy: normal -->
6. Ask a model to implement against your existing failing tests, rather than asking for code and then testing it. This is TDD with a model as the implementer, and it is the practical shape of this phase. Note how the output differs from task 1. <!-- id: vb-04-tests-as-the-contract-t06 band: focused energy: normal -->
7. Take one passing test and weaken it in three ways from the Part 4 table — `is not None`, truthiness, `isinstance`. Confirm all three still pass. Then restore the strong assertion and confirm it still passes. You have now measured the difference between constraining and restating. <!-- id: vb-04-tests-as-the-contract-t07 band: focused energy: normal -->
8. Find a test in your own suite that would pass if the function returned an error object instead of a result. Rewrite it so that it would not. This is the single most common weakness in generated tests. <!-- id: vb-04-tests-as-the-contract-t08 band: focused energy: high -->
9. Apply the refactor question from Part 5 to five of your tests: would each still pass if the function returned the same results by a different route? Mark each as behaviour or implementation, and rewrite one implementation test as a behaviour test. <!-- id: vb-04-tests-as-the-contract-t09 band: focused energy: high -->
10. Take your green suite and deliberately introduce five defects, one at a time: a boundary flip, an off-by-one, an inverted condition, an early return, and a removed validation. Record for each whether the suite caught it. The uncaught ones are your coverage gaps, and this list is worth more than any coverage percentage. <!-- id: vb-04-tests-as-the-contract-t10 band: deep energy: high -->
11. Run coverage on your suite if your language has it. Note the percentage. Then note how many of the uncaught mutations from task 10 were on **covered** lines. That comparison is the argument against coverage as a quality metric, demonstrated on your own code. <!-- id: vb-04-tests-as-the-contract-t11 band: focused energy: normal -->
12. Write a test for an error path — invalid input, a failed call, a missing key. Confirm the code raises, returns a sentinel, or silently produces a wrong answer. Given Part 7, this is where the real value is, and most generated suites skip it entirely. <!-- id: vb-04-tests-as-the-contract-t12 band: focused energy: normal -->
13. Find one thing in your project you are currently testing that you should not: a trivial accessor, a third-party behaviour, something the type system guarantees. Delete the test and note that the suite is still green. Not testing is a decision worth making deliberately. <!-- id: vb-04-tests-as-the-contract-t13 band: quick energy: low -->
14. Write the whole thing up as `portfolio/vibecoding/04-tests-as-the-contract.md`: the task 1 transcript, your failing test and its failure output from task 4, the weak-assertion comparison from task 7, the mutation results table from task 10, and the coverage comparison from task 11. **If your mutations were all caught, say so** — that is a good result and the honest one, but check that you introduced genuine behaviour changes rather than cosmetic edits. <!-- id: vb-04-tests-as-the-contract-t14 band: deep energy: high -->
15. Write one sentence explaining why a test written after the code cannot validate it, in your own words, without using the phrase "confirmation bias". If you cannot, re-read Part 1 — the mechanism is about shared assumptions, not about self-deception. <!-- id: vb-04-tests-as-the-contract-t15 band: quick energy: low -->

## Common Pitfalls

**Asking for the implementation and then the tests.** This is the phase's central failure and it is the default behaviour of most people using these tools. The tests will pass, they will inherit the bugs, and the green will make you more confident rather than less. If you remember one thing from this phase, remember the order.

**Not reading the red.** A test that fails for a setup error will pass for a setup fix. Confirm the failure is the one you specified before implementing, or the green means nothing.

**Writing assertions that cannot fail meaningfully.** `assert result is not None` occupies space without constraining anything. Assert the specific expected value; it is usually shorter as well as stronger.

**Never watching a test fail.** A suite that has never been shown to catch a defect is unverified. Task 10 exists because the difference between "tests pass" and "tests can fail" is the difference between assuming and knowing.

**Chasing coverage.** 100% line coverage is fully compatible with every bug being present, because a line can execute while nothing is asserted about it. Use coverage to find untouched code, never to judge test quality.

**Writing implementation tests.** Asserting that a helper was called, or that a list was sorted internally, makes every refactor look like a regression. Ask whether the test would survive a rewrite that preserves behaviour; if not, decide whether you actually care about the mechanism.

**Testing everything.** Trivial accessors, third-party libraries, and things the type system guarantees do not need tests. The list that does is short: acceptance criteria, boundaries, error paths. Chasing total coverage is a recognised route to burnout and to abandoning testing entirely.

**Over-specifying until the suite is brittle.** The opposite failure: asserting exact log strings with timestamps, or exact ordering that is incidental. A suite that fails constantly for irrelevant reasons trains you to ignore its output, which is worse than having fewer tests.

**Trusting a model's test review.** Asking a model whether its own tests are adequate shares the assumptions that produced them. It can be useful as a prompt for ideas; it is not independent verification.

## Deliverable / proof of work

- `portfolio/vibecoding/04-tests-as-the-contract.md`, containing:
  - the task 1 transcript showing tests staying green after you broke the function
  - three tests converted from Phase 2 acceptance criteria, with the criterion quoted above each
  - your failing test and its failure output, with the confirmation that it failed for the right reason
  - the git commit that recorded the failing test before the implementation existed
  - the weak-assertion comparison from task 7
  - the mutation results table from task 10: defect introduced, caught or not, which test
  - the coverage-versus-mutations comparison from task 11
  - one sentence on why a test written after the code cannot validate it
- The tests themselves, kept in your project — this phase's output is a suite, not a document.

## Checklist

- [ ] I can explain why a test derived from code cannot validate that code <!-- id: vb-04-tests-as-the-contract-c01 energy: normal -->
- [ ] I write the test before the implementation as a matter of habit <!-- id: vb-04-tests-as-the-contract-c02 energy: normal -->
- [ ] I read the failure output before implementing, and confirm it fails for the intended reason <!-- id: vb-04-tests-as-the-contract-c03 energy: normal -->
- [ ] I can convert an acceptance criterion directly into a test function <!-- id: vb-04-tests-as-the-contract-c04 energy: normal -->
- [ ] I can identify a weak assertion and rewrite it to constrain a specific value <!-- id: vb-04-tests-as-the-contract-c05 energy: normal -->
- [ ] I can tell a behaviour test from an implementation test and say which I want <!-- id: vb-04-tests-as-the-contract-c06 energy: normal -->
- [ ] I have deliberately broken my own code to confirm my tests catch it <!-- id: vb-04-tests-as-the-contract-c07 energy: normal -->
- [ ] I understand why coverage is compatible with total failure <!-- id: vb-04-tests-as-the-contract-c08 energy: normal -->
- [ ] I test boundaries and error paths rather than the happy path alone <!-- id: vb-04-tests-as-the-contract-c09 energy: normal -->
- [ ] I have deliberately decided not to test at least one thing, and said why <!-- id: vb-04-tests-as-the-contract-c10 energy: low -->
- [ ] I can state which of my tests have actually been observed to fail <!-- id: vb-04-tests-as-the-contract-c11 energy: low -->

## Quiz

### Q1. Why can a test written after the implementation not validate that implementation? <!-- id: vb-04-tests-as-the-contract-q01 -->

- [ ] Because it runs slower than a test written first
- [x] Because it is derived from the code and therefore shares the code's assumptions
- [ ] Because it cannot achieve full line coverage
- [ ] Because the test framework cannot distinguish the two orderings

**Why:** The two files can be byte-identical and mean different things. A test written before comes from a stated intent that exists independently of the code; a test written after describes what the code does. If the code is wrong, a derived test is wrong in the same direction and the green suite certifies the defect.

### Q2. A newly written test fails. What must you do before implementing? <!-- id: vb-04-tests-as-the-contract-q02 -->

- [ ] Nothing — a failing test is the expected state, so proceed
- [ ] Delete it and write it again more carefully
- [x] Read the failure and confirm it fails for the reason you intended
- [ ] Implement first, then check the failure afterwards

**Why:** A test can fail from an import error, a typo, a broken fixture or the wrong exception. A test that fails for the wrong reason will pass for the wrong reason, meaning the eventual green indicates the setup error was fixed rather than that the behaviour is correct. Task 4 asks for exactly this confirmation.

### Q3. Which assertion actually constrains behaviour? <!-- id: vb-04-tests-as-the-contract-q03 -->

- [ ] `assert result is not None`
- [ ] `assert len(result) > 0`
- [x] `assert parse_config(path) == {"host": "localhost", "port": 8080}`
- [ ] `assert isinstance(result, dict)`

**Why:** The first three pass for an error object, an empty dict, or a wrong parse — they occupy space in the suite without constraining anything. Asserting the specific expected value cannot be satisfied by accident, which is why task 7 has you weaken an assertion three ways and watch all three stay green.

### Q4. Coverage reports 100%. What does this establish? <!-- id: vb-04-tests-as-the-contract-q04 -->

- [ ] That every behaviour has been verified
- [ ] That no bugs remain in the covered code
- [ ] That the suite would catch a regression in any covered line
- [x] That every line executed, which is compatible with every bug still being present

**Why:** Coverage measures execution, not assertion. A line can run while nothing meaningful is asserted about it — Part 6 calls this the coverage trap, and task 11 has you check how many of your *uncaught* mutations sat on covered lines. That comparison is the argument against coverage as a quality metric, demonstrated on your own code.

### Q5. Why does this phase claim implementation tests actively obstruct AI-assisted work? <!-- id: vb-04-tests-as-the-contract-q05 -->

- [ ] They run more slowly than behaviour tests
- [ ] They are harder for a model to generate
- [x] They break when the code is refactored without behaviour changing, making a good refactor look like a regression
- [ ] They cannot be run in continuous integration

**Why:** Asking a model to restructure working code is a legitimate and common request. Implementation tests — asserting a helper was called, or an internal ordering — make that look like a regression, so you either abandon a good refactor or edit tests that should not have needed editing, and each edit is a chance to weaken them. The check is whether the test survives a rewrite that preserves behaviour.

### Q6. You introduce five deliberate defects and the suite catches none. What is the correct conclusion? <!-- id: vb-04-tests-as-the-contract-q06 -->

- [ ] The implementation must be correct after all
- [ ] Coverage must be miscalculating
- [ ] The tests should be deleted and regenerated
- [x] The suite has never been shown to catch a defect, so its green state was never evidence

**Why:** This is the point of mutation testing by hand: a test you have never seen fail is one whose value you are assuming, because green is consistent with correct code, weak assertions, unreached paths, and tests that agreed with bugs. The honest follow-up is to check whether the mutations were genuine behaviour changes, and then to close the gaps they exposed.

## You're ready to move on when...

You write the test before the implementation without having to remind yourself to, and you read the failure output every time rather than treating red as a checkpoint on the way to green. You can look at an assertion and say whether it constrains a specific value or merely restates the implementation, and you have rewritten at least one weak assertion. You have introduced five deliberate defects into your own green suite and recorded which ones it caught — and for the ones it missed, you know whether that was a real gap or an unconcerning mutation. You can explain, without reference to self-deception, why order rather than care is what makes a test evidential.

## Free vs Paid

### Free path

The whole phase is free and needs nothing beyond a test runner, which ships with most languages. This is the highest-value free discipline in the track: tests are what let you accept generated code with justified confidence rather than optimism, and on a free tier — where the models hallucinate more and the quota is tighter — that justification matters more, not less.

There is also a budget-specific benefit worth noting. **Tests first reduce the number of model iterations you need**, because the model implements against a check rather than a description, and a failing test is a precise error signal. On a metered free tier, that is quota saved.

### Paid path

A paid model gives you three relevant things. **Stronger adherence to the tests you supply**, since a better model follows a specified contract more reliably. **Longer context**, so a larger suite can be held alongside the code it constrains. And **test-generation quality**, when you use a model to draft tests from a brief — though note carefully that this is only legitimate when the brief, not the code, is the input.

What money does not change is the ordering rule. A paid model asked to write tests after writing code will produce better tests that share the same assumptions, and the suite will certify the same defects with more polish.

### Where the money genuinely matters

It matters for **iteration volume**. TDD with a model is a loop — write test, generate implementation, run, refine — and each turn costs quota. A free tier supports this comfortably for small functions and becomes tight for a large suite with many failing tests to converge. The free-tier compensation is to batch: write several tests, then ask for one implementation that satisfies all of them, rather than iterating one test at a time. It is slightly less pure as TDD and considerably more affordable, and the ordering property that makes this phase work is fully preserved.
