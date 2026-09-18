# Contributing

Corrections and improvements are welcome. This is educational material about fast-moving
technology, so **factual corrections are the most valuable contribution** — and the most
likely to be time-sensitive.

If you are an AI agent, read [AGENTS.md](AGENTS.md) instead. It states the machine-enforced
content contract that this file only summarises.

---

## What is most useful

**Factual corrections with a source.** Free-tier terms, pricing, context-window sizes, model
availability and provider policies change constantly. If something here is out of date, a fix
that includes the source URL and the date is worth far more than one that does not. Several
claims are deliberately marked `**Unverified**` — closing one of those with a real source is
especially welcome.

**Broken links.** Provider documentation moves frequently (`platform.openai.com` →
`developers.openai.com`, `docs.claude.com` → `platform.claude.com`).

**Clarity fixes** where a lesson is confusing or an explanation assumes something it should
have stated.

**New practice tasks or pitfalls** that come from actually doing the work.

## What to check before opening a pull request

Run the integrity checks from the repository root. **CI runs these too, and a phase file that
violates the contract will not merge**, so running them locally saves you a round trip:

```bash
node scripts/build-content.mjs --check
node scripts/audit-quiz.mjs
node scripts/audit-lesson-ast.mjs
node learning-site/scripts/audit-arithmetic.mjs
node learning-site/scripts/audit-encoding.mjs
```

If you changed anything the site renders, also run:

```bash
cd learning-site
npm install
npm run build
npm test
```

---

## The content contract, in brief

Every phase file (`ai-roadmaps/*/NN-phase-*.md`) must have **exactly 14 `## ` sections in a
fixed order**. The full list and the required spellings are in
[AGENTS.md](AGENTS.md#the-phase-contract) and
[`docs/CONTENT-SCHEMA.md`](docs/CONTENT-SCHEMA.md).

The parts most often gotten wrong:

- `## Tools for This Phase` — capital **T** in "This".
- `## You're ready to move on when...` — **three ASCII dots**, not an ellipsis character.
- **Quiz options carry no IDs.** Only the question heading does.
- `band` is one of `quick` / `focused` / `deep` / `ongoing`. **`normal` is an `energy` value,
  not a band** — using it as a band fails the build.
- **Quiz answers must be spread across positions.** A guard rejects any file where one answer
  position holds more than half the questions.

---

## Editing rules

**Markdown is the source of truth.** Never edit `learning-site/src/data/generated/` — it is
generated and gitignored, so your change would vanish on the next build.

**Use LF line endings, UTF-8 without BOM, no tabs, and real typographic dashes** (`—`, `–`).
An encoding guard enforces this and will fail your contribution otherwise.

⚠️ **On Windows, do not write files with PowerShell's `WriteAllLines` or `WriteAllText`** —
they emit CRLF and have corrupted files in this project three times. Use a proper editor, or
`[System.IO.File]::WriteAllText($p, $text, (New-Object System.Text.UTF8Encoding $false))`.

⚠️ **Do not use find-and-replace across a Markdown file.** It has corrupted content here three
times, including one pass that destroyed 54 quiz headings. Make targeted edits and re-run the
structural guards afterwards.

---

## Content standards

**Reason over assertion.** Explain *why* something works from its mechanism. A claim the
reader is asked to accept on authority is worth less than one they can reason about — this is
the whole premise of the curriculum.

**Mark uncertainty honestly.** If a claim cannot be verified, write `**Unverified**` next to
it. Do not smooth over it, and do not present inference in the register of established fact.
The strongest example to follow is `ai-roadmaps/safety-career/03-phase-alignment-capability-and-honest-limits.md`,
which sorts claims into **established / contested / speculative** explicitly.

**Date volatile claims.** Anything about pricing, availability or capabilities should carry
the date it was checked.

**Invent nothing.** No statistics, salaries, company names, or citations that were not
verified. **A guessed identifier is not a citation** — a wrong arXiv ID returns HTTP 200 with
a real but unrelated paper. Read the title before citing it.

**"Could not verify" is a valid result.** It is better than a confident guess, and it is
recorded as such throughout this project.

---

## Commits

Small, focused commits with a message that says **what changed and why**. If a change fixes a
defect, say what the defect was — several commits in this repository's history document a bug
and the reasoning that found it, which makes the history useful rather than just a log.

---

## Reporting a problem without a pull request

Open an issue. For a factual problem, include the source you are relying on. For anything
about time-sensitive information, include the date.

---

## License

By contributing, you agree that your contribution is licensed under the terms in
[LICENSE](LICENSE): MIT for code, and CC BY 4.0 for curriculum prose.
