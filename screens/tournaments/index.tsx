import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
import { Anchor, Container, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import config from "../../config";
import type { LadderHubSummary } from "../../src/tournaments/ladder-tournament";
import type { IroncladHubSummary } from "../../src/tournaments/ironclad-tournament";
import {
  IRONCLAD_TOURNAMENT,
  LADDER_TOURNAMENT,
  METAPLAYS_TOURNAMENT,
} from "../../src/tournaments/tournaments-registry";
import {
  getIroncladTournamentsRoute,
  getLadderTournamentRoute,
  getTournamentsRoute,
} from "../../src/routes";
import { generateLanguageAlternates, getLocalizedUrl } from "../../src/seo-utils";
import { AnalyticsTournamentsPageView } from "../../src/firebase/analytics";
import PageJsonLd from "../../components/page-json-ld";
import FeaturedTournamentCard from "./components/featured-tournament-card";
import ExternalTournamentCard from "./components/external-tournament-card";
import IroncladFeaturedCard from "./components/ironclad-featured-card";

export type TournamentsPageProps = {
  // null when the Ladder Tournament data couldn't be loaded
  ladderSummary: LadderHubSummary | null;
  // null when the IronClad data couldn't be loaded, the organiser card is shown instead
  ironcladSummary?: IroncladHubSummary | null;
};

const EXTERNAL_TOURNAMENTS = [METAPLAYS_TOURNAMENT];

const TournamentsScreen: NextPage<TournamentsPageProps> = ({
  ladderSummary,
  ironcladSummary = null,
}) => {
  const { locale = "en" } = useRouter();
  const { t } = useTranslation("tournaments");

  useEffect(() => {
    AnalyticsTournamentsPageView();
  }, []);

  const path = getTournamentsRoute();
  const title = t("meta.hubTitle");
  const description = t("meta.hubDescription");

  return (
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
        breadcrumbName={t("common:mainMenu.tournaments")}
        // The tournaments with their own page here, IronClad only with the data
        items={[
          { name: t(LADDER_TOURNAMENT.nameKey), path: getLadderTournamentRoute() },
          ...(ironcladSummary
            ? [{ name: t(IRONCLAD_TOURNAMENT.nameKey), path: getIroncladTournamentsRoute() }]
            : []),
        ]}
      />
      <Container size="lg" p="md" data-testid="tournaments-page">
        <Stack gap="lg">
          <Stack gap={4}>
            <Title order={1}>{t("hub.title")}</Title>
            <Text c="dimmed">{t("hub.subtitle")}</Text>
          </Stack>

          <FeaturedTournamentCard tournament={LADDER_TOURNAMENT} summary={ladderSummary} />

          {ironcladSummary && (
            <IroncladFeaturedCard tournament={IRONCLAD_TOURNAMENT} summary={ironcladSummary} />
          )}

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {/* Without the data IronClad falls back to the organiser card next to the others */}
            {!ironcladSummary && <ExternalTournamentCard tournament={IRONCLAD_TOURNAMENT} />}
            {EXTERNAL_TOURNAMENTS.map((tournament) => (
              <ExternalTournamentCard tournament={tournament} key={tournament.id} />
            ))}
          </SimpleGrid>

          <Text c="dimmed" size="sm" ta="center" mt="xl" data-testid="tournaments-add-yours">
            <Anchor
              href={config.DISCORD_INVITE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              c="dimmed"
              inherit
              underline="hover"
            >
              {t("hub.addTournament")}
            </Anchor>
          </Text>
        </Stack>
      </Container>
    </>
  );
};

export default TournamentsScreen;
