# Workflow

How to actually work in this repository: the edit loop, the verification order, and the two
traps that have cost the most time.

Read [SETUP.md](SETUP.md) once to get running. This file is about the day-to-day loop.

---

## The loop

```
edit Markdown  ->  npm run build:content  ->  npm run build  ->  restart preview  ->  verify
```

**Every step is load-bearing, and skipping one produces a confusing failure.**

| Step | Why it cannot be skipped |
|---|---|
| edit `ai-roadmaps/**.md` | the source of truth |
| `npm run build:content` | compiles Markdown to JSON; **the site never reads Markdown** |
| `npm run build` | bundles `src/` + the generated JSON into `dist/` |
| restart preview | `vite preview` serves `dist/`; it does not notice a rebuild |
| verify | look at the rendered page |

### The two traps

**1. A stale generated bundle.** Edit a phase, reload the browser, see no change — because
`learning-site/src/data/generated/` still holds the old compile. This has produced multiple
false bug reports.

**2. A stale `dist`.** Worse, because it fails *quietly*: a browser check reads `dist`, not
`src`. If you rebuild content but not the bundle, a browser check can pass or fail for reasons
unrelated to your change. **A preview server started before a rebuild keeps serving the old
bundle until restarted.**

If a change appears to have no effect, check these two before debugging anything else.

### ⚠️ Trap 3 — TWO SERVERS ON PORT 4173, and the browser checks silently average them

**This one is worse than the other two, because the failure looks like a content defect.**

Two `vite preview` processes *can* both bind 4173 on Windows, and the OS then hands successive
connections to whichever one it likes. A browser check pointed at `http://localhost:4173` reads
**a different site on some requests than on others.** The result is not an error — it is a
nonsense result:

> `✖ every track: could not open the track (no-heading) — its 8 phase(s) are unverified`
> for **all ten tracks**, ending in `0 phase(s) with problems`.

**"All ten tracks broken, but zero problems found" is the signature.** So is *any* total failure
that contradicts its own summary. Suspect the port before the content.

**How this actually happens here.** The sibling project `cs-roadmap` is a separate checkout with
its own `vite preview`, and **it defaults to the same port 4173**. On 2026-09-25 a `cs-roadmap`
preview was already listening when this repo's checks ran, and the sweep failed on every track
while the app was completely fine.

**The rules that follow — and they matter more than usual when more than one agent or terminal is working:**

1. **Never assume 4173 is yours.** Before any browser check, run
   `Get-NetTCPConnection -State Listen -LocalPort 4173` and **count the listeners**. More than
   one means the result is unreliable — stop and use a private port.
2. **Do not kill a server you did not start.** It may be another checkout's, or another
   session's mid-verification run. Use a different port instead; that costs nothing and breaks
   nobody.
3. **Use a private port for your own runs.** `npm run preview -- --port 4199 --strictPort`, then
   point every check at it:
   ```powershell
   $env:VITE_PREVIEW_URL="http://127.0.0.1:4199"
   node scripts/sweep-phases.mjs http://127.0.0.1:4199
   ```
4. **`--strictPort` is what tells you the truth.** Without it, Vite silently increments to the
   next free port, your checks keep hitting the *other* server, and the summary looks fine while
   testing nothing. With it, a taken port fails loudly.

**The general lesson, which is this project's most repeated one:** when a guard reports something
implausible — especially a total failure with a clean summary — **suspect the instrument before
the subject.** Here the content was correct all along, and the only real defect was two servers
sharing a port.

---

## Commands

From `learning-site/`:

| Command | Does |
|---|---|
| `npm run dev` | rebuild content, then start the dev server on **5173** |
| `npm run build` | rebuild content, then bundle into `dist/` |
| `npm run preview` | serve `dist/` on **4173** |
| `npm test` | **17 checks**; 15 offline plus 2 preview/browser checks that skip if no server answers |
| `npm run check` | the three content-contract guards only |
| `npm run test:browser` | browser checks; **needs a running server** |

⚠️ Use `http://localhost:4173`, not `http://127.0.0.1:4173` — the dev server binds IPv6 only.

⚠️ Never set `VITE_BASE` for local work. It is for the GitHub Pages build and it produces a
**blank page** locally, because the HTML requests assets at a prefix your server does not have
and gets the `index.html` fallback **instead of JavaScript**.

