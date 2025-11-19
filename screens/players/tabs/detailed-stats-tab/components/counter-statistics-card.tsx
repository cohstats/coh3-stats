import { Card, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { PlayerReportCounters } from "../../../../../src/coh3/coh3-types";
import React from "react";

interface CounterStatisticsCardProps {
  counters: PlayerReportCounters;
  totalMatches: number;
}

const CounterStatisticsCard = ({ counters, totalMatches }: CounterStatisticsCardProps) => {
  const formatNumber = (value: number): string => {
    return Math.round(value).toLocaleString();
  };

  const formatAverage = (value: number): string => {
    const avg = totalMatches > 0 ? value / totalMatches : 0;
    return formatNumber(avg);
  };

  // Render a single stat line with label and value
  const renderSimpleStat = (label: string, value: string): React.ReactNode => {
    return (
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm" c="dimmed">
          {label}
        </Text>
        <Text size="sm" fw={500}>
          {value}
        </Text>
      </Group>
    );
  };

  // Render a grouped stat line (e.g., "Killed / Lost / Produced: 288 / 208 / 485")
  const renderGroupedStat = (
    label: string,
    items: Array<{ key: keyof PlayerReportCounters | "kd"; shortLabel: string }>,
    isAverage = false,
  ): React.ReactNode => {
    const values = items.map((item) => {
      // Special handling for KD ratio
      if (item.key === "kd") {
        const kills = counters.ekills || 0;
        const deaths = counters.edeaths || 0;
        const kdRatio = deaths > 0 ? kills / deaths : kills;
        if (isAverage) {
          return totalMatches > 0 ? kdRatio : 0;
        }
        return kdRatio;
      }

      const value = counters[item.key as keyof PlayerReportCounters] || 0;
      if (isAverage) {
        return totalMatches > 0 ? value / totalMatches : 0;
      }
      return value;
    });

    // Check if all values are zero (except KD ratio)
    if (values.every((v) => v === 0)) return null;

    const shortLabels = items.map((item) => item.shortLabel).join(" / ");
    const formattedValues = values
      .map((v, index) => {
        // Format KD ratio with 1 decimal place
        if (items[index].key === "kd") {
          return v.toFixed(1);
        }
        return formatNumber(v);
      })
      .join(" / ");

    return renderSimpleStat(`${label} - ${shortLabels}`, formattedValues);
  };

  const convertSecondsToReadableTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const renderStatGroup = (
    title: string,
    stats: Array<{
      type: "simple" | "grouped";
      label: string;
      key?: keyof PlayerReportCounters;
      items?: Array<{ key: keyof PlayerReportCounters | "kd"; shortLabel: string }>;
    }>,
    isAverage = false,
  ) => {
    const renderedStats = stats
      .map((stat) => {
        if (stat.type === "simple" && stat.key) {
          const value = counters[stat.key] || 0;
          if (value === 0) return null;

          // Special handling for game time - convert seconds to readable format
          if (stat.key === "gt") {
            const timeString = isAverage
              ? convertSecondsToReadableTime(totalMatches > 0 ? value / totalMatches : 0)
              : convertSecondsToReadableTime(value);
            return renderSimpleStat(stat.label, timeString);
          }

          const displayValue = isAverage ? formatAverage(value) : formatNumber(value);
          return renderSimpleStat(stat.label, displayValue);
        } else if (stat.type === "grouped" && stat.items) {
          return renderGroupedStat(stat.label, stat.items, isAverage);
        }
        return null;
      })
      .filter(Boolean);

    if (renderedStats.length === 0) return null;

    return (
      <Card withBorder p="sm" radius="md">
        <Title order={5} mb="4">
          {title}
        </Title>
        <Stack gap="4">{renderedStats}</Stack>
      </Card>
    );
  };

  const statGroups = [
    {
      title: "Combat",
      stats: [
        { type: "simple" as const, label: "Damage Done", key: "dmgdone" as const },
        {
          type: "grouped" as const,
          label: "Units",
          items: [
            { key: "ekills" as const, shortLabel: "Kills" },
            { key: "edeaths" as const, shortLabel: "Deaths" },
            { key: "kd" as const, shortLabel: "KD" },
          ],
        },
        {
          type: "grouped" as const,
          label: "Squads",
          items: [
            { key: "sqkill" as const, shortLabel: "Killed" },
            { key: "sqlost" as const, shortLabel: "Lost" },
            { key: "sqprod" as const, shortLabel: "Produced" },
          ],
        },
        {
          type: "grouped" as const,
          label: "Vehicles",
          items: [
            { key: "vkill" as const, shortLabel: "Killed" },
            { key: "vlost" as const, shortLabel: "Lost" },
            { key: "vprod" as const, shortLabel: "Produced" },
          ],
        },
        { type: "simple" as const, label: "Structure Damage", key: "structdmg" as const },
        { type: "simple" as const, label: "Vehicles Abandoned", key: "vabnd" as const },
      ],
    },
    {
      title: "Production & Buildings",
      stats: [
        {
          type: "grouped" as const,
          label: "Buildings",
          items: [
            { key: "bprod" as const, shortLabel: "Produced" },
            { key: "blost" as const, shortLabel: "Lost" },
          ],
        },
        { type: "simple" as const, label: "Units Produced", key: "unitprod" as const },
      ],
    },
    {
      title: "Abilities & Commands",
      stats: [
        {
          type: "grouped" as const,
          label: "Points",
          items: [
            { key: "pcap" as const, shortLabel: "Captured" },
            { key: "precap" as const, shortLabel: "Recaptured" },
          ],
        },
        { type: "simple" as const, label: "Abilities Used", key: "abil" as const },
        { type: "simple" as const, label: "Total Commands", key: "totalcmds" as const },
        { type: "simple" as const, label: "Upgrades", key: "upg" as const },
      ],
    },
    {
      title: "Other",
      stats: [
        {
          type: "grouped" as const,
          label: "Requisition",
          items: [
            { key: "reqearn" as const, shortLabel: "Earned" },
            { key: "reqspnt" as const, shortLabel: "Spent" },
            { key: "reqmax" as const, shortLabel: "Max" },
          ],
        },
        {
          type: "grouped" as const,
          label: "Power",
          items: [
            { key: "powearn" as const, shortLabel: "Earned" },
            { key: "powspnt" as const, shortLabel: "Spent" },
            { key: "powmax" as const, shortLabel: "Max" },
          ],
        },
        { type: "simple" as const, label: "Command Points Earned", key: "cpearn" as const },
        { type: "simple" as const, label: "Entity Reinforcements", key: "erein" as const },
        {
          type: "grouped" as const,
          label: "Veterancy",
          items: [
            { key: "svetxp" as const, shortLabel: "Squad XP" },
            { key: "svetrank" as const, shortLabel: "Squad Rank" },
            { key: "vvetrank" as const, shortLabel: "Vehicle Rank" },
          ],
        },
        { type: "simple" as const, label: "Max Population", key: "popmax" as const },
        { type: "simple" as const, label: "Game Time", key: "gt" as const },
      ],
    },
  ];

  return (
    <Card p="md" shadow="sm" w={"100%"} withBorder mb="md">
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between" align="center">
          <Title order={3}>Counter Statistics</Title>
          <Text size="sm" c="dimmed">
            Total Matches: {totalMatches}
          </Text>
        </Group>
      </Card.Section>
      <Card.Section inheritPadding py="md">
        <Grid>
          {/* Total Column */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Title order={4} mb="sm">
              Total
            </Title>
            <Stack gap="xs">
              {statGroups.map((group) => renderStatGroup(group.title, group.stats, false))}
            </Stack>
          </Grid.Col>

          {/* Average Column */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Title order={4} mb="sm">
              Average (per match)
            </Title>
            <Stack gap="xs">
              {statGroups.map((group) => renderStatGroup(group.title, group.stats, true))}
            </Stack>
          </Grid.Col>
        </Grid>
      </Card.Section>
    </Card>
  );
};

export default CounterStatisticsCard;
