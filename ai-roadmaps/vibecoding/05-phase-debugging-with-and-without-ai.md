---
id: vb-05-debugging-with-and-without-ai
track: vibecoding
phase: 5
order: 14
title: Debugging With and Without AI
duration: 1 week
duration_weeks: 1
energy_mix: [normal, high]
deliverable: portfolio/vibecoding/05-debugging-with-and-without-ai.md
exit_criteria: >
  You form a hypothesis before asking for help, obtain real evidence rather than a
  description of the symptom, and can distinguish a reproduction that demonstrates a
  bug from one that merely triggers it. You can debug a defect without a model when
  the model's suggestions are not converging, and you can say when to stop asking and
  read the code instead.
---

# Phase 5 — Debugging With and Without AI

## Goal of this phase

This phase fixes the workflow that most people fall into without noticing, and it is a workflow that makes debugging *slower* while feeling faster.

Here is the pattern. Something breaks. You paste the error into a chat window. You get a plausible suggestion. You try it. It does not work. You paste the new error, or the same one. You get another suggestion. Twenty minutes later you have tried six things, none of them worked, and you have learned nothing about the system — because **you were never debugging; you were sampling**.

The model is not the problem here, and this phase is not "debug it yourself". The problem is that asking for a fix is the wrong first move, and it is the move that models make most attractive because it is immediate and fluent. The fix is a specific discipline with four parts:

1. **Form a hypothesis before you ask.** Even a wrong hypothesis is worth more than none, because you can test it, and testing it tells you something either way.
2. **Get real evidence, not descriptions.** The model cannot see your system. A reproduction, an actual traceback, an actual value, an actual version number — these are inputs it can reason from. "It doesn't work" is not.
3. **Make the bug reproducible before you fix it.** A bug you cannot reproduce reliably is a bug you cannot confirm you fixed, and a fix you cannot confirm is a change.
4. **Know when to stop asking and read.** When suggestions stop converging, more suggestions cannot help, because the missing ingredient is information about *your* system and the model does not have it.

The organising insight is uncomfortable and worth stating directly:

> **The model can only reason from what you tell it, and the most important information is the evidence you have not gathered yet.**

Most stalled debugging sessions are not stalled because the model is weak. They are stalled because the human is asking for a diagnosis of a system the model cannot observe, using a description that omits the thing that would explain it. No amount of model capability fixes a missing reproduction.

By the end you will have debugged one real defect twice — once with the sampling workflow, recording how many attempts it took and what you learned, and once with the disciplined workflow — and you will have an honest comparison of the two.

## Estimated time

**1 week** at 1–2 hours a day, 5 days a week. Roughly 7–9 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Why sampling feels like debugging, and the four-step discipline | 1.5h |
| 2 | Hypotheses: forming them first, and testing them cheaply | 1.5h |
| 3 | Evidence: reproductions, traces, observations | 2h |
| 4 | Reading the code, and when to stop asking | 1.5h |
| 5 | The two-workflow comparison and write-up | 2h |

If you only have two hours, do tasks 3, 6 and 14. Those give you hypothesis-first practice, a real reproduction, and the comparison.

## Skills you'll gain

- Form and test a hypothesis before requesting a fix.
- Write a bug report a model can actually reason from: reproduction, expected, observed, environment.
- Distinguish a reproduction that demonstrates a bug from one that merely triggers it.
- Reduce a failing case to its minimum.
- Recognise the point at which suggestions have stopped converging.
- Debug from evidence by reading code and inspecting state, without a model.
- Know when a bug is worth understanding versus when a workaround is correct.

## Specific topics to learn

