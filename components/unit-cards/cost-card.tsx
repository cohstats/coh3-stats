import { Flex, Image, Stack, Text, Title } from "@mantine/core";
import { Fragment } from "react";

/**
 * These fields can be found at `ebps` / `upgrade` inside each entity object.
 *
 * - For the units, look at `ebps` -> `exts` -> `template_reference` which gives
 *   the group within the Essence editor as `ebpextensions\\cost_ext`.
 * - For the upgrades, look at `upgrade` -> `upgrade_bag`.
 *
 * For both entities, the field is called `time_cost`.
 */
export type ResourceValues = {
  /** Value at `cost/fuel`. */
  fuel?: number;
  /** Value at `cost/munition`. */
  munition?: number;
  /** Value at `cost/munition`. */
  manpower?: number;
  /** Value at `cost/popcap`. */
  popcap?: number;
  /** Value at `time_seconds`. */
  time_seconds?: number;
};

const ResourceIcons = [
  { icon: "/icons/common/resources/resource_buildtime_extra.png", type: "time_seconds" },
  { icon: "/icons/common/resources/resource_manpower.png", type: "manpower" },
  { icon: "/icons/common/resources/resource_munition.png", type: "munition" },
  { icon: "/icons/common/resources/resource_fuel.png", type: "fuel" },
  { icon: "/icons/common/resources/resource_population.png", type: "popcap" },
] as const;

export const StatsCosts = (costs: ResourceValues) => (
  <>
    <Stack spacing={0}>
      <Title order={6} transform="uppercase">
        Costs
      </Title>
      <Flex key="stats_costs_list" align="center" gap={16} mt={4}>
        {ResourceIcons.map(({ icon, type }) => {
          return costs[type] ? (
            <Flex key={type} direction="row" align="center" gap={4}>
              <Image height={24} width={24} fit="contain" src={icon} alt="Test text" />
              <Text>{costs[type]}</Text>
            </Flex>
          ) : (
            <Fragment key={type}></Fragment>
          );
        })}
      </Flex>
    </Stack>
  </>
);
