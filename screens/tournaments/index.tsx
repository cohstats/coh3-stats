import React, { useEffect } from "react";
import { NextPage } from "next";
import { NextSeo } from "next-seo";
import { Anchor, Container, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import config from "../../config";
import type { LadderHubSummary } from "../../src/tournaments/ladder-tournament";
import {
  IRONCLAD_TOURNAMENT,
  LADDER_TOURNAMENT,
  METAPLAYS_TOURNAMENT,
} from "../../src/tournaments/tournaments-registry";
import { getTournamentsRoute } from "../../src/routes";
import { generateLanguageAlternates } from "../../src/seo-utils";
import { AnalyticsTournamentsPageView } from "../../src/firebase/analytics";
import FeaturedTournamentCard from "./components/featured-tournament-card";
import ExternalTournamentCard from "./components/external-tournament-card";

export type TournamentsPageProps = {
  // null when the Ladder Tournament data couldn't be loaded
  ladderSummary: LadderHubSummary | null;
};

const EXTERNAL_TOURNAMENTS = [IRONCLAD_TOURNAMENT, METAPLAYS_TOURNAMENT];

const TournamentsScreen: NextPage<TournamentsPageProps> = ({ ladderSummary }) => {
  const { t } = useTranslation("tournaments");

  useEffect(() => {
    AnalyticsTournamentsPageView();
  }, []);

  const path = getTournamentsRoute();
  const title = t("meta.hubTitle");
  const description = t("meta.hubDescription");

  return (
    <>
      <NextSeo
        title={title}
        description={description}
        canonical={`${config.SITE_URL}${path}`}
        openGraph={{ title, description, url: `${config.SITE_URL}${path}`, type: "website" }}
        languageAlternates={generateLanguageAlternates(path)}
      />
      <Container size="lg" p="md" data-testid="tournaments-page">
        <Stack gap="lg">
          <Stack gap={4}>
            <Title order={1}>{t("hub.title")}</Title>
            <Text c="dimmed">{t("hub.subtitle")}</Text>
          </Stack>

          <FeaturedTournamentCard tournament={LADDER_TOURNAMENT} summary={ladderSummary} />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
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
