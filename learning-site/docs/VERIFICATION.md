# VERIFICATION

How the site is checked, what each check actually proves, and — the part that
matters more — what each check **cannot** prove.

The central lesson of this document, learned the hard way, is stated here first
because everything below is downstream of it:

> **A passing `vite build` proves the modules RESOLVE. It does not prove the app
> RUNS.**

A component can import cleanly, transform cleanly, pass every static guard, and
still throw on first render — a bad prop name, a hook returning a different
shape, a null dereference in a template, or (the one that actually happened here)
a field that is an array of objects where the component assumed an array of
strings. All of those produce a green build and a blank page.

---

## 1. The layers, and the order they run in

| Layer | Script | Needs | Proves |
| --- | --- | --- | --- |
| Content | `scripts/build-content.mjs --check` | nothing | the Markdown is well-formed |
| Shapes | `learning-site/scripts/audit-shapes.mjs` | generated JSON | the JSON matches what the renderers assume |
| Semantics | `learning-site/scripts/test-cost-tone.mjs` | generated JSON | cost classification is right *on this corpus* |
| Encoding | `learning-site/scripts/audit-encoding.mjs` | nothing | LF, UTF-8 without BOM, no mojibake, no tabs |
| Runtime | `learning-site/scripts/verify-site.mjs` | production preview + Edge/Chrome | the app renders, 15 checks |
| Runtime, deep | `learning-site/scripts/verify-deep.mjs` | production preview + Edge | all written tracks, corpus-sized dashboard, search, 8 checks |
| Correctness | `learning-site/scripts/verify-quiz-correctness.mjs` | production preview + Edge | the quiz marks the *source-correct* option correct |
| All-phase sweep | `learning-site/scripts/sweep-phases.mjs` | production preview + Edge | all 65 phase screens and navigation; explicitly skips without a responding preview |
| Exam logic | `learning-site/scripts/test-exam.mjs` | generated question pool | track scoring, 100-question balanced rotating capstone, 549-question exhaustive pool, resume snapshots and backup rules |
| Accessibility | `learning-site/scripts/audit-a11y.mjs` | production preview + Edge | six views; 60 assertions, with explicit scope limits |
| Diagnostics | `debug-phase.mjs`, `debug-tracks.mjs` | dev server + Edge | *why* something failed |

Two notes on that table. The **Content** row is the repo-root guard
(`node scripts/build-content.mjs --check`, plus `audit-quiz.mjs` and
`audit-lesson-ast.mjs`), which runs against the Markdown and needs no install at
all — it is the only layer that works on a fresh clone before `npm install`. The
**`npm test` → `check-all.mjs`** chain actually begins by running the full content
*build* (not `--check`) so the generated JSON exists for the steps after it; the
repo-root `--check` form is what the content pipeline's own workflow uses.

`npm test` chains 17 checks in `scripts/check-all.mjs`. Fifteen are offline; the rendered
accessibility audit and all-phase browser sweep use a real browser against the production
preview at port 4173. Both print a loud skip and exit successfully if no server responds, so
run them with a freshly built preview to get full coverage. `npm run test:browser` separately
chains the smoke, deep, quiz-correctness, and focused Finetuning checks, also targeting the
production preview by default.

`check-all.mjs` runs checks in a deliberate order: the content build writes the JSON every later
step reads; shape and projection checks catch data/render mismatches; logic and component tests
exercise behavior; and encoding/CSS/reachability checks catch failures no data test can see.
The browser-dependent checks run after these cheaper checks.

The offline checks cannot observe a React render. The two browser-dependent steps in `npm test` do observe the production page when its preview is available; they print an explicit skip if it is not.

---

## 2. `audit-shapes.mjs` — the static field-shape audit

**What it does.** Walks all phases in the written tracks and asserts, per
field, the type of one element: `skills` and `deliverableItems` must be strings;
`topics`, `tasks`, `checklist`, `quiz`, `tools` and `resources` must be objects.
It also records the nested key set of every object field, so a field that
acquires a *second* shape is caught even when every element is still an object. It
additionally checks each quiz question for ≥2 options, an in-range numeric
`answerIndex`, and a non-empty `why`.

