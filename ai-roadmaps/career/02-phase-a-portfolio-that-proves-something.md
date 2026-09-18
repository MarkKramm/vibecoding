---
id: cr-02-a-portfolio-that-proves-something
track: career
phase: 2
order: 24
title: A Portfolio That Proves Something
duration: 1 week
duration_weeks: 1
energy_mix: [normal, high]
deliverable: portfolio/career/02-a-portfolio-that-proves-something.md
exit_criteria: >
  You can explain mechanically why one deep project with an evaluation suite beats
  five demos, rather than repeating the slogan. You have written a full project
  writeup using the five-part template, including the two sections most people
  skip: what broke and what the thing does badly. Your best project runs on a clean
  machine from a pinned environment with no secrets in the repository, and a
  stranger can follow the README without asking you anything. You have cut every
  project that fails the "could I defend this in an interview?" test, and you have
  inventoried the evidence you already produced in the other tracks and are not
  currently using.
prerequisites:
  - career/01
---

# Phase 2 — A Portfolio That Proves Something

## Goal of this phase

Turn the deliverables you already built into evidence a stranger can read in five minutes and believe.

You have spent this curriculum producing things. Depending on which tracks you have finished, you probably have some combination of a retrieval system, an evaluation suite with real metrics, a small fine-tune, a written explanation of a mechanism, a cost analysis, and an application you built quickly with model assistance. Those are assets. At the moment they are **unassembled assets**, which means that from the outside they are indistinguishable from nothing at all.

This phase fixes exactly that, and it is narrower than it sounds. It is not about building more. It is about **presentation discipline** — and the claim underneath it is the Career track's thesis, stated in [`00-overview.md`](00-overview.md):

> **One deep project with an evaluation suite beats five demos.**

Most beginners do the opposite, and they do it for understandable reasons: five small projects feel like five times the evidence, they are each individually easier to finish, and each one gives a small hit of completion. The result is a portfolio that reads as a list of things you have touched rather than a demonstration that you can finish something and tell whether it works.

The second job of this phase is less comfortable. Every project you show is a claim about your capability, and an interviewer will probe it. A project you cannot defend is not a neutral item on a list — it is a liability, because the follow-up question is where it turns from an asset into a reason not to hire you. So this phase includes the test that decides what stays in and what comes out.

By the end you will have one project written up properly, running on a clean machine, with its limits stated in your own words, and a short list of the things you cut and why. That is a small amount of material. It is worth more than a page of links.

## Estimated time

**1 week** at 1–2 focused hours a day, 5 days a week. Roughly 6–8 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | The core claim, mechanically — why depth beats volume | 1.5h |
| 2 | Legibility to a stranger, and choosing the project | 1.5h |
| 3 | Writing the writeup using the five-part template | 1.5h |
| 4 | Making it runnable: pins, lockfile, secrets, README | 1.5h |
| 5 | The defence test, the cut, and the evidence inventory | 1.5h |

If you only have two hours this week, do tasks 2, 6 and 13. Those choose the project, write the two sections that differentiate (what broke, what it does badly), and run the interview-defence test that decides what to cut. Everything else in this phase is cheaper to do later and less decisive.

**One scheduling note that matters more than the table.** The reading here takes an hour. The writeup takes longer, and it takes *much* longer if you do it at the end from memory. The habit this phase actually installs — keeping running notes per project from the first day (Part 8) — is worth more than the week's exercises, and it only works if you start it now rather than after you finish reading.

## Skills you'll gain

- Explain **mechanically** why one measured project beats five demos, rather than repeating the claim.
- Identify what makes a project **legible** to a reviewer who has minutes and will not run anything.
- Write a project writeup using a five-part structure that a stranger can evaluate.
- Describe **what broke and how you found out**, which is the section that separates a real project from a described one.
- Make a project **runnable on a clean machine**: pinned dependencies, a lockfile, `.env.example`, no secrets, and a README that does not assume your setup.
- Audit a repository and its history for **secrets before publishing** it.
- Apply the **"could I defend this in an interview?"** test per project, and cut or rewrite what fails it.
- Inventory the **evidence your other tracks already produced** and are not currently using.
- Keep a **running notes file** per project so the writeup is assembly rather than reconstruction.
- State honestly that hiring practice varies and that this phase teaches a structure, not a rule.

## Specific topics to learn

