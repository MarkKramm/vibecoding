---
id: ft-03-datasets-and-training
track: finetuning
phase: 3
order: 30
title: Datasets and Running a Fine-Tune
duration: 2 weeks
duration_weeks: 2
energy_mix: [high, normal]
deliverable: portfolio/finetuning/03-datasets-and-training.md
exit_criteria: >
  You have built a dataset of real inputs with trustworthy outputs, formatted it
  in the base model's exact chat template, split it by source rather than
  randomly, and trained on free hardware with checkpoints saved to persistent
  storage. You can name the silent failure that a wrong chat template causes and
  describe how you would detect it.
---

# Phase 3 — Datasets and Running a Fine-Tune

## Goal of this phase

Roughly **80% of a fine-tuning project is the dataset.** This phase is about that 80%, and about the smaller part that is actually running the training.

The reason the ratio is so skewed is that a fine-tune can only learn what your data demonstrates. Every flaw in the data — wrong format, duplicated inputs, invented examples that do not resemble production traffic, outputs you did not verify — becomes a flaw in the model, and it arrives without a warning. Training will happily converge on bad data. Loss will fall. The curves will look healthy. This is why almost everything worth saying about fine-tuning is about data rather than about optimizers.

The phase is organised around a sequence you should not shortcut:

1. **Define the behaviour precisely, in writing, first.** If you cannot write down what the model should do, you cannot build a dataset that teaches it. This step is skipped constantly, and everything downstream inherits the vagueness.
2. **Collect real inputs.** Not invented ones. Invented examples encode your imagination of the task rather than the task.
3. **Produce gold outputs.** Human-written, or model-generated and then **human-verified**. Verification is the step that gets skipped, and it is the difference between a dataset and a liability.
4. **Format in the model's exact chat template.** Getting this wrong is the classic *silent* failure, and the phase explains why it is silent.
5. **Deduplicate, balance, and split by source** — never randomly.
6. **Include the hard cases and the "I don't know" cases.**
7. **Then** train, with checkpoints on persistent storage.

The governing principle is QLoRA's own framing: **quality beats quantity.** A few hundred excellent examples repeatedly outperform thousands of mediocre ones, which is counterintuitive enough that people keep relearning it.

By the end you will have a real dataset, a training run on free hardware, and — most importantly — a written definition of the behaviour that your data demonstrably encodes.

## Estimated time

**2 weeks** at 1–2 hours a day, 5 days a week. Roughly 12–16 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Defining the behaviour precisely, in writing | 1.5h |
| 2 | Collecting real inputs, and why invented ones fail | 1.5h |
| 3 | Producing gold outputs and the verification step | 2h |
| 4 | The chat template, and the silent failure | 1.5h |
| 5 | Deduplication, balance, and hard cases | 1.5h |
| 6 | Splitting by source, not randomly | 1h |
| 7 | Sizing, and the quality-over-quantity principle | 1h |
| 8 | Running the fine-tune on free hardware | 2h |
| 9 | Overfitting symptoms and epoch count | 1.5h |
| 10 | Honest ceilings, licences, and writing it up | 1.5h |

If you only have four hours this week, do tasks 1, 5, 9 and 13. Those give you the written behaviour definition, the formatted dataset, a completed training run with persistent checkpoints, and the licence check.

This is the longest phase in the track, and the time is mostly not spent waiting for training. Budget it for data work, because that is where the phase's value is.

## Skills you'll gain

- Define a target behaviour precisely enough to build a dataset from.
- Collect real production inputs rather than inventing examples.
- Produce gold outputs and verify model-generated ones.
- Format a dataset in a specific model's chat template.
- Detect the silent failure caused by a wrong template.
- Deduplicate, balance, and split a dataset by source.
- Include hard cases and "I don't know" cases deliberately.
- Justify a dataset size from evaluation results rather than a rule of thumb.
- Recognise overfitting and choose an epoch count.
- Run a fine-tune on free hardware with persistent checkpoints.
- State the honest capability ceiling of a small model.
- Check the licence and terms governing your data and your outputs.

## Specific topics to learn

