/**
 * build-content.mjs — turn the Markdown curriculum into JSON the site reads.
 *
 * This is the enforcement point for docs/CONTENT-SCHEMA.md. It runs before
 * every `dev`, `build` and test, and it FAILS LOUDLY rather than skipping:
 * a phase that does not satisfy the contract stops the build with a file path
 * and a line number.
 *
 * Why fail rather than warn: every violation this script catches is one where
 * continuing produces a *plausible-looking* result that is wrong. A checklist
 * item whose id was minted from its position will silently re-attach a
 * learner's saved answer to a different question the next time a task is
 * inserted above it. Nothing about the rendered page would look broken. So the
 * only safe response is to stop.
 *
 * Usage:
 *   node scripts/build-content.mjs           # build everything
 *   node scripts/build-content.mjs --check   # build and report, no writes
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, dirname, basename, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseLesson } from './lesson-ast.mjs';
import { buildSearchIndex } from './search-index.mjs';
import { buildSharedDocs } from './shared-content.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, '..');
export const CONTENT_DIR = join(ROOT, 'ai-roadmaps');
export const OUT_DIR = join(ROOT, 'learning-site', 'src', 'data', 'generated');

/**
 * The tracks, in reading order.
 *
 * `id` is what appears in front-matter and in generated filenames. `label` is
 * what the site shows. `folder` is where the Markdown lives. Adding a track
 * means adding it here — a phase naming a track absent from this map is a
 * hard build failure, not a silently dropped file.
 */
export const KNOWN_TRACKS = {
  foundations: {
    label: 'Foundations',
    short: 'found',
    folder: 'foundations',
    blurb: 'The vocabulary and mental models everything else assumes.',
  },
  'model-internals': {
    label: 'Model Internals',
    short: 'intern',
    folder: 'model-internals',
    blurb: 'How inference actually works, and what it costs to run.',
  },
  prompting: {
    label: 'Prompting',
    short: 'prompt',
    folder: 'prompting',
    blurb: 'Getting what you want on purpose.',
  },
  rag: {
    label: 'Retrieval & RAG',
    short: 'rag',
    folder: 'rag',
    blurb: 'Giving a model knowledge it was not trained on.',
  },
  agents: {
    label: 'Agents & Tools',
    short: 'agent',
    folder: 'agents',
    blurb: 'Models that act, and how to keep them from acting badly.',
  },
  finetuning: {
    label: 'Finetuning & Evals',
    short: 'ft',
    folder: 'finetuning',
    blurb: 'Changing the model versus changing the prompt — and proving which helped.',
  },
  cost: {
    label: 'Cost & Efficiency',
    short: 'cost',
    folder: 'cost',
    blurb: 'Maximising capability per peso.',
  },
  vibecoding: {
    label: 'Vibecoding Craft',
    short: 'vibe',
    folder: 'vibecoding',
    blurb: 'Building real software with AI agents without being fooled.',
  },
  'safety-career': {
    label: 'Safety & Ethics',
    short: 'safe',
    folder: 'safety-career',
    blurb: 'Alignment, misuse, privacy, and using these tools honestly.',
  },
  career: {
    label: 'Career & Getting Hired',
    short: 'career',
    folder: 'career',
    blurb: 'Turning the skill into work: proof, portfolio, and the job hunt.',
  },
};

/** Sections that must exist in every phase file, in this order. */
const MANDATORY_SECTIONS = [
  'Goal of this phase',
  'Estimated time',
  "Skills you'll gain",
  'Tools for This Phase',
  'Free/cheap resources',
  'Hands-on practice tasks',
  'Deliverable / proof of work',
  'Checklist',
  'Quiz',
  "You're ready to move on when...",
  'Free vs Paid',
];

/** Energy values a task, checklist item or quiz question may carry. */
const VALID_ENERGY = new Set(['low', 'normal', 'high']);

/** Duration bands a practice task may carry. */
const VALID_BANDS = new Set(['quick', 'focused', 'deep', 'ongoing']);

/** Collects contract violations so every one is reported, not just the first. */
class BuildErrors {
  constructor() {
    this.errors = [];
  }

  /**
   * Record a violation.
   * @param {string} file Path relative to the repository root.
   * @param {number} line 1-based line number, or 0 when not line-specific.
   * @param {string} message What is wrong, phrased so the fix is obvious.
   */
  add(file, line, message) {
    this.errors.push({ file, line, message });
  }

