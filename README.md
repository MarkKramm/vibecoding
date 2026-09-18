# Vibecoding — a free curriculum for the AI/LLM era

**▶ [Read it live at markkramm.github.io/vibecoding](https://markkramm.github.io/vibecoding/)**

A structured, self-paced curriculum for learning how modern AI systems actually work, how to
build with them without shipping things you cannot verify, and how to get hired doing it.

**65 phases across 10 tracks · 549 quiz questions · ~35,600 lines of authored Markdown ·
written for a $0 budget.**

Written for someone starting from beginner-to-intermediate, working remotely, with no
professional network and no budget. Every phase is designed to be completed with free tools.

---

## What this is

Most AI learning material is either a tool tutorial that expires in six months, or a research
summary that assumes a graduate degree. This is neither.

The organising claim is that **generation became cheap and judgement did not**. Code that
looks right is now trivial to produce, which means the scarce skill is telling whether output
is correct, knowing what to build, and being accountable for a system. Every track is built
around that: the goal is not to use AI tools, it is to be the person who can be trusted with
one.

Three commitments run through all of it:

**Reasoning over assertion.** Claims are argued from mechanism, not stated as facts to
memorise. Where a claim is empirical and could not be confirmed, it is marked
`**Unverified**` rather than smoothed over.

**Honest about limits.** Every phase states what its techniques do *not* do. Several phases
explicitly separate what is *established* from what is *contested* from what is
*speculative*.

**Free is the default, not the compromise.** Where a paid option exists, the phase says what
it would actually add and whether it is worth buying — usually it is not.

## The 10 tracks

| Track | Phases | What it covers |
|---|---:|---|
| **Foundations** | 8 | What a model is, tokens, attention, sampling, embeddings, reading output |
| **Model Internals** | 6 | Inference anatomy, transformers, KV cache, quantization, serving |
| **Prompting** | 7 | Prompt anatomy, few-shot, reasoning, structured output, failure modes |
| **Retrieval & RAG** | 7 | Why retrieval, chunking, vector search, reranking, evaluation, debugging |
| **Agents & Tools** | 7 | Agent loops, tool calling, subagents, memory, human-in-the-loop, MCP |
| **Finetuning & Evals** | 6 | When to finetune, LoRA/PEFT, datasets, evaluation, distillation, running evals |
| **Cost & Efficiency** | 7 | Token economics, caching, batching, routing, monitoring, local vs API |
| **Vibecoding Craft** | 8 | Specification, reading generated code, tests as contract, debugging, shipping |
| **Safety & Ethics** | 5 | How models go wrong, security and privacy, alignment, using AI honestly |
| **Career & Getting Hired** | 4 | What employers want, portfolio, proof of skill, interviewing and first 90 days |

Tracks are designed to be read in order, but each phase stands alone and states its
prerequisites.

## Every phase follows the same contract

This is enforced by a build guard, not by convention. Each phase has exactly 14 sections in
fixed order: goal, estimated time, skills gained, topics, tools, free resources, a written
lesson, hands-on tasks, common pitfalls, a deliverable, a checklist, a quiz, exit criteria,
and a free-vs-paid breakdown.

The parts that make it usable rather than readable:

- **Hands-on tasks with stable authored IDs**, banded `quick` / `focused` / `deep` /
  `ongoing` and tagged `low` / `normal` / `high` energy — so you can pick work matching the
  time and focus you actually have.
- **A quiz per phase** with one correct answer out of four, and a `**Why:**` line explaining
  the reasoning rather than just confirming the answer. Answer positions are checked by a
  guard to prevent clustering that would let you score without reading.
- **A concrete deliverable** and a checklist you can honestly self-assess against.
- **Exit criteria** stating what you should be able to do before moving on.

## Running it locally

Requirements: **Node 24+**. No accounts, no API keys, no paid services.

```bash
cd learning-site
npm install
npm run dev          # http://localhost:5173
```

To build and preview the production bundle:

```bash
npm run build
npm run preview      # http://localhost:4173
```

**Windows note:** the dev server binds IPv6 only, so use `http://localhost:5173` rather than
`http://127.0.0.1:5173`.

## Verifying the content

The content contract is machine-checked. Run these from the repository root:

```bash
node scripts/build-content.mjs --check          # 14 sections, order, IDs
node scripts/audit-quiz.mjs                     # quiz structure, answer balance
node scripts/audit-lesson-ast.mjs               # markdown -> JSON fidelity
node learning-site/scripts/audit-arithmetic.mjs # numbers stated in prose
node learning-site/scripts/audit-encoding.mjs   # LF, UTF-8 no BOM, no mojibake, no tabs
```

Or all of the site checks at once:

```bash
cd learning-site && npm test
```

CI runs all of these on every push. The Pages deploy refuses to publish if any of them fail —
a broken phase file cannot reach the live site.

## How it fits together

```
ai-roadmaps/                 the curriculum — Markdown is the source of truth
  foundations/               8 phases
  model-internals/           6
  prompting/                 7
  rag/                       7
  agents/                    7
  finetuning/                6
  cost/                      7
  vibecoding/                8
  safety-career/             5
  career/                    4
  shared/                    study rules, cross-track references

scripts/                     content build + integrity guards
  build-content.mjs          Markdown -> generated JSON (single source of truth)
  audit-quiz.mjs             quiz + ID contract

learning-site/               React 18 + Vite site that renders the curriculum
  src/data/generated/        built from Markdown; gitignored by design
  scripts/                   offline checks and browser verification

docs/                        content schema, design system, decisions, research
HANDOVER.md                  engineering continuity notes and lessons learned
```

**Markdown is the source of truth.** The site never reads it directly — `build-content.mjs`
compiles it to JSON, and `learning-site/src/data/generated/` is gitignored so a stale bundle
can never be committed or deployed. The Pages workflow regenerates it in the same job that
builds the site.

## Status and honesty about it

All 10 tracks are written. This is a complete first pass, not a finished product.

**Known gaps, stated plainly:**

- Several provider URLs have moved (`platform.openai.com` → `developers.openai.com`,
  `docs.claude.com` → `platform.claude.com`). These are stale but readable.
- A number of volatile facts — free-tier terms, context-window sizes, model availability —
  are dated rather than continuously verified, because verifying them requires network
  access this project budgets carefully. Each is stamped with its date.
- The browser verification suite covers a sample of phases, not all 65.
- Some per-module unit suites are planned but not written.

`HANDOVER.md` documents the engineering history, including mistakes made and fixed. It is
unusually frank, deliberately: a project teaching verification should be candid about its own.

## Contributing

Corrections are welcome, especially factual ones. A useful correction includes the source and
the date, because much of this material is time-sensitive.

Before opening a pull request, run the integrity checks above. The contract is enforced in CI,
so a phase that violates it will not merge.

## License

See [LICENSE](LICENSE).

---

**Start here:** [`ai-roadmaps/README.md`](ai-roadmaps/README.md) for the curriculum index, or
[`ai-roadmaps/career/00-overview.md`](ai-roadmaps/career/00-overview.md) if you are job-hunting
now and want the most immediately actionable track.
