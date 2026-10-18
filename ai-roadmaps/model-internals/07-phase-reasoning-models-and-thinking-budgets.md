---
id: intern-07-reasoning-models-and-thinking-budgets
track: model-internals
phase: 7
order: 70
title: Reasoning Models and Thinking Budgets
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/model-internals/07-reasoning-models-and-thinking-budgets.md
exit_criteria: >
  You can explain why a reasoning model costs more than an ordinary one for the
  same answer, measure the reasoning tokens a request actually produced, and
  choose an effort level from the task rather than from the model's reputation.
  You can name the failure where you pay for thinking and receive nothing.
---

## Goal of this phase

The model landscape phase established that a model's size stopped predicting its quality, and that the training stage is the real axis. This phase is about the third axis, the one that arrived after both: **how much the model thinks before it answers, and how you pay for that.**

**The mechanism is a trade you have already met in a different costume.** In the serving phase you saw that generating more tokens costs more time and money. A reasoning model applies that fact deliberately: it spends extra tokens on internal working-out before producing the answer you asked for. Those tokens are called **reasoning tokens**, they are billed at the output rate, and they occupy the same context window as everything else. Nothing about the architecture is new. What is new is that a single number — the effort, or in older APIs the thinking budget — decides how many of them you buy.

**The reason this needs a phase is that the cost is invisible and the benefit is not guaranteed.** A summary task that used to cost a fraction of a cent can quietly cost several times as much, because the model reasoned about how to summarise a paragraph. A request can end with no visible answer at all and still be billed, because the thinking consumed the whole output allowance. And changing the effort between requests can invalidate the prompt cache you were relying on, so the cheapest-looking setting produces the largest bill. None of these are visible unless you read the usage object, which is the instrument this phase teaches you to read.

By the end you will have measured reasoning tokens on real requests, run the same prompt at several effort levels and plotted the trade yourself, deliberately reproduced the pay-and-receive-nothing failure, and written a routing rule that sends each of your own tasks to an effort level — or away from a reasoning model entirely — for a stated reason.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Day 1 is the reading and one request whose usage object you print. Days 2–4 are the measurement tasks, which are the point. Day 5 is the routing write-up.

Budget an extra hour if you have not yet read the usage object from a request in the Foundations track. This phase assumes you can print it and find a named field; everything else follows from that.

If you have less time, do tasks 1, 2, 5, 6 and 11 — measure, compare two effort levels, reproduce the truncation, and write the rule. Those five carry the phase.

## Skills you'll gain

- Explain why reasoning tokens are billed at the output rate and consume the context budget
- Read the reasoning-token count from a provider's usage object instead of inferring it from the bill
- Measure the cost, latency and quality of the same prompt at two or more effort levels
- Choose an effort level from the task's failure cost, not from the model's reputation
- Decide when a reasoning model is the wrong tool, and say why for a specific task
- Recognise the pay-and-receive-nothing failure, where the output allowance is exhausted by thinking
- Predict when changing the thinking configuration will invalidate a prompt cache
- Distinguish a reasoning summary from the model's actual reasoning, and know what is and is not returned
- Recognise that more thinking does not mean a better answer, and state where the returns fall off
- Say honestly where reasoning models do not help at all

## Specific topics to learn

### Where the extra tokens go

- Test-time compute: buying accuracy with tokens spent at inference rather than at training
- Reasoning tokens as a third kind of token, alongside input and output
- Why they are billed at the output rate and why that is not arbitrary
- Their occupancy of the context window, and how that interacts with the budget from Foundations Phase 3
- Interleaved thinking: reasoning between tool calls, not only before the first token
- Reasoning continuity across turns, and why it is model-family-specific

### Measuring rather than guessing

- The usage object as the only reliable source: the reasoning-token field and where it lives
- Reading the count from a provider that reports it separately from visible output
- A worked comparison of one prompt at two effort levels
- Latency as the second cost: time to first visible token versus total time
- Why a bill tells you something happened but not what

### Choosing an effort level

- The control surface, and how it has converged on an effort level rather than a token count
- Adaptive or dynamic thinking as the default on current models, and what that changes
- Effort defaults being model-specific rather than universal
- Tasks whose answer improves with more steps, and tasks whose answer does not
- Matching effort to the cost of being wrong, not to the size of the model
- Changing effort mid-conversation, and the caching consequence

### The budget that bites back

- Thinking tokens counting against the same output limit as the visible answer
- The incomplete response: status, the reason field, and being billed for thinking with no visible output
- Why a generous output allowance is cheaper than a tight one on reasoning models
- Long thinking runs and the transports that cannot carry them
- Reasoning tokens in a streamed response, and when the breakdown arrives

