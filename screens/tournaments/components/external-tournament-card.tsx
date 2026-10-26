import React from "react";
import { Avatar, Badge, Card, Divider, Group, Stack, Text, Title } from "@mantine/core";
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
      className={`${classes.externalCard} mantine-focus-auto`}
      onClick={() => AnalyticsTournamentExternalClick(tournament.id)}
      data-testid={`tournament-card-${tournament.id}`}
      h="100%"
    >
      <Stack gap="md" h="100%">
        <Group gap="md" wrap="nowrap">
          <Avatar
            src={tournament.logo}
            alt={t(tournament.nameKey)}
            size="clamp(80px, 10vw, 88px)"
            radius="md"
            color={tournament.color}
            variant="light"
            styles={{ image: { objectFit: "contain" } }}
          >
            {tournament.monogram}
          </Avatar>
          <Title
            order={2}
            size="h3"
            fz={{ base: 18, xs: 22 }}
            style={{ minWidth: 0, lineHeight: 1.25 }}
          >
            {t(tournament.nameKey)}
          </Title>
        </Group>
        <Text size="sm" c="dimmed" lh={1.6}>
          {t(tournament.descriptionKey)}
        </Text>
        {!!tournament.tags?.length && (
          <Group gap={6}>
            {tournament.tags.map((tag) => (
              <Badge
                key={tag.labelKey}
                size="md"
                radius="sm"
                color={tag.emphasized ? tournament.color : "gray"}
                variant="light"
                tt="none"
              >
                {t(tag.labelKey)}
              </Badge>
            ))}
          </Group>
        )}
        <Stack gap="sm" mt="auto" pt="xs">
          <Divider />
          <Group gap="xs" justify="space-between" wrap="nowrap" mih={28}>
            <Text size="sm" c="blue" fw={600}>
              {t(tournament.ctaKey ?? "hub.visitSite")}
            </Text>
            <IconExternalLink
              size={16}
              color="var(--mantine-color-blue-filled)"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            />
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
};

export default ExternalTournamentCard;
