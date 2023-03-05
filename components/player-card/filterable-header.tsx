import { Button, Checkbox, Flex, List, Popover, Text } from "@mantine/core";
import { IconFilter } from "@tabler/icons";
import { maps, matchTypesAsObject, raceIDs } from "../../src/coh3/coh3-data";

type FilterableHeaderProps = {
  title: string;
  options: { label: string; checked: boolean; filter: string }[];
};
const FilterableHeader = ({ options, title }: FilterableHeaderProps) => {
  return (
    <Popover position="bottom" withArrow shadow="md">
      <Popover.Target>
        <Flex>
          <Text>{title}</Text>
          <IconFilter cursor="pointer" />
        </Flex>
      </Popover.Target>
      <Popover.Dropdown>
        <List listStyleType="none">
          {options.map(({ checked, label }) => {
            return (
              <List.Item key={label}>
                <Checkbox label={label} checked={checked} />
              </List.Item>
            );
          })}
        </List>
        <Flex gap={4}>
          <Button size="xs">Reset</Button>
          <Button size="xs">Apply</Button>
        </Flex>
      </Popover.Dropdown>
    </Popover>
  );
};

export default FilterableHeader;
