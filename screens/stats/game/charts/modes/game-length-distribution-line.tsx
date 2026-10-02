import { ResponsiveLine } from "@nivo/line";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { StatsDataObject } from "../../../../../src/analysis-types";
import { getNivoTooltipTheme } from "../../../../../components/charts/charts-components-utils";
import { leaderBoardTypeArray } from "../../../../../src/coh3/coh3-types";
import { getGameTimeBucketLabel, modeColors } from "../../../../../src/stats/combine-game-stats";

interface IProps {
  analysis: StatsDataObject;
}

/** One line per game mode - % of the mode's games which ended in each game time bucket. */
const GameLengthDistributionLine: React.FC<IProps> = ({ analysis }) => {
  const { colorScheme } = useMantineColorScheme();

  // Not every mode has to have every bucket, collect all of them and sort them as numbers.
  const bucketKeys = Array.from(
    new Set(
      leaderBoardTypeArray.flatMap((mode) => Object.keys(analysis[mode]?.gameTimeSpread || {})),
    ),
  ).sort((a, b) => parseInt(a) - parseInt(b));

  const chartData = leaderBoardTypeArray.map((mode) => {
    const spread = analysis[mode]?.gameTimeSpread || {};
    const total = Object.values(spread).reduce((sum, value) => sum + (value || 0), 0);

    return {
      id: mode,
      color: modeColors[mode],
      data: bucketKeys.map((key) => ({
        x: getGameTimeBucketLabel(key),
        y: total ? Number((((spread[key] || 0) / total) * 100).toFixed(1)) : 0,
      })),
    };
  });

  return (
    <ResponsiveLine
      data={chartData}
      margin={{ top: 20, right: 25, bottom: 75, left: 55 }}
      xScale={{ type: "point" }}
      yScale={{ type: "linear", min: 0, max: "auto" }}
      yFormat={(v) => `${v}%`}
      curve="monotoneX"
      colors={{ datum: "color" }}
      lineWidth={3}
      pointSize={7}
      pointBorderWidth={1}
      pointBorderColor={{ from: "serieColor" }}
      enableGridX={false}
      useMesh={true}
      enableSlices="x"
      animate={false}
      theme={getNivoTooltipTheme(colorScheme)}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        format: (v) => `${v}%`,
        legend: "% of games",
        legendPosition: "middle",
        legendOffset: -45,
      }}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        legend: "Minutes",
        legendPosition: "middle",
        legendOffset: 35,
      }}
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          toggleSerie: true,
          translateX: 0,
          translateY: 70,
          itemsSpacing: 4,
          itemWidth: 60,
          itemHeight: 14,
          itemDirection: "left-to-right",
          symbolSize: 12,
          symbolShape: "circle",
        },
      ]}
    />
  );
};

export default GameLengthDistributionLine;
