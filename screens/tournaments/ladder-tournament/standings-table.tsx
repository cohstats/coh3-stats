import React, { useState } from "react";
import Link from "next/link";
import { Anchor, Button, Group, Progress, Table, Text } from "@mantine/core";
import { IconChevronDown, IconChevronUp, IconPlayerPlayFilled } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import type { LadderStandingRow } from "../../../src/tournaments/ladder-tournament";
import { formatWinRate } from "../../../src/players/tournaments";
import { getPlayerCardTournamentsRoute } from "../../../src/routes";
import TournamentTitleBadges from "../../../components/tournaments/tournament-title-badges";
import LadderPlayerLink from "../components/ladder-player-link";
import classes from "./ladder-tournament.module.css";

const Dash = () => <Text c="dimmed">—</Text>;

// Rows shown until the table is expanded
export const COLLAPSED_STANDINGS_ROWS = 10;

/**
 * Shows the top 10 with a button to expand the whole table.
 * All the rows are always rendered (the rest only hidden), the full table in the HTML is better for SEO.
 */
const StandingsTable = ({ standings }: { standings: LadderStandingRow[] }) => {
  const { t } = useTranslation("tournaments");
  const [expanded, setExpanded] = useState(false);
  const canExpand = standings.length > COLLAPSED_STANDINGS_ROWS;

  return (
    <>
      <Table.ScrollContainer minWidth={820} type="native">
        <Table verticalSpacing="xs" horizontalSpacing="md" data-testid="ladder-standings-table">
          <Table.Thead className={classes.head}>
            <Table.Tr>
              <Table.Th w={70} className={classes.headCell}>
                {t("league.standings.columns.score")}
              </Table.Th>
              <Table.Th className={classes.headCell}>
                {t("league.standings.columns.player")}
              </Table.Th>
              <Table.Th className={classes.headCell}>
                {t("league.standings.columns.winsLosses")}
              </Table.Th>
              <Table.Th className={classes.headCell}>
                {t("league.standings.columns.winRate")}
              </Table.Th>
              <Table.Th className={classes.headCell}>
                {t("league.standings.columns.matches")}
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
            {standings.map((row, index) => (
              <Table.Tr
                key={row.relicId}
                className={
                  [
                    row.isChampion && classes.championRow,
                    !expanded && index >= COLLAPSED_STANDINGS_ROWS && classes.collapsedRow,
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                data-testid={`ladder-standing-${row.relicId}`}
                data-champion={row.isChampion || undefined}
              >
                <Table.Td>
                  <Text fw={700}>{row.score}</Text>
                </Table.Td>
                <Table.Td maw={260}>
                  <LadderPlayerLink
                    relicId={row.relicId}
                    alias={row.alias}
                    country={row.country}
                  />
                </Table.Td>
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
                <Table.Td>{row.matches}</Table.Td>
                <Table.Td>
                  <TournamentTitleBadges titles={row.titles} />
                </Table.Td>
                <Table.Td>
                  {row.castsCount > 0 ? (
                    // The player card tournaments tab lists the casts of the player
                    <Anchor
                      component={Link}
                      href={getPlayerCardTournamentsRoute(row.relicId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      fw={600}
                    >
                      <Group gap={4} wrap="nowrap">
                        <IconPlayerPlayFilled size={12} />
                        <span>{row.castsCount}</span>
                      </Group>
                    </Anchor>
                  ) : (
                    <Dash />
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {canExpand && (
        <Group justify="center" py="xs">
          <Button
            variant="subtle"
            size="sm"
            onClick={() => setExpanded((value) => !value)}
            rightSection={expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            aria-expanded={expanded}
            data-testid="ladder-standings-toggle"
          >
            {expanded
              ? t("league.standings.showLess")
              : t("league.standings.showAll", { count: standings.length })}
          </Button>
        </Group>
      )}
    </>
  );
};

export default StandingsTable;