- **The core claim** — one deep project with an evaluation suite beats five demos, and the mechanism behind it.
- **Indistinguishability** — why five tutorial-shaped projects cannot be told apart from five other people's tutorial clones.
- **Who did the hard part** — the tutorial author decided what correct means; you did not.
- **Legibility** — problem in one sentence, it runs, evidence it was tested, a stated limitation.
- **Illegibility** — a wall of framework names, an install guide with no purpose, no measurement.
- **The five-part writeup template** — problem, approach, what broke, how you knew it worked, what it does badly.
- **Differentiating sections** — why "what broke" and "what it does badly" carry the weight.
- **Runnable by a stranger** — pinned dependencies, lockfile, `.env.example`, no secrets, a clean-machine README.
- **Secret hygiene** — credentials in a repository, and why a key in git history is not removed by deleting the file.
- **What to leave out** — tutorial clones, unexplainable work, anything with a leaked secret, anything copied from a well-known example.
- **The defence test** — four questions to ask per project, and what to do when one fails.
- **Reusing existing evidence** — evaluation suites, reproducible results, cost analyses, security reviews, mechanism explanations.
- **Notes as you go** — the running file that makes the writeup cheap.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Git and a GitHub account | The public place your work lives, with its history | Free | https://github.com | Tasks t06, t09, t10 — publish, pin and audit | GitLab or Codeberg, both free |
| A plain Markdown file | Hold the writeup and the running notes | Free | — | Tasks t03–t14 — all written work | Any text editor |
| `git log` and `git grep` history search | Find secrets and see what you actually did and when | Free/open-source | https://git-scm.com | Tasks t08, t10 — the secret sweep over the whole history | `gitk`, or your editor's git panel |
| Your existing environment file tooling | Produce a lockfile and an `.env.example` | Free/open-source | — | Task t09 — the clean-machine requirement | Whatever your language ships: `requirements.txt` plus pins, `package-lock.json`, `poetry.lock`, `uv.lock` |
| A fresh container or virtual machine | The only honest test of "runs on a clean machine" | Free | — | Task t09 — clone and run somewhere that is not your laptop | A new virtualenv, a second user account, or a friend's machine |
| Your own `portfolio/` folder in this repository | Where the deliverable goes | Free | — | The deliverable itself | Any folder you keep |

Nothing here costs money. The only genuinely new purchase the naive version of this phase would suggest is portfolio hosting, and you do not need it: a public repository with a good README **is** the portfolio. A custom domain and a personal site are presentation, and a reviewer reads the README either way.

## Free/cheap resources

- **[`00-overview.md`](00-overview.md)** — in this repository. The track's philosophy, and the source of the core claim this phase develops. Read it first; the reasoning below assumes its framing.
- **`ai-roadmaps/finetuning/` evaluation material** — in this repository. If you built an evaluation suite in that track, that artefact is the single most valuable thing you own for this phase. Most beginners do not have one.
- **`ai-roadmaps/safety-career/05-phase-career-in-the-ai-era.md`, Part 6** — in this repository. The over-claiming audit. This phase's defence test is the same instrument, applied to the projects you are about to publish.
- **`ai-roadmaps/shared/study-rules.md`** — in this repository. Rule 10 in particular, on comparison not being information. A portfolio is where that rule gets tested hardest, because you will be looking at other people's.
- **Repository READMEs of projects you actually admire** — free and unusually instructive. Read five and notice how many state a limitation. That ratio is the lesson.
- **`git help log` and your own history** — free. Your commits are the raw material for the "what broke" section, which is the section you will otherwise not be able to write.

Be careful with portfolio advice in the same way you should be careful with career advice generally. A large share of it is written by people selling a course, a template pack, a hosting plan, or a review service, which gives the advice a reason to conclude that the missing piece is the thing being sold. The structural material — state the problem, show it runs, show it was measured, state a limit — is free, unglamorous, and is what a reviewer actually reads.

## Lesson: A Portfolio That Proves Something

### Part 1 — Why one measured project beats five demos, mechanically

The claim sounds like taste. It is not taste; it is a specific consequence of how a reviewer reads a portfolio, and you can derive it.

Start with the reviewer's situation. They have a stack of candidates and a few minutes each. They are not going to clone your repository, install your dependencies and run your system — most will not get past the README, and the ones who go further will look at the code and the tests. So the question they are answering is not "does this work." It is: **can I tell what this person did, and can I tell whether they know whether it works?**

Now consider the five-demo portfolio. Each demo is shaped like a tutorial: it uses a popular framework, it follows a well-known pattern, it works, and it has a README that explains installation. This describes thousands of portfolios. The reviewer has seen this shape before — many times, this month — and the crucial thing is that **it is not the shape that distinguishes you, because the shape is not yours.** Five of them are five times the same signal, and the signal is "this person can follow instructions."

Here is the mechanism, stated exactly.

**In a tutorial, the hard part has already been done, and it was done by the tutorial author.** The hard part is not typing the code. It is deciding what "correct" means for this problem, choosing what to measure, and then discovering — usually unhappily — that your first measurement was the wrong one. When you follow a tutorial, all of that arrives pre-decided: the tutorial tells you which dataset to use, which metric to report, and what a good number looks like. You produce the artefact and inherit none of the judgement. This is why tutorial-shaped work is *indistinguishable* rather than merely *unimpressive*: every person who followed the same tutorial made every decision the same way, because none of them made any decisions at all.

**A project where you defined success and measured it is legible in a way volume is not.** It has a shape nothing else on the reviewer's stack has: here is a problem, here is why I framed it this way, here is what I measured, here is the number, here is the case where the number is bad. That shape carries information about you specifically, because the decisions in it could have gone other ways and you can say why they did not. Volume cannot substitute for it. Ten tutorial clones still contain zero decisions, so they still carry zero information about you, no matter how much work they cost.

There is a second mechanism, and it is about what a reviewer is trying to rule out. They are trying to avoid hiring someone who cannot tell good output from bad, because that person is expensive in a way that is invisible until it matters. Evidence of measurement is the cheapest available evidence against that failure, and it is rare. Most candidates show artefacts. **Showing that you measured something is itself the differentiator**, which is why the evaluation suite matters more than the system it evaluates.

**This is counterintuitive and most beginners do the opposite.** The pull toward five demos is strong and it is not stupid: five things are individually easier to finish than one good thing, each finish feels like progress, and a list of five looks like more evidence than a list of one. The problem is that "more" is counted in the wrong unit. What is being counted on the other side of the table is not how many things you have, but how much a reader can learn about your judgement from them. Five shallow projects can be less than one deep one — not because depth is virtuous, but because the tutorial work has already spent the information for you.

