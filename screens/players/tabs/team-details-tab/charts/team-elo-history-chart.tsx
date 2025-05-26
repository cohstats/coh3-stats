import { Center, Group, Text, Title, useMantineColorScheme, Select } from "@mantine/core";
import { ResponsiveLine } from "@nivo/line";
import { getNivoTooltipTheme } from "../../../../../components/charts/charts-components-utils";
import React, { useState } from "react";
import dayjs from "dayjs";
import HelperIcon from "../../../../../components/icon/helper";

interface TeamEloHistoryChartProps {
  matchHistory: Array<{
    m_id: number;
    w: boolean;
    eloChange: number;
    enemyElo: number;
    ts: number;
  }>;
  title: string;
  startingElo: number;
}

const TeamEloHistoryChart = ({ matchHistory, title, startingElo }: TeamEloHistoryChartProps) => {
  const { colorScheme } = useMantineColorScheme();
  const [days, setDays] = useState<string>("180"); // Default to 6 months

  // Process match history data to create a time series
  // We need to sort by timestamp (oldest first) and group by day
  const sortedMatches = [...matchHistory].sort((a, b) => a.ts - b.ts);

  // Group matches by date
  const matchesByDate: Record<
    string,
    {
      date: string;
      timestamp: number;
      eloChange: number;
      wins: number;
      losses: number;
      matchIds: number[];
      enemyElos: number[];
    }
  > = {};

  sortedMatches.forEach((match) => {
    const date = dayjs.unix(match.ts).format("YYYY-MM-DD");

    if (!matchesByDate[date]) {
      matchesByDate[date] = {
        date,
        timestamp: match.ts,
        eloChange: 0,
        wins: 0,
        losses: 0,
        matchIds: [],
        enemyElos: [],
      };
    }

    matchesByDate[date].eloChange += match.eloChange;
    matchesByDate[date].matchIds.push(match.m_id);
    matchesByDate[date].enemyElos.push(match.enemyElo);

    if (match.w) {
      matchesByDate[date].wins += 1;
    } else {
      matchesByDate[date].losses += 1;
    }
  });

  // Convert to array and sort by date
  const dateData = Object.values(matchesByDate).sort((a, b) => a.timestamp - b.timestamp);

  // Filter data based on selected time period
  const pastDate = dayjs().subtract(parseInt(days), "day").locale("en").format("YYYY-MM-DD");
  const filteredDateData = dateData.filter((day) => !dayjs(day.date).isBefore(pastDate));

  // Calculate cumulative ELO
  // If we're filtering, we need to calculate the starting ELO for the filtered period
  let startElo = startingElo;
  if (filteredDateData.length > 0 && dateData.length > filteredDateData.length) {
    // Calculate ELO up to the filtered period
    const firstFilteredDate = filteredDateData[0].date;
    for (const day of dateData) {
      if (day.date < firstFilteredDate) {
        startElo += day.eloChange;
      } else {
        break;
      }
    }
  }

  let currentElo = startElo;
  const chartData = [
    {
      id: "Team ELO",
      color: "#1E77B4", // Blue color similar to other charts
      data: filteredDateData.map((day) => {
        // Calculate the ELO after this day's matches
        currentElo += day.eloChange;

        return {
          x: day.date,
          y: currentElo,
          eloChange: day.eloChange,
          wins: day.wins,
          losses: day.losses,
          totalMatches: day.wins + day.losses,
          matchIds: day.matchIds,
          enemyElos: day.enemyElos,
        };
      }),
    },
  ];

  // If no data, show a message
  if (filteredDateData.length === 0) {
    return (
      <div style={{ padding: "8px", width: "100%" }}>
        <div style={{ borderBottom: "1px solid #dee2e6", padding: "4px 8px" }}>
          <Title order={4}>{title}</Title>
        </div>
        <div style={{ height: 300, padding: "4px" }}>
          <Center maw={400} h={250} mx="auto">
            <h3>No match history data available</h3>
          </Center>
        </div>
      </div>
    );
  }

  // Calculate min and max values for better chart scaling
  let minInData = Infinity;
  let maxInData = -Infinity;

  if (chartData[0].data.length > 0) {
    chartData[0].data.forEach((point) => {
      minInData = Math.min(minInData, point.y);
      maxInData = Math.max(maxInData, point.y);
    });
  } else {
    minInData = startElo;
    maxInData = startElo;
  }

  return (
    <div style={{ padding: "8px", width: "100%" }}>
      <div style={{ padding: "3px 8px" }}>
        <Group justify={"space-between"}>
          <Group>
            <Title order={4}>{title}</Title>
            <HelperIcon
              width={360}
              text={
                "This chart shows the team's ELO progression over time based on match history. Each point represents a day, with the resulting ELO after all matches played that day."
              }
            />
          </Group>
          <Group gap={"xs"}>
            <Text>Display last</Text>
            <Select
              style={{ width: 120, marginRight: 30 }}
              value={days}
              onChange={(value) => setDays(value || "180")}
              data={[
                { value: "90", label: "3 Months" },
                { value: "180", label: "6 Months" },
                { value: "360", label: "1 Year" },
                { value: "720", label: "2 Years" },
                { value: "36500", label: "All" },
              ]}
              withCheckIcon={false}
              allowDeselect={false}
              size={"xs"}
            />
          </Group>
        </Group>
      </div>
      <div style={{ height: 250 }}>
        <ResponsiveLine
          data={chartData}
          margin={{ top: 15, right: 50, bottom: 30, left: 50 }}
          xFormat="time: %a - %Y-%m-%d"
          tooltip={({ point }) => (
            <div
              style={{
                background: colorScheme === "dark" ? "#333" : "white",
                padding: "9px 12px",
                border: "1px solid #ccc",
                color: colorScheme === "dark" ? "#ddd" : "#333",
              }}
            >
              <div>
                <strong>{point.data.xFormatted}</strong>
              </div>
              <div>
                ELO: <strong>{point.data.y}</strong>
              </div>
              <div>
                ELO Change:{" "}
                <strong>
                  {point.data.eloChange > 0 ? `+${point.data.eloChange}` : point.data.eloChange}
                </strong>
              </div>
              <div>
                Matches: <strong>{point.data.totalMatches}</strong> ({point.data.wins} W /{" "}
                {point.data.losses} L)
              </div>
            </div>
          )}
          xScale={{
            format: "%Y-%m-%d",
            precision: "day",
            type: "time",
            useUTC: false,
          }}
          yScale={{
            type: "linear",
            min: Math.max(minInData - (maxInData - minInData) * 0.2, 1),
            max: Math.min(maxInData + (maxInData - minInData) * 0.2, 3000),
          }}
          axisTop={null}
          axisRight={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "ELO",
            legendOffset: 45,
            legendPosition: "middle",
            format: (e) => (Number.isInteger(e) ? Math.round(e) : ""),
          }}
          axisBottom={{
            format: "%b %d",
            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "ELO",
            legendOffset: -45,
            legendPosition: "middle",
            format: (e) => (Number.isInteger(e) ? Math.round(e) : ""),
          }}
          curve="monotoneX"
          colors={{ scheme: "category10" }}
          enablePoints={true}
          pointSize={8}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          enableGridX={true}
          enableCrosshair={true}
          animate={false}
          theme={getNivoTooltipTheme(colorScheme)}
        />
      </div>
    </div>
  );
};

export default TeamEloHistoryChart;
