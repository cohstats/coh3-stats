import { ProcessedCOHPlayerStats } from "../../../../src/coh3/coh3-types";
import { ResponsiveCalendarCanvas } from "@nivo/calendar";
import { useMantineColorScheme, Text, Group } from "@mantine/core";
import { getNivoTooltipTheme } from "../../../../components/charts/charts-components-utils";
import dayjs from "dayjs";

const ActivityCalendarDay = ({
  playerStatsData,
  fromYear,
}: {
  playerStatsData: ProcessedCOHPlayerStats;
  fromYear: string;
}) => {
  const { colorScheme } = useMantineColorScheme();

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
    <ResponsiveCalendarCanvas
      data={playerStatsData.activityByDate}
      from={fromYear}
      to={dayjs(new Date()).format("YYYY-MM-DD")}
      emptyColor={colorScheme === "light" ? "#eeeeee" : "#25262B"}
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
      margin={{ top: 40, right: 40, bottom: 10, left: 40 }}
      yearSpacing={40}
      // monthBorderColor="#ffffff"
      monthBorderWidth={1}
      dayBorderWidth={2}
      dayBorderColor={colorScheme === "light" ? "#ffffff" : "#1A1B1E"}
      // legends={[
      //   {
      //     anchor: "bottom-right",
      //     direction: "row",
      //     translateY: 36,
      //     itemCount: 4,
      //     itemWidth: 42,
      //     itemHeight: 36,
      //     itemsSpacing: 14,
      //     itemDirection: "right-to-left",
      //   },
      // ]}
      theme={chartColorTheme}
      // @ts-ignore
      tooltip={({
        value,
        day,
        data,
      }: {
        value: string;
        color: string;
        day: string;
        data: { wins: number; losses: number };
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
            <Group gap={"xs"}>
              {day}: <Text c={"green"}> {data.wins} W</Text> -{" "}
              <Text c={"red"}> {data.losses} L</Text>
            </Group>
          </div>
        );
      }}
    />
  );
};

export default ActivityCalendarDay;
