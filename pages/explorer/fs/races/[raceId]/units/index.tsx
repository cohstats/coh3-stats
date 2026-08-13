import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import { IconSearch } from "@tabler/icons-react";
import {
  Anchor,
  Card,
  Container,
  Flex,
  Grid,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import { raceType, raceTypeArray } from "../../../../../../src/coh3/coh3-types";
import {
  generateKeywordsString,
  generateLanguageAlternates,
} from "../../../../../../src/seo-utils";
import { localizedNames } from "../../../../../../src/coh3/coh3-data";
import { getMappings } from "../../../../../../src/unitStats/mappings";
import {
  isFinalStandEnemyUnit,
  isFinalStandUnit,
  SbpsType,
} from "../../../../../../src/unitStats";
import FactionIcon from "../../../../../../components/faction-icon";
import { UnitDescriptionCard } from "../../../../../../components/unit-cards/unit-description-card";
import LinkWithOutPrefetch from "../../../../../../components/LinkWithOutPrefetch";
import { FinalStandUnitsSwitch } from "../../../../../../components/final-stand-units-switch";
import { FactionSwitch } from "../../../../../../components/faction-switch";
import {
  getExplorerFactionUnitsRoute,
  getExplorerFsUnitsRoute,
  getExplorerUnitRoute,
} from "../../../../../../src/routes";
import { useEffect, useState } from "react";
import { AnalyticsExplorerFactionUnitsView } from "../../../../../../src/firebase/analytics";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";
import { useRouter } from "next/router";
import nextI18NextConfig from "../../../../../../next-i18next.config";
import config from "../../../../../../config";
import { useTranslation } from "next-i18next/pages";

interface FsUnitsProps {
  units: SbpsType[];
  raceToFetch: raceType;
}

const FsUnits: NextPage<FsUnitsProps> = ({ units, raceToFetch }) => {
  const { asPath } = useRouter();
  const { t } = useTranslation("explorer");
  const localizedRace = localizedNames[raceToFetch];
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    AnalyticsExplorerFactionUnitsView(raceToFetch);
  }, []);

  const metaKeywords = generateKeywordsString(
    t("finalStandUnitsPage.meta.keywords", {
      faction: localizedRace,
      returnObjects: true,
    }) as string[],
  );

  // Not "COH3 Explorer" - both the unit list and og:title/description should say Final Stand up
  // front, so link previews and search results are never confused with the multiplayer roster.
  const pageTitle = t("finalStandUnitsPage.meta.title", { faction: localizedRace });
  const metaDescription = t("finalStandUnitsPage.meta.description", { faction: localizedRace });
  const canonical = `${config.SITE_URL}${asPath}`;

  const filteredUnits = units.filter((unit) => {
    if (!searchValue) return true;
    const searchLower = searchValue.toLowerCase();
    return (
      unit.ui.screenName?.toLowerCase().includes(searchLower) ||
      unit.ui.helpText?.toLowerCase().includes(searchLower) ||
      unit.ui.briefText?.toLowerCase().includes(searchLower)
    );
  });

  // Split filtered units into 4 categories
  const infantryUnits = filteredUnits.filter((unit) => unit.unitType === "infantry");
  const teamWeaponUnits = filteredUnits.filter((unit) => unit.unitType === "team_weapons");
  const vehicleUnits = filteredUnits.filter((unit) => unit.unitType === "vehicles");
  const emplacementUnits = filteredUnits.filter((unit) => unit.unitType === "emplacements");

  // Helper function to render a unit category
  const renderUnitCategory = (title: string, units: SbpsType[]) => {
    if (units.length === 0) return null;

    return (
      <Stack gap="md">
        <Title order={3}>{title}</Title>
        <Grid>
          {units.map(({ id, ui }) => {
            if (ui.screenName) {
              return (
                <Grid.Col key={id} span={{ xs: 12, md: 6 }}>
                  <Anchor
                    c="undefined"
                    underline={"never"}
                    style={{
                      "&:hover": {
                        textDecoration: "none",
                      },
                    }}
                    component={LinkWithOutPrefetch}
                    href={getExplorerUnitRoute(raceToFetch, id)}
                  >
                    <Card p={{ base: "xs", sm: "md" }} radius="md" withBorder>
                      <UnitDescriptionCard
                        faction={raceToFetch}
                        desc={{
                          screen_name: ui.screenName,
                          help_text: ui.helpText,
                          brief_text: ui.briefText,
                          symbol_icon_name: ui.symbolIconName,
                          icon_name: ui.iconName,
                        }}
                        placement="list"
                        isFinalStand
                        isEnemy={isFinalStandEnemyUnit({ id })}
                      />
                    </Card>
                  </Anchor>
                </Grid.Col>
              );
            } else {
              return null;
            }
          })}
        </Grid>
      </Stack>
    );
  };

  return (
    <>
      <NextSeo
        title={pageTitle}
        description={metaDescription}
        canonical={canonical}
        openGraph={{
          title: `${pageTitle} | COH3 Stats`,
          description: metaDescription,
          url: canonical,
          type: "website",
          siteName: "COH3 Stats",
          images: [
            {
              url: `${config.SITE_URL}/icons/general/${raceToFetch}.webp`,
              width: 64,
              height: 64,
              alt: `${localizedRace} faction icon`,
            },
          ],
        }}
        additionalMetaTags={[
          {
            name: "keywords",
            content: metaKeywords,
          },
        ]}
        languageAlternates={generateLanguageAlternates(asPath)}
      />
      <Container fluid p={0} mih={"80vh"}>
        <Flex direction="row" align="flex-start" justify="space-between" gap="md" wrap="wrap">
          <Flex direction="row" align="center" gap="md">
            <FactionIcon name={raceToFetch} width={80}></FactionIcon>
            <Stack gap="xs">
              <Title order={1} size={"h2"}>
                {localizedRace} - {t("finalStandUnitsPage.title")}
              </Title>
              <Text size="md">{t("finalStandUnitsPage.description")}</Text>
            </Stack>
          </Flex>
          <FactionSwitch
            races={raceTypeArray}
            activeRace={raceToFetch}
            getHref={getExplorerFsUnitsRoute}
          />
        </Flex>

        <Stack mt={32}>
          <Flex
            direction="row"
            align="center"
            justify="space-between"
            gap="md"
            wrap="wrap"
            rowGap="sm"
          >
            <Title order={2}>{t("finalStandUnitsPage.title")}</Title>
            <Group gap="lg" wrap="wrap">
              <FinalStandUnitsSwitch
                checked={true}
                standardHref={getExplorerFactionUnitsRoute(raceToFetch)}
                finalStandHref={getExplorerFsUnitsRoute(raceToFetch)}
              />
              <TextInput
                placeholder={t("finalStandUnitsPage.searchPlaceholder")}
                leftSection={<IconSearch size="1rem" />}
                value={searchValue}
                onChange={(event) => setSearchValue(event.currentTarget.value)}
                style={{ maxWidth: 300 }}
              />
            </Group>
          </Flex>

          {filteredUnits.length === 0 ? (
            <Text c="dimmed">{t("finalStandUnitsPage.empty", { faction: localizedRace })}</Text>
          ) : (
            <>
              {renderUnitCategory(t("finalStandUnitsPage.categories.infantry"), infantryUnits)}
              {renderUnitCategory(
                t("finalStandUnitsPage.categories.teamWeapons"),
                teamWeaponUnits,
              )}
              {renderUnitCategory(t("finalStandUnitsPage.categories.vehicles"), vehicleUnits)}
              {renderUnitCategory(
                t("finalStandUnitsPage.categories.emplacements"),
                emplacementUnits,
              )}
            </>
          )}
        </Stack>
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps<FsUnitsProps> = async (context) => {
  const locale = context.locale || "en";
  const params = await context.params;

  const raceId = params?.raceId as string;

  if (!raceTypeArray.includes(raceId as raceType)) {
    return { notFound: true, revalidate: false };
  }

  const { sbpsData } = await getMappings(locale);

  const raceToFetch = raceId as raceType;

  const factionMap: Partial<Record<raceType, string>> = {
    dak: "afrika_korps",
    british: "british_africa",
  };

  const faction = factionMap[raceToFetch] ?? raceToFetch;

  const units = sbpsData.filter(
    (squad: SbpsType) => squad.faction.includes(faction) && isFinalStandUnit(squad),
  );

  return {
    props: {
      raceToFetch,
      units,
      ...(await serverSideTranslations(locale, ["common", "explorer"])),
    },
    revalidate: false,
  };
};

export const getStaticPaths: GetStaticPaths<{ raceId: string }> = async () => {
  if (!config.FULL_BUILD) {
    return {
      paths: [],
      fallback: "blocking", // All pages will be generated on-demand
    };
  }

  // Get all supported locales from the config
  const { locales } = nextI18NextConfig.i18n;

  // Define the race IDs
  const raceIds = ["dak", "american", "british", "german"];

  // Generate paths for all combinations of race IDs and locales
  const paths = raceIds.flatMap((raceId) =>
    locales.map((locale: string) => ({
      params: { raceId },
      locale,
    })),
  );

  return {
    paths,
    fallback: "blocking", // can also be true or 'blocking'
  };
};

export default FsUnits;
