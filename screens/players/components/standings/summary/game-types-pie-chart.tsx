import { InternalStandings, leaderBoardTypeArray } from "../../../../../src/coh3/coh3-types";
import { ResponsivePie } from "@nivo/pie";
import { getNivoTooltipTheme } from "../../../../../components/charts/charts-components-utils";
import React from "react";
import { useMantineColorScheme } from "@mantine/core";

const GameTypesPieChart = ({ playerStandings }: { playerStandings: InternalStandings }) => {
  const { colorScheme } = useMantineColorScheme();

  type GameType = "1v1" | "2v2" | "3v3" | "4v4";
  type DataValues = Record<GameType, number>;

  const dataValues: DataValues = {
    "1v1": 0,
    "2v2": 0,
    "3v3": 0,
    "4v4": 0,
  };

  for (const faction of Object.values(playerStandings)) {
    leaderBoardTypeArray.forEach((gameType) => {
      const gameData = faction[gameType];
      if (gameData) {
        dataValues[gameType] += gameData.wins + gameData.losses;
      }
    });
  }

  const totalGames =
    dataValues["1v1"] + dataValues["2v2"] + dataValues["3v3"] + dataValues["4v4"];

  const chartData = [
    {
      id: "1v1",
      label: "1v1",
      value: dataValues["1v1"],
      // color: chartDataObjectsForTimeSeries.german.color,
      // get percent() {
      //   return (this.value / 100).toFixed(0)
      // }
      // color: "#652f1f",
      percent: ((dataValues["1v1"] / totalGames) * 100).toFixed(0),
    },
    {
      id: "2v2",
      label: "2v2",
      value: dataValues["2v2"],
      // color: chartDataObjectsForTimeSeries.dak.color,
      // color: "#b7a842",
      percent: ((dataValues["2v2"] / totalGames) * 100).toFixed(0),
    },
    {
      id: "3v3",
      label: "3v3",
      value: dataValues["3v3"],
      percent: ((dataValues["3v3"] / totalGames) * 100).toFixed(0),
      // color: chartDataObjectsForTimeSeries.british.color,
      // color: "#4b6a79",
    },
    {
      id: "4v4",
      label: "4v4",
      value: dataValues["4v4"],
      percent: ((dataValues["4v4"] / totalGames) * 100).toFixed(0),
      // color: chartDataObjectsForTimeSeries.american.color,
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
      arcLabel={(e) => `${e.label}`}
      // colors={{ datum: 'data.color' }}
      arcLinkLabelsSkipAngle={20}
      arcLinkLabelsThickness={2}
      arcLabelsSkipAngle={20}
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

export default GameTypesPieChart;
