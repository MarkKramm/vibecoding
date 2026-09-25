# AI Roadmaps

A self-study curriculum for someone starting from **near-zero AI knowledge** who wants to understand the whole AI era — not just how to talk to a chatbot, but what a token is, why a context window is a budget, how retrieval and agents actually work, what fine-tuning does and does not fix, and how to build real software with these tools without losing the ability to tell whether the result is any good.

Built for a **$0 budget** on free tiers and open-weight models, at roughly **1–3 focused hours/day**.

---

## Why this curriculum is shaped the way it is

Most "learn AI" material falls into one of two failure modes.

The first is **vocabulary without mechanism** — a list of terms and a promise that they matter. You learn that "context window" is a thing, you still cannot answer *how much* or *why the cost scales the way it does*, and the first time a real limit bites you have no model of it to reason with.

The second is **tutorial without judgement** — a walkthrough that produces a working demo and teaches nothing about when the demo is wrong. This is the more dangerous one, because it feels like progress. You ship something that runs, and it is confidently incorrect in a way you are not equipped to notice.

This curriculum is written against both. Every mechanism is taught at the level where you could **predict** its behaviour — not just name it — and every track ends with a way to check whether a result is actually good rather than merely fluent.

That second half is not a soft skill. With AI assistance, producing plausible output has become cheap; **the scarce skill is telling plausible from correct.** A curriculum that teaches only generation is training the part of the work that is being automated.

---

## The ten tracks

