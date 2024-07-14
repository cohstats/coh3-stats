import React, { useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { Group, Select, useMantineColorScheme } from "@mantine/core";
import { getNivoTooltipTheme } from "../charts-components-utils";
import { generateWeeklyAverages, getMinMaxValues } from "../../../src/charts/utils";

const PlayersLineChart = ({ data }: { data: Array<any> }) => {
  const { colorScheme } = useMantineColorScheme();
  const [range, setRange] = useState<string>("month");

  const getChartConfig = (amount = "month") => {
    switch (amount) {
      case "month":
        return {
          data: data.slice(Math.max(data.length - 30, 0), data.length),
          tickValues: "every 2 days",
          bottomAxisLegend: "Days",
        };
      case "3months":
        return {
          data: data.slice(Math.max(data.length - 90, 0), data.length),
          tickValues: "every 5 days",
          bottomAxisLegend: "Days",
        };
      case "6months":
        return {
          data: generateWeeklyAverages(data.slice(Math.max(data.length - 180, 0), data.length)),
          tickValues: "every 10 days",
          bottomAxisLegend: "Weeks",
        };
      case "12months":
        return {
          data: generateWeeklyAverages(data.slice(Math.max(data.length - 360, 0), data.length)),
          tickValues: 7,
          bottomAxisLegend: "Weeks",
        };
      case "all":
        return {
          data: generateWeeklyAverages(data),
          tickValues: 5,
          bottomAxisLegend: "Weeks",
        };
    }
  };

  const chartConfig = getChartConfig(range);

  const chartData = [
    {
      id: "players",
      data: chartConfig?.data || [],
    },
  ];
  const { minValue, maxValue } = getMinMaxValues(chartConfig?.data || []);

  return (
    <div>
      <div style={{ maxWidth: 960, height: 350 }}>
        <ResponsiveLine
          data={chartData}
          margin={{ top: 25, right: 20, bottom: 50, left: 50 }}
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
            min: minValue - (maxValue - minValue) * 0.2,
            max: maxValue + (maxValue - minValue) * 0.2,
          }}
          // yFormat=" >-.2f"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            format: "%a - %b %d",
            // legend: 'time scale',
            legendOffset: 36,
            legendPosition: "middle",
            tickValues: chartConfig?.tickValues,
            legend: chartConfig?.bottomAxisLegend,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Ranked players active",
            legendOffset: -45,
            legendPosition: "middle",
          }}
          curve="monotoneX"
          colors={{ scheme: "category10" }}
          enablePoints={true}
          pointSize={8}
          // pointColor={{ theme: "background" }}
          // pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          enableGridX={true}
          enableCrosshair={false}
          theme={getNivoTooltipTheme(colorScheme)}
        />
      </div>
      <Group justify={"right"}>
        <Select
          style={{ width: 170, marginRight: 30 }}
          label="Display data for the last"
          value={range}
          onChange={(value) => setRange(value as string)}
          data={[
            { value: "month", label: "Month" },
            { value: "3months", label: "3 Months" },
            { value: "6months", label: "6 Months" },
            { value: "12months", label: "Year" },
            { value: "all", label: "All" },
          ]}
        />
      </Group>
    </div>
  );
};

export default PlayersLineChart;
