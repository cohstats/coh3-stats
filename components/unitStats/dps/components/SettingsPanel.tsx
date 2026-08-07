import React from "react";
import { Button, HoverCard, Group, Stack, Text, Switch, Space } from "@mantine/core";
import { IconAdjustments } from "@tabler/icons-react";

interface SettingsPanelProps {
  showDpsHealth: boolean;
  allowAllWeapons: boolean;
  showFinalStand: boolean;
  onShowDpsHealthChange: (checked: boolean) => void;
  onAllowAllWeaponsChange: (checked: boolean) => void;
  onShowFinalStandChange: (checked: boolean) => void;
  onResetUnits: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  showDpsHealth,
  allowAllWeapons,
  showFinalStand,
  onShowDpsHealthChange,
  onAllowAllWeaponsChange,
  onShowFinalStandChange,
  onResetUnits,
}) => {
  const handleAllowAllWeaponsChange = (checked: boolean) => {
    onAllowAllWeaponsChange(checked);
    if (checked) {
      // Reset selected units when enabling all weapons
      onResetUnits();
    }
  };

  return (
    <Group>
      <HoverCard width={400} shadow="md">
        <HoverCard.Target>
          <Button variant="default" leftSection={<IconAdjustments opacity={0.6} />} size="xs">
            Settings
          </Button>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Stack>
            <Text size="md">Advanced Options</Text>
            <Switch
              label="DPS / Target Health (%)"
              checked={showDpsHealth}
              onChange={(event) => onShowDpsHealthChange(event.currentTarget.checked)}
              data-testid="dps-health-toggle"
            />
            <Space />
            <Switch
              label={
                <Stack gap="0">
                  <>Allow All Weapons</>
                  <Text size="xs" c="dimmed">
                    Deselects current units
                  </Text>
                </Stack>
              }
              checked={allowAllWeapons}
              onChange={(event) => handleAllowAllWeaponsChange(event.currentTarget.checked)}
            />
            <Space />
            <Switch
              label={
                <Stack gap="0">
                  <>Final Stand Units</>
                  <Text size="xs" c="dimmed">
                    Units from the Final Stand DLC (co-op vs AI). Deselects current units
                  </Text>
                </Stack>
              }
              checked={showFinalStand}
              onChange={(event) => onShowFinalStandChange(event.currentTarget.checked)}
              data-testid="final-stand-toggle"
            />
          </Stack>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
};
