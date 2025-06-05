import { Card, Center, Group, Text, Title, useMantineColorScheme } from "@mantine/core";
import { ResponsiveLine } from "@nivo/line";
import { getNivoTooltipTheme } from "../../../../../components/charts/charts-components-utils";
import React from "react";
import { HistoryOfLeaderBoardStat } from "../../../../../src/coh3/coh3-types";

const WinLossTimeChart = ({
  historyOfLeaderBoardStat,
  title,
  DisplayAsElement,
}: {
  historyOfLeaderBoardStat?: Array<HistoryOfLeaderBoardStat>;
  title: string;
  DisplayAsElement: React.ReactNode;
}) => {
  const { colorScheme } = useMantineColorScheme();

  const historyDataWins = [];
  const historyDataLosses = [];

  if (historyOfLeaderBoardStat?.length) {
    for (let i = 0; i < historyOfLeaderBoardStat.length; i++) {
      if (i == 0) continue;

      const dateWins = historyOfLeaderBoardStat[i].w - historyOfLeaderBoardStat[i - 1].w;
      const dateLosses = historyOfLeaderBoardStat[i].l - historyOfLeaderBoardStat[i - 1].l;

      historyDataWins.push({
        x: historyOfLeaderBoardStat[i].date,
        y: dateWins,
      });

      historyDataLosses.push({
        x: historyOfLeaderBoardStat[i].date,
        y: -dateLosses,
      });
    }
  }

  //
  const chartData = [
    {
      id: "Wins",
      data: historyDataWins,
      color: "#60BD68",
    },
    {
      id: "Losses",
      data: historyDataLosses,
      color: "#F15854",
    },
  ];

  return (
    <Card p="md" shadow="sm" w={"100%"} withBorder style={{ overflow: "visible" }}>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify={"space-between"}>
          <Title order={3}>{title}</Title>
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
            margin={{ top: 25, right: 50, bottom: 50, left: 50 }}
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
              min: "auto",
              max: "auto",
              // min: Math.max(minInData - (maxInData - minInData) * 0.2, 1),
              // max: Math.min(maxInData +  (maxInData - minInData) * 0.2, 3000),
            }}
            enableArea={true}
            axisTop={null}
            axisRight={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Losses / Wins",
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
              legend: "Losses / Wins",
              legendOffset: -45,
              legendPosition: "middle",
              format: (e) => (Number.isInteger(e) ? e : ""),
            }}
            curve="monotoneX"
            // colors={{ scheme: "category10" }}
            colors={{ datum: "color" }}
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
            // markers={[
            //   {
            //     axis: 'y',
            //     lineStyle: {
            //       stroke: '#000000',
            //       strokeWidth: 1
            //     },
            //     value: 0
            //   }
            // ]}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                toggleSerie: true,
                translateY: 50,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemBackground: "rgba(0, 0, 0, .03)",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
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

export default WinLossTimeChart;
