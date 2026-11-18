import React, { useMemo } from "react";
import { Group, Progress, Stack, Table, Text, Tooltip } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import {
  getIroncladPlayerRecords,
  type IroncladBracketRound,
  type IroncladPlayer,
} from "../../../src/tournaments/ironclad-tournament";
import { formatWinRate } from "../../../src/players/tournaments";
import IroncladPlayerLink from "../components/ironclad-player-link";
import classes from "./ironclad.module.css";

const Dash = () => (
  <Text size="sm" c="dimmed">
    —
  </Text>
);

const numeric = { fontVariantNumeric: "tabular-nums" } as const;

/**
 * Participants of a division, sorted by the event ELO.
 * The bracket record (matches and games) is computed from the bracket rounds.
 */
const ParticipantsTable = ({
  participants,
  rounds,
}: {
  participants: IroncladPlayer[];
  rounds: IroncladBracketRound[] | null;
}) => {
  const { t } = useTranslation("tournaments");
  const records = useMemo(() => getIroncladPlayerRecords(rounds), [rounds]);

  return (
    <Table.ScrollContainer minWidth={560} type="native">
      <Table verticalSpacing="xs" horizontalSpacing="lg" data-testid="ironclad-participants">
        <Table.Thead className={classes.head}>
          <Table.Tr>
            <Table.Th w={48} className={classes.headCell}>
              #
            </Table.Th>
            <Table.Th className={classes.headCell}>{t("ironclad.participants.player")}</Table.Th>
            <Table.Th className={classes.headCell}>
              {t("ironclad.participants.winsLosses")}
            </Table.Th>
            <Table.Th className={classes.headCell}>{t("ironclad.participants.winRate")}</Table.Th>
            <Table.Th className={classes.headCell}>
              <Tooltip label={t("ironclad.participants.gamesTooltip")} withArrow>
                <span>{t("ironclad.participants.games")}</span>
              </Tooltip>
            </Table.Th>
            <Table.Th w={120} ta="right" className={classes.headCell}>
              {t("ironclad.participants.eventElo")}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {participants.map((player, index) => {
            const record = records.get(player.registrationId);
            const matches = record ? record.wins + record.losses : 0;
            const winRate = record && matches > 0 ? record.wins / matches : null;

            return (
              <Table.Tr
                key={player.registrationId}
                data-testid={`ironclad-participant-${player.registrationId}`}
              >
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {index + 1}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Stack gap={0} style={{ minWidth: 0 }}>
                    <IroncladPlayerLink player={player} />
                    {player.alias && player.alias !== player.eventAlias && (
                      <Text size="xs" c="dimmed" truncate="end">
                        {player.alias}
                      </Text>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td style={{ whiteSpace: "nowrap", ...numeric }}>
                  {record && matches > 0 ? (
                    <Text size="sm">
                      <Text span c="green" inherit>
                        {record.wins}
                      </Text>
                      <Text span c="dimmed" inherit>
                        {" / "}
                      </Text>
                      <Text span c="red" inherit>
                        {record.losses}
                      </Text>
                    </Text>
                  ) : (
                    <Dash />
                  )}
                </Table.Td>
                <Table.Td>
                  {winRate !== null ? (
                    <Group gap={8} wrap="nowrap">
                      <Text size="sm" w={38} style={numeric}>
                        {formatWinRate(winRate)}
                      </Text>
                      <Progress
                        value={winRate * 100}
                        size="sm"
                        w={60}
                        color={winRate >= 0.5 ? "green" : "red"}
                        aria-hidden
                      />
                    </Group>
                  ) : (
                    <Dash />
                  )}
                </Table.Td>
                <Table.Td style={{ whiteSpace: "nowrap" }}>
                  {record && record.gamesWon + record.gamesLost > 0 ? (
                    <Text size="sm" c="dimmed" style={numeric}>
                      {record.gamesWon} - {record.gamesLost}
                    </Text>
                  ) : (
                    <Dash />
                  )}
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" fw={600} style={numeric}>
                    {player.eventElo ?? "—"}
                  </Text>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default ParticipantsTable;
