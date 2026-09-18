---
id: sc-04-using-ai-honestly
track: safety-career
phase: 4
order: 21
title: Using AI Honestly
duration: 1 week
duration_weeks: 1
energy_mix: [normal, high]
deliverable: portfolio/safety-career/04-using-ai-honestly.md
exit_criteria: >
  You can state what you are actually building with a given piece of AI-assisted
  work, and apply the explain/debug/extend test to it honestly rather than
  generously. You can describe the mechanism by which a competence you stop
  rehearsing decays, and name which of your own competences are currently
  unmeasured. You have run a capability audit on a task you normally delegate and
  written down what you could actually still do, including the parts that were
  worse than you expected. You have written a personal policy in your own words
  that names what you always do yourself, what you always delegate, what you
  always review line by line, and what you disclose — and it contains at least
  one rule specific enough to be checkable. You can state when disclosure is
  material to a reader and when performing it obscures the thing they need.
prerequisites:
  - safety-career/01
---

# Phase 4 — Using AI Honestly

## Goal of this phase

Phases 1 to 3 pointed outward. They taught you how models fail, how they fail when someone else is steering them, and how to run a study practice that does not quietly substitute the tool for the learning. This phase points inward. It is about your own practice, and it does not have a system to inspect at the end of it — it has you.

Start by discarding the question most people bring to this topic, because it is malformed. **"Is using AI cheating?" is not answerable**, and it is not answerable for a reason worth understanding: cheating is defined by the goal you set, not by the tool you reached for.

If your goal is to ship a working thing, and AI gets the thing shipped, that is engineering. Nobody calls a compiler cheating. If your goal is to build your own capability to solve a class of problem, and you obtain the answer without building the capability, you have failed your own goal — not because a rule forbids the method, but because you did not get the thing you came for. The same tool, in the same week, on the same desk, is leverage in the first case and self-defeat in the second. Nothing about the tool changed.

So the question this phase replaces it with is narrower and actually answerable:

> **What am I actually building?**

That question has an answer you can check. It is the whole phase. And the reason it matters more for you than for someone with ten years behind them is an asymmetry this phase develops properly: an expert using AI to skip work they have already done loses nothing, because the capability is already in them. A beginner using AI to skip work they have never done loses the foundation, and — this is the part that makes it dangerous — **cannot tell that it is missing**, because the tool covers for the gap from the inside.

This is not a phase about abstaining. AI use is legitimate, it is powerful, and refusing to use it is its own kind of mistake. It is a phase about **knowing what you are trading**, which requires measurement rather than resolve.

## Estimated time

**1 week** at 1–2 hours a day, 5 days a week. Roughly 6–8 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | The goal question, and the explain/debug/extend test | 1.5h |
| 2 | Skill atrophy as a mechanism, and leverage versus avoidance | 1.5h |
| 3 | The capability audit — actually run one | 1.5h |
| 4 | Writing your personal policy | 1.5h |
| 5 | Disclosure, and the beginner's asymmetry — write it up | 1.5h |

If you only have two hours this week, do tasks 4, 7 and 10. Those give you the test applied to real work, a real capability audit, and a written policy. The reading is the cheap part of this phase and the measurement is the expensive part, which is the correct ratio.

## Skills you'll gain

- State, for a specific piece of work, what you are actually building — and whether AI use serves that goal or defeats it.
- Apply the **explain / debug / extend** test and rank the three honestly, including admitting when only the weakest one passes.
- Describe skill atrophy as a **rehearsal** mechanism rather than as memory loss, and say why it is invisible from inside.
- Distinguish **using AI to go faster** from **using AI to avoid difficulty**, and name the internal signal that separates them.
- Run a **capability audit**: pick a delegated task, do it without the tool, and record what you could actually still do.
- Write a **personal policy** specific enough to be checkable, in your own words, covering what you always do yourself, always delegate, always review, and always disclose.
- Decide whether disclosure is **material** to a particular reader, and recognise when performing it obscures what they need.
- Explain the **beginner's asymmetry** — why skipping work you have never done costs more than skipping work you have.

## Specific topics to learn

