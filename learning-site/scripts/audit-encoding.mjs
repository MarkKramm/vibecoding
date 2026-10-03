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
//
// TWO THINGS THIS FILE GOT WRONG ON 2026-10-01, both found by arithmetic and by
// injecting one defect rather than by reading the code, and both worth stating up
// front because each looked like a pass:
//
//   1. IT DID NOT SCAN EVERY TRACKED FILE. `git ls-files` reported 229 and this
//      audit reported 228; the delta was `learning-site/package-lock.json`. A lone
//      CR written into it, asserted present on disk, left this audit exiting 0 with
//      "all files are LF". SCAN named `learning-site/src`, `scripts`, `docs` and
//      then three individual files in `learning-site/`, so the fourth file in that
//      same directory was invisible. The fix is not another path -- it is the
//      coverage assertion at the bottom, which fails when a tracked file is neither
//      scanned nor exempted. See the comment there.
//
//   2. ITS REPORTS NAMED A MACHINE-SPECIFIC ABSOLUTE PATH. The relative path was
//      computed as `file.split("/Vibecoding/")[1] || file`, which resolves only when
//      the checkout sits in a directory literally named `Vibecoding`. Everywhere
//      else it fell through to the absolute path, so the promise above was not kept
//      and a report could not be pasted into a command. It is now `relative(REPO, …)`.
//
// The byte-level reports also carried no line number at all -- a CRLF was announced
// per file with a count and no position, which is unactionable on a 2,000-line phase
// file. They now name the first occurrence's line. Every change here was proved by
// injecting the defect, asserting the bytes reached disk, and reading the EXIT
// CODE; the probe scripts live in %TEMP% and are not committed, per AGENTS.md.

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
//
// ⚠️ THE FILE/DIRECTORY TEST IS `statSync`, NOT `Dirent.isFile()`, AND THAT IS NOT
// INTERCHANGEABLE. Found 2026-10-03, on the first run on a new machine: this filter
// was `.filter((e) => e.isFile())`, `Dirent.isFile()` returned FALSE for all fifteen
// tracked root files, `ROOT_FILES` came out EMPTY, and the audit reported clean over
// a set of files it had not opened -- the exact defect the coverage assertion at the
// bottom exists to catch, reintroduced through a different line.
//
// The cause is the filesystem, not the code. `readdirSync(REPO, { withFileTypes: true })`
// here returns correct dirents for directories and UNKNOWN for every regular file, and
// `Dirent.isFile()` is false for UNKNOWN. `statSync().isFile()` on the same paths is
// correct. Every other walker in this repository already used `statSync` -- which is
// why they kept working while this one did not -- and this was the only `Dirent.isFile()`
// in the codebase.
//
// It passed CI on the machine it was written on, which is the lesson: the defect was
// never a defect *there*, so no amount of re-running it there would have found this.
// A guard that depends on a facility the platform may decline to provide is a guard
// with an untested failure mode. Assert the property you want (a file is a file) with
// the primitive that answers it everywhere, and let the coverage assertion below
// confirm the result rather than trusting the enumeration.
//
// Proven by injection, not by reading: a lone CR was written into `SETUP.md`, ASSERTED
// present on disk, and the audit exited 1 naming that file and line -- before this fix,
// with `SETUP.md` in the root set, it exited 0. The bytes were then restored and the
// restore verified against git.
const ROOT_FILES = readdirSync(REPO, { withFileTypes: true })
  .filter((e) => !e.isDirectory())
  .map((e) => join(REPO, e.name))
  .filter((p) => statSync(p, { throwIfNoEntry: false })?.isFile());

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
  // `learning-site/` itself is DELIBERATELY absent, and its three files were named
  // individually above -- `vite.config.js`, `index.html`, `package.json`. That is the
  // same mistake the repo root used to make, and it had already failed: the fourth
  // file in that directory, `package-lock.json`, was never scanned. A lone CR
  // written into it was asserted present on disk and this audit still exited 0.
  // Naming three siblings is a list that fails on the fourth.
  //
  // The whole directory is walked instead. `learning-site/node_modules` is the one
  // thing in it that must not be read, and `SKIP_DIRS` already contains
  // `node_modules`, so walking costs one `readdirSync` and gets every future file
  // in that directory for free.
  join(SITE),
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
// Stored FORWARD-SLASHED, which is the form `git ls-files` prints and the form
// `git diff` and the GitHub UI take.
//
// This used to normalise to the platform separator instead, so `isTracked()` had
// to hand it `relative(REPO, p)` unmodified. That was self-consistent while it was
// the only consumer, but the coverage assertion at the bottom compares this set
// against `SCANNED`, which is forward-slashed because it feeds the report text --
// and on Windows the two sets differed on every single entry, so the assertion
// reported all 229 files as unscanned. One canonical form is the fix; converting
// in `isTracked()` instead would have left the same trap for the next consumer.
const TRACKED_ONLY = (() => {
  try {
    const out = execFileSync("git", ["ls-files", "-z"], { cwd: REPO, encoding: "utf8", maxBuffer: 1 << 28 });
    const set = new Set(out.split("\0").filter(Boolean));
    return set.size > 0 ? set : null;
  } catch {
    return null;
  }
})();

