import { DefaultMantineColor, Flex, Grid, Image, Text, Title } from "@mantine/core";

/**
 * Vehicle type, found within `ebps` -> `ebpextensions\\type_ext` ->
 * `unit_type_list`.
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
  medium_tank: "orange.5",
  light_tank: "yellow.5",
  light_halftrack: "lime.5",
  light_armoured_car: "indigo.5",
  ultra_light_carrier: "blue.5",
} as const;

const VehicleArmorCover = [
  { icon: "/icons/common/cover/heavy.png", armor: "frontal" },
  { icon: "/icons/common/cover/light.png", armor: "side" },
  { icon: "/icons/common/cover/negative.png", armor: "rear" },
] as const;

export const StatsVehicleArmor = (cfg: StatsVehicleInput) => (
  <>
    <Flex direction="column">
      <Title order={6} transform="uppercase">
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
        src={`/icons/hud/vehicle_criticals/${cfg.type}.png`}
        alt="Vehicle Type"
      />
      {generateArmorRow(cfg.armorValues)}
    </Flex>
  </>
);

function generateArmorRow(armorValues: VehicleArmor) {
  return VehicleArmorCover.map(({ icon, armor }) => {
    return (
      <Grid key={`vehicle_armor_${armor}`} fz="xs" align="center" columns={3} grow>
        <Grid.Col span={2}>
          <Flex key={armor} direction="row" align="center" gap={8}>
            <Image height={24} width={24} fit="contain" src={icon} alt="Frontal Armor" />
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
