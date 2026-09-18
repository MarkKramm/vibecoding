---
id: ft-02-lora-and-peft
track: finetuning
phase: 2
order: 20
title: LoRA, QLoRA and PEFT
duration: 1 week
duration_weeks: 1
energy_mix: [high, normal]
deliverable: portfolio/finetuning/02-lora-and-peft.md
exit_criteria: >
  You can compute the memory a full fine-tune would need and explain why it is
  roughly three to four times the inference footprint. You can write out the LoRA
  update W = W0 + B*A and explain why B is zero-initialised. You can choose rank,
  alpha and target modules for a task and justify each, and you can explain what
  QLoRA's three innovations buy and what they cost.
---

# Phase 2 — LoRA, QLoRA and PEFT

## Goal of this phase

Phase 1 decided *whether* to fine-tune. This phase is about *how*, when the answer was yes — and the answer to "how" is almost never "update all the weights."

Full fine-tuning means training every parameter in the model. For a 7-billion-parameter model in 16-bit precision that is 14 GB just to hold the weights, and the arithmetic does not stop there: training also needs gradients, and the Adam optimizer keeps two more moments per parameter. That lands somewhere around **three to four times the inference footprint**, before activations. It is the reason full fine-tuning is out of reach for most people and most budgets, and the reason **parameter-efficient fine-tuning** — PEFT — exists.

The central technique is **LoRA**: Low-Rank Adaptation. Instead of updating the model's weight matrix `W`, you freeze it and learn a small *correction* to it, factored into two thin matrices. The modified forward pass is:

```text
W = W0 + B*A     where  A is (r × k), B is (d × r), and r is small
```

Three properties of that formula do most of the work, and this phase is largely about understanding why each one matters:

- **`W0` stays frozen.** The pre-trained model is untouched, so you cannot destroy what it already knows. This is why LoRA reduces catastrophic forgetting almost by construction rather than by careful tuning.
- **`B` is initialised to zero, and `A` randomly.** At step zero, `B*A = 0`, so the model's behaviour is *exactly* the pre-trained model's behaviour. Training begins from a known-good state and can only improve it. If both matrices were random, your first steps would inject noise into a working model.
- **The result is mergeable.** Because it is just an additive update to weights you still have, you can fold `B*A` back into `W0` at the end. The deployed model is a normal model with **no added inference latency** — unlike earlier adapter methods, which inserted layers and paid for them on every call.

That third point is easy to read past and is genuinely important: LoRA changes your training cost without changing your serving cost.

**QLoRA** goes further and is what makes this practical on free hardware. It quantizes the frozen base model to 4 bits, then trains LoRA adapters on top. The original result fine-tuned a **65-billion-parameter model on a single 48 GB GPU** while preserving full 16-bit fine-tuning task performance. If you have ever wondered how people fine-tune on a free Colab session, this is the answer.

By the end you will have the memory arithmetic at your fingertips, a justification for every hyperparameter you set, and a small adapter you actually trained.

## Estimated time

**1 week** at 1–2 hours a day, 5 days a week. Roughly 7–9 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Why full fine-tuning is expensive — the memory arithmetic | 1.5h |
| 2 | The LoRA update, and why the initialisation matters | 1.5h |
| 3 | Rank, alpha and target modules | 1.5h |
| 4 | QLoRA's three innovations, and what they cost | 1.5h |
| 5 | Forgetting, baselines, and training your own adapter | 2h |

If you only have three hours this week, do tasks 2, 6 and 12. Those give you the memory arithmetic, a justified hyperparameter choice, and a trained adapter you can evaluate.

This phase is the most technical in the track. Do not rush the arithmetic on day 1 — every later decision depends on understanding *why* the base is frozen.

## Skills you'll gain

- Compute the memory a full fine-tune needs and compare it to inference.
- Write the LoRA update and explain the role of each term.
- Explain why `B` is zero-initialised and what breaks without it.
- Choose rank, alpha and target modules, and justify each choice.
- Explain what `alpha/r` scaling does and when to change it.
- Explain QLoRA's three innovations and the cost each one pays.
- Judge whether a given model will fit on a given GPU.
- Explain why LoRA and QLoRA reduce catastrophic forgetting.
- Compare against an untuned baseline, and check general capability for forgetting.

