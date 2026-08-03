import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * Tests in `e2e/data` don't need the app running - they call our data functions directly in Node.
 * The `data` project sets this env variable so we don't spin up the Next.js server for them.
 */
const skipWebServer = !!process.env.PLAYWRIGHT_SKIP_WEBSERVER;

/** Glob of the Node-only data tests - those must not run in the browser projects. */
const DATA_TESTS_GLOB = "data/**/*.spec.ts";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Run 2 tests in parallel on CI. */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [["html"], ["github"], ["list"]] : [["html"], ["list"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Screenshot on failure */
    screenshot: "only-on-failure",

    /* Video on failure */
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: DATA_TESTS_GLOB,
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: DATA_TESTS_GLOB,
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: DATA_TESTS_GLOB,
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
      testIgnore: DATA_TESTS_GLOB,
    },

    /**
     * Integration tests of the data mappings (downloading + parsing the data packages from the
     * coh3-data repo). No browser and no local app needed, the downloads are heavy which is why
     * those tests live in the e2e suite instead of the unit tests.
     * Run with `yarn test:e2e:data`.
     */
    {
      name: "data",
      testMatch: DATA_TESTS_GLOB,
      timeout: 180 * 1000,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: skipWebServer
    ? undefined
    : {
        command: "yarn start",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      },
});
