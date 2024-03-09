import {
  InternalStandings,
  platformType,
  ProcessedCOHPlayerStats,
} from "../../../src/coh3/coh3-types";
import { Container, Flex, Space } from "@mantine/core";
import React from "react";
import PlayerStandingsFaction from "./standings/player-standings-faction";
import StandingsSummaryCharts from "./standings/summary/summary";
import NemesisWidget from "./standings/nemesis-widget";
import MoreButton from "./components/more-button";
import { useRouter } from "next/router";
import MapsWidget from "./standings/maps-widget/maps-widget";

const PlayerStandingsTab = ({
  playerStandings,
  playerStatsData,
  platform,
}: {
  playerStandings: InternalStandings;
  playerStatsData: ProcessedCOHPlayerStats | undefined;
  platform: platformType;
}) => {
  const { push, query } = useRouter();

  const changeView = async (value: string) => {
    await push({ query: { ...query, view: value } });
  };

  return (
    <Container size={"xl"}>
      <Space h="xs" />
      <StandingsSummaryCharts
        playerStandings={playerStandings}
        playerStatsData={playerStatsData}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "-30px" }}>
        <MoreButton onClick={() => changeView("activity")} />
      </div>
      <Space h="xs" />
      <Flex gap="xs" wrap={"wrap"}>
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
          <MapsWidget playerStatsData={playerStatsData} playerStandings={playerStandings} />
          <Space h="xl" />
          <NemesisWidget
            playerStatsData={playerStatsData}
            moreButtonOnClick={() => changeView("nemesis")}
          />
        </div>
      </Flex>
    </Container>
  );
};

export default PlayerStandingsTab;
