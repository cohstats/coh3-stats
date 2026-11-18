import { Group, Text, Image, Select, HoverCard, Stack, SelectProps } from "@mantine/core";
import { useState } from "react";
import { UnitCostCard } from "../../unit-cards/unit-cost-card";
import type { CustomizableUnit } from "../../../src/unitStats/dpsCommon";
import type { DpsUnitOption } from "../../../src/unitStats/dpsData";
import type { EbpsType } from "../../../src/unitStats/mappingEbps";
import { getSquadTotalCost } from "../../../src/unitStats/squadTotalCost";
import { isFinalStandEnemyUnitId, isFinalStandUnitId } from "../../../src/unitStats/finalStand";
import { Line } from "react-chartjs-2";
import { FinalStandBadge } from "../../final-stand-badge";
import { FinalStandEnemyBadge } from "../../final-stand-enemy-badge";

const config = {
  type: "line",
  plugins: {
    legend: {
      position: "top",
      display: false,
    },
  },
  scales: {
    x: {
      type: "linear" as const,
      min: 0,
      suggestedMax: 35,
      title: {
        display: false,
      },

      grid: {
        lineWidth: 0.5,
        display: false,
      },
    },
  },
};

interface UnitOptionProps {
  option: DpsUnitOption;
  getUnit: (id: string) => CustomizableUnit | undefined;
  ebpsData: EbpsType[];
}

const UnitOption = ({ option, getUnit, ebpsData }: UnitOptionProps) => {
  const [opened, setOpened] = useState(false);
  const unit = opened ? getUnit(option.id) : undefined;
  const { image, label, description, type_icon } = option;

  const lineData = {
    datasets: [
      {
        label: "DMG Chart",
        data: unit?.dps_preview ?? [],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };

  return (
    <div>
      <Group wrap="nowrap" gap={0}>
        <Image w={60} h={40} src={image} fit="contain" alt="Faction" />
        <HoverCard
          shadow={"lg"}
          offset={60}
          onOpen={() => setOpened(true)}
          onClose={() => setOpened(false)}
        >
          <HoverCard.Target>
            <Image w={60} h={40} src={type_icon} fit="contain" alt="type" />
          </HoverCard.Target>
          <HoverCard.Dropdown>
            {unit && (
              <Stack>
                <Image
                  style={{ width: 60, height: 40 }}
                  src={unit.icon_name}
                  fit="contain"
                  alt="Type icon"
                />
                {unit.sbps.ui.screenName}
                {UnitCostCard(getSquadTotalCost(unit.sbps, ebpsData))}
                <Line
                  key={label}
                  data={lineData}
                  options={config as any}
                  height={100}
                  width={200}
                  redraw
                />
              </Stack>
            )}
          </HoverCard.Dropdown>
        </HoverCard>

        <div>
          <Group gap="xs" wrap="nowrap">
            <Text size="sm">{label}</Text>
            {isFinalStandUnitId(option.id) && <FinalStandBadge size="xs" withTooltip={false} />}
            {isFinalStandEnemyUnitId(option.id) && <FinalStandEnemyBadge size="xs" />}
          </Group>
          <Text size="xs" opacity={0.65}>
            {description}
          </Text>
        </div>
      </Group>
    </div>
  );
};

interface ISearchProps {
  searchData: DpsUnitOption[];
  getUnit: (id: string) => CustomizableUnit | undefined;
  ebpsData: EbpsType[];
  onSelect(selection: string | null, position: number): any;
  position: number;
  disabled?: boolean;
  /** Controls the select, e.g. when the unit is preselected from the URL. Uncontrolled when omitted. */
  value?: string | null;
  /** Optional `data-testid` - the page renders several of these selects side by side. */
  testId?: string;
}

export const UnitSearch = (props: ISearchProps) => {
  const onSelectionChange = (id: string | null) => {
    props.onSelect(id, props.position);
  };

  const customFilter: SelectProps["filter"] = ({ options, search }) => {
    const searchValue = search.toLowerCase().trim();
    return options.filter((option) => {
      const unit = option as unknown as DpsUnitOption;
      const matchesId = unit.id.toLowerCase().includes(searchValue);
      const matchesName = unit.screen_name.toLowerCase().includes(searchValue);
      return matchesId || matchesName;
    });
  };

  return (
    <Select
      placeholder="Choose unit"
      clearable
      renderOption={({ option }) => (
        <UnitOption
          option={option as DpsUnitOption}
          getUnit={props.getUnit}
          ebpsData={props.ebpsData}
        />
      )}
      comboboxProps={{ keepMounted: false }}
      data={props.searchData}
      {...(props.value !== undefined ? { value: props.value } : { defaultValue: null })}
      searchable
      maxDropdownHeight={600}
      nothingFoundMessage="Nobody here. War is over!"
      onChange={(value) => onSelectionChange(value)}
      disabled={props.disabled}
      filter={customFilter}
      data-testid={props.testId}
    />
  );
};

UnitSearch.displayName = "UnitSearch";
