import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import Error from "next/error";
import { useRouter } from "next/router";
import {
  Card,
  Container,
  Grid,
  Group,
  List,
  SimpleGrid,
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
import { generateKeywordsString, generateLanguageAlternates } from "../../../../../src/seo-utils";
import { getMappings } from "../../../../../src/unitStats/mappings";
import { getSbpsWeapons, WeaponMember } from "../../../../../src/unitStats/dpsCommon";
import { useEffect } from "react";
import { AnalyticsExplorerUnitDetailsView } from "../../../../../src/firebase/analytics";
import { getUnitStatsCOH3Descriptions } from "../../../../../src/unitStats/descriptions";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import config from "../../../../../config";
import { getExplorerFactionRoute } from "../../../../../src/routes";
import Link from "next/link";

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
  locale: string;
  descriptions: Record<string, Record<string, string>>;
}

const UnitDetail: NextPage<UnitDetailProps> = ({ calculatedData, descriptions, locale }) => {
  const { query, asPath } = useRouter();
  const { t } = useTranslation(["explorer"]);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const descriptionRace = descriptions[raceId as raceType]?.description || null;

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

  // Enhanced meta description with unit details
  const createMetaDescription = () => {
    const unitType = resolvedSquad.unitType.replace(/_/g, " ");
    const hitpoints = defaultSquadMember.health.hitpoints || 0;
    const armor = armorValues.armor || armorValues.frontal || 0;
    const manpowerCost = totalCost.manpower || 0;
    const fuelCost = totalCost.fuel || 0;
    const munitionCost = totalCost.munition || 0;
    const popCap = totalCost.popcap || 0;

    let description = t("unitMeta.unitDescription", {
      unitName: resolvedSquad.ui.screenName,
      raceName: localizedRace,
      unitType: unitType,
    });

    // Add key stats
    const stats = [];
    if (hitpoints > 0) {
      stats.push(`${hitpoints} ${t("unitMeta.abbreviations.hitpoints")}`);
    }
    if (armor > 0) {
      stats.push(`${armor} ${t("unitMeta.abbreviations.armor")}`);
    }
    if (stats.length > 0) {
      description += ` ${stats.join(", ")}.`;
    }

    // Add cost information
    const costs = [];
    if (manpowerCost > 0) {
      costs.push(`${manpowerCost} ${t("unitMeta.abbreviations.manpower")}`);
    }
    if (fuelCost > 0) {
      costs.push(`${fuelCost} ${t("unitMeta.abbreviations.fuel")}`);
    }
    if (munitionCost > 0) {
      costs.push(`${munitionCost} ${t("unitMeta.abbreviations.munition")}`);
    }
    if (costs.length > 0) {
      description += ` ${t("unitMeta.costs", { costs: costs.join("/") })}`;
    }

    // Add population cap
    if (popCap > 0) {
      description += ` ${t("unitMeta.population", { popCap })}`;
    }

    // Add tactical role based on unit type and brief text
    if (resolvedSquad.ui.briefText) {
      const briefText = resolvedSquad.ui.briefText
        .replace(/\\r?\\n|\\r|\\n/g, " ")
        .replace(/\*/g, "")
        .trim();
      if (briefText && briefText.length > 0 && briefText !== "No text found") {
        // Truncate brief text to keep description under 160 characters
        const remainingLength = 160 - description.length - 1;
        if (remainingLength > 20) {
          const truncatedBrief =
            briefText.length > remainingLength
              ? briefText.substring(0, remainingLength - 3) + "..."
              : briefText;
          description += ` ${truncatedBrief}`;
        }
      }
    }

    return description.length > 160 ? description.substring(0, 157) + "..." : description;
  };

  // Enhanced keywords with unit-specific terms
  const createEnhancedKeywords = () => {
    const baseKeywords = [
      `${resolvedSquad.ui.screenName}`,
      `${resolvedSquad.ui.screenName} coh3`,
      `${resolvedSquad.ui.screenName} ${localizedRace}`,
      `${localizedRace} ${resolvedSquad.unitType.replace(/_/g, " ")}`,
      `coh3 ${resolvedSquad.unitType.replace(/_/g, " ")}`,
    ];

    // Add unit type specific keywords
    if (resolvedSquad.unitType === "vehicles") {
      baseKeywords.push(
        t("unitMeta.keywords.vehicles.tank"),
        t("unitMeta.keywords.vehicles.vehicle"),
        t("unitMeta.keywords.vehicles.armorStats"),
        t("unitMeta.keywords.vehicles.vehicleGuide"),
      );
    } else if (resolvedSquad.unitType === "infantry") {
      baseKeywords.push(
        t("unitMeta.keywords.infantry.infantry"),
        t("unitMeta.keywords.infantry.squadStats"),
        t("unitMeta.keywords.infantry.unitGuide"),
        t("unitMeta.keywords.infantry.infantryTactics"),
      );
    } else if (resolvedSquad.unitType === "team_weapons") {
      baseKeywords.push(
        t("unitMeta.keywords.teamWeapons.teamWeapon"),
        t("unitMeta.keywords.teamWeapons.supportWeapon"),
        t("unitMeta.keywords.teamWeapons.crewWeapon"),
        t("unitMeta.keywords.teamWeapons.artillery"),
      );
    } else if (resolvedSquad.unitType === "emplacements") {
      baseKeywords.push(
        t("unitMeta.keywords.emplacements.emplacement"),
        t("unitMeta.keywords.emplacements.defensiveStructure"),
        t("unitMeta.keywords.emplacements.fortification"),
      );
    }

    // Add faction-specific keywords
    baseKeywords.push(
      t("meta.keywords.common.units", { raceId }),
      t("meta.keywords.common.army", { raceId }),
    );

    return generateKeywordsString(baseKeywords);
  };

  const metaDescription = createMetaDescription();
  const metaKeywords = createEnhancedKeywords();
  const pageTitle = `${resolvedSquad.ui.screenName} - ${localizedRace} ${resolvedSquad.unitType.replace(/_/g, " ")} | COH3 Stats`;

  return (
    <>
      <NextSeo
        title={pageTitle}
        description={metaDescription}
        canonical={`${config.SITE_URL}${asPath}`}
        openGraph={{
          title: pageTitle,
          description: metaDescription,
          url: `${config.SITE_URL}${asPath}`,
          siteName: "COH3 Stats",
          locale: locale,
          images: [
            {
              url: getIconsPathOnCDN(`/icons/${resolvedSquad.ui.iconName}.png`),
              width: 256,
              height: 256,
              alt: `${resolvedSquad.ui.screenName} unit icon`,
            },
          ],
        }}
        twitter={{
          cardType: "summary",
        }}
        additionalMetaTags={[
          {
            name: "keywords",
            content: metaKeywords,
          },
          {
            name: "author",
            content: "COH3 Stats",
          },
          {
            name: "robots",
            content: "index, follow",
          },
        ]}
        languageAlternates={generateLanguageAlternates(asPath)}
      />
      <Container fluid pl={0} pr={0} pt={"md"}>
        <Grid columns={3} grow>
          <Grid.Col span={3}>
            <Group align="stretch" gap="xl">
              <Card p="md" radius="md" withBorder style={{ flex: 1 }}>
                <UnitDescriptionCard
                  faction={raceId}
                  desc={{
                    screen_name: resolvedSquad.ui.screenName,
                    help_text: resolvedSquad.ui.helpText,
                    brief_text: resolvedSquad.ui.briefText,
                    symbol_icon_name: resolvedSquad.ui.symbolIconName,
                    icon_name: resolvedSquad.ui.iconName,
                  }}
                  placement="singleUnit"
                />
              </Card>
              <div style={{ display: "flex", alignItems: "stretch" }}>
                <Link href={getExplorerFactionRoute(raceId)}>
                  <FactionIcon
                    name={raceId}
                    width={150}
                    style={{ height: "100%", objectFit: "contain" }}
                  />
                </Link>
              </div>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ md: 2, xs: 3 }} order={1}>
            <Stack>
              <Title order={4}>{t("unitPage.stats")}</Title>
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
              <UnitUpgradeSection upgrades={upgrades} title={t("common.upgrades")} />
              <UnitAbilitySection abilities={abilities} title={t("unitPage.abilities")} />
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ md: 1, xs: 3 }} order={2}>
            <Stack>
              <Title order={4}>{t("unitPage.stats")}</Title>
              <Card p="md" radius="md" withBorder>
                {UnitCostCard(totalCost, t("common.costs"))}
                {defaultSquadMember.unitType !== "vehicles" &&
                defaultSquadMember.unitType !== "emplacements" ? (
                  ReinforceCostCard(reinforceCost, t("unitPage.reinforce"))
                ) : (
                  <></>
                )}
              </Card>
              <Card p="md" radius="md" withBorder>
                {HitpointCard({
                  squad: resolvedSquad,
                  entities: resolvedEntities,
                  title: t("common.hitpoints"),
                })}
              </Card>
              <Card p="md" radius="md" withBorder>
                {UnitCostCard(totalUpkeepCost, t("unitPage.upkeep"))}
              </Card>
              <Card p="md" radius="md" withBorder>
                <VeterancyCard
                  one={resolvedSquad.veterancyInfo.one}
                  two={resolvedSquad.veterancyInfo.two}
                  three={resolvedSquad.veterancyInfo.three}
                  title={t("unitPage.veterancy")}
                />
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
        <Grid>
          <Grid.Col>{UnitBuildingSection(buildables, t("unitPage.construct"))}</Grid.Col>
          <Grid.Col>
            {UnitWeaponSection(squadWeapons, t("unitPage.loadout"), t("unitPage.weaponNote"))}
          </Grid.Col>
        </Grid>
      </Container>
    </>
  );
};

