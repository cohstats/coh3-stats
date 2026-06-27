import { Box, Divider, Flex, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { getWeaponRpm } from "../../src/unitStats";
import { getDefaultWeaponIcon } from "../../src/unitStats/dpsCommon";
import { getWeaponTiming, TICK_DURATION } from "../../src/unitStats/weaponLib";
import ImageWithFallback, { symbolPlaceholder } from "../placeholders";
import { useTranslation } from "next-i18next/pages";
import HelperIcon from "../icon/helper";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as CTitle,
  Tooltip as CTooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  WeaponCardInput,
  WeaponCardContext,
  TargetType,
  OwnUnitAoeDamageSource,
  CoverModifierRow,
  WeaponCardIcons,
} from "./weapon-loadout/types-and-constants";
import {
  formatPercent,
  formatSeconds,
  formatMinMaxSeconds,
  formatMultiplier,
  formatScatterOffset,
  roundValue,
  isChangedMultiplier,
  getAoeValueAtDistance,
  formatScatterDimensions,
  getScatterOffset,
  areAoeFalloffValuesEqual,
  normalizeOwnUnitAoeDamageValue,
  getWeaponIconSrc,
  buildAoeGraphPoints,
  createAoeDataset,
  createAoeChartOptions,
} from "./weapon-loadout/helpers";
import { getProjectileTravelTime } from "./weapon-loadout/projectile-calculations";
import {
  StatLabel,
  WeaponIconWithCount,
  CenterText,
  PrimaryWeaponStat,
  CompactStatGrid,
  RangeStatSection,
  RangeHeader,
} from "./weapon-loadout/stat-components";
import {
  TargetModifierSection,
  CoverModifierSection,
} from "./weapon-loadout/modifier-components";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  CTitle,
  CTooltip,
  Legend,
  Filler,
);

