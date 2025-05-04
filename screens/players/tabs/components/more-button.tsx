import React from "react";
import { Button, Group } from "@mantine/core";
import { IconCirclePlus } from "@tabler/icons-react";

import classes from "../Players.module.css";

interface MyButtonProps {
  onClick: () => Promise<void> | void;
}

const MoreButton: React.FC<MyButtonProps> = ({ onClick }) => {
  return (
    <Button
      w={"65px"}
      variant={"default"}
      size={"compact-xs"}
      className={classes.moreButton}
      onClick={onClick}
    >
      <Group gap={4}>
        <IconCirclePlus size={"15"} style={{ marginBottom: -1 }} />
        More
      </Group>
    </Button>
  );
};

export default MoreButton;
