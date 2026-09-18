# HANDOVER — Vibecoding / AI Era Learning Site

**Written:** end of session, 2026-09-18 — **updated 2026-09-18 (later session: `web_search` restored)**
**Purpose:** Everything a fresh session needs to resume this project without re-deriving anything.
**Repo root:** `C:\Users\zaman\Desktop\CSKramm\Vibecoding`
**Sibling project (source of the proven architecture):** `C:\Users\zaman\Desktop\CSKramm\CS Roadmap`

---

## HOW TO START A NEW SESSION — read in this order

Do these five things and you will know everything that matters. Do not skip step 1.

1. **Read §0 below.** Eight items; items 1 and 2 tell you what changed most recently and what to hunt.
2. **Run the guards before touching anything**, so you know the baseline is green rather than assuming it:
   ```powershell
   cd C:\Users\zaman\Desktop\CSKramm\Vibecoding
   node scripts/build-content.mjs --check 2>$null; Write-Host "build: $LASTEXITCODE"
   node scripts/audit-quiz.mjs 2>$null; Write-Host "quiz: $LASTEXITCODE"
   node scripts/audit-lesson-ast.mjs 2>$null; Write-Host "ast: $LASTEXITCODE"
   cd learning-site; npm test; cd ..
   ```
   Expect `48 phase(s) across 7 track(s)` and exit 0 three times, then `all 5 offline checks passed`.
   **A fresh clone needs `node scripts/build-content.mjs` first** — the generated JSON is gitignored.
   **Verified baseline, measured 2026-09-18 after the Finetuning track landed:** 48 phases / 7 tracks · 630 authored practice-task IDs · 0 minted from position · quiz positions A 20.1% / B 25.2% / C 27.9% / D 26.7% (all inside the ceilings) · `shared docs: 4`. **The pre-Finetuning baseline was 42 phases / 6 tracks with 533 banded tasks, 706 checklist items and 401 quiz questions.** If your run differs, something changed — find out what before you continue.
3. **Read §9, and start at step 8a**, not step 8. The order changed: re-auditing the written phases now precedes writing more. **Step 8 is done** — the Finetuning track (6 phases) is complete as of this session.
4. **Check `git log --oneline -8`** and `git status` so you know what the last session actually left behind.
5. **Only then** read §4 (the content contract — the build fails without it) and §10 (the per-file authoring checklist) before writing any phase.

**Two things that will cost you real time if you miss them:** the research tools are **hourly quota-limited and share one budget** (§0.1), and **a green build does not mean the app works** (§0.5). Both are lessons this project paid for.

---

## 0. READ THIS FIRST — the eight things that matter most

