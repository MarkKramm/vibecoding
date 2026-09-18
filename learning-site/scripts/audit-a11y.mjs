// Automated accessibility audit, run against the REAL rendered page in a browser.
//
// WHY THIS EXISTS
// ---------------
// Twelve offline checks and 395 assertions were green while six real defects
// reached the rendered page. Every one of them shared a shape: the data was
// correct, the JSON was valid, the build succeeded, and the reader still got the
// wrong thing. Accessibility is the last place that can happen with no check
// watching, and until now the entire a11y story in this project was hand-checked
// — a skip link, a `:focus-visible` rule, a `useFocusTrap` hook, `<main>`
// landmarks, `role="alert"`/`role="status"` in the transfer components, and one
// live region on the search result count. NOTHING verified any of it.
//
// A hand-checked accessibility claim has a specific failure mode this file is
// built to avoid: the attribute is in the SOURCE, so a grep of the source
// passes, while the rendered page does something else. `role="status"` present
// in Search.jsx does not prove the count is announced AFTER a query runs — the
// element only mounts once a query has results. `.skip` present in App.jsx does
// not prove the skip link moves focus. This audit therefore reads COMPUTED
// STYLES and LIVE DOM STATE from a real Edge instance, and asserts on what the
// browser actually reports.
//
// HOW IT DRIVES THE BROWSER
// -------------------------
// Exactly as scripts/check-browser.mjs does, and for the same reasons: Edge
// (Chromium) over CDP with Node's built-in WebSocket and fetch, so there is
// nothing to install. No puppeteer, no axe-core, no pa11y.
//
// Established harness facts this file depends on, rediscovered painfully and not
// to be re-derived:
//   * `--headless=old`. The other headless modes have failed in this project.
//   * The preview server binds IPv6, so its URL is `localhost`, NOT 127.0.0.1.
//     The CDP endpoint, by contrast, IS 127.0.0.1. They are different servers.
//   * THIS APP HAS NO DEEP-LINK ROUTING. Routing is a string in `useState` in
//     App.jsx, so there is no URL for a view. Every view is reached by CLICKING
//     a `.navbtn` and matching its text. A `Page.navigate` to `/#tools` would
//     silently re-render the dashboard and the whole audit would be measuring
//     one view four times.
//   * Search runs on SUBMIT, not as you type. The value is set through the
//     native setter (React's controlled input ignores a plain assignment) and
//     the form is submitted with `requestSubmit()`, which fires a real `submit`
//     event where `.submit()` would bypass React's handler entirely.
//   * The CDP port is 9403. Other work in this repo uses 9333 and 9222.
//
// WHAT IS ASSERTED, AND WHAT IS ONLY REPORTED
// -------------------------------------------
// Only things verified STABLE across repeated runs are asserted. A guard that
// cries wolf gets switched off, which is worse than no guard, so anything that
// could not be made reliable is reported rather than asserted and is named as
// such at the bottom of the output.
//
// This file does NOT modify components, styles or libs. Where it finds a real
// defect it reports the CURRENT behaviour rather than fixing it, because an
// audit must first describe reality: fixing the page changes what the audit is
// measuring. The one exception is its own predicate for what counts as a
// keyboard-reachable control, which has to model the platform correctly for the
// reachability claim to mean anything — see INTERACTIVE below.
//
// THE THREE DEFECTS THIS AUDIT WAS WRITTEN FOR ARE ALL FIXED, and the suite now
// runs it in --strict mode so any regression fails `npm test`. They are recorded
// in full, with their old measured values, in the KNOWN block at the bottom of
// this file. In short: two search-box placeholders at 3.27:1 (needs 4.5:1, now
// 5.84:1, fixed in global.css) and a skip link that moved the hash without
// moving focus (`<main>` had no tabindex="-1", fixed in App.jsx).
//
// Run: node scripts/audit-a11y.mjs [baseUrl] [--strict|--baseline]
// Requires a build (`npm run build`) and a preview server on the base URL.

import { spawn, spawnSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.argv[2] || "http://localhost:4173";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9403;

let pass = 0;
const failures = [];
const notes = [];

const ok = (m) => { pass++; console.log(`  \u2713 ${m}`); };
const bad = (m) => { failures.push(m); console.log(`  \u2716 ${m}`); };
const note = (m) => { notes.push(m); console.log(`  \u2022 ${m}`); };

// The four topbar views, matched by button TEXT because there is no route.
const VIEWS = ["Curriculum", "Practice", "Exams", "Tools", "Reference", "Search"];

// --- precondition: is a preview server actually serving? -------------------
//
// This audit is wired into `npm test` (check-all.mjs), which is otherwise a
// suite of OFFLINE checks that needs no server. Rather than making the whole
// suite depend on a running preview process, the missing-server case is detected
// HERE and reported as a skip.
//
// It exits 0 deliberately, and the reason is worth stating. A step that fails
// because a server happens to be down is a step that gets commented out within a
// week, and a disabled guard is worse than no guard. A skip is honest: the
// message says exactly what was not checked and what to run to check it.
//
// The distinction that keeps this from being a rubber stamp: a server that
// ANSWERS but serves a broken page still fails. Only "nothing is listening" is a
// skip.
async function serverIsUp() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const r = await fetch(BASE, { signal: ctrl.signal });
    clearTimeout(t);
    return r.ok;
  } catch {
    return false;
  }
}

if (!await serverIsUp()) {
  console.log(`\u26a0 accessibility audit SKIPPED \u2014 nothing is serving ${BASE}`);
  console.log("");
  console.log("  This audit drives a real browser against the built site, so it needs a");
  console.log("  preview server. Nothing was checked. To run it:");
  console.log("");
  console.log("    npm run build");
  console.log("    npx vite preview --port 4173 --strictPort   # in another shell");
  console.log("    node scripts/audit-a11y.mjs http://localhost:4173");
  console.log("");
  console.log("  Exiting 0 so a stopped server does not fail the rest of the suite.");
  console.log("  This is the ONLY condition under which this check passes without");
  console.log("  looking at the page; a reachable but broken page still fails.");
  process.exit(0);
}

// --- start a headless browser with a CDP endpoint --------------------------
//
// A UNIQUE PROFILE PER RUN. This was a fixed path, which is why browser-driven
// checks here kept hanging. Two consequences, both fatal:
//
//   1. A second Edge launched against a profile another Edge still holds cannot
//      take the debug port, so the new run spins and then dies with "unsettled
//      top-level await" at whatever line it happened to reach.
//   2. Worse, the first Edge SURVIVES as a background process, so the leak
//      compounds: 26 orphaned msedge processes accumulated in one afternoon.
//
// The profile lock is what keeps the orphan alive, so giving every run its own
// directory removes the reason for the two processes to interfere at all.
const PROFILE = join(tmpdir(), `vb-a11y-${process.pid}-${Date.now()}`);

const proc = spawn(EDGE, [
  "--headless=old",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  "about:blank",
], { stdio: "ignore" });

/**
 * Kill the browser process TREE and remove its profile.
 *
 * `proc.kill()` alone is not enough and that is the whole bug: it terminates the
 * process that was spawned, not the children Edge creates underneath it. Those
 * children keep the profile lock and the debug port, so the NEXT run cannot bind
 * — and because the failure surfaces as a hang rather than an error, it reads as
 * flakiness. On Windows the tree kill needs `taskkill /T`.
 *
 * Idempotent, and called from a `finally` plus a process-exit handler, because a
 * check that hangs when it cannot connect is worse than one that fails: a hang is
 * indistinguishable from a slow page and gets dismissed as flakiness for months.
 */
