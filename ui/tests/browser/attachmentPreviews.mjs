// Run with CHROME_BIN=/path/to/chrome node tests/browser/attachmentPreviews.mjs.
// Set CHROME_NO_SANDBOX=1 only on isolated test runners without a usable Chromium sandbox.
// Bundles the real download helper; only the attachment API responses are replaced.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { build } from "vite";

const chrome = process.env.CHROME_BIN;
assert.ok(chrome, "Set CHROME_BIN to a Chrome/Chromium executable.");
const entry = `
import { downloadApprovalRequestFile } from ${JSON.stringify(resolve("src/features/userFiles/utils/downloaders.ts"))};
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const payload = '<html xmlns="http://www.w3.org/1999/xhtml"><script>localStorage.setItem("s01-executed", "yes")</' + 'script></html>';
const xmlUrl = 'data:application/xml;base64,' + btoa(payload);
const file = (name, type) => ({ name, type, globalId: 'file' });
let opens = 0;
let downloads = 0;
let currentFrame;
let previewLoaded;
// Use actual navigation in a same-origin frame to retain the vulnerable Blob origin semantics.
window.open = () => {
  opens++;
  const frame = document.createElement('iframe');
  document.body.append(frame);
  currentFrame = frame;
  previewLoaded = new Promise(resolve => frame.onload = resolve);
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
  assert(localStorage.getItem('s01-executed') === null, 'XML executed through the attachment helper');

  window.attachmentResponse = 'data:text/plain;base64,' + btoa(payload);
  await downloadApprovalRequestFile('tenant', file('payload.txt', '.txt'), 'request');
  await previewLoaded;
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
let browser;
let page;
const pageErrors = [];
try {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  browser = await chromium.launch({
    executablePath: chrome,
    headless: true,
    chromiumSandbox: process.env.CHROME_NO_SANDBOX !== "1",
    timeout: 30000,
  });
  page = await browser.newPage();
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("http://127.0.0.1:" + server.address().port, { timeout: 30000 });
  // Wait for the fixture itself, independent of Chrome's DOM-dump or process-exit behavior.
  await page.waitForFunction(() => document.body.textContent.startsWith("S01_BROWSER_"), undefined, { timeout: 30000 });
  assert.equal(await page.locator("body").textContent(), "S01_BROWSER_PASS");
  assert.deepEqual(pageErrors, []);
  console.log("S01 browser regression passed (including exploit positive control).");
} catch (error) {
  if (page) {
    console.error("Attachment fixture:", await page.locator("body").textContent().catch(() => "unavailable"));
    console.error("Browser page errors:", pageErrors);
  }
  throw error;
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