- **Behaviour specification** — writing down what the model must do.
- **Real versus invented inputs** — and why the difference shows up in production.
- **Gold outputs** — human-written, or generated and then verified.
- **The verification step** — the most-skipped part of the pipeline.
- **Chat templates** — control tokens, and why models from the same base differ.
- **`apply_chat_template`** — and `add_generation_prompt=False` for training.
- **The silent template failure** — loss falls, outputs subtly wrong.
- **Deduplication** — near-duplicates included, not just exact matches.
- **Balance** — class and length distributions.
- **Splitting by source** — preventing leakage between train and validation.
- **Hard cases and refusals** — "I don't know" as a trained behaviour.
- **Sizing** — start small, grow where evals show failures.
- **Epochs** — why 1–3 is often right for instruction tuning.
- **Overfitting symptoms** — validation loss rising while training loss falls.
- **Free-hardware workflow** — Colab, Kaggle, Unsloth versus the `peft` stack.
- **Persistent checkpoints** — because free sessions die.
- **Licences and terms** — model licences, and terms on generated data.
- **Diversity collapse** — training on unfiltered model-generated data.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| `datasets` | Load, map, filter and split your data | Free/open-source | https://huggingface.co/docs/datasets/index | Tasks t05–t10 — the whole dataset pipeline | Plain Python lists and JSON files |
| `apply_chat_template` | Format examples in the model's exact template | Free/open-source | https://huggingface.co/docs/transformers/chat_templating | Task t06 — the step that fails silently if wrong | Reading the model card's template and formatting by hand |
| Unsloth | Lower-memory training with free-tier notebooks | Free/open-source | https://github.com/unslothai/unsloth | Task t13 — the training run | `peft` + `trl` directly (slower, more memory) |
| Google Colab | Free GPU for the training run | Freemium | https://colab.research.google.com/ | Task t13 — plus saving checkpoints to Drive | Kaggle Notebooks, longer weekly quota |
| Kaggle Datasets | Public datasets, and a place to keep your own | Free | https://www.kaggle.com/datasets | Task t03 — find a real dataset to compare against your own | Hugging Face Datasets |
| Hugging Face Hub | Host your dataset and adapters persistently | Free | https://huggingface.co/ | Task t18 — push checkpoints so a dead session costs nothing | Google Drive, or a git repository with Git LFS |
| `scikit-learn` | Reproducible splits that group by source | Free/open-source | https://scikit-learn.org/ | Task t10 — `GroupShuffleSplit` for source-aware splitting | A hand-written split by source id |

## Free/cheap resources

- **The QLoRA paper's dataset discussion (arXiv:2305.14314)** — the source of the quality-over-quantity framing. It reports state-of-the-art results from a small high-quality dataset, even against larger models, and that finding is the single most useful thing to internalise about dataset size.
- **The `datasets` library documentation** — for the mechanics of mapping, filtering and splitting without loading everything into memory.
- **The chat templating documentation** — read the section on model training specifically. It states directly that the template should be applied as a preprocessing step and that `add_generation_prompt` should be off during training, which is exactly the mistake this phase warns about.
- **Your own Phase 1 use case** — if you have real inputs from production, you already have the most valuable ingredient. If you do not, that absence is itself the finding, and Phase 1's ladder says the project may not be ready.
- **Any model card** — they document the expected template. Reading three of them side by side makes the format divergence concrete.

## Lesson: The 80% That Is Data

### Write the behaviour down first

The first task is not collecting data. It is writing down, in specific language, what the model should do. Concretely, that means sentences like:

- "Given a customer message, output one of these five category labels and nothing else."
- "Rewrite the input as formal English, preserving all names, numbers and dates exactly."
- "If the input does not contain the requested information, output exactly `NOT_FOUND` rather than guessing."

The test is unforgiving: **if you cannot write it down, you cannot build a dataset for it.** Vague targets produce datasets that disagree with each other, because each example was labelled against a slightly different mental model of the task. When training then fails to produce a consistent behaviour, the data was never consistent to begin with — and no hyperparameter will repair that.

