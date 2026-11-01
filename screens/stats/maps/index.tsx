import { useRouter } from "next/router";
import { NextPage } from "next";
import React from "react";
import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
import { getMapsStatsRoute } from "../../../src/routes";
import PageJsonLd from "../../../components/page-json-ld";
import { generateKeywordsString, getLocalizedUrl } from "../../../src/seo-utils";
import { useTranslation } from "next-i18next/pages";
import StatsContainerSelector from "../stats-container-selector";

const MapStats: NextPage = () => {
  const { locale = "en" } = useRouter();
  const { t } = useTranslation(["common", "stats"]);

  const pageTitle = t("stats:maps.meta.title");
  const description = t("stats:maps.meta.description");

  // Get keywords from translation
  let keywords: string[] = [];
  try {
    const translatedKeywords = t("stats:maps.meta.keywords", { returnObjects: true });
    if (Array.isArray(translatedKeywords)) {
      keywords = translatedKeywords as string[];
    }
  } catch (error) {
    keywords = ["coh3 maps", "map statistics", "map winrates"];
  }

  return (
    <div>
      <Head>
        {generateNextSeo({
          title: pageTitle,
          description,
          canonical: getLocalizedUrl("/stats/maps", locale),
          openGraph: {
            title: pageTitle,
            description,
            url: getLocalizedUrl("/stats/maps", locale),
          },
          additionalMetaTags: [
            {
              name: "keywords",
              content: generateKeywordsString(keywords),
            },
          ],
        })}
      </Head>
      <PageJsonLd
        path={getMapsStatsRoute()}
        name={pageTitle}
        description={description}
        breadcrumbName={t("common:mainMenu.statsMenu.maps")}
      />
      <>
        <StatsContainerSelector statsType={"mapStats"} />
      </>
    </div>
  );
};

export default MapStats;
