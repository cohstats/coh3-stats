import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import WikiArticlePage, { WikiArticlePageProps } from "../../../screens/wiki/wiki-article-page";
import {
  extractHeadings,
  getReadingMinutes,
  getWikiArticle,
  getWikiArticleImage,
  getWikiArticles,
  getWikiNavigation,
  getWikiNeighbours,
  getWikiSeriesInfo,
} from "../../../src/wiki/get-wiki";
import { getWikiCategory } from "../../../src/wiki/wiki-categories";

// The content lives in the code, every page is built at build time.
export const getStaticPaths: GetStaticPaths = async ({ locales = ["en"] }) => ({
  paths: getWikiArticles().flatMap((article) =>
    locales.map((locale) => ({
      params: { category: article.category, slug: article.slug },
      locale,
    })),
  ),
  fallback: false,
});

export const getStaticProps: GetStaticProps<WikiArticlePageProps> = async ({
  params,
  locale = "en",
}) => {
  const article = getWikiArticle(String(params?.category ?? ""), String(params?.slug ?? ""));
  const category = article && getWikiCategory(article.category);
  if (!article || !category) {
    return { notFound: true };
  }
  const { previous, next } = getWikiNeighbours(article);

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "wiki"])),
      navigation: getWikiNavigation(),
      article,
      headings: extractHeadings(article.contents),
      readingMinutes: getReadingMinutes(article.contents),
      image: getWikiArticleImage(article),
      categoryTitle: category.title,
      groupTitle: category.groups?.find((group) => group.id === article.group)?.title ?? null,
      series: getWikiSeriesInfo(article),
      previous,
      next,
    },
  };
};

export default WikiArticlePage;
