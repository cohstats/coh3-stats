import React from "react";
import { Grid, Group, Flex, Tooltip, ActionIcon, Image, Select, Space } from "@mantine/core";
import { UnitSearch } from "../unitSearch";
import type { CustomizableUnit } from "../../../../src/unitStats/dpsCommon";
import type { DpsUnitOption } from "../../../../src/unitStats/dpsData";
import type { EbpsType } from "../../../../src/unitStats/mappingEbps";
import { getFactionIcon } from "../../../../src/unitStats";

interface UnitSelectionPanelProps {
  unitFilter: string[];
  unitSelectionList: DpsUnitOption[];
  getUnit: (id: string) => CustomizableUnit | undefined;
  ebpsData: EbpsType[];
  patchList: string[];
  patchVersion: string;
  position: number;
  disabled?: boolean;
  selectedUnitId?: string;
  onFilterToggle: (
    filterValue: string,
    unitIndex: number,
    unitFilter: string[],
    unitSelectionList: DpsUnitOption[],
  ) => void;
  onPatchChange: (value: string, index: number) => void;
  onUnitSelect: (selection: string | null, index: number) => void;
}

const generateFilterButtons = (
  unitFilter: string[],
  callback: (
    filterValue: string,
    unitIndex: number,
    unitFilter: string[],
    unitSelectionList: DpsUnitOption[],
  ) => void,
  index: number,
  unitSelectionList: DpsUnitOption[],
) => {
  const factions = ["afrika_korps", "american", "british_africa", "german"];
  const filterButtons: React.ReactElement[] = [];

  for (const faction of factions) {
    const source = getFactionIcon(faction);
    filterButtons.push(
      <Tooltip key={faction + index} label="Filter">
        <ActionIcon
          key={faction + index}
          size="lg"
          variant={unitFilter.includes(faction) ? "default" : "transparent"}
          onClick={() => callback(faction, index, unitFilter, unitSelectionList)}
        >
          <Image src={source} alt="Filter" w={25} h={25} />
        </ActionIcon>
      </Tooltip>,
    );
  }

  return filterButtons;
};

export const UnitSelectionPanel: React.FC<UnitSelectionPanelProps> = ({
  unitFilter,
  unitSelectionList,
  getUnit,
  ebpsData,
  patchList,
  patchVersion,
  position,
  disabled,
  selectedUnitId,
  onFilterToggle,
  onPatchChange,
  onUnitSelect,
}) => {
  return (
    <>
      <Grid>
        <Grid.Col span={6}>
          <Group wrap="nowrap" gap="sm">
            {generateFilterButtons(unitFilter, onFilterToggle, position, unitSelectionList)}
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <Flex justify="flex-end" wrap="wrap">
            {position === 2 && <Space h="2rem" />}
            <Group>
              <Tooltip label="Patch Version">
                <Select
                  styles={{ wrapper: { width: 90 } }}
                  placeholder="Patch"
                  onChange={(value) => {
                    if (value) onPatchChange(value, position);
                  }}
                  data={patchList}
                  value={patchVersion}
                  withCheckIcon={false}
                  allowDeselect={false}
                  disabled={disabled}
                />
              </Tooltip>
            </Group>
          </Flex>
        </Grid.Col>
      </Grid>
      <Space h="sm" />
      <UnitSearch
        key={`Search${position}`}
        searchData={unitSelectionList}
        getUnit={getUnit}
        ebpsData={ebpsData}
        onSelect={onUnitSelect}
        value={selectedUnitId ?? null}
        position={position === 1 ? 0 : 1}
        disabled={disabled}
        testId={`dps-unit-search-${position}`}
      />
    </>
  );
};