  get length() {
    return this.errors.length;
  }

  /** Print every error and exit non-zero if any were collected. */
  report() {
    if (this.errors.length === 0) return;
    console.error(`\n✖ content build failed — ${this.errors.length} contract violation(s)\n`);
    for (const { file, line, message } of this.errors) {
      const where = line > 0 ? `${file}:${line}` : file;
      console.error(`  ${where}`);
      console.error(`    ${message}\n`);
    }
    console.error('  The contract is documented in docs/CONTENT-SCHEMA.md.\n');
    process.exit(1);
  }
}

/**
 * Parse the YAML front-matter at the top of a phase file.
 *
 * Deliberately a small hand-rolled reader rather than a YAML dependency: the
 * front-matter here uses a fixed, narrow subset (scalars, inline arrays, one
 * folded block scalar), and adding a parser dependency to read ten known keys
 * would make the content unreadable without an install — which the project's
 * own rules forbid.
 *
 * @param {string} source The whole file.
 * @returns {{ data: object, bodyStart: number, body: string }} Parsed fields,
 *   the 0-based line index where the body begins, and the body itself.
 */
export function parseFrontMatter(source) {
  const text = source.replace(/\r\n/g, '\n');
  const lines = text.split('\n');

  if (lines[0].trim() !== '---') return { data: null, bodyStart: 0, body: text };

  let end = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === '---') {
      end = i;
      break;
    }
  }
  if (end === -1) return { data: null, bodyStart: 0, body: text };

  const data = {};
  let i = 1;
  while (i < end) {
    const line = lines[i];
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);

    if (!match) {
      i += 1;
      continue;
    }

    const key = match[1];
    let value = match[2].trim();

    // A folded block scalar: `key: >` then indented lines joined by spaces.
    if (value === '>' || value === '|') {
      const parts = [];
      const keepNewlines = value === '|';
      i += 1;
      while (i < end && (/^\s+\S/.test(lines[i]) || lines[i].trim() === '')) {
        parts.push(lines[i].trim());
        i += 1;
      }
      data[key] = keepNewlines ? parts.join('\n').trim() : parts.join(' ').trim();
      continue;
    }

    // An inline array: `[low, normal]`.
    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((entry) => entry.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      i += 1;
      continue;
    }

    // A quoted or bare scalar.
    data[key] = value.replace(/^["']|["']$/g, '');
    i += 1;
  }

  return { data, bodyStart: end + 1, body: lines.slice(end + 1).join('\n') };
}

/**
 * Split a document into `##` sections, tracking fenced code blocks.
 *
 * Fence tracking is not a nicety. A lesson routinely quotes a document that
 * contains its own `##` headings — a prompt template, a JSON payload, an API
 * response. Without tracking, those quoted headings are read as real structure
 * and the quoted `## Checklist` is taken as *the* checklist section, which
 * fails the build with an error naming a heading the author can plainly see is
 * not the one being complained about.
 *
 * @param {string} body The document after front-matter.
 * @param {number} lineOffset Lines consumed before `body`, so reported line
 *   numbers refer to the real file.
 * @returns {{ sections: Map<string, {lines: string[], start: number}>, order: string[], fenceError: object|null }}
 */