### What is exposed and what is not

- The reasoning summary as an opt-in convenience, not the reasoning
- The opaque or encrypted representation kept for continuity, and why it exists
- Why "the model reasoned for 4,000 tokens" is often all you can know
- Reasoning content and data handling: it is generated content, and the provider's terms apply
- The limits: no summary, empty summary, and what a missing summary does and does not tell you

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Python 3 | Print and compare usage objects | Free | https://www.python.org/downloads/ | Measure reasoning tokens and latency at two effort levels | Any language with an HTTP client |
| A hosted reasoning model | The subject: an API that exposes effort and reports reasoning tokens | Free tier varies and changes; check current terms and pricing | https://ai.google.dev/ | Run one prompt at low and high effort and diff the usage | A local reasoning model through Ollama |
| Ollama | Run a reasoning-capable open-weight model locally, with no per-token bill | Free/open-source | https://ollama.com/ | Compare a local model's visible reasoning against a hosted summary | A provider free tier |
| tiktoken | Count tokens yourself to sanity-check the provider's numbers | Free/open-source | https://github.com/openai/tiktoken | Count the visible output and see it does not match total output tokens | The provider's own token-counting endpoint |
| Pydantic | Validate structured output, so a truncated reasoning response fails loudly | Freemium, free tier | https://docs.pydantic.dev/ | Reject an incomplete response instead of parsing garbage | `jsonschema`, or hand-written checks |
| `python-dotenv` | Keep the key out of the source, as in Foundations Phase 8 | Free | https://github.com/theskumar/python-dotenv | Reuse the pattern rather than re-deriving it | Environment variables set by your shell |
| `hyperfine` | Time the same request repeatedly and see the latency spread | Free/open-source | https://github.com/sharkdp/hyperfine | Measure time to first token across effort levels | Your shell's `time`, repeated |
| A spreadsheet or notebook | Store the measurements and draw the trade-off | Free/open-source | https://jupyter.org/ | Plot tokens and latency against effort for one task | Any spreadsheet application |

## Free/cheap resources

- **OpenAI — Reasoning models guide** — https://platform.openai.com/docs/guides/reasoning
- **Anthropic — Extended thinking** — https://platform.claude.com/docs/en/build-with-claude/extended-thinking
- **Anthropic — Steering thinking and cost** — https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost
- **Google — Gemini thinking** — https://ai.google.dev/gemini-api/docs/thinking
- **Google — Gemini token counting** — https://ai.google.dev/gemini-api/docs/tokens
- **OpenAI — Prompt caching** — https://developers.openai.com/api/docs/guides/prompt-caching
- **OpenAI — Token counting guide** — https://developers.openai.com/api/docs/guides/token-counting

## Lesson: You Are Paying for Thinking You Cannot See

### Part 1 — What a reasoning token actually is

Start from the fact that makes the rest of the phase make sense: **a reasoning model produces tokens you will never read, and you are billed for them.**

The mechanism is called **test-time compute**, and the intuition is worth stating plainly. A model is trained once on a large body of text; that training is expensive and finished. At inference time it has one lever left for improving an answer: **how much work it does before it commits to one**. A model that has already decided on an answer in one pass will produce that answer. A model permitted to spend a few thousand tokens decomposing the problem, considering approaches and checking itself can, on some tasks, produce a better answer from the same weights.

Those working tokens are **reasoning tokens**. They sit alongside the input tokens you sent and the output tokens you can read, and the documentation across providers is consistent on the accounting: they are **billed as output tokens**, and they **occupy space in the context window**. A single usage object makes the shape obvious.

```json
{
  "usage": {
    "input_tokens": 75,
    "output_tokens": 1186,
    "output_tokens_details": {
      "reasoning_tokens": 1024
    },
    "total_tokens": 1261
  }
}
```

Read that object carefully, because it contains the phase. The visible answer is 1,186 minus 1,024 — a hundred and sixty-two tokens of actual response. **The thinking was six times the size of the answer.** If you had assumed `output_tokens` meant "the answer", you would have mispriced this request by a factor of seven, and nothing in the response text would have told you.

Two consequences follow, and they are the load-bearing ones:

1. **A reasoning model is not a better model; it is a model plus a spend.** The same weights can be run at a low effort and a high effort, and the difference is real money and real latency. "Reasoning model" describes a capability, not a quality guarantee, and the capability can be switched on wastefully.
2. **The cost is invisible in the place you would look.** You cannot see reasoning tokens in the response text, because providers do not return the raw reasoning — you get a summary if you ask for one, and otherwise nothing. The count is visible only in the usage object. **The instrument is the usage object, and this phase is largely about reading it.**

