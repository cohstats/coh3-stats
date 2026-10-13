import React from "react";
import {
  DaysWithAllAnalysisObjectType,
  gameStatsModeType,
  getModeLabel,
} from "../../../../src/stats/combine-game-stats";
import { DayAnalysisObjectType } from "../../../../src/analysis-types";
import dayjs from "dayjs";
import { raceType } from "../../../../src/coh3/coh3-types";
import InnerWinRateLineChartCard from "../../../../components/charts/inner-wr-line-chart";
import {
  chartDataObjectsForTimeSeries,
  TimeSeriesDisplayType,
} from "../../../../components/charts/charts-components-utils";

const WinRateLineChartCard = ({
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
  const chartDataObjects = JSON.parse(JSON.stringify(chartDataObjectsForTimeSeries));

  Object.entries(data).forEach(([key, value]) => {
    const dayAnalysisObject: Partial<DayAnalysisObjectType> = value[mode] || {};

    for (const [faction, data] of Object.entries(dayAnalysisObject)) {
      chartDataObjects[faction as raceType].data.push({
        // winRate
        y: data.wins / ((data.wins || 0) + (data.losses || 0)), //.toFixed(2),
        x: dayjs.unix(Number(key)).subtract(0, "day").format("YYYY-MM-DD"),
      });
    }
  });

  return (
    <InnerWinRateLineChartCard
      data={chartDataObjects}
      title={`Winrate over time for ${getModeLabel(mode)}`}
      displayBy={displayBy}
      onDisplayByChange={onDisplayByChange}
    />
  );
};

export default WinRateLineChartCard;
