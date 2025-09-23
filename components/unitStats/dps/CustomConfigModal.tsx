import React, { useState, useEffect } from "react";
import {
  Modal,
  Stack,
  Group,
  Text,
  NumberInput,
  Switch,
  Select,
  Button,
  Grid,
  Divider,
  Tooltip,
  Badge,
  Card,
} from "@mantine/core";
import { IconSettings, IconRefresh } from "@tabler/icons-react";
import {
  CustomModifiers,
  CustomModifier,
  CustomModifierType,
} from "../../../src/unitStats/dpsCommon";

interface CustomConfigModalProps {
  opened: boolean;
  onClose: () => void;
  customModifiers: CustomModifiers;
  onModifiersChange: (modifiers: CustomModifiers) => void;
  unitName?: string;
  unitColor?: string;
}

interface StatConfig {
  key: keyof CustomModifiers;
  label: string;
  description: string;
  baseValue?: number;
  unit: string;
}

const statConfigs: StatConfig[] = [
  {
    key: "accuracy",
    label: "Accuracy",
    description: "Hit chance modifier - affects how often shots connect with targets",
    unit: "%",
  },
  {
    key: "damage",
    label: "Damage",
    description: "Damage per shot modifier - affects raw damage output",
    unit: "dmg",
  },
  {
    key: "penetration",
    label: "Penetration",
    description: "Armor penetration modifier - affects damage vs armored targets",
    unit: "pen",
  },
  {
    key: "rpm",
    label: "Rate of Fire",
    description: "Rounds per minute modifier - affects how fast weapons fire",
    unit: "rpm",
  },
  {
    key: "armor",
    label: "Armor",
    description: "Target armor value - affects penetration calculations and damage reduction",
    unit: "armor",
  },
  {
    key: "hitpoints",
    label: "Hit Points",
    description: "Unit health modifier - affects how much damage the unit can take before dying",
    unit: "HP",
  },
];

export const CustomConfigModal: React.FC<CustomConfigModalProps> = ({
  opened,
  onClose,
  customModifiers,
  onModifiersChange,
  unitName,
  unitColor,
}) => {
  const [localModifiers, setLocalModifiers] = useState<CustomModifiers>(customModifiers);

  // Clean up unit name display
  const displayUnitName = unitName && unitName !== "No text found" ? unitName : "Unit";

  useEffect(() => {
    setLocalModifiers(customModifiers);
  }, [customModifiers]);

  const handleModifierChange = (
    statKey: keyof CustomModifiers,
    field: keyof CustomModifier,
    value: any,
  ) => {
    const newModifiers = {
      ...localModifiers,
      [statKey]: {
        ...localModifiers[statKey],
        [field]: value,
      },
    };
    setLocalModifiers(newModifiers);
    onModifiersChange(newModifiers);
  };

  const handleReset = () => {
    const resetModifiers: CustomModifiers = {
      accuracy: { type: "percentage", value: 0, enabled: false },
      damage: { type: "percentage", value: 0, enabled: false },
      penetration: { type: "percentage", value: 0, enabled: false },
      rpm: { type: "percentage", value: 0, enabled: false },
      armor: { type: "percentage", value: 0, enabled: false },
      hitpoints: { type: "percentage", value: 0, enabled: false },
    };
    setLocalModifiers(resetModifiers);
    onModifiersChange(resetModifiers);
  };

  const getDisplayValue = (modifier: CustomModifier) => {
    if (!modifier.enabled) return "Default";
    if (modifier.type === "percentage") {
      return `${modifier.value > 0 ? "+" : ""}${modifier.value}%`;
    }
    return `${modifier.value}`;
  };

  const getValueColor = (modifier: CustomModifier) => {
    if (!modifier.enabled) return "gray";
    if (modifier.type === "percentage") {
      if (modifier.value > 0) return "green";
      if (modifier.value < 0) return "red";
    }
    return "blue";
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconSettings size={20} />
          <h3 style={{ margin: 0, fontWeight: 600 }}>Custom Configuration</h3>
          <Badge size={"lg"} variant="light" color={unitColor}>
            {displayUnitName}
          </Badge>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Apply custom modifiers to unit stats. These modifiers affect all weapons in the unit's
          loadout and work in combination with cover, movement, and distance-based modifiers.
        </Text>

        <Divider />

        {statConfigs.map((config) => {
          const modifier = localModifiers[config.key];
          return (
            <Card key={config.key} p="sm" withBorder>
              <Grid align="center">
                {/* First row: Label */}
                <Grid.Col span={{ base: 6, sm: 3 }}>
                  <Tooltip label={config.description} multiline w={250}>
                    <Text fw={500} style={{ cursor: "pointer" }}>
                      {config.label}
                    </Text>
                  </Tooltip>
                </Grid.Col>

                {/* First row: Badge and Toggle */}
                <Grid.Col span={{ base: 6, sm: 3 }}>
                  <Group gap="xs" align="center" justify="flex-end">
                    <Badge size="md" variant="light" color={getValueColor(modifier)}>
                      {getDisplayValue(modifier)}
                    </Badge>
                    <Tooltip label={modifier.enabled ? "Disable modifier" : "Enable modifier"}>
                      <Switch
                        checked={modifier.enabled}
                        onChange={(event) =>
                          handleModifierChange(config.key, "enabled", event.currentTarget.checked)
                        }
                        size="sm"
                      />
                    </Tooltip>
                  </Group>
                </Grid.Col>

                {/* Second row on mobile: Type Select */}
                <Grid.Col span={{ base: 6, sm: 3 }}>
                  <Select
                    value={modifier.type}
                    onChange={(value) =>
                      handleModifierChange(config.key, "type", value as CustomModifierType)
                    }
                    data={[
                      { value: "percentage", label: "Percentage" },
                      { value: "absolute", label: "Absolute" },
                    ]}
                    disabled={!modifier.enabled}
                    size="sm"
                    allowDeselect={false}
                  />
                </Grid.Col>

                {/* Second row on mobile: Number Input */}
                <Grid.Col span={{ base: 6, sm: 3 }}>
                  <NumberInput
                    value={modifier.value}
                    onChange={(value) => handleModifierChange(config.key, "value", value || 0)}
                    disabled={!modifier.enabled}
                    placeholder={modifier.type === "percentage" ? "±%" : config.unit}
                    size="sm"
                    step={modifier.type === "percentage" ? 5 : 0.1}
                    min={modifier.type === "percentage" ? -100 : 0}
                    max={modifier.type === "percentage" ? 500 : undefined}
                    w={{ base: "100%", sm: 80 }}
                  />
                </Grid.Col>
              </Grid>
            </Card>
          );
        })}

        <Divider />

        <Group justify="space-between">
          <Button variant="default" leftSection={<IconRefresh size={16} />} onClick={handleReset}>
            Reset to Default
          </Button>

          <Group>
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};
