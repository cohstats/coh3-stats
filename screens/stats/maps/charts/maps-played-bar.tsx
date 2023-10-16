import { ResponsiveBar } from "@nivo/bar";
import { MapAnalysisObjectType } from "../../../../src/analysis-types";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme } from "../../../../components/charts/charts-components-utils";
import { getMapLocalizedName } from "../../../../src/coh3/helpers";

interface IProps {
  data: MapAnalysisObjectType;
}

const MapsPlayedBarChart: React.FC<IProps> = ({ data }) => {
  const { colorScheme } = useMantineColorScheme();

  const mapsData: { mapName: string; games: number }[] = [];

  for (const [mapName, mapData] of Object.entries(data)) {
    mapsData.push({
      mapName: getMapLocalizedName(mapName),
      games: mapData.matchCount,
    });
  }

  return (
    <ResponsiveBar
      margin={{ top: 10, right: 30, bottom: 48, left: 140 }}
      // @ts-ignore
      data={mapsData as data[] | undefined}
      layout={"horizontal"}
      keys={["games"]}
      indexBy="mapName"
      colors={{ scheme: "nivo" }}
      colorBy={"indexValue"}
      theme={getNivoTooltipTheme(colorScheme)}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        legend: "Number of games",
        tickRotation: -45,
        legendPosition: "middle",
        legendOffset: 38,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legendPosition: "middle",
        legendOffset: -40,
      }}
    />
  );
};

export default MapsPlayedBarChart;
