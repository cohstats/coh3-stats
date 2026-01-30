import { test, expect } from "@playwright/test";
import { navigateAndWait, checkPageLoaded, checkFooterPresent } from "../helpers/test-utils";

test.describe("Explorer Pages", () => {
  test("should load explorer index page", async ({ page }) => {
    await navigateAndWait(page, "/explorer");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should load challenges page", async ({ page }) => {
    await navigateAndWait(page, "/explorer/challenges");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should load weapons page", async ({ page }) => {
    await navigateAndWait(page, "/explorer/weapons");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should load DPS calculator page", async ({ page }) => {
    await navigateAndWait(page, "/explorer/dps");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should load unit browser page", async ({ page }) => {
    await navigateAndWait(page, "/explorer/unit-browser");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });

  test("should load faction units page", async ({ page }) => {
    await navigateAndWait(page, "/explorer/races/american/units");
    await checkPageLoaded(page);
    await checkFooterPresent(page);
  });
});

