# HANDOVER — Vibecoding / AI Era Learning Site

**Written:** end of session, 2026-09-18
**Purpose:** Everything a fresh session needs to resume this project without re-deriving anything.
**Repo root:** `C:\Users\zaman\Desktop\CSKramm\Vibecoding`
**Sibling project (source of the proven architecture):** `C:\Users\zaman\Desktop\CSKramm\CS Roadmap`

---

## 0. READ THIS FIRST — the five things that matter most

1. **Git is committed as of this session** (`3f1cab4`, 52 files, clean tree). Two CRLF files were found and fixed during the commit — see §7.3, and watch for this recurring.
2. **The quiz audit is currently FAILING on 4 files, and all 4 were written this session.** I authored most correct answers in position C. This is a real defect, not a guard bug. **Never edit the guard to agree.** See §7.1. This is the only red guard; build and AST audit are green.
3. **No subagents, no workflows.** The user explicitly instructed: *"please dont use subagents"*. Author every remaining file directly, by hand, in the main session. Two workflow runs were attempted earlier and both were cancelled. Do not reintroduce fan-out.
4. **Five tracks are still empty:** `agents`, `finetuning`, `vibecoding`, `safety-career`, and `rag` is 4/7 done. See §6 for the full remaining-work list — 29 phases, plus track files, the site, tests, CI, and docs.
5. **`web_search` is BROKEN in this environment.** It returns HTTP 404 for every query. `web_fetch` works. Only the user can fix it (Settings > Plugins). All research in `docs/research/` was done by fetching primary sources directly.

---

## 1. What this project is

A **learning site + roadmap** teaching vibecoding and the whole AI/LLM era — from what a model is, through tokens, attention, prompting, RAG, agents, fine-tuning, cost mastery, vibecoding craft, and safety/career.

**User's verbatim intent:**
> "what if i will make a learning site and a roadmap as well on learning vibecoding, like learning everything and how to be good at it so i can maximize everything"

**User's situation (shapes every authoring decision):**
- In the Philippines, on a **$0 budget**
- Beginner-to-intermediate
- Had **free API access through a beta on its last day** — wants to learn fast while it lasts
- Accepted large scope: *"its okay if we take so long and go 50+k lines"*

**Architecture decision:** a **separate sibling repo with its own git** (not a track inside CS Roadmap), **adapting CS Roadmap's proven pipeline**: Markdown → build script → generated JSON → React site.

---

## 2. Current verified state (measured, not remembered)

Build report from `node scripts/build-content.mjs`:

```
✓ content build complete
  tracks:        5
  phases:        31
  lesson words:  127,643
  checklist:     557
  quiz qs:       291
  practice:      378
  task ids:      0 minted from position, 378 authored
  task bands:    378 banded, 0 without a band
  search terms:  6,445 across 363 segments
  shared docs:   2
```

Audit status:

| Audit | Status |
|---|---|
| `build-content.mjs --check` | ✅ exit 0 |
| `audit-lesson-ast.mjs` | ✅ exit 0 — 31 lessons, **0 character loss**, 11,104 character gain ⚠️ |
| `audit-quiz.mjs` | ❌ **exit 1 — 4 failures** (§7.1) |

### Phase files on disk, by track

| Track | Folder | Files | Target | Status |
|---|---|---|---|---|
| Foundations | `ai-roadmaps/foundations/` | 8 | 8 | ✅ **COMPLETE** |
| Model Internals | `ai-roadmaps/model-internals/` | 6 | 6 | ✅ **COMPLETE** |
| Prompting | `ai-roadmaps/prompting/` | 7 | 7 | ✅ **COMPLETE** |
| Cost & Efficiency | `ai-roadmaps/cost/` | 6 | 6 | ✅ **COMPLETE** |
| Retrieval & RAG | `ai-roadmaps/rag/` | **4** | 7 | 🟡 IN PROGRESS |
| Agents & Tools | `ai-roadmaps/agents/` | **0** | 7 | 🔴 NOT STARTED |
| Finetuning & Evals | `ai-roadmaps/finetuning/` | **0** | 6 | 🔴 NOT STARTED |
| Vibecoding Craft | `ai-roadmaps/vibecoding/` | **0** | 8 | 🔴 NOT STARTED |
| Safety & Career | `ai-roadmaps/safety-career/` | **0** | 5 | 🔴 NOT STARTED |
| | | **31** | **60** | **29 phases remain** |

### Every phase file that exists

```
ai-roadmaps/foundations/
  01-phase-what-a-model-is.md              (41.3 KB — hand-written reference implementation)
  02-phase-how-models-learn.md
  03-phase-tokens-and-context.md
  04-phase-attention-and-kv-cache.md
  05-phase-sampling-and-determinism.md
  06-phase-embeddings-and-similarity.md
  07-phase-reading-model-outputs.md
  08-phase-first-api-call.md
ai-roadmaps/model-internals/
  01-phase-inference-anatomy.md
  02-phase-transformer-architecture.md
  03-phase-kv-cache-in-depth.md
  04-phase-quantization.md
  05-phase-serving-and-throughput.md
  06-phase-model-landscape.md
ai-roadmaps/prompting/
  01-phase-anatomy-of-a-prompt.md
  02-phase-few-shot-and-examples.md
  03-phase-chain-of-thought-and-reasoning.md
  04-phase-structured-output.md
  05-phase-context-engineering.md
  06-phase-prompt-chaining.md
  07-phase-prompt-failure-modes.md
ai-roadmaps/cost/
  01-phase-token-economics.md
  02-phase-prompt-caching.md
  03-phase-batching-and-async.md           (written this session)
  04-phase-model-routing.md
  05-phase-monitoring-and-caps.md
  06-phase-local-vs-api.md
ai-roadmaps/rag/
  01-phase-why-retrieval.md                (written this session)
  02-phase-ingestion-chunking.md           (written this session)
  03-phase-embeddings-vector-search.md     (written this session)
  04-phase-hybrid-search-reranking.md      (written this session)
```

### Directory inventory

