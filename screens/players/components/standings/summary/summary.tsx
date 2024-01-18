import { InternalStandings, ProcessedCOHPlayerStats } from "../../../../../src/coh3/coh3-types";
import dynamic from "next/dynamic";
import { Group, Paper, Text } from "@mantine/core";
import React from "react";

const DynamicFactionSummaryChart = dynamic(() => import("./faction-summary-SunBurst-chart"), {
  ssr: false,
});

const DynamicFactionsPieChart = dynamic(() => import("./factions-pie-chart"), {
  ssr: false,
});

const DynamicGameTypesPieChart = dynamic(() => import("./game-types-pie-chart"), {
  ssr: false,
});

const ActivityLastMonths = dynamic(() => import("./activity-last-months"), {
  ssr: false,
});

// const DynamicGameTypesRadarChart = dynamic(() => import("./game-types-radar-chart"), {
//   ssr: false,
// });

// const DynamicFactionWinRateSunBurstChart = dynamic(() => import("./faction-winrate-sun-burst-chart"), {
//   ssr: false,
// });

const StandingsSummaryCharts = ({
  playerStandings,
  playerStatsData,
}: {
  playerStandings: InternalStandings;
  playerStatsData: ProcessedCOHPlayerStats | undefined;
}) => {
  const chartHeight = 160;

  return (
    <Group position={"apart"}>
      <Paper radius="md">
        <Group m="xs" spacing={"xs"}>
          <Text fw={500}>Factions and game types</Text>
        </Group>
        <Group>
          <div
            style={{
              height: chartHeight,
              width: 180,
            }}
          >
            <DynamicFactionsPieChart playerStandings={playerStandings} />
          </div>
          <div
            style={{
              height: chartHeight,
              width: 180,
            }}
          >
            <DynamicFactionSummaryChart playerStandings={playerStandings} />
          </div>
          <div
            style={{
              height: chartHeight,
              width: 180,
            }}
          >
            <DynamicGameTypesPieChart playerStandings={playerStandings} />
          </div>
          {/*<div*/}
          {/*  style={{*/}
          {/*    height: chartHeight,*/}
          {/*    width: 180,*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <DynamicFactionWinRateSunBurstChart playerStandings={playerStandings} />*/}
          {/*</div>*/}
          {/*<div*/}
          {/*  style={{*/}
          {/*    height: chartHeight,*/}
          {/*    width: 180,*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <DynamicGameTypesRadarChart playerStandings={playerStandings} />*/}
          {/*</div>*/}
        </Group>
      </Paper>
      <Paper radius="md">
        <Group m="xs" spacing={"xs"}>
          <Text fw={500}> Activity</Text>
          <Text size={"sm"}> in the last 4 months</Text>
        </Group>

        <div
          style={{
            height: chartHeight,
            width: 350,
          }}
        >
          <ActivityLastMonths playerStatsData={playerStatsData} />
        </div>
      </Paper>
    </Group>
  );
};

export default StandingsSummaryCharts;
