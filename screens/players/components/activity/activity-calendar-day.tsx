import { ProcessedCOHPlayerStats } from "../../../../src/coh3/coh3-types";
import { ResponsiveCalendarCanvas } from "@nivo/calendar";
import { useMantineColorScheme } from "@mantine/core";
import { getNivoTooltipTheme } from "../../../../components/charts/charts-components-utils";

const ActivityCalendarDay = ({
  playerStatsData,
}: {
  playerStatsData: ProcessedCOHPlayerStats;
}) => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <div style={{ height: 250 }}>
      <ResponsiveCalendarCanvas
        data={playerStatsData.activityByDate}
        from="2023-01-01"
        to="2023-12-31"
        emptyColor={colorScheme === "light" ? "#eeeeee" : "#25262B"}
        colors={[
          "#ff0000",
          "#fb3500",
          "#f64c00",
          "#f15e00",
          "#ec6c00",
          "#e77a00",
          "#e18600",
          "#db9100",
          "#d49c00",
          "#cda600",
          "#c5b000",
          "#bcb900",
          "#b2c300",
          "#a7cc00",
          "#9bd500",
          "#8ddd00",
          "#7de600",
          "#68ee03",
          "#4bf707",
          "#00ff0c",
        ]}
        minValue={-10}
        maxValue={10}
        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        yearSpacing={40}
        // monthBorderColor="#ffffff"
        monthBorderWidth={1}
        dayBorderWidth={2}
        dayBorderColor={colorScheme === "light" ? "#ffffff" : "#1A1B1E"}
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
        theme={getNivoTooltipTheme(colorScheme)}
        // tooltip={(data) => {
        //   if (data.value === undefined) return null
        //   return (
        //     <span style={{ color: data.color, backgroundColor: 'black', padding: '10px' }}>
        //        {data.day} : {data.wins} Wins<br/>
        //        {data.day} : {data.losses} Losses
        //    </span>
        //   )
        // }
        //  }
      />
    </div>
  );
};

export default ActivityCalendarDay;
