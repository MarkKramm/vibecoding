# Setup, in full

[README.md](README.md) has the short version: three commands and you are running. This
file is the long version, and it exists because the short version is not enough when
something goes wrong.

Everything here has actually bitten this project. The traps are real, they cost hours
when they hit, and most of them fail **silently** — you get a working command, a green
check, and a wrong answer.

---

## Requirements

| Tool | Version used | Notes |
|---|---|---|
| Node.js | **v24.19.0** | v20+ very likely works; only v24 is verified |
| npm | **11.17.0** | ships with Node |
| A browser | Edge, Chrome, or Firefox | only needed for the optional browser checks |

There is **no** database, server, or account. The site is static files plus
`localStorage`, and it runs entirely on your machine.

---

## The three commands

Run these from the repository root.

```bash
cd learning-site
npm install          # once
npm run dev          # http://localhost:5173
```

`npm run dev` builds the content bundle first and then starts Vite. If you edit
anything under `ai-roadmaps/`, the dev server will **not** pick it up on its own —
see the first trap below.

To check a production build the way a host would serve it:

```bash
npm run build        # writes learning-site/dist/
npm run preview      # http://localhost:4173
```

---

## Trap 1 — Markdown is the source of truth, and the site does not read it

`learning-site/` never opens a `.md` file. `scripts/build-content.mjs` compiles
`ai-roadmaps/**/*.md` into JSON in `learning-site/src/data/generated/`, and that
directory is **gitignored on purpose**.

So editing a phase file in a running dev server changes nothing. You must rebuild:

```bash
npm run build:content    # from learning-site/
# or, from the repo root:
node scripts/build-content.mjs
```

**A stale generated bundle is the single most common cause of "my change did not
work".** It has produced two false bug reports in this project, including one where the
site showed "8 tracks / not yet written" for content that existed, because the JSON was
40 minutes older than the Markdown.

If a change seems not to apply, rebuild before you debug anything else.

---

## Trap 2 — `VITE_BASE` silently produces a blank page

`vite.config.js` reads `VITE_BASE` so the same source can deploy to a subpath. GitHub
Pages needs `/vibecoding/`; local preview needs `/`.

```bash
npm run build                         # assets at /assets/...        <- local preview
VITE_BASE=/vibecoding/ npm run build  # assets at /vibecoding/assets/... <- Pages
```

Get these the wrong way round and the page loads **completely blank**: the HTML
requests `/vibecoding/assets/index-*.js`, the preview server does not have it, and it
returns the `index.html` fallback instead of JavaScript. No console error that names
the cause.

If the site is blank, check what `dist/index.html` actually references:

```bash
grep -o '/[^"]*assets/[^"]*' dist/index.html
```

Then rebuild **without** `VITE_BASE` for local work. If `VITE_BASE` is set in your
shell and you have forgotten, every build from that shell is wrong.

---

## Trap 3 — the port is not always `127.0.0.1`

The dev server binds IPv6 only. Use:

```
http://localhost:5173      ✓
http://127.0.0.1:5173      ✗ may refuse the connection
```

---

## Trap 4 — the browser checks need a server, and the preview port differs

`npm test` runs 17 checks. Most are offline, but the rendered accessibility audit and
the all-65-phase sweep need a browser and a production preview server on port 4173. If
nothing responds there, those two checks explicitly skip; start the preview to get the
full audit:

```bash
npm run build          # refresh content and production bundle
npm run preview        # in one terminal, port 4173
npm test               # in another; runs all checks including the two browser checks
npm run test:browser   # additional smoke, deep, quiz and focused-track checks
```

The browser checks read the **built** output in `dist/`, not your source. If you edited a
component and did not rebuild, a browser check can pass against the old build and tell you
something false. This has happened twice. If port 4173 is occupied, choose a different
preview port and set `VITE_PREVIEW_URL` to that URL before running tests.

---

## Trap 5 — editing on Windows

The content guards fail hard on CRLF, a UTF-8 BOM, a tab, or mojibake. That is
deliberate: these have corrupted real files in this project three times.

**Do not use `[System.IO.File]::WriteAllLines()` or `WriteAllText()` from PowerShell.**
They use `Environment.NewLine`, which is `\r\n` on Windows, and they have damaged
content files here before. If you must write from PowerShell:

