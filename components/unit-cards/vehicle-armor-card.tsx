import { DefaultMantineColor, Flex, Grid, Image, Text, Title } from "@mantine/core";

/**
 * Armor type, found within `sbps` ->
 * `sbpextensions\\squad_ui_ext\race_list\race_data\info` ->
 * `ui_armor_info\armor_icon`.
 */
export type VehicleArmorType =
  | "heavy_tank"
  | "medium_tank"
  | "light_tank"
  | "light_halftrack"
  | "light_armoured_car"
  | "ultra_light_carrier"
  | "ultra_light_motorcycle";

type VehicleArmor = {
  frontal: number;
  side: number;
  rear: number;
};

type StatsVehicleInput = {
  type: VehicleArmorType;
  armorValues: VehicleArmor;
};

const VehicleTypeColor: Record<VehicleArmorType, DefaultMantineColor> = {
  heavy_tank: "red.5",
  medium_tank: "orange.5",
  light_tank: "yellow.5",
  light_halftrack: "lime.5",
  light_armoured_car: "indigo.5",
  ultra_light_carrier: "blue.5",
  ultra_light_motorcycle: "violet.5",
} as const;

const VehicleArmorCover = [
  { icon: "/icons/common/cover/heavy.png", armor: "frontal" },
  { icon: "/icons/common/cover/light.png", armor: "side" },
  { icon: "/icons/common/cover/negative.png", armor: "rear" },
] as const;

export const StatsVehicleArmor = (cfg: StatsVehicleInput, title = "Vehicle Armor") => (
  <>
    <Flex direction="column">
      <Title order={6} style={{ textTransform: "uppercase" }}>
        {title}
      </Title>
      <Text
        fz="xs"
        fw={700}
        style={{ textTransform: "capitalize" }}
        c={VehicleTypeColor[cfg.type]}
      >
        {cfg.type.split("_").join(" ")}
      </Text>
    </Flex>
    <Flex direction="column" justify={"center"} mt={12}>
      {/*There is some mantine bug with this image I can't figure out what is wrong*/}
      <Flex justify={"center"}>
        <Image
          mb={12}
          h={128}
          w={256}
          fit="contain"
          src={`/icons/hud/vehicle_criticals/${cfg.type}.png`}
          alt="Vehicle Type"
        />
      </Flex>
      {generateArmorRow(cfg.armorValues)}
    </Flex>
  </>
);

const generateArmorRow = (armorValues: VehicleArmor) => {
  return VehicleArmorCover.map(({ icon, armor }) => {
    return (
      <Grid key={`vehicle_armor_${armor}`} fz="xs" align="center" columns={3} grow>
        <Grid.Col span={2}>
          <Flex key={armor} direction="row" align="center" gap={8}>
            <Image h={24} w={24} fit="contain" src={icon} alt="Frontal Armor" />
            <Text style={{ textTransform: "uppercase" }}>{armor}</Text>
          </Flex>
        </Grid.Col>
        <Grid.Col span={1}>
          <Text style={{ textAlign: "end" }}>{armorValues[armor]}</Text>
        </Grid.Col>
      </Grid>
    );
  });
};
