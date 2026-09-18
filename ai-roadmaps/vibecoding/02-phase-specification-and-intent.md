---
id: vb-02-specification-and-intent
track: vibecoding
phase: 2
order: 11
title: Specification and Intent
duration: 1 week
duration_weeks: 1
energy_mix: [normal, high]
deliverable: portfolio/vibecoding/02-specification-and-intent.md
exit_criteria: >
  You can convert a vague wish into an executable brief containing a goal, explicit
  constraints, non-goals, acceptance criteria and a stated interface, without
  writing the implementation. You can identify which parts of an underspecified
  request a model will silently guess at, and you can say why non-goals are the
  section that prevents the most wasted work. You have rewritten one of your own
  real requests as a brief and observed the difference in output.
---

# Phase 2 — Specification and Intent

## Goal of this phase

This phase teaches the bottleneck the tools did not remove: **you cannot get a correct program out of an incorrect description of what you want.**

Generation is cheap now. Deciding what to generate is not, and the entire cost of a misunderstanding has moved to a place where it is harder to see. When a human colleague misreads a vague request, they ask a question — usually within the hour. When a model misreads one, it produces four hundred confident lines that answer the question it inferred, and it does not mention that it inferred anything. You find out days later, when the behaviour is wrong in a way that looks like a bug rather than a misunderstanding.

