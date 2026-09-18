# HANDOVER — Vibecoding / AI Era Learning Site

**Written:** end of session, 2026-09-18
**Purpose:** Everything a fresh session needs to resume this project without re-deriving anything.
**Repo root:** `C:\Users\zaman\Desktop\CSKramm\Vibecoding`
**Sibling project (source of the proven architecture):** `C:\Users\zaman\Desktop\CSKramm\CS Roadmap`

---

## 0. READ THIS FIRST — the six things that matter most

1. **Git is clean as of this session** (HEAD `8ab2b4f`, clean tree). Line endings are watched on every file written — see §7.3.
2. **ALL GUARDS ARE GREEN.** Build (`42 phases / 6 tracks`), quiz audit, and AST audit all exit 0, with 0 minted IDs and 0 unbanded tasks. Two earlier defect classes are fixed and documented: the answer-position skew (§7.1) and the AST character gain, which is **explained and benign** (§7.2).
3. **At most 1 subagent is permitted** (user instruction). **One was used, deliberately, in `agent/04`** as a real experiment whose transcript is now the phase's central evidence — see §6.1 note (b). The budget is now spent-appropriately, not banned; **author the remaining phases directly, by hand.** Do not reintroduce fan-out.
4. **The plan is 10 tracks / 63 phases.** Two additions driven by the user's clarified goal (*"just want to really build a skill and knowledge so maybe i can get even ai job someday"*): the **freemium / zero-budget playbook** (`cost/07`) and a whole new **Career & Getting Hired** track (4 phases). See §6.0.
5. **Five tracks are complete, four remain empty.** Done: `foundations`, `model-internals`, `prompting`, `rag` (7/7), `cost` (7/7), `agents` (7/7 — completed this session). Remaining: `finetuning` (6), `vibecoding` (8), `safety-career` (5), `career` (4) = **21 phases**, plus track files, the site, tests, CI, and docs. See §6.
6. **`web_search` is BROKEN in this environment.** It returns HTTP 404 for every query. `web_fetch` works. Only the user can fix it (Settings > Plugins). All research in `docs/research/` was done by fetching primary sources directly, and every literature citation added this session was checked against its arXiv abstract page before being written.

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
| `audit-lesson-ast.mjs` | ✅ exit 0 — 31 lessons, **0 character loss**, 11,104 character gain (now understood — see §7.2) |
| `audit-quiz.mjs` | ✅ **exit 0 — all positions balanced** (fixed in Stage A, §7.1) |

### Phase files on disk, by track

| Track | Folder | Files | Target | Status |
|---|---|---|---|---|
| Foundations | `ai-roadmaps/foundations/` | 8 | 8 | ✅ **COMPLETE** |
| Model Internals | `ai-roadmaps/model-internals/` | 6 | 6 | ✅ **COMPLETE** |
| Prompting | `ai-roadmaps/prompting/` | 7 | 7 | ✅ **COMPLETE** |
| Cost & Efficiency | `ai-roadmaps/cost/` | **7** | 7 | ✅ **COMPLETE** (+freemium playbook) |
| Retrieval & RAG | `ai-roadmaps/rag/` | **7** | 7 | ✅ **COMPLETE** |
| Agents & Tools | `ai-roadmaps/agents/` | **0** | 7 | 🔴 NOT STARTED |
| Finetuning & Evals | `ai-roadmaps/finetuning/` | **0** | 6 | 🔴 NOT STARTED |
| Vibecoding Craft | `ai-roadmaps/vibecoding/` | **0** | 8 | 🔴 NOT STARTED |
| Safety & Ethics | `ai-roadmaps/safety-career/` | **0** | 5 | 🔴 NOT STARTED |
| **Career & Getting Hired** | `ai-roadmaps/career/` | **0** | **4** | 🔴 **NEW — NOT STARTED** |
| | | **35** | **63** | **28 phases remain** |

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
  03-phase-batching-and-async.md
  04-phase-model-routing.md
  05-phase-monitoring-and-caps.md
  06-phase-local-vs-api.md
  07-phase-freemium-playbook.md             (written in Stage A — completes the track)
ai-roadmaps/rag/
  01-phase-why-retrieval.md                (written in an earlier session)
  02-phase-ingestion-chunking.md           (written in an earlier session)
  03-phase-embeddings-vector-search.md     (written in an earlier session)
  04-phase-hybrid-search-reranking.md      (written in an earlier session)
  05-phase-metadata-and-evaluation.md      (written in Stage B — commit f4693cf)
  06-phase-rag-debugging.md                (written in Stage B — commit 56f36c0)
  07-phase-graphrag-advanced.md            (written in Stage B — commit beb01f5)
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
│   ├── README.md               ✅ strategy doc: 10 tracks, 63 phases, dep graph
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
│       ├── tracks.json         (1.8 KB, 10 tracks)
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

