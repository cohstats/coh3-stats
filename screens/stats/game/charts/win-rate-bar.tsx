import { ResponsiveBar } from "@nivo/bar";
import { AnalysisObjectType } from "../../../../src/analysis-types";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme } from "../../../../components/charts/charts-components-utils";
import { factionShortLabels } from "./modes/modes-chart-utils";

const calculateWinRate = (data: { wins: number; losses: number }) => {
  return {
    winRate: ((data.wins / (data.wins + data.losses)) * 100).toFixed(1),
  };
};

interface IProps {
  data: AnalysisObjectType;
}

const WinRateBarChart: React.FC<IProps> = ({ data }) => {
  const { colorScheme } = useMantineColorScheme();

  const chartData = [
    { ...{ faction: factionShortLabels.dak, ...calculateWinRate(data.dak) } },
    { ...{ faction: factionShortLabels.german, ...calculateWinRate(data.german) } },
    { ...{ faction: factionShortLabels.british, ...calculateWinRate(data.british) } },
    { ...{ faction: factionShortLabels.american, ...calculateWinRate(data.american) } },
  ];

  return (
    <ResponsiveBar
      margin={{ top: 0, right: 20, bottom: 40, left: 50 }}
      // @ts-ignore
      data={chartData as data[] | undefined}
      layout={"horizontal"}
      keys={["winRate"]}
      indexBy="faction"
      colors={{ scheme: "nivo" }}
      colorBy={"id"}
      valueScale={{
        type: "linear",
        min: 0,
        max: 100,
        clamp: true,
      }}
      innerPadding={4}
      theme={getNivoTooltipTheme(colorScheme)}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legendPosition: "middle",
        legendOffset: -40,
      }}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickValues: [0, 25, 50, 75, 100],
        format: (v) => `${v}%`,
      }}
      markers={[
        {
          axis: "x",
          value: 50,
          lineStyle: {
            stroke: colorScheme === "dark" ? "#dddddd" : "#333333",
            strokeWidth: 1.5,
            strokeDasharray: "4 3",
          },
        },
      ]}
    />
  );
};

export default WinRateBarChart;
