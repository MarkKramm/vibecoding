---
id: cost-06-local-vs-api
track: cost
phase: 6
order: 60
title: Local Models and Provider Strategy
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/cost/06-local-vs-api.md
exit_criteria: >
  You have priced a month of your own real usage against the amortised cost of
  the hardware you would need to run it locally, and you can state the crossover
  in volume rather than in adjectives. You have a written provider shortlist
  built on coverage, payment method, feature support, rate limits and data
  terms — not on a leaderboard — and a thin interface of your own that lets you
  move between two providers by changing one value. You can say, for a task you
  actually run, whether it should go local, go to a free tier, or go to a paid
  frontier model, and you can name the condition under which that answer flips.
---

# Phase 6 — Local Models and Provider Strategy

## Goal of this phase

Your free API access ends soon. That is not a small administrative event — it is the moment the cost track stops being theory and becomes a decision you have to make with your own money, on a connection you do not fully control, from a country that most provider signup forms were not designed around.

The decision is not "local or API". That framing produces arguments. The real decision is a **split**: which of your work goes where, and what it costs you — in pesos, in hours, and in quality — to put it there. By the end of this phase you will have priced your own usage, computed the volume at which running a model yourself beats paying per token, written a provider shortlist that accounts for the things that actually gate you (can you pay, can you connect, what do the terms say about your data), and built a small interface so that changing your mind about a provider costs you one line instead of one weekend.

Everything volatile in this phase — prices, free tiers, model names, context sizes — is dated and flagged, because the whole point is that you should be able to redo the arithmetic yourself next quarter when all of it has moved.

## Estimated time

**1 week** at 1–2 hours a day, 5 days. Roughly 7–9 hours.

| Day | Focus | Time |
|---|---|---|
| 1 | Parts 1–2: the cost model for local, and the cost model for API | 1.5h |
| 2 | Part 3: the decision rule, and pricing your own month of usage | 1.5h |
| 3 | Part 4: provider strategy for a reader in the Philippines | 2h |
| 4 | Part 5: abstraction layers, and building your thin interface | 2h |
| 5 | Deliverable, provider checklist, quiz | 1.5h |

If you only have three hours this week, do tasks 1, 3, 5 and 9. Those four produce the arithmetic, the crossover number, the shortlist and the interface, which is the whole phase in miniature.

## Skills you'll gain

- Price electricity, hardware, and your own time into a per-million-token cost for a local model, and see which term dominates.
- Separate the two things people call "cost": the marginal cost per call and the fixed cost you pay whether or not you use it.
- Measure a month of your own token usage, price it at current rates, and compare it against hardware amortised over roughly three years.
- State the crossover volume for your own workload, and say why it is a range rather than a number.
- Judge a small local model against a frontier model on a *specific task* rather than in general, and predict which tasks will fail.
- Check whether a provider is usable from where you are before evaluating anything else about it.
- Read a pricing page for the four features that move your bill more than the headline rate.
- Recognise the Philippine Data Privacy Act of 2012 (RA 10173) obligations that attach when you process other people's personal data.
- Explain the honest trade-offs of an abstraction layer, and build a thin interface of your own instead.
- Apply a provider-evaluation checklist and produce a defensible shortlist.
- Say where all of this stops working: at the point where quality, not cost, decides.

## Specific topics to learn

### The true cost of local

- Hardware as the dominant term: memory capacity first, bandwidth second, compute a distant third.
- Electricity: a wattage estimate, a duty cycle, and a Philippine residential rate you look up yourself.
- Setup and maintenance time, priced at what your hour is worth.
- Download cost on a metered or capped connection, which is a real constraint and not a footnote.
- The quality gap: what small local models are genuinely worse at, and what they are fine at.
- Opportunity cost: what you did not build while you were rebuilding CUDA.

### The true cost of API

- Per-token charges, input versus output, and why output is usually the expensive side.
- Volume scaling: the bill is a function of usage, so a bug becomes an invoice.
- Network dependency, latency measured from your location, and what a bad hour does to a demo.
- Data leaving your machine, and what the provider's terms let them do with it.
- Rate limits at your actual tier, and the difference between a limit you plan around and one that breaks you.
- Availability: the provider is a dependency you do not operate.

### Measuring the crossover

- Instrumenting your own usage so you have real numbers instead of a vibe.
- Amortising hardware over about three years, and what breaks that assumption.
- The fixed-versus-variable framing, and why it explains the whole decision.
- Why the crossover is a range: quality, latency and reliability all shift it.

### Provider strategy from the Philippines

- Coverage and legality first: a provider you cannot legitimately use is not a candidate.
- Payment methods: whether an international card or another funding path is required.
- Free tiers: what they actually gate, and what the terms say about your inputs.
- Feature support that moves cost more than price: tool calling, structured outputs, caching, batch.
- Rate limits at your real tier, not the marketing tier.
- Latency from your location, measured rather than assumed.
- Data retention, and terms on training or distillation.
- The Data Privacy Act of 2012 (RA 10173) as an obligation, not a slogan.

### Abstraction layers and the pragmatic middle

- What LiteLLM, OpenRouter and self-hosted gateways actually do.
- The leaky abstraction: the common denominator is smaller than any single provider's API.
- Debugging through an extra hop, and the version lag behind new features.
- The thin interface: your own 60 lines, owning the parts that matter.

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Ollama | Run open-weight models locally with one command | Free/open-source | https://ollama.com/ | Task t04 — pull one small model and one bigger one and compare on the same task | `llama.cpp` directly, or LM Studio |
| llama.cpp | The inference engine underneath most local runners, with the quantization details in the open | Free/open-source | https://github.com/ggml-org/llama.cpp | Task t05 — read the quant names, then measure your own tokens/second | Any other local runner that reports tokens/second |
| LiteLLM | One Python interface across providers, so you can compare cost per call | Free/open-source | https://github.com/BerriAI/litellm | Task t11 — route one call to two providers and diff the reported cost | Provider SDKs, or plain `requests` against each one |
| OpenRouter | Reach many models behind one compatible endpoint, with a model list and per-call cost reporting | Freemium — takes a fee on credit purchases | https://openrouter.ai/models | Task t11 — run the same prompt through two models and log both costs | Each provider's own free tier, called directly |
| A provider pricing page | The only source that is not stale; prices change without notice | Free to read | https://openai.com/api/pricing/ | Task t06 — price your month of usage at today's rates | Any other provider's pricing page; read two and compare |
| `psutil` (Python) | Measure your own machine's power draw proxy and memory headroom | Free/open-source | https://github.com/giampaolo/psutil | Task t02 — log RAM and CPU during a local generation | Your OS's own task manager or `top` |
| `requests` | Call provider APIs directly, so no abstraction hides the fields | Free/open-source | https://requests.readthedocs.io/ | Task t09 — build the thin interface on raw HTTP | Python's built-in `urllib.request` |
| A spreadsheet (LibreOffice Calc) | Model the crossover: fixed cost, variable cost, volume | Free/open-source | https://www.libreoffice.org/discover/calc/ | Tasks t03, t06, t08 — the crossover table and chart | Google Sheets free tier, or a Python script that prints the table |
| Hugging Face model hub | Find open-weight models and read their real config and licence | Free to browse | https://huggingface.co/models | Task t05 — check the licence and the parameter count before downloading anything | Any published model card; the licence is the thing you must read |
| A kill-a-watt style power meter | Measure what your machine actually draws instead of guessing from the PSU label | Paid hardware — varies by country | https://en.wikipedia.org/wiki/Electricity_meter | Optional extension to t02, if you can borrow one | Your electricity bill plus a duty-cycle estimate, clearly labelled as an estimate |
| OpenRouter or LiteLLM docs | Read the failover and routing options before writing your own | Free to read | https://docs.litellm.ai/ | Task t11 — compare their retry semantics against yours | The provider's own error-handling docs |