- **Cheating is about the goal, not the tool** — why the question is malformed and what replaces it.
- **The explain/debug/extend test** — three parts, each failing separately, in ascending order of strength.
- **Why "explain" is the weakest check** — it is the one you can fake most convincingly to yourself.
- **Skill atrophy as disuse, not loss** — the competences that decay are the ones you stop rehearsing.
- **The four competences at risk** — reading unfamiliar code, holding a problem in memory, forming a debugging hypothesis from evidence, knowing what wrong looks like.
- **Invisible decay** — why the tool covering for the gap is exactly what prevents you noticing the gap.
- **Leverage versus avoidance** — same behaviour from outside, different long-run outcome.
- **The relief signal** — being glad you did not have to understand something.
- **The capability audit** — measurement, not moral discipline.
- **The personal policy** — the four questions, and why "I will be careful" is not a policy.
- **Disclosure as honesty about the work** — materiality, and the difference from confession.
- **The beginner's asymmetry** — why this phase matters more the less experience you have.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| A plain Markdown file | Hold the audit log, the policy and the write-up | Free | — | Tasks t04–t13 — everything written lives here | Any text editor, or a file in the repo you already have |
| Your own git history | The most honest record of what you built unaided | Free/open-source | https://git-scm.com | Task t03 — find commits you could not now reproduce | Your editor's local history |
| A timer | Separate "this took 20 minutes" from "this took a day" | Free | — | Task t07 — the capability audit needs a real clock | A phone stopwatch |
| Your existing chat history | The corpus of what you delegate most often | Free | — | Task t02 — classify your delegations | A week of manual notes |
| `portfolio/` in this repository | Where the deliverable goes | Free | — | Tasks t12, t13 — the written artefacts | Any folder you keep |

Nothing here costs money. Do not buy anything for this phase. The instrument this phase needs is a clock and a willingness to write down an unflattering result.

## Free/cheap resources

- **`ai-roadmaps/safety-career/01-phase-how-models-go-wrong.md`** — in this repository. Part 4 on sycophancy is the mechanism behind a failure this phase assumes: a model that agrees with your self-assessment of your own skill is not evidence about your skill.
- **`ai-roadmaps/safety-career/03-*.md`** — in this repository. Rule 6 of `shared/study-rules.md` — your own words, or it did not happen — is the same discipline this phase applies to your own competence.
- **Your own git log.** The single best free instrument here. Commits you wrote without assistance six months ago, and whether you could write them again today, is a measurement rather than a feeling.
- **Your chat history.** Genuinely useful and genuinely uncomfortable: it is a complete record of what you asked for help with, in order. Most people have never read it end to end.

Be careful with writing on this topic. Most of it is argument about whether AI use is good or bad, written by people with a position to defend, and it blends claims about learning with claims about virtue. Prefer instruments — a clock, a git log, a task done cold — over essays.

## Lesson: What Are You Actually Building?

### Part 1 — The question that replaces the one you were asked

The question people ask is "is using AI cheating," and it cannot be answered, because cheating is not a property of an action. It is a relation between an action and a goal.

Take two people using the same model on the same afternoon.

The first has a goal: *ship a working scheduling tool by Friday*. The model writes most of the parser, the first person reads it, tests it, fixes what is wrong, and ships on Thursday. Nothing was lost. The thing they came for — a working tool — exists, and their ability to build the next scheduling tool is unchanged because it was never the point of this particular job.

The second has a goal: *learn to write a parser*. The model writes the parser, it works, and they submit it. They came for a capability and left with an artefact. Those are not the same thing, and no rule had to be broken for the failure to occur. **They defeated their own goal using a tool that worked perfectly.**

Notice that from the outside, and from the model's output, these two afternoons are identical. The same code exists at the end. The difference is entirely in what was being built, and only the person doing it knows which one they were doing — which is why this phase is about your own honesty and not about anybody's rules.

So the operative question is:

> **What am I actually building here — an artefact, or a capability?**

Both answers are legitimate. Building an artefact is legitimate. Building a capability is legitimate. What is not legitimate is answering one question and behaving as though you answered the other, because that is where the loss happens invisibly.

There is a third case worth naming, because it is where most real work sits. **Often you are building both**, and the honest move is to decide the ratio deliberately. A learner building a portfolio project is doing both at once. Using AI for the CSS, the boilerplate, the deployment config, and the tests is fine and probably correct — none of those are the capability you came for. Using AI for the part you came to learn is the part where the question is live. **The skill is in the boundary, and the boundary is per-task, not per-project.**

### Part 2 — The test that does the work

Here is the instrument. For any artefact you are about to keep, ask:

> **Could I explain, debug and extend this myself?**

Three parts. Each one fails separately, and they are not equally strong.

**Explain.** Can you describe what it does and why it is built that way? Not *what the file contains* — you could read it and paraphrase. Why is the data structured this way? Why this approach and not the obvious alternative? What did it trade away?

**Debug.** When it breaks, can you find out why without starting over? This is a different capability from explaining. You can understand a system perfectly and still have no idea how to find the cause of a failure in it — the skill of forming a hypothesis from evidence and testing it is separate from the skill of comprehension.

**Extend.** Can you add a feature without the structure collapsing? Can you change the thing the design assumed would not change? This is the strongest of the three and the hardest to fake.

Now the part that makes the test useful rather than reassuring: **rank them honestly.**

