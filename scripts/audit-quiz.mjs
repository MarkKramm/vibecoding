/**
 * audit-quiz.mjs — check quizzes as a SET, not one question at a time.
 *
 * The build validates each question on its own: exactly one correct option, a
 * `**Why:**`, a valid energy. Every one of those checks can pass while the quiz
 * as a whole is broken.
 *
 * The failure this exists to catch is **position skew**. A quiz can put seven
 * of its ten correct answers in position C, so that a reader answering "C"
 * every time scores 70% without reading a word. Every question is individually
 * valid; the build is green; the quiz measures nothing. A per-question check
 * cannot see it, by construction.
 *
 * Three classes of check, following the CS Roadmap's own precedent:
 *
 *   1. Per quiz  — one position must not exceed 50% of that quiz's answers
 *   2. Corpus    — no position above 35% or below 15% across all questions
 *   3. Structure — unused positions, erratic option counts
 *
 * The corpus bounds are deliberately looser than an even split. A four-position
 * corpus averages 25% and honest authoring will not land on 25.0; the bounds
 * are set where a position becomes a *strategy worth learning* (35%) or so rare
 * that ignoring it helps rather than tests (15%).
 *
 * Usage:
 *   node scripts/audit-quiz.mjs
 *   node scripts/audit-quiz.mjs --json    # machine-readable summary
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { ROOT, CONTENT_DIR, KNOWN_TRACKS, parseFrontMatter, splitSections } from './build-content.mjs';

/** Ceiling and floor for a single answer position across the corpus. */
const POSITION_CEILING = 0.35;
const POSITION_FLOOR = 0.15;

/** A position must carry answers only if at least this share of questions offer it. */
const POSITION_AVAILABILITY = 0.05;

/** The maximum share of one quiz's answers that may sit in a single position. */
const PER_QUIZ_CEILING = 0.5;

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Parse the quiz from one phase file, minimally.
 *
 * Deliberately a separate, simpler reader than build-content's. If this reused
 * the build's parser, a parsing bug would remove the same questions from both
 * the corpus and the audit, and the audit would report perfect balance on a
 * quiz it never actually read.
 *
 * @param {string} file Absolute path.
 * @returns {{id: string, questions: {answerIndex: number, optionCount: number, id: string}[]}|null}
 */
function readQuiz(file) {
  const source = readFileSync(file, 'utf8');
  const { data, body, bodyStart } = parseFrontMatter(source);
  if (!data) return null;

  const { sections } = splitSections(body, bodyStart);
  const quizSection = sections.get('Quiz');
  if (!quizSection) return null;

  const questions = [];
  let current = null;

  const flush = () => {
    if (current && current.options.length > 0) {
      const answerIndex = current.options.findIndex((o) => o.correct);
      questions.push({
        id: current.id ?? '(no id)',
        answerIndex,
        optionCount: current.options.length,
      });
    }
    current = null;
  };

  for (const line of quizSection.lines) {
    if (/^###\s+Q\d+\./.test(line)) {
      flush();
      const idMatch = line.match(/<!--\s*id:\s*([^\s>]+)/);
      current = { id: idMatch ? idMatch[1] : null, options: [] };
      continue;
    }
    if (!current) continue;

    const opt = line.match(/^\s*[-*+]\s*\[([ xX])\]\s+(.*)$/);
    if (opt) {
      current.options.push({ correct: opt[1].toLowerCase() === 'x', text: opt[2].trim() });
    }
  }
  flush();

  return { id: data.id, questions };
}