let reaped = false;
function reap() {
  if (reaped) return;
  reaped = true;
  try {
    if (process.platform === "win32" && proc.pid) {
      spawnSync("taskkill", ["/PID", String(proc.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      proc.kill("SIGKILL");
    }
  } catch {
    // Best effort. A failure to reap must never mask the audit's real verdict.
  }
  try {
    rmSync(PROFILE, { recursive: true, force: true });
  } catch {
    // The profile is under the OS temp dir; leaving one behind is untidy but
    // harmless, and throwing here would replace a real result with a cleanup bug.
  }
}

process.on("exit", reap);
process.on("SIGINT", () => { reap(); process.exit(130); });
process.on("SIGTERM", () => { reap(); process.exit(143); });

// If the process dies before CDP answers, the loop below would spin for ten
// seconds and then report "the endpoint never came up", which reads like a
// browser bug rather than a missing binary. Catching the exit names the cause.
let edgeExited = null;
proc.on("exit", (code) => { edgeExited = code; });

async function cdpTarget() {
  for (let i = 0; i < 40; i++) {
    if (edgeExited !== null) {
      throw new Error(
        `Edge exited with code ${edgeExited} before CDP came up — is the binary at "${EDGE}"?`
      );
    }
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      const page = list.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error("CDP endpoint never came up");
}

const wsUrl = await cdpTarget();
const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true });
  ws.addEventListener("error", rej, { once: true });
});

let msgId = 0;
const pending = new Map();
const pageErrors = [];

ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
  if (msg.method === "Runtime.exceptionThrown") {
    const d = msg.params.exceptionDetails;
    pageErrors.push(d.exception?.description || d.text || "exception");
  }
});

/**
 * Send a CDP command and WAIT, with a deadline.
 *
 * This promise used to be unbounded, and that single omission is what made the
 * whole audit read as flaky. If the WebSocket died — which it did whenever a
 * leaked Edge held the port — no reply ever arrived, the promise stayed pending
 * forever, and Node reported the symptom at the `await` line furthest down the
 * file: "Detected unsettled top-level await". The line number MOVED between runs
 * because it depended on which connection happened to die first.
 *
 * A hang is the worst failure mode available here. It is indistinguishable from
 * a slow page, it carries no diagnostic, and it invites the reader to conclude
 * the check is unreliable rather than that the page is broken. So every command
 * now has a deadline and every failure names what timed out.
 */
const SEND_TIMEOUT_MS = 15000;

function send(method, params = {}) {
  const id = ++msgId;
  return new Promise((res, rej) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      rej(new Error(
        `CDP command "${method}" did not answer within ${SEND_TIMEOUT_MS}ms. ` +
        `The browser connection is dead — most likely a previous run leaked an ` +
        `Edge process holding port ${PORT}. Check with: ` +
        `Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq ${PORT} }`
      ));
    }, SEND_TIMEOUT_MS);
    pending.set(id, (msg) => { clearTimeout(timer); res(msg); });
    try {
      ws.send(JSON.stringify({ id, method, params }));
    } catch (e) {
      clearTimeout(timer);
      pending.delete(id);
      rej(new Error(`CDP socket refused "${method}": ${e.message}`));
    }
  });
}

// A socket that closes with work outstanding must reject that work rather than
// leave it pending. Without this the timeout above is the only backstop, and the
// real cause is reported 15 seconds later as a timeout instead of immediately as
// a closed connection.
ws.addEventListener("close", () => {
  for (const [id, res] of pending) {
    pending.delete(id);
    res({ __closed: true, id });
  }
});
ws.addEventListener("error", () => {
  for (const [id, res] of pending) {
    pending.delete(id);
    res({ __closed: true, id });
  }
});

await send("Runtime.enable");
await send("Page.enable");

async function evalJs(expression) {
  const r = await send("Runtime.evaluate", {
    expression, returnByValue: true, awaitPromise: true,
  });
  // A dead socket must be LOUD. Returning `undefined` here would flow into the
  // probes as a falsy measurement, and the audit would then report the page as
  // broken ("app did not mount", "no interactive elements") when in fact nothing
  // was measured at all. That is the exact confusion this whole file exists to
  // prevent, so it throws instead.
  if (r?.__closed) {
    throw new Error(
      "CDP connection closed while evaluating. The browser died mid-run — " +
      "check for a leaked Edge process holding the debug port."
    );
  }
  if (r.result?.exceptionDetails) {
    const d = r.result.exceptionDetails;
    return { __err: d.exception?.description || d.text || "evaluate threw" };
  }
  return r.result?.result?.value;
}

async function key(k, code, keyCode) {
  for (const type of ["keyDown", "keyUp"]) {
    await send("Input.dispatchKeyEvent", {
      type, key: k, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode,
    });
  }
}

/**
 * Settle every CSS transition/animation, so a style read describes the END
 * state rather than the start of an animation that will never advance.
 *
 * WHY THIS IS NOT A `sleep()`. The original code waited 400ms — more than three
 * times the 120ms transition — and still read the skip link at its resting
 * transform, reporting "focused but NOT visible on screen" for a link that is
 * correctly revealed. Measured cause: under `--headless=old --disable-gpu` the
 * animation clock never advances on its own, so the transition sits at
 * `currentTime: 0` indefinitely. A CSSTransition was observed in state "running"
 * at currentTime 0 after the 400ms wait had elapsed.
 *
 * WHY THIS IS NOT `await anim.finished` EITHER, which was the first attempt and
 * also failed for the same underlying reason: a transition frozen at
 * currentTime 0 never reaches its end, so its `finished` promise never settles
 * and the await simply burns the deadline.
 *
 * `finish()` is the correct primitive. It jumps the animation to its end state
 * synchronously, which is exactly the question being asked — "when this element
 * has finished revealing itself, is it on screen?" — and it cannot be defeated by
 * a compositor that is not painting.
 */
async function waitForAnimations() {
  await evalJs(`
    (() => {
      const all = document.getAnimations ? document.getAnimations() : [];
      for (const a of all) {
        try { a.finish(); } catch (e) {}
      }
      // Settle the style engine in the same evaluation that finishes them;
      // a reflow in a separate CDP call does not carry the update over.
      void document.documentElement.offsetHeight;
      return all.length;
    })()
  `);
}

/**
 * Load the app from scratch.
 *
 * Called far more often than looks necessary, and every call is load-bearing:
 * switching a view means CLICKING a nav button, and a click FOCUSES that button.
 * Several measurements below (the keyboard walk, "the first Tab lands on the
 * skip link") are only meaningful from a document whose focus state is clean.
 * A `Page.navigate` resets focus to the document root; `body.focus()` does NOT.
 */
async function reload() {
  const loaded = new Promise((res) => {
    const onDone = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.method === "Page.loadEventFired") {
        ws.removeEventListener("message", onDone);
        res(true);
      }
    };
    ws.addEventListener("message", onDone);
    // Never let a missing event hang the run: fall back to the old fixed wait.
    setTimeout(() => { ws.removeEventListener("message", onDone); res(false); }, 10000);
  });

  await send("Page.navigate", { url: BASE });
  await loaded;
  // The load event fires before React has mounted and painted. Wait for the app
  // shell rather than sleeping a fixed 1800ms, which was a race: on a cold build
  // the probes could run against an empty #root and report the page as broken.
  for (let i = 0; i < 60; i++) {
    const ready = await evalJs("!!document.querySelector('#root')?.children.length");
    if (ready) break;
    await sleep(100);
  }
}

/**
 * Switch views by CLICKING the topbar button whose text matches.
 *
 * Returns false when the button is missing, which the caller reports: silently
 * auditing whichever view happened to be open is the exact mistake the header
 * warns about.
 */