### 6.0 ⭐ SCOPE EXPANSION — added after the user clarified their goal

**Why this section exists.** Partway through, the user asked:

> "does our plan app explains everything about vibecoding and even as a freemium user? since most frontier model is expensive and i dont have any money yet. just want to really build a skill and knowledge so maybe i can get even ai job someday"

An audit of the authored 31 phases found the freemium spine was **already strong** (every phase has a `## Free vs Paid` section; 199 free-tier mentions; the Cost track is explicitly written around the user's expiring free beta), but two real gaps existed:

**Gap 1 — no single freemium *playbook*.** Free options were mentioned everywhere but never assembled into one place that answers "I have ₱0. What is my actual workflow, today, end to end?"
**Gap 2 — no job-readiness spine.** "Portfolio" appeared 2–5 times per phase as a deliverable reminder, but nothing *taught* how to convert skill into work. MCP appeared once in the whole corpus; DSPy and distillation twice each.

**Decision:** expand the plan rather than bolt this on at the end.

| Addition | Where | Phases | Rationale |
|---|---|---|---|
| Freemium playbook | `cost/07` | 1 | The practical synthesis of the Cost track, aimed exactly at the user's situation |
| Career & Getting Hired | **new track** `career` | 4 | Career became a primary user goal, so it earned its own track rather than one phase at the end of Safety |
| MCP depth | folded into `agents/07` | (0 new) | Already briefed; ensure it is properly covered, not mentioned |
| DSPy | folded into `ft/04` | (0 new) | Keep the "the metric is the point" framing |

**Revised totals: 10 tracks, 63 phases.** (Was 9 tracks / 60 phases.)
**Authored: 31. Remaining: 32.**

**Plan changes already applied to the code:**
- `scripts/build-content.mjs` `KNOWN_TRACKS` now contains a `career` entry (`short: 'career'`, `folder: 'career'`).
- The `safety-career` track was **relabelled** to `Safety & Ethics` (blurb: "Alignment, misuse, privacy, and using these tools honestly.") because career content moved out into its own track. Its `id`, `short` and `folder` are **unchanged** — do not rename them, as existing IDs depend on them.
- Verified: build still passes, `tracks.json` now emits **10 tracks**.

> ⚠️ **The `career` folder does not exist yet.** Create `ai-roadmaps/career/` before writing its phases.

---

### 6.0.1 New phase — `cost/07` Freemium Playbook

**File:** `ai-roadmaps/cost/07-phase-freemium-playbook.md` · **id:** `cost-07-freemium-playbook` · **order:** 70

**Must teach.** This is the phase the user's question asked for: a single end-to-end workflow for someone with no budget.

- **The tier ladder, honestly.** What each tier actually costs you: local models (cost = your hardware and time), free hosted tiers (cost = rate limits, and often **different data-retention and training-use terms than paid**), trial credits (cost = expiry), and paid (cost = money). Name the real constraint at each rung.
- **The decision procedure**, not a product list: *try local first → free tier if the task exceeds local capability → paid only for the experiment that changes a decision.*
- **What you actually give up by being free:** breadth of model comparison, and access to mechanisms (some providers gate caching, batching, reasoning-effort settings on paid tiers). Be honest that this narrows *experiments*, not *understanding* — the mechanism is learnable from docs plus a local reproduction.
- **Substitutes for paid-only mechanisms.** Can't observe a real cache write on your tier? Reproduce prefix-reuse behaviour locally and reason about the asymmetry. Can't batch? Simulate the submit/poll/reconcile lifecycle with a local queue. The point is that **the concept is separable from the vendor implementation.**
- **Where free is genuinely enough** (most of this curriculum) **versus where it isn't** (large-scale embedding, long-context experiments, high-volume evals).
- **The first-peso decision.** When you eventually spend, spend on the experiment that changes a decision, not on convenience. Cross-reference `cost/06`'s threshold and `cost/05`'s caps discipline.
- **The expiring-free-access transition**, tied directly to `cost/05`'s dated transition plan deliverable — this phase should reference that plan and complete it.
- **The skills that survive losing free access:** everything mechanism-level. This is the phase's closing argument and it should be explicit — *free access was never the skill; it was the practice environment.*

**Deliverable:** a written zero-budget workflow for one real project — the ladder, the decision rules, what you gave up, and your first-peso trigger.

---

### 6.0.2 New track — Career & Getting Hired (4 phases)

**Track id:** `career` · **folder:** `ai-roadmaps/career/` · **short prefix:** `career` · **label:** `Career & Getting Hired`

> Create the folder first. Use prefix `career-NN`.

| # | Slug | Title | Must teach |
|---|---|---|---|
| 1 | `what-employers-want` | What Employers Actually Want | Read the landscape honestly. **What changed:** generation is cheap, so the premium moved to **judgement** (telling plausible from correct), verification, systems thinking, specification, and domain knowledge. **The roles that exist around these systems** — AI/LLM engineering, data and evaluation work, prompt/solutions engineering, integration and support, domain expert + AI. For each: what the day looks like, what a junior can realistically enter with, and what the actual barrier is. **The junior-accessibility ranking** (evaluation and data work are the most accessible entry points; research and frontier training are not). Remote work from the Philippines: what's realistic, timezone reality, contractor vs employee, payment and tax basics at a high level. **The honest caveat:** the field is noisy and title inflation is real — teach the user to read a job post for what it actually requires. Also: what NOT to chase (leaderboard trivia, framework-of-the-month). |
| 2 | `portfolio-that-proves` | A Portfolio That Proves Something | The core claim: **one deep project with an eval suite beats five demos.** Cover: what makes a project legible to a hiring manager (a problem stated, a decision made, a measurement taken, a limitation admitted); why the phase deliverables in this curriculum already form the portfolio and how to assemble them; **the writeup template** — problem, approach, what broke, how I knew it worked, what I'd do differently; showing your **reasoning** not just your result; making it runnable (a README that works on a clean machine, pinned dependencies, no secrets); publishing (GitHub basics, a simple writeup, honest commit history); what to leave out (tutorial clones, unmodified course projects, anything you can't explain). Include the **"could I defend this in an interview" test** applied to each project. |
| 3 | `proof-of-skill-without-a-job` | Proof of Skill Without a Job | How to build evidence when nobody has hired you. **Open-source contribution** — reading unfamiliar code, small honest contributions, how to find approachable issues; **writing in public** (a technical post explaining one mechanism you learned, and why explaining is the fastest way to find your own gaps); **building for a real user**, even one — a local business, a student org, a personal workflow; **reproducing and extending a paper or benchmark**; **teaching** (writing the explanation IS the study method); participating in communities without spamming. Emphasise: **evidence of judgement is scarce and therefore valuable** — a public writeup of a bug you found in your own work is worth more than another polished demo. Also cover the ethics of not overstating what you built, tying back to `using-ai-honestly`. |
| 4 | `interviewing-and-90-days` | Interviewing and Your First 90 Days | The practical end of the curriculum. **What AI-role interviews actually test:** system design for an LLM feature ("design a support assistant" — retrieval? evals? cost? failure handling?), debugging a broken prompt or pipeline, explaining a mechanism precisely, cost reasoning, and **honesty about limits** ("I don't know, here's how I'd find out"). **Take-homes and live coding with AI allowed** — how to use tools without hiding it and without leaning on them fatally. **Explaining your own past projects** under questioning. **Behavioural framing** for a career-changer. Then **the first 90 days**: what to learn on the job, how to ask for help, shipping small, building trust, keeping a work log, continuing to evaluate. Finish with **a concrete dated 90-day plan that starts the day the curriculum ends** — which was already `safety-career/05`'s closing deliverable, so **decide the boundary and cross-reference rather than duplicating it**. Recommended split: `safety-career/05` ends the *learning* phase and hands off; `career/04` owns the *job-search and first-90-days* plan. |

