# Troubleshooting

Every error message in this file was **captured by breaking the corpus deliberately** and
copying what the build actually printed. They are not paraphrases.

If you have not set the project up yet, read [SETUP.md](SETUP.md) first — several of the
traps below are explained in full there.

---

## Start here: the two questions to ask first

**1. Did the content actually rebuild?**
`learning-site/` never reads Markdown. It reads JSON compiled by `scripts/build-content.mjs`
into `learning-site/src/data/generated/`. Edit a phase file and the running site will not
change until you rebuild:

```bash
cd learning-site && npm run build:content
```

**A stale generated bundle is the most common cause of "my change did nothing".** It has
produced two false bug reports here.

**2. Is `dist/` older than the data?**
A browser check reads the **build**, not the source. If you regenerated content and did not
rebuild, `dist` holds the old data and a browser check can pass or fail for the wrong reason.
Order that always works:

```
rebuild content  ->  npm run build  ->  restart preview  ->  probe
```

A preview server started **before** a rebuild keeps serving the old bundle until restarted.

---

## Content contract failures

### `content build failed — N contract violation(s)`

The build collects **every** violation rather than stopping at the first, so you can fix a
new phase file in one pass. Read the list top to bottom.

### Section spelling

```
section is spelled "## CommonPitfalls" but the contract requires "## Common Pitfalls"
— headings are matched exactly, so this one was not recognised
```

A near-miss is reported as a **spelling** problem, not a missing one, because the fix differs.
Headings are matched exactly, including capitalisation and spacing. `## Tools for This Phase`
has a capital **T**. `## You're ready to move on when...` ends in three ASCII dots — **not**
the `…` character.

An unrecognised `##` heading is **not** a parser error. It is silently absorbed as body text,
so the file looks correct in an editor while content stops rendering in the right place. That
is why this check exists.

### Section order

```
section "## Estimated time" appears BEFORE "## Goal of this phase", but the contract
fixes the order as "Goal of this phase", "Estimated time", ...
```

The 14 sections have a fixed order. The message prints the whole expected sequence.

### Practice task band

```
practice task band "normal" is not one of quick, focused, deep, ongoing
```

⚠️ **`normal` is an ENERGY value, not a band.** This is the single most common vocabulary
mistake in this project.

- `band` ∈ `quick` | `focused` | `deep` | `ongoing`
- `energy` ∈ `low` | `normal` | `high`

### Practice-task comment field order

```
practice task comment field 1 is "energy:" but must be "band:" — the order is fixed as
id, band, energy
```

The field order inside the comment is **fixed**: `id`, then `band`, then `energy`. Writing them
in any other order fails the build. This is the message you get if you swap `band` and
`energy`, and also if you drop `band` entirely — because then `energy` occupies field 1, where
a band is expected.

### Missing practice-task band — a NOTE alongside the error

```
note: ai-roadmaps/<file>.md has 1 practice task(s) without a band — they will never be
offered by the time-budget picker
```

This note is emitted **in addition to** the field-order error above, and it is the more
important one to understand: a task with no band is never surfaced by the time-budget picker.
It is a *note* rather than its own error only because the field-order violation already fails
the build; the note explains the consequence in reader terms.

### Quiz question with no energy

```
quiz question "<id>" has no energy — add "energy: low|normal|high" to its
<!-- id: ... --> comment, because the time-budget picker selects questions by energy
and a missing one is never offered
```

Energy is **required** on every quiz heading. A missing one used to build cleanly and ship as
`null`, which made the question unreachable by the picker — a silent exclusion rather than a
loud error.

The comment must also be in a fixed field order:

```markdown
### Q1. The question? <!-- id: <phase-id>-q01 energy: normal -->
```

### Missing or minted ids

Every task and checklist item needs an authored id:

```markdown
1. Do the thing. <!-- id: <phase-id>-t01 band: focused energy: normal -->
- [ ] I can do the thing <!-- id: <phase-id>-c01 energy: normal -->
```

**Ids are never minted from position.** A positional id changes when someone inserts an item
above it, silently moving one reader's saved progress onto a different item. The build report
shows `0 minted from position, N authored` — **that zero must stay zero.**

