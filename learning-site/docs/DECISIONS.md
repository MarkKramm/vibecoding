# DECISIONS

A numbered log of the decisions that shaped this site, with the reasoning and the
cost of each.

This file did not exist before the four documents in `learning-site/docs/` were
written, but **the numbering is not invented here**: `src/` already cites
`docs/DECISIONS.md → D-006`, `D-011`, `D-016`, `D-019`, `D-020`, `D-021` and
`D-044` in fifteen files. Those ids were referenced from the React source, from
`global.css`, and from comments in several modules, with no file behind them. This
document is now that file, and the pre-existing ids keep the meaning the source
comments give them. Do not renumber. If you add a decision, take the next free id.

Each entry states **the decision**, **why**, and **what it costs**. The cost
matters as much as the rationale: a decision log that only records benefits is a
sales brochure, and the next maintainer needs to know what they are buying back
if they change their mind.

---

## D-001 — No router; view state is a string in `useState`

**Decision.** `App.jsx` holds the current view as `useState("dashboard")` and
switches between five components. No react-router, no hash routing, no history
API. Navigation funnels through one function, `openPhase(trackId, phaseId, anchor)`.

**Why.** Five views, no nested routes, and no URLs a reader needs to bookmark or
share. A router would add a dependency, a `basename` that has to track Vite’s
`base` for GitHub Pages subdirectory hosting, and a class of “blank page on hard
refresh” bug that appears only once deployed — in exchange for nothing the reader
uses. Deep-linking into a phase is the one genuinely useful thing a router would
provide, and it is handled explicitly: dashboard cards, search results, tools
provenance links and prev/next controls all call `openPhase`, so none of them can
drift from the others. `openPhase` also resolves a missing track id by scanning
the light index for the phase, which is what lets a search hit carry a phase id
and nothing else.

**Cost.** A hard refresh always returns to the dashboard. No phase is shareable
as a link. If the site ever gains accounts or sharing, this is the first thing to
revisit — and the single navigation entry point is exactly where a router would
be introduced.
---

## D-002 — The light index: two projections of one parse

**Decision.** The build emits the curriculum twice: `index.json` (~72 KB) with
light phase metadata and the **IDs** of checklist/task/quiz items, imported
eagerly; and per-track files (~1,304 KB across six) with everything a phase page
renders, imported lazily via `import.meta.glob` with `eager: false`.

**Why.** The dashboard draws ten track sections and 42 phase cards, and a card
needs a title, a duration, a goal and a count. Before the split, the shell
imported the full track files to draw that, pulling 1.3 MB of curriculum prose
into the entry chunk. The entry chunk measured **1,639 KB (501 KB gzipped)**. After
the split it measures **303 KB (85.6 KB gzipped)** — a **5.1× reduction** — and
first paint no longer waits on content the reader has not asked for. The light
index carries IDs rather than checklist objects for the same reason it exists:
`countDoneIds()` needs to know which items exist and whether each is ticked, and
does not need their wording to do that.

**Cost.** A state machine. A phase render must now distinguish *loading*, *ready*,
*empty* and *error*, and those states are visible in the UI. It also imposes a
rule that is easy to break by accident: anything reading phase prose must sit
behind a lazy loader. ToolsLibrary manages this by reading `tools` off the light
index. And a stale generated directory is now a live hazard — the two projections
are emitted in one pass from one parse, so they cannot disagree, but only if the
build actually runs.

---

## D-003 — Quiz normalisation at the data boundary, not in components

**Decision.** `normaliseQuestion` in `src/data/roadmaps.js` converts
`{ options: string[], answerIndex, why }` into
`{ options: [{ text, correct }], explanation }`, applied once inside
`loadTrackPhases`. No component ever sees the authoring shape.

**Why.** The ported components and the tested `lib/quiz.js` were written against
the object-option shape. Three places could absorb the difference.
`build-content.mjs` would put renderer concerns into the content pipeline and
change the artifact every audit reads. `Quiz.jsx` plus `lib/quiz.js` would mean
two files, one of them a tested pure module, and a data-format migration is
exactly how the half nobody re-tested breaks. The data boundary is one function,
applied once, and it keeps every ported component byte-identical to its original —
so a diff against the sibling project stays clean and an upstream fix can be
copied across without re-resolving a fork. It is also the principle the curriculum
itself teaches about tool results: normalise at the edge, keep the interior in one
shape.

