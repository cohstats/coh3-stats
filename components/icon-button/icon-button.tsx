import { ActionIcon, Sx, Tooltip } from "@mantine/core";
import React, { MouseEventHandler } from "react";

export interface IconButtonProps {
  label: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  sx?: Sx | (Sx | undefined)[];
}

export const IconButton: React.FC<IconButtonProps> = ({
  label,
  children,
  className,
  onClick,
  sx,
}) => (
  <>
    <Tooltip label={label}>
      <ActionIcon
        onClick={onClick}
        size="lg"
        variant="default"
        radius="md"
        className={className}
        sx={sx}
      >
        {children}
      </ActionIcon>
    </Tooltip>
  </>
);