⚠️ **Quiz OPTIONS carry no ids.** Not even a `-opt` suffix. This is the most repeated mistake
in the project's history.

### Anchor the id to the phase

An id must start with its own phase's id. A `found-01-…` id inside `rag-03` is a copy-paste
error the guard catches.

### Code fence left open

```
code fence opened at line N was never closed, so everything after it was read as code and
later sections were hidden
```

A ```` ``` ```` that never closes hides every following section from the parser. The confusing
part is that the symptom looks like "missing mandatory sections", not "unclosed fence" — so
**check the fence first** when sections appear to be missing.

A fence opener glued to the end of a prose sentence counts as unclosed. **Fence openers go on
their own line.**

---

## The site is blank or looks wrong

### The page is completely blank

You almost certainly built with `VITE_BASE` set and are serving from the root.

- `VITE_BASE=/vibecoding/` → assets at `/vibecoding/assets/…` (**GitHub Pages**)
- unset → assets at `/assets/…` (**local preview**)

Get it wrong and the HTML requests a path the server does not have, so it returns the
`index.html` fallback **instead of JavaScript**. There is no console error naming the cause.

Check what `dist/index.html` actually references, then rebuild for local work:

```bash
grep -o '/[^"]*assets/[^"]*' dist/index.html
npm run build          # with VITE_BASE unset
```

⚠️ If `VITE_BASE` is set in your shell, **every** build from that shell is wrong.

### Port refused on `127.0.0.1`, works on `localhost`

The dev server binds IPv6 only. Use `http://localhost:5173`, not `http://127.0.0.1:5173`.

### The page renders unstyled — no layout, cards stacked full-width

A class used in JSX has no CSS rule. Run the guard, which names the class and the files using
it:

```bash
node scripts/audit-css.mjs
```

```
✖ 1 class(es) referenced in JSX with NO css rule:

    .zz-bogus-probe
        used in: src/components/ToolCard.jsx

✖ css integrity failed — 1 problem class(es)
```

This class of bug shipped once: **40 layout classes** (`.main`, `.topbar`, `.phasegrid`,
`.statgrid`, `.toolgrid`, `.breadcrumb`, …) had no rule at all, and every content check stayed
green, because a missing CSS rule changes no text and breaks no JSON field.

If the guard passes but the page still looks wrong, rebuild — you may be looking at a stale
`dist`.

---

## "The numbers are wrong" / a page shows 0 of something

A component is reading a **projection of the data that does not carry that field.**

The build emits the curriculum twice. `generated/index.json` is the **light** projection —
title, duration, goal, and the *ids* of checklist/tasks/quiz. It deliberately carries **no**
tools, resources or prose, so the dashboard does not pull 1.3 MB into the entry bundle. The
per-track files carry everything, and load lazily.

The Tools library read the light projection and iterated `phase.tools`, which is `undefined`
there — so it rendered *"0 tools across 10 written tracks"* while the corpus held 433 tool
rows. `phase.tools || []` turned a missing field into an empty list, and nothing downstream
could tell the difference.

**If a page shows zero of something that exists in the Markdown, check which projection it
imports before checking the content.**

---

## A link goes nowhere

Tool tables use an em dash in the URL column to mean "no URL" — correct typography for a
rendered table. That dash was passed through as data, so `tool.url` was the literal string
`"—"`, which a `tool.url &&` guard accepts as truthy, producing `<a href="—">`. 40 of 433 tool
rows were affected.

Placeholder dashes are now normalised to an empty string **at the parse boundary**, because a
component cannot tell "no URL" from "a URL that looks odd".

---

## Encoding failures

```
✖ <file>: 38 CRLF line ending(s)
```

The rules are LF only, UTF-8 without a BOM, no tabs, no mojibake. They are strict because
these have corrupted real files here three times.

⚠️ **`[System.IO.File]::WriteAllLines()` and `WriteAllText()` use `Environment.NewLine`**,
which is `\r\n` on Windows. They have damaged content files in this project. If you must write
from PowerShell:

```powershell
[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))
```

with `\n` already in `$text`. **Prefer your editor.**

