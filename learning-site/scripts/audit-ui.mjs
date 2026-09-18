// One-off UI/a11y audit harness. Runs headless Edge over CDP against the preview
// server, drives the app by CLICK (it has no deep-link routing by design), and
// reports concrete DOM-level defects: missing labels, unlabelled controls,
// duplicate ids, heading order, focus visibility, contrast, overflow, tap targets.
//
// LESSON FROM THE FIRST RUN OF THIS FILE: it reported "h1-count=0",
// "main-landmarks=0" and "focusRules=0" for every view. All three were FALSE and
// all three were the probe's fault:
//   - the click helper silently failed, so every "view" audited the dashboard
//   - document.styleSheets throws on cross-origin rules and I swallowed it, so a
//     real :focus-visible rule at global.css:59 was invisible to the audit
// The real source has <main id="main">, real <h1>s, and a global focus ring.
// This is the project's recurring failure mode: suspect the instrument first.
//
// This is a THROWAWAY probe, not a guard. Delete after use.
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9350;
const BASE = "http://localhost:4173";

const VIEWPORTS = [
  ["desktop", 1280, 900],
  ["mobile", 390, 844],
];

const edge = spawn(EDGE, ["--headless=old", `--remote-debugging-port=${PORT}`,
  "--no-first-run", "--no-default-browser-check", "--disable-gpu", "about:blank"],
  { stdio: "ignore" });

let ws, id = 0; const pending = new Map();
const evaluate = (expr) => { const m = ++id;
  ws.send(JSON.stringify({ id: m, method: "Runtime.evaluate",
    params: { expression: expr, returnByValue: true, awaitPromise: true } }));
  return new Promise((r) => pending.set(m, r)); };

const CLICK = (label) => `(() => {
  const w = ${JSON.stringify(label)};
  const n = [...document.querySelectorAll("a,button,li,div,article,h2,h3,span")];
  const el = n.find(x => (x.textContent||"").trim() === w)
          || n.find(x => (x.textContent||"").trim().startsWith(w) && (x.textContent||"").length < 120);
  if (!el) return "NOT FOUND"; el.click(); return "ok";
})()`;