**Why it exists.** `topic` being `{ heading, items[] }` rather than a string is
not a syntax error — it is a fact about data the component never sees at build
time. React throws `Objects are not valid as a React child` only at render.

**Its limit.** It is a **shape** check, not a **semantics** check. It will happily
pass a `resources` array whose every `url` is empty, a `quiz` whose `answerIndex`
points at the author’s intended distractor, or a `skills` array of strings that
say nothing. And it only knows the fields listed in its `CONTRACT` map: a phase
field nobody added to that map can change shape unnoticed. **If you add a field to
the build, add it to `CONTRACT` in the same commit.**

**Run:** `node scripts/audit-shapes.mjs` (from `learning-site/`).

---

## 3. `test-cost-tone.mjs` — cost classification against the real corpus

**What it does.** Reads every track file, collects every distinct tool `cost`
string actually present, and runs `costTone()` from `src/data/tools.js` over each
one. Seventeen of the 24 strings carry an **explicit expected tone** — the cases
where a wrong answer would mislead a reader — and the rest are accepted as long as
the tone is one of `free | freemium | paid`. It exits non-zero on any mismatch, so
a new cost phrase that classifies wrongly fails the suite rather than reaching a
reader.

The seventeen pinned cases are the interesting ones, and they encode a policy
rather than a mapping:

```
"Free to read (API calls are paid)"          → free
"Free self-hosted, paid cloud tiers exist"   → free
"Freemium; paid above the free tier"         → freemium
"Varies"                                     → freemium
```

The ordering in `costTone()` is the whole design: explicit zero-cost phrasing
wins first, so a parenthetical caveat about paid API calls cannot override a tool
that is genuinely free for the purpose the phase lists it; freemium is settled
before returning, because `"Freemium; paid above the free tier"` reaches the
free branch on the word “free” and must still read as freemium; then paid; then
freemium as the default for the indeterminate. `"Varies"` is reported as
**freemium**, not free: the honest badge for “it depends” is the ambiguous one,
because a reader who sees “freemium” will check and a reader who sees “free” will
assume. The bias is deliberate and stated in the source — the reader this
curriculum is written for has no budget, and wrongly labelling something free
costs one wasted click, while wrongly labelling something free as paid means they
never find it at all.

**Its limit.** It is a **consistency** test, not a truth test. It cannot know
whether `"Free tier"` is an accurate description of a given vendor today — the
strings are authored prose and vendors change their pricing. What it guarantees is
that the classifier is measured against every string the corpus actually contains,
so adding a new phrase surfaces the classification for scrutiny instead of
silently mis-tiering behind an untested code path. Note also that the count
reported at the end is `costs.size` — distinct strings, currently **24** — not the
number of classifications checked.

**Run:** `node scripts/test-cost-tone.mjs` (from `learning-site/`).

---

## 4. `verify-site.mjs` — the real browser, 15 checks

**What it does.** Launches headless Edge (or Chrome) with a fresh temporary
profile, connects over the **Chrome DevTools Protocol** using nothing but Node’s
built-in `WebSocket` and `fetch`, navigates to the production preview by default,
walks the DOM, and asserts fifteen things:

1. the document title,
2. that React mounted (≥500 characters of text under `#root`),
3. the dashboard shows the phase count read from the generated index,
4. the dashboard shows the checklist total read from the generated index,
5. the dashboard lists all ten tracks,
6. phase cards rendered,
7. a phase page rendered (>1000 characters),
8. real lesson body text is on screen,
9. the quiz section is present,
10. the practice section is present,
11. checklist items rendered,
12. **quiz options carry real text, not `[object Object]`** — the exact failure a
    botched normalisation produces,
13. at least three quiz option buttons,
14. back-navigation returns to the dashboard,
15. **no uncaught page errors** (`Runtime.exceptionThrown` is collected from the
    start, or a blank render would look like a pass).