One honest framing note, because this is the kind of claim that gets overstated. This is an argument about **what a reader can extract from what you show**, not a measured finding about hiring outcomes, and hiring practices vary by employer, by market, and by role. Treat it as a structure to build against rather than a rule the world guarantees. **Unverified** as an empirical claim about any particular employer's process; sound as reasoning from the reviewer's situation, which you can check yourself the next time you read a job post or a public portfolio.

### Part 2 — What makes a project legible to a stranger

Legibility is not the same as quality, and the difference is worth holding separately. A technically excellent project with an illegible presentation reads as nothing, and a modest project presented legibly reads as competence. Since you are optimising for what a reader can extract, presentation is not the cosmetic layer — it is the layer that carries the signal.

The reviewer has **minutes**. Work backwards from that.

**Legible means four things.**

**The problem is stated in one sentence that a non-specialist understands.** Not the architecture, not the stack, not the motivation — the problem. "This reads a batch of supplier invoices and flags the ones whose totals do not reconcile, so a bookkeeper does not have to check all of them by hand." Someone outside your specialism can read that, and can immediately ask a sensible follow-up, which is exactly what you want them to be able to do.

**It runs.** A reviewer who tries and fails to run your project takes away one fact, and it is not about your project's domain. Make it runnable (Part 4). This is the least interesting requirement and the most binary.

**There is evidence it was tested.** Not the phrase "tested thoroughly" — an artefact. A test file, a small evaluation table with numbers in it, a held-out example, a note saying which inputs you tried and what happened. The evidence does not need to be elaborate. It needs to exist and be findable in under a minute.

**The author states a limitation.** This is the one that separates candidates, and Part 1 already gave the reason: a stated limitation tells the reader which of your other claims were checked. "Works on PDFs with a text layer; I did not handle scanned documents" is a stronger sentence than any claim it could replace, because it proves the author tested the boundary of their own claim.

**Illegible means the mirror image.** A wall of framework names in the first paragraph, which tells the reader what you installed and nothing about what you built. A README that explains how to install rather than what the thing is for — and this is the single most common failure, because installation instructions are the easiest thing to write and they feel like completeness. And no evidence that anything was measured, which leaves the reader unable to distinguish a working system from a plausible-looking one.

There is a useful diagnostic here. **Read your own README and count how many sentences describe the problem versus how many describe the setup.** If the ratio is heavily toward setup, the project is illegible, and the fix is writing, not building.

### Part 3 — The writeup template

Here is a structure you can copy. It is five sections, it fits on a page, and it is the whole of the deliverable's core.

**1. The problem, and who has it.** One paragraph. What is the task, who currently does it, and what it costs them. If you cannot name a person or a role who has this problem, the problem is not yet real, and the reviewer will notice. This section also forces you to be honest about whether the project exists to solve something or to be a portfolio piece — and a portfolio piece is a legitimate answer, as long as you do not dress it as the other one.

**2. The approach, and why that approach over the obvious alternative.** One paragraph. Not what you used; why. "I used retrieval rather than fine-tuning because the policy changes monthly and the answer needs to cite its source" is this section. The obvious alternative is what makes the section work: everyone can say what they did, and the reasoning is only visible against the road not taken.

**3. What broke, and how you found out.** One or two paragraphs, and this is where most writeups give up. Name the specific failure. Say how you discovered it — a test asserting the wrong thing, a user input that produced nonsense, a metric that looked fine until you looked at the metric per category. Say what you changed. This section is credible in a way nothing else in the document is, because **a described project has no bugs in it, and a real project is made of them.**

**4. How you knew it worked — the measurement.** The numbers, the method, and what the numbers do not cover. Your evaluation suite goes here. If you have an accuracy figure, say what it was measured on and how many examples. If you have a cost-per-request figure, say what the request looked like. This is the section that answers the question the whole track is built around, and it is the one most candidates cannot write because they never measured anything.

**5. What it does badly, and what you would do differently.** One paragraph. The cases it fails on, stated plainly, and the specific change you would make with more time. Not "it could be improved" — which sentences are weasel words, not limitations.

**Why sections 3 and 5 do the work.** Sections 1, 2 and 4 describe a thing that worked, and anyone can describe a thing that worked — including someone who did not build it. Sections 3 and 5 describe **a thing that was difficult and a person who noticed**, and those are much harder to produce without having done the work. They also happen to be the two sections an interviewer probes first, which is not a coincidence: they are probing for the same signal the template is designed to carry.

A note on length. This template on one page beats it stretched to six. The reviewer is reading quickly, and a tight document signals that you know which parts matter — which is itself a claim about your judgement.

### Part 4 — Making it runnable

This part is boring and it is free, and skipping it costs you more than any technical weakness in the project.

**"Works on my machine" reads as a red flag.** Not because reviewers are harsh, but because of what it implies. A project that only runs in its author's environment usually runs there because of an unpinned package, an undocumented environment variable, or a leftover local file — and each of those is a small symptom of work that was never checked by anyone but the person who wrote it. A reviewer who cannot run your project has no way to tell whether it works, which means the project contributed nothing to your case except the time it took to read about.

The fix is boring and free:

