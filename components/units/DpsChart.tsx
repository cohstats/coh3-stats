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
  Title,
  Group,
  Text,
  Avatar,
  Tooltip,
  createStyles,
  Container,
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
export var options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "DPS",
    },
  },
  scales: {
    x: {
      type: "linear" as const,
      min: 0,
      suggestedMax: 35,
      grid: {
        lineWidth: 0.5,
        color: "#6a6a6a",
        display: true,
      },
      ticks: {
        padding: 20,
        color: "#9a9a9a",
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
        color: "#6a6a6a",
        display: false,
      },
      ticks: {
        padding: 20,
        color: "#9a9a9a",
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
  var chartLine = {
    label: "No Item Selected",
    data: [],
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
      data: getWeaponDPSData(searchItem.data),
      borderWidth: 2,
      borderColor: "#4dabf7", // '#d048b6',
      cubicInterpolationMode: "monotone" as const,
      tension: 0.5,
      fill: true,
      backgroundColor: "rgba(0, 100, 150, 0.3)",
      pointRadius: 5,
    };
  return { datasets: [chartLine] };
};

const getWeaponDPSData = (weapon_bag: any) => {
  if (!weapon_bag || !weapon_bag.accuracy) return [];

  return getSingleWeaponDPS(weapon_bag);
  // Duration for a shot
  //const shotDurationNear =
};

interface IDPSProps {
  searchData: any[];
}

export const DpsChart = (searchItems: IDPSProps) => {
  const [activeData, setActiveData] = useState(searchItems.searchData[0] || null);
  const { classes } = useStyles();

  function onSelectionChange(selectionItem: any) {
    setActiveData(selectionItem);
  }

  //const selectItem = searchItems.searchData.find(item => item.value = activeData );
  const chartData = mapChartData(activeData);

  var maxY = 1;
  if (chartData.datasets[0]) {
    // for(var dataSet in chartData.datasets[0].data)
    // {
    //   if(dataSet.y > maxY  )
    //     maxY = dataSet.y;
    // }
    chartData.datasets[0].data.forEach((point) => {
      if (point.y > maxY) maxY = point.y;
    });
    maxY = maxY * 1.3;
  }

  options.scales.y.suggestedMax = maxY;

  return (
    <Container size={"sm"} p={"md"}>
      <Paper className={classes.inner} radius="md" px="lg" py={3} mt={6}>
        <UnitSearch searchData={searchItems.searchData} onSelect={onSelectionChange}></UnitSearch>
        <Line options={options} data={chartData} redraw={true} />
      </Paper>
    </Container>
  );
};
