# Changelog

This project was built in a small number of very long sessions, so a date-based changelog
would be useless — nearly every commit shares a date. It is organised by **what changed and
why**, newest first.

The full commit history is the authoritative record: `git log --oneline`.

---

## Unreleased

### ROADMAP P1, done: the volatile facts were re-checked against primary sources, and five of six concrete figures still held

- **The scope was drawn by what a source can settle, not by what is dated.** 116 lines across the
  corpus carry a date and a volatility marker; most say "as of 2026-09, this changes", which is a
  *promise not to rely on the figure*. Verifying those would report 100% confirmed and mean
  nothing. Narrowing to dated claims that state a **concrete figure** left six that a source could
  actually decide.
- **Confirmed verbatim:** MCP `2026-07-28` is still the current protocol version, with
  `2025-11-25` and earlier still handshake-based; OpenAI Batch is still a 50% discount with a
  24-hour window and `completion_window` fixed at `24h`; the enterprise figure of ~$13 per
  developer per active day, $150-250 per month, under $30 for 90% of users is still quoted as-is in
  `costs.md`; and agent teams are still "approximately 7x more tokens than standard sessions when
  teammates run in plan mode". The lessons' own caveats against generalising the last two are
  correct and were kept.
- **One correction, and it strengthens the lesson rather than weakening it.** `cost/01` argued that
  "a per-provider multiplier has quietly become a per-model one" on the strength of one `0.025x`
  exception across two models. There are now **two exception tiers across three models** — `0.025x`
  on Fable 5.1 and Mythos 5.1, `0.05x` on Opus 5.5 — and the **minimum cacheable prefix has drifted
  the same way**, to `512`/`1,024`/`2,048`/`4,096` by model. The lesson was understating the
  evidence available to it, and the silent-failure mode doubled: a prefix that caches on one model
  and is silently not cached on another costs full input price with no error to show for it.
- **`cost/01:139`'s "three to five times" output multiple was deliberately NOT narrowed.** Every
  active model is now exactly 5x, so the bottom of the stated range is unobserved on this provider —
  but 5x is inside the range, so the claim is not falsified, and the sentence's whole instruction is
  *do not carry this number out*. Editing a range toward a single observed value would reinforce the
  habit it exists to break. Recorded in `docs/VERIFIED-FACTS.md` §2.4 rather than changed.
- **No date was advanced anywhere except the claim actually re-read.** The other 110 dated lines
  still say `2026-09`, because a date is a statement about what was checked. Bumping them to look
  current would convert a true record into a false one — the failure mode this whole pass exists to
  catch, committed in the opposite direction.
- **The figure that drifted is the one sourced from a pricing table rather than a spec**, because
  pricing tables are edited per-model and specs per-version. That is an argument for re-checking
  prices more often, not less.

### The new doc-count guard caught its own author: a content edit that split a paragraph moved the corpus by one line

- Adding the correction above split one paragraph into two, so the phase files went from 23,560 to
  **23,561** non-empty lines. `audit-doc-counts.mjs` — whose four source-size claims landed in the
  previous commit — failed on `ROADMAP.md:15` and `CHECKPOINT.md:42` in the same run, naming both
  the stated and the actual figure.
- That is the guard working as designed on its first real content edit after landing, and it is the
  strongest available evidence that the claims were worth adding: the previous session could prove
  they *fail* by injection, but could not show one firing unprompted on a real edit.
- Both documents were corrected to 23,561. No guard was touched, and no pattern was widened to make
  the number match — the same rule `AGENTS.md` states about the encoding audit.

### The mojibake table matched character TRIPLES, so a corrupted em dash sat in `HANDOVER.md` undetected — matching the bounded prefix instead found six more

- **`HANDOVER.md:1856` contained a real `U+00E2 U+20AC U+0022` sequence and the guard called that file
  clean.** The line quotes a console misrendering, and its third character is a **straight quote**
  rather than the curly one — but every entry in `MOJIBAKE` matched a **three-character** pattern, so a
  variant with a different third character matched nothing at all. Found by counting `U+00E2` across
  the repo while verifying the root-coverage fix: `HANDOVER.md` held **1**, `CHANGELOG.md` **0**.
