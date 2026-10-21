import React from "react";
import { Group, Progress, Table, Text } from "@mantine/core";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import type { LadderStandingRow } from "../../../src/tournaments/ladder-tournament";
import { formatWinRate } from "../../../src/players/tournaments";
import TournamentTitleBadges from "../../../components/tournaments/tournament-title-badges";
import LadderPlayerLink from "../components/ladder-player-link";
import classes from "./ladder-tournament.module.css";

const Dash = () => <Text c="dimmed">—</Text>;

/**
 * All the standings rows are rendered (no paging), the full table in the HTML is better for SEO.
 */
const StandingsTable = ({ standings }: { standings: LadderStandingRow[] }) => {
  const { t } = useTranslation("tournaments");

  return (
    <Table.ScrollContainer minWidth={820} type="native">
      <Table verticalSpacing="xs" horizontalSpacing="md" data-testid="ladder-standings-table">
        <Table.Thead className={classes.head}>
          <Table.Tr>
            <Table.Th w={50} className={classes.headCell}>
              {t("league.standings.columns.rank")}
            </Table.Th>
            <Table.Th className={classes.headCell}>
              {t("league.standings.columns.player")}
            </Table.Th>
            <Table.Th className={classes.headCell}>
              {t("league.standings.columns.matches")}
            </Table.Th>
            <Table.Th className={classes.headCell}>
              {t("league.standings.columns.winsLosses")}
            </Table.Th>
            <Table.Th className={classes.headCell}>
              {t("league.standings.columns.winRate")}
            </Table.Th>
            <Table.Th className={classes.headCell}>
              {t("league.standings.columns.score")}
            </Table.Th>
            <Table.Th className={classes.headCell}>
              {t("league.standings.columns.titles")}
            </Table.Th>
            <Table.Th className={classes.headCell}>
              {t("league.standings.columns.casts")}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {standings.map((row) => (
            <Table.Tr
              key={row.relicId}
              className={row.isChampion ? classes.championRow : undefined}
              data-testid={`ladder-standing-${row.relicId}`}
              data-champion={row.isChampion || undefined}
            >
              <Table.Td>
                <Text fw={700}>{row.rank}</Text>
              </Table.Td>
              <Table.Td maw={260}>
                <LadderPlayerLink relicId={row.relicId} alias={row.alias} country={row.country} />
              </Table.Td>
              <Table.Td>{row.matches}</Table.Td>
              <Table.Td style={{ whiteSpace: "nowrap" }}>
                <Text span c="green">
                  {row.wins}
                </Text>
                <Text span c="dimmed">
                  {" / "}
                </Text>
                <Text span c="red">
                  {row.losses}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group gap={8} wrap="nowrap">
                  <Text size="sm" w={38}>
                    {formatWinRate(row.winRate)}
                  </Text>
                  <Progress
                    value={Math.min(Math.max(row.winRate * 100, 0), 100)}
                    size="sm"
                    w={60}
                    color={row.winRate >= 0.5 ? "green" : "red"}
                    aria-hidden
                  />
                </Group>
              </Table.Td>
              <Table.Td>
                <Text fw={600}>{row.score}</Text>
              </Table.Td>
              <Table.Td>
                <TournamentTitleBadges titles={row.titles} />
              </Table.Td>
              <Table.Td>
                {row.castsCount > 0 ? (
                  <Group gap={4} wrap="nowrap">
                    <IconPlayerPlayFilled size={12} />
                    <Text span size="sm" fw={600}>
                      {row.castsCount}
                    </Text>
                  </Group>
                ) : (
                  <Dash />
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default StandingsTable;
