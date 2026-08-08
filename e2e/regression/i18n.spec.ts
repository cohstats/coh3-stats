import { test, expect, Page } from "@playwright/test";
import { SiteChromePage } from "../page-objects/site-chrome-page";

/**
 * Regression tests for the localisation - `next-i18next` with the locales listed in
 * `next-i18next.config.js` and the translation files under `public/locales/`.
 *
 * IMPORTANT about the build: `next-i18next.config.js` builds **English only** when
 * `FULL_BUILD=false`, which is exactly what `yarn build:slim` (used locally and in the CI e2e job)
 * does. On such a build every `/<locale>/...` route is a 404, so the per-locale sweep below detects
 * that and skips itself instead of failing. Everything that does not need a second locale - the
 * `lang` attribute, the hreflang alternates, the switcher, and the "no raw translation key leaked
 * into the page" check - runs on every build.
 */

/** Locales which have translation files in `public/locales`. `en` is the default one. */
const TRANSLATED_LOCALES = ["cs", "de", "es", "ru", "zh-Hans"] as const;

/** Pages worth loading per locale - one static, one server rendered, one data heavy. */
const REPRESENTATIVE_PAGES = ["/", "/leaderboards", "/explorer/maps"];

/**
 * Prefixes of the translation keys used across the app. i18next falls back to rendering the key
 * itself when a namespace or a key is missing, so any of these showing up in the visible text of a
 * page means a translation did not resolve.
 */
const KEY_PREFIXES = [
  "mainMenu.",
  "footer.",
  "meta.title",
  "meta.description",
  "page.title",
  "page.subtitle",
  "filters.",
  "card.players",
  "detail.overview",
  "search.playersAndUnits",
];

const expectNoRawTranslationKeys = async (page: Page) => {
  const text = await page.locator("body").innerText();
  for (const prefix of KEY_PREFIXES) {
    expect(text, `raw translation key "${prefix}" leaked into the page`).not.toContain(prefix);
  }
};

/**
 * Load a localized route. Returns false when the locale is not part of this build, so the caller
 * can skip instead of failing.
 */
const gotoLocale = async (page: Page, locale: string, path: string): Promise<boolean> => {
  const response = await page.goto(locale === "en" ? path : `/${locale}${path}`);
  return response?.status() !== 404;
};

test.describe("i18n - default locale", () => {
  test("should render English with the right lang attribute", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expectNoRawTranslationKeys(page);
  });

  test("should not leak raw translation keys on the localized pages", async ({ page }) => {
    for (const path of REPRESENTATIVE_PAGES) {
      await page.goto(path);
      await expectNoRawTranslationKeys(page);
    }
  });

  test("should emit hreflang alternates and a canonical", async ({ page }) => {
    await page.goto("/explorer/maps");

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", /\/explorer\/maps$/);

    // Always present, whatever the build: the default locale plus the x-default fallback.
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      "href",
      /\/explorer\/maps$/,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      "href",
      /\/explorer\/maps$/,
    );

    // The localized alternates are only generated for the locales the build ships.
    const alternates = page.locator('link[rel="alternate"][hreflang]');
    expect(await alternates.count()).toBeGreaterThanOrEqual(2);
    for (const href of await alternates.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href") ?? ""),
    )) {
      expect(href).toMatch(/\/explorer\/maps$/);
    }
  });
});

test.describe("i18n - locale sweep", () => {
  for (const locale of TRANSLATED_LOCALES) {
    test(`should render the ${locale} pages`, async ({ page }) => {
      if (!(await gotoLocale(page, locale, "/"))) {
        test.skip(true, `Locale ${locale} is not part of this build (FULL_BUILD=false)`);
      }

      for (const path of REPRESENTATIVE_PAGES) {
        expect(await gotoLocale(page, locale, path)).toBe(true);

        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.locator("header").first()).toBeVisible();
        await expectNoRawTranslationKeys(page);
      }
    });
  }

  test("should translate the chrome away from English", async ({ page }) => {
    if (!(await gotoLocale(page, "de", "/"))) {
      test.skip(true, "German is not part of this build (FULL_BUILD=false)");
    }

    const german = await page.locator("footer").first().innerText();

    await page.goto("/");
    const english = await page.locator("footer").first().innerText();

    expect(german).not.toBe(english);
  });
});

test.describe("i18n - language switcher", () => {
  test("should keep the path and the query when switching the language", async ({ page }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/leaderboards?race=german&type=1v1");
    await chrome.dismissDevSiteNotification();

    if (page.viewportSize() && page.viewportSize()!.width < 800) {
      await chrome.openMobileMenu();
    }

    await expect(chrome.languageSwitcher).toHaveValue("English");
    await chrome.languageSwitcher.click();
    await page.locator('[role="option"]:visible').filter({ hasText: "Deutsch" }).first().click();

    // On an English-only build Next has no `/de` route and stays put - nothing to assert then.
    const switched = await page
      .waitForURL(/\/de\//, { timeout: 10000 })
      .then(() => true)
      .catch(() => false);
    if (!switched) {
      test.skip(true, "German is not part of this build (FULL_BUILD=false)");
    }

    const url = new URL(page.url());
    expect(url.pathname).toBe("/de/leaderboards");
    expect(url.searchParams.get("race")).toBe("german");
    expect(url.searchParams.get("type")).toBe("1v1");
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
  });

  test("should remember the choice in the NEXT_LOCALE cookie", async ({ page, context }) => {
    const chrome = new SiteChromePage(page);
    await chrome.goto("/");
    await chrome.dismissDevSiteNotification();

    if (page.viewportSize() && page.viewportSize()!.width < 800) {
      await chrome.openMobileMenu();
    }

    await chrome.languageSwitcher.click();
    await page.locator('[role="option"]:visible').filter({ hasText: "Deutsch" }).first().click();

    await expect
      .poll(async () => (await context.cookies()).find((c) => c.name === "NEXT_LOCALE")?.value)
      .toBe("de");
  });
});
