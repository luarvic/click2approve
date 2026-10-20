#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ui = path.join(root, "ui");

function run(command, args, cwd = root, extraEnv = {}) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { cwd, env: { ...process.env, ...extraEnv }, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

try {
  if (process.argv.length > 2) throw new Error("Usage: node scripts/test.mjs");
  if (!process.env.C2A_TEST_AZURITE?.trim())
    throw new Error("Set C2A_TEST_AZURITE; the public suite must run Queue and Blob integration tests rather than skip them.");
  if (!existsSync(path.join(ui, "node_modules"))) throw new Error("Run npm ci in ui first.");
  const browserPath = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", 'import { chromium } from "@playwright/test"; process.stdout.write(chromium.executablePath())'],
    { cwd: ui, encoding: "utf8" },
  );
  if (browserPath.status !== 0) throw new Error("Cannot resolve Chromium. Run npm ci in ui first.");
  const chrome = process.env.CHROME_BIN || browserPath.stdout;
  if (!existsSync(chrome)) throw new Error("Install Chromium with npx playwright install chromium in ui, or set CHROME_BIN.");

  run("dotnet", ["test", "api/Click2Approve.Api.sln", "--logger", "trx", "--results-directory", path.join(root, "TestResults/public")]);
  run("npm", ["test", "--", "--run"], ui);
  run("npm", ["run", "test:browser:attachments"], ui, { CHROME_BIN: chrome });
  run("npm", ["run", "lint"], ui);
  run("npm", ["run", "build"], ui);
  const python = path.join(ui, ".venv-docs/bin/python");
  run(existsSync(python) ? python : "python3", ["-m", "mkdocs", "build", "--strict"], ui);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
