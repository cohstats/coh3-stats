import { ProcessedCOHPlayerStats } from "../../../../src/coh3/coh3-types";
import { useMantineColorScheme, Text, Group } from "@mantine/core";
import { getNivoTooltipTheme } from "../../../../components/charts/charts-components-utils";
import { ResponsiveBar } from "@nivo/bar";
import React, { useMemo } from "react";
import { calculateWinRate } from "../../../../src/utils";

interface ActivityByHourProps {
  playerStatsData: ProcessedCOHPlayerStats;
  timezoneOffset?: number;
}

const ActivityByHour = ({ playerStatsData, timezoneOffset = 0 }: ActivityByHourProps) => {
  const { colorScheme } = useMantineColorScheme();

  // Adjust the hour data based on the timezone offset
  const adjustedHourData = useMemo(() => {
    if (!playerStatsData.activityByHour || timezoneOffset === 0) {
      return playerStatsData.activityByHour;
    }

    // Create a new array with adjusted hours
    return playerStatsData.activityByHour
      .map((hourData) => {
        // Convert hour string to number
        let hour = parseInt(hourData.hour);

        // Apply timezone offset - handle fractional offsets
        const integerOffset = Math.floor(timezoneOffset);
        const fractionalOffset = timezoneOffset % 1;

        // First apply the integer part of the offset
        hour = (hour + integerOffset + 24) % 24;

        // For fractional offsets, we need special handling
        // For example, for a half-hour offset (0.5), we need to combine data from two adjacent hours
        // This is a simplification - we're just shifting the hour without redistributing the data
        if (fractionalOffset !== 0) {
          // For positive fractional offsets, we round up
          // For negative fractional offsets, we round down
          if (fractionalOffset > 0) {
            hour = (hour + 1) % 24;
          }
        }

        // Return new object with adjusted hour
        return {
          ...hourData,
          hour: hour.toString(),
        };
      })
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour)); // Sort by hour to maintain order
  }, [playerStatsData.activityByHour, timezoneOffset]);

  return (
    <ResponsiveBar
      margin={{ top: 10, right: 30, bottom: 40, left: 55 }}
      // @ts-ignore
      data={adjustedHourData as data[] | undefined}
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
