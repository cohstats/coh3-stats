import React from "react";
import { Badge, Group, Image, Stack, Table, Text } from "@mantine/core";
import { TFunction } from "next-i18next/pages";
import { iconPlaceholder } from "../../../components/placeholders";
import {
  formatFsPerkModifierName,
  formatFsPerkModifierValue,
  getFsPerkIconUrl,
  isSingleLevelFsPerk,
} from "../../../src/explorer/fs-perks/fs-perks-helpers";
import type { FsPerk } from "../../../src/explorer/fs-perks/fs-perks-types";
import classes from "./fs-perks.module.css";

/** Icon size of the perk header - the pinned card gets a bigger one than the hover card. */
const ICON_SIZE = { hover: 56, panel: 72 };

/**
 * Modifiers of a perk, collapsed over its levels. A perk applies the same modifiers on every level
 * with a growing value, so `HEALTH_MODIFIER` on all five levels is one row of `1.1 → 1.5`.
 */
type ModifierSummary = { id: string; from: string; to: string };

const summarizeModifiers = (perk: FsPerk): ModifierSummary[] => {
  const valuesById = new Map<string, string[]>();

  for (const level of perk.levels) {
    for (const modifier of level.modifiers) {
      const values = valuesById.get(modifier.id) ?? [];
      values.push(formatFsPerkModifierValue(modifier));
      valuesById.set(modifier.id, values);
    }
  }

  return Array.from(valuesById.entries()).map(([id, values]) => ({
    id,
    from: values[0],
    to: values[values.length - 1],
  }));
};

/**
 * The level by level breakdown - level, its own cost, the cost to get there and the effect. Every
 * column is right aligned and the table only takes the width it needs, so the effects stay next to
 * the numbers instead of drifting off to the edge of the card.
 */
const PerkLevelTable = ({ perk, t }: { perk: FsPerk; t: TFunction }) => (
  <Table
    striped
    withRowBorders={false}
    verticalSpacing={4}
    horizontalSpacing="xs"
    fz="sm"
    className={classes.levelTable}
  >
    <Table.Thead>
      <Table.Tr>
        <Table.Th w={40} ta="right">
          {t("table.level")}
        </Table.Th>
        <Table.Th w={60} ta="right">
          {t("table.cost")}
        </Table.Th>
        <Table.Th w={60} ta="right">
          {t("table.total")}
        </Table.Th>
        <Table.Th ta="right">{t("table.effect")}</Table.Th>
      </Table.Tr>
    </Table.Thead>
    <Table.Tbody>
      {perk.levels.map((level) => (
        <Table.Tr key={level.level}>
          <Table.Td fw={500} ta="right">
            {level.level}
          </Table.Td>
          <Table.Td ta="right">{level.cost}</Table.Td>
          <Table.Td ta="right" c="dimmed">
            {level.cumulativeCost}
          </Table.Td>
          <Table.Td ta="right" style={{ whiteSpace: "pre-line" }}>
            {level.effect ?? (
              <Text component="span" size="sm" c="dimmed">
                {t("perk.noEffect")}
              </Text>
            )}
          </Table.Td>
        </Table.Tr>
      ))}
    </Table.Tbody>
  </Table>
);

/**
 * Everything we know about a single perk. Rendered both inside the hover card of a perk tile and in
 * the pinned card below the tree - the `variant` only changes the sizes and whether the raw game
 * modifiers are listed.
 */
const PerkDetail = ({
  perk,
  t,
  variant = "hover",
}: {
  perk: FsPerk;
  t: TFunction;
  variant?: "hover" | "panel";
}) => {
  const iconSize = ICON_SIZE[variant];
  const singleLevel = isSingleLevelFsPerk(perk);
  const modifiers = variant === "panel" ? summarizeModifiers(perk) : [];
  // Single level perks have their whole effect in the one level, no point in a one row table.
  const singleLevelEffect = singleLevel ? perk.levels[0]?.effect : null;

  return (
    <Stack gap="xs">
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <Image
          src={getFsPerkIconUrl(perk, true)}
          alt={perk.name}
          w={iconSize}
          h={iconSize}
          fit="contain"
          className={classes.perkIcon}
          fallbackSrc={iconPlaceholder.src}
        />

        <Stack gap={4} style={{ minWidth: 0 }}>
          <Text fw={700} fz={variant === "panel" ? "h4" : "md"} lh={1.2}>
            {perk.name}
          </Text>

          <Group gap={6}>
            <Badge variant="light" color="gray" size="sm">
              {t("tier.title", { tier: perk.tier })}
            </Badge>
            <Badge variant="light" color="blue" size="sm">
              {singleLevel ? t("perk.singleLevel") : t("perk.levels", { count: perk.maxLevel })}
            </Badge>
            <Badge variant="light" color="orange" size="sm">
              {t("perk.cost", { count: perk.totalCost })}
            </Badge>
          </Group>
        </Stack>
      </Group>

      {perk.description ? (
        <Text size="sm" style={{ whiteSpace: "pre-line" }}>
          {perk.description}
        </Text>
      ) : (
        <Text size="sm" c="dimmed">
          {t("perk.noDescription")}
        </Text>
      )}

      {/* Only a couple of perks have a level independent effect summary. */}
      {perk.effect && (
        <Text size="sm" fs="italic" style={{ whiteSpace: "pre-line" }}>
          {perk.effect}
        </Text>
      )}

      {singleLevel ? (
        singleLevelEffect && (
          <Text size="sm" fw={500} style={{ whiteSpace: "pre-line" }}>
            {singleLevelEffect}
          </Text>
        )
      ) : (
        <PerkLevelTable perk={perk} t={t} />
      )}

      {modifiers.length > 0 && (
        <Stack gap={2}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            {t("perk.modifiers")}
          </Text>
          {modifiers.map((modifier) => (
            <Group key={modifier.id} justify="space-between" gap="sm" wrap="nowrap">
              <Text size="sm" c="dimmed">
                {formatFsPerkModifierName(modifier.id)}
              </Text>
              <Text size="sm" ta="right">
                {modifier.from === modifier.to
                  ? modifier.from
                  : t("perk.modifierRange", { from: modifier.from, to: modifier.to })}
              </Text>
            </Group>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default PerkDetail;
