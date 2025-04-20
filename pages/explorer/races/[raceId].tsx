import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Card, Flex, Stack, Text, Title, Container } from "@mantine/core";
import { localizedNames } from "../../../src/coh3/coh3-data";
import { raceType } from "../../../src/coh3/coh3-types";
import {
  BuildingCard,
  BuildingSchema,
} from "../../../components/unit-cards/building-description-card";
import FactionIcon from "../../../components/faction-icon";
import { BuildingType } from "../../../src/coh3";
import {
  SbpsType,
  EbpsType,
  UpgradesType,
  filterMultiplayerBuildings,
  AbilitiesType,
  BattlegroupsType,
  getResolvedUpgrades,
  getResolvedSquads,
  HalfTrackDeploymentUnitsAfrikaKorps,
  getResolvedAbilities,
} from "../../../src/unitStats";
import { BattlegroupCard } from "../../../components/unit-cards/battlegroup-card";
import { generateAlternateLanguageLinks, generateKeywordsString } from "../../../src/head-utils";
import { getMappings } from "../../../src/unitStats/mappings";
import { useEffect } from "react";
import { AnalyticsExplorerFactionView } from "../../../src/firebase/analytics";
import { getUnitStatsCOH3Descriptions } from "../../../src/unitStats/descriptions";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

interface RaceDetailProps {
  sbpsData: SbpsType[];
  ebpsData: EbpsType[];
  upgradesData: UpgradesType[];
  abilitiesData: AbilitiesType[];
  battlegroupData: BattlegroupsType[];
  descriptions: {
    raceDescription: string;
    buildings: string;
  };
}

const RaceDetail: NextPage<RaceDetailProps> = ({
  ebpsData,
  sbpsData,
  upgradesData,
  battlegroupData,
  abilitiesData,
  descriptions,
}) => {
  // console.log("🚀 ~ file: [raceId].tsx:55 ~ abilitiesData:", abilitiesData);
  // The `query` contains the `raceId`, which is the filename as route slug.
  const { query, asPath } = useRouter();

  const { t } = useTranslation(["explorer"]);

  const raceToFetch = (query.raceId as raceType) || "american";
  const localizedRace = localizedNames[raceToFetch];

  useEffect(() => {
    AnalyticsExplorerFactionView(raceToFetch);
  }, []);

  const metaKeywords = generateKeywordsString([
    `${localizedRace}`,
    `${localizedRace} explorer`,
    `${localizedRace} battle groups`,
    `${localizedRace} units`,
  ]);

  return (
    <>
      <Head>
        <title>{`${localizedRace} - COH3 Explorer`}</title>
        <meta name="description" content={`${localizedRace} - COH3 Explorer`} />
        <meta name="keywords" content={metaKeywords} />
        <meta property="og:image" content={`/icons/general/${raceToFetch}.webp`} />
        {generateAlternateLanguageLinks(asPath)}
      </Head>
      <Container fluid p={0}>
        <Flex direction="row" align="center" gap="md">
          <FactionIcon name={raceToFetch} width={80} />
          <Stack gap="xs">
            <Title order={3}>{localizedRace}</Title>
            <Text size="md">{descriptions.raceDescription}</Text>
          </Stack>
        </Flex>

        {/* Battlegroups Section */}
        <Stack mt={32}>
          <Title order={4}>{t("common.battleGroups")}</Title>

          {BattlegroupCard(raceToFetch, {
            battlegroupData,
            upgradesData,
            abilitiesData,
            sbpsData,
          })}
        </Stack>

        {/* Buildings Section */}
        <Stack mt={32}>
          <Title order={4}>{descriptions.buildings}</Title>

          {BuildingMapping(
            raceToFetch,
            {
              ebpsData,
              sbpsData,
              upgradesData,
              abilitiesData,
            },
            t,
          )}
        </Stack>

        {/*<Flex direction="row" gap={16} mt={24}>*/}
        {/*  <IconBarrierBlock size={35} />*/}
        {/*  <Text c="orange.6" fs="italic">*/}
        {/*    Important Note: This section may contain some inacurracies regarding the unit costs.*/}
        {/*    We&apos;re still working on redefining the calculation for infantry, so feel free to*/}
        {/*    report any bug.*/}
        {/*  </Text>*/}
        {/*</Flex>*/}
      </Container>
    </>
  );
};

