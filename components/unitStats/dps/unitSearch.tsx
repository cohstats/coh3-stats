import { Group, Text, Image, Select, HoverCard, Stack, SelectProps } from "@mantine/core";
import { UnitCostCard } from "../../unit-cards/unit-cost-card";
import { CustomizableUnit } from "../../../src/unitStats/dpsCommon";
import { ebpsStats, getSquadTotalCost } from "../../../src/unitStats";
import { Line } from "react-chartjs-2";

// interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
//   image: string;
//   label: string;
//   description: string;
//   type_icon: string;
// }
// const labels = [1, 2, 3, 4, 5, 67];
const data = {
  // labels: labels,
  datasets: [
    {
      label: "My First Dataset",
      data: [
        { x: 0, y: 10 },
        { x: 10, y: 8 },
        { x: 20, y: 6 },
        { x: 35, y: 4 },
      ],
      fill: false,
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
      pointRadius: 0,
    },
  ],
};

const config = {
  type: "line",
  data: data,
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

const renderSelectOption: SelectProps["renderOption"] = ({ option }) => {
  // @ts-ignore
  const { image, label, description, type_icon } = option;

  const lineData = {
    datasets: [
      {
        label: "DMG Chart",
        data: (option as CustomizableUnit).dps_preview,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  };

  return (
    <div>
      <Group wrap="nowrap">
        <Image w={60} h={40} src={image} fit="contain" alt="Faction" />
        <HoverCard shadow={"lg"} offset={60}>
          <HoverCard.Target>
            <Image w={60} h={40} src={type_icon} fit="contain" alt="type" />
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Stack>
              <Image
                style={{ width: 60, height: 40 }}
                src={(option as CustomizableUnit).icon_name}
                fit="contain"
                alt="Type icon"
              />
              {(option as CustomizableUnit).sbps.ui.screenName}
              {UnitCostCard(getSquadTotalCost((option as CustomizableUnit).sbps, ebpsStats))}
              <Line
                key={label}
                data={lineData}
                options={config as any}
                height={100}
                width={200}
                redraw
              />
            </Stack>
          </HoverCard.Dropdown>
        </HoverCard>

        <div>
          <Text size="sm">{label}</Text>
          <Text size="xs" opacity={0.65}>
            {description}
          </Text>
        </div>
      </Group>
    </div>
  );
};

interface ISearchProps {
  searchData: CustomizableUnit[];
  onSelect(selection: string | null, position: number): any;
  position: number;
}

export const UnitSearch = (props: ISearchProps) => {
  function onSelectionChange(id: string | null) {
    //const selectedItems: any[] = [];

    // remove last element so we have never more than 2

    //if (ids.length > 2) ids.splice(1, 1);
    //   const second_item = id[2]; // remember
    //   id.pop(); // pop will be recognized by the component
    //   id.pop();
    //   id.push(second_item);
    // }
    // id.forEach((selection) => {
    //   const item = props.searchData.find((item) => item.id == selection);
    //   selectedItems.push(item);
    // });
    props.onSelect(id, props.position);
  }

  return (
    <Select
      placeholder="Choose unit"
      clearable
      renderOption={renderSelectOption}
      data={props.searchData}
      defaultValue={null}
      // data = {[]}
      // valueComponent={Value}
      searchable
      maxDropdownHeight={600}
      nothingFoundMessage="Nobody here. War is over!"
      onChange={(value) => onSelectionChange(value)}
    />
  );
};

UnitSearch.displayName = "UnitSearch";