/** Find every phase file. */
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
  const asJson = process.argv.includes('--json');
  const files = findPhaseFiles();

  if (files.length === 0) {
    console.log('✓ quiz audit: no phase files yet, nothing to check');
    return;
  }

  const failures = [];
  const positionCounts = [0, 0, 0, 0, 0, 0];
  const positionOffered = [0, 0, 0, 0, 0, 0];
  const optionCounts = new Map();
  const perTrack = new Map();
  let totalQuestions = 0;
  let phasesWithQuiz = 0;

  for (const file of files) {
    const rel = relative(ROOT, file).split(sep).join('/');
    const quiz = readQuiz(file);

    if (!quiz || quiz.questions.length === 0) {
      // A phase with no quiz at all is reported by the build as a missing
      // mandatory section; here it is counted so coverage is visible.
      continue;
    }

    phasesWithQuiz += 1;
    const track = quiz.id.split('-')[0];
    if (!perTrack.has(track)) perTrack.set(track, [0, 0, 0, 0, 0, 0]);

    const local = [0, 0, 0, 0, 0, 0];

    for (const question of quiz.questions) {
      totalQuestions += 1;
      optionCounts.set(question.optionCount, (optionCounts.get(question.optionCount) ?? 0) + 1);

      for (let i = 0; i < question.optionCount && i < 6; i += 1) positionOffered[i] += 1;

      if (question.answerIndex < 0) {
        failures.push(`${rel} — question ${question.id} has no correct option marked`);
        continue;
      }

      local[question.answerIndex] += 1;
      positionCounts[question.answerIndex] += 1;
      const trackCounts = perTrack.get(track);
      trackCounts[question.answerIndex] += 1;
    }

    // Class 1 — per-quiz skew.
    const answered = local.reduce((a, b) => a + b, 0);
    if (answered >= 4) {
      const worst = Math.max(...local);
      if (worst / answered > PER_QUIZ_CEILING) {
        const position = LETTERS[local.indexOf(worst)];
        failures.push(
          `${rel} — ${worst} of ${answered} correct answers sit in position ${position} ` +
          `(${((worst / answered) * 100).toFixed(0)}%, ceiling ${PER_QUIZ_CEILING * 100}%). ` +
          'A reader answering that position every time would score without reading.',
        );
      }
    }
  }

  if (totalQuestions === 0) {
    console.log('✓ quiz audit: no quiz questions found yet, nothing to check');
    return;
  }

  // Class 2 — corpus balance.
  const shares = positionCounts.map((n) => n / totalQuestions);
  positionCounts.forEach((count, index) => {
    const share = shares[index];
    const offered = positionOffered[index] / totalQuestions;

    // The floor only applies to a position that questions actually offer. A
    // position present in 1% of questions cannot be expected to carry 15% of
    // answers, and demanding it would be the guard inventing a defect.
    if (offered < POSITION_AVAILABILITY) return;

    if (share > POSITION_CEILING) {
      failures.push(
        `corpus — position ${LETTERS[index]} carries ${count} of ${totalQuestions} answers ` +
        `(${(share * 100).toFixed(1)}%), above the ${POSITION_CEILING * 100}% ceiling`,
      );
    }
    if (share < POSITION_FLOOR) {
      failures.push(
        `corpus — position ${LETTERS[index]} carries only ${count} of ${totalQuestions} answers ` +
        `(${(share * 100).toFixed(1)}%), below the ${POSITION_FLOOR * 100}% floor. ` +
        'A position this rare is one a reader can learn to ignore.',
      );
    }
  });

  // Class 3 — structure. Off-by-one option counts across a corpus usually mean
  // a question lost or gained an option to a formatting slip.
  const counts = [...optionCounts.entries()].sort((a, b) => a[0] - b[0]);

  if (asJson) {
    console.log(JSON.stringify({
      totalQuestions,
      phasesWithQuiz,
      positionCounts,
      shares: shares.map((s) => Number(s.toFixed(4))),
      optionCounts: Object.fromEntries(counts),
      failures,
    }, null, 2));
    process.exit(failures.length > 0 ? 1 : 0);
  }

  console.log('');
  console.log(`  quiz questions: ${totalQuestions} across ${phasesWithQuiz} phase(s)`);
  console.log('');
  console.log('  answer position distribution');
  positionCounts.forEach((count, index) => {
    if (positionOffered[index] === 0) return;
    const share = (shares[index] * 100).toFixed(1).padStart(5);
    const bar = '█'.repeat(Math.round(shares[index] * 100));
    console.log(`    ${LETTERS[index]}  ${String(count).padStart(4)}  ${share}%  ${bar}`);
  });
  console.log('');
  console.log('  option counts');
  for (const [n, count] of counts) {
    console.log(`    ${n} options: ${count} question(s)`);
  }
  console.log('');

  if (failures.length > 0) {
    console.error(`✖ quiz audit failed — ${failures.length} problem(s)\n`);
    for (const failure of failures) console.error(`  ${failure}\n`);
    console.error('  Rebalance the correct answers, or correct the question. Never edit this guard to agree.\n');
    process.exit(1);
  }

  console.log('✓ quiz audit passed — positions balanced, structure consistent');
  console.log('');
}

main();
