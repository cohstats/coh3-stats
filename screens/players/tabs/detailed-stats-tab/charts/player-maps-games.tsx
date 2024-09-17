import { ResponsiveBar } from "@nivo/bar";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme } from "../../../../../components/charts/charts-components-utils";
import { WinLossPairType } from "../../../../../src/coh3/coh3-types";
import { getMapLocalizedName } from "../../../../../src/coh3/helpers";

interface IProps {
  data: Record<number, WinLossPairType>;
}

const PlayerMapsGames: React.FC<IProps> = ({ data }) => {
  const { colorScheme } = useMantineColorScheme();
  const chartData: any[] | undefined = [];

  for (const [key, value] of Object.entries(data)) {
    chartData.push({
      map: getMapLocalizedName(key),
      wins: value.w,
      losses: value.l,
    });
  }

  return (
    <ResponsiveBar
      margin={{ top: 10, right: 20, bottom: 80, left: 65 }}
      // @ts-ignore
      data={chartData as data[] | undefined}
      layout={"vertical"}
      keys={["wins", "losses"]}
      indexBy="map"
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
        legendPosition: "middle",
        legendOffset: 30,
        tickRotation: -35,
      }}
      // legends={[
      //   {
      //     dataFrom: "keys",
      //     anchor: "bottom-right",
      //     direction: "column",
      //     justify: false,
      //     translateX: 120,
      //     translateY: 0,
      //     itemsSpacing: 2,
      //     itemWidth: 100,
      //     itemHeight: 20,
      //     itemDirection: "left-to-right",
      //     itemOpacity: 0.85,
      //     symbolSize: 20,
      //     effects: [
      //       {
      //         on: "hover",
      //         style: {
      //           itemOpacity: 1,
      //         },
      //       },
      //     ],
      //   },
      // ]}
    />
  );
};

export default PlayerMapsGames;
