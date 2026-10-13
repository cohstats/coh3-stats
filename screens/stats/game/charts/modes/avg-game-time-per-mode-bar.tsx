import { ResponsiveBar } from "@nivo/bar";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { StatsDataObject } from "../../../../../src/analysis-types";
import { getNivoTooltipTheme } from "../../../../../components/charts/charts-components-utils";
import { leaderBoardType, leaderBoardTypeArray } from "../../../../../src/coh3/coh3-types";
import {
  getAverageGameTimeMinutes,
  modeColors,
} from "../../../../../src/stats/combine-game-stats";
import { ChartTooltip } from "./modes-chart-utils";

interface IProps {
  analysis: StatsDataObject;
}

const AvgGameTimePerModeBar: React.FC<IProps> = ({ analysis }) => {
  const { colorScheme } = useMantineColorScheme();

  const chartData = leaderBoardTypeArray.map((mode) => ({
    mode,
    minutes: Number(getAverageGameTimeMinutes(analysis[mode] || {}).toFixed(1)),
  }));

  return (
    <ResponsiveBar
      data={chartData}
      keys={["minutes"]}
      indexBy="mode"
      margin={{ top: 15, right: 20, bottom: 40, left: 55 }}
      padding={0.25}
      colors={({ indexValue }) => modeColors[indexValue as leaderBoardType]}
      valueScale={{ type: "linear", min: 0 }}
      labelTextColor={"#222222"}
      theme={getNivoTooltipTheme(colorScheme)}
      tooltip={({ indexValue, value }) => (
        <ChartTooltip colorScheme={colorScheme}>
          <strong>{indexValue}</strong>: {value} minutes on average
        </ChartTooltip>
      )}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        legend: "Minutes",
        legendPosition: "middle",
        legendOffset: -40,
      }}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
      }}
    />
  );
};

export default AvgGameTimePerModeBar;
