import React from "react";
import { Card, Title } from "@mantine/core";

const MapChartCard = ({
  title,
  size,
  children,
  height = 280,
  width = 380,
}: {
  title: string | React.ReactNode;
  size: "md" | "xl";
  children: React.ReactNode;
  height?: number;
  width?: number;
}) => {
  let chartWidth = width;
  let chartHeight = height;

  if (size === "xl") {
    chartWidth = 465;
    chartHeight = 390;
  }

  return (
    <Card p="md" shadow="sm" w={chartWidth} withBorder style={{ overflow: "visible" }}>
      {/* top, right, left margins are negative – -1 * theme.spacing.xl */}

      <Card.Section withBorder inheritPadding py="xs">
        <Title order={3}>{title}</Title>
      </Card.Section>
      {/* right, left margins are negative – -1 * theme.spacing.xl */}
      <Card.Section w={chartWidth} h={chartHeight} py="xs">
        {children}
      </Card.Section>
    </Card>
  );
};

export default MapChartCard;
