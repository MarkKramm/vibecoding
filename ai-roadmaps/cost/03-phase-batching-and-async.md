---
id: cost-03-batching-and-async
track: cost
phase: 3
order: 30
title: Batch APIs and Asynchronous Work
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal]
deliverable: portfolio/cost/03-batching-and-async.md
exit_criteria: >
  You can decide whether a given workload may be made asynchronous, estimate
  both the saving and the operational cost of doing so, and run a real batch
  job whose partial failures you can reconcile.
---

# Phase 3 — Batch APIs and Asynchronous Work

## Goal of this phase

Learn to trade latency for money on purpose. By the end you will be able to look at a workload, say whether anything is actually waiting on it, and if nothing is, restructure it as a batch job to take a discount that is usually substantial.

The core skill here is not calling an endpoint. It is **classifying your own work**. Most of the cost in a hobby project comes from a handful of bulk jobs — backfills, evaluations, enrichment, dataset labelling — that were written as interactive loops because that was the path of least resistance. This phase is about noticing them.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

The concepts take an afternoon. The rest of the week is the hands-on task, which is deliberately a real batch job with real partial failures, because reconciling those is the part that goes wrong in production and the part no tutorial covers.

## Skills you'll gain

- Decide whether a workload is genuinely latency-sensitive or merely written that way
- Estimate the saving from batching before committing to the rewrite
- Structure a job so its requests are independent and its failures are recoverable
- Handle partial failure: some requests in a batch succeed, some fail, some never return
- Exercise record-count and sponsorship prerequisites before creating a run, so a long calculation is not rejected at submission
- Choose between interactive, batch, and local execution for a given job

## Specific topics to learn

### The classification question

- Latency sensitivity: is a human waiting, or is another process waiting?
- Workloads that are almost always batchable: backfills, evaluation runs, labelling, enrichment, embedding generation
- Workloads that never are: chat, autocomplete, anything in a request handler
- The one that catches people: a "background job" that is actually on a request's critical path

### The economics

- Why asynchronous work is cheaper: scheduling flexibility, not charity
- Write and read windows, and what expiry means for your design
- Why the discount is the same whichever provider you use, and why the exact figure is not something to memorise

### Operational reality

- Independence as a hard requirement
- Partial failure as the normal case, not the exception
- Idempotency, because you will retry
- Result expiry and what to do about it

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Provider batch endpoints | Submit many requests as one asynchronous job | Free to submit; tokens billed at a discount | https://developers.openai.com/api/docs/guides/batch | Submit your eval set as a batch job and compare wall-clock to an interactive loop | Google AI Studio, or any provider with an async/batch mode |
| SQLite | Track job state and reconcile partial failures | Free/open-source | https://sqlite.org/ | Store one row per request with a status column | A CSV file and a text editor |
| jq | Inspect and slice batch result files | Free/open-source | https://jqlang.github.io/jq/ | Extract only the failed request IDs from a result file | Python's `json` module |
| Python `concurrent.futures` | The interactive baseline you are comparing against | Free | https://docs.python.org/3/library/concurrent.futures.html | Run the same job interactively to get a real comparison | A simple `for` loop |
| Ollama | Run a batch job locally with no per-token cost at all | Free/open-source | https://ollama.com/ | Process 50 items locally and compare both cost and time | llama.cpp directly |
| Cron / Task Scheduler | Trigger a batch job on a schedule | Free | https://man7.org/linux/man-pages/man5/crontab.5.html | Schedule your job nightly and log each run | Windows Task Scheduler |

## Free/cheap resources

- **OpenAI — Batch API guide** — https://developers.openai.com/api/docs/guides/batch
- **Anthropic — Message Batches** — https://platform.claude.com/docs/en/build-with-claude/batch-processing
- **Google — Vertex AI batch predictions** — https://cloud.google.com/vertex-ai/docs/predictions/batch-predictions
- **Python — concurrent.futures** — https://docs.python.org/3/library/concurrent.futures.html
- **jq manual** — https://jqlang.github.io/jq/manual/
- **OpenAI — Rate limits guide** — https://developers.openai.com/api/docs/guides/rate-limits