## Specific topics to learn

- **The memory arithmetic** — weights, gradients, two Adam moments, activations.
- **Catastrophic forgetting** — what it is and why full fine-tuning causes it.
- **LoRA's low-rank decomposition** — `W = W0 + B*A`.
- **Zero-initialisation of `B`** — why training starts at pre-trained behaviour.
- **Rank `r`** — capacity, and the low-intrinsic-rank finding.
- **The parameter count** — `d*k` becoming `r*(d+k)`.
- **`alpha` and the `alpha/r` scaling ratio.**
- **`target_modules`** — which weight matrices to adapt, and why it often matters more than `r`.
- **Dropout** on the adapter.
- **Merging** — why LoRA adds no inference latency.
- **QLoRA** — NF4, double quantization, paged optimizers.
- **PEFT** as the umbrella term, and where other methods fit.
- **Baselines and forgetting checks** — the discipline that makes results trustworthy.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| `peft` | The reference LoRA/QLoRA implementation | Free/open-source | https://huggingface.co/docs/peft/index | Tasks t06–t12 — configure and attach adapters | Any PEFT library, or hand-written LoRA layers |
| `transformers` | Load and run the base model | Free/open-source | https://huggingface.co/docs/transformers/index | Task t03 — measure the inference footprint of a real model | Any inference library |
| `bitsandbytes` | 4-bit quantization, the mechanism behind QLoRA | Free/open-source | https://github.com/bitsandbytes-foundation/bitsandbytes | Task t09 — quantize a base model and measure the saving | QLoRA is implementable by hand; the library is convenience |
| Unsloth | Faster, lower-memory LoRA training, well documented for free tiers | Free/open-source | https://github.com/unslothai/unsloth | Task t12 — train an adapter on a free GPU | `peft` plus `trl` directly |
| `trl` | Supervised fine-tuning trainer that wires the loop for you | Free/open-source | https://huggingface.co/docs/trl/index | Task t12 — the training loop | A hand-written PyTorch loop |
| Google Colab | Free GPU to run the adapter training | Freemium | https://colab.research.google.com/ | Task t12 — a T4 is enough for a small model | Kaggle Notebooks, usually a longer weekly quota |
| Weights & Biases | Track loss across runs so comparisons are real | Freemium | https://wandb.ai/ | Task t11 — compare tuned against untuned | TensorBoard, or logging to a CSV |

## Free/cheap resources

- **The LoRA paper (arXiv:2106.09685)** — abstract and section 1 are the essential reading. The low-intrinsic-rank investigation is the part that explains *why* the method works at all, and it is more readable than the reputation of papers suggests.
- **The QLoRA paper (arXiv:2305.14314)** — read the abstract and the description of the three innovations (NF4, double quantization, paged optimizers). The paper's own framing that a small high-quality dataset beats a large poor one is Phase 3's subject.
- **The `peft` documentation on LoRA** — the most current source for which parameters exist, because hyperparameter names and defaults change between library versions.
- **Unsloth's notebooks** — free, runnable, and written for exactly the hardware you have access to.
- **Your Phase 1 deliverable** — if your decision record concluded "do not fine-tune," you can still do every task here on a toy task. The skills are the point.

## Lesson: Why You Freeze the Base

### The memory arithmetic, first

Before the clever part, the problem it solves. Fine-tuning needs to hold more than the weights, and the extras are what actually break your GPU budget.

| What | Size | Notes |
|---|---|---|
| Weights | `P × bytes` | 7B params at 16-bit = 14 GB |
| Gradients | `P × bytes` | Same size as the weights, but only for *trainable* params |
| Adam moment 1 | `P × 4` | Always 32-bit in practice |
| Adam moment 2 | `P × 4` | Always 32-bit in practice |
| Activations | varies | Grows with batch size × sequence length; reduced by gradient checkpointing |

So a full fine-tune of a 7B model in mixed precision is roughly `14 + 14 + 28 + 28` GB before activations — which is why the rule of thumb is **three to four times the inference footprint**, and why a model that happily *runs* on your GPU cannot necessarily be *trained* on it.

