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

### The live page has never been observed

`*.github.io` resolves IPv6-only and is **unreachable from the environment this was built in**.
The deploy is verified at the **artifact** level: the deployment reports `state=success`, the
artifact is the expected size, the built bundle contains the expected strings, and the
same bundle was verified to render correctly **locally** on port 4173.

**That is not the same as having loaded the live URL.** If you are reading this, the single
most valuable thing you can do is open the site and confirm it renders. It should.

### Mobile has been emulated, never touched

The layout is verified at 1440px and 390px in a headless browser. It has never been opened on
a real phone. Emulated viewports do not reproduce real touch targets, real font rendering,
real scroll behaviour, or iOS Safari's specific quirks. If you have a phone, open the site on
it.

### No test covers the components themselves

Search, highlighting and the pure libraries now have unit tests (their absence in the README
is stale as of this writing). What has **no** test is the React layer: no test mounts
`<Quiz>`, `<LessonBlock>` or `<ToolCard>` and asserts on rendered output. The lesson-block and
inline-markdown tests render through `react-dom/server`, which is a genuine check but not a
component test.

### The browser suite samples, it does not sweep

Browser verification walks a sample of phases, not all 65. It would not catch a defect unique
to phase 61.

---

## P1 — worth doing, in rough priority order

### 1. A real component test layer

The highest-value gap. Every defect that reached the rendered page this project — a page
showing "0 tools", 40 dead links, a completely unstyled layout — was invisible to content
checks and would have been caught by *rendering the component and asserting on the output*.

The infrastructure already exists: **esbuild is on disk** as a Vite dependency, and the
existing tests already transform JSX in memory and render with `react-dom/server`. No new
dependency and no test framework is needed. Add:

- mount `<Quiz>` and assert the correct option is marked, the `**Why:**` renders, and keyboard
  navigation moves focus
- mount `<ToolCard>` with and without a URL, and assert **no anchor** is emitted when there is
  none — the exact regression that shipped
- mount the dashboard with the light projection and assert it does not read a missing field

### 2. An accessibility audit, automated

Current a11y work has been **manual and partial**: a skip link, `:focus-visible` styling,
`useFocusTrap` for modals, a `<main>` landmark, and `role="alert"`/`role="status"` on the
backup-import messaging. There is **no automated** check of contrast ratios, heading order, or
that every interactive element is reachable by keyboard.

⚠️ One specific gap worth naming: **the search result count is not announced.** The live-region
roles exist in `DataTransfer.jsx` and `PhaseTransfer.jsx`, but nothing in the search view uses
`aria-live`, `role="status"` or `role="alert"` — so a screen-reader user typing a query gets no
feedback that the result list changed. That is a small, concrete, high-value fix.

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