**"Explain" is the weakest check, and it is the easiest to fake to yourself.** The reason is mechanical. You have just read the code, or you have just read the model's confident description of the code. That description is in your working memory, and working memory feels a great deal like understanding. You can run the model's own explanation back to yourself and mistake it for your own comprehension. A model is also — per Phase 1 — extremely good at producing a plausible-sounding rationale for any design, including one that has a flaw, so the explanation you absorbed may be describing the code as intended rather than the code as written.

**"Extend" is the strongest**, because it cannot be answered from reading. To know whether you can extend something, you have to have a specific extension in mind, and you have to notice whether you can see where it would go. The uncomfortable version of the question is not "could I extend this" in general — the answer to that is always a hopeful yes — but *"name the next feature, and the file it would go in, and the thing that would break first."* If you cannot name those three, the honest answer is that you do not know yet.

**"Debug" sits between them** and is the one most often assumed. It is worth testing directly rather than by introspection, because debugging is the competence that atrophies first and least visibly. The concrete version: introduce a bug yourself, then find it without asking anything. Not *imagine* finding it — do it.

The test is not a verdict on whether the AI use was acceptable. It is a reading of what you now have. Sometimes the reading is "I have a working artefact and I cannot extend it," and the correct response to that is not guilt. It is either to say so out loud, or to go and do the part that closes the gap.

### Part 3 — Skill atrophy, described mechanically

The word "atrophy" gets used as a warning and rarely as a mechanism. Here is the mechanism, and it is unglamorous.

**You are not losing knowledge. You are losing the ability to do things you no longer practise.**

A competence is not a stored object that degrades on a shelf. It is a thing you can currently *do*, and doing it is what keeps it available. When you stop rehearsing it, you do not lose the fact that the skill exists or the memory of having had it — you lose fluency in execution. And execution is the whole of the thing.

This is why the decay is not about memory and does not respond to reading. Reading about debugging does not maintain your ability to debug, in the same way that reading about swimming does not maintain your swimming. The rehearsal has to be the act.

The specific competences at risk from heavy AI-assisted work are worth naming, because they are not the ones people expect. They are not "knowing syntax" — that is the least valuable and the most easily recovered. They are:

**Reading unfamiliar code.** Sitting with something you did not write and did not generate, and constructing an understanding of it from the code itself. This is the foundational skill of working on a real codebase, and it is precisely the skill that is bypassed every time you ask for an explanation instead of building one.

**Holding a problem in memory while exploring it.** The state of a problem — what you know, what you have ruled out, what you were about to try — has to be maintained while you work, and maintaining it is effortful. Handing the problem over resets that state. When you come back, you start from a summary rather than from your own accumulated context, and the summary is much smaller than what you had.

**Forming a debugging hypothesis from evidence.** Looking at a symptom and a set of facts and proposing a cause, then designing a test that would distinguish your hypothesis from the alternatives. This is a generate-and-test loop that you run internally, and it is a skill, not a personality trait.

**Knowing what "wrong" looks like.** This one is underrated. Experience is largely a store of what failure looks like in a domain — the smell of a bad abstraction, the shape of a race condition, the point in a file where something is obviously off. You build it by being wrong a lot and noticing. Skip the being-wrong, and you skip the store.

**Now the part that makes this genuinely dangerous rather than merely sad.** The loss is **invisible from inside, because the tool covers for it.**

You do not experience the absence of a skill you have stopped using. You experience the task going fine, because the tool is doing the thing you would have done. There is no moment where you reach for the competence and find it missing, because you never reach for it — you reach for the tool, and the tool works. The feedback that would tell you about the decay is exactly the feedback the tool suppresses.

It follows that **introspection cannot answer this question.** You will feel competent. Feeling competent is what the tool provides. The only way to find out is to remove the tool from one task and observe — which is the audit in Part 5.

One honest limit: the shape of this is reasoning from the structure of practice and feedback, not a claim resting on a specific study about AI-assisted programming, which is a young field. The competences listed above are the ones the mechanism predicts, and you should test the prediction on yourself rather than accept it. **Unverified** as a citation; checkable as an experiment.

### Part 4 — Faster versus avoiding difficulty

Two people use AI on the same task. From outside, their behaviour is identical: prompt, response, paste, done.

**The first is going faster.** They could do the task without help. They know roughly what the answer looks like, so they can tell when the output is wrong. The model compresses a two-hour job into twenty minutes, and the two hours they did not spend were not building anything they needed — the competence was already there and already practised.

**The second is avoiding difficulty.** They could not do the task without help, and that is exactly why they are using it. The output is accepted because there is no basis on which to reject it. The twenty minutes saved is not compression; it is the entire learning experience of the task, deleted.

**These are indistinguishable in the artefact.** Same code, same quality, possibly the same review outcome. The distinction exists only in the relationship between the person and the work, which means nobody else can make the call for you and no external signal will reveal it.

So you need an internal signal, and there is a reliable one:

> **If you are relieved that you did not have to understand something, that is the signal.**