Ten tracks, **65 phases** in total. They are numbered in reading order, but you do not have to walk them strictly in sequence — see [How to use these tracks](#how-to-use-these-tracks) below.

Every phase in every track is completable **without spending money**. Where a paid mechanism is genuinely unavailable on a free tier, the phase teaches the mechanism and gives you a local or simulated substitute — see [`cost/07`](cost/) for the full zero-budget playbook.

| # | Track | Folder | What it is for | Phases |
|---|---|---|---|---|
| 1 | **Foundations** | [`foundations/`](foundations/) | The vocabulary and mental models everything else assumes: what a model is, tokens, context, attention, sampling | 8 |
| 2 | **Model Internals** | [`model-internals/`](model-internals/) | How inference actually works and what it costs: architecture, KV cache, quantization, serving, the model landscape | 6 |
| 3 | **Prompting** | [`prompting/`](prompting/) | Getting what you want on purpose: instruction design, reasoning techniques, structured output, context engineering | 7 |
| 4 | **Retrieval & RAG** | [`rag/`](rag/) | Giving a model knowledge it was not trained on: chunking, embeddings, vector search, hybrid retrieval, reranking, evaluation | 7 |
| 5 | **Agents & Tools** | [`agents/`](agents/) | Models that act: function calling, the agent loop, multi-agent systems, MCP, sandboxing, agent evaluation | 7 |
| 6 | **Finetuning & Evals** | [`finetuning/`](finetuning/) | Changing the model versus changing the prompt, and measuring whether either helped: LoRA, datasets, LLM-as-judge, regression suites | 6 |
| 7 | **Cost & Efficiency** | [`cost/`](cost/) | Maximising capability per peso: token economics, prompt caching, batching, model routing, provider strategy, local models, **and the zero-budget playbook** | 7 |
| 8 | **Vibecoding Craft** | [`vibecoding/`](vibecoding/) | Building real software with AI agents: context management, verification, review, debugging AI-written code, shipping | 8 |
| 9 | **Safety & Ethics** | [`safety-career/`](safety-career/) | Alignment, misuse, bias, privacy, security, and using these tools honestly | 5 |
| 10 | **Career & Getting Hired** | [`career/`](career/) | Turning the skill into work: what employers actually want, a portfolio that proves judgement, evidence without a job, interviewing and your first 90 days | 4 |
| | **Shared** | [`shared/`](shared/) | Cross-cutting documents: study rules, free resource list, weekly tracker, glossary | — |

> **On the two newest tracks.** `cost/07` exists because free access is the constraint most learners actually face, and it deserves one place that answers "I have nothing to spend — what is my workflow?" The **Career** track exists because skill and employability are not the same thing: the rest of the curriculum builds the capability, and these four phases build the *evidence* of it. The Career track is the intended finish line.

---

## The path, drawn

```text
                    ┌──────────────────────────────────────────┐
                    │  START: you can use a chatbot, that's it │
                    └────────────────────┬─────────────────────┘
                                         │
                    ┌────────────────────▼─────────────────────┐
                    │  1. FOUNDATIONS          (8 phases)      │
                    │  vocabulary + mental models              │
                    │  tokens · context · attention · sampling │
                    └────────────────────┬─────────────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
   ┌──────────▼──────────┐   ┌───────────▼──────────┐   ┌───────────▼──────────┐
   │ 2. MODEL INTERNALS  │   │ 3. PROMPTING         │   │ 7. COST & EFFICIENCY │
   │ (6) how it runs     │   │ (7) getting what you │   │ (6) what it costs    │
   │     and what it     │   │     want on purpose  │   │     and how to spend │
   │     costs to run    │   │                      │   │     less             │
   └──────────┬──────────┘   └───────────┬──────────┘   └───────────┬──────────┘
              │                          │                          │
              │              ┌───────────▼──────────┐               │
              │              │ 4. RETRIEVAL & RAG   │               │
              │              │ (7) knowledge the    │               │
              │              │     model lacks      │               │
              │              └───────────┬──────────┘               │
              │                          │                          │
              │              ┌───────────▼──────────┐               │
              │              │ 5. AGENTS & TOOLS    │               │
              │              │ (7) models that act  │               │
              │              └───────────┬──────────┘               │
              │                          │                          │
              │              ┌───────────▼──────────┐               │
              └─────────────►│ 6. FINETUNING & EVALS│◄──────────────┘
                             │ (6) change the model │
                             │     or prove it      │
                             └───────────┬──────────┘
                                         │
                             ┌───────────▼──────────┐
                             │ 8. VIBECODING CRAFT  │
                             │ (8) build real       │
                             │     software with AI │
                             └───────────┬──────────┘
                                         │
                             ┌───────────▼──────────┐
                             │ 9. SAFETY & ETHICS   │
                             │ (5) the wider frame  │
                             └───────────┬──────────┘
                                         │
                             ┌───────────▼──────────┐
                             │ 10. CAREER & HIRING  │
                             │ (4) turn skill into  │
                             │     evidence and work│
                             └──────────────────────┘
```

**Read the diagram as a dependency graph, not a schedule.** Tracks 2, 3 and 7 can be taken in any order once Foundations is done — they answer three different questions about the same machinery. Tracks 4, 5 and 6 build on Prompting. Track 8 is the one that needs several of the others behind it. Track 9 can be read at any time, including first.

**Track 10 is the finish line but not a gate.** Career & Hiring reads best last, because it asks you to assemble evidence from the deliverables you have already built — but if you are job-hunting now rather than in six months, read it early and treat it as a set of instructions for what to build next.

---

## How to use these tracks

### If you have no money to spend

**Read [`cost/07` — the Freemium Playbook](cost/) first, or at least early.** It is a single phase that answers the question the rest of the curriculum assumes away: *what is my actual workflow when I cannot pay for anything?*

The short version, so you know what you are getting into:

- **Everything here is completable on ₱0.** No phase requires a paid tier.
- **Run models locally** (Ollama, llama.cpp, or LM Studio) for volume work. The cost is your hardware and your time, not money.
- **Use free hosted tiers** for tasks that genuinely exceed what your hardware can do — but know that free tiers often have **different data-retention and training-use terms than paid ones**, so do not put other people's private data through them. See the Safety & Ethics track.
- **Where a paid mechanism is unavailable to you** — prompt caching, batch APIs, reasoning-effort settings — the phase teaches the *mechanism* and gives you a local or simulated substitute. **The concept is separable from the vendor implementation**, and that separation is the whole point.
- **When you eventually do spend,** spend on the experiment that changes a decision, not on convenience. `cost/05` and `cost/06` tell you how to find that moment.

Being free narrows the *breadth of experiments* you can run. It does not narrow what you can *understand*, and understanding is what survives the free tier ending. Foundations, Model Internals, and Prompting are effectively full-strength on zero budget.

### If you have 1 hour a day

Follow the **critical path**: Foundations → Prompting → RAG → Agents → Vibecoding Craft. That is the shortest route to being genuinely useful at building with these tools. Add Cost & Efficiency early if you are paying anything per token — it pays for itself fastest, and `cost/07` in particular assumes you are not.

### If you have 3 hours a day

Run the critical path, and pull Cost & Efficiency and Model Internals in alongside it. Internals is slower reading but it is what turns the rest from recipe into reasoning.

### If your goal is a job

Work the critical path **plus the Career track**, and start the Career track's portfolio discipline *immediately* rather than at the end — its phases tell you what evidence to accumulate while you learn, which is much cheaper than reconstructing it afterwards. The Finetuning & Evals track matters more than its size suggests here: **evaluation is the skill that most distinguishes people who can build from people who can only demo**, and it is the most accessible junior entry point in the field.

### If you already know some of this

Do not start at Phase 1 out of obedience. Read each track's `00-overview.md`, take its first quiz, and only continue if you got something wrong. **The quizzes are diagnostic, not decorative** — getting one wrong is the most efficient thing that can happen to your study plan, because it tells you exactly where to read.

### The rule that matters most

**Do not read a track without building something from it.** Every phase has a `## Deliverable / proof of work` section. An unbuilt deliverable is not a completed phase, however much was read. This field rewards people who can *use* it and punishes people who can only describe it, and the difference shows up the first time something breaks.

---

## Weekly rhythm

| Day | Focus | Time |
|---|---|---|
| Mon | Read the next lesson section; take notes in your own words | 1–2h |
| Tue | Hands-on task from the phase | 1–2h |
| Wed | Read; build the deliverable | 1–2h |
| Thu | Hands-on task; experiment past the instructions | 1–2h |
| Fri | Finish the deliverable; take the quiz; review what you got wrong | 1–2h |
| Sat | **Optional catch-up or rest.** Skipping is a valid outcome | 0–2h |
| Sun | Rest. Actually rest | 0 |

The rhythm assumes **5 days, not 7**. A plan that requires every day is a plan that fails on the first bad week, and the failure then reads as personal rather than structural. See [`shared/study-rules.md`](shared/study-rules.md).

---

## Repository layout

```text
.
├── .editorconfig              # Save-time: UTF-8, LF, indent rules
├── .gitattributes             # Git-time: LF normalization, binary markers
├── .gitignore
├── README.md                  # Project landing page
├── AGENTS.md                  # Guidance for contributors and agents
├── CHANGELOG.md               # Notable changes
├── CONTRIBUTING.md            # Human entry point into the repo
├── LICENSE                    # Content licence
├── .github/workflows/         # CI — content guards and site suites
├── docs/                      # Meta-documentation about the project
├── scripts/                   # Content tooling — build, lint, and guard the Markdown
├── learning-site/             # React + Vite site that renders the curriculum
└── ai-roadmaps/               # The actual study content
    ├── README.md              # This file — the strategy document
    ├── foundations/           # 00-overview + 8 phases + checklist
    ├── model-internals/       # 00-overview + 6 phases + checklist
    ├── prompting/             # 00-overview + 7 phases + checklist
    ├── rag/                   # 00-overview + 7 phases + checklist
    ├── agents/                # 00-overview + 7 phases + checklist
    ├── finetuning/            # 00-overview + 6 phases + checklist
    ├── cost/                  # 00-overview + 7 phases + checklist
    ├── vibecoding/            # 00-overview + 8 phases + checklist
    ├── safety-career/         # 00-overview + 5 phases + checklist
    ├── career/                # 00-overview + 4 phases + checklist
    └── shared/                # Study rules, free resources, weekly tracker, glossary
```

Every track folder contains:

- `00-overview.md` — what the track covers, its timeline, and what it assumes you already know
- `NN-phase-<name>.md` — one numbered phase per file, ordered by the numeric prefix
- `checklist-master.md` — a flat, tickable checklist across the whole track

---

## A note on how fast this material ages

This is the honest caveat, stated up front rather than buried.

**The mechanisms are stable; the specifics are not.** Attention, tokenization, the KV cache, embeddings, chunking, retrieval evaluation, and the reasons prompt caching helps are all durable — they will still be true in five years, because they follow from how the systems are built. Model names, prices, context sizes, benchmark leaderboards, and the current best model for a task change on a scale of **weeks**.

So this curriculum teaches the durable layer carefully and treats the volatile layer as examples to be re-checked. Where a specific number appears, it is dated, and it carries a note that it may have moved. Where a current-state claim cannot be verified, it is marked rather than asserted — see [`docs/CONTENT-GUIDE.md`](../docs/CONTENT-GUIDE.md) for the rule and its reasoning.

**The skill that survives the churn is knowing which layer you are looking at.** Someone who memorised that model X has context size Y is out of date in a month. Someone who understands *why* long contexts degrade, and what to do about it, can evaluate whatever ships next.

---

## Start here

1. Read [`shared/study-rules.md`](shared/study-rules.md) — the anti-burnout rules come first, deliberately.
2. Read this file's [How to use these tracks](#how-to-use-these-tracks) section again, and pick your path.
3. Open [`foundations/00-overview.md`](foundations/00-overview.md).
4. Track progress in [`foundations/checklist-master.md`](foundations/checklist-master.md).
5. Plan each week with [`shared/weekly-tracker-template.md`](shared/weekly-tracker-template.md).
6. Keep [`shared/glossary.md`](shared/glossary.md) open in a second tab. You will need it for the first three tracks, and then you will stop needing it, which is the point.

> **If you only do one thing:** finish Track 1 and Track 8. The first teaches you what these systems are; the second teaches you how to build with them without being fooled. Everything else is depth on those two.
