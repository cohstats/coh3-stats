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
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconExternalLink, IconTrophyFilled } from "@tabler/icons-react";
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

const SummaryTile = ({
  label,
  value,
  testId,
}: {
  label: string;
  value: React.ReactNode;
  testId: string;
}) => (
  <Paper withBorder radius="md" p="md" data-testid={testId}>
    <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts="0.06em">
      {label}
    </Text>
    <Text size="xl" fw={700} mt={4}>
      {value}
    </Text>
  </Paper>
);

const SeasonSummaryTiles = ({ summary }: { summary: LadderSeasonSummary }) => {
  const { t } = useTranslation("tournaments");

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
      <SummaryTile
        label={t("league.tiles.players")}
        value={summary.players}
        testId="ladder-tile-players"
      />
      <SummaryTile
        label={t("league.tiles.casts")}
        value={summary.casts}
        testId="ladder-tile-casts"
      />
      <SummaryTile
        label={t("league.tiles.championsRecord")}
        value={formatRecord(summary.championsRecord)}
        testId="ladder-tile-record"
      />
      <SummaryTile
        label={t("league.tiles.topScore")}
        value={summary.topScore ?? "—"}
        testId="ladder-tile-top-score"
      />
    </SimpleGrid>
  );
};

const ChampionsStrip = ({ summary }: { summary: LadderSeasonSummary }) => {
  const { t } = useTranslation("tournaments");

  if (summary.champions.length === 0) return null;

  return (
    <Paper withBorder radius="md" p="md" className={classes.championsStrip}>
      <Group gap="lg" wrap="wrap" data-testid="ladder-champions">
        <Group gap={6} wrap="nowrap">
          <IconTrophyFilled size={20} color="var(--mantine-color-yellow-6)" />
          <Text fw={700}>{t("league.champions")}</Text>
        </Group>
        {summary.champions.map((champion) => (
          <LadderPlayerLink key={champion.relicId} {...champion} />
        ))}
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

      <Group justify="space-between" align="center" wrap="wrap" gap="lg">
        <Group gap="lg" wrap="nowrap">
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
            <Title order={1} className={classes.leagueTitle}>
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
            {summary && <SeasonSummaryTiles summary={summary} />}
            {summary && <ChampionsStrip summary={summary} />}
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
                <StandingsTable standings={data.standings} />
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