```
Vibecoding/
├── .git/                       (initialised, NO COMMITS)
├── .editorconfig               ✅
├── .gitattributes              ✅
├── .gitignore                  ✅
├── .research/                  ⚠️ EMPTY — delete or use
├── ai-roadmaps/
│   ├── README.md               ✅ strategy doc: 9 tracks, 60 phases, dep graph
│   ├── shared/
│   │   ├── study-rules.md              ✅ (10 anti-burnout rules)
│   │   └── weekly-tracker-template.md  ✅
│   │   └── resource-list.md            ❌ MISSING (registered in SHARED_DOCS)
│   │   └── glossary.md                 ❌ MISSING (registered in SHARED_DOCS)
│   └── <9 track folders>        (5 have phases, 4 empty)
├── docs/
│   ├── CONTENT-SCHEMA.md       ✅ the machine contract
│   ├── CONTENT-GUIDE.md        ✅ authoring rules
│   ├── PHASE-TEMPLATE.md       ✅ copyable skeleton
│   ├── VERIFIED-FACTS.md       ✅ fact-check backbone
│   └── research/               ✅ 4 docs, ~277 KB total
│       ├── llm-reference-document.md                          (131.4 KB)
│       ├── fact-verification-report.md                        (49.4 KB)
│       ├── tokenization-fact-check.md                         (39.4 KB)
│       └── fact-check-embeddings-vector-search-quantization.md (56.9 KB)
├── learning-site/
│   └── src/data/generated/     ⚠️ ONLY generated JSON — no React app yet
│       ├── tracks.json         (1.8 KB, 9 tracks)
│       ├── shared.json         (24.9 KB)
│       ├── search.json         (235.8 KB)
│       ├── foundations.json / model-internals.json / prompting.json
│       ├── cost.json / rag.json
│       └── lessons/*.json      (31 lesson ASTs)
└── scripts/
    ├── lesson-ast.mjs          ✅ Markdown → typed block AST
    ├── build-content.mjs       ✅ main build
    ├── search-index.mjs        ✅ inverted index, base36 delta encoding
    ├── shared-content.mjs      ✅ shared doc registry
    ├── audit-lesson-ast.mjs    ✅ independent markup stripper + char multiset check
    └── audit-quiz.mjs          ✅ 3 check classes incl. answer-position skew
```

---

## 3. Toolchain

- Node **v24.19.0**, npm **11.17.0**
- Git **2.55.0.windows.5**, Windows/PowerShell
- **LF line endings enforced**, UTF-8 no BOM, real typographic characters

### Commands

```powershell
cd "C:\Users\zaman\Desktop\CSKramm\Vibecoding"
node scripts/build-content.mjs           # full build + report
node scripts/build-content.mjs --check   # validate only
node scripts/audit-quiz.mjs              # quiz structure + position balance
node scripts/audit-lesson-ast.mjs        # AST fidelity
```

**PowerShell gotcha:** `build-content.mjs` writes track-absence notes to **stderr**, which PowerShell renders as a red `NativeCommandError` block. This is **not** a failure. Use `2>$null` and check `$LASTEXITCODE`:

```powershell
node scripts/build-content.mjs --check 2>$null; Write-Host "exit: $LASTEXITCODE"
```

---

## 4. The content contract (memorise this — the build fails otherwise)

Full detail in `docs/CONTENT-SCHEMA.md`. The parts that actually cause failures:

### 4.1 Front-matter (exact field set)

```yaml
---
id: rag-03-embeddings-vector-search
track: rag
phase: 3
order: 30
title: Embeddings and Vector Search
duration: 1 week
duration_weeks: 1
energy_mix: [low, normal]
deliverable: portfolio/rag/03-embeddings-vector-search.md
exit_criteria: >
  Folded scalar here.
---
```

### 4.2 The 11 mandatory `## ` sections, in this order

```
## Goal of this phase
## Estimated time
## Skills you'll gain
## Specific topics to learn          (optional)
## Tools for This Phase
## Free/cheap resources
## Lesson: <title>
## Hands-on practice tasks
## Common Pitfalls                   (optional)
## Deliverable / proof of work
## Checklist
## Quiz
## You're ready to move on when...
## Free vs Paid
```

> ⚠️ **Mid-lesson `## ` headings MUST be inside a fence**, or the parser reads them as phase structure and validation fails.

### 4.3 Tools table — EXACTLY 6 columns

```markdown
| Tool | Purpose | Cost | Link | Task | Free alternative |
|---|---|---|---|---|---|
| ... | ... | ... | https://... | ... | ... |
```

Every row whose Cost mentions paid/freemium/$ **must name a free alternative** in the last column. Real https URLs only.

### 4.4 IDs — authored, stable, never minted

```markdown
<!-- checklist -->
- [ ] Item text <!-- id: rag-03-c01 energy: low -->

<!-- practice task — FIELD ORDER IS FIXED: id, then band, then energy -->
1. Task text <!-- id: rag-03-t01 band: quick energy: normal -->

<!-- quiz -->
### Q1. Question <!-- id: rag-03-q01 energy: normal -->
```

- `band` ∈ `quick | focused | deep | ongoing`
- `energy` ∈ `low | normal | high`
- Exactly one space after each colon.
- **Build report must always say `0 minted from position`.** Positional minting is a counted fallback; a non-zero value means IDs are not stable and persisted progress would break.

### 4.5 Quiz format

- `### Q<n>.` heading with an authored id
- **At least 4 options** (corpus uses 4)
- **Exactly one `- [x]`**, rest `- [ ]`
- A `**Why:**` line after the options
- ≥3 options required by the validator

### 4.6 AST invariants

`scripts/lesson-ast.mjs` parses to typed blocks (`para`, `heading`, `code`, `quote`, `table`, `list`) with two invariants: **nothing is dropped**, and **heading IDs are unique**.

### 4.7 Fence rule (this bit me)

