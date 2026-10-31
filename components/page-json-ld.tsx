import { useRouter } from "next/router";
import { BreadcrumbJsonLd, JsonLdScript } from "next-seo";
import {
  getBreadcrumbItems,
  getSiteJsonLd,
  getWebPageJsonLd,
  StructuredDataLink,
  WebPageType,
} from "../src/structured-data";

interface PageJsonLdProps {
  /**
   * Site relative path of the page, the same as its canonical url, e.g. `/explorer/maps`.
   * An empty path is the home page.
   */
  path: string;
  /** SEO title of the page (without the " | COH3 Stats" suffix). */
  name: string;
  /** SEO description of the page. */
  description?: string;
  /** Short name of the page in the breadcrumb trail, `name` by default. */
  breadcrumbName?: string;
  /**
   * Pages between the home page and this page in the breadcrumb trail, the way a user gets here,
   * e.g. Explorer > US Forces for a unit.
   */
  trail?: StructuredDataLink[];
  /** Absolute url of the main image of the page. */
  image?: string;
  /** Links the page lists, e.g. the units of a faction - see `getWebPageJsonLd`. */
  items?: StructuredDataLink[];
  /** A more specific WebPage type, e.g. `AboutPage`. */
  type?: WebPageType;
  /** What the page is about, e.g. the Person of a player profile. */
  mainEntity?: Record<string, unknown>;
}

/**
 * Structured data (JSON-LD) of a page: the breadcrumb trail Home > ... > page and the WebPage about
 * the game. The home page has the site and its publisher instead of the trail.
 * Render it in the page body, next/head can't render the next-seo JSON-LD components.
 */
const PageJsonLd = ({
  path,
  name,
  description,
  breadcrumbName,
  trail = [],
  image,
  items,
  type,
  mainEntity,
}: PageJsonLdProps) => {
  const { locale = "en" } = useRouter();
  // The home page canonical is the site url, without the trailing slash
  const isHomePage = path === "" || path === "/";

  return (
    <>
      {/* A trail needs at least two items, the home page has none */}
      {isHomePage ? (
        <JsonLdScript data={getSiteJsonLd()} scriptKey="site-jsonld" />
      ) : (
        <BreadcrumbJsonLd items={getBreadcrumbItems(trail, breadcrumbName ?? name, locale)} />
      )}
      <JsonLdScript
        data={getWebPageJsonLd({
          path,
          name,
          description,
          locale,
          image,
          items,
          type,
          mainEntity,
        })}
        scriptKey="webpage-jsonld"
      />
    </>
  );
};

export default PageJsonLd;
