import { Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Page Object for the DPS benchmark tool - `/explorer/dps` (VS mode) and `/explorer/dps-compare`
 * (compare mode).
 *
 * The chart is a chart.js `<canvas>`, so there is no DOM to assert the series on - `chartSnapshot()`
 * reads the rendered pixels instead, which is enough to tell an empty chart from one with lines on
 * it and to see that it redrew after a change.
 */
export class DpsPage extends BasePage {
  async navigate(compare = false): Promise<void> {
    await this.goto(compare ? "/explorer/dps-compare" : "/explorer/dps");
    // The unit lists are built from the whole sbps/ebps/weapon data, which takes a moment.
    await expect(this.chart).toBeVisible({ timeout: 60000 });
  }

  get title(): Locator {
    return this.page.locator("h2", { hasText: "DPS Benchmark Tool" });
  }

  get modeControl(): Locator {
    return this.getByTestId("dps-mode-control");
  }

  get chart(): Locator {
    return this.getByTestId("dps-chart");
  }

  get chartCanvas(): Locator {
    return this.chart.locator("canvas");
  }

  /** Data url of the currently painted chart - used to detect that the chart redrew. */
  async chartSnapshot(): Promise<string> {
    return this.chartCanvas.evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL());
  }

  // ------------------------------------------------------------------ VS mode

  /** One of the two unit selects of the VS page (`1` = left / blue, `2` = right / red). */
  unitSearch(position: 1 | 2): Locator {
    return this.getByTestId(`dps-unit-search-${position}`);
  }

  /** The customization card of a selected unit (`0` = left, `1` = right). */
  unitCard(index: 0 | 1): Locator {
    return this.getByTestId(`dps-unit-card-${index}`);
  }

  /** The settings hover card holding the advanced switches. */
  get settingsButton(): Locator {
    return this.page.getByRole("button", { name: "Settings" }).first();
  }

  // ------------------------------------------------------------- compare mode

  get addUnitSearch(): Locator {
    return this.getByTestId("dps-compare-add-search");
  }

  get addUnitButton(): Locator {
    return this.getByTestId("dps-compare-add-button");
  }

  get targetSearch(): Locator {
    return this.getByTestId("dps-compare-target-search");
  }

  get attackerCards(): Locator {
    return this.page.locator('[data-testid^="dps-attacker-"]');
  }

  // ----------------------------------------------------------------- helpers

  /** Weapon cards of a selected unit - one per weapon in the squad loadout. */
  weaponCards(scope: Locator): Locator {
    return scope.locator('[data-testid="dps-weapon-card"]');
  }

  /**
   * Type into one of the unit selects and pick the first suggestion. The select filters on the unit
   * id and on the screen name.
   */
  async selectUnit(search: Locator, query: string): Promise<string> {
    await search.click();
    await search.fill(query);

    const option = this.page.locator('[role="option"]:visible').first();
    await expect(option).toBeVisible();
    const label = await option.innerText();
    await option.click();

    return label;
  }
}