// The audit itself: runs in the page, returns a structured defect list.
const AUDIT = `(() => {
  const out = {};

  // 1. Images without alt
  out.imgNoAlt = [...document.querySelectorAll("img")]
    .filter(i => !i.hasAttribute("alt")).length;

  // 2. Buttons with no accessible name
  out.btnNoName = [...document.querySelectorAll("button")].filter(b => {
    const t = (b.textContent||"").trim();
    return !t && !b.getAttribute("aria-label") && !b.getAttribute("title");
  }).map(b => b.className || b.outerHTML.slice(0, 60));

  // 3. Form controls with no label (label[for], aria-label, aria-labelledby, or wrapping label)
  out.inputNoLabel = [...document.querySelectorAll("input,select,textarea")].filter(el => {
    if (el.type === "hidden") return false;
    if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")) return false;
    if (el.id && document.querySelector('label[for="' + CSS.escape(el.id) + '"]')) return false;
    if (el.closest("label")) return false;
    if (el.getAttribute("title")) return false;
    return true;
  }).map(el => el.tagName + (el.type ? '[' + el.type + ']' : '') + '.' + (el.className||"").split(" ")[0]);

  // 4. Interactive elements that are divs/spans with onClick but no role/tabindex -
  //    unreachable by keyboard
  out.divButtons = [...document.querySelectorAll("div[onclick],span[onclick],li[onclick]")]
    .filter(el => !el.hasAttribute("role") && !el.hasAttribute("tabindex"))
    .map(el => (el.className||el.tagName) + " :: " + (el.textContent||"").trim().slice(0,40));

  // 5. Links with no accessible text
  out.linkNoText = [...document.querySelectorAll("a")].filter(a => {
    return !(a.textContent||"").trim() && !a.getAttribute("aria-label") && !a.querySelector("img[alt]");
  }).length;

  // 6. Duplicate ids
  const ids = {};
  document.querySelectorAll("[id]").forEach(e => { ids[e.id] = (ids[e.id]||0)+1; });
  out.dupIds = Object.entries(ids).filter(([,n]) => n > 1).map(([k,n]) => k + " x" + n);

  // 7. Heading order + skips
  const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(h => +h.tagName[1]);
  out.h1Count = hs.filter(n => n === 1).length;
  out.headingSkips = [];
  for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i-1] > 1) out.headingSkips.push(hs[i-1] + "->" + hs[i]);

  // 8. Horizontal overflow
  out.docWidth = document.documentElement.scrollWidth;
  out.winWidth = window.innerWidth;
  out.overflowX = document.documentElement.scrollWidth > window.innerWidth + 1;

  // 9. Elements wider than the viewport (likely overflow culprits)
  out.wideEls = [...document.querySelectorAll("*")].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > window.innerWidth + 2 && r.height > 0;
  }).slice(0, 8).map(el => {
    const r = el.getBoundingClientRect();
    return (el.tagName + "." + (el.className||"").toString().split(" ").slice(0,2).join(".")) + " w=" + Math.round(r.width);
  });

  // 10. Tap targets under 24px (mobile)
  out.smallTargets = [...document.querySelectorAll("button,a,[role=button],input[type=checkbox]")]
    .filter(el => { const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24); })
    .slice(0, 10).map(el => (el.tagName + "." + (el.className||"").toString().split(" ")[0]) + " " + Math.round(el.getBoundingClientRect().width) + "x" + Math.round(el.getBoundingClientRect().height));

  // 11. Focus visibility.
  // LESSON: the first version of this probe wrapped cssRules access in a bare
  // try/catch returning [], so a SecurityError on ANY cross-origin sheet silently
  // zeroed the whole list and produced the false finding "focusRules=0". Count
  // failures instead of swallowing them, so a probe cannot report a clean result
  // it did not actually measure.
  out.sheets = document.styleSheets.length;
  out.sheetsUnreadable = 0;
  const focusSel = [];
  [...document.styleSheets].forEach(ss => {
    let rules;
    try { rules = ss.cssRules; }
    catch { out.sheetsUnreadable++; return; }
    if (!rules) { out.sheetsUnreadable++; return; }
    [...rules].forEach(r => { if (r.selectorText && /:focus/.test(r.selectorText)) focusSel.push(r.selectorText); });
  });
  out.focusRules = focusSel;
  // A real focus ring must be measurable, not just declared. Check computed style.
  out.focusRingMeasured = (() => {
    const b = document.querySelector("button, a");
    if (!b) return "no focusable element";
    b.focus();
    const cs = getComputedStyle(b);
    return { sel: b.className || b.tagName, outline: cs.outlineStyle + " " + cs.outlineWidth + " " + cs.outlineColor };
  })();

  // 12. Color contrast on visible text
  const lum = (c) => { const [r,g,b] = c.match(/\\d+/g).slice(0,3).map(Number).map(v => {
      v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
    return 0.2126*r + 0.7152*g + 0.0722*b; };
  const bgOf = (el) => { let n = el;
    while (n && n !== document.documentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
      n = n.parentElement; }
    return getComputedStyle(document.body).backgroundColor || "rgb(255,255,255)"; };
  const low = [];
  const seen = new Set();
  [...document.querySelectorAll("p,li,span,a,button,h1,h2,h3,h4,td,th,label,div")]
    .forEach(el => {
      const txt = (el.textContent||"").trim();
      if (!txt || el.children.length > 0) return;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) return;
      const fg = cs.color, bg = bgOf(el);
      if (!/rgb/.test(fg) || !/rgb/.test(bg)) return;
      const L1 = lum(fg), L2 = lum(bg);
      const ratio = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
      const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
      const large = size >= 24 || (size >= 18.66 && bold);
      const need = large ? 3 : 4.5;
      if (ratio < need) {
        const key = fg + "|" + bg + "|" + Math.round(size);
        if (seen.has(key)) return; seen.add(key);
        low.push({ ratio: +ratio.toFixed(2), need, fg, bg, size,
                   cls: (el.className||"").toString().split(" ").slice(0,2).join("."),
                   text: txt.slice(0, 34) });
      }
    });
  out.lowContrast = low.slice(0, 14);

  // 13. Theme
  out.theme = document.documentElement.getAttribute("data-theme")
    || (matchMedia("(prefers-color-scheme: dark)").matches ? "system:dark" : "system:light");

  // 14. Landmarks
  out.landmarks = { header: document.querySelectorAll("header").length,
    nav: document.querySelectorAll("nav").length,
    main: document.querySelectorAll("main").length,
    footer: document.querySelectorAll("footer").length };

  return out;
})()`;

