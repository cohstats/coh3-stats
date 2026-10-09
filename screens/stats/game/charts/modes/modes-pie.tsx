import { ResponsivePie } from "@nivo/pie";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme } from "../../../../../components/charts/charts-components-utils";
import { leaderBoardType, leaderBoardTypeArray } from "../../../../../src/coh3/coh3-types";
import { modeColors } from "../../../../../src/stats/combine-game-stats";
import { ChartTooltip } from "./modes-chart-utils";

interface IProps {
  /** Value for each of the game modes - games, hours ... */
  values: Record<leaderBoardType, number>;
  /** Name of the value for the tooltip, eg "games" or "hours". */
  unit: string;
}

/** Donut chart splitting a value between the 1v1 - 4v4 game modes. */
const ModesPieChart: React.FC<IProps> = ({ values, unit }) => {
  const { colorScheme } = useMantineColorScheme();

  const total = leaderBoardTypeArray.reduce((sum, mode) => sum + values[mode], 0);

  const chartData = leaderBoardTypeArray.map((mode) => ({
    id: mode,
    label: mode,
    value: Math.round(values[mode]),
    color: modeColors[mode],
    percent: total ? ((values[mode] / total) * 100).toFixed(0) : "0",
  }));

  return (
    <ResponsivePie
      data={chartData}
      margin={{ left: 45, bottom: 15, top: 10, right: 35 }}
      innerRadius={0.4}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      colors={{ datum: "data.color" }}
      arcLabel={(e) => `${e.data.percent}%`}
      arcLabelsSkipAngle={15}
      arcLabelsTextColor={"#222222"}
      enableArcLinkLabels={false}
      theme={getNivoTooltipTheme(colorScheme)}
      tooltip={({ datum }) => (
        <ChartTooltip colorScheme={colorScheme}>
          <strong>{datum.label}</strong>: {datum.value.toLocaleString()} {unit} (
          {datum.data.percent}%)
        </ChartTooltip>
      )}
      legends={[
        {
          anchor: "bottom-left",
          direction: "column",
          translateX: -40,
          translateY: 10,
          itemsSpacing: 3,
          itemWidth: 50,
          itemHeight: 12,
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 12,
          symbolShape: "circle",
        },
      ]}
    />
  );
};

export default ModesPieChart;