Notice where the leverage is. The weights are the thing you cannot shrink without quantizing. But gradients and both optimizer moments scale with the number of **trainable** parameters. If you could make that number tiny while still changing the model's behaviour, everything except the weights collapses.

That is precisely what LoRA does.

```text
Full fine-tuning:   trainable = P                    (all of them)
LoRA:               trainable = r*(d+k) per matrix   (a rounding error)
QLoRA:              trainable = r*(d+k), weights in 4-bit
```

### The LoRA update

For a weight matrix `W0` of shape `(d × k)`, a full fine-tune learns a new `W` with `d*k` parameters. LoRA instead learns a *correction*, factored into two thin matrices:

```text
W = W0 + B*A

  W0 : (d × k)   frozen, never updated
  A  : (r × k)   randomly initialised
  B  : (d × r)   ZERO initialised
  r  : the rank, chosen by you, and r << min(d, k)

  trainable parameters: d*k  ->  r*(d + k)
```

The parameter saving is the headline. For a `4096 × 4096` matrix at rank 8: `d*k` is about 16.8 million, while `r*(d+k)` is about 65 thousand — roughly a **250-fold** reduction for that matrix. Scaled across a whole model, the LoRA paper reports reductions of **10,000 times** in trainable parameters and **3 times** in GPU memory against full fine-tuning of GPT-3 175B with Adam.

But the parameters are not the interesting part. These three properties are:

**1. `W0` is frozen, so nothing is destroyed.** The pre-trained weights are read-only. This is why LoRA and QLoRA **reduce catastrophic forgetting inherently** — not through a regularisation trick that you must tune, but because the original knowledge is still physically present and the adapter is a bounded correction on top of it. Catastrophic forgetting is what happens when gradient updates overwrite the weights that encoded earlier knowledge; a frozen base cannot be overwritten.

**2. `B` starts at zero, so training begins exactly at pre-trained behaviour.** At initialisation, `B*A = 0`, which means `W = W0` precisely and the model's first forward pass is *identical* to the unmodified model's. Loss starts where the base model's loss is, and every subsequent step is a genuine improvement on a known-good state.

This is worth dwelling on, because it is the kind of detail that looks arbitrary and is not. If you initialised both `A` and `B` randomly, your first updates would push a **working** model in a random direction, and early training would spend its time recovering from damage you inflicted rather than learning your task. The asymmetry — random `A`, zero `B` — preserves the function at step zero while still breaking the symmetry that would otherwise make the two matrices learn nothing. (Zero-initialising *both* would be worse: the gradient with respect to `A` depends on `B`, so both at zero gives no learning signal at all.)

**3. It merges, so serving costs nothing extra.** `W0 + B*A` is just a matrix you can compute. Add it, store the result, and you have an ordinary model. Unlike adapter layers that insert new computation into the forward pass, LoRA's contribution disappears at inference time. **Your training is cheaper and your serving is unchanged** — which is unusual, and is a large part of why LoRA displaced earlier PEFT methods.

### Choosing the hyperparameters

Four knobs matter, and one of them is consistently underrated.

| Hyperparameter | What it does | Practical guidance |
|---|---|---|
| `r` (rank) | Capacity of the correction | 8–16 for most tasks; raise it if underfitting, but returns diminish fast |
| `alpha` | Scaling; the update is scaled by `alpha/r` | Commonly set to `r` or `2r`; treat `alpha/r` as the real knob |
| `target_modules` | **Which** weight matrices get adapted | **Often matters more than `r`** — start by adapting all attention projections |
| `dropout` | Regularisation on the adapter | 0.05–0.1; raise it if you are overfitting on a small dataset |

**On rank.** The paper's central empirical finding is that adaptation has a **low intrinsic rank** — the update needed to specialise a large model to a task lives in a much smaller subspace than the full weight matrix. That is the justification for the whole method, and it explains why `r = 8` frequently performs on par with full fine-tuning. It also explains why pushing `r` very high gives diminishing returns rather than proportional gains: past the intrinsic rank of your task, the extra capacity is fitting noise.