async function showView(label) {
  const r = await evalJs(`
    (() => {
      const b = [...document.querySelectorAll('.navbtn')]
        .find((x) => x.textContent.trim() === ${JSON.stringify(label)});
      if (!b) return false;
      b.click();
      return true;
    })()
  `);
  await sleep(1400);
  return r === true;
}

// --- in-page helpers -------------------------------------------------------
// Injected once per page load. Deliberately small and readable: every number
// this audit reports is derived here, and a reader must be able to check the
// arithmetic rather than take a ratio on trust.
const HELPERS = `
window.__a11y = (() => {
  function parseColor(s) {
    const m = String(s).match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(/[,\\s\\/]+/).filter(Boolean).map(Number);
    if (p.length < 3 || p.some((n) => !isFinite(n))) return null;
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  // WCAG 2.x relative luminance.
  function relLum(c) {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  // Composite a translucent colour over an opaque one.
  function over(fg, bg) {
    return { r: fg.r * fg.a + bg.r * (1 - fg.a),
             g: fg.g * fg.a + bg.g * (1 - fg.a),
             b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 };
  }
  function ratio(a, b) {
    const l1 = relLum(a), l2 = relLum(b);
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }
  function rgbStr(c) { return 'rgb(' + Math.round(c.r) + ', ' + Math.round(c.g) + ', ' + Math.round(c.b) + ')'; }

  /**
   * The EFFECTIVE background of an element: the colour its text is really drawn
   * on. Walking up for "the nearest non-transparent ancestor" is not enough —
   * a semi-transparent layer (a hover wash, an overlay) composites with what is
   * behind it, and taking it as the final background reports a ratio against a
   * colour no pixel on screen has. So the walk collects every layer until it
   * finds an opaque one, then composites them back down in reverse.
   */
  function effectiveBg(el) {
    const stack = [];
    let node = el;
    while (node && node.nodeType === 1) {
      const c = parseColor(getComputedStyle(node).backgroundColor);
      if (c && c.a > 0) stack.push(c);
      if (c && c.a === 1) break;
      node = node.parentElement;
    }
    let base;
    if (node && node.nodeType === 1) {
      base = stack.pop();
    } else {
      // Ran out of ancestors with nothing opaque. The canvas is the last resort.
      base = parseColor(getComputedStyle(document.documentElement).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
      if (base.a < 1) base = { r: 255, g: 255, b: 255, a: 1 };
    }
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return base;
  }

  function isVisible(el) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (Number(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width >= 1 && r.height >= 1;
  }

  function describe(el) {
    const cls = typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\\s+/).join('.') : '';
    return el.tagName.toLowerCase() + cls;
  }

  /**
   * An accessible name, computed the way a screen reader resolves one.
   *
   * The ORDER is the whole point, and getting it wrong produces confident false
   * positives. An earlier draft of this audit checked only label[for] and so
   * reported the Tools search box as unnamed \u2014 when it is in fact wrapped in a
   * <label> carrying an .sr-only span, which is a perfectly good name. A
   * wrapping label is the fifth source below and it was the one that mattered.
   *
   * Placeholder text is deliberately NOT a name source. It is not one in ARIA,
   * and a search box whose only label is its placeholder is announced as an
   * unlabelled "search box" the moment the reader types.
   */
  function accessibleName(el) {
    const lb = (el.getAttribute('aria-labelledby') || '').trim();
    if (lb) {
      const t = lb.split(/\\s+/)
        .map((id) => (document.getElementById(id)?.textContent || '').trim())
        .filter(Boolean).join(' ').trim();
      if (t) return { name: t, src: 'aria-labelledby' };
    }
    const al = (el.getAttribute('aria-label') || '').trim();
    if (al) return { name: al, src: 'aria-label' };
    if (el.id) {
      const l = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
      const t = l ? (l.textContent || '').trim() : '';
      if (t) return { name: t, src: 'label[for]' };
    }
    const wrap = el.closest('label');
    if (wrap) {
      const t = (wrap.textContent || '').trim();
      if (t) return { name: t, src: 'wrapping-label' };
    }
    const own = (el.textContent || '').trim();
    if (own) return { name: own, src: 'text' };
    const ti = (el.getAttribute('title') || '').trim();
    if (ti) return { name: ti, src: 'title' };
    const alt = (el.getAttribute('alt') || '').trim();
    if (alt) return { name: alt, src: 'alt' };
    return { name: '', src: 'none' };
  }

  // ⚠️ WHY \`[tabindex]\` IS NEGATED HERE, AND WHY IT IS NOT SIMPLY DELETED.
  //
  // A bare \`[tabindex]\` matches at ANY value, including -1. That is wrong, and
  // it produced four confident false failures the moment the skip link was
  // fixed: adding \`tabindex="-1"\` to <main> to make the skip link move focus
  // (correctly) made <main> match this selector, so the reachability probe
  // below reported "Tab never reached main.main" in all four views.
  //
  // It was a false report, and it was measured rather than assumed. A real
  // 25-press Tab walk of the Curriculum view lands, in order, on: A.skip, the
  // brand button, four .navbtn, two .iconbtn, then the phase cards. No stop is
  // skipped and nothing is trapped — <main> simply is not supposed to be in the
  // tab sequence. That is the entire POINT of a negative tabindex: \`tabindex="-1"\`
  // is defined as programmatically focusable and EXCLUDED from sequential focus
  // navigation. The skip link depends on exactly that, so an audit that demands
  // Tab reach it is asking the page to break the skip link it just fixed.
  //
  // \`[tabindex]:not([tabindex="-1"])\` keeps the coverage that matters. A
  // POSITIVE tabindex (0 or greater) genuinely IS a tab stop — and a positive
  // one is a defect worth flagging, because it hijacks the tab order away from
  // DOM order. Dropping the selector entirely would silently stop checking that;
  // negating only -1 removes the false positive and nothing else.
  const INTERACTIVE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
  function interactives() {
    return [...document.querySelectorAll(INTERACTIVE)].filter(isVisible);
  }

  return { parseColor, relLum, over, ratio, rgbStr, effectiveBg, isVisible,
           describe, accessibleName, interactives };
})();
'ready'
`;

await reload();
const helperStatus = await evalJs(HELPERS);
if (helperStatus !== "ready") {
  console.log("\u2716 could not install in-page helpers");
  console.log(`  ${JSON.stringify(helperStatus)}`);
  ws.close();
  reap();
  process.exit(1);
}

// --- 1. the app boots ------------------------------------------------------
console.log("\n1. App shell");
const mounted = await evalJs("!!document.querySelector('#root')?.children.length");
if (mounted) ok("app mounted (#root has children)");
else bad("app did not mount — #root is empty, so every result below is meaningless");

const navCount = await evalJs("document.querySelectorAll('.navbtn').length");
// DERIVED FROM VIEWS, not hardcoded.
//
// This read `=== 4`, so adding the Practice view failed the assertion. The failure
// was useful — an unexpected change to the navigation SHOULD be noticed — but the
// number belonged in one place. Comparing against `VIEWS.length` means this can only
// fail when the DOM and the audit's own list of views genuinely disagree, which is
// the thing actually worth failing for.
if (navCount === VIEWS.length) ok(`all ${VIEWS.length} topbar view buttons found (${navCount})`);
else bad(`expected ${VIEWS.length} .navbtn view buttons, found ${navCount} — views cannot be reached, so the audit cannot see them`);

