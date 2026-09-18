/**
 * lesson-ast.mjs — parse a Markdown lesson into a renderable block AST.
 *
 * The site never renders raw Markdown. A build step parses each lesson into an
 * array of typed blocks and the UI renders those, which keeps the renderer
 * small and makes "did we lose any content?" a question a script can answer.
 *
 * Two invariants, both load-bearing:
 *
 *   1. NOTHING IS DROPPED. A line matching no known block becomes a paragraph.
 *      A construct the parser cannot classify is pushed to `unknown`, which
 *      fails the build. A silently missing paragraph is the one bug a reader
 *      cannot detect — the lesson simply appears to say less than it does.
 *
 *   2. HEADING IDS ARE UNIQUE. Duplicates get a numeric suffix, so a table of
 *      contents never links two entries to the same anchor. Without this, the
 *      second "Part 1" is unreachable from the TOC and the first one scrolls
 *      to the wrong place.
 *
 * The supported subset is deliberately small — headings, paragraphs, lists,
 * tables, fences, quotes — because it was measured against this corpus rather
 * than guessed at. Supporting CommonMark in full would mean a dependency, and
 * the corpus does not need one.
 */

/** A heading line: `### Title`, `#### Title`, `##### Title`. */
const RE_HEADING = /^(#{3,5})\s+(.*)$/;

/** A fenced code block delimiter, with an optional language. */
const RE_FENCE = /^(```+|~~~+)\s*([A-Za-z0-9_+-]*)\s*$/;

/** A bullet list item, `-`, `*` or `+`, with optional indentation. */
const RE_BULLET = /^(\s*)([-*+])\s+(.*)$/;

/** An ordered list item, `1.` or `1)`. */
const RE_ORDERED = /^(\s*)(\d+)[.)]\s+(.*)$/;

/** A table alignment or content row. */
const RE_TABLE_ROW = /^\s*\|.*\|\s*$/;

/** A table separator row such as `|---|---|`. */
const RE_TABLE_SEP = /^\s*\|[\s:|-]+\|\s*$/;

/** The marker that opens a callout blockquote. */
const RE_QUOTE = /^\s*>\s?(.*)$/;

/**
 * Turn heading text into a URL-safe anchor id.
 *
 * Kept intentionally close to GitHub's algorithm so a link that works on
 * GitHub works in the site and vice versa. The rules: lowercase, drop
 * punctuation that is not a word character, hyphen or space, then collapse
 * whitespace runs to single hyphens.
 *
 * @param {string} text Heading text, possibly with inline markdown.
 * @returns {string} A slug. Never empty — falls back to "section".
 */
export function slugify(text) {
  const slug = String(text)
    // Inline code and emphasis markers are markup, not part of the name.
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .toLowerCase()
    .trim()
    // Keep letters, numbers, spaces, hyphens and underscores. \p{L} matters:
    // dropping it would turn any non-Latin heading into an empty slug.
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'section';
}

/**
 * Split a table row into cells.
 *
 * A naive `|` split breaks on an escaped pipe (`\|`) and on a pipe inside
 * inline code, both of which appear in this corpus — a lesson quoting a shell
 * pipeline inside a table cell is the common case. Escaped pipes are unescaped
 * after splitting so the cell text reads as authored.
 *
 * @param {string} line A raw table row line.
 * @returns {string[]} The cell texts, trimmed.
 */
export function splitTableRow(line) {
  let text = line.trim();
  if (text.startsWith('|')) text = text.slice(1);
  if (text.endsWith('|')) text = text.slice(0, -1);

  const cells = [];
  let current = '';
  let inCode = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '\\' && text[i + 1] === '|') {
      // An escaped pipe is content, not a cell boundary.
      current += '|';
      i += 1;
      continue;
    }

    if (char === '`') {
      inCode = !inCode;
      current += char;
      continue;
    }

    if (char === '|' && !inCode) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

