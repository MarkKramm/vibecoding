# AGENTS.md

Instructions for AI agents working in this repository. Human contributors should read
[CONTRIBUTING.md](CONTRIBUTING.md) and [README.md](README.md).

This file exists because this repository is content-heavy and **the content is
machine-verified**. An agent that edits a phase file without knowing the contract will produce
work that fails CI, or worse, passes locally and breaks a guard subtly.

---

## The one rule that matters most

**Markdown in `ai-roadmaps/` is the source of truth. Nothing else is.**

`learning-site/` never reads Markdown directly. `scripts/build-content.mjs` compiles it to JSON
in `learning-site/src/data/generated/`, and that directory is **gitignored on purpose** so a
stale bundle can never be committed. If you edit generated JSON directly, your change
disappears on the next build.

---

## The phase contract

Every file matching `ai-roadmaps/*/NN-phase-*.md` must have **exactly 14 `## ` sections, in
this order, with this exact spelling**:

```
## Goal of this phase
## Estimated time
## Skills you'll gain
## Specific topics to learn
## Tools for This Phase          <- capital T in "This"
## Free/cheap resources
## Lesson: <title>
## Hands-on practice tasks
## Common Pitfalls
## Deliverable / proof of work
## Checklist
## Quiz
## You're ready to move on when...   <- three ASCII dots, NOT U+2026
## Free vs Paid
```

A guard checks ordering positionally, so a misspelled or reordered heading fails the build.
Note `## Tools for This Phase` (capital T) and the three ASCII dots — both have been broken
before.

---

## Authored IDs

Every task and checklist item carries a stable authored ID. **IDs are never minted from
position** — a guard fails any ID it had to generate, because a positional ID changes when
someone inserts an item above it, silently breaking every reader's saved progress.

Field order is fixed.