## Free/cheap resources

- **Ollama — model library and quickstart** — https://ollama.com/
- **llama.cpp — repository and quantization documentation** — https://github.com/ggml-org/llama.cpp
- **Hugging Face — model hub, where the licence and config live** — https://huggingface.co/models
- **LiteLLM — documentation** — https://docs.litellm.ai/
- **LiteLLM — repository** — https://github.com/BerriAI/litellm
- **OpenRouter — model list and current per-model pricing** — https://openrouter.ai/models
- **OpenAI — API pricing** — https://openai.com/api/pricing/
- **Anthropic — pricing** — https://www.anthropic.com/pricing
- **Google — Gemini API pricing** — https://ai.google.dev/gemini-api/docs/pricing
- **Google — Gemini API rate limits** — https://ai.google.dev/gemini-api/docs/rate-limits
- **OpenAI — rate limits guide** — https://platform.openai.com/docs/guides/rate-limits
- **OpenAI — data usage and retention policies** — https://platform.openai.com/docs/guides/your-data
- **Anthropic — privacy and data retention** — https://privacy.anthropic.com/
- **Model Context Protocol — specification** — https://modelcontextprotocol.io/
- **Philippine Statistics Authority — Data Privacy Act of 2012 (Republic Act No. 10173) full text** — https://privacy.gov.ph/data-privacy-act/
- **National Privacy Commission — advisories and guidance** — https://privacy.gov.ph/
- **Meralco — residential electricity rates** — https://company.meralco.com.ph/
- **arXiv — Attention Is All You Need (Vaswani et al., 2017)** — https://arxiv.org/abs/1706.03762
- **arXiv — Lost in the Middle: How Language Models Use Long Contexts (Liu et al., 2023)** — https://arxiv.org/abs/2307.03172
- **arXiv — Tokenization and language model performance on non-English text (Petrov et al., 2023)** — https://arxiv.org/abs/2305.15425
- **arXiv — LoRA: Low-Rank Adaptation of Large Language Models (Hu et al., 2021)** — https://arxiv.org/abs/2106.09685
- **arXiv — QLoRA: Efficient Finetuning of Quantized LLMs (Dettmers et al., 2023)** — https://arxiv.org/abs/2305.14314
- **arXiv — Efficient Memory Management for Large Language Model Serving with PagedAttention (Kwon et al., SOSP 2023)** — https://arxiv.org/abs/2309.06180
- **Anthropic — Introducing Contextual Retrieval (19 Sep 2024)** — https://www.anthropic.com/news/contextual-retrieval

## Lesson: The Bill You Are Not Paying Yet

Your free access is a subsidy, and subsidies end. What you have been doing for months — sending text to a frontier model, getting a good answer back, paying nothing — has a real cost that somebody else was covering. When that stops, you do not get to keep the behaviour and lose the bill. You have to choose how you will pay: in pesos per token, or in hardware, electricity and hours.

This lesson gives you the arithmetic for both, the rule for choosing, and the strategy layer that decides whether either is available to you from where you sit.

### Part 1 — Local is a fixed cost, and the fixed cost is hardware

Start with the honest version of the local story, because the honest version is the one that survives contact with your electricity bill.

Running a model on your own machine costs you nothing per token. That part is true and it is genuinely the appeal. What it costs you instead is a machine that can hold the model — and the constraint that decides whether you can is **memory capacity**, not compute. Not the teraflops number on the box. Capacity.

Here is why. At generation time the model's weights have to be resident in whatever memory your processor can read from quickly. A model with `P` parameters stored at `b` bytes per parameter needs roughly `P × b` bytes just to sit still, before any KV cache, before any context. That is a durable relationship — it follows from how inference works, and no amount of software cleverness removes it, only compresses it.

So the first number you compute for any candidate local model is: **how many bytes of memory does it need, and how many do I have?** And then the arithmetic gets uncomfortable, because it is almost never the model you wanted.

If you have 8 GB of usable unified memory and the operating system needs a couple of gigabytes, you have maybe 5–6 GB for the model and its KV cache. A model needing 14 GB at half precision does not fit. You quantize it — store the weights in fewer bits — and now it fits, at some cost in quality that you will measure rather than assume. This is why quantization is not an advanced topic you get to later; it decides whether local is possible for you at all.

> Think of local inference as buying a generator instead of paying the electric company. The analogy is useful for exactly one thing: it makes the shape obvious — a large one-time cost, then near-zero marginal cost, and the question is whether you run enough load to justify the purchase. Retire it immediately after that, because a generator's output does not get *worse* when you buy a smaller one, and a model's does. The analogy has no quality axis, and quality is half of this phase.

| Cost term | What it is | How to estimate it | When it dominates |
|---|---|---|---|
| Hardware | The machine, or the upgrade | Current local retail price of the component that gates you — usually memory | Always, at low volume |
| Electricity | Watts × hours × your rate | Measure or estimate draw, multiply by duty cycle and by your kWh rate | At high duty cycle, on long jobs |
| Setup time | Drivers, quantization choices, broken dependencies | Hours × what your hour is worth | Once, but it is real |
| Maintenance time | Re-downloading models, fixing what an update broke | Hours per month × your rate | Quietly, forever |
| Download | Bytes over your connection | Model size in GB × your effective cost per GB | If your connection is metered |
| Opportunity cost | What you did not build | The value of the alternative use of those hours | Usually the largest term, and the one nobody writes down |

**Electricity deserves an actual number, and you should compute your own.** Take your machine's draw under sustained generation — not idle, not the marketing number. Multiply by hours of actual use per month, then by your residential rate per kilowatt-hour from your own bill or your distribution utility's published rate. **Do not accept a rate from this document.** Philippine residential rates are set per distribution utility, change month to month, and vary by consumption bracket. **Volatile, dated: as of early 2026, rates differ substantially between utilities and move with generation charges — check your current bill.**

A rough shape, with illustrative numbers only: a machine drawing somewhere in the low hundreds of watts, run two hours a day for thirty days, is on the order of ten kilowatt-hours a month. Multiply by your rate. For a laptop that is small. For a desktop with a discrete accelerator running jobs all night it stops being small — and if you are running those jobs to avoid paying for tokens, the electricity can quietly become the thing you were trying to avoid.

**Download is the term outsiders skip, and in the Philippines it is not a footnote.** A quantized model that fits in 8 GB is an 8 GB download before you have generated a single token. On an unlimited fibre plan that is an inconvenience. On a prepaid or capped mobile connection — which is how a large number of people here are actually online — it is a direct cost, and possibly a hard stop at the data cap. Do the multiplication before you start the download: **model size in gigabytes × your effective cost per gigabyte.** If that number is comparable to what a month of API calls would cost, local is not the cheap option; it is the expensive one wearing a free sticker. There is also a practical trap: a download that fails at 90% and restarts is not a one-off misfortune on an unstable link, it is the expected behaviour.

