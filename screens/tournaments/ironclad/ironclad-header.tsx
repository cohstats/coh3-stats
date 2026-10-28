import React from "react";
import Link from "next/link";
import { Anchor, Avatar, Breadcrumbs, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import config from "../../../config";
import { IRONCLAD_TOURNAMENT } from "../../../src/tournaments/tournaments-registry";
import { getIroncladTournamentsRoute, getTournamentsRoute } from "../../../src/routes";
import { ExternalLink } from "../ladder-tournament/league-header";
import classes from "./ironclad.module.css";

/**
 * Breadcrumbs, logo and the links, shared by the overview and the tournament pages.
 * @param tournamentName Tournament shown in the breadcrumb and as the title, only on the tournament pages
 * @param children Status line below the title
 */
const IroncladHeader = ({
  tournamentName,
  officialUrl = IRONCLAD_TOURNAMENT.url,
  children,
}: {
  tournamentName?: string;
  officialUrl?: string;
  children?: React.ReactNode;
}) => {
  const { t } = useTranslation("tournaments");
  const name = t(IRONCLAD_TOURNAMENT.nameKey);

  return (
    <Stack gap="md">
      <Breadcrumbs separator="/" data-testid="ironclad-breadcrumbs">
        <Anchor component={Link} href={getTournamentsRoute()} size="sm">
          {t("hub.title")}
        </Anchor>
        {tournamentName === undefined ? (
          <Text size="sm" c="dimmed">
            {name}
          </Text>
        ) : (
          <Anchor component={Link} href={getIroncladTournamentsRoute()} size="sm">
            {name}
          </Anchor>
        )}
        {tournamentName !== undefined && (
          <Text size="sm" c="dimmed">
            {tournamentName}
          </Text>
        )}
      </Breadcrumbs>

      <Group gap="lg" wrap="nowrap" align="flex-start">
        <Avatar
          src={IRONCLAD_TOURNAMENT.logo}
          alt={name}
          className={classes.logo}
          radius="md"
          color={IRONCLAD_TOURNAMENT.color}
          variant="light"
          styles={{ image: { objectFit: "contain" } }}
        >
          {IRONCLAD_TOURNAMENT.monogram}
        </Avatar>
        <Stack gap={6} style={{ minWidth: 0 }}>
          <Title order={1} lh={1.1} className={classes.title}>
            {tournamentName ?? name}
          </Title>
          <Text c="dimmed">
            {tournamentName === undefined ? t("ironclad.verifiedEloDivisions") : name}
            {" · "}
            <ExternalLink href={officialUrl}>{t("ironclad.officialSite")}</ExternalLink>
            {" · "}
            <ExternalLink href={config.tournaments.ironclad.discordUrl}>
              {t("league.discord")}
            </ExternalLink>
          </Text>
          {children}
        </Stack>
      </Group>
    </Stack>
  );
};

export default IroncladHeader;
