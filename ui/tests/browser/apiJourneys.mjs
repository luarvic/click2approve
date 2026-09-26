// Started by BrowserJourneyTests, which owns the isolated API/database/provider fixtures.
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import { createServer } from "vite";

const config = JSON.parse(process.env.C2A_BROWSER_CONFIG);
const server = await createServer({
  mode: "test",
  define: {
    "import.meta.env.VITE_API_BASE_URI": JSON.stringify("/"),
    "import.meta.env.VITE_UI_BASE_URI": JSON.stringify(config.uiUrl),
  },
  server: { host: "127.0.0.1", port: config.port, strictPort: true, proxy: { "/api": config.apiUrl } },
  plugins: [
    {
      name: "test-payment-provider",
      configureServer(vite) {
        vite.middlewares.use(async (request, response, next) => {
          const url = new URL(request.url, config.uiUrl);
          if (url.pathname !== "/test-checkout") return next();
          const tenant = url.searchParams.get("tenant");
          if (url.searchParams.has("pay")) {
            await writeFile(config.paymentFile, "paid");
            response.writeHead(302, { Location: `/app/tenants/${tenant}/plans` });
            return response.end();
          }
          response.setHeader("Content-Type", "text/html");
          response.end(
            `<h1>Test payment provider</h1><a href="/app/tenants/${tenant}/plans">Return without paying</a><a href="/test-checkout?tenant=${tenant}&pay=1">Pay</a>`,
          );
        });
      },
    },
  ],
});
await server.listen();
let browser;
let requester;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || undefined, headless: true });
  const requesterContext = await browser.newContext();
  const approverContext = await browser.newContext();
  for (const context of [requesterContext, approverContext]) {
    await context.route("**/*", (route) =>
      ["127.0.0.1", "localhost"].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort(),
    );
  }
  requester = await requesterContext.newPage();
  const approver = await approverContext.newPage();
  requester.setDefaultTimeout(10000);
  approver.setDefaultTimeout(10000);
  const signIn = async (page, email, tenant) => {
    await page.addInitScript(
      (email) =>
        localStorage.setItem(
          `passkeyEnrollmentPromptDismissed.${encodeURIComponent(email.trim().toLowerCase())}`,
          "true",
        ),
      email,
    );
    await page.goto(`${config.uiUrl}/app/signIn?returnUrl=${encodeURIComponent(`/tenants/${tenant}/requests`)}`);
    await page.getByRole("textbox", { name: /^Email address/ }).fill(email);
    await page.locator('input[name="password"]').fill(config.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/tenants\//);
  };
  await signIn(requester, config.ownerEmail, config.ownerTenant);
  await signIn(approver, config.assigneeEmail, config.assigneeTenant);
  for (const approve of [true, false]) {
    const title = `Browser ${approve ? "approval" : "rejection"}`;
    await requester.goto(`${config.uiUrl}/app/tenants/${config.ownerTenant}/requests/new/compose`);
    await requester.getByRole("textbox", { name: /^Title/ }).fill(title);
    const uploaded = requester.waitForResponse(
      (response) => response.request().method() === "POST" && response.url().includes("/files/upload"),
    );
    await requester
      .locator('input[name="approval-request-files"]')
      .setInputFiles({ name: "approval.txt", mimeType: "text/plain", buffer: Buffer.from("Approve this document") });
    assert.equal((await uploaded).status(), 200);
    await expect(requester.getByText("approval.txt", { exact: true })).toBeVisible();
    await requester.getByRole("textbox", { name: /^Email/ }).fill(config.assigneeEmail);
    const submitted = requester.waitForResponse(
      (response) => response.request().method() === "POST" && /\/requests$/.test(new URL(response.url()).pathname),
    );
    await requester.getByRole("button", { name: "Submit", exact: true }).click();
    const response = await submitted;
    assert.equal(response.status(), 200, await response.text());
    const requestId = await response.json();
    await approver.goto(`${config.uiUrl}/app/tenants/${config.assigneeTenant}/tasks`);
    await approver.getByText(title, { exact: true }).click();
    await approver.getByRole("radio", { name: approve ? "Approve" : "Reject", exact: true }).check();
    if (!approve) await approver.getByRole("textbox", { name: /^Comment/ }).fill("Please revise the document");
    const completed = approver.waitForResponse(
      (response) => response.request().method() === "POST" && response.url().includes("/tasks/complete"),
    );
    await approver.getByRole("button", { name: "Submit", exact: true }).click();
    assert.equal((await completed).status(), 200);
    await requester.goto(`${config.uiUrl}/app/tenants/${config.ownerTenant}/requests/${requestId}`);
    await expect(requester.getByText(approve ? "Approved" : "Rejected", { exact: true }).first()).toBeVisible();
  }
  await requester.goto(`${config.uiUrl}/app/tenants/new`);
  await requester.getByRole("textbox", { name: /^Business name/ }).fill("Browser paid organization");
  await requester.getByRole("button", { name: "Next", exact: true }).click();
  await requester.getByRole("button", { name: "Choose Business Starter", exact: true }).click();
  await expect(requester.getByRole("heading", { name: "Test payment provider" })).toBeVisible();
  const paidTenant = new URL(requester.url()).searchParams.get("tenant");
  await requester.getByRole("link", { name: "Return without paying" }).click();
  await expect(requester.getByRole("button", { name: "Resolve payment", exact: true })).toBeVisible();
  const access = await requester.evaluate(async (tenant) => {
    const token = JSON.parse(localStorage.getItem("tokens")).accessToken;
    return (await fetch(`/api/v1/tenants/${tenant}/requests`, { headers: { Authorization: `Bearer ${token}` } }))
      .status;
  }, paidTenant);
  assert.equal(access, 402);
  await requester.getByRole("button", { name: "Resolve payment", exact: true }).click();
  await requester.getByRole("link", { name: "Pay", exact: true }).click();
  await expect(requester.getByRole("button", { name: "Manage billing", exact: true })).toBeVisible();
  await expect(requester.getByRole("button", { name: "Resolve payment", exact: true })).toHaveCount(0);
  const recovered = await requester.evaluate(async (tenant) => {
    const token = JSON.parse(localStorage.getItem("tokens")).accessToken;
    return (await fetch(`/api/v1/tenants/${tenant}/requests`, { headers: { Authorization: `Bearer ${token}` } }))
      .status;
  }, paidTenant);
  assert.equal(recovered, 200);
  console.log(
    "Browser journeys passed: sign-in, submission, approval, rejection, organization creation, unpaid return, payment recovery.",
  );
} catch (error) {
  if (requester) {
    await requester.screenshot({ path: `${config.artifacts}/failure.png`, fullPage: true }).catch(() => {});
    await writeFile(`${config.artifacts}/failure.html`, await requester.content()).catch(() => {});
  }
  throw error;
} finally {
  await browser?.close();
  await server.close();
}
