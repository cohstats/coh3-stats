import {
  InternalStandings,
  leaderBoardType,
  leaderBoardTypeArray,
  ProcessedCOHPlayerStats,
  raceTypeArray,
  PlayerReportCounters,
} from "../../../../../src/coh3/coh3-types";
import { Card, Group, Title, Flex, Button, Stack, Text, Tooltip } from "@mantine/core";
import React from "react";
import HelperIcon from "../../../../../components/icon/helper";
import { localizedGameTypes } from "../../../../../src/coh3/coh3-data";
import classes from "../../Players.module.css";
import MoreButton from "../../components/more-button";
import { TFunction } from "next-i18next";

const CountersWidget = ({
  playerStatsData,
  playerStandings,
  moreButtonOnClick,
  t,
}: {
  playerStatsData: ProcessedCOHPlayerStats | undefined;
  playerStandings: InternalStandings;
  moreButtonOnClick: () => Promise<void>;
  t: TFunction;
}) => {
  const typeWithMostGames = React.useMemo(() => {
    type DataValues = Record<leaderBoardType, number>;
    const dataValues: DataValues = {
      "1v1": 0,
      "2v2": 0,
      "3v3": 0,
      "4v4": 0,
    };

    for (const faction of Object.values(playerStandings)) {
      leaderBoardTypeArray.forEach((gameType) => {
        const gameData = faction[gameType];
        if (gameData) {
          dataValues[gameType] += gameData.wins + gameData.losses;
        }
      });
    }

    return Object.entries(dataValues).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  }, [playerStandings]);

  const [selectedType, setSelectedType] = React.useState<"1v1" | "2v2" | "3v3" | "4v4">(
    (typeWithMostGames as "1v1" | "2v2" | "3v3" | "4v4") || "1v1",
  );

  // Calculate average counters across all factions for the selected game type
  const averageCounters = React.useMemo(() => {
    let totalMatches = 0;
    const aggregatedCounters: Partial<PlayerReportCounters> = {
      dmgdone: 0,
      ekills: 0,
      edeaths: 0,
      sqkill: 0,
      sqlost: 0,
      sqprod: 0,
      vkill: 0,
      vlost: 0,
      vprod: 0,
      totalcmds: 0,
      gt: 0,
    };

    raceTypeArray.forEach((faction) => {
      const factionData = playerStatsData?.statGroups?.[selectedType]?.[faction];
      if (factionData && factionData.counters) {
        const matches = factionData.w + factionData.l;
        totalMatches += matches;

        // Aggregate counters
        aggregatedCounters.dmgdone! += factionData.counters.dmgdone || 0;
        aggregatedCounters.ekills! += factionData.counters.ekills || 0;
        aggregatedCounters.edeaths! += factionData.counters.edeaths || 0;
        aggregatedCounters.sqkill! += factionData.counters.sqkill || 0;
        aggregatedCounters.sqlost! += factionData.counters.sqlost || 0;
        aggregatedCounters.sqprod! += factionData.counters.sqprod || 0;
        aggregatedCounters.vkill! += factionData.counters.vkill || 0;
        aggregatedCounters.vlost! += factionData.counters.vlost || 0;
        aggregatedCounters.vprod! += factionData.counters.vprod || 0;
        aggregatedCounters.totalcmds! += factionData.counters.totalcmds || 0;
        aggregatedCounters.gt! += factionData.counters.gt || 0;
      }
    });

    // Calculate averages
    if (totalMatches > 0) {
      return {
        dmgdone: Math.round(aggregatedCounters.dmgdone! / totalMatches),
        ekills: Math.round(aggregatedCounters.ekills! / totalMatches),
        edeaths: Math.round(aggregatedCounters.edeaths! / totalMatches),
        kd:
          aggregatedCounters.edeaths! > 0
            ? (aggregatedCounters.ekills! / aggregatedCounters.edeaths!).toFixed(1)
            : aggregatedCounters.ekills!.toFixed(1),
        sqkill: Math.round(aggregatedCounters.sqkill! / totalMatches),
        sqlost: Math.round(aggregatedCounters.sqlost! / totalMatches),
        sqprod: Math.round(aggregatedCounters.sqprod! / totalMatches),
        vkill: Math.round(aggregatedCounters.vkill! / totalMatches),
        vlost: Math.round(aggregatedCounters.vlost! / totalMatches),
        vprod: Math.round(aggregatedCounters.vprod! / totalMatches),
        apm:
          aggregatedCounters.gt! > 0
            ? ((aggregatedCounters.totalcmds! / aggregatedCounters.gt!) * 60).toFixed(1)
            : "0.0",
        totalMatches,
      };
    }

    return null;
  }, [playerStatsData, selectedType]);

  const renderStatRow = (label: string, value: string | number, tooltip?: string) => {
    return (
      <Group justify="space-between" gap="xs">
        <Text size="sm">
          {tooltip ? (
            <Tooltip label={tooltip} multiline w={200}>
              <span style={{ cursor: "help" }}>{label}</span>
            </Tooltip>
          ) : (
            label
          )}
        </Text>
        <Text size="sm" fw={500}>
          {value}
        </Text>
      </Group>
    );
  };

  return (
    <div>
      <Card padding="sm" radius="md" withBorder style={{ overflow: "visible" }}>
        <Card.Section>
          <Group m="xs" justify="space-between">
            <Title order={4}>
              {t("counters.widget.title", "Average Counters")} {localizedGameTypes[selectedType]}
            </Title>
            <HelperIcon
              text={t(
                "counters.widget.helperText",
                "Average counter statistics across all factions for the selected game mode.\n\nK - Kills\nL - Lost\nP - Produced",
              )}
              width={200}
              iconSize={23}
            />
          </Group>
        </Card.Section>

        {averageCounters && averageCounters.totalMatches > 0 ? (
          <>
            <Stack gap="xs" p="xs">
              {renderStatRow(
                t("counterStatistics.stats.damageData", "Damage Done"),
                averageCounters.dmgdone.toLocaleString(),
              )}
              {renderStatRow(
                t("counters.widget.unitsKD", "Units K / D / KD"),
                `${averageCounters.ekills} / ${averageCounters.edeaths} / ${averageCounters.kd}`,
                t("counters.widget.unitsKDTooltip", "Kills / Deaths / Kill-Death Ratio"),
              )}
              {renderStatRow(
                t("counters.widget.squadsKLP", "Squads K / L / P"),
                `${averageCounters.sqkill} / ${averageCounters.sqlost} / ${averageCounters.sqprod}`,
                t("counters.widget.squadsKLPTooltip", "Killed / Lost / Produced"),
              )}
              {renderStatRow(
                t("counters.widget.vehiclesKLP", "Vehicles K / L / P"),
                `${averageCounters.vkill} / ${averageCounters.vlost} / ${averageCounters.vprod}`,
                t("counters.widget.vehiclesKLPTooltip", "Killed / Lost / Produced"),
              )}
              {renderStatRow(
                t("counters.widget.apm", "APM"),
                averageCounters.apm,
                t("counters.widget.apmTooltip", "Actions Per Minute"),
              )}
              {renderStatRow(
                t("counters.widget.totalMatches", "Total Matches"),
                averageCounters.totalMatches,
              )}
            </Stack>

            <Flex justify={"center"} pt={"xs"}>
              <Button.Group>
                <Button
                  variant="default"
                  size={"compact-sm"}
                  className={classes.mapsWidgetButton}
                  onClick={() => setSelectedType("1v1")}
                >
                  1 vs 1
                </Button>
                <Button
                  variant="default"
                  size={"compact-sm"}
                  onClick={() => setSelectedType("2v2")}
                  className={classes.mapsWidgetButton}
                >
                  2 vs 2
                </Button>
                <Button
                  variant="default"
                  size={"compact-sm"}
                  onClick={() => setSelectedType("3v3")}
                  className={classes.mapsWidgetButton}
                >
                  3 vs 3
                </Button>
                <Button
                  variant="default"
                  size={"compact-sm"}
                  onClick={() => setSelectedType("4v4")}
                  className={classes.mapsWidgetButton}
                >
                  4 vs 4
                </Button>
              </Button.Group>
            </Flex>

            <Flex justify={"flex-end"} pt={"xs"}>
              <MoreButton onClick={moreButtonOnClick} />
            </Flex>
          </>
        ) : (
          <Text size="sm" c="dimmed" ta="center" p="md">
            {t("counters.widget.noData", "No counter data available for this game mode")}
          </Text>
        )}
      </Card>
    </div>
  );
};

export default CountersWidget;