const UnitUpgradeSection: React.FC<{ upgrades: UpgradesType[]; title: string }> = ({
  upgrades,
  title,
}) => {
  if (!upgrades?.length) return null;

  return (
    <Stack>
      <Title order={4}>{title}</Title>
      <Stack>
        {Object.values(upgrades).map(({ id, ui, cost }) => (
          <Card key={id} p="lg" radius="md" withBorder>
            <UnitUpgradeCard
              id={id}
              desc={{
                screen_name: ui.screenName,
                help_text: ui.helpText,
                extra_text: ui.extraText,
                brief_text: ui.briefText,
                icon_name: ui.iconName,
                extra_text_formatter: ui.extraTextFormatter,
                brief_text_formatter: ui.briefTextFormatter,
              }}
              time_cost={cost}
            />
          </Card>
        ))}
      </Stack>
    </Stack>
  );
};

const UnitBuildingSection = (buildings: EbpsType[], title = "Can Construct") => {
  // Resolve unit buildables.
  if (!buildings || !buildings.length) return <></>;
  return (
    <Stack>
      <Title order={4}>{title}</Title>
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

const UnitAbilitySection: React.FC<{ abilities: AbilitiesType[]; title: string }> = ({
  abilities,
  title,
}) => {
  if (!abilities?.length) return null;

  return (
    <Stack>
      <Title order={4}>{title}</Title>
      <Stack>
        {Object.values(abilities).map(({ id, ui, cost }) => (
          <Card key={id} p="md" radius="md" withBorder>
            <UnitUpgradeCard
              id={id}
              desc={{
                screen_name: ui.screenName,
                help_text: ui.helpText,
                extra_text: ui.extraText,
                brief_text: ui.briefText,
                icon_name: ui.iconName,
                extra_text_formatter: ui.extraTextFormatter,
                brief_text_formatter: ui.briefTextFormatter,
              }}
              time_cost={cost}
            />
          </Card>
        ))}
      </Stack>
    </Stack>
  );
};

const UnitWeaponSection = (squadWeapons: WeaponMember[], title = "Loadout", weaponNote = "") => {
  return (
    <Stack>
      <Title order={4}>{title}</Title>

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

      <List size="xs" pl="md">
        <List.Item>
          <Text fs="italic">{weaponNote}</Text>
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
  const locale = context.locale || "en";

  const { abilitiesData, ebpsData, sbpsData, upgradesData, weaponData } =
    await getMappings(locale);

  // const raceId = context.params?.raceId as string;
  const unitId = context.params?.unitId as string;

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "explorer"])),
      calculatedData: createdCalculateValuesForUnits(
        { abilitiesData, sbpsData, ebpsData, weaponData, upgradesData },
        unitId,
      ),
      locale,
      descriptions: getUnitStatsCOH3Descriptions(locale),
    },
    revalidate: false,
  };
};

export const getStaticPaths: GetStaticPaths<{ unitId: string }> = async () => {
  // If FULL_BUILD is not enabled, return empty paths to minimize build time
  if (!config.FULL_BUILD) {
    return {
      paths: [],
      fallback: "blocking", // All pages will be generated on-demand
    };
  }

  const { sbpsData } = await getMappings();

  const unitPaths = [];

  const factions = ["american", "british", "german", "dak", "afrika_korps"];

  for (const faction of factions) {
    const units = sbpsData.filter((squad: any) => squad.faction.includes(faction));
    for (const unit of units) {
      const factionAsRaceID = faction === "afrika_korps" ? "dak" : faction;

      unitPaths.push({
        params: {
          raceId: factionAsRaceID,
          unitId: unit.id,
        },
      });
    }
  }
  return {
    paths: unitPaths,
    fallback: "blocking", //indicates the type of fallback
  };
};

export default UnitDetail;
