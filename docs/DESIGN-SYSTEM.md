# DESIGN SYSTEM

The visual and interaction rules this site follows, and the reasoning behind each.

This document is referenced by name from twenty-odd comments in `learning-site/src/`,
`learning-site/src/styles/global.css` and `learning-site/src/styles/tokens.css`. Each of
those citations names a section below. Where a rule already carries its reasoning as a
comment in `global.css`, that reasoning is reproduced here rather than paraphrased — the
stylesheet and this document are meant to say the same thing.

The companion documents are `docs/DECISIONS.md` (why the product behaves as it does, by
id), `learning-site/docs/ARCHITECTURE.md` (how the site is put together) and
`docs/CONTENT-SCHEMA.md` (the contract between the Markdown curriculum and the site).

---

## Principles

The site is built for one beginner studying alone, on a $0 budget, building a skill over
34–112 weeks. That reader is the reason for every rule below.

### the no-shame rule

**The reader is never graded.** There is no percentage of the reader’s own work, no
streak, no “N of M”, no ordering of anything by how well a phase went. This is the
no-shame rule, D-020. It is a constraint on features, not a tone of voice: `lib/today.js`
cannot reorder the curriculum, `useQuizAnswers.js` stores the minimum needed to build a
revisit list and deliberately stores no ratio and no history of improvement, and the quiz
summary names the questions to look at again rather than a score.

`useCertifications.js`, `useNotes.js` and `lib/review.js` all cite this rule by name. It is
the reason a certification tracker has no hours-studied field and no “percentage ready”,
the reason the notes panel counts nothing, and the reason the review queue shows the
explanation and the reader’s own choice rather than a verdict.

**Progress is never conveyed by colour alone.** A number that matters is written as
digits somewhere on the page; colour is an accent on top of that text, never a
replacement for it. `.progress__fill` and `.ring__fill` are both backed by a visible
label.

**Nothing shouts.** A control that is a demand rather than an offer is styled quiet. The
notes panel is the clearest case: “a note box that shouts reads as a demand” (D-019), so
it is collapsed by default and muted in weight.

**No fake affordances.** If a thing looks clickable, it is clickable and it does
something. There is exactly one deliberate exception, under Anti-patterns: the template
checkboxes drawn by `.tmpl-box` are spans, because they are part of a template the reader
is told to copy elsewhere.

**Motion is a readout, not a reward.** Transitions exist to keep a control from
appearing to jump, and nothing animates because the reader did well. There is one
`--transition-fast` token, at 120 ms, and the progress ring has no transition at all.

---

## Colour tokens

All colour lives in `learning-site/src/styles/tokens.css`. Semantic names only —
components never hard-code a hex value. The theme is **dark-first**: `--bg` is `#12141a`
and there is no light theme to switch to. The reader is doing multi-hour reading on a
dark surface, the print stylesheet already provides the paper variant by overriding the
tokens rather than rewriting each rule, and a second theme would be a second set of
contrast commitments to maintain for an audience of one.

