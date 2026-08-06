import { test as base, expect, Page } from "@playwright/test";

/**
 * Console-error / failed-request collector fixture.
 *
 * `checkPageLoaded()` only asserts that a `header` is visible, so it happily passes on a page
 * whose whole body blew up during hydration. This fixture records everything the browser
 * complained about while a test was running, so a spec can assert that a page rendered *cleanly*
 * and not just that it responded.
 *
 * Usage:
 *
 *   import { test, expect } from "../fixtures/page-issues";
 *
 *   test("renders cleanly", async ({ page, pageIssues }) => {
 *     await page.goto("/");
 *     expect(pageIssues.errors()).toEqual([]);
 *   });
 */

export interface PageIssues {
  /** `console.error(...)` messages emitted by the page. */
  consoleErrors: string[];
  /** Uncaught exceptions / unhandled rejections in the page. */
  uncaughtErrors: string[];
  /** Requests that never completed (blocked, DNS failure, connection reset, ...). */
  failedRequests: string[];
  /** Responses with a 5xx status. */
  serverErrors: string[];
  /** Everything above, flattened - the list a test usually wants to assert on. */
  errors: () => string[];
}

/**
 * Noise we do not want to fail tests on. These are third-party integrations that are either
 * blocked in CI, rate-limited, or simply not part of what the e2e suite is verifying.
 */
const IGNORED_PATTERNS: RegExp[] = [
  // Analytics / telemetry - not configured in local & CI runs.
  /googletagmanager|google-analytics|firebaseinstallations|firebase-settings|firebaselogging/i,
  /clarity\.ms|doubleclick|adservice|adsbygoogle|pagead|ezoic|ezodn|sonobi/i,
  // Embedded third-party content on the home page.
  /twitch\.tv|ytimg\.com|youtube\.com|reddit\.com|redditmedia/i,
  // Steam avatars & other remote images are frequently slow / 403 for hotlinking.
  /steamstatic\.com|steamcommunity\.com/i,
  // React dev-mode noise that is not an app failure.
  /Download the React DevTools/i,
  /was preloaded using link preload but not used/i,
  // Next.js image optimizer complaining about a remote host being slow.
  /Failed to load resource: net::ERR_(BLOCKED_BY_CLIENT|BLOCKED_BY_RESPONSE)/i,
];

const isIgnored = (message: string) => IGNORED_PATTERNS.some((pattern) => pattern.test(message));

/**
 * Start collecting issues for a page. Returns the collector - listeners stay attached for the
 * lifetime of the page, so it keeps recording across navigations.
 */
export const collectPageIssues = (page: Page): PageIssues => {
  const issues: PageIssues = {
    consoleErrors: [],
    uncaughtErrors: [],
    failedRequests: [],
    serverErrors: [],
    errors: () => [
      ...issues.uncaughtErrors,
      ...issues.consoleErrors,
      ...issues.serverErrors,
      ...issues.failedRequests,
    ],
  };

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = `console.error: ${message.text()}`;
    if (!isIgnored(text)) issues.consoleErrors.push(text);
  });

  page.on("pageerror", (error) => {
    const text = `uncaught: ${error.message}`;
    if (!isIgnored(text)) issues.uncaughtErrors.push(text);
  });

  page.on("requestfailed", (request) => {
    const text = `requestfailed: ${request.url()} (${request.failure()?.errorText})`;
    if (!isIgnored(text)) issues.failedRequests.push(text);
  });

  page.on("response", (response) => {
    if (response.status() < 500) return;
    const text = `http ${response.status()}: ${response.url()}`;
    if (!isIgnored(text)) issues.serverErrors.push(text);
  });

  return issues;
};

/**
 * `@playwright/test` with a `pageIssues` fixture attached to the default `page`.
 */
export const test = base.extend<{ pageIssues: PageIssues }>({
  pageIssues: async ({ page }, use) => {
    await use(collectPageIssues(page));
  },
});

export { expect };
