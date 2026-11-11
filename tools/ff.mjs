// Drives a real, headless Firefox through WebDriver BiDi (built into Firefox,
// no dependencies): installs the extension, opens a URL, runs a script in the
// page and saves a screenshot.
//
//   node tools/ff.mjs <url> <screenshot.png> <script-file.js> [--no-ext] [--wait=ms]
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const [url, shot, scriptFile, ...flags] = process.argv.slice(2);
const EXT = fileURLToPath(new URL("..", import.meta.url)).replace(/[\\/]$/, "");
const PORT = 9333;
const wait = Number((flags.find((f) => f.startsWith("--wait=")) || "--wait=6000").slice(7));

const profile = mkdtempSync(join(tmpdir(), "ddm-ff-"));
const ff = spawn(
  "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
  ["--headless", "--no-remote", "--profile", profile, `--remote-debugging-port=${PORT}`, "--width=1400", "--height=900"],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect() {
  for (let i = 0; i < 60; i++) {
    try {
      const ws = new WebSocket(`ws://127.0.0.1:${PORT}/session`);
      await new Promise((res, rej) => {
        ws.onopen = res;
        ws.onerror = rej;
      });
      return ws;
    } catch {
      await sleep(500);
    }
  }
  throw new Error("Firefox did not open its debugging port");
}

try {
  const ws = await connect();
  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      m.type === "error" ? rej(new Error(m.error + ": " + m.message)) : res(m.result);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      pending.set(++id, { res, rej });
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send("session.new", { capabilities: {} });
  if (!flags.includes("--no-ext")) {
    await send("webExtension.install", { extensionData: { type: "path", path: EXT } });
  }
  const tree = await send("browsingContext.getTree");
  const context = tree.contexts[0].context;
  await send("browsingContext.navigate", { context, url, wait: "complete" });
  await sleep(wait);

  if (scriptFile && scriptFile !== "-") {
    const r = await send("script.evaluate", {
      expression: readFileSync(scriptFile, "utf8"),
      target: { context },
      awaitPromise: true,
    });
    console.log(r.type === "success" ? r.result.value : JSON.stringify(r, null, 1));
  }
  if (shot && shot !== "-") {
    const s = await send("browsingContext.captureScreenshot", { context });
    writeFileSync(shot, Buffer.from(s.data, "base64"));
  }
  await send("browser.close").catch(() => {});
} catch (e) {
  console.error("FAILED:", e.message);
} finally {
  await sleep(500);
  ff.kill();
}
