import { Group, Tooltip } from "@mantine/core";
import { useTranslation } from "next-i18next/pages";
import LinkWithOutPrefetch from "./LinkWithOutPrefetch";
import FactionIcon from "./faction-icon";
import { localizedNames } from "../src/coh3/coh3-data";
import type { raceType } from "../src/coh3/coh3-types";
import classes from "./faction-switch.module.css";

interface FactionSwitchProps {
  races: readonly raceType[];
  activeRace: raceType;
  /** Route of the given faction's version of the current page. */
  getHref: (race: raceType) => string;
  /** Overrides the default tooltip - use when the page needs more specific wording. */
  getTooltipLabel?: (race: raceType) => string;
  iconSize?: number;
  /** `data-testid` of each faction link is `${testIdPrefix}${race}`. */
  testIdPrefix?: string;
}

/** Links to the other factions' version of the current page - swaps the faction, keeps the page. */
export const FactionSwitch = ({
  races,
  activeRace,
  getHref,
  getTooltipLabel,
  iconSize = 30,
  testIdPrefix = "faction-switch-",
}: FactionSwitchProps) => {
  const { t } = useTranslation("common");

  return (
    <Group gap={4}>
      {races.map((race) => (
        <Tooltip
          key={race}
          label={
            getTooltipLabel
              ? getTooltipLabel(race)
              : t("faction.switchTooltip", { faction: localizedNames[race] })
          }
          withArrow
        >
          <LinkWithOutPrefetch
            href={getHref(race)}
            className={`${classes.factionButton} ${
              race === activeRace ? classes.factionButtonActive : ""
            }`}
            aria-label={localizedNames[race]}
            data-testid={`${testIdPrefix}${race}`}
          >
            <FactionIcon name={race} width={iconSize} />
          </LinkWithOutPrefetch>
        </Tooltip>
      ))}
    </Group>
  );
};

export default FactionSwitch;