const BuildingMapping = (
  race: raceType,
  data: {
    ebpsData: EbpsType[];
    sbpsData: SbpsType[];
    upgradesData: UpgradesType[];
    abilitiesData: AbilitiesType[];
  },
  t: (key: string) => string,
) => {
  const buildings = filterMultiplayerBuildings(data.ebpsData, race);
  return (
    <Stack>
      {buildings.map((building) => {
        const spawnerRefs = Object.values(building.spawner_ext.spawn_items).map(
          (x) => x.squad.instance_reference,
        );
        // Temporary workaround while a better idea to display call-ins of DAK shows up.
        const upgrades =
          race === "dak" && building.id === "halftrack_deployment_ak"
            ? generateAfrikaKorpsCallIns(data.abilitiesData)
            : getBuildingUpgrades(building, data.upgradesData);
        const units = Object.values(
          getResolvedSquads(spawnerRefs, data.sbpsData, data.ebpsData),
        ).map((unit) => ({
          ...unit,
          playerReq: Object.values(getResolvedUpgrades(unit.requirements, data.upgradesData)),
        }));
        return (
          <Card key={building.id} p="sm" radius="md" withBorder>
            <BuildingCard
              faction={race}
              // @todo: Validate types.
              types={building.unitTypes as BuildingType[]}
              desc={{
                screen_name: building.ui.screenName,
                help_text: building.ui.helpText,
                extra_text: building.ui.extraText,
                brief_text: building.ui.briefText,
                icon_name: building.ui.iconName,
                symbol_icon_name: building.ui.symbolIconName,
              }}
              units={units}
              upgrades={upgrades}
              time_cost={{
                fuel: building.cost.fuel,
                munition: building.cost.munition,
                manpower: building.cost.manpower,
                popcap: building.cost.popcap,
                time_seconds: building.cost.time,
              }}
              health={{
                hitpoints: building.health.hitpoints,
              }}
              t={t}
            />
          </Card>
        );
      })}
    </Stack>
  );
};

function getBuildingUpgrades(
  building: EbpsType,
  upgradesData: UpgradesType[],
): BuildingSchema["upgrades"] {
  return Object.entries(getResolvedUpgrades(building.upgradeRefs, upgradesData)).map(
    ([id, { ui, cost }]) => ({
      id,
      desc: {
        screen_name: ui.screenName,
        help_text: ui.helpText,
        extra_text: ui.extraText,
        brief_text: ui.briefText,
        icon_name: ui.iconName,
        extra_text_formatter: ui.extraTextFormatter,
        brief_text_formatter: ui.briefTextFormatter,
      },
      time_cost: {
        fuel: cost.fuel,
        munition: cost.munition,
        manpower: cost.manpower,
        popcap: cost.popcap,
        time_seconds: cost.time,
      },
    }),
  );
}

/** Generate the call-ins as upgrades although those are abilities under the hood. */
function generateAfrikaKorpsCallIns(abilitiesData: AbilitiesType[]): BuildingSchema["upgrades"] {
  return Object.entries(
    getResolvedAbilities(Object.keys(HalfTrackDeploymentUnitsAfrikaKorps), abilitiesData),
  ).map(([id, { ui, cost, rechargeTime }]) => ({
    id,
    desc: {
      screen_name: ui.screenName || "",
      help_text: ui.helpText || "",
      extra_text: ui.extraText || "",
      brief_text: ui.briefText || "",
      extra_text_formatter: ui.extraTextFormatter,
      icon_name: ui.iconName,
      brief_text_formatter: ui.briefTextFormatter,
    },
    time_cost: {
      fuel: cost.fuel,
      munition: cost.munition,
      manpower: cost.manpower,
      popcap: cost.popcap,
      time_seconds: rechargeTime,
    },
  }));
}

// Generates `/dak`.
export const getStaticPaths: GetStaticPaths<{ raceId: string }> = async () => {
  // Some locale paths are pre-generated, other will be generated on demand.
  return {
    paths: [
      { params: { raceId: "dak" }, locale: "en" },
      { params: { raceId: "dak" }, locale: "de" },
      { params: { raceId: "dak" }, locale: "ko" },
      { params: { raceId: "dak" }, locale: "zh-Hans" },
      { params: { raceId: "dak" }, locale: "zh-Hant" },

      { params: { raceId: "american" }, locale: "en" },
      { params: { raceId: "american" }, locale: "de" },
      { params: { raceId: "american" }, locale: "ko" },
      { params: { raceId: "american" }, locale: "zh-Hans" },
      { params: { raceId: "american" }, locale: "zh-Hant" },

      { params: { raceId: "british" }, locale: "en" },
      { params: { raceId: "british" }, locale: "de" },
      { params: { raceId: "british" }, locale: "ko" },
      { params: { raceId: "british" }, locale: "zh-Hans" },
      { params: { raceId: "british" }, locale: "zh-Hant" },

      { params: { raceId: "german" }, locale: "en" },
      { params: { raceId: "german" }, locale: "de" },
      { params: { raceId: "german" }, locale: "ko" },
      { params: { raceId: "german" }, locale: "zh-Hans" },
      { params: { raceId: "german" }, locale: "zh-Hant" },
    ],
    fallback: "blocking", // can also be true or 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale || "en";
  const { sbpsData, ebpsData, upgradesData, abilitiesData, battlegroupData } =
    await getMappings(locale);

  const raceId = context.params?.raceId as string;

  const descriptions = getUnitStatsCOH3Descriptions(locale);

  // get raceID from context

  return {
    props: {
      sbpsData,
      ebpsData,
      upgradesData,
      abilitiesData,
      battlegroupData,
      descriptions: {
        raceDescription: descriptions[raceId as raceType]?.description || null,
        buildings: descriptions.common.buildings || null,
      },
      ...(await serverSideTranslations(locale, ["common", "explorer"])),
    },
    revalidate: false,
  };
};

export default RaceDetail;
