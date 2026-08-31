import { Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Page Object for the Search page - `/search`
 *
 * Players come from the API, units and maps are filtered locally from
 * `screens/search/units-search-data.json` / `maps-search-data.json`. Typing is debounced by
 * 700ms, which `search()` accounts for.
 */
export class SearchPage extends BasePage {
  async navigate(query?: string): Promise<void> {
    await this.goto(query === undefined ? "/search" : `/search?q=${encodeURIComponent(query)}`);
  }

  get searchInput(): Locator {
    return this.getByTestId("search-input");
  }

  /** The search box in the site header (present on every page). */
  get headerSearchInput(): Locator {
    return this.getByTestId("header-search-input");
  }

  /**
   * Type a query and wait for the debounce + the player request to settle.
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    // Debounce is 700ms; the results container appears once the request resolves.
    await expect(this.playersResults.or(this.errorCard).first()).toBeVisible({ timeout: 30000 });
  }

  // ------------------------------------------------------------------ sections

  get playersResults(): Locator {
    return this.getByTestId("search-players-results");
  }

  get unitsResults(): Locator {
    return this.getByTestId("search-units-results");
  }

  get mapsResults(): Locator {
    return this.getByTestId("search-maps-results");
  }

  get errorCard(): Locator {
    return this.getByTestId("error-card");
  }

  // --------------------------------------------------------------------- cards

  get playerCards(): Locator {
    return this.page.locator('[data-testid^="search-player-card-"]');
  }

  playerCard(profileId: string | number): Locator {
    return this.getByTestId(`search-player-card-${profileId}`);
  }

  /**
   * Read the relic profile id back out of a player card's test id. The player search API returns
   * a capped, activity-ordered list, so the tests pick a card out of the response instead of
   * pinning a profile that can drop out of it.
   */
  async profileIdOfCard(card: Locator): Promise<string> {
    const testId = await card.getAttribute("data-testid");
    const profileId = testId?.replace("search-player-card-", "");

    expect(profileId).toMatch(/^\d+$/);

    return profileId as string;
  }

  get unitCards(): Locator {
    return this.page.locator('[data-testid^="search-unit-card-"]');
  }

  unitCard(unitId: string): Locator {
    return this.getByTestId(`search-unit-card-${unitId}`);
  }

  get mapCards(): Locator {
    return this.page.locator('[data-testid^="search-map-card-"]');
  }

  mapCard(mapId: string): Locator {
    return this.getByTestId(`search-map-card-${mapId}`);
  }

  // ---------------------------------------------------------------- empty state

  get noPlayersFound(): Locator {
    return this.getByTestId("search-no-results-players");
  }

  get noUnitsFound(): Locator {
    return this.getByTestId("search-no-results-units");
  }

  get noMapsFound(): Locator {
    return this.getByTestId("search-no-results-maps");
  }

  /**
   * Section dividers - only rendered once a query of 2+ characters is entered.
   * Scoped to the Mantine divider label so the header nav links ("Units") do not match.
   */
  sectionDivider(label: "Players" | "Units" | "Maps"): Locator {
    return this.page.locator(".mantine-Divider-label").filter({ hasText: label });
  }
}
