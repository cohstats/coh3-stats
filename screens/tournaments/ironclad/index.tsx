import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { Box, Container, Group, Paper, Progress, Stack, Tabs, Text, Title } from "@mantine/core";
import { IconTrophyFilled } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import config from "../../../config";
import {
  IroncladDivisionView,
  IroncladTournamentView,
} from "../../../src/tournaments/ironclad-tournament";
import { getIroncladTournamentRoute } from "../../../src/routes";
import { generateLanguageAlternates } from "../../../src/seo-utils";
import { AnalyticsIroncladTournamentView } from "../../../src/firebase/analytics";
import { IRONCLAD_TOURNAMENT } from "../../../src/tournaments/tournaments-registry";
import { ExternalLink } from "../ladder-tournament/league-header";
import IroncladPlayerLink from "../components/ironclad-player-link";
import {
  DivisionStateBadge,
  formatIroncladDate,
  RegistrationBadge,
  TournamentStatusBadge,
} from "../components/ironclad-badges";
import IroncladHeader from "./ironclad-header";
import BracketTree from "./bracket-tree";
import ParticipantsTable from "./participants-table";
import classes from "./ironclad.module.css";

export type IroncladTournamentPageProps = {
  slug: string;
  // null when the IronClad data couldn't be loaded
  data: IroncladTournamentView | null;
};

const DivisionPanel = ({ division }: { division: IroncladDivisionView }) => {
  const { t } = useTranslation("tournaments");
  const fill = division.capacity > 0 ? (division.approvedCount / division.capacity) * 100 : 0;

  return (
    <Stack gap="lg" pt="md" data-testid={`ironclad-division-${division.key}`}>
      <Group justify="space-between" gap="md" wrap="wrap">
        <Stack gap={4}>
          <Group gap="xs">
            <Title order={2} size="h3">
              {division.displayName}
            </Title>
            <DivisionStateBadge state={division.state} />
          </Group>
          <Text size="sm" c="dimmed">
            {division.eloRule}
          </Text>
        </Stack>
        <Box w={{ base: "100%", xs: 220 }}>
          <Text size="sm" c="dimmed" mb={4}>
            {t("ironclad.divisionFill", {
              count: division.approvedCount,
              capacity: division.capacity,
            })}
          </Text>
          <Progress value={fill} size="sm" radius="xl" aria-label={division.displayName} />
        </Box>
      </Group>

      {division.champion && (
        <Paper
          withBorder
          radius="md"
          p="md"
          className={classes.championBanner}
          data-testid="ironclad-division-champion"
        >
          <Group gap="sm">
            <IconTrophyFilled size={22} color="var(--mantine-color-yellow-6)" />
            <Text fw={700}>{t("ironclad.champion")}</Text>
            <IroncladPlayerLink player={division.champion} size="md" fw={700} />
          </Group>
        </Paper>
      )}

      <Stack gap="sm">
        <Title order={3} size="h4">
          {t("ironclad.bracket.title")}
        </Title>
        {division.rounds && division.rounds.length > 0 ? (
          <BracketTree rounds={division.rounds} champion={division.champion} />
        ) : (
          <Text c="dimmed" data-testid="ironclad-bracket-not-generated">
            {t("ironclad.bracket.notGenerated")}
          </Text>
        )}
      </Stack>

      <Stack gap="sm">
        <Title order={3} size="h4">
          {t("ironclad.participants.title")}
        </Title>
        <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
          <ParticipantsTable participants={division.participants} />
        </Paper>
      </Stack>
    </Stack>
  );
};

/**
 * Single IronClad tournament - /tournaments/ironclad/[slug].
 * One tab per division with the bracket and the participants, the open tab is kept in ?division=
 */