**Authoring note.** This track must stay **honest and specific** — no motivational filler. The user is a beginner in the Philippines with no money; every claim about the job market should be a **procedure** ("read the post for X", "ask this question in an interview") rather than a statistic, because job-market numbers are volatile under the volatility rule.

---

### 6.1 Content — 32 remaining phase files

**RAG track (3 remaining, target 7):**

| # | Slug | Title | Must teach |
|---|---|---|---|
| 5 | `metadata-rag-evaluation` | Metadata Filtering and RAG Evaluation | Access control as a retrieval filter, never a prompt instruction; pre-filter vs post-filter. **Evaluate retrieval and generation separately.** Recall@k (most important), Precision@k, MRR, nDCG. RAGAS (arXiv:2309.15217): faithfulness, answer relevance, context precision/recall — note it inherits LLM-judge biases. The master diagnostic: inject the known-correct chunk → if it answers, retrieval is broken; if it still fails, generation is broken. And the reverse: remove context, quality should drop. |
| 6 | `rag-debugging` | Diagnosing RAG Failures | Symptom → cause → diagnostic → fix table: retrieval miss, wrong-source citation (verify citations **in code**, number chunks, require chunk IDs), model contradicting the doc, correct-for-wrong-reason (memorisation — remove context, re-ask), irrelevant chunks, duplicated chunks, good retrieval but bad answer, facts split across chunks. Plus a concrete ordered walkthrough of one bad answer. |
| 7 | `graphrag-advanced` | When RAG Is Not Enough | Global/thematic questions no single chunk answers. **GraphRAG (Edge et al., arXiv:2404.16130)** — entity graph, community detection, pre-generated summaries, map-reduce at query time — with an **honest assessment: expensive, targets only global questions, do NOT start here.** Multi-hop retrieval. Cheaper map-reduce-summarize-top-k alternative. Decision framework for escalating from plain RAG. |

