---
id: cost-05-monitoring-and-caps
track: cost
phase: 5
order: 50
title: Monitoring, Budgets, and Spend Caps
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/cost/05-monitoring-and-caps.md
exit_criteria: >
  You have set a hard spend cap at the provider and a hard token budget in your
  own code that aborts rather than warns, you log model, input tokens, output
  tokens, cached tokens, latency, computed cost and a request ID on every call,
  you can name the five hidden multipliers that make an estimate wrong, you
  compute cost per successful task rather than cost per call, your retries use
  jittered exponential backoff and respect Retry-After, and you have a written
  transition plan that states your real monthly cost and what you will cut,
  shrink, or move local when free access ends.
---

# Phase 5 — Monitoring, Budgets, and Spend Caps

## Goal of this phase

You have free API access through a beta, and it is going to end. Not "might" — will. Free tiers expire, quotas shrink, a provider gets acquired, a model you rely on is retired, a rate limit quietly tightens from one thousand requests a day to two hundred. The moment it happens you have one of two experiences: you already know what your workload costs and you make a calm decision about what to keep, or you discover the number on an invoice and make a panicked decision about what to break.

This phase is about being in the first group. The skills are not glamorous — logging, capping, alerting, retrying properly — but they are the difference between a hobby that survives the end of free access and one that dies with it.

The mechanism that ties it together: **a cost problem is always a measurement problem first.** You cannot cut what you cannot see, and you cannot see anything if your only instrumentation is a provider dashboard updated once a day showing an aggregate number. Almost every "the AI bill exploded" story is really "we did not have per-request accounting, so we found out late and could not tell which code path did it." Spend caps are the seatbelt; instrumentation is the steering.

By the end of this phase you will have a hard cap set at the provider, a hard budget enforced in your own code, a structured log of every call, a cost-per-successful-task number for at least one real workflow, an alert that fires on anomalies, and a written transition plan that states what you will cut, shrink, or move to local hardware when the free access ends.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Day 1: set the provider cap and read your current usage. This is non-negotiable and takes twenty minutes. Day 2: build the logging wrapper. Day 3: build the in-code budget that aborts. Day 4: anomaly alerting and retry discipline. Day 5: the transition plan and the write-up.

Budget an extra session if you have never used a spreadsheet or a SQL query. The analysis is not hard, but the habit of looking at the numbers weekly is what makes the whole phase work.

## Skills you'll gain

- Set a hard spend cap at the provider before you write another line of code
- Enforce a token and cost budget inside your own program, so an agent loop aborts instead of running all night
- Log every call with the seven fields that make a bill explainable: model, input tokens, output tokens, cached tokens, latency, computed cost, request ID
- Explain why an aggregate dashboard cannot locate an expensive code path and a per-request log can
- Alert on spend anomalies and correctly suspect a loop or a retry storm before you suspect growth
- Name the five multipliers that make a naive estimate wrong: reasoning tokens, retries, tool round-trips, evaluation runs, background jobs
- Compute cost per successful task and explain why it disagrees with cost per call
- Implement exponential backoff with jitter, distinguish retryable from non-retryable status codes, and obey `Retry-After`
- Describe the dimensions of rate limiting — requests per minute and per day, tokens per minute and per day, concurrency, tiers — as concepts rather than fixed numbers
- Measure your real usage while access is free and convert it into a transition plan with named cuts

## Specific topics to learn

### Caps

- The provider-side hard cap, and the difference between a notification threshold and a hard stop
- The in-code budget: a running token count that aborts the request before it is sent
- Why a warning log is not a cap
- Per-request, per-session, and per-day budgets, and which one actually stops an agent

### Instrumentation

- The seven fields to log on every call, and what each one lets you answer later
- Cached input tokens and why they are priced differently from fresh input
- Reasons why output tokens are usually priced higher than input tokens
- Request IDs as the join key between your log and the provider's console
- Structured logs versus printed strings

### Anomalies

- Why a spike is usually a loop or a retry storm, not growth
- Setting a baseline and alerting on deviation from it
- Cost per successful task as the metric that survives optimisation
- Detection: what signal fires first when an agent starts repeating itself

### Multipliers

- Reasoning tokens billed as output even when you never see them
- Retries that re-send a large context and pay for the input again
- Tool round-trips that resend the whole transcript on every hop
- Evaluation runs that multiply your production volume by the size of your test set
- Background and scheduled jobs that spend without a human watching

### Retry discipline

- Exponential backoff with jitter, and why immediate retries worsen rate limiting
- Retryable (429, 5xx, timeouts) versus non-retryable (400, 401, 403)
- `Retry-After` headers and provider-stated waits
- Attempt caps and elapsed-time caps

### Rate-limit dimensions

- Requests per minute and per day
- Tokens per minute and per day
- Concurrency limits
- Tier systems and how quota changes as you spend or as a beta ends

### Transition planning

- Measuring real usage while it is free
- Classifying each workload: keep, shrink, batch, cache, or move local
- What a local model must match, and what it may safely do worse

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Provider usage dashboard | See what you have already spent, per model and per day | Free with any account, terms and retention vary — check yours | https://platform.openai.com/docs/guides/rate-limits | Record your last seven days of usage as a baseline | Anthropic, Google, and others publish equivalent consoles on their free tiers |
| Python 3 | Write the logging wrapper and the budget guard | Free | https://www.python.org/downloads/ | Build the cost-tracking wrapper you use for the rest of the track | Any language; the arithmetic is identical |
| SQLite | Store one row per call and query it later | Free | https://www.sqlite.org/index.html | Store your call log and answer "which caller cost the most last week" | A CSV file plus a spreadsheet |
| `tiktoken` | Estimate tokens before you send, for the budget check | Free | https://github.com/openai/tiktoken | Compare your estimate against the provider's reported count | Provider token-count endpoint; see the OpenAI docs for `POST /v1/responses/input_tokens` |
| Grafana | Dashboards and threshold alerts on your own metrics | Free self-hosted, paid cloud tiers exist | https://grafana.com/oss/ | Graph daily spend and set one alert rule on a spike | A cron job that emails you when a number crosses a line |
| Prometheus | Time-series storage and alert rules | Free | https://prometheus.io/ | Scrape your own counters and fire an alert on a daily budget breach | A JSON file read by a scheduled script |
| LiteLLM | A proxy that logs spend across providers and can enforce budgets | Free, open-source core; paid enterprise tier exists | https://github.com/BerriAI/litellm | Put your calls behind a proxy and let it attribute cost per key | Your own logging wrapper, which is what this phase builds |
| Langfuse | Trace-level observability for multi-step LLM apps | Free self-hosted, paid cloud tiers exist | https://github.com/langfuse/langfuse | Trace one agent run end to end and total the cost per step | Structured logs with a shared run ID |
| Ollama | A local fallback you can price at zero marginal cost | Free | https://ollama.com/ | Run one of your real tasks locally and compare quality and latency | Any local inference server with an OpenAI-compatible endpoint |
| Node.js | The JavaScript equivalent of the logging wrapper | Free | https://nodejs.org/ | Port the wrapper so the pattern is not tied to one language | Deno, Bun, or the browser's fetch |

