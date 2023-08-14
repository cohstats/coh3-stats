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

  for (const faction of raceTypeArray) {
    let totalAmountOfGames = data[faction].wins + data[faction].losses;
    totalAmountOfGames = isNaN(totalAmountOfGames) ? 0 : totalAmountOfGames;
    factionGames[faction] = totalAmountOfGames;
  }

  const chartData = [
    {
      id: "USForces",
      label: "US Forces",
      value: factionGames["american"],
    },
    {
      id: "British",
      label: "British",
      value: factionGames["british"],
    },
    {
      id: "DAK",
      label: "DAK",
      value: factionGames["dak"],
    },
    {
      id: "Wehrmacht",
      label: "Wehrmacht",
      value: factionGames["german"],
    },
  ];

  return (
    <ResponsivePie
      // @ts-ignore
      data={chartData}
      margin={{ left: 10, bottom: 5, top: 5, right: 38 }}
      innerRadius={0.4}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="#333333"
      arcLinkLabelsThickness={2}
      arcLabelsSkipAngle={10}
      enableArcLinkLabels={false}
      theme={getNivoTooltipTheme(colorScheme)}
      legends={[
        {
          anchor: "bottom-left",
          direction: "row",
          justify: false,
          translateX: 35,
          translateY: 5,
          itemsSpacing: 5,
          itemWidth: 72,
          itemHeight: 18,
          // itemTextColor: "#999",
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 18,
          symbolShape: "circle",
          effects: [
            {
              on: "hover",
              style: {
                // itemTextColor: "#000",
              },
            },
          ],
        },
      ]}
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
      fill={[
        {
          match: {
            id: "British",
          },
          id: "dots",
        },
        {
          match: {
            id: "USForces",
          },
          id: "dots",
        },
      ]}
    />
  );
};

export default FactionsPlayedPie;
