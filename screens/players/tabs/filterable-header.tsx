import { Button, Checkbox, Flex, Group, List, Popover, Space, Text } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import { FilterInformation } from "./recent-matches-tab/player-recent-matches-tab";

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
    <Popover position="bottom" withArrow withinPortal shadow="md">
      <Popover.Target>
        <Group justify="center" style={{ cursor: "pointer" }}>
          <Flex>
            <Text span inherit>
              {title}
            </Text>
            <IconFilter size={20} style={{ marginLeft: 5 }} />
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
        <Space h={"xs"} />
        <Group justify="left">
          <Button onClick={onReset} size="xs">
            Reset
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
};

export default FilterableHeader;
