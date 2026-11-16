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
import { useTranslation } from "next-i18next/pages";

interface CompareSettingsPanelProps {
  allowAllWeapons: boolean;
  showFinalStand: boolean;
  scatterEnabled: boolean;
  scatterAvailable: boolean;
  scatterSamples: number;
  onScatterSamplesChange: (value: number) => void;
  onScatterEnabledChange: (checked: boolean) => void;
  onAllowAllWeaponsChange: (checked: boolean) => void;
  onShowFinalStandChange: (checked: boolean) => void;
  onResetUnits: () => void;
}

export const CompareSettingsPanel: React.FC<CompareSettingsPanelProps> = ({
  allowAllWeapons,
  showFinalStand,
  scatterEnabled,
  scatterAvailable,
  scatterSamples,
  onScatterSamplesChange,
  onScatterEnabledChange,
  onAllowAllWeaponsChange,
  onShowFinalStandChange,
  onResetUnits,
}) => {
  const { t } = useTranslation("explorer");
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
          {scatterAvailable && (
            <Switch
              label={
                <Stack gap="0">
                  <>{t("dpsCompareUi.settings.scatter")}</>
                </Stack>
              }
              checked={scatterEnabled}
              onChange={(event) => onScatterEnabledChange(event.currentTarget.checked)}
              data-testid="scatter-simulation-toggle"
            />
          )}

          {scatterAvailable && scatterEnabled && (
            <Select
              label={t("dpsCompareUi.settings.samples")}
              data={[
                { value: "144", label: `144 — 12×12 (${t("dpsCompareUi.settings.fast")})` },
                { value: "576", label: `576 — 24×24 (${t("dpsCompareUi.settings.balanced")})` },
                { value: "2025", label: `2,025 — 45×45 (${t("dpsCompareUi.settings.precise")})` },
              ]}
              value={String(scatterSamples)}
              allowDeselect={false}
              onChange={(value) => {
                if (value) onScatterSamplesChange(Number(value));
              }}
              data-testid="scatter-sample-count"
            />
          )}
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
  patchVersion: string;
  disabled?: boolean;
  onPatchChange: (value: string) => void;
}

export const PatchSelector: React.FC<PatchSelectorProps> = ({
  patchList,
  patchVersion,
  disabled,
  onPatchChange,
}) => {
  return (
    <Tooltip label="Patch Version">
      <Select
        styles={{ wrapper: { width: 90 } }}
        placeholder="Patch"
        onChange={(value) => {
          if (value) onPatchChange(value);
        }}
        data={patchList}
        value={patchVersion}
        disabled={disabled}
        withCheckIcon={false}
        allowDeselect={false}
      />
    </Tooltip>
  );
};
