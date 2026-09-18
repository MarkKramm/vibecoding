---
id: vb-01-what-vibecoding-is
track: vibecoding
phase: 1
order: 10
title: What Vibecoding Actually Is
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal]
deliverable: portfolio/vibecoding/01-what-vibecoding-is.md
exit_criteria: >
  You can define vibecoding without either selling or dismissing it, place your own
  current workflow on the spectrum from autocomplete to autonomous agent, and name
  the specific work that gets genuinely easier versus the specific work that only
  appears to get easier. You can state the track's thesis in one sentence and
  explain why "code you cannot read is code you cannot own" is a practical
  engineering claim rather than a slogan.
---

# Phase 1 — What Vibecoding Actually Is

## Goal of this phase

This phase gives you an honest definition of vibecoding, and it spends most of its length on the part that marketing skips: **the work that only appears to get easier.**

The definition first, because the word is used two ways and the confusion is not harmless. Vibecoding means **building software by directing a model in natural language and iterating on what it produces, rather than writing every line yourself.** That is all it means. It says nothing about how good the result is, whether you understand it, or whether it will still run next month. Those are separate questions, and the whole of this track is about them.

The honest accounting is genuinely two-sided, and both sides are large.

**What gets easier is real.** Boilerplate. Glue code. The first draft of something unfamiliar. Translating between languages. Writing the test you already know the shape of. Explaining an error message. Remembering the argument order of a function you last used two years ago. These are real hours, returned to you, and pretending otherwise out of professional pride is its own kind of dishonesty.

**What only appears easier is the trap.** Producing code is not the same as producing working software. A model will generate a fluent, confident, well-formatted function that calls a method which does not exist, handles the case you cared about and silently mishandles the one you did not, and passes the test you wrote because the test was written to match the code. Every one of those failures has a distinctive property: **it looks like success.** Compilers catch syntax. Nothing catches plausibility.

So the thesis of this track, stated once and then earned across seven more phases:

> **Speed is real, and so is the illusion of progress. The skill is telling them apart.**

The concrete form of that idea is the sentence you will meet again in Phase 3 and Phase 8:

> **Code you cannot read is code you cannot own.**

This is not a purity test and it is not anti-AI. It is a practical claim about three things you will actually need to do. **You cannot debug what you cannot read** — when it breaks, and it will, you will be reading it under time pressure with a user waiting. **You cannot extend what you cannot read** — the next feature has to fit the shape of what exists, and if that shape is opaque you will either rewrite it or bolt on something that fights it. **You cannot defend what you cannot read** — in a code review, an interview, or a conversation with a colleague who asks why this approach, "the model wrote it" is not an answer that survives contact with anyone technical.

There is also a fourth, less obvious one that this track will make concrete: **you cannot hand off what you cannot read.** Code that only one person can maintain is a liability that appears on a balance sheet the day that person leaves. If you built it and you cannot read it, you are that person.

By the end of this phase you will have written an honest position statement: where your current workflow sits on a spectrum, which specific tasks you will hand to a model without hesitation, which ones you will read line by line, and which ones you will not use a model for at all. That last category is the one most people leave empty, and it is the one that proves you have thought about it.

## Estimated time

**1 week** at 1–2 hours a day, 5 days a week. Roughly 6–8 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | An honest definition, and the two ways the word is used | 1h |
| 2 | What genuinely gets easier — with your own examples, not the marketing ones | 1.5h |
| 3 | What only appears easier, and why the failures look like success | 1.5h |
| 4 | The spectrum from autocomplete to autonomous agent, and where you are | 1.5h |
| 5 | Writing your position statement | 1.5h |

If you only have two hours this week, do tasks 2, 5 and 11. Those give you the failure taxonomy, an honest self-assessment, and the written position — which is the phase.

## Skills you'll gain

- Define vibecoding precisely, and name the two incompatible senses the word carries.
- Distinguish work that becomes genuinely faster from work that only appears to.
- Explain why AI-assisted failures characteristically look like success rather than like errors.
- Place a workflow on the spectrum from autocomplete through chat-assisted to autonomous agent.
- State the ownership argument for reading code, in its four practical forms.
- Identify tasks where using a model is the wrong choice even when it would work.
- Write a position statement that names what you will not delegate, and why.