- **Pin your dependencies.** Exact versions, not `>=`. "It worked with whatever was current in March" is not reproducible in June.
- **Commit a lockfile.** `requirements.txt` with pins, `poetry.lock`, `uv.lock`, `package-lock.json` — whatever your ecosystem uses. The lockfile is the thing that makes the pin real.
- **No secrets in the repository.** Keys go in environment variables. The repository gets an `.env.example` with the variable names and placeholder values, so a stranger knows what to supply without you having supplied it for them.
- **A README a stranger can follow on a clean machine.** The test is literal: clone into a fresh directory or container, follow your own README exactly, and see whether it runs. Every step you had to add from memory is a step the README is missing.
- **State what the project needs, up front.** If it needs an API key, say so. If it needs a GPU, say so, and say roughly what happens without one. If a free tier is enough, say so — that is useful information for a reviewer who is deciding whether to try it. Surprises cost you the reviewer's attention, and attention is the scarce resource.

**On secrets specifically, because this is the one item here that is not merely about polish.** A credential that has been committed is not removed by deleting the file in a later commit; it stays in the history, and anyone who clones the repository can retrieve it. If you find one, rotate the credential — invalidate it at the provider first, because the published key is already compromised regardless of what you do to the repository afterwards — and then either rewrite the history or, more simply, start a clean repository with the current state. Rotating matters more than cleaning. **Unverified** as to how reliably automated scanners find keys in public repositories, but the correct action does not depend on that answer: assume a committed key is public the moment it is pushed.

None of this requires paid tooling. The whole checklist is available in git and your language's package manager.

### Part 5 — What to leave out

Cutting is the part of portfolio work that feels like loss and functions like editing. Four categories go.

**Tutorial clones.** If you followed a guide and produced the guide's project, it is not evidence of your judgement, for the reason Part 1 gave. This does not mean the learning was wasted — it means the artefact is not the evidence. If you extended a tutorial substantially, the extension might be, but then rebuild the repository so the writeup is about the extension rather than about the tutorial.

**Anything you cannot explain.** If you cannot describe how a component works, or why it is there, it does not go in. This is not a rule about honesty; it is a rule about risk. The item is a liability the moment it is visible, because it invites exactly the question you cannot answer — and one failed question contaminates the reviewer's reading of everything else you showed.

**Anything with a secret in its history.** Not just rotated and forgotten: this is a reason to leave a repository private or to start it again. A leaked key in a public repository is a security incident with your name on it, and a reviewer who finds it learns something about your instincts that no amount of good project work will offset.

**Anything that copies a well-known example.** The model-comparison notebook from a widely-shared course, the resurrected chatbot from a blog post, the benchmark run someone else configured. These are recognisable, and being recognised as someone else's work is worse than showing nothing.

**Two more cuts that are less obvious.**

**Do not list a technology you used once and cannot discuss.** The technology list is read as a set of claims, and each one is an invitation. "Kubernetes" on a portfolio that contains no Kubernetes is a question you have volunteered to answer. The fix is not to study Kubernetes — it is to delete the word.

**Do not pad with a long list of languages you have touched.** A list of nine languages with one project each reads as a lack of depth, and it is the exact profile that tutorial-following produces most easily. Two or three with real work behind them reads as competence. The list is not a scoreboard; it is an inventory, and inventories of things you cannot use are not assets.

The general rule underneath all six: **every item on your portfolio is a claim, and claims are priced by whether you can support them.** The cut is not a reduction in evidence. It is the removal of items whose expected contribution is negative.

### Part 6 — The interview test

This is the instrument the phase is built around, and it is one question applied per project:

> **Could I defend this in an interview — not explain it, defend it?**

Four specific interrogations, and a project has to survive all four to stay.

1. **Can I explain why I chose this?** Why this approach rather than the obvious alternative, and what it cost. If the honest answer is "the tutorial used it" or "it is what I knew," the project is not carrying a decision.
2. **Can I name a tradeoff?** Something you gave up. Speed for accuracy, cost for latency, a simpler design that handles fewer cases. A project with no named tradeoff usually means the choices were made by someone else.
3. **Can I describe a bug I found and how I found it?** This is the one that cannot be bluffed. It asks what happened and how you noticed, and it requires a memory of a real event. If your answer is a hypothetical bug, you are describing a project you did not finish.
4. **Can I say what it does badly?** The limitation, stated without hedging. If you cannot name one, you have not tested the boundaries, which is the same thing as not having measured.

Notice that the test is not about knowledge. You can fail it while knowing quite a lot, and you can pass it on a small project. It is a test of whether the work passed through your judgement or around it.

**If a project cannot survive those questions, it is a liability rather than an asset.** This is the phase's sharpest claim and it is worth stating without cushioning: an item you have to steer the conversation away from is worse than an item that is not there. The reviewer does not know you are steering, but they notice the gap where a project was mentioned and not discussed, and a portfolio with five items of which two must be avoided is a portfolio with three items and a smell.

**One honest deep project is better than five shallow ones you must avoid mentioning.** Not because depth is noble, but because the deep one survives all four questions and the shallow ones do not, and a portfolio is judged by what it can withstand rather than by what it contains.

Where a project fails, you have two legitimate responses and no illegitimate one. **Close the gap** — go and understand the component, find the real bug you actually hit, run the measurement you skipped — and then the project is an asset again. Or **say so in the writeup**, stating the limitation explicitly, which converts an unexploded question into a piece of demonstrated honesty. What is not legitimate is leaving the claim in place and hoping the question does not come. It is a small field, and this is the failure mode [`05-phase-career-in-the-ai-era.md`](../safety-career/05-phase-career-in-the-ai-era.md) spent a whole part warning about.

