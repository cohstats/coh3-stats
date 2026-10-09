import React from "react";
import { Card, Group, Text, Title } from "@mantine/core";
import HelperIcon from "../../../components/icon/helper";

// React component which accepts inner children. And accepts a title prop.
export const ChartCard = ({
  title,
  size,
  children,
  testId,
}: {
  title: string | React.ReactNode;
  size: "md" | "lg" | "xl";
  children: React.ReactNode;
  /** Optional `data-testid` so the e2e tests can tell the charts apart. */
  testId?: string;
}) => {
  let width = 300;
  let chartHeight = 265;

  if (size === "xl") {
    width = 465;
    chartHeight = 390;
  }

  if (size === "lg") {
    width = 635;
    chartHeight = 390;
  }

  return (
    <Card
      p="md"
      shadow="sm"
      w={width}
      withBorder
      style={{ overflow: "visible" }}
      data-testid={testId}
    >
      {/* top, right, left margins are negative – -1 * theme.spacing.xl */}

      <Card.Section withBorder inheritPadding py="xs">
        <Title order={3}>{title}</Title>
      </Card.Section>
      {/* right, left margins are negative – -1 * theme.spacing.xl */}
      <Card.Section w={width} h={chartHeight} py="xs">
        {children}
      </Card.Section>
    </Card>
  );
};

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Title order={2} size="h3" pt="md" pb="sm">
    {children}
  </Title>
);

/** Chart card title with an info icon explaining the chart. */
export const TitleWithHelper = ({ title, helper }: { title: string; helper: string }) => (
  <Group gap={6} wrap="nowrap">
    <Text inherit>{title}</Text>
    <HelperIcon width={320} text={helper} />
  </Group>
);