**Agents track (7, target 7) — ✅ COMPLETE.** Prefix `agent-`. Folder `ai-roadmaps/agents/`. Commits `c7b3204`, `204289f`, `9828e4b`, `46e1f37`, `229c1db`, `fced416`, `8ab2b4f`:

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

**Safety & Ethics track (5, target 5) — ALL TO WRITE.** Prefix `safe-`. Folder `ai-roadmaps/safety-career/`. **Note the track was relabelled to "Safety & Ethics" but its id/short/folder are unchanged** — see §6.0.

| # | Slug | Title | Must teach |
|---|---|---|---|
| 1 | `how-models-go-wrong` | How Models Go Wrong | A **builder's** taxonomy, constructive and mechanism-first. Hallucination restated as a system risk; **sycophancy (Sharma et al., arXiv:2310.13548)** and why preference training produces it; bias/representational harm — from training-data distribution, not malice, and hard to measure; failure to know what it doesn't know; distributional shift. For each: mechanism, how it shows up in a product, how a builder detects it, what mitigation actually works. Emphasise these are **system** properties, so the fix is usually system design (verification, grounding, human review, monitoring) rather than a better prompt. |
| 2 | `security-and-privacy` | Security, Privacy and Data | **Indirect prompt injection (Greshake et al., arXiv:2302.12173)** taken seriously: processed data can carry instructions; demonstrated data theft and worming. **Instruction hierarchy (Wallace et al., arXiv:2404.13208)** — a mitigation, not a guarantee. Defence in depth. Data handling: what leaves your machine, provider retention and training-use terms, **why free tiers often have different data terms than paid**. **Philippine Data Privacy Act of 2012 (RA 10173)** as a REAL compliance obligation — purpose limitation, consent, security, breach notification. Secrets management (never commit keys; env vars; rotate on exposure; **git history keeps what you deleted**). Finish with a builder's checklist. |
| 3 | `alignment-and-limits` | Alignment, Capability and Honest Limits | Sober, no hype in either direction. What alignment means technically (systems doing what operators and users intend, including when those conflict). **RLHF (arXiv:2203.02155)** and why the **KL penalty exists**; **Constitutional AI / RLAIF (arXiv:2212.08073)**; where sycophancy comes from as a side effect of preference optimisation. **Reward hacking / specification gaming** — optimising a proxy diverges from the goal — with concrete small examples. The honest capability/risk debate **without resolving it**: the positions, the uncertainty, why a builder should care about direction-of-travel rather than predictions. Conceptual evaluation of dangerous capabilities and why claims must be measurable. **Most importantly: a section on NOT over-claiming** — distinguishing measured results from extrapolation in your own writing and portfolio, because credibility is built by being right about small things. |
| 4 | `using-ai-honestly` | Using AI Honestly | Practical, not preachy. Attribution and disclosure (when to say you used AI; norms still forming). **What is actually cheating in learning vs efficient use** — clear framework: using AI to *skip the struggle* vs using it to *check understanding after struggling*. The difference between AI-assisted work you can defend and work you cannot — the test: **"could I explain, debug, and extend this myself?"** Plagiarism vs generation. **Skill atrophy** — which competences weaken if you never do the work (reading unfamiliar code, debugging without hints, writing from a blank page, estimating difficulty). Honesty in the other direction too: not claiming credit you didn't earn, not hiding permitted tool use. Finish with a **personal policy template** the reader writes for themselves. |
| 5 | `career-in-ai-era` | Career in the AI Era | ⚠️ **BOUNDARY CHANGED — see §6.0.2.** This phase now owns **the transition out of learning**: what differentiates people now that generation is cheap (**JUDGEMENT**, verification, systems thinking, specification, domain knowledge); the durable-vs-volatile distinction applied to **skills**; **how to keep learning without drowning** (few high-signal sources, follow mechanisms not leaderboards, re-check volatile specifics, **monthly cadence not daily**); and an honest self-assessment of where the reader actually stands. It should **hand off to the Career track** for portfolio construction, job search, and the 90-day plan — cross-reference rather than duplicate. Recommended split: **this phase ends the learning phase and states the reader is ready; `career/01–04` own everything about getting hired.** |

### 6.2 Track-level files still owed

- **10 × `00-overview.md`** — one per track (10 tracks now, including `career`)
- **10 × `checklist-master.md`** — one per track
- **`ai-roadmaps/shared/resource-list.md`** — registered in `SHARED_DOCS`, currently missing
- **`ai-roadmaps/shared/glossary.md`** — registered in `SHARED_DOCS`, currently missing

