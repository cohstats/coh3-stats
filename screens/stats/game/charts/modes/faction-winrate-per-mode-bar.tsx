import { ResponsiveBar } from "@nivo/bar";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { StatsDataObject } from "../../../../../src/analysis-types";
import { getNivoTooltipTheme } from "../../../../../components/charts/charts-components-utils";
import {
  leaderBoardType,
  leaderBoardTypeArray,
  raceType,
} from "../../../../../src/coh3/coh3-types";
import { modeColors } from "../../../../../src/stats/combine-game-stats";
import {
  chartFactionOrder,
  ChartTooltip,
  factionLabels,
  getLabelTextColor,
} from "./modes-chart-utils";

interface IProps {
  analysis: StatsDataObject;
}

/**
 * Grouped bars - winrate of every faction in each game mode.
 * The bars grow up / down from the 50% line, so the value plotted is `winRate - 50`.
 */
const FactionWinRatePerModeBar: React.FC<IProps> = ({ analysis }) => {
  const { colorScheme } = useMantineColorScheme();

  let maxDeviation = 0;

  const chartData = chartFactionOrder.map((faction) => {
    const row: Record<string, string | number> = { faction: factionLabels[faction], id: faction };

    for (const mode of leaderBoardTypeArray) {
      const { wins = 0, losses = 0 } = analysis[mode]?.[faction] || {};
      const games = wins + losses;
      const winRate = games ? (wins / games) * 100 : 50;
      const deviation = Number((winRate - 50).toFixed(2));

      maxDeviation = Math.max(maxDeviation, Math.abs(deviation));
      row[mode] = deviation;
      row[`${mode}_winRate`] = winRate.toFixed(1);
      row[`${mode}_games`] = games;
    }

    return row;
  });

  // Symmetric range around the 50% line, at least +-5% so small differences don't look huge.
  const range = Math.max(5, Math.ceil(maxDeviation + 1));

  return (
    <ResponsiveBar
      data={chartData}
      keys={[...leaderBoardTypeArray]}
      indexBy="faction"
      groupMode="grouped"
      margin={{ top: 15, right: 20, bottom: 60, left: 55 }}
      padding={0.2}
      innerPadding={2}
      valueScale={{ type: "linear", min: -range, max: range }}
      colors={({ id }) => modeColors[id as leaderBoardType]}
      label={(d) => `${d.data[`${d.id}_winRate`]}`}
      labelSkipHeight={14}
      labelTextColor={(bar) => getLabelTextColor(bar.color)}
      theme={getNivoTooltipTheme(colorScheme)}
      markers={[
        {
          axis: "y",
          value: 0,
          lineStyle: {
            stroke: colorScheme === "dark" ? "#8d9cab" : "#555555",
            strokeWidth: 1.5,
          },
        },
      ]}
      tooltip={({ id, data }) => (
        <ChartTooltip colorScheme={colorScheme}>
          <strong>
            {factionLabels[data.id as raceType]} {id}
          </strong>
          : {data[`${id}_winRate`]}% winrate ({Number(data[`${id}_games`]).toLocaleString()}{" "}
          played)
        </ChartTooltip>
      )}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        format: (v) => `${50 + Number(v)}%`,
        legend: "Winrate",
        legendPosition: "middle",
        legendOffset: -45,
      }}
      axisBottom={{
        tickSize: 0,
        tickPadding: 8,
      }}
      legends={[
        {
          dataFrom: "keys",
          anchor: "bottom",
          direction: "row",
          translateX: 0,
          translateY: 55,
          itemsSpacing: 4,
          itemWidth: 60,
          itemHeight: 14,
          itemDirection: "left-to-right",
          symbolSize: 12,
          symbolShape: "circle",
        },
      ]}
    />
  );
};

export default FactionWinRatePerModeBar;
