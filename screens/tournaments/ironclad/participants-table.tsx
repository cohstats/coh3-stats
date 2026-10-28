import React from "react";
import { Stack, Table, Text } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import type { IroncladPlayer } from "../../../src/tournaments/ironclad-tournament";
import IroncladPlayerLink from "../components/ironclad-player-link";
import classes from "./ironclad.module.css";

/**
 * Participants of a division, sorted by the event ELO.
 */
const ParticipantsTable = ({ participants }: { participants: IroncladPlayer[] }) => {
  const { t } = useTranslation("tournaments");

  return (
    <Table.ScrollContainer minWidth={360} type="native">
      <Table verticalSpacing="xs" horizontalSpacing="lg" data-testid="ironclad-participants">
        <Table.Thead className={classes.head}>
          <Table.Tr>
            <Table.Th w={48} className={classes.headCell}>
              #
            </Table.Th>
            <Table.Th className={classes.headCell}>{t("ironclad.participants.player")}</Table.Th>
            <Table.Th w={120} ta="right" className={classes.headCell}>
              {t("ironclad.participants.eventElo")}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {participants.map((player, index) => (
            <Table.Tr key={player.registrationId}>
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
              <Table.Td ta="right">
                <Text size="sm" fw={600} style={{ fontVariantNumeric: "tabular-nums" }}>
                  {player.eventElo ?? "—"}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default ParticipantsTable;