## Lesson: Trading Patience for Money

### Part 1 — The question that decides everything

There is one question in this phase, and almost every mistake comes from answering it wrong.

**Is anything waiting for this result?**

Not "is this important" — important work is batched constantly. Not "is this fast enough" — a slow job nobody is watching is not slow, it is just unfinished. The only thing that matters is whether a person or a process is *blocked* on the answer.

If a human is staring at a spinner, you cannot batch. If a function higher up the stack needs this value before it can return, you cannot batch. If a nightly job, an evaluation script, or a backfill is doing the work and nothing downstream will read the result until tomorrow, **you can almost certainly batch it, and you have probably been overpaying.**

The reason this question is worth stating so plainly is that interactive code is the path of least resistance. When you need to run a model over 5,000 rows, the obvious thing is a loop:

```python
results = []
for row in rows:
    response = call_model(row["text"])
    results.append(response)
```

That loop works. It is also the single most expensive way to do the job, and it was chosen by default rather than by decision. The rest of this phase is about making it a decision.

#### Why asynchronous work is cheaper

It is worth understanding the mechanism, because it tells you where the discount applies and where it does not.

When you make an interactive request, the provider has to be ready to answer it **now**. That means capacity held in reserve for you, a machine potentially idle waiting on your generation to finish, and a scheduler that cannot group your work with anyone else's because your latency requirement forbids queuing. You are paying, indirectly, for the privilege of being served immediately.

A batch job gives that up. The provider knows nothing is waiting, so it can schedule your requests whenever there is spare capacity, group them with other batch work, and run them when the hardware is otherwise about to sit idle. The work is identical; the scheduling constraints are gone. **The discount is the price of those constraints, handed back to you.**

Two consequences follow, and both matter:

**The discount is genuinely large.** At the major providers it has historically been around half, and that figure has been stable enough that it is worth knowing — but treat it as a mechanism you verify rather than a number you memorise. Check the current terms for your provider and model; eligibility and percentage differ by model class and change.

**The turnaround is genuinely loose.** Commonly up to 24 hours, often with a completion window you specify. That is not a queue that happens to be slow; it is the deal. If you need it in five minutes, you are back to interactive pricing, and no amount of tuning changes that.

```text
Interactive:  you pay full price for the privilege of being served now
Batch:        you pay less because you gave up the privilege
```

Once you see it that way, the classification question stops being about money and becomes about **whether the privilege was ever worth anything to you**. For a loop nobody is watching, you have been buying immediacy you never used.

---

### Part 2 — Workloads that are almost always batchable

Let me be concrete, because "is anything waiting" is easy to answer in the abstract and easy to get wrong about your own code.

**Evaluation runs.** This is the one that matters most for a reader on this curriculum. Every time you change a prompt and want to know whether it helped, you run your eval set. A 200-case set at three samples each is 600 requests. Run interactively, that is 600 full-price calls and you will feel it, which means **you will start running evals less often than you should** — and that is the real cost. Batching makes the measurement you need cheap enough to actually perform. In the Cost track's terms, it removes a price barrier from the habit that makes everything else better.

**Dataset labelling and enrichment.** You have 10,000 records and want a category, a summary, or an extracted field on each. Nothing reads the result until you do.

**Backfills.** You add an embedding column to a table that already has 80,000 rows. The work is mechanical and enormous, and nothing depends on any individual row.

**Bulk generation for a corpus.** Producing descriptions, translations, or synthetic variants in volume.

**Embedding generation.** Frequently a separate endpoint with its own batch behaviour, and usually the largest single bulk job in a RAG project.

What these share is that they are **bulk, independent, and unwatched**. Notice that the third property is the one that is about your application rather than the work itself, which is why it is the one people get wrong.

#### The background job that is not

