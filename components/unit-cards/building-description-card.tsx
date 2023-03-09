import slash from "slash";
import { Card, Divider, Flex, Grid, Image, Stack, Text, Title } from "@mantine/core";
import { UnitDescription, UnitDescriptionCard } from "./unit-description-card";
import { UnitUpgrade } from "./unit-upgrade-card";
import { ResourceValues, StatsCosts } from "./cost-card";
import { BuildingType } from "../../src/coh3";

// const BuildingIcon = [
//   { icon: "support_center", type: "support_center" },
//   { icon: "hq", type: "hq" },
//   { icon: "barracks", type: "production1" },
//   { icon: "weapon_support", type: "production2" },
//   { icon: "motor_pool", type: "production3" },
//   { icon: "tank_depot", type: "production4" },
// ] as const;

type BuildingDescription = {
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

export type BuildingSchema = {
  type: BuildingType;
  desc: BuildingDescription;
  /** Extracted from `ebpextensions\\spawner_ext` within the building `ebps`. */
  units: Array<{ desc: UnitDescription; time_cost: ResourceValues }>;
  /** Extracted from `ebpextensions\\cost_ext` within the building `ebps`. */
  time_cost: ResourceValues;
  /**
   * @todo Do we need this?
   * Extracted from `ebpextensions\\ability_ext` within the building `ebps`.
   */
  abilities?: []; // Unused right now.
  /** Extracted from `ebpextensions\\upgrade_ext` within the building `ebps`. */
  upgrades: UnitUpgrade[];
};

/**
 * @todo Shall we re-use the `unit_upgrade_card` instead? Only change is the
 * icon side. In the meantime, use this in case of new UI requirements for this
 * type of card.
 */
const BuildingCardHeader = (desc: BuildingDescription, cost: ResourceValues) => (
  <Flex
    direction={{ base: "column", sm: "row" }}
    gap={8}
    align={{ base: "initial", sm: "center" }}
    justify="center"
  >
    <Flex direction="row" align="center" gap={16}>
      <Image
        width={96}
        height={96}
        fit="contain"
        src={`/icons/${slash(desc.icon_name)}.png`}
        alt={desc.screen_name}
      />
      <Flex direction="column" gap={4}>
        <Title order={4} transform="capitalize" lineClamp={1}>
          {desc.screen_name}
        </Title>
        <Text fz="md" lineClamp={2} color="yellow.5">
          {desc.extra_text}
        </Text>
        <Text fz="sm" lineClamp={2}>
          {desc.brief_text}
        </Text>
        <Text fz="sm" lineClamp={1}>
          {desc.help_text}
        </Text>
      </Flex>
    </Flex>
    <Divider mt={8}></Divider>
    <Divider orientation="vertical" mr={8}></Divider>
    <Stack>
      <Flex direction="row" justify="space-between">
        <Flex direction="row" gap={4}>
          {/* <Image
            height={24}
            width={24}
            fit="contain"
            src="/icons/common/orders/reinforce.png"
            alt="Health"
          /> */}
          <Text weight="bold">Health</Text>
        </Flex>
        <Text ml={24}>{3000.0}</Text>
      </Flex>

      <StatsCosts
        manpower={cost.manpower}
        fuel={cost.fuel}
        time_seconds={cost.time_seconds}
      ></StatsCosts>
    </Stack>
  </Flex>
);

const BuildingUnitMapper = (units: BuildingSchema["units"]) => {
  if (!units.length) return <></>;
  return (
    <Grid columns={1}>
      {units.map(({ desc, time_cost }) => {
        return (
          <Grid.Col key={desc.id} span={1}>
            <Card p="lg" radius="md" withBorder>
              {UnitDescriptionCard(desc)}
              {StatsCosts(time_cost)}
            </Card>
          </Grid.Col>
        );
      })}
    </Grid>
  );
};

export const BuildingCard = ({ desc, units, time_cost }: BuildingSchema) => (
  <>
    <Stack>
      {BuildingCardHeader(desc, time_cost)}

      <Divider></Divider>

      <Stack justify="center">
        <Title order={4}>Produces</Title>
        {BuildingUnitMapper(units)}
      </Stack>
    </Stack>
  </>
);
