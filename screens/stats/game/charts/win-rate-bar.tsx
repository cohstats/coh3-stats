import { ResponsiveBar } from "@nivo/bar";
import { AnalysisObjectType } from "../../../../src/analysis-types";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme } from "../../../../components/charts/charts-components-utils";

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
    { ...{ faction: "DAK", ...calculateWinRate(data.dak) } },
    { ...{ faction: "Wehrmacht", ...calculateWinRate(data.german) } },
    { ...{ faction: "British", ...calculateWinRate(data.british) } },
    { ...{ faction: "US Forces", ...calculateWinRate(data.american) } },
  ];

  return (
    <ResponsiveBar
      margin={{ top: 0, right: 20, bottom: 40, left: 80 }}
      // @ts-ignore
      data={chartData as data[] | undefined}
      layout={"horizontal"}
      keys={["winRate"]}
      indexBy="faction"
      colors={{ scheme: "nivo" }}
      colorBy={"id"}
      minValue={0}
      maxValue={100}
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
        legend: "%",
        legendPosition: "middle",
        legendOffset: 32,
      }}
      enableGridX={true}
      gridXValues={[50]}
    />
  );
};

export default WinRateBarChart;