export function splitSections(body, lineOffset = 0) {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const sections = new Map();
  const order = [];
  let current = null;
  let fenceMarker = null;
  let fenceStart = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const fence = raw.match(/^(```+|~~~+)/);

    if (fence) {
      const marker = fence[1][0].repeat(3);
      if (fenceMarker === null) {
        fenceMarker = marker;
        fenceStart = i + lineOffset + 1;
      } else if (raw.trimEnd().startsWith(fenceMarker)) {
        fenceMarker = null;
      }
      if (current) current.lines.push(raw);
      continue;
    }

    // Only an unfenced `## ` line starts a section. `###` and deeper belong to
    // whatever section they are inside.
    if (fenceMarker === null && /^##\s+/.test(raw)) {
      const title = raw.replace(/^##\s+/, '').trim();
      // A lesson heading can legitimately repeat; key by title, first wins,
      // because the schema defines one section per title.
      if (!sections.has(title)) {
        current = { lines: [], start: i + lineOffset + 1 };
        sections.set(title, current);
        order.push(title);
      } else {
        current = sections.get(title);
      }
      continue;
    }

    if (current) current.lines.push(raw);
  }

  const fenceError =
    fenceMarker !== null
      ? {
          line: fenceStart,
          detail: `code fence opened at line ${fenceStart} was never closed, so everything after it was read as code and ${order.length === 0 ? 'no sections were found' : 'later sections were hidden'}`,
        }
      : null;

  return { sections, order, fenceError };
}

/** Extract plain text from section lines, collapsing to a single paragraph. */
function sectionText(section) {
  if (!section) return '';
  return section.lines
    .join('\n')
    .split(/\n\s*\n/)
    .map((para) => para.trim())
    .filter(Boolean)[0]
    ?.replace(/\s+/g, ' ')
    .trim() ?? '';
}

/** Extract bullet strings from a section. */
function sectionBullets(section) {
  if (!section) return [];
  const out = [];
  for (const line of section.lines) {
    const match = line.match(/^\s*[-*+]\s+(.*)$/);
    if (match) out.push(match[1].trim());
  }
  return out;
}

/** Extract numbered strings from a section. */
function sectionNumbered(section) {
  if (!section) return [];
  const out = [];
  for (const line of section.lines) {
    const match = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (match) out.push(match[1].trim());
  }
  return out;
}

/**
 * Parse one row of a `## Tools for This Phase` table.
 *
 * Positional, not header-driven, and that is deliberate: a header-driven parse
 * would silently accept a reordered table and map the wrong column to the
 * wrong field. Positional parsing fails on a corrupted row instead, which is
 * the outcome that gets fixed.
 *
 * @param {string[]} cells The row's cells.
 * @returns {{ name, purpose, cost, url, task, freeAlternative }|null}
 */
export function parseToolRow(cells) {
  if (cells.length < 6) return null;
  const [name, purpose, cost, url, task, freeAlternative] = cells;
  return { name, purpose, cost, url, task, freeAlternative };
}

/**
 * Read the `## Free/cheap resources` section.
 *
 * Accepts `Name — URL`, `Name - URL`, a bare URL, or a bulleted link. The
 * corpus is authored by hand, and an overly strict reader here would reject
 * text a human reads correctly.
 *
 * @param {object|undefined} section The section block.
 * @returns {{name: string, url: string}[]}
 */
export function parseResources(section) {
  if (!section) return [];
  const out = [];

  for (const line of section.lines) {
    const text = line.replace(/^\s*[-*+]\s+/, '').replace(/^\s*\d+[.)]\s+/, '').trim();
    if (!text || text.startsWith('|') || text.startsWith('#')) continue;

    const url = text.match(/https?:\/\/[^\s)>\]]+/);
    if (!url) continue;

    // Everything before the URL, minus a trailing separator, is the name.
    const name = text
      .slice(0, url.index)
      .replace(/[—–\-:|]+\s*$/, '')
      .replace(/^\[|\]$/g, '')
      .trim();

    out.push({ name: name || 'Resource', url: url[0] });
  }

  return out;
}

/**
 * Parse practice tasks, reading the trailing id/band/energy comment.
 *
 * The field ORDER is enforced rather than tolerated. A reordered comment means
 * the author and the parser disagree about what the fields are, and guessing
 * would attach a duration band to an id — producing a task that is offered to
 * the wrong person at the wrong time, with nothing visibly wrong on the page.
 *
 * @param {object|undefined} section The section block.
 * @param {string} phaseId The owning phase, used to mint fallback ids.
 * @param {BuildErrors} errors Collector.
 * @param {string} file Path for error messages.
 * @returns {{tasks: object[], minted: number, missingBand: number}}
 */
