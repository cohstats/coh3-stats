import React from "react";
import { Anchor, Badge, Card, Group, Image, Stack, Text, Tooltip } from "@mantine/core";
import { TFunction } from "next-i18next/pages";
import { iconPlaceholder } from "../../../components/placeholders";
import LinkWithOutPrefetch from "../../../components/LinkWithOutPrefetch";
import type { raceType } from "../../../src/coh3/coh3-types";
import {
  FS_TECH_NO_THRESHOLD_MAX,
  formatFsTechTag,
  getFsTechIconUrl,
  getFsTechUnitRoute,
} from "../../../src/explorer/fs-technologies/fs-technologies-helpers";
import type { FsTechnology } from "../../../src/explorer/fs-technologies/fs-technologies-types";
import classes from "./fs-tech.module.css";

/** Side of the icon of a card. */
const TECH_ICON_SIZE = 56;

/** Colour of the badge of a category, so a pick can be told apart at a glance. */
const CATEGORY_COLORS: Record<string, string> = {
  unit: "blue",
  ability: "grape",
  passive: "teal",
};

/**
 * The wave window of a technology as a text, eg. `Waves 4 - 10` / `From wave 8`. `null` for a
 * technology which is available in every wave - that is the common case and saying so on most cards
 * would be noise.
 */
const useWaveLabel = (technology: FsTechnology, t: TFunction): string | null => {
  if (technology.alwaysAvailable) return null;

  const hasMax = technology.thresholdMax < FS_TECH_NO_THRESHOLD_MAX;

  if (technology.thresholdMin <= 0 && hasMax) {
    return t("tech.waveUntil", { wave: technology.thresholdMax });
  }
  if (!hasMax) return t("tech.waveFrom", { wave: technology.thresholdMin });

  return t("tech.waveRange", { from: technology.thresholdMin, to: technology.thresholdMax });
};

/**
 * A single technology of a pick - icon, name, type label, description and the wave window when it
 * has one. The description of the game files already states the effect in words, so the raw
 * properties behind it are deliberately not shown (nor even parsed, see `RawFsTechnology`).
 *
 * There is no selected state, a card is never opened or pinned. This is the whole technology. The
 * one thing a card leads anywhere is a `unit` technology - its name links to the unit page of the
 * squad it unlocks.
 */
const TechCard = ({
  technology,
  race,
  t,
}: {
  technology: FsTechnology;
  /** Faction of the page - the unit of a technology always belongs to it. */
  race: raceType;
  t: TFunction;
}) => {
  const waveLabel = useWaveLabel(technology, t);
  const categoryColor = CATEGORY_COLORS[technology.category ?? "passive"] ?? "gray";
  const unitRoute = getFsTechUnitRoute(technology, race);

  return (
    <Card
      withBorder
      padding="sm"
      radius="md"
      className={classes.techCard}
      data-testid={`fs-tech-card-${technology.id}`}
    >
      <Stack gap="xs">
        <Group gap="xs" wrap="nowrap" align="flex-start">
          <Image
            src={getFsTechIconUrl(technology)}
            alt={technology.name}
            w={TECH_ICON_SIZE}
            h={TECH_ICON_SIZE}
            fit="contain"
            className={classes.techIcon}
            fallbackSrc={iconPlaceholder.src}
          />

          <Stack gap={2} style={{ minWidth: 0 }}>
            {unitRoute ? (
              <Tooltip label={t("tech.unitLinkTooltip", { unit: technology.name })} withArrow>
                <Anchor
                  component={LinkWithOutPrefetch}
                  href={unitRoute}
                  fw={600}
                  lh={1.2}
                  c="orange"
                  data-testid={`fs-tech-unit-link-${technology.id}`}
                >
                  {technology.name}
                </Anchor>
              </Tooltip>
            ) : (
              <Text fw={600} lh={1.2}>
                {technology.name}
              </Text>
            )}
            {technology.typeLabel && (
              <Text size="xs" c="dimmed">
                {technology.typeLabel}
              </Text>
            )}
          </Stack>
        </Group>

        <Group gap={4}>
          <Badge size="xs" variant="light" color={categoryColor}>
            {t(`category.${technology.category ?? "passive"}`)}
          </Badge>

          {/* Only the shared technologies are marked - a faction one is the default. */}
          {technology.source === "common" && (
            <Tooltip label={t("tech.commonTooltip")} withArrow>
              <Badge size="xs" variant="light" color="gray">
                {t("tech.common")}
              </Badge>
            </Tooltip>
          )}

          {waveLabel && (
            <Tooltip label={t("tech.waveTooltip")} withArrow>
              <Badge size="xs" variant="light" color="orange">
                {waveLabel}
              </Badge>
            </Tooltip>
          )}

          {technology.tags.map((tag) => (
            <Badge key={tag} size="xs" variant="outline" color="gray">
              {formatFsTechTag(tag)}
            </Badge>
          ))}

          {!technology.enabled && (
            <Tooltip label={t("tech.disabledTooltip")} withArrow>
              <Badge size="xs" variant="light" color="red">
                {t("tech.disabled")}
              </Badge>
            </Tooltip>
          )}
        </Group>

        {technology.description ? (
          <Text size="sm" style={{ whiteSpace: "pre-line" }}>
            {technology.description}
          </Text>
        ) : (
          <Text size="sm" c="dimmed" fs="italic">
            {t("tech.noDescription")}
          </Text>
        )}

        {technology.extraText && (
          <Text size="sm" c="dimmed" style={{ whiteSpace: "pre-line" }}>
            {technology.extraText}
          </Text>
        )}
      </Stack>
    </Card>
  );
};

export { TECH_ICON_SIZE, CATEGORY_COLORS };
export default TechCard;
