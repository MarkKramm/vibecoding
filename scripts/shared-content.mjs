/**
 * shared-content.mjs — build the standalone documents under `ai-roadmaps/shared/`.
 *
 * The shared folder holds documents that are part of the curriculum but are
 * not phase files: the study rules, the free resource list, the weekly tracker
 * template, and the glossary. `build-content.mjs`'s `*-phase-*.md` walk never
 * reaches them, so they are read here instead.
 *
 * Two shapes are emitted, because the documents genuinely differ:
 *
 *   kind: "doc"       — prose. Parsed into the lesson AST's own block shape, so
 *                       the site renders it with the component it already has.
 *   kind: "resources" — a catalogue. `Name — URL` lines become real anchors,
 *                       because `renderInline` handles bold, code and italic
 *                       only and deliberately does not autolink. As prose, a
 *                       resource list would be a wall of unclickable URLs.
 *   kind: "glossary"  — term/definition pairs, so the site can render a
 *                       searchable glossary rather than a wall of headings.
 *
 * The build FAILS rather than skipping quietly on a malformed document. An
 * unlinked resource far from its cause is a mystery; a named error at build
 * time is a five-second fix.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { parseLesson } from './lesson-ast.mjs';

/**
 * The shared documents, in the order the site should present them.
 *
 * Naming them explicitly rather than globbing means a file that is added but
 * not registered is visible in the build report as an unregistered document,
 * instead of silently appearing in the sidebar in filesystem order.
 */
const SHARED_DOCS = [
  {
    id: 'study-rules',
    file: 'study-rules.md',
    kind: 'doc',
    blurb: 'How to study this without burning out. Read this first, before any phase.',
  },
  {
    id: 'resource-list',
    file: 'resource-list.md',
    kind: 'resources',
    blurb: 'Every free resource the curriculum points at, in one place.',
  },
  {
    id: 'glossary',
    file: 'glossary.md',
    kind: 'glossary',
    blurb: 'Every term the curriculum introduces, defined in one sentence.',
  },
  {
    id: 'weekly-tracker-template',
    file: 'weekly-tracker-template.md',
    kind: 'doc',
    blurb: 'A blank week to copy, so planning takes two minutes rather than twenty.',
  },
];

/**
 * Read a `Name — URL` catalogue into grouped resources.
 *
 * @param {string} text The document source.
 * @param {string} file Path for error messages.
 * @param {string[]} problems Collector for malformed entries.
 * @returns {{groups: object[], count: number}}
 */
function parseResourceGroups(text, file, problems) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const groups = [];
  let current = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    const heading = line.match(/^##\s+(.*)$/);
    if (heading) {
      current = { heading: heading[1].trim(), blurb: '', resources: [] };
      groups.push(current);
      continue;
    }

    if (line.trim() === '' || line.startsWith('#')) continue;

    const item = line.replace(/^\s*[-*+]\s+/, '').replace(/^\s*\d+[.)]\s+/, '').trim();
    if (!item) continue;

    // A paragraph before the first bullet is the group's blurb.
    if (!/^\s*[-*+]/.test(line) && !/^\s*\d+[.)]/.test(line) && !/https?:\/\//.test(item)) {
      if (current && !current.blurb && current.resources.length === 0) {
        current.blurb = item;
      }
      continue;
    }

    const url = item.match(/https?:\/\/[^\s)>\]]+/);
    if (!url) {
      // A bullet with no URL in a catalogue is almost always a typo, and it
      // would render as unclickable text in a list the reader expects to click.
      if (/^\s*[-*+]/.test(line)) {
        problems.push(`${file}:${i + 1} — resource bullet has no URL: "${item.slice(0, 60)}"`);
      }
      continue;
    }

    const name = item
      .slice(0, url.index)
      .replace(/[—–\-:|]+\s*$/, '')
      .replace(/^\[|\]$/g, '')
      .trim();

    if (!current) {
      problems.push(`${file}:${i + 1} — resource appears before any "## " category heading: "${item.slice(0, 60)}"`);
      continue;
    }

    current.resources.push({ name: name || 'Resource', url: url[0] });
  }

  return { groups: groups.filter((g) => g.resources.length > 0), count: groups.reduce((n, g) => n + g.resources.length, 0) };
}

/**
 * Read a glossary into term/definition pairs.
 *
 * Accepted shapes, because a glossary is edited by hand over a long time and
 * reflowing every entry to one canonical form is churn:
 *
 *   - `**Term** — definition`
 *   - `**Term**: definition`
 *   - `### Term` followed by a paragraph
 *
 * @param {string} text The document source.
 * @param {string[]} problems Collector.
 * @param {string} file Path for error messages.
 * @returns {{terms: object[], categories: object[]}}
 */
