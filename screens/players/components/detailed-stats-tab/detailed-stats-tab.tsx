// disable eslint for this file
/* eslint-disable */

import {
  Anchor,
  Button,
  Center,
  Container,
  Flex,
  Group,
  Select,
  Text,
  Title,
} from "@mantine/core";
import React from "react";
import { getMapLocalizedName } from "../../../../src/coh3/helpers";
import { localizedGameTypes, localizedNames } from "../../../../src/coh3/coh3-data";
import {
  leaderBoardType,
  ProcessedCOHPlayerStats,
  raceType,
} from "../../../../src/coh3/coh3-types";
import InnerDetailedStats from "./inner-detailed-stats";
import { AnalysisObjectType } from "../../../../src/analysis-types";

const DetailedStatsTab = ({
  playerStatsData,
}: {
  playerStatsData: ProcessedCOHPlayerStats | undefined;
}) => {
  const [selectedFaction, setSelectedFaction] = React.useState<raceType>("german");
  const [selectedGameMode, setSelectedGameMode] = React.useState<leaderBoardType>("1v1");

  const selectedStats = playerStatsData?.statGroups[selectedGameMode][selectedFaction];

  return (
    <>
      <Container size={"lg"} p={"md"}>
        <Flex gap="md" wrap="wrap" justify="space-between" align="center">
          <Title order={3}>Detailed Statistics for </Title>
          <Group>
            <Select
              value={selectedFaction}
              label="Faction"
              placeholder={"Select faction"}
              defaultValue={"german"}
              data={
                Object.entries(localizedNames).map(([key, value]) => ({
                  value: key,
                  label: value,
                })) || []
              }
              onChange={(value) => setSelectedFaction((value as raceType) || "")}
              w={195}
            />
            <Select
              value={selectedGameMode}
              label="Game Type"
              placeholder={"Select Game Type"}
              defaultValue={"1v1"}
              data={
                Object.entries(localizedGameTypes).map(([key, value]) => ({
                  value: key,
                  label: value,
                })) || []
              }
              onChange={(value) => setSelectedGameMode((value as leaderBoardType) || "")}
              w={195}
            />
          </Group>
        </Flex>
        <InnerDetailedStats stats={selectedStats || null} />

        <Text size={"sm"} c="dimmed" ta="center">
          Detailed stats are updated every 24 hours. It's possible that some games are not
          included in the stats.
          <br />
          Stats are being calculated from October 2023.
        </Text>
      </Container>
    </>
  );
};

export default DetailedStatsTab;
