import {
  Box,
  Divider,
  Flex,
  Grid,
  Image,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { getScatterDimensions, getWeaponRpm, WeaponStatsType } from "../../src/unitStats";
import { getDefaultWeaponIcon } from "../../src/unitStats/dpsCommon";
import { getWeaponTiming, TICK_DURATION } from "../../src/unitStats/weaponLib";
import ImageWithFallback, { symbolPlaceholder } from "../placeholders";
import { useTranslation } from "next-i18next";
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

type WeaponCardInput = {
  id: string;
  icon_name: string; // icon path in game
  // faction: string;
  weapon_bag: WeaponStatsType;
  weapon_class: string;
  weapon_cat: string;
  parent: string; // parent file (essence parent folder, eg. rifle, light_machine_gun....)
};

type WeaponCardContext = {
  source?: "loadout" | "upgrade" | "ability";
  abilityNumShots?: number | null;
};

type TargetType = WeaponStatsType["target_type_table"][number];

type OwnUnitAoeDamageSource = "friendly" | "enemy" | "custom" | "none";

const WeaponCardIcons = {
  damage: "/icons/unit_status/bw2/8_damagebonus.png",
  deflection_damage: "/icons/unit_status/bw2/anti_tank.png",
  reload_frequency: "/icons/unit_status/bw2/ammo_swap.png",
  aim_time: "/icons/unit_status/bw2/9_markedtarget.png",
  range: "/icons/unit_status/bw2/range_boost.png",
  aoe_size: "/icons/unit_status/bw2/flame.png",
  traverse_speed: "/icons/unit_status/bw2/skorpion.png",
  firing_arc: "/icons/unit_status/bw2/artillery_radio_beacon.png",
  setup_time: "/icons/unit_status/bw2/lockdown.png",
  teardown_time: "/icons/unit_status/bw2/retreat.png",
  suppression: "/icons/unit_status/bw2/suppression.png",
  suppression_radius: "/icons/unit_status/bw2/suppressive_fire.png",
  incremental_accuracy: "/icons/unit_status/bw2/accuracy_buff.png",
} as const;

type AoeFalloffValues = {
  near: number;
  mid: number;
  far: number;
};

const getAoeValueAtDistance = (
  weapon_bag: WeaponStatsType,
  distance: number,
  values: AoeFalloffValues,
): number => {
  const nearDistance = weapon_bag.aoe_distance_near;
  const midDistance = weapon_bag.aoe_distance_mid;
  const farDistance = weapon_bag.aoe_distance_far;

  const interpolate = (x: number, x1: number, x2: number, y1: number, y2: number): number => {
    if (x1 === x2) return y2;

    const t = (x - x1) / (x2 - x1);
    return y1 + (y2 - y1) * t;
  };

  if (distance <= nearDistance) {
    return values.near;
  }

  if (distance <= midDistance) {
    return interpolate(distance, nearDistance, midDistance, values.near, values.mid);
  }

  if (distance <= farDistance) {
    return interpolate(distance, midDistance, farDistance, values.mid, values.far);
  }

  return values.far;
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
  context: WeaponCardContext = {},
) => {
  const { t } = useTranslation(["explorer"]);
  const theme = useMantineTheme();
  const formatUnitType = (unitType: string): string =>
    unitType
      .replace(/^tp_/, "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const formatBaseDamageModifier = (value: number): React.ReactNode => {
    if (value === 0) return "—";

    return value > 0 ? `+${value}` : value;
  };

  const formatMultiplier = (
    value: number,
    unchangedValue: React.ReactNode = "—",
  ): React.ReactNode => {
    const roundedValue = Math.round(value * 100) / 100;

    if (roundedValue === 1) return unchangedValue;

    return `×${roundedValue}`;
  };

  const formatPercent = (value: number, decimals = 2) => {
    return `${roundValue(value * 100, decimals)}%`;
  };

  const formatReloadFrequency = () => {
    const min = weapon_bag.reload_frequency_min + 1;
    const max = weapon_bag.reload_frequency_max + 1;

    const value = min === max ? `${min}` : `${min} - ${max}`;
    const unit = weapon_bag.burst_can_burst ? t("weaponCard.bursts") : t("weaponCard.shots");

    return `${value} ${unit}`;
  };

  const formatScatterDimensions = (distance: number) => {
    const { width, length } = getScatterDimensions(distance, weapon_bag);
    if (roundValue(width, 1) === 0 && roundValue(length, 1) === 0) return 0;
    return `${roundValue(width, 1)}×${roundValue(length, 1)}`;
  };

  const getScatterOffset = (distance: number) => {
    const { offset } = getScatterDimensions(distance, weapon_bag);

    return roundValue(offset, 1);
  };

  const formatScatterOffset = (offset: number): React.ReactNode => {
    if (offset > 0) return `+${offset}m`;

    return `${offset}m`;
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

  const formatSeconds = (value: number, decimals = 3) => `${roundValue(value, decimals)}s`;
  const formatMinMaxSeconds = (min: number, max: number, decimals = 3) => {
    const roundedMin = roundValue(min, decimals);
    const roundedMax = roundValue(max, decimals);

    if (roundedMin === roundedMax) return `${roundedMax}s`;

    return `${roundedMin}–${roundedMax}s`;
  };

  const roundValue = (value: number, decimals = 2): number => {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  };

  const CenterText = ({ value, color }: { value: React.ReactNode; color?: string }) => (
    <Text style={{ textAlign: "center" }} c={color}>
      {value}
    </Text>
  );

  const isChangedMultiplier = (value: number) => Math.round(value * 100) / 100 !== 1;

  const allMovingModifierColumns = [
    {
      key: "accuracy",
      label: t("weaponCard.accuracy"),
      value: weapon_bag.moving_accuracy_multiplier,
    },
    {
      key: "burstDuration",
      label: t("weaponCard.burstDuration"),
      value: weapon_bag.moving_burst_multiplier,
    },
    {
      key: "cooldown",
      label: t("weaponCard.cooldown"),
      value: weapon_bag.moving_cooldown_multiplier,
    },
    {
      key: "scatterAngle",
      label: t("weaponCard.scatterAngle"),
      value: weapon_bag.scatter_moving_scatter_angle_multiplier,
    },
    {
      key: "scatterDistance",
      label: t("weaponCard.scatterDistance"),
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

  const movingLabelColumnSpan = 2;
  const movingStatColumnSpan = 10 / Math.max(movingModifierColumns.length, 1);

  const OnMoveHeader = ({ show = true }: { show?: boolean }) => {
    if (!show || hasSingleMovingModifier) return null;

    return (
      <Grid gutter="xs">
        <Grid.Col span={{ base: movingLabelColumnSpan, md: movingLabelColumnSpan }} />

        {movingModifierColumns.map((column) => (
          <Grid.Col
            key={column.key}
            span={{ base: movingStatColumnSpan, md: movingStatColumnSpan }}
          >
            <CenterText value={column.label} />
          </Grid.Col>
        ))}
      </Grid>
    );
  };

  const OnMoveRow = ({ show = true }: { show?: boolean }) => {
    if (!show) return null;

    if (hasSingleMovingModifier) {
      const column = movingModifierColumns[0];

      return (
        <Flex align="center" justify="center" gap={6} wrap="nowrap">
          <Text>
            {t("weaponCard.onTheMove")} {column.label}
          </Text>
          <Text c="orange.6">{formatMultiplier(column.value, "×1")}</Text>
        </Flex>
      );
    }

    return (
      <Grid gutter="xs">
        <Grid.Col span={{ base: movingLabelColumnSpan, md: movingLabelColumnSpan }}>
          <Text>{t("weaponCard.onTheMove")}</Text>
        </Grid.Col>

        {movingModifierColumns.map((column) => (
          <Grid.Col
            key={column.key}
            span={{ base: movingStatColumnSpan, md: movingStatColumnSpan }}
          >
            <CenterText color="orange.6" value={formatMultiplier(column.value)} />
          </Grid.Col>
        ))}
      </Grid>
    );
  };

  const formatRangeHeaderDistance = (distance: number) => `${roundValue(distance, 2)}m`;

  const RangeColumnHeader = ({
    label,
    distance,
    color,
  }: {
    label: string;
    distance: number;
    color: string;
  }) => (
    <Stack gap={0} align="center">
      <Text c={color} fz="xs" opacity={0.8}>
        {label}
      </Text>
      <Text c={color} fw={700}>
        {formatRangeHeaderDistance(distance)}
      </Text>
    </Stack>
  );

  const RangeHeader = ({ left }: { left?: React.ReactNode }) => (
    <Grid gutter="xs" align="center">
      <Grid.Col span={{ base: 4, md: 4 }}>{left}</Grid.Col>

      <Grid.Col span={{ base: 3, md: 3 }}>
        <RangeColumnHeader
          color="green.6"
          label={t("common.near")}
          distance={weapon_bag.range.near}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 3, md: 3 }}>
        <RangeColumnHeader
          color="yellow.6"
          label={t("common.mid")}
          distance={weapon_bag.range.mid}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 2, md: 2 }}>
        <RangeColumnHeader
          color="red.6"
          label={t("common.far")}
          distance={weapon_bag.range.far}
        />
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

  type RangeStatRowConfig = {
    label: string;
    near: React.ReactNode;
    mid: React.ReactNode;
    far: React.ReactNode;
    show?: boolean;
  };

  const RangeStatSection = ({
    title,
    rows,
    show = true,
    showDivider = true,
  }: {
    title: string;
    rows: RangeStatRowConfig[];
    show?: boolean;
    showDivider?: boolean;
  }) => {
    const visibleRows = rows.filter((row) => row.show ?? true);

    if (!show || visibleRows.length === 0) return null;

    return (
      <>
        {showDivider ? <Divider my={4} /> : null}

        <Grid gutter="xs">
          <Grid.Col span={12}>
            <Text fz="xs" fw={700} tt="uppercase" c="dimmed">
              {title}
            </Text>
          </Grid.Col>
        </Grid>

        {visibleRows.map((row) => (
          <RangeStatRow
            key={row.label}
            label={row.label}
            near={row.near}
            mid={row.mid}
            far={row.far}
          />
        ))}
      </>
    );
  };

  type CompactStatItemConfig = {
    label: string;
    value: React.ReactNode;
    icon?: string;
    alt?: string;
    show?: boolean;
  };

  const CompactStatItem = ({ label, value, icon, alt, show = true }: CompactStatItemConfig) => {
    if (!show) return null;

    return (
      <Flex justify="flex-start" align="center" gap={6} wrap="nowrap">
        {icon && (
          <ImageWithFallback
            width={16}
            height={16}
            src={icon}
            alt={alt ?? label}
            fallbackSrc={symbolPlaceholder}
            style={{ opacity: 0.75, flexShrink: 0 }}
          />
        )}

        <Text>{label}</Text>
        <Text c="orange.6">{value}</Text>
      </Flex>
    );
  };

  const CompactStatGrid = ({ items }: { items: CompactStatItemConfig[] }) => {
    const visibleItems = items.filter((item) => item.show ?? true);

    if (visibleItems.length === 0) return null;

    return (
      <Flex align="center" justify="center" columnGap="xl" rowGap={4} wrap="wrap">
        {visibleItems.map((item) => (
          <CompactStatItem key={item.label} {...item} />
        ))}
      </Flex>
    );
  };

  const PrimaryWeaponStat = ({
    label,
    value,
    icon,
    alt,
  }: {
    label: string;
    value: React.ReactNode;
    icon: string;
    alt: string;
  }) => (
    <Flex align="center" gap={7} wrap="nowrap" style={{ minWidth: 0 }}>
      <ImageWithFallback
        width={19}
        height={19}
        src={icon}
        alt={alt}
        fallbackSrc={symbolPlaceholder}
        style={{ opacity: 0.9, flexShrink: 0 }}
      />

      <Flex align="baseline" gap={4} wrap="nowrap" style={{ minWidth: 0 }}>
        <Text fz="sm" fw={700} style={{ whiteSpace: "nowrap" }}>
          {label}
        </Text>

        <Text fz="md" c="orange.5" fw={800} lh={1.1} style={{ whiteSpace: "nowrap" }}>
          {value}
        </Text>
      </Flex>
    </Flex>
  );

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
    aimTime: number;
  };

  const CoverModifierSection = ({ rows }: { rows: CoverModifierRow[] }) => {
    if (rows.length === 0) return null;

    const showCoverAimTime = rows.some((row) => row.aimTime !== 1);
    const statColumnSpan = showCoverAimTime ? 2.6 : 4;

    const coverRows = [
      {
        ...rows[0],
        icon: "/icons/common/cover/light.png",
      },
      {
        ...rows[1],
        icon: "/icons/common/cover/heavy.png",
      },
      {
        ...rows[2],
        icon: "/icons/common/units/garrisoned.png",
      },
    ];

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

          <Grid.Col span={{ base: statColumnSpan, md: statColumnSpan }}>
            <CenterText value={t("weaponCard.accuracy")} />
          </Grid.Col>

          <Grid.Col span={{ base: statColumnSpan, md: statColumnSpan }}>
            <CenterText value={t("weaponCard.damage")} />
          </Grid.Col>

          {showCoverAimTime && (
            <Grid.Col span={{ base: statColumnSpan, md: statColumnSpan }}>
              <CenterText value={t("weaponCard.aimTime")} />
            </Grid.Col>
          )}
        </Grid>

        {coverRows.map((row) => (
          <Grid key={row.label} gutter="xs">
            <Grid.Col span={{ base: 4, md: 4 }}>
              <Flex align="center" gap={4}>
                <Image src={row.icon} alt={row.label} h={32} w={32} />
                <Text>{row.label}</Text>
              </Flex>
            </Grid.Col>

            <Grid.Col span={{ base: statColumnSpan, md: statColumnSpan }}>
              <CenterText color="orange.6" value={formatMultiplier(row.accuracy ?? 1, "×1")} />
            </Grid.Col>

            <Grid.Col span={{ base: statColumnSpan, md: statColumnSpan }}>
              <CenterText color="orange.6" value={formatMultiplier(row.damage ?? 1, "×1")} />
            </Grid.Col>

            {showCoverAimTime && (
              <Grid.Col span={{ base: statColumnSpan, md: statColumnSpan }}>
                <CenterText color="orange.6" value={formatMultiplier(row.aimTime ?? 1, "×1")} />
              </Grid.Col>
            )}
          </Grid>
        ))}
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
  const showReloadCycle = isBurstWeapon || hasReloadFrequency;

  const showDamageDistribution =
    weapon_bag.projectile_type === "none" &&
    !weapon_bag.burst_focus_fire &&
    weapon_bag.burst_can_burst;

  const showIncrementalTargetRadius =
    weapon_bag.burst_incremental_target_table_accuracy_multiplier > 1 &&
    weapon_bag.burst_can_burst;

  const getSuppressionMultiplier = (accuracy: number) => {
    if (weapon_bag.projectile_type === "artillery" || weapon_bag.projectile_type === "mortar")
      return null;

    if (weapon_bag.projectile_type === "direct") {
      return accuracy;
    }

    return weapon_bag.suppression_nearby_suppression_multiplier;
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

  const scatterNear = formatScatterDimensions(weapon_bag.range.near);
  const scatterMid = formatScatterDimensions(weapon_bag.range.mid);
  const scatterFar = formatScatterDimensions(weapon_bag.range.far);

  const scatterOffsetNear = getScatterOffset(weapon_bag.range.near);
  const scatterOffsetMid = getScatterOffset(weapon_bag.range.mid);
  const scatterOffsetFar = getScatterOffset(weapon_bag.range.far);

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

  const areAoeFalloffValuesEqual = (first: AoeFalloffValues, second: AoeFalloffValues) => {
    const epsilon = 0.000001;

    return (
      Math.abs(first.near - second.near) < epsilon &&
      Math.abs(first.mid - second.mid) < epsilon &&
      Math.abs(first.far - second.far) < epsilon
    );
  };

  const normalizeOwnUnitAoeDamageValue = (ownUnitValue: number, friendlyValue: number) => {
    // Relic-style inherit value.
    if (ownUnitValue < 0) return friendlyValue;

    return ownUnitValue;
  };

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

  const getAoeGraphStep = (maxDistance: number) => {
    if (maxDistance <= 5) return 0.1;

    return 0.2;
  };

  const buildAoeGraphPoints = (getValue: (distance: number) => number) => {
    const maxDistance = weapon_bag.aoe_outer_radius;
    const step = getAoeGraphStep(maxDistance);

    const regularPoints = Array.from({ length: Math.floor(maxDistance / step) + 1 }, (_, index) =>
      roundValue(index * step, 2),
    );

    const exactPoints = [
      0,
      weapon_bag.aoe_distance_near,
      weapon_bag.aoe_distance_mid,
      weapon_bag.aoe_distance_far,
      weapon_bag.aoe_outer_radius,
    ].map((distance) => roundValue(distance, 2));

    const distances = [...new Set([...regularPoints, ...exactPoints])]
      .filter((distance) => Number.isFinite(distance))
      .filter((distance) => distance >= 0 && distance <= maxDistance)
      .sort((a, b) => a - b);

    return distances.map((distance) => ({
      x: distance,
      y: roundValue(getValue(distance), 3),
    }));
  };

  type AoeDatasetOptions = {
    yAxisID?: "yDamage" | "ySuppression";
    borderWidth?: number;
    borderDash?: number[];
    order?: number;
  };

  const createAoeDataset = (
    label: string,
    data: { x: number; y: number }[],
    color: string,
    options: AoeDatasetOptions = {},
  ) => ({
    label,
    data,
    yAxisID: options.yAxisID ?? "yDamage",
    borderWidth: options.borderWidth ?? 3,
    borderColor: color,
    tension: 0.1,
    pointStyle: "cross" as const,
    fill: false,
    backgroundColor: "rgba(200, 200, 200, 0.2)",
    pointRadius: 0,
    pointHoverRadius: 30,
    pointHitRadius: 10,
    order: options.order ?? 1,
    ...(options.borderDash ? { borderDash: options.borderDash } : {}),
  });

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
      buildAoeGraphPoints((distance) => getAverageDamageValue(getAoeDamageMultiplier(distance))),
      theme.colors.orange[5],
      {
        yAxisID: "yDamage",
        order: 0,
      },
    ),

    hasFriendlyAoeDamage
      ? createAoeDataset(
          friendlyDamageDatasetLabel,
          buildAoeGraphPoints((distance) =>
            getAverageDamageValue(getAoeFriendlyDamageMultiplier(distance)),
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
          buildAoeGraphPoints((distance) =>
            getAverageDamageValue(getAoeOwnUnitDamageMultiplier(distance)),
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
          buildAoeGraphPoints((distance) => getAoeSuppressionDisplayValue(distance)),
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

  const aoeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        display: true,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        min: 0,
        suggestedMax: weapon_bag.aoe_outer_radius,
        title: {
          display: true,
          text: t("weaponCard.distance"),
        },
        grid: {
          lineWidth: 0.5,
          display: true,
        },
      },
      yDamage: {
        type: "linear" as const,
        position: "left" as const,
        suggestedMin: 0,
        suggestedMax: Math.ceil(maxAoeDamageGraphValue),
        title: {
          display: true,
          text: t("weaponCard.damage"),
        },
        grid: {
          lineWidth: 0.5,
          display: false,
        },
      },
      ySuppression: {
        type: "linear" as const,
        position: "right" as const,
        display: hasAoeSuppression,
        suggestedMin: 0,
        suggestedMax: Math.ceil(maxAoeSuppressionGraphValue),
        title: {
          display: hasAoeSuppression,
          text: t("weaponCard.suppression"),
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
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
        <RangeHeader left={<PrimaryWeaponStats />} />

        <RangeStatSection
          title={t("weaponCard.coreStats")}
          rows={[
            {
              show:
                weapon_bag.projectile_type !== "artillery" &&
                weapon_bag.projectile_type !== "mortar",
              label: t("weaponCard.accuracy"),
              near: formatPercent(weapon_bag.accuracy_near),
              mid: formatPercent(weapon_bag.accuracy_mid),
              far: formatPercent(weapon_bag.accuracy_far),
            },
            {
              show:
                weapon_bag.projectile_type === "artillery" ||
                weapon_bag.projectile_type === "mortar",
              label: t("weaponCard.scatter"),
              near: scatterNear,
              mid: scatterMid,
              far: scatterFar,
            },
            {
              show:
                (weapon_bag.projectile_type === "artillery" ||
                  weapon_bag.projectile_type === "mortar") &&
                showScatterOffset,
              label: t("weaponCard.scatterOffset"),
              near: formatScatterOffset(scatterOffsetNear),
              mid: formatScatterOffset(scatterOffsetMid),
              far: formatScatterOffset(scatterOffsetFar),
            },
            {
              show: showSustainedStats,
              label: t("weaponCard.rpm"),
              near: rpmNear,
              mid: rpmMid,
              far: rpmFar,
            },
            {
              label: t("weaponCard.penetration"),
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
              show: weapon_bag.projectile_type === "direct",
              label: t("weaponCard.scatter"),
              near: scatterNear,
              mid: scatterMid,
              far: scatterFar,
            },
            {
              show: weapon_bag.projectile_type === "direct" && showScatterOffset,
              label: t("weaponCard.scatterOffset"),
              near: formatScatterOffset(scatterOffsetNear),
              mid: formatScatterOffset(scatterOffsetMid),
              far: formatScatterOffset(scatterOffsetFar),
            },
            {
              show: showSuppression,
              label: t("weaponCard.suppressionPerSecond"),
              near: suppressionNear,
              mid: suppressionMid,
              far: suppressionFar,
            },
            {
              show: showDamageDistribution,
              label: t("weaponCard.damageSpread"),
              near: scatterNear,
              mid: scatterMid,
              far: scatterFar,
            },
            {
              show: showIncrementalTargetRadius,
              label: t("weaponCard.incrementalTargetRadius"),
              near: weapon_bag.burst_incremental_target_table_search_radius_near,
              mid: weapon_bag.burst_incremental_target_table_search_radius_mid,
              far: weapon_bag.burst_incremental_target_table_search_radius_far,
            },
          ]}
        />

        <RangeStatSection
          show={showSustainedStats}
          title={t("weaponCard.timing")}
          rows={[
            {
              show: weapon_bag.burst_can_burst,
              label: t("weaponCard.burstDuration"),
              near: formatSeconds(timingNear.burstDuration),
              mid: formatSeconds(timingMid.burstDuration),
              far: formatSeconds(timingFar.burstDuration),
            },
            {
              show: showRefireTime,
              label: t("weaponCard.timeBetweenShots"),
              near: formatSeconds(timingNear.timeBetweenBurstsReload + timingNear.burstDuration),
              mid: formatSeconds(timingMid.timeBetweenBurstsReload + timingMid.burstDuration),
              far: formatSeconds(timingFar.timeBetweenBurstsReload + timingFar.burstDuration),
            },
            {
              show: showShotDelay,
              label: t("weaponCard.timeBetweenShotsMag"),
              near: formatSeconds(
                timingNear.timeBetweenBurstsCooldown + timingNear.burstDuration,
              ),
              mid: formatSeconds(timingMid.timeBetweenBurstsCooldown + timingMid.burstDuration),
              far: formatSeconds(timingFar.timeBetweenBurstsCooldown + timingFar.burstDuration),
            },
            {
              show: showTimeBetweenBursts,
              label: t("weaponCard.timeBetweenBursts"),
              near: formatSeconds(timingNear.timeBetweenBurstsCooldown),
              mid: formatSeconds(timingMid.timeBetweenBurstsCooldown),
              far: formatSeconds(timingFar.timeBetweenBurstsCooldown),
            },
            {
              show: showReloadCycle,
              label: t("weaponCard.reloadCycle"),
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
              value: formatMinMaxSeconds(readyAimMin + windUp, readyAimMax + windUp),
              show: hasAimTime || hasWindUp,
            },
            {
              icon: WeaponCardIcons["reload_frequency"],
              alt: "Weapon Reload Frequency",
              label: t("weaponCard.reloadFrequency"),
              value: formatReloadFrequency(),
              show: hasReloadFrequency,
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
              icon: WeaponCardIcons["suppression"],
              alt: "weapon suppression",
              label: t("weaponCard.suppression"),
              value: weapon_bag.suppression_amount * 100,
              show: weapon_bag.suppression_amount > 0 && !showSustainedStats,
            },
            {
              icon: WeaponCardIcons["suppression_radius"],
              alt: "weapon suppression radius",
              label: t("weaponCard.suppressionRadius"),
              value: weapon_bag.suppression_nearby_suppression_radius,
              show: weapon_bag.suppression_amount > 0 && weapon_bag.projectile_type === "none",
            },
            {
              icon: WeaponCardIcons["incremental_accuracy"],
              alt: "weapon incremental target accuracy",
              label: t("weaponCard.incrementalTargetAccuracy"),
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
            <Text fw={600}>{t("weaponCard.aoeFalloff")}</Text>

            <Box h={160}>
              <Line data={aoeChartData} options={aoeChartOptions} />
            </Box>
          </Stack>
        )}
        <CoverModifierSection rows={coverModifierRows} />
        <TargetModifierSection rows={targetModifierRows} />
      </Stack>
    </Stack>
  );
};