1. **⭐ RESEARCH ACCESS EXISTS NOW: `web_fetch` WORKS, `web_search` CANNOT.** For most of this project's life both were dead (404 for every query), and the entire 42-phase corpus was authored **without them**. What changed, precisely:
   - **`web_fetch` works, and it is the one that matters.** Use it. It reaches any public URL and needs no search provider. **Prefer it over search on principle:** an arXiv abstract page, an official pricing page or a provider's docs are *authoritative*, where a search snippet is a summary of a summary. The audit below verified all 44 arXiv ids this way.
   - **🔴 CORRECTION — an earlier version of this file said `web_search` "cannot work on this setup, and it is not a config problem". THAT WAS WRONG.** It was a config problem the whole time, and the real cause is specific enough to be worth stating exactly.
   - **The true diagnosis:** the shipped provider `dsh-web-search-deepseek` is **purpose-built for DeepSeek's own search.** Its built-in default is `https://api.deepseek.com/anthropic/v1`, declared as `DEEPSEEK_DEFAULT_BASE_URL` in the package, and DeepSeek's Anthropic-compatible API **supports the server-side `web_search` tool** — its compatibility table lists `server_tool_use` and `web_search_tool_result` as **Supported**. `deepseek-official` is a misleading name (a generic Anthropic-Messages client), but the package's own default points at DeepSeek and is correct.
   - **What actually broke it:** `C:\Users\zaman\.dsh\settings.yaml` → `web-search-deepseek.baseURL` was set to `https://beta.singularityapi.tech/v1`. Singularity's beta serves `/v1/chat/completions` but **not `/v1/messages`** (404 confirmed on both GET and POST), so every search 404'd. **Two layers can set that base URL** — the profile's `cordis.patch.yml` and `settings.yaml` — and **`settings.yaml` wins.** The earlier session edited only the profile layer and therefore never actually changed the endpoint in use. *This is the trap: fixing the layer that looks authoritative while a higher layer silently overrides it.*
   - **⭐ The lesson is about the size of a wrong conclusion.** "This cannot work here" is a much stronger claim than "I could not make it work", and it needs proportionally stronger evidence. A 404 on one endpoint proves exactly one thing — that *that* endpoint lacks the path. It does **not** prove the provider is unusable, that no correct endpoint exists, or that the capability is structurally impossible. The check that would have settled it in one step: **read the provider package's own defaults** (`DEEPSEEK_DEFAULT_BASE_URL`), which names the intended target explicitly, and was sitting in 40 lines of source the whole time.
   - **Still true and worth keeping:** a **shim/proxy would not fix this.** Forwarding to `/v1/chat/completions` drops the server-side search tool, so the model answers from memory with no sources — output that *looks* like search and is not. The correct fix was always to reach an endpoint that genuinely implements server-side search, which DeepSeek's does.
   - **Current state (as of this session's end): search is still OFF, for two mundane reasons, both the user's to resolve.** (a) `settings.yaml` still points at Singularity. (b) The `DEEPSEEK_API_KEY` in the credential store was **revoked** after it was pasted into chat. **To enable: put a valid key in the credential store, set `settings.yaml → web-search-deepseek.baseURL` to `https://api.deepseek.com/anthropic/v1`, then run one search — a 404 means the URL is wrong, a 401 means the key is.** Cost is about **$0.001 per search** (Flash, off-peak, ~3k in + ~1k out), so a few dollars covers years at this project's usage.
   - **⚠️ Quota note, no longer applicable but worth remembering:** when a hosted search provider is used through a shared gateway, search and fetch can draw on **one hourly budget** and return HTTP 429. Direct DeepSeek keys are pay-per-token instead, so there is no hourly cap to manage.
   - **✅ Misconfiguration found and fixed this session — read this if a web tool breaks.** `web_fetch` failed with `configured web provider "builtin" is not registered`. `C:\Users\zaman\.dsh\profiles\web\cordis.patch.yml` named two providers that **do not exist**: `searchProvider: ollama`, `fetchProvider: builtin`. The real registered ids are **`deepseek-official`** (search) and **`http`** (fetch) — they are `DEEPSEEK_PROVIDER_ID` and `LOCAL_FETCH_PROVIDER_ID` inside the provider packages and **neither matches its plugin or package name**, so guessing from names fails. That file now carries the full history, including the **third and final** cause — the `settings.yaml` base-URL override above, which is the one that actually mattered.
   - **⭐ Three separate faults stacked in one file, and each hid the next.** Worth internalising as a pattern: (1) **wrong provider ids**, so both tools failed "not registered" — a missing-install error that was really a typo; (2) **a third-party plugin disabling the provider** via its *own* patch file — the same "not registered" message, but the cause was a neighbour switching it off; (3) **a higher-priority settings layer overriding the endpoint** — which looked like a protocol impossibility. **Each diagnosis was locally correct and globally wrong**, and the error messages did not distinguish the cases. When a config tool misbehaves, walk **every layer** that can set the value (profile patch → settings.yaml → env var → package default) before concluding anything about what is possible.
   - **✅ Ollama was uninstalled this session.** It was **2.8 GB of GPU libraries** (CUDA/ROCm) for a search route that could never work here, and it had **never downloaded a single model** — so it was doing nothing at all. Removed: processes stopped, program uninstalled via its own uninstaller, `~/.ollama` deleted, and `dsh-web-search-ollama` dropped from the profile's `package.json` bundle chain. Registry, autostart, port 11434 and processes all verified clean. `web_fetch` was re-tested afterwards and still works.
   - **⭐ When you need *finding* rather than *fetching*: `docs/SEARCH-REQUESTS.md`.** With Ollama gone there is no local search either, so that file is the agreed relay with the human: write numbered questions naming the claim and the file it lives in, the human pastes them into a chat assistant with live search, and answers come back **with sources attached**. **An answer without a URL is a lead, not a fact** — do not let one into the corpus. **Try `web_fetch` first and only escalate what genuinely cannot be fetched**; the MCP question in that file was answered by fetching the GitHub releases API directly, which is more authoritative than any search result would have been.
2. **🔴 A WEB-VERIFIED AUDIT OF ALL 42 PHASES FOUND 5 DEFECTS. 4 ARE FIXED; THIS IS THE TEMPLATE FOR WHAT TO HUNT.** The audit ran the moment research access returned, because **no volatile claim in the corpus had ever been checked against the live world**. Confirmed and fixed (commit `45f4940`):
   - **A wrong arXiv id, HIGH.** `cost/01` cited the Chain-of-Thought paper as `arXiv:2202.11903`. That id is *"Deep Learning Unresolved Lensed Lightcurves"* — **astrophysics**. The CoT paper is `2201.11903`. One transposed digit, plausible enough to never be questioned, pointing a learner at an unrelated field. Confirmed twice: four other places in the corpus cite it correctly, and fetching the id returns the astrophysics abstract.
   - **Code computing the wrong number, HIGH.** `cost/05`'s `measure_eval_set` multiplied by `batch_discount` instead of `(1 - batch_discount)` — right by coincidence at the default `0.5`, under-reporting by 70% at `0.3`. `cost/03` stated the correct formula, so two phases disagreed.
   - **A misleading citation, MEDIUM.** `cost/06` invoked Petrov et al. beside Filipino/Tagalog. The paper's "up to 15 times" is **Shan**, the extreme across language pairs; Tagalog's real premium is about **2×**. `cost/01` handled this correctly; `cost/06` had dropped the caveat. **This matters more than usual — the learner is in the Philippines.**
   - **A stale date, LOW.** Mixtral 8x7B: paper Jan 2024, announcement Dec 2023. Now states both.
   - **What held up is as important as what broke.** Every fragile number checked came back **verbatim correct**: Lost in the Middle's 56.1% anchor, Reflexion's 91%/80%, Medusa's 2.2×/2.3–3.6× and the lossless-Medusa-1 distinction, AWQ's 1%, vLLM's 2–4×, ReAct's 34%/10% correctly scoped away from QA. Prompt-caching multipliers (1.25×/2×/0.1×) and batch pricing (50%/24h) were also confirmed.
    - **⚠️ CORRECTION, made in a later session: Medusa's speedup was listed on the line above as verified, and that is only true of the ARXIV version.** `arXiv:2401.10774` v3 says 2.3–3.6×, but the **ICML 2024 camera-ready** — PMLR v235, pp. 5209–5235, the version of record — states **2.3–2.8×**. Cite 2.8× when citing the published paper. The general trap: **a preprint and its camera-ready can disagree**, and the arXiv abstract is not the published abstract. **No phase ever cited 3.6×**, so the curriculum was unaffected — the error lived only in this audit note.
   - **⭐ The defect class to hunt is "technically true but materially misleading".** The `agents/07` MCP error and the `cost/06` Tagalog error are both that: not false, but implying the wrong thing. **Do not stop at "the date exists" — establish what it *means*.** The audit's own coverage was ~10–15% of volatile lines by count, weighted to the highest-value classes, and it said so plainly — treat the remainder as **unaudited**, not as cleared.
3. **Git is clean as of this session.** HEAD `2c6726d`; the learning site was committed in `7d4c8bd` and documented in `b1278d7`. Line endings are watched on every file written — see §7.3, and `learning-site/scripts/audit-encoding.mjs` enforces it mechanically across 76 files.
   - **✅ The volatile backlog has since been swept, and the architecture tables verified from primary configs.** `model-internals/02`'s `rope_theta` table was checked against raw `config.json` files for all four models and **every value matches** — DeepSeek-V3 `10000` with yarn and `original_max_position_embeddings 4096`, Llama-3-8B `500000` with `rope_scaling: null`, Mixtral-8x7B `1000000`, Qwen3-235B-A22B `1000000`. Two of those configs (Mixtral and Llama-3) also carry `hidden_size 4096` and `intermediate_size 14336`, independently confirming the phase's "naming trap" explanation that a Mixtral *expert* is the MLP inside a 4096-wide model rather than a standalone 7B one. **Access note: `meta-llama/Meta-Llama-3-8B` is gated (HTTP 401), so that row was read from an ungated mirror whose `_name_or_path` names the upstream model; the other three are openly readable.** Note also that `audit-encoding.mjs` now covers `ai-roadmaps/` and the repo-root `docs/`, not just `learning-site/`, so the file count above is no longer 76 — it is 169.
4. **ALL GUARDS ARE GREEN — and there is now a FIFTH offline check.** Content: build (`42 phases / 6 tracks`), quiz audit, and AST audit all exit 0, with 0 minted IDs and 0 unbanded tasks. Site: `npm test` (**5 offline checks**) and `npm run test:browser` (25 checks) both pass. Two earlier defect classes are fixed and documented: the answer-position skew (§7.1) and the AST character gain, which is **explained and benign** (§7.2).
   - **NEW: `audit-arithmetic.mjs`, written because `cost/05`'s bug passed every existing check.** No check could see it — the build validates *structure*, the quiz audit validates *answer positions*, the AST audit validates that *prose survived*. None can evaluate arithmetic. The new guard checks one recurring relation in worked tables: `attempts = 1/successRate` and `costPerTask = costPerCall × attempts`. **A guard that cannot fail is worthless, so it was tested by re-introducing the original bug:** it reports `attempts: stated 2.4, but 1/60% = 1.67 (off 44%)` and exits 1, and the fixed content exits 0.
   - **Its own first version is a lesson worth keeping.** It crashed with a `TypeError` on tables whose body rows had more cells than their header — and because **a crash exits 1, the crash was indistinguishable from a genuine finding.** It appeared to catch the very bug it was written for while catching nothing. **Always prove a new guard fails for the RIGHT reason.**
5. **⭐ THE LEARNING SITE IS DONE AND RENDERS ALL 42 PHASES.** Verified in a real browser against **both** the dev server and the production build. See §6.3. **But note the hard-won lesson there: `vite build` passing did NOT mean the app worked.** It passed while every phase page threw. There is now a 4th guard, `audit-shapes.mjs`, because no build check knows what the components expect.
6. **At most 1 subagent is permitted** (user instruction: *"you can always use 1 sub agent to maximize our concurrency"*, reaffirmed as *"you can use 1 subagent rn if you need"*). Used well, a subagent is a real concurrency win — but **verify its report at the detail level before trusting it.** Last session one subagent caught a genuine bug in my rename script while being wrong about another claim. For **content authoring** the standing advice is: write the phases directly, by hand; do not fan out.
7. **The plan is 10 tracks / 63 phases.** Two additions driven by the user's clarified goal (*"just want to really build a skill and knowledge so maybe i can get even ai job someday"*): the **freemium / zero-budget playbook** (`cost/07`) and a whole new **Career & Getting Hired** track (4 phases).
8. **⭐ SEVEN of ten tracks are complete; three remain empty — 15 of 63 phases.** Done: `foundations` (8), `model-internals` (6), `prompting` (7), `rag` (7), `cost` (7), `agents` (7), **`finetuning` (6 — completed this session)**. Remaining: `vibecoding` (8), `safety-career` (5), `career` (4). **Content is now the only thing between this project and "done"** — the site, its guards and its docs all exist. See §6.
   - **All 20 track files and both shared docs are also written** (`00-overview.md` and `checklist-master.md` × 10, `resource-list.md`, `glossary.md`) — **but they are invisible to the build and the site. That is a real defect, and it is the most important thing in §6.2.**
   - **The three remaining tracks are the ones this project was really named for.** `vibecoding` (8) is the flagship and the largest remaining block; `safety-career` (5) and `career` (4) close the job-readiness spine the user explicitly asked for. **Order suggestion: `vibecoding` next**, because the user's stated goal is skill and employability rather than more theory.

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
| Cost & Efficiency | `ai-roadmaps/cost/` | 7 | 7 | ✅ **COMPLETE** (+freemium playbook) |
| Retrieval & RAG | `ai-roadmaps/rag/` | 7 | 7 | ✅ **COMPLETE** |
| Agents & Tools | `ai-roadmaps/agents/` | **7** | 7 | ✅ **COMPLETE** |
| Finetuning & Evals | `ai-roadmaps/finetuning/` | **0** | 6 | 🔴 NOT STARTED (folder exists, empty) |
| Vibecoding Craft | `ai-roadmaps/vibecoding/` | **0** | 8 | 🔴 NOT STARTED (folder **missing**) |
| Safety & Ethics | `ai-roadmaps/safety-career/` | **0** | 5 | 🔴 NOT STARTED (folder **missing**) |
| **Career & Getting Hired** | `ai-roadmaps/career/` | **0** | **4** | 🔴 **NEW — NOT STARTED** (folder **missing**) |
| | | **42** | **63** | **21 phases remain** |

Verified by counting files on disk, not from memory: `8+6+7+7+7+7 = 42`, and `build-content.mjs` reports the same 42 across 6 tracks. **If you re-read this table, re-run the count** — this exact table was stale by 7 phases until it was checked.

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

### 4.2 The 14 mandatory `## ` sections, in this order

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

> **Count check: there are 14 structural sections, and `## Specific topics to learn` and `## Common Pitfalls` are the two an earlier note called "optional".** In practice the whole corpus includes both, so treat 14 as the target for the **required** set.
>
> ⚠️ **But do NOT assert "exactly 14 `## ` headings" — that check is WRONG and it produced a false alarm this session.** `ai-roadmaps/prompting/07-phase-prompt-failure-modes.md` has **19** `## ` headings and is perfectly valid: all 14 required sections are present and in order, and the 5 extras (`Summary`, `Evidence`, `Risks`, `Recommendation`, `Open questions`) sit *inside* the lesson as its own content. Verified directly against the generated output — all 5 appear in the lazily-loaded lesson body, with `lessonBlockCount: 97` and `lessonHeadingCount: 19`. **So an un-fenced `## ` inside the lesson is tolerated, not fatal.** The rule that actually matters is the one below (mid-lesson `## ` headings *should* be fenced), and the one that actually fails the build is a missing or out-of-order **required** section.
>
> The right check is therefore: **are all 14 required headings present, and in the right order?** — not what the total count is.

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

> **Now enforceable — with `web_fetch`.** The rule below is no longer "flag it and hope": you can check volatile claims against primary sources (§0.1). **Use `web_fetch`, not `web_search`** — search cannot work on this setup, and fetch is the stronger standard anyway. When both tools were live they shared **one hourly budget** and returned HTTP 429, so **spend requests deliberately: `cost/` pricing and model facts before anything else**, batch related checks into one fetch where a page covers several, and stop cleanly at a 429 rather than falling back to memory. You cannot re-verify all 45 markers in one sitting, and trying is how unverified claims get recorded as verified.

| Durable (teach freely) | Volatile (date + flag + non-load-bearing) |
|---|---|
| Attention is quadratic in sequence length | Any specific context window size |
| KV cache grows linearly with tokens | Any specific price per million tokens |
| Cosine similarity, BM25, RRF | Any specific model name or version |
| Prompt caching works by prefix reuse | Any specific discount percentage |
| LoRA: `W = W0 + B*A` | Any specific GPU hour cost |

The provider landscape **has already moved past the original brief** (live docs showed `gpt-6-astra`, Claude Fable 5.1 / Opus 5 / Sonnet 5, Gemini 3.8 Flash, Assistants API sunset 26 Aug 2026). ⚠️ **These specific model names were transcribed from live docs during an earlier session and have NOT been independently re-verified — and as of this session `web_search` hit its rate limit before they could be.** Treat the list as an illustration of *how fast the landscape moves*, which is its actual purpose, **not as a fact table to propagate into a lesson.** If you need a model name in content, verify it fresh and date it. **Do NOT hardcode a model matrix** — concepts are stable for years, model names and prices are not stable for months.

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

**Finetuning track (6, target 6) — ✅ COMPLETE (this session).** Prefix `ft-`. Folder `ai-roadmaps/finetuning/`. Commits `1b3d917`, `0e53d16`, `9bc15e4`, `4ec6fa3`, `a4aa919`, `4016417`. **2,442 lines across 6 phases.** All six briefs below were followed exactly; the "must teach" column is the *original* plan and is kept for reference.

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

### 6.2 Track-level files — ✅ WRITTEN, but ⚠️ NOT RENDERED (new defect found this session)

**All 22 files are now written** (committed in `22547b4` and the finetuning commits): 10 × `00-overview.md`, 10 × `checklist-master.md`, `shared/resource-list.md` (156 lines, 71 resources in 14 groups) and `shared/glossary.md` (295 lines, 254 terms across exactly 10 track categories). The `vibecoding/`, `safety-career/` and `career/` folders were created. The build now reports `shared docs: 4`.

- **⚠️ THE REAL FINDING: `findExtraDocs()` at `scripts/build-content.mjs:849` is DEAD CODE — it is never called.** `main()` calls only `findPhaseFiles()` (L877), whose glob is `/^\d+-phase-.*\.md$/`. Verified directly: the only two hits for the identifier in the whole build are the definition itself.
- **Consequence: all 20 track files are invisible to the build, the guards and the site.** They cannot break the build, cannot be positionally minted, and **cannot be rendered** — nothing in `learning-site/src` (57 files) mentions `overview` or `checklist-master` at all. So `ai-roadmaps/README.md` L195–199, which documents both files as part of every track folder, **is currently false**.
- **This was invisible until now** because §6.2 tracked *writing* these files and nothing tracked *surfacing* them. It took a subagent reading the parser to notice, which is the argument for having one read the code rather than trusting the plan.
- **To fix, two things are needed, and the second is why it was not rushed into this session:** (a) call `findExtraDocs` in `main()` and emit the docs into the track JSON and `index.json`; (b) add a view to the React app that renders them, with the browser check this project requires for anything in the site. That touches the build pipeline and the component tree, so it wants its own session with real verification rather than a patch bolted onto the end of a large authoring run.

> The two shared docs are in the `SHARED_DOCS` registry in `scripts/shared-content.mjs`. **That parser hard-fails** on unregistered `.md` files, unlike phase build notes. Three quirks were found empirically and cost 7 real failures before they were fixed — see §12 lesson 26. **The phase-side parse is the opposite: it silently ignores what it does not recognise**, which is exactly how the dead-code gap stayed hidden.

> **A third shared doc was suggested and not written:** a `free-toolkit.md` — the running list of free-tier-safe tools, local model options, and free substitutes for paid mechanisms. It would serve the freemium theme across every track. If added, register it in `SHARED_DOCS`.

### 6.3 ✅ COMPLETE — The learning site (commit `7d4c8bd`, docs `b1278d7`)

**The site renders all 42 authored phases across all 6 written tracks.** Verified in a real browser, not just by a successful build.

| | |
|---|---|
| Stack | Vite 6 + React 18.3. **Two runtime dependencies.** No router, no state library, no UI kit. |
| Entry chunk | **303 KB (85.6 KB gzipped)**, down from 1,639 KB (501 KB gz) in the first working build |
| Views | Dashboard, PhaseDetail, ToolsLibrary, Search, Shared (5) |
| Offline checks | `npm test` — 4 steps, all green |
| Browser checks | `npm run test:browser` — 15 + 8 + 2 checks, all green against dev **and** production builds |

**The two-projection data model (the main design decision).** `build-content.mjs` now emits `index.json` (~72 KB) alongside the full per-track files (~1,304 KB total). The light index carries each phase's title, duration, goal and the **IDs** of its checklist/tasks/quiz — enough to draw the dashboard and count progress without any phase prose. Full track data and lesson bodies load lazily per track. Without this split the dashboard dragged 1.3 MB into the entry chunk.

**The quiz adapter.** Our shape is `{ options: string[], answerIndex, why }`; the ported components expect `{ options: [{text, correct}], explanation }`. Normalised **once** in `src/data/roadmaps.js` → `normaliseQuestion`, so no component and no tested `lib/` module was forked. Verified correct by `scripts/verify-quiz-correctness.mjs`, which clicks the option the **source JSON** says is right and asserts a perfect score, then clicks a wrong one and asserts it is flagged.

**⚠️ THE LESSON THAT MATTERS MOST: a green build did not mean the app worked.**
`vite build` passed, `build-content.mjs --check` passed, `audit-quiz.mjs` passed — while clicking a phase threw React error #31 and rendered nothing. Cause: `topics` is an array of `{ heading, items }` objects and `resources` is `{ name, url }`, **not** string arrays. No guard caught it because no guard knew what the components expect. Only driving a real browser found it.

So a **4th guard now exists**: `learning-site/scripts/audit-shapes.mjs` asserts, per field, the element type each renderer assumes. If you change a field's shape, that is the check that will tell you.

**Other real bugs found only by running it**, all fixed:
- localStorage namespace was `cs-roadmap:*`, shared with the sibling project on the same origin. Now `vibecoding:*`.
- Search navigated by track **code** (`found`) where a track **id** (`foundations`) was required — hits silently did not open. Fixed via `trackIdForPhase`.
- `ToolCard` imports `costTone` from `src/data/tools.js`, which did not exist here.
- Vite's watcher died with `EBUSY` on editor temp dirs, killing the dev server.
- `new URL(...).pathname` yields `/C:/...` on Windows → malformed spawned script paths.

**Praised limits, recorded so they are not oversold:** the quiz-correctness test covers **one phase** (the mapping is a pure function, so the evidence transfers, but it is not a per-phase guarantee); `debug-phase.mjs` and `debug-tracks.mjs` are **instruments, not gates** and must not be wired into CI.

### 6.4 Test suites — 🟢 OFFLINE COMPLETE (9 checks, 135 unit assertions)

**Exists and green:** `npm test` runs `scripts/check-all.mjs`, now **9** offline checks:
content build → field shapes → inline markdown rendering → quiz correctness → lesson block
renderer coverage → cost classification → worked-example arithmetic → encoding → CSS wiring.
`npm run test:browser` adds `verify-site` 15 checks, `verify-deep` 8,
`verify-quiz-correctness` 2.

**Written since this section first said "not written":** `test-render-inline.mjs` (38
assertions), `test-quiz.mjs` (58), `test-lesson-blocks.mjs` (39) — plus `audit-css.mjs`, which
was added after the site was found rendering completely unstyled (§12 lesson 50).

**No test framework and no new dependency.** Where JSX must be loaded, the scripts transform it
in memory with **esbuild** (already on disk as a Vite dependency) and render via
`react-dom/server`, which needs no DOM.

**Still owed:** `test:search` / `test:lesson-search` (`lib/lessonSearch.js` is pure and imports
nothing — the highest-value remaining target), `test:highlight`, `test:today`, `test:ui`. Note
`lib/today.js` exists in the sibling project but **is not wired to any page here** — decide
whether a Today view is wanted before porting a test around it.

**Every new test must be proved capable of failing.** Three scripts were verified by deliberate
mutation (dropping a `case` from `LessonBlock.jsx`, no-op'ing `maskCodeSpans`, breaking
`lib/quiz.js`'s 1-based numbering), each producing specific failures, then restored with
`git diff` empty.

### 6.5 CI — ✅ DONE

Two workflows, both green on first run:

- `.github/workflows/ci.yml` — content integrity on every push and PR, **with no install step**,
  then the site build and offline checks.
- `.github/workflows/pages.yml` — builds and publishes to Pages. It runs the integrity gate
  **before** installing, so a broken content file fails fast. Sets `VITE_BASE=/vibecoding/`,
  writes `404.html` and `.nojekyll`, and uses `cancel-in-progress: false` so a deploy is never
  interrupted mid-publish.

`npm test` needs no browser, so it runs in CI as-is. `npm run test:browser` needs a browser
binary and a running server — kept local-only. The two `debug-*.mjs` scripts are deliberately
**not** in CI.

**Live at https://markkramm.github.io/vibecoding/** — deploy verified (all steps success,
artifact 1202.8 KB, deployment `state=success`). ⚠️ **The rendered live page has never been
observed from this sandbox**: `*.github.io` resolves IPv6-only here and is unreachable.
`api.github.com` works, so deploy *status* is verifiable even though the page is not.

### 6.6 Meta-docs owed

✅ **Written** (commit `b1278d7`, plus `bb4735a` and `598f8e7`): `learning-site/docs/ARCHITECTURE.md`, `DATA-SCHEMA.md`, `VERIFICATION.md`, `DECISIONS.md` — plus **repo-root `docs/DESIGN-SYSTEM.md`** (610 lines), which 22 comments across twelve source files and `global.css` had been citing for named sections that did not exist. All 22 citations now resolve, including `### the no-shame rule`, which is a real subheading so the `→ the no-shame rule` citations match explicitly rather than by phrase.

⚠️ **The numbering in `DECISIONS.md` is deliberately non-sequential** (`D-001..006, 008, 011, 016, 019..021, 044..047`). The ported source already cited `D-006`, `D-011`, `D-016`, `D-019`, `D-020`, `D-021` and `D-044` across 15 files and `global.css` with no file behind them. Those ids keep the meaning the comments give them. **Do not renumber.** Verified: zero dangling cross-references.

⚠️ **`docs/` is ambiguous and comments cite it both ways.** `docs/CONTENT-SCHEMA.md` and `docs/DESIGN-SYSTEM.md` mean **repo-root** `docs/`; `docs/DECISIONS.md` means **`learning-site/docs/`**. All three resolve today. ARCHITECTURE.md carries a table making this explicit; new citations should use the unambiguous form.

🐛 **Two hooks are unimported dead code, not four.** An earlier note here said
`useApplications.js`, `useCertifications.js`, `usePortfolio.js` and `useSchedule.js` are all
unreferenced. Re-measured: only **`useCertifications.js` and `useSchedule.js`** are —
`useApplications` and `usePortfolio` are genuinely used, because `DataTransfer.jsx` imports
them to describe and validate what a backup contains. (The first measurement was wrong because
an inline `node -e` regex lost its `$` to PowerShell and matched no files at all, reporting all
17 hooks as dead — §12 lesson 53.)

The two genuinely unreachable hooks served career views that were deliberately not ported — see
D-008, which now carries the corrected count. They cannot be reached from any screen.

**Partly addressed:** the reader-facing half is fixed. `labelFor` in `lib/transfer.js` now names
them *"Certifications (not used in this app)"* and *"Schedule start dates (not used in this
app)"*, so a reader restoring a backup is not invited to hunt for a screen that does not exist.
The keys, validators and hooks all stay, because **deleting a key silently drops that field
from a reader's own backup on the next restore** — the one outcome a backup must not have.
Verified live in a browser: the restored-backup list shows both rows with the new labels.

