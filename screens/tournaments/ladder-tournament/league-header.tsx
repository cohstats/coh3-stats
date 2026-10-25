import React from "react";
import Link from "next/link";
import { Anchor, Avatar, Box, Breadcrumbs, Group, Stack, Text, Title } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import config from "../../../config";
import { LADDER_TOURNAMENT } from "../../../src/tournaments/tournaments-registry";
import TournamentIntroVideoCard from "../../../components/tournament-videos/tournament-intro-video-card";
import { getLadderTournamentRoute, getTournamentsRoute } from "../../../src/routes";
import classes from "./ladder-tournament.module.css";

export const ExternalLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Anchor
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    size="sm"
    style={{ display: "inline-flex", alignItems: "center", gap: 2 }}
  >
    {children}
    <IconExternalLink size={13} />
  </Anchor>
);

/**
 * Breadcrumbs, logo, links and the intro video, shared by the overview and the season pages.
 * @param seasonId Season shown in the breadcrumb, only on the season pages
 */
const LeagueHeader = ({ seasonId }: { seasonId?: number }) => {
  const { t } = useTranslation("tournaments");
  const name = t(LADDER_TOURNAMENT.nameKey);

  return (
    <Stack gap="md">
      <Breadcrumbs separator="/" data-testid="ladder-breadcrumbs">
        <Anchor component={Link} href={getTournamentsRoute()} size="sm">
          {t("hub.title")}
        </Anchor>
        {seasonId === undefined ? (
          <Text size="sm" c="dimmed">
            {name}
          </Text>
        ) : (
          <Anchor component={Link} href={getLadderTournamentRoute()} size="sm">
            {name}
          </Anchor>
        )}
        {seasonId !== undefined && (
          <Text size="sm" c="dimmed">
            {t("league.season", { season: seasonId })}
          </Text>
        )}
      </Breadcrumbs>

      <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
        <Group gap="lg" wrap="nowrap" align="flex-start">
          <Avatar
            src={LADDER_TOURNAMENT.logo}
            alt={name}
            className={classes.leagueLogo}
            radius="md"
            color={LADDER_TOURNAMENT.color}
            variant="light"
          >
            {LADDER_TOURNAMENT.monogram}
          </Avatar>
          <Stack gap={6}>
            <Title order={1} lh={1.1} className={classes.leagueTitle}>
              {name}
            </Title>
            <Text c="dimmed">
              {t("league.communityLadder")}
              {" · "}
              <ExternalLink href={LADDER_TOURNAMENT.url}>{t("league.officialSite")}</ExternalLink>
              {" · "}
              <ExternalLink href={config.tournaments.ladderTournament.discordUrl}>
                {t("league.discord")}
              </ExternalLink>
            </Text>
          </Stack>
        </Group>
        <Box className={classes.introVideo}>
          <TournamentIntroVideoCard
            url={config.tournaments.ladderTournament.introVideoUrl}
            label={t("league.introVideo")}
          />
        </Box>
      </Group>
    </Stack>
  );
};

export default LeagueHeader;
