import React from "react";
import { Flex, Image, Text, Title } from "@mantine/core";

type ResourceValues = {
  fuel?: number;
  munition?: number;
  manpower?: number;
  popcap?: number;
};

const ResourceIcons = [
  { icon: "/icons/common/resources/resource_manpower.png", type: "manpower" },
  { icon: "/icons/common/resources/resource_munition.png", type: "munition" },
  { icon: "/icons/common/resources/resource_fuel.png", type: "fuel" },
  { icon: "/icons/common/resources/resource_population.png", type: "popcap" },
] as const;

export const StatsCosts = (costs: ResourceValues) => (
  <>
    <Title order={6} transform="uppercase" color="dimmed">
      Costs
    </Title>
    <Flex key="stats_costs_list" gap="md" mt={4}>
      {ResourceIcons.map(({ icon, type }) => {
        return costs[type] ? (
          <Flex key={type} direction="row" align="center" gap={8}>
            <Image height={24} width={24} fit="contain" src={icon} alt="Test text" />
            <Text color="dimmed">{costs[type]}</Text>
          </Flex>
        ) : (
          <></>
        );
      })}
    </Flex>
  </>
);
