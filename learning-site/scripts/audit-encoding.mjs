// Verifies line endings and encoding across the site's own tracked files.
//
// WHY THIS IS A SCRIPT AND NOT A CONVENTION
// The project rule is LF-only, UTF-8, no BOM, and REAL typographic characters
// (em dash as U+2014, not "--"). Those rules are invisible in review: a CRLF file
// looks identical to an LF one in an editor, and a mojibake em dash only shows up
// as garbage in a console that may itself be lying about encoding. The failure
// mode is a diff that rewrites a whole file, or a page showing the em dash's
// corrupted form to a reader. That form is deliberately NOT written literally
// here: this file is inside its own SCAN list, so a literal would make the audit
// fail on itself -- and the tempting "fix" is an exemption for this filename,
// which would create a file the check cannot police. Naming the codepoints
// instead keeps the file clean, so it needs no exemption: the corrupted em
// dash is U+00E2 U+20AC U+201D after a UTF-8 file is misread as Latin-1.
//
// So it is checked mechanically, and it reports the FILE AND LINE so a fix is
// a one-line edit rather than an afternoon.
//
// Run: node scripts/audit-encoding.mjs

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const SITE = fileURLToPath(new URL("..", import.meta.url));
const REPO = join(SITE, "..");

// ── THE REPO ROOT IS ENUMERATED, NOT LISTED ──────────────────────────────────
// This is the THIRD time this gap class has been found, and the first two fixes
// were both the same shape: name the files that had been missed. That shape fails
// again the moment a file is added -- and it had ALREADY failed when this comment
// was written. SCAN named `HANDOVER.md`, `README.md`, `AGENTS.md`,
// `CONTRIBUTING.md`, `LICENSE`, `PASTE-THIS.txt` and the three dotfiles, while six
// tracked root Markdown files -- `CHANGELOG.md`, `CHECKPOINT.md`, `ROADMAP.md`,
// `SETUP.md`, `TROUBLESHOOTING.md` and `WORKFLOW.md` -- were never opened. The
// guard reported "all clean" over six files it had not read.
//
// MEASURED, NOT INFERRED. A lone CR was injected into each of the six, the CR was
// ASSERTED present on disk BEFORE the audit ran, and the real audit was then
// executed: all six exited 0 and none was reported. The control -- `HANDOVER.md`,
// which IS in the list -- exited 1 and was named. So the CR detector works and the
// LIST was the hole, which is why the fix is to stop maintaining the list.
//
// Every top-level FILE in the repo root is therefore read, whatever its
// extension. Directories are not walked from here: the subdirectories are named in
// SCAN below and `.git` must not be opened. The extension filter is deliberately
// bypassed for these, because that filter is exactly what would skip a future
// `Makefile` or `CODEOWNERS` -- the same gap with one more turn of the wheel.
// Nothing has to be added here when a root file appears; that is the point.
const ROOT_FILES = readdirSync(REPO, { withFileTypes: true })
  .filter((e) => e.isFile())
  .map((e) => join(REPO, e.name));

// Source text we own. Generated JSON is excluded on purpose: it is a build
// artifact, regenerated from the Markdown, so checking it here would only
// re-report whatever the Markdown already determines.
//
// `ai-roadmaps` and the repo-root `docs` were ADDED after a gap was found: this
// script previously scanned only learning-site/*, so it reported "all clean"
// while never once looking at the 48 curriculum phases, which are the files
// most likely to carry a mis-encoded character and the ones where a stray
// character is most damaging (it lands in rendered lesson text). The curriculum
// is the reason this project exists; the guard should cover it.
//
// The ROOT FILES and the WORKFLOWS were added after a SECOND instance of the same
// gap: coverage was decided by extension, so `.gitignore` (no extension),
// `.editorconfig` and `.github/workflows/*.yml` were never opened. A stray CR
// landed in `.gitignore` and git itself warned about it on push -- the guard had
// reported "all clean" because it had never looked. Anything checked into the repo
// is fair game for a bad line ending, so the guard must open them.
//
// The SECOND fix named the root files explicitly, and that list is what failed
// next: it missed six root Markdown files for as long as they existed. That is why
// root files are now ENUMERATED (see ROOT_FILES above) and this comment no longer
// claims a list is a policy. The directories below stay named, because a directory
// cannot go stale the way a file list can -- and `.git` must not be walked.
const SCAN = [
  join(SITE, "src"),
  join(SITE, "scripts"),
  join(SITE, "docs"),
  join(SITE, "vite.config.js"),
  join(SITE, "index.html"),
  join(SITE, "package.json"),
  join(REPO, "ai-roadmaps"),
  join(REPO, "docs"),
  join(REPO, "scripts"),
  join(REPO, ".github"),
  // The repo root is deliberately ABSENT from this array. It is enumerated as
  // ROOT_FILES above and checked directly, because naming root files one by one is
  // what produced the six-file gap this array used to hide.
];