**Cost.** The shape the build emits and the shape the components read are now
different, and that difference is documented in exactly one place. A reader of
`foundations.json` who greps the components for `answerIndex` finds nothing; a
reader of `Quiz.jsx` who greps the generated JSON for `explanation` finds nothing.
`verify-quiz-correctness.mjs` exists specifically because this seam is the one
place in the app where a silent error teaches something false.

---

## D-004 — Reuse the sibling project’s components verbatim

**Decision.** The React components, hooks and styles were ported almost unchanged
from `CS Roadmap`. Where the data shape differed, the **data** was adapted rather
than the component, and where a field is identical the component is untouched.

**Why.** The sibling project’s architecture was already proven — the same
Markdown → build → JSON → React pipeline, the same quiz and progress semantics,
the same local-first storage model. Rewriting working components to suit a new
curriculum would have meant re-finding bugs that had already been found, and every
divergence would make copying a future upstream fix harder. Keeping components
byte-identical is what makes a `git diff` against the sibling meaningful — and it
is the whole reason the quiz adapter sits in the data layer (D-003) rather than
inside the component that consumes it.

**Cost.** The site carries real dead weight. A migration script identified four
distinct forms of the old namespace, and something similar is true of the
components: `src/hooks/useApplications.js`, `useCertifications.js`,
`usePortfolio.js` and `useSchedule.js` keep their storage keys and are registered
in `lib/transfer.js`, but no view renders them since the career pages were not
ported (D-008). The same is true of `src/lib/review.js`, `today.js`,
`pathOrder.js` and `yourWork.js`: `today.js` is still imported for its `BANDS`
labels, but `review.js`, `pathOrder.js` and `yourWork.js` have no importers at
all. They are kept because they are tested pure modules and because the career
material may yet return. The honest framing is that **“ported verbatim” means
“ported including the parts this curriculum does not use”**, so a future cleanup
should start by listing importers rather than by assuming everything in `src/lib/`
is live. Note also the corollary for the no-shame rules: D-019, D-020 and D-021
are cited from `review.js`, `yourWork.js` and `global.css`, so deleting the
unimported modules would not delete the principles — but it would delete the code
comments that carry them into the future.

---

## D-005 — Rename the `cs-roadmap` localStorage namespace to `vibecoding`

**Decision.** Every storage key, format tag and exported filename moved from the
`cs-roadmap` prefix to `vibecoding`. Done in one pass by
`learning-site/scripts/rename-namespace.mjs`, with a bare `/cs-roadmap/` regex
deliberately avoided.

**Why this is not cosmetic.** `localStorage` is scoped per **origin**, not per
path. Both sites are served from `localhost:5173` during development — which is
exactly what happens when you alternate between them — so they share one storage
area. Every key collides: ticking a checklist item in one site ticks it in the
other, notes merge, and quiz answers from two different curricula interleave. The
prefix is the only thing keeping them apart.

The rename had to catch five forms, not the three that were obvious at first:
`cs-roadmap:` (storage keys), `cs-roadmap-backup` (export format tag),
`cs-roadmap-phase` (per-phase export), the `^cs-roadmap:` regex literal inside
`transfer.js` that strips the prefix back off, and — missed on the first pass —
the phase filename built by plain string concatenation, `"cs-roadmap-" + phase.id`,
which has no `:` and no trailing keyword for the other rules to match. Without
that fifth rule, downloaded phase files were named `cs-roadmap-*.json` while the
export tag had already moved to `vibecoding-backup`, an inconsistency that only
surfaces when a reader tries to re-import a phase they exported. The regexes
require a `:` or `-` after the prefix specifically so they cannot rewrite the
explanatory comments that legitimately refer to the sibling project by name.

**Cost.** Old bookmarks of exported files use the old tag, and a reader who
exported a backup from the sibling project cannot import it here. That is the
intended outcome — those two sets of progress are not the same progress — but it
is a real discontinuity rather than a tidy rename, and the code that would refuse
the old file should say why rather than reporting generic malformed JSON.

---

## D-006 — Local-first, single-user, no server

**Decision.** Everything the reader produces lives in `localStorage` under the
`vibecoding:` namespace, one key per hook. There is no account, no upload, and no
network call anywhere in the application.

**Why.** The site is written for one reader on a $0 budget. A backend would mean
hosting costs, authentication, a privacy surface for the reader’s personal notes
and job applications, and an availability dependency — all to sync one person’s
own data between browsers they mostly do not use. Static files on GitHub Pages
cost nothing and cannot go down.