Read it carefully, because it is doing something specific. Relief is not the same as satisfaction at speed. Going faster feels like momentum — you are moving, you know where you are going, the thing is getting done. Avoiding difficulty feels like **relief that a thing you were dreading has been taken away.** If the model's answer arrives and your dominant feeling is that you have been let off a hook, you have just found a place where you were not going to be able to do the task.

A second signal, related but sharper: **the moment you decide not to look at something because checking it would take longer than accepting it.** That decision is sometimes correct — you cannot review everything, and priorities are real. But it is worth noticing each time you make it, because a pattern of them in one area is a map of your gaps.

None of this means you must do everything yourself. It means the difference between the two cases is real, that it matters over years rather than days, and that the only person with the information to tell them apart is you. **The tool does not know which case you are in.** It answers either way with the same fluency.

### Part 5 — The capability audit

Everything above is reasoning until you measure. So measure.

**The practice:** pick one task you normally delegate to AI. Do it without the tool. Find out what you can actually still do.

The framing matters more than the act, so be careful how you hold it. **This is measurement, not moral discipline.** You are not doing penance, and a bad result is not a failing grade. You are taking a reading from an instrument that is otherwise covered, on the grounds that a covered instrument is worse than an unflattering one.

Do it properly, which means three things:

**Pick a task you actually delegate.** Not a task you could imagine delegating. Open your history and pick one you delegate weekly. The audit is worthless on a task you were already doing yourself.

**Do it cold.** No prompt, no model, no glancing at a previous answer. The point is the reading, and a contaminated reading tells you nothing. Put a clock on it.

**Write down the result including the parts that were worse than you expected.** This is the step people skip, and it is the step that makes the exercise do anything. The interesting output is never "I could do it" or "I could not." It is the specific place you stalled — the point where you did not know the next move and would normally have asked. That point is your actual current boundary, and it is more useful than any general self-assessment you could produce.

What to record for each audited task:

| Field | What goes in it |
|---|---|
| The task | Concrete enough that someone else could attempt it |
| How often you delegate it | Daily, weekly, monthly — frequency is what turns a gap into atrophy |
| Time without the tool | Actual clock time, and how it compared to your estimate |
| Where you stalled | The specific point, not "it was hard" |
| What you would have asked | The question you would have typed — this is the shape of the gap |
| Verdict | Could do it / could do it slowly / could not start — say which honestly |

Run it on **two or three tasks from different areas**, because the gaps are not evenly distributed. Most people find they have retained competence where they were practising anyway and lost it precisely where the tool arrived earliest. That map is the deliverable, and it is more informative than anything you would get from thinking about it.

And a second, cheaper instrument worth using alongside it: **the git log.** Find commits you made six months to a year ago and ask whether you could write that change again today, unaided. Your own history is a record of your capability at a point in time, and unlike memory it does not update itself to match your current self-image.

### Part 6 — Writing a personal policy

A policy is a decision made in advance so that it does not have to be made under pressure, when you are tired and the deadline is close and the tool is right there. That is the whole function. It exists because the decision is easy to make correctly at rest and very hard to make correctly at 11pm.

**Write it in your own words.** A policy in somebody else's language will not survive contact with a real decision, because you will not recognise the situation as the one the sentence was about.

**A policy that says "I will be careful" is not a policy.** This is the failure mode, and it is worth being blunt about it. "I will be careful" is a statement of intent with no operational content — it cannot be violated in a checkable way, it gives no guidance in an ambiguous case, and it will be satisfied by any decision you make, because you can always say you were being careful. Compare: *"I do not commit code I cannot debug. If I cannot explain a failure in something I shipped, I revert it and rewrite the part I do not understand before shipping again."* That one can be violated. You would know.

Four questions, and the answers should be specific:

**What will I always do myself?** Name the competences you are actively building, and the tasks attached to them. Be concrete about the boundary — "the data layer of my own projects" is a policy; "the important parts" is not.

**What will I always delegate?** This half is usually missing, and its absence is a sign the policy is really a guilt document. You are allowed to delegate. Naming what you will freely hand over — boilerplate, configuration, deployment scripts, test scaffolding, unfamiliar file formats, anything you have already done enough times to have the capability — is what makes the "always myself" list credible rather than ceremonial. A policy with no delegation list is not a policy; it is a wish.

**What will I always review line by line?** Anything that touches money, credentials, personal data, irreversible actions, or security. This list is short and non-negotiable, and it is the one place where "the model wrote it and it looked fine" is never an acceptable answer. Phase 2 is the reason this list exists.

**What will I always disclose?** To whom, and about what. See the next part.

Two properties make a policy usable. **It has to be short enough to remember** — if you cannot recall it without opening the file, it will not be present at the moment it is needed. And **at least one rule has to be specific enough to be checkable**, meaning there is a situation in which you would be caught violating it. Write that rule down and notice whether you can actually picture the violation. If you cannot, rewrite it until you can.