// A file is ours if it carries an extension we own, OR carries no extension at all.
//
// The second half is deliberate, and it closes the SECOND gap in this file's own
// history rather than repeating it: `extname()` returns "" for `.gitignore`, so a
// coverage rule decided by extension silently skipped it and a stray CR sat there
// until git complained on push. "No extension" is not a suffix guess -- it is a
// closed set of files that are configuration or prose we wrote, and this repository
// contains no extensionless binaries. Naming them by hand was the previous fix, and
// that hand-kept `EXTENSIONLESS` set is now deleted: every member of it was a root
// file, which the root pass reads directly, so the set had no remaining job and
// existed only as another place to keep in sync.
const isOurs = (p) => extname(p) === "" || EXTS.has(extname(p));

const EXTS = new Set([".js", ".jsx", ".mjs", ".css", ".html", ".json", ".md", ".yml", ".yaml", ".txt", ".toml"]);
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "generated"]);

// TRACKED-ONLY CHECK, added 2026-10-01. A file this repository does not own is not
// this repository's problem.
//
// The guard walks the filesystem, so it opened every file that happened to sit in
// the tree -- including per-machine files that are deliberately untracked, such as
// a local `opencode.json` naming one person's provider and model. A local config
// written with CRLF made this audit exit 1, which reads as a content defect and is
// not one: the red suite was caused by a file no contributor is expected to have.
//
// This does NOT weaken the rule it protects. The comment above records that the
// guard exists to catch "anything checked into the repo", and every file git
// tracks is still opened -- enumerated root files included. What is skipped is
// precisely the set git is already ignoring, which is the set that can differ per
// machine. A tracked file with CRLF still fails, which is the property that matters.
//
// Falls back to scanning everything if git is unavailable, so a checkout without
// git behaves as before rather than silently checking nothing -- a guard that
// quietly narrows its own coverage is the failure mode this file's history is made
// of.
const TRACKED_ONLY = (() => {
  try {
    const out = execFileSync("git", ["ls-files", "-z"], { cwd: REPO, encoding: "utf8", maxBuffer: 1 << 28 });
    const set = new Set(out.split("\0").filter(Boolean).map((p) => p.split("/").join(sep)));
    return set.size > 0 ? set : null;
  } catch {
    return null;
  }
})();

const problems = [];
let files = 0;

// Paths are compared relative to the repo root, because that is the form
// `git ls-files` prints and the form that survives a checkout on another machine.
function isTracked(p) {
  if (!TRACKED_ONLY) return true;
  return TRACKED_ONLY.has(relative(REPO, p));
}

function walk(p) {
  let st;
  try {
    st = statSync(p);
  } catch {
    return;
  }
  if (st.isFile()) {
    if (!isOurs(p)) return;
    if (!isTracked(p)) return;
    check(p);
    return;
  }
  for (const e of readdirSync(p, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(join(p, e.name));
    } else {
      const child = join(p, e.name);
      if (isOurs(child) && isTracked(child)) check(child);
    }
  }
}