### Part 7 — The evidence you already have and are not using

If you have come through this curriculum, you are likely sitting on material that most beginners do not have, and the odds are good that you are not counting it.

**An evaluation suite with real metrics.** If you built one in the fine-tuning or retrieval tracks, this is the most valuable artefact you own, and for exactly the reason Part 1 gave: most portfolios contain no measurement at all. It does not need to be sophisticated. A test set, a metric, a number, and a note about what the number does not cover is already unusual.

**A reproducible result.** Not "it works" but "here is the command, here is the output, here is the seed." Reproducibility is the least glamorous and most checkable form of evidence, and it converts a claim into something a reviewer can verify for themselves.

**A cost analysis.** What the system costs per request or per thousand documents, and which part dominates. Very few entry-level portfolios contain a cost figure, and a cost figure demonstrates that you think about the system as something that has to be operated rather than demonstrated.

**A security review.** The failure modes you checked, the trust boundaries you identified, the input you decided not to handle. This is rare at junior level and it reads as judgement about consequences rather than capability.

**A written explanation of a mechanism.** A document where you explained how something works, in your own words, without quoting a source. This is direct evidence that you understand the thing rather than having operated it, and it is the cheapest evidence to produce because the artifact is just writing.

The pattern across all five is the same: **these are unusual precisely because most beginners do not produce them, and they are cheap for you because you already did.** Reusing them is not padding. A cost analysis attached to a retrieval project is part of that project. An evaluation suite is the strongest single section of a writeup. What would be padding is listing them as separate achievements when they belong to a project, or claiming the mechanism document as a project when it is an explanation.

Go back through your completed work with this list in hand before you write anything. The inventory will usually change which project you lead with.

### Part 8 — Write the README as you go, not at the end

This is the cheapest habit in the track, and the one with the largest effect on what your writeups will be worth.

**Reconstructing evidence from memory is unreliable.** Not slightly unreliable — specifically unreliable in the direction that hurts you. You will remember what you built and forget what broke. You will remember the design you ended up with and forget the two you abandoned. You will remember the bug you fixed but not **how you found it**, because finding it took two days of confusion and confusion does not encode well. The result is a writeup that has sections 1, 2 and 4 and a thin, vague version of 3 and 5 — which, per Part 3, is precisely the writeup that carries no signal.

So the discipline is this: **keep a running notes file per project, from the first day.** One file, plain text, appended to whenever something happens. What goes in it:

- **Every decision, with the reason, at the moment you make it.** Two lines. "Used chunk size 512 rather than 1024 because retrieval quality dropped on the long documents — measured on 20 examples." That single line becomes section 2 of the writeup, and it is worth nothing if written three weeks later.
- **Every failure, with the symptom.** What you expected, what happened, what you tried. The two-day bug is a gift, and it is only a gift if you wrote it down while you still hated it.
- **Every measurement, with the number and the conditions.** The number without its conditions is not evidence, and the conditions are the first thing you forget.
- **Every limitation you notice.** The input you did not handle, the case you skipped, the thing you know is fragile. These become section 5, and noticing them early is what turns "what it does badly" from a confession into a record.
- **Anything that surprised you.** Surprises are where the learning is, and they are the most memorable-feeling and least reliably recalled category.

The file costs about two minutes a day. It saves several hours per project, it makes the writeup mechanical rather than archaeological, and it has a second benefit that is easy to miss: **writing down a decision forces you to notice when you do not have a reason for it.** Half the value of the notes file is discovering, at the moment of writing, that a choice was not yours.

Start it today, on whatever you are currently building, even if that project will not end up in the portfolio. The habit is the deliverable here, and it is the one item in this phase that compounds.

## Hands-on practice tasks