- **The table was enumerating the wrong thing.** A corrupted character's third codepoint is
  **unbounded** — it varies with whatever normalised the quote afterwards — while the **prefix** is
  bounded, because a euro sign directly after an a-circumflex only ever arises from misreading a UTF-8
  three-byte character as cp1252. Two **family** entries were added on that prefix, and the corpus
  turned out to hold **seven** instances the old table could not match: four real corrupted statute
  section signs in `docs/SEARCH-REQUESTS.md` — a stray `U+00C2` before `U+00A7` where a plain `§`
  belongs, in the citations for `B`, `B`, `K.1` and `K.3`, all four **repaired to `§`** — plus three
  deliberate illustrations of the console artifact in `AGENTS.md`, `SETUP.md` and
  `TROUBLESHOOTING.md`, rewritten to **name the codepoint** instead of writing the sequence. That
  choice is the guard's own stated convention, and the alternative the temptation offers is a filename
  exemption — an exempted file is one the check cannot police. `HANDOVER.md`'s instance got the same
  treatment.
- **A family entry would have double-reported every specific one, so the scan was rewritten.** The
  prefix matches a corrupted em dash exactly as the three-character entry does, and the old code ran
  two loops that each pushed a problem. It now takes the **earliest** match and, at equal positions,
  the **longest** pattern, then resumes after it — so `mojibake em dash` still wins over the family
  name, while two *distinct* corruptions on one line are both reported.
- **Proved by injection, not by argument.** Five cases against a covered root file, with the bytes
  asserted present on disk **before** each audit ran: straight-quote variant → **1** report with the
  family label; curly-quote em dash → **1** report reading **`mojibake em dash`** (the dedupe holds);
  section sign → **1** report; two corruptions on one line → **2** reports (`em dash` *and* `e-acute`);
  clean line → **exit 0**. Baseline **0 → 0** after the repairs, and the target was byte-identical
  after restore. One probe artifact is recorded rather than hidden: the clean-line case printed
  `mojibake_report_count: 1` because the suite's **success banner** reads *"no mojibake, no tabs"* and
  the probe counted lines containing that word. The **exit code** was the valid signal; the counter
  was not.
- **The guard is less wrong, not complete.** The principled generalisation is *any* of `Â`, `Ã`, `â`
  followed by *any* cp1252-mapped byte, and only the two families with **observed** damage are
  implemented. `HANDOVER.md` §30 records that limit and the reason this table is grown from evidence
  rather than from reasoning.

### The encoding guard had never opened six of the repo's own root files — measured against a control, then fixed by enumerating the root