Writing it down also defines your negative cases. A specification that says "classify into five categories" does not tell you what to do with an ambiguous message or one in a language you did not consider. A specification that says "output `NOT_FOUND` when the information is absent" has told you to include those cases in the data.

### Real inputs, not invented ones

The instinct is to sit down and write examples. Resist it, because invented inputs encode **your imagination of the task**, not the task.

The gap between the two is predictable. Invented inputs are cleaner, more grammatical, more consistent in length, and more polite than production traffic. They contain none of the typos, code-switching, truncated messages, pasted error logs, or accidental pastes of an entire email thread that real users produce. A model trained on invented examples learns to handle invented examples, and it fails on contact with real ones — often in ways that look like the model "not listening", because the input distribution is outside anything it saw.

If you genuinely have no production data, that is important information. It usually means the task is hypothetical, which places you back on Phase 1's ladder. If you must proceed, say so explicitly in your deliverable and treat your dataset as a prototype rather than a production artifact.

### Gold outputs, and the verification step

Every input needs an output that you would be willing to defend. There are two honest ways to get them.

**Human-written** is the strongest and the slowest. For a few hundred examples it is usually feasible, and it produces the most internally consistent dataset because one person's judgement is applied throughout.

**Model-generated then human-VERIFIED** is the practical route at scale. You use a strong model to draft outputs, then a human reads each one and either approves or corrects it. This is genuinely faster than writing from scratch, and it is a legitimate technique.

**Verification is the step that gets skipped**, and skipping it changes the nature of the dataset entirely. Unverified generated outputs are the previous model's errors, encoded as ground truth, and then trained into your model with all the authority of supervised labels. You have not distilled the teacher's competence; you have distilled its mistakes and paid for the privilege.

⚠️ **Two hazards specific to generated data:**

- **Diversity collapse.** Training on unfiltered model-generated outputs narrows the distribution of what your model produces. Model outputs are more alike than human outputs, so a dataset made entirely of them teaches a narrower range of responses than the teacher actually has. Aggressive filtering helps, but the effect is real and worth watching for.
- **Licence and terms.** Many commercial providers' terms **prohibit training a competing model on their outputs.** This is contractual, not advisory, and "I did not read it" is not a defence. Read the terms for any provider whose outputs you plan to train on, and check the model licence for the base you are training. Phase 5 covers this in more depth, because it is the central legal question in distillation.

### The chat template, and the silent failure

This is the most important technical trap in the phase, and it is dangerous precisely because nothing crashes.

A chat model is a next-token predictor. The conversational structure — who said what — exists only as **control tokens** in the token sequence. Different models use different ones, and critically, **two models fine-tuned from the same base can use different templates.**

The documentation's own example makes this concrete. Mistral-7B-Instruct formats a conversation as:

```text
<s>[INST] Hello, how are you? [/INST]I'm doing great.</s> [INST] Next question [/INST]
```

while Zephyr-7B, fine-tuned from the same Mistral-7B base, formats the identical conversation as:

```text
<|user|>
Hello, how are you?</s>
<|assistant|>
I'm doing great.</s>
<|user|>
Next question</s>
```

Same base model, different control tokens. The documentation is blunt about the consequence: **with the wrong control tokens, these models would have drastically worse performance.**

Now the part that makes this a *silent* failure. If you format your training data with the wrong template, training still runs. Loss still decreases, because the model is still learning to predict your tokens — it is simply learning a format it will never be asked to produce at inference. You get a model that has been trained on data whose structure does not match how it was pre-trained, and the outputs are subtly wrong in ways that are hard to attribute.

**The detection method** is to print the formatted text of one training example and compare it, character by character, against what the tokenizer produces for the same conversation at inference time. If they differ, stop. This is a two-minute check that prevents a two-week confusion.

Two practical rules follow from the documentation:

- **Use `apply_chat_template` rather than hand-formatting.** It reads the template from the tokenizer, so it cannot drift from the model you actually loaded.
- **Set `add_generation_prompt=False` when preparing training data.** That flag appends the tokens that *start* an assistant response, which is what you want at inference and is not helpful in training, where the response is already present.