Here is the failure I want you to check for in your own code, because it is the one that looks safe and is not.

You move the model call out of the request handler into a background worker. Good instinct — the user is no longer waiting on the response. But the worker was created to make *the request* fast, and the requirement was never "the user does not wait" — it was "the user gets the result". If the worker's output is pushed to that user's screen when it finishes, then **the user is still waiting**, and you have moved the latency without removing it.

```text
Genuinely batchable:
    cron -> process yesterday's records -> write to a table -> nobody reads it today

Not batchable, despite the background worker:
    request -> enqueue -> worker -> push result to the waiting user's screen
```

The test is not where the code runs. **The test is who reads the output, and when.** If the answer is "the same person who triggered it, within a minute", it is interactive work wearing a worker's clothes.

A useful corollary: the middle case exists, and it is worth naming so you do not force a binary. A job whose result is read *later that day* — a digest, a report — is batchable even though a human does eventually read it, because the human is not blocked. Batch windows and human patience are often much closer than people assume, and the honest way to find out is to ask what the user does while they wait. If the answer is "something else", batch.

---

### Part 3 — Doing the arithmetic before the rewrite

The temptation with any optimisation is to start rewriting and measure at the end. Resist it here, because the rewrite has a real cost and the estimate is five minutes of work.

The estimate has two sides, and the second one is the one people forget.

**The saving.**

```text
items                     = 10,000
sample cost per item      = you must MEASURE this, not guess
interactive total         = items x sample cost
batch total               = interactive total x (1 - discount)
saving                    = interactive total - batch total
```

The quantity you must not invent is the per-item cost. Pull it from your own logs — this is exactly why the previous phase had you log tokens on every call. If you have been doing that, you have a real number; if you have not, you are about to discover why it mattered, and the fix is to run a hundred items interactively and measure those.

**The operational cost**, which is what the estimate usually omits:

- **Rewrite effort.** The job has to become submission, polling, retrieval, and reconciliation rather than a loop. That is real code with real bugs.
- **Reconciliation burden.** Partial failure means you now have a table of per-item statuses to maintain. Interactive loops fail loudly and stop; batch jobs fail quietly and continue.
- **The latency you have accepted.** If the job ever *does* become urgent, you have built something that cannot respond quickly, and undoing it is another rewrite.
- **Result expiry.** Batches are typically retrievable for a bounded period after completion. If you do not persist results, you will do the work again.

**The rule that makes this honest:** batch when the saving is large enough to be worth the code, which in practice means the job is big *and* recurring. A one-off 200-item job is not worth a reconciliation system; run it interactively, absorb the cost, and move on. A nightly job that grows with your data is worth doing properly the first time, because you will pay the rewrite cost once and the saving every night.

```text
one-off, small      -> run it interactively, do not build machinery
recurring, large    -> batch it, and build the reconciliation
recurring, small    -> batch it only if the machinery is already written
one-off, large      -> batch it; the saving pays for the rewrite in one run
```

---

### Part 4 — Independence is a hard requirement, and it is not negotiable

Here is the structural constraint that decides whether your job can be batched at all.

**Batch requests cannot depend on each other.** There is no ordering guarantee, no shared state, and no way for request 47 to read the output of request 12. Every request must be answerable in isolation.

This sounds obvious and rules out more than people expect.

**What it rules out: prompt chaining.** A multi-step pipeline where step two's prompt contains step one's output cannot be one batch. It can be *three* batches with collection in between — which is a legitimate design, and worth naming as such:

```text
batch 1: extract fields from 10,000 records
wait, collect, validate
batch 2: summarise using the extracted fields
wait, collect
batch 3: classify the summaries
```

Each stage is a batch; the sequencing lives in your code between them. That is a perfectly good pipeline, and it is often dramatically cheaper than the interactive equivalent.

**What it rules out: agent loops.** An agent's entire structure is a sequence of calls where each depends on the previous result. You cannot batch an agent run. You *can* batch the same agent task across many inputs — 500 independent documents each getting their own agent run — which is a different thing and a legitimate use.