| Token | Value | What it is for |
|---|---|---|
| `--bg` | `#12141a` | The page. Everything else is a panel on it. |
| `--bg-elevated` | `#1a1d26` | Cards, the sidebar, the modal panel, code-copy buttons. The first step up. |
| `--bg-subtle` | `#222634` | The second step: table headers, input fields, `.tool-card`, `.empty-state`, progress tracks, the `.kbd` chip. |
| `--border` | `#2e3346` | Every hairline: card edges, table rows, the left rule that separates a review question from its explanation. |
| `--text` | `#e6e9f0` | Body prose and headings. |
| `--text-muted` | `#9aa1b5` | Secondary prose, metadata, labels, the `.muted` class. Contrast-safe on `--bg`, `--bg-elevated` and `--bg-subtle`. |
| `--accent` | `#5b8cff` | Links, primary buttons, the focus outline, the active chip border, the reading-bar fill, the ring fill. |
| `--accent-hover` | `#7ba3ff` | Links and buttons under the cursor, and nothing else. |
| `--accent-soft` | `rgba(120, 160, 255, 0.28)` | Texture that must not compete with text: the in-lesson finder’s `<mark>` highlight. It exists as a real token because `global.css` consumed it as `var(--accent-soft, rgba(…))` for several revisions, so only the literal fallback was rendering and the token name was decorative. |
| `--success` | `#4ac48a` | Checklist and section completion, the `.check input` accent colour, `.progress__fill`, the `quick` band badge. |
| `--warning` | `#d9a441` | The `high` energy badge, the `deep` band badge, a due follow-up, the pace card’s left rule. Never an error state. |
| `--danger` | `#e0605e` | The quiz’s wrong-answer border and the unsupported-block border. A non-text boundary, where 3:1 is the applicable bar. |
| `--danger-text` | `#ec8a88` | `--danger` used as **text**. The base `--danger` is a 4.30:1 pairing on `--bg-subtle`, under the 4.5:1 AA floor for body-sized text; this lighter variant reaches 6.14:1 on `--bg-subtle` and 6.86:1 on `--bg-elevated`. |
| `--focus` | `#e6e9f0` | The colour of a focus ring. Separate from `--accent` because a ring sometimes has to sit on an accent-coloured surface, where an accent ring vanishes. |
| `--overlay` | `rgb(0 0 0 / 55%)` | The scrim behind a modal or the mobile drawer. It was a literal in two places that could have drifted apart. |
| `--text-on-accent` | `#0d1017` | Text sitting on an accent fill (primary buttons). This was the one genuine component-level hex bypass in `global.css`. |

**The contrast commitments, stated as rules.**

- Body text is `--text` or `--text-muted` on a surface token. Both clear 4.5:1 on all
  three surfaces.
- `--danger` may be used as a border or a fill, where the 3:1 non-text bar applies. For
  any text at body size, use `--danger-text`.
- A focus ring uses `--focus` or `--accent`, and it is an `outline` with an `outline-offset`,
  never a border-colour change on its own. `.search__input:focus-visible` carries the
  comment that matters here: the accent border tint is an **addition** to the ring, never
  a replacement for it. That rule used to carry `outline: none`, and because a
  two-class selector outranks the global `:focus-visible`, it removed the keyboard ring
  from a `type="search"` input. A 1px border colour change is not a focus affordance.
- Colour is never the sole carrier of meaning. See “Progress is never conveyed by colour
  alone” above, and the quiz, whose correct option carries a “Correct” label and whose
  wrong pick carries “Your answer”, so the distinction survives greyscale printing and
  colour blindness.

---

## Typography and the reading-size scale

**Type scale.** `--text-xs: 12px`, `--text-sm: 14px`, `--text-base: 16px`, `--text-lg: 18px`,
`--text-xl: 20px`, `--text-2xl: 24px`, `--text-3xl: 30px`. Body is `--text-base` at
`line-height: 1.5`; headings are `1.25`. Prose paragraphs and list items in the lesson
body run at `1.6`.

