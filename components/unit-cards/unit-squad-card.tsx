import { Flex, Grid, Group, Stack, Text, Title } from "@mantine/core";
import ImageWithFallback, { symbolPlaceholder } from "../placeholders";
import { StatsVehicleArmor, VehicleArmorType } from "./vehicle-armor-card";

// So have to split and make another card for the squad info like Sight Range,
// Speed (walking, driving), Range of Fire, Reload Time (for tanks), Armor
// (infantry)

// Plus the unkeep costs per minute (another card, below cost card), which
// probably requires a calculation, need to check

type UnitSquadInput = {
  id: string;
  ui: {
    armorIcon: string;
  };
  health: {
    /** Only applies to infantry. Zero by default. */
    armor: number;
    frontal: number;
    rear: number;
    side: number;
    targetSize: number;
  };
  type: string;
  sight: {
    coneAngle: number;
    outerRadius: number;
  };
  moving: {
    defaultSpeed: number;
    maxSpeed: number;
  };
};

const UnitSquadIcons = {
  sight_range: "/icons/common/units/symbols/spotter.png",
  max_speed: "/icons/common/units/symbols/unit_aef_vehicle_crew_symbol.png",
  target_size: "/icons/common/units/symbols/flag_null_symbol.png",
  infantry_armor: "/icons/common/units/symbols/unit_soviet_shock_symbol.png",
} as const;

export const UnitSquadCard = ({ id, sight, moving, health, ui, type }: UnitSquadInput) => {
  return (
    <Stack>
      <Stack spacing={4}>
        <Title order={6} transform="uppercase">
          {id}
        </Title>
        <Text color="yellow.5" transform="capitalize">
          {type}
        </Text>
      </Stack>
      <Grid fz="sm" columns={12} align="center" gutter="xs">
        <Grid.Col span={4}>
          <Flex gap={4} align="center" justify="space-between">
            <Group spacing={4}>
              <ImageWithFallback
                height={32}
                width={32}
                fallbackSrc={symbolPlaceholder}
                src={UnitSquadIcons["sight_range"]}
                alt="squad sight range"
              ></ImageWithFallback>
              <Text>Sight Range</Text>
            </Group>
            <Text align="end">{sight?.outerRadius || 0.0}</Text>
          </Flex>
        </Grid.Col>

        <Grid.Col span={4}>
          <Flex gap={4} align="center" justify="space-between">
            <Group spacing={4}>
              <ImageWithFallback
                height={32}
                width={32}
                fallbackSrc={symbolPlaceholder}
                src={UnitSquadIcons["max_speed"]}
                alt="squad speed range"
              ></ImageWithFallback>
              <Text>Speed</Text>
            </Group>
            <Text align="end">{moving?.defaultSpeed || 0.0}</Text>
          </Flex>
        </Grid.Col>

        <Grid.Col span={4}>
          <Flex gap={4} align="center" justify="space-between">
            <Group spacing={4}>
              <ImageWithFallback
                height={32}
                width={32}
                fallbackSrc={symbolPlaceholder}
                src={UnitSquadIcons["target_size"]}
                alt="squad target size"
              ></ImageWithFallback>
              <Text>Target Size</Text>
            </Group>
            <Text align="end">{health?.targetSize || 0}</Text>
          </Flex>
        </Grid.Col>

        {type !== "vehicles" ? (
          <Grid.Col span={4}>
            <Flex gap={4} align="center" justify="space-between">
              <Group spacing={4}>
                <ImageWithFallback
                  height={32}
                  width={32}
                  fallbackSrc={symbolPlaceholder}
                  src={UnitSquadIcons["infantry_armor"]}
                  alt="squad armor (infantry only)"
                ></ImageWithFallback>
                <Text>Armor</Text>
              </Group>
              <Text align="end">{health?.armor || 0}</Text>
            </Flex>
          </Grid.Col>
        ) : (
          <></>
        )}
      </Grid>

      {type === "vehicles" ? (
        StatsVehicleArmor({
          type: ui.armorIcon as VehicleArmorType,
          armorValues: health,
        })
      ) : (
        <></>
      )}
    </Stack>
  );
};
