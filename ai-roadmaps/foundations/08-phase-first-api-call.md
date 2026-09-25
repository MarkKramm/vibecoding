---
id: found-08-first-api-call
track: foundations
phase: 8
order: 80
title: Your First API Call
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal, high]
deliverable: portfolio/foundations/08-first-api-call.md
exit_criteria: >
  You have made a real API call from your own code, streamed the response,
  handled at least one failure class deliberately, kept your key out of the
  source file, and logged token usage from the response rather than guessing it.
  You can explain, without notes, what each field in the request means and what
  happens at the boundary where the API stops being the right tool.
---

# Phase 8 — Your First API Call

## Goal of this phase

Cross the line from *using* AI products to *building* with models. Up to now you have been a user of someone else's interface. This phase is where you become the author of one.

The thing you are actually learning is not "how to call an endpoint". It is narrower and more valuable: **an API call is a stateless, fully-specified request, and everything you have been doing implicitly in a chat box you now have to do explicitly.** The chat product was managing your conversation history, hiding the system prompt, choosing the model, retrying on failure, and buffering the response before showing it to you. When you use the API, all of those decisions become yours. That is the whole trade: you lose the convenience and you gain the control, and the control is what every later track — prompting, retrieval, agents, finetuning, cost — is built on top of.

By the end of this phase you will have made real calls from your own code, seen the JSON that goes out and the JSON that comes back, streamed a response, triggered and handled three different failure classes on purpose, and logged the token usage the provider reported. You will also, if you follow the security section properly, have avoided the single most common beginner mistake in this field — and the one that costs money.

## Estimated time

**1 week** at 1–2 hours a day, 5 days.

Day 1 is reading and setup. Days 2–4 are the practice tasks — they are the phase, not decoration. Day 5 is the write-up.

Budget an extra hour if you have never installed a package or set an environment variable before. That hour is not wasted; it is the tax on the rest of the curriculum, which assumes you can run code against an HTTP API.

## Skills you'll gain

- Read an API request and say what every field does and what happens if you change it
- Make a request from Python, and identify the equivalent in JavaScript
- Explain why the API is what you build on and the chat product is not
- Parse a JSON response and extract the text, the finish reason, and the usage numbers
- Stream a response and explain why perceived speed and actual speed are different things
- Recognise rate limits, context-length errors, and invalid-request errors as normal operating conditions, and handle each differently
- Keep an API key out of your source code and out of your git history
- Log token usage and cost from the response's own accounting, from day one
- Say where the API approach stops being the right tool

## Specific topics to learn

### The request

- The endpoint, the authentication header, and the choice of model
- The `messages` array: roles, ordering, and the fact that it is the conversation
- The system prompt as an explicit field rather than an invisible product behaviour
- Output limits and sampling controls, and what each one actually constrains
- Why the request is a complete specification rather than a delta

### The response

- The response envelope: choices, message content, finish reason, usage
- Why `finish_reason` is not optional information
- The usage counters and what input versus output tokens means for your bill
- Why the model cannot tell you its own token count reliably

### Streaming

- Server-sent events and the chunked transport
- Time to first token versus total time
- Why streaming changes the user's experience of speed without changing the speed
- What streaming costs you: harder parsing, harder error recovery, no single complete object

### Failure as normal operation

- Rate limits: what they are protecting, and how the provider tells you to wait
- Context-length exceeded: a request that is too big, and the strategies that shrink it
- Invalid requests: the errors that are actually your fault and should be fixed, not retried
- Transient server errors: the ones that are nobody's fault and should be retried
- Why retrying the wrong class of error makes things worse

### Secrets

- Why an API key in a source file is a public key the moment you push
- Environment variables, and the `.env` file that must never be committed
- `.gitignore`, rotation, and what to do if you have already leaked one
- Why "it is a private repository" is not a mitigation

### Cost from day one

- Reading the usage field instead of estimating
- Input tokens grow with every turn of a conversation
- Why the habit is easier to build now than to retrofit later

## Tools for This Phase

| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| Python 3 | The language you will write the calls in | Free | https://www.python.org/downloads/ | Write the script that makes your first request | Any language — the shape is the same |
| `requests` library | Plain HTTP calls, so you see the raw request | Free | https://requests.readthedocs.io/ | Send the request as raw JSON and read the raw response | Python's built-in `urllib.request` |
| OpenAI Python SDK | The official client, and a cleaner second pass | Free | https://github.com/openai/openai-python | Redo the call with the SDK and compare it to the raw version | Any OpenAI-compatible client library |
| `python-dotenv` | Load secrets from a file that is not committed | Free | https://github.com/theskumar/python-dotenv | Move your key out of source and into the environment | `os.environ` and your shell's own export command |
| `curl` | See exactly what goes over the wire | Free | https://curl.se/ | Send the same request from the terminal and read the raw bytes | Postman, or the raw mode of any HTTP client |
| A provider with a free tier | Something to actually call | Free tier varies, and credit terms change — check current pricing | https://ai.google.dev/ | Make your first call on a free tier before paying anything | Local models served by Ollama expose an OpenAI-compatible endpoint |
| Ollama | Run a model locally with no key and no bill | Free | https://ollama.com/ | Point your script at localhost and remove the key from the picture entirely | A provider free tier, if your machine is too weak to run a model |
| `git` | The tool that will record your mistakes forever | Free | https://git-scm.com/ | Practise the secret-leak drill deliberately, in a throwaway repo | A local-only repo with no remote |
| Node.js | The JavaScript equivalent of everything you write | Free | https://nodejs.org/ | Port one call to JavaScript so the shape is not tied to Python | Deno, Bun, or the browser's fetch API |

## Free/cheap resources

- **OpenAI — API reference** — https://developers.openai.com/api/docs/api-reference
- **OpenAI — Text generation guide** — https://developers.openai.com/api/docs/guides/text
- **Anthropic — Messages API reference** — https://platform.claude.com/docs/en/api/messages
- **Anthropic — Streaming messages** — https://platform.claude.com/docs/en/build-with-claude/streaming
- **Google — Gemini API quickstart** — https://ai.google.dev/gemini-api/docs/quickstart
- **Microsoft — Azure OpenAI REST quickstart** — https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart
- **Ollama — OpenAI compatibility layer** — https://docs.ollama.com/api/openai-compatibility
- **MDN — Using server-sent events** — https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
- **Python — `os.environ` and environment variables** — https://docs.python.org/3/library/os.html#os.environ
- **GitHub — Removing sensitive data from a repository** — https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
- **OpenAI — Rate limits guide** — https://developers.openai.com/api/docs/guides/rate-limits