**Cost.** Clearing a browser profile, changing laptops or reinstalling destroys
months of work on a curriculum that runs tens of weeks, and nothing in the UI
would have said so. That is what D-016 exists to answer. The deeper cost is that
“which browser did I use” becomes a real question, and there is no recovery path
that does not depend on the reader having exported a backup.

---

## D-008 — The sibling’s six career-specific views are not ported

**Decision.** `Schedule`, `Applications`, `Certifications`, `Portfolio`,
`YourWork` and `PathOrder` are not views in this site. Four corresponding hooks
and four pure modules were still ported and remain in the tree.

**Why.** The sibling curriculum ends in a job hunt with deadlines attached: a
schedule to keep, applications to track, certifications to price, a portfolio to
assemble. This curriculum has no deadline — the reader is building a skill — and
the useful landing view is “what exists, what is finished, what is next” rather
than “what is due”. That is why the dashboard is a map rather than a to-do list,
and why
`Dashboard.jsx` deliberately shows the four unwritten tracks rather than hiding
them. Porting those six views would have added surface area that nothing in the
content refers to. The career material lives in the Career track’s own phases,
which is where it belongs.

**Cost.** The site carries hooks, storage keys, transfer registrations and three
unimported pure modules for features no reader can reach. A reader who inspects
`lib/transfer.js` sees `vibecoding:applications:v1` and
`vibecoding:certifications:v1` in the backup and reasonably concludes the UI is
broken. That is a documentation problem more than a code problem, but it is a real
one: the decision log is the only place that explains it. Removing the dead code
would be a bigger job than it looks (the transfer `KEYS` list, the validators, the
tests) and would have to be redone if the career views return — so it is deferred
rather than resolved.

---

## D-011 — Persist reading position as a heading id, not a scroll offset

**Decision.** `vibecoding:reading:v1` records the last track, the last phase, and
per phase the last **heading id** the reader had on screen. Not a scroll offset,
not a word count, not a percentage.

**Why.** A lesson runs 5,000–24,000 words and takes weeks; opening a phase always
landing at the top means re-finding your place every session. A scroll offset is a
number with no meaning after a content edit — the paragraph above it changes
height and the offset now points somewhere else. A heading id is stable for the
same reason checklist ids are, and it survives regeneration. The phase offers to
jump back rather than doing so silently, because a reader who deliberately
scrolled to the top should not be yanked back down.

**Cost.** Section-level granularity only. A reader who stops mid-section resumes at
the top of that section, which for a long section is still a scroll. Tracking
finer would mean storing something content-derived again, and the whole point is
to store something that does not move.

---

## D-016 — Full backup as one JSON document, validated whole

**Decision.** `src/lib/transfer.js` reads every registered key into one JSON
document, and can read that document back. Import has two modes: **Merge** (union
what was finished, keep this machine’s reading position and preferences) and
**Replace** (overwrite every key). Every key is validated before anything is
written, and a payload with one bad key is rejected **whole** rather than
partially applied.

**Why.** The cost described in D-006 is data loss with no warning; this is the
answer to it. The
strictness is the important part: a backup is read back by a program, not a
person, so “close enough” is a corruption. A format that silently accepts a
malformed file and writes it over good data is worse than no backup at all —
especially for `vibecoding:quiz:v1`, where the value is an option **index** and an
imported `"2"` as a string would compare against an index and quietly mark a right
answer wrong. Refusing the file is louder and safer than importing answers that
misreport.

**Cost.** The import UI has to show the reader what is in the file before applying
it, which is why it is a modal and not two sidebar buttons — import is the only
action in the site that can destroy work. It also means the page **reloads** after
an import: every hook read its key once at mount and owns it in React state, and an
import writes `localStorage` underneath those live copies. Threading a refresh
signal through twelve hooks would be twelve chances to get it wrong; a reload is
one line that cannot be partially correct. The reader is not mid-task when they
click this — they are on a settings errand.

---

## D-019 — The reader’s own writing is stored, never scored, and keyed by id

**Decision.** `vibecoding:notes:v1` holds the reader’s notes and task answers,
keyed by phase id and authored task id. The notes are not counted, not surfaced on
the dashboard, not compared, and not included in any progress figure. Checklist
and task progress are keyed by **id**, never by position or text.