**What it does not rule out, though people think it does: conversation history.** Each request in a batch carries its own complete message array. If you are labelling 1,000 independent conversations, each is self-contained and all 1,000 batch together.

The test to apply to each request: **could I run this alone, with nothing but its own payload, and get the same answer?** If yes, it batches. If it needs anything another request produced, it does not.

#### A note on the ordering you lose

Because there is no ordering guarantee, do not design anything that depends on results arriving in submission order. Key every request by an identifier **you** assign — your own record ID, not the provider's — and join the results back on that key. This is the same identity principle the curriculum applies to checklist items and practice tasks, for the same reason: an answer must be attachable to exactly the thing it was produced for, and it must still be attachable if the order changes.

```python
# Good: your own id travels with the request and comes back with the result
requests = [
    {"custom_id": f"record-{row['id']}", "body": {...}}
    for row in rows
]

# Bad: relying on position
results_by_position = [r for r in returned]  # silently misaligns on any reorder
```

The bad version is not obviously wrong. It works in testing, because testing is small and ordered. It fails later, quietly, by attaching correct answers to the wrong rows — which is worse than failing, because the output looks fine.

---

### Part 5 — Partial failure is the normal case

This is the part of batch work that no tutorial covers and that every real job eventually hits.

An interactive loop fails atomically in the useful sense: it throws, and it stops. You know exactly where you were. A batch job is different — **it completes, and it completes partially.** Some requests succeed, some fail validation, some fail server-side, and you get a result file containing all three kinds mixed together. The job reports success, and 300 of your 10,000 items did not happen.

If you do not handle this, your pipeline silently produces incomplete data, and the incompleteness is invisible because the job said it finished.

**The structure that handles it.** Three files and a status column:

```text
input.jsonl      one request per line, each with your custom_id
output.jsonl     successful results
error.jsonl      failed requests, with the reason
```

And in your own database, one row per item with a status you control:

| status | meaning |
|---|---|
| `pending` | submitted, no result yet |
| `ok` | result received and validated |
| `failed` | result received but failed validation |
| `errored` | request returned an error |
| `missing` | job completed, no result for this id |

That last status is the important one. **After a batch completes, reconcile: every id you submitted must appear in exactly one of output or error.** Anything in neither is `missing`, and missing items are the ones that silently vanish if you only read the output file.

```python
submitted = {r["custom_id"] for r in requests}
returned = {r["custom_id"] for r in output} | {r["custom_id"] for r in errors}
missing = submitted - returned

if missing:
    # Re-submit these. This is normal, not exceptional.
    resubmit([r for r in requests if r["custom_id"] in missing])
```

Two properties make this work, and both are worth naming because both are easy to skip.

**Idempotency.** Because you will re-submit failed and missing items, the operation must be safe to perform twice. If your item processing writes to a table, use an upsert keyed on your id rather than an insert, so a repeated success overwrites rather than duplicates. If it sends an email, check whether it was already sent. **Re-submission is not an error path you hope never runs; it is a step in your pipeline**, and it runs on most real jobs.

**Validation before success.** A result can arrive with a `200` and still be useless — truncated by an output ceiling, valid JSON that fails your schema, an empty string, or a refusal. Mark it `failed` rather than `ok` if it does not pass your own check, so that "succeeded" means "usable" rather than "returned something". This is the same distinction the evaluation phase draws between a call that ran and a task that succeeded, and it is the difference between a pipeline that is complete and one that merely stopped erroring.

#### Where batch work stops being the right answer

Three boundaries worth knowing.

**When the data must be fresh.** Batch windows are hours, and a batch submitted at 09:00 may not be readable until the next morning. Anything that must reflect the last few minutes cannot use it.

**When the job is genuinely small.** The reconciliation machinery is real code. Below a few hundred items, especially one-off, you will spend more in your own time than you save in tokens. **Your time is the scarce resource on a $0 budget**, and a batch rewrite that takes an evening to save fifty cents is a bad trade — this is the "frequent, not cheap" accounting. The exception is a job you already have the machinery for, where the marginal cost of batching is zero.

