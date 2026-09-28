// Does the `useNotes` unmount flush actually persist the last keystroke?
//
// WHY THIS FILE EXISTS
// `verify-notes-flush.mjs` drives the real app over CDP, and it PASSED 9/9 with
// the flush deliberately reverted to a plain state write. That is recorded in
// CHANGELOG.md, and it means the browser harness cannot answer the question it
// was written to answer.
//
// The reason is React's own ordering, not a bug in that script. Typing dispatches
// a synchronous `input` event, so `setNote` runs and schedules a render; the
// `useEffect([notes])` write is a PASSIVE effect and is not flushed during that
// event. When the following click commits, `commitRootImpl` calls
// `flushPassiveEffects()` FIRST -- so the ordinary write lands before
// `PhaseDetail` unmounts and the flush has nothing left to do. Removing the flush
// therefore changes nothing observable in a browser, and the 9/9 was evidence
// about the harness rather than about the hook.
//
// WHAT THIS FILE DOES INSTEAD
// It mounts the hook directly and puts the state update and the unmount in ONE
// synchronous block, with no await between them, so no passive effect can run in
// between. The value on disk is then read back and asserted.
//
// AND IT MAKES ITSELF FALSIFIABLE
// `localStorage.clear()` runs between the `setNote` and the `unmount`, which
// removes the mount write. The only thing that can put the marker back is the
// unmount flush. With the flush removed the store stays empty and this file
// exits 1 -- verified by doing exactly that, which is the whole point of it.
//
// WHY THERE IS A DOM SHIM BELOW
// The dependency list is `react` and `react-dom` and stays that way (see
// test-components.mjs, which refuses to add jsdom for the same reason), so a
// real mount needs a DOM that does not exist in this process. The shim is
// deliberately small for one reason: the harness component renders `null`, so
// React never creates a node and every tree operation is a no-op. Only the
// preconditions `createRoot` itself checks have to be satisfied -- a container
// with `nodeType === 1`, and `addEventListener`.
//
// Run: node scripts/test-notes-flush-unit.mjs

// ---------------------------------------------------------------------------
// The shim. Installed BEFORE react-dom is imported, because react-dom decides
// whether a DOM is usable at module-evaluation time. That is why the imports
// further down are dynamic.
// ---------------------------------------------------------------------------
const store = new Map();

const localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
  key: (i) => [...store.keys()][i] ?? null,
  get length() {
    return store.size;
  },
};

const el = (tag) => ({
  nodeType: 1,
  nodeName: tag,
  tagName: tag,
  ownerDocument: null,
  parentNode: null,
  firstChild: null,
  lastChild: null,
  nextSibling: null,
  previousSibling: null,
  childNodes: [],
  textContent: "",
  nodeValue: null,
  style: {},
  appendChild(c) {
    this.childNodes.push(c);
    this.firstChild = this.childNodes[0];
    this.lastChild = c;
    c.parentNode = this;
    return c;
  },
  insertBefore(c) {
    return this.appendChild(c);
  },
  removeChild(c) {
    this.childNodes = this.childNodes.filter((x) => x !== c);
    this.firstChild = this.childNodes[0] ?? null;
    return c;
  },
  setAttribute() {},
  removeAttribute() {},
  getAttribute: () => null,
  setAttributeNS() {},
  removeAttributeNS() {},
  getAttributeNS: () => null,
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => true,
  contains: () => false,
  focus() {},
  blur() {},
  click() {},
});

const documentShim = {
  nodeType: 9,
  nodeName: "#document",
  createElement: (t) => el(String(t).toUpperCase()),
  createElementNS: (_ns, t) => el(String(t).toUpperCase()),
  createTextNode: (t) => ({ nodeType: 3, nodeName: "#text", textContent: String(t), parentNode: null }),
  createComment: (t) => ({ nodeType: 8, nodeName: "#comment", textContent: String(t), parentNode: null }),
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
  removeEventListener() {},
};
documentShim.documentElement = el("HTML");
documentShim.documentElement.ownerDocument = documentShim;
documentShim.body = el("BODY");
documentShim.body.ownerDocument = documentShim;
documentShim.head = el("HEAD");
documentShim.head.ownerDocument = documentShim;
documentShim.activeElement = documentShim.body;

