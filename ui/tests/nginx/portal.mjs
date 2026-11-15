import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

const excluded = [
  "/terms/", "/privacy/", "/docs/open-source/", "/docs/plans-and-billing/", "/docs/usage/",
  "/docs/retention/", "/docs/organizations/", "/docs/employees/", "/docs/teams/", "/docs/delegations/",
  "/docs/templates/", "/docs/discussions/", "/docs/receipts/", "/docs/api-tokens/", "/fr/docs/", "/en/docs/",
];

/** Check the shipped portal's contents and every local HTML link, including footer links. */
export async function checkPortal(origin, request) {
  for (const path of excluded) {
    const response = await request(path);
    assert.equal(response.status, 404, path);
    assert.equal(response.headers.get("location"), null, path);
  }
  const queue = ["/"];
  const visited = new Set();
  while (queue.length) {
    const path = queue.shift();
    if (visited.has(path)) continue;
    visited.add(path);
    const response = await request(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.doesNotMatch(html, /class="language-picker"|localStorage.getItem\("language"\)/, path);
    assert.doesNotMatch(html, /href="(?:\.\.\/)*(?:terms|privacy)\//, path);
    for (const match of html.matchAll(/href="([^"#]+)(?:#[^"]*)?"/g)) {
      const url = new URL(match[1].replaceAll("&amp;", "&"), `${origin}${path}`);
      if (url.origin !== origin || url.pathname.startsWith("/app/") || url.pathname === "/swagger/") continue;
      if (url.pathname.endsWith("/")) queue.push(url.pathname);
    }
  }
  assert.ok(visited.size >= 16, "The landing page and full guide navigation are reachable");
  assert.ok(visited.has("/docs/security/") && visited.has("/docs/troubleshooting/"));
  const index = await (await request("/search/search_index.json")).json();
  assert.ok(index.docs.some((item) => item.location.startsWith("docs/workflow-steps/")));
  for (const item of index.docs) {
    assert.ok(!excluded.includes(`/${item.location.split("#")[0]}`), item.location);
  }
  const sitemap = await (await request("/sitemap.xml")).text();
  assert.doesNotMatch(sitemap, /click2approve\.com|hreflang|\/fr\//);
}

export async function checkPortalBrowser(origin) {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || undefined });
  try {
    const context = await browser.newContext();
    await context.route("**/*", (route) =>
      new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
    );
    await context.addInitScript(() => localStorage.setItem("language", "fr"));
    const page = await context.newPage();
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      for (const path of ["/", "/docs/", "/docs/create-a-request/", "/contact/"]) {
        await page.goto(`${origin}${path}`);
        assert.equal(new URL(page.url()).pathname, path, "Saved commercial language does not redirect this portal");
        await expect(page.locator("h1")).toBeVisible();
        await expect(page.locator(".language-picker")).toHaveCount(0);
        for (const dark of [false, true]) {
          await page.locator('.docs-color-mode input[role="switch"]').setChecked(dark);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path);
        }
      }
    }
  } finally {
    await browser.close();
  }
}
