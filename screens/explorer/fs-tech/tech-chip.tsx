import React from "react";
import { Image, Text, Tooltip } from "@mantine/core";
import { iconPlaceholder } from "../../../components/placeholders";
import { getFsTechIconUrl } from "../../../src/explorer/fs-technologies/fs-technologies-helpers";
import type { FsTechnology } from "../../../src/explorer/fs-technologies/fs-technologies-types";
import classes from "./fs-tech.module.css";

/** Side of the icon of a chip. */
const CHIP_ICON_SIZE = 22;

/**
 * A technology which an earlier pick already showed as a full card, repeated in a later pick as a
 * compact chip.
 *
 * The four passive picks draw from almost the same pool, so rendering every one of them in full
 * would repeat the same twenty cards four times. The chip keeps the pool of a pick complete and
 * carries the description in its tooltip.
 */
const TechChip = ({ technology }: { technology: FsTechnology }) => (
  <Tooltip
    label={technology.description ?? technology.typeLabel ?? technology.name}
    multiline
    w={300}
    withArrow
    openDelay={100}
  >
    <div className={classes.techChip} data-testid={`fs-tech-chip-${technology.id}`}>
      <Image
        src={getFsTechIconUrl(technology)}
        alt=""
        w={CHIP_ICON_SIZE}
        h={CHIP_ICON_SIZE}
        fit="contain"
        className={classes.techIcon}
        fallbackSrc={iconPlaceholder.src}
      />
      <Text size="xs" lh={1.2}>
        {technology.shortName ?? technology.name}
      </Text>
    </div>
  </Tooltip>
);

export { CHIP_ICON_SIZE };
export default TechChip;
