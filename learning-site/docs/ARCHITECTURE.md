# ARCHITECTURE

How the learning site is put together, and why each structural choice was made.

This document is written for someone maintaining the site months from now, who
remembers the code but not the reasoning. Nearly every decision here has a
measurable cost attached, and the cost is stated rather than hidden.

---

## 1. The pipeline: Markdown is the source of truth, JSON is a build artifact

The curriculum is authored as Markdown in `ai-roadmaps/`, one folder per track,
one file per phase. That Markdown never reaches the browser. It is compiled, in a
single pass, into JSON that the React site reads.

```
ai-roadmaps/<track>/<NN>-phase-*.md
        │
        │  scripts/build-content.mjs
        │  (parses front-matter, extracts the required sections,
        │   hands the lesson body to scripts/lesson-ast.mjs)
        ▼
learning-site/src/data/generated/
        ├── index.json              ~72 KB    light phase metadata, eager
        ├── <track>.json            ~1,304 KB across six files, lazy
        ├── lessons/<phase>.json    ~1,206 KB across 42 files, lazy
        ├── search.json             ~288 KB   inverted index, lazy
        ├── shared.json             ~25 KB    glossary + strategy docs, lazy
        └── tracks.json             ~2 KB     track list
```

`npm run dev` and `npm run build` both run the content build first, so the site
can never be served from a stale bundle that does not correspond to the Markdown
on disk. The generated directory is **git-ignored** (see `.gitignore`), which
means a fresh clone has no JSON at all: the first thing anyone must do is run the
build. That is deliberate. Committing the JSON would put a ~2.8 MB generated diff
in every content commit and would let a stale bundle be committed by accident,
and the source of truth would stop being obvious.

`src/data/roadmaps.js` says this in its own header, and it is worth repeating:
the Markdown is truth, the JSON is derived, and nothing in the app should ever be
edited to compensate for what the JSON says.

---

## 2. The two-projection data model

The single most consequential decision in the site. The build emits the same
curriculum twice, from one parse, at two different levels of detail.

**Projection A — the light index (`index.json`, ~72 KB, eager).** Per phase:
`id`, `order`, `phase`, `title`, `duration`, `durationWeeks`, `goal`,
`lessonWordCount`, and — this is the important part — the **IDs** of its
checklist items, practice tasks and quiz questions, never their text. It is a
static `import` in `src/data/roadmaps.js`, so it lands in the entry chunk.

**Projection B — the full track files (`~1,304 KB` across six files, lazy).**
Everything a *phase page* renders: tool purposes and cost strings, resource
links, practice-task prose, quiz questions with their options, answers and
`why` explanations, free-versus-paid paragraphs. Loaded by
`loadTrackPhases()` in `src/data/roadmaps.js` through
`import.meta.glob("./generated/*.json")` with the default `eager: false`, so
each track is a dynamic import fetched only when a reader opens one of its
phases.

**Projection C — the lesson bodies (`~1,206 KB` across 42 files, lazy).** The
typed block AST for one phase, loaded by `src/hooks/useLesson.js` from
`import.meta.glob("../data/generated/lessons/*.json")`. Same principle, one step
further down.

Measured on disk today, the light index is **18.2× smaller** than the six track
files it summarises.

### Why the light index exists

The dashboard draws ten track sections, each with a heading, a blurb, a progress
bar and a grid of phase cards. A phase card renders a title, a duration, a goal
and a checklist count. Before the split, the shell imported the full track files
to draw that dashboard, which pulled all 1.3 MB of curriculum prose into the
entry chunk. The entry JS chunk measured **1,639 KB (501 KB gzipped)**.

After the split — light index eager, track files and lesson bodies lazy — the
entry chunk measures **303 KB (85.6 KB gzipped)**. That is a **5.1× reduction**,
and it is the difference between a first paint that happens and one that a reader
on a slow connection abandons.

The reason the light index carries *IDs* rather than full checklist objects is
the same reason it exists at all. `Dashboard.jsx` counts progress with
`countDoneIds(done, p.checklistIds)` — it needs to know which items exist and
whether each is ticked, and it does not need their wording to do that. Carrying
the text would have added words that no code path on the dashboard reads.
`src/hooks/useProgress.js` keeps both `countDone` (objects, used by the ported
phase components) and `countDoneIds` (IDs, used by the dashboard) for exactly
this reason: the ported components stay byte-identical to their originals.

### What the split costs

