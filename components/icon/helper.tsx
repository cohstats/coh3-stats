import { IconInfoCircle } from "@tabler/icons-react";
import React from "react";
import { FloatingPosition, Tooltip } from "@mantine/core";

const HelperIcon = ({
  text,
  width = 400,
  iconSize = 20,
  position = "top",
}: {
  text: string | React.ReactNode;
  width?: number;
  iconSize?: number;
  position?: FloatingPosition;
}) => {
  return (
    <Tooltip
      label={<div style={{ textAlign: "left" }}>{text}</div>}
      withArrow
      multiline
      w={width}
      position={position}
    >
      <IconInfoCircle size={iconSize} />
    </Tooltip>
  );
};

export default HelperIcon;
