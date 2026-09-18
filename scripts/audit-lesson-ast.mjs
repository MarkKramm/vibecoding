/**
 * audit-lesson-ast.mjs — prove the lesson parser loses nothing.
 *
 * The AST parser's first invariant is "nothing is dropped". That is easy to
 * state and easy to violate: a construct the parser does not recognise can be
 * silently skipped, and the rendered page then simply says less than the
 * Markdown does. **No amount of reading the site would reliably catch it** —
 * the missing paragraph leaves no gap where it used to be.
 *
 * So this script compares the parser's output against the source, with markup
 * stripped from the source by an independent path, and reports the difference
 * per lesson.
 *
 * The comparison is a character MULTISET, not a sequence. Order is already
 * covered by the parser's own tests; what this guards is loss and duplication,
 * and a multiset catches both while tolerating the whitespace differences that
 * reflowing inevitably introduces.
 *
 * Usage:
 *   node scripts/audit-lesson-ast.mjs           # report, exit 1 on loss
 *   node scripts/audit-lesson-ast.mjs --verbose # per-lesson detail
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { ROOT, CONTENT_DIR, KNOWN_TRACKS, parseFrontMatter, splitSections } from './build-content.mjs';
import { parseLesson, astToPlainText } from './lesson-ast.mjs';

/**
 * Strip block and inline markup from source text by an independent path.
 *
 * Deliberately NOT reusing the parser. If this used the same code, a bug that
 * dropped a construct would drop it from both sides of the comparison and the
 * guard would pass on a broken parser — which is the classic way a check like
 * this becomes decoration.
 *
 * @param {string} markdown Raw lesson source.
 * @returns {string} Comparable plain text.
 */
function stripMarkup(markdown) {
  return String(markdown)
    .replace(/\r\n/g, '\n')
    // Fence delimiters carry no content; keep what is inside them.
    .replace(/^(```+|~~~+).*$/gm, '')
    // Heading markers.
    .replace(/^#{1,6}\s+/gm, '')
    // List markers, including task-list checkboxes.
    .replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    // Blockquote markers.
    .replace(/^\s*>\s?/gm, '')
    // Table pipes and separator rows.
    .replace(/^\s*\|?[\s:|-]+\|?\s*$/gm, '')
    .replace(/\|/g, ' ')
    // Inline code, bold, italic, links.
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Escaped pipes.
    .replace(/\\\|/g, '|');
}

/**
 * Count characters, ignoring whitespace.
 *
 * Whitespace is excluded because the parser legitimately reflows — joining a
 * wrapped paragraph, collapsing cell padding — and comparing whitespace would
 * report differences that are not losses.
 *
 * @param {string} text
 * @returns {Map<string, number>}
 */
function charCounts(text) {
  const counts = new Map();
  for (const char of text.replace(/\s+/g, '')) {
    counts.set(char, (counts.get(char) ?? 0) + 1);
  }
  return counts;
}

/** Find every phase file across all tracks. */
function findPhaseFiles() {
  const out = [];
  for (const meta of Object.values(KNOWN_TRACKS)) {
    const dir = join(CONTENT_DIR, meta.folder);
    if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) continue;
    for (const name of readdirSync(dir)) {
      if (/^\d+-phase-.*\.md$/.test(name)) out.push(join(dir, name));
    }
  }
  return out.sort();
}

/** Entry point. */
function main() {
  const verbose = process.argv.includes('--verbose');
  const files = findPhaseFiles();

  if (files.length === 0) {
    console.log('✓ lesson AST audit: no phase files yet, nothing to check');
    return;
  }

  let totalLoss = 0;
  let totalGain = 0;
  let worst = null;

  for (const file of files) {
    const rel = relative(ROOT, file).split(sep).join('/');
    const source = readFileSync(file, 'utf8');
    const { body, bodyStart } = parseFrontMatter(source);
    if (bodyStart === 0) continue; // no front-matter — build-content reports it

    const { sections } = splitSections(body, bodyStart);

    let lessonSection = null;
    for (const [title, section] of sections) {
      if (/^Lesson\b/.test(title)) {
        lessonSection = section;
        break;
      }
    }
    if (!lessonSection) continue; // build-content reports the missing lesson

    const lessonSource = lessonSection.lines.join('\n');
    const { blocks } = parseLesson(lessonSource);

    const expected = charCounts(stripMarkup(lessonSource));
    const actual = charCounts(astToPlainText(blocks));

    // Loss: characters in the source that no block carries. Gain: characters
    // the AST invented. Both are defects; loss is the dangerous one.
    let loss = 0;
    let gain = 0;
    const lostChars = [];

    for (const [char, count] of expected) {
      const got = actual.get(char) ?? 0;
      if (got < count) {
        loss += count - got;
        lostChars.push(`${JSON.stringify(char)}×${count - got}`);
      }
    }
    for (const [char, count] of actual) {
      const want = expected.get(char) ?? 0;
      if (count > want) gain += count - want;
    }

    totalLoss += loss;
    totalGain += gain;

    if (loss > 0 && (worst === null || loss > worst.loss)) {
      worst = { rel, loss, lostChars };
    }

    if (verbose) {
      const pct = ((1 - loss / Math.max(1, [...expected.values()].reduce((a, b) => a + b, 0))) * 100).toFixed(3);
      console.log(`  ${rel}`);
      console.log(`    ${blocks.length} blocks, ${pct}% of source characters represented, loss ${loss}, gain ${gain}`);
    }
  }

  console.log('');
  console.log(`✓ lesson AST audit: ${files.length} lesson(s) checked`);
  console.log(`  total character loss: ${totalLoss}`);
  console.log(`  total character gain: ${totalGain}`);

  if (worst) {
    console.log('');
    console.error(`✖ the parser is losing content — worst file: ${worst.rel}`);
    console.error(`  ${worst.loss} character(s) present in the Markdown but absent from the AST`);
    console.error(`  examples: ${worst.lostChars.slice(0, 12).join(', ')}`);
    console.error('');
    console.error('  A construct is being read as markup and dropped. Fix scripts/lesson-ast.mjs');
    console.error('  so it is carried as content, or make it a recognised block type.');
    process.exit(1);
  }

  if (totalGain > 0) {
    // Gain is suspicious but not automatically a bug: normalising a table row
    // can duplicate padding. Reported so a large number is investigated.
    console.warn(`  note: the AST carries ${totalGain} character(s) not present in the source — check for duplicated content`);
  }

  console.log('');
}

main();