**When requests are not independent.** Covered above, and worth repeating because it is the constraint that kills designs most often. If your job is inherently sequential, either restructure it into batched stages with collection between them, or accept interactive pricing.

---

### Part 6 — A worked comparison

Let me run the whole decision on one realistic workload so the arithmetic is concrete rather than gestured at. Variables, not prices, because prices move.

```text
WORKLOAD: nightly re-embedding of a documentation corpus
  items:              12,000 chunks
  per-item cost:      measure it (logged, from the previous phase)
  schedule:           nightly, 02:00
  reader:             the search index, rebuilt after, read tomorrow
  independence:       each chunk embeds alone - fully independent
  ordering:           irrelevant, keyed by chunk id
```

**The classification.** Nothing is waiting. The reader is tomorrow's search query. Independence holds. Ordering is irrelevant. **This is a textbook batch job**, and it was probably written as an interactive loop.

**The estimate.**

```text
interactive nightly = 12,000 x per-item cost
batch nightly       = interactive nightly x (1 - discount)
saving per night    = interactive nightly x discount
annual saving       = saving per night x 365
```

The annual figure is what makes the decision, not the nightly one. A saving that looks trivial per run is a different proposition when it recurs every night forever, and this is the general shape of batched value: **it compounds with frequency, so the recurring case is where it pays.**

**The operational cost.** Submission, polling, retrieval, reconciliation, re-submission of failures, and a status table. Call it an evening of work the first time, plus the underlying embedding cost.

**The verdict.** Build it. The machinery is written once and the saving recurs nightly, so the rewrite amortises in weeks rather than years.

**Now the same arithmetic on a different workload, to show where it loses:**

```text
WORKLOAD: one-off cleanup of 180 messy records
  items:        180
  independence: holds
  schedule:     once, today, because I want to look at the output
```

**The verdict.** Do not batch it. The saving on 180 items does not pay for the reconciliation code, and you want to see the results while you are working. Run it interactively, absorb the cost, and spend the evening on something that matters. **Recognising a job that is not worth optimising is part of the skill**, and it is the part that people who have just learned a technique tend to skip.

#### Where the estimate lies to you

Two honest caveats on the arithmetic above.

**The discount may not apply to your model.** Batch eligibility and the exact percentage differ by provider and model class. The mechanism — giving up immediacy for scheduling flexibility — is universal, but the rate is not, and it changes. Verify it for the specific model you intend to use rather than extrapolating from a figure in a lesson.

**The wall-clock comparison will surprise you, and not always favourably.** A 12,000-item batch submitted at 02:00 may not be retrievable until well into the morning. If your nightly window is tight — the index must be rebuilt before the office opens — the batch window may not fit it, and that is a real constraint rather than a detail. The fix is usually to start earlier, not to abandon batching, but you have to check the window against your actual deadline before committing.

---

### Part 7 — Tracking the work

Once you have several asynchronous jobs, you need somewhere to record their state, and the previous phase's logging gives you most of it. Two additions:

**One row per job.** Job id, submitted time, item count, status, completed time. This is what lets you answer "did last night's run happen and did it finish" without reading logs.

**One row per item, with a status.** The table from Part 5. This is what makes reconciliation possible and what tells you whether your success rate is drifting — a job whose failure rate creeps from 1% to 8% over a month is telling you something about your prompts or your data, and you will only notice if you are counting.

The habit that makes this worth the effort: **after every batch, assert that submitted equals accounted for.** Not "check the output file" — assert the identity, and fail loudly when it does not hold. A job that completed with 300 items unaccounted for is a job that did not complete, and the only reason to treat it otherwise is that nobody checked.

This is the same principle the curriculum's build script applies to content — reconcile every submitted item against a result, and refuse to call it done when the two do not match. It is worth internalising as a general pattern, because **silent incompleteness is the characteristic failure of asynchronous systems**, and it is silent precisely because the job reports success.

