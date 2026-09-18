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
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = fileURLToPath(new URL("..", import.meta.url));
const REPO = join(SITE, "..");

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
  join(REPO, "HANDOVER.md"),
];

const EXTS = new Set([".js", ".jsx", ".mjs", ".css", ".html", ".json", ".md"]);
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "generated"]);

const problems = [];
let files = 0;

function walk(p) {
  let st;
  try {
    st = statSync(p);
  } catch {
    return;
  }
  if (st.isFile()) {
    if (!EXTS.has(extname(p))) return;
    check(p);
    return;
  }
  for (const e of readdirSync(p, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(join(p, e.name));
    } else if (EXTS.has(extname(e.name))) {
      check(join(p, e.name));
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
];

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
    for (const [bad, what] of MOJIBAKE) {
      if (lines[i].includes(bad)) {
        problems.push(`${rel}:${i + 1}: mojibake ${what}`);
      }
    }
    for (const [bad, what] of MOJIBAKE_ALT) {
      if (lines[i].includes(bad)) {
        problems.push(`${rel}:${i + 1}: mojibake ${what}`);
      }
    }
    if (lines[i].includes("\t")) {
      problems.push(`${rel}:${i + 1}: contains a tab character`);
    }
  }
}

for (const p of SCAN) walk(p);

console.log(`${files} file(s) scanned`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems.slice(0, 40)) console.log("  " + p);
  if (problems.length > 40) console.log(`  ... and ${problems.length - 40} more`);
  process.exit(1);
}
console.log("✓ all files are LF, UTF-8 without BOM, no mojibake, no tabs");
