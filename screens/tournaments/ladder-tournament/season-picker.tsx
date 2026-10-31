import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ActionIcon, Button, Group, Select } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconListDetails } from "@tabler/icons-react";
import { useTranslation } from "next-i18next/pages";
import { getLadderTournamentRoute } from "../../../src/routes";
import type { LadderSeasonSummary } from "../../../src/tournaments/ladder-tournament";
import { getLadderSeasonTitle } from "../components/ladder-season";
import classes from "./ladder-tournament.module.css";

// Above this the select gets the search, so a long list of seasons stays usable
const SEARCHABLE_FROM = 10;

/**
 * Previous / next buttons around a select with all the seasons, plus the link to the overview
 * with all the seasons. Scales to any number of seasons.
 * With only one season there is nothing to switch to, so only the overview link is rendered.
 * @param seasons All the seasons sorted from the newest
 */
const SeasonPicker = ({
  seasonId,
  seasons,
}: {
  seasonId: number;
  seasons: LadderSeasonSummary[];
}) => {
  const { t } = useTranslation("tournaments");
  const router = useRouter();
  const seasonIds = seasons.map((season) => season.seasonId);

  const index = seasonIds.indexOf(seasonId);
  // Sorted from the newest - the previous (older) season is after the current one
  const previousSeasonId = index >= 0 ? seasonIds[index + 1] : undefined;
  const nextSeasonId = index > 0 ? seasonIds[index - 1] : undefined;

  const goToSeason = (id: number | undefined) => {
    if (id === undefined || id === seasonId) return;
    router.push(getLadderTournamentRoute(id));
  };

  return (
    <Group gap={6} wrap="wrap" justify="flex-end" data-testid="ladder-season-picker">
      {seasonIds.length > 1 && (
        <Group gap={6} wrap="nowrap" data-testid="ladder-season-switch">
          <ActionIcon
            variant="default"
            size="lg"
            aria-label={t("league.previousSeason")}
            disabled={previousSeasonId === undefined}
            onClick={() => goToSeason(previousSeasonId)}
            data-testid="ladder-season-previous"
          >
            <IconChevronLeft size={18} />
          </ActionIcon>
          <Select
            aria-label={t("league.seasonPicker")}
            className={classes.seasonSelect}
            data={seasons.map((season) => ({
              value: `${season.seasonId}`,
              label: getLadderSeasonTitle(t, season),
            }))}
            value={`${seasonId}`}
            onChange={(value) => value && goToSeason(Number(value))}
            allowDeselect={false}
            searchable={seasonIds.length > SEARCHABLE_FROM}
            checkIconPosition="right"
            data-testid="ladder-season-select"
          />
          <ActionIcon
            variant="default"
            size="lg"
            aria-label={t("league.nextSeason")}
            disabled={nextSeasonId === undefined}
            onClick={() => goToSeason(nextSeasonId)}
            data-testid="ladder-season-next"
          >
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>
      )}
      <Button
        component={Link}
        href={getLadderTournamentRoute()}
        variant="subtle"
        leftSection={<IconListDetails size={16} />}
        data-testid="ladder-all-seasons-link"
      >
        {t("league.allSeasons.title")}
      </Button>
    </Group>
  );
};

export default SeasonPicker;
