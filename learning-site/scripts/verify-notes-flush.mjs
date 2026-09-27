/**
 * Proves the useNotes unmount flush works, in a real browser against a real build.
 *
 * The claim under test: if a reader types and the component unmounts in the same
 * interaction frame, the final characters survive.
 *
 * This drives the actual app over CDP. It types into a phase's note field and
 * immediately navigates away, then returns and checks the text is still there.
 *
 * Usage: node scripts/verify-notes-flush.mjs <preview-url>
 * Exits 0 on pass, 1 on fail, 0 with a loud SKIP if the preview is unreachable.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const URL_BASE = process.argv[2] || process.env.VITE_PREVIEW_URL || "http://localhost:4199";

// Find a Chromium-family binary the same way the other browser checks do.
const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);

import { existsSync } from "node:fs";
const browser = CANDIDATES.find((p) => existsSync(p));
if (!browser) {
  console.log("  SKIP: no Chromium-family browser found.");
  process.exit(0);
}

let reachable = true;
try {
  const r = await fetch(URL_BASE, { signal: AbortSignal.timeout(4000) });
  reachable = r.ok;
} catch {
  reachable = false;
}
if (!reachable) {
  console.log(`  SKIP: no server answered at ${URL_BASE}.`);
  process.exit(0);
}

const PORT = 9333;
const proc = spawn(
  browser,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--user-data-dir=" + process.env.TEMP + "/notes-flush-profile",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const cleanup = () => {
  try {
    proc.kill();
  } catch {
    /* already gone */
  }
};
process.on("exit", cleanup);

async function cdpTargets() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      const page = list.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error("browser did not expose a debug target");
}

const wsUrl = await cdpTargets();
const { WebSocket } = await import("node:worker_threads").then(() => ({ WebSocket: globalThis.WebSocket }));
const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = rej;
});

let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
};
const send = (method, params = {}) =>
  new Promise((res) => {
    const myId = ++id;
    pending.set(myId, res);
    ws.send(JSON.stringify({ id: myId, method, params }));
  });

const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.text);
  return r.result?.result?.value;
};

await send("Page.enable");
await send("Runtime.enable");