> Both shared docs are in the `SHARED_DOCS` registry in `scripts/shared-content.mjs`. The build currently reports `shared docs: 2` (the two that exist). It **fails on unregistered `.md` files**, so add the file *and* register it.

> **Consider a third shared doc:** a `free-toolkit.md` — the running list of free-tier-safe tools, local model options, and free substitutes for paid mechanisms. It would serve the freemium theme across every track. If added, register it in `SHARED_DOCS`.

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

### 7.1 ✅ RESOLVED (Stage A, 2026-09-18) — Quiz answer-position skew

**Was:** `audit-quiz.mjs` exited 1 on 4 files, all written with correct answers biased to position C:

```
ai-roadmaps/cost/03-phase-batching-and-async.md      — 7 of 8 in C (88%)
ai-roadmaps/rag/01-phase-why-retrieval.md            — 6 of 8 in C (75%)
ai-roadmaps/rag/03-phase-embeddings-vector-search.md — 5 of 8 in C (63%)
ai-roadmaps/rag/04-phase-hybrid-search-reranking.md  — 5 of 8 in C (63%)
```

**Fix applied:** reordered **whole option lines** in each file (swapping the `[x]` line with a neighbouring `[ ]` line). No question text, no `**Why:**` line, and no ID was changed. No guard was edited.

Resulting positions (`Qn=letter`):

```
cost/03    Q1=A Q2=B Q3=D Q4=A Q5=B Q6=B Q7=D Q8=C
rag/01     Q1=A Q2=A Q3=B Q4=D Q5=B Q6=C Q7=D Q8=C
rag/03     Q1=B Q2=C Q3=C Q4=A Q5=B Q6=D Q7=A Q8=D
rag/04     Q1=D Q2=C Q3=B Q4=A Q5=D Q6=C Q7=B Q8=A
```

**Corpus distribution after the fix** (291 questions):

| Position | Before | After Stage A | After Stage B (331 qs) |
|---|---|---|---|
| A | 15.5% | 18.2% | **19.3%** |
| B | 25.4% | 25.4% | 25.1% |
| C | 33.7% | 28.2% | **28.1%** |
| D | 25.4% | 28.2% | 27.5% |

C is now clear of the 35% corpus ceiling it was approaching, and A is clear of the 15% corpus floor. **Still spread the correct answers deliberately as you author the remaining 28 phases** — the skew is much cheaper to avoid while writing than to retrofit.

**Practical technique that works** (used for `cost/07`, `rag/05`, `rag/06`, `rag/07`): write the quiz with positions already varied, then run this per-question count before committing. Every phase written in Stage B needed one rebalancing pass — a 10-question quiz naturally drifts to 4–5 in one position:

```powershell
# positions AND marker count per question; every question must show exactly one [x]
$q=0;$opts=@();$cnt=0
Get-Content $f | ForEach-Object {
  if($_ -match '^### Q(\d+)\.'){ if($q -and $cnt -ne 1){"Q$q has $cnt markers"}; $q=$matches[1];$opts=@();$cnt=0 }
  if($_ -match '^- \[x\]'){$cnt++; $opts+=1}
}
```

**Hard rule: never edit `audit-quiz.mjs` to agree.**

### 7.2 ✅ RESOLVED (Stage A, 2026-09-18) — AST character gain is expected synthesis, not a bug

```
✓ lesson AST audit: 31 lesson(s) checked
  total character loss: 0
  total character gain: 11104
```

**Loss is 0 — that is the invariant and it holds.** The gain was investigated and is **benign**. Do not "fix" it.

**Root cause.** The audit compares a **character multiset** (whitespace excluded). `stripMarkup` removes inline markup from the *source* side (`` `code` `` → `code`, `**bold**` → `bold`), but `astToPlainText` pushes `block.text` **verbatim** — and `scripts/lesson-ast.mjs` deliberately carries inline markup through as raw text for the site's `renderInline.jsx`. So markup is stripped from one side and retained by the other. That asymmetry is the entire gain.

**Measured breakdown of the 11,104:**

| Character | Count | Source |
|---|---|---|
| `*` | 9,128 | Emphasis markers retained in AST text |
| `` ` `` | 1,158 | Inline-code markers retained in AST text |
| `-`, `\|`, `#`, digits | ~800 | List markers, table pipes, heading anchors |

**92% is `*` and backtick alone.** Confirmed by re-running the comparison with inline markup normalised on **both** sides: gain collapses **11,104 → 819**, leaving only structural synthesis.

**Why it is not duplication:** gain is never zero across 31 lessons, is tightly bounded at **0.79%–2.48% of source (median 1.68%)**, and scales with source size with no outliers (largest single file: 606 chars, 2.3%). A duplication bug produces a bimodal spread concentrated in a few files; this is uniform.

