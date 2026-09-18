// Shown when a list has nothing in it yet.
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