## Free/cheap resources

- **OpenAI — Rate limits guide** — https://platform.openai.com/docs/guides/rate-limits
- **OpenAI — API usage and cost endpoints** — https://platform.openai.com/docs/api-reference/usage
- **Anthropic — Rate limits** — https://docs.claude.com/en/api/rate-limits
- **Anthropic — Usage and cost API** — https://docs.claude.com/en/api/usage-cost-api
- **Google — Gemini API rate limits** — https://ai.google.dev/gemini-api/docs/rate-limits
- **Google Cloud — Budgets and alerting** — https://cloud.google.com/billing/docs/how-to/budgets
- **MDN — HTTP 429 Too Many Requests** — https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429
- **MDN — Retry-After header** — https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After
- **AWS — Exponential backoff and jitter** — https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
- **Python — `logging` module, structured output** — https://docs.python.org/3/library/logging.html
- **SQLite — Query language** — https://www.sqlite.org/lang.html
- **Prometheus — Alerting rules** — https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/
- **LiteLLM — Budgets and rate limits** — https://docs.litellm.ai/docs/proxy/users
- **OWASP — Logging cheat sheet** — https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html

## Lesson: The Bill Is a Measurement Problem

### Part 1 — The problem: your invoice arrives after the spending

Every other resource you buy behaves like a shop: you see the price, decide, and the transaction closes before consumption.

Token APIs do not. **They are a taxi meter with no driver and no door handle.** You get in, the meter starts, and the only feedback loop is one you build. The provider measures accurately but reports on its own schedule, in aggregate, usually after the fact — and free beta access is stranger still, because the meter runs and nobody charges you, so you get no signal about how fast it moves.

Three failure modes, and beginners conflate them.

**You spend more than you meant to.** A loop runs all night. A retry storm hammers a rate limit two hundred times, each attempt paying for a large input. A background job you forgot has run hourly since March.

**You cannot tell which code path spent it.** A dashboard shows a daily total, not that 71% came from one function that retries three times on a large context. Without per-request records, the dashboard is a smoke alarm with no address attached.

**You cannot make a transition decision.** Deciding what to keep, shrink, batch or move local requires knowing what your workload costs. Never having measured, your only options are guessing and cancelling.

> A spend cap is a seatbelt. It does not prevent the crash and it does not tell you why you crashed. It limits the damage when you do.
>
> Where the analogy breaks: a seatbelt is automatic. A cap is not — someone must configure it, and providers differ on whether their cap blocks requests, blocks new keys, or merely emails you. Verify which one yours does before relying on it.

Two things follow. **The provider-side cap is necessary and insufficient.** It is the only control the provider cannot route around, but it is coarse, slow, and catastrophic when it fires: your whole application stops, not just the runaway. Set it on day one anyway, then build fine-grained control yourself.
**The shape of your transition depends on data you can only collect while access is free.** **This is the cheapest week in the history of your project to learn what it costs.**

**Where this framing stops working.** The taxi-meter analogy breaks for batch and asynchronous APIs, where you can often estimate the whole job before submitting it, and for providers that bill a flat subscription.

---

### Part 2 — The mechanism: two caps, seven fields, one metric

Here is the whole operational discipline, stated up front, then unpacked. **Two caps, seven fields, one metric.**

**Two caps.** A hard cap at the provider, set today. And a hard budget in your own code that counts tokens as they are consumed and aborts past a threshold. The first is the account-level backstop; the second is what actually saves you, because it fires early, on the right request, in the right process.

**Seven fields** on every call — model, input tokens, output tokens, cached tokens, latency, computed cost, request ID — and **one metric**: cost per successful task, not cost per call. Cost per call is a supplier's metric; cost per successful task is yours, and it survives a change of model, prompt or workflow. Parts 3 and 5 explain both.

**At the provider.** Every major provider offers some form of spending limit or budget alert, and they are not the same thing.

| What you configure | What it does | What it does not do |
|---|---|---|
| Notification threshold | Emails you when spend crosses a number | Does not stop anything |
| Hard spend limit | Blocks further requests at the limit | Does not stop in-flight requests; propagation may lag |
| Prepaid credit | Requests fail when the balance hits zero | Requires manual top-up; not offered to all accounts |
| Per-key quota | Limits one API key's usage | Only helps if you issued separate keys per project |

**Read the docs for your provider and find out which of these exist for your account type.** Providers differ substantially on whether a limit blocks or merely warns, whether it applies to free-tier accounts at all, and how quickly changes take effect. Set the lowest number that will not break legitimate use — a hard cap should be uncomfortably low — and issue separate keys per project.

**In your own code.** The provider cap is account-wide and slow. The code budget is per-process and immediate. It has three layers and you want all three:

```python
class BudgetExceeded(Exception):
    """Raised before a request is sent, so the request is never billed."""

class Budget:
    """Hard limits in tokens and in estimated currency. It ABORTS; it does not warn."""

    def __init__(self, max_tokens: int, max_cost_usd: float):
        self.max_tokens = max_tokens
        self.max_cost_usd = max_cost_usd
        self.tokens_used = 0
        self.cost_used = 0.0

    def check(self, estimated_tokens: int, estimated_cost: float) -> None:
        # Refuse BEFORE sending. A check after the call is an autopsy, not a cap.
        if self.tokens_used + estimated_tokens > self.max_tokens:
            raise BudgetExceeded(
                f"token budget: {self.tokens_used} used of {self.max_tokens}"
            )
        if self.cost_used + estimated_cost > self.max_cost_usd:
            raise BudgetExceeded(
                f"cost budget: {self.cost_used:.4f} used of {self.max_cost_usd:.4f}"
            )

    def record(self, tokens: int, cost: float) -> None:
        # Record what the provider ACTUALLY reported, not what you estimated.
        self.tokens_used += tokens
        self.cost_used += cost
```

Three things about that class are deliberate, each corresponding to a mistake people make.

**It raises, it does not print.** A budget that logs `WARNING: over budget` and continues is a comment, not a budget — a log line nobody reads at 3 a.m. has the same effect as no budget.

**It checks before the call, not after.** Checking after means you have already paid. The pre-check needs an input estimate, which is why a tokeniser or token-count endpoint appears in the tools table. That estimate need not be perfect; it must be conservative.

**It records actuals, not estimates.** The pre-check uses an estimate because it must; the accumulator uses the provider's reported numbers because it can.

Compose them: per-request, per-session and per-day budgets catch different bugs — a per-request cap catches one enormous context, a per-session cap a runaway loop, and a per-day cap an accumulation you did not notice, like a scheduled evaluation.

**Where caps stop working.** A cap in your own process does nothing about a process you did not write, a teammate's script sharing your key, or a provider-side price change. And **a cap set too tight turns a transient spike into an outage**: if legitimate peak traffic runs 20% below your cap, a burst trips it and users see errors.
---

### Part 3 — The seven fields, and the questions they answer

The report contains seven fields, and each exists because there is a question you will ask and cannot answer without it.

