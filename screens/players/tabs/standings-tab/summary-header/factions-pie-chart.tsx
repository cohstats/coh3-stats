import { InternalStandings } from "../../../../../src/coh3/coh3-types";
import { ResponsivePie } from "@nivo/pie";
import {
  chartDataObjectsForTimeSeries,
  getNivoTooltipTheme,
} from "../../../../../components/charts/charts-components-utils";
import React from "react";
import { useMantineColorScheme } from "@mantine/core";

const FactionsPieChart = ({ playerStandings }: { playerStandings: InternalStandings }) => {
  const { colorScheme } = useMantineColorScheme();

  const chartData = [
    {
      id: "Wehrmacht",
      label: "Wehrmacht",
      short: "Wehr",
      value: Object.values(playerStandings.german).reduce(
        (acc, cur) => acc + (cur?.wins || 0) + (cur?.losses || 0),
        0,
      ),
      color: chartDataObjectsForTimeSeries.german.color,
      // get percent() {
      //   return (this.value / 100).toFixed(0)
      // }
      // color: "#652f1f",
      //percent: factionPercentage["german"].toFixed(0),
    },
    {
      id: "DAK",
      label: "DAK",
      short: "DAK",
      value: Object.values(playerStandings.dak).reduce(
        (acc, cur) => acc + (cur?.wins || 0) + (cur?.losses || 0),
        0,
      ),
      color: chartDataObjectsForTimeSeries.dak.color,
      // color: "#b7a842",
      // percent: factionPercentage["dak"].toFixed(0),
    },
    {
      id: "British",
      label: "British",
      short: "Brit",
      value: Object.values(playerStandings.british).reduce(
        (acc, cur) => acc + (cur?.wins || 0) + (cur?.losses || 0),
        0,
      ),
      color: chartDataObjectsForTimeSeries.british.color,
      // color: "#4b6a79",
      //percent: factionPercentage["british"].toFixed(0),
    },
    {
      id: "USForces",
      label: "US Forces",
      short: "USF",
      value: Object.values(playerStandings.american).reduce(
        (acc, cur) => acc + (cur?.wins || 0) + (cur?.losses || 0),
        0,
      ),
      color: chartDataObjectsForTimeSeries.american.color,
      // percent: factionPercentage["american"].toFixed(0),
    },
  ];

  return (
    <ResponsivePie
      // @ts-ignore
      data={chartData}
      margin={{ left: 15, bottom: 15, top: 15, right: 15 }}
      innerRadius={0.4}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      arcLabel={(e) => `${e.data.short}`}
      colors={{ datum: "data.color" }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsThickness={2}
      arcLabelsSkipAngle={10}
      enableArcLabels={true}
      enableArcLinkLabels={false}
      // arcLinkLabelComponent={ArcLinkLabel}
      arcLinkLabelsTextColor={{ from: "color", modifiers: [] }}
      arcLinkLabelsOffset={-17}
      arcLinkLabelsDiagonalLength={21}
      arcLinkLabelsStraightLength={7}
      theme={getNivoTooltipTheme(colorScheme)}
      // legends={[
      //   {
      //     anchor: "bottom-left",
      //     direction: "column",
      //     // justify: false,
      //     translateX: -40,
      //     translateY: 15,
      //     itemsSpacing: 3,
      //     itemWidth: 70,
      //     itemHeight: 12,
      //     // itemTextColor: "#999",
      //     itemDirection: "left-to-right",
      //     itemOpacity: 1,
      //     symbolSize: 14,
      //     symbolShape: "circle",
      //     effects: [
      //       {
      //         on: "hover",
      //         style: {
      //           // itemTextColor: "#000",
      //         },
      //       },
      //     ],
      //     // data: [
      //     //   {
      //     //     id: "USForces",
      //     //     label: "image",
      //     //   }
      //     // ]
      //   },
      // ]}
      // defs={[
      //   {
      //     id: "dots",
      //     type: "patternDots",
      //     background: "inherit",
      //     color: "rgba(255, 255, 255, 0.3)",
      //     size: 4,
      //     padding: 1,
      //     stagger: true,
      //   },
      // ]}
      // fill={[
      //   {
      //     match: {
      //       id: "British",
      //     },
      //     id: "dots",
      //   },
      //   {
      //     match: {
      //       id: "USForces",
      //     },
      //     id: "dots",
      //   },
      // ]}
    />
  );
};

export default FactionsPieChart;
