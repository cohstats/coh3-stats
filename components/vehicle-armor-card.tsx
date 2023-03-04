import React from "react";
import { DefaultMantineColor, Flex, Grid, Image, Text, Title } from "@mantine/core";
import HeavyTank from "../public/icons/vehicle_critical/heavy_tank.png";
import MediumTank from "../public/icons/vehicle_critical/medium_tank.png";
import LightTank from "../public/icons/vehicle_critical/light_tank.png";
import LightHalftrack from "../public/icons/vehicle_critical/light_halftrack.png";
import LightArmouredCard from "../public/icons/vehicle_critical/medium_tank.png";
import UltraLightCarrier from "../public/icons/vehicle_critical/medium_tank.png";

import HeavyCover from "../public/icons/cover/heavy_mip0.png";
import LightCover from "../public/icons/cover/light_mip0.png";
import NegativeCover from "../public/icons/cover/negative_mip0.png";

/**
 * Temporary type. Should be changed with the correct vehicle types from in-game
 * data.
 */
type VehicleType =
  | "heavy_tank"
  | "medium_tank"
  | "light_tank"
  | "light_halftrack"
  | "light_armoured_car"
  | "ultra_light_carrier";

type VehicleArmor = {
  frontal: number;
  side: number;
  rear: number;
};

type StatsVehicleInput = {
  type: VehicleType;
  armorValues: VehicleArmor;
};

const VehicleTypeColor: Record<VehicleType, DefaultMantineColor> = {
  heavy_tank: "red.5",
  medium_tank: "orange.4",
  light_tank: "yellow.4",
  light_halftrack: "lime.4",
  light_armoured_car: "indigo.4",
  ultra_light_carrier: "blue.4",
} as const;

const VehicleArmorCover = [
  { cover: HeavyCover, armor: "frontal" },
  { cover: LightCover, armor: "side" },
  { cover: NegativeCover, armor: "rear" },
] as const;

export const StatsVehicleArmor = (cfg: StatsVehicleInput) => (
  <>
    <Flex direction="column">
      <Title order={6} transform="uppercase" color="dimmed">
        Vehicle Armor
      </Title>
      <Text fz="xs" fw={700} transform="capitalize" color={VehicleTypeColor[cfg.type]}>
        {cfg.type.split("_").join(" ")}
      </Text>
    </Flex>
    <Flex direction="column" mt={12}>
      <Image
        mb={12}
        height={128}
        fit="contain"
        src={loadVehicleBlueprint(cfg.type).src}
        alt="Vehicle Type"
      />
      {generateArmorRow(cfg.armorValues)}
    </Flex>
  </>
);

function generateArmorRow(armorValues: VehicleArmor) {
  return VehicleArmorCover.map(({ cover, armor }) => {
    return (
      <Grid key={`vehicle_armor_${armor}`} fz="xs" align="center" columns={3} grow>
        <Grid.Col span={2}>
          <Flex key={armor} direction="row" align="center" gap={8}>
            <Image height={24} width={24} fit="contain" src={cover.src} alt="Frontal Armor" />
            <Text transform="capitalize">{armor}</Text>
          </Flex>
        </Grid.Col>
        <Grid.Col span={1}>
          <Text align="end">{armorValues[armor]}</Text>
        </Grid.Col>
      </Grid>
    );
  });
}

function loadVehicleBlueprint(type: VehicleType) {
  switch (type) {
    case "heavy_tank":
      return HeavyTank;
    case "medium_tank":
      return MediumTank;
    case "light_tank":
      return LightTank;
    case "light_halftrack":
      return LightHalftrack;
    case "light_armoured_car":
      return LightArmouredCard;
    case "ultra_light_carrier":
      return UltraLightCarrier;
  }
}
