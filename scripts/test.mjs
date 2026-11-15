#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ui = path.join(root, "ui");
const modes = ["all", "api", "ui", "attachments", "portal", "portal-analytics", "compose"];
const mode = process.argv[2] || "all";

function run(command, args, cwd = root, extraEnv = {}) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { cwd, env: { ...process.env, ...extraEnv }, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status ?? result.signal}.`);
}

try {
  if (process.argv.length > 3 || !modes.includes(mode))
    throw new Error(`Usage: node scripts/test.mjs [${modes.join("|")}]`);
  if (["all", "api"].includes(mode) && !process.env.C2A_TEST_AZURITE?.trim())
    throw new Error(
      "Set C2A_TEST_AZURITE; the public suite must run Queue and Blob integration tests rather than skip them.",
    );
  if (mode !== "api" && !existsSync(path.join(ui, "node_modules"))) throw new Error("Run npm ci in ui first.");
  const browserEnv = {};
  if (!["api", "ui"].includes(mode)) {
    const browserPath = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        'import { chromium } from "@playwright/test"; process.stdout.write(chromium.executablePath())',
      ],
      { cwd: ui, encoding: "utf8" },
    );
    if (browserPath.status !== 0) throw new Error("Cannot resolve Chromium. Run npm ci in ui first.");
    browserEnv.CHROME_BIN = process.env.CHROME_BIN || browserPath.stdout.trim();
    if (!existsSync(browserEnv.CHROME_BIN))
      throw new Error("Install Chromium with npx playwright install chromium in ui, or set CHROME_BIN.");
  }

  if (["all", "api"].includes(mode))
    run("dotnet", [
      "test",
      "api/Click2Approve.Api.sln",
      "--configuration",
      "Release",
      "--logger",
      "trx",
      "--results-directory",
      path.join(root, "TestResults/public"),
    ]);
  if (["all", "ui"].includes(mode)) {
    run("npm", ["test", "--", "--run"], ui);
    run("npm", ["run", "lint"], ui);
    run("npm", ["run", "build"], ui);
    const python = path.join(ui, ".venv-docs/bin/python");
    run(existsSync(python) ? python : "python3", ["-m", "mkdocs", "build", "--strict"], ui);
    run(existsSync(python) ? python : "python3", ["docs/test_hooks.py"], ui);
  }
  if (["all", "attachments"].includes(mode)) run("npm", ["run", "test:browser:attachments"], ui, browserEnv);
  if (["all", "portal"].includes(mode))
    run("npm", ["run", "test:browser:analytics"], ui, { ...browserEnv, GOOGLE_ANALYTICS_ID: "" });
  if (["all", "portal-analytics"].includes(mode))
    run("npm", ["run", "test:browser:analytics"], ui, { ...browserEnv, GOOGLE_ANALYTICS_ID: "G-ANALYTICSTEST" });
  if (["all", "compose"].includes(mode)) run("npm", ["run", "test:compose"], ui, browserEnv);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