## Lesson: The Request Is the Program

### Part 1 — What a chat product was doing for you

Before you write a request, understand what you are taking over.

When you typed a message into a chat box, five things happened that you did not see. The product **assembled a request** containing your system prompt, the entire prior conversation, and your new message. It **chose the model**, and switched it silently when a newer one arrived. It **streamed** the reply token by token so the first words appeared in under a second. It **retried and smoothed over failures** — when the provider rate-limited you, the product waited and you never knew. And it **tracked your usage** against a quota, in a place you could not read.

Every one of those five is now your job. That sounds like a downgrade, and for a while it feels like one. But notice what they have in common: they are all *decisions*, and the product made them by choosing defaults that suit the median user. You are about to choose values that suit your problem. That is the entire difference between using AI and building with it.

> A chat product is a car with an automatic transmission. The API is the same engine with a manual gearbox and the bonnet open. You will stall it. You will also be able to drive up hills the automatic could not.
>
> Where the analogy breaks: a manual car still has one set of controls. The "API" is not one interface at all — every provider publishes a differently-shaped one, and the shape changes over time. What is stable is the *concept* of the request, not the exact spelling of its fields.

**That last sentence carries the most important warning in this phase.** Everything below describes the shape of an OpenAI-compatible request, because that shape has become the common one and several providers now imitate it. But parameter names, defaults, and limits vary by provider and change without notice. As of 2026-09 the shapes described here are broadly accurate across the major providers — assume some have changed by the time you read this. Before you build anything real, open the provider's current API reference and check the field names. The mechanism below survives that check; the spelling might not.

One more thing the chat product did, less visibly: it never let you make an *invalid* request. The text box could not send a malformed message array. The API can, and will, and that is a lesson you want early.

---

### Part 2 — The anatomy of a request

Here is the smallest useful request body, in the generic shape:

```json
{
  "model": "some-model-name",
  "messages": [
    {"role": "system", "content": "You are a terse assistant. Answer in one sentence."},
    {"role": "user", "content": "Why does the sky look blue?"}
  ],
  "max_tokens": 200,
  "temperature": 0.2
}
```

Four fields, and each one is a decision you are now making.

**`model`** — which weights to run. A string identifier, and the most volatile thing in the request. Providers retire names, point old names at new models, and introduce dated snapshots so you can pin behaviour. Pin an explicit snapshot rather than a floating alias, and read the deprecation notices. **Volatile specific, dated: as of 2026-09, model identifiers across the major providers change frequently and retire on announced schedules; check the current model list before hardcoding one.**

**`messages`** — this is the conversation, and it is the whole conversation.

The statelessness becomes concrete here, and this is what beginners get wrong most often. **The model has no memory. The `messages` array is the memory.** Every turn you resend everything: the system instruction, every prior user message, every prior assistant reply, and the new one. The provider does not store your conversation and hand it back. You are the storage.

That has a measurable consequence, and it connects straight back to Phase 3. **Your input grows every turn.** Turn one might be 200 tokens of input; turn ten, with a long back-and-forth, might be 6,000 — because all nine prior turns are still in the array. Cost grows superlinearly in conversation length even when individual messages stay short. Phase 4 established why the model re-reads that whole prefix every time, and why that is not free even though it is fast.

There are three roles you will meet immediately:

| Role | What it is | Who writes it |
|---|---|---|
| `system` | Standing instructions: persona, constraints, format rules | You, in code |
| `user` | The human's input | Your user, or you |
| `assistant` | The model's previous replies, replayed back | You, copied from prior responses |

The `assistant` role surprises people. To give a model a sense of a prior conversation you do not tell it about the conversation — you *insert* its old replies as if it had said them. You are authoring the model's memory by hand. That is also how tool calls are replayed in the agents track, and why an agent's request grows so fast.

**Order matters and is not normalised.** The array is processed in sequence; a system message placed last is not equivalent to one placed first. Keep it at the top unless the docs say otherwise.

**`max_tokens`** — a ceiling on how many tokens the model may *generate*. It does not limit the input. Set it too low and the response is truncated mid-thought, and the response tells you so via the finish reason. This is a cost and latency control, not a quality control: setting it to 50 does not make the model more concise, it makes it stop.

**`temperature`** — the sampler setting from Phase 5, now exposed as a number. Low values near 0 make output more consistent; higher values make it more varied. Note the careful phrasing: *more consistent*, not *deterministic*. Phase 5 explained why temperature 0 still does not guarantee byte-identical output — batching, hardware arithmetic order, and server-side changes all introduce variation you do not control. If you need exact reproducibility, temperature is not the tool that gets you there.

Fields you will meet next, once you start building:

| Field | What it does | When you reach for it |
|---|---|---|
| `stream` | Returns tokens incrementally instead of all at once | Any user-facing interface |
| `stop` | Strings that halt generation when produced | Forcing a clean boundary in structured output |
| `tools` | Declares functions the model may ask you to run | The agents track |
| `response_format` | Requests a structured shape such as JSON | When you need to parse, not read, the output |
| `top_p` | An alternative sampling control | Rarely — pick temperature or top_p, not both |

**Do not treat that table as a specification.** Names differ across providers, and some fold several of these into one nested object. It tells you what categories of control exist so you know what to look for in the docs; it is not a copy-pasteable schema.

---

### Part 3 — The shape of what comes back

The response is a JSON object. In the generic shape:

```json
{
  "id": "some-request-id",
  "model": "the-model-that-actually-served-this",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "Sunlight scatters off air molecules, and shorter wavelengths scatter more." },
      "finish_reason": "stop"
    }
  ],
  "usage": { "prompt_tokens": 42, "completion_tokens": 18, "total_tokens": 60 }
}
```

Read this as three separate pieces of information, because that is how you should parse it.