export function parseTasks(section, phaseId, errors, file) {
  const tasks = [];
  let minted = 0;
  let missingBand = 0;

  if (!section) return { tasks, minted, missingBand };

  let index = 0;
  for (let i = 0; i < section.lines.length; i += 1) {
    const line = section.lines[i];
    const match = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (!match) continue;

    index += 1;
    let text = match[1].trim();
    let id = null;
    let band = null;
    let energy = null;

    const comment = text.match(/<!--\s*id:\s*([^\s>]+)([^>]*)-->\s*$/);
    if (comment) {
      text = text.slice(0, comment.index).trim();
      id = comment[1];
      const rest = comment[2].trim();

      // Enforce id, then band, then energy — in that order.
      //
      // Matched as `key: value` pairs rather than split on whitespace, because
      // the authored form is `band: quick` — the space after the colon is part
      // of the syntax, and a whitespace split reads the value as a field name.
      const pairs = [...rest.matchAll(/(band|energy):\s*([^\s]+)/g)];
      const expectedOrder = ['band', 'energy'];

      for (let f = 0; f < pairs.length; f += 1) {
        const key = pairs[f][1];
        if (key !== expectedOrder[f]) {
          errors.add(file, section.start + i, `practice task comment field ${f + 1} is "${key}:" but must be "${expectedOrder[f]}:" — the order is fixed as id, band, energy`);
          break;
        }
        if (key === 'band') band = pairs[f][2];
        else energy = pairs[f][2];
      }

      // A field present but unmatched by the pattern means a typo (e.g.
      // `bands:`), which would otherwise drop the value in silence.
      const recognised = pairs.reduce((n, p) => n + p[0].length, 0);
      const stripped = rest.replace(/\s+/g, ' ').trim();
      const covered = pairs.map((p) => p[0]).join(' ').trim();
      if (stripped && covered !== stripped) {
        errors.add(file, section.start + i, `practice task comment has unrecognised content "${stripped}" — expected exactly "band: <band> energy: <energy>" (found ${recognised} of ${stripped.length} characters)`);
      }
    } else {
      // Mint from position. Counted, never silent — see CONTENT-SCHEMA.md.
      minted += 1;
      id = `${phaseId}-t${String(index).padStart(2, '0')}`;
    }

    if (!band) {
      missingBand += 1;
    } else if (!VALID_BANDS.has(band)) {
      errors.add(file, section.start + i, `practice task band "${band}" is not one of quick, focused, deep, ongoing`);
    }

    if (energy && !VALID_ENERGY.has(energy)) {
      errors.add(file, section.start + i, `practice task energy "${energy}" is not one of low, normal, high`);
    }

    tasks.push({ id, text, band, energy });
  }

  return { tasks, minted, missingBand };
}

/**
 * Parse the checklist, requiring an authored id on every item.
 *
 * Unlike practice tasks there is no positional fallback. A checklist item's id
 * is the key a learner's tick is stored against; minting one from position is
 * exactly the failure this contract exists to prevent, so a missing id is an
 * error rather than a mint.
 */
export function parseChecklist(section, errors, file, seenIds) {
  const checklist = [];
  if (!section) return checklist;

  for (let i = 0; i < section.lines.length; i += 1) {
    const line = section.lines[i];
    const match = line.match(/^\s*[-*+]\s*\[[ xX]\]\s+(.*)$/);
    if (!match) continue;

    let text = match[1].trim();
    const comment = text.match(/<!--\s*id:\s*([^\s>]+)([^>]*)-->\s*$/);

    if (!comment) {
      errors.add(file, section.start + i, 'checklist item has no <!-- id: ... --> comment — every item needs an authored id so a saved tick cannot move to a different item');
      continue;
    }

    const id = comment[1];
    text = text.slice(0, comment.index).trim();

    const energyMatch = comment[2].match(/energy:\s*(\S+)/);
    const energy = energyMatch ? energyMatch[1] : null;

    if (energy && !VALID_ENERGY.has(energy)) {
      errors.add(file, section.start + i, `checklist energy "${energy}" is not one of low, normal, high`);
    }

    if (seenIds.has(id)) {
      errors.add(file, section.start + i, `duplicate checklist id "${id}" — ids must be globally unique because a tick is stored against the id, so a collision shows progress on one phase against another`);
    }
    seenIds.add(id);

    checklist.push({ id, text, energy });
  }

  return checklist;
}

/**
 * Parse the quiz.
 *
 * Every rule here is checked because a malformed quiz is worse than an absent
 * one: it asserts that a wrong answer is right. See CONTENT-SCHEMA.md.
 */