- **Sampling versus debugging** — why trying suggestions feels productive and is not.
- **Hypothesis-first** — forming a belief you can be wrong about.
- **The four-part bug report** — reproduction, expected, observed, environment.
- **Reproductions** — minimal, deterministic, and how to reduce one.
- **Evidence gathering** — traces, logs, print statements, debuggers, version pinning.
- **Non-determinism** — flaky tests, timing, ordering, seeds, external state.
- **Convergence** — how to tell that suggestions are circling.
- **Reading as a debugging tool** — the point where the answer is in the code.
- **When to work around instead** — and how to record the debt if you do.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Your language's debugger | Inspecting real state instead of guessing at it | Free | — | Task 7 | Print statements, which are genuinely fine |
| Git bisect | Finding which change introduced a defect | Free | https://git-scm.com/docs/git-bisect | Task 9 | Manual checkout of commits |
| A test runner | Turning a bug into a failing test | Free | — | Tasks 6, 8 | Any runner |
| Any AI coding tool | Receiving hypotheses once you have real evidence | Free tier sufficient | — | Tasks 4, 5, 13 | A local coding model |
| A text editor with go-to-definition | Following a call chain by hand | Free | https://code.visualstudio.com | Task 12 | `grep`, which is underrated |

## Free/cheap resources

- **Vibecoding Phase 4 (tests as the contract)** — in this repository — the failing test is the best bug reproduction you can build, and this phase uses that heavily.
- **Vibecoding Phase 3 (reading generated code)** — in this repository — the three-question read is a debugging tool, not only a review tool.
- **Foundations track** — in this repository — why models produce plausible wrong output, which explains the shape of their debugging suggestions.
- **Prompting Phase 6 (verification)** — in this repository — the same discipline applied to claims rather than to code.
- **shared/study-rules.md** — in this repository — relevant because debugging is where hours disappear without progress, which is exactly the pattern those rules exist to catch.

## Lesson: Stop Sampling, Start Investigating

### Part 1 — The loop that feels like work

Describe the failure mode precisely, because most people recognise it instantly and have never named it.

```text
something breaks
  -> paste the error into a chat
    -> get a plausible suggestion
      -> try it
        -> still broken
          -> paste the new error
            -> get another plausible suggestion
              -> ...
```

Each step is fast. Each step produces something that looks like progress — a change was made, a new thing was tried. And after forty minutes you have tried eight things, understand the system no better than at the start, and may have introduced two new bugs in the process.

**This is sampling, not debugging.** You are drawing candidate fixes from a distribution and testing them, without any model of the system that would let you *predict* which one is right. Sampling occasionally works, which is what makes it sticky — sometimes the fifth suggestion is the fix, and that success reinforces the workflow that wasted the first four.

The diagnostic question: **can you say what you currently believe the cause is?** If the answer is "I am hoping one of these works", you are sampling. That is not a moral failing — it is the default behaviour of a fluent tool that always answers.

### Part 2 — Why the model cannot debug your system for you

The mechanism is simple and it is not a limitation of model quality.

**A model can only reason from what you tell it.** It cannot see your code unless you show it. It cannot run your program. It cannot observe the value that is actually wrong. When you paste an error message and nothing else, it produces the *most common* cause of that error message — which is a reasonable inference and is frequently not your cause.

It gets sharper than that. Suppose a `KeyError` on `config['timeout']`. The most common cause is a missing key. If your actual cause is that a YAML file was parsed into a nested structure and `timeout` is one level deeper, then the model's most-likely-cause answer is confidently wrong, and it will keep being confidently wrong for every error message you paste, because the missing information — the actual shape of your config — is information you have not provided and may not have looked at yourself.

> **The most common cause of a symptom is not your cause. Only evidence distinguishes them.**

This is why the phase's discipline is about *evidence* rather than about prompting technique. You cannot prompt your way to information you have not gathered. And notice what follows: **gathering the evidence often solves the bug before you ask anyone**, because looking at the real value is frequently the entire diagnosis.

### Part 3 — Hypothesis first

Before you ask for anything, write down what you believe is happening. One sentence, specific enough to be wrong.

Not: "something is wrong with the config loading."
But: "the YAML parser is treating `timeout` as a nested key because the indentation in section 3 is wrong."

The value of a hypothesis is not that it is right. It is that it makes the next step a **test** rather than a guess. With a hypothesis you can ask: what would I observe if this were true? Then look. If you observe it, you have your answer and you did not need to ask anyone. If you do not, you have eliminated a cause — and eliminated causes are how a search space closes.

**A wrong hypothesis that you tested is worth more than no hypothesis**, because you learned something. Ten guesses that you did not test taught you nothing except that ten things are not the answer, and even that you do not know, because you may have applied the fixes incorrectly.

