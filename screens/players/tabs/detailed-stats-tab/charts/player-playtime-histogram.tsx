import { ResponsiveBar } from "@nivo/bar";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme } from "../../../../../components/charts/charts-components-utils";
import { WinLossPairType } from "../../../../../src/coh3/coh3-types";

interface IProps {
  data: Record<number, WinLossPairType>;
}

const PlayerPlayTimeHistogramChart: React.FC<IProps> = ({ data }) => {
  const { colorScheme } = useMantineColorScheme();
  const chartData: any[] | undefined = [];

  for (const [key, value] of Object.entries(data)) {
    if (key === "0") {
      chartData.push({
        time: "0 - 5",
        wins: value.w,
        losses: value.l,
      });
    } else if (key === "5") {
      chartData.push({
        time: "5 - 10",
        wins: value.w,
        losses: value.l,
      });
    } else if (key === "60") {
      chartData.push({
        time: "60+",
        wins: value.w,
        losses: value.l,
      });
    } else {
      chartData.push({
        time: `${key} - ${parseInt(key) + 10}`,
        wins: value.w,
        losses: value.l,
      });
    }
  }

  return (
    <ResponsiveBar
      margin={{ top: 10, right: 20, bottom: 40, left: 65 }}
      // @ts-ignore
      data={chartData as data[] | undefined}
      layout={"vertical"}
      keys={["wins", "losses"]}
      indexBy="time"
      theme={getNivoTooltipTheme(colorScheme)}
      // colors={{ scheme: 'blues' }}
      // colorBy={"indexValue"}
      minValue={0}
      maxValue={"auto"}
      innerPadding={2}
      defs={[
        {
          id: "green",
          type: "linearGradient",
          colors: [{ offset: 100, color: "#60BD68" }],
        },
        {
          id: "red",
          type: "linearGradient",
          colors: [{ offset: 100, color: "#F15854" }],
        },
      ]}
      fill={[
        {
          match: {
            id: "wins",
          },
          id: "green",
        },
        {
          match: {
            id: "losses",
          },
          id: "red",
        },
      ]}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legendPosition: "middle",
        legendOffset: -50,
        legend: "Amount of games",
        format: (e) => (Number.isInteger(e) ? e : ""),
      }}
      axisBottom={{
        legend: "Minutes",
        legendPosition: "middle",
        legendOffset: 30,
      }}
    />
  );
};

export default PlayerPlayTimeHistogramChart;
