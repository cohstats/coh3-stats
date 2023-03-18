import { Flex, Image, Stack, Text, Title } from "@mantine/core";
import { Fragment } from "react";
import { ResourceValues } from "../../src/unitStats";

const ResourceIcons = [
  { icon: "/icons/common/resources/resource_buildtime_extra.png", type: "time_seconds" },
  { icon: "/icons/common/resources/resource_manpower.png", type: "manpower" },
  { icon: "/icons/common/resources/resource_munition.png", type: "munition" },
  { icon: "/icons/common/resources/resource_fuel.png", type: "fuel" },
  { icon: "/icons/common/resources/resource_population.png", type: "popcap" },
  { icon: "/icons/common/resources/resource_skill_points.png", type: "command" },
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