## Specific topics to learn

- **The two senses of "vibecoding"** — a workflow description, versus a claim about rigour.
- **The real-easier list** — boilerplate, glue, unfamiliar-API drafts, translation, test scaffolding, error explanation.
- **The appears-easier list** — invented APIs, plausible-but-wrong logic, silent edge-case failures, tests written to match code.
- **Why failures look like success** — fluency is not correctness, and format is not semantics.
- **The ownership argument** — debug, extend, defend, hand off.
- **The autonomy spectrum** — completion, chat-assisted, inline edit, agentic, autonomous; and what changes at each step.
- **The cost that transfers** — how reviewing generated code differs from writing code, and why it is a skill rather than a fallback.
- **Volatility in this track** — which claims here will date and which will not.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Any AI coding tool you already use | The subject of the analysis, not a thing to install | Free tier is sufficient | — | Tasks 2, 3, 5 | A local coding model, or a free hosted tier |
| A text editor | Reading code deliberately, which is the skill | Free | https://code.visualstudio.com | Tasks 4, 6 | Any editor you already have |
| Git | Version control, used from Phase 7 as a safety net | Free | https://git-scm.com | Task 11 | — |
| GitHub account | Where your position statement and portfolio will live | Free | https://github.com | Task 11 | GitLab, Codeberg |
| arXiv (Codex paper) | The primary source for the HumanEval figures in task 10 | Free | https://arxiv.org/abs/2107.03374 | Task 10 | — |

**Deliberately no tool recommendation.** This phase analyses a workflow rather than teaching a product, and the track is written so that every practice task works on a free tier or a local model. If a tool name appears here it is an example of a category.

## Free/cheap resources

- **Evaluating Large Language Models Trained on Code (Codex)** — https://arxiv.org/abs/2107.03374 — the HumanEval paper. Read the abstract; it documents the "difficulty binding operations to variables" limitation directly, which is the mechanism behind invented APIs.
- **Foundations, Prompting and Agents tracks** — in this repository — the prerequisites. This track applies material taught there rather than introducing new model theory.
- **Prompting Phase 1 (specification)** — in this repository — the same skill as Phase 2 of this track, seen from the prompt-design angle.
- **Agents Phase 5 (context)** — in this repository — the groundwork for Phase 6 here.
- **shared/study-rules.md** — in this repository — the anti-burnout rules. Worth re-reading before a practice-heavy track.

## Lesson: Two Words Wearing One Coat

### Part 1 — Two words wearing one coat

Ask five people what vibecoding means and you will get two incompatible answers.

**Sense one, the workflow description.** Building software by describing what you want in natural language and iterating on the output. Under this sense vibecoding is a *technique*, and it is neutral: it says nothing about quality, in the same way that "using an IDE" says nothing about quality. A senior engineer who reads every line, tests it, and commits carefully is vibecoding. So is someone pasting errors into a chat window until the tests go green.

**Sense two, the rigour claim.** Vibecoding as *not really looking*, shipping what came out because it seemed to work. This is where the word becomes an insult, and it is the sense that gives us the popular image: a weekend, a prompt, an app, no understanding.

Both senses are in circulation and people switch between them mid-conversation, which is why arguments about vibecoding go nowhere. Someone defends sense one, someone attacks sense two, and both are right about a different thing.

**This track uses sense one and is aimed squarely at the failure mode in sense two.** The discipline being taught is how to vibecode without drifting into the thing the word is used as an insult for. That drift is not a moral failing; it is the default outcome of a workflow where the output is fluent, immediate, and plausible. You have to actively resist it, and this track is the resistance.

### Part 2 — What genuinely gets easier

Be specific here, because vague enthusiasm is how people end up unable to say what the tool actually bought them.

| Task | Why the model helps | What you still own |
|---|---|---|
| Boilerplate and scaffolding | It is memorised, not reasoned | Knowing which scaffold fits |
| Glue code between two APIs | It has read both sets of docs | Verifying both APIs still look like that |
| First draft against an unfamiliar library | Removes the blank page | Reading it, because first drafts are wrong |
| Translating a known algorithm between languages | The logic is already settled | The language's idioms and traps |
| Writing a test you can already describe precisely | The shape is decided | Whether the assertion tests what matters |
| Explaining an unfamiliar error | Fast orientation to a strange message | Whether the explanation fits *your* case |
| Naming things | Genuinely tedious, genuinely helped | Whether the name is honest about behaviour |
| Mechanical refactors across many sites | Repetition is what it is good at | That behaviour did not change |

