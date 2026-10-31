import React from "react";
import Link from "next/link";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import {
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import config from "../../../config";
import {
  isLadderSeasonCurrent,
  LadderOverviewData,
} from "../../../src/tournaments/ladder-tournament";
import { LADDER_TOURNAMENT } from "../../../src/tournaments/tournaments-registry";
import { getLadderTournamentRoute } from "../../../src/routes";
import TournamentVideoCard from "../../../components/tournament-videos/tournament-video-card";
import { generateLanguageAlternates } from "../../../src/seo-utils";
import LeagueHeader, { ExternalLink } from "./league-header";
import SeasonStatsBar from "./season-stats-bar";
import StandingsTable from "./standings-table";
import AllSeasonsTable from "./all-seasons-table";
import { LADDER_CASTS_ANCHOR } from "./casts-by-stage";
import {
  formatLadderDateRange,
  getLadderSeasonTitle,
  LadderSeasonInfoCard,
  LadderSeasonStatusBadge,
} from "../components/ladder-season";

export type LadderTournamentOverviewPageProps = {
  // null when the Ladder Tournament data couldn't be loaded
  data: LadderOverviewData | null;
};

/**
 * The league overview - /tournaments/ladder-tournament.
 * The current (or the latest) season with its top players, all the seasons and the newest casts.
 * Every season has its own page.
 */
const LadderTournamentOverviewScreen: NextPage<LadderTournamentOverviewPageProps> = ({
  data,
}) => {
  const { t } = useTranslation("tournaments");
  const { locale = "en" } = useRouter();

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

  const { featured } = data;
  const featuredRoute = getLadderTournamentRoute(featured.seasonId);
  const isCurrent = isLadderSeasonCurrent(featured);
  const hasStandings = data.featuredStandings.length > 0;
  // "Show more" opens the season of the newest cast, the featured season may have no casts yet
  const castsRoute = getLadderTournamentRoute(data.latestCasts[0]?.seasonId ?? featured.seasonId);

  return (
    <>
      {seo}
      <Container size="lg" p="md" data-testid="ladder-tournament-overview">
        <Stack gap="xl">
          <LeagueHeader />

          <Stack gap="md" data-testid="ladder-latest-season">
            <Group justify="space-between" align="flex-start" gap="sm">
              <Stack gap={6}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts="0.06em">
                  {t(isCurrent ? "hub.currentSeason" : "hub.latestSeason")}
                </Text>
                <Title order={2} size="h3" data-testid="ladder-latest-season-title">
                  <Anchor component={Link} href={featuredRoute} inherit c="inherit">
                    {getLadderSeasonTitle(t, featured)}
                  </Anchor>
                </Title>
                {featured.info && (
                  <Group gap={6}>
                    <LadderSeasonStatusBadge status={featured.info.status} />
                    {/* Without the standings the season info card below has the dates */}
                    {hasStandings && (
                      <Text size="sm" c="dimmed">
                        {t("hub.ladderDates", {
                          dates: formatLadderDateRange(
                            featured.info.ladderStart,
                            featured.info.ladderEnd,
                            locale,
                          ),
                        })}
                      </Text>
                    )}
                  </Group>
                )}
              </Stack>
              <Button
                component={Link}
                href={featuredRoute}
                rightSection={<IconArrowRight size={16} />}
                data-testid="ladder-open-latest-season"
              >
                {t("hub.openSeason")}
              </Button>
            </Group>
            {hasStandings ? (
              <>
                <SeasonStatsBar summary={featured} />
                <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
                  <StandingsTable standings={data.featuredStandings} />
                  {featured.players > data.featuredStandings.length && (
                    <Group justify="center" py="xs">
                      <Button
                        component={Link}
                        href={featuredRoute}
                        variant="subtle"
                        size="sm"
                        rightSection={<IconArrowRight size={16} />}
                        data-testid="ladder-latest-full-standings"
                      >
                        {t("league.standings.showAll", { count: featured.players })}
                      </Button>
                    </Group>
                  )}
                </Paper>
              </>
            ) : (
              <>
                {featured.info && <LadderSeasonInfoCard info={featured.info} />}
                <Text c="dimmed" data-testid="ladder-standings-not-available">
                  {t("league.standings.notAvailable")}
                </Text>
              </>
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

          {data.latestCasts.length > 0 && (
            <Stack gap="sm" data-testid="ladder-latest-casts">
              <Title order={2} size="h3">
                {t("league.overview.latestCasts")}
              </Title>
              <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="sm">
                {data.latestCasts.map((video, index) => (
                  <TournamentVideoCard
                    video={video}
                    index={index}
                    key={video.id ?? `${video.videoUrlYoutube || video.videoUrlTwitch}-${index}`}
                  />
                ))}
              </SimpleGrid>
              <Group justify="center">
                <Button
                  component={Link}
                  href={`${castsRoute}#${LADDER_CASTS_ANCHOR}`}
                  variant="subtle"
                  rightSection={<IconArrowRight size={16} />}
                  data-testid="ladder-latest-casts-more"
                >
                  {t("league.overview.showMoreCasts")}
                </Button>
              </Group>
            </Stack>
          )}
        </Stack>
      </Container>
    </>
  );
};

export default LadderTournamentOverviewScreen;