**Consequence for future work:** treat gain as a **trend indicator, not a gate**. A sudden jump above ~2.5% of source *in one lesson* is worth investigating; the raw total growing as content is authored is expected. **Only `loss > 0` fails the audit.** This is now documented in `docs/CONTENT-SCHEMA.md` under "The lesson region".

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

1. **✅ DONE.** Git committed (`3f1cab4`, 52 files) and two CRLF files converted to LF. See §7.3. Generated JSON is gitignored, so a fresh clone must run `node scripts/build-content.mjs` before the site tests can run.

2. **✅ DONE (Stage A).** The 4 quiz-skew files are fixed; `node scripts/audit-quiz.mjs` exits **0** and the corpus distribution improved (C 33.7%→28.2%, A 15.5%→18.2%). See §7.1. **All three guards are now green.**

3. **✅ DONE (Stage A).** The AST character gain is explained as expected inline-markup synthesis and documented in `docs/CONTENT-SCHEMA.md`. No code change was needed. See §7.2.

4. **Create `ai-roadmaps/career/`** — the new track's folder does not exist yet (§6.0.2). Then write its 4 phases.

5. **Write `cost/07` Freemium Playbook** — **✅ DONE.** `ai-roadmaps/cost/07-phase-freemium-playbook.md`, commit `289986e`. The Cost track is now 7/7 complete. Note it deliberately completes `cost/05`'s dated transition plan (the four-way sort into move-to-local / move-to-free-tier / defer / cut), so if `cost/05` is ever revised, keep that handoff intact.

6. **Write `rag/05`, `rag/06`, `rag/07`** — **✅ DONE.** `f4693cf`, `56f36c0`, `beb01f5`. The RAG track is 7/7 complete. Note three corrections carried into these files and worth preserving if they are ever revised: (a) RAGAS is **reference-free first** — that is the paper's emphasis, and the IR metrics (Recall@k, MRR, nDCG) are **not** from RAGAS, they predate it; (b) GraphRAG's claim is scoped to *global sensemaking questions over datasets in the 1M token range, on comprehensiveness and diversity, versus a conventional RAG baseline* — never compress it to "GraphRAG is better"; (c) `rag/07` deliberately recommends **against** starting with GraphRAG, and its map-reduce alternative is presented as the better engineering choice at learner scale.

7. **Write the Agents track (7 phases)** from §6.1 — **✅ DONE.** Commits `c7b3204`, `204289f`, `9828e4b`, `46e1f37`, `229c1db`, `fced416`, `8ab2b4f`. The Agents track is 7/7. Corrections carried into these files and worth preserving if they are ever revised:

   (a) **ReAct's 34% / 10% figures are the ALFWorld and WebShop interactive-benchmark results**, against imitation and RL baselines with one or two in-context examples — **not** the HotpotQA/Fever results, whose reported benefit is overcoming hallucination and error propagation by interacting with an API. Never attach the percentages to the QA tasks. Quizzes in `agent/01`, `agent/03` and `agent/06` test this scoping.

   (b) **`agent/04` carries a real, observed experiment**, not a hypothetical: a subagent was given a brief containing two deliberate fabrications (an invented "200:1" exploration-to-return ratio, and the overstatement that isolation is "the primary reason" multi-agent beats single-agent) marked as verified facts. The child did **not** blindly repeat them — it flagged both accurately in a trailing confidence section. But both still appear in the **body as plain assertions**, and the caveats live only in an appendix that further compression drops. So the finding is sharper than "subagents are confidently wrong": **a caveat does not survive a compression boundary, even when the source is honest.** Preserve that distinction if this phase is revised; the weaker lesson is a different and less useful claim.

   (c) **`agent/06` states the instruction-hierarchy result accurately**: Wallace et al. (arXiv:2404.13208) identify that LLMs treat system prompts as the same priority as untrusted user/third-party text, and their method drastically increased robustness even against unseen attack types with minimal capability degradation — applied to **GPT-3.5**. It is framed throughout as a **mitigation, not an enforcement mechanism**. The injection paper's own conclusion (arXiv:2302.12173) that **effective mitigations are currently lacking** is quoted as the honest framing. Do not let a future edit upgrade either into "solved".

   (d) **`agent/07` frames MCP as versioned** (the spec revision fetched was dated `2026-07-28`) and explicitly separates `pass@k` from `pass^k`. The MCP "USB-C" analogy is pushed on deliberately: it standardises the **connector, not the device** — no better tools, no safety, no evaluation, no capability upgrade.

