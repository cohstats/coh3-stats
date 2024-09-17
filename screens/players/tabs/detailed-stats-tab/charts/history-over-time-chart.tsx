import { Card, Center, Group, Text, Title, useMantineColorScheme } from "@mantine/core";
import HelperIcon from "../../../../../components/icon/helper";
import { ResponsiveLine } from "@nivo/line";
import { getNivoTooltipTheme } from "../../../../../components/charts/charts-components-utils";
import React from "react";
import { HistoryOfLeaderBoardStat } from "../../../../../src/coh3/coh3-types";

const HistoryOverTimeChart = ({
  historyOfLeaderBoardStat,
  title,
  type,
  DisplayAsElement,
}: {
  historyOfLeaderBoardStat?: Array<HistoryOfLeaderBoardStat>;
  title: string;
  type: "rt" | "r";
  DisplayAsElement: React.ReactNode;
}) => {
  const { colorScheme } = useMantineColorScheme();

  let minInData = Infinity;
  let maxInData = -Infinity;

  const chartData = [
    {
      id: "Rating",
      data:
        (historyOfLeaderBoardStat || []).map((value) => {
          const selectedValue = value[type];

          minInData = Math.min(minInData, selectedValue);
          maxInData = Math.max(maxInData, selectedValue);

          return {
            x: value.date,
            y: selectedValue,
          };
        }) || [],
    },
  ];

  return (
    <Card p="md" shadow="sm" w={"100%"} withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify={"space-between"}>
          <Group>
            <Title order={3}>{title}</Title>
            {type === "r" && (
              <HelperIcon
                width={360}
                text={
                  "This chart is updated only when player plays a game. Therefore it's not accurate representation of the players rank, as rank is changing even when player is not playing."
                }
              />
            )}
          </Group>
          <Group>
            <Text fw={500}>Display last</Text>
            {DisplayAsElement}
          </Group>
        </Group>
      </Card.Section>
      <Card.Section h={300} p="xs">
        {chartData[0].data?.length ? (
          <ResponsiveLine
            data={chartData}
            margin={{ top: 25, right: 50, bottom: 30, left: 50 }}
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
              min: Math.max(minInData - (maxInData - minInData) * 0.2, 1),
              max: Math.min(maxInData + (maxInData - minInData) * 0.2, 3000),
              reverse: type === "r",
            }}
            // yFormat=" >-.2f"
            axisTop={null}
            axisRight={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: type === "r" ? "Rating" : "ELO",
              legendOffset: 45,
              legendPosition: "middle",
              format: (e) => (Number.isInteger(e) ? e : ""),
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
              legend: type === "r" ? "Rating" : "ELO",
              legendOffset: -45,
              legendPosition: "middle",
              format: (e) => (Number.isInteger(e) ? e : ""),
            }}
            curve="monotoneX"
            colors={{ scheme: "category10" }}
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
        ) : (
          <Center maw={400} h={250} mx="auto">
            <h3>No data for the selected game type</h3>
          </Center>
        )}
      </Card.Section>
    </Card>
  );
};

export default HistoryOverTimeChart;