The practical rule: **state the hypothesis, name the observation that would confirm it, make the observation.** Then, and only then, if it is not confirmed, you have something worth telling a model — you can hand it a hypothesis, a test and a result, which is a completely different quality of input from an error message.

### Part 4 — The four-part bug report

When you do ask, ask properly. Four pieces of information, and each one removes a class of wrong answer.

**1. Reproduction.** The exact steps, and ideally the minimum code that shows it. This is the most valuable part and the one most often omitted. A reproduction is what turns "it does not work" into "this specific input produces this specific wrong output".

**2. Expected.** What you believed should happen, and why. This is what makes your *intent* available, so the model can tell you that your expectation is the bug rather than the code. That happens more often than people like, and without a stated expectation it is invisible.

**3. Observed.** The actual output, verbatim. Not paraphrased. The full traceback, not the last line. Actual values, not descriptions of them. If a variable is supposed to be 5 and is 3, write "it is 3", not "it is wrong".

**4. Environment.** Language version, library versions, operating system, and anything unusual. Version mismatches are the single most common cause of "this code works in the tutorial but not here", and a pinned version is a fact while "the latest" is a guess.

A template worth keeping:

```text
REPRODUCTION
  Run: python parse.py config.yaml
  Minimal case:
      import yaml
      d = yaml.safe_load(open("config.yaml"))
      print(d["timeout"])   # KeyError: 'timeout'

EXPECTED
  30. The brief says config.yaml has a top-level timeout.

OBSERVED
  KeyError: 'timeout'
  Full traceback: ...
  print(d) gives:
    {'server': {'timeout': 30, 'host': 'localhost'}}

ENVIRONMENT
  Python 3.12.1, PyYAML 6.0.1, Ubuntu 24.04
```

Look at what the `print(d)` line does in that report. It **answers the question**. The value is nested one level deeper than assumed. The reproduction included the observation that ended the investigation, and it ended it before anyone was asked.

### Part 5 — Reproduction, and the difference between triggering and demonstrating

A subtle distinction that determines whether a fix can be confirmed.

**Triggering a bug**: the failure happens when you do this.
**Demonstrating a bug**: this input produces this wrong output, reliably, and the same input without the bug produces the right output.

A demonstration has three properties, and each one is doing work.

**Deterministic.** The same input produces the same failure, every time. If it fails one run in five you have a *different*, harder bug, and pretending it is deterministic will send you chasing the wrong cause. Non-determinism usually comes from one of five places: dictionary or set ordering, thread or async timing, an unseeded random, time and timezone, or external state — a network call, a file, a database row that another test changed.

**Minimal.** Strip away everything not required to reproduce. Delete code until the bug stops, then put back the last thing. A twenty-line reproduction can be reasoned about; a two-thousand-line one cannot, and a large reproduction is where wrong hypotheses hide. Reduction is mechanical and boring and it is the highest-yield debugging activity there is.

**Turned into a test.** A reproduction that lives in a test file is permanent, runs in CI, and proves the fix. This is the direct link to Phase 4: **the failing test *is* the bug report**, and it is the only version of it that cannot drift out of date.

### Part 6 — Gathering evidence

Concretely, the things that produce information rather than guesses. All free, none clever.

**Print or log the actual value.** Not the type you expect it to be — the value it is. This resolves an enormous share of bugs on its own, which is why "have you looked at what it actually is" is the most useful question in debugging.

**Read the whole traceback, bottom-up and top-down.** The last line is the error; the frames above it are the path. Generated code frequently fails several frames away from where the mistake was made, so the frame *you* wrote is often more informative than the frame that raised.

**Check versions.** `pip show`, `npm ls`, the lockfile. "Works in the tutorial" plus "different version" explains a large family of failures, and a version comparison takes ten seconds.

**Use the debugger, or do not.** A debugger lets you inspect state mid-execution, which is genuinely better for complex control flow. Print statements are genuinely fine for everything else, and insisting on the debugger when prints would do is its own form of unproductive virtue. Use whichever answers the question faster.

**Bisect.** If it worked before, `git bisect` finds the change that broke it in logarithmic time. This is the single most powerful tool for "it used to work", and it is free and built into git.

**Reduce.** Already stated, repeated because it matters most.

