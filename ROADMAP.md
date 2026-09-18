# Roadmap

What is built, what is genuinely left, and what would take this from a good project to one
that gets someone hired.

This file is written to be **honest rather than flattering**. Where something is unfinished it
says so. An earlier gaps list in this repository shrank silently and stopped describing the
project, which is why this one names its own uncertainty.

---

## Where the project is now

**The curriculum is complete.** 65 phases across 10 tracks, 35,383 lines of authored Markdown,
549 quiz questions, 886 practice tasks, 1054 checklist items. Every phase passes a machine-
verified 14-section contract.

**The site works and is deployed.** Live at **https://markkramm.github.io/vibecoding/**, built
and published by GitHub Actions, with CI green.

**Verification is real.** 15 offline checks, 451 assertions, driving headless Edge over CDP for
the accessibility audit and for a sweep of **all 65 phases**. Every guard has been proved
capable of failing.

**The live site has been seen rendering**, by the project owner, and that check found a serious
defect a fully green suite had missed — see below. A later browser sweep of every phase found a
second one, in the navigation between them.

---

## P0 — things that are actually wrong or missing

### Mobile has been emulated, never touched

The layout is verified at 1440px and 390px in a headless browser. It has never been opened on
a real phone. Emulated viewports do not reproduce real touch targets, real font rendering,
real scroll behaviour, or iOS Safari's specific quirks. If you have a phone, open the site on
it.

### ✅ The browser suite samples, it does not sweep — DONE

**Resolved.** `scripts/sweep-phases.mjs` (check 14) opens **all 65 phases across all 10 tracks**
in a real browser, clicking dashboard → track → phase → next phase the way a reader does, and
asserts per phase: the `h1` is the *right* phase's title, all six section labels rendered, the
checklist has items **and** tappable controls, four quiz options render, *answering* a question
produces a `.quiz__why` explanation, no placeholder marker appears, and no runtime exception
fired. Runs in about three minutes.

**It found the defect it was built for on its first run**, and it was not one of the 65 — it was
in the navigation between them. See "The Previous/Next buttons did nothing" below.

The lesson held exactly: a sample of six phases in one track was enough to miss a bug that
affected all 65, and the bug was invisible to every one of the fourteen checks because the data
was correct and the buttons looked correct.

---

## The lesson from the first live-site visit

The site was loaded for the first time and **immediately** surfaced a serious defect: the
Reference view was visibly leaking raw Markdown. Following it down found that **325 authored
items — 254 glossary terms and 71 catalogued resources — were rendering into an empty `<div>`**
and had been invisible in every deployment.

The data was correct. The component mapped one of the three document shapes and ignored the
other two. **Every check passed**, because every check verified the data.

That is now the **fourth** instance of one shape in this project:

| Shipped defect | Data | Screen | Checks |
|---|---|---|---|
| Unstyled layout | correct | 40 classes had no rule | green |
| Tools library | 433 rows | "0 tools" | green |
| Tool card links | 40 dashes | `<a href="—">` | green |
| Glossary + resources | 325 items | empty div | green |

> **Correct source, wrong screen, and every test green.**

Component tests and the browser now cover much of this, but not all of it — the browser suite
still samples rather than sweeps. **Visual inspection is not redundant here; it catches a class
the automated checks structurally cannot.**

---

## P1 — worth doing, in rough priority order

### 1. ✅ A real component test layer — DONE

Delivered as `test-components.mjs`: **92 assertions**, now `npm test` step 8. It mounts the
components through `react-dom/server` with esbuild transforming JSX in memory — no new
dependency, no test framework, as planned.

It covers `ToolCard` URL handling (including every placeholder spelling and non-string value,
plus a sweep over all 433 corpus rows), `PhaseCard` against the real light projection and its
degradation behaviour, and `Quiz` normalisation against all 549 real questions.

**It found a real defect before it was finished**: my earlier em-dash fix was a *blocklist*, and
two tool rows carried the prose `"in this repository"` in the URL column. The parser now
requires `^https?://`.

**What it does not cover**, stated in the file rather than glossed: `Quiz`'s own JSX and every
click handler, because those need a DOM and jsdom was deliberately not added. What is asserted
is everything those handlers compute from.

### 2. An accessibility audit, automated

Current a11y work has been **manual and partial**: a skip link, `:focus-visible` styling,
`useFocusTrap` for modals, a `<main>` landmark, and `role="alert"`/`role="status"` on the
backup-import messaging. There is **no automated** check of contrast ratios, heading order, or
that every interactive element is reachable by keyboard.

⚠️ Fixed since this was written: the search result count now uses
`role="status" aria-live="polite"`, verified in the browser announcing "30 matches." The
remaining gap is that **none of this is automated** — the audit is being built as
`audit-a11y.mjs`.

The highest-value automated check: **walk every view, tab through it, and assert focus never
lands on an element with no visible focus indicator.** That is testable with the existing CDP
harness.

### 3. `CHECKPOINT.md` and `WORKFLOW.md`

Still owed. `SETUP.md`, `TROUBLESHOOTING.md` and `CHANGELOG.md` are done.

- `WORKFLOW.md` — how a session actually runs: the rebuild sequence, the guard order, and why
  `dist` must be rebuilt after content