// ---------------------------------------------------------------------------
// The DOM constructor names react-dom touches, and why they must be named.
//
// The first run of this file died here, and the failure is worth recording
// because it is the kind that reads as a code fault and is not:
//
//   TypeError: Right-hand side of 'instanceof' is not an object
//     at getActiveElementDeep (react-dom.development.js:8445)
//       while (element instanceof win.HTMLIFrameElement)
//
// React's commit phase calls `getActiveElementDeep`, which asks `window` for
// `HTMLIFrameElement` and uses the answer immediately as the right-hand side of
// an `instanceof`. Against a missing name that is a TypeError, NOT `false` --
// so a minimal shim has to declare these even though nothing here ever
// constructs one. The throw happens during commit, before any assertion runs,
// which is why the symptom was an empty result rather than a failed check.
//
// All of them point at one no-op constructor. The component under test renders
// `null`, so no element is ever created and every `instanceof` is legitimately
// false.
// ---------------------------------------------------------------------------
function ShimElement() {}
const DOM_NAMES = [
  "Node", "Element", "HTMLElement", "HTMLIFrameElement", "HTMLInputElement",
  "HTMLTextAreaElement", "HTMLButtonElement", "HTMLDivElement", "HTMLDocument",
  "Document", "ShadowRoot", "DocumentFragment", "Text", "Comment",
  "Event", "EventTarget", "CustomEvent", "MouseEvent", "PointerEvent",
  "KeyboardEvent", "InputEvent", "FocusEvent", "CompositionEvent",
  "ClipboardEvent", "DragEvent", "TouchEvent", "WheelEvent", "UIEvent",
  "Range", "Selection", "CSSStyleDeclaration", "DOMRect", "DOMRectReadOnly",
  "MutationObserver", "ResizeObserver", "IntersectionObserver",
];

const windowShim = {
  document: documentShim,
  localStorage,
  navigator: { userAgent: "node" },
  addEventListener() {},
  removeEventListener() {},
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
  getComputedStyle: () => ({ getPropertyValue: () => "" }),
  matchMedia: () => ({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  }),
  getSelection: () => null,
  scrollTo() {},
  focus() {},
  blur() {},
};
for (const name of DOM_NAMES) windowShim[name] = ShimElement;

windowShim.window = windowShim;
// React's `getWindow(containerInfo)` resolves the owning window through one of
// these. Without it the commit cannot find a window and throws for that reason
// instead -- a second failure that would look identical to the first.
documentShim.defaultView = windowShim;
documentShim.parentWindow = windowShim;

// `navigator` already exists on Node 21+ and may be defined as a getter, so a
// plain assignment can throw. Define defensively rather than crashing here,
// because a shim that dies at setup would look like a code failure.
for (const [name, value] of [
  ["window", windowShim],
  ["document", documentShim],
  ["navigator", windowShim.navigator],
  ["localStorage", localStorage],
]) {
  try {
    globalThis[name] = value;
  } catch {
    try {
      Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
    } catch {
      // Nothing further can be done; the assertions below will report it.
    }
  }
}

globalThis.IS_REACT_ACT_ENVIRONMENT = false;

// ---------------------------------------------------------------------------
// The real modules. Dynamic, and after the shim, for the reason above.
// ---------------------------------------------------------------------------
const { createElement } = await import("react");
const { createRoot } = await import("react-dom/client");
const { useNotes } = await import("../src/hooks/useNotes.js");

const KEY = "vibecoding:notes:v1";
const PHASE = "test-phase-01";

let pass = 0;
const failures = [];
function check(name, cond, detail = "") {
  if (cond) {
    pass++;
    return;
  }
  failures.push(`${name}${detail ? `\n     ${detail}` : ""}`);
}

/** Let React commit and run its passive effects, without needing act(). */
const settle = async (turns = 8) => {
  for (let i = 0; i < turns; i++) await new Promise((r) => setTimeout(r, 0));
};

// ---------------------------------------------------------------------------
// Mount the hook.
// ---------------------------------------------------------------------------
let api = null;
function Harness() {
  api = useNotes();
  return null;
}

const container = el("DIV");
container.ownerDocument = documentShim;
const root = createRoot(container);
root.render(createElement(Harness));
await settle();

check(
  "the harness mounted and useNotes() returned its API",
  !!api && typeof api.setNote === "function" && typeof api.clearPhase === "function",
  api ? `keys: ${Object.keys(api).join(", ")}` : "api is null -- the harness never rendered",
);

