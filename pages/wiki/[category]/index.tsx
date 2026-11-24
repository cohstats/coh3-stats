import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import WikiCategoryPage, { WikiCategoryPageProps } from "../../../screens/wiki/wiki-category";
import { getWikiNavigation } from "../../../src/wiki/get-wiki";

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
    },
  };
};

export default WikiCategoryPage;
