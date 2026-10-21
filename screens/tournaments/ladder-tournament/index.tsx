import React, { useEffect } from "react";
import Link from "next/link";
import { NextPage } from "next";
import { NextSeo } from "next-seo";
import {
  Anchor,
  Avatar,
  Box,
  Breadcrumbs,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconExternalLink,
  IconPlayerPlayFilled,
  IconStarFilled,
  IconSwords,
  IconTrophyFilled,
  IconUsers,
} from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import config from "../../../config";
import {
  formatRecord,
  LadderSeasonPageData,
  LadderSeasonSummary,
} from "../../../src/tournaments/ladder-tournament";
import {
  LADDER_TOURNAMENT,
  LADDER_TOURNAMENT_DISCORD_URL,
  LADDER_TOURNAMENT_INTRO_VIDEO_URL,
} from "../../../src/tournaments/tournaments-registry";
import TournamentIntroVideoCard from "../../../components/tournament-videos/tournament-intro-video-card";
import { getLadderTournamentRoute, getTournamentsRoute } from "../../../src/routes";
import { generateLanguageAlternates } from "../../../src/seo-utils";
import { AnalyticsLadderTournamentSeasonView } from "../../../src/firebase/analytics";
import LadderPlayerLink from "../components/ladder-player-link";
import SeasonPicker from "./season-picker";
import StandingsTable from "./standings-table";
import CastsByStage from "./casts-by-stage";
import AllSeasonsTable from "./all-seasons-table";
import classes from "./ladder-tournament.module.css";

export type LadderTournamentPageProps = {
  // null when the Ladder Tournament data couldn't be loaded
  data: LadderSeasonPageData | null;
  // true on /tournaments/ladder-tournament (latest season), used for the canonical URL
  isLatestRoute: boolean;
};

const ExternalLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
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

const SeasonStat = ({
  icon,
  label,
  value,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  testId: string;
}) => (
  <Group gap={8} wrap="nowrap" data-testid={testId}>
    <ThemeIcon variant="light" color="gray" size="md" radius="md">
      {icon}
    </ThemeIcon>
    <Text size="sm" style={{ whiteSpace: "nowrap" }}>
      <Text span fw={700} inherit>
        {value}
      </Text>{" "}
      <Text span c="dimmed" inherit>
        {label}
      </Text>
    </Text>
  </Group>
);

/**
 * One compact bar with the season numbers on the left and the champions on the right.
 */
const SeasonStatsBar = ({ summary }: { summary: LadderSeasonSummary }) => {
  const { t } = useTranslation("tournaments");

  return (
    <Paper withBorder radius="md" px="md" py="sm" data-testid="ladder-season-stats">
      <Group justify="space-between" gap="md" wrap="wrap">
        <Group gap="lg" wrap="wrap">
          <SeasonStat
            icon={<IconUsers size={16} />}
            label={t("league.tiles.players")}
            value={summary.players}
            testId="ladder-stat-players"
          />
          <SeasonStat
            icon={<IconPlayerPlayFilled size={14} />}
            label={t("league.tiles.casts")}
            value={summary.casts}
            testId="ladder-stat-casts"
          />
          <SeasonStat
            icon={<IconSwords size={16} />}
            label={t("league.tiles.championsRecord")}
            value={formatRecord(summary.championsRecord)}
            testId="ladder-stat-record"
          />
          <SeasonStat
            icon={<IconStarFilled size={14} />}
            label={t("league.tiles.topScore")}
            value={summary.topScore ?? "—"}
            testId="ladder-stat-top-score"
          />
        </Group>
        {summary.champions.length > 0 && (
          <Group gap="sm" wrap="wrap" data-testid="ladder-champions">
            <Group gap={6} wrap="nowrap">
              <IconTrophyFilled size={18} color="var(--mantine-color-yellow-6)" />
              <Text size="sm" fw={700}>
                {t("league.champions")}
              </Text>
            </Group>
            {summary.champions.map((champion) => (
              <LadderPlayerLink key={champion.relicId} {...champion} />
            ))}
          </Group>
        )}
      </Group>
    </Paper>
  );
};

