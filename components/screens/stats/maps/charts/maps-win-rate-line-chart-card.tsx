import React from "react";
import { DaysMapsAnalysisObjectType } from "../../../../../src/analysis-types";
import dayjs from "dayjs";
import { leaderBoardType, raceType } from "../../../../../src/coh3/coh3-types";
import InnerWinRateLineChartCard from "../../../../charts/inner-wr-line-chart";
import { chartDataObjectsForTimeSeries } from "../../../../charts/charts-components-utils";
import { getMapLocalizedName } from "../../../../../src/coh3/helpers";

const MapsWinRateLineChartCard = ({
  data,
  mode,
  mapName,
  width,
}: {
  data: DaysMapsAnalysisObjectType;
  mode: "1v1" | "2v2" | "3v3" | "4v4";
  mapName: string;
  width: number;
}) => {
  const chartDataObjects = JSON.parse(JSON.stringify(chartDataObjectsForTimeSeries));

  for (const [timeStamp, value] of Object.entries(data)) {
    const dayAnalysisObject = value[mode as leaderBoardType];
    const mapAnalysisObject = dayAnalysisObject[mapName];

    if (mapAnalysisObject) {
      for (const [faction, data] of Object.entries(mapAnalysisObject)) {
        chartDataObjects[faction as raceType].data.push({
          // winRate
          y: data.wins / (data.wins + data.losses), //.toFixed(2),
          x: dayjs.unix(Number(timeStamp)).subtract(0, "day").format("YYYY-MM-DD"),
        });
      }
    }
  }

  return (
    <InnerWinRateLineChartCard
      data={chartDataObjects}
      title={`${getMapLocalizedName(mapName)} - Winrate over time for ${mode}`}
      width={width}
    />
  );
};

export default MapsWinRateLineChartCard;