### Part 7 — Disclosure, and the beginner's asymmetry

**Disclosure is honesty about the work, not confession about the method.**

That distinction resolves most of the anxiety around this. The question is not "have I admitted that I used AI" — it is **"does the reader need to know this in order to correctly evaluate what they are reading?"**

Disclosure is **material** when the reader's evaluation depends on it. Some examples of material:

- **Academic or assessment work**, where the thing being measured is your capability. Hiding the method makes the measurement wrong, and a wrong measurement is the harm — not the method.
- **Work where authorship carries legal or professional weight** — a signed report, a filing, a document where your name asserts that you did the analysis.
- **Code you are handing to someone who will maintain it**, when a significant fraction is not understood by anyone on the team. That is a maintenance liability, and they need to know it exists.
- **Anything where the reader would reasonably assume a human did the work** and that assumption changes what they do with it.

Disclosure is **not material** when the method does not change how the reader should read the output — a study aid, personal notes, a first draft you have rewritten until it is yours, boilerplate that a reviewer would evaluate identically either way.

And the part people miss: **performing disclosure can obscure the thing the reader needs.** A blanket "this was written with AI assistance" on every piece of work tells the reader nothing, because it is true of everything and therefore discriminates nothing. Worse, it can be a substitute for the information that matters. The reader who needs to know *"which parts of this code does nobody on the team understand"* is not served by *"AI was used."* They are served by *"the caching layer in `src/cache.rs` was generated and neither of us has worked through it."* **Say the specific thing, at the point where it is actually load-bearing.** That is more honest than the ritual sentence and dramatically more useful.

**Now the asymmetry, which is the reason this phase is placed where it is.**

An expert using AI to skip work they have already done loses nothing. They did the work years ago. The competence is installed, it has been exercised thousands of times, and skipping a repetition costs them essentially nothing. They can evaluate the output, because they have the basis for judgement — they know what a good answer to this problem looks like, so a bad one registers as bad.

A beginner using AI to skip work they have never done loses the foundation. And they **cannot tell that it is missing**, because:

- They have no basis on which to evaluate the output, so they cannot detect when it is subtly wrong. Phase 1 is about exactly this: fluency reads as correctness when you lack the domain knowledge to tell them apart.
- Nothing feels absent. There is no gap in their experience, because the tool filled the task and they never reached for the competence.
- The artefact works. It might work for a long time. The cost arrives later, when the system has to be changed and there is no one in the room who understands it — including its nominal author.

Put the two together and you have the thing this phase exists to prevent: **the same behaviour, the same output, the same immediate result, and opposite long-run outcomes depending entirely on what was already in you.** Which is why the test in Part 2, the audit in Part 5 and the policy in Part 6 are all the same instrument pointed at different moments. They are ways of asking what you actually have, at a time when the answer is still cheap to act on.

**And the honest closing note.** None of this argues for using less AI. It argues for knowing which of the two people in Part 1 you are on a given task. The first one should use the tool freely and without a shred of guilt. The second one should notice — not because a rule says so, but because they set the goal themselves, and they are the only one who can tell whether they are still aiming at it.

## Hands-on practice tasks

1. Write down your last five pieces of AI-assisted work. For each, state in one sentence whether you were building an artefact or a capability, and whether AI use served that goal. <!-- id: sc-04-using-ai-honestly-t01 band: quick energy: normal -->
2. Go through your chat history from the past month and list what you asked for. Group the requests. The groups are your actual delegation policy, whether or not you have ever written one down. <!-- id: sc-04-using-ai-honestly-t02 band: focused energy: normal -->
3. Find a commit you made six to twelve months ago and read it cold. Can you explain why it is built that way, debug it, and extend it? Write down which of the three you could not do. <!-- id: sc-04-using-ai-honestly-t03 band: focused energy: normal -->
4. Take a piece of code in your project that AI wrote a substantial part of. Apply the full test: name the next feature you would add, the file it goes in, and the thing that would break first. If you cannot name all three, that is the finding. <!-- id: sc-04-using-ai-honestly-t04 band: deep energy: high -->
5. Introduce a bug into that code deliberately, then find it without asking any model. Record how long it took and at what point you stopped having a hypothesis. <!-- id: sc-04-using-ai-honestly-t05 band: deep energy: high -->
6. Write a paragraph arguing that your own AI use is entirely leverage, then a paragraph arguing it is partly avoidance. Identify which paragraph has more specific evidence in it. <!-- id: sc-04-using-ai-honestly-t06 band: focused energy: normal -->
7. Run a capability audit on one task you delegate weekly. Do it cold, timed, with no model and no looking at previous answers. Write down the specific point where you stalled. <!-- id: sc-04-using-ai-honestly-t07 band: deep energy: high -->
8. Run the audit on a second task from a different area — writing, analysis, or planning rather than code. Compare where the gaps are. The distribution is usually uneven and the unevenness is the useful part. <!-- id: sc-04-using-ai-honestly-t08 band: deep energy: high -->
9. List every situation in the past month where you felt relieved not to have to understand something. For each, note whether that thing is now load-bearing in your project. <!-- id: sc-04-using-ai-honestly-t09 band: focused energy: normal -->
10. Write your personal policy in under 300 words, answering the four questions from Part 6. It must contain what you will always delegate, not only what you will always do yourself. <!-- id: sc-04-using-ai-honestly-t10 band: deep energy: normal -->
11. Take your policy and find the rule that is checkable — the one you could actually be caught violating. If no rule qualifies, rewrite until one does, and note what the violation would look like. <!-- id: sc-04-using-ai-honestly-t11 band: focused energy: high -->
12. Write down one situation where disclosure is material and one where it is not, both from your own work. Then write the specific sentence you would say in the material case, naming what the reader needs rather than the method. <!-- id: sc-04-using-ai-honestly-t12 band: focused energy: normal -->
13. Set one audit date in the calendar for four weeks from now, with the tasks you will re-measure named. This is the `ongoing` part: a single audit is a snapshot, a repeated one is a trend. <!-- id: sc-04-using-ai-honestly-t13 band: ongoing energy: low -->

