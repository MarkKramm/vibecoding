# Safety & Ethics — Master Checklist

This is the **track-level** checklist. Phase checklists live inside the phase files. These items should be true of you **when the whole track is done** — capabilities and commitments that require several phases together.

> **Status note.** This track is **not started**: none of its five phases are written yet. This checklist is the **target**, published now so you can see what the track is aiming at. Several items cannot be ticked until the phases that teach them exist, and an unticked box here is not a failure.

**Tick only what you can actually do, or have actually committed to.** Rule 6 of the study rules: your own words, or it did not happen. This is the one track where several items are **dispositions rather than skills** — you cannot read your way to honesty about your own work, and a ticked box on an item you have not genuinely adopted is exactly the failure this track exists to prevent.

---

## Understanding how systems fail

- [ ] I can name the ways a model-based system fails, and explain the mechanism behind each. <!-- id: safe-master-c01 energy: high -->
- [ ] I can explain hallucination as a system property rather than a model lying. <!-- id: safe-master-c02 energy: normal -->
- [ ] I can explain why sycophancy is a side effect of preference training rather than a bug. <!-- id: safe-master-c03 energy: high -->
- [ ] I can explain where representational harm comes from, and why it is hard to measure. <!-- id: safe-master-c04 energy: high -->
- [ ] For each failure mode, I can say how I would **detect** it in a system I built. <!-- id: safe-master-c05 energy: high -->
- [ ] I understand that these are system properties, so the fix is usually system design rather than a better prompt. <!-- id: safe-master-c06 energy: high -->

## Security and privacy

- [ ] I can describe indirect prompt injection concretely, including a data-theft path. <!-- id: safe-master-c07 energy: high -->
- [ ] I design with defence in depth rather than relying on a prompt instruction. <!-- id: safe-master-c08 energy: high -->
- [ ] I can explain what instruction hierarchy mitigates and what it does not guarantee. <!-- id: safe-master-c09 energy: high -->
- [ ] I know what leaves my machine with each tool I use, and I can find the provider's retention and training terms. <!-- id: safe-master-c10 energy: high -->
- [ ] I can explain why free tiers often carry different data terms than paid ones. <!-- id: safe-master-c11 energy: normal -->
- [ ] I never commit a secret, and I know that git history keeps what I deleted. <!-- id: safe-master-c12 energy: high -->
- [ ] I know to rotate a credential on exposure rather than only removing it. <!-- id: safe-master-c13 energy: high -->

## Philippine data protection

- [ ] I can name the obligations the Data Privacy Act of 2012 places on someone handling personal data. <!-- id: safe-master-c14 energy: high -->
- [ ] I apply purpose limitation: I use personal data only for the reason it was collected. <!-- id: safe-master-c15 energy: high -->
- [ ] I apply data minimisation: I collect only what the task actually needs. <!-- id: safe-master-c16 energy: normal -->
- [ ] I can explain what breach notification requires and who it applies to. <!-- id: safe-master-c17 energy: high -->
- [ ] I can say whether a project I have built handles personal data, and what follows if it does. <!-- id: safe-master-c18 energy: high -->

## Alignment and honest limits

- [ ] I can explain what alignment means technically, including the case where operator and user intent conflict. <!-- id: safe-master-c19 energy: high -->
- [ ] I can explain what RLHF does and why the KL penalty exists. <!-- id: safe-master-c20 energy: high -->
- [ ] I can describe reward hacking with a concrete, small example. <!-- id: safe-master-c21 energy: high -->
- [ ] I can state the capability and risk debate without pretending it is resolved. <!-- id: safe-master-c22 energy: high -->
- [ ] **I distinguish measured results from extrapolation in my own writing.** <!-- id: safe-master-c23 energy: high -->
- [ ] I can point at my own portfolio and say which claims are measured and which are hopes. <!-- id: safe-master-c24 energy: high -->

## Using AI honestly — the heart of this track

- [ ] I can apply the test "could I explain, debug and extend this myself?" to work I produced with AI. <!-- id: safe-master-c25 energy: high -->
- [ ] I can distinguish using AI to skip the struggle from using it to check understanding after struggling. <!-- id: safe-master-c26 energy: high -->
- [ ] I can name the competences that weaken if I never do the work myself, and I know which ones I am currently letting weaken. <!-- id: safe-master-c27 energy: high -->
- [ ] I disclose AI assistance where it is expected, and I do not hide permitted tool use. <!-- id: safe-master-c28 energy: normal -->
- [ ] I do not claim credit I did not earn. <!-- id: safe-master-c29 energy: normal -->
- [ ] **I have written a personal policy for my own AI use, in my own words.** <!-- id: safe-master-c30 energy: high -->

## The transition out of learning

- [ ] I can explain what differentiates people now that generation is cheap. <!-- id: safe-master-c31 energy: normal -->
- [ ] I can apply the durable-versus-volatile distinction to **skills**, not only to facts. <!-- id: safe-master-c32 energy: high -->
- [ ] I know how to keep learning without drowning: few high-signal sources, mechanisms rather than leaderboards, a monthly cadence rather than daily. <!-- id: safe-master-c33 energy: normal -->
- [ ] I have made an honest self-assessment of where I actually stand, and written it down. <!-- id: safe-master-c34 energy: high -->
- [ ] I can state that the learning phase is complete and that I am ready — without overstating it. <!-- id: safe-master-c35 energy: high -->

---

## What this checklist is not

It is not a compliance certification, and it does not make you a security professional. It is a statement that **you build with your eyes open** — that you know how these systems fail, what you owe the people whose data you touch, and what you are and are not entitled to claim about your own work.

**Two items matter more than all the others.** `safe-master-c23` — distinguishing measured results from extrapolation — is the single most credibility-building habit in this curriculum, and the easiest to abandon when you want a project to sound impressive. `safe-master-c30` — writing your own policy — is the only item here that is worthless if it is not genuinely yours.