- `CHECKPOINT.md` — a short state-of-the-project snapshot that can be re-read cold

### 4. `docs/free-toolkit.md`

A single reader-facing page of the free-tier limits and free tools, generated from the
curriculum's own `## Tools for This Phase` tables (**433 rows, 237 after de-duplication**).
The data already exists and the Tools library already renders it; this would be a printable
extract.

⚠️ Free tiers are **volatile**. Whatever this page says must carry dates, and the curriculum's
existing `**Unverified**` convention applies.

### 5. `netlify.toml`

Deliberately skipped. GitHub Pages works, and adding a second deploy target adds a second
thing that can break silently. Not worth it unless the site moves.

---

## P2 — larger ideas

### ✅ Resolve D-008 properly — DONE

**Resolved by deletion.** All fourteen unreachable modules were removed: 1,740 lines, 71 KB.
`lib/highlight.js`, `lib/pace.js`, `lib/pathOrder.js`, `lib/review.js`, `lib/today.js`,
`lib/yourWork.js`, `components/EmptyState.jsx`, `EnergyModeSelector.jsx`, `ReviewQueue.jsx`,
`TimeBudgetSelector.jsx`, and the four hooks `useApplications`, `useCertifications`,
`usePortfolio`, `useSchedule`.

**The concern in the paragraph above turned out not to apply.** Deletion did not touch the
transfer `KEYS` list, the validators or the tests, because none of them referenced these
modules — the estimate came from the same assumption (that a `src/` module is probably wired
to something) that let the dead set grow in the first place. It was checked before deleting
rather than after.

Two things were verified first, because both are the kind of claim that is easy to assert and
cheap to falsify:

- **Every design principle survives.** D-019 was cited from seven other files, D-020 from four,
  D-021 from two. Deleting did not remove a single no-shame rule, only the duplication of them.
- **The build is byte-identical.** Total `dist/` output was 3,910 KB before and 3,910 KB after —
  a 0 KB delta, which is the direct evidence that these modules were never in the bundle.

`lib/pace.js`'s latent crash (`.every()` on an always-`undefined` value) is gone with it. That
crash could never fire, because no caller passed it a projection — which is exactly why it
survived fourteen checks: **code that never runs cannot fail a test.**

**And the documentation was wrong about why it was kept.** D-008 claimed these were "tested
pure modules". They were tested by nothing. `audit-projections.mjs` walks the tree and so
*mentions* all fourteen, which reads like coverage in a grep and is not coverage. Corrected in
D-008, where the false claim is preserved alongside its correction rather than quietly edited
away — the claim surviving unchallenged for this long is the more useful lesson.

**Two guards now prevent a repeat.** `scripts/check-reachability.mjs` (check 15) walks
reachability from `src/main.jsx` and **fails the build** if any module becomes unreachable, so
the dead set cannot silently regrow. `audit-projections.mjs` now distinguishes a module that was
**deleted** from one that was **revived**; it previously reported both as "reachable again",
which is the opposite of what a deletion is, and would have made this cleanup fail the build it
was supposed to enable.

### A "Today" view

`lib/today.js` was deleted with the rest of D-008 rather than kept as a starting point: the
logic was ported for a career surface this curriculum does not have, and its `bandInfo` export
was reachable only through `TimeBudgetSelector.jsx`, which was itself unreachable. Keeping
unrunnable code as scaffolding for a future feature is how 1,740 lines accumulated. If the view
is built, it should be written against this curriculum's actual data — the `band`/`energy`
vocabulary is the part worth carrying forward, and that lives in the phase contract, not in
`today.js`.

### Progress that survives a device

Progress lives in `localStorage`, with an export/import backup. That is the right call for a
static site with no backend and no account. But it means progress does not follow the reader
between devices. A read-only share URL (compressing progress into the fragment) would be
possible with no server.

### Verify the volatile facts, once, properly

Free tiers, context windows and model availability are **dated rather than verified**, because
verification needs network access this project deliberately rations. The right fix is one
focused pass with network access, updating every dated claim at once — not continuous polling.

There is a `docs/SEARCH-REQUESTS.md` accumulating the specific questions that need answering.

---

## What "done" looks like

For the stated goal — building real skill, and being able to show it:

1. **The curriculum is already there.** 65 phases is more than enough; more content is not the
   bottleneck.
2. **Work the tasks.** 886 practice tasks exist. Reading them is not the same as doing them.
3. **Build the three portfolio pieces** the career track specifies, and put them on GitHub.
4. **The site is one of them.** It is a real, deployed, CI-verified application with a content
   pipeline, 11 guards and a test suite — and it renders a curriculum that is itself
   machine-verified. That is a legitimate thing to show someone.

The remaining engineering work above makes the project **better verified**, not more
employable. Past a point, the marginal hour is better spent on the practice tasks.

---

## A note on how work gets verified here

Three times in this project a guard was described as enforcing a rule it did not enforce, and
once the entire site rendered unstyled with every check green. The lesson generalises:

> **A check that passes is evidence about the check, not about the thing.**

Everything in the P0 and P1 lists above is really the same item: **the path from source to
screen is where the untested risk lives.** Content is verified thoroughly. The rendering of
that content is verified thinly. That is the gap worth closing.
