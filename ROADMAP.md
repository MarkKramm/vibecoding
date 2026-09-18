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

**Verification is real.** 11 offline checks, 315 unit-test assertions, plus browser checks
through headless Edge over CDP. Every guard has been proved capable of failing.

---

## P0 — things that are actually wrong or missing

### Mobile has been emulated, never touched

The layout is verified at 1440px and 390px in a headless browser. It has never been opened on
a real phone. Emulated viewports do not reproduce real touch targets, real font rendering,
real scroll behaviour, or iOS Safari's specific quirks. If you have a phone, open the site on
it.

### The browser suite samples, it does not sweep

Browser verification walks a sample of phases, not all 65. It would not catch a defect unique
to phase 61.

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

### Resolve D-008 properly

Several modules and hooks are ported from a sibling project and are unreachable here
(`lib/highlight.js`, `lib/pace.js`, `lib/pathOrder.js`, `lib/review.js`, `lib/yourWork.js`,
and four hooks). They are documented and annotated rather than deleted, because D-008 explains
that deleting touches the transfer `KEYS` list, the validators and the tests, and would have
to be redone if the career views return.

**One of them is a latent crash** — `lib/pace.js` calls `.every()` on a value that is always
`undefined`. Either make it defensive or delete it.

### A "Today" view

`lib/today.js` exists and `TimeBudgetSelector` uses part of it, but there is no page that says
*"here is what to do in the 40 minutes you have right now."* That is arguably the single most
useful thing the site could do for its actual audience, and most of the logic exists.

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