> Think of it as commissioning an estimate with the option to pay for a surveyor. The estimator gives you a number. The surveyor walks the site, checks the boundaries and comes back with a better number — and charges for the visit whether or not the answer changes. For a question about a boundary, the survey is worth it. For "is this house painted", paying a surveyor is absurd, and that absurdity is the whole trade you are about to learn to make.
>
> Where the analogy breaks: you can usually tell an estimator not to send the surveyor *and know you did*, whereas with a reasoning model a default is choosing for you. On current models, thinking is on by default and adapts to the request — which means the spend is often happening without an explicit decision, which is exactly why measuring it comes before choosing it.

### Part 2 — Measuring it, because the bill only says that something happened

You cannot reason about this trade without two numbers: how many reasoning tokens a task actually consumes, and what those tokens bought. Both come from the same experiment.

**The experiment, and it takes twenty minutes.** Take one prompt whose answer quality is hard to fake — a multi-step arithmetic or logic problem with a known answer is ideal. Run it at the lowest effort available and at a high effort. For each run, record four things: the reasoning-token count, the total output-token count, the wall-clock latency, and whether the answer was correct.

```text
For one task, at each effort level:
  reasoning_tokens        <- from the usage object, not estimated
  output_tokens           <- total, including the reasoning
  latency_seconds         <- measured, not felt
  correct                 <- yes or no, against an answer you know
```

The pattern that emerges from doing this even a handful of times is the one to internalise, and it has three parts.

**First, the reasoning count spans a range you would not guess.** The documentation is explicit that the model may generate anywhere from a few hundred to tens of thousands of reasoning tokens depending on the problem's complexity, and that at lower effort it may **skip thinking entirely** on an easy input. So "reasoning model" does not mean "a fixed overhead"; it means a variable spend that the model and the effort level jointly set.

**Second, the relationship between spending and quality has a knee.** More thinking helps, and it helps with **diminishing returns that depend on the task** — that phrasing is a provider's own, and it is exactly right. Going from no thinking to some thinking on a task that needs it can be the difference between wrong and right. Going from a moderate effort to the maximum often buys nothing at all on a task that was already solved, and it always costs more.

**Third, latency and tokens are the same cost seen twice.** Reasoning tokens are generated before the visible answer, so they are added latency before the first thing the user sees — which is why the two columns move together, and why the trade is not "cost versus quality" but "cost *and* latency versus quality". A measurement that records only the bill will let you make a choice that is terrible for a user.

**And the honesty about measurement:** you should expect your numbers to differ between providers, between model versions, and between runs of the same request, because sampling is stochastic (Foundations Phase 5). Record the date on every figure. **As of 2026-10** the control surface itself is still moving — the section on effort below describes a surface that has changed shape at least once — so what you should carry forward is the method, not any particular count.

### Part 3 — Choosing an effort level from the task

You now have the measurements. The decision is now a rule, and the rule is not the one the marketing suggests.

**The control surface has converged on an effort level, and this is worth knowing because it has changed.** Older APIs exposed a **manual token budget** — you set a number and the model thought against it — and on current models that style is deprecated or rejected in favour of a level. **As of 2026-10** the shape across three providers is close enough to describe once: you choose a level named something like `low`, `medium`, `high`, from a set that may also include `minimal` and, on some models, one or two levels above `high`. The levels are model-dependent, the defaults are model-specific, and you should check the current documentation rather than trusting this paragraph — but the *concept*, "you choose how hard it works", is stable.

**The newer default is adaptive.** On current models, thinking is on by default and the model decides whether and how much to think per request, adjusting to complexity. This is genuinely good and it changes the failure mode: the thing to worry about is no longer "I forgot to turn thinking on" but "thinking is on, and I never checked what it cost". You still choose a level; the model chooses the number of tokens within it.

**So the rule is about the task, and it has two questions.** Ask them in this order:

1. **Does the answer improve with more steps?** If the task is genuinely multi-step — combining constraints, debugging from several clues, planning a sequence, arithmetic that must be carried through — then thinking buys something and the question is only how much. If the task is a transformation whose answer is determined entirely by the input — reformatting, translating, extracting a field, summarising text you provided — then there is nothing to work out, and more thinking buys nothing.
2. **How expensive is being wrong here?** A cheap-to-fail task (a draft, a suggestion, something a human reviews) wants the lowest effort that reliably works. An expensive-to-fail task (a migration, a security review, a decision a person will act on) is where the higher effort earns its cost — and note the provider's own guidance lands in the same place: the top effort levels are for cases where your own evals show a clear benefit that justifies the extra latency and cost.