- **`audit-encoding.mjs` named nine root files and six were missing.** `SCAN` carried `HANDOVER.md`,
  `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `LICENSE`, `PASTE-THIS.txt` and the three dotfiles by
  hand, while **`CHANGELOG.md`, `CHECKPOINT.md`, `ROADMAP.md`, `SETUP.md`, `TROUBLESHOOTING.md` and
  `WORKFLOW.md`** — all tracked, all Markdown, the exact file type the guard exists to police — were in
  no list at all. The guard had been reporting *"all clean"* over six files it had never read. This is
  the **third** instance of the same class of gap and the **second time the fix for it was "add the
  files that were missed"**; `HANDOVER.md` §51 now enumerates all three.
- **Measured, not inferred — and the first attempt at the measurement was worthless.** The probe injects
  one lone CR per file and then runs the real audit. Its first version confirmed the restore by
  comparing the file to itself *after* restoring, which reads "restored" whether or not the sabotage
  ever reached disk; that result was discarded rather than reported. The rewrite asserts the CR is **on
  disk before the audit runs** and byte-compares the restore afterwards (`length` *and*
  `Buffer.compare`): **all six exited 0 and were never reported**, while the control `HANDOVER.md` —
  which *is* in the list — **exited 1 and was named**. That asymmetry is the whole result: the CR
  detector works, and the **list** was the hole.
- **Fixed by enumerating the repo root instead of listing it.** `ROOT_FILES` is
  `readdirSync(REPO, { withFileTypes: true })` filtered to files, and each goes to `check()`
  **directly** so the extension filter cannot skip it — that filter is exactly what would drop a future
  `Makefile` or `CODEOWNERS`. Nothing needs to be added when a root file appears, which is the point.
  Files scanned went **208 → 214**, exactly the six (which also
  reconciles the 208 quoted in the notes-flush entry below).
- **A second, latent hole in the same class was closed while checking the first.** `walk()` decided
  coverage by file extension and kept an `EXTENSIONLESS` set naming the four extensionless root files
  **by hand** — so an extensionless file added in a **subdirectory** would still have been skipped in
  silence, and once the root pass read every root file the set was dead code as well, since all four
  of its members were root files. The set was **deleted** and replaced by a rule: a file is ours if
  its extension is one we own **or** it has no extension at all (there are no extensionless binaries
  in this repo). Proved in **both** directions, because a rule that simply reads everything would pass
  a one-sided test: an extensionless file carrying CRLF, created in `learning-site/scripts/`, was
  reported as `2 CRLF line ending(s)` with exit 1, while a `.bin` file carrying the **identical** CRLF
  was correctly left unread. The probe file was created and deleted inside one process and the tree
  was verified clean afterwards.
- **The probe was re-run against the fix, not merely written down.** Identical injection, identical
  control: all six now **exit 1 and are named**, `unnamed_root_files_missed` reads `0/6`, and the
  suite reports `✓ all 20 checks passed` with the step reading `214 file(s) scanned`. The probe was run
  from `%TEMP%` and deliberately **not** committed, per `AGENTS.md`'s no-scratch-files rule, so the
  durable artefact is the **method**: inject one lone CR per root file, assert the CR is on disk
  *before* the audit runs, run the real audit, read its exit code and whether it names the file,
  restore, then byte-compare the restore. It requires no network.
- **A console artifact nearly became a false repair.** Reading the guard through PowerShell
  `Get-Content` rendered a clean em dash and a clean section sign as garbage at two lines of
  `audit-encoding.mjs`. Those corrupted forms are named here by **codepoint** — the em dash variant is
  `U+00E2 U+20AC U+201D`, and the section-sign one is `U+00C2` followed by `U+00A7` — rather than
  written literally, for the reason the guard's own header gives: a file containing the sequence it
  searches for fails on itself, and the tempting fix is a filename exemption that creates a file the
  check cannot police. Counting codepoints in the file instead gave `U+00E2: 0`, `U+00C2: 0` and five
  genuine `U+2014`, so PowerShell 5.1 reading BOM-less UTF-8 as cp1252 had corrupted the **display**
  and not the file. `HANDOVER.md` §32 says to read codepoints from the file, never the console, and the
  guard was left alone rather than edited to agree with a stale verdict.
- **The new coverage proved itself on the very first file it was pointed at, by accident.** Drafting
  this entry put a literal corrupted em dash into `CHANGELOG.md` — a quoted `U+00E2 U+20AC U+201D`
  sequence — and the guard, which had never opened `CHANGELOG.md` before the change, failed at once
  with `CHANGELOG.md:42: mojibake em dash` and exit 1. Two things follow, and both are the point:
  the six-file gap was **not** theoretical (a real defect landed in the newly-covered set within
  minutes of it being covered), and the correct response was to rewrite the prose to name the
  codepoints — **not** to exempt the file. The corpus is clean at 214 files after that rewrite.

### The notes-flush unit test existed but nothing ran it — registered as check 20 of 20, and proved falsifiable

- **`learning-site/scripts/test-notes-flush-unit.mjs` passed 5/5 by hand and was referenced by no
  guard.** `check-all.mjs` is the only registry — `npm test` is `node scripts/check-all.mjs` — and
  the file was absent from its `STEPS`, so the suite never executed it. That is the same state
  `verify-notes-flush.mjs` sat in before it was wired in: **a test no registry runs is a file, not a
  test.** It is now step 20, after "prop contracts", and the suite reports `✓ all 20 checks passed`
  with the step visible as `▶ notes flush (unmount persistence, unit)`.
- **Why a second test was needed at all.** `verify-notes-flush.mjs` drives the real app over CDP
  and **passed 9/9 with the flush deliberately reverted to a plain state write** (recorded above).
  The cause is React's own ordering, not a bug in that script: typing dispatches a synchronous
  `input` event, so `setNote` runs and schedules a render, but the `useEffect([notes])` write is a
  **passive** effect and is not flushed during that event. When the following click commits,
  `commitRootImpl` calls `flushPassiveEffects()` **first**, so the ordinary write lands before
  `PhaseDetail` unmounts and the flush has nothing left to do. Removing the flush therefore changes
  nothing observable in a browser, and the 9/9 was evidence about the harness rather than the hook.
- **What the unit test does instead.** It mounts the hook directly and puts the state update and the
  unmount in **one synchronous block with no `await` between them**, so no passive effect can run in
  between. `localStorage.clear()` runs between the write and the unmount, which removes the mount
  write; the only thing that can put the marker back is the flush. It also covers a second, distinct
  failure — **two writes in one tick** — where a functional-setState implementation would let the
  first phase's note vanish while a single-write test still passed.
- **The test was proved falsifiable rather than assumed to be.** Its header claimed "with the flush
  removed the store stays empty and this file exits 1 — verified by doing exactly that"; that claim
  had not been checked in this session. Commenting out the single `setItem` line in the unmount
  cleanup moved the run to **3 passed, 2 failed**, and the two failures were exactly the
  flush-dependent ones — `the last keystroke survives an unmount with no intervening render` and
  `two writes in one tick both survive the unmount` — with the mount-write assertion still green
  (`mount write was "{}"`). The flush was restored immediately and the run returned to 5/5. A guard
  that has only ever been seen passing is not yet evidence, which is why the probe is recorded here
  instead of the assertion.
- **Line endings.** The file was CRLF on first write and was normalised to LF with
  `UTF8Encoding($false)`, stripping CR only. `audit-encoding.mjs` — which scans
  `learning-site/scripts` — now reports all 208 files clean. On a first attempt the audit reported
  the identical failure *after* a fix that had in fact worked; the audit had run before the write in
  the same batch. The file was verified at byte level (`CR=0 LF=373`) rather than edited to satisfy a
  stale verdict.

### The handover's content section said 32 phases were still missing — the curriculum finished at 66

- **`HANDOVER.md` §6 still told a resuming reader that content was the remaining work.** Four
  separate figures said so: `§6.1 Content — 32 remaining phase files`, `Authored: 31. Remaining:
  32.`, `SEVEN of ten tracks are complete … 15 of 63 phases`, and `21 of 63 phases across 4
  tracks`. Every one of them is false today: `git ls-files ai-roadmaps` returns **66 phase files
  across 10 tracks**, and each track carries its `00-overview.md` and `checklist-master.md`.
- **This is the same failure class the previous session fixed, which is why the top-of-file
  START HERE exists.** The content was finished by commits that post-date §6, so the section was
  stale by construction rather than by mistake — nothing updates a section that reads as *the
  plan*. `ROADMAP.md` and `CHECKPOINT.md` already said 66 / 10; `HANDOVER.md` was the one file
  still describing work that had been done.
- **Marked, not deleted.** §6.1 and §6.2 are now prefixed `HISTORICAL` with a status line, §6.3
  (already titled "Historical milestone") got a corrected count, and each individual figure is
  marked `SUPERSEDED 2026-09-28` in place. The engineering history in those sections is still
  worth reading — §6.2's rendering defect and its resolution especially — so the text is kept and
  the verdict is added above it. The same treatment was applied to §14's title, which named "the
  remaining 21 phases".

### Notes and task answers had never saved — a prop-contract mismatch, not a race

- **`PhaseDetail.jsx` passed three components props they do not declare, so three features were
  dead rather than flaky.** `NotesPanel` declares `note`/`onChange` and was handed
  `notes`/`onNote`, so `note` arrived as an **object**, `note.trim()` threw, and the change
  handler was `undefined` — **notes never saved, not once, since the port.** `TaskList` was handed
  the checklist's `done`/`onToggle` instead of `answers`/`onAnswer` (task answers never saved),
  and `ChecklistItem` was handed that same id-map instead of `checked` (no checkbox ever rendered
  ticked, while the progress ring counted them). All three now use the declared names.
- **A long-standing misdiagnosis is corrected in the record.** The `useNotes` unmount flush was
  written to close a *race* where typing and clicking "Next" in the same frame could drop the last
  keystrokes. The race is real; it was also invisible behind a total failure. The flush is kept —
  correct on inspection, cheap — but **it is not proven, and the notes defect was never it.**
- **New guard `learning-site/scripts/audit-props.mjs`, wired into `check-all.mjs`.** It compares
  every component's declared props against every JSX call site and fails when a declared prop has
  no caller. It is the only check that reads **both halves** of the prop contract, which is
  precisely why 22 guards and 571 assertions were green while notes never saved.
- **The energy/budget footer was removed, not relabelled.** `App.jsx` printed
  `Energy: … · Budget: …` from `useEnergyMode()`/`useTimeBudget()`, but neither value reached any
  page and their only controls had been deleted with D-008. Because `check-reachability.mjs`
  **exits 1** on any module unreachable from `main.jsx`, deleting the line alone would have
  stranded both hooks and failed the build — so the footer line, both calls, both imports, and
  `src/hooks/useEnergyMode.js` + `src/hooks/useTimeBudget.js` all went. Both storage keys stay in
  `lib/transfer.js` → `KEYS`, relabelled as not used in this app, so an old backup still
  round-trips; that also documented a latent bug, since those keys' `kind` strings match no
  `mergeValue` branch and were already dropped silently on restore.
- **Also fixed:** a `useFocusTrap` `paddingRight` leak (cleanup hard-set `""` instead of restoring
  the captured previous value, so a second overlay cleared padding the outer one had set — now
  LIFO capture/restore), and a dead branch at `Exam.jsx:322` where `active` is always `null`.
- **⚠️ The unmount flush remains UNVERIFIED, and the test that "covers" it cannot fail.** After
  reverting the flush to write React state and rebuilding, `verify-notes-flush.mjs` still passed
  **9/9**. The CDP harness cannot isolate the unmount path under this timing — the ordinary write
  effect commits first. The 9/9 proves the note field round-trips; it says **nothing** about the
  flush. Closing it needs a different technique: a unit test that mounts the hook, calls
  `setNote`, and unmounts with no intervening render. Recorded as unproven, not claimed.
- **`DEAD_EXPECTED` emptied.** It still listed fourteen modules deleted long before — a guard
  describing a state that no longer existed. Nothing is legitimately dead today: `src/` holds 48
  modules, all reachable.

### Foundations gains a ninth phase: Multimodal and Vision

- **A topic-coverage sweep of all 65 phases found exactly one first-class capability with no
  phase.** Multimodal input was mentioned 7 times in the whole corpus, and only once
  substantively — a single subsection of `model-internals/06`. Every other apparent hole the
  sweep reported (FlashAttention, Mixture-of-Experts, jailbreaking, GraphRAG, PII) turned out to
  be **covered under different spelling**, which is the eighth time in this project that an
  implausible result was the instrument's fault rather than the corpus's.
- **New phase `foundations/09-phase-multimodal-and-vision.md`.** Mechanism-first, in the house
  style: patching and the lossy projection, why file size does not determine token cost while
  resolution does, predicting which visual tasks fail before testing them, screenshot-to-schema
  with a cross-field check, and the privacy duty that no technical mitigation covers. 17 practice
  tasks, 22 checklist items, 6 quiz questions, 9 tool rows.
- **Corpus is now 66 phases / 555 quiz questions / 903 practice tasks / 1,076 checklist items /
  442 tool rows**, across 91 Markdown files.
- **Four hardcoded corpus counts in the test suite were replaced with values read from the
  corpus.** `test-practice.mjs` asserted 549 questions and 65 phases, `test-exam.mjs` asserted
  549, and `test-components.mjs` asserted 433 tool rows. Adding one phase turned all four red for
  the one reason that is never a defect — the content grew — and each red test said nothing about
  the logic it guarded. They now assert the *property* (the pool is complete; the full projection
  carries rows the light one cannot; comprehensive mode covers the pool) with a floor that still
  fails on an empty corpus.
- **`docs/free-toolkit.md` drifted the moment the corpus changed, and the guard caught it.** The
  page written last session said 237 distinct tools; the corpus now said 243. This is the check
  working exactly as designed, and it is the only check in the suite that reads `docs/` at all.

### Every citation checked, and a guard that could not see its own blind spot

- **All 48 arXiv IDs verified against the arXiv Atom API — 48 correct, 0 wrong.** The failure
  mode this project was bitten by before (`2202.11903`, the Chain-of-Thought paper cited as an
  *astrophysics* paper) does not occur anywhere in the corpus. Two of the IDs looked most like
  fabrications and were both genuine: `2601.17548` (prompt injection in agentic coding
  assistants, Jan 2026) and `2406.10279` (package hallucinations, USENIX Security 2025), each
  independently corroborated down to its statistics. **"A recent ID is probably invented" is
  recorded as the wrong instinct** — fetch, do not discount on plausibility.
- **GitHub's documentation was recorded as un-fetchable and never was.** The log said three
  fetches returned only navigation and concluded that requests 8 and 9 were blocked "by any route
  we have". Appending `.md` to the article URL returns the full body, verified in both forms for
  the same page. The blocker sat on the books while a one-character fix went untried: *"this page
  truncates"* does not support *"this source is unreachable"*.
- **The Copilot training claim was confirmed and its scope corrected.** `2026-04-24` is right,
  but the corpus framed it as a free-tier cost. GitHub applies it to **Free, Pro, Pro+ and Max**,
  excluding only Business and Enterprise — the line is **individual-versus-business, not
  free-versus-paid**, so "I pay, therefore my code is not used" is false. Three phases corrected.
- **Six internal-consistency defects fixed, including a live duplicate of one already "fixed".**
  The earlier check grepped for `Prompting Phase 10`; the file also said *"Phase 10 of
  Prompting's framing"*, which that pattern cannot match — and the re-check searched for the same
  literal string and reported clean. **The fix reproduced the false confidence that created it.**
  Also fixed: two references to the wrong phase (resolving, but to the wrong subject), a reference
  past the end of a track, a concept attributed to a phase that never taught it, a 40-vs-41%
  disagreement inside one file, and **`README.md` claiming 63 phases when the corpus has held 65**.
- **A port collision that made browser checks read two websites at once.** Two `vite preview`
  servers can bind 4173 together; the sweep then failed all ten tracks while reporting "0 phase(s)
  with problems". The content was fine. Recorded in `WORKFLOW.md` as trap 3, with the rules:
  count the listeners, never kill a server you did not start, use a private port with
  `--strictPort`.
- **The exam feature from the previous session landed, with a data-loss bug found in review.**
  The backup merge for the rotating capstone rebuilt the record from `seenIds`/`best`/`attempts`
  and **dropped `comprehensive`**, so restoring a backup destroyed a passed comprehensive result
  silently. Every existing fixture used `comprehensive: { best: null }`, so no assertion read the
  dropped field. Seven assertions now cover it and were proved to fail for the right reason.

### The first person to open the live site found what eleven green checks had missed

- **325 authored items were rendering into an empty `<div>`.** The Reference view showed raw
  Markdown, and following that to the data found that the Glossary (**254 terms** across 10
  categories) and the Resource List (**71 links** across 14 groups) had never rendered at all.
  `shared-content.mjs` emits three document shapes — `doc` with `blocks`, `glossary` with
  `terms`, `resources` with `groups` — and `Shared.jsx` mapped `active.blocks` unconditionally.
  For two of the three kinds that is `undefined`, so the component drew nothing. The tabs
  worked, the titles appeared, and the body was blank.
- **This is the fourth instance of one shape**, and the pattern is now unmistakable: *correct
  source, wrong screen, and every test green*. The unstyled layout (40 CSS classes with no rule),
  the Tools library reporting "0 tools" while 433 rows existed, 40 tool cards linking to
  `href="—"`, and now 325 invisible items. Every check verified the **data**; the defect was
  always in the path from data to screen. Which is why "open the site and click through all four
  views" is now the highest-yield check in this repository, and why a component test layer and a
  browser-driven audit were added.

### An accessibility audit, and the four bugs in the audit itself

- **Added `audit-a11y.mjs`** as the 13th check: 44 assertions across all four views, driving Edge
  over raw CDP with no new dependency. It found three real defects immediately — a skip link that
  set the hash and scrolled but left focus on `<body>`, and two placeholders at 3.27:1 because
  `::placeholder` was styled for one input and not the other. All three fixed and measured.
- **The harness was harder to get right than the assertions.** `[tabindex]` matched at any value,
  so the correct `tabindex="-1"` fix made the audit report a fake failure in four views. The
  audit leaked Edge process trees, so a later connection hung and Node blamed a line number that
  moved between runs — 26 orphaned processes accumulated. `send()` had no deadline, so a dead
  socket hung forever. And the skip-link probe read a CSS transition frozen at `currentTime: 0`
  and called the link invisible; neither a 400ms sleep nor awaiting `finished` helped.
- **A baseline that outlives its defect.** Fixing the three defects made `--baseline` exit 1 with
  no explanation, because the recorded entries could no longer match. Replaced with `--strict`
  now that there is nothing to baseline, and documented in `WORKFLOW.md`.

### Guards that stated a rule they did not enforce

- **Quiz `energy` is now required.** A quiz heading written without `energy:` built cleanly and
  shipped as `null`. The check read `if (energy && …)` — it validated an energy that was
  *present* and said nothing about one that was *absent*. A missing energy is worse than an
  invalid one: the time-budget picker selects by energy, so a `null` question is simply never
  offered. Silent exclusion, not loud failure.
- **All 14 phase sections are enforced, in order.** `AGENTS.md` claimed "a guard checks
  ordering positionally". Nothing compared section order to anything, and
  `## Specific topics to learn` and `## Common Pitfalls` were in no guard list at all — so
  renaming one to `## CommonPitfalls` passed every check. An unrecognised `##` heading is not
  a parser error; it is silently absorbed as body text. The build now reports a **near-miss**
  as a spelling problem ("spelled X, contract requires Y") rather than a bare "missing",
  because a typo and an omission need different fixes.
