import { ResponsivePie } from "@nivo/pie";

import { AnalysisObjectType } from "../../../../../src/analysis-types";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme } from "../../../../charts/chart-utils";
import { raceTypeArray } from "../../../../../src/coh3/coh3-types";

interface IProps {
  data: AnalysisObjectType;
}

// export interface ArcLinkLabelProps<Datum extends any> {
//     datum: Datum
//     label: string
//     style: {
//         path: Interpolation<string>
//         thickness: number
//         textPosition: Interpolation<string>
//         textAnchor: Interpolation<'start' | 'end'>
//         linkColor: SpringValue<string>
//         opacity: SpringValue<number>
//         textColor: SpringValue<string>
//     }
// }

// export const ArcLinkLabel = ({
//                                                                      label,
//                                                                      style,
//                                                                  }: any) => {
//     const theme = useTheme()
//
//     const factionId = label === "US Forces" ? "american" : label === "British" ? "british" : label === "DAK" ? "dak" : "german";
//
//     console.log("style", JSON.stringify(style, null, 2));
//
//     return (
//         <animated.g opacity={style.opacity}>
//             <animated.path
//                 fill="none"
//                 stroke={style.linkColor}
//                 strokeWidth={style.thickness}
//                 d={style.path}
//             />
//             <animated.image
//                 source="https://example.com/image.png"
//                 width={100}
//                 height={100}
//                 style={{
//                     ...theme.labels.text,
//                     fill: style.textColor,
//                 }}
//             />
//         </animated.g>
//     )
// }

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
      color: "#5f5d2c",
      percent: factionPercentage["american"].toFixed(0),
    },
    {
      id: "British",
      label: "British",
      value: factionGames["british"],
      color: "#4b6a79",
      percent: factionPercentage["british"].toFixed(0),
    },
    {
      id: "DAK",
      label: "DAK",
      value: factionGames["dak"],
      color: "#b7a842",
      percent: factionPercentage["dak"].toFixed(0),
    },
    {
      id: "Wehrmacht",
      label: "Wehrmacht",
      value: factionGames["german"],
      color: "#652f1f",
      percent: factionPercentage["german"].toFixed(0),
    },
  ];

  return (
    <>
      <ResponsivePie
        // @ts-ignore
        data={chartData}
        margin={{ left: 45, bottom: 15, top: 5, right: 35 }}
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
        enableArcLinkLabels={false}
        // arcLinkLabelComponent={ArcLinkLabel}
        arcLinkLabelsTextColor={{ from: "color", modifiers: [] }}
        arcLinkLabelsOffset={-17}
        arcLinkLabelsDiagonalLength={21}
        arcLinkLabelsStraightLength={7}
        theme={getNivoTooltipTheme(colorScheme)}
        legends={[
          {
            anchor: "bottom-left",
            direction: "column",
            // justify: false,
            translateX: -40,
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
    </>
  );
};

export default FactionsPlayedPie;
