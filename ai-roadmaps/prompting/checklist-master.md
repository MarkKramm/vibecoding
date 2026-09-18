# Prompting — Master Checklist

This is the **track-level** checklist. The phase checklists are inside the phase files. What follows are the things that should be true of you **when the whole track is done** — cross-cutting capabilities that emerge from several phases together, and that no single phase can establish on its own.

**Tick only what you can actually do.** Rule 6 of the study rules applies: your own words, or it did not happen. Prompting in particular is easy to feel competent at and hard to be competent at, because a fluent answer looks like a correct one. If you cannot demonstrate an item today, the phase it names is where to go back.

---

## Specification and structure

- [ ] I can look at a bad output and say which part of the prompt was underspecified, rather than rewriting at random. <!-- id: prompt-master-c01 energy: high -->
- [ ] I can write a prompt that separates instruction from data clearly enough that a model does not confuse them. <!-- id: prompt-master-c02 energy: normal -->
- [ ] I can state what "done" means for a prompt task before I run it, in terms someone else could check. <!-- id: prompt-master-c03 energy: normal -->
- [ ] I can decide deliberately between zero-shot, few-shot and reasoning approaches, and explain the tradeoff I chose. <!-- id: prompt-master-c04 energy: high -->

## Reasoning and examples

- [ ] I can explain why step-by-step reasoning improves accuracy on multi-step problems, and name a case where it does not help. <!-- id: prompt-master-c05 energy: high -->
- [ ] I can explain how reasoning-trained models change the advice about prompting them. <!-- id: prompt-master-c06 energy: high -->
- [ ] I can explain what few-shot examples actually do — that they demonstrate a pattern in the context — and predict when they will mislead. <!-- id: prompt-master-c07 energy: high -->
- [ ] I can choose examples deliberately, including what to include and what to leave out. <!-- id: prompt-master-c08 energy: normal -->

## Reliable output

- [ ] I can get machine-parseable structured output from a model and validate it in code rather than trusting it. <!-- id: prompt-master-c09 energy: normal -->
- [ ] I can explain why a schema is enforced by a parser rather than by asking the model nicely. <!-- id: prompt-master-c10 energy: normal -->
- [ ] I can handle a validation failure by feeding the error back rather than by rephrasing at random. <!-- id: prompt-master-c11 energy: high -->

## Context and decomposition

- [ ] I design what goes into a context window on purpose — what to include, summarise, drop, and where to place it. <!-- id: prompt-master-c12 energy: high -->
- [ ] I can explain why the position of information in a long context affects whether the model uses it. <!-- id: prompt-master-c13 energy: high -->
- [ ] I can break a task into chained steps, and say why the chain beats one large prompt for that problem. <!-- id: prompt-master-c14 energy: high -->
- [ ] I can recognise when a chain has made a problem worse rather than better. <!-- id: prompt-master-c15 energy: high -->

## Measuring, not assuming

- [ ] I have a small evaluation set of my own — real inputs with a stated pass criterion — and I use it before claiming an improvement. <!-- id: prompt-master-c16 energy: high -->
- [ ] I can tell a real improvement from run-to-run variation, and I know why a single good output proves nothing. <!-- id: prompt-master-c17 energy: high -->
- [ ] I can name the failure modes of my own prompts rather than describing them as "sometimes it does not work". <!-- id: prompt-master-c18 energy: high -->
- [ ] I can explain prompt injection as a structural risk rather than a phrasing problem. <!-- id: prompt-master-c19 energy: high -->

## The habits this track is really teaching

- [ ] When a prompt fails, my first move is to diagnose rather than to add more words. <!-- id: prompt-master-c20 energy: normal -->
- [ ] I can explain why a technique works, not just that it does — so I can evaluate whether it still applies when the model changes. <!-- id: prompt-master-c21 energy: high -->
- [ ] I have written, in my own words, what I would tell someone starting this track about what actually matters in it. <!-- id: prompt-master-c22 energy: normal -->

---

## What this checklist is not

It is not a list of tricks, and ticking it does not mean you have a prompt library. It means you can reason about why a prompt behaves as it does, which is what survives the model landscape changing underneath you.

**The one item to take seriously above the others** is `prompt-master-c16`. Building a small evaluation set is the difference between prompting as a skill and prompting as a habit of guessing, and it is the item most people skip because it is the least enjoyable.
