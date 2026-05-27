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

type PercentStackMode = "normal" | "inverse";

const combinePercentageModifiers = (values: number[], mode: PercentStackMode): number => {
  const finalMultiplier = values.reduce((current, value) => {
    const decimal = value / 100;
    return mode === "inverse" ? current * (1 - decimal) : current * (1 + decimal);
  }, 1);

  const finalPercent =
    mode === "inverse" ? (1 - finalMultiplier) * 100 : (finalMultiplier - 1) * 100;

  return finalPercent;
};

interface StatConfig {
  key: keyof CustomModifiers;
  label: string;
  description: string;
  unit: string;

  percentStackMode: PercentStackMode;
  percentMin: number;
  percentMax: number;
  percentStep: number;

  absoluteMin: number;
  absoluteMax?: number;
  absoluteStep: number;

  supportsAdditive?: boolean;
  additiveMin?: number;
  additiveMax?: number;
  additiveStep?: number;
}

const normalPercentConfig = {
  percentStackMode: "normal" as const,
  percentMin: -100,
  percentMax: 500,
  percentStep: 5,
};

const inversePercentConfig = {
  percentStackMode: "inverse" as const,
  percentMin: -500,
  percentMax: 100,
  percentStep: 5,
};

const defaultAbsoluteConfig = {
  absoluteMin: 0,
  absoluteStep: 0.1,
};