**On `alpha`.** The update is scaled by `alpha/r`, so raising `r` while holding `alpha` fixed *increases* the effective step size. This is why the conventional advice is to scale `alpha` with `r` — people who increase `r` and see training destabilise have usually changed the effective learning rate without meaning to. Treating `alpha/r` as the parameter you are actually setting makes the interaction obvious.

**On target modules — the underrated one.** You are not obliged to adapt every weight matrix. Adapting only the query and value projections is a common default; adapting all attention projections usually helps; on some tasks the MLP layers matter more. **Which matrices you target frequently changes results more than the rank does**, and it is cheap to test, because changing it costs one training run and no new hyperparameter intuition. If your adapter underperforms and you have already tried raising `r`, change the targets before raising `r` again.

### QLoRA — what makes it fit

LoRA shrinks the trainable parameters. The base weights are still full precision, and for a large model that is still the binding constraint. **QLoRA** attacks that too, and its contribution is three specific techniques rather than one:

| Innovation | What it does | What it costs |
|---|---|---|
| **NF4** (4-bit NormalFloat) | A 4-bit data type that is information-theoretically optimal for normally distributed weights | Quantization error, though the paper reports task performance preserved |
| **Double quantization** | Quantizes the *quantization constants* themselves, saving memory twice over | A little more computation to dequantize on the fly |
| **Paged optimizers** | Move optimizer state to CPU memory to absorb memory spikes | Slower when paging happens, but it prevents the out-of-memory crash |

The headline result is that this fine-tunes a **65B model on a single 48 GB GPU** while preserving full 16-bit fine-tuning task performance. That is the sentence that explains the entire feasibility of doing this on consumer hardware or a free notebook tier — and its practical form today is QLoRA on a 7B or 8B model in a free Colab session.

⚠️ **Volatile:** the specific models that fit on a specific GPU, and the exact memory each one needs, change as models and libraries change. Compute it for your own case rather than trusting a table, including this one.

### The discipline that makes results trustworthy

Two habits separate a result you can defend from a number you hope is right.

**Always compare against the untuned baseline.** The most common way to fool yourself is to train an adapter, look at its outputs, decide they are good, and never measure what the base model would have scored on the same evaluation. Sometimes the base model was already fine, and your adapter made it worse in ways that are invisible without a measurement. You built that measurement in Phase 1's ladder and you will build it properly in Phase 4 — use it here.

**Always check general capability, not just your task.** A model can improve at your task while quietly getting worse at everything else, and your narrow eval suite will not notice. Run a handful of unrelated prompts before and after. With a frozen base this is much less likely than with full fine-tuning, but "much less likely" is not "impossible" — the adapter still influences every forward pass, and a badly configured one can distort behaviour well beyond its intended scope.

### What you should have at the end

By the close of this phase you should be able to look at a proposed fine-tune and answer, from memory: how much memory will a full fine-tune need, why is that more than inference, what does LoRA change about that arithmetic, why does starting at `B = 0` matter, which modules you would target, and what you would compare against. Those answers are the phase. The adapter you train is the evidence that you understood them.

## Hands-on practice tasks

