import { ResponsivePie } from "@nivo/pie";
import { AnalysisObjectType } from "../../../../../src/analysis-types";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme } from "../../../../charts/chart-utils";
import {
  leaderBoardTypeArray,
  raceType,
  raceTypeArray,
} from "../../../../../src/coh3/coh3-types";

interface IProps {
  data: AnalysisObjectType;
}

const FactionsPlayedPie: React.FC<IProps> = ({ data }) => {
  const { colorScheme } = useMantineColorScheme();
  const factionGames: Record<string, number> = {};
  const factionPercentage: Record<string, number> = {};

  let totalGames = 0;
  for (const faction of raceTypeArray) {
    let totalAmountOfGames = data[faction].wins + data[faction].losses;
    totalAmountOfGames = isNaN(totalAmountOfGames) ? 0 : totalAmountOfGames;
    factionGames[faction] = totalAmountOfGames;
    totalGames += totalAmountOfGames;
  }

  for (const faction of raceTypeArray) {
    factionPercentage[faction] = (factionGames[faction] / totalGames) * 100;
  }

  const chartData = [
    {
      id: "USForces",
      label: "US Forces",
      value: factionGames["american"],
      color: "hsl(45,22%,64%)",
      percent: factionPercentage["american"].toFixed(0),
    },
    {
      id: "British",
      label: "British",
      value: factionGames["british"],
      color: "hsl(203,38%,44%)",
      percent: factionPercentage["british"].toFixed(0),
    },
    {
      id: "DAK",
      label: "DAK",
      value: factionGames["dak"],
      color: "hsl(53,53%,46%)",
      percent: factionPercentage["dak"].toFixed(0),
    },
    {
      id: "Wehrmacht",
      label: "Wehrmacht",
      value: factionGames["german"],
      color: "hsl(219,9%,37%)",
      percent: factionPercentage["german"].toFixed(0),
    },
  ];

  return (
    <ResponsivePie
      // @ts-ignore
      data={chartData}
      margin={{ left: 35, bottom: 5, top: 5, right: 35 }}
      innerRadius={0.4}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      arcLabel={(e) => `${e.value} - ${e.data.percent}%`}
      // colors={{ datum: 'data.color' }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsThickness={2}
      arcLabelsSkipAngle={10}
      enableArcLinkLabels={true}
      arcLinkLabelsTextColor={{ from: "color", modifiers: [] }}
      arcLinkLabelsOffset={-17}
      arcLinkLabelsDiagonalLength={21}
      arcLinkLabelsStraightLength={7}
      theme={getNivoTooltipTheme(colorScheme)}
      // legends={[
      //   {
      //     anchor: "bottom-left",
      //     direction: "row",
      //     justify: false,
      //     translateX: 35,
      //     translateY: 5,
      //     itemsSpacing: 5,
      //     itemWidth: 72,
      //     itemHeight: 18,
      //     // itemTextColor: "#999",
      //     itemDirection: "left-to-right",
      //     itemOpacity: 1,
      //     symbolSize: 18,
      //     symbolShape: "circle",
      //     effects: [
      //       {
      //         on: "hover",
      //         style: {
      //           // itemTextColor: "#000",
      //         },
      //       },
      //     ],
      //   },
      // ]}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          size: 4,
          padding: 1,
          stagger: true,
        },
      ]}
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

export default FactionsPlayedPie;
