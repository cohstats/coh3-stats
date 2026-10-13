import React from "react";
import dayjs from "dayjs";
import { DaysMapsAnalysisObjectType } from "../../../../src/analysis-types";
import { leaderBoardType } from "../../../../src/coh3/coh3-types";
import { getGamesCount } from "../../../../src/stats/combine-game-stats";
import InnerGamesAmountLineChartCard from "../../../../components/charts/inner-games-amount-line-chart";
import { TimeSeriesDisplayType } from "../../../../components/charts/charts-components-utils";

const MapsGamesAmountLineChartCard = ({
  data,
  mode,
  mapName,
  title,
  displayBy,
  onDisplayByChange,
}: {
  data: DaysMapsAnalysisObjectType;
  mode: leaderBoardType;
  mapName: string;
  title: string;
  /** Pass both to share the "Display as" with other charts, otherwise the chart keeps its own. */
  displayBy?: TimeSeriesDisplayType;
  onDisplayByChange?: (value: TimeSeriesDisplayType) => void;
}) => {
  const dailyData: Array<{ x: string; y: number }> = [];

  for (const [timeStamp, value] of Object.entries(data)) {
    const dayAnalysisObject = value[mode];
    // No data for the mode at all - skip the day, same as the other map charts
    if (!dayAnalysisObject) continue;

    const mapAnalysisObject = dayAnalysisObject[mapName];
    dailyData.push({
      // The map wasn't played that day
      y: mapAnalysisObject ? Math.round(getGamesCount(mapAnalysisObject, mode)) : 0,
      x: dayjs.unix(Number(timeStamp)).format("YYYY-MM-DD"),
    });
  }

  return (
    <InnerGamesAmountLineChartCard
      dailyData={dailyData}
      title={title}
      helperText={
        "Number of games played on this map each day, all factions together. In weeks it's the daily average for the week."
      }
      displayBy={displayBy}
      onDisplayByChange={onDisplayByChange}
    />
  );
};

export default MapsGamesAmountLineChartCard;