```python
# Apply the model's own template as a preprocessing step
dataset = dataset.map(
    lambda x: {
        "formatted": tokenizer.apply_chat_template(
            x["chat"], tokenize=False, add_generation_prompt=False
        )
    }
)
# ALWAYS eyeball one example before training
print(dataset["formatted"][0])
```

### Deduplicate, balance, split by source

Three data-hygiene steps, each with a failure mode.

**Deduplicate — including near-duplicates.** Exact duplicates are easy to remove. Near-duplicates are more common and more damaging: the same question asked five slightly different ways, or a template with one field changed. These overweight whatever they contain, so the model learns that topic disproportionately. Embedding-based similarity is a reasonable way to find them.

**Balance.** Check the distribution of your labels, and of your input lengths. A dataset that is 90% one class teaches a model that mostly outputs that class, which then scores well on a similarly skewed evaluation while being useless in practice.

**Split by source, never randomly.** This is the subtle one. If your inputs come from sources that repeat — the same customer, the same document, the same day's batch — a random split puts near-identical examples in both training and validation. Validation loss then looks excellent while measuring nothing but the model's ability to recognise data it has already seen. The fix is to hold out **entire sources**, not random rows.

```python
from sklearn.model_selection import GroupShuffleSplit

# Group by source id so no source appears in both splits
splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
train_idx, val_idx = next(splitter.split(X, y, groups=source_ids))
```

A practical test: if your validation score is suspiciously close to your training score, suspect leakage before celebrating.

### Hard cases and "I don't know"

Two categories people omit and then regret.

**Hard cases.** The examples that were difficult for the base model. If your dataset contains only easy cases, you have taught the model what it already knew. Find the inputs where the base model fails, label them correctly, and include them — those carry the most learning signal per example.

**"I don't know" cases.** If your specification requires the model to decline rather than guess, that behaviour must appear in the data with the exact output you want. A model that has never seen a correct refusal has no example to imitate, and will confidently fabricate instead. These are among the highest-value examples in the dataset and among the most commonly forgotten.

### Sizing, epochs, and overfitting

**There is no universal dataset size.** The honest answer is: start with a few hundred good examples, measure, and add examples where the evaluation shows failures. That is a loop, not a number. The QLoRA paper's finding — that a small high-quality dataset produced state-of-the-art results, even against models with more parameters — is the empirical basis for preferring quality, and it is the reason "I only have 300 examples" is not automatically a blocker.

**1–3 epochs is often right for instruction tuning.** More passes over a small dataset is how you memorise it, and memorising your training set is the opposite of generalising. Watch for the classic symptom: **training loss continues to fall while validation loss starts to rise.** That divergence is overfitting, and the moment it begins is roughly where you should have stopped.

A second symptom worth knowing: outputs that become unusually rigid, reproducing training examples nearly verbatim in situations where they only partly apply. That is memorisation showing up as behaviour.

### The free-hardware workflow

```text
1. Build and format the dataset locally, and version it in git.
2. Push the formatted dataset to persistent storage (Hub, Drive).
3. Start a free GPU session (Colab or Kaggle).
4. Train with checkpointing DIRECTED AT PERSISTENT STORAGE.
5. Push the adapter to the Hub as soon as training finishes.
6. Evaluate locally afterwards — evaluation does not need a GPU session.
```

Step 4 is the one that costs people evenings. Free sessions disconnect, and a session's local filesystem dies with it. Configure checkpoint saving to a mounted Drive path or push to the Hub during training, so a disconnect costs you the session rather than the run.

**Unsloth versus `peft` + `trl`.** Unsloth is faster and uses less memory, with notebooks written for free tiers, which matters when your quota is limited. The `peft` and `trl` stack is more standard, better documented as a general skill, and worth understanding because it is what most workplaces use. Using Unsloth to get through the task and reading the `peft` configuration alongside it gives you both.

**The honest ceiling of small models.** A 7B model fine-tuned on a narrow task can be genuinely excellent at that task and will still be substantially weaker than a frontier model at everything adjacent to it. This is not a reason not to do it — narrow excellence is exactly what the winning conditions in Phase 1 described. It is a reason not to expect the adapter to make a small model generally capable. Know the ceiling before you promise anything.