**Compare against a working case.** What is different between the input that works and the input that does not? The difference is frequently the cause, and finding it requires no theory at all.

### Part 7 — Knowing when to stop asking

The skill that saves the most time, and it has a clear signal.

**Suggestions have stopped converging when the proposals repeat in different words, when each attempt requires a new guess about your system, or when you are explaining your setup more than you are investigating it.** At that point the bottleneck is information, not ideas, and more ideas cannot help.

What to do instead: **read the code.** Specifically —

1. **Read the failing function** using Phase 3's three questions: what does it do, what happens when it fails, what did it assume. A bug is usually a violated assumption, and question three is where they live.
2. **Follow the data backwards** from the point of failure to where the value was created. The mistake is very often earlier than the symptom.
3. **Read the official documentation for the exact function involved**, not a tutorial. Tutorials describe the common case; your bug may be in the uncommon one.
4. **Search the issue tracker** for the library, with the exact error string. If many people have hit it, the answer is often already written.
5. **Re-read your own assumption.** The most common single cause of a long debugging session is a belief about the system that was never checked.

This is not "give up on the model". It is recognising which resource is missing, and it is the same judgement as Phase 3's decision to descend an altitude: what would actually produce the answer?

### Part 8 — When a workaround is the right answer

Honesty requires this, because the phase could otherwise be read as "always understand every bug", which is not affordable.

Sometimes the correct move is a workaround: pin the dependency and move on, catch the exception and log it, avoid the code path. Reasons that justify it: the bug is in a third-party library you cannot fix; it is in code you are about to delete; the business cost of the delay exceeds the cost of the workaround by a wide margin.

Two conditions attach, and they are what separate a workaround from negligence.

**Record it.** A comment at the site, an issue in the tracker, or both, saying what the workaround is for and what would let you remove it. An unrecorded workaround is a trap for whoever reads the code next, and that will be you.

**Know what you are deferring.** A workaround for a symptom leaves the cause. If the cause is a wrong assumption in your own code, the assumption is still wrong and will produce a different symptom later, often in a place that is harder to connect back. A workaround for a third-party bug in a pinned version is a genuinely closed matter; a workaround for a misunderstanding in your own logic is a debt with interest.

**⚠️ Volatile, dated: as of 2026-09, debugging advice is among the most stable material in this track**, because the method is dictated by information flow rather than by tooling. The tools named above — debugger, prints, bisect, the traceback — have been the core toolkit for decades. What changes is how much of the investigation a model can do for you, and that has been improving steadily; the discipline of gathering evidence first does not.

## Hands-on practice tasks

