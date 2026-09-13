import { DefaultMantineColor, Flex, Grid, Image, Stack, Text, Title } from "@mantine/core";

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

export const StatsVehicleArmor = (
  cfg: StatsVehicleInput,
  title = "Vehicle Armor",
  hint = "Refers to the ingame armor critical blueprint.",
) => (
  <Stack gap="xs">
    <Flex direction="row" gap={8} align="center">
      <Title order={6} style={{ textTransform: "uppercase" }}>
        {title}
      </Title>
      <Text fz="xs" fs="italic" c="dimmed" style={{ textTransform: "capitalize" }}>
        ({hint})
      </Text>
    </Flex>
    <Flex
      direction={{ base: "column", sm: "row" }}
      align="center"
      justify={{ base: "center", sm: "space-between" }}
      gap="md"
    >
      <Image
        h={128}
        w={256}
        fit="contain"
        src={`/icons/hud/vehicle_criticals/${cfg.type}.png`}
        alt="Vehicle Type"
      />
      <Stack gap={4} w="100%" maw={{ sm: 280 }}>
        <Text
          fz="xs"
          fw={700}
          style={{ textTransform: "capitalize" }}
          c={VehicleTypeColor[cfg.type]}
        >
          {cfg.type?.split("_").join(" ")}
        </Text>
        {generateArmorRow(cfg.armorValues)}
      </Stack>
    </Flex>
  </Stack>
);

const generateArmorRow = (armorValues: VehicleArmor) => {
  return VehicleArmorCover.map(({ icon, armor }) => {
    return (
      <Grid key={`vehicle_armor_${armor}`} fz="xs" align="center" columns={3} grow>
        <Grid.Col span={2}>
          <Flex direction="row" align="center" gap={8}>
            <Image h={24} w={24} fit="contain" src={icon} alt={`${armor} armor`} />
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
