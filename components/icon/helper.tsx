import { IconInfoCircle } from "@tabler/icons-react";
import React from "react";
import { FloatingPosition, Tooltip } from "@mantine/core";

const HelperIcon = ({
  text,
  width = 400,
  iconSize = 20,
  position = "top",
  iconStyle = {},
}: {
  text: string | React.ReactNode;
  width?: number;
  iconSize?: number;
  position?: FloatingPosition;
  iconStyle?: React.CSSProperties;
}) => {
  return (
    <Tooltip
      label={<div style={{ textAlign: "left" }}>{text}</div>}
      withArrow
      multiline
      w={width}
      position={position}
    >
      <IconInfoCircle size={iconSize} style={{ marginBottom: -4, ...iconStyle }} />
    </Tooltip>
  );
};

export default HelperIcon;
