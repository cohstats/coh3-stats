import { ResponsiveBar } from "@nivo/bar";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme } from "../../../../../components/charts/charts-components-utils";
import { WinLossPairType } from "../../../../../src/coh3/coh3-types";
import { getMapLocalizedName } from "../../../../../src/coh3/helpers";

interface IProps {
  data: Record<number, WinLossPairType>;
}

const PlayerMapsWinRate: React.FC<IProps> = ({ data }) => {
  const { colorScheme } = useMantineColorScheme();
  const chartData: any[] | undefined = [];

  for (const [key, value] of Object.entries(data)) {
    chartData.push({
      map: getMapLocalizedName(key),
      winRate: ((value.w / (value.w + value.l)) * 100).toFixed(2),
    });
  }

  return (
    <ResponsiveBar
      margin={{ top: 10, right: 20, bottom: 80, left: 65 }}
      // @ts-ignore
      data={chartData as data[] | undefined}
      layout={"vertical"}
      keys={["winRate"]}
      indexBy="map"
      theme={getNivoTooltipTheme(colorScheme)}
      minValue={0}
      maxValue={100}
      innerPadding={2}
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
        legend: "Win Rate %",
      }}
      axisBottom={{
        legendPosition: "middle",
        legendOffset: 30,
        tickRotation: -35,
      }}
    />
  );
};

export default PlayerMapsWinRate;
