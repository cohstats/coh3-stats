import { useRouter } from "next/router";
import { useTranslation } from "next-i18next/pages";
import { BreadcrumbJsonLd, JsonLdScript } from "next-seo";
import { getExplorerRoute } from "../src/routes";
import { getBreadcrumbItems, getWebPageJsonLd, StructuredDataLink } from "../src/structured-data";

interface ExplorerJsonLdProps {
  /** Site relative path of the page, the same as its canonical url, e.g. `/explorer/maps`. */
  path: string;
  /** SEO title of the page (without the " | COH3 Stats" suffix). */
  name: string;
  /** SEO description of the page. */
  description?: string;
  /** Short name of the page in the breadcrumb trail, `name` by default. */
  breadcrumbName?: string;
  /** Pages between the Explorer and this page in the breadcrumb trail, e.g. the faction of a unit. */
  trail?: StructuredDataLink[];
  /** Absolute url of the main image of the page. */
  image?: string;
  /** Links the page lists, e.g. the units of a faction - see `getWebPageJsonLd`. */
  items?: StructuredDataLink[];
}

/**
 * Structured data (JSON-LD) of an Explorer page: the breadcrumb trail Home > Explorer > ... > page
 * and the WebPage about the game. Render it in the page body, next/head can't render the next-seo
 * JSON-LD components.
 */
const ExplorerJsonLd = ({
  path,
  name,
  description,
  breadcrumbName,
  trail = [],
  image,
  items,
}: ExplorerJsonLdProps) => {
  const { t } = useTranslation("common");
  const { locale = "en" } = useRouter();

  const explorerName = t("mainMenu.explorer");
  const breadcrumbItems =
    path === getExplorerRoute()
      ? getBreadcrumbItems([], explorerName)
      : getBreadcrumbItems(
          [{ name: explorerName, path: getExplorerRoute() }, ...trail],
          breadcrumbName ?? name,
        );

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <JsonLdScript
        data={getWebPageJsonLd({ path, name, description, locale, image, items })}
        scriptKey="webpage-jsonld"
      />
    </>
  );
};

export default ExplorerJsonLd;
