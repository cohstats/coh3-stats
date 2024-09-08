import { Card, Group, Text, Title, useMantineColorScheme } from "@mantine/core";
import HelperIcon from "../../../../../components/icon/helper";
import { ResponsiveLine } from "@nivo/line";
import { getNivoTooltipTheme } from "../../../../../components/charts/charts-components-utils";
import React from "react";
import { HistoricLeaderBoardStat } from "../../../../../src/coh3/coh3-types";

const HistoryOverTimeChart = ({
  leaderboardStats,
}: {
  leaderboardStats: HistoricLeaderBoardStat;
}) => {
  const { colorScheme } = useMantineColorScheme();

  let minInData = Infinity;
  let maxInData = -Infinity;

  const chartData = [
    {
      id: "Rating",
      data: leaderboardStats?.history.map((value) => {
        const selectedValue = value.rt;

        minInData = Math.min(minInData, selectedValue);
        maxInData = Math.max(maxInData, selectedValue);

        return {
          x: value.date,
          y: selectedValue,
        };
      }),
    },
  ];

  return (
    <Card p="md" shadow="sm" w={1265} withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify={"space-between"}>
          <Group>
            <Title order={3}>chart title</Title>
            <HelperIcon
              width={360}
              text={
                "Winrate for each day can fluctuate a lot because there isn't enough games. Switch to weeks to see a more accurate representation."
              }
            />
          </Group>
          <Group>
            <Text fw={500}>Display as</Text>
            {/*<Select*/}
            {/*  style={{ width: 120, marginRight: 30 }}*/}
            {/*  // label="Display as"*/}
            {/*  value={displayBy}*/}
            {/*  onChange={(value) => setDisplayBy(value as "days" | "weeks")}*/}
            {/*  data={[*/}
            {/*    { value: "days", label: "Days" },*/}
            {/*    { value: "weeks", label: "Weeks" },*/}
            {/*  ]}*/}
            {/*  withCheckIcon={false}*/}
            {/*  allowDeselect={false}*/}
            {/*/>*/}
          </Group>
        </Group>
      </Card.Section>
      <Card.Section h={350} p="xs">
        <ResponsiveLine
          data={chartData}
          margin={{ top: 25, right: 50, bottom: 70, left: 50 }}
          xFormat="time: %a - %Y-%m-%d"
          // tooltip={(data) => {
          //   return <>{data.point.data.xFormatted} and {data.point.data.yFormatted}</>
          // }}
          xScale={{
            format: "%Y-%m-%d",
            precision: "day",
            type: "time",
            useUTC: false,
          }}
          yScale={{
            type: "linear",
            min: Math.max(minInData - 100, 0),
            max: "auto",
            // reverse: true
          }}
          // yFormat=" >-.2f"
          axisTop={null}
          axisRight={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Win Rate",
            legendOffset: 45,
            legendPosition: "middle",
          }}
          axisBottom={{
            format: "%a - %b %d",
            // legend: 'time scale',
            legendOffset: 36,
            legendPosition: "middle",
            // tickValues: chartConfig?.tickValues,
            // legend: chartConfig?.bottomAxisLegend,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Win Rate",
            legendOffset: -45,
            legendPosition: "middle",
          }}
          curve="monotoneX"
          // colors={{ datum: "color" }}
          //colors={{ scheme: "category10" }}
          enablePoints={true}
          pointSize={8}
          // pointColor={{ theme: "background" }}
          // pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          enableGridX={true}
          enableCrosshair={true}
          // Helps site performance
          animate={false}
          theme={getNivoTooltipTheme(colorScheme)}
          // legends={[
          //   {
          //     anchor: "bottom",
          //     direction: "row",
          //     justify: false,
          //     translateX: -1,
          //     translateY: 65,
          //     itemsSpacing: 0,
          //     itemDirection: "left-to-right",
          //     itemWidth: 80,
          //     itemHeight: 20,
          //     itemOpacity: 0.75,
          //     symbolSize: 12,
          //     symbolShape: "circle",
          //     symbolBorderColor: "rgba(0, 0, 0, .5)",
          //     effects: [
          //       {
          //         on: "hover",
          //         style: {
          //           itemBackground: "rgba(0, 0, 0, .03)",
          //           itemOpacity: 1,
          //         },
          //       },
          //     ],
          //   },
          // ]}
        />
      </Card.Section>
    </Card>
  );
};

export default HistoryOverTimeChart;
