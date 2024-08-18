import { ProcessedCOHPlayerStats } from "../../../../src/coh3/coh3-types";
import { useMantineColorScheme, Text, Group } from "@mantine/core";
import { getNivoTooltipTheme } from "../../../../components/charts/charts-components-utils";
import { ResponsiveBar } from "@nivo/bar";
import React from "react";
import { calculateWinRate } from "../../../../src/utils";

const ActivityByHour = ({ playerStatsData }: { playerStatsData: ProcessedCOHPlayerStats }) => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <ResponsiveBar
      margin={{ top: 10, right: 30, bottom: 40, left: 55 }}
      // @ts-ignore
      data={playerStatsData.activityByHour as data[] | undefined}
      layout={"vertical"}
      keys={["value"]}
      indexBy="hour"
      theme={getNivoTooltipTheme(colorScheme)}
      // colors={{ scheme: 'blues' }}
      // colorBy={"indexValue"}
      minValue={0}
      maxValue={"auto"}
      innerPadding={2}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legendPosition: "middle",
        legendOffset: -50,
        legend: "Amount of games",
      }}
      axisBottom={{
        legend: "Hour of the day",
        legendPosition: "middle",
        legendOffset: 30,
      }}
      label={({ data }) => {
        if (data.value === undefined) return "";
        return `${Math.round(calculateWinRate(data.wins, data.losses))}%`;
      }}
      // @ts-ignore
      tooltip={({
        value,
        data,
      }: {
        value: string;
        // Not sure why it's undefined, must be a bug in Nivo
        data: { wins: number | undefined; losses: number | undefined };
      }) => {
        if (value === undefined) return null;
        const toolTipBackground = colorScheme === "light" ? "#eeeeee" : "#25262B";
        return (
          <div
            style={{
              backgroundColor: toolTipBackground,
              padding: "5px",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            Total: {(data.wins || 0) + (data.losses || 0)} games
            <Group gap={"xs"}>
              Record:
              <Group gap={"xs"}>
                <Text span c={"green"}>
                  {" "}
                  {data.wins || 0} W
                </Text>{" "}
                -{" "}
                <Text span c={"red"}>
                  {" "}
                  {data.losses || 0} L
                </Text>
              </Group>
            </Group>
            WinRate: {calculateWinRate(data.wins || 0, data.losses || 0).toFixed(1)}%
          </div>
        );
      }}
    />
  );
};

export default ActivityByHour;
