import slash from "slash";
import { createStyles, Flex, Group, HoverCard, Text, Title, Tooltip } from "@mantine/core";
import { StatsCosts } from "./cost-card";
import ImageWithFallback, { iconPlaceholder } from "../placeholders";
import { hasCost, ResourceValues } from "../../src/unitStats";

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

export type UnitUpgrade = {
  id: string;
  desc: UnitUpgradeDescription;
  /**
   * Map the `time_cost` object to display the upgrade cost (time, resources)
   * with the `StatsCosts` card.
   */
  time_cost: ResourceValues;
  /** Extra configs for switching views. */
  cfg?: {
    // Enable Compact mode.
    compact?: boolean;
  };
};

const useStyles = createStyles((theme) => ({
  hiddenDesktop: {
    [theme.fn.largerThan("md")]: {
      display: "none",
    },
  },
  hiddenMobile: {
    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },
}));

const UnitUpgradeCardHeader = ({ desc, cfg }: Pick<UnitUpgrade, "desc" | "cfg">) => {
  const { classes } = useStyles();

  const mobileView = (
    <HoverCard position="top" width={280} shadow="md" withArrow>
      <HoverCard.Target>
        <Flex direction="column" align="center">
          <ImageWithFallback
            width={64}
            height={64}
            src={`/icons/${slash(desc.icon_name)}.png`}
            alt={desc.screen_name}
            fallbackSrc={iconPlaceholder}
          ></ImageWithFallback>
        </Flex>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Flex direction="column">
          <Title order={4} transform="capitalize">
            {desc.screen_name}
          </Title>
          <Text fz="md" color="yellow.5">
            {desc.extra_text}
          </Text>
          <Text fz="sm">{desc.brief_text}</Text>
          <Text fz="sm">{desc.help_text}</Text>
        </Flex>
      </HoverCard.Dropdown>
    </HoverCard>
  );

  const desktopView = (
    <>
      <ImageWithFallback
        width={76}
        height={76}
        src={`/icons/${slash(desc.icon_name)}.png`}
        alt={desc.screen_name}
        fallbackSrc={iconPlaceholder}
      ></ImageWithFallback>

      <Flex direction="column">
        <Tooltip label={desc.screen_name}>
          <Title order={4} transform="capitalize" lineClamp={1}>
            {desc.screen_name}
          </Title>
        </Tooltip>
        <Tooltip label={desc.extra_text}>
          <Text fz="md" lineClamp={1} color="yellow.5">
            {desc.extra_text}
          </Text>
        </Tooltip>
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
    </>
  );

  if (cfg?.compact) {
    return (
      <>
        <Group className={classes.hiddenDesktop} grow>
          {mobileView}
        </Group>
        <Flex className={classes.hiddenMobile} direction="row" align="center" gap={16}>
          {desktopView}
        </Flex>
      </>
    );
  }

  return (
    <>
      <Flex direction="row" align="center" gap={16}>
        {desktopView}
      </Flex>
    </>
  );
};

export const UnitUpgradeCard = ({ desc, time_cost, cfg }: UnitUpgrade) => {
  return (
    <Flex direction="column" gap={16}>
      <UnitUpgradeCardHeader
        desc={{
          screen_name: desc.screen_name,
          help_text: desc.help_text,
          brief_text: desc.brief_text,
          extra_text: desc.extra_text,
          icon_name: desc.icon_name,
        }}
        cfg={cfg}
      ></UnitUpgradeCardHeader>
      {hasCost(time_cost) ? (
        <StatsCosts
          manpower={time_cost.manpower}
          munition={time_cost.munition}
          fuel={time_cost.fuel}
          popcap={time_cost.popcap}
          time_seconds={time_cost.time_seconds}
          command={time_cost.command}
        ></StatsCosts>
      ) : (
        <></>
      )}
    </Flex>
  );
};