A ```` ``` ```` opener **must be on its own line**. If it is glued to the end of a prose sentence, pairing breaks and *every section after it disappears* from the parse. This caused a real failure in `cost/05-phase-monitoring-and-caps.md`.

---

## 5. The volatility rule (non-negotiable)

**Teach durable mechanisms. Date and flag every volatile specific. Never let a lesson's conclusion depend on a volatile number.**

| Durable (teach freely) | Volatile (date + flag + non-load-bearing) |
|---|---|
| Attention is quadratic in sequence length | Any specific context window size |
| KV cache grows linearly with tokens | Any specific price per million tokens |
| Cosine similarity, BM25, RRF | Any specific model name or version |
| Prompt caching works by prefix reuse | Any specific discount percentage |
| LoRA: `W = W0 + B*A` | Any specific GPU hour cost |

The provider landscape **has already moved past the original brief** (live docs showed `gpt-6-astra`, Claude Fable 5.1 / Opus 5 / Sonnet 5, Gemini 3.8 Flash, Assistants API sunset 26 Aug 2026). **Do NOT hardcode a model matrix** — concepts are stable for years, model names and prices are not stable for months.

---

## 6. Remaining work

### 6.1 Content — 29 phase files

**RAG track (3 remaining, target 7):**

| # | Slug | Title | Must teach |
|---|---|---|---|
| 5 | `metadata-rag-evaluation` | Metadata Filtering and RAG Evaluation | Access control as a retrieval filter, never a prompt instruction; pre-filter vs post-filter. **Evaluate retrieval and generation separately.** Recall@k (most important), Precision@k, MRR, nDCG. RAGAS (arXiv:2309.15217): faithfulness, answer relevance, context precision/recall — note it inherits LLM-judge biases. The master diagnostic: inject the known-correct chunk → if it answers, retrieval is broken; if it still fails, generation is broken. And the reverse: remove context, quality should drop. |
| 6 | `rag-debugging` | Diagnosing RAG Failures | Symptom → cause → diagnostic → fix table: retrieval miss, wrong-source citation (verify citations **in code**, number chunks, require chunk IDs), model contradicting the doc, correct-for-wrong-reason (memorisation — remove context, re-ask), irrelevant chunks, duplicated chunks, good retrieval but bad answer, facts split across chunks. Plus a concrete ordered walkthrough of one bad answer. |
| 7 | `graphrag-advanced` | When RAG Is Not Enough | Global/thematic questions no single chunk answers. **GraphRAG (Edge et al., arXiv:2404.16130)** — entity graph, community detection, pre-generated summaries, map-reduce at query time — with an **honest assessment: expensive, targets only global questions, do NOT start here.** Multi-hop retrieval. Cheaper map-reduce-summarize-top-k alternative. Decision framework for escalating from plain RAG. |

**Agents track (7, target 7) — ALL TO WRITE.** Prefix `agent-`. Folder `ai-roadmaps/agents/`:

| # | Slug | Title | Must teach |
|---|---|---|---|
| 1 | `what-is-an-agent` | What an Agent Actually Is | Strip the marketing. Agent = **loop** around an LLM + tool schemas + **stopping condition**. No loop → pipeline; no stopping condition → runaway. **Loops amplify both capability and error** (compounding). Start with fewest steps; often one. "Agentic" is a spectrum: fixed pipeline → single tool call → bounded loop → autonomous. Prefer the leftmost. |
| 2 | `tool-calling` | Tool Calling Mechanics | You define schemas; model emits name + JSON args; **YOUR CODE executes — the model never executes anything**; you return the result. Description **is** prompt engineering. Fewer tools = better selection. **Validate args in code** and return actionable errors into the loop (cheap reliability win). Return concise results (a 100k-token tool dump destroys the context). Prefer narrow safe tools over `run_shell`. Parallel calls + idempotency (retries may double-execute). |
| 3 | `agent-loop-patterns` | The Agent Loop and Planning | **ReAct (arXiv:2210.03629)** — interleave reasoning + actions; beats pure CoT (hallucinates) and pure acting (unfocused). Loop hygiene (**all mandatory**): hard step cap, token/cost cap, wall-clock timeout, loop detection (identical repeated calls), progress check, trace everything. Plan-and-execute (plan strong model, execute cheap). **Reflexion (arXiv:2303.11366)** — verbal self-reflection; **requires a reliable failure signal** (tests, compiler) or reflection is guessing. For coding agents, tests are that signal. |
| 4 | `subagents-isolation` | Subagents and Context Isolation | The strongest reason multi-agent helps is **context isolation**: subagent explores 100k tokens, returns 500. Cost: parent must write a **complete self-contained brief** (no shared memory). Use for self-contained, explorable, parallelizable tasks. Design rules: bounded verifiable deliverable, structured results, **VERIFY** (subagent is confidently wrong and parent can't see reasoning), cap steps, no concurrent mutable state. Honest assessment of multi-agent debate/orchestrator: compounding error + sycophantic convergence. |
| 5 | `agent-memory` | Memory and State in Agents | Working (context), episodic (past attempts), semantic (durable facts), procedural (skills loaded on demand). **Most robust pattern: externalize state to files** (plan, progress, decisions) → survives compaction and session boundaries, and is inspectable. Keep memory structured and validated, retrieve not stuff, **writes auditable and privileged (memory poisoning from untrusted content)**. Handoff-note pattern from Prompting Phase 5 generalized. |
| 6 | `safety-human-in-loop` | Agent Safety and Human Approval | **The most reliable safety mechanism is a human gate, not a prompt instruction.** Approval required for: irreversible actions, money/production/external accounts, outbound network, broad-scope ops, uncertain actions. Show the **EXACT action** not a summary; default deny/read-only; make low-risk approval cheap and high-risk mandatory (else users click yes reflexively and the gate is theatre); batch-approve a plan; log approvals; dry-run mode. Sandboxing: process/FS isolation (containers), FS scoping **enforced in code**, network egress allowlist (classic exfil = markdown image links), no ambient credentials, resource/token caps, tool least privilege, **assume ingested content is hostile**, never auto-merge agent code to prod. **Indirect prompt injection (Greshake arXiv:2302.12173)**; **instruction hierarchy (Wallace arXiv:2404.13208)**. Defensive framing. |
| 7 | `mcp-and-evaluation` | MCP and Evaluating Agents | **MCP (Model Context Protocol, modelcontextprotocol.io)** — open-source integration standard, "USB-C for AI apps", turns M×N into M+N; server exposes tools/resources/prompts; **not a model, not a framework, a standard**. Writing a small MCP server = portfolio-worthy $0 project. Security: expands capability → expands attack surface; only trusted servers; server tool descriptions are injected into the prompt. **Agent evaluation:** end-to-end task success rate on a fixed suite; efficiency (steps/cost); a **failure taxonomy** (wrong tool, bad args, hallucinated success, gave up, wrong plan, context overflow — the distribution tells you what to fix); trajectory quality; **the impossible-task test** (does it honestly report the blocker or fabricate success?); variance — run each task multiple times, report **pass^k not pass@1**; **check success BY CODE** (tests, state), not by the agent's self-report. |

**Finetuning track (6, target 6) — ALL TO WRITE.** Prefix `ft-`. Folder `ai-roadmaps/finetuning/`:

| # | Slug | Title | Must teach |
|---|---|---|---|
| 1 | `when-to-finetune` | When to Fine-Tune, and When Not To | Decision framework **FIRST** — honest answer is usually "don't", but know why. Ordered questions: better prompt? → give it the information (RAG/context)? → a tool? → **only then** fine-tuning. Core distinction: **fine-tuning changes BEHAVIOUR (style, format, tone, narrow task competence); it is a poor way to inject FACTS** (expensive, goes stale, can't cite, often fails to memorise). Five underestimated costs: dataset construction (~80% of work), compute, evaluation, deployment, **maintenance forever** (every base-model update re-opens it). Distillation is where it genuinely wins. Cases where it IS right: high-volume narrow stable task + you have data, evals, cost pressure. |
| 2 | `lora-and-peft` | LoRA, QLoRA and PEFT | Full FT memory (weights + grads + two Adam moments + activations ≈ 3–4× inference) and catastrophic forgetting. **LoRA (arXiv:2106.09685): `W = W0 + B*A`**, W0 frozen, A random-init, **B zero-init so training begins exactly at pre-trained behaviour**; rank r ≪ min(d,k); trainable params **d*k → r*(d+k)**; low-intrinsic-rank finding; **mergeable → NO added inference latency**. Hyperparameters: r (capacity), alpha (scaling, alpha/r), target_modules (often matters more than r), dropout. **QLoRA (arXiv:2305.14314):** NF4 + double quantization + paged optimizers; **65B on one 48GB GPU** — this is what makes FT possible on consumer/free hardware. LoRA/QLoRA inherently reduce forgetting (base frozen). **ALWAYS compare against the untuned baseline** and check general capability for forgetting. |
| 3 | `datasets-and-training` | Datasets and Running a Fine-Tune | The 80% that is data. Define the behaviour precisely first (can't write it down → can't build a dataset). Collect **REAL** inputs, not invented. Gold outputs (human-written, or model-generated then **human-VERIFIED** — verification is the skipped step). Format in the model's **EXACT chat template** (wrong = classic silent failure: loss falls, outputs subtly wrong). Deduplicate; balance; **split train/val BY SOURCE not randomly**; include hard cases and "I don't know" cases. Quality ≫ quantity (QLoRA's own framing). Sizing: no universal number, start with a few hundred, add where evals show failures. Overfitting symptoms; **1–3 epochs is often right for instruction tuning**. Free-hardware workflow: Colab/Kaggle GPUs, Unsloth vs transformers+peft+trl, **checkpoint to persistent storage (free sessions die)**, honest ceilings of small models. Warn: training on model-generated data collapses diversity without aggressive filtering; licence/ToS restrictions on distilling commercial APIs. |
| 4 | `evaluation-fundamentals` | Evaluation Fundamentals | **Highest-leverage skill in the curriculum and the most skipped.** Problem: stochastic high-dimensional outputs → impressions of a few outputs are a terrible estimator; vibes-based dev produces systems that demo well and regress silently. Golden dataset: REAL inputs, 20–50 to start, **objective pass criterion per case**, prefer programmatic checker over a judge, include negative + adversarial cases, dev/test split, version in git, **grow from every production failure**. **LLM-as-judge (arXiv:2306.05685): >80% agreement with human preference**, but named biases (position, verbosity, self-enhancement) and mitigations (swap positions and require consistency, use a **DIFFERENT model family** as judge, give a rubric, supply a reference answer, require evidence quotes, force structured verdict, pin judge version). Governing principle: **code beats judge whenever the outcome is checkable.** Human eval: pairwise, blinded, randomized order, rubric, inter-rater agreement (you can be your own blinded rater). Why benchmarks mislead: contamination, Goodhart, saturation, task mismatch. Regression testing: version prompts, pin model versions, run full suite on every change, track cost+latency alongside quality, beware "fixing" an expectation to launder a regression. |
| 5 | `distillation` | Distillation and Small Models | Classic KD (match output distributions) vs **sequence-level/data distillation** (train on generated outputs) — most LLM distillation in practice is the latter. Workflow: representative inputs → run teacher → **FILTER AND VERIFY** (where quality is won/lost) → QLoRA a small open-weight model → evaluate against **both** teacher and untuned student. Caveats: cannot exceed the teacher and inherits its flaws concentrated; works for narrow well-specified tasks not general capability; self-distillation risks diversity collapse without strong filtering; **ToS may prohibit training on a commercial provider's outputs — read them, it's contractual**. Economics: a distilled small model handling the easy majority is how a paid workload becomes affordable; pairs with routing + local models in Cost track. |
| 6 | `running-evals-in-practice` | Running Evals in Practice | Turn evaluation into a habit. Minimal harness: per case run system → apply checker → record result/output/tokens/latency → report pass rate with per-case deltas vs baseline. **~100 lines, no framework**, and the most common failure is not starting because it feels too big. Cost control: batch APIs are the cheapest way to run a large suite; cheap model to iterate, strong model to validate. Handling failure: **classify it** (retrieval, generation, format, refusal, harness bug), fix one thing at a time, re-run. Trap: tuning on the test set. Non-determinism: run each case multiple times, report stability — **a prompt that passes 60% of the time is a different product from one that passes 100%**. Connect to the reader: **an eval suite is what lets you change models when free access ends** — it converts a scary migration into a measured one. Escalation ladder: code check > reference answer check > rubric judge > no check. |

**Vibecoding track (8, target 8) — ALL TO WRITE.** Prefix `vibe-`. Folder `ai-roadmaps/vibecoding/`:

| # | Slug | Title | Must teach |
|---|---|---|---|
| 1 | `what-vibecoding-is` | What Vibecoding Actually Is | Honest definition: building software by directing models in natural language and iterating on results, vs traditional line-by-line authorship. What it makes easy (boilerplate, unfamiliar APIs, CRUD, tests, refactors) and what it makes **deceptively easy** (plausible-looking wrong code). The central danger: **code you cannot read is code you cannot own.** Efficient vs reckless use, from `using-ai-honestly` (safety track). The spectrum from autocomplete → chat → agentic. Set the thesis for the track: **speed is real, so is the illusion of progress; the skill is telling them apart.** |
| 2 | `specification-and-intent` | Specification and Intent | The bottleneck is not generation, it is **specification**. If you cannot state what "done" means, no model can build it. Cover: writing a spec an agent can execute (goal, constraints, non-goals, acceptance criteria, edge cases, what must not change); the "definition of done" checklist; decomposing into verifiable increments; stating constraints explicitly (language, libraries, style, must-not-break); why ambiguity produces plausible wrong output rather than an error. Practice: converting a vague wish into an executable brief. |
| 3 | `reading-generated-code` | Reading and Reviewing Generated Code | The core survival skill. You must be able to read what you shipped. Cover: reviewing at the right altitude (structure/contracts first, line detail second); red flags (silent exception swallowing, invented API methods, off-by-one boundaries, missing error paths, hardcoded secrets, N+1 queries, wrong auth checks, race conditions); **verify the API exists** — models invent plausible method names; check imports resolve; run it, don't just read it. The rule: **you own every line, regardless of who typed it.** |
| 4 | `tests-as-the-contract` | Tests as the Contract | Tests are how you make AI-generated code trustworthy. They are also the **feedback signal agent loops need** (ties to Agents Phase 3 Reflexion). Cover: writing the test first as a specification; asking the model to write tests **from the spec, then implement against them**; the danger of model-written tests that merely assert current behaviour (a test that passes because it was written to pass proves nothing); property/invariant tests; using tests as the gate for accepting a diff. Practical: a workflow where tests are the acceptance criterion, not the model's self-report. |
| 5 | `debugging-with-ai` | Debugging With and Without AI | Debugging is where AI helps least and misleads most, because a model does not have your runtime. Cover: **form a hypothesis before asking** — otherwise you accept the first plausible story; the model's failure mode is confident diagnosis from insufficient evidence; give it real evidence (full traceback, the actual input, the state); the bisection habit (narrow the failure yourself, then ask about the narrowed thing); when to stop asking and start reading; "explain this error and what would cause it" vs "fix this" (the former teaches, the latter hides); resisting the loop of accepting fixes you don't understand. |
| 6 | `context-management-for-coding` | Managing Context in a Coding Session | Why long coding sessions degrade: context fills with dead ends, stale plans, and superseded code, and the model starts contradicting itself. Cover: externalize state to files (plan, decisions, progress) — the `agent-memory` pattern; start fresh sessions at natural boundaries with a handoff note rather than dragging history; keep the working set small (open the files that matter); avoid pasting whole files when a function suffices; re-state constraints after compaction; **when to reset vs when to continue**. Ties to Prompting Phase 5 and Cost Phase 2. |
| 7 | `working-with-agents` | Working With Coding Agents | Practical craft for agentic tools (Claude Code-style, IDE agents). Cover: giving a bounded task with a verifiable end state; letting it explore vs pinning the approach; reviewing diffs rather than trusting summaries — **the agent's report is a claim, the diff is the evidence**; committing before an agent run so you can revert; small increments over one big run; when a task is too big (decompose) or too ambiguous (specify); watching for scope creep in the diff; the "did it actually run the tests" check. Ties to Agents track heavily. |
| 8 | `responsible-vibecoding` | Shipping What You Build | Turning vibecoded work into something defensible. Cover: security review for generated code (**the top real risks**: hardcoded secrets, missing authz, injection, dependency supply chain, unsafe deserialization); dependency hygiene (models suggest abandoned or malicious packages — verify); licences of generated code and of dependencies; **disclosure norms** (ties to `using-ai-honestly`); maintainability — will you understand this in six months; writing the README and the honest writeup; the portfolio argument: **one deep project with tests and an eval suite beats five demos**. Finish by connecting to the Safety track. |

**Safety & Career track (5, target 5) — ALL TO WRITE.** Prefix `safe-`. Folder `ai-roadmaps/safety-career/`:

| # | Slug | Title | Must teach |
|---|---|---|---|
| 1 | `how-models-go-wrong` | How Models Go Wrong | A **builder's** taxonomy, constructive and mechanism-first. Hallucination restated as a system risk; **sycophancy (Sharma et al., arXiv:2310.13548)** and why preference training produces it; bias/representational harm — from training-data distribution, not malice, and hard to measure; failure to know what it doesn't know; distributional shift. For each: mechanism, how it shows up in a product, how a builder detects it, what mitigation actually works. Emphasise these are **system** properties, so the fix is usually system design (verification, grounding, human review, monitoring) rather than a better prompt. |
| 2 | `security-and-privacy` | Security, Privacy and Data | **Indirect prompt injection (Greshake et al., arXiv:2302.12173)** taken seriously: processed data can carry instructions; demonstrated data theft and worming. **Instruction hierarchy (Wallace et al., arXiv:2404.13208)** — a mitigation, not a guarantee. Defence in depth. Data handling: what leaves your machine, provider retention and training-use terms, **why free tiers often have different data terms than paid**. **Philippine Data Privacy Act of 2012 (RA 10173)** as a REAL compliance obligation — purpose limitation, consent, security, breach notification. Secrets management (never commit keys; env vars; rotate on exposure; **git history keeps what you deleted**). Finish with a builder's checklist. |
| 3 | `alignment-and-limits` | Alignment, Capability and Honest Limits | Sober, no hype in either direction. What alignment means technically (systems doing what operators and users intend, including when those conflict). **RLHF (arXiv:2203.02155)** and why the **KL penalty exists**; **Constitutional AI / RLAIF (arXiv:2212.08073)**; where sycophancy comes from as a side effect of preference optimisation. **Reward hacking / specification gaming** — optimising a proxy diverges from the goal — with concrete small examples. The honest capability/risk debate **without resolving it**: the positions, the uncertainty, why a builder should care about direction-of-travel rather than predictions. Conceptual evaluation of dangerous capabilities and why claims must be measurable. **Most importantly: a section on NOT over-claiming** — distinguishing measured results from extrapolation in your own writing and portfolio, because credibility is built by being right about small things. |
| 4 | `using-ai-honestly` | Using AI Honestly | Practical, not preachy. Attribution and disclosure (when to say you used AI; norms still forming). **What is actually cheating in learning vs efficient use** — clear framework: using AI to *skip the struggle* vs using it to *check understanding after struggling*. The difference between AI-assisted work you can defend and work you cannot — the test: **"could I explain, debug, and extend this myself?"** Plagiarism vs generation. **Skill atrophy** — which competences weaken if you never do the work (reading unfamiliar code, debugging without hints, writing from a blank page, estimating difficulty). Honesty in the other direction too: not claiming credit you didn't earn, not hiding permitted tool use. Finish with a **personal policy template** the reader writes for themselves. |
| 5 | `career-in-ai-era` | A Career in the AI Era | Turning the curriculum into legible capability. What differentiates people now that generation is cheap: **JUDGEMENT** (telling plausible from correct), verification skill, systems thinking, specification ability, domain knowledge. The durable-vs-volatile distinction applies to **skills** too. Portfolio: ship real things, write up what you built and what broke and how you knew it worked; **one deep project with an eval suite beats five demos**; the deliverable folders in this curriculum **ARE** the portfolio. Writing about your work honestly (measured claims, dated specifics, admitted gaps). Job landscape in **the Philippines and remote**: roles around these systems (AI engineering, data work, evaluation, solutions, support, integration), which are accessible junior, how to present AI skills without overselling. Staying current without drowning: few high-signal sources, follow mechanisms not leaderboards, re-check volatile specifics when used, **monthly cadence not daily**. Finish with a concrete 90-day plan. |

### 6.2 Track-level files still owed

- **9 × `00-overview.md`** — one per track
- **9 × `checklist-master.md`** — one per track
- **`ai-roadmaps/shared/resource-list.md`** — registered in `SHARED_DOCS`, currently missing
- **`ai-roadmaps/shared/glossary.md`** — registered in `SHARED_DOCS`, currently missing

> Both shared docs are in the `SHARED_DOCS` registry in `scripts/shared-content.mjs`. The build currently reports `shared docs: 2` (the two that exist). It **fails on unregistered `.md` files**, so add the file *and* register it.

### 6.3 The learning site — not started

`learning-site/` currently contains **only** `src/data/generated/`. There is no `package.json`, no Vite config, no React code.

Still to build: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, components (lesson renderer / `LessonBlock`, dashboard, checklist, quiz, search, notes, today view, tools library), hooks, `src/lib/`, `src/styles/tokens.css` + `global.css`, `src/data/roadmaps.js`.

### 6.4 Test suites — not started

`test:smoke`, `test:data`, `test:render-inline`, `test:highlight`, `test:search`, `test:lesson-search`, `test:quiz`, `test:today`, `test:ui`, `test:browser`.

### 6.5 CI — not started

`.github/workflows/` with **two jobs**: `content-integrity` (no install needed) and `learning-site`.

### 6.6 Meta-docs owed

`docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/CHECKPOINT.md`, `docs/WORKFLOW.md`, `docs/SETUP.md`, `docs/TROUBLESHOOTING.md`, `docs/ROADMAP.md`, `docs/DESIGN-SYSTEM.md`

### 6.7 Root files owed

`README.md`, `AGENTS.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`, `netlify.toml` (optional)

---

## 7. Known defects to fix

### 7.1 ❌ Quiz answer-position skew — 4 files (BLOCKING, introduced this session)

`node scripts/audit-quiz.mjs` exits 1 with:

```
✖ quiz audit failed — 4 problem(s)

  ai-roadmaps/cost/03-phase-batching-and-async.md      — 7 of 8 correct answers in position C (88%, ceiling 50%)
  ai-roadmaps/rag/01-phase-why-retrieval.md            — 6 of 8 correct answers in position C (75%, ceiling 50%)
  ai-roadmaps/rag/03-phase-embeddings-vector-search.md — 5 of 8 correct answers in position C (63%, ceiling 50%)
  ai-roadmaps/rag/04-phase-hybrid-search-reranking.md  — 5 of 8 correct answers in position C (63%, ceiling 50%)

  Rebalance the correct answers, or correct the question. Never edit this guard to agree.
