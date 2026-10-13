import { ResponsiveBar } from "@nivo/bar";
import { AnalysisObjectType } from "../../../../src/analysis-types";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme } from "../../../../components/charts/charts-components-utils";
import { factionShortLabels } from "./modes/modes-chart-utils";

interface IProps {
  data: AnalysisObjectType;
}

const GamesBarChart: React.FC<IProps> = ({ data }) => {
  const { colorScheme } = useMantineColorScheme();

  const chartData = [
    { ...{ faction: factionShortLabels.american, ...data.american } },
    { ...{ faction: factionShortLabels.british, ...data.british } },
    { ...{ faction: factionShortLabels.german, ...data.german } },
    { ...{ faction: factionShortLabels.dak, ...data.dak } },
  ];

  return (
    <ResponsiveBar
      margin={{ top: 10, right: 20, bottom: 40, left: 65 }}
      // @ts-ignore
      data={chartData as data[] | undefined}
      layout={"vertical"}
      keys={["wins", "losses"]}
      indexBy="faction"
      colors={{ scheme: "nivo" }}
      theme={getNivoTooltipTheme(colorScheme)}
      colorBy={"id"}
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
        legendOffset: -40,
      }}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
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

export default GamesBarChart;
