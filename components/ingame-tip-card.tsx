import Link from "next/link";
import {
  ActionIcon,
  Anchor,
  Group,
  MantineSpacing,
  Paper,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { IconArrowRight, IconBulb } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import { useState } from "react";
import { pickIngameTip } from "../src/explorer/ingame-tips/ingame-tips-helpers";
import type { IngameTip } from "../src/explorer/ingame-tips/ingame-tips-types";

/** The part of a tip the card renders - keeps the page props small. */
type IngameTipCardTip = Pick<IngameTip, "id" | "text"> & {
  /** Link to the tip in the "Game Tips" wiki, see `getWikiTipHref`. No link when missing. */
  href?: string | null;
};

type IngameTipCardProps = {
  tips: IngameTipCardTip[];
  /**
   * Picks the first tip shown. Must come from the page props (eg. generated in `getStaticProps`),
   * never from `Math.random()` / `Date.now()` during render - the server and the client have to
   * start from the same tip, otherwise React reports a hydration mismatch.
   */
  seed: number;
  /** Top margin of the card, `0` by default (the card usually sits in a Mantine `Stack`). */
  mt?: MantineSpacing | 0;
  /** Bottom margin of the card, `md` by default - room before the next section heading. */
  mb?: MantineSpacing | 0;
};

/**
 * Shows one of the loading screen tips of the game, with a button to cycle to the next one.
 * Renders nothing when there are no tips (eg. a data tag without the tips file).
 */
const IngameTipCard = ({ tips, seed, mt = 0, mb = "md" }: IngameTipCardProps) => {
  const { t } = useTranslation("common");
  // How many times the user clicked "next" - client only state, so it can't break hydration.
  const [offset, setOffset] = useState(0);

  const tip = pickIngameTip(tips, seed + offset);
  if (!tip) return null;

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      mt={mt}
      mb={mb}
      data-testid="ingame-tip-card"
      style={{ borderLeft: "4px solid var(--mantine-color-yellow-6)" }}
    >
      {/* Header row with the text under it, so it fits the narrow sidebar column */}
      <Group wrap="nowrap" align="center" gap="sm">
        <ThemeIcon variant="light" color="yellow" radius="xl" size={40} aria-hidden>
          <IconBulb size={24} stroke={1.75} />
        </ThemeIcon>
        <Text fw={700} size="lg" c="yellow.5" style={{ flex: 1 }}>
          {t("ingameTips.title")}
        </Text>
        {tips.length > 1 && (
          <Tooltip label={t("ingameTips.next")} withArrow>
            <ActionIcon
              variant="light"
              color="gray"
              size={40}
              radius="xl"
              aria-label={t("ingameTips.next")}
              onClick={() => setOffset((value) => value + 1)}
              data-testid="ingame-tip-next"
            >
              <IconArrowRight size={24} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      {/* Live region - announces the new tip while the focus stays on the Next button. */}
      <Text
        size="md"
        mt="sm"
        style={{ whiteSpace: "pre-line" }}
        aria-live="polite"
        aria-atomic="true"
        data-testid="ingame-tip-text"
      >
        {tip.text}
      </Text>
      {tip.href && (
        <Anchor
          component={Link}
          href={tip.href}
          size="sm"
          mt="xs"
          display="inline-block"
          data-testid="ingame-tip-wiki-link"
        >
          {t("ingameTips.seeAll")}
        </Anchor>
      )}
    </Paper>
  );
};

export default IngameTipCard;
export type { IngameTipCardProps, IngameTipCardTip };
