import { Divider, Flex, Grid, Image, Text } from "@mantine/core";
import HelperIcon from "../../icon/helper";
import { CenterText } from "./stat-components";
import { CoverModifierRow, TargetType } from "./types-and-constants";
import { formatBaseDamageModifier, formatMultiplier, formatUnitType } from "./helpers";

export const TargetModifierSection = ({
  rows,
  t,
}: {
  rows: TargetType[];
  t: (key: string) => string;
}) => {
  if (rows.length === 0) return null;

  return (
    <>
      <Divider my={4} />

      <Grid gutter="xs">
        <Grid.Col span={{ base: 4, md: 4 }}>
          <Flex align="center" gap={4}>
            <Text fw={600}>{t("weaponCard.targetModifiers")}</Text>
            <HelperIcon text={t("weaponCard.targetModifiersTooltip")} width={300} iconSize={16} />
          </Flex>
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
            <CenterText color="orange.6" value={formatMultiplier(entry.penetration_multiplier)} />
          </Grid.Col>

          <Grid.Col span={{ base: 2, md: 2 }}>
            <CenterText color="orange.6" value={formatMultiplier(entry.damage_multiplier)} />
          </Grid.Col>
        </Grid>
      ))}
    </>
  );
};

export const CoverModifierSection = ({
  rows,
  t,
}: {
  rows: CoverModifierRow[];
  t: (key: string) => string;
}) => {
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
            <HelperIcon text={t("weaponCard.coverModifiersTooltip")} width={300} iconSize={16} />
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
