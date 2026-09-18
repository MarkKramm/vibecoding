// Verifies line endings and encoding across the site's own tracked files.
//
// WHY THIS IS A SCRIPT AND NOT A CONVENTION
// The project rule is LF-only, UTF-8, no BOM, and REAL typographic characters
// (em dash as U+2014, not "--"). Those rules are invisible in review: a CRLF file
// looks identical to an LF one in an editor, and a mojibake em dash only shows up
// as garbage in a console that may itself be lying about encoding. The failure
// mode is a diff that rewrites a whole file, or a page showing "â€”" to a reader.
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
const SCAN = [
  join(SITE, "src"),
  join(SITE, "scripts"),
  join(SITE, "docs"),
  join(SITE, "vite.config.js"),
  join(SITE, "index.html"),
  join(SITE, "package.json"),
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
// Each entry is the UTF-8 bytes of a typographic character that has been
// misread as Latin-1, decoded back into the string it wrongly produces.
// U+2014 em dash -> E2 80 94 -> "â€”", and so on.
const MOJIBAKE = [
  [String.fromCharCode(0xe2, 0x80, 0x94), "em dash"],
  [String.fromCharCode(0xe2, 0x80, 0x99), "right single quote"],
  [String.fromCharCode(0xe2, 0x80, 0x9c), "left double quote"],
  [String.fromCharCode(0xe2, 0x80, 0x9d), "right double quote"],
  [String.fromCharCode(0xc3, 0xa9), "e-acute"],
  [String.fromCharCode(0xc2, 0xa0), "non-breaking space"],
];

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
        problems.push(`${rel}:${i + 1}: mojibake ${what} (found "${bad}")`);
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
