/**
 * schema.org structured data (JSON-LD) shared by the pages, see
 * https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 *
 * The objects are rendered with the next-seo JSON-LD components (`BreadcrumbJsonLd`, `JsonLdScript`)
 * in the page body - next/head can't render those components, it only takes plain tags.
 * Everything marked up here has to be visible on the page as well, otherwise Google ignores it.
 */
import config from "../config";
import type { raceType } from "./coh3/coh3-types";
import type { SbpsType } from "./unitStats";
import { getExplorerUnitRoute } from "./routes";

// The game every page is about, so search engines connect the pages to it.
const COMPANY_OF_HEROES_3 = {
  "@type": "VideoGame",
  name: "Company of Heroes 3",
  alternateName: "COH3",
  url: "https://www.companyofheroes.com/",
  sameAs: ["https://store.steampowered.com/app/1677280/"],
  genre: "Real-time strategy",
  gamePlatform: ["PC", "PlayStation 5", "Xbox Series X|S"],
  author: { "@type": "Organization", name: "Relic Entertainment" },
  publisher: { "@type": "Organization", name: "SEGA" },
};

const COH3_STATS = {
  "@type": "Organization",
  name: "COH3 Stats",
  url: config.SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${config.SITE_URL}/logo/android-icon-192x192.png`,
  },
};

const COH3_STATS_WEBSITE = {
  "@type": "WebSite",
  "@id": `${config.SITE_URL}/#website`,
  name: "COH3 Stats",
  url: config.SITE_URL,
};

/** Types of a WebPage we use, a page with a list is a CollectionPage on its own. */
type WebPageType = "WebPage" | "CollectionPage" | "AboutPage" | "ProfilePage";

/** A page we link to from the structured data, `path` is site relative, e.g. `/explorer/maps`. */
type StructuredDataLink = {
  name: string;
  path: string;
};

const toAbsoluteUrl = (path: string) => `${config.SITE_URL}${path}`;

/**
 * Breadcrumb trail for the `BreadcrumbJsonLd` component: the home page, the given trail and
 * the current page last. The current page has no url, Google takes the url of the page for it.
 * @param trail Pages between the home page and the current page, e.g. Explorer > US Forces
 * @param name Name of the current page in the trail
 */
const getBreadcrumbItems = (trail: StructuredDataLink[], name: string) => [
  { name: "COH3 Stats", item: config.SITE_URL },
  ...trail.map((link) => ({ name: link.name, item: toAbsoluteUrl(link.path) })),
  { name },
];

/**
 * schema.org WebPage of a page about the game, for the `JsonLdScript` component.
 * The `name`, `description` and `path` should be the same as the page's SEO title, description
 * and canonical url.
 * @param items Links listed on the page, e.g. the units of a faction. Turns the page into
 * a CollectionPage with the links as its main entity.
 * @param type A more specific WebPage type, e.g. `AboutPage` or `ProfilePage`.
 * @param mainEntity What the page is about, e.g. the Person of a profile page - see `getPlayerJsonLd`.
 */
const getWebPageJsonLd = ({
  path,
  name,
  description,
  locale,
  image,
  items,
  type,
  mainEntity,
}: {
  path: string;
  name: string;
  description?: string;
  locale: string;
  /** Absolute url of the main image of the page. */
  image?: string;
  items?: StructuredDataLink[];
  type?: WebPageType;
  mainEntity?: Record<string, unknown>;
}) => {
  const url = toAbsoluteUrl(path);
  const hasItems = !!items && items.length > 0;

  return {
    "@context": "https://schema.org",
    "@type": type ?? (hasItems ? "CollectionPage" : "WebPage"),
    "@id": url,
    url,
    name,
    ...(description ? { description } : {}),
    inLanguage: locale,
    isPartOf: COH3_STATS_WEBSITE,
    about: COMPANY_OF_HEROES_3,
    publisher: COH3_STATS,
    ...(image ? { primaryImageOfPage: { "@type": "ImageObject", url: image } } : {}),
    ...(hasItems
      ? {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: items.length,
            itemListElement: items.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              url: toAbsoluteUrl(item.path),
            })),
          },
        }
      : {}),
    ...(mainEntity ? { mainEntity } : {}),
  };
};

/**
 * The site and its publisher, for the home page. Google takes the site name shown in the search
 * results from the WebSite, and the logo from the Organization.
 */
const getSiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      ...COH3_STATS_WEBSITE,
      alternateName: ["COH3Stats", "coh3stats.com"],
      about: COMPANY_OF_HEROES_3,
      publisher: COH3_STATS,
    },
    { ...COH3_STATS, sameAs: [config.DISCORD_INVITE_LINK, config.GITHUB_LINK] },
  ],
});

/**
 * The Person of a player profile page, the main entity of its ProfilePage.
 * @param steamProfileUrl Steam profile of the player, only when the page links to it
 */
const getPlayerJsonLd = ({
  name,
  relicId,
  image,
  steamProfileUrl,
}: {
  name: string;
  relicId: number | string;
  image?: string | null;
  steamProfileUrl?: string;
}) => ({
  "@type": "Person",
  name,
  identifier: `${relicId}`,
  ...(image ? { image } : {}),
  ...(steamProfileUrl ? { sameAs: [steamProfileUrl] } : {}),
});

// Unit types in the order the unit list pages show them, other types are not listed.
const LISTED_UNIT_TYPES = ["infantry", "team_weapons", "vehicles", "emplacements"];

/** Links to the units of a faction unit list page, in the order the page lists them. */
const getUnitListLinks = (units: SbpsType[], race: raceType): StructuredDataLink[] =>
  LISTED_UNIT_TYPES.flatMap((unitType) =>
    units
      .filter((unit) => unit.unitType === unitType && unit.ui.screenName)
      .map((unit) => ({ name: unit.ui.screenName, path: getExplorerUnitRoute(race, unit.id) })),
  );

export type { StructuredDataLink, WebPageType };
export {
  COMPANY_OF_HEROES_3,
  COH3_STATS,
  getBreadcrumbItems,
  getWebPageJsonLd,
  getSiteJsonLd,
  getPlayerJsonLd,
  getUnitListLinks,
};
