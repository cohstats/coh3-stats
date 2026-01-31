import { test } from "@playwright/test";
import { navigateAndWait, checkPageLoaded, checkFooterPresent } from "../helpers/test-utils";

test.describe("Stats Pages", () => {
  test("should load leaderboards stats page", async ({ page }) => {
    await navigateAndWait(page, "/stats/leaderboards");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should load achievements stats page", async ({ page }) => {
    await navigateAndWait(page, "/stats/achievements");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should load players stats page", async ({ page }) => {
    await navigateAndWait(page, "/stats/players");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should load games stats page", async ({ page }) => {
    await navigateAndWait(page, "/stats/games");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should load maps stats page", async ({ page }) => {
    await navigateAndWait(page, "/stats/maps");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });
});
