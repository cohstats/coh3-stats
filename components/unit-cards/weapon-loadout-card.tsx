import { Divider, Flex, Grid, Image, Stack, Text, Title } from "@mantine/core";
import { getScatterArea, getWeaponRpm, WeaponStatsType } from "../../src/unitStats";
import { getDefaultWeaponIcon } from "../../src/unitStats/dpsCommon";
import ImageWithFallback, { symbolPlaceholder } from "../placeholders";
import { useTranslation } from "next-i18next";
import HelperIcon from "../icon/helper";

type WeaponCardInput = {
  id: string;
  icon_name: string; // icon path in game
  // faction: string;
  weapon_bag: WeaponStatsType;
  weapon_class: string;
  weapon_cat: string;
  parent: string; // parent file (essence parent folder, eg. rifle, light_machine_gun....)
};

type TargetType = WeaponStatsType["target_type_table"][number];

const WeaponCardIcons = {
  damage: "/icons/unit_status/bw2/8_damagebonus.png",
  deflection_damage: "/icons/unit_status/bw2/anti_tank.png",
  range: "/icons/unit_status/bw2/range_boost.png",
  aoe_size: "/icons/unit_status/bw2/flame.png",
  traverse_speed: "/icons/unit_status/bw2/skorpion.png",
  firing_arc: "/icons/unit_status/bw2/artillery_radio_beacon.png",
  setup_time: "/icons/unit_status/bw2/lockdown.png",
  teardown_time: "/icons/unit_status/bw2/retreat.png",
  suppression_radius: "/icons/unit_status/bw2/suppressive_fire.png",
  incremental_accuracy: "/icons/unit_status/bw2/accuracy_buff.png",
} as const;

const getAoeDamageAtDistance = (weapon_bag: WeaponStatsType, distance: number): number => {
  const nearDistance = weapon_bag.aoe_distance_near;
  const midDistance = weapon_bag.aoe_distance_mid;
  const farDistance = weapon_bag.aoe_distance_far;

  const nearDamage = weapon_bag.aoe_damage_near;
  const midDamage = weapon_bag.aoe_damage_mid;
  const farDamage = weapon_bag.aoe_damage_far;

  const interpolate = (x: number, x1: number, x2: number, y1: number, y2: number): number => {
    if (x1 === x2) return y2;

    const t = (x - x1) / (x2 - x1);
    return y1 + (y2 - y1) * t;
  };

  if (distance <= nearDistance) {
    return nearDamage;
  }

  if (distance <= midDistance) {
    return interpolate(distance, nearDistance, midDistance, nearDamage, midDamage);
  }

  if (distance <= farDistance) {
    return interpolate(distance, midDistance, farDistance, midDamage, farDamage);
  }

  return farDamage;
};

const WeaponIconWithCount = ({
  count,
  children,
}: {
  count: number;
  children: React.ReactNode;
}) => (
  <div
    style={{
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 60,
      minHeight: 36,
      flexShrink: 0,
      overflow: "visible",
    }}
  >
    {children}

    <span
      style={{
        position: "absolute",
        top: -7,
        left: -7,
        minWidth: 17,
        height: 17,
        padding: "0 5px",
        borderRadius: 999,
        background: "var(--mantine-color-blue-6)",
        border: "1px solid rgba(255, 255, 255, 0.35)",
        color: "white",
        fontSize: 11,
        fontWeight: 700,
        lineHeight: "17px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 1,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.45)",
      }}
    >
      {count}
    </span>
  </div>
);

