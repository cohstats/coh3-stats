import React, { useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { Card, Group, Select, Title, useMantineColorScheme, Text } from "@mantine/core";

import { raceType } from "../../src/coh3/coh3-types";
import { generateWeeklyAverages } from "../../src/charts/utils";
import HelperIcon from "../icon/helper";
import { getNivoTooltipTheme } from "./charts-components-utils";

const InnerWinRateLineChartCard = ({
  data,
  title,
  width = 1270,
}: {
  data: {
    [key in raceType]: {
      id: raceType;
      color: string;
      data: Array<any>;
    };
  };
  title: string;
  width?: number;
}) => {
  const { colorScheme } = useMantineColorScheme();
  const [displayBy, setDisplayBy] = useState<"days" | "weeks">("days");

  const chartData = Object.values(data).map((factionObject) => {
    return {
      id: factionObject.id,
      color: factionObject.color,
      data:
        displayBy === "days"
          ? factionObject.data
          : generateWeeklyAverages(factionObject.data, false),
      // "data": factionObject.data
    };
  });

  return (
    <Card p="md" shadow="sm" w={width} withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify={"apart"}>
          <Group>
            <Title order={3}>{title}</Title>
            <HelperIcon
              width={360}
              text={
                "Winrate for each day can fluctuate a lot because there isn't enough games. Switch to weeks to see a more accurate representation."
              }
            />
          </Group>
          <Group>
            <Text fw={500}>Display as</Text>
            <Select
              style={{ width: 120, marginRight: 30 }}
              // label="Display as"
              value={displayBy}
              onChange={(value) => setDisplayBy(value as "days" | "weeks")}
              data={[
                { value: "days", label: "Days" },
                { value: "weeks", label: "Weeks" },
              ]}
            />
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
            min: 0.3,
            max: 0.7,
          }}
          yFormat=" >-.2f"
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
          colors={{ datum: "color" }}
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
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateX: -1,
              translateY: 65,
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
      </Card.Section>
    </Card>
  );
};

export default InnerWinRateLineChartCard;
