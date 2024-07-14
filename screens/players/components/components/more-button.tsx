import React from "react";
import { Button, Group, useMantineTheme } from "@mantine/core";
import { IconCirclePlus } from "@tabler/icons-react";

interface MyButtonProps {
  onClick: () => Promise<void>;
}

const MoreButton: React.FC<MyButtonProps> = ({ onClick }) => {
  const theme = useMantineTheme();
  const darkTheme = theme.colorScheme === "dark";

  return (
    <Button
      w={"65px"}
      variant={"default"}
      size={"compact-xs"}
      style={{
        fontWeight: "normal",
        color: darkTheme ? theme.colors.gray[3] : theme.colors.gray[8],
      }}
      onClick={onClick}
    >
      <Group gap={4}>
        <IconCirclePlus size={"13"} />
        More
      </Group>
    </Button>
  );
};

export default MoreButton;