### Licences and terms

Two separate questions, both worth answering before you train:

- **What does the base model's licence permit?** Some open-weight models restrict commercial use, or impose conditions on derivative models.
- **What do the terms of any provider whose outputs you used permit?** If you generated training data with a commercial API, its terms may prohibit using those outputs to train a competing model.

Write both answers into your deliverable with the date you checked. These terms change, and a dated record is what protects you.

## Hands-on practice tasks

1. Write a behaviour specification for your use case: the input, the exact expected output, the decision rules, and at least two edge cases with their intended handling. <!-- id: ft-03-datasets-and-training-t01 band: focused energy: high -->
2. Identify where your real inputs would come from. If you have none, write down what that implies for the project rather than inventing examples silently. <!-- id: ft-03-datasets-and-training-t02 band: focused energy: normal -->
3. Find a public dataset for a similar task and inspect 20 examples. Write down how they differ from what real users would actually send. <!-- id: ft-03-datasets-and-training-t03 band: focused energy: normal -->
4. Either write 30 gold outputs by hand, or generate them and verify every one. Record how long each approach took and where the generated ones needed correction. <!-- id: ft-03-datasets-and-training-t04 band: deep energy: high -->
5. Build a dataset of at least 100 examples following your specification. Record the source of every example. <!-- id: ft-03-datasets-and-training-t05 band: deep energy: high -->
6. Format your dataset in your base model's exact chat template, then print one formatted example and compare it against what the tokenizer produces at inference. <!-- id: ft-03-datasets-and-training-t06 band: deep energy: high -->
7. Deliberately format a copy with the wrong template and note what happens to the tokens. Confirm that training would not have errored. <!-- id: ft-03-datasets-and-training-t07 band: focused energy: high -->
8. Check the model card for two models built on the same base and compare their chat templates. Note the differences. <!-- id: ft-03-datasets-and-training-t08 band: focused energy: normal -->
9. Deduplicate your dataset, including near-duplicates. Report how many examples you removed and by what method. <!-- id: ft-03-datasets-and-training-t09 band: focused energy: normal -->
10. Split your dataset by source rather than randomly, and verify that no source appears in both splits. <!-- id: ft-03-datasets-and-training-t10 band: deep energy: high -->
11. Find five inputs where the base model fails and add correctly labelled examples for them. Include at least two refusal cases. <!-- id: ft-03-datasets-and-training-t11 band: deep energy: high -->
12. Write down your epoch count and your reason for it, before you start training. <!-- id: ft-03-datasets-and-training-t12 band: quick energy: low -->
13. Run the fine-tune on a free GPU, saving checkpoints to persistent storage. Record total time and how much was spent waiting for the GPU. <!-- id: ft-03-datasets-and-training-t13 band: deep energy: high -->
14. Plot training and validation loss. Identify the epoch where they diverge, and state whether you trained past it. <!-- id: ft-03-datasets-and-training-t14 band: deep energy: high -->
15. Check the base model's licence and the terms of any provider whose outputs you used. Record both with the date. <!-- id: ft-03-datasets-and-training-t15 band: focused energy: normal -->
16. Test your model on ten inputs it has never seen, drawn from the real distribution if possible. Report how many are correct. <!-- id: ft-03-datasets-and-training-t16 band: deep energy: high -->
17. State the honest ceiling of your model: one task it handles well, and one adjacent thing it still cannot do. <!-- id: ft-03-datasets-and-training-t17 band: ongoing energy: normal -->
18. Push your dataset and adapter to persistent storage and verify you can reload both in a fresh session. <!-- id: ft-03-datasets-and-training-t18 band: focused energy: normal -->
19. Write down two specific failures from your evaluation and what data you would add to fix each. <!-- id: ft-03-datasets-and-training-t19 band: ongoing energy: normal -->

## Common Pitfalls

**Inventing the inputs.** Invented examples are unlike production traffic in predictable ways — cleaner, more grammatical, more consistent — so the model fails on real inputs in ways that look like it is not listening.