/**
 * Create an id allocator that guarantees uniqueness within one document.
 *
 * A lesson may legitimately contain two headings with the same text — three
 * phases in a row can each have a "Why this matters" part. Both need distinct
 * anchors, so the second becomes `why-this-matters-2`.
 *
 * @returns {(text: string) => string} A function mapping heading text to a unique id.
 */
function createIdAllocator() {
  const used = new Map();
  return (text) => {
    const base = slugify(text);
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen + 1}`;
  };
}

/**
 * Parse a Markdown lesson body into blocks.
 *
 * @param {string} markdown The lesson source, with leading `## ` wrapper already removed.
 * @returns {{ blocks: object[], toc: object[], unknown: object[], stats: object }}
 *   `blocks` is the renderable AST, `toc` is the heading tree for navigation,
 *   `unknown` lists anything unparseable (the caller fails the build on a
 *   non-empty list), and `stats` carries counts for the build report.
 */
export function parseLesson(markdown) {
  const lines = String(markdown).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  const toc = [];
  const unknown = [];
  const nextId = createIdAllocator();

  let i = 0;
  let paragraph = [];

  /** Flush any pending paragraph lines into a single para block. */
  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ type: 'para', text: paragraph.join('\n').trim() });
    paragraph = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    // ---- Fenced code -----------------------------------------------------
    const fence = line.match(RE_FENCE);
    if (fence) {
      flushParagraph();
      const marker = fence[1];
      const lang = fence[2] || '';
      const body = [];
      i += 1;

      // Scan to the matching close. An unterminated fence consumes the rest of
      // the document: that is the honest reading, and the resulting
      // missing-section error names the heading that went missing, which
      // points at the real cause faster than a guess would.
      let closed = false;
      while (i < lines.length) {
        if (lines[i].trimEnd().startsWith(marker)) {
          closed = true;
          i += 1;
          break;
        }
        body.push(lines[i]);
        i += 1;
      }

      blocks.push({ type: 'code', lang, text: body.join('\n') });
      if (!closed) {
        unknown.push({
          kind: 'unterminated-fence',
          line: i,
          detail: `code fence opened with "${marker}" at line ${i - body.length} was never closed`,
        });
      }
      continue;
    }

    // ---- Heading ---------------------------------------------------------
    const heading = line.match(RE_HEADING);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = nextId(text);
      blocks.push({ type: 'heading', level, text, id });
      toc.push({ level, text, id });
      i += 1;
      continue;
    }

    // ---- Table -----------------------------------------------------------
    // Detected by a row followed by a separator row, so a paragraph that
    // merely starts with a pipe is not mistaken for a table.
    if (RE_TABLE_ROW.test(line) && i + 1 < lines.length && RE_TABLE_SEP.test(lines[i + 1])) {
      flushParagraph();
      const head = splitTableRow(line);
      i += 2; // consume header and separator

      const rows = [];
      while (i < lines.length && RE_TABLE_ROW.test(lines[i])) {
        const cells = splitTableRow(lines[i]);
        // Pad or trim to the header width so every row renders in a grid.
        // A short row is a real authoring slip; padding keeps the site
        // readable and lint-content reports the mismatch separately.
        while (cells.length < head.length) cells.push('');
        rows.push(cells.slice(0, head.length));
        i += 1;
      }

      blocks.push({ type: 'table', head, rows });
      continue;
    }

    // ---- Blockquote ------------------------------------------------------
    if (RE_QUOTE.test(line)) {
      flushParagraph();
      const paras = [];
      let current = [];

      while (i < lines.length && RE_QUOTE.test(lines[i])) {
        const inner = lines[i].match(RE_QUOTE)[1];
        // A blank quote line (`>`) separates paragraphs inside the quote.
        if (inner.trim() === '') {
          if (current.length) paras.push(current.join(' ').trim());
          current = [];
        } else {
          current.push(inner.trim());
        }
        i += 1;
      }
      if (current.length) paras.push(current.join(' ').trim());

      blocks.push({ type: 'quote', paras: paras.filter(Boolean) });
      continue;
    }

    // ---- Lists -----------------------------------------------------------
    // One list block per contiguous run, with a single level of nesting. The
    // corpus uses two levels; a third would be a table or a phase split.
    if (RE_BULLET.test(line) || RE_ORDERED.test(line)) {
      flushParagraph();
      const ordered = RE_ORDERED.test(line) && !RE_BULLET.test(line);
      const items = [];

      while (i < lines.length) {
        const itemLine = lines[i];
        const bullet = itemLine.match(RE_BULLET);
        const numbered = itemLine.match(RE_ORDERED);

        if (!bullet && !numbered) {
          // A blank line ends the list only if the next line is not an item.
          if (itemLine.trim() === '' && i + 1 < lines.length) {
            const peek = lines[i + 1];
            if (RE_BULLET.test(peek) || RE_ORDERED.test(peek)) {
              i += 1;
              continue;
            }
          }
          if (itemLine.trim() === '') break;
          if (!/^\s/.test(itemLine)) break;
          // An indented continuation of the previous item.
          if (items.length) {
            const last = items[items.length - 1];
            last.text = `${last.text} ${itemLine.trim()}`.trim();
          }
          i += 1;
          continue;
        }

        const match = bullet ?? numbered;
        const indent = match[1].length;
        const text = match[3].trim();

        if (indent >= 2 && items.length) {
          // Nested item — attach to the most recent top-level item's children.
          const parent = items[items.length - 1];
          parent.children.push({ text });
        } else {
          items.push({ text, children: [] });
        }
        i += 1;
      }

      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    // ---- Blank line ------------------------------------------------------
    if (line.trim() === '') {
      flushParagraph();
      i += 1;
      continue;
    }

    // ---- Paragraph -------------------------------------------------------
    // The catch-all. This is what makes invariant 1 hold: a line that reached
    // here is content, so it is kept rather than skipped.
    paragraph.push(line.trim());
    i += 1;
  }

  flushParagraph();

  // Any block whose type is not in the known set fails the build. This is a
  // guard against a future edit adding a block type without teaching the
  // renderer about it — the failure mode being a lesson that renders blank.
  const KNOWN = new Set(['para', 'heading', 'code', 'quote', 'table', 'list']);
  for (const block of blocks) {
    if (!KNOWN.has(block.type)) {
      unknown.push({ kind: 'unknown-block', detail: `block type "${block.type}"` });
    }
  }

  return {
    blocks,
    toc,
    unknown,
    stats: {
      blockCount: blocks.length,
      headingCount: toc.length,
      codeCount: blocks.filter((b) => b.type === 'code').length,
      tableCount: blocks.filter((b) => b.type === 'table').length,
      listCount: blocks.filter((b) => b.type === 'list').length,
      quoteCount: blocks.filter((b) => b.type === 'quote').length,
    },
  };
}

/**
 * Strip block markup from an AST, returning the plain text it carries.
 *
 * Used by `audit-lesson-ast.mjs`, which compares this against the source with
 * markup removed. If the two differ, the parser lost or duplicated content —
 * which is exactly the failure invariant 1 exists to prevent, and which no
 * amount of reading the rendered page would reliably catch.
 *
 * @param {object[]} blocks A parsed block list.
 * @returns {string} Concatenated visible text.
 */
export function astToPlainText(blocks) {
  const out = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'para':
        out.push(block.text);
        break;
      case 'heading':
        out.push(block.text);
        break;
      case 'code':
        out.push(block.text);
        break;
      case 'quote':
        out.push(...block.paras);
        break;
      case 'table':
        out.push(...block.head);
        for (const row of block.rows) out.push(...row);
        break;
      case 'list':
        for (const item of block.items) {
          out.push(item.text);
          for (const child of item.children ?? []) out.push(child.text);
        }
        break;
      default:
        break;
    }
  }

  return out.join('\n');
}
