import { ResponsivePie } from "@nivo/pie";
import React from "react";
import { useMantineColorScheme } from "@mantine/core";
import { PlayerReport } from "../../../src/coh3/coh3-types";
import { getNivoTooltipTheme } from "../../../components/charts/charts-components-utils";

const CapturedStrategyPointsPieChart = ({
  axisPlayers,
  alliesPlayers,
}: {
  axisPlayers: PlayerReport[];
  alliesPlayers: PlayerReport[];
}) => {
  const { colorScheme } = useMantineColorScheme();

  const chartData = [
    {
      id: "Axis",
      label: "Axis",
      short: "Axis",
      // value is damage done
      value: axisPlayers.reduce((acc, cur) => acc + cur.counters.pcap, 0),
      // color: chartDataObjectsForTimeSeries.german.color,
      // get percent() {
      //   return (this.value / 100).toFixed(0)
      // }
      // color: "#652f1f",
      //percent: factionPercentage["german"].toFixed(0),
    },
    {
      id: "Allies",
      label: "Allies",
      short: "Allies",
      value: alliesPlayers.reduce((acc, cur) => acc + cur.counters.pcap, 0),
      // color: chartDataObjectsForTimeSeries.dak.color,
      // color: "#b7a842",
      // percent: factionPercentage["dak"].toFixed(0),
    },
  ];

  return (
    <ResponsivePie
      // @ts-ignore
      data={chartData}
      // this will save us space in the "card" and we can better control it
      isInteractive={false}
      animate={false}
      margin={{ left: 0, bottom: 50, top: 0, right: 0 }}
      innerRadius={0.4}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      // arcLabel={(e) => `${e.data.short}`}
      // colors={{ datum: "data.color" }}
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
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          // justify: false,
          translateX: 15,
          translateY: 15,
          itemsSpacing: 3,
          itemWidth: 70,
          itemHeight: 12,
          // itemTextColor: "#999",
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 14,
          symbolShape: "circle",
          effects: [
            {
              on: "hover",
              style: {
                // itemTextColor: "#000",
              },
            },
          ],
          // data: [
          //   {
          //     id: "USForces",
          //     label: "image",
          //   }
          // ]
        },
      ]}
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

export default CapturedStrategyPointsPieChart;
