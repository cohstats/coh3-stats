import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Error from "next/error";
import { useRouter } from "next/router";
import {
  Card,
  Container,
  Flex,
  Grid,
  List,
  SimpleGrid,
  Space,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  AbilitiesType,
  EbpsType,
  getResolvedAbilities,
  getResolvedConstruction,
  getResolvedUpgrades,
  getSquadTotalCost,
  getSquadTotalUpkeepCost,
  RaceBagDescription,
  ResourceValues,
  SbpsType,
  UpgradesType,
  WeaponType,
} from "../../../../../src/unitStats";
import { UnitDescriptionCard } from "../../../../../components/unit-cards/unit-description-card";
import FactionIcon from "../../../../../components/faction-icon";
import { raceType } from "../../../../../src/coh3/coh3-types";
import { localizedNames } from "../../../../../src/coh3/coh3-data";
import {
  ReinforceCostCard,
  UnitCostCard,
} from "../../../../../components/unit-cards/unit-cost-card";
import {
  ConstructableCard,
  UnitUpgradeCard,
} from "../../../../../components/unit-cards/unit-upgrade-card";
import { VeterancyCard } from "../../../../../components/unit-cards/veterancy-card";
import { WeaponLoadoutCard } from "../../../../../components/unit-cards/weapon-loadout-card";
import { HitpointCard } from "../../../../../components/unit-cards/hitpoints-card";
import { UnitSquadCard } from "../../../../../components/unit-cards/unit-squad-card";
import { getIconsPathOnCDN } from "../../../../../src/utils";
import { generateKeywordsString } from "../../../../../src/head-utils";
import { getMappings } from "../../../../../src/unitStats/mappings";
import { getSbpsWeapons, WeaponMember } from "../../../../../src/unitStats/dpsCommon";
import { useEffect } from "react";
import { AnalyticsExplorerUnitDetailsView } from "../../../../../src/firebase/analytics";

interface UnitDetailProps {
  calculatedData: {
    resolvedSquad: SbpsType;
    totalCost: ResourceValues;
    totalUpkeepCost: ResourceValues;
    squadWeapons: WeaponMember[];
    resolvedEntities: EbpsType[];
    upgrades: UpgradesType[];
    abilities: AbilitiesType[];
    buildables: EbpsType[];
  };
}