const statConfigs: StatConfig[] = [
  {
    key: "accuracy",
    label: "Accuracy",
    description: "Hit chance modifier - affects how often shots connect with targets",
    unit: "%",
    ...normalPercentConfig,
    absoluteMin: 0,
    absoluteStep: 0.05,
  },
  {
    key: "damage",
    label: "Damage",
    description: "Damage per shot modifier - affects raw damage output",
    unit: "dmg",
    ...normalPercentConfig,
    ...defaultAbsoluteConfig,
    supportsAdditive: true,
    additiveStep: 0.1,
  },
  {
    key: "penetration",
    label: "Penetration",
    description: "Armor penetration modifier - affects damage vs armored targets",
    unit: "pen",
    ...normalPercentConfig,
    ...defaultAbsoluteConfig,
  },
  {
    key: "cooldownReload",
    label: "Rate of Fire",
    description:
      "Cooldown and Reload modifier - affects how fast weapons fire, do not add together",
    unit: "rpm",
    ...inversePercentConfig,
    ...defaultAbsoluteConfig,
  },
  {
    key: "overallAttackSpeed",
    label: "Overall Attack Speed",
    description:
      "Time between burst modifier - affects how fast weapons fire, do not add together",
    unit: "mult",
    ...inversePercentConfig,
    ...defaultAbsoluteConfig,
  },
  {
    key: "reload",
    label: "Reload",
    description: "Reload modifier - affects how fast weapons fire, do not add together",
    unit: "seconds",
    ...inversePercentConfig,
    ...defaultAbsoluteConfig,
  },
  {
    key: "burstLength",
    label: "Burst Length",
    description: "Duration of burst - affects how fast weapons fire",
    unit: "seconds",
    ...normalPercentConfig,
    ...defaultAbsoluteConfig,
  },
  {
    key: "burstShots",
    label: "Rounds per Burst",
    description: "Rounds per burst modifier - affects how many shots are fired per burst",
    unit: "shots",
    ...normalPercentConfig,
    ...defaultAbsoluteConfig,
  },
  {
    key: "range",
    label: "Range",
    description: "Weapon range modifier - affects how far weapons can fire",
    unit: "range",
    ...normalPercentConfig,
    absoluteMin: 0,
    absoluteStep: 1,
    supportsAdditive: true,
    additiveStep: 1,
  },
  {
    key: "armor",
    label: "Armor",
    description: "Target armor value - affects penetration calculations and damage reduction",
    unit: "armor",
    ...normalPercentConfig,
    ...defaultAbsoluteConfig,
    supportsAdditive: true,
    additiveStep: 0.1,
  },
  {
    key: "hitpoints",
    label: "Hit Points",
    description: "Unit health value - affects how much damage the unit can take before dying",
    unit: "HP",
    ...normalPercentConfig,
    absoluteMin: 0,
    absoluteStep: 5,
    supportsAdditive: true,
    additiveStep: 5,
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
      reload: { type: "percentage", value: 0, enabled: false },
      cooldownReload: { type: "percentage", value: 0, enabled: false },
      overallAttackSpeed: { type: "percentage", value: 0, enabled: false },
      burstLength: { type: "percentage", value: 0, enabled: false },
      burstShots: { type: "percentage", value: 0, enabled: false },
      range: { type: "percentage", value: 0, enabled: false },
      armor: { type: "percentage", value: 0, enabled: false },
      hitpoints: { type: "percentage", value: 0, enabled: false },
    };
    setLocalModifiers(resetModifiers);
    onModifiersChange(resetModifiers);
  };

  const getDisplayValue = (modifier: CustomModifier, config: StatConfig) => {
    if (!modifier.enabled) return "Default";

    if (modifier.type === "percentage") {
      const percentageValues = getPercentageValues(modifier);
      const collapsedValue = combinePercentageModifiers(
        percentageValues,
        config.percentStackMode,
      );

      return `${collapsedValue >= 0 ? "+" : ""}${Math.round(collapsedValue * 100) / 100}%`;
    }

    if (modifier.type === "additive") {
      return `${modifier.value >= 0 ? "+" : ""}${modifier.value}`;
    }

    return `${modifier.value}`;
  };

  const getPercentageValues = (modifier: CustomModifier): number[] => {
    if (Array.isArray(modifier.percentageValues)) {
      return modifier.percentageValues;
    }

    // Backwards compatibility with old saved/current modifiers.
    if (modifier.type === "percentage" && modifier.value !== 0) {
      return [modifier.value];
    }

    return [];
  };

  const patchModifier = (statKey: keyof CustomModifiers, patch: Partial<CustomModifier>) => {
    const newModifiers = {
      ...localModifiers,
      [statKey]: {
        ...localModifiers[statKey],
        ...patch,
      },
    };

    setLocalModifiers(newModifiers);
    onModifiersChange(newModifiers);
  };

  const handlePercentageEntryChange = (
    config: StatConfig,
    index: number,
    rawValue: string | number,
  ) => {
    const modifier = localModifiers[config.key];
    const currentValues = getPercentageValues(modifier);
    const nextValues = [...currentValues];

    // Emptying an existing box removes that entry.
    if (rawValue === "") {
      nextValues.splice(index, 1);
    } else if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
      nextValues[index] = rawValue;
    } else {
      return;
    }

    const collapsedValue = combinePercentageModifiers(nextValues, config.percentStackMode);

    patchModifier(config.key, {
      percentageValues: nextValues,
      value: collapsedValue,
    });
  };

  const handleTypeChange = (config: StatConfig, type: CustomModifierType) => {
    patchModifier(config.key, {
      type,
      value: 0,
      percentageValues: type === "percentage" ? [] : undefined,
    });
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
          const percentageValues = getPercentageValues(modifier);
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
                      {getDisplayValue(modifier, config)}
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
                    onChange={(value) => handleTypeChange(config, value as CustomModifierType)}
                    data={[
                      { value: "percentage", label: "Percentage" },
                      { value: "absolute", label: "Absolute" },
                      ...(config.supportsAdditive
                        ? [{ value: "additive", label: "Add/Subtract" }]
                        : []),
                    ]}
                    disabled={!modifier.enabled}
                    size="sm"
                    allowDeselect={false}
                  />
                </Grid.Col>

                {/* Second row on mobile: Number Input */}
                <Grid.Col span={{ base: 6, sm: 3 }}>
                  {modifier.type === "percentage" ? (
                    <Group
                      gap={4}
                      wrap="nowrap"
                      style={{
                        overflowX: "auto",
                        maxWidth: "100%",
                        paddingBottom: 4,
                      }}
                    >
                      {[...percentageValues, undefined].map((entryValue, index) => (
                        <NumberInput
                          key={index}
                          value={entryValue ?? ""}
                          onChange={(value) => handlePercentageEntryChange(config, index, value)}
                          disabled={!modifier.enabled}
                          placeholder={index === percentageValues.length ? "+%" : "±%"}
                          size="sm"
                          step={config.percentStep}
                          min={config.percentMin}
                          max={config.percentMax}
                          hideControls
                          w={48}
                          styles={{
                            root: {
                              flex: "0 0 36px",
                            },
                            input: {
                              paddingInline: 1,
                              textAlign: "center",
                              height: 28,
                              minHeight: 28,
                              fontSize: 12,
                            },
                          }}
                        />
                      ))}
                    </Group>
                  ) : (
                    <NumberInput
                      value={modifier.value}
                      onChange={(value) =>
                        handleModifierChange(
                          config.key,
                          "value",
                          typeof value === "number" ? value : 0,
                        )
                      }
                      disabled={!modifier.enabled}
                      placeholder={
                        modifier.type === "additive" ? `± ${config.unit}` : config.unit
                      }
                      size="sm"
                      step={
                        modifier.type === "additive"
                          ? (config.additiveStep ?? config.absoluteStep)
                          : config.absoluteStep
                      }
                      min={modifier.type === "additive" ? config.additiveMin : config.absoluteMin}
                      max={
                        modifier.type === "additive"
                          ? config.additiveMax
                          : (config.absoluteMax ?? undefined)
                      }
                      w={{ base: "100%", sm: 80 }}
                    />
                  )}
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