// The mojibake sequences to look for, built from CODEPOINTS rather than written
// as literals.
//
// This looks like needless indirection and is not. Written as literals, this
// table would contain the very sequences it searches for, so the audit would
// always report itself as a failure — and the temptation would be to add an
// exemption for its own filename, which quietly creates a file the check cannot
// police. Building the patterns from character codes means the file contains no
// mojibake at all and needs no exemption.
//
// ⚠️ THE CODEPOINTS BELOW ARE THE *DECODED* ONES, WHICH IS THE WHOLE POINT AND
// WAS ONCE THE BUG. An earlier version built these with the raw UTF-8 byte
// values, e.g. `String.fromCharCode(0xe2, 0x80, 0x94)` for an em dash. That
// produces U+00E2 U+0080 U+0094 — characters, NOT bytes — while `check()` below
// searches text already decoded as UTF-8, where the same corruption surfaces as
// U+00E2 U+20AC U+201D. The two never matched, so the audit was structurally
// incapable of finding mojibake and reported clean on a file that had it. The
// proof is recorded in HANDOVER §12: injecting a real corrupted em dash into a
// phase left this guard passing.
//
// The correct transform is what a UTF-8 decoder does with the raw bytes:
//   E2 80 94 (em dash)             -> U+00E2 U+20AC U+201D
//   E2 80 99 (right single quote)  -> U+00E2 U+20AC U+2122
//   E2 80 9C (left double quote)   -> U+00E2 U+20AC U+0153
//   C3 A9    (e-acute)             -> U+00C3 U+00A9
//   C2 A0    (non-breaking space)  -> U+00C2 U+00A0
const MOJIBAKE = [
  [String.fromCharCode(0xe2, 0x20ac, 0x201d), "em dash"],
  [String.fromCharCode(0xe2, 0x20ac, 0x2122), "right single quote"],
  [String.fromCharCode(0xe2, 0x20ac, 0x153), "left double quote"],
  [String.fromCharCode(0xe2, 0x20ac, 0x9d), "right double quote"],
  [String.fromCharCode(0xe2, 0x20ac, 0x201c), "left double quote or en dash"],
  [String.fromCharCode(0xe2, 0x20ac, 0x2013), "en dash"],
  [String.fromCharCode(0xe2, 0x2020, 0x90), "left arrow"],
  [String.fromCharCode(0xc3, 0xa9), "e-acute"],
  [String.fromCharCode(0xc2, 0xa0), "non-breaking space"],
];

// A corrupted em dash can also arrive as the "cp1252 read as latin-1" variant,
// where the euro sign is missing entirely. Checked separately because it shares
// a prefix with the table above and would otherwise be shadowed by it.
const MOJIBAKE_ALT = [
  [String.fromCharCode(0xe2, 0x80, 0x9d), "em dash (cp1252 variant)"],
  // The two entries below were added after a REAL instance was found, which is the
  // only way this table has ever been extended honestly. HANDOVER.md quoted a
  // console misrendering as `U+00E2 U+20AC U+0022`: the corrupted em dash with a
  // STRAIGHT quote as its third character, because something had normalised the
  // curly quote while the first two characters stayed corrupted. No
  // three-character entry above matches that, so the guard called the file clean
  // -- and had done so since the line was written.
  //
  // The generalisable failure is that this table had been built by enumerating
  // THIRD characters, one variant at a time, and a third character is unbounded.
  // The PREFIX is not: a euro sign directly after an a-circumflex only ever arises
  // from misreading a UTF-8 three-byte character as cp1252. Matching the family on
  // its prefix therefore closes every variant of it at once, instead of waiting for
  // a reader to hit the next one. A bare a-circumflex is legitimate text in French
  // and Portuguese, which is exactly why the euro sign is part of the pattern.
  [String.fromCharCode(0xe2, 0x20ac), "cp1252-misread UTF-8 (euro sign after a-circumflex)"],
  // The same argument for the two-byte family: a stray a-circumflex before a
  // section sign is a misread UTF-8 section sign and never legitimate prose.
  [String.fromCharCode(0xc2, 0xa7), "section sign after a stray a-circumflex"],
];