Put together, the mapping is uncomfortably plain, and it is worth writing down because it contradicts the instinct to reach for the biggest model:

- **No thinking.** Classification, entity extraction, reformatting, simple retrieval, and anything latency-critical — voice most of all, since reasoning happens before the first visible token and a voice interface has a fraction of a second to answer.
- **Low to medium.** Planning, tool use, drafting, execution-oriented coding, and most assistant workflows — the tasks that benefit from a little structure and do not need a long chain.
- **High and above.** Hard debugging, complex reasoning, long-horizon agentic work, and high-stakes analysis where quality dominates latency — and only where you have measured a gain, because the top levels are the easiest place to spend a lot for a little.

**One practical detail worth carrying.** Where a change of effort is allowed mid-conversation, the same prefix keeps its cache, which is why the api exposes it as a separate item rather than a request field — so raising effort for one hard follow-up does not throw away the cached prefix. That detail exists because the naive version — changing the setting per request — costs more, which is the next part.

### Part 4 — The four ways this bites, in order of how often

**1. Paying for thinking on a task that cannot benefit.** This is the most common and the most expensive over a month. A reasoning model asked to reformat a payload will reason about the reformatting and produce exactly the same bytes it would have produced instantly. The fix is routing: not every call should go to a reasoning model, and the calls that do should not all be at the same effort. This is the model-routing phase's logic applied to a knob inside the model.

**2. Paying and receiving nothing.** This failure deserves its own paragraph because it is genuinely surprising the first time. Thinking tokens count against the **same output limit** as the visible answer. If your output limit is too small for the thinking plus the answer, the model can hit the limit **during reasoning**, before producing any visible text, and return a response marked incomplete — and you are still billed for the thinking that occurred. The documentation says this plainly: you may "incur costs for input and reasoning tokens without receiving a visible response". The provider's recommendation for starting out is to **reserve a generous allowance**, on the order of twenty-five thousand tokens for reasoning and output together, and to treat a tightened limit as something you earn with measurement. A tight output limit on a reasoning model is not thrift; it is a way to buy silence.

**3. Invalidate the cache by fiddling.** The concrete mechanism matters: because the thinking configuration is part of what the model sees, **changing the budget or the effort between requests invalidates the cache breakpoints** — the cached prefix is rebuilt at full input price. The practical consequence is the opposite of the intuition: a lower effort is not automatically cheaper, because a cache miss on a long prefix costs far more than the thinking you saved. **Pick a setting and hold it for the life of a cached conversation**, and vary it deliberately rather than per request. A well-documented experiment shows the miss on the third request when the setting changes; the request that changed the setting is the one that pays.

**4. Trusting the summary as the reasoning.** Providers expose a **summary** of the reasoning — opt-in, and sometimes empty — alongside an opaque or encrypted representation of it, which exists so the model can continue its reasoning across turns rather than so you can read it. The raw reasoning is not returned. Three things follow: reviewing a summary is a legitimate debugging technique and it is not the same as reading the reasoning; **a missing or empty summary does not mean the model did not think** (the docs are explicit that a thought block can carry only a signature and no summary, on a simple request or when summaries are disabled); and the reasoning content is generated content subject to the provider's data terms, so do not assume it is inert because you cannot see it.

### Part 5 — Where this stops helping, honestly

The mechanism is real and it is bounded, and the boundary is what turns it into judgement.

**More thinking does not fix missing information.** If the answer is not in the input and not in the weights, no amount of internal deliberation produces it. A reasoning model on an impossible question will produce a confident, well-structured wrong answer, and it will have spent a great deal of money arriving there. This is the mechanism from Foundations Phase 7 with a bigger bill attached: fluency is not grounding, and deliberation is not grounding either.

**Diminishing returns are steep and they are real.** Provider documentation says so in as many words, and your own measurements from Part 2 will show a task that goes from wrong to right across the first increment of thinking and then flat, or even worse, across the next three. There is a well-known phenomenon of overthinking a simple problem; if you have measured a task at a high effort and it is no better than at a low one, the higher setting is not prudence, it is a standing loss.

**It is the wrong tool where latency is the product.** A conversational voice interface, an autocomplete, an interactive UI — anywhere the answer must arrive faster than a person notices a pause — is served badly by default thinking, because the tokens are spent before the first visible token. Turning thinking down is not cutting a corner there; it is the correct engineering.