const UnitDetail: NextPage<UnitDetailProps> = ({ calculatedData }) => {
  const { query } = useRouter();

  const unitId = query.unitId as string;
  const raceId = query.raceId as raceType;

  useEffect(() => {
    AnalyticsExplorerUnitDetailsView(unitId);
  }, []);

  const { resolvedSquad, resolvedEntities } = calculatedData;

  // The resolved entity does not matter at all, as we can obtain such from the squad loadout.
  // console.log("🚀 ~ file: [unitId].tsx:35 ~ resolvedSquad:", resolvedSquad);
  // console.log("🚀 ~ file: [unitId].tsx:35 ~ resolvedEntities:", resolvedEntities);

  if (!resolvedSquad || !resolvedEntities?.length) {
    // How to redirect back?
    return <Error statusCode={404} title="Unit Not Found" />;
  }

  const localizedRace = localizedNames[raceId];
  const descriptionRace = RaceBagDescription[raceId];

  // For team_weapons, get default members.
  let defaultSquadMember: EbpsType;
  if (resolvedSquad.unitType === "team_weapons" && resolvedSquad.loadout.length > 1) {
    defaultSquadMember = resolvedEntities[resolvedEntities.length - 1];
  } else {
    defaultSquadMember = resolvedEntities[0];
  }

  // Only vehicles have armor values and a single entity usually. The infantry
  // uses the plain `armor`.
  const armorValues = {
    armor: defaultSquadMember.health.armorLayout.armor || 0,
    frontal: defaultSquadMember.health.armorLayout.frontArmor || 0,
    side: defaultSquadMember.health.armorLayout.sideArmor || 0,
    rear: defaultSquadMember.health.armorLayout.rearArmor || 0,
    targetSize: defaultSquadMember.health.targetSize || 0,
  };

  const sightValues = {
    coneAngle: defaultSquadMember.sight_ext.sight_package.cone_angle,
    outerRadius: defaultSquadMember.sight_ext.sight_package.outer_radius,
  };
  const movingValues = {
    defaultSpeed: defaultSquadMember.moving_ext.speed_scaling_table.default_speed,
    maxSpeed: defaultSquadMember.moving_ext.speed_scaling_table.max_speed,
    acceleration: defaultSquadMember.moving_ext.acceleration,
    deceleration: defaultSquadMember.moving_ext.deceleration,
  };

  // Obtain the total cost of the squad by looking at the loadout.
  const { totalCost } = calculatedData;

  const reinforceCost = {
    cost: Math.floor(
      (defaultSquadMember.cost.manpower || 0) * resolvedSquad.reinforce.cost_percentage,
    ),
    time: Math.floor(
      (defaultSquadMember.cost.time || 0) * resolvedSquad.reinforce.time_percentage,
    ),
  };

  // Obtain the total upkeep cost of the squad.
  const { totalUpkeepCost } = calculatedData;

  // Obtain the squad weapons loadout (ignoring non-damage dealing ones like smoke).
  const { squadWeapons, upgrades, abilities, buildables } = calculatedData;

  // Use default weapon for max range.
  const rangeValues = {
    max: squadWeapons.length ? squadWeapons[0].weapon.weapon_bag.range.max : 0,
  };

  const metaKeywords = generateKeywordsString([
    `${resolvedSquad.ui.screenName} coh3`,
    `${resolvedSquad.ui.screenName} ${localizedRace}`,
    `${resolvedSquad.ui.screenName}`,
    `${resolvedSquad.ui.screenName} ${raceId}`,
  ]);

  return (
    <>
      <Head>
        <title>{`${resolvedSquad.ui.screenName} - COH3 Explorer`}</title>
        <meta name="description" content={`${resolvedSquad.ui.screenName} - COH3 Explorer`} />
        <meta name="keywords" content={metaKeywords} />
        <meta
          property="og:image"
          content={getIconsPathOnCDN(`/icons/${resolvedSquad.ui.iconName}.png`)}
        />
      </Head>
      <Container fluid p={0}>
        <Flex direction="row" align="center" gap="md">
          <FactionIcon name={raceId} width={96}></FactionIcon>
          <Stack gap="xs">
            <Title order={3}>{localizedRace}</Title>
            <Text size="md">{descriptionRace}</Text>
          </Stack>
        </Flex>
        <Space h={"xl"} />
        <Grid columns={3} grow>
          <Grid.Col span={3}>
            <Card p="md" radius="md" withBorder>
              <UnitDescriptionCard
                faction={raceId}
                desc={{
                  screen_name: resolvedSquad.ui.screenName,
                  help_text: resolvedSquad.ui.helpText,
                  brief_text: resolvedSquad.ui.briefText,
                  symbol_icon_name: resolvedSquad.ui.symbolIconName,
                  icon_name: resolvedSquad.ui.iconName,
                }}
              />
            </Card>
          </Grid.Col>
          <Grid.Col span={{ md: 2, xs: 3 }} order={1}>
            <Stack>
              <Title order={4}>Stats</Title>
              <Card p="md" radius="md" withBorder>
                {UnitSquadCard({
                  id: resolvedSquad.id,
                  type: resolvedSquad.unitType,
                  health: armorValues,
                  ui: {
                    armorIcon: resolvedSquad.ui.armorIcon,
                  },
                  sight: sightValues,
                  moving: movingValues,
                  range: rangeValues,
                  capture: {
                    cap: resolvedSquad.capture_rate,
                    decap: resolvedSquad.capture_revert,
                  },
                })}
              </Card>
              {UnitUpgradeSection(upgrades)}
              {UnitAbilitySection(abilities)}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ md: 1, xs: 3 }} order={2}>
            <Stack>
              <Title order={4}>Stats</Title>
              <Card p="md" radius="md" withBorder>
                {UnitCostCard(totalCost)}
                {defaultSquadMember.unitType !== "vehicles" &&
                defaultSquadMember.unitType !== "emplacements" ? (
                  ReinforceCostCard(reinforceCost)
                ) : (
                  <></>
                )}
              </Card>
              <Card p="md" radius="md" withBorder>
                {HitpointCard({ squad: resolvedSquad, entities: resolvedEntities })}
              </Card>
              <Card p="md" radius="md" withBorder>
                {UnitCostCard(totalUpkeepCost, "Upkeep per minute")}
              </Card>
              <Card p="md" radius="md" withBorder>
                <VeterancyCard
                  one={resolvedSquad.veterancyInfo.one}
                  two={resolvedSquad.veterancyInfo.two}
                  three={resolvedSquad.veterancyInfo.three}
                />
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
        <Grid>
          <Grid.Col>{UnitBuildingSection(buildables)}</Grid.Col>
          <Grid.Col>{UnitWeaponSection(squadWeapons)}</Grid.Col>
        </Grid>
      </Container>
    </>
  );
};

