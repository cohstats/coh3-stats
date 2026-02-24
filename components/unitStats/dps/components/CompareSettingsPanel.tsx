import React from "react";
import {
  Button,
  HoverCard,
  Group,
  Stack,
  Text,
  Switch,
  Space,
  Select,
  Tooltip,
  ActionIcon,
  Image,
} from "@mantine/core";
import { IconAdjustments } from "@tabler/icons-react";
import { getFactionIcon } from "../../../../src/unitStats";

interface CompareSettingsPanelProps {
  allowAllWeapons: boolean;
  onAllowAllWeaponsChange: (checked: boolean) => void;
  onResetUnits: () => void;
}

export const CompareSettingsPanel: React.FC<CompareSettingsPanelProps> = ({
  allowAllWeapons,
  onAllowAllWeaponsChange,
  onResetUnits,
}) => {
  const handleAllowAllWeaponsChange = (checked: boolean) => {
    onAllowAllWeaponsChange(checked);
    if (checked) {
      onResetUnits();
    }
  };

  return (
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
          <Button variant="light" size="xs" onClick={onResetUnits}>
            Reset All Units
          </Button>
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
};

const FACTIONS = ["afrika_korps", "american", "british_africa", "german"];

interface FactionFilterProps {
  factionFilter: string[];
  onFilterToggle: (faction: string) => void;
}

export const FactionFilter: React.FC<FactionFilterProps> = ({
  factionFilter,
  onFilterToggle,
}) => {
  return (
    <Group wrap="nowrap" gap="sm">
      {FACTIONS.map((faction) => {
        const source = getFactionIcon(faction);
        return (
          <Tooltip key={faction} label="Filter">
            <ActionIcon
              size="lg"
              variant={factionFilter.includes(faction) ? "default" : "transparent"}
              onClick={() => onFilterToggle(faction)}
            >
              <Image src={source} alt="Filter" w={25} h={25} />
            </ActionIcon>
          </Tooltip>
        );
      })}
    </Group>
  );
};

interface PatchSelectorProps {
  patchList: string[];
  defaultPatch: string;
  onPatchChange: (value: string) => void;
}

export const PatchSelector: React.FC<PatchSelectorProps> = ({
  patchList,
  defaultPatch,
  onPatchChange,
}) => {
  return (
    <Tooltip label="Patch Version">
      <Select
        styles={{ wrapper: { width: 90 } }}
        placeholder="Patch"
        onChange={(value) => onPatchChange(value as string)}
        data={patchList}
        defaultValue={defaultPatch}
        withCheckIcon={false}
        allowDeselect={false}
      />
    </Tooltip>
  );
};