## Common Pitfalls

**Asking whether it is cheating.** The question has no answer, because cheating is a relation between an action and a goal. The question that does have an answer is what you were building. People spend a lot of energy on the first one, which resolves nothing, and avoid the second, which resolves everything.

**Using "explain" as the test and declaring victory.** Explanation is the weakest of the three checks and the easiest to fake, because the model's own description is in your working memory and working memory feels like understanding. If your test was "I could explain it in general terms," you have not tested much.

**Answering "could I extend this" in the abstract.** Everyone answers yes to the general question. The question only has content when you must name the next feature, the file, and the first thing that would break.

**Assuming decay will announce itself.** It will not. The tool covers the gap, which means the feedback that would reveal the decay is precisely what the tool suppresses. You will feel competent throughout. The only reading comes from removing the tool and observing.

**Treating the capability audit as penance.** If you are doing it to prove you are disciplined, you will pick an easy task, do it while glancing at the answer, and learn nothing. It is an instrument. Cover it and take the reading, even when the reading is unflattering.

**Confusing relief with speed.** Going faster feels like momentum; avoiding difficulty feels like being let off a hook. If you are not watching for the second feeling, you will read it as the first every time.

**Writing a policy that says "I will be careful."** No operational content, cannot be violated, and satisfied by any decision you make. A policy needs at least one rule specific enough that there is a situation in which you would be caught breaking it.

**Writing a policy with no delegation list.** If everything is in the "always myself" column, you have written a guilt document rather than a policy, and it will be abandoned the first week it costs you something. Naming what you freely hand over is what keeps the rest credible.

**Treating disclosure as confession.** "AI was used" is not honesty about the work; it is a ritual sentence that tells the reader nothing and can substitute for the information they actually need. The material question is whether the reader's evaluation changes, and the useful disclosure names the specific part.

**Applying the expert's calculation to yourself.** An expert skipping work they did years ago loses nothing. A beginner skipping work they have never done loses the foundation and cannot tell. The behaviour looks identical and the outcome is opposite, and which one you are in depends entirely on what was already in you.

**Reading this phase as an argument to use less AI.** It is not. It is an argument for knowing which case you are in on a given task. The person building an artefact should use the tool freely; the person building a capability should notice when they have stopped building it.

## Deliverable / proof of work

Create `portfolio/safety-career/04-using-ai-honestly.md` containing:

1. **Five pieces of AI-assisted work classified** as artefact or capability, with the goal stated for each and an honest verdict on whether AI use served it (task 1).
2. **Your actual delegation policy, derived from your history** — the grouping of what you really ask for, before you wrote anything down (task 2).
3. **The explain/debug/extend reading** for at least two pieces of code in your own project, at least one of which AI wrote a substantial part of. Rank which of the three you could genuinely do, and for one of them, name the next feature, the file, and the first thing that would break (tasks 3, 4).
4. **A debugging test, done rather than imagined** — the bug you introduced, the time it took to find, and the point at which you stopped having a hypothesis (task 5).
5. **Two capability audits** from different areas, each in the six-field table from Part 5, done cold and timed, with the stall point recorded explicitly (tasks 7, 8).
6. **A list of relief moments**, with a note on which of those things are now load-bearing (task 9).
7. **Your personal policy**, under 300 words, answering all four questions, with the checkable rule identified and the violation described (tasks 10, 11).
8. **One material and one immaterial disclosure case** from your own work, with the specific sentence you would use in the material one (task 12).
9. **A scheduled date four weeks out** for re-measuring the same tasks (task 13).

