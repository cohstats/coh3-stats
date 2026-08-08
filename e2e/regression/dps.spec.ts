import { test, expect } from "@playwright/test";
import { DpsPage } from "../page-objects/dps-page";

/**
 * Regression tests for the DPS benchmark tool - `/explorer/dps` and `/explorer/dps-compare`.
 *
 * The flagship tool of the explorer: it maps the whole sbps / ebps / weapon data into selectable
 * units, computes the damage curves in the browser and draws them into a chart.js canvas. Until now
 * the only coverage was "the page loads" plus the Final Stand unit-availability check in
 * `final-stand.spec.ts`, and `/explorer/dps-compare` was never opened at all.
 *
 * The units used below are the ones the whole suite pins - `grenadier_ger` exists in every patch.
 */

const UNIT_A = "grenadier_ger";
const UNIT_B = "riflemen_us";

test.describe("DPS calculator - VS mode", () => {
  test("should render the tool with an empty chart", async ({ page }) => {
    const dps = new DpsPage(page);
    await dps.navigate();

    await dps.checkPageLoaded();
    await expect(dps.title).toBeVisible();
    await expect(dps.chartCanvas).toBeVisible();

    // Nothing is selected yet, so both sides ask for a unit.
    await expect(page.getByText("Please select a unit")).toHaveCount(2);
    await expect(dps.unitSearch(1)).toBeVisible();
    await expect(dps.unitSearch(2)).toBeVisible();
    await dps.checkFooterPresent();
  });

  test("should draw a curve after selecting a unit", async ({ page }) => {
    const dps = new DpsPage(page);
    await dps.navigate();

    const empty = await dps.chartSnapshot();

    await dps.selectUnit(dps.unitSearch(1), UNIT_A);

    // The unit card with its loadout replaces the "please select a unit" placeholder.
    await expect(dps.unitCard(0)).toBeVisible();
    await expect(dps.unitCard(0)).toContainText(/HP/);
    expect(await dps.weaponCards(dps.unitCard(0)).count()).toBeGreaterThan(0);

    // ...and the chart is no longer the blank one.
    await expect.poll(() => dps.chartSnapshot(), { timeout: 15000 }).not.toBe(empty);
  });

  test("should draw a second curve for the opposing unit", async ({ page }) => {
    const dps = new DpsPage(page);
    await dps.navigate();

    await dps.selectUnit(dps.unitSearch(1), UNIT_A);
    await expect(dps.unitCard(0)).toBeVisible();
    const oneUnit = await dps.chartSnapshot();

    await dps.selectUnit(dps.unitSearch(2), UNIT_B);

    await expect(dps.unitCard(1)).toBeVisible();
    // The second unit is the target of the first one, so the first curve changes as well.
    await expect.poll(() => dps.chartSnapshot(), { timeout: 15000 }).not.toBe(oneUnit);
  });

  test("should redraw when the squad configuration changes", async ({ page }) => {
    const dps = new DpsPage(page);
    await dps.navigate();

    await dps.selectUnit(dps.unitSearch(1), UNIT_A);
    await expect(dps.unitCard(0)).toBeVisible();
    const standing = await dps.chartSnapshot();

    // The `Moving` modifier of the squad - one of the icon toggles above the loadout.
    await dps.unitCard(0).getByRole("button", { name: "Moving" }).click();

    await expect.poll(() => dps.chartSnapshot(), { timeout: 15000 }).not.toBe(standing);
  });

  test("should remove the unit again when the select is cleared", async ({ page }) => {
    const dps = new DpsPage(page);
    await dps.navigate();

    await dps.selectUnit(dps.unitSearch(1), UNIT_A);
    await expect(dps.unitCard(0)).toBeVisible();

    // Mantine renders a clear button inside the select once something is picked.
    await page.locator('[data-testid="dps-unit-search-1"] ~ * button').first().click();

    await expect(dps.unitCard(0)).toHaveCount(0);
    await expect(page.getByText("Please select a unit")).toHaveCount(2);
  });

  test("should switch to the DPS / target health view", async ({ page }) => {
    const dps = new DpsPage(page);
    await dps.navigate();

    await dps.selectUnit(dps.unitSearch(1), UNIT_A);
    await expect(dps.unitCard(0)).toBeVisible();
    const dpsView = await dps.chartSnapshot();

    await dps.settingsButton.hover();
    await page.getByTestId("dps-health-toggle").check();

    await expect.poll(() => dps.chartSnapshot(), { timeout: 15000 }).not.toBe(dpsView);
  });

  test("should switch to the compare mode from the segmented control", async ({ page }) => {
    const dps = new DpsPage(page);
    await dps.navigate();

    await dps.modeControl.getByText("Compare Mode").click();

    await page.waitForURL("**/explorer/dps-compare");
    await expect(dps.addUnitSearch).toBeVisible();
  });
});