const problems = [];
let files = 0;

// Every file `check()` actually opened, as a repo-relative forward-slashed path --
// the same form `git ls-files` prints, so the coverage assertion at the bottom can
// compare the two sets directly. Populated by `check()` rather than by the
// walkers, because that is the only place that knows a file was genuinely read:
// a path can reach `walk()` and still be dropped by the extension or tracked-file
// filter, and counting it as covered would make the assertion a tautology.
const SCANNED = new Set();

// Paths are compared relative to the repo root and forward-slashed, because that
// is the form `git ls-files` prints, the form the coverage assertion compares
// against, and the form that survives a checkout on another machine.
function isTracked(p) {
  if (!TRACKED_ONLY) return true;
  return TRACKED_ONLY.has(relative(REPO, p).split(sep).join("/"));
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

// ── THE 4-BYTE FAMILY, AND THE ONLY GAP THIS AUDIT HAD ────────────────────────
// Found 2026-10-03, in `docs/SEARCH-REQUESTS.md`: its header carried a real emoji whose
// bytes had been misread once and stored AS the misread characters — U+00F0 U+0178
// U+2018 U+2030, which is F0 9F A7 89 rendered through a single-byte codepage. Every
// table above is blind to it, and so was this audit, which reported clean.
//
// The reason is structural rather than an oversight in the tables: every entry starts
// with the misread form of a THREE-byte lead byte (E2, C3, C2 → â, Ã, Â). A FOUR-byte
// character — any emoji, and anything else outside the BMP — has a lead byte of F0–F4,
// which misreads to ð, ñ, ò, ó, ô, and no table here mentioned any of them.
//
// A bare ð is Icelandic and a bare ñ is Spanish and a bare ó is Catalan, so the LEAD
// proves nothing on its own; that is the same trap the â entries record, and it is why
// the pattern below requires TWO further characters from the set that only appears when
// continuation bytes are read as one-byte codepage characters. Real prose does not put a
// symbol, quote or control code immediately after ð, ñ, ò, ó or ô — "año" and "ó—" are
// ordinary text and neither matches, because one continues with a LETTER and the other
// with a single character.
//
// A RUN OF THREE is the tell, and it is exact: a four-byte character misread yields four
// adjacent high characters with no space between them, so requiring at least three keeps
// a legitimate "ó—" out while catching every member of the family regardless of which
// codepage did the damage. The range also covers the C1 controls, which no authored file
// should contain at all.
//
// Written as \u escapes rather than as the characters themselves, for the reason the rest
// of this file is built from codepoints: this file is inside its own scan, so a literal
// would make the audit report itself and invite an exemption for its own filename — a
// file the check then cannot police.
//
// ⚠️ KNOWN LIMIT, stated rather than engineered around. A MacRoman misread can put
// LETTERS after the lead -- F0 D8 D8 renders as "ðØØ" -- and those are excluded on
// purpose, because admitting letters here would flag "año", "niño" and "coração", which
// are ordinary text in a corpus that contains them. Measured against eleven such strings
// (Spanish, Catalan, Icelandic, Portuguese, French, Vietnamese, currency and copyright
// symbols) this pattern produces zero false positives, and it catches the real instance
// plus six synthetic variants. The residual hole is narrow and deliberate: a guard that
// cries wolf on Spanish gets deleted, and a deleted guard catches nothing at all.
const MOJIBAKE_4BYTE = new RegExp(
  "[\\u00f0-\\u00f4][" +
    "\\u0080-\\u00bf\\u0152\\u0153\\u0160\\u0161\\u0178\\u017d\\u017e\\u0192\\u02c6\\u02dc" +
    "\\u2013\\u2014\\u2018\\u2019\\u201a\\u201c\\u201d\\u201e\\u2020\\u2021\\u2022\\u2026" +
    "\\u2030\\u2039\\u203a\\u20ac\\u2122" +
    "]{2,}"
);

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
  // Idempotent. SCAN deliberately contains both `learning-site/` and some of its
  // own children -- the three named files are still listed, and they also live
  // inside the directory now walked -- so a file can arrive here twice. Reading
  // it twice would report a problem twice and inflate the scanned count; the
  // count is load-bearing because the coverage line beside it is what makes the
  // 229-vs-316 style mismatch visible, so it has to mean "distinct files read".
  const id = relative(REPO, file).split(sep).join("/");
  if (SCANNED.has(id)) return;
  files++;
  SCANNED.add(id);
  const buf = readFileSync(file);
  // Relative to the REPO ROOT, forward-slashed, via the same `relative()` the
  // tracked-file test uses. This was `file.split("/Vibecoding/")[1] || file`,
  // which only resolved when the checkout sat in a directory literally named
  // `Vibecoding`. On any other path the split missed and every problem was
  // reported against a machine-specific ABSOLUTE path, so the header's promise
  // that a report names "the FILE AND LINE" was not kept and no reader could
  // grep the output. Proven by injection 2026-10-01: a lone CR in
  // `learning-site/src/main.jsx` printed the whole absolute path.
  //
  // It is `relative(REPO, ...)` rather than `relative(SITE, ...)` because every
  // other path in this file is repo-relative, including `isTracked()` and the
  // form `git ls-files` prints. One convention, so a name in a report can be
  // pasted straight into a command.
  const rel = id;

  // The line number every report below carries, so the header's promise that a
  // report names "the FILE AND LINE" holds for the byte-level problems too.
  //
  // It did not, and the omission is what made the CR findings useless in practice:
  // a CRLF is reported per FILE with a count and no position, so on a 2,000-line
  // phase file the reader is told a number exists somewhere and not where. Both
  // byte-level problems are found by a raw byte scan, which has no line context of
  // its own, so the line is derived here by counting LFs up to the offending byte.
  //
  // LF, not the file's own terminator: a file that is entirely CRLF has its CRs at
  // byte i and its LFs at byte i+1, so counting LFs before the CR gives the line the
  // CR terminates. Counting the CR itself would report every CRLF in the file as
  // being on line 1.
  const lineOf = (byteIndex) => {
    let line = 1;
    for (let i = 0; i < byteIndex && i < buf.length; i++) {
      if (buf[i] === 0x0a) line++;
    }
    return line;
  };

  // BOM
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    problems.push(`${rel}:1: has a UTF-8 BOM`);
  }

  // CRLF / lone CR
  //
  // The CRLF report names the FIRST occurrence rather than only a count, because a
  // count alone cannot be acted on and a file with 650 CRLFs does not need 650
  // lines of output. Every occurrence is still counted, so a partial fix that
  // leaves some behind does not read as a clean file.
  let crlf = 0;
  let loneCr = 0;
  let firstCrlf = -1;
  let firstLoneCr = -1;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0x0d) {
      if (buf[i + 1] === 0x0a) {
        if (crlf === 0) firstCrlf = i;
        crlf++;
      } else {
        if (loneCr === 0) firstLoneCr = i;
        loneCr++;
      }
    }
  }
  if (crlf) problems.push(`${rel}:${lineOf(firstCrlf)}: ${crlf} CRLF line ending(s), first at this line`);
  if (loneCr) problems.push(`${rel}:${lineOf(firstLoneCr)}: ${loneCr} lone CR byte(s), first at this line`);

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
    if (MOJIBAKE_4BYTE.test(lines[i])) {
      const m = lines[i].match(MOJIBAKE_4BYTE);
      problems.push(
        `${rel}:${i + 1}: mojibake 4-byte UTF-8 (emoji or other non-BMP character) misread as a single-byte codepage — "${m[0]}" (U+${[...m[0]].map((c) => c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")).join(" U+")})`
      );
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

// ── COVERAGE IS NOW CHECKED, NOT ASSUMED ─────────────────────────────────────
// This is the FOURTH instance of the same gap class, and the first three fixes
// were all "add the path that was missed" -- a shape that fails again the moment
// the next file lands somewhere the list does not reach. The repo root was fixed
// by ENUMERATING it for exactly that reason, and this is the same move applied to
// the whole tree.
//
// Found 2026-10-01, by arithmetic rather than by inspection: `git ls-files`
// reports 229 tracked files and the audit reported 228 scanned. The delta was
// `learning-site/package-lock.json`, which sits directly in `learning-site/` and
// is outside every SCAN entry -- that array names `src`, `scripts`, `docs` and
// then three individual files, so the fourth file in the same directory was
// invisible. Proved by injection, not by reading: a lone CR was written into the
// file, ASSERTED present on disk (60,815 -> 60,816 bytes), the real audit ran,
// and it printed `228 file(s) scanned` and `all files are LF, UTF-8 without BOM,
// no mojibake, no tabs` with exit 0.
//
// It is the worst file in the repository for this particular defect. `.gitattributes`
// line 42 carries `package-lock.json -diff`, so a line-ending change to it is
// invisible in review AND invisible in `git diff`. That is precisely the class
// this audit exists for, sitting on the one file where the other two layers of
// defence are also silent.
//
// So rather than adding the path, this asserts the property. Every tracked file
// must be either SCANNED or listed in EXEMPT below with a reason. A tracked file
// that is neither fails the audit, and the message names it. Adding a file
// anywhere in the tree now either gets checked automatically or has to be
// declared, which is the only arrangement that cannot rot.
//
// `TRACKED_ONLY` is null when git is unavailable, in which case there is no
// tracked set to compare against and the check is skipped rather than reported
// as a pass -- a guard that cannot see is not a guard that succeeded.
const EXEMPT = new Map([
  // Deliberately empty. `package-lock.json` is NOT exempt: it is tracked, it is
  // ours by extension, and `*.json text eol=lf` in `.gitattributes` already
  // declares it LF, so a CRLF in it is a real defect rather than a tool's
  // prerogative. It is scanned like anything else now that coverage is computed
  // rather than listed.
  //
  // An entry added here must be a path and a reason, e.g.
  //   ["some/file.bin", "binary; checked by <other guard>"],
  // and the reason is what a future reader needs in order to judge whether the
  // exemption is still right.
]);

if (TRACKED_ONLY) {
  const unscanned = [];
  for (const relPath of [...TRACKED_ONLY].sort()) {
    if (SCANNED.has(relPath)) continue;
    if (EXEMPT.has(relPath)) continue;
    // Files under a skipped directory are out of scope by policy, not by
    // omission: they are build output or vendored dependencies.
    if (SKIP_DIRS.has(relPath.split("/")[0])) continue;
    unscanned.push(relPath);
  }

  if (unscanned.length) {
    console.error(
      `\n✖ COVERAGE GAP: ${unscanned.length} tracked file(s) are neither scanned nor exempted.\n`,
    );
    console.error("  This audit just reported on the files it did read. These it never opened,");
    console.error("  so it cannot vouch for their line endings or encoding:\n");
    for (const p of unscanned.slice(0, 40)) console.error(`  ${p}`);
    if (unscanned.length > 40) console.error(`  ... and ${unscanned.length - 40} more`);
    console.error("\n  Either the file belongs in the scan, or it belongs in EXEMPT in this");
    console.error("  file with a reason. Do not silence this by widening SKIP_DIRS.\n");
    process.exit(1);
  }
}

console.log(`${files} file(s) scanned`);
if (TRACKED_ONLY) {
  console.log(`  coverage: all ${TRACKED_ONLY.size} tracked file(s) scanned or exempted`);
}
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems.slice(0, 40)) console.log("  " + p);
  if (problems.length > 40) console.log(`  ... and ${problems.length - 40} more`);
  process.exit(1);
}
console.log("✓ all files are LF, UTF-8 without BOM, no mojibake, no tabs");