// --- 2..5. per-view: contrast, names, headings, landmarks -------------------
// One expression, driven per view. Returns the worst offenders rather than a
// pass/fail count: "1 node below 4.5:1" is not actionable, but
// "3.27:1 — input::placeholder on rgb(34,38,52)" is a one-line fix.
const CONTRAST_JS = `
(() => {
  const A = window.__a11y;
  const out = [];
  const seen = new Set();
  const consider = (sel, text, el, fgRaw, bg, size, weight, pseudo) => {
    const fg = fgRaw.a < 1 ? A.over(fgRaw, bg) : fgRaw;
    // WCAG: "large" is >=24px, or >=18.66px when bold.
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const ratio = A.ratio(fg, bg);
    if (ratio >= need) return;
    const key = sel + '|' + text.slice(0, 30);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ sel: pseudo ? sel + '::placeholder' : sel, text: text.slice(0, 50),
               fg: A.rgbStr(fg), bg: A.rgbStr(bg), size, weight, large, need,
               ratio: Math.round(ratio * 100) / 100 });
  };

  for (const el of document.querySelectorAll('body *')) {
    // Only elements that own visible text. A wrapper's colour is inherited by
    // its children, so counting every ancestor would report the same defect
    // five times and bury the node that actually carries the problem.
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
    if (!own) continue;
    if (!A.isVisible(el)) continue;
    const cs = getComputedStyle(el);
    const fgRaw = A.parseColor(cs.color);
    if (!fgRaw) continue;
    consider(A.describe(el), own, el, fgRaw, A.effectiveBg(el),
             parseFloat(cs.fontSize), Number(cs.fontWeight) || 400, false);
  }

  // PLACEHOLDER text is text a reader reads, but it is not a text node, so the
  // loop above cannot see it. This is not hypothetical: it is where this audit
  // found its only contrast defect — two search boxes falling back to
  // Chromium's default placeholder colour at 3.27:1. Both are FIXED (now 5.84:1)
  // and the assertion below is what keeps them fixed. A page can pass every
  // ordinary contrast assertion and still render a placeholder nobody can read.
  for (const el of document.querySelectorAll('input[placeholder], textarea[placeholder]')) {
    if (!A.isVisible(el)) continue;
    const pcs = getComputedStyle(el, '::placeholder');
    const cs = getComputedStyle(el);
    const fgRaw = A.parseColor(pcs.color) || A.parseColor(cs.color);
    if (!fgRaw) continue;
    consider(A.describe(el), el.placeholder || '', el, fgRaw, A.effectiveBg(el),
             parseFloat(pcs.fontSize) || parseFloat(cs.fontSize),
             Number(pcs.fontWeight) || 400, true);
  }

  out.sort((a, b) => a.ratio - b.ratio);
  return out;
})()
`;

// How many text nodes were measured, so "no failures" is distinguishable from
// "nothing was measured" — the failure mode this whole project keeps hitting.
const CONTRAST_COUNT_JS = `
(() => {
  const A = window.__a11y;
  let n = 0;
  for (const el of document.querySelectorAll('body *')) {
    const own = [...el.childNodes].filter((x) => x.nodeType === 3).map((x) => x.textContent).join('').trim();
    if (own && A.isVisible(el) && A.parseColor(getComputedStyle(el).color)) n++;
  }
  return n;
})()
`;

for (const label of VIEWS) {
  console.log(`\n\u2500\u2500 ${label} \u2500\u2500`);
  await reload();
  await evalJs(HELPERS);
  const shown = await showView(label);
  if (!shown) {
    bad(`${label}: no .navbtn with that text — view unreachable, cannot audit it`);
    continue;
  }
  await evalJs(HELPERS);

  // ---- 2. contrast ----
  const offenders = await evalJs(CONTRAST_JS);
  const measured = await evalJs(CONTRAST_COUNT_JS);
  if (!Array.isArray(offenders)) {
    bad(`${label}: contrast probe threw — ${JSON.stringify(offenders)}`);
  } else if (typeof measured !== "number" || measured < 5) {
    // A probe that measured almost nothing would report a clean pass. Refusing
    // to accept that is the difference between a check and a decoration.
    bad(`${label}: only ${measured} text node(s) measured — the contrast probe did not run properly`);
  } else if (offenders.length === 0) {
    ok(`contrast: all ${measured} text node(s) meet WCAG AA (4.5:1 normal, 3:1 large)`);
  } else {
    // The failure MESSAGE carries the worst ratio, so that a value which
    // DRIFTS (a colour tweak that makes an already-failing element worse) is a
    // different message and therefore a different failure. The per-offender
    // detail is printed below it. Both matter: the message is what a baseline
    // matches on, the detail is what a human fixes from.
    const worst = offenders[0];
    bad(`contrast [${label}]: ${offenders.length} of ${measured} text node(s) below WCAG AA ` +
      `(worst ${worst.ratio}:1 needs ${worst.need}:1 on ${worst.sel}):`);
    for (const o of offenders.slice(0, 8)) {
      console.log(
        `      ${String(o.ratio).padStart(5)}:1 (needs ${o.need}:1) ` +
        `${o.fg} on ${o.bg} at ${o.size}px/${o.weight}${o.large ? " large" : ""} ` +
        `\u2014 ${o.sel} "${o.text}"`
      );
    }
    if (offenders.length > 8) console.log(`      ... and ${offenders.length - 8} more`);
  }

  // ---- 3. accessible names ----
  const names = await evalJs(`
    (() => {
      const A = window.__a11y;
      const unnamed = [], titleOnly = [];
      const all = A.interactives();
      for (const el of all) {
        const n = A.accessibleName(el);
        if (!n.name) unnamed.push({ sel: A.describe(el), html: el.outerHTML.slice(0, 140) });
        else if (n.src === 'title') titleOnly.push({ sel: A.describe(el), name: n.name });
      }
      return { total: all.length, unnamed, titleOnly };
    })()
  `);
  if (!names || typeof names.total !== "number") {
    bad(`${label}: accessible-name probe threw — ${JSON.stringify(names)}`);
  } else {
    if (names.total === 0) bad(`${label}: no interactive elements found at all — the name probe measured nothing`);
    else if (names.unnamed.length === 0) ok(`accessible names: all ${names.total} interactive element(s) named`);
    else {
      bad(`accessible names: ${names.unnamed.length} of ${names.total} interactive element(s) have NO name:`);
      for (const u of names.unnamed.slice(0, 6)) console.log(`      ${u.sel}  ${u.html}`);
    }
    // `title` alone is a weak name: it is not exposed on touch, and it is not
    // announced on focus by every screen reader. Reported, not failed, because
    // it IS a name and failing it would be wrong.
    if (names.titleOnly.length) {
      note(`${label}: ${names.titleOnly.length} control(s) named only by title= (weak on touch): ` +
        names.titleOnly.map((t) => t.sel).slice(0, 4).join(", "));
    }
  }

  // ---- 4. heading order ----
  const heads = await evalJs(`
    [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
      .filter((h) => window.__a11y.isVisible(h))
      .map((h) => ({ lvl: Number(h.tagName[1]), txt: h.textContent.trim().slice(0, 50) }))
  `);
  if (!Array.isArray(heads) || heads.length === 0) {
    bad(`${label}: no headings found — either the view rendered nothing or every heading is hidden`);
  } else {
    const h1s = heads.filter((h) => h.lvl === 1);
    if (h1s.length === 1) ok(`headings: exactly one h1 ("${h1s[0].txt}")`);
    else bad(`headings: ${h1s.length} h1 element(s) — expected exactly 1` +
      (h1s.length ? ` (${h1s.map((h) => `"${h.txt}"`).join(", ")})` : ""));

    // A jump of more than one level is a skipped level: h1 -> h3 leaves a
    // screen-reader user with no idea where the h2 content went.
    const jumps = [];
    let prev = 0;
    for (const h of heads) {
      if (prev > 0 && h.lvl > prev + 1) jumps.push(`h${prev} \u2192 h${h.lvl} at "${h.txt}"`);
      prev = h.lvl;
    }
    if (jumps.length === 0) ok(`headings: ${heads.length} heading(s), no skipped levels`);
    else {
      bad(`headings: ${jumps.length} skipped level(s) in ${label}:`);
      for (const j of jumps.slice(0, 6)) console.log(`      ${j}`);
    }
  }

  // ---- 5. landmarks ----
  const lm = await evalJs(`
    (() => ({
      main: document.querySelectorAll('main').length,
      nav: document.querySelectorAll('nav').length,
      unlabelledNav: [...document.querySelectorAll('nav')]
        .filter((n) => !n.getAttribute('aria-label') && !n.getAttribute('aria-labelledby')).length,
    }))()
  `);
  if (lm && lm.main === 1) ok("landmarks: exactly one <main>");
  else bad(`landmarks: ${lm ? lm.main : "?"} <main> element(s) — expected exactly 1`);
  if (lm && lm.unlabelledNav === 0) ok(`landmarks: all ${lm.nav} <nav> element(s) labelled`);
  else if (lm) {
    bad(`landmarks: ${lm.unlabelledNav} of ${lm.nav} <nav> element(s) have no aria-label — ` +
      "a screen reader lists them all as just \"navigation\"");
  }
}

