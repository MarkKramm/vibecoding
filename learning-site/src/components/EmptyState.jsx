// Shown when a list has nothing in it yet.
//
// ---------------------------------------------------------------------------
// DEAD CODE — PORTED BUT UNREACHABLE
// ---------------------------------------------------------------------------
// Nothing renders this component, so it produces no DOM anywhere in the app. It
// was ported for the sibling CS Roadmap project's career views — Portfolio,
// Applications, Certifications — which are the lists that have an empty state to
// show. This curriculum has no such views. See docs/DECISIONS.md → D-008.
//
// It is kept rather than deleted because removal would have to be redone if the
// career views return. See D-008. Note that it is *referenced* in comments
// elsewhere — `docs/DESIGN-SYSTEM.md` documents `<EmptyState>`, and
// `usePortfolio.js` and `useSchedule.js` both point at it — so a grep for the
// name finds prose, not an importer. That is the same trap that produced the
// wrong count in D-008.
//
// Always suggests a next action — never just "nothing here", and never an
// apology. See docs/DESIGN-SYSTEM.md → <EmptyState>.
//
// `children` is the optional next action, usually a button that opens whatever
// creates the first item.

export default function EmptyState({ message, children }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
      {children}
    </div>
  );
}