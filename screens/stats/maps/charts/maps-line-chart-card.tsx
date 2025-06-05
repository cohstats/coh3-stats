import React, { useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { Card, Group, Select, Title, useMantineColorScheme, Text } from "@mantine/core";
import { generateWeeklyAverages } from "../../../../src/charts/utils";
import {
  chartDataObjectsForTimeSeries,
  getNivoTooltipTheme,
} from "../../../../components/charts/charts-components-utils";
import { DaysMapsAnalysisObjectType } from "../../../../src/analysis-types";
import dayjs from "dayjs";
import { leaderBoardType, raceType } from "../../../../src/coh3/coh3-types";
import HelperIcon from "../../../../components/icon/helper";

const MapsLineChartCard = ({
  data,
  mode,
  mapName,
  title,
  helperText,
  stacked,
}: {
  data: DaysMapsAnalysisObjectType;
  mode: "1v1" | "2v2" | "3v3" | "4v4";
  mapName: string;
  title: string;
  helperText: string;
  stacked: boolean;
}) => {
  const { colorScheme } = useMantineColorScheme();
  const [displayBy, setDisplayBy] = useState<"days" | "weeks">("days");

  const chartDataObjects: {
    [key in raceType]: {
      id: raceType;
      color: string;
      data: Array<any>;
    };
    // We need to copy the object
  } = JSON.parse(JSON.stringify(chartDataObjectsForTimeSeries));

  for (const [timeStamp, value] of Object.entries(data)) {
    const dayAnalysisObject = value[mode as leaderBoardType];
    const mapAnalysisObject = dayAnalysisObject[mapName];

    if (mapAnalysisObject) {
      for (const [faction, data] of Object.entries(mapAnalysisObject)) {
        chartDataObjects[faction as raceType].data.push({
          y: (data.wins || 0) + (data.losses || 0), //.toFixed(2),
          x: dayjs.unix(Number(timeStamp)).subtract(0, "day").format("YYYY-MM-DD"),
        });
      }
    }
  }

  const chartData = Object.values(chartDataObjects).map((factionObject) => {
    return {
      id: factionObject.id,
      color: factionObject.color,
      data:
        displayBy === "days"
          ? factionObject.data
          : generateWeeklyAverages(factionObject.data, false),
    };
  });

  console.log(chartData);

  return (
    <Card p="md" shadow="sm" w={1270} withBorder style={{ overflow: "visible" }}>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify={"space-between"}>
          <Group>
            <Title order={3}>{title}</Title>
            <HelperIcon width={360} text={helperText} />
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
              withCheckIcon={false}
              allowDeselect={false}
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
            stacked: stacked,
            type: "linear",
          }}
          yFormat=" >-.0f"
          axisTop={null}
          axisRight={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Factions played",
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
            legend: "Factions played",
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
          enableArea={stacked}
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
              toggleSerie: true,
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

export default MapsLineChartCard;
