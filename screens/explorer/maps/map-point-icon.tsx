import React from "react";
import { Box, Image } from "@mantine/core";
import {
  getMpMapPointIconUrl,
  MpMapRenderedPointKind,
} from "../../../src/explorer/mp-maps-helpers";
import classes from "./map-point-icon.module.css";

/** Team colors of the player starts, matching the ones the game uses on its own minimap. */
const TEAM_COLORS = ["#2f7fd1", "#c93c37"];

/**
 * Icon of a map point kind, used on the minimap markers, in the legend and in the stats cards.
 *
 * Every point kind but the player starts uses the icon the game exports for it, drawn bare. Player
 * starts get a team coloured numbered circle, the way the in-game minimap draws them.
 */
const MapPointIcon = ({
  kind,
  size,
  /** Team of a `starting_position`, `null` on maps which have no sides to split the players into. */
  team = null,
  /** Number shown inside a `starting_position` circle. */
  position,
  alt = "",
}: {
  kind: MpMapRenderedPointKind;
  /**
   * Size of the icon in pixels. Leave it out to inherit `--point-icon-size` from a parent, which is
   * what the minimap markers do so that they can scale with the width of the map.
   */
  size?: number;
  team?: number | null;
  position?: number | null;
  alt?: string;
}) => {
  const sizeStyle = size === undefined ? undefined : { "--point-icon-size": `${size}px` };

  if (kind === "starting_position") {
    return (
      <Box
        className={classes.startCircle}
        style={{
          ...sizeStyle,
          backgroundColor: TEAM_COLORS[team ?? 0] ?? TEAM_COLORS[0],
        }}
      >
        {position}
      </Box>
    );
  }

  return (
    <Box className={classes.icon} style={sizeStyle}>
      <Image src={getMpMapPointIconUrl(kind)} alt={alt} className={classes.glyph} fit="contain" />
    </Box>
  );
};

export default MapPointIcon;
export { TEAM_COLORS };