**The quality gap is a cost term too, and it is the one people lie to themselves about.** Small models that fit on a consumer machine are genuinely, measurably weaker than frontier hosted models on the tasks where difficulty is real: multi-step reasoning, non-trivial code, long-context recall, and anything requiring precise instruction-following across many constraints. This is not a temporary state of affairs that a firmware update will fix — capability has followed parameter count and training compute closely enough that a model small enough to fit in your laptop's memory is, today, not the same instrument as a hosted frontier model. **Volatile, dated: as of early 2026 the gap is large on hard reasoning and coding and small on classification, extraction and short summarisation — re-measure it yourself, on your task, because it narrows over time.**

Two things make this gap concrete. The first is non-English text. Tokenizers are trained overwhelmingly on English, and Petrov et al. (arXiv:2305.15425) measured how much more text a given piece of non-English content costs in tokens, and how much worse the results are for languages underrepresented in the training mix. Filipino and Tagalog, and the English–Tagalog code-switching that most real Philippine text contains, sit on the wrong side of that distribution — and every effect of it is worse on a small local model than on a frontier one.

**Do not inflate that into a number it is not.** The paper's headline of "up to 15 times" is the extreme end across many language pairs — the worst case, which is Shan — not a figure for Tagalog specifically. Tagalog's actual premium in the paper's own measurements is on the order of **2×**, which is a real cost and a much smaller one. `cost/01` makes the same point; keep both consistent if you revise either. **Measure your own ratio on your own text rather than assuming the extreme**, because the honest version of this claim is still enough to matter: at 2×, every Filipino-language token bill and every context budget is roughly doubled, and that compounds across a whole workload.

The second is long context: Lost in the Middle (arXiv:2307.03172) found that retrieval accuracy degrades when the relevant passage sits in the middle of a long context. The honest anchor is not a percentage drop — it is that middle accuracy falls below the model's own closed-book accuracy, meaning it would have done better without the document. A small local model with a long context loaded into it degrades further, and faster.

**Where local stops working.** Local stops being the right answer the moment the task is hard and the answer matters. It also stops when your time is worth more than the tokens you are saving — and for a learner with a free or cheap API, that is most of the time. It stops hardest on the download: if getting the weights costs you more than the inference would have, the economics are already settled.

### Part 2 — API is a variable cost, and variable costs scale with your mistakes

The API's structure is the mirror image. You pay nothing to exist and nothing to be capable. You pay per token, and only when you use it. That means your first month can cost almost nothing and your worst month can cost a great deal, and nothing in the pricing page warns you about the difference.

The durable facts, independent of any provider's rate card:

- **Input and output are priced separately, and output is usually several times the input price.** Generating a token costs more compute than reading one, because generation is sequential and memory-bound while prefill is parallel. The ratio is the durable part. **Volatile, dated: the absolute rates change frequently and vary by more than an order of magnitude between models — as of early 2026, check the provider's current pricing page rather than any summary, including this one.**
- **Your bill is a function of your usage, so your bill is a function of your bugs.** An agent loop that retries a failing tool call in a cycle, or a summariser that runs on a document it already summarised, generates cost proportional to the defect. This is the single most important difference from local: with local, a runaway loop wastes time; with the API, it spends money.
- **Latency and reliability are somebody else's infrastructure.** You did not build it, you cannot tune it, and you share it. A saturated hour at the provider is your outage.

Then the terms that are specific to your situation, and that a curriculum written for a reader in California would not mention.

**Network dependency.** Every request is a round trip over a connection you do not control. From the Philippines that path is longer than the provider's own documentation assumes, and it is affected by things you cannot see. Measure it rather than assuming: time-to-first-token from your location, at the hour you actually work, is the number that decides whether a user-facing application is viable. If you build a product whose perceived quality depends on streaming latency, you have taken a dependency on international routing conditions.

**Data leaving your machine.** Sending text to a hosted API is disclosure, full stop. Whatever the retention terms say, the bytes left your device and crossed at least one jurisdiction. For a hobby project that is fine. For other people's personal information it is a legal question, and in the Philippines it has a specific answer — Part 4 gets to RA 10173.

**Rate limits, at your tier.** Every provider limits how fast you may call it, usually per minute and per day, in requests and in tokens. Free and entry tiers are limited much more tightly than paid tiers, and the limits are the practical ceiling on what you can build. A batch job needing 20,000 calls cannot run on a tier that allows a few hundred a day, however good the model is.

**Availability.** The provider can change a model under you, deprecate an identifier, change a price, restrict a region, or have a bad afternoon. All of these have happened to people shipping real systems. You mitigate with failure handling, pinned snapshots, and knowing your fallback — which is what the thin interface in Part 5 is for.

**Where the API stops working.** It stops when the data cannot legally leave, when the connection cannot be relied on, when the volume is high enough that the per-token bill exceeds an amortised machine, and when a rate limit at your tier is below the throughput your task needs. It also stops, less obviously, when you need the same answer a hundred thousand times on a trivial task — paying frontier prices to classify sentiment is not a strategy, it is a habit.

### Part 3 — The crossover, and why it is a range and not a number

Now you can state the decision as arithmetic instead of preference.

Write down two functions of monthly volume `V` (measured in millions of tokens):

```text
local_cost(V)  = fixed_monthly + variable_monthly(V)
               = (hardware_price / 36) + electricity + (your_hours × your_rate) + download_amortised
               ≈ a constant that does not care how much you use it

api_cost(V)    = V × price_per_million
               ≈ zero when V is zero, and linear in V forever
```

The shapes are the whole argument. `local_cost` is roughly flat — the machine costs the same whether you run one prompt or a million. `api_cost` starts at zero and climbs. They cross exactly once. Below the crossing, API is cheaper. Above it, local is.

**Amortise the hardware over about three years.** That is the assumption to start with, and you should know what it rests on. Three years is a guess about how long a machine stays useful for this purpose, which depends on how fast models grow relative to your memory, and on whether the machine is doing other work for you. If it is also your daily driver, do not charge the whole price to inference — charge the marginal cost of the upgrade, which is often just the memory. If model sizes grow faster than your memory, the useful life is shorter than three years and your local cost per token is *higher* than the table says.

Then compute your own numbers. Do it honestly, in a spreadsheet, with the terms you actually have:

