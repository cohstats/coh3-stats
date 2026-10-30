import React from "react";
import { ResponsiveLine } from "@nivo/line";
import { Card, Group, Select, Title, useMantineColorScheme, Text } from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import { generateWeeklyAverages } from "../../src/charts/utils";
import {
  getNivoTooltipTheme,
  offscreenChartCardStyle,
  showLinePoints,
  TimeSeriesDisplayType,
} from "./charts-components-utils";
import HelperIcon from "../icon/helper";

const lineColor = "#4C9BE8";

/** One line with the amount of games per day, all the factions together. */
const InnerGamesAmountLineChartCard = ({
  dailyData,
  title,
  helperText,
  displayBy: displayByProp,
  onDisplayByChange,
}: {
  /** `x` is the day as `YYYY-MM-DD`, `y` the amount of games on that day. */
  dailyData: Array<{ x: string; y: number }>;
  title: string;
  helperText: string;
  /** Pass both to share the "Display as" with other charts, otherwise the chart keeps its own. */
  displayBy?: TimeSeriesDisplayType;
  onDisplayByChange?: (value: TimeSeriesDisplayType) => void;
}) => {
  const { colorScheme } = useMantineColorScheme();
  const [displayBy, setDisplayBy] = useUncontrolled<TimeSeriesDisplayType>({
    value: displayByProp,
    defaultValue: "days",
    finalValue: "days",
    onChange: onDisplayByChange,
  });

  const chartData = [
    {
      id: "Games",
      color: lineColor,
      data: displayBy === "days" ? dailyData : generateWeeklyAverages(dailyData, false),
    },
  ];

  return (
    <Card
      p="md"
      shadow="sm"
      w={1270}
      withBorder
      style={{ overflow: "visible", ...offscreenChartCardStyle }}
      data-testid="stats-games-amount-over-time"
    >
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
              value={displayBy}
              onChange={(value) => setDisplayBy(value as TimeSeriesDisplayType)}
              withCheckIcon={false}
              data={[
                { value: "days", label: "Days" },
                { value: "weeks", label: "Weeks" },
              ]}
              allowDeselect={false}
            />
          </Group>
        </Group>
      </Card.Section>
      <Card.Section h={350} p="xs">
        <ResponsiveLine
          data={chartData}
          margin={{ top: 25, right: 50, bottom: 50, left: 60 }}
          xFormat="time: %a - %Y-%m-%d"
          xScale={{
            format: "%Y-%m-%d",
            precision: "day",
            type: "time",
            useUTC: false,
          }}
          yScale={{
            type: "linear",
            min: 0,
          }}
          yFormat=" >-,.1~f"
          axisTop={null}
          axisRight={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Games",
            legendOffset: 45,
            legendPosition: "middle",
          }}
          axisBottom={{
            format: "%a - %b %d",
            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Games",
            legendOffset: -50,
            legendPosition: "middle",
          }}
          curve="monotoneX"
          colors={{ datum: "color" }}
          enablePoints={showLinePoints(chartData)}
          pointSize={8}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          enableArea={true}
          areaOpacity={0.1}
          useMesh={true}
          enableGridX={true}
          enableCrosshair={true}
          // Helps site performance
          animate={false}
          theme={getNivoTooltipTheme(colorScheme)}
        />
      </Card.Section>
    </Card>
  );
};

export default InnerGamesAmountLineChartCard;