The guard decides coverage by **extension plus an explicit list**, and it now covers
`.gitignore`, `.editorconfig`, the workflows and the root docs — it previously did not, and a
stray CR reached `.gitignore` while the guard reported "all clean".

### My console shows `â€"` — is my file corrupted?

**Probably not.** Check the bytes, not the terminal. PowerShell and some Windows consoles
miserender correct UTF-8, and this false alarm has been raised here before:

```bash
node -e "const b=require('fs').readFileSync('FILE.md');console.log('U+00E2:',(b.toString('utf8').match(/\u00e2/g)||[]).length)"
```

Zero means the file is fine and your console is lying to you.

---

## PowerShell traps

### An inline `node -e` gives an absurd result

**PowerShell mangles inline JavaScript.** It has eaten a `$` out of a regex, so a pattern that
should match `.jsx`/`.js` files matched nothing — and the audit confidently reported **all 17
hooks as unused** when the true answer was 2.

The tell is that the result is implausible or suspiciously uniform. **Write a script file
instead of fighting the quoting.** This has cost hours more than once.

Also note: inside a double-quoted PowerShell string, `$` interpolates. `$LASTEXITCODE`,
`$env:NAME` and `$matches` are PowerShell's, not JavaScript's.

### `Join-String` does not exist

Not available in this PowerShell. Build strings by hand or use `-join`.

### A `$var:` reference is parsed as a drive

`"$qn:"` throws. Use `"${qn}:"`.

### Commit messages get mangled inline

Write the message to a temp file and use `git commit -F <file>`.

---

## Guard and test failures

### `npm test` vs `npm run test:browser`

`npm test` runs the **offline** checks — no browser, no server. `npm run test:browser` needs a
running server and a browser binary, and reads `dist`.

### A guard reports failures you do not believe

**Suspect the instrument before the subject.** This has now happened **seven times** in this
project, and it is the single most common failure mode:

- a regex matched checklist items instead of quiz options and produced **1365** phantom
  violations when the real count was zero
- an inline `node -e` lost its `$` and reported **all** hooks as dead
- a probe looked for an `o.correct` flag on quiz options and returned an **all-zero**
  histogram across 549 questions (the data uses `answerIndex`; `correct` is a runtime shape)
- a UI probe reported `h1-count=0` for every view because its click helper silently failed and
  it was auditing the same page four times

**An implausibly large, implausibly small, or suspiciously identical result means the QUERY is
wrong.** Prove your probe can detect a known-bad input before believing a clean result.

### `build-content.mjs --check` shows a pass line but the exit code is 1

The pass summary goes to **stdout** and failures to **stderr**. Piping to `tail` can therefore
display the pass line from a run that failed. **Always check the exit code:**

```bash
node scripts/build-content.mjs --check; echo "exit=$?"
```

### CI is red but everything passes locally

Check two things:

1. **Node version.** CI pins `node-version: "24"`, matching the version this project is
   verified against (v24.19.0 locally). A different major can change behaviour.
2. **`src/data/generated/` does not exist in CI.** It is gitignored, so CI builds it from
   scratch — and the CSS-integrity and content guards run **before** any install step. If a
   guard reads generated data and the build has not run, that is the cause.

---

## Browser check says the app did not mount

`#root is empty` usually means **no preview server is running**, not a broken build. Verify in
this order:

1. is the preview server up on **4173**?
2. does `dist/index.html` reference root-relative assets (see the `VITE_BASE` trap)?
3. was `dist` built **after** the last content rebuild?

All three have caused this exact message.

---

## Where to look next

| Symptom | Read |
|---|---|
| cannot get it running at all | [SETUP.md](SETUP.md) |
| a content rule I do not understand | [docs/CONTENT-SCHEMA.md](docs/CONTENT-SCHEMA.md) |
| how to write a phase | [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md), [docs/PHASE-TEMPLATE.md](docs/PHASE-TEMPLATE.md) |
| visual conventions | [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) |
| why something is built this way | [learning-site/docs/DECISIONS.md](learning-site/docs/DECISIONS.md) |
| engineering history, mistakes included | [HANDOVER.md](HANDOVER.md) |
