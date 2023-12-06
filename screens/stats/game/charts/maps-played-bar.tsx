import { ResponsiveBar } from "@nivo/bar";
import { AnalysisObjectType } from "../../../../src/analysis-types";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme } from "../../../../components/charts/charts-components-utils";
import { sortArrayOfObjectsByTheirPropertyValue } from "../../../../src/utils";
import { isOfficialMap, maps } from "../../../../src/coh3/coh3-data";

interface IProps {
  data: AnalysisObjectType;
}

const _getMapName = (mapName: string) => {
  if (!isOfficialMap(mapName)) {
    return mapName;
  } else {
    return maps[mapName].name;
  }
};

const MapsPlayedBarChart: React.FC<IProps> = ({ data }) => {
  const { colorScheme } = useMantineColorScheme();
  const maps = data.maps;

  const mapsDataUnsorted: { mapName: string; value: number }[] = Object.keys(maps).map(
    (mapName) => {
      return {
        mapName: _getMapName(mapName),
        value: maps[mapName],
      };
    },
  );

  const sortedMapData = sortArrayOfObjectsByTheirPropertyValue(
    mapsDataUnsorted as unknown as Array<Record<string, string>>,
  );

  return (
    <ResponsiveBar
      margin={{ top: 10, right: 30, bottom: 50, left: 140 }}
      // @ts-ignore
      data={sortedMapData as data[] | undefined}
      layout={"horizontal"}
      keys={["value"]}
      indexBy="mapName"
      colors={{ scheme: "nivo" }}
      colorBy={"indexValue"}
      theme={getNivoTooltipTheme(colorScheme)}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        legend: "Number of games",
        tickRotation: -55,
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