```python
# crossover.py — illustrative arithmetic, not a recommendation.
# Every number below is a placeholder you replace with your own measurement.

HARDWARE_PHP      = 0        # the marginal cost of the machine, or of the upgrade
LIFE_MONTHS       = 36       # ~3 years; justify your own
WATTS             = 150      # sustained draw under generation, measured not guessed
HOURS_PER_MONTH   = 40
RATE_PHP_PER_KWH  = 0.0      # YOUR rate, from YOUR bill. Look it up.
HOURS_PER_MONTH_M = 6        # setup + maintenance, honestly counted
YOUR_HOURLY_PHP   = 0        # what an hour of your time is worth to you
DOWNLOAD_GB       = 8
PHP_PER_GB        = 0.0      # 0 if your plan is genuinely unlimited

def local_monthly():
    power = (WATTS / 1000) * HOURS_PER_MONTH * RATE_PHP_PER_KWH
    amort = HARDWARE_PHP / LIFE_MONTHS
    time  = HOURS_PER_MONTH_M * YOUR_HOURLY_PHP
    down  = DOWNLOAD_GB * PHP_PER_GB / LIFE_MONTHS  # spread over the machine's life
    return amort + power + time + down

def api_monthly(millions_of_tokens, php_per_million):
    return millions_of_tokens * php_per_million

fixed = local_monthly()
print(f"local fixed cost per month: PHP {fixed:,.2f}")

for price in (50, 200, 800):
    # Volume at which API cost equals the local fixed cost.
    breakeven = fixed / price if price else float("inf")
    print(f"at PHP {price}/M tokens, local wins above {breakeven:,.1f}M tokens/month")
```

Run it and look at the output with clear eyes. **The breakeven volume is usually far higher than beginners expect**, because the fixed side includes your hours. If you value your time at anything realistic, six hours a month of setup and maintenance can exceed what a moderate API bill would cost — which is the honest reason the decision rule below starts with "use the API."

**Now the part that makes it a range rather than a number.** The crossover moves:

- **Quality moves it.** If the local model is not good enough for the task, the comparison is meaningless — the local option is not cheaper, it is unavailable at any price. This is why the quality gap in Part 1 is a cost term and not a caveat.
- **Latency and reliability move it.** A local model that answers in three seconds and a hosted model that answers in four hundred milliseconds are not interchangeable for an interactive application, whatever the per-token arithmetic says.
- **Your hours move it, and they move it most.** Two people with identical hardware and identical usage get different answers, because one counts maintenance time and the other pretends it is free. Count it.
- **Volume volatility moves it.** Local is a bet that you will keep using it. If your usage is bursty — heavy for two months, nothing for four — you have paid the fixed cost for a capability you used a third of the time.

**Where the crossover analysis stops working.** It stops when quality is the deciding constraint, because then it is not a cost question at all. It stops when your usage is bursty rather than steady. And it stops when the thing you would run locally is a task where a free tier already covers you — paying a fixed hardware cost to avoid a bill that a free tier would have absorbed is the most common form of this mistake.

### Part 4 — The decision rule, applied to a learner in the Philippines

Here is the rule, stated plainly. Use it, then read the qualifications.

| Situation | Choose | Why |
|---|---|---|
| Low volume, or you are still learning | **API** (free tier first, paid later) | Per-token costs are trivial at this scale, your time is the scarce resource, and the strong model teaches you more per hour |
| High volume on a narrow, stable task | **Local** | Marginal cost approaches zero, and a narrow task is exactly where a small model does not embarrass you |
| Data you cannot disclose | **Local**, if quality suffices | The only option that keeps the bytes on your machine; check the quality honestly |
| Hard reasoning or real coding | **API** | The quality gap is largest precisely where you need the answer to be right |
| Offline, or unreliable connectivity | **Local** | A model on disk works when the link does not |
| Bulk cheap work: classification, extraction, embeddings, eval runs | **Local or a free tier** | These are high-volume, low-difficulty, and quality-tolerant by construction |
| The few requests where quality decides | **Paid frontier model** | Pay for the calls that matter; don't pay for the ones that don't |

**The hybrid is the answer, and it is not a compromise.** The configuration that actually serves a learner on a $0-then-small budget is a split, not a choice:

- **Local or free-tier models** carry the bulk: classification, extraction, embedding, and — importantly — **eval runs**. Evaluation is the highest-volume, lowest-stakes work you will do. Running your test set two hundred times while you iterate on a prompt is exactly what a small local model is fine at, and exactly what would cost real money against a frontier model. Keep your evaluation loop local and you can afford to iterate.
- **A paid frontier model** carries the few requests where the answer must be right: the hard reasoning step, the final draft a human will read, the ambiguous case your cheap pipeline flagged.

This split also makes the crossover analysis usable. You do not need to decide whether "local or API" wins in general. You decide per workload, and most of your volume is low-difficulty work where the answer is obvious.

**The download constraint, restated because it gates the plan.** If your connection is metered or capped, every local option carries an entry fee you pay in data before you generate anything. Compute it. And if you are on prepaid mobile data, note that the *setup* is not a one-time download either — models get updated, you try a second one, the first one did not fit. Budget the data cost of experimentation, not just the cost of the final model.

**Now the compliance layer, which is not optional if you touch other people's data.** The **Data Privacy Act of 2012 (Republic Act No. 10173)** governs how personal data is processed in the Philippines, and sending personal data to a third-party API is processing through a processor — which brings obligations with it: lawful basis, purpose limitation, transparency, security measures, and accountability for what happens downstream. **This is a real legal obligation and not a technical preference.** I am not qualified to give you legal advice; if you are handling other people's personal data in anything that is not a toy, read the Act and the National Privacy Commission's guidance. **Volatile, dated: the Act is stable law, but NPC issuances and enforcement expectations evolve — check privacy.gov.ph for current guidance rather than any summary.** The practical consequence is the direction you would guess: personal data pushes you toward local, or toward a provider whose terms you have actually read.

### Part 5 — Provider strategy: what to check before you check the price

The headline price per million tokens is the last thing to look at, not the first, because four other things can make a provider unusable regardless of how cheap it is.

**1. Coverage and legality, first.** A provider you cannot legitimately access from the Philippines, or whose terms exclude your use, is not an option — it is a rumour. Check the supported-countries list and the terms of service before you evaluate anything else. This sounds obvious and it eliminates candidates that appear on every "best models" list.

**2. Payment method.** Many providers require an international card or one that supports recurring international charges. If you do not have one, the practical options are: use free tiers and free credit, use a provider that accepts a payment method you do have, use a reseller or aggregator that accepts local funding, or stay local. **Volatile, dated: accepted payment methods and available free credit change frequently and differ by provider — verify on the provider's own billing page before planning around it.** Work out which applies to you *before* you build on a provider.

**3. Free-tier reality and data terms.** Free tiers are not free; they are paid for in tighter rate limits, smaller or older models, and — often — a different data-usage term than the paid tier. Several providers reserve broader rights over inputs submitted on free tiers, including using them to improve models. That is a legitimate business arrangement and it is not hidden, but it is easy to miss and it matters enormously if the input is other people's personal data. **Volatile, dated: free-tier terms differ between providers and change; read the current data-usage policy for the specific tier you are on, not the marketing page.**

**4. Feature support that moves your bill more than the headline rate.** Four features matter more than the price per token:

| Feature | Why it changes your bill | What to check |
|---|---|---|
| **Prompt caching** | A cached prefix turns prefill you would pay for on every request into a one-time cost — often a large discount on the input side | Whether it exists, what the discount is, what the minimum prefix is, and how long a cache entry lives |
| **Batch API** | Asynchronous bulk jobs are commonly priced at a substantial discount to synchronous calls | Whether there is a batch endpoint, the discount, and the turnaround window you must accept |
| **Tool calling** | Without it, anything agentic requires parsing prose, which means retries, which means cost | Whether it is supported, and whether it is supported on the tier and model you can afford |
| **Structured outputs** | Schema-constrained decoding removes the retry loop that a parse failure would cause | Whether the provider supports it, and which schema keywords it accepts |

