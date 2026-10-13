import { ResponsiveBar } from "@nivo/bar";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { StatsDataObject } from "../../../../../src/analysis-types";
import { getNivoTooltipTheme } from "../../../../../components/charts/charts-components-utils";
import { leaderBoardTypeArray } from "../../../../../src/coh3/coh3-types";
import {
  gameStatsModeType,
  getAxisAlliesWinRates,
} from "../../../../../src/stats/combine-game-stats";
import { ChartTooltip, getLabelTextColor } from "./modes-chart-utils";

interface IProps {
  analysis: StatsDataObject;
}

type sideType = "axis" | "allies";

// Feldgrau and olive drab - kept away from the faction colors, the sides mix 2 factions each
const sideColors: Record<sideType, string> = {
  axis: "#7D8590",
  allies: "#6B8E23",
};

const sideLabels: Record<sideType, string> = {
  axis: "Axis",
  allies: "Allies",
};

const modeRowLabel = (mode: gameStatsModeType) => (mode === "all" ? "All" : mode);

/** 100% stacked horizontal bars - Axis vs Allies winrate in every mode and in all of them. */
const AxisVsAlliesBar: React.FC<IProps> = ({ analysis }) => {
  const { colorScheme } = useMantineColorScheme();

  const winRates = getAxisAlliesWinRates(analysis);
  // Horizontal bars are drawn from the bottom - pass them reversed so 1v1 is on the top and All at the bottom
  const modes: Array<gameStatsModeType> = [...leaderBoardTypeArray, "all"];
  const chartData = modes.reverse().map((mode) => ({
    mode: modeRowLabel(mode),
    axis: Number(winRates[mode].axis.toFixed(1)),
    allies: Number(winRates[mode].allies.toFixed(1)),
    games: winRates[mode].games,
  }));

  return (
    <ResponsiveBar
      data={chartData}
      keys={["axis", "allies"]}
      indexBy="mode"
      layout="horizontal"
      margin={{ top: 10, right: 15, bottom: 55, left: 40 }}
      padding={0.25}
      groupMode="stacked"
      valueScale={{ type: "linear", min: 0, max: 100 }}
      colors={({ id }) => sideColors[id as sideType]}
      label={(d) => `${Number(d.value).toFixed(1)}%`}
      labelTextColor={(bar) => getLabelTextColor(bar.color)}
      theme={getNivoTooltipTheme(colorScheme)}
      markers={[
        {
          axis: "x",
          value: 50,
          lineStyle: {
            stroke: colorScheme === "dark" ? "#dddddd" : "#333333",
            strokeWidth: 1.5,
            strokeDasharray: "4 3",
          },
        },
      ]}
      tooltip={({ id, indexValue, value, data }) => (
        <ChartTooltip colorScheme={colorScheme}>
          <strong>
            {sideLabels[id as sideType]} {indexValue}
          </strong>
          : {value}% winrate ({Number(data.games).toLocaleString()} games)
        </ChartTooltip>
      )}
      axisLeft={{
        tickSize: 0,
        tickPadding: 8,
      }}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickValues: [0, 25, 50, 75, 100],
        format: (v) => `${v}%`,
      }}
      legends={[
        {
          dataFrom: "keys",
          anchor: "bottom",
          direction: "row",
          translateX: 0,
          translateY: 50,
          itemsSpacing: 10,
          itemWidth: 60,
          itemHeight: 14,
          itemDirection: "left-to-right",
          symbolSize: 12,
          symbolShape: "circle",
          data: (["axis", "allies"] as Array<sideType>).map((side) => ({
            id: side,
            label: sideLabels[side],
            color: sideColors[side],
          })),
        },
      ]}
    />
  );
};

export default AxisVsAlliesBar;
