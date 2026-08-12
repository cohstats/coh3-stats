import React from "react";
import { HoverCard, Image, UnstyledButton } from "@mantine/core";
import { TFunction } from "next-i18next/pages";
import { iconPlaceholder } from "../../../components/placeholders";
import { getFsPerkIconUrl } from "../../../src/explorer/fs-perks/fs-perks-helpers";
import type { FsPerk } from "../../../src/explorer/fs-perks/fs-perks-types";
import PerkDetail from "./perk-detail";
import classes from "./fs-perks.module.css";

/** Side of a perk icon in the tree. */
const PERK_ICON_SIZE = 104;

/**
 * A single perk in the tree - just its (lit up) icon, everything else is in the hover card. Clicking
 * pins the perk in the detail card below the tree, which is also how touch devices get to the texts.
 */
const PerkTile = ({
  perk,
  selected,
  onSelect,
  t,
}: {
  perk: FsPerk;
  selected: boolean;
  onSelect: (perkId: string) => void;
  t: TFunction;
}) => (
  // The dropdown never grows past the viewport - a tap on a touch device opens it too, and 440px is
  // wider than a phone screen.
  <HoverCard
    width={440}
    shadow="md"
    position="right"
    openDelay={100}
    closeDelay={80}
    withArrow
    styles={{ dropdown: { maxWidth: "calc(100vw - var(--mantine-spacing-md) * 2)" } }}
  >
    <HoverCard.Target>
      <UnstyledButton
        onClick={() => onSelect(perk.id)}
        className={`${classes.perkTile} ${selected ? classes.perkTileSelected : ""}`}
        aria-label={perk.name}
        data-testid={`fs-perk-tile-${perk.id}`}
      >
        <Image
          src={getFsPerkIconUrl(perk, true)}
          alt={perk.name}
          w={PERK_ICON_SIZE}
          h={PERK_ICON_SIZE}
          fit="contain"
          className={classes.perkIcon}
          fallbackSrc={iconPlaceholder.src}
        />
      </UnstyledButton>
    </HoverCard.Target>

    <HoverCard.Dropdown>
      <PerkDetail perk={perk} t={t} />
    </HoverCard.Dropdown>
  </HoverCard>
);

export { PERK_ICON_SIZE };
export default PerkTile;
