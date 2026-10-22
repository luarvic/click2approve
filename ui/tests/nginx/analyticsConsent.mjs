import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium, expect } from "@playwright/test";

/** Exercise the production container; no Google request leaves this test. */
export async function checkAnalyticsConsent(origin, analyticsId) {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_BIN || undefined,
    args: process.env.CHROME_NO_SANDBOX === "1" ? ["--no-sandbox"] : [],
  });
  try {
    const context = await browser.newContext();
    const googleRequests = [];
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (/googletagmanager\.com$|google-analytics\.com$/.test(url.hostname)) {
        googleRequests.push(url.href);
        await route.fulfill({ contentType: "application/javascript", body: "/* Google stub: no live data sent. */" });
      } else if (url.pathname === "/api/v1/products/info") {
        await route.fulfill({
          contentType: "application/json",
          headers: { "access-control-allow-origin": origin, "access-control-allow-credentials": "true" },
          body: JSON.stringify({ edition: "OpenSource", capabilities: {}, requiresConfirmedEmail: false }),
        });
      } else if (url.origin === origin) await route.continue();
      else await route.fulfill({ contentType: "application/json", body: "{}" });
    });
    const page = await context.newPage();
    const banner = page.getByRole("region", { name: "Optional analytics" });
    const toggle = page.getByRole("switch", { name: "Allow analytics", exact: true });
    const close = page.getByRole("button", { name: "Close analytics settings", exact: true });
    const settings = page.getByRole("button", { name: "Analytics settings", exact: true });
    const events = (tab) =>
      tab.evaluate(() =>
        (window.dataLayer || []).filter((item) => item[0] === "event").map((item) => Array.from(item)),
      );
    await page.goto(`${origin}/`, { waitUntil: "networkidle" });
    assert.equal(googleRequests.length, 0, "No Google requests before consent");
    if (!analyticsId) {
      await expect(banner).toHaveCount(0);
      await expect(settings).toHaveCount(0);
      for (const path of ["/docs/", "/app/signIn"]) {
        await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
        await expect(banner).toHaveCount(0);
        await expect(settings).toHaveCount(0);
      }
      assert.equal(googleRequests.length, 0);
    } else {
      await expect(banner).toBeVisible();
      await expect(toggle).not.toBeChecked();
      for (const [width, color] of [
        [390, "light"],
        [390, "dark"],
        [1280, "light"],
        [1280, "dark"],
      ]) {
        await page.setViewportSize({ width, height: 800 });
        await page.getByRole("switch", { name: "Dark mode" }).setChecked(color === "dark");
        await expect(page.locator("body")).toHaveAttribute(
          "data-md-color-scheme",
          color === "dark" ? "slate" : "default",
        );
        const box = await banner.boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= width, "Banner fits viewport");
        if (process.env.C2A_TEST_ARTIFACTS) {
          mkdirSync(process.env.C2A_TEST_ARTIFACTS, { recursive: true });
          await page.screenshot({ path: join(process.env.C2A_TEST_ARTIFACTS, `analytics-${width}-${color}.png`) });
        }
      }
      await close.click();
      await expect(banner).toHaveCount(0);
      await page.goto(`${origin}/docs/getting-started/`, { waitUntil: "networkidle" });
      await expect(banner).toHaveCount(0);
      assert.equal(googleRequests.length, 0, "Closing without enabling remembers rejection");
      await settings.click();
      await expect(toggle).toBeFocused();
      await toggle.check();
      await expect.poll(() => googleRequests.length).toBe(1);
      await expect(banner).toBeVisible();
      await close.click();
      const app = await context.newPage();
      await app.goto(`${origin}/app/signIn?email=private@example.com&token=secret`, { waitUntil: "networkidle" });
      await expect.poll(() => googleRequests.length).toBe(2);
      await expect(app.getByRole("region", { name: "Optional analytics" })).toHaveCount(0);
      await expect(app.getByRole("textbox", { name: "Email address", exact: true })).toBeVisible();
      await app.getByRole("textbox", { name: "Email address", exact: true }).fill("preserved@example.com");
      await app.evaluate(() => {
        window.unsavedTestMarker = "keep";
        document.cookie = "_ga=test; Path=/";
      });
      const appSettings = app.getByRole("button", { name: "Analytics settings", exact: true });
      const appToggle = app.getByRole("switch", { name: "Allow analytics", exact: true });
      await appSettings.click();
      await expect(appToggle).toBeChecked();
      if (process.env.C2A_TEST_ARTIFACTS) {
        await app.screenshot({ path: join(process.env.C2A_TEST_ARTIFACTS, "analytics-app-dark.png") });
      }
      await appToggle.uncheck();
      await expect.poll(() => page.evaluate((id) => window[`ga-disable-${id}`], analyticsId)).toBe(true);
      await expect(app.getByRole("textbox", { name: "Email address", exact: true })).toHaveValue(
        "preserved@example.com",
      );
      assert.equal(await app.evaluate(() => window.unsavedTestMarker), "keep", "Withdrawal must not reload app forms");
      await expect
        .poll(
          async () => (await context.cookies()).filter(({ name }) => name === "_ga" || name.startsWith("_ga_")).length,
        )
        .toBe(0);
      assert.equal(googleRequests.length, 2);
      const pausedCount = (await events(app)).length;
      await app.evaluate(() =>
        history.pushState(null, "", "/app/tenants/private-tenant/tasks/private-task/chat?token=secret#private"),
      );
      assert.equal((await events(app)).length, pausedCount, "No app navigation events after withdrawal");
      await settings.click();
      await expect(toggle).not.toBeChecked();
      await toggle.check();
      await expect.poll(() => app.evaluate((id) => window[`ga-disable-${id}`], analyticsId)).toBe(false);
      await expect.poll(async () => (await events(app)).length).toBe(pausedCount + 1);
      assert.equal(googleRequests.length, 2, "Re-enabling does not double load the Google script");
      await app.evaluate(() =>
        history.replaceState(
          null,
          "",
          "/app/tenants/private-tenant/requests/private-document/chat?email=private@example.com",
        ),
      );
      await expect
        .poll(async () => (await events(app)).at(-1)?.[2]?.page_location)
        .toBe(`${origin}/app/tenants/:tenant/requests/:request/chat`);
      assert.doesNotMatch(
        JSON.stringify(await events(app)),
        /private-tenant|private-task|private-document|private@example|secret/,
      );
      await app.close();
      await page.goto(`${origin}/docs/?email=private@example.com#private`, { waitUntil: "networkidle" });
      await expect.poll(() => googleRequests.length).toBe(3);
      assert.equal((await events(page))[0][2].page_location, `${origin}/docs/`);
      assert.equal((await events(page))[0][2].page_referrer, "");
      for (const value of ["not-json", JSON.stringify({ choice: "accepted", expiresAt: 0 })]) {
        await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
          key: `click2approve.analytics-consent.v1.${analyticsId}`,
          value,
        });
        await page.reload({ waitUntil: "networkidle" });
        await expect(banner).toBeVisible();
        await expect(toggle).not.toBeChecked();
      }
      assert.equal(googleRequests.length, 3);
      await page.addInitScript(() => {
        Storage.prototype.getItem = Storage.prototype.setItem = () => {
          throw new Error("Storage blocked");
        };
      });
      await page.reload({ waitUntil: "networkidle" });
      await expect(banner).toBeVisible();
      await toggle.check();
      await expect.poll(() => googleRequests.length).toBe(4);
      await close.click();
      await page.reload({ waitUntil: "networkidle" });
      await expect(banner).toBeVisible();
      await expect(toggle).not.toBeChecked();
      assert.equal(googleRequests.length, 4, "Unavailable storage never silently remembers acceptance");
    }
    await context.close();
    console.log(
      `Analytics browser checks passed (${analyticsId ? "configured" : "disabled"}); Google requests intercepted.`,
    );
  } finally {
    await browser.close();
  }
}
