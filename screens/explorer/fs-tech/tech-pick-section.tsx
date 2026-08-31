import React from "react";
import { Badge, Group, Stack, Text, Title, Tooltip } from "@mantine/core";
import { TFunction } from "next-i18next/pages";
import type { raceType } from "../../../src/coh3/coh3-types";
import type {
  FsTechPick,
  FsTechnology,
} from "../../../src/explorer/fs-technologies/fs-technologies-types";
import TechCard, { CATEGORY_COLORS } from "./tech-card";
import TechChip from "./tech-chip";
import classes from "./fs-tech.module.css";

/**
 * One pick of the draft - the headline of the pick plus the technologies it can offer.
 *
 * The pool is split in two: the technologies this pick is the first to offer are rendered as full
 * cards, the ones an earlier pick already described come back as chips. The split is passed in
 * rather than read off the pick, because the filters of the page change which pick is the first one
 * to show a technology.
 */
const TechPickSection = ({
  pick,
  newTechnologies,
  repeatedTechnologies,
  choicesPerPick,
  race,
  t,
}: {
  pick: FsTechPick;
  newTechnologies: FsTechnology[];
  repeatedTechnologies: FsTechnology[];
  choicesPerPick: number;
  race: raceType;
  t: TFunction;
}) => {
  // The badge states the rule of the game - how many technologies the pick draws from - so it counts
  // the whole pool, not the part the filters of the page left over.
  const poolSize = pick.technologies.length;
  const shownCount = newTechnologies.length + repeatedTechnologies.length;
  const categoryColor = CATEGORY_COLORS[pick.category] ?? "gray";

  return (
    <Stack gap="xs" data-testid={`fs-tech-pick-${pick.pick}`}>
      <div className={classes.pickHeader}>
        <Title order={2} size="h4">
          {t("pick.title", { pick: pick.pick })}
        </Title>

        <Group gap={4}>
          <Tooltip label={t("pick.waveTooltip")} withArrow>
            <Badge variant="light" color="gray">
              {t("pick.wave", { wave: pick.wave })}
            </Badge>
          </Tooltip>
          <Badge variant="light" color={categoryColor}>
            {t(`category.${pick.category}`)}
          </Badge>
          <Tooltip label={t("pick.poolTooltip")} withArrow>
            <Badge variant="light" color="orange">
              {t("pick.pool", { choices: choicesPerPick, count: poolSize })}
            </Badge>
          </Tooltip>
        </Group>
      </div>

      {pick.title && (
        <Text c="dimmed" size="sm">
          {pick.title}
        </Text>
      )}

      {newTechnologies.length > 0 && (
        <div className={classes.techGrid}>
          {newTechnologies.map((technology) => (
            <TechCard key={technology.id} technology={technology} race={race} t={t} />
          ))}
        </div>
      )}

      {repeatedTechnologies.length > 0 && (
        <Stack gap={4}>
          <Text size="xs" c="dimmed">
            {t("pick.repeated", { count: repeatedTechnologies.length })}
          </Text>
          <div className={classes.techChipList}>
            {repeatedTechnologies.map((technology) => (
              <TechChip key={technology.id} technology={technology} />
            ))}
          </div>
        </Stack>
      )}

      {shownCount === 0 && (
        <Text size="sm" c="dimmed" fs="italic">
          {t("pick.empty")}
        </Text>
      )}
    </Stack>
  );
};

export default TechPickSection;