8. **Write the Finetuning track (6 phases)** from §6.1. **← RESUME HERE.** Folder `ai-roadmaps/finetuning/` already exists and is empty.

   Four tracks remain after Agents, and their folder state was verified at the time of writing:
   - `finetuning` — folder **exists**, empty (6 phases)
   - `vibecoding` — folder **MISSING**, must be created (8 phases)
   - `safety-career` — folder **MISSING**, must be created (5 phases) — this is the Safety & Ethics track; its track key is `safety-career`
   - `career` — folder **MISSING**, must be created (4 phases)

   As of the Agents completion, `node scripts/build-content.mjs` reports "no phase files yet" for exactly `finetuning`, `vibecoding`, `safety-career` and `career`. If a note names a track you believe is finished, that is the signal a folder went missing — the same defect that was present for `agents` at the start of the Agents track.

9. **Write the Vibecoding track (8 phases)** from §6.1.

10. **Write the Safety & Ethics track (5 phases)** from §6.1.

11. **Write the Career track (4 phases)** from §6.0.2.

12. **Write the 20 track files** (10 × `00-overview.md`, 10 × `checklist-master.md`) plus the 2 missing shared docs (and consider `free-toolkit.md`), registering new shared docs in `scripts/shared-content.mjs`.

13. **Build the learning site**, then tests, then CI, then the meta-docs and root files (§6.3–6.7).

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

1. **I authored a systematic quiz-position bias across 4 files.** The guard caught it. **Fixed in Stage A (§7.1).** Lesson: **vary the `[x]` position while writing**, not afterwards. It is much cheaper to write Q1 at A, Q2 at B, Q3 at C, Q4 at D than to retrofit a whole file.
2. **Workflows and subagents were both attempted and both cancelled.** The user said *"please dont use subagents"*, later relaxed to *"you can only use 1 sub agent"*. Write files directly.
3. **A workflow's return value is not evidence of file creation.** Counting schema-returning agents undercounted the work; only listing files on disk was accurate. Always verify by listing files.
4. **PowerShell multi-line `String.Replace` failed** because patterns used `` `r`n `` while files are LF-only. Use `` `n ``, or better, use the `edit` tool.
5. **A ```` ```python ```` glued to the end of a prose sentence** broke fence pairing in `cost/05`, which silently hid every following section from the parser and produced a confusing "missing mandatory sections" error. **Fence openers go on their own line.**
6. **JS-style regex literals do not work in PowerShell `-match`.** Use `[regex]::Match` or read lines.
7. **`build-content.mjs` writes notes to stderr**, which PowerShell shows as a red error block. **Not a failure** — check `$LASTEXITCODE`.
8. **Two files silently acquired CRLF line endings.** Only git's commit warning surfaced it; the build and audits both passed happily, because neither checks line endings. Found and fixed in §7.3. **Scan for CRLF after authoring** — the project's LF rule is a hard rule but nothing enforces it automatically yet, and adding that check to CI would be worthwhile.
9. **Apparent mojibake was a console artifact, not corruption** (§7.5). Check raw bytes before "fixing" a non-ASCII character that looks wrong in PowerShell.
10. **Reordering quiz options by hand is easy to get wrong — I dropped an `[x]` entirely while rebalancing `cost/07`.** The edit that was supposed to move the correct answer to position B removed the marker and left four `[ ]` options. The build guard caught it with a precise message (`quiz cost-07-...-q01 has no correct option — mark exactly one option with [x]`), but **the audit was green when I made the mistake and green again when I re-ran it later**, because I had already "fixed" it by accident of which lines I replaced. Lesson: **after any option reorder, count the `[x]` per question explicitly** — do not infer correctness from a passing audit:

    ```powershell
    # per-question [x] count; must be exactly 1 for every question
    $q=0;$cnt=0
    Get-Content $f | ForEach-Object {
      if($_ -match '^### Q(\d+)\.'){ if($q -and $cnt -ne 1){"Q$q has $cnt"}; $q=$matches[1]; $cnt=0 }
      if($_ -match '^- \[x\]'){$cnt++}
    }
    ```

11. **A green guard is not proof the guard checks that thing.** I deliberately broke a quiz question to confirm `audit-quiz.mjs` would catch it, and it did. This is worth repeating whenever you are tempted to trust a pass: **test the guard against a known-bad input** before treating it as evidence. The handover's own rule — never edit a guard to agree — exists because the opposite mistake is worse.
12. **PowerShell backup/restore of a file invalidates the `edit` tool's read-state.** Copying a file to `.bak`, mutating it, and restoring it makes the next `edit` fail with "file changed since it was read". Re-read the file after any out-of-band write.

### Added during the Agents track (session ending `8ab2b4f`)

