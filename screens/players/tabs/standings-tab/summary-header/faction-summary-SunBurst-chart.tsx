import { ResponsiveSunburst } from "@nivo/sunburst";
import { InternalStandings } from "../../../../../src/coh3/coh3-types";
import {
  chartDataObjectsForTimeSeries,
  getNivoTooltipTheme,
} from "../../../../../components/charts/charts-components-utils";
import { useMantineColorScheme } from "@mantine/core";

const FactionSummarySunBurstChart = ({
  playerStandings,
}: {
  playerStandings: InternalStandings;
}) => {
  const { colorScheme } = useMantineColorScheme();

  const chartData = {
    name: "factionsModes",
    children: [
      {
        name: "Wehrmacht",
        short: "Wehr",
        color: chartDataObjectsForTimeSeries.german.color,
        children: Object.entries(playerStandings.german).map(([gameType, gameTypeData]) => {
          return {
            name: `Wehrmacht - ${gameType}`,
            data: (gameTypeData?.wins || 0) + (gameTypeData?.losses || 0),
            // key: `${faction}-${gameType}`
            color: chartDataObjectsForTimeSeries.german.color,
          };
        }),
      },
      {
        name: "DAK",
        short: "DAK",
        color: chartDataObjectsForTimeSeries.dak.color,
        children: Object.entries(playerStandings.dak).map(([gameType, gameTypeData]) => {
          return {
            name: `DAK - ${gameType}`,
            data: (gameTypeData?.wins || 0) + (gameTypeData?.losses || 0),
            // key: `${faction}-${gameType}`
            color: chartDataObjectsForTimeSeries.dak.color,
          };
        }),
      },
      {
        name: "British",
        short: "Brit",
        color: chartDataObjectsForTimeSeries.british.color,
        children: Object.entries(playerStandings.british).map(([gameType, gameTypeData]) => {
          return {
            name: `British - ${gameType}`,
            data: (gameTypeData?.wins || 0) + (gameTypeData?.losses || 0),
            // key: `${faction}-${gameType}`
            color: chartDataObjectsForTimeSeries.british.color,
          };
        }),
      },
      {
        name: "US Forces",
        short: "USF",
        color: chartDataObjectsForTimeSeries.american.color,
        children: Object.entries(playerStandings.american).map(([gameType, gameTypeData]) => {
          return {
            name: `USF - ${gameType}`,
            data: (gameTypeData?.wins || 0) + (gameTypeData?.losses || 0),
            // key: `${faction}-${gameType}`
            color: chartDataObjectsForTimeSeries.american.color,
          };
        }),
      },
    ],
  };

  return (
    <ResponsiveSunburst
      data={chartData}
      margin={{ top: 15, right: 10, bottom: 15, left: 10 }}
      id="name"
      value="data"
      // key="name"
      cornerRadius={2}
      borderColor={{ theme: "background" }}
      borderWidth={1}
      // @ts-ignore
      colors={(d) => d.data.color}
      childColor={{
        from: "color",
        modifiers: [["brighter", 0.1]],
      }}
      enableArcLabels={true}
      arcLabelsSkipAngle={20}
      arcLabelsRadiusOffset={0.8}
      // arcLabelsTextColor={{
      //   from: 'color',
      //   modifiers: [
      //     [
      //       'darker',
      //       1.4
      //     ]
      //   ]
      // }}

      theme={getNivoTooltipTheme(colorScheme)}
      arcLabel={(e) => {
        if (e.depth === 1) {
          // @ts-ignore
          return `${e.data.short}`;
        } else {
          return "";
        }
      }}
      animate={false}
      // motionConfig="gentle"
      // onClick={function noRefCheck(){}}
      // transitionMode="pushIn"
    />
  );
};

export default FactionSummarySunBurstChart;