**And the volatility warning is larger here than in most phases.** **As of 2026-10**, the entire control surface — whether a manual budget exists, what the levels are called, what each model defaults to, how much default thinking costs — is under active change, and one provider's documented migration shows a fixed budget being replaced by an adaptive mode with a separate effort control. Model names, level names, defaults and minimums have all moved within the last year. **Every specific in this phase is dated and should be re-checked against the current documentation.** The durable parts are these: reasoning tokens are output tokens and are billed and cached accordingly; thinking is now on by default, so the spend is a decision even when you did not make it; the answer improves with steps only on tasks that have steps; and the strongest instrument is still the usage object. Those will outlive this year's API.

## Hands-on practice tasks

1. Send one prompt to a reasoning model and print the entire usage object. Find the field that reports reasoning tokens and the field that reports total output. <!-- id: intern-07-reasoning-models-and-thinking-budgets-t01 band: quick energy: low -->
2. Compute the ratio of reasoning tokens to visible answer tokens for that request by hand. Write down whether `output_tokens` alone would have let you price it correctly. <!-- id: intern-07-reasoning-models-and-thinking-budgets-t02 band: quick energy: normal -->
3. Take a multi-step problem with an answer you know. Run it at the lowest effort and a high effort. Record reasoning tokens, total output, latency and correctness for each. <!-- id: intern-07-reasoning-models-and-thinking-budgets-t03 band: focused energy: normal -->
4. Repeat task 3 three times at each level, because sampling varies. Record the spread rather than a single number. <!-- id: intern-07-reasoning-models-and-thinking-budgets-t04 band: focused energy: high -->
5. Run a pure transformation — reformat this JSON, extract this field — on a reasoning model and on a non-reasoning model. Compare tokens and latency for the same output. <!-- id: intern-07-reasoning-models-and-thinking-budgets-t05 band: focused energy: normal -->
6. Take one task that needs thinking and one that does not. Plot tokens and latency against effort for both on the same axes. Write one sentence on the difference in shape. <!-- id: intern-07-reasoning-models-and-thinking-budgets-t06 band: deep energy: high -->
7. Deliberately set a very small output allowance on a task that requires reasoning. Confirm the incomplete status, read the reason field, and record that you were billed with no visible answer. <!-- id: intern-07-reasoning-models-and-thinking-budgets-t07 band: focused energy: high -->
8. Raise the allowance and repeat task 7. Record the setting at which the visible answer appears, and connect it to the advice about reserving room for reasoning. <!-- id: intern-07-reasoning-models-and-thinking-budgets-t08 band: focused energy: normal -->
9. Enable reasoning summaries if your provider offers them. Ask a simple question and a hard one. Record which summary, if any, was empty and why the documentation predicts that. <!-- id: intern-07-reasoning-models-and-thinking-budgets-t09 band: focused energy: normal -->
10. Send a multi-turn conversation twice: once holding the thinking configuration constant and once changing it between turns. Compare the cache-related fields in the usage object. <!-- id: intern-07-reasoning-models-and-thinking-budgets-t10 band: deep energy: high -->
11. Measure the latency difference a user would feel: time to first visible token at the lowest and the highest effort. State the number for a voice interface's budget. <!-- id: intern-07-reasoning-models-and-thinking-budgets-t11 band: focused energy: high -->
12. Give a reasoning model a question whose answer is not in the prompt and cannot be known. Record how confident the answer looks and what it cost to produce. <!-- id: intern-07-reasoning-models-and-thinking-budgets-t12 band: focused energy: high -->
13. Repeat one task against a local reasoning model through Ollama. Compare what is exposed — visible reasoning, summaries, usage fields — with the hosted provider. <!-- id: intern-07-reasoning-models-and-thinking-budgets-t13 band: deep energy: normal -->
14. Compute the monthly cost of one of your tasks at low and at high effort, at the volume you would realistically run. Include the effect of one cache invalidated per conversation. <!-- id: intern-07-reasoning-models-and-thinking-budgets-t14 band: deep energy: high -->
15. Write a routing rule for five of your own task types: effort level, or not a reasoning model at all, with the measurement that justifies each line. <!-- id: intern-07-reasoning-models-and-thinking-budgets-t15 band: ongoing energy: high -->

## Common Pitfalls

**Reading `output_tokens` as "the answer".** On a reasoning model, most of the output may be thinking you never see. Price the request from the usage object, where the reasoning count sits separately, or you will be wrong by an order of magnitude.

