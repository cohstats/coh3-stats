import React from "react";
import Link from "next/link";
import { Anchor, Group, Table, Text } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import { formatRecord, LadderSeasonSummary } from "../../../src/tournaments/ladder-tournament";
import { getLadderTournamentRoute } from "../../../src/routes";
import LadderPlayerLink from "../components/ladder-player-link";
import classes from "./ladder-tournament.module.css";

const Dash = () => <Text c="dimmed">—</Text>;

/**
 * All the seasons, the main way to browse many seasons - the season picker is the shortcut.
 */
const AllSeasonsTable = ({
  seasons,
  seasonId,
}: {
  seasons: LadderSeasonSummary[];
  seasonId: number;
}) => {
  const { t } = useTranslation("tournaments");

  return (
    <Table.ScrollContainer minWidth={640} type="native">
      <Table verticalSpacing="xs" horizontalSpacing="md" data-testid="ladder-all-seasons-table">
        <Table.Thead className={classes.head}>
          <Table.Tr>
            <Table.Th className={classes.headCell}>
              {t("league.allSeasons.columns.season")}
            </Table.Th>
            <Table.Th className={classes.headCell}>
              {t("league.allSeasons.columns.players")}
            </Table.Th>
            <Table.Th className={classes.headCell}>
              {t("league.allSeasons.columns.casts")}
            </Table.Th>
            <Table.Th className={classes.headCell}>
              {t("league.allSeasons.columns.champions")}
            </Table.Th>
            <Table.Th className={classes.headCell}>
              {t("league.allSeasons.columns.record")}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {seasons.map((season) => {
            const isCurrent = season.seasonId === seasonId;
            return (
              <Table.Tr
                key={season.seasonId}
                className={isCurrent ? classes.currentSeasonRow : undefined}
                aria-current={isCurrent ? "page" : undefined}
                data-testid={`ladder-season-row-${season.seasonId}`}
              >
                <Table.Td style={{ whiteSpace: "nowrap" }}>
                  <Anchor
                    component={Link}
                    href={getLadderTournamentRoute(season.seasonId)}
                    fw={isCurrent ? 700 : 500}
                    size="sm"
                  >
                    {t("league.season", { season: season.seasonId })}
                  </Anchor>
                </Table.Td>
                <Table.Td>{season.players}</Table.Td>
                <Table.Td>{season.casts}</Table.Td>
                <Table.Td>
                  {season.champions.length > 0 ? (
                    <Group gap="sm">
                      {season.champions.map((champion) => (
                        <LadderPlayerLink key={champion.relicId} {...champion} />
                      ))}
                    </Group>
                  ) : (
                    <Dash />
                  )}
                </Table.Td>
                <Table.Td style={{ whiteSpace: "nowrap" }}>
                  {formatRecord(season.championsRecord)}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default AllSeasonsTable;