| Field | The question it answers later |
|---|---|
| Model | Which model actually served this request, and did it change under me? |
| Input tokens | How much context did I send, and is that growing? |
| Output tokens | How much did I generate, and did a verbosity change cost me money? |
| Cached tokens | How much input came at the cheaper cached rate, and is my caching working? |
| Latency | Is this path slow, and is slow correlated with expensive? |
| Computed cost | What did this specific call cost, given the model and the token split? |
| Request ID | What did the provider see, and can I find this exact call in their console? |

**Four of those arrive in the response or from a clock; cost you compute.** The request ID is the join key between your log and the provider's records — without it, when support asks which request you mean, you have nothing.
**Cached tokens deserve their own column.** Providers price a cache read well below fresh input, for a mechanical reason: if a prefix of the input is byte-identical to a recent request, the server has already computed the attention state for those tokens and can skip the prefill work (the model-internals track covers prefill). A cache hit and a cache miss are different products at different prices, so without a separate count you cannot tell whether caching works — your input total looks identical either way. And because **cache hits depend on a stable prefix**, prompt order is a cost decision, not only a quality one.

**Why output usually costs more than input.** Generating runs a forward pass per token through the whole stack, sequentially, while prefill processes input positions in parallel, so output is the scarce resource. Check your provider's current price page rather than trusting a remembered ratio.

**Do not hardcode prices.** A price in source is a bug with a delay fuse. Keep per-model rates in a dated config file and note where you got them. The logging schema therefore has one row per logical task, with a stable ID and an attempt count:

```python
import json
import random
import sqlite3
import time
import uuid
from datetime import datetime, timezone

# Rates live in config with a date stamp, never hardcoded in logic.
# Shape only. Populate from your provider's CURRENT price page.
# {"some-model": {"input": 0.0, "cached_input": 0.0, "output": 0.0, "as_of": "2026-01-01"}}
PRICES = json.load(open("model_rates.json", encoding="utf-8"))

def compute_cost(model, in_tok, cached_tok, out_tok):
    """USD, assuming rates are expressed per 1,000,000 tokens."""
    r = PRICES[model]
    fresh = max(in_tok - cached_tok, 0)   # cached tokens are a SUBSET of input
    return (fresh * r["input"] + cached_tok * r["cached_input"]
            + out_tok * r["output"]) / 1_000_000

SCHEMA = """
CREATE TABLE IF NOT EXISTS calls (
  request_id TEXT, run_id TEXT, caller TEXT, model TEXT,
  input_tokens INTEGER, cached_tokens INTEGER, output_tokens INTEGER,
  latency_ms REAL, cost_usd REAL, status TEXT, finish_reason TEXT,
  attempts INTEGER, ts TEXT
)"""

def log_call(**row):
    """ONE ROW PER LOGICAL TASK, not per HTTP attempt. Written on success AND failure."""
    with sqlite3.connect("llm_calls.db") as con:
        con.execute(SCHEMA)
        con.execute("INSERT INTO calls VALUES "
                    "(:request_id,:run_id,:caller,:model,:input_tokens,"
                    ":cached_tokens,:output_tokens,:latency_ms,:cost_usd,"
                    ":status,:finish_reason,:attempts,:ts)",
                    {**row, "ts": datetime.now(timezone.utc).isoformat()})
```

Here is the wrapper that makes logging impossible to forget — **instrumentation you must remember to call is instrumentation you stop calling in week three.**

```python
def tracked_call(client, *, run_id, caller, model, messages,
                 max_output_tokens, budget, max_attempts=4):
    """Wrap ONE logical task. Retries live inside; one log row comes out."""
    est = estimate_input_tokens(model, messages)          # your tokeniser
    budget.check(est, estimate_cost(model, est, max_output_tokens))

    local_id = str(uuid.uuid4())      # stable across retries of THIS task
    start = time.perf_counter()
    last_error = None

    for attempt in range(1, max_attempts + 1):
        try:
            response = client.chat(messages=messages, model=model,
                                   max_tokens=max_output_tokens)
            u = response["usage"]
            cost = compute_cost(model, u.get("input_tokens", 0),
                                u.get("cached_tokens", 0),
                                u.get("output_tokens", 0))
            budget.record(u["total_tokens"], cost)
            log_call(request_id=response.get("id", local_id), run_id=run_id,
                     caller=caller, model=model,
                     input_tokens=u.get("input_tokens", 0),
                     cached_tokens=u.get("cached_tokens", 0),
                     output_tokens=u.get("output_tokens", 0),
                     latency_ms=(time.perf_counter() - start) * 1000,
                     cost_usd=cost, status="ok", attempts=attempt)
            return response

        except RetryableError as exc:
            last_error = exc
            budget.record(exc.estimated_tokens, exc.estimated_cost)  # retries cost too
            if attempt == max_attempts:
                break
            # Obey Retry-After when given; otherwise full jitter, capped.
            delay = (exc.retry_after if exc.retry_after is not None
                     else random.uniform(0, min(30.0, 2 ** attempt)))
            time.sleep(delay)

        except NonRetryableError:
            raise        # 400 and 401 fail identically forever. Do not spend on them.

    log_call(request_id=local_id, run_id=run_id, caller=caller, model=model,
             input_tokens=0, cached_tokens=0, output_tokens=0, latency_ms=0.0,
             cost_usd=0.0, status="failed", attempts=max_attempts)
    raise last_error
```

Two design decisions in that wrapper deserve naming, because each is a mistake you would otherwise make.

**A stable `local_id` across retries, plus the provider's ID in the same row.** Log a new UUID per attempt and you will believe you made four requests when you made one task. The `attempts` column is what makes retry storms visible.

**Failed attempts are recorded against the budget.** A retried request usually still bills for the input — the server did the prefill before it failed. Count only successful calls and a retry storm can double real spend while the budget reports half of it.

Non-retryable errors are re-raised immediately, and the row is written whether the call succeeds or fails, because a log of successes only hides the expensive path.

**The JavaScript equivalent** is the same shape with different names. Build a `trackedCall` async function, time the call with `performance.now()`, and write rows to SQLite through `node:sqlite` (built into modern Node) or to append-only JSONL with `fs.appendFile`. Use `crypto.randomUUID()` for the local ID and log the provider's `response.id` beside it. Same seven fields, same one row per logical task, same abort-not-warn budget.

**Where this logging stops working.** Seven fields cannot tell you *why* a call was expensive — they record the cost of a step, not the reasoning that produced it. They are also noisy at very low volume and say nothing about quality: a cheap call that produced a wrong answer logs as a success until you add a success definition.
---

### Part 4 — Anomalies: a spike is almost never growth

Once you have per-day and per-caller numbers, the natural next instinct is wrong. Someone sees triple the normal spend and concludes "we got more users." Almost always that is not what happened. **A spend spike is a behaviour change in your code, not a change in the world.** Organic growth is smooth, while an engineering fault moves a number by multiples overnight: if daily cost goes from one dollar to nine, something is doing nine times more work per unit of value.

The three causes, most frequent first:

**An agent loop that is not terminating.** The agent calls a tool, the tool returns something unhelpful, the model tries again with a slightly different argument, and the loop repeats until a step cap stops it. Each iteration resends the entire transcript, so cost per iteration grows as the loop runs. The signature is **superlinear**: not nine times the calls at the same size, but nine times the calls each bigger than the last.

**A retry storm.** A rate limit or transient 5xx triggers retries. If they are immediate and unjittered, every client retries at once, the limit fires again, and the cycle compounds — each retry paying for the input again. The signature is **many failed attempts against few successful tasks**, visible only because you log `attempts`.

**A background job or evaluation run that is not bounded.** An evaluation against the full test set, a scheduled job whose source data grew, a cron meant to run weekly running hourly. The signature is a **flat, elevated plateau** that starts at a boundary and stays.

Three signatures, three different graphs — which is why a daily series beats a monthly total.

**How to alert.** Do not alert on absolute spend; alert on deviation from a baseline you trust:
| Signal | Threshold | Likely cause |
|---|---|---|
| Daily spend vs trailing 7-day median | Above 3× | Loop, storm, or a new job |
| Failed attempts as a share of total attempts | Above 20% | Retry storm, or a broken caller |
| Mean input tokens per task | Above 1.5× baseline | Context accumulation succeeding silently |
| Cost per successful task | Above 2× baseline | Quality regression, or a rerouting that is not helping |
| Calls in a single run | Above your step cap | An agent that is not terminating |

Each is a few lines of SQL over the `calls` table — which is the point of storing rows instead of printing lines: you can ask questions later that you did not anticipate.

```sql
WITH daily AS (
  SELECT substr(ts, 1, 10) AS day, SUM(cost_usd) AS spend, COUNT(*) AS tasks
  FROM calls WHERE status = 'ok' GROUP BY day
)
SELECT day, spend, spend / NULLIF(tasks, 0) AS cost_per_task
FROM daily ORDER BY day DESC LIMIT 14;
```

**Where alerting stops working.** An alert only fires on data you have, so a process that crashes before writing its row leaves your detector blind exactly when things are worst — write the row on failure too. A threshold also cannot see slow drift: if average context grows 3% a week, nothing fires until you are 50% over baseline with no memory of why, so read the trend weekly rather than only reacting to alarms. And an alert is not a fix; the step cap, budget exception and retry discipline stop the spending.---

### Part 5 — The hidden multipliers, and the metric that survives them

Naive cost estimation is `calls per day × average tokens × price`. That formula is wrong by a factor usually between two and ten, in the direction that hurts. Here are the five multipliers it ignores.
**One: reasoning tokens.** Reasoning models generate internal tokens before the visible answer, billed as output while often invisible in the text you receive. So you measure answer lengths, estimate the input, and the bill comes back several times your prediction. **Always read output tokens from `usage`, never from the length of the text you got back.** If your provider reports reasoning tokens separately, give them their own column — they are the first thing to cut.
**Two: retries that resend a large context.** A retry does not repeat a cheap operation; it resends the whole input, which is the expensive part of a long-context call. A 10% retry rate on large-context calls adds roughly 10% to the input bill, and a retry *storm* briefly near 100% can multiply a day's cost outright.
**Three: tool round-trips.** In an agent every tool call is another model invocation, and the transcript grows each hop: turn two resends the system prompt, the question and turn one's tool result; turn three resends all of that. **Cost is therefore roughly quadratic in the number of steps**, because you pay for the accumulated context on every hop. This is the largest multiplier in agent workloads, and it is why agent cost per task dwarfs the price per token.

**Four: evaluation runs.** Every prompt change wants a test set. A 200-example evaluation at three samples is 600 calls; against an 8-step agent it is 4,800. Track it under its own `caller` so it never contaminates production numbers.

**Five: background and scheduled jobs.** Enrichment, nightly summarisation, embedding backfills, cache warming. Each is small; together they form a floor of spend that runs whether or not anyone uses the product, and because nobody is watching, a fault can persist for weeks.

**Cost per call is a supplier's metric. Cost per successful task is yours.** Take a call costing $0.004 that succeeds 60% of the time at the quality you need. A stronger model at $0.010 per call succeeding 95% of the time is two and a half times the price per call and cheaper per successful task, because you are not paying for the failures.

| | Cheap model | Strong model |
|---|---|---|
| Cost per call | $0.004 | $0.010 |
| Attempts per successful task | 2.4 | 1.05 |
| Cost per successful task | ~$0.0096 | ~$0.0105 |

Change the cheap model's success rate by a few points and the ordering flips. **You cannot know which is cheaper without measuring success, and measuring success requires instrumenting tasks, not calls.**

So your schema needs a notion of a **task** that can succeed or fail independently of any HTTP call: a `run_id` shared by every call in one logical unit of work. Without it you can compute cost per call and nothing else.

```sql
-- Cost per successful task, by caller, last 7 days.
WITH tasks AS (
  SELECT run_id, caller, SUM(cost_usd) AS task_cost,
         SUM(attempts) AS attempts, MAX(status) AS status
  FROM calls WHERE ts >= datetime('now', '-7 days')
  GROUP BY run_id, caller
)
SELECT caller, COUNT(*) AS tasks, AVG(task_cost) AS avg_cost_per_task,
       AVG(attempts) AS avg_attempts,
       SUM(status = 'ok') AS ok_tasks
FROM tasks GROUP BY caller;
```

You need a "success" definition of your own — a non-empty answer, a parse that validated, a usable tool result, a human thumbs-up. Define it explicitly and record it. **An undefined success metric is why most cost-optimisation projects cannot prove they helped.**

**Where this metric stops working.** Cost per successful task is meaningless when success is appropriately rare — a research agent that answers one question in twenty correctly but saves hours when it does is not well described by an average. It is also weak where a failed call is a cheap apology and a successful one is a sale; there the right denominator is business value. And it misleads if success is defined too loosely: count abandoned answers as successes and you optimise toward cheap-but-unused.
---

### Part 6 — Retry discipline, and the dimensions of rate limiting

Retries are where cost control and reliability collide, and the failure always has the same shape: a system already struggling gets hammered by its own clients, turning a blip into an outage and a small bill into a large one.

**The mechanism.** A rate limit protects shared capacity, so hitting one means *the system is at capacity right now.* A client that retries immediately is not waiting for capacity — it is adding load to something that just said it is full. Because many clients react to the same event at the same instant, retries arrive in synchronized waves, each re-triggering the limit. **Immediate retries do not merely fail to help; they prolong the condition.**

**The fix is jittered exponential backoff**, and both halves are load-bearing. Exponential because if the problem is capacity it will take time to clear, so short waits waste attempts. Jitter because synchronization is the actual problem: if a thousand clients wait exactly two seconds they all retry at once and recreate the spike.

```python
import random
import time

def backoff_delay(attempt: int, retry_after: float | None = None) -> float:
    """Seconds to wait before attempt number `attempt` (1-based)."""
    if retry_after is not None:
        # The provider told you. Obey it. Add a small cushion, not a random guess,
        # because the provider's number is authoritative and usually a minimum.
        return retry_after + random.uniform(0.0, 0.5)
    # Full jitter: random point in [0, cap]. Spreads clients out completely.
    cap = min(60.0, 1.0 * (2 ** attempt))
    return random.uniform(0.0, cap)
```