**Skipping verification on generated outputs.** Unverified generated labels are the previous model's errors promoted to ground truth. You distil the mistakes with the full authority of supervised data.

**Getting the chat template wrong.** The classic silent failure: loss falls, training looks healthy, and outputs are subtly wrong because the model learned a format it will never be asked to produce. Print one formatted example before every run.

**Splitting randomly by row.** Near-identical examples land on both sides, validation measures memorisation, and your scores are fiction. Split by source.

**Training a large number of epochs on a small dataset.** You are teaching it to reproduce your training set. Watch for validation loss rising while training loss falls.

**Assuming more data is better data.** Quality beats quantity, and a few hundred verified examples repeatedly outperform thousands of mediocre ones.

**Forgetting refusal cases.** If declining is a required behaviour, it needs examples. Otherwise the model fabricates confidently, because it has never seen the alternative.

**Leaving checkpoints in the session.** Free GPU sessions die. Save to persistent storage during training, not after.

**Ignoring the terms.** Training on a commercial provider's outputs may violate its terms, and the base model's licence may restrict commercial use. Both are contractual.

**Expecting a small model to become generally capable.** Narrow excellence is the achievable goal. Know the ceiling before you promise anything.

## Deliverable / proof of work

Create `portfolio/finetuning/03-datasets-and-training.md` containing:

1. **The behaviour specification** — input, exact output, decision rules, edge cases.
2. **The dataset description** — size, source of each example, how outputs were produced, and how many were verified by hand.
3. **A printed formatted example**, with a note confirming it matches inference formatting.
4. **The hygiene record** — duplicates removed, class balance, and how you split by source.
5. **The hard cases and refusals** you added deliberately, and why each was chosen.
6. **The training record** — base model, hyperparameters, epochs, checkpoint location, wall-clock time.
7. **The loss curves**, with the divergence point identified.
8. **The evaluation** — results on unseen inputs, with failures named.
9. **The honest ceiling** — what it does well, what it still cannot do.
10. **The licence and terms check**, with both answers dated.

Item 2 must state plainly how many outputs you verified by hand. "Generated" without verification is not gold data, and the distinction should be visible in the document rather than implied.

## Checklist

- [ ] I wrote the behaviour down before collecting any data <!-- id: ft-03-datasets-and-training-c01 energy: high -->
- [ ] My inputs are real or I have stated plainly that they are not <!-- id: ft-03-datasets-and-training-c02 energy: high -->
- [ ] Every output is human-written or human-verified <!-- id: ft-03-datasets-and-training-c03 energy: high -->
- [ ] I checked the chat template by printing a formatted example <!-- id: ft-03-datasets-and-training-c04 energy: high -->
- [ ] I set `add_generation_prompt=False` for training data <!-- id: ft-03-datasets-and-training-c05 energy: normal -->
- [ ] I can explain why a wrong template fails silently <!-- id: ft-03-datasets-and-training-c06 energy: high -->
- [ ] I removed near-duplicates, not just exact ones <!-- id: ft-03-datasets-and-training-c07 energy: normal -->
- [ ] I checked the class and length balance of my dataset <!-- id: ft-03-datasets-and-training-c08 energy: normal -->
- [ ] I split by source, and no source appears in both splits <!-- id: ft-03-datasets-and-training-c09 energy: high -->
- [ ] I included hard cases where the base model failed <!-- id: ft-03-datasets-and-training-c10 energy: high -->
- [ ] I included deliberate refusal / "I don't know" examples <!-- id: ft-03-datasets-and-training-c11 energy: high -->
- [ ] I can justify my dataset size from evaluation failures rather than a rule of thumb <!-- id: ft-03-datasets-and-training-c12 energy: normal -->
- [ ] I know why 1–3 epochs is often right for instruction tuning <!-- id: ft-03-datasets-and-training-c13 energy: normal -->
- [ ] I identified the point where validation loss diverged from training loss <!-- id: ft-03-datasets-and-training-c14 energy: high -->
- [ ] I saved checkpoints to persistent storage, not the session <!-- id: ft-03-datasets-and-training-c15 energy: normal -->
- [ ] I tested on inputs the model has never seen <!-- id: ft-03-datasets-and-training-c16 energy: high -->
- [ ] I checked the base model's licence and any provider's terms <!-- id: ft-03-datasets-and-training-c17 energy: normal -->
- [ ] I can state the honest ceiling of my model <!-- id: ft-03-datasets-and-training-c18 energy: normal -->