1. Pick a real bug from your own work. Before doing anything else, write down your current belief about the cause in one sentence. Most people find they do not have one, which is the finding. <!-- id: vb-05-debugging-with-and-without-ai-t01 band: quick energy: low -->
2. Run the sampling workflow deliberately on that bug: paste the error into a model, apply the suggestion, repeat. Cap it at fifteen minutes and **count the attempts** and record whether each was right, wrong, or untestable. <!-- id: vb-05-debugging-with-and-without-ai-t02 band: focused energy: normal -->
3. Now form a hypothesis and name the observation that would confirm it. Make the observation. Record whether you were right, and — either way — record what you now know that you did not before. <!-- id: vb-05-debugging-with-and-without-ai-t03 band: focused energy: normal -->
4. Write a four-part bug report for the same bug: reproduction, expected, observed, environment. Include at least one line that prints an actual value. Then read your own report before sending it and see whether it already answers the question. <!-- id: vb-05-debugging-with-and-without-ai-t04 band: focused energy: high -->
5. Send only the bug report from task 4 to a model — no extra context, no "it doesn't work". Compare the quality of its response with task 2's suggestions. The difference is the argument for this phase, measured on your own bug. <!-- id: vb-05-debugging-with-and-without-ai-t05 band: focused energy: normal -->
6. Turn the bug into a failing test that demonstrates it. Confirm it fails for the right reason, per Phase 4. This is now a permanent reproduction, and it is what will prove the fix. <!-- id: vb-05-debugging-with-and-without-ai-t06 band: focused energy: high -->
7. Inspect a real value at the point of failure — with a debugger if you have one, otherwise a print. Write down what you expected and what it actually was. Where they differ is your bug roughly half the time. <!-- id: vb-05-debugging-with-and-without-ai-t07 band: focused energy: normal -->
8. Reduce the reproduction to its minimum: delete code until the bug stops, then restore the last deletion. Record the number of lines before and after. Reduction is boring, mechanical and the highest-yield activity in this phase. <!-- id: vb-05-debugging-with-and-without-ai-t08 band: deep energy: high -->
9. If your project has git history and the bug is a regression, use `git bisect` to find the introducing commit. Record how many steps it took — it is logarithmic, which is why it beats guessing by so much. <!-- id: vb-05-debugging-with-and-without-ai-t09 band: focused energy: normal -->
10. Deliberately create a non-deterministic failure — use an unseeded random, or iterate a set and depend on the order — and observe how much harder it is to reproduce. Record which of the five sources from Part 5 you used. <!-- id: vb-05-debugging-with-and-without-ai-t10 band: focused energy: high -->
11. Read the full traceback of a real failure from the bottom up and the top down. Identify which frame is where the mistake was made versus where it was raised. Generated code often fails several frames away from the error. <!-- id: vb-05-debugging-with-and-without-ai-t11 band: focused energy: normal -->
12. Debug one bug with **no model at all**: read the function, follow the data backwards, check the docs, inspect values. Record how long it took and whether reading found it. Most people are surprised by how often it does. <!-- id: vb-05-debugging-with-and-without-ai-t12 band: deep energy: high -->
13. Deliberately continue asking a model past the point of convergence. Notice the moment the suggestions start repeating in different words or require new guesses about your setup. Write down how you could have recognised it sooner. <!-- id: vb-05-debugging-with-and-without-ai-t13 band: focused energy: normal -->
14. Write it up as `portfolio/vibecoding/05-debugging-with-and-without-ai.md`: the attempt count from task 2, the hypothesis and result from task 3, the bug report, the comparison from task 5, the reduction numbers, and an honest verdict on which workflow found it and how long each took. **If sampling won, say so** — it can, on simple bugs where the most common cause is the cause — and explain what that tells you about when the discipline is worth the overhead. <!-- id: vb-05-debugging-with-and-without-ai-t14 band: deep energy: high -->
15. Find one place in your own project where you applied a fix you did not understand. Either record it properly as a workaround with a comment and an issue, or investigate it now. An unrecorded workaround is a trap for the next reader, who is you. <!-- id: vb-05-debugging-with-and-without-ai-t15 band: focused energy: normal -->

## Common Pitfalls

**Asking for a fix as the first action.** The habit this phase exists to break. It feels like progress because something always comes back, and the fluency of the suggestions is exactly what makes sampling feel like investigation.

**Not having a hypothesis.** If you cannot say what you currently believe the cause is, you are sampling. Writing the belief down costs thirty seconds and converts the next step from a guess into a test.

**Sending the error message and nothing else.** The model will give you the most common cause of that message, which is a reasonable inference and often not your cause. Reproduction, expected, observed, environment — each one removes a class of wrong answer.

**Sending values you have not looked at.** Pasting a value you assume rather than the value you observed is how a wrong hypothesis gets confirmed by the model instead of by reality. That is the worst outcome in the phase: your error, validated.

**Fixing before reproducing.** A bug you cannot reproduce reliably is one you cannot confirm you fixed. Worse, on a non-deterministic bug an unreproduced "fix" gives you false confidence that it is gone.

**Never reducing.** A large reproduction is where wrong hypotheses hide, and reduction is mechanical rather than clever. Twenty lines can be reasoned about; two thousand cannot.

**Not checking versions.** "Works in the tutorial" plus "different version" explains an enormous family of failures for ten seconds of work. Pin the version in the report so it is a fact rather than a guess.

**Continuing past convergence.** When suggestions repeat in different words, or each attempt needs a new guess about your setup, the missing ingredient is information and more ideas cannot supply it. Switch to reading.

**Refusing to work around anything.** Sometimes a workaround is correct: a third-party bug, code you are deleting, a cost that exceeds the delay. But record it, and know whether you are deferring a library's problem or your own misunderstanding — the second accrues interest.