**Why.** Ticking a box and writing an answer are different acts, and neither
should be able to imply the other — that is why notes are a separate store with a
separate key rather than a field on progress. The id keying is what makes an edit
safe: inserting a task above another must not move a reader’s answer onto a
different task, and rewording a checklist item must not lose a tick. This is why
the build mints `taskIds` and warns loudly when it has to mint one from position —
a minted id can move. The `TaskList` answers and the `Quiz.jsx` answers follow the
same rule, which is why quiz answers are keyed by question id and store the chosen
**index** rather than the option text: storing the text would silently invalidate
every answer the moment a distractor was reworded.

**Cost.** Two stores to keep in step, and a reader can have a ticked checklist and
an empty answer box with no reconciliation between them. The styles are
deliberately quiet — a note box that shouts reads as a demand — which means the
feature is easy to miss entirely. A dashboard that showed “you have written
nothing” would fix the discoverability and break the rule, so the discoverability
problem is accepted.

---

## D-020 — The site does not grade the reader (the no-shame rule)

**Decision.** There is no percentage, no streak, no “N of M” for the reader’s own
work, and no ordering of anything by how well a phase went. The quiz summary names
the questions to revisit rather than a score. The review surface is a list of
*questions to look at again*, not a mark out of ten — a reader who got one
question wrong and a reader who got ten wrong see the same shape of page.

**Why.** The reader is a beginner studying alone, and the surrounding product is
free of completion language. A quiz that announces “3 out of 10” would be the one
place in the site that grades them. “Two to look at again” is actionable; “80%” is
not. The same reasoning shapes `Shared.jsx` and the reference documents, which are
deliberately flatter than a lesson page: no reading bar, no per-section controls,
nothing to tick, because reference material is looked up rather than completed.

**Cost.** This is a real constraint on features, not a stylistic preference. It is
why `today.js` cannot reorder the curriculum and why `useQuizAnswers.js` stores
the minimum needed for a revisit list — which option was picked, keyed by question
id — and deliberately stores no ratio and no history of a phase getting better or
worse. A future “add a score” request is a change to the product’s stance, not a
small feature, and should be argued as one.

---

## D-021 — Time is a coarse band, not minutes

**Decision.** Practice tasks carry a `band` of `quick | focused | deep | ongoing`
with human labels (“Under 30 minutes”, “30–90 minutes”, “90 minutes or more”), not
an estimated duration in minutes. Matching is rank-order: a task of rank R fits a
budget of rank B when R ≤ B. `ongoing` has no rank and is never offered by time.

**Why.** Bands are coarse on purpose. The band boundaries were chosen against the
distribution rather than picked round: the practice tasks cluster in the middle of
the range, so any precise cut inside that cluster is arbitrary, and only the two
outer edges separate structurally different kinds of work. `ongoing` exists as its
own band because it is not a longer task — it is a weekly habit, something gated
on time passing, or something the reader’s machine may not be able to do at all.
A slider would imply a precision nobody has.

**Cost.** A reader with 45 minutes cannot ask for “tasks between 30 and 60
minutes”, because that distinction was deliberately not encoded. A task that
really takes 25 minutes sits in the same band as one that takes 29. And the bands
are estimates that nobody re-measures: they were set once from the corpus and will
drift as phases are authored, so the UI says they are estimates rather than
implying otherwise.

---

## D-044 — Quiz answers are persisted; the result still is not

**Decision.** The reader’s chosen options are stored in `vibecoding:quiz:v1`,
keyed by question id. What is **not** stored: whether each answer was right, how
many were right, how many were answered, any ratio, and any history of a phase
getting better or worse.

**Why.** The quiz originally held its answers in `useState`, on the stated
reasoning that “a quiz is for the moment you take it, and persisting it would turn
a self-check into a permanent record of how you did.” That reasoning was sound and
the outcome was still wrong. Answering a set and navigating away discarded the only
evidence the reader had produced about what they did not yet understand — and the
most useful line the curriculum writes about a missed question is the `**Why:**`
explanation naming the misconception the distractor represents. Throwing that away
on every navigation left the quiz as something you perform rather than something
you learn from.

The conflict is resolved by **narrowing what is stored**, not by dropping the
objection. Persisting the picked option is enough to rebuild a revisit list, and
the review page therefore shows *what to look at again* — a statement about a pile
of paper — and never *how you did*, which would be the report card D-020 refuses.

**Cost.** The line between “enough to build a revisit list” and “a score” is a
maintenance burden, not a one-time judgement. Every future addition to the quiz
has to be checked against it: adding a per-question “times missed” counter, or a
phase-level improvement indicator, would reintroduce grading through the back door
while looking like a small UX improvement. Answers are also stored as indices, so
a backup carrying a string index is rejected rather than coerced (D-016) — safe,
but it means the storage format is coupled to the numeric comparison inside
`isCorrect`.

