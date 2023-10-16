import { ResponsiveBar } from "@nivo/bar";
import { AnalysisObjectType, MapAnalysisObjectType } from "../../../../src/analysis-types";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme } from "../../../../components/charts/charts-components-utils";
import { getMapLocalizedName } from "../../../../src/coh3/helpers";
import { minMaxRange } from "../../../../src/charts/utils";

/**
 * Returns 0.5 - axis winrate // which means positive numbers are
 * @param singleMapData
 */
const _calculateSingleMapWinRateDiff = (singleMapData: AnalysisObjectType) => {
  const axisWins = singleMapData.german.wins + singleMapData.dak.wins;
  const axisLoss = singleMapData.german.losses + singleMapData.dak.losses;

  const alliesWins = singleMapData.british.wins + singleMapData.american.wins;
  const alliesLoss = singleMapData.british.losses + singleMapData.american.losses;

  if (axisWins !== alliesLoss) {
    console.warn(`We have more wins than losses! Data issue ${axisWins} != ${alliesLoss}`);
  }
  if (axisLoss !== alliesWins) {
    console.warn(`We have more wins than losses! Data issue ${axisLoss} != ${alliesWins}`);
  }

  return ((0.5 - axisWins / (axisWins + axisLoss)) * -100).toFixed(1);
};

interface IProps {
  data: MapAnalysisObjectType;
}

const MapsWinRateDiffChart: React.FC<IProps> = ({ data }) => {
  const { colorScheme } = useMantineColorScheme();

  const mapsData: { mapName: string; value: string }[] = [];

  for (const [mapName, mapData] of Object.entries(data)) {
    mapsData.push({
      mapName: getMapLocalizedName(mapName),
      value: _calculateSingleMapWinRateDiff(mapData),
    });
  }

  const { min, max } = minMaxRange(mapsData);

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
      minValue={min}
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
        legend: "Allies ... ... % ... ...  Axis",
        legendPosition: "middle",
        legendOffset: 30,
      }}
    />
  );
};

export default MapsWinRateDiffChart;