```

**The fix:** in each file, move the `[x]` on enough questions to a different position by **reordering the option lines** (swap the correct option with an adjacent incorrect one). Target: no position above 50%, and ideally use A, B, C, D each at least twice across 8 questions.

**Method that worked earlier** (for `foundations/05` and `foundations/08`): read the quiz block, map each question's correct position, then apply targeted `edit` calls swapping the `[x]` line with a neighbouring `[ ]` line. Do **not** rewrite the whole quiz.

**Corpus distribution currently** (291 questions): A 15.5%, B 25.4%, C 33.7%, D 25.4%. Corpus ceilings are **50% per position**, with a **35% corpus ceiling and 15% corpus floor**, and a **5% position-availability** check. So C at 33.7% is inside the corpus ceiling but close — **as you author the remaining 29 phases, deliberately spread the correct answers**, or C will breach.

**Hard rule: never edit `audit-quiz.mjs` to agree.** The script itself says so, and the guard exists precisely to catch this.

### 7.2 ⚠️ AST character gain — 11,104 characters

```
✓ lesson AST audit: 31 lesson(s) checked
  total character loss: 0
  total character gain: 11104
  note: the AST carries 11104 character(s) not present in the source — check for duplicated content
```

**Loss is 0**, which is the important invariant. The gain means the AST contains characters the source does not — most likely from the parser synthesising structure (list markers, table cell separators, heading anchors) rather than genuine duplication.

**Action:** investigate before treating it as clean. Read `scripts/audit-lesson-ast.mjs`, determine whether the gain is expected synthesis (in which case document that in `docs/CONTENT-SCHEMA.md` and consider a baseline threshold) or a real duplication bug. It was **9,818** at 26 phases and **11,104** at 31, so it scales with content — consistent with per-block synthesis, but the per-lesson rate should be checked for outliers.

### 7.3 ✅ RESOLVED — Git commit made, and two CRLF files fixed

**Commit created:** `3f1cab4` — "Add content pipeline, 31 phase lessons, schema and fact-check docs". 52 files, working tree clean.

While committing, git surfaced a **real violation of the project's LF-only hard rule**:

```
ai-roadmaps/foundations/06-phase-embeddings-and-similarity.md  (538 CRLF)
ai-roadmaps/prompting/05-phase-context-engineering.md          (650 CRLF)
```

These two files had CRLF endings. **Fixed** by rewriting as UTF-8 no BOM with LF-only:

```powershell
$t=[System.IO.File]::ReadAllText($p)
$t2=$t.Replace("`r`n","`n")
[System.IO.File]::WriteAllText($p,$t2,(New-Object System.Text.UTF8Encoding $false))
```

A full byte-level scan of all `*.md` and `*.mjs` now finds **zero CRLF files**. Build and audits were re-verified after the conversion and are unchanged (31 phases, AST loss 0), then the commit was amended.

**Watch for this recurring.** The `edit`/`write` tooling can introduce CRLF. After authoring, scan with:

```powershell
Get-ChildItem -Recurse -File -Include *.md,*.mjs |
  Where-Object { $_.FullName -notmatch '\\\.git\\' } |
  ForEach-Object {
    $b=[System.IO.File]::ReadAllBytes($_.FullName)
    for($i=1;$i -lt $b.Length;$i++){
      if($b[$i] -eq 10 -and $b[$i-1] -eq 13){ Write-Host "CRLF: $($_.Name)"; break }
    }
  }