It costs a state machine. A dashboard render is now synchronous and always
complete, but a phase render has to distinguish *loading*, *ready*, *empty* and
*error*, and those states are visible in the UI. `usePhaseDetail.js` handles the
track file, `useLesson.js` handles the lesson body, and `App.jsx` renders a
placeholder header from the light index while the phase body is in flight — so
the reader sees the phase title immediately and the lesson a moment later, rather
than a blank page or a spinner with no context.

It also costs a rule that is easy to violate by accident: **anything that reads
phase prose must be behind one of the lazy loaders.** ToolsLibrary manages this by
reading `tools` off the light index: the build puts the full `tools` array on each
light phase record (it is small relative to prose), which is what lets the tools
page build without loading a single track file.

---

## 3. Why there is no router

`App.jsx` holds the current view in a `useState` string. There is no
react-router, no hash routing, and no history API.

The app has five views and no nested routes. A router would add a dependency, a
`basename` that has to be kept in step with Vite's `base` for GitHub Pages
subdirectory hosting, and a class of "blank page on hard refresh" bug that only
appears once deployed — in exchange for something no reader needs, because there
are no URLs to bookmark or share.

The one genuinely useful thing a router would provide is deep-linking into a
phase. That is handled explicitly instead: `openPhase` in `App.jsx` is the single
entry point for navigation, so dashboard cards, search results, the tools
library’s provenance links and the prev/next controls all arrive through one
function and cannot drift apart. `openPhase` also resolves a missing track id by
scanning the light index for the phase, which is what lets a search hit carry a
phase id and nothing else.

**The cost:** a hard refresh always returns the reader to the dashboard, and no
phase is shareable as a link. For a single-reader site with no accounts, that is
a trade worth making; for a site with any sharing requirement it would not be.
A reader who wants to resume sees the dashboard’s “Last opened” link instead,
which is a better answer to that need than a URL in a history list.

---

## 4. The views

Five components in `src/pages/`, selected by the `view` state in `App.jsx`.
Four of them appear in the top navigation; `phase` is reached by opening a card.

**Dashboard** (`Dashboard.jsx`) is a map, not a to-do list. It shows the corpus
totals counted from the light index, an "in progress" section when the reader has
ticked anything, and all ten track sections — including the four that are still
being authored, rendered as `not yet written` rather than hidden. A curriculum
that appears to have six tracks when ten are planned misleads the reader about
the size of what they are committing to.

**PhaseDetail** (`PhaseDetail.jsx`) is one phase in full, and its section order
is the pedagogy: lesson, then tools, then resources, then practice, then
deliverable, then checklist, then quiz, then exit criteria, then free-versus-paid.
The quiz is deliberately last. Put first it tests what the reader already knew;
put last, after the lesson and the tasks, it tests what the phase taught.

**ToolsLibrary** (`ToolsLibrary.jsx`) is every tool named anywhere in the
curriculum, de-duplicated by lower-cased name, with its cost badge and its free
alternative, filterable by tone and by substring. Read across phases it answers a
question no single phase can: *what do I actually need to install, and what does
it cost me?* The Cost track argues a zero-budget learner can complete this whole
curriculum; this page is where that claim is auditable.

**Search** (`Search.jsx`) is the interface over `search.json` and
`src/hooks/useSearch.js`. Results are attributed to a **heading**, not a line,
and carry the heading's anchor so `PhaseDetail` can scroll straight to it. Two
behaviours exist specifically so search cannot lie: terms too common to narrow
anything are reported as ignored rather than silently dropped, and terms with no
postings at all are reported as missing rather than quietly discarded.

**Shared** (`Shared.jsx`) is the cross-track reference view — the glossary and the
strategy documents. They live outside any track because they are read the other
way round: a lesson is read start to finish, a glossary entry is looked up
mid-sentence. It renders the same block AST a lesson does, through the same
`LessonBlock` component, so a glossary cannot drift away from the lesson format. The authored glossary
is not written yet, so today the view shows two documents and says so honestly
rather than pretending the reference set is complete.

---

## 5. The quiz-shape adaptation at the data boundary

The quiz is the one place where the shape of the data the site *emits* differs
from the shape the ported components *expect*.

```
CS Roadmap (components written against):
    { options: [{ text, correct: boolean }, ...], explanation }

This curriculum (build emits):
    { options: ["...", "..."], answerIndex: number, why }
```

Everything else matches field for field. `normaliseQuestion` in
`src/data/roadmaps.js` folds the second shape into the first, once, as data is
loaded — and it is applied in `loadTrackPhases`, so nothing downstream ever sees
the authoring shape.

Three places could have absorbed the difference, and the choice matters:

- **In `build-content.mjs`.** Rejected: it would change the artifact that
  `audit-quiz.mjs`, the AST audit and every future consumer read. Changing the
  build to suit one renderer puts renderer concerns into the content pipeline.
