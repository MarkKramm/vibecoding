# Safety & Ethics — Track Overview

> **Status: not started.** None of this track's five phases are written yet. This overview describes what the track **will** contain, based on the agreed plan. There is no phase content to read today.

## What this track is for

Every other track in this curriculum teaches you to build. This one asks what you are building, what it can do to people, and what you owe them.

It is written for a **builder**, not a philosopher. That distinction shapes everything in it. When this track discusses hallucination, it is not asking whether the model is lying — it is asking how a system you ship produces confident wrong answers, how you detect that, and what mitigation actually works. When it discusses bias, it is asking where the bias enters the pipeline and what you can measure. When it discusses injection, it is giving you a threat model and a set of defences.

The track is also **specific to the Philippines in one important place**. The Data Privacy Act of 2012 (RA 10173) is not background reading — if you build something that handles other people's personal information, including as a favour for a local business, it creates real obligations around purpose limitation, consent, security and breach notification. That phase treats it as the compliance requirement it is.

And it closes with honesty: how to use these tools without misrepresenting your own skill, and how to tell efficient use from cheating in your own learning.

## Who this suits

**This track can be read at any time, including first.** It has no hard prerequisite in the others, and the plan explicitly allows reading it early. It is one of the few tracks where the material does not depend on the machinery you have not learned yet.

That said, its practical phases land harder after you have built something. Phase 4's framework for honest AI use is much more useful once you have used AI heavily for a few weeks and felt the temptation to accept code you did not understand.

You need **no programming background** for Phases 1, 3 and 4. Phases 2 and 5 are more concrete if you have written some code and handled a credential.

## What you need before starting

- **No hard prerequisites.** Curiosity and a willingness to look at your own habits honestly.
- **A free hosted tier or a local model**, for the practice tasks.
- **Roughly 1–2 focused hours a day, five days a week.**

No paid tool is required. Nothing in this track costs money, and the security practices it teaches — not committing secrets, scoping access, minimising data — are free habits rather than purchasable products.

## The phases, in order

| # | Phase | Status | What it will establish |
|---|---|---|---|
| 1 | How Models Go Wrong | Planned | A builder's taxonomy: hallucination, sycophancy, representational harm, failure to know what it does not know, and distributional shift. For each: mechanism, how it shows up, how to detect it, and what mitigation works |
| 2 | Security, Privacy and Data | Planned | Indirect prompt injection taken seriously, instruction hierarchy as a mitigation rather than a guarantee, provider retention and training terms, secrets management, and the Philippine Data Privacy Act as a real obligation |
| 3 | Alignment, Capability and Honest Limits | Planned | What alignment means technically, RLHF and why the KL penalty exists, Constitutional AI, reward hacking, and — most importantly — how not to over-claim about your own results |
| 4 | Using AI Honestly | Planned | What is actually cheating versus efficient use, the "could I explain, debug and extend this myself?" test, skill atrophy, and a personal policy you write for yourself |
| 5 | Career in the AI Era | Planned | What differentiates people now that generation is cheap, the durable-versus-volatile distinction applied to skills, how to keep learning without drowning, and an honest self-assessment |

**Read them in order.** Phase 1 establishes the failure modes, Phase 2 the security and privacy frame, Phase 3 the wider debate, and Phases 4 and 5 turn all of it inward onto your own practice.

**Phase 5 hands off rather than finishes.** It ends the learning phase and states that you are ready. Portfolio construction, the job search and the ninety-day plan belong to the Career track, and Phase 5 cross-references rather than duplicates them.

## What you will be able to do at the end

- Name the ways a model-based system fails, explain the mechanism behind each, and say how you would detect it in a system you built.
- Explain why sycophancy is a side effect of preference training rather than a bug.
- Describe indirect prompt injection concretely, and design a system with defence in depth rather than a prompt instruction.
- Explain what instruction hierarchy does and does not guarantee.
- Identify what personal data your project handles, and state the Philippine Data Privacy Act obligations that follow.
- Handle a secret correctly: never commit it, keep it in the environment, and rotate it on exposure — including knowing that git history keeps what you deleted.
- Explain RLHF and why the KL penalty exists, and describe reward hacking with a concrete example.
- **Distinguish measured results from extrapolation in your own writing**, which is the single most credibility-building habit this track teaches.
- Apply the "could I explain, debug and extend this myself?" test to work you have produced with AI.
- State which competences weaken if you never do the work yourself.
- Write a personal policy for your own AI use, in your own words.

## Roughly how long it takes

**5 phases, about 5–6 weeks at five sessions a week** once the phases are written.

At one hour a day, plan on eight weeks. Phases 1 and 3 are the substantial reads; 4 and 5 are shorter and more personal.

## What being on a $0 budget costs you here

**Almost nothing, and this is the one track where being free is arguably an advantage.**

Every mechanism in this track is observable on free tools. Prompt injection can be demonstrated with a local model and a crafted document. Provider retention terms are published and free to read. The Data Privacy Act is public. Secrets management is a habit. Honest self-assessment costs nothing.

There are two honest caveats:

1. **Free tiers often carry broader data rights over your inputs than paid tiers do.** This is not a cost you pay in pesos, but it is a real constraint on what data you can put through them — and it is the subject of Phase 2 rather than an aside. If you are handling someone else's personal information, a free tier may simply not be an appropriate tool, and the track will say so.
2. **You cannot test frontier-scale safety properties.** Evaluating dangerous capabilities requires resources you do not have. Phase 3 teaches you to read such claims critically rather than to produce them, which is the appropriate level at a $0 budget and is genuinely useful.

Being free here narrows what you can *test*, not what you can *understand* or *practice*. The habits this track installs — minimising data, scoping access, disclosing honestly, not over-claiming — are entirely within reach and are what actually matter.

## How this track connects to the others

**Before it:** nothing required. It can be read first, and reading Phase 4 early will make your study of every other track more honest.

**Alongside it:** Vibecoding Craft raises most of these questions in practice — generated code with hardcoded secrets, dependencies you did not vet — and Phase 2 here is the answer to them.

**After it:** Career. Phase 5 explicitly hands off, and the Career track's portfolio and disclosure advice builds on the honesty framework established here.

## The honest caveat

Two things are worth flagging.

First, **the policy and governance landscape moves fast.** What providers commit to in their terms, what regulators require, and what the norms around disclosure are all change on a scale of months. The phases will date those claims and tell you to re-check them.

Second, and more important: **this is the one track where the durable content is mostly not technical.** The failure taxonomy, the defence-in-depth instinct, the "could I explain this?" test, and the commitment not to overstate your own results are not mechanisms that will be superseded. They are dispositions, and they will still be the right ones when every technical claim in this track has been rewritten.

## Start here

1. There is no prerequisite. Read [`../shared/study-rules.md`](../shared/study-rules.md) first if you have not.
2. Track your progress in [`checklist-master.md`](checklist-master.md).
3. If you have already built something with AI, read Phase 4 first — it is the phase that changes how you work, and it is short.
4. Watch this folder for phase files as they are written.

> **If you only read one phase.** Phase 4, *Using AI Honestly*. It is the one whose absence does real damage: it is entirely possible to finish this curriculum with strong technical skills and a habit of accepting output you cannot explain, and that combination is worse than knowing less and understanding it.
