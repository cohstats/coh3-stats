// https://github.com/plouc/nivo/blob/master/website/src/theming/theme.ts#L181-L284
import { raceType } from "../../src/coh3/coh3-types";

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