**Turning thinking on and leaving it on for everything.** Thinking is now on by default on current models, which means the default is a spend. Route the transformation and retrieval calls away from a reasoning model; they cannot benefit and always pay.

**Setting a tight output limit to save money.** Thinking counts against the same limit as the answer, so a tight limit can end the request during reasoning, before any visible output, and bill you anyway. A generous allowance is cheaper than silence.

**Changing the thinking setting per request.** Because the setting is part of what the model sees, changing it invalidates cache breakpoints and the prefix is rebuilt at full input price. A lower effort can therefore cost more than a higher one held constant.

**Assuming a missing reasoning summary means no reasoning happened.** A thought block can carry only an opaque signature and no summary, on a simple request or when summaries are disabled. The absence is not evidence about the token spend, which is in the usage object.

**Treating a higher effort as a safer choice.** Past the point where the task is solved, extra thinking is a standing loss, and overthinking a simple problem is a documented behaviour rather than a hypothetical. Measure before raising.

**Expecting deliberation to fix a knowledge gap.** If the answer is not in the input or the weights, more steps produce a more confident wrong answer. This is a grounding problem, and thinking is not a grounding mechanism.

**Comparing reasoning models on price per token without comparing tokens per task.** A cheaper model that thinks four times as long can cost more per finished answer. The unit that matters is the completed task, not the token.

**Using default thinking in a latency-critical interface.** Reasoning tokens are generated before the first visible token, so they land directly on the user's perceived delay. Voice and interactive surfaces should choose their effort for latency, not for benchmark score.

**Forgetting that reasoning content is generated content.** It is subject to the provider's data terms like anything else you send or receive. Do not assume it is inert because it is not shown to you.

**Treating this year's level names and defaults as durable.** The control surface has already changed shape at least once, and minimums, defaults and level names have moved within a year. Re-check the current documentation; carry the method, not the constants.

**Taking a provider's reasoning summary for the model's reasoning.** The summary is opt-in convenience and may be empty. It is useful for debugging failures and it is not the thing itself.

## Deliverable / proof of work

Write `portfolio/model-internals/07-reasoning-models-and-thinking-budgets.md` containing:

- **Your usage-object reading** — one real request with the reasoning-token field and the total output field printed, and the hand-computed ratio of thinking to answer.
- **The effort comparison** — one task with a known answer, run at two or more effort levels, three repetitions each, with reasoning tokens, total output, latency and correctness recorded, and the date on every figure.
- **The same axes plotted** — tokens and latency against effort for a task that benefits and a task that does not, with one sentence on why the two curves differ in shape.
- **The pay-and-receive-nothing reproduction** — the output limit that produced an incomplete response with no visible text, the reason field, and the token charges you incurred.
- **The cache experiment** — the usage fields for a conversation with a held setting and one with a changed setting, and what the difference cost.
- **A latency number for a voice interface** — time to first visible token at the lowest and highest effort, judged against a sub-second budget.
- **A confident wrong answer you elicited** — the impossible question, how correct the answer looked, and what it cost.
- **Your routing rule for five task types**, each line naming an effort level or a decision not to use a reasoning model, with the measurement that justifies it.
- **A dated list of the specifics you verified and the specifics you could not**, so a future reader knows which constants to re-check.

## Checklist

