// disable eslint for this file
/* eslint-disable */

import { Container, Flex, Group, Select, Space, Text, Title } from "@mantine/core";
import React from "react";
import { getFactionSide } from "../../../../src/coh3/helpers";
import { localizedGameTypes, localizedNames } from "../../../../src/coh3/coh3-data";
import {
  leaderBoardType,
  ProcessedCOHPlayerStats,
  raceType,
} from "../../../../src/coh3/coh3-types";
import InnerDetailedStats from "./inner-detailed-stats";
import FactionIcon from "../../../../components/faction-icon";

const DetailedStatsTab = ({
  playerStatsData,
}: {
  playerStatsData: ProcessedCOHPlayerStats | undefined;
}) => {
  const [selectedFaction, setSelectedFaction] = React.useState<raceType>("german");
  const [selectedGameMode, setSelectedGameMode] = React.useState<leaderBoardType>("1v1");

  const FactionSide = getFactionSide(selectedFaction);

  const selectedStats = playerStatsData?.statGroups[selectedGameMode][selectedFaction] || null;
  const selectedLeaderboardStats =
    playerStatsData?.leaderBoardStats[selectedGameMode][selectedFaction] || null;

  return (
    <>
      <Container fluid p={0} pt={"md"}>
        <Flex gap="md" wrap="wrap" justify="space-between" align="center">
          <Title order={3} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Detailed Statistics for {localizedGameTypes[selectedGameMode]}{" "}
            <FactionIcon name={selectedFaction} width={30} />
          </Title>
          <Group justify="center">
            <Select
              value={selectedFaction}
              label="Faction"
              placeholder={"Select faction"}
              defaultValue={"german"}
              data={Object.entries(localizedNames).map(([key, value]) => ({
                value: key,
                label: value,
              }))}
              onChange={(value) => setSelectedFaction((value as raceType) || "")}
              w={200}
              withCheckIcon={false}
              allowDeselect={false}
            />
            <Select
              value={selectedGameMode}
              label="Game Type"
              placeholder={"Select Game Type"}
              defaultValue={"1v1"}
              data={Object.entries(localizedGameTypes).map(([key, value]) => ({
                value: key,
                label: value,
              }))}
              onChange={(value) => setSelectedGameMode((value as leaderBoardType) || "")}
              w={120}
              withCheckIcon={false}
              allowDeselect={false}
            />
          </Group>
        </Flex>
        <Space h={"lg"} />
        <InnerDetailedStats
          stats={selectedStats}
          leaderboardStats={selectedLeaderboardStats}
          factionSide={FactionSide}
        />
        <Space h={"lg"} />
        <Space h={"lg"} />
        <Flex justify="center">
          <Text span size={"sm"} c="dimmed" style={{ textAlign: "center" }}>
            Detailed stats are updated every 24 hours. It's possible that some games are not
            included in the stats.
            <br />
            Stats are being calculated from October 2023.
          </Text>
        </Flex>
      </Container>
    </>
  );
};

export default DetailedStatsTab;
