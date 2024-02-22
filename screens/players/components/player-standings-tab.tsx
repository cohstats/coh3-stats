import {
  InternalStandings,
  platformType,
  ProcessedCOHPlayerStats,
} from "../../../src/coh3/coh3-types";
import { Container, Flex, Space, Stack } from "@mantine/core";
import React from "react";
import PlayerStandingsFaction from "./standings/player-standings-faction";
import StandingsSummaryCharts from "./standings/summary/summary";
import NemesisWidget from "./standings/nemesis-widget";
import MoreButton from "./components/more-button";

const PlayerStandingsTab = ({
  playerStandings,
  playerStatsData,
  platform,
}: {
  playerStandings: InternalStandings;
  playerStatsData: ProcessedCOHPlayerStats | undefined;
  platform: platformType;
}) => {
  return (
    <Container size={"xl"}>
      <Space h="xs" />
      <Stack spacing={0} align={"flex-end"}>
        <StandingsSummaryCharts
          playerStandings={playerStandings}
          playerStatsData={playerStatsData}
        />
        <MoreButton onClick={() => {}} />
      </Stack>

      <Space h="xs" />
      <Flex gap="xs">
        <div style={{ flexGrow: 1 }}>
          <PlayerStandingsFaction
            faction={"german"}
            data={playerStandings.german}
            platform={platform}
          />
          <Space h="xs" />
          <PlayerStandingsFaction
            faction={"american"}
            data={playerStandings.american}
            platform={platform}
          />
          <Space h="xs" />
          <PlayerStandingsFaction
            faction={"dak"}
            data={playerStandings.dak}
            platform={platform}
          />
          <Space h="xs" />
          <PlayerStandingsFaction
            faction={"british"}
            data={playerStandings.british}
            platform={platform}
          />
        </div>

        <div style={{ width: 300 }}>
          <Space h="xl" />
          <Space h="xl" />
          <NemesisWidget playerStatsData={playerStatsData} />
        </div>
      </Flex>
    </Container>
  );
};

export default PlayerStandingsTab;
