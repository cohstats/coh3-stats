import { NextPage } from "next";
import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
import { SearchScreen } from "../screens/search";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";
import { createPageSEO } from "../src/seo-utils";

/**
 *
 * Example URL http://localhost:3000/search?q=Thomas
 *
 *
 * @constructor
 */

const Search: NextPage = () => {
  const { t } = useTranslation(["search"]);

  // Create SEO props for search page
  const seoProps = createPageSEO(t, "search", "/search");

  return (
    <>
      <Head>
        {generateNextSeo({
          ...seoProps,
          nofollow: true,
        })}
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
