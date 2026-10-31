import React from "react";
import Link from "next/link";
import { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
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
import { IconArrowRight, IconTrophyFilled } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import config from "../../../config";
import type {
  IroncladOverviewData,
  IroncladTournamentSummary,
} from "../../../src/tournaments/ironclad-tournament";
import {
  getIroncladTournamentRoute,
  getIroncladTournamentsRoute,
  getTournamentsRoute,
} from "../../../src/routes";
import PageJsonLd from "../../../components/page-json-ld";
import { generateLanguageAlternates } from "../../../src/seo-utils";
import { IRONCLAD_TOURNAMENT } from "../../../src/tournaments/tournaments-registry";
import { ExternalLink } from "../ladder-tournament/league-header";
import IroncladChampions from "../components/ironclad-champions";
import {
  DivisionStateBadge,
  formatIroncladDate,
  RegistrationBadge,
  TournamentStatusBadge,
} from "../components/ironclad-badges";
import IroncladHeader from "./ironclad-header";

export type IroncladOverviewPageProps = {
  // null when the IronClad data couldn't be loaded
  data: IroncladOverviewData | null;
};

const TournamentCard = ({ tournament }: { tournament: IroncladTournamentSummary }) => {
  const { t } = useTranslation("tournaments");
  const { locale = "en" } = useRouter();
  const route = getIroncladTournamentRoute(tournament.slug);
  const completedAt = formatIroncladDate(tournament.firstCompletedAt, locale);

  return (
    <Paper withBorder radius="md" p="lg" data-testid={`ironclad-tournament-${tournament.slug}`}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" gap="sm">
          <Stack gap={6}>
            <Title order={2} size="h3">
              <Anchor component={Link} href={route} inherit c="inherit">
                {tournament.name}
              </Anchor>
            </Title>
            <Group gap={6}>
              <TournamentStatusBadge status={tournament.status} />
              {tournament.status !== "completed" && (
                <RegistrationBadge open={tournament.registrationOpen} />
              )}
              <Text size="sm" c="dimmed">
                {tournament.format}
                {" · "}
                {t("ironclad.playersCount", { count: tournament.approvedPlayers })}
                {completedAt && ` · ${t("ironclad.completedAt", { date: completedAt })}`}
              </Text>
            </Group>
          </Stack>
          <Button component={Link} href={route} rightSection={<IconArrowRight size={16} />}>
            {t("hub.openTournament")}
          </Button>
        </Group>
        <SimpleGrid cols={{ base: 1, xs: 2, md: tournament.divisions.length > 3 ? 4 : 3 }}>
          {tournament.divisions.map((division) => (
            <Paper
              withBorder
              radius="sm"
              p="sm"
              key={division.key}
              component={Link}
              href={getIroncladTournamentRoute(tournament.slug, division.key)}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              <Stack gap={4}>
                <Group justify="space-between" gap={6} wrap="nowrap">
                  <Text size="sm" fw={700} truncate="end">
                    {division.displayName}
                  </Text>
                  <DivisionStateBadge state={division.state} />
                </Group>
                <Text size="xs" c="dimmed">
                  {division.eloRule}
                </Text>
                {division.champion ? (
                  <Group gap={4} wrap="nowrap">
                    <IconTrophyFilled size={14} color="var(--mantine-color-yellow-6)" />
                    {/* The card is a link, the champion is plain text inside it */}
                    <Text size="sm" fw={600} truncate="end">
                      {division.champion.eventAlias}
                    </Text>
                  </Group>
                ) : (
                  <Text size="sm">
                    {t("ironclad.divisionFill", {
                      count: division.approvedCount,
                      capacity: division.capacity,
                    })}
                  </Text>
                )}
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
};

/**
 * All the IronClad tournaments - /tournaments/ironclad.
 */
const IroncladOverviewScreen: NextPage<IroncladOverviewPageProps> = ({ data }) => {
  const { t } = useTranslation("tournaments");

  const path = getIroncladTournamentsRoute();
  const title = t("meta.ironcladTitle");
  const description = t("meta.ironcladDescription");

  const champions = data?.tournaments.find((tournament) =>
    tournament.divisions.some((division) => division.champion),
  );

  return (
    <>
      <Head>
        {generateNextSeo({
          title,
          description,
          canonical: `${config.SITE_URL}${path}`,
          openGraph: { title, description, url: `${config.SITE_URL}${path}` },
          languageAlternates: generateLanguageAlternates(path),
        })}
      </Head>
      <PageJsonLd
        path={path}
        name={title}
        description={description}
        breadcrumbName={t(IRONCLAD_TOURNAMENT.nameKey)}
        trail={[{ name: t("common:mainMenu.tournaments"), path: getTournamentsRoute() }]}
        items={data?.tournaments.map((tournament) => ({
          name: tournament.name,
          path: getIroncladTournamentRoute(tournament.slug),
        }))}
      />
      <Container size="lg" p="md" data-testid="ironclad-overview">
        <Stack gap="xl">
          <IroncladHeader />

          {!data ? (
            <Paper withBorder radius="md" p="lg" data-testid="ironclad-unavailable">
              <Text>{t("ironclad.unavailable")}</Text>
              <Text size="sm" mt="xs">
                <ExternalLink href={IRONCLAD_TOURNAMENT.url}>
                  {t("ironclad.officialSite")}
                </ExternalLink>
              </Text>
            </Paper>
          ) : data.tournaments.length === 0 ? (
            <Text c="dimmed" data-testid="ironclad-no-tournaments">
              {t("ironclad.noTournaments")}
            </Text>
          ) : (
            <>
              {champions && (
                <Paper withBorder radius="md" p="md" data-testid="ironclad-latest-champions">
                  <Stack gap="xs">
                    <Group gap={6}>
                      <IconTrophyFilled size={16} color="var(--mantine-color-yellow-6)" />
                      <Text fw={700}>{t("hub.lastChampions", { name: champions.name })}</Text>
                    </Group>
                    <IroncladChampions divisions={champions.divisions} />
                  </Stack>
                </Paper>
              )}
              <Stack gap="sm">
                <Title order={2} size="h3">
                  {t("ironclad.tournaments")}
                </Title>
                {data.tournaments.map((tournament) => (
                  <TournamentCard tournament={tournament} key={tournament.slug} />
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </Container>
    </>
  );
};

export default IroncladOverviewScreen;
