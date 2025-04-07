import Head from "next/head";
import React, { useEffect, useState } from "react";
import { Container, Group, Select, Stack, Title } from "@mantine/core";
import { generateKeywordsString } from "../../src/head-utils";
import { getLiveGames, getLiveGamesSummary } from "../../src/apis/coh3stats-api";
import { LiveGameSummary, ResponseLiveGames, TypeOfLiveGame } from "../../src/coh3/coh3-types";
import LiveGamesSummaryTable from "./live-games-summary-table";
import dynamic from "next/dynamic";
import { calculatePositionNumber } from "../../src/utils";
import { useRouter } from "next/router";
import LiveGamesTable from "./live-games-table";
import { useMediaQuery } from "@mantine/hooks";
import {
  AnalyticsLiveGamesOrderSelection,
  AnalyticsLiveGamesPage,
  AnalyticsLiveGamesTypeSelection,
  AnalyticsLiveGamesView,
} from "../../src/firebase/analytics";
import { useTranslation } from "next-i18next";

// the chart needs to be dynamically imported
const DynamicLiveGamesLineChart = dynamic(() => import("./live-games-line-chart"), {
  ssr: false,
});

const RECORDS_PER_PAGE = 25;

const LiveGamesIndex = () => {
  const { t } = useTranslation("live-games");
  const { push, query } = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [type, setType] = useState<TypeOfLiveGame | null>(null);
  const [order, setOrder] = useState<"rank" | "observers" | "startgametime">("rank");
  const [start, setStart] = useState<number>(1);

  const [liveGamesSummary, setLiveGamesSummary] = useState<LiveGameSummary | null>(null);
  const [liveGamesSummaryError, setLiveGamesSummaryError] = useState<string | null>(null);
  const [liveGamesSummaryLoading, setLiveGamesSummaryLoading] = useState(false);

  const [liveGames, setLiveGames] = useState<ResponseLiveGames | null>(null);
  const [liveGamesError, setLiveGamesError] = useState<string | null>(null);
  const [liveGamesLoading, setLiveGamesLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLiveGamesSummaryLoading(true);
        const data = await getLiveGamesSummary();
        setLiveGamesSummary(data);
      } catch (e: any) {
        console.error(`Error getting the live games summary`);
        console.error(e);
        setLiveGamesSummaryError(e);
      } finally {
        setLiveGamesSummaryLoading(false);
      }

      AnalyticsLiveGamesView();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLiveGamesLoading(true);
        if (!type) return;
        const data = await getLiveGames(type, order, start, RECORDS_PER_PAGE);
        setLiveGames(data);
      } catch (e: any) {
        console.error(`Error getting the live games`);
        console.error(e);
        setLiveGamesError(e);
      } finally {
        setLiveGamesLoading(false);
      }
    })();
  }, [type, order, start]);

  useEffect(() => {
    const typeQuery = query.type ? (query.type as string) : null;
    const orderQuery = query.order ? (query.order as string) : null;
    const startQuery = query.start ? (query.start as string) : null;

    if (typeQuery && typeQuery !== type) {
      AnalyticsLiveGamesTypeSelection(typeQuery);
      setType(typeQuery as any);
    }

    if (type === null && typeQuery === null) {
      setType("4v4");
    }

    if (orderQuery && orderQuery !== order) {
      AnalyticsLiveGamesOrderSelection(orderQuery);
      setOrder(orderQuery as any);
    }

    if (startQuery && startQuery !== `${start}`) {
      AnalyticsLiveGamesPage(parseInt(startQuery));
      setStart(parseInt(startQuery));
    }
  }, [query]);

  const selectType = (value: TypeOfLiveGame | string | null) => {
    setType((value || "1v1") as TypeOfLiveGame);
    push({ query: { ...query, type: value } }, undefined, {
      shallow: true,
    });
  };

  const selectOrder = (value: "rank" | "observers" | "startgametime" | string | null) => {
    setOrder((value || "rank") as "rank" | "observers" | "startgametime");
    push({ query: { ...query, order: value } }, undefined, {
      shallow: true,
    });
  };

  const onPageChange = (p: number) => {
    const startPositionNumber = calculatePositionNumber(p, RECORDS_PER_PAGE);
    setLiveGamesLoading(true);
    push({ query: { ...query, start: startPositionNumber } }, undefined);
  };

  return (
    <>
      <Head>
        <title>{t("meta.title")}</title>
        <meta name="description" content={t("meta.description")} />
        <meta
          name="keywords"
          content={generateKeywordsString([
            "coh3 live games",
            "coh3 realtime matches",
            "coh3 games",
            "coh3 current matches in progress",
          ])}
        />
        <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
      </Head>
      <Container size={"fluid"} p={0}>
        <div style={{ textAlign: "center", paddingBottom: 5 }}>
          <Title order={1}>{t("pageTitle")}</Title>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Stack align="flex-start">
            <LiveGamesSummaryTable
              data={liveGamesSummary}
              loading={liveGamesSummaryLoading}
              error={liveGamesSummaryError}
              isMobile={!!isMobile}
            />
            <Group>
              <Select
                withCheckIcon={false}
                label={t("filters.liveGames.label")}
                style={{ width: 180 }}
                allowDeselect={false}
                value={type}
                data={[
                  { value: "1v1", label: t("filters.liveGames.options.1v1") },
                  { value: "2v2", label: t("filters.liveGames.options.2v2") },
                  { value: "3v3", label: t("filters.liveGames.options.3v3") },
                  { value: "4v4", label: t("filters.liveGames.options.4v4") },
                  { value: "ai", label: t("filters.liveGames.options.ai") },
                  { value: "custom", label: t("filters.liveGames.options.custom") },
                ]}
                onChange={selectType}
              />
              <Select
                withCheckIcon={false}
                label={t("filters.sortBy.label")}
                style={{ width: 150 }}
                allowDeselect={false}
                value={order}
                data={[
                  { value: "rank", label: t("filters.sortBy.options.rank") },
                  { value: "observers", label: t("filters.sortBy.options.observers") },
                  { value: "startgametime", label: t("filters.sortBy.options.startgametime") },
                ]}
                onChange={selectOrder}
              />
            </Group>
          </Stack>
          {!isMobile && !liveGamesSummaryError && (
            <div style={{ width: 660, height: 250 }}>
              <DynamicLiveGamesLineChart
                data={[
                  ...(liveGamesSummary?.liveGamesChart.timeLine || []),
                  ...(liveGamesSummary?.liveGamesChart.buffer || []),
                ]}
                type={type}
                loading={liveGamesSummaryLoading}
              />
            </div>
          )}
        </div>
        <LiveGamesTable
          data={liveGames}
          loading={liveGamesLoading}
          error={liveGamesError}
          recordsPerPage={RECORDS_PER_PAGE}
          start={start}
          onPageChange={onPageChange}
          type={type}
        />
      </Container>
    </>
  );
};

export default LiveGamesIndex;