The research is unusually direct on this. Ambig-SWE, an underspecified variant of SWE-Bench Verified, found that models **"struggle to distinguish between well-specified and underspecified instructions"** — they do not reliably know when they have been told enough. The same work found that when models *are* allowed to ask clarifying questions, performance improves **"up to 74% over the non-interactive settings"** ([arXiv:2502.13069](https://arxiv.org/abs/2502.13069), accepted at ICLR 2026). Read that pair together and the implication is uncomfortable: the information the model needs usually exists, the model usually will not ask for it, and supplying it in advance is worth more than any prompting trick in this curriculum.

So the skill is not "write better prompts" in the sense of magic words. It is **writing a specification** — the same artefact a careful engineer would have written for a human contractor, for the same reason.

The organising structure is a five-part brief:

1. **Goal** — what must be true when this works, in behavioural terms.
2. **Constraints** — the boundaries: language, dependencies, performance, style, what must not change.
3. **Non-goals** — what this explicitly does *not* do. This is the part everyone omits and the part that saves the most work.
4. **Acceptance criteria** — how you will know it is done, stated so that each item can be checked by running something.
5. **Interface** — the shape of the thing: function signature, endpoint, file layout, data structure.

Notice what is absent: **no implementation.** A brief describes the destination, not the route. If you specify the implementation, you have written the program and the model is now a typist — which is a legitimate thing to want, but it is not this phase, and it throws away the model's actual advantage.

By the end you will have rewritten one of your own real requests as a brief, run both versions, and compared them. That comparison is the deliverable, because the argument for specification is empirical and you should see it rather than take it on faith.

## Estimated time

**1 week** at 1–2 hours a day, 5 days a week. Roughly 7–9 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Why specification is the bottleneck, and what the model actually guesses | 1.5h |
| 2 | Goal and acceptance criteria — the two that must be checkable | 1.5h |
| 3 | Constraints and interface | 1.5h |
| 4 | Non-goals, and the failure modes they prevent | 1.5h |
| 5 | Rewriting a real request, running both, and writing up the difference | 2h |

If you only have two hours this week, do tasks 3, 7 and 12. Those give you the guess-detection habit, one written brief, and the A/B comparison that is the point.

## Skills you'll gain

- Convert a vague request into a five-part brief without specifying the implementation.
- Write acceptance criteria that can each be checked by running something.
- Predict which parts of an underspecified request a model will silently invent.
- Use non-goals to bound scope before the work starts rather than after.
- State an interface precisely enough that two different implementations would both satisfy it.
- Recognise the request shapes that reliably produce the wrong thing.
- Run a like-for-like comparison between a vague request and a brief, and judge it honestly.

## Specific topics to learn

- **Why generation is not the bottleneck** — the constraint moved to specification.
- **Silent inference** — models do not know when they lack information, and do not reliably say so.
- **The five-part brief** — goal, constraints, non-goals, acceptance criteria, interface.
- **Behavioural goals versus implementation goals** — describing *what*, not *how*.
- **Checkable acceptance criteria** — each one runnable, none of them adjectives.
- **Non-goals as scope control** — the cheapest anti-scope-creep tool available.
- **The interface as a contract** — pinning the boundary while leaving the inside free.
- **Request shapes that fail** — "make it better", "add auth", "fix the bug", "like Twitter but...".
- **When to specify the implementation anyway** — and why that is a different activity.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| A text editor | Writing briefs as files, which is the point | Free | https://code.visualstudio.com | Tasks 5, 12 | Any editor you have |
| Any AI coding tool | Producing output to compare against the brief | Free tier sufficient | — | Tasks 7, 8, 12 | A local coding model |
| Git | Diffing the two versions from task 12 | Free | https://git-scm.com | Task 12 | — |
| Ambig-SWE paper | The primary source for the underspecification findings | Free | https://arxiv.org/abs/2502.13069 | Task 10 | — |

## Free/cheap resources

- **Ambig-SWE: Interactive Agents to Overcome Underspecificity in Software Engineering** — https://arxiv.org/abs/2502.13069 — the empirical case for this phase. The abstract alone is worth reading: models struggle to tell specified from underspecified, and interaction improves results by up to 74%.
- **Prompting Phase 1 (specification)** — in this repository — the same skill from the prompting angle, with more on instruction structure.
- **Prompting Phase 4 (structured output)** — in this repository — useful when the interface you are pinning is a data shape.
- **Agents Phase 3 (the agent loop)** — in this repository — what happens to a brief once an agent is executing it unattended.
- **shared/study-rules.md** — in this repository — the habit rules, relevant because brief-writing is easy to skip when you are in a hurry and that is exactly when it pays.

## Lesson: What the Model Guesses, and Why It Never Says So

### Part 1 — The bottleneck moved, and it moved somewhere harder

There is a version of the AI-coding story in which the hard part was always typing, and now typing is solved. That version is wrong in a specific and consequential way.

Consider what a colleague does when you give them an underspecified task. They get a little way in, hit a decision you did not make, and **ask**. The friction is immediate and cheap. The question arrives while you still remember the context, before any work has been built on the wrong assumption.

A model does something different. It hits the same decision, and — absent information — it makes the most *likely* choice. Not a random one. The choice that the majority of similar code in its training data made. Then it continues, on that foundation, for four hundred lines, and presents the result with no marker where the inference happened.

That is the mechanism behind the Ambig-SWE finding that models "struggle to distinguish between well-specified and underspecified instructions" ([arXiv:2502.13069](https://arxiv.org/abs/2502.13069)). **Detecting that you lack information is a different capability from generating plausible output**, and the second one is strong enough to paper over the first. The model is not withholding a question it knows it should ask. It frequently does not register that there was a question at all.

The consequence for you: **the cost of an ambiguity is no longer paid at the point of ambiguity.** It is paid at the end, as rework, and it arrives disguised as a bug. You will spend an afternoon debugging logic that is working perfectly and implementing the wrong thing.

### Part 2 — The five parts of a brief

The structure below is not a template to fill in mechanically. Each part exists because omitting it produces a specific, predictable failure.

**1. Goal.** What must be true when this works. Stated behaviourally: "given a list of transactions, it produces a monthly total per category" rather than "it processes transactions". The test is that someone could disagree with your goal — if it is so vague that nobody could object, it is not yet a goal.

**2. Constraints.** The boundaries that are not negotiable. Language and version. Which dependencies are allowed, and which are banned. Performance floor. Style rules that exist for reasons. Anything immutable: "the existing database schema cannot change", "this must run in the browser with no server". Constraints are where you spend a little of your own judgement to save the model a lot of guessing.

A specific constraint worth naming: **"no new dependencies without asking."** Models reach for libraries — it is the shape of most training data — and a brief that does not bound this will acquire a dependency tree you did not choose and cannot easily review.

**3. Non-goals.** The section everyone omits. See Part 4; it earns its own discussion.

**4. Acceptance criteria.** How you will know it is done. The rule is strict and worth enforcing: **each criterion must be checkable by running something.** "Handles errors gracefully" is not a criterion. "Returns a 400 with a JSON body containing an `error` key when `amount` is missing" is. "Fast" is not. "Responds in under 200ms on a list of 1,000 items on my machine" is.

Three or four criteria is usually right. If you have fifteen, you have written a test suite, which is Phase 4's business, not this one's.

**5. Interface.** The shape of the boundary: function signature, HTTP endpoint and payload, file and module layout, the type of what goes in and comes out. This is the part that feels optional and is not. An interface is the difference between "write me a function that does X" and "write me a function with this signature that does X" — and the second constrains the *inside* far less than you would expect while removing an entire class of mismatch.

**What is absent, deliberately: the implementation.** A brief says where you are going, not how to drive. Specify the implementation and you have written the program; the model becomes a typist. That is sometimes exactly right — a mechanical refactor, a known algorithm in an unfamiliar language — but it is a different activity, and pretending it is the same one is how people conclude that models "cannot really code" when what happened is that they were never given room to.

### Part 3 — A worked example

Vague request, of the kind almost everyone actually types:

> Fix the login so it's more secure.

Watch what is unspecified. *More secure* against what — credential stuffing, session hijacking, password reuse, brute force? *Fix* by changing what — hashing, rate limiting, session lifetime, token storage? Which login — there may be three? Is the existing behaviour a constraint or fair game? What must not break — the API contract, existing sessions, the mobile client?

Four hundred lines later you have a rewritten auth flow that added rate limiting you did not want, changed your session lifetime and logged out every user, and did not touch the password hashing you were actually worried about. Nothing here is the model's fault. Every one of those decisions was a guess, and each was a reasonable guess.

The same request as a brief:

```text
GOAL
  Password authentication rejects brute-force attempts without locking out
  legitimate users who mistype.

CONSTRAINTS
  - Python 3.12, existing FastAPI app, no new dependencies without asking
  - The POST /auth/login request and response shapes must not change
  - Existing valid sessions must keep working
  - Do not modify password hashing; it was reviewed separately

NON-GOALS
  - Multi-factor authentication
  - Password reset flow
  - OAuth or social login
  - Any change to the user model or database schema

ACCEPTANCE CRITERIA
  1. Ten failed attempts for one username within 60 seconds returns HTTP 429
     with a Retry-After header
  2. A successful attempt resets that username's failure counter
  3. A failed attempt for a username that does not exist returns the same
     response body and status as a failed attempt for one that does
  4. Existing tests in tests/test_auth.py all still pass

INTERFACE
  No new public endpoints. Internal helper in app/auth.py:
      def record_failure(username: str, now: datetime) -> bool
  Returns True when the caller should be rejected.
```

Read the brief and notice what it still does not say: nothing about where the counter is stored, nothing about the data structure, nothing about the algorithm. Those are the model's to choose, and there are several good answers. **The brief fixes the destination and the boundary, and leaves the interior free.**

Also notice criterion 3. That one line encodes a real security requirement — user enumeration — that the vague version would never have surfaced, because it is a thing you know and did not think to say. **Writing criteria is how you discover your own unstated assumptions.**

### Part 4 — Non-goals: the section that saves the most work

Non-goals look like padding. They are the highest-yield part of the brief, for three reasons.

**They stop silent expansion.** Given "add authentication", a model may reasonably deliver authentication, a user model, a migration, a session table, remember-me, and a logout endpoint. Every item is defensible. Together they are three times the review burden and a much larger surface you did not ask to own. A non-goal list converts "reasonable" from a justification into a violation.

**They make the boundary testable.** "It should not do X" is checkable in a way that "it should do Y" often is not, because X is usually concrete: it should not add a dependency, should not change the schema, should not touch the billing module.

**They surface disagreement before work starts.** If you write "non-goal: multi-factor authentication" and your actual goal was a system that will need MFA next quarter, you have just found an architectural constraint — cheaply, in a sentence, instead of expensively, after building on a foundation that cannot support it.

A usable non-goal is **specific and near the boundary**. "Non-goal: rewrite the whole app" is theatre. "Non-goal: no changes to files outside `app/auth.py` and its test file" is a constraint that will actually stop something.

### Part 5 — The request shapes that reliably fail

Certain phrasings produce a wrong answer so dependably that they are worth recognising as smells.

**"Make it better."** Better against what measure? The model will pick one — usually the most common one in similar code — and you will not know which until you look.

**"Add auth."** Auth is a family, not a feature. Which mechanism, which storage, which session model, which failure behaviour? This request reliably produces something plausible and unlike what you wanted.

**"Fix the bug."** With no reproduction, no expected behaviour and no observed behaviour, the model is guessing at all three. The odds of it guessing your bug are low; the odds of it changing something are high. Phase 5 is entirely about this.

**"Like X but for Y."** Borrows a specification that does not exist in your head and cannot exist in the model's. You will get the most memorable features of X, which are usually not the ones you meant.

**"Optimise this."** Optimise for what — speed, memory, readability, cost? These conflict, and the model will silently pick.

**The one-line request with a deadline attached.** Urgency is exactly when the brief matters and exactly when people skip it. The two-hour brief that prevents three days of rework is the highest-leverage writing you will do all week.

### Part 6 — When to specify the implementation anyway

Honesty requires the exception, because a rule without one is a slogan.

Sometimes you *should* specify how, not just what: a mechanical refactor across many files, a known algorithm in a language you know well but type slowly, a change where the approach is the thing under review, anything where you have already decided and want execution rather than options.

In those cases the model is a fast, reliable typist and that is a genuine win. But notice the trade: **you have given up the model's ability to suggest a better approach, and you have taken on the full cost of being wrong about the design.** That is a reasonable trade when you are confident, and an expensive one when you are not. The failure mode is specifying the implementation while believing you are still exploring — you get exactly what you asked for, including the parts that were wrong, and the fluency makes it feel validated.

### Part 7 — Writing the brief is where the thinking happens

The deepest point in this phase is not about models at all.

**Most underspecification is not laziness; it is unexamined thought.** When you cannot write the acceptance criteria, it is usually because you have not decided what "working" means. When the non-goals are hard to name, it is because you have not decided what this is *not*. The brief does not merely communicate a decision you already made — the act of writing it is what forces the decision.

That is why this phase sits before reading code, testing and debugging. Every later phase assumes a stated intent to check against. Phase 3 asks "does this code do what was asked?" and Phase 4 asks "does this test encode the contract?" — both questions are unanswerable if the intent was never written down. **The brief is the thing every other verification in this track measures against**, and without it you are reduced to asking whether the code looks reasonable, which is precisely the judgement Part 4 of Phase 1 explained you cannot trust.

**⚠️ Volatile, dated: as of 2026-09, the specific figures above come from one benchmark (Ambig-SWE) and one model generation.** The *direction* — that supplying missing information in advance outperforms expecting the model to ask — has been stable across generations and follows from how the models are trained. Re-check the number; keep the practice.

## Hands-on practice tasks

1. Take three requests you have actually made to an AI coding tool recently, copy them verbatim, and annotate each with every decision you left unmade. Aim for at least five annotations per request. Most people find eight or more on the first attempt. <!-- id: vb-02-specification-and-intent-t01 band: focused energy: normal -->
2. Write a brief for a task you have already completed, then compare it against what was actually built. The gaps are your unstated assumptions, and they are the most useful thing you will learn this week. <!-- id: vb-02-specification-and-intent-t02 band: focused energy: normal -->
3. Practise writing acceptance criteria that are each checkable by running something. Take five adjectives you would naturally use ("fast", "robust", "secure", "clean", "user-friendly") and convert each into a runnable check. If you cannot, that is the lesson: the adjective was hiding an undecided question. <!-- id: vb-02-specification-and-intent-t03 band: focused energy: normal -->
4. Find a request of the form "like X but for Y" and write the brief it should have been. Pay particular attention to which features of X you actually meant, because the process of naming them is the whole exercise. <!-- id: vb-02-specification-and-intent-t04 band: focused energy: normal -->
5. Write a brief for a small real feature you want, using all five parts, and deliberately leave the implementation unspecified. Then write down two genuinely different implementations that would both satisfy it. If you cannot think of two, your brief has over-specified. <!-- id: vb-02-specification-and-intent-t05 band: focused energy: high -->
6. Write the non-goals list for that same brief, with at least five entries, each specific and near the boundary. Then for each, name the plausible thing a model might have done that this prevents. <!-- id: vb-02-specification-and-intent-t06 band: focused energy: normal -->
7. Take one vague request and run it against a model. Save the output. Do not evaluate it yet — you will compare it in task 12, and pre-judging it will bias you. <!-- id: vb-02-specification-and-intent-t07 band: quick energy: low -->
8. Take the brief from task 5 and run it against the same model. Save the output separately. <!-- id: vb-02-specification-and-intent-t08 band: quick energy: low -->
9. Take a request you have made and deliberately omit one constraint that matters — a dependency limit, a schema freeze, a performance floor. Run it and find where the omission shows up in the output. Discovering that you can *predict* the failure is the skill this task trains. <!-- id: vb-02-specification-and-intent-t09 band: focused energy: normal -->
10. Read the Ambig-SWE abstract at [arXiv:2502.13069](https://arxiv.org/abs/2502.13069). Note two findings: that models struggle to distinguish specified from underspecified instructions, and the reported improvement from interaction. Explain in your own words why the first finding is the more troubling of the two for someone using an agent unattended. <!-- id: vb-02-specification-and-intent-t10 band: focused energy: normal -->
11. Write a reusable brief template as a file in your notes, with all five sections and prompts for what belongs in each. You will use this for every phase in this track and probably for the rest of your career; refining it now is cheap. <!-- id: vb-02-specification-and-intent-t11 band: focused energy: low -->
12. Compare the two outputs from tasks 7 and 8 against the brief's acceptance criteria. Score each criterion as met, unmet, or unverifiable for both versions. Write up the comparison as `portfolio/vibecoding/02-specification-and-intent.md`. **If the brief performed worse, say so and explain why** — an honest negative result here is worth more than a flattering one, and there are real cases where a vague request happens to land on the right answer by luck. <!-- id: vb-02-specification-and-intent-t12 band: deep energy: high -->
13. Write one sentence describing a case where specifying the *implementation* rather than the goal would be the correct choice, and one where it would be a mistake. The distinction is the last idea in this phase. <!-- id: vb-02-specification-and-intent-t13 band: quick energy: low -->

## Common Pitfalls

**Treating the brief as a prompt-engineering trick.** It is not a set of magic words; it is a specification, and its value comes from forcing *you* to decide things. If you fill in the template without thinking, you get the paperwork without the benefit.

**Writing acceptance criteria you cannot run.** "Handles errors gracefully" feels like a criterion and is not. Every item should be answerable by executing something and observing a result. This is the single most common failure in a first brief.

**Over-specifying the implementation and calling it a brief.** If your brief dictates the data structure, the algorithm and the file layout, you have written the program and left the model no room. That is sometimes correct (Part 6) but it is not this phase, and confusing the two is how people conclude the tool is useless.

**Skipping non-goals because they feel negative.** They are the highest-yield section. "Non-goal: no new dependencies" prevents a dependency tree; "non-goal: no changes outside this file" prevents a refactor you did not ask for. A brief with no non-goals will expand.

**Writing a brief for something you have not decided.** If you cannot state the goal, the brief cannot save you — it has revealed that the real task is deciding, which is a different and legitimate piece of work. Do that first.

**Believing the output because it matches the brief's shape.** A model can satisfy your interface, your file layout and your non-goals while getting the behaviour wrong. The brief reduces misunderstanding; it does not verify correctness. That is Phase 3.

**Not comparing against anything.** A brief you never A/B tested is a belief. Task 12 exists because the argument for specification should be something you have seen with your own eyes, including if the result surprises you.

## Deliverable / proof of work

- `portfolio/vibecoding/02-specification-and-intent.md`, containing:
  - your reusable five-part brief template
  - the full brief you wrote in tasks 5–6, for a real feature
  - the annotated vague requests from task 1, with the unstated decisions marked
  - the acceptance criteria from task 3, showing each adjective converted to a runnable check
  - the A/B comparison from task 12: both outputs scored against every criterion, with an honest verdict
  - one sentence on when you would specify the implementation rather than the goal

## Checklist

- [ ] I can explain why generation is not the bottleneck and where the constraint moved <!-- id: vb-02-specification-and-intent-c01 energy: normal -->
- [ ] I can name all five parts of a brief from memory <!-- id: vb-02-specification-and-intent-c02 energy: low -->
- [ ] I can write acceptance criteria that are each checkable by running something <!-- id: vb-02-specification-and-intent-c03 energy: normal -->
- [ ] I can predict which parts of an underspecified request a model will guess at <!-- id: vb-02-specification-and-intent-c04 energy: normal -->
- [ ] I can write non-goals that are specific and near the boundary, not theatrical <!-- id: vb-02-specification-and-intent-c05 energy: normal -->
- [ ] I can state an interface precisely while leaving the implementation open <!-- id: vb-02-specification-and-intent-c06 energy: normal -->
- [ ] I recognise the four request shapes that reliably produce the wrong thing <!-- id: vb-02-specification-and-intent-c07 energy: low -->
- [ ] I have run a like-for-like comparison of a vague request against a brief on a real task <!-- id: vb-02-specification-and-intent-c08 energy: normal -->
- [ ] I understand that writing the brief is where the thinking happens, not merely where it is recorded <!-- id: vb-02-specification-and-intent-c09 energy: low -->
- [ ] I can say when specifying the implementation is the right choice, and what it costs <!-- id: vb-02-specification-and-intent-c10 energy: normal -->

## Quiz

### Q1. Research on underspecified coding instructions found which result that makes specification more important rather than less? <!-- id: vb-02-specification-and-intent-q01 energy: normal -->

- [ ] Models ask too many clarifying questions, wasting the user's time
- [x] Models struggle to distinguish well-specified from underspecified instructions
- [ ] Underspecified instructions produce shorter, safer output
- [ ] Clarifying questions degrade performance compared with guessing

**Why:** Ambig-SWE found models "struggle to distinguish between well-specified and underspecified instructions" ([arXiv:2502.13069](https://arxiv.org/abs/2502.13069)). This is the crux: the model does not reliably know it lacks information, so it cannot warn you. The same work found interaction *improves* results by up to 74%, which is the case for supplying the information yourself.

### Q2. Why does this phase call non-goals the highest-yield part of a brief? <!-- id: vb-02-specification-and-intent-q02 energy: high -->

- [ ] They are the shortest section to write
- [x] They convert reasonable scope expansion into a stated violation, and surface disagreement before work starts
- [ ] They prevent the model from asking clarifying questions
- [ ] They are required by most coding tools' configuration formats

**Why:** Given "add authentication", delivering a user model, a migration and remember-me is defensible; a non-goal makes it a violation. They are also concrete enough to test, and writing them surfaces architectural needs you had not articulated — which is cheaper to discover in a sentence than after building on a foundation that cannot support it.

### Q3. Which of these is a usable acceptance criterion? <!-- id: vb-02-specification-and-intent-q03 energy: normal -->

- [ ] The endpoint should be reasonably fast under load
- [ ] Error handling should be robust and user-friendly
- [x] Ten failed attempts for one username within 60 seconds returns HTTP 429 with a Retry-After header
- [ ] The code should be clean and well organised

**Why:** A criterion has to be checkable by running something and observing a result. The other three are adjectives, and an adjective in an acceptance criterion is usually hiding a decision you have not made — which is the point of task 3, where you convert each one into a runnable check or discover the undecided question underneath.

### Q4. A brief pins the interface and the acceptance criteria but says nothing about storage or algorithm. Why? <!-- id: vb-02-specification-and-intent-q04 energy: normal -->

- [x] A brief fixes the destination and the boundary while leaving the interior free for the model's judgement
- [ ] Because those details do not affect the outcome
- [ ] Because models choose better algorithms than people do
- [ ] Because implementation details cannot be expressed in a brief

**Why:** The phase is explicit that specifying the implementation is a legitimate but *different* activity, in which the model becomes a typist and you take on the full cost of being wrong about the design. Leaving the interior free is what preserves the model's ability to suggest a better approach.

### Q5. A model delivers authentication plus a user model, a migration and remember-me, all working. What does this phase say happened? <!-- id: vb-02-specification-and-intent-q05 energy: normal -->

- [ ] The model exceeded its instructions and should be distrusted
- [ ] The output should be accepted, since everything works
- [ ] The brief was under-specified in its interface section
- [x] Reasonable scope expansion that a non-goal list would have converted into a stated violation

**Why:** Every added item is individually defensible, which is exactly why the non-goal list is the highest-yield section — it turns "reasonable" from a justification into a violation. The cost is a larger review surface and ownership of code you did not ask for, which is a scope problem rather than an interface problem.

### Q6. Why does the phase claim that writing the brief is where the thinking happens? <!-- id: vb-02-specification-and-intent-q06 energy: high -->

- [ ] Because it produces a document you can reuse
- [ ] Because models perform better with longer inputs
- [ ] Because written instructions are processed more reliably than spoken ones
- [x] Most underspecification is unexamined thought, and the brief forces the decisions rather than recording them

**Why:** When a criterion will not go into runnable form or the non-goals are hard to name, the cause is usually an undecided question, not laziness. That is also why this phase precedes the three verification phases: they all measure against stated intent, and there is nothing to measure against if the intent was never decided.

## You're ready to move on when...

You can write a five-part brief for a real feature in under twenty minutes, with acceptance criteria that are each runnable and non-goals that are specific rather than theatrical. You can look at a vague request and name at least five decisions it leaves open. You have run a genuine A/B comparison between a vague request and a brief, scored both against the criteria, and reported the result honestly — including if the vague version did better on some criterion. You can state when you would specify the implementation instead, and what that costs you.

## Free vs Paid

### Free path

Everything here is free. Brief-writing needs a text editor, and the comparison needs any free tier or local coding model. The Ambig-SWE paper is on arXiv at no cost. This is the highest-leverage free phase in the track: it costs time rather than money, and it reduces the quota you burn in later phases by removing iterations that were caused by ambiguity rather than by anything technical.

### Paid path

A paid model gives you two things here. First, **longer effective context**, so a longer brief with more constraints stays coherent — useful when your non-goal list is long or you are briefing against a large existing codebase. Second, **better adherence to constraints**, since stronger models follow explicit boundaries more reliably and invent fewer unrequested additions.

Neither changes the method, and neither substitutes for it. A strong model given "fix the login, make it more secure" will produce a more polished wrong answer.

### Where the money genuinely matters

It matters from Phase 6 onward. Briefs make agentic work cheaper because they reduce the iterations wasted on misunderstanding, so a good brief partly offsets a small budget. What a $0 budget still changes is the *exploration* you can afford: trying three different implementations of a brief to compare them costs three times the quota, and on a free tier you will usually try one. That is a real limitation on the variant-shopping that paid users take for granted, and it makes writing a precise brief more valuable rather than less, because you get fewer shots at the target.