function parseGlossary(text, file, problems) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const entries = [];
  const categories = [];

  let category = null;
  let pendingHeading = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    const h2 = line.match(/^##\s+(.*)$/);
    if (h2 && !/^###/.test(line)) {
      category = h2[1].trim();
      if (!categories.includes(category)) categories.push(category);
      continue;
    }

    const h3 = line.match(/^###\s+(.*)$/);
    if (h3) {
      pendingHeading = { term: h3[1].trim(), line: i + 1 };
      continue;
    }

    if (!line.trim()) continue;

    // `**Term** — definition` / `**Term**: definition`
    const inline = line.match(/^\s*[-*+]?\s*\*\*([^*]+)\*\*\s*[—–:-]\s*(.+)$/);
    if (inline) {
      entries.push({ term: inline[1].trim(), definition: inline[2].trim(), category });
      pendingHeading = null;
      continue;
    }

    // A paragraph immediately after `### Term`.
    if (pendingHeading) {
      entries.push({ term: pendingHeading.term, definition: line.trim(), category });
      pendingHeading = null;
      continue;
    }

    // Ordinary prose before any entry — allowed as an introduction. Prose
    // *between* entries is not, and is reported, because it means an entry
    // lost its bold term marker and now reads as an unlabelled sentence.
    if (entries.length > 0 && !line.startsWith('#') && !line.startsWith('|') && !line.startsWith('>')) {
      problems.push(`${file}:${i + 1} — glossary line is neither a term entry nor a heading: "${line.trim().slice(0, 60)}"`);
    }
  }

  return { terms: entries, categories };
}

/**
 * Build the shared documents bundle.
 *
 * @param {string} sharedDir Absolute path to `ai-roadmaps/shared`.
 * @param {string} root Repository root, for relative source paths.
 * @returns {{generatedAt: string, docs: object[]}}
 */
export function buildSharedDocs(sharedDir, root) {
  const problems = [];
  const docs = [];
  const registered = new Set(SHARED_DOCS.map((d) => d.file));

  for (const spec of SHARED_DOCS) {
    const path = join(sharedDir, spec.file);
    if (!statSync(path, { throwIfNoEntry: false })?.isFile()) {
      // Not a failure while the curriculum is being written: the shared folder
      // fills in over time, and a missing document is reported by the build
      // summary rather than blocking every phase from building.
      continue;
    }

    const text = readFileSync(path, 'utf8');
    const relPath = relative(root, path).split(sep).join('/');
    const titleMatch = text.match(/^#\s+(.*)$/m);
    const title = titleMatch ? titleMatch[1].trim() : spec.id;

    if (spec.kind === 'resources') {
      const { groups, count } = parseResourceGroups(text, relPath, problems);
      docs.push({ id: spec.id, kind: 'resources', title, blurb: spec.blurb, sourcePath: relPath, groups, resourceCount: count });
      continue;
    }

    if (spec.kind === 'glossary') {
      const { terms, categories } = parseGlossary(text, relPath, problems);
      docs.push({ id: spec.id, kind: 'glossary', title, blurb: spec.blurb, sourcePath: relPath, terms, categories, termCount: terms.length });
      continue;
    }

    // A prose document: skip the H1 (the site renders the title itself) and
    // parse the rest with the lesson parser, so `LessonBlock` renders it.
    const body = text.replace(/^#\s+.*$/m, '').trim();
    const parsed = parseLesson(body);
    for (const problem of parsed.unknown) {
      problems.push(`${relPath}:${problem.line ?? 0} — ${problem.detail}`);
    }
    docs.push({
      id: spec.id,
      kind: 'doc',
      title,
      blurb: spec.blurb,
      sourcePath: relPath,
      blocks: parsed.blocks,
      toc: parsed.toc,
      blockCount: parsed.stats.blockCount,
    });
  }

  // A Markdown file in the shared folder that is not registered is reported.
  // It would otherwise be invisible: present in the repository, absent from
  // the site, and nothing would say so.
  if (statSync(sharedDir, { throwIfNoEntry: false })?.isDirectory()) {
    for (const name of readdirSync(sharedDir)) {
      if (!name.endsWith('.md')) continue;
      if (registered.has(name)) continue;
      if (name === 'README.md') continue;
      problems.push(`ai-roadmaps/shared/${name} — not registered in SHARED_DOCS in scripts/shared-content.mjs, so it will not appear on the site`);
    }
  }

  if (problems.length > 0) {
    console.error(`\n✖ shared content build failed — ${problems.length} problem(s)\n`);
    for (const problem of problems) console.error(`  ${problem}`);
    console.error('\n  Register new documents in scripts/shared-content.mjs, and give every resource a URL.\n');
    process.exit(1);
  }

  return { generatedAt: new Date().toISOString(), docs };
}
