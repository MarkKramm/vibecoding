/**
 * search-index.mjs — build an inverted index over the lessons.
 *
 * Search has to find a phrase across every lesson without loading all of them
 * into the browser. The index therefore stores **term → segment** and no prose
 * at all, so it does not duplicate the lesson files it points into.
 *
 * Segments are cut at `###`/`####` headings rather than per block or per
 * lesson. Per block produces a result list too long to read; per lesson
 * produces hits too broad to be useful, because every hit is "somewhere in
 * this 4,000-word phase". A heading-sized chunk is the unit a reader actually
 * wants to be taken to.
 */

/** Terms appearing in more than this share of segments are "common". */
const COMMON_THRESHOLD = 0.2;

/** Words too short or too generic to be worth indexing. */
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'than', 'that', 'this',
  'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am',
  'do', 'does', 'did', 'doing', 'have', 'has', 'had', 'having', 'i', 'you',
  'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my',
  'your', 'his', 'its', 'our', 'their', 'of', 'in', 'on', 'at', 'to', 'for',
  'with', 'by', 'from', 'as', 'into', 'about', 'so', 'not', 'no', 'can',
  'could', 'will', 'would', 'should', 'may', 'might', 'must', 'shall', 'up',
  'out', 'down', 'over', 'under', 'again', 'more', 'most', 'some', 'any',
  'all', 'each', 'few', 'other', 'such', 'only', 'own', 'same', 'too',
  'very', 'just', 'also', 'there', 'here', 'when', 'where', 'why', 'how',
  'what', 'which', 'who', 'whom', 'one', 'two', 'get', 'got', 'use', 'used',
  'using', 'make', 'makes', 'made', 'see', 'seen', 'like', 'well', 'way',
]);

/**
 * Reduce a word to a comparable stem.
 *
 * A deliberately crude suffix stripper rather than a real stemmer. The goal is
 * only that "tokenize", "tokenized" and "tokenizing" collide on one index
 * entry; a linguistically correct stemmer would be a dependency, and the
 * corpus is overwhelmingly technical English where the simple rules suffice.
 * Over-stemming is the risk — "analysis" must not become "analys" in a way
 * that collides with something unrelated — so only unambiguous suffixes go.
 *
 * @param {string} word A lowercased word.
 * @returns {string} The stem.
 */
export function stem(word) {
  let w = word;
  if (w.length <= 3) return w;

  for (const suffix of ['ization', 'izations', 'ationally', 'ation', 'ations', 'ingly', 'edly']) {
    if (w.endsWith(suffix) && w.length - suffix.length >= 4) {
      return `${w.slice(0, w.length - suffix.length)}`;
    }
  }
  for (const suffix of ['ing', 'ies', 'ied', 'ers', 'er', 'ed', 'es', 's']) {
    if (w.endsWith(suffix) && w.length - suffix.length >= 3) {
      let base = w.slice(0, w.length - suffix.length);
      // "carried" -> "carry", not "carr".
      if (suffix === 'ies' || suffix === 'ied') base += 'y';
      return base;
    }
  }
  return w;
}

/**
 * Turn text into indexable terms.
 *
 * Keeps `+`, `#` and `.` inside a token so that `c++`, `c#`, `node.js` and
 * `gpt-4.1` survive as single terms. Splitting them would make the most
 * specific queries in this curriculum the least searchable.
 *
 * @param {string} text Source text.
 * @returns {string[]} Lowercased stems, stopwords removed, duplicates kept.
 */