```powershell
[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))
```

with `\n` already in `$text`. Prefer a normal editor.

**Never find-and-replace across a prose file.** A regex pass once consumed the `### `
heading prefix and destroyed 54 quiz headings. Edit occurrences individually, then
re-run a structural guard.

### If your console shows `â€"` and you think the file is corrupted

It probably is not. **Check the bytes, not the terminal.** PowerShell and some Windows
consoles misrender correct UTF-8, and this exact false alarm has been raised here:

```bash
node -e "const b=require('fs').readFileSync('FILE.md');console.log('U+00E2:',(b.toString('utf8').match(/\u00e2/g)||[]).length)"
```

Zero means the file is fine and your console is lying to you.

---

## Running the checks

```bash
cd learning-site
npm test             # 17 checks; browser checks skip if preview is unavailable
npm run check        # the content contract only: build, quiz, lesson AST
```

For all 17 checks, build the site, start `npm run preview` in another terminal (default port 4173), then run `npm test`. The accessibility and all-phase browser checks report an explicit skip when no preview answers. If 4173 is occupied by another project, choose a free preview port and set `VITE_PREVIEW_URL` to that URL before running checks.

`npm test` runs `scripts/check-all.mjs`, which chains 17 checks; this table lists representative coverage rather than every individual step:

| Check | Catches |
|---|---|
| content build | the 14-section phase contract, authored ids, field order |
| field shapes | a changed element type that only fails at render time |
| cost classification | a new cost phrase that would be mis-tiered |
| worked-example arithmetic | stated numbers that contradict the surrounding prose |
| encoding | CRLF, BOM, tabs, mojibake |
| CSS wiring + reachability | a class used in JSX with no CSS rule or a source module disconnected from the app |
| rendered accessibility audit | six-view contrast, names, headings, landmarks, keyboard reachability, focus, live regions and skip link |
| all-phase browser sweep | all 65 phase screens, controls, explanations, navigation and runtime errors |

The CSS check exists because the site once shipped with **40 layout classes that no
stylesheet defined** — the page rendered completely unstyled while every content check
stayed green. A missing CSS rule changes no text and breaks no JSON field, so nothing
that reads content could see it.

From the repository root, the content guards are:

```bash
node scripts/build-content.mjs --check     # writes notes to STDERR -- check the exit code
node scripts/audit-quiz.mjs
node scripts/audit-lesson-ast.mjs
```

`build-content.mjs` prints its notes to **stderr**, so `... | tail` can show nothing
while the command actually failed. Check `$LASTEXITCODE` / `$?`.

---

## If the checks fail

| Symptom | Cause |
|---|---|
| "phase has N sections" | a `## ` heading is misspelled, reordered, or missing |
| "minted from position" | a task or checklist item is missing its `<!-- id: ... -->` |
| "band" error | `band: normal` — `normal` is an **energy** value, not a band |
| wrong quiz count | a quiz heading lacks `energy:` in its `<!-- id: -->` |
| CRLF / BOM errors | wrote the file with a Windows API or a CRLF editor |
| CSS wiring failure | a class in JSX with no matching rule in any `.css` |

The phase contract is 14 sections in a fixed order. `## Tools for This Phase` has a
capital **T**, and `## You're ready to move on when...` ends with three ASCII dots —
**not** the `…` character. Both have been broken before.

---

## Deploying

Pushing to `main` deploys automatically via GitHub Actions to
**https://markkramm.github.io/vibecoding/**.

Two workflows run:

- `.github/workflows/ci.yml` — content guards on every push and pull request
- `.github/workflows/pages.yml` — build and publish; runs the integrity gate **before**
  installing dependencies, so a broken content file fails fast

Both need `VITE_BASE=/vibecoding/`, which the Pages workflow sets. Do not set it locally.

---

## Where to go next

- [README.md](README.md) — what this is
- [CONTRIBUTING.md](CONTRIBUTING.md) — how to add or edit a phase
- [AGENTS.md](AGENTS.md) — the content contract, for AI agents
- [docs/CONTENT-SCHEMA.md](docs/CONTENT-SCHEMA.md) — the full field-level contract
- [HANDOVER.md](HANDOVER.md) — engineering history and accumulated lessons