- **A guard's own docstring was false.** `audit-quiz.mjs` opened by claiming it checks "a valid
  energy". The string `energy` appeared in that file exactly once — in that comment.

### Defects found by rendering the app rather than by any check

- **The site was rendering completely unstyled.** `global.css` was 3634 lines and styled 344
  classes but was missing **every top-level layout class**: `.main`, `.topbar`, `.skip`,
  `.footer`, `.phasegrid`, `.statgrid`, `.toolgrid`, `.breadcrumb` and ~33 more. The topbar
  collapsed into a raw row, the stat block drew as a vertical list, cards stacked full-width.
  **Every content check stayed green**, because a missing CSS rule changes no text and breaks
  no JSON field. Root cause: the stylesheet was written against a different DOM shape — it
  defines `.app-shell` and hyphenated `.phase-grid`/`.stat-grid`, while the components render
  `.phasegrid`/`.statgrid` and no shell at all.
- **The Tools library never worked.** It rendered *"0 tools across 10 written tracks"* while
  the corpus held 433 tool rows. It read the **light** projection, whose phases carry the
  *ids* of their checklist/tasks/quiz and deliberately no tools, so `phase.tools` was
  `undefined` and `|| []` made it an empty list.
- **40 tool cards linked to nowhere.** The hand-authored tables use an em dash for "no URL",
  and that dash was passed through as data — so `tool.url` was the literal string `"—"`, which
  a `tool.url &&` guard accepts as truthy. Placeholder dashes are now normalised at the parse
  boundary.
