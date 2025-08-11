import React, { useRef } from "react";
import { Container, Box, Text, Space, LoadingOverlay } from "@mantine/core";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js";
import classes from "../../DPSChart.module.css";

interface ChartPanelProps {
  chartData: any;
  chartOptions: any;
  isLoading: boolean;
}

export const ChartPanel: React.FC<ChartPanelProps> = ({ chartData, chartOptions, isLoading }) => {
  const chartRef = useRef<ChartJS>(null);

  // Update chart when options change
  React.useEffect(() => {
    if (chartRef.current) {
      chartRef.current.config.options = chartOptions;
      chartRef.current.update("show");
    }
  }, [chartOptions]);

  return (
    <Container size="md">
      <LoadingOverlay visible={isLoading} />
      <Box className={classes.chartBox}>
        <Line ref={chartRef as any} options={chartOptions as any} data={chartData as any} />
      </Box>
      <Space h="sm" />
      <Text c="dimmed" pl={5} fs="italic">
        * Computation results are based on approximation models using stats from the game files.
        Values allow us to benchmark the performance in comparison to other units. Values are
        relative to opponent selection, E.g. small arms DPS against armor will be lower than vs
        infantry. Values do not necessarily reflect the average time to kill (ttk) in game.
      </Text>
      <Text c="dimmed" pl={5} fs="italic">
        ** Area and ballistic DPS (Eg. by Mortar, Tank Guns..) are experimental approximations
        respecting scatter, penetration and target size. Some information like box sizes of units
        are not accessible. Also, squads formations and densities are unknown. The calculation
        assumes every model within the model cap limit to be hit which allows a rough performance
        comparison but do not necessarily reflect the average time to kill in game.
      </Text>
    </Container>
  );
};
