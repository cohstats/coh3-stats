import { ResponsiveBar } from "@nivo/bar";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { StatsDataObject } from "../../../../../src/analysis-types";
import { getNivoTooltipTheme } from "../../../../../components/charts/charts-components-utils";
import { leaderBoardTypeArray, raceType } from "../../../../../src/coh3/coh3-types";
import { getFactionSlotsCount } from "../../../../../src/stats/combine-game-stats";
import {
  chartFactionOrder,
  ChartTooltip,
  factionColors,
  factionLabels,
  factionShortLabels,
  getLabelTextColor,
} from "./modes-chart-utils";

interface IProps {
  analysis: StatsDataObject;
}

/** 100% stacked bar - share of each faction within every game mode. */
const FactionPopularityPerModeBar: React.FC<IProps> = ({ analysis }) => {
  const { colorScheme } = useMantineColorScheme();

  const chartData = leaderBoardTypeArray.map((mode) => {
    const modeAnalysis = analysis[mode];
    const total = modeAnalysis ? getFactionSlotsCount(modeAnalysis) : 0;
    const row: Record<string, string | number> = { mode };

    for (const faction of chartFactionOrder) {
      const games = (modeAnalysis?.[faction]?.wins || 0) + (modeAnalysis?.[faction]?.losses || 0);
      row[faction] = total ? Number(((games / total) * 100).toFixed(1)) : 0;
      row[`${faction}_games`] = games;
    }

    return row;
  });

  return (
    <ResponsiveBar
      data={chartData}
      keys={chartFactionOrder}
      indexBy="mode"
      margin={{ top: 10, right: 15, bottom: 55, left: 40 }}
      padding={0.2}
      groupMode="stacked"
      valueScale={{ type: "linear", min: 0, max: 100 }}
      colors={({ id }) => factionColors[id as raceType]}
      label={(d) => `${Math.round(d.value || 0)}%`}
      labelSkipHeight={14}
      labelTextColor={(bar) => getLabelTextColor(bar.color)}
      theme={getNivoTooltipTheme(colorScheme)}
      tooltip={({ id, indexValue, value, data }) => (
        <ChartTooltip colorScheme={colorScheme}>
          <strong>
            {factionLabels[id as raceType]} {indexValue}
          </strong>
          : {value}% ({Number(data[`${id}_games`]).toLocaleString()} played)
        </ChartTooltip>
      )}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickValues: [0, 25, 50, 75, 100],
        format: (v) => `${v}%`,
      }}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
      }}
      legends={[
        {
          dataFrom: "keys",
          anchor: "bottom",
          direction: "row",
          translateX: 0,
          translateY: 50,
          itemsSpacing: 2,
          itemWidth: 62,
          itemHeight: 14,
          itemDirection: "left-to-right",
          symbolSize: 10,
          symbolShape: "circle",
          data: chartFactionOrder.map((faction) => ({
            id: faction,
            // The card is narrow, full names would overlap
            label: factionShortLabels[faction],
            color: factionColors[faction],
          })),
        },
      ]}
    />
  );
};

export default FactionPopularityPerModeBar;
