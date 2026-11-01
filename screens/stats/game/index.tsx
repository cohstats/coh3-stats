import { useRouter } from "next/router";
import { NextPage } from "next";
import React from "react";
import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
import { getGameStatsRoute } from "../../../src/routes";
import PageJsonLd from "../../../components/page-json-ld";
import { generateKeywordsString, getLocalizedUrl } from "../../../src/seo-utils";
import { useTranslation } from "next-i18next/pages";
import StatsContainerSelector from "../stats-container-selector";

const GameStats: NextPage = () => {
  const { locale = "en" } = useRouter();
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
          canonical: getLocalizedUrl("/stats/games", locale),
          openGraph: {
            title: pageTitle,
            description,
            url: getLocalizedUrl("/stats/games", locale),
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