const UnitUpgradeSection = (upgrades: UpgradesType[]) => {
  // Resolve unit upgrades.
  if (!upgrades || !upgrades.length) return <></>;
  return (
    <Stack>
      <Title order={4}>Upgrades</Title>
      <Stack>
        {Object.values(upgrades).map(({ id, ui, cost }) => {
          return (
            <Card key={id} p="lg" radius="md" withBorder>
              {UnitUpgradeCard({
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
                time_cost: cost,
              })}
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
};

const UnitBuildingSection = (buildings: EbpsType[]) => {
  // Resolve unit buildables.
  if (!buildings || !buildings.length) return <></>;
  return (
    <Stack>
      <Title order={4}>Can construct</Title>
      <SimpleGrid cols={{ base: 3, xs: 1, sm: 2, lg: 3 }}>
        {Object.values(buildings).map(({ id, ui, cost }) => {
          // If we are missing the name of the ability --> it's most likely broken
          if (ui.screenName) {
            return (
              <Card key={id} p="md" radius="md" withBorder>
                {ConstructableCard({
                  id,
                  desc: {
                    screen_name: ui.screenName,
                    help_text: ui.helpText,
                    extra_text: ui.extraText,
                    brief_text: ui.briefText,
                    icon_name: ui.iconName,
                    extra_text_formatter: "",
                    brief_text_formatter: "",
                  },
                  time_cost: cost,
                })}
              </Card>
            );
          } else {
            return null;
          }
        })}
      </SimpleGrid>
    </Stack>
  );
};

const UnitAbilitySection = (abilities: AbilitiesType[]) => {
  // Resolve unit abilities.
  if (!abilities || !abilities.length) return <></>;

  return (
    <Stack>
      <Title order={4}>Abilities</Title>
      <Stack>
        {Object.values(abilities).map(({ id, ui, cost }) => {
          // If we are missing the name of the ability --> it's most likely broken
          if (ui.screenName) {
            return (
              <Card key={id} p="md" radius="md" withBorder>
                {UnitUpgradeCard({
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
                  time_cost: cost,
                })}
              </Card>
            );
          } else {
            return null;
          }
        })}
      </Stack>
    </Stack>
  );
};

const UnitWeaponSection = (squadWeapons: WeaponMember[]) => {
  return (
    <Stack>
      <Title order={4}>Loadout</Title>

      <Grid columns={2} grow>
        {squadWeapons.map(({ weapon_id, weapon, num }) => {
          return (
            <Grid.Col span={{ base: 2, md: 1 }} key={weapon_id}>
              <Card p="lg" radius="md" withBorder>
                {WeaponLoadoutCard(weapon, num)}
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>

      {/* Section: Small notes for players */}

      <List size="xs">
        <List.Item>
          <Text c="orange.5">
            The effective accuracy is impacted by several factors like target size or armor of the
            receiving unit as well as accuracy or penetration of the attacking one.
          </Text>
        </List.Item>
      </List>
    </Stack>
  );
};

const createdCalculateValuesForUnits = (
  data: {
    abilitiesData: AbilitiesType[];
    sbpsData: SbpsType[];
    ebpsData: EbpsType[];
    weaponData: WeaponType[];
    upgradesData: UpgradesType[];
  },
  unitId: string,
) => {
  const { abilitiesData, sbpsData, ebpsData, weaponData, upgradesData } = data;
  const resolvedSquad = sbpsData.find((x) => x.id === unitId);

  if (!resolvedSquad) {
    return {
      error: "Squad not found",
    };
  }

  // Obtain the total cost of the squad by looking at the loadout.
  const totalCost = getSquadTotalCost(resolvedSquad, ebpsData);

  // Obtain the total upkeep cost of the squad.
  const totalUpkeepCost = getSquadTotalUpkeepCost(resolvedSquad, ebpsData);

  // Obtain the squad weapons loadout (ignoring non-damage dealing ones like smoke).
  const squadWeapons = getSbpsWeapons(resolvedSquad, ebpsData, weaponData);

  const upgrades = Object.values(getResolvedUpgrades(resolvedSquad.upgrades, upgradesData));

  const rawAbilities = Object.values(
    getResolvedAbilities(resolvedSquad.abilities, abilitiesData),
  );

  const buildables = Object.values(getResolvedConstruction(resolvedSquad.construction, ebpsData));

  const resolvedEntities: EbpsType[] = [];

  for (const loadout of resolvedSquad.loadout || []) {
    const id = loadout.type.split("/").slice(-1)[0];
    const foundEntity = ebpsData.find((x) => x.id === id);
    if (foundEntity) {
      resolvedEntities.push(foundEntity);
    }
  }

  // Some abilities are duplicated, they have different IDs but the name and description is the same.
  // IF the UI is completely the same, we can remove the duplicates.
  // This might lead to some bugs in case other parts would be different.
  const abilities: AbilitiesType[] = [];
  for (const ability of rawAbilities) {
    // If we are missing the name of the ability --> it's most likely broken // remove it here so we save the data
    if (ability.ui.screenName) {
      if (!abilities.find((x) => JSON.stringify(x.ui) === JSON.stringify(ability.ui))) {
        abilities.push(ability);
      }
    }
  }

  return {
    resolvedSquad,
    totalCost,
    totalUpkeepCost,
    squadWeapons,
    resolvedEntities,
    upgrades,
    abilities,
    buildables,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { abilitiesData, ebpsData, sbpsData, upgradesData, weaponData } = await getMappings();

  // const raceId = context.params?.raceId as string;
  const unitId = context.params?.unitId as string;

  return {
    props: {
      calculatedData: createdCalculateValuesForUnits(
        { abilitiesData, sbpsData, ebpsData, weaponData, upgradesData },
        unitId,
      ),
    },
  };
};

export const getStaticPaths: GetStaticPaths<{ unitId: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export default UnitDetail;
