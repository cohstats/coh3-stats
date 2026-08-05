import React from "react";
import { Badge, MantineSize, Tooltip } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";

interface FinalStandBadgeProps {
  size?: MantineSize;
  /** Weapons get a slightly different explanation than units. */
  type?: "unit" | "weapon";
  /** Set to false when the badge sits inside an element which already has a tooltip. */
  withTooltip?: boolean;
}

/**
 * Marks units / weapons which come from the Final Stand DLC (`hoff` in the game files). Those are
 * not available in the standard skirmish / multiplayer game, see `src/unitStats/finalStand.ts`.
 */
export const FinalStandBadge = ({
  size = "sm",
  type = "unit",
  withTooltip = true,
}: FinalStandBadgeProps) => {
  const { t } = useTranslation("common");

  const badge = (
    <Badge
      variant="light"
      color="teal"
      size={size}
      style={{ flexShrink: 0 }}
      data-testid="final-stand-badge"
    >
      {t("finalStand.badge")}
    </Badge>
  );

  if (!withTooltip) return badge;

  return (
    <Tooltip
      label={t(type === "weapon" ? "finalStand.weaponTooltip" : "finalStand.unitTooltip")}
      multiline
      w={280}
      withArrow
    >
      {badge}
    </Tooltip>
  );
};

export default FinalStandBadge;