**Font stack.** `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. Monospace is
`ui-monospace, SFMono-Regular, Consolas, monospace`, read through `var(--font-mono, …)` so
a future `--font-mono` token would take over without touching a call site.

**Measure.** Prose is capped at `--content-reading` (760px). A 1,100px line of text is
hard to track. Tables are the one element exempt, because a six-column comparison cannot
be squeezed into 760px; they get `--content-wide` (1,100px) with their own horizontal
scroll container.

### The reading-size scale

A lesson runs roughly 2,500–4,500 words and the longest reach ~24,000, which is several
hours of continuous reading. A 16px system default is not right for everyone at that
length, so reading size is a first-class feature rather than an accessibility
afterthought. `src/hooks/useReadingSize.js` owns it:

- `SIZES` is four steps, not a slider: `s` (0.92), `m` (1, the default), `l` (1.12),
  `xl` (1.26). A slider invites fiddling instead of reading.
- `scaleFor(id)` resolves an id to its scale, returning `1` for anything unknown, so a
  corrupt stored value degrades to the default rather than to zero.
- `useReadingSize()` returns `{ size, change, scale }` and persists `size` to
  `vibecoding:reading-size:v1`. It is a preference, like the energy mode, not an
  accomplishment.
- The control lives in `LessonToolbar` as four glyph chips, each carrying a `.sr-only`
  label — the visible glyph is “A”, “A+” or “A++”, and the accessible name is “Small”,
  “Default”, “Large” or “Extra large”.

`--lesson-scale` is the custom property that carries the value into CSS. `Lesson.jsx`
sets it inline on the lesson body wrapper, and only when it differs from `1`:
`style={scale !== 1 ? { "--lesson-scale": String(scale) } : undefined}`.

`global.css` reads it in exactly two places, and the restraint is the point:

```css
.lesson__body            { font-size: calc(var(--text-base) * var(--lesson-scale, 1)); }
.lesson__body h3, h4, h5 { font-size: calc(1em * (1 + (var(--lesson-scale, 1) - 1) * 0.5)); }
```

Body text scales by the full factor. Headings step by **half** the prose factor, because a
heading that grows with the reader quickly overwhelms the page. Tables, code blocks and
inline `code` are pinned to `--text-sm`, because scaling them would break their alignment
and their columns. The property is set on the lesson body rather than on `:root`, so
navigation, the sidebar and cards keep their designed proportions — scaling the root font
size would reflow the entire application to fix a reading problem.

---

## Spacing, radii and borders

**Spacing** is a single eight-step scale: `--space-1: 4px`, `--space-2: 8px`,
`--space-3: 12px`, `--space-4: 16px`, `--space-5: 24px`, `--space-6: 32px`,
`--space-7: 48px`, `--space-8: 64px`. There is no other spacing value in the system;
`global.css` uses these tokens for padding, margin and gap throughout.

**Radii** are drawn from the same scale, which is why there is no `--radius` token.
`--space-1` (4px) is the small radius on buttons, chips, inputs, badges and `.kbd`;
`--space-2` (8px) is the panel radius on cards, `.empty-state`, `.phase-card`,
`.tool-card`, tables and prices. The exceptions are few and deliberate: the progress track
and the quiz number pill use a fully rounded `999px`, and the section-done control uses
`50%` because it is a circle.

**Borders** are always `1px solid var(--border)` — except where the border *is* the
signal, in which case it is 3px and takes a state colour: `.lesson__quote` and `.quiz__q`
use a `border-left`, and `.pace--warning` / `.pace--success` / `.pace--muted` use a 3px
left rule rather than a background tint. A red background would say “behind a self-set
schedule is an error state”, which it is not. `.empty-state` and `.resume` use `dashed`
instead of `solid`, which reads as an invitation rather than a container.

**Layout tokens.** `--sidebar-width: 260px`, `--content-reading: 760px`,
`--content-wide: 1100px`, `--content-max: 1400px`, `--rail-width: 320px`. `--rail-width`
is the dashboard’s reference column and is **also written as a literal in the media query**
that folds it back, because a custom property is not valid inside a media query condition.
It is written once, as a literal, and named here so the two readings stay in step.

**Breakpoints.** Three, all literals inside `@media` for the same reason: `860px` (the
sidebar becomes an off-canvas drawer, the mobile topbar appears, the TOC collapses to one
column), `1180px` (the dashboard rail becomes a column), and `560px` (the small-screen
pass — touch targets to 40px, the pager and review heads stack).

**Touch targets.** Below 560px, `.sidebar__link`, `.chip`, `.btn`, `.nav-toggle` and the
reading-size chips are brought to `min-height: 40px`, and the reading-size chips to
`min-width: 40px`. A mis-tap on a 24,000-word lesson loses the reader’s place.

---

## <EmptyState>

`src/components/EmptyState.jsx`. Shown when a list has nothing in it yet.

**Props.** `message` (string, required) and `children` (optional, the next action). It
renders one `<div className="empty-state">`, a `<p>{message}</p>`, then `{children}`.

**Rules it follows.**

- It always suggests a next action. It is never just “nothing here”, and it never
  apologises. The `children` slot is where the action goes — usually a button that opens
  whatever creates the first item.
- The markup is a `<div>`, not a card. `.empty-state` is `--bg-subtle` with a dashed
  `--border`, which reads as a place a thing will go rather than a thing that is there.
- `.empty-state > :last-child { margin-bottom: 0 }` — the trailing paragraph margin would
  otherwise leave a gap when no action follows.
- `usePortfolio.js` cites this section for its empty case: an empty list is the normal
  state of most of a 34–112 week curriculum, not a problem to be fixed and not a place
  for a warning tone.

---

## <EnergyModeSelector>

`src/components/EnergyModeSelector.jsx`. Low / Normal / High. It changes which tasks the
dashboard offers as the next action — a low-energy day should not be shown a three-hour
lab.

**Props.** `mode` (one of `low | normal | high`) and `onChange(id)`.

It also exports `MODES` and `acceptsTask(mode, task)`. Each mode carries `{ id, label,
note, accepts }`, and `accepts` is cumulative: `normal` accepts `low` and `normal`;
`high` accepts all three. `acceptsTask` reads `task.energy || "normal"`, so a task with no
authored energy value is treated as normal rather than hidden from everyone.

**Rules it follows.**

- It is a `<fieldset className="energy">` with a `<legend>`, not a row of buttons. The
  question “how much energy do you have today” is a form question with one answer, so it
  uses radio inputs and the browser’s own keyboard model.
- `.energy__option` is a `<label>` wrapping the input and its text, so the whole chip is
  the hit area.
- The active state is `border-color: var(--accent)` plus the accent text colour. It is
  never a fill, because a filled chip reads as a button that has been pressed.
- `--warning` is not used for `high`. Energy is not a severity scale.
- The `note` field is surfaced as the label’s `title`, so the explanation of what each
  mode will offer is reachable without adding three paragraphs to the dashboard.
- It deliberately shares its shape with `TimeBudgetSelector` — same fieldset, same option
  chip, same legend treatment. They are the same kind of question asked twice, the reader
  answers both once and both persist, and two differently-styled controls side by side
  would read as two different kinds of thing.

---

## <PhaseCard>

`src/components/PhaseCard.jsx`. The summary card for one phase on the dashboard; clicking
it opens the phase.

**Props.** `phase`, `done`, `total`, `onOpen(phaseId)`. The whole card is a
`<button className="phase-card">` containing `.phase-card__head` (title plus muted
duration), the goal paragraph, and a `<ProgressBar>`.

**Rules it follows.**

- The whole card is a `<button>`, not a `<div>` with a click handler. It is reachable by
  Tab, activated by Enter and Space, and announces itself as a control. This is the rule
  the whole site follows: if it looks clickable, it is a real button.
- `done` and `total` come from the **light index** (`p.checklistIds`), so a phase card
  renders without loading a single byte of track prose. See `ARCHITECTURE.md` §2.
- Hover and active both change only `border-color` to `--accent`. The card does not lift,
  scale or change background on hover; the border is enough, and a shadow would make a
  grid of eleven cards look busy.
- `.phase-grid` tiles the cards two-up once there is width for two honest cards
  (`minmax(300px, 1fr)`), and falls back to one column below 560px. A single column of
  eleven full-width cards is a lot of scrolling for very little information per card.
- The duration is text, and it is a duration in weeks, not a time estimate in minutes.

---

## <ToolCard>

`src/components/ToolCard.jsx`. One tool from a phase’s tools table.

**Props.** `tool` — one object from the parsed tools table: `{ name, purpose, cost, url,
task, freeAlternative }`.

**Rules it follows.**

- The cost badge tone comes from `costTone(tool.cost)` in `src/data/tools.js`, never from
  a substring test inside the component. The tools library filters on the same mapping and
  two copies would drift.
- `costTone` is biased toward “free” on purpose, and the ordering is the whole design: an
  explicit zero-cost signal wins first (even when “paid” also appears, as in “Free … (API
  calls are paid)”), then freemium, then paid, and finally freemium as the honest default
  for “Varies”. The reader this curriculum is written for has no budget, and wrongly
  labelling something paid means they never find it.
- Tones are presentation only. A paid tool **still renders in full** with its purpose,
  practice task and free alternative, because a reader on a zero budget may still want to
  know what the paid tier would add. An indeterminate cost renders as `badge--freemium`,
  not `badge--free`: a reader who sees “freemium” will check, and a reader who sees “free”
  will assume.
- The free alternative is a first-class field with its own paragraph, not a footnote. The
  Cost track argues that a zero-budget learner can complete the whole curriculum, and this
  card is where that claim is auditable.
- The official-site link opens in a new tab with `rel="noreferrer"`.
- `tool.name`, `purpose`, `task` and `freeAlternative` pass through `renderInline`, so the
  authored `**bold**`, `*italic*` and `` `code` `` render as emphasis rather than as
  literal asterisks.

---

## Interaction rules

**Focus is always visible.** The global rule is:

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--space-1);
}
```

