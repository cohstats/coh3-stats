import { getNewsExcerpt } from "../news/news-excerpt";
import { WIKI_ARTICLES } from "./data";
import { getWikiCategory, getWikiSeries, WIKI_CATEGORIES } from "./wiki-categories";
import { WikiArticle, WikiCategory, WikiCategorySlug, WikiHeading } from "./wiki-types";

const WORDS_PER_MINUTE = 200;

/** Small serializable link to an article, for the sidebar, cards and prev/next. */
export type WikiArticleLink = {
  slug: string;
  category: WikiCategorySlug;
  group: string | null;
  title: string;
  summary: string;
  image: string | null;
  readingMinutes: number;
  seriesPart: number | null;
};

export type WikiNavGroup = {
  id: string | null;
  title: string | null;
  articles: WikiArticleLink[];
};

/** The sidebar tree: categories with articles, split into their groups. */
export type WikiNavCategory = {
  slug: WikiCategorySlug;
  title: string;
  color: string;
  icon: WikiCategory["icon"];
  description: string;
  articleCount: number;
  groups: WikiNavGroup[];
};

/** `[h2]Aim time[/h2]` -> `aim-time`, the same for the TOC and the rendered heading. */
export const slugifyHeading = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const stripBBCode = (text: string) => text.replace(/\[[^\]]*\]/g, "").trim();

/** The [h2] and [h3] headings of an article for the "On this page" list. */
export const extractHeadings = (contents: string): WikiHeading[] => {
  const headings: WikiHeading[] = [];
  const regex = /\[h([23])\]([\s\S]*?)\[\/h\1\]/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(contents)) !== null) {
    const label = stripBBCode(match[2]);
    headings.push({ id: slugifyHeading(label), label, level: Number(match[1]) as 2 | 3 });
  }
  return headings;
};

/** Plain text of the article without images, for the reading time and the description. */
export const getWikiPlainText = (contents: string) => getNewsExcerpt(contents, Infinity);

export const getReadingMinutes = (contents: string) => {
  const words = getWikiPlainText(contents).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

/** The card / Open Graph image, the first [img] in the contents if none is set. */
export const getWikiArticleImage = (article: WikiArticle): string | null => {
  if (article.image) return article.image;
  const match = article.contents.match(/\[img[^\]]*\]([\s\S]*?)\[\/img\]/i);
  return match ? match[1].trim() : null;
};

const groupIndex = (article: WikiArticle) => {
  const groups = getWikiCategory(article.category)?.groups ?? [];
  const index = groups.findIndex((group) => group.id === article.group);
  return index === -1 ? groups.length : index;
};

const compareArticles = (a: WikiArticle, b: WikiArticle) =>
  groupIndex(a) - groupIndex(b) || a.order - b.order || a.title.localeCompare(b.title);

export const toWikiArticleLink = (article: WikiArticle): WikiArticleLink => ({
  slug: article.slug,
  category: article.category,
  group: article.group ?? null,
  title: article.title,
  summary: article.summary,
  image: getWikiArticleImage(article),
  readingMinutes: getReadingMinutes(article.contents),
  seriesPart: article.series?.part ?? null,
});

/** All articles, sorted by category, group and order. */
export const getWikiArticles = (): WikiArticle[] => {
  const categoryOrder = WIKI_CATEGORIES.map((category) => category.slug);
  return [...WIKI_ARTICLES].sort(
    (a, b) =>
      categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) ||
      compareArticles(a, b),
  );
};

export const getWikiArticle = (category: string, slug: string): WikiArticle | undefined =>
  WIKI_ARTICLES.find((article) => article.category === category && article.slug === slug);

export const getWikiArticlesByCategory = (category: WikiCategorySlug): WikiArticle[] =>
  getWikiArticles().filter((article) => article.category === category);

/** Categories that have at least one article, with their articles split into groups. */
export const getWikiNavigation = (): WikiNavCategory[] =>
  WIKI_CATEGORIES.map((category) => {
    const articles = getWikiArticlesByCategory(category.slug);
    const groups: WikiNavGroup[] = (category.groups ?? []).map((group) => ({
      id: group.id,
      title: group.title,
      articles: articles.filter((a) => a.group === group.id).map(toWikiArticleLink),
    }));
    const ungrouped = articles.filter(
      (a) => !category.groups?.some((group) => group.id === a.group),
    );
    if (ungrouped.length > 0) {
      groups.push({ id: null, title: null, articles: ungrouped.map(toWikiArticleLink) });
    }

    return {
      slug: category.slug,
      title: category.title,
      color: category.color,
      icon: category.icon,
      description: category.description,
      articleCount: articles.length,
      groups: groups.filter((group) => group.articles.length > 0),
    };
  }).filter((category) => category.articleCount > 0);

export type WikiSeriesInfo = {
  id: string;
  title: string;
  part: number;
  parts: WikiArticleLink[];
};

/** The series the article belongs to, with all its parts in order. */
export const getWikiSeriesInfo = (article: WikiArticle): WikiSeriesInfo | null => {
  if (!article.series) return null;
  const series = getWikiSeries(article.series.id);
  if (!series) return null;
  const parts = WIKI_ARTICLES.filter((a) => a.series?.id === series.id)
    .sort((a, b) => (a.series?.part ?? 0) - (b.series?.part ?? 0))
    .map(toWikiArticleLink);
  return { id: series.id, title: series.title, part: article.series.part, parts };
};

/** Previous and next article, the series order first, the category order otherwise. */
export const getWikiNeighbours = (
  article: WikiArticle,
): { previous: WikiArticleLink | null; next: WikiArticleLink | null } => {
  const series = getWikiSeriesInfo(article);
  const list = series
    ? series.parts
    : getWikiArticlesByCategory(article.category).map(toWikiArticleLink);
  const index = list.findIndex((a) => a.slug === article.slug);
  return {
    previous: index > 0 ? list[index - 1] : null,
    next: index >= 0 && index < list.length - 1 ? list[index + 1] : null,
  };
};
