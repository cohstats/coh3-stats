import { FactionSide, WinLossPairType } from "../../../../src/coh3/coh3-types";
import { FactionVsFactionCard } from "../../../../components/charts/card-factions-heatmap";
import { AnalysisObjectType } from "../../../../src/analysis-types";
import { Card, Center, Flex, Stack, Text, Title } from "@mantine/core";
import React from "react";
import { IconDatabaseOff } from "@tabler/icons-react";
import dynamic from "next/dynamic";

const DynamicPlayersPlaytimeHistogram = dynamic(
  () => import("./charts/player-playtime-histogram"),
  {
    ssr: false,
  },
);

const InnerDetailedStats = ({
  stats,
  factionSide,
}: {
  stats: {
    w: number; // wins
    l: number; // losses
    gameTime: number; // play time in seconds
    gameTimeSpread: Record<number, WinLossPairType>; // play time in seconds
    factionMatrix: Record<string, { wins: number; losses: number }>;
    maps: Record<string, WinLossPairType>;
    counters: Record<string, number>;
  } | null;
  factionSide: FactionSide;
}) => {
  console.log(stats);

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
        <Text size={"sm"} c="dimmed" ta="center" pt={150} pb={150}>
          <Stack align={"center"} spacing={"xs"}>
            <IconDatabaseOff />
            <div> We are not tracking any data for this faction and game type.</div>
          </Stack>
        </Text>
      </Center>
    );

  return (
    <>
      <Flex gap={"xl"} wrap="wrap" justify="center">
        <FactionVsFactionCard
          data={(stats as unknown as AnalysisObjectType) || {}}
          title={"Faction matrix"}
          factionSide={factionSide}
          width={760}
        />
        <Card p="md" shadow="sm" w={455} withBorder>
          {/* top, right, left margins are negative – -1 * theme.spacing.xl */}

          <Card.Section withBorder inheritPadding py="xs">
            <Title order={3}>Games by game time</Title>
          </Card.Section>
          {/* right, left margins are negative – -1 * theme.spacing.xl */}
          <Card.Section w={465} h={390} py="xs">
            <DynamicPlayersPlaytimeHistogram data={stats?.gameTimeSpread || {}} />
          </Card.Section>
        </Card>
      </Flex>
    </>
  );
};

export default InnerDetailedStats;