Point 5 is the one that cannot be faked. A policy is writing, and the classification in point 1 is easy to make generous. A timed cold attempt at a task you normally delegate produces a number and a stall point, and neither of those will flatter you.

## Checklist

- [ ] I can state for a specific piece of work whether I am building an artefact or a capability <!-- id: sc-04-using-ai-honestly-c01 energy: normal -->
- [ ] I understand that cheating is defined by the goal I set, not by the tool I used <!-- id: sc-04-using-ai-honestly-c02 energy: normal -->
- [ ] I can apply the explain/debug/extend test without collapsing it into "could I explain it" <!-- id: sc-04-using-ai-honestly-c03 energy: normal -->
- [ ] I accept that "explain" is the weakest of the three and the easiest to fake to myself <!-- id: sc-04-using-ai-honestly-c04 energy: normal -->
- [ ] I have named the next feature, the file and the first thing that would break, for a real piece of my code <!-- id: sc-04-using-ai-honestly-c05 energy: high -->
- [ ] I can describe skill atrophy as disuse rather than memory loss, and name the four competences at risk <!-- id: sc-04-using-ai-honestly-c06 energy: normal -->
- [ ] I understand that the decay is invisible from inside because the tool covers the gap <!-- id: sc-04-using-ai-honestly-c07 energy: normal -->
- [ ] I can distinguish going faster from avoiding difficulty, and I know the relief signal <!-- id: sc-04-using-ai-honestly-c08 energy: normal -->
- [ ] I have run a capability audit cold and timed, and written down where I stalled <!-- id: sc-04-using-ai-honestly-c09 energy: high -->
- [ ] I have audited tasks from more than one area and can see where my gaps actually are <!-- id: sc-04-using-ai-honestly-c10 energy: high -->
- [ ] I have written a personal policy in my own words, under 300 words, answering all four questions <!-- id: sc-04-using-ai-honestly-c11 energy: high -->
- [ ] My policy names what I will always delegate, not only what I will always do myself <!-- id: sc-04-using-ai-honestly-c12 energy: normal -->
- [ ] My policy contains at least one rule specific enough that I could be caught violating it <!-- id: sc-04-using-ai-honestly-c13 energy: high -->
- [ ] I can explain why disclosure is honesty about the work rather than confession about the method <!-- id: sc-04-using-ai-honestly-c14 energy: normal -->
- [ ] I can tell a material disclosure from an immaterial one, and I say the specific thing rather than the ritual sentence <!-- id: sc-04-using-ai-honestly-c15 energy: normal -->
- [ ] I can explain the beginner's asymmetry, and I apply it to myself rather than to other people <!-- id: sc-04-using-ai-honestly-c16 energy: high -->
- [ ] I have scheduled a re-measurement date rather than treating one audit as a verdict <!-- id: sc-04-using-ai-honestly-c17 energy: low -->

## Quiz

### Q1. What is the central problem with the question "is using AI cheating?" <!-- id: sc-04-using-ai-honestly-q01 energy: normal -->

- [x] Cheating is a relation between an action and a goal, and the question names neither, so it has no answer
- [ ] It assumes AI tools are accurate, which they frequently are not
- [ ] It only applies to academic work, not to professional work
- [ ] It confuses using AI with copying another person's work

**Why:** The same action is legitimate or self-defeating depending entirely on what you were trying to build, so no property of the action itself decides it. The replacement question — what am I actually building, an artefact or a capability — has an answer you can check, and checking it is the work of this phase.

### Q2. You have just read a model's detailed explanation of code it wrote for you, and you could repeat the explanation back. Why is this weak evidence of understanding? <!-- id: sc-04-using-ai-honestly-q02 energy: normal -->

- [ ] Because the model's explanations are usually factually wrong
- [x] Because the explanation is in your working memory, which feels like comprehension, and a model can produce a plausible rationale for a design whether or not it is sound
- [ ] Because understanding only counts if you wrote the code yourself
- [ ] Because explanations do not test debugging ability

**Why:** Explanation is the weakest of the three checks precisely because it is the one you can fake to yourself, and this is the mechanism. The explanation describes the code as intended rather than as written, and repeating it rehearses the model's model of the code rather than building your own. Extending is stronger because it cannot be answered from reading — you have to name the next feature and the thing that would break.

### Q3. What is the actual mechanism of skill atrophy under heavy AI-assisted work? <!-- id: sc-04-using-ai-honestly-q03 energy: normal -->

- [ ] Knowledge stored in memory degrades over time if it is not reviewed
- [ ] The model's suggestions overwrite your own patterns of thought
- [ ] Motivation to do difficult work declines once an easier path exists
- [x] Competences you stop rehearsing stop being available to execute, and you are not losing knowledge but the ability to do things you no longer practise

