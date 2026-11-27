import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import WikiHome, { WikiHomeProps } from "../../screens/wiki/wiki-home";
import { getWikiArticles, getWikiNavigation, toWikiArticleLink } from "../../src/wiki/get-wiki";
import { isWikiTipsArticle } from "../../src/wiki/tips/wiki-tips";

export const getStaticProps: GetStaticProps<WikiHomeProps> = async ({ locale = "en" }) => {
  // The first part of every series and the standalone articles. The tip pages are reached
  // through their category card, they would crowd out the articles.
  const featured = getWikiArticles()
    .filter((article) => !isWikiTipsArticle(article))
    .filter((article) => !article.series || article.series.part === 1)
    .map(toWikiArticleLink);

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "wiki"])),
      navigation: getWikiNavigation(),
      featured,
    },
  };
};

export default WikiHome;