Controls that sit on an accent-coloured surface use `2px solid var(--focus)` instead,
because an accent ring on an accent fill disappears. Nothing in the stylesheet carries
`outline: none`; the one rule that ever did was corrected, and the reason is recorded in
the “Colour tokens” section above.

**The focus trap.** `src/hooks/useFocusTrap.js` is shared by all four overlay surfaces —
the mobile drawer, `ShortcutHelp`, `DataTransfer` and `LessonFinder`. The rule it
encodes is **modal means modal**: if a surface declares `aria-modal="true"` it must own
the tab order, or it must stop claiming to be modal. `body { overflow: hidden }` only
stops the scrollbar and does nothing to the tab order, which is why two of these panels
were previously still escapable by keyboard while telling assistive tech the background
was inert.

The hook does three things and deliberately only three:

- Moves focus in on open, preferring the caller’s nominated element (usually the close
  button) so the first Tab goes somewhere predictable. Focus is applied with
  `{ preventScroll: true }`, because on a 5,000–24,000 word lesson page focusing without
  it jumps the document to the top before the dialog has been laid out.
- Wraps Tab and Shift+Tab within the panel, listening on the **capture** phase so the
  app’s global shortcut handler does not act on a keypress meant for the dialog. If the
  panel contains nothing focusable, focus is held on the panel rather than let into the
  obscured page behind it.