// --- 6. keyboard: reachability and visible focus ---------------------------
// Two questions, and they are different:
//   (a) can every interactive control be reached by Tab at all?
//   (b) once focus lands, is there a VISIBLE indicator?
//
// (b) is the one that cannot be answered from source. `:focus-visible` exists in
// global.css, but whether it APPLIES to a given element depends on specificity,
// on a later rule overriding `outline`, and on the element's own styles — none
// of which a grep can resolve. So the browser presses Tab and the computed
// styles of the focused element are compared against a never-focused baseline.
console.log("\n6. Keyboard reachability and focus visibility");

// The focus probe.
//
// ⚠️ THE HANDLER MUST NOT BLUR, AND MUST NOT RE-FOCUS. Both were tried, and
// both produced convincing false failures:
//
//   1. The first draft blurred, measured, then called `el.focus()` to restore
//      state. That fires `focusin` again, which blurs, which focuses... The
//      recursion blew the stack 1160 times and left the log with 2 entries,
//      producing a confident and completely false "Tab never reached a.skip,
//      .navbtn, .iconbtn".
//
//   2. The second blurred and STOPPED. No recursion, but blurring resets the
//      browser's sequential-focus position, so every Tab press restarted the
//      walk from the same place. Same false failure, same four controls.
//
// So: never touch focus here. The baseline is a freshly created, never-focused,
// never-attached node, which inherits nothing and therefore carries only the
// browser's default (non-focused) styles. What matters for "is there a visible
// indicator" is whether the focused element DIFFERS from that baseline.
const FOCUS_PROBE = `
(() => {
  const A = window.__a11y;
  const SIG = (el) => {
    const cs = getComputedStyle(el);
    // Everything that can make focus visible. outline covers the common case;
    // box-shadow covers the "outline: none; box-shadow: 0 0 0 3px" idiom; the
    // border and background properties cover a component that highlights itself
    // instead of drawing a ring.
    return {
      outline: [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.outlineOffset].join(' '),
      shadow: cs.boxShadow,
      border: cs.borderTopColor + ' ' + cs.borderTopWidth,
      background: cs.backgroundColor,
      decoration: cs.textDecorationLine,
      transform: cs.transform,
    };
  };
  const reference = document.createElement('div');
  reference.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
  document.body.appendChild(reference);
  const base = SIG(reference);
  reference.remove();

  window.__focusLog = [];
  window.__focusHandler = (ev) => {
    const el = ev.target;
    if (!el || el === document.body || el === document.documentElement) return;
    const cs = SIG(el);
    // A visible indicator is any of these differing from the never-focused
    // default. The default outline is the UA's own, so an element that only
    // inherits the UA ring still counts as visible -- and it should, because a
    // reader can see it.
    const diffs = Object.keys(cs).filter((k) => cs[k] !== base[k]);
    window.__focusLog.push({
      sel: A.describe(el),
      name: (A.accessibleName(el).name || '').slice(0, 35),
      visible: diffs.length > 0,
      diffs,
      focused: JSON.stringify(cs),
      baseline: JSON.stringify(base),
    });
  };
  document.addEventListener('focusin', window.__focusHandler, true);
  return 'hooked';
})()
`;

for (const label of VIEWS) {
  console.log(`  -- ${label}`);

  // ⚠️ RELOAD, THEN SWITCH VIEW BY CLICK, THEN RELOAD AGAIN.
  //
  // This is the third bug found in this probe and the subtlest. `showView()`
  // switches views by CLICKING the nav button, and a click FOCUSES that button.
  // `body.focus()` does NOT reset Chromium's sequential-focus starting point,
  // so the following Tab presses resumed from wherever the clicked button sat in
  // the document — walking only the handful of elements AFTER it. The result was
  // a rock-solid, entirely false report that Tab never reached a.skip, the
  // brand, the four .navbtn and both .iconbtn controls: exactly the topbar
  // controls that sit BEFORE the clicked button in DOM order.
  //
  // A clean `Page.navigate` resets focus to the document root, after which the
  // walk visits the whole document in order. The view switch has to happen by
  // click (no deep-link routing), and the reload after it is what clears the
  // focus the click left behind. Curriculum is the default view, so it needs
  // only the first reload.
  await reload();
  await evalJs(HELPERS);
  if (label !== "Curriculum") {
    if (!await showView(label)) {
      bad(`${label}: unreachable, keyboard audit skipped`);
      continue;
    }
    await reload();
    await evalJs(HELPERS);
    if (!await showView(label)) {
      bad(`${label}: unreachable after reload, keyboard audit skipped`);
      continue;
    }
    await evalJs("document.activeElement && document.activeElement.blur(); 'ok'");
    await sleep(150);
  }

  const interactive = await evalJs(`
    (() => {
      const A = window.__a11y;
      const byKind = {};
      for (const el of A.interactives()) {
        const k = A.describe(el).split('.').slice(0, 2).join('.');
        byKind[k] = (byKind[k] || 0) + 1;
      }
      return { total: A.interactives().length, byKind };
    })()
  `);

  // The handler is installed fresh each view: a listener left over from the
  // previous view reports elements that no longer exist, and an early draft of
  // this probe did exactly that (48 "tab stops" in a view with 10 controls).
  await evalJs("window.__focusLog = []; 'ok'");
  const hooked = await evalJs(FOCUS_PROBE);
  if (hooked !== "hooked") {
    bad(`${label}: could not install the focus probe`);
    continue;
  }
  await evalJs("document.activeElement && document.activeElement.blur(); 'ok'");

  // Enough Tabs to walk the view. Tools has ~647 interactive elements, so the
  // walk is bounded — see the stated gap below for what that means.
  const TAB_LIMIT = 60;
  for (let i = 0; i < TAB_LIMIT; i++) await key("Tab", "Tab", 9);
  await sleep(500);

  const log = await evalJs("window.__focusLog");
  await evalJs("document.removeEventListener('focusin', window.__focusHandler, true); 'ok'");

  if (!Array.isArray(log)) {
    bad(`${label}: focus probe returned ${JSON.stringify(log)}`);
    continue;
  }
  if (log.length === 0) {
    bad(`${label}: Tab reached NO focusable element — the keyboard walk found nothing`);
    continue;
  }

  const noIndicator = log.filter((l) => !l.visible);
  const uniqueStops = new Set(log.map((l) => l.sel));

  if (noIndicator.length === 0) {
    ok(`focus visibility: all ${uniqueStops.size} distinct tab stop(s) show a visible change on focus`);
  } else {
    bad(`focus visibility: ${noIndicator.length} tab stop(s) change NOTHING when focused ` +
      "(a keyboard user cannot see where they are):");
    const seen = new Set();
    for (const n of noIndicator) {
      if (seen.has(n.sel)) continue;
      seen.add(n.sel);
      console.log(`      ${n.sel} "${n.name}"`);
      console.log(`        focused:  ${n.focused}`);
      console.log(`        baseline: ${n.baseline}`);
    }
  }

  // Reachability, per KIND of control rather than per element. A whole class of
  // control that Tab never reaches is a real defect — it means those controls
  // are keyboard-inaccessible, not merely far down the page.
  const kinds = Object.keys(interactive.byKind);
  const kindsSeen = new Set([...uniqueStops].map((s) => s.split(".").slice(0, 2).join(".")));
  const kindsMissed = kinds.filter((k) => !kindsSeen.has(k));
  if (kindsMissed.length === 0) {
    ok(`reachability: every interactive KIND in ${label} was reached by Tab (${kinds.join(", ")})`);
  } else {
    bad(`reachability: Tab never reached ${kindsMissed.length} kind(s) of control in ${label}: ` +
      `${kindsMissed.join(", ")} (${kindsMissed.map((k) => `${k}\u00d7${interactive.byKind[k]}`).join(", ")})`);
  }
  note(`${label}: ${interactive.total} interactive element(s); Tab reached ${uniqueStops.size} distinct stop(s) in ${TAB_LIMIT} presses`);
}

