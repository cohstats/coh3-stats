import { ProcessedCOHPlayerStats } from "../../../../src/coh3/coh3-types";
import { ResponsiveCalendarCanvas } from "@nivo/calendar";
import { useMantineColorScheme, Text, Group } from "@mantine/core";
import { getNivoTooltipTheme } from "../../../../components/charts/charts-components-utils";
import dayjs from "dayjs";

const fromYear = "2023-01-01";
const yearDiff = 1 + dayjs(new Date()).diff(fromYear, "year");

const ActivityCalendarDay = ({
  playerStatsData,
}: {
  playerStatsData: ProcessedCOHPlayerStats;
}) => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <div style={{ height: 160 * yearDiff }}>
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
        theme={getNivoTooltipTheme(colorScheme)}
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
            <div style={{ backgroundColor: toolTipBackground, padding: "10px" }}>
              <Group spacing={"xs"}>
                {day}: <Text color={"green"}> {data.wins} W</Text> -{" "}
                <Text color={"red"}> {data.losses} L</Text>
              </Group>
            </div>
          );
        }}
      />
    </div>
  );
};

export default ActivityCalendarDay;