export function parseQuiz(section, phaseId, errors, file, seenIds) {
  const quiz = [];
  if (!section) return quiz;

  let current = null;
  const flush = () => {
    if (!current) return;
    const marks = current.options.filter((o) => o.correct).length;

    if (current.options.length < 3) {
      errors.add(file, current.line, `quiz ${current.id} has ${current.options.length} option(s); at least 3 are required`);
    }
    if (marks === 0) {
      errors.add(file, current.line, `quiz ${current.id} has no correct option — mark exactly one option with [x]`);
    }
    if (marks > 1) {
      errors.add(file, current.line, `quiz ${current.id} marks ${marks} correct options; exactly one is allowed`);
    }
    if (!current.why) {
      errors.add(file, current.line, `quiz ${current.id} has no **Why:** line — the explanation is what turns a wrong answer into a lesson`);
    }
    if (!current.id) {
      errors.add(file, current.line, `quiz question "${current.question.slice(0, 40)}…" has no <!-- id: ... --> comment`);
    } else if (seenIds.has(current.id)) {
      errors.add(file, current.line, `duplicate quiz id "${current.id}"`);
    }
    if (current.id) seenIds.add(current.id);

    if (current.id && current.question) {
      quiz.push({
        id: current.id,
        question: current.question,
        options: current.options.map((o) => o.text),
        answerIndex: current.options.findIndex((o) => o.correct),
        why: current.why,
        energy: current.energy,
      });
    }
    current = null;
  };

  for (let i = 0; i < section.lines.length; i += 1) {
    const line = section.lines[i];
    const qMatch = line.match(/^###\s+Q\d+\.\s*(.*)$/);

    if (qMatch) {
      flush();
      let text = qMatch[1].trim();
      let id = null;
      let energy = null;

      const comment = text.match(/<!--\s*id:\s*([^\s>]+)([^>]*)-->\s*$/);
      if (comment) {
        id = comment[1];
        text = text.slice(0, comment.index).trim();
        const energyMatch = comment[2].match(/energy:\s*(\S+)/);
        energy = energyMatch ? energyMatch[1] : null;
      }

      if (energy && !VALID_ENERGY.has(energy)) {
        errors.add(file, section.start + i, `quiz energy "${energy}" is not one of low, normal, high`);
      }

      current = { id, energy, question: text, options: [], why: null, line: section.start + i };
      continue;
    }

    if (!current) continue;

    const optMatch = line.match(/^\s*[-*+]\s*\[([ xX])\]\s+(.*)$/);
    if (optMatch) {
      current.options.push({ correct: optMatch[1].toLowerCase() === 'x', text: optMatch[2].trim() });
      continue;
    }

    const whyMatch = line.match(/^\s*\*\*Why:\*\*\s*(.*)$/);
    if (whyMatch) {
      current.why = whyMatch[1].trim();
      continue;
    }

    // A non-empty line after options that is not a Why is an authoring slip
    // worth reporting: it usually means the explanation was written as prose
    // and will not be picked up.
    if (current.options.length > 0 && !current.why && line.trim() && !line.startsWith('#')) {
      // Tolerated, but only until the flush check reports the missing Why.
    }
  }

  flush();

  // Prose with no parseable questions is an error, not an empty quiz: the
  // section exists, so something in it was meant to be a question.
  const hasProse = section.lines.some((l) => l.trim() && !l.startsWith('###') && !l.startsWith('|'));
  if (quiz.length === 0 && hasProse) {
    errors.add(file, section.start, 'quiz section has content but no parseable questions — each question must be a `### Q<n>.` heading');
  }

  return quiz;
}

/** Parse the three `###` sub-sections of `## Free vs Paid`. */
function parseFreeVsPaid(section) {
  const out = { freeEnough: '', paidUpgrade: '', whenWorthPaying: '' };
  if (!section) return out;

  let key = null;
  const buckets = { freeEnough: [], paidUpgrade: [], whenWorthPaying: [] };

  for (const line of section.lines) {
    const heading = line.match(/^###\s+(.*)$/);
    if (heading) {
      const title = heading[1].toLowerCase();
      if (title.includes('free')) key = 'freeEnough';
      else if (title.includes('upgrade') || title.includes('paid')) key = 'paidUpgrade';
      else if (title.includes('pay') || title.includes('worth')) key = 'whenWorthPaying';
      continue;
    }
    if (key && line.trim()) buckets[key].push(line.trim());
  }

  for (const k of Object.keys(out)) {
    out[k] = buckets[k].join(' ').replace(/\s+/g, ' ').trim();
  }
  return out;
}

/** Parse the optional `## Specific topics to learn`-style sections. */
function parseTopics(sections) {
  const topics = [];
  for (const [title, section] of sections) {
    if (!/^Specific topics/i.test(title)) continue;
    let group = null;
    for (const line of section.lines) {
      const sub = line.match(/^###\s+(.*)$/);
      if (sub) {
        group = { heading: sub[1].trim(), items: [] };
        topics.push(group);
        continue;
      }
      const item = line.match(/^\s*[-*+]\s+(.*)$/);
      if (item) {
        if (!group) {
          group = { heading: title, items: [] };
          topics.push(group);
        }
        group.items.push(item[1].trim());
      }
    }
  }
  return topics;
}

/**
 * Build one phase object from a source file.
 *
 * @param {string} filePath Absolute path to the Markdown file.
 * @param {string} trackId The track this file belongs to.
 * @param {Set<string>} seenPhaseIds Global phase-id set, for collision checks.
 * @param {Set<string>} seenItemIds Global checklist/quiz-id set.
 * @param {BuildErrors} errors Collector.
 * @returns {object|null} The phase, or null when it could not be built.
 */
export function buildPhase(filePath, trackId, seenPhaseIds, seenItemIds, errors) {
  const rel = relative(ROOT, filePath).split(sep).join('/');
  const source = readFileSync(filePath, 'utf8');
  const { data: fm, body, bodyStart } = parseFrontMatter(source);

  if (!fm) {
    errors.add(rel, 1, 'phase file has no YAML front-matter — every phase needs an id, track, phase, order and title');
    return null;
  }

  const track = KNOWN_TRACKS[trackId];

  // Front-matter sanity. Each of these has a specific downstream consequence,
  // which is what makes it worth a hard failure.
  if (!fm.id) errors.add(rel, 1, 'front-matter is missing "id"');
  if (!fm.title) errors.add(rel, 1, 'front-matter is missing "title"');
  if (!fm.track) {
    errors.add(rel, 1, 'front-matter is missing "track"');
  } else if (!KNOWN_TRACKS[fm.track]) {
    errors.add(rel, 1, `front-matter track "${fm.track}" is not a known track — add it to KNOWN_TRACKS in scripts/build-content.mjs, or correct the typo. A phase naming an unknown track would render nowhere.`);
  } else if (fm.track !== trackId) {
    errors.add(rel, 1, `front-matter track "${fm.track}" does not match the folder it lives in ("${trackId}")`);
  }

  if (fm.id) {
    if (seenPhaseIds.has(fm.id)) {
      errors.add(rel, 1, `duplicate phase id "${fm.id}" — ids are the identity of a phase, so a collision makes two phases share progress`);
    }
    seenPhaseIds.add(fm.id);
  }

  const phaseNum = Number(fm.phase);
  if (!Number.isFinite(phaseNum)) errors.add(rel, 1, 'front-matter "phase" must be a number');

  const { sections, fenceError } = splitSections(body, bodyStart);
  if (fenceError) errors.add(rel, fenceError.line, fenceError.detail);

  // Missing mandatory sections, reported for every one rather than the first,
  // so a new phase file is fixed in one pass instead of eleven.
  for (const name of MANDATORY_SECTIONS) {
    if (!sections.has(name)) {
      errors.add(rel, 1, `missing mandatory section "## ${name}"`);
    }
  }

  // The lesson is found by prefix, because its title is authored.
  let lessonSection = null;
  let lessonTitle = '';
  for (const [title, section] of sections) {
    if (/^Lesson\b/.test(title)) {
      lessonSection = section;
      lessonTitle = title.replace(/^Lesson:?\s*/, '').trim() || 'Lesson';
      break;
    }
  }
  if (!lessonSection) {
    errors.add(rel, 1, 'missing the "## Lesson: <title>" section — this is the part that teaches');
  }

  let lesson = { blocks: [], toc: [], unknown: [], stats: { blockCount: 0, headingCount: 0 } };
  let lessonWords = 0;
  if (lessonSection) {
    const lessonBody = lessonSection.lines.join('\n');
    lesson = parseLesson(lessonBody);
    lessonWords = lessonBody
      .replace(/```[\s\S]*?```/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;

    for (const problem of lesson.unknown) {
      errors.add(rel, lessonSection.start + (problem.line ?? 0), `lesson parse: ${problem.detail}`);
    }
  }

  // Tools table.
  const tools = [];
  const toolsSection = sections.get('Tools for This Phase');
  if (toolsSection) {
    const rows = toolsSection.lines.filter((l) => /^\s*\|/.test(l));
    // Row 0 is the header, row 1 the separator.
    for (let r = 2; r < rows.length; r += 1) {
      const cells = rows[r]
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((c) => c.trim());
      const tool = parseToolRow(cells);
      if (!tool) {
        errors.add(rel, toolsSection.start + r, `tools table row has ${cells.length} column(s); 6 are required (Tool, Purpose, Cost, Link, Task, Free alternative)`);
        continue;
      }
      // A paid tool with no free alternative is unusable on this curriculum's
      // budget, which is the whole reason the column exists.
      const isPaid = /paid|freemium|subscription|\$|per month|\/mo/i.test(tool.cost) && !/free/i.test(tool.cost);
      if (isPaid && !tool.freeAlternative) {
        errors.add(rel, toolsSection.start + r, `tool "${tool.name}" is listed as paid ("${tool.cost}") with no free alternative — this curriculum is $0-budget, so every paid row must name one`);
      }
      if (tool.name && !/^-+$/.test(tool.name)) tools.push(tool);
    }
  }

  const checklist = parseChecklist(sections.get('Checklist'), errors, rel, seenItemIds);
  const quiz = parseQuiz(sections.get('Quiz'), fm.id ?? '', errors, rel, seenItemIds);
  const { tasks, minted, missingBand } = parseTasks(
    sections.get('Hands-on practice tasks'),
    fm.id ?? '',
    errors,
    rel,
  );

  // Report rather than fail: a task without a band still runs, it just cannot
  // be scheduled. Counted so the drift is visible instead of invisible.
  if (missingBand > 0) {
    process.stderr.write(
      `  note: ${rel} has ${missingBand} practice task(s) without a band — they will never be offered by the time-budget picker\n`,
    );
  }

  return {
    id: fm.id ?? basename(filePath, '.md'),
    order: Number(fm.order) || (Number.isFinite(phaseNum) ? phaseNum * 10 : 0),
    phase: Number.isFinite(phaseNum) ? phaseNum : 0,
    title: fm.title ?? 'Untitled',
    duration: fm.duration ?? sectionText(sections.get('Estimated time')),
    durationWeeks: Number(fm.duration_weeks) || 0,
    energyMix: Array.isArray(fm.energy_mix) ? fm.energy_mix : [],
    goal: sectionText(sections.get('Goal of this phase')),
    skills: sectionBullets(sections.get("Skills you'll gain")),
    topics: parseTopics(sections),
    tools,
    resources: parseResources(sections.get('Free/cheap resources')),
    tasks,
    deliverableItems: sectionBullets(sections.get('Deliverable / proof of work')),
    deliverable: fm.deliverable ?? '',
    checklist,
    quiz,
    lessonTitle,
    lessonPath: `lessons/${fm.id}.json`,
    lessonWordCount: lessonWords,
    lessonBlockCount: lesson.stats.blockCount,
    lessonHeadingCount: lesson.stats.headingCount,
    exitCriteria: fm.exit_criteria || sectionText(sections.get("You're ready to move on when...")),
    freeVsPaid: parseFreeVsPaid(sections.get('Free vs Paid')),
    sourcePath: rel,
    _lesson: lesson,
    _minted: minted,
  };
}

/** Find every `NN-phase-*.md` file in a track folder, ordered by numeric prefix. */
function findPhaseFiles(dir) {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return [];
  return readdirSync(dir)
    .filter((name) => /^\d+-phase-.*\.md$/.test(name))
    .sort((a, b) => Number(a.slice(0, a.indexOf('-'))) - Number(b.slice(0, b.indexOf('-'))))
    .map((name) => join(dir, name));
}

/** Find every Markdown file in a track folder that is not a phase file. */
function findExtraDocs(dir) {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md') && !/^\d+-phase-.*\.md$/.test(name))
    .map((name) => join(dir, name));
}

/** Remove generated output so a deleted phase cannot linger in the bundle. */
function cleanOutDir() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(join(OUT_DIR, 'lessons'), { recursive: true });
}

/** Entry point. */
function main() {
  const checkOnly = process.argv.includes('--check');
  const errors = new BuildErrors();

  const seenPhaseIds = new Set();
  const seenItemIds = new Set();
  const trackOutputs = {};
  const allPhases = [];
  const lessons = new Map();
  let totalMinted = 0;
  let totalBandless = 0;

  for (const [trackId, meta] of Object.entries(KNOWN_TRACKS)) {
    const dir = join(CONTENT_DIR, meta.folder);
    const files = findPhaseFiles(dir);

    if (files.length === 0) {
      // A track with no phases yet is reported, not failed: the curriculum is
      // being built track by track and a half-built track is the normal case.
      process.stderr.write(`  note: track "${trackId}" has no phase files yet\n`);
      continue;
    }

    const phases = [];
    for (const file of files) {
      const phase = buildPhase(file, trackId, seenPhaseIds, seenItemIds, errors);
      if (!phase) continue;
      totalMinted += phase._minted;
      totalBandless += phase.tasks.filter((t) => !t.band).length;
      lessons.set(phase.id, {
        id: phase.id,
        title: phase.lessonTitle,
        blocks: phase._lesson.blocks,
        toc: phase._lesson.toc,
      });
      delete phase._lesson;
      delete phase._minted;
      phases.push(phase);
      allPhases.push({ ...phase, track: trackId });
    }

    phases.sort((a, b) => a.order - b.order);
    trackOutputs[trackId] = {
      track: trackId,
      label: meta.label,
      blurb: meta.blurb,
      generatedAt: new Date().toISOString(),
      phaseCount: phases.length,
      phases,
    };
  }

  // Every error is collected before exiting, so one run fixes the whole file.
  errors.report();

  if (checkOnly) {
    console.log(`✓ content build check passed — ${allPhases.length} phase(s) across ${Object.keys(trackOutputs).length} track(s)`);
    return;
  }

  cleanOutDir();

  for (const [trackId, output] of Object.entries(trackOutputs)) {
    writeFileSync(join(OUT_DIR, `${trackId}.json`), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  }

  for (const [id, lesson] of lessons) {
    writeFileSync(join(OUT_DIR, 'lessons', `${id}.json`), `${JSON.stringify(lesson)}\n`, 'utf8');
  }

  writeFileSync(join(OUT_DIR, 'tracks.json'), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    tracks: Object.entries(KNOWN_TRACKS).map(([id, meta]) => ({
      id,
      label: meta.label,
      blurb: meta.blurb,
      folder: meta.folder,
      phaseCount: trackOutputs[id]?.phaseCount ?? 0,
    })),
  }, null, 2)}\n`, 'utf8');

  const search = buildSearchIndex(lessons);
  writeFileSync(join(OUT_DIR, 'search.json'), `${JSON.stringify(search)}\n`, 'utf8');

  const shared = buildSharedDocs(join(CONTENT_DIR, 'shared'), ROOT);
  writeFileSync(join(OUT_DIR, 'shared.json'), `${JSON.stringify(shared, null, 2)}\n`, 'utf8');

  // The build report. These counts are printed rather than assumed because
  // each one is a drift signal: a non-zero minted count or bandless count
  // means the corpus has quietly diverged from the contract.
  const totalTasks = allPhases.reduce((n, p) => n + p.tasks.length, 0);
  const totalChecks = allPhases.reduce((n, p) => n + p.checklist.length, 0);
  const totalQuiz = allPhases.reduce((n, p) => n + p.quiz.length, 0);
  const totalWords = allPhases.reduce((n, p) => n + p.lessonWordCount, 0);

  console.log('✓ content build complete\n');
  console.log(`  tracks:        ${Object.keys(trackOutputs).length}`);
  console.log(`  phases:        ${allPhases.length}`);
  console.log(`  lesson words:  ${totalWords.toLocaleString('en-US')}`);
  console.log(`  checklist:     ${totalChecks}`);
  console.log(`  quiz qs:       ${totalQuiz}`);
  console.log(`  practice:      ${totalTasks}`);
  console.log(`  task ids:      ${totalMinted} minted from position, ${totalTasks - totalMinted} authored`);
  console.log(`  task bands:    ${totalTasks - totalBandless} banded, ${totalBandless} without a band`);
  console.log(`  search terms:  ${search.termCount.toLocaleString('en-US')} across ${search.segments.length} segments`);
  console.log(`  shared docs:   ${shared.docs.length}\n`);

  if (totalMinted > 0) {
    console.warn(`  ⚠ ${totalMinted} practice task id(s) were minted from position. Author an <!-- id: ... --> comment on each — a minted id can move to a different task when one is inserted above it.\n`);
  }
}

main();