```

### 7.4 ⚠️ `.research/` is an empty directory

Empty. Git will not track it. Either delete it or put something in it.

### 7.5 ✅ RESOLVED — apparent mojibake in `tracks.json` is NOT real

Reading `tracks.json` in PowerShell showed the `finetuning` blurb as `changing the prompt â€” and proving`. **This was PowerShell's console decoding, not file corruption.**

Verified by reading the raw bytes and decoding as UTF-8 explicitly:

```powershell
$b=[System.IO.File]::ReadAllBytes("learning-site/src/data/generated/tracks.json")
$s=[System.Text.Encoding]::UTF8.GetString($b)
$s -match 'changing the prompt (.{1,3}) and proving'
# -> the character is U+2014 (em dash) — correct
```

**No action needed.** The file is valid UTF-8 with the real typographic character, as the project mandates. Worth remembering as a general lesson: **when a non-ASCII character looks wrong in PowerShell output, check the bytes before "fixing" it** — the console is a likely culprit and the file is probably fine.

### 7.6 ℹ️ Missing phases noted on stderr (expected)

```
note: track "agents" has no phase files yet
note: track "finetuning" has no phase files yet
note: track "vibecoding" has no phase files yet
note: track "safety-career" has no phase files yet
```

Not errors — these are the tracks in §6.1. They disappear as tracks are authored.

---

## 8. Verified facts — teach these accurately

Full detail in `docs/VERIFIED-FACTS.md`. **This section is the fact-check backbone; do not contradict it.**

### 8.1 Five corrections to widely-repeated FALSE claims

1. **vLLM "60–80% of KV cache wasted" is an INVERSION.** The paper reports *utilisation* of 20.4%–38.2%. Throughput is "2–4× vs FasterTransformer **AND** Orca" — there is **no single multiplier**.
2. **"Lost in the Middle = 20% drop" is not the paper's framing.** Its anchor is that middle-position accuracy can fall **below GPT-3.5-Turbo's 56.1% closed-book accuracy**. Setup used **10/20/30 documents**. Do not say "a 20% drop".
3. **Speculative decoding is distribution-EXACT**, not "identical output", and only under 4 conditions. Naive rejection sampling is **NOT** lossless. Only **Medusa-1** is claimed lossless, not Medusa-2.
4. **`rope_theta` is an HF/vLLM config convention, not a RoPE-paper fact.** Verified: `1e4` (DeepSeek-V3/R1 + YaRN), `5e5` (Llama-3-8B), `1e6` (Mixtral, Qwen3). **"All modern models use 1e6" is FALSE.**
5. **Attention scales by `sqrt(d_k)`** — the **key** dimension, not `d_model`.

### 8.2 Two falsified "common knowledge" claims

- **Matryoshka Representation Learning did NOT win a NeurIPS 2022 Outstanding Paper Award** — checked the official 15-paper list.
- **GGUF does NOT stand for "GPT-Generated Unified Format."** The official `gguf-py` README says "GGML Universal File"; the spec never expands it.

### 8.3 Other corrected specifics

| Claim | Correction |
|---|---|
| `Q4_K_M` is a bit-width | It is a **label**, not a measurement — llama.cpp benchmarks it at **4.8944 bits/weight** |
| Chat per-message token overhead | Now **3** (+3 priming), not 4 |
| OpenAI has no token-count endpoint | It **does**: `POST /v1/responses/input_tokens` |
| tiktoken is obsolete | Still current (`gpt-5` → `o200k_base`), but OpenAI steers users to the count API |
| Number of encodings | A **6th** exists: `o200k_harmony` (gpt-oss) |
| Tokenization | Do **NOT** assert WordPiece's exact merge rule, "~1.3 tokens/word", or the "strawberry" explanation as fact — mark UNVERIFIED or describe qualitatively |

### 8.4 Philippines-relevant, peer-reviewed, and worth a hands-on exercise

**Petrov et al., arXiv:2305.15425 (NeurIPS 2023):** the same content can differ **up to 15×** in tokenized length across languages, **and this persists even in multilingual tokenizers**.

Consequence: **Tagalog / Cebuano / Ilocano prompts cost more, run slower, and consume more context than English.** This is both a cost fact (Cost track) and a retrieval-quality fact (RAG Phase 3). Build the exercise around it.

### 8.5 "Context rot"

Anthropic's official docs now use the term. The underlying quantitative study (Hong/Troynikov/Huber, 14 Jul 2025) is a **Chroma vendor tech report — not peer-reviewed, not on arXiv**. **Teach both halves honestly.**

### 8.6 Verified tool licences

- **Ollama** = MIT licence (verified)
- **LM Studio** = proprietary ToS (verified)

### 8.7 Citation list verified as safe to use

RAG: `2005.11401` (Lewis), `2307.03172` (Lost in the Middle), `2309.15217` (RAGAS), `2212.10496` (HyDE), `2310.06117` (Step-Back), `2404.16130` (GraphRAG), RRF = Cormack et al. SIGIR 2009, `1603.09320` (HNSW).
Agents: `2210.03629` (ReAct), `2303.11366` (Reflexion), `2305.04091` (plan-and-solve), `2305.10601` (ToT), `2309.07864` (survey), `2302.12173` (indirect injection), `2404.13208` (instruction hierarchy).
Finetuning: `2106.09685` (LoRA), `2305.14314` (QLoRA), `2305.18290` (DPO), `2212.08073` (Constitutional AI), `2203.02155` (RLHF/InstructGPT), `2306.05685` (LLM-as-judge), `2310.03714` (DSPy), `2310.13548` (sycophancy), `2305.15425` (tokenization equity).
Also verified: Contextual Retrieval (Anthropic engineering blog, 19 Sep 2024) — prepend 50–100 token chunk context; **does not require RAG for corpora under ~200k tokens**; reported failure-rate reductions **35% embeddings / 49% +BM25 / 67% +rerank**; one-time cost **~$1.02 per M doc tokens with caching**. RRF `k ≈ 60`. MCP = modelcontextprotocol.io.

---

## 9. Immediate next steps, in order

1. **✅ DONE this session.** Git committed (`3f1cab4`, 52 files) and two CRLF files converted to LF. See §7.3. Generated JSON is gitignored, so a fresh clone must run `node scripts/build-content.mjs` before the site tests can run.

2. **Fix the 4 quiz-skew files** (§7.1) by reordering options. Re-run `node scripts/audit-quiz.mjs` until it exits 0. **This is the only failing guard right now.**

3. **Investigate the AST character gain** (§7.2) and settle whether it is expected synthesis.

4. **Write `rag/05`, `rag/06`, `rag/07`** from §6.1. Keep the quiz answer positions spread.

5. **Write the Agents track (7 phases)** from §6.1.

6. **Write the Finetuning track (6 phases)** from §6.1.

7. **Write the Vibecoding track (8 phases)** from §6.1.

8. **Write the Safety & Career track (5 phases)** from §6.1.

9. **Write the 18 track files** (9 × `00-overview.md`, 9 × `checklist-master.md`) plus the 2 missing shared docs, registering new shared docs in `scripts/shared-content.mjs`.

10. **Build the learning site**, then tests, then CI, then the meta-docs and root files (§6.3–6.7).

**After every phase file:** run the three commands and confirm all green before moving on.

```powershell
node scripts/build-content.mjs --check 2>$null; Write-Host "exit: $LASTEXITCODE"
node scripts/audit-quiz.mjs 2>$null | Select-Object -Last 3
node scripts/audit-lesson-ast.mjs 2>$null | Select-Object -Last 3
```

---

## 10. Authoring conventions — the checklist to follow per file

Derived from `docs/CONTENT-GUIDE.md` and from every failure hit this session.

**Structure**
- [ ] Front-matter complete, exact field set, `exit_criteria` as folded `>` scalar
- [ ] All 11 mandatory `## ` sections, exact spelling, correct order
- [ ] Any mid-lesson `## ` heading is **inside a fence**
- [ ] Every fence opener is **on its own line**, closed, and language-tagged

