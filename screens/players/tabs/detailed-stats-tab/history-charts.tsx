import { HistoricLeaderBoardStat } from "../../../../src/coh3/coh3-types";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import { Select } from "@mantine/core";
import React from "react";

const DynamicHistoryOverTimeChart = dynamic(() => import("./charts/history-over-time-chart"), {
  ssr: false,
});

const DynamicWindLossTimeChart = dynamic(() => import("./charts/win-loss-time-chart"), {
  ssr: false,
});

const HistoryCharts = ({
  leaderboardStats,
}: {
  leaderboardStats: HistoricLeaderBoardStat | null;
}) => {
  const [days, setDays] = React.useState<string>("180");

  const pastDate = dayjs(new Date()).subtract(parseInt(days), "day");
  const filteredLeaderboardStats = leaderboardStats?.history.filter(
    (value) => !dayjs(value.date).isBefore(pastDate),
  );

  const DisplayAsSelector = (
    <Select
      style={{ width: 120, marginRight: 30 }}
      // label="Display as"
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
    />
  );

  return (
    <>
      <DynamicHistoryOverTimeChart
        historyOfLeaderBoardStat={filteredLeaderboardStats}
        title={"ELO History"}
        type={"rt"}
        key={"rt"}
        DisplayAsElement={DisplayAsSelector}
      />
      <DynamicHistoryOverTimeChart
        historyOfLeaderBoardStat={filteredLeaderboardStats}
        title={"Rank History"}
        type={"r"}
        key={"r"}
        DisplayAsElement={DisplayAsSelector}
      />
      <DynamicWindLossTimeChart
        historyOfLeaderBoardStat={filteredLeaderboardStats}
        title={"Win / Loss History"}
        key={"w"}
        DisplayAsElement={DisplayAsSelector}
      />
    </>
  );
};

export default HistoryCharts;
