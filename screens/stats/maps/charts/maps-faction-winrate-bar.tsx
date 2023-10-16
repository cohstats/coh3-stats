import { ResponsiveBar } from "@nivo/bar";
import { MapAnalysisObjectType } from "../../../../src/analysis-types";
import { useMantineColorScheme } from "@mantine/core";
import React from "react";
import { getNivoTooltipTheme } from "../../../../components/charts/charts-components-utils";
import { getMapLocalizedName } from "../../../../src/coh3/helpers";
import { minMaxRange } from "../../../../src/charts/utils";

const calculateWinrateSingleFaction = ({
  wins,
  losses,
}: {
  wins: number;
  losses: number;
}): string => {
  const result = ((0.5 - wins / (wins + losses)) * -100).toFixed(2);

  return !isNaN(parseFloat(result)) ? result : "0";
};

interface IProps {
  data: MapAnalysisObjectType;
}

const MapsFactionWinRateChart: React.FC<IProps> = ({ data }) => {
  const { colorScheme } = useMantineColorScheme();

  const mapsData: {
    mapName: string;
    Wehrmacht: string;
    DAK: string;
    British: string;
    "US Forces": string;
  }[] = [];

  for (const [key, value] of Object.entries(data).reverse()) {
    mapsData.push({
      mapName: getMapLocalizedName(key),
      "US Forces": calculateWinrateSingleFaction(value.american),
      British: calculateWinrateSingleFaction(value.british),
      Wehrmacht: calculateWinrateSingleFaction(value.german),
      DAK: calculateWinrateSingleFaction(value.dak),
    });
  }

  const findMinMaxArray = mapsData.map((item) => {
    return {
      value: Math.max(
        Math.abs(parseFloat(item.Wehrmacht)),
        Math.abs(parseFloat(item.DAK)),
        Math.abs(parseFloat(item.British)),
        Math.abs(parseFloat(item["US Forces"])),
      ),
    };
  });

  const { min, max } = minMaxRange(findMinMaxArray);

  return (
    <ResponsiveBar
      margin={{ top: 5, right: 120, bottom: 80, left: 35 }}
      // @ts-ignore
      data={mapsData as data[] | undefined}
      layout={"vertical"}
      groupMode={"grouped"}
      keys={["US Forces", "British", "Wehrmacht", "DAK"]}
      indexBy="mapName"
      colors={{ scheme: "nivo" }}
      // colorBy={"indexValue"}
      theme={getNivoTooltipTheme(colorScheme)}
      minValue={min}
      maxValue={max}
      animate={false}
      labelSkipHeight={10}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legendPosition: "middle",
        legendOffset: -40,
      }}
      axisBottom={{
        legendOffset: 30,
        tickRotation: -35,
      }}
      legends={[
        {
          dataFrom: "keys",
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 120,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: "left-to-right",
          itemOpacity: 0.85,
          symbolSize: 20,
          effects: [
            {
              on: "hover",
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

export default MapsFactionWinRateChart;