**Treating a fix you do not understand as done.** It may be correct. You cannot know, you cannot extend it, and it will be back. This is Phase 1's ownership argument arriving in its most expensive form.

## Deliverable / proof of work

- `portfolio/vibecoding/05-debugging-with-and-without-ai.md`, containing:
  - the attempt count and right/wrong/untestable record from the sampling run (task 2)
  - your hypothesis and what the test of it revealed (task 3)
  - the full four-part bug report (task 4)
  - the quality comparison between task 2's suggestions and task 5's report-based response
  - the failing test that demonstrates the bug (task 6)
  - the reduction result: lines before and after (task 8)
  - the non-determinism source you created in task 10, and how it changed reproduction difficulty
  - the no-model debugging attempt and its outcome (task 12)
  - an honest verdict on which workflow worked, how long each took, and when the discipline is worth its overhead
- The failing test, kept in your suite — a bug with a test cannot silently return.

## Checklist

- [ ] I form a hypothesis before asking for a fix, every time <!-- id: vb-05-debugging-with-and-without-ai-c01 energy: normal -->
- [ ] I can tell when I am sampling rather than debugging, and name the signal <!-- id: vb-05-debugging-with-and-without-ai-c02 energy: normal -->
- [ ] I can write a four-part bug report with a reproduction, expected, observed and environment <!-- id: vb-05-debugging-with-and-without-ai-c03 energy: normal -->
- [ ] I inspect actual values rather than assuming them <!-- id: vb-05-debugging-with-and-without-ai-c04 energy: low -->
- [ ] I reproduce a bug before fixing it, and know I can confirm the fix <!-- id: vb-05-debugging-with-and-without-ai-c05 energy: normal -->
- [ ] I can reduce a failing case to a minimum <!-- id: vb-05-debugging-with-and-without-ai-c06 energy: normal -->
- [ ] I turn reproductions into failing tests rather than throwaway scripts <!-- id: vb-05-debugging-with-and-without-ai-c07 energy: normal -->
- [ ] I can list the five common sources of non-determinism <!-- id: vb-05-debugging-with-and-without-ai-c08 energy: normal -->
- [ ] I recognise when suggestions have stopped converging, and switch to reading <!-- id: vb-05-debugging-with-and-without-ai-c09 energy: normal -->
- [ ] I can debug a defect from evidence without a model <!-- id: vb-05-debugging-with-and-without-ai-c10 energy: normal -->
- [ ] I record workarounds with a comment and an issue rather than leaving a silent trap <!-- id: vb-05-debugging-with-and-without-ai-c11 energy: low -->
- [ ] I know whether a workaround defers a library's bug or my own misunderstanding <!-- id: vb-05-debugging-with-and-without-ai-c12 energy: low -->

## Quiz

### Q1. What distinguishes sampling from debugging? <!-- id: vb-05-debugging-with-and-without-ai-q01 -->

- [ ] Sampling uses a model and debugging does not
- [ ] Sampling is faster and therefore always worse
- [x] Debugging means you hold a belief about the cause that can be tested; sampling means hoping a suggestion works
- [ ] Sampling produces more attempts than debugging

**Why:** The diagnostic question is whether you can say what you currently believe the cause is. If the answer is "I am hoping one of these works", you are drawing candidate fixes without any model of the system. Sampling occasionally succeeds, which is precisely what makes it sticky.

### Q2. Why does an error message alone often produce a confidently wrong suggestion? <!-- id: vb-05-debugging-with-and-without-ai-q02 -->

- [ ] Because models cannot read tracebacks accurately
- [ ] Because error messages are usually inaccurate
- [ ] Because the model has not been trained on your language
- [x] The model returns the most common cause, which is a reasonable inference and frequently not your cause

**Why:** Given only a symptom, the most-likely explanation is the best available guess — and it is confidently wrong whenever your cause is the uncommon one, such as a `KeyError` from a nested structure rather than a missing key. Only evidence distinguishes the common cause from yours, which is why the phase is about gathering it.

### Q3. What must a bug reproduction have before you can confirm a fix? <!-- id: vb-05-debugging-with-and-without-ai-q03 -->

