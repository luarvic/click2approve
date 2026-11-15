import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), "click2approve-startup-"));
const override = join(temporary, "ports.yaml");
writeFileSync(
  override,
  `services:
  db:
    ports: !reset []
  azurite:
    ports: !reset []
  api:
    ports: !override ["127.0.0.1::5555"]
  ui:
    ports: !override ["127.0.0.1::3333"]
`,
);
const args = [
  "compose",
  "--project-name",
  `click2approve-startup-${process.pid}`,
  "--file",
  join(root, "docker-compose.yaml"),
  "--file",
  override,
];
const compose = (...command) =>
  execFileSync("docker", [...args, ...command], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
let browser;
try {
  // Every run owns a fresh SQL Server container, with no connections from other projects.
  execFileSync("docker", [...args, "up", "--build", "--detach", "--wait", "--wait-timeout", "180"], {
    cwd: root,
    stdio: "inherit",
  });
  const apiOrigin = `http://${compose("port", "api", "5555").trim()}`;
  const uiOrigin = `http://${compose("port", "ui", "3333").trim()}`;
  const response = await fetch(`${apiOrigin}/api/v1/products/info`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).edition, "OpenSource");

  const database = compose(
    "exec",
    "-T",
    "db",
    "/opt/mssql-tools18/bin/sqlcmd",
    "-S",
    "localhost",
    "-U",
    "sa",
    "-P",
    "P@ssw0rd",
    "-C",
    "-b",
    "-h",
    "-1",
    "-W",
    "-Q",
    "SET NOCOUNT ON; SELECT is_read_committed_snapshot_on FROM sys.databases WHERE name = 'click2approve'; SELECT COUNT(*) FROM click2approve.sys.tables;",
  );
  const [snapshotEnabled, tableCount] = database.trim().split(/\s+/).map(Number);
  assert.equal(snapshotEnabled, 1, "Fresh database initialization completed");
  assert.ok(tableCount > 0, "Application tables exist before workers run");
  const logs = compose("logs", "--no-color", "api", "event-publisher", "event-consumer");
  assert.doesNotMatch(logs, /Invalid object name|Execution Timeout Expired|Unhandled exception/);

  browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || undefined });
  const context = await browser.newContext();
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    // Keep the browser inside this fixture while using the real API and compiled UI.
    if (url.hostname === "localhost" && url.port === "5555") {
      const upstream = await route.fetch({ url: `${apiOrigin}${url.pathname}${url.search}` });
      await route.fulfill({
        response: upstream,
        headers: {
          ...upstream.headers(),
          "access-control-allow-origin": uiOrigin,
          "access-control-allow-credentials": "true",
        },
      });
    } else if (url.origin === uiOrigin) await route.continue();
    else await route.abort();
  });
  const page = await context.newPage();
  await page.goto(`${uiOrigin}/app/`);
  await page.getByRole("heading", { name: "Sign in", exact: true }).waitFor();
  console.log("Fresh Compose startup passed: database initialized, API ready, workers started, app sign-in rendered.");
} catch (error) {
  process.stderr.write(compose("logs", "--no-color", "--tail", "80"));
  throw error;
} finally {
  await browser?.close();
  compose("down", "--volumes", "--remove-orphans");
  rmSync(temporary, { recursive: true, force: true });
}
