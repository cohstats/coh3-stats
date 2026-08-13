import React from "react";
import { Badge, MantineSize, Tooltip } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";

interface FinalStandEnemyBadgeProps {
  size?: MantineSize;
}

/**
 * Marks units which are the AI-controlled enemy side of the Final Stand roster (`hoff_enemy_` in
 * the game files), as opposed to the player-controlled one - see `src/unitStats/finalStand.ts`.
 */
export const FinalStandEnemyBadge = ({ size = "sm" }: FinalStandEnemyBadgeProps) => {
  const { t } = useTranslation("common");

  return (
    <Tooltip label={t("finalStand.enemyTooltip")} multiline w={280} withArrow>
      <Badge
        variant="light"
        color="red"
        size={size}
        style={{ flexShrink: 0 }}
        data-testid="final-stand-enemy-badge"
      >
        {t("finalStand.enemyBadge")}
      </Badge>
    </Tooltip>
  );
};

export default FinalStandEnemyBadge;
