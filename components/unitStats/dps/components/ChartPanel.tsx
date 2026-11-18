import React, { useRef } from "react";
import { useTranslation } from "next-i18next/pages";
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
  const { t } = useTranslation("explorer");

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
      <Box className={classes.chartBox} data-testid="dps-chart">
        <div className={classes.chartCanvas}>
          <Line ref={chartRef as any} options={chartOptions as any} data={chartData as any} />
        </div>
      </Box>
      <Space h="sm" />
      <Text c="dimmed" pl={5} size="xs">
        {t("dpsCompareUi.compare.estimate")}
      </Text>
    </Container>
  );
};
