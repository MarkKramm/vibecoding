# Finetuning & Evals — Master Checklist

This is the **track-level** checklist. Phase checklists live inside the phase files. These items should be true of you **when the whole track is done** — capabilities that require several phases together.

> **Status note.** This track is **in progress**: Phase 1 is written and the remaining phases are being authored. This checklist is therefore the **target**, not a list you can complete today. It is published now so you can see what the track is aiming at and decide whether it is worth your time. Do not treat an unticked box as a failure — several of them cannot be ticked until the phases that teach them exist.

**Tick only what you can actually do.** Rule 6 of the study rules: your own words, or it did not happen. Fine-tuning in particular invites false confidence, because a run that completes looks like a run that worked.

---

## The decision, which comes first

- [ ] I can decide, defensibly, whether a problem calls for fine-tuning, retrieval, a better prompt, a tool, or nothing at all. <!-- id: ft-master-c01 energy: high -->
- [ ] I can state the correct ordering of questions to ask before fine-tuning, and explain why fine-tuning is last. <!-- id: ft-master-c02 energy: normal -->
- [ ] I can explain why fine-tuning changes behaviour well and injects facts poorly. <!-- id: ft-master-c03 energy: high -->
- [ ] I can name the five underestimated costs of a fine-tune, including maintenance after deployment. <!-- id: ft-master-c04 energy: high -->
- [ ] I can describe a case where fine-tuning genuinely is the right answer, and say what makes it right. <!-- id: ft-master-c05 energy: high -->

## The mechanism

- [ ] I can explain what full fine-tuning costs in memory, and why it is several times inference. <!-- id: ft-master-c06 energy: high -->
- [ ] I can explain catastrophic forgetting and why a frozen base model reduces it. <!-- id: ft-master-c07 energy: high -->
- [ ] I can explain LoRA as a low-rank update to a frozen weight matrix, and why it is mergeable with no inference cost. <!-- id: ft-master-c08 energy: high -->
- [ ] I can explain why the second LoRA matrix is initialised to zero. <!-- id: ft-master-c09 energy: high -->
- [ ] I can explain what QLoRA adds, and why it is what makes fine-tuning possible on free hardware. <!-- id: ft-master-c10 energy: high -->
- [ ] I can say which LoRA hyperparameter usually matters more than rank, and why. <!-- id: ft-master-c11 energy: high -->

## Data — the 80% of the work

- [ ] I can define the behaviour I want precisely enough to write a dataset for it. <!-- id: ft-master-c12 energy: high -->
- [ ] I have collected real inputs rather than invented ones. <!-- id: ft-master-c13 energy: normal -->
- [ ] I can explain why model-generated training data must be human-verified, and where that step gets skipped. <!-- id: ft-master-c14 energy: high -->
- [ ] I format training data in the model's exact chat template, and can explain the silent failure that follows if I do not. <!-- id: ft-master-c15 energy: high -->
- [ ] I split train and validation by source rather than at random. <!-- id: ft-master-c16 energy: high -->
- [ ] I include hard cases and honest "I do not know" cases in my dataset. <!-- id: ft-master-c17 energy: normal -->
- [ ] I can explain why a few hundred well-chosen examples beat a few thousand careless ones. <!-- id: ft-master-c18 energy: normal -->

## Running one

- [ ] I have run a complete fine-tune on free hardware and saved the result somewhere persistent. <!-- id: ft-master-c19 energy: high -->
- [ ] I can explain why a free notebook session dying mid-run is a planning problem, not bad luck. <!-- id: ft-master-c20 energy: normal -->
- [ ] I can explain what an epoch is and why instruction tuning often needs only a few. <!-- id: ft-master-c21 energy: normal -->
- [ ] I can recognise overfitting from the training and validation curves. <!-- id: ft-master-c22 energy: high -->

## Evaluation — the half that matters most

- [ ] I have built a golden dataset of real inputs with an objective pass criterion per case. <!-- id: ft-master-c23 energy: high -->
- [ ] I can explain why code beats a judge whenever the outcome is checkable. <!-- id: ft-master-c24 energy: high -->
- [ ] I can name the biases of LLM-as-judge and the specific mitigation for each. <!-- id: ft-master-c25 energy: high -->
- [ ] I use a different model family as judge when I use a judge at all. <!-- id: ft-master-c26 energy: high -->
- [ ] I can explain why a benchmark score can mislead me, and name at least two reasons. <!-- id: ft-master-c27 energy: high -->
- [ ] I always compare a fine-tuned model against the **untuned baseline**. <!-- id: ft-master-c28 energy: high -->
- [ ] I check general capability after a fine-tune for signs of forgetting. <!-- id: ft-master-c29 energy: high -->
- [ ] I have written a minimal evaluation harness myself rather than adopting a framework first. <!-- id: ft-master-c30 energy: high -->
- [ ] I run the suite as a regression gate rather than only when I am curious. <!-- id: ft-master-c31 energy: high -->
- [ ] I never tune on my test set, and I can explain why "fixing" an expectation is a way to launder a regression. <!-- id: ft-master-c32 energy: high -->

## Distillation

- [ ] I can explain sequence-level distillation and why it is the common form in practice. <!-- id: ft-master-c33 energy: high -->
- [ ] I can explain the filtering step and why it decides whether distillation works. <!-- id: ft-master-c34 energy: high -->
- [ ] I can state the licence and terms-of-service question honestly, and treat it as contractual. <!-- id: ft-master-c35 energy: high -->
- [ ] I can describe the economics: a small distilled model handling the easy majority of a workload. <!-- id: ft-master-c36 energy: high -->

## The habits this track is really teaching

- [ ] My default answer to "should I fine-tune this?" is a reasoned no, arrived at rather than assumed. <!-- id: ft-master-c37 energy: high -->
- [ ] I measure the effect of a change instead of forming an impression of it. <!-- id: ft-master-c38 energy: high -->
- [ ] I report stability across runs rather than a single result, and I know that a prompt passing 60% of the time is a different product from one passing 100%. <!-- id: ft-master-c39 energy: high -->
- [ ] I can explain why an evaluation suite is what makes changing models a measured migration rather than a frightening one. <!-- id: ft-master-c40 energy: high -->

---

## What this checklist is not

It is not a requirement to train a large model. **Training at scale is not on this list at all**, because free hardware cannot do it and no beginner needs it.

**The evaluation section is the part to prioritise.** It is the highest-leverage material in the whole curriculum, the least volatile, and — per the Career track — the most accessible junior entry point in the field. A learner who can tick the evaluation section and nothing else is more employable than one who has trained a model and cannot say whether it helped.
