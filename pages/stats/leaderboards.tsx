import { Container, Space, Title, Text } from "@mantine/core";

import React, { useEffect } from "react";
import ErrorCard from "../../components/error-card";
import { NextSeo } from "next-seo";

import { GetServerSideProps } from "next";
import { calculateLeaderboardStats, LeaderboardStatsType } from "../../src/leaderboards/stats";
import { generateKeywordsString } from "../../src/seo-utils";
import LeaderBoardStats from "../../components/leaderboards/leaderboard-stats";
import { AnalyticsStatsLeaderboardsPageView } from "../../src/firebase/analytics";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

const Leaderboards = ({
  error,
  leaderBoardStats,
}: {
  error: string;
  leaderBoardStats: LeaderboardStatsType;
}) => {
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
      <NextSeo
        title={pageTitle}
        description={description}
        canonical="https://coh3stats.com/stats/leaderboards"
        openGraph={{
          title: pageTitle,
          description: description,
          url: "https://coh3stats.com/stats/leaderboards",
          type: "website",
        }}
        additionalMetaTags={[
          {
            name: "keywords",
            content: generateKeywordsString(keywords),
          },
        ]}
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

export const getServerSideProps: GetServerSideProps = async ({ res, locale = "en" }) => {
  let error = null;
  let leaderBoardStats = null;

  console.log(`SSR - /stats/leaderboards`);

  try {
    leaderBoardStats = await calculateLeaderboardStats();

    res.setHeader(
      "Cache-Control",
      "public, max-age=600, s-maxage=3600, stale-while-revalidate=172800",
    );
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
  };
};

export default Leaderboards;
