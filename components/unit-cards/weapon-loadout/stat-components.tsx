import { Divider, Flex, Grid, Stack, Text, Tooltip } from "@mantine/core";
import ImageWithFallback, { symbolPlaceholder } from "../../placeholders";
import { CompactStatItemConfig, RangeStatRowConfig } from "./types-and-constants";
import { formatRangeHeaderDistance } from "./helpers";

// ============================================================================
// Basic UI Components
// ============================================================================

export const StatLabel = ({ label, tooltip }: { label: React.ReactNode; tooltip?: string }) => {
  if (!tooltip) {
    return <Text>{label}</Text>;
  }

  return (
    <Tooltip label={tooltip} multiline w={300} withArrow openDelay={250} withinPortal>
      <Text
        style={{
          width: "fit-content",
          cursor: "help",
        }}
      >
        {label}
      </Text>
    </Tooltip>
  );
};

export const WeaponIconWithCount = ({
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

export const CenterText = ({ value, color }: { value: React.ReactNode; color?: string }) => (
  <Text style={{ textAlign: "center" }} c={color}>
    {value}
  </Text>
);

export const PrimaryWeaponStat = ({
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

// ============================================================================
// Compact Stat Components
// ============================================================================

export const CompactStatItem = ({
  label,
  tooltip,
  value,
  icon,
  alt,
  show = true,
}: CompactStatItemConfig) => {
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

      <StatLabel label={label} tooltip={tooltip} />
      <Text c="orange.6">{value}</Text>
    </Flex>
  );
};

export const CompactStatGrid = ({ items }: { items: CompactStatItemConfig[] }) => {
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

// ============================================================================
// Range Stat Components
// ============================================================================

export const RangeStatRow = ({
  label,
  tooltip,
  near,
  mid,
  far,
  show = true,
}: {
  label: string;
  tooltip?: string;
  near: React.ReactNode;
  mid: React.ReactNode;
  far: React.ReactNode;
  show?: boolean;
}) => {
  if (!show) return null;

  return (
    <Grid gutter="xs">
      <Grid.Col span={{ base: 4, md: 4 }}>
        <StatLabel label={label} tooltip={tooltip} />
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

export const RangeStatSection = ({
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
          tooltip={row.tooltip}
          near={row.near}
          mid={row.mid}
          far={row.far}
        />
      ))}
    </>
  );
};

export const RangeColumnHeader = ({
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

export const RangeHeader = ({
  left,
  nearDistance,
  midDistance,
  farDistance,
  t,
}: {
  left?: React.ReactNode;
  nearDistance: number;
  midDistance: number;
  farDistance: number;
  t: (key: string) => string;
}) => (
  <Grid gutter="xs" align="center">
    <Grid.Col span={{ base: 4, md: 4 }}>{left}</Grid.Col>

    <Grid.Col span={{ base: 3, md: 3 }}>
      <RangeColumnHeader color="green.6" label={t("common.near")} distance={nearDistance} />
    </Grid.Col>

    <Grid.Col span={{ base: 3, md: 3 }}>
      <RangeColumnHeader color="yellow.6" label={t("common.mid")} distance={midDistance} />
    </Grid.Col>

    <Grid.Col span={{ base: 2, md: 2 }}>
      <RangeColumnHeader color="red.6" label={t("common.far")} distance={farDistance} />
    </Grid.Col>
  </Grid>
);
