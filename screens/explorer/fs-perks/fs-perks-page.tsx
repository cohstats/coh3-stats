import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Badge,
  Card,
  Container,
  Group,
  Image,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { TFunction } from "next-i18next/pages";
import { FactionSwitch } from "../../../components/faction-switch";
import { localizedNames } from "../../../src/coh3/coh3-data";
import type { raceType } from "../../../src/coh3/coh3-types";
import {
  findFsPerk,
  flattenFsPerks,
  getFsPerksRaceBackgroundUrl,
} from "../../../src/explorer/fs-perks/fs-perks-helpers";
import type { FsPerksRace } from "../../../src/explorer/fs-perks/fs-perks-types";
import { getExplorerFsPerksRoute } from "../../../src/routes";
import PerkDetail from "./perk-detail";
import PerkTierColumn from "./perk-tier-column";
import { PERK_ICON_SIZE } from "./perk-tile";
import classes from "./fs-perks.module.css";

/** Width of a tier column - the icon plus the frame around it. */
const COLUMN_WIDTH = PERK_ICON_SIZE + 16;

/** Size of the faction badge in the page header. */
const FACTION_BADGE_SIZE = 90;

/** Size of the faction icons of the switch. */
const FACTION_SWITCH_SIZE = 30;

/**
 * The Final Stand perk tree of a single faction - one column per tier from left to right, with the
 * perk icons only. The texts of a perk live in its hover card and in the pinned card below the tree.
 */
const FsPerksPage = ({
  race,
  availableRaces,
  t,
}: {
  race: FsPerksRace;
  availableRaces: raceType[];
  t: TFunction;
}) => {
  const router = useRouter();
  const [selectedPerkId, setSelectedPerkId] = useState<string | null>(null);

  // The page is statically generated, so the query is only known after hydration. Switching the
  // faction keeps this component mounted, so the selection has to be reset on a race change too.
  useEffect(() => {
    if (!router.isReady) return;

    const perkId = router.query.perk;
    setSelectedPerkId(typeof perkId === "string" && findFsPerk(race, perkId) ? perkId : null);
  }, [router.isReady, race.race]);

  const handleSelect = useCallback(
    (perkId: string) => {
      setSelectedPerkId(perkId);

      if (!router.isReady) return;

      router.replace(
        { pathname: router.pathname, query: { raceId: race.race, perk: perkId } },
        undefined,
        { shallow: true, scroll: false },
      );
    },
    [router, race.race],
  );

  // Nothing is ever "unselected" - the first perk of the first tier keeps the detail card filled.
  const selectedPerk =
    (selectedPerkId ? findFsPerk(race, selectedPerkId) : null) ?? flattenFsPerks(race)[0] ?? null;

  return (
    <Container size="lg" p={0}>
      <Stack gap="lg">
        {/* The switch sits in the top right corner and drops below the title once space runs out. */}
        <Group gap="md" align="flex-start" justify="space-between">
          <Group gap="md" wrap="nowrap" align="flex-start" style={{ minWidth: 0 }}>
            <Image
              src={getFsPerksRaceBackgroundUrl(race)}
              alt={race.name}
              w={FACTION_BADGE_SIZE}
              h={FACTION_BADGE_SIZE}
              fit="contain"
              style={{ flex: `0 0 ${FACTION_BADGE_SIZE}px` }}
            />

            <Stack gap={6} style={{ minWidth: 0 }}>
              <Title order={1} size="h2">
                {t("page.title", { faction: race.name })}
              </Title>
              <Text c="dimmed">{t("page.subtitle")}</Text>

              <Group gap={6}>
                <Badge variant="light" color="gray">
                  {t("summary.perks", { count: race.perkCount })}
                </Badge>
                <Tooltip label={t("summary.levelsTooltip")} multiline w={260} withArrow>
                  <Badge variant="light" color="blue">
                    {t("summary.levels", { count: race.levelCount })}
                  </Badge>
                </Tooltip>
                <Badge variant="light" color="gray">
                  {t("summary.tiers", { count: race.tiers.length })}
                </Badge>
              </Group>
            </Stack>
          </Group>

          <FactionSwitch
            races={availableRaces}
            activeRace={race.race}
            getHref={getExplorerFsPerksRoute}
            getTooltipLabel={(r) => t("faction.switchTooltip", { faction: localizedNames[r] })}
            iconSize={FACTION_SWITCH_SIZE}
            testIdPrefix="fs-perks-faction-"
          />
        </Group>

        {/* The tree keeps its column width on small screens and scrolls instead of collapsing. */}
        <ScrollArea type="auto" offsetScrollbars>
          <div
            className={classes.tierGrid}
            style={{
              gridTemplateColumns: `repeat(${race.tiers.length}, minmax(${COLUMN_WIDTH}px, 1fr))`,
              minWidth: race.tiers.length * COLUMN_WIDTH,
            }}
            data-testid="fs-perks-tree"
          >
            {race.tiers.map((tier) => (
              <PerkTierColumn
                key={tier.tier}
                tier={tier}
                selectedPerkId={selectedPerk?.id ?? null}
                onSelect={handleSelect}
                t={t}
              />
            ))}
          </div>
        </ScrollArea>

        {selectedPerk && (
          <Card
            withBorder
            radius="md"
            p="md"
            className={classes.detailCard}
            data-testid="fs-perks-detail"
          >
            <PerkDetail perk={selectedPerk} t={t} variant="panel" />
          </Card>
        )}
      </Stack>
    </Container>
  );
};

export default FsPerksPage;
