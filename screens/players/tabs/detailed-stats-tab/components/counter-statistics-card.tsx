import { Card, Grid, Group, Stack, Text, Title } from "@mantine/core";
import { PlayerReportCounters } from "../../../../../src/coh3/coh3-types";
import React from "react";
import { TFunction } from "next-i18next";

interface CounterStatisticsCardProps {
  counters: PlayerReportCounters;
  totalMatches: number;
  t: TFunction;
}

const CounterStatisticsCard = ({ counters, totalMatches, t }: CounterStatisticsCardProps) => {
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
      .map((stat, index) => {
        if (stat.type === "simple" && stat.key) {
          const value = counters[stat.key] || 0;
          if (value === 0) return null;

          // Special handling for game time - convert seconds to readable format
          if (stat.key === "gt") {
            const timeString = isAverage
              ? convertSecondsToReadableTime(totalMatches > 0 ? value / totalMatches : 0)
              : convertSecondsToReadableTime(value);
            return (
              <div key={`${stat.key}-${index}`}>{renderSimpleStat(stat.label, timeString)}</div>
            );
          }

          const displayValue = isAverage ? formatAverage(value) : formatNumber(value);
          return (
            <div key={`${stat.key}-${index}`}>{renderSimpleStat(stat.label, displayValue)}</div>
          );
        } else if (stat.type === "grouped" && stat.items) {
          return (
            <div key={`${stat.label}-${index}`}>
              {renderGroupedStat(stat.label, stat.items, isAverage)}
            </div>
          );
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
      title: t("counterStatistics.categories.combat"),
      stats: [
        {
          type: "simple" as const,
          label: t("counterStatistics.stats.damageData"),
          key: "dmgdone" as const,
        },
        {
          type: "grouped" as const,
          label: t("counterStatistics.stats.units"),
          items: [
            { key: "ekills" as const, shortLabel: t("counterStatistics.labels.kills") },
            { key: "edeaths" as const, shortLabel: t("counterStatistics.labels.deaths") },
            { key: "kd" as const, shortLabel: t("counterStatistics.labels.kd") },
          ],
        },
        {
          type: "grouped" as const,
          label: t("counterStatistics.stats.squads"),
          items: [
            { key: "sqkill" as const, shortLabel: t("counterStatistics.labels.killed") },
            { key: "sqlost" as const, shortLabel: t("counterStatistics.labels.lost") },
            { key: "sqprod" as const, shortLabel: t("counterStatistics.labels.produced") },
          ],
        },
        {
          type: "grouped" as const,
          label: t("counterStatistics.stats.vehicles"),
          items: [
            { key: "vkill" as const, shortLabel: t("counterStatistics.labels.killed") },
            { key: "vlost" as const, shortLabel: t("counterStatistics.labels.lost") },
            { key: "vprod" as const, shortLabel: t("counterStatistics.labels.produced") },
          ],
        },
        {
          type: "simple" as const,
          label: t("counterStatistics.stats.structureDamage"),
          key: "structdmg" as const,
        },
        {
          type: "simple" as const,
          label: t("counterStatistics.stats.vehiclesAbandoned"),
          key: "vabnd" as const,
        },
      ],
    },
    {
      title: t("counterStatistics.categories.productionBuildings"),
      stats: [
        {
          type: "grouped" as const,
          label: t("counterStatistics.stats.buildings"),
          items: [
            { key: "bprod" as const, shortLabel: t("counterStatistics.labels.produced") },
            { key: "blost" as const, shortLabel: t("counterStatistics.labels.lost") },
          ],
        },
        {
          type: "simple" as const,
          label: t("counterStatistics.stats.unitsProduced"),
          key: "unitprod" as const,
        },
      ],
    },
    {
      title: t("counterStatistics.categories.abilitiesCommands"),
      stats: [
        {
          type: "grouped" as const,
          label: t("counterStatistics.stats.points"),
          items: [
            { key: "pcap" as const, shortLabel: t("counterStatistics.labels.captured") },
            { key: "precap" as const, shortLabel: t("counterStatistics.labels.recaptured") },
          ],
        },
        {
          type: "simple" as const,
          label: t("counterStatistics.stats.abilitiesUsed"),
          key: "abil" as const,
        },
        {
          type: "simple" as const,
          label: t("counterStatistics.stats.totalCommands"),
          key: "totalcmds" as const,
        },
        {
          type: "simple" as const,
          label: t("counterStatistics.stats.upgrades"),
          key: "upg" as const,
        },
      ],
    },
    {
      title: t("counterStatistics.categories.other"),
      stats: [
        {
          type: "grouped" as const,
          label: t("counterStatistics.stats.requisition"),
          items: [
            { key: "reqearn" as const, shortLabel: t("counterStatistics.labels.earned") },
            { key: "reqspnt" as const, shortLabel: t("counterStatistics.labels.spent") },
            { key: "reqmax" as const, shortLabel: t("counterStatistics.labels.max") },
          ],
        },
        {
          type: "grouped" as const,
          label: t("counterStatistics.stats.power"),
          items: [
            { key: "powearn" as const, shortLabel: t("counterStatistics.labels.earned") },
            { key: "powspnt" as const, shortLabel: t("counterStatistics.labels.spent") },
            { key: "powmax" as const, shortLabel: t("counterStatistics.labels.max") },
          ],
        },
        {
          type: "simple" as const,
          label: t("counterStatistics.stats.commandPointsEarned"),
          key: "cpearn" as const,
        },
        {
          type: "simple" as const,
          label: t("counterStatistics.stats.entityReinforcements"),
          key: "erein" as const,
        },
        {
          type: "grouped" as const,
          label: t("counterStatistics.stats.veterancy"),
          items: [
            { key: "svetxp" as const, shortLabel: t("counterStatistics.labels.squadXp") },
            { key: "svetrank" as const, shortLabel: t("counterStatistics.labels.squadRank") },
            { key: "vvetrank" as const, shortLabel: t("counterStatistics.labels.vehicleRank") },
          ],
        },
        {
          type: "simple" as const,
          label: t("counterStatistics.stats.maxPopulation"),
          key: "popmax" as const,
        },
        {
          type: "simple" as const,
          label: t("counterStatistics.stats.gameTime"),
          key: "gt" as const,
        },
      ],
    },
  ];

  return (
    <Card p="md" shadow="sm" w={"100%"} withBorder mb="md">
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between" align="center">
          <Title order={3}>{t("counterStatistics.title")}</Title>
          <Text size="sm" c="dimmed">
            {t("counterStatistics.totalMatches", { count: totalMatches })}
          </Text>
        </Group>
      </Card.Section>
      <Card.Section inheritPadding py="md">
        <Grid>
          {/* Total Column */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Title order={4} mb="sm">
              {t("counterStatistics.total")}
            </Title>
            <Stack gap="xs">
              {statGroups.map((group, index) => (
                <React.Fragment key={`total-${group.title}-${index}`}>
                  {renderStatGroup(group.title, group.stats, false)}
                </React.Fragment>
              ))}
            </Stack>
          </Grid.Col>

          {/* Average Column */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Title order={4} mb="sm">
              {t("counterStatistics.average")}
            </Title>
            <Stack gap="xs">
              {statGroups.map((group, index) => (
                <React.Fragment key={`average-${group.title}-${index}`}>
                  {renderStatGroup(group.title, group.stats, true)}
                </React.Fragment>
              ))}
            </Stack>
          </Grid.Col>
        </Grid>
      </Card.Section>
    </Card>
  );
};

export default CounterStatisticsCard;