The interaction is what matters. A provider with a higher headline price, a working cache, and a batch endpoint can be cheaper for *your* workload than a provider with a lower headline price and neither. Price the workload, not the rate.

**5. Rate limits at your actual tier.** Not the tier on the marketing page — the tier you will be on. Limits are usually expressed per minute and per day, in requests and in tokens, and hitting any single dimension produces the same error. Write the numbers down, then check whether your task fits: if your job needs N calls and your daily request limit is below N, the provider cannot run your job, regardless of cost.

**6. Latency measured from your location.** Do not take a benchmark number from someone else's network. Measure time-to-first-token and total time from your own connection, at your own working hours, over several days. Latency varies by time of day, and the variance often matters more than the mean.

**7. Data retention and training terms.** Read three specific things: how long inputs are retained, whether they may be used to train or improve models, and what happens on deletion. Write the answers down. "We take privacy seriously" is not an answer to any of those questions.

**8. Terms on output and distillation.** Some providers restrict using outputs to train competing models. If your plan involves generating data to finetune another model — which the finetuning track will have you consider — that clause can make your plan a terms violation. Read it before, not after.

Put together, that is a checklist you can apply in about an hour:

```text
PROVIDER EVALUATION — apply in order, stop at the first failure

[ ] 1. Coverage    Can I legally use this from the Philippines, for this purpose?
[ ] 2. Payment     Can I actually fund it, with a method I actually have?
[ ] 3. Free terms  If I am on the free tier, may my inputs be used for training?
[ ] 4. Features    Caching? Batch? Tool calling? Structured outputs? At my tier?
[ ] 5. Limits      Requests/day and tokens/day at MY tier — does my job fit?
[ ] 6. Latency     Time-to-first-token measured from MY connection, over days
[ ] 7. Retention   How long are inputs kept, and what happens on delete?
[ ] 8. Training    May outputs be used to train a competing model?
[ ] 9. Fallback    If this provider vanishes tomorrow, what runs my code instead?
```

Now the abstraction layer question, because it is the obvious response to "what if I need to switch." Tools like **LiteLLM** and aggregators like **OpenRouter** exist to let you write one call and reach many providers. They are genuinely useful, and their trade-offs are real:

- **They are leaky abstractions.** The common interface is the *intersection* of what providers support, and the intersection is smaller than any one provider's API. Provider-specific parameters — a caching control, a reasoning-effort setting, a particular structured-output mode — either do not exist in the abstraction or leak through as a passthrough string that the abstraction does not understand and cannot validate.
- **The common denominator costs you features.** The features in the table above are exactly the ones that differ most between providers, and they are exactly the ones an abstraction flattens. A workload optimised through a lowest-common-denominator layer is a workload that cannot use prompt caching properly.
- **Debugging gets harder.** An extra hop means an extra place for an error to originate. When a request fails, you now have to determine whether the failure is the provider's, the gateway's, or the translation between them.
- **An extra hop is an extra latency hop.** Usually small. Under retries and failover, less small.
- **Version lag.** The abstraction supports a new feature when its maintainers ship support, which is after the provider shipped it. If your plan depends on a feature that is three weeks old, the abstraction may not have it.

**The pragmatic middle is a thin interface of your own.** Write sixty lines that do exactly what you need: one function, one request shape, one response shape, and per-provider adapters that translate at the edges. You own it, so it has no version lag, no common-denominator problem, and no mystery hop. It leaks nothing because it never claimed to be general — it is the smallest thing that lets you swap a provider by changing a configuration value.

```python
# thin_client.py — the whole abstraction layer. Own it; do not outsource it.
import os
import requests

PROVIDERS = {
    # Add a provider by adding an entry. Nothing else in your code changes.
    "primary": {
        "base_url": os.environ.get("PRIMARY_BASE_URL", "https://api.example-provider.com/v1"),
        "key_env": "PRIMARY_API_KEY",
        "model": os.environ.get("PRIMARY_MODEL", "check-current-docs"),
    },
    "secondary": {
        "base_url": os.environ.get("SECONDARY_BASE_URL", "https://api.other-provider.com/v1"),
        "key_env": "SECONDARY_API_KEY",
        "model": os.environ.get("SECONDARY_MODEL", "check-current-docs"),
    },
}

def complete(prompt: str, provider: str = "primary", timeout: int = 60) -> dict:
    """One call shape. Returns a normalised dict, not the provider's raw body."""
    cfg = PROVIDERS[provider]
    response = requests.post(
        f"{cfg['base_url']}/chat/completions",
        headers={
            "Authorization": f"Bearer {os.environ[cfg['key_env']]}",
            "Content-Type": "application/json",
        },
        json={
            "model": cfg["model"],
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=timeout,
    )
    response.raise_for_status()
    data = response.json()
    usage = data.get("usage") or {}
    return {
        "text": data["choices"][0]["message"]["content"],
        "finish_reason": data["choices"][0].get("finish_reason"),
        "input_tokens": usage.get("prompt_tokens"),
        "output_tokens": usage.get("completion_tokens"),
        "provider": provider,
        "model": data.get("model"),
    }
```

Three properties make that worth writing instead of installing something:

**It normalises the parts you actually use, and nothing else.** The return value is your shape. If a provider names a field differently, the adapter absorbs it. You are not building a general abstraction; you are building the one you need, which is why it does not have the common-denominator problem.

**It fails loudly.** The key is read with `os.environ[...]`, so a missing key is a `KeyError` at the call site rather than a confusing 401 three layers down.

**It is honestly incomplete.** It has no retry logic, no streaming, no caching, no failover. That is deliberate — add those when you need them, in code you can read, rather than inheriting someone else's decisions about all four.

**Where the thin interface stops working.** It stops when you genuinely need multi-provider routing with automatic failover, cost accounting across providers, or team-wide policy enforcement — that is what a real gateway is for, and writing your own is a project. It stops when you need to support twenty providers, at which point the maintenance burden is the abstraction you were avoiding. And it stops when you want someone else to be responsible for keeping up with provider changes, which is a legitimate thing to want and a legitimate thing to pay for.

## Hands-on practice tasks