// Both tables in ONE list, so a more specific entry can be preferred to a family
// entry at the same position by PATTERN LENGTH rather than by array order.
const ALL_MOJIBAKE = [...MOJIBAKE, ...MOJIBAKE_ALT];

// ── WHY THIS TABLE IS LONGER THAN IT LOOKS ───────────────────────────────────
// Every extra entry was added in response to a variant ACTUALLY FOUND in the
// corpus, not guessed in advance. `foundations/01-phase-what-a-model-is.md`
// alone carried em dashes, en dashes, left double quotes and a left arrow, in
// four different corrupted spellings — because the same underlying bytes decode
// differently depending on which single-byte codepage the reader wrongly applied
// (Latin-1, cp1252 and MacRoman each map the 0x80–0x9F range differently).
//
// The generalisable point: a mojibake table is never finished by reasoning. It
// grows by finding real damage. If a new variant appears, add it here AND fix the
// file — then prove the new entry fails by injecting that exact sequence, because
// an entry that never matches is indistinguishable from a working one until a
// reader sees the garbage.

function check(file) {
  files++;
  const buf = readFileSync(file);
  const rel = file.replace(/\\/g, "/").split("/Vibecoding/")[1] || file;

  // BOM
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    problems.push(`${rel}: has a UTF-8 BOM`);
  }

  // CRLF / lone CR
  let crlf = 0;
  let loneCr = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0x0d) {
      if (buf[i + 1] === 0x0a) crlf++;
      else loneCr++;
    }
  }
  if (crlf) problems.push(`${rel}: ${crlf} CRLF line ending(s)`);
  if (loneCr) problems.push(`${rel}: ${loneCr} lone CR byte(s)`);

  // Valid UTF-8 (a decode that produces U+FFFD means it was not valid)
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    problems.push(`${rel}: not valid UTF-8`);
    return;
  }

  // Mojibake that survived as real characters
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    // ONE report per offending position, and the MOST SPECIFIC entry wins.
    //
    // Two loops used to run here, one per table, and every match pushed its own
    // problem. That was harmless while every entry was the same length and no two
    // could match the same character. It stopped being harmless the moment
    // MOJIBAKE_ALT carried FAMILY entries: the prefix `U+00E2 U+20AC` matches a
    // corrupted em dash exactly as the three-character entry does, so one bad
    // character would be reported twice. The scan below takes the earliest match
    // and, at equal positions, the LONGEST pattern, then resumes after it -- so the
    // specific name ("em dash") still wins over the family name.
    let from = 0;
    for (;;) {
      let best = null;
      let bestAt = -1;
      for (const [bad, what] of ALL_MOJIBAKE) {
        const at = lines[i].indexOf(bad, from);
        if (at === -1) continue;
        if (bestAt === -1 || at < bestAt || (at === bestAt && bad.length > best[0].length)) {
          bestAt = at;
          best = [bad, what];
        }
      }
      if (!best) break;
      problems.push(`${rel}:${i + 1}: mojibake ${best[1]}`);
      from = bestAt + best[0].length;
    }
    if (lines[i].includes("\t")) {
      problems.push(`${rel}:${i + 1}: contains a tab character`);
    }
  }
}

for (const p of SCAN) walk(p);

// The root pass. `check()` is called DIRECTLY rather than through `walk()` so the
// extension filter cannot skip a root file: the whole point of enumerating the
// root is that nothing there is exempt.
//
// The tracked-file filter still applies, and it is the only exemption in this
// pass -- see the note on TRACKED_ONLY. `opencode.json` is why: a root file that
// names one person's provider and model, deliberately untracked, and written with
// CRLF by the tool that generates it. Before 2026-10-01 it failed this audit.
for (const f of ROOT_FILES) {
  if (isTracked(f)) check(f);
}

console.log(`${files} file(s) scanned`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems.slice(0, 40)) console.log("  " + p);
  if (problems.length > 40) console.log(`  ... and ${problems.length - 40} more`);
  process.exit(1);
}
console.log("✓ all files are LF, UTF-8 without BOM, no mojibake, no tabs");
