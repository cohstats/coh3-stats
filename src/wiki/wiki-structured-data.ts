import config from "../../config";
import { COH3_STATS, COMPANY_OF_HEROES_3 } from "../structured-data";
import { getWikiRoute } from "../routes";
import { WikiArticle } from "./wiki-types";

/** schema.org Article and BreadcrumbList for a wiki article page. */
export const getWikiArticleJsonLd = ({
  article,
  url,
  image,
  categoryTitle,
  wikiTitle,
}: {
  article: WikiArticle;
  /** Absolute canonical URL of the article. */
  url: string;
  /** Absolute image URL. */
  image: string | null;
  categoryTitle: string;
  wikiTitle: string;
}) => {
  const published = new Date(`${article.date}T00:00:00Z`).toISOString();
  const modified = new Date(`${article.updated ?? article.date}T00:00:00Z`).toISOString();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: article.title,
        description: article.summary,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        datePublished: published,
        dateModified: modified,
        inLanguage: "en",
        ...(image ? { image: [image] } : {}),
        articleSection: categoryTitle,
        keywords: ["Company of Heroes 3", "COH3", ...article.tags].join(", "),
        author: {
          "@type": "Person",
          name: article.author,
          ...(article.authorUrl ? { url: article.authorUrl } : {}),
        },
        publisher: COH3_STATS,
        about: COMPANY_OF_HEROES_3,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "COH3 Stats", item: config.SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: wikiTitle,
            item: `${config.SITE_URL}${getWikiRoute()}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: categoryTitle,
            item: `${config.SITE_URL}${getWikiRoute(article.category)}`,
          },
          { "@type": "ListItem", position: 4, name: article.title, item: url },
        ],
      },
    ],
  };
};