- Restores focus to whatever opened the overlay, but only if that element is still in the
  document, and with `preventScroll`.

It does **not** render a backdrop, handle Escape, or manage open state; those differ per
overlay and stay with the component. It also locks the scrollbar behind the panel, with a
`padding-right` compensation for the scrollbar width so locking does not shift the layout.

**Keyboard shortcuts** live in `src/hooks/useShortcuts.js`. Every phase has a previous
and a next neighbour, and the sidebar is the only route between them; a reader working
one-handed should not have to aim at a 260px column to advance.

| Keys | Action |
|---|---|
| `/` | Focus search — the documentation-site convention |
| `Ctrl`/`⌘ K` | Focus search, because half the audience expects this one |
| `j` / `k` | Next / previous phase — vim order: `j` is down, `k` is up |
| `n` / `p` | The same, spelled out |
| `g` then `d` | Go to the dashboard |
| `g` then `s` | Go to the schedule |
| `?` | Show or hide the shortcut list |
| `Esc` | Close the list, or blur the field you are in |

Three rules govern them:

- **Keys are ignored while the reader is typing.** `isTypingTarget` returns true for
  `input`, `textarea`, `select` and anything `contentEditable`, so typing “jk” into a
  notes field does not navigate away from it. `Escape` still blurs the focused field,
  which is what it does everywhere else on the web.
- **No shortcut toggles a checkbox.** A single keystroke that mutates saved progress with
  no visible target is how a reader marks four tasks done by leaning on the keyboard, and
  progress state is the one thing here that is not cheap to rebuild.
- **A shortcut nobody knows about is not a feature.** The list is reachable from two
  places: `?`, and a visible `?` control in the topbar that is always rendered rather than
  revealed on hover, because a touch user has no hover. The same rule governs the
  code-block copy button. `g` arms a two-key sequence so a stray `d` is safe; it is held in
  a ref rather than in the effect closure, so a re-subscribe cannot swallow it mid-sequence.

**Hover and active states.**

- Hover is always an addition, never the only way to learn something. `.phase-card`,
  `.chip`, `.rail-chip`, `.plan__open`, `.search__link` and `.quiz__opt` change
  `border-color` to `--accent`; `.sidebar__link` and table rows take a `--bg-subtle`
  background; links gain an underline as well as `--accent-hover`.
- Active and selected states use `border-color: var(--accent)`, never a fill.
- Hover is never the only route to a control. Where a control is quiet in reading mode it
  is revealed on hover **or** keyboard focus **or** below the 560px breakpoint, where
  there is no hover at all: `.lesson__heading:hover .lesson__done, .lesson__done:focus-visible,
  .lesson__body.is-ticking .lesson__done, .lesson__done.is-done { opacity: 1 }`.
