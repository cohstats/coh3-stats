import React from "react";
import { raceType } from "../../../../../src/coh3/coh3-types";
import { chartDataObjectsForTimeSeries } from "../../../../../components/charts/charts-components-utils";

export const factionLabels: Record<raceType, string> = {
  german: "Wehrmacht",
  american: "US Forces",
  dak: "DAK",
  british: "British",
};

export const factionShortLabels: Record<raceType, string> = {
  german: "Wehr",
  american: "USF",
  dak: "DAK",
  british: "Brits",
};

export const factionColors: Record<raceType, string> = {
  german: chartDataObjectsForTimeSeries.german.color,
  american: chartDataObjectsForTimeSeries.american.color,
  dak: chartDataObjectsForTimeSeries.dak.color,
  british: chartDataObjectsForTimeSeries.british.color,
};

/** Axis first, then allies - same order as the rest of the stats page. */
export const chartFactionOrder: Array<raceType> = ["german", "dak", "american", "british"];

/** Dark text on light bars, white text on dark bars - `color` is a hex string like `#1E77B4`. */
export const getLabelTextColor = (color: string) => {
  const [r, g, b] = [1, 3, 5]
    .map((start) => parseInt(color.slice(start, start + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.2 ? "#ffffff" : "#111111";
};

export const ChartTooltip = ({
  colorScheme,
  children,
}: {
  colorScheme: "dark" | "light" | "auto";
  children: React.ReactNode;
}) => {
  return (
    <div
      style={{
        backgroundColor: colorScheme === "dark" ? "#25262B" : "#ffffff",
        color: colorScheme === "dark" ? "#dddddd" : "#333333",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.25)",
        borderRadius: 4,
        padding: "5px 10px",
        fontSize: 13,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};
