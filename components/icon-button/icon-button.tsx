import { ActionIcon, Tooltip } from "@mantine/core";
import React, { MouseEventHandler } from "react";

export interface IconButtonProps {
  label: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: React.CSSProperties;
}

export const IconButton: React.FC<IconButtonProps> = ({
  label,
  children,
  className,
  onClick,
  style,
}) => (
  <>
    <Tooltip label={label}>
      <ActionIcon
        onClick={onClick}
        size="lg"
        variant="default"
        radius="md"
        className={className}
        style={style}
        aria-label={label?.toString()}
      >
        {children}
      </ActionIcon>
    </Tooltip>
  </>
);