1. List every project and deliverable you have produced in this curriculum, however small, in one file. Do not judge them yet — the point is to see the inventory before you cut. <!-- id: cr-02-a-portfolio-that-proves-something-t01 band: focused energy: normal -->
2. Sort the list into three piles: projects where you decided what "correct" means, projects where a tutorial decided, and things that are not projects. Count each pile. <!-- id: cr-02-a-portfolio-that-proves-something-t02 band: focused energy: high -->
3. Pick the project with the strongest evaluation evidence. Write one sentence stating its problem, addressed to someone outside your specialism, and read it aloud. <!-- id: cr-02-a-portfolio-that-proves-something-t03 band: quick energy: low -->
4. Read your chosen project's README end to end and count sentences about the problem versus sentences about the setup. Write both numbers down. <!-- id: cr-02-a-portfolio-that-proves-something-t04 band: focused energy: normal -->
5. Rewrite the first paragraph of that README so the problem comes first and installation is moved below it. <!-- id: cr-02-a-portfolio-that-proves-something-t05 band: focused energy: normal -->
6. Write the full five-part writeup for the chosen project. Do not skip section 3 or section 5; if you cannot fill one, that gap is the finding. <!-- id: cr-02-a-portfolio-that-proves-something-t06 band: deep energy: high -->
7. Dig through your git log and commit messages for the period you built the project, and write down the failures and reversals you had forgotten. Add them to section 3. <!-- id: cr-02-a-portfolio-that-proves-something-t07 band: focused energy: high -->
8. Sweep the whole git history, not the current files, for committed keys, tokens and personal data. Record what you find even if it is nothing. <!-- id: cr-02-a-portfolio-that-proves-something-t08 band: focused energy: high -->
9. Clone the project into a fresh directory or container and follow your own README exactly. Write down every step you had to add from memory. <!-- id: cr-02-a-portfolio-that-proves-something-t09 band: deep energy: high -->
10. Pin the dependencies, commit a lockfile, and add an `.env.example`. Then repeat the clean-machine run from task 9. <!-- id: cr-02-a-portfolio-that-proves-something-t10 band: deep energy: normal -->
11. Add a short "what this needs" section to the README: API keys, GPU, or free-tier-only, and what happens without them. <!-- id: cr-02-a-portfolio-that-proves-something-t11 band: quick energy: low -->
12. Write the limitations paragraph — what it does badly and what you would do differently — before re-reading anything else you wrote. Then check it against your notes. <!-- id: cr-02-a-portfolio-that-proves-something-t12 band: focused energy: high -->
13. Run the four defence questions on every project on your list and mark each pass or fail per question. Do not soften a fail. <!-- id: cr-02-a-portfolio-that-proves-something-t13 band: deep energy: high -->
14. For each project that failed, choose explicitly: close the gap, state the limit, or cut it. Write the choice and the reason next to the project. <!-- id: cr-02-a-portfolio-that-proves-something-t14 band: focused energy: high -->
15. Inventory your existing evidence against the five kinds in Part 7 and note which projects each piece belongs to. <!-- id: cr-02-a-portfolio-that-proves-something-t15 band: focused energy: normal -->
16. Start the running notes file for whatever you are building now, and backdate the entries you can still remember from your current project. <!-- id: cr-02-a-portfolio-that-proves-something-t16 band: quick energy: low -->
17. Ask one person who is not in AI to read the writeup and tell you what they think the project does. Write down where they were wrong. <!-- id: cr-02-a-portfolio-that-proves-something-t17 band: focused energy: normal -->
18. Set a recurring reminder to append to the notes file each working session, and keep it running for the rest of the curriculum. <!-- id: cr-02-a-portfolio-that-proves-something-t18 band: ongoing energy: low -->

## Common Pitfalls

**Optimising for count rather than for legibility.** Five projects feel like five times the evidence and read as one repeated signal. The unit on the other side of the table is how much a reader learns about your judgement, and tutorial-shaped work spends that budget on the tutorial author's behalf.

**Believing volume substitutes for measurement.** Ten projects with no measurement still contain no measurement. If the thing you are trying to demonstrate is that you can tell whether a system works, only a measurement demonstrates it, and adding more systems does not.

**Writing the README as an installation guide.** Installation instructions are easy to write and feel like completeness, so they crowd out the problem statement. The reviewer's first question is what the thing is for, and the answer is usually absent.

**Leaving the writeup until the end.** Memory is unreliable in exactly the direction that hurts: you keep the design and lose the failure. A writeup reconstructed after the fact has sections 1, 2 and 4 and a vague section 3, which is the writeup that carries no signal.

**Shipping a project that only runs on your machine.** This is free to fix and expensive to skip. A reviewer who cannot run the project has no way to evaluate it, so the project contributes nothing but the reading time.

**Committing a credential and forgetting it.** Deleting the file later does not remove it from the history. Rotate the credential first, because it is already compromised the moment it is pushed, and then decide about the repository.

**Leaving in projects you cannot explain.** Each unanswerable item invites the question you cannot answer, and one failed follow-up contaminates the reviewer's reading of everything else. The item is a liability, not a neutral entry.

**Listing technologies you used once.** The technology list is read as a set of claims, and each one is an invitation. The fix is deletion rather than study.

**Padding with a long language list.** Nine languages with one project each reads as an absence of depth, and it is the exact profile that tutorial-following produces most readily.

**Assuming you have nothing worth showing.** If you came through this curriculum you probably have an evaluation suite, a reproducible result, a cost figure, or a mechanism explanation. These are unusual at entry level and they are cheap for you because they already exist. Inventory before you conclude you have nothing.

**Treating the portfolio as the proof rather than the invitation.** Its job is to earn a conversation, and the conversation is where the defence test happens. A portfolio that over-claims converts a conversation you would have won into one you lose.

## Deliverable / proof of work

Create `portfolio/career/02-a-portfolio-that-proves-something.md` containing:

1. **The project inventory** — every project and deliverable you have produced, sorted into "I defined correct," "a tutorial defined correct," and "not a project" (tasks 1, 2).
2. **The full five-part writeup** for your chosen project: the problem and who has it, the approach and why over the obvious alternative, what broke and how you found out, how you knew it worked with the measurement, and what it does badly (tasks 3, 6, 7).
3. **The README rewrite** — problem first, installation below, with a "what this needs" section covering keys, hardware and free-tier viability (tasks 4, 5, 11).
4. **The clean-machine record** — the commands a stranger would run, the steps you had to add from memory, and confirmation that the pinned environment and lockfile now cover them (tasks 9, 10).
5. **The secret sweep result** — what you searched for, what you found, and what you rotated or cut (task 8).
6. **The defence audit** — all four questions applied per project, with pass or fail marked honestly, and the explicit close-the-gap / state-the-limit / cut decision for each failure (tasks 13, 14).
7. **The evidence inventory** — which of the five kinds from Part 7 you already have and which project each belongs to (task 15).
8. **The running notes file**, started, for your current project, with whatever you could still backdate (task 16).
9. **The outsider reading** — what a non-specialist thought the project does, and where they were wrong (task 17).