## Quiz

### Q1. Why is a wrong chat template a *silent* failure? <!-- id: ft-03-datasets-and-training-q01 energy: high -->

- [ ] Because the library raises a warning that is easy to miss
- [x] Because training still converges — the model learns to predict your tokens, but in a structure unlike the one it was pre-trained on and will never be asked to produce
- [ ] Because the template is only used at inference
- [ ] Because the tokenizer silently corrects it

**Why:** Nothing errors. Loss decreases, curves look healthy, and the run completes, because the model is genuinely learning to predict the sequence it was given. What it is not learning is the conversational structure it will face at inference, so outputs are subtly wrong with no obvious cause. The check that catches it costs two minutes: print the formatted text of one training example and compare it against what the tokenizer produces at inference for the same conversation. Do it before every run.

### Q2. Why must you split by source rather than randomly? <!-- id: ft-03-datasets-and-training-q02 energy: high -->

- [ ] To keep the classes balanced
- [x] Because near-identical examples from the same source would otherwise appear in both splits, so validation measures memorisation rather than generalisation
- [ ] To reduce the dataset size
- [ ] Because random splits are not reproducible

**Why:** When inputs cluster by source — the same customer, document, or batch — a row-wise split puts near-duplicates of training examples into validation. Validation loss then looks excellent while measuring nothing useful, and the resulting confidence is worse than having no measurement, because it will be acted on. Grouping the split by source id ensures no source contributes to both sides, which is what makes the validation number mean something.

### Q3. What makes generated outputs acceptable as training data? <!-- id: ft-03-datasets-and-training-q03 energy: high -->

- [ ] Using the largest available model to generate them
- [ ] Generating several per input and averaging
- [x] Human verification of every one — without it you are training the previous model's errors in as ground truth
- [ ] Filtering out anything longer than a threshold

**Why:** Generation followed by verification is a legitimate and much faster route than writing by hand. Dropping the verification step changes what the dataset *is*: unverified outputs are the teacher's mistakes carrying the authority of supervised labels, so the student inherits the errors deliberately rather than incidentally. A larger generator makes its errors more fluent, not absent. The count of hand-verified examples belongs in your deliverable for exactly this reason.

### Q4. Your training loss keeps falling and validation loss starts rising. What is happening? <!-- id: ft-03-datasets-and-training-q04 energy: normal -->

- [ ] The learning rate is too low
- [x] Overfitting — the model is memorising the training set rather than generalising, and you have passed the point where you should have stopped
- [ ] The dataset is too large
- [ ] The chat template is wrong

**Why:** Divergence between the two curves is the standard signature of memorisation, and it is common when a small dataset is trained for many epochs. This is why 1–3 epochs is often the right range for instruction tuning: the goal is to learn the behaviour, not to reproduce the examples. The practical use of the curve is to find the divergence point and train to just before it, which requires plotting both rather than watching one.

### Q5. Why include "I don't know" examples in a dataset? <!-- id: ft-03-datasets-and-training-q05 energy: high -->

- [ ] To reduce the dataset size
- [ ] To make the model refuse most requests
- [x] Because if declining is a required behaviour it must appear in the data — otherwise the model has no example to imitate and fabricates instead
- [ ] Because they improve loss convergence

**Why:** A model learns behaviours it has seen demonstrated. If every training example shows a confident answer, the model has learned that confident answers are what this task looks like, and it will produce one even when the information is absent — which is exactly the failure mode a refusal requirement exists to prevent. These examples are among the highest-value in a dataset and among the most commonly omitted, because they feel like non-examples when you are collecting data.

### Q6. Which of these is the strongest argument for a small high-quality dataset? <!-- id: ft-03-datasets-and-training-q06 energy: normal -->