**Why it talks CDP directly rather than using Playwright or Puppeteer.** The
project has no test dependencies and must stay installable on a zero budget —
`npm install` pulls React, React DOM, Vite and the React plugin, and nothing else.
A raw CDP client is roughly sixty lines of `WebSocket` plumbing and adds no
package to the tree.

**Its limits — several, and they matter.**

- It drives **one phase of one track**. A lazy-load path that works for
  `foundations` and fails for `agents` passes this script completely. That is
  precisely why `verify-deep.mjs` exists.
- It checks for the *presence* of things, not their correctness. “The quiz
  section is present” is true of a quiz that marks every wrong answer right.
- It reads the expected phase and checklist totals from the generated index, so
  additions to the corpus do not create false failures from stale constants.
- If no Edge or Chrome binary is found it exits **2**, not 1 — “could not run” is
  a different outcome from “ran and failed”, and the exit code says which.
- It waits with fixed `sleep()` calls rather than waiting for conditions. On a
  slow machine 4000 ms may not be enough, and a timeout would read as an app
  failure.

**Run:** build and start `npm run preview`, then run `node scripts/verify-site.mjs`.
The default URL is `http://localhost:4173`; pass `--url` to use another host or port.

---

## 5. `verify-deep.mjs` — 8 checks across every written track

**What it does.** Navigates the real app and checks the things that would still be
*wrong* while looking completely fine:

1. the quiz rendered with options,
2. **option 0 is not always the correct answer** — it clicks the first option of
   every question and asserts the summary does *not* say “Every answer correct”,
   which is what an inverted or off-by-one normalisation would produce,
3. the dashboard has the corpus-sized phase-card count after navigating back,
4. **every written track renders a full phase** — it opens the first phase of
   every track with authored phases and requires >3000 characters and no
   “Loading this phase…”,
5. **no unsupported content blocks anywhere** — the literal string
   `Unsupported block type` must not appear in any of them,
6. **every track’s phase includes a quiz**,
7. **search returns hits for `attention`**,
8. no uncaught errors during the deep pass.

**One test artifact worth preserving.** An earlier version of check 4 did the
whole journey — click a card, wait, click “All tracks”, repeat — inside a single
`evaluate` holding element references across React re-renders. After the first
navigation those nodes were detached, every later click silently did nothing, and
the result read as **“only 1 of 10 tracks renders”**: a test artifact that looked
exactly like a serious app bug. The fix is one step per `evaluate`, re-querying
the DOM every time. It is slower and it is correct, and `debug-tracks.mjs` exists
to tell the two cases apart.

**Its limits.**

- It checks **the first phase of each written track**, not every phase. A single broken phase
  in the middle of a track passes.
- Check 2 is a **one-question-position** heuristic: if by coincidence every
  question’s correct answer happened to be option 0, it would report a false
  failure. It is a smoke test for the normalisation, not a proof of it — that is
  `verify-quiz-correctness.mjs`.
- Check 4 skips tracks with zero cards, so the expected written-track count is
  read from the generated corpus. If a formerly populated track loses all phases,
  this count shrinks too; the content/build checks must catch that regression.
- Search is checked with a single known-good term, `attention`. It proves the
  index loads and returns *something*; it does not prove ranking quality.
- It accepts `--url` and defaults to the production preview at `http://localhost:4173`.

**Run:** `node scripts/verify-deep.mjs`.

---

## 6. `verify-quiz-correctness.mjs` — the strongest check in the suite

**The risk it addresses.** The one piece of data adaptation in the app converts

```
{ options: ["…", …], answerIndex: 2, why: "…" }
```

into

```
{ options: [{ text, correct }, …], explanation: "…" }
```

If that mapping were off by one, or attached `correct` to the wrong option, the
quiz would still render, still be clickable, still report a summary, and still
pass every structural and smoke check — while teaching the reader that a
distractor is the right answer. That is the worst possible failure for a learning
site and it is **invisible to a smoke test**.

**The method.** It reads the source of truth directly from `foundations.json`,
prints each question’s `answerIndex`, then drives the real UI:

