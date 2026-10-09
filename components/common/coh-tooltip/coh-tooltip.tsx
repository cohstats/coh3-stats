import React from "react";
import { Tooltip, TooltipProps } from "@mantine/core";
import classes from "./coh-tooltip.module.css";

export type CohTooltipProps = {
  label?: React.ReactNode;
  children: React.ReactNode;
  floating?: boolean;
  multiline?: boolean;
  withArrow?: boolean;
  withinPortal?: boolean;
  openDelay?: number;
  closeDelay?: number;
  w?: number | string;
  maw?: number | string;
  position?: TooltipProps["position"];
  className?: string;
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  disabled?: boolean;
};

export const CohTooltip = ({
  label,
  children,
  floating = false,
  multiline = true,
  withArrow = true,
  withinPortal = true,
  openDelay = 200,
  closeDelay,
  w = 450,
  maw = 500,
  position = "top",
  className,
  style,
  labelStyle,
  disabled = false,
}: CohTooltipProps) => {
  if (!label || disabled) {
    return <>{children}</>;
  }

  const renderedLabel =
    typeof label === "string" ? (
      <span
        style={{
          display: "block",
          whiteSpace: "pre-line",
          textAlign: "left",
          ...labelStyle,
        }}
      >
        {label}
      </span>
    ) : (
      label
    );

  const tooltipClass = [classes.tooltip, className].filter(Boolean).join(" ");

  if (floating) {
    return (
      <Tooltip.Floating
        label={renderedLabel}
        multiline={multiline}
        withinPortal={withinPortal}
        w={w}
        maw={maw}
        className={tooltipClass}
        style={{ whiteSpace: "pre-line", ...style }}
      >
        {children}
      </Tooltip.Floating>
    );
  }

  return (
    <Tooltip
      label={renderedLabel}
      multiline={multiline}
      withArrow={withArrow}
      withinPortal={withinPortal}
      openDelay={openDelay}
      closeDelay={closeDelay}
      w={w}
      maw={maw}
      position={position}
      classNames={{
        tooltip: tooltipClass,
        arrow: classes.arrow,
      }}
      style={{ whiteSpace: "pre-line", ...style }}
    >
      {children}
    </Tooltip>
  );
};

export default CohTooltip;
