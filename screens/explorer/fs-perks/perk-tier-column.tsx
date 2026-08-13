import React from "react";
import { Badge, Text, Tooltip } from "@mantine/core";
import { TFunction } from "next-i18next/pages";
import type { FsPerkTier } from "../../../src/explorer/fs-perks/fs-perks-types";
import PerkTile from "./perk-tile";
import classes from "./fs-perks.module.css";

/**
 * One tier of the perk tree as a column. The tier headers line up at the top, the perks are centered
 * in the space below them, so a tier with one perk sits at the height of the middle of a full tier.
 */
const PerkTierColumn = ({
  tier,
  selectedPerkId,
  onSelect,
  t,
}: {
  tier: FsPerkTier;
  selectedPerkId: string | null;
  onSelect: (perkId: string) => void;
  t: TFunction;
}) => {
  const isFirstTier = tier.unlockThreshold === 0;

  return (
    <div className={classes.tierColumn} data-testid={`fs-perk-tier-${tier.tier}`}>
      <div className={classes.tierHeader}>
        <Text size="sm" fw={700} tt="uppercase">
          {t("tier.title", { tier: tier.tier })}
        </Text>
        <Tooltip
          label={
            isFirstTier
              ? t("tier.unlockStartTooltip")
              : t("tier.unlockTooltip", { count: tier.unlockThreshold })
          }
          multiline
          w={240}
          withArrow
        >
          <Badge variant="light" color={isFirstTier ? "teal" : "gray"} size="sm">
            {isFirstTier
              ? t("tier.unlockStart")
              : t("tier.unlock", { count: tier.unlockThreshold })}
          </Badge>
        </Tooltip>
      </div>

      <div className={classes.tierPerks}>
        {tier.perks.map((perk) => (
          <PerkTile
            key={perk.id}
            perk={perk}
            selected={perk.id === selectedPerkId}
            onSelect={onSelect}
            t={t}
          />
        ))}
      </div>
    </div>
  );
};

export default PerkTierColumn;