1. Compute the full fine-tuning memory for a 7B model in 16-bit: weights, gradients and both Adam moments. State the total and compare it to the inference footprint. <!-- id: ft-02-lora-and-peft-t01 band: focused energy: normal -->
2. Write out `W = W0 + B*A` from memory, labelling the shape of each term and which ones are frozen, random and zero. <!-- id: ft-02-lora-and-peft-t02 band: quick energy: low -->
3. Load a small model and measure its actual inference memory footprint, then compare your measurement to your task 1 estimate. <!-- id: ft-02-lora-and-peft-t03 band: focused energy: normal -->
4. Calculate trainable parameters for a `4096 × 4096` matrix at rank 8 and rank 64. Compute the reduction against full fine-tuning for each. <!-- id: ft-02-lora-and-peft-t04 band: focused energy: normal -->
5. Explain in writing what would happen if you initialised both `A` and `B` to zero, and separately if you initialised both randomly. <!-- id: ft-02-lora-and-peft-t05 band: focused energy: high -->
6. Attach a LoRA adapter to a small model and confirm the loss at step zero matches the base model's loss on the same batch. <!-- id: ft-02-lora-and-peft-t06 band: deep energy: high -->
7. Train two adapters on the same data with different ranks and compare. State whether the higher rank earned its extra capacity. <!-- id: ft-02-lora-and-peft-t07 band: deep energy: high -->
8. Train two more with different `target_modules`, holding rank fixed. Compare against your rank experiment and state which knob mattered more. <!-- id: ft-02-lora-and-peft-t08 band: deep energy: high -->
9. Quantize a base model to 4-bit and measure the memory saved. Then train an adapter on the quantized model and confirm it works. <!-- id: ft-02-lora-and-peft-t09 band: deep energy: high -->
10. Merge an adapter into its base model. Verify that outputs are equivalent and measure whether inference latency changed. <!-- id: ft-02-lora-and-peft-t10 band: focused energy: normal -->
11. Evaluate your tuned model against the untuned baseline on the same inputs. Report both numbers, not just the better one. <!-- id: ft-02-lora-and-peft-t11 band: deep energy: high -->
12. Run a set of unrelated general prompts through both versions and record whether general capability degraded. <!-- id: ft-02-lora-and-peft-t12 band: focused energy: high -->
13. Break your own setup deliberately: set `alpha` far too high and record what training does. Explain the failure in terms of `alpha/r`. <!-- id: ft-02-lora-and-peft-t13 band: focused energy: high -->
14. Write a short specification for the adapter you would train on your own Phase 1 use case: rank, alpha, targets, dropout, and a one-line justification for each. <!-- id: ft-02-lora-and-peft-t14 band: ongoing energy: normal -->

## Common Pitfalls

**Training without a baseline.** If you never measured the untuned model, you do not know whether you improved anything. This is the most common self-deception in fine-tuning, and it is entirely avoidable.

**Raising `r` before reconsidering `target_modules`.** Target selection frequently matters more than rank, costs nothing extra to change, and is tried far less often. Exhaust it first.

**Changing `r` while holding `alpha` fixed without noticing.** Because the update scales as `alpha/r`, you have quietly changed the effective step size. Scale them together, or think in terms of `alpha/r`.

**Assuming a model that runs can be trained.** Training needs several times the inference memory. Compute it rather than discovering it as an out-of-memory error an hour into a run.

**Expecting the adapter to add knowledge.** Phase 1's distinction applies with full force: LoRA shapes behaviour. If your problem was factual, no rank will fix it.

**Judging the adapter only on your task.** Check general capability too. A frozen base makes forgetting unlikely, not impossible.

**Trusting a blog post's hyperparameters.** Defaults differ between library versions and the good settings are task-dependent. Start from documented defaults, then measure.

**Leaving checkpoints in an ephemeral session.** Free GPU sessions die, and a run that took two hours can vanish. Write adapters to persistent storage as you go — Phase 3 covers the workflow.

## Deliverable / proof of work

Create `portfolio/finetuning/02-lora-and-peft.md` containing:

1. **The memory arithmetic** for a model you chose, with every term shown: weights, gradients, both optimizer moments, and your activations estimate.
2. **The LoRA update written out**, with each term labelled by shape and role, and a paragraph on why `B` is zero-initialised.
3. **A trained adapter**, described: base model, hyperparameters, dataset size, and how long it took.
4. **A comparison against the untuned baseline**, with the actual numbers for both.
5. **A general-capability check**, with the prompt set and the before/after observations.
6. **One experiment that failed**, what you changed, and what the failure taught you about which knob does what.

The failed experiment is required, not optional. A portfolio that reports only successes demonstrates that you can follow a tutorial; one that reports a diagnosed failure demonstrates that you understand the mechanism.

## Checklist