try {
  await sleep(3000);
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (e) => { const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result?.result?.value); pending.delete(m.id); } };
  await ws.send(JSON.stringify({ id: ++id, method: "Runtime.enable" }));
  await ws.send(JSON.stringify({ id: ++id, method: "Page.enable" }));

  // Real topbar labels, read from App.jsx VIEWS. Clicking a `.navbtn` switches view.
  const VIEWS = [
    ["dashboard", [".navbtn"]],
    ["tools", [".navbtn"]],
    ["reference", [".navbtn"]],
    ["search", [".navbtn"]],
  ];
  // Exact label for each view, so we can assert navigation actually happened.
  const LABEL = { dashboard: "Curriculum", tools: "Tools", reference: "Reference", search: "Search" };

  // Click a topbar button by its exact text and CONFIRM the view changed.
  const NAV = (label) => `(() => {
    const b = [...document.querySelectorAll(".navbtn")]
      .find(x => (x.textContent||"").trim() === ${JSON.stringify(label)});
    if (!b) return "no .navbtn labelled " + ${JSON.stringify(label)};
    b.click();
    return "clicked";
  })()`;
  const ACTIVE = `(() => {
    const on = document.querySelector(".navbtn.is-on");
    return on ? (on.textContent||"").trim() : "(none)";
  })()`;

  for (const [vpName, w, h] of VIEWPORTS) {
    await ws.send(JSON.stringify({ id: ++id, method: "Emulation.setDeviceMetricsOverride",
      params: { width: w, height: h, deviceScaleFactor: 1, mobile: vpName === "mobile" } }));
    console.log(`\n########## VIEWPORT ${vpName} (${w}x${h}) ##########`);

    for (const [viewName] of VIEWS) {
      await evaluate(`location.href = ${JSON.stringify(BASE)}`);
      await sleep(2200);
      const clicked = await evaluate(NAV(LABEL[viewName]));
      await sleep(1400);
      const active = await evaluate(ACTIVE);
      // Assertion: if the active view does not match, the audit below is meaningless.
      const navOK = active === LABEL[viewName];
      if (!navOK) {
        console.log(`\n  -- ${viewName}: NAV FAILED (click=${clicked}, active="${active}") -- audit skipped`);
        continue;
      }
      const a = await evaluate(AUDIT);
      if (!a) { console.log(`  ${viewName}: AUDIT RETURNED NOTHING`); continue; }
      const issues = [];
      if (a.imgNoAlt) issues.push(`img-no-alt=${a.imgNoAlt}`);
      if (a.btnNoName?.length) issues.push(`btn-no-name=[${a.btnNoName.join(", ")}]`);
      if (a.inputNoLabel?.length) issues.push(`input-no-label=[${a.inputNoLabel.join(", ")}]`);
      if (a.divButtons?.length) issues.push(`div-btn-unreachable=[${a.divButtons.slice(0,4).join(" | ")}]`);
      if (a.linkNoText) issues.push(`link-no-text=${a.linkNoText}`);
      if (a.dupIds?.length) issues.push(`dup-ids=[${a.dupIds.join(", ")}]`);
      if (a.h1Count !== 1) issues.push(`h1-count=${a.h1Count}`);
      if (a.headingSkips?.length) issues.push(`heading-skips=[${a.headingSkips.join(",")}]`);
      if (a.overflowX) issues.push(`OVERFLOW-X doc=${a.docWidth} win=${a.winWidth} [${(a.wideEls||[]).join(" | ")}]`);
      if (a.smallTargets?.length) issues.push(`small-targets=[${a.smallTargets.slice(0,5).join(", ")}]`);
      if (a.landmarks && a.landmarks.main !== 1) issues.push(`main-landmarks=${a.landmarks.main}`);
      console.log(`\n  -- ${viewName}  theme=${a.theme}`);
      console.log(`     stylesheets=${a.sheets} unreadable=${a.sheetsUnreadable} focusSelectors=${(a.focusRules||[]).length}`);
      console.log(`     focus ring: ${JSON.stringify(a.focusRingMeasured)}`);
      console.log(`     ${issues.length ? issues.join("\n     ") : "no structural issues"}`);
      if (a.lowContrast?.length) {
        console.log(`     LOW CONTRAST (${a.lowContrast.length} distinct):`);
        a.lowContrast.forEach(c => console.log(`       ${c.ratio} (need ${c.need}) ${c.size}px ${c.cls} fg=${c.fg} bg=${c.bg} "${c.text}"`));
      }
    }
  }
  ws.close(); edge.kill(); process.exit(0);
} catch (e) { console.error("AUDIT FAILED:", e.message); edge.kill(); process.exit(1); }