- **A malformed CSS declaration** (`color: var(--text);g-subtle);`) survived a build and a
  guard run, because a malformed declaration is not a missing class.

### Guards added

Five offline checks became **eleven**, with **315 unit-test assertions**.

| Guard | Catches |
|---|---|
| `audit-css.mjs` | a class used in JSX with no CSS rule; an undefined token |
| `audit-projections.mjs` | a component reading a field absent from the projection it imports |
| `test-render-inline.mjs` | 38 assertions on inline markdown (incl. all 195 authored strings) |
| `test-quiz.mjs` | 58 assertions, incl. all 549 questions |
| `test-lesson-blocks.mjs` | 39 assertions on renderer coverage |
| `test-search.mjs` | 180 assertions over 6,007 real search hits |

Every new test was **proved capable of failing** by deliberate mutation (dropping a `case` from
`LessonBlock.jsx`, no-op'ing `maskCodeSpans`, breaking 1-based quiz numbering, flipping the
search ranking, adding `phase.tools` to `PhaseCard.jsx`), then restored byte-identical.

No test framework and no new dependency: JSX is transformed in memory with **esbuild** (already
on disk as a Vite dependency) and rendered via `react-dom/server`.

### The encoding guard was checking less than it appeared to

Coverage was decided by file **extension**, so `.gitignore`, `.editorconfig` and
`.github/workflows/*.yml` were never opened. A stray CR reached `.gitignore` and **git itself
warned on push** while the guard reported "all clean" — because it had never read the file.
Files scanned: 190 → 205.