1. List every AI task you ran in the last month and mark each one local, free tier, or paid. Do not deliberate — mark your instinct and move on. <!-- id: cost-06-local-vs-api-t01 band: quick energy: low -->
2. Measure your own machine: how much memory is usable, and what does it draw under sustained load? Log RAM and CPU for five minutes while something heavy runs. <!-- id: cost-06-local-vs-api-t02 band: quick energy: normal -->
3. Build the crossover spreadsheet. One column of fixed monthly costs (hardware amortised over 36 months, electricity at YOUR rate, your hours priced), one column of variable API costs, and a chart of the two against monthly volume. <!-- id: cost-06-local-vs-api-t03 band: focused energy: high -->
4. Install a local runner and pull two models of clearly different sizes. Run the same five prompts through both and write down where the small one fails and the big one does not. <!-- id: cost-06-local-vs-api-t04 band: focused energy: high -->
5. Measure your local throughput in tokens per second for both models, and note the memory each one occupies while running. Compute what a million output tokens would cost you locally in electricity. <!-- id: cost-06-local-vs-api-t05 band: focused energy: normal -->
6. Instrument a week of your real API usage: log input tokens, output tokens, model, and timestamp for every call. Price the week at current published rates and multiply to a month. <!-- id: cost-06-local-vs-api-t06 band: deep energy: normal -->
7. Compute the download cost of the local models you are considering, in pesos, at your connection's effective rate per gigabyte. Compare it against a month of your measured API usage. <!-- id: cost-06-local-vs-api-t07 band: quick energy: low -->
8. Find your breakeven volume from task 3. State it as a range, and write one sentence for each factor that moves it — quality, latency, your hours, usage volatility. <!-- id: cost-06-local-vs-api-t08 band: deep energy: high -->
9. Write the thin interface from Part 5. Add a second provider entry and prove that switching is a one-value change by running the same prompt through both. <!-- id: cost-06-local-vs-api-t09 band: focused energy: normal -->
10. Apply the nine-point provider checklist to three real providers. Record the answer for every point, including "unknown" where you could not find it — an unknown is a finding. <!-- id: cost-06-local-vs-api-t10 band: deep energy: high -->
11. Run one prompt through LiteLLM or an aggregator and the same prompt through raw HTTP. Compare the latency, the fields you received, and what the abstraction added or hid. <!-- id: cost-06-local-vs-api-t11 band: focused energy: normal -->
12. Measure time-to-first-token from your own connection to two providers, at three different times of day. Report the variance, not just the average. <!-- id: cost-06-local-vs-api-t12 band: focused energy: normal -->
13. Read the data-usage policy of the free tier you are on and write down, in your own words, whether your inputs may be used for training and how long they are retained. <!-- id: cost-06-local-vs-api-t13 band: focused energy: normal -->
14. Design your hybrid: for each task from task 1, assign it to local, free tier, or paid, and state the condition under which that assignment would flip. <!-- id: cost-06-local-vs-api-t14 band: deep energy: high -->
15. Build the evaluation harness you will actually reuse: a small test set, runnable against a local model and a hosted one, reporting quality and cost per run. <!-- id: cost-06-local-vs-api-t15 band: deep energy: high -->
16. Write your own one-page provider policy: the order you check things in, your funding path, your fallback provider, and your rule for personal data. <!-- id: cost-06-local-vs-api-t16 band: ongoing energy: normal -->

## Common Pitfalls

**Comparing a local model's marginal cost against an API's total cost.** Local costs nothing per token and everything per month. If you compare the wrong two numbers you will always conclude local is cheaper, and you will be wrong at every volume you actually operate at.

**Forgetting to price your own hours.** Setup and maintenance are real, recurring, and usually the largest term for a learner. An analysis that treats your time as free is not an analysis, it is a preference with a spreadsheet attached.

**Assuming a quantized model is the model.** Quantization is what makes local possible on consumer hardware, and it costs quality — more on hard tasks than on easy ones. Measure the loss on your task rather than trusting that it is small.

**Treating the download as free.** On a metered or capped connection it is a direct cost, sometimes a large one, and the experimentation cycle multiplies it. Compute it before you commit to local.

**Believing the quality gap is temporary.** It narrows over time and it is real now. A plan that depends on a small local model doing frontier-level reasoning has a hole in it that no amount of tuning fills.

**Choosing a provider before checking you can pay for it.** Coverage and payment method gate everything else. Evaluating latency and features for a provider you cannot fund is a wasted afternoon.

**Reading the free tier's price and not its data terms.** Free tiers frequently carry broader rights over your inputs. If the input is someone else's personal data, that difference is the whole decision.

**Optimising for the headline rate.** Caching, batching, tool calling and structured outputs move your bill more than a few percent of the per-token price. Price your workload, not the rate.

**Sending personal data to a hosted API without thinking about RA 10173.** The Act attaches obligations when you process personal data, including through a processor. Reading the provider's privacy page is not the same as having a lawful basis.

**Adopting a gateway to avoid lock-in and inheriting a smaller feature set.** The abstraction's interface is the intersection of what providers support. You have traded lock-in for a ceiling, and the ceiling is often lower than the feature you wanted.

**Building a general abstraction for one application.** You will implement ten percent of it and maintain the other ninety percent forever. Write the thin one.

**Never revisiting the decision.** Prices fall, free tiers change, models shrink and improve. A provider decision made in one quarter and never re-examined is usually wrong by the next one.

## Deliverable / proof of work

Write `portfolio/cost/06-local-vs-api.md` containing:

- **A month of real usage, priced.** Your logged token counts (input and output separately), the model each went to, and the total cost at current published rates — with the date you checked and a note that the rates will have moved.
- **The crossover table and chart.** Fixed monthly local cost broken into hardware amortisation over 36 months, electricity at your own rate, and your own hours; variable API cost per million tokens; and the volume at which they cross. Label which inputs were measured and which were estimated.
- **Your download arithmetic.** Model sizes in GB, your effective cost per GB, the total, and your conclusion about whether a metered connection changes your plan.
- **A quality comparison on one real task.** The same test set run through one small local model and one hosted model, with your scoring rule stated, the failure cases listed, and a sentence on which failures would matter in production.
- **A nine-point provider evaluation for three real providers**, including unknowns, and your ranked shortlist with the reason for the ranking.
- **Your escape plan.** Which provider you would move to, what would trigger the move, and the evidence that your code can actually make it — ideally a run showing the same call served by two providers.
- **Your thin interface**, in full, with a note on what you deliberately left out and why.
- **Your hybrid assignment.** Every task from task 1 assigned to local, free tier, or paid, with the condition that would flip each assignment.
- **Your data-handling rule.** One paragraph stating what you will and will not send to a hosted API, what you do when the data is somebody else's personal information, and where RA 10173 fits.
- **A section titled "Where this analysis stops working"** — the cases where cost is not the deciding constraint and you would choose against the arithmetic.

## Checklist

