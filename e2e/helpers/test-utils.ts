import { expect, Page } from "@playwright/test";

/**
 * Wait for the page to be fully loaded and hydrated
 */
export const waitForPageLoad = async (page: Page) => {
  // Wait for Next.js to be ready
  await page.waitForLoadState("networkidle");
  // Wait for React hydration
  await page.waitForFunction(() => document.readyState === "complete");
};

/**
 * Check if the page has loaded successfully without errors
 */
export const checkPageLoaded = async (page: Page) => {
  // Check that we're not on an error page
  await expect(page.locator("text=Application error")).not.toBeVisible();
  await expect(page.locator("text=404")).not.toBeVisible();
  
  // Check that the header is present (common across all pages)
  await expect(page.locator("header")).toBeVisible();
};

/**
 * Check if the footer is present on the page
 */
export const checkFooterPresent = async (page: Page) => {
  await expect(page.locator("footer")).toBeVisible();
};

/**
 * Navigate to a route and wait for it to load
 */
export const navigateAndWait = async (page: Page, path: string) => {
  await page.goto(path);
  await waitForPageLoad(page);
};

