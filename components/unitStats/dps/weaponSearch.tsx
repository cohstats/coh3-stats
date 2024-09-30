import { Group, Text, Image, Select, SelectProps } from "@mantine/core";
import { WeaponMember } from "../../../src/unitStats/dpsCommon";

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  label: string;
  description: string;
}

const renderSelectOption: SelectProps["renderOption"] = ({ option }) => {
  const { image, label, description } = option as unknown as ItemProps;

  return (
    <div>
      <Group wrap="nowrap">
        <Image
          style={{
            width: "60px",
            height: "40px",
          }}
          src={image}
          fit="contain"
          alt="Weapon Class"
        />
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
  searchData: WeaponMember[];
  onSelect(selection: WeaponMember): any;
}

export const WeaponSearch = (props: ISearchProps) => {
  // let selectedLabels: string[] = [];

  function onSelectionChange(id: string) {
    //selectedLabels = id; // remember what is selected so we can set it as long dropdown is open
    //id.forEach((selection) => {
    const item = props.searchData.find((item) => item.weapon_id == id);
    if (item) props.onSelect(item);
    //});
  }

  const cleanedSearchData = [];
  const cleanedSearchDataMapWithValue: { [key: string]: boolean } = {};

  // We need to avoid duplicates in the select based on value (hopefully there will not be more than 1 duplicate)
  for (const item of props.searchData) {
    if (cleanedSearchDataMapWithValue[item.value]) {
      cleanedSearchData.push({ ...item, value: `${item.value}_2` });
    } else {
      cleanedSearchData.push(item);
      cleanedSearchDataMapWithValue[item.value] = true;
    }
  }

  return (
    <Select
      placeholder="Configure weapons and squad size"
      clearable
      renderOption={renderSelectOption}
      data={cleanedSearchData}
      searchable
      maxDropdownHeight={600}
      nothingFoundMessage="Nothing here. War is over!"
      onChange={(value) => onSelectionChange(value as string)}
      value=""
      // filter={(value, selected, item) =>
      //   //@ts-ignore
      //   item.label.toLowerCase().includes(value.toLowerCase().trim()) ||
      //   item.description.toLowerCase().includes(value.toLowerCase().trim())
      // }
    />
  );
};

WeaponSearch.displayName = "Weapon Search";