Point 6 is the one that will cost you something, and point 2's third and fifth sections are the ones that cannot be faked. An inventory is easy and a README rewrite is mechanical. Applying the defence questions per project and writing down the failures produces a shorter portfolio than you started with, and that is the intended outcome rather than a setback.

## Checklist

- [ ] I can explain mechanically why one measured project beats five demos, not just repeat it <!-- id: cr-02-a-portfolio-that-proves-something-c01 energy: normal -->
- [ ] I can say who did the hard part in a tutorial-shaped project and why that makes it indistinguishable <!-- id: cr-02-a-portfolio-that-proves-something-c02 energy: normal -->
- [ ] I accept that my instinct to add more projects is usually the wrong move <!-- id: cr-02-a-portfolio-that-proves-something-c03 energy: low -->
- [ ] I can name the four things that make a project legible to a reviewer with minutes <!-- id: cr-02-a-portfolio-that-proves-something-c04 energy: low -->
- [ ] I have counted sentences about the problem versus the setup in my own README <!-- id: cr-02-a-portfolio-that-proves-something-c05 energy: normal -->
- [ ] I have written a one-sentence problem statement a non-specialist understands <!-- id: cr-02-a-portfolio-that-proves-something-c06 energy: normal -->
- [ ] I have written the full five-part writeup for my chosen project <!-- id: cr-02-a-portfolio-that-proves-something-c07 energy: high -->
- [ ] My writeup names a specific bug and describes how I found it <!-- id: cr-02-a-portfolio-that-proves-something-c08 energy: high -->
- [ ] My writeup states what the project does badly without hedging <!-- id: cr-02-a-portfolio-that-proves-something-c09 energy: high -->
- [ ] I can explain why sections 3 and 5 differentiate when 1, 2 and 4 do not <!-- id: cr-02-a-portfolio-that-proves-something-c10 energy: normal -->
- [ ] My dependencies are pinned and a lockfile is committed <!-- id: cr-02-a-portfolio-that-proves-something-c11 energy: normal -->
- [ ] There are no secrets in the repository or in its history <!-- id: cr-02-a-portfolio-that-proves-something-c12 energy: high -->
- [ ] I have swept the whole git history for keys, tokens and personal data <!-- id: cr-02-a-portfolio-that-proves-something-c13 energy: high -->
- [ ] I have run the project on a clean machine by following my own README only <!-- id: cr-02-a-portfolio-that-proves-something-c14 energy: high -->
- [ ] My README states what the project needs — keys, hardware, free-tier viability <!-- id: cr-02-a-portfolio-that-proves-something-c15 energy: low -->
- [ ] I have cut every tutorial clone, unexplainable item and copied example from my portfolio <!-- id: cr-02-a-portfolio-that-proves-something-c16 energy: normal -->
- [ ] I have removed every technology I used once and cannot discuss <!-- id: cr-02-a-portfolio-that-proves-something-c17 energy: normal -->
- [ ] I have run all four defence questions per project and recorded the failures honestly <!-- id: cr-02-a-portfolio-that-proves-something-c18 energy: high -->
- [ ] For each failing project I have chosen close-the-gap, state-the-limit, or cut <!-- id: cr-02-a-portfolio-that-proves-something-c19 energy: high -->
- [ ] I have inventoried the evidence from other tracks that I was not counting <!-- id: cr-02-a-portfolio-that-proves-something-c20 energy: normal -->
- [ ] I have started a running notes file for my current project and backdated what I remember <!-- id: cr-02-a-portfolio-that-proves-something-c21 energy: low -->
- [ ] I can state that this phase teaches a structure rather than a guaranteed hiring rule <!-- id: cr-02-a-portfolio-that-proves-something-c22 energy: low -->

## Quiz

### Q1. Why is one deep project with an evaluation suite worth more than five demos? <!-- id: cr-02-a-portfolio-that-proves-something-q01 energy: normal -->

- [ ] Because five projects show a lack of focus, and focus is what employers value most
- [x] Because in a tutorial the author already decided what correct means, so five tutorial-shaped projects carry no decisions of your own and are indistinguishable from anyone else's
- [ ] Because five small projects take less total time than one deep one, so the deep one signals more effort
- [ ] Because evaluation suites are the only thing a reviewer is able to read

**Why:** The mechanism is about information, not virtue. Every decision in a tutorial — the dataset, the metric, what counts as a good result — was made by the tutorial's author, so everyone who followed it made every choice identically and the artefact says nothing about the follower. A project where you defined success and measured it contains choices that could have gone otherwise, and you can say why they did not. That is the part that is legible, and volume cannot substitute for it because ten clones still contain zero decisions.

### Q2. A reviewer has minutes and will probably not run your project. Which combination makes it legible? <!-- id: cr-02-a-portfolio-that-proves-something-q02 energy: normal -->

- [ ] A comprehensive technology list, an architecture diagram and a licence file
- [ ] A long README covering every configuration option and deployment path
- [ ] Detailed installation instructions, a changelog, and a roadmap of planned features
- [x] The problem in one sentence a non-specialist understands, evidence it was tested, and a stated limitation

**Why:** Legibility is defined by what a reader can extract quickly, and those four properties — problem, runs, tested, limited — are the ones that survive a fast read. The distractors are all real artefacts of a maintained project, and none of them tells the reviewer what the thing is for or whether it works. A stated limitation does double duty: it names a boundary and it tells the reader which of your other claims have been checked.