---

## Hands-on practice tasks

1. Find one loop in your own code that calls a model over a list, and write down the answer to the classification question: who reads the output, and when? Classify it in one sentence. <!-- id: cost-03-t01 band: quick energy: low -->
2. Take that job's real per-item cost from your logs and compute the interactive total, the batch total and the saving. If you have no logs, run 100 items interactively and measure those first. <!-- id: cost-03-t02 band: focused energy: normal -->
3. Submit a real batch of at least 500 items and retrieve the results. Record wall-clock timings for submission, completion and retrieval. <!-- id: cost-03-t03 band: deep energy: normal -->
4. Reconcile that job: build the submitted set and the returned set, compute the difference, and re-submit whatever came back missing or errored. Record how many needed re-submission — this is the number that teaches you partial failure is normal. <!-- id: cost-03-t04 band: deep energy: normal -->
5. Deliberately include items in a batch that will fail validation — an empty string, a malformed input — and confirm they land in the error file rather than the output file. Then confirm your pipeline does not mark them `ok`. <!-- id: cost-03-t05 band: focused energy: normal -->
6. Run the same work as an interactive loop with a concurrency of five, and compare total cost and total wall-clock against the batch run. Write down which was faster and by how much. <!-- id: cost-03-t06 band: focused energy: high -->
7. Take a one-off bulk job from your own work and write the three-line verdict: batch or interactive, why, and what would change the answer. <!-- id: cost-03-t07 band: quick energy: normal -->
8. Design a three-stage batched pipeline for a task that currently uses prompt chaining, and specify exactly what is collected and validated between stages. <!-- id: cost-03-t08 band: focused energy: high -->

## Common Pitfalls

**Batching something on a request's critical path.** The most common and most expensive mistake. A background worker whose output is pushed to a waiting user has not removed the latency, only relocated it. Ask who reads the output and when, before anything else.

**Assuming a completed job is a complete job.** Batch runs finish partially as a matter of course. If you only read the output file, the missing items vanish silently and your data is quietly incomplete. Reconcile submitted against accounted-for, every time.

**Positional joins.** Reading results back by position works in testing and misaligns in production, attaching correct answers to the wrong rows. Key on an identifier you assign and carry through.

**Ignoring result expiry.** Batches are typically retrievable for a bounded window. If you do not persist results, you will pay to do the work again — and the second run may not be free.

**Non-idempotent re-submission.** You will re-submit failures. If processing inserts rather than upserts, re-submission duplicates your data, and the duplication rate equals your failure rate.

**Batching a small one-off job.** The reconciliation code costs an evening; the saving on 180 items is cents. Your time is the scarce resource.

**Marking a 200 response as success.** A truncated or schema-invalid result is a failure. "Succeeded" must mean "usable", or your reconciliation counts the wrong thing.

## Deliverable / proof of work

Write `portfolio/cost/03-batching-and-async.md` containing:

- **The classification audit** — three real loops or jobs from your own work, each classified as batchable or not, with the who-reads-this-and-when answer written down
- **The arithmetic** — for one job you intend to batch, the interactive total, batch total and saving, with the per-item cost sourced from your own logs and labelled as measured rather than estimated
- **A real batch run** — item count, submission and retrieval timings, and the reconciliation result showing how many items needed re-submission and why
- **Your status table** — the schema and one real row per status you have observed, including `missing` if you saw one
- **The honest verdict on a job you decided NOT to batch**, with the reason, because recognising what is not worth optimising is part of the skill

## Checklist