1. It resets any previously saved answers so the score is unambiguous.
2. It clicks the option the **source** says is correct, for every question, and
   asserts the app reports *“Every answer correct”*.
3. It resets, deliberately answers question 1 **wrong** (the next index after the
   correct one, modulo the option count), answers the rest correctly, and asserts
   the app does **not** claim perfection and **does** flag question 1.

**Its limits.**

- It verifies **one phase** — `foundations.json` phase 1. It proves the mapping
  is correct for that phase’s questions; the mapping is a single pure function, so
  the evidence transfers, but it is not a per-phase guarantee.
- It depends on the DOM structure of `Quiz.jsx` (`ol`/`ul` groups containing
  buttons, and a reset control matching `/start over|reset|try again/i`). A
  restyle that changes that structure breaks the script, and the breakage will
  look like a content failure.
- It exercises `normaliseQuestion` **as reached through `loadTrackPhases`**. A
  change that moved normalisation somewhere else would need this test re-pointed.

**Run:** start the production preview, then run `node scripts/verify-quiz-correctness.mjs` (or pass `--url` to override `http://localhost:4173`).

---

## 7. `debug-phase.mjs` and `debug-tracks.mjs` — telling an app bug from a test bug

These two produce no pass/fail. They exist because a failing browser check has two
possible causes and the reports look identical.

**`debug-phase.mjs`** captures the **full React error and component stack** for
one phase open. It monkey-patches `console.error` in the page before clicking the
first card and keeps every argument as a string, including `error.stack`, then
dumps both the captured stacks and the raw `Runtime.consoleAPICalled` /
`Runtime.exceptionThrown` log. Use it when a phase renders blank or partially —
the component stack says which component threw and on what.

**`debug-tracks.mjs`** re-runs the cross-track journey **one step per evaluate,
re-querying the DOM every time**, and prints a per-track line:
`chars`, whether a quiz is present, how many `Unsupported block type` strings
appeared, whether it is still loading, and the page’s `h1`. If this script
succeeds where the batch test failed, the **batch test was at fault** (stale
element references across React re-renders). If it fails too, the app is.

**Their limits.** They are deliberately unassertive — they report and exit, and
`debug-tracks.mjs` sets a non-zero exit only when a track genuinely fails to
render. Neither is part of any suite, and neither should be wired into CI: they
are instruments, not gates.

**Run:** `node scripts/debug-phase.mjs`, `node scripts/debug-tracks.mjs`.

---

## 8. The build guard did not catch the crash

This is the most important lesson in the file, so it gets its own section.

The `topics`/`resources` defect shipped with a **green build guard**.
`node scripts/build-content.mjs --check` verifies that the Markdown is
well-formed — front-matter fields present, mandatory sections present, exactly one
`[x]` per quiz question — and it exited 0 throughout. It had no way to know that a
React component downstream expected `topics` to be an array of strings. The
component compiled, the bundle built, and the page threw on first render.

**Only a rendered-page check could find it.** `verify-site.mjs` collects
`Runtime.exceptionThrown` from the moment the page loads, so it observes render-time
failures that static checks cannot. The current suite also runs a full phase sweep
and accessibility checks against a real browser when the production preview is up.

The sequence that followed is the right pattern to copy:

1. The browser test found it.
2. `audit-shapes.mjs` was written so the *cheap* check catches it next time —
   sub-second, no browser, runs first in `check-all.mjs`.
3. `PhaseDetail.jsx` gained a tolerant fallback for a plain-string topic and a
   non-object resource, so an older generated file renders rather than throwing.

Two rules follow from it, and both are worth applying to any future guard:

- **A green guard is not proof the guard checks that thing.** Before trusting a
  pass, break the input deliberately and confirm the guard fails. This was done
  once for `audit-quiz.mjs` and it behaved correctly; the same discipline applied
  to the build guard would have shown immediately that it had no opinion about
  render shapes. The corollary is harsher: **a guard that has never failed may
  never have run.** `audit-shapes.mjs` and `audit-encoding.mjs` are new enough
  their mutation tests verify that deliberately broken inputs fail.