**Content**
- [ ] Lesson is **2,500–4,500 words**, structured `### Part N — ...`
- [ ] Each part: **problem → mechanism → what it predicts → WHERE IT STOPS WORKING** (4th step mandatory)
- [ ] Teach **mechanism, not vocabulary**
- [ ] Every volatile specific is **dated and flagged**, and no conclusion depends on it
- [ ] Nothing invented — no fabricated citations, IDs, numbers, URLs, or API parameters
- [ ] Reader is in the Philippines on **$0**; every paid tool row names a free alternative

**IDs and quiz**
- [ ] Every checklist item has an **authored id** (no positional fallback)
- [ ] Every practice task: `id:` then `band:` then `energy:` — **exact order, one space after each colon**
- [ ] Bands ∈ `quick|focused|deep|ongoing`; energies ∈ `low|normal|high`
- [ ] Quiz: ≥4 options, **exactly one `[x]`**, a `**Why:**` line, authored unique id
- [ ] **Quiz correct answers use A, B, C and D each at least once, none above 50%** ← this is what failed

**Tools table**
- [ ] **Exactly 6 columns**, header + separator
- [ ] Real https URLs
- [ ] Every paid row names a free alternative

---

## 11. Precedent from CS Roadmap (mirror this)

At `C:\Users\zaman\Desktop\CSKramm\CS Roadmap`:

