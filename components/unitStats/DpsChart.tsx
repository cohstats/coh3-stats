import React, { useState } from "react";
//import { LevelContext } from './LevelContext.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as CTitle,
  Tooltip as CTooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";
import {
  Paper,
  // Title,
  // Group,
  // Text,
  // Avatar,
  // Tooltip,
  createStyles,
  Container,
  Space,
  useMantineTheme,
} from "@mantine/core";
import { UnitSearch } from "./UnitSearch";
import { getSingleWeaponDPS } from "../../src/unitStats/WeaponLib";

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: theme.colors.blue[5],
    color: theme.white,
  },
  inner: {
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.gray[9] : theme.colors.gray[0],
  },
}));

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  CTitle,
  CTooltip,
  Legend,
  Filler,
);

// Line Chart Options
export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
  scales: {
    x: {
      type: "linear" as const,
      min: 0,
      suggestedMax: 35,
      title: {
        display: true,
        text: "Distance",
      },

      grid: {
        lineWidth: 0.5,
        // color: "#6a6a6a",
        display: true,
      },
      ticks: {
        padding: 20,
        //    color: "#9a9a9a",
        font: {
          size: 12,
        },
      },
    },
    y: {
      type: "linear" as const,
      suggestedMin: 0,
      suggestedMax: 35,
      grid: {
        lineWidth: 0.5,
        //  color: "#6a6a6a",
        display: false,
      },
      title: {
        display: true,
        text: "DPS",
      },
      ticks: {
        padding: 20,
        //  color: "#9a9a9a",
        font: {
          size: 12,
        },
      },
    },
  },
};

// image: item.icon_name,
// label: item.id,
// value: item.id,
// data : item.weapon_bag,
// description: item.ui_name || 'No Description Available',
const mapChartData = (searchItem: any) => {
  const noData: any[] = [];

  let chartLine = {
    label: "No Item Selected",
    data: noData,
    borderWidth: 2,
    borderColor: "#4dabf7", // '#d048b6',
    cubicInterpolationMode: "monotone" as const,
    tension: 0.5,
    fill: true,
    backgroundColor: "rgba(0, 100, 150, 0.3)",
    pointRadius: 5,
  };

  if (searchItem)
    chartLine = {
      label: searchItem.value,
      data: getWeaponDPSData(searchItem.data), // no clue
      borderWidth: 2,
      borderColor: "#4dabf7", // '#d048b6',
      cubicInterpolationMode: "monotone" as const,
      tension: 0.5,
      fill: true,
      backgroundColor: "rgba(0, 100, 150, 0.3)",
      pointRadius: 5,
    };
  return chartLine;
};

function hexToRgbA(hex: string, opacity: string) {
  let c: any;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return "rgba(" + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") + "," + opacity + ")";
  }
  throw new Error("Bad Hex");
}

const getWeaponDPSData = (weapon_bag: any) => {
  if (!weapon_bag || !weapon_bag.accuracy) return [];

  return getSingleWeaponDPS(weapon_bag);
};

interface IDPSProps {
  searchData: any[];
}

export const DpsChart = (searchItems: IDPSProps) => {
  const searchData_default: any[] = [];
  const [activeData, setActiveData] = useState(searchData_default);
  const { classes } = useStyles();

  function onSelectionChange(selectionItem: any[]) {
    setActiveData(selectionItem);
  }

  // default values
  const chartData = { datasets: [mapChartData(null)] };
  let maxY = 1;

  const colorIndex = [];
  const theme = useMantineTheme();
  for (const c in theme.colors) colorIndex.push(c);

  if (activeData.length > 0) {
    chartData.datasets = [];
    //const selectItem = searchItems.searchData.find(item => item.value = activeData );
    activeData.forEach((set) => {
      chartData.datasets.push(mapChartData(set));
    });

    chartData.datasets.forEach(function (set, i) {
      set.borderColor = theme.colors.blue[5];
      set.backgroundColor = hexToRgbA(theme.colors.blue[5], "0.3");
      if (i > 0) {
        set.borderColor = theme.colors.red[5];
        set.backgroundColor = hexToRgbA(theme.colors.red[5], "0.3");
      }

      set.data.forEach((point: any) => {
        if (point.y > maxY) maxY = point.y; // who is never? :/
      });
    });
  }
  // some scale buffer above the highest point
  maxY = maxY * 1.3;

  options.scales.y.suggestedMax = maxY;

  return (
    <Container size={"sm"} p={"md"}>
      <Paper className={classes.inner} radius="md" px="lg" py={3} mt={6}>
        <Space h="sm" />
        <UnitSearch searchData={searchItems.searchData} onSelect={onSelectionChange}></UnitSearch>
        <Space h="sm" />
        <Line options={options} data={chartData} redraw={true} />
      </Paper>
    </Container>
  );
};
