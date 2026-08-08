import { Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Page Objects for the three map explorer routes:
 *  - `/explorer/maps`       - the card view (`MapsExplorerPage`)
 *  - `/explorer/maps-table` - the table view (`MapsTablePage`)
 *  - `/explorer/maps/<id>`  - the detail page (`MapDetailPage`)
 *
 * All three are statically generated, so the filters only start working once the page has hydrated
 * and `router.isReady` has flipped - `waitForFilters()` waits for exactly that.
 *
 * The filters are debounced by 200ms and then written back into the url with a shallow
 * `router.replace`, which is what `expectQuery()` waits for.
 */

/** Both list views share the search / mode / lobby filters and the url sync around them. */
abstract class MapsListPageBase extends BasePage {
  /** Prefix of the `data-testid`s of this view - `maps` for the cards, `maps-table` for the table. */
  protected abstract get testIdPrefix(): string;

  get searchInput(): Locator {
    return this.getByTestId(`${this.testIdPrefix}-search-input`);
  }

  get lobbySwitch(): Locator {
    return this.getByTestId(`${this.testIdPrefix}-lobby-switch`);
  }

  /** One of the mode chips - `1v1`, `2v2`, `3v3`, `4v4`, `fs`. Matched by its rendered label. */
  modeChip(label: string): Locator {
    return this.page.locator(".mantine-Chip-root").filter({ hasText: label }).first();
  }

  /** The `N maps` line under the filters. */
  get mapCount(): Locator {
    return this.page.locator("text=/^\\d+ maps?$/").first();
  }

  /** Number in the `N maps` line. */
  async getMapCount(): Promise<number> {
    const text = (await this.mapCount.textContent()) ?? "";
    return Number.parseInt(text, 10);
  }

  /**
   * The page heading. The site header renders the `COH3 Stats` logo as an `h1` too, and it comes
   * first in the DOM - the page's own heading is always the last one.
   */
  get title(): Locator {
    return this.page.locator("h1").last();
  }

  get viewSwitchCards(): Locator {
    return this.getByTestId("maps-view-cards");
  }

  get viewSwitchTable(): Locator {
    return this.getByTestId("maps-view-table");
  }

  /**
   * Wait until the page has hydrated and the filters are wired up. The search input is rendered
   * server side, so its presence is not enough - the `?search=` round trip only starts working
   * once `router.isReady` is true, which is also when the filter state is read out of the url.
   */
  async waitForFilters(): Promise<void> {
    await expect(this.searchInput).toBeVisible();
    await expect(this.mapCount).toBeVisible();
  }

  /** Type into the search box and wait for the 200ms debounce to reach the url. */
  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.expectQuery("search", term);
  }

  /** Wait for a query param to reach (or disappear from) the url. */
  async expectQuery(param: string, value: string | null): Promise<void> {
    await expect
      .poll(() => new URL(this.page.url()).searchParams.get(param), { timeout: 10000 })
      .toBe(value);
  }
}

/** `/explorer/maps` - the card view. */
export class MapsExplorerPage extends MapsListPageBase {
  protected get testIdPrefix(): string {
    return "maps";
  }

  async navigate(query = ""): Promise<void> {
    await this.goto(`/explorer/maps${query}`);
  }

  get mapCards(): Locator {
    return this.page.locator('[data-testid^="map-card-"]');
  }

  mapCard(mapId: string): Locator {
    return this.getByTestId(`map-card-${mapId}`);
  }

  /** The `1 vs 1 Maps (12)` style section headings of the grouped (non-searching) view. */
  get sectionHeadings(): Locator {
    return this.page.locator("h2");
  }

  get noMapsMessage(): Locator {
    return this.page.locator("text=No maps match the selected filters.");
  }
}

/** `/explorer/maps-table` - the table view. */
export class MapsTablePage extends MapsListPageBase {
  protected get testIdPrefix(): string {
    return "maps-table";
  }

  async navigate(query = ""): Promise<void> {
    await this.goto(`/explorer/maps-table${query}`);
  }

  get table(): Locator {
    return this.getByTestId("maps-table");
  }

  get rows(): Locator {
    return this.table.locator("tbody tr");
  }

  /** The `Details` button of a row - also the most reliable way to find a specific map's row. */
  detailsButton(mapId: string): Locator {
    return this.getByTestId(`map-details-${mapId}`);
  }

  /** A sortable column header, matched by its visible title (the resource ones only have icons). */
  columnHeader(title: string): Locator {
    return this.table.locator("th").filter({ hasText: title }).first();
  }

  get incomeSwitch(): Locator {
    return this.getByTestId("maps-table-income-switch");
  }

  /** The map names of the currently rendered rows, in display order. */
  async rowNames(): Promise<string[]> {
    return this.table.locator("tbody tr td:first-child a").allInnerTexts();
  }
}

/** `/explorer/maps/<mapId>` - the detail page. */
export class MapDetailPage extends BasePage {
  async navigate(mapId: string): Promise<void> {
    await this.goto(`/explorer/maps/${mapId}`);
  }

  /** See `MapsListPageBase.title` - the header logo is an `h1` as well. */
  get title(): Locator {
    return this.page.locator("h1").last();
  }

  minimap(mapId: string): Locator {
    return this.getByTestId(`map-minimap-${mapId}`);
  }

  sectors(mapId: string): Locator {
    return this.getByTestId(`map-sectors-${mapId}`);
  }

  get sectorsToggle(): Locator {
    return this.getByTestId("map-sectors-toggle");
  }

  /** One of the info cards on the right, matched by its heading. */
  infoCard(title: string): Locator {
    return this.page.locator(".mantine-Card-root").filter({ hasText: title }).first();
  }

  /**
   * The `All maps` link above the title. Matched by its label - the header nav has a (hidden until
   * opened) link to the same route.
   */
  get backToMapsLink(): Locator {
    return this.page.locator('a[href="/explorer/maps"]').filter({ hasText: "All maps" });
  }

  /**
   * The `<mode> map statistics` button - only rendered for official team maps. The `?` in the
   * selector keeps the header nav's bare `/stats/maps` link out of it.
   */
  get mapStatsButton(): Locator {
    return this.page.locator('a[href^="/stats/maps?"]').first();
  }
}