const IroncladTournamentScreen: NextPage<IroncladTournamentPageProps> = ({ slug, data }) => {
  const { t } = useTranslation("tournaments");
  const router = useRouter();
  const { locale = "en" } = router;

  // The divisions are from the highest tier, the top one is open by default
  const defaultDivision = data?.divisions[0]?.key ?? null;
  // Kept with the slug, the page component stays mounted when navigating to another tournament
  const [selected, setSelected] = useState<{ slug: string; division: string } | null>(null);
  const division = selected?.slug === slug ? selected.division : defaultDivision;

  // The query is not available on the statically generated page, it's applied after the hydration
  const queryDivision = typeof router.query.division === "string" ? router.query.division : null;
  useEffect(() => {
    if (queryDivision && data?.divisions.some((item) => item.key === queryDivision)) {
      setSelected({ slug, division: queryDivision });
    }
  }, [queryDivision, data, slug]);

  useEffect(() => {
    AnalyticsIroncladTournamentView(slug);
  }, [slug]);

  const onDivisionChange = (value: string | null) => {
    if (!value) return;
    setSelected({ slug, division: value });
    router.replace(getIroncladTournamentRoute(slug, value), undefined, {
      shallow: true,
      scroll: false,
    });
  };

  const path = getIroncladTournamentRoute(slug);
  const name = data?.name ?? t(IRONCLAD_TOURNAMENT.nameKey);
  const title = t("meta.ironcladTournamentTitle", { name });
  const description = t("meta.ironcladTournamentDescription", { name });

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
        <Container size="lg" p="md" data-testid="ironclad-tournament">
          <Stack gap="lg">
            <IroncladHeader tournamentName={slug} />
            <Paper withBorder radius="md" p="lg" data-testid="ironclad-unavailable">
              <Text>{t("ironclad.unavailable")}</Text>
              <Text size="sm" mt="xs">
                <ExternalLink href={IRONCLAD_TOURNAMENT.url}>
                  {t("ironclad.officialSite")}
                </ExternalLink>
              </Text>
            </Paper>
          </Stack>
        </Container>
      </>
    );
  }

  const completedAt = formatIroncladDate(data.firstCompletedAt, locale);

  return (
    <>
      {seo}
      <Container size="lg" p="md" data-testid="ironclad-tournament">
        <Stack gap="lg">
          <IroncladHeader tournamentName={data.name} officialUrl={data.publicUrl}>
            <Group gap={6} data-testid="ironclad-tournament-status-line">
              <TournamentStatusBadge status={data.status} />
              {data.status !== "completed" && <RegistrationBadge open={data.registrationOpen} />}
              <Text size="sm" c="dimmed">
                {data.format}
                {" · "}
                {t("ironclad.playersCount", { count: data.approvedPlayers })}
                {completedAt && ` · ${t("ironclad.completedAt", { date: completedAt })}`}
              </Text>
            </Group>
          </IroncladHeader>

          {data.divisions.length > 0 ? (
            <Tabs
              value={division}
              onChange={onDivisionChange}
              // All the divisions are in the server HTML (Activity mode is not), so every bracket is indexed
              keepMounted
              keepMountedMode="display-none"
              data-testid="ironclad-divisions"
            >
              <Tabs.List>
                {data.divisions.map((item) => (
                  <Tabs.Tab
                    value={item.key}
                    key={item.key}
                    leftSection={
                      item.champion ? (
                        <IconTrophyFilled size={14} color="var(--mantine-color-yellow-6)" />
                      ) : item.state === "in_progress" ? (
                        <Box
                          w={8}
                          h={8}
                          bg="orange"
                          style={{ borderRadius: "50%" }}
                          aria-hidden="true"
                        />
                      ) : null
                    }
                    data-testid={`ironclad-division-tab-${item.key}`}
                  >
                    {item.displayName}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
              {data.divisions.map((item) => (
                <Tabs.Panel value={item.key} key={item.key}>
                  <DivisionPanel division={item} />
                </Tabs.Panel>
              ))}
            </Tabs>
          ) : (
            <Text c="dimmed">{t("ironclad.bracket.notGenerated")}</Text>
          )}
        </Stack>
      </Container>
    </>
  );
};

export default IroncladTournamentScreen;
