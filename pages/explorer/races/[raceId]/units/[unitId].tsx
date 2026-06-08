import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import Error from "next/error";
import { useRouter } from "next/router";
import {
  Card,
  Container,
  Flex,
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
import type { UnitUpgradeDisplayRequirement } from "../../../../../components/unit-cards/unit-upgrade-card";
import { VeterancyCard } from "../../../../../components/unit-cards/veterancy-card";
import { WeaponLoadoutCard } from "../../../../../components/unit-cards/weapon-loadout-card";
import { HitpointCard } from "../../../../../components/unit-cards/hitpoints-card";
import { UnitSquadCard } from "../../../../../components/unit-cards/unit-squad-card";
import { getIconsPathOnCDN } from "../../../../../src/utils";
import { generateKeywordsString, generateLanguageAlternates } from "../../../../../src/seo-utils";
import { getMappings } from "../../../../../src/unitStats/mappings";
import {
  getSbpsWeapons,
  getUpgradeWeaponLoadouts,
  UpgradeWeaponLoadout,
  WeaponMember,
} from "../../../../../src/unitStats/dpsCommon";
import { useEffect } from "react";
import { AnalyticsExplorerUnitDetailsView } from "../../../../../src/firebase/analytics";
import { getUnitStatsCOH3Descriptions } from "../../../../../src/unitStats/descriptions";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import config from "../../../../../config";
import { getExplorerFactionRoute } from "../../../../../src/routes";
import Link from "next/link";
import ImageWithFallback, { symbolPlaceholder } from "../../../../../components/placeholders";

type AbilityWeaponLoadout = {
  ability: AbilitiesType;
  weapons: AbilityWeaponMember[];
  numShots: number | null;
};

type AbilityWeaponMember = {
  weapon_id: string;
  weapon: WeaponType;
  num: number;
};

interface UnitDetailProps {
  calculatedData: {
    resolvedSquad: SbpsType;
    totalCost: ResourceValues;
    totalUpkeepCost: ResourceValues;
    squadWeapons: WeaponMember[];
    upgradeWeaponLoadouts: UpgradeWeaponLoadout[];
    abilityWeaponLoadouts: AbilityWeaponLoadout[];
    resolvedEntities: EbpsType[];
    upgrades: UpgradesType[];
    upgradesData: UpgradesType[];
    abilities: AbilitiesType[];
    buildables: EbpsType[];
  };
  locale: string;
  descriptions: Record<string, Record<string, string | null>>;
}

const roundToDecimals = (value: number, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

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

  const getIconSrc = (iconName?: string) => {
    const normalizedIconName = iconName?.trim() ?? "";

    if (!normalizedIconName) return undefined;
    if (normalizedIconName.startsWith("/")) return normalizedIconName;

    return normalizedIconName.endsWith(".png")
      ? `/icons/${normalizedIconName}`
      : `/icons/${normalizedIconName}.png`;
  };

  const getUpgradeRequirementDisplay = (requirementIds?: string[]) => {
    if (!requirementIds?.length) return undefined;

    const requirements = requirementIds.map((requirementId) => {
      const upgrade = calculatedData.upgradesData.find((upgrade) => upgrade.id === requirementId);

      return {
        label: upgrade?.ui.screenName || requirementId.replaceAll("_", " "),
        icon: getIconSrc(upgrade?.ui.iconName),
      };
    });

    return {
      label: requirements.map((requirement) => requirement.label).join(", "),
      icon: requirements[0]?.icon,
    };
  };

  const resolveDisplayRequirements = (
    requirements?: AbilitiesType["displayRequirements"] | UpgradesType["displayRequirements"],
  ): UnitUpgradeDisplayRequirement[] => {
    const resolvedRequirements: UnitUpgradeDisplayRequirement[] = [];

    for (const requirement of requirements ?? []) {
      if (requirement.type === "veterancy") {
        resolvedRequirements.push({
          type: "veterancy",
          label: t("unitPage.requiresVeterancy", { rank: requirement.rank }),
        });

        continue;
      }

      const upgrade = calculatedData.upgradesData.find(
        (upgrade) => upgrade.id === requirement.upgradeId,
      );

      resolvedRequirements.push({
        type: "upgrade",
        label: upgrade?.ui.screenName || requirement.upgradeId.replaceAll("_", " "),
        icon: getIconSrc(upgrade?.ui.iconName),
      });
    }

    return resolvedRequirements;
  };

  const vetFourRequirement = getUpgradeRequirementDisplay(
    resolvedSquad.veterancyInfo.four?.requirementIds,
  );

  const veterancyInfo = {
    one: resolvedSquad.veterancyInfo.one,
    two: resolvedSquad.veterancyInfo.two,
    three: resolvedSquad.veterancyInfo.three,
    four: resolvedSquad.veterancyInfo.four
      ? {
          ...resolvedSquad.veterancyInfo.four,
          requirement: vetFourRequirement?.label,
          requirementIcon: vetFourRequirement?.icon,
        }
      : undefined,
  };

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
    tp_global: defaultSquadMember.sight_ext.detect_camouflage.tp_global,
  };
  const movingValues = {
    defaultSpeed: defaultSquadMember.moving_ext.speed_scaling_table.default_speed,
    maxSpeed: defaultSquadMember.moving_ext.speed_scaling_table.max_speed,
    acceleration: defaultSquadMember.moving_ext.acceleration,
    deceleration: defaultSquadMember.moving_ext.deceleration,
    rotation: defaultSquadMember.moving_ext.rotation_rate,
  };

  // Obtain the total cost of the squad by looking at the loadout.
  const { totalCost } = calculatedData;

  const reinforceCost = {
    cost: roundToDecimals(
      (defaultSquadMember.cost.manpower || 0) * (resolvedSquad.reinforce.cost_percentage || 1),
      2,
    ),
    time: roundToDecimals(
      (defaultSquadMember.cost.time || 0) * (resolvedSquad.reinforce.time_percentage || 1),
      2,
    ),
  };

  // Obtain the total upkeep cost of the squad.
  const { totalUpkeepCost } = calculatedData;

  // Obtain the squad weapons loadout (ignoring non-damage dealing ones like smoke).
  const {
    squadWeapons,
    upgradeWeaponLoadouts,
    abilityWeaponLoadouts,
    upgrades,
    abilities,
    buildables,
  } = calculatedData;

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
      <Container fluid pl={0} pr={0} pt={"md"} data-testid="unit-detail-container">
        <Grid columns={3} grow>
          <Grid.Col span={3}>
            <Group align="stretch" gap="xl">
              <Card
                p="md"
                radius="md"
                withBorder
                style={{ flex: 1 }}
                data-testid="unit-description-card"
              >
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
                <Link href={getExplorerFactionRoute(raceId)} data-testid="faction-link">
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
              <Title order={4} data-testid="stats-heading">
                {t("unitPage.stats")}
              </Title>
              <Card p={{ base: "xs", sm: "md" }} radius="md" withBorder data-testid="stats-card">
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
              <UnitUpgradeSection
                upgrades={upgrades}
                title={t("common.upgrades")}
                getRequirements={resolveDisplayRequirements}
              />

              <UnitAbilitySection
                abilities={abilities}
                title={t("unitPage.abilities")}
                getRequirements={resolveDisplayRequirements}
              />
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ md: 1, xs: 3 }} order={2}>
            <Stack>
              <Title order={4} data-testid="costs-heading">
                {t("unitPage.stats")}
              </Title>
              <Card p="md" radius="md" withBorder data-testid="costs-card">
                {UnitCostCard(totalCost, t("common.costs"))}
                {defaultSquadMember.unitType !== "vehicles" &&
                defaultSquadMember.unitType !== "emplacements" ? (
                  ReinforceCostCard(reinforceCost, t("unitPage.reinforce"))
                ) : (
                  <></>
                )}
              </Card>
              <Card p="md" radius="md" withBorder data-testid="hitpoints-card">
                {HitpointCard({
                  squad: resolvedSquad,
                  entities: resolvedEntities,
                  title: t("common.hitpoints"),
                })}
              </Card>
              <Card p="md" radius="md" withBorder data-testid="upkeep-card">
                {UnitCostCard(totalUpkeepCost, t("unitPage.upkeep"))}
              </Card>
              <Card p="md" radius="md" withBorder data-testid="veterancy-card">
                <VeterancyCard
                  one={veterancyInfo.one}
                  two={veterancyInfo.two}
                  three={veterancyInfo.three}
                  four={veterancyInfo.four}
                  title={t("unitPage.veterancy")}
                />
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
        <Grid>
          <Grid.Col data-testid="can-construct-section">
            {UnitBuildingSection(buildables, t("unitPage.construct"))}
          </Grid.Col>
          <Grid.Col data-testid="loadout-section">
            {UnitWeaponSection(squadWeapons, t("unitPage.loadout"), t("unitPage.weaponNote"))}
          </Grid.Col>
          <Grid.Col>
            {UnitUpgradeWeaponSection(
              upgradeWeaponLoadouts,
              t("unitPage.upgradeWeapons"),
              resolveDisplayRequirements,
            )}
          </Grid.Col>
          <Grid.Col>
            {UnitAbilityWeaponSection(
              abilityWeaponLoadouts,
              t("unitPage.abilityWeapons"),
              resolveDisplayRequirements,
            )}
          </Grid.Col>
        </Grid>
      </Container>
    </>
  );
};