The pattern in the right-hand column is not accidental. **The model is fast at the parts you could have looked up, and it returns the time to you for the parts that require judgement.** That is a real trade and a good one, provided you actually spend the returned time on judgement rather than declaring victory.

### Part 3 — What only appears easier

This is the taxonomy that matters, and every entry shares one property: **the failure is not visible at the moment of production.**

**Invented APIs.** The model generates a call to a method that does not exist, with a plausible name, in a plausible namespace, with plausible arguments. It is not lying and it is not malfunctioning; it is completing a pattern, and the pattern of "how a library like this would expose this operation" is very strong. The code reads perfectly. It fails at runtime, or at review, or in front of a user.

This is not a rare curiosity. The original Codex paper documented the limitation directly: the model struggled with *"binding operations to variables"* and with docstrings describing long chains of operations ([arXiv:2107.03374](https://arxiv.org/abs/2107.03374)). Modern models are far better and still do it. Phase 3 makes verifying an API's existence a concrete, mechanical habit.

**Plausible-but-wrong logic.** An off-by-one that is off in the direction the tests do not cover. A comparison that should be inclusive. A loop that handles the empty case by returning the wrong kind of nothing. The code is syntactically perfect, stylistically clean, and wrong in a way you will discover from a bug report.

**Silent edge-case failure.** The model solves the case you described. It was not asked about the case you did not describe, and it will not raise the question. You get a function that is correct for the input in front of you and undefined for the input a real user will supply. This is the most dangerous entry, because it survives every casual test.

**Tests written to match the code.** If you ask a model to write code and then to write tests for it, you get tests that assert what the code currently does — including its bugs. Green tests then *certify* the defect. Phase 4 is entirely about this, and it is the single most counterintuitive phase in the track.

**Confident wrongness.** The model does not hedge the way a knowledgeable colleague does. It does not say "I think this method might be called..." — it writes the call. Human uncertainty signals are absent, so you have to supply the scepticism that fluency would otherwise earn.

**⚠️ Volatile, dated: as of 2026-09, the specific failure rates and the specific tools change quickly, and the ranking above is a teaching structure rather than a measured ordering.** Treat the *categories* as durable — they follow from how the models work — and re-check any *number* you see quoted, including in this track. The categories have outlived several generations of model and are the part worth memorising.

### Part 4 — Why the failures look like success

Step back, because there is a single mechanism under all of Part 3, and understanding it is worth more than memorising the list.

**The model is optimised to produce text that is likely, and likely-looking code is not the same as correct code.** A function that calls `client.fetch_document(id)` is *more likely* text than one that calls `client.get_document(doc_id, timeout=30)`, because the first is the shape you see in documentation, tutorials and examples. Correctness requires facts about the actual library, the actual version, the actual runtime. Likelihood requires only the shape.

So the model is doing exactly what it was trained to do, and the output is fluent for the same reason it is fluent about everything else. **Fluency is a property of the text, not of the program.** Two consequences:

1. **Your existing instinct for "this looks right" is miscalibrated here.** You learned that heuristic by reading code written by people who understood it. It is not useless, but it is weaker than you expect, and it fails hardest exactly where you most need it.
2. **The checks that work are the ones that touch reality.** Does the method exist? Does the test fail when the logic is wrong? Does the code behave correctly on input nobody described? Every one of those is a question you answer by *running* something, not by reading. That is why this track is practice-heavy and why the phases that follow are mostly about verification.

### Part 5 — The ownership argument, in four parts

"Code you cannot read is code you cannot own" sounds like a principle. It is actually four specific, practical claims, and they are worth separating because they fail differently.

**Debug.** When something breaks you will be reading this code under pressure: a user affected, a deadline, possibly production. You cannot instrument what you do not understand, and you cannot tell a real clue from a coincidence. Every hour you did not spend reading is paid back here with interest.

**Extend.** The next feature has to fit the existing shape. If the shape is opaque, your options are to rewrite it (losing whatever worked), or to bolt on something that fights it. Both are more expensive than the reading would have been, and the cost arrives later, which is why it is easy to defer.

**Defend.** In a review, an interview, or a conversation with a colleague, someone will ask *why this approach*. "The model wrote it" is not an answer that survives thirty seconds of follow-up. The ability to explain a design decision is what distinguishes an engineer from an operator, and it is not something you can retrofit after the fact.

**Hand off.** Code that only its author can maintain is worth less than code anyone can maintain. If you generated it and cannot read it, the bus factor is one and you are the one. This matters most in exactly the situations you care about — a job, a team, an open-source project with contributors.

**⚠️ The honest counterargument, and why it does not win.** There is a real case that not all code needs to be understood: throwaway scripts, generated migrations, protobuf stubs, vendored dependencies. That is correct, and it has a boundary — **you must still be able to say what the code does and what happens when it fails.** "I cannot read it but I know it deletes rows older than 30 days and fails safely" is ownership without line-by-line comprehension, and it is legitimate. "I cannot read it and I do not know what it does" is not a smaller version of the same thing; it is a different thing. The line is not *have you read every line*, it is **can you describe its behaviour and its failure modes**.

### Part 6 — The autonomy spectrum, and where you are

"Vibecoding" covers a wide range of workflows that fail in different ways. Placing yourself on this spectrum is the practical output of this phase, because the review discipline you need depends on which rung you are on.

| Level | What you do | What you must review | Typical failure |
|---|---|---|---|
| 1. Completion | Accept or reject a suggestion inline | The line, in context | Subtly wrong in a way that compiles |
| 2. Chat-assisted | Ask for a function, paste it in | The whole function, then run it | Invented API, wrong edge case |
| 3. Inline edit | Describe a change to selected code | The diff | Silently changed something unrelated |
| 4. Agentic, bounded | Give a task, review the diff | The diff, plus anything it touched you did not ask about | Scope creep beyond the request |
| 5. Autonomous | Give a goal, come back later | Everything, and you should assume less was verified than claimed | Unverified summary; work that looks complete |

Two things to notice. **Each step down the table moves work from "produce" to "review"**, and reviewing is a different skill from writing — you are looking for the absence of something rather than composing it, which is harder. And **the failure mode changes shape at each level**, so a habit that protects you at level 2 (read the function) does not protect you at level 4 (read the diff and check the untouched files).

Be honest about your level in the deliverable. Most people who say "I use AI to code" are at 2 or 3 and describe themselves as 4, and the gap is where the surprises live.

### Part 7 — What this track will not teach you

Worth stating plainly, because a track about a hyped practice should be explicit about its boundaries.

**It will not teach you to program.** If you cannot yet read a function and say what it does, this track has nothing to build on. That is not gatekeeping; every phase here is an exercise in *reading critically*, and there is no version of that which works without reading.

**It will not make you tool-specific.** Tool names appear as examples and always with a free alternative named. The discipline is model-independent by design, because the tools will be unrecognisable in three years and the four ownership claims in Part 5 will not have changed.

**It will not tell you the tools are bad.** Some of this track's most direct advice is to use the model *more* — for boilerplate, for translation, for the first draft of something unfamiliar. Refusing useful help is not rigour.

**⚠️ Volatile, dated: as of 2026-09, which tool is best, what a free tier includes, and how much a coding agent can do unsupervised are all moving quickly.** This track dates and flags every such claim and no conclusion depends on one. If you find a statement here that reads as a tool recommendation, treat it as an example of a category rather than advice to install that thing.

## Hands-on practice tasks

1. Write down your own definition of vibecoding in two sentences, without using the words "AI", "magic", "just", or "simply". Then find one sentence in Part 1 you disagreed with and write why. Having a position you can articulate is the prerequisite for the rest of this track. <!-- id: vb-01-what-vibecoding-is-t01 band: quick energy: low -->
2. Take the last five things you asked a model to write for you. For each, classify it: boilerplate, glue, unfamiliar-API draft, translation, test scaffolding, or something that required judgement. Then count how many you actually read before using. Most people are surprised by the second number. <!-- id: vb-01-what-vibecoding-is-t02 band: focused energy: normal -->
3. Deliberately produce an invented-API failure. Ask a model for code using a library you know well, and look for a call to something that does not exist — a plausible method name, a wrong argument order, a parameter that is not real. If the first attempt comes back clean, ask for something more obscure. The goal is to see the failure for yourself rather than reading about it, so that you recognise the *feeling* of plausible wrongness. <!-- id: vb-01-what-vibecoding-is-t03 band: focused energy: normal -->
4. Write a function that is wrong in a way tests would not catch by default: a boundary that is off, or an empty-input case that returns the wrong kind of nothing. Then write the test that *does* catch it. This is the concrete form of "failures look like success", and it sets up Phase 4. <!-- id: vb-01-what-vibecoding-is-t04 band: focused energy: high -->
5. Ask a model to write a function and then ask it to write tests for that function. Run them. They will very likely pass. Then deliberately introduce a bug into the function, run the tests again, and record whether they still pass. This demonstration is the entire premise of Phase 4, and doing it once yourself is worth more than being told. <!-- id: vb-01-what-vibecoding-is-t05 band: focused energy: normal -->
6. Take a piece of code you generated and cannot fully explain. Spend twenty minutes reading it with the explicit goal of being able to describe its behaviour and failure modes in three sentences. Record how far you got. This is the skill the whole track trains, and it is useful to have a baseline. <!-- id: vb-01-what-vibecoding-is-t06 band: focused energy: normal -->
7. List three tasks from your own work where you would genuinely refuse to use a model even though it would probably succeed. For each, write the reason. Common honest answers: security-sensitive code, anything touching money, anything you would have to defend in an interview. An empty list means you have not thought about it yet. <!-- id: vb-01-what-vibecoding-is-t07 band: focused energy: normal -->
8. Place yourself on the autonomy spectrum in Part 6. Then find one concrete instance where you operated one rung lower than you described, and one where you operated one rung higher and it caused a problem. The overestimate is the useful one. <!-- id: vb-01-what-vibecoding-is-t08 band: focused energy: normal -->
9. Find a public claim about AI coding productivity — a blog post, a vendor page, a talk. Identify what is being measured (lines? tasks? a benchmark?) and what is being claimed. Almost every such claim conflates production with correctness. Record the specific slippage. <!-- id: vb-01-what-vibecoding-is-t09 band: deep energy: high -->
10. Read the Codex paper's abstract at [arXiv:2107.03374](https://arxiv.org/abs/2107.03374) and note two things: the reported solve rate, and the rate achieved with 100 samples per problem. Explain in your own words why the second number is much higher, and what that tells you about how the model fails. <!-- id: vb-01-what-vibecoding-is-t10 band: focused energy: normal -->
11. Write your position statement as `portfolio/vibecoding/01-what-vibecoding-is.md`. It must contain: your definition, your step on the spectrum with evidence, three tasks you delegate freely, three you read line by line, three you will not delegate, and one sentence on what you would need to see to change your mind. The last item is what makes it a position rather than a preference. <!-- id: vb-01-what-vibecoding-is-t11 band: deep energy: high -->
12. Set a calendar reminder for 90 days from now. Set it to re-read your position statement. These judgements are calibrated against tools that will have moved, and the useful question later is not whether you were right but which specific belief changed. <!-- id: vb-01-what-vibecoding-is-t12 band: quick energy: low -->

## Common Pitfalls

**Treating this phase as motivational rather than analytical.** The temptation is to read Part 2, feel good, and skip Part 3. The lists in Part 3 are the operative content; Part 2 is context for them. If you remember only one thing, it should be that invented APIs and tests-that-certify-bugs are the two failures that will actually cost you.

**Confusing "I can read it" with "I read it".** Fluency creates a strong illusion of comprehension. You can read a function top to bottom, feel you followed it, and still not be able to state what it does on empty input. The test is production, not recognition: **can you describe its behaviour and its failure modes?** If not, you have recognised the code, not read it.

**Concluding that generated code should be distrusted uniformly.** It should not. Most generated code is fine, and treating all of it as suspect makes you slow without making you safe. The discipline is **targeted**: verify what is cheap to verify and expensive to get wrong — API existence, edge cases, anything touching data or money — and skim the rest.

**Assuming the failure modes in Part 3 are things you will notice.** They are specifically constructed to not be noticed. That is the entire point of "failures look like success", and if you finish this phase thinking you would have caught them, you have missed the mechanism in Part 4.

**Taking the autonomy spectrum as a ladder to climb.** Higher is not better. Level 5 is not "more advanced" than level 2; it is a different trade with a much worse failure mode when it goes wrong. The right level depends on the task, and choosing a *lower* level for security-sensitive work is a sign of judgement rather than timidity.

**Reading the volatility warning as boilerplate.** It is not. This is the most volatile track in the curriculum, and the warning appears here to establish a habit: when you see a dated claim in a later phase, that date is load-bearing. It tells you how much to trust the specific number and where to go to re-check.

## Deliverable / proof of work

- `portfolio/vibecoding/01-what-vibecoding-is.md`, containing:
  - your definition of vibecoding, in your own words, without hedging
  - your position on the autonomy spectrum, with a concrete example as evidence
  - three tasks you delegate to a model freely, and why each is safe
  - three tasks you read line by line, and what specifically you are checking for
  - three tasks you will not delegate, with the reason for each
  - the results of task 5 (whether the tests still passed after you broke the code)
  - one sentence on what would change your mind
- The buggy function and its test from task 4, kept in your notes — you will reuse it in Phase 4.

## Checklist

- [ ] I can define vibecoding without either selling or dismissing it <!-- id: vb-01-what-vibecoding-is-c01 energy: low -->
- [ ] I can name the two incompatible senses of the word and why arguments about it go nowhere <!-- id: vb-01-what-vibecoding-is-c02 energy: normal -->
- [ ] I can list five tasks that genuinely get easier and say what I still own in each <!-- id: vb-01-what-vibecoding-is-c03 energy: normal -->
- [ ] I can name the four failure categories that only appear easier <!-- id: vb-01-what-vibecoding-is-c04 energy: normal -->
- [ ] I can explain why invented APIs are a consequence of how the model works rather than a bug in it <!-- id: vb-01-what-vibecoding-is-c05 energy: normal -->
- [ ] I can state the four practical forms of the ownership argument <!-- id: vb-01-what-vibecoding-is-c06 energy: normal -->
- [ ] I can place my own workflow on the autonomy spectrum with a concrete example <!-- id: vb-01-what-vibecoding-is-c07 energy: low -->
- [ ] I have personally produced a test that certified a deliberate bug <!-- id: vb-01-what-vibecoding-is-c08 energy: normal -->
- [ ] I have written three tasks I will not delegate, with reasons <!-- id: vb-01-what-vibecoding-is-c09 energy: low -->
- [ ] I understand that "can you describe its behaviour and failure modes" is the real bar, not "I read every line" <!-- id: vb-01-what-vibecoding-is-c10 energy: low -->
- [ ] I know which claims in this track are volatile and which are durable <!-- id: vb-01-what-vibecoding-is-c11 energy: low -->

## Quiz

### Q1. A model gives you a function that calls `client.fetch_document(id)`. The code reads cleanly. What is the most likely reason to distrust it? <!-- id: vb-01-what-vibecoding-is-q01 energy: high -->

- [x] The method may not exist — plausible-looking calls are what the model is optimised to produce
- [ ] The function is probably too short to be correct
- [ ] Cleanly formatted code is usually generated rather than written
- [ ] The argument count is unusual for a fetch operation

**Why:** Invented APIs are the archetypal failure in Part 3, and Part 4 explains the mechanism: the model produces *likely* text, and a call shaped like the documentation is more likely than the call that matches your actual library version. Length and formatting tell you nothing about correctness — that is precisely why these failures look like success.

### Q2. You ask a model to write a function, then ask it to write tests for that function. The tests pass. What have you actually learned? <!-- id: vb-01-what-vibecoding-is-q02 energy: normal -->

- [ ] The function is correct, since independent tests were written
- [ ] The function is correct for the cases the model thought of
- [x] Very little — the tests assert what the code does, including any bugs it has
- [ ] The function compiles and runs without raising an exception

**Why:** Tests written after code, by the same system, are derived from the code rather than from a specification. They certify current behaviour, not intended behaviour. Green tests then make a defect look confirmed, which is why Phase 4 treats test-first as a discipline rather than a preference. Option 2 sounds careful but is still wrong: the tests were not written against a stated contract.

### Q3. Which task does this phase claim is genuinely, not deceptively, made easier by a model? <!-- id: vb-01-what-vibecoding-is-q03 energy: normal -->

- [ ] Deciding which of two architectures will scale
- [ ] Determining whether a design is secure
- [x] Writing glue code between two APIs whose documentation the model has read
- [ ] Establishing what the acceptance criteria should be

**Why:** The pattern from Part 2 is that the model is fast at *the parts you could have looked up*, and returns your time for the parts requiring judgement. Glue code between documented APIs is squarely in the first category. Architecture, security and acceptance criteria are all judgement, and none of them becomes easier merely because generation is fast.

### Q4. A colleague says they vibecode. Which question best distinguishes a disciplined workflow from a risky one? <!-- id: vb-01-what-vibecoding-is-q04 energy: normal -->

- [ ] Which model and tool they use
- [ ] How many lines per day they produce
- [ ] Whether they write tests at all
- [x] Whether they can describe what the generated code does and how it fails

**Why:** This is the practical form of the ownership argument from Part 5. Tool choice and output volume say nothing about whether the code is understood, and "writes tests" is answered by Q2's trap. The stated bar is behaviour and failure modes — which is a weaker requirement than reading every line but a much stronger one than having it work once.

### Q5. Why does this phase argue that fluency makes generated code harder to review than code written by a careful human? <!-- id: vb-01-what-vibecoding-is-q05 energy: high -->

- [ ] Generated code is longer and therefore slower to read
- [x] Your "this looks right" instinct was trained on code written by people who understood it
- [ ] Generated code omits comments that would explain its intent
- [ ] Reviewing requires different tools than writing

**Why:** Part 4 makes this the second consequence of the likelihood mechanism. The heuristic you built by reading competent human code is real but miscalibrated here, and it fails hardest exactly where correctness matters most — because the model's output is fluent about everything, including the parts it invented.

### Q6. On the autonomy spectrum, what is the main reason a lower level can be the better choice for security-sensitive work? <!-- id: vb-01-what-vibecoding-is-q06 energy: normal -->

- [ ] Lower levels produce fewer lines of code to review
- [ ] Higher levels cannot access the files needed for security work
- [x] The failure mode changes shape at each level, and reviewing a summary is weaker than reading a diff
- [ ] Lower levels are faster, so mistakes are found sooner

**Why:** Part 6's second observation is that each step moves work from producing to reviewing, and the failure mode changes with it. At level 5 you are trusting a summary of what was done — and the phase is explicit that you should assume less was verified than claimed. This is a trade about verification strength, not about speed or capability.

## You're ready to move on when...

You can state the track's thesis from memory, name the four failure categories that only appear easier, and explain in two sentences why those failures are invisible at the moment of production. You have personally reproduced a test that certified a deliberate bug. You have written a position statement naming at least three tasks you will not delegate, with a reason for each, and you are honest about your rung on the autonomy spectrum rather than describing the rung you aspire to.

## Free vs Paid

### Free path

Everything in this phase is free, and deliberately so — it is analysis you do with a text editor and one browser tab. The Codex paper is on arXiv at no cost, and every practice task uses a free coding tool or a local model. The test-certifies-a-bug demonstration (task 5) needs only a free tier and five minutes.

### Paid path

There is nothing to buy here. A paid coding tool would change which specific failures you encounter first, since stronger models invent fewer APIs and hold longer context — but the *categories* in Part 3 are the same, and they follow from how the models work rather than from how good they are. Paying for the analysis phase would buy you nothing.

### Where the money genuinely matters

It matters from Phase 6 onward, and the track says so honestly. Long agentic runs consume context and quota quickly, free tiers are rate-limited, and the strongest coding agents are paid. What a $0 budget costs you is not the craft — specification, review, test-first, debugging method and context discipline are all free habits — but **headroom**, and headroom is what makes Phase 7's long agent runs comfortable rather than tense. On a free tier the discipline becomes more important rather than less, because an undisciplined workflow runs out of quota before it runs out of task.
