import {
  FactionSide,
  HistoricLeaderBoardStat,
  PlayerReportCounters,
  WinLossPairType,
} from "../../../../src/coh3/coh3-types";
import { FactionVsFactionCard } from "../../../../components/charts/card-factions-heatmap";
import { AnalysisObjectType } from "../../../../src/analysis-types";
import { Card, Center, Container, Flex, Grid, Space, Stack, Text, Title } from "@mantine/core";
import React from "react";
import { IconDatabaseOff } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import HistoryCharts from "./history-charts";
import CounterStatisticsCard from "./components/counter-statistics-card";
import { TFunction } from "next-i18next";

const DynamicPlayersPlaytimeHistogram = dynamic(
  () => import("./charts/player-playtime-histogram"),
  {
    ssr: false,
  },
);

const DynamicPlayerMapsWinRate = dynamic(() => import("./charts/player-maps-win-rate"), {
  ssr: false,
});

const DynamicPlayerMapsGames = dynamic(() => import("./charts/player-maps-games"), {
  ssr: false,
});

const InnerDetailedStats = ({
  stats,
  factionSide,
  leaderboardStats,
  t,
}: {
  stats: {
    w: number; // wins
    l: number; // losses
    gameTime: number; // play time in seconds
    gameTimeSpread: Record<number, WinLossPairType>; // play time in seconds
    factionMatrix: Record<string, { wins: number; losses: number }>;
    maps: Record<string, WinLossPairType>;
    counters: PlayerReportCounters;
  } | null;
  factionSide: FactionSide;
  leaderboardStats: HistoricLeaderBoardStat | null;
  t: TFunction;
}) => {
  // console.log(stats?.counters);

  // let width = 300;
  // let chartHeight = 265;
  //
  // if (size === "xl") {
  //   width = 465;
  //   chartHeight = 390;
  // }

  if (!stats)
    return (
      <Center>
        <Text span size={"sm"} c="dimmed" ta="center" pt={150} pb={150}>
          <Stack align={"center"} gap={"xs"}>
            <IconDatabaseOff />
            <div> We are not tracking any data for this faction and game type.</div>
          </Stack>
        </Text>
      </Center>
    );

  const totalMatches = stats.w + stats.l;

  return (
    <Container size={"xl"} p={0}>
      {stats.counters && (
        <CounterStatisticsCard counters={stats.counters} totalMatches={totalMatches} t={t} />
      )}
      <Grid justify="center">
        <Grid.Col span={{ base: 12, xs: 6, md: 6 }}>
          <Card p="md" shadow="sm" w={"100%"} withBorder style={{ overflow: "visible" }}>
            <Card.Section withBorder inheritPadding py="xs">
              <Title order={3}>Maps played</Title>
            </Card.Section>
            <Card.Section h={284} py="xs">
              <DynamicPlayerMapsGames data={stats?.maps || {}} />
            </Card.Section>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, md: 6 }}>
          <Card p="md" shadow="sm" w={"100%"} withBorder style={{ overflow: "visible" }}>
            <Card.Section withBorder inheritPadding py="xs">
              <Title order={3}>Maps Win Rate</Title>
            </Card.Section>
            <Card.Section h={284} py="xs">
              <DynamicPlayerMapsWinRate data={stats?.maps || {}} />
            </Card.Section>
          </Card>
        </Grid.Col>
      </Grid>

      <Space h={"md"} />

      <Grid justify="center">
        <Grid.Col span={{ base: 12, xs: 12, md: 8 }}>
          <FactionVsFactionCard
            data={stats as unknown as AnalysisObjectType}
            title={"Faction matrix"}
            factionSide={factionSide}
            width={"100%"}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xs: 12, md: 4 }}>
          <Card p="md" shadow="sm" w={"100%"} withBorder style={{ overflow: "visible" }}>
            <Card.Section withBorder inheritPadding py="xs">
              <Title order={3}>Games by game time</Title>
            </Card.Section>
            <Card.Section h={420} py="xs">
              <DynamicPlayersPlaytimeHistogram data={stats?.gameTimeSpread || {}} />
            </Card.Section>
          </Card>
        </Grid.Col>
      </Grid>
      <Space h={"md"} />
      <Flex gap={"md"} wrap="wrap" justify="center">
        <HistoryCharts leaderboardStats={leaderboardStats} />
      </Flex>
    </Container>
  );
};

export default InnerDetailedStats;
