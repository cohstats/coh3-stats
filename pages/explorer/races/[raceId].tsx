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
  getResolvedUpgrades,
  getResolvedSquads,
  HalfTrackDeploymentUnitsAfrikaKorps,
  getResolvedAbilities,
  resolveBattlegroupBranches,
  BattlegroupResolvedType,
  ResourceValues,
} from "../../../src/unitStats";
import { BattlegroupCard } from "../../../components/unit-cards/battlegroup-card";
import { generateAlternateLanguageLinks, generateKeywordsString } from "../../../src/head-utils";
import { getMappings } from "../../../src/unitStats/mappings";
import { useEffect } from "react";
import { AnalyticsExplorerFactionView } from "../../../src/firebase/analytics";
import { getUnitStatsCOH3Descriptions } from "../../../src/unitStats/descriptions";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

// New interface for pre-calculated building data
interface PreCalculatedBuilding {
  id: string;
  unitTypes: BuildingType[];
  desc: {
    screen_name: string;
    help_text: string;
    extra_text: string;
    brief_text: string;
    icon_name: string;
    symbol_icon_name: string;
  };
  units: Array<
    SbpsType & {
      time_cost: ResourceValues;
      playerReq: UpgradesType[];
    }
  >;
  upgrades: BuildingSchema["upgrades"];
  time_cost: {
    fuel: number;
    munition: number;
    manpower: number;
    popcap: number;
    time_seconds: number;
  };
  health: {
    hitpoints: number;
  };
}

interface RaceDetailProps {
  sbpsData: SbpsType[];
  descriptions: {
    raceDescription: string;
    buildings: string;
  };
  resolvedBattlegroups: BattlegroupResolvedType[];
  preCalculatedBuildings: PreCalculatedBuilding[]; // New prop for pre-calculated buildings
}

const RaceDetail: NextPage<RaceDetailProps> = ({
  sbpsData,
  descriptions,
  resolvedBattlegroups,
  preCalculatedBuildings,
}) => {
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

          {BattlegroupCard(
            raceToFetch,
            {
              sbpsData,
            },
            resolvedBattlegroups,
          )}
        </Stack>

        {/* Buildings Section */}
        <Stack mt={32}>
          <Title order={4}>{descriptions.buildings}</Title>

          <BuildingMapping preCalculatedBuildings={preCalculatedBuildings} t={t} />
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

/**
 * Updated BuildingMapping function that uses pre-calculated data
 * @param preCalculatedBuildings
 * @param t
 * @constructor
 */
const BuildingMapping = ({
  preCalculatedBuildings,
  t,
}: {
  preCalculatedBuildings: PreCalculatedBuilding[];
  t: (key: string) => string;
}) => {
  return (
    <Stack>
      {preCalculatedBuildings.map((building) => (
        <Card key={building.id} p="sm" radius="md" withBorder>
          <BuildingCard
            faction={building.unitTypes[0]?.split("_")[0] as raceType}
            types={building.unitTypes as BuildingType[]}
            desc={building.desc}
            units={building.units}
            upgrades={building.upgrades}
            time_cost={building.time_cost}
            health={building.health}
            t={t}
          />
        </Card>
      ))}
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

// Helper function to pre-calculate building data
function preCalculateBuildings(
  race: raceType,
  ebpsData: EbpsType[],
  sbpsData: SbpsType[],
  upgradesData: UpgradesType[],
  abilitiesData: AbilitiesType[],
): PreCalculatedBuilding[] {
  const buildings = filterMultiplayerBuildings(ebpsData, race);

  return buildings.map((building) => {
    const spawnerRefs = Object.values(building.spawner_ext.spawn_items).map(
      (x) => x.squad.instance_reference,
    );

    // Temporary workaround while a better idea to display call-ins of DAK shows up.
    const upgrades =
      race === "dak" && building.id === "halftrack_deployment_ak"
        ? generateAfrikaKorpsCallIns(abilitiesData)
        : getBuildingUpgrades(building, upgradesData);

    const units = Object.values(getResolvedSquads(spawnerRefs, sbpsData, ebpsData)).map(
      (unit) => ({
        ...unit,
        playerReq: Object.values(getResolvedUpgrades(unit.requirements, upgradesData)),
      }),
    );

    return {
      id: building.id,
      unitTypes: building.unitTypes as BuildingType[],
      desc: {
        screen_name: building.ui.screenName,
        help_text: building.ui.helpText,
        extra_text: building.ui.extraText,
        brief_text: building.ui.briefText,
        icon_name: building.ui.iconName,
        symbol_icon_name: building.ui.symbolIconName,
      },
      units,
      upgrades,
      time_cost: {
        fuel: building.cost.fuel,
        munition: building.cost.munition,
        manpower: building.cost.manpower,
        popcap: building.cost.popcap,
        time_seconds: building.cost.time,
      },
      health: {
        hitpoints: building.health.hitpoints,
      },
    };
  });
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

  const raceId = context.params?.raceId as raceType;

  const descriptions = getUnitStatsCOH3Descriptions(locale);

  const resolvedBattlegroups = resolveBattlegroupBranches(
    raceId,
    battlegroupData,
    upgradesData,
    abilitiesData,
  );

  // Pre-calculate building data
  const preCalculatedBuildings = preCalculateBuildings(
    raceId,
    ebpsData,
    sbpsData,
    upgradesData,
    abilitiesData,
  );

  return {
    props: {
      sbpsData,
      resolvedBattlegroups,
      preCalculatedBuildings,
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