This is the **third** instance of the same lesson: a guard's blind spot is exactly as wide as
the selector it uses to find its input.

### Documentation

- `SETUP.md`, `TROUBLESHOOTING.md` — the silent traps: the stale generated bundle, the
  `VITE_BASE` blank page, the IPv6 `localhost` binding, the write-API encoding trap, and the
  console-mojibake false alarm.
- Corrected stale claims in `README.md` ("gaps" that were already closed), `AGENTS.md`
  (two false statements about what the build enforces), `HANDOVER.md` (§6 and §13 describing
  work as owed that was done) and `DECISIONS.md` D-008 (said four dead hooks; it is two).

### Deploy

- `.github/workflows/pages.yml` and `ci.yml`. Both green on first run. Live at
  **https://markkramm.github.io/vibecoding/**. The integrity gate runs **before** any install
  step, so a broken content file fails fast.

---

## Earlier — the curriculum

- **65 phases across 10 tracks**, **24,035 lines** across 90 authored Markdown files in the
  current corpus (22,246 in the 65 phase files; the remaining lines are in overviews, checklists,
  and shared reference documents), 549 quiz questions, 891 practice tasks, 1,054 checklist items.
- Tracks: Foundations (8), Model Internals (6), Prompting (7), RAG (7), Agents (7),
  Fine-tuning (6), Cost & Efficiency (7), Vibecoding Craft (8), Safety & Career (5),
  Career & Getting Hired (4), plus shared reference documents.
- Every phase follows a **14-section contract**, machine-verified: fixed section order and
  spelling, authored stable ids (`band`/`energy`), exactly four quiz options with exactly one
  correct, spread answer positions, and a `**Why:**` line.
- Content guards: `build-content.mjs --check`, `audit-quiz.mjs`, `audit-lesson-ast.mjs`
  (0 character loss), `audit-arithmetic.mjs`, `audit-shapes.mjs`, `test-cost-tone.mjs`.
- Provider URLs migrated: `platform.openai.com` 43→1, `docs.claude.com` 21→0.

---

## A note on how this changelog is written

Entries describe **what was wrong**, not just what was added, because most of the interesting
work here was finding that something already believed to be working was not. Three separate
guards were described as enforcing rules they did not enforce, and the site shipped a
completely unstyled page with a fully green test suite.

`HANDOVER.md` §12 carries the full list of mistakes made along the way, deliberately. A project
that teaches verification should be candid about its own.