- [ ] I can answer "who reads this output, and when" for any job in my code <!-- id: cost-03-c01 energy: low -->
- [ ] I can explain why asynchronous work is discounted, in terms of scheduling constraints rather than charity <!-- id: cost-03-c02 energy: normal -->
- [ ] I can tell a genuinely background job from one on a request's critical path <!-- id: cost-03-c03 energy: normal -->
- [ ] I have measured a real per-item cost from my own logs rather than estimating it <!-- id: cost-03-c04 energy: normal -->
- [ ] I can compute the saving from batching before doing the rewrite <!-- id: cost-03-c05 energy: low -->
- [ ] I can name the four operational costs of batching that a naive estimate omits <!-- id: cost-03-c06 energy: normal -->
- [ ] I can state why batch requests must be independent and test a request for independence <!-- id: cost-03-c07 energy: normal -->
- [ ] I know why positional result joins are unsafe and key on my own identifier instead <!-- id: cost-03-c08 energy: normal -->
- [ ] I reconcile submitted against accounted-for after every batch, and treat a mismatch as failure <!-- id: cost-03-c09 energy: high -->
- [ ] My item processing is idempotent, so re-submission cannot duplicate data <!-- id: cost-03-c10 energy: high -->
- [ ] I distinguish `ok` from `failed` by validating the result, not by whether the request returned <!-- id: cost-03-c11 energy: normal -->
- [ ] I have decided at least one job is NOT worth batching, and can justify it <!-- id: cost-03-c12 energy: low -->

## Quiz

### Q1. A background worker calls a model and pushes the result to the user who triggered it. Can this job be batched? <!-- id: cost-03-q01 energy: normal -->

- [x] No, because the user is still waiting for the result — the latency was relocated, not removed
- [ ] Yes, because it runs outside the request cycle
- [ ] Yes, because the request handler already returned and the user is not blocked
- [ ] Only if the worker runs on a schedule rather than being triggered

**Why:** The classification test is who reads the output, and when, not where the code executes. If the same user is waiting for that value before they can continue, the work is on their critical path regardless of which process performs it. Batching would turn a short wait into an hours-long one.

### Q2. Why is asynchronous work cheaper at the provider? <!-- id: cost-03-q02 energy: high -->

- [ ] Because asynchronous requests use fewer tokens for the same content
- [x] Because you gave up the latency guarantee, so the provider can schedule the work when capacity is otherwise idle
- [ ] Because the provider is passing on a subsidy to attract batch customers
- [ ] Because batch requests bypass safety processing

**Why:** The discount is the price of the scheduling constraint handed back. An interactive request forces the provider to hold capacity ready now; a batch request lets them queue and group. The tokens are identical — only the freedom to schedule them differs.

### Q3. After a batch completes, 300 of your 10,000 submitted ids appear in neither the output nor the error file. What has happened, and what should you do? <!-- id: cost-03-q03 energy: high -->

- [ ] The job is corrupt and must be resubmitted from scratch
- [ ] Those items were rejected at validation and can be ignored
- [ ] The results are still being written and will appear shortly
- [x] This is a normal partial outcome — reconcile and re-submit the missing ids

**Why:** Missing items are a routine feature of asynchronous jobs, not an exception. Reconciliation exists precisely to detect them: every submitted id must appear in exactly one of output or error, and anything in neither gets re-submitted. Ignoring them silently truncates your dataset.

### Q4. You read batch results into a list and assign them to your input rows by index. It works in testing. Why is it dangerous? <!-- id: cost-03-q04 energy: high -->

- [x] Because result order is not guaranteed, so correct answers can be attached to the wrong rows without any visible error
- [ ] Because the provider may return results as a dictionary instead of a list
- [ ] Because list indices in most languages start at one rather than zero
- [ ] Because the output file may be truncated at an arbitrary point

**Why:** There is no ordering guarantee, and small test runs often happen to preserve order. The failure is silent and produces plausible-looking data attached to the wrong records — worse than a crash, because nothing signals that it happened. Carry your own identifier through and join on that.

### Q5. You want to batch a three-step pipeline where each step uses the previous step's output. What is the correct approach? <!-- id: cost-03-q05 energy: high -->

- [ ] Batch the whole pipeline as one job, since the steps are related
- [x] Run three batches with collection and validation between them, sequencing in your own code
- [ ] It cannot be batched; run the entire pipeline interactively
- [ ] Merge the three prompts into one larger prompt and batch that

