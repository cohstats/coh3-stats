import { createStyles, Flex, Grid, Group, HoverCard, Text, Title, Tooltip } from "@mantine/core";
import { UnitCostCard } from "./unit-cost-card";
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
  screen_name: string | null;
  /** Locstring value. Found at `help_text/locstring/value`. */
  help_text: string | null;
  /** Locstring value. Found at `extra_text/locstring/value`. */
  extra_text: string | null;
  /** Locstring with formatter variables. Found at `extra_text_formatter`, which list each parameter. */
  extra_text_formatter: string;
  /** Locstring value. Found at `brief_text/locstring/value`. */
  brief_text: string | null;
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
            src={`/icons/${desc.icon_name}.png`}
            alt={desc.screen_name || ""}
            fallbackSrc={iconPlaceholder}
          ></ImageWithFallback>
        </Flex>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Flex direction="column">
          <Title order={6} fz="sm" color="yellow.5" transform="capitalize">
            {desc.help_text}
          </Title>
          <Title order={4} transform="capitalize">
            {desc.screen_name}
          </Title>
          <Text fz="sm" style={{ whiteSpace: "pre-line" }}>
            {desc.brief_text?.replace(/\\r?\\n|\\r|\\n/g, "\n")}
          </Text>
          <Text fz="md" color="yellow.5">
            {desc.extra_text}
          </Text>
        </Flex>
      </HoverCard.Dropdown>
    </HoverCard>
  );

  const desktopView = (
    <>
      <ImageWithFallback
        width={76}
        height={76}
        src={`/icons/${desc.icon_name}.png`}
        alt={desc.screen_name || ""}
        fallbackSrc={iconPlaceholder}
      ></ImageWithFallback>

      <Grid gutter={1} align="stretch">
        <Grid.Col span={12}>
          <Tooltip label={desc.help_text}>
            <Title order={6} transform="capitalize" color="yellow.5" lineClamp={1}>
              {desc.help_text}
            </Title>
          </Tooltip>
        </Grid.Col>

        <Grid.Col span={12}>
          <Tooltip label={desc.screen_name}>
            <Title order={4} transform="capitalize" lineClamp={1}>
              {desc.screen_name}
            </Title>
          </Tooltip>
        </Grid.Col>

        <Grid.Col span={12}>
          <Tooltip
            multiline
            style={{ whiteSpace: "pre-line" }}
            label={desc.brief_text?.replace(/\\r?\\n|\\r|\\n/g, "\n")}
          >
            <Text fz="sm" lineClamp={6} style={{ whiteSpace: "pre-line" }}>
              {desc.brief_text?.replace(/\\r?\\n|\\r|\\n/g, "\n")}
            </Text>
          </Tooltip>
        </Grid.Col>

        <Grid.Col span={12}>
          <Tooltip multiline label={desc.extra_text || desc.extra_text_formatter}>
            <Text fz="sm" lineClamp={3}>
              {desc.extra_text || desc.extra_text_formatter}
            </Text>
          </Tooltip>
        </Grid.Col>
      </Grid>
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
          extra_text_formatter: desc.extra_text_formatter,
          icon_name: desc.icon_name,
        }}
        cfg={cfg}
      ></UnitUpgradeCardHeader>
      {hasCost(time_cost) ? UnitCostCard(time_cost) : <></>}
    </Flex>
  );
};