- [ ] I can compute the memory a full fine-tune needs from the parameter count <!-- id: ft-02-lora-and-peft-c01 energy: high -->
- [ ] I can explain why training needs three to four times the inference footprint <!-- id: ft-02-lora-and-peft-c02 energy: normal -->
- [ ] I can write `W = W0 + B*A` and label every term <!-- id: ft-02-lora-and-peft-c03 energy: normal -->
- [ ] I can explain why `B` is zero-initialised and what breaks otherwise <!-- id: ft-02-lora-and-peft-c04 energy: high -->
- [ ] I understand that a frozen base is what reduces forgetting <!-- id: ft-02-lora-and-peft-c05 energy: high -->
- [ ] I can explain why merging means no added inference latency <!-- id: ft-02-lora-and-peft-c06 energy: normal -->
- [ ] I understand `alpha/r` as the effective scaling knob <!-- id: ft-02-lora-and-peft-c07 energy: normal -->
- [ ] I know that `target_modules` often matters more than `r` <!-- id: ft-02-lora-and-peft-c08 energy: normal -->
- [ ] I can name QLoRA's three innovations and what each costs <!-- id: ft-02-lora-and-peft-c09 energy: normal -->
- [ ] I understand why QLoRA is what makes free-tier training possible <!-- id: ft-02-lora-and-peft-c10 energy: normal -->
- [ ] I trained an adapter and compared it against the untuned baseline <!-- id: ft-02-lora-and-peft-c11 energy: high -->
- [ ] I checked general capability for degradation, not just my task <!-- id: ft-02-lora-and-peft-c12 energy: high -->
- [ ] I have one diagnosed failure written up, not only successes <!-- id: ft-02-lora-and-peft-c13 energy: normal -->

## Quiz

### Q1. Why is the LoRA update initialised with `B` at zero? <!-- id: ft-02-lora-and-peft-q01 energy: high -->

- [ ] To make the matrices cheaper to store
- [x] Because `B*A = 0` at step zero, so the model starts at exactly its pre-trained behaviour and every step improves a known-good state
- [ ] To prevent the gradients from being computed
- [ ] Because zero is the optimal solution for the adapter

**Why:** At initialisation the forward pass is identical to the unmodified model's, so training begins from a working system rather than from one you have just damaged with random updates. The asymmetry matters in both directions: random `A` breaks symmetry so the two matrices can learn different things, while zero `B` preserves the function. Zero-initialising *both* would be worse than randomising both, because the gradient with respect to `A` depends on `B` — both at zero produces no learning signal at all.

### Q2. What does LoRA change about serving cost? <!-- id: ft-02-lora-and-peft-q02 energy: normal -->

- [ ] It adds a small per-call overhead proportional to rank
- [x] Nothing — the adapter merges into the base weights, so the deployed model is an ordinary model with no added inference latency
- [ ] It roughly doubles inference latency
- [ ] It requires a separate model server per adapter

**Why:** Because `W0 + B*A` is simply a matrix you can precompute, the LoRA contribution disappears at serving time. This is what distinguished it from earlier adapter methods, which inserted new layers into the forward pass and paid that cost on every request. The practical consequence is unusual and worth remembering: LoRA reduces your *training* cost while leaving your *serving* cost untouched, so the economics improve on the training side only.

### Q3. You raise `r` from 8 to 64 but leave `alpha` at 8. What else have you changed? <!-- id: ft-02-lora-and-peft-q03 energy: high -->

- [ ] Nothing else changes
- [ ] The number of frozen parameters
- [x] The effective scaling, because the update is scaled by `alpha/r` — you have reduced it by a factor of 8
- [ ] The model's context window

**Why:** `alpha/r` is the quantity that actually multiplies the update, so `r = 64` with `alpha = 8` scales the adapter's contribution down eightfold compared with `r = 8`. This is why the conventional practice is to scale `alpha` with `r` — people who raise rank and find training destabilised, or that the adapter barely learns, have usually altered the effective learning rate without intending to. Thinking in terms of the ratio rather than the two values separately makes the interaction visible.

### Q4. Which hyperparameter is most underrated? <!-- id: ft-02-lora-and-peft-q04 energy: normal -->

- [x] `target_modules` — which weight matrices you adapt, which often matters more than rank
- [ ] `r`, the rank
- [ ] The learning rate
- [ ] The batch size

**Why:** Rank gets the attention because it is the method's namesake parameter, but which matrices receive adapters frequently changes results more, and testing it costs one run and no new intuition. Adapting only query and value projections is a common default; all attention projections usually helps; on some tasks the MLP layers matter more. If an adapter underperforms and you have already tried raising rank, change the targets before raising it again.