**Why:** Batch requests cannot depend on each other, but that constrains a single batch rather than the pipeline. Three stages with collection between them keeps each stage fully independent, and the sequencing lives in your code where you can validate each intermediate result.

### Q6. Which job is genuinely NOT worth batching? <!-- id: cost-03-q06 energy: normal -->

- [ ] A nightly re-embedding of 12,000 chunks that is read tomorrow
- [x] A one-off cleanup of 180 messy records you want to inspect as you work
- [ ] A monthly backfill adding a summary column to 80,000 rows
- [ ] A weekly evaluation suite of 600 requests against your prompt

**Why:** The saving on a small one-off job is cents, while the reconciliation machinery costs an evening of your time — and you want to see results as you work. The others are large or recurring, where the rewrite is paid once and the saving compounds with frequency.

### Q7. Your batch job re-submits failed items, and your processor does `INSERT` into a results table. What is the consequence? <!-- id: cost-03-q07 energy: high -->

- [ ] Failed items are skipped, since the insert raises on the first failure
- [ ] Nothing, because failed items never produce output to insert
- [ ] The table grows by exactly the number of retries, which is harmless
- [x] Successful items that were re-submitted get inserted twice, so your data duplicates at roughly your failure rate

**Why:** Re-submission is a normal pipeline step, not an error path, so it runs often. Non-idempotent processing turns every retry into a duplicate row. Use an upsert keyed on your own id so a repeated success overwrites rather than appends.

### Q8. A batch result arrives with a 200 status but the text was cut off at your output ceiling. How should your pipeline classify it? <!-- id: cost-03-q08 energy: normal -->

- [ ] `ok`, because the request succeeded and a result was returned
- [ ] `missing`, because no usable result was produced
- [x] `failed`, because a result that fails your validation is not a success even though the request returned
- [ ] `pending`, so it is retried on the next run

**Why:** "Succeeded" has to mean "usable" or your reconciliation counts the wrong thing and your dataset contains truncations you believe are complete. Validate schema, length and content before marking anything `ok` — the same distinction between a call that ran and a task that succeeded.

## You're ready to move on when...

You can take any model-calling job in your own code and answer, without looking anything up, whether it is batchable — by naming who reads the output and when. You have run a real batch job, reconciled it, found that some items needed re-submission, and handled that without treating it as a crisis. You have measured a real per-item cost rather than estimating one. And you have looked at at least one job and decided, with reasons, that batching it is not worth your time.

The habit worth keeping is the reconciliation assertion. Every asynchronous system fails by completing partially and reporting success, and the only defence is checking that what you submitted equals what you accounted for.

## Free vs Paid

### What's free is enough

Everything structural here is free. Batch submission itself costs nothing beyond the discounted tokens, and the discount is a reduction rather than a fee. SQLite or a CSV tracks job state at no cost, and jq or Python slices result files. Background execution via cron or Task Scheduler is free on every platform. A local model through Ollama runs the same job at zero marginal cost, which makes it a genuinely useful comparison point — and for a bulk job on a narrow task, it may remove the token bill entirely.

The habit this phase teaches — reconcile submitted against accounted-for — is free, and it is the part that transfers to any provider and any future tool.

### What a paid tier adds

A paid tier may raise batch rate limits and per-job item caps, which matters when a single job exceeds a free ceiling and must be split. It may also offer longer result-retention windows. Neither is a capability you lack so much as a ceiling you may hit on a very large job, and splitting a job into chunks is a workable free answer.

### When it's worth paying

When your batch volume is large enough that a rate limit or item cap forces you to split jobs in a way that complicates reconciliation, or when the result-expiry window is shorter than your processing cadence. Both are scale problems, and both should be measured rather than assumed. **For a learner running nightly jobs over thousands of items, the free path is not a compromise** — the job sizes where free limits bind are well beyond a personal project.