---

## Verification order

Cheapest and most specific first. Do not jump to the browser.

**1. Content contract** — catches most phase-file mistakes:

```bash
node scripts/build-content.mjs --check; echo "exit=$?"
```

⚠️ **Always check the exit code.** The pass summary goes to **stdout** and failures to
**stderr**, so `| tail` can display a pass line from a run that failed.

**2. Full guard suite** — offline checks plus the preview-backed browser checks:

```bash
cd learning-site && npm test
```

Runs 17 checks in order. Fifteen run without a server; the rendered accessibility audit and all-phase sweep use the production preview on port 4173 and explicitly skip if it is unavailable. For full coverage, build first and start `npm run preview` in another terminal before `npm test`.

| # | Check | Catches |
|---|---|---|
| 1 | content build | writes JSON; contract violations |
| 2 | field shapes | a field whose shape the renderers cannot consume |
| 3 | projection reads | a component reading a field absent from its projection |
| 4 | inline markdown rendering | `renderInline` regressions |
| 5 | quiz correctness | all 549 questions: one correct option, `**Why:**`, valid energy |
| 6 | lesson block renderer coverage | a block type with no `case` |
| 7 | component rendering | real React markup and projection degradation behavior |
| 8 | in-lesson search | `lessonTerms`/`buildEntries`/`searchLesson` |
| 9 | cost classification | every distinct `cost:` string is classified |
| 10 | worked-example arithmetic | the corpus's own sums |
| 11 | encoding and line endings | LF, UTF-8 no BOM, no tabs, no mojibake |
| 12 | CSS wiring | every JSX class has a rule; every token is defined |
| 13 | accessibility (rendered page) | six-view rendered a11y, with a loud skip if preview is unavailable |
| 14 | every phase renders | all 65 phases in a real browser, with a loud skip if preview is unavailable |
| 15 | mixed practice sets | pool shape and sampling behavior |
| 16 | exams | per-track scoring, balanced capstone rotation, exhaustive resume and backup rules |
| 17 | reachability | every `src/` module is reachable from `main.jsx` |


Read the list from the source rather than trusting this table if the count matters —
`check-all.mjs`'s `STEPS` array is authoritative, and the count has changed five times.

**3. Browser** — only after 1 and 2 pass:

```bash
npm run build
npm run preview                      # in another shell, serves 4173
npm test                             # includes a11y + all-65 browser checks
npm run test:browser                 # smoke + deeper interaction checks
```

If another local project already uses port 4173, start preview on a free port and set
`$env:VITE_PREVIEW_URL='http://localhost:4174'` in PowerShell (or `export VITE_PREVIEW_URL=...` in a POSIX shell) before running either test command. Browser checks default to 4173; `npm test` passes this override to its preview-dependent audits.

---

## When you change content

After **any** Markdown edit, these must pass:

```bash
node scripts/build-content.mjs --check
node scripts/audit-quiz.mjs
node scripts/audit-lesson-ast.mjs
node learning-site/scripts/audit-encoding.mjs
```

The phase contract is in [AGENTS.md](AGENTS.md) and [docs/CONTENT-SCHEMA.md](docs/CONTENT-SCHEMA.md).
The rules agents break most often:

- **14 sections, fixed order, exact spelling.** `## Tools for This Phase` has a capital **T**.
  `## You're ready to move on when...` ends in **three ASCII dots**, not `…`.
- **`band` ∈ `quick|focused|deep|ongoing`.** ⚠️ `normal` is an **energy**, not a band.
- **Quiz options carry NO ids.** Not even `-opt`.
- **Field order is fixed**: practice task `id, band, energy`; checklist `id, energy`;
  quiz heading `id: … energy: …`.

---

## When you change code

Ask **which projection** the data comes from. There are two, and conflating them is the defect
that shipped once:

- **`generated/index.json`** — the light projection. Eager. Phases carry `id, order, phase,
  title, duration, durationWeeks, goal, lessonWordCount, checklistIds, taskIds, quizIds`.
  **No tools, no resources, no prose.**
- **`generated/<track>.json`** — full. ~1.3 MB per track, loaded lazily via
  `loadTrackPhases(trackId)`.

If a page shows **zero** of something that exists in the Markdown, check the import before
checking the content:

```bash
cd learning-site && node scripts/audit-projections.mjs
```

