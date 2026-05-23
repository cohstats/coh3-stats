import { Flex, Grid, Group, Stack, Text, Title } from "@mantine/core";
import ImageWithFallback, { symbolPlaceholder } from "../placeholders";
import { StatsVehicleArmor, VehicleArmorType } from "./vehicle-armor-card";
import { useTranslation } from "next-i18next";

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
    tp_global: number;
  };
  moving: {
    acceleration: number;
    deceleration: number;
    defaultSpeed: number;
    maxSpeed: number;
    rotation: number;
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

type StatItemProps = {
  icon: string;
  alt: string;
  label: string;
  value: string | number;
  show?: boolean;
};

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
  const { t } = useTranslation(["explorer"]);

  const StatItem = ({
    icon,
    alt,
    label,
    value,
    show = true,
  }: {
    icon: string;
    alt: string;
    label: string;
    value: string | number;
    show?: boolean;
  }) => {
    if (!show) return null;

    return (
      <Grid.Col span={{ base: 6, md: 4 }}>
        <Flex gap={4} align="center" justify="space-between">
          <Group gap={4} align="center">
            <ImageWithFallback
              {...uniformIconSize}
              fallbackSrc={symbolPlaceholder}
              src={icon}
              alt={alt}
            />
            <Text>{label}</Text>
          </Group>
          <Text style={{ textAlign: "end" }}>{value}</Text>
        </Flex>
      </Grid.Col>
    );
  };

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
        <StatItem
          icon={UnitSquadIcons["sight_range"]}
          alt="squad sight range"
          label={t("statsCard.sightRange")}
          value={sight?.outerRadius ?? 0}
        />

        <StatItem
          icon={UnitSquadIcons["sight_range"]}
          alt="squad detection range"
          label={t("statsCard.detection")}
          value={sight?.tp_global ?? 0}
        />

        <StatItem
          icon={UnitSquadIcons["range_of_fire"]}
          alt="squad max range of fire"
          label={t("statsCard.maxRange")}
          value={range?.max ?? 0}
        />

        <StatItem
          icon={type === "vehicles" ? UnitSquadIcons["max_speed"] : UnitSquadIcons["sprint"]}
          alt="squad default speed"
          label={t("statsCard.speed")}
          value={moving?.defaultSpeed ?? 0}
        />

        <StatItem
          show={type === "vehicles"}
          icon={UnitSquadIcons["acceleration"]}
          alt="squad acceleration"
          label={t("statsCard.acceleration")}
          value={moving?.acceleration ?? 0}
        />

        <StatItem
          show={type === "vehicles"}
          icon={UnitSquadIcons["deceleration"]}
          alt="squad deceleration"
          label={t("statsCard.deceleration")}
          value={moving?.deceleration ?? 0}
        />

        <StatItem
          show={type === "vehicles"}
          icon={UnitSquadIcons["acceleration"]}
          alt="squad rotation"
          label={t("statsCard.rotation")}
          value={moving?.rotation ?? 0}
        />

        <StatItem
          show={type !== "vehicles"}
          icon={UnitSquadIcons["infantry_armor"]}
          alt="squad armor infantry only"
          label={t("statsCard.armor")}
          value={health?.armor ?? 0}
        />

        <StatItem
          icon={UnitSquadIcons["cap_mult"]}
          alt="squad capture rate multiplier"
          label={t("statsCard.captureMultiplier")}
          value={capture?.cap ?? 0}
        />

        <StatItem
          icon={UnitSquadIcons["decap_mult"]}
          alt="squad decapture rate multiplier"
          label={t("statsCard.decaptureMultiplier")}
          value={capture?.decap ?? 0}
        />

        <StatItem
          icon={UnitSquadIcons["target_size"]}
          alt="squad target size"
          label={t("statsCard.targetSize")}
          value={health?.targetSize ?? 0}
        />
      </Grid>

      {type === "vehicles" ? (
        StatsVehicleArmor(
          {
            type: ui.armorIcon as VehicleArmorType,
            armorValues: health,
          },
          t("statsCard.vehicleArmor"),
        )
      ) : (
        <></>
      )}
    </Stack>
  );
};
