import assert from "node:assert/strict";
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ui = fileURLToPath(new URL("../../", import.meta.url));
const locales = JSON.parse(readFileSync(join(ui, "locales.json"), "utf8"));

/** Check the real public host, including canonical identity and locale-specific HTTP errors. */
export async function checkLocalization(origin, request) {
  const indexes = new Set();
  const suffixes = ["", "docs/", "docs/create-a-request/", "contact/", "terms/", "privacy/"];
  for (const locale of locales) {
    for (const suffix of suffixes) {
      const path = `/${locale.path}/${suffix}`;
      const response = await request(path);
      assert.equal(response.status, 200, path);
      const html = await response.text();
      const canonical = locale.path === "en" ? `/${suffix}` : path;
      assert.ok(html.includes(`rel="canonical" href="https://click2approve.com${canonical}"`), path);
      assert.equal((html.match(/class="language-picker"/g) || []).length, 1, path);
      assert.equal((html.match(/rel="alternate" hreflang=/g) || []).length, 0, path);
      assert.ok(html.includes(`hreflang="${locale.code}"`), path);
      assert.match(html, new RegExp(`<body dir="${locale.direction}"`));
      assert.ok(html.includes('href="/app/"'), path);
      assert.ok(!html.includes(`/${locale.path}/app/`), path);
      assert.doesNotMatch(html, /ZXQ\d+QXZ|\{\{\s*t\(/, path);
    }
    for (const path of [`/${locale.path}`, `/${locale.path}/docs`, `/${locale.path}/docs/create-a-request`]) {
      const response = await request(`${path}?from=locale-test`);
      assert.equal(response.status, 301, path);
      assert.equal(response.headers.get("location"), `${path}/?from=locale-test`, path);
    }
    const missing = await request(`/${locale.path}/does-not-exist/`);
    assert.equal(missing.status, 404, locale.path);
    const error = await missing.text();
    const catalog = JSON.parse(readFileSync(join(ui, `docs/i18n/${locale.path}.json`), "utf8")).messages;
    assert.ok(error.includes(catalog["Page not found"]), locale.path);
    assert.ok(error.includes('name="robots" content="noindex"'), locale.path);
    if (error.includes('id="analytics-bootstrap"'))
      assert.ok(error.includes(`data-page-path="/${locale.path}/404.html"`), locale.path);
    assert.equal((await request(`/${locale.path}/app/missing`)).status, 404);
    const index = await (await request(`/${locale.path}/search/search_index.json`)).json();
    assert.ok(index.docs.length > 30, locale.path);
    assert.ok(
      index.docs.every((entry) => /^(?:docs|contact)\//.test(entry.location)),
      locale.path,
    );
    indexes.add(JSON.stringify(index.docs));
  }
  assert.equal(indexes.size, locales.length, "Each URL language has its own search index, including English aliases");
  const sitemap = await (await request("/sitemap.xml")).text();
  assert.ok(!sitemap.includes("click2approve.com/en/"), "English aliases are not separate sitemap entries");
  const entries = new Map(
    [...sitemap.matchAll(/<url>(.*?)<\/url>/gs)].map((match) => [match[1].match(/<loc>(.*?)<\/loc>/)[1], match[1]]),
  );
  for (const locale of locales) {
    for (const suffix of suffixes) {
      const canonical = `https://click2approve.com/${locale.path === "en" ? "" : `${locale.path}/`}${suffix}`;
      const entry = entries.get(canonical);
      assert.ok(entry, canonical);
      assert.equal((entry.match(/<xhtml:link /g) || []).length, locales.length + 1, canonical);
      for (const alternate of locales) {
        const href = `https://click2approve.com/${alternate.path === "en" ? "" : `${alternate.path}/`}${suffix}`;
        assert.ok(entry.includes(`hreflang="${alternate.code}" href="${href}"`), canonical);
      }
      assert.ok(entry.includes(`hreflang="x-default" href="https://click2approve.com/${suffix}"`), canonical);
    }
  }
  for (const locale of locales.filter((item) => item.path !== "en"))
    assert.ok(sitemap.includes(`click2approve.com/${locale.path}/docs/`), locale.path);
  assert.equal((await request("/xx/does-not-exist/")).status, 404);
  console.log("Localization hosting checks passed for every published language.");
}

/** Exercise actual Material search and the shared pickers without starting development servers. */
export async function checkLocalizationBrowser(origin) {
  const { chromium, expect } = await import("@playwright/test");
  const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || undefined });
  try {
    const context = await browser.newContext();
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin === origin) await route.continue();
      else await route.fulfill({ body: "", contentType: "application/javascript" });
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const queries = {
      en: "document",
      es: "aprobación",
      fr: "approbation",
      ja: "承認",
      "pt-br": "aprovação",
      de: "Genehmigung",
      it: "approvazione",
      ko: "승인",
      "zh-hans": "批准",
      ar: "الموافقة",
      id: "persetujuan",
      tr: "onay",
      ru: "документ",
      pl: "zatwierdzania",
    };
    for (const locale of locales) {
      await page.goto(`${origin}/${locale.path}/docs/create-a-request/`);
      const consentClose = page.locator("[data-analytics-close]");
      if (await consentClose.isVisible()) await consentClose.click();
      const input = page.locator('[data-md-component="search-query"]');
      await expect(input).toBeVisible();
      await input.pressSequentially(queries[locale.path]);
      const results = page.locator(".md-search-result__link");
      await expect
        .poll(() => results.count(), { message: `Search results for ${locale.path}`, timeout: 15000 })
        .toBeGreaterThan(0);
      for (const href of await results.evaluateAll((links) => links.map((link) => link.href)))
        assert.ok(new URL(href).pathname.startsWith(`/${locale.path}/`), href);
    }
    for (const code of ["ru", "pl", "ar", "ja"]) {
      for (const width of [390, 1280]) {
        await page.setViewportSize({ width, height: 850 });
        await page.goto(`${origin}/${code}/docs/create-a-request/?from=picker#compose-the-request`);
        await page.locator(".md-header .language-picker summary").click();
        const target = page.locator('.md-header .language-picker a[hreflang="fr"]');
        await expect(target).toBeVisible();
        assert.equal(new URL(await target.getAttribute("href")).hash, "#compose-the-request");
        await page.keyboard.press("Escape");
        await expect(page.locator(".md-header .language-picker summary")).toBeFocused();
        if (width === 1280) {
          await page.locator(".md-header .language-picker summary").click();
          await target.click();
          await page.waitForURL("**/fr/docs/create-a-request/?from=picker#compose-the-request");
          await page.goto(`${origin}/${code}/docs/create-a-request/?from=picker#compose-the-request`);
        }
        for (const scheme of ["default", "slate"]) {
          await page.locator(".docs-color-mode input").setChecked(scheme === "slate");
          await expect(page.locator("body")).toHaveAttribute("data-md-color-scheme", scheme);
          assert.ok(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            `${code} ${width} overflow`,
          );
          if (process.env.C2A_TEST_ARTIFACTS) {
            mkdirSync(process.env.C2A_TEST_ARTIFACTS, { recursive: true });
            await page.screenshot({
              path: join(process.env.C2A_TEST_ARTIFACTS, `docs-${code}-${width}-${scheme}.png`),
            });
          }
        }
        await expect(page.locator(".site-footer .language-picker")).toHaveCount(0);
      }
    }
    await page.goto(`${origin}/pl/`);
    await page.locator(".site-open-app").waitFor();
    assert.equal(new URL(await page.locator(".site-open-app").getAttribute("href"), origin).pathname, "/app/");
    const headerMetrics = () => {
      const nav = document.querySelector(".md-header__inner");
      const style = getComputedStyle(nav);
      const palette = document.querySelector(".docs-color-mode").getBoundingClientRect();
      return { left: style.paddingLeft, right: style.paddingRight,
        height: document.querySelector(".md-header").getBoundingClientRect().height,
        paletteWidth: palette.width, paletteHeight: palette.height };
    };
    const visibleHeaderInsets = () => {
      const brand = document.querySelector(".site-brand").getBoundingClientRect();
      const svg = document.querySelector(".site-open-app-icon svg");
      const rect = svg.getBoundingClientRect();
      const ink = svg.querySelector("path").getBBox();
      const scale = rect.width / svg.viewBox.baseVal.width;
      const rtl = getComputedStyle(document.body).direction === "rtl";
      return {
        leading: rtl ? innerWidth - brand.right : brand.left,
        trailing: rtl ? rect.right - (ink.x + ink.width) * scale
          : innerWidth - (rect.left + (ink.x + ink.width) * scale),
      };
    };
    await page.goto(`${origin}/en/docs/`);
    const docsHeaderMetrics = await page.evaluate(headerMetrics);
    for (const width of [320, 359, 360, 390, 700, 899, 900, 1280]) {
      await page.setViewportSize({ width, height: 850 });
      for (const code of ["pl", "ru", "ar", "ja", "pt-br", "id", "tr"]) {
        await page.goto(`${origin}/${code}/`);
        await page.evaluate(() => document.fonts.ready);
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `${code} landing ${width}`,
        );
        const heroOffset = await page.evaluate(() => {
          const header = document.querySelector(".site-header").getBoundingClientRect();
          const firstContent = document.querySelector(".site-hero .site-eyebrow").getBoundingClientRect();
          return firstContent.top - header.bottom;
        });
        assert.ok(Math.abs(heroOffset - (width < 900 ? 24 : 32)) < 1,
          `${code} ${width}: landing content starts at the shared top inset, got ${heroOffset}`);
        const small = width < 900;
        assert.deepEqual(await page.evaluate(headerMetrics), docsHeaderMetrics,
          `${code} ${width}: gutters, height, and appearance switch match Docs`);
        const controls = [".site-brand", ".site-header-links", ".site-open-app", ".language-picker summary", ".docs-color-mode"];
        for (const selector of controls) {
          const box = await page.locator(`.site-header ${selector}`).boundingBox();
          assert.ok(box && box.x >= -1 && box.x + box.width <= width + 1, `${code} ${width}: ${selector} fits`);
        }
        const brandBox = await page.locator(".site-header .site-brand").boundingBox();
        for (const selector of controls.filter((selector) => selector !== ".site-brand")) {
          const box = await page.locator(`.site-header ${selector}`).boundingBox();
          assert.ok(Math.abs(box.y + box.height / 2 - (brandBox.y + brandBox.height / 2)) < 2,
            `${code} ${width}: single-row header ${selector}`);
        }
        const messages = JSON.parse(readFileSync(join(ui, `docs/i18n/${code}.json`), "utf8")).messages;
        await expect(page.locator(".site-open-app")).toHaveAccessibleName(messages["Open app"]);
        await expect(page.locator(".site-open-app")).toHaveAttribute("title", messages["Open app"]);
        await expect(page.locator(".site-docs-link")).toBeVisible();
        await expect(page.locator(".site-docs-link")).toHaveAccessibleName(messages["Docs"]);
        if (small) {
          const insets = await page.evaluate(visibleHeaderInsets);
          assert.ok(Math.abs(insets.leading - insets.trailing) < 1,
            `${code} ${width}: visible leading/trailing insets ${JSON.stringify(insets)}`);
          await expect(page.locator(".site-docs-label")).toBeHidden();
          await expect(page.locator(".site-docs-icon")).toBeVisible();
          await expect(page.locator(".site-open-app-label")).toBeHidden();
          await expect(page.locator(".site-open-app-icon")).toBeVisible();
        } else {
          await expect(page.locator(".site-docs-label")).toHaveText(messages["Docs"]);
          await expect(page.locator(".site-docs-label")).toBeVisible();
          await expect(page.locator(".site-docs-icon")).toBeHidden();
          await expect(page.locator(".site-open-app-label")).toHaveText(messages["Open app"]);
          await expect(page.locator(".site-open-app-label")).toBeVisible();
          await expect(page.locator(".site-open-app-icon")).toBeHidden();
        }
        if (width < 360) await expect(page.locator(".site-header .site-brand span")).toBeHidden();
        else await expect(page.locator(".site-header .site-brand span")).toBeVisible();
        assert.ok(
          await page
            .locator(".site-header .site-brand span")
            .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
          `${code} ${width}: complete brand name`,
        );
        if (code === "ar" && width === 1280) {
          const brand = await page.locator(".site-header .site-brand").boundingBox();
          assert.ok(brand.x + brand.width > width * 0.9, "RTL branding stays at the leading edge");
        }
        await page.locator(".md-header .language-picker summary").click();
        await expect(page.locator('.md-header .language-picker a[hreflang="ru"]')).toBeVisible();
        if (process.env.C2A_TEST_ARTIFACTS) {
          await page.locator(".md-header .language-picker summary").click();
          await page.screenshot({
            path: join(process.env.C2A_TEST_ARTIFACTS, `landing-${code}-${width}.png`),
          });
          if (width === 320 && ["ru", "ar"].includes(code)) {
            await page.locator(".docs-color-mode input").setChecked(false);
            await page.screenshot({ path: join(process.env.C2A_TEST_ARTIFACTS, `landing-${code}-${width}-light.png`) });
            await page.locator(".docs-color-mode input").setChecked(true);
          }
        }
      }
    }
    // Remember a choice through app navigation and fresh tabs on the same origin.
    await page.goto(`${origin}/en/docs/create-a-request/`);
    await page.locator(".md-header .language-picker summary").click();
    await page.locator('.md-header .language-picker a[data-language="ru"]').click();
    await page.waitForURL("**/ru/docs/create-a-request/");
    assert.equal(await page.evaluate(() => localStorage.getItem("language")), "ru");
    await page.goto(`${origin}/app/`);
    await page.waitForURL("**/app/");
    for (const suffix of ["privacy/", "docs/", "docs/create-a-request/"]) {
      await page.goto(`${origin}/${suffix}?from=app#compose-the-request`);
      await page.waitForURL(`${origin}/ru/${suffix}?from=app#compose-the-request`);
    }
    const fresh = await context.newPage();
    await fresh.goto(`${origin}/privacy/`);
    await fresh.waitForURL("**/ru/privacy/");
    await fresh.close();
    for (const path of ["/en/privacy/", "/pl/docs/", "/missing-page/"]) {
      await page.goto(`${origin}${path}`);
      assert.equal(new URL(page.url()).pathname, path, "Explicit prefixes and errors retain their URL");
    }
    await page.goto(`${origin}/en/privacy/`);
    await page.locator(".md-header .language-picker summary").click();
    await page.locator('.md-header .language-picker a[data-language="en"]').click();
    await page.waitForURL("**/en/privacy/");
    await page.goto(`${origin}/privacy/`);
    assert.equal(new URL(page.url()).pathname, "/privacy/", "Choosing English disables remembered redirects");
    await page.evaluate(() => localStorage.setItem("language", "../../app/"));
    await page.goto(`${origin}/privacy/`);
    assert.equal(new URL(page.url()).pathname, "/privacy/", "Invalid preferences are ignored");
    assert.deepEqual(errors, []);
    await context.close();
    const blocked = await browser.newContext();
    await blocked.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new DOMException("Storage unavailable", "SecurityError"); };
      Storage.prototype.setItem = () => { throw new DOMException("Storage unavailable", "SecurityError"); };
    });
    const privatePage = await blocked.newPage();
    await privatePage.goto(`${origin}/privacy/`);
    await privatePage.locator(".md-header .language-picker summary").click();
    await privatePage.locator('.md-header .language-picker a[data-language="pl"]').click();
    await privatePage.waitForURL("**/pl/privacy/");
    await blocked.close();
    const noScript = await browser.newContext({ javaScriptEnabled: false });
    const plain = await noScript.newPage();
    await plain.setViewportSize({ width: 390, height: 850 });
    await plain.goto(`${origin}/ru/`);
    await plain.locator(".site-docs-link").click();
    await plain.waitForURL("**/ru/docs/");
    await plain.goto(`${origin}/ru/docs/create-a-request/`);
    await plain.locator(".md-header .language-picker summary").click();
    await plain.locator('.md-header .language-picker a[hreflang="pl"]').click();
    await plain.waitForURL("**/pl/docs/create-a-request/");
    await noScript.close();
    const touch = await browser.newContext({
      viewport: { width: 320, height: 850 },
      isMobile: true,
      hasTouch: true,
    });
    await touch.route("**/*", (route) =>
      new URL(route.request().url()).origin === origin
        ? route.continue()
        : route.fulfill({ body: "", contentType: "application/javascript" }),
    );
    const phone = await touch.newPage();
    for (const code of ["ru", "pl", "ar"]) {
      await phone.goto(`${origin}/${code}/?from=touch`);
      const close = phone.locator("[data-analytics-close]");
      if (await close.isVisible()) await close.tap();
      const touchInsets = await phone.evaluate(visibleHeaderInsets);
      assert.ok(Math.abs(touchInsets.leading - touchInsets.trailing) < 1,
        `${code}: balanced visible touch-header insets ${JSON.stringify(touchInsets)}`);
      assert.ok(
        await phone
          .locator(".site-header .site-brand span")
          .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
        `${code}: complete brand on a touch screen`,
      );
      await phone.locator(".md-header .language-picker summary").tap();
      await phone.locator('.md-header .language-picker a[hreflang="fr"]').tap();
      await phone.waitForURL("**/fr/?from=touch");
      if (process.env.C2A_TEST_ARTIFACTS)
        await phone.screenshot({ path: join(process.env.C2A_TEST_ARTIFACTS, `touch-from-${code}.png`) });
    }
    await phone.locator(".site-open-app").tap();
    await phone.waitForURL("**/app/");
    await touch.close();
    console.log(
      "Localization browser checks passed: search, header layout, language memory, deep links, themes, RTL, mobile, and no-JavaScript navigation.",
    );
  } finally {
    await browser.close();
  }
}