- [ ] I can state the difference between a fixed cost and a marginal cost, and say which one local and API each are <!-- id: cost-06-local-vs-api-c01 energy: low -->
- [ ] I have measured a week or more of my own real token usage and priced it at current rates <!-- id: cost-06-local-vs-api-c02 energy: normal -->
- [ ] I can name every term in the local cost model and say which dominates in my situation <!-- id: cost-06-local-vs-api-c03 energy: normal -->
- [ ] I have computed my electricity cost from my own bill's rate, not from a figure I read somewhere <!-- id: cost-06-local-vs-api-c04 energy: normal -->
- [ ] I have priced the download of a local model against my connection's effective cost per gigabyte <!-- id: cost-06-local-vs-api-c05 energy: normal -->
- [ ] I have run the same task through a small local model and a hosted model and written down where the local one failed <!-- id: cost-06-local-vs-api-c06 energy: high -->
- [ ] I can explain why the quality gap matters more on hard reasoning and coding than on extraction <!-- id: cost-06-local-vs-api-c07 energy: normal -->
- [ ] I have computed my breakeven volume and can say why it is a range rather than a single number <!-- id: cost-06-local-vs-api-c08 energy: high -->
- [ ] I can explain why amortising hardware over three years is an assumption and what breaks it <!-- id: cost-06-local-vs-api-c09 energy: normal -->
- [ ] I can apply the decision rule to a task I actually run and defend the answer <!-- id: cost-06-local-vs-api-c10 energy: normal -->
- [ ] I have a hybrid assignment where cheap high-volume work goes local or free and the few quality-critical calls go to a paid model <!-- id: cost-06-local-vs-api-c11 energy: high -->
- [ ] I can explain why keeping my evaluation runs local makes iterating affordable <!-- id: cost-06-local-vs-api-c12 energy: normal -->
- [ ] I checked whether each shortlisted provider is legitimately available to me before evaluating anything else <!-- id: cost-06-local-vs-api-c13 energy: low -->
- [ ] I know my own payment path to each provider I plan to use, or I know I do not have one <!-- id: cost-06-local-vs-api-c14 energy: normal -->
- [ ] I have read the data-usage terms of the free tier I am on, not just the paid tier's <!-- id: cost-06-local-vs-api-c15 energy: normal -->
- [ ] I can name four features that change my bill more than the headline price, and say whether my provider has them <!-- id: cost-06-local-vs-api-c16 energy: high -->
- [ ] I have measured latency to my providers from my own connection at more than one time of day <!-- id: cost-06-local-vs-api-c17 energy: normal -->
- [ ] I have written down each provider's retention policy and training terms in my own words <!-- id: cost-06-local-vs-api-c18 energy: normal -->
- [ ] I can explain when the Philippine Data Privacy Act of 2012 creates an obligation for something I am building <!-- id: cost-06-local-vs-api-c19 energy: high -->
- [ ] I can name the honest trade-offs of an abstraction layer: leaky interface, common denominator, harder debugging, extra hop, version lag <!-- id: cost-06-local-vs-api-c20 energy: normal -->
- [ ] I have built a thin interface of my own and demonstrated switching providers by changing one value <!-- id: cost-06-local-vs-api-c21 energy: high -->
- [ ] I can say where the thin interface stops working and when a real gateway earns its place <!-- id: cost-06-local-vs-api-c22 energy: normal -->
- [ ] I have a written escape plan naming the provider I would move to and what would trigger the move <!-- id: cost-06-local-vs-api-c23 energy: normal -->
- [ ] I know that every price, free tier and model name in this phase is dated and I know where to re-check it <!-- id: cost-06-local-vs-api-c24 energy: low -->

## Quiz

### Q1. You compare a local model that costs nothing per token against a hosted API at a few pesos per million tokens, and conclude local is cheaper. What is wrong with the comparison? <!-- id: cost-06-local-vs-api-q01 energy: normal -->

- [x] You compared local's marginal cost against the API's total cost; local's fixed cost is paid every month whether or not you use it
- [ ] Nothing — local inference genuinely costs nothing per token once the hardware is bought
- [ ] The API price is wrong because providers hide fees
- [ ] Local electricity is the missing term and it is usually larger than the hardware

**Why:** The two options have different cost structures, not different prices. Local is a fixed cost with a near-zero marginal cost; the API is a variable cost that starts at zero. Comparing the marginal side of one against the total of the other guarantees the wrong answer at every volume. The electricity point is a real term but it is rarely larger than the hardware, and the API price is not the issue — the comparison is.

### Q2. You are choosing a model that must fit on your 8 GB laptop. Which property of the model decides whether it fits? <!-- id: cost-06-local-vs-api-q02 energy: normal -->

- [ ] Its parameter count alone, because that is what determines size
- [ ] Its benchmark score, because better models are better optimised
- [x] Bytes of memory its weights and KV cache need, which depends on parameter count, the number of bits per weight, and the context you run
- [ ] Its context window length, which is the only hard limit

**Why:** Inference requires the weights to be resident, so the number that matters is bytes — roughly parameters multiplied by bytes per parameter — plus the KV cache, which grows with the context you actually use. Parameter count alone tells you nothing without the precision, which is why quantization is what makes local possible on consumer hardware at all. Benchmark scores say nothing about memory, and context length is a limit on the input, not on whether the model fits.

### Q3. Your connection is prepaid mobile data with a monthly cap. You are considering a local model. What should you compute before downloading? <!-- id: cost-06-local-vs-api-q03 energy: high -->

- [x] Model size in GB times your effective cost per GB, plus the data cost of the experimentation cycle, and compare it against what the API would have cost
- [ ] Nothing — a model download is a one-time cost and can be ignored
- [ ] Only the download time, since the data itself is included in the plan
- [ ] Only the model's parameter count, since smaller models download faster

**Why:** On an unlimited plan a download is an inconvenience; on a metered or capped connection it is a direct charge against a finite budget, and the first model you try is rarely the one you keep. Multiplying size by cost per gigabyte gives a real number, and comparing it against a month of API usage is what tells you whether local is actually the cheap option here. It frequently is not.

### Q4. A provider's headline price is noticeably lower than its competitor's. Why is that not enough to choose it? <!-- id: cost-06-local-vs-api-q04 energy: normal -->

- [ ] Because headline prices are usually inaccurate
- [x] Because prompt caching, batch pricing, tool calling and structured outputs can move your bill more than the per-token rate does
- [ ] Because cheaper providers are always slower
- [ ] Because the lower price is usually a temporary promotion

**Why:** The rate is one multiplier on a workload whose shape you control. A cached stable prefix can cut input costs substantially, a batch endpoint is commonly discounted against synchronous calls, and a provider without structured outputs forces retries you pay for. A higher headline rate with a working cache and a batch endpoint can beat a lower rate without them. The other options are guesses rather than mechanisms.

### Q5. You are about to send customer records to a hosted API to build a small tool. What is the relevant consideration? <!-- id: cost-06-local-vs-api-q05 energy: high -->

- [ ] Only the cost, since privacy is a matter of the provider's reputation
- [ ] Only the provider's retention policy, since that is the legal question
- [ ] Nothing beyond the free tier's rate limits, if you stay on the free tier
- [x] The Philippine Data Privacy Act of 2012 attaches obligations when you process personal data through a processor, so lawful basis, purpose limitation and the provider's terms all matter

**Why:** Sending personal data to a hosted service is processing it through a third party, which brings obligations under RA 10173 rather than merely a preference for privacy. Retention is one part of that picture, not the whole of it, and a free tier often carries broader rights over your inputs than a paid one — which makes the free option the riskier one, not the safer one. Reputation is not a legal basis.

### Q6. You adopt an abstraction layer so you can switch providers freely. What have you given up? <!-- id: cost-06-local-vs-api-q06 energy: normal -->

- [ ] Nothing meaningful — abstraction layers are strictly better than direct integration
- [ ] Only some performance, since the extra hop is the only real cost
- [x] Provider-specific features, because the common interface is the intersection of what providers support, and they are the features that move your bill
- [ ] Only the ability to use free tiers, which the abstraction does not support

**Why:** The interface a gateway exposes is the lowest common denominator across providers, and the features that differ most between providers — caching controls, reasoning settings, structured-output modes — are precisely the ones that get flattened. You also take on harder debugging through an extra hop, an extra latency hop, and version lag behind new provider features. The point is not that abstraction layers are bad; it is that they trade lock-in for a ceiling.

