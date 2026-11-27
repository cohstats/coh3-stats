import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import WikiCategoryPage, { WikiCategoryPageProps } from "../../../screens/wiki/wiki-category";
import { getWikiNavigation } from "../../../src/wiki/get-wiki";
import { WIKI_TIPS_CATEGORY } from "../../../src/wiki/tips/wiki-tips";
import { getWikiTipCounts } from "../../../src/wiki/tips/get-wiki-tips";

// The content lives in the code, every page is built at build time.
export const getStaticPaths: GetStaticPaths = async ({ locales = ["en"] }) => ({
  paths: getWikiNavigation().flatMap((category) =>
    locales.map((locale) => ({ params: { category: category.slug }, locale })),
  ),
  fallback: false,
});

export const getStaticProps: GetStaticProps<WikiCategoryPageProps> = async ({
  params,
  locale = "en",
}) => {
  const navigation = getWikiNavigation();
  const categorySlug = String(params?.category ?? "");
  if (!navigation.some((category) => category.slug === categorySlug)) {
    return { notFound: true };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "wiki"])),
      navigation,
      categorySlug,
      // The tip pages show how many tips they list instead of the reading time.
      tipCounts: categorySlug === WIKI_TIPS_CATEGORY ? await getWikiTipCounts(locale) : null,
    },
  };
};

export default WikiCategoryPage;
