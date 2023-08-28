import { ResponsiveBar } from "@nivo/bar";
import { MapAnalysisObjectType } from "../../../../../src/analysis-types";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme, minMaxRange } from "../../../../charts/chart-utils";
import { getMapLocalizedName } from "../../../../../src/coh3/helpers";

// https://en.wikipedia.org/wiki/Root_mean_square
const _calculateRMS = (...args: number[]) => {
  return Math.sqrt(
    (1 / args.length) *
      args.reduce((sum, value) => {
        // x^2
        return sum + value * value;
      }, 0),
  );
};

const _calculateWinrateSingleFaction = ({
  wins,
  losses,
}: {
  wins: number;
  losses: number;
}): number => {
  const result = ((0.5 - wins / (wins + losses)) * -100).toFixed(2);

  return parseFloat(!isNaN(parseFloat(result)) ? result : "0");
};

interface IProps {
  data: MapAnalysisObjectType;
}

const MapsWinRateRMSChart: React.FC<IProps> = ({ data }) => {
  const { colorScheme } = useMantineColorScheme();

  const mapsData: { mapName: string; value: string }[] = [];

  for (const [mapName, mapData] of Object.entries(data)) {
    mapsData.push({
      mapName: getMapLocalizedName(mapName),
      value: _calculateRMS(
        _calculateWinrateSingleFaction(mapData.german),
        _calculateWinrateSingleFaction(mapData.dak),
        _calculateWinrateSingleFaction(mapData.british),
        _calculateWinrateSingleFaction(mapData.american),
      ).toFixed(2),
    });
  }

  const { max } = minMaxRange(mapsData);

  return (
    <ResponsiveBar
      margin={{ top: 10, right: 30, bottom: 40, left: 140 }}
      // @ts-ignore
      data={mapsData as data[] | undefined}
      layout={"horizontal"}
      keys={["value"]}
      indexBy="mapName"
      colors={{ scheme: "nivo" }}
      colorBy={"indexValue"}
      theme={getNivoTooltipTheme(colorScheme)}
      minValue={0}
      maxValue={max}
      labelSkipWidth={21}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legendPosition: "middle",
        legendOffset: -40,
      }}
      axisBottom={{
        legend: "Deviation from 50%",
        legendPosition: "middle",
        legendOffset: 30,
      }}
    />
  );
};

export default MapsWinRateRMSChart;