### Q7. You have instrumented a month of real usage and computed that local becomes cheaper above a certain volume. Why should you treat that as a range rather than a number? <!-- id: cost-06-local-vs-api-q07 energy: high -->

- [ ] Because the electricity rate changes every month
- [ ] Because hardware prices fall, which only moves the crossover down
- [ ] Because the calculation is approximate and the exact value does not matter
- [x] Because quality, latency, your hours and usage volatility each move the crossover, and one of them can make the local option unusable at any volume

**Why:** The arithmetic gives you a midpoint, not a verdict. If the local model is not good enough for the task, the crossover is irrelevant because the option is unavailable; if your latency requirement needs sub-second responses, the local option may be disqualified regardless of cost; if your usage is bursty you have paid a fixed cost for a capability you used a fraction of the time; and if you price your own maintenance hours honestly, the fixed side rises. The volatility of the electricity rate is real but secondary.

### Q8. What is the strongest reason a learner on a small budget should keep evaluation runs on a local or free model? <!-- id: cost-06-local-vs-api-q08 energy: normal -->

- [x] Because evaluation is high-volume and low-stakes, and keeping it off a paid meter is what makes iterating affordable at all
- [ ] Because local models produce better outputs on evaluation tasks
- [ ] Because evaluation requires a model with a larger context window
- [ ] Because evaluation must be run offline for reproducibility

**Why:** Running a test set two hundred times while you iterate on a prompt is exactly the workload a small local model handles acceptably and exactly the workload that would generate a real bill against a frontier model. The point is not that local models are better at evaluation — they usually are not — but that the cost structure of the loop you repeat most should be the one with a near-zero marginal cost. Reproducibility and context size are separate concerns.

### Q9. A provider appears on every list of the best models. You cannot fund an account from the Philippines. What is the correct conclusion? <!-- id: cost-06-local-vs-api-q09 energy: low -->

- [ ] Use it anyway through a VPN, since access is a technical detail
- [ ] Use it until you are asked to stop, since enforcement is rare
- [x] It is not a candidate — coverage and payment method gate everything else, and a provider you cannot legitimately fund is not an option
- [ ] It is a candidate if the free tier does not require payment

**Why:** The order of evaluation is itself the lesson: coverage and legality, then payment, then everything you were tempted to look at first. A provider you cannot legitimately use or fund is a rumour, and building on it means the dependency is not real. The free-tier carve-out is worth checking — some free tiers genuinely require no payment — but that is a specific question about a specific provider's current terms, not a general escape from the gate.

### Q10. You have built a hybrid where bulk classification runs locally and hard reasoning goes to a paid model. What is the strongest argument that this split, rather than a single choice, is correct? <!-- id: cost-06-local-vs-api-q10 energy: high -->

- [ ] It avoids committing to any single vendor, which is the main benefit
- [ ] It uses the local hardware you already paid for, so the fixed cost is not wasted
- [ ] It is the only way to satisfy a data-retention requirement
- [x] Cost structures differ by workload, and the low-difficulty high-volume bulk is where local's near-zero marginal cost applies while the few quality-critical calls are where the API's capability is worth its price

**Why:** The split is not a compromise between two positions; it follows from the fact that different parts of your workload have different shapes. Volume on an easy task is where a per-token meter punishes you, and a handful of hard calls is where a weaker local model would fail in a way that matters. Vendor flexibility and using sunk hardware are pleasant side effects, not the argument. Data retention is a separate axis that sometimes pushes the same way.

## You're ready to move on when...

You have real numbers instead of opinions. You have logged a month or more of your own usage and priced it at rates you looked up yourself, on a date you can name. You have a crossover table with your own electricity rate, your own hours counted honestly, and hardware amortised over a period you can justify — and you can state the breakeven volume as a range and say what moves it.

You have run your own task through a small local model and a hosted one and you can point at the specific failures, not gesture at a general sense that local is worse. You know what a download costs on your connection and whether that changes your plan. You have three providers evaluated against the nine-point checklist with the unknowns written down, and you know your funding path to at least one of them or you know you do not have one. You have a hybrid assignment in writing, with the condition that flips each one.

And you have a thin interface you wrote, with two providers behind it and a demonstration that switching is a one-value change. If you cannot yet say where that interface stops working and when a real gateway earns its place, you have not finished the phase.

## Free vs Paid

### What's free is enough

Everything structural in this phase is free, and the free path is not a lesser version of it.

Ollama, llama.cpp and the open-weight models on Hugging Face cost nothing to download and nothing to run, and the memory and throughput numbers they produce are the real inputs to your crossover table. Open-source `psutil` measures your own machine. LibreOffice Calc or Google Sheets builds the model. Every pricing page, rate-limit page and data-usage policy you need to read is public. Every paper cited here is on arXiv. Your usage log is a file you write.

The one term you genuinely cannot get for free is a realistic electricity figure — but you already have it, on your own bill, and that is a better source than anything a curriculum could give you. The second is latency from your location, and that is a measurement, not a purchase: a free-tier key and a stopwatch produce it.

The free path also happens to be the *better* path for two lessons. Running two local models of different sizes and watching the small one fail on a hard task teaches the quality gap in a way that reading about it does not. And keeping your evaluation harness on a local model costs nothing while you iterate, which means you can afford to iterate more, which makes the harness better.

### What a paid tier adds

Money buys four things here, and it is worth being precise about which you need.

**Access to the models where the quality gap is largest.** This is the real one. The crossover analysis assumes both options can do the task; a paid frontier model is what makes the API side of that comparison valid for hard reasoning and real coding. **Volatile, dated: as of early 2026, which models are frontier and what they cost changes on the order of months — check current pricing and model lists rather than any summary, including this one.**

**Higher rate limits.** Free tiers are capped low enough that some batch workloads simply cannot run. If your job needs more calls per day than your tier allows, the tier is the blocker and money removes it.

**Feature access that changes the arithmetic.** Prompt caching, batch pricing and schema-constrained structured outputs are frequently paid-tier features or paid-tier-discounted. Since these move your bill more than the headline rate, paying for access to them can make the paid option cheaper than the free one for a specific workload — which is worth computing rather than assuming.

**Data terms you can live with.** Paid tiers often carry narrower rights over your inputs than free tiers. If you are handling anything sensitive, that difference can be the whole reason to pay, independent of capability.

### When it's worth paying

**Not this week.** Finish the phase free. Every task runs on a local model and public pages, and the deliverable is arithmetic and writing, not inference volume.

The honest threshold is when your free access actually ends and you find yourself with a workload that a free tier cannot carry. At that point, put a small amount on one provider — enough for a month at your measured usage, not more — set a spending limit if the provider offers one, and keep logging usage from the first paid call, because from that moment your log is the instrument you steer with.

Two conditions should make you pay sooner, and both are about quality rather than volume. **If the task is hard and the answer matters** — real code, multi-step reasoning, anything a human will act on — the frontier model is what makes the API side of your comparison legitimate, and running it locally on a weaker model is not a saving, it is a worse answer. **If the data is other people's personal information**, the question is not the price but the terms: pay for a provider whose retention and training terms you have actually read and can live with under RA 10173, or keep that workload local and accept the quality cost. Between those two, choose deliberately. Do not drift into one because it was easier.