/**
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
              <ExternalLink href={LADDER_TOURNAMENT_DISCORD_URL}>
                {t("league.discord")}
              </ExternalLink>
            </Text>
          </Stack>
        </Group>
        <Box className={classes.introVideo}>
          <TournamentIntroVideoCard
            url={LADDER_TOURNAMENT_INTRO_VIDEO_URL}
            label={t("league.introVideo")}
          />
        </Box>
      </Group>
    </Stack>
  );
};

const LadderTournamentScreen: NextPage<LadderTournamentPageProps> = ({ data, isLatestRoute }) => {
  const { t } = useTranslation("tournaments");
  const seasonId = data?.seasonId;

  useEffect(() => {
    if (seasonId !== undefined) {
      AnalyticsLadderTournamentSeasonView(seasonId);
    }
  }, [seasonId]);

  const path =
    isLatestRoute || seasonId === undefined
      ? getLadderTournamentRoute()
      : getLadderTournamentRoute(seasonId);
  const title =
    seasonId === undefined ? t("meta.leagueTitle") : t("meta.seasonTitle", { season: seasonId });
  const description =
    seasonId === undefined
      ? t("meta.leagueDescription")
      : t("meta.seasonDescription", { season: seasonId });

  const seo = (
    <NextSeo
      title={title}
      description={description}
      canonical={`${config.SITE_URL}${path}`}
      openGraph={{ title, description, url: `${config.SITE_URL}${path}`, type: "website" }}
      languageAlternates={generateLanguageAlternates(path)}
    />
  );

  if (!data) {
    return (
      <>
        {seo}
        <Container size="lg" p="md" data-testid="ladder-tournament-page">
          <Stack gap="lg">
            <LeagueHeader />
            <Paper withBorder radius="md" p="lg" data-testid="ladder-tournament-unavailable">
              <Text>{t("league.unavailable")}</Text>
              <Text size="sm" mt="xs">
                <ExternalLink href={LADDER_TOURNAMENT.url}>
                  {t("league.officialSite")}
                </ExternalLink>
              </Text>
            </Paper>
          </Stack>
        </Container>
      </>
    );
  }

  const summary = data.seasons.find((season) => season.seasonId === data.seasonId);

  return (
    <>
      {seo}
      <Container size="lg" p="md" data-testid="ladder-tournament-page">
        <Stack gap="xl">
          <LeagueHeader seasonId={isLatestRoute ? undefined : data.seasonId} />

          <Stack gap="md">
            <Group justify="space-between" align="center" gap="sm">
              <Title order={2} size="h3" data-testid="ladder-season-title">
                {t("league.season", { season: data.seasonId })}
              </Title>
              <SeasonPicker
                seasonId={data.seasonId}
                seasonIds={data.seasons.map((season) => season.seasonId)}
              />
            </Group>
            {summary && <SeasonStatsBar summary={summary} />}
          </Stack>

          <Stack gap="sm">
            <Group justify="space-between" align="baseline" gap="xs">
              <Title order={2} size="h3">
                {t("league.standings.title")}
              </Title>
              {data.standings.length > 0 && (
                <Text size="sm" c="dimmed">
                  {t("league.standings.sortNote")}
                </Text>
              )}
            </Group>
            {data.standings.length > 0 ? (
              <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
                <StandingsTable standings={data.standings} key={data.seasonId} />
              </Paper>
            ) : (
              <Text c="dimmed" data-testid="ladder-standings-not-available">
                {t("league.standings.notAvailable")}
              </Text>
            )}
          </Stack>

          {data.stages.length > 0 && (
            <Stack gap="sm" data-testid="ladder-casts">
              <Title order={2} size="h3">
                {t("league.casts.title")}
              </Title>
              <CastsByStage stages={data.stages} />
            </Stack>
          )}

          <Stack gap="sm">
            <Title order={2} size="h3">
              {t("league.allSeasons.title")}
            </Title>
            <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
              <AllSeasonsTable seasons={data.seasons} seasonId={data.seasonId} />
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export default LadderTournamentScreen;