**Why:** A skill is not a stored object that decays on a shelf; it is something you can currently do, and doing it is what keeps it available. That is why reading about debugging does not maintain debugging — the rehearsal has to be the act. And the loss is invisible from inside because the tool performs the task, so you never reach for the competence and never find it absent.

### Q4. You finish a task using AI and your main feeling is relief that you did not have to work out how it was done. What does that indicate? <!-- id: sc-04-using-ai-honestly-q04 energy: normal -->

- [ ] Nothing in particular — relief is a normal response to saving time
- [x] That this was avoidance rather than leverage, because relief at not understanding is the signal that separates the two
- [ ] That you should stop using AI for this class of task permanently
- [ ] That the model produced an incorrect answer

**Why:** Going faster feels like momentum — you know where you are going and the thing is getting done. Relief at not having to understand is a different feeling, and it marks the place where you could not have done the task. That is useful information rather than a verdict: it tells you where a gap exists, and a gap can be closed deliberately or accepted knowingly.

### Q5. Which of these is a policy rather than a statement of intent? <!-- id: sc-04-using-ai-honestly-q05 energy: high -->

- [ ] I will be careful and use AI responsibly
- [ ] I will always review AI output before using it
- [x] I will not ship code I cannot debug, and if a failure appears in something I cannot explain I revert the unclear part and rewrite it before shipping again
- [ ] I will make sure to stay honest about how I use these tools

**Why:** The other three cannot be violated in any checkable way — "review before using" is satisfied by a glance, and "be careful" by any decision at all. The third names a condition, an action, and a consequence, so you would know if you broke it. A policy without at least one rule of that shape is a wish, and it will not survive the evening when the deadline is close and the tool is right there.

### Q6. Why does skipping foundational work cost a beginner more than it costs an expert? <!-- id: sc-04-using-ai-honestly-q06 energy: high -->

- [ ] Because beginners have less access to high-quality models and get worse output
- [ ] Because experts are held to a lower standard of disclosure
- [ ] Because foundational work is only available to be learned early in a career
- [x] Because the expert already has the competence and loses nothing by skipping a repetition, while the beginner loses the foundation and has no basis on which to notice it is missing

**Why:** The behaviour and the artefact are identical in both cases; what differs is what was already installed. The expert can evaluate the output because they know what a good answer looks like, so a bad one registers as bad. The beginner has no such basis, the artefact may work for a long time, and the cost arrives later when the system must change and nobody in the room understands it — including its nominal author.

## You're ready to move on when...

- You can state, for a piece of your own work, **what you were actually building** — and you can do it without reaching for the cheating question.
- You can apply **explain / debug / extend** to real code and rank the three honestly, including saying out loud when only the weakest one passes.
- You can describe atrophy as a **rehearsal** mechanism, name the four competences at risk, and explain why the tool covers the gap that would otherwise reveal it.
- You have **actually run a capability audit** — cold, timed, on a task you genuinely delegate — and you have written down the point where you stalled rather than a general impression.
- You can tell **going faster from avoiding difficulty**, and you have caught yourself in the second case at least once.
- You have a **personal policy under 300 words in your own words**, with a delegation list as well as a prohibition list, and at least one rule you could be caught violating.
- You can explain **why disclosure is about the reader's evaluation rather than your method**, and you have written the specific sentence for a case that is material to you.
- You have a **date set to re-measure**, because one audit is a snapshot and you are looking for a trend.

If your audit was easy and your policy was quick to write, be suspicious of both. This phase is only worth anything when it produces at least one finding you did not want — a place where the tool has been covering for you, or a rule you realised you had never actually been following.

## Free vs Paid

**This phase costs nothing, and money genuinely cannot improve it.** The instruments are a clock, a plain text file, your own git history and your own chat history. All four are already on your machine.

**What free gives you, concretely:** your own repository, which is a year-long record of what you could do unaided; your chat history, which is an equally honest record of what you asked for help with; and the ability to do any task without a tool, which is always available and costs only time. The audits in tasks 7 and 8 are free by construction — the entire point is doing the work without the model.

**Where a paid tier might seem relevant, and is not.** A stronger model produces better output, so the artefacts you ship will be better. That is a real benefit and it changes nothing here, because this phase is not about output quality. It is about what is left in you after the output exists. A better model covers a gap **more** convincingly than a weaker one, which makes the covered gap harder to detect, not easier. If anything, the stronger the tool, the more the audit matters.

**The one real cost is time, and it is the point of the phase.** The audits will take longer than you estimate, because tasks you delegate are tasks you have stopped being fluent in. That overrun is the measurement. A capability audit that finishes quickly and comfortably has not measured anything — you picked something you were already practising, and the correct response is to pick again rather than to record a pass.
