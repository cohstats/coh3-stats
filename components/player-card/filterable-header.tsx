import { Button, Checkbox, Flex, Group, List, Popover, Text } from "@mantine/core";
import { IconFilter } from "@tabler/icons";
import { FilterInformation } from "./player-recent-matches";

type FilterableHeaderProps = {
  title: string;
  options: { [key: string | number]: FilterInformation };
  onChange: (filter: string | number) => void;
  onReset: () => void;
};
const FilterableHeader = ({ options, title, onChange, onReset }: FilterableHeaderProps) => {
  function handleCheckboxChange(filter: string | number) {
    onChange(filter);
  }
  return (
    <Popover position="bottom" withArrow shadow="md">
      <Popover.Target>
        <Group position="center">
          <Flex>
            <Text>{title}</Text>
            <IconFilter cursor="pointer" />
          </Flex>
        </Group>
      </Popover.Target>
      <Popover.Dropdown>
        <List listStyleType="none" style={{ textAlign: "left" }}>
          {Object.entries(options).map(([filter, { checked, label }]) => {
            return (
              <List.Item key={label}>
                <Checkbox
                  label={label}
                  checked={checked}
                  styles={{ input: { cursor: "pointer" }, label: { cursor: "pointer" } }}
                  onChange={() => handleCheckboxChange(filter)}
                />
              </List.Item>
            );
          })}
        </List>
        <Group position="center">
          <Button onClick={onReset} size="xs">
            Reset
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
};

export default FilterableHeader;
