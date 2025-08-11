import React from "react";
import { Button, HoverCard, Group, Stack, Text, Switch, Space } from "@mantine/core";
import { IconAdjustments } from "@tabler/icons-react";

interface SettingsPanelProps {
  showDpsHealth: boolean;
  allowAllWeapons: boolean;
  onShowDpsHealthChange: (checked: boolean) => void;
  onAllowAllWeaponsChange: (checked: boolean) => void;
  onResetUnits: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  showDpsHealth,
  allowAllWeapons,
  onShowDpsHealthChange,
  onAllowAllWeaponsChange,
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
          </Stack>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
};