- [ ] A description of the symptom and the error message
- [ ] Confirmation from a second person that the bug is real
- [x] Determinism — the same input produces the same failure every time
- [ ] A record of every change made while investigating

**Why:** A bug that fails one run in five is a different and harder problem, and treating it as deterministic sends you chasing the wrong cause. The five common sources of non-determinism are ordering, timing, an unseeded random, time and timezone, and external state — and task 10 has you create one deliberately to feel the difference.

### Q4. Why reduce a reproduction to its minimum? <!-- id: vb-05-debugging-with-and-without-ai-q04 -->

- [x] A large reproduction is where wrong hypotheses hide, and twenty lines can be reasoned about
- [ ] To make the bug report shorter for the reader
- [ ] Because models have limited context windows
- [ ] To confirm the bug is not caused by something obvious

**Why:** Reduction is mechanical and boring and it is the highest-yield debugging activity, because every removed line is a candidate cause eliminated. Task 8 asks for the line count before and after, which is also a useful measure of how much of the original code was irrelevant.

### Q5. Suggestions have started repeating in different words and each attempt needs a new guess about your setup. What does this indicate? <!-- id: vb-05-debugging-with-and-without-ai-q05 -->

- [ ] The model has reached its context limit and needs a fresh conversation
- [ ] The bug is in a third-party library and cannot be fixed
- [ ] You should ask a more capable model
- [x] The bottleneck is information rather than ideas, so more suggestions cannot help

**Why:** This is the convergence signal, and the correct response is to read: the failing function via Phase 3's three questions, the data backwards from the failure, the official documentation for the exact function, and your own unchecked assumption. A more capable model does not fix a missing reproduction.

### Q6. When is a workaround the right answer, according to this phase? <!-- id: vb-05-debugging-with-and-without-ai-q06 -->

- [ ] Never — every bug must be understood before it is closed
- [x] When the cause is a third-party bug or code you are deleting, and you record it and know what you are deferring
- [ ] Whenever the fix would take more than an hour
- [ ] When the tests pass again after the change

**Why:** The phase refuses to make "always understand every bug" the rule, because that is not affordable. Two conditions make a workaround legitimate rather than negligent: recording it so the next reader is not trapped, and knowing whether you are deferring a library's problem — genuinely closed once pinned — or a misunderstanding in your own logic, which accrues interest.

## You're ready to move on when...

You form and write down a hypothesis before asking for help, and you can tell the difference between that and sampling in your own behaviour. You can write a four-part bug report that sometimes answers the question before you send it. You reproduce before you fix, you reduce before you reason, and you turn reproductions into tests rather than throwaway scripts. You have debugged one defect from evidence with no model at all, and you can name the signal that tells you suggestions have stopped converging. You record workarounds rather than leaving silent traps.

## Free vs Paid

### Free path

Everything here is free: a debugger or print statements, `git bisect`, your test runner, and the documentation. This is one of the cheapest and highest-yield phases in the track, and its value is largely independent of model quality — the disciplined workflow beats the sampling workflow on free and paid models alike, because the advantage comes from information the model does not have rather than from capability it lacks.

There is a budget argument too. The sampling workflow is *expensive*: every pasted error and attempted fix is a request, and a stalled session can burn a lot of a free tier's quota for no result. Investigation is free. On a metered tier the disciplined workflow is cheaper as well as faster.

### Paid path

A paid model gives you a real advantage in one specific place: **it can take more of your code at once.** Debugging a bug that spans several files is much easier when you can supply all of them, and a large context window lets the model reason about the interaction rather than about one file in isolation. Stronger models are also better at forming a *hypothesis* from a reproduction rather than offering the most common fix.

What money does not fix is a missing reproduction. A frontier model given "it doesn't work" is still guessing; it guesses better and more fluently, which can make the sampling loop more seductive rather than less.

### Where the money genuinely matters

It matters for **large-context debugging** and for **agentic investigation** — a paid coding agent can run your tests, read the traceback and iterate without you relaying every step, which is genuinely faster on well-defined failures. It does not remove the need for a reproduction; it changes who gathers it. The free-tier compensation is that `git bisect`, the debugger and reading the code backwards are all free and together solve the large majority of real bugs, particularly the ones you introduced yourself.
