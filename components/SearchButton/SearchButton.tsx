import { Button, Group, Text } from "@mantine/core";
import { IconSearch } from "@tabler/icons";
import React from "react";

export const SearchButton: React.FC = () => (
  <>
    <Button variant="default" radius="md">
      <Text weight={300} color="dimmed">
        <Group spacing={8}>
          <IconSearch size={15} stroke={2} />
          <Text weight={300} color="dimmed" pr={25}>
            Search Players
          </Text>
        </Group>
      </Text>
    </Button>
  </>
);