- **Never edit a guard to agree with the code.** If an audit fails, the data or
  the component is wrong. Adjusting the assertion makes the failure permanent and
  invisible — and the failure it hides is the one that reaches a reader.

---

## 9. Two environment traps

Both cost real debugging time. Both are environmental, not code faults, and both
will recur on any Windows machine.

### (a) `EBUSY` kills the dev server when a temp directory appears inside the project

Vite’s watcher follows directories. When a headless browser profile, or an
editor’s atomic-save temp directory, is created **inside the project tree**, the
watcher picks it up and then hits a locked or already-renamed handle — and the
whole dev server dies with `EBUSY`. Windows editors make this worse by writing
`.<Name>.<pid>.<uuid>.tmpdir/` and renaming it into place; if the rename lands
before the watcher looks, the handle is gone. It is not reproducible on every
platform and it is not a code fault, but it kills the server mid-session.

The fix is in `vite.config.js`:

```js
watch: {
  ignored: ["**/.*.tmpdir/**", "**/*.tmp"],
}
```

Ignoring these is safe: they never contain anything Vite should serve, only a
half-written copy of a file that is about to appear under its real name and
trigger a normal rebuild.

The related discipline is in the browser scripts themselves: every one of them
creates its profile with `mkdtempSync(join(tmpdir(), "vb…-"))` — in the **system**
temp directory, never in the project — and removes it in a `finally` block. If you
write a new browser script, do the same. A profile directory inside
`learning-site/` is the exact condition that produces the `EBUSY`.

### (b) The dev server binds IPv6, so use `localhost` and not `127.0.0.1`

Vite binds the dev server on IPv6. `http://localhost:5173` resolves to `::1` and
works; `http://127.0.0.1:5173` does **not**, and the failure presents as a
connection refused or a page that never loads — which reads as “the server is
down” when it is running perfectly.

Every browser script and every default URL in this suite uses `localhost` for
that reason. `verify-site.mjs` accepts `--url`; if you override it, override it
with a `localhost` URL.

Note the asymmetry: the **CDP endpoint** is a different matter. The browser’s
debugging port is queried at `http://127.0.0.1:9222/json/list`, and that is
correct — the browser is listening on IPv4 there. Two servers, two address
families, and mixing them up produces a confusing failure in either direction.

---

## 10. Running everything

```powershell
cd learning-site

npm run build         # builds content and production bundle
npm run preview       # in another terminal, port 4173
npm test              # 17 checks; 2 browser checks use the preview
npm run test:browser  # smoke, deep, quiz correctness, focused track check
npm run check         # content guard, quiz audit, AST audit
```

Two PowerShell notes that have cost time before. `build-content.mjs` writes
track-absence notes to **stderr**, which PowerShell renders as a red
`NativeCommandError` block — this is **not** a failure; check `$LASTEXITCODE`.
And when a non-ASCII character looks wrong in PowerShell output, **check the raw
bytes before “fixing” it**: the console decoding is a likely culprit and the file
is probably correct. That exact false alarm has already happened twice here.

Encoding is checked mechanically by `learning-site/scripts/audit-encoding.mjs`,
which scans `src/`, `scripts/`, `docs/`, `vite.config.js`, `index.html` and
`package.json` for CRLF, lone CR, a UTF-8 BOM, invalid UTF-8, mojibake sequences
and tab characters, and reports **file and line**. The mojibake patterns are built
from character codes rather than written as literals, so the audit file contains
no mojibake of its own and needs no self-exemption.

**One honest gap:** no CI workflow exists yet (there is no `.github/` directory),
so none of this runs automatically. Everything is run by hand. Wiring `npm test`
and `audit-encoding.mjs` into CI is the highest-value unchecked item on this
project.

`audit-encoding.mjs` is already the **fourth** step of `npm test` →
`check-all.mjs`, so it does run whenever the suite does — but only because a human
types `npm test`. Nothing enforces it on a push.
