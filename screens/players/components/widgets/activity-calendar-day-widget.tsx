import { ProcessedCOHPlayerStats } from "../../../../src/coh3/coh3-types";
import { ResponsiveTimeRange } from "@nivo/calendar";
import { useMantineColorScheme } from "@mantine/core";
import { getNivoTooltipTheme } from "../../../../components/charts/charts-components-utils";
import dayjs from "dayjs";
import {
  CalendarTooltipElement,
  coloursForEachDay,
} from "../../../../components/charts/charts-calendar-utils";

const ActivityCalendarDayWidget = ({
  playerStatsData,
}: {
  playerStatsData: ProcessedCOHPlayerStats;
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
    <ResponsiveTimeRange
      data={playerStatsData.activityByDate}
      from={dayjs(new Date()).subtract(3, "month").format("YYYY-MM-DD")}
      to={dayjs(new Date()).format("YYYY-MM-DD")}
      emptyColor={colorScheme === "light" ? "#eeeeee" : "#25262B"}
      colors={coloursForEachDay}
      minValue={-10}
      maxValue={10}
      margin={{ top: 40, right: 40, bottom: 10, left: 40 }}
      weekdayTicks={[]}
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
        wins,
        losses,
      }: {
        value: string;
        day: string;
        wins: number;
        losses: number;
      }) => {
        return (
          <CalendarTooltipElement
            value={value}
            day={day}
            data={{ wins, losses }}
            colorScheme={colorScheme}
          />
        );
      }}
    />
  );
};

export default ActivityCalendarDayWidget;