- [ ] It trains faster
- [ ] It uses less disk space
- [x] QLoRA reported state-of-the-art results from a small high-quality dataset, even against larger models — quality beats quantity empirically, not just as a preference
- [ ] It avoids needing an evaluation

**Why:** The framing comes from the QLoRA work, which found that careful data selection outperformed scale. This matters practically because it means a few hundred verified examples is a legitimate starting point rather than a compromise, and it relocates the bottleneck from "how do I get 50,000 examples" to "can I produce 300 correct ones" — a question about judgement rather than collection. It does not remove the need for evaluation; it makes evaluation the only way to know whether your small dataset covered the task.

### Q7. You have no production data for your task. What does that most likely mean? <!-- id: ft-03-datasets-and-training-q07 energy: high -->

- [ ] You should generate the inputs with a model
- [ ] You should proceed and note the limitation at the end
- [x] The task may be hypothetical, which points back to Phase 1's ladder — and if you proceed, the dataset is a prototype rather than a production artifact
- [ ] You should use a larger base model

**Why:** Fine-tuning's winning conditions included having real input data, precisely because invented inputs encode your imagination of the task rather than the task. Generating inputs with a model does not fix this, since the generated inputs share the model's assumptions about what users send. The honest response is to treat the absence as evidence about the project's readiness and to label the result accordingly, rather than to quietly substitute invented examples and report a successful fine-tune.

### Q8. Which is the correct setting when preparing training data with `apply_chat_template`? <!-- id: ft-03-datasets-and-training-q08 energy: normal -->

- [ ] `add_generation_prompt=True`, because the model must learn to respond
- [x] `add_generation_prompt=False`, because those tokens start an assistant reply and are not helpful when the reply is already present in the data
- [ ] It makes no difference
- [ ] `continue_final_message=True`

**Why:** That flag appends the tokens that signal the beginning of an assistant response — exactly what you want at inference time and exactly what you do not want in training, where the response is already in the sequence being learned. The documentation is explicit that it should be off for training preprocessing. Setting it on would insert a generation marker into every training example, teaching the model a structure that never occurs in real use.

## You're ready to move on when...

- You have a written behaviour specification, and your dataset visibly follows it.
- You can explain why a wrong chat template fails silently, and you check for it.
- Your dataset contains real inputs, verified outputs, hard cases and refusals.
- You split by source and can explain what a random split would have measured instead.
- You have trained on free hardware and can prove your checkpoints survive a session ending.
- You have plotted both loss curves and identified where they diverge.
- You have stated the honest ceiling of your model in writing.

## Free vs Paid

**The whole phase is achievable at zero cost.** `datasets`, `transformers`, `peft`, `trl` and Unsloth are free and open-source, and free GPU sessions are sufficient for a small-model QLoRA run.

**The free path, concretely.** Build and format the dataset on your own machine, where no GPU is needed and the work is mostly thinking. Push it to the Hugging Face Hub, which is free for public repositories and generous for private ones. Train in a Colab or Kaggle session with checkpoints directed at Drive or the Hub. Evaluate locally afterwards — evaluation is inference, and a free-tier API or a quantized local run is enough.

**Honest limits, and the one that matters most.** Free sessions disconnect, and their local filesystem dies with them, so **persistent checkpoints are not optional** — configure them before the first run rather than after the first loss. Free GPUs are slower, so iteration takes longer and you should plan fewer, better-considered runs rather than a tight experimental loop. Quotas reset weekly, which is workable if you batch your training into a session or two and do data work outside it.

**Where paid tiers genuinely help, and where they do not.** Rented GPU time by the hour removes the quota and speeds iteration; it does not improve your dataset, which is the actual bottleneck. Hosted training services remove infrastructure work you have already learned to do by hand. **Neither is necessary to complete this phase**, and buying compute before you have a verified dataset is spending money on the part of the project that was never the constraint.

**The resource that is genuinely worth more than compute:** the verification time on your outputs. An hour spent reading generated labels and correcting them improves the model more than an hour of extra GPU time on unverified data, and it costs nothing but attention.
