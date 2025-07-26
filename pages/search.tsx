import { NextPage } from "next";
import { NextSeo } from "next-seo";
import { SearchScreen } from "../screens/search";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
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
      <NextSeo
        {...seoProps}
        additionalMetaTags={[
          ...(seoProps.additionalMetaTags || []),
          {
            name: "robots",
            content: "nofollow",
          },
        ]}
      />
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
