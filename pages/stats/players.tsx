import { Container, Title, Text, Group, Center } from "@mantine/core";

import React, { useEffect } from "react";
import ErrorCard from "../../components/error-card";
import { NextSeo } from "next-seo";

import { GetServerSideProps } from "next";
import { generateKeywordsString } from "../../src/seo-utils";

import { doc, getDoc, getFirestore } from "firebase/firestore";
import dynamic from "next/dynamic";
import { IconUser } from "@tabler/icons-react";
import HelperIcon from "../../components/icon/helper";
import dayjs from "dayjs";
import { AnalyticsStatsPlayerStatsPageView } from "../../src/firebase/analytics";
import config from "../../config";
import { generateExpireTimeStamps } from "../../src/utils";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

//only render on client side
const DynamicGeoWorldMap = dynamic(
  () => import("../../components/charts/geo-map/geo-world-map"),
  {
    ssr: false,
  },
);

const DynamicPlayersLineChart = dynamic(
  () => import("../../components/charts/players-line/players-line-chart"),
  {
    ssr: false,
  },
);

type PlayerStatsType = {
  count: number;
  last24hours: number;
  last30days: number;
  last7days: number;
  timeStampMs: number;
};

const PlayerStats = ({
  error,
  playerStats,
  countries,
  historyData,
  locale,
}: {
  error: string;
  playerStats: PlayerStatsType;
  countries: Array<{ id: string; value: number }>;
  historyData: Array<{ y: number; x: string }>;
  locale: string;
}) => {
  const { t } = useTranslation(["stats", "common"]);
  const pageTitle = t("stats:players.meta.title");
  const description = t("stats:players.meta.description", {
    count: playerStats?.count || 0,
  });
  const keywords = generateKeywordsString(t("stats:players.meta.keywords").split(", "));

  useEffect(() => {
    AnalyticsStatsPlayerStatsPageView();
  }, []);

  return (
    <>
      <NextSeo
        title={pageTitle}
        description={description}
        canonical={`${config.SITE_URL}/stats/players`}
        additionalMetaTags={[
          {
            name: "keywords",
            content: keywords,
          },
        ]}
        openGraph={{
          title: pageTitle,
          description: description,
          url: `${config.SITE_URL}/stats/players`,
          images: [
            {
              url: `${config.SITE_URL}/logo/android-icon-192x192.png`,
              width: 192,
              height: 192,
              alt: "COH3 Stats logo",
            },
          ],
        }}
      />
      <Container size={"md"} p={0}>
        {error ? (
          <ErrorCard title={t("stats:errors.gettingPlayerStats")} body={JSON.stringify(error)} />
        ) : (
          <>
            <div style={{ textAlign: "center", paddingBottom: 5 }}>
              <Title order={1}>{t("stats:players.title")}</Title>
            </div>

            <Center>
              {" "}
              <Text span fz="md">
                <div
                  style={{
                    display: "grid",
                    // gridTemplateColumns: " [col1] 57% [col2] 40%",
                    gridColumnGap: "15px",
                    // paddingBottom: "20px",
                  }}
                >
                  <div style={{ gridColumn: 1, justifySelf: "end" }}>
                    <Group gap={5}>
                      <>{t("stats:players.totalTrackedPlayers")}</>{" "}
                      <HelperIcon text={t("stats:players.totalTrackedPlayersTooltip")} />
                    </Group>
                  </div>
                  <div style={{ gridColumn: 2 }}>
                    <Group gap={4}>
                      <IconUser size={17} />
                      <Text fs={"xl"} fw={500}>
                        {playerStats.count.toLocaleString(locale)}
                      </Text>
                    </Group>
                  </div>
                  <div style={{ gridColumn: 1, textAlign: "right" }}>
                    {t("stats:players.multiplayerPlayersLast30Days")}
                  </div>
                  <div style={{ gridColumn: 2 }}>
                    <Group gap={4}>
                      <IconUser size={17} />
                      <Text fs={"xl"} fw={500}>
                        {playerStats.last30days.toLocaleString(locale)}
                      </Text>
                    </Group>
                  </div>
                  <div style={{ gridColumn: 1, textAlign: "right" }}>
                    {t("stats:players.multiplayerPlayersLast7Days")}
                  </div>
                  <div style={{ gridColumn: 2 }}>
                    <Group gap={4}>
                      <IconUser size={17} />
                      <Text fs={"xl"} fw={500}>
                        {playerStats.last7days.toLocaleString(locale)}
                      </Text>
                    </Group>
                  </div>
                  <div style={{ gridColumn: 1, textAlign: "right" }}>
                    {t("stats:players.multiplayerPlayersLast24Hours")}
                  </div>
                  <div style={{ gridColumn: 2 }}>
                    <Group gap={4}>
                      <IconUser size={17} />
                      <Text fs={"xl"} fw={500}>
                        {playerStats.last24hours.toLocaleString(locale)}
                      </Text>
                    </Group>
                  </div>
                </div>
              </Text>
            </Center>

            <div style={{ minHeight: "840px" }}>
              <DynamicGeoWorldMap data={countries} />
              <DynamicPlayersLineChart data={historyData} />
            </div>
            <Text style={{ textAlign: "center" }} fs="italic" c="dimmed" fz="sm" pt={25}>
              {t("stats:players.dataUpdatedOn")}{" "}
              {dayjs(playerStats.timeStampMs).locale(locale).format("YYYY-MM-DD HH:mm")} UTC
              <br />
              {t("stats:players.xboxPsNote")}
            </Text>
          </>
        )}
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ res, locale = "en" }) => {
  let error = null;
  let playerStats: PlayerStatsType | null = null;
  let countries = null;
  let historyData = null;

  console.log(`SSR - /stats/players`);

  try {
    const docRef = doc(getFirestore(), "stats", "player-stats");
    const docHistoryRef = doc(getFirestore(), "stats", "player-stats-history");
    const [docSnap, docHistorySnap] = await Promise.all([getDoc(docRef), getDoc(docHistoryRef)]);

    if (docSnap.exists()) {
      const playerStatsFirebase = docSnap.data();
      const timeStampMs = playerStatsFirebase.timeStamp.toMillis();

      countries = Object.entries(playerStatsFirebase.countries).map(([key, value]) => ({
        id: key,
        value: value,
      }));

      delete playerStatsFirebase.timeStamp;
      delete playerStatsFirebase.countries;
      playerStats = { ...playerStatsFirebase, ...{ timeStampMs } } as PlayerStatsType;
    }

    if (docHistorySnap.exists()) {
      let historyRawData = docHistorySnap.data();
      historyRawData = historyRawData["history"];

      // Already preparing the chart data
      historyData = Object.values(historyRawData).map((value) => ({
        y: value.count,
        // We subtract 1 day, because the analysis is run in 3 AM, but data are for the previous day
        x: dayjs(value.timeStamp.toMillis()).subtract(1, "day").locale("en").format("YYYY-MM-DD"),
      }));
    }

    // Expire at 8 AM
    const expireTimeStamp = generateExpireTimeStamps(8);

    res.setHeader("Cache-Control", "public, stale-while-revalidate=604800");
    res.setHeader("Expires", `${new Date(expireTimeStamp).toUTCString()}`);
  } catch (e) {
    console.error(e);
    error = JSON.stringify(e);
  }

  return {
    props: {
      error,
      playerStats,
      countries,
      historyData,
      ...(await serverSideTranslations(locale, ["common", "stats"])),
      locale,
    },
  };
};

export default PlayerStats;
