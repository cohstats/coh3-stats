import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import WikiHome, { WikiHomeProps } from "../../screens/wiki/wiki-home";
import { getWikiArticles, getWikiNavigation, toWikiArticleLink } from "../../src/wiki/get-wiki";

export const getStaticProps: GetStaticProps<WikiHomeProps> = async ({ locale = "en" }) => {
  // The first part of every series and the standalone articles.
  const featured = getWikiArticles()
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
