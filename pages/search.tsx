import { NextPage } from "next";
import Head from "next/head";
import { generateKeywordsString } from "../src/head-utils";
import { SearchScreen } from "../screens/search";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

/**
 *
 * Example URL http://localhost:3000/search?q=Thomas
 *
 *
 * @constructor
 */

const Search: NextPage = () => {
  const { t } = useTranslation(["search"]);
  const description = t("search:meta.description");
  const metaKeywords = generateKeywordsString([
    `search players`,
    `search data`,
    `coh3 search`,
    "units search",
  ]);

  return (
    <>
      <Head>
        <title>{t("search:meta.title")}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={metaKeywords} />
        <meta name="robots" content="nofollow" />
      </Head>
      <SearchScreen />
    </>
  );
};

export const getStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "search"])),
    },
  };
};

export default Search;
