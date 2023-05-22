import { IconInfoCircle } from "@tabler/icons-react";
import React from "react";
import { Tooltip } from "@mantine/core";

const HelperIcon = ({
  text,
  width = 400,
  iconSize = 20,
}: {
  text: string | React.ReactNode;
  width?: number;
  iconSize?: number;
}) => {
  return (
    <Tooltip
      label={<div style={{ textAlign: "left" }}>{text}</div>}
      withArrow
      multiline
      width={width}
    >
      <IconInfoCircle size={iconSize} />
    </Tooltip>
  );
};

export default HelperIcon;
