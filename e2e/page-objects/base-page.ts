import { Page, Locator, expect } from "@playwright/test";

/**
 * Base Page Object class that all page objects should extend
 * Provides common functionality for all pages
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string = "/"): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page to be fully loaded and hydrated
   */
  async waitForPageLoad(): Promise<void> {
    // Wait for Next.js to be ready
    await this.page.waitForLoadState("networkidle");
    // Wait for React hydration
    await this.page.waitForFunction(() => document.readyState === "complete");
  }

  /**
   * Get the header element
   */
  get header(): Locator {
    return this.page.locator("header");
  }

  /**
   * Get the footer element
   */
  get footer(): Locator {
    return this.page.locator("footer");
  }

  /**
   * Check if the page has loaded successfully without errors
   */
  async checkPageLoaded(): Promise<void> {
    // Check that we're not on an error page
    await expect(this.page.locator("text=Application error")).not.toBeVisible();
    await expect(this.page.locator("text=404")).not.toBeVisible();
    
    // Check that the header is present (common across all pages)
    await expect(this.header).toBeVisible();
  }

  /**
   * Check if the footer is present on the page
   */
  async checkFooterPresent(): Promise<void> {
    await expect(this.footer).toBeVisible();
  }

  /**
   * Get the page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Take a screenshot
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Wait for a specific element to be visible
   */
  async waitForElement(selector: string, timeout: number = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { state: "visible", timeout });
  }

  /**
   * Click on an element by test id
   */
  async clickByTestId(testId: string): Promise<void> {
    await this.page.getByTestId(testId).click();
  }

  /**
   * Get element by test id
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Check if element is visible by test id
   */
  async isVisibleByTestId(testId: string): Promise<boolean> {
    return await this.getByTestId(testId).isVisible();
  }
}

