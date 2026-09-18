# Vibecoding Craft — Master Checklist

This is the **track-level** checklist. Phase checklists live inside the phase files. These items should be true of you **when the whole track is done** — capabilities that require several phases together.

> **Status note.** This track is **not started**: none of its eight phases are written yet. This checklist is the **target**, published now so you can see what the track is aiming at. Several items cannot be ticked until the phases that teach them exist, and an unticked box here is not a failure. Watch this folder for phase files.

**Tick only what you can actually do.** Rule 6 of the study rules: your own words, or it did not happen. This track is the one where false confidence does the most damage, because AI-assisted development produces code that runs and looks correct while being neither.

---

## The honest starting point

- [ ] I can state what vibecoding makes easy and what it makes **deceptively** easy, with an example of each. <!-- id: vibe-master-c01 energy: normal -->
- [ ] I can place my own workflow on the spectrum from autocomplete to autonomous agent. <!-- id: vibe-master-c02 energy: normal -->
- [ ] I can explain, in my own words, why code I cannot read is code I cannot own. <!-- id: vibe-master-c03 energy: normal -->
- [ ] I can tell the difference between a fast session and a productive one, and I notice when I have confused them. <!-- id: vibe-master-c04 energy: high -->

## Specification

- [ ] I can turn a vague wish into a brief an agent could execute, including constraints and non-goals. <!-- id: vibe-master-c05 energy: high -->
- [ ] I state acceptance criteria before starting, in terms someone else could check. <!-- id: vibe-master-c06 energy: high -->
- [ ] I decompose work into increments that are each verifiable on their own. <!-- id: vibe-master-c07 energy: high -->
- [ ] I can explain why ambiguity produces plausible wrong output rather than an error. <!-- id: vibe-master-c08 energy: high -->
- [ ] I state what must not change, not only what must. <!-- id: vibe-master-c09 energy: normal -->

## Reading what I shipped

- [ ] I review generated code at the right altitude: structure and contracts first, line detail second. <!-- id: vibe-master-c10 energy: high -->
- [ ] I can name the specific red flags in generated code — swallowed exceptions, invented API methods, missing error paths, boundary errors. <!-- id: vibe-master-c11 energy: high -->
- [ ] I verify that an API or library method actually exists before trusting code that calls it. <!-- id: vibe-master-c12 energy: high -->
- [ ] I run code rather than only reading it, and I can explain why reading is not verification. <!-- id: vibe-master-c13 energy: normal -->
- [ ] I check imports resolve and dependencies are real. <!-- id: vibe-master-c14 energy: normal -->
- [ ] I can spot a hardcoded secret, a missing authorization check, or an injection risk in a diff. <!-- id: vibe-master-c15 energy: high -->

## Tests as the contract

- [ ] I write the test first as a specification, then implement against it. <!-- id: vibe-master-c16 energy: high -->
- [ ] I can explain why a test written to pass proves nothing. <!-- id: vibe-master-c17 energy: high -->
- [ ] I can tell whether a model-written test actually checks the requirement or merely asserts current behaviour. <!-- id: vibe-master-c18 energy: high -->
- [ ] I use tests as the gate for accepting a change, not the model's self-report. <!-- id: vibe-master-c19 energy: high -->
- [ ] I write property or invariant tests where a single example is not enough. <!-- id: vibe-master-c20 energy: high -->

## Debugging

- [ ] I form a hypothesis about a failure **before** asking a model for help. <!-- id: vibe-master-c21 energy: high -->
- [ ] I supply real evidence — the full traceback, the actual input, the state — rather than a description of the symptom. <!-- id: vibe-master-c22 energy: normal -->
- [ ] I bisect a failure myself to narrow it before asking about it. <!-- id: vibe-master-c23 energy: high -->
- [ ] I know when to stop asking and start reading the code. <!-- id: vibe-master-c24 energy: high -->
- [ ] I refuse to accept a fix I do not understand, even when it works. <!-- id: vibe-master-c25 energy: high -->

## Running a session well

- [ ] I externalise plan, decisions and progress to files rather than holding them in a conversation. <!-- id: vibe-master-c26 energy: high -->
- [ ] I recognise when a session has degraded and reset with a handoff note instead of continuing. <!-- id: vibe-master-c27 energy: high -->
- [ ] I keep my working set small and avoid pasting whole files when a function suffices. <!-- id: vibe-master-c28 energy: normal -->
- [ ] I re-state constraints after a summary or compaction. <!-- id: vibe-master-c29 energy: normal -->

## Working with agents

- [ ] I give a coding agent a bounded task with a verifiable end state. <!-- id: vibe-master-c30 energy: high -->
- [ ] I review the **diff** rather than trusting the agent's summary, and I can explain why the report is a claim and the diff is evidence. <!-- id: vibe-master-c31 energy: high -->
- [ ] I commit before an agent run so I can revert. <!-- id: vibe-master-c32 energy: normal -->
- [ ] I notice scope creep in a diff and reject it deliberately. <!-- id: vibe-master-c33 energy: high -->
- [ ] I check that the agent actually ran the tests rather than reporting that it did. <!-- id: vibe-master-c34 energy: high -->

## Shipping

- [ ] I run a security review on generated code before it goes anywhere public. <!-- id: vibe-master-c35 energy: high -->
- [ ] I verify dependencies are maintained, licensed and actually needed. <!-- id: vibe-master-c36 energy: normal -->
- [ ] I know what I must disclose about AI assistance, and I do it. <!-- id: vibe-master-c37 energy: normal -->
- [ ] I have written an honest README that states what the project does **not** do. <!-- id: vibe-master-c38 energy: normal -->
- [ ] I can explain my own project six months later, because I understood it when I shipped it. <!-- id: vibe-master-c39 energy: high -->

---

## What this checklist is not

It is not a claim that you can build anything, and it is not a measure of how fast you work. **Speed is explicitly not on this list**, because this track's whole argument is that speed is easy to mistake for progress.

**The load-bearing items are the reading and testing sections.** Specifying, reading and testing generated code are what make everything else safe. If you tick only those and nothing about agents or shipping, you have the core of the track — and you are in a far better position than someone who has shipped five projects they cannot explain.