test.describe("DPS compare", () => {
  test("should render the compare page with its two sections", async ({ page }) => {
    const dps = new DpsPage(page);
    await dps.navigate(true);

    await dps.checkPageLoaded();
    await expect(dps.title).toBeVisible();
    await expect(page.getByText("Attacking Units")).toBeVisible();
    await expect(page.getByText("Target Unit - Optional")).toBeVisible();

    await expect(dps.addUnitSearch).toBeVisible();
    // Nothing picked yet, so there is nothing to add.
    await expect(dps.addUnitButton).toBeDisabled();
    await expect(dps.attackerCards).toHaveCount(0);
    await dps.checkFooterPresent();
  });

  test("should add attackers and draw a curve per unit", async ({ page }) => {
    const dps = new DpsPage(page);
    await dps.navigate(true);

    const empty = await dps.chartSnapshot();

    await dps.selectUnit(dps.addUnitSearch, UNIT_A);
    await expect(dps.addUnitButton).toBeEnabled();
    await dps.addUnitButton.click();

    await expect(dps.attackerCards).toHaveCount(1);
    await expect(dps.attackerCards.first()).toContainText(/HP/);
    const oneAttacker = await dps.chartSnapshot();
    expect(oneAttacker).not.toBe(empty);

    await dps.selectUnit(dps.addUnitSearch, UNIT_B);
    await dps.addUnitButton.click();

    await expect(dps.attackerCards).toHaveCount(2);
    await expect.poll(() => dps.chartSnapshot(), { timeout: 15000 }).not.toBe(oneAttacker);
  });

  test("should remove an attacker again", async ({ page }) => {
    const dps = new DpsPage(page);
    await dps.navigate(true);

    await dps.selectUnit(dps.addUnitSearch, UNIT_A);
    await dps.addUnitButton.click();
    await expect(dps.attackerCards).toHaveCount(1);

    await dps.attackerCards.first().locator("button.mantine-CloseButton-root").first().click();

    await expect(dps.attackerCards).toHaveCount(0);
  });

  test("should recompute against a selected target unit", async ({ page }) => {
    const dps = new DpsPage(page);
    await dps.navigate(true);

    await dps.selectUnit(dps.addUnitSearch, UNIT_A);
    await dps.addUnitButton.click();
    await expect(dps.attackerCards).toHaveCount(1);
    const withoutTarget = await dps.chartSnapshot();

    await dps.selectUnit(dps.targetSearch, UNIT_B);

    await expect.poll(() => dps.chartSnapshot(), { timeout: 15000 }).not.toBe(withoutTarget);
  });

  test("should switch back to the VS mode", async ({ page }) => {
    const dps = new DpsPage(page);
    await dps.navigate(true);

    await dps.modeControl.getByText("VS Mode").click();

    await page.waitForURL("**/explorer/dps");
    await expect(dps.unitSearch(1)).toBeVisible();
  });
});