export const WeaponLoadoutCard = (
  { id, parent, icon_name, weapon_class, weapon_cat, weapon_bag }: WeaponCardInput,
  count = 1,
) => {
  const { t } = useTranslation(["explorer"]);

  const formatUnitType = (unitType: string): string =>
    unitType
      .replace(/^tp_/, "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const formatBaseDamageModifier = (value: number): React.ReactNode => {
    if (value === 0) return "—";

    return value > 0 ? `+${value}` : value;
  };

  const formatMultiplier = (value: number): React.ReactNode => {
    if (value === 1) return "—";

    return `×${value}`;
  };

  const hasTargetModifier = (entry: TargetType): boolean =>
    entry.dmg_modifier !== 0 ||
    entry.accuracy_multiplier !== 1 ||
    entry.penetration_multiplier !== 1 ||
    entry.damage_multiplier !== 1;

  const targetModifierRows = weapon_bag.target_type_table.filter(
    (entry) => entry.unit_type && hasTargetModifier(entry),
  );

  const roundValue = (value: number, decimals = 2): number => {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  };

  const CenterText = ({ value, color }: { value: React.ReactNode; color?: string }) => (
    <Text style={{ textAlign: "center" }} c={color}>
      {value}
    </Text>
  );
  const OnMoveHeader = ({ show = true }: { show?: boolean }) => {
    if (!show) return null;

    return (
      <Grid gutter="xs">
        <Grid.Col span={{ base: 4, md: 4 }} />
        <Grid.Col span={{ base: 3, md: 3 }}>
          <CenterText color="orange.6" value={t("weaponCard.accuracy")} />
        </Grid.Col>
        <Grid.Col span={{ base: 3, md: 3 }}>
          <CenterText color="orange.6" value={t("weaponCard.burstDuration")} />
        </Grid.Col>
        <Grid.Col span={{ base: 2, md: 2 }}>
          <CenterText color="orange.6" value={t("weaponCard.cooldown")} />
        </Grid.Col>
      </Grid>
    );
  };

  const OnMoveRow = ({ show = true }: { show?: boolean }) => {
    if (!show) return null;

    return (
      <Grid gutter="xs">
        <Grid.Col span={{ base: 4, md: 4 }}>
          <Text>{t("weaponCard.onTheMove")}</Text>
        </Grid.Col>
        <Grid.Col span={{ base: 3, md: 3 }}>
          <CenterText color="orange.6" value={weapon_bag.moving_accuracy_multiplier} />
        </Grid.Col>
        <Grid.Col span={{ base: 3, md: 3 }}>
          <CenterText color="orange.6" value={weapon_bag.moving_burst_multiplier} />
        </Grid.Col>
        <Grid.Col span={{ base: 2, md: 2 }}>
          <CenterText color="orange.6" value={weapon_bag.moving_cooldown_multiplier} />
        </Grid.Col>
      </Grid>
    );
  };
  const RangeHeader = () => (
    <Grid gutter="xs">
      <Grid.Col span={{ base: 4, md: 4 }} />
      <Grid.Col span={{ base: 3, md: 3 }}>
        <CenterText color="green.6" value={t("common.near")} />
      </Grid.Col>
      <Grid.Col span={{ base: 3, md: 3 }}>
        <CenterText color="yellow.6" value={t("common.medium")} />
      </Grid.Col>
      <Grid.Col span={{ base: 2, md: 2 }}>
        <CenterText color="red.6" value={t("common.far")} />
      </Grid.Col>
    </Grid>
  );

  const RangeStatRow = ({
    label,
    near,
    mid,
    far,
    show = true,
  }: {
    label: string;
    near: React.ReactNode;
    mid: React.ReactNode;
    far: React.ReactNode;
    show?: boolean;
  }) => {
    if (!show) return null;

    return (
      <Grid gutter="xs">
        <Grid.Col span={{ base: 4, md: 4 }}>
          <Text>{label}</Text>
        </Grid.Col>
        <Grid.Col span={{ base: 3, md: 3 }}>
          <CenterText color="green.6" value={near} />
        </Grid.Col>
        <Grid.Col span={{ base: 3, md: 3 }}>
          <CenterText color="yellow.6" value={mid} />
        </Grid.Col>
        <Grid.Col span={{ base: 2, md: 2 }}>
          <CenterText color="red.6" value={far} />
        </Grid.Col>
      </Grid>
    );
  };

  const CompactStatGrid = ({
    items,
  }: {
    items: {
      label: string;
      value: React.ReactNode;
      icon?: string;
      alt?: string;
      show?: boolean;
    }[];
  }) => {
    const visibleItems = items.filter((item) => item.show ?? true);

    if (visibleItems.length === 0) return null;

    return (
      <Flex align="center" justify={"center"} columnGap="xl" wrap="wrap">
        {visibleItems.map((item) => (
          <Flex key={item.label} justify="flex-start" align="center" gap={6} wrap="nowrap">
            {item.icon && (
              <ImageWithFallback
                width={16}
                height={16}
                src={item.icon}
                alt={item.alt ?? item.label}
                fallbackSrc={symbolPlaceholder}
                style={{ opacity: 0.75 }}
              />
            )}

            <Text>{item.label}</Text>
            <Text c="orange.6">{item.value}</Text>
          </Flex>
        ))}
      </Flex>
    );
  };

  const AoeHeader = ({ show = true }: { show?: boolean }) => {
    if (!show) return null;

    return (
      <Grid gutter="xs">
        <Grid.Col span={{ base: 4, md: 4 }}>
          <Text fw={600}>{t("weaponCard.aoeFalloff")}</Text>
        </Grid.Col>

        <Grid.Col span={{ base: 2, md: 2 }}>
          <CenterText color="green.6" value={t("common.near")} />
        </Grid.Col>

        <Grid.Col span={{ base: 2, md: 2 }}>
          <CenterText color="yellow.6" value={t("common.medium")} />
        </Grid.Col>

        <Grid.Col span={{ base: 2, md: 2 }}>
          <CenterText color="red.6" value={t("common.far")} />
        </Grid.Col>

        <Grid.Col span={{ base: 2, md: 2 }}>
          <CenterText color="orange.6" value={t("weaponCard.limit")} />
        </Grid.Col>
      </Grid>
    );
  };

  const AoeStatRow = ({
    label,
    near,
    mid,
    far,
    outer,
    show = true,
  }: {
    label: string;
    near: React.ReactNode;
    mid: React.ReactNode;
    far: React.ReactNode;
    outer: React.ReactNode;
    show?: boolean;
  }) => {
    if (!show) return null;

    return (
      <Grid gutter="xs">
        <Grid.Col span={{ base: 4, md: 4 }}>
          <Text>{label}</Text>
        </Grid.Col>

        <Grid.Col span={{ base: 2, md: 2 }}>
          <CenterText color="green.6" value={near} />
        </Grid.Col>

        <Grid.Col span={{ base: 2, md: 2 }}>
          <CenterText color="yellow.6" value={mid} />
        </Grid.Col>

        <Grid.Col span={{ base: 2, md: 2 }}>
          <CenterText color="red.6" value={far} />
        </Grid.Col>

        <Grid.Col span={{ base: 2, md: 2 }}>
          <CenterText color="orange.6" value={outer} />
        </Grid.Col>
      </Grid>
    );
  };

  const TargetModifierSection = ({ rows }: { rows: TargetType[] }) => {
    if (rows.length === 0) return null;

    return (
      <>
        <Divider my={4} />

        <Grid gutter="xs">
          <Grid.Col span={{ base: 4, md: 4 }}>
            <Text fw={600}>{t("weaponCard.targetModifiers")}</Text>
          </Grid.Col>

          <Grid.Col span={{ base: 2, md: 2 }}>
            <CenterText color="orange.6" value={t("weaponCard.baseDamage")} />
          </Grid.Col>

          <Grid.Col span={{ base: 2, md: 2 }}>
            <CenterText color="orange.6" value={t("weaponCard.accuracy")} />
          </Grid.Col>

          <Grid.Col span={{ base: 2, md: 2 }}>
            <CenterText color="orange.6" value={t("weaponCard.penetration")} />
          </Grid.Col>

          <Grid.Col span={{ base: 2, md: 2 }}>
            <CenterText color="orange.6" value={t("weaponCard.damage")} />
          </Grid.Col>
        </Grid>

        {rows.map((entry) => (
          <Grid key={entry.unit_type} gutter="xs">
            <Grid.Col span={{ base: 4, md: 4 }}>
              <Text>{formatUnitType(entry.unit_type)}</Text>
            </Grid.Col>

            <Grid.Col span={{ base: 2, md: 2 }}>
              <CenterText color="orange.6" value={formatBaseDamageModifier(entry.dmg_modifier)} />
            </Grid.Col>

            <Grid.Col span={{ base: 2, md: 2 }}>
              <CenterText color="orange.6" value={formatMultiplier(entry.accuracy_multiplier)} />
            </Grid.Col>

            <Grid.Col span={{ base: 2, md: 2 }}>
              <CenterText
                color="orange.6"
                value={formatMultiplier(entry.penetration_multiplier)}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 2, md: 2 }}>
              <CenterText color="orange.6" value={formatMultiplier(entry.damage_multiplier)} />
            </Grid.Col>
          </Grid>
        ))}
      </>
    );
  };

  type CoverModifierRow = {
    label: string;
    accuracy: number;
    damage: number;
  };

  const CoverModifierSection = ({ rows }: { rows: CoverModifierRow[] }) => {
    if (rows.length === 0) return null;

    return (
      <>
        <Divider my={4} />

        <Grid gutter="xs">
          <Grid.Col span={{ base: 4, md: 4 }}>
            <Flex align="center" gap={4}>
              <Text fw={600}>{t("weaponCard.coverModifiers")}</Text>
              <HelperIcon
                text={t("weaponCard.coverModifiersTooltip")}
                width={300}
                iconSize={16}
              />
            </Flex>
          </Grid.Col>

          <Grid.Col span={{ base: 2.6, md: 2.6 }}>
            <Flex align="center" justify="center" gap={4}>
              <Image src="/icons/common/cover/light.png" alt="Light Cover" h={32} w={32} />
              <Text visibleFrom="md">{t("common.light")}</Text>
            </Flex>
          </Grid.Col>

          <Grid.Col span={{ base: 2.6, md: 2.6 }}>
            <Flex align="center" justify="center" gap={4}>
              <Image src="/icons/common/cover/heavy.png" alt="Heavy Cover" h={32} w={32} />
              <Text visibleFrom="md">{t("common.heavy")}</Text>
            </Flex>
          </Grid.Col>

          <Grid.Col span={{ base: 2.6, md: 2.6 }}>
            <Flex align="center" justify="center" gap={4}>
              <Image src="/icons/common/units/garrisoned.png" alt="Garrison" h={31} w={27} />
              <Text visibleFrom="md">{t("common.garrison")}</Text>
            </Flex>
          </Grid.Col>
        </Grid>

        <Grid gutter="xs">
          <Grid.Col span={{ base: 4, md: 4 }}>
            <Text>{t("weaponCard.accuracy")}</Text>
          </Grid.Col>

          <Grid.Col span={{ base: 2.6, md: 2.6 }}>
            <CenterText color="orange.6" value={rows[0]?.accuracy} />
          </Grid.Col>

          <Grid.Col span={{ base: 2.6, md: 2.6 }}>
            <CenterText color="orange.6" value={rows[1]?.accuracy} />
          </Grid.Col>

          <Grid.Col span={{ base: 2.6, md: 2.6 }}>
            <CenterText color="orange.6" value={rows[2]?.accuracy} />
          </Grid.Col>
        </Grid>

        <Grid gutter="xs">
          <Grid.Col span={{ base: 4, md: 4 }}>
            <Text>{t("weaponCard.damage")}</Text>
          </Grid.Col>

          <Grid.Col span={{ base: 2.6, md: 2.6 }}>
            <CenterText color="orange.6" value={rows[0]?.damage} />
          </Grid.Col>

          <Grid.Col span={{ base: 2.6, md: 2.6 }}>
            <CenterText color="orange.6" value={rows[1]?.damage} />
          </Grid.Col>

          <Grid.Col span={{ base: 2.6, md: 2.6 }}>
            <CenterText color="orange.6" value={rows[2]?.damage} />
          </Grid.Col>
        </Grid>
      </>
    );
  };

  const getWeaponIconSrc = (iconName: string) => {
    const normalizedIconName = iconName.trim();

    if (!normalizedIconName) return "";

    if (normalizedIconName.startsWith("/")) return normalizedIconName;

    return normalizedIconName.endsWith(".png")
      ? `/icons/${normalizedIconName}`
      : `/icons/${normalizedIconName}.png`;
  };

  const weaponIcon = getWeaponIconSrc(icon_name);
  const parentFallbackIcon = getDefaultWeaponIcon(parent);
  /** Only take into account those weapons categories to display further info.
   * The "special", "flame_throwers", "campaign" are ignored. */
  const isValidWeapon =
    weapon_cat == "ballistic_weapon" ||
    weapon_cat == "explosive_weapon" ||
    weapon_cat == "flame_throwers" ||
    weapon_cat == "small_arms";
  const rpmNear = roundValue(getWeaponRpm(weapon_bag, weapon_bag.range_distance_near));
  const rpmMid = roundValue(getWeaponRpm(weapon_bag, weapon_bag.range_distance_mid));
  const rpmFar = roundValue(getWeaponRpm(weapon_bag, weapon_bag.range_distance_far));

  const suppressionNear = roundValue(
    ((getWeaponRpm(weapon_bag, weapon_bag.range_distance_near) *
      weapon_bag.suppression_amount *
      weapon_bag.suppression_nearby_suppression_multiplier) /
      60) *
      100,
  );
  const suppressionMid = roundValue(
    ((getWeaponRpm(weapon_bag, weapon_bag.range_distance_mid) *
      weapon_bag.suppression_amount *
      weapon_bag.suppression_nearby_suppression_multiplier) /
      60) *
      100,
  );
  const suppressionFar = roundValue(
    ((getWeaponRpm(weapon_bag, weapon_bag.range_distance_far) *
      weapon_bag.suppression_amount *
      weapon_bag.suppression_nearby_suppression_multiplier) /
      60) *
      100,
  );

  const showMovingStats = isValidWeapon && weapon_bag.moving_can_fire_while_moving;

  const damageDisplay =
    weapon_bag.damage_min === weapon_bag.damage_max
      ? weapon_bag.damage_max
      : `${weapon_bag.damage_min} - ${weapon_bag.damage_max}`;

  const aoeDisplayValue =
    weapon_bag.aoe_shape === "rectangle" && weapon_bag.aoe_width > 0
      ? `${weapon_bag.aoe_width}×${weapon_bag.aoe_outer_length}`
      : 0;

  const showAoeFalloff = weapon_bag.aoe_shape === "circle" && weapon_bag.aoe_outer_radius > 0;

  const aoeOuterDamageMultiplier = getAoeDamageAtDistance(
    weapon_bag,
    weapon_bag.aoe_outer_radius,
  );

  const showAoeSize = weapon_bag.aoe_shape === "rectangle" && weapon_bag.aoe_width > 0;

  const rangeDisplay =
    weapon_bag.range.min > 0
      ? `${weapon_bag.range.min} - ${weapon_bag.range.max}`
      : weapon_bag.range.max;

  const getDamageDisplay = (damageMultiplier: number): string | number => {
    if (weapon_bag.damage_min === weapon_bag.damage_max) {
      return roundValue(weapon_bag.damage_max * damageMultiplier);
    }

    return `${roundValue(weapon_bag.damage_min * damageMultiplier)} - ${roundValue(
      weapon_bag.damage_max * damageMultiplier,
    )}`;
  };

  const weaponArc = Math.abs(
    weapon_bag.tracking_normal_max_right - weapon_bag.tracking_normal_max_left,
  );

  const showArc = weaponArc > 0 && weaponArc < 360;

  const arcDisplay = `${roundValue(weaponArc, 0)}°`;

  const coverModifierRows: CoverModifierRow[] = [
    {
      label: t("weaponCard.lightCover"),
      accuracy: weapon_bag.cover_table_tp_light_cover_accuracy_multiplier,
      damage: weapon_bag.cover_table_tp_light_cover_damage_multiplier,
    },
    {
      label: t("weaponCard.heavyCover"),
      accuracy: weapon_bag.cover_table_tp_heavy_cover_accuracy_multiplier,
      damage: weapon_bag.cover_table_tp_heavy_cover_damage_multiplier,
    },
    {
      label: t("weaponCard.garrisonCover"),
      accuracy: weapon_bag.cover_table_tp_garrison_cover_accuracy_multiplier,
      damage: weapon_bag.cover_table_tp_garrison_cover_damage_multiplier,
    },
  ];

  return (
    <Stack gap={8}>
      {/* Heading */}
      <Flex align="center" gap={16}>
        <WeaponIconWithCount count={count}>
          {weaponIcon ? (
            <ImageWithFallback
              width={48}
              height={16}
              src={weaponIcon}
              alt={id}
              fallbackSrc={symbolPlaceholder}
            />
          ) : (
            <img
              src={parentFallbackIcon}
              alt={id}
              onError={(event) => {
                event.currentTarget.src =
                  typeof symbolPlaceholder === "string"
                    ? symbolPlaceholder
                    : (symbolPlaceholder as { src: string }).src;
              }}
              style={{
                maxWidth: 56,
                maxHeight: 36,
                width: "auto",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          )}
        </WeaponIconWithCount>
        <Flex direction="column">
          <Title order={6} fw="bold" tt="uppercase">
            {id.split("_").join(" ")}
          </Title>
          <Text fz="xs" fw="bold" tt="uppercase" c="orange.5">
            {weapon_class.split("_").join(" ")} - {weapon_cat.split("_").join(" ")}
          </Text>
        </Flex>
      </Flex>

      <Divider />

      <Stack gap={2} fz="sm">
        <OnMoveHeader show={showMovingStats} />
        <OnMoveRow show={showMovingStats} />

        {showMovingStats && <Divider my={4} />}

        <RangeHeader />

        <RangeStatRow
          label={t("weaponCard.distance")}
          near={weapon_bag.range.near}
          mid={weapon_bag.range.mid}
          far={weapon_bag.range.max}
        />

        <RangeStatRow
          label={t("weaponCard.accuracy")}
          near={weapon_bag.accuracy_near}
          mid={weapon_bag.accuracy_mid}
          far={weapon_bag.accuracy_far}
        />

        <RangeStatRow label={t("weaponCard.rpm")} near={rpmNear} mid={rpmMid} far={rpmFar} />

        <RangeStatRow
          show={isValidWeapon}
          label={t("weaponCard.penetration")}
          near={weapon_bag.penetration_near}
          mid={weapon_bag.penetration_mid}
          far={weapon_bag.penetration_far}
        />

        <RangeStatRow
          show={isValidWeapon}
          label={t("weaponCard.scatter")}
          near={roundValue(getScatterArea(weapon_bag.range.near, weapon_bag), 1)}
          mid={roundValue(getScatterArea(weapon_bag.range.mid, weapon_bag), 1)}
          far={roundValue(getScatterArea(weapon_bag.range.max, weapon_bag), 1)}
        />

        <RangeStatRow
          show={weapon_bag.suppression_amount > 0}
          label={t("weaponCard.suppressionPerSecond")}
          near={suppressionNear}
          mid={suppressionMid}
          far={suppressionFar}
        />

        <RangeStatRow
          show={
            weapon_bag.burst_incremental_target_table_accuracy_multiplier > 1 &&
            weapon_bag.burst_can_burst
          }
          label={t("weaponCard.incrementalTargetRadius")}
          near={weapon_bag.burst_incremental_target_table_search_radius_near}
          mid={weapon_bag.burst_incremental_target_table_search_radius_mid}
          far={weapon_bag.burst_incremental_target_table_search_radius_far}
        />

        <Divider my={4} />

        <CompactStatGrid
          items={[
            {
              icon: WeaponCardIcons["damage"],
              alt: "weapon damage",
              label: t("weaponCard.damage"),
              value: damageDisplay,
            },
            {
              icon: WeaponCardIcons["deflection_damage"],
              alt: "weapon deflection damage",
              label: t("weaponCard.deflectionDamage"),
              value:
                (weapon_bag.deflection_damage_multiplier *
                  (weapon_bag.damage_max + weapon_bag.damage_min)) /
                2,
              show: weapon_bag.deflection_has_deflection_damage,
            },
            {
              icon: WeaponCardIcons["range"],
              alt: "weapon range",
              label: t("weaponCard.range"),
              value: rangeDisplay,
            },
            {
              icon: WeaponCardIcons["aoe_size"],
              alt: "weapon aoe size",
              label: t("weaponCard.aoeSize"),
              value: aoeDisplayValue,
              show: showAoeSize,
            },
            {
              icon: WeaponCardIcons["traverse_speed"],
              alt: "weapon traverse speed",
              label: t("weaponCard.traverseSpeed"),
              value: weapon_bag.tracking_normal_speed_horizontal,
              show: weapon_bag.tracking_normal_speed_horizontal < 360,
            },
            {
              icon: WeaponCardIcons["firing_arc"],
              alt: "weapon firing arc",
              label: t("weaponCard.arc"),
              value: arcDisplay,
              show: showArc,
            },
            {
              icon: WeaponCardIcons["setup_time"],
              alt: "weapon setup time",
              label: t("weaponCard.setup"),
              value: `${weapon_bag.setup_time}s`,
              show: weapon_bag.setup_time > 0,
            },
            {
              icon: WeaponCardIcons["teardown_time"],
              alt: "weapon teardown time",
              label: t("weaponCard.teardown"),
              value: `${weapon_bag.teardown_time}s`,
              show: weapon_bag.teardown_time > 0,
            },
            {
              icon: WeaponCardIcons["suppression_radius"],
              alt: "weapon suppression radius",
              label: t("weaponCard.suppressionRadius"),
              value: weapon_bag.suppression_nearby_suppression_radius,
              show: weapon_bag.suppression_amount > 0,
            },
            {
              icon: WeaponCardIcons["incremental_accuracy"],
              alt: "weapon incremental target accuracy",
              label: t("weaponCard.incrementalTargetAccuracy"),
              value: `x${weapon_bag.burst_incremental_target_table_accuracy_multiplier}`,
              show:
                weapon_bag.burst_incremental_target_table_accuracy_multiplier > 1 &&
                weapon_bag.burst_can_burst,
            },
          ]}
        />

        {showAoeFalloff && <Divider my={4} />}

        <AoeHeader show={showAoeFalloff} />

        <AoeStatRow
          show={showAoeFalloff}
          label={t("weaponCard.aoeRadius")}
          near={weapon_bag.aoe_distance_near}
          mid={weapon_bag.aoe_distance_mid}
          far={weapon_bag.aoe_distance_far}
          outer={weapon_bag.aoe_outer_radius}
        />

        <AoeStatRow
          show={showAoeFalloff}
          label={t("weaponCard.damage")}
          near={getDamageDisplay(weapon_bag.aoe_damage_near)}
          mid={getDamageDisplay(weapon_bag.aoe_damage_mid)}
          far={getDamageDisplay(weapon_bag.aoe_damage_far)}
          outer={getDamageDisplay(aoeOuterDamageMultiplier)}
        />
        <CoverModifierSection rows={coverModifierRows} />
        <TargetModifierSection rows={targetModifierRows} />
      </Stack>
    </Stack>
  );
};
