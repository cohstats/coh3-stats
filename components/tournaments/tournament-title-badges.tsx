import React from "react";
import { Badge, Group, Text } from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";

/**
 * Badges of the won tournament titles, a dash when there are none.
 * Needs the players namespace loaded.
 * @param titles Keys of the titles, translated with players:tournaments.titles.<key>
 */
const TournamentTitleBadges = ({ titles }: { titles: string[] }) => {
  const { t } = useTranslation("players");

  if (titles.length === 0) {
    return <Text c="dimmed">—</Text>;
  }

  return (
    <Group gap={4}>
      {titles.map((title) => (
        <Badge key={title} color="yellow" variant="light" leftSection={<IconTrophy size={13} />}>
          {t(`tournaments.titles.${title}`)}
        </Badge>
      ))}
    </Group>
  );
};

export default TournamentTitleBadges;
