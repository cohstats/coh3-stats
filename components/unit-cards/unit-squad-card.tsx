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
  // Get the default weapon max range value.
  range: {
    max: number;
  };
  sight: {
    coneAngle: number;
    outerRadius: number;
  };
  moving: {
    acceleration: number;
    deceleration: number;
    defaultSpeed: number;
    maxSpeed: number;
  };
  capture: {
    cap: number;
    decap: number;
  };
};

const uniformIconSize = {
  width: 20,
  height: 20,
};

const UnitSquadIcons = {
  sight_range: "/icons/unit_status/bw2/5_obervationmode.png",
  max_speed: "/icons/unit_status/bw2/2_offensivebonus.png",
  target_size: "/icons/unit_status/bw2/9_markedtarget.png",
  infantry_armor: "/icons/unit_status/bw2/3_defensivebonus.png",
  range_of_fire: "/icons/unit_status/bw2/artillery_radio_beacon.png",
  sprint: "/icons/unit_status/bw2/sprint.png",
  acceleration: "/icons/unit_status/bw2/12_speedbonus.png",
  deceleration: "/icons/races/common/abilities/handbrake_on.png",
  cap_mult: "/icons/unit_status/bw2/11_capturebonus.png",
  decap_mult: "/icons/unit_status/bw2/10_retreatpoint.png",
} as const;

export const UnitSquadCard = ({
  id,
  capture,
  sight,
  range,
  moving,
  health,
  ui,
  type,
}: UnitSquadInput) => {
  return (
    <Stack>
      <Stack gap={4}>
        <Title order={6} style={{ textTransform: "uppercase" }}>
          {id}
        </Title>
        <Text c="yellow.5" style={{ textTransform: "capitalize" }}>
          {type}
        </Text>
      </Stack>
      <Grid fz="sm" columns={12} align="center" gutter="lg">
        <Grid.Col span={{ base: 6, md: 4 }}>
          <Flex gap={4} align="center" justify="space-between">
            <Group gap={4} align="center">
              <ImageWithFallback
                {...uniformIconSize}
                fallbackSrc={symbolPlaceholder}
                src={UnitSquadIcons["sight_range"]}
                alt="squad sight range"
              ></ImageWithFallback>
              <Text>Sight Range</Text>
            </Group>
            <Text style={{ textAlign: "end" }}>{sight?.outerRadius || 0.0}</Text>
          </Flex>
        </Grid.Col>

        <Grid.Col span={{ base: 6, md: 4 }}>
          <Flex gap={4} align="center" justify="space-between">
            <Group gap={4} align="center">
              <ImageWithFallback
                {...uniformIconSize}
                fallbackSrc={symbolPlaceholder}
                src={type === "vehicles" ? UnitSquadIcons["max_speed"] : UnitSquadIcons["sprint"]}
                alt="squad default speed"
              />
              <Text>Speed</Text>
            </Group>
            <Text style={{ textAlign: "end" }}>{moving?.defaultSpeed || 0.0}</Text>
          </Flex>
        </Grid.Col>

        {type === "vehicles" ? (
          <Grid.Col span={{ base: 6, md: 4 }}>
            <Flex gap={4} align="center" justify="space-between">
              <Group gap={4} align="center">
                <ImageWithFallback
                  {...uniformIconSize}
                  fallbackSrc={symbolPlaceholder}
                  src={UnitSquadIcons["acceleration"]}
                  alt="squad acceleration"
                />
                <Text>Acceleration</Text>
              </Group>
              <Text style={{ textAlign: "end" }}>{moving?.acceleration || 0.0}</Text>
            </Flex>
          </Grid.Col>
        ) : (
          <></>
        )}

        {type === "vehicles" ? (
          <Grid.Col span={{ base: 6, md: 4 }}>
            <Flex gap={4} align="center" justify="space-between">
              <Group gap={4} align="center">
                <ImageWithFallback
                  {...uniformIconSize}
                  fallbackSrc={symbolPlaceholder}
                  src={UnitSquadIcons["deceleration"]}
                  alt="squad deceleration"
                />
                <Text>Deceleration</Text>
              </Group>
              <Text style={{ textAlign: "end" }}>{moving?.deceleration || 0.0}</Text>
            </Flex>
          </Grid.Col>
        ) : (
          <></>
        )}

        <Grid.Col span={{ base: 6, md: 4 }}>
          <Flex gap={4} align="center" justify="space-between">
            <Group gap={4} align="center">
              <ImageWithFallback
                {...uniformIconSize}
                fallbackSrc={symbolPlaceholder}
                src={UnitSquadIcons["range_of_fire"]}
                alt="squad max range of fire"
              />
              <Text>Max Range</Text>
            </Group>
            <Text style={{ textAlign: "end" }}>{range?.max || 0}</Text>
          </Flex>
        </Grid.Col>

        <Grid.Col span={{ base: 6, md: 4 }}>
          <Flex gap={4} align="center" justify="space-between">
            <Group gap={4} align="center">
              <ImageWithFallback
                {...uniformIconSize}
                fallbackSrc={symbolPlaceholder}
                src={UnitSquadIcons["target_size"]}
                alt="squad target size"
              />
              <Text>Target Size</Text>
            </Group>
            <Text style={{ textAlign: "end" }}>{health?.targetSize || 0}</Text>
          </Flex>
        </Grid.Col>

        {type !== "vehicles" ? (
          <Grid.Col span={4}>
            <Flex gap={4} align="center" justify="space-between">
              <Group gap={4} align="center">
                <ImageWithFallback
                  {...uniformIconSize}
                  fallbackSrc={symbolPlaceholder}
                  src={UnitSquadIcons["infantry_armor"]}
                  alt="squad armor (infantry only)"
                />
                <Text>Armor</Text>
              </Group>
              <Text style={{ textAlign: "end" }}>{health?.armor || 0}</Text>
            </Flex>
          </Grid.Col>
        ) : (
          <></>
        )}

        <Grid.Col span={{ base: 6, md: 4 }}>
          <Flex gap={4} align="center" justify="space-between">
            <Group gap={4} align="center">
              <ImageWithFallback
                {...uniformIconSize}
                fallbackSrc={symbolPlaceholder}
                src={UnitSquadIcons["cap_mult"]}
                alt="squad capture rate multiplier"
              />
              <Text>Capture Multiplier</Text>
            </Group>
            <Text style={{ textAlign: "end" }}>{capture?.cap || 0.0}</Text>
          </Flex>
        </Grid.Col>

        <Grid.Col span={{ base: 6, md: 4 }}>
          <Flex gap={4} align="center" justify="space-between">
            <Group gap={4} align="center">
              <ImageWithFallback
                {...uniformIconSize}
                fallbackSrc={symbolPlaceholder}
                src={UnitSquadIcons["decap_mult"]}
                alt="squad decapture rate multiplier"
              />
              <Text>Decapture Multiplier</Text>
            </Group>
            <Text style={{ textAlign: "end" }}>{capture?.decap || 0.0}</Text>
          </Flex>
        </Grid.Col>
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