**The text is buried, and that is deliberate.** The answer lives at `choices[0].message.content` — not at the top level, because a response may contain several completions and the message object may carry more than text. **Never treat the raw response body as the answer.** Beginners who print the whole object and assume the readable part is "the output" build systems that break the first time the provider adds a field.

**`finish_reason` is not optional information.** It says *why* generation stopped, and the reasons mean very different things:

| Finish reason | Meaning | What you should do |
|---|---|---|
| `stop` | The model finished naturally | Nothing — this is success |
| `length` | It hit your `max_tokens` ceiling | Raise the ceiling, or ask for less; the output is truncated |
| `tool_calls` | It wants you to run a function | Handle the call — agents track |
| `content_filter` | A safety layer intervened | Do not retry blindly; the same input will fail the same way |

`finish_reason: "length"` is not an error and not a shorter answer. It is a **cut-off answer**, and if you skip the field you will silently show users a sentence that stops mid-clause. This is the cheapest correctness check in the whole API surface, and it costs one `if`.

**The `usage` object is your bill, reported by the party sending it.** `prompt_tokens` is what you sent, `completion_tokens` is what was generated, `total_tokens` is the sum. Providers usually price input and output differently — output typically costs more, because generating is more work per token than reading.

Here is what almost everyone learns late: **log these numbers from your very first script.** Not because your first script costs anything meaningful, but because retrofitting accounting into a working system is a rewrite, while adding three lines to a function you are already writing is free. You will need per-feature and per-user accounting the moment you have a real budget, and the numbers only exist if you have been keeping them.

One trap: **do not count tokens yourself by estimating from characters.** Estimates compound their error, especially across languages and code, and they err in the direction that hides cost — Phase 3 covered why tokenisation is irregular. Use the provider's number when it gives you one; when you must count before sending, use a real tokeniser for the specific model family rather than arithmetic on string length.

---

### Part 4 — Making the call, in Python and in JavaScript

Start with raw HTTP rather than a client library. It is more typing, and it teaches you what the library hides, which is the point.

The code below illustrates the *shape*. Parameter names and endpoints differ by provider — substitute your provider's current values rather than copying this verbatim.

```python
import os
import requests

API_KEY = os.environ["AI_API_KEY"]          # never a literal string here
BASE_URL = os.environ.get("AI_BASE_URL", "https://api.example-provider.com/v1")

def ask(question: str) -> dict:
    response = requests.post(
        f"{BASE_URL}/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}",
                 "Content-Type": "application/json"},
        json={
            "model": "your-model-identifier",   # check current docs for this
            "messages": [
                {"role": "system", "content": "Answer in one short paragraph."},
                {"role": "user", "content": question},
            ],
            "max_tokens": 300,
            "temperature": 0.2,
        },
        timeout=60,
    )
    response.raise_for_status()
    return response.json()

if __name__ == "__main__":
    data = ask("Explain what a token is, briefly.")
    usage = data.get("usage", {})
    print(data["choices"][0]["message"]["content"])
    print(f"finish_reason={data['choices'][0].get('finish_reason')}")
    print(f"prompt_tokens={usage.get('prompt_tokens')} "
          f"completion_tokens={usage.get('completion_tokens')} "
          f"total_tokens={usage.get('total_tokens')}")
```

Three things in that script are load-bearing beyond the mechanics.

`os.environ["AI_API_KEY"]` reads the key from the environment. It deliberately **fails loudly** with a `KeyError` if the variable is missing, rather than silently falling back to a placeholder. A missing key should stop the program, not produce a confusing 401 three layers down.

`timeout=60` is not optional. Without a timeout, a stalled connection hangs your program indefinitely. Every network call you write should have one.

`response.raise_for_status()` turns a non-success HTTP status into an exception. This is the seam where error handling attaches, and Part 6 is about what goes in it.

Now the JavaScript equivalent. Node 18 and later have `fetch` built in, so there is no package to install:

```javascript
async function ask(question) {
  const base = process.env.AI_BASE_URL ?? "https://api.example-provider.com/v1";
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.AI_API_KEY}`,  // never a literal
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "your-model-identifier",        // check current docs for this
      messages: [
        { role: "system", content: "Answer in one short paragraph." },
        { role: "user", content: question },
      ],
      max_tokens: 300,
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(60000),      // the JS equivalent of timeout=60
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  console.log(data.choices[0].message.content);
  console.log(`finish_reason=${data.choices[0].finish_reason}`);
  console.log(`total_tokens=${data.usage?.total_tokens}`);
}

ask("Explain what a token is, briefly.");
```

The structural equivalence is exact: authenticate with a header, POST a JSON body containing a model and a messages array, parse a nested content field, read the usage object. Once you see that the two are the same request in different syntax, you have stopped being a Python person or a JavaScript person about this and started being someone who can read an API.

The SDK versions of both are shorter and slightly worse for learning, because the SDK hides the HTTP layer. Do the raw version first, then the SDK version, and notice which decisions it made for you — the default timeout, the retry on some status codes, the base URL. Those defaults are reasonable and invisible, and invisible defaults are how you end up with a system that behaves in ways you cannot explain.

---

### Part 5 — Streaming: perceived speed versus actual speed

Non-streaming is what you just wrote: you send the request, wait for the whole answer to be generated, then receive one JSON object.

That wait is not short. Generating a few hundred tokens takes seconds, and wall-clock time from request to complete response scales with answer length. For a batch job at midnight, that is fine.

For a human watching a screen it is not, and the reason is not that the wait is long. **It is that the wait is empty.** A blank screen for eight seconds reads as "broken"; words appearing within half a second read as "fast", even though the time to the last word is identical.

That is the mechanism: **streaming does not make generation faster. It moves the first visible output much earlier.** The transport is server-sent events — a long-lived HTTP response arriving in pieces, each a small event containing a token or fragment. The MDN page in the resources above explains the transport itself.

The generic shape of a streamed chunk:

```text
data: {"choices":[{"delta":{"content":"Sun"},"index":0}]}
data: {"choices":[{"delta":{"content":"light"},"index":0}]}
data: [DONE]
```

Three differences from the non-streaming response. The key is **`delta`**, not `message`, because each chunk carries only what is new. **There is no complete object at the end** — you concatenate the deltas yourself. **The stream ends with a sentinel**, conventionally `[DONE]`, so you stop reading when you see it rather than when the connection closes.

The Python shape:

```python
def ask_streaming(question: str) -> str:
    collected = []
    with requests.post(
        f"{BASE_URL}/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}",
                 "Content-Type": "application/json"},
        json={"model": "your-model-identifier",
              "messages": [{"role": "user", "content": question}],
              "stream": True},
        stream=True,          # do not buffer the body
        timeout=60,
    ) as response:
        response.raise_for_status()
        for raw_line in response.iter_lines():
            line = raw_line.decode("utf-8") if raw_line else ""
            if not line.startswith("data: "):
                continue
            payload = line[len("data: "):].strip()
            if payload == "[DONE]":
                break
            piece = json.loads(payload)["choices"][0]["delta"].get("content")
            if piece:
                collected.append(piece)
                print(piece, end="", flush=True)
    print()
    return "".join(collected)
