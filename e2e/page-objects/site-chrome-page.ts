import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * Page Object for the site chrome - the header and the footer, which are rendered on every page.
 *
 * The header has two completely separate trees: `DesktopView` and `MobileView`, hidden from one
 * another with CSS (`hiddenMobile` / `hiddenDesktop`). Both of them contain a search box, a colour
 * scheme toggle and a language switcher, so every locator below has to be scoped to the visible one
 * - that is what `:visible` is doing in here.
 */
export class SiteChromePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // -------------------------------------------------------------------- header

  get logoLink(): Locator {
    return this.header.locator('a[href="/"]').first();
  }

  /**
   * A top level hover-card nav entry of the header, eg. `Statistics`. Both the desktop and the
   * mobile tree render that label, so only the visible one is of interest.
   */
  navMenu(label: string): Locator {
    return this.header.getByText(label, { exact: true }).filter({ visible: true }).first();
  }

  /** A link of one of the (hover card) dropdown menus, matched by href. */
  menuLink(href: string): Locator {
    return this.page.locator(`a[href="${href}"]:visible`).first();
  }

  get onlinePlayers(): Locator {
    return this.header.getByText(/Players in game/i);
  }

  get searchInput(): Locator {
    return this.page.locator('[data-testid="header-search-input"]:visible');
  }

  /**
   * The colour scheme toggle. Rendered twice (desktop header + mobile drawer), and on mobile the
   * drawer lives in a portal outside the `header`, so this picks whichever copy is on screen.
   */
  get colorSchemeToggle(): Locator {
    return this.page.locator('[data-testid="color-scheme-toggle"]:visible');
  }

  /** The language `Select` - the input carries the name of the current language. */
  get languageSwitcher(): Locator {
    return this.page.locator('[data-testid="language-switcher"]:visible');
  }

  /** Colour scheme Mantine currently applies, read off the root element. */
  async colorScheme(): Promise<string | null> {
    return this.page.evaluate(() =>
      document.documentElement.getAttribute("data-mantine-color-scheme"),
    );
  }

  /** What is persisted in local storage under the app's `mantine-color-scheme` key. */
  async storedColorScheme(): Promise<string | null> {
    return this.page.evaluate(() => window.localStorage.getItem("mantine-color-scheme"));
  }

  // ------------------------------------------------------ dev site notification

  /**
   * The "you are using the dev version" dialog. `config.isDevEnv()` is true for every host except
   * `coh3stats.com`, so it is always up in the e2e runs - and being pinned to the bottom left it
   * covers the bottom of the mobile navigation drawer.
   */
  get devSiteNotification(): Locator {
    return this.getByTestId("dev-site-notification");
  }

  /** Close the dev notification so it stops intercepting clicks. */
  async dismissDevSiteNotification(): Promise<void> {
    if (await this.devSiteNotification.isVisible()) {
      await this.devSiteNotification.getByRole("button").first().click();
      await this.devSiteNotification.waitFor({ state: "hidden" });
    }
  }

  // -------------------------------------------------------------- mobile menu

  get burger(): Locator {
    return this.page.getByRole("button", { name: "Toggle menu" });
  }

  /** The mobile navigation drawer. */
  get drawer(): Locator {
    return this.page.getByRole("dialog");
  }

  /** One of the collapsible sections of the mobile drawer, eg. `Statistics`. */
  drawerAccordion(label: string): Locator {
    return this.drawer.locator("button.mantine-Accordion-control").filter({ hasText: label });
  }

  async openMobileMenu(): Promise<void> {
    await this.burger.click();
    await this.drawer.waitFor({ state: "visible" });
  }

  // -------------------------------------------------------------------- footer

  /** External link of the footer, matched by (part of) its href. */
  footerLink(hrefFragment: string): Locator {
    return this.footer.locator(`a[href*="${hrefFragment}"]`).first();
  }
}