export const WeaponLoadoutCard = (
  { id, parent, icon_name, weapon_class, weapon_cat, weapon_bag }: WeaponCardInput,
  count = 1,
  context: WeaponCardContext = {},
) => {
  const { t } = useTranslation(["explorer"]);
  const theme = useMantineTheme();

  const formatReloadFrequency = () => {
    const min = weapon_bag.reload_frequency_min + 1;
    const max = weapon_bag.reload_frequency_max + 1;

    const value = min === max ? `${min}` : `${min} - ${max}`;
    const unit = weapon_bag.burst_can_burst ? t("weaponCard.bursts") : t("weaponCard.shots");

    return `${value} ${unit}`;
  };

  const hasTargetModifier = (entry: TargetType): boolean =>
    entry.dmg_modifier !== 0 ||
    entry.accuracy_multiplier !== 1 ||
    entry.penetration_multiplier !== 1 ||
    entry.damage_multiplier !== 1;

  const targetModifierRows = weapon_bag.target_type_table.filter(
    (entry) => entry.unit_type && hasTargetModifier(entry),
  );

  const isSingleShotAbilityWeapon = context.source === "ability" && context.abilityNumShots === 1;

  const showSustainedStats = !isSingleShotAbilityWeapon;

  const allMovingModifierColumns = [
    {
      key: "accuracy",
      label: t("weaponCard.accuracy"),
      tooltip: t("weaponCard.onTheMoveAccuracyTooltip"),
      value: weapon_bag.moving_accuracy_multiplier,
    },
    {
      key: "burstDuration",
      label: t("weaponCard.burstDuration"),
      tooltip: t("weaponCard.onTheMoveBurstTooltip"),
      value: weapon_bag.moving_burst_multiplier,
    },
    {
      key: "cooldown",
      label: t("weaponCard.cooldown"),
      tooltip: t("weaponCard.onTheMoveCooldownTooltip"),
      value: weapon_bag.moving_cooldown_multiplier,
    },
    {
      key: "scatterAngle",
      label: t("weaponCard.scatterAngle"),
      tooltip: t("weaponCard.scatterAngleTooltip"),
      value: weapon_bag.scatter_moving_scatter_angle_multiplier,
    },
    {
      key: "scatterDistance",
      label: t("weaponCard.scatterDistance"),
      tooltip: t("weaponCard.scatterDistanceTooltip", {
        scatterDistanceMax: roundValue(weapon_bag.scatter_distance_scatter_max * 2, 1),
        scatterOffsetMax: roundValue(
          weapon_bag.scatter_distance_scatter_offset * weapon_bag.scatter_distance_scatter_max,
          1,
        ),
      }),
      value: weapon_bag.scatter_moving_scatter_distance_multiplier,
    },
  ];

  const changedMovingModifierColumns = allMovingModifierColumns.filter((column) =>
    isChangedMultiplier(column.value),
  );

  const movingModifierColumns =
    changedMovingModifierColumns.length > 0
      ? changedMovingModifierColumns
      : [allMovingModifierColumns[0]];

  const hasSingleMovingModifier = movingModifierColumns.length === 1;

  const OnMoveHeader = ({ show = true }: { show?: boolean }) => {
    const movingLabelColumnSpan = 2;
    const movingStatColumnSpan = 10 / Math.max(movingModifierColumns.length, 1);

    if (!show || hasSingleMovingModifier) return null;

    return (
      <Flex direction="column" gap="xs">
        <Flex gap="xs">
          <Box style={{ width: `${(movingLabelColumnSpan / 12) * 100}%` }} />

          {movingModifierColumns.map((column) => (
            <Box
              key={column.key}
              style={{ width: `${(movingStatColumnSpan / 12) * 100}%`, textAlign: "center" }}
            >
              <StatLabel label={column.label} tooltip={column.tooltip} />
            </Box>
          ))}
        </Flex>
      </Flex>
    );
  };

  const OnMoveRow = ({ show = true }: { show?: boolean }) => {
    if (!show) return null;

    if (hasSingleMovingModifier) {
      const column = movingModifierColumns[0];

      return (
        <Flex align="center" justify="center" gap={6} wrap="nowrap">
          <StatLabel
            label={`${t("weaponCard.onTheMove")} ${column.label}`}
            tooltip={column.tooltip ?? t("weaponCard.onTheMoveTooltip")}
          />
          <Text c="orange.6">{formatMultiplier(column.value, "×1")}</Text>
        </Flex>
      );
    }

    const movingLabelColumnSpan = 2;
    const movingStatColumnSpan = 10 / Math.max(movingModifierColumns.length, 1);

    return (
      <Flex gap="xs" align="center">
        <Box style={{ width: `${(movingLabelColumnSpan / 12) * 100}%` }}>
          <StatLabel
            label={t("weaponCard.onTheMove")}
            tooltip={t("weaponCard.onTheMoveTooltip")}
          />
        </Box>

        {movingModifierColumns.map((column) => (
          <Box
            key={column.key}
            style={{ width: `${(movingStatColumnSpan / 12) * 100}%`, textAlign: "center" }}
          >
            <CenterText color="orange.6" value={formatMultiplier(column.value)} />
          </Box>
        ))}
      </Flex>
    );
  };

  const PrimaryWeaponStats = () => (
    <Stack gap={4}>
      <PrimaryWeaponStat
        icon={WeaponCardIcons.damage}
        alt="weapon damage"
        label={t("weaponCard.damage")}
        value={damageDisplay}
      />

      <PrimaryWeaponStat
        icon={WeaponCardIcons.range}
        alt="weapon range"
        label={t("weaponCard.range")}
        value={`${rangeDisplay}m`}
      />
    </Stack>
  );

  const weaponIcon = getWeaponIconSrc(icon_name);
  const parentFallbackIcon = getDefaultWeaponIcon(parent);
  /** Only take into account those weapons categories to display further info.
   * The "special" and "campaign" categories are ignored. */
  const isValidWeapon =
    weapon_cat == "ballistic_weapon" ||
    weapon_cat == "explosive_weapon" ||
    weapon_cat == "flame_throwers" ||
    weapon_cat == "small_arms";

  const timingNear = getWeaponTiming(weapon_bag, weapon_bag.range_distance_near);
  const timingMid = getWeaponTiming(weapon_bag, weapon_bag.range_distance_mid);
  const timingFar = getWeaponTiming(weapon_bag, weapon_bag.range_distance_far);

  const rpmNear = roundValue(timingNear.rpm);
  const rpmMid = roundValue(timingMid.rpm);
  const rpmFar = roundValue(timingFar.rpm);

  const readyAimMin =
    Math.round((weapon_bag.ready_aim_time_min ?? 0) / TICK_DURATION) * TICK_DURATION; //these are rounded to the nearest tick
  const readyAimMax =
    Math.round((weapon_bag.ready_aim_time_max ?? 0) / TICK_DURATION) * TICK_DURATION;
  const baseWindUp = weapon_bag.fire_wind_up ?? 0;
  const windUp =
    baseWindUp > 0 ? Math.round((baseWindUp + TICK_DURATION) / TICK_DURATION) * TICK_DURATION : 0;
  const hasAimTime = readyAimMin > 0 || readyAimMax > 0;
  const hasWindUp = windUp > 0;
  const aimAndWindUpLabel =
    hasAimTime && hasWindUp
      ? t("weaponCard.aimTimeWithWindUp")
      : hasWindUp
        ? t("weaponCard.windUp")
        : t("weaponCard.aimTime");

  const hasReloadFrequency =
    weapon_bag.reload_frequency_min !== 0 || weapon_bag.reload_frequency_max !== 0;

  const isBurstWeapon = weapon_bag.burst_can_burst;

  const showRefireTime = !isBurstWeapon && !hasReloadFrequency;
  const showShotDelay = !isBurstWeapon && hasReloadFrequency;
  const showTimeBetweenBursts = isBurstWeapon;
  const showReloadCycle = hasReloadFrequency;
  const usesAccuracy =
    !weapon_bag.projectile_is_artillery &&
    (weapon_bag.accuracy_near > 0 || weapon_bag.accuracy_mid > 0 || weapon_bag.accuracy_far > 0);

  const showDamageDistribution =
    weapon_bag.projectile_type === "none" &&
    !weapon_bag.burst_focus_fire &&
    weapon_bag.burst_can_burst;

  const showIncrementalTargetRadius =
    weapon_bag.burst_incremental_target_table_accuracy_multiplier > 1 &&
    weapon_bag.burst_can_burst;

  const getSuppressionMultiplier = (accuracy: number) => {
    //show aoe suppression if available, otherwise single target
    if (weapon_bag.projectile_type === "none") {
      return weapon_bag.suppression_nearby_suppression_multiplier > 0
        ? weapon_bag.suppression_nearby_suppression_multiplier
        : 1;
    }
    //projectile weapons only suppress on direct hits
    if (usesAccuracy) {
      return accuracy;
    }

    return null;
  };

  const getSuppressionPerMinute = (distance: number, accuracy: number) => {
    const suppressionMultiplier = getSuppressionMultiplier(accuracy);

    if (suppressionMultiplier === null) return null;

    return roundValue(
      ((getWeaponRpm(weapon_bag, distance) *
        weapon_bag.suppression_amount *
        suppressionMultiplier) /
        60) *
        100,
    );
  };

  const suppressionNear = getSuppressionPerMinute(
    weapon_bag.range_distance_near,
    weapon_bag.accuracy_near,
  );

  const suppressionMid = getSuppressionPerMinute(
    weapon_bag.range_distance_mid,
    weapon_bag.accuracy_mid,
  );

  const suppressionFar = getSuppressionPerMinute(
    weapon_bag.range_distance_far,
    weapon_bag.accuracy_far,
  );

  const showSuppression =
    showSustainedStats &&
    ((suppressionNear ?? 0) > 0 || (suppressionMid ?? 0) > 0 || (suppressionFar ?? 0) > 0);

  const scatterNear = formatScatterDimensions(weapon_bag.range.near, weapon_bag);
  const scatterMid = formatScatterDimensions(weapon_bag.range.mid, weapon_bag);
  const scatterFar = formatScatterDimensions(weapon_bag.range.far, weapon_bag);

  const scatterOffsetNear = getScatterOffset(weapon_bag.range.near, weapon_bag);
  const scatterOffsetMid = getScatterOffset(weapon_bag.range.mid, weapon_bag);
  const scatterOffsetFar = getScatterOffset(weapon_bag.range.far, weapon_bag);

  const showScatterOffset =
    scatterOffsetNear !== 0 || scatterOffsetMid !== 0 || scatterOffsetFar !== 0;

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

  const showAoeSize = weapon_bag.aoe_shape === "rectangle" && weapon_bag.aoe_width > 0;

  const rangeDisplay =
    weapon_bag.range.min > 0
      ? `${weapon_bag.range.min} - ${weapon_bag.range.max}`
      : weapon_bag.range.max;

  const projectileTravelTimeNear = getProjectileTravelTime(
    weapon_bag.range_distance_near,
    weapon_bag,
  );
  const projectileTravelTimeMid = getProjectileTravelTime(
    weapon_bag.range_distance_mid,
    weapon_bag,
  );
  const projectileTravelTimeFar = getProjectileTravelTime(
    weapon_bag.range_distance_far,
    weapon_bag,
  );

  const showProjectileTravelTime =
    projectileTravelTimeNear !== null ||
    projectileTravelTimeMid !== null ||
    projectileTravelTimeFar !== null;

  const getAverageDamageValue = (damageMultiplier: number) =>
    ((weapon_bag.damage_min + weapon_bag.damage_max) / 2) * damageMultiplier;

  const getAoeDamageMultiplier = (distance: number) =>
    getAoeValueAtDistance(weapon_bag, distance, {
      near: weapon_bag.aoe_damage_near,
      mid: weapon_bag.aoe_damage_mid,
      far: weapon_bag.aoe_damage_far,
    });

  const getAoeFriendlyDamageMultiplier = (distance: number) =>
    getAoeValueAtDistance(weapon_bag, distance, {
      near: weapon_bag.aoe_damage_friendly_near,
      mid: weapon_bag.aoe_damage_friendly_mid,
      far: weapon_bag.aoe_damage_friendly_far,
    });

  const getAoeOwnUnitDamageMultiplier = (distance: number) =>
    getAoeValueAtDistance(weapon_bag, distance, ownUnitAoeDamageValues);

  const getAoeSuppressionMultiplier = (distance: number) =>
    getAoeValueAtDistance(weapon_bag, distance, {
      near: weapon_bag.aoe_suppression_near,
      mid: weapon_bag.aoe_suppression_mid,
      far: weapon_bag.aoe_suppression_far,
    });
  const getAoeSuppressionDisplayValue = (distance: number) =>
    weapon_bag.suppression_amount * getAoeSuppressionMultiplier(distance) * 100;

  const hasFriendlyAoeDamage =
    weapon_bag.aoe_has_friendly_fire &&
    (weapon_bag.aoe_damage_friendly_near > 0 ||
      weapon_bag.aoe_damage_friendly_mid > 0 ||
      weapon_bag.aoe_damage_friendly_far > 0);

  const hasAoeSuppression =
    weapon_bag.suppression_amount > 0 &&
    (weapon_bag.aoe_suppression_near > 0 ||
      weapon_bag.aoe_suppression_mid > 0 ||
      weapon_bag.aoe_suppression_far > 0);

  const enemyAoeDamageValues = {
    near: weapon_bag.aoe_damage_near,
    mid: weapon_bag.aoe_damage_mid,
    far: weapon_bag.aoe_damage_far,
  };

  const friendlyAoeDamageValues = {
    near: weapon_bag.aoe_damage_friendly_near,
    mid: weapon_bag.aoe_damage_friendly_mid,
    far: weapon_bag.aoe_damage_friendly_far,
  };

  const ownUnitAoeDamageValues = {
    near: normalizeOwnUnitAoeDamageValue(
      weapon_bag.aoe_damage_own_units_near,
      weapon_bag.aoe_damage_friendly_near,
    ),
    mid: normalizeOwnUnitAoeDamageValue(
      weapon_bag.aoe_damage_own_units_mid,
      weapon_bag.aoe_damage_friendly_mid,
    ),
    far: normalizeOwnUnitAoeDamageValue(
      weapon_bag.aoe_damage_own_units_far,
      weapon_bag.aoe_damage_friendly_far,
    ),
  };

  const ownUnitAoeDamageSource: OwnUnitAoeDamageSource =
    ownUnitAoeDamageValues.near <= 0 &&
    ownUnitAoeDamageValues.mid <= 0 &&
    ownUnitAoeDamageValues.far <= 0
      ? "none"
      : areAoeFalloffValuesEqual(ownUnitAoeDamageValues, friendlyAoeDamageValues)
        ? "friendly"
        : areAoeFalloffValuesEqual(ownUnitAoeDamageValues, enemyAoeDamageValues)
          ? "enemy"
          : "custom";

  const hasOwnUnitAoeDamage = ownUnitAoeDamageSource === "custom";

  const damageDatasetLabel =
    ownUnitAoeDamageSource === "enemy"
      ? t("weaponCard.damageIncludesOwnUnits")
      : t("weaponCard.damage");

  const friendlyDamageDatasetLabel =
    ownUnitAoeDamageSource === "friendly"
      ? t("weaponCard.friendlyDamageIncludesOwnUnits")
      : t("weaponCard.friendlyDamage");

  const aoeChartDatasets = [
    createAoeDataset(
      damageDatasetLabel,
      buildAoeGraphPoints(
        (distance) => getAverageDamageValue(getAoeDamageMultiplier(distance)),
        weapon_bag,
      ),
      theme.colors.orange[5],
      {
        yAxisID: "yDamage",
        order: 0,
      },
    ),

    hasFriendlyAoeDamage
      ? createAoeDataset(
          friendlyDamageDatasetLabel,
          buildAoeGraphPoints(
            (distance) => getAverageDamageValue(getAoeFriendlyDamageMultiplier(distance)),
            weapon_bag,
          ),
          theme.colors.blue[5],
          {
            yAxisID: "yDamage",
            borderDash: [8, 5],
            order: 1,
          },
        )
      : null,

    hasOwnUnitAoeDamage
      ? createAoeDataset(
          t("weaponCard.ownUnitDamage"),
          buildAoeGraphPoints(
            (distance) => getAverageDamageValue(getAoeOwnUnitDamageMultiplier(distance)),
            weapon_bag,
          ),
          theme.colors.gray[5],
          {
            yAxisID: "yDamage",
            borderWidth: 2,
            borderDash: [2, 4],
            order: 2,
          },
        )
      : null,

    hasAoeSuppression
      ? createAoeDataset(
          t("weaponCard.suppression"),
          buildAoeGraphPoints((distance) => getAoeSuppressionDisplayValue(distance), weapon_bag),
          theme.colors.violet[5],
          {
            yAxisID: "ySuppression",
            order: 3,
          },
        )
      : null,
  ].filter((dataset): dataset is ReturnType<typeof createAoeDataset> => dataset !== null);

  const aoeChartData = {
    datasets: aoeChartDatasets,
  };

  const maxAoeDamageGraphValue = Math.max(
    1,
    ...aoeChartDatasets
      .filter((dataset) => dataset.yAxisID === "yDamage")
      .flatMap((dataset) => dataset.data.map((point) => point.y)),
  );

  const maxAoeSuppressionGraphValue = Math.max(
    1,
    ...aoeChartDatasets
      .filter((dataset) => dataset.yAxisID === "ySuppression")
      .flatMap((dataset) => dataset.data.map((point) => point.y)),
  );

  const aoeChartOptions = createAoeChartOptions(
    weapon_bag,
    maxAoeDamageGraphValue,
    maxAoeSuppressionGraphValue,
    hasAoeSuppression,
    t,
  );

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
      aimTime: weapon_bag.cover_table_tp_light_cover_aim_time_multiplier,
    },
    {
      label: t("weaponCard.heavyCover"),
      accuracy: weapon_bag.cover_table_tp_heavy_cover_accuracy_multiplier,
      damage: weapon_bag.cover_table_tp_heavy_cover_damage_multiplier,
      aimTime: weapon_bag.cover_table_tp_heavy_cover_aim_time_multiplier,
    },
    {
      label: t("weaponCard.garrisonCover"),
      accuracy: weapon_bag.cover_table_tp_garrison_cover_accuracy_multiplier,
      damage: weapon_bag.cover_table_tp_garrison_cover_damage_multiplier,
      aimTime: weapon_bag.cover_table_tp_garrison_cover_aim_time_multiplier,
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
        <RangeHeader
          left={<PrimaryWeaponStats />}
          nearDistance={weapon_bag.range.near}
          midDistance={weapon_bag.range.mid}
          farDistance={weapon_bag.range.far}
          t={t}
        />

        <RangeStatSection
          title={t("weaponCard.coreStats")}
          rows={[
            {
              show: usesAccuracy,
              label: t("weaponCard.accuracy"),
              tooltip: t("weaponCard.accuracyTooltip"),
              near: formatPercent(weapon_bag.accuracy_near),
              mid: formatPercent(weapon_bag.accuracy_mid),
              far: formatPercent(weapon_bag.accuracy_far),
            },
            {
              show: !usesAccuracy && weapon_bag.projectile_type !== "none",
              label: t("weaponCard.scatter"),
              tooltip: t("weaponCard.scatterTooltip"),
              near: scatterNear,
              mid: scatterMid,
              far: scatterFar,
            },
            {
              show: !usesAccuracy && weapon_bag.projectile_type !== "none" && showScatterOffset,
              label: t("weaponCard.scatterOffset"),
              tooltip: t("weaponCard.scatterOffsetTooltip"),
              near: formatScatterOffset(scatterOffsetNear),
              mid: formatScatterOffset(scatterOffsetMid),
              far: formatScatterOffset(scatterOffsetFar),
            },
            {
              show: showSustainedStats,
              label: t("weaponCard.rpm"),
              tooltip: t("weaponCard.rpmTooltip"),
              near: rpmNear,
              mid: rpmMid,
              far: rpmFar,
            },
            {
              label: t("weaponCard.penetration"),
              tooltip: t("weaponCard.penetrationTooltip"),
              near: weapon_bag.penetration_near,
              mid: weapon_bag.penetration_mid,
              far: weapon_bag.penetration_far,
            },
          ]}
        />

        <RangeStatSection
          title={t("weaponCard.specialMechanics")}
          rows={[
            {
              show: usesAccuracy && weapon_bag.projectile_type !== "none",
              label: t("weaponCard.scatter"),
              tooltip: t("weaponCard.scatterTooltip"),
              near: scatterNear,
              mid: scatterMid,
              far: scatterFar,
            },
            {
              show: usesAccuracy && weapon_bag.projectile_type !== "none" && showScatterOffset,
              label: t("weaponCard.scatterOffset"),
              tooltip: t("weaponCard.scatterOffsetTooltip"),
              near: formatScatterOffset(scatterOffsetNear),
              mid: formatScatterOffset(scatterOffsetMid),
              far: formatScatterOffset(scatterOffsetFar),
            },
            {
              show: showSuppression,
              label: t("weaponCard.suppressionPerSecond"),
              tooltip: t("weaponCard.suppressionPerSecondTooltip"),
              near: suppressionNear,
              mid: suppressionMid,
              far: suppressionFar,
            },
            {
              show: showDamageDistribution,
              label: t("weaponCard.damageSpread"),
              tooltip: t("weaponCard.damageSpreadTooltip"),
              near: scatterNear,
              mid: scatterMid,
              far: scatterFar,
            },
            {
              show: showDamageDistribution && showScatterOffset,
              label: t("weaponCard.damageSpreadOffset"),
              tooltip: t("weaponCard.damageSpreadOffsetTooltip"),
              near: formatScatterOffset(scatterOffsetNear),
              mid: formatScatterOffset(scatterOffsetMid),
              far: formatScatterOffset(scatterOffsetFar),
            },
            {
              show: showIncrementalTargetRadius,
              label: t("weaponCard.incrementalTargetRadius"),
              tooltip: t("weaponCard.incrementalTargetRadiusTooltip"),
              near: weapon_bag.burst_incremental_target_table_search_radius_near,
              mid: weapon_bag.burst_incremental_target_table_search_radius_mid,
              far: weapon_bag.burst_incremental_target_table_search_radius_far,
            },
          ]}
        />

        <RangeStatSection
          show={
            showSustainedStats || (showProjectileTravelTime && weapon_bag.projectile_is_artillery)
          }
          title={t("weaponCard.timing")}
          rows={[
            {
              show: showProjectileTravelTime && weapon_bag.projectile_is_artillery,
              label: t("weaponCard.projectileTravelTime"),
              tooltip: t("weaponCard.projectileTravelTimeTooltip"),
              near:
                projectileTravelTimeNear === null
                  ? "—"
                  : formatSeconds(projectileTravelTimeNear, 2),
              mid:
                projectileTravelTimeMid === null
                  ? "—"
                  : formatSeconds(projectileTravelTimeMid, 2),
              far:
                projectileTravelTimeFar === null
                  ? "—"
                  : formatSeconds(projectileTravelTimeFar, 2),
            },
            {
              show: weapon_bag.burst_can_burst && showSustainedStats,
              label: t("weaponCard.burstDuration"),
              tooltip: t("weaponCard.burstDurationTooltip"),
              near: formatSeconds(timingNear.burstDuration),
              mid: formatSeconds(timingMid.burstDuration),
              far: formatSeconds(timingFar.burstDuration),
            },
            {
              show: showRefireTime && showSustainedStats,
              label: t("weaponCard.timeBetweenShots"),
              tooltip: t("weaponCard.timeBetweenShotsTooltip"),
              near: formatSeconds(timingNear.timeBetweenBurstsReload + timingNear.burstDuration),
              mid: formatSeconds(timingMid.timeBetweenBurstsReload + timingMid.burstDuration),
              far: formatSeconds(timingFar.timeBetweenBurstsReload + timingFar.burstDuration),
            },
            {
              show: showShotDelay && showSustainedStats,
              label: t("weaponCard.timeBetweenShotsMag"),
              tooltip: t("weaponCard.timeBetweenShotsMagTooltip"),
              near: formatSeconds(
                timingNear.timeBetweenBurstsCooldown + timingNear.burstDuration,
              ),
              mid: formatSeconds(timingMid.timeBetweenBurstsCooldown + timingMid.burstDuration),
              far: formatSeconds(timingFar.timeBetweenBurstsCooldown + timingFar.burstDuration),
            },
            {
              show: showTimeBetweenBursts && showSustainedStats,
              label: t("weaponCard.timeBetweenBursts"),
              tooltip: t("weaponCard.timeBetweenBurstsTooltip"),
              near: formatSeconds(timingNear.timeBetweenBurstsCooldown),
              mid: formatSeconds(timingMid.timeBetweenBurstsCooldown),
              far: formatSeconds(timingFar.timeBetweenBurstsCooldown),
            },
            {
              show: showReloadCycle && showSustainedStats,
              label: t("weaponCard.reloadCycle"),
              tooltip: t("weaponCard.reloadCycleTooltip"),
              near: formatSeconds(
                timingNear.timeBetweenBurstsReload +
                  (weapon_bag.burst_can_burst ? 0 : timingNear.burstDuration),
              ),
              mid: formatSeconds(
                timingMid.timeBetweenBurstsReload +
                  (weapon_bag.burst_can_burst ? 0 : timingMid.burstDuration),
              ),
              far: formatSeconds(
                timingFar.timeBetweenBurstsReload +
                  (weapon_bag.burst_can_burst ? 0 : timingFar.burstDuration),
              ),
            },
          ]}
        />

        <Divider my={4} />

        <CompactStatGrid
          items={[
            {
              icon: WeaponCardIcons["deflection_damage"],
              alt: "weapon deflection damage",
              label: t("weaponCard.deflectionDamage"),
              tooltip: t("weaponCard.deflectionDamageTooltip"),
              value:
                (weapon_bag.deflection_damage_multiplier *
                  (weapon_bag.damage_max + weapon_bag.damage_min)) /
                2,
              show: weapon_bag.deflection_has_deflection_damage,
            },
            {
              icon: WeaponCardIcons["aim_time"],
              alt: "weapon aim time",
              label: aimAndWindUpLabel,
              tooltip: t("weaponCard.aimTimeWithWindUpTooltip"),
              value: formatMinMaxSeconds(readyAimMin + windUp, readyAimMax + windUp),
              show: hasAimTime || hasWindUp,
            },
            {
              icon: WeaponCardIcons["projectile_travel_time"],
              alt: "weapon projectile travel time",
              label: t("weaponCard.projectileTravelTime"),
              tooltip: t("weaponCard.projectileTravelTimeTooltip"),
              value:
                projectileTravelTimeFar === null ? "—" : formatSeconds(projectileTravelTimeFar),
              show: showProjectileTravelTime && weapon_bag.projectile_type === "trajectory",
            },
            {
              icon: WeaponCardIcons["detonation_delay"],
              alt: "weapon detonation delay",
              label: t("weaponCard.detonationDelay"),
              tooltip: t("weaponCard.detonationDelayTooltip"),
              value: formatSeconds(weapon_bag.projectile_delay_detonate_time),
              show: weapon_bag.projectile_delay_detonate_time > 0,
            },
            {
              icon: WeaponCardIcons["projectile_avoidance_arc_max"],
              alt: "weapon projectile avoidance arc max",
              label: t("weaponCard.projectileAvoidanceArcMax"),
              tooltip: t("weaponCard.projectileAvoidanceArcMaxTooltip", {
                nonCollideMinAngle: weapon_bag.projectile_non_collide_start_angle,
              }),
              value: `${weapon_bag.projectile_non_collide_end_angle}°`,
              show:
                weapon_bag.projectile_firing_angle_type === "lowest_non_collide_angle" &&
                weapon_bag.projectile_type === "artillery",
            },
            {
              icon: WeaponCardIcons["reload_frequency"],
              alt: "Weapon Reload Frequency",
              label: t("weaponCard.reloadFrequency"),
              tooltip: t("weaponCard.reloadFrequencyTooltip"),
              value: formatReloadFrequency(),
              show: hasReloadFrequency,
            },
            {
              icon: WeaponCardIcons["aoe_size"],
              alt: "weapon aoe size",
              label: t("weaponCard.aoeSize"),
              tooltip: t("weaponCard.aoeSizeTooltip"),
              value: aoeDisplayValue,
              show: showAoeSize,
            },
            {
              icon: WeaponCardIcons["traverse_speed"],
              alt: "weapon traverse speed",
              label: t("weaponCard.traverseSpeed"),
              tooltip: t("weaponCard.traverseSpeedTooltip"),
              value: weapon_bag.tracking_normal_speed_horizontal,
              show: weapon_bag.tracking_normal_speed_horizontal < 360,
            },
            {
              icon: WeaponCardIcons["firing_arc"],
              alt: "weapon firing arc",
              label: t("weaponCard.arc"),
              tooltip: t("weaponCard.arcTooltip"),
              value: arcDisplay,
              show: showArc,
            },
            {
              icon: WeaponCardIcons["setup_time"],
              alt: "weapon setup time",
              label: t("weaponCard.setup"),
              tooltip: t("weaponCard.setupTooltip"),
              value: `${weapon_bag.setup_time}s`,
              show: weapon_bag.setup_time > 0,
            },
            {
              icon: WeaponCardIcons["teardown_time"],
              alt: "weapon teardown time",
              label: t("weaponCard.teardown"),
              tooltip: t("weaponCard.teardownTooltip"),
              value: `${weapon_bag.teardown_time}s`,
              show: weapon_bag.teardown_time > 0,
            },
            {
              icon: WeaponCardIcons["suppression"],
              alt: "weapon suppression",
              label: t("weaponCard.suppression"),
              tooltip: t("weaponCard.suppressionTooltip"),
              value: weapon_bag.suppression_amount * 100,
              show: weapon_bag.suppression_amount > 0 && !showSustainedStats,
            },
            {
              icon: WeaponCardIcons["suppression_radius"],
              alt: "weapon suppression radius",
              label: t("weaponCard.suppressionRadius"),
              tooltip: t("weaponCard.suppressionRadiusTooltip"),
              value: weapon_bag.suppression_nearby_suppression_radius,
              show:
                weapon_bag.suppression_amount > 0 &&
                weapon_bag.projectile_type === "none" &&
                weapon_bag.suppression_nearby_suppression_multiplier > 0,
            },
            {
              icon: WeaponCardIcons["incremental_accuracy"],
              alt: "weapon incremental target accuracy",
              label: t("weaponCard.incrementalTargetAccuracy"),
              tooltip: t("weaponCard.incrementalTargetAccuracyTooltip"),
              value: formatMultiplier(
                weapon_bag.burst_incremental_target_table_accuracy_multiplier,
              ),
              show:
                weapon_bag.burst_incremental_target_table_accuracy_multiplier > 1 &&
                weapon_bag.burst_can_burst,
            },
          ]}
        />

        {showMovingStats && <Divider my={4} />}

        <OnMoveHeader show={showMovingStats} />
        <OnMoveRow show={showMovingStats} />

        {showAoeFalloff && aoeChartDatasets.length > 0 && <Divider my={4} />}

        {showAoeFalloff && aoeChartDatasets.length > 0 && (
          <Stack gap={4}>
            <Flex align="center" gap={4}>
              <Text fw={600}>{t("weaponCard.aoeFalloff")}</Text>
              <HelperIcon
                text={t("weaponCard.aoeFalloffTooltip", {
                  aoeCap: weapon_bag.aoe_damage_max_member,
                })}
                width={300}
                iconSize={16}
              />
            </Flex>

            <Box h={160}>
              <Line data={aoeChartData} options={aoeChartOptions} />
            </Box>
          </Stack>
        )}
        <CoverModifierSection rows={coverModifierRows} t={t} />
        <TargetModifierSection rows={targetModifierRows} t={t} />
      </Stack>
    </Stack>
  );
};
