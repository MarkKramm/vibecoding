// Renders the lesson block AST produced by scripts/lesson-ast.mjs.
//
// One component per block type, so adding a type to the parser without handling
// it here fails loudly (the switch's default) rather than rendering nothing.
// Inline emphasis (bold, code, italic) goes through renderInline, which already
// exists for the structured sections.

import { useCallback, useEffect, useRef, useState } from "react";
import { renderInline } from "../lib/renderInline.jsx";

/**
 * Copy control for a fenced code block.
 *
 * The curriculum ships 464 code blocks, most of them commands a reader is meant
 * to run. Retyping them by hand is where a flag gets mistyped and a beginner
 * concludes the lesson is wrong, so copy is a correctness aid, not a
 * convenience.
 *
 * navigator.clipboard needs a secure context. localhost and the deployed HTTPS
 * site both qualify, but a reader who opens the built site over plain HTTP on
 * another machine does not, so the fallback keeps the button working there
 * rather than failing silently.
 */
function CopyButton({ text }) {
  const [state, setState] = useState("idle");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    const flash = (next) => {
      setState(next);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("idle"), 1600);
    };

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Deprecated, but it is the only route when the page is not a secure
        // context, and it is still implemented everywhere that matters.
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      flash("copied");
    } catch {
      // Denied permission or no clipboard at all. Say so instead of pretending.
      flash("failed");
    }
  }, [text]);

  const label = state === "copied" ? "Copied" : state === "failed" ? "Press Ctrl+C" : "Copy";

  return (
    <button
      type="button"
      className="lesson__copy"
      data-state={state}
      onClick={copy}
      aria-label={state === "copied" ? "Code copied to clipboard" : "Copy code to clipboard"}
    >
      {label}
    </button>
  );
}

function List({ list, keyPrefix }) {
  const Tag = list.ordered ? "ol" : "ul";
  return (
    <Tag>
      {list.items.map((item, i) => {
        // A checkbox item is drawn, not made interactive. The weekly tracker is
        // a template the reader is told to copy and fill in on paper or in
        // their own document, so a real <input> here would look tickable and do
        // nothing — the same lie as a button that goes nowhere. A span styled
        // into a box states "this is a checkbox" without promising it works.
        const isBox = item.checked !== undefined;
        return (
          <li
            key={keyPrefix + "-" + i}
            className={isBox ? "tmpl-item" : undefined}
          >
            {isBox && (
              <>
                <span
                  className={"tmpl-box" + (item.checked ? " is-checked" : "")}
                  aria-hidden="true"
                />
                <span className="sr-only">
                  {item.checked ? "Checked: " : "Unchecked: "}
                </span>
              </>
            )}
            {renderInline(item.text, keyPrefix + "-" + i)}
            {item.children.map((child, j) =>
              child.type === "list" ? (
                <List key={j} list={child} keyPrefix={keyPrefix + "-" + i + "-" + j} />
              ) : null
            )}
          </li>
        );
      })}
    </Tag>
  );
}

function Table({ head, rows, keyPrefix }) {
  // Wide tables get their own horizontal scroll container. The curriculum has
  // up to six columns, which cannot fit a phone screen without either scrolling
  // or unreadable wrapping.
  return (
    <div className="lesson__table-wrap">
      <table className="lesson__table">
        <thead>
          <tr>
            {head.map((cell, i) => (
              <th key={i}>{renderInline(cell, keyPrefix + "-h" + i)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>{renderInline(cell, keyPrefix + "-" + r + "-" + c)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The done control that rides on a section heading.
 *
 * A heading is the unit a reader thinks in — "I have finished the storage
 * section" — and the phase checklist below the lesson cannot express that. The
 * control is a real button rather than a nested checkbox inside the heading, so
 * the heading text stays selectable and the h3/h4 outline is not violated by
 * interactive content.
 *
 * In reading mode a completed section shows a quiet tick; the button itself is
 * revealed on hover or keyboard focus so it does not add 66 visible controls to
 * a page whose purpose is reading.
 */
function SectionDone({ id, text, done, onToggle }) {
  return (
    <button
      type="button"
      className={"lesson__done" + (done ? " is-done" : "")}
      aria-pressed={done}
      aria-label={
        (done ? "Mark not done: " : "Mark done: ") + String(text || "").replace(/[*`]/g, "")
      }
      title={done ? "Mark this section as not done" : "Mark this section as done"}
      onClick={() => onToggle(id)}
    >
      <span aria-hidden="true">{done ? "✓" : "○"}</span>
    </button>
  );
}

export default function LessonBlock({
  block,
  index,
  sectionDone = false,
  onToggleSection,
  tickMode = false,
  headingBase = 3,
  headingTag = 3,
}) {
  const key = "b" + index;

  switch (block.type) {
    case "heading": {
      // The rendered heading level is computed from the block's own level
      // relative to the document's base, so the page outline stays valid for
      // both corpora without either one hard-coding the other's depths.
      //
      // A lesson is authored inside `## Lesson: …`, so its blocks start at level
      // 3 and map to the page's h3/h4/h5 — the defaults, and byte-identical to
      // the previous hard-coded mapping. A shared strategy document starts at
      // level 1 because it has no enclosing section; its title maps to h2, so
      // the page keeps exactly one h1 and its sections become h3 and h4.
      //
      // The alternative — a second renderer for the shared docs — would have
      // duplicated table, code, quote and list rendering to change one line.
      const Tag =
        "h" + Math.min(headingTag + (block.level - headingBase), 5);
      // Only the first two depths appear in the TOC and therefore carry a done
      // state; the third is a paragraph-level label with no section identity of
      // its own. Expressed against the base rather than as literal 3/4 so a
      // shared document at base 1 does not accidentally make its subsections
      // tickable — it passes no handler today, and this keeps that from being
      // the only thing standing between it and a stray control.
      const togglable =
        (block.level === headingBase || block.level === headingBase + 1) &&
        typeof onToggleSection === "function";

      return (
        <Tag
          id={block.id}
          className={
            "lesson__heading" +
            (togglable && sectionDone ? " is-done" : "") +
            (togglable && tickMode ? " is-ticking" : "")
          }
        >
          {togglable && (
            <SectionDone
              id={block.id}
              text={block.text}
              done={sectionDone}
              onToggle={onToggleSection}
            />
          )}
          {renderInline(block.text, key)}
        </Tag>
      );
    }

    case "para":
      return <p>{renderInline(block.text, key)}</p>;

    case "code":
      return (
        <div className="lesson__code-wrap">
          <CopyButton text={block.text} />
          <pre className="lesson__code" data-lang={block.lang || undefined}>
            <code>{block.text}</code>
          </pre>
        </div>
      );

    case "quote":
      return (
        <blockquote className="lesson__quote">
          {block.paras.map((p, i) => (
            <p key={i}>{renderInline(p, key + "-" + i)}</p>
          ))}
        </blockquote>
      );

    case "table":
      return <Table head={block.head} rows={block.rows} keyPrefix={key} />;

    case "list":
      return <List list={block} keyPrefix={key} />;

    default:
      // A new block type in the parser with no renderer here would otherwise
      // vanish silently, which is exactly the failure this whole feature exists
      // to prevent. Fail visibly instead.
      return (
        <p className="lesson__unsupported">
          Unsupported block type: <code>{String(block.type)}</code>
        </p>
      );
  }
}