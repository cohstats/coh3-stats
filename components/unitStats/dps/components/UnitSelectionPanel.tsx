import React from "react";
import { Grid, Group, Flex, Tooltip, ActionIcon, Image, Select, Space } from "@mantine/core";
import { UnitSearch } from "../unitSearch";
import { CustomizableUnit } from "../../../../src/unitStats/dpsCommon";
import { getFactionIcon } from "../../../../src/unitStats";

interface UnitSelectionPanelProps {
  unitFilter: string[];
  unitSelectionList: CustomizableUnit[];
  patchList: string[];
  defaultPatch: string;
  position: number;
  onFilterToggle: (
    filterValue: string,
    unitIndex: number,
    unitFilter: string[],
    unitSelectionList: CustomizableUnit[],
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
    unitSelectionList: CustomizableUnit[],
  ) => void,
  index: number,
  unitSelectionList: CustomizableUnit[],
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
  patchList,
  defaultPatch,
  position,
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
                  onChange={(value) => onPatchChange(value as string, position)}
                  data={patchList}
                  defaultValue={defaultPatch}
                  withCheckIcon={false}
                  allowDeselect={false}
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
        onSelect={onUnitSelect}
        position={position === 1 ? 0 : 1}
      />
    </>
  );
};
