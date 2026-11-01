import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
import { Container, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import { LadderSeasonPageData } from "../../../src/tournaments/ladder-tournament";
import { LADDER_TOURNAMENT } from "../../../src/tournaments/tournaments-registry";
import { getLadderTournamentRoute, getTournamentsRoute } from "../../../src/routes";
import PageJsonLd from "../../../components/page-json-ld";
import { generateLanguageAlternates, getLocalizedUrl } from "../../../src/seo-utils";
import { AnalyticsLadderTournamentSeasonView } from "../../../src/firebase/analytics";
import LeagueHeader, { ExternalLink } from "./league-header";
import SeasonStatsBar from "./season-stats-bar";
import StandingsTable from "./standings-table";
import CastsByStage, { LADDER_CASTS_ANCHOR } from "./casts-by-stage";
import {
  getLadderSeasonTitle,
  LadderSeasonInfoCard,
  LadderSeasonStatusBadge,
} from "../components/ladder-season";
import classes from "./ladder-tournament.module.css";

export type LadderTournamentPageProps = {
  // null when the Ladder Tournament data couldn't be loaded
  data: LadderSeasonPageData | null;
};

/**
 * A single season of the Ladder Tournament - /tournaments/ladder-tournament/season/N.
 * The overview with all the seasons is LadderTournamentOverviewScreen.
 */
const LadderTournamentScreen: NextPage<LadderTournamentPageProps> = ({ data }) => {
  const { locale = "en" } = useRouter();
  const { t } = useTranslation("tournaments");
  const seasonId = data?.seasonId;

  useEffect(() => {
    if (seasonId !== undefined) {
      AnalyticsLadderTournamentSeasonView(seasonId);
    }
  }, [seasonId]);

  const path = getLadderTournamentRoute(seasonId);
  const title =
    seasonId === undefined ? t("meta.leagueTitle") : t("meta.seasonTitle", { season: seasonId });
  const description =
    seasonId === undefined
      ? t("meta.leagueDescription")
      : t("meta.seasonDescription", { season: seasonId });

  // Without the data this is the league page
  const leagueName = t(LADDER_TOURNAMENT.nameKey);
  const breadcrumbTrail = [
    { name: t("common:mainMenu.tournaments"), path: getTournamentsRoute() },
    ...(seasonId === undefined ? [] : [{ name: leagueName, path: getLadderTournamentRoute() }]),
  ];

  const seo = (
    <>
      <Head>
        {generateNextSeo({
          title,
          description,
          canonical: getLocalizedUrl(path, locale),
          openGraph: { title, description, url: getLocalizedUrl(path, locale) },
          languageAlternates: generateLanguageAlternates(path),
        })}
      </Head>
      <PageJsonLd
        path={path}
        name={title}
        description={description}
        breadcrumbName={
          seasonId === undefined ? leagueName : t("league.season", { season: seasonId })
        }
        trail={breadcrumbTrail}
      />
    </>
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
  const info = summary?.info ?? null;
  const seasonTitle = getLadderSeasonTitle(t, { seasonId: data.seasonId, info });

  return (
    <>
      {seo}
      <Container size="lg" p="md" data-testid="ladder-tournament-page">
        <Stack gap="xl">
          <LeagueHeader seasonTitle={seasonTitle}>
            {info && (
              <Group gap={6}>
                <LadderSeasonStatusBadge status={info.status} />
              </Group>
            )}
          </LeagueHeader>

          <Stack gap="md">
            {/* An upcoming season has nothing to count yet */}
            {summary && (summary.players > 0 || summary.casts > 0) && (
              <SeasonStatsBar summary={summary} />
            )}
            {info && <LadderSeasonInfoCard info={info} />}
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
            <Stack
              gap="sm"
              id={LADDER_CASTS_ANCHOR}
              className={classes.castsSection}
              data-testid="ladder-casts"
            >
              <Title order={2} size="h3">
                {t("league.casts.title")}
              </Title>
              <CastsByStage stages={data.stages} />
            </Stack>
          )}
        </Stack>
      </Container>
    </>
  );
};

export default LadderTournamentScreen;
