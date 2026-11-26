import { Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Page Object for the stats pages driven by `StatsContainerSelector` - `/stats/games` (game stats)
 * and `/stats/maps` (map stats).
 *
 * Everything on those pages is filtered by the same four controls (patch, date range, ELO filter,
 * game mode) which sync two ways with the url. The data itself comes from the analysis endpoint of
 * the API, so the tests either wait for it or intercept it.
 */
export class StatsPage extends BasePage {
  /** Which of the two pages this instance drives - decides the content test id. */
  constructor(
    page: import("@playwright/test").Page,
    private readonly kind: "game" | "map" = "game",
  ) {
    super(page);
  }

  /** The analysis response of the last `navigate()`, see `hasStatsData`. */
  private statsResponse: Promise<unknown> = Promise.resolve();

  async navigate(query = ""): Promise<void> {
    // Armed before the navigation - the request can be done before the test gets to wait for it.
    this.statsResponse = this.page
      .waitForResponse((response) => response.url().includes("getAnalysisStatsHttp"), {
        timeout: 60000,
      })
      .catch(() => null);
    await this.goto(`/stats/${this.kind === "game" ? "games" : "maps"}${query}`);
  }

  // ------------------------------------------------------------------- filters

  get patchSelect(): Locator {
    return this.getByTestId("stats-patch-select");
  }

  get dateRange(): Locator {
    return this.getByTestId("stats-date-range");
  }

  get eloSelect(): Locator {
    return this.getByTestId("stats-elo-select");
  }

  get modeControl(): Locator {
    return this.getByTestId("stats-mode-control");
  }

  /** One of the game type buttons of the mode `SegmentedControl`, eg. `2 vs 2`. */
  modeOption(label: string): Locator {
    return this.modeControl.getByText(label, { exact: true });
  }

  /** The `Advanced ELO filtering` spoiler control - the multi select is hidden behind it. */
  get advancedFilterToggle(): Locator {
    return this.page.locator("button", { hasText: "Advanced ELO filtering" }).first();
  }

  get eloMultiSelect(): Locator {
    return this.getByTestId("stats-elo-multiselect");
  }

  get eloGenerateButton(): Locator {
    return this.getByTestId("stats-elo-generate");
  }

  /**
   * Options of the currently open Mantine dropdown. Scoped to the visible ones - the header has
   * comboboxes of its own (the language switcher) whose options are in the DOM but hidden.
   */
  get openOptions(): Locator {
    return this.page.locator('[role="option"]:visible');
  }

  /** Pick an option out of an open Mantine dropdown by its label. */
  async pickOption(label: string): Promise<void> {
    await this.openOptions.filter({ hasText: label }).first().click();
  }

  // ------------------------------------------------------------------- content

  get content(): Locator {
    return this.getByTestId(`${this.kind === "game" ? "game" : "maps"}-stats-content`);
  }

  get gamesAnalyzed(): Locator {
    return this.getByTestId("stats-games-analyzed");
  }

  get loader(): Locator {
    return this.getByTestId("stats-loading");
  }

  get noData(): Locator {
    return this.getByTestId("stats-no-data");
  }

  get errorCard(): Locator {
    return this.getByTestId("error-card");
  }

  /** The `Select Map` dropdown of the map stats page. */
  get mapSelect(): Locator {
    return this.getByTestId("map-stats-map-select");
  }

  /**
   * Wait for the analysis request to have resolved - either into the charts, into the "no data"
   * state or into an error card. Every filter change re-runs it.
   */
  async waitForStats(): Promise<void> {
    await expect(this.gamesAnalyzed.or(this.noData).or(this.errorCard).first()).toBeVisible({
      timeout: 60000,
    });
  }

  /**
   * Wait for the analysis request of the last `navigate()` to settle and tell whether the page has
   * data to show. The "no data" state is also rendered for a moment before the request starts, so
   * `waitForStats` alone cannot tell an empty period from a page which has not asked yet. A freshly
   * added patch has no games for a while - the tests needing real data skip on `false`.
   */
  async hasStatsData(): Promise<boolean> {
    await this.statsResponse;
    await this.waitForStats();
    return this.gamesAnalyzed.isVisible();
  }

  /** Wait for a query param to reach the url. */
  async expectQuery(param: string, value: string | RegExp | null): Promise<void> {
    const read = () => new URL(this.page.url()).searchParams.get(param);

    if (value instanceof RegExp) {
      await expect.poll(read, { timeout: 15000 }).toMatch(value);
    } else {
      await expect.poll(read, { timeout: 15000 }).toBe(value);
    }
  }
}