**Still owed:** `docs/CHECKPOINT.md`, `docs/WORKFLOW.md`, `docs/TROUBLESHOOTING.md`,
`docs/ROADMAP.md`. ✅ `SETUP.md` is written at the **repo root** (not `docs/`) — it documents
the silent traps: Markdown is not read directly, the stale-generated-bundle trap, the
`VITE_BASE` blank-page trap, the IPv6 `localhost` binding, and the write-API encoding trap.

### 6.7 Root files owed — ✅ DONE

`README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `LICENSE` and `SETUP.md` are all written. `LICENSE`
is **MIT for the code and CC BY 4.0 for the curriculum prose**, with an explicit
no-warranty-of-accuracy clause, because the content makes factual claims about a field that
changes monthly.

✅ `.github/workflows/pages.yml` was the workflow `vite.config.js` had been written to expect but
that did not exist — `VITE_BASE` was read by the config while nothing ever set it.

⚠️ `netlify.toml` is **not** written and is **optional** — Pages is the chosen host and works.

---

### 6.D Dead code — unreachable modules (**RESOLVED — all 14 deleted**)

> **✅ STATUS: RESOLVED.** All fourteen modules were **deleted** — 1,740 lines, 71 KB. The count
> below is kept because the method is the lesson, not the inventory. See
> `scripts/check-reachability.mjs` (check 15), which now fails the build if any module under
> `src/` becomes unreachable again, and `ROADMAP.md` → "Resolve D-008 properly" for the
> conclusion. **43 modules in `src/`, all reachable.**

**This exists so the next reader does not have to measure it again** — the count has
already been recorded wrong twice in `learning-site/docs/DECISIONS.md` (D-008), so the
measurement is stated here with its method.

**How to reproduce.** Walk imports forward from `learning-site/src/main.jsx`, resolve each
relative specifier to a file, and take the complement. **Do not grep for a symbol name** —
that is the mistake that produced both wrong counts. `DataTransfer.jsx` contains the words
`useApplications` and `usePortfolio`, but only inside a prose comment on line 22; a grep
reports two live hooks, a reachability walk reports none.

**Result: 14 of the 57 files in `learning-site/src/` were unreachable from `main.jsx`** before
the deletion.

| Kind | Modules | Why unreachable |
|---|---|---|
| lib (5) | `lib/highlight.js`, `lib/pace.js`, `lib/pathOrder.js`, `lib/review.js`, `lib/yourWork.js` | No importer at all |
| lib, transitively dead (1) | `lib/today.js` | Imported only by `TimeBudgetSelector.jsx`, which is itself dead |
| hooks (4) | `useApplications.js`, `useCertifications.js`, `usePortfolio.js`, `useSchedule.js` | No importer at all |
| components (4) | `EmptyState.jsx`, `EnergyModeSelector.jsx`, `ReviewQueue.jsx`, `TimeBudgetSelector.jsx` | No importer at all |

**Why they are here rather than deleted.** All of it was ported from the sibling **CS
Roadmap** project, whose curriculum ends in a job hunt — Schedule, Applications,
Certifications, Portfolio, YourWork, PathOrder. This curriculum has no deadline, so those
six views were deliberately not ported. The modules were kept because removal would also
touch the transfer `KEYS` list, the validators and the tests, and would have to be redone
if the career views return. **The full reasoning and the accepted cost are in
`learning-site/docs/DECISIONS.md` → D-008** — read that before proposing removal.

**Each dead module now carries a `DEAD CODE` header block** citing D-008, so the state is
visible at the point of use rather than only in the decision log.

#### ⚠️ The projection hazard — the reason this is not merely untidy

Three of these modules read fields that **do not exist** on the light projection
(`generated/index.json`). The light phase record carries **only**
`id, order, phase, title, duration, durationWeeks, goal, lessonWordCount, checklistIds,
taskIds, quizIds`. Measured: **0 of 65 light phase records carry `checklist`, `tasks` or
`quiz`.** The full per-track files carry all three.

| Module | Reads | Status |
|---|---|---|
| `lib/pace.js:139` | `phase.checklist.every(...)` | **Threw on every call** — now guarded (see below) |
| `lib/review.js:57` | `phase.quiz \|\| []` | Silent: returns empty, "nothing to revisit" |
| `lib/today.js:125,127` | `phase.checklist \|\| []`, `phase.tasks \|\| []` | Silent: no task ever marks as addressed |
| `lib/pathOrder.js:58` | `phase.checklist \|\| []` | Silent: every phase reads `untouched` |
| `lib/yourWork.js:51` | `phase.tasks \|\| []` | Silent: answers render with no question |

This is **the same defect shape that shipped once already**: `ToolsLibrary.jsx` read
`phase.tools` off the light projection and rendered "0 tools" while 433 tool rows existed.
A `|| []` fallback does not fix that class of bug — it converts a crash into a **wrong
answer that looks like a real one**, which is worse. The guards stop the crash; they do not
make the numbers right.

**Rule for anyone reviving these modules: feed them full phase records from
`loadTrackPhases()`, never the light index.** The two projections are described in the
header of `learning-site/src/data/roadmaps.js`.

**Fixed (was a live latent crash, not just dead code).** `lib/pace.js:139` called
`.every()` on `phase.checklist`, which is always `undefined` on the light index — so the
module threw `TypeError: Cannot read properties of undefined` on the first phase examined,
every single call. It is now `(phase.checklist || []).every(...)`, matching the
`track.phases || []` style used two lines above it. The call site carries a comment
explaining both the fix and why the fallback must not be read as "this now works".

#### Genuine defect found while auditing, NOT fixed

`App.jsx` calls `useEnergyMode()` and `useTimeBudget()` and prints both values in the footer
(line 305), but **neither value is passed to any page** — `energy` and `budget` appear
nowhere in `Dashboard.jsx`. With `EnergyModeSelector` and `TimeBudgetSelector` both
unreachable, the reader can never change either setting, and even if they could it would
change nothing. The footer advertises two controls that do not exist. This is a
reader-facing confusion of the same kind D-008 already fixed for the backup labels, and it
was left alone here because fixing it means changing `App.jsx` and `Dashboard.jsx`, which
is outside a documentation task.

---

## 7. Known defects to fix

### 7.0a ✅ RESOLVED — the Practice view crashed because the tests agreed with the bug

**Was:** the new Practice view (mixed question sets) threw React error #31 on first render —
*"objects are not valid as a React child"*. A blank page.

**Cause — two question shapes, and the wrong one assumed.** `generated/<track>.json` stores a
question as:

```js
{ id, question, options: ["a", "b", "c", "d"], answerIndex, why, energy }
```

`normaliseQuestion` in `data/roadmaps.js` rewrites it before any component sees it:

```js
{ id, question, energy, options: [{ text, correct }], explanation }
```

The answer moves from one index onto each option, and `why` is renamed `explanation`. `practice.js`
read the raw shape, so `q.options` held strings where the view expected... objects, and `q.why` was
`undefined` where the view read `q.why` expecting the explanation text.

> **All 91 unit tests passed, because they read the same JSON files the bug did. The tests agreed
> with the bug.**

**This is the sixth instance of the project's core pattern**, and the second time the *fix* was to
assert what the app receives rather than what the file contains:

| # | Instance | Correct source | Wrong screen |
|---|---|---|---|
| 1 | Unstyled layout | 40 CSS classes | no rules |
| 2 | "0 tools" | 433 rows | nothing drawn |
| 3 | `href="—"` | 40 rows | dead links |
| 4 | 325 invisible items | 254 terms, 71 links | empty `<div>` |
| 5 | Previous/Next inert | correct data | handler ran, page did not change |
| 6 | Practice crash | 549 valid questions | wrong shape assumed |

**Fixed in three parts**, and the middle one generalises:

1. `poolFrom` accepts **either** shape and normalises it.
2. The corpus-wide test builds its pool **through the app's own normaliser**.
3. That normaliser cannot be imported under Node — `roadmaps.js` imports JSON, which needs an
   import attribute Vite does not require — so it is **mirrored, and its source is read and
   asserted** to still do what the mirror assumes. Change `normaliseQuestion` and the test fails
   pointing at itself.

**Two more real defects the same suite found:**

- `normaliseQuestionShape` used `findIndex` for the correct option, so a question carrying **two**
  correct answers would have been silently marked against the first, telling the reader a
  defensible answer was wrong. It now counts and drops the question unless exactly one is correct.
- An assertion demanded a 30-question draw span all 10 tracks at least 50% of the time. The true
  figure is ~44%, and that is correct arithmetic, not a biased shuffle: with 549 questions and
  safety-career holding 30 and career 24, those two are missed 18% and 25% of the time
  respectively, so *"all ten present"* cannot exceed ~48%. Confirmed independently with a
  log-space hypergeometric calculation — **47.8% theoretical vs 43.8% observed over 2000 seeds.**
  The assertion now tests spread (decidable) plus an exact all-tracks check at 200 questions.

⚠️ **The generalisable rule: a test that reads the SOURCE FILE proves the source file is fine. It
says nothing about the object the component is handed.** When a pipeline normalises data on the
way in, the test must go through the same normaliser, or it is testing a different program.

---

### 7.0b Section exams — the first graded surface, and the bug that would have shipped silently

**What was built.** One exam per track (10 total), covering **every** question that track teaches
(24–82), timed, scored, with an 80% pass mark. This is the documented exception to D-020 — argued
in `docs/DECISIONS.md` → D-020a rather than by editing D-020, because D-020's own last paragraph
says a score request *"is a change to the product's stance, not a small feature, and should be
argued as one."*

**The place this could have gone wrong, and why it was tested hardest.** The exam shuffles option
order per attempt so a retake cannot be passed on position recall. That introduces the one failure
this whole feature is exposed to:

> **Shuffle the options without carrying the answer index, and every question is marked against the
> wrong option.** The result is not a crash. It is a *believable score* and a *confident, incorrect
> verdict* — a reader would simply be told they failed.

So `test-exam.mjs` asserts the answer survives the shuffle across 300 seeds, asserts a perfect
paper scores 100% *after* shuffling, and asserts the score arithmetic for **every possible count**
from 1 to 60 questions crossed with every achievable score. Two more that caught real edge cases:

- **Choosing option A must register as answered.** A falsy-zero bug (`chosen !== undefined` not
  `if (chosen)`) would silently mark index 0 as blank. Asserted directly.
- **An empty exam must not divide by zero or claim a pass.** `0/0` is `NaN`, and `NaN >= 0.8` is
  `false`, so this happens to behave — but only by accident, so it is asserted rather than assumed.

**The defect that was actually found — and it was in a different file than expected.** The exam key
was added to `lib/transfer.js` → `KEYS`, which was assumed sufficient. It was not:

```js
// mergeValue dispatches on the human-readable `kind` string.
// The new key's kind matched no branch, so it fell through to:
return current;   // "preferences and reading position belong to this machine"
```

**A backup restore would therefore have silently discarded every exam pass recorded on the other
machine.** The reader imports a backup, sees their results unchanged, and concludes the backup was
empty. It is the worst failure this feature has, because it is invisible: no error, no crash, and
the local data still looks correct.

The fix adds an explicit branch — per track, higher score wins, earlier date wins a tie, attempt
counts add — and the test asserts it from both directions (local ahead, and backup ahead). The
lesson is in the shape of the miss, not the miss itself: **`KEYS` registration and merge behaviour
are two different obligations, and satisfying the first looks exactly like satisfying both.**

**What was deliberately kept from D-020**, so the exception did not quietly become a repeal: best
result only (a worse retake never costs a pass), no failure record shown as a mark, the pass mark
stated on the card *before* the first question, unanswered counts as **wrong** rather than being
excluded from the denominator (otherwise leaving blanks would be a strategy), and the verdict leads
with the next action — *"Not passed — 33%. 12 more correct answers would do it"* — because a reader
who failed needs a target more than they need a number.

**Exam answers are never stored.** They live in component state for the duration, so reloading
mid-exam restarts it. That is a real cost and the correct trade: a resumable exam with saved
answers is not a timed assessment, and the score would stop meaning anything. Only the *result*
persists, under `vibecoding:exams:v1`.

**Verified live, not just unit-tested:** 10 cards with per-track question counts, a counting-down
clock, no explanation during the exam (revealed only in the review), answer jumping with
answered-markers, a 33% verdict with the gap stated, 24 review items with right/wrong borders and
all 24 explanations, the result surviving a reload, and — the riskiest path — **timer expiry
auto-submitting** with whatever was answered rather than hanging or discarding the paper. Zero
runtime errors.


### 7.0 ✅ RESOLVED (2026-09-18) — Previous/Next phase buttons did nothing

**Was:** the Previous and Next buttons on every phase page had **no effect at all**. Fifty-nine
of the sixty-five phases had never been rendered by any check, so this shipped and stayed.

**The bug, exactly.** `PhaseNav` called `onOpenPhase(prev.id)` — **one argument, a phase id.**
`App`'s handler is `openPhase(tId, pId, anchor)` and treats its **first** argument as a **track**
id:

```js
const openPhase = useCallback((tId, pId, anchor) => {
  let resolved = tId;
  if (!resolved || !findTrack(resolved)) {        // a phase id is not a track
    resolved = null;
    for (const t of tracks) {
      if (t.phases.some((p) => p.id === pId)) {   // pId is `undefined`
        resolved = t.id; break;
      }
    }
  }
  if (!resolved) return;                          // <-- nothing happens
  ...
```

So `tId` received a phase id, `findTrack` rejected it, the fallback scanned for a phase whose id
is `undefined`, found none, and the handler returned. Four call sites were wrong (both variants,
prev and next). Fixed by having `PhaseNav` call `onOpenPhase(p.id)` — one argument, the phase id,
the convention it already used — and `App` supply the track:
`onOpenPhase={(pId) => openPhase(track.id, pId)}`.

⚠️ **`p.trackId` would NOT have worked**, though it looks like the obvious fix: `prev`/`next` come
from the light index, whose 11 fields do not include `trackId`. Verified before choosing.

**Why nothing caught it, and the generalisable lesson.** The data was correct. The buttons
rendered correctly, with the right labels and the neighbouring phase's title and goal. They were
enabled, focusable, and correctly styled. **React's click listener fired on every click.** The
only thing wrong was that the page did not change.

> **A handler that runs and does nothing is invisible to every static check and to any inspection
> that does not click.** Rendering, labelling, enabling and focusing are all properties you can
> assert without ever invoking the behaviour.

This is the **fifth** instance of *correct source, wrong screen, every test green* — and the
purest, because there was no wrong pixel to notice. It was found by `sweep-phases.mjs`
(check 14), which opens all 65 phases and clicks through them the way a reader does. Its first
run reported phases 2–65 all showing phase 1's title.

**Four bugs in that check had to die first**, each found by disbelieving its output:

| Reported | Reality |
|---|---|
| All 65 "card not found" | A track heading opens **phase 1**, not a grid of phase cards |
| Clicks never advanced | Headless had **no viewport**; button at y=18,865px, outside a 450px window |
| 6 phases rendering `undefined` | Legitimate **quiz prose** — "Cosine similarity is undefined for out-of-vocabulary words" |
| 5 phases with no checklist | **Two wrong selectors in a row** — `ChecklistItem` renders a `label.check`, not an `li` |

The viewport one is worth remembering on its own: `--headless=old` without
`Emulation.setDeviceMetricsOverride` gave a **450px-tall window**, and a synthetic `.click()` on
an off-screen element still fires React's handler while changing nothing. The check now sets
1440×1100 explicitly, matching `audit-a11y.mjs`.

**Verified:** all 65 phases pass; negative control (emptying one phase's checklist) fails
**exactly that phase**, exit 1, other 64 unaffected.

### 7.0b ✅ RESOLVED (2026-09-18) — D-008's justification was false

D-008 said the fourteen unreachable modules were kept "because they are **tested pure modules**".

**Nothing tested them.** No `scripts/test-*.mjs` imported any of the fourteen. The claim survived
because `audit-projections.mjs` walks the tree and therefore *mentions* all of them — which reads
like coverage in a grep and is not coverage.

> **A mention is not a test.** And a justification written in prose is the one kind of claim no
> guard in this repository can falsify.

All fourteen were deleted after checking two things that are cheap to assert and cheaper to
falsify: every design principle survives (D-019 in seven other files, D-020 in four, D-021 in
two), and the build is **byte-identical** — 3,910 KB of `dist/` before and after, a 0 KB delta,
which is direct evidence they were never in the bundle.

`audit-projections.mjs` now distinguishes **deleted** from **revived**; it previously reported
both as "reachable again", so deleting them made it fail — the opposite of what happened.

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

Reading `tracks.json` in PowerShell showed the `finetuning` blurb as `changing the prompt — and proving`. **This was PowerShell's console decoding, not file corruption.**

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

> **This section was rewritten. It had become a session log from the period when the corpus
> was still being written — it listed "write the Vibecoding track" as step 9, "create
> `ai-roadmaps/career/`" as step 4, and opened by asserting that `web_search` had started
> working. All three were false by the time anyone would read it: the corpus is complete at
> 65 phases, and `web_search` returns HTTP 402 (see §0.1).** A stale step list is worse than
> no step list, because it is the first thing a new session reads and it is confident.
> Steps that were completed are gone; what remains is what is actually still open.

**The project is at a clean, verified stopping point.** Every commit is pushed, the tree is
clean, `npm test` is 17 checks / 759 assertions green, and the site builds from Markdown at
10 tracks / 65 phases. Nothing below is half-finished.

### The two queued features

1. **A capstone exam across all 10 tracks.** One final assessment over the whole curriculum,
   beside the 10 per-track exams. Two design questions are already settled and should not be
   re-litigated:
   - **It samples rather than includes all 549.** A 549-question sitting is not an exam, it is
     a marathon, and the pass mark stops meaning anything when fatigue is the dominant term.
     A fixed sample of roughly 50–60, drawn across all tracks, keeps the sitting comparable
     between attempts.
   - **It must be weighted per track, or the largest track wins.** Foundations has 82
     questions and Career 24; a uniform sample over the pooled list would make the capstone
     mostly a Foundations exam. Draw a fixed number *per track* instead.
   - `buildExam(questions, trackId, ...)` already takes a question list and filters by
     `trackId`, so this is a new **pool** plus a **sampling rule**, not a new scoring path.
     `gradeExam`, `resultText` and `weakPhases` are all reusable unchanged.

2. **Surface exam results on the dashboard.** A track shows its phases; it should also show
   whether its exam is passed, so a result is visible where the reader actually navigates.
   `useExamResults` already exposes `results[trackId].best.passed`; the work is display only.

**Not queued, and deliberately so:** the share-link (progress in a URL fragment). It was
offered twice and passed over both times. Do not start it unasked.

### What is genuinely unverified

- **Mobile.** Every browser check in this project sets
  `Emulation.setDeviceMetricsOverride`; no one has opened the site on a physical phone.
  Emulation has **already hidden one bug class** — the off-screen-click failure in
  `sweep-phases.mjs` (§12.31), where clicks fired React handlers and changed nothing because
  the target was at y=18,865px inside a 450px window. Treat mobile as **unverified**, not as
  "probably fine".
- **Volatile facts.** §9a's debt table below still stands and has not shrunk: `web_search` is
  off for this account. `docs/SEARCH-REQUESTS.md` is the handoff — a human pastes it into a
  web chat and the answers come back.

### The verification debt, quantified (kept from the original §9a)

Measured, not estimated:

| Debt | Count | Where |
| --- | --- | --- |
| `Volatile` markers in phase files | **45** | `cost` 11, `model-internals` 11, `agents` 9, `prompting` 5, `foundations` 3, `rag` 3, `shared` 2 |
| `**Unverified**` markers in phase files | **0** | none — every marker was resolved *in the phase text* |
| "unverified / could not verify" mentions in research notes | **~107** | `llm-reference-document.md` 36, `fact-check-embeddings…` 29, `fact-verification-report.md` 23, `tokenization-fact-check.md` 19 |

**Read that table carefully, because the numbers mean different things.** The 45 `Volatile`
markers are *correct practice* — each is a dated, flagged claim that says "check this." They
are a **worklist, not a defect list.** The `**Unverified**` count of 0 in the phases is
genuinely good news: no phase shipped a claim it admitted it could not check. The ~107
research-note mentions are the real backlog — the items the missing search tool *forced* into
an unresolved state.

**If you do any content work at all, start there** — but note that nothing in the guard suite
can detect semantic drift (§12.22–23). A phase can be stale in substance and pass every check.

---

## 9b. The authoring loop, if you do write more content

Kept because it is still correct and was hard-won.

**Per phase:** write → `build-content.mjs --check` → `audit-quiz.mjs` → `audit-lesson-ast.mjs`
→ `audit-encoding.mjs` → commit.

```powershell
node scripts/build-content.mjs --check 2>$null; Write-Host "exit: $LASTEXITCODE"
node scripts/audit-quiz.mjs 2>$null | Select-Object -Last 3
node scripts/audit-lesson-ast.mjs 2>$null | Select-Object -Last 3
```

**Expect the quiz guard to fail on your first draft.** It caught a real answer-position skew
in 2 of the 6 Finetuning phases (§12.27). Fix the skew, never the guard.

**Verify volatile claims as you author them** rather than accumulating debt. `web_fetch` works
and is the tool; **`web_search` does not work on this setup (§0.1).** The difference shows in
the corpus: every arXiv id and protocol version in the Finetuning track was checked against
the primary source *before* the sentence was written, so that track carries **no verification
debt at all** — unlike the 42 phases before it.

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
17. **⭐ A GREEN BUILD DOES NOT MEAN THE APP WORKS.** This is the most expensive lesson of the session and the one most likely to repeat. `vite build` exited 0, `build-content.mjs --check` exited 0, `audit-quiz.mjs` exited 0, and `audit-lesson-ast.mjs` exited 0 — while clicking any phase threw React error #31 and rendered a blank page. The cause was two fields whose *element type* was not what I assumed: `topics` is an array of `{ heading, items }` objects and `resources` is `{ name, url }`, not string arrays. A build proves modules **resolve**; it says nothing about whether they **run**. Only a real browser found it.
    - **The generalisation:** for every field you render, verify the shape of an ELEMENT, not just that the array exists. `Array.isArray(x)` passing tells you nothing, and neither does TypeScript-less JS.
    - **The remedy built:** `learning-site/scripts/audit-shapes.mjs` asserts the element type per field, and three CDP-driven browser scripts actually click through the app. See §6.3.
    - **Corollary — a passing browser check can also be a lie.** My first cross-track test reported "only 1 of 10 tracks renders". That was a **test bug**: it held element references across React re-renders, so every click after the first hit a detached node. `debug-tracks.mjs` (one step per evaluate, re-querying each time) proved all 6 written tracks render. **When a test fails, establish whether the app or the test is wrong before changing app code.**
18. **Verify against the PRODUCTION build too, not just the dev server.** A stale `dist/` served a crash that had already been fixed in source, because I edited `PhaseDetail.jsx` *after* the last `vite build`. Both `verify-*.mjs` scripts now take `--url`, and the same suites were run green against `vite preview`. Minified, differently-chunked output is not the same artifact as dev.
19. **Prefer an existing browser over installing a test dependency.** Edge was already on the machine, so browser verification runs over the Chrome DevTools Protocol with a `WebSocket` and `fetch` — both built into Node 24. Zero packages added. `--headless=old` was required; `--headless=new` refused with "Multiple targets are not supported".
20. **Environment traps that cost real time, now written into `vite.config.js`:** (a) a headless-browser profile or an editor temp directory created *inside* the project makes Vite's watcher hit a locked handle and die with `EBUSY` — the config ignores `**/.*.tmpdir/**`; (b) Vite binds IPv6, so `http://localhost:5173` works and `http://127.0.0.1:5173` does **not**; (c) `new URL(x, import.meta.url).pathname` yields `/C:/...` on Windows — use `fileURLToPath`, since the regex workaround breaks on a lowercase drive letter or a UNC path.
21. **A subagent's report is a claim, not a fact — check the specific ones that matter.** The port subagent flagged that my rename script had missed a fourth form (`transfer.js:729` had a bare `"cs-roadmap-"` string concat). It was right, and it was a genuine bug I had introduced. It also flagged the missing `src/data/tools.js`. Both confirmed by reading the files before acting. It was simultaneously wrong about one detail (it guessed `L283` came from a rule that does not match it), which is exactly why detail-level claims get verified rather than trusted wholesale.

22. **⭐ A TOOL CONSTRAINT CAN BE A BLIND SPOT, NOT JUST AN INCONVENIENCE — AND WHEN IT LIFTS, RE-AUDIT WHAT IT HID.** `web_search` was broken for the entire authoring of the 42-phase corpus, and that was handled well: research used `web_fetch` on primary sources, and every arXiv citation was checked against its abstract page. But "we worked around it carefully" is not the same as "we verified everything." Working around a missing tool changes *which* claims get checked, and it does so invisibly.

    The first search run after it was fixed found a real defect within minutes (see §0.2): `agents/07` was not wrong about a date, it was wrong about **what the date meant** — presenting two MCP revisions as a cosmetic difference when one is a stateless rewrite of the other. No amount of careful `web_fetch` would have surfaced that, because nothing was being fetched *wrong*; the gap was in knowing **which questions to ask**.

    The generalisable rule: **when a research capability is missing, record what it prevented you from checking — not merely how you coped.** A workaround log tells the next session the work is sound; a blind-spot log tells it where to look. Then, the moment the capability returns, treat every previously-unverifiable claim as unaudited rather than as previously-verified.

23. **A "technically true but materially misleading" claim is a distinct defect class, and the existing guards cannot see it.** All three content guards passed on `agents/07` before and after the MCP fix, because no guard checks whether a *true* statement misleads. That is not a reason to distrust the guards — it is the boundary of what they can do. Semantic drift is caught by re-reading against the live world, on a schedule the guards cannot enforce. Budget for it explicitly rather than assuming green means current.

24. **⭐ A GUARD THAT CANNOT FAIL IS WORTHLESS, AND A CRASHING GUARD IS WORSE THAN USELESS — IT LOOKS LIKE SUCCESS.** `audit-arithmetic.mjs` was written to catch the `cost/05` bug. Its first version crashed with a `TypeError` on any table whose body rows had more cells than the header, and because **a crash exits 1**, that crash was indistinguishable from a real finding. It appeared to catch the exact bug it was built for while actually checking nothing — and it would have reported the same "failure" on every well-formed table, or passed silently on a real one depending on input order.

    The fix was a bounds check. The lesson is the method: **prove a new guard fails for the RIGHT reason before trusting it.** Re-introduce the original defect, confirm the guard *names it* (`stated 2.4, but 1/60% = 1.67, off 44%`), then confirm the fixed input passes. A guard tested only against known-good input has been tested for exactly one of its two jobs.

25. **A tool that "does not work" may be misconfigured, disabled by something else, or protocol-incompatible — and these need different responses.** The web tools failed three distinct ways this session, and conflating them would have wasted hours:
    - **Misconfigured:** wrong provider ids in a profile patch, so *both* tools failed with "not registered". Fixable by editing two lines, once you find the real ids — which do **not** match the plugin names, so guessing fails.
    - **Disabled by a third party:** the shipped search provider was switched off by *another plugin's* own patch file. The error said "not registered", which reads like a missing install, not like sabotage by a neighbour.
    - **Protocol-incompatible, and not fixable by config at all:** the only shipped search provider requires an Anthropic-style `/v1/messages` endpoint with **server-side** search. The available endpoint serves `/v1/chat/completions`. No setting bridges that.

    The generalisable rule: **read what the error actually says and test the layer beneath it** (the endpoint probe — `401` means exists, `404` means does not — took seconds and settled it). And when the honest answer is "this cannot work here", say so plainly rather than building a shim that converts a real capability into a convincing fake. A proxy that forward-ports the request would have produced **model answers from memory with no sources** — output that looks like search and is not, which under this project's "nothing invented, ever" rule is worse than having no search at all.

26. **⭐ THE SHARED-DOC PARSER HARD-FAILS; THE PHASE PARSER SILENTLY IGNORES. THAT ASYMMETRY IS HOW A DEFECT HID FOR A WHOLE SESSION.** Both facts matter and they point in opposite directions.

    **The hard-failing one is the good citizen.** `scripts/shared-content.mjs` treats every bullet under a `##` heading as a catalogue entry and *must* find a URL in it. Three quirks had to be discovered empirically, each costing a real build failure: the `# H1` is mandatory (without it the title silently falls back to the id); resource bullets must be plain `Name — URL`, because `**bold**` and `[md](links)` corrupt the extracted name; and the bullet regex is `/^\s*[-*+]/` with **no trailing-whitespace requirement**, so it matches `**bold` and `---`. That last one produced two failures from horizontal rules, which strip to `--` and read as a bullet. **Seven failures before the file was acceptable — and every one was reported with a file and line number.**

    **The silently-ignoring one is how the real bug survived.** `findExtraDocs()` at `build-content.mjs:849` is **dead code — never called.** `main()` calls only `findPhaseFiles()`, whose glob is `/^\d+-phase-.*\.md$/`. So the 20 track files that this project had been *tracking as owed work for several sessions* were built into nothing, validated by nothing, and rendered by nothing — and **no guard said a word**, because the phase-side parse simply ignores files it does not recognise. `ai-roadmaps/README.md` L195–199 documents both files as part of every track folder and **is currently false**.

    **The lesson is about what a guard can and cannot notice.** A strict parser protects you from malformed input and is loud. A permissive one protects nothing and is silent — and silence is indistinguishable from success. This is the same shape as lesson 23 (a true statement that misleads) and lesson 24 (a crashing guard that looks like a passing one): **the dangerous failures are the ones that produce no signal at all.** When you write a file that a build is *supposed* to consume, prove it is consumed — grep for the identifier that reads it, or change a word and see whether the output changes. **"The build passed" only means the build ran.**

27. **THE QUIZ-POSITION GUARD EARNED ITS KEEP TWICE IN ONE SESSION, ON CONTENT I HAD JUST WRITTEN.** The answer-position check caught real skews in my own new phases: `ft/01` had **4 of 7 correct answers in position C (57%, ceiling 50%)**, and `ft/06` was worse at **7 of 8 in position B (88%)**. Both are genuine defects — a reader who always picks one position scores well without reading, which corrupts the quiz's entire purpose.

    Two things worth keeping. **First, the skew is invisible while you write.** Nobody drafting questions notices they are placing answers in the same slot; the pattern emerges only in aggregate, which is exactly what a guard is for. It also recurred *after* I had already fixed it once, which says the cause is a drafting habit rather than one careless phase.

    **Second, an overcorrection is also a failure.** My first fix for `ft/06` moved too many answers to position A and produced **5 of 8 (63%)** — still over the ceiling, in the opposite direction. The fix is to aim for an even distribution deliberately (2 per position across 8 questions) rather than to push answers away from wherever they were. **Never edit this guard to agree** — it was right both times.

28. **⭐ THE PARALLEL PATTERN THAT WORKED: 1 SUBAGENT ON INDEPENDENT ARTIFACTS, WHILE THE MAIN AGENT WRITES THE HARD PART.** Six phases (~2,442 lines) and 22 track files (~2,140 lines) landed in one session because the two halves genuinely did not overlap: the subagent owned every file matching `00-overview.md`, `checklist-master.md` and `shared/*`, and the main agent owned `finetuning/NN-phase-*.md`. **No file was written by both, which is why merging was a non-event.**

    **What made it work, and is worth repeating:** the subagent was told to *read the build script and infer the format* rather than being given a format I had guessed, and — critically — **to report what it could not verify**. That instruction is what produced the `findExtraDocs` finding (§6.2), which was invisible from the plan and would otherwise have shipped as a silent defect. **A subagent that reports only success is worth much less than one that reports the boundary of its own knowledge.**

    **What to watch.** The subagent's files were initially rejected by the **shared-doc** parser (7 hard failures), and its report was correct that `audit-encoding.mjs` **scans only `learning-site/` and does not cover `ai-roadmaps/`** — so it verified its own files byte-by-byte separately. Two lessons: give a subagent the *command* to check itself with, not just the goal, and **expect its output to need a format fix even when its content is right.**

    **Do not parallelise across one phase.** Two writers on the same file, or on two phases whose IDs must stay in sequence, will collide. **Parallelise across artifact *types*.**

29. **A guard that has only ever passed is not evidence. Prove it can fail.**
    `audit-encoding.mjs` could not detect mojibake **at all** — not "missed some", but **structurally incapable** — and had been reporting `✓ all files are clean` for the project's entire history. The table was built with raw UTF-8 **byte** values (`String.fromCharCode(0xe2, 0x80, 0x94)`), but `fromCharCode` yields **characters**, and `check()` searched text already **decoded** as UTF-8, where the same corruption appears as `U+00E2 U+20AC U+201D`. The pattern and the haystack could never meet. **A guard whose failure mode is silence is worse than no guard**, because it converts "unknown" into "known good" in the reader's mind.

    **How it was actually caught — the reusable procedure, in order:**
    1. **Widen the scope first.** `SCAN` covered only `learning-site/*`, so it had never once read `ai-roadmaps/` — the 48 curriculum phases, the files most likely to carry a bad character and the ones where it does the most damage, since the garbage lands in rendered lesson text. Scope gaps and detector bugs are **different faults**, and widening is how the second one became visible.
    2. **Test that the widened guard CAN FAIL** — inject real corruption into a real file and confirm a non-zero exit. It passed instead. That single experiment is what exposed the bug.
    3. Only then fix the detector, and re-run the injection to prove the fix.

    **The damage it had been hiding:** 100+ corrupted characters in `foundations/01-phase-what-a-model-is.md`, in **four different corrupted spellings** (em dash, en dash, left double quote, left arrow) — because the same bytes decode differently per single-byte codepage, and Latin-1, cp1252 and MacRoman each map the `0x80–0x9F` range differently. The worst instance was the lesson's **own title**: `# Phase 1 — What a Model Actually Is`, rendering as garbage in the **H1 of the first lesson in the curriculum**. `HANDOVER.md` had three more.

30. **A mojibake table is never finished by reasoning. It grows by finding real damage.**
    Four variants were added, **each one discovered rather than predicted**, each proved by injecting that exact sequence. Guessing the set of possible corruptions in advance produces a table that looks thorough and misses the one in front of you. When a new variant appears: add it, fix the file, and **prove the new entry fails** — an entry that never matches is indistinguishable from a working one until a reader sees the garbage.

31. **⚠️ Fixing an encoding bug can introduce a WRONG CHARACTER, and the guard will not catch it.**
    The first repair pass mapped a corrupted **en dash** onto `U+201C`, a **left double quote**, turning `at 1–2 hours a day` into `at 1“2 hours a day`. The encoding guard went **green immediately** — `U+201C` is a perfectly legitimate character it has no reason to flag. **Encoding validity and textual correctness are different properties**, and only the first is mechanised. Repair with a **context-aware rule** (here, a regex replacing a quote only *between two digits*) rather than a blanket substitution, then sweep the corpus for the same mis-mapping.

32. **Read codepoints from the FILE, never from the console. Both directions of this error occurred in one session.**
    `Get-Content` rendered a perfectly good `U+2014` as `—` and made a **clean file look corrupted**; the same display artifact nearly caused a **real corruption to be dismissed as cosmetic**. PowerShell's console is a rendering layer that lies about encoding. The only trustworthy check is reading bytes and codepoints directly, which is why every encoding claim in this file is written that way.

33. **An argument from ABSENCE is only valid when the source is COMPLETE.**
    The research report inferred "the arXiv page lists no conference ⇒ probably unpublished" and applied it to six papers. **It was wrong four times** — FlashAttention-2 (ICLR 2024), FlashAttention-3 (NeurIPS 2024 main track), Medusa (ICML 2024) and Lookahead decoding (ICML 2024) are **all peer-reviewed**. arXiv routinely omits the venue even for papers that were definitely published, so *absence of a venue on arXiv is not evidence of anything*. Settle venue claims at the proceedings page, OpenReview, ACL Anthology or the publisher DOI.

    The generalisable shape: *"I did not find it"* silently becomes *"it is not there"*, and those are the same statement only when the source is exhaustive. Before drawing a negative conclusion, ask whether the source **would** contain the fact if it were true — an optional metadata field is not an authoritative one.

34. **A subagent's summary is a claim, not evidence. Re-derive the load-bearing ones yourself.**
    The venue sweep came back with seven corrections. I re-checked the two that mattered most, from the primary source rather than the report: Medusa **is** ICML 2024 (confirmed at the ICML virtual site and PMLR v235, whose camera-ready abstract states **2.3–2.8×**, so the arXiv `3.6×` really is wrong for the published version), and cellular batching **is** EuroSys 2018 (confirmed at the MADSys page, whose PDF filename is `EUROSYS2018-gao.pdf`). Both held. **The check is cheap and the failure mode is expensive** — a confident, well-formatted table of findings is exactly the artifact that gets trusted without being tested.

35. **⭐ Separate the RESEARCH NOTE from the LESSON when judging whether a defect reached the reader.**
    The sweep found real errors — Medusa's speedup, two FlashAttention-3 TFLOPs figures, Anyscale's `23×`, Mixtral's parameter count. **None had reached the curriculum.** No phase cites any of them, and where a phase does carry a contested figure it went to the primary source: `model-internals/02` quotes Mixtral's abstract directly (*"each token has access to 47B parameters, but only uses 13B active parameters"*), which I fetched and confirmed is **verbatim**, so the lesson is right while the note *about* it was wrong. **Where a defect lives determines its severity**, and "the research document contradicts itself" is a much smaller problem than "the lesson teaches a wrong number" — worth establishing deliberately rather than assuming either way.

36. **Measure the backlog before accepting its size.**
    The task was scoped as "~107 unverified claims". The real number was **11**. The earlier figure counted **mentions of the word** "unverified" across `docs/research/`, not distinct unresolved claims — an easy and self-flattering error, because a bigger backlog justifies a bigger effort. Counting the actual list took one command and changed the plan: 11 items is a sweep, not a project.

37. **⚠️ A commit message is testimony, not evidence — and a bad "correction" is worse than an open question.**
    `agents/07` stated that **`2025-11-25` was the current stable MCP revision** and `2026-07-28` merely "modern". **The truth is the reverse:** the spec's own versioning page says in bold that *"the current protocol version is 2026-07-28"*, the site header renders **"2026-07-28 (latest)"**, and `2025-11-25` is filed under *"handshake-based protocol revisions (`2025-11-25` and earlier)"* — superseded. A learner was being told to target a **dead** revision.

    **What makes this the most instructive defect in the project:** it had already been flagged once. Commit `3fd5a9b` is titled *"Correct agent/07 on MCP revisions"* — and its message **asserts the same inverted claim**. A previous session spotted a real problem, resolved it in the **wrong direction**, and wrote a confident narrative explaining the wrong conclusion. **The commit message then made the error look settled**, so the next session found a lesson that appeared to have been recently checked. When you write "corrected X", record **what the source actually said**, not just what you concluded — otherwise the correction becomes a claim with your authority behind it and no evidence underneath.

    Corollary: **a fixed flag is more dangerous than an open one.** An open question invites re-checking. A closed one with a confident message suppresses it.

38. **"Technically true" is not the bar. Ask what a learner would DO with the sentence.**
    Both defects found this round were that shape. `agents/07` was not false in its *facts about each version* — the stateful/stateless comparison was accurate — but it **inverted which one to target**. And `cost/05`'s table was correct in **every cell** while the sentence beneath it drew a wrong conclusion (level at "40%" when the numbers give 38%). **The defect lives in the relationship between the data and the claim, not in either alone** — which is exactly why cell-checking guards miss it, and why `audit-arithmetic.mjs` now reads prose as well as tables.

39. **Mark the gap rather than filling it with something plausible.**
    `prompting/04` listed supported/unsupported JSON Schema keywords as though authoritative. The per-provider tables **could not be fetched** (OpenAI 403s the direct URL; Anthropic's page truncates before the section). The fix was to reframe the list as *illustrative of the kind of gap*, add the verified part, and mark the keyword detail **`**Unverified**`** — **the first such marker in the corpus**, which until now had zero despite the rule existing since the start. **A plausible list nobody can check is worse than an acknowledged hole**, because the hole is visible and the list is not.

40. **Verify a formatting fix BEFORE mass-applying it, and check what it breaks.**
    Eleven `####` headings sat jammed against the preceding paragraph with no blank line. I checked whether they still **parse** (against the generated lesson JSON, not the markdown — the artifact the site renders) and they do, so this became a **fragility** fix rather than a rendering fix: valid under CommonMark's relaxed rules and dependent on them. Worth the check, because the obvious assumption "jammed heading = broken page" would have been wrong and the fix would have looked more urgent than it was. **Then my own fix introduced 691 CRLF endings**, because `WriteAllLines` uses `Environment.NewLine`. The encoding guard caught it in seconds. **Every mechanical rewrite needs a guard run immediately after, not at the end of the session.**

41. **⭐ An unconstrained subagent multiplies its own cost — say "do not delegate" explicitly.**
    The DeepSeek balance hit **HTTP 402 (Insufficient Balance)** mid-session, which killed `web_search` while `web_fetch` kept working (separate provider). The cause was **not** search volume. Measured from the provider source, one search request is tiny: the body is literally `{"text": "Perform a web search for the query: <q>"}`, `max_tokens: 4096`, `max_uses: 5` — roughly **30 input tokens**, confirming the documented `~$0.001/query` estimate. `max_uses: 5` was never the problem.

    The drain was **delegation**. The subagent's own closing report: *"3 subagents and roughly 45 web_fetch/web_search calls… each one is a separate agent with its own full context that independently ran its own dozens of searches and fetches."* Three nested agents, each with an independent context, each re-fetching large documents. **`web_fetch` is the real cost centre**, not search: an arXiv abstract page is **10–40 KB of text** that enters context as input tokens, and on a subagent it enters a *fresh* context every round.

    **My prompt caused this.** It said "prepare" and included build commands, which reads as licence to construct things, and it never said *do not delegate further*. A capable agent handed a large research task parallelises by default. **Every subagent prompt in this repo should now carry an explicit delegation bound and a call budget.** The user's standing "always exactly 1 subagent" rule governs *my* fan-out; it does not automatically constrain what that subagent does next.

42. **A guessed identifier is not a citation — verify the ID resolves to the paper you mean.**
    Twice in one session I fetched an arXiv ID from memory and got a **completely unrelated paper** (`2305.14328` is culturally-aware machine translation, not a specification study; `2308.16512` is multi-view 3D diffusion, not test generation). Neither was obvious from the URL — both returned HTTP 200 with a real abstract, so the failure mode is silently citing the wrong work. **The title is the check**: read it before reading the body, and if it does not match the claim you intend to support, you have the wrong document. The fixes were found by searching for the *finding* rather than the *number*, which is the reliable direction: `2406.10279` (package hallucinations) and `2402.13521` (TDD for code generation) were both located that way and both verified from their own abstracts.

43. **⭐ Write instructions for the READER you are actually sending them to — a handoff document has one audience, and mixing them fails silently.**
    The relay mechanism for web search failed **three times in a row**. The cause was not the questions: the file written for the human to paste contained the line *"**Do not call `web_search`.** It is off by decision and will return 402"* — addressed to **me**, the agent. A web chat reads that as addressed to **itself** and correctly declines to search. It also described `web_fetch`, a 402 error and a filesystem, none of which a chat has, so the chat replied by asking which of three options was meant. **Every relay came back with zero answers and a clarifying question, and each time I assumed the problem was the questions.**

    Three defects, all the same root cause: **one document serving two readers.** (1) It instructed its reader not to do the thing it was sent to do. (2) It addressed a reader with different capabilities. (3) The 12 questions sat inside ~306 lines, **~170 of which were my internal bookkeeping** — protocol header, my `web_fetch` log, resolved history from earlier sessions — so a willing reader still had to excavate them.

    **The fix is structural, not editorial:** two files with declared audiences. `docs/RELAY-PASTE.md` (58 lines) is written **for the chat**, contains questions and reply instructions only, and is verified to contain **zero** occurrences of `web_fetch`, `402`, `grep`, `DeepSeek`, `subagent` or "Do not call". `docs/SEARCH-REQUESTS.md` keeps the agent-side protocol and now opens with a banner: *paste the other file, never this one*.

    **The transferable lesson:** when a handoff fails, read what the recipient actually received before revising the content. I rewrote the questions twice and never once re-read the document from the recipient's position. **A document that addresses two audiences will be obeyed by neither.**

44. **The encoding guard's detection was never the problem — using the wrong write API is.** Rebuilding `SEARCH-REQUESTS.md` with PowerShell's `WriteAllLines` immediately produced **290 CRLF endings and 41 corrupted characters** (38 em dashes, 5 left double quotes, plus a warning sign, an ellipsis and a right arrow). This is the **second time** this exact bug has appeared in this project, and the first time it was also self-inflicted. The guard caught it within seconds and named every line, which is the payoff of having fixed that guard earlier in the session.

    Two things worth separating. **The guard works.** And **the repair needed two passes** because the first mojibake table covered em/en dashes and quotes but not `⚠️`, `…` or `→` — so after the first repair, 3 corrupted characters remained. The check that found them was counting `U+00E2` occurrences rather than trusting the guard's clean verdict, because those three were not in the guard's table either. **A guard that passes is not proof of completeness if its table is finite** — count the signature byte instead.

    **The rule, now stated twice in this file and still violated: never use `WriteAllLines`/`WriteAllText` without checking line endings, and run the encoding guard immediately after any mechanical rewrite.** The safe path in PowerShell is `[System.IO.File]::WriteAllText($p, $text, (New-Object System.Text.UTF8Encoding $false))` with `\n` already in the string.

45. **⭐ A relay carries ONE artifact, and a document ABOUT the artifact is not the artifact.** The fourth relay failure, and the most instructive. After fixing the audience problem (lesson 43) I asked the user to paste `RELAY-PASTE.md`. What reached the search assistant was **not that file** — it was a *review of* that file: a message describing what the paste contained, assessing its strengths, and proposing three edits. The assistant did the only sensible thing with a document that reviews a research request: **it reviewed the research request**, and again asked which of (a)/(b)/(c) was wanted. **Zero answers for the fourth time.**

    The cause this time was not the document's contents but **the relay itself**. A file passed through a human can arrive as the file, as a summary of the file, as a critique of the file, or as a conversation about the file — and from the receiving end there is no way to tell which was intended. Three separate audiences now existed: the search assistant (wants questions), the human (wants a thing to paste), and the agent (wants protocol).

    **The fix is to remove the human's judgement from the loop.** `PASTE-THIS.txt` lives at the **repo root**, is plain text, opens with the literal instruction *"Please search the web and answer the 12 questions at the bottom of this message"*, and is **generated from `RELAY-PASTE.md` by dropping only the markdown title line** — so the two cannot drift. Verified to contain **zero** occurrences of `web_fetch`, `402`, `grep`, `DeepSeek`, `subagent`, "Do not call" or `SEARCH-REQUESTS`. The human's entire task is now "open this file, select all, paste" — no interpretation, no summarising, no choosing.

    **The generalisable rule: when a handoff must pass through a person, the artifact should require no judgement from them.** Every relay that depended on the human deciding *what* to send failed. The moment the instruction became "paste this one file verbatim" the ambiguity had nowhere to live. Note also that the review *was substantively good* — it correctly spotted that Q2 and Q3 overlapped, that the date belonged in the first sentence, and that Q12's statute half would make an assistant redo finished work. **All three fixes were adopted.** A failed relay can still carry useful content; the failure is in the packaging, not necessarily in the thinking.

46. **An unexpected result from your own instrument is evidence about the instrument first, and the subject second.**
    Three separate false alarms in one session, all the same shape. **(a)** A `node -e` one-liner crashed with *"Cannot read properties of undefined"*; I read it as a quiz question missing its `- [x]` marker and started hunting the file. The bug was mine — `pos['ABCD'][findIndex(...)]` — and decoding the six segments properly showed `options=4 xIndex=1..3` on every one. **(b)** Console output showed `â€"` and I began diagnosing mojibake in a file that had **0** occurrences of the signature byte `U+00E2` and 94 real em dashes (see lesson 44 for that console trap, which I walked into again anyway). **(c)** A browser probe set `location.hash` on every route, got an identical **20,368 characters** back, and I concluded the routes were broken — but `src/App.jsx` lines 4–15 document that routing is **deliberately** a string in `useState` with no deep-linking. Probing by **clicking** passed both new tracks immediately.

    In each case the right first move was to check the instrument — decode the data properly, count the signature byte, read the source — before touching the thing being measured. **Three times in one session is a habit, not bad luck.** The tell is an *identical* or *absurd* result: 20,368 chars on every route is not a routing bug, it is a probe that never navigated.

47. **⛔ `git add -A` is unsafe while a subagent is running in the same working tree.**
    Commit `ca2d822` swept in `.dsh-sc05-check.js`, a throwaway verification script a subagent wrote to check its own work, **plus an unverified mid-flight draft** of that subagent's lesson. From inside git, a subagent's scratch output is indistinguishable from a deliverable — it is just a new file. The subagent reported this itself and correctly declined to fix it, since its brief forbade creating or committing files; the fix was mine (`git rm`).

    **Two rules follow.** Stage explicitly by path when a subagent is active, or wait for subagents to settle before committing. And **put "create no other file, and no scratch check scripts — use inline `node -e`" in every subagent prompt**: when the next brief carried that constraint, `git status` showed exactly one modified file and one new lesson, with no strays.

48. **⛔ A browser check reads the BUILD, not the source — verify `dist` freshness before believing a rendering failure.**
    The site showed only 8 tracks and still said *"not yet written"* for the two new tracks, while **every content guard was green** — because the guards read the source markdown and the generated JSON, never the built assets. The real cause: `dist` was built at **17:09** and the content data regenerated at **17:40**, so nine lessons existed in `src/data/generated/` but were not in the shipped bundle at all. `npm run build` fixed it.

    This is the **second** stale-build misdirection in this project (the first was `check-browser.mjs` reporting *"#root is empty / app did not mount"* when the actual cause was no preview server). **When a browser check fails, check the build and the server before reading anything into the failure.** Ordering to maintain: regenerate content → build `dist` → start or restart preview → probe. A preview server started before a rebuild serves the old bundle until restarted.

49. **A subagent's self-report is not a verification result — check each claim separately, because they mix true and false.**
    The phase-5 subagent's final report contained one claim that was **false** (that the committed `## Lesson:` heading read *"What Is Actually Scarce Now"* instead of the required *"Career in the AI Era"* — the committed heading was already correct) sitting alongside one that was **true** (that the committed quiz had an illegal `C=4` answer clustering, which I had doubted and which the recount confirmed: `A=0 B=1 C=4 D=1`). Treating the report as wholly right or wholly wrong would both have been mistakes. The same pattern appeared again when the phase-4 subagent flagged `00-overview.md` as still marking Phase 4 *"Planned"* — it was **already** fully updated, a stale read on its part.

    **Verify subagent claims individually against the artefact, and never edit a correct file to satisfy an outdated report.**

50. **⛔ THE SITE WAS RENDERING COMPLETELY UNSTYLED AND EVERY GUARD WAS GREEN — a stylesheet is a contract between JSX and CSS, and nothing was checking it.**
    Found by **screenshotting the app and looking at it**, which nothing in the suite did. `global.css` was 3634 lines and styled 344 classes, but it was missing **every top-level layout class the components use**: `.main`, `.topbar`, `.skip`, `.footer`, `.phasegrid`, `.statgrid`, `.toolgrid`, `.breadcrumb`, `.plainlist`, `.linkish` and about thirty more. The topbar collapsed into a raw row, the stat block drew as a vertical list, and cards stacked full-width with no grid.

    **Why nothing caught it:** every existing check reads CONTENT. The build guards read Markdown and generated JSON; `check-browser.mjs` asserts expected *text* appears in the DOM; the shape audit inspects JSON fields. A class with no CSS rule changes no text and breaks no JSON field, so the entire suite stayed green while the page looked broken.

    **Why the classes were missing, which is the transferable part:** the file contains `.app-shell` / `.content` / `.sidebar`, and hyphenated `.phase-grid` / `.stat-grid` — a shell and grids **the app does not render**. The components render `.phasegrid` and `.statgrid` with no hyphen and no shell wrapper. So the stylesheet was written against one DOM shape and the app was built to another, and no check compared the two. Two orphan rules tell the same story: `.topbar__where` carried the only `flex: 1` separating brand from controls, and `App.jsx` renders no such element — which is *why* the topbar collapsed.

    **Fixed** with a pure-append 706-line block (all values from existing tokens, responsive grids, a real skip link), and **guarded** by a new `learning-site/scripts/audit-css.mjs` that fails when any class referenced in JSX has no rule, or any bare `var(--x)` has no definition. It was **proved to fail for the right reason** against the broken stylesheet: exit 1, naming all 40 classes with the files that use them. Wired into `npm test` and CI.

51. **A guard's blind spot is exactly as wide as the selector it uses to find its input — this project has now hit that THREE times, and twice in one session.**
    First instance (already in §12): `audit-encoding.mjs` scanned only `learning-site/*` and reported clean while never opening the 48 curriculum phases. Fixed then by adding directories.
    Second instance, this session: the **same guard** decided coverage by file **extension**, so `.gitignore` (no extension), `.editorconfig` and `.github/workflows/*.yml` were never opened. A stray CR landed in `.gitignore` and **git itself warned on push** — the guard had reported "all clean" because it had never read the file. Fixed by adding `.github`, the root docs, and an `EXTENSIONLESS` set; files scanned went **190 → 200**. Proved by injecting CRLF into `.gitignore` and watching it exit 1 with `.gitignore: 38 CRLF line ending(s)`.

    An extension list, a directory list, or a hardcoded file list all fail **silently** and report success on everything they never looked at. When adding a check, ask what input it *cannot* see.

52. **⛔ TWO GUARDS DID NOT DO WHAT `AGENTS.md` SAID THEY DID — test the contract by breaking it, not by trusting the doc.**
    `AGENTS.md` claimed *"a guard checks ordering positionally, so a misspelled or reordered heading fails the build."* I mutated each of the 14 documented sections in turn and measured. Two of the three claims were **false**:
    - **Nothing compared section ORDER to anything.** `MANDATORY_SECTIONS` carried the docstring *"in this order"*, `splitSections` dutifully collected the order, and no code ever looked at it. Swapping `## Goal of this phase` with `## Estimated time` built cleanly.
    - **`## Specific topics to learn` and `## Common Pitfalls` were in no guard list at all**, so renaming one to `## CommonPitfalls` passed every check. This is the worse failure, because an unrecognised `##` heading is **not an error to the parser** — it is silently absorbed as body text. The file looks correct in an editor while content stops rendering in the right place.

    Fixed by adding `SECTION_ORDER` (the full 14-section contract) with an order check and a **near-miss detector** that reports *"spelled X, contract requires Y"* rather than a bare "missing", since a typo and an omission need different fixes. Re-ran the same 14-case harness: **all 12 mutable spellings now caught, plus the reorder**; the 2 rows still reading "NOT CAUGHT" were **my harness's** fault (it built the mutation by stripping spaces from the heading, and `Checklist`/`Quiz` have none — the "mutation" was a no-op). Tested properly: `## Check list` is caught by the near-miss check, `## Quizes` as missing. The corpus was already correct — 65/65 pass, zero pre-existing violations.

53. **Suspect the instrument before the subject — this fired SEVEN times in one session, and it is now the single most common failure mode in this project.**
    New instances this session, all of which produced a confident wrong answer first:
    - An inline `node -e` regex containing `\.(jsx|js)$` had its **`$` eaten by PowerShell** before node saw it. `walk()` returned **zero files** and the audit reported **all 17 hooks as never imported**. An alphabetical list of everything being dead is absurd on its face — that is the tell. Moved to a script file: the real answer is **2** (`useCertifications`, `useSchedule`); `useApplications` and `usePortfolio` are genuinely used by `DataTransfer.jsx`. **A stale "four dead hooks" note in this project was wrong on two of four.**
    - A probe looking for an `o.correct === true` flag on quiz options returned an **all-zero histogram across 549 questions**. Options are plain **strings** in the generated JSON with the answer named by `answerIndex`; `correct` is a shape the Quiz component builds at runtime. Real spread: **A99 / B148 / C161 / D141**.
    - The same UI probe reported `h1-count=0`, `main-landmarks=0`, `focusRules=0` for every view. **All three false** — the click helper silently failed (so every "view" audited the dashboard) and `document.styleSheets` throws on cross-origin rules. Fixed the probe to **assert navigation happened** before auditing and to **count** unreadable stylesheets instead of swallowing them.

    **The rule:** an implausibly large, implausibly small, or suspiciously identical result means the QUERY is wrong. And once a number is written down it is repeated as fact — three of the errors above were me trusting an earlier note rather than re-measuring.

54. **⛔ I built `dist` with `VITE_BASE=/vibecoding/` for the Pages test and then served it from the preview root — a completely BLANK page, and I had already written the warning about this exact failure.**
    The HTML requested `/vibecoding/assets/index-*.js`, the preview server did not have it, and it returned the `index.html` fallback instead of JavaScript. No console error names the cause. Rebuilding without `VITE_BASE` fixed it. **`VITE_BASE` set in a shell and forgotten makes every subsequent build wrong** — and if the site is blank, read what `dist/index.html` actually references *before* debugging anything else.

55. **A bad `edit` silently corrupted a CSS declaration, and the only thing that caught it was re-reading the file.**
    An `edit` whose `old_string` ended mid-line left `color: var(--text);g-subtle);` — a truncated declaration. The build still passed and the guard still reported clean, because a malformed *declaration* is not a missing *class*. Caught by reading the changed region, repaired, and verified with a brace-balance count (depth 0, min 0) plus a check that the corrupted fragment was gone. **After appending a large block to a file, re-read the region you touched** — do not assume the tool did what you meant.

56. **A document that is wrong about the code is worse than a silent one — and this session corrected three separate stale claims in the project's own docs.**
    - `HANDOVER.md` §13 said `npm test` runs **5** offline checks; it now runs **9**.
    - `AGENTS.md` said `build-content.mjs` writes notes to **stderr**; its one-line PASS summary goes to **stdout** and only genuine failures go to stderr — which means `| tail` can display the pass line from a run that **failed**. Replaced with the precise behaviour and an explicit "check the exit code" instruction.
    - `DECISIONS.md` D-008 said **four** career hooks remain unported; only **two** are unreferenced.
    Docs that describe enforcement are load-bearing: an agent reads `AGENTS.md`, believes it, and skips the check. **When you change a guard, change the doc that describes it in the same commit.**

57. **`verify-site.mjs` had been driving SOMEBODY ELSE'S WEBSITE, and reported 13 of 15 checks failed on a perfectly healthy project.**
    Its default URL was `http://localhost:5173` — the Vite **dev** port — and a completely unrelated app (a restaurant reservation page, `<title>you've got a table reserved 🌧️</title>`) was listening there. Run with no argument, the script navigated to that app, found none of this project's markup, and produced fifteen lines that read exactly like a catastrophe. **The site was fine. The instrument was pointed at the wrong subject.**

    This is instance **14** of *suspect the instrument before the subject*, and it is the most expensive shape that rule takes, because the output is not merely unhelpful — it is *confidently wrong in the alarming direction*. Two fixes, and the second is the one that matters:

    - The default is now **4173 (preview)**, and the two corpus totals it asserted — `/42/` phases and `/706/` checklist items — are now **read from the built data** instead of hardcoded. They had gone stale when the corpus grew to 65 phases and 1054 items, so the check was measuring a memory of the corpus rather than the corpus.
    - A **preflight** fetches the URL before launching a browser and refuses to continue unless the HTML is this project. A wrong port now yields one line naming the actual app and its title, instead of thirteen misleading failures.

    **The lesson generalises past ports: before believing a wall of failures, confirm the thing you tested is the thing you meant to test.** Cheap check, and it converts a fake catastrophe into a one-line diagnosis. Same family as lesson 54 (`VITE_BASE` left set, blank page, no error naming the cause).

58. **Two documented counts and one default port were wrong, and all three failed in the direction of wasted time rather than a caught bug.**
    A hardcoded expected value in a guard is a claim about the artifact that nothing re-checks. `/42/` and `/706/` were correct when written and silently wrong later, and the suite stayed green through it because `verify-site.mjs` is not in `npm test` — it needs a running preview server. **A check that only runs when a human remembers to run it will not notice when the world moves.** Prefer deriving an expectation from the source of truth over restating it.

---

## 13. What "done" looks like

The user's five-part objective, **as clarified mid-session**. The user later narrowed the emphasis: *"just want to really build a skill and knowledge so maybe i can get even ai job someday"* — so item 5 below is now a primary goal, not a footnote.

1. **A complete curriculum** covering the full AI-era arc: foundations → LLMs → prompting → RAG/agents → fine-tuning → safety → career — **63 phases across 10 tracks** (**42 done, 21 to go**)
2. **Deep vibecoding craft** — the 8-phase Vibecoding track
3. **Model internals and vocabulary** — tokens, context, KV cache, attention, sampling, embeddings (largely covered by Foundations + Model Internals, both complete)
4. **Cost and efficiency mastery** — token economics, caching, batching, routing, monitoring, local-vs-API — **plus the zero-budget freemium playbook** (`cost/07`)
5. **Employability** — proof of skill, a portfolio that demonstrates judgement, and a concrete job-search and first-90-days plan (**the new Career track**)
6. ✅ **A working learning site** that renders it all, with search, progress, and quizzes — **done, and verified in a real browser against both the dev server and the production build.** (A separate "Today view" was never built; the sibling project's `lib/today.js` exists but is not wired to a page. Decide whether it is wanted before porting the page around it.)

**Success criteria that must hold at the end:**
- `node scripts/build-content.mjs --check` → exit 0
- `node scripts/audit-quiz.mjs` → exit 0
- `node scripts/audit-lesson-ast.mjs` → exit 0 with **0 character loss**
- Build report shows **0 task ids minted from position**
- Every ID authored; every paid tool row has a free alternative
- **Every phase has a `## Free vs Paid` section that is honest about what free gives up**
- `npm test` in `learning-site/` → exit 0 (**9** offline checks; it was 5, then 6 after the CSS guard, then 9 after three unit suites)
- `npm run test:browser` → all green (needs the dev server running)
- Everything committed

**Status of those criteria right now:** all content guards green; `npm test` green (9/9 offline, 135 unit assertions); browser suites green (25 checks) on dev **and** production. The remaining gap to "done" is **content**, not the site: 21 of 63 phases across 4 tracks.

---

## 14. Standing design principles for the remaining 21 phases

These emerged from the user's clarifying question and should govern everything still to be written.

**1. The freemium constraint is a design input, not a disclaimer.** Every phase must be completable on ₱0. Where a paid mechanism is genuinely unavailable on free tiers, teach the **mechanism** and give a **local or simulated substitute** — the concept is separable from the vendor implementation. Never let a task be impossible without money.

**2. Teach mechanisms, not vendor features.** The volatility rule (§5) exists for this. A learner who understands prefix-reuse can reason about any provider's caching product, including ones that do not exist yet. A learner who memorised one provider's cache API cannot.

**3. Judgement is the thing being trained.** Generation is cheap now. What is scarce — and what the Career track will sell — is telling plausible from correct, verifying claims, and specifying precisely. Every phase should leave the reader better at *evaluating* output, not just producing it.

**4. Honesty over encouragement.** Where something is hard, say so. Where a free tier gives up something real, name it. Where the job market is noisy, admit it. The user is making a life decision on this material and flattery would be a disservice.

**5. Evidence over assertion.** Every measurement the curriculum asks for is written down in a deliverable. The portfolio is built from those deliverables. This is why the deliverable sections are mandatory rather than optional.