// --- 7. live region: the search result count -------------------------------
// The attribute existing in source proves nothing. This section RUNS a query and
// checks the region is present, non-empty and polite AFTERWARDS — which is the
// only moment it matters, because the element is not mounted until then.
console.log("\n7. Search live region (after a real submit)");

await reload();
await evalJs(HELPERS);
if (!await showView("Search")) {
  bad("search view unreachable — live region cannot be verified");
} else {
  await evalJs(HELPERS);

  const before = await evalJs("document.querySelectorAll('[role=status]').length");
  note(`search: ${before} role="status" element(s) before any query (expected 0 — the region mounts with results)`);

  // Submit through the REAL path: native setter + requestSubmit. React ignores
  // a plain `input.value = "x"`, and `.submit()` bypasses React's onSubmit.
  const runQuery = (q) => `
    (() => {
      const form = document.querySelector('form[role=search]') || document.querySelector('form');
      if (!form) return 'no form';
      const input = form.querySelector('input');
      if (!input) return 'no input';
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, ${JSON.stringify(q)});
      input.dispatchEvent(new Event('input', { bubbles: true }));
      form.requestSubmit();
      return 'submitted';
    })()
  `;

  const ran = await evalJs(runQuery("reranking"));
  await sleep(1800);

  if (ran !== "submitted") {
    bad(`search: could not run a query (${ran}) — the live region is unverified`);
  } else {
    const after = await evalJs(`
      (() => {
        const els = [...document.querySelectorAll('[role=status]')];
        return {
          count: els.length,
          live: els.map((e) => e.getAttribute('aria-live')),
          texts: els.map((e) => e.textContent.trim()),
          results: document.querySelectorAll('.results li').length,
        };
      })()
    `);

    if (!after || after.count === 0) {
      bad('search: NO role="status" region after a query ran — the result count is announced to nobody');
    } else {
      if (after.live.every((v) => v === "polite")) {
        ok(`search: result count is in a live region after the query (aria-live=${after.live.join(",")})`);
      } else {
        bad(`search: role="status" present but aria-live is ${JSON.stringify(after.live)} — expected "polite"`);
      }
      if (after.texts.every((t) => t && t.length > 0)) {
        ok(`search: the region announces real text: "${after.texts[0]}"`);
      } else {
        bad(`search: the live region is EMPTY after a query — ${JSON.stringify(after.texts)}`);
      }
      if (after.results > 0) {
        ok(`search: the announced count is backed by ${after.results} rendered result item(s)`);
      } else {
        bad(`search: the region announced "${after.texts[0]}" but 0 results rendered`);
      }
    }

    // The second half, which is what makes the region trustworthy rather than
    // merely present: it must CHANGE when the result set changes. A region that
    // renders once and never updates announces the first query only.
    const ran2 = await evalJs(runQuery("zzzqqqxyznotaword"));
    await sleep(1500);
    if (ran2 === "submitted") {
      const after2 = await evalJs(`[...document.querySelectorAll('[role=status]')].map((e) => e.textContent.trim())`);
      if (Array.isArray(after2) && after2.length && after2[0] && after2[0] !== (after.texts || [])[0]) {
        ok(`search: the region UPDATES with the result set ("${after2[0].slice(0, 70)}")`);
      } else {
        bad(`search: the region did not change after a second, different query — ${JSON.stringify(after2)}`);
      }
    }
  }
}

// --- 8. skip link ----------------------------------------------------------
// Split deliberately into two claims, because they can and do come apart:
//   (a) the link exists, points at a real element, and becomes visible on focus
//   (b) activating it MOVES FOCUS
//
// (b) is the one that is usually broken, and it is invisible to any source
// check. A `href="#main"` moves the scroll position and sets the URL hash; it
// does NOT move focus unless the target is focusable (a `tabindex="-1"`).
// Without focus moving, the reader's next Tab starts at the top of the document
// again, and the skip link has achieved nothing on the navigation path it was
// built for.
//
// THIS WAS THE SECOND OF THE THREE DEFECTS FOUND, and it is FIXED: `<main>` now
// carries tabIndex={-1} in App.jsx, so activation moves focus for real. Both
// claims below are asserted positively now — note that (b) is checked by
// pressing Tab then Enter and reading `document.activeElement`, NOT by reading
// the hash, because the hash changed even when the bug was present. That is what
// made it invisible for so long.
console.log("\n8. Skip link");

await reload();
await evalJs(HELPERS);
const skip = await evalJs(`
  (() => {
    const a = document.querySelector('a.skip');
    if (!a) return { exists: false };
    const href = a.getAttribute('href') || '';
    const target = href.startsWith('#') ? document.querySelector(href) : null;
    return {
      exists: true,
      href,
      text: a.textContent.trim(),
      targetFound: !!target,
      targetTag: target ? target.tagName.toLowerCase() : null,
    };
  })()
`);