const UnitUpgradeSection: React.FC<{
  upgrades: UpgradesType[];
  title: string;
  getRequirements: (
    requirements?: UpgradesType["displayRequirements"],
  ) => UnitUpgradeDisplayRequirement[];
}> = ({ upgrades, title, getRequirements }) => {
  if (!upgrades?.length) return null;

  return (
    <Stack data-testid="upgrades-section">
      <Title order={4} data-testid="upgrades-heading">
        {title}
      </Title>
      <Stack>
        {Object.values(upgrades).map((upgrade) => (
          <Card
            key={upgrade.id}
            p={{ base: "xs", sm: "md" }}
            radius="md"
            withBorder
            data-testid={`upgrade-card-${upgrade.id}`}
          >
            <UnitUpgradeCard
              id={upgrade.id}
              desc={{
                screen_name: upgrade.ui.screenName,
                help_text: upgrade.ui.helpText,
                extra_text: upgrade.ui.extraText,
                brief_text: upgrade.ui.briefText,
                icon_name: upgrade.ui.iconName,
                extra_text_formatter: upgrade.ui.extraTextFormatter,
                brief_text_formatter: upgrade.ui.briefTextFormatter,
              }}
              time_cost={upgrade.cost}
              requirements={getRequirements(upgrade.displayRequirements)}
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
      <Title order={4} data-testid="can-construct-heading">
        {title}
      </Title>
      <SimpleGrid cols={{ base: 3, xs: 1, sm: 2, lg: 3 }}>
        {Object.values(buildings).map(({ id, ui, cost }) => {
          // If we are missing the name of the ability --> it's most likely broken
          if (ui.screenName) {
            return (
              <Card
                key={id}
                p="md"
                radius="md"
                withBorder
                data-testid={`constructable-card-${id}`}
              >
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

const UnitAbilitySection: React.FC<{
  abilities: AbilitiesType[];
  title: string;
  getRequirements: (
    requirements?: AbilitiesType["displayRequirements"],
  ) => UnitUpgradeDisplayRequirement[];
}> = ({ abilities, title, getRequirements }) => {
  const { t } = useTranslation(["explorer"]);

  if (!abilities?.length) return null;

  return (
    <Stack data-testid="abilities-section">
      <Title order={4} data-testid="abilities-heading">
        {title}
      </Title>
      <Stack>
        {Object.values(abilities).map((ability) => (
          <Card
            key={ability.id}
            p={{ base: "xs", sm: "md" }}
            radius="md"
            withBorder
            data-testid={`ability-card-${ability.id}`}
          >
            <UnitUpgradeCard
              id={ability.id}
              desc={{
                screen_name: ability.ui.screenName,
                help_text: ability.ui.helpText,
                extra_text: ability.ui.extraText,
                brief_text: ability.ui.briefText,
                icon_name: ability.ui.iconName,
                extra_text_formatter: ability.ui.extraTextFormatter,
                brief_text_formatter: ability.ui.briefTextFormatter,
              }}
              time_cost={ability.cost}
              requirements={getRequirements(ability.displayRequirements)}
              footerContent={
                <AbilityInfoRow ability={ability} numShots={ability.numShots ?? null} t={t} />
              }
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
      <Title order={4} data-testid="loadout-heading">
        {title}
      </Title>

      <Grid columns={2} grow>
        {squadWeapons.map(({ weapon_id, weapon, num }) => {
          return (
            <Grid.Col span={{ base: 2, md: 1 }} key={weapon_id}>
              <Card p="lg" radius="md" withBorder data-testid={`weapon-card-${weapon_id}`}>
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

const UnitUpgradeWeaponSection = (
  upgradeWeaponLoadouts: UpgradeWeaponLoadout[],
  title = "Upgrade weapons",
  getRequirements: (
    requirements?: UpgradesType["displayRequirements"],
  ) => UnitUpgradeDisplayRequirement[],
) => {
  if (!upgradeWeaponLoadouts?.length) return null;

  return (
    <Stack>
      <Title order={4}>{title}</Title>

      <Stack>
        {upgradeWeaponLoadouts.map(({ upgrade, weapons }) => (
          <Card
            key={upgrade.id}
            p="md"
            radius="md"
            withBorder
            c="gray.0"
            style={{
              background:
                "linear-gradient(135deg, rgba(9, 20, 38, 0.98) 0%, rgba(30, 96, 185, 0.72) 18%, rgba(27, 31, 34, 0.98) 30%)",
              borderColor: "rgba(74, 144, 245, 0.38)",
              boxShadow:
                "inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 0 18px rgba(74, 144, 245, 0.10)",
              color: "var(--mantine-color-gray-0)", // Keep readable in light mode; this card is always dark.
            }}
          >
            <Stack>
              <UnitUpgradeCard
                id={upgrade.id}
                desc={{
                  screen_name: upgrade.ui.screenName,
                  help_text: upgrade.ui.helpText,
                  extra_text: upgrade.ui.extraText,
                  brief_text: upgrade.ui.briefText,
                  icon_name: upgrade.ui.iconName,
                  extra_text_formatter: upgrade.ui.extraTextFormatter,
                  brief_text_formatter: upgrade.ui.briefTextFormatter,
                }}
                time_cost={upgrade.cost}
                requirements={getRequirements(upgrade.displayRequirements)}
              />

              <Grid columns={2} grow>
                {weapons.map(({ weapon_id, weapon, num }) => (
                  <Grid.Col span={{ base: 2, md: 1 }} key={`${upgrade.id}-${weapon_id}`}>
                    <Card p="lg" radius="md" withBorder>
                      {WeaponLoadoutCard(weapon, num)}
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
};

const AbilityInfoIcons = {
  range: "/icons/unit_status/bw2/range_boost.png",
  shots: "/icons/common/abilities/ability_british_counter_barrage.png",
  duration: "/icons/unit_status/bw2/ammo_swap.png",
  cooldown: "/icons/common/resources/resource_buildtime_extra.png",
} as const;

const formatShotCount = (numShots: number) => {
  return Number.isInteger(numShots) ? numShots : Number(numShots.toFixed(2));
};

const formatAbilityRange = (minRange: number | null, range: number) => {
  const formattedRange = Number.isInteger(range) ? range : Number(range.toFixed(2));

  if (minRange !== null && minRange > 0) {
    const formattedMinRange = Number.isInteger(minRange) ? minRange : Number(minRange.toFixed(2));

    return `${formattedMinRange} - ${formattedRange}`;
  }

  return formattedRange;
};

const formatSeconds = (seconds: number) => {
  return Number.isInteger(seconds) ? seconds : Number(seconds.toFixed(2));
};

const AbilityInfoStat = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: string;
}) => (
  <Stack gap={0}>
    <Title order={6} tt="uppercase">
      {label}
    </Title>

    <Flex align="center" gap={4} mt={4} wrap="nowrap">
      <ImageWithFallback
        width={20}
        height={20}
        src={icon}
        alt={label}
        fallbackSrc={symbolPlaceholder}
        style={{ flexShrink: 0 }}
      />
      <Text>{value}</Text>
    </Flex>
  </Stack>
);

const AbilityInfoRow = ({
  ability,
  numShots,
  t,
}: {
  ability: AbilitiesType;
  numShots?: number | null;
  t: (key: string, options?: Record<string, unknown>) => string;
}) => {
  const items: React.ReactNode[] = [];
  const isToggle = ability.activation === "toggle";

  const isTargetedAbility = ability.activation === "targeted";

  if (isTargetedAbility && ability.range !== null && ability.range > 0) {
    items.push(
      <AbilityInfoStat
        key="range"
        icon={AbilityInfoIcons.range}
        label={t("unitPage.abilityInfoRange")}
        value={formatAbilityRange(ability.minRange ?? null, ability.range)}
      />,
    );
  }

  if (numShots !== null && numShots !== undefined && numShots > 0) {
    items.push(
      <AbilityInfoStat
        key="shots"
        icon={AbilityInfoIcons.shots}
        label={t("unitPage.abilityInfoShots")}
        value={formatShotCount(numShots)}
      />,
    );
  }

  if (isToggle) {
    const toggleOn = ability.toggledRechargeTimeOn;
    const toggleOff = ability.toggledRechargeTimeOff;

    if (toggleOn !== null && toggleOn > 0 && toggleOff !== null && toggleOff > 0) {
      if (toggleOn === toggleOff) {
        items.push(
          <AbilityInfoStat
            key="toggle"
            icon={AbilityInfoIcons.cooldown}
            label={t("unitPage.abilityInfoToggleCooldown")}
            value={`${formatSeconds(toggleOn)}s`}
          />,
        );
      } else {
        items.push(
          <AbilityInfoStat
            key="toggle-on"
            icon={AbilityInfoIcons.cooldown}
            label={t("unitPage.abilityInfoToggleOnCooldown")}
            value={`${formatSeconds(toggleOn)}s`}
          />,
        );

        items.push(
          <AbilityInfoStat
            key="toggle-off"
            icon={AbilityInfoIcons.cooldown}
            label={t("unitPage.abilityInfoToggleOffCooldown")}
            value={`${formatSeconds(toggleOff)}s`}
          />,
        );
      }
    } else if (toggleOn !== null && toggleOn > 0) {
      items.push(
        <AbilityInfoStat
          key="toggle-on"
          icon={AbilityInfoIcons.cooldown}
          label={t("unitPage.abilityInfoToggleOnCooldown")}
          value={`${formatSeconds(toggleOn)}s`}
        />,
      );
    } else if (toggleOff !== null && toggleOff > 0) {
      items.push(
        <AbilityInfoStat
          key="toggle-off"
          icon={AbilityInfoIcons.cooldown}
          label={t("unitPage.abilityInfoToggleOffCooldown")}
          value={`${formatSeconds(toggleOff)}s`}
        />,
      );
    }
  } else {
    if (ability.duration !== null && ability.duration > 0) {
      items.push(
        <AbilityInfoStat
          key="duration"
          icon={AbilityInfoIcons.duration}
          label={t("unitPage.abilityInfoDuration")}
          value={`${formatSeconds(ability.duration)}s`}
        />,
      );
    }

    if (ability.rechargeTime > 0) {
      items.push(
        <AbilityInfoStat
          key="cooldown"
          icon={AbilityInfoIcons.cooldown}
          label={t("unitPage.abilityInfoCooldown")}
          value={`${formatSeconds(ability.rechargeTime)}s`}
        />,
      );
    }
  }

  if (!items.length) return null;

  return (
    <Group gap="lg" wrap="wrap" justify="flex-start" align="flex-start">
      {items}
    </Group>
  );
};

const getIdFromReference = (reference: unknown) => {
  if (!reference || typeof reference !== "object") return "";

  const obj = reference as Record<string, unknown>;
  const rawReference =
    typeof obj.ebp === "string"
      ? obj.ebp
      : typeof obj.pbg === "string"
        ? obj.pbg
        : typeof obj.instance_reference === "string"
          ? obj.instance_reference
          : "";

  return rawReference.replace(/\\/g, "/").split("/").filter(Boolean).slice(-1)[0] || "";
};

const mapAbilityWeaponMember = (weapon: WeaponType, num = 1): AbilityWeaponMember => ({
  weapon_id: weapon.id,
  weapon,
  num,
});

const isDamageDealingWeapon = (weapon: WeaponType) => {
  const weaponBag = weapon.weapon_bag;

  return weaponBag.damage_min > 0 || weaponBag.damage_max > 0 || weaponBag.suppression_amount > 0;
};

const getWeaponMembersFromAbilityWeaponReference = (
  weaponReferenceId: string,
  ebpsData: EbpsType[],
  weaponData: WeaponType[],
): AbilityWeaponMember[] => {
  const weaponEbps = ebpsData.find((ebps) => ebps.id === weaponReferenceId);

  if (!weaponEbps) {
    const directWeapon = weaponData.find((gun) => gun.id === weaponReferenceId);

    if (directWeapon) {
      return [mapAbilityWeaponMember(directWeapon, 1)];
    }

    return [];
  }

  const weaponMembers: AbilityWeaponMember[] = [];

  // Most ability WEAPON_PBG_* values point directly to a weapon EBPS.
  // That EBPS then points to the final weapon stats through weaponId.
  if (weaponEbps.weaponId) {
    const weapon = weaponData.find((gun) => gun.id === weaponEbps.weaponId);

    if (weapon) {
      weaponMembers.push(mapAbilityWeaponMember(weapon, 1));
    }
  }

  // Fallback: some EBPS entries may point to one or more weapon EBPS entries
  // through weaponRef, like normal unit loadouts do.
  for (const weaponRef of weaponEbps.weaponRef || []) {
    const referencedWeaponEbpsId = getIdFromReference(weaponRef);
    if (!referencedWeaponEbpsId) continue;

    const referencedWeaponEbps = ebpsData.find((ebps) => ebps.id === referencedWeaponEbpsId);
    if (!referencedWeaponEbps?.weaponId) continue;

    const weapon = weaponData.find((gun) => gun.id === referencedWeaponEbps.weaponId);
    if (!weapon) continue;

    weaponMembers.push(mapAbilityWeaponMember(weapon, 1));
  }

  return weaponMembers;
};

const getAbilityWeaponLoadouts = (
  abilities: AbilitiesType[],
  ebpsData: EbpsType[],
  weaponData: WeaponType[],
): AbilityWeaponLoadout[] => {
  return abilities
    .map((ability) => {
      const weapons = (ability.abilityWeaponIds || [])
        .flatMap((weaponEbpsId) =>
          getWeaponMembersFromAbilityWeaponReference(weaponEbpsId, ebpsData, weaponData),
        )
        .filter(({ weapon }) => isDamageDealingWeapon(weapon));

      return {
        ability,
        weapons,
        numShots: ability.numShots ?? null,
      };
    })
    .filter(({ weapons }) => weapons.length > 0);
};

const getDisplayRequirementDeduplicationKey = (
  requirement: AbilitiesType["displayRequirements"][number],
) => {
  if (requirement.type === "veterancy") {
    return `veterancy:${requirement.rank}`;
  }

  return `${requirement.type}:${requirement.upgradeId}`;
};

const getAbilityDisplayRequirementsDeduplicationKey = (ability: AbilitiesType) => {
  return (ability.displayRequirements ?? []).map(getDisplayRequirementDeduplicationKey).sort();
};

const getAbilityDeduplicationKey = (ability: AbilitiesType) =>
  JSON.stringify({
    ui: ability.ui,
    activation: ability.activation,
    abilityWeaponIds: ability.abilityWeaponIds || [],
    numShots: ability.numShots ?? null,
    range: ability.range ?? null,
    minRange: ability.minRange ?? null,
    rechargeTime: ability.rechargeTime ?? 0,
    toggledRechargeTimeOn: ability.toggledRechargeTimeOn ?? null,
    toggledRechargeTimeOff: ability.toggledRechargeTimeOff ?? null,
    duration: ability.duration ?? null,
    displayRequirements: getAbilityDisplayRequirementsDeduplicationKey(ability),
  });

const UnitAbilityWeaponSection = (
  abilityWeaponLoadouts: AbilityWeaponLoadout[],
  title = "Ability weapons",
  getRequirements: (
    requirements?: AbilitiesType["displayRequirements"],
  ) => UnitUpgradeDisplayRequirement[],
) => {
  const { t } = useTranslation(["explorer"]);
  if (!abilityWeaponLoadouts?.length) return null;

  return (
    <Stack>
      <Title order={4}>{title}</Title>

      <Stack>
        {abilityWeaponLoadouts.map(({ ability, weapons, numShots }) => (
          <Card
            key={ability.id}
            p="md"
            radius="md"
            withBorder
            c="gray.0"
            style={{
              background:
                "linear-gradient(135deg, rgba(34, 22, 12, 0.98) 0%, rgba(128, 72, 30, 0.70) 18%, rgba(27, 31, 34, 0.98) 30%)",
              borderColor: "rgba(245, 159, 66, 0.34)",
              boxShadow:
                "inset 0 1px 0 rgba(255, 255, 255, 0.035), 0 0 18px rgba(245, 159, 66, 0.08)",
              color: "var(--mantine-color-gray-0)",
            }}
          >
            <Stack>
              <UnitUpgradeCard
                id={ability.id}
                desc={{
                  screen_name: ability.ui.screenName,
                  help_text: ability.ui.helpText,
                  extra_text: ability.ui.extraText,
                  brief_text: ability.ui.briefText,
                  icon_name: ability.ui.iconName,
                  extra_text_formatter: ability.ui.extraTextFormatter,
                  brief_text_formatter: ability.ui.briefTextFormatter,
                }}
                time_cost={ability.cost}
                footerContent={<AbilityInfoRow ability={ability} numShots={numShots} t={t} />}
                requirements={getRequirements(ability.displayRequirements)}
              />

              {weapons.length ? (
                <Grid columns={2} grow>
                  {weapons.map(({ weapon_id, weapon, num }) => (
                    <Grid.Col span={{ base: 2, md: 1 }} key={`${ability.id}-${weapon_id}`}>
                      <Card p="lg" radius="md" withBorder>
                        {WeaponLoadoutCard(weapon, num, {
                          source: "ability",
                          abilityNumShots: numShots,
                        })}
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              ) : null}
            </Stack>
          </Card>
        ))}
      </Stack>
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

  const upgrades = Object.values(getResolvedUpgrades(resolvedSquad.upgrades, upgradesData));

  // Spawn upgrades are baked into the base loadout.
  const squadWeapons = getSbpsWeapons(resolvedSquad, ebpsData, weaponData, upgradesData);

  // Purchasable upgrades are shown separately.
  const upgradeWeaponLoadouts = getUpgradeWeaponLoadouts(
    resolvedSquad,
    upgrades,
    ebpsData,
    weaponData,
  );

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
  const seenAbilities = new Set<string>();
  for (const ability of rawAbilities) {
    // If we are missing the name of the ability --> it's most likely broken // remove it here so we save the data
    if (ability.ui.screenName) {
      const deduplicationKey = getAbilityDeduplicationKey(ability);
      if (!seenAbilities.has(deduplicationKey)) {
        seenAbilities.add(deduplicationKey);
        abilities.push(ability);
      }
    }
  }

  const abilityWeaponLoadouts = getAbilityWeaponLoadouts(abilities, ebpsData, weaponData);

  return {
    resolvedSquad,
    totalCost,
    totalUpkeepCost,
    squadWeapons,
    upgradeWeaponLoadouts,
    abilityWeaponLoadouts,
    resolvedEntities,
    upgrades,
    upgradesData,
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