- [ ] I can explain test-time compute without using the word "smart" <!-- id: intern-07-reasoning-models-and-thinking-budgets-c01 energy: normal -->
- [ ] I can say why reasoning tokens are billed at the output rate <!-- id: intern-07-reasoning-models-and-thinking-budgets-c02 energy: normal -->
- [ ] I can find the reasoning-token count in a usage object rather than inferring it from a bill <!-- id: intern-07-reasoning-models-and-thinking-budgets-c03 energy: low -->
- [ ] I have computed the ratio of reasoning tokens to visible answer tokens for a real request <!-- id: intern-07-reasoning-models-and-thinking-budgets-c04 energy: normal -->
- [ ] I have measured one prompt at two effort levels and recorded tokens, latency and correctness <!-- id: intern-07-reasoning-models-and-thinking-budgets-c05 energy: normal -->
- [ ] I have seen the spread across repeated runs and know a single measurement proves little <!-- id: intern-07-reasoning-models-and-thinking-budgets-c06 energy: high -->
- [ ] I can name a task whose answer improves with more steps and one whose answer cannot <!-- id: intern-07-reasoning-models-and-thinking-budgets-c07 energy: high -->
- [ ] I choose an effort level from the cost of being wrong and the shape of the task <!-- id: intern-07-reasoning-models-and-thinking-budgets-c08 energy: high -->
- [ ] I have reproduced the incomplete response caused by reasoning consuming the output limit <!-- id: intern-07-reasoning-models-and-thinking-budgets-c09 energy: high -->
- [ ] I can explain why a generous output allowance is cheaper than a tight one here <!-- id: intern-07-reasoning-models-and-thinking-budgets-c10 energy: normal -->
- [ ] I can explain why changing the thinking setting invalidates a prompt cache <!-- id: intern-07-reasoning-models-and-thinking-budgets-c11 energy: high -->
- [ ] I hold a thinking setting constant for the life of a cached conversation <!-- id: intern-07-reasoning-models-and-thinking-budgets-c12 energy: normal -->
- [ ] I know what a reasoning summary is, and that a missing one is not evidence of no reasoning <!-- id: intern-07-reasoning-models-and-thinking-budgets-c13 energy: normal -->
- [ ] I know the raw reasoning is not returned and treat it as generated content under the provider's terms <!-- id: intern-07-reasoning-models-and-thinking-budgets-c14 energy: normal -->
- [ ] I can explain why more thinking does not fix missing information <!-- id: intern-07-reasoning-models-and-thinking-budgets-c15 energy: high -->
- [ ] I can name where the returns fall off for a task I measured, rather than assuming more is better <!-- id: intern-07-reasoning-models-and-thinking-budgets-c16 energy: high -->
- [ ] I have measured the latency a user would feel, not only the bill <!-- id: intern-07-reasoning-models-and-thinking-budgets-c17 energy: normal -->
- [ ] I can state why default thinking is the wrong choice for a voice or interactive interface <!-- id: intern-07-reasoning-models-and-thinking-budgets-c18 energy: normal -->
- [ ] I route transformation and retrieval tasks away from reasoning models <!-- id: intern-07-reasoning-models-and-thinking-budgets-c19 energy: normal -->
- [ ] I have written a routing rule for my own tasks with the measurement behind each line <!-- id: intern-07-reasoning-models-and-thinking-budgets-c20 energy: high -->
- [ ] I have dated every volatile specific and listed what I could not verify <!-- id: intern-07-reasoning-models-and-thinking-budgets-c21 energy: normal -->

## Quiz

### Q1. Rewriting a supplied paragraph into a shorter one on a reasoning model costs several times what a non-reasoning model costs for the same output. What is the best explanation? <!-- id: intern-07-reasoning-models-and-thinking-budgets-q01 energy: normal -->

- [ ] Summarisation is billed at a higher rate on reasoning models
- [x] The model generated reasoning tokens on a task whose answer cannot improve with reasoning, and those tokens are billed as output
- [ ] The input grew because the model re-read the text several times
- [ ] The output is longer than it looks once the summary is included

**Why:** Reasoning tokens are billed at the output rate, so the bill grew even though the visible answer did not. A transformation whose answer is determined entirely by its input has no steps to work out, so the thinking bought nothing — which is why this is a routing decision rather than a prompting problem. The input is not re-sent per thought, and the answer text is the same either way; the extra cost is entirely the invisible working.

### Q2. A request to a reasoning model returns with no visible text at all, marked incomplete, and you were still billed. What is the most likely cause? <!-- id: intern-07-reasoning-models-and-thinking-budgets-q02 energy: high -->

- [ ] The provider charged for a failed request as a matter of policy
- [ ] A content filter suppressed the answer
- [ ] The model crashed and the request was retried on your account
- [x] The output limit was exhausted by reasoning tokens, which count against the same allowance as the visible answer, so the thinking used it up before any answer was produced

**Why:** Thinking and the visible answer share one output limit, so a limit that is generous for the answer can be far too small once reasoning is included — and the model can hit it during reasoning, before emitting any text, while still billing the thinking it did. The provider's own guidance is to reserve a comfortable allowance and earn a tighter one through measurement. Treating a tight limit as thrift is what produces this outcome.

### Q3. Which of these tasks is most likely to justify a reasoning model? <!-- id: intern-07-reasoning-models-and-thinking-budgets-q03 energy: normal -->

- [x] Diagnosing a bug from several error messages and constraints that must be combined
- [ ] Reformatting a JSON payload into a CSV file
- [ ] Pulling a person's name out of a sentence
- [ ] Translating a paragraph into another language

**Why:** The distinguishing question is whether the answer improves with more steps. Combining several constraints into a diagnosis is a multi-step task where deliberation buys something; the other three are transformations whose output is determined by the input, so there is nothing to work out and the reasoning tokens buy nothing while still being billed. Note that the reasoning model is not wrong for the transformation — it is simply more expensive for identical output.