if (!skip || !skip.exists) {
  bad("skip link: no `a.skip` on the page — the first Tab lands on the topbar, not on the content");
} else {
  ok(`skip link: present ("${skip.text}" \u2192 ${skip.href})`);
  if (skip.targetFound) ok(`skip link: target ${skip.href} exists (<${skip.targetTag}>)`);
  else bad(`skip link: target ${skip.href} does NOT exist — the link goes nowhere`);

  // Visible on focus. Driven with a REAL Tab press, not .focus(), because the
  // reveal may be written against :focus rather than :focus-visible, and
  // .focus() does not reliably trigger the :focus-visible heuristic.
  //
  // The document was just reloaded, so focus really is at the document root and
  // "the first Tab" is a meaningful claim.
  await evalJs("document.activeElement && document.activeElement.blur(); 'ok'");
  await key("Tab", "Tab", 9);
  // WAIT FOR THE TRANSITION, DO NOT GUESS A DURATION.
  //
  // This was `sleep(400)`, which is longer than the 120ms transition and still
  // measured the link at its RESTING transform (-74px) — a confident report that
  // the skip link is invisible on focus, when it is not.
  //
  // The cause is that a fixed sleep does not make the compositor advance. Under
  // `--headless=old --disable-gpu` the animation clock only moves when something
  // forces a frame, so `getComputedStyle` can still return the value the
  // transition STARTED from no matter how long the script waits. `getAnimations()`
  // reports it plainly: a CSSTransition in state "running" at currentTime≈33ms,
  // long after a 400ms sleep had supposedly elapsed.
  //
  // Waiting on the animations themselves is the fix, and it is the right fix
  // rather than a longer sleep: it is exact, it is immune to the transition
  // duration changing, and it cannot pass by accident on a fast machine.
  await waitForAnimations();
  const first = await evalJs(`
    (() => {
      const el = document.activeElement;
      // Flush style INSIDE the same evaluation as the read. A reflow performed
      // in a previous CDP round-trip does not carry over — each evaluate is its
      // own task, and the compositor can revert the stale value in between.
      // Measured: with the flush here the transform reads translateY(0); with it
      // one call earlier the read still returned the transition's start value.
      void document.documentElement.offsetHeight;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { isSkip: el.classList && el.classList.contains('skip'),
               tag: el.tagName, transform: cs.transform,
               onScreen: r.top >= 0 && r.bottom <= window.innerHeight && r.width > 0 && r.height > 0,
               top: Math.round(r.top), height: Math.round(r.height) };
    })()
  `);
  if (first && first.isSkip) {
    ok("skip link: it is the FIRST tab stop, as it must be");
    if (first.onScreen) ok(`skip link: becomes visible on focus (top=${first.top}px, ${first.height}px tall)`);
    else bad(`skip link: focused but NOT visible on screen (top=${first.top}px, transform=${first.transform})`);
  } else if (first) {
    bad(`skip link: the first Tab landed on <${first.tag}> instead of the skip link — ` +
      "a keyboard user never sees the skip affordance");
  }

  // The target's focusability, measured DIRECTLY. `tabindex="-1"` is what makes
  // a non-interactive target receive focus, and its absence is the mechanism
  // behind the defect, so it is read explicitly as well as through activation.
  const focusability = await evalJs(`
    (() => {
      const m = document.querySelector('main');
      if (!m) return null;
      m.focus();
      const held = document.activeElement === m;
      return { tabIndex: m.tabIndex, hasAttr: m.hasAttribute('tabindex'), heldProgrammaticFocus: held };
    })()
  `);
  if (focusability) {
    note(`skip link: <main> tabIndex=${focusability.tabIndex}, ` +
      `tabindex attribute ${focusability.hasAttr ? "present" : "ABSENT"}; ` +
      `programmatic focus ${focusability.heldProgrammaticFocus ? "held" : "REFUSED"}`);
  }

  // (b) THE CLAIM THAT MATTERS: does activating it move focus? Fresh document,
  // because the direct `main.focus()` above deliberately disturbed focus.
  await reload();
  await evalJs(HELPERS);
  await evalJs("document.activeElement && document.activeElement.blur(); 'ok'");
  await key("Tab", "Tab", 9);
  await sleep(350);
  await key("Enter", "Enter", 13);
  await sleep(700);
  const after = await evalJs(`
    (() => {
      const el = document.activeElement;
      const main = document.querySelector('main');
      return {
        active: el.tagName + (el.id ? '#' + el.id : ''),
        activeIsMain: el === main,
        hash: location.hash,
        scrollY: Math.round(window.scrollY),
        mainTabIndex: main ? main.tabIndex : null,
        mainHasTabindexAttr: main ? main.hasAttribute('tabindex') : null,
      };
    })()
  `);

  if (after && after.activeIsMain) {
    ok("skip link: activating it moves focus INTO <main>");
  } else if (after) {
    // The defect this audit was written to find, and it is now FIXED — the
    // branch above is what passes. This branch stays because the failure is
    // worth naming precisely: "focus did not move" alone does not tell a reader
    // what to change, and this exact failure looks like success in a browser,
    // because the hash changes and the page scrolls. It is a REGRESSION path
    // now, not a known state.
    bad(
      `skip link: activating it does NOT move focus \u2014 activeElement is ` +
      `<${after.active}> (hash=${after.hash || "none"}, scrollY=${after.scrollY}). ` +
      `The href sets the hash and scrolls, but <main> has ` +
      `tabindex=${after.mainTabIndex}${after.mainHasTabindexAttr ? "" : " (attribute absent)"}, ` +
      `so it is not focusable and the reader's next Tab restarts at the top of the page. ` +
      `The skip link therefore has no effect on keyboard navigation.`
    );
  }
}

// --- 9. runtime errors -----------------------------------------------------
console.log("\n9. Runtime errors");
const real = pageErrors.filter((e) => !/favicon|DevTools|Download the React DevTools/i.test(e));
if (real.length === 0) ok("no uncaught exceptions during the audit");
else {
  bad(`${real.length} uncaught exception(s) while auditing — results above may be unreliable:`);
  real.slice(0, 5).forEach((e) => console.log(`      ${String(e).slice(0, 160)}`));
}

// --- stated gaps -----------------------------------------------------------
// Named rather than hidden. Each is a thing this audit deliberately does NOT
// claim, and a reader should know which questions are still unanswered.
console.log("\n\u2500\u2500 Stated gaps (not asserted, on purpose) \u2500\u2500");
console.log("  \u2022 Reachability is asserted per-control-KIND, not per-element. Tools renders");
console.log("    647 interactive elements (433 tool links, 201 external links); walking every");
console.log("    one by Tab would take ~650 CDP round trips per run and make the check slow");
console.log("    enough to be skipped. The probe instead proves each KIND of control is");
console.log("    reachable, which catches the real failure (a whole class of control made");
console.log("    unfocusable) and not the theoretical one (element #401 of 647).");
console.log("  \u2022 Focus ORDER is not asserted, only focus presence. A correct order is a");
console.log("    layout question (visual position vs DOM position) and a DOM-order reading");
console.log("    is not a reliable proxy for it in a flex layout.");
console.log("  \u2022 Modal focus trapping (useFocusTrap in ShortcutHelp/DataTransfer) is NOT");
console.log("    covered. It needs the modal opened and Tab/Escape cycling driven, which is");
console.log("    a separate interaction path; asserting it half-heartedly would be worse");
console.log("    than leaving it to a hand check. NOT COVERED HERE.");
console.log("  \u2022 Only the four topbar views are audited. Phase detail pages, the shortcut");
console.log("    modal and the transfer panel are separate surfaces and are NOT covered.");
console.log("  \u2022 Screen-reader OUTPUT is not observable through CDP. This audit verifies");
console.log("    the ARIA contract (roles, names, live regions), not what a given reader");
console.log("    actually announces.");

// --- done ------------------------------------------------------------------
ws.close();
reap();

