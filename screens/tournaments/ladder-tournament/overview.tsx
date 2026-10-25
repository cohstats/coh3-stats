import React from "react";
import Link from "next/link";
import { NextPage } from "next";
import { NextSeo } from "next-seo";
import { Anchor, Button, Container, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import config from "../../../config";
import { LadderOverviewData } from "../../../src/tournaments/ladder-tournament";
import { LADDER_TOURNAMENT } from "../../../src/tournaments/tournaments-registry";
import { getLadderTournamentRoute } from "../../../src/routes";
import { generateLanguageAlternates } from "../../../src/seo-utils";
import LeagueHeader, { ExternalLink } from "./league-header";
import SeasonStatsBar from "./season-stats-bar";
import StandingsTable from "./standings-table";
import AllSeasonsTable from "./all-seasons-table";

export type LadderTournamentOverviewPageProps = {
  // null when the Ladder Tournament data couldn't be loaded
  data: LadderOverviewData | null;
};

/**
 * The league overview - /tournaments/ladder-tournament.
 * The latest season with its top players, then all the seasons. Every season has its own page.
 */
const LadderTournamentOverviewScreen: NextPage<LadderTournamentOverviewPageProps> = ({
  data,
}) => {
  const { t } = useTranslation("tournaments");

  const path = getLadderTournamentRoute();
  const title = t("meta.leagueTitle");
  const description = t("meta.leagueDescription");

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
        <Container size="lg" p="md" data-testid="ladder-tournament-overview">
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

  const latest = data.seasons[0];
  const latestRoute = getLadderTournamentRoute(latest.seasonId);

  return (
    <>
      {seo}
      <Container size="lg" p="md" data-testid="ladder-tournament-overview">
        <Stack gap="xl">
          <LeagueHeader />

          <Stack gap="md" data-testid="ladder-latest-season">
            <Group justify="space-between" align="center" gap="sm">
              <Stack gap={0}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts="0.06em">
                  {t("hub.latestSeason")}
                </Text>
                <Title order={2} size="h3" data-testid="ladder-latest-season-title">
                  <Anchor component={Link} href={latestRoute} inherit c="inherit">
                    {t("league.season", { season: latest.seasonId })}
                  </Anchor>
                </Title>
              </Stack>
              <Button
                component={Link}
                href={latestRoute}
                rightSection={<IconArrowRight size={16} />}
                data-testid="ladder-open-latest-season"
              >
                {t("league.overview.openSeason", { season: latest.seasonId })}
              </Button>
            </Group>
            <SeasonStatsBar summary={latest} />
            {data.latestStandings.length > 0 ? (
              <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
                <StandingsTable standings={data.latestStandings} />
                {latest.players > data.latestStandings.length && (
                  <Group justify="center" py="xs">
                    <Button
                      component={Link}
                      href={latestRoute}
                      variant="subtle"
                      size="sm"
                      rightSection={<IconArrowRight size={16} />}
                      data-testid="ladder-latest-full-standings"
                    >
                      {t("league.standings.showAll", { count: latest.players })}
                    </Button>
                  </Group>
                )}
              </Paper>
            ) : (
              <Text c="dimmed" data-testid="ladder-standings-not-available">
                {t("league.standings.notAvailable")}
              </Text>
            )}
          </Stack>

          <Stack gap="sm">
            <Title order={2} size="h3">
              {t("league.allSeasons.title")}
            </Title>
            <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
              <AllSeasonsTable seasons={data.seasons} />
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export default LadderTournamentOverviewScreen;