### Q4. You reduce the thinking effort on every request to save money, and your monthly bill goes up. What is the most likely mechanism? <!-- id: intern-07-reasoning-models-and-thinking-budgets-q04 energy: high -->

- [ ] A lower effort produces longer visible output that costs more
- [ ] The provider applies a minimum charge once thinking is disabled
- [x] Changing the thinking configuration between requests invalidates the prompt cache, so the prefix is rebuilt at full input price far more often
- [ ] Lower effort increases the failure rate, and retries consume the difference

**Why:** The thinking configuration is part of what the model sees, so a changed setting invalidates cache breakpoints and the cached prefix is re-created at full input price. On a long prefix that miss costs far more than the reasoning you saved, which is why the cheapest setting can be the most expensive one. The fix is to pick a setting and hold it for the life of a cached conversation, varying it deliberately rather than per request.

### Q5. You want to inspect what the model was thinking. What are you actually able to receive? <!-- id: intern-07-reasoning-models-and-thinking-budgets-q05 energy: normal -->

- [ ] The complete raw reasoning text, if you enable the right flag
- [ ] Nothing at all, in any form, under any setting
- [ ] The provider's internal server logs for the request
- [x] An opt-in summary, sometimes empty, plus an opaque representation kept for continuity — the raw reasoning is not returned

**Why:** Providers expose a summary as a convenience and keep an encrypted or opaque representation so the model can continue its reasoning across turns; the raw working is not returned. A missing or empty summary does not mean no reasoning happened, because a thought block can carry only the opaque part on a simple request or when summaries are off — which is why the token count in the usage object, not the summary, is the evidence about the spend.

### Q6. A voice assistant must answer well within a second, and you are choosing its thinking setting. What is the most defensible choice? <!-- id: intern-07-reasoning-models-and-thinking-budgets-q06 energy: high -->

- [ ] Choose the highest effort, because voice interactions deserve the best answers
- [x] Choose the lowest effort or turn thinking off, because reasoning tokens are generated before the first visible token and land directly on the user's perceived delay
- [ ] Leave the default, because adaptive thinking adjusts to the request and will handle it
- [ ] Enable summaries so the user can read the reasoning while it waits

**Why:** Reasoning is spent before any visible output, so it appears as silence to the user, and on a sub-second budget the delay is the feature failing. Adaptive thinking does reduce wasted effort, but the operating default still allows thinking where a latency-critical path cannot afford to gamble on it, so the deliberate choice is the lower setting. Reading a summary is not an answer, and it does not shorten the pause.

## You're ready to move on when...

You can take a request to a reasoning model and predict, before sending it, whether the thinking will buy anything and roughly what it will cost. You can read the reasoning-token count from the usage object rather than guessing from the bill, and you have measured one task across two effort levels and seen where the returns fall off. You can explain why a tight output limit can cost you the answer, why changing the setting can cost you the cache, and why an interface with a latency budget should not be using default thinking. You have a written routing rule for your own tasks, with a measurement behind each line.

## Free vs Paid

### What's free is enough

The measurement half of this phase is fully achievable at zero budget. Free tiers on current hosted reasoning models expose effort controls and report reasoning tokens in the usage object, which is everything the experiments need, and a local reasoning-capable model through Ollama lets you inspect a visible reasoning stream with no per-token bill at all. The key experiment — same task, two effort levels, four numbers recorded — costs a handful of requests rather than a budget. The most valuable output, a routing rule, is a table you write by hand.

### What a paid tier adds

Paid access buys volume and the higher effort levels, plus a rate limit that lets you run repetitions rather than single samples. Repetition matters more than it sounds: because sampling varies (Foundations Phase 5), a single measurement at each level is weak evidence, and a tier that lets you run ten of each produces a trustworthy curve. Paid tiers also tend to expose the newest models first, which is where the level names and defaults change — useful if you want to watch the surface move, and a liability if you confuse the newest behaviour with the durable mechanism.

### When it's worth paying

Pay when your own evals show a specific task failing at the lower effort levels and passing at a higher one, at a volume where the difference is visible in a month of use — the provider's own guidance for the top levels is exactly that standard. Do not pay to raise effort on tasks that do not have steps; that is buying a larger bill for identical output, and the honest answer for a summarisation or extraction pipeline is a cheaper non-reasoning model. And before paying for more thinking, check the caching rule: a setting held constant across a cached prefix is often a larger saving than a lower effort applied per request.
