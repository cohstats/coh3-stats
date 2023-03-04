import React from "react";
import { Flex, Image, Text } from "@mantine/core";
import ManpowIcon from "../public/icons/resources/resource_manpower_mip0.png";
import FuelIcon from "../public/icons/resources/resource_fuel_mip0.png";
import AmmoIcon from "../public/icons/resources/resource_munition_mip0.png";
import PopIcon from "../public/icons/resources/resource_population_mip0.png";

type ResourceType = "manpower" | "ammo" | "fuel" | "pop";

const StatsNames: ResourceType[] = ["manpower", "ammo", "fuel", "pop"];

type ResourceValue = {
  fuel?: number;
  ammo?: number;
  manpower?: number;
  pop?: number;
};

export const StatCosts = (costs: ResourceValue) => (
  <>
    <Text fz="xs" fw={700} transform="uppercase" color="dimmed">
      Costs
    </Text>
    <Flex gap="md" mt={4}>
      {StatsNames.map((type) => {
        return costs[type] ? (
          <Flex key={type} direction="row" align="center" gap={8}>
            <Image
              height={24}
              width={24}
              fit="contain"
              src={loadResourceIcon(type).src}
              alt="Test text"
            />
            <Text color="dimmed">{costs[type]}</Text>
          </Flex>
        ) : (
          <></>
        );
      })}
    </Flex>
  </>
);

function loadResourceIcon(type: ResourceType) {
  switch (type) {
    case "manpower":
      return ManpowIcon;
    case "ammo":
      return AmmoIcon;
    case "fuel":
      return FuelIcon;
    case "pop":
      return PopIcon;
  }
}
