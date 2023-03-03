import { forwardRef } from "react";
import { Group, Avatar, Text, Select, Image } from "@mantine/core";

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  label: string;
  description: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Image width={60} height={40} src={image} fit="contain" />
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

interface ISearchProps {
  searchData: any[];
  onSelect(selection: any): any;
}

export const UnitSearch = (props: ISearchProps) => {
  function onSelectionChange(id: string) {
    const item = props.searchData.find((item) => item.value == id);
    props.onSelect(item);
  }

  return (
    <Select
      //label="Choose a unit"
      placeholder="Choose weapon"
      itemComponent={SelectItem}
      data={props.searchData}
      searchable
      maxDropdownHeight={600}
      nothingFound="Nobody here"
      onChange={onSelectionChange}
      filter={(value, item) =>
        //@ts-ignore
        item.label.toLowerCase().includes(value.toLowerCase().trim()) ||
        item.description.toLowerCase().includes(value.toLowerCase().trim())
      }
    />
  );
};