If you change a component's classes, run the CSS guard:

```bash
node learning-site/scripts/audit-css.mjs
```

---

## Adding a guard

A guard that cannot fail is worse than no guard — it is **believed**. Three separate guards in
this project were documented as enforcing rules they did not enforce.

1. Write it so it exits **non-zero** on failure and names the **file, line, and what to do**.
2. **Prove it fails.** Break the thing deliberately, show the output, restore, and confirm
   `git diff` is empty.
3. Wire it into `check-all.mjs` `STEPS` with a real `why` — not "checks X" but **what breaks if
   it is absent**.
4. State its **limits** in the file header. `audit-projections.mjs` says plainly that it checks
   field *existence*, not values, so it would not have caught the em-dash link bug.

5. **If it baselines known defects, handle their DISAPPEARANCE.** See below — this is not
   hypothetical; it happened the same day the a11y audit was written.

⚠️ **A guard's blind spot is exactly as wide as the selector it uses to find its input.** This
has bitten four times: a directory list, an extension list, a hardcoded file list, and a
`[tabindex]` selector that matched `tabindex="-1"` — a value *defined* as excluded from the tab
order — so adding a correct skip-link fix made the audit report a fake reachability failure in
all four views.

### Baselines that outlive their defects

An audit with a `--baseline` mode (known defects are recorded so the suite stays green) has a
failure mode that looks like success. **When the defects get fixed, the baseline entries stop
matching — and if "no match" is not itself reported, the suite fails with no explanation, or
silently keeps a fixed defect listed forever.**

This happened here within hours: three a11y defects were fixed, and `--baseline` began exiting 1
with four unexplained problems. The three fixes were correct; the baseline could not express
"this is fixed now".

If you add a baseline, a stale entry must **say so loudly and be removed**, not fail obscurely
and not linger. And when you fix something a baseline lists, **remove its entry in the same
commit** — otherwise the next reader is told a fixed thing is still broken.

---

## Delegating to subagents

If you hand work to an agent, bound it. Every brief in this project includes:

- **"do not spawn subagents"** — an unbounded agent parallelises by default and multiplies cost
- **a call budget** (~60–70)
- **a zero-network instruction** — `web_search` returns HTTP 402; the balance is negative
- **"create no other file; use inline `node -e`"** — a subagent's scratch script was once swept
  into a commit, and another left six `__dbg*.mjs` files behind
- **"never regex a prose file"** — a find-and-replace consumed the `### ` prefix and destroyed
  **54 quiz headings**
- **a mandatory negative control**

⚠️ **`git add -A` is unsafe while a subagent runs in the same tree.** Stage by explicit path.
This session staged every commit that way.

⚠️ **A subagent's self-report is not verification.** Reports mix true and false claims. One
subagent self-corrected two of its own; another caught a **false premise in my brief**; another
reported `today.js` as dead when it is imported by `TimeBudgetSelector.jsx`. Check each claim
against the artifact.

---

## Committing

`main` is the deploy branch. New commits trigger CI and a Pages deploy.

```bash
git add <explicit paths>
git commit -F <message-file>     # never inline: PowerShell mangles it
git push
```

Then confirm both workflows went green:

```bash
curl -s https://api.github.com/repos/MarkKramm/vibecoding/actions/runs?per_page=4
```

**Write commit messages that explain what was wrong**, not what was added. Most of the valuable
work here was discovering that something believed to be working was not.

---

## Before you trust a result

> **A check that passes is evidence about the check, not about the thing.**

**Suspect the instrument before the subject.** Eight times in this project an implausible result
was the query's fault:

- an inline regex lost its `$` to PowerShell and reported **all 17 hooks as dead** (the answer
  was 2)
- a probe looked for `o.correct` on quiz options and returned an **all-zero histogram** across
  549 questions — the data uses `answerIndex`
- a probe typed into the search box and saw 0 results, because search runs on **submit**
- a hook audit reported **all nine** lib modules as dead, including two that are demonstrably
  used, because the regex lost its word boundaries

**An implausibly large, small, or suspiciously uniform result means the query is wrong.** Prove
your probe detects a known-bad input before believing a clean result.

⚠️ **And do not fight PowerShell's quoting for non-trivial JavaScript.** Write a script file.
That trap alone has produced wrong answers twice.
