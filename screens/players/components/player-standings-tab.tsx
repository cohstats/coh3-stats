import {
  InternalStandings,
  platformType,
  ProcessedCOHPlayerStats,
} from "../../../src/coh3/coh3-types";
import { Container, Space } from "@mantine/core";
import React from "react";
import PlayerStandingsFaction from "./standings/player-standings-faction";
import dynamic from "next/dynamic";

const DynamicActivityCalendarDayWidget = dynamic(
  () => import("./widgets/activity-calendar-day-widget"),
  {
    ssr: false,
  },
);

const PlayerStandingsTab = ({
  playerStandings,
  platform,
  playerStatsData,
}: {
  playerStandings: InternalStandings;
  platform: platformType;
  playerStatsData: ProcessedCOHPlayerStats;
}) => {
  return (
    <Container size={"xl"}>
      <Space h="xs" />
      <div style={{ height: 150 }}>
        <DynamicActivityCalendarDayWidget playerStatsData={playerStatsData} />
      </div>
      <Space h="xs" />
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
      <PlayerStandingsFaction faction={"dak"} data={playerStandings.dak} platform={platform} />
      <Space h="xs" />
      <PlayerStandingsFaction
        faction={"british"}
        data={playerStandings.british}
        platform={platform}
      />
    </Container>
  );
};

export default PlayerStandingsTab;