- A disabled control stays visible and reads as unavailable rather than broken:
  opacity 0.45, `cursor: default`, and `:hover` explicitly restated so it does not light
  up. `PhaseNav` uses this at a track boundary — “an element that vanishes at the end of a
  track reads as a rendering bug, and the honest message is ‘this was the last one’”.

**Toggles save immediately, with no save button and no confirmation.** Ticking a
checklist item writes to storage on change. The two exceptions are the destructive actions
— clearing a phase’s note, and the Replace import mode — and both name what will be lost
before they act.

**Every interactive element is reachable by keyboard.** There is no `div` with an
`onClick`, no custom control that swallows Tab, and no menu that only opens on hover.
Where a native control is unusable as-is, the real control is kept and made invisible to
the eye but not to assistive tech: the code-block copy button is always rendered rather
than revealed on hover and is made comfortably tappable below 860px, and the two
`<input type="file">` controls cannot be usefully styled or reworded, so they are visually
hidden (`.visually-hidden`, not `display: none`, so they stay in the accessibility tree
and remain focusable) and driven by a `<label>` styled as a button. The label keeps the
real input keyboard-operable — a visual replacement, not a click hijack — and the input
still carries an accessible name.

---

## Anti-patterns

The things this codebase deliberately does not do, and why. Several of these are cited by
name from `global.css`, `lib/pace.js`, `lib/today.js` and `useApplications.js`.

**No percentage scores.** The reader’s own work is never reduced to a percentage. A quiz
that announces “3 out of 10” would be the one place in the product that grades them.
“Two to look at again” is actionable; “80%” is not. See D-020 and D-044.

**No `N of M` language in quiz feedback.** The quiz summary names the questions to
revisit. It does not state how many were right, how many were answered, or any ratio. The
review queue is a list of questions to look at again, not a mark out of ten — a reader who
got one question wrong and a reader who got ten wrong see the same shape of page. The
storage layer enforces this, not just the renderer: `useQuizAnswers.js` persists the
chosen option index and nothing else. Every future addition to the quiz has to be checked
against that line, because a per-question “times missed” counter would reintroduce grading
through the back door while looking like a small UX improvement.

**No streaks or gamification.** No consecutive-day counter, no badges for persistence, no
“don’t break your streak”. A streak turns an ordinary week off into a loss, which is the
opposite of what a burnout-aware curriculum running 34–112 weeks needs. The dashboard’s
reference rail carries no charts and no streaks, and `lib/pace.js` computes a comparison
and nothing else: no penalties, no projections that turn a slow week into a failure.

**No toast for success.** A thing that worked does not need an announcement in the corner
of the screen. Results are stated where they happened: the copy button’s own label changes
to “Copied”, the phase transfer’s message appears under the buttons that produced it, and
the backup panel’s `role="status"` notice sits inside the panel. `role="alert"` is used
only for the backup panel’s actual failures.

**No colour-only signalling.** Covered in full under “Colour tokens” and “Accessibility”.
The practical test the code is written against: does the distinction survive greyscale
printing? The quiz passes it because “Correct” and “Your answer” are words as well as
colours; the overdue follow-up passes it because `.app-due` is `font-weight: 600` as well
as `--warning`.

**No time estimates in minutes.** Practice tasks carry a coarse band — `quick`,
`focused`, `deep`, `ongoing` — never a duration in minutes. 82% of the 183 practice tasks
sit between 20 and 90 minutes, so any cut inside that cluster is arbitrary and a slider
would imply a precision nobody has. See D-021.

**No false precision about the bands.** The band on a task is an authored judgement, not a
measurement — nobody has timed these tasks. `TimeBudgetSelector` therefore carries a
visible `.budget__note`: “How long you have is an estimate — nobody has timed these
tasks.” It is not muted to the point of invisibility, because a disclaimer nobody notices
is worse than none: it launders the guess. The selector offers three budgets, not four,
because `ongoing` is a band a task can have, not an amount of time a reader can have; it
appears only in the legend, so the reader can see why some work never shows up as a
suggestion.

