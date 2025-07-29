import { NextPage } from "next";
import React from "react";
import { NextSeo } from "next-seo";
import { generateKeywordsString } from "../../../src/seo-utils";
import { useTranslation } from "next-i18next";
import StatsContainerSelector from "../stats-container-selector";
import config from "../../../config";

const GameStats: NextPage = () => {
  const { t } = useTranslation(["common", "stats"]);

  const pageTitle = t("stats:games.meta.title");
  const description = t("stats:games.meta.description");

  // Get keywords from translation
  let keywords: string[] = [];
  try {
    const translatedKeywords = t("stats:games.meta.keywords", { returnObjects: true });
    if (Array.isArray(translatedKeywords)) {
      keywords = translatedKeywords as string[];
    }
  } catch (error) {
    keywords = ["coh3 winrate", "factions winrate", "analysis"];
  }

  return (
    <div>
      <NextSeo
        title={pageTitle}
        description={description}
        canonical={`${config.SITE_URL}/stats/games`}
        openGraph={{
          title: pageTitle,
          description: description,
          url: `${config.SITE_URL}/stats/games`,
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
        <StatsContainerSelector statsType={"gameStats"} />
      </>
    </div>
  );
};

export default GameStats;