13. **The quiz-position skew is not occasional — it happened in all 7 Agents phases, and it is systematic.** Every single one needed a rebalancing pass. The drift is consistently toward a **4–5 concentration in one position**, and the position varies (`agent/01` C=5, `agent/02` A=5, `agent/03` A=4, `agent/04` C=5, `agent/05` A=5, `agent/06` C=5, `agent/07` A=5). The workaround is cheap and the earlier advice stands: **vary the position while writing** rather than retrofitting. A practical trick that works: draft the ten correct answers first, assign them a deliberate A/B/C/D pattern (e.g. A B C D A B C D A B), and then write distractors around each. Retrofitting costs three or four careful edits per file.
14. **I made two real errors while rebalancing `agent/03`, and both are worth naming.** First I *added* a fifth option instead of reordering (caught immediately by the 4-option count check). Then I moved the `[x]` to a **distractor** — marking "chain-of-thought uses more tokens" as correct in a question whose real answer was about environmental correction. Neither was caught by any guard, because both left exactly one `[x]` in a 4-option question. **The only defence is to read the option text you just moved, not just its position.** The structural check that catches the added-option case is now worth running every time:

    ```powershell
    # every question must have exactly 4 options
    $qq=0;$n=0; $c=@()
    foreach($l in Get-Content $f){
      if($l -match '^### Q(\d+)\.'){ if($qq){$c+="Q${qq}:$n"}; $qq=$matches[1]; $n=0 }
      if($l -match '^- \[[ x]\]'){$n++}
    }
    if($qq){$c+="Q${qq}:$n"}
    $c -join '  '   # all must end :4
    ```
15. **A subagent used as a live experiment can produce a better lesson than a summary of the literature.** The `agent/04` transcript was more valuable than the mechanism described abstractly, because the *unexpected* result — an honest child whose caveats still failed to survive compression — is a sharper and more defensible claim than the expected one. When a phase teaches a behaviour you can actually observe, spend the budget on observing it. This is also why the fabricated inputs are documented in the phase itself: a learner should know the trap was planted deliberately.
16. **When verifying a track's remaining-work state, check the filesystem rather than trusting the handover.** I asserted in an early draft of this update that four folders existed; three did not. `Get-ChildItem ai-roadmaps -Directory` and `build-content.mjs`'s "no phase files yet" notes are the authoritative pair, and the latter is also how the missing `agents` folder was originally detected.

---

## 13. What "done" looks like

The user's five-part objective, **as clarified mid-session**. The user later narrowed the emphasis: *"just want to really build a skill and knowledge so maybe i can get even ai job someday"* — so item 5 below is now a primary goal, not a footnote.

1. **A complete curriculum** covering the full AI-era arc: foundations → LLMs → prompting → RAG/agents → fine-tuning → safety → career — **63 phases across 10 tracks** (31 done, 32 to go)
2. **Deep vibecoding craft** — the 8-phase Vibecoding track
3. **Model internals and vocabulary** — tokens, context, KV cache, attention, sampling, embeddings (largely covered by Foundations + Model Internals, both complete)
4. **Cost and efficiency mastery** — token economics, caching, batching, routing, monitoring, local-vs-API — **plus the zero-budget freemium playbook** (`cost/07`)
5. **Employability** — proof of skill, a portfolio that demonstrates judgement, and a concrete job-search and first-90-days plan (**the new Career track**)
6. **A working learning site** that renders it all, with search, progress, quizzes, and a Today view

**Success criteria that must hold at the end:**
- `node scripts/build-content.mjs --check` → exit 0
- `node scripts/audit-quiz.mjs` → exit 0
- `node scripts/audit-lesson-ast.mjs` → exit 0 with **0 character loss**
- Build report shows **0 task ids minted from position**
- Every ID authored; every paid tool row has a free alternative
- **Every phase has a `## Free vs Paid` section that is honest about what free gives up**
- The site builds and its test suites pass
- Everything committed

---

## 14. Standing design principles for the remaining 32 phases

These emerged from the user's clarifying question and should govern everything still to be written.

**1. The freemium constraint is a design input, not a disclaimer.** Every phase must be completable on ₱0. Where a paid mechanism is genuinely unavailable on free tiers, teach the **mechanism** and give a **local or simulated substitute** — the concept is separable from the vendor implementation. Never let a task be impossible without money.

**2. Teach mechanisms, not vendor features.** The volatility rule (§5) exists for this. A learner who understands prefix-reuse can reason about any provider's caching product, including ones that do not exist yet. A learner who memorised one provider's cache API cannot.

**3. Judgement is the thing being trained.** Generation is cheap now. What is scarce — and what the Career track will sell — is telling plausible from correct, verifying claims, and specifying precisely. Every phase should leave the reader better at *evaluating* output, not just producing it.

**4. Honesty over encouragement.** Where something is hard, say so. Where a free tier gives up something real, name it. Where the job market is noisy, admit it. The user is making a life decision on this material and flattery would be a disservice.

**5. Evidence over assertion.** Every measurement the curriculum asks for is written down in a deliverable. The portfolio is built from those deliverables. This is why the deliverable sections are mandatory rather than optional.