export function tokenize(text) {
  const cleaned = String(text)
    // Code fences carry a lot of punctuation noise; keep their words but drop
    // the fence markers themselves.
    .replace(/```+/g, ' ')
    .replace(/`([^`]*)`/g, ' $1 ');

  const raw = cleaned.toLowerCase().match(/[a-z0-9][a-z0-9+#._-]*/g) ?? [];
  const out = [];

  for (const word of raw) {
    const trimmed = word.replace(/[._-]+$/, '');
    if (trimmed.length < 2) continue;
    if (STOPWORDS.has(trimmed)) continue;
    out.push(stem(trimmed));
  }

  return out;
}

/**
 * Build the inverted index.
 *
 * @param {Map<string, {id: string, title: string, blocks: object[], toc: object[]}>} lessons
 *   Phase id to parsed lesson.
 * @returns {{v: number, segments: object[], terms: string, common: string, termCount: number, segmentCount: number}}
 */
export function buildSearchIndex(lessons) {
  const segments = [];
  /** @type {Map<string, number[]>} term -> ascending segment indices */
  const postings = new Map();

  // Track membership per term so common-term detection is one pass at the end
  // rather than a scan of the postings for every term.
  const seenIn = new Map();

  const addSegment = (heading, anchor, phaseId, phaseTitle, trackId, text) => {
    const index = segments.length;
    segments.push({ h: heading, a: anchor, p: phaseId, pt: phaseTitle, k: trackId });

    const terms = new Set(tokenize(text));
    for (const term of terms) {
      if (!postings.has(term)) postings.set(term, []);
      postings.get(term).push(index);
      seenIn.set(term, (seenIn.get(term) ?? 0) + 1);
    }
  };

  for (const [, lesson] of lessons) {
    const phaseId = lesson.id;
    const phaseTitle = lesson.title;
    // The track is encoded in the phase id prefix only by convention, so it is
    // resolved from the id's leading segment rather than guessed from a list.
    const trackId = phaseId.split('-')[0];

    let heading = phaseTitle;
    let anchor = '';
    let buffer = [];

    const flush = () => {
      if (buffer.length === 0) return;
      addSegment(heading, anchor, phaseId, phaseTitle, trackId, buffer.join(' '));
      buffer = [];
    };

    for (const block of lesson.blocks) {
      if (block.type === 'heading') {
        // A heading starts a new segment, so the previous one ends here.
        flush();
        heading = block.text;
        anchor = block.id;
        continue;
      }

      switch (block.type) {
        case 'para':
          buffer.push(block.text);
          break;
        case 'code':
          buffer.push(block.text);
          break;
        case 'quote':
          buffer.push(...block.paras);
          break;
        case 'table':
          buffer.push(...block.head);
          for (const row of block.rows) buffer.push(...row);
          break;
        case 'list':
          for (const item of block.items) {
            buffer.push(item.text);
            for (const child of item.children ?? []) buffer.push(child.text);
          }
          break;
        default:
          break;
      }
    }
    flush();
  }

  // Common terms are kept in the index — so a query for one can be answered —
  // but flagged, because a term in a fifth of all segments carries almost no
  // signal. The site excludes them from the query's AND rather than pretending
  // they discriminate. See docs/DECISIONS.md → D-004.
  const common = [];
  for (const [term, count] of seenIn) {
    if (count / segments.length > COMMON_THRESHOLD) common.push(term);
  }
  common.sort();

  // Deltas in base36 keep the file small: the corpus has thousands of
  // segments, and absolute indices would be twice the width of the gaps.
  const lines = [];
  for (const [term, list] of postings) {
    list.sort((a, b) => a - b);
    let previous = 0;
    const deltas = list.map((index) => {
      const delta = index - previous;
      previous = index;
      return delta.toString(36);
    });
    lines.push(`${term}:${deltas.join(',')}`);
  }
  lines.sort();

  return {
    v: 1,
    segments,
    terms: lines.join('\n'),
    common: common.join('\n'),
    termCount: postings.size,
    segmentCount: segments.length,
  };
}

/**
 * Query the index. Used by tests and by the audit script; the site has its own
 * copy of this logic because it runs in the browser and cannot import a Node
 * module that reads the filesystem.
 *
 * @param {object} index A built index.
 * @param {string} query The user's query.
 * @returns {{segmentIndex: number, score: number}[]} Ranked hits.
 */
export function queryIndex(index, query) {
  const commonSet = new Set(index.common.split('\n').filter(Boolean));
  const terms = [...new Set(tokenize(query))];
  if (terms.length === 0) return [];

  /** @type {Map<string, number[]>} */
  const postings = new Map();
  for (const line of index.terms.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const term = line.slice(0, colon);
    const deltas = line.slice(colon + 1).split(',');
    let previous = 0;
    const list = deltas.map((d) => {
      previous += parseInt(d, 36);
      return previous;
    });
    postings.set(term, list);
  }

  // Terms that survive stopwording and are not common form the AND. A common
  // term is required only if nothing else matched, because otherwise a query
  // like "what is a token" would AND on "token" alone and miss the much larger
  // set of segments that discuss it without the word.
  const meaningful = terms.filter((t) => !commonSet.has(t));
  const required = meaningful.length > 0 ? meaningful : terms;

  let candidates = null;
  for (const term of required) {
    const list = postings.get(term);
    if (!list) return []; // an AND with a term absent from the index matches nothing
    const set = new Set(list);
    candidates = candidates === null ? set : new Set([...candidates].filter((x) => set.has(x)));
    if (candidates.size === 0) return [];
  }

  const scores = new Map();
  for (const index_ of candidates ?? []) {
    let score = 0;
    for (const term of terms) {
      const list = postings.get(term);
      if (list?.includes(index_)) score += commonSet.has(term) ? 1 : 3;
    }
    scores.set(index_, score);
  }

  return [...scores.entries()]
    .map(([segmentIndex, score]) => ({ segmentIndex, score }))
    .sort((a, b) => b.score - a.score || a.segmentIndex - b.segmentIndex);
}
