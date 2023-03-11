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
  id: string;
  factionIcon: string;
  screenName: string;
}

function Value({ id, onRemove, ...others }: MultiSelectValueProps & { value: string }) {
  return (
    <div {...others}>
      <Box
        sx={(theme) => ({
          display: "flex",
          cursor: "default",
          alignItems: "center",
          // backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[4],
          // border: ` solid ${
          //   theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[4]
          // }`,
          paddingLeft: theme.spacing.xs,
          borderRadius: theme.radius.sm,
        })}
      >
        <Box mr={10}>
          <Image
            width={30}
            height={20}
            src={(others as any).factionIcon}
            fit="contain"
            alt="Weapon Class"
          />
        </Box>
        <Box>{id}</Box>
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
  ({ id, factionIcon, screenName, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Image width={60} height={40} src={factionIcon} fit="contain" alt="Faction" />
        <div>
          <Text size="sm">{id}</Text>
          <Text size="xs" opacity={0.65}>
            {screenName}
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
  function onSelectionChange(ids: string[]) {
    const selectedItems: any[] = [];

    // remove last element so we have never more than 2

    if (ids.length > 2) ids.splice(1, 1);
    //   const second_item = id[2]; // remember
    //   id.pop(); // pop will be recognized by the component
    //   id.pop();
    //   id.push(second_item);
    // }
    // id.forEach((selection) => {
    //   const item = props.searchData.find((item) => item.id == selection);
    //   selectedItems.push(item);
    // });
    props.onSelect(ids);
  }

  return (
    <MultiSelect
      placeholder="Choose up to two units"
      itemComponent={SelectItem}
      data={props.searchData}
      valueComponent={Value}
      searchable
      maxDropdownHeight={600}
      nothingFound="Nobody here. War is over!"
      onChange={onSelectionChange}
      filter={(value, selected, item) =>
        //@ts-ignore
        item.id.toLowerCase().includes(value.toLowerCase().trim()) ||
        item.screenName.toLowerCase().includes(value.toLowerCase().trim())
      }
    />
  );
};

UnitSearch.displayName = "UnitSearch";
