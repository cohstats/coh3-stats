import React, { useMemo } from "react";
import { Line } from "@nivo/line";
import { Box, LoadingOverlay, useMantineColorScheme } from "@mantine/core";
import { getNivoTooltipTheme } from "../../components/charts/charts-components-utils";
import dayjs from "dayjs";

const LiveGamesLineChart = React.memo(
  ({
    data,
    type,
    loading,
  }: {
    data:
      | Array<{
          ut: number;
          "1v1": number;
          "2v2": number;
          "3v3": number;
          "4v4": number;
          ai: number;
          custom: number;
        }>
      | undefined;
    type: "1v1" | "2v2" | "3v3" | "4v4" | "ai" | "custom" | null;
    loading: boolean;
  }) => {
    // This hook works only because all charts are client side rendered
    const { colorScheme } = useMantineColorScheme();

    const startTime = performance.now();
    console.log("RENDERING CHART CHART - Start", startTime);
    console.log("Props - type:", type, "loading:", loading, "data length:", data?.length);

    if (!data) return <></>;

    const dataProcessStart = performance.now();
    console.log("Data processing start", dataProcessStart - startTime, "ms from render start");

    const chartData = useMemo(() => {
      const memoStart = performance.now();
      console.log("Recalculating chartData in useMemo");

      const result = type
        ? [
            {
              id: type,
              data: data.map((item) => ({
                x: dayjs.unix(item.ut).locale("en").format("YYYY-MM-DD HH:mm"),
                y: item[type],
              })),
            },
            {
              id: "All games",
              data: data.map((item) => ({
                x: dayjs.unix(item.ut).locale("en").format("YYYY-MM-DD HH:mm"),
                y:
                  item["1v1"] +
                  item["2v2"] +
                  item["3v3"] +
                  item["4v4"] +
                  item["ai"] +
                  item["custom"],
              })),
            },
          ]
        : [];

      const memoEnd = performance.now();
      console.log("useMemo calculation took", memoEnd - memoStart, "ms");
      return result;
    }, [data, type]);

    const dataProcessEnd = performance.now();
    console.log("chartData finished - took", dataProcessEnd - dataProcessStart, "ms");
    console.log("Total time so far:", dataProcessEnd - startTime, "ms");

    React.useEffect(() => {
      const renderComplete = performance.now();
      console.log("Chart render complete - Total time:", renderComplete - startTime, "ms");
    });

    return (
      <div>
        <Box pos="relative" style={{ height: 250, width: 660 }}>
          <LoadingOverlay
            visible={loading || !type || chartData.length === 0}
            loaderProps={{ children: "Loading..." }}
            overlayProps={{ radius: "md", blur: 3 }}
          />
          {chartData.length > 0 && (
            <Line
              width={660}
              height={250}
              data={chartData}
              margin={{ top: 5, right: 15, bottom: 50, left: 50 }}
              xFormat="time: %a - %Y-%m-%d %H:%M"
              // tooltip={(data) => {
              //   return <>{data.point.data.xFormatted} and {data.point.data.yFormatted}</>
              // }}
              xScale={{
                format: "%Y-%m-%d %H:%M",
                precision: "minute",
                type: "time",
                useUTC: false,
              }}
              yScale={{
                type: "linear",
                // min: minValue - (maxValue - minValue) * 0.2,
                // max: maxValue + (maxValue - minValue) * 0.2,
              }}
              // yFormat=" >-.2f"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                format: "%a - %b %d",
                // legend: 'time scale',
                legendOffset: 36,
                legendPosition: "middle",
                tickValues: "every 1 days",
                // tickValues: chartConfig?.tickValues,
                // legend: chartConfig?.bottomAxisLegend,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Games",
                legendOffset: -45,
                legendPosition: "middle",
              }}
              legends={[
                {
                  anchor: "bottom",
                  direction: "row",
                  justify: false,
                  translateX: -1,
                  translateY: 45,
                  itemsSpacing: 0,
                  itemDirection: "left-to-right",
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: "circle",
                  toggleSerie: true,
                },
              ]}
              curve="linear"
              colors={{ scheme: "category10" }}
              enablePoints={false}
              // pointColor={{ theme: "background" }}
              // pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              pointLabelYOffset={-12}
              useMesh={true}
              enableGridX={true}
              enableCrosshair={false}
              theme={getNivoTooltipTheme(colorScheme)}
              animate={true}
            />
          )}
        </Box>
        {/*<Group justify={"right"}>*/}
        {/*  <Select*/}
        {/*    style={{ width: 170, marginRight: 30 }}*/}
        {/*    label="Display data for the last"*/}
        {/*    value={range}*/}
        {/*    withCheckIcon={false}*/}
        {/*    allowDeselect={false}*/}
        {/*    onChange={(value) => setRange(value as string)}*/}
        {/*    data={[*/}
        {/*      { value: "month", label: "Month" },*/}
        {/*      { value: "3months", label: "3 Months" },*/}
        {/*      { value: "6months", label: "6 Months" },*/}
        {/*      { value: "12months", label: "Year" },*/}
        {/*      { value: "all", label: "All" },*/}
        {/*    ]}*/}
        {/*  />*/}
        {/*</Group>*/}
      </div>
    );
  },
);

LiveGamesLineChart.displayName = "LiveGamesLineChart";

export default LiveGamesLineChart;