- **Three hard rules:** LF line endings; UTF-8 no BOM with real typographic characters; no build tooling outside `learning-site/` and `scripts/`
- `docs/DECISIONS.md` as **dated ADR snapshots**
- `CHANGELOG.md` maintained
- **`test:*` npm script naming**
- **`audit-*` scripts that fail loudly with `file:line`**

---

## 12. Session lessons — mistakes made, so they are not repeated

1. **I authored a systematic quiz-position bias across 4 files.** The guard caught it. Lesson: **vary the `[x]` position while writing**, not afterwards. It is much cheaper to write Q1 at A, Q2 at B, Q3 at C, Q4 at D than to retrofit.
2. **Workflows and subagents were both attempted and both cancelled.** The user then said explicitly: *"dont use subagents"*. Write files directly.
3. **A workflow's return value is not evidence of file creation.** Counting schema-returning agents undercounted the work; only listing files on disk was accurate. Always verify by listing files.
4. **PowerShell multi-line `String.Replace` failed** because patterns used `` `r`n `` while files are LF-only. Use `` `n ``, or better, use the `edit` tool.
5. **A ```` ```python ```` glued to the end of a prose sentence** broke fence pairing in `cost/05`, which silently hid every following section from the parser and produced a confusing "missing mandatory sections" error. **Fence openers go on their own line.**
6. **JS-style regex literals do not work in PowerShell `-match`.** Use `[regex]::Match` or read lines.
7. **`build-content.mjs` writes notes to stderr**, which PowerShell shows as a red error block. **Not a failure** — check `$LASTEXITCODE`.
8. **Two files silently acquired CRLF line endings.** Only git's commit warning surfaced it; the build and audits both passed happily, because neither checks line endings. Found and fixed in §7.3. **Scan for CRLF after authoring** — the project's LF rule is a hard rule but nothing enforces it automatically yet, and adding that check to CI would be worthwhile.
9. **Apparent mojibake was a console artifact, not corruption** (§7.5). Check raw bytes before "fixing" a non-ASCII character that looks wrong in PowerShell.

---

## 13. What "done" looks like

The user's five-part objective:

1. **A complete curriculum** covering the full AI-era arc: foundations → LLMs → prompting → RAG/agents → fine-tuning → safety → career — **60 phases across 9 tracks** (31 done, 29 to go)
2. **Deep vibecoding craft** — the 8-phase Vibecoding track
3. **Model internals and vocabulary** — tokens, context, KV cache, attention, sampling, embeddings (largely covered by Foundations + Model Internals, both complete)
4. **Cost and efficiency mastery** — token economics, caching, batching, provider strategy (Cost track complete)
5. **A working learning site** that renders it all, with search, progress, quizzes, and a Today view

**Success criteria that must hold at the end:**
- `node scripts/build-content.mjs --check` → exit 0
- `node scripts/audit-quiz.mjs` → exit 0
- `node scripts/audit-lesson-ast.mjs` → exit 0 with **0 character loss**
- Build report shows **0 task ids minted from position**
- Every ID authored; every paid tool row has a free alternative
- The site builds and its test suites pass
- Everything committed
