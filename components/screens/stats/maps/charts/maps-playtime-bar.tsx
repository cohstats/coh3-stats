import { ResponsiveBar } from "@nivo/bar";
import { MapAnalysisObjectType } from "../../../../../src/analysis-types";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme } from "../../../../charts/chart-utils";
import { getMapLocalizedName } from "../../../../../src/coh3/helpers";

interface IProps {
  data: MapAnalysisObjectType;
  average?: boolean;
}

const MapsPlayTimeBarChart: React.FC<IProps> = ({ data, average = true }) => {
  const { colorScheme } = useMantineColorScheme();

  const mapsData: { mapName: string; minutes: number | string }[] = [];

  for (const [mapCode, mapData] of Object.entries(data)) {
    const averageTime = average
      ? (mapData.gameTime / mapData.matchCount / 60).toFixed(2)
      : mapData.gameTime;

    mapsData.push({
      mapName: getMapLocalizedName(mapCode),
      minutes: averageTime,
    });
  }

  return (
    <ResponsiveBar
      margin={{ top: 10, right: 35, bottom: 80, left: 60 }}
      // @ts-ignore
      data={mapsData.reverse() as data[] | undefined}
      layout={"vertical"}
      keys={["minutes"]}
      indexBy="mapName"
      colors={{ scheme: "nivo" }}
      colorBy={"indexValue"}
      theme={getNivoTooltipTheme(colorScheme)}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -35,
        legendPosition: "middle",
        legendOffset: 38,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legendPosition: "middle",
        legend: "Minutes",
        legendOffset: -40,
      }}
    />
  );
};

export default MapsPlayTimeBarChart;
