import { ResponsiveTimeRange } from "@nivo/calendar";
import dayjs from "dayjs";
import { ProcessedCOHPlayerStats } from "../../../../../src/coh3/coh3-types";
import { Group, Text, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { getNivoTooltipTheme } from "../../../../../components/charts/charts-components-utils";

const ActivityLastMonthsWidget = ({
  playerStatsData,
}: {
  playerStatsData: ProcessedCOHPlayerStats | undefined;
}) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  // This is most likely a bug in Nivo, the labels on Calendar Canvas our outside / other charts have it inside
  const chartColorTheme = {
    ...getNivoTooltipTheme(colorScheme),
    ...{
      labels: {
        text: {
          fill: colorScheme === "light" ? "#333333" : "#ccd7e2",
          fontSize: 12,
          fontWeight: 500,
        },
      },
    },
  };

  return (
    <ResponsiveTimeRange
      data={playerStatsData?.activityByDate || []}
      from={dayjs(new Date()).subtract(4, "month").locale("en").format("YYYY-MM-DD")}
      to={dayjs(new Date()).locale("en").format("YYYY-MM-DD")}
      emptyColor={colorScheme === "light" ? "#eeeeee" : theme.colors.dark[5]}
      colors={[
        "#f15854",
        "#f4665f",
        "#f8736a",
        "#fa7f76",
        "#fd8c82",
        "#ff988e",
        "#ffa39a",
        "#ffafa6",
        "#ffbbb2",
        "#ffc6bf",
        "#baddba",
        "#add6ac",
        "#9fcf9f",
        "#91c892",
        "#83c185",
        "#74ba78",
        "#65b36b",
        "#55ac5e",
        "#44a551",
        "#2f9e44",
      ]}
      minValue={-10}
      maxValue={10}
      weekdayTicks={[]}
      margin={{ top: 25, right: 25, bottom: 15, left: -35 }}
      dayBorderWidth={2}
      dayBorderColor={colorScheme === "light" ? "#ffffff" : theme.colors.dark[7]} // dark "#242424"
      legends={[
        {
          anchor: "bottom-right",
          direction: "row",
          translateY: 36,
          itemCount: 4,
          itemWidth: 42,
          itemHeight: 36,
          itemsSpacing: 14,
          itemDirection: "right-to-left",
        },
      ]}
      theme={chartColorTheme}
      // @ts-ignore
      tooltip={({
        value,
        day,
        wins,
        losses,
      }: {
        value: string;
        color: string;
        day: string;
        wins: number;
        losses: number;
      }) => {
        if (value === undefined) return null;
        const toolTipBackground = colorScheme === "light" ? "#eeeeee" : theme.colors.dark[4];
        return (
          <div
            style={{
              backgroundColor: toolTipBackground,
              padding: "5px",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            <Group gap={"xs"}>
              {day}:{" "}
              <Text span c={"green"}>
                {" "}
                {wins} W
              </Text>{" "}
              -{" "}
              <Text span c={"red"}>
                {" "}
                {losses} L
              </Text>
            </Group>
          </div>
        );
      }}
    />
  );
};

export default ActivityLastMonthsWidget;
