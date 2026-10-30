// https://github.com/plouc/nivo/blob/master/website/src/theming/theme.ts#L181-L284
import { raceType } from "../../src/coh3/coh3-types";

/** "Display as" of the time series charts. */
export type TimeSeriesDisplayType = "days" | "weeks";

/**
 * Points of the line charts are SVG circles, with a long date range there are thousands of them
 * and every re-render gets slow. The mesh still shows the tooltip on hover without them.
 */
export const showLinePoints = (series: Array<{ data: Array<unknown> }>) =>
  series.every((serie) => serie.data.length <= 40);

/**
 * The big time series cards are below the fold, the browser skips their layout and paint
 * until they get close to the viewport. The height is the one of the rendered card.
 */
export const offscreenChartCardStyle = {
  contentVisibility: "auto",
  containIntrinsicSize: "auto 450px",
} as const;

export const getNivoTooltipTheme = (colorScheme: "dark" | "light" | "auto") => {
  if (colorScheme === "dark") {
    return {
      axis: {
        domain: {
          line: {
            strokeWidth: 0,
            stroke: "#526271",
          },
        },
        ticks: {
          line: {
            strokeWidth: 1,
            stroke: "#526271",
          },
          text: {
            fill: "#8d9cab",
            fontSize: 11,
          },
        },
        legend: {
          text: {
            fill: "#8d9cab",
            fontSize: 13,
            fontWeight: 500,
          },
        },
      },
      grid: {
        line: {
          stroke: "#444",
        },
      },
      legends: {
        text: {
          fontSize: 12,
          fill: "#8d9cab",
        },
        ticks: {
          line: {
            strokeWidth: 1,
            stroke: "#c8d4e0",
          },
          text: {
            fill: "#8d9cab",
            fontSize: 10,
          },
        },
        title: {
          text: {
            fill: "#ccd7e2",
            fontSize: 10,
            fontWeight: 800,
          },
        },
      },
      tooltip: {
        container: {
          fontSize: "13px",
          background: "#333",
          color: "#ddd",
          whiteSpace: "nowrap",
        },
      },
      labels: {
        text: {
          fill: "#333333",
          fontSize: 12,
          fontWeight: 500,
        },
      },
      dots: {
        text: {
          fill: "#bbb",
          fontSize: 12,
        },
      },
      annotations: {
        text: {
          fill: "#dddddd",
          outlineWidth: 1.5,
          outlineColor: "#0e1317",
          outlineOpacity: 0.35,
        },
        link: {
          stroke: "#b2bfcb",
          strokeWidth: 1.5,
          outlineWidth: 2.5,
          outlineColor: "#0e1317",
          outlineOpacity: 0.35,
        },
        outline: {
          stroke: "#b2bfcb",
          strokeWidth: 1.5,
          outlineWidth: 2.5,
          outlineColor: "#0e1317",
          outlineOpacity: 0.35,
        },
        symbol: {
          fill: "#b2bfcb",
          outlineWidth: 2,
          outlineColor: "#0e1317",
          outlineOpacity: 0.35,
        },
      },
    };
  } else {
    return {};
  }
};

export const chartDataObjectsForTimeSeries: {
  [key in raceType]: {
    id: raceType;
    color: string;
    data: Array<any>;
  };
} = {
  german: {
    id: "german",
    color: "#D62728",
    data: [],
  },
  dak: {
    id: "dak",
    color: "#f1e05b",
    data: [],
  },
  american: {
    id: "american",
    color: "#2DA02C",
    data: [],
  },
  british: {
    id: "british",
    color: "#1E77B4",
    data: [],
  },
};