if (!api) {
  console.log("");
  console.log(`  \u2716 notes flush (unit): ${pass} passed, ${failures.length} failed`);
  for (const f of failures) console.log(`\n     \u2716 ${f}`);
  console.log("");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Control: can this harness observe ANY write at all?
//
// Without this, a later failure is ambiguous -- it could mean "the unmount
// flush is broken" or "this shim cannot see storage", and the final assertion
// alone cannot tell them apart. The passive `useEffect([notes])` writes on
// mount, so a key present now proves the harness reaches the same store the
// flush writes to.
// ---------------------------------------------------------------------------
const afterMount = localStorage.getItem(KEY);
check(
  "the ordinary mount write reached localStorage (control)",
  afterMount !== null,
  `key ${KEY} is still unset after mount, so this harness cannot observe ANY write`,
);

// ---------------------------------------------------------------------------
// The thing under test.
//
// ONE synchronous block, deliberately. No await, no setTimeout, no rAF between
// the write and the unmount -- that is the entire point. Anything asynchronous
// inserted here would give React the chance to flush the passive effect, and
// the test would stop being about the flush.
//
// The clear() is what makes this falsifiable: it erases the mount write, so a
// marker present at the end can only have been written by the unmount flush.
// Revert the flush and storage stays empty.
// ---------------------------------------------------------------------------
const MARKER = "unmount-flush-marker-Q7";
localStorage.clear();
check(
  "storage was cleared, so only the unmount flush can write the marker",
  localStorage.getItem(KEY) === null,
  `after clear the key still reads ${JSON.stringify(localStorage.getItem(KEY))}`,
);

api.setNote(PHASE, MARKER);
root.unmount();

// ---------------------------------------------------------------------------
// Assert.
// ---------------------------------------------------------------------------
const after = localStorage.getItem(KEY);
const parsed = after ? JSON.parse(after) : {};
const found = (parsed[PHASE]?.note || "").includes(MARKER);

check(
  "the last keystroke survives an unmount with no intervening render",
  found,
  after === null
    ? `storage is EMPTY after unmount -- the unmount flush wrote nothing (mount write was ${JSON.stringify(afterMount)})`
    : `storage holds ${after}, which does not contain ${JSON.stringify(MARKER)}`,
);

// ---------------------------------------------------------------------------
// Second scenario: TWO writes in ONE tick, with no render between them.
//
// This is a distinct failure mode, not a restatement of the check above. The
// hook's own comment claims it (useNotes.js: "Two keystrokes in one tick still
// compose correctly here, because the second call reads the ref the first one
// just wrote"). If `commit()` used a functional setState updater instead of the
// ref, `latest.current` would stay stale until the next render: the SECOND call
// would build its new store from the pre-first-write value and the FIRST phase's
// note would vanish. A single-write test passes straight through that bug.
//
// Two DIFFERENT phases are used because setNote overwrites one phase's note
// rather than appending -- writing the same phase twice would leave only the
// second value and could not detect the lost-update bug at all.
// ---------------------------------------------------------------------------
const FIRST = "tick-first-J1";
const SECOND = "tick-second-K2";

api = null;
const container2 = el("DIV");
container2.ownerDocument = documentShim;
const root2 = createRoot(container2);
root2.render(createElement(Harness));
await settle();

localStorage.clear();
api.setNote(PHASE, FIRST);
api.setNote(PHASE + "-b", SECOND);
root2.unmount();

const after2 = localStorage.getItem(KEY);
const parsed2 = after2 ? JSON.parse(after2) : {};
const firstStored = (parsed2[PHASE]?.note || "").includes(FIRST);
const secondStored = (parsed2[PHASE + "-b"]?.note || "").includes(SECOND);
check(
  "two writes in one tick both survive the unmount (proves the ref, not setState)",
  firstStored && secondStored,
  after2 === null
    ? "storage is EMPTY after unmount -- the flush wrote nothing"
    : `stored ${JSON.stringify(Object.keys(parsed2))}; expected both ${JSON.stringify(PHASE)} and ${JSON.stringify(PHASE + "-b")}. first=${firstStored} second=${secondStored}`,
);

// ---------------------------------------------------------------------------
// Report.
// ---------------------------------------------------------------------------
console.log("");
if (failures.length) {
  console.log(`  \u2716 notes flush (unit): ${pass} passed, ${failures.length} failed`);
  for (const f of failures) console.log(`\n     \u2716 ${f}`);
  console.log("");
  process.exit(1);
}
console.log(`  \u2713 notes flush (unit): ${pass} assertion(s) passed`);
console.log("");
process.exit(0);