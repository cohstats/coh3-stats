import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { IconBarrierBlock, IconSearch } from "@tabler/icons-react";
import {
  Anchor,
  Card,
  Flex,
  Grid,
  Stack,
  Text,
  Title,
  Container,
  TextInput,
} from "@mantine/core";

import { raceType } from "../../../../../src/coh3/coh3-types";
import {
  generateAlternateLanguageLinks,
  generateKeywordsString,
} from "../../../../../src/seo-utils";
import { localizedNames } from "../../../../../src/coh3/coh3-data";
import { getMappings } from "../../../../../src/unitStats/mappings";
import { SbpsType } from "../../../../../src/unitStats";
import FactionIcon from "../../../../../components/faction-icon";
import { UnitDescriptionCard } from "../../../../../components/unit-cards/unit-description-card";
import LinkWithOutPrefetch from "../../../../../components/LinkWithOutPrefetch";
import { getExplorerUnitRoute } from "../../../../../src/routes";
import { useEffect, useState } from "react";
import { AnalyticsExplorerFactionUnitsView } from "../../../../../src/firebase/analytics";
import { getUnitStatsCOH3Descriptions } from "../../../../../src/unitStats/descriptions";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import nextI18NextConfig from "../../../../../next-i18next.config";
import config from "../../../../../config";
import { useTranslation } from "next-i18next";

interface UnitDetailProps {
  units: SbpsType[];
  raceToFetch: raceType;
  descriptions: Record<string, Record<string, string | null>>;
}

const ExplorerUnits: NextPage<UnitDetailProps> = ({ units, raceToFetch, descriptions }) => {
  const { asPath } = useRouter();
  const { t } = useTranslation("explorer");
  const localizedRace = localizedNames[raceToFetch];
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    AnalyticsExplorerFactionUnitsView(raceToFetch);
  }, []);

  const metaKeywords = generateKeywordsString([
    `${localizedRace} coh3`,
    `Unit List ${localizedRace}`,
  ]);

  // Filter units based on search value
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
      <Head>
        <title>{`${localizedRace} Units - COH3 Explorer`}</title>
        <meta name="description" content={`${localizedRace} Units - COH3 Explorer`} />
        <meta name="keywords" content={metaKeywords} />
        <meta property="og:image" content={`/icons/general/${raceToFetch}.webp`} />
        {generateAlternateLanguageLinks(asPath)}
      </Head>
      <Container fluid p={0} mih={"80vh"}>
        <Flex direction="row" align="center" gap="md">
          <FactionIcon name={raceToFetch} width={80}></FactionIcon>
          <Stack gap="xs">
            <Title order={1} size={"h2"}>
              {localizedRace} - {descriptions.common?.units || "Units"}
            </Title>
            {descriptions[raceToFetch]?.description && (
              <Text size="md">{descriptions[raceToFetch].description}</Text>
            )}
          </Stack>
        </Flex>

        <Stack mt={32}>
          <Flex direction="row" align="center" justify="space-between" gap="md">
            <Title order={2}>{descriptions.common?.units || "Units"}</Title>
            <TextInput
              placeholder="Search units"
              leftSection={<IconSearch size="1rem" />}
              value={searchValue}
              onChange={(event) => setSearchValue(event.currentTarget.value)}
              style={{ maxWidth: 300 }}
            />
          </Flex>

          {renderUnitCategory("Infantry", infantryUnits)}
          {renderUnitCategory("Team Weapons", teamWeaponUnits)}
          {renderUnitCategory("Vehicles", vehicleUnits)}
          {renderUnitCategory("Emplacements", emplacementUnits)}
        </Stack>
        <Flex direction="row" align="center" gap={16} mt={24}>
          <IconBarrierBlock size={50} />
          <Text c="orange.6" fs="italic">
            {t("unitPage.importantNote")}
          </Text>
        </Flex>
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale || "en";

  const { sbpsData } = await getMappings(locale);

  const raceId = context.params?.raceId as string;

  const raceToFetch = (raceId as raceType) || "american";
  const faction = raceToFetch === "dak" ? "afrika_korps" : raceToFetch;
  const units = sbpsData.filter((squad: SbpsType) => squad.faction.includes(faction));

  return {
    props: {
      raceToFetch,
      units,
      descriptions: getUnitStatsCOH3Descriptions(context.locale),
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
    locales.map((locale) => ({
      params: { raceId },
      locale,
    })),
  );

  return {
    paths,
    fallback: "blocking", // can also be true or 'blocking'
  };
};

export default ExplorerUnits;