Full jitter — a uniform random point between zero and the cap — beats "base delay plus a random fraction" because it maximises the spread between clients. What matters is that your delay is not a constant.

**Retryable versus non-retryable: the distinction is about causality.**

| Status | Retryable? | Why |
|---|---|---|
| 429 Too Many Requests | Yes — after the stated wait | Capacity, not correctness |
| 500, 502, 503, 504 | Yes, with backoff and a cap | Their side, transient by nature |
| Timeout / connection error | Yes, but it may have been billed | Unknown whether the server processed it |
| 400 Bad Request | No | Your request is malformed. It will be again |
| 401 Unauthorized | No | Key wrong or revoked. Retrying can lock the account |
| 403, 404, 413, 422 | No | Nothing changes while you retry; an oversized context fails identically |

The test is not "did it fail" but **"could the same request plausibly succeed later without anything changing on my side?"** If yes, retry. If no, fail fast — retrying a 400 five times costs five times the input and delays the bug report.

**Obey `Retry-After`.** Providers return this header, in seconds or as an HTTP date, on a 429 or a 503. **It is not a suggestion.** It states the earliest moment your request has a chance, and ignoring it is what gets accounts throttled harder or suspended. Use it, add a small cushion, and never shorten it.

**Bound everything.** A retry loop with no attempt cap is an infinite loop with a bill. Cap attempts, cap total elapsed time, and cap the cumulative cost of the retries.

Now rate limits as concepts. Do not memorise numbers; they change. Learn the dimensions, because the *fix* depends on which one you hit, and all of them produce the same 429.

| Dimension | What it counts | What fixes it |
|---|---|---|
| Requests per minute (RPM) | Call count in a minute | Pace your calls; batch; add queuing |
| Requests per day (RPD) | Call count in a day | Fewer calls; cache results; smaller model for easy ones |
| Tokens per minute (TPM) | Input plus output tokens in a minute | Send less context; shorten outputs; spread load over time |
| Tokens per day (TPD) | The same over a day | Reduce total tokens; the one a large-context workload hits |
| Concurrency | Simultaneous in-flight requests | Reduce parallelism; use a fixed-size worker pool |
| Tier systems | Your account's quota class | Spending, account age, or verification usually raises it |

Two consequences people miss. **A high request rate with tiny requests hits RPM; a low request rate with huge requests hits TPM** — the same application can trip either depending on prompt size, so your first diagnostic question is which dimension you tripped. And **concurrency is separate from rate**: a fixed-size worker pool is the standard control.

**Tiers change, and a free beta is the most fragile tier there is.** Free and low tiers commonly sit an order of magnitude below paid ones, and the transition is often abrupt: a beta ends, a quota is revised, a model moves behind a higher tier. **Know which tier you are on and what the next tier down would do to your application.**

---

### Part 7 — The transition plan: measuring while it is free

Everything above is operational hygiene. This part is why the phase exists in this form, at this moment in your learning.

You have free access. It will end. When it does you will face a decision you can only make well with data you can only collect now. It has five possible answers per workload, and they are not interchangeable:| Option | When it is right | What it costs you |
|---|---|---|
| Keep as is | High value, low volume | The full price, which you now know |
| Shrink | Quality holds at a smaller model or shorter context | Time spent verifying quality did not drop |
| Batch or cache | Not latency-sensitive, or has a shared prefix | Engineering time; delayed results |
| Move local | High volume, narrow task, data may not leave | Hardware, setup, lower capability on hard cases |
| Cut | Value is below cost | A feature, and possibly a user's expectations |

**That last row is the one people refuse to consider, and it is often correct.** A feature costing more per month than it returns is not a technical problem; deleting it is the fix, and knowing its true cost makes the decision obvious rather than painful.

**The measurement to do this week.** For each distinct workload — each `caller` in your log — record four numbers over at least a few days of real use:

- **Cost per successful task**, from actual token counts and current prices.
- **Projected monthly cost** at observed volume, times a safety factor of at least 1.5, because volume grows and estimates miss multipliers.
- **Quality sensitivity**: how far does quality drop on the cheapest model that plausibly works? Thirty examples, not three hundred — you are looking for a cliff, not a decimal.
- **Latency sensitivity**: does anyone notice three extra seconds? If not, batching is on the table.

Then write the plan. A usable one looks like this:

```text
WORKLOAD: nightly digest generation
  caller:            "digest-cron"
  measured:          1 run/day, 61 calls/day,
                     212,400 input tok, 18,900 output tok
  cost/success:      ~$0.019 per article at current rates
  projected monthly: ~$23/month  (x1.5 safety -> budget $35)
  quality cliff:     30 articles tested; smaller model lost 4/30 on
                     factual consistency -> NOT acceptable below current class
  latency need:      none - runs at 02:00
  DECISION:          KEEP, but BATCH as one request per night where the
                     provider discounts it, and cache the shared prefix.
                     Target: -40% on input.
  IF THAT FAILS:     Run extraction locally, keep the hosted model only
                     for the final summary call.
```

Notice what the plan contains that a cost estimate does not: a decision, a target, and a fallback. A number without a decision is trivia.
**Two more things belong in it. Your hard floor:** some workloads are non-negotiable — the thing your project is for. Name them and note what you would pay.

**Your local-readiness answer.** For each workload that could move local, answer one question: does the task need capability, or throughput? A quantised local model on consumer hardware is genuinely usable for classification, extraction, short summarisation and structured reformatting. It is much weaker on open-ended reasoning and long-context synthesis. **The honest framing is not "local replaces hosted" but "local absorbs the easy majority so you only pay for the hard remainder."**

**Where transition planning stops working.** An observed week is a small sample: if your application is seasonal or sparse, your projection will be wrong in a way more data would have fixed, so write down the confidence you actually have. A transition plan is also a dated document, because prices and model quality move faster than your plan — **re-check current pricing, free-tier terms and rate limits before committing to a long-term cut.** And the plan assumes your quality evaluation is honest: a 30-example evaluation written by the person who wrote the prompt, scored by the same model under test, is close to worthless. Write the reference answers yourself, and prefer a different model as judge — the LLM-as-judge literature (arXiv:2306.05685) covers what that scorer can and cannot do.

---

### Part 8 — What this discipline actually buys you

None of this — the caps, the tables, the SQL, the backoff function — makes your AI feature better. A user will never notice any of it, which is exactly why it has to be habitual: no product pressure pushes you toward it, only the absence of a disaster pushes you away.

What you are buying is a specific, unglamorous property: **you can find out what your system costs, and stop it from costing more than you decided.** Every transition option requires knowing the number; without it every option is a guess, and the default outcome is the fifth one — the feature quietly gets turned off.

Phase 1 of this track established that token pricing is a metered utility, not a purchase; Part 1 established that metered utilities have no natural feedback loop. Everything here is the construction of that loop, and once it exists, everything the rest of the track teaches about caching, batching, routing and local inference becomes measurable rather than theoretical. **You are not learning to be frugal. You are learning to see.** And the discipline is portable: the same seven fields, two caps, cost-per-successful-task metric and jittered backoff apply to every provider and every model that will ever exist. Those all move. The shape of the control loop does not.

