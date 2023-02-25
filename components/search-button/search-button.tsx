import { Button, createStyles, Group, Text } from "@mantine/core";
import { IconSearch } from "@tabler/icons";
import React from "react";
import { openSpotlight } from "@mantine/spotlight";

interface SearchButtonProps {
  mobile?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const useStyles = createStyles((theme) => ({}));

export const SearchButton: React.FC<SearchButtonProps> = ({ mobile, onClick }) => {
  const { classes } = useStyles();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    openSpotlight();
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <>
      <Button variant="default" radius="md" onClick={handleClick}>
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
};
