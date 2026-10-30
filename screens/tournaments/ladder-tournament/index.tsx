import React, { useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
import { Container, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import config from "../../../config";
import { LadderSeasonPageData } from "../../../src/tournaments/ladder-tournament";
import { LADDER_TOURNAMENT } from "../../../src/tournaments/tournaments-registry";
import { getLadderTournamentRoute } from "../../../src/routes";
import { generateLanguageAlternates } from "../../../src/seo-utils";
import { AnalyticsLadderTournamentSeasonView } from "../../../src/firebase/analytics";
import LeagueHeader, { ExternalLink } from "./league-header";
import SeasonStatsBar from "./season-stats-bar";
import SeasonPicker from "./season-picker";
import StandingsTable from "./standings-table";
import CastsByStage, { LADDER_CASTS_ANCHOR } from "./casts-by-stage";
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

  const seo = (
    <Head>
      {generateNextSeo({
        title,
        description,
        canonical: `${config.SITE_URL}${path}`,
        openGraph: { title, description, url: `${config.SITE_URL}${path}`, type: "website" },
        languageAlternates: generateLanguageAlternates(path),
      })}
    </Head>
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
          <LeagueHeader seasonId={data.seasonId} />

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