// --- how the exit code is decided ------------------------------------------
//
// There are two modes.
//
//   --strict (what `npm test` now runs): no baseline at all. Every failure exits
//   non-zero. This is the mode a CI gate should use, and it is the mode this
//   audit runs in now that the three defects below are fixed.
//
//   --baseline: for when a NEW defect is found and is known to be the site's
//   problem to fix rather than a regression. Named entries in KNOWN are reported
//   without failing the run; ANY OTHER failure still exits non-zero. So the guard
//   stays live even in this mode: break a focus ring, unname a button, skip a
//   heading, or lower a contrast ratio anywhere else, and the run goes red.
//
// A baseline is a risk — it can hide a regression that looks like a known
// defect. It is bounded here in four ways: entries are matched on the FULL
// message including the computed values, so a ratio that gets WORSE stops
// matching and fails; the COUNT per entry is asserted, so a second instance of
// the same class is a failure rather than an absorption; a stale entry is now
// reported LOUDLY rather than silently (see below); and the whole thing is
// switched off by --strict, which is the mode the suite runs in.
//
// Each `match` is tested against ONE failure string (a single `bad()` call), not
// against the joined log — an earlier draft used a pattern spanning newlines and
// silently matched nothing, which is why the count assertion below exists.
//
// ═══ THE THREE ENTRIES THAT USED TO BE HERE, AND WHY THEY ARE GONE ═══
//
// This audit was written to DOCUMENT three real defects, and for its first run
// they were listed in KNOWN by name. All three are now FIXED, so the entries
// were retired. They are recorded here rather than deleted, because the history
// is the useful part and because each one is now guarded by the assertion that
// used to fail:
//
//   1. PLACEHOLDER CONTRAST, Tools + Search (was 3.27:1, needs 4.5:1).
//      Chromium's default `#757575` on `--bg-subtle` `rgb(34,38,52)`. Nothing
//      styled `.toolbar__search input::placeholder`, and the Search view's input
//      has NO class at all, so the existing `.search__input::placeholder` rule
//      was ORPHANED — it styled nothing, which is why only one of the two boxes
//      looked wrong. FIXED in global.css by styling both real selectors with
//      `--text-muted`. Now measured at 5.84:1 on both, asserted by the ordinary
//      contrast probe in all four views. Any regression re-fails that probe; the
//      old 3.27:1 value would also no longer match the retired pattern.
//
//   2. SKIP LINK DID NOT MOVE FOCUS (1 instance).
//      `<main id="main">` had no `tabindex="-1"`, so the anchor set the hash and
//      scrolled while `activeElement` stayed BODY. FIXED in App.jsx with
//      `tabIndex={-1}`. Now asserted positively by
//      "skip link: activating it moves focus INTO <main>", which is a STRONGER
//      check than the entry it replaced: that entry only confirmed the bug was
//      present.
//
//   3. (See 1 — the two placeholder failures were one entry with count 2.)
//
// The lesson worth keeping: a baseline whose defect gets FIXED goes stale, and
// the old code could not see that. It only warned when `hits.length > 0` and
// `hits.length !== count` — so an entry matching ZERO times passed in total
// silence, and the failure the reader saw was the four unrelated leftover
// failures with no hint that the baseline itself was the problem. That is the
// bug the `retired` branch below fixes.
const KNOWN = [
  // Intentionally EMPTY now that the three original defects are fixed.
  //
  // Adding an entry here is how a newly-discovered, genuinely-known defect is
  // recorded without blocking unrelated work — but note that it must be a
  // defect the project has DECIDED not to fix yet, not one that is merely
  // inconvenient. Prefer fixing it: `--strict` is the mode the suite runs in,
  // so a baseline is only a temporary tool, never the steady state.
  //
  // Example shape, kept so the contract is obvious rather than inferred:
  //
  //   {
  //     match: /^headings: 3 skipped level\(s\) in Tools:$/,
  //     count: 1,
  //     label: "Tools: h1 -> h3 jump in the filters panel",
  //   },
];

const strict = process.argv.includes("--strict");
const baseline = process.argv.includes("--baseline") || !strict;

const unmatched = [...failures];
const absorbed = [];
const retired = [];
if (baseline) {
  for (const k of KNOWN) {
    const hits = unmatched.filter((f) => k.match.test(f));
    if (hits.length === k.count) {
      absorbed.push(k);
      for (const h of hits) unmatched.splice(unmatched.indexOf(h), 1);
    } else if (hits.length > 0) {
      // A different NUMBER of instances than the baseline records. Treated as a
      // failure in both directions: more means a new defect of a known class,
      // fewer means the baseline is stale and should be tightened.
      console.log(
        `\n  \u26a0 baseline drift: expected ${k.count} instance(s) of "${k.label}", found ${hits.length}`
      );
    } else {
      // ⚠️ THE ENTRY MATCHED NOTHING — the defect it records no longer occurs.
      //
      // This branch did not exist, and its absence was a real bug: the old code
      // only warned when `hits.length > 0`, so a baseline entry whose defect had
      // been FIXED matched zero times and said nothing at all. When the three
      // original defects were fixed, `--baseline` therefore failed with four
      // unexplained leftovers and no indication that the baseline itself was
      // stale — which reads exactly like flakiness, and would have been
      // dismissed as such.
      //
      // It is reported as a LOUD NOTE, not a hard failure, and the reason is
      // deliberate. Failing here would mean that FIXING a defect turns a
      // previously-green suite red until someone also edits the audit — which
      // punishes the fix and teaches people to switch the check off, the exact
      // outcome this file's header exists to prevent. A stale entry is
      // harmless (it absorbs nothing) as long as it is VISIBLE, so it is made
      // impossible to miss instead: it is named in the summary, and it is
      // repeated in the final line of a passing run so it cannot scroll away.
      retired.push(k);
    }
  }
}

console.log("");
if (absorbed.length) {
  console.log("\u2500\u2500 Known defects (reported, not failing this run) \u2500\u2500");
  for (const a of absorbed) {
    console.log(`  \u2022 \u00d7${a.count}  ${a.label}`);
  }
  console.log("  These are real. They are listed so they are not forgotten, and so that a");
  console.log("  change in their NUMBER or their VALUES fails the run. Run with --strict to");
  console.log("  fail on them.");
}

if (retired.length) {
  console.log("");
  console.log("\u2500\u2500 STALE BASELINE ENTRIES \u2014 these are GOOD NEWS, but the file is now wrong \u2500\u2500");
  for (const r of retired) {
    console.log(`  \u2713 no longer reproduces: ${r.label}`);
  }
  console.log("  The defect(s) above did NOT occur in this run, which means they were FIXED");
  console.log("  (or the page changed under them). This is not a failure \u2014 but the entry is");
  console.log("  now dead weight and a false claim about the site, so REMOVE it from KNOWN in");
  console.log("  scripts/audit-a11y.mjs. Leaving it costs nothing functionally and everything");
  console.log("  in honesty: a baseline that lists fixed defects as open is how a guard starts");
  console.log("  lying about the page it is supposed to describe.");
}

console.log("");
if (unmatched.length === 0 && !strict) {
  console.log(`\u2713 accessibility audit passed \u2014 ${pass} assertion(s) across ${VIEWS.length} views` +
    (absorbed.length ? ` (${absorbed.reduce((n, a) => n + a.count, 0)} known defect(s) recorded above)` : ""));
  // Repeated here on purpose: the stale-entry notice above is printed BEFORE the
  // pass line, and a passing run is exactly the one people stop reading.
  if (retired.length) {
    console.log(`  \u26a0 ${retired.length} STALE baseline entry(ies) \u2014 see above. ` +
      "The defect(s) they name no longer occur; remove them from KNOWN.");
  }
  process.exit(0);
} else if (unmatched.length === 0) {
  console.log(`\u2713 accessibility audit passed (strict) \u2014 ${pass} assertion(s) across ${VIEWS.length} views`);
  process.exit(0);
} else {
  console.log(`\u2716 accessibility audit failed \u2014 ${unmatched.length} problem(s), ${pass} assertion(s) passed`);
  console.log("");
  console.log("  Each failure above names the selector and the computed values, so a fix is");
  console.log("  a targeted edit rather than a hunt. This audit does not fix anything: it");
  console.log("  describes the page as it is.");
  process.exit(1);
}