**Where this discipline stops working.** Instrumentation is overhead: on a throwaway script it costs more attention than it saves. It also does not protect you against a cost that is contractual rather than metered — a seat licence, a minimum commitment, a data-egress bill — because none of those show up as tokens.
---

## Hands-on practice tasks

1. Log into your provider's console and find the spend or budget settings. Set a hard cap at the lowest number that will not break real use, and write down whether it blocks requests or only notifies you. <!-- id: cost-05-monitoring-and-caps-t01 band: quick energy: low -->
2. Record your last seven days of usage from the dashboard — requests, tokens, models. If the console shows nothing useful, write down exactly what it shows and what it omits. <!-- id: cost-05-monitoring-and-caps-t02 band: quick energy: low -->
3. Create a separate API key per project, so a runaway in one can be revoked without killing the rest. Note which providers let you set a per-key quota. <!-- id: cost-05-monitoring-and-caps-t03 band: quick energy: normal -->
4. Build the `Budget` class and prove it aborts: set a threshold of ten calls' worth, run a loop, and confirm it raises rather than printing a warning. <!-- id: cost-05-monitoring-and-caps-t04 band: focused energy: normal -->
5. Create the `calls` table and log twenty real calls with all seven fields. Then query it for total cost and mean input tokens per call. <!-- id: cost-05-monitoring-and-caps-t05 band: focused energy: normal -->
6. Put your per-model rates in a dated config file rather than in code. Add a comment naming the URL you copied them from and the date you checked. <!-- id: cost-05-monitoring-and-caps-t06 band: quick energy: low -->
7. Send the same long prefix twice and compare the cached-token counts. Then reorder the prompt so the stable part comes first, and compare again. <!-- id: cost-05-monitoring-and-caps-t07 band: focused energy: normal -->
8. Deliberately trigger a 429 by firing a burst of requests. Record the status, the `Retry-After` header if present, and any remaining-quota headers. <!-- id: cost-05-monitoring-and-caps-t08 band: focused energy: high -->
9. Implement `backoff_delay` with full jitter, then simulate 1,000 clients hitting a limit and plot their retry times. Explain in one paragraph why the unjittered version recreates the spike. <!-- id: cost-05-monitoring-and-caps-t09 band: deep energy: high -->
10. Deliberately trigger a 400 and a 401 and confirm your client fails fast on both, with no retry and no backoff sleep. <!-- id: cost-05-monitoring-and-caps-t10 band: quick energy: normal -->
11. Build a retry storm on purpose: a caller that retries a failing request immediately in a tight loop. Measure the cost of the storm and the number of failed attempts against zero successes. <!-- id: cost-05-monitoring-and-caps-t11 band: deep energy: high -->
12. Write a step cap into a small agent loop — a maximum number of tool round-trips — and log the cumulative cost at every step. Plot cost against step number and confirm the growth is superlinear. <!-- id: cost-05-monitoring-and-caps-t12 band: deep energy: high -->
13. If your provider exposes reasoning tokens in the usage object, run the same prompt on a reasoning and a non-reasoning model and compare billed output tokens against the length of the visible answer. <!-- id: cost-05-monitoring-and-caps-t13 band: focused energy: normal -->
14. Add a `run_id` shared across every call in one logical task, then write the cost-per-successful-task query and run it on your own data. <!-- id: cost-05-monitoring-and-caps-t14 band: deep energy: normal -->
15. Define success for one of your tasks in writing — a concrete, checkable condition — and record it in the log. Then measure the true cost per success. <!-- id: cost-05-monitoring-and-caps-t15 band: focused energy: high -->
16. Port the logging wrapper to JavaScript. Confirm the two implementations produce identical rows for the same logical call. <!-- id: cost-05-monitoring-and-caps-t16 band: focused energy: normal -->
17. Write one SQL query that detects a daily spend above three times the trailing seven-day median, and schedule it to run once a day with an email or a notification. <!-- id: cost-05-monitoring-and-caps-t17 band: focused energy: normal -->
18. Run an evaluation of about 30 examples against your cheapest plausible model and score each output yourself. Record whether there is a quality cliff, and where. <!-- id: cost-05-monitoring-and-caps-t18 band: deep energy: high -->
19. Take one workload to a local model with Ollama. Record the quality difference on your 30 examples, the latency, and the fact that marginal cost is zero. <!-- id: cost-05-monitoring-and-caps-t19 band: deep energy: high -->
20. Write `portfolio/cost/05-monitoring-and-caps.md` as a full transition plan: one block per workload, with cost per success, projected monthly at 1.5× safety, quality cliff, latency need, decision, and fallback. <!-- id: cost-05-monitoring-and-caps-t20 band: ongoing energy: high -->

## Common Pitfalls

**Setting a budget that warns instead of aborts.** A warning is a log line. The only budget that works is one that stops execution, and it must stop it *before* the request is sent.

**Relying only on the provider cap.** It is account-wide, may lag, and when it fires it takes down your entire application rather than the runaway part. It is the backstop, not the control.

**Logging tokens as a single number.** Without the input/output/cached split you cannot compute cost at all, and you cannot tell whether caching is working. You need the split.

**Logging only successful calls.** Failures are where retries, storms, and lost spend live. A log that contains only successes systematically hides the expensive path.

**Estimating output tokens from the visible text.** Reasoning tokens are billed as output and do not appear in the answer. Read the usage object; never infer from string length.

**Treating cost per call as the optimisation target.** It is the supplier's metric. A cheaper model that fails more often costs more per successful task, and only task-level accounting reveals it.

**Not defining success.** Without a written definition of a successful task, cost per successful task is uncomputable and no optimisation can be proven to have helped.

**Retrying immediately.** Immediate retries add load to a system that just reported being at capacity, and synchronized retries recreate the spike. Always wait, always add jitter.

**Backoff without a cap.** An unlimited retry loop turns a transient outage into an unbounded bill and a hang that never surfaces the real error.

**Retrying non-retryable errors.** Five retries of a 400 buys five identical failures and a much longer wait before anyone sees the bug. Retrying a 401 repeatedly is how accounts get locked.

**Ignoring `Retry-After`.** It is the provider telling you the earliest usable moment. Ignoring it is how an account gets throttled harder.

**Forgetting that a retry re-sends the input.** The retry is not cheap — the input is often the expensive part. Record failed attempts against the budget too.

**Assuming a spike means growth.** Organic growth is smooth; faults are multiplicative. Triple the spend overnight is a loop, a storm, or a job, not an acquisition.

**Alerting on absolute spend only.** Without a baseline and a ratio, you cannot distinguish a spike from a plateau, and the three causes have different fixes.

**Leaving evaluation and background jobs uncounted.** They multiply real volume and they run when nobody is watching. Give them their own `caller` and their own budget.

**Hardcoding prices in source.** Prices change, and a stale constant silently corrupts every cost decision you make from it. Date your rate table and cite its source.