const checks = [];
const check = (name, ok, detail = "") => {
  checks.push({ name, ok, detail });
  console.log(`  ${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

// ── Drive the app ────────────────────────────────────────────────────────────
//
// This app deliberately has no router (see the note at the top of App.jsx), so
// there is no deep link to jump to. The only honest way to reach a phase is the
// way a reader does: open a track from the dashboard, which lands on its first
// phase.
await send("Page.navigate", { url: URL_BASE });
await sleep(2500);

// CLEAR STORAGE BEFORE MEASURING, and reload so React reads the empty store.
//
// This is not tidiness -- without it the test is not a test. The browser uses a
// persistent profile, so a marker written by a PREVIOUS run survives into this
// one. That produced a false pass while proving falsifiability: with the buggy
// props deliberately restored, the final assertion still reported "survived",
// because it was reading the last run's leftover marker rather than anything
// this run wrote. A verification that cannot fail is not evidence, and one that
// passes for a reason unrelated to the code is worse, because it looks like
// evidence.
//
// Removing the key and reloading guarantees the only marker that can appear is
// one this run put there.
await evaluate(`window.localStorage.removeItem("vibecoding:notes:v1")`);
await send("Page.reload");
await sleep(2500);

// Assert the isolation actually happened. If a future edit moves this clearing
// after the measurement, or the key name changes, this fails loudly instead of
// quietly letting a previous run's data satisfy the final assertion.
const startsEmpty = await evaluate(
  `window.localStorage.getItem("vibecoding:notes:v1") === null`,
);
check("storage starts empty, so only this run's writes can appear", startsEmpty === true, String(startsEmpty));

const clickedTrack = await evaluate(`
  (() => {
    const candidates = [...document.querySelectorAll('button, a')];
    const target = candidates.find((el) =>
      /foundations/i.test(el.textContent || '') && el.closest('button, a')
    );
    if (!target) return null;
    target.click();
    return target.textContent.trim().slice(0, 40);
  })()
`);
check("a Foundations entry is reachable from the dashboard", !!clickedTrack, clickedTrack || "not found");
await sleep(2000);

let hasField = null;
if (clickedTrack) {
  // The note field is deliberately collapsed by default so a 20,000-word lesson
  // is not pushed down by an always-open textarea (NotesPanel.jsx). A reader
  // opens it, so the test opens it the same way rather than reaching into the DOM.
  // Target the toggle structurally, not by its label. A text match on
  // /note|write/i was too loose: the button's own label changes with state
  // ("Add a note" / "Your notes" / "Your answers" / "Hide notes"), and other
  // buttons on the page mention notes too, so the first version could click the
  // wrong control and still report success. `.notes__head button` is the toggle
  // by position in the component, and `aria-expanded` is the app's own statement
  // about whether the panel is open -- so the test checks that rather than
  // trusting that a click did what it was supposed to.
  const opened = await evaluate(`
    (() => {
      const btn = document.querySelector('.notes__head button');
      if (!btn) return 'no toggle';
      const before = btn.getAttribute('aria-expanded');
      btn.click();
      return before + ' -> pending';
    })()
  `);
  await sleep(600);
  const expanded = await evaluate(`
    (() => {
      const btn = document.querySelector('.notes__head button');
      return btn ? btn.getAttribute('aria-expanded') : 'missing';
    })()
  `);
  check(
    "the note panel can be opened",
    expanded === "true",
    `toggle found (${String(opened)}), aria-expanded now ${String(expanded)}`,
  );

  // Target the NOTE field specifically. A phase has more than one textarea: the
  // practice-task answer boxes carry `task__area`, and the note carries
  // `notes__area` (NotesPanel.jsx:81-83, id `note-<phaseId>`). A bare
  // `querySelector('textarea')` returns whichever comes first in the DOM, which
  // is a task box -- so the first version of this script typed the marker into
  // the wrong element and its "failure" said nothing about useNotes at all.
  // Selecting the class removes the ambiguity rather than relying on DOM order.
  hasField = await evaluate(`
    (() => {
      const all = [...document.querySelectorAll('textarea')];
      const t = document.querySelector('textarea.notes__area');
      if (!t) return null;
      return t.className + ' (of ' + all.length + ' textarea(s) on the page)';
    })()
  `);
}
check("a note textarea is present on the phase", !!hasField, hasField || "none found");

if (hasField) {
  const MARKER = "flush-marker-Zx9";

  const phaseIdBefore = await evaluate(`
    (() => {
      const h = document.querySelector('h1');
      return h ? h.textContent.trim() : '';
    })()
  `);

  // Type into the note field by dispatching a real input event, so React's
  // synthetic handler runs exactly as it would for a reader.
  // TYPE THROUGH THE BROWSER, NOT THE DOM.
  //
  // The previous version set `.value` with the native setter and dispatched a
  // synthetic `input` event -- the usual React-testing trick. It did not reach
  // React 19's onChange here, and the symptom was subtle: localStorage ended up
  // as `{}`, which is the *initial mount write*, so the assertion failed while
  // the app had never been asked to save anything. A test that cannot drive the
  // app is not evidence about the app.
  //
  // Input.insertText alone delivered nothing in headless. Dispatching real
  // keydown/keypress/char events per character is the path that actually reaches
  // the input pipeline. Each character goes through the browser's own event
  // dispatch, so React's onChange fires exactly as it does for a reader.
  const focused = await evaluate(`
    (() => {
      const t = document.querySelector('textarea.notes__area');
      if (!t) return 'no note field';
      t.focus();
      t.setSelectionRange(t.value.length, t.value.length);
      return t.id || 'focused';
    })()
  `);
  // `document.execCommand('insertText')` is the one that works here. It was the
  // third attempt, and the first two are recorded because the failure mode was
  // the same and instructive:
  //
  //   1. native value setter + synthetic `input` event  -> value stayed ""
  //   2. CDP Input.insertText                           -> value stayed ""
  //   3. CDP Input.dispatchKeyEvent per character       -> value stayed ""
  //
  // The field is a CONTROLLED input (`value={note || ""}`), so if React's
  // onChange never runs, React re-renders straight back to "". execCommand
  // routes through the browser's editing pipeline and does fire the input event
  // React subscribes to, which is why it succeeds where the others did not.
  const typed = await evaluate(`
    (() => {
      const t = document.querySelector('textarea.notes__area');
      if (!t) return 'no note field';
      t.focus();
      const ok = document.execCommand('insertText', false, ${JSON.stringify(MARKER)});
      return ok ? 'inserted' : 'execCommand refused';
    })()
  `);
  check("text input was accepted by the field", typed === "inserted", String(typed));
  await sleep(300);

  const typedInto = await evaluate(`
    (() => {
      const t = document.querySelector('textarea.notes__area');
      if (!t) return 'no note field';
      return t.id + ' = ' + JSON.stringify(t.value);
    })()
  `);
  // This asserts two separate things on purpose, because conflating them cost a
  // session: WHICH element received the text, and WHETHER the text arrived. If
  // this fails, the message says which half failed.
  check("the marker reached the note field", typedInto.includes(MARKER), String(typedInto));
  check("the note field is the one that was focused", String(focused).startsWith("note-"), String(focused));

  // ── THE RACE ──────────────────────────────────────────────────────────────
  // Everything above PROVES THE FIELD WORKS. None of it exercises the unmount
  // flush, and an earlier version of this script could not fail because of it:
  // it slept 300 ms between typing and navigating, which let the ordinary
  // `useEffect([notes])` write persist the text long before the navigation. The
  // prove-it-can-fail run passed 9/9 with the flush deliberately reverted --
  // that is how this was found. A guard that cannot fail is not evidence.
  //
  // The race is reproduced properly here. Two things make it real:
  //   1. STORAGE IS CLEARED FIRST, so only the unmount flush can persist
  //      anything. Searching for a marker the earlier write effect already
  //      stored would pass regardless of the flush.
  //   2. The typing and the click happen in ONE synchronous block, with no
  //      rAF and no await between them. An earlier version deferred the click
  //      into a requestAnimationFrame callback, which hands React an extra
  //      frame to run the write effect -- the opposite of the timing under
  //      test. Nothing may run between the input event and the navigation.
  const RACE_MARKER = MARKER + "-race";
  await evaluate(`window.localStorage.removeItem("vibecoding:notes:v1")`);

  const raceResult = await evaluate(`
    (() => {
      const t = document.querySelector('textarea.notes__area');
      if (!t) return 'no note field';
      t.focus();
      const ok = document.execCommand('insertText', false, ${JSON.stringify(RACE_MARKER)});
      if (!ok) return 'execCommand refused';
      const next = [...document.querySelectorAll('button, a')].find((el) =>
        /next/i.test(el.textContent || '') && !el.disabled
      );
      if (!next) return 'no next control';
      next.click();
      return 'typed-and-clicked';
    })()
  `);
  check(
    "a Next-phase control exists to navigate with",
    raceResult === "typed-and-clicked",
    String(raceResult),
  );
  await sleep(1500);

  const stored = await evaluate(`window.localStorage.getItem("vibecoding:notes:v1")`);
  const parsed = stored ? JSON.parse(stored) : {};
  // Search for RACE_MARKER, not MARKER. Storage was cleared before the race, so
  // a match can only have come from the unmount flush; searching for MARKER
  // would pass on text the ordinary write effect persisted earlier and prove
  // nothing about the flush at all.
  const entry = Object.entries(parsed).find(([, v]) => (v?.note || "").includes(RACE_MARKER));
  check(
    "the last keystrokes survive an immediate navigation",
    !!entry,
    entry
      ? `survived under ${entry[0]} (was on "${phaseIdBefore}")`
      : `race marker ${RACE_MARKER} not found in ${JSON.stringify(Object.keys(parsed))}`,
  );

  // Clean up so a re-run starts clean.
  await evaluate(`window.localStorage.removeItem("vibecoding:notes:v1")`);
}

const failed = checks.filter((c) => !c.ok);
console.log(
  `\n${failed.length === 0 ? "✓" : "✗"} notes flush: ${checks.length - failed.length}/${checks.length} check(s) passed`,
);
ws.close();
cleanup();
process.exit(failed.length === 0 ? 0 : 1);
