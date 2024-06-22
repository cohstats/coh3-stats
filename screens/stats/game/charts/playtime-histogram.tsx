import { ResponsiveBar } from "@nivo/bar";
import { AnalysisObjectType } from "../../../../src/analysis-types";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme } from "../../../../components/charts/charts-components-utils";

interface IProps {
  data: AnalysisObjectType;
}

const PlayTimeHistogramChart: React.FC<IProps> = ({ data }) => {
  const { colorScheme } = useMantineColorScheme();
  const chartData: any[] | undefined = [];

  if (data.gameTimeSpread) {
    for (const [key, value] of Object.entries(data.gameTimeSpread)) {
      if (key === "0") {
        chartData.push({
          time: "0 - 5",
          games: value,
        });
      } else if (key === "5") {
        chartData.push({
          time: "5 - 10",
          games: value,
        });
      } else if (key === "60") {
        chartData.push({
          time: "60+",
          games: value,
        });
      } else {
        chartData.push({
          time: `${key} - ${parseInt(key) + 10}`,
          games: value,
        });
      }
    }
  }

  return (
    <ResponsiveBar
      margin={{ top: 10, right: 20, bottom: 40, left: 65 }}
      // @ts-ignore
      data={chartData as data[] | undefined}
      layout={"vertical"}
      keys={["games"]}
      indexBy="time"
      theme={getNivoTooltipTheme(colorScheme)}
      // colors={{ scheme: 'blues' }}
      // colorBy={"indexValue"}
      minValue={0}
      maxValue={"auto"}
      innerPadding={2}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legendPosition: "middle",
        legendOffset: -50,
        legend: "Amount of games",
      }}
      axisBottom={{
        legend: "Minutes",
        legendPosition: "middle",
        legendOffset: 30,
      }}
    />
  );
};

export default PlayTimeHistogramChart;