**Practice task** (inside the item's line, as an HTML comment):

```markdown
1. Do the thing. <!-- id: <phase-id>-t01 band: focused energy: normal -->
```

**Checklist item:**

```markdown
- [ ] I can do the thing <!-- id: <phase-id>-c01 energy: normal -->
```

**Quiz question** — ID goes in the heading, and carries `energy:`:

```markdown
### Q1. The question? <!-- id: <phase-id>-q01 energy: normal -->
```

**⚠️ Quiz OPTIONS carry NO IDs. Ever.** This is the single most repeated mistake in this
project's history — it has been made five times, always by momentum rather than intent:

```markdown
- [ ] Wrong option
- [x] Right option          <- no comment here, not even a "-opt" id
- [ ] Wrong option
- [ ] Wrong option
```

### Vocabularies

- `band` ∈ **`quick` | `focused` | `deep` | `ongoing`** — ⚠️ **`normal` is NOT a band.** It is
  an `energy` value, and using it as a band fails the build.
- `energy` ∈ **`low` | `normal` | `high`**
  - `low` — factual recall
  - `normal` — scenario reasoning
  - `high` — multi-step judgement

---

## Quiz rules

- **Exactly 4 options**, **exactly one `- [x]`**, and a `**Why:**` line explaining the
  reasoning.
- **Answer positions must be spread.** A guard fails any file where one position holds more
  than ~50% of the answers. Plan the six positions **before** writing — do not leave it to
  chance. A recent phase was written with 4 of 6 answers in position C and had to be redone.
- Quiz questions per phase: **6**, unless the file's neighbours differ.

---

## Encoding — non-negotiable

- **LF only.** No CRLF.
- **UTF-8 without BOM.**
- **No tabs.**
- **Real typographic characters**: em dash `—` (U+2014), en dash `–` (U+2013). Never an
  ellipsis character `…` (U+2026) — the heading requires three literal dots.
- **No mojibake.** If you see `â€"` in output, the file is probably fine and your *console* is
  misrendering. Verify by counting `U+00E2` in the file bytes, not by reading terminal output.

### ⛔ The write-API trap

**`[System.IO.File]::WriteAllLines()` and `WriteAllText()` use `Environment.NewLine`**, which
is `\r\n` on Windows. They have corrupted content files in this project **three separate
times**. If you must write from PowerShell, use:

```powershell
[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))
```

with `\n` already present in `$text`. **Prefer the `write`/`edit` tools** — they handle this
correctly and are the intended path.

### ⛔ Never regex a prose file

Find-and-replace on Markdown has corrupted content **three times**, including one pass that
consumed the `### ` heading prefix and destroyed 54 quiz headings. Use targeted `edit` calls
per occurrence. Then re-run a structural guard.

---

## Before you finish any content change

Run these from the repository root and confirm they pass:

```bash
node scripts/build-content.mjs --check
node scripts/audit-quiz.mjs
node scripts/audit-lesson-ast.mjs
node learning-site/scripts/audit-arithmetic.mjs
node learning-site/scripts/audit-encoding.mjs
```

`build-content.mjs` writes notes to **stderr**, so check the exit code as well as output.

---

## Verification discipline

**A guard that passes is not proof of completeness if its table is finite.** When in doubt,
count the signature yourself:

```bash
node -e "const b=require('fs').readFileSync('FILE.md','utf8');console.log('U+00E2:',(b.match(/\u00e2/g)||[]).length)"
```

**An unexpected result from your own tooling is evidence about the tooling first.** Three
separate agents have reported false alarms caused by their own query — one regex matched
checklist items instead of quiz options and produced 1365 phantom "violations" when the real
count was zero. If a check returns an implausibly large number of hits, suspect the query
before the corpus.

**Reload guard state before acting on its verdict.** Output can be stale; verify the file
rather than editing a correct file to satisfy an outdated error.

**Never edit a guard to make it agree with the content.** Prove the guard fails for the right
reason.

---

## Working with subagents

If you delegate work:

- **Bound the delegation explicitly** — say "do not spawn subagents" and give a call budget.
  An unconstrained agent parallelises by default and multiplies cost.
- **Include a zero-network instruction** unless the task requires the network.
- **Tell them the schema; do not just point at a neighbouring file.** An agent that read the
  specification instead of pattern-matching its neighbours once caught a 54-question deviation
  that had propagated through the corpus.
- **Forbid scratch files.** Say "create no other file; use inline `node -e` for checks." A
  subagent's throwaway verification script was once swept into a commit by `git add -A`.
- **A subagent's self-report is not verification.** Reports mix true and false claims. Check
  each claim against the artifact.

**`git add -A` is unsafe while a subagent is running in the same working tree** — it cannot
distinguish your files from theirs. Stage by explicit path, or wait for them to settle.

---

## Network policy

**Do not call `web_search`.** It is deliberately off: the account balance is negative and a
search returns HTTP 402. `web_fetch` uses a different provider and works, but prefer zero
network calls. If a fact needs verifying, append it to `docs/SEARCH-REQUESTS.md` and
regenerate `PASTE-THIS.txt`.

---

## Content standards

- **Reasoning over assertion.** Argue from mechanism, not authority.
- **Mark unconfirmable claims `**Unverified**`.** Do not smooth over uncertainty. Better: sort
  claims into **established / contested / speculative** as `safety-career/03` does.
- **Date volatile facts.** Free tiers, pricing, context windows and model availability change.
- **Invent nothing.** No statistics, salaries, company names, or citations you have not
  verified. **A guessed identifier is not a citation** — a wrong arXiv ID returns HTTP 200
  with a real but unrelated paper. Read the title before citing.
- **Prefer "could not verify" to a confident guess.** It is a result, not a failure.

---

## Reference

- `docs/CONTENT-SCHEMA.md` — the full content contract
- `docs/DESIGN-SYSTEM.md` — visual conventions
- `learning-site/docs/DECISIONS.md` — why things are the way they are (**note: this one lives
  under `learning-site/`, not the repo root**)
- `HANDOVER.md` — engineering history and accumulated lessons