### Q3. Which two sections of the writeup template carry the most differentiating signal? <!-- id: cr-02-a-portfolio-that-proves-something-q03 energy: normal -->

- [ ] The problem statement and the approach
- [x] What broke and how you found out, and what it does badly
- [ ] The approach and the measurement
- [ ] The problem statement and the measurement

**Why:** Sections 1, 2 and 4 describe a thing that worked, and anyone can describe a thing that worked — including someone who did not build it. Sections 3 and 5 describe a difficult process and a person who noticed its edges, which is much harder to produce without having done the work. They are also the first two places an interviewer probes, for the same reason: they are looking for the same signal the template is built to carry.

### Q4. Your project runs on your laptop but a reviewer cannot get it running. What does that cost you? <!-- id: cr-02-a-portfolio-that-proves-something-q04 energy: normal -->

- [ ] Nothing much, because reviewers read code rather than running it
- [ ] It mainly signals that the project is technically advanced
- [x] The reviewer has no way to verify it works, so the project contributes nothing except reading time
- [ ] It is a minor formatting issue that a note in the README can explain away

**Why:** A project nobody else can run is unverifiable, and an unverifiable claim is not evidence. It also implies a specific history — an unpinned dependency, an undocumented variable, a leftover local file — each of which suggests work that was never checked by anyone but its author. The fix costs nothing: pin the dependencies, commit a lockfile, add an `.env.example`, and clone into a clean directory to follow your own README exactly.

### Q5. You find an API key committed eight months ago and deleted in a later commit. What is the correct first action? <!-- id: cr-02-a-portfolio-that-proves-something-q05 energy: high -->

- [ ] Nothing, since the file is no longer in the current version of the repository
- [ ] Delete the repository and recreate it from the current working files
- [x] Rotate the credential at the provider first, because it has been public since the push, then decide how to handle the history
- [ ] Add the key's filename to `.gitignore` so the problem cannot recur

**Why:** Deleting a file in a later commit removes it from the working tree and leaves it in the history, where anyone who clones can retrieve it. That makes rotation the first move and the only one that actually resolves the exposure — the secret is already compromised at the moment it reaches a public remote, and cleaning the repository afterwards does not un-publish it. Starting a clean repository is a reasonable second step; rotating is what closes the incident.

### Q6. A project in your portfolio fails the defence test. Which responses are legitimate? <!-- id: cr-02-a-portfolio-that-proves-something-q06 energy: high -->

- [ ] Keep it and prepare a way to change the subject if it comes up
- [ ] Keep it and describe it in more confident language so the question feels less likely
- [ ] Remove every project that fails and show nothing until all of them pass
- [x] Close the gap until you can defend it, state the limitation explicitly in the writeup, or cut the project

**Why:** The test has no illegitimate outcome other than leaving the claim in place and hoping. Closing the gap is the strongest option and usually the least work — find the bug you actually hit, run the measurement you skipped. Stating the limitation is legitimate and often better than the project deserved, because a stated limit tells the reader which of your other claims were checked. Cutting is legitimate too. What is not legitimate is an item you must steer around, because one unanswerable follow-up contaminates the reviewer's reading of everything else.

## You're ready to move on when...

- You can explain **mechanically** why one measured project beats five demos, including why tutorial-shaped work is indistinguishable rather than merely unimpressive.
- You have written a **full five-part writeup** for one real project, and sections 3 and 5 are specific rather than vague.
- Your chosen project **runs from a clean clone** on a pinned environment with a lockfile, no secrets, an `.env.example`, and a README a stranger can follow.
- You have swept the repository's **entire history** for credentials, and rotated anything you found.
- You have run the **four defence questions on every project**, recorded the failures honestly, and made an explicit close-the-gap, state-the-limit or cut decision for each.
- You have **inventoried the evidence from your other tracks** and attached it to the projects it belongs to.
- Your **running notes file** exists and you have appended to it at least once.

## Free vs Paid

**Everything in this phase is free, and the paid version of it is almost entirely unnecessary.** The artefacts are a text file, a git repository, and your own time. Nothing here requires a subscription, a course, or a service.

**The free path, concretely.** Publish on a public GitHub repository — free, and the README is the portfolio, so no hosting is needed. Write the writeup in Markdown in your `portfolio/` folder. Test the clean-machine run in a fresh virtualenv, a container, or a second user account. Use your language's own package manager to pin dependencies and produce a lockfile. Rotate a leaked key at the provider's own dashboard, which costs nothing. The evidence inventory costs only an hour of rereading your own completed work.

**What paid options would add, and why they are not the bottleneck.** Portfolio site builders and custom domains give you a nicer URL; a reviewer reads the README either way, and an illegible project on a good domain is still illegible. Template packs save formatting time and supply nothing about your judgement, which is the thing being assessed. Paid code-review or portfolio-review services do provide a real second reading, and that is genuinely useful — but task 17 gets you most of it for free by asking one non-specialist to say what they think the project does. Paid repository-secret scanning is convenient and unnecessary when a history search and rotation cover the actual risk.

**The one cost that is not free, and matters.** Your time, and specifically the time you will be tempted to spend building a sixth project instead of writing up the one you have. The realistic estimate is 6–8 hours for this phase, most of it spent writing about work that already exists. That is the correct allocation and it feels like the wrong one, because building produces artefacts and writing produces only a document. The document is what the reviewer reads.