- **In `Quiz.jsx` and `lib/quiz.js`.** Rejected: two files, and `lib/quiz.js` is
  a tested pure module whose logic is written against `options[].correct`. It is
  also where a data-format migration would silently break the half nobody
  re-tested.
- **Here.** One function, applied once, at the boundary. Every ported component
  and the tested quiz module stay byte-identical to their originals, so a diff
  against the sibling project stays clean and an upstream fix can be copied
  across without re-resolving a fork.

It also happens to be the principle the curriculum itself teaches in its Phase 2
material on tool results: **normalise at the edge, keep the interior in one
shape.**

Two properties of the adapter are load-bearing rather than incidental.
`answerIndex` is the *only* source of truth for correctness — the option **text**
is never inspected, because a phase whose distractor happened to contain the word
"correct" would otherwise be able to mark itself right; `lib/quiz.js` reads
`o.correct === true` strictly for the same reason. And a malformed question
(missing or out-of-range `answerIndex`) yields options that are **all incorrect**,
so the reader sees the explanation without being told a wrong answer was right.
Failing toward "no answer is correct" is the safe direction: a quiz that silently
marks a distractor correct teaches something false.

---

## 6. State, and where it lives

There is no state library and no server. Every piece of reader state is a
`localStorage` key under the `vibecoding:` namespace, owned by one hook, read
once at mount and then held in React state.

| Key | Owner | Content |
| --- | --- | --- |
| `vibecoding:progress:v1` | `useProgress` | map of checklist/task id → `true` |
| `vibecoding:lesson-sections:v1` | `useLessonProgress` | map of `phaseId#sectionId` → `true` |
| `vibecoding:reading:v1` | `useReadingState` | last track/phase, and last heading per phase |
| `vibecoding:notes:v1` | `useNotes` | map of phaseId → `{ note, answers }` |
| `vibecoding:quiz:v1` | `useQuizAnswers` | map of questionId → chosen option index |
| `vibecoding:energy-mode:v1` | `useEnergyMode` | `low \| normal \| high` |
| `vibecoding:reading-size:v1` | `useReadingSize` | `s \| m \| l \| xl` |
| `vibecoding:time-budget:v1` | `useTimeBudget` | `quick \| focused \| deep` |
| `vibecoding:portfolio:v1` | `usePortfolio` | portfolio entries |
| `vibecoding:applications:v1` | `useApplications` | application entries |
| `vibecoding:certifications:v1` | `useCertifications` | certification entries |
| `vibecoding:schedule:v1` | `useSchedule` | map of trackId → start date |

`src/lib/transfer.js` holds the authoritative `KEYS` list with a validator per
key, and it is the reason the table above is not just documentation: adding a new
storage key without adding it there means it will not be backed up. The export
walks the list, validates every value, and refuses a payload whole if any single
key is malformed rather than partially applying it.

Storage failures are absorbed rather than surfaced everywhere it makes sense —
`useProgress` and friends catch a quota or availability error and carry on for
the session — because losing persistence is annoying, while a thrown error on
every keystroke would make the site unusable. The two exceptions are the import
path (a malformed backup is *rejected loudly*, because it is about to overwrite
the reader's work) and the phase loader (a failed load is *shown*, because a
phase page that silently renders nothing is indistinguishable from a phase that
has no content).

---

## 7. Import and export

The reader owns everything they have produced, and it lives only in one browser
profile. `DataTransfer.jsx` is the modal over `lib/transfer.js`: one JSON
document covering every registered key, with two import modes that are
deliberately not symmetrical. **Merge** unions what the reader finished and keeps
this machine's reading position and preferences; **Replace** overwrites every
registered key and is the restore-onto-a-clean-machine action. The panel lists
the file's contents key by key before it will apply anything, because import is
the only action in the site that can destroy work.

The page reloads after an import. Every hook read its key once at mount and then
owns it in React state; an import writes `localStorage` underneath those live
copies. Threading a "re-read now" signal through twelve hooks would be twelve
chances to get it wrong, and a reload is one line that cannot be partially
correct.

---

## 8. Untested claim in the verified numbers

Measured on this machine with `gzip -9`, `dist/assets/index-*.js` is **295.9 KB
raw / 83.8 KB gzipped**. The verified figures quoted throughout these documents
are **303 KB / 85.6 KB**, which correspond to a 1000-byte KB and a default-level
gzip. Both describe the same file; the KB convention and gzip level differ. The
**5.1× ratio is what matters and is convention-independent** — it holds under
either measurement.