```

In JavaScript the equivalent reads `response.body.getReader()`, decodes each chunk, and applies the identical accumulate-split-keep-the-tail pattern below — the loop is structurally the same, only the API names differ.

That `buffer` variable is what everyone gets wrong first. Network chunks do **not** align to line boundaries — a chunk can end halfway through a JSON object. Parse each chunk directly and you get intermittent, maddening `JSONDecodeError`s that appear under load and vanish when you debug. Accumulate and split on newlines yourself, keeping the trailing partial line for the next round.

**Streaming's costs, stated honestly.** You lose the single complete response object. Usage accounting may arrive in a final chunk or not at all, depending on the provider — so check whether yours still reports `usage` when streaming, and be ready to fall back to a tokeniser. Error handling gets harder, because a failure can occur *mid-stream*, after you have shown the user half an answer and after you have been billed for the input. And the accumulation logic must be correct, because a bug there corrupts output subtly rather than crashing cleanly.

**Where streaming stops being the right choice.** Batch jobs, offline processing, and any pipeline where code parses the result and no human sees it. Streaming exists to improve a human's experience of waiting; with no human waiting it adds parsing complexity for nothing. And if you must validate the complete object before acting — before executing a tool call, say — buffering can be the safer choice.

---

### Part 6 — Failure is the normal case

Here is the mental shift this part exists to produce: **a production system making thousands of calls a day will hit rate limits, timeouts and transient server errors every single day.** These are not bugs. They are the steady state of talking to a shared, rate-limited, remote service.

Beginners treat every non-200 as "something is broken, let me retry". That instinct is wrong in both directions: it retries things that must never be retried, and fails to retry things that should be.

The organising question is: **is this failure my fault, their transient fault, or a boundary I have hit?**

| Class | Typical status | Cause | Correct response |
|---|---|---|---|
| Authentication | 401, 403 | Bad, missing, or revoked key; no access to that model | Fix the key. Never retry — it fails identically forever |
| Invalid request | 400 | Malformed body, bad parameter name, unsupported value | Fix the code. Never retry |
| Context length exceeded | 400 or 413 | Input plus requested output exceeds the context window | Shrink the input or the output request. Never retry |
| Rate limit | 429 | Sending faster than your quota allows | Wait and retry, respecting the stated delay |
| Server error | 5xx | Their side, transient | Retry with exponential backoff and a cap |
| Timeout | No response | Network or a slow generation | Retry, but the request may have been billed anyway |

**Rate limits deserve a moment**, because 429 feels like a rejection and is really a scheduling instruction. Providers rate-limit to protect shared capacity, and they usually tell you how long to wait — often via a `Retry-After` header, often alongside headers reporting your remaining quota. Read those rather than guessing. Limits are commonly expressed per minute *and* per day, in requests *and* in tokens, and hitting any one dimension produces the same 429 with a different required fix.

The retry pattern is **exponential backoff with jitter**: wait, then longer, then longer still, but not the same amount each time. The jitter has a purpose. If a thousand clients are rate-limited in the same instant and all wait exactly two seconds, they retry together and re-trigger the limit; randomising the delay spreads them out.

```python
import random
import time

def is_retryable(status_code: int) -> bool:
    # 429 (rate limit) and 408 (timeout) are retryable.
    # 5xx is the server's problem, not yours.
    # 400, 401, 403, 404, 413, 422 are YOUR problem. Fix the request.
    return status_code in (429, 408) or status_code >= 500

def call_with_retry(make_request, max_attempts: int = 5):
    for attempt in range(max_attempts):
        try:
            return make_request()
        except Exception as exc:                     # narrow this in real code
            status = getattr(getattr(exc, "response", None), "status_code", None)
            if status is None or not is_retryable(status):
                raise                                # not retryable: fail fast
            if attempt == max_attempts - 1:
                raise
            # 1, 2, 4, 8, ... capped, plus jitter so clients do not synchronise
            delay = random.uniform(0, min(60.0, 1.0 * (2 ** attempt)))
            print(f"retryable error {status}; sleeping {delay:.2f}s")
            time.sleep(delay)
```

Two design points in that code, both of which people skip.

**There is a cap on attempts.** An unbounded retry loop turns a transient outage into a permanent hang and, worse, a runaway bill. Always have a maximum count and a maximum elapsed time.

**Non-retryable errors are re-raised immediately.** This is the important half. Retrying a 400 five times with backoff produces five identical failures, five log entries, and a five-times-longer wait before the developer sees the bug. Retrying a 401 forever is how you lock your account.

**Context-length exceeded is in the "your fault" bucket and deserves special treatment**, because it is the failure you will hit most often once you build anything real. Your system prompt, your whole messages array, and your requested `max_tokens` must sum to less than the model's context window. When they do not, the request is rejected. The fix is never "retry" — it is one of four strategies:

- **Trim history** — drop the oldest turns, keeping the system prompt and the most recent exchanges. This is what most chat products do, and why a very long conversation starts "forgetting" its beginning.
- **Summarise history** — replace old turns with a compressed summary the model produces itself. Costs one extra call; preserves the gist.
- **Retrieve instead of accumulate** — do not carry the whole document in the array. Using Phase 6's embeddings, fetch only the passages relevant to the current question. This is the premise of the retrieval track, and the context-length error is the concrete pain that motivates it.
- **Reduce the requested output** — a smaller `max_tokens` frees room, since the window covers input and output together.

Knowing which to reach for is a design decision, and your first real taste of the trade-offs the later tracks are about.

**A principle that outlives every specific error code:** log the failure with enough context to diagnose it — the status, the error body, the model, the approximate input size, the request ID. Error payloads are usually informative and usually contain a machine-readable error type. Read them. The most common cause of a wasted debugging afternoon is a developer who discarded the response body and kept only "it returned 400".

---

### Part 7 — The key, the .env file, and the mistake everyone makes

This part is prominent because this is, by a wide margin, the most common beginner security mistake in the field, and the one with a real financial cost.

**An API key is a password that spends your money.** Not a username, not a session token, not a low-stakes identifier. Anyone who has it can make requests billed to you, at whatever rate your account allows, until you notice.

The mechanism of the mistake: a hardcoded key in a source file. The file gets committed. The commit gets pushed to a public repository. Automated scrapers watch public repositories — and hosting platforms' public event feeds — for exactly this pattern, and keys are typically found and used **within minutes**. Not days. Minutes.

```python
# WRONG — this key is now public forever
API_KEY = "sk-abc123realkeygoeshere"