**No auto-advancing carousels.** Nothing on the site moves on its own, and nothing changes
under the reader’s cursor. There is no rotating banner, no auto-scrolling list, and no
carousel at all — every list is a list, in an order the reader can see and predict.

**No fake buttons.** If it looks clickable it works and it does something; if it does
nothing, it does not look clickable. At a track boundary the pager is present but
`disabled`, which is honest, rather than absent, which reads as a bug. The one deliberate
exception is the template checkbox: a `- [ ]` line in the weekly tracker template is drawn
with `.tmpl-box`, a `<span>` with a border, plus a `.sr-only` “Unchecked:” or “Checked:”
prefix. The file is a template the reader is told to copy and fill in elsewhere, so a real
`<input>` would look tickable and do nothing — the same lie as a button that goes nowhere.
The span states “this is a checkbox” without promising it works.

**No red where nothing is wrong.** `--danger` is reserved for the quiz’s wrong answer. A
due follow-up uses `--warning` and a weight change, because a missed reminder is not an
error state. The pace card uses a 3px left rule rather than a background tint, because
“behind a self-set schedule” is not an error state. A refused row in the backup review is
greyed with `--text-muted`, not red, because nothing has gone wrong with the reader’s
data — a key in the file did not match what this version expects, and colouring it as an
error would read as “your backup is broken”. The “where you’ve been” page is deliberately
colourless for the same reason, and its three sections are identical in weight on purpose:
“not started yet” is the normal state of most of a 34–112 week curriculum.

**No dashboard that reports the reader’s writing.** The notes panel is not a checklist.
There is no count of answers, no “3 of 7 done”, and nothing it contains is reported to the
dashboard. A reader who writes three words and one who writes nothing look identical to
the rest of the site. This is a real cost — the feature is easy to miss entirely — and it
is accepted, because the alternative is a dashboard that says “you have written nothing”.
See D-019.

**No second progress system, and no reordering of the curriculum.** The task picker infers
what is already done from two facts recorded anyway (an answer exists; the phase is fully
ticked) rather than adding a per-task tick beside the checklist, and it walks the reader’s
own order rather than reshuffling the plan every morning — “what should I do today” must
not quietly become “what is the most efficient thing”. The inference is stated rather than
hidden: an unanswered task that is nonetheless finished will be offered again, which is
mildly annoying and not harmful — offering a task you already did is a smaller error than
dropping one you did not.

---

## Accessibility

**`sr-only`.** One utility class, used wherever a control’s visible label is a glyph or
where a state needs a name. The accessible name must never depend on the reader inferring
meaning from a character. It is applied to the reading-size chips (“A”, “A+” → “Small”,
“Large”), to the completion marks in the table of contents (“ — marked done”), to the
template checkbox prefix (“Checked:” / “Unchecked:”), and to the task answer textarea’s
label. `.visually-hidden` is the same rule set under a second name, used for the two real
file inputs. Both keep the element in the accessibility tree rather than removing it,
which is the entire point: `display: none` would take the control out of the tab order.

**`aria` usage.** The site uses ARIA only where the native element cannot say the thing:

- `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and an
  `aria-label`. `ProgressBar` sets `aria-valuenow` to the **percentage** and labels it
  `"{done} of {total} tasks complete"`. `LessonToolbar` sets `aria-valuenow` to the
  **count** with `aria-valuemax` equal to the section total, labelled “Lesson sections
  marked done”. The two differ on purpose because the units differ, and because lesson
  sections are deliberately not the same number as the phase checklist — conflating them
  would make one of the two lie.
- `role="img"` with `aria-label` on the progress ring’s `<svg>`.
- `aria-pressed` on every toggle that is not a native checkbox: the tick-mode chip, the
  finder chip, the four size chips, each quiz option, the per-section done button, and the
  notes open/close chip. `aria-expanded` goes on the things that disclose a region — the
  finder chip, the notes chip, the phase transfer’s Show/Hide, and each task’s answer
  toggle.
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby` on both overlays, with
  matching `useFocusTrap` containment.
- `role="status"` for a result worth announcing but not urgent (the backup notice, the
  phase-transfer message); `role="alert"` only for the backup panel’s real failures.