**Setting the cap so low it becomes an outage.** A cap below your legitimate peak turns normal traffic into errors. Caps prevent catastrophe; design controls normal spend.

**Assuming the free tier's limits will hold.** Free betas end, quotas get revised, and tier structure changes without warning. Plan the transition while measurement is still free.

## Deliverable / proof of work

Write `portfolio/cost/05-monitoring-and-caps.md` containing:

- **Evidence of your provider-side cap** — a screenshot or a written record of the setting, the number, and whether it blocks or notifies, with the date.
- **Your logging schema and wrapper code**, in Python, showing all seven fields, the `run_id` and `attempts` columns, and the JavaScript port's equivalent structure.
- **A `calls` table with at least 50 logged rows** from real work, plus the query output for total cost, mean input tokens, and mean attempts.
- **Proof your in-code budget aborts** — the output showing `BudgetExceeded` raised mid-loop, and the code path that raises it before the request is sent.
- **A retry-storm experiment** — the measured cost, attempt count, and success count from a deliberately immediate-retrying caller, next to the same experiment with jittered backoff.
- **An anomaly query and one alert** — the SQL, the threshold you chose, and the mechanism by which it notifies you.
- **A cost-per-successful-task table** for at least two workloads, with your written definition of success for each.
- **A reasoning-token or output-token comparison**, showing billed output tokens against the visible answer length, with a sentence on what that means for estimation.
- **Your transition plan** — one block per workload, each with cost per success, projected monthly at a 1.5× safety factor, the quality cliff you measured, latency need, a decision from keep/shrink/batch/local/cut, and a fallback. Dated with an "as of" line.
- **A "what I will cut first" section**, naming the specific feature or workload whose measured value is below its projected cost.

## Checklist

- [ ] I have set a hard spend cap at the provider and know whether it blocks or only notifies <!-- id: cost-05-monitoring-and-caps-c01 energy: low -->
- [ ] I create a separate API key per project so one runaway does not revoke everything <!-- id: cost-05-monitoring-and-caps-c02 energy: low -->
- [ ] I can explain why the provider cap is necessary but not sufficient <!-- id: cost-05-monitoring-and-caps-c03 energy: normal -->
- [ ] I have a budget object in my own code that raises an exception rather than logging a warning <!-- id: cost-05-monitoring-and-caps-c04 energy: normal -->
- [ ] My budget checks before the request is sent, so an over-budget call is never billed <!-- id: cost-05-monitoring-and-caps-c05 energy: normal -->
- [ ] I log model, input tokens, output tokens, cached tokens, latency, computed cost and request ID on every call <!-- id: cost-05-monitoring-and-caps-c06 energy: normal -->
- [ ] I log failed calls and failed attempts, not only successes <!-- id: cost-05-monitoring-and-caps-c07 energy: normal -->
- [ ] I can explain what cached tokens are and why the stable part of my prompt comes first <!-- id: cost-05-monitoring-and-caps-c08 energy: normal -->
- [ ] I keep per-model rates in a dated config file and can name where I copied them from <!-- id: cost-05-monitoring-and-caps-c09 energy: low -->
- [ ] I have a baseline and a query that detects daily spend above three times the trailing median <!-- id: cost-05-monitoring-and-caps-c10 energy: normal -->
- [ ] I can name all five hidden multipliers and which one dominates my workload <!-- id: cost-05-monitoring-and-caps-c11 energy: normal -->
- [ ] I understand that reasoning tokens are billed as output and are invisible in the answer text <!-- id: cost-05-monitoring-and-caps-c12 energy: normal -->
- [ ] I compute cost per successful task, not cost per call, and I have written down my definition of success <!-- id: cost-05-monitoring-and-caps-c13 energy: high -->
- [ ] I have a `run_id` that groups every call belonging to one logical task <!-- id: cost-05-monitoring-and-caps-c14 energy: normal -->
- [ ] I can explain why an agent's cost grows superlinearly with the number of tool round-trips <!-- id: cost-05-monitoring-and-caps-c15 energy: high -->
- [ ] My retries use exponential backoff with jitter, not a fixed or immediate delay <!-- id: cost-05-monitoring-and-caps-c16 energy: normal -->
- [ ] I sort status codes into retryable and non-retryable and can justify each classification <!-- id: cost-05-monitoring-and-caps-c17 energy: normal -->
- [ ] I read and obey `Retry-After` when the provider sends it <!-- id: cost-05-monitoring-and-caps-c18 energy: low -->
- [ ] Every retry loop I write has an attempt cap and an elapsed-time cap <!-- id: cost-05-monitoring-and-caps-c19 energy: normal -->
- [ ] I can name the rate-limit dimensions — RPM, RPD, TPM, TPD, concurrency, tier — and which fix applies to each <!-- id: cost-05-monitoring-and-caps-c20 energy: normal -->
- [ ] I know which tier I am on and what the tier below it would do to my application <!-- id: cost-05-monitoring-and-caps-c21 energy: normal -->
- [ ] I have measured real usage while access is free, and I have a projected monthly cost per workload <!-- id: cost-05-monitoring-and-caps-c22 energy: high -->
- [ ] I have run a small quality evaluation on a cheaper model and know where the cliff is <!-- id: cost-05-monitoring-and-caps-c23 energy: high -->
- [ ] I have a dated transition plan naming what I keep, shrink, batch, move local, or cut <!-- id: cost-05-monitoring-and-caps-c24 energy: high -->

## Quiz

### Q1. You set a spending limit in your provider's console. What have you actually protected yourself against? <!-- id: cost-05-monitoring-and-caps-q01 energy: normal -->

- [x] Account-wide spend past that number — but not which code path caused it, and with no early warning
- [ ] Any single runaway process in your own application, which will now be stopped before it spends
- [ ] Retry storms, because the limit causes retries to fail fast instead of repeating
- [ ] Nothing useful, since provider limits apply only to paid accounts and not to free tiers

**Why:** A provider cap is a coarse, account-level backstop. It does not attribute cost to a caller and it does not prevent the runaway from reaching the cap first, and whether it exists on a free or beta tier, and whether it blocks or notifies, varies by provider and must be checked. Fine-grained control is a budget in your own process that aborts before the request is sent.

### Q2. Your in-code budget logs `WARNING: over budget` and continues. What is wrong with it? <!-- id: cost-05-monitoring-and-caps-q02 energy: normal -->

- [ ] Nothing, provided the warning is emailed to someone who reads it
- [ ] It should count tokens rather than currency, which would make it effective
- [ ] The threshold is too high, so it fires later than it should
- [x] It does not stop execution, so it has the same practical effect as no budget at all

**Why:** A budget's only function is to abort. A log line at 3 a.m. is read by nobody and stops nothing, so an over-budget loop keeps spending at exactly the rate it would have with no budget. The budget must raise an exception before the request is sent, which also means the check happens pre-flight rather than after the money is already gone.

### Q3. Your bill is four times your estimate, even though the answers you receive are about the length you predicted. What is the most likely explanation? <!-- id: cost-05-monitoring-and-caps-q03 energy: normal -->