# RIGHT — the key lives in the environment, the code only names it
import os
API_KEY = os.environ["AI_API_KEY"]
```

The danger is not the current version of the file. It is the **history**. Git keeps every commit. Deleting the line and committing again leaves the key fully readable in the repository's past, where it will be found. Reverting, force-pushing, and deleting the branch are all insufficient — the object may persist and may already have been fetched by a fork or mirror.

The other mistake, common enough to name: **relying on the repository being private.** Private repositories are shared with collaborators, CI systems, integrations, and anyone later added or who gains access through a compromised account. They also become public accidentally — a settings change, an organisation migration, a misconfigured fork. The rule is simple: **a key in source control is a compromised key.**

The practice — three files, two of which you commit:

```text
# .env  — NEVER commit this file
AI_API_KEY=your-real-key-here
AI_BASE_URL=https://api.example-provider.com/v1

# .gitignore — commit this
.env
.env.*
*.env
!.env.example

# .env.example — commit this, with fake values only
AI_API_KEY=replace-me
AI_BASE_URL=https://api.example-provider.com/v1
```

```python
# at startup, local development only
from dotenv import load_dotenv
load_dotenv()
```

Commit the `.env.example` because your future self and any collaborator need to know which variables exist. Never commit the `.env`, because it contains real values. That pair is the convention, and it is the convention for a reason.

**Verify your ignore rule actually works, in a throwaway repository, now.** Create a repo, add a fake key, confirm `git status` shows `.env` as ignored, and confirm `git log -p` contains no key. This is practice task 4 below, and the one task in this phase worth doing even if you skip the rest.

**Know what to do if you leak one.** Order matters: **revoke first, clean up second.** Revoking invalidates the key immediately and is the only step that actually stops the bleeding. Cleaning history is slower and pointless while the key still works — do not spend an hour learning `git filter-repo` while a live key is being used.

**Use a separate key per project.** If one leaks you revoke one and the rest keep working; a single shared key means every leak is a full shutdown. Set spending limits where offered, and treat an unexpected usage spike as a security signal, not a billing annoyance.

---

### Part 8 — What the API is, and where it stops

Pull back and state what you have actually built.

**The API is a stateless function.** Text goes in, text comes out, and the response accounts for what it cost. No memory of you, no awareness of your application, no continuity between calls. Every property of a system you build on it — memory, tools, retrieval, planning, cost control — is something *you* construct by shaping the request and interpreting the response. That is not a limitation to work around; it is the design, and it is why the later tracks exist: retrieval is a way of constructing the input, agents a way of looping calls with tools, finetuning a way of changing the function itself.

Four places where the API stops being the right answer:

**When a chat product does the job.** If a human will read the output and act on it, and the interaction is not repeated thousands of times, a chat interface is better: no code, no key, no bill, no maintenance. An integration for a task you do once a week is engineering theatre. The API earns its complexity when you need repetition, automation, or embedding in another system.

**When you need reproducibility you cannot get.** An API call is not a pure function of its input. The model behind a given identifier can be updated on short notice; sampling introduces variation; providers retire names. If you genuinely require identical output for identical input — auditing, regulated workflows, tests asserting exact strings — you need pinned snapshots, careful sampling settings, tolerance-based tests rather than exact-match assertions, and you should expect to re-baseline periodically. You do not get determinism from an API; plan for drift.

**When the data cannot leave.** Sending text to a third-party API is disclosure. If the content is personal data, health information, or client-confidential material, the API path may be unavailable regardless of cost, and a local model becomes the only option. That is a hard boundary, and a legal and ethical one rather than a technical one. The local option in the tools table runs the same request shape, so nothing you learned here is wasted.

**When the economics invert.** At very high volume on very narrow tasks, a small or finetuned local model can be cheaper per call and faster than a large hosted one — the argument the costing and finetuning tracks make properly. And in the other direction, a badly designed loop generates a bill that scales with a bug: an agent retrying a failing tool call in a cycle will spend real money doing nothing. Track usage from day one so this stays a log line rather than an invoice.

Comfort with all four is what "I can build with models" means. Not that you can call an endpoint — that you know what you are buying, what you are giving up, and when to stop.

---

## Hands-on practice tasks

1. Write a minimal script in Python that sends one request and prints only the assistant's text. Time how long it takes end to end. <!-- id: found-08-first-api-call-t01 band: quick energy: low -->
2. Rewrite the same call with `curl` in the terminal, then compare the raw response body against what your script received. Note every field you had been ignoring. <!-- id: found-08-first-api-call-t02 band: quick energy: normal -->
3. Port the call to JavaScript with the built-in `fetch`. Confirm the request body is byte-for-byte equivalent in structure to the Python version. <!-- id: found-08-first-api-call-t03 band: focused energy: normal -->
4. The secret drill: create a throwaway git repo, add a fake key to a `.env`, write the `.gitignore`, and confirm `git status` ignores the file and `git log -p` contains no key. Then deliberately commit the key once, and find it in the history. <!-- id: found-08-first-api-call-t04 band: focused energy: high -->
5. Add a system prompt that constrains the output format strictly — for example, one sentence, no preamble. Verify the constraint holds, then raise the temperature and observe how the constraint degrades. <!-- id: found-08-first-api-call-t05 band: focused energy: normal -->
6. Deliberately trigger a rate limit by firing many requests in a tight loop. Read the error body and any retry headers. Record the exact status code and the provider's stated wait. <!-- id: found-08-first-api-call-t06 band: focused energy: high -->
7. Deliberately trigger a context-length error by sending an oversized input. Then fix it three different ways — trim, summarise, and shrink `max_tokens` — and record which fix preserved the most answer quality. <!-- id: found-08-first-api-call-t07 band: deep energy: high -->
8. Deliberately trigger an invalid-request error by sending a parameter name that does not exist. Confirm the provider's error body names the offending field, then write down why this class must never be retried. <!-- id: found-08-first-api-call-t08 band: quick energy: normal -->
9. Implement exponential backoff with jitter around your call. Prove it works by forcing retries with a stubbed failure. Then add a maximum attempt count and prove that it eventually gives up. <!-- id: found-08-first-api-call-t09 band: deep energy: high -->
10. Convert your script to streaming. Print tokens as they arrive. Measure and record time-to-first-token and total time, and compare both against the non-streaming version. <!-- id: found-08-first-api-call-t10 band: focused energy: normal -->
11. Build a `log_usage()` function that appends model, prompt tokens, completion tokens, total tokens, `finish_reason`, and a timestamp to a file after every call. Run it across ten calls and total the numbers. <!-- id: found-08-first-api-call-t11 band: focused energy: normal -->
12. Send a request whose `max_tokens` is too small to finish the answer. Detect the truncation by inspecting `finish_reason`, print a warning, and note what a system that ignored this field would have shown the user. <!-- id: found-08-first-api-call-t12 band: quick energy: normal -->
13. Run a five-turn conversation in which you resend the whole array each time. Print the reported `prompt_tokens` at every turn and plot how it grows. <!-- id: found-08-first-api-call-t13 band: deep energy: high -->
14. Make an honest cost estimate for a hypothetical app of 5,000 calls a day, using only the token counts you measured, then check it against a current published price list. Note anything that required guessing rather than measuring. <!-- id: found-08-first-api-call-t14 band: deep energy: normal -->
15. Point the same script at a locally served model through an OpenAI-compatible local endpoint, with no API key. Confirm the request body needs almost no change. <!-- id: found-08-first-api-call-t15 band: focused energy: normal -->
16. Write a short "when not to use the API" note for your own project: three cases where you would choose a chat product, a local model, or nothing at all. <!-- id: found-08-first-api-call-t16 band: ongoing energy: low -->

## Common Pitfalls

**Hardcoding the key.** The single most costly beginner error in this field, and the one with the shortest path from mistake to consequence. Keys in public repositories are harvested by automated scanners within minutes. Keep them in the environment, ignore the file, and revoke immediately if one escapes.

**Assuming the model remembers.** There is no session. The `messages` array is the entire memory, and if you do not resend the earlier turns the model has never seen them. Every "why did it forget what I said" question traces back to this.

**Treating `choices[0].message.content` as the whole response.** You then lose `finish_reason`, you lose `usage`, and you start guessing at things the provider was already telling you.

**Ignoring `finish_reason`.** A truncated answer looks like a short answer. If you do not check the field, a cut-off sentence reaches your users looking like a complete one.

**Retrying everything.** Retrying a 400 or a 401 produces identical failures, wastes time, and can lock your account. Retry only rate limits, timeouts, and 5xx. Fail fast on everything else.

**Retrying with a fixed delay.** Without jitter, synchronised clients re-trigger the same rate limit in lockstep. Without a cap, a transient outage becomes an infinite hang.

**Parsing streamed chunks line by line without a buffer.** Network chunks do not respect line boundaries. Keep the trailing partial line and prepend it to the next chunk, or you will get intermittent parse failures that only appear under load.

**Estimating token counts from character length.** Untrustworthy, especially across languages and code, and wrong in the direction that understates cost. Use the provider's `usage` field.

**Adding usage logging later.** It is three lines now and a refactor after you have a working system with a real bill attached. Do it in the first script.

**Treating a 429 as an outage.** It is a scheduling instruction with a stated wait. Read the headers and obey them; do not hammer the endpoint and make it worse.

**Forgetting that context windows cover input and output together.** Setting a large `max_tokens` on an already-large conversation is a reliable way to trigger a context-length error without understanding why.

**Failing to pin the model identifier.** A floating alias can be repointed at a different model, which changes your output, your cost, and your latency without any change to your code.

**Assuming permission is the same as a deadline, in both directions.** A key that works today may be rotated; a free tier that exists today may not. Check the current terms rather than assuming either will hold.

## Deliverable / proof of work

Write `portfolio/foundations/08-first-api-call.md` containing:

- **Your working script**, both the raw HTTP version and one language port, with the key read from the environment. Include the command that runs it.
- **One annotated request and its response** — the JSON you sent and the JSON you got back, with every field labelled with what it means. Mark the three fields you would never omit from a logging line.
- **A screenshot or pasted output of a streamed response**, with your measured time-to-first-token and total time, next to the same two numbers from the non-streaming version.
- **Three triggered failures** — a rate limit, a context-length error, and an invalid request — each with the actual status code, the provider's actual error body, and one sentence on why that class is or is not retryable.
- **Your retry code**, with the backoff, the jitter, the cap, and a demonstration that a non-retryable error fails fast.
- **Evidence of the secret drill** — the `.gitignore` contents, and a note recording whether the key could be recovered from git history after you deliberately committed it.
- **A usage log** with at least ten entries, and your computed total tokens and estimated cost.
- **A section titled "Where I would not use an API"** — three concrete cases from your own context, each with the reason.

## Checklist

- [ ] I can name every field in my request and say what changes if I change it <!-- id: found-08-first-api-call-c01 energy: low -->
- [ ] I have made a working API call from my own code with the key read from the environment <!-- id: found-08-first-api-call-c02 energy: normal -->
- [ ] I can explain why the API is what you build on and a chat product is not <!-- id: found-08-first-api-call-c03 energy: normal -->
- [ ] I can explain that the messages array is the conversation and that the model is stateless between calls <!-- id: found-08-first-api-call-c04 energy: normal -->
- [ ] I can parse the response and extract text, finish reason, and usage separately <!-- id: found-08-first-api-call-c05 energy: low -->
- [ ] I can explain what a truncated response looks like and how finish_reason reveals it <!-- id: found-08-first-api-call-c06 energy: normal -->
- [ ] I have streamed a response and measured time-to-first-token against total time <!-- id: found-08-first-api-call-c07 energy: normal -->
- [ ] I can explain why streaming improves perceived speed without improving actual speed <!-- id: found-08-first-api-call-c08 energy: normal -->
- [ ] I have deliberately triggered a rate limit and read the provider's stated wait <!-- id: found-08-first-api-call-c09 energy: normal -->
- [ ] I have deliberately triggered a context-length error and fixed it three different ways <!-- id: found-08-first-api-call-c10 energy: high -->
- [ ] I can sort common errors into retryable and non-retryable and justify each <!-- id: found-08-first-api-call-c11 energy: high -->
- [ ] I have implemented exponential backoff with jitter and a maximum attempt cap <!-- id: found-08-first-api-call-c12 energy: high -->
- [ ] My API key is not in my source code and my `.env` is in `.gitignore` <!-- id: found-08-first-api-call-c13 energy: normal -->
- [ ] I can explain why deleting a committed key is not enough and what to do instead <!-- id: found-08-first-api-call-c14 energy: normal -->
- [ ] I log prompt tokens, completion tokens, and total tokens from the response on every call <!-- id: found-08-first-api-call-c15 energy: normal -->
- [ ] I can explain why input tokens grow as a conversation continues <!-- id: found-08-first-api-call-c16 energy: normal -->
- [ ] I can state at least three cases where an API is the wrong tool for the job <!-- id: found-08-first-api-call-c17 energy: normal -->
- [ ] I know that parameter names vary by provider and I check current docs rather than assuming <!-- id: found-08-first-api-call-c18 energy: low -->
- [ ] I have run the same script against a local model with no API key <!-- id: found-08-first-api-call-c19 energy: normal -->
- [ ] I can hand a working script to someone else and they can run it knowing only which variables to set <!-- id: found-08-first-api-call-c20 energy: normal -->

## Quiz

### Q1. You send the same request twice and get different text back, with `temperature` set to 0. What is the most accurate conclusion? <!-- id: found-08-first-api-call-q01 energy: high -->

- [ ] The provider is ignoring your temperature setting
- [ ] You have made an error in the request body
- [x] Sampler settings reduce variation but do not guarantee identical output, because batching, hardware arithmetic and server-side changes still differ
- [ ] The model has been updated between the two requests

**Why:** Temperature 0 makes the sampler near-greedy, which removes most variation but not all of it. Floating-point addition order in parallel hardware, what else shares the batch, and any server-side prompt or model change all introduce differences. Structure can be relied on; exact text cannot.

### Q2. A response comes back with `finish_reason: "length"`. What has happened, and what should you do? <!-- id: found-08-first-api-call-q02 energy: normal -->

- [ ] The model refuses to answer — retry with different wording
- [x] Generation stopped at your `max_tokens` ceiling, so the answer is truncated — raise the ceiling or ask for less
- [ ] The input was too long — trim the messages array
- [ ] The response was cut off in transit — retry the same request

**Why:** `length` means the output ceiling you set was reached, not that the input was too large and not that the request failed. The text is a cut-off answer rather than a short one, and the fix is a larger output allowance or a request for a briefer answer.

### Q3. You are building a batch job that processes 10,000 documents overnight with no human watching. Should you stream? <!-- id: found-08-first-api-call-q03 energy: high -->

- [ ] Yes — streaming is always faster and reduces total time
- [ ] Yes — streaming is required for long responses
- [ ] No — streaming is not supported for batch requests
- [x] No — streaming improves a human's perception of waiting, and here it only adds parsing complexity and harder error recovery

**Why:** Streaming moves the first visible output earlier; it does not reduce total generation time. With no human waiting there is no perception to improve, and the chunk-accumulation logic, mid-stream failure handling and loss of a single complete response object are pure cost.

### Q4. Your script has hardcoded the API key, committed it, and pushed to a public repository, then you deleted the line and committed again. What is the situation? <!-- id: found-08-first-api-call-q04 energy: high -->

- [ ] The key is safe because the current version no longer contains it
- [ ] The key is safe because you pushed the fix within a few minutes
- [x] The key remains readable in git history and must be treated as compromised — revoke it immediately, before doing anything about the history
- [ ] The key is safe as long as you force-push to rewrite the branch

**Why:** Version control keeps every commit, so deleting the line hides the key from the current file and not from the repository's past. Automated scanners watch public repositories and find keys within minutes. Revoking invalidates it immediately and is the only step that actually stops the exposure; history rewriting comes after, not before.

### Q5. Your code catches every exception from the API call and retries five times with backoff. A request fails with a 400 stating that a parameter name is unrecognised. What happens? <!-- id: found-08-first-api-call-q05 energy: normal -->

- [ ] The retries succeed because the provider's schema varies between calls
- [ ] The retries succeed after the backoff spreads them out
- [ ] The retries fail, but the logs will show the provider's error body
- [x] Five identical failures, five log entries and a five-times-longer wait before the real bug becomes visible

**Why:** A malformed request is deterministic: the same body fails the same way every time. Retrying it produces no new information and delays diagnosis. Only rate limits, timeouts and server errors should be retried; client errors should be raised immediately.

### Q6. Why does `prompt_tokens` grow on each turn of a conversation even when every message you type is short? <!-- id: found-08-first-api-call-q06 energy: high -->

- [ ] The provider caches your previous requests and bills them again
- [x] The model is stateless, so you resend the whole messages array every turn and all the earlier turns are counted as input
- [ ] The model stores the conversation internally and counts it as context
- [ ] Tokenisation becomes less efficient as the conversation gets longer

**Why:** The API has no session. What looks like memory is the application resending the prior turns, and every one of those tokens is billed as input on every subsequent call. This is why long conversations cost disproportionately more than short ones, and why trimming or summarising history is a cost decision as well as a context one.

### Q7. A request fails with 429. What is the correct interpretation? <!-- id: found-08-first-api-call-q07 energy: normal -->

- [ ] Your key has been revoked and needs replacing
- [ ] Your request body is malformed
- [ ] The model is unavailable and you should switch models
- [x] You have exceeded a quota dimension, and the provider is telling you how long to wait rather than rejecting you permanently

**Why:** A rate limit is a scheduling instruction, not a failure of your request. Providers commonly indicate the wait in a header and often report remaining quota. Read those values and back off with jitter; hammering the endpoint deepens the limit instead of clearing it.

### Q8. You set `max_tokens` to a small value on a long conversation and get a context-length error. Why? <!-- id: found-08-first-api-call-q08 energy: high -->

- [ ] Because `max_tokens` limits the input as well as the output
- [x] Because the context window covers input and output together, so the requested output has to fit alongside the messages you sent
- [ ] Because small `max_tokens` values are rejected by most providers
- [ ] Because the conversation history is counted twice when `max_tokens` is set

**Why:** The window is a single budget shared by the system prompt, the whole messages array, and the space reserved for the response. `max_tokens` does not shrink the input, so a long history plus a generous output allowance can exceed the window even though neither is unreasonable on its own.

### Q9. What is the honest benefit of streaming a chat response? <!-- id: found-08-first-api-call-q09 energy: normal -->

- [ ] Total generation time is reduced because tokens are sent as they are produced
- [ ] The model generates higher-quality tokens when streaming is enabled
- [x] The first visible output arrives much earlier, so the wait feels shorter even though total time is unchanged
- [ ] Token usage is lower because the response is not buffered

**Why:** Streaming is a transport change, not a speed change. The same tokens are produced over roughly the same total time; they simply start arriving sooner. The user-visible win is that an empty screen becomes a filling one, which is why streaming is worth its parsing cost for interfaces and not for batch jobs.

### Q10. You need to count tokens *before* sending a request, to enforce a budget. What is the right approach? <!-- id: found-08-first-api-call-q10 energy: high -->

- [x] Use a tokeniser library for the specific model family, and reconcile against the reported usage after each call
- [ ] Estimate from character count and divide by four
- [ ] Use the `total_tokens` value from your previous request and assume it is close enough
- [ ] Ask the model in a separate call how many tokens the text contains

**Why:** Character-based estimates are unreliable, particularly across languages and code, and they tend to understate cost. Models cannot count their own tokens reliably because they never see the token boundaries. A real tokeniser gives a usable pre-flight number, and the provider's usage field is the authority afterwards.

### Q11. Which pair of statements about the API is correct? <!-- id: found-08-first-api-call-q11 energy: normal -->

- [ ] The API keeps your conversation between calls, and the system prompt is fixed by the provider
- [ ] The API keeps your conversation between calls, and you set the system prompt yourself
- [x] The API is stateless between calls, and you set the system prompt yourself as a field in the request
- [ ] The API is stateless between calls, and the system prompt cannot be changed

**Why:** Statelessness means you resend the conversation every time and the array is the memory. The system prompt, by contrast, is an ordinary field you control — which is precisely why an API integration can have a completely different personality from a chat product running the same underlying model.

## You're ready to move on when...

You have a script you wrote yourself that makes a real request, reads the response properly, and runs without a key anywhere in the source. You have seen all three failure classes with your own eyes — a rate limit, an oversized input, a malformed request — and you can say without checking which of them should be retried and which should not. You have watched a response stream in token by token, and you have logged token usage from the response's own accounting across enough calls to total it. You can explain, in your own words and without notes, why the model has no memory, why the context window covers input and output together, and what an API call gives you that a chat box does not. And you can name at least three situations where you would not use an API at all.

## Free vs Paid

### What's free is enough

You can complete this entire phase — every task, every checklist item, the whole deliverable — at zero cost, and doing so teaches the same mechanics as doing it with a funded account.

Every major provider offers some free tier or trial credit, and several offer genuinely free tiers for smaller or faster models with meaningful rate limits. Local models served through an OpenAI-compatible endpoint go further: they cost nothing per token, need no key at all, and exercise every part of the request and response shape you have learned here. Task 15 exists specifically so you have a no-key path through the whole phase. The one thing a local model does not give you is the experience of a real rate limit with real headers from a commercial provider, and task 6 works better on a hosted provider if you can get even trial credit.

The free path also happens to be the *better* path for one lesson: with no key, the secret-handling material becomes theoretical rather than risky, and you can run the git drill in task 4 as many times as you like with a deliberately fake key.

### What a paid tier adds

Paying for API access buys four specific things, and it is worth being precise about which of them you actually need.

**Higher rate limits and no per-day cap.** This is the real one for this phase. Deliberately triggering a rate limit on a free tier is easy and slightly frustrating; on a funded tier you have enough headroom to run the retry and streaming experiments at a realistic scale. **Volatile, dated: as of 2026-09, free-tier limits and credit amounts differ substantially between providers and change without much notice — read the current pricing page rather than relying on any summary, including this one.**

**Access to the stronger models.** Free tiers tend to serve smaller or older models. For the mechanics in this phase that makes no difference at all; for the retrieval, agent and evaluation tracks it starts to matter.

**Larger context windows.** Free tiers are sometimes capped at a smaller window. Since the context-length error is the failure you are learning to handle, a larger window gives you more room to observe it deliberately rather than by accident.

**Predictable billing you can log against.** Reading usage numbers is more meaningful when they map to real money, and the costing track will expect you to reason about actual prices.

### When it's worth paying

**Not to finish this phase.** Finish it free, including the local-model path. You will learn the request shape, the response shape, streaming, error handling and the security practices identically, and you will have spent nothing.

The honest threshold is the moment you start building something you want other people to use, or you reach the retrieval and agent tracks and need to run enough calls that a free tier's daily cap becomes the thing blocking you. At that point, put a small amount of credit on one account, set a spending limit if the provider offers one, and keep logging usage from the first call — because the moment you are paying, your usage log stops being an exercise and becomes the instrument you steer with.

One caution before you spend anything: check the provider's current terms for whether free-tier inputs may be used for training, and for what data-handling guarantees apply at each tier. Those terms differ between providers, they change, and they matter far more than the price difference once you are sending anything sensitive. For anything confidential, the local model is not the cheap option — it is the only option, and this phase taught you that it runs the same request.