### Q5. Why does LoRA inherently reduce catastrophic forgetting? <!-- id: ft-02-lora-and-peft-q05 energy: high -->

- [ ] Because it uses a smaller learning rate
- [ ] Because it trains on less data
- [x] Because the pre-trained weights stay frozen, so the knowledge they encode is still physically present and the adapter is a bounded correction on top
- [ ] Because it adds a regularisation penalty

**Why:** Catastrophic forgetting happens when gradient updates overwrite the weights that stored earlier knowledge. A frozen base cannot be overwritten, so the mechanism is removed rather than discouraged. That is a stronger guarantee than a tuned penalty, and it is worth contrasting with full fine-tuning, where every parameter is a candidate for being overwritten. It is still not immunity — the adapter influences every forward pass — which is why checking general capability remains necessary rather than optional.

### Q6. What does QLoRA's double quantization quantize? <!-- id: ft-02-lora-and-peft-q06 energy: high -->

- [ ] The LoRA adapter weights
- [ ] The gradients
- [x] The quantization constants themselves, saving memory twice over
- [ ] The activations

**Why:** The first quantization compresses the weights to 4 bits; the second compresses the constants that describe that compression, which would otherwise be a meaningful overhead on top of an already tiny representation. Combined with NF4 — a 4-bit type tuned for normally distributed weights — and paged optimizers that move state to CPU memory to absorb spikes, this is what allowed a 65B model to be fine-tuned on a single 48 GB GPU while preserving full 16-bit fine-tuning performance.

### Q7. Your adapter scores better than you expected on your task. What is the first thing to check? <!-- id: ft-02-lora-and-peft-q07 energy: high -->

- [ ] Whether you should raise the rank further
- [x] What the untuned baseline scores on the same evaluation — without that number the improvement is not established
- [ ] Whether the adapter has been merged
- [ ] Whether the learning rate was too high

**Why:** The most common self-deception in fine-tuning is training an adapter, inspecting a few outputs, deciding they look good, and never measuring what the base model would have scored on identical inputs. Sometimes the base was already adequate and the adapter made it worse in ways invisible without measurement. The confusing part is that this failure looks like success, which is exactly why the baseline is a prerequisite rather than a nicety.

## You're ready to move on when...

- You can compute full fine-tuning memory from a parameter count without looking it up.
- You can explain the three properties of the LoRA update, and why each matters.
- You can justify a rank, an alpha and a target-module choice for a specific task.
- You have trained an adapter and compared it honestly against the untuned baseline.
- You have checked general capability alongside your task metric.
- You have written up at least one failure and diagnosed which knob caused it.

## Free vs Paid

**The entire phase is free.** LoRA and QLoRA are open techniques with open implementations; `peft`, `transformers`, `bitsandbytes`, `trl` and Unsloth are all free and open-source, and Unsloth in particular is documented for exactly the free-tier hardware you have.

**The free path, concretely.** Google Colab and Kaggle Notebooks both offer free GPU sessions on a weekly quota, and a small model with QLoRA fits comfortably in a T4 session. That combination — QLoRA plus a free notebook — is genuinely sufficient for everything this phase asks. Kaggle usually gives a longer weekly quota than Colab; use whichever lasts you the week.

**Honest limits of the free path.** Free sessions are time-limited and disconnect without warning, so **save adapters and checkpoints to persistent storage** (Drive, or a Hugging Face repo) rather than leaving them in the session's filesystem. Training the same adapter twice because a session died is the most common wasted evening in this track. Free GPUs are also older and slower, so a run that takes twenty minutes on a paid A100 may take two hours; plan for iteration to be slower rather than concluding your configuration is wrong.

**What paid tiers add, and when they become worth it.** Hosted training services remove the infrastructure work, and rented GPU time by the hour removes the quota. Neither is necessary to learn this, and neither fixes the actual bottleneck in a fine-tuning project, which Phase 3 will show is the dataset. Spend money on this only once you have a measured reason to — meaning a working evaluation and a task that has cleared Phase 1's ladder.

**The one resource worth more than money:** the W&B free tier for experiment tracking. Comparing two runs by memory is unreliable, and a logged loss curve is what turns "I think the higher rank was better" into a fact.
