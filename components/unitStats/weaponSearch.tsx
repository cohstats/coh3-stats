import { forwardRef } from "react";
import { Group, Text, Image, Select } from "@mantine/core";

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  label: string;
  description: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
       <Group wrap="nowrap">
        <Image width={60} height={40} src={image} fit="contain" alt="Weapon Class" />
        <div>
          <Text size="sm">{label}</Text>
          <Text size="xs" opacity={0.65}>
            {description}
          </Text>
        </div>
      </Group>
    </div>
  ),
);

SelectItem.displayName = "SelectItem";

interface ISearchProps {
  searchData: any[];
  onSelect(selection: any): any;
}

export const WeaponSearch = (props: ISearchProps) => {
  // let selectedLabels: string[] = [];

  function onSelectionChange(id: string) {
    //selectedLabels = id; // remember what is selected so we can set it as long dropdown is open
    //id.forEach((selection) => {
    const item = props.searchData.find((item) => item.value == id);
    if (item) props.onSelect(item);
    //});
  }

  return (
    <Select
      //label="Choose a unit"
      placeholder="Configure weapons and squad size"
      // clearSearchOnChange={true}
      // clearSearchOnBlur={true}
      clearable
      itemComponent={SelectItem}
      data={props.searchData}
      // valueComponent={Value}
      searchable
      maxDropdownHeight={600}
      nothingFound="Nothing here. War is over!"
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
