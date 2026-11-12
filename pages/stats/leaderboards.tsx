import { useRouter } from "next/router";
import { Container, Space, Title, Text } from "@mantine/core";

import React, { useEffect } from "react";
import ErrorCard from "../../components/error-card";
import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
import { getLeaderBoardStatsRoute } from "../../src/routes";
import PageJsonLd from "../../components/page-json-ld";

import { GetStaticProps } from "next";
import { calculateLeaderboardStats, LeaderboardStatsType } from "../../src/leaderboards/stats";
import { generateKeywordsString, getLocalizedUrl } from "../../src/seo-utils";
import LeaderBoardStats from "../../components/leaderboards/leaderboard-stats";
import { AnalyticsStatsLeaderboardsPageView } from "../../src/firebase/analytics";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useTranslation } from "next-i18next/pages";

const Leaderboards = ({
  error,
  leaderBoardStats,
}: {
  error: string;
  leaderBoardStats: LeaderboardStatsType;
}) => {
  const { locale = "en" } = useRouter();
  const { t } = useTranslation(["common", "stats"]);

  const pageTitle = t("stats:leaderboards.meta.title");
  const description = t("stats:leaderboards.meta.description");

  // Get keywords from translation
  let keywords: string[] = [];
  try {
    const translatedKeywords = t("stats:leaderboards.meta.keywords", { returnObjects: true });
    if (Array.isArray(translatedKeywords)) {
      keywords = translatedKeywords as string[];
    }
  } catch (error) {
    keywords = ["coh3 leaderboards", "live ladder", "overall leaderboards"];
  }

  useEffect(() => {
    AnalyticsStatsLeaderboardsPageView();
  }, []);

  return (
    <>
      <Head>
        {generateNextSeo({
          title: pageTitle,
          description,
          canonical: getLocalizedUrl("/stats/leaderboards", locale),
          openGraph: {
            title: pageTitle,
            description,
            url: getLocalizedUrl("/stats/leaderboards", locale),
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
        path={getLeaderBoardStatsRoute()}
        name={pageTitle}
        description={description}
        breadcrumbName={t("common:mainMenu.statsMenu.leaderboards")}
      />
      <Container size={"md"} p={0}>
        {error ? (
          <ErrorCard title={"Error getting the leaderboards"} body={JSON.stringify(error)} />
        ) : (
          <>
            <div style={{ textAlign: "center" }}>
              <Title order={1}>Global Leaderboards Stats</Title>
            </div>
            <Text style={{ textAlign: "center" }}>
              Realtime statistics of PC only leaderboards
            </Text>
            <Space h={"xl"} />
            <LeaderBoardStats leaderBoardStats={leaderBoardStats} />
          </>
        )}
      </Container>
    </>
  );
};

// Every regeneration makes 32 Relic API calls (4 factions x 4 modes x 2 pages),
// so regenerate at most once per hour per locale
const REVALIDATE_OK = 3600;
// Retry sooner when the Relic API failed, so an error page is not cached for an hour
const REVALIDATE_ON_FAILURE = 60;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  let error = null;
  let leaderBoardStats = null;

  console.log(`ISR - /stats/leaderboards`);

  try {
    leaderBoardStats = await calculateLeaderboardStats();
  } catch (e: any) {
    console.error(`Error calculating all the leaderboard stats`);
    console.error(e);
    error = e.message;
  }

  return {
    props: {
      error,
      leaderBoardStats,
      ...(await serverSideTranslations(locale, ["common"])),
    },
    revalidate: error ? REVALIDATE_ON_FAILURE : REVALIDATE_OK,
  };
};

export default Leaderboards;
