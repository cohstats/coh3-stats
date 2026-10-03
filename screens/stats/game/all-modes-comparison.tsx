import React from "react";
import dynamic from "next/dynamic";
import { Flex, Space } from "@mantine/core";
import { AnalysisObjectType, StatsDataObject } from "../../../src/analysis-types";
import { leaderBoardType, leaderBoardTypeArray } from "../../../src/coh3/coh3-types";
import { getTotalGameTimeHours } from "../../../src/stats/combine-game-stats";
import { ChartCard, SectionTitle, TitleWithHelper } from "./chart-card";

const DynamicModesPieChart = dynamic(() => import("./charts/modes/modes-pie"), { ssr: false });
const DynamicAvgGameTimePerModeBar = dynamic(
  () => import("./charts/modes/avg-game-time-per-mode-bar"),
  { ssr: false },
);
const DynamicFactionPopularityPerModeBar = dynamic(
  () => import("./charts/modes/faction-popularity-per-mode-bar"),
  { ssr: false },
);
const DynamicFactionWinRatePerModeBar = dynamic(
  () => import("./charts/modes/faction-winrate-per-mode-bar"),
  { ssr: false },
);
const DynamicGameLengthDistributionLine = dynamic(
  () => import("./charts/modes/game-length-distribution-line"),
  { ssr: false },
);

/**
 * "Across game modes" section of the game stats page - charts comparing the 1v1 - 4v4 modes
 * side by side. Shown only when the "all" mode is selected.
 */
const AllModesComparison = ({ analysis }: { analysis: StatsDataObject }) => {
  const valuesPerMode = (getValue: (modeAnalysis: AnalysisObjectType) => number) =>
    Object.fromEntries(
      leaderBoardTypeArray.map((mode) => [mode, analysis[mode] ? getValue(analysis[mode]) : 0]),
    ) as Record<leaderBoardType, number>;

  return (
    <>
      <SectionTitle>Across game modes</SectionTitle>
      <Flex gap={"md"} wrap="wrap" justify="space-between">
        <ChartCard title={"Games per mode"} size={"md"} testId="stats-games-per-mode">
          <DynamicModesPieChart
            values={valuesPerMode((modeAnalysis) => modeAnalysis.matchCount || 0)}
            unit={"games"}
          />
        </ChartCard>
        <ChartCard title={"Hours played"} size={"md"} testId="stats-hours-per-mode">
          <DynamicModesPieChart values={valuesPerMode(getTotalGameTimeHours)} unit={"hours"} />
        </ChartCard>
        <ChartCard title={"Avg game time"} size={"md"} testId="stats-avg-game-time-per-mode">
          <DynamicAvgGameTimePerModeBar analysis={analysis} />
        </ChartCard>
        <ChartCard
          title={
            <TitleWithHelper
              title={"Faction popularity"}
              helper={"Share of the players playing each faction in the game mode."}
            />
          }
          size={"md"}
          testId="stats-faction-popularity-per-mode"
        >
          <DynamicFactionPopularityPerModeBar analysis={analysis} />
        </ChartCard>
      </Flex>
      <Space h="xl" />
      <Flex gap={"md"} wrap="wrap" justify="space-between">
        <ChartCard
          title={
            <TitleWithHelper
              title={"Faction winrate per mode"}
              helper={
                "The bars start at 50% winrate. Bars above the line mean the faction wins more than it loses in that game mode."
              }
            />
          }
          size={"lg"}
          testId="stats-faction-winrate-per-mode"
        >
          <DynamicFactionWinRatePerModeBar analysis={analysis} />
        </ChartCard>
        <ChartCard
          title={
            <TitleWithHelper
              title={"Game length per mode"}
              helper={
                "Percentage of the games in each game mode which ended within the time range. Hover over the chart to compare the modes."
              }
            />
          }
          size={"lg"}
          testId="stats-game-length-per-mode"
        >
          <DynamicGameLengthDistributionLine analysis={analysis} />
        </ChartCard>
      </Flex>
      <Space h="xl" />
    </>
  );
};

export default AllModesComparison;
