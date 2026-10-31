import config from "../../config";
import { NewsItem } from "../apis/steam-api";
import { COH3_STATS, COMPANY_OF_HEROES_3 } from "../structured-data";

// Google shows at most 110 characters of the headline.
const MAX_HEADLINE_LENGTH = 110;

const isLocalNews = (item: NewsItem) => item.gid.startsWith("local-");

/**
 * schema.org NewsArticle and BreadcrumbList for a single news article page.
 * Steam posts are written by the Relic community team, site posts by an organisation.
 */
const getNewsArticleJsonLd = ({
  item,
  url,
  description,
  image,
  section,
  newsTitle,
}: {
  item: NewsItem;
  /** Absolute canonical URL of the article page. */
  url: string;
  description: string;
  /** Absolute image URL. */
  image: string | null;
  /** Category name, e.g. "Patch Notes". */
  section?: string;
  /** Name of the news overview in the breadcrumb. */
  newsTitle: string;
}) => {
  const published = new Date((item.date || 0) * 1000).toISOString();
  const headline =
    item.title.length > MAX_HEADLINE_LENGTH
      ? `${item.title.slice(0, MAX_HEADLINE_LENGTH - 1)}…`
      : item.title;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${url}#article`,
        headline,
        name: item.title,
        description,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        datePublished: published,
        dateModified: published,
        inLanguage: "en",
        ...(image ? { image: [image] } : {}),
        ...(section ? { articleSection: section } : {}),
        ...(item.author
          ? {
              author: {
                "@type": isLocalNews(item) ? "Organization" : "Person",
                name: item.author,
              },
            }
          : {}),
        publisher: COH3_STATS,
        about: COMPANY_OF_HEROES_3,
        keywords: ["Company of Heroes 3", "COH3", ...(section ? [section] : [])].join(", "),
        // Steam posts are the official announcements, credit the original.
        ...(!isLocalNews(item) && item.url ? { isBasedOn: item.url } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "COH3 Stats", item: config.SITE_URL },
          { "@type": "ListItem", position: 2, name: newsTitle, item: `${config.SITE_URL}/news` },
          { "@type": "ListItem", position: 3, name: item.title, item: url },
        ],
      },
    ],
  };
};

/** JSON for a `<script type="application/ld+json">`, safe against `</script>` in the content. */
const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export { getNewsArticleJsonLd, serializeJsonLd };
