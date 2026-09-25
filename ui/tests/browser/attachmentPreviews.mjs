// Run with CHROME_BIN=/path/to/chrome node tests/browser/attachmentPreviews.mjs.
// Bundles the real download helper; only the attachment API responses are replaced.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { build } from "vite";

const chrome = process.env.CHROME_BIN;
assert.ok(chrome, "Set CHROME_BIN to a Chrome/Chromium executable.");
const entry = `
import { downloadApprovalRequestFile } from ${JSON.stringify(resolve("src/features/userFiles/utils/downloaders.ts"))};
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const pause = () => new Promise(resolve => setTimeout(resolve, 100));
const payload = '<html xmlns="http://www.w3.org/1999/xhtml"><script>localStorage.setItem("s01-executed", "yes")</' + 'script></html>';
const xmlUrl = 'data:application/xml;base64,' + btoa(payload);
const file = (name, type) => ({ name, type, globalId: 'file' });
let opens = 0;
let downloads = 0;
let currentFrame;
// Use actual browser document navigation in a same-origin frame so dump-dom
// can observe completion. This retains the vulnerable Blob origin semantics.
window.open = () => {
  opens++;
  const frame = document.createElement('iframe');
  document.body.append(frame);
  currentFrame = frame;
  return { opener: null, location: frame.contentWindow.location, close: () => frame.remove() };
};
HTMLAnchorElement.prototype.click = function () {
  assert(this.hasAttribute('download'), 'Missing forced download');
  downloads++;
};
async function run() {
try {
  localStorage.removeItem('s01-executed');
  const control = document.createElement('iframe');
  const loaded = new Promise(resolve => control.onload = resolve);
  control.src = URL.createObjectURL(new Blob([payload], { type: 'application/xml' }));
  document.body.append(control);
  await loaded;
  assert(localStorage.getItem('s01-executed') === 'yes', 'Exploit positive control did not execute');
  control.remove();
  localStorage.removeItem('s01-executed');

  window.attachmentResponse = xmlUrl;
  await downloadApprovalRequestFile('tenant', file('payload.xml', '.xml'), 'request');
  assert(opens === 0 && downloads === 1, 'XML was not download-only');

  await downloadApprovalRequestFile('tenant', file('payload.txt', '.txt'), 'request');
  assert(downloads === 2 && !currentFrame.isConnected, 'Disguised XML was not download-only');
  await pause();
  assert(localStorage.getItem('s01-executed') === null, 'XML executed through the attachment helper');

  window.attachmentResponse = 'data:text/plain;base64,' + btoa(payload);
  await downloadApprovalRequestFile('tenant', file('payload.txt', '.txt'), 'request');
  await pause();
  assert(currentFrame.contentDocument.body.textContent.includes(payload), 'Text preview did not preserve literal markup');
  assert(localStorage.getItem('s01-executed') === null, 'Text preview executed markup');
  document.body.textContent = 'S01_BROWSER_PASS';
} catch (error) {
  document.body.textContent = 'S01_BROWSER_FAIL: ' + error.message;
}
}
run();
`;

const output = await build({
  configFile: false,
  logLevel: "error",
  plugins: [
    {
      name: "attachment-preview-fixture",
      resolveId(id) {
        if (id === "attachment-preview-fixture") return id;
        if (id.startsWith("@/features/") && id.includes("/api/")) return id;
      },
      load(id) {
        if (id === "attachment-preview-fixture") return entry;
        if (id.startsWith("@/features/") && id.includes("/api/")) {
          return [
            "downloadApprovalRequestFileBase64",
            "downloadApprovalRequestTaskFileBase64",
            "downloadApprovalRequestTaskAttachmentBase64",
            "downloadDiscussionMessageFileBase64",
          ]
            .map((name) => "export const " + name + " = async () => window.attachmentResponse;")
            .join("\n");
        }
      },
    },
  ],
  build: { write: false, target: "esnext", minify: false, rollupOptions: { input: "attachment-preview-fixture" } },
});
const code = output.output.find((item) => item.type === "chunk" && item.isEntry).code;
const server = createServer((_request, response) => {
  response.setHeader("Content-Type", "text/html");
  response.end('<!doctype html><body>Running<script type="module">' + code + "</script>");
});
const profile = await mkdtemp(resolve(tmpdir(), "s01-browser-"));
try {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const result = await new Promise((resolve, reject) => {
    const child = spawn(chrome, [
      "--headless",
      "--disable-gpu",
      "--no-first-run",
      "--disable-background-networking",
      "--use-mock-keychain",
      "--password-store=basic",
      "--no-default-browser-check",
      "--user-data-dir=" + profile,
      "--dump-dom",
      "--virtual-time-budget=5000",
      "http://127.0.0.1:" + server.address().port,
    ]);
    let stdout = "";
    let stderr = "";
    let dumped = false;
    child.stdout.on("data", (data) => {
      stdout += data;
      if (stdout.includes("</html>")) {
        // Some Chrome builds keep background processes alive after dumping the DOM.
        dumped = true;
        child.kill();
      }
    });
    child.stderr.on("data", (data) => (stderr += data));
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("Chrome timed out\n" + stdout + stderr));
    }, 30000);
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("exit", (code) => {
      clearTimeout(timeout);
      resolve({ code, stdout, stderr, dumped });
    });
  });
  assert.ok(result.dumped || result.code === 0, result.stderr);
  assert.match(result.stdout, /<body>S01_BROWSER_PASS<\/body>/, result.stdout);
  console.log("S01 browser regression passed (including exploit positive control).");
} finally {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