- `role="search"` and an explicit `aria-label` on both search inputs, `role="group"` for
  the tools library’s cost filter row, and `aria-label` on every `<nav>`: “Main”,
  “Breadcrumb”, “Lesson contents”, “Phase navigation”.

**Decorative glyphs are hidden.** Every character that carries no information — the ✕ on a
close button, the ✓/○ on the section done button, the quiz’s question number and option
letter, the completion tick in the table of contents, the answer dot on a task — is
wrapped in `aria-hidden` and paired with a real label. The quiz letters are hidden because
the option text is the option; the number is hidden because the list order already conveys
it.

**Why the progress ring is `aria-hidden` with a text equivalent beside it.** The ring is
a chart, and a chart must not be the only carrier of its value. In the code the `<svg>`
carries `role="img"` and a label built from the count, while the percentage and the raw
count are rendered as text beside it — so the sentence reaches a screen reader whether the
browser exposes the SVG or not, and a sighted reader gets the number as digits rather than
having to estimate an arc. `ProgressBar` follows the same rule: progress is always shown
as text as well as a bar, so it is never conveyed by colour alone. The ring replaces the
bar only where a proportion is being reported rather than a task being tracked.

**The reading bar is `aria-hidden`.** It reports a visual scroll position, and the
equivalent information is already available to a screen reader from the table of contents,
which names every section and marks the current one. It is also `pointer-events: none`,
so it cannot eat a click on the topbar it overlaps on narrow screens.

**The skip link.** `App.jsx` renders `<a className="skip" href="#main">Skip to content</a>`
as the first element in the application, and the main region is `<main id="main">`. It is
the first thing in the tab order, ahead of the brand button and the five nav buttons,
because a keyboard user should not have to traverse the chrome on every page.

**Reduced motion.** A `prefers-reduced-motion: reduce` block collapses every transition
and animation to `0.01ms` and forces `scroll-behavior: auto`. Nothing on the site animates
the content, but a reader who has asked the system for less motion should not get the
scroll transitions either. The table-of-contents jump and the finder’s jump to a hit both
use `behavior: "smooth"` and are swept up by this rule.

---

## Motion

Motion here has one job: to stop a control appearing to jump when its state changes. It is
never an acknowledgement that the reader did something.

**What animates.**

- `--transition-fast` (120ms ease) on `background`, `color`, `border-color` and `opacity`
  for hover, active and reveal states: sidebar links, buttons, chips, phase cards, table
  rows, the section done control’s opacity, the copy button, the tool-result link, and the
  mobile drawer’s sliding `transform`.
- `.progress__fill`, `.lesson-tools__fill` and `.pace__fill` transition `width`, so a
  number changing does not look like a glitch.
- `.reading-bar__fill` transitions `width` in **80ms linear** — faster, and linear because
  it tracks the scrollbar, where any easing would make it lag behind the reader’s own hand.

**What deliberately does not animate, and why.**

- **The progress ring.** `.ring__fill` carries the comment “No transition. This is a
  readout, not a reward,” and `ProgressRing.jsx` says the same thing at more length: the
  arc is drawn at its final length with no transition. An arc that sweeps up to its value
  is a celebration, and a celebration is a judgement about how the reader is doing. It
  would also be a lie of emphasis — drawing attention to the one number on the site that
  is closest to a score.
- **The content itself.** No fade-in on scroll, no staggered list entrance, no reveal on
  a heading. All of that delays reading, which is the one thing this site exists to do.
- **Anything the reader did not cause.** Nothing moves as a result of a timer.

**Print is a first-class output.** A phase is meant to be printable: the curriculum runs
34–112 weeks and the point of the print stylesheet is that a reader can take one phase to
a train or a lab bench with no network. Everything that exists only to operate a browser
is hidden — the sidebar, the topbar, the reading bar, the lesson toolbar, the finder, the
per-section tick controls, the copy buttons, the resume prompt, the pager, and every
overlay. Nothing is sticky on paper, cards stop being panels, link URLs are not expanded
inline, and page-break rules keep a heading with its text and keep a code block or a table
row whole. The dark theme is repainted by overriding the tokens rather than rewriting each
rule, so component styles carry over. The reader’s own writing deliberately does **not**
print: a printed page full of the reader’s earlier answers is a page with no room to write
on.
