import React from "react";
import dayjs from "dayjs";
import {
  DaysWithAllAnalysisObjectType,
  gameStatsModeType,
  getDayGamesCount,
  getModeLabel,
} from "../../../../src/stats/combine-game-stats";
import InnerGamesAmountLineChartCard from "../../../../components/charts/inner-games-amount-line-chart";
import { TimeSeriesDisplayType } from "../../../../components/charts/charts-components-utils";

const GamesAmountLineChartCard = ({
  data,
  mode,
  displayBy,
  onDisplayByChange,
}: {
  data: DaysWithAllAnalysisObjectType;
  mode: gameStatsModeType;
  /** Pass both to share the "Display as" with other charts, otherwise the chart keeps its own. */
  displayBy?: TimeSeriesDisplayType;
  onDisplayByChange?: (value: TimeSeriesDisplayType) => void;
}) => {
  const dailyData = Object.entries(data).map(([key, value]) => ({
    y: Math.round(getDayGamesCount(value, mode)),
    x: dayjs.unix(Number(key)).format("YYYY-MM-DD"),
  }));

  return (
    <InnerGamesAmountLineChartCard
      dailyData={dailyData}
      title={`Amount of games over time ${getModeLabel(mode)}`}
      helperText={
        "Number of games played each day, all factions together. In weeks it's the daily average for the week."
      }
      displayBy={displayBy}
      onDisplayByChange={onDisplayByChange}
    />
  );
};

export default GamesAmountLineChartCard;
