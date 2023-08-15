import { HeatMap } from "@nivo/heatmap";
import React from "react";
import { getNivoTooltipTheme } from "./chart-utils";
import { useMantineColorScheme } from "@mantine/core";

interface IProps {
  data: Array<Record<string, any>>;
  width: number;
  height: number;
}

const HeatMapChart: React.FC<IProps> = ({ data, width, height }) => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <HeatMap
      width={width}
      height={height}
      // @ts-ignore
      data={data}
      margin={{ top: 45, right: 0, bottom: 0, left: 70 }}
      forceSquare={true}
      theme={getNivoTooltipTheme(colorScheme)}
      axisTop={{
        tickSize: 5,
        tickPadding: 5,
        legend: "Allies factions",
        legendPosition: "middle",
        legendOffset: -35,
      }}
      axisRight={null}
      axisBottom={null}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Axis factions",
        legendPosition: "middle",
        legendOffset: -60,
      }}
      cellOpacity={1}
      cellBorderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
      labelTextColor={{ from: "color", modifiers: [["darker", 1.8]] }}
      minValue={0}
      maxValue={1}
      defs={[
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "rgba(0, 0, 0, 0.1)",
          rotation: -45,
          lineWidth: 4,
          spacing: 7,
        },
      ]}
      colors={{
        type: "diverging",
        scheme: "red_yellow_green",
        minValue: 0.35,
        maxValue: 0.65,
        divergeAt: 0.5,
      }}
      // fill={[{ id: "lines" }]}
      // animate={true}
      motionConfig="wobbly"
      motionStiffness={80}
      motionDamping={9}
      hoverTarget="cell"
      inactiveOpacity={0.6}
    />
  );
};

export default HeatMapChart;
