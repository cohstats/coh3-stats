import { NextPage } from "next";
import React from "react";
import { NextSeo } from "next-seo";
import { generateKeywordsString } from "../../../src/seo-utils";
import { useTranslation } from "next-i18next";
import StatsContainerSelector from "../stats-container-selector";
import config from "../../../config";

const MapStats: NextPage = () => {
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
      <NextSeo
        title={pageTitle}
        description={description}
        canonical={`${config.SITE_URL}/stats/maps`}
        openGraph={{
          title: pageTitle,
          description: description,
          url: `${config.SITE_URL}/stats/maps`,
          type: "website",
        }}
        additionalMetaTags={[
          {
            name: "keywords",
            content: generateKeywordsString(keywords),
          },
        ]}
      />
      <>
        <StatsContainerSelector statsType={"mapStats"} />
      </>
    </div>
  );
};

export default MapStats;