---

## D-045 — Tolerate a missing track file rather than erroring

**Decision.** A track with no authored phases emits **no file at all**, and
`loadTrackPhases()` returns `{ status: "empty", phases: [], error: null }` for it.
That is a normal state, not an error. `Dashboard.jsx` renders such a track as
`not yet written`.

**Why.** Four of the ten declared tracks (`finetuning`, `vibecoding`,
`safety-career`, `career`) have zero phases and will for some time — the
curriculum is being authored track by track, and a half-built track is the normal
case, not an exceptional one. Treating a missing file as a failure would mean the
site reported four errors on every load, which trains everyone to ignore the error
channel. The build says the same thing in the same spirit: a track with no phase
files produces a **stderr note**, not a build failure.

Keeping the empty tracks visible on the dashboard is the other half of the
decision. A curriculum that appears to have six tracks when ten are planned
misleads the reader about the size of what they are committing to, and showing the
gaps makes progress visible as phases land.

**Cost.** “Missing” and “empty” are now the same outcome, so a track file that
fails to be emitted because something is genuinely wrong looks exactly like a
track that has not been written yet. The distinguishing evidence lives in the
build log, not in the UI. There is also a silent-narrowing hazard in the tests:
`verify-deep.mjs` skips tracks with no cards, so if a written track regressed to
zero phases, the deep pass would quietly check six tracks instead of failing.

---

## D-046 — A malformed quiz question fails toward “no answer is correct”

**Decision.** `normaliseQuestion` uses `answerIndex` as the only source of truth
for correctness. A question whose `answerIndex` is missing or out of range yields
options that are **all** `correct: false`. The `correctIndex` helper in
`lib/quiz.js` returns
`-1` for a malformed question for the same reason. The option **text** is never
inspected to guess which answer is right.

**Why.** Two failure modes are being refused at once. Inspecting text is the first:
a phase whose distractor happened to contain the word “correct” would be able to
mark itself right, which is why `lib/quiz.js` reads `o.correct === true` strictly.
The second is the direction of failure. A quiz that marks a distractor correct
teaches something false, while a quiz that marks nothing correct shows the reader
the explanation without asserting an answer — the reader still learns, and they
are not misled. `Quiz.jsx` was written to be forgiving rather than validating for
the same reason: it never throws and never rejects a question, because both
fallbacks already render sensibly.

**Cost.** A malformed question fails **silently** in the UI. The reader sees a
question, answers it, and is told nothing they picked was right — which looks like
a broken quiz rather than a content defect. Nothing about the rendered page says
“this question has no answer key”. The defence is upstream and must stay there:
the build guard requires exactly one `[x]` per question in the Markdown, and
`audit-shapes.mjs` independently checks that `answerIndex` is a number within
range and that `why` is non-empty. The runtime stays tolerant because the build is
strict.

---

## D-047 — `topics` and `resources` are objects, and the audit exists because of it

**Decision.** `topics` is an array of `{ heading, items: string[] }` groups and
`resources` is an array of `{ name, url }` objects — not arrays of strings.
`PhaseDetail.jsx` nonetheless tolerates a plain-string element in both fields,
rendering it rather than throwing. `scripts/audit-shapes.mjs` asserts the element
type of every list-shaped phase field, and the nested key set of every object
field.

**Why.** This is not a theoretical concern; it is a defect that shipped. Passing
an object where the renderer expects a string throws
`Objects are not valid as a React child` at **render** time, and the build guard
(`build-content.mjs --check`) stayed green throughout, because it validates the
**Markdown** and has no knowledge of what the components assume. `vite build`
compiled the component perfectly happily. **Only the browser test found it**,
because `verify-site.mjs` is the one instrument in the suite that collects
`Runtime.exceptionThrown` — and without that listener, a blank page and a working
page produce the same set of passing assertions. The tolerant fallback in
`PhaseDetail.jsx` is the second line of defence: an older generated file, or a
phase authored under the previous shape, renders instead of taking the page down.

**Cost.** The tolerant fallback means a genuinely wrong shape degrades quietly to a
one-item list instead of failing loudly — so the audit, not the component, has to
be the thing that catches it, and the audit only knows the fields in its
`CONTRACT` map. **Adding a phase field means adding it to `CONTRACT` in the same
commit.** The broader lesson is recorded in VERIFICATION.md §8: a green guard is
not proof the guard checks that thing, and no guard here should ever be edited to
agree with the code.
