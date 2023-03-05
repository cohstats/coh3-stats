import { forwardRef } from "react";
import {
  Group,
  Text,
  Image,
  MultiSelect,
  Box,
  CloseButton,
  MultiSelectValueProps,
} from "@mantine/core";

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  label: string;
  description: string;
}

function Value({ label, onRemove, ...others }: MultiSelectValueProps & { value: string }) {
  return (
    <div {...others}>
      <Box
        sx={(theme) => ({
          display: "flex",
          cursor: "default",
          alignItems: "center",
          backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
          border: ` solid ${
            theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[4]
          }`,
          paddingLeft: theme.spacing.xs,
          borderRadius: theme.radius.sm,
        })}
      >
        <Box mr={10}>
          <Image
            width={30}
            height={20}
            src={(others as any).image}
            fit="contain"
            alt="Weapon Class"
          />
        </Box>
        <Box>{label}</Box>
        <CloseButton
          onMouseDown={onRemove}
          variant="transparent"
          size={22}
          iconSize={14}
          tabIndex={-1}
        />
      </Box>
    </div>
  );
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
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

export const UnitSearch = (props: ISearchProps) => {
  function onSelectionChange(id: string[]) {
    const selectedItems: any[] = [];

    // remove last element so we have never more than 2
    if (id.length > 2) {
      const second_item = id[2]; // remember
      id.pop(); // pop will be recognized by the component
      id.pop();
      id.push(second_item);
    }
    id.forEach((selection) => {
      const item = props.searchData.find((item) => item.value == selection);
      selectedItems.push(item);
    });
    props.onSelect(selectedItems);
  }

  return (
    <MultiSelect
      //label="Choose a unit"
      placeholder="Choose weapon"
      itemComponent={SelectItem}
      data={props.searchData}
      valueComponent={Value}
      searchable
      maxDropdownHeight={600}
      nothingFound="Nothing here. War is over!"
      onChange={onSelectionChange}
      filter={(value, selected, item) =>
        //@ts-ignore
        item.label.toLowerCase().includes(value.toLowerCase().trim()) ||
        item.description.toLowerCase().includes(value.toLowerCase().trim())
      }
    />
  );
};

UnitSearch.displayName = "UnitSearch";
