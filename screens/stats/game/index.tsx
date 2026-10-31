import { NextPage } from "next";
import React from "react";
import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
import { getGameStatsRoute } from "../../../src/routes";
import PageJsonLd from "../../../components/page-json-ld";
import { generateKeywordsString } from "../../../src/seo-utils";
import { useTranslation } from "next-i18next/pages";
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
      <Head>
        {generateNextSeo({
          title: pageTitle,
          description,
          canonical: `${config.SITE_URL}/stats/games`,
          openGraph: {
            title: pageTitle,
            description,
            url: `${config.SITE_URL}/stats/games`,
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
        path={getGameStatsRoute()}
        name={pageTitle}
        description={description}
        breadcrumbName={t("common:mainMenu.statsMenu.games")}
      />
      <>
        <StatsContainerSelector statsType={"gameStats"} />
      </>
    </div>
  );
};

export default GameStats;
