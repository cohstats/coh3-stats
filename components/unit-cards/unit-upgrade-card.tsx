import slash from "slash";
import { Flex, Image, Text, Title, Tooltip } from "@mantine/core";
import { ResourceValues, StatsCosts } from "./cost-card";

/**
 * These fields can be found at `sbps` inside each unit object.
 *
 * - All the upgrade references are under `squadexts` -> `template_reference`
 *   which gives the group within the Essence editor as
 *   `sbpextensions\\squad_upgrade_ext`.
 * - The sibling `upgrades` contains a list with an object
 *   `upgrade/instance_reference`. In this value the reference to `upgrade`
 *   attributes can be found.
 *
 * Specific paths defined per property.
 *
 * NOTES:
 * - The `symbol_icon_name` is the same as the `icon_name`, hence not required.
 */
type UnitUpgradeDescription = {
  /** Locstring value. Found at `screen_name/locstring/value`. */
  screen_name: string;
  /** Locstring value. Found at `help_text/locstring/value`. */
  help_text: string;
  /** Locstring value. Found at `extra_text/locstring/value`. */
  extra_text: string;
  /** Locstring value. Found at `brief_text/locstring/value`. */
  brief_text: string;
  /** File path. Found at `icon_name`. */
  icon_name: string;
};

type UnitUpgrade = {
  desc: UnitUpgradeDescription;
  /**
   * Map the `time_cost` object to display the upgrade cost (time, resources)
   * with the `StatsCosts` card.
   */
  time_cost: ResourceValues;
};

const UnitUpgradeCardHeader = (desc: UnitUpgradeDescription) => (
  <>
    <Flex direction="row" align="center" gap={16}>
      <Image
        width={64}
        height={64}
        fit="contain"
        src={`/icons/${slash(desc.icon_name)}.png`}
        alt={desc.screen_name}
      ></Image>
      <Flex direction="column">
        <Tooltip label={desc.screen_name}>
          <Title order={4} transform="capitalize" lineClamp={1}>
            {desc.screen_name}
          </Title>
        </Tooltip>
        <Text fz="md" lineClamp={2} color="yellow.5">
          {desc.extra_text}
        </Text>
        <Tooltip label={desc.brief_text}>
          <Text fz="sm" lineClamp={1}>
            {desc.brief_text}
          </Text>
        </Tooltip>
        <Tooltip label={desc.help_text}>
          <Text fz="sm" lineClamp={1}>
            {desc.help_text}
          </Text>
        </Tooltip>
      </Flex>
    </Flex>
  </>
);

export const UnitUpgradeCard = ({ desc, time_cost }: UnitUpgrade) => (
  <>
    <Flex direction="column" gap={16}>
      <UnitUpgradeCardHeader
        screen_name={desc.screen_name}
        help_text={desc.help_text}
        brief_text={desc.brief_text}
        extra_text={desc.extra_text}
        icon_name={desc.icon_name}
      ></UnitUpgradeCardHeader>
      <StatsCosts
        manpower={time_cost.manpower}
        munition={time_cost.munition}
        fuel={time_cost.fuel}
        time_seconds={time_cost.time_seconds}
      ></StatsCosts>
    </Flex>
  </>
);
