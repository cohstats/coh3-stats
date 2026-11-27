import {
  IconBook,
  IconChartBar,
  IconCoins,
  IconCrosshair,
  IconMedal,
  IconTrophy,
} from "@tabler/icons-react";
import { WikiCategoryIcon as WikiCategoryIconName } from "../../../src/wiki/wiki-types";

const ICONS = {
  book: IconBook,
  crosshair: IconCrosshair,
  medal: IconMedal,
  coins: IconCoins,
  trophy: IconTrophy,
  chart: IconChartBar,
};

export const WikiCategoryIcon = ({
  icon,
  size = 18,
}: {
  icon: WikiCategoryIconName;
  size?: number;
}) => {
  const Icon = ICONS[icon];
  return <Icon size={size} stroke={1.7} />;
};
