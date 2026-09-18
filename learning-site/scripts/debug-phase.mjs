// Capture the FULL React error and component stack for one phase open.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BROWSER = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].find(existsSync);

const PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = mkdtempSync(join(tmpdir(), "vbtrace-"));
const child = spawn(
  BROWSER,
  [
    "--headless=old",
    "--disable-gpu",
    "--no-sandbox",
    "--no-first-run",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);

async function target() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const t = (await r.json()).find((x) => x.type === "page" && x.webSocketDebuggerUrl);
      if (t) return t.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("no target");
}

try {
  const ws = new WebSocket(await target());
  await new Promise((res, rej) => {
    ws.addEventListener("open", res);
    ws.addEventListener("error", rej);
  });

  let id = 0;
  const pending = new Map();
  const logs = [];
  ws.addEventListener("message", (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
    }
    if (m.method === "Runtime.consoleAPICalled") {
      logs.push(
        "[console." +
          m.params.type +
          "] " +
          m.params.args.map((a) => a.value ?? a.description ?? "").join(" ")
      );
    }
    if (m.method === "Runtime.exceptionThrown") {
      const d = m.params.exceptionDetails;
      logs.push("[EXCEPTION] " + (d.exception?.description || d.text));
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const myId = ++id;
      pending.set(myId, { resolve, reject });
      ws.send(JSON.stringify({ id: myId, method, params }));
    });

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: "http://localhost:5173/" });
  await sleep(4000);

  // Install a global error handler that keeps the component stack.
  await send("Runtime.evaluate", {
    expression: `
      window.__stacks = [];
      const orig = console.error;
      console.error = function(...a){
        window.__stacks.push(a.map(x => {
          if (x && x.stack) return x.stack;
          if (typeof x === 'string') return x;
          try { return JSON.stringify(x); } catch { return String(x); }
        }).join('\\n---\\n'));
        orig.apply(console, a);
      };
      true;
    `,
  });

  console.log("clicking first phase card…");
  await send("Runtime.evaluate", {
    expression: `document.querySelector('.phase-card').click(); true;`,
  });
  await sleep(4000);

  const stacks = await send("Runtime.evaluate", {
    expression: "window.__stacks || []",
    returnByValue: true,
  });

  console.log("\n===== CAPTURED ERRORS (" + (stacks.result.value || []).length + ") =====");
  for (const s of stacks.result.value || []) {
    console.log("\n" + s.slice(0, 3000));
    console.log("-----");
  }

  console.log("\n===== CONSOLE/EXCEPTION LOG (" + logs.length + ") =====");
  for (const l of logs.slice(0, 25)) console.log(l.slice(0, 1200));

  ws.close();
} finally {
  child.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {}
}