- [ ] The provider prices output tokens higher than you assumed
- [ ] Your input token estimate was wrong because you counted characters
- [x] Reasoning tokens are being billed as output without appearing in the visible answer
- [ ] The provider is charging for cached input tokens at the fresh-input rate

**Why:** Reasoning models generate internal tokens before the answer, and those tokens are billed as output while remaining invisible in the text you receive. This is why output token counts must come from the usage object rather than from measuring the answer string. The other options are real ways to be wrong, but none of them produces a four-fold error when answer lengths match your prediction.

### Q4. A caller is rate-limited and retries immediately in a tight loop. What actually happens? <!-- id: cost-05-monitoring-and-caps-q04 energy: normal -->

- [ ] The retries succeed because the limit is per-request and resets instantly
- [x] The retries add load to a system that just reported being at capacity, and synchronized clients recreate the same spike
- [ ] The provider raises your tier automatically after enough retries
- [ ] Nothing changes, since only the first request in a minute counts against the quota

**Why:** A 429 is a statement about current capacity. Immediate retries do not wait for capacity, they consume it, and because many clients react to the same event at the same instant their retries arrive in waves that re-trigger the limit. Jitter exists specifically to break that synchronization so the retries spread across time.

### Q5. Which status codes should never be retried? <!-- id: cost-05-monitoring-and-caps-q05 energy: normal -->

- [ ] 429 and 503, because retrying a rate limit makes the limit worse
- [ ] 500 and 502, because they indicate a bug in your own code
- [ ] 408 and timeouts, because the request may already have been billed
- [x] 400, 401, and 403, because the same request will fail identically until something on your side changes

**Why:** The test is not whether the call failed but whether the same request could succeed later without anything changing on your side. A malformed body is still malformed, and a revoked key is still revoked, so retrying produces identical failures while multiplying the input cost and delaying the discovery of the bug. Rate limits, timeouts, and 5xx are the retryable classes.

### Q6. You measure cost per call and find model A is cheaper than model B. What must you check before concluding A is the better choice? <!-- id: cost-05-monitoring-and-caps-q06 energy: normal -->

- [ ] Whether A has a larger context window than B
- [ ] Whether A's latency is lower, since latency correlates with cost
- [x] Whether A's success rate per task is high enough that cost per successful task is actually lower
- [ ] Whether A is offered on the free tier, which changes the arithmetic entirely

**Why:** Cost per call is the supplier's metric. If A succeeds 60% of the time and B succeeds 95%, the attempts, follow-ups, and rework that a failed call triggers often make B cheaper per completed task. Measuring this requires a `run_id` grouping all calls for one logical task and a written definition of what success means.

### Q7. A per-day budget aborts nothing during the day, yet your spend triples. What is the most likely cause? <!-- id: cost-05-monitoring-and-caps-q07 energy: normal -->

- [ ] Genuine user growth, since daily budgets do not scale with traffic
- [x] A background or scheduled job running repeatedly, producing a flat elevated plateau rather than a spike
- [ ] Cache misses on your prompt prefix, which double the input price
- [ ] The provider raising prices mid-day without notice

**Why:** A daily budget in one process cannot see spend from another process, and background jobs are the classic blind spot: enrichment passes, nightly summarisation, and cache warming run without a human watching and produce a sustained elevation that starts at a boundary rather than growing smoothly. The fix is a per-process budget plus a shared store the alerting query can read.

### Q8. Which of these is the strongest reason to log a `run_id` alongside every request ID? <!-- id: cost-05-monitoring-and-caps-q08 energy: normal -->

- [ ] It lets the provider's support team locate your requests more quickly
- [ ] It reduces the number of API calls by deduplicating identical prompts
- [ ] It replaces the need for a request ID, which is only useful for debugging
- [x] It groups every call belonging to one logical task, which is the only way to compute cost per successful task

**Why:** A request ID identifies one HTTP call. A logical task may involve several calls — retries, tool round-trips, a generation and a validation pass — and it may succeed or fail as a whole. Without a shared identifier grouping them, you can only ever compute cost per call, which is the metric that hides the true cost of a cheap-but-unreliable model.

## You're ready to move on when...

- You can state, from your own logged data, what one week of your real workload would cost at current published prices, and you can show the arithmetic.
- Your in-code budget has actually stopped a runaway at least once, and you can describe the exception path it took.
- You can look at any single call in your log and say which caller made it, what model served it, what it cost, and whether it was retried.
- You can explain without notes why a spend spike is more likely to be a loop or a retry storm than user growth, and name the three graph shapes that distinguish them.
- You have implemented jittered backoff, capped the attempts, honoured `Retry-After`, and can justify why each of those three is load-bearing.
- You can name the rate-limit dimensions and say which one your own workload is closest to hitting.
- You have computed cost per successful task for at least two workloads and can explain why it disagrees with cost per call.
- You have a dated transition plan that names what you will keep, shrink, batch, move local, or cut when free access ends — and you know which cut comes first.

## Free vs Paid

**What free gets you, and it is nearly everything in this phase.** A structured log in SQLite or a CSV file, a budget class in your own code, a cron job running a SQL query, and an email when a threshold trips — that is the entire control loop, and every part of it is free and will stay free. Python's `logging` module, Prometheus, Grafana self-hosted, and SQLite cost nothing. A free provider tier is enough to generate the data you need this week, and a local model through Ollama generates it with no account at all. If you never spend a peso on observability tooling, you can still complete this phase fully.

```python
# Example cost logging implementation
import json
import time
from uuid import uuid4

def log_call(model: str, input_tokens: int, output_tokens: int, cached_tokens: int, latency_ms: float, cost: float, request_id: str) -> None:
    """Log a single API call to a file."""
    record = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "model": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cached_tokens": cached_tokens,
        "latency_ms": latency_ms,
        "cost": cost,
        "request_id": request_id,
    }
    with open("api_calls.jsonl", "a") as f:
        f.write(json.dumps(record) + "\n")

def measure_eval_set(size: int, interactive_cost_per_call: float, batch_discount: float = 0.5) -> dict:
    """Compare cost of running an eval set interactively vs via batch."""
    interactive_total = size * interactive_cost_per_call
    batch_total = size * interactive_cost_per_call * batch_discount
    return {
        "interactive_cost": interactive_total,
        "batch_cost": batch_total,
        "savings": interactive_total - batch_total,
        "savings_pct": (1 - batch_discount) * 100,
    }

# Example usage
if __name__ == "__main__":
    # Log a call
    log_call(
        model="gpt-4",
        input_tokens=100,
        output_tokens=50,
        cached_tokens=0,
        latency_ms=500,
        cost=0.002,
        request_id=str(uuid4()),
    )
    
    # Measure eval set
    eval_result = measure_eval_set(size=200, interactive_cost_per_call=0.003)
    print(f"Interactive cost: ${eval_result['interactive_cost']:.2f}")
    print(f"Batch cost: ${eval_result['batch_cost']:.2f}")
    print(f"Savings: ${eval_result['savings']:.2f} ({eval_result['savings_pct']:.1f}%)")
```
