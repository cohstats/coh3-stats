import React from "react";
import { Avatar, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import { TournamentInfo } from "../../../src/tournaments/tournaments-registry";
import { AnalyticsTournamentExternalClick } from "../../../src/firebase/analytics";
import classes from "../tournaments.module.css";

/**
 * Tournament without data on COH3 Stats, the whole card links out to its site.
 */
const ExternalTournamentCard = ({ tournament }: { tournament: TournamentInfo }) => {
  const { t } = useTranslation("tournaments");

  return (
    <Card
      component="a"
      href={tournament.url}
      target="_blank"
      rel="noopener noreferrer"
      withBorder
      radius="md"
      padding="lg"
      className={classes.externalCard}
      onClick={() => AnalyticsTournamentExternalClick(tournament.id)}
      data-testid={`tournament-card-${tournament.id}`}
    >
      <Group gap="md" wrap="nowrap" align="flex-start">
        <Avatar
          src={tournament.logo}
          alt={t(tournament.nameKey)}
          size={72}
          radius="md"
          color={tournament.color}
          variant="light"
        >
          {tournament.monogram}
        </Avatar>
        <Stack gap={4} style={{ minWidth: 0 }}>
          <Title order={2} size="h4">
            {t(tournament.nameKey)}
          </Title>
          <Text size="sm" c="dimmed">
            {t(tournament.descriptionKey)}
          </Text>
          <Text
            size="sm"
            c="blue"
            fw={500}
            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            {t("hub.visitSite")}
            <IconExternalLink size={14} />
          </Text>
        </Stack>
      </Group>
    </Card>
  );
};

export default ExternalTournamentCard;
