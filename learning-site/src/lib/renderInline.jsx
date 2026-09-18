// Renders the small subset of inline Markdown that appears in the generated
// content JSON: **bold**, `code`, and *italic*.
//
// WHY THIS EXISTS
// The site has no Markdown renderer and deliberately no extra dependency, so
// any **bold** or `code` inside a content string was displayed literally, with
// the asterisks and backticks visible to the reader. The curriculum Markdown
// uses this syntax for emphasis in practice tasks and deliverables, so the
// generated JSON carries it through as plain text.
//
// This is intentionally a formatter for INLINE syntax only. It does not handle
// headings, lists, links, or block structure, because the JSON contains none —
// those are parsed out by scripts/build-content.mjs and become real UI
// elements. Anything unrecognised is rendered as literal text.
//
// SAFETY
// Output is React elements, never HTML, so no dangerouslySetInnerHTML is
// involved and content cannot inject markup.
//
// ATOMIC CODE SPANS, AND WHY THEY ARE MASKED FIRST
// The curriculum writes bold that CONTAINS inline code — ``**`/etc`**`` — so a
// single-pass alternation over the whole string is not enough; the inner text
// of a bold run has to be formatted too.
//
// Code spans are therefore extracted before anything else and replaced with a
// sentinel, and the emphasis pass runs over the masked string. This is not a
// stylistic choice, it is the fix for a real defect:
//
//     **The third statement uses `Resource: "*"` inside a key policy.**
//
// The asterisk inside the code span is data — part of a JSON value — not an
// italic marker. An emphasis pass that ran first would see it, fail to match
// the bold run (its content branch excludes `*`), then fall back to matching
// *italic* ACROSS the code span, shredding both spans and leaking a literal
// backtick into the rendered prose. Masking means the emphasis branches only
// ever see markers that are genuinely markers, and the sentinel is substituted
// back for a <code> element at the leaves.
//
// The recursion terminates because every pass descends into a fragment with at
// least the two marker characters removed, and the pattern requires content
// between the markers.

// Emphasis only. Alternation order matters: **bold** must be tried before
// *italic*, so a marker pair is consumed as a unit rather than as two runs.
// Backticks deliberately do not appear here — every paired code span was
// masked out before this pattern is applied.
const TOKEN = /(\*\*[^*]+\*\*|\*[^*\n]+\*)/g;

// A paired inline code span. An unmatched backtick is left alone and renders
// literally, which is the same behaviour as before.
const CODE_SPAN = /`([^`\n]+)`/g;

// The mask. \u0000 is a NUL, which cannot occur in the Markdown sources, so a
// literal collision in prose is not a case worth defending against.
const SENTINEL = /\u0000(\d+)\u0000/g;

/**
 * Replace every paired code span with a NUL-delimited index and return both the
 * masked string and the span texts, in index order.
 */
function maskCodeSpans(text) {
  const spans = [];
  const masked = text.replace(CODE_SPAN, (_, inner) => {
    spans.push(inner);
    return "\u0000" + (spans.length - 1) + "\u0000";
  });
  return { masked, spans };
}

/**
 * Emit a leaf run, turning any sentinel back into a <code> element. A plain run
 * can hold several spans and the text between them, so they are interleaved in
 * order rather than wrapped as one block.
 */
function restore(text, keyPrefix, spans) {
  const out = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(SENTINEL)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<code key={`${keyPrefix}-c${n++}`}>{spans[Number(m[1])]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function format(text, keyPrefix, spans) {
  if (typeof text !== "string" || text === "") return text;
  // Nothing to do: no emphasis marker and no masked span in this fragment.
  if (!/[*\u0000]/.test(text)) return text;

  const parts = text.split(TOKEN).filter((p) => p !== "");
  const out = [];

  parts.forEach((part, i) => {
    const key = `${keyPrefix}-${i}`;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      // Recurse so a code span inside bold still becomes a <code> element.
      out.push(<strong key={key}>{format(part.slice(2, -2), key, spans)}</strong>);
      return;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      out.push(<em key={key}>{format(part.slice(1, -1), key, spans)}</em>);
      return;
    }
    out.push(...restore(part, key, spans));
  });

  return out;
}

/**
 * Turn one content string into React nodes.
 * @param {string} text
 * @param {string} keyPrefix stable prefix so React keys stay unique
 * @returns {Array|string} React nodes, or the original string when nothing matched
 */
export function renderInline(text, keyPrefix = "md") {
  if (typeof text !== "string" || text === "") return text;
  // Fast path: nothing to format, so return the original string untouched.
  if (!/[*`]/.test(text)) return text;
  const { masked, spans } = maskCodeSpans(text);
  return format(masked, keyPrefix, spans);
